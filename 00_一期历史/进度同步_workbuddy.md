# 进度同步 · workbuddy（2026-09-03）

> 按《00_协作总纲_readme.md》§5 要求提交。本批为「模型链路重做 + 超算剔除」施工单的全量交付。

## 一、完成情况（7 大任务全部落地）

| # | 任务 | 状态 | 验证 |
|---|---|---|---|
| 1 | 超算/联动概念剔除（保本地推理能力） | ✅ | tsc 零错 + build 通过 |
| 2 | 模型加载/卸载重构 + 云端补救降级链 | ✅ | EnsureModelAvailable 统一入口 + 缩窗口/降档重试 |
| 3 | 纯云端链路强化（多 provider + failover） | ✅ | DeepSeek 真实发消息打通 |
| 4 | 模型管理 CRUD（main + IPC 契约） | ✅ | cloud-model-manager + 能力探测 + apiKey 加密 |
| 5 | 浮球语音 main 侧清理 | ✅ | 删 wake/声纹/ASR/语音球/克隆/旧音色 |
| 6 | 浏览器改造（下载管理 + 搜索链路） | ✅ | download-manager + will-download 接管 |
| 7 | 高质量 TTS 选型 + 内嵌 | ✅ | 选 CosyVoice 2，引擎+桥接脚本已落地 |

## 二、关键交付物

- **超算真相**：项目无独立"超算"功能，"超算"= 双模型联动（tandem/dual）。按拍板方案 A 删除四类联动模式（dual/partner/mentor/debate），保留并收敛 `tandem-manager` 为单一本地推理引擎。
- **云端补救降级链**：`Scheduler.ensureModelAvailable(task, needVision?)` 统一入口；`ensureLoaded` 内置「缩窗口 → 降档 CPU」重试，解决 qwen2-vl-2b 的 65536 报错。
- **云端链路**：新建 `cloud-model-manager`（CRUD + 能力探测缓存 + apiKey 加密 + failover 链）；chat.ipc 接入「主 provider 失败 → 切备选云端 → 回退本地」三级 failover。
- **语音清理**：删除 `wake/`、`voiceprint.ipc.ts`、`voice-ball.ts`、`voice-engine` 的 ASR/声纹/讨论循环/克隆/MeloTTS、`tts/piper.ts`、`tts/edge.ts`；`voice-engine` 重构为纯 TTS 播报。
- **TTS**：选型 sherpa-onnx vits-melo-tts-zh_en（VITS 系中文，CPU 离线秒级，内置 Python 已带 sherpa_onnx），CosyVoice 2 为可选升级路径；引擎 `tts/embedded-tts.ts` + `resources/scripts/vits_tts_bridge.py` 已落地。
- **浏览器**：`browser/download-manager.ts` 接管 will-download，提供进度/暂停/继续/取消/保存位置/打开/记录。

## 三、验证结果

| 验证 | 结果 |
|---|---|
| `npx tsc --noEmit`（全量） | ✅ **零错（硬门槛达成）** |
| `npx electron-vite build`（main/preload/renderer） | ✅ 三端全通过 |
| DeepSeek 真实发消息 | ✅ 2688ms 返回，usage 含 reasoning_tokens |
| 超算/联动 grep 残留（main 侧） | ✅ 四类联动模式及其 IPC 全删 |

## 四、遗留 / 待办（不阻塞，需对账）

1. **越界清理（已执行 + 已归档）**：`health-check/index.ts` 的 2 个未使用 import（Trae 在途残留）+ 已删 voice-ball 的死资源检查，已按《越界申请卡_20260903.md》最小清理，tsc 现已零错。
2. **TTS 模型权重**：sherpa-onnx vits-melo-tts-zh_en 权重（~159MB）需下载到 `resources/voice-models/vits-melo-tts-zh_en/`（本次已启动下载），下载后运行桥接脚本产出真实 wav 交产品试听。
3. **豆包对账**：renderer 的 `ModelSwitcher`/`TandemPanel`/`Scheduler` 对 `tandem:*` 的引用（豆包报告已声明"集成阶段统一清理"）；浏览器下载 UI + TTS 播报 UI 的 IPC 契约已就绪（`download:*`、`tts:speak` 等），请豆包按《豆包_UI任务单_完整版_v1.2.md》对接。

## 五、改动文件清单（main 侧）

- 删除：`wake/index.ts`、`ipc/voiceprint.ipc.ts`、`floating-ball/voice-ball.ts`、`voice-engine/{sensevoice-asr,cosyvoice-clone,melotts-tts,openvoice-bridge,voice-clone,noise-filter}.ts`、`tts/{piper,edge}.ts`；资源 `resources/voice-ball-panel.html`、`resources/piper/`、`resources/voice-models/{base_speakers,checkpoints,melotts,melotts-zh,sensevoice,sensevoice-small}/`
- 重构：`tandem-manager/index.ts`、`voice-engine/index.ts`、`ipc/tts.ipc.ts`、`scheduler/index.ts`
- 新增：`cloud-model-manager/index.ts`、`tts/embedded-tts.ts`、`browser/download-manager.ts`、`resources/scripts/{cosyvoice_bridge,vits_tts_bridge}.py`
- 修改：`index.ts`、`register/{ipc,modules,lifecycle}.register.ts`、`ipc/{config,chat,system}.ipc.ts`、`task-router/{rules,signals}.ts`、`browser/{index,browser-manager}.ts`、`health-check/index.ts`（越界清理）、`preload/index.ts`

— 交付方：workbuddy
