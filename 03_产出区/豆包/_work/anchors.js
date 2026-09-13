// usage:
//   node anchors.js <file> a b c          (cli anchors)
//   node anchors.js <file> -f anchors.txt (one anchor per line; blank/# ignored)
const fs = require('fs');
const file = process.argv[2];
const s = fs.readFileSync(file, 'utf8');
let list = process.argv.slice(3);
if (list[0] === '-f') {
  list = fs.readFileSync(list[1], 'utf8').split(/\r?\n/).map(x => x.trim()).filter(x => x && !x.startsWith('#'));
}
for (const a of list) {
  let idx = -1, offs = [];
  while ((idx = s.indexOf(a, idx + 1)) !== -1) offs.push(idx);
  console.log(`count=${offs.length}\t${offs.slice(0, 12).join(',')}${offs.length > 12 ? ' ...' : ''}\t<< ${a.slice(0, 70).replace(/\n/g, '\\n')}`);
}
console.log('LEN=', s.length);
