---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: 3c24a5e3a352f921a82f7d3a39c85647_e2f677a0a79e11f199d2525400287e28
    ReservedCode1: 8Ad1NEWhATaJKbJ0EX2Dno5X2mrXWqUnvcJZ/52o8Tt9co1UivZ9jjx/xCjfNuLWrTlnREzPiKsCb89uYDRebdamfroSJQUNaKbrm93UuArsMJJAcyZLeQBFvLfSxDGqJHKIEOJWYkELTteSf2++t2KXjVQz+JtjgspAfPbRmrzNF4Ds2MoNEE0eJJE=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: 3c24a5e3a352f921a82f7d3a39c85647_e2f677a0a79e11f199d2525400287e28
    ReservedCode2: 8Ad1NEWhATaJKbJ0EX2Dno5X2mrXWqUnvcJZ/52o8Tt9co1UivZ9jjx/xCjfNuLWrTlnREzPiKsCb89uYDRebdamfroSJQUNaKbrm93UuArsMJJAcyZLeQBFvLfSxDGqJHKIEOJWYkELTteSf2++t2KXjVQz+JtjgspAfPbRmrzNF4Ds2MoNEE0eJJE=
---



# 玄枢AI · 智能体重构施工蓝本 · v1.1（Trae 版）

> 版本差异说明（相对 v1.0）：①智能体清单重构为 **20 个**；②新增 **AI 总调度（Meta-Conductor）** 域——玄枢做大脑统管网卡上各 AI 软件协作开发；③独立"软件操控"功能取消，能力并入 agent 工具；④语音相关全部删除（页面/浮球/唤醒/两档输入），本地 TTS/ASR 降级为可选工具；⑤设置页遗留与功能页重合项全删；⑥设置页自检/自愈功能强化到极致；⑦**积分约束**：你仅剩约 600 积分，本文档已标注 P0/P1，按 P0 优先攻坚，剩余积分内尽量推进 P1。

- 项目根：E:\玄枢AI\xuanshu-ai-dev（v12.3.0，Electron32 + electron-vite2.3 + React18 + TS5.7 + Tailwind4 + Zustand5）
- 硬件基线：RTX3060 Laptop 6GB + Ryzen7 5800H + 32GB RAM
- 你的文件域：src/main 中 agent 系统相关 + src/shared；**禁动 src/renderer**（豆包负责），越界先申请。
- 验收：见 §16；零假显示铁律：做到什么都要真实落地可验证。

---

## 0. 施工契约

1. 目标一句话：把玄枢智能体重做为本土血统、能力极限、**双端通吃**（本地 9B 小模型够用够快 / 云端万亿模型能力全开）的系统。
2. 铁律：真实功能零假显示；机器验收（tsc 零错 + build 通过 + 运行时实测 + 落盘）；不留半成品（严禁"声称完成零落盘"，历史前科必查）。
3. 本文档契约名（ModelCapability / ToolDef / ToolCall / AgentManifest）与 renderer 侧豆包脑电波对齐，不得二义。
4. 已整改的上下文成果为冻结项（见 §15），只许在其上扩展，禁止回退式重写；上下文相关 main 归 workbuddy 与你的公共契约也要对齐（见 00_协作总纲_readme.md）。

## 1. 现状盘点（先核对再动刀）

### 已存在
| 模块 | 现状 | 判定 |
|---|---|---|
| agent-core/react-loop.ts | 真 ReAct + 真推理接入 | 保留骨架，强化（原生FC/self-verify/结果分离） |
| agent-core/orchestrator.ts | AI 分解 + 拓扑排序 + 串并行 | 保留骨架，强化（路由/冲突/聚合/总调度挂点） |
| toolRegistry | 工具注册 + onToolCall→真实动作闭环 | 保留并统一协议（地基勿拆） |
| vectorStore 记忆 | RAG 真实但 namespace 未过滤 | 重写记忆层（§9） |
| 预置智能体 | 工具面过窄 | 全部重做（§5） |

### 必改半接线
1. 记忆 namespace 隔离缺失 → 补（§9）。
2. 工具调用靠解析 JSON 文本 → 原生 function calling 优先 + 降级链（§4.3）。
3. 默认工具过窄 → 按 §5 二十智能体全量重配。

