# AI LMS for BPO Business Development Teams - Phase 4 Specification

## Project Overview
Having completed:
- **Phase 1 (Steps 1–6):** Live Audio Spike, ElevenLabs Scribe v2 STT, and ARM Rebuttal HUD.
- **Phase 2 (Steps 7–11):** Knowledge Base Ingestion, 10 Sparring Personas, and QA Scoring Webhooks.
- **Phase 3 (Steps 12–16):** Executive Light Theme, AI Boris Certification Gate, Dynamic Certificate Generation, and CSV Auto-Mapping CRM.

**Phase 4: Production Hardening, Multi-Channel Execution & Supervisor Analytics (Steps 17–20)** finishes the MVP for live operational deployment across outbound BPO teams.

---

## 1. Directory Additions for Phase 4
```
ai-lms-bpo/
├── /src
│   ├── /app
│   │   ├── admin
│   │   │   ├── analytics/page.tsx      # Floor-wide rep performance & objection matrix heatmap
│   │   │   └── audit-log/page.tsx      # Session transcripts & supervisor compliance override
│   │   └── api
│   │       ├── export/leads/route.ts   # Export CRM data with auto-disposition & rep notes
│   │       ├── analytics/overview/route.ts # Aggregate floor metrics (ARM pass rate, talk/listen)
│   │       └── cadence/email-preview/route.ts # 1-click email draft generator with context injection
│   └── /lib
│       ├── analyticsEngine.ts          # Aggregates objection trends & rep certification velocity
│       └── emailFormatter.ts           # Formats plain-text cold email templates with lead variables
```

---

## 2. Implementation Steps (Steps 17 – 20)

### Step 17: Multi-Channel Cadence Execution (Cold Email & LinkedIn One-Click Launcher)
- Expand `src/app/cockpit/components/ScriptViewer.tsx` to handle tabbed outbound execution:
  - **Phone Call Tab:** Live opener, discovery triggers, and objection HUD.
  - **Cold Email Tab:** Auto-generates the personalized 3-sentence outreach email based on lead context and framework. Adds a "Copy to Clipboard" and `mailto:` one-click launcher.
  - **LinkedIn Outbound Tab:** Pre-populates the 300-character personalized connection request and follow-up InMail.
- Add instant disposition logging (`Connected`, `Voicemail`, `Gatekeeper Rejection`, `Meeting Booked`) that updates `leads.status` and increments `leads.current_cadence_step`.

### Step 18: Floor-Wide Analytics & Objection Heatmap (`src/app/admin/analytics/page.tsx`)
- Build the executive dashboard for BPO Supervisors & Operations Managers:
  - **Floor Certification Velocity:** % of reps certified vs. in remediation.
  - **ARM Adherence Rate:** Team-wide % score on acknowledging objections before responding.
  - **The Objection Heatmap:** Visual ranking of which objections reps struggle with most across sparring sessions (e.g., 68% fail rate on "Incumbent Loyalist" vs. 15% on "Timing").
  - **Rep Leaderboard:** Average sparring score, attempts needed to pass Boris, and total cadence tasks completed.

### Step 19: Supervisor Review & Coaching Override (`src/app/admin/audit-log/page.tsx`)
- Allow Supervisors to review recorded sparring sessions and AI Boris certification attempts:
  - Full transcript playback with tagged timestamps.
  - Ability for the Supervisor to append manual coaching notes and override an automated AI score if the rep demonstrated exceptional human rapport.
  - "Endorse to Production Floor" manual trigger with email notification to the rep.

### Step 20: Pre-Flight Production Readiness & End-to-End Test Suite
- Validate the full end-to-end loop:
  1. Super Admin uploads BPO framework (`.pdf` / `.docx`) -> ARM rebuttals populate.
  2. Super Admin uploads CSV -> Leads auto-map and assign to SDR.
  3. Rep accesses Cockpit -> Selects lead -> Audio listens via Scribe v2 -> Fires sub-second ARM cards.
  4. Rep spars with 10 Personas -> Receives instant QA scorecard.
  5. Rep enters AI Boris Certification Gate -> Completes attempts -> Digital Certificate issues with verification ID.