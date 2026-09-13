# 豆包交付 · FlowyAIPC v5.2.1 前端二次开发（A 主题 / B 设置页 / C 输入框）

> 角色：豆包（首席 UI 工程师） ｜ 形态：压缩生产产物定点补丁 ｜ 日期：2026-09-06
> 前端只改 `app/dist/assets/index-D5I3iBTS.js`，不新增 npm 依赖、不另起构建链。

## ★ 后端落实（2026-09-06 深夜，已做到真实可用）
应要求把前端留的调用点在主进程/离线资源层全部打通，**详见同仓 `03_产出区/豆包/后端落实/后端落实与部署说明.md`**：
1. **三档模型来源真实切换**：main 的 `xuanshu:model:setMode` 由"只起停引擎"升级为真正改写网关默认模型路由 `agents.defaults.model.primary/fallbacks`（local=仅本地 local-qwen / cloud=回云端 / auto=本地优先云端兜底），运行时热更新并持久化；新增 `getMode` 回读。
2. **语云真实离线转写**：main 的 `xuanshu:asr:transcribe` 由"未安装骨架"替换为常驻便携 Python + sherpa-onnx **Paraformer 中文模型**（已内置 216.8MB int8 模型，不依赖外部目录、不联网）；真机验证首次加载约 13s、之后每条 0.2~0.3s 出文字。新增 `asr_daemon.py`、增强 `asr_bridge.py`、`asr:status` 真实探测。
3. preload 补 `getMode` 白名单；前端 XsModelMode/XsYuyun 已对齐真实返回与首次加载耗时。
4. 本轮 main/preload/python/模型的改动清单、验证证据、回滚备份均在「后端落实」目录。

## 一、如何安装（傻瓜三步）
1. 关闭正在运行的 App。
2. 进入安装（或解包）目录 `app/dist/assets/`，把原 `index-D5I3iBTS.js` 改名备份为 `index-D5I3iBTS.js.bak`。
3. 把本目录 `dist/assets/index-D5I3iBTS.js` 复制过去覆盖，重新启动 App 即可。
   - 本文件已包含中央 / WorkBuddy 在此之前合并进施工区的全部内容，属于"当前最新基线 + 豆包 A/B/C"的完整产物，可直接整体替换。
   - 若之后中央又重新打包导致 hash 文件名变化，**不要直接套旧文件**，让豆包用 `_work/patch.cjs` 在新 bundle 上重新施加（锚点全部为唯一字符串，幂等）。

## 二、三块改动一览

### A 全局主题引擎（可调色磨砂玻璃 + Canvas 取色）
- 新增运行时 `window.XSTheme`（就近注入，IIFE 自启）：
  - 三种模式 `glass / flat / image`；可调主色、辅色、模糊半径、面板不透明度、色调浓度、色彩饱和、圆角。
  - 8 个预设色板 + 自定义取色器/十六进制输入，rAF 节流实时预览；`localStorage["xs:theme"]` 持久化，并双写 `settings:setMany({xsTheme})`，启动时 `settings:getAll` 读回（主进程若过滤该键则自动以 localStorage 兜底）。
  - **Canvas 纯本地图片取色**：选图后缩放到 ≤256px、提取主色/辅色并生成氛围背景，图片不上传。
  - 同时驱动两套皮肤：覆盖 shadcn HSL 通道（`--primary/--ring/--card…`）与 Semi 的 `--semi-blue-0..9` RGB 通道及 primary/link/focus 语义；用 MutationObserver 跟随 `html.light/dark`，**顺手补设 `body[theme-mode]`**，根治 Semi 暗色"花脸"。
  - 毛玻璃只加给静态卡片/弹层容器（`.bg-white.rounded-2xl / .bg-card.rounded-2xl / .bg-panel / .semi-modal-content` 等），**消息流不做 blur**，避免掉帧。
- 设置 → 通用 → 外观卡之后新增「主题引擎 · 磨砂玻璃与取色」面板 `XsThemePanel`。

### B 设置页全套重构
- **删除匿名上报**：`Qt()` 的网络上传段（动态 import → invokeApi("telemetry:capture")）整段移除，仅保留 `$a('product.x')` 本地埋点；默认 `telemetryEnabled:!0 → !1`。（遥测端点识别器 `g9` 与网关通道白名单中的同名字符串属于防护/清单，按原样保留。）
- **外观面板**：即 A 的 XsThemePanel（外观卡之后）。
- **积分 → Token**：原积分页 `G_e` 整体替换为 Token 用量页：调用已放行的 `usage:recentTokenHistory`，前端按 provider 分本地/云端，聚合今日 / 近 7 日 / 累计与本地占比，明细表倒序展示；删除原 buyPlan / 厂商定价套餐跳转。导航项 `credits` 改名 **Token**。
- **模型-网关扩展**：高级卡之后平级追加四张卡——
  - 本地推理：轮询 `xuanshu:inference:status`（兼容 `state==="ready"` 与旧 `ready===true` 两种返回）、启动/停止、`dialog:open` 选 GGUF 后 `setModel`、上下文长度 `setContext`；
  - 本机硬件：真实读取 CPU 逻辑线程、`navigator.deviceMemory`、WebGL 显卡名；
  - 网络与本地后端：`navigator.onLine` 在线状态 + 本地后端 state/port + 重启（复用 `Hn()` store）；
  - 云端提供方：`provider:list` 只显示每个提供方"是否已配置"布尔，**不读取/不上传任何密钥内容**。