## 2. 玄枢定位
- 本地算力终端，非拟人聊天；删第六感/感应/情感。
- 操控电脑第一优先；纯本地可用、隐私优先、无后端。
- **总调度大脑**：玄枢负责调度本机各 AI 软件协作开发（§5.9 / §12）。
- 能力极限双端通吃（§4）；自我演进（§13）；零假显示；安全分级（§14）。

## 3. 总体架构
（沿用 v1.0 五层图，新增一层"调度层"）
```
       调度层 Meta-Conductor：玄枢=大脑，统管本机各AI软件（Trae/豆包/workbuddy/其他）
   Agent层：20 智能体（单核 ReactLoop / 编排 Orc / 元核 SelfEvo）
   Capability 能力域 → 统一走 Tool Registry（权限分级）
   记忆系统（L0~L4，namespace 隔离）
   Model Adapter 路由（本地9B ↔ 云端万亿，能力探测+三阶降级+并行工具）
   推理后端：cpu-engine / llama-server / 各 cloud provider
```
不变量：能力域只经 ToolRegistry 与 kernel 通信；一切模型调用必经 Model Adapter；副作用动作带 permissionLevel 走闸门；Agent 状态机统一 planned→running→awaitingTool→verifying→finished|failed|cancelled。

## 4. 模型适配层 Model Adapter（最核心，先做）
——与 workbuddy 的模型链路（§workbuddy单）衔接：本地模型加载/显存/卸载归 workbuddy；你在其上做"能力探测 + 调用协议"，二者通过 provider/capability 契约协作。

### 4.1 ModelCapability
```typescript
interface ModelCapability {
  modelId: string; tier: 'local'|'cloud'; scale: 'small'|'medium'|'large'|'giant';
  maxContextTokens: number; nativeTools: boolean; parallelTools: boolean;
  reasoning: boolean; jsonMode: boolean; vision: boolean; stream: boolean;
  costHint: 'free'|'cheap'|'pricey';
}
```
### 4.2 能力探测
启动/切换模型时探测并缓存，可被用户覆盖；探测失败须有保守默认 + 标注"未探测"。探测数据来自 workbuddy 的模型注册表。

### 4.3 工具调用三阶降级链（不变量）
```
① 原生 function calling（nativeTools）：标准 tools + tool_choice
② JSON 工具协议：SYS 附 ToolSchema，强制单条 JSON {"tool_call":{name,arguments}}，校验+重试1
③ ReAct 文本：Thought/Action/ActionInput 正则解析，失败反馈重试
铁律：三路归一封进 ToolCall 结构，进同一 Registry。
本地9B：走①或②，工具描述极简（token吝啬）；云端万亿：必走①，启用并行工具调用。
```
### 4.4 万亿级云端专项
并行工具调用（一次 N 个 tool_call，内核批量执行按 callId 回注）；超长上下文窗口分段管理；jsonMode 结构化输出；reasoning 型模型思考段不污染正文（抽 final_content）；流式节流与超时心跳（区分"响应超时"与"任务耗时"，根治玄枢假失败）。

### 4.5 本地小模型专项
token 吝啬协议（工具描述≤一句+必填参数，去冗长示例）；窗口按 budgetContextSize 动态；原生工具面收窄为任务必需子集（降选择噪声）；3B 快模型可选做路由/分类。

### 4.6 统一契约
```typescript
interface ToolCall { toolName: string; args: Record<string,unknown>; callId: string; }
interface ToolResult { callId: string; ok: boolean; data?: unknown; text?: string; error?: string; truncated?: boolean; }
```
### 4.7 工具结果压缩回注
超长截断 + 结构化摘要优先；结果过大时工具分页。

## 5. 智能体清单（20 个 · 全量重做，数量在此定死，不增不减）
> 编排：每个智能体 = AgentManifest（角色壳+工具集+边界+默认模型档），纯数据可热加载；本地模式默认最小工具集、云端全开。
> **软件操控不再单设功能/页面**：app 启动/关闭/交互全部由系统操控 agent 的工具承担（§8 工具含 app-open/app-install 等）。

