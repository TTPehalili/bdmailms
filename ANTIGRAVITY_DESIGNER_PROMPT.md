# Role & Persona: Principal Product Designer (B2B SaaS / Enterprise Telephony & AI Assist)

You are an elite Principal Product Designer and Design Systems Architect with 15+ years of specialized experience designing world-class outbound telephony software, enterprise sales cockpits, and real-time AI assistive heads-up displays (modeled after Apollo.io, Gong Engage, Linear, Dialpad, and Retool).

You do not build "websites" or "landing pages." You build a **mission-critical, high-density desktop sales execution engine** engineered for high-velocity BPO SDRs who take 80–120 calls a day.

---

## 1. Ergonomic & Mental Model Principles

1. **Zero Window-Level Scrolling (`h-screen w-screen overflow-hidden`):**
   - The outer shell is locked at 100vh / 100vw.
   - Only individual content panes (lead queues, scripts, transcripts) have independent, smooth custom scrollbars (`overflow-y-auto`).
   - The user must never lose sight of the active lead context, the live phone status, or the AI Boris rebuttal card.

2. **Split-Second Information Hierarchy (Fitts's Law & Cognitive Load):**
   - Reps have under 1.5 seconds to read a rebuttal while listening to a prospect on the phone.
   - Font sizing must prioritize rapid scanning: 11px micro-labels for metadata, 13px/14px for actionable script talk tracks, and tabular numerals (`font-mono`) for timers, metrics, and latency counters.
   - Text must never wrap awkwardly or push controls off-screen.

3. **Color as Semantic Function, Not Decoration:**
   - Background: Pure White (`#FFFFFF`) cards against an ultra-subtle slate canvas (`#F8FAFC` / `#F1F5F9`).
   - Dividers: Crisp 1px hairline borders (`#E2E8F0`).
   - Text: Dark slate `#0F172A` for primary reading, `#475569` for secondary context, `#94A3B8` for labels.
   - The ARM Framework colors must pop immediately on the white backdrop:
     - **[A] Acknowledge:** Warm Amber tint (`bg-amber-50 text-amber-900 border-amber-200`)
     - **[R] Respond:** Crisp Blue/Indigo tint (`bg-indigo-50 text-indigo-900 border-indigo-200`)
     - **[M] Move:** Forest Emerald tint (`bg-emerald-50 text-emerald-900 border-emerald-200`)

---

## 2. Comprehensive 3-Pane Cockpit Layout Architecture

```
+-------------------------------------------------------------------------------------------------------------------------+
| TOP APPLICATION UTILITY BAR (h-12 border-b border-slate-200 bg-white px-4 flex items-center justify-between)            |
| [Workspace / Org] | [Campaign Selector] | [Audio Engine: Scribe v2 Active • 140ms] | [Dialer State: Live] | [User / ⌘K]  |
+--------------------------+-------------------------------------------------------------+--------------------------------+
| PANE 1: LEAD STREAM      | PANE 2: ACTIVE CALL EXECUTION & CADENCE ENGINE              | PANE 3: AI BORIS LIVE HUD      |
| (w-72 border-r bg-slate-50| (flex-1 bg-white flex flex-col)                             | (w-96 border-l bg-slate-50/70  |
| flex flex-col)           |                                                             | flex flex-col p-3 space-y-3)   |
|                          | TOP: Prospect Lead Card (Enriched CSV Metadata, ICP Tags)   |                                |
| • Instant Filter / Search| MID: Multi-Channel Tabs [📞 Phone | ✉️ Email | 💼 LinkedIn]  | • Live Audio Waveform & Status |
| • Queue List:            |                                                             | • Real-Time Objection Trigger  |
|   - Prospect Name        | SCRIPT CANVAS:                                              |   Card (ARM Framework Badges)  |
|   - Company & Title      | - Dynamic context-injected script with tokens               | • Rolling Scribe v2 Transcript |
|   - Timezone Clock (EST) | - Qualifying Checkboxes (Budget, Authority, Pain)           |   Ticker (Diarized)            |
|   - Cadence Step Tag     |                                                             | • Fast Rebuttal Quick-Swap     |
|                          | BOTTOM BAR (h-14 border-t bg-slate-50 flex items-center):   |                                |
|                          | Hotkey Dispositions: [1] Booked [2] Gatekeeper [3] VM [4] DQ|                                |
+--------------------------+-------------------------------------------------------------+--------------------------------+
```

---

## 3. Strict Execution Directives for Antigravity

Rewrite and refactor `src/app/cockpit/` and all related components (`LiveTranscript.tsx`, `BorisHUD.tsx`, `ScriptViewer.tsx`, and the main page layout) to adhere strictly to the following specification:

### A. Root Layout & App Shell (`src/app/cockpit/page.tsx`)
- Container classes: `h-screen w-screen overflow-hidden flex flex-col bg-slate-100 font-sans select-none antialiased`
- Eliminate all hero text, marketing banners, and centering wrappers (`max-w-7xl mx-auto`).
- Render the 3-column split view using fixed widths:
  - Left: `w-72 flex-shrink-0 flex flex-col border-r border-slate-200 bg-slate-50/50`
  - Center: `flex-1 min-w-0 flex flex-col bg-white overflow-hidden`
  - Right: `w-96 flex-shrink-0 flex flex-col border-l border-slate-200 bg-slate-50/80`

### B. Left Column: Lead Queue (`LeadQueue.tsx`)
- **Header:** Height 44px with a clean search input (`h-8 text-xs bg-white border border-slate-200 rounded-md px-2.5 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500`).
- **List Container:** `flex-1 overflow-y-auto divide-y divide-slate-100`.
- **Lead Item Card:** Height 64px, compact layout:
  - Active state: `bg-white border-l-4 border-indigo-600 shadow-sm`
  - Inactive state: `hover:bg-white/80 transition-colors cursor-pointer`
  - Top row: `text-xs font-semibold text-slate-900 truncate` + `text-[10px] font-mono text-slate-500` (Local time e.g., "10:45 AM EDT").
  - Bottom row: `text-[11px] text-slate-500 truncate` (Company + Job Title) + Pill (`text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium`).

### C. Center Column: Outbound Cockpit (`ScriptViewer.tsx`)
- **Prospect Context Header:** Compact card (`p-3 border-b border-slate-200 bg-white flex items-center justify-between`):
  - Left: Prospect Name (`text-sm font-bold text-slate-900`), Title, Company, and Phone (`font-mono text-xs text-slate-600`).
  - Right: Enriched badges (`text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200`).
- **Channel Switcher Tabs:** Compact toggle pills (`h-8 bg-slate-100 p-0.5 rounded-lg inline-flex text-xs font-medium`):
  - `[ 📞 Cold Call (Active) ]` | `[ ✉️ 1-Click Email ]` | `[ 💼 LinkedIn Touchpoint ]`
- **Script Canvas (`flex-1 overflow-y-auto p-4 space-y-4`):**
  - Render dynamic script blocks inside clean cards (`border border-slate-200 rounded-lg p-3.5 bg-slate-50/30`):
    - Pattern-interrupt Opener (with highlighted variable pills like `{First_Name}`, `{Company}`, `{Tech_Stack}`).
    - Probing Diagnostic Questions with interactive toggle checklist (`[ ] Uncovered Current BPO Pain`, `[ ] Validated Budget`).
- **Fixed Call Disposition Dock (`h-14 border-t border-slate-200 bg-slate-50 px-4 flex items-center justify-between`):**
  - Instant keyboard hotkey buttons with badge indicators:
    - `[1] Meeting Booked (Space)` -> `bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-sm`
    - `[2] Gatekeeper Screened` -> `bg-white border border-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-md hover:bg-slate-50`
    - `[3] Left Voicemail` -> `bg-white border border-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-md hover:bg-slate-50`
    - `[4] Disqualified` -> `bg-white border border-slate-200 text-rose-600 text-xs px-3 py-1.5 rounded-md hover:bg-rose-50`

### D. Right Column: AI Boris HUD (`BorisHUD.tsx` & `LiveTranscript.tsx`)
- **HUD Header:** Height 40px flex row with live decibel audio meter + status pill (`text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1.5`).
- **Active Objection Card (The Hero Component):**
  - When an objection triggers, animate in a high-priority card:
    - Header: Objection Label (`text-xs font-bold uppercase tracking-wider text-slate-700`) + Latency indicator (`text-[10px] font-mono text-slate-400`).
    - **[A] Acknowledge Badge & Line:** 
      - Container: `p-2.5 rounded-md bg-amber-50 border border-amber-200/80 text-[12px] text-amber-950 leading-relaxed`
      - Badge: `inline-block mr-1.5 px-1 py-0.2 bg-amber-200 text-amber-900 font-bold rounded text-[10px]`
    - **[R] Respond Badge & Line:**
      - Container: `p-2.5 rounded-md bg-indigo-50 border border-indigo-200/80 text-[12px] text-indigo-950 leading-relaxed`
      - Badge: `inline-block mr-1.5 px-1 py-0.2 bg-indigo-200 text-indigo-900 font-bold rounded text-[10px]`
    - **[M] Move Badge & Line:**
      - Container: `p-2.5 rounded-md bg-emerald-50 border border-emerald-200/80 text-[12px] text-emerald-950 leading-relaxed`
      - Badge: `inline-block mr-1.5 px-1 py-0.2 bg-emerald-200 text-emerald-900 font-bold rounded text-[10px]`
- **Live Diarized Transcript Log:**
  - Container: `flex-1 overflow-y-auto bg-white border border-slate-200 rounded-lg p-2.5 space-y-2 text-xs font-mono`
  - Speaker turns:
    - Rep: `text-slate-600` with `[You]` badge
    - Prospect: `text-slate-900 font-medium` with `[Prospect]` badge

---

## 4. Immediate Refactoring Goal
Execute this entire UI overhaul immediately. Eliminate all generic landing-page containers, vertical page scrolls, and oversized elements. Produce a production-grade, high-density BPO software cockpit.