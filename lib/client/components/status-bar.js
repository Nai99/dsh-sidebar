// 状态栏:行/列、缩进、编码、行尾序列、语言模式(点击由 onOpen 弹出切换弹窗)
function StatusBar(props) {
  var hasEditorFile = props.hasEditorFile;
  var cursorPos = props.cursorPos;
  var indentSize = props.indentSize;
  var indentMode = props.indentMode;
  var encState = props.encState;
  var eolState = props.eolState;
  var langLabel = props.langLabel;
  var activeTab = props.activeTab;
  var onOpen = props.onOpen;

  return React.createElement("div", { className: "sb-status" },
    React.createElement("button", { className: "sb-st-seg" + (hasEditorFile ? "" : " off"), title: "转到行列", onClick: function () { if (hasEditorFile) onOpen("gotoline"); } }, hasEditorFile ? "行" + cursorPos.line + "列" + cursorPos.col : ""),
    React.createElement("button", { className: "sb-st-seg" + (hasEditorFile ? "" : " off"), title: "选择缩进", onClick: function () { if (hasEditorFile) onOpen("indent"); } }, hasEditorFile ? "空格:" + (indentMode === "tab" ? "Tab" : indentSize) : ""),
    React.createElement("button", { className: "sb-st-seg" + (hasEditorFile ? "" : " off"), title: "选择编码", onClick: function () { if (hasEditorFile) onOpen("encoding"); } }, hasEditorFile ? encState : ""),
    React.createElement("button", { className: "sb-st-seg" + (hasEditorFile ? "" : " off"), title: "选择行尾序列", onClick: function () { if (hasEditorFile) onOpen("eol"); } }, hasEditorFile ? eolState : ""),
    React.createElement("button", { className: "sb-st-seg" + (hasEditorFile ? "" : " off"), title: "选择语言模式", onClick: function () { if (hasEditorFile) onOpen("lang"); } },
      hasEditorFile ? React.createElement(React.Fragment, null,
        React.createElement("i", { className: "ri-braces-line" }),
        React.createElement("span", null, langLabel || (editorSettings.highlight ? langOf(activeTab ? activeTab.name : "") : "plaintext"))
      ) : null
    )
  );
}
