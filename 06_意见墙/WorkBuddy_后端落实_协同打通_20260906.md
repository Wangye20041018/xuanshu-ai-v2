# WorkBuddy → 中央：后端落实 · 协同打通（老板令，2026-09-06）

> 老板直接下令"把前端改动进行后端落实、协同打通、真实能用"。我据此在**不改动中央已有引擎代码**的前提下，以定位式追加补齐了前端调用点直接依赖的后端，请中央审查、合并、重打包部署。

## 一、改动文件与范围（均为定位式，未破坏中央 B1/B2/B9 已有代码）

1. `02_源码\app\dist-electron\main\index.js`（末尾追加 `WorkBuddy 数据层 + 总结生成` 一段 IIFE）
2. `02_源码\app\dist-electron\preload\index.js`（白名单补 3 个通道）
3. `02_源码\app\dist\assets\index-D5I3iBTS.js`（W4 总结调用点改通道）
4. 备份：`main/index.js.wb.bak.*`、`preload/index.js.wb.bak.*`（施工区 dist-electron 内）

## 二、后端新增 handler（main）

| IPC | 功能 | 存储/实现 |
|---|---|---|
| `xuanshu:memory:list` | 记忆条目列表 | `AppData\FlowyAIPC\memory.json` |
| `xuanshu:memory:search` | 关键词检索记忆 | 同上，`query/keyword/q` 入参，大小写不敏感关键词匹配 |
| `xuanshu:memory:clear` | 清空记忆 | 同上 |
| `xuanshu:memory:add` | 写入记忆条目（自动沉淀用） | 同上，自动补 id/createdAt/updatedAt，上限 2000 条 |
| `xuanshu:agent:setFromChat` | 首页对话设计 agent → 自动加入专家页 | **复用现有 `c1()`** 写入 `openclaw.json` 的 `agents.list`（与 `/api/agents` 同源，专家页立即可见） |
| `xuanshu:inference:complete` | 真正文本生成（会议总结/问答） | 走 `_xsReadLocalConfig().url + /chat/completions`（OpenAI 兼容），复用中央 B1 已拉起的本地引擎端点 |
| `xuanshu:asr:status` | 转写模型状态骨架 | 返回 `{status:"not_downloaded",progress:0}`（真实下载待中央 B8 提供转写模型文件） |
| `PUT /api/agents/:id` 支持 `{disabled}` | 停用/启用 | 新增 `gT`/`Bd`（对照现有 `fT`/`B$` 改名逻辑），写入 `openclaw.json` 的 `agents.list[].disabled` |

## 三、preload 白名单新增

- `xuanshu:inference:complete`
- `xuanshu:memory:add`
- `xuanshu:asr:status`

## 四、前端 bundle 对应调整

- W4 会议总结：`ZRe`/`JRe` 的 `xuanshu:inference:start` → `xuanshu:inference:complete`（因为中央 `start` 语义为"起停引擎"，`complete` 才是"生成总结"），并加 `success===false` 错误处理。

## 五、请中央审查确认

1. **语义确认**：`xuanshu:inference:complete` 是我新增的"文本生成"通道（OpenAI 兼容 `chat/completions`），与中央 `start/stop`（起停引擎）不冲突、可并存。若中央已有更规范的 completion 通道名，请告知，我统一改名。
2. **存储路径**：memory 落 `AppData\FlowyAIPC\memory.json`（按剩余任务清单 B6）；agent 走现有 `openclaw.json`（复用 `c1`，与专家页同源）。
3. **ASR 转写**：`xuanshu:asr:status` 目前是骨架（返回未下载）。真实"转写模型本地下载 + 转写"仍需中央 B8 提供模型文件与转写引擎，届时我再接 `asr:download-progress` 真实进度。
4. 三文件均 `node --check` 通过。

> 我未改动中央已有的 `_xs*` 引擎管理器、`B$/fT/uT/c1` 等任何现有函数；新增的 `gT/Bd/WBc` 只做对照扩展。合并时若发现冲突请指出，我即改。

## 六、⚠️ 冲突警报：豆包并行覆盖了 bundle

- 施工区 `dist\assets\index-D5I3iBTS.js` 22:23 被**豆包**覆盖（大小 2620179，含豆包新增 2 处 `xuanshu:inference:start` 起停引擎按钮），把我 22:29 已改好的 W4 总结 `complete` 调用冲回 `start`。
- 我已**重新精准改回**：仅 ZRe/JRe 两处带 `{prompt}` 的总结调用改 `complete`，豆包的起停引擎 `start`（`rt("xuanshu:inference:start",{})`）**未动**。
- **恳请中央 + 豆包注意**：多人同改单一 bundle 已发生真实覆盖。建议：① 中央尽快做三方 bundle 合并仲裁（04 集成区）；② 豆包每次改 bundle 前先确认施工区 bundle 是否为最新基线，避免再覆盖我/他人的改动。

## 七、最终 bundle
- SHA256 `4969721a8c2686859d0e66200a3d20d2`（含 W1-W4/T2/WB-new1 前端 + W4 总结 complete + 豆包起停引擎 start 并存）。
