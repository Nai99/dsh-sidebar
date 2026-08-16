// 服务端拆分后的功能测试:模拟 dsh 的 webServer/sessions,对临时工作区验证全部路由
import { apply } from '../lib/index.js'
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

// ---- 假 ctx / webServer / req / res ----
const routes = new Map() // kind/path -> handler
const upgrades = [] // registerUpgrade 记录
const webServer = {
  register: (r) => { routes.set(r.kind + ' ' + r.path, r.handler) },
  registerUpgrade: (r) => { upgrades.push(r) },
}
const ctx = { webServer, sessions: { list: () => [] } }
apply(ctx)

const R = (p) => routes.get(p) || (p.startsWith('exact /dsh-sidebar/monaco') ? routes.get('prefix /dsh-sidebar/monaco') : undefined)
function assert(cond, msg) { if (!cond) { console.error('FAIL: ' + msg); process.exitCode = 1 } else console.log('ok  ' + msg) }

function makeRes() {
  let status = 0, headers = {}, body = null
  return {
    _status: () => status, _headers: () => headers, _body: () => body,
    writeHead: (c, h) => { status = c; headers = h || {} },
    end: (d) => { body = d },
  }
}
function makeGet(url) { return { url } }
function makePost(url, obj) {
  const listeners = {}
  const req = {
    url,
    on: (ev, cb) => { listeners[ev] = cb },
    _emit: () => { if (listeners.data) listeners.data(JSON.stringify(obj)); if (listeners.end) listeners.end() },
    destroy: () => {},
  }
  return req
}
async function get(pathUrl) { const res = makeRes(); await R('exact ' + pathUrl.split('?')[0])(makeGet(pathUrl), res); return res }
async function post(pathUrl, obj) { const res = makeRes(); const req = makePost(pathUrl, obj); const p = R('exact ' + pathUrl)(req, res); req._emit(); await p; return res }
const j = (res) => JSON.parse(res._body())

// ---- 临时工作区 ----
const ws = mkdtempSync(path.join(tmpdir(), 'dsh-sb-test-'))
writeFileSync(path.join(ws, 'hello.js'), 'const a = 1\n// hello world\nconst hello = 2\n')
writeFileSync(path.join(ws, 'note.md'), '# 标题\n\n正文 hello\n')
mkdirSync(path.join(ws, 'sub'))
writeFileSync(path.join(ws, 'sub', 'deep.txt'), 'deep hello content')
mkdirSync(path.join(ws, '.git')) // 伪装 .git 目录,验证 list 保留它
writeFileSync(path.join(ws, '.hidden'), 'x')
const bin = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0x01, 0x02, 0x03])
writeFileSync(path.join(ws, 'img.png'), bin)
// 真实 git 仓库用于 git-diff
execFileSync('git', ['init', '-q', ws])
execFileSync('git', ['-C', ws, 'config', 'user.email', 't@t.t'])
execFileSync('git', ['-C', ws, 'config', 'user.name', 't'])
execFileSync('git', ['-C', ws, 'add', '.'])
execFileSync('git', ['-C', ws, 'commit', '-qm', 'init'])
writeFileSync(path.join(ws, 'hello.js'), 'const a = 1\n// hello world\nconst hello = 3\n') // 修改
writeFileSync(path.join(ws, 'newfile.txt'), 'x') // 未跟踪

const cwd = ws
const enc = encodeURIComponent

