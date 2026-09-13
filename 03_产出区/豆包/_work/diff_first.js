// usage: node diff_first.js <oldFile> <newFile>
const fs = require('fs');
const a = fs.readFileSync(process.argv[2], 'utf8'); // old
const b = fs.readFileSync(process.argv[3], 'utf8'); // new
console.log('oldLen', a.length, 'newLen', b.length, 'delta', b.length - a.length);
let i = 0;
const min = Math.min(a.length, b.length);
while (i < min && a[i] === b[i]) i++;
console.log('first diff at char', i);
console.log('--- OLD around ---');
console.log(a.slice(Math.max(0, i - 160), i + 160));
console.log('--- NEW around ---');
console.log(b.slice(Math.max(0, i - 160), i + 360));
// common suffix length
let j = 0;
while (j < min && a[a.length - 1 - j] === b[b.length - 1 - j]) j++;
console.log('common suffix chars', j, ' old tail starts at', a.length - j, ' new tail starts at', b.length - j);
console.log('--- inserted/replaced block in NEW [i .. newLen-commonSuffix] ---');
console.log(b.slice(i, b.length - j));
