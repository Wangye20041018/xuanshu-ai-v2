# workbuddy 模型链路与超算剔除 · 盘点与改造方案 v1.0

- 日期：2026-09-03
- 承接方：workbuddy第一阶段删除清理类已完成。请把 E：、玄枢I、玄枢三方AI、给豆包协豆包_UI\_\_v1.2.md剩余可执行部分继续做完；依赖 rae/workbuddy卖弄契约的建设类 I若契约未定稿，先按 §6.1 玻璃主题、§6完2 字体统一、§6.3 首页交互等不依赖契约的部分推进，并在 E整玄枢I、玄枢三方AI、 写 进度同步——豆包。md协作版任务单作
- 项目根：E:\玄枢AI\xuanshu-ai-dev（v12.3.0）
- 状态：**待产品负责人（阿木 / Marvis）拍板后动工**

> 本文是开工前的事实盘点 + 改造方案，非最终交付。施工单（`workbuddy_模型链路与超算剔除_施工单.md`）中的五件事，经完整代码盘点后，其中「超算剔除」一项存在**关键架构事实**需要先行确认，否则会误删本地推理能力。详见 §1。

---

## 0. 一句话结论

施工单五件事里，**「超算」并不是一个可独立删除的功能**，它是 renderer 里给「双模型联动（tandem/dual）」起的 UI 名字；而承载它的 `tandem-manager` 的真实身份是**整个项目的本地模型推理引擎**（spawn llama-server + 健康探测 + MTP 加速 + 自动重启 + queryModel）。直接删除会让本地推理整体塌掉，并与施工单 §3「本地模型加载/卸载重构」直接冲突。

因此推荐策略：**去「超算/联动」概念 + 保留并重构本地推理引擎能力**（详见 §1.3），后续各项在此基础上推进。

---

## 1. 超算剔除盘点（真相）

### 1.1 关键词全量扫描结果

| 关键词                                           | main 侧命中 | renderer 侧命中                               | 结论         |
| --------------------------------------------- | -------- | ------------------------------------------ | ---------- |
| `超算`                                          | 0        | ChatPanel.tsx / Home/index.tsx（仅 UI 文案与注释） | 无独立"超算"模块  |
| `suansuan` / `supercompute` / `super-compute` | 0        | 0                                          | 从未存在过独立命名  |
| `cluster` / `集群`                              | 0        | 0                                          | 无集群/并行计算框架 |

### 1.2 真相：「超算」= 「联动模式（tandem/dual）」

- renderer 的 `ChatPanel.tsx` 第 663/740/752 行有个按钮文案「超算模式」，其 `onClick` 调用 `setTandemMode(tandemMode ? null : 'dual')`。
- `Home/index.tsx` 的「超算模式」分支实际调用的都是 `tandem:status / tandem:get-config / tandem:load-config / tandem:start-server / tandem:chat` 等 **tandem IPC**。
- 即：**"超算" = "联动模式" = "双模型协同"**，没有独立的超算集群功能。

### 1.3 tandem-manager 的真实身份（关键）

`src/main/tandem-manager/index.ts`（34KB）**不是**"超算联动"这种可选功能，而是本地推理引擎核心：

- `startServer()` → spawn `llama-server.exe`，带 `-m / --port / -ngl / -c / --no-kv-offload / -ctk q8_0 / -ctv q8_0 / -fa / --spec-type draft-mtp` 参数；
- 健康探测（轮询 `:port/health`）、180s 启动超时、MTP 失败自动降级重试、运行中异常退出指数退避自动重启（守护）；
- `queryModel()` → 走 `http://127.0.0.1:{port}/v1/completions` 真实推理，取 `usage.completion_tokens` 算 tok/s；
- 多模式 `dualAnswer / partnerAnswer / mentorAnswer / debateAnswer`（这四类才是真正"联动"功能，可删）。

**依赖它的 main 模块（若删会断链）**：

| 模块                                                            | 依赖点                                                                            | 影响               |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------- |
| `scheduler/index.ts`                                          | `startServer/queryModel/stopServer/getServerStates`                            | 本地调度推理核心，删=调度瘫痪  |
| `model-registry/index.ts`                                     | `startServer/stopServer/getServerStates`（restart/runtime-status/health/remove） | 模型重启/健康检查断链      |
| `ipc/chat.ipc.ts`                                             | `ensureLocalProvider()` 复用 `__local_tandem__` 引擎                               | 本地对话 provider 断链 |
| `task-router/index.ts`                                        | 探测 tandem 常驻引擎避免重复加载                                                           | 路由加载策略断链         |
| `inference/visual-reasoning.ts`                               | 视觉推理回退 llama-server 8082                                                       | 视觉链路回退失效         |
| `register/modules.register.ts`                                | 启动时 `loadConfig + startServer`                                                 | 随启动自动加载模型失效      |
| `register/ipc.register.ts`                                    | `setupTandemHandlers` 注册                                                       | IPC 注册           |
| `floating-ball/index.ts`                                      | `floating-ball:tandem-mode`                                                    | 浮球联动状态           |
| `shared/ipc-types.ts` / `config-keys.ts` / `preload/index.ts` | Tandem 类型 / 配置键 / IPC 通道名                                                      | 类型与通道            |

