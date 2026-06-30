# Weekly Product Review Pulse — Project Context

## Overview

We are building an automated weekly “pulse” that turns public **Google Play Store reviews** for **Groww** into a one-page insight report and delivers it to stakeholders through Google Workspace, using MCP (Model Context Protocol) so that data retrieval and delivery go through dedicated MCP servers—not ad hoc API calls inside the agent.

## Scope (current)

| Dimension | In scope | Out of scope (for now) |
|-----------|----------|------------------------|
| **Product** | Groww only | INDMoney, PowerUp Money, Wealth Monitor, Kuvera, and other products |
| **Data source** | Google Play Store reviews only | Apple App Store, social sources (Twitter, Reddit, etc.) |
| **MCP servers** | Play Store Reviews MCP (built in this project), Google Docs MCP, Gmail MCP | Direct REST/API calls from the agent for Play, Docs, or Gmail |

Future expansion to additional products or App Store reviews is possible but **not part of the initial build**.

---

## Objective

Give product, support, and leadership teams a repeatable, weekly snapshot of what Groww customers are saying in Play Store reviews: themes, representative quotes, and actionable ideas—without manual copy-paste or one-off spreadsheets.

---

## What the system does

1. **Ingest** public Google Play reviews for Groww from the last 8–12 weeks (configurable window), via the **Play Store Reviews MCP Server**.
2. **Cluster and rank** feedback using embeddings and density-based clustering (e.g. UMAP + HDBSCAN), then use an LLM to name themes, pull verbatim quotes, and propose action ideas—with validation so quotes must appear in real review text.
3. **Render** a concise one-page narrative: top themes, quotes, action ideas, and a short “who this helps” section.
4. **Deliver** outputs only through Google Workspace MCP servers:
   - **Google Docs MCP** — append each week’s report as a new dated section to a single running document (e.g. *Weekly Review Pulse — Groww*). The Doc is the system of record and preserves history.
   - **Gmail MCP** — send a short stakeholder email that includes a deep link to the new section in that Doc (heading link), not a duplicate full report in email alone.

The agent is an MCP host/client; it does not embed Google credentials, scrape Play Store directly, or call Docs/Gmail REST APIs for delivery.

---

## Architecture (modular concerns)

| Concern | Where it lives |
|---------|----------------|
| Data retrieval | **Play Store Reviews MCP Server** (developed in this project) |
| Reasoning | Clustering + LLM summarization (themes, quotes, actions) |
| Output generation | Report + email rendering (structured for Docs and HTML/text for Gmail) |
| Human-visible delivery | MCP tools only → Google Docs MCP + Gmail MCP |

### MCP servers in this project

| Server | Role |
|--------|------|
| **Play Store Reviews MCP** | Fetch and expose Groww Play Store reviews for a configurable time window; built as part of this project |
| **Google Docs MCP** | Append weekly pulse sections to the running Groww pulse document |
| **Gmail MCP** | Send stakeholder teaser emails with links to the new Doc section |

---

## Key requirements

- **MCP-based data and delivery:** Reviews come from the Play Store Reviews MCP; Doc append and Gmail send use only their respective MCP tools (e.g. document batch update, draft/create/send flows as defined in architecture).
- **Weekly cadence:** Designed to run once per week for Groww (e.g. scheduled job Monday morning IST), with a CLI for backfill of any ISO week.
- **Idempotent runs:** Re-running the same ISO week must not create duplicate Doc sections or duplicate sends. Enforced with a stable section anchor in the Doc and a run-scoped idempotency check on email (see architecture).
- **Auditable:** Each run records delivery identifiers (e.g. doc heading / message ids) and enough metadata to answer “what was sent when, for which week?”
- **Safety and quality:** PII scrubbing on review text before LLM and before publishing; reviews treated as data, not instructions; cost/token limits per run.

---

## Non-goals (explicit)

- Multiple products in the initial release (Groww only).
- Apple App Store or any non–Play Store review source in the initial release.
- A generic Google Workspace product beyond what the pulse needs (Docs append + Gmail send/draft).
- Real-time streaming analytics or a BI dashboard (the running Google Doc is the living artifact).
- Social sources (Twitter, Reddit, etc.).
- Storing Google OAuth or Play Store credentials in the agent codebase—they belong in the MCP servers’ configuration.

---

## Who this helps

| Audience | Value |
|----------|--------|
| Product | Prioritize roadmap from recurring themes |
| Support | Spot repeating complaints and quality issues |
| Leadership | Fast health snapshot tied to customer voice |

---

## Sample output (illustrative)

**Groww — Weekly Review Pulse**  
*Period: Last 8–12 weeks (rolling window)*

### Top themes

- **App performance & bugs** — Lag, crashes during trading hours; login/session timeouts.
- **Customer support friction** — Slow responses; unresolved tickets.
- **UX & feature gaps** — Confusing navigation for portfolio insights; missing advanced analytics.

### Real user quotes

- “The app freezes exactly when the market opens, very frustrating.”
- “Support takes days to reply and doesn’t solve the issue.”
- “Good for beginners but lacks detailed analysis tools.”

### Action ideas

- **Stabilize peak-time performance** — Scale infra during market hours; improve crash visibility.
- **Improve support SLA visibility** — Expected response time in-app; ticket status tracking.
- **Enhance power-user features** — Advanced portfolio analytics; clearer investments navigation.

---

## Delivery expectations (stakeholder-facing)

- Each run adds one clearly labeled section to the Groww pulse Google Doc (dated / week-labeled).
- The email is a brief teaser (e.g. top themes as bullets) plus a “Read full report” link to that section.
- Development/staging may default to draft-only email until explicit confirmation to send, per implementation plan.

---

## What this solves

Roadmap alignment for product, issue clustering for support, and a leadership-friendly snapshot—automated from **Groww Play Store reviews**, archived in Google Docs, and announced by email with a link back to the canonical section.
