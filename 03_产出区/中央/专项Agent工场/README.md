---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: 3c24a5e3a352f921a82f7d3a39c85647_8998f18eaa5111f188bd525400287e28
    ReservedCode1: klq+yJPEk7QLOzdoMoOAddY0+LOQSIloxGlhZUYLF2gFQA/fYVICvF1l+xzZggaxtf2r1JwWyXgklrD5jM+9v1E9McxBAV84U9qtY8buvNif4hcBDOuXNS61UOMFQ6ovVSdgq8ecHipxZ6D6PicCjdwdSf5G0KndDTPkBUrQT3VDckL8SidNQLB48LM=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: 3c24a5e3a352f921a82f7d3a39c85647_8998f18eaa5111f188bd525400287e28
    ReservedCode2: klq+yJPEk7QLOzdoMoOAddY0+LOQSIloxGlhZUYLF2gFQA/fYVICvF1l+xzZggaxtf2r1JwWyXgklrD5jM+9v1E9McxBAV84U9qtY8buvNif4hcBDOuXNS61UOMFQ6ovVSdgq8ecHipxZ6D6PicCjdwdSf5G0KndDTPkBUrQT3VDckL8SidNQLB48LM=
---

# 玄枢AI · 专项开发 Agent 工场（中央自建，零成本补强）

> 定位：把"GP6 级别旗舰模型才能可靠完成的专项开发工作"**拆成可复用、带硬校验、能反复用现有执行体跑**的专项工作台。
> 原理：智商上限补不齐，但**流程纪律 + 自动断言 + 单一基线**可以把"一次跑对率"拉到可交付。老板不必为智商差多付钱，只需为"执行纪律"买单。

## 目录
- `agents/` — 专项 Agent 工作台模板（给现有 Sub Agent 的"执行授权书"）
- `scripts/` — 自动验证脚本（改一次跑一次）

## 已建专项
| 专项 | 模板 | 替代能力缺口 |
|---|---|---|
| 软件开发 Agent | `agents/software-dev-agent.md` | 长链路、大改动的一致性 |
| 代码审查 Agent | `agents/code-review-agent.md` | 一次性找全问题、防漏防伪 |
| 验收回归 Agent | `agents/qa-verify-agent.md` + `scripts/xuanshu_qa_probe.mjs` | 靠截图猜 → 靠断言证实 |

## 铁律（所有专项共享）
1. **先读基线再动手**：动手前必须读 `05_状态/中央_STATUS.md` 与项目索引，禁止凭记忆改。
2. **只动施工区**：`E:\玄枢AI\玄枢终代\02_源码\app`（读只基线 D 盘禁改）。
3. **幂等补丁**：唯一锚点 + count=1 + 可重放，禁止全文件重写。
4. **改动必过闸门**：每次交付必须 `node xuanshu_qa_probe.mjs` 全绿 + `node --check` 零错，否则不准说"完成"。
5. **留痕**：写完 `03_产出区\中央\专项Agent工场\工作日志\` 追加清单。
*（内容由AI生成，仅供参考）*
