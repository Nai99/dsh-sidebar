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
