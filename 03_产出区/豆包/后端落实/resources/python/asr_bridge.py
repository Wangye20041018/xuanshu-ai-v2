#!/usr/bin/env python3
"""
玄枢 AI — ASR 桥接脚本
=======================
接受命令行参数进行语音识别，支持 SenseVoice (sherpa-onnx) 引擎。

用法:
    python asr_bridge.py --model sensevoice --input audio.wav

输出: JSON 格式的识别结果到 stdout
{
    "status": "ok",
    "text": "识别文本",
    "confidence": 0.95,
    "emotion": "neutral",
    "audio_events": []
}
"""

import argparse
import json
import os
import sys
import traceback
import warnings

warnings.filterwarnings('ignore')


# ---------------------------------------------------------------------------
# 工具函数
# ---------------------------------------------------------------------------

def output_json(status: str, **kwargs):
    """输出 JSON 结果到 stdout"""
    result = {"status": status}
    result.update(kwargs)
    print(json.dumps(result, ensure_ascii=False))
    sys.stdout.flush()


def error_exit(msg: str):
    """输出错误并退出"""
    output_json("error", error=msg)
    sys.exit(1)


# ---------------------------------------------------------------------------
# SenseVoice / sherpa-onnx 识别
# ---------------------------------------------------------------------------

def recognize_sensevoice(audio_path: str):
    """使用 sherpa-onnx 进行离线语音识别"""
    try:
        # 尝试方法 1: 使用 sherpa-onnx Python 包
        try:
            result = recognize_with_sherpa_onnx_python(audio_path)
            if result:
                return result
        except Exception:
            pass

        # 尝试方法 2: 使用 sherpa-onnx 命令行工具
        try:
            result = recognize_with_sherpa_onnx_cli(audio_path)
            if result:
                return result
        except Exception:
            pass

        # 尝试方法 2.5: SenseVoice 缺失时回退到 Paraformer-zh（同为 sherpa-onnx 离线引擎）
        try:
            result = recognize_with_paraformer_python(audio_path)
            if result:
                return result
        except Exception:
            pass

        # 方法 3: 降级方案 - 使用声音特征分析返回基本信息
        result = fallback_recognize(audio_path)
        return result

    except Exception as e:
        error_exit(f"ASR 识别失败: {str(e)}\n{traceback.format_exc()}")


def recognize_with_sherpa_onnx_python(audio_path: str):
    """使用 sherpa-onnx Python 包进行识别"""
    try:
        import sherpa_onnx
        import numpy as np
        import wave
        import struct

        # 创建一个简单的识别器配置
        # 需要提前下载模型文件到指定路径
        model_dir = os.environ.get("SENSEVOICE_MODEL_DIR", "")
        if not model_dir:
            # 尝试常见位置
            candidates = [
                os.path.join(os.path.dirname(__file__), "..", "voice-models", "sensevoice-small"),
                os.path.join(os.path.expanduser("~"), "AppData", "Roaming", "xuanshu", "voice-models", "sensevoice-small"),
            ]
            for c in candidates:
                if os.path.exists(c):
                    model_dir = c
                    break

        if not model_dir or not os.path.exists(model_dir):
            raise FileNotFoundError("SenseVoice 模型目录未找到")

        # 读取 WAV 文件
        with wave.open(audio_path, 'rb') as wf:
            sample_rate = wf.getframerate()
            n_frames = wf.getnframes()
            audio_data = wf.readframes(n_frames)

        # 转换为 float32 数组
        if wf.getsampwidth() == 2:
            samples = np.frombuffer(audio_data, dtype=np.int16).astype(np.float32) / 32768.0
        else:
            samples = np.frombuffer(audio_data, dtype=np.int16).astype(np.float32) / 32768.0

        # 创建识别器（适配 sherpa-onnx >=1.13 的 from_sense_voice 工厂方法）
        try:
            recognizer = sherpa_onnx.OfflineRecognizer.from_sense_voice(
                model=os.path.join(model_dir, "model.onnx"),
                tokens=os.path.join(model_dir, "tokens.txt"),
                num_threads=2,
                language="auto",
                use_itn=True,
            )
        except (TypeError, AttributeError):
            # 兼容旧版 API：OfflineRecognizer(OfflineRecognizerConfig(...))
            recognizer = sherpa_onnx.OfflineRecognizer(
                model=sherpa_onnx.OfflineModelConfig(
                    sense_voice=sherpa_onnx.OfflineSenseVoiceModelConfig(
                        model=os.path.join(model_dir, "model.onnx"),
                    ),
                    tokens=os.path.join(model_dir, "tokens.txt"),
                    model_type="sense_voice",
                ),
                recognition_config=sherpa_onnx.OfflineRecognizerConfig(
                    decoding_method="greedy_search",
                ),
            )

        # 创建音频流
        stream = recognizer.create_stream()
        stream.accept_waveform(sample_rate, samples)
        recognizer.decode_stream(stream)

        # 获取结果
        result_text = stream.result.text if hasattr(stream.result, 'text') else str(stream.result)

        output_json("ok", text=result_text, confidence=0.9, method="sherpa_onnx_python")
        return True

    except ImportError:
        raise
    except Exception as e:
        raise Exception(f"sherpa-onnx Python 识别失败: {str(e)}")


