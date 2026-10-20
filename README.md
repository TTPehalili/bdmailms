# Appointmentlyy SDR — AI Boris Live Cockpit & LMS

High-performance Sales Enablement Cockpit & Simulation LMS for BPO Outbound Teams.

## Architecture & Core Capabilities

- **16kHz Web Audio Streaming** (`src/lib/audio/micStream.ts`):
  Captures low-latency 16-bit Mono Linear PCM chunks via Web Audio API with hardware acoustic echo cancellation, noise suppression, and auto-gain control. Includes live VU RMS volume calculation.

- **ElevenLabs Scribe v2 Client** (`src/lib/audio/scribeSocket.ts`):
  Streams raw PCM packets to ElevenLabs Scribe v2 realtime STT via WebSockets. Emits interim live transcripts and forwards finalized phrases to the objection interceptor.

- **ARM Rebuttal Engine** (`src/app/api/rebuttal/route.ts`):
  Multi-tier objection classifier (Rule Engine -> Supabase pgvector `match_rebuttals` -> Gemini AI Flash inference) returning structured ARM payloads:
  - **[A] Acknowledge**: Tactical empathy phrase neutralizing prospect defensiveness.
  - **[R] Respond**: Value reframe dismantling the objection without arguing.
  - **[M] Move**: Low-friction micro-commitment diagnostic CTA.

- **Rep Cockpit HUD** (`src/app/cockpit/page.tsx`):
  Real-time dark-theme interface with mic toggle, visual sound level meter, auto-scrolling conversation ticker, and instant ARM rebuttal cards with one-click copy buttons and latency telemetry.

- **Supabase PostgreSQL Schema** (`supabase/schema.sql`):
  - `profiles`: User roles (`super_admin`, `manager`, `sales_rep`) with RLS.
  - `campaigns`: Target ICP and context metadata.
  - `framework_documents`: Document uploads (`.pdf`, `.docx`, `.md`).
  - `rebuttal_entries`: Vector extension (`vector(1536)`), HNSW index, and `match_rebuttals` RPC.
  - `sparring_sessions`: Simulation records with transcripts and scoring.
  - `rep_certifications`: Skill mastery tracking per campaign.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   Copy `.env.example` to `.env.local` and add your keys:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ELEVENLABS_API_KEY`
   - `GOOGLE_API_KEY`

3. Apply Supabase migration:
   Execute `supabase/schema.sql` in your Supabase SQL Editor:
   `https://supabase.com/dashboard/project/uxxswbukdhdxmylrjoej`

4. Run locally:
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:3000/cockpit`.
