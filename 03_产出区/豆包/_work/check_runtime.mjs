/* ===== 玄枢 XSTheme 全局主题引擎（运行时注入层，纯前端零依赖，单例） ===== */
(function(){
"use strict";
if(window.__XS_THEME__)return;
var LS_KEY="xs:theme";
var DEFAULT={version:1,mode:"glass",primary:"#3B82F6",secondary:"",glass:{blur:16,panelAlpha:0.62,tint:0.18,saturate:1.4,radius:14},image:{name:"",extractedAt:0,colors:{primary:"",secondary:"",bg:"",text:""}},savedPresets:[]};
var state=merge({},DEFAULT,load());
var subs=[],rafQ=false,styleEl=null,backdropEl=null,obs=null,lastDark=null,lastCss="";
function merge(a,b){for(var k in b)if(b[k]&&typeof b[k]==="object"&&!Array.isArray(b[k])){a[k]=merge(a[k]&&typeof a[k]==="object"?a[k]:{},b[k]);}else a[k]=b[k];return a;}
function clone(o){return JSON.parse(JSON.stringify(o));}
function load(){try{var raw=localStorage.getItem(LS_KEY);if(!raw)return{};var d=JSON.parse(raw);return d&&typeof d==="object"?d:{};}catch(e){return{};}}
function persist(){try{localStorage.setItem(LS_KEY,JSON.stringify(state));}catch(e){}
  try{if(window.electron&&window.electron.ipcRenderer){window.electron.ipcRenderer.invoke("settings:setMany",{xsTheme:JSON.stringify(state)}).catch(function(){});}}catch(e){}}
/* ---------- color utils ---------- */
function clamp(v,a,b){return Math.min(b,Math.max(a,v));}
function hexToRgb(h){h=String(h||"").trim().replace("#","");if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];var n=parseInt(h,16);if(isNaN(n)||h.length!==6)return[59,130,246];return[(n>>16)&255,(n>>8)&255,n&255];}
function rgbToHex(r,g,b){return"#"+[r,g,b].map(function(v){v=clamp(Math.round(v),0,255);var s=v.toString(16);return s.length<2?"0"+s:s;}).join("");}
function rgbToHsl(r,g,b){r/=255;g/=255;b/=255;var mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,d=mx-mn,h=0,s=0;if(d){s=l>0.5?d/(2-mx-mn):d/(mx+mn);switch(mx){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4;}h*=60;}return[h,s,l];}
function hslToRgb(h,s,l){h=((h%360)+360)%360;s=clamp(s,0,1);l=clamp(l,0,1);var c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs(((h/60)%2)-1)),m=l-c/2;var r,g,b;if(h<60){r=c;g=x;b=0;}else if(h<120){r=x;g=c;b=0;}else if(h<180){r=0;g=c;g=c;b=x;}else if(h<240){r=0;g=x;b=c;}else if(h<300){r=x;g=0;b=c;}else{r=c;g=0;b=x;}return[(r+m)*255,(g+m)*255,(b+m)*255];}
function lin(c){c/=255;return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4);}
function lum(rgb){return 0.2126*lin(rgb[0])+0.7152*lin(rgb[1])+0.0722*lin(rgb[2]);}
function contrast(a,b){var l1=lum(a)+0.05,l2=lum(b)+0.05;return Math.max(l1,l2)/Math.min(l1,l2);}
function fgOn(rgb){return contrast(rgb,[255,255,255])>=contrast(rgb,[10,10,10])?[255,255,255]:[10,10,10];}
var LEVELS=[0.965,0.91,0.83,0.72,0.60,-1,0.46,0.36,0.27,0.19],SATS=[0.55,0.6,0.7,0.85,0.95,1,0.95,0.9,0.85,0.8];
function scale(primary){var hsl=rgbToHsl(primary[0],primary[1],primary[2]),out=[];for(var i=0;i<10;i++){var L=i===5?hsl[2]:clamp(LEVELS[i],0.04,0.98),S=clamp(hsl[1]*SATS[i],0,1);var rgb=hslToRgb(hsl[0],S,L);out.push(Math.round(rgb[0])+","+Math.round(rgb[1])+","+Math.round(rgb[2]));}return out;}
function hslTrip(rgb){var h=rgbToHsl(rgb[0],rgb[1],rgb[2]);return h[0].toFixed(1)+" "+(h[1]*100).toFixed(1)+"% "+(h[2]*100).toFixed(1)+"%";}
/* ---------- canvas extraction (local only) ---------- */
function extractFromImage(file){return new Promise(function(resolve,rej){try{var url=URL.createObjectURL(file),img=new Image();
  img.onload=function(){try{var S=64,cv=document.createElement("canvas");cv.width=S;cv.height=S;var cx=cv.getContext("2d",{willReadFrequently:true});cx.drawImage(img,0,0,S,S);var data=cx.getImageData(0,0,S,S).data;URL.revokeObjectURL(url);
    var edge=8,band=Math.max(2,Math.round(S*0.08)),px=[];for(var y=0;y<S;y++)for(var x=0;x<S;x++){var o=(y*S+x)*4;px.push([data[o],data[o+1],data[o+2],x,y]);}
    function q(v){return v>>4;}var bgMap={};for(var i=0;i<px.length;i++){var p=px[i];if(p[3]<band||p[3]>=S-band||p[4]<band||p[4]>=S-band){var key=q(p[0])+"_"+q(p[1])+"_"+q(p[2]);bgMap[key]=(bgMap[key]||0)+1;}}var bgKey=null,bgN=0;for(var k in bgMap)if(bgMap[k]>bgN){bgN=bgMap[k];bgKey=k;}var bg=bgKey?bgKey.split("_").map(function(v){return(parseInt(v,10)<<4)+8;}):[245,245,245];
    var buckets={};for(var i=0;i<px.length;i++){var p=px[i];if(p[3]>=band&&p[3]<S-band&&p[4]>=band&&p[4]<S-band){var hsl=rgbToHsl(p[0],p[1],p[2]);if(hsl[1]<0.12||hsl[2]<0.12||hsl[2]>0.93)continue;var dx=p[0]-bg[0],dy=p[1]-bg[1],dz=p[2]-bg[2];if(Math.sqrt(dx*dx+dy*dy+dz*dz)<26)continue;var hb=clamp(Math.floor(hsl[0]/22.5),0,15),sb=clamp(Math.floor(hsl[1]*4),0,3),lb=clamp(Math.floor(hsl[2]*4),0,3),bk=hb+"_"+sb+"_"+lb;var cxw=1-Math.abs(p[3]-S/2)/(S/2),cyw=1-Math.abs(p[4]-S/2)/(S/2),w=hsl[1]*(0.6+0.4*cxw*cyw);(b=buckets[bk]||(buckets[bk]={n:0,r:0,g:0,b:0,w:0})),b.n++;b.w+=w;b.r+=p[0]*w;b.g+=p[1]*w;b.b+=p[2]*w;}}
    var arr=Object.keys(buckets).map(function(kk){return buckets[kk];}).sort(function(a,b){return b.w-a.w;});var prim,sec=null;if(!arr.length){var av=[0,0,0],nn=0;for(var i=0;i<px.length;i++){av[0]+=px[i][0];av[1]+=px[i][1];av[2]+=px[i][2];nn++;}av=av.map(function(v){return Math.round(v/nn);});var ah=rgbToHsl(av[0],av[1],av[2]);var boosted=hslToRgb(ah[0],Math.max(ah[1],0.55),clamp(ah[2],0.35,0.6));prim=[Math.round(boosted[0]),Math.round(boosted[1]),Math.round(boosted[2])];}else{var top=arr[0];prim=[Math.round(top.r/top.w),Math.round(top.g/top.w),Math.round(top.b/top.w)];var ph=rgbToHsl(prim[0],prim[1],prim[2])[0];for(var i=1;i<arr.length;i++){var c2=[Math.round(arr[i].r/arr[i].w),Math.round(arr[i].g/arr[i].w),Math.round(arr[i].b/arr[i].w)];var dh=Math.abs(rgbToHsl(c2[0],c2[1],c2[2])[0]-ph);dh=Math.min(dh,360-dh);if(dh>40){sec=c2;break;}}}
    if(!sec){var ph2=rgbToHsl(prim[0],prim[1],prim[2]);var sr=hslToRgb(ph2[0]+38,Math.max(ph2[1]*0.9,0.3),clamp(ph2[2]+0.06,0.1,0.86));sec=[Math.round(sr[0]),Math.round(sr[1]),Math.round(sr[2])];}
    var fg=fgOn(prim),res={primary:rgbToHex(prim[0],prim[1],prim[2]),secondary:rgbToHex(sec[0],sec[1],sec[2]),bg:rgbToHex(bg[0],bg[1],bg[2]),text:rgbToHex(fg[0],fg[1],fg[2])};resolve(res);
  }catch(e){rej(e);}};img.onerror=function(){rej(new Error("image load failed"));};img.src=url;}catch(e){rej(e);}});}
