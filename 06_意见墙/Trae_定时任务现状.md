# Trae · 定时任务现状（第1天梳理，供中央联调）

> 日期：2026-09-06
> 作者：Trae
> 面向：中央 Marvis（需中央拍板与补后端）
> 相关任务：T1 任务页定时任务修复

---

## 一、现状结论（一句话）

定时任务（Cron）在渲染 bundle 里已经是一套**完整的前端实现**，走的是**网关 HTTP API（`/api/cron/*`，经 `et()` → IPC `hostapi:fetch` 代理）**，而不是传统 `window.electron` 直连 IPC；其「失效」的根因是 **Cron 任务强绑定 Agent（`agentId` 必填），Agent 一旦被删/改名/缺失就触发 `disabledReason==="missing_agent"` 自动停用**，与任务单描述的「历史判断与绑定 agent 相关」一致。

---

## 二、前端实际架构（已在 bundle 内核实）

1. **路由**：`/cron` → 组件 `k_e`（任务页）。
2. **数据层 store** `mC`（bundle 字符偏移约 @1054109 起）：
   - 列表：`et("/api/cron/jobs")`
   - 新建：`et("/api/cron/jobs", {method:"POST", body})`
   - 更新：`et("/api/cron/jobs/:id", {method:"PUT", body})`
   - 删除：`et("/api/cron/jobs/:id", {method:"DELETE"})`
   - 启停：`et("/api/cron/toggle", {method:"POST", body:{id, enabled}})`
   - 手动触发：`et("/api/cron/trigger", {method:"POST", body:{id}})`
3. **HTTP 代理** `et`：内部走 `Kh`→`window.electron.ipcRenderer.invoke` 统一请求；与「接口契约」提到的 `window.oss` 不同，**实际桥是 `window.electron.ipcRenderer`**，统一入口通道为 `app:request`（`{module, action, payload}`），已注册的 `cron:*` 通道常量在 `Dwe` 集合里（`cron:list/create/update/delete/toggle/trigger`）——但当前前端页面实际走的是 `/api/cron/*` HTTP 路径，二者并存，请中央确认最终以哪条链路为准（见第四节待确认）。
4. **新建/编辑表单** `v_e`：字段为 `name / message / agentId / schedule / delivery / enabled`；`agentId` 当前**必填**（校验 `if(!T){agentRequired}` 且下拉在无 Agent 时 `disabled`）。

---

## 三、失效根因定位（关键证据）

1. 表单校验强制选 Agent：
   - `if(!T){ Ce.error(i("toast.agentRequired")); return }`（@1485343 附近）
   - 新建默认值取「第一个 Agent」`n[0]?.id ?? ""`。
2. 提交体强带 `agentId`：
   - `await s({ name, message, agentId:T, schedule, delivery, enabled })`（@1486350 附近）。
3. 列表卡片对「Agent 缺失」做自动停用展示：
   - `w = n && !e.enabled && e.disabledReason==="missing_agent"`（@1495471 附近）
   - `agentId` 为空时显示 `followDefaultAgent`（「跟随默认 Agent」）或 `unassigned`（「未绑定，原 Agent 已删除」）。
4. Agent 删除侧有联动告警：删除 Agent 时提示「绑定到该 Agent 的定时任务将被自动禁用」。

→ 综合判断：现有实现把 Cron 生命周期死死绑在某个 Agent 上；Agent 一变化，历史 Cron 即进入 `missing_agent` 停用态，看起来就是「定时任务失效」。

---

## 四、T1 修复方案（前端先行，需中央配合）

**前端改动（本次 T1 交付）**
1. Agent 改为**可选、默认「跟随默认 Agent」**：
   - 新建默认不强制选第一个 Agent；下拉新增一项「跟随默认 Agent」（值 `""`）。
   - 删除 `if(!T)` 必选校验。
   - 提交体 `agentId` 允许为空（空 = 跟随默认，由后端在触发时按需选 model/agent）。
2. 保留「手动选 Agent」能力（用户仍可显式指定），不删能力。
3. 启停/删除/触发调用点保持 `/api/cron/*` 不变；删除已有二次确认逻辑（若缺失则补）。
4. 列表卡片 `missing_agent` 停用态仅作**展示**，不改变后端真实调度（后端若仍自动停用，请见下）。

**需要中央确认/补齐的后端点（请拍板）**
- A. `/api/cron/jobs`（POST/PUT）在 `agentId` 为空时是否接受并为「跟随默认 Agent」？若否，需中央在网关层放行空 `agentId`，触发时按需解析默认 model/agent。
- B. 旧数据里 `disabledReason==="missing_agent"` 的历史任务，是否需要在中央做一次性「重置为未停用」或「迁移为跟随默认」？前端无法单方面复活已被后端停用的任务。
- C. 契约里 Cron 前后端到底走 `/api/cron/*` 还是 `cron:*` IPC 通道？当前页面走 HTTP，`cron:*` 通道定义存在但页面未用，请统一并同步《接口契约》。

---

## 五、下一步

- 我按「四、前端改动」先落地 T1 任务页（列表/新建编辑/启停/删除二次确认/触发回显），交付到 `03_产出区\Trae\T1任务页\`。
- 待中央答复 A/B/C 后，配合联调真实触发链路。