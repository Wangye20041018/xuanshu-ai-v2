const fs=require("fs"),path=require("path");
const f=process.argv[2];const s=fs.readFileSync(f,"utf8");
let out=[];
for(const k of process.argv.slice(3)){
  let idxs=[],i=-1;while((i=s.indexOf(k,i+1))!==-1){idxs.push(i);}
  out.push("### "+k+"  x"+idxs.length);
  for(const a of idxs){out.push("  @"+a+" …"+s.slice(Math.max(0,a-90),a+140).replace(/\s+/g," "));}
}
fs.writeFileSync(path.join(__dirname,"loc3_out.txt"),out.join("\n"),"utf8");
