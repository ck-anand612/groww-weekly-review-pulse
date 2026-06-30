# Weekly Product Review Pulse — Architecture

This document describes the technical architecture for the Groww Weekly Review Pulse: an MCP-orchestrated pipeline that ingests Google Play Store reviews, derives themes and action ideas, and delivers a weekly report via Google Docs and Gmail.

For product scope and objectives, see [context.md](context.md).

---

## 1. Design principles

| Principle | Implication |
|-----------|-------------|
| **MCP boundaries** | The pulse agent never calls Play Store, Google Docs, or Gmail REST APIs directly. All external I/O goes through MCP tool calls. |
| **Single product, single source** | Initial build targets **Groww** and **Google Play reviews** only. Architecture should allow future products/sources without redesigning the core pipeline. |
| **Doc as system of record** | The running Google Doc is the canonical archive. Email is a teaser with a deep link—not a second full report. |
| **Idempotent weekly runs** | Re-running the same ISO week must not duplicate Doc sections or emails. |
| **Auditable delivery** | Every run persists metadata sufficient to answer “what was sent, when, for which week?” |
| **Safety by default** | PII is scrubbed before LLM use and publishing; review text is treated as data, not instructions. |

---

## 2. System context

```mermaid
flowchart TB
    subgraph External["External systems"]
        PS[Google Play Store]
        GW[Google Workspace]
    end

    subgraph MCP["MCP servers"]
        PSMCP[Play Store Reviews MCP<br/><i>built in this project</i>]
        DocsMCP[Google Docs MCP]
        GmailMCP[Gmail MCP]
    end

    subgraph Core["Pulse agent (MCP host)"]
        ORCH[Orchestrator / CLI]
        PIPE[Analysis pipeline]
        RENDER[Report renderer]
        AUDIT[Run ledger]
    end

    SCHED[Scheduler<br/>e.g. cron / Cloud Scheduler]

    PS --> PSMCP
    PSMCP -->|tool: fetch reviews| ORCH
    ORCH --> PIPE
    PIPE --> RENDER
    RENDER -->|tool: append section| DocsMCP
    RENDER -->|tool: send/draft email| GmailMCP
    DocsMCP --> GW
    GmailMCP --> GW
    ORCH --> AUDIT
    SCHED -->|weekly trigger| ORCH
```

**Roles:**

- **Pulse agent (MCP host)** — Owns orchestration, clustering, LLM summarization, rendering, idempotency, and audit logging. Holds no Google OAuth or Play scraping credentials.
- **Play Store Reviews MCP** — Scrapes or fetches public Groww Play Store reviews for a configurable date window; exposes them as structured MCP tools/resources.
- **Google Docs MCP** — Appends formatted weekly sections to the Groww pulse document; returns heading anchors for deep links.
- **Gmail MCP** — Creates drafts or sends stakeholder emails with teaser content and Doc links.

---

## 3. Logical component architecture

```mermaid
flowchart LR
    subgraph Ingest["1. Ingest"]
        FETCH[fetch_reviews]
        NORMALIZE[Normalize & dedupe]
        PII1[PII scrub]
    end

    subgraph Analyze["2. Analyze"]
        EMB[Embed reviews]
        CLUSTER[UMAP + HDBSCAN]
        RANK[Rank clusters]
    end

    subgraph Summarize["3. Summarize"]
        LLM[LLM theme naming]
        QUOTE[Quote extraction]
        VALIDATE[Quote validation]
        ACTIONS[Action ideas]
    end

    subgraph Deliver["4. Deliver"]
        DOC_RENDER[Doc section builder]
        EMAIL_RENDER[Email teaser builder]
        IDEM[Idempotency gate]
    end

    FETCH --> NORMALIZE --> PII1 --> EMB --> CLUSTER --> RANK
    RANK --> LLM --> QUOTE --> VALIDATE --> ACTIONS
    ACTIONS --> DOC_RENDER
    ACTIONS --> EMAIL_RENDER
    DOC_RENDER --> IDEM
    EMAIL_RENDER --> IDEM
```

### 3.1 Module responsibilities

