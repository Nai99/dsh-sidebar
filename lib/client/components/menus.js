// 各类弹出层:「更多」菜单 / 缩略图右键菜单(含二级) / 文件树右键菜单 / 标签右键菜单 / 状态栏切换弹窗
// 所有菜单的打开/关闭状态与外部点击关闭逻辑都归 SidebarPanel 管理,这里只负责渲染与回调

// 「更多」菜单:复制路径 / 在资源管理器打开
function MoreMenu(props) {
  var pos = props.pos;
  var menuRef = props.menuRef;
  var onCopyPath = props.onCopyPath;
  var onReveal = props.onReveal;

  return React.createElement("div", { className: "sb-menu", ref: menuRef, style: { top: pos.top, left: pos.left } },
    React.createElement("div", { className: "sb-menu-item", onClick: function () { onCopyPath(true); } }, "复制绝对路径"),
    React.createElement("div", { className: "sb-menu-item", onClick: function () { onCopyPath(false); } }, "复制相对路径"),
    React.createElement("div", { className: "sb-menu-item", onClick: onReveal }, "在资源管理器打开")
  );
}

// 缩略图右键菜单:开关 / 大小 / 滑块显示 / 渲染字符(含悬停展开的二级菜单)
function MinimapMenu(props) {
  var mmMenu = props.mmMenu;
  var mmSub = props.mmSub;
  var mmRef = props.mmRef;
  var mmSubEl = props.mmSubEl;
  var onSet = props.onSet;
  var onSubOpen = props.onSubOpen;
  var onSubClose = props.onSubClose;
  var onSubCancel = props.onSubCancel;

  return React.createElement(React.Fragment, null,
    React.createElement("div", { className: "sb-menu", ref: mmRef, style: { top: mmMenu.y, left: mmMenu.x } },
      React.createElement("div", { className: "sb-menu-item" + (editorSettings.minimap ? " on" : ""), onClick: function () { onSet({ minimap: !editorSettings.minimap }); } },
        React.createElement("span", null, "切换缩略图")),
      React.createElement("div", { className: "sb-menu-sep" }),
      React.createElement("div", { className: "sb-menu-item", onMouseEnter: function (e) { onSubOpen("size", e); }, onMouseLeave: onSubClose },
        React.createElement("span", null, "缩略图大小"),
        React.createElement("i", { className: "ri-arrow-right-s-line sb-subarrow" })),
      React.createElement("div", { className: "sb-menu-item", onMouseEnter: function (e) { onSubOpen("slider", e); }, onMouseLeave: onSubClose },
        React.createElement("span", null, "滑块显示"),
        React.createElement("i", { className: "ri-arrow-right-s-line sb-subarrow" })),
      React.createElement("div", { className: "sb-menu-sep" }),
      React.createElement("div", { className: "sb-menu-item" + (editorSettings.renderCharacters ? " on" : ""), onClick: function () { onSet({ renderCharacters: !editorSettings.renderCharacters }); } },
        React.createElement("span", null, "渲染字符"))
    ),
    mmSub ? React.createElement("div", { className: "sb-menu", ref: mmSubEl, style: { top: mmSub.y, left: mmSub.x, minWidth: 132 }, onMouseEnter: onSubCancel, onMouseLeave: onSubClose },
      (mmSub.which === "size" ? [["fit", "适应高度"], ["fill", "适应宽度"], ["proportional", "按比例缩放"]] : [["always", "总是显示"], ["mouseover", "悬停时显示"]]).map(function (o) {
        var active = mmSub.which === "size" ? editorSettings.minimapSize === o[0] : editorSettings.minimapSlider === o[0];
        return React.createElement("div", { key: o[0], className: "sb-menu-item" + (active ? " on" : ""), onClick: function () { onSet(mmSub.which === "size" ? { minimapSize: o[0] } : { minimapSlider: o[0] }); } },
          React.createElement("span", null, o[1]));
      })
    ) : null
  );
}

// 文件树右键菜单:打开 / 终端 / 上下文 / 复制 / 系统集成 / 重命名
function CtxMenu(props) {
  var menu = props.menu;
  var menuRef = props.menuRef;
  var onAct = props.onAct;
  var onOpenInEditor = props.onOpenInEditor;
  var onOpenInTerm = props.onOpenInTerm;
  var onAddContext = props.onAddContext;
  var onCopyRel = props.onCopyRel;
  var onCopyAbs = props.onCopyAbs;
  var onReveal = props.onReveal;
  var onVsc = props.onVsc;
  var onRename = props.onRename;

  return React.createElement("div", { className: "sb-menu", ref: menuRef, style: { top: menu.y, left: menu.x } },
    !menu.isDir ? React.createElement("div", { className: "sb-menu-item", onClick: onAct(onOpenInEditor) }, "在编辑器打开") : null,
    React.createElement("div", { className: "sb-menu-item", onClick: onAct(onOpenInTerm) }, "在终端打开"),
    !menu.isDir ? React.createElement("div", { className: "sb-menu-item", onClick: onAct(onAddContext) }, "添加至对话上下文") : null,
    React.createElement("div", { className: "sb-menu-sep" }),
    React.createElement("div", { className: "sb-menu-item", onClick: onAct(onCopyRel) }, "复制相对路径"),
    React.createElement("div", { className: "sb-menu-item", onClick: onAct(onCopyAbs) }, "复制绝对路径"),
    React.createElement("div", { className: "sb-menu-item", onClick: onAct(onReveal) }, "在文件管理器打开"),
    React.createElement("div", { className: "sb-menu-item", onClick: onAct(onVsc) }, "在 VS Code 打开"),
    React.createElement("div", { className: "sb-menu-sep" }),
    React.createElement("div", { className: "sb-menu-item", onClick: onAct(onRename) }, "重命名")
  );
}

