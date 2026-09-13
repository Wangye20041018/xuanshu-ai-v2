/* 玄枢终代 · 豆包 定位式补丁器
 * usage: node patch.cjs <srcBundle> <outBundle> <groups, e.g. common|A|ABC>
 * 幂等：始终从干净 src 基线施加；每个锚点强制唯一，找不到/不唯一即中止且不写出。
 */
const fs = require('fs');
const path = require('path');
const SNIP_DIR = path.join(__dirname, 'snippets');
const snip = n => fs.readFileSync(path.join(SNIP_DIR, n), 'utf8');

const src = process.argv[2];
const out = process.argv[3];
const groups = (process.argv[4] || 'ABC').split('').map(s => s.trim().toLowerCase());

let code = fs.readFileSync(src, 'utf8');
const beforeLen = code.length;

function countOcc(s, sub) {
  let i = -1, c = 0;
  while ((i = s.indexOf(sub, i + 1)) !== -1) c++;
  return c;
}
function applyOne(p) {
  if (!groups.includes(p.module.toLowerCase())) return;
  if (p.op === 'replace') {
    const c = countOcc(code, p.find);
    if (c !== (p.expect ?? 1)) throw new Error(`[${p.name}] find count=${c}, expect ${p.expect ?? 1}`);
    code = code.split(p.find).join(p.replacement);
    log(p, p.find.length, p.replacement.length);
  } else if (p.op === 'insertBefore') {
    const c = countOcc(code, p.anchor);
    if (c !== (p.expect ?? 1)) throw new Error(`[${p.name}] anchor count=${c}, expect ${p.expect ?? 1}`);
    code = code.replace(p.anchor, p.text + p.anchor);
    log(p, 0, p.text.length);
  } else if (p.op === 'insertAfter') {
    const c = countOcc(code, p.anchor);
    if (c !== (p.expect ?? 1)) throw new Error(`[${p.name}] anchor count=${c}, expect ${p.expect ?? 1}`);
    code = code.replace(p.anchor, p.anchor + p.text);
    log(p, 0, p.text.length);
  } else if (p.op === 'replaceSpan') {
    const a = code.indexOf(p.startAnchor), b = code.indexOf(p.endAnchor);
    if (a < 0 || b < 0 || b < a) throw new Error(`[${p.name}] span anchors missing/order a=${a} b=${b}`);
    if (countOcc(code, p.startAnchor) !== 1 || countOcc(code, p.endAnchor) !== 1)
      throw new Error(`[${p.name}] span anchor not unique`);
    const end = b + p.endAnchor.length;
    const oldSeg = code.slice(a, end);
    code = code.slice(0, a) + p.replacement + code.slice(end);
    log(p, oldSeg.length, p.replacement.length);
  } else throw new Error('unknown op ' + p.op);
}
function log(p, oldL, newL) {
  console.log(`  [${p.module}] ${p.name}  delta=${newL - oldL >= 0 ? '+' : ''}${newL - oldL}`);
}

/* ============ 补丁定义（顺序即施加顺序；锚点互不重叠） ============ */
const PATCHES = require('./patches.def.cjs')({ snip });

for (const p of PATCHES) applyOne(p);

fs.writeFileSync(out, code, 'utf8');
console.log(`\nDONE groups=${groups.join('')}  ${beforeLen} -> ${code.length}  delta=${code.length - beforeLen}`);
console.log('out =', out);
