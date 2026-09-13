const { spawn } = require("child_process");
const PY = String.raw`E:\玄枢AI\xuanshu-ai-dev\resources\python\python.exe`;
const DAEMON = String.raw`E:\玄枢AI\xuanshu-ai-dev\resources\python\asr_daemon.py`;
const WAV = process.argv[2];
const WAV2 = process.argv[3] || WAV;
const t0 = Date.now();
const p = spawn(PY, [DAEMON], { stdio: ["pipe", "pipe", "pipe"] });
let buf = "";
let sent2 = false;
function send(o){ p.stdin.write(JSON.stringify(o) + "\n"); }
p.stdout.setEncoding("utf8");
p.stdout.on("data", d => {
  buf += d;
  let i;
  while ((i = buf.indexOf("\n")) >= 0) {
    const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
    if (!line) continue;
    const at = ((Date.now() - t0) / 1000).toFixed(2);
    console.log(`[+${at}s]`, line);
    try {
      const m = JSON.parse(line);
      if (m.type === "ready") { send({ id: "1", wav: WAV }); }
      if (m.type === "result" && m.id === "1") {
        if (!sent2) { sent2 = true; const ts = Date.now(); send({ id: "2", wav: WAV2 }); console.log("   第二条请求已在首条返回后立即发出"); }
      }
      if (m.type === "result" && m.id === "2") { send({ type: "quit" }); }
    } catch (e) {}
  }
});
p.stderr.setEncoding("utf8");
p.stderr.on("data", d => console.log("[stderr]", d.trim()));
p.on("close", c => { console.log("daemon exit", c); process.exit(0); });
setTimeout(() => { try { p.kill(); } catch (e) {} process.exit(1); }, 120000);
