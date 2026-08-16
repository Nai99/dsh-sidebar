// 客户端渲染对比测试:用 React 桩分别渲染拆分前后的 bundle,内联展开组件后比较元素树
// 通过按 useState 调用序号注入状态,让面板以"全功能"状态渲染(标签/搜索结果/Git/终端/全部菜单)
// 用法:node scripts/test-client-render.mjs
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const OLD = execFileSync('git', ['show', 'HEAD:lib/client.js'], { encoding: 'utf8' })
const NEW = readFileSync('lib/client.js', 'utf8')

// 按 useState 调用序号的注入值(拆分前后 hook 顺序一致)
const SEED = {
  0: true, // visible
  2: { 'C:/fake': [{ name: 'a.js', dir: false, size: 3, mtime: 1 }, { name: 'sub', dir: true, size: 0, mtime: 1 }], 'C:/fake/sub': [{ name: 'c.txt', dir: false, size: 1, mtime: 1 }] }, // tree
  3: { 'C:/fake/sub': true }, // expanded
  4: [{ path: 'C:/fake/a.js', name: 'a.js' }, { path: 'C:/fake/b.md', name: 'b.md' }], // tabs
  5: 'C:/fake/b.md', // activePath
  6: { 'C:/fake/a.js': { content: 'const x = 1', dirty: true, truncated: false }, 'C:/fake/b.md': { content: '# 标题\n\n正文 x', dirty: false, truncated: false } }, // contents
  8: true, // moreOpen
  9: { top: 20, left: 30 }, // morePos
  10: { x: 10, y: 20 }, // mmMenu
  11: { which: 'size', x: 30, y: 40 }, // mmSub
  13: 'search', // exTab
  14: true, // termOpen
  15: 'bash', // termShell
  16: { x: 5, y: 6 }, // termMenu
  17: 250, // termHeight
  18: [{ id: 't1', cwd: 'C:/fake', label: 'C:/fake', shell: 'bash' }, { id: 't2', cwd: 'C:/fake/sub', label: 'sub', shell: 'pwsh' }], // termTabs
  19: 't1', // termActive
  20: 'x', // searchQ
  21: true, // searchMC
  24: 'repl', // replQ
  27: true, // detailsOpen
  29: true, // mdPreview
  30: true, // searchPC
  31: true, // filesFilterOpen
  34: true, // searchOpenOnly
  36: { x: 1, y: 2, path: 'C:/fake/a.js', name: 'a.js', isDir: false }, // ctxMenu
  37: { x: 1, y: 2, path: 'C:/fake/a.js' }, // tabMenu
  38: 'C:/fake/sub', // ctxSelPath
  40: { line: 3, col: 5 }, // cursorPos
  41: 4, // indentSize
  43: 'UTF-8', // encState
  45: 'JavaScript', // langLabel
  46: 'lang', // stPopup
  47: '3:5', // goLineVal
  48: { files: {}, totalAdd: 2, totalDel: 1, repo: true }, // gitDiff
  49: true, // gitModalOpen
  50: 'msg', // gitMsg
  51: 'main', // gitBranch
  52: true, // gitInclude
  54: { ok: true, text: 'done' }, // gitResult
  55: true, // gitBranchMenu
  56: [
    { path: 'C:/fake/a.js', name: 'a.js', kind: 'content', line: 2, snippet: 'const x = 1' },
    { path: 'C:/fake/a.js', name: 'a.js', kind: 'name' },
  ], // searchRes
  58: { repo: true, branch: 'main', branchList: ['main', 'dev'], ahead: 1, behind: 0, files: [{ path: 'a.js', status: 'M' }, { path: 'n.txt', status: '??' }] }, // gitData
}

function loadPanel(code) {
  // 把「return module.exports; } });」替换为导出 SidebarPanel,便于外部渲染
  const patched = code.replace('return module.exports; } });', 'return { panel: SidebarPanel, moveTab: typeof moveTab !== "undefined" ? moveTab : null }; } });')
  const sandbox = { window: {}, document: undefined, localStorage: undefined }
  let mod = null
  sandbox.window.__ModuleLoader__ = { load: (x) => { mod = x } }
  let stateIdx = 0
  const reactStub = {
    Fragment: Symbol('Fragment'),
    useState(init) {
      const i = stateIdx++
      const seed = SEED[i]
      if (seed !== undefined) return [seed, () => {}]
      return [typeof init === 'function' ? init() : init, () => {}]
    },
    useEffect() {},
    useRef(v) { return { current: v === undefined ? null : v } },
    useMemo(fn) { return fn() },
    createElement(type, props, ...children) {
      return { t: type, p: props || {}, c: children.flat() }
    },
  }
  const fn = new Function('window', 'document', 'localStorage', patched)
  fn(sandbox.window, sandbox.document, sandbox.localStorage)
  const exported = mod.factory((id) => (id === 'react' ? reactStub : {}))
  return { panel: exported.panel, moveTab: exported.moveTab, reset: () => { stateIdx = 0 } }
}

