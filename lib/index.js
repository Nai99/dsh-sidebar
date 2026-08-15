// dsh-sidebar host —— 右侧文件工作台(文件树 + 文本编辑器)
// 路由:
//   GET  /dsh-sidebar/list?cwd=&path=   -> 目录条目列表(path 须在 cwd 内)
//   GET  /dsh-sidebar/read?cwd=&path=   -> 文本文件内容(>1MB 截断标记)
//   POST /dsh-sidebar/write             -> { cwd, path, content } 保存
import { readdir, readFile, writeFile, stat } from 'node:fs/promises'
import path from 'node:path'

export const inject = ['webServer', 'sessions']

const MAX_READ = 1024 * 1024 // 1MB

function resolveCwd(ctx, explicit) {
  if (explicit && typeof explicit === 'string' && explicit.length > 0 && explicit !== 'null') return explicit
  try {
    const list = ctx.sessions.list() || []
    for (const s of list) if (s && s.cwd && typeof s.cwd === 'string' && s.cwd.length > 0) return s.cwd
  } catch (e) { /* ignore */ }
  return process.cwd()
}

// 确保 target 在 base 目录内
function inside(base, target) {
  const rel = path.relative(base, target)
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel))
}

// 二进制嗅探:前 8KB 含 NUL 或大量不可打印字符即视为二进制
function looksBinary(buf) {
  const n = Math.min(buf.length, 8000)
  let bad = 0
  for (let i = 0; i < n; i++) {
    const b = buf[i]
    if (b === 0) return true
    if (b < 9 || (b > 13 && b < 32)) bad++
  }
  return bad > n * 0.1
}
const IMG_MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', bmp: 'image/bmp', ico: 'image/x-icon', avif: 'image/avif' }

let remixAssets = null
function getRemixAssets() {
  if (!remixAssets) {
    remixAssets = (async () => {
      const { readFile } = await import('node:fs/promises')
      const css = await readFile(new URL('./remixicon/remixicon.css', import.meta.url))
      const woff2 = await readFile(new URL('./remixicon/remixicon.woff2', import.meta.url))
      return { css, woff2 }
    })()
  }
  return remixAssets
}

