# -*- coding: utf-8 -*-
"""
玄枢终代 · 四方协作可视化进度看板生成器
数据源（只读，不修改任何属于参与方的文件）:
  05_状态/*_STATUS.md   各参与方自报进度
  03_产出区/*            各方交付物（含 CHANGES.md）
  06_意见墙/*            意见/依赖/问答
  07_部署产物/验收清单.md 中央 16 项验收打勾
  02_源码/app             施工区 bundle/主进程是否被新改动（活跃度）
运行: python build_dashboard.py
输出: index.html（离线自包含可视化面板）
"""
import os, re, io, sys, json, datetime

ROOT = os.path.dirname(os.path.abspath(__file__))           # 09_进度看板
BASE = os.path.dirname(ROOT)                                # 玄枢终代
ST = os.path.join(BASE, "05_状态")
OUT = os.path.join(BASE, "03_产出区")
WALL = os.path.join(BASE, "06_意见墙")
ASAR = os.path.join(BASE, "07_部署产物", "验收清单.md")
SRC = os.path.join(BASE, "02_源码", "app")

def now():
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def ts(p):
    return datetime.datetime.fromtimestamp(os.path.getmtime(p)).strftime("%m-%d %H:%M") if os.path.exists(p) else "-"

def read(p):
    try:
        return io.open(p, encoding="utf-8", errors="ignore").read()
    except Exception:
        return ""

def parse_status_md(txt):
    """把各普通参与方 STATUS 解析为 dict"""
    d = {"阶段": "", "已完成": [], "进行中": "", "阻塞": "", "下一步": ""}
    lines = txt.splitlines()
    cur = None
    for ln in lines:
        ln = ln.strip()
        if ln.startswith("- 当前阶段"): d["阶段"] = ln.split(":", 1)[1].strip()
        elif ln.startswith("- 已完成"):
            d["已完成"] = []
        elif ln.startswith("- 进行中"): d["进行中"] = ln.split(":", 1)[1].strip()
        elif ln.startswith("- 阻塞") or ln.startswith("- 阻塞/依赖"): d["阻塞"] = ln.split(":", 1)[1].strip()
        elif ln.startswith("- 下一步"): d["下一步"] = ln.split(":", 1)[1].strip()
        elif ln.startswith("-  [") or (ln.startswith("- ") and not ln.startswith("- ") is None and not ln.startswith("- 当前") and not ln.startswith("- 完成") and not ln.startswith("- 进行") and not ln.startswith("- 阻塞") and not ln.startswith("- 下一步") and not ln.startswith("- 已发") and not ln.startswith("#") and not ln.startswith("##")):
            d["已完成"].append(ln.lstrip("- "))
    return d

def scan_outputs(who):
    """产出区某参与方的文件清单"""
    d = os.path.join(OUT, who)
    files, modules, has_changes = [], set(), False
    if os.path.isdir(d):
        for dp, dn, fn in os.walk(d):
            rel = os.path.relpath(dp, d)
            for f in fn:
                fp = os.path.join(dp, f)
                size = os.path.getsize(fp)
                files.append({"rel": os.path.join(rel, f).replace("\\", "/"),
                              "size": size, "time": ts(fp)})
                mod = rel.split(os.sep)[0] if rel != "." else "(根)"
                modules.add(mod)
                if f.lower() == "changes.md":
                    has_changes = True
    return files, modules, has_changes

def parse_checklist(mdpath):
    items = []
    if os.path.exists(mdpath):
        for ln in read(mdpath).splitlines():
            m = re.match(r"\|\s*(\d+)\s*\|\s*(.*?)\s*\|\s*([⬜⏳✅❌])\s*\|", ln)
            if m:
                items.append({"no": int(m.group(1)), "name": m.group(2).strip(), "st": m.group(3)})
    return items

def bundle_activity():
    """施工区最近改动时间（bundle + 主进程）"""
    hits = []
    for base in [os.path.join(SRC, "dist", "assets"), os.path.join(SRC, "dist-electron", "main")]:
        if not os.path.isdir(base):
            continue
        for f in os.listdir(base):
            fp = os.path.join(base, f)
            if not os.path.isfile(fp):
                continue
            if f.endswith(".js") or f.startswith("index-"):
                hits.append((os.path.getmtime(fp), f))
    hits.sort(reverse=True)
    return [(f, datetime.datetime.fromtimestamp(t).strftime("%m-%d %H:%M")) for t, f in hits[:6]]

