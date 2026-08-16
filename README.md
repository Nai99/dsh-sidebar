# dsh-sidebar

DeepSeek Harness (dsh) Web 插件 —— 右侧文件工作台。

在会话界面右侧提供一个可拖拽调宽的侧边面板,集成了 VS Code 风格的**多标签编辑器**、**文件资源管理器**、**全文搜索**、**多标签终端**与 **Git 状态**,所有 UI 均使用 dsh 官方 CSS 变量与弹窗样式,与主界面外观一致。

## 功能

### 编辑器

- 多标签打开文件,标签可拖拽排序,右键菜单(关闭/关闭其他/关闭所有)
- Monaco 语法高亮,自动跟随 dsh 主题(编辑器背景、滚动条、选区均为官方变量映射)
- 面包屑导航:显示完整路径,工作区内目录可直接点击跳转
- 状态栏(常驻):行/列、缩进、编码、行尾序列、语言模式,点击均弹出全屏居中弹窗切换
- Markdown 文件支持预览 / 代码视图切换
- 图片文件直接以图片渲染;二进制文件显示官方提示文案
- 保存(自动保存可配置)、在 VS Code 中打开、在文件管理器中显示

### 资源管理器

- 工作区目录树,彩色文件图标,可展开/折叠
- 右键菜单:在编辑器打开 / 在终端打开 / 添加至对话上下文(引用文件路径给 AI)/ 复制相对路径 / 复制绝对路径 / 在文件管理器中打开 / 在 VS Code 打开 / 重命名
- 面包屑导航、刷新

### 搜索

- 全工作区全文搜索,支持区分大小写 / 全词匹配 / 正则 / 包含 / 排除
- 结果分组展示,虚拟滚动,海量结果不卡顿
- 单条替换、整文件全部替换、排除文件 / 排除目录

### 终端

- 终端完全内置(WebSocket + node-pty 会话 + 本地 xterm.js),不依赖 `dsh-termbar`
- 多标签终端(每标签独立会话、独立工作目录),顶部栏与官方终端插件一致
- Bash / PowerShell 可切换(作为新终端默认 shell,记忆选择)
- 面板位于编辑器底部、状态栏上方,可拖拽调整高度,挤压编辑器
- 文件右键「在终端打开」为该目录新建终端标签
- bash 路径可用环境变量 `DSH_SIDEBAR_BASH` 指定(默认 `D:/Git/usr/bin/bash.exe`),PowerShell 用 `DSH_SIDEBAR_PWSH`(默认 `pwsh.exe`)

### Git

- Git 功能完全内置(仓库状态 / 提交 / 推送 / AI 提交信息),不依赖 `dsh-gitbar`
- git 命令自动探测:优先 Git for Windows 的 bash(与 gitbar 相同,服务器 PATH 里没有 git 也能用),找不到时退回 PATH 中的 `git.exe`;可通过环境变量 `DSH_SIDEBAR_BASH` 指定 bash 路径
- 仓库检测基于 `git rev-parse --is-inside-work-tree`,空提交仓库也能正确识别;git 命令本身不可用时会提示具体原因
- 显示当前分支、↑↓ 领先/落后、文件增删统计(+N −N)
- 未跟踪 / 已删除 / 修改 状态标记(● / − / +)
- 底部「操作」按钮:提交 / 提交并推送 / 推送,支持 AI 生成提交信息(复用 dsh 的 LLM 服务)

## 安装

前置:已安装 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)(`dsh web` 可运行)。

### 方式一:GitHub 源

```sh
dsh plugin --profile web add github:Nai99/dsh-sidebar#main
```

> pnpm 11 的 release-age 门禁可能拦截刚发布的版本,如遇 `declares no dsh.bundle` 报错,在 `~/.dsh/profiles/web/pnpm-workspace.yaml` 的 `minimumReleaseAgeExclude` 中加入 `dsh-sidebar@0.1.0` 后重试。

### 方式二:本地目录(开发调试)

```sh
git clone https://github.com/Nai99/dsh-sidebar.git
dsh plugin --profile web add /path/to/dsh-sidebar
```

安装后**重启 `dsh web`**,刷新浏览器,点击会话顶部的侧边栏按钮即可打开。

