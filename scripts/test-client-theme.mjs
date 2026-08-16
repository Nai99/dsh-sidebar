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
const patched = src.replace('return module.exports; } });', 'return { panel: SidebarPanel }; } });')

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
    fakeEditor, documentStub, refs: refPool,
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

console.log(process.exitCode ? 'THEME/HIGHLIGHT TEST FAILED' : 'THEME/HIGHLIGHT TEST PASSED')
