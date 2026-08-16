// 拼接 lib/client/ 下的源码段,重新生成 lib/client.js(harness 模块加载器单文件格式)
// 各段共享同一个函数作用域,文件顺序即依赖顺序;function 声明可提升,但请保持此顺序阅读
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const PARTS = [
  'client/header.js',
  'client/css.js',
  'client/settings.js',
  'client/utils.js',
  'client/markdown.js',
  'client/monaco.js',
  'client/components/file-tree.js',
  'client/components/status-bar.js',
  'client/components/terminal-panel.js',
  'client/components/editor-area.js',
  'client/components/search-panel.js',
  'client/components/git-panel.js',
  'client/components/git-modal.js',
  'client/components/menus.js',
  'client/panel.js',
  'client/settings-section.js',
  'client/footer.js',
]

const out = PARTS.map((p) => readFileSync(path.join(root, 'lib', p), 'utf8').trimEnd()).join('\n\n') + '\n'
writeFileSync(path.join(root, 'lib', 'client.js'), out)
console.log(`built lib/client.js (${out.length} bytes, ${PARTS.length} parts)`)
