// 共享工具:路径解析 / 路径约束 / 二进制嗅探 / HTTP 辅助
import path from 'node:path'

// 解析工作目录:优先显式传入,否则取第一个会话的 cwd,兜底进程 cwd
export function resolveCwd(ctx, explicit) {
  if (explicit && typeof explicit === 'string' && explicit.length > 0 && explicit !== 'null') return explicit
  try {
    const list = ctx.sessions.list() || []
    for (const s of list) if (s && s.cwd && typeof s.cwd === 'string' && s.cwd.length > 0) return s.cwd
  } catch (e) { /* ignore */ }
  return process.cwd()
}

// 确保 target 在 base 目录内
export function inside(base, target) {
  const rel = path.relative(base, target)
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel))
}

// 二进制嗅探:前 8KB 含 NUL 或大量不可打印字符即视为二进制
export function looksBinary(buf) {
  const n = Math.min(buf.length, 8000)
  let bad = 0
  for (let i = 0; i < n; i++) {
    const b = buf[i]
    if (b === 0) return true
    if (b < 9 || (b > 13 && b < 32)) bad++
  }
  return bad > n * 0.1
}
export const IMG_MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', bmp: 'image/bmp', ico: 'image/x-icon', avif: 'image/avif' }

export const json = (res, data) => { res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify(data)) }

export const readBody = (req) => new Promise((resolve) => {
  let data = ''
  req.on('data', c => { data += c; if (data.length > 2e6) req.destroy() })
  req.on('end', () => { try { resolve(JSON.parse(data || '{}')) } catch (e) { resolve({}) } })
  req.on('error', () => resolve({}))
})

export const queryOf = (req) => {
  const q = req.url.indexOf('?') >= 0 ? req.url.slice(req.url.indexOf('?') + 1) : ''
  const p = {}
  for (const pair of q.split('&')) { if (!pair) continue; const i = pair.indexOf('='); p[decodeURIComponent(i >= 0 ? pair.slice(0, i) : pair)] = decodeURIComponent(i >= 0 ? pair.slice(i + 1) : '') }
  return p
}