def recognize_with_sherpa_onnx_cli(audio_path: str):
    """使用 sherpa-onnx 命令行工具进行识别"""
    import subprocess
    import shutil

    # 检查 sherpa-onnx-offline 命令是否可用
    sherpa_cli = shutil.which("sherpa-onnx-offline")
    if not sherpa_cli:
        # 尝试常见路径
        candidates = [
            os.path.join(os.path.dirname(sys.executable), "Scripts", "sherpa-onnx-offline.exe"),
            os.path.join(os.path.dirname(__file__), "..", "sherpa-onnx-offline.exe"),
        ]
        for c in candidates:
            if os.path.exists(c):
                sherpa_cli = c
                break

    if not sherpa_cli:
        raise FileNotFoundError("sherpa-onnx-offline 命令未找到")

    model_dir = os.environ.get("SENSEVOICE_MODEL_DIR", "")
    if not model_dir:
        candidates = [
            os.path.join(os.path.dirname(__file__), "..", "voice-models", "sensevoice-small"),
            os.path.join(os.path.expanduser("~"), "AppData", "Roaming", "xuanshu", "voice-models", "sensevoice-small"),
        ]
        for c in candidates:
            if os.path.exists(c):
                model_dir = c
                break

    if not model_dir:
        raise FileNotFoundError("SenseVoice 模型目录未找到")

    # 执行命令行工具
    result = subprocess.run(
        [sherpa_cli, "--model-dir", model_dir, "--input-file", audio_path],
        capture_output=True,
        text=True,
        timeout=30,
    )

    if result.returncode != 0:
        raise Exception(f"sherpa-onnx CLI 失败: {result.stderr}")

    # 解析输出
    output = result.stdout.strip()
    if not output:
        raise Exception("sherpa-onnx CLI 无输出")

    # 尝试解析 JSON 输出
    try:
        data = json.loads(output.split('\n')[-1])
        text = data.get("text", "")
        confidence = data.get("confidence", 0.9)
        emotion = data.get("emotion")
        audio_events = data.get("audio_events")
    except (json.JSONDecodeError, IndexError):
        # 非 JSON 输出，直接作为文本
        text = output.split('\n')[-1].strip()
        confidence = 0.8
        emotion = None
        audio_events = None

    result_data = {"text": text, "confidence": confidence, "method": "sherpa_onnx_cli"}
    if emotion is not None:
        result_data["emotion"] = emotion
    if audio_events is not None:
        result_data["audio_events"] = audio_events

    output_json("ok", **result_data)
    return True


def _voice_model_dir(sub):
    here = os.path.dirname(os.path.abspath(__file__))
    home = os.path.expanduser("~")
    for c in [
        os.environ.get("XS_VOICE_DIR", ""),
        os.path.join(here, "..", "voice-models", sub),
        os.path.join(home, "AppData", "Roaming", "xuanshu", "voice-models", sub),
        os.path.join(home, "AppData", "Roaming", "FlowyAIPC", "voice-models", sub),
    ]:
        if c and os.path.isdir(c):
            return c
    return ""


