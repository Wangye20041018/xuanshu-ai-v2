const fs=require("fs");const s=fs.readFileSync(process.argv[2],"utf8");
const re=/Xr\s*=/g;let m,n=0;while((m=re.exec(s))&&n<8){n++;console.log("@"+m.index+"  …"+s.slice(Math.max(0,m.index-60),m.index+120).replace(/\s+/g," "));}
