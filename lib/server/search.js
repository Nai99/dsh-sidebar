// 全文搜索与批量替换:同款匹配规则(区分大小写 / 全词 / 正则 / 包含 / 排除),替换支持单文件与单行
import { readdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { resolveCwd, inside, json, readBody, queryOf } from './util.js'

const SKIP = new Set(['.git', 'node_modules', '.venv', 'venv', '__pycache__', 'dist', 'build', '.next', '.cache', 'target', 'vendor', '.idea', '.vscode'])
const MAX_FILE = 262144 // 内容搜索/替换只处理 256KB 以内的文件

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
function passFilters(incList, excList, rel, name) {
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
// 构建匹配正则(与 search 路由同款规则);失败返回 null
function buildRe(needle, mc, ww, rx) {
  try {
    if (rx) return new RegExp(needle, mc ? 'g' : 'gi')
    const esc = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp((ww ? '\\b' : '') + esc + (ww ? '\\b' : ''), mc ? 'g' : 'gi')
  } catch (e) { return null }
}
// 替换保留大小写:全大写 → 全大写;首字母大写 → 首字母大写
function applyRepl(repl, pc, hit) {
  if (!pc) return repl
  if (hit && hit === hit.toUpperCase() && hit.toLowerCase() !== hit) return repl.toUpperCase()
  if (hit && hit.charAt(0) === hit.charAt(0).toUpperCase() && hit.charAt(0) !== hit.charAt(0).toLowerCase()) return repl.charAt(0).toUpperCase() + repl.slice(1)
  return repl
}

export function register(ctx, webServer) {
  // 在工作区内搜索(文件名 + 文本内容),最多 100 条,深 6 层
  webServer.register({ kind: 'exact', path: '/dsh-sidebar/search', handler: async (req, res) => {
    try {
      const q = queryOf(req)
      const cwd = resolveCwd(ctx, q.cwd)
      const needle = String(q.q || '').slice(0, 100)
      if (!needle) { json(res, { ok: true, results: [] }); return }
      const mc = q.mc === '1', ww = q.ww === '1', rx = q.rx === '1'
      const re = buildRe(needle, mc, ww, rx)
      function testMatch(hay) {
        if (!re) return false
        re.lastIndex = 0
        return re.test(hay)
      }
      const incList = String(q.inc || '').split(',').map(s => s.trim()).filter(Boolean)
      const excList = String(q.exc || '').split(',').map(s => s.trim()).filter(Boolean)
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
          else if (e.isFile() && passFilters(incList, excList, rel2, e.name) && testMatch(e.name)) {
            results.push({ path: full, name: e.name, kind: 'name' })
          } else if (e.isFile() && passFilters(incList, excList, rel2, e.name)) {
            try {
              const st = await stat(full)
              if (st.size > MAX_FILE) continue
              const buf = await readFile(full, 'utf8')
              const re2 = buildRe(needle, mc, ww, rx)
              if (!re2) continue
              re2.lastIndex = 0
              let mm
              while ((mm = re2.exec(buf)) !== null) {
                const lineStart = buf.lastIndexOf('\n', mm.index) + 1
                const lineEnd = buf.indexOf('\n', mm.index)
                const lineNo = buf.slice(0, lineStart).split('\n').length
                results.push({ path: full, name: e.name, kind: 'content', line: lineNo, snippet: buf.slice(lineStart, lineEnd < 0 ? undefined : lineEnd).trim().slice(0, 120) })
                if (mm[0].length === 0) re2.lastIndex++
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
      const re = buildRe(needle, mc, ww, rx)
      if (!re) { json(res, { ok: false, message: '无效的正则: ' + needle }); return }
      let files = 0, count = 0
      // 单文件替换(搜索分组悬停按钮;body.line 存在时只替换该行上的匹配)
      if (body.path && typeof body.path === 'string') {
        if (!inside(cwd, body.path)) { json(res, { ok: false, message: '路径超出工作区范围' }); return }
        try {
          const st = await stat(body.path)
          if (st.isFile() && st.size <= MAX_FILE) {
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
                  if (ln === lineNo) { out2 += applyRepl(repl, pc, mm[0]); cnt++ } else out2 += mm[0]
                  lastIdx = mm.index + mm[0].length
                  if (mm[0].length === 0) re.lastIndex++
                }
                out = out2 + buf.slice(lastIdx)
                count = cnt
              } else {
                out = buf.replace(re, applyRepl.bind(null, repl, pc))
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
          else if (e.isFile() && passFilters(incList, excList, rel2, e.name)) {
            try {
              const st = await stat(full)
              if (st.size > MAX_FILE) continue
              const buf = await readFile(full, 'utf8')
              re.lastIndex = 0
              const m = buf.match(re)
              if (!m) continue
              const out = buf.replace(re, applyRepl.bind(null, repl, pc))
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
}
