const fs = require("fs"), path = require("path");
const f = process.argv[2];
let s = fs.readFileSync(f, "utf8");
const add = "xuanshu:model:getMode";
if (s.includes('"'+add+'"')) { console.log("ALREADY:", add); process.exit(0); }
const anchor = '"xuanshu:model:setMode",';
const n = s.split(anchor).length - 1;
if (n !== 1) { console.error("锚点计数="+n+"，中止"); process.exit(1); }
s = s.replace(anchor, '"xuanshu:model:setMode","xuanshu:model:getMode",');
fs.writeFileSync(f, s, "utf8");
console.log("PATCHED preload +", add, s.length);
