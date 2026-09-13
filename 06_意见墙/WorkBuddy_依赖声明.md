# WorkBuddy · 依赖声明（W1~W4 所需 IPC / 后端）

> 提交人：WorkBuddy ｜ 日期：2026-09-06 ｜ 请中央 Marvis 逐条确认/发布，避免各方自行发明接口。
> 说明：前端一律走 `window.electron.ipcRenderer.invoke(channel, ...)` 或 `et("/api/...")` 网关代理，不直连裸 IP、不落密钥、不引联网依赖。

---

## 0. 已核实可用的现成通道（无需新增）

- 网关 HTTP 代理 `et(path, opts)`：`/api/agents`、`/api/channels/accounts`、`/api/channels/config/*`、`/api/channels/binding`、`/api/gateway/restart` 等。
- IPC（preload 白名单已含）：`channel:*`、`knowledge:*`、`meeting:*`、`agentMemoryReadonly:*`、`cron:*`、`provider:*`、`settings:*`、`usage:recentTokenHistory`、`asr_api`（录音/读音频）。
- 主进程已注册但 **preload 白名单未放行**：`xuanshu:inference:*`（start/stop/status/setModel/setContext）——**请中央放行**，否则前端无法调用本地推理。

---

## 1. W1 专家页

| 接口 | 用途 | 状态 |
|---|---|---|
| `setAgentFromChat(payload)` | 首页对话设计 agent 后自动写入专家页 | ❌ 需中央发布（建议 IPC `xuanshu:agent:setFromChat`，入参=agent 结构） |
| `PUT /api/agents/:id` 支持 `{name?, disabled?}` | 停用/启用 | ❌ 需中央扩展（当前仅 `{name}`） |
| agent 持久化位置 | 重启不丢 | ❌ 需中央确认落 `AppData\FlowyAIPC\agents.json` 及读写职责 |

## 2. W2 记忆（知识库→记忆/知识双库）

| 接口 | 用途 | 状态 |
|---|---|---|
| `knowledge:*` 系列（已有） | 知识库文件夹/文件 CRUD、解析运行时 | ✅ 已有，可复用 |
| 「记忆」库（对话动态上下文自动沉淀）读写 | 记忆库独立存储/检索/清空 | ❌ 需中央定存储层 + 提供 `memory:list` / `memory:search` / `memory:clear` 类 IPC |
| 检索结果真实返回 | 记忆/知识检索问答 | ❌ 需中央给检索 IPC（或复用 gbrain/本地推理端点） |

> W2 前端先把「记忆 / 知识」两块 UI 与 IPC 调用点做好；后端契约未发布前用注释标记。

## 3. W3 连接（频道→连接）

| 接口 | 用途 | 状态 |
|---|---|---|
| `channel:*`（已有） | 微信/QQbot 等连接配置、扫码、状态 | ✅ 已有 |
| 微信：消息同步开关 / 断线重连状态 | 强化微信连接 | ⚠️ 需中央确认对应字段/事件（`gateway:channel-status` 已可订阅） |
| QQbot 不强制绑定 agent | 独立配置使用 | ⚠️ 前端可改（去掉强制绑定项），需中央确认后端 `/api/channels/binding` 允许空 agentId（当前已支持 DELETE 解绑） |

## 4. W4 会议

| 接口 | 用途 | 状态 |
|---|---|---|
| `getLocalModelStatus()`（契约1） | 本地推理就绪/模型名/端口/上下文 | ❌ 需中央发布（并放行 preload） |
| 转写模型本地下载进度/状态 | 会议转写离线化 | ❌ 需中央提供下载 IPC（下载进度事件）+ 本地转写端点 |
| 会议总结走本地推理（契约1/4） | 转写文本 → 玄枢主模型总结 | ⚠️ 依赖 `getLocalModelStatus` + 本地推理端点 + preload 放行 `xuanshu:inference:*` |
| `meeting:*`（已有） | 会议列表/保存/删除/录音检测 | ✅ 已有 |

---

## 5. 请中央优先回复的事项（阻塞点）

1. `xuanshu:inference:*` 是否放行到 preload 白名单？（W4 总结硬依赖）
2. `getLocalModelStatus()` 确切 IPC 名与返回结构。
3. 「记忆库」存储层与检索 IPC 名。
4. agent 停用/启用 + `setAgentFromChat` 的最终接口名与入参。
5. 会议页设计图（`08_参考素材` 目前仍为「待老板提供」，W4 布局无法按图改，请速给）。

> 以上未确认前，WorkBuddy 前端按《专家页设计》及本声明所述结构实现并**留好调用点**，不擅自发明后端。
