// 文件树:递归渲染目录节点(懒加载),输入变化时不再重渲染整棵树
function FileTree(props) {
  var root = props.root;
  var tree = props.tree;
  var expanded = props.expanded;
  var activePath = props.activePath;
  var ctxSelPath = props.ctxSelPath;
  var onToggleDir = props.onToggleDir;
  var onOpenFile = props.onOpenFile;
  var onCtxOpen = props.onCtxOpen;

  function renderNode(e, p, depth) {
    var full = p + sepOf(p) + e.name;
    var isDir = e.dir;
    var isExp = !!expanded[full];
    var style = { paddingLeft: 6 + depth * 14 };
    var icon;
    if (isDir) icon = React.createElement("i", { className: isExp ? "ri-folder-open-fill" : "ri-folder-fill", style: { color: "#dcb67a" } });
    else {
      var fi = fileIcon(e.name);
      icon = React.createElement("i", { className: fi[0], style: { color: fi[1] } });
    }
    return React.createElement("div", { key: full },
      React.createElement("div", {
        className: "sb-node" + (full === activePath ? " active" : "") + (full === ctxSelPath ? " ctx" : ""),
        style: style,
        title: full,
        onClick: function () { if (isDir) onToggleDir(full, e.name); else onOpenFile(full, e.name); },
        onContextMenu: function (ev) { onCtxOpen(ev, full, e.name, isDir); }
      },
        React.createElement("span", { className: "sb-arrow" }, isDir ? (isExp ? "▾" : "▸") : ""),
        icon,
        React.createElement("span", { className: "sb-fname" }, e.name)
      ),
      isDir && isExp && tree[full] ? tree[full].map(function (c) { return renderNode(c, full, depth + 1); }) : null
    );
  }

  return React.useMemo(function () {
    if (!root) return React.createElement("div", { className: "sb-node", style: { color: "var(--dsw-alias-label-tertiary)" } }, "未检测到工作区");
    if (!tree[root]) return React.createElement("div", { className: "sb-node", style: { color: "var(--dsw-alias-label-tertiary)" } }, "加载中…");
    return tree[root].map(function (e) { return renderNode(e, root, 0); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tree, expanded, activePath, ctxSelPath, root]);
}