def quality_score(who, stm, files, has_changes, checklist_ok):
    """质量评分 0~100（基于看得见的证据，自动计算，不带主观）"""
    score = 0
    reason = []
    today = datetime.date.today().strftime("%m-%d")
    if files:
        score += min(45, len(files) * 15)
        reason.append(f"交付文件 {len(files)} 个")
        if has_changes:
            score += 20; reason.append("CHANGES.md 齐")
        else:
            reason.append("缺 CHANGES.md")
    if stm.get("阶段"):
        score += 10; reason.append("状态文件在跟进")
    if checklist_ok:
        score += 15; reason.append(f"中央已验收 {checklist_ok} 项")
    if stm.get("阻塞") and "无" not in stm["阻塞"]:
        score = max(0, score - 10); reason.append("有阻塞待解决")
    return min(100, score), reason

def h(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def main():
    # ---- 各参与方 STATUS ----
    who_duty = {"豆包": "主题引擎 / 设置页 / 输入框三档",
                "WorkBuddy": "专家页 / 记忆 / 连接 / 会议",
                "Trae": "任务页定时 / AI视频 / 首页核查"}
    players = []
    checklist_ok_by_who = {}
    checklist = parse_checklist(ASAR)
    done_nos = {i["no"] for i in checklist if i["st"] == "✅"}
    done_total = len(done_nos)

    for who in ["豆包", "WorkBuddy", "Trae"]:
        files, modules, hc = scan_outputs(who)
        stat_path = os.path.join(ST, f"{who}_STATUS.md")
        stm = parse_status_md(read(stat_path))
        # 验收归属：根据验收清单备注的分配，粗算该方已过项
        ok_items = [i for i in checklist
                    if i["no"] in {2,4,5,6} and who == "WorkBuddy" and i["st"] == "✅"]
        ok_count = len(ok_items)
        if who == "WorkBuddy": ok_count = len([i for i in checklist if i["no"] in (2,4,5,6) and i["st"]=="✅"])
        elif who == "Trae": ok_count = len([i for i in checklist if i["no"] in (3,7) and i["st"]=="✅"])
        elif who == "豆包": ok_count = len([i for i in checklist if i["no"] in (8,10,13) and i["st"]=="✅"])
        score, reason = quality_score(who, stm, files, hc, ok_count)
        players.append({
            "who": who, "duty": who_duty[who],
            "phase": stm["阶段"] or "—",
            "doing": stm["进行中"] or "—",
            "block": stm["阻塞"] or "—",
            "next": stm["下一步"] or "—",
            "done": stm["已完成"],
            "files": files, "modules": sorted(modules), "has_changes": hc,
            "score": score, "why": reason,
            "ok": ok_count,
            "last": max([ts(os.path.join(OUT, who, f["rel"])) for f in files], default="—")
        })

    # ---- 中央状态 ----
    cen = read(os.path.join(ST, "中央_STATUS.md"))
    cen_done = [ln.strip() for ln in cen.splitlines() if ln.strip().startswith("- [x]")]
    cen_todo = [ln.strip() for ln in cen.splitlines() if ln.strip().startswith("- [ ]")]
    # ---- 意见墙 ----
    walls = []
    if os.path.isdir(WALL):
        for f in sorted(os.listdir(WALL)):
            fp = os.path.join(WALL, f)
            if os.path.isfile(fp):
                walls.append({"name": f, "time": ts(fp)})
    # ---- bundle 活跃 ----
    act = bundle_activity()

    data = {"players": players, "checklist": checklist, "done_total": done_total,
            "walls": walls, "act": act, "generated": now(),
            "cen_done": cen_done, "cen_todo": cen_todo}
    return data

_REFRESH_JS = """
<div id="refreshbar" style="position:fixed;top:14px;right:14px;z-index:99;display:flex;align-items:center;gap:10px">
  <span style="color:#777;font-size:12px">面板信息由中央 Marvis 实时维护</span>
  <button type="button" onclick="location.reload()" style="cursor:pointer;background:#1d1d23;color:#9be8d8;border:1px solid #3a3a44;padding:8px 18px;border-radius:20px;font-size:13px;box-shadow:0 4px 14px rgba(0,0,0,.5)">刷新</button>
</div>
"""

def render(data):
    total_n = len(data["checklist"])
    pct = round(data["done_total"] / total_n * 100) if total_n else 0
    cards = ""
    for p in data["players"]:
        mods = "、".join(p["modules"]) if p["modules"] else "（暂无交付）"
        b = "需处理" if p["block"] and "无" not in p["block"] else "无"
        bcls = "bad" if b == "需处理" else "ok"
        file_rows = "".join(
            f"<tr><td>{h(f['rel'])}</td><td>{f['size']//1024 if f['size']>1024 else f['size']}KB</td><td>{f['time']}</td></tr>"
            for f in sorted(p["files"], key=lambda x: x["time"], reverse=True)[:12])
        more = f"… 另 {len(p['files'])-12} 个" if len(p["files"]) > 12 else ""
        score_color = "#28a745" if p["score"] >= 80 else ("#e6a23c" if p["score"] >= 50 else "#d9534f")
        done_list = "".join(f"<li>{h(d)}</li>" for d in p["done"][:6]) or "<li>（暂无完成项）</li>"
        cards += f"""
        <div class="card">
          <div class="card-hd"><div class="ava">{p['who'][0]}</div><div class="t"><h3>{p['who']}</h3><div class="duty">{p['duty']}</div></div>
          <div class="score" style="color:{score_color}">{p['score']}<small>质量分</small></div></div>
          <div class="metas">
            <span class="m">阶段：{h(p['phase'])}</span>
            <span class="m">验收通过：{p['ok']} 项</span>
            <span class="m">最近交付：{h(p['last'])}</span>
          </div>
          <div class="sec lab">在做：{h(p['doing'])}</div>
          <div class="sec">下一步：{h(p['next'])}</div>
          <div class="sec"><span class="lb">阻塞：</span><span class="{bcls}">{h(p['block'])}</span></div>
          <div class="sec"><span class="lb">已完成：</span><ul class="done">{done_list}</ul></div>
          <div class="sec"><span class="lb">交付模块：</span>{h(mods)}</div>
          <div class="sec"><span class="lb">质量依据：</span>{'；'.join(p['why']) or '暂无'}</div>
          {('<details><summary>交付明细（'+str(len(p['files']))+' 个文件）</summary><table><tr><th>文件</th><th>大小</th><th>时间</th></tr>'+file_rows+more+'</table></details>') if p['files'] else ''}
        </div>"""

    ck_rows = ""
    for i in data["checklist"]:
        stmap = {"⬜": ("待验", "#666"), "⏳": ("进行中", "#e6a23c"), "✅": ("通过", "#28a745"), "❌": ("返工", "#d9534f")}
        label, color = stmap[i["st"]]
        ck_rows += f"<tr><td>{i['no']}</td><td>{h(i['name'])}</td><td style='color:{color}'>{label}</td></tr>"
    wall_rows = "".join(f"<tr><td>{h(w['name'])}</td><td>{w['time']}</td></tr>" for w in data["walls"]) or "<tr><td colspan=2>暂无意见</td></tr>"
    act_rows = "".join(f"<tr><td>{h(f)}</td><td>{t}</td></tr>" for f, t in data["act"]) or "<tr><td colspan=2>暂无</td></tr>"
    cen_done_lines = "".join(f"<li>{h(d)}</li>" for d in data["cen_done"]) or "<li>无</li>"
    cen_todo_lines = "".join(f"<li>{h(d)}</li>" for d in data["cen_todo"])

    return f"""<!DOCTYPE html><html lang="zh"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>玄枢终代 · 协作进度看板</title><style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:'Segoe UI','Microsoft YaHei',sans-serif;background:#000;background:linear-gradient(160deg,#0b0b0e,#18181d 55%,#050507);color:#eceef2;min-height:100vh;padding:24px}}
.wrap{{max-width:1200px;margin:0 auto}}
header{{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:10px}}
h1{{font-size:22px;letter-spacing:1px}}h1 small{{display:block;font-size:12px;color:#aab;font-weight:400}}
.gen{{font-size:12px;color:#aab}}
.bar{{background:#26262e;border-radius:8px;height:18px;overflow:hidden;margin:14px 0 6px;box-shadow:inset 0 1px 3px rgba(0,0,0,.6)}}
.bar>i{{display:block;height:100%;background:linear-gradient(90deg,#6be1c0,#56b4ff);transition:width .6s}}
.ov{{font-size:13px;color:#cde;margin-bottom:18px}}
.ov b{{color:#6be1c0}}
.cards{{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:16px}}
.card{{background:#1a1a20;border:1px solid #2e2e36;border-radius:14px;padding:16px;box-shadow:0 6px 18px rgba(0,0,0,.55)}}
.card-hd{{display:flex;align-items:center;gap:12px;margin-bottom:10px}}
.ava{{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#56b4ff,#6be1c0);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:#102}}
.t h3{{font-size:17px}}.t .duty{{font-size:12px;color:#bbc}}
.score{{margin-left:auto;text-align:center;font-size:26px;font-weight:800}}.score small{{display:block;font-size:10px;color:#aab;font-weight:400}}
.metas{{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px}}
.m{{background:#26262e;border-radius:20px;padding:2px 10px;font-size:12px;color:#d9dbe3}}
.sec{{font-size:13px;margin:6px 0;color:#dde}}
.lb{{color:#8ab;font-weight:600}}.lab{{background:#2b3a8f88;border-left:3px solid #56b4ff;padding:4px 8px;border-radius:4px}}
.ok{{color:#6be1c0}}.bad{{color:#ff8080}}
.done{{margin:2px 0 0 18px;color:#cce}} .done li{{font-size:12px}}
table{{width:100%;border-collapse:collapse;font-size:12px;margin-top:8px}}
th,td{{border-bottom:1px solid #ffffff22;padding:5px 6px;text-align:left}}
th{{color:#9ab}}details summary{{cursor:pointer;color:#56b4ff;font-size:13px;margin-top:6px}}
h2{{font-size:16px;margin:26px 0 8px;border-left:4px solid #6be1c0;padding-left:10px}}
.grid2{{display:grid;grid-template-columns:1fr 1fr;gap:16px}}
.panel{{background:#141419;border:1px solid #2e2e36;border-radius:12px;padding:14px}}
.panel li{{list-style:none;font-size:13px;margin:5px 0;color:#dde}}
@media(max-width:700px){{.grid2{{grid-template-columns:1fr}}}}
</style></head><body><div class="wrap"><div id="app">
<header><h1>玄枢终代 · 四方协作进度看板<small>豆包 / WorkBuddy / Trae / 中央 Marvis</small></h1>
<span class="gen" id="gen">最近更新：{data['generated']}</span></header>
<div class="bar"><i style="width:{pct}%"></i></div>
<div class="ov">整体验收进度 <b>{data['done_total']}/{total_n}</b>（{pct}%）。中央里程碑完成 {len(data['cen_done'])} 个。施工区最近动码：{data['act'][0][0] if data['act'] else '—'} @ {data['act'][0][1] if data['act'] else ''}</div>
<h2>参与方实时状态</h2>
<div class="cards">{cards}</div>
<div class="grid2">
<div class="panel"><h2 style="border:0;margin:0 0 8px;padding:0">中央 Marvis（操盘 / 集成 / 验收）</h2>
<b>已完成：</b><ul>{cen_done_lines}</ul><b>待办：</b><ul>{cen_todo_lines}</ul></div>
<div class="panel"><h2 style="border:0;margin:0 0 8px;padding:0">施工区代码活跃度</h2>
<table><tr><th>关键文件</th><th>最近修改</th></tr>{act_rows}</table></div>
</div>
<h2>验收清单（16 项）</h2>
<div class="panel"><table><tr><th>#</th><th>验收项</th><th>状态</th></tr>{ck_rows}</table></div>
<h2>意见墙（跨方沟通 / 依赖 / 老板意见）</h2>
<div class="panel"><table><tr><th>文件</th><th>时间</th></tr>{wall_rows}</table></div>
<footer style="margin:24px 0;font-size:12px;color:#777">数据来源：05_状态 / 03_产出区 / 06_意见墙 / 07_部署产物 / 02_源码（只读扫描）。<b>信息由中央 Marvis 按最新状态实时维护更新，点击右上角「刷新」查看最新进度。</b></footer>
</div></div>{_REFRESH_JS}</body></html>"""

if __name__ == "__main__":
    data = main()
    import json as _j
    summary = {"players": [{"who": p["who"], "score": p["score"], "doing": p["doing"], "block": p["block"], "files": len(p["files"])} for p in data["players"]],
               "done": data["done_total"], "walls": len(data["walls"]), "act": data["act"]}
    open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8").write(render(data))
    print("看板已生成 ->", os.path.join(ROOT, "index.html"))
    print(_j.dumps(summary, ensure_ascii=False, indent=1))
    print(_j.dumps([{"no": i["no"], "name": i["name"], "st": i["st"]} for i in data["checklist"]], ensure_ascii=False))
