const fs=require("fs"),path=require("path");
const dir=__dirname;
const SRC=process.argv[2], OUT=process.argv[3];
const rd=f=>fs.readFileSync(path.join(dir,"snippets",f),"utf8");
let s=fs.readFileSync(SRC,"utf8");
const before=s.length;

function count(sub){let n=0,i=-1;while((i=s.indexOf(sub,i+1))!==-1)n++;return n;}

/* 字符串/注释感知扫描器，返回从 anchor 处函数声明到函数体结束 `}` 的跨度 */
function fnSpan(anchor){
  if(count(anchor)!==1) throw new Error("函数锚点计数!=1: "+anchor+" x"+count(anchor));
  const idx=s.indexOf(anchor);
  let i=idx,q=null,esc=false,depthParen=0,bodyStart=-1,depthBrace=0;
  for(;i<s.length;i++){
    const ch=s[i];
    if(q){
      if(esc){esc=false;continue;}
      if(ch==="\\"){esc=true;continue;}
      if(q==="//"){if(ch==="\n")q=null;continue;}
      if(q==="/*"){if(ch==="*"&&s[i+1]==="/"){q=null;i++;}continue;}
      if(ch===q)q=null;
      continue;
    }
    if(ch==='"'||ch==="'"||ch==="`"){q=ch;continue;}
    if(ch==="/"&&s[i+1]==="/"){q="//";continue;}
    if(ch==="/"&&s[i+1]==="*"){q="/*";continue;}
    if(ch==="(")depthParen++;
    else if(ch===")"){if(depthParen>0)depthParen--;}
    else if(ch==="{"){
      if(depthParen===0){
        if(bodyStart===-1){bodyStart=i;depthBrace=1;}
        else depthBrace++;
      }
    }else if(ch==="}"){
      if(depthParen===0 && bodyStart!==-1){depthBrace--;if(depthBrace===0)return [idx,i+1];}
    }
  }
  throw new Error("未找到函数结束: "+anchor);
}
function replaceFn(anchor, text){
  const [a,b]=fnSpan(anchor);
  s=s.slice(0,a)+text.trimEnd()+s.slice(b);
}

replaceFn("function XsModelMode(){", rd("c_modelmode.js"));
replaceFn("function XsYuyun(p){", rd("c_yuyun.js"));

fs.writeFileSync(OUT,s,"utf8");
console.log(`fe delta patched: ${before} -> ${s.length} delta=${s.length-before}`);