- **安全健康检查**：安全页顶部新增 `XsHealthCard`，一键巡检遥测、本地后端、运行环境、本地推理通道、云端提供方数量，拿不到的如实标"未接入/待放行"，不造假。
- **删账户 / 删更新入口**：导航数组删除 `account`、`updates` 两项（对应 switch case 保留为不可达死代码，零风险）。
- **反馈 → 关于**：原反馈页 `$_e` 整体替换为关于页（复用 about.* 三语文案与版权组件 `C_e`）：版本/平台/Chromium、打开数据目录、本地优先与隐私说明；导航 `feedback` 改名 **关于**。

### C 首页输入框
- **三按钮位 → 模型来源三档**：在原模型/专家下拉 `R$e` 左侧新增紧凑分段控件 `XsModelMode`：**本地 / 云端 / 自动**，偏好存 `localStorage["xs:modelMode"]`，切换时真实尝试 `setModelMode` / `xuanshu:model:setMode`（未放行则静默降级，偏好本地保留），并以小圆点实时指示本地推理是否就绪。原复杂模型下拉 `R$e` **不重写**，@ agent picker 保留。
- **语云语音输入做实**：把原"按住说话→弹'引擎待接入'告警"的占位按钮替换为真实录音组件 `XsYuyun`：
  - 按住调用 `window.asr_api.mixRecorderStart({onRecvData})` **真实采集**，显示录音秒数与音频块计数，松开 `controls.stop()`；
  - 随后尝试转写通道 `xuanshu:asr:transcribe`，拿到文字自动追加回填输入框（`onText`，沿用 composer 的 `f/u/v`）；
  - 转写通道当前未在 preload 放行时，**明确提示"已完成真实录音、转写通道待中央补登记"，不编造任何文字、不做假按钮**。

## 三、验证方式与结果
- `node --check`（复制为 .mjs 走 ESM 解析）：**通过**。
- 自研 `verify.cjs` 集成断言 **38 项全部 PASS**：文件头/尾与基线一致、9 个新组件"定义 1 处 + 使用 1 处"、占位与旧积分/旧反馈残留为 0、无带参遥测发送、导航项删除、onText 正则正确、import 依赖数不增。
- `check_idents.cjs` 核验新组件引用的全部顶层别名（o/x/se/Ce/rt/tt/F0/B0/HD/Fe/xa 与图标 nF/rn/JL/C6/rd/n1、store Zr/Hn、版权 C_e）均真实存在，无运行时 ReferenceError 风险。
- 每个 snippet 入库前均经括号配平（`bal3.cjs`）与 `new Function`（`fncheck.cjs`）双重语法校验。
- 补丁器 `patch.cjs` 对每个锚点强制"唯一命中"，找不到/不唯一即中止且不写出，始终从干净基线幂等施加。

## 四、IPC 放行现状（"放行"后已三方核对，详见 06_意见墙 同名清单）
- **preload 白名单已就位、main 也有 handler、现已全链路可用**：`xuanshu:inference:status/start/stop/setModel/setContext`、语云 `asr:mixRecorderStart/Pause/Resume/Stop/readAudio`。
- 前端已与真实通道对齐：三档只调 `xuanshu:model:setMode`（删除了必失败的裸 `setModelMode`）；因 `inference:stop` 在 main 是 `ipcMain.on`（不回 Promise），前端改为只发送 + 延时/轮询刷新，不挂起。
- **仍待 main 实现**（preload 放了也暂无 handler，前端继续诚实降级、不造假）：
  1. `xuanshu:model:setMode` 的 main handler——实现后三档本地/云端/自动即真正联动（偏好已本地持久化）。
  2. 语音转写 `xuanshu:asr:transcribe`——语云现已能真实录音并落盘（显示时长/块数/路径），补此 handler 并在 preload 登记后，松开即自动转文字回填，前端无需再改。
- Token 页用已放行的 `usage:recentTokenHistory` 前端聚合，不依赖 getUsageStats。

## 五、净增量
相对施加时的最新施工区基线，字符数 2,443,820 → 2,479,639（净 **+35,819** 字符；其中删除上报段/旧积分页/导航项等为负向，新增组件为正向）。未触碰任何模型、密钥、.git、厂商 token 与云端上报。另对 preload 仅做"补登 3 个 ASR 通道白名单"的最小改动（检测到中央已同步放行后幂等跳过，零重复写入），未改 main、未改其它 preload 逻辑。
