function EditorSettingsSection() {
  var st = React.useState(loadEditorSettings());
  var settings = st[0], setSettings = st[1];
  var st2 = React.useState("func");
  var tab = st2[0], setTab = st2[1];
  var tabsRef = React.useRef(null);
  var indRef = React.useRef(null);

  React.useEffect(function () {
    var tabsEl = tabsRef.current;
    var ind = indRef.current;
    if (!tabsEl || !ind) return;
    var active = tabsEl.querySelector(".es-tab.active");
    if (active) {
      ind.style.left = active.offsetLeft + "px";
      ind.style.width = active.offsetWidth + "px";
    }
  }, [tab]);

  // 同步缩略图右键菜单等外部修改的设置
  React.useEffect(function () {
    function sync() { setSettings(loadEditorSettings()); }
    window.addEventListener("dsh-editor-settings", sync);
    return function () { window.removeEventListener("dsh-editor-settings", sync); };
  }, []);

  function update(patch) {
    var next = Object.assign({}, settings, patch);
    setSettings(next);
    saveEditorSettings(next);
    try { window.dispatchEvent(new CustomEvent("dsh-editor-settings")); } catch (e) {}
  }

  function switchRow(label, desc, key) {
    return React.createElement("div", { className: "es-row" },
      React.createElement("div", null,
        React.createElement("div", null, label),
        React.createElement("div", { className: "es-desc" }, desc)
      ),
      React.createElement("button", {
        className: "es-switch" + (settings[key] ? " on" : ""),
        onClick: function () { var p = {}; p[key] = !settings[key]; update(p); }
      })
    );
  }

  return React.createElement("div", null,
    React.createElement("div", { className: "es-tabs", ref: tabsRef },
      React.createElement("button", { className: "es-tab" + (tab === "func" ? " active" : ""), onClick: function () { setTab("func"); } }, "功能"),
      React.createElement("button", { className: "es-tab" + (tab === "appear" ? " active" : ""), onClick: function () { setTab("appear"); } }, "外观"),
      React.createElement("div", { className: "es-indicator", ref: indRef })
    ),
    tab === "func" ? React.createElement("div", null,
      switchRow("自动换行", "超出编辑器宽度的行自动折行", "wordWrap"),
      switchRow("隐藏行号", "不显示行号栏", "hideLineNumbers"),
      switchRow("代码高亮", "按文件类型进行语法高亮", "highlight"),
      switchRow("缩略图", "编辑器右侧显示代码缩略图", "minimap"),
      switchRow("自动保存", "内容变更后自动保存文件", "autoSave")
    ) : React.createElement("div", { className: "es-radio" },
      ["light", "dark", "system"].map(function (v) {
        var labels = { light: "日间", dark: "夜间", system: "跟随系统" };
        return React.createElement("label", { key: v, className: "es-radio-item" },
          React.createElement("input", {
            type: "radio",
            name: "es-appearance",
            checked: settings.appearance === v,
            onChange: function () { update({ appearance: v }); }
          }),
          labels[v]
        );
      })
    )
  );
}
