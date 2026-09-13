---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: 3c24a5e3a352f921a82f7d3a39c85647_e5606f0ea79e11f1ac80525400aeaaa3
    ReservedCode1: aMlhqwp2tWbUGI1v2rn/N1qGqn+NIBO0rUKYaJVn8/zxtiRxlhbLUaPyxS1LFWOI1iHtZpT+BjQVV2djJk4rWwatdW+sIvGfjte+Bp1LCi+CGX1lvvrlK9dbXzyOFC+tKfpSSw8JNeROfO5gqg4EADjqJSUqslQ2ZVTzDNf1qWSJFhH4tZ/fmrki8pg=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: 3c24a5e3a352f921a82f7d3a39c85647_e5606f0ea79e11f1ac80525400aeaaa3
    ReservedCode2: aMlhqwp2tWbUGI1v2rn/N1qGqn+NIBO0rUKYaJVn8/zxtiRxlhbLUaPyxS1LFWOI1iHtZpT+BjQVV2djJk4rWwatdW+sIvGfjte+Bp1LCi+CGX1lvvrlK9dbXzyOFC+tKfpSSw8JNeROfO5gqg4EADjqJSUqslQ2ZVTzDNf1qWSJFhH4tZ/fmrki8pg=
---



# 玄枢AI · 模型链路重做 + 超算剔除 · 施工单（workbuddy 版）

- 日期：2026-09-03
- 项目根：E:\玄枢AI\xuanshu-ai-dev（v12.3.0；Electron32 + electron-vite2.3 + React18 + Zustand5）
- 硬件：RTX3060 Laptop 6GB + Ryzen7 5800H + 32GB RAM
- **你的文件域**：src/main 中与 模型管理 / 推理后端 / 云端 provider / 超算相关 的文件 + 相关 src/shared；**禁动 src/renderer**（豆包），禁动 agent 系统本身（Trae）。越界先申请（见 00_协作总纲_readme.md）。
- 验收：tsc 零错 + build 通过 + 运行时实测（含真实云端发消息）+ 落盘。零假显示铁律。

---

## 1. 任务总览（五件事）

1. **超算部分精准剔除**：把玄枢现有"超算"相关功能完整去掉（先盘点清单 → 删除 → grep 清残留 → tsc 零错）。
2. **模型加载/卸载任务重新设计，云端补救**：本地模型加载失败/显存不足时自动降级到云端模型，保证任务不中断；加载/卸载职责理清。
3. **纯云端链路理清强化，要有质的飞跃**：多 provider 接入、模型注册/删除/编辑、能力探测、失败切换、超时重试、流式——端到端真实打通并实测（含已有 deepseek key 的真实发消息验证）。
4. **浏览器改造（好用 + 可下载）**：见 §6C——搜索结构化链路 + 浏览器引擎重建 + 下载管理，好用为第一标准。
5. **高质量声音重构**：见 §6.2——删光现有音色、不做降级，内嵌一个高质量 TTS（对标豆包），先做高评分案例选型调研。

## 2. 超算剔除（先盘点后动刀）

### 2.1 盘点
- 全项目 grep "超算" 相关关键词（suansuan / supercompute / super-compute / cluster / 超算 / 集群 等），列出：
  - 功能入口（页面/菜单/设置项）、IPC 通道、main 逻辑、数据/配置文件、依赖引入。
- 判定：功能是否独立、是否有其它模块依赖；明确"删除清单"与"保留边界"。

### 2.2 删除要求
- 完整移除，不允许留"注释掉的尸体"零散残留；关联的 IPC、类型、配置项同步清理。
- 删除后 `grep` 复查 0 残留引用；`npx tsc --noEmit` 零错；`npm run build` 通过。
- 若"超算"实际承担了任务队列/并行计算能力，删除前确认这些能力归口到哪（通常并入 agent 调度，见 Trae 文档），不留能力空洞。

## 3. 模型加载/卸载重构 + 云端补救

### 3.1 现状（先核查核实）
- 本地加载链路：cpu-engine（loadModel/createContext、KV q8_0 + flashAttention + budgetContextSize 已整改）、tandem-manager（llama-server 参数含 -no-kv-offload -ctk q8_0 -ctv q8_0 -fa）、runtime/hardware.ts（6GB 档 65536 已定）。
- 已知问题：qwen2-vl-2b 加载报 "A context size of 65536 is too large for the available VRAM" 未妥善处理；本地模型"响应超时"现象未治理。

