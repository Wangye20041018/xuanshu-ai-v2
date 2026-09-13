---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: 3c24a5e3a352f921a82f7d3a39c85647_f1cc0905a9ee11f1be88525400aeaaa3
    ReservedCode1: VQ0VB+AvfJih53KMF/L3rHjfVJB+xX144MBj62oF3lxKDNSKSdVof4GqyBWZvAos6zkJ7nuiHPzM16oK4GfvT+Yo4yqB0sc1p2SBhAKtEH4rOHfTp8Z+gNGrQDxuR/jMFN68tEio8GThMSL+ZY9c4sceIRwTMocMbqgUUr4QZnncQgaTSeqRez0Rixk=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: 3c24a5e3a352f921a82f7d3a39c85647_f1cc0905a9ee11f1be88525400aeaaa3
    ReservedCode2: VQ0VB+AvfJih53KMF/L3rHjfVJB+xX144MBj62oF3lxKDNSKSdVof4GqyBWZvAos6zkJ7nuiHPzM16oK4GfvT+Yo4yqB0sc1p2SBhAKtEH4rOHfTp8Z+gNGrQDxuR/jMFN68tEio8GThMSL+ZY9c4sceIRwTMocMbqgUUr4QZnncQgaTSeqRez0Rixk=
---

# 中央预案 · Trae 停摆接管清单

> 触发条件：Trae 积分耗尽 / 中途停止推进（下一轮巡检无新产出即视为停摆）。
> 中央依据本清单：①检查 Trae 全部已交付物；②把未完成块转交剩余两方；③更新 Trae_STATUS 与中央 STATUS。

---

## 一、Trae 任务总览（2026-09-06 快照）

| 任务 | 内容 | 当前状态 | 交付位置 |
|---|---|---|---|
| T1 | 任务页：定时任务修复 | ✅ 已完成 v1 | `03_产出区\Trae\T1任务页\` |
| T2 | AI 视频页改造（删登录墙 / 时长自定义 / 云端未接入置灰） | ⏳ 刚开始，无交付物 | `03_产出区\Trae\T2视频页\`（应为） |
| T3 | 首页第一批改造核查（只查不改） | ⬜ 未动 | 报告到 STATUS 即可 |
| T4 | 快捷辅助小碎活（有余力再做） | ⬜ 未认领 | — |

---

## 二、已交付物检查结论（T1）

Trae T1 v1 交付完整，**无需他人接管**，检查结果：
- 交付物：`dist\assets\index-D5I3iBTS.js`（2.58MB）+ `CHANGES.md`
- 6 处定位式局部修改，均围绕"解除 Cron 与 Agent 强绑定"根因，说明清晰
- `node --check` 通过；未动 package.json / dist-electron / 未加依赖
- 需中央联调 4 点（A 空 agentId 放行 / B missing_agent 迁移 / C 链路统一 / D 日志回显）——属中央后端职责，不阻塞 T2/T3 推进

**结论：T1 保留 Trae 署名，直接进入中央联调验收，不转手。**

---

## 三、接管分配（Trae 停摆时执行）

### T2 · AI 视频页改造 → 转交 WorkBuddy
- **理由**：WorkBuddy 是功能页工程师（已干专家页/记忆/连接/会议，Semi 页面改造经验），积分余量最大（900），与 T2 改造性质最匹配。
- **交接要求**：按 Trae 任务单 T2 原文执行（删"需要登录"强制→无登录墙；云端模型未接入→相关按钮置灰+提示"需在 设置-模型-网关 接入云端 API"；视频时长自定义 3/5/10s 或手动输入带上限保护；不造假生成）。产出落 `03_产出区\WorkBuddy\T2视频页\`，含完整 bundle + CHANGES.md。
- **冲突规避**：WorkBuddy 的主责块 W1-W4 优先，T2 作为追加块排在其后；两处改同一 bundle，务必定位式局部改动，改完 node --check。

### T3 · 首页核查 → 中央代做（或转交豆包）
- **理由**：T3 只查不改，零积分成本，中央巡检时顺手核查即可（左侧 agent 会话改常规会话+自动调用 / 问候语玄枢专属 / 无购买星号、四快捷卡、导航头像、社区）。
- **兜底**：若中央无暇，豆包作为 UI 主力可代查，产出为核查报告落 `06_意见墙\豆包_T3首页核查.md`。
- **处置**：发现遗漏→报告给中央，不擅自大改；无遗漏→在验收清单 T3 打勾。

### T4 · 快捷辅助
- 直接废弃认领，中央按整体进度决定是否由豆包/WorkBuddy 顺手补，不做专门转交。

---

## 四、执行后动作

1. `05_状态\Trae_STATUS.md` 追加"⏹ 已停摆（积分耗尽），未完成块已转交"。
2. `05_状态\WorkBuddy_STATUS.md` 追加 T2 追加任务说明。
3. `05_状态\中央_STATUS.md` 记录本次接管。
4. 通知豆包/WorkBuddy 触发接管（若在途对话可行）。

---
*中央 · 2026-09-06*
*（内容由AI生成，仅供参考）*
