// Git 操作弹窗:提交 / 提交并推送 / 推送,支持 AI 生成提交信息(与官方 Git 插件样式一致)
function GitModal(props) {
  var gitBranch = props.gitBranch;
  var gitBranchMenu = props.gitBranchMenu;
  var gitMsg = props.gitMsg;
  var gitInclude = props.gitInclude;
  var gitBusy = props.gitBusy;
  var gitResult = props.gitResult;
  var gitData = props.gitData;
  var gitDiff = props.gitDiff;
  var onClose = props.onClose;
  var onToggleBranchMenu = props.onToggleBranchMenu;
  var onPickBranch = props.onPickBranch;
  var onMsgChange = props.onMsgChange;
  var onIncludeChange = props.onIncludeChange;
  var onCommit = props.onCommit;
  var onPush = props.onPush;
  var onGenAi = props.onGenAi;

  return React.createElement("div", { className: "gb-modal-mask", onClick: function (e) { if (e.target === e.currentTarget) onClose(); } },
    React.createElement("div", { className: "gb-modal" },
      React.createElement("div", { className: "gb-head" },
        React.createElement("span", { className: "gb-branch", onClick: function (e) { e.stopPropagation(); onToggleBranchMenu(); } },
          React.createElement("i", { className: "ri-git-branch-line" }),
          React.createElement("span", null, gitBranch || "分支"),
          React.createElement("i", { className: "ri-arrow-down-s-line" }),
          gitBranchMenu ? React.createElement("div", { className: "gb-branchmenu", onMouseDown: function (e) { e.stopPropagation(); }, onClick: function (e) { e.stopPropagation(); } },
            (gitData && gitData.branchList ? gitData.branchList : []).map(function (b) {
              return React.createElement("div", { key: b, className: "gb-branchitem" + (b === gitBranch ? " active" : ""), onClick: function () { onPickBranch(b); } }, b);
            })
          ) : null
        ),
        gitDiff ? React.createElement("span", { className: "gb-stat" },
          React.createElement("span", { className: "gb-stat-add" }, "+" + gitDiff.totalAdd),
          " ",
          React.createElement("span", { className: "gb-stat-del" }, "-" + gitDiff.totalDel)
        ) : null,
        (gitData && (gitData.ahead || gitData.behind)) ? React.createElement("span", { className: "gb-sub" }, (gitData.ahead ? "↑" + gitData.ahead : "") + (gitData.behind ? "↓" + gitData.behind : "")) : null
      ),
      React.createElement("div", { className: "gb-msgwrap" },
        React.createElement("textarea", {
          className: "gb-input",
          placeholder: "提交信息（留空将自动生成）",
          value: gitMsg,
          onChange: function (e) { onMsgChange(e.target.value); },
          onKeyDown: function (e) { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); onCommit(false); } }
        }),
        React.createElement("button", {
          className: "gb-ai",
          title: "AI 生成提交消息",
          disabled: gitBusy,
          onClick: onGenAi
        }, React.createElement("i", { className: gitBusy ? "ri-loader-4-line" : "ri-magic-line" }))
      ),
      React.createElement("label", { className: "gb-opt" },
        React.createElement("input", {
          type: "checkbox",
          checked: gitInclude,
          onChange: function (e) { onIncludeChange(e.target.checked); }
        }),
        "包含未暂存的更改",
        React.createElement("span", { className: "gb-sub" }, (gitData && gitData.files ? gitData.files.length : 0) + " 个文件")
      ),
      React.createElement("div", { className: "gb-btns" },
        React.createElement("button", { className: "gb-btn main", disabled: gitBusy, onClick: function () { onCommit(false); } }, "提交"),
        React.createElement("button", { className: "gb-btn", disabled: gitBusy, onClick: function () { onCommit(true); } }, "提交并推送"),
        React.createElement("button", { className: "gb-btn", disabled: gitBusy, onClick: onPush }, "推送")
      ),
      gitResult ? React.createElement("div", { className: "gb-msg " + (gitResult.ok ? "ok" : "err") }, gitResult.text) : null
    )
  );
}
