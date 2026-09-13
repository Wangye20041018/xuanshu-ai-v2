const fs=require("fs");const s=fs.readFileSync(process.argv[2],"utf8");
for(const k of process.argv.slice(3)){let idxs=[],i=-1;while((i=s.indexOf(k,i+1))!==-1){idxs.push(i);if(idxs.length>=8)break;}
 console.log("### "+k+" @"+idxs.join(","));
 if(idxs.length){let a=idxs[0];console.log("   …"+s.slice(Math.max(0,a-80),a+220).replace(/\s+/g," "));}}
