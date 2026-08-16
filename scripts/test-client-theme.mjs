// 主题切换 / 代码高亮保持 回归测试(运行真实 bundle):
// 1) 宿主切主题(<html>/<body> 属性变化)、系统深浅色变化、dsh-editor-settings 事件 → Monaco 主题即时刷新
// 2) 刷新时模型语言按当前文件设置(回归: effect 闭包过期的 activeTab 曾把语言重置为 plaintext,导致代码高亮丢失)
// 用法:node scripts/test-client-theme.mjs
import { readFileSync } from 'node:fs'

process.on('uncaughtException', (e) => {
  console.log('UNEXPECTED ASYNC ERROR:', e && e.message)
  process.exit(1)
})

const src = readFileSync('lib/client.js', 'utf8')
const patched = src.replace('return module.exports; } });', 'return { panel: SidebarPanel, i18nMap: typeof MONACO_MENU_I18N !== "undefined" ? MONACO_MENU_I18N : null, nls: typeof MONACO_NLS !== "undefined" ? MONACO_NLS : null }; } });')

const ok = (cond, msg) => { console.log((cond ? 'ok  ' : 'FAIL') + ' ' + msg); if (!cond) process.exitCode = 1 }

// 每次场景独立加载 bundle,状态互不污染。
// secondSeed 提供后,面板先以 firstSeed 渲染(注册 effect,闭包捕获"无文件"状态),
// 再以 secondSeed 渲染(模拟之后打开文件);useRef 跨渲染返回同一对象(与 React 一致)。
function loadBundle(firstSeed, secondSeed) {
  const mqListeners = []
  const winListeners = {}
  const observerInsts = []
  const observed = []
  const defines = []
  const themeCalls = []
  const langCalls = []
  let mqRemoved = false
  let observerDisconnected = 0

  const mq = {
    matches: true,
    addEventListener: (ev, cb) => { if (ev === 'change') mqListeners.push(cb) },
    removeEventListener: () => { mqRemoved = true },
    addListener: (cb) => { mqListeners.push(cb) },
    removeListener: () => { mqRemoved = true },
  }
  const monacoStub = {
    editor: {
      defineTheme: (name) => defines.push(name),
      setTheme: (name) => themeCalls.push(name),
      setModelLanguage: (m, lang) => langCalls.push(lang),
    },
  }
  const fakeEditor = {
    updateOptions: () => {},
    getModel: () => null,
    // 返回假 minimap 元素,attachMinimapMenu 直接绑定,避免 300ms 重试定时器在测试结束后触发
    querySelector: () => ({ __sbMmBound: false, addEventListener: () => {} }),
  }
  class MutationObserverStub {
    constructor(cb) { this.cb = cb; observerInsts.push(this) }
    observe(target, opts) { observed.push({ target, opts }) }
    disconnect() { observerDisconnected++ }
  }
  const documentStub = {
    documentElement: {},
    body: { appendChild: () => {}, removeChild: () => {} },
    head: { appendChild: () => {} },
    createElement: () => ({ style: {} }),
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
  }
  const windowStub = {
    matchMedia: () => mq,
    monaco: monacoStub,
    addEventListener: (name, cb) => { (winListeners[name] = winListeners[name] || []).push(cb) },
    removeEventListener: (name, cb) => { winListeners[name] = (winListeners[name] || []).filter((f) => f !== cb) },
    dispatchEvent: () => {},
    location: { protocol: 'http:', host: 'x' },
  }
  windowStub.__ModuleLoader__ = { load: (x) => { windowStub.__mod = x } }

  // hook 计数器跨所有 hook 类型递增(与 React 一致),useRef 按位置跨渲染复用同一对象
  let hookIdx = 0
  let stateSeed = firstSeed
  const effects = []
  const refPool = []
  const reactStub = {
    Fragment: Symbol('Fragment'),
    useState(init) {
      const i = hookIdx++
      if (stateSeed[i] !== undefined) return [stateSeed[i], () => {}]
      return [typeof init === 'function' ? init() : init, () => {}]
    },
    useEffect(fn) { hookIdx++; effects.push(fn) },
    useRef(v) {
      const i = hookIdx++
      if (!refPool[i]) refPool[i] = { current: v === undefined ? null : v }
      return refPool[i]
    },
    useMemo(fn) { hookIdx++; return fn() },
    createElement(t, p, ...c) { return { t, p: p || {}, c: c.flat() } },
  }

  const fn = new Function('window', 'document', 'localStorage', 'MutationObserver', 'getComputedStyle', patched)
  fn(windowStub, documentStub, undefined, MutationObserverStub, () => ({ backgroundColor: 'rgb(15, 17, 21)' }))
  const exported = windowStub.__mod.factory((id) => (id === 'react' ? reactStub : {}))
  const renderPanel = (seed) => {
    hookIdx = 0
    stateSeed = seed
    exported.panel({ useSessions: (sf) => sf({ current: 's1', byId: { s1: { cwd: 'C:/fake' } } }) })
  }
  renderPanel(firstSeed)
  if (secondSeed) renderPanel(secondSeed)
  // 只给初始为 null 的 ref 注入假编辑器(monacoInst/monacoElRef 等);
  // activeTabRef 等在渲染时已被赋值的 ref 保持原值,否则刷新会读到假编辑器的属性
  refPool.forEach((r) => { if (r.current === null) r.current = fakeEditor })
  const cleanups = effects.map((f) => f()).filter(Boolean)
  return {
    mqListeners, winListeners, observerInsts, observed, defines, themeCalls, langCalls, cleanups,
    fakeEditor, documentStub, refs: refPool, i18nMap: exported.i18nMap, nls: exported.nls,
    getMqRemoved: () => mqRemoved,
    getObserverDisconnected: () => observerDisconnected,
  }
}

