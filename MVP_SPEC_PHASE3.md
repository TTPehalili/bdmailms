# AI LMS for BPO Business Development Teams - Phase 3 Specification

## Project Overview
Having completed the core audio spike (Phase 1, Steps 1–6) and the knowledge ingestion & sparring evaluation engine (Phase 2, Steps 7–11), Phase 3 delivers:
1. **Design System Refresh:** Migration to an executive light theme (clean slate/indigo/white palette) optimized for high-density BPO work.
2. **AI Boris Certification Gate:** 3-5 attempt threshold rule, ElevenLabs certification agent widget, and automated supervisor endorsements.
3. **Official Digital Certificate Engine:** Dynamic HTML/CSS-to-PDF certificate generation with manager signatures, official seals, and verification IDs.
4. **Super Admin CRM & Cadence Module:** CSV auto-mapping, lead queue assignment, and context-injected multi-channel cadence generator (Cold Call, Email, LinkedIn).

---

## 1. Design System Refresh: Clean Executive Light Palette
Update Tailwind configuration and global CSS to eliminate dark mode:
- **Base Background:** `#F8FAFC` (Slate-50) / `#FFFFFF` (Pure White cards)
- **Primary Accent:** `#4F46E5` (Indigo-600) with hover `#4338CA` (Indigo-700)
- **Neutral Borders:** `#E2E8F0` (Slate-200)
- **Primary Typography:** `#0F172A` (Slate-900)
- **Muted Typography:** `#64748B` (Slate-500)
- **Status Badges:**
  - [A] Acknowledge: Amber-50 bg, Amber-700 text, Amber-200 border
  - [R] Respond: Indigo-50 bg, Indigo-700 text, Indigo-200 border
  - [M] Move: Emerald-50 bg, Emerald-700 text, Emerald-200 border

---

## 2. Directory Additions for Phase 3
```
ai-lms-bpo/
├── /src
│   ├── /app
│   │   ├── certification/
│   │   │   ├── page.tsx                # AI Boris Certification Room (Attempt Counter)
│   │   │   └── certificate/[certId]/page.tsx # View & Download Verified Certificate
│   │   ├── admin
│   │   │   ├── campaigns/[id]/leads/page.tsx # CSV upload, auto-mapping & lead table
│   │   │   └── reps/page.tsx           # Rep roster, certification status & assign campaigns
│   │   └── api
│   │       ├── certification/attempt/route.ts # Tracks 3-5 attempts & threshold pass/fail
│   │       ├── certificate/generate/route.ts  # Issues digital PDF certificate
│   │       └── leads/import-csv/route.ts      # CSV parser with auto-column mapping
│   └── /lib
│       ├── certificateRenderer.ts      # HTML5/CSS vector certificate renderer
│       └── cadenceGenerator.ts         # Injects lead metadata into cold outreach scripts
```

---

## 3. Implementation Steps (Steps 12 – 16)

### Step 12: Executive Light Theme Overhaul
- Update `tailwind.config.ts` and `src/app/globals.css`:
  - Enforce light mode as default: `@layer base { body { @apply bg-slate-50 text-slate-900; } }`.
  - Refactor `LiveTranscript.tsx`, `BorisHUD.tsx`, and `ScriptViewer.tsx` to use crisp white containers (`bg-white border border-slate-200 shadow-sm rounded-xl`).
  - Upgrade the ARM badges to light-tinted cards with high-contrast text.

### Step 13: AI Boris Certification Gate (`/certification/page.tsx`)
- Display the dedicated ElevenLabs Boris Certification Agent widget.
- Rule Engine:
  - Rep must complete between 3 to 5 attempts (configured by Super Admin).
  - Calculates rolling or best score (passing threshold e.g., >= 85%).
  - Tracks attempt number and locks the gate once attempts are exhausted or passed.
  - Generates comprehensive endorsement summary: "Readiness for Live Floor" vs "Needs Remediation".

### Step 14: Dynamic Training Certificate Engine (`/api/certificate/generate/route.ts`)
- Triggered upon passing the Certification Gate.
- Injects dynamic parameters:
  - Rep Name
  - Campaign Name & BPO Track
  - Passing Score & Date
  - Unique Verification Hash / Certificate ID
  - Digital Signatures (Supervisor & Operations Manager)
- Generates a print-ready vector PDF/PNG using clean HTML5/CSS template.
- Persists record into `public.rep_certifications`.

### Step 15: CSV Import with Auto-Column Mapping (`/admin/campaigns/[id]/leads/page.tsx`)
- Install CSV parsing engine (`papaparse`).
- Implement intelligent column auto-detection (e.g., matches "Email", "E-mail", "Email Address" -> `email`).
- Allows Super Admin to map custom variables (e.g., "Tech Stack", "Current Outsourcer", "Annual Revenue") into `leads.custom_variables` JSONB.
- Mass-assigns imported lead batches to specific SDRs/BDRs.

### Step 16: Context-Injected Live Cadence Engine (`src/lib/cadenceGenerator.ts`)
- When a rep selects a lead from their queue:
  - Pulls the lead's enriched CSV attributes (`custom_variables`).
  - Queries `framework_documents` for the campaign's active cadence step.
  - Automatically synthesizes tailored outreach copy for:
    1. Cold Call Opener & Diagnostic Questions.
    2. Follow-up 1-to-1 Cold Email.
    3. Custom LinkedIn Connection & InMail sequence.