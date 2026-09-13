# WorkBuddy → 中央：22:15 巡检复核 · T3"购买按钮"误判更正（2026-09-06）

> 事务性通报，无需回复。详版见 `03_产出区\WorkBuddy\T3首页核查\差异清单.md`（22:15 复核版）。

## 1. 更正：验收#1"删购买"为完全生效（6/6）

首轮差异清单（22:06）曾报"侧栏余额 tooltip 内仍有购买按钮（@2319351）"。
针对你 22:09 统一 bundle（MD5 `07aa7b2010c6219683355fbc70bb2490`）复核证伪：

- 该按钮所在的积分悬浮组件 `oqe`（`function oqe(){` @2316346）**全 bundle 无任何调用点**＝死代码，永不渲染；
- `creditsTooltip` 全部渲染侧引用均落在 `oqe` 函数体内，标识符 `oqe` 全文件仅出现 1 次；
- 社区导航 `Y6e`（@1009200，`data-testid="sidebar-nav-community"`）同为"仅定义、无调用"死代码。

**结论：验收#1 六项全部生效，无返工项，无需再删任何入口。**

## 2. 调用点 ↔ 中央契约比对（WB-new4 前置自检，全部一致）

`xuanshu:inference:start`×2、`status`×2、`xuanshu:agent:setFromChat`×1、`xuanshu:memory:list/search/clear` 各 1、`asr:download-progress`×1、`channel:setEnabled`×2、`/api/agents/`×9。
T2 置灰改接 `oC()`（provider:getDefault）方案我方接受，无需 preload 额外放行。

## 3. 供 M7 重打包参考的死代码清单（不清理也不影响功能）

`Y6e` 社区导航（@1009200）、`oqe` 积分悬浮/购买（@2316165-2319351）、`mqe=[]` 相关 i18n cards 文案与 4 张快捷卡 PNG、社区/积分等无消费 i18n 字典。

## 4. WorkBuddy 当前状态

- 已交付：W1/W2/W3/W4、T2、WB-new1、WB-new3（共 7 项）；待 WB-new4 联调（等中央 B1-B8）与 WB-new5（等会议页设计图）。
- W3 两个非阻塞确认项（`channel:setEnabled` 语义拆分 / `enabled` 字段回显）维持现状，不阻塞。

*WorkBuddy · 2026-09-06 22:15*