// ============ 场景 1:主题即时刷新 ============
{
  const h = loadBundle({ 0: true })
  const htmlObs = h.observed.filter((o) => o.target === h.documentStub.documentElement)
  const bodyObs = h.observed.filter((o) => o.target === h.documentStub.body)
  ok(htmlObs.length === 1, 'MutationObserver 观察 <html>')
  ok(bodyObs.length === 1, 'MutationObserver 观察 <body>')
  const filter = (htmlObs[0] && htmlObs[0].opts && htmlObs[0].opts.attributeFilter) || []
  ok(filter.includes('class') && filter.includes('style'), '属性过滤含 class/style: ' + JSON.stringify(filter))

  // 宿主切主题(html class 变化)→ 防抖后刷新
  // 模拟一个已活动的终端,验证主题热更新(termRefs 是唯一初始 current 为 {} 的 ref)
  const termRefs = h.refs.find((r) => r && typeof r.current === 'object' && r.current !== null && Object.keys(r.current).length === 0)
  termRefs.current = { t1: { term: { options: {} } } }
  h.observerInsts[0].cb([{ type: 'attributes', attributeName: 'class' }])
  await new Promise((r) => setTimeout(r, 250)) // 120ms 防抖 + 余量
  ok(h.themeCalls.length >= 1, '宿主主题切换后 setTheme 被调用: ' + JSON.stringify(h.themeCalls))
  ok(h.defines.length >= 2, 'Monaco 主题重新定义(重新解析 CSS 变量): ' + JSON.stringify(h.defines))
  ok(termRefs.current.t1.term.options.theme && termRefs.current.t1.term.options.theme.background === '#0f1115', '终端主题热更新(重新解析 CSS 变量): ' + JSON.stringify(termRefs.current.t1.term.options.theme && termRefs.current.t1.term.options.theme.background))

  // 系统深浅色变化(matchMedia change)→ 刷新
  const before = h.themeCalls.length
  h.mqListeners.forEach((cb) => cb({ matches: false }))
  ok(h.themeCalls.length > before, '系统深浅色切换后 setTheme 被调用')

  // dsh-editor-settings 事件 → 刷新
  const before2 = h.themeCalls.length
  ;(h.winListeners['dsh-editor-settings'] || []).forEach((cb) => cb())
  ok(h.themeCalls.length > before2, 'dsh-editor-settings 事件仍触发刷新')

  // 清理
  h.cleanups.forEach((c) => { try { c() } catch (e) {} })
  ok(h.getObserverDisconnected() === h.observerInsts.length, '清理时观察器断开')
  ok((h.winListeners['dsh-editor-settings'] || []).length === 0, '清理时移除 dsh-editor-settings 监听')
  ok(h.getMqRemoved(), '清理时移除 matchMedia 监听')
}

