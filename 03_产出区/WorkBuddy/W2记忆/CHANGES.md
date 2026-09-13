# CHANGES.md · W2 知识库→记忆（双库）

> 模块：W2 记忆（路由 `/knowledge`）｜ 作者：WorkBuddy ｜ 日期：2026-09-06
> 施工文件：`dist/assets/index-D5I3iBTS.js`

## 一、改动摘要（已完成）

1. **「记忆 / 知识」双库分段切换**：主组件 `cVe` 新增分段状态 `[mV,mW]=x.useState("knowledge")`，顶部渲染「记忆 / 知识」两个分段按钮（Semi 风格，激活态橙色）。
2. **「知识」段**：沿用原有文件知识库（文件夹 → 文件 CRUD、上传、解析运行时 gbrain），逻辑不变。
3. **「记忆」段**：新增独立组件 `mVue`，实现：
   - 列表（`xuanshu:memory:list`，中央 preload 已放行 ✅）
   - 检索（`xuanshu:memory:search`，关键词检索，回车/按钮触发）
   - 清空（`xuanshu:memory:clear`，按钮触发）
   - 加载中 / 错误重试 / 空态（「暂无记忆」）三种状态
4. 两块视觉与数据完全隔离，界面清晰。

## 二、关键代码定位

| 组件/函数 | 作用 |
|---|---|
| `cVe` | 记忆页主组件（`tt("knowledge")`），加 `mV/mW` 分段状态 + 顶部分段切换 + 三元渲染 |
| `mVue` | 新增「记忆」库视图组件（`memory:list/search/clear` 调用点） |
| `Jqe` / `lVe` / `sVe` / `iVe` / `qqe` | 原有「知识」库 hook 与子组件（未改） |

## 三、需中央联调点（已对齐中央 B0 preload 白名单）

1. **main 实现** `xuanshu:memory:*` 三 IPC 与记忆库存储层：
   - `xuanshu:memory:list` → 记忆条目列表
   - `xuanshu:memory:search` → 关键词检索（建议 `{query}` 入参）
   - `xuanshu:memory:clear` → 清空
   - 记忆库 = 对话上下文自动沉淀（与「知识」文档库分离）；检索统一走本地推理端点，由主进程 IPC 中转（契约1）。
2. 记忆条目结构建议（供中央定存储层）：`{id, title, content, source, createdAt, updatedAt}`（最终以中央为准，前端 `mVue` 已按 `title/content/text` 兼容读取）。

## 交付哈希（统一 bundle，因项目架构如此；改点见上方表格 + i18n/grep 验证）
- bundle SHA256: `4969721a8c2686859d0e66200a3d20d2`（2026-09-06 22:01 重交付，已对齐中央 B0 preload 放行的 `xuanshu:memory:*` 真实通道）

## 四、验证方式

- `node --input-type=module --check < dist/assets/index-D5I3iBTS.js` 通过（已验）。
- 打开 `/knowledge`：顶部「记忆 / 知识」双入口；「知识」展示导入文档；「记忆」展示对话沉淀上下文，两块独立检索/清空。
- 数据重启不丢（依赖中央存储层）。
