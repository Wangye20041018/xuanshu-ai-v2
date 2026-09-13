---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: 3c24a5e3a352f921a82f7d3a39c85647_2d7a0d04a9e611f1be88525400aeaaa3
    ReservedCode1: UBOYowCyvO00WwSbOOwKET2SnYZRjpb/1hFjzioEFrmXTopD5Tmkt2tOm3mu63loL5o+OuC0UDma0Ow1+BzbmVirAdmp9gmFknEY2W2th9r2w13E4pDU47Hs6aK/kcQ5F05ejg0cE6h29NeEt94FPs1u0rOqRHYoOAX2oMDWUpekyvtcFJTs8Sws44w=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: 3c24a5e3a352f921a82f7d3a39c85647_2d7a0d04a9e611f1be88525400aeaaa3
    ReservedCode2: UBOYowCyvO00WwSbOOwKET2SnYZRjpb/1hFjzioEFrmXTopD5Tmkt2tOm3mu63loL5o+OuC0UDma0Ow1+BzbmVirAdmp9gmFknEY2W2th9r2w13E4pDU47Hs6aK/kcQ5F05ejg0cE6h29NeEt94FPs1u0rOqRHYoOAX2oMDWUpekyvtcFJTs8Sws44w=
---

# 玄枢AI 四方协作总纲（v1.0）

> 本目录是玄枢AI开发的**唯一共享协作区**。所有参与方（Marvis中央 / 豆包 / WorkBuddy / Trae）必须以此处为唯一真相源，实时监控本目录变化、按规则产出、汇报、互通意见。任何在本区外完成的成果一律不算数。

---

## 一、项目是什么

玄枢AI = 把商业软件 **FlowyAIPC v5.2.1**（Electron + React + OpenClaw 架构）改造为**纯本地、无云端依赖、内嵌本地大模型推理**的桌面 AI 助手。
- 当前真实进展：首页第一批 UI 改造已落地（删除购买星号/四快捷卡、问候语改玄枢、左侧常规会话+agent 自动调用、导航头像与社区清理），已部署并在线（网关 38789）。
- **其余 10 项 UI 改造 + 全部后端联动均未完成，本次四方协作的目标就是在 7~9 天内把它们全部做完、做成、部署、能实际使用。**
- 产品定位（老板红线，最高优先级）：
  - UI 语言风格沿用软件自身（Semi Design，CSS 变量 `--semi*` 体系），新页面风格与软件一致。
  - 厂商云端（token-cloud / herdsman 等）**全断全删**；云端能力改由老板自己配置的自定义 API（如 DeepSeek）经「模型-网关」面板接入。
  - 本地推理内嵌（llama.cpp 由主进程拉起），主模型 Qwopus3.5-9B-Coder-MTP（E:\模型库 已备 Q4_K_M 与全精度，视觉头 mmproj-F32 也需就绪）。
  - **改造必须"前端 UI + 后端联动"一起做，完成后软件真的能完整使用，不许只改皮。**

---

## 二、架构与关键路径（只读参考，改动需申报）

| 层 | 说明 | 关键路径 |
|---|---|---|
| 渲染层 bundle | 玄枢的 React 页面代码（所有 UI 都是改这里） | `E:\玄枢AI\玄枢三方AI协作\02_施工区\dist\assets\index-D5I3iBTS.js`（2.58MB，别用手改大文件，用该目录里的源码定位后精准改） |
| 主进程 | Electron 主进程，已注入 llama 本地推理拉起逻辑（搜 `_xsFindMmproj`） | `E:\玄枢AI\玄枢三方AI协作\02_施工区\dist-electron\main\index.js` |
| 运行期配置 | 软件设置（主题/网关端口/token） | `C:\Users\24228\AppData\Roaming\FlowyAIPC\settings.json` |
| Provider 配置 | 本地/云端模型接入（含密钥） | `C:\Users\24228\AppData\Roaming\FlowyAIPC\flowyaipc-providers.json`（里面有厂商旧 token，最终要清理替换） |
| OpenClaw 运行库 | agent 运行时与插件（微信/QQbot/钉钉等） | `D:\应用\FlowyAIPC\resources\openclaw`、`...\openclaw-plugins` |
| 部署目标 | 最终软件包（改完由中央重打包覆盖此 asar） | `D:\应用\FlowyAIPC\resources\app.asar`（211,798,137 B） |
| 本地模型 | | `E:\模型库\Qwopus3.5-9B-Coder-MTP-Q4_K_M.gguf`（5.38GB）及全精度变体、`mmproj-*F32.gguf` 视觉头 |

