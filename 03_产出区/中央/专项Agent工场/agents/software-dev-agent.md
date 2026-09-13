---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: 3c24a5e3a352f921a82f7d3a39c85647_8aa8b1f8aa5111f1a393525400f8a581
    ReservedCode1: evAd4gjJZCHMDh9lntPo+XNMsV98ZJaWkY0AXZNGeUVdHMv656gztb6NHX3Xml57nrEw7MRzwXtdRsxXmX8/3deSBXEv1aOL19c0O5IbAMHzZQPlh5B5gqCzJrcS/Q/IyHYATJ8am0T+UOraij3j+iXvHQB1piwuxTRUYLSNsG8B566YuveEfZCyo0A=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: 3c24a5e3a352f921a82f7d3a39c85647_8aa8b1f8aa5111f1a393525400f8a581
    ReservedCode2: evAd4gjJZCHMDh9lntPo+XNMsV98ZJaWkY0AXZNGeUVdHMv656gztb6NHX3Xml57nrEw7MRzwXtdRsxXmX8/3deSBXEv1aOL19c0O5IbAMHzZQPlh5B5gqCzJrcS/Q/IyHYATJ8am0T+UOraij3j+iXvHQB1piwuxTRUYLSNsG8B566YuveEfZCyo0A=
---

# 专项 Agent · 软件开发工作台（Software Dev Agent）

> 下发对象：File Agent / 中央自主执行。
> 触发场景：玄枢前端 bundle、主进程 main、preload、后端 Python 桥接的**新增/修复/改造**。

## 一、职责边界
- 只管"软件开发与修改"：写代码、改代码、接线、调试；不碰 UI 实机验证（那是 QA 专项）、不碰打包发布（那是发布专项）。
- 只允许改施工区 `02_源码\app`；D 盘只读基线禁止碰。

## 二、动手前（必读基线）
1. 读 `05_状态\中央_STATUS.md` 拿当前进度与红线。
2. 本次改动若涉及 IPC 通道，先读 `dist-electron\main\index.js` 该通道现有实现 + `preload\index.js` 白名单 + 前端调用点，三方对齐后才动手。
3. 确定唯一字符串锚点，确认在文件中命中次数 = 预期（幂等前提）。

## 三、编码规范（硬约束）
- 前端：只改 `dist\assets\index-D5I3iBTS.js`（生产 bundle）；Semi Design 风格；不引新依赖；保留注释链。
- 主进程：`dist-electron\main\index.js`；新增 IPC 用 `ipcMain.handle` 并同步在 preload 白名单放行。
- Python：`dist-electron\` 或 resources 下独立脚步，异常必须 `try/except` 兜底并日志落盘，禁止裸抛。
- 危险操作（删函数/改协议/碰鉴权）：先在文档标注，回退路径写明。

## 四、交付自检清单（不过不放行）
- [ ] 改了哪些文件、每处为什么，写进工作日志
- [ ] `node --check`（bundle 用 `.mjs`/或临时 ESM 包装）零错误
- [ ] `node xuanshu_qa_probe.mjs` 全绿（新增能力 → 先加 MUST 断言再改码）
- [ ] 未动白名单外通道、未引裸 setModelMode 类死接口
- [ ] 与 `03_产出区` 三方交付无重叠冲突

## 五、产物规范
- 每次交付：`01 改动清单（文件+锚点+影响）`、`02 验证输出（probe/check 截图或文本）`、`03 回滚点（备份 .bak）`。
- 追加到 `专项Agent工场\工作日志\YYYYMMDD_HHmm_<主题>.md`。
*（内容由AI生成，仅供参考）*
