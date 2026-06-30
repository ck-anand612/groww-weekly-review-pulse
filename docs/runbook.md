# Pulse Operator Runbook

Procedures for running, monitoring, and recovering the Weekly Review Pulse pipeline.

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `pulse run --product groww` | Run full pipeline for current week |
| `pulse dry-run --product groww` | Run without delivery (test mode) |
| `pulse status --product groww` | Check run status for current week |
| `pulse backfill --from 2026-W20 --to 2026-W23` | Run multiple weeks |
| `pulse render report.json` | Generate preview files from report |

---

## Running the Pipeline

### Standard weekly run

```bash
# Run for current ISO week (draft email mode)
pulse run --product groww

# Run for specific week
pulse run --product groww --iso-week 2026-W23

# Run with send mode (production)
pulse run --product groww --email-mode send
```

### Dry run (no delivery)

Use `dry-run` to test the pipeline without appending to Google Doc or sending emails:

```bash
pulse dry-run --product groww --iso-week 2026-W23
```

This runs ingest → analyze → summarize → render but skips the deliver stage.

### Backfill multiple weeks

```bash
# Backfill from week 20 to week 23 (inclusive, sequential)
pulse backfill --from 2026-W20 --to 2026-W23

# Backfill with draft emails
pulse backfill --from 2026-W20 --to 2026-W23 --email-mode draft
```

Backfill is idempotent — weeks that already completed are skipped.

---

## Checking Status

### View run status

```bash
# Current week
pulse status --product groww

# Specific week
pulse status --product groww --iso-week 2026-W23
```

### Output interpretation

```
Product:   groww
Week:      2026-W23
Run ID:    550e8400-e29b-41d4-a716-446655440000
Status:    completed
Started:   2026-06-11T06:30:00+05:30
Completed: 2026-06-11T06:35:00+05:30

Stages:
  ingest       completed  (12000ms)
  analyze      completed  (29000ms)
  summarize    completed  (39000ms)
  render       completed  (50ms)
  deliver      completed  (38000ms)

Delivery:
  Doc appended: True
  Doc ID:       1srRnz0TTVoNgSil62PsWU8Vl7hbXxxHf746f0V8YfF8
  Email mode:   draft
  Recipients:   stakeholder@example.com
```

### Status values

| Status | Meaning |
|--------|---------|
| `pending` | Run created, not started |
| `ingesting` | Fetching reviews |
| `analyzing` | Clustering reviews |
| `summarizing` | LLM generating report |
| `rendering` | Building doc/email content |
| `delivering` | Appending doc, creating email |
| `completed` | All stages passed |
| `failed` | A stage failed (check error) |

---

## Recovering from Failure

### Identify the failed stage

```bash
pulse status --product groww --iso-week 2026-W23
```

Look for the `Error:` line at the bottom:

```
Error: [deliver] MCP server timeout
```

### Retry a failed run

Simply re-run the same command — the orchestrator resumes from the failed stage:

```bash
pulse run --product groww --iso-week 2026-W23
```

Idempotency guarantees:
- Completed stages are not re-executed
- Doc append is skipped if already done
- Email is created if doc exists but email failed

### Force re-run (discard previous)

Delete the ledger directory and re-run:

```bash
# WARNING: This may create duplicate doc sections
rm -rf data/runs/groww/2026-W23
pulse run --product groww --iso-week 2026-W23
```

---

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success (or no-op for completed run) |
| 1 | General error (config not found, etc.) |
| 2 | Pipeline stage failure |
| 3 | Concurrent run rejected (lock held) |

---

## Scheduled Runs (GitHub Actions)

The pipeline runs automatically every Monday at 06:00 IST via GitHub Actions.

### Manual trigger

1. Go to **Actions** → **Weekly Pulse Run** → **Run workflow**
2. Optionally specify:
   - ISO week (default: current)
   - Product (default: groww)
   - Dry run (checkbox)
   - Email mode (draft/send/skip)

### Required secrets

| Secret | Purpose |
|--------|---------|
| `GROQ_API_KEY` | LLM API for summarization |
| `GOOGLE_CREDENTIALS` | Service account for Google Workspace |

### Artifacts

Each run uploads the ledger as an artifact (`pulse-ledger-{week}`), retained for 90 days.

---

## Configuration

### Config file location

`config/groww.yaml` — contains product settings, delivery targets, and schedule.

### Override config path

```bash
export PULSE_CONFIG_PATH=/path/to/custom/config.yaml
pulse run --product groww
```

### Key settings

```yaml
review_window_weeks: 10      # Weeks of reviews to fetch
analysis:
  max_themes: 5              # Number of themes in report
delivery:
  google_doc:
    document_id: "..."       # Google Doc ID
  email:
    stakeholders:            # Email recipients
      - user@example.com
    default_mode: draft      # draft | send | skip
```

---

## Troubleshooting

### "Concurrent run rejected"

Another run is in progress for the same week. Wait for it to complete or check for stale locks:

```bash
# Check for lock file
ls data/runs/groww/2026-W23/.lock

# If process is dead, remove lock manually
rm data/runs/groww/2026-W23/.lock
```

### "Config not found"

Ensure `config/groww.yaml` exists or set `PULSE_CONFIG_PATH`.

### Pipeline hangs at analyze stage

The embedding model (BAAI/bge-small-en-v1.5) downloads on first run (~100MB). Subsequent runs use the cached model.

### Doc section not appearing

1. Check `pulse status` — verify `doc_appended: True`
2. Verify `document_id` in config matches the target Google Doc
3. Check Google Workspace MCP server is running

---

## File Locations

| Path | Description |
|------|-------------|
| `data/runs/{product}/{week}/run.json` | Run ledger (source of truth) |
| `data/cache/{product}/{date}/` | Review cache |
| `data/preview/` | Rendered preview files |
| `config/groww.yaml` | Product configuration |

---

## Support

For issues or questions:
- Check the run ledger artifact in GitHub Actions
- Review structured logs (includes `run_id`, stage, `duration_ms`)
- Contact the project maintainer
