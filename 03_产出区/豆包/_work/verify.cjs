/* 集成自检：对最终产物断言；任何不符则 exit 1 */
const fs = require('fs');
const out = fs.readFileSync(process.argv[2], 'utf8');
const src = fs.readFileSync(process.argv[3], 'utf8');
let fail = 0;
function cnt(s){let i=-1,c=0;while((i=out.indexOf(s,i+1))!==-1)c++;return c;}
function eq(name, actual, expect){const ok=actual===expect;if(!ok)fail++;console.log(`${ok?'PASS':'FAIL'}  ${name}: got=${actual} expect=${expect}`);}
function has(name,s,expectMin=1){const c=cnt(s);const ok=c>=expectMin;if(!ok)fail++;console.log(`${ok?'PASS':'FAIL'}  ${name}: count=${c} (>=${expectMin})`);}

/* 文件头不变（最早插入点在 ~76w/91w，前 5000 必一致） */
const headOk = out.slice(0,5000)===src.slice(0,5000);
if(!headOk)fail++;console.log(`${headOk?'PASS':'FAIL'}  文件头前5000字符与源一致`);
/* 文件尾：末尾 200 字符一致（所有插入均不在 EOF） */
const tailOk = out.slice(-200)===src.slice(-200);
if(!tailOk)fail++;console.log(`${tailOk?'PASS':'FAIL'}  文件尾200字符与源一致`);

console.log('--- A 主题 ---');
eq('XsThemePanel 定义', cnt('function XsThemePanel('),1);
eq('XSTheme API 暴露', cnt('window.XSTheme=api'),1);
eq('XsThemePanel 使用', cnt('o.jsx(XsThemePanel,{})'),1);
has('style#xs-theme-layer', 'xs-theme-layer');
has('MutationObserver 补 body theme-mode', 'theme-mode');

console.log('--- B 设置页 ---');
eq('XsLocalModelCard 定义', cnt('function XsLocalModelCard('),1);
eq('XsHardwareCard 定义', cnt('function XsHardwareCard('),1);
eq('XsNetworkCard 定义', cnt('function XsNetworkCard('),1);
eq('XsCloudProviderCard 定义', cnt('function XsCloudProviderCard('),1);
eq('XsHealthCard 定义', cnt('function XsHealthCard('),1);
['XsLocalModelCard','XsHardwareCard','XsNetworkCard','XsCloudProviderCard','XsHealthCard'].forEach(n=>eq(n+' 使用点',cnt('o.jsx('+n+',{})'),1));
eq('关于页 $_e 定义', cnt('function $_e(){'),1);
eq('Token 页 G_e 定义', cnt('function G_e(){'),1);
has('关于页复用版权 C_e', 'o.jsx(C_e,{})');
has('Token 页调用 usage:recentTokenHistory', 'usage:recentTokenHistory');
eq('遥测默认关闭', cnt('telemetryEnabled:!1'),1);
eq('Qt 已改为仅本地埋点', cnt('function Qt(e,t={}){try{$a('),1);
eq('无带参遥测发送调用 {event,properties}', cnt('"telemetry:capture",{event'),0);
eq('导航 account 项残留', cnt('{key:"account"'),0);
eq('导航 updates 项残留', cnt('{key:"updates"'),0);
has('导航 Token 命名', 'label:"Token"');
has('导航 关于 命名', 'label:"关于"');
eq('旧反馈占位 yq 残留', cnt('o.jsx(yq,{})'),0);
eq('旧积分 noMoreData 残留', cnt('credits.noMoreData'),0);

console.log('--- C 输入框 ---');
eq('XsModelMode 定义', cnt('function XsModelMode('),1);
eq('XsYuyun 定义', cnt('function XsYuyun('),1);
eq('XsModelMode 使用', cnt('o.jsx(XsModelMode,{}),'),1);
eq('XsYuyun 使用', cnt('o.jsx(XsYuyun,{'),1);
eq('语云占位告警残留', cnt('语音识别引擎待接入'),0);
has('语云真实 mixRecorderStart', 'mixRecorderStart');
has('三档 localStorage 键', 'xs:modelMode');
has('三档走已放行通道 xuanshu:model:setMode', 'rt("xuanshu:model:setMode"');
has('三档向后端同步权威模式 getMode', 'rt("xuanshu:model:getMode"');
eq('无裸 setModelMode 调用(白名单/main均无)', cnt('rt("setModelMode"'),0);
has('语云查询 asr:status 引擎状态', 'rt("xuanshu:asr:status"');
has('语云转写放宽首次加载超时(60s)', 'timeoutMs:60000');
has('onText 回填正则正确(/\\s+$/)', 'u.replace(/\\s+$/,"")');

console.log('--- 安全红线 ---');
eq('未引入 npm/import 新依赖(import 语句数不增)', (out.match(/[^a-zA-Z]import\s*\{/g)||[]).length, (src.match(/[^a-zA-Z]import\s*\{/g)||[]).length);

console.log('\n'+(fail===0?'ALL VERIFY PASS':('VERIFY FAIL x'+fail)));
process.exit(fail===0?0:1);