// ============ 场景 2:刷新时保持代码高亮(模型语言不被重置为 plaintext) ============
// 先以"无文件"状态渲染注册 effect(闭包 activeTab=null,与真实挂载时序一致),再打开 a.js
{
  const h = loadBundle(
    { 0: true }, // 首渲染:无文件
    { 0: true, 4: [{ path: 'C:/fake/a.js', name: 'a.js' }], 5: 'C:/fake/a.js', 6: { 'C:/fake/a.js': { content: 'const x = 1', dirty: false, truncated: false } } } // 次渲染:打开文件
  )
  h.fakeEditor.getModel = () => ({ getLanguageId: () => 'plaintext', getValue: () => 'const x = 1' })

  // dsh-editor-settings 事件(缩略图右键菜单 / 外观切换等)→ 语言按当前文件设置
  ;(h.winListeners['dsh-editor-settings'] || []).forEach((cb) => cb())
  ok(h.langCalls.length >= 1, '设置事件后模型语言被设置')
  ok(h.langCalls.every((l) => l !== 'plaintext'), '设置事件未把语言重置为 plaintext: ' + JSON.stringify(h.langCalls))
  ok(h.langCalls.includes('javascript'), '语言保持为 javascript(高亮不丢): ' + JSON.stringify(h.langCalls))

  // 宿主主题切换(html class 变化)→ 防抖刷新,语言同样保持
  h.observerInsts[0].cb([{ type: 'attributes', attributeName: 'class' }])
  await new Promise((r) => setTimeout(r, 250))
  ok(h.langCalls.every((l) => l !== 'plaintext'), '主题刷新未重置语言: ' + JSON.stringify(h.langCalls))
  ok(h.langCalls.filter((l) => l === 'javascript').length >= 2, '主题刷新后语言仍为 javascript')
}

