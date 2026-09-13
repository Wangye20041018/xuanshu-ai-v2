---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: 3c24a5e3a352f921a82f7d3a39c85647_8bf60939aa5111f188bd525400287e28
    ReservedCode1: CGtJEjdzw/jFEaYkQ1t0EKgKRSLIMioS6l0t5i8EwC2JItF71hqk2ePKM6ZeJviACh+OUi4+Iv982Qy897kIsUOin7GTT7xXDIsQsV7I+ioD1djauJBEeE8MhUvhNttMlNXbJe5ljOO30ziqpc+LaqA8fpcmWEQfOuTGfbMG30vHx6Cw0sHAbeAhHog=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: 3c24a5e3a352f921a82f7d3a39c85647_8bf60939aa5111f188bd525400287e28
    ReservedCode2: CGtJEjdzw/jFEaYkQ1t0EKgKRSLIMioS6l0t5i8EwC2JItF71hqk2ePKM6ZeJviACh+OUi4+Iv982Qy897kIsUOin7GTT7xXDIsQsV7I+ioD1djauJBEeE8MhUvhNttMlNXbJe5ljOO30ziqpc+LaqA8fpcmWEQfOuTGfbMG30vHx6Cw0sHAbeAhHog=
---

# 专项 Agent · 验收回归工作台（QA Verify Agent）

> 下发对象：app-agent（UI 实机）+ 中央（断言自动）+ File Agent（代码核查）。
> 触发场景：任何一次打包/部署后、验收清单打勾前，必须过本闸门。

## 一、三层验证（由轻到重，全过才算"验收通过"）
### L1 静态断言（必跑，秒级）
```
node E:\玄枢AI\玄枢终代\03_产出区\中央\专项Agent工场\scripts\xuanshu_qa_probe.mjs
```
- 覆盖：输入框修复、豆包ABC、后端IPC通道、preload放行、残留归零。
- 退出码 0 = 静态层通过；新增能力必须**先加断言再改码**。

### L2 语法/构建（分钟级）
- bundle：`node --check`（ESM 包装）；main/preload：`node --check`。
- 后端 py：`python -m py_compile`.

### L3 实机冒烟（app-agent，人工判图兜底）
- 启动玄枢 → 逐验收清单项实测 → 截图（含顶部导航/页面正文/无红错）→ 主 Agent `analyze_image` 判真伪。
- UI 无法外部驱动时走降级：CDP/IPC 直呼 + 文件断言，并在报告标注"实机未覆盖"。

## 二、验收清单（对接 07_部署产物\验收清单.md）
| 层 | 手段 | 负责人 |
|---|---|---|
| 首页/专家/任务/记忆/连接/会议/AI视频/设置/通网/输入框/图标/云API/主题/token/启动 15 项 | L1+L2+L3 | 中央+app-agent |
## 三、判否红线（写"未通过"不得打勾）
- 白屏、无正文、红错、截图与用户实测不符、假实现（死通道当真功能）——一律 FAIL。
- 证据基准以用户底层观测（任务管理器 GPU / 实际输入输出）为最高优先级，Agent 单方面结论次之。
*（内容由AI生成，仅供参考）*
