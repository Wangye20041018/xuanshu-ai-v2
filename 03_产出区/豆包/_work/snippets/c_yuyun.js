function XsYuyun(p){
var api=(typeof window!=="undefined")?window.asr_api:null;
var [phase,setPhase]=x.useState("idle");
var [sec,setSec]=x.useState(0);
var [chunks,setChunks]=x.useState(0);
var [eng,setEng]=x.useState("");
var [note,setNote]=x.useState("按住开始录音，松开后离线转写并回填");
var ctrl=x.useRef(null),timer=x.useRef(null),t0=x.useRef(0),nBuf=x.useRef(0),recording=x.useRef(false),loaded=x.useRef(false);
var clearT=function(){if(timer.current){clearInterval(timer.current);timer.current=null;}};
x.useEffect(function(){
  try{Promise.resolve(rt("xuanshu:asr:status")).then(function(r){
    var ok=r&&(r.downloaded||r.ok||r.status==="ready");setEng(ok?"ready":"no-model");
    if(!ok)setNote("离线语音模型未就位（缺 model），录音可保存但无法转文字");
  }).catch(function(){setEng("");});}catch(_){}
  return clearT;
},[]);
var start=function(ev){if(ev&&ev.preventDefault)ev.preventDefault();if(p.disabled||recording.current||phase==="processing")return;if(!api||!api.mixRecorderStart){setPhase("error");setNote("当前环境未提供语云录音接口 window.asr_api，无法录音。");return;}nBuf.current=0;setChunks(0);try{ctrl.current=api.mixRecorderStart({onRecvData:function(){nBuf.current++;setChunks(function(n){return n+1;});}});}catch(e){setPhase("error");setNote("录音启动失败："+((e&&e.message)||e));return;}recording.current=true;t0.current=Date.now();setSec(0);setPhase("recording");setNote("正在录音，松开结束并离线转写…");timer.current=setInterval(function(){setSec(Math.floor((Date.now()-t0.current)/1000));},200);};
var stop=function(ev){if(ev&&ev.preventDefault)ev.preventDefault();if(!recording.current)return;recording.current=false;clearT();var dur=Math.max(1,Math.round((Date.now()-t0.current)/1000));setPhase("processing");setNote(loaded.current?"正在离线转写…":"正在转写，首次需加载离线语音模型（约十几秒，之后秒出）…");var c=ctrl.current,savedPath="";ctrl.current=null;
var fail=function(reason){setPhase("error");setNote("录音已完成（"+dur+" 秒，音频块 "+nBuf.current+(savedPath?("，已保存 "+savedPath):"")+"）。"+reason);try{Ce.warning&&Ce.warning(reason);}catch(_){}};
Promise.resolve().then(function(){if(c&&typeof c.stop==="function")return c.stop(true);return null;}).then(function(sr){savedPath=(sr&&(sr.saveFilePath||sr.filePath||sr.path))||"";return new Promise(function(resolve,rej){var done=false;try{Promise.resolve(rt("xuanshu:asr:transcribe",{durationSec:dur,chunks:nBuf.current,audioPath:savedPath,timeoutMs:60000})).then(function(r){if(done)return;done=true;if(r&&(r.ok||r.success)&&(r.text||r.transcript)){loaded.current=true;resolve(r.text||r.transcript);}else{rej(new Error((r&&(r.code||r.error))||"empty"));}}).catch(function(e){if(done)return;done=true;rej(e);});}catch(e){done=true;rej(e);}setTimeout(function(){if(!done){done=true;rej(new Error("timeout"));}},60000);});}).then(function(text){text=String(text||"").trim();if(text){if(p.onText)p.onText(text);setPhase("done");setNote("已转写并回填："+(text.length>24?text.slice(0,24)+"…":text));if(p.onDone)p.onDone();}else fail("转写结果为空（可能是静音或过短）。");}).catch(function(e){var code=String((e&&e.message)||e||"");var reason = code==="timeout"?"转写超时（首次加载模型较久，可再试一次）。":(code==="no-audio"||code==="audio-missing")?"未取到录音文件。":(code.indexOf("model")>=0||eng==="no-model")?"离线语音模型未就位：把 SenseVoice/Paraformer 模型放入 voice-models 后即可转写。":"离线转写失败（"+code+"）；录音已落盘。";fail(reason);});};
var rec=phase==="recording",proc=phase==="processing";
return o.jsxs("div",{className:"mx-3 mb-3 select-none",children:[
o.jsxs("button",{type:"button",disabled:!!p.disabled||proc,onMouseDown:start,onTouchStart:start,onMouseUp:stop,onTouchEnd:stop,onMouseLeave:function(){if(recording.current)stop();},className:se("flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors",rec?"bg-rose-500 text-white":"bg-primary/10 text-primary hover:bg-primary/20",(p.disabled||proc)&&"cursor-not-allowed opacity-60"),children:[o.jsx(n1,{className:"h-4 w-4"}),o.jsx("span",{children:rec?("松开结束 · "+sec+"s · "+chunks+"块"):(proc?"处理中…":"按住 说话")})]}),
o.jsx("div",{className:"mt-1.5 px-1 text-[11px] leading-relaxed text-muted-foreground/80",children:note})
]});}
