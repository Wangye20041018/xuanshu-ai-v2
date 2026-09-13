function XsCardHead(icon,title,extra){return o.jsxs("div",{className:"flex items-center justify-between gap-2.5 px-6 py-4 pb-2 text-[13px] font-semibold text-foreground border-b border-border/50",children:[o.jsxs("div",{className:"flex items-center gap-2.5",children:[o.jsx(icon,{className:"h-[18px] w-[18px] text-[#E55318]"}),title]}),extra||null]});}
function XsStatePill(state){var map={ready:"bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",starting:"bg-amber-500/10 text-amber-600 dark:text-amber-400",idle:"bg-zinc-500/10 text-zinc-500",error:"bg-rose-500/10 text-rose-600 dark:text-rose-400",unavailable:"bg-zinc-500/10 text-zinc-400"};var label={ready:"就绪",starting:"启动中",idle:"空闲",error:"异常",unavailable:"通道待接入"}[state]||state;return o.jsx("span",{className:"inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium "+(map[state]||map.idle),children:label});}
function XsLocalModelCard(){
var [st,setSt]=x.useState(null);
var [modelPath,setModelPath]=x.useState("");
var [ctx,setCtx]=x.useState(8192);
var [msg,setMsg]=x.useState("");
var refresh=function(){try{Promise.resolve(rt("xuanshu:inference:status")).then(function(s){setSt(s);}).catch(function(){setSt(null);});}catch(_){setSt(null);}};
x.useEffect(function(){refresh();var t=setInterval(refresh,3000);return function(){clearInterval(t);}},[]);
var ready=!!(st&&(st.state==="ready"||st.ready===true));
var stateText=st?(st.state||(st.ready?"ready":"idle")):"unavailable";
var cfg=(st&&st.cfg)||{};
var pick=function(){try{Promise.resolve(rt("dialog:open",{title:"选择本地 GGUF 模型",filters:[{name:"GGUF 模型",extensions:["gguf"]}],properties:["openFile"]})).then(function(r){var p=Array.isArray(r)?r[0]:(r&&(r.filePath||(r.filePaths&&r.filePaths[0])||r.path)||(typeof r==="string"?r:""));if(!p||typeof p!=="string")return;setModelPath(p);try{Promise.resolve(rt("xuanshu:inference:setModel",p)).catch(function(){});}catch(_){}}).catch(function(){});}catch(_){}};
var start=function(){try{Promise.resolve(rt("xuanshu:inference:start",{})).then(refresh).catch(function(){setMsg("本地推理暂未响应（xuanshu:inference:start），请确认主进程本地引擎可启动。");});}catch(_){setMsg("当前环境无法调用本地推理 IPC。");}};
var stop=function(){try{rt("xuanshu:inference:stop",true);}catch(_){}setTimeout(refresh,600);};
var applyCtx=function(){var n=parseInt(ctx,10);if(!(n>0))return;try{Promise.resolve(rt("xuanshu:inference:setContext",n)).catch(function(){});}catch(_){}};
return o.jsxs("div",{className:"bg-white dark:bg-card rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden",children:[
XsCardHead(JL,"本地推理引擎",XsStatePill(stateText)),
o.jsxs("div",{className:"px-6 py-4 space-y-1",children:[
o.jsx(F0,{label:"运行状态",description:st?("子进程 "+(st.childAlive?"存活":"未运行")+(cfg.modelPath?(" · 当前模型 "+cfg.modelPath):"")):"暂未取得本地推理状态，正在每 3 秒自动重试（xuanshu:inference:status）。",children:o.jsxs("div",{className:"flex items-center gap-2",children:[ready?o.jsx(Fe,{size:"sm",variant:"outline",className:"h-8 rounded-lg",onClick:stop,children:"停止"}):o.jsx(Fe,{size:"sm",className:"h-8 rounded-lg bg-[#E55318] hover:bg-[#d04a14]",onClick:start,children:"启动本地推理"}),o.jsx(Fe,{size:"sm",variant:"ghost",className:"h-8 rounded-lg",onClick:refresh,children:"刷新状态"})]})}),
o.jsx(F0,{label:"本地模型文件（GGUF）",description:modelPath||cfg.modelPath||"选择 .gguf 文件后，经 xuanshu:inference:setModel 下发给本地引擎",children:o.jsx(Fe,{size:"sm",variant:"outline",className:"h-9 rounded-lg",onClick:pick,children:"选择模型"})}),
o.jsx(F0,{label:"上下文长度",description:"下发给本地引擎的上下文窗口（token），默认 8192",children:o.jsxs("div",{className:"flex items-center gap-2",children:[o.jsx("input",{type:"number",min:512,step:512,value:ctx,onChange:function(ev){setCtx(ev.target.value);},className:"h-8 w-32 rounded-lg border border-black/10 bg-black/[0.03] px-2.5 text-[13px] tabular-nums outline-none focus:border-[#E55318] dark:border-white/15 dark:bg-white/5"}),o.jsx(Fe,{size:"sm",variant:"outline",className:"h-8 rounded-lg",onClick:applyCtx,children:"应用"})]})}),
msg?o.jsx("div",{className:"rounded-lg bg-amber-500/10 px-3 py-2 text-[12px] text-amber-700 dark:text-amber-300",children:msg}):null
]})
]});}
function XsHardwareCard(){
var gpu="";try{var gl=document.createElement("canvas").getContext("webgl");if(gl){var dbg=gl.getExtension("WEBGL_debug_renderer_info");gpu=dbg?gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL):String(gl.getParameter(gl.RENDERER)||"");}}catch(_){}
var cores=navigator.hardwareConcurrency||"—";var mem=navigator.deviceMemory?navigator.deviceMemory+" GB（浏览器可见）":"—";
var row=function(a,b){return o.jsxs(F0,{label:a,children:o.jsx("span",{className:"text-[13px] text-foreground",children:b})});};
return o.jsxs("div",{className:"bg-white dark:bg-card rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden",children:[
XsCardHead(JL,"本机硬件"),
o.jsxs("div",{className:"px-6 py-4 space-y-1",children:[
row("CPU 逻辑线程",cores),row("可用内存",mem),row("图形处理器（WebGL）",gpu||"未读取到独立 GPU 信息")
]})
]});}
function XsNetworkCard(){
var [online,setOnline]=x.useState(typeof navigator!=="undefined"?navigator.onLine:true);
x.useEffect(function(){var a=function(){setOnline(true);},b=function(){setOnline(false);};window.addEventListener("online",a);window.addEventListener("offline",b);return function(){window.removeEventListener("online",a);window.removeEventListener("offline",b);}},[]);
var hs=Hn();
var backend=hs&&hs.status?((hs.status.state||"—")+(hs.status.port?(" :"+hs.status.port):"")):"—";
return o.jsxs("div",{className:"bg-white dark:bg-card rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden",children:[
XsCardHead(JL,"网络与本地后端"),
o.jsxs("div",{className:"px-6 py-4 space-y-1",children:[
o.jsx(F0,{label:"系统网络",children:o.jsx("span",{className:"inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium "+(online?"bg-emerald-500/10 text-emerald-600 dark:text-emerald-400":"bg-rose-500/10 text-rose-600 dark:text-rose-400"),children:online?"在线":"离线"})}),
o.jsx(F0,{label:"本地后端",description:"本地网关/后端进程状态与监听端口",children:o.jsxs("div",{className:"flex items-center gap-2",children:[o.jsx("span",{className:"font-mono text-[12px] text-foreground",children:backend}),o.jsx(Fe,{size:"sm",variant:"outline",className:"h-8 rounded-lg",onClick:function(){try{hs&&hs.restart&&hs.restart();}catch(_){}},children:"重启后端"})]})})
]})
]});}
function XsCloudProviderCard(){
var [list,setList]=x.useState([]);
x.useEffect(function(){try{Promise.resolve(rt("provider:list")).then(function(d){var arr=[];if(Array.isArray(d))arr=d;else if(d&&typeof d==="object")arr=Object.keys(d).map(function(k){var v=d[k];return Object.assign({id:k},(typeof v==="object"&&v)?v:{name:v});});setList(arr);}).catch(function(){});}catch(_){}},[]);
var nameOf=function(p){return p.name||p.label||p.id||p.provider||"provider";};
var hasKey=function(p){return !!(p.hasApiKey||p.configured||p.hasKey||p.apiKey||p.keySet);};
return o.jsxs("div",{className:"bg-white dark:bg-card rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden",children:[
XsCardHead(JL,"云端提供方"),
o.jsxs("div",{className:"px-6 py-4",children:[
list.length===0?o.jsx("div",{className:"py-2 text-[13px] text-muted-foreground",children:"未获取到提供方列表（provider:list）。这里仅展示是否已配置密钥，不读取、不上传任何密钥内容。"}):
o.jsx("div",{className:"space-y-2",children:list.map(function(p,i){return o.jsxs("div",{className:"flex items-center justify-between rounded-lg border border-black/5 bg-black/[0.02] px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]",children:[o.jsx("span",{className:"text-[13px] text-foreground",children:nameOf(p)}),o.jsx("span",{className:"inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium "+(hasKey(p)?"bg-emerald-500/10 text-emerald-600 dark:text-emerald-400":"bg-zinc-500/10 text-zinc-500"),children:hasKey(p)?"已配置":"未配置"})]},i);})})
]})
]});}
