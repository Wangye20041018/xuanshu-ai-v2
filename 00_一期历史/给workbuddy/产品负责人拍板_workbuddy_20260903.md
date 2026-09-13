---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: 3c24a5e3a352f921a82f7d3a39c85647_06fed3c7a7a711f1b87f525400461939
    ReservedCode1: g+8SvOC+bIkFSwoLgECzYTSdOxpKWK7q8nK/kSfLF8zyTKuIrpHgBeTMtpgXd94/TmwkO474CJV//Als8e9tqywBh41cC98hd/118BIypRzggLDHIMX/p+mgHf4MdYRhzYtMTC/NdixFAJ1QUzvjuMGh6Ms9RdL6gvfdoYiDUwFwsu2P3bE8ghzoasY=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: 3c24a5e3a352f921a82f7d3a39c85647_06fed3c7a7a711f1b87f525400461939
    ReservedCode2: g+8SvOC+bIkFSwoLgECzYTSdOxpKWK7q8nK/kSfLF8zyTKuIrpHgBeTMtpgXd94/TmwkO474CJV//Als8e9tqywBh41cC98hd/118BIypRzggLDHIMX/p+mgHf4MdYRhzYtMTC/NdixFAJ1QUzvjuMGh6Ms9RdL6gvfdoYiDUwFwsu2P3bE8ghzoasY=
---

# 产品负责人拍板 · workbuddy（2026-09-03）

对应《workbuddy_盘点与改造方案_v1.0.md》§9 的 4 个阻塞点，裁决如下，收到即可按 §8 顺序继续动工，无需再等。

## 1. 超算剔除方案 → **批准方案 A（去概念 + 保推理能力）**
本地推理引擎是玄枢的命根子（本地算力终端定位），**绝不允许砍掉本地推理**。彻底删除 tandem-manager 的方案 B 否。按方案 A 执行：删 dualAnswer/partner/mentor/debate 四类联动模式，保留并重构 startServer/stopServer/queryModel/getServerStates 为单一本地推理引擎，作为 §3 加载/卸载重构与云端补救的载体。

## 2. renderer 超算 UI —— 你不用写越界申请卡
豆包已在《豆包_UI交付报告_v1.0.md》中自行移除了 renderer 侧超算按钮与联动 UI（Home/ChatPanel），剩余 ModelSwitcher/TandemPanel/Scheduler 的 tandem 残留待你 main 侧落地后由集成阶段统一清理。你专注 main 侧即可。

## 3. TTS 选型 → 授权你按调研结论自选
中文场景优先：**CosyVoice 2 或 GPT-SoVITS 二选一**，选型结论（参考案例链接 + 理由 + 试听 wav）写入交付说明，交产品试听。质量必须对标豆包，不做降级、不桥接在线。

## 4. 云端 key —— 先自查再定
先检查项目现有配置里是否已有可复用的 deepseek key（你盘点时见过尾号 0ef2 的那个，若在配置中直接复用实测）。若确实没有可用 key，在交付说明标"待提供 key"，**不阻塞其它项**；产品负责人另行为你补充。

## 提醒
- 豆包第一阶段（删除清理类）已完成，tsc + build 双通过。你动 main 时注意与她的 renderer 改动无冲突（她只动了 renderer）。
- 浏览器下载管理（§6C）、高质量 TTS（§6.2）的 IPC 契约写好后，通知豆包按《豆包_UI任务单_完整版_v1.2.md》对接，字段以你为准。
- 每步交验，不攒尾；验收硬门槛见你施工单 §7。

— 产品负责人：阿木 / Marvis
*（内容由AI生成，仅供参考）*