### 核心域（8 个）
1. **系统指挥官** SystemCommander —— Windows 全面操控：文件/目录/进程/服务/系统信息/网络诊断/磁盘/窗口/输入/安装卸载/诊断修复。≥25 工具。
2. **文件总管** FileMaster —— 搜索（名/内容/类型/时间）、批量整理归类、去重、格式化转换、压缩解压。删除走闸门。
3. **开发工程师** DevEngineer —— 读/写/重构/调试/构建/测试全流程；小步改→验证→交付；多语言（TS/React/Electron/Python/Shell）。≥12 工具。
4. **质量门 QA** —— 代码审查、死功能/假显示巡检、tsc/build/test 执行与报告、diff 复核。
5. **安全审计官** SecAuditor —— 本机安全基线：端口/服务/启动项/防火墙/补丁/弱口令配置审计 + 加固建议（防御导向）。
6. **取证分析员** Forensics —— 事件日志、持久化痕迹、进程画像、威胁匹配、审计报告；授权渗透（见 §10 红线）。
7. **文档理解师** DocMaster —— PDF/Word/Excel/PPT/代码/日志/图片/音视频理解问答总结、OCR、格式转换。
8. **记忆管家** Memorist —— 记忆写入/检索/晋级/清理、身份与人设管理、跨会话认知。

### 编排与自动化域（4 个）
9. **自动化编排师** Automator —— 多步工作流（条件/循环/重试/串并行）、脚本生成（ps/py/bat）、定时任务。
10. **调度管家** Scheduler —— 计划任务/周期任务管理（对接现有 schedule，可增删改查与状态监控）。
11. **研究员** Researcher ——（可选联网）搜索/抓取/多源交叉/综述表格化；来源标注；登录墙提示介入。
12. **AI 总指挥** MetaConductor（**新增 · 玄枢做总调度**）—— 见 §5.9 与 §12。

### 高阶域（3 个）
13. **元进化者** SelfEvolver —— 自我改造（§13）：读自身代码→diff 预览→确认→应用→验证→回滚。
14. **安全守卫** Guardian —— 横切安全：danger 动作确认、受保护路径拦截、审计、一键冻结危险工具（见 §14）。
15. **自检修复官** SelfHealer —— 系统自检 + 自我修复（与设置页"自检"联动，见 §7）：健康体检、自动修复、白屏/崩溃自愈、报告生成（main 侧引擎归你）。

### 内容与辅助域（3 个）
16. **内容创作师** Writer —— 文档/文案/脚本/方案撰写、润色、翻译；高质量结构化输出。
17. **数据分析师** Analyst —— 数据整理/统计/可视化建议/表格化结论（可调脚本与图表工具）。
18. **翻译官** Translator —— 多语互译、技术文档双语对齐（上下文敏感，术语一致）。

### 扩展域（2 个）
19. **模板工厂** AgentMaker —— 无代码自建智能体（manifest 生成/校验/加载）。
20. **工具工匠** ToolSmith —— 工具定义热加载/扩展/测试（为能力边界开放二次开发）。

（注：语音不设智能体——语音相关全删；TTS/ASR 降级为可选工具，见 §6b。）

## 6. 删除与清理项（你在哪些文件域动手）
a. **语音全删**：浮球语音（main/floating-ball voice-ball 等）、语音唤醒、两档语音输入、语音相关 IPC 与设置入口。main 侧删除归 workbuddy 的浮球与模型相关、以及你这边触碰到的 agent 内部引用需同步清；renderer 侧 UI 由豆包删。**你把 agent 侧对语音的依赖清干净（grep voice/audio/tts 引用核查）。**
b. **声音能力（新口径）**：语音功能入口全部删除（见 a，语音球/唤醒/两档输入/独立入口一概不留）；但玄枢"会说话"能力保留并升级——**高质量 TTS 由 workbuddy 内嵌一个新模型/声音资源（对标豆包，不做降级，详见 workbuddy 施工单 §6.2）**。你在 agent 侧按需调用该高质量 TTS 工具即可，不设独立语音智能体/入口；TTS/ASR 调用契约字段以 workbuddy 文档为准。浏览器/搜索底座（好用+可下载）也由 workbuddy 重建（§6C），你的 Researcher 智能体与浏览器工具依赖它，只消费工具、不重建引擎。
c. **设置页去重（agent 相关部分）**：设置页遗留的、与功能页能力重合的 agent/能力相关设置项，列出清单删掉；renderer 部分豆包处理，main 侧逻辑你清理。
> 你负责的目标：agent 系统内部无任何语音/重复设置的残留引用，tsc 零错。

