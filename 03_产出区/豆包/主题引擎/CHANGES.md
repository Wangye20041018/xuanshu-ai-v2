# A · 全局主题引擎 — CHANGES

产物：`dist/assets/index-D5I3iBTS.js`（= 当前最新施工区基线 + 仅 A 模块，可独立运行）

## 改了什么
1. 在 `const $q="theme"` 之前就近注入两段顶层代码：
   - `XSTheme` 运行时（IIFE 自启），暴露 `window.XSTheme`：getState/apply/save/reset/extractFromImage/listPresets/savePreset/removePreset/usePreset/subscribe。
   - 设置面板组件 `XsThemePanel`。
2. 在 设置→通用 外观卡（语言项之后）插入 `o.jsx(XsThemePanel,{})`。

## 能力
- 三模式：磨砂玻璃 glass / 纯色换肤 flat / 图片主题 image。
- 主色、辅色、模糊、面板不透明度、色调浓度、色彩饱和、圆角实时可调；8 预设 + 取色器 + HEX。
- Canvas 本地取色（≤256px 缩略，提取主/辅色 + 氛围背景），图片不出本机。
- 同时驱动 shadcn HSL 通道与 Semi `--semi-blue-*` RGB 通道；MutationObserver 跟随 html.light/dark 并补设 body[theme-mode]，修 Semi 暗色花脸。
- 毛玻璃只作用于静态卡片/弹层，消息流不 blur，防掉帧。
- 持久化：localStorage `xs:theme` + 双写 settings:setMany，启动 settings:getAll 读回，主进程过滤则 localStorage 兜底。

## 验证
- snippet 经 bal3 配平 + new Function 语法校验；A-only 产物 `node --check` 通过。
- 锚点 `const $q="theme"`、语言项锚点均唯一命中。

## 边界
只加前端；未改 css/main/preload；不新增依赖；消息流不做模糊。
