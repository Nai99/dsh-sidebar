var monacoReady = null;
var monacoI18nInstalled = false;
// Monaco 右键菜单中文化(构建无 setLocale,通过观察菜单 DOM 替换文案)
function installMonacoI18n() {
  if (monacoI18nInstalled || typeof MutationObserver === "undefined") return;
  monacoI18nInstalled = true;
  var MAP = {
    "Cut": "剪切", "Copy": "复制", "Paste": "粘贴", "Select All": "全选", "Command Palette": "命令面板",
    "Undo": "撤销", "Redo": "重做", "Open to the Side": "在侧边打开", "Open": "打开", "Copy as JSON": "复制为 JSON",
    "Go to Definition": "转到定义", "Peek Definition": "速览定义", "Go to Type Definition": "转到类型定义",
    "Peek Type Definition": "速览类型定义", "Go to Implementation": "转到实现", "Peek Implementation": "速览实现",
    "Find All References": "查找所有引用", "Change All Occurrences": "更改所有匹配项",
    "Format Document": "格式化文档", "Rename Symbol": "重命名符号", "Show References": "显示引用"
  };
  var mo = new MutationObserver(function () {
    var labels = document.querySelectorAll(".monaco-menu .action-label");
    for (var i = 0; i < labels.length; i++) {
      var el = labels[i];
      if (el.getAttribute("data-dsh-i18n")) continue;
      var txt = el.textContent;
      if (txt && MAP[txt]) { el.setAttribute("data-dsh-i18n", "1"); el.textContent = MAP[txt]; }
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });
}
function loadMonaco(cb) {
  if (window.monaco && window.monaco.editor) { cb(); return; }
  function boot() {
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
