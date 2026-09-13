const fs = require("fs"), path = require("path");
const f = process.argv[2];
const s = fs.readFileSync(f, "utf8");
let pass = 0, fail = 0;
function cnt(sub){ let n=0,i=-1; while((i=s.indexOf(sub,i+1))!==-1)n++; return n; }
function eq(name, got, exp){ const ok = got===exp; console.log((ok?"PASS":"FAIL")+"  "+name+": got="+got+" expect="+exp); ok?pass++:fail++; }
function zero(name, sub){ eq("无残留 "+name, cnt(sub), 0); }

/* 通道唯一注册（替换骨架后仍各 1，不能二次注册） */
eq("setMode 唯一 handle", cnt('ipcMain.handle("xuanshu:model:setMode"'), 1);
eq("getMode 唯一 handle", cnt('ipcMain.handle("xuanshu:model:getMode"'), 1);
eq("asr:transcribe 唯一 handle", cnt('ipcMain.handle("xuanshu:asr:transcribe"'), 1);
eq("asr:status 唯一 handle", cnt('ipcMain.handle("xuanshu:asr:status"'), 1);

/* 旧骨架被真实替换 */
zero("asr status 骨架(progress:0,downloaded:false)", "progress:0, downloaded:false");
zero("transcribe 未安装骨架", "ASR transcribe model not installed");
zero("setMode 旧骨架(local engine not ready)", "local engine not ready");

/* 真实逻辑被 handler 调用 */
eq("setMode 调 _xsApplyMode", cnt("await _xsApplyMode(mode)"), 1);
eq("transcribe 调 _asrTranscribe", cnt("await _asrTranscribe(wav"), 1);
eq("_asrModelInfo 定义+2调用", cnt("_asrModelInfo()"), 3); // 定义1 + _asrSpawn调用1 + status调用1

/* 既有 inference 通道不被破坏 */
["status","start","setModel","setContext"].forEach(k=>eq("保留 inference:"+k, cnt('ipcMain.handle("xuanshu:inference:'+k+'"'),1));
eq("inference:stop 仍为 on", cnt('ipcMain.on("xuanshu:inference:stop"'),1);

/* 顶层辅助定义唯一 */
["function _xsApplyMode","function _xsCommitModel","function _xsPickCloud","function _xsLocalRef",
 "function _asrSpawn","function _asrTranscribe","function _asrEnsure","function _asrModelInfo",
 "function _asrKill","function _xsResRoots"].forEach(nm=>eq("定义 "+nm, cnt(nm),1));

eq("before-quit 结束ASR", cnt("function(){ _xsKill(); try{ _asrKill(); }catch(e){} }"),1);
eq("_xsSetup 定义唯一", cnt("function _xsSetup(){"),1);
eq("spawn asr_daemon.py", cnt('"python","asr_daemon.py"'),1);

/* 新增块离线、仅内置模块 */
const helpers = fs.readFileSync(path.join(__dirname,"main_helpers.txt"),"utf8");
eq("新增块无联网 URL", (helpers.match(/https?:\/\//g)||[]).length, 0);
eq("新增块仅用内置模块", (helpers.match(/require\(/g)||[]).length, 5);

/* 三档真实改路由关键路径 */
eq("改 agents.defaults.model.primary", (s.match(/d\.agents\.defaults\.model = \{ primary/g)||[]).length, 1);
eq("local-qwen 本地引用", cnt('"local-qwen/" + id'), 1);

console.log("\n"+(fail===0?"ALL MAIN VERIFY PASS ("+pass+")":"*** "+fail+" FAILED ***"));
process.exit(fail===0?0:1);
