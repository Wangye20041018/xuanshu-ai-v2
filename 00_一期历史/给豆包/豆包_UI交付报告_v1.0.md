# 豆包 · UI 改造交付报告 v1.0

> 对应《豆包_UI任务单_完整版_v1.2》§1 文件域（`src/renderer` 全部 UI）首批可立即执行的「删除与清理类」已全部落地。
> 建设类（§3-5 智能体系统 / 模型管理 / 自检 UI）按契约依赖，待 Trae / workbuddy main 契约定稿后于集成阶段对账。

---

## 一、已交付（删除与清理类，tsc + build 双验证通过）

### 1. 语音 UI 全量下架（§2-①）
| 项 | 动作 |
|---|---|
| Voice 独立页 | `pages/Voice/index.tsx`、`pages/Voice/VoiceCloneTab.tsx` 已移出（备份在 `temp/renderer_backup_20260903/`） |
| 路由 | App.tsx 移除 `/voice` 路由与懒加载 |
| 侧栏入口 | Sidebar.tsx 移除「语音」导航项（含 Mic 图标） |
| 顶栏标题 | TitleBar.tsx 移除 `'/voice': '语音'` |
| 首页语音输入 | Home/index.tsx 移除 `isRecording`、`voiceContinuousMode`、本地 ASR（`recognitionRef`/`asrRingRef`/`localAsr*`/`voiceprintBufferRef` 等）、`startRecording`/`stopRecording`/`stopLocalAsr`、语音命令动态导入 |
| 输入栏语音控件 | ChatPanel.tsx 移除麦克风按钮与「单次/持续」两档切换 |
| 语音相关设置 | Settings 移除「语音唤醒」「声纹与降噪」两个标签页 + 全部相关状态/处理器/IPC 调用；删除 `SettingsVoiceWake.tsx`、`SettingsVoiceprint.tsx` |
| 语音球/悬浮球设置 | Settings 移除「悬浮球」标签页（回复音色/唤醒方式/开机启动等），即 §2 所述浮球 UI 设置入口 |
| 孤儿文件 | `utils/voice-commands.ts`、`shared/voicePresets.ts` 已移出（无任何引用） |
| 孤儿 i18n | 移除 `input.voice` 键（其余孤儿语音翻译串无组件引用，未逐个清理） |

### 2. 智能体编排入口移除（§2-②）
- ChatPanel.tsx 移除首页输入栏 `<AgentRunner />`（首页任务调用链入口）及其 import。
- `pages/Home/AgentRunner.tsx` 保留文件但已无入口引用（供 Trae 复用其内部子组件）。
- **注意**：Agents 页「智能编排 Auto-Orchestrator」tab 属 Trae 契约域，未擅自移除，待其 main 契约对账（见下）。

### 3. 超算（tandem）renderer 侧 UI 移除
- Home/index.tsx 移除 `tandemMode` 状态、`floating-ball:tandem-mode` 同步、handleSend 内超算启动/对话整段分支、`tandem:status`/`tandem:chat`/`tandem:get-config`/`tandem:load-config`/`tandem:start-server` 调用。
- ChatPanel.tsx 移除「超算」圆形按钮与联动占位文案。
- **保留**：历史消息中的联动结果渲染（`TandemResultCard`，纯展示不调 IPC），旧对话记录仍可正常显示。
- **遗留（非本批范围）**：`ModelSwitcher`、`TandemPanel`、`Scheduler` 对 `tandem:*` 的引用属 workbuddy 超算剔除契约域，待其 main 侧落地后由集成阶段统一清理（避免与并行改动冲突）。

### 4. 设置重合项清理（§2-③）
- Settings 移除与已删功能重合的「语音唤醒」「声纹」「悬浮球」入口，标签组由 12 → 9 个。

---

## 二、保留项（符合 §8 声音控制边界）

- **逐条朗读（轻量 TTS 控件）**：消息气泡朗读按钮、`handleSpeakMessage`、暂停/继续/停止、`speakMsgRef` 自动朗读均保留。
- **GlobalTtsPlayer**（App.tsx 内联组件）：监听 `tts:speak/stop/pause/resume` 的主动播报播放器保留——「玄枢会说话」能力不删。

---

## 三、验证结果

| 验证 | 结果 |
|---|---|
| `tsc --noEmit`（renderer 域） | ✅ 零错误（全量 tsc 输出中无任何 `src/renderer` 报错） |
| `electron-vite build` | ✅ 成功（main/preload/renderer 三 bundle，renderer 2018 模块） |
| 死引用排查 | ✅ `pages/Voice`、`SettingsVoice*`、`voicePresets`、`voice-commands`、`AgentRunner` 全仓 grep 0 命中 |
| 输入栏结构 | ✅ 文本静态复核：textarea + 联网搜索 + 发送（停止），无残留占位 |

> ⚠️ 并行注意：全量 `tsc` 当前存在 `src/main/agent/model-adapter.ts` 报错（Trae 智能体重建在途文件，时间戳晚于本批改动且错误数在实时变化：9 → 2），**与 renderer 无关**，不属本域。

---

## 四、交付文件清单（renderer 侧改动）

| 文件 | 改动 |
|---|---|
| `src/renderer/pages/Home/index.tsx` | 删语音输入/ASR/超算逻辑、孤儿 refs |
| `src/renderer/pages/Home/ChatPanel.tsx` | 删麦克风/两档/超算按钮/AgentRunner |
| `src/renderer/pages/Settings/index.tsx` | 删 3 个语音相关标签与逻辑（12→9 标签） |
| `src/renderer/App.tsx` | 删 Voice 路由 |
| `src/renderer/components/layout/Sidebar.tsx` | 删语音导航项 |
| `src/renderer/components/layout/TitleBar.tsx` | 删语音路径标题 |
| `src/renderer/i18n/index.ts` | 删 `input.voice` 孤儿键 |
| 已移出备份 | Voice 页 2 文件、SettingsVoice 2 文件、voicePresets、voice-commands |

**备份位置**：`E:\玄枢AI\xuanshu-ai-dev\temp\renderer_backup_20260903\`（完整 renderer 快照 + 已删文件，可随时回滚）

---

## 五、待对账 / 待办（不属本批，需协调）

1. **Agents 页「智能编排」tab**（Auto-Orchestrator）：Trae 若确认编排下架，应在集成阶段一并移除该 tab 与 `ManualTeamPanel` 编排渲染。
2. **超算残留**：`ModelSwitcher`（`tandem:status` 读运行态）、Model 页 `TandemPanel`、`Scheduler` —— 待 workbuddy main 侧 `tandem:*` 剔除后统一清理，避免假显示/死链接。
3. **浏览器下载 UI**：main `will-download` 目前静默存盘，无 renderer 契约；如需下载管理面板，需 workbuddy 提供 `download:*` IPC 后再建（零假显示原则）。
4. **建设类 UI**（智能体系统 / 模型管理 / 自检）：待对应 main 契约字段落地后按任务单 §3-5 开工。
