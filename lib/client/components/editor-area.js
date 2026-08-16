// 编辑器区域:多标签栏(可拖拽排序)+ 面包屑导航 + Monaco/预览/二进制主体
function EditorArea(props) {
  var tabs = props.tabs;
  var contents = props.contents;
  var activePath = props.activePath;
  var onSetActive = props.onSetActive;
  var onCloseTab = props.onCloseTab;
  var dragTabRef = props.dragTabRef;
  var dragHover = props.dragHover;
  var setDragHover = props.setDragHover;
  var dragWRef = props.dragWRef;
  var onDragStart = props.onDragStart;
  var onDragOver = props.onDragOver;
  var onDrop = props.onDrop;
  var onTabMenu = props.onTabMenu;
  var root = props.root;
  var onToggleDir = props.onToggleDir;
  var msg = props.msg;
  var activeContent = props.activeContent;
  var activeIsMd = props.activeIsMd;
  var mdPreview = props.mdPreview;
  var onTogglePreview = props.onTogglePreview;
  var showPreview = props.showPreview;
  var onSave = props.onSave;
  var onOpenVscode = props.onOpenVscode;
  var moreRef = props.moreRef;
  var onMoreMenu = props.onMoreMenu;
  var monacoElRef = props.monacoElRef;

  // 面包屑:绝对路径全分段,仅工作区(含)起的目录可点击跳转;未打开文件时显示工作区绝对路径
  var crumbs = [];
  var crumbBase = activePath || root;
  if (crumbBase) {
    var rawParts = crumbBase.split(/[\\\/]/).filter(function (s) { return s.length > 0; });
    var rootLen = 0;
    if (root) rootLen = root.split(/[\\\/]/).filter(function (s) { return s.length > 0; }).length;
    var acc = "";
    for (var pi = 0; pi < rawParts.length; pi++) {
      var isDrive = pi === 0 && /^[A-Za-z]:$/.test(rawParts[pi]);
      acc = acc + rawParts[pi] + (isDrive ? "\\" : (pi < rawParts.length - 1 ? "/" : ""));
      var clickable = pi >= rootLen - 1;
      crumbs.push({
        name: rawParts[pi] + (isDrive ? "\\" : ""),
        path: acc,
        isFile: pi === rawParts.length - 1,
        locked: !clickable
      });
    }
  }

  // 计算拖拽插入位置:以各标签水平中点为界,返回"插入到第 N 个标签之前"(0..tabs.length)
  // 在标签间隙/容器空白处松手同样有效,与位移动画打开的插入位一致
  function dropIndexFromEvent(e) {
    var els = e.currentTarget.querySelectorAll(".sb-tab");
    var x = e.clientX;
    for (var k = 0; k < els.length; k++) {
      var r = els[k].getBoundingClientRect();
      if (x < r.left + r.width / 2) return k;
    }
    return els.length;
  }

  return React.createElement(React.Fragment, null,
    React.createElement("div", {
      className: "sb-tabs",
      onDragOver: function (e) { e.preventDefault(); onDragOver(dropIndexFromEvent(e), e); },
      onDrop: function (e) { onDrop(dropIndexFromEvent(e), e); }
    },
      tabs.map(function (t, idx) {
        var fi = fileIcon(t.name);
        var c = contents[t.path];
        var shift = 0;
        if (dragTabRef.current !== null && dragHover !== null && dragTabRef.current !== dragHover) {
          var tw = dragWRef.current;
          if (dragTabRef.current < dragHover && idx > dragTabRef.current && idx <= dragHover) shift = -tw;
          else if (dragTabRef.current > dragHover && idx >= dragHover && idx < dragTabRef.current) shift = tw;
        }
        return React.createElement("span", {
          key: t.path,
          className: "sb-tab" + (t.path === activePath ? " active" : "") + (dragTabRef.current === idx ? " dragging" : ""),
          style: shift ? { transform: "translateX(" + shift + "px)" } : undefined,
          onClick: function () { onSetActive(t.path); },
          title: t.path,
          draggable: true,
          onDragStart: function (e) { onDragStart(idx, e); },
          onDragEnd: function () { dragTabRef.current = null; setDragHover(null); },
          onContextMenu: function (e) { onTabMenu(e, t.path); }
        },
          React.createElement("i", { className: fi[0], style: { color: fi[1] } }),
          React.createElement("span", null, t.name + (c && c.dirty ? " ●" : "")),
          React.createElement("span", { className: "sb-tab-x", onClick: function (e) { e.stopPropagation(); onCloseTab(t.path); } }, "\u2715")
        );
      }),
      React.createElement("span", { className: "sb-spacer" })
    ),
    crumbBase ? React.createElement("div", { className: "sb-breadcrumbs" },
      crumbs.map(function (c, i) {
        return React.createElement("span", { key: i, style: { display: "inline-flex", alignItems: "center" } },
          i > 0 ? React.createElement("span", { style: { color: "var(--dsw-alias-label-tertiary)", margin: "0 2px" } }, "/") : null,
          React.createElement("span", {
            className: "sb-crumb" + (c.locked ? " locked" : ""),
            style: c.isFile ? { color: "var(--dsw-alias-label-primary)" } : undefined,
            title: c.path,
            onClick: function () { if (!c.locked && !c.isFile) onToggleDir(c.path, c.name); }
          }, c.name)
        );
      }),
      React.createElement("span", { className: "sb-msg", style: { margin: "0 6px" } }, msg),
      React.createElement("span", { className: "sb-spacer" }),
      activeContent && activeContent.dirty ? React.createElement("button", { className: "sb-save", onClick: onSave }, "保存") : null,
      activeIsMd ? React.createElement("button", { className: "sb-iconbtn", title: mdPreview ? "切换到代码视图" : "切换到预览视图", onClick: onTogglePreview },
        React.createElement("i", { className: mdPreview ? "ri-code-s-slash-line" : "ri-eye-line" })
      ) : null,
      React.createElement("button", { className: "sb-iconbtn", title: "在 VS Code 中打开", onClick: function () { onOpenVscode(activePath); } },
        React.createElement("img", { src: "/dsh-sidebar/vscode.svg", width: 15, height: 15, alt: "VS Code", style: { display: "block" } })
      ),
      React.createElement("button", { ref: moreRef, className: "sb-iconbtn", title: "更多", onClick: onMoreMenu }, React.createElement("i", { className: "ri-more-fill" }))
    ) : React.createElement("div", { className: "sb-breadcrumbs" }, React.createElement("span", { className: "sb-msg" }, msg)),
    React.createElement(React.Fragment, null,
      React.createElement("div", {
        className: "sb-editor-body",
        ref: monacoElRef,
        style: (activeContent && !showPreview && !activeContent.binary) ? undefined : { display: "none" }
      }),
      activeContent ? null : React.createElement("div", { className: "sb-empty", style: { position: "absolute", inset: 0 } }, "加载中…"),
      React.createElement("div", { className: "sb-preview", style: showPreview ? undefined : { display: "none" } },
        showPreview ? React.createElement("div", { className: "sb-md", dangerouslySetInnerHTML: { __html: mdToHtml(activeContent.content) } }) : null
      ),
      activeContent && activeContent.binary === "image" ? React.createElement("div", { className: "sb-binary" },
        React.createElement("img", {
          src: "/dsh-sidebar/raw?cwd=" + encodeURIComponent(root) + "&path=" + encodeURIComponent(activePath),
          alt: baseName(activePath),
          style: { maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 6 }
        })
      ) : null,
      activeContent && activeContent.binary === true ? React.createElement("div", { className: "sb-binary" },
        React.createElement("i", { className: "ri-file-bin-line" }),
        React.createElement("div", { className: "sb-binary-msg" }, "此文件是二进制文件或使用了不受支持的文本编码，所以无法在文本编辑器中显示")
      ) : null
    )
  );
}
