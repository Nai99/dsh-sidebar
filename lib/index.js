// dsh-sidebar host —— 右侧文件工作台(文件树 + 文本编辑器)
// 路由按功能拆分在 lib/server/ 下,本文件只负责注册:
//   assets.js    静态资源(remixicon / vscode.svg / Monaco)
//   files.js     文件 CRUD:list / read / raw / write / delete / rename / paste
//   search.js    全文搜索与批量替换
//   git.js       Git 增删统计
//   external.js  系统集成(reveal / open-vscode)
import { register as registerAssets } from './server/assets.js'
import { register as registerFiles } from './server/files.js'
import { register as registerSearch } from './server/search.js'
import { register as registerGit } from './server/git.js'
import { register as registerExternal } from './server/external.js'
import { register as registerTerminal } from './server/terminal.js'

export const inject = ['webServer', 'sessions', 'llm', 'settings']

export function apply(ctx) {
  const webServer = ctx.webServer
  if (!webServer) return
  try {
    registerAssets(ctx, webServer)
    registerFiles(ctx, webServer)
    registerSearch(ctx, webServer)
    registerGit(ctx, webServer)
    registerExternal(ctx, webServer)
    registerTerminal(ctx, webServer)
  } catch (e) {
    console.error('dsh-sidebar registration failed: ' + String(e && e.message ? e.message : e))
  }
}
