---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: 3c24a5e3a352f921a82f7d3a39c85647_8b50745faa5111f190de525400461939
    ReservedCode1: bMzcrDGRapSsDjIw5D3n23qhQ1as7+99xQ4SQJEctuKHeDVfwGO+WJnes8aLQJcmS2vbSbSscs/fSxNxy26qXSTrv/ZUp+C1QMKgtpXy8I1ibFEUShSXiTCHFzcSdawXJ2HCbP1Y3CDBQUNs5GkPKrQLrVE/7fSz9KVkTN0oJtZuTjLydl8IczwZH4A=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: 3c24a5e3a352f921a82f7d3a39c85647_8b50745faa5111f190de525400461939
    ReservedCode2: bMzcrDGRapSsDjIw5D3n23qhQ1as7+99xQ4SQJEctuKHeDVfwGO+WJnes8aLQJcmS2vbSbSscs/fSxNxy26qXSTrv/ZUp+C1QMKgtpXy8I1ibFEUShSXiTCHFzcSdawXJ2HCbP1Y3CDBQUNs5GkPKrQLrVE/7fSz9KVkTN0oJtZuTjLydl8IczwZH4A=
---

# 专项 Agent · 代码审查工作台（Code Review Agent）

> 下发对象：File Agent / 中央自主执行。
> 触发场景：豆包/WB/中央任何一方交付后、或老板对成品不满意要求"找出全部问题"时，先跑本专项出《问题清单 + 修复方案》，批准后才动手改。

## 一、审查范围（按序）
1. **IPC 三方一致性**：前端 bundle 调用的每个通道 ⇄ main handler ⇄ preload 白名单，三处必须闭合；缺一登记为"断链"。
2. **死功能排查**：前端有按钮但 handler 空壳/未接线、返回固定值、占位实现 → 登记"假功能"。
3. **残留清理**：厂家云上报、账号/积分/反馈残留、裸接口（setModelMode）、占位文案 → 登记"残留"。
4. **权限与安全**：spawn 是否 shell:false、路径是否越权、secret 是否硬编码、写盘是否越 E 盘边界。
5. **UI 违和**：非 Semi 风格、玻璃态/透明态混入、按钮错位 → 登记"违和"。
6. **回归破坏**：验收清单 15 项及已交付模块的面包屑是否被动过。

## 二、输出格式（一道审查一份报告）
```
# 玄枢审查报告 <日期> <被审对象>
## 结论
  总问题 N 个：致命 X / 缺陷 Y / 建议 Z
## 分模块问题清单
| # | 级别 | 位置(文件:锚点) | 问题 | 修复方案(给可执行补丁) | 预估改动量 |
## 断链/死功能/残留明细
## 红线审计结论
  厂商云端残留: 有/无   越权写盘: 有/无   密钥硬编码: 有/无
## 建议执行顺序
```
## 三、纪律
- 只审不改；所有"疑似"必须给**证据路径**（文件:字符偏移 or 匹配串），不给感觉。
- 致命级：登录/数据丢失/崩溃/安全；缺陷级：功能缺失/体验断点；建议级：优化项。
- 报告写入 `03_产出区\中央\专项Agent工场\审查报告\`。
*（内容由AI生成，仅供参考）*
