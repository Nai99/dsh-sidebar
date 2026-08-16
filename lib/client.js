window.__ModuleLoader__.load({ id: "dsh-sidebar", factory: (require) => { var module = { exports: {} }; var exports = module.exports;
"use strict";

// dsh-sidebar client —— VS Code 风格右侧文件工作台 v3
// 顶部:多标签栏 + 刷新/关闭;内容区:左编辑器(面包屑+Monaco),右资源管理器(扁平目录树+彩色文件图标)
var React = require("react");

var CSS = ".sb-btn{display:inline-flex;align-items:center;gap:5px;font-size:12px;padding:4px 8px;border:none;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;border-radius:6px;font-family:inherit}\n" +
  ".sb-btn i{font-size:14px}\n" +
  ".sb-btn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}\n" +
  ".sb-panel{position:fixed;top:0;bottom:0;right:0;background:var(--dsw-alias-bg-base);border-left:1px solid var(--dsw-alias-border-l2);z-index:900;display:flex;flex-direction:column}\n" +
  ".sb-resize{position:absolute;top:0;bottom:0;left:-3px;width:5px;cursor:ew-resize;z-index:5}\n" +
  ".sb-resize:hover{background:var(--dsw-alias-brand-primary);opacity:.7}\n" +
  ".sb-tabs{display:flex;align-items:center;gap:2px;padding:5px 8px;border-bottom:1px solid var(--dsw-alias-border-l2);flex:none;overflow-x:auto}\n" +
  ".sb-tab{display:inline-flex;align-items:center;gap:5px;font-size:12px;padding:3px 8px;border-radius:4px;color:var(--dsw-alias-label-tertiary);cursor:pointer;white-space:nowrap;flex:none;user-select:none;transition:transform .18s ease}\n" +
  ".sb-tab i{font-size:12px}\n" +
  ".sb-tab:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}\n" +
  ".sb-tab.active{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1)}\n" +
  ".sb-tab-x{font-size:11px;opacity:.6;padding:0 3px;border-radius:3px}\n" +
  ".sb-tab-x:hover{opacity:1;background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}\n" +
  ".sb-spacer{flex:1}\n" +
  ".sb-iconbtn{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border:none;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;border-radius:6px;font-size:14px;flex:none}\n" +
  ".sb-iconbtn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}\n" +
  ".sb-main{flex:1;min-height:0;display:flex}\n" +
  ".sb-editor{flex:1;min-width:0;display:flex;flex-direction:column;position:relative}\n" +
  ".sb-breadcrumbs{display:flex;align-items:center;gap:2px;padding:4px 10px;border-bottom:1px solid var(--dsw-alias-border-l2);flex:none;font-size:12px;color:var(--dsw-alias-label-secondary);overflow-x:auto;white-space:nowrap}\n" +
  ".sb-crumb{cursor:pointer;padding:2px 4px;border-radius:4px}\n" +
  ".sb-crumb:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}\n" +
  ".sb-crumb.locked{color:var(--dsw-alias-label-tertiary);cursor:default}\n" +
  ".sb-crumb.locked:hover{background:transparent;color:var(--dsw-alias-label-tertiary)}\n" +
  ".sb-editor-body{flex:1;min-height:0;position:relative;background:var(--dsw-alias-markdown-code-block)}\n" +
  ".sb-editor-body .monaco-editor{border:none !important;outline:none !important}\n" +
  ".sb-editor-body .monaco-editor .scroll-decoration{box-shadow:none !important}\n" +
  ".sb-explorer{flex:none;overflow:hidden;padding:6px 4px;border-left:1px solid var(--dsw-alias-border-l2);box-sizing:border-box;display:flex;flex-direction:column}\n" +
  ".sb-ex-resize{width:5px;flex:none;cursor:col-resize;margin-left:-1px;background:transparent}\n" +
  ".sb-ex-resize:hover{background:var(--dsw-alias-brand-primary);opacity:.7}\n" +
  ".sb-ex-resize.dragging{background:var(--dsw-alias-brand-primary);opacity:.7}\n" +
  ".sb-ex-topbar{display:flex;align-items:center;gap:2px;padding:4px 6px;border-bottom:1px solid var(--dsw-alias-border-l2);flex:none}\n" +
  ".sb-ex-tab{display:inline-flex;align-items:center;justify-content:center;width:30px;height:26px;border:none;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;border-radius:6px;font-size:15px;flex:none}\n" +
  ".sb-ex-tab:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}\n" +
  ".sb-ex-tab.active{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1)}\n" +
  ".sb-ex-body{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden}\n" +
  ".sb-ex-tree{flex:1;min-height:0;overflow:auto;padding:4px}\n" +
  ".sb-search{padding:6px 8px 8px;display:flex;flex-direction:column;gap:6px;flex:1;min-height:0;overflow:hidden}\n" +
  ".sb-search-head{display:flex;align-items:center;gap:2px}\n" +
  ".sb-search-title{font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary)}\n" +
  ".sb-search-main{display:flex;gap:2px;align-items:stretch}\n" +
  ".sb-search-right{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}\n" +
  ".sb-search-box{display:flex;align-items:center;gap:2px;flex:1;min-width:0;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;background:var(--dsw-alias-bg-layer-1);padding:0 2px 0 6px}\n" +
  ".sb-search-box:focus-within{border-color:var(--dsw-alias-brand-primary)}\n" +
  ".sb-search-input{flex:1;min-width:0;border:none;background:transparent;color:var(--dsw-alias-label-primary);font-size:12px;outline:none;font-family:inherit;padding:5px 0}\n" +
  ".sb-search-input::placeholder{color:var(--dsw-alias-label-tertiary)}\n" +
  ".sb-search-plain{box-sizing:border-box;width:100%;padding:5px 8px;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-size:12px;outline:none;font-family:inherit}\n" +
  ".sb-search-plain:focus{border-color:var(--dsw-alias-brand-primary)}\n" +
  ".sb-sf-bar{display:flex;align-items:center;gap:6px;padding:2px 0}\n" +
  ".sb-sf-title{font-size:11px;color:var(--dsw-alias-label-tertiary)}\n" +
  ".sb-sf-opt{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--dsw-alias-label-secondary);cursor:pointer;padding:2px 0}\n" +
  ".sb-sf-opt input{accent-color:var(--dsw-alias-brand-primary);cursor:pointer}\n" +
  ".sb-search-opt{width:22px;height:22px;border:none;background:transparent;color:var(--dsw-alias-label-tertiary);border-radius:5px;font-size:11px;cursor:pointer;font-family:inherit;flex:none;display:inline-flex;align-items:center;justify-content:center}\n" +
  ".sb-search-opt:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}\n" +
  ".sb-search-opt.on{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l2)}\n" +
  ".sb-search-opt.on:hover{background:var(--dsw-alias-interactive-bg-hover)}\n" +
  ".sb-search-opt i{font-size:14px}\n" +
  ".sb-search-opt.sb-search-collapse{align-self:stretch;height:auto}\n" +
  ".sb-hit{background:color-mix(in srgb, var(--dsw-alias-brand-primary) 32%, transparent);color:var(--dsw-alias-label-primary);border-radius:2px}\n" +
  ".sb-search-res{flex:1;min-height:0;overflow:auto;display:flex;flex-direction:column;gap:1px}\n" +
  ".sb-sr-item{padding:4px 6px;padding-left:18px;border-radius:5px;font-size:12px;color:var(--dsw-alias-label-secondary);cursor:pointer;line-height:1.5;display:flex;align-items:baseline;gap:8px;position:relative}\n" +
  ".sb-sr-item:hover{background:var(--dsw-alias-interactive-bg-hover)}\n" +
  ".sb-sr-ln{flex:none;min-width:22px;text-align:right;color:var(--dsw-alias-label-tertiary);font-size:11px;font-family:Consolas,monospace}\n" +
  ".sb-sr-file{display:flex;align-items:center;gap:6px;padding:3px 6px;border-radius:5px;font-size:12px;color:var(--dsw-alias-label-primary);cursor:pointer;white-space:nowrap;position:sticky;top:0;background:var(--dsw-alias-bg-base);z-index:1}\n" +
  ".sb-sr-file:hover{background:var(--dsw-alias-interactive-bg-hover)}\n" +
  ".sb-sr-chev{width:16px;flex:none;display:inline-flex;align-items:center;justify-content:center;color:var(--dsw-alias-label-tertiary);font-size:13px;border-radius:4px}\n" +
  ".sb-sr-chev:hover{background:var(--dsw-alias-interactive-bg-hover)}\n" +
  ".sb-count{margin-left:auto;color:var(--dsw-alias-label-tertiary);font-size:11px}\n" +
  ".sb-sr-file:hover .sb-count{display:none}\n" +
  ".sb-sr-actions{position:absolute;right:4px;top:50%;transform:translateY(-50%);display:none;gap:2px}\n" +
  ".sb-sr-item:hover .sb-sr-actions{display:inline-flex}\n" +
  ".sb-sr-file:hover .sb-sr-actions{display:inline-flex}\n" +
  ".sb-res-head{min-height:20px;font-size:11px;line-height:1.6;color:var(--dsw-alias-label-tertiary)}\n" +
  ".sb-res-link{color:var(--dsw-alias-label-secondary);cursor:pointer}\n" +
  ".sb-res-link:hover{color:var(--dsw-alias-label-primary);text-decoration:underline}\n" +
  ".sb-res-link.on{color:var(--dsw-alias-brand-primary)}\n" +
  ".sb-sr-snip{font-size:11px;color:var(--dsw-alias-label-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n" +
  ".sb-sr-ghead{margin-top:6px}\n" +
  ".sb-git{padding:8px;display:flex;flex-direction:column;gap:8px;flex:1;min-height:0;overflow:hidden}\n" +
  ".sb-git-branch{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:999px;font-size:12px;color:var(--dsw-alias-label-primary);align-self:flex-start}\n" +
  ".sb-git-files{flex:1;min-height:0;overflow:auto;display:flex;flex-direction:column;gap:1px}\n" +
  ".sb-git-file{display:flex;align-items:center;gap:6px;padding:3px 6px;border-radius:5px;font-size:12px;color:var(--dsw-alias-label-secondary);white-space:nowrap}\n" +
  ".sb-git-file:hover{background:var(--dsw-alias-interactive-bg-hover)}\n" +
  ".sb-git-nums{margin-left:auto;display:flex;gap:6px;font-size:11px;flex:none}\n" +
  ".sb-git-add{color:#2da44e}\n" +
  ".sb-git-del{color:#f14c4c}\n" +
  ".sb-git-branchrow{display:flex;align-items:center;gap:8px}\n" +
  ".sb-git-actions{flex:none;display:flex;padding:10px}\n" +
  ".sb-git-act{flex:1;display:inline-flex;align-items:center;justify-content:center;height:34px;border:none;border-radius:8px;background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground);font-size:13px;cursor:pointer;font-family:inherit}\n" +
  ".sb-git-act:hover{background:var(--dsw-alias-button-primary-hover)}\n" +
  ".gb-modal-mask{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:950;display:flex;align-items:center;justify-content:center}\n" +
  ".gb-modal{width:420px;max-width:calc(100vw - 40px);background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);border-radius:14px;padding:14px 16px;box-shadow:var(--dsw-shadow-lv3, 0 8px 40px rgba(0,0,0,.4))}\n" +
  ".gb-head{display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap}\n" +
  ".gb-branch{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary);border:1px solid var(--dsw-alias-border-l1);border-radius:999px;padding:3px 10px;cursor:pointer;background:var(--dsw-alias-bg-base);position:relative}\n" +
  ".gb-branch:hover{border-color:var(--dsw-alias-brand-primary)}\n" +
  ".gb-branchmenu{position:absolute;top:calc(100% + 4px);left:0;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;max-height:180px;overflow:auto;z-index:20;min-width:140px;box-shadow:var(--dsw-shadow-lv2, 0 4px 20px rgba(0,0,0,.3))}\n" +
  ".gb-branchitem{padding:5px 12px;font-size:12px;color:var(--dsw-alias-label-primary);cursor:pointer}\n" +
  ".gb-branchitem:hover{background:var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,.12))}\n" +
  ".gb-branchitem.active{color:var(--dsw-alias-brand-primary);font-weight:600}\n" +
  ".gb-stat{font-size:12px;font-family:Consolas,monospace;margin-left:auto}\n" +
  ".gb-stat-add{color:#3fb950}\n" +
  ".gb-stat-del{color:#f85149}\n" +
  ".gb-sub{font-size:11px;color:var(--dsw-alias-label-tertiary);margin-left:8px}\n" +
  ".gb-msgwrap{position:relative}\n" +
  ".gb-input{width:100%;height:150px;min-height:150px;background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;color:var(--dsw-alias-label-primary);font-size:13px;padding:8px 36px 8px 12px;box-sizing:border-box;resize:none;font-family:inherit}\n" +
  ".gb-input:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}\n" +
  ".gb-input::placeholder{color:var(--dsw-alias-label-tertiary)}\n" +
  ".gb-ai{position:absolute;top:8px;right:8px;width:26px;height:26px;border:none;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:14px}\n" +
  ".gb-ai:hover{color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,.12))}\n" +
  ".gb-ai:disabled{opacity:.5;cursor:default}\n" +
  ".gb-opt{display:flex;align-items:center;gap:8px;margin:10px 0 12px;font-size:12px;color:var(--dsw-alias-label-secondary);cursor:pointer;user-select:none}\n" +
  ".gb-opt input{accent-color:var(--dsw-alias-brand-primary)}\n" +
  ".gb-btns{display:flex;flex-direction:column;gap:8px}\n" +
  ".gb-btn{width:100%;padding:8px 16px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1);background:transparent;color:var(--dsw-alias-label-primary);font-size:13px;cursor:pointer;box-sizing:border-box}\n" +
  ".gb-btn:hover{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}\n" +
  ".gb-btn.main{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}\n" +
  ".gb-btn:disabled{opacity:.5;cursor:default}\n" +
  ".gb-msg{font-size:12px;margin-top:10px}\n" +
  ".gb-msg.ok{color:#3fb950}\n" +
  ".gb-msg.err{color:#f85149}\n" +
  ".sb-git-st{width:15px;height:15px;flex:none;border-radius:3px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;line-height:1}\n" +
  ".sb-git-st.U{background:color-mix(in srgb, #f7c600 22%, transparent);color:#f7c600}\n" +
  ".sb-git-st.A{background:color-mix(in srgb, #2da44e 22%, transparent);color:#2da44e}\n" +
  ".sb-git-st.D{background:color-mix(in srgb, #f14c4c 22%, transparent);color:#f14c4c}\n" +
  ".sb-git-st.M{background:color-mix(in srgb, #e6c07b 22%, transparent);color:#e6c07b}\n" +
  ".sb-git-st.R{background:color-mix(in srgb, #2da44e 22%, transparent);color:#2da44e}\n" +
  ".sb-term-panel{flex:none;display:flex;flex-direction:column;min-height:120px;border-top:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);position:relative}\n" +
  ".sb-term-resize{height:5px;cursor:ns-resize;flex:none;background:transparent;position:relative}\n" +
  ".sb-term-resize:hover{background:var(--dsw-alias-brand-primary);opacity:.7}\n" +
  ".sb-term-head{flex:none;display:flex;align-items:center;gap:2px;padding:4px 8px;background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 30%, transparent);border-bottom:1px solid var(--dsw-alias-border-l1)}\n" +
  ".sb-term-tabs{flex:1;min-width:0;display:flex;align-items:center;gap:2px;overflow-x:auto;overflow-y:hidden;scrollbar-width:thin}\n" +
  ".sb-term-tabs::-webkit-scrollbar{height:4px}\n" +
  ".sb-term-tabs::-webkit-scrollbar-thumb{background:var(--dsw-alias-scrollbar-bg-l1,#3c3c3d);border-radius:2px}\n" +
  ".sb-term-brand{display:inline-flex;align-items:center;gap:5px;color:var(--dsw-alias-label-secondary);font-size:12px;padding:0 10px 0 4px;border-right:1px solid var(--dsw-alias-border-l1);margin-right:4px;flex:none}\n" +
  ".sb-term-brand i{font-size:13px}\n" +
  ".sb-term-capsule{display:inline-flex;align-items:center;border:1px solid var(--dsw-alias-border-l1);border-radius:999px;overflow:hidden;flex:none;margin-left:6px}\n" +
  ".sb-term-type{display:inline-flex;align-items:center;gap:4px;font-size:12px;padding:3px 10px;border:none;background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;font-family:inherit;position:relative}\n" +
  ".sb-term-type:hover{color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-interactive-bg-hover)}\n" +
  ".sb-term-capsule-sep{width:1px;height:14px;background:var(--dsw-alias-border-l1)}\n" +
  ".sb-term-capsule-new{display:inline-flex;align-items:center;justify-content:center;width:26px;height:24px;border:none;background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;font-size:13px}\n" +
  ".sb-term-capsule-new:hover{color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-interactive-bg-hover)}\n" +
  ".sb-term-close{display:inline-flex;align-items:center;justify-content:center;width:24px;height:22px;border:none;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;border-radius:4px;flex:none;font-size:14px;margin-left:6px}\n" +
  ".sb-term-close:hover{color:var(--dsw-alias-state-error-primary);background:var(--dsw-alias-interactive-bg-hover)}\n" +
  ".sb-term-tab{display:inline-flex;align-items:center;gap:6px;font-size:12px;padding:3px 8px;border-radius:4px;border:1px solid transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;white-space:nowrap;flex:none;user-select:none}\n" +
  ".sb-term-tab i{font-size:12px;color:var(--dsw-alias-label-tertiary)}\n" +
  ".sb-term-tab:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}\n" +
  ".sb-term-tab.active{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base)}\n" +
  ".sb-term-tab.active i{color:var(--dsw-alias-label-secondary)}\n" +
  ".sb-term-tab-x{font-size:11px;opacity:.6;padding:0 3px;border-radius:3px}\n" +
  ".sb-term-tab-x:hover{opacity:1;background:rgba(255,255,255,.14);color:#fff}\n" +
  ".sb-term-body{flex:1;min-height:0;position:relative}\n" +
  ".sb-term{position:absolute;inset:0;padding:6px 0 0 6px;overflow:hidden}\n" +
  ".sb-term .xterm{height:100%}\n" +
  ".sb-editor-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:var(--dsw-alias-label-tertiary);font-size:12px;user-select:none}\n" +
  ".sb-editor-empty i{font-size:34px;opacity:.35}\n" +
  ".sb-editor-empty-sub{font-size:11px;opacity:.7}\n" +
  ".sb-preview{flex:1;min-height:0;overflow:auto;background:var(--dsw-alias-bg-base)}\n" +
  ".sb-md{padding:16px 20px 40px;font-size:13px;line-height:1.75;color:var(--dsw-alias-label-primary);max-width:760px}\n" +
  ".sb-md h1,.sb-md h2,.sb-md h3,.sb-md h4,.sb-md h5,.sb-md h6{margin:18px 0 8px;line-height:1.3;font-weight:600}\n" +
  ".sb-md h1{font-size:22px;border-bottom:1px solid var(--dsw-alias-border-l2);padding-bottom:6px}\n" +
  ".sb-md h2{font-size:18px;border-bottom:1px solid var(--dsw-alias-border-l2);padding-bottom:4px}\n" +
  ".sb-md h3{font-size:15px}.sb-md h4{font-size:13px}\n" +
  ".sb-md p{margin:8px 0}\n" +
  ".sb-md code{background:var(--dsw-alias-bg-layer-1);border-radius:4px;padding:1px 5px;font-family:Consolas,'Courier New',monospace;font-size:12px}\n" +
  ".sb-md pre{background:var(--dsw-alias-bg-layer-1);border-radius:8px;padding:10px 12px;overflow:auto;border:1px solid var(--dsw-alias-border-l1)}\n" +
  ".sb-md pre code{background:none;padding:0;font-size:12px}\n" +
  ".sb-md a{color:var(--dsw-alias-brand-primary);text-decoration:none}\n" +
  ".sb-md a:hover{text-decoration:underline}\n" +
  ".sb-md blockquote{margin:8px 0;padding:2px 12px;border-left:3px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary)}\n" +
  ".sb-md ul,.sb-md ol{margin:8px 0;padding-left:22px}\n" +
  ".sb-md li{margin:3px 0}\n" +
  ".sb-md hr{border:none;border-top:1px solid var(--dsw-alias-border-l2);margin:16px 0}\n" +
  ".sb-md table{border-collapse:collapse;margin:10px 0;font-size:12px}\n" +
  ".sb-md th,.sb-md td{border:1px solid var(--dsw-alias-border-l2);padding:5px 10px}\n" +
  ".sb-md th{background:var(--dsw-alias-bg-layer-1)}\n" +
  ".sb-md img{max-width:100%}\n" +
  ".sb-binary{flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:var(--dsw-alias-label-tertiary);font-size:12px;padding:16px;overflow:auto}\n" +
  ".sb-binary i{font-size:36px;opacity:.4}\n" +
  ".sb-binary-msg{max-width:420px;text-align:center;line-height:1.7}\n" +
  ".sb-tab.dragging{opacity:.5}\n" +
  ".sb-status{display:flex;align-items:center;height:24px;padding:0 6px;border-top:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);flex:none;font-size:11px;overflow-x:auto;white-space:nowrap;box-sizing:border-box}\n" +
  ".sb-st-seg{display:inline-flex;align-items:center;gap:4px;height:100%;padding:0 8px;border:none;background:transparent;color:var(--dsw-alias-label-secondary);font-size:11px;cursor:pointer;border-radius:4px;font-family:inherit;flex:none}\n" +
  ".sb-st-seg:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}\n" +
  ".sb-st-seg i{font-size:12px}\n" +
  ".sb-st-seg.off{opacity:.4;cursor:default}\n" +
  ".sb-st-seg.off:hover{background:transparent;color:var(--dsw-alias-label-secondary)}\n" +
  ".sb-modal-mask{position:fixed;inset:0;background:var(--dsw-alias-bg-mask-1);z-index:980;display:flex;align-items:center;justify-content:center}\n" +
  ".sb-modal{background:var(--dsw-specific-menu);border:1px solid var(--dsw-alias-border-inverted);border-radius:14px;box-shadow:var(--dsw-shadow-lv3);width:min(560px,92vw);max-height:82vh;display:flex;flex-direction:column;overflow:hidden}\n" +
  ".sb-modal-head{display:flex;align-items:center;gap:8px;padding:12px 16px;border-bottom:1px solid var(--dsw-alias-border-l2);font-size:14px;font-weight:600;color:var(--dsw-alias-label-primary);flex:none}\n" +
  ".sb-modal-body{padding:14px 16px;overflow:auto;display:flex;flex-direction:column;gap:2px}\n" +
  ".sb-modal-item{padding:8px 10px;border-radius:6px;font-size:13px;color:var(--dsw-alias-label-primary);cursor:pointer}\n" +
  ".sb-modal-item:hover{background:var(--dsw-alias-interactive-bg-hover)}\n" +
  ".sb-modal-item.on{color:var(--dsw-alias-brand-primary)}\n" +
  ".sb-modal-grid{display:grid;grid-template-columns:1fr 1fr;gap:2px}\n" +
  ".sb-ex-head{display:flex;align-items:center;gap:6px;padding:2px 8px 6px;font-size:11px;color:var(--dsw-alias-label-tertiary);letter-spacing:.05em}\n" +
  ".sb-node{display:flex;align-items:center;gap:5px;padding:2px 6px;border-radius:5px;font-size:12px;color:var(--dsw-alias-label-primary);cursor:pointer;white-space:nowrap;user-select:none}\n" +
  ".sb-node:hover{background:var(--dsw-alias-interactive-bg-hover)}\n" +
  ".sb-node.active{background:var(--dsw-alias-bg-layer-1)}\n" +
  ".sb-node.ctx{box-shadow:inset 0 0 0 1px var(--dsw-alias-brand-primary);background:var(--dsw-alias-bg-layer-1)}\n" +
  ".sb-node .sb-arrow{width:12px;flex:none;font-size:10px;color:var(--dsw-alias-label-tertiary);text-align:center}\n" +
  ".sb-node i{flex:none}\n" +
  ".sb-node .sb-fname{overflow:hidden;text-overflow:ellipsis}\n" +
  ".sb-editor-head{display:flex;align-items:center;gap:8px;padding:5px 10px;border-bottom:1px solid var(--dsw-alias-border-l2);flex:none}\n" +
  ".sb-save{padding:3px 12px;border-radius:6px;border:1px solid var(--dsw-alias-border-l1);background:transparent;color:var(--dsw-alias-label-primary);font-size:12px;cursor:pointer}\n" +
  ".sb-save:hover{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}\n" +
  ".sb-save:disabled{opacity:.5;cursor:default}\n" +
  ".sb-msg{font-size:11px;color:var(--dsw-alias-label-tertiary)}\n" +
  ".sb-empty{display:flex;align-items:center;justify-content:center;height:100%;color:var(--dsw-alias-label-tertiary);font-size:12px}\n" +
  ".es-tabs{display:flex;gap:24px;border-bottom:1px solid var(--dsw-alias-border-l2);position:relative;margin-bottom:14px}\n" +
  ".es-tab{padding:7px 2px 9px;font-size:13px;color:var(--dsw-alias-label-tertiary);cursor:pointer;position:relative;border:none;background:none;font-family:inherit}\n" +
  ".es-tab.active{color:var(--dsw-alias-label-primary)}\n" +
  ".es-indicator{position:absolute;bottom:-1px;height:2px;border-radius:2px;background:var(--dsw-alias-label-primary);transition:left .25s cubic-bezier(.4,0,.2,1),width .25s cubic-bezier(.4,0,.2,1)}\n" +
  ".es-row{display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--dsw-alias-border-l1);font-size:13px;color:var(--dsw-alias-label-primary)}\n" +
  ".es-switch{width:36px;height:20px;border-radius:999px;background:var(--dsw-alias-border-l2);position:relative;cursor:pointer;transition:background .2s;border:none;flex:none}\n" +
  ".es-switch.on{background:var(--dsw-alias-brand-primary)}\n" +
  ".es-switch::after{content:\"\";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.3)}\n" +
  ".es-switch.on::after{transform:translateX(16px)}\n" +
  ".es-radio{display:flex;flex-direction:column;gap:8px;padding:9px 0}\n" +
  ".es-radio-item{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--dsw-alias-label-primary);cursor:pointer}\n" +
  ".es-radio-item input{accent-color:var(--dsw-alias-brand-primary)}\n" +
  ".es-desc{font-size:11px;color:var(--dsw-alias-label-tertiary);margin-top:2px}\n" +
  ".sb-menu{position:fixed;background:var(--dsw-specific-menu);border:1px solid var(--dsw-alias-border-inverted);border-radius:12px;min-width:150px;z-index:950;box-shadow:var(--dsw-shadow-lv3);overflow:hidden;padding:4px}\n" +
  ".sb-menu-item{padding:7px 10px;font-size:13px;color:var(--dsw-alias-label-primary);cursor:pointer;border-radius:6px;margin:0 2px;display:flex;align-items:center;gap:6px}\n" +
  ".sb-menu-item:hover{background:var(--dsw-alias-interactive-bg-hover)}\n" +
  ".sb-menu-item.on{color:var(--dsw-alias-brand-primary)}\n" +
  ".sb-menu-group{font-size:10px;color:var(--dsw-alias-label-tertiary);padding:6px 14px 2px;letter-spacing:.05em}\n" +
  ".sb-menu-sep{height:1px;background:var(--dsw-alias-border-l2);margin:4px 8px}\n" +
  ".sb-mmi{width:14px;text-align:center;flex:none;font-size:12px}\n" +
  ".sb-subarrow{margin-left:auto;flex:none;font-size:14px;color:var(--dsw-alias-label-tertiary)}";
if (typeof document !== "undefined" && !document.getElementById("sb-css")) {
  var st = document.createElement("style");
  st.id = "sb-css";
  st.textContent = CSS;
  document.head.appendChild(st);
}
if (typeof document !== "undefined" && !document.getElementById("sb-remix")) {
  var lk = document.createElement("link");
  lk.id = "sb-remix";
  lk.rel = "stylesheet";
  lk.href = "/dsh-sidebar/remixicon.css";
  document.head.appendChild(lk);
}

// 编辑器设置(持久化 localStorage + 事件广播)
var EDITOR_SETTINGS_KEY = "dsh-editor-settings";
var editorSettings = { wordWrap: true, hideLineNumbers: false, highlight: true, appearance: "system", minimap: true, minimapSize: "proportional", minimapSlider: "mouseover", renderCharacters: true, autoSave: false };
function loadEditorSettings() {
  try {
    var raw = localStorage.getItem(EDITOR_SETTINGS_KEY);
    if (raw) {
      var j = JSON.parse(raw);
      editorSettings = Object.assign({}, editorSettings, j);
    }
  } catch (e) {}
  return editorSettings;
}
function saveEditorSettings(s) {
  editorSettings = s;
  try { localStorage.setItem(EDITOR_SETTINGS_KEY, JSON.stringify(s)); } catch (e) {}
}
// 判断应用实际主题(深/浅):以 --dsw-alias-bg-base 的亮度为准,与 OS 的 prefers-color-scheme 解耦
// (dsh 应用主题与系统设置可能不一致,若按系统判断,未高亮文本会用错 base 颜色)
function appIsDark() {
  try {
    var c = cssColor("--dsw-alias-bg-base", "#0f1115");
    var m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(c);
    if (m) {
      var r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16);
      return (0.299 * r + 0.587 * g + 0.114 * b) < 128;
    }
  } catch (e) { /* ignore */ }
  return true;
}
function editorThemeName() {
  var dark = true;
  if (editorSettings.appearance === "light") dark = false;
  else if (editorSettings.appearance === "dark") dark = true;
  else dark = appIsDark(); // 跟随系统 = 跟随应用实际主题
  return dark ? "ds-transparent-dark" : "ds-transparent-light";
}
// 解析 CSS 变量为实际颜色,统一转成 #RRGGBB(A) 十六进制(Monaco 主题仅支持 hex,其它格式会解析失败变红)
function hexOf(v) {
  var s = Math.max(0, Math.min(255, Math.round(v))).toString(16);
  return s.length < 2 ? "0" + s : s;
}
function rgbaToHex(c) {
  var out = "#" + hexOf(c[0]) + hexOf(c[1]) + hexOf(c[2]);
  if (c[3] !== undefined && c[3] < 1) out += hexOf(c[3] * 255);
  return out;
}
function parseRgb(s) {
  s = String(s).trim();
  if (s.charAt(0) === "#") {
    var hx = s.slice(1);
    if (hx.length === 3 || hx.length === 4) hx = hx.split("").map(function (c) { return c + c; }).join("");
    if (hx.length >= 6) {
      var n = parseInt(hx.slice(0, 6), 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255, hx.length >= 8 ? parseInt(hx.slice(6, 8), 16) / 255 : 1];
    }
    return null;
  }
  var m = s.match(/[\d.]+/g);
  return m ? [+m[0], +(m[1] || 0), +(m[2] || 0), m[3] === undefined ? 1 : +m[3]] : null;
}
function cssColor(name, fallback) {
  try {
    var probe = document.createElement("span");
    probe.style.cssText = "position:fixed;left:-9999px;top:0;background:var(" + name + ");visibility:hidden";
    document.body.appendChild(probe);
    var c = getComputedStyle(probe).backgroundColor;
    document.body.removeChild(probe);
    var p = parseRgb(c);
    if (p && !(p[3] === 0)) return rgbaToHex(p);
  } catch (e) {}
  return fallback;
}
function mix(a, b, t) {
  var A = parseRgb(a), B = parseRgb(b);
  if (!A || !B) return a;
  return rgbaToHex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t, A[3] + (B[3] - A[3]) * t]);
}
function ensureMonacoThemes() {
  if (!window.monaco || !window.monaco.editor) return;
  var base = cssColor("--dsw-alias-bg-base", "#0f1115");
  var codeBg = cssColor("--dsw-alias-markdown-code-block", base); // 官方代码块背景
  var bg2 = cssColor("--dsw-alias-bg-layer-2", "#2c2c2e");
  var border = cssColor("--dsw-alias-border-l2", "#3f3f46");
  var label1 = cssColor("--dsw-alias-label-primary", "#e4e4e7");
  var label2 = cssColor("--dsw-alias-label-secondary", "#a1a1aa");
  var label3 = cssColor("--dsw-alias-label-tertiary", "#71717a");
  var brand = cssColor("--dsw-alias-brand-primary", "#4fc1ff");
  var clear = "rgba(0,0,0,0)";
  var colors = {
    "editor.background": codeBg,
    // 未高亮(plaintext)文本显式跟随 label-primary,避免受 base(vs/vs-dark) 日间/夜间默认值影响
    "editor.foreground": label1,
    "editorGutter.background": codeBg,
    "minimap.background": codeBg,
    "minimapSlider.background": mix(label2, clear, 0.4),
    "minimapSlider.hoverBackground": mix(label2, clear, 0.3),
    "minimapSlider.activeBackground": mix(label2, clear, 0.2),
    "scrollbarSlider.background": cssColor("--dsw-alias-scrollbar-bg-l1", "#3c3c3d"),
    "scrollbarSlider.hoverBackground": cssColor("--dsw-alias-scrollbar-hover-l1", "#545557"),
    "scrollbarSlider.activeBackground": cssColor("--dsw-alias-scrollbar-hover-l2", "#65676b"),
    "editorWidget.background": bg2,
    "editorWidget.border": border,
    "editorWidget.resizeBorder": border,
    "editorSuggestWidget.background": bg2,
    "editorSuggestWidget.border": border,
    "editorSuggestWidget.selectedBackground": mix(bg2, label1, 0.18),
    "editorSuggestWidget.foreground": label1,
    "editorSuggestWidget.highlightForeground": brand,
    "editorSuggestWidget.focusHighlightForeground": brand,
    "editorHoverWidget.background": bg2,
    "editorHoverWidget.border": border,
    "editorHoverWidget.foreground": label1,
    "editor.hoverHighlightBackground": cssColor("--dsw-alias-interactive-bg-hover", "rgba(255, 255, 255, 0.08)"),
    "editor.findMatchBackground": mix(label2, clear, 0.4),
    "editor.findMatchBorder": label2,
    "editor.findMatchHighlightBackground": mix(label2, clear, 0.22),
    "editor.findRangeHighlightBackground": mix(label2, clear, 0.15),
    "editor.selectionBackground": mix(label2, clear, 0.35),
    "editor.selectionHighlightBackground": mix(label2, clear, 0.18),
    "editor.lineHighlightBackground": cssColor("--dsw-alias-interactive-bg-hover", "rgba(255, 255, 255, 0.08)"),
    "editor.lineHighlightBorder": cssColor("--dsw-alias-interactive-bg-hover", "rgba(255, 255, 255, 0.08)"),
    "editorLineNumber.foreground": label3,
    "editorLineNumber.activeForeground": label1,
    "editorCursor.foreground": label1,
    "editorMarkerNavigation.background": bg2
  };
  window.monaco.editor.defineTheme("ds-transparent-dark", { base: "vs-dark", inherit: true, rules: [], colors: colors });
  window.monaco.editor.defineTheme("ds-transparent-light", { base: "vs", inherit: true, rules: [], colors: colors });
}

