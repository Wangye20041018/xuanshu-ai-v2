const fs=require("fs");const s=fs.readFileSync(process.argv[2],"utf8");
for(const k of process.argv.slice(3)){let idxs=[],i=-1;while((i=s.indexOf(k,i+1))!==-1){idxs.push(i);if(idxs.length>=12)break;}
 console.log("### "+k+"  count-shown="+idxs.length+" @"+idxs.join(","));}
