# T1 任务页 · 定时任务修复 — CHANGES.md

> 交付人：Trae
> 日期：2026-09-06
> 模块：任务页（`/cron`）定时任务
> 目标：修好定时任务「绑定 agent 导致失效」的根因，让任务不绑定专门 agent、按需调用。

---

## 一、改了什么（共 6 处，定位式局部修改，均在 `dist/assets/index-D5I3iBTS.js`）

改动集中在定时任务新建/编辑表单组件 `v_e` 与 Agent 下拉，围绕一根因：**原实现把 Cron 生命周期强绑在某个 Agent 上，`agentId` 必填，Agent 被删/改名就触发 `disabledReason==="missing_agent"` 自动停用**。

| # | 改动位置（锚点） | 改前 → 改后 | 目的 |
|---|---|---|---|
| 1 | 新建默认 Agent 值 | `...?e.agentId:"__follow_default__"` → `...?e.agentId:""` | 默认「跟随默认 Agent」用**空串**表达，与列表卡片 `e.agentId` 真值判断一致（非空会显示字面量） |
| 2 | 提交前校验 | 删除 `if(!T){Ce.error(i("toast.agentRequired"));return}` | 解除 Agent 必选，允许 `agentId` 为空提交 |
| 3 | Agent 标签 | 去掉红色必填星号 `*` | Agent 变为可选项，不再暗示必填 |
| 4 | Agent 下拉选项 | `children:n.map(...)` → 前置 `value:""` 的「跟随默认 Agent」选项 | 用户可以显式选「跟随默认 Agent」 |
| 5 | 下拉禁用条件 | `disabled:n.length===0` → `disabled:!1` | 无 Agent 时也能选「跟随默认」，不被禁用 |
| 6 | 空值占位提示 | `i("dialog.selectAgentPlaceholder")` → `i("dialog.followDefaultAgent")` | 未选 Agent 时触发框显示「跟随默认 Agent」，语义清晰 |

**未改动 / 已存在无需新增（复核结论）：**
- 任务列表字段：名称、触发时间/周期（`y_e(e.schedule)`）、状态（`enabled` 开关 + `agentMissingDisabled` 徽标）、上次执行（`lastRun` + 成功/失败图标）、下次执行（`nextRun`，enabled 时显示）——均已具备。
- 新建/编辑：名称 + 内容（message）+ 触发时间（daily 每日 / interval 周期 / once 一次性 / custom Cron）——均已具备。
- 启用/停用：`/api/cron/toggle`（`toggleJob`）已具备。
- 删除二次确认：`yo` 确认弹窗（`card.deleteConfirm`，`variant:"destructive"`，确认后才 `deleteJob`）已具备。
- 手动触发 + 结果回显：`/api/cron/trigger`（`triggerJob`）+ 成功/失败 toast + `lastRun` 图标回显——调用点已具备。

## 二、依赖的 IPC / HTTP 调用点（前端已就位，未改）

前端数据层 store `mC` 走统一 HTTP 代理 `et()`（内部 `window.electron.ipcRenderer.invoke` → `app:request`）：

- 列表：`GET /api/cron/jobs`
- 新建：`POST /api/cron/jobs` `{name,message,agentId,schedule,delivery,enabled}`
- 更新：`PUT /api/cron/jobs/:id`
- 删除：`DELETE /api/cron/jobs/:id`
- 启停：`POST /api/cron/toggle` `{id,enabled}`
- 手动触发：`POST /api/cron/trigger` `{id}`

> 说明：bundle 内另有一套 `cron:*` IPC 通道常量（`cron:list/create/update/delete/toggle/trigger`，定义在 `Dwe` 集合），但**当前页面实际走 `/api/cron/*` HTTP 路径**。两条链路并存，需中央统一（见下 C 点）。

## 三、需要中央联调 / 拍板点（重要）

- **A. 空 `agentId` 放行**：`POST/PUT /api/cron/jobs` 在 `agentId` 为空时必须接受并按「跟随默认 Agent」处理，触发时由后端按需解析默认 model/agent。若网关层已强制 agentId 非空，请放行。
- **B. 历史 `missing_agent` 数据迁移**：旧任务里 `disabledReason==="missing_agent"` 的任务，需中央做一次性「重置为未停用 / 迁移为跟随默认」。前端无法单方面复活已被后端停用的任务。
- **C. 链路统一**：Cron 前后端到底走 `/api/cron/*` 还是 `cron:*` IPC 通道？当前页面走 HTTP，`cron:*` 定义存在但未被页面使用，请统一并同步《接口契约》。
- **D. 执行日志详情回显（可选增强）**：目前触发后靠 toast + `lastRun` 成功/失败图标回显；若需完整「执行日志」面板，请中央在 `trigger`/`jobs` 返回值中带出日志字段，我再接日志面板。

## 四、质量校验

- 纯 JS 定位式局部修改，未格式化全文、未改文件头、未动依赖与 `package.json`。
- `node --check` 通过（EXIT=0）。
- 未引入新依赖、未向厂商云发流量。

## 五、交付路径

- 修改后 bundle：`03_产出区\Trae\T1任务页\dist\assets\index-D5I3iBTS.js`（保持与施工区一致相对路径）。
- 本说明：`03_产出区\Trae\T1任务页\CHANGES.md`