# WorkBuddy · 专家页数据设计（W1）

> 提交人：WorkBuddy ｜ 日期：2026-09-06 ｜ 供中央 Marvis 拍板后联调
> 依据：已通读 `dist/assets/index-D5I3iBTS.js` 中 `/agents` 路由（`IIe` → `H$` 专家管理列表）实际代码，非凭空设计。

---

## 一、现状（已核实）

- 路由 `/agents` = 组件 `IIe`，内含 Tab：`store`（专家商店 `jD`）与 `list`（专家管理 `H$`）。
- `H$` 是 `forwardRef`，当前为「**左侧 240px 列表 + 右侧详情**」两栏布局：
  - 列表项 `Cje`（每项含 `isSelected` / `isAgentPackage` / `onDelete`）。
  - 详情 `Aje`（含 `onOpenChat` 跳首页对话）。
  - 新建弹窗 `Tje`（`onCreate` → `createAgent`），删除确认弹窗 `yo`（已具备二次确认）。
- 数据来源：`Fm()`（`allAgents` / `displayAgents` / `agentIdToPrimary`）+ `En()` store（`fetchAgents` / `createAgent` / `deleteAgent` / `updateAgent`）。
- **agent 走网关 HTTP 代理**（`et("/api/agents")`），不是直连 IPC：
  - `GET /api/agents` 列表；`POST /api/agents {name, inheritWorkspace}` 新建；`PUT /api/agents/:id {name}` 改名；`DELETE` 删除；`updateAgentModel` 改模型。
- 结论：**删除+二次确认、新建弹窗已存在**；缺的是「**卡片化展示**」「**停用/启用**」「**首页对话设计 agent 自动加入**」。

---

## 二、agent 数据结构（建议补齐）

现有字段（从 `Fm` 反推）：`id`、`name`、`isDefault`、`knowledgeFolderId` / `knowledgeBaseId`、`panelExtension`、`templateAgentId`、`heartbeat`、`capabilities`、`workspace`、`model`。

**建议在 agent 记录上新增（中央确认落库位置与读写）**：

```jsonc
{
  "id": "agent-uuid",
  "name": "名称",
  "avatar": "头像标识（emoji/内置头像id/自选图 base64 三选一，见下）",
  "description": "一句话能力描述",
  "capabilities": ["聊天", "文件", "网页"],   // 能力标签
  "disabled": false,                          // ★ 新增：停用态
  "isDefault": false,
  "knowledgeFolderId": null,
  "model": "local-qwen",
  "createdFromChat": false                    // ★ 新增：是否由首页对话设计而来
}
```

- **头像**：优先复用现有 `dist/assets/avatar*.png` 内置头像 + emoji 二选一，避免引入外链图片（红线：不引联网资源）。
- **持久化位置**：倾向 `AppData\FlowyAIPC\`（任务书已注明），请中央给确切文件名（建议 `agents.json`，与 `flowyaipc-providers.json` 同级），WorkBuddy 前端只通过 `et("/api/agents")` / 新增 IPC 读写，**不直落磁盘**。

---

## 三、卡片化设计（Semi Design 语言）

把 `H$` 左侧列表改为「**卡片网格**」，保持软件自身视觉（Tailwind 原子类 + Semi 组件，色板沿用 `#F3F4F6` 底 / `#F97316` 主橙 / `--semi*` 变量）：

- 每张卡片内容：头像 + 名称 + 描述 + 能力标签 + 状态徽标（启用/停用）。
- 卡片操作（右上角 hover 浮现，符合 Semi 交互）：
  1. **打开对话**（跳首页）
  2. **停用/启用**（开关或按钮，立即生效，卡片呈现停用态：灰化 + 徽标）
  3. **删除**（二次确认弹窗，明示后果：该 agent 的会话/绑定将一并解除）
- 顶部「**+ 添加 agent**」按钮（复用现有 `Tje`，补全：名称/头像/描述/能力配置字段）。
- 空态：无 agent 时给出引导（去商店 / 新建）。

---

## 四、首页对话设计 agent → 自动加入专家页（关键联动）

- 触发：首页对话中用户让玄枢「设计一个新 agent」，玄枢主模型产出结构化 agent 描述 → 确认 → 写入 agent 列表。
- **前端调用点**：在首页对话确认环节调用 `setAgentFromChat(payload)`（payload = 上述 agent 结构），成功后 `fetchAgents()` 刷新专家页。
- **需中央提供**：`setAgentFromChat` 的最终 IPC 名与入参契约；未发布前，前端保留调用点并以 `window.electron.ipcRenderer.invoke("xuanshu:agent:setFromChat", payload)` 占位 + 注释标记。

---

## 五、停用/启用的后端契约建议

- 建议复用 `PUT /api/agents/:id`，body 由 `{name}` 扩展为 `{name?, disabled?}`；或新增 `PATCH /api/agents/:id/status {disabled}`。
- 停用语义：agent 不再出现在首页可选 agent 列表 / 不可被调用，但数据保留可重新启用（**非删除**）。
- 删除语义：彻底移除（连同其会话/知识库绑定解绑）。

> 以上字段与接口，请中央在 06_意见墙 回复确认；确认前 WorkBuddy 前端按上述结构实现，接口名以中央最终发布为准。