def recognize_with_paraformer_python(audio_path: str):
    """SenseVoice 缺失时，使用 sherpa-onnx Paraformer-zh 离线识别"""
    import sherpa_onnx
    import numpy as np
    import wave

    mdir = _voice_model_dir("paraformer-zh")
    if not mdir:
        raise FileNotFoundError("paraformer-zh 模型目录未找到")
    model = None
    for name in ("model.int8.onnx", "model.onnx"):
        p = os.path.join(mdir, name)
        if os.path.exists(p):
            model = p
            break
    tokens = os.path.join(mdir, "tokens.txt")
    if not model or not os.path.exists(tokens):
        raise FileNotFoundError("paraformer-zh 缺少 model.onnx / tokens.txt")

    recognizer = sherpa_onnx.OfflineRecognizer.from_paraformer(
        paraformer=model, tokens=tokens, num_threads=4, provider="cpu",
    )

    with wave.open(audio_path, 'rb') as wf:
        sample_rate = wf.getframerate()
        n_channels = wf.getnchannels()
        audio_data = wf.readframes(wf.getnframes())
    samples = np.frombuffer(audio_data, dtype=np.int16).astype(np.float32) / 32768.0
    if n_channels > 1:
        samples = samples.reshape(-1, n_channels).mean(axis=1)

    stream = recognizer.create_stream()
    stream.accept_waveform(sample_rate, samples)
    recognizer.decode_stream(stream)
    text = stream.result.text if hasattr(stream.result, 'text') else str(stream.result)
    output_json("ok", text=(text or "").strip(), confidence=0.9, method="paraformer_python")
    return True


def fallback_recognize(audio_path: str):
    """降级识别：分析音频文件的基本特征"""
    import wave
    import struct
    import math

    try:
        with wave.open(audio_path, 'rb') as wf:
            n_channels = wf.getnchannels()
            sample_rate = wf.getframerate()
            n_frames = wf.getnframes()
            frames = wf.readframes(n_frames)

        # 计算能量
        if wf.getsampwidth() == 2:
            samples = struct.unpack(f'{n_frames * n_channels}h', frames)
        else:
            samples = struct.unpack(f'{n_frames * n_channels}b', frames)

        # 计算 RMS 能量
        rms = math.sqrt(sum(s * s for s in samples) / max(len(samples), 1))
        max_val = max(abs(s) for s in samples) if samples else 0

        # 归一化 RMS
        if wf.getsampwidth() == 2:
            rms_norm = rms / 32768.0
        else:
            rms_norm = rms / 128.0

        duration = n_frames / sample_rate if sample_rate > 0 else 0

        # 如果能量太低，说明可能是静音
        if rms_norm < 0.001:
            output_json("ok", text="", confidence=0.0, method="fallback",
                        note="检测到静音或极低音量", duration=duration)
        else:
            output_json("ok", text="", confidence=0.0, method="fallback",
                        note="sherpa-onnx 不可用，无法进行语音识别。请安装 sherpa-onnx 或下载 SenseVoice 模型。",
                        duration=duration,
                        rms=rms_norm)

    except Exception as e:
        output_json("ok", text="", confidence=0.0, method="fallback",
                    error=f"降级识别失败: {str(e)}")


# ---------------------------------------------------------------------------
# 主入口
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="玄枢 AI ASR 桥接脚本")
    parser.add_argument("--model", choices=["sensevoice"], required=True,
                        help="ASR 模型类型")
    parser.add_argument("--input", type=str, required=True, help="输入音频文件路径 (.wav)")

    args = parser.parse_args()

    # 验证输入文件
    if not os.path.exists(args.input):
        error_exit(f"输入文件不存在: {args.input}")

    if not args.input.lower().endswith('.wav'):
        error_exit(f"输入文件必须是 WAV 格式: {args.input}")

    try:
        if args.model == "sensevoice":
            recognize_sensevoice(args.input)
        else:
            error_exit(f"未知的 ASR 模型: {args.model}")

    except Exception as e:
        error_exit(f"未预期的错误: {str(e)}\n{traceback.format_exc()}")


if __name__ == "__main__":
    main()