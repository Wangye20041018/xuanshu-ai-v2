const fs = require("fs");
const path = require("path");
const dir = __dirname;
const SRC = process.argv[2], OUT = process.argv[3];
const rd = f => fs.readFileSync(path.join(dir, f), "utf8");
let s = fs.readFileSync(SRC, "utf8");
const before = s.length;

function count(sub){ let n=0,i=-1; while((i=s.indexOf(sub,i+1))!==-1)n++; return n; }
function must1(a){ const c=count(a); if(c!==1) throw new Error(`锚点计数=${c}（要求1），中止: ${a}`); }

/* 字符串/注释感知地找到 anchor 处 ipcMain.handle(...) 整个调用的跨度 [idx, closeParenEnd) */
function callSpan(anchor){
  must1(anchor);
  const idx = s.indexOf(anchor);
  let p = idx;
  while(p < s.length && s[p] !== "(") p++;
  if(p >= s.length) throw new Error("未找到调用左括号: "+anchor);
  let depth = 0, i = p, q = null, esc = false;
  for(; i < s.length; i++){
    const ch = s[i];
    if(q){
      if(esc){ esc = false; continue; }
      if(ch === "\\"){ esc = true; continue; }
      if(q === "//"){ if(ch === "\n") q = null; continue; }
      if(q === "/*"){ if(ch === "*" && s[i+1] === "/"){ q = null; i++; } continue; }
      if(ch === q) q = null;
      continue;
    }
    if(ch === '"' || ch === "'" || ch === "`"){ q = ch; continue; }
    if(ch === "/" && s[i+1] === "/"){ q = "//"; continue; }
    if(ch === "/" && s[i+1] === "*"){ q = "/*"; continue; }
    if(ch === "(") depth++;
    else if(ch === ")"){ depth--; if(depth === 0){ return [idx, i+1]; } }
  }
  throw new Error("括号未配平: "+anchor);
}
function replaceHandle(anchor, repl){
  const [a,b] = callSpan(anchor);
  s = s.slice(0,a) + repl + s.slice(b);
}
function insertBefore(anchor, text){ must1(anchor); s = s.replace(anchor, text + anchor); }
function replaceOnce(find, rep){ must1(find); s = s.replace(find, rep); }

/* 1) 顶层辅助 */
insertBefore("function _xsSetup(){", rd("main_helpers.txt") + "\n");

/* 2) 用真实实现替换中央(WorkBuddy)的三个骨架 handler（沿用通道名，避免二次注册） */
replaceHandle('_wbE.ipcMain.handle("xuanshu:asr:status"', rd("rep_status.txt"));
replaceHandle('_wbE.ipcMain.handle("xuanshu:model:setMode"', rd("rep_setmode.txt"));
replaceHandle('_wbE.ipcMain.handle("xuanshu:asr:transcribe"', rd("rep_transcribe.txt"));

/* 3) 退出时结束 ASR 常驻进程 */
replaceOnce(
  'ee2.app.on("before-quit", function(){ _xsKill(); });',
  'ee2.app.on("before-quit", function(){ _xsKill(); try{ _asrKill(); }catch(e){} });'
);

fs.writeFileSync(OUT, s, "utf8");
console.log(`main patched: ${before} -> ${s.length}  delta=${s.length-before}`);