function baseName(p) {
  if (!p) return "";
  var parts = String(p).replace(/\\/g, "/").split("/").filter(Boolean);
  return parts[parts.length - 1] || p;
}
function sepOf(p) { return p.endsWith("/") || p.endsWith("\\") ? "" : "/"; }
function pjoin(a, b) { return String(a).replace(/[\\\/]+$/, "") + "/" + String(b); }

// 文件类型 -> 图标 + 颜色(VS Code 风格)
var FILE_ICONS = {
  js: ["ri-javascript-line", "#f7df1e"], jsx: ["ri-code-s-slash-line", "#f7df1e"], mjs: ["ri-javascript-line", "#f7df1e"], cjs: ["ri-javascript-line", "#f7df1e"],
  ts: ["ri-code-s-slash-line", "#3178c6"], tsx: ["ri-code-s-slash-line", "#3178c6"],
  json: ["ri-braces-line", "#cbcb41"],
  py: ["ri-code-s-slash-line", "#3776ab"],
  html: ["ri-html5-line", "#e34f26"], htm: ["ri-html5-line", "#e34f26"],
  css: ["ri-css3-line", "#42a5f5"], scss: ["ri-css3-line", "#c6538c"], less: ["ri-css3-line", "#42a5f5"],
  md: ["ri-markdown-line", "#519aba"], markdown: ["ri-markdown-line", "#519aba"],
  yaml: ["ri-file-settings-line", "#cb171e"], yml: ["ri-file-settings-line", "#cb171e"],
  sh: ["ri-terminal-line", "#89e051"], bash: ["ri-terminal-line", "#89e051"],
  bat: ["ri-terminal-box-line", "#c1f12e"], cmd: ["ri-terminal-box-line", "#c1f12e"],
  ps1: ["ri-terminal-box-line", "#4ea6ff"],
  sql: ["ri-database-2-line", "#e38c00"],
  vue: ["ri-vuejs-line", "#42b883"],
  svelte: ["ri-fire-line", "#ff3e00"],
  rs: ["ri-code-s-slash-line", "#dea584"],
  go: ["ri-code-s-slash-line", "#00add8"],
  java: ["ri-code-s-slash-line", "#e76f00"],
  c: ["ri-code-s-slash-line", "#a074c4"], h: ["ri-code-s-slash-line", "#a074c4"],
  cpp: ["ri-code-s-slash-line", "#a074c4"], hpp: ["ri-code-s-slash-line", "#a074c4"],
  cs: ["ri-code-s-slash-line", "#68217a"],
  php: ["ri-code-s-slash-line", "#777bb4"],
  rb: ["ri-code-s-slash-line", "#cc342d"],
  swift: ["ri-code-s-slash-line", "#f05138"],
  kt: ["ri-code-s-slash-line", "#7f52ff"],
  xml: ["ri-code-s-slash-line", "#e37933"], svg: ["ri-code-s-slash-line", "#e37933"],
  toml: ["ri-settings-3-line", "#8f8f8f"], ini: ["ri-settings-3-line", "#8f8f8f"],
  lock: ["ri-lock-line", "#b3b3b3"],
  png: ["ri-image-line", "#a074c4"], jpg: ["ri-image-line", "#a074c4"], jpeg: ["ri-image-line", "#a074c4"], gif: ["ri-image-line", "#a074c4"], webp: ["ri-image-line", "#a074c4"],
  pdf: ["ri-file-pdf-line", "#e40f02"],
  zip: ["ri-file-zip-line", "#b3b3b3"], tar: ["ri-file-zip-line", "#b3b3b3"], gz: ["ri-file-zip-line", "#b3b3b3"],
  txt: ["ri-file-text-line", "#b3b3b3"], log: ["ri-file-text-line", "#b3b3b3"],
  gitignore: ["ri-git-branch-line", "#f05033"], env: ["ri-settings-3-line", "#f05033"],
};
function fileIcon(name) {
  var ext = String(name || "").split(".").pop().toLowerCase();
  var hit = FILE_ICONS[ext];
  if (!hit && name === ".gitignore") hit = FILE_ICONS.gitignore;
  return hit || ["ri-file-line", "#b3b3b3"];
}
var LANG_MAP = {
  js: "javascript", jsx: "javascript", mjs: "javascript", cjs: "javascript",
  ts: "typescript", tsx: "typescript",
  py: "python", rb: "ruby", go: "go", rs: "rust", java: "java", c: "c", h: "c",
  cpp: "cpp", hpp: "cpp", cs: "csharp", php: "php", swift: "swift", kt: "kotlin",
  json: "json", yaml: "yaml", yml: "yaml", toml: "ini", ini: "ini",
  md: "markdown", html: "html", htm: "html", css: "css", scss: "scss", less: "less",
  xml: "xml", svg: "xml", sql: "sql", sh: "shell", bash: "shell", bat: "bat", ps1: "powershell",
  vue: "html", svelte: "html", txt: "plaintext", log: "plaintext", gitignore: "plaintext"
};
function langOf(name) {
  var n = String(name || "").toLowerCase();
  if (n === "dockerfile" || n.indexOf("dockerfile") === 0) return "dockerfile";
  if (n === "makefile" || n === "gnumakefile") return "makefile";
  var ext = n.split(".").pop();
  return LANG_MAP[ext] || "plaintext";
}
// 状态栏语言模式列表 [id, 显示名]
var LANG_LIST = [
  ["plaintext", "纯文本"], ["javascript", "JavaScript"], ["typescript", "TypeScript"], ["python", "Python"],
  ["json", "JSON"], ["html", "HTML"], ["css", "CSS"], ["scss", "SCSS"], ["markdown", "Markdown"],
  ["yaml", "YAML"], ["shell", "Shell"], ["sql", "SQL"], ["xml", "XML"], ["go", "Go"], ["rust", "Rust"],
  ["java", "Java"], ["c", "C"], ["cpp", "C++"], ["csharp", "C#"], ["php", "PHP"], ["ruby", "Ruby"],
  ["swift", "Swift"], ["kotlin", "Kotlin"], ["dockerfile", "Dockerfile"], ["makefile", "Makefile"],
  ["powershell", "PowerShell"], ["ini", "INI"], ["html", "Vue"], ["html", "Svelte"]
];
// 与后端同规则的首次命中位置(客户端搜索用)
function firstMatchIdx(text, needle, mc, ww, rx) {
  try {
    if (rx) return String(text).search(new RegExp(needle, mc ? "" : "i"));
    var esc = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return String(text).search(new RegExp((ww ? "\\b" : "") + esc + (ww ? "\\b" : ""), mc ? "" : "i"));
  } catch (e) { return -1; }
}

