const fs = require("fs"), vm = require("vm"), path = require("path");
const helpers = fs.readFileSync(path.join(__dirname,"main_helpers.txt"),"utf8");

function makeCtx(){
  const config = {
    models: { providers: {
      "local-qwen": { models:[{id:"qwen3.5-9b"}] },
      "token-cloud": { models:[{id:"asr-flash"}] },
      "herdsman":   { models:[{id:"cloud-x"}] },
    }},
    agents: { defaults: { model: { primary:"token-cloud/asr-flash", fallbacks:[] } } },
  };
  let lastDraft = null, lastFile = null;
  const sandbox = {
    require: require, console: console, setTimeout: setTimeout, clearTimeout: clearTimeout, Date: Date, Object: Object, Array: Array, JSON: JSON, Number: Number, String: String,
    _xs_state: "ready",
    _xsLog(){},
    _xsReadLocalConfig(){ return { model:"qwen3.5-9b" }; },
    async _xsEnsure(){ return true; },
    async Zr(){ return JSON.parse(JSON.stringify(config)); },
    async bs(c){ lastFile = JSON.parse(JSON.stringify(c)); },
    Xr(){ return { async mutateAndWait(fn){ const d = JSON.parse(JSON.stringify(config)); fn(d); lastDraft = d;
      // 模拟写回 config
      config.agents.defaults.model = d.agents.defaults.model; } }; },
  };
  vm.createContext(sandbox);
  vm.runInContext(helpers, sandbox);
  return {
    sandbox,
    draft(){ return lastDraft; },
    file(){ return lastFile; },
    config,
  };
}

(async()=>{
  let fail=0;
  function chk(name, cond, extra){ console.log((cond?"PASS":"FAIL")+"  "+name+(extra?"  "+extra:"")); if(!cond)fail++; }

  // AUTO：当前云端选择应被记住为 cloudRef；primary=本地，fallback=云端
  let t = makeCtx();
  let r = await t.sandbox._xsApplyMode("auto");
  chk("auto ok", r.ok===true);
  chk("auto primary=本地", r.primary==="local-qwen/qwen3.5-9b", JSON.stringify(r));
  chk("auto fallback=原云端", (r.fallbacks||[])[0]==="token-cloud/asr-flash", JSON.stringify(r.fallbacks));
  chk("auto 已热写配置", t.draft().agents.defaults.model.primary==="local-qwen/qwen3.5-9b");

  // LOCAL：只走本地，无 fallback
  t = makeCtx();
  r = await t.sandbox._xsApplyMode("local");
  chk("local primary=本地", r.primary==="local-qwen/qwen3.5-9b");
  chk("local 无 fallback", (r.fallbacks||[]).length===0);

  // CLOUD：主用云端，fallback 里不含本地
  t = makeCtx();
  await t.sandbox._xsApplyMode("auto");           // 先切走，制造 cloudRef
  r = await t.sandbox._xsApplyMode("cloud");
  chk("cloud primary=云端", r.primary==="token-cloud/asr-flash", JSON.stringify(r));
  chk("cloud fallback 不含本地", !(r.fallbacks||[]).some(x=>String(x).startsWith("local-qwen/")));

  // 非法值归一 auto
  t = makeCtx();
  r = await t.sandbox._xsApplyMode("weird");
  chk("非法值归一 auto", r.mode==="auto");

  console.log(fail===0 ? "\nMODE LOGIC ALL PASS" : "\n*** "+fail+" FAILED ***");
  process.exit(fail?1:0);
})();