try {
  // ---- 路由注册齐全 ----
  const expected = ['assets', 'files', 'search', 'git', 'external'].flatMap(m => ['assets'].includes(m) ? [] : [])
  const all = [...routes.keys()]
  for (const p of ['exact /dsh-sidebar/list', 'exact /dsh-sidebar/read', 'exact /dsh-sidebar/raw', 'exact /dsh-sidebar/write',
    'exact /dsh-sidebar/delete', 'exact /dsh-sidebar/rename', 'exact /dsh-sidebar/paste',
    'exact /dsh-sidebar/search', 'exact /dsh-sidebar/replace', 'exact /dsh-sidebar/git-diff',
    'exact /dsh-sidebar/git-status', 'exact /dsh-sidebar/git-ai', 'exact /dsh-sidebar/git-commit', 'exact /dsh-sidebar/git-push',
    'exact /dsh-sidebar/xterm.js', 'exact /dsh-sidebar/xterm.css',
    'exact /dsh-sidebar/reveal', 'exact /dsh-sidebar/open-vscode',
    'exact /dsh-sidebar/remixicon.css', 'exact /dsh-sidebar/remixicon.woff2', 'exact /dsh-sidebar/vscode.svg',
    'prefix /dsh-sidebar/monaco']) {
    assert(R(p), 'route registered: ' + p)
  }

  // ---- list ----
  let r = await get('/dsh-sidebar/list?cwd=' + enc(cwd))
  let d = j(r)
  assert(d.ok && d.entries.length === 6, 'list 顶层(hello.js/note.md/sub/.git/img.png/newfile.txt,隐藏文件排除)')
  const names = d.entries.map(e => e.name)
  assert(names.includes('.git'), 'list 保留 .git')
  assert(!names.includes('.hidden'), 'list 排除隐藏文件')
  assert(d.entries[0].dir === true, 'list 目录排前')

  // ---- read ----
  r = await get('/dsh-sidebar/read?cwd=' + enc(cwd) + '&path=' + enc(path.join(ws, 'hello.js')))
  d = j(r)
  assert(d.ok && d.content.includes('hello world') && !d.truncated, 'read 文本文件')

  // ---- read 二进制 ----
  r = await get('/dsh-sidebar/read?cwd=' + enc(cwd) + '&path=' + enc(path.join(ws, 'img.png')))
  d = j(r)
  assert(d.ok && d.binary === 'image' && d.mime === 'image/png', 'read 图片二进制识别')

  // ---- raw ----
  r = await get('/dsh-sidebar/raw?cwd=' + enc(cwd) + '&path=' + enc(path.join(ws, 'img.png')))
  assert(r._status() === 200 && r._headers()['content-type'] === 'image/png' && r._body().length === bin.length, 'raw 原始字节')

  // ---- git-diff(在文件被后续测试改动前执行) ----
  r = await get('/dsh-sidebar/git-diff?cwd=' + enc(cwd))
  d = j(r)
  assert(d.ok && d.files['hello.js'] && d.files['hello.js'].added === 1 && d.files['hello.js'].deleted === 1, 'git-diff 修改统计')
  assert(d.totalAdd >= 1, 'git-diff 总计')
  assert(d.repo === true, 'git-diff 仓库检测(已提交仓库)')

  // ---- git-status(内置实现,替代 dsh-gitbar) ----
  r = await get('/dsh-sidebar/git-status?cwd=' + enc(cwd))
  d = j(r)
  assert(d.ok && d.repo === true, 'git-status 仓库识别')
  assert(typeof d.branch === 'string' && d.branch.length > 0, 'git-status 当前分支: ' + d.branch)
  assert(Array.isArray(d.files) && d.files.some(f => f.path === 'hello.js'), 'git-status 文件列表含修改文件')
  assert(Array.isArray(d.files) && d.files.some(f => f.path === 'newfile.txt' && /^\?\?/.test(f.status)), 'git-status 未跟踪文件')
  assert(Array.isArray(d.branchList) && d.branchList.length >= 1, 'git-status 分支列表')
  assert(typeof d.ahead === 'number' && typeof d.behind === 'number', 'git-status 领先/落后')
  assert(typeof d.staged === 'number' && typeof d.unstaged === 'number', 'git-status 暂存统计')

  // ---- 仓库检测:空提交仓库应识别为仓库(回归: gitbar 用 HEAD 探测会误判) ----
  const wsEmpty = mkdtempSync(path.join(tmpdir(), 'dsh-sb-empty-'))
  execFileSync('git', ['init', '-q', wsEmpty])
  writeFileSync(path.join(wsEmpty, 'draft.txt'), 'x')
  r = await get('/dsh-sidebar/git-diff?cwd=' + enc(wsEmpty))
  d = j(r)
  assert(d.ok && d.repo === true, '空提交仓库识别为仓库')
  r = await get('/dsh-sidebar/git-status?cwd=' + enc(wsEmpty))
  d = j(r)
  assert(d.ok && d.repo === true, '空提交仓库 git-status 识别为仓库')
  assert(Array.isArray(d.files) && d.files.some(f => f.path === 'draft.txt' && /^\?\?/.test(f.status)), '空提交仓库 git-status 未跟踪文件')
  rmSync(wsEmpty, { recursive: true, force: true })

  // ---- 仓库检测:非仓库目录 ----
  const wsPlain = mkdtempSync(path.join(tmpdir(), 'dsh-sb-plain-'))
  writeFileSync(path.join(wsPlain, 'a.txt'), 'x')
  r = await get('/dsh-sidebar/git-diff?cwd=' + enc(wsPlain))
  d = j(r)
  assert(d.ok && d.repo === false, '非仓库目录识别为非仓库')
  r = await get('/dsh-sidebar/git-status?cwd=' + enc(wsPlain))
  d = j(r)
  assert(d.ok && d.repo === false && !d.reason, '非仓库目录 git-status 识别为非仓库(无 git 不可用误报)')
  rmSync(wsPlain, { recursive: true, force: true })

  // ---- git-commit / git-push(独立仓库 + 裸远程,端到端) ----
  const wsGit = mkdtempSync(path.join(tmpdir(), 'dsh-sb-git-'))
  const wsBare = mkdtempSync(path.join(tmpdir(), 'dsh-sb-bare-'))
  execFileSync('git', ['init', '-q', wsGit])
  execFileSync('git', ['-C', wsGit, 'config', 'user.email', 't@t.t'])
  execFileSync('git', ['-C', wsGit, 'config', 'user.name', 't'])
  execFileSync('git', ['init', '-q', '--bare', wsBare])
  execFileSync('git', ['-C', wsGit, 'remote', 'add', 'origin', wsBare])
  writeFileSync(path.join(wsGit, 'a.txt'), 'v1')
  execFileSync('git', ['-C', wsGit, 'add', '-A'])
  execFileSync('git', ['-C', wsGit, 'commit', '-qm', 'init'])
  // 修改文件 → 提交
  writeFileSync(path.join(wsGit, 'a.txt'), 'v2')
  r = await post('/dsh-sidebar/git-commit', { cwd: wsGit, message: 'feat: bump', push: false, branch: '', includeUnstaged: true })
  d = j(r)
  assert(d.ok, 'git-commit 提交成功')
  assert(execFileSync('git', ['-C', wsGit, 'log', '-1', '--format=%s'], { encoding: 'utf8' }).trim() === 'feat: bump', 'git-commit 提交信息正确')
  // 推送
  r = await post('/dsh-sidebar/git-push', { cwd: wsGit, branch: '' })
  d = j(r)
  assert(d.ok, 'git-push 推送成功')
  assert(execFileSync('git', ['--git-dir=' + wsBare, 'log', '--all', '-1', '--format=%s'], { encoding: 'utf8' }).trim() === 'feat: bump', 'git-push 远端收到提交')
  // 提交信息为空且无改动 → 提示失败(不触达 LLM)
  r = await post('/dsh-sidebar/git-commit', { cwd: wsGit, message: '', push: false, branch: '', includeUnstaged: true })
  d = j(r)
  assert(d.ok === false, '空消息且无改动时提交失败提示')
  // git-ai:无 diff 返回空消息(不触达 LLM)
  r = await get('/dsh-sidebar/git-ai?cwd=' + enc(wsGit))
  d = j(r)
  assert(d.ok && d.message === '', 'git-ai 无 diff 返回空消息')
  rmSync(wsGit, { recursive: true, force: true })
  rmSync(wsBare, { recursive: true, force: true })

  // ---- 越界拦截 ----
  r = await get('/dsh-sidebar/list?cwd=' + enc(cwd) + '&path=' + enc(path.join(ws, '..')))
  assert(j(r).ok === false, 'list 越界拦截')
  r = await get('/dsh-sidebar/read?cwd=' + enc(cwd) + '&path=' + enc(path.join(ws, '..', 'index.js')))
  assert(j(r).ok === false, 'read 越界拦截')

  // ---- write ----
  r = await post('/dsh-sidebar/write', { cwd, path: path.join(ws, 'written.txt'), content: 'abc' })
  assert(j(r).ok, 'write 新文件')
  assert(readFileSync(path.join(ws, 'written.txt'), 'utf8') === 'abc', 'write 内容落盘')

  // ---- rename ----
  r = await post('/dsh-sidebar/rename', { cwd, path: path.join(ws, 'written.txt'), name: 'renamed.txt' })
  d = j(r)
  assert(d.ok && d.path.endsWith('renamed.txt') && existsSync(path.join(ws, 'renamed.txt')), 'rename 重命名')

  // ---- paste(复制) ----
  r = await post('/dsh-sidebar/paste', { cwd, src: path.join(ws, 'renamed.txt'), dest: ws })
  assert(j(r).ok && j(r).path.endsWith('renamed (2).txt'), 'paste 复制自动避让重名')
  // ---- paste(剪切) ----
  r = await post('/dsh-sidebar/paste', { cwd, src: path.join(ws, 'renamed.txt'), dest: path.join(ws, 'sub'), op: 'cut' })
  assert(j(r).ok && !existsSync(path.join(ws, 'renamed.txt')) && existsSync(path.join(ws, 'sub', 'renamed.txt')), 'paste 剪切移动')

  // ---- delete ----
  r = await post('/dsh-sidebar/delete', { cwd, path: path.join(ws, 'sub', 'renamed.txt') })
  assert(j(r).ok && !existsSync(path.join(ws, 'sub', 'renamed.txt')), 'delete 删除文件')

  // ---- search ----
  r = await get('/dsh-sidebar/search?cwd=' + enc(cwd) + '&q=' + enc('hello'))
  d = j(r)
  assert(d.ok && d.results.length >= 3, 'search 全文命中(hello.js×2 + note.md + deep.txt)')
  assert(d.results.some(x => x.kind === 'content' && x.path.endsWith('note.md') && x.line === 3), 'search 行号/片段正确')
  r = await get('/dsh-sidebar/search?cwd=' + enc(cwd) + '&q=' + enc('hello') + '&ww=1&mc=1&exc=' + enc('*.txt'))
  d = j(r)
  assert(d.results.every(x => !x.path.endsWith('.txt')), 'search 全词/大小写/排除生效')

  // ---- replace ----
  r = await post('/dsh-sidebar/replace', { cwd, q: 'hello', repl: 'world' })
  d = j(r)
  assert(d.ok && d.files >= 2 && d.count >= 3, 'replace 全工作区替换')
  assert(readFileSync(path.join(ws, 'note.md'), 'utf8').includes('正文 world'), 'replace 内容落盘')
  // 单行替换
  r = await post('/dsh-sidebar/replace', { cwd, path: path.join(ws, 'hello.js'), q: 'world', repl: 'X', line: 3 })
  d = j(r)
  const helloJs = readFileSync(path.join(ws, 'hello.js'), 'utf8')
  assert(d.ok && d.count === 1 && helloJs.split('\n')[2].includes('X') && helloJs.split('\n')[1].includes('world'), 'replace 单行替换')

  // ---- 静态资源 ----
  r = await get('/dsh-sidebar/remixicon.css')
  assert(r._status() === 200 && r._headers()['content-type'].includes('text/css'), 'remixicon.css')
  r = await get('/dsh-sidebar/vscode.svg')
  assert(r._status() === 200 && r._headers()['content-type'] === 'image/svg+xml', 'vscode.svg')
  r = await get('/dsh-sidebar/monaco/vs/loader.js')
  assert(r._status() === 200 && r._headers()['content-type'] === 'application/javascript', 'monaco prefix 静态资源')
  r = await get('/dsh-sidebar/monaco/vs/..%2floader.js')
  assert(r._status() === 403, 'monaco 目录穿越拦截(..%2f)')
  r = await get('/dsh-sidebar/monaco/..%5c..%5cserver%5cutil.js')
  assert(r._status() === 403, 'monaco 反斜杠穿越拦截')

  // ---- 终端静态资源(内置 xterm,不依赖 dsh-termbar) ----
  r = await get('/dsh-sidebar/xterm.js')
  assert(r._status() === 200 && r._headers()['content-type'].includes('javascript') && r._body().length > 100000, 'xterm.js 静态资源')
  r = await get('/dsh-sidebar/xterm.css')
  assert(r._status() === 200 && r._headers()['content-type'].includes('text/css') && r._body().length > 1000, 'xterm.css 静态资源')

  console.log('\n' + (process.exitCode ? 'SOME TESTS FAILED' : 'ALL SERVER TESTS PASSED'))
} finally {
  rmSync(ws, { recursive: true, force: true })
}
