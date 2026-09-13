const fs=require("fs");const s=fs.readFileSync(process.argv[2],"utf8");
const ch=["asr:mixRecorderStart","asr:mixRecorderPause","asr:mixRecorderResume","asr:mixRecorderStop","asr:readAudio","xuanshu:inference:status","xuanshu:inference:start","xuanshu:inference:stop","xuanshu:inference:setModel","xuanshu:inference:setContext","xuanshu:model:setMode","setModelMode","xuanshu:asr:transcribe","xuanshu:usage:stats"];
for(const c of ch){let n=0,i=-1;while((i=s.indexOf(c,i+1))!==-1)n++;console.log((n>0?"IN  ":"OUT ")+"x"+n+"  "+c);}
const m=s.match(/asr:mixRecorder[^"]*"/g);console.log("\n所有 asr:mixRecorder* 出现:",m);
