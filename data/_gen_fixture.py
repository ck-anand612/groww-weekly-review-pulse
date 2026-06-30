"""Generate a fixture PulseReport JSON for Phase 5 preview."""
import json
import os

from pulse.models.models import (
    ActionIdea,
    AudienceNotes,
    PulseReport,
    PulseReportPeriod,
    PulseReportStats,
    Theme,
)

report = PulseReport(
    product="groww",
    iso_week="2026-W23",
    period=PulseReportPeriod(
        start_date="2026-03-31",
        end_date="2026-06-08",
        window_weeks=10,
    ),
    stats=PulseReportStats(
        total_reviews_fetched=1240,
        reviews_after_dedupe=1180,
        reviews_clustered=1100,
        clusters_found=18,
        top_themes_selected=3,
    ),
    themes=[
        Theme(
            rank=1,
            name="App performance & bugs",
            summary="Lag, crashes during trading hours; login/session timeouts.",
            cluster_size=142,
            avg_rating=2.1,
            quotes=[
                "The app freezes exactly when the market opens, very frustrating.",
                "Login keeps failing during peak hours.",
            ],
            action_ideas=[
                ActionIdea(
                    title="Stabilize peak-time performance",
                    rationale="Scale infra during market hours; improve crash visibility.",
                ),
            ],
        ),
        Theme(
            rank=2,
            name="Customer support friction",
            summary="Slow responses; unresolved tickets.",
            cluster_size=98,
            avg_rating=1.8,
            quotes=[
                "Support takes days to reply and does not solve the issue.",
                "Chat support is useless, no one responds.",
            ],
            action_ideas=[
                ActionIdea(
                    title="Improve support SLA visibility",
                    rationale="Expected response time in-app; ticket status tracking.",
                ),
            ],
        ),
        Theme(
            rank=3,
            name="UX & feature gaps",
            summary="Confusing navigation for portfolio insights; missing advanced analytics.",
            cluster_size=76,
            avg_rating=2.5,
            quotes=[
                "Good for beginners but lacks detailed analysis tools.",
                "Portfolio view is hard to find and understand.",
            ],
            action_ideas=[
                ActionIdea(
                    title="Enhance power-user features",
                    rationale="Advanced portfolio analytics; clearer investments navigation.",
                ),
            ],
        ),
    ],
    audience_notes=AudienceNotes(
        product="Focus on app stability during trading hours and UX improvements.",
        support="Prepare for increased ticket volume around login issues.",
        leadership="Addressing top 3 themes could improve retention by 15-20%.",
    ),
    generated_at="2026-06-08T06:30:00+05:30",
)

output_path = os.path.join(os.path.dirname(__file__), "fixture_report.json")
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(report.model_dump(), f, indent=2, ensure_ascii=False)
print(f"Written: {output_path}")
