const fs=require("fs"),path=require("path");
const wk=__dirname;
const defs=require(path.join(wk,"patches.def.cjs"))({snip:f=>fs.readFileSync(path.join(wk,"snippets",f),"utf8")});
const src=fs.readFileSync(process.argv[2],"utf8");
function count(s,sub){let n=0,i=-1;while((i=s.indexOf(sub,i+1))!==-1)n++;return n;}
let bad=0;
for(const p of defs){
  const pairs=[];
  if(p.find)pairs.push(["find",p.find]);
  if(p.anchor)pairs.push(["anchor",p.anchor]);
  if(p.startAnchor)pairs.push(["start",p.startAnchor]);
  if(p.endAnchor)pairs.push(["end",p.endAnchor]);
  for(const [k,a] of pairs){
    const n=count(src,a);
    if(n!==1)bad++;
    console.log((n===1?"OK  ":"XX  ")+(p.name||p.op)+" ["+k+"] x"+n+(n===1?"":"  >>> "+JSON.stringify(a.slice(0,70))));
  }
}
console.log("\n漂移锚点数="+bad);
