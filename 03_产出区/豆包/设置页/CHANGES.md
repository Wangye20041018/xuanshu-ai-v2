# B · 设置页全套重构 — CHANGES

产物：`dist/assets/index-D5I3iBTS.js`（= 最新基线 + A 主题 + B 设置页，累计可运行）

## 改了什么（均为定点补丁，锚点唯一）
1. **掐匿名上报**：`Qt()` 删除动态 import + `invokeApi("telemetry:capture")` 网络段，仅保留 `$a()` 本地埋点；默认 `telemetryEnabled:!0→!1`。端点识别器 g9 与网关白名单中的同名字符串是防护/清单，保留。
2. **外观面板**：承接 A，外观卡后为 XsThemePanel。
3. **积分页 G_e → Token 页**（整函数替换）：`usage:recentTokenHistory(500)` 拉明细，前端按 provider 分本地/云端，聚合今日/近7日/累计/本地占比，明细表倒序；删除 buyPlan 与厂商定价跳转。
4. **模型-网关 S_e 末尾追加四卡**：XsLocalModelCard（xuanshu:inference status/start/stop/setModel/setContext，兼容 state 与 ready 两种返回，dialog:open 选 GGUF）、XsHardwareCard（CPU 线程/deviceMemory/WebGL GPU）、XsNetworkCard（onLine + Hn() 本地后端 state/port/重启）、XsCloudProviderCard（provider:list 仅显示是否已配置布尔，不碰密钥）。
5. **安全页 E_e 顶部插 XsHealthCard**：巡检遥测/本地后端/运行环境/本地推理/云端提供方数量，缺失如实标"未接入"。
6. **导航 W_e**：删 account、updates 两项（switch case 留作死代码）；credits→Token、feedback→关于。
7. **反馈页 $_e → 关于页**（整函数替换）：复用 about.* 三语文案与版权 C_e，显示 app:version/app:platform/Chromium、打开数据目录、本地优先与隐私说明。

## 验证
- 5 个 snippet 全部 bal3 配平 + new Function 通过；AB 累计产物 `node --check` 通过。
- 旧反馈占位 yq、旧 credits.noMoreData、account/updates 导航项残留均为 0；四卡/健康卡"定义 1 + 使用 1"。

## 降级与依赖
xuanshu:inference:* 未在 preload 放行时，相关卡轮询 catch 后显示"通道待接入"，不崩；详见「最终交付」第四节与 06_意见墙 的 preload 补放行清单。
