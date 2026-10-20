# AI LMS for BPO Business Development Teams - Phase 2 Specification

## Project Overview
Having completed the core Phase 1 real-time audio spike and HUD (Steps 1–6), Phase 2 bridges the knowledge ingestion pipeline and the conversational sparring engine.

Phase 2 focuses on:
1. Multi-format framework document ingestion (.pdf, .docx, .md) with structured ARM parsing & vector embedding generation.
2. The 10 AI Sparring Personas (ElevenLabs Conversational AI Web SDK / Webhooks).
3. Automated post-call QA grading and ARM scoring engine.

---

## 1. Directory Additions for Phase 2
```
ai-lms-bpo/
├── /src
│   ├── /app
│   │   ├── admin
│   │   │   └── frameworks/page.tsx     # Admin document upload & vector sync UI
│   │   ├── sparring
│   │   │   ├── page.tsx                # Sparring Arena lobby (select persona 1-10)
│   │   │   ├── [personaId]/page.tsx    # Live voice sparring room
│   │   │   └── scorecard/[sessionId]/page.tsx # Granular post-call evaluation
│   │   └── api
│   │       ├── frameworks/parse/route.ts # Multi-format document parser & chunker
│   │       └── webhooks/elevenlabs/route.ts # Post-call transcript webhook handler
│   └── /lib
│       ├── parsers/
│       │   ├── pdfParser.ts            # Text extraction for PDF/Word/MD
│       │   └── armExtractor.ts         # LLM extractor: maps text into [A], [R], [M] entries
│       └── qaEvaluator.ts              # QA rubric scorer (Script adherence, ARM execution)
```

---

## 2. Implementation Steps (Steps 7 – 11)

### Step 7: Framework Ingestion & ARM Extraction (`/api/frameworks/parse/route.ts`)
- Build an ingestion route accepting `.pdf`, `.docx`, `.md`, or plain text.
- Parse plain text content from documents.
- Pass content through a structuring prompt to extract standard sales rebuttals into structured JSON:
  ```json
  [
    {
      "objection_category": "Budget",
      "objection_trigger": "We don't have budget right now",
      "arm_acknowledge": "I hear you, fiscal caution is standard right now.",
      "arm_respond": "Most partners shifted existing outsourced overhead to us and saved 25%.",
      "arm_move": "Are you open to seeing how our pricing compares to your current run-rate?"
    }
  ]
  ```
- Generate vector embeddings (1536-dim) for each `objection_trigger` and write them into `public.rebuttal_entries`.

### Step 8: The 10 AI Sparring Personas Configuration
- Define a central persona registry (`src/lib/personas.ts`) configuring:
  1. The Rushed VP
  2. The Iron Gatekeeper
  3. The Incumbent Loyalist
  4. The Frugal CFO
  5. The Burned Director
  6. The Polite Ghoster
  7. The Overwhelmed Head of Ops
  8. The Technical Gatekeeper
  9. The Indecisive Manager
  10. The Aggressive Skeptic
- Configure each persona's system prompt to enforce realistic conversation rules, objection frequency, and positive reaction triggers when reps execute the ARM framework correctly.

### Step 9: Live Sparring Room (`/sparring/[personaId]/page.tsx`)
- Embed the ElevenLabs Conversational AI Web SDK (`@elevenlabs/convai` or WebSocket agent client).
- Display a minimalist visual interface:
  - Agent speaking status / visual wave indicator.
  - Active call timer.
  - Live objectives checklist (e.g., Uncover Pain Point, Handle Main Objection, Ask Closing Question).
  - End Call button that redirects directly to the QA scorecard.

### Step 10: ElevenLabs Post-Call Webhook & Scoring (`/api/webhooks/elevenlabs/route.ts`)
- Receive post-call payload from ElevenLabs containing:
  - `conversation_id`
  - `transcript` (full speaker-tagged turn array)
  - `audio_url`
- Run the QA Evaluator (`src/lib/qaEvaluator.ts`):
  - **Script Adherence Score (0-100%):** Compares pitch against approved framework talk tracks.
  - **ARM Execution Score (0-100%):** Detects whether the rep acknowledged friction or argued defensively.
  - **Talk-to-Listen Ratio.**
  - **Coaching Recommendations:** Strengths, weaknesses, and specific timestamps to review.
- Persist scores and transcript into `public.sparring_sessions`.

### Step 11: Sparring Scorecard View (`/sparring/scorecard/[sessionId]/page.tsx`)
- Visual display of:
  - Overall Performance Grade & ARM Score.
  - Chronological dialogue breakdown with coaching tags on rep responses.
  - "Try Again" vs "Advance to Next Persona" buttons.