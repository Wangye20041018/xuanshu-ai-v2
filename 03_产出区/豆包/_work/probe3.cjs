const fs=require("fs");const s=fs.readFileSync(process.argv[2],"utf8");let out=[];
for(const k of process.argv.slice(3)){let idxs=[],i=-1;while((i=s.indexOf(k,i+1))!==-1){idxs.push(i);if(idxs.length>=10)break;}
 out.push("#### "+k+" @"+idxs.join(","));}
fs.writeFileSync(require("path").join(__dirname,"probe2_out.txt"),out.join("\n"),"utf8");
