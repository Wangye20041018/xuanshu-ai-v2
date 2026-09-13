# -*- coding: utf-8 -*-
import sys, wave, time
import numpy as np
import sherpa_onnx

MDIR = r"D:\steam\steamapps\common\PUBG\TslGame\Plugins\DAI\DAIStt\Resources\Stt\sherpa-onnx-paraformer-chinese"
WAV = sys.argv[1]

t0 = time.time()
rec = sherpa_onnx.OfflineRecognizer.from_paraformer(
    paraformer=MDIR + r"\model.int8.onnx",
    tokens=MDIR + r"\tokens.txt",
    num_threads=4,
    provider="cpu",
)
print("LOAD sec=%.2f" % (time.time()-t0))

with wave.open(WAV, "rb") as wf:
    sr = wf.getframerate()
    ch = wf.getnchannels()
    sw = wf.getsampwidth()
    raw = wf.readframes(wf.getnframes())
print("wav sr=%d ch=%d width=%d" % (sr, ch, sw))
samples = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
if ch > 1:
    samples = samples.reshape(-1, ch).mean(axis=1)

t1 = time.time()
st = rec.create_stream()
st.accept_waveform(sr, samples)
rec.decode_stream(st)
print("DECODE sec=%.2f" % (time.time()-t1))
print("TEXT=", st.result.text)
