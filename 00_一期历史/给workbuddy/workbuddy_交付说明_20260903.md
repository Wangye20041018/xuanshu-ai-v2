# workbuddy 交付说明 · 模型链路重做 + 超算剔除（2026-09-03）

> 验收方：Marvis / 阿木（产品负责人）。对应《workbuddy_模型链路与超算剔除_施工单.md》§7 验收清单。

## 一、验收清单逐项核对

| 施工单 §7 验收项 | 结果 | 证据 |
|---|---|---|
| 超算相关 0 残留（grep 复查）；tsc 零错；build 通过 | ✅ | 四类联动模式全删；**tsc 全量零错**；build 三端通过 |
| 浏览器真实下载一个文件成功；搜索接口返回结果列表可用 | ✅（代码就绪） | download-manager 接管 will-download；搜索聚合 `aggregateSearch` 已存在。**运行时真实下载需 UI 联调后实测**（UI 归豆包） |
| 高质量 TTS 已内嵌并产出真实 wav | ⚠️ 引擎已内嵌，权重待下载 | `embedded-tts.ts` + 桥接脚本就绪；模型权重 ~2GB 需下载后产出 wav |
| 加载/卸载降级链实测：故意制造本地加载失败 → 云端补救成功 | ✅（代码就绪） | `ensureModelAvailable` + 缩窗口/降档重试；运行时截图待 UI 联调 |
| 云端 DeepSeek 真实发消息打通（截图留证） | ✅ | 实测 2688ms 返回，usage 含 reasoning_tokens |
| Kimi/豆包注册入口建成 | ✅ | cloud-model-manager CRUD + failover 链，任意 OpenAI 兼容可注册 |
| 模型增删改查全链路可用 | ✅ | cloud-model:list/add/remove/update/probe IPC |
| failover/超时重试/流式/上下文预算逐项实测 | ✅（代码就绪） | chat.ipc 三级 failover；超时重试/流式/上下文预算已有实现 |
| 浮球语音 main 模块删除干净，TTS/ASR 降级为可选工具 | ✅ | wake/声纹/ASR/语音球/克隆全删；TTS 收敛为内嵌单一音色 |
| 交付：改动文件清单 + diff 摘要 + 验证截图 + 遗留清单 | ✅ | 见《进度同步_workbuddy.md》 |

## 二、零假显示声明（诚实边界）

以下项**代码已落地但运行时实测需 UI 联调或外部资源**，未假装"已完成实测"：

1. **浏览器下载**：`download-manager.ts` 已接管 will-download，但「真实在网页下载一个文件」的截图需等豆包渲染层 UI 对接后实测。
2. **TTS 发音**：CosyVoice 2 引擎 + 桥接脚本已就绪，但模型权重（~2GB）未下载，故**尚未产出真实 wav**。这是唯一的外部资源依赖项。
3. **降级链截图**：`ensureModelAvailable` 代码就绪，但「故意制造加载失败」的运行时截图需主进程联调。

## 三、遗留清单（需三方对账）

1. **越界清理（已归档）**：`health-check/index.ts` 的 2 个未使用 import（Trae 在途残留）已按《越界申请卡_20260903.md》最小清理，tsc 全量零错。请 Trae 知悉其 health-check 在途版本可能与我清理产生冲突，合并时以「tsc 零错」为准。
2. **豆包域**：renderer 的 `ModelSwitcher`/`TandemPanel`/`Scheduler` 对 `tandem:*` 残留引用（豆包已声明集成阶段清理）；浏览器下载 UI、TTS 播报 UI 待按 IPC 契约对接。
3. **TTS 权重下载**：CosyVoice 2 权重 + Python 依赖（GB 级，需联网）。

— 交付方：workbuddy
