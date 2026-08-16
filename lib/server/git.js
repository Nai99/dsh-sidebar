// Git 内置实现:仓库状态 / 增删统计 / AI 提交信息 / 提交 / 推送(不依赖 dsh-gitbar)
// 路由:
//   GET  /dsh-sidebar/git-status?cwd=   -> 仓库状态(分支/文件/领先落后/暂存统计)
//   GET  /dsh-sidebar/git-ai?cwd=       -> 基于 diff 用 LLM 生成提交消息
//   POST /dsh-sidebar/git-commit        -> { cwd, message, push, branch, includeUnstaged }
//   POST /dsh-sidebar/git-push          -> { cwd, branch }
//   GET  /dsh-sidebar/git-diff?cwd=     -> 每文件/总计增删统计 + 仓库检测
// git 执行:优先用 Git for Windows 的 bash(PATH 里没有 git 时也能跑,与 dsh-gitbar 同思路),
// 找不到 bash 时退回 PATH 中的 git.exe
import { execFile } from 'node:child_process'
import { existsSync, writeFileSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import { resolveCwd, json, readBody, queryOf } from './util.js'

// ---- git 执行环境探测 ----
const BASH_CANDIDATES = [
  process.env.DSH_SIDEBAR_BASH,
  'D:/Git/usr/bin/bash.exe',
  'C:/Program Files/Git/usr/bin/bash.exe',
  'C:/Program Files (x86)/Git/usr/bin/bash.exe',
  'C:/Program Files/Git/bin/bash.exe',
].filter(Boolean)
const BASH = BASH_CANDIDATES.find((p) => existsSync(p))
const USE_BASH = !!BASH
// 直接模式兜底:PATH 中的 git 不可用时尝试常见安装路径的 git.exe
const GIT_EXE_CANDIDATES = [
  'D:/Git/cmd/git.exe',
  'C:/Program Files/Git/cmd/git.exe',
  'C:/Program Files (x86)/Git/cmd/git.exe',
  'C:/Program Files/Git/bin/git.exe',
  'D:/Git/bin/git.exe',
].filter((p) => existsSync(p))

// shell 单引号转义(Windows 反斜杠在单引号内为字面量,git -C 可识别)
function q(s) { return "'" + String(s).replace(/'/g, "'\\''") + "'" }

// 执行 git 命令,返回 { code, out, err };失败不抛异常
function git(cwd, args, timeoutMs = 60000) {
  const opts = { windowsHide: true, timeout: timeoutMs, maxBuffer: 16 * 1024 * 1024 }
  const done = (err, stdout, stderr) => ({
    code: err ? (typeof err.code === 'number' ? err.code : 1) : 0,
    out: String(stdout || ''),
    err: String(stderr || (err && err.message) || ''),
  })
  if (USE_BASH) {
    const cmd = 'git -C ' + q(cwd) + ' ' + args.map(q).join(' ')
    return new Promise((resolve) => execFile(BASH, ['-lc', cmd], opts, (err, stdout, stderr) => resolve(done(err, stdout, stderr))))
  }
  // 直接模式:PATH 中的 git 优先,ENOENT 时依次尝试常见安装路径
  return new Promise((resolve) => {
    const attempts = [['git', ['-C', cwd].concat(args)]].concat(GIT_EXE_CANDIDATES.map((p) => [p, ['-C', cwd].concat(args)]))
    const next = (i) => {
      if (i >= attempts.length) return resolve({ code: 1, out: '', err: 'spawn git ENOENT' })
      execFile(attempts[i][0], attempts[i][1], opts, (err, stdout, stderr) => {
        if (err && err.code === 'ENOENT') return next(i + 1)
        resolve(done(err, stdout, stderr))
      })
    }
    next(0)
  })
}

// git 二进制本身不可用的错误特征(ENOENT / bash 找不到 git)
const GIT_MISSING = /ENOENT|command not found|not recognized/i

// dsh-llm 是 ESM:从 dsh 官方配置目录 resolve 入口后动态 import(file:// URL)
const require = createRequire(path.join(os.homedir(), '.dsh', 'profiles', 'web', 'package.json'))
let _llm = null
async function llmModule() {
  if (!_llm) _llm = await import(pathToFileURL(require.resolve('@deepseek-ai/dsh-llm')).href)
  return _llm
}

// 仓库状态(与 dsh-gitbar /status 同款结构;仓库检测用 is-inside-work-tree,空提交仓库也能识别)
async function gitStatus(cwd) {
  const probe = await git(cwd, ['rev-parse', '--is-inside-work-tree'])
  const repo = probe.out.trim() === 'true'
  if (!repo) {
    const reason = probe.code !== 0 && GIT_MISSING.test(probe.err)
      ? 'git 命令不可用(' + (USE_BASH ? 'bash=' + BASH : 'PATH git 与常见安装路径均不可用') + ')'
      : undefined
    return { ok: true, repo: false, cwd, reason }
  }
  const [head, porcelain, branches, counts] = await Promise.all([
    git(cwd, ['rev-parse', '--abbrev-ref', 'HEAD']),
    git(cwd, ['status', '--porcelain=v1']),
    git(cwd, ['branch', '--list', '--format=%(refname:short)']),
    git(cwd, ['rev-list', '--left-right', '--count', 'HEAD...@{upstream}']),
  ])
  const branch = head.out.trim() // 空提交仓库无 HEAD,为空字符串
  // 注意:不能先 trim 整行——工作区修改的行以空格开头(索引列空),先 trim 会导致 slice(3) 吃掉路径首字符
  const files = porcelain.out.split('\n').map(l => l.replace(/\r$/, '')).filter(Boolean)
    .map(l => ({ status: l.slice(0, 2).trim(), path: l.slice(3) }))
  const branchList = branches.out.split('\n').map(b => b.trim()).filter(Boolean)
  const m = counts.out.trim().split(/\s+/)
  const ahead = parseInt(m[0] || '0', 10) || 0
  const behind = parseInt(m[1] || '0', 10) || 0
  const staged = files.filter(f => /^[MADRC]/.test(f.status)).length
  const unstaged = files.filter(f => /[MADRC]/.test(f.status.slice(1)) || /^\?\?/.test(f.status)).length
  return { ok: true, repo: true, cwd, branch, branchList, files, staged, unstaged, ahead, behind }
}

// 基于 staged + unstaged diff 用 LLM 生成一行 conventional commit message(与 gitbar 同款提示词)
async function aiMessage(ctx, cwd) {
  const staged = await git(cwd, ['diff', '--staged'])
  const unstaged = await git(cwd, ['diff'])
  const body = ((staged.out || '') + (unstaged.out || '')).trim().slice(0, 6000)
  if (!body) return { ok: true, message: '' }
  let route = { provider: 'opencode-go', model: 'deepseek-v4-flash' }
  try {
    const m = ctx.settings.get('agent-default-model')
    if (m && m.provider) route = { provider: m.provider, model: m.model || route.model }
  } catch (e) { /* default */ }
  const messages = [{
    role: 'user',
    content: [{ type: 'text', text: 'Based on the following git diff, write ONE concise conventional commit message (type: subject, under 72 chars). Output only the commit message line, no quotes, no explanation.\n\n```diff\n' + body + '\n```' }],
    source: { kind: 'plugin', plugin: 'dsh-sidebar' },
  }]
  const options = {
    provider: route.provider,
    model: route.model,
    messages,
    system: 'You are a git commit message assistant. Reply with a single conventional commit message only.',
    maxTokens: 200,
    purpose: 'sidebar-commit-message',
  }
  const { BlockAssembler } = await llmModule()
  const assembler = new BlockAssembler()
  for await (const chunk of ctx.llm.stream(options)) assembler.push(chunk)
  const text = assembler.blocks().filter(b => b.type === 'text').map(b => b.text).join(' ').trim()
  const firstLine = text.split('\n').map(l => l.trim()).filter(Boolean)[0] || ''
  return { ok: true, message: firstLine.replace(/^["']|["']$/g, '') }
}

// 提交(可附带推送):切换分支 → add -A → commit -F 临时文件 → push origin 当前分支
async function doCommit(cwd, message, push, branch, includeUnstaged) {
  const steps = []
  if (branch) {
    const cur = await git(cwd, ['rev-parse', '--abbrev-ref', 'HEAD'])
    if (cur.out.trim() !== branch) steps.push(['checkout', branch])
  }
  if (includeUnstaged !== false) steps.push(['add', '-A'])
  const msgFile = path.join(os.tmpdir(), 'dsh-sidebar-msg-' + Date.now() + '.txt')
  try {
    writeFileSync(msgFile, message, 'utf8')
    steps.push(['commit', '-F', msgFile])
    if (push) {
      const cur = await git(cwd, ['rev-parse', '--abbrev-ref', 'HEAD'])
      steps.push(['push', 'origin', cur.out.trim()])
    }
    for (const args of steps) {
      const r = await git(cwd, args, 120000)
      if (r.code !== 0) return { ok: false, step: 'git ' + args.join(' '), err: (r.err + r.out).slice(0, 600) }
    }
    return { ok: true }
  } finally {
    try { rmSync(msgFile, { force: true }) } catch (e) { /* ignore */ }
  }
}

export function register(ctx, webServer) {
  // 仓库状态
  webServer.register({ kind: 'exact', path: '/dsh-sidebar/git-status', handler: async (req, res) => {
    try {
      const q = queryOf(req)
      const cwd = resolveCwd(ctx, q.cwd)
      json(res, await gitStatus(cwd))
    } catch (e) { json(res, { ok: false, message: String(e && e.message ? e.message : e) }) }
  } })
  // AI 生成提交信息
  webServer.register({ kind: 'exact', path: '/dsh-sidebar/git-ai', handler: async (req, res) => {
    try {
      const q = queryOf(req)
      const cwd = resolveCwd(ctx, q.cwd)
      json(res, await aiMessage(ctx, cwd))
    } catch (e) { json(res, { ok: false, message: String(e && e.message ? e.message : e) }) }
  } })
  // 提交(消息为空时自动用 AI 生成)
  webServer.register({ kind: 'exact', path: '/dsh-sidebar/git-commit', handler: async (req, res) => {
    try {
      const body = await readBody(req)
      const cwd = resolveCwd(ctx, body.cwd)
      let message = String(body.message || '').trim()
      if (!message) {
        const ai = await aiMessage(ctx, cwd)
        if (!ai.ok || !ai.message) { json(res, { ok: false, message: '提交消息为空且 AI 生成失败' }); return }
        message = ai.message
      }
      json(res, await doCommit(cwd, message, !!body.push, body.branch || '', body.includeUnstaged))
    } catch (e) { json(res, { ok: false, message: String(e && e.message ? e.message : e) }) }
  } })
  // 推送
  webServer.register({ kind: 'exact', path: '/dsh-sidebar/git-push', handler: async (req, res) => {
    try {
      const body = await readBody(req)
      const cwd = resolveCwd(ctx, body.cwd)
      const cur = await git(cwd, ['rev-parse', '--abbrev-ref', 'HEAD'])
      const branch = String(body.branch || cur.out.trim() || '')
      const r = await git(cwd, ['push', 'origin', branch], 120000)
      if (r.code !== 0) json(res, { ok: false, err: (r.err + r.out).slice(0, 600) })
      else json(res, { ok: true })
    } catch (e) { json(res, { ok: false, message: String(e && e.message ? e.message : e) }) }
  } })
  // Git 每个文件/总计增删统计(含权威仓库检测)
  webServer.register({ kind: 'exact', path: '/dsh-sidebar/git-diff', handler: async (req, res) => {
    try {
      const q = queryOf(req)
      const cwd = resolveCwd(ctx, q.cwd)
      const [unstaged, staged] = await Promise.all([
        git(cwd, ['diff', '--numstat']),
        git(cwd, ['diff', '--cached', '--numstat'])
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
      parse(staged.out)
      parse(unstaged.out)
      // 权威仓库检测:rev-parse --is-inside-work-tree 在空提交仓库同样返回 true
      const probe = await git(cwd, ['rev-parse', '--is-inside-work-tree'])
      const repo = probe.out.trim() === 'true'
      const reason = !repo && probe.code !== 0 && GIT_MISSING.test(probe.err)
        ? 'git 命令不可用(' + (USE_BASH ? 'bash=' + BASH : 'PATH git 与常见安装路径均不可用') + ')'
        : undefined
      json(res, { ok: true, repo, reason, files, totalAdd, totalDel })
    } catch (e) { json(res, { ok: false, message: String(e && e.message ? e.message : e) }) }
  } })
}
