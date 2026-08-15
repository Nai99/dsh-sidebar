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

- 多标签终端(每标签独立会话、独立工作目录),顶部栏与官方终端插件一致
- Bash / PowerShell 可切换(作为新终端默认 shell,记忆选择)
- 面板位于编辑器底部、状态栏上方,可拖拽调整高度,挤压编辑器
- 文件右键「在终端打开」为该目录新建终端标签

### Git

- 显示当前分支、↑↓ 领先/落后、文件增删统计(+N −N)
- 未跟踪 / 已删除 / 修改 状态标记(● / − / +)
- 底部「操作」按钮打开与官方 Git 插件完全一致的弹窗:提交 / 提交并推送 / 推送,支持 AI 生成提交信息

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

> 依赖:终端复用 `dsh-termbar` 的 WebSocket 后端与 xterm.js,Git 弹窗复用 `dsh-gitbar` 接口,需一并安装:
>
> ```sh
> dsh plugin --profile web add github:Nai99/dsh-termbar#main github:Nai99/dsh-gitbar#main
> ```

## 项目结构

```
lib/
  index.js   后端:文件读写 / 搜索 / 替换 / 重命名 / 粘贴 / Git 等路由
  client.js  前端:React 组件、Monaco / xterm / 终端 / Git 面板、官方样式
  monaco/    Monaco Editor 静态资源(本地提供,不依赖 CDN)
  remixicon/ 图标字体
  icons/     文件类型图标
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
| `GET /dsh-sidebar/git-diff?cwd=` | Git 状态与增删统计 |
| `POST /dsh-sidebar/reveal` | 在系统文件管理器中显示 |
| `POST /dsh-sidebar/open-vscode` | 在 VS Code 中打开 |

## 许可证

[MIT](LICENSE)
