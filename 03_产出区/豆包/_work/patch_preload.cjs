/* 豆包·preload 最小放行：补 asr:mixRecorderPause/Resume/Stop（main 均已有 ipcMain.handle，仅白名单漏登）
 * 幂等 + 唯一命中断言；先备份到 _work/baseline，不覆盖已有备份。 */
const fs = require('fs');
const path = require('path');
const target = process.argv[2];
const raw = fs.readFileSync(target, 'utf8');
const FIND = '"asr:mixRecorderStart","asr:readAudio"';
const REPL = '"asr:mixRecorderStart","asr:mixRecorderPause","asr:mixRecorderResume","asr:mixRecorderStop","asr:readAudio"';
function count(s,sub){let i=-1,c=0;while((s.indexOf(sub,i+1))!==-1){i=s.indexOf(sub,i+1);c++;}return c;}
if (raw.includes('"asr:mixRecorderStop"')) { console.log('ALREADY PATCHED: asr:mixRecorderStop 已在白名单，跳过。'); process.exit(0); }
const c = count(raw, FIND);
if (c !== 1) { console.error('ABORT: 锚点命中 '+c+' 次（应为1），未写出。'); process.exit(1); }
const bakDir = path.join(__dirname, 'baseline');
const bak = path.join(bakDir, 'preload_index.bak.js');
if (!fs.existsSync(bak)) fs.writeFileSync(bak, raw, 'utf8'), console.log('备份原 preload ->', bak);
const out = raw.replace(FIND, REPL);
fs.writeFileSync(target, out, 'utf8');
console.log('已写入，新增白名单：asr:mixRecorderPause / Resume / Stop；字节', raw.length, '->', out.length, '(+'+(out.length-raw.length)+')');
// 复核四个 asr 通道现在都在
['asr:mixRecorderStart','asr:mixRecorderPause','asr:mixRecorderResume','asr:mixRecorderStop','asr:readAudio'].forEach(ch=>{
  console.log((out.includes('"'+ch+'"')?'PASS ':'FAIL ')+ch);
});