// 元素树序列化:组件函数就地内联展开;props 里的函数按名字比较;Fragment 透明化
function serialize(node) {
  if (node === null || node === undefined) return 'null'
  if (typeof node === 'string') return JSON.stringify(node)
  if (typeof node === 'number' || typeof node === 'boolean') return String(node)
  if (typeof node === 'function') return 'fn'
  if (typeof node === 'symbol') return 'fragment'
  if (Array.isArray(node)) return '[' + node.map(serialize).filter((s) => s !== '').join(',') + ']'
  if (typeof node === 'object' && node.t !== undefined) {
    if (typeof node.t === 'function') {
      // 组件函数:展开其渲染结果;返回数组时按多个子节点平铺
      try {
        const r = node.t(node.p)
        return Array.isArray(r) ? r.map(serialize).join(',') : serialize(r)
      } catch (e) { return 'ERR:' + e.message }
    }
    if (typeof node.t === 'symbol') return node.c.map(serialize).join(',')
    // 纯布局元素(sb-term-tabs 滚动容器 / sb-spacer 弹性填充)透明化,不参与结构对比
    const cls = node.p.className || ''
    if (typeof cls === 'string' && (cls.includes('sb-term-tabs') || cls.includes('sb-spacer'))) return node.c.map(serialize).filter(Boolean).join(',')
    // 拖拽排序的 DnD 属性(容器/标签上的 handler 位置随实现演进,接线由下方 moveTab 断言覆盖)
    const props = Object.keys(node.p).sort().filter((k) => !DND_PROPS.has(k)).map((k) => k + ':' + serialize(node.p[k])).join(',')
    return '<' + node.t + (props ? ' ' + props : '') + '>' + serialize(node.c) + '</' + node.t + '>'
  }
  return 'obj:' + JSON.stringify(node)
}

const DND_PROPS = new Set(['onDragStart', 'onDragOver', 'onDrop', 'onDragEnd', 'draggable'])

function renderPanel(code) {
  const { panel, reset } = loadPanel(code)
  reset()
  const tree = panel({ useSessions: (fn) => fn({ current: 's1', byId: { s1: { cwd: 'C:/fake' } } }) })
  return serialize(tree)
}

const oldTree = renderPanel(OLD)
const newTree = renderPanel(NEW)

if (oldTree === newTree) {
  console.log('RENDER TREE COMPARISON OK (' + oldTree.length + ' chars)')
} else {
  console.log('TREES DIFFER!')
  let i = 0
  while (i < Math.max(oldTree.length, newTree.length) && oldTree[i] === newTree[i]) i++
  console.log('first diff at', i)
  console.log('OLD:', oldTree.slice(Math.max(0, i - 120), i + 200))
  console.log('NEW:', newTree.slice(Math.max(0, i - 120), i + 200))
  process.exitCode = 1
}

// ---- 标签拖拽重排(moveTab: 把 from 移动到"第 to 个元素之前") ----
const moveTab = loadPanel(NEW).moveTab
const T = ['A', 'B', 'C', 'D']
const mt = (from, to) => JSON.stringify(moveTab(T.slice(), from, to))
const mtOk = (cond, msg) => { console.log((cond ? 'ok  ' : 'FAIL') + ' ' + msg); if (!cond) process.exitCode = 1 }
mtOk(mt(0, 2) === JSON.stringify(['B', 'A', 'C', 'D']), 'A 拖到 C 左半 → 插到 C 前')
mtOk(mt(0, 3) === JSON.stringify(['B', 'C', 'A', 'D']), 'A 拖到 C 右半/末尾 → 插到 C 后')
mtOk(mt(0, 4) === JSON.stringify(['B', 'C', 'D', 'A']), 'A 拖到末尾')
mtOk(mt(3, 1) === JSON.stringify(['A', 'D', 'B', 'C']), 'D 拖到 B 左半')
mtOk(mt(3, 4) === JSON.stringify(['A', 'B', 'C', 'D']), 'D 拖到末尾 → 顺序不变')
mtOk(mt(1, 4) === JSON.stringify(['A', 'C', 'D', 'B']), 'B 拖到末尾')
mtOk(mt(2, 0) === JSON.stringify(['C', 'A', 'B', 'D']), 'C 拖到开头')
mtOk(mt(1, 2) === JSON.stringify(['A', 'B', 'C', 'D']), 'B 拖到自身右侧 → 顺序不变')