> 无外部插件依赖(编辑器 / 搜索 / 终端 / Git 均已内置)。
> 前置:已安装 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness),Git 功能需要服务器可访问 `git` 命令(Bash 或 PATH),终端需要 dsh 环境提供 `node-pty` 与 `ws`。

## 项目结构

```
lib/
  index.js            后端入口:注册全部路由模块
  server/             后端路由(按功能拆分)
    util.js           共享工具(resolveCwd / inside / 二进制嗅探 / json / readBody / queryOf)
    assets.js         静态资源:remixicon / vscode.svg / Monaco
    files.js          文件 CRUD:list / read / raw / write / delete / rename / paste
    search.js         全文搜索与批量替换
    git.js            Git 内置实现:状态 / 提交 / 推送 / AI 提交信息 / 增删统计
    terminal.js       终端内置实现:WebSocket + node-pty 会话 + xterm 静态资源
    external.js       系统集成:reveal / open-vscode
  client.js           前端打包产物(由 lib/client/ 源码构建,勿直接修改)
  client/             前端源码(按功能拆分,共享同一作用域,拼接顺序见 scripts/build-client.mjs)
    header.js / footer.js  模块加载器包装
    css.js           全部样式
    settings.js       编辑器设置与 Monaco 主题
    utils.js          路径 / 文件图标 / 语言映射
    markdown.js       轻量 Markdown 渲染
    monaco.js         Monaco 加载与右键菜单中文化
    panel.js          主面板(状态与逻辑)
    settings-section.js 编辑器设置页
    components/       按功能拆分的 UI 组件
      file-tree.js / editor-area.js / status-bar.js / terminal-panel.js / search-panel.js
      git-panel.js / git-modal.js / menus.js
  monaco/    Monaco Editor 静态资源(本地提供,不依赖 CDN)
  remixicon/ 图标字体
  icons/     文件类型图标
  xterm/     xterm.js 终端静态资源(本地提供)
scripts/
  build-client.mjs    拼接 lib/client/ → lib/client.js(npm run build)
  test-server.mjs     后端路由功能测试
  test-client-render.mjs 前端渲染对比测试(拆分前后 bundle 的元素树一致性)
  test-client-theme.mjs 主题切换 / 代码高亮回归测试(即时刷新与语言保持)
  test-terminal.mjs   终端端到端测试(真实 WebSocket + node-pty 会话)
cordis.patch.yml  打包补丁配置
```

## 后端 API

| 路由 | 说明 |
| --- | --- |
| `GET /dsh-sidebar/list?cwd=&path=` | 列出目录条目(限制在 cwd 内) |
| `GET /dsh-sidebar/read?cwd=&path=` | 读取文本文件(>1MB 截断标记) |
| `GET /dsh-sidebar/raw?cwd=&path=` | 图片等二进制文件原始字节 |
| `POST /dsh-sidebar/write` | 保存文件 |
| `GET /dsh-sidebar/search` | 全文搜索(匹配全部结果,支持包含/排除) |
| `POST /dsh-sidebar/replace` | 全部 / 单文件 / 单行替换 |
| `POST /dsh-sidebar/rename` / `POST /dsh-sidebar/delete` | 重命名 / 删除 |
| `POST /dsh-sidebar/paste` | 复制 / 移动(自动避让重名) |
| `GET /dsh-sidebar/git-status?cwd=` | Git 状态:分支 / 文件 / 领先落后 / 仓库检测(内置) |
| `GET /dsh-sidebar/git-ai?cwd=` | 基于 diff 用 LLM 生成提交信息 |
| `POST /dsh-sidebar/git-commit` | 提交(消息为空自动 AI 生成,可附带推送) |
| `POST /dsh-sidebar/git-push` | 推送当前分支 |
| `GET /dsh-sidebar/git-diff?cwd=` | 每文件 / 总计增删统计与仓库检测 |
| `WS /dsh-sidebar/term-ws` | 终端会话(每个连接一个 node-pty,`\u0000RESIZE:cols:rows` 调整大小) |
| `GET /dsh-sidebar/xterm.js` / `xterm.css` | 终端静态资源(本地提供) |
| `POST /dsh-sidebar/reveal` | 在系统文件管理器中显示 |
| `POST /dsh-sidebar/open-vscode` | 在 VS Code 中打开 |

## 许可证

[MIT](LICENSE)
