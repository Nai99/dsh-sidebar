// 终端面板:多标签 + shell 切换 + 拖拽调高(位于状态栏上方,挤压编辑器)
function TerminalPanel(props) {
  var termOpen = props.termOpen;
  var termHeight = props.termHeight;
  var termTabs = props.termTabs;
  var termActive = props.termActive;
  var termShell = props.termShell;
  var termMenu = props.termMenu;
  var termPanelRef = props.termPanelRef;
  var termTypeRef = props.termTypeRef;
  var termMenuRef = props.termMenuRef;
  var onSetActive = props.onSetActive;
  var onCloseTab = props.onCloseTab;
  var onNewTerm = props.onNewTerm;
  var onSetOpen = props.onSetOpen;
  var onToggleType = props.onToggleType;
  var onPickShell = props.onPickShell;

  return React.createElement("div", { ref: termPanelRef, className: "sb-term-panel", style: { display: termOpen ? undefined : "none", height: termHeight } },
    React.createElement("div", { className: "sb-term-resize", id: "sb-term-resize", title: "拖拽调整高度" }),
    React.createElement("div", { className: "sb-term-head" },
      React.createElement("span", { className: "sb-term-brand" },
        React.createElement("i", { className: "ri-terminal-box-line" }),
        "终端"
      ),
      React.createElement("div", { className: "sb-term-tabs" },
        termTabs.map(function (t) {
          return React.createElement("span", { key: t.id, className: "sb-term-tab" + (t.id === termActive ? " active" : ""), onClick: function () { onSetActive(t.id); }, title: t.cwd || "" },
            React.createElement("i", { className: "ri-terminal-line" }),
            React.createElement("span", null, t.label),
            React.createElement("span", { className: "sb-term-tab-x", onClick: function (e) { e.stopPropagation(); onCloseTab(t.id); } }, "\u2715")
          );
        })
      ),
      React.createElement("div", { className: "sb-term-capsule" },
        React.createElement("button", { ref: termTypeRef, className: "sb-term-type", title: "终端类型(用于新终端)", onClick: onToggleType },
          termShell === "pwsh" ? "PowerShell" : "Bash",
          React.createElement("i", { className: "ri-arrow-down-s-line", style: { fontSize: 12 } })
        ),
        React.createElement("span", { className: "sb-term-capsule-sep" }),
        React.createElement("button", { className: "sb-term-capsule-new", title: "新建终端", onClick: onNewTerm }, React.createElement("i", { className: "ri-add-line" }))
      ),
      React.createElement("button", { className: "sb-term-close", title: "关闭终端面板", onClick: function () { onSetOpen(false); } }, React.createElement("i", { className: "ri-close-line" }))
    ),
    termMenu ? React.createElement("div", { className: "sb-menu", ref: termMenuRef, style: { top: termMenu.y, left: termMenu.x } },
      React.createElement("div", { className: "sb-menu-item", onClick: function () { onPickShell("bash"); } }, "Bash" + (termShell === "bash" ? " ✓" : "")),
      React.createElement("div", { className: "sb-menu-item", onClick: function () { onPickShell("pwsh"); } }, "PowerShell" + (termShell === "pwsh" ? " ✓" : ""))
    ) : null,
    React.createElement("div", { className: "sb-term-body" },
      termTabs.map(function (t) {
        return React.createElement("div", { key: t.id, id: "sb-term-" + t.id, className: "sb-term", style: { display: t.id === termActive ? undefined : "none" } });
      })
    )
  );
}
