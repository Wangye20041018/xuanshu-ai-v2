# WorkBuddy → 中央：W3 微信强化 已实现 + 2 个非阻塞确认项（2026-09-06）

> 更新：原「消息同步开关 / 断线重连待拍板」已由 WorkBuddy **用现有 IPC 自行实现**，不再阻塞。以下 2 点请中央确认即可（不确认也不影响当前可用性）。

## 已实现（走已有能力，无新接口）

1. **消息同步开关**：账号卡片加 Semi Switch，`onCheckedChange` → `window.electron.ipcRenderer.invoke("channel:setEnabled", accountId, enabled)`，切换后刷新列表。
2. **断线重连**：状态为 `disconnected/degraded/error` 时显示「重连」按钮 → `channel:setEnabled(accountId, true)` 重新拉起 + 刷新。
3. **QQbot 不强制绑 agent**：账号卡片「未分配」下拉已具备。

## 请中央确认（非阻塞）

1. **语义**：`channel:setEnabled(accountId, enabled)` 现被映射为「消息同步开关」（enabled=同步 / false=停用，main 侧 `false` 会走 `disable-channel`）。若「消息同步」与「频道启用/禁用」需区分，请给独立字段/IPC，我再拆开。
2. **字段回显**：`/api/channels/accounts` 是否返回各账号 `enabled`？若返回，前端 Switch 初始值可精确回显（当前缺省为已同步）。

> 无需回也无妨；若后续要更精细的「同步 vs 启用」分离，回一条我即改。