### 3.2 加载/卸载云端补救机制
- **统一入口**：`EnsureModelAvailable(task, needVision?)`：判断当前任务所需能力的模型是否就绪。
- **降级链**：
  1. 本地模型就绪且显存足够 → 用本地。
  2. 本地模型加载失败 / 显存不足（如 VL 与 9B 共挤 6GB）→ 自动缩窗口/降档重试一次。
  3. 仍失败 → **云端补救**：自动切换该任务的模型 tier 到云端对应能力模型（文本→deepseek 等；视觉→云端多模态或提示用户），任务不中断，并向用户标注"已切换云端"。
  4. 云端不可用 → 明确报障 + 给恢复建议（重启后端/释放显存）。
- **显存预算联动**：加载前用 budgetContextSize 估算；切换/暂挂复用 KV 暂挂恢复机制（migrateToRAM/restoreFromRAM 已真实化，把调用点接上：模型切换/显存让位场景）。
- **卸载策略**：模型切换、空闲超时、显存让位时可卸载；卸载前会话上下文入内存暂挂，恢复无感续聊。

## 4. 纯云端链路强化（质的飞跃）

### 4.1 Provider 抽象（统一模型管理 · 增删改查）
- 多 provider 支持：DeepSeek（已有 key 尾号 0ef2，baseUrl https://api.deepseek.com/v1）/ Kimi(Moonshot) / 豆包(Volcengine) / 任意 OpenAI 兼容自定义。
- **模型注册 add**：base_url + model_id + api_key 三项必填（复用现有"添加 API"思路），服务端校验唯一性/密钥/配额；敏感字段加密存储绝不回显明文。
- **模型删除 remove**：删除时校验无活动会话占用，给出确认与影响提示。
- **模型编辑 update**：可改展示名/地址/能力标记（如是否原生FC/是否多模态/是否 reasoning）。
- **列表/详情 list**：含活跃状态、能力探测结果缓存、最近一次可用性。
- **能力探测**：注册/切换时探测 ModelCapability（nativeTools/parallelTools/jsonMode/reasoning/vision/maxContext），失败给保守默认并标注"未探测"。
- UI 归豆包（renderer）；你提供 main + IPC 契约（字段写死）。

### 4.2 链路强化点（每项都要真实增强，不是改配置）
1. **失败切换 failover**：主 provider 请求失败（鉴权/超时/限流/断网）→ 自动切备选 provider，任务不中断，标注降级路径。
2. **超时与重试治理**：区分"响应超时/任务耗时/流断"三类错误；心跳续期；重试退避策略（同目标最多 2 次，杜绝盲目重试）。
3. **流式稳定**：SSE 流式透传完整、断流自动续接、token 统计真实。
4. **上下文预算**：云端按窗口预算分段送消息（与 Trae 的 ModelAdapter 契约对齐：同 ModelCapability / ToolCall / ToolResult）。
5. **并发与成本**：低价模型允许并发，高价默认单路+缓存（costHint）。
6. **端到端实测**：用已有 deepseek key 真实发一话验证链路闭环（此前未打通，属遗留欠账，必须补上并截图留证）；Kimi/豆包用户已充值但玄枢未配置——提供注册入口即可，添加后同样实测。
7. **云端视觉/多模态**：云端支持视觉的任务（如图片理解/验证截图）走云端多模态模型；本地无 VL 时不硬卡死。
8. **错误分级与日志**：可读错误给模型/用户反馈；全程日志、不含明文 key。

## 5. 与 Trae 的分工接口（务必对齐，避免同一文件双改）

| 契约 | 你（workbuddy）提供 | Trae 消费 |
|---|---|---|
| 模型注册表 | CRUD + 能力探测缓存 | ModelCapability 读取 |
| 推理接入 | loadModel/ensureAvailable/云端补救/显存预算 | ModelAdapter 调用协议 |
| 上下文 | KV 暂挂恢复、budgetContextSize（已整改冻结项） | 窗口预算决策 |
| 工具调用 | —— | 三阶降级链（归 Trae） |

