const fs=require("fs");const s=fs.readFileSync(process.argv[2],"utf8");let out=[];
function c(k){let n=0,i=-1;while((i=s.indexOf(k,i+1))!==-1)n++;return n;}
const ids=["window.XSTheme","function XsThemePanel","function XsLocalModelCard","function XsHardwareCard","function XsNetworkCard","function XsCloudProviderCard","function XsHealthCard","function XsModelMode","function XsYuyun","o.jsx(XsThemePanel","o.jsx(XsLocalModelCard","o.jsx(XsHealthCard","o.jsx(XsModelMode","o.jsx(XsYuyun","xs:modelMode","xs:theme","xuanshu:model:getMode","timeoutMs:60000","xuanshu:asr:status","语音识别引擎待接入","credits.noMoreData"];
for(const k of ids)out.push((""+c(k)).padStart(3)+"  "+k);
fs.writeFileSync(require("path").join(__dirname,"probe2_out.txt"),out.join("\n"),"utf8");