// 把片段按命中位置拆成 {text,hit} 段,用于高亮(与后端同款匹配规则)
function splitHit(text, needle, mc, ww, rx) {
  if (!text || !needle) return [{ text: text || "", hit: false }];
  var re = null;
  try {
    if (rx) re = new RegExp("(" + needle + ")", mc ? "g" : "gi");
    else {
      var esc = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      re = new RegExp("(" + esc + ")", (ww ? "\\b" : "") + (mc ? "" : "i") + "g");
    }
  } catch (e) { return [{ text: text, hit: false }]; }
  var out = [], m, last = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push({ text: text.slice(last, m.index), hit: false });
    out.push({ text: m[0], hit: true });
    last = m.index + m[0].length;
    if (m[0].length === 0) re.lastIndex++;
  }
  if (last < text.length) out.push({ text: text.slice(last), hit: false });
  return out.length ? out : [{ text: text, hit: false }];
}
// 标签拖拽重排:把 from 处的元素移动到"第 to 个元素之前"(to 为插入位置,0..length)
// to 是移除前的语义位置;移除 from 后,from 之后的元素整体左移一位,需按方向修正
function moveTab(prev, from, to) {
  var next = prev.slice();
  var it = next.splice(from, 1)[0];
  next.splice(to > from ? to - 1 : to, 0, it);
  return next;
}

