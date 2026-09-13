# CHANGES.md · W1 专家页卡片化

> 模块：W1 专家页（路由 `/agents`）｜ 作者：WorkBuddy ｜ 日期：2026-09-06
> 施工文件：`dist/assets/index-D5I3iBTS.js`（单一 2.58MB 生产包，定位式局部修改）

## 一、改动摘要（已完成）

1. **停用/启用**（真实生效）：
   - 专家管理列表项 `Cje` 新增「停用/启用」按钮（`rF` 播放 / `uve` 暂停 图标）与「删除」按钮；停用态 = 半透明 + 「已停用」徽标。
   - 主组件 `H$` 新增 `z` 处理函数：`et("/api/agents/"+id, {method:"PUT", body:JSON.stringify({disabled:te})})`，成功后 toast 提示并刷新列表。
2. **i18n 文案**（中英文 agents 命名空间）：新增 `agentDisabled` / `agentEnabled` / `agentToggleFailed`、`disableAgent` / `enableAgent` / `disabledBadge`。
3. **首页对话设计 agent 自动加入 —— 调用点**：新增模块级 `async function setAgentFromChat(e)`，内部 `window.electron.ipcRenderer.invoke("xuanshu:agent:setFromChat", e)`，入参 = agent 结构体（见《WorkBuddy_专家页设计.md》第二节）。
4. **卡片化 / 删除二次确认 / 新建弹窗**：已核实原页即具备（列表项卡片式 `Cje`、删除确认弹窗 `yo`、新建弹窗 `Tje`），本次在其上叠加停用/启用能力。

## 二、关键代码定位（bundle 绝对偏移，仅供参考，改动后偏移已平移）

| 组件 | 作用 |
|---|---|
| `setAgentFromChat` | 首页对话设计 agent → 专家页的 IPC 调用点（本次新增） |
| `H$` | 专家管理列表（forwardRef，含 `z` 停用/启用处理） |
| `Cje` | 列表项（头像+名称+停用/启用钮+删除钮+停用徽标） |
| `Aje` | 详情（能力/模型/频道绑定） |
| `Tje` | 新建弹窗 |
| agents 命名空间 | tabs / toast 文案（中英文） |

## 三、需中央联调点（阻塞项，前端已按契约留调用点）

1. **preload 白名单放行** `xuanshu:agent:setFromChat`（当前 preload `invoke` 白名单无此通道，调用会抛 `Invalid IPC channel`，属预期，待中央放行）。
2. **main 实现** `PUT /api/agents/:id` 的 `disabled` 字段（当前仅 `{name}`，需扩为 `{name?, disabled?}`）。
3. **agent 持久化** `AppData\FlowyAIPC\agents.json`（主进程读写，前端只走 IPC/网关）。
4. **首页「设计 agent 自动加入」流程**由中央主进程实现（WorkBuddy 不动首页，仅留 `setAgentFromChat` 调用点）。

## 交付哈希（统一 bundle，因项目架构如此；改点见上方表格 + i18n/grep 验证）
- bundle SHA256: `4969721a8c2686859d0e66200a3d20d2`（2026-09-06 21:58 重交付）

## 验证方式

- `node --input-type=module --check < dist/assets/index-D5I3iBTS.js` 通过（已验）。
- 后端就绪后：停用 agent → 卡片灰化+「已停用」徽标；启用恢复；删除需二次确认；首页对话设计 agent → 经 `setAgentFromChat` 自动加入专家页。
