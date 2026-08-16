// Git 面板:分支 + 领先/落后 + 每文件状态标记 + 增删统计(数据来自本插件内置 git 路由)
function GitPanel(props) {
  var exTab = props.exTab;
  var gitData = props.gitData;
  var gitDiff = props.gitDiff;
  var onOpenModal = props.onOpenModal;

  var style = { display: exTab === "git" ? undefined : "none" };

  if (!gitData || !gitData.repo) {
    var msg = (gitData && gitData.reason) ? "Git 不可用: " + gitData.reason : "未检测到 Git 仓库";
    return React.createElement("div", { className: "sb-git", style: style },
      React.createElement("div", { className: "sb-node", style: { color: "var(--dsw-alias-label-tertiary)" } }, msg)
    );
  }

  return React.createElement("div", { className: "sb-git", style: style },
    React.createElement("div", { className: "sb-git-branchrow" },
      React.createElement("div", { className: "sb-git-branch" },
        React.createElement("i", { className: "ri-git-branch-line" }),
        React.createElement("span", null, (gitData.branch || "HEAD") + ((gitData.ahead || gitData.behind) ? " ↑" + gitData.ahead + " ↓" + gitData.behind : ""))
      ),
      React.createElement("span", { className: "sb-spacer" }),
      gitDiff ? React.createElement("span", { className: "sb-git-nums" },
        React.createElement("span", { className: "sb-git-add" }, "+" + gitDiff.totalAdd),
        React.createElement("span", { className: "sb-git-del" }, "\u2212" + gitDiff.totalDel)
      ) : null
    ),
    React.createElement("div", { className: "sb-git-files" },
      (gitData.files && gitData.files.length) ? gitData.files.map(function (f, i) {
        var st = f.status === "??" ? "U" : f.status.charAt(0);
        var g = { U: "\u25CF", D: "\u2212" }[st];
        var cls = st === "U" ? "U" : (st === "D" ? "D" : "A"); // M/R/其它统一为绿色加
        return React.createElement("div", { key: i, className: "sb-git-file", title: f.path },
          React.createElement("span", { className: "sb-git-st " + cls }, g === undefined ? "+" : g),
          React.createElement("span", { style: { overflow: "hidden", textOverflow: "ellipsis" } }, f.path)
        );
      }) : React.createElement("div", { className: "sb-node", style: { color: "var(--dsw-alias-label-tertiary)" } }, "工作区干净,无变更")
    ),
    React.createElement("div", { className: "sb-git-actions" },
      React.createElement("button", { className: "sb-git-act", title: "Git 操作", onClick: onOpenModal }, "操作")
    )
  );
}
