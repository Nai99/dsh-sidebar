// 系统集成:在 Windows 资源管理器中显示 / 在 VS Code 中打开
import { exec } from 'node:child_process'
import { resolveCwd, inside, json, readBody } from './util.js'

export function register(ctx, webServer) {
  // 在 Windows 资源管理器中显示(文件 /select,目录直接打开)
  webServer.register({ kind: 'exact', path: '/dsh-sidebar/reveal', handler: async (req, res) => {
    try {
      const body = await readBody(req)
      const cwd = resolveCwd(ctx, body.cwd)
      const target = body.path || cwd
      if (!inside(cwd, target)) { json(res, { ok: false, message: '路径超出工作区范围' }); return }
      const winPath = String(target).replace(/\//g, '\\').replace(/"/g, '\\"')
      exec('explorer.exe ' + (body.select ? '/select,"' + winPath + '"' : '"' + winPath + '"'), { windowsHide: true }, (err, so, se) => {
        // explorer.exe 即使成功也常返回非零退出码;仅当 stderr 有实质内容才视为失败
        if (se && String(se).trim()) json(res, { ok: false, message: String(se).trim() })
        else json(res, { ok: true })
      })
    } catch (e) { json(res, { ok: false, message: String(e && e.message ? e.message : e) }) }
  } })
  // 在 VS Code 中打开(文件或目录)
  webServer.register({ kind: 'exact', path: '/dsh-sidebar/open-vscode', handler: async (req, res) => {
    try {
      const body = await readBody(req)
      const cwd = resolveCwd(ctx, body.cwd)
      const target = body.path || cwd
      if (!inside(cwd, target)) { json(res, { ok: false, message: '路径超出工作区范围' }); return }
      exec('code "' + String(target).replace(/"/g, '\"') + '"', { windowsHide: true }, (err) => {
        if (err) json(res, { ok: false, message: 'code 命令不可用,请确认已安装 VS Code 并勾选"添加到 PATH": ' + String(err.message || err) })
        else json(res, { ok: true })
      })
    } catch (e) { json(res, { ok: false, message: String(e && e.message ? e.message : e) }) }
  } })
}
