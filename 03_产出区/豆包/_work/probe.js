// 玄枢终代 · 豆包探查工具（只读，不改任何源码）
// 用法: node probe.js <file> [-f kwfile] [kw...] ; 窗口/上限用环境变量 WIN/MAX
const fs = require('fs');
const args = process.argv.slice(2);
const file = args[0];
const WIN = parseInt(process.env.WIN || '150', 10);
const MAX = parseInt(process.env.MAX || '3', 10);
let kws = [];
for (let i = 1; i < args.length; i++) {
  if (args[i] === '-f') kws = kws.concat(fs.readFileSync(args[++i], 'utf8').split(/\r?\n/));
  else kws.push(args[i]);
}
kws = kws.map(s => s.trim()).filter(s => s && !s.startsWith('#'));
const src = fs.readFileSync(file, 'utf8');
for (const kw of kws) {
  let idx = -1, positions = [];
  while ((idx = src.indexOf(kw, idx + 1)) !== -1) { positions.push(idx); if (positions.length >= 5000) break; }
  console.log('\n######## KW=' + JSON.stringify(kw) + '  total=' + positions.length + (positions.length >= 5000 ? '(cap)' : ''));
  positions.slice(0, MAX).forEach(p => {
    let s = src.slice(Math.max(0, p - WIN), p + kw.length + WIN).replace(/\s+/g, ' ');
    console.log('@' + p + '  …' + s + '…');
  });
}
