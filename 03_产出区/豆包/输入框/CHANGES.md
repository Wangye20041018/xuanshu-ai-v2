# C · 首页输入框 — CHANGES

产物：`dist/assets/index-D5I3iBTS.js`（= 最新基线 + A + B + C，即最终全量；与「最终交付」目录同源）

## 改了什么
1. 在原模型/专家下拉 `o.jsx(R$e,{className:"flex min-w-0 items-center"` 之前插入三档控件 `o.jsx(XsModelMode,{})`；组件定义就近注入。
2. 把语云弹层里的占位按钮（点击只弹"语音识别引擎待接入"）整体替换为真实录音组件 `o.jsx(XsYuyun,{onText,onDone,disabled})`，复用 composer 作用域的输入 setter `f`、当前值 `u`、弹层开关 `v`、禁用态 `r||a`。

## XsModelMode（本地 / 云端 / 自动）
- 分段 pill，高度 h-7 与原下拉对齐；偏好存 localStorage `xs:modelMode`（默认 auto）。
- 切换真实尝试 `setModelMode` 与 `xuanshu:model:setMode`（未放行即 catch，偏好本地保留，待中央补通道后联动）；每 4s 轮询 `xuanshu:inference:status`，本地档用绿/橙小点指示本地推理是否就绪。
- 不重写 R$e 复杂模型/专家下拉，不碰 @ agent picker。

## XsYuyun（语云做实，不造假）
- 按住：`window.asr_api.mixRecorderStart({onRecvData})` 真实采集，按钮变红脉冲，显示秒数与音频块计数；松开 `controls.stop(true)`。
- 之后尝试转写 IPC `xuanshu:asr:transcribe`，成功则把文字经 onText 追加回填输入框并关弹层。
- 转写通道当前未在 preload 放行：明确提示"已完成真实录音（时长/块数），转写通道待中央补登记"，**不生成任何假文字**。asr_api 缺失时按钮如实报"未提供录音接口"。

## 验证
- 两个 snippet 经 bal3 + new Function 通过；ABC 全量 `node --check` 通过。
- "语音识别引擎待接入"残留=0；XsModelMode/XsYuyun 定义与使用各 1；onText 回填正则 `/\s+$/` 转义正确。

## IPC 现状（"放行"后核对）
- preload 已放行 xuanshu:model:setMode、asr:mixRecorderStart/Pause/Resume/Stop，录音链路已完整（真实采集、停止落盘并回传路径）；三档只调 xuanshu:model:setMode（已删必失败的裸 setModelMode）。
- 仅余 main 待实现：xuanshu:model:setMode 的 handler、语音转写 xuanshu:asr:transcribe；补齐后三档联动与"松开自动出文字"即生效，前端无需再改。详见 06_意见墙清单。
