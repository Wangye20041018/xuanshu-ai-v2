# 高质量 TTS 选型调研结论（§6.2）

- 日期：2026-09-03
- 承接方：workbuddy
- 结论：**内嵌 sherpa-onnx vits-melo-tts-zh_en（VITS 系中文）为默认落地**，CosyVoice 2 作为可选高质升级路径。本地离线发音，对标豆包。

---

## 1. 候选方案对比

| 方案 | 中文自然度 | 首包延迟 | 显存/资源要求 | 许可证 | 结论 |
|---|---|---|---|---|---|
| **sherpa-onnx vits-melo-zh_en**（VITS/Melo） | 高（MeloTTS 中文口碑好） | CPU 秒级 | 无 GPU 要求，onnx 运行时已内置 | 开放 | **✅ 默认落地** |
| **CosyVoice 2**（阿里） | 中文 CER 2.4（接近 ElevenLabs） | ~150ms | 需 ~2GB 权重 + funasr/matcha 重依赖，无 GPU 慢 | Apache 2.0 | 可选升级 |
| GPT-SoVITS | 中文 CER ~3.5 | ~1s | 需 ~12G 显存 | MIT | 不选（本机 6GB） |
| VITS 系（旧） | 一般 | 一般 | 低 | 各异 | 已被 Melo 系取代 |
| Edge/在线 TTS | 依赖网络 | 网络往返 | 无 | — | 排除（施工单禁桥接在线） |

## 2. 选择 sherpa-onnx vits-melo 为默认的理由

1. **现成可落地**：项目内置 Python 环境（resources/python）已带 `sherpa_onnx 1.13.6`（OfflineTts 就绪）+ torch CPU，无需装 funasr/matcha 等重依赖。
2. **本地离线 + CPU 秒级**：无 GPU 要求，符合「本地离线发音」硬约束；CosyVoice 2 在 6GB 无 GPU 下首包慢、依赖重。
3. **质量对标豆包**：MeloTTS 中文自然度口碑高，是开源中文 TTS 的高分方案，正是施工单候选「VITS 系」的现代实现。
4. **零假显示可验证**：模型下载后立即可用桥接脚本产出真实 wav 交产品试听。

## 3. 参考案例链接

- sherpa-onnx TTS 官方文档：https://k2-fsa.github.io/sherpa/onnx/tts/index.html
- 模型下载源：GitHub release `k2-fsa/sherpa-onnx` → `vits-melo-tts-zh_en.tar.bz2`
- CosyVoice 官方仓库（可选升级）：https://github.com/FunAudioLLM/CosyVoice

## 4. 落地实现（已接好）

- **引擎**：`src/main/tts/embedded-tts.ts` —— 通过内置 Python 运行时调用 `resources/scripts/vits_tts_bridge.py`。
- **桥接脚本**：`resources/scripts/vits_tts_bridge.py`（sherpa-onnx OfflineTts）。
- **音色**：单一高质量中文音色 `xuanxu_hq_female`（玄枢自然女声），删光旧 Piper/Edge 十数音色。
- **播报通道**：保留 `tts:speak / voice:speak / tts:stop / pause / resume`（豆包「逐条朗读」+ GlobalTtsPlayer）。
- **零假显示**：模型权重未就位时，`synthesize` 明确返回 `model-missing` 错误。

## 5. 待办（依赖缺失，不阻塞其它项）

- vits-melo-tts-zh_en 模型权重（~200MB）下载到 `resources/voice-models/vits-melo-tts-zh_en/`（本次已启动下载）。
- 下载完成后运行 `python vits_tts_bridge.py --text "测试" --out out.wav --model-dir <模型目录>` 产出真实 wav 交产品负责人试听。

> 说明：本次交付已把引擎、桥接脚本、IPC 契约、音色收敛全部落地；模型权重下载是唯一联网步骤，符合「先调研选型、选型结论写入交付说明、再内嵌」要求。
