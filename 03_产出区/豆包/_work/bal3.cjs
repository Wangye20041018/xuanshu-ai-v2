const fs=require("fs");
const s=fs.readFileSync(process.argv[2],"utf8");
let state="code",dC=0,dP=0,dB=0,prev="",line=1;
const isRe=c=>c===""||"(,=:[!&|?{};".includes(c);
for(let i=0;i<s.length;i++){const c=s[i],n=s[i+1];if(c==="\n")line++;
 if(state==="code"){
  if(c==="/"&&n==="/"){state="line";i++;continue;}
  if(c==="'"){state="sq";continue;}if(c==='"'){state="dq";continue;}if(c==="`"){state="tpl";continue;}
  if(c==="/"&&isRe(prev)){state="re";continue;}
  if(c==="{")dC++;if(c==="}")dC--;if(c==="(")dP++;if(c===")")dP--;if(c==="[")dB++;if(c==="]")dB--;
  if(dC<0||dP<0||dB<0){console.log("NEG line",line,"at",JSON.stringify(c),"{}",dC,"()",dP,"[]",dB,"ctx:",s.slice(Math.max(0,i-50),i+3));process.exit(0);}
  if(!/\s/.test(c))prev=c;
 } else if(state==="sq"){if(c==="\\")i++;else if(c==="'")state="code";}
 else if(state==="dq"){if(c==="\\")i++;else if(c==='"')state="code";}
 else if(state==="tpl"){if(c==="\\")i++;else if(c==="`")state="code";}
 else if(state==="line"){if(c==="\n")state="code";}
 else if(state==="re"){if(c==="\\")i++;else if(c==="[")state="rc";else if(c==="/")state="code";}
 else if(state==="rc"){if(c==="\\")i++;else if(c==="]")state="re";}
}
console.log("END {} ",dC," ()",dP," []",dB);
