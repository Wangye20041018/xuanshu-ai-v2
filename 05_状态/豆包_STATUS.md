# 豆包状态（首席 UI 工程师）

- 当前阶段：**A/B/C 三块已全部编码完成并通过自检，待中央/老板验收**（2026-09-06）
- 施工方式：只改前端唯一生产 bundle `app/dist/assets/index-D5I3iBTS.js`，定位式补丁（唯一字符串锚点 + 强制 count=1 + 幂等），不改 main/preload/css/package.json，不增依赖，不另起构建链。
- 期间中央多次再合并施工区 bundle（连接页 W3、preload 白名单扩充等，与本三块零重叠），均已重建基线、用唯一锚点重新命中，最终在最新基线上一次成型，净 +35,819 字符（2,443,820 → 2,479,639）。"放行"后已做 preload×main×前端三方对齐。
- **【最新·后端已落实，真实可用，2026-09-06 深夜】** 应用户要求打通后端：
  1. main 三档 `xuanshu:model:setMode` 升级为真实改写默认模型路由（primary/fallbacks，热更新+文件兜底+持久化），新增 getMode；
  2. main `asr:transcribe/status` 由 WorkBuddy 骨架替换为真实实现：常驻便携 Python + sherpa-onnx Paraformer 中文离线模型（已内置 216.8MB 模型），真机转写首次约13s、其后0.2s/条；新增 asr_daemon.py、增强 asr_bridge.py；
  3. preload 补 getMode；前端 XsModelMode/XsYuyun 对齐真实契约，四份 bundle 统一为最新全量（2,621,726 字节）；
  4. 校验：main `node --check`+32 项断言、preload `node --check`、前端 verify 全 PASS+标识符校验、三档路由单测、daemon/bridge 双路径真机转写均通过。详见 `03_产出区/豆包/后端落实/后端落实与部署说明.md`。

## 模块完成度
| 模块 | 内容 | 状态 | 验证 |
|---|---|---|---|
| A 主题引擎 | XSTheme 运行时（glass/flat/image、调色、磨砂、Canvas 本地取色、双皮肤通道、body theme-mode 跟随、持久化双写+兜底）+ XsThemePanel 外观面板 | 完成 | snippet 配平/new Function、A-only `node --check`、锚点唯一 |
| B 设置页 | 掐 Qt 上报网络段+默认关遥测；积分页 G_e→Token 用量页（前端聚合）；S_e 后追加本地推理/硬件/网络/云端四卡；E_e 顶部安全健康卡；导航删 account/updates、credits→Token、feedback→关于；反馈页 $_e→关于页 | 完成 | 5 snippet 语法校验、AB `node --check`、旧占位/导航残留=0 |
| C 输入框 | R$e 前插 XsModelMode（本地/云端/自动，真实尝试切换+本地推理状态点）；语云占位按钮→XsYuyun（asr_api 真实录音，转写通道缺失即诚实降级，不造假） | 完成 | 2 snippet 语法校验、ABC `node --check`、占位残留=0 |

## 统一自检（最终产物）
- `node --check`（.mjs ESM 解析）：通过。
- `verify.cjs` 40 项集成断言：**ALL VERIFY PASS**（文件头/尾不变、9 个新组件定义与使用各 1、上报/旧积分/旧反馈/旧导航/语云占位残留为 0、三档只走已放行的 xuanshu:model:setMode 且无裸 setModelMode、onText 正则正确、import 依赖数不增）；preload 与最终 bundle 均 `node --check` 通过。
- `check_idents.cjs`：新组件引用的全部顶层别名（o/x/se/Ce/rt/tt/F0/B0/HD/Fe/xa、图标 nF/rn/JL/C6/rd/n1、store Zr/Hn、版权 C_e）均存在，无 ReferenceError 风险。

## 产物路径（03_产出区\豆包\）
- `最终交付\dist\assets\index-D5I3iBTS.js`（ABC 全量，= 输入框目录同源，**主交付，直接整体替换**）+ `CHANGES_豆包_ABC总览.md`
- `主题引擎\`（A-only 完整 bundle + CHANGES）、`设置页\`（AB 累计 + CHANGES）、`输入框\`（ABC + CHANGES），供按模块审查/回溯。
- `_work\`：patch.cjs（补丁器）、patches.def.cjs（补丁定义）、snippets\（9 个源片段）、verify/bal3/fncheck/anchors/brace 等工具，可在中央再次打包后幂等重放。

## IPC 放行现状（"放行"后已三方核对，详见 06_意见墙\豆包_preload补放行清单_20260906.md）
- **已全链路可用**（preload 已放行 + main 有 handler）：xuanshu:inference 五通道、asr mixRecorder Start/Pause/Resume/Stop/readAudio。豆包的 preload 最小补丁检测到中央已同步放行后幂等跳过，未重复写入。
- **仅余 main 待实现 2 项**（前端调用点与降级已就绪，不阻塞验收）：
  1. `xuanshu:model:setMode` 的 main handler（三档本地/云端/自动联动；偏好已 localStorage 持久化，前端已删除必失败的裸 setModelMode）。
  2. 语音转写 `xuanshu:asr:transcribe`（语云已能真实录音并落盘，补此 handler + preload 登记后松开即出文字，前端无需再改）。
- 一致性建议（非阻塞）：`xuanshu:inference:stop` 在 main 用 ipcMain.on（非 handle），前端已不依赖其返回；建议中央统一为 handle。

## 红线遵守
未碰模型/密钥/.git/厂商 token；未向 token-cloud、herdsman 发流量；Semi 风格；无假按钮；未破坏首页第一批已验收成果与 WorkBuddy W1–W4；所有未放行 IPC 一律安全封装降级。

## 验收记录（中央填写）
| 交付 | 时间 | 中央验收 | 返工项 |
|---|---|---|---|
| A 主题引擎（A-only bundle） | 2026-09-06 | | |
| B 设置页（AB bundle） | 2026-09-06 | | |
| C 输入框 + ABC 最终全量 bundle | 2026-09-06 | | |