### 1.4 文件域冲突（隔离协议）

「超算按钮 / 联动 UI」在 renderer，按总纲 §2 归**豆包**，workbuddy **禁动**：

- `src/renderer/components/TandemPanel.tsx`
- `src/renderer/components/ModelSwitcher.tsx`
- `src/renderer/pages/Home/ChatPanel.tsx`、`Home/index.tsx`、`Home/messageRender.tsx`
- `src/renderer/pages/Scheduler/index.tsx`、`pages/Model/index.tsx`

### 1.5 推荐策略（需拍板）

**方案 A（推荐）：去概念 + 保能力 + 收编多模式**

1. 将 `tandem-manager` 语义收敛为「本地推理引擎」：删除 `dualAnswer / partnerAnswer / mentorAnswer / debateAnswer` 四种"联动"模式及其 IPC（`tandem:dual-answer/partner-answer/mentor-answer/debate-answer/chat` 的多模式分支）。
2. 保留并重构 `startServer / stopServer / queryModel / getServerStates / check-port / adopt-port` 作为**单一本地推理引擎**，正好作为施工单 §3「加载/卸载重构 + 云端补救」的载体。
3. 清理 main 侧"联动/超算"命名与注释残留；renderer 的「超算按钮/联动 UI」→ 写进「越界申请卡」交豆包删。
4. 删除后 `grep 超算/tandem/联动/dual/partner/mentor/debate` 复查 main 侧 0 残留、tsc 零错、build 通过。

**方案 B：彻底删除 tandem-manager**

- 后果：本地推理能力归零，scheduler/chat/registry 全线断链，与 §3 冲突。**不推荐**，除非产品明确「本地推理整个砍掉、只留云端」。

---

## 2. 模型加载/卸载重构 + 云端补救（§3，与 §1 合流）

现状已核实（与施工单一致）：

- 本地加载：`cpu-engine.ts`（node-llama-cpp，KV q8_0 + flashAttention + budgetContextSize）、`tandem-manager`（llama-server 参数已含 -no-kv-offload -ctk q8_0 -ctv q8_0 -fa）、`runtime/hardware.ts`（6GB 档 65536）。
- 已知问题：qwen2-vl-2b 报 `A context size of 65536 is too large for the available VRAM`；本地"响应超时"未治理。

改造点（在保留的本地推理引擎上做）：

1. **统一入口 `EnsureModelAvailable(task, needVision?)`**：判断能力模型是否就绪。
2. **降级链**：本地就绪→用本地；失败/显存不足→缩窗口/降档重试一次；仍失败→云端补救（文本→deepseek 等，视觉→云端多模态或提示），标注"已切换云端"；云端不可用→报障+恢复建议。
3. **显存预算联动**：加载前 `budgetContextSize` 估算，接入 `migrateToRAM/restoreFromRAM`（cpu-engine 已真实化，需接上调用点）。
4. **卸载策略**：模型切换/空闲超时/显存让位时卸载，卸载前上下文入内存暂挂恢复。

---

## 3. 纯云端链路强化（§4）

现状：

- `llm/provider.ts`（30KB）+ `llm/provider-registry.ts`（2.7KB）+ `local-gpu-provider.ts` 已有 Provider 抽象雏形。
- 施工单要求：多 provider（DeepSeek/Kimi/豆包/自定义 OpenAI 兼容）、模型 CRUD、能力探测、failover、超时重试、流式、上下文预算、并发成本、错误分级、端到端真实发消息实测。

改造点：

1. Provider 抽象扩展：统一 `ModelCapability`（nativeTools/parallelTools/jsonMode/reasoning/vision/maxContext）。
2. 模型注册 CRUD（add/remove/update/list），敏感字段加密存储（复用 `secure/`），唯一性校验。
3. 能力探测：注册/切换时探测，失败给保守默认标注"未探测"。
4. failover：主 provider 失败（鉴权/超时/限流/断网）自动切备选。
5. 超时重试：区分响应超时/任务耗时/流断，心跳续期，退避重试（同目标最多 2 次）。
6. 流式稳定：SSE 透传完整、断流续接、token 统计真实。
7. 上下文预算：按窗口分段送消息（对齐 Trae 的 ModelAdapter 契约）。
8. 端到端实测：用已有 deepseek key 真实发消息验证（key 尾号 0ef2，baseUrl <https://api.deepseek.com/v1）。>

