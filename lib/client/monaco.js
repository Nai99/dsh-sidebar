var monacoReady = null;
var monacoI18nInstalled = false;
// 内置 monaco 的 nls 消息表:localize/localize2 按数字 id 查 globalThis._VSCODE_NLS_MESSAGES,
// 在加载 editor.main.js 前注入,右键菜单等原生渲染为中文(比 DOM 替换可靠)
var MONACO_NLS = {
  63: "撤销", 65: "重做", 67: "全选",
  701: "命令面板", 726: "剪切", 730: "复制", 734: "粘贴",
  922: "格式化文档",
  973: "转到定义", 975: "速览定义", 976: "转到声明", 977: "速览声明",
  978: "转到类型定义", 979: "速览类型定义", 980: "转到实现", 981: "速览实现",
  1167: "更改所有匹配项", 1204: "在侧边打开", 1242: "重命名符号"
};
function installMonacoNls() {
  try {
    if (!globalThis._VSCODE_NLS_MESSAGES) globalThis._VSCODE_NLS_MESSAGES = MONACO_NLS;
  } catch (e) { /* ignore */ }
}
// 右键菜单中文化文案(与内置 monaco 版本的实际标签校准,缺失的文案无需保留)
var MONACO_MENU_I18N = {
  "Cut": "剪切", "Copy": "复制", "Paste": "粘贴", "Select All": "全选", "Command Palette": "命令面板",
  "Undo": "撤销", "Redo": "重做", "Open to the Side": "在侧边打开", "Open": "打开",
  "Go to Definition": "转到定义", "Peek Definition": "速览定义", "Go to Declaration": "转到声明", "Peek Declaration": "速览声明",
  "Go to Type Definition": "转到类型定义", "Peek Type Definition": "速览类型定义",
  "Go to Implementation": "转到实现", "Peek Implementation": "速览实现",
  "Change All Occurrences": "更改所有匹配项", "Select All Occurrences": "选中所有匹配项",
  "Format Document": "格式化文档", "Rename Symbol": "重命名符号"
};
function translateMonacoMenu() {
  var labels = document.querySelectorAll(".monaco-menu .action-label");
  for (var i = 0; i < labels.length; i++) {
    var el = labels[i];
    var txt = el.textContent;
    if (txt && MONACO_MENU_I18N[txt]) el.textContent = MONACO_MENU_I18N[txt];
  }
}
// 构建无 setLocale,通过观察菜单 DOM 替换文案;monaco 可能重建标签覆盖翻译,定时清扫兜底
function installMonacoI18n() {
  if (monacoI18nInstalled || typeof MutationObserver === "undefined") return;
  monacoI18nInstalled = true;
  var mo = new MutationObserver(translateMonacoMenu);
  mo.observe(document.body, { childList: true, subtree: true });
  setInterval(function () {
    if (document.querySelector(".monaco-menu")) translateMonacoMenu();
  }, 400);
}
function loadMonaco(cb) {
  installMonacoNls(); // 先注入 nls 翻译,菜单原生中文
  installMonacoI18n(); // 覆盖 window.monaco 已存在(预加载)的路径
  if (window.monaco && window.monaco.editor) { cb(); return; }
  function boot() {
    installMonacoNls();
    installMonacoI18n();
    // 语言服务的 web worker 用同源 URL 加载(workerMain.js#label);
    // 不设置时 monaco 会创建 blob worker,Firefox 的 blob worker 内 fetch('/dsh-sidebar/...') 无法解析
    if (typeof self !== "undefined" && !(self.MonacoEnvironment && typeof self.MonacoEnvironment.getWorkerUrl === "function")) {
      self.MonacoEnvironment = self.MonacoEnvironment || {};
      self.MonacoEnvironment.getWorkerUrl = function (moduleId, label) {
        return "/dsh-sidebar/monaco/vs/base/worker/workerMain.js#" + label;
      };
    }
    window.require.config({ paths: { vs: "/dsh-sidebar/monaco/vs" } });
    window.require(["vs/editor/editor.main"], function () { cb(); });
  }
  if (window.require && window.require.config) { boot(); return; }
  if (!monacoReady) {
    monacoReady = new Promise(function (resolve) {
      var s = document.createElement("script");
      s.src = "/dsh-sidebar/monaco/vs/loader.js";
      s.onload = function () { boot(); resolve(); };
      document.head.appendChild(s);
    });
  }
  monacoReady.then(cb);
}