## 7. 设置页自检/自愈（main 侧引擎，交给你）—— 要做强、极致强大
- **自检引擎**（main，你实现；UI 归豆包）：一键健康体检，覆盖：模型服务健康度（响应超时检测）、推理后端（llama-server/cpu-engine）、上下文系统（ContextStats 真实推送）、显存/内存/磁盘占用、GPU 驱动、网络连通、依赖（运行库/Node 模块/onnxruntime 等）、关键文件完整性、构建产物、危险功能开关状态。
- **输出**：分级报告（健康/告警/故障）+ 排查建议 + 预估耗时。
- **自我修复**（每项修复带权限与确认、全部留审计）：
  1. 模型响应超时：检测→重启推理后端/降级云端补救→自测通过。
  2. 白屏/启动异常：检测 dev 进程与端口→自动重启→验证页面可达（复刻之前白屏修复链路自动化）。
  3. 配置损坏：检测→从备份/默认回滚→重启。
  4. 依赖缺失：检测→提示并自动执行修复命令（如重装运行库/缺失 Node 包）。
  5. 上下文/显存异常：检测→KV 暂挂重载/清缓存→释放→自测。
  6. 危险功能异常条目自动隔离并报告。
- **定时巡检**：可配置周期体检；异常自动触发修复或上报。
- 修复动作一律可验证（先测后修、修后再测）；高危修复默认需用户确认（见 §14）。

## 8. 工具注册中心（Tool Registry 强化）
schema（沿用 v1.0）：
```typescript
interface ToolDef {
  name: string; description: string; parameters: JSONSchema;
  permissionLevel: 'read'|'act'|'danger';
  sideEffect: 'none'|'mutate'|'irreversible';
  localExclusive?: boolean; cloudAllowed?: boolean; minContext?: number;
}
```
工具弹药库（只多不少，Trae 必须按此补齐）：见 v1.0 §8.2 全清单（文件/执行/系统/窗口桌面/软件/开发/网安/文档/记忆/自动化/联网/自我改造/元/自检）。新增：**AI 软件控制工具**（§12 总调度用：ai-apps-list / ai-apps-launch / ai-apps-send-task / ai-apps-collect-result / ai-apps-register）。

## 9. 记忆系统
- 五层：L0 身份 / L1 工作上下文 / L2 会话 / L3 长期 RAG（namespace 隔离）/ L4 技能库。
- 必修：vectorStore.search 加 namespace 参数（session / agent:<id> / global）；写入时机（会话结束/关键节点主动写 L3/L4）；检索评分（语义+时间衰减+可信度）；晋级机制（高价值片段自动 L2→L3）。
- 记忆预算：L3 命中超窗按评分截断。

## 10. 网安能力边界（红线硬编码）
- 审计模式：只读发现→报告→加固建议；变更类走 danger。
- authorized-scanner：强制 target+授权记录双参数，全程 audit-log。
- **禁止实现**：免杀生成、蠕虫/勒索载荷、对第三方系统爆破/翻墙/钓鱼分发。系统层硬拒绝并提示"不在玄枢能力范围"。

## 11. 开发/电脑控制实现要点（沿用 v1.0 §11/§12）
工程闭环、巨型任务分阶段、主动发现死功能；Windows 能力统一 computer-control 域工具，批量操作预览确认，界面失败自动截图+视觉诊断重试（接本地 VL）。

## 12. AI 总调度（Meta-Conductor · 玄枢当大脑）—— 本轮重点新增
目标：玄枢成为总调度，指挥本机各 AI 软件（Trae/豆包/workbuddy/ComfyUI/Ollama 等）协同完成开发/任务。
- **AI 应用注册表**：登记本机 AI 软件（名称/类型/能力说明/交互方式 CLI|HTTP|文件域|剪贴板/文件域边界/可用性/版本）。
- **任务派发**：把任务按"文件域隔离 + 各自擅长"路由给对应 AI 软件（如：改 main 逻辑→Trae；改 renderer→豆包；模型链路→workbuddy；绘图→ComfyUI）。
- **结果回收与质检**：收回产物做 diff/tsc/build/落盘核对，不合格打回（复刻 Marvis 验收思路）。
- **冲突控制**：登记"谁占了哪个文件域"，防多 AI 同文件打架。
- **可复用调度流程**：确定任务→选择 AI→派发→回收→质检→汇总。全程日志与状态可见。
- 与 20 智能体的关系：MetaConductor 是"对外调度"智能体；内部 19 个是"对内能力"智能体。二者共用 ToolRegistry。

