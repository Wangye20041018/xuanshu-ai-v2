const fs=require("fs");
const main=fs.readFileSync(process.argv[2],"utf8"),bak=fs.readFileSync(process.argv[3],"utf8");
const out=["main==bak(未再合并): "+(main===bak)];
for(const k of ["_wbE.ipcMain.handle(\"xuanshu:asr:status\"","_wbE.ipcMain.handle(\"xuanshu:model:setMode\"","_wbE.ipcMain.handle(\"xuanshu:asr:transcribe\"","function _xsSetup(){",'ee2.ipcMain.on("xuanshu:inference:stop"']){
  let n=0,i=-1;while((i=main.indexOf(k,i+1))!==-1)n++; out.push("main 锚点 x"+n+"  "+k.slice(0,48));
}
fs.writeFileSync(process.argv[4],out.join("\n"),"utf8");
