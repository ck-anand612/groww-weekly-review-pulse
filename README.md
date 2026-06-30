# Weekly Product Review Pulse

Automated weekly report from **Groww** Google Play Store reviews, delivered via Google Docs and Gmail through MCP servers.

## Documentation

| Document | Description |
|----------|-------------|
| [context.md](context.md) | Product scope and objectives |
| [architecture.md](architecture.md) | Technical design and MCP contracts |
| [implementation-plan.md](implementation-plan.md) | Phased build plan |
| [edge-cases.md](edge-cases.md) | Corner cases and test matrix |

## Repository layout

```
AI AGENT/
├── config/                 # Product and MCP host config (no secrets)
├── data/runs/              # Run ledger (gitignored contents)
├── mcp-servers/
│   └── play-store-reviews/ # In-repo Play Store MCP server
├── pulse-agent/            # Orchestrator and analysis pipeline
└── docs/
```

## Prerequisites

- Python 3.11+
- pip

## Local setup

```bash
# Create and activate a virtual environment (recommended)
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

# Install packages in editable mode
pip install -e "./mcp-servers/play-store-reviews[dev]"
pip install -e "./pulse-agent[dev]"

# Run tests
pytest mcp-servers/play-store-reviews/tests pulse-agent/tests
```

## Configuration

1. Copy and edit [config/groww.yaml](config/groww.yaml):
   - `play_store.app_id` — Groww package ID on Google Play
   - `delivery.google_doc.document_id` — Google Doc for pulse archive
   - `delivery.email.stakeholders` — recipient allowlist

2. Configure external MCP servers in [config/mcp-servers.json](config/mcp-servers.json) (Google Docs, Gmail). **Do not commit credentials.**

Validate config from Python:

```python
from pulse.config import load_product_config, validate_runtime_config

config = load_product_config()
errors = validate_runtime_config(config)  # flags unfilled placeholders
```

## Environment variables

| Variable | Used by | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | pulse-agent | Embeddings and LLM (Phase 3+) |
| `GOOGLE_APPLICATION_CREDENTIALS` | Docs/Gmail MCP | Service account JSON path (outside repo) |
| `PULSE_ALLOW_SEND` | pulse-agent | Must be `true` to allow `email_mode=send` in prod |
| `PULSE_CONFIG_PATH` | pulse-agent | Optional override for groww.yaml path |
| `PLAY_STORE_CACHE_TTL` | play-store-reviews MCP | Cache TTL in seconds (Phase 1+) |
| `PLAY_STORE_DEFAULT_APP_ID` | play-store-reviews MCP | Default Groww app ID (Phase 1+) |

Store secrets in `.env` (gitignored) or your MCP server environment — never in this repository.

## CLI (Phase 0)

```bash
pulse --version
```

Full commands (`run`, `backfill`, `status`, `dry-run`) arrive in Phase 8.

## MCP servers

| Server | Location | Status |
|--------|----------|--------|
| Play Store Reviews | `mcp-servers/play-store-reviews/` | Phase 0 scaffold |
| Google Docs | External | Configure in `mcp-servers.json` |
| Gmail | External | Configure in `mcp-servers.json` |

## Development status

- [x] Phase 0 — Project scaffolding
- [ ] Phase 1 — Play Store Reviews MCP
- [ ] Phase 2 — Ingestion & data models
- [ ] Phase 3+ — See [implementation-plan.md](implementation-plan.md)

## How to Re-run for a New Week

### 1. Configure secrets

Add these in your GitHub repo under **Settings → Secrets and variables → Actions**:

| Secret | Purpose |
|--------|---------|
| `GROQ_API_KEY` | LLM API key for theme summarization |
| `GOOGLE_CREDENTIALS` | Service account JSON for Google Docs & Gmail delivery |

Also add this **variable** (not a secret) under **Settings → Variables**:

| Variable | Purpose |
|----------|---------|
| `PULSE_MCP_SERVER_URL` | Railway MCP server URL for delivery endpoints |

### 2. Run the GitHub Action

1. Go to **Actions → Weekly Pulse Run**
2. Click **Run workflow**
3. Fill in the inputs (see below)
4. Click **Run workflow**

The action runs every Monday at 06:00 IST automatically. Use manual dispatch for ad-hoc runs.

### 3. Select ISO week

In the **ISO week** field, enter the target week in `YYYY-Www` format (e.g., `2026-W24`). Leave empty to use the current week.

### 4. Generate the report

The pipeline runs automatically as part of the workflow:

```
ingest → analyze → summarize → render → deliver
```

The report is appended to the [Google Doc](https://docs.google.com/document/d/1srRnz0TTVoNgSil62PsWU8Vl7hbXxxHf746f0V8YfF8) and the run ledger is uploaded as an artifact.

To run locally instead:

```bash
pulse run --product groww --iso-week 2026-W24 --email-mode draft
```

### 5. Create email draft

By default, the workflow creates a **draft** email (not sent). To send instead, set **Email mode** to `send` in the workflow dispatch. Set `PULSE_ALLOW_SEND=true` in the environment for production sends.

To skip delivery entirely, set **Email mode** to `skip` or use `--dry-run`.

## Theme Legend

| Theme | Definition |
|-------|------------|
| **Onboarding** | First-run experience, sign-up flow, account creation friction, and initial app guidance. |
| **KYC** | Identity verification, document upload, PAN/Aadhaar linking, and KYC status delays. |
| **Portfolio Tracking** | Holdings view, P&L display, watchlist management, and investment performance visibility. |
| **Transactions** | Order placement, execution speed, buy/sell glitches, settlement delays, and brokerage charges. |
| **Support Experience** | Help-desk responsiveness, ticket resolution time, chat availability, and complaint escalation. |

## License

Internal project — Next Leap PM.
