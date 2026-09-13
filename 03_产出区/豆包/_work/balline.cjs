const fs=require("fs");
const lines=fs.readFileSync(process.argv[2],"utf8").split("\n");
let state="code",interp=[],d=0,prev="";
const isRe=c=>c===""||"(,=:[!&|?{};".includes(c);
function scan(txt,ln){for(let i=0;i<txt.length;i++){const c=txt[i],n=txt[i+1];
 if(state==="code"){
  if(c==="/"&&n==="/")break;
  if(c==="'"){state="sq";continue;} if(c==='"'){state="dq";continue;} if(c==="`"){state="tpl";continue;}
  if(c==="/"&&isRe(prev)){state="regex";continue;}
  if(c==="{")d++; if(c==="}"){d--;if(interp.length&&d===interp[interp.length-1]){interp.pop();state="tpl";}}
  if(!/\s/.test(c))prev=c;
 } else if(state==="sq"){if(c==="\\")i++;else if(c==="'"){state="code";}}
 else if(state==="dq"){if(c==="\\")i++;else if(c==='"'){state="code";}}
 else if(state==="tpl"){if(c==="\\")i++;else if(c==="`")state="code";else if(c==="$"&&n==="{"){interp.push(d);d++;state="code";i++;}}
 else if(state==="regex"){if(c==="\\")i++;else if(c==="[")state="rc";else if(c==="/")state="code";}
 else if(state==="rc"){if(c==="\\")i++;else if(c==="]")state="regex";}
} console.log(String(ln).padStart(3), String(d).padStart(2), lines[ln-1].slice(0,60)); }
lines.forEach((l,idx)=>scan(l,idx+1));
