const fs = require("fs");
const path = require("path");
const dir = __dirname;
const SRC = process.argv[2];
const OUT = process.argv[3];
const rd = f => fs.readFileSync(path.join(dir, f), "utf8");
let s = fs.readFileSync(SRC, "utf8");
const before = s.length;

function count(sub){ let n=0,i=-1; while((i=s.indexOf(sub,i+1))!==-1) n++; return n; }
function must1(anchor){ const c=count(anchor); if(c!==1){ throw new Error(`锚点计数=${c}（要求1），中止: ${anchor.slice(0,60)}`); } }
function insertBefore(anchor, text){ must1(anchor); s=s.replace(anchor, text+anchor); }
function insertAfter(anchor, text){ must1(anchor); s=s.replace(anchor, anchor+text); }
function replaceOnce(find, rep){ must1(find); s=s.replace(find, rep); }

const helpers = rd("main_helpers.txt");
const handlers = rd("main_handlers.txt");

// 1) 顶层辅助块：插在 _xsSetup 定义之前
insertBefore("function _xsSetup(){", helpers + "\n");

// 2) handler 注册：插在 inference:stop 注册之后
insertAfter('ee2.ipcMain.on("xuanshu:inference:stop", function(){ _xsKill(); });', "\n" + handlers);

// 3) 退出时一并结束 ASR 常驻进程
replaceOnce(
  'ee2.app.on("before-quit", function(){ _xsKill(); });',
  'ee2.app.on("before-quit", function(){ _xsKill(); try{ _asrKill(); }catch(e){} });'
);

fs.writeFileSync(OUT, s, "utf8");
console.log(`main patched: ${before} -> ${s.length}  delta=${s.length-before}`);
console.log("out =", OUT);
