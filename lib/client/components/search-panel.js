// 搜索面板:全文搜索 + 替换,结果分组展示 + 虚拟滚动
function SearchPanel(props) {
  var exTab = props.exTab;
  var searchQ = props.searchQ;
  var setSearchQ = props.setSearchQ;
  var onClearSearch = props.onClearSearch;
  var scheduleSearch = props.scheduleSearch;
  var searchTimerRef = props.searchTimerRef;
  var searchMC = props.searchMC;
  var setSearchMC = props.setSearchMC;
  var searchWW = props.searchWW;
  var setSearchWW = props.setSearchWW;
  var searchRX = props.searchRX;
  var setSearchRX = props.setSearchRX;
  var doSearch = props.doSearch;
  var detailsOpen = props.detailsOpen;
  var setDetailsOpen = props.setDetailsOpen;
  var replQ = props.replQ;
  var setReplQ = props.setReplQ;
  var searchPC = props.searchPC;
  var setSearchPC = props.setSearchPC;
  var doReplace = props.doReplace;
  var filesFilterOpen = props.filesFilterOpen;
  var setFilesFilterOpen = props.setFilesFilterOpen;
  var incQ = props.incQ;
  var setIncQ = props.setIncQ;
  var excQ = props.excQ;
  var setExcQ = props.setExcQ;
  var searchModifiedOnly = props.searchModifiedOnly;
  var setSearchModifiedOnly = props.setSearchModifiedOnly;
  var searchOpenOnly = props.searchOpenOnly;
  var setSearchOpenOnly = props.setSearchOpenOnly;
  var searchMsg = props.searchMsg;
  var searchBusy = props.searchBusy;
  var searchRes = props.searchRes;
  var searchGroups = props.searchGroups;
  var collapsedGroups = props.collapsedGroups;
  var onToggleGroup = props.onToggleGroup;
  var onOpenAt = props.onOpenAt;
  var onExclude = props.onExclude;
  var onReplaceFile = props.onReplaceFile;
  var onReplaceLine = props.onReplaceLine;
  var onToggleOpenOnly = props.onToggleOpenOnly;
  var onOpenSearchEditor = props.onOpenSearchEditor;
  var resScrollRef = props.resScrollRef;
  var resWin = props.resWin;
  var setResWin = props.setResWin;
  var resFlatLenRef = props.resFlatLenRef;

  // 扁平化结果(虚拟滚动用):组头 + 匹配行
  var resFlat = [];
  if (searchGroups) {
    var gFirst = true;
    Object.keys(searchGroups).forEach(function (p) {
      var ms = searchGroups[p];
      var grpCollapsed = !!collapsedGroups[p];
      resFlat.push({ t: "g", p: p, ms: ms, grpCollapsed: grpCollapsed, first: gFirst });
      gFirst = false;
      if (!grpCollapsed) ms.forEach(function (r) { resFlat.push({ t: "r", r: r }); });
    });
  }
  resFlatLenRef.current = resFlat.length;

  // 新搜索结果:重置滚动窗口
  React.useEffect(function () {
    setResWin({ start: 0, end: 80 });
    if (resScrollRef.current) resScrollRef.current.scrollTop = 0;
  }, [searchRes]);

  function onResScroll() {
    var el = resScrollRef.current;
    if (!el) return;
    var per = 27;
    var start = Math.max(0, Math.floor(el.scrollTop / per) - 24);
    var end = Math.min(resFlatLenRef.current, Math.ceil((el.scrollTop + el.clientHeight) / per) + 24);
    setResWin(function (prev) { return (prev.start === start && prev.end === end) ? prev : { start: start, end: end }; });
  }

  return React.createElement("div", { className: "sb-search", style: { display: exTab === "search" ? undefined : "none" } },
    React.createElement("div", { className: "sb-search-head" },
      React.createElement("span", { className: "sb-search-title" }, "搜索"),
      React.createElement("span", { className: "sb-spacer" }),
      React.createElement("button", { className: "sb-iconbtn", title: "重新搜索", onClick: function () { doSearch(); } }, React.createElement("i", { className: "ri-refresh-line" })),
      React.createElement("button", { className: "sb-iconbtn", title: "清除结果", onClick: onClearSearch }, React.createElement("i", { className: "ri-close-circle-line" })),
      React.createElement("button", { className: "sb-iconbtn", title: "新建搜索", onClick: onClearSearch }, React.createElement("i", { className: "ri-file-add-line" }))
    ),
    React.createElement("div", { className: "sb-search-main" },
      React.createElement("button", { className: "sb-search-opt sb-search-collapse", title: detailsOpen ? "收起替换栏" : "展开替换栏", onClick: function () { setDetailsOpen(!detailsOpen); } },
        React.createElement("i", { className: detailsOpen ? "ri-arrow-down-s-line" : "ri-arrow-right-s-line" })
      ),
      React.createElement("div", { className: "sb-search-right" },
        React.createElement("div", { className: "sb-search-box" },
          React.createElement("input", {
            className: "sb-search-input",
            placeholder: "搜索",
            value: searchQ,
            onChange: function (e) { var v = e.target.value; setSearchQ(v); scheduleSearch(v); },
            onKeyDown: function (e) { if (e.key === "Enter") { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); doSearch(); } }
          }),
          React.createElement("button", { className: "sb-search-opt" + (searchMC ? " on" : ""), title: "区分大小写", onClick: function () { var nv = !searchMC; setSearchMC(nv); doSearch(searchQ, { mc: nv }); } }, "Aa"),
          React.createElement("button", { className: "sb-search-opt" + (searchWW ? " on" : ""), title: "全字匹配", onClick: function () { var nv = !searchWW; setSearchWW(nv); doSearch(searchQ, { ww: nv }); } }, "ab|"),
          React.createElement("button", { className: "sb-search-opt" + (searchRX ? " on" : ""), title: "使用正则表达式", onClick: function () { var nv = !searchRX; setSearchRX(nv); doSearch(searchQ, { rx: nv }); } }, ".*")
        ),
        detailsOpen ? React.createElement("div", { style: { display: "flex", gap: 4, alignItems: "center" } },
          React.createElement("div", { className: "sb-search-box" },
            React.createElement("input", {
              className: "sb-search-input",
              placeholder: "替换",
              value: replQ,
              onChange: function (e) { setReplQ(e.target.value); }
            }),
            React.createElement("button", { className: "sb-search-opt" + (searchPC ? " on" : ""), title: "保留大小写", onClick: function () { setSearchPC(!searchPC); } }, "AB")
          ),
          React.createElement("button", { className: "sb-iconbtn", title: "全部替换", onClick: doReplace }, React.createElement("i", { className: "ri-exchange-line" }))
        ) : null
      )
    ),
    React.createElement("div", { className: "sb-sf-bar", style: filesFilterOpen ? undefined : { justifyContent: "flex-end" } },
      filesFilterOpen ? React.createElement("span", { className: "sb-sf-title" }, "包含的文件") : null,
      React.createElement("span", { className: "sb-spacer" }),
      React.createElement("button", { className: "sb-iconbtn", title: "切换搜索详细信息", onClick: function () { setFilesFilterOpen(!filesFilterOpen); } }, React.createElement("i", { className: "ri-more-fill" }))
    ),
    filesFilterOpen ? React.createElement(React.Fragment, null,
      React.createElement("input", { className: "sb-search-plain", placeholder: "例如 *.ts, src/**/include", value: incQ, onChange: function (e) { setIncQ(e.target.value); } }),
      React.createElement("div", { style: { display: "flex", gap: 2, alignItems: "center" } },
        React.createElement("button", { className: "sb-search-opt" + (searchModifiedOnly ? " on" : ""), title: "仅在已修改的文件搜索", onClick: function () { var nv = !searchModifiedOnly; setSearchModifiedOnly(nv); if (nv) setSearchOpenOnly(false); doSearch(searchQ, { modifiedOnly: nv, openOnly: nv ? false : searchOpenOnly }); } },
          React.createElement("i", { className: "ri-draft-line" })),
        React.createElement("button", { className: "sb-search-opt" + (searchOpenOnly ? " on" : ""), title: "仅在打开的编辑器搜索", onClick: function () { var nv = !searchOpenOnly; setSearchOpenOnly(nv); if (nv) setSearchModifiedOnly(false); doSearch(searchQ, { openOnly: nv, modifiedOnly: nv ? false : searchModifiedOnly }); } },
          React.createElement("i", { className: "ri-file-list-3-line" }))
      ),
      React.createElement("div", { className: "sb-sf-bar" },
        React.createElement("span", { className: "sb-sf-title" }, "排除的文件")
      ),
      React.createElement("input", { className: "sb-search-plain", placeholder: "排除的文件", value: excQ, onChange: function (e) { setExcQ(e.target.value); } })
    ) : null,
    React.createElement("div", { className: "sb-res-head" },
      React.createElement("span", null,
        searchMsg || (searchBusy ? "搜索中…" : (searchRes && searchRes.length ? Object.keys(searchGroups || {}).length + " 个文件中有 " + searchRes.length + " 个结果" : ""))
      ),
      searchRes && searchRes.length ? (
        searchOpenOnly
          ? React.createElement("span", null,
              " - ",
              React.createElement("span", { className: "sb-res-link on", title: "仅在打开的文件中搜索", onClick: function () { onToggleOpenOnly(false); } },
                "仅在打开的文件中搜索(禁用)"),
              " - ",
              React.createElement("span", { className: "sb-res-link", title: "在编辑器中打开", onClick: onOpenSearchEditor }, "在编辑器中打开")
            )
          : React.createElement("span", null,
              " - ",
              React.createElement("span", { className: "sb-res-link", title: "在编辑器中打开", onClick: onOpenSearchEditor }, "在编辑器中打开")
            )
      ) : null
    ),
    React.createElement("div", { className: "sb-search-res", ref: resScrollRef, onScroll: onResScroll },
      searchBusy ? React.createElement("div", { className: "sb-node", style: { color: "var(--dsw-alias-label-tertiary)" } }, "搜索中…") :
      (searchRes === null ? null :
        !searchQ.trim() ? React.createElement("div", { className: "sb-node", style: { color: "var(--dsw-alias-label-tertiary)" } }, "输入关键词开始搜索") :
        (!searchGroups ? React.createElement("div", { className: "sb-node", style: { color: "var(--dsw-alias-label-tertiary)" } }, "无结果") :
          resFlat.slice(resWin.start, resWin.end).map(function (it, idx) {
            if (it.t === "g") {
              var p = it.p;
              var fi = fileIcon(baseName(p));
              return React.createElement("div", { key: "g" + p, className: "sb-sr-file" + (it.first ? "" : " sb-sr-ghead"), title: p, onClick: function () { onOpenAt(p, baseName(p), null); } },
                React.createElement("span", { className: "sb-sr-chev", onClick: function (e) { e.stopPropagation(); onToggleGroup(p); } },
                  React.createElement("i", { className: it.grpCollapsed ? "ri-arrow-right-s-line" : "ri-arrow-down-s-line" })),
                React.createElement("i", { className: fi[0], style: { color: fi[1] } }),
                React.createElement("span", { style: { overflow: "hidden", textOverflow: "ellipsis" } }, baseName(p)),
                React.createElement("span", { className: "sb-count" }, it.ms.length),
                React.createElement("span", { className: "sb-sr-actions" },
                  detailsOpen ? React.createElement("button", { className: "sb-iconbtn", title: "全部替换", onClick: function (e) { e.stopPropagation(); onReplaceFile(p); } }, React.createElement("i", { className: "ri-exchange-line" })) : null,
                  React.createElement("button", { className: "sb-iconbtn", title: "全部排除", onClick: function (e) { e.stopPropagation(); onExclude(p); } }, React.createElement("i", { className: "ri-close-line" }))
                )
              );
            }
            var r = it.r;
            return React.createElement("div", { key: "r" + r.path + ":" + (r.line || 0) + ":" + idx, className: "sb-sr-item", title: r.path + (r.line ? ":" + r.line : ""), onClick: function () { onOpenAt(r.path, r.name, r.line || null); } },
              r.kind === "name" ? React.createElement(React.Fragment, null,
                React.createElement("span", { className: "sb-sr-ln" }, "文"),
                React.createElement("span", { className: "sb-sr-snip" }, "文件名匹配")
              ) : React.createElement("span", { className: "sb-sr-snip" },
                splitHit(r.snippet, searchQ.trim(), searchMC, searchWW, searchRX).map(function (seg, j) {
                  return seg.hit ? React.createElement("mark", { key: j, className: "sb-hit" }, seg.text) : React.createElement("span", { key: j }, seg.text);
                })
              ),
              React.createElement("span", { className: "sb-sr-actions" },
                detailsOpen ? React.createElement("button", { className: "sb-iconbtn", title: "替换", onClick: function (e) { e.stopPropagation(); onReplaceLine(r.path, r.line); } }, React.createElement("i", { className: "ri-exchange-line" })) : null,
                React.createElement("button", { className: "sb-iconbtn", title: "排除", onClick: function (e) { e.stopPropagation(); onExclude(r.path); } }, React.createElement("i", { className: "ri-close-line" }))
              )
            );
          })
        )
      )
    )
  );
}
