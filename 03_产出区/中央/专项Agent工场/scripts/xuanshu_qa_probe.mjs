#!/usr/bin/env node
/**
 * 玄枢AI · 自动回归验证探针 (QA Probe)
 * 用途：每次代码改造 / 成果落地后必跑，把"改造没改崩、该在的都在"固化成硬断言。
 * 定位：所有专项开发 Agent 的必经闸门，替代"靠肉眼截图猜"的伪验证。
 *
 * 用法：node xuanshu_qa_probe.mjs
 * 退出码：0=全 PASS；1=有 FAIL（供 CI/自动化判停）
 */
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

// ---------- 配置区：随施工区迁移时只改这里 ----------
const TARGET = {
  bundle: 'E:/玄枢AI/玄枢终代/02_源码/app/dist/assets/index-D5I3iBTS.js',
  main:   'E:/玄枢AI/玄枢终代/02_源码/app/dist-electron/main/index.js',
  preload:'E:/玄枢AI/玄枢终代/02_源码/app/dist-electron/preload/index.js',
};

// 必在串（must-have）：每一项 = [文件key, 说明, 内容片段]
const MUST = [
  // ---- 输入框修复（中央，2026-09-06）----
  ['bundle', '输入框-网关断开仍可输入', 'disabled:!1'],
  ['bundle', '输入框-左分组(附件/语云)', 'flex shrink-0 items-center gap-1.5'],
  // ---- 豆包 ABC + 后端落实（2026-09-06 夜）----
  ['bundle', '豆包-主题引擎面板', 'XsThemePanel'],
  ['bundle', '豆包-模型三档', 'XsModelMode'],
  ['bundle', '豆包-语音转写(语云)', 'XsYuyun'],
  ['bundle', '豆包-token用量页', 'currency'] ,
  ['main',   '后端-推理complete',    'xuanshu:inference:complete'],
  ['main',   '后端-模型三档setMode', 'xuanshu:model:setMode'],
  ['main',   '后端-模型档位getMode', 'xuanshu:model:getMode'],
  ['main',   '后端-语音转写transcribe', 'xuanshu:asr:transcribe'],
  ['main',   '后端-记忆列表',        'xuanshu:memory:list'],
  ['main',   '后端-持久化agent',     'xuanshu:agent:setFromChat'],
  ['preload','白名单-inference',     'xuanshu:inference:complete'],
  ['preload','白名单-setMode',       'xuanshu:model:setMode'],
  ['preload','白名单-asr',           'xuanshu:asr:transcribe'],
  // ---- 分层玄玻璃主题引擎（中央，2026-09-07）----
  ['bundle', '玄玻璃-侧栏玻璃',        'aside[data-testid=sidebar]'],
  ['bundle', '玄玻璃-浮层强玻璃',      '.semi-popover-content,html[data-xs-mode] .semi-tooltip-wrapper'],
  ['bundle', '玄玻璃-hairline高光',   'inset 0 1px 0 '],
  ['bundle', '玄玻璃-大圆角',         'max(14px,'],
  ['bundle', '玄玻璃-玄色环境',        '#0b0d16'],
];

// 必无串（must-not-have）：选填，删除残留/占位/裸接口（务必用能唯一命中的锚点，防误报）
const MUST_NOT = [
  ['bundle', '残留:裸setModelMode', 'setModelMode('],
  ['main',   '残留:占位转写', 'asr:transcribe 占位'],
];

// ---------- 断言引擎 ----------
const cache = {};
function load(key) {
  if (cache[key] === undefined) {
    cache[key] = existsSync(TARGET[key]) ? readFileSync(TARGET[key], 'utf8') : null;
  }
  return cache[key];
}
function sha256(text) { return createHash('sha256').update(text).digest('hex'); }

let pass = 0, fail = 0;
const results = [];
for (const k of Object.keys(TARGET)) {
  results.push([`[文件] ${k}`, load(k) ? '在' : '缺失']);
}
for (const [k, desc, frag] of MUST) {
  const hit = load(k) && load(k).includes(frag);
  hit ? pass++ : fail++;
  results.push([`MUST  ${desc}`, hit ? 'PASS' : 'FAIL  ↳ 缺: ' + frag.slice(0, 40)]);
}
for (const [k, desc, frag] of MUST_NOT) {
  const hit = load(k) && load(k).includes(frag);
  hit ? (fail++, results.push([`非显  ${desc}`, 'FAIL  ↳ 残留: ' + frag.slice(0, 40)]))
      : (pass++, results.push([`非显  ${desc}`, 'PASS']));
}

// ---------- 输出 ----------
const COL = 118;
console.log('='.repeat(COL));
console.log('玄枢AI 自动回归验证 (QA Probe)');
for (const k of Object.keys(TARGET)) {
  console.log(`  ${k} => ${TARGET[k]}`);
  if (load(k)) console.log(`      sha256 ${sha256(load(k))}`);
}
console.log('-'.repeat(COL));
for (const [name, ok] of results) {
  const pad = name.padEnd(52, ' ');
  const flag = ok.includes('PASS') ? '\x1b[32mPASS\x1b[0m' : (ok.includes('FAIL') ? '\x1b[31mFAIL\x1b[0m' : ok);
  console.log(`  ${pad} ${flag}`);
}
console.log('-'.repeat(COL));
console.log(`  结果: ${pass} PASS / ${fail} FAIL`);
console.log('='.repeat(COL));
process.exit(fail > 0 ? 1 : 0);
