const fs=require("fs");
const s=fs.readFileSync(process.argv[2],"utf8");
const kws=process.argv.slice(3);
let out=[];
for(const k of kws){
  let idxs=[],i=-1;while((i=s.indexOf(k,i+1))!==-1){idxs.push(i);if(idxs.length>=6)break;}
  out.push("\n#### "+k+"  x"+idxs.length+" @"+idxs.join(","));
  for(const a of idxs.slice(0,4)){ out.push("  ----@"+a+"----\n  "+s.slice(Math.max(0,a-140),a+160).replace(/\s+/g," ")); }
}
fs.writeFileSync(require("path").join(__dirname,"probe2_out.txt"),out.join("\n"),"utf8");
