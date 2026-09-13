const fs=require('fs');
const s=fs.readFileSync(process.argv[2],'utf8');
let state='code',interp=[],depthC=0,depthP=0,prevSig='',line=1;
const isRe=c=>c===''||'(,=:[!&|?{};'.includes(c);
for(let i=0;i<s.length;i++){const c=s[i],n=s[i+1];
 if(c==='\n')line++;
 if(state==='code'){
  if(c==='/'&&n==='/'){state='line';i++;continue;}
  if(c==='/'&&n==='*'){state='block';i++;continue;}
  if(c==="'"){state='sq';continue;}
  if(c==='"'){state='dq';continue;}
  if(c==='`'){state='tpl';continue;}
  if(c==='/'&&isRe(prevSig)){state='regex';continue;}
  if(c==='{')depthC++;
  if(c==='}'){depthC--;if(interp.length&&depthC===interp[interp.length-1]){interp.pop();state='tpl';}}
  if(c==='(')depthP++;
  if(c===')')depthP--;
  if(depthC<0||depthP<0){console.log('NEG at line',line,'char',i,'c=',c,'brace',depthC,'paren',depthP);break;}
  if(!/\s/.test(c))prevSig=c;
 } else if(state==='sq'){if(c==='\\')i++;else if(c==="'"){state='code';prevSig="'";}}
 else if(state==='dq'){if(c==='\\')i++;else if(c==='"'){state='code';prevSig='"';}}
 else if(state==='tpl'){if(c==='\\')i++;else if(c==='`'){state='code';}else if(c==='$'&&n==='{'){interp.push(depthC);depthC++;state='code';i++;}}
 else if(state==='line'){if(c==='\n')state='code';}
 else if(state==='block'){if(c==='*'&&n==='/'){state='code';i++;}}
 else if(state==='regex'){if(c==='\\')i++;else if(c==='[')state='rclass';else if(c==='/'){state='code';}}
 else if(state==='rclass'){if(c==='\\')i++;else if(c===']')state='regex';}
}
console.log('END line',line,'braceDepth',depthC,'parenDepth',depthP,'state',state);
