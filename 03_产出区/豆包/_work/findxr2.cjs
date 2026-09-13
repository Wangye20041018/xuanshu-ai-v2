const fs=require("fs");const s=fs.readFileSync(process.argv[2],"utf8");
const re=/(function Xr|[;,{\s]Xr\s*=)/g;let m,n=0;while((m=re.exec(s))&&n<10){n++;console.log("@"+m.index+"  …"+s.slice(Math.max(0,m.index-70),m.index+140).replace(/\s+/g," ")+"\n");}
