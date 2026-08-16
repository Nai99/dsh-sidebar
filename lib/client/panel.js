function SidebarPanel(props) {
  var sessions = props && props.useSessions ? props.useSessions(function (s) { return s; }) : null;
  var curCwd = null;
  if (sessions && sessions.current && sessions.byId && sessions.byId[sessions.current]) {
    // 兼容字符串 cwd 与对象形态({path})——对象会导致 root 变成 [object Object]
    var sc = sessions.byId[sessions.current].cwd;
    curCwd = typeof sc === "string" ? sc : (sc && typeof sc.path === "string" ? sc.path : null);
  }

  var st = React.useState(false);
  var visible = st[0], setVisible = st[1];
  var st2 = React.useState(760);
  var width = st2[0], setWidth = st2[1];
  // 树:path -> children(懒加载)
  var st3 = React.useState({});
  var tree = st3[0], setTree = st3[1];
  var st4 = React.useState({});
  var expanded = st4[0], setExpanded = st4[1];
  // 打开的标签页
  var st5 = React.useState([]);
  var tabs = st5[0], setTabs = st5[1];
  var st6 = React.useState(null);
  var activePath = st6[0], setActivePath = st6[1];
  var st7 = React.useState({});
  var contents = st7[0], setContents = st7[1]; // path -> { content, dirty, truncated }
  var st8 = React.useState("");
  var msg = st8[0], setMsg = st8[1];
  var st9 = React.useState(false);
  var moreOpen = st9[0], setMoreOpen = st9[1];
  var st10 = React.useState(null);
  var morePos = st10[0], setMorePos = st10[1];
  var moreRef = React.useRef(null);
  var moreMenuRef = React.useRef(null);
  var st11 = React.useState(null);
  var mmMenu = st11[0], setMmMenu = st11[1]; // 缩略图右键菜单 {x,y}
  var mmRef = React.useRef(null);
  var st12 = React.useState(null);
  var mmSub = st12[0], setMmSub = st12[1]; // 二级菜单 {which,x,y}
  var mmSubEl = React.useRef(null);
  var mmHoverTimer = React.useRef(null);
  var st13 = React.useState(280);
  var explorerW = st13[0], setExplorerW = st13[1]; // 资源管理器宽度(可拖拽)
  var exDragRef = React.useRef(false);

  // 拖拽调整编辑器与资源管理器宽度
  function startExplorerDrag(e) {
    e.preventDefault();
    exDragRef.current = true;
    var h = document.getElementById("sb-ex-resize");
    if (h) h.classList.add("dragging");
    function onMove(ev) {
      setExplorerW(Math.min(480, Math.max(160, window.innerWidth - ev.clientX)));
    }
    function onUp() {
      exDragRef.current = false;
      if (h) h.classList.remove("dragging");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  // 右侧工作目录视图:files / search / git
  var st14 = React.useState("files");
  var exTab = st14[0], setExTab = st14[1];
  var st55 = React.useState(false);
  var termOpen = st55[0], setTermOpen = st55[1]; // 终端底部面板(位于状态栏上方,挤压编辑器)
  var st56 = React.useState(function () { try { return localStorage.getItem("sb-term-shell") || "bash"; } catch (e) { return "bash"; } });
  var termShell = st56[0], setTermShell = st56[1];
  var st57 = React.useState(null);
  var termMenu = st57[0], setTermMenu = st57[1]; // 终端类型菜单 {x,y}
  var st58 = React.useState(200);
  var termHeight = st58[0], setTermHeight = st58[1];
  var st59 = React.useState([]);
  var termTabs = st59[0], setTermTabs = st59[1]; // 终端标签页 [{id,cwd,label,shell}]
  var st60 = React.useState(null);
  var termActive = st60[0], setTermActive = st60[1];
  var st15 = React.useState("");
  var searchQ = st15[0], setSearchQ = st15[1];
  var st19 = React.useState(false);
  var searchMC = st19[0], setSearchMC = st19[1];
  var st20 = React.useState(false);
  var searchWW = st20[0], setSearchWW = st20[1];
  var st21 = React.useState(false);
  var searchRX = st21[0], setSearchRX = st21[1];
  var st22 = React.useState("");
  var replQ = st22[0], setReplQ = st22[1];
  var st23 = React.useState("");
  var incQ = st23[0], setIncQ = st23[1];
  var st24 = React.useState("");
  var excQ = st24[0], setExcQ = st24[1];
  var st25 = React.useState(true);
  var detailsOpen = st25[0], setDetailsOpen = st25[1];
  var st26 = React.useState("");
  var searchMsg = st26[0], setSearchMsg = st26[1];
  var st27 = React.useState(false);
  var mdPreview = st27[0], setMdPreview = st27[1]; // md 文件预览/代码切换
  var st28 = React.useState(false);
  var searchPC = st28[0], setSearchPC = st28[1]; // 替换保留大小写
  var st29 = React.useState(false);
  var filesFilterOpen = st29[0], setFilesFilterOpen = st29[1]; // 包含/排除文件筛选展开
  var st31 = React.useState({});
  var collapsedGroups = st31[0], setCollapsedGroups = st31[1]; // path -> true
  var st32 = React.useState(false);
  var searchModifiedOnly = st32[0], setSearchModifiedOnly = st32[1]; // 仅在已修改的文件搜索
  var st33 = React.useState(false);
  var searchOpenOnly = st33[0], setSearchOpenOnly = st33[1]; // 仅在打开的编辑器搜索
  var st34 = React.useState({ start: 0, end: 80 });
  var resWin = st34[0], setResWin = st34[1]; // 结果虚拟滚动窗口
  var resScrollRef = React.useRef(null);
  var resFlatLenRef = React.useRef(0);
  var lastSyncSigRef = React.useRef("");
  var st35 = React.useState(null);
  var ctxMenu = st35[0], setCtxMenu = st35[1]; // 文件树右键菜单 {x,y,path,name,isDir}
  var ctxMenuRef = React.useRef(null);
  var st36 = React.useState(null);
  var tabMenu = st36[0], setTabMenu = st36[1]; // 标签右键菜单 {x,y,path}
  var tabMenuRef = React.useRef(null);
  var dragTabRef = React.useRef(null); // 拖拽中的标签下标
  var st37 = React.useState(null);
  var ctxSelPath = st37[0], setCtxSelPath = st37[1]; // 右键框选的文件
  var st38 = React.useState(null);
  var dragHover = st38[0], setDragHover = st38[1]; // 标签拖拽悬停目标
  var dragWRef = React.useRef(120);
  var st39 = React.useState({ line: 1, col: 1 });
  var cursorPos = st39[0], setCursorPos = st39[1];
  var st40 = React.useState(2);
  var indentSize = st40[0], setIndentSize = st40[1];
  var st41 = React.useState("spaces");
  var indentMode = st41[0], setIndentMode = st41[1];
  var st42 = React.useState("UTF-8");
  var encState = st42[0], setEncState = st42[1];
  var st43 = React.useState("LF");
  var eolState = st43[0], setEolState = st43[1];
  var st44 = React.useState("");
  var langLabel = st44[0], setLangLabel = st44[1];
  var st45 = React.useState(null);
  var stPopup = st45[0], setStPopup = st45[1]; // {kind,x,y}
  var stMenuRef = React.useRef(null);
  var st46 = React.useState("");
  var goLineVal = st46[0], setGoLineVal = st46[1];
  var st47 = React.useState(null);
  var gitDiff = st47[0], setGitDiff = st47[1]; // 每个文件/总计增删
  var st48 = React.useState(false);
  var gitModalOpen = st48[0], setGitModalOpen = st48[1];
  var st49 = React.useState("");
  var gitMsg = st49[0], setGitMsg = st49[1];
  var st50 = React.useState("");
  var gitBranch = st50[0], setGitBranch = st50[1];
  var st51 = React.useState(false);
  var gitInclude = st51[0], setGitInclude = st51[1];
  var st52 = React.useState(false);
  var gitBusy = st52[0], setGitBusy = st52[1];
  var st53 = React.useState(null);
  var gitResult = st53[0], setGitResult = st53[1]; // {ok, text}
  var st54 = React.useState(false);
  var gitBranchMenu = st54[0], setGitBranchMenu = st54[1];
  var searchTimerRef = React.useRef(null);
  var autoSaveTimerRef = React.useRef(null);
  var pendingRevealRef = React.useRef(null);
  var gitRetryRef = React.useRef(0); // git-status 自动重试计数
  var st16 = React.useState(null);
  var searchRes = st16[0], setSearchRes = st16[1];
  var st17 = React.useState(false);
  var searchBusy = st17[0], setSearchBusy = st17[1];
  var st18 = React.useState(null);
  var gitData = st18[0], setGitData = st18[1];
  var termRefs = React.useRef({}); // id -> { term, ws, cwd }
  var termSeqRef = React.useRef(0);
  var termActiveRef = React.useRef(null);
  var termTypeRef = React.useRef(null);
  var termMenuRef = React.useRef(null);
  var termPanelRef = React.useRef(null);
  var xtermBootRef = React.useRef(false);

  function doSearch(q, opt) {
    var query = (q === undefined ? searchQ : q);
    if (!root || !String(query).trim()) {
      setSearchRes(null);
      setSearchBusy(false);
      setSearchMsg("");
      return;
    }
    var mc = (opt && opt.mc !== undefined) ? opt.mc : searchMC;
    var ww = (opt && opt.ww !== undefined) ? opt.ww : searchWW;
    var rx = (opt && opt.rx !== undefined) ? opt.rx : searchRX;
    var inc = (opt && opt.inc !== undefined) ? opt.inc : incQ;
    var exc = (opt && opt.exc !== undefined) ? opt.exc : excQ;
    var openOnly = (opt && opt.openOnly !== undefined) ? opt.openOnly : searchOpenOnly;
    var modifiedOnly = (opt && opt.modifiedOnly !== undefined) ? opt.modifiedOnly : searchModifiedOnly;
    setSearchBusy(true);
    setSearchMsg("");
    // 仅在已修改/打开的编辑器:客户端直接搜已打开的文件内容(收集全部匹配)
    if (openOnly || modifiedOnly) {
      var needle = String(query).trim();
      var results = [];
      var re2 = null;
      try {
        if (rx) re2 = new RegExp(needle, mc ? "g" : "gi");
        else {
          var esc2 = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          re2 = new RegExp((ww ? "\\b" : "") + esc2 + (ww ? "\\b" : ""), mc ? "g" : "gi");
        }
      } catch (e) { re2 = null; }
      tabs.forEach(function (t) {
        var c = contents[t.path];
        if (!c || !re2) return;
        if (modifiedOnly && !c.dirty) return;
        re2.lastIndex = 0;
        var mm;
        while ((mm = re2.exec(c.content)) !== null) {
          var lineStart = c.content.lastIndexOf("\n", mm.index) + 1;
          var lineEnd = c.content.indexOf("\n", mm.index);
          var lineNo = c.content.slice(0, lineStart).split("\n").length;
          results.push({ path: t.path, name: t.name, kind: "content", line: lineNo, snippet: c.content.slice(lineStart, lineEnd < 0 ? undefined : lineEnd).trim().slice(0, 120) });
          if (mm[0].length === 0) re2.lastIndex++;
        }
      });
      setCollapsedGroups({});
      setSearchRes(results);
      setSearchBusy(false);
      return;
    }
    fetch("/dsh-sidebar/search?cwd=" + encodeURIComponent(root) + "&q=" + encodeURIComponent(String(query).trim()) + "&mc=" + (mc ? 1 : 0) + "&ww=" + (ww ? 1 : 0) + "&rx=" + (rx ? 1 : 0) + "&inc=" + encodeURIComponent(inc) + "&exc=" + encodeURIComponent(exc))
      .then(function (r) { return r.json(); })
      .then(function (d) { setCollapsedGroups({}); setSearchRes((d && d.ok) ? d.results : []); setSearchBusy(false); })
      .catch(function () { setCollapsedGroups({}); setSearchRes([]); setSearchBusy(false); });
  }
  // 仅替换单个文件(搜索范围限定在打开/已修改文件时逐文件替换)
  function replaceOneFile(p, cb) {
    if (!root) return cb(0);
    fetch("/dsh-sidebar/replace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cwd: root, path: p, q: searchQ.trim(), repl: replQ, mc: searchMC, ww: searchWW, rx: searchRX, pc: searchPC })
    }).then(function (r) { return r.json(); }).then(function (d) { cb((d && d.ok) ? (d.count || 0) : 0); })
      .catch(function () { cb(0); });
  }
  // 分组头悬浮:仅替换该文件(全部)
  function doReplaceFile(p) {
    if (!root || !searchQ.trim()) return;
    setSearchBusy(true);
    replaceOneFile(p, function (n) {
      setSearchBusy(false);
      setSearchMsg("已替换 " + n + " 处");
      doSearch();
    });
  }
  // 结果行悬浮:只替换该行上的匹配
  function doReplaceLine(p, line) {
    if (!root || !searchQ.trim() || !line) { doReplaceFile(p); return; }
    setSearchBusy(true);
    fetch("/dsh-sidebar/replace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cwd: root, path: p, line: line, q: searchQ.trim(), repl: replQ, mc: searchMC, ww: searchWW, rx: searchRX, pc: searchPC })
    }).then(function (r) { return r.json(); }).then(function (d) {
      setSearchBusy(false);
      if (d && d.ok) { setSearchMsg("已替换 " + d.count + " 处"); doSearch(); }
      else setSearchMsg((d && d.message) || "替换失败");
    }).catch(function () { setSearchBusy(false); setSearchMsg("替换失败"); });
  }
  // 从结果中排除该文件:加入排除列表并重搜
  function excludeFile(p) {
    if (!root) return;
    var rel = String(p).slice(String(root).length).replace(/^[\\\/]+/, "").replace(/\\/g, "/");
    var next = excQ ? excQ + ", " + rel : rel;
    setExcQ(next);
    doSearch(searchQ, { exc: next });
  }
  // 在编辑器中打开:把搜索结果作为只读文档开一个标签页
  function openSearchEditor() {
    if (!searchRes || !searchRes.length) return;
    var lines = ["# 搜索结果: " + searchQ, "", "共 " + searchRes.length + " 个结果 · " + Object.keys(searchGroups || {}).length + " 个文件", ""];
    Object.keys(searchGroups || {}).forEach(function (p) {
      lines.push("## " + p);
      searchGroups[p].forEach(function (r) {
        lines.push("- " + (r.kind === "content" ? ":" + r.line + " " + (r.snippet || "") : "文件名匹配"));
      });
      lines.push("");
    });
    var pid = "dsh-search://" + Date.now();
    setTabs(function (prev) { return prev.concat([{ path: pid, name: "搜索: " + searchQ }]); });
    setActivePath(pid);
    setContents(function (prev) { return Object.assign({}, prev, { [pid]: { content: lines.join("\n"), dirty: false, truncated: false, virtual: true } }); });
  }
  function scheduleSearch(v) {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(function () { doSearch(v); }, 300);
  }
  function toggleGroup(p) {
    setCollapsedGroups(function (prev) {
      var next = Object.assign({}, prev);
      if (next[p]) delete next[p]; else next[p] = true;
      return next;
    });
  }
  // 标签拖拽排序
  function tabDragStart(i, e) {
    dragTabRef.current = i;
    dragWRef.current = (e.currentTarget && e.currentTarget.offsetWidth) || 120;
    setDragHover(null);
    try { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", String(i)); } catch (err) {}
  }
  function tabDragOver(i, e) {
    e.preventDefault();
    if (dragHover !== i) setDragHover(i);
    try { e.dataTransfer.dropEffect = "move"; } catch (err) {}
  }
  function tabDrop(i, e) {
    e.preventDefault();
    e.stopPropagation();
    var from = dragTabRef.current;
    dragTabRef.current = null;
    setDragHover(null);
    // i 为插入位置(0..tabs.length);拖到自身前后时顺序不变
    if (from === null || i === from || i === from + 1) return;
    setTabs(function (prev) { return moveTab(prev, from, i); });
  }
  function tabOpenMenu(e, p) {
    e.preventDefault();
    e.stopPropagation();
    var mw = 160, mh = 110;
    setTabMenu({ x: Math.max(8, Math.min(e.clientX, window.innerWidth - mw - 8)), y: Math.max(8, Math.min(e.clientY, window.innerHeight - mh - 8)), path: p });
  }
  function tabClose() { if (tabMenu) closeTab(tabMenu.path); setTabMenu(null); }
  function tabCloseOthers() {
    if (!tabMenu) return;
    var keep = tabMenu.path;
    setTabs(function (prev) { return prev.filter(function (t) { return t.path === keep; }); });
    setActivePath(keep);
    setTabMenu(null);
  }
  function tabCloseAll() {
    setTabs([]);
    setActivePath(null);
    setTabMenu(null);
  }
  // 状态栏弹窗(全屏居中大弹窗)
  function stOpen(kind) {
    if (kind === "gotoline") setGoLineVal(cursorPos.line + ":" + cursorPos.col);
    setStPopup(kind);
  }
  function stClose() { setStPopup(null); }
  function stGoToLine() {
    if (!monacoInst.current) return;
    var m = /^\s*(\d+)\s*(?::\s*(\d+)\s*)?$/.exec(goLineVal);
    if (!m) { setMsg("格式应为 行:列"); return; }
    var ln = parseInt(m[1], 10), col = parseInt(m[2] || "1", 10);
    monacoInst.current.setPosition({ lineNumber: ln, column: col });
    monacoInst.current.revealLineInCenter(ln);
    monacoInst.current.focus();
    setStPopup(null);
  }
  function stApplyIndent(v) {
    if (v === "tab") { setIndentMode("tab"); monacoInst.current.updateOptions({ tabSize: 4 }); }
    else { setIndentMode("spaces"); setIndentSize(v); monacoInst.current.updateOptions({ tabSize: v }); }
    setStPopup(null);
  }
  function stApplyEncoding(enc) {
    if (!activePath || !monacoInst.current) return;
    fetch("/dsh-sidebar/raw?cwd=" + encodeURIComponent(root) + "&path=" + encodeURIComponent(activePath))
      .then(function (r) { return r.arrayBuffer(); })
      .then(function (buf) {
        try {
          var text = new TextDecoder(enc).decode(buf);
          suppressChange.current = true;
          monacoInst.current.setValue(text);
          suppressChange.current = false;
          setContents(function (prev) { var c = prev[activePath]; return c ? { ...prev, [activePath]: { ...c, content: text, dirty: true } } : prev; });
          setEncState(enc.toUpperCase());
          setStPopup(null);
          setMsg("已切换编码 " + enc.toUpperCase());
        } catch (err) { setMsg("解码失败: " + String(err && err.message ? err.message : err)); }
      })
      .catch(function () { setMsg("读取失败"); });
  }
  function stApplyEol(eol) {
    if (!monacoInst.current || !activePath) return;
    var text = monacoInst.current.getValue();
    var out = eol === "CRLF" ? text.replace(/\r?\n/g, "\r\n") : text.replace(/\r\n/g, "\n");
    if (out !== text) {
      suppressChange.current = true;
      monacoInst.current.setValue(out);
      suppressChange.current = false;
      setContents(function (prev) { var c = prev[activePath]; return c ? { ...prev, [activePath]: { ...c, content: out, dirty: true } } : prev; });
    }
    setEolState(eol);
    setStPopup(null);
  }
  function stApplyLang(id, label) {
    if (!monacoInst.current || !window.monaco || !window.monaco.editor) { setLangLabel(label); setStPopup(null); return; }
    var m = monacoInst.current.getModel();
    if (m) window.monaco.editor.setModelLanguage(m, id);
    setLangLabel(label);
    setStPopup(null);
  }
  function toggleOpenOnly(nv) {
    setSearchOpenOnly(nv);
    if (nv) setSearchModifiedOnly(false);
    doSearch(searchQ, { openOnly: nv, modifiedOnly: nv ? false : searchModifiedOnly });
  }
  function pdir(p) {
    var s = String(p).replace(/[\\\/]+$/, "");
    var i = Math.max(s.lastIndexOf("/"), s.lastIndexOf("\\"));
    return i > 0 ? s.slice(0, i) : s;
  }
  function ctxOpen(e, p, name, isDir) {
    e.preventDefault();
    e.stopPropagation();
    var mw = 200, mh = 340;
    setCtxMenu({ x: Math.max(8, Math.min(e.clientX, window.innerWidth - mw - 8)), y: Math.max(8, Math.min(e.clientY, window.innerHeight - mh - 8)), path: p, name: name, isDir: isDir });
    setCtxSelPath(p);
  }
  function ctxClose() { setCtxMenu(null); setCtxSelPath(null); }
  function ctxAct(fn) { return function () { try { fn(); } catch (e) {} ctxClose(); }; }
  function ctxOpenInEditor() { if (ctxMenu && !ctxMenu.isDir) openFile(ctxMenu.path, ctxMenu.name); }
  function ctxOpenInTerm() {
    if (!ctxMenu || !root) return;
    var cwd = ctxMenu.isDir ? ctxMenu.path : pdir(ctxMenu.path);
    setMsg("终端: " + cwd);
    newTerm(cwd);
  }
  function ctxAddContext() {
    if (!ctxMenu || ctxMenu.isDir || !root) return;
    // 引用文件路径给 AI:把工作区相对路径插入对话输入框
    var rel = String(ctxMenu.path).slice(String(root).length).replace(/^[\\\/]+/, "").replace(/\\/g, "/");
    try {
      var ta = document.querySelector('[data-slot="conversation.session"] textarea')
        || document.querySelector('[data-conversation-composer] textarea')
        || document.querySelector('textarea');
      if (!ta) { setMsg("未找到对话输入框"); return; }
      var dt = new DataTransfer();
      dt.setData("text/plain", rel);
      var ev = new ClipboardEvent("paste", { bubbles: true, cancelable: true, clipboardData: dt });
      ta.dispatchEvent(ev);
      ta.focus();
      setMsg("已引用文件路径: " + rel);
    } catch (err) {
      setMsg("添加失败: " + String(err && err.message ? err.message : err));
    }
  }
      function ctxCopyRel() {
    if (!ctxMenu || !root) return;
    var rel = String(ctxMenu.path).slice(String(root).length).replace(/^[\\\/]+/, "").replace(/\\/g, "/");
    navigator.clipboard.writeText(rel).then(function () { setMsg("已复制相对路径"); }, function () { setMsg("复制失败"); });
  }
  function ctxCopyAbs() {
    if (!ctxMenu) return;
    navigator.clipboard.writeText(ctxMenu.path).then(function () { setMsg("已复制绝对路径"); }, function () { setMsg("复制失败"); });
  }
  function ctxReveal() {
    if (!ctxMenu || !root) return;
    fetch("/dsh-sidebar/reveal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cwd: root, path: ctxMenu.path, select: true })
    }).then(function (r) { return r.json(); }).then(function (d) {
      setMsg((d && d.ok) ? "已在文件管理器中显示" : ((d && d.message) || "打开失败"));
    }).catch(function () { setMsg("打开失败"); });
  }
  function ctxVsc() {
    if (!ctxMenu || !root) return;
    fetch("/dsh-sidebar/open-vscode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cwd: root, path: ctxMenu.path })
    }).then(function (r) { return r.json(); }).then(function (d) {
      setMsg((d && d.ok) ? "已在 VS Code 打开" : ((d && d.message) || "打开失败"));
    }).catch(function () { setMsg("打开失败"); });
  }
    function ctxRename() {
    if (!ctxMenu || !root) return;
    var nn = window.prompt("重命名为", ctxMenu.name);
    if (!nn || !nn.trim() || nn.trim() === ctxMenu.name) return;
    var oldPath = ctxMenu.path;
    fetch("/dsh-sidebar/rename", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cwd: root, path: oldPath, name: nn.trim() })
    }).then(function (r) { return r.json(); }).then(function (d) {
      if (d && d.ok) {
        var newPath = d.path;
        setTabs(function (prev) { return prev.map(function (t) { return t.path === oldPath ? { path: newPath, name: nn.trim() } : t; }); });
        setContents(function (prev) {
          if (!prev[oldPath]) return prev;
          var next = Object.assign({}, prev);
          next[newPath] = next[oldPath];
          delete next[oldPath];
          return next;
        });
        setActivePath(function (a) { return a === oldPath ? newPath : a; });
        setMsg("已重命名");
        loadChildren(root);
      } else setMsg((d && d.message) || "重命名失败");
    }).catch(function () { setMsg("重命名失败"); });
  }
  // 右键菜单:点击外部 / Esc 关闭
  React.useEffect(function () {
    if (!ctxMenu) return;
    function onDown(e) {
      if (ctxMenuRef.current && ctxMenuRef.current.contains(e.target)) return;
      setCtxMenu(null);
      setCtxSelPath(null);
    }
    function onKey(e) { if (e.key === "Escape") { setCtxMenu(null); setCtxSelPath(null); } }
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return function () { window.removeEventListener("mousedown", onDown); window.removeEventListener("keydown", onKey); };
  }, [ctxMenu]);
  // 状态栏弹窗:点击外部 / Esc 关闭
  React.useEffect(function () {
    if (!stPopup) return;
    function onDown(e) {
      if (stMenuRef.current && stMenuRef.current.contains(e.target)) return;
      setStPopup(null);
    }
    function onKey(e) { if (e.key === "Escape") setStPopup(null); }
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return function () { window.removeEventListener("mousedown", onDown); window.removeEventListener("keydown", onKey); };
  }, [stPopup]);
  // 标签右键菜单:点击外部 / Esc 关闭
  React.useEffect(function () {
    if (!tabMenu) return;
    function onDown(e) {
      if (tabMenuRef.current && tabMenuRef.current.contains(e.target)) return;
      setTabMenu(null);
    }
    function onKey(e) { if (e.key === "Escape") setTabMenu(null); }
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return function () { window.removeEventListener("mousedown", onDown); window.removeEventListener("keydown", onKey); };
  }, [tabMenu]);
  // 更多菜单:点击任意处 / Esc 关闭
  React.useEffect(function () {
    if (!moreOpen) return;
    function onDown(e) {
      if (moreMenuRef.current && moreMenuRef.current.contains(e.target)) return;
      if (moreRef.current && moreRef.current.contains(e.target)) return;
      setMoreOpen(false);
    }
    function onKey(e) { if (e.key === "Escape") setMoreOpen(false); }
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return function () { window.removeEventListener("mousedown", onDown); window.removeEventListener("keydown", onKey); };
  }, [moreOpen]);
  // 终端类型菜单:点击任意处 / Esc 关闭
  React.useEffect(function () {
    if (!termMenu) return;
    function onDown(e) {
      if (termMenuRef.current && termMenuRef.current.contains(e.target)) return;
      if (termTypeRef.current && termTypeRef.current.contains(e.target)) return;
      setTermMenu(null);
    }
    function onKey(e) { if (e.key === "Escape") setTermMenu(null); }
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return function () { window.removeEventListener("mousedown", onDown); window.removeEventListener("keydown", onKey); };
  }, [termMenu]);
  // git 分支菜单:点击任意处关闭
  React.useEffect(function () {
    if (!gitBranchMenu) return;
    function onDown() { setGitBranchMenu(false); }
    window.addEventListener("mousedown", onDown);
    return function () { window.removeEventListener("mousedown", onDown); };
  }, [gitBranchMenu]);
  function clearSearch() {
    setSearchQ("");
    setSearchRes(null);
    setSearchMsg("");
  }
  function doReplace() {
    if (!root || !searchQ.trim()) return;
    setSearchBusy(true);
    // 搜索范围限定在打开/已修改文件时,只替换这些文件(逐文件)
    if (searchOpenOnly || searchModifiedOnly) {
      var targets = [];
      tabs.forEach(function (t) {
        var c = contents[t.path];
        if (!c) return;
        if (searchModifiedOnly && !c.dirty) return;
        targets.push(t.path);
      });
      if (!targets.length) { setSearchBusy(false); setSearchMsg("没有可替换的文件"); return; }
      var done = 0, total = 0;
      targets.forEach(function (p) {
        replaceOneFile(p, function (n) {
          total += n;
          done++;
          if (done >= targets.length) {
            setSearchBusy(false);
            setSearchMsg("已替换 " + total + " 处");
            doSearch();
          }
        });
      });
      return;
    }
    fetch("/dsh-sidebar/replace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cwd: root, q: searchQ.trim(), repl: replQ, mc: searchMC, ww: searchWW, rx: searchRX, pc: searchPC, inc: incQ, exc: excQ })
    }).then(function (r) { return r.json(); }).then(function (d) {
      setSearchBusy(false);
      if (d && d.ok) { setSearchMsg("已替换 " + d.count + " 处,共 " + d.files + " 个文件"); doSearch(); }
      else setSearchMsg((d && d.message) || "替换失败");
    }).catch(function () { setSearchBusy(false); setSearchMsg("替换失败"); });
  }
  // 搜索跳转:定位到指定行(已在当前文件时状态不变,需直接调用)
  function applyReveal() {
    if (!pendingRevealRef.current || !monacoInst.current) return;
    var pr = pendingRevealRef.current;
    pendingRevealRef.current = null;
    try {
      monacoInst.current.setPosition({ lineNumber: pr.line, column: 1 });
      monacoInst.current.revealLineInCenter(pr.line);
      monacoInst.current.focus();
    } catch (e) {}
  }
  function openFileAt(p, name, line) {
    openFile(p, name);
    if (line) {
      pendingRevealRef.current = { path: p, line: line };
      if (activePath === p && contents[p] && !contents[p].binary) {
        setTimeout(applyReveal, 60);
      }
    }
  }
  function loadGit() {
    if (!root) return;
    fetch("/dsh-sidebar/git-status?cwd=" + encodeURIComponent(root))
      .then(function (r) {
        if (!r.ok) throw new Error(r.status === 404 ? "route-missing" : "http-" + r.status);
        return r.json();
      })
      // 保留 repo:false 的响应(reason 字段用于区分"不是仓库"与"git 命令不可用"等)
      .then(function (d) {
        gitRetryRef.current = 0;
        setGitData((d && d.ok) ? d : (d ? { ok: true, repo: false, reason: "git-status 接口错误: " + (d.message || "未知") } : null));
      })
      .catch(function (e) {
        var isRoute = e && e.message === "route-missing";
        // 404 = 服务端插件路由未生效(旧代码);其余失败自动重试 2 次,应对服务瞬时不可用
        if (!isRoute && gitRetryRef.current < 2) {
          gitRetryRef.current++;
          setTimeout(loadGit, 2000);
        }
        setGitData({ ok: true, repo: false, reason: isRoute ? "git-status 路由未生效(请重启 dsh web 并确认插件已更新)" : "git-status 请求失败(" + (e && e.message ? e.message : "网络错误") + "),已自动重试" });
      });
    fetch("/dsh-sidebar/git-diff?cwd=" + encodeURIComponent(root))
      .then(function (r) { return r.json(); })
      .then(function (d) { setGitDiff((d && d.ok) ? d : null); })
      .catch(function () { setGitDiff(null); });
  }
  function gitOpenModal() {
    setGitMsg("");
    setGitResult(null);
    setGitBranch(gitData ? gitData.branch : "");
    setGitInclude(false);
    setGitBranchMenu(false);
    setGitModalOpen(true);
  }
  function gitGenAi() {
    if (!root) return;
    setGitBusy(true);
    setGitResult(null);
    fetch("/dsh-sidebar/git-ai?cwd=" + encodeURIComponent(root)).then(function (r) { return r.json(); }).then(function (d) {
      if (d && d.ok === false) setGitResult({ ok: false, text: d.message });
      else if (d && d.message) setGitMsg(d.message);
      else setGitResult({ ok: false, text: "没有可提交的改动" });
    }).catch(function (e) { setGitResult({ ok: false, text: String(e) }); })
      .finally(function () { setGitBusy(false); });
  }
  function gitCommit(push) {
    if (!root) return;
    setGitBusy(true);
    setGitResult(null);
    fetch("/dsh-sidebar/git-commit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cwd: root, message: gitMsg, push: push, branch: gitBranch, includeUnstaged: gitInclude })
    }).then(function (r) { return r.json(); }).then(function (d) {
      if (d && d.ok === false) setGitResult({ ok: false, text: (d.step ? d.step + " 失败: " : "") + (d.err || d.message || "失败") });
      else { setGitResult({ ok: true, text: push ? "已提交并推送 ✓" : "已提交 ✓" }); setGitMsg(""); loadGit(); }
    }).catch(function (e) { setGitResult({ ok: false, text: String(e) }); })
      .finally(function () { setGitBusy(false); });
  }
  function gitPush() {
    if (!root) return;
    setGitBusy(true);
    setGitResult(null);
    fetch("/dsh-sidebar/git-push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cwd: root, branch: gitBranch })
    }).then(function (r) { return r.json(); }).then(function (d) {
      if (d && d.ok === false) setGitResult({ ok: false, text: d.err || d.message || "推送失败" });
      else { setGitResult({ ok: true, text: "已推送 ✓" }); loadGit(); }
    }).catch(function (e) { setGitResult({ ok: false, text: String(e) }); })
      .finally(function () { setGitBusy(false); });
  }
  function cleanupTerm(id) {
    var t = termRefs.current[id];
    if (t) {
      try { if (t.ws && t.ws.readyState === 1) t.ws.close(); } catch (e) {}
      try { if (t.term) t.term.dispose(); } catch (e) {}
      delete termRefs.current[id];
    }
  }
  // 终端主题色(创建时与主题切换刷新时共用,始终解析当前 CSS 变量)
  function termThemeColors() {
    return {
      background: cssColor("--dsw-alias-bg-base", "#0f1115"),
      foreground: cssColor("--dsw-alias-label-primary", "#e4e4e7"),
      cursor: cssColor("--dsw-alias-label-primary", "#e4e4e7"),
      cursorAccent: "#000000",
      selectionBackground: "rgba(136,136,136,0.35)"
    };
  }
  function createTermFor(tab) {
    if (termRefs.current[tab.id] || !root || !window.Terminal) return;
    var el = document.getElementById("sb-term-" + tab.id);
    if (!el) return;
    var term = new window.Terminal({
      fontSize: 12,
      fontFamily: "Consolas, 'Courier New', monospace",
      cursorBlink: true,
      convertEol: true,
      scrollback: 3000,
      theme: termThemeColors()
    });
    term.open(el);
    var proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    // cwd 先转正斜杠:harness 的 WS 升级路由会剥离查询串里的 %5C,反斜杠路径会丢失分隔符
    var ws = new WebSocket(proto + "//" + window.location.host + "/dsh-sidebar/term-ws?cwd=" + encodeURIComponent(String(tab.cwd || "").replace(/\\/g, "/")) + "&shell=" + encodeURIComponent(tab.shell || "bash"));
    ws.onmessage = function (e) { term.write(typeof e.data === "string" ? e.data : String(e.data)); };
    ws.onerror = function () { try { term.write("\r\n\x1b[90m[终端连接失败,请确认 dsh web 已重启并刷新页面]\x1b[0m\r\n"); } catch (e2) {} };
    ws.onclose = function () { try { term.write("\r\n\x1b[90m[会话已结束]\x1b[0m\r\n"); } catch (e2) {} };
    term.onData(function (d) { if (ws.readyState === 1) ws.send(d); });
    term.onResize(function (sz) { if (ws.readyState === 1) ws.send("\u0000RESIZE:" + sz.cols + ":" + sz.rows); });
    termRefs.current[tab.id] = { term: term, ws: ws, cwd: tab.cwd };
  }
  // 主题切换后刷新所有活动终端配色(xterm 通过 options.theme 热更新)
  function refreshTermThemes() {
    for (var id in termRefs.current) {
      var t = termRefs.current[id];
      if (!t || !t.term) continue;
      try { t.term.options.theme = termThemeColors(); } catch (e) { /* ignore */ }
    }
  }
  function bootTerm(tab) {
    if (window.Terminal) { createTermFor(tab); return; }
    if (xtermBootRef.current) return; // 加载中:onload 时为活动标签补建
    xtermBootRef.current = true;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/dsh-sidebar/xterm.css";
    document.head.appendChild(link);
    // 临时移除 define:页面加载过 monaco 后存在 define.amd,
    // xterm 的 UMD 会被 AMD 接管而不挂 window.Terminal,导致终端静默失败
    var savedDefine = window.define;
    try { delete window.define; } catch (e) { window.define = undefined; }
    var s = document.createElement("script");
    s.src = "/dsh-sidebar/xterm.js";
    s.onload = function () {
      if (savedDefine !== undefined) window.define = savedDefine;
      if (!window.Terminal) {
        var el0 = document.getElementById("sb-term-" + tab.id);
        if (el0) el0.textContent = "xterm 加载失败,请刷新页面重试";
        xtermBootRef.current = false;
        return;
      }
      var curId = termActiveRef.current;
      if (curId && curId !== tab.id && !termRefs.current[curId]) {
        var cur = null;
        for (var i = 0; i < termTabs.length; i++) if (termTabs[i].id === curId) cur = termTabs[i];
        if (cur) createTermFor(cur);
      }
      createTermFor(tab);
    };
    s.onerror = function () {
      if (savedDefine !== undefined) window.define = savedDefine;
      xtermBootRef.current = false;
      var el1 = document.getElementById("sb-term-" + tab.id);
      if (el1) el1.textContent = "xterm 加载失败(网络错误),请刷新页面重试";
    };
    document.head.appendChild(s);
  }
  function newTerm(cwd, label, shell) {
    var id = "t" + (++termSeqRef.current);
    // 防御:cwd 可能来自会话状态,若非字符串(对象)会导致标签/标题显示 [object Object]
    var c = (typeof cwd === "string" && cwd.length > 0) ? cwd : (typeof root === "string" ? root : null);
    if (typeof cwd === "string" ? false : (cwd !== undefined && cwd !== null)) {
      try { console.warn("[dsh-sidebar] newTerm cwd 非字符串:", cwd); } catch (e) {}
    }
    var tab = { id: id, cwd: c, label: label || baseName(c) || "终端", shell: shell || termShell };
    setTermTabs(function (ts) { return ts.concat([tab]); });
    setTermActive(id);
    setTermOpen(true);
  }
  function closeTermTab(id) {
    cleanupTerm(id);
    var idx = -1;
    for (var i = 0; i < termTabs.length; i++) if (termTabs[i].id === id) idx = i;
    var rest = termTabs.filter(function (t) { return t.id !== id; });
    setTermTabs(rest);
    if (termActive === id) {
      if (rest.length) setTermActive(rest[Math.min(idx, rest.length - 1)].id);
      else { setTermActive(null); setTermOpen(false); }
    }
  }
  function toggleTermType() {
    if (termMenu) { setTermMenu(null); return; }
    var el = termTypeRef.current;
    if (el) {
      var r = el.getBoundingClientRect();
      var mw = 160;
      setTermMenu({ y: r.bottom + 4, x: Math.max(8, Math.min(r.right - mw, window.innerWidth - mw - 8)) });
    }
  }
  function pickTermShell(s) {
    setTermShell(s);
    try { localStorage.setItem("sb-term-shell", s); } catch (e) {}
    setTermMenu(null);
  }
  // 活动标签懒创建终端实例(参考 termbar)
  React.useEffect(function () {
    if (!visible || !termOpen || termActive == null) return;
    var tab = null;
    for (var i = 0; i < termTabs.length; i++) if (termTabs[i].id === termActive) tab = termTabs[i];
    if (!tab) return;
    termActiveRef.current = termActive;
    if (termRefs.current[termActive]) return;
    bootTerm(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termOpen, visible, termActive, termTabs, root]);
  // 终端面板拖拽调整高度(参考 termbar)
  React.useEffect(function () {
    if (!visible || !termOpen) return;
    function onMove(e) {
      var p = termPanelRef.current;
      if (!p) return;
      var r = p.getBoundingClientRect();
      setTermHeight(Math.min(600, Math.max(120, r.bottom - e.clientY)));
    }
    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    var handle = document.getElementById("sb-term-resize");
    if (!handle) return;
    function onDown() {
      document.body.style.cursor = "ns-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    }
    handle.addEventListener("mousedown", onDown);
    return function () { handle.removeEventListener("mousedown", onDown); onUp(); };
  }, [visible, termOpen]);
  React.useEffect(function () {
    if (!visible || exTab !== "git") return;
    loadGit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exTab, visible, root]);
  // 卸载时清理全部终端
  React.useEffect(function () {
    return function () { for (var id in termRefs.current) cleanupTerm(id); };
  }, []);
  function toggleMoreMenu() {
    if (moreOpen) { setMoreOpen(false); return; }
    var el = moreRef.current;
    if (el) {
      var r = el.getBoundingClientRect();
      var mw = 160;
      setMorePos({ top: r.bottom + 4, left: Math.max(8, Math.min(r.right - mw, window.innerWidth - mw - 8)) });
    }
    setMoreOpen(true);
  }
  function copyPath(abs) {
    if (!activePath) return;
    var text = activePath;
    if (!abs && root) {
      var rel = activePath.slice(root.length).replace(/\\/g, "/").replace(/^\/+/, "");
      text = rel || baseName(activePath);
    }
    try { navigator.clipboard.writeText(text); } catch (e) { setMsg("复制失败"); }
    setMoreOpen(false);
  }
  function revealInExplorer() {
    if (!root || !activePath) return;
    setMsg("");
    fetch("/dsh-sidebar/reveal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cwd: root, path: activePath, select: true })
    }).then(function (r) { return r.json(); }).then(function (d) {
      if (!d || !d.ok) setMsg((d && d.message) || "打开失败");
    }).catch(function (e) { setMsg(String(e && e.message ? e.message : e)); });
    setMoreOpen(false);
  }
  function openInVscode(p) {
    if (!root || !p) return;
    setMsg("");
    fetch("/dsh-sidebar/open-vscode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cwd: root, path: p })
    }).then(function (r) { return r.json(); }).then(function (d) {
      if (d && d.ok) setMsg("已在 VS Code 打开 " + baseName(p));
      else setMsg((d && d.message) || "打开失败");
    }).catch(function (e) { setMsg(String(e && e.message ? e.message : e)); });
  }
  var panelRef = React.useRef(null);
  var monacoElRef = React.useRef(null);
  var monacoInst = React.useRef(null);
  var suppressChange = React.useRef(false);
  var activeTabRef = React.useRef(null); // 当前活动标签(供一次性注册的 effect 读取最新值,避免闭包过期)

  // 缩略图右键绑定:Monaco 的 .minimap 元素可能随开关/渲染而重建,带重试
  function attachMinimapMenu(attempt) {
    if (!monacoElRef.current) return;
    var mm = monacoElRef.current.querySelector(".minimap");
    if (mm && !mm.__sbMmBound) {
      mm.__sbMmBound = true;
      mm.addEventListener("contextmenu", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var mw = 210, mh = 240;
        setMmMenu({ x: Math.max(8, Math.min(e.clientX, window.innerWidth - mw - 8)), y: Math.max(8, Math.min(e.clientY, window.innerHeight - mh - 8)) });
      });
    } else if (!mm && (attempt || 0) < 4) {
      setTimeout(function () { attachMinimapMenu((attempt || 0) + 1); }, 300);
    }
  }
  function mmSet(patch) {
    saveEditorSettings(Object.assign({}, editorSettings, patch));
    try { window.dispatchEvent(new CustomEvent("dsh-editor-settings")); } catch (e) {}
    setMmMenu(null);
    setMmSub(null);
  }
  // 二级菜单:悬停打开,右侧展开;超出视口右/下边界则翻转到左/上,并做垂直收拢
  function mmSubOpen(which, e) {
    if (mmHoverTimer.current) { clearTimeout(mmHoverTimer.current); mmHoverTimer.current = null; }
    var r = e.currentTarget.getBoundingClientRect();
    var sw = 132, sh = which === "size" ? 104 : 74;
    var x = r.right + 4;
    if (x + sw > window.innerWidth - 8) x = Math.max(8, r.left - sw - 4);
    var y = Math.max(8, Math.min(r.top, window.innerHeight - sh - 8));
    setMmSub({ which: which, x: x, y: y });
  }
  function mmSubClose() {
    if (mmHoverTimer.current) clearTimeout(mmHoverTimer.current);
    mmHoverTimer.current = setTimeout(function () { setMmSub(null); }, 180);
  }
  function mmSubCancel() {
    if (mmHoverTimer.current) { clearTimeout(mmHoverTimer.current); mmHoverTimer.current = null; }
  }

  var root = curCwd || null;

  function fetchDir(p) {
    return fetch("/dsh-sidebar/list?cwd=" + encodeURIComponent(root) + "&path=" + encodeURIComponent(p))
      .then(function (r) { return r.json(); })
      .then(function (d) { return (d && d.ok) ? (d.entries || []) : null; });
  }

  function loadChildren(p) {
    fetchDir(p).then(function (entries) {
      if (entries) setTree(function (prev) { return { ...prev, [p]: entries }; });
      else setMsg("加载目录失败");
    }).catch(function (e) { setMsg(String(e && e.message ? e.message : e)); });
  }

  // 根目录加载 + 自动展开
  React.useEffect(function () {
    if (visible && root) {
      setTree({});
      setExpanded({});
      setTabs([]);
      setActivePath(null);
      setContents({});
      loadChildren(root);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, root]);

  function toggleDir(p, name) {
    setExpanded(function (prev) {
      var next = { ...prev };
      if (next[p]) delete next[p];
      else {
        next[p] = true;
        if (!tree[p]) loadChildren(p);
      }
      return next;
    });
  }

  function openFile(p, name) {
    setTabs(function (prev) {
      if (prev.some(function (t) { return t.path === p; })) return prev;
      return prev.concat([{ path: p, name: name }]);
    });
    setActivePath(p);
    if (!contents[p]) {
      setMsg("");
      fetch("/dsh-sidebar/read?cwd=" + encodeURIComponent(root) + "&path=" + encodeURIComponent(p))
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d && d.ok) setContents(function (prev) { return { ...prev, [p]: { content: d.content || "", dirty: false, truncated: d.truncated, binary: d.binary, mime: d.mime } }; });
          else if (d && d.ok === false) setMsg(d.message || "读取失败");
        })
        .catch(function (e) { setMsg(String(e && e.message ? e.message : e)); });
    }
  }

  function closeTab(p) {
    setTabs(function (prev) {
      var idx = prev.findIndex(function (t) { return t.path === p; });
      var next = prev.filter(function (t) { return t.path !== p; });
      if (next.length === 0) { setActivePath(null); return next; }
      setActivePath(function (a) {
        if (a !== p) return a;
        var nxt = next[Math.min(idx, next.length - 1)];
        return nxt.path;
      });
      return next;
    });
  }

  // Monaco 同步(activePath)
  React.useEffect(function () {
    var cur = activePath ? contents[activePath] : null;
    if (!visible || !cur || cur.binary || !monacoElRef.current) return;
    var tab = null;
    for (var i = 0; i < tabs.length; i++) if (tabs[i].path === activePath) tab = tabs[i];
    loadMonaco(function () {
      if (!monacoElRef.current || !window.monaco || !window.monaco.editor) return; // 加载失败时静默退出,避免未捕获异常
      if (!monacoInst.current) {
        ensureMonacoThemes();
        monacoInst.current = window.monaco.editor.create(monacoElRef.current, {
          value: cur.content,
          language: editorSettings.highlight ? langOf(tab ? tab.name : "") : "plaintext",
          theme: editorThemeName(),
          automaticLayout: true,
          fontSize: 13,
          fontFamily: "Consolas, 'Courier New', monospace",
          minimap: { enabled: editorSettings.minimap, size: editorSettings.minimapSize, showSlider: editorSettings.minimapSlider, renderCharacters: editorSettings.renderCharacters },
          scrollBeyondLastLine: false,
          tabSize: 2,
          wordWrap: editorSettings.wordWrap ? "on" : "off",
          lineNumbers: editorSettings.hideLineNumbers ? "off" : "on"
        });
        lastSyncSigRef.current = (editorSettings.highlight ? langOf(tab ? tab.name : "") : "plaintext") + "|" + editorThemeName() + "|" + (editorSettings.wordWrap ? "on" : "off") + "|" + (editorSettings.hideLineNumbers ? "off" : "on") + "|" + editorSettings.minimap + "|" + editorSettings.minimapSize + "|" + editorSettings.minimapSlider + "|" + editorSettings.renderCharacters;
        attachMinimapMenu();
        monacoInst.current.onDidChangeCursorPosition(function (cp) {
          setCursorPos({ line: cp.position.lineNumber, col: cp.position.column });
        });
        monacoInst.current.onDidChangeModelContent(function () {
          if (suppressChange.current) return;
          var val = monacoInst.current.getValue();
          setContents(function (prev) {
            var c = prev[activePath];
            return c ? { ...prev, [activePath]: { ...c, content: val, dirty: true } } : prev;
          });
          if (editorSettings.autoSave) {
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
            autoSaveTimerRef.current = setTimeout(function () { saveActive(); }, 800);
          }
        });
      } else {
        var model = monacoInst.current.getModel();
        if (model && !cur.dirty && model.getValue() !== cur.content) {
          suppressChange.current = true;
          monacoInst.current.setValue(cur.content);
          suppressChange.current = false;
        }
        // 仅当语言/主题/选项真正变化时才应用(避免每次按键重做 tokenize/updateOptions)
        var lang2 = editorSettings.highlight ? langOf(tab ? tab.name : "") : "plaintext";
        var theme2 = editorThemeName();
        var opts2 = {
          wordWrap: editorSettings.wordWrap ? "on" : "off",
          lineNumbers: editorSettings.hideLineNumbers ? "off" : "on",
          minimap: { enabled: editorSettings.minimap, size: editorSettings.minimapSize, showSlider: editorSettings.minimapSlider, renderCharacters: editorSettings.renderCharacters }
        };
        var sig = lang2 + "|" + theme2 + "|" + opts2.wordWrap + "|" + opts2.lineNumbers + "|" + editorSettings.minimap + "|" + editorSettings.minimapSize + "|" + editorSettings.minimapSlider + "|" + editorSettings.renderCharacters;
        if (lastSyncSigRef.current !== sig) {
          lastSyncSigRef.current = sig;
          ensureMonacoThemes();
          window.monaco.editor.setModelLanguage(model, lang2);
          window.monaco.editor.setTheme(theme2);
          monacoInst.current.updateOptions(opts2);
        }
        attachMinimapMenu();
      }
      // 搜索跳转:定位到指定行
      applyReveal();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePath, contents, visible]);

  // 设置变化 / 宿主主题切换时实时刷新编辑器(Monaco 颜色在定义主题时烘焙为 hex,须重新解析 CSS 变量)
  React.useEffect(function () {
    function refresh() {
      // 终端主题不依赖 monaco,先于 monaco 守卫刷新
      refreshTermThemes();
      if (!monacoInst.current || !window.monaco || !window.monaco.editor) return;
      try {
        ensureMonacoThemes();
        window.monaco.editor.setTheme(editorThemeName());
        monacoInst.current.updateOptions({
          wordWrap: editorSettings.wordWrap ? "on" : "off",
          lineNumbers: editorSettings.hideLineNumbers ? "off" : "on",
          minimap: { enabled: editorSettings.minimap, size: editorSettings.minimapSize, showSlider: editorSettings.minimapSlider, renderCharacters: editorSettings.renderCharacters }
        });
        var m = monacoInst.current.getModel();
        if (m) window.monaco.editor.setModelLanguage(m, editorSettings.highlight ? langOf(activeTabRef.current ? activeTabRef.current.name : "") : "plaintext");
        attachMinimapMenu();
      } catch (e) {}
    }
    var timer = null;
    function schedule() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(refresh, 120);
    }
    window.addEventListener("dsh-editor-settings", refresh);
    // 宿主应用切换主题通常通过改 <html>/<body> 的属性(类名 / 内联 CSS 变量 / data-theme)实现
    var mo = null;
    if (typeof MutationObserver !== "undefined") {
      mo = new MutationObserver(schedule);
      var roots = [document.documentElement, document.body];
      for (var i = 0; i < roots.length; i++) {
        if (roots[i]) mo.observe(roots[i], { attributes: true, attributeFilter: ["class", "style", "data-theme", "data-appearance", "data-color-mode", "data-color-scheme"] });
      }
    }
    // 外观=跟随系统:系统深浅色切换也即时生效
    var mq = null, offMq = null;
    if (typeof window !== "undefined" && window.matchMedia) {
      mq = window.matchMedia("(prefers-color-scheme: dark)");
      if (mq && typeof mq.addEventListener === "function") {
        mq.addEventListener("change", refresh);
        offMq = function () { mq.removeEventListener("change", refresh); };
      } else if (mq && typeof mq.addListener === "function") {
        mq.addListener(refresh);
        offMq = function () { mq.removeListener(refresh); };
      }
    }
    return function () {
      window.removeEventListener("dsh-editor-settings", refresh);
      if (mo) mo.disconnect();
      if (offMq) offMq();
      if (timer) clearTimeout(timer);
    };
  }, []);

  // 缩略图菜单:点击外部 / Esc 关闭(含二级菜单)
  React.useEffect(function () {
    if (!mmMenu) return;
    function onDown(e) {
      if (mmRef.current && mmRef.current.contains(e.target)) return;
      if (mmSubEl.current && mmSubEl.current.contains(e.target)) return;
      setMmMenu(null);
      setMmSub(null);
    }
    function onKey(e) {
      if (e.key === "Escape") { setMmMenu(null); setMmSub(null); }
    }
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return function () { window.removeEventListener("mousedown", onDown); window.removeEventListener("keydown", onKey); };
  }, [mmMenu]);

  function saveActive() {
    if (!activePath || !root) return;
    var cur = contents[activePath];
    if (!cur) return;
    if (cur.virtual) { setMsg("搜索结果只读,无法保存"); return; }
    if (cur.binary) { setMsg("二进制文件,无法保存为文本"); return; }
    var content = monacoInst.current ? monacoInst.current.getValue() : cur.content;
    fetch("/dsh-sidebar/write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cwd: root, path: activePath, content: content })
    }).then(function (r) { return r.json(); }).then(function (d) {
      if (d && d.ok) {
        setContents(function (prev) { return { ...prev, [activePath]: { ...prev[activePath], content: content, dirty: false } }; });
        setMsg("已保存 " + baseName(activePath));
      } else setMsg((d && d.message) || "保存失败");
    }).catch(function (e) { setMsg(String(e && e.message ? e.message : e)); });
  }

  // 面板占位
  React.useEffect(function () {
    if (!visible) return;
    var panel = panelRef.current;
    if (!panel) return;
    var rootEl = null;
    var node = panel.parentElement;
    while (node && node !== document.body) {
      var stc = getComputedStyle(node);
      if (stc.display === "flex" && stc.flexDirection === "column" && node.offsetHeight >= window.innerHeight * 0.7) {
        rootEl = node;
        break;
      }
      node = node.parentElement;
    }
    if (!rootEl) return;
    var origPad = parseFloat(getComputedStyle(rootEl).paddingRight) || 0;
    function apply() {
      var w = panel.offsetWidth;
      rootEl.style.paddingRight = (origPad + w + 8) + "px";
    }
    apply();
    var ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(apply) : null;
    if (ro) ro.observe(rootEl);
    window.addEventListener("resize", apply);
    return function () {
      if (ro) ro.disconnect();
      window.removeEventListener("resize", apply);
      rootEl.style.paddingRight = origPad + "px";
    };
  }, [visible, width]);

  // 拖拽调宽
  React.useEffect(function () {
    if (!visible) return;
    function onMove(e) {
      setWidth(Math.min(1800, Math.max(480, window.innerWidth - e.clientX)));
    }
    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    var h = document.getElementById("sb-resize-handle");
    if (!h) return;
    function onDown() {
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    }
    h.addEventListener("mousedown", onDown);
    return function () { h.removeEventListener("mousedown", onDown); onUp(); };
  }, [visible]);


  var headerBtn = React.createElement("button", {
    className: "sb-btn",
    title: "文件工作台",
    onClick: function () { setVisible(!visible); }
  }, React.createElement("i", { className: "ri-file-list-3-line" }), " 文件");


  if (!visible) return headerBtn;

  // 当前活动标签(状态栏语言模式等使用)
  var activeTab = null;
  for (var i = 0; i < tabs.length; i++) if (tabs[i].path === activePath) activeTab = tabs[i];
  activeTabRef.current = activeTab;
  var activeContent = activePath ? contents[activePath] : null;
  var activeIsMd = !!activeTab && /\.(md|markdown|mdown|mkd)$/i.test(activeTab.name);
  var showPreview = !!(activeContent && activeIsMd && mdPreview);
  var hasEditorFile = !!activeContent && !activeContent.binary && !activeContent.virtual;
  var searchGroups = null;
  if (searchRes && searchRes.length) {
    searchGroups = {};
    searchRes.forEach(function (r) { (searchGroups[r.path] = searchGroups[r.path] || []).push(r); });
  }

  return React.createElement(React.Fragment, null,
    headerBtn,
    React.createElement("div", { className: "sb-panel", ref: panelRef, style: { width: width } },
      React.createElement("div", { className: "sb-resize", id: "sb-resize-handle", title: "拖拽调整宽度" }),
      React.createElement("div", { className: "sb-main" },
        React.createElement("div", { className: "sb-editor" },
          tabs.length === 0 ? React.createElement("div", { className: "sb-editor-empty" },
            React.createElement("i", { className: "ri-file-list-3-line" }),
            React.createElement("div", null, "未打开文件"),
            React.createElement("div", { className: "sb-editor-empty-sub" }, "在右侧工作目录中选择文件,或使用搜索查找并打开")
          ) : React.createElement(EditorArea, {
            tabs: tabs,
            contents: contents,
            activePath: activePath,
            onSetActive: setActivePath,
            onCloseTab: closeTab,
            dragTabRef: dragTabRef,
            dragHover: dragHover,
            setDragHover: setDragHover,
            dragWRef: dragWRef,
            onDragStart: tabDragStart,
            onDragOver: tabDragOver,
            onDrop: tabDrop,
            onTabMenu: tabOpenMenu,
            root: root,
            onToggleDir: toggleDir,
            msg: msg,
            activeContent: activeContent,
            activeIsMd: activeIsMd,
            mdPreview: mdPreview,
            onTogglePreview: function () { setMdPreview(!mdPreview); },
            showPreview: showPreview,
            onSave: saveActive,
            onOpenVscode: openInVscode,
            moreRef: moreRef,
            onMoreMenu: toggleMoreMenu,
            monacoElRef: monacoElRef
          }),
          React.createElement(TerminalPanel, {
            termOpen: termOpen,
            termHeight: termHeight,
            termTabs: termTabs,
            termActive: termActive,
            termShell: termShell,
            termMenu: termMenu,
            termPanelRef: termPanelRef,
            termTypeRef: termTypeRef,
            termMenuRef: termMenuRef,
            onSetActive: setTermActive,
            onCloseTab: closeTermTab,
            onNewTerm: newTerm,
            onSetOpen: setTermOpen,
            onToggleType: toggleTermType,
            onPickShell: pickTermShell
          }),
          React.createElement(StatusBar, {
            hasEditorFile: hasEditorFile,
            cursorPos: cursorPos,
            indentSize: indentSize,
            indentMode: indentMode,
            encState: encState,
            eolState: eolState,
            langLabel: langLabel,
            activeTab: activeTab,
            onOpen: stOpen
          })
        ),
        React.createElement("div", { className: "sb-ex-resize", id: "sb-ex-resize", title: "拖拽调整宽度", onMouseDown: startExplorerDrag }),
        React.createElement("div", { className: "sb-explorer", style: { width: explorerW } },
          React.createElement("div", { className: "sb-ex-topbar" },
            React.createElement("button", { className: "sb-ex-tab" + (exTab === "files" ? " active" : ""), title: "文件", onClick: function () { setExTab("files"); } }, React.createElement("i", { className: "ri-folder-line" })),
            React.createElement("button", { className: "sb-ex-tab" + (exTab === "search" ? " active" : ""), title: "搜索", onClick: function () { setExTab("search"); } }, React.createElement("i", { className: "ri-search-line" })),
            React.createElement("button", { className: "sb-ex-tab" + (termOpen ? " active" : ""), title: "终端", onClick: function () {
              if (!termOpen && termTabs.length === 0) newTerm();
              else setTermOpen(!termOpen);
            } }, React.createElement("i", { className: "ri-terminal-line" })),
            React.createElement("button", { className: "sb-ex-tab" + (exTab === "git" ? " active" : ""), title: "Git", onClick: function () { setExTab("git"); } }, React.createElement("i", { className: "ri-git-branch-line" })),
            React.createElement("span", { className: "sb-spacer" }),
            React.createElement("button", { className: "sb-ex-tab", title: "关闭面板", onClick: function () { setVisible(false); } }, React.createElement("i", { className: "ri-close-line" }))
          ),
          React.createElement("div", { className: "sb-ex-body" },
            React.createElement("div", { style: { display: exTab === "files" ? "flex" : "none", flex: 1, minHeight: 0, flexDirection: "column" } },
              React.createElement("div", { className: "sb-ex-head" },
                React.createElement("span", null, root ? baseName(root) : "资源管理器"),
                React.createElement("span", { className: "sb-spacer" }),
                React.createElement("button", { className: "sb-iconbtn", title: "刷新资源管理器", onClick: function () { if (root) loadChildren(root); } }, React.createElement("i", { className: "ri-refresh-line" }))
              ),
              React.createElement("div", { className: "sb-ex-tree" },
                React.createElement(FileTree, {
                  root: root,
                  tree: tree,
                  expanded: expanded,
                  activePath: activePath,
                  ctxSelPath: ctxSelPath,
                  onToggleDir: toggleDir,
                  onOpenFile: openFile,
                  onCtxOpen: ctxOpen
                })
              )
            ),
            React.createElement(SearchPanel, {
              exTab: exTab,
              searchQ: searchQ,
              setSearchQ: setSearchQ,
              scheduleSearch: scheduleSearch,
              searchTimerRef: searchTimerRef,
              onClearSearch: clearSearch,
              searchMC: searchMC,
              setSearchMC: setSearchMC,
              searchWW: searchWW,
              setSearchWW: setSearchWW,
              searchRX: searchRX,
              setSearchRX: setSearchRX,
              doSearch: doSearch,
              detailsOpen: detailsOpen,
              setDetailsOpen: setDetailsOpen,
              replQ: replQ,
              setReplQ: setReplQ,
              searchPC: searchPC,
              setSearchPC: setSearchPC,
              doReplace: doReplace,
              filesFilterOpen: filesFilterOpen,
              setFilesFilterOpen: setFilesFilterOpen,
              incQ: incQ,
              setIncQ: setIncQ,
              excQ: excQ,
              setExcQ: setExcQ,
              searchModifiedOnly: searchModifiedOnly,
              setSearchModifiedOnly: setSearchModifiedOnly,
              searchOpenOnly: searchOpenOnly,
              setSearchOpenOnly: setSearchOpenOnly,
              searchMsg: searchMsg,
              searchBusy: searchBusy,
              searchRes: searchRes,
              searchGroups: searchGroups,
              collapsedGroups: collapsedGroups,
              onToggleGroup: toggleGroup,
              onOpenAt: openFileAt,
              onExclude: excludeFile,
              onReplaceFile: doReplaceFile,
              onReplaceLine: doReplaceLine,
              onToggleOpenOnly: toggleOpenOnly,
              onOpenSearchEditor: openSearchEditor,
              resScrollRef: resScrollRef,
              resWin: resWin,
              setResWin: setResWin,
              resFlatLenRef: resFlatLenRef
            }),
            React.createElement(GitPanel, { exTab: exTab, gitData: gitData, gitDiff: gitDiff, onOpenModal: gitOpenModal })
          )
        )
      ),
      moreOpen && morePos ? React.createElement(MoreMenu, { pos: morePos, menuRef: moreMenuRef, onCopyPath: copyPath, onReveal: revealInExplorer }) : null,
      mmMenu ? React.createElement(MinimapMenu, { mmMenu: mmMenu, mmSub: mmSub, mmRef: mmRef, mmSubEl: mmSubEl, onSet: mmSet, onSubOpen: mmSubOpen, onSubClose: mmSubClose, onSubCancel: mmSubCancel }) : null,
      ctxMenu ? React.createElement(CtxMenu, { menu: ctxMenu, menuRef: ctxMenuRef, onAct: ctxAct, onOpenInEditor: ctxOpenInEditor, onOpenInTerm: ctxOpenInTerm, onAddContext: ctxAddContext, onCopyRel: ctxCopyRel, onCopyAbs: ctxCopyAbs, onReveal: ctxReveal, onVsc: ctxVsc, onRename: ctxRename }) : null,
      tabMenu ? React.createElement(TabMenu, { menu: tabMenu, menuRef: tabMenuRef, onClose: tabClose, onCloseOthers: tabCloseOthers, onCloseAll: tabCloseAll }) : null,
      stPopup ? React.createElement(StatusPopup, { popup: stPopup, menuRef: stMenuRef, goLineVal: goLineVal, onGoLineVal: setGoLineVal, onGoToLine: stGoToLine, onClose: stClose, indentMode: indentMode, indentSize: indentSize, onApplyIndent: stApplyIndent, encState: encState, onApplyEncoding: stApplyEncoding, eolState: eolState, onApplyEol: stApplyEol, langLabel: langLabel, activeTab: activeTab, onApplyLang: stApplyLang }) : null,
      gitModalOpen ? React.createElement(GitModal, { gitBranch: gitBranch, gitBranchMenu: gitBranchMenu, gitMsg: gitMsg, gitInclude: gitInclude, gitBusy: gitBusy, gitResult: gitResult, gitData: gitData, gitDiff: gitDiff, onClose: function () { setGitModalOpen(false); }, onToggleBranchMenu: function () { setGitBranchMenu(!gitBranchMenu); }, onPickBranch: function (b) { setGitBranch(b); setGitBranchMenu(false); }, onMsgChange: setGitMsg, onIncludeChange: setGitInclude, onCommit: gitCommit, onPush: gitPush, onGenAi: gitGenAi }) : null
    )
  );
}
