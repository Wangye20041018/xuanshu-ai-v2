function $_e(){
var {t:e}=tt("settings");
var [ver,setVer]=x.useState("");
var [plat,setPlat]=x.useState("");
x.useEffect(function(){try{Promise.resolve(rt("app:version")).then(function(v){setVer(v||"");}).catch(function(){});Promise.resolve(rt("app:platform")).then(function(v){setPlat(v||"");}).catch(function(){});}catch(_){}},[]);
var chromeVer=(function(){var m=navigator.userAgent.match(/Chrome\/([\d.]+)/);return m?m[1]:"";})();
var openData=function(){try{Promise.resolve(rt("app:getPath","userData")).then(function(p){return rt("shell:showItemInFolder",p);}).catch(function(){Ce.message&&Ce.message("当前环境暂不支持打开数据目录");});}catch(_){}};
var cardHead=function(icon,title){return o.jsxs("div",{className:"flex items-center gap-2.5 px-6 py-4 pb-2 text-[13px] font-semibold text-foreground border-b border-border/50",children:[o.jsx(icon,{className:"h-[18px] w-[18px] text-[#E55318]"}),title]});};
return o.jsxs("div",{className:"space-y-5",children:[
o.jsxs("div",{className:"bg-white dark:bg-card rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden",children:[
cardHead(JL,e("about.title")),
o.jsxs("div",{className:"px-6 py-5 space-y-3 text-[14px] text-muted-foreground",children:[
o.jsxs("p",{children:[o.jsx("strong",{className:"text-foreground font-semibold",children:e("about.appName")})," - "," ",e("about.tagline")]}),
o.jsx("p",{children:e("about.basedOn")}),
o.jsxs("p",{children:[e("about.version",{version:ver||"—"}),plat?o.jsxs("span",{className:"ml-2 text-[12px]",children:["· ",plat]}):null]}),
chromeVer?o.jsx("p",{className:"text-[12px]",children:"Chromium "+chromeVer}):null,
o.jsx(C_e,{})
]})
]}),
o.jsxs("div",{className:"bg-white dark:bg-card rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden",children:[
cardHead(JL,"本地运行与数据"),
o.jsxs("div",{className:"px-6 py-4 space-y-1",children:[
o.jsx(F0,{label:"应用数据目录",description:"配置、会话与本地模型索引均保存在本机，点击可在系统文件管理器中定位",children:o.jsx(Fe,{size:"sm",variant:"outline",className:"h-9 rounded-lg",onClick:openData,children:"打开数据目录"})}),
o.jsx(F0,{label:"运行模式",description:"纯本地私人部署，界面与推理均在本机完成",children:o.jsx("span",{className:"text-[13px] text-foreground",children:"本地优先（Local-first）"})})
]})
]}),
o.jsxs("div",{className:"bg-white dark:bg-card rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden",children:[
cardHead(JL,"隐私与遥测"),
o.jsx("div",{className:"px-6 py-5 text-[13px] leading-relaxed text-muted-foreground",children:"本软件为本地私人版本，已关闭匿名使用统计与崩溃上报；不会在后台向厂商云端上传行为数据。需要联网的能力（如云端模型、模型目录同步）仅在你主动使用时发起，且可在「模型与网关」中单独管理。"})
]})
]});}
