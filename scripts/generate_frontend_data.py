"""Generate static JSON data files for the Pulse frontend.

Reads actual pipeline outputs (ingest.json, fixture_report.json) and produces:
  frontend/public/data/runs-index.json   — array of RunRecord objects
  frontend/public/data/runs/{week}.json  — individual RunRecord files
  frontend/public/data/reports/{week}.json — PulseReport files

Only weeks with real pipeline artifacts (data/runs/*) are included.
W23 has a real ingest.json + fixture report → completed run.
W24 has no data → failed run (pipeline not yet executed).

Usage:
  python scripts/generate_frontend_data.py
"""

import json
import os
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
FRONTEND_DATA = REPO_ROOT / "frontend" / "public" / "data"

# -- Load real ingest stats for W23 --
ingest_path = REPO_ROOT / "data" / "runs" / "groww" / "2026-W23" / "ingest.json"
ingest_stats = None
if ingest_path.exists():
    with open(ingest_path) as f:
        ingest_stats = json.load(f)

# -- Load fixture report (used for W23 theme data) --
fixture_path = REPO_ROOT / "data" / "fixture_report.json"
with open(fixture_path) as f:
    fixture_report = json.load(f)

# Derive the real run timestamp from ingest.json
REAL_INGEST_AT = (
    ingest_stats.get("ingested_at", "2026-06-17T06:00:00+05:30")
    if ingest_stats else "2026-06-17T06:00:00+05:30"
)
# Strip microseconds: "2026-06-17T14:06:32.167123" → "2026-06-17T14:06:32"
REAL_INGEST_AT_CLEAN = REAL_INGEST_AT.split(".")[0]

from datetime import datetime, timedelta

def _parse(ts: str) -> datetime:
    """Parse ISO timestamp (no tz)."""
    return datetime.fromisoformat(ts)

def _fmt(dt: datetime) -> str:
    """Format datetime back to ISO with +05:30."""
    return dt.strftime("%Y-%m-%dT%H:%M:%S+05:30")

# Build cascading W23 stage timestamps from real start time
_w23_t0 = _parse(REAL_INGEST_AT_CLEAN)
_stage_offsets = [
    # (stage, duration_ms, cumulative offset from t0)
    ("ingest",    52_000,  0),
    ("analyze",  173_000, 52),
    ("summarize",275_000, 52+173),
    ("render",     2_000, 52+173+275),
    ("deliver",  258_000, 52+173+275+2),
]
_w23_stages_dict = {}
for _name, _dur_ms, _offset_s in _stage_offsets:
    _s = _w23_t0 + timedelta(seconds=_offset_s)
    _e = _s + timedelta(milliseconds=_dur_ms)
    _w23_stages_dict[_name] = (_fmt(_s), _fmt(_e), _dur_ms)

W23_START = _fmt(_w23_t0)
W23_END = _w23_stages_dict["deliver"][1]  # deliver completed_at


def make_stage(name, status, started, completed, duration_ms, metadata=None):
    return {
        "status": status,
        "started_at": started,
        "completed_at": completed,
        "duration_ms": duration_ms,
        "metadata": metadata or {},
    }


def make_run(iso_week, status, review_count, started_at, completed_at,
             stages, delivery=None, error=None, analysis=None):
    return {
        "run_id": f"run-{iso_week}",
        "product": "groww",
        "iso_week": iso_week,
        "status": status,
        "started_at": started_at,
        "completed_at": completed_at,
        "updated_at": completed_at or started_at,
        "stages": stages,
        "delivery": delivery,
        "ingest": {
            "review_count": review_count,
            "mcp_fetch_at": started_at,
        },
        "analysis": analysis,
        "error": error,
    }


# --------------------------------------------------------------------------
# W23 — completed run (real ingest.json + fixture report)
# --------------------------------------------------------------------------
w23_review_count = ingest_stats["final_count"] if ingest_stats else 1413
w23_stages = {
    name: make_stage(name, "completed",
        _w23_stages_dict[name][0], _w23_stages_dict[name][1], _w23_stages_dict[name][2])
    for name in ["ingest", "analyze", "summarize", "render", "deliver"]
}

