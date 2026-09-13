const fs=require("fs");const s=fs.readFileSync(process.argv[2],"utf8");
console.log("MAIN LEN",s.length);
const kw=process.argv.slice(3);
for(const k of kw){let idxs=[],i=-1;while((i=s.indexOf(k,i+1))!==-1){idxs.push(i);if(idxs.length>=6)break;}
 console.log("\n### "+k+"  x(total first6 shown)="+idxs.length+" @"+idxs.join(","));
 if(idxs[0]!=null){let a=idxs[0];console.log("   …"+s.slice(Math.max(0,a-50),a+90).replace(/\s+/g," "));}}
