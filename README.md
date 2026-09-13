# 玄枢 · 终代（XuanShu AI）

本仓库为「玄枢」终代版本完整源码工程与开发资料归档。基于 FlowyAIPC 5.2.1 本地改造，注入本地推理引擎与多模态配方。

## 版本信息
- 产品版本：`xuanshu-ai` **5.2.1-release.0**
- 形态：Electron（FlowyAIPC 改装）+ 本地 llama.cpp 推理引擎 + 模型 recipes 多模态
- 主进程入口：`02_源码/app/dist-electron/main/index.js`（含引擎注入段）

## 目录结构
```
01_资料/           任务单、接口契约、老板意见模板
02_源码/app/       主应用工程（dist 渲染层 / dist-electron 主进程 / resources）
02_源码/resources_openclaw/   OpenClaw 资源
03_产出区/         各 Agent（Trae/豆包/中央）产出
04_集成区/         集成备份与补丁脚本
05_状态/           运行状态记录
06_意见墙/         需求与意见
07_部署产物/       部署验收清单与构建说明
08_参考素材/       设计参考
09_进度看板/       开发进度
```

## 说明
- 本仓库已剔除 `node_modules`（可依据 `02_源码/app/package.json` 重新安装）与超大部署包 `app_new10.asar`（214MB，见 `07_部署产物` 内说明）。
- 本地推理引擎路径：`C:\Users\24228\.herdsman\runtimes\llama.cpp\...`
- 主模型与视觉模型见 `dist-electron/main/index.js` 内 `model-recipes.json` 配置。
