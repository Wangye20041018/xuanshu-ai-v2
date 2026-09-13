// String/regex/template-aware brace matcher.
// usage: node brace.js <file> <startAnchor>
// finds startAnchor (must be unique), then the first '{' after it (function body open),
// and matches braces while ignoring strings/templates/comments/regex.
// prints: bodyOpen offset, matching close offset, full span length, head/tail.
const fs = require('fs');
const s = fs.readFileSync(process.argv[2], 'utf8');
const anchor = process.argv[3];
let first = s.indexOf(anchor);
if (first < 0) { console.error('anchor not found'); process.exit(1); }
if (s.indexOf(anchor, first + 1) !== -1) { console.error('anchor NOT unique'); process.exit(1); }
const open = s.indexOf('{', first);
let depth = 0, i = open, state = 'code', interp = [];
const isRegexPrev = c => c === '' || '(,=:[!&|?{};'.includes(c);
let prevSig = '';
for (; i < s.length; i++) {
  const c = s[i], c2 = s[i + 1];
  if (state === 'code') {
    if (c === '/' && c2 === '/') { state = 'line'; i++; continue; }
    if (c === '/' && c2 === '*') { state = 'block'; i++; continue; }
    if (c === "'") { state = 'sq'; continue; }
    if (c === '"') { state = 'dq'; continue; }
    if (c === '`') { state = 'tpl'; continue; }
    if (c === '/' && isRegexPrev(prevSig)) { state = 'regex'; continue; }
    if (c === '{') { depth++; prevSig = c; continue; }
    if (c === '}') {
      depth--;
      if (interp.length && depth === interp[interp.length - 1]) { interp.pop(); state = 'tpl'; prevSig = ''; continue; }
      if (depth === 0) { i; break; }
      prevSig = c; continue;
    }
    if (!/\s/.test(c)) prevSig = c;
  } else if (state === 'sq') {
    if (c === '\\') { i++; continue; }
    if (c === "'") { state = 'code'; prevSig = "'"; }
  } else if (state === 'dq') {
    if (c === '\\') { i++; continue; }
    if (c === '"') { state = 'code'; prevSig = '"'; }
  } else if (state === 'tpl') {
    if (c === '\\') { i++; continue; }
    if (c === '`') { state = 'code'; prevSig = '`'; continue; }
    if (c === '$' && c2 === '{') { interp.push(depth); depth++; state = 'code'; i++; prevSig = '{'; continue; }
  } else if (state === 'line') {
    if (c === '\n') state = 'code';
  } else if (state === 'block') {
    if (c === '*' && c2 === '/') { state = 'code'; i++; }
  } else if (state === 'regex') {
    if (c === '\\') { i++; continue; }
    if (c === '[') { state = 'regexclass'; continue; }
    if (c === '/') { state = 'code'; prevSig = '/'; }
  } else if (state === 'regexclass') {
    if (c === '\\') { i++; continue; }
    if (c === ']') state = 'regex';
  }
}
const close = i;
console.log('anchorAt', first, 'bodyOpen', open, 'bodyClose', close, 'spanLen', close - first + 1);
console.log('--- HEAD 120 ---'); console.log(s.slice(first, first + 120));
console.log('--- TAIL 160 ---'); console.log(s.slice(close - 159, close + 1));
