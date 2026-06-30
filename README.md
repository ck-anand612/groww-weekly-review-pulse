# Groww Weekly Review Pulse

An automated pipeline that scrapes Google Play Store reviews for [Groww](https://play.google.com/store/apps/details?id=com.groww.in), clusters them into product themes using NLP, generates a structured summary via an LLM, and delivers the report to Google Docs and Gmail — on a recurring weekly schedule via GitHub Actions.

The project was built as a practical demonstration of agentic AI applied to product operations: replacing a manual, time-consuming review-reading process with an end-to-end automated system. The pipeline runs without human intervention every Monday morning, surfacing what users are saying about Groww that week in a format ready for PM review.

A React-based monitoring dashboard ships alongside the pipeline, providing visibility into run history, delivery status, and report content without requiring access to the backend environment.

---

## Problem

Product managers at consumer fintech companies routinely spend hours each week reading and manually tagging Play Store reviews to identify recurring issues and sentiment trends. For an app like Groww — which receives hundreds of new reviews weekly across themes like KYC, transactions, and onboarding — this process is slow, subjective, and difficult to scale.

There was no automated system to ingest, cluster, and summarize this feedback on a consistent cadence, nor a reliable way to deliver actionable theme summaries to the right stakeholders.

---

## Solution

This project builds a complete review intelligence pipeline:

1. Scrapes the last N weeks of reviews for Groww from the Google Play Store.
2. Embeds review text using a sentence transformer model (`BAAI/bge-small-en-v1.5`).
3. Reduces dimensions with UMAP and clusters with HDBSCAN to surface emergent themes.
4. Summarizes each cluster with `llama-3.3-70b-versatile` via Groq, with quote validation and retry logic.
5. Renders the report as structured Google Docs content and an HTML email draft.
6. Delivers to a shared Google Doc and Gmail draft (or send) via MCP servers hosted on Railway.
7. Logs every run to a ledger, which is uploaded as a GitHub Actions artifact for auditability.

The entire pipeline runs on a Monday 06:00 IST schedule, or on demand via GitHub Actions `workflow_dispatch`.

---

## Demo

| | |
|---|---|
| **Live Frontend** | _[Placeholder — deploy URL]_ |
| **GitHub Repository** | [ck-anand612/groww-weekly-review-pulse](https://github.com/ck-anand612/groww-weekly-review-pulse) |
| **Demo Video** | _[Placeholder — Loom or YouTube link]_ |
| **Google Doc Archive** | [Weekly Review Pulse — Groww](https://docs.google.com/document/d/1srRnz0TTVoNgSil62PsWU8Vl7hbXxxHf746f0V8YfF8) |

---

## Architecture

_[Placeholder — architecture diagram image]_

```
[Google Play Store]
        |
        v
[play-store-reviews MCP]   <-- Python package, scrapes via google-play-scraper
        |
        v
[Ingest & PII Scrub]       <-- adapter.py + pii.py
        |
        v
[Embed → UMAP → HDBSCAN]   <-- analysis/: sentence-transformers, umap-learn, hdbscan
        |
        v
[LLM Summarize]            <-- summarize/: Groq llama-3.3-70b-versatile, quote validation
        |
        v
[Render]                   <-- render/: Google Docs markup + HTML email template
        |
        v
[Deliver]                  <-- delivery/: MCP HTTP client → Railway (Google Docs + Gmail)
        |
        v
[Run Ledger]               <-- data/runs/ JSONL, uploaded as GitHub Actions artifact
```

---

## Workflow

**Scheduled trigger:** GitHub Actions runs the `weekly-pulse.yml` workflow every Monday at 00:30 UTC (06:00 IST). It can also be triggered manually via `workflow_dispatch` with configurable inputs.

**Pipeline stages:**

1. **Ingest** — Scrapes reviews for `com.groww.in` from Google Play for the configured rolling window (default: 10 weeks), deduplicates, and applies PII scrubbing.
2. **Analyze** — Embeds review text with `BAAI/bge-small-en-v1.5`, reduces dimensions with UMAP, and clusters with HDBSCAN. Returns the top-K clusters ranked by review volume.
3. **Summarize** — Sends each cluster to `llama-3.3-70b-versatile` (Groq) with a structured prompt. Validates that quoted text exists in source reviews. Retries on validation failure (up to 2 retries per cluster). Produces a `PulseReport` object.
4. **Render** — Converts the `PulseReport` into Google Docs-formatted text blocks and an HTML email body.
5. **Deliver** — Posts the rendered content to a Google Doc via the Railway-hosted MCP server, and creates a Gmail draft (or sends, if `email_mode=send` and `PULSE_ALLOW_SEND=true`).
6. **Audit** — Writes a structured run record to `data/runs/`. On completion or failure, the ledger directory is uploaded as a GitHub Actions artifact with 90-day retention.

**CLI equivalent:**

```bash
pulse run --product groww --iso-week 2026-W26 --email-mode draft
```

---

## Features

- **Automated scraping** of Google Play Store reviews using `google-play-scraper`, with a configurable rolling review window.
- **NLP clustering pipeline** — sentence embeddings (BAAI/bge-small-en-v1.5), UMAP dimensionality reduction, and HDBSCAN clustering to surface emergent themes without predefined labels.
- **LLM summarization** using Groq (`llama-3.3-70b-versatile`) with quote validation against source reviews and automatic retry on validation failure.
- **Dual delivery** — appends the weekly report to a persistent Google Doc and creates a Gmail draft for stakeholder distribution.
- **MCP server integration** — delivery is routed through a Railway-hosted Model Context Protocol server for Google Workspace operations.
- **GitHub Actions CI/CD** — scheduled weekly runs with configurable ISO week, email mode, and dry-run toggle. Run ledger is uploaded as an artifact.
- **Monitoring dashboard** — a React + TypeScript frontend (Vite) showing pipeline metrics, run history, and a report viewer.
- **PII scrubbing** — review text is cleaned before embedding or LLM processing.
- **Pydantic-validated configuration** — `config/groww.yaml` is validated at startup, with runtime checks for placeholder values.
- **Dry-run mode** — full pipeline execution without delivery, for testing and local development.

---

## Tech Stack

**Backend / Pipeline**

| Layer | Technology |
|---|---|
| Language | Python 3.11 |
| Review scraping | `google-play-scraper` |
| Data validation | Pydantic v2 |
| Embeddings | `sentence-transformers` (BAAI/bge-small-en-v1.5) |
| Dimensionality reduction | `umap-learn` |
| Clustering | `hdbscan` |
| LLM | Groq API (`llama-3.3-70b-versatile`) |
| HTTP client | `httpx` |
| Config | PyYAML |
| CLI | Custom `pulse` entry point via `pyproject.toml` |

**Delivery**

| Layer | Technology |
|---|---|
| MCP server | Railway-hosted Google Workspace MCP |
| Google Docs | MCP HTTP client → Docs API |
| Gmail | MCP HTTP client → Gmail API |
| Auth | Google service account (JSON key, injected via GitHub secret) |

**Frontend**

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| Icons | Lucide React |
| Deployment | Vercel |

**CI/CD**

| Layer | Technology |
|---|---|
| Automation | GitHub Actions (`weekly-pulse.yml`) |
| Schedule | Cron — every Monday 00:30 UTC |
| Artifact storage | GitHub Actions artifacts (90-day retention) |

---

## Screenshots

| View | Screenshot |
|---|---|
| Dashboard | _[Placeholder]_ |
| Run History | _[Placeholder]_ |
| Report Viewer | _[Placeholder]_ |
| Google Docs | _[Placeholder]_ |
| Gmail Draft | _[Placeholder]_ |

---

## Repository Structure

```
Groww-weekly-review-pulse/
├── .github/
│   └── workflows/
│       └── weekly-pulse.yml        # Scheduled and manual CI/CD pipeline
├── config/
│   ├── groww.yaml                  # Product config (app ID, LLM, delivery settings)
│   └── mcp-servers.json            # MCP server endpoints (no secrets)
├── data/
│   └── runs/                       # Run ledger JSONL files (gitignored contents)
├── docs/                           # Additional documentation
├── frontend/                       # React + TypeScript monitoring dashboard
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── RunHistory.tsx
│   │   │   └── ReportViewer.tsx
│   │   ├── components/
│   │   ├── services/               # API client
│   │   ├── types/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.ts
├── mcp-servers/
│   └── play-store-reviews/         # In-repo Play Store MCP server package
├── pulse-agent/                    # Core pipeline package
│   ├── src/pulse/
│   │   ├── analysis/               # Embeddings, UMAP, HDBSCAN clustering
│   │   │   ├── embeddings.py
│   │   │   ├── reduce.py
│   │   │   └── cluster.py
│   │   ├── audit/                  # Run ledger and audit trail
│   │   ├── delivery/               # MCP HTTP client, Docs, Gmail clients
│   │   │   ├── deliver.py
│   │   │   ├── docs_client.py
│   │   │   ├── gmail_client.py
│   │   │   └── mcp_http_client.py
│   │   ├── ingest/                 # Play Store adapter, PII scrubbing
│   │   │   ├── adapter.py
│   │   │   └── pii.py
│   │   ├── models/                 # Pydantic data models
│   │   ├── render/                 # Google Docs and email renderers
│   │   │   ├── docs.py
│   │   │   └── email.py
│   │   ├── summarize/              # LLM summarization, quote validation
│   │   │   └── prompts.py
│   │   ├── cli.py                  # `pulse` CLI entry point
│   │   ├── config.py               # Config loading and validation
│   │   └── orchestrator.py        # End-to-end pipeline orchestration
│   ├── tests/
│   └── pyproject.toml
├── scripts/                        # Utility scripts
├── .env.example                    # Environment variable reference
└── README.md
```

---

## How to Run

### Prerequisites

- Python 3.11+
- Node.js 18+ (frontend only)
- pip

### 1. Clone and install

```bash
git clone https://github.com/ck-anand612/groww-weekly-review-pulse.git
cd groww-weekly-review-pulse

# Create and activate a virtual environment
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux

# Install the pipeline packages
pip install -e "./mcp-servers/play-store-reviews[dev]"
pip install -e "./pulse-agent[dev,fetch]"
```

### 2. Configure

Copy and edit `config/groww.yaml`:

```yaml
play_store:
  app_id: "com.groww.in"

analysis:
  max_themes: 5
  embedding_model: BAAI/bge-small-en-v1.5
  llm_model: llama-3.3-70b-versatile

delivery:
  google_doc:
    document_id: "<your-google-doc-id>"
  email:
    stakeholders:
      - your-email@example.com
    default_mode: draft
```

Configure MCP server endpoints in `config/mcp-servers.json`. Do not commit credentials.

Validate configuration:

```python
from pulse.config import load_product_config, validate_runtime_config

config = load_product_config()
errors = validate_runtime_config(config)
```

### 3. Environment variables

Copy `.env.example` to `.env` and fill in secrets:

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | Groq API key for LLM summarization |
| `GOOGLE_CREDENTIALS` | Yes | Service account JSON path for Google Workspace MCP |
| `PULSE_MCP_SERVER_URL` | Yes | Railway MCP server URL for delivery |
| `PULSE_ALLOW_SEND` | No | Set to `true` to allow `email_mode=send` in production |
| `PULSE_CONFIG_PATH` | No | Override path for `groww.yaml` |
| `PULSE_DATA_DIR` | No | Override base data directory |
| `SENTENCE_TRANSFORMERS_HOME` | No | Cache directory for embedding models |

Store secrets in `.env` (gitignored) or as GitHub repository secrets. Never commit credentials.

### 4. Run locally

```bash
# Full pipeline run (creates Gmail draft, appends to Google Doc)
pulse run --product groww --iso-week 2026-W26 --email-mode draft

# Dry run (no delivery)
pulse dry-run --product groww --iso-week 2026-W26

# Check version
pulse --version
```

### 5. Run tests

```bash
pytest mcp-servers/play-store-reviews/tests pulse-agent/tests
```

### 6. GitHub Actions

Add the following in **Settings → Secrets and variables → Actions**:

| Secret | Purpose |
|---|---|
| `GROQ_API_KEY` | LLM API key for summarization |
| `GOOGLE_CREDENTIALS` | Service account JSON for Google Workspace MCP |

Add the following as a repository **variable** (not a secret):

| Variable | Purpose |
|---|---|
| `PULSE_MCP_SERVER_URL` | Railway MCP server URL for delivery |

The workflow (`weekly-pulse.yml`) runs automatically every Monday at 06:00 IST. To trigger manually:

1. Go to **Actions → Weekly Pulse Run**
2. Click **Run workflow**
3. Set `iso_week` (e.g., `2026-W26`), `email_mode` (`draft` / `send` / `skip`), and optionally enable `dry_run`

### 7. Frontend (optional)

```bash
cd frontend
npm install
npm run dev
```

---

## Results

The pipeline consistently delivers the following each week:

- A structured report appended to a shared Google Doc, organized by theme with supporting user quotes.
- A Gmail draft addressed to configured stakeholders, ready for review and dispatch.
- A machine-readable run ledger uploaded as a GitHub Actions artifact, capturing ingest count, cluster statistics, token usage, and delivery status.
- Typical pipeline duration: under 5 minutes end-to-end on GitHub-hosted runners.

The monitoring dashboard provides a persistent view of all historical runs, theme summaries, and delivery outcomes without requiring CLI access.

---

## Challenges and Learnings

**NLP pipeline tuning** — UMAP and HDBSCAN are sensitive to hyperparameters. Configuring `n_neighbors`, `min_dist`, `min_cluster_size`, and `min_samples` to produce stable, meaningful clusters on variable-volume weekly review batches required iterative testing. The pipeline exposes these parameters as environment variable overrides to support future tuning without code changes.

**LLM quote validation** — Early iterations of the summarization step produced hallucinated quotes that did not appear in source reviews. The current implementation validates every quoted string against the actual review snippets passed to the model, retrying the LLM call if validation fails. This was a non-trivial reliability improvement.

**MCP integration over HTTP** — The delivery layer communicates with a Railway-hosted MCP server via HTTP rather than a local stdio server. Building a robust HTTP client with proper error handling, retry logic, and credential injection via GitHub secrets required careful design.

**Rate limit management** — The Groq free tier enforces both RPM and TPM limits. The summarization module enforces a minimum interval between LLM calls and caps token usage per run to stay within limits during multi-cluster summarization.

**Reproducibility across environments** — Ensuring the pipeline behaves identically in local development, CI, and production required strict separation of config (YAML), secrets (environment variables), and runtime state (run ledger). Pydantic validation at startup catches configuration errors before any external calls are made.

---

## Future Improvements

- **Multi-app support** — Generalize the product config schema to support additional app IDs beyond Groww.
- **Sentiment scoring** — Add a star-rating-weighted sentiment signal alongside cluster volume.
- **Week-over-week diff** — Compare the current week's theme distribution against the prior week and flag significant changes.
- **Slack delivery** — Add a Slack MCP client as an additional delivery channel.
- **Frontend API backend** — Replace static JSON data in the dashboard with a lightweight FastAPI or Flask backend reading live run ledger files.
- **Alert thresholds** — Trigger a GitHub notification or email if a cluster exceeds a configurable review volume threshold, indicating a potential incident.

---

## Theme Reference

| Theme | Definition |
|---|---|
| Onboarding | First-run experience, sign-up flow, account creation friction, and initial app guidance |
| KYC | Identity verification, document upload, PAN/Aadhaar linking, and KYC status delays |
| Portfolio Tracking | Holdings view, P&L display, watchlist management, and investment performance visibility |
| Transactions | Order placement, execution speed, buy/sell glitches, settlement delays, and brokerage charges |
| Support Experience | Help-desk responsiveness, ticket resolution time, chat availability, and complaint escalation |

---

## License

Internal project — Next Leap PM. Not licensed for redistribution.
