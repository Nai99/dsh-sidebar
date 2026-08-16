// 文件 CRUD:列目录 / 读文件 / 原始字节 / 保存 / 删除 / 重命名 / 粘贴(复制·剪切)
import { readdir, readFile, writeFile, stat, open, rm, rename, cp } from 'node:fs/promises'
import path from 'node:path'
import { resolveCwd, inside, looksBinary, IMG_MIME, json, readBody, queryOf } from './util.js'

const MAX_READ = 1024 * 1024 // 1MB

export function register(ctx, webServer) {
  webServer.register({ kind: 'exact', path: '/dsh-sidebar/list', handler: async (req, res) => {
    try {
      const q = queryOf(req)
      const cwd = resolveCwd(ctx, q.cwd)
      const target = q.path || cwd
      if (!inside(cwd, target)) { json(res, { ok: false, message: '路径超出工作区范围' }); return }
      const st = await stat(target)
      if (!st.isDirectory()) { json(res, { ok: false, message: '不是目录' }); return }
      const entries = await readdir(target, { withFileTypes: true })
      const out = []
      for (const e of entries) {
        if (e.name.startsWith('.') && e.name !== '.git') continue // 隐藏文件跳过(保留 .git 目录显示)
        const full = path.join(target, e.name)
        let size = 0, mtime = 0
        if (e.isFile()) {
          try { const s = await stat(full); size = s.size; mtime = s.mtimeMs } catch (_) {}
        }
        out.push({ name: e.name, dir: e.isDirectory(), size, mtime })
      }
      out.sort((a, b) => (b.dir - a.dir) || a.name.localeCompare(b.name))
      json(res, { ok: true, cwd, path: target, entries: out })
    } catch (e) { json(res, { ok: false, message: String(e && e.message ? e.message : e) }) }
  } })
  webServer.register({ kind: 'exact', path: '/dsh-sidebar/read', handler: async (req, res) => {
    try {
      const q = queryOf(req)
      const cwd = resolveCwd(ctx, q.cwd)
      const target = q.path
      if (!target || !inside(cwd, target)) { json(res, { ok: false, message: '路径超出工作区范围' }); return }
      const st = await stat(target)
      if (!st.isFile()) { json(res, { ok: false, message: '不是文件' }); return }
      const fh = await open(target, 'r')
      const head = Buffer.alloc(8192)
      const { bytesRead } = await fh.read(head, 0, 8192, 0)
      await fh.close()
      const headBuf = head.subarray(0, bytesRead)
      const ext = String(target).split('.').pop().toLowerCase()
      if (IMG_MIME[ext] && looksBinary(headBuf)) {
        json(res, { ok: true, binary: 'image', mime: IMG_MIME[ext], size: st.size })
        return
      }
      if (looksBinary(headBuf)) {
        json(res, { ok: true, binary: true, size: st.size })
        return
      }
      if (st.size > MAX_READ) {
        const buf = await readFile(target)
        json(res, { ok: true, content: buf.slice(0, MAX_READ).toString('utf8'), truncated: true, size: st.size })
        return
      }
      const content = await readFile(target, 'utf8')
      json(res, { ok: true, content, truncated: false, size: st.size })
    } catch (e) { json(res, { ok: false, message: String(e && e.message ? e.message : e) }) }
  } })
  // 原始字节流(图片预览等)
  webServer.register({ kind: 'exact', path: '/dsh-sidebar/raw', handler: async (req, res) => {
    try {
      const q = queryOf(req)
      const cwd = resolveCwd(ctx, q.cwd)
      const target = q.path
      if (!target || !inside(cwd, target)) { res.writeHead(403); res.end('forbidden'); return }
      const st = await stat(target)
      if (!st.isFile()) { res.writeHead(404); res.end('not found'); return }
      const buf = await readFile(target)
      const ext = String(target).split('.').pop().toLowerCase()
      res.writeHead(200, { 'content-type': IMG_MIME[ext] || 'application/octet-stream', 'cache-control': 'public, max-age=300' })
      res.end(buf)
    } catch (e) { res.writeHead(404); res.end('not found') }
  } })
  webServer.register({ kind: 'exact', path: '/dsh-sidebar/write', handler: async (req, res) => {
    try {
      const body = await readBody(req)
      const cwd = resolveCwd(ctx, body.cwd)
      const target = body.path
      if (!target || !inside(cwd, target)) { json(res, { ok: false, message: '路径超出工作区范围' }); return }
      await writeFile(target, String(body.content ?? ''), 'utf8')
      json(res, { ok: true })
    } catch (e) { json(res, { ok: false, message: String(e && e.message ? e.message : e) }) }
  } })
  // 删除文件/目录(右键菜单)
  webServer.register({ kind: 'exact', path: '/dsh-sidebar/delete', handler: async (req, res) => {
    try {
      const body = await readBody(req)
      const cwd = resolveCwd(ctx, body.cwd)
      const target = body.path
      if (!target || !inside(cwd, target) || target === cwd) { json(res, { ok: false, message: '路径超出工作区范围' }); return }
      await rm(target, { recursive: true, force: true })
      json(res, { ok: true })
    } catch (e) { json(res, { ok: false, message: String(e && e.message ? e.message : e) }) }
  } })
  // 重命名(右键菜单)
  webServer.register({ kind: 'exact', path: '/dsh-sidebar/rename', handler: async (req, res) => {
    try {
      const body = await readBody(req)
      const cwd = resolveCwd(ctx, body.cwd)
      const target = body.path
      const name = String(body.name || '').trim()
      if (!target || !inside(cwd, target) || target === cwd) { json(res, { ok: false, message: '路径超出工作区范围' }); return }
      if (!name || /[\\/:*?"<>|]/.test(name)) { json(res, { ok: false, message: '名称不合法' }); return }
      const dest = path.join(path.dirname(target), name)
      if (dest === target) { json(res, { ok: true, path: dest }); return }
      await rename(target, dest)
      json(res, { ok: true, path: dest })
    } catch (e) { json(res, { ok: false, message: String(e && e.message ? e.message : e) }) }
  } })
  // 复制/剪切后粘贴(右键菜单;目标已存在时自动追加序号)
  webServer.register({ kind: 'exact', path: '/dsh-sidebar/paste', handler: async (req, res) => {
    try {
      const body = await readBody(req)
      const cwd = resolveCwd(ctx, body.cwd)
      const src = body.src
      const dest = body.dest
      if (!src || !dest || !inside(cwd, src) || !inside(cwd, dest)) { json(res, { ok: false, message: '路径超出工作区范围' }); return }
      const st = await stat(src)
      const name = path.basename(src)
      let out = path.join(dest, name)
      let n = 1
      for (;;) {
        try { await stat(out); n++; out = path.join(dest, name.replace(/(\.[^.]+)?$/, ' (' + n + ')$1')) } catch (e) { break }
      }
      if (st.isDirectory()) await cp(src, out, { recursive: true })
      else await cp(src, out)
      if (body.op === 'cut') await rm(src, { recursive: true, force: true })
      json(res, { ok: true, path: out })
    } catch (e) { json(res, { ok: false, message: String(e && e.message ? e.message : e) }) }
  } })
}
