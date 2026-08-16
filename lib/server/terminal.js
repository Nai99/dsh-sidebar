// 终端内置实现:WebSocket + node-pty 会话,不依赖 dsh-termbar
// 路由:
//   WS   /dsh-sidebar/term-ws?cwd=&shell=&cols=&rows=  每个连接 = 一个 pty 会话
//        resize 走消息指令 \u0000RESIZE:cols:rows;其余消息写入 pty 输入
//   GET  /dsh-sidebar/xterm.js / xterm.css             本地 xterm 静态资源
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import os from 'node:os'

const require = createRequire(path.join(os.homedir(), '.dsh', 'profiles', 'web', 'package.json'))

// ws / node-pty 从 dsh 官方依赖里懒加载;缺失时连接收到错误消息而非插件崩溃
let _ws = null
let _pty = null
function wsModule() {
  if (!_ws) _ws = require('ws')
  return _ws
}
function ptyModule() {
  if (!_pty) _pty = require('node-pty')
  return _pty
}

const SHELLS = {
  bash: process.env.DSH_SIDEBAR_BASH || process.env.DSH_TERMBAR_BASH || 'D:/Git/usr/bin/bash.exe',
  pwsh: process.env.DSH_SIDEBAR_PWSH || process.env.DSH_TERMBAR_PWSH || 'pwsh.exe',
}

function resolveCwd(ctx, explicit) {
  if (explicit && typeof explicit === 'string' && explicit.length > 0 && explicit !== 'null' && explicit !== 'undefined') return explicit
  try {
    const list = ctx.sessions.list() || []
    for (const s of list) if (s && s.cwd && typeof s.cwd === 'string') return s.cwd
  } catch (e) { /* ignore */ }
  return os.homedir()
}

let xtermAssets = null
function getXtermAssets() {
  if (!xtermAssets) {
    xtermAssets = (async () => {
      const js = await readFile(new URL('../xterm/xterm.js', import.meta.url))
      const css = await readFile(new URL('../xterm/xterm.css', import.meta.url))
      return { js, css }
    })()
  }
  return xtermAssets
}

export function register(ctx, webServer) {
  // 静态资源始终注册;ws 不可用只影响 WebSocket 会话
  webServer.register({ kind: 'exact', path: '/dsh-sidebar/xterm.js', handler: async (req, res) => {
    try { const a = await getXtermAssets(); res.writeHead(200, { 'content-type': 'application/javascript; charset=utf-8', 'cache-control': 'public, max-age=86400' }); res.end(a.js) }
    catch (e) { res.writeHead(500); res.end(String(e && e.message ? e.message : e)) }
  } })
  webServer.register({ kind: 'exact', path: '/dsh-sidebar/xterm.css', handler: async (req, res) => {
    try { const a = await getXtermAssets(); res.writeHead(200, { 'content-type': 'text/css; charset=utf-8', 'cache-control': 'public, max-age=86400' }); res.end(a.css) }
    catch (e) { res.writeHead(500); res.end(String(e && e.message ? e.message : e)) }
  } })

  // 每个 WebSocket 连接 = 一个 node-pty 会话(与 dsh-termbar 同协议)
  let WebSocket = null
  try { WebSocket = wsModule() } catch (e) {
    console.error('dsh-sidebar: ws 模块不可用,终端会话不可用: ' + String(e && e.message ? e.message : e))
    return
  }
  const sessions = new Map() // ws -> { pty, cwd }
  const wss = new WebSocket.Server({ noServer: true })

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url || '/', 'http://x')
    // harness 的 WS 升级路由会剥离查询串里的 %5C,反斜杠路径会丢失分隔符(如 E:Githubdsh-sidebar);
    // 客户端已改为发送正斜杠;这里对损坏路径做兜底:回退到会话工作区
    let cwd = resolveCwd(ctx, url.searchParams.get('cwd')).replace(/\\/g, '/')
    if (!existsSync(cwd)) cwd = resolveCwd(ctx, null).replace(/\\/g, '/')
    const shellName = url.searchParams.get('shell') === 'pwsh' ? 'pwsh' : 'bash'
    const shellExe = SHELLS[shellName]
    const cols = Math.min(300, Math.max(20, parseInt(url.searchParams.get('cols') || '80', 10)))
    const rows = Math.min(100, Math.max(5, parseInt(url.searchParams.get('rows') || '24', 10)))
    let proc
    try {
      proc = ptyModule().spawn(shellExe, [], { name: 'xterm-256color', cols, rows, cwd, env: { ...process.env, TERM: 'xterm-256color' } })
    } catch (e) {
      const em = (e && typeof e.message === 'string') ? e.message : JSON.stringify(e && e.message ? e.message : e)
      console.error('[dsh-sidebar] pty spawn 失败 cwd=' + cwd + ' shell=' + shellExe, e)
      try { ws.send(JSON.stringify({ type: 'error', message: 'pty spawn 失败: ' + em + ' (cwd=' + cwd + ', shell=' + shellExe + ')' })) } catch (_) {}
      try { ws.close() } catch (_) {}
      return
    }
    sessions.set(ws, { pty: proc, cwd })
    proc.onData((data) => { try { ws.send(data) } catch (e) { /* closed */ } })
    proc.onExit(() => { try { ws.close() } catch (e) { /* closed */ } })
    ws.on('message', (buf) => {
      const s = sessions.get(ws)
      if (!s) return
      const text = buf.toString()
      if (text.startsWith('\u0000RESIZE:')) {
        const m = /^\u0000RESIZE:(\d+):(\d+)$/.exec(text)
        if (m) {
          try {
            s.pty.resize(Math.min(300, Math.max(20, parseInt(m[1], 10))), Math.min(100, Math.max(5, parseInt(m[2], 10))))
          } catch (e) { /* ignore */ }
        }
        return
      }
      try { s.pty.write(text) } catch (e) { /* ignore */ }
    })
    ws.on('close', () => {
      const s = sessions.get(ws)
      if (s) { try { s.pty.kill() } catch (e) { /* ignore */ } sessions.delete(ws) }
    })
    ws.on('error', () => {
      const s = sessions.get(ws)
      if (s) { try { s.pty.kill() } catch (e) { /* ignore */ } sessions.delete(ws) }
    })
  })

  if (webServer.registerUpgrade) {
    webServer.registerUpgrade({
      path: '/dsh-sidebar/term-ws',
      handler: (req, socket, head) => {
        wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req))
      },
    })
  } else {
    console.error('dsh-sidebar: webServer.registerUpgrade 不可用,终端 WebSocket 无法注册')
  }
}
