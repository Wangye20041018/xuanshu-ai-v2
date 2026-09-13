const fs=require("fs");const s=fs.readFileSync(process.argv[2],"utf8");
const ids=["o","x","se","Ce","rt","tt","et","F0","B0","HD","Fe","xa","nF","rn","JL","C6","rd","n1","Zr","Hn","C_e"];
let bad=0;
for(const id of ids){
  const re=new RegExp("(?:const|let|var|,|;|\\s)("+id.replace(/\$/g,"\\$")+")=","g");
  const m=s.match(re);
  // 也接受 function 定义
  const fn=new RegExp("function "+id+"\\(").test(s);
  const ok=(m&&m.length>0)||fn;
  if(!ok)bad++;
  console.log((ok?"PASS":"FAIL")+"  "+id+"  defHits="+(m?m.length:0)+(fn?" +fn":""));
}
process.exit(bad?1:0);