// 轻量 Markdown 渲染(先整体转义,再套结构标签,无 XSS 风险)
function escHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function inlineMd(s) {
  s = s.replace(/`([^`]+)`/g, function (m, c) { return "<code>" + c + "</code>"; });
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" style="max-width:100%">');
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return s;
}
function mdTable(rows) {
  var head = rows[0].trim().replace(/^\||\|$/g, "").split("|").map(function (x) { return x.trim(); });
  var body = [];
  for (var k = 2; k < rows.length; k++) {
    var cells = rows[k].trim().replace(/^\||\|$/g, "").split("|").map(function (x) { return inlineMd(x.trim()); });
    body.push("<tr>" + cells.map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>");
  }
  return '<table><thead><tr>' + head.map(function (c) { return "<th>" + inlineMd(c) + "</th>"; }).join("") + "</tr></thead><tbody>" + body.join("") + "</tbody></table>";
}
function mdToHtml(src) {
  src = escHtml(String(src || "").replace(/\r\n?/g, "\n"));
  var lines = src.split("\n");
  var out = [];
  var i = 0, n = lines.length;
  while (i < n) {
    var line = lines[i];
    if (/^```/.test(line)) {
      var buf = [];
      i++;
      while (i < n && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++;
      out.push('<pre class="sb-md-pre"><code>' + buf.join("\n") + "</code></pre>");
      continue;
    }
    var hm = /^(#{1,6})\s+(.*)$/.exec(line);
    if (hm) {
      var h = hm[1].length;
      out.push("<h" + h + ">" + inlineMd(hm[2]) + "</h" + h + ">");
      i++;
      continue;
    }
    if (/^\s*([-*_])\1{2,}\s*$/.test(line)) { out.push("<hr>"); i++; continue; }
    if (/^\s*&gt;/.test(line)) {
      var q = [];
      while (i < n && /^\s*&gt;/.test(lines[i])) { q.push(lines[i].replace(/^\s*&gt;\s?/, "")); i++; }
      out.push("<blockquote>" + q.map(function (x) { return inlineMd(x); }).join("<br>") + "</blockquote>");
      continue;
    }
    if (i + 1 < n && /^\s*\|/.test(line) && /^\s*\|[\s:|-]+\|/.test(lines[i + 1])) {
      var rows = [];
      while (i < n && /^\s*\|/.test(lines[i])) { rows.push(lines[i]); i++; }
      out.push(mdTable(rows));
      continue;
    }
    if (/^\s*[-*+]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      var items = [];
      var ordered = /^\s*\d+\.\s+/.test(line);
      while (i < n) {
        var m = /^\s*([-*+]|\d+\.)\s+(.*)$/.exec(lines[i]);
        if (!m) break;
        items.push(inlineMd(m[2]));
        i++;
      }
      out.push((ordered ? "<ol>" : "<ul>") + items.map(function (x) { return "<li>" + x + "</li>"; }).join("") + (ordered ? "</ol>" : "</ul>"));
      continue;
    }
    if (/^\s*$/.test(line)) { i++; continue; }
    var para = [line];
    i++;
    while (i < n && !/^\s*$/.test(lines[i]) && !/^#{1,6}\s/.test(lines[i]) && !/^```/.test(lines[i]) && !/^\s*([-*_])\1{2,}\s*$/.test(lines[i])) { para.push(lines[i]); i++; }
    out.push("<p>" + inlineMd(para.join(" ")) + "</p>");
  }
  return out.join("\n").replace(/<a href="/g, '<a target="_blank" rel="noreferrer" href="');
}

var monacoReady = null;
var monacoI18nInstalled = false;
// Monaco 右键菜单中文化(构建无 setLocale,通过观察菜单 DOM 替换文案)
function installMonacoI18n() {
  if (monacoI18nInstalled || typeof MutationObserver === "undefined") return;
  monacoI18nInstalled = true;
  var MAP = {
    "Cut": "剪切", "Copy": "复制", "Paste": "粘贴", "Select All": "全选", "Command Palette": "命令面板",
    "Undo": "撤销", "Redo": "重做", "Open to the Side": "在侧边打开", "Open": "打开", "Copy as JSON": "复制为 JSON",
    "Go to Definition": "转到定义", "Peek Definition": "速览定义", "Go to Type Definition": "转到类型定义",
    "Peek Type Definition": "速览类型定义", "Go to Implementation": "转到实现", "Peek Implementation": "速览实现",
    "Find All References": "查找所有引用", "Change All Occurrences": "更改所有匹配项",
    "Format Document": "格式化文档", "Rename Symbol": "重命名符号", "Show References": "显示引用"
  };
  var mo = new MutationObserver(function () {
    var labels = document.querySelectorAll(".monaco-menu .action-label");
    for (var i = 0; i < labels.length; i++) {
      var el = labels[i];
      if (el.getAttribute("data-dsh-i18n")) continue;
      var txt = el.textContent;
      if (txt && MAP[txt]) { el.setAttribute("data-dsh-i18n", "1"); el.textContent = MAP[txt]; }
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });
}
function loadMonaco(cb) {
  if (window.monaco && window.monaco.editor) { cb(); return; }
  function boot() {
    installMonacoI18n();
    // 语言服务的 web worker 用同源 URL 加载(workerMain.js#label);
    // 不设置时 monaco 会创建 blob worker,Firefox 的 blob worker 内 fetch('/dsh-sidebar/...') 无法解析
    if (typeof self !== "undefined" && !(self.MonacoEnvironment && typeof self.MonacoEnvironment.getWorkerUrl === "function")) {
      self.MonacoEnvironment = self.MonacoEnvironment || {};
      self.MonacoEnvironment.getWorkerUrl = function (moduleId, label) {
        return "/dsh-sidebar/monaco/vs/base/worker/workerMain.js#" + label;
      };
    }
    window.require.config({ paths: { vs: "/dsh-sidebar/monaco/vs" } });
    window.require(["vs/editor/editor.main"], function () { cb(); });
  }
  if (window.require && window.require.config) { boot(); return; }
  if (!monacoReady) {
    monacoReady = new Promise(function (resolve) {
      var s = document.createElement("script");
      s.src = "/dsh-sidebar/monaco/vs/loader.js";
      s.onload = function () { boot(); resolve(); };
      document.head.appendChild(s);
    });
  }
  monacoReady.then(cb);
}

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

module.exports = {
  name: "dsh-sidebar",
  inject: ["slots"],
  apply(ctx) {
    const slots = ctx.get("slots");
    if (slots === void 0) return;
    ctx.effect(() => slots.inject("settings.section", () => slots.register(
      { name: "settings.section", id: "dsh-editor", order: 25, label: "编辑器" },
      () => React.createElement(EditorSettingsSection)
    )));
    ctx.effect(() => slots.inject("conversation.session.header.actions", () => slots.register(
      { name: "conversation.session.header.actions", id: "dsh-sidebar", order: 50 },
      (props) => React.createElement(SidebarPanel, props)
    )));
  }
};
return module.exports; } });
