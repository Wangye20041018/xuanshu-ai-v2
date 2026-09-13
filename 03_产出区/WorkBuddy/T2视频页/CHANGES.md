# CHANGES.md · T2 AI 视频页改造（原 Trae，转交 WorkBuddy）

> 模块：T2 AI 视频页（路由 `/video`）｜ 作者：WorkBuddy（接盘自 Trae 停摆）｜ 日期：2026-09-06
> 施工文件：`dist/assets/index-D5I3iBTS.js`（定位式局部修改）

## 一、改动摘要（已完成）

### 1. 删除"需要登录"的强制（登录墙）
- 主组件 `L5e` 的创作器 `g5e`（`data-testid="video-workbench-hero-card"`）原用 `u=ht(ye=>ye.isLoggedIn)` 控制：
  - 「扩写」按钮 `disabled:!ee?.prompt||!u||Be` → 改为 `disabled:!ee?.prompt||cl===!1||Be`
  - 「生成」按钮 `disabled:!ee?.prompt||!u||$e` → 改为 `disabled:!ee?.prompt||cl===!1||$e`
  - 原登录提示条 `r("auth.loginRequired")` → 改为云端未接入提示。
- 移除 4 处提交函数的 authToken 校验（`if(!i/f/n)throw new Error(...auth.loginRequired)`）：
  - 创作器扩写提交 `oe`（`Wh({flowyAuthToken:i,...})`）
  - 创作器生成提交 `L`（`Wh({flowyAuthToken:f,...})`）
  - API 层 `l`（patch 任务）与 `submit`（`provider:"flowy-seedance"` 生成提交）各 1 处

### 2. 云端模型未接入 → 相关按钮置灰 + 提示
- 新增云端状态调用点（**已对齐中央 B0 放行通道**）：使用现成封装 `await oC()`（内部调 `provider:getDefault`，preload 已放行 + 返回云端 provider 对象）。
- `cl===!1` 时：扩写/生成按钮置灰，并显示提示条 **"需在 设置-模型-网关 接入云端 API"**（原 `auth.loginRequired` 位置）。有默认 provider（`y.id` 存在）→ `cl=true`，按钮可点；无默认 provider → `cl=false`，按钮置灰。

### 3. 视频时长自定义（带上限保护）
- 时长下拉（`Ae`，预设 `Qke=[5,10,15]` 秒）底部新增**手动输入**：`<input type="number">`，`min=1`、`max=Q.maxDurationSec??15`，占位「自定义秒数」，回车生效 `e.updateDraft({durationSec:v})` 并关闭下拉。

## 二、关键代码定位

| 组件/函数 | 作用 |
|---|---|
| `L5e` | 视频工作台主组件（路由 `/video` 由 `fz` KeepAlive 承载） |
| `g5e` | 创作器（输入/时长/参考素材/扩写/生成按钮，登录墙与云端门所在） |
| `Ae` | 时长下拉（预设 + 本次新增手动输入） |
| `Wh` | 视频生成 API（`flowyAuthToken`/`flowyModelId`/`provider:"flowy-seedance"`，云端调用点） |
| `getCloudStatus` | 云端接入状态调用点（本次新增） |

## 三、需中央联调点（已对齐中央 B0 preload 白名单）

1. **`provider:getDefault`**：中央已放行（preload 白名单 + main `oC()` 封装已就绪），返回默认云端 provider 对象；前端已用 `y?.id` 判定有无默认 provider 即视为是否接入。
2. **视频生成真实链路**：`Wh` 现走厂商 `flowy-seedance` + `flowyAuthToken`（登录已删，token 为空）。请中央将视频生成改走「模型-网关 / 用户云端 API」，前端 `Wh` 调用点为待替换处。
3. 后续如需更精细的"实时云端可用性"判定，可复用 `xuanshu:provider:test` / `xuanshu:system:health`，前端随时可切。

## 四、验证方式

- `node --input-type=module --check < dist/assets/index-D5I3iBTS.js` 通过（已验）。
- 打开 `/video`：无登录墙；未登录也能进入创作器；时长下拉可选手动输入（1-15 秒）。
- 云端未接入时（`getCloudStatus` 返回 `connected:false`）生成/扩写按钮置灰 + 提示"需在 设置-模型-网关 接入云端 API"。