---

## 4. 模型管理 CRUD（§4.1 的一部分，main + IPC 契约）

- 现状：`model-manager/index.ts`（72KB，本地扫描/加载）、`model-registry/index.ts`（本地 GGUF 注册表 CRUD）已存在。
- 需新增：**云端 provider 的模型注册 CRUD**（与本地 registry 区分），字段写死 IPC 契约交豆包。
- 敏感字段（apiKey）加密存储，绝不回显明文。

---

## 5. 浮球语音 main 侧清理（§6.1）

现状（main 侧相关文件）：

- `floating-ball/index.ts`、`floating-ball/voice-ball.ts`（语音球）
- `tts/edge.ts`（Edge TTS）、`tts/piper.ts`（Piper TTS）
- `voice-engine/`（index.ts + cosyvoice-clone + melotts-tts + openvoice-bridge + sensevoice-asr + voice-clone + noise-filter）
- `wake/index.ts`（语音唤醒）

清理范围（main 侧）：

- 语音球 voice-ball + 语音相关 IPC + 语音唤醒 + 两档语音输入 + 独立语音入口/设置项 → 删除，不做降级。
- `grep voice/audio/tts/语音/wake/asr` 清扫；与 Trae（agent 内引用）、豆包（renderer 语音 UI）对账清单。

**注意**：§6.2 要求「内嵌高质量 TTS」作为替代，与 §6.1 删除是配套的——删旧语音 ≠ 删 TTS 能力，而是**换一套高质量离线 TTS**。

---

## 6. 高质量 TTS 选型（§6.2，先调研后内嵌）

现状：`tts/piper.ts`（旧 Piper 音色，施工单要求全删）、`voice-engine/cosyvoice-clone.ts`、`melotts-tts.ts`、`openvoice-bridge.ts` 等已有尝试痕迹。

选型调研方向（开工后第一步做）：

- 候选：CosyVoice 2（阿里，中文自然度第一梯队）、GPT-SoVITS（少样本克隆/情绪）、VITS 系（免费但偏旧）、Kokoro（英文强）。
- 结论：**中文场景优先 CosyVoice 2 / GPT-SoVITS**，最终结论（参考案例链接 + 理由）写入交付说明。
- 落地：下载内嵌模型到 `resources/models/tts/`，本地离线发音，输出真实 wav，提供「播报/生成语音」main 侧工具，UI 归豆包。

---

## 7. 浏览器改造（§6C）

现状：`browser/browser-manager.ts`（18KB）+ `browser/extension-manager.ts` + `browser/index.ts`。

改造点（main 侧）：

1. 搜索结构化链路：搜索接口聚合 + 后台静默抓正文（已有 `search/web-search/search-aggregator`，扩展为结构化输出）。
2. 浏览器引擎重建：窗口/标签/前进后退/刷新/地址栏/书签，好用为标准。
3. 下载管理器：进度/暂停/继续/取消/保存位置/打开/打开文件夹/下载记录（Electron `will-download` + `session`），main 出真实事件，UI 归豆包。

---

## 8. 验收清单（对齐施工单 §7，硬门槛）

- [ ] 超算/联动概念 main 侧 0 残留（grep 复查），本地推理引擎能力保留；tsc 零错；build 通过
- [ ] 加载/卸载降级链实测：故意制造本地加载失败 → 云端补救成功且任务不中断（截图）
- [ ] 云端 DeepSeek 真实发消息打通（截图）；Kimi/豆包注册入口建成
- [ ] 模型增删改查全链路可用（IPC + main 实测）
- [ ] failover / 超时重试 / 流式 / 上下文预算逐项实测
- [ ] 浏览器真实下载一个文件成功（截图 + 落盘路径）；搜索接口返回结果列表可用
- [ ] 高质量 TTS 内嵌 + 真实 wav 样例（交产品负责人试听）
- [ ] 浮球语音 main 模块删除干净
- [ ] 交付：改动文件清单 + diff 摘要 + 验证截图 + 遗留清单

---

## 9. 待产品负责人拍板的事项（阻塞点）

1. **§1.5 方案选择**：超算剔除走「方案 A（去概念+保推理能力）」还是「方案 B（彻底删本地推理）」？推荐 A。
2. **renderer 越界**：超算按钮/联动 UI 属豆包，是否由我写「越界申请卡」，还是产品负责人直接转达豆包？
3. **TTS 选型倾向**：中文优先 CosyVoice 2 还是 GPT-SoVITS？还是授权我按调研结论自选？
4. **云端 key**：真实发消息实测用的 deepseek key 是否已存在项目配置中可复用？

> 拍板后我按 §8 优先级顺序动工：§1+§2（合流）→ §3/§4 → §5 → §7 → §6，每步交验、不攒尾。
