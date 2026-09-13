const fs=require("fs");const s=fs.readFileSync(process.argv[2],"utf8");
fs.writeFileSync(process.argv[4],s.slice(+process.argv[3],+process.argv[3]+ +process.argv[5]),"utf8");