| Module | Location | Responsibility |
|--------|----------|----------------|
| **Orchestrator** | `pulse-agent/` | End-to-end run lifecycle: resolve ISO week, invoke pipeline, call delivery MCP tools, write audit record. |
| **Play Store Reviews MCP** | `mcp-servers/play-store-reviews/` | Play Store access, caching, rate limiting, review normalization. |
| **Ingestion adapter** | `pulse-agent/ingest/` | Maps MCP review payloads to internal `Review` model; deduplication by review ID + text hash. |
| **Analysis engine** | `pulse-agent/analysis/` | Embeddings, dimensionality reduction, clustering, cluster ranking by size/density/recency. |
| **Summarization** | `pulse-agent/summarize/` | LLM prompts for theme labels, quote selection, action ideas; quote-in-source validation. |
| **Rendering** | `pulse-agent/render/` | Builds Google Docs batch-update requests and Gmail HTML/text bodies from `PulseReport` schema. |
| **Delivery client** | `pulse-agent/delivery/` | Thin MCP client wrappers for Docs and Gmail tools; no direct API calls. |
| **Run ledger** | `pulse-agent/audit/` | Persists run metadata, idempotency keys, and delivery identifiers. |
| **CLI / scheduler entry** | `pulse-agent/cli/` | `pulse run`, `pulse backfill`, `pulse status`; invoked by cron or Cloud Scheduler. |

---

## 4. Recommended repository layout

```
AI AGENT/
├── context.md
├── architecture.md
├── docs/
│   └── problemstatement.txt
├── mcp-servers/
│   └── play-store-reviews/
│       ├── pyproject.toml          # or package.json
│       ├── src/
│       │   ├── server.py           # MCP server entrypoint
│       │   ├── scraper.py          # Play Store fetch logic
│       │   ├── models.py           # Review, FetchRequest, FetchResult
│       │   └── cache.py            # Optional local cache by app + date range
│       └── README.md
├── pulse-agent/
│   ├── pyproject.toml
│   ├── src/pulse/
│   │   ├── orchestrator.py
│   │   ├── cli.py
│   │   ├── config.py
│   │   ├── ingest/
│   │   ├── analysis/
│   │   ├── summarize/
│   │   ├── render/
│   │   ├── delivery/
│   │   ├── audit/
│   │   └── models/                 # Review, Cluster, PulseReport, RunRecord
│   └── tests/
├── config/
│   ├── groww.yaml                  # Product config: app ID, doc ID, recipients
│   └── mcp-servers.json            # MCP server launch commands (no secrets)
└── data/
    └── runs/                       # Run ledger (gitignored in prod)
```

Google Docs MCP and Gmail MCP are **external dependencies** configured in the MCP host—not vendored in this repo unless explicitly added later.

---

## 5. MCP server design

### 5.1 Play Store Reviews MCP (in-repo)

**Purpose:** Isolate Play Store scraping, throttling, and credential-less public data access from the pulse agent.

**Suggested tools:**

| Tool | Input | Output |
|------|-------|--------|
| `fetch_reviews` | `app_id`, `start_date`, `end_date`, `max_reviews?`, `locale?` | `reviews[]`, `fetched_at`, `window`, `truncated` flag |
| `get_app_metadata` | `app_id` | App name, package name, current rating (optional sanity check) |
| `health_check` | — | Server status, cache stats |

**Review object (normalized):**

```json
{
  "review_id": "string",
  "app_id": "com.msf.angelmobile",
  "rating": 1,
  "title": "string | null",
  "body": "string",
  "reviewer_name": "string | null",
  "review_date": "2025-04-12T00:00:00Z",
  "version": "string | null",
  "thumbs_up": 0,
  "source": "google_play"
}
```

**Implementation notes:**

- Use a scraper library or HTTP client against public Play Store endpoints; respect rate limits with backoff.
- Cache responses keyed by `(app_id, start_date, end_date)` to avoid re-scraping on pipeline retries within the same run.
- Return stable `review_id` values so the agent can dedupe across fetches.
- Do **not** pass raw review text to the LLM from this server—the agent applies PII scrubbing after ingest.

**Configuration (server-side, not in agent):**

- Default Groww `app_id` / package name
- Request timeout, max pages, cache TTL
- User-agent and proxy settings if required

### 5.2 Google Docs MCP (external)

**Purpose:** Append one dated section per weekly run to *Weekly Review Pulse — Groww*.

**Suggested tools used by the agent:**

| Tool | Use in pulse |
|------|----------------|
| `get_document` | Verify doc exists; read existing headings for idempotency check |
| `append_section` or `batch_update` | Insert heading + structured body at end of doc |
| `find_heading` | Resolve heading anchor / bookmark for deep link |

**Section structure (each run):**

