"""Generate reviews_sample.csv from normalized review data."""
import json
import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
src = ROOT / "data" / "cache" / "groww" / "2026-06-09" / "reviews_normalized.json"
out = ROOT / "reviews_sample.csv"

with open(src, encoding="utf-8") as f:
    reviews = json.load(f)

with open(out, "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["rating", "review_text", "published_at"])
    for r in reviews:
        w.writerow([r["rating"], r["text"], r["published_at"]])

print(f"Rows written: {len(reviews)}")
print(f"Output: {out}")