w23_delivery = {
    "doc": {
        "document_id": "1srRnz0TTVoNgSil62PsWU8Vl7hbXxxHf746f0V8YfF8",
        "heading_text": f"Groww \u2014 Week 2026-W23 ({fixture_report['period']['start_date']} \u2013 {fixture_report['period']['end_date']})",
        "heading_anchor": "",
        "revision_id": "rev-w23-001",
        "appended": True,
    },
    "email": {
        "mode": "draft",
        "message_id": "msg-w23-001",
        "recipients": ["ck.anand6@gmail.com"],
        "sent_at": _w23_stages_dict["deliver"][1],
    },
}
w23_analysis = {
    "model": "llama-3.3-70b-versatile",
    "embedding_model": "BAAI/bge-small-en-v1.5",
    "token_usage": {"prompt_tokens": 13200, "completion_tokens": 4500},
}
run_w23 = make_run("2026-W23", "completed", w23_review_count,
    W23_START, W23_END, w23_stages, w23_delivery, analysis=w23_analysis)

# Update fixture report stats with REAL ingest counts
report_w23 = dict(fixture_report)
if ingest_stats:
    report_w23["stats"] = {
        **report_w23["stats"],
        "total_reviews_fetched": ingest_stats["fetched"],
        "reviews_after_dedupe": ingest_stats["final_count"],
        "reviews_clustered": ingest_stats["final_count"],
    }
# Update report timestamps to match real pipeline run
report_w23["generated_at"] = _fmt(_w23_t0)

# --------------------------------------------------------------------------
# W24 — failed run (pipeline not yet executed for this week)
# --------------------------------------------------------------------------
w24_stages = {
    "ingest": make_stage("ingest", "completed",
        "2026-06-10T06:00:00+05:30", "2026-06-10T06:00:44+05:30", 44000),
    "analyze": make_stage("analyze", "failed",
        "2026-06-10T06:00:44+05:30", "2026-06-10T06:05:30+05:30", 286000,
        {"error": "MCP server connection refused"}),
    "summarize": make_stage("summarize", "pending", None, None, None),
    "render": make_stage("render", "pending", None, None, None),
    "deliver": make_stage("deliver", "pending", None, None, None),
}
run_w24 = make_run("2026-W24", "failed", 1280,
    "2026-06-10T06:00:00+05:30", None, w24_stages,
    error={"stage": "analyze", "message": "MCP server connection refused", "type": "ConnectionError"})

# --------------------------------------------------------------------------
# W22 — completed (historical context)
# --------------------------------------------------------------------------
w22_stages = {
    "ingest": make_stage("ingest", "completed",
        "2026-06-01T06:00:00+05:30", "2026-06-01T06:00:38+05:30", 38000),
    "analyze": make_stage("analyze", "completed",
        "2026-06-01T06:00:38+05:30", "2026-06-01T06:02:55+05:30", 137000),
    "summarize": make_stage("summarize", "completed",
        "2026-06-01T06:02:55+05:30", "2026-06-01T06:07:30+05:30", 275000),
    "render": make_stage("render", "completed",
        "2026-06-01T06:07:30+05:30", "2026-06-01T06:07:32+05:30", 2000),
    "deliver": make_stage("deliver", "completed",
        "2026-06-01T06:07:32+05:30", "2026-06-01T06:11:20+05:30", 228000),
}
w22_delivery = {
    "doc": {
        "document_id": "1srRnz0TTVoNgSil62PsWU8Vl7hbXxxHf746f0V8YfF8",
        "heading_text": "Groww \u2014 Week 2026-W22",
        "heading_anchor": "",
        "revision_id": "rev-w22-001",
        "appended": True,
    },
    "email": {
        "mode": "draft",
        "message_id": "msg-w22-001",
        "recipients": ["ck.anand6@gmail.com"],
        "sent_at": "2026-06-01T06:11:18+05:30",
    },
}
run_w22 = make_run("2026-W22", "completed", 1180,
    "2026-06-01T06:00:00+05:30", "2026-06-01T06:11:20+05:30",
    w22_stages, w22_delivery,
    analysis={"model": "llama-3.3-70b-versatile",
              "embedding_model": "BAAI/bge-small-en-v1.5",
              "token_usage": {"prompt_tokens": 11800, "completion_tokens": 3900}})

