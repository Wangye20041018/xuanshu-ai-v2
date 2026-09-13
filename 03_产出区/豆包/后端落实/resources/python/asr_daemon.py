#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
玄枢 AI — 常驻离线 ASR 服务
============================
模型只在启动时加载一次，之后常驻；主进程通过 stdin/stdout 行式 JSON 交互，
避免一次性脚本每次都重新加载模型（首次冷加载约十几秒，之后单条解码 <0.5s）。

协议（每行一个 JSON，UTF-8）：
  入：{"id":"x","wav":"C:/....wav"}        -> 转写
  入：{"type":"ping"}                       -> {"type":"pong"}
  入：{"type":"quit"}                       -> 退出
  出（启动成功）：{"type":"ready","engine":"paraformer|sensevoice","modelDir":...}
  出（启动失败）：{"type":"ready","ok":false,"error":...}   # 仍存活，便于主进程探测
  出（结果）：{"type":"result","id":"x","ok":true,"text":...,"sec":..}
"""
import os, sys, json, time, wave, traceback

try:
    sys.stdin.reconfigure(encoding="utf-8")
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

def emit(obj):
    try:
        print(json.dumps(obj, ensure_ascii=False), flush=True)
    except Exception:
        pass

HERE = os.path.dirname(os.path.abspath(__file__))
VOICE_ROOT = os.path.normpath(os.path.join(HERE, "..", "voice-models"))

def _cands(sub):
    home = os.path.expanduser("~")
    return [
        os.environ.get("XS_VOICE_DIR", ""),
        os.path.join(VOICE_ROOT, sub),
        os.path.join(home, "AppData", "Roaming", "xuanshu", "voice-models", sub),
        os.path.join(home, "AppData", "Roaming", "FlowyAIPC", "voice-models", sub),
    ]

def find_model_dir(sub):
    for c in _cands(sub):
        if c and os.path.isdir(c):
            return c
    return ""

def load_recognizer():
    """优先 SenseVoice，缺失则回退 Paraformer 中文。返回 (recognizer, engine, dir) 或 (None, None, err)。"""
    import sherpa_onnx
    # 1) SenseVoice-small: model.onnx + tokens.txt
    sv = find_model_dir("sensevoice-small")
    if sv and os.path.exists(os.path.join(sv, "model.onnx")) and os.path.exists(os.path.join(sv, "tokens.txt")):
        rec = sherpa_onnx.OfflineRecognizer.from_sense_voice(
            model=os.path.join(sv, "model.onnx"),
            tokens=os.path.join(sv, "tokens.txt"),
            num_threads=4, language="auto", use_itn=True,
        )
        return rec, "sensevoice", sv
    # 2) Paraformer-zh: model.int8.onnx(优先) / model.onnx + tokens.txt
    pf = find_model_dir("paraformer-zh")
    if pf:
        m = None
        for name in ("model.int8.onnx", "model.onnx"):
            p = os.path.join(pf, name)
            if os.path.exists(p):
                m = p; break
        tok = os.path.join(pf, "tokens.txt")
        if m and os.path.exists(tok):
            rec = sherpa_onnx.OfflineRecognizer.from_paraformer(
                paraformer=m, tokens=tok, num_threads=4, provider="cpu",
            )
            return rec, "paraformer", pf
    return None, None, "未找到 SenseVoice 或 Paraformer 模型（voice-models 目录为空）"

def read_wav_resampled(path, target_sr=16000):
    import numpy as np
    with wave.open(path, "rb") as wf:
        sr, ch, sw, n = wf.getframerate(), wf.getnchannels(), wf.getsampwidth(), wf.getnframes()
        raw = wf.readframes(n)
    if sw == 2:
        x = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
    elif sw == 4:
        x = np.frombuffer(raw, dtype=np.int32).astype(np.float32) / 2147483648.0
    elif sw == 1:
        x = (np.frombuffer(raw, dtype=np.uint8).astype(np.float32) - 128.0) / 128.0
    else:
        x = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
    if ch > 1:
        x = x.reshape(-1, ch).mean(axis=1)
    if sr != target_sr and sr > 0:  # 线性重采样到 16k
        n_out = int(round(len(x) * target_sr / float(sr)))
        if n_out > 0 and len(x) > 1:
            idx = np.linspace(0, len(x) - 1, n_out)
            x = np.interp(idx, np.arange(len(x)), x).astype(np.float32)
    return x, target_sr

def main():
    try:
        import numpy  # noqa
        t0 = time.time()
        rec, engine, mdir = load_recognizer()
        if rec is None:
            emit({"type": "ready", "ok": False, "error": str(mdir)})
        else:
            emit({"type": "ready", "ok": True, "engine": engine, "modelDir": mdir,
                  "loadSec": round(time.time() - t0, 2)})
    except Exception as e:
        emit({"type": "ready", "ok": False, "error": "加载失败: %s" % e, "trace": traceback.format_exc()})
        rec = None

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
        except Exception:
            continue
        typ = req.get("type")
        if typ == "ping":
            emit({"type": "pong"}); continue
        if typ == "quit":
            break
        rid = req.get("id", "")
        wav = req.get("wav", "")
        if rec is None:
            emit({"type": "result", "id": rid, "ok": False, "code": "no-engine", "text": ""}); continue
        try:
            if not os.path.exists(wav):
                emit({"type": "result", "id": rid, "ok": False, "code": "no-audio", "text": ""}); continue
            t1 = time.time()
            samples, sr = read_wav_resampled(wav, 16000)
            st = rec.create_stream()
            st.accept_waveform(sr, samples)
            rec.decode_stream(st)
            text = (st.result.text or "").strip()
            emit({"type": "result", "id": rid, "ok": True, "text": text,
                  "sec": round(time.time() - t1, 2)})
        except Exception as e:
            emit({"type": "result", "id": rid, "ok": False, "code": "error",
                  "error": str(e), "text": ""})

if __name__ == "__main__":
    main()