**改哪些文件、产出放哪里——见各任务文件，禁止动职责外的文件。**

---

## 三、协作规则（务必遵守）

1. **唯一施工区**：`02_施工区` 是唯一被允许修改代码的真实工作区。它 = 当前已部署版本的完整解包（9446 个文件，由中央用官方 asar 解密而来）。
2. **产出落地（本协作最重要的一条，历史教训）**：
   - 你只改**自己职责范围内的文件**，改完把文件复制到 `03_产出区\<你的名字>\<模块名>\` 下，**保持与施工区一致的相对路径**（例如你改了 `dist/assets/index-D5I3iBTS.js`，就放到 `03_产出区\豆包\主题引擎\dist\assets\index-D5I3iBTS.js`）。
   - **"干了"不算完成，"落地+被黄区验收"才算**。你的成果必须真的被中央合并、打包、部署、跑起来。
   - 中央（Marvis）会定期：读取你的产出 → 合并进 `02_施工区` → 官方 `@electron/asar` 重打包 → 覆盖 `D:\应用\FlowyAIPC\resources\app.asar` → 重启玄枢 → 逐项验收 → 把结果（含截图/返工清单）写进 `05_状态` 和 `06_意见墙`。
3. **实时沟通**：每个工作日（或每完成一个模块）必须刷新 `05_状态\<你的名字>_STATUS.md`，格式见模板。有依赖、有问题、有不同意见，写到 `06_意见墙\<你的名字>_意见.md`。**不要埋头干完再一次性交**，要边做边交、边等验收反馈。
4. **接口契约**：需要跨模块配合的点（例如"会议总结调用本地模型"、"token 统计上报"、"模型三档切换）、统一以 `PLAN.md` 的《接口契约》章节为准（中央维护，会随进度更新）。契约没定下来的，先在 `06_意见墙` 提出，由中央拍板，**不要自行发明接口**。
5. **质量门槛（不达标直接返工）**：
   - 兼容性：不能用新构建工具、不能升级/篡改 `package.json` 依赖导致启动失败；改的是成品 bundle 里的代码，语法必须过 `node --check`（对纯 JS）、不得引入运行时崩溃。
   - 样式：UI 必须是 Semi Design 语言（`--semi*` 变量），风格与软件一致，不得放任自造风格。
   - 后端：需求说"要能用"就必须真的能走通（点按钮→调后端→有真实结果），不许做假按钮/占位。
   - 回归：你的改动不能破坏已经在做好的首页/其他已验收功能。
6. **红线**：不动 `.git`/密钥文件；不删老板的模型文件；不在施工区外乱建目录；不把厂商 token 写进代码；不引入任何需要联网的第三方依赖。

---

## 四、目录结构

```
E:\玄枢AI\玄枢三方AI协作\
├── 01_总纲\      README.md(本文件) / PLAN.md(方案排期契约) / 任务A_豆包.md / 任务B_WorkBuddy.md / 任务C_Trae.md / 老板意见模板.md
├── 02_施工区\    唯一真相基线（9446文件，200MB，中央维护）
├── 03_产出区\    豆包\ WorkBuddy\ Trae\   ← 各方的成品按相对路径放这
├── 04_集成区\    中央合并前的中转/合并补丁
├── 05_状态\      各参与方 STATUS + 中央 STATUS（验收进度）
├── 06_意见墙\    跨方意见/问答/老板意见
├── 07_部署产物\  重打包出的 app.asar / 便携版 / 安装包 最终交付物
└── 08_参考素材\  老板提供的设计图、图标原图等
```

## 五、不可覆盖的重要红线演进（老板最新指令覆盖旧红线）

- ~~禁玻璃态~~ → **新增全局"磨砂玻璃"主题能力（可调颜色 + 图片生成主题），这是老板点名的重点，必须做得成熟好用、质量高**（设置通用页里的主题替换面板）。其余 UI 仍是 Semi Design 语言。
- ~~厂商云端全断全删~~ → 保留这一条，同时按老板新指令**提供"云端模型 API 连接面板"**（老板自配供应商与密钥），并支持**纯本地 / 纯云端 / 智能调用三档**切换。
- 主模型收敛为 **Qwopus3.5-9B-Coder-MTP 一个**（Q4 或全精度待定），**不再用 2B 视觉模型**，视觉头用官方 mmproj-F32。

## 六、交付验收口径

最终验收 = 老板的 11 项需求清单（`PLAN.md` 第二节完整列出）+ 后端联调 + "真的能用"。中央用 `07` 编号一份《验收清单.md》逐项打勾，全部通过才算整体完成。
*（内容由AI生成，仅供参考）*