// ============ 场景 3:编辑器右键菜单中文化(nls 注入 + DOM 兜底文案) ============
{
  const h = loadBundle({ 0: true })
  // nls 注入:localize/localize2 按数字 id 查 _VSCODE_NLS_MESSAGES(与内置 monaco 实际 id 校准)
  const nlsPairs = [
    [63, 'Undo'], [65, 'Redo'], [67, 'Select All'], [701, 'Command Palette'], [726, 'Cut'], [730, 'Copy'], [734, 'Paste'],
    [922, 'Format Document'], [973, 'Go to Definition'], [975, 'Peek Definition'], [976, 'Go to Declaration'], [977, 'Peek Declaration'],
    [978, 'Go to Type Definition'], [979, 'Peek Type Definition'], [980, 'Go to Implementations'], [981, 'Peek Implementations'],
    [1167, 'Change All Occurrences'], [1204, 'Open to the Side'], [1242, 'Rename Symbol'],
  ]
  const nlsMissing = nlsPairs.filter(([id]) => !h.nls || typeof h.nls[id] !== 'string' || h.nls[id].length === 0)
  ok(nlsMissing.length === 0, 'nls 注入覆盖全部菜单项 id: ' + (nlsMissing.length ? nlsMissing.map(([id]) => id).join(',') : (nlsPairs.length + ' 项')))
  ok(h.nls && h.nls[973] === '转到定义', 'nls: Go to Definition(973) → 转到定义')
  ok(h.nls && h.nls[726] === '剪切', 'nls: Cut(726) → 剪切')
  // 模拟 monaco 的 localize 查找逻辑,验证注入后返回中文
  const lookup = (id, fallback) => { const n = (h.nls || {})[id]; return typeof n === 'string' ? n : fallback }
  ok(lookup(973, 'Go to Definition') === '转到定义', 'localize 查找逻辑返回中文')
  // DOM 兜底文案(覆盖 nls 之外的条目)
  const map = h.i18nMap
  const verified = ['Cut', 'Copy', 'Paste', 'Select All', 'Command Palette', 'Undo', 'Redo',
    'Go to Definition', 'Peek Definition', 'Go to Declaration', 'Go to Type Definition', 'Go to Implementation',
    'Peek Type Definition', 'Peek Implementation', 'Peek Declaration',
    'Change All Occurrences', 'Rename Symbol', 'Format Document', 'Open to the Side']
  const missing = verified.filter((k) => !map || typeof map[k] !== 'string' || map[k].length === 0)
  ok(missing.length === 0, 'DOM 兜底文案覆盖全部实际菜单项: ' + (missing.length ? missing.join(', ') : (Object.keys(map).length + ' 项')))
}

// ============ 场景 4:nls 注入与内置 monaco 的 localize 集成验证 ============
{
  // 从 monaco 构建中提取 nls 模块(ne[345]=messages 读取,ne[3]=localize),用最小 AMD shim 执行
  const monacoSrc = readFileSync(new URL('../lib/monaco/vs/editor/editor.main.js', import.meta.url), 'utf8')
  function extractDefine(anchor) {
    const start = monacoSrc.indexOf(anchor)
    if (start < 0) return null
    let depth = 0
    for (let i = start; i < monacoSrc.length; i++) {
      const c = monacoSrc[i]
      if (c === '(') depth++
      else if (c === ')') { depth--; if (depth === 0) return monacoSrc.slice(start, i + 1) }
    }
    return null
  }
  const def345 = extractDefine('define(ne[345],')
  const def3 = extractDefine('define(ne[3],')
  ok(def345 && def3, 'monaco nls 模块定义提取成功')
  if (def345 && def3) {
    const modules = {}
    const define = (id, deps, factory) => { modules[id] = { deps, factory } }
    const vm = await import('node:vm')
    const ctx = vm.createContext({ define, ne: { 3: 3, 345: 345 }, se: (x) => x, globalThis: null })
    ctx.globalThis = ctx
    ctx._VSCODE_NLS_MESSAGES = { 973: '转到定义', 726: '剪切' }
    vm.runInContext(def345, ctx)
    vm.runInContext(def3, ctx)
    const builtins = (name) => (name === 'exports' ? {} : undefined)
    const requireMod = (id) => {
      const mod = modules[id]
      if (!mod) throw new Error('missing module ' + id)
      const exports = {}
      // monaco 构建约定:依赖数组里 1=require, 0=exports, 其它为模块 id
      const args = mod.deps.map((dep) => {
        if (dep === 1) return (req) => requireMod(req)
        if (dep === 0) return exports
        return requireMod(dep)
      })
      mod.factory(...args)
      return exports
    }
    const nls = requireMod('3')
    ok(nls.localize(973, 'Go to Definition') === '转到定义', '真实 monaco localize 返回中文(973)')
    ok(nls.localize2(973, 'Go to Definition').value === '转到定义', '真实 monaco localize2 返回中文(973)')
    ok(nls.localize(99999, 'Unknown') === 'Unknown', '未注入的 id 回退英文')
  }
}

console.log(process.exitCode ? 'THEME/HIGHLIGHT TEST FAILED' : 'THEME/HIGHLIGHT TEST PASSED')
