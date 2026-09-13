const fs=require("fs");const s=fs.readFileSync(process.argv[2],"utf8");
for(const k of process.argv.slice(3)){
  const re=new RegExp("(function\\s+"+k+"\\b|[;,{\\s]"+k+"\\s*=|\\b(?:const|let|var)\\s+"+k+"\\b)","g");
  let m,n=0,out=[];while((m=re.exec(s))&&n<4){n++;out.push("@"+m.index+" …"+s.slice(m.index,m.index+90).replace(/\s+/g," "));}
  console.log("### "+k+"\n  "+out.join("\n  "));
}
