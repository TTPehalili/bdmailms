# AI LMS / Boris Outbound Cockpit — B2B Software Product UI Specification

## Objective: Convert "Website Look" to "Dense Enterprise SaaS Software"
Eliminate all landing page aesthetics, oversized marketing text, hero sections, and unnecessary vertical scrolling. 
Transform the interface into a **high-density, multi-pane B2B productivity software** (modeled after Apollo.io, Gong, Linear, and Retool).

---

## 1. Core Architectural Layout (Fixed Viewport, No Page Scroll)
The entire application UI must adhere to a strict **App Shell** with zero global window scrolling:
```
+----------------------------------------------------------------------------------------------------+
| TOP APPLICATION BAR (h-14): Workspace Switcher | Active Campaign | Rep Status | Latency | Profile  |
+-------------------+----------------------------------------------------+---------------------------+
| LEFT PANE (w-72)  | CENTER PANE (flex-1)                               | RIGHT PANE (w-80 or w-96) |
| Navigation &      | Dynamic Telephony & Outreach Workspace             | AI Boris Real-Time HUD    |
| Lead Cadence Queue| - Step Cadence Tabs (Call | Email | LinkedIn)      | - Live Scribe v2 Stream   |
|                   | - Lead Context Banner                              | - Instant ARM Objection   |
|                   | - Dynamic Interactive Script                       |   Trigger Cards           |
|                   | - Call Disposition Bar                             | - Audio Input Visualizer  |
+-------------------+----------------------------------------------------+---------------------------+
```
- **Root Container:** `h-screen w-screen overflow-hidden flex flex-col bg-slate-100 font-sans text-slate-800`
- **Panes:** Individual scrolling (`overflow-y-auto`) inside dedicated pane containers only.

---

## 2. Software Design System & Density Tokens

### Typography & Spacing
- Primary Font: Inter or system font stack with tabular numbers (`font-mono` for metrics/latencies).
- Scale: High density:
  - Micro tags / badges: `text-[11px] font-semibold tracking-wide uppercase`
  - Body & Script content: `text-[13px]` or `text-sm leading-snug`
  - Headers / Pane Titles: `text-sm font-semibold text-slate-900`
- Padding & Gaps: Compact (`p-2.5`, `p-3`, `gap-2`, `space-y-2`), not spacious landing-page padding (`py-12`, `py-20`).

### Color Palette (Professional Light SaaS)
- **App Shell / Backdrop:** `bg-slate-100` with subtle dividers (`border-slate-200`)
- **Active Work Surfaces:** `bg-white border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] rounded-lg`
- **Brand / Primary Action:** `bg-indigo-600 hover:bg-indigo-700 text-white font-medium`
- **Objection ARM Badges:**
  - `[A] Acknowledge`: `bg-amber-50 text-amber-900 border border-amber-200/80`
  - `[R] Respond`: `bg-blue-50 text-blue-900 border border-blue-200/80`
  - `[M] Move`: `bg-emerald-50 text-emerald-900 border border-emerald-200/80`

---

## 3. Pane-by-Pane Software Component Specs

### 1. Top Utility Header (`h-12 border-b border-slate-200 bg-white px-4 flex items-center justify-between`)
- **Left:** Logo mark + Tool name (`BORIS // BPO OUTBOUND ENGINE`) + Badge (`v1.0 MVP`).
- **Center:** Active Campaign selector dropdown + Target ICP indicator (`Logistics 50-200 HC`).
- **Right:** 
  - Audio capture status indicator (`LIVE MIC: Scribe v2` with a pulsing green dot and latency ticker `~180ms`).
  - Rep availability toggle (`On Dial` / `Break`).
  - Keyboard shortcuts cheat sheet modal trigger (`⌘K`).

### 2. Left Pane: Lead Queue & Cadence Stream (`w-72 border-r border-slate-200 bg-slate-50 flex flex-col`)
- Compact Search & Filter bar (`Search leads by name, company, title...`).
- Scrollable Lead List:
  - Each item is a compact data card (`p-2.5 border-b border-slate-200 hover:bg-white cursor-pointer`):
    - Name + LinkedIn icon.
    - Company name + Headcount tag.
    - Cadence status pill (`Day 3: Call 2`).
    - Local time indicator (`EST - 10:15 AM`).

### 3. Center Pane: Operational Outbound Cockpit (`flex-1 bg-white flex flex-col`)
- **Context Bar:** Current prospect title, phone number, email, and auto-mapped custom variables (`Current BPO: Manila Team`, `Budget: $50k/mo`).
- **Channel Tabs:** Compact pill switcher:
  - `[ 📞 Cold Call ]` | `[ ✉️ Email (1-Click) ]` | `[ 💼 LinkedIn Touchpoint ]`
- **Script Canvas:**
  - Dynamic tokenized script with highlighted variables (e.g., `<Company>`, `<Competitor>`).
  - Interactive checkboxes for qualifying criteria (`Budget Confirmed`, `Pain Point Validated`).
- **Bottom Fixed Disposition Bar (`h-14 border-t border-slate-200 px-4 flex items-center justify-between bg-slate-50`):**
  - Instant keyboard hotkey buttons: `[1] Meeting Booked (Space)` | `[2] Gatekeeper` | `[3] Left VM` | `[4] Disqualified`.

### 4. Right Pane: AI Boris HUD & Live Stream (`w-96 border-l border-slate-200 bg-slate-50 flex flex-col p-3 space-y-3`)
- **Header:** "AI BORIS COPILOT" + Live Audio Waveform / Decibel Bar.
- **Active Rebuttal Trigger (Prominent Dock):**
  - Dynamic card that appears instantly when objection triggers:
    - Objection Title badge (`Competitor Lock-in`).
    - **[A] Acknowledge:** Exact script line to de-escalate.
    - **[R] Respond:** Proof point and margin comparison.
    - **[M] Move:** Diagnostic hook question.
- **Live Stream Ticker (Compact Monospace Log):**
  - Transcript window displaying speaker-separated dialogue (`You:` vs `Prospect:`).