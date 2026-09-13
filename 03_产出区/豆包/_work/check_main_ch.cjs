const fs=require("fs");const s=fs.readFileSync(process.argv[2],"utf8");
const ch=["asr:mixRecorderStart","asr:mixRecorderPause","asr:mixRecorderResume","asr:mixRecorderStop","asr:readAudio","asr:audio-data","xuanshu:asr:transcribe","asr:transcribe","xuanshu:model:setMode","setModelMode","xuanshu:inference:start","xuanshu:inference:stop","xuanshu:inference:setModel","xuanshu:inference:setContext","xuanshu:usage:stats"];
for(const c of ch){let i=-1,n=0,first=-1;while((i=s.indexOf(c,i+1))!==-1){n++;if(first<0)first=i;}
 let ctx=first>=0?s.slice(Math.max(0,first-40),first+c.length+30).replace(/\s+/g," "):"";
 console.log((n>0?"OK ":"MISS")+"  x"+n+"  "+c+"   @"+first+(first>=0?("   …"+ctx):""));}
