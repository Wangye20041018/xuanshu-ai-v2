---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: 3c24a5e3a352f921a82f7d3a39c85647_2fdce42ba9e611f190de525400461939
    ReservedCode1: SdawzGfkcaIeD3byYrk5wVS4iKIbucuEkDuyR52FXvBzTYb8YYVCpX4plf04Ujq9Il+WlQ/tGdT2+wNGAHEL9gwVTfZ4XZXwY3CVfxEIyUa8P41sNMgKAoU6netDJnsKn2CAE8t9HEgK92PLKXXKzLrn0pZXogT78sBtz81ftMLfvAKk1qlIloDrrk0=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: 3c24a5e3a352f921a82f7d3a39c85647_2fdce42ba9e611f190de525400461939
    ReservedCode2: SdawzGfkcaIeD3byYrk5wVS4iKIbucuEkDuyR52FXvBzTYb8YYVCpX4plf04Ujq9Il+WlQ/tGdT2+wNGAHEL9gwVTfZ4XZXwY3CVfxEIyUa8P41sNMgKAoU6netDJnsKn2CAE8t9HEgK92PLKXXKzLrn0pZXogT78sBtz81ftMLfvAKk1qlIloDrrk0=
---

# 任务文件 · WorkBuddy（DeepSeek V4 Pro · 0.51 倍 × 900 积分）

> 收件人：WorkBuddy AI 编程助手。请先读 `01_总纲\README.md`（协作规则）与 `01_总纲\PLAN.md`（方案/契约/排期），再执行本任务。你负责 **4 个功能页的完整改造**，注意额度有限（0.51 倍折扣、剩 900 积分），**按下面顺序一次做对、少返工**，每做完一页先交中央验收再开下一页。

---

## 0. 你的角色

你是玄枢AI（FlowyAIPC 改版，Electron + React 成品 bundle 直接改）的功能页工程师。你只改渲染 bundle 中你职责范围内的模块代码区：`E:\玄枢AI\玄枢三方AI协作\02_施工区\dist\assets\index-D5I3iBTS.js`（2.58MB 单文件 React 生产包）。

⚠️ **只做定位式局部修改**：不全文格式化、不改文件头、不升级依赖、不碰 `package.json`、不动 `dist-electron`。改完 `node --check` 校验语法再交付。**你的成果必须落到产出区被中央合并部署，才算真的干了。**

---

## 一、你负责的 4 大块（按顺序执行）

### W1. 专家页卡片化（老板需求 2）—— 最先做

- 把所有**专属 agent（我们已有的那些，如 productivity/developer 等本地 agent）以卡片形式展示**，页面风格用软件自身风格语言（Semi Design）。
- 每张卡片带：**删除** 与 **停用** 按钮。
  - 删除 → **必须二次确认**（弹确认框，明确后果提示）。
  - 停用 → 立即生效，卡片呈现停用态，可再启用。
- 页面提供**添加 agent 窗口**：可新建自定义 agent（名称/头像/描述/能力配置）。
- **首页 AI 对话里能提需求设计 agent**：在首页对话中让玄枢设计一个新 agent → 确认后能**自动加入专家页**并成为可调用会话。这个联动中央会在后端 IPC 上配合你，你按契约5 / 意见墙发布的 `setAgentFromChat(...)` 接口接入；接口未定前先把前端调用点留好并注明。
- 需要真实持久化：添加/改名/停用/删除要真的写进运行期 agent 配置（中央定存哪：倾向 `AppData\FlowyAIPC` 下），重启不丢。

### W2. 知识库 → 记忆（老板需求 4）

- 把"知识库"改名/重构为 **"记忆"**，内部拆成两个库：**记忆** 与 **知识**。
- 两者定位（供你设计 UI/交互参考）：记忆 = 对话性与用户有关的动态上下文（自动沉淀）；知识 = 用户主动导入的文档/资料，可检索问答。
- 每块独立：上传/添加、列表、检索入口、详情、清空/删除。真实落库（中央负责定存储层后告知，你先把 UI 与 IPC 调用点做好），检索结果真实返回（IPC 接口按合同给你）。
- 避免把两块混在一起、界面清晰。

