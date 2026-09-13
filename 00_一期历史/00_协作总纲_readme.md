---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: 3c24a5e3a352f921a82f7d3a39c85647_e1ff2a4ca79e11f1b87f525400461939
    ReservedCode1: wvfMoZsseV4OWkG6wOAsbYmUfrUS4NymuqooKhDsbRJ3s9WKE89GEQNXxqzSF8zE+yOdSBtnt2fcX/p1elyl0Kb28cdDDQxBCmRdmWLNLySbXoerLHbwcYI328zguWSiPDv5SyQO5MTHdtlax7Gd8NdFc0ZTHUP4fHoMPLFatpA5FjoYQOzvAZhE2Xg=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: 3c24a5e3a352f921a82f7d3a39c85647_e1ff2a4ca79e11f1b87f525400461939
    ReservedCode2: wvfMoZsseV4OWkG6wOAsbYmUfrUS4NymuqooKhDsbRJ3s9WKE89GEQNXxqzSF8zE+yOdSBtnt2fcX/p1elyl0Kb28cdDDQxBCmRdmWLNLySbXoerLHbwcYI328zguWSiPDv5SyQO5MTHdtlax7Gd8NdFc0ZTHUP4fHoMPLFatpA5FjoYQOzvAZhE2Xg=
---



> ⚠️【2026-09-06 二期开工通知】一期（9/3-9/4）任务已收口。老板下达 **11 项全量改造 + 后端联动** 新需求（含磨砂玻璃主题、模型-网关、云端API面板、三档切换、全局通网、图标等）。**所有参与方请以 `01_总纲\README.md`（协作总纲二期）与 `01_总纲\PLAN.md`（方案排期契约）为准**，执行 `01_总纲\任务A_豆包.md` / `任务B_WorkBuddy.md` / `任务C_Trae.md`。工作基线 = `02_施工区`（当前部署版完整解包，9446文件）。本目录下 `给豆包/给workbuddy/给Trae` 为一期历史任务单，仅作背景参考，不要照旧执行。

# 玄枢三方 AI 协作 · 总纲 README

- 建立日期：2026-09-03
- 项目根：E:\玄枢AI\xuanshu-ai-dev（v12.3.0，Electron32 + electron-vite2.3 + React18 + TS5.7 + Tailwind4 + Zustand5）
- 共享文件夹：本目录（E:\玄枢AI\玄枢三方AI协作\）
- 作用：Trae / workbuddy / 豆包 三方各自领取任务文档，彼此配合开发玄枢；产品负责人（阿木）后续新增需求直接并入各方完整任务文档。各方开工前必须先读最新版完整文档。

## 1. 当前在产的三方任务文档

| 承接方 | 文档 | 负责文件域 | 优先级 |
|---|---|---|---|
| Trae | `Trae_智能体重构_施工蓝本_v1.1.md` | src/main（agent/tool/编排/记忆/总调度/自检引擎）+ src/shared | P0 |
| workbuddy | `workbuddy_模型链路与超算剔除_施工单.md` | src/main（模型管理/推理/超算剔除/云端链路/浮球清理） | P0 |
| 豆包 | `豆包_UI任务单_完整版_v1.2.md` | src/renderer 全部 | P0（含全部 UI 优化清单，单一完整文档） |

## 2. 文件域隔离协议（防打架 · 铁律）

- **Trae**：只动 src/main 中与 agent 系统相关的文件 + src/shared + 自检引擎；禁动 renderer。
- **workbuddy**：只动 src/main 中与模型管理/推理/云端 provider/超算/浮球相关的文件 + 相关 shared；禁动 renderer。
- **豆包**：只动 src/renderer；禁动 src/main 与 src/shared 的业务逻辑（可读）。
- **越界处理**：任何一方需要动对方领域的文件，先在此文件夹写一张"越界申请卡"（`越界申请卡_日期.md`），由产品负责人拍板后再动；擅自越界一律标红退回。
- **时序豁免**：若任务之间无文件交集，可并行；一旦两份文档出现"同一文件都要改"的冲突，先到先占、后到方在本文件夹声明"冲突锁定"，等前一方交付验收后再接手。

## 3. 需求补充流程（重要 · 单份完整原则）

- **每方只交付一份"该承接方"的完整任务文档**（Trae→`Trae_智能体重构_施工蓝本_v1.1.md`；workbuddy→`workbuddy_模型链路与超算剔除_施工单.md`；豆包→`豆包_UI任务单_完整版_v1.2.md`）。**所有需求一次性写入该份文档**，禁止再出现"第二份、第三份补充卡"导致信息分散、读不全。
- 产品负责人后续新增/修改需求：直接**并入对应承接方的那一份完整文档**（在相关章节追加并标注日期）。若实在放在"给XX"文件夹，也必须在总纲标注并入时间，最终仍以完整文档为准。
- 写入需求时写明：归属方、需求正文、希望交付形式、验收口径。
- 各方开工/更新代码前，**必须**重读自己那份完整文档是否在本轮被更新；未读最新需求就动工视为失职。

## 4. 交付与验收口径（对三方统一）

1. 改动真实落盘，交付物含：改动文件清单 + diff 摘要 + 验证结果。
2. `npx tsc --noEmit` 零错 + `npm run build` 通过 + 关键链路运行时实测。
3. 零假显示：一切声称完成的能力必须有真实可验证证据；做不出的明确写"未实现/依赖缺失/建议路径"，禁止空壳。
4. 验收由 Marvis / 产品负责人执行；验收未过一律打回，不留半成品。

## 5. 进度同步

- 各方完成阶段性交付后，在本文件夹写 `进度同步_<承接方>.md`（更新到哪个文档、完成哪些验收项、下一步）。
- 冲突、疑问、依赖他人项，写在本文件夹，避免各干各的。
*（内容由AI生成，仅供参考）*
*（内容由AI生成，仅供参考）*
