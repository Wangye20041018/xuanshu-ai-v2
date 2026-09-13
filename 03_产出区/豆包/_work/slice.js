// 抽取指定字符区间，便于精读压缩 bundle：node slice.js <file> <start> <len>
const fs = require('fs');
const [file, start, len] = [process.argv[2], +process.argv[3], +(process.argv[4] || 1500)];
const src = fs.readFileSync(file, 'utf8');
process.stdout.write(src.slice(start, start + len));
