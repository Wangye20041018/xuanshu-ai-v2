---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: 3c24a5e3a352f921a82f7d3a39c85647_57047f60a9fb11f190de525400461939
    ReservedCode1: Jj5INrm3MpMcjQvn2kv+Wsi3nx9xbUSQoEJusiZJHTShwgUiWiCm+3CMhwbu0xJpSm1wKs/tq28CI8fqS9rsEfrCq+VrMKKmorM0IYohYdQDFP3IvOrctx+8IAlWtX9UYjZCkpKUoqUq4qoTI+/p5tNPb06C8UA7oHehgAonY+FWZAxXuIGob7GCwKI=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: 3c24a5e3a352f921a82f7d3a39c85647_57047f60a9fb11f190de525400461939
    ReservedCode2: Jj5INrm3MpMcjQvn2kv+Wsi3nx9xbUSQoEJusiZJHTShwgUiWiCm+3CMhwbu0xJpSm1wKs/tq28CI8fqS9rsEfrCq+VrMKKmorM0IYohYdQDFP3IvOrctx+8IAlWtX9UYjZCkpKUoqUq4qoTI+/p5tNPb06C8UA7oHehgAonY+FWZAxXuIGob7GCwKI=
---

# 剩余任务全清单（除"做完后调试"外，未完成事项全量盘点）

> 来源：老板 2026-09-06 指令（手机）。本清单由中央 Marvis 全面盘点各方 STATUS / 验收清单 / 施工区 preload+main / 产出区后汇总。
> 判定口径：**排除"功能做完之后的上线调试/回归排查"**，凡属"还没做 / 只留了调用点 / 做了但没打通 / 缺素材缺实现"的一律列入。
> 红字结论：**施工区 preload/index.js 与 main/index.js 均为基线零改动**（无 xuanshu:* / memory:* / llama / engines / providers / usage 等任何玄枢后端代码），第三方所有前端改动目前**没有任何后端可落地**——这就是"只粉刷不结构重造"的直接原因。后端必须由中央/代办补齐，前端调用点才有意义。

---

## 〇、当前各交付状态（盘点基线，2026-09-06）

| 方 | 已完成 | 未完成 |
|---|---|---|
| WorkBuddy | W1 专家页 / W2 记忆 / W3 连接 / W4 会议 前端调用点版已落产出区（node --check 过，等待联调） | 全部依赖中央后端打通，前端链路才能真实生效 |
| 豆包 | 主题引擎方案已拍板、_work 有草稿 snippet（xs_theme.runtime/panel/b_gateway/b_token/b_health/b_about），**未落正式交付目录** | 主题引擎正式版、设置页 6 子块、输入框三按钮+@语云+三档切换、token 页 |
| Trae | T1 任务页 v1 已交付（待联调） | 停摆（积分耗尽）；T2 AI 视频页转交、T3 首页核查移交 |
| 中央(Marvis) | 协作区/任务单/看板/验收清单初始化；统一图标已复制入 brands+xuanshu 与 dist/assets（icon-*.png 已替换为新图，今晚 9:33） | 后端 M2-M9 全部未做；preload 白名单未放行；asar 重打包/部署未做 |

---

## 一、后端主进程（中央侧，全空白 = 最大阻塞，共 10 项）

> 这是"落地"的关键：任何一方前端调用点若后端不实现，都只是粉刷。

### B0. preload 白名单放行（阻塞一切联调）
- 文件：`02_源码\app\dist-electron\preload\index.js`（ipcRenderer.invoke 白名单数组 i / on 数组 l / once 数组 c）
- 需放行（invoke）：`xuanshu:inference:start`、`xuanshu:inference:stop`、`xuanshu:inference:status`、`xuanshu:inference:setModel`、`xuanshu:inference:setContext`、`xuanshu:agent:setFromChat`、`xuanshu:memory:list`、`xuanshu:memory:search`、`xuanshu:memory:clear`、`xuanshu:model:setMode`、`xuanshu:usage:stats`、`xuanshu:system:health`、`xuanshu:network:check`、`xuanshu:network:repair`、`xuanshu:provider:test`（云端 API 连通性）
- 需放行（on 监听）：`asr:download-progress`、`xuanshu:engine:status`、`xuanshu:usage:updated`、`xuanshu:memory:updated`

### B1. 本地推理引擎拉起（M3 核心）
- 施工区无 `resources\engines\llama\llama-server.exe`——引擎实体不存在，需补入 __llama.cpp__ 运行时 + 主模型 GGUF（Qwopus3.5-9B-Coder-MTP，老板 E 盘本地模型库），并实现随软件启动/手动拉起、端口 8082 就绪检测。
- IPC：`xuanshu:inference:status`（返回 {ready, model, port, ctx, vision}）、`start/stop/setModel/setContext`；会议总结/专家问答/记忆检索统一走此端点（契约1）。

### B2. 模型文件接入与参数调节（M3 续）
- 浏览选择本地 GGUF 文件（含视觉头 mmproj）、显示已加载模型名/大小/是否视觉头；上下文窗口/ngl 层数/线程/温度界面化调参与"应用"；随软件启动开关。

### B3. 硬件实时面板（M3 续）
- 主进程采集 GPU/内存/模型占用实时指标，IPC 推送前端图表。