## 13. 自我改造 Self-Evolver
流程（不可绕过）：self-diff 读自身→生成 diff→用户确认→应用（自动快照）→self-verify（tsc零错+build+冒烟）→self-log→失败→回滚。禁止静默改码；不得触碰安全闸门自身。

## 14. 安全分级（横切）
read 自动 / act 会话确认 / danger 每次强制确认（展示对象与数量）；受保护路径只读；凭据不进日志；danger 全审计+一键冻结开关；批量操作先试运行报告；网安红线见 §10。

## 15. 上下文衔接（冻结项）
联动已整改成果：ContextStats 真实推送驱动窗口预算、KV 量化 q8_0 + flash-attn + budgetContextSize、KV 暂挂/恢复（模型切换不丢任务进度）、记忆注入上限截断、云端超长窗口分段。

## 16. 验收标准（Trae 硬门槛）
工程：tsc 零错 / build 通过 / 落盘清单+diff / 无假显示。
能力（**本地 9B + 云端万亿双轨实测**）：
- 系统操控 5 连击（查IP→列进程→起notepad→截图→关）
- 开发：读→写→tsc→运行小工具并验证产物
- 网安：本机 baseline 审计 + 可执行加固清单（只读）
- 文档：搜索→总结→转换全链路
- 记忆：写→重启→检索命中且 namespace 不串
- 自动化：生成计划任务并验证被调度
- 自检修复：故意制造一次白屏/超时→自愈链路恢复并出报告
- 总调度：登记≥1 个外部 AI 应用→派发一个真实小任务→回收质检成功
- 自我改造：最小无害示例走通 diff→确认→应用→tsc 通过→回滚
- 三阶降级：云端走原生FC（并行多工具）/ 模拟无FC走JSON / 最差ReAct 仍完成简单任务 / reasoning 思考段不污染正文
安全：danger 全确认+审计 / 受保护路径拦截 / 未授权扫描被拒

## 17. 积分约束与优先级（重要）
- 你仅剩约 600 积分（昨日已消费 600）。**严格执行 P0 优先**，避免积分耗尽。
- **P0（必做，先攻坚）**：§4 ModelAdapter 全链路 + §6 清理（语音依赖清干净）+ §7 自检修复引擎 + §3 架构落地 + §16 核心验收。
- **P1（积分有余再做）**：20 智能体全量细配、§12 总调度完整落地、§9 记忆全体系、§13 自我改造。
- 每一阶段完成立即交验，勿攒到最后；若积分不足，明示"P1 未完成项 + 落地路径"，不交空壳。

## 18. 里程碑
M1 地基（ModelAdapter 全链路 + 上下衔接）→ M2 内核（单核强化 + ToolRegistry 统一 + 权限闸门）→ M3 自检修复引擎 + 清理 → M4 能力域全量（20 智能体 + 总调度 + 记忆 + 自我改造）。

## 19. 附：与 workbuddy / 豆包的协作
- workbuddy 提供：模型注册表、provider 能力、加载/卸载/云端补救、显存预算接口、**浏览器/搜索底座 + 下载管理 + 高质量 TTS**。你消费这些接口；变更加载策略前先看 workbuddy 施工单，避免同文件冲突。
- 豆包消费你：ToolCall/ToolResult、AgentManifest、ContextStats、自检报告、总调度状态的 IPC 契约。你在 main 侧把契约写死、字段明确；UI 由豆包做。
- 浏览器/搜索/声音的 main 侧实现全部归 workbuddy（§6B/6C），你只消费工具、不重建引擎；相关字段一律以 workbuddy 施工单和豆包完整版任务单为准。
- 每方只有**一份完整任务文档**（你=本文件、workbuddy=施工单、豆包=`给豆包\豆包_UI任务单_完整版_v1.2.md`）；任何外层"补充卡"说明，一律以最新版完整文档为准。
- 冲突锁定规则见 00_协作总纲_readme.md。

— 验收方：Marvis / 阿木（产品负责人）
*（内容由AI生成，仅供参考）*
*（内容由AI生成，仅供参考）*