- 同文件冲突：先在 00_协作总纲_readme.md 的规则下声明"冲突锁定"，你动推理/模型相关文件，Trae 动 agent 相关，交集以"你已经动的为准"，先完成方交付后另一方才接手相关扇区。
- **禁动**：agent-core/*、toolRegistry 逻辑、orchestrator、context-window 的 buildContext（冻结项）、renderer 全部。

### 5B. 与豆包的配合（契约单向流动）
- **你提供、豆包消费**：模型管理 CRUD IPC、能力探测、浏览器引擎+下载管理事件、高质量 TTS"生成语音/播报"接口——UI 全部由豆包做（renderer），你只出 main 侧真实数据/事件，禁止假状态、禁止字段二义。
- **对账**：你删 main 侧语音功能（§6.1）时，豆包同步删 renderer 语音 UI，三侧 grep 清单互相对一遍；浏览器/下载/声音契约字段以你为准。
- 豆包唯一完整任务单：`给豆包\豆包_UI任务单_完整版_v1.2.md`；你写完 main 契约后让她读对应章节。

## 6. 浮球/语音相关 main 侧清理 + 高质量声音重构（归你）

### 6.1 语音功能删除
- main/floating-ball 下的语音球（voice-ball 等）与语音相关 IPC：完整删除（renderer UI 豆包删，main 侧你删）。
- 语音唤醒、两档语音输入、独立语音入口/设置项（main 侧）全部删除，**不做降级替代**。
- 删除后 grep voice/audio/tts/语音 清扫；tsc 零错；与 Trae 的 agent 引用清理对账（Trae 清 agent 内引用，你清 main 模块，交付时互相对一下清单）。

### 6.2 高质量声音重构（新 · 对标豆包，不做降级）
- **现有音色全部删除**（旧 Piper 音色等一个不留），**不做降级方案、不桥接在线语音服务**。
- **直接内嵌一套高质量 TTS**：下载并内嵌"对应的高质量 TTS 模型/声音资源"到本地项目资源目录（如 models/ 下），**哪怕只有一个声音也足够，但声音质量必须高**。
- 质量目标：对标豆包/主流高分 TTS 音色的自然度、流畅度与情绪层次。
- **先做技术选型调研**：参考网上评分高、口碑好的成功案例（如 GPT-SoVITS、CosyVoice、VITS 系或其它免费高质量方案），对比后选型再动手；选型结论（参考案例链接 + 理由）写进交付说明。
- 落地形态：本地离线可发音，输出真实音频文件/流；为 agent 提供"播报/生成语音"main 侧工具。UI 归豆包（契约字段见豆包补充卡第 2 批）。
- 验收：产出真实发音样例（wav）交产品负责人试听；不得用低质音色凑数、不得标"已完成"实际未内嵌。

### 6C. 浏览器改造（好用 + 可下载）（新）
- 目标：玄枢内置浏览器不再"难用的小窗"——**好用、非常好用，且能下载东西**。
- **搜索结构化链路**：主进程提供"搜索接口聚合 + 后台静默抓正文"，供 Trae 研究员智能体与搜索功能使用——用户先看到结果列表/摘要，不强制弹浏览器；仅需登录/强 JS/用户主动浏览时才拉起浏览器窗口。
- **浏览器体验要求（好用为标准）**：
  1. 窗口尺寸合理、可全屏；标签页/前进后退/刷新/地址栏/书签顺手可用。
  2. **下载能力（硬性要求）**：网页中触发下载 → 玄枢下载器接管：可下载文件、显示进度、暂停/继续/取消、可设保存位置、完成后可"打开/打开所在文件夹"、下载记录可查（UI 由豆包按契约实现，main 侧你出真实事件）。
  3. 页面加载有进度指示；加载失败给友好错误页，不是白屏；常见文件类型可正常显示/下载。
- 归属：main 侧（browser-manager 引擎重建 + 下载管理模块 + 相关 IPC）归你；renderer 浏览/下载 UI 归豆包。
- 验收：真实在网页里下载一个文件成功（截图 + 落盘位置）；搜索接口返回结果列表可用。

## 7. 验收清单（硬门槛）
- [ ] 超算相关 0 残留（grep 复查）；tsc 零错；build 通过
- [ ] 浏览器真实下载一个文件成功（截图 + 落盘路径）；搜索接口返回结果列表可用
- [ ] 高质量 TTS 已内嵌并产出真实发音样例（wav 交产品负责人试听验收）
- [ ] 加载/卸载降级链实测：故意制造本地加载失败 → 云端补救成功且任务不中断（截图）
- [ ] 云端 DeepSeek 真实发消息打通（截图留证）；Kimi/豆包注册入口建成
- [ ] 模型增删改查全链路可用（UI 归豆包，你有 IPC+main 实测）
- [ ] failover/超时重试/流式/上下文预算逐项实测
- [ ] 浮球语音 UI 相关 main 模块删除干净，TTS/ASR 降级为可选工具
- [ ] 交付：改动文件清单 + diff 摘要 + 验证截图 + 遗留清单

## 8. 优先级
超算剔除 → 云端补救降级链 → 平台链路强化 → 模型管理 CRUD → 浮球清理。每步交验，勿攒尾。

— 验收方：Marvis / 阿木（产品负责人）
*（内容由AI生成，仅供参考）*
*（内容由AI生成，仅供参考）*
