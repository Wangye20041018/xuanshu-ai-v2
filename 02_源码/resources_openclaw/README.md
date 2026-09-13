# resources_openclaw（运行库引用说明）

本目录**不存放** OpenClaw 运行库实体，仅作结构占位，避免与 D 盘运行时重复占用空间。

OpenClaw agent 运行时与插件（微信/QQbot/钉钉等）的真实位置：
- `D:\应用\FlowyAIPC\resources\openclaw`
- `D:\应用\FlowyAIPC\resources\openclaw-plugins`
- `D:\应用\FlowyAIPC\resources\cli`

> 上述路径是运行时只读引用。只改客户端源码请到 `02_源码\app`；涉及 OpenClaw 插件的改动请通过中央协调，勿直接改 D 盘运行时。