### B4. 云端 API 连接面板后端（M4）
- provider 增删改查 + 密钥加密持久化（`AppData\FlowyAIPC\providers.json`）+ 真实连通性测试 `xuanshu:provider:test`；三档路由(local/cloud/auto)映射 `flowy:model:silentSwitch`。

### B5. token 用量统计后端（M8）
- 每会话本地/云端调用 token 数埋点入库（`usage.json`），IPC `xuanshu:usage:stats`（今日/近7日/累计分本地与云端）。

### B6. 记忆双库存储层（W2 依赖）
- 「记忆」动态上下文库落 `AppData\FlowyAIPC\memory.json`，实现 `xuanshu:memory:list/search/clear`；「知识」复用现有 `knowledge:*`；记忆/知识检索统一走本地推理端点。

### B7. 专家页持久化与 agent 管理（W1 依赖）
- `agents.json` 持久化 + 网关 `PUT /api/agents/:id` 支持 `{name?, disabled?}` + `xuanshu:agent:setFromChat`（首页对话设计 agent → 自动加入专家页并可调用）。

### B8. 会议转写与总结链路（W4 依赖）
- 转写模型本地下载：`asr:download-progress` 事件 + 本地转写端点；转写文本 → `xuanshu:inference:start` 调本地主模型生成会议总结。

### B9. 全局通网 + 网络/安全检查修复（M2 + 设置页依赖）
- 全局通网工程（断厂商云端依赖）；`xuanshu:network:check/repair`、`xuanshu:system:health` 真实检查修复接口。

---

## 二、前端剩余（按现有归属 + 老板新增，共 12 项）

### 归 WorkBuddy 接盘（老板令：已干完 W1-W4，剩下全接，别歇）
- **WB-new1【新】AI 回复头像圆形图标**：将老板图标（黑底白线人形）以中心为圆心裁成**圆形透明底**，作为 **AI 回复侧头像**（注意：不是用户头像，用户头像仍须删"我"字）；圆内保留白线人形全部细节清晰可辨。产出圆形 PNG + 定位 bundle 中 AI 回复头像渲染点并接入。
- **WB-new2【转】T2 AI 视频页改造（验收#7）**：删登录墙、云端未接功能置灰、时长自定义；原归 Trae，Trae 停摆已裁定转交 WorkBuddy（此前督令 T2 已下）。
- **WB-new3【转】首页核查 T3**：按验收#1 复核首页第一批（删购买/四卡/问候玄枢/常规会话/导航头像/社区），列差异清单，只查不改。
- **WB-new4【联调配合】**：W1-W4 结构改造配合中央后端联调——后端 B0-B8 落地后逐模块冒烟验证（专家页删/停/加、记忆读写检索、连接微信/QQbot、会议转写总结），发现问题即返工。
- **待素材**：会议页设计图（老板提供后按图微调，不阻塞）。

### 归豆包（若豆包持续无正式交付，中央将按老板令将其工作并入 WorkBuddy 接盘）
- **DB-1 主题引擎正式版**：磨砂玻璃主题（可调主色/深浅跟随/重启记忆/一键恢复/外观面板）+ 图片生成主题（Canvas 取色），落 `03_产出区\豆包\主题引擎\`（_work 草稿未转正）。
- **DB-2 设置页 6 子块**：通用(删匿名上报+主题面板)、token 页（改名 Token + 本地/云端用量展示）、模型-网关页（模型文件接入/参数调节/随启动/硬件面板/网络检查修复/云端 API 连接面板）、安全页、删账户与更新页、反馈→关于页。
- **DB-3 输入框**：三按钮布局 + @键唤起"语云"语音输入 + 模型三档切换（本地/云端/智能，setModelMode 通知后端真实切换）。

### 归 Trae（停摆，仅存档）
- T1 任务页 v1 联调待办（A 空 agentId 放行 / B missing_agent 迁移 / C cron 链路统一 / D 日志回显）——后端 B0 配套 + B 迁移在中央侧，其余已并入 WB-new4。

---

## 三、中央交付线（除调试外，共 4 项）
- **D1 M6 icon 完整改造**：统一图标圆角矩形透明背景全套尺寸（16/32/64/128/256 + icon.ico），替换软件各入口（主进程、任务栏、包内 assets 已部分完成）；新增圆形版给 AI 回复头像。
- **D2 首页用户头像删"我"字**：bundle 中 `Array.from(g?.nickname||"我")[0]||"我"`（user 分支）改为不显示占位文字/换成图形。
- **D3 M7 asar 重打包流水线 + 三方产出合并 → 重打包 → 双盘部署**（02 施工区应用 → 07_部署产物 → 双盘便携版/安装包）。
- **D4 验收清单 15 项逐项打勾**（当前全 ⬜；功能性验收，非调试）。

---

## 四、执行顺序建议（中央推进）
1. 中央立即做 B0 preload 放行 + 引擎目录/模型接入（B1-B3），先让本地推理真正跑起来。
2. WorkBuddy 并行承接 WB-new1/WB-new2/WB-new3 + 待中央 B0/B6/B7 就绪后做 WB-new4 联调。
3. 豆包限时交付 DB-1/DB-2/DB-3；超时并入 WorkBuddy。
4. 中央 D1/D2（图标+头像）与 M7 打包部署并行，最后 D4 验收。

*（本清单由中央 Marvis 于 2026-09-06 生成，为当前唯一全量遗留台账）*
*（内容由AI生成，仅供参考）*
