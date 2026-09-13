const fs=require("fs");
const s=fs.readFileSync(process.argv[2],"utf8");
try{ new Function(s); console.log("FUNCTION SYNTAX OK"); }
catch(e){ console.log("ERR:",e.message); const m=String(e.stack).split("\n").slice(0,4).join("\n"); console.log(m); }
