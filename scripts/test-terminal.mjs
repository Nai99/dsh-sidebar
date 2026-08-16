// 终端端到端测试:真实 HTTP 服务器 + WebSocket 升级 + node-pty 会话
// 验证 /dsh-sidebar/term-ws 协议(输出透传 / 输入写入 / RESIZE 指令 / 关闭清理)
// 依赖 dsh profile 提供 ws 与 node-pty;缺失时跳过并提示
// 用法:node scripts/test-terminal.mjs
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { register as registerTerminal } from '../lib/server/terminal.js'

const require = createRequire(path.join(process.env.HOME || process.env.USERPROFILE || '', '.dsh', 'profiles', 'web', 'package.json'))
let WebSocket = null
try { WebSocket = require('ws') } catch (e) { /* missing */ }

const ok = (cond, msg) => { console.log((cond ? 'ok  ' : 'FAIL') + ' ' + msg); if (!cond) process.exitCode = 1 }

// ---- xterm UMD 全局行为:页面加载过 monaco(存在 define.amd)时会吞掉全局挂载 ----
{
  const vm = await import('node:vm')
  const xtermSrc = readFileSync(new URL('../lib/xterm/xterm.js', import.meta.url), 'utf8')
  const wA = {}
  vm.createContext(Object.assign(wA, { self: wA, console }))
  vm.runInContext(xtermSrc, wA)
  ok(typeof wA.Terminal === 'function', '无 define.amd 时 xterm 挂载 window.Terminal')
  const wB = {}
  vm.createContext(Object.assign(wB, { self: wB, console, define: Object.assign(function () {}, { amd: {} }) }))
  vm.runInContext(xtermSrc, wB)
  ok(typeof wB.Terminal === 'undefined', '有 define.amd 时被 AMD 接管(故客户端加载 xterm 前需移除 define)')
}

if (!WebSocket) {
  console.log('SKIP: dsh profile 无 ws 依赖,跳过终端端到端测试')
} else {
  const routes = []
  const upgradeHandler = []
  const webServer = {
    register: (r) => routes.push(r),
    registerUpgrade: (r) => upgradeHandler.push(r),
  }
  registerTerminal({ webServer, sessions: { list: () => [] } }, webServer)

  ok(routes.some((r) => r.path === '/dsh-sidebar/xterm.js'), 'xterm.js 路由注册')
  ok(routes.some((r) => r.path === '/dsh-sidebar/xterm.css'), 'xterm.css 路由注册')
  ok(upgradeHandler.some((r) => r.path === '/dsh-sidebar/term-ws'), 'term-ws 升级路由注册')

  // 真实 HTTP 服务器 + 升级
  const server = createServer((req, res) => { res.writeHead(404); res.end() })
  server.on('upgrade', (req, socket, head) => {
    const h = upgradeHandler.find((r) => req.url.startsWith(r.path))
    if (h) h.handler(req, socket, head)
    else socket.destroy()
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const port = server.address().port

  const wsDir = mkdtempSync(path.join(tmpdir(), 'dsh-sb-term-'))
  writeFileSync(path.join(wsDir, 'probe.txt'), 'x')
  // 用反斜杠 cwd(客户端真实格式),回归: node-pty ConPTY 对反斜杠 cwd 报 error 267
  const backslashCwd = wsDir.replace(/\//g, '\\')

  const client = new WebSocket('ws://127.0.0.1:' + port + '/dsh-sidebar/term-ws?cwd=' + encodeURIComponent(backslashCwd) + '&shell=bash')
  const outputs = []
  let sent = false
  let gotEcho = false
  let gotSpawnError = false

  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('终端连接/输出超时,已收到: ' + JSON.stringify(outputs.join('').slice(0, 200)))), 20000)
    client.on('message', (data) => {
      const text = data.toString()
      outputs.push(text)
      if (text.includes('pty spawn 失败')) gotSpawnError = true
      const all = outputs.join('')
      // 收到足够输出(提示符)后发送探测命令
      if (!sent && all.length > 10) {
        sent = true
        client.send('echo DSH_TERM_PROBE\r')
      }
      // 探测串出现两次 = 输入回显一次 + 命令输出一次
      if (sent && (all.match(/DSH_TERM_PROBE/g) || []).length >= 2) {
        gotEcho = true
        // RESIZE 指令不应导致连接中断
        client.send('\u0000RESIZE:100:30')
        client.send('exit\r')
        setTimeout(() => { clearTimeout(timer); resolve() }, 800)
      }
    })
    client.on('error', (e) => { clearTimeout(timer); reject(e) })
    client.on('close', () => { clearTimeout(timer); resolve() })
  })

  ok(!gotSpawnError, 'pty 会话启动无错误消息')
  ok(outputs.join('').length > 10, 'pty 会话输出内容(提示符)')
  ok(gotEcho, '输入写入 pty 并回显(echo 输出)')
  client.close()
  await new Promise((r) => setTimeout(r, 500))

  server.close()
  rmSync(wsDir, { recursive: true, force: true })
  console.log(process.exitCode ? 'TERMINAL TEST FAILED' : 'TERMINAL TEST PASSED')
  // node-pty 的 ConPTY 控制台代理在非控制台进程退出时有 AttachConsole 报错,跳过其清理钩子
  process.exit(process.exitCode || 0)
}
