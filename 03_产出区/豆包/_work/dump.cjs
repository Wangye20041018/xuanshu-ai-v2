const fs=require("fs");const s=fs.readFileSync(process.argv[2],"utf8");
fs.writeFileSync(process.argv[3],s.slice(2194350,2199200),"utf8");
