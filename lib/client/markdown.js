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
