---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: 3c24a5e3a352f921a82f7d3a39c85647_1e929af8a9e811f188bd525400287e28
    ReservedCode1: 1yWCTVIpMvkEtY/Dr9FpmWune0UPDiYzFOer12j9Zg3MNImtotTVKcM2U7q+XUE0ssu6SnnsKfUO/xVXkdRAznNwz1FFVNKuwaaM0eWaUevcJLOSnxDRH9gvCLfWbML33T3S+FjnAS9sAxss+lCPQm0B/9IBKyiisjW4BpDamIplWQDq/R+FSYCAflc=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: 3c24a5e3a352f921a82f7d3a39c85647_1e929af8a9e811f188bd525400287e28
    ReservedCode2: 1yWCTVIpMvkEtY/Dr9FpmWune0UPDiYzFOer12j9Zg3MNImtotTVKcM2U7q+XUE0ssu6SnnsKfUO/xVXkdRAznNwz1FFVNKuwaaM0eWaUevcJLOSnxDRH9gvCLfWbML33T3S+FjnAS9sAxss+lCPQm0B/9IBKyiisjW4BpDamIplWQDq/R+FSYCAflc=
---

# 玄枢终代 · 四方协作总纲（v2.0）

> 本目录是 **玄枢终代**（FlowyAIPC 玄枢化改造）开发协作区，所有参与方（中央 Marvis / 豆包 / WorkBuddy / Trae）以此处为唯一共享协作区与唯一真相源。

---

## 一、版本说明：玄枢初代 vs 玄枢终代

| 项目 | 定位 | 位置 |
|---|---|---|
| **玄枢初代** | 以前"从头开发"的玄枢（另一条独立开发线） | 不在本目录。相关文件位于 `E:\玄枢AI` 下其它目录（如 xuanshu-ai-dev 等），与本次改造**互不干扰、分开管理** |
| **玄枢终代** | 本目录：把商业软件 FlowyAIPC v5.2.1 改造为纯本地桌面 AI 助手（当前进行中的项目） | `E:\玄枢AI\玄枢终代` |

> 两条线严格分开：本协作区**只放玄枢终代**的东西，不混入初代文件。

---

## 二、目录结构

```
E:\玄枢AI\玄枢终代\
├── 00_一期历史\   旧版三方协作的分散文件（README/PLAN/任务X/进度盯梢），供查阅，勿改
├── 01_资料\       整合任务单（给豆包/WorkBuddy/Trae 各一份）+ 接口契约 + 老板意见模板 + 本总纲
├── 02_源码\
│   ├── app\       唯一施工区：当前部署版完整解包（9446 文件，203.9MB），唯一允许改代码处
│   └── resources_openclaw\  OpenClaw 运行库引用占位（D盘运行时，勿直接改）
├── 03_产出区\     豆包\ WorkBuddy\ Trae\   ← 各方成品按相对路径放这里
├── 04_集成区\     中央合并前的中转/合并补丁
├── 05_状态\       各参与方 STATUS + 中央 STATUS（验收进度）
├── 06_意见墙\     跨方意见/问答/老板意见
├── 07_部署产物\   重打包 app.asar / 便携版 / 安装包 / 验收清单
└── 08_参考素材\   设计图、图标原图等
```

---

## 三、给各方的"一人一份"整合任务单（入口）

| 收件方 | 唯一任务文件 | 职责摘要 |
|---|---|---|
| 豆包 | `01_资料\给豆包_任务单.md` | 全局主题引擎（磨砂玻璃+图片生成）+ 设置页全套 + 输入框三档切换/@语云 |
| WorkBuddy | `01_资料\给WorkBuddy_任务单.md` | 专家页卡片化 → 记忆/知识 → 连接页 → 会议页 |
| Trae | `01_资料\给Trae_任务单.md` | 任务页定时任务修复 → AI 视频页 + 首页核查 |

> 每份任务单已把总纲/方案/排期/契约/规则/验收/模板全部整合进一份，**收件方只读自己那一份即可**。

---

## 四、协作规则速览（详见各任务单，中央统一仲裁）

1. 唯一施工区 `02_源码\app`；只改自己职责文件。
2. 产出落 `03_产出区\<名>\<模块>\`，保持相对路径，附 `CHANGES.md`，缺附件的产出中央不合并。
3. 每完成一模块更新 `05_状态`；跨方接口走 `01_资料\接口契约.md`，未定契约先发 `06_意见墙`。
4. 成品 bundle 只能定位式局部修改，禁止格式化/换构建链/升级依赖；改完 `node --check`。
5. 红线：不动 .git/密钥/模型文件；不写厂商 token；不引联网依赖；不向厂商云发流量。
6. 验收以 `07_部署产物\验收清单.md` 为准，最终须"UI+后端都真能用"。

---

## 五、当前真实进展记录

- 首页第一批 UI 改造已部署（网关 38789）；其余 10 项 UI + 后端联动在进行中。
- 本文档由中央维护，随进度滚动更新。
*（内容由AI生成，仅供参考）*