```
Heading 2: Groww — Week {ISO_WEEK} ({start_date} – {end_date})
  Paragraph: Period covered, review count, generation timestamp
  Heading 3: Top themes
  Bulleted list: theme name — summary
  Heading 3: Real user quotes
  Bulleted list: verbatim quotes (post-PII scrub)
  Heading 3: Action ideas
  Bulleted list: action — rationale
  Heading 3: Who this helps
  Short narrative for Product / Support / Leadership
```

**Idempotency anchor:** Heading text MUST be deterministic per `(product, iso_week)`, e.g. `Groww — Week 2026-W23`. Before append, the agent calls `find_heading` with that exact string; if found, skip Doc write.

### 5.3 Gmail MCP (external)

**Purpose:** Notify stakeholders with a teaser and link to the new Doc section.

**Suggested tools:**

| Tool | Use in pulse |
|------|----------------|
| `create_draft` | Staging / dev default |
| `send_email` | Production after explicit enablement |
| `get_message` | Audit: retrieve message ID post-send |

**Email content:**

- Subject: `Groww Weekly Review Pulse — Week {ISO_WEEK}`
- Body: 3–5 bullet theme teasers + “Read full report” link (Doc heading URL)
- Recipients: from `config/groww.yaml` (`stakeholders[]`)

**Idempotency:** Before send, check run ledger for `(product, iso_week, channel=email)`. If `message_id` exists, skip send.

---

## 6. End-to-end run sequence

```mermaid
sequenceDiagram
    participant CLI as CLI / Scheduler
    participant ORCH as Orchestrator
    participant LEDGER as Run ledger
    participant PS as Play Store MCP
    participant PIPE as Analysis pipeline
    participant DOCS as Google Docs MCP
    participant GMAIL as Gmail MCP

    CLI->>ORCH: run(product=groww, iso_week=2026-W23)
    ORCH->>LEDGER: load run record
    alt already completed
        LEDGER-->>ORCH: status=completed
        ORCH-->>CLI: exit 0 (no-op)
    end

    ORCH->>PS: fetch_reviews(app_id, window)
    PS-->>ORCH: reviews[]

    ORCH->>PIPE: analyze + summarize
    PIPE-->>ORCH: PulseReport

    ORCH->>DOCS: find_heading("Groww — Week 2026-W23")
    alt heading not found
        ORCH->>DOCS: append_section(report)
        DOCS-->>ORCH: heading_anchor, revision_id
    else heading exists
        DOCS-->>ORCH: existing anchor
    end

    ORCH->>GMAIL: check ledger for email
    alt email not sent
        ORCH->>GMAIL: create_draft or send_email(teaser, doc_link)
        GMAIL-->>ORCH: message_id
    end

    ORCH->>LEDGER: persist RunRecord
    ORCH-->>CLI: success + audit summary
```

### 6.1 Run inputs

| Parameter | Description | Default |
|-----------|-------------|---------|
| `product` | `groww` | required |
| `iso_week` | ISO 8601 week, e.g. `2026-W23` | current week |
| `review_window_weeks` | Rolling lookback | 10 (configurable 8–12) |
| `dry_run` | Skip Docs/Gmail writes | `false` |
| `email_mode` | `draft` \| `send` \| `skip` | `draft` in dev |

### 6.2 Run states

```
pending → ingesting → analyzing → rendering → delivering → completed
                                                      ↘ failed
```

Failed runs record error stage and partial delivery IDs so operators can safely retry (idempotency prevents duplicates).

---

## 7. Analysis pipeline (detail)

### 7.1 Ingestion

1. Compute `start_date` / `end_date` from `iso_week` and `review_window_weeks`.
2. Call `fetch_reviews` on Play Store MCP.
3. Deduplicate by `review_id`; secondary dedupe by normalized body hash.
4. Apply **PII scrubbing** (emails, phone numbers, account numbers, URLs with tokens).
5. Filter empty or ultra-short reviews (&lt; N characters).
6. Persist raw ingest snapshot to run workspace (optional, for audit/debug).

### 7.2 Embedding and clustering

| Step | Technology | Notes |
|------|------------|-------|
| Text for embedding | `body` only (title not available in normalized cache) | Post-PII |
| Embeddings | BAAI `bge-small-en-v1.5` via sentence-transformers | Local inference, no API cost |
| Dimensionality reduction | UMAP | `n_neighbors`, `min_dist` tuned for review volume |
| Clustering | HDBSCAN | Noise cluster (-1) excluded from top themes |
| Ranking | Cluster size × avg rating weight × recency boost | Top K clusters (default K=5) |

