# AI LMS for BPO Teams — Master Antigravity Plan

## System Objective
Build an AI-powered Sales Enablement Cockpit & Simulation LMS for BPO Outbound Teams.
The primary immediate deliverable is **Phase 1: The AI Boris Live Audio & Rebuttal Spike**.

---

## Architecture & Data Flow (Phase 1)
1. Browser captures audio via `navigator.mediaDevices.getUserMedia` (with acoustic echo cancellation for mobile loudspeaker).
2. `micStream.ts` downsamples audio to 16kHz 16-bit Mono PCM.
3. `scribeSocket.ts` establishes a secure WebSocket connection with ElevenLabs Scribe v2 Realtime STT.
4. Finalized transcripts are analyzed for prospect objections.
5. Detected objections query Supabase `pgvector` for matching company talk tracks, and/or invoke a fast inference LLM to generate structured **ARM (Acknowledge, Respond, Move)** rebuttals.
6. The Boris Cockpit UI displays the objection card with distinct color-coded ARM badges in sub-second latency.

---

## Step-by-Step Build Instructions

### Step 1: Initialize Next.js Project & Dependencies
Run inside the project root:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
npm install @supabase/supabase-js lucide-react clsx tailwind-merge