/* ---------- css build ---------- */
function isDark(){return document.documentElement.classList.contains("dark");}
function buildCss(dark){var pr=hexToRgb(state.primary),sec=hexToRgb(state.secondary||state.primary),sc=scale(pr),fg=fgOn(pr),g=state.glass||DEFAULT.glass;
  var ph=rgbToHsl(pr[0],pr[1],pr[2]);
  var pa=clamp(g.panelAlpha,0.08,0.98), paStrong=clamp(pa+0.18,0.2,0.98);
  var surf="hsla("+(dark?240:240)+","+(dark?"3%":"0%")+","+(dark?Math.round((1-pa*0.30)*100):Math.round((1-pa*0.12)*100))+"%,"+pa.toFixed(3)+")";
  var surfStrong="hsla("+(dark?240:240)+","+(dark?"3%":"0%")+","+(dark?Math.round((1-paStrong*0.30)*100):Math.round((1-paStrong*0.12)*100))+"%,"+paStrong.toFixed(3)+")";
  var hair=dark?"rgba(255,255,255,"+(0.10+g.tint*0.2).toFixed(3)+")":"rgba(255,255,255,"+(0.55+g.tint*0.3).toFixed(3)+")";
  var tintRgba="rgba("+sc[5]+","+clamp(g.tint,0,0.6).toFixed(3)+")";
  var blur="blur("+clamp(g.blur,0,30)+"px) saturate("+clamp(g.saturate,1,2)+")";
  var P=hslTrip(pr), FG=hslTrip(fg), SEC=hslTrip(sec);
  var L=[];
  L.push("html[data-xs-mode]{");
  L.push("--primary:"+P+";--ring:"+P+";--primary-foreground:"+FG+";--secondary:"+SEC+";--accent:"+SEC+";");
  for(var i=0;i<10;i++)L.push("--semi-blue-"+i+":"+sc[i]+";");
  L.push("--semi-color-primary:rgba("+sc[5]+",1);--semi-color-primary-hover:rgba("+sc[4]+",1);--semi-color-primary-active:rgba("+sc[6]+",1);");
  L.push("--semi-color-primary-disabled:rgba("+sc[5]+",0.35);--semi-color-primary-disabled-bg:rgba("+sc[5]+",0.10);");
  L.push("--semi-color-primary-light-default:rgba("+sc[5]+",0.08);--semi-color-primary-light-hover:rgba("+sc[5]+",0.16);--semi-color-primary-light-active:rgba("+sc[5]+",0.24);");
  L.push("--semi-color-link:rgba("+sc[5]+",1);--semi-color-link-hover:rgba("+sc[4]+",1);--semi-color-link-active:rgba("+sc[6]+",1);--semi-color-focus-border:rgba("+sc[5]+",0.45);");
  L.push("--xs-primary-rgb:"+sc[5]+";--xs-blur:"+clamp(g.blur,0,30)+"px;--xs-sat:"+clamp(g.saturate,1,2)+";--xs-surface:"+surf+";--xs-surface-strong:"+surfStrong+";--xs-hairline:"+hair+";--xs-tint:"+tintRgba+";--xs-radius:"+clamp(g.radius,0,28)+"px;}");
  if(state.mode==="glass"||state.mode==="image"){
    L.push("html[data-xs-mode] body{background:transparent !important;}");
    L.push("#xs-backdrop{position:fixed;inset:0;z-index:-1;pointer-events:none;transition:opacity .35s ease;}");
    var cardSel="html[data-xs-mode] .bg-white.rounded-2xl,html[data-xs-mode] .bg-card.rounded-2xl";
    L.push(cardSel+"{background-color:var(--xs-surface) !important;backdrop-filter:"+blur+";-webkit-backdrop-filter:"+blur+";border:1px solid var(--xs-hairline) !important;border-radius:max(16px,var(--xs-radius));box-shadow:0 10px 34px rgba(0,0,0,"+(dark?0.32:0.10)+"),inset 0 1px 0 rgba(255,255,255,"+(dark?0.06:0.35)+") !important;}");
    L.push("html[data-xs-mode] .bg-panel{background-color:var(--xs-surface) !important;backdrop-filter:"+blur+";-webkit-backdrop-filter:"+blur+";border:1px solid var(--xs-hairline);}");
    L.push("html[data-xs-mode] .semi-modal-content,html[data-xs-mode] .semi-modal-body,html[data-xs-mode] .semi-dropdown-menu,html[data-xs-mode] .semi-select-option-list,html[data-xs-mode] .semi-popover-content,html[data-xs-mode] .semi-tooltip-wrapper,html[data-xs-mode] .semi-cascader-option-list,html[data-xs-mode] .semi-datepicker,html[data-xs-mode] .semi-timepicker{background-color:var(--xs-surface-strong) !important;backdrop-filter:"+blur+";-webkit-backdrop-filter:"+blur+";border:1px solid var(--xs-hairline);}");
    L.push("html[data-xs-mode] .semi-modal-content{box-shadow:0 18px 60px rgba(0,0,0,"+(dark?0.5:0.18)+") !important;}");
  }
  /* Semi 明暗跟随（补齐运行时未设置 theme-mode 的缺口） */
  return L.join("");
}
function ambient(dark){var g=state.glass||DEFAULT.glass;var pr=hexToRgb(state.primary),hsl=rgbToHsl(pr[0],pr[1],pr[2]),c1=hslToRgb(hsl[0],clamp(hsl[1]*0.85,0,1),dark?0.16:0.93),c2=hslToRgb((hsl[0]+42)%360,clamp(hsl[1]*0.7,0,1),dark?0.10:0.97);
  var layers=[];
  if(state.mode==="image"&&state.image&&state.image.dataUrl){layers.push("url('"+state.image.dataUrl+"') center/cover no-repeat");layers.push("linear-gradient("+(dark?"rgba(12,12,16,0.55)":"rgba(255,255,255,0.50)")+",var(--xs-tint))");}
  layers.push("radial-gradient(1200px 800px at 12% -10%,rgba("+Math.round(c1[0])+","+Math.round(c1[1])+","+Math.round(c1[2])+",1),transparent 60%)");
  layers.push("radial-gradient(1000px 760px at 110% 110%,rgba("+Math.round(c2[0])+","+Math.round(c2[1])+","+Math.round(c2[2])+",1),transparent 55%)");
  layers.push(dark?"#141418":"#eef1f6");
  return"background:"+layers.join(",")+";filter:saturate("+clamp(g.saturate,1,2)+");";
}
/* ---------- render (rAF throttled, setProperty only, no React) ---------- */
function ensureStyle(){if(styleEl)return styleEl;styleEl=document.getElementById("xs-theme-layer");if(!styleEl){styleEl=document.createElement("style");styleEl.id="xs-theme-layer";styleEl.setAttribute("data-xs","1");(document.head||document.documentElement).appendChild(styleEl);}return styleEl;}
function ensureBackdrop(){if(backdropEl)return backdropEl;backdropEl=document.getElementById("xs-backdrop");if(!backdropEl){backdropEl=document.createElement("div");backdropEl.id="xs-backdrop";(document.body||document.documentElement).appendChild(backdropEl);}return backdropEl;}
function render(){var dark=isDark();if(dark!==lastDark)lastDark=dark;
  try{document.body&&document.body.setAttribute("theme-mode",dark?"dark":"light");}catch(e){}
  var css=buildCss(dark);if(css!==lastCss){ensureStyle().textContent=css;lastCss=css;}
  var root=document.documentElement;if(state.mode&&state.mode!=="none")root.setAttribute("data-xs-mode",state.mode);
  var bd=ensureBackdrop();if(state.mode==="glass"||state.mode==="image"){bd.style.cssText=ambient(dark);bd.style.opacity="1";}else{bd.style.opacity="0";}
  subs.forEach(function(f){try{f(clone(state),dark);}catch(e){}});
}
function schedule(){if(rafQ)return;rafQ=true;requestAnimationFrame(function(){rafQ=false;render();});}
/* ---------- public api ---------- */
var api={
  getState:function(){return clone(state);},
  apply:function(patch,opts){if(!patch)return;state=merge(state,clone(patch));schedule();if(!(opts&&opts.preview))persist();return clone(state);},
  save:function(){persist();},
  reset:function(){state=merge({},DEFAULT);try{localStorage.removeItem(LS_KEY);}catch(e){}var r=document.documentElement;r.removeAttribute("data-xs-mode");try{document.body&&document.body.removeAttribute("theme-mode");}catch(e){}if(styleEl)styleEl.textContent="";if(backdropEl)backdropEl.remove(),backdropEl=null;lastCss="";subs.forEach(function(f){try{f(clone(state),isDark());}catch(e){}});persist();},
  extractFromImage:extractFromImage,
  listPresets:function(){return(state.savedPresets||[]).slice();},
  savePreset:function(name){var p=clone(state);p.name=name;p.savedAt=Date.now();state.savedPresets=(state.savedPresets||[]).filter(function(x){return x.name!==name;}).concat([p]);persist();return this.listPresets();},
  removePreset:function(name){state.savedPresets=(state.savedPresets||[]).filter(function(x){return x.name!==name;});persist();return this.listPresets();},
  usePreset:function(name){var p=(state.savedPresets||[]).find(function(x){return x.name===name;});if(p){var presets=state.savedPresets;state=merge({},DEFAULT);state.savedPresets=presets;delete p.name;delete p.savedAt;state=merge(state,p);schedule();persist();}return clone(state);},
  subscribe:function(fn){if(typeof fn==="function")subs.push(fn);return function(){subs=subs.filter(function(x){return x!==fn;});};}
};
window.XSTheme=api;window.__XS_THEME__=api;
/* ---------- boot + observe light/dark ---------- */
function boot(){try{document.documentElement.setAttribute("data-xs-mode",state.mode);render();}catch(e){}
  if(!obs&&window.MutationObserver){obs=new MutationObserver(function(){var dark=isDark();if(dark!==lastDark)schedule();});obs.observe(document.documentElement,{attributes:true,attributeFilter:["class"]});}
  try{if(window.electron&&window.electron.ipcRenderer){window.electron.ipcRenderer.invoke("settings:getAll").then(function(s){if(s&&typeof s.xsTheme==="string"){var d=JSON.parse(s.xsTheme);if(d&&(d.primary||d.mode)){state=merge(state,d);schedule();}}}).catch(function(){});}}catch(e){}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
/* ===== /XSTheme ===== */
