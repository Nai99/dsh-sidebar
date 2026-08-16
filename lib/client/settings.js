// 编辑器设置(持久化 localStorage + 事件广播)
var EDITOR_SETTINGS_KEY = "dsh-editor-settings";
var editorSettings = { wordWrap: true, hideLineNumbers: false, highlight: true, appearance: "system", minimap: true, minimapSize: "proportional", minimapSlider: "mouseover", renderCharacters: true, autoSave: false };
function loadEditorSettings() {
  try {
    var raw = localStorage.getItem(EDITOR_SETTINGS_KEY);
    if (raw) {
      var j = JSON.parse(raw);
      editorSettings = Object.assign({}, editorSettings, j);
    }
  } catch (e) {}
  return editorSettings;
}
function saveEditorSettings(s) {
  editorSettings = s;
  try { localStorage.setItem(EDITOR_SETTINGS_KEY, JSON.stringify(s)); } catch (e) {}
}
// 判断应用实际主题(深/浅):以 --dsw-alias-bg-base 的亮度为准,与 OS 的 prefers-color-scheme 解耦
// (dsh 应用主题与系统设置可能不一致,若按系统判断,未高亮文本会用错 base 颜色)
function appIsDark() {
  try {
    var c = cssColor("--dsw-alias-bg-base", "#0f1115");
    var m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(c);
    if (m) {
      var r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16);
      return (0.299 * r + 0.587 * g + 0.114 * b) < 128;
    }
  } catch (e) { /* ignore */ }
  return true;
}
function editorThemeName() {
  var dark = true;
  if (editorSettings.appearance === "light") dark = false;
  else if (editorSettings.appearance === "dark") dark = true;
  else dark = appIsDark(); // 跟随系统 = 跟随应用实际主题
  return dark ? "ds-transparent-dark" : "ds-transparent-light";
}
// 解析 CSS 变量为实际颜色,统一转成 #RRGGBB(A) 十六进制(Monaco 主题仅支持 hex,其它格式会解析失败变红)
function hexOf(v) {
  var s = Math.max(0, Math.min(255, Math.round(v))).toString(16);
  return s.length < 2 ? "0" + s : s;
}
function rgbaToHex(c) {
  var out = "#" + hexOf(c[0]) + hexOf(c[1]) + hexOf(c[2]);
  if (c[3] !== undefined && c[3] < 1) out += hexOf(c[3] * 255);
  return out;
}
function parseRgb(s) {
  s = String(s).trim();
  if (s.charAt(0) === "#") {
    var hx = s.slice(1);
    if (hx.length === 3 || hx.length === 4) hx = hx.split("").map(function (c) { return c + c; }).join("");
    if (hx.length >= 6) {
      var n = parseInt(hx.slice(0, 6), 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255, hx.length >= 8 ? parseInt(hx.slice(6, 8), 16) / 255 : 1];
    }
    return null;
  }
  var m = s.match(/[\d.]+/g);
  return m ? [+m[0], +(m[1] || 0), +(m[2] || 0), m[3] === undefined ? 1 : +m[3]] : null;
}
function cssColor(name, fallback) {
  try {
    var probe = document.createElement("span");
    probe.style.cssText = "position:fixed;left:-9999px;top:0;background:var(" + name + ");visibility:hidden";
    document.body.appendChild(probe);
    var c = getComputedStyle(probe).backgroundColor;
    document.body.removeChild(probe);
    var p = parseRgb(c);
    if (p && !(p[3] === 0)) return rgbaToHex(p);
  } catch (e) {}
  return fallback;
}
function mix(a, b, t) {
  var A = parseRgb(a), B = parseRgb(b);
  if (!A || !B) return a;
  return rgbaToHex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t, A[3] + (B[3] - A[3]) * t]);
}
function ensureMonacoThemes() {
  if (!window.monaco || !window.monaco.editor) return;
  var base = cssColor("--dsw-alias-bg-base", "#0f1115");
  var codeBg = cssColor("--dsw-alias-markdown-code-block", base); // 官方代码块背景
  var bg2 = cssColor("--dsw-alias-bg-layer-2", "#2c2c2e");
  var border = cssColor("--dsw-alias-border-l2", "#3f3f46");
  var label1 = cssColor("--dsw-alias-label-primary", "#e4e4e7");
  var label2 = cssColor("--dsw-alias-label-secondary", "#a1a1aa");
  var label3 = cssColor("--dsw-alias-label-tertiary", "#71717a");
  var brand = cssColor("--dsw-alias-brand-primary", "#4fc1ff");
  var clear = "rgba(0,0,0,0)";
  var colors = {
    "editor.background": codeBg,
    // 未高亮(plaintext)文本显式跟随 label-primary,避免受 base(vs/vs-dark) 日间/夜间默认值影响
    "editor.foreground": label1,
    "editorGutter.background": codeBg,
    "minimap.background": codeBg,
    "minimapSlider.background": mix(label2, clear, 0.4),
    "minimapSlider.hoverBackground": mix(label2, clear, 0.3),
    "minimapSlider.activeBackground": mix(label2, clear, 0.2),
    "scrollbarSlider.background": cssColor("--dsw-alias-scrollbar-bg-l1", "#3c3c3d"),
    "scrollbarSlider.hoverBackground": cssColor("--dsw-alias-scrollbar-hover-l1", "#545557"),
    "scrollbarSlider.activeBackground": cssColor("--dsw-alias-scrollbar-hover-l2", "#65676b"),
    "editorWidget.background": bg2,
    "editorWidget.border": border,
    "editorWidget.resizeBorder": border,
    "editorSuggestWidget.background": bg2,
    "editorSuggestWidget.border": border,
    "editorSuggestWidget.selectedBackground": mix(bg2, label1, 0.18),
    "editorSuggestWidget.foreground": label1,
    "editorSuggestWidget.highlightForeground": brand,
    "editorSuggestWidget.focusHighlightForeground": brand,
    "editorHoverWidget.background": bg2,
    "editorHoverWidget.border": border,
    "editorHoverWidget.foreground": label1,
    "editor.hoverHighlightBackground": cssColor("--dsw-alias-interactive-bg-hover", "rgba(255, 255, 255, 0.08)"),
    "editor.findMatchBackground": mix(label2, clear, 0.4),
    "editor.findMatchBorder": label2,
    "editor.findMatchHighlightBackground": mix(label2, clear, 0.22),
    "editor.findRangeHighlightBackground": mix(label2, clear, 0.15),
    "editor.selectionBackground": mix(label2, clear, 0.35),
    "editor.selectionHighlightBackground": mix(label2, clear, 0.18),
    "editor.lineHighlightBackground": cssColor("--dsw-alias-interactive-bg-hover", "rgba(255, 255, 255, 0.08)"),
    "editor.lineHighlightBorder": cssColor("--dsw-alias-interactive-bg-hover", "rgba(255, 255, 255, 0.08)"),
    "editorLineNumber.foreground": label3,
    "editorLineNumber.activeForeground": label1,
    "editorCursor.foreground": label1,
    "editorMarkerNavigation.background": bg2
  };
  window.monaco.editor.defineTheme("ds-transparent-dark", { base: "vs-dark", inherit: true, rules: [], colors: colors });
  window.monaco.editor.defineTheme("ds-transparent-light", { base: "vs", inherit: true, rules: [], colors: colors });
}