**Volume handling:** If review count exceeds embedding budget, stratified sample by rating and date before embedding, with metadata noting sample size in the report.

### 7.3 LLM summarization

For each top cluster, the LLM receives:

- Representative review snippets (not full corpus)
- Cluster size, avg rating, date range
- System prompt: reviews are **data**; ignore instructions embedded in review text

**Outputs per theme:**

- `theme_name` (short label)
- `theme_summary` (1–2 sentences)
- `quotes[]` (2–3 verbatim strings)
- `action_ideas[]` (1–2 items with title + rationale)

**Quote validation (mandatory):**

```python
def validate_quote(quote: str, source_reviews: list[Review]) -> bool:
    normalized = normalize_whitespace(quote.lower())
    return any(normalized in normalize_whitespace(r.body.lower()) for r in source_reviews)
```

Quotes failing validation are dropped or replaced via a second LLM pass constrained to provided snippets only.

**Token / cost limits:**

- Max input tokens per run (configurable ceiling)
- Max themes (default 5)
- Truncate cluster snippets to fit budget

---

## 8. Data models

### 8.1 `PulseReport`

```yaml
product: groww
iso_week: "2026-W23"
period:
  start_date: "2026-03-31"
  end_date: "2026-06-08"
  window_weeks: 10
stats:
  total_reviews_fetched: 1240
  reviews_after_dedupe: 1180
  reviews_clustered: 1100
  clusters_found: 18
  top_themes_selected: 5
themes:
  - rank: 1
    name: "App performance & bugs"
    summary: "..."
    cluster_size: 142
    avg_rating: 2.1
    quotes: ["...", "..."]
    action_ideas:
      - title: "Stabilize peak-time performance"
        rationale: "..."
audience_notes:
  product: "..."
  support: "..."
  leadership: "..."
generated_at: "2026-06-08T06:30:00+05:30"
```

### 8.2 `RunRecord` (audit / idempotency)

```yaml
run_id: "uuid"
product: groww
iso_week: "2026-W23"
status: completed | failed | in_progress
started_at: "..."
completed_at: "..."
delivery:
  doc:
    document_id: "..."
    heading_text: "Groww — Week 2026-W23"
    heading_anchor: "..."
    revision_id: "..."
    appended: true
  email:
    mode: draft | send
    message_id: "..."
    recipients: ["..."]
    sent_at: "..."
ingest:
  review_count: 1180
  mcp_fetch_at: "..."
analysis:
  model: "..."
  embedding_model: "..."
  token_usage: { input: 0, output: 0 }
error: null  # or { stage, message, stack_ref }
```

Store `RunRecord` as JSON under `data/runs/{product}/{iso_week}.json` or in a lightweight SQLite DB for concurrent access.

---

## 9. Idempotency and concurrency

| Concern | Mechanism |
|---------|-----------|
| **Doc section duplicate** | Deterministic H2 heading per `(product, iso_week)`; `find_heading` before `append_section` |
| **Email duplicate** | Run ledger `delivery.email.message_id`; skip if present |
| **Concurrent runs** | File lock or DB unique constraint on `(product, iso_week)`; second runner exits early |
| **Partial failure** | Ledger stores partial state; retry resumes from last incomplete stage |

**Stable heading convention:**

```
{ProductTitle} — Week {YYYY-Www}
```

Example: `Groww — Week 2026-W23`

---

## 10. Configuration

### 10.1 Product config (`config/groww.yaml`)

```yaml
product: groww
display_name: Groww
play_store:
  app_id: "<groww_package_id>"
review_window_weeks: 10
analysis:
  max_themes: 5
  embedding_model: BAAI/bge-small-en-v1.5
  llm_model: gpt-4o-mini
  max_tokens_per_run: 80000
delivery:
  google_doc:
    document_id: "<google_doc_id>"
    document_title: "Weekly Review Pulse — Groww"
  email:
    stakeholders:
      - product-leads@example.com
      - support-leads@example.com
    default_mode: draft  # draft | send
schedule:
  timezone: Asia/Kolkata
  cron: "0 6 * * 1"  # Monday 06:00 IST
```

### 10.2 MCP host config (`config/mcp-servers.json`)