export function apply(ctx) {
  const webServer = ctx.webServer
  if (!webServer) return
  const json = (res, data) => { res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify(data)) }
  const readBody = (req) => new Promise((resolve) => {
    let data = ''
    req.on('data', c => { data += c; if (data.length > 2e6) req.destroy() })
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')) } catch (e) { resolve({}) } })
    req.on('error', () => resolve({}))
  })
  const queryOf = (req) => {
    const q = req.url.indexOf('?') >= 0 ? req.url.slice(req.url.indexOf('?') + 1) : ''
    const p = {}
    for (const pair of q.split('&')) { if (!pair) continue; const i = pair.indexOf('='); p[decodeURIComponent(i >= 0 ? pair.slice(0, i) : pair)] = decodeURIComponent(i >= 0 ? pair.slice(i + 1) : '') }
    return p
  }

  try {
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
        const buf = await readFile(new URL('./icons/vscode.svg', import.meta.url))
        res.writeHead(200, { 'content-type': 'image/svg+xml', 'cache-control': 'public, max-age=86400' })
        res.end(buf)
      } catch (e) { res.writeHead(404); res.end('not found') }
    } })
    // Monaco Editor 静态资源(prefix 路由,映射到 lib/monaco/vs,防目录穿越)
    webServer.register({ kind: 'prefix', path: '/dsh-sidebar/monaco', handler: async (req, res) => {
      try {
        const { readFile } = await import('node:fs/promises')
        const url = new URL(req.url || '/', 'http://x')
        const rel = decodeURIComponent(url.pathname.slice('/dsh-sidebar/monaco/'.length))
        if (!rel || rel.includes('..') || rel.includes(String.fromCharCode(92))) { res.writeHead(403); res.end('forbidden'); return }
        const target = new URL('./monaco/' + rel, import.meta.url)
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
        const { open } = await import('node:fs/promises')
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
    // 在工作区内搜索(文件名 + 文本内容),最多 100 条,深 6 层
    webServer.register({ kind: 'exact', path: '/dsh-sidebar/search', handler: async (req, res) => {
      try {
        const q = queryOf(req)
        const cwd = resolveCwd(ctx, q.cwd)
        const needle = String(q.q || '').slice(0, 100)
        if (!needle) { json(res, { ok: true, results: [] }); return }
        const mc = q.mc === '1', ww = q.ww === '1', rx = q.rx === '1'
        const esc = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        function matchRe() {
          try {
            if (rx) return new RegExp(needle, mc ? 'g' : 'gi')
            return new RegExp((ww ? '\\b' : '') + esc + (ww ? '\\b' : ''), mc ? 'g' : 'gi')
          } catch (e) { return null }
        }
        function testMatch(hay) {
          const re = matchRe()
          if (!re) return false
          re.lastIndex = 0
          return re.test(hay)
        }
        const incList = String(q.inc || '').split(',').map(s => s.trim()).filter(Boolean)
        const excList = String(q.exc || '').split(',').map(s => s.trim()).filter(Boolean)
        function globRe(pattern) {
          const p = pattern.toLowerCase()
          if (!p.includes('*') && !p.includes('?')) return null
          let src = ''
          for (const ch of p) {
            if (ch === '*') src += '.*'
            else if (ch === '?') src += '.'
            else src += ch.replace(/[.+^${}()|[\]\\]/g, '\\$&')
          }
          return new RegExp('^' + src + '$')
        }
        function passFilters(rel, name) {
          const rp = rel.toLowerCase(), nm = name.toLowerCase()
          for (const pat of excList) {
            const re = globRe(pat)
            if (re ? (re.test(rp) || re.test(nm)) : (rp.includes(pat) || nm.includes(pat))) return false
          }
          if (!incList.length) return true
          for (const pat of incList) {
            const re = globRe(pat)
            if (re ? (re.test(rp) || re.test(nm)) : (rp.includes(pat) || nm.includes(pat))) return true
          }
          return false
        }
        const SKIP = new Set(['.git', 'node_modules', '.venv', 'venv', '__pycache__', 'dist', 'build', '.next', '.cache', 'target', 'vendor', '.idea', '.vscode'])
        const results = []
        async function walk(dir, depth, rel) {
          if (depth > 6) return
          let ents
          try { ents = await readdir(dir, { withFileTypes: true }) } catch (e) { return }
          for (const e of ents) {
            
            if (SKIP.has(e.name) || e.name.startsWith('.')) continue
            const full = path.join(dir, e.name)
            const rel2 = rel ? rel + '/' + e.name : e.name
            if (e.isDirectory()) await walk(full, depth + 1, rel2)
            else if (e.isFile() && passFilters(rel2, e.name) && testMatch(e.name)) {
              results.push({ path: full, name: e.name, kind: 'name' })
            } else if (e.isFile() && passFilters(rel2, e.name)) {
              try {
                const st = await stat(full)
                if (st.size > 262144) continue
                const buf = await readFile(full, 'utf8')
                const re = matchRe()
                if (!re) continue
                re.lastIndex = 0
                let mm
                while ((mm = re.exec(buf)) !== null) {
                  const lineStart = buf.lastIndexOf('\n', mm.index) + 1
                  const lineEnd = buf.indexOf('\n', mm.index)
                  const lineNo = buf.slice(0, lineStart).split('\n').length
                  results.push({ path: full, name: e.name, kind: 'content', line: lineNo, snippet: buf.slice(lineStart, lineEnd < 0 ? undefined : lineEnd).trim().slice(0, 120) })
                  if (mm[0].length === 0) re.lastIndex++
                }
              } catch (e) { /* 二进制或不可读,跳过 */ }
            }
          }
        }
        await walk(cwd, 0, '')
        json(res, { ok: true, results })
      } catch (e) { json(res, { ok: false, message: String(e && e.message ? e.message : e) }) }
    } })
    // 批量替换(与搜索同款规则,替换全部匹配)
    webServer.register({ kind: 'exact', path: '/dsh-sidebar/replace', handler: async (req, res) => {
      try {
        const body = await readBody(req)
        const cwd = resolveCwd(ctx, body.cwd)
        const needle = String(body.q || '').slice(0, 100)
        const repl = String(body.repl === undefined ? '' : body.repl)
        if (!needle) { json(res, { ok: false, message: '缺少搜索词' }); return }
        const mc = body.mc === true, ww = body.ww === true, rx = body.rx === true, pc = body.pc === true
        const incList = String(body.inc || '').split(',').map(s => s.trim()).filter(Boolean)
        const excList = String(body.exc || '').split(',').map(s => s.trim()).filter(Boolean)
        let re
        try {
          if (rx) re = new RegExp(needle, mc ? 'g' : 'gi')
          else {
            const esc = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            re = new RegExp((ww ? '\\b' : '') + esc + (ww ? '\\b' : ''), mc ? 'g' : 'gi')
          }
        } catch (e) { json(res, { ok: false, message: '无效的正则: ' + String(e.message || e) }); return }
        const SKIP = new Set(['.git', 'node_modules', '.venv', 'venv', '__pycache__', 'dist', 'build', '.next', '.cache', 'target', 'vendor', '.idea', '.vscode'])
        function globRe(pattern) {
          const p = pattern.toLowerCase()
          if (!p.includes('*') && !p.includes('?')) return null
          let src = ''
          for (const ch of p) {
            if (ch === '*') src += '.*'
            else if (ch === '?') src += '.'
            else src += ch.replace(/[.+^${}()|[\]\\]/g, '\\$&')
          }
          return new RegExp('^' + src + '$')
        }
        function passFilters(rel, name) {
          const rp = rel.toLowerCase(), nm = name.toLowerCase()
          for (const pat of excList) {
            const g = globRe(pat)
            if (g ? (g.test(rp) || g.test(nm)) : (rp.includes(pat) || nm.includes(pat))) return false
          }
          if (!incList.length) return true
          for (const pat of incList) {
            const g = globRe(pat)
            if (g ? (g.test(rp) || g.test(nm)) : (rp.includes(pat) || nm.includes(pat))) return true
          }
          return false
        }
        let files = 0, count = 0
        const applyRepl = (hit) => {
          if (!pc) return repl
          if (hit && hit === hit.toUpperCase() && hit.toLowerCase() !== hit) return repl.toUpperCase()
          if (hit && hit.charAt(0) === hit.charAt(0).toUpperCase() && hit.charAt(0) !== hit.charAt(0).toLowerCase()) return repl.charAt(0).toUpperCase() + repl.slice(1)
          return repl
        }
        // 单文件替换(搜索分组悬停按钮;body.line 存在时只替换该行上的匹配)
        if (body.path && typeof body.path === 'string') {
          if (!inside(cwd, body.path)) { json(res, { ok: false, message: '路径超出工作区范围' }); return }
          try {
            const st = await stat(body.path)
            if (st.isFile() && st.size <= 262144) {
              const buf = await readFile(body.path, 'utf8')
              re.lastIndex = 0
              const m = buf.match(re)
              if (m) {
                let out
                if (body.line) {
                  const lineNo = Number(body.line)
                  let out2 = ''
                  let lastIdx = 0
                  let cnt = 0
                  re.lastIndex = 0
                  let mm
                  while ((mm = re.exec(buf)) !== null) {
                    const ln = buf.slice(0, mm.index).split('\n').length
                    out2 += buf.slice(lastIdx, mm.index)
                    if (ln === lineNo) { out2 += applyRepl(mm[0]); cnt++ } else out2 += mm[0]
                    lastIdx = mm.index + mm[0].length
                    if (mm[0].length === 0) re.lastIndex++
                  }
                  out = out2 + buf.slice(lastIdx)
                  count = cnt
                } else {
                  out = buf.replace(re, applyRepl)
                  count = m.length
                }
                if (out !== buf) { await writeFile(body.path, out); files = 1 }
              }
            }
          } catch (e) { /* 跳过 */ }
          json(res, { ok: true, files, count })
          return
        }
        async function walk(dir, rel) {
          let ents
          try { ents = await readdir(dir, { withFileTypes: true }) } catch (e) { return }
          for (const e of ents) {
            if (SKIP.has(e.name) || e.name.startsWith('.')) continue
            const full = path.join(dir, e.name)
            const rel2 = rel ? rel + '/' + e.name : e.name
            if (e.isDirectory()) await walk(full, rel2)
            else if (e.isFile() && passFilters(rel2, e.name)) {
              try {
                const st = await stat(full)
                if (st.size > 262144) continue
                const buf = await readFile(full, 'utf8')
                re.lastIndex = 0
                const m = buf.match(re)
                if (!m) continue
                const out = buf.replace(re, applyRepl)
                if (out === buf) continue
                await writeFile(full, out)
                files++; count += m.length
              } catch (e) { /* 跳过 */ }
            }
          }
        }
        await walk(cwd, '')
        json(res, { ok: true, files, count })
      } catch (e) { json(res, { ok: false, message: String(e && e.message ? e.message : e) }) }
    } })
    // 删除文件/目录(右键菜单)
    webServer.register({ kind: 'exact', path: '/dsh-sidebar/delete', handler: async (req, res) => {
      try {
        const body = await readBody(req)
        const cwd = resolveCwd(ctx, body.cwd)
        const target = body.path
        if (!target || !inside(cwd, target) || target === cwd) { json(res, { ok: false, message: '路径超出工作区范围' }); return }
        const { rm } = await import('node:fs/promises')
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
        const { rename } = await import('node:fs/promises')
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
        const { cp, rm, stat: stat2 } = await import('node:fs/promises')
        const st = await stat2(src)
        const name = path.basename(src)
        let out = path.join(dest, name)
        let n = 1
        for (;;) {
          try { await stat2(out); n++; out = path.join(dest, name.replace(/(\.[^.]+)?$/, ' (' + n + ')$1')) } catch (e) { break }
        }
        if (st.isDirectory()) await cp(src, out, { recursive: true })
        else await cp(src, out)
        if (body.op === 'cut') await rm(src, { recursive: true, force: true })
        json(res, { ok: true, path: out })
      } catch (e) { json(res, { ok: false, message: String(e && e.message ? e.message : e) }) }
    } })
    // Git 每个文件/总计增删统计(git diff --numstat,含暂存与未暂存)
    webServer.register({ kind: 'exact', path: '/dsh-sidebar/git-diff', handler: async (req, res) => {
      try {
        const q = queryOf(req)
        const cwd = resolveCwd(ctx, q.cwd)
        const { execFile } = await import('node:child_process')
        function run(args) {
          return new Promise((resolve) => {
            execFile('git', ['-C', cwd].concat(args), { windowsHide: true, maxBuffer: 16 * 1024 * 1024 }, (err, stdout) => {
              resolve(err ? '' : String(stdout || ''))
            })
          })
        }
        const [unstaged, staged] = await Promise.all([
          run(['diff', '--numstat']),
          run(['diff', '--cached', '--numstat'])
        ])
        const files = {}
        let totalAdd = 0, totalDel = 0
        function parse(out) {
          for (const line of out.split('\n')) {
            const m = /^(\d+|-)\s+(\d+|-)\s+(.+)$/.exec(line)
            if (!m) continue
            const a = m[1] === '-' ? 0 : parseInt(m[1], 10)
            const d = m[2] === '-' ? 0 : parseInt(m[2], 10)
            const p = m[3].trim()
            const f = files[p] || (files[p] = { added: 0, deleted: 0 })
            f.added += a
            f.deleted += d
            totalAdd += a
            totalDel += d
          }
        }
        parse(staged)
        parse(unstaged)
        json(res, { ok: true, files, totalAdd, totalDel })
      } catch (e) { json(res, { ok: false, message: String(e && e.message ? e.message : e) }) }
    } })
    // 在 Windows 资源管理器中显示(文件 /select,目录直接打开)
    webServer.register({ kind: 'exact', path: '/dsh-sidebar/reveal', handler: async (req, res) => {
      try {
        const body = await readBody(req)
        const cwd = resolveCwd(ctx, body.cwd)
        const target = body.path || cwd
        if (!inside(cwd, target)) { json(res, { ok: false, message: '路径超出工作区范围' }); return }
        const { exec } = await import('node:child_process')
        const winPath = String(target).replace(/\//g, '\\').replace(/"/g, '\\"')
        exec('explorer.exe ' + (body.select ? '/select,"' + winPath + '"' : '"' + winPath + '"'), { windowsHide: true }, (err, so, se) => {
          // explorer.exe 即使成功也常返回非零退出码;仅当 stderr 有实质内容才视为失败
          if (se && String(se).trim()) json(res, { ok: false, message: String(se).trim() })
          else json(res, { ok: true })
        })
      } catch (e) { json(res, { ok: false, message: String(e && e.message ? e.message : e) }) }
    } })
    // 在 VS Code 中打开(文件或目录)
    webServer.register({ kind: 'exact', path: '/dsh-sidebar/open-vscode', handler: async (req, res) => {
      try {
        const body = await readBody(req)
        const cwd = resolveCwd(ctx, body.cwd)
        const target = body.path || cwd
        if (!inside(cwd, target)) { json(res, { ok: false, message: '路径超出工作区范围' }); return }
        const { exec } = await import('node:child_process')
        exec('code "' + String(target).replace(/"/g, '\"') + '"', { windowsHide: true }, (err) => {
          if (err) json(res, { ok: false, message: 'code 命令不可用,请确认已安装 VS Code 并勾选"添加到 PATH": ' + String(err.message || err) })
          else json(res, { ok: true })
        })
      } catch (e) { json(res, { ok: false, message: String(e && e.message ? e.message : e) }) }
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
  } catch (e) {
    console.error('dsh-sidebar registration failed: ' + String(e && e.message ? e.message : e))
  }
}
