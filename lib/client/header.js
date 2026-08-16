window.__ModuleLoader__.load({ id: "dsh-sidebar", factory: (require) => { var module = { exports: {} }; var exports = module.exports;
"use strict";

// dsh-sidebar client —— VS Code 风格右侧文件工作台 v3
// 顶部:多标签栏 + 刷新/关闭;内容区:左编辑器(面包屑+Monaco),右资源管理器(扁平目录树+彩色文件图标)
var React = require("react");
