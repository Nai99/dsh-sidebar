// 静态资源:remixicon 图标字体 / VS Code 图标 / Monaco Editor(vs 目录前缀映射,防目录穿越)
import { readFile } from 'node:fs/promises'

let remixAssets = null
function getRemixAssets() {
  if (!remixAssets) {
    remixAssets = (async () => {
      const css = await readFile(new URL('../remixicon/remixicon.css', import.meta.url))
      const woff2 = await readFile(new URL('../remixicon/remixicon.woff2', import.meta.url))
      return { css, woff2 }
    })()
  }
  return remixAssets
}

export function register(ctx, webServer) {
  webServer.register({ kind: 'exact', path: '/dsh-sidebar/remixicon.css', handler: async (req, res) => {
    try { const a = await getRemixAssets(); res.writeHead(200, { 'content-type': 'text/css; charset=utf-8', 'cache-control': 'public, max-age=86400' }); res.end(a.css) }
    catch (e) { res.writeHead(500); res.end(String(e && e.message ? e.message : e)) }
  } })
  webServer.register({ kind: 'exact', path: '/dsh-sidebar/remixicon.woff2', handler: async (req, res) => {
    try { const a = await getRemixAssets(); res.writeHead(200, { 'content-type': 'font/woff2', 'cache-control': 'public, max-age=86400' }); res.end(a.woff2) }
    catch (e) { res.writeHead(500); res.end(String(e && e.message ? e.message : e)) }
  } })
  // VS Code 官方图标(静态资源)
  webServer.register({ kind: 'exact', path: '/dsh-sidebar/vscode.svg', handler: async (req, res) => {
    try {
      const buf = await readFile(new URL('../icons/vscode.svg', import.meta.url))
      res.writeHead(200, { 'content-type': 'image/svg+xml', 'cache-control': 'public, max-age=86400' })
      res.end(buf)
    } catch (e) { res.writeHead(404); res.end('not found') }
  } })
  // Monaco Editor 静态资源(prefix 路由,映射到 lib/monaco/vs,防目录穿越)
  webServer.register({ kind: 'prefix', path: '/dsh-sidebar/monaco', handler: async (req, res) => {
    try {
      const url = new URL(req.url || '/', 'http://x')
      const rel = decodeURIComponent(url.pathname.slice('/dsh-sidebar/monaco/'.length))
      if (!rel || rel.includes('..') || rel.includes(String.fromCharCode(92))) { res.writeHead(403); res.end('forbidden'); return }
      const target = new URL('../monaco/' + rel, import.meta.url)
      const ext = rel.split('.').pop()
      const types = { js: 'application/javascript', css: 'text/css', json: 'application/json', map: 'application/json', nls: 'application/javascript', ttf: 'font/ttf', woff: 'font/woff', woff2: 'font/woff2', svg: 'image/svg+xml', png: 'image/png' }
      const buf = await readFile(target)
      res.writeHead(200, { 'content-type': types[ext] || 'application/octet-stream', 'cache-control': 'public, max-age=86400' })
      res.end(buf)
    } catch (e) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
      res.end('not found')
    }
  } })
}
