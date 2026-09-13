function XsHealthCard(){
var [items,setItems]=x.useState([]);
var [running,setRunning]=x.useState(false);
var settings=Zr();
var hs=Hn();
var dot=function(level){var c={ok:"bg-emerald-500",warn:"bg-amber-500",off:"bg-zinc-400"}[level]||"bg-zinc-400";return o.jsx("span",{className:"mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full "+c});};
var tag=function(level){var m={ok:"text-emerald-600 dark:text-emerald-400",warn:"text-amber-600 dark:text-amber-400",off:"text-zinc-400"};var t={ok:"良好",warn:"关注",off:"未接入"};return o.jsx("span",{className:"text-[11px] font-medium "+(m[level]||m.off),children:t[level]||level});};
var run=function(){
setRunning(true);
var sync=[];
var tel=settings&&settings.telemetryEnabled;
sync.push({label:"匿名遥测上报",level:tel?"warn":"ok",text:tel?"设置中仍为开启（代码层已掐断上报网络请求）":"已关闭，且遥测上报网络段已从代码层移除"});
var bs=hs&&hs.status&&hs.status.state;
sync.push({label:"本地后端进程",level:(bs==="ready"||bs==="running")?"ok":(bs?"warn":"off"),text:bs?("当前状态："+bs+(hs.status.port?("，端口 "+hs.status.port):"")):"未取得本地后端状态"});
sync.push({label:"运行环境",level:"ok",text:"本地私人部署 · 渲染进程仅通过受控 IPC 与主进程通信"});
var j1=Promise.resolve(rt("xuanshu:inference:status")).then(function(s){var ok=s&&(s.state==="ready"||s.ready===true);return {label:"本地推理引擎",level:ok?"ok":(s?"warn":"off"),text:s?("状态 "+(s.state||"ready")+(s.childAlive?" · 子进程存活":" · 子进程未运行")):"本地引擎未启动"};}).catch(function(){return {label:"本地推理引擎",level:"off",text:"本地推理通道未返回状态（xuanshu:inference:status），引擎未启动或主进程暂未响应"};});
var j2=Promise.resolve(rt("provider:list")).then(function(d){var n=Array.isArray(d)?d.length:(d&&typeof d==="object"?Object.keys(d).length:0);return {label:"云端提供方",level:n>0?"ok":"off",text:n?("已登记 "+n+" 个提供方（仅统计数量，不读取密钥）"):"未配置云端提供方，将仅使用本地能力"};}).catch(function(){return {label:"云端提供方",level:"off",text:"无法读取 provider:list"};});
Promise.all([j1,j2]).then(function(extra){setItems(sync.concat(extra));setRunning(false);}).catch(function(){setItems(sync);setRunning(false);});
};
x.useEffect(function(){run();},[]);
return o.jsxs("div",{className:"bg-white dark:bg-card rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden",children:[
o.jsxs("div",{className:"flex items-center justify-between gap-2.5 px-6 py-4 pb-2 text-[13px] font-semibold text-foreground border-b border-border/50",children:[o.jsxs("div",{className:"flex items-center gap-2.5",children:[o.jsx(rd,{className:"h-[18px] w-[18px] text-[#E55318]"}),"安全健康检查"]}),o.jsx(Fe,{size:"sm",variant:"outline",className:"h-8 rounded-lg text-[12px]",disabled:running,onClick:run,children:running?"检查中…":"重新检查"})]}),
o.jsx("div",{className:"px-6 py-4",children:items.length===0?o.jsx("div",{className:"py-2 text-[13px] text-muted-foreground",children:"正在执行本地安全检查…"}):o.jsx("div",{className:"space-y-2.5",children:items.map(function(it,i){return o.jsxs("div",{className:"flex items-start gap-2.5",children:[dot(it.level),o.jsxs("div",{className:"min-w-0 flex-1",children:[o.jsxs("div",{className:"flex items-center gap-2",children:[o.jsx("span",{className:"text-[13px] font-medium text-foreground",children:it.label}),tag(it.level)]}),o.jsx("div",{className:"mt-0.5 text-[12px] leading-relaxed text-muted-foreground",children:it.text})]})]},i);})})})
]})
;}
