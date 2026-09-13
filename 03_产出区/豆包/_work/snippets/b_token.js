function G_e(){
var [rows,setRows]=x.useState([]);
var [loading,setLoading]=x.useState(true);
var [err,setErr]=x.useState("");
var load=function(){setLoading(true);try{Promise.resolve(rt("usage:recentTokenHistory",500)).then(function(d){var arr=Array.isArray(d)?d:(d&&(d.list||d.records||d.data))||[];setRows(arr);setErr("");}).catch(function(){setRows([]);setErr("暂无 Token 记录：主进程未返回用量历史（usage:recentTokenHistory）。");}).then(function(){setLoading(false);});}catch(_){setLoading(false);setErr("当前环境不支持读取 Token 历史。");}};
x.useEffect(load,[]);
var toMs=function(ts){ts=ts||0;if(ts>0&&ts<1e12)ts=ts*1000;return ts;};
var kindOf=function(r){var p=String((r&&(r.provider||r.source)||"")).toLowerCase();if(/local|flowy|ollama|xs|localai|gguf/.test(p))return "本地";if(/herdsman|cloud|openai|anthropic|deepseek|gemini|moonshot|qwen|remote/.test(p))return "云端";return p?"其他":"本地";};
var now=Date.now(),DAY=864e5;
var agg=function(since){var o={local:0,cloud:0,other:0,input:0,output:0,total:0};rows.forEach(function(r){var ts=toMs(r.timestamp);if(since&&ts<since)return;var tot=r.totalTokens||((r.inputTokens||0)+(r.outputTokens||0))||0;o.total+=tot;o.input+=r.inputTokens||0;o.output+=r.outputTokens||0;var k=kindOf(r);if(k==="本地")o.local+=tot;else if(k==="云端")o.cloud+=tot;else o.other+=tot;});return o;};
var today=agg(now-DAY),week=agg(now-7*DAY),all=agg(0);
var fmt=function(n){n=Number(n)||0;if(n>=1e8)return (n/1e8).toFixed(2)+"亿";if(n>=1e4)return (n/1e4).toFixed(1)+"万";return ""+n;};
var localPct=all.total>0?Math.round((all.local/all.total)*100):null;
var sorted=rows.slice().sort(function(a,b){return toMs(b.timestamp)-toMs(a.timestamp);}).slice(0,150);
var statCard=function(label,val,sub,tone){return o.jsxs("div",{className:"rounded-xl border border-black/5 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.03]",children:[o.jsx("div",{className:"text-[12px] text-muted-foreground",children:label}),o.jsx("div",{className:"mt-1 text-[22px] font-semibold tabular-nums text-foreground",children:fmt(val)}),sub?o.jsx("div",{className:"mt-0.5 text-[11px] "+(tone||"text-muted-foreground"),children:sub}):null]});};
var head=function(title,extra){return o.jsxs("div",{className:"flex items-center justify-between gap-2.5 px-6 py-4 pb-2 text-[13px] font-semibold text-foreground border-b border-border/50",children:[o.jsxs("div",{className:"flex items-center gap-2.5",children:[o.jsx(C6,{className:"h-[18px] w-[18px] text-[#E55318]"}),title]}),extra]});};
var badge=function(k){var map={"本地":"bg-emerald-500/10 text-emerald-600 dark:text-emerald-400","云端":"bg-sky-500/10 text-sky-600 dark:text-sky-400","其他":"bg-zinc-500/10 text-zinc-500"};return o.jsx("span",{className:"inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium "+(map[k]||map["其他"]),children:k});};
return o.jsxs("div",{className:"space-y-5",children:[
o.jsxs("div",{className:"bg-white dark:bg-card rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden",children:[
head("Token 用量概览",o.jsx(Fe,{size:"sm",variant:"outline",className:"h-8 rounded-lg text-[12px]",disabled:loading,onClick:load,children:loading?"刷新中…":"刷新"})),
o.jsx("div",{className:"grid grid-cols-2 gap-3 p-6 sm:grid-cols-4",children:[
statCard("今日消耗",today.total,"输入 "+fmt(today.input)+" · 输出 "+fmt(today.output)),
statCard("近 7 日",week.total,"本地 "+fmt(week.local)+" · 云端 "+fmt(week.cloud)),
statCard("累计消耗",all.total,"共 "+rows.length+" 条记录"),
statCard("本地占比",localPct==null?"—":localPct+"%",localPct==null?"暂无数据":"本地 "+fmt(all.local)+" / 云端 "+fmt(all.cloud),"text-[#E55318]")
]})
]}),
o.jsxs("div",{className:"bg-white dark:bg-card rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden",children:[
head("Token 明细（最近 "+sorted.length+" 条）"),
loading?o.jsx("div",{className:"px-6 py-10 text-center text-[13px] text-muted-foreground",children:"正在读取本地用量记录…"}):
err&&sorted.length===0?o.jsx("div",{className:"px-6 py-10 text-center text-[13px] text-muted-foreground",children:err}):
sorted.length===0?o.jsx("div",{className:"px-6 py-10 text-center text-[13px] text-muted-foreground",children:"还没有 Token 消耗记录。本地推理不消耗云端额度。"}):
o.jsx("div",{className:"max-h-[420px] overflow-auto",children:o.jsxs("table",{className:"w-full text-[12px]",children:[
o.jsx("thead",{className:"sticky top-0 bg-card text-left text-muted-foreground",children:o.jsxs("tr",{children:[["时间","模型","类型","输入","输出","合计"].map(function(c){return o.jsx("th",{className:"px-4 py-2 font-medium",children:c},c);})]})}),
o.jsx("tbody",{children:sorted.map(function(r,i){var k=kindOf(r),ts=toMs(r.timestamp),d=ts?new Date(ts):null,tot=r.totalTokens||((r.inputTokens||0)+(r.outputTokens||0))||0;return o.jsxs("tr",{className:"border-t border-border/40",children:[o.jsx("td",{className:"px-4 py-2 whitespace-nowrap tabular-nums text-muted-foreground",children:d?d.toLocaleString():("—")}),o.jsx("td",{className:"px-4 py-2 max-w-[220px] truncate",children:r.model||r.agentId||"—"}),o.jsx("td",{className:"px-4 py-2",children:badge(k)}),o.jsx("td",{className:"px-4 py-2 tabular-nums",children:fmt(r.inputTokens)}),o.jsx("td",{className:"px-4 py-2 tabular-nums",children:fmt(r.outputTokens)}),o.jsx("td",{className:"px-4 py-2 tabular-nums font-medium text-foreground",children:fmt(tot)})]},i);})})
]})})
]})
]});}