// 标签右键菜单:关闭 / 关闭其他 / 关闭所有
function TabMenu(props) {
  var menu = props.menu;
  var menuRef = props.menuRef;
  var onClose = props.onClose;
  var onCloseOthers = props.onCloseOthers;
  var onCloseAll = props.onCloseAll;

  return React.createElement("div", { className: "sb-menu", ref: menuRef, style: { top: menu.y, left: menu.x } },
    React.createElement("div", { className: "sb-menu-item", onClick: onClose }, "关闭"),
    React.createElement("div", { className: "sb-menu-item", onClick: onCloseOthers }, "关闭其他标签"),
    React.createElement("div", { className: "sb-menu-item", onClick: onCloseAll }, "关闭所有标签")
  );
}

// 状态栏切换弹窗(全屏居中):转到行列 / 缩进 / 编码 / 行尾序列 / 语言模式
function StatusPopup(props) {
  var popup = props.popup;
  var menuRef = props.menuRef;
  var goLineVal = props.goLineVal;
  var onGoLineVal = props.onGoLineVal;
  var onGoToLine = props.onGoToLine;
  var onClose = props.onClose;
  var indentMode = props.indentMode;
  var indentSize = props.indentSize;
  var onApplyIndent = props.onApplyIndent;
  var encState = props.encState;
  var onApplyEncoding = props.onApplyEncoding;
  var eolState = props.eolState;
  var onApplyEol = props.onApplyEol;
  var langLabel = props.langLabel;
  var activeTab = props.activeTab;
  var onApplyLang = props.onApplyLang;

  return React.createElement("div", { className: "sb-modal-mask", onMouseDown: function (e) { if (e.target === e.currentTarget) onClose(); } },
    React.createElement("div", { className: "sb-modal", ref: menuRef },
      React.createElement("div", { className: "sb-modal-head" },
        React.createElement("span", null, { gotoline: "转到行列", indent: "选择缩进", encoding: "选择编码", eol: "选择行尾序列", lang: "选择语言模式" }[popup]),
        React.createElement("span", { className: "sb-spacer" }),
        React.createElement("button", { className: "sb-iconbtn", title: "关闭", onClick: onClose }, React.createElement("i", { className: "ri-close-line" }))
      ),
      React.createElement("div", { className: "sb-modal-body" },
        popup === "gotoline" ? React.createElement(React.Fragment, null,
          React.createElement("input", {
            className: "sb-search-plain",
            placeholder: "行:列",
            value: goLineVal,
            onChange: function (e) { onGoLineVal(e.target.value); },
            onKeyDown: function (e) { if (e.key === "Enter") onGoToLine(); },
            autoFocus: true
          }),
          React.createElement("div", { style: { display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 } },
            React.createElement("button", { className: "sb-save", onClick: onGoToLine }, "转到"),
            React.createElement("button", { className: "sb-save", onClick: onClose }, "取消")
          )
        ) :
        popup === "indent" ? React.createElement(React.Fragment, null,
          [2, 4, 8].map(function (v) {
            return React.createElement("div", { key: v, className: "sb-modal-item" + (indentMode === "spaces" && indentSize === v ? " on" : ""), onClick: function () { onApplyIndent(v); } }, "空格:" + v);
          }),
          React.createElement("div", { className: "sb-modal-item" + (indentMode === "tab" ? " on" : ""), onClick: function () { onApplyIndent("tab"); } }, "Tab 缩进")
        ) :
        popup === "encoding" ? ["utf-8", "gbk", "gb18030", "big5"].map(function (enc) {
          return React.createElement("div", { key: enc, className: "sb-modal-item" + (encState === enc.toUpperCase() ? " on" : ""), onClick: function () { onApplyEncoding(enc); } }, enc.toUpperCase());
        }) :
        popup === "eol" ? ["LF", "CRLF"].map(function (e2) {
          return React.createElement("div", { key: e2, className: "sb-modal-item" + (eolState === e2 ? " on" : ""), onClick: function () { onApplyEol(e2); } }, e2);
        }) :
        React.createElement("div", { className: "sb-modal-grid" },
          LANG_LIST.map(function (lg) {
            var curLang = langLabel || (editorSettings.highlight ? langOf(activeTab ? activeTab.name : "") : "plaintext");
            return React.createElement("div", { key: lg[0] + lg[1], className: "sb-modal-item" + (curLang === lg[0] ? " on" : ""), onClick: function () { onApplyLang(lg[0], lg[1]); } }, lg[1]);
          })
        )
      )
    )
  );
}