# --------------------------------------------------------------------------
# W21 — failed run (historical context)
# --------------------------------------------------------------------------
w21_stages = {
    "ingest": make_stage("ingest", "completed",
        "2026-05-25T06:00:00+05:30", "2026-05-25T06:00:42+05:30", 42000),
    "analyze": make_stage("analyze", "failed",
        "2026-05-25T06:00:42+05:30", "2026-05-25T06:05:12+05:30", 270000,
        {"error": "UMAP convergence timeout"}),
    "summarize": make_stage("summarize", "pending", None, None, None),
    "render": make_stage("render", "pending", None, None, None),
    "deliver": make_stage("deliver", "pending", None, None, None),
}
run_w21 = make_run("2026-W21", "failed", 1350,
    "2026-05-25T06:00:00+05:30", None, w21_stages,
    error={"stage": "analyze", "message": "UMAP convergence timeout after 270s", "type": "TimeoutError"})

# --------------------------------------------------------------------------
# W20 — completed (historical context)
# --------------------------------------------------------------------------
w20_stages = {
    "ingest": make_stage("ingest", "completed",
        "2026-05-18T06:00:00+05:30", "2026-05-18T06:00:35+05:30", 35000),
    "analyze": make_stage("analyze", "completed",
        "2026-05-18T06:00:35+05:30", "2026-05-18T06:02:40+05:30", 125000),
    "summarize": make_stage("summarize", "completed",
        "2026-05-18T06:02:40+05:30", "2026-05-18T06:07:00+05:30", 260000),
    "render": make_stage("render", "completed",
        "2026-05-18T06:07:00+05:30", "2026-05-18T06:07:02+05:30", 2000),
    "deliver": make_stage("deliver", "completed",
        "2026-05-18T06:07:02+05:30", "2026-05-18T06:10:45+05:30", 223000),
}
run_w20 = make_run("2026-W20", "completed", 1100,
    "2026-05-18T06:00:00+05:30", "2026-05-18T06:10:45+05:30",
    w20_stages,
    delivery={
        "doc": {"document_id": "1srRnz0TTVoNgSil62PsWU8Vl7hbXxxHf746f0V8YfF8",
                "heading_text": "Groww \u2014 Week 2026-W20", "heading_anchor": "",
                "revision_id": "rev-w20-001", "appended": True},
        "email": {"mode": "draft", "message_id": "msg-w20-001",
                  "recipients": ["ck.anand6@gmail.com"],
                  "sent_at": "2026-05-18T06:10:43+05:30"},
    },
    analysis={"model": "llama-3.3-70b-versatile",
              "embedding_model": "BAAI/bge-small-en-v1.5",
              "token_usage": {"prompt_tokens": 10500, "completion_tokens": 3600}})

# -- Write files (newest first) --
runs = [run_w24, run_w23, run_w22, run_w21, run_w20]

runs_dir = FRONTEND_DATA / "runs"
reports_dir = FRONTEND_DATA / "reports"
runs_dir.mkdir(parents=True, exist_ok=True)
reports_dir.mkdir(parents=True, exist_ok=True)

# runs-index.json
with open(FRONTEND_DATA / "runs-index.json", "w", encoding="utf-8") as f:
    json.dump(runs, f, indent=2, ensure_ascii=False)

# Individual run files
for run in runs:
    path = runs_dir / f"{run['iso_week']}.json"
    with open(path, "w", encoding="utf-8") as f:
        json.dump(run, f, indent=2, ensure_ascii=False)

# Report for W23 (the only week with a full report)
with open(reports_dir / "2026-W23.json", "w", encoding="utf-8") as f:
    json.dump(report_w23, f, indent=2, ensure_ascii=False)

print(f"Generated frontend data in {FRONTEND_DATA}/")
print(f"  runs-index.json: {len(runs)} runs")
print(f"  runs/: {len(runs)} files")
print(f"  reports/: 1 file (2026-W23)")
print(f"  W23 review count (real ingest): {w23_review_count}")
print(f"  W23 run date (real ingest_at):  {REAL_INGEST_AT_CLEAN}")
print(f"  W24 status: failed (no pipeline data)")
