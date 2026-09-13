# CHANGES.md · WB-new1 AI 回复头像 = 圆形图标

> 模块：WB-new1 AI 回复头像 ｜ 作者：WorkBuddy ｜ 日期：2026-09-06
> 施工文件：`dist/assets/index-D5I3iBTS.js`（定位式局部修改）

## 一、改动摘要（已完成）

### 1. 圆形图标素材（中央已生成）
- `02_源码/app/dist/assets/icon-circle-32.png / 64.png / 128.png / 256.png / 512.png`
- `08_参考素材/icon-circle-32.png / 64.png / 128.png / 256.png / 512.png`
- 透明底圆形 PNG，圆外像素 α=0，圆内保留老板图标"白线人形"完整细节（人形居中、头部/双肩/躯干清晰可辨）。

### 2. 接入 bundle 中 AI 回复侧头像
- 定位：`chat-panel-message` 组件（bundle 偏移 ~1756381），分支 `if(!s)`（AI 侧）：
  - 原：`rounded-full` 圆 + 黑底白字"玄" 占位。
  - 新：`new URL("icon-circle-128.png", import.meta.url).href` 图片 + `rounded-full object-cover ring-1 ring-black/10`，`alt="玄枢"`。
- 中央 D1 已在另一处消息组件（bundle 偏移 ~2244200）接入同一圆形图标；本次补齐第二处。
- 用户侧头像未动（按任务要求，本次只改 AI 侧，用户头像删"我"字由中央 D2 负责）。

## 二、关键代码定位

| 位置 | 作用 |
|---|---|
| `icon-circle-32/64/128/256/512.png` | 圆形图标素材（生产包按需选择；本组件选 128） |
| `chat-panel-message`（~1756381）| 本次改造点（AI 回复头像分支） |
| `chat-panel-message`（~2244200）| 中央 D1 已接入（同一素材） |

## 三、需中央联调点

无新 IPC/契约；纯前端图片引用。

## 四、验证方式

- `node --input-type=module --check < dist/assets/index-D5I3iBTS.js` 通过（已验）。
- 在对话页/会话详情查看 AI 回复：头像显示圆形图标（透明底、白线人形居中），不再显示"玄"字占位。
- 用户头像保持不变（仍按中央 D2 走）。
