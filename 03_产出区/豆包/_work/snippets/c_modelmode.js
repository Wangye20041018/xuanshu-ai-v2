function XsModelMode(){
var [mode,setMode]=x.useState(function(){try{return localStorage.getItem("xs:modelMode")||"auto";}catch(_){return "auto";}});
var [inf,setInf]=x.useState(null);
var refresh=function(){try{Promise.resolve(rt("xuanshu:inference:status")).then(function(s){setInf(s);}).catch(function(){setInf(null);});}catch(_){setInf(null);}};
x.useEffect(function(){
  refresh();var t=setInterval(refresh,4000);
  /* 以后端为权威，同步一次主进程当前模式 */
  try{Promise.resolve(rt("xuanshu:model:getMode")).then(function(r){if(r&&(r.mode==="local"||r.mode==="cloud"||r.mode==="auto")){setMode(r.mode);try{localStorage.setItem("xs:modelMode",r.mode);}catch(_){}if(r.state)setInf({state:r.state});}}).catch(function(){});}catch(_){}
  return function(){clearInterval(t);}
},[]);
var pick=function(m){
  setMode(m);try{localStorage.setItem("xs:modelMode",m);}catch(_){}
  try{Promise.resolve(rt("xuanshu:model:setMode",{mode:m})).then(function(res){
    if(res&&res.state)setInf({state:res.state});
    if(res&&res.ok===false&&res.error){try{Ce.message("模型来源切换未完成："+res.error);}catch(_){}}
  }).catch(function(){});}catch(_){}
};
var opts=[["local","本地"],["cloud","云端"],["auto","自动"]];
var localReady=!!(inf&&(inf.state==="ready"||inf.ready===true));
return o.jsxs("div",{className:"flex shrink-0 items-center gap-0.5 rounded-lg bg-black/[0.05] p-0.5 dark:bg-white/[0.07]",title:"模型来源：仅本地推理 / 仅云端 / 自动（本地优先、云端兜底）；由主进程切换默认模型路由",children:opts.map(function(it){var active=mode===it[0];return o.jsxs("button",{type:"button",onClick:function(){pick(it[0]);},className:se("flex h-7 items-center gap-1 whitespace-nowrap rounded-md px-2.5 text-[11px] font-medium transition-all",active?"bg-white text-foreground shadow-sm dark:bg-white/[0.16] dark:text-white":"text-muted-foreground hover:text-foreground"),children:[it[0]==="local"?o.jsx("span",{className:se("h-1.5 w-1.5 rounded-full",localReady?"bg-emerald-500":"bg-amber-500"),title:localReady?"本地推理就绪":"本地推理未就绪，正在拉起或无本地模型"}):null,it[1]]},it[0]);})});}