### W3. 频道 → 连接（老板需求 5）

- "频道"页改为 **"连接"** 页。
- **保留并强化 WeChat（微信）**：连接状态清晰展示、扫码/授权入口、消息同步开关、断线重连。
- **QQbot**：保留，**不强制绑定 agent**（可独立配置使用）。
- 与 OpenClaw 插件（`resources\openclaw-plugins\openclaw-weixin`、`qqbot`）联动，状态反映真实连接。
- 其他原有连接项按现状保留或清理（砍掉不用的，别把人家搞坏）。

### W4. 会议页改造（老板需求 6）

- 按老板给的设计图改布局（图片素材在 `08_参考素材\`，如果缺请立刻向中央要，**不要凭想象做**）。
- **去掉"会议人数"设定**。
- **转文字模型内置下载**：转写能力所需的模型改为本地内置、可下载完成后离线使用（下载进度/状态 UI），不再依赖登录。
- **总结由玄枢主模型完成**：转写文本 → 调本地推理（玄枢主模型 Qwopus3.5-9B）生成会议总结，走《PLAN 契约1》《契约4》的 IPC 接口（中央保证端点就绪）；接口未就绪时先留调用点。

---

## 二、落地要求

- 产出放：`E:\玄枢AI\玄枢三方AI协作\03_产出区\WorkBuddy\W1专家页\`、`W2记忆\`、`W3连接\`、`W4会议\`，每模块一个子目录。
- 每模块内含：① 修改后的 `dist\assets\index-D5I3iBTS.js`（完整文件）；② `CHANGES.md`（改动位置、依赖 IPC、需中央联调点）。
- 严格按 W1→W2→W3→W4 顺序，**每完成一页立即交付**并在 `05_状态\WorkBuddy_STATUS.md` 更新，等中央部署验收反馈后再做下一页，避免返工连锁。

## 三、质量标准（中央按此验收）

- 专家页：卡片美观（Semi 风格）、删/停/加真实生效、二次确认弹窗、首页设计 agent 能自动加入；
- 记忆页：记忆/知识两块清晰、数据真实读写可检索、样式统一；
- 连接页：微信/QQbot 状态真实、不强制绑 agent、断线重连可用；
- 会议页：符合设计图、无人数设定、转写模型本地可用、总结由玄枢主模型生成；
- 全程不破坏已验收 UI；`node --check` 通过；不新增依赖。

## 四、你的时间线

- 第1天：读文档 + 输出《专家页数据设计》到 `06_意见墙\WorkBuddy_专家页设计.md`（卡片字段、agent 数据结构、与首页对话联动方案），同时梳理 W2/W3/W4 需要的 IPC，发依赖声明。
- 第2~3天：W1 专家页交付。
- 第3天：W2 记忆页交付。
- 第4天：W3 连接页交付。
- 第4~5天：W4 会议页交付。
- 第5~8天：按返工清单修复，配合联调。

## 五、状态文件模板（05_状态\WorkBuddy_STATUS.md）

```
# WorkBuddy状态
- 当前阶段: T1主开发
- 已完成:
  - [W1专家页] v1 交付 @ 时间 —— 落03_产出区\WorkBuddy\W1专家页
- 进行中: W2记忆页
- 阻塞/依赖: 首页agent自动加入 IPC 未发布，W1已留调用点
- 已发意见墙: 《专家页设计》《依赖声明》
- 下一步: ...
```

## 六、注意与禁忌

- 严禁：动 `dist-electron/main/index.js`、`package.json`、格式化 bundle、引外部依赖、删除模型文件、向厂商云发流量。
- 素材缺失（如会议设计图）立即向中央要，不硬编假布局。
- 疑问随时发 `06_意见墙`，中央每日同步至少一次。
*（内容由AI生成，仅供参考）*