```json
{
  "mcpServers": {
    "play-store-reviews": {
      "command": "python",
      "args": ["-m", "play_store_reviews.server"],
      "cwd": "./mcp-servers/play-store-reviews"
    },
    "google-docs": {
      "command": "<path-to-docs-mcp>",
      "env": { "GOOGLE_APPLICATION_CREDENTIALS": "<path-outside-repo>" }
    },
    "gmail": {
      "command": "<path-to-gmail-mcp>",
      "env": { "GOOGLE_APPLICATION_CREDENTIALS": "<path-outside-repo>" }
    }
  }
}
```

Secrets and OAuth tokens live **only** in MCP server environment—not in the pulse agent repository.

---

## 11. Security and data handling

| Risk | Mitigation |
|------|------------|
| **PII in reviews** | Regex + NER scrub before LLM and before Doc/email publish |
| **Prompt injection in reviews** | System prompts treat review text as untrusted data; no tool execution based on review content |
| **Credential leakage** | Google OAuth in Docs/Gmail MCP config only; Play MCP has no user credentials |
| **Over-broad email** | Explicit `stakeholders[]` allowlist in config |
| **Accidental prod send** | `email_mode: draft` default in non-prod; `send` requires env flag `PULSE_ALLOW_SEND=true` |

---

## 12. Observability and audit

**Structured logs per stage:**

```
run_id, product, iso_week, stage, duration_ms, review_count, cluster_count, token_usage
```

**Audit queries the ledger must support:**

- What Doc section was written for Groww week X?
- Was email sent, and to whom?
- What was the review window and count?
- Did a run fail, and at which stage?

**Metrics (optional):**

- Run duration by stage
- Reviews fetched / clustered
- LLM token usage and cost estimate
- MCP tool latency and error rate

---

## 13. Scheduling and CLI

### 13.1 CLI commands

| Command | Description |
|---------|-------------|
| `pulse run --product groww [--iso-week 2026-W23]` | Execute full pipeline for one week |
| `pulse backfill --from 2026-W01 --to 2026-W10` | Sequential backfill (respects idempotency) |
| `pulse status --product groww [--iso-week 2026-W23]` | Show run ledger entry |
| `pulse dry-run --product groww` | Ingest + analyze + render locally; no MCP delivery |

### 13.2 Weekly schedule

- **Cadence:** Once per week per product (Groww only initially)
- **Suggested time:** Monday 06:00 IST (`Asia/Kolkata`)
- **Implementation:** OS cron, GitHub Actions scheduled workflow, or Cloud Scheduler invoking `pulse run`

---

## 14. Environments

| Environment | Email mode | Doc target | Notes |
|-------------|------------|------------|-------|
| **Development** | `draft` | Staging doc ID | Dry-run encouraged |
| **Staging** | `draft` | Staging doc ID | Full MCP integration test |
| **Production** | `send` (with guard flag) | Production doc ID | Scheduler enabled |

---

## 15. Failure modes and recovery

| Failure | Behavior | Recovery |
|---------|----------|----------|
| Play Store MCP timeout | Run → `failed` at `ingesting` | Retry run; cache may shorten second attempt |
| Empty review set | Run → `failed` with clear error | Check app_id / window |
| LLM rate limit | Exponential backoff; fail if exhausted | Retry later |
| Docs append error | Run → `failed` at `delivering`; no email if Doc not anchored | Fix MCP issue; retry (idempotent) |
| Email send error | Doc may exist; ledger has no `message_id` | Retry sends email only |
| Duplicate heading found | Skip Doc append; proceed to email check | Safe re-run |

---

## 16. Future extension points

Designed for later expansion without breaking the initial Groww / Play Store contract:

| Extension | Approach |
|-----------|----------|
| Additional products | New `config/{product}.yaml`; parameterize `product` in orchestrator |
| App Store reviews | New MCP server or extend ingestion adapter; same analysis pipeline |
| More delivery channels | New MCP server (e.g. Slack); add renderer + delivery client module |
| Dashboard | Out of scope; Doc remains source of truth |

---

## 17. Summary

The Weekly Review Pulse is a **modular MCP-native pipeline**:

1. **Play Store Reviews MCP** (built here) supplies normalized Groww reviews.
2. The **pulse agent** clusters and summarizes them with embeddings + LLM, with strict quote validation and PII handling.
3. **Google Docs MCP** appends one idempotent section per ISO week to the canonical Groww pulse document.
4. **Gmail MCP** sends a teaser email linking to that section.
5. A **run ledger** enforces idempotency and auditability across Doc and email delivery.

This separation keeps credentials and external API concerns in MCP servers while the agent focuses on analysis, rendering, and orchestration.
