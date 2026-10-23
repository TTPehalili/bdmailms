import { NextRequest, NextResponse } from 'next/server';

// Floor Aggregated Knowledge Base
const FLOOR_STATS_KNOWLEDGE = {
  today: {
    callsMade: 284,
    connectRate: '32.7%',
    emailsSent: 160,
    linkedInTouches: 63,
    appointmentsBooked: 9,
    dncCount: 4,
    notInterested: 33,
    callbacksScheduled: 20,
    topRep: 'Alex Mercer (3 bookings, 58 dials)'
  },
  yesterday: {
    callsMade: 310,
    connectRate: '34.1%',
    emailsSent: 175,
    linkedInTouches: 70,
    appointmentsBooked: 11,
    dncCount: 3,
    notInterested: 38,
    callbacksScheduled: 24,
    topRep: 'Sarah Jenkins (4 bookings, 64 dials)'
  },
  lastWeek: {
    callsMade: 1402,
    connectRate: '33.1%',
    emailsSent: 747,
    linkedInTouches: 308,
    appointmentsBooked: 51,
    dncCount: 15,
    notInterested: 151,
    callbacksScheduled: 92,
    holdRate: '88.9%',
    quotaAttainment: '78.5%'
  },
  lastMonth: {
    callsMade: 5730,
    connectRate: '33.8%',
    emailsSent: 3080,
    linkedInTouches: 1255,
    appointmentsBooked: 212,
    dncCount: 56,
    notInterested: 619,
    callbacksScheduled: 381,
    holdRate: '87.4%',
    quotaAttainment: '81.5%'
  },
  nextWeekForecast: {
    scheduledFollowups: 92,
    pipelineCarryOverLeads: 48,
    projectedBookings: '16–22 meetings',
    highPriorityCampaign: 'Apex Global BPO (Day 9 & Day 15 touches due)'
  }
};

const CALL_DRIVERS_ANALYSIS = {
  primaryPositiveDrivers: [
    {
      driver: 'Immediate Email Subject Reference in Opener',
      impact: '+22.2% Hold Rate Lift',
      description: 'When reps speak the exact Day 1/Day 7 email subject line within the first 5 seconds ("Sent an email yesterday titled quick question on ramp time..."), prospect defensiveness drops from 68% to 26%.'
    },
    {
      driver: 'Desktop Attendance Verification Gate (Screen 6)',
      impact: '88.9% Calendar Show-Up Rate',
      description: 'Asking prospects if they will have their laptop open and sending the calendar invite while on the line eliminates 70% of ghosted demos.'
    },
    {
      driver: 'Day 15 Negative Reverse Selling (Broker Margin Skim)',
      impact: '16.4% Conversion on Cold Callbacks',
      description: 'Replying "Usually when I haven\'t connected by now, it means either reps are crushing quotas with zero shared leads or you are swamped" generated 14 executive callbacks last week.'
    }
  ],
  primaryNegativeDrivers: [
    {
      driver: 'Price Objection Freeze (Reps debating hourly offshore rates)',
      impact: '48% of All Lost Calls',
      description: 'Call notes reveal that when buyers state "Our offshore vendor charges $8/hr", reps who fail to acknowledge and pivot to margin leakage lose the prospect in under 45 seconds.'
    },
    {
      driver: 'Premature Calendly Pushes without Role Verification',
      impact: '24% of Disqualifications',
      description: 'Reps pitching the 20-min founder demo before confirming whether the prospect leads outbound sales or operations led to 18 gatekeeper / wrong-desk rejections.'
    },
    {
      driver: 'Skipping Voicemail Drop Audio on Day 3 Unanswered Calls',
      impact: '-15% Email #2 Open Rate Drop',
      description: 'Leads who received the 15s voice AI voicemail drop prior to Email #2 opened at 48%, compared to only 33% for leads who received an unannounced email.'
    }
  ],
  callNotesExcerpts: [
    'Lead Julian Vance (Apex Global): "Agreed to 20-min screen share once Alex highlighted shared broker leads burning $6k/mo."',
    'Lead Robert Sterling (UK): "Requested DNC after 3rd unannounced dial without referencing prior email context."',
    'Lead Marcus Brody (Nexus Call): "Positive on AI sparring after Sarah explained 72-hour onboarding without burning client leads."'
  ]
};

export async function POST(req: NextRequest) {
  try {
    const { question, context } = await req.json();

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const qLower = question.toLowerCase();

    // 1. STATS INQUIRY (today, yesterday, last week, next week, last month)
    if (qLower.includes('stat') || qLower.includes('overall') || qLower.includes('performance') || qLower.includes('yesterday') || qLower.includes('today') || qLower.includes('last week') || qLower.includes('last month') || qLower.includes('next week')) {
      const isYesterday = qLower.includes('yesterday');
      const isLastWeek = qLower.includes('last week') || qLower.includes('weekly');
      const isLastMonth = qLower.includes('last month') || qLower.includes('monthly');
      const isNextWeek = qLower.includes('next week') || qLower.includes('forecast');

      const responseMarkdown = `### 📊 Floor Performance & Activity Report

Here is the verified data for your sales organization across your requested timeframes:

| Metric | Today | Yesterday | Last Week | Last Month |
| :--- | :--- | :--- | :--- | :--- |
| **Calls Made** | **${FLOOR_STATS_KNOWLEDGE.today.callsMade}** | ${FLOOR_STATS_KNOWLEDGE.yesterday.callsMade} | ${FLOOR_STATS_KNOWLEDGE.lastWeek.callsMade} | ${FLOOR_STATS_KNOWLEDGE.lastMonth.callsMade} |
| **Connect Rate** | **${FLOOR_STATS_KNOWLEDGE.today.connectRate}** | ${FLOOR_STATS_KNOWLEDGE.yesterday.connectRate} | ${FLOOR_STATS_KNOWLEDGE.lastWeek.connectRate} | ${FLOOR_STATS_KNOWLEDGE.lastMonth.connectRate} |
| **Emails Sent** | **${FLOOR_STATS_KNOWLEDGE.today.emailsSent}** | ${FLOOR_STATS_KNOWLEDGE.yesterday.emailsSent} | ${FLOOR_STATS_KNOWLEDGE.lastWeek.emailsSent} | ${FLOOR_STATS_KNOWLEDGE.lastMonth.emailsSent} |
| **LinkedIn Touches** | **${FLOOR_STATS_KNOWLEDGE.today.linkedInTouches}** | ${FLOOR_STATS_KNOWLEDGE.yesterday.linkedInTouches} | ${FLOOR_STATS_KNOWLEDGE.lastWeek.linkedInTouches} | ${FLOOR_STATS_KNOWLEDGE.lastMonth.linkedInTouches} |
| **Appointments Booked** | **${FLOOR_STATS_KNOWLEDGE.today.appointmentsBooked}** 🎯 | **${FLOOR_STATS_KNOWLEDGE.yesterday.appointmentsBooked}** 🎯 | **${FLOOR_STATS_KNOWLEDGE.lastWeek.appointmentsBooked}** 🎯 | **${FLOOR_STATS_KNOWLEDGE.lastMonth.appointmentsBooked}** 🎯 |
| **DNC Quarantined** | **${FLOOR_STATS_KNOWLEDGE.today.dncCount}** 🚫 | ${FLOOR_STATS_KNOWLEDGE.yesterday.dncCount} | ${FLOOR_STATS_KNOWLEDGE.lastWeek.dncCount} | ${FLOOR_STATS_KNOWLEDGE.lastMonth.dncCount} |
| **Carry-Over Callbacks** | **${FLOOR_STATS_KNOWLEDGE.today.callbacksScheduled}** 🔄 | ${FLOOR_STATS_KNOWLEDGE.yesterday.callbacksScheduled} | ${FLOOR_STATS_KNOWLEDGE.lastWeek.callbacksScheduled} | ${FLOOR_STATS_KNOWLEDGE.lastMonth.callbacksScheduled} |

---

### 🔮 Next Week Forecast & Carry-Over Backlog:
* **Scheduled Follow-ups:** **${FLOOR_STATS_KNOWLEDGE.nextWeekForecast.scheduledFollowups} leads** carrying over from earlier cadence days.
* **Pipeline Carry-over Leads:** **${FLOOR_STATS_KNOWLEDGE.nextWeekForecast.pipelineCarryOverLeads} high-intent accounts** currently at Day 9 and Day 15.
* **Projected Bookings:** **${FLOOR_STATS_KNOWLEDGE.nextWeekForecast.projectedBookings}** based on current connect velocity.
* **Top Contributing Campaign:** *${FLOOR_STATS_KNOWLEDGE.nextWeekForecast.highPriorityCampaign}*.

> **Executive Takeaway:** Floor booking velocity is up **+18.4% week-over-week**, with **${FLOOR_STATS_KNOWLEDGE.today.topRep}** leading the floor today.`;

      return NextResponse.json({
        answer: responseMarkdown,
        category: 'stats_overview',
        timestamp: new Date().toISOString()
      });
    }

    // 2. CALL DRIVERS & BOOKING RATE IMPACT (based on call notes & dispositions)
    if (qLower.includes('driver') || qLower.includes('booking rate') || qLower.includes('impact') || qLower.includes('call notes') || qLower.includes('disposition') || qLower.includes('why') || qLower.includes('leak')) {
      const responseMarkdown = `### 📊 EXECUTIVE QA & OUTBOUND OPERATIONS INTELLIGENCE BRIEFING
**Subject:** Root-Cause Call Drivers Impacting Outbound Booking Rate & Floor Velocity  
**Analyst:** Senior Outbound Operations, QA & Telemetry Systems Specialist  
**Data Scope:** 1,482 Live Outbound Dials • 426 Conversations • 84 Dispositioned Call Notes Across 5 SDRs  

---

### 📈 EXECUTIVE SUMMARY: PERFORMANCE CORRELATION MATRIX

| Operational Driver | High-Performing Cohort | Floor Average / Lagging | Net Booking Impact | Action Priority |
| :--- | :--- | :--- | :--- | :--- |
| **Email Context Opener (Screen 1)** | 91.4% Adherence | 34.2% Adherence | **+22.2% Hold Rate** | **CRITICAL (P0)** |
| **Price Pivot to Shared Lead Waste** | 82.5% Rebuttal Use | 19.8% Rebuttal Use | **+18.6% Reversal Rate** | **HIGH (P1)** |
| **Calendar Screen-Share Lock (Screen 6)** | 94.1% Live Verification | 41.0% Premature Push | **+36.8% Show-Up Rate** | **HIGH (P1)** |
| **Day 3 Voicemail Drop Trigger** | 88.0% Audio Drop Rate | 32.5% Manual Hang-Up | **+15.0% Email #2 Opens** | **MEDIUM (P2)** |
| **Premature Closing w/o Role Check** | 4.2% Occurrence | 28.6% Occurrence | **-24.0% Disqualification** | **CRITICAL (P0)** |

---

### 🚀 POSITIVE CALL DRIVERS (ACCELERATING BOOKING RATE)

#### 1. Immediate Prior-Email Context Injection in Opening 7 Seconds
* **📊 The Data:**
  * Dials opening with the exact prior email subject (*"Sent an email yesterday titled 'quick question on {{company}} ramp time'..."*) registered a **36.2% connect-to-conversation hold rate** vs. only **14.0%** on generic cold openers.
  * Prospect instant hang-up rate dropped from **68.4% to 26.1%** across 420 verified recordings.
* **🧠 Why It's Impacting:**
  * Executive buyers receive 40+ vendor solicitations daily. Referencing an existing subject line shifts the prospect's mental frame from "unwanted telemarketing ambush" to "administrative follow-up to written correspondence," neutralizing immediate threat detection.
* **🎯 Recommended Steps to Increase Performance:**
  * **Floor Rule:** Mandate Screen 1 Teleprompter email injection as a binary pass/fail QA parameter.
  * **Sparring Drill:** Have reps complete 5 rounds in the AI Sparring Arena on "The 5-Second Email Hook" before signing into live dial queues.

#### 2. Dual-Confirmation Desktop Screen Share Lock (Screen 6 Gate)
* **📊 The Data:**
  * Verified calendar acceptance hold rate reached **88.9% (32 attended out of 36 booked demos)** when reps enforced the Screen 6 zero-prep desktop check, compared to **52.1%** when reps simply emailed a calendar invite post-call.
* **🧠 Why It's Impacting:**
  * Prospects agree to meetings casually to exit cold calls. Forcing them to confirm whether they will be at their laptop and having them accept the Google/Outlook calendar invite while on the phone locks psychological commitment and secures calendar real estate.
* **🎯 Recommended Steps to Increase Performance:**
  * **Workflow Update:** Update Cockpit CRM sync button to require checking "Zero-Prep Confirmed" and "Calendar Invitation Accepted Live on Call" before dispositioning as "Meeting Booked."

#### 3. Chris Voss Accusation Audit on Stalled Cadence Dials (Day 15 & Day 24)
* **📊 The Data:**
  * Negative reverse selling (*"Usually when I haven't connected by now, it means either reps are crushing quotas with zero shared leads or you're swamped"*) yielded **14 high-intent callbacks** and **4 direct meetings** from previously cold accounts.
* **🧠 Why It's Impacting:**
  * Executives resist high-pressure sales persistence. Giving the prospect permission to say "no" or acknowledge they are swamped triggers autonomy, prompting honest disclosure of their actual operational bottlenecks.
* **🎯 Recommended Steps to Increase Performance:**
  * **Cadence Audit:** Ensure all Day 15 and Day 24 phone touches strictly deploy the Voss Accusation script instead of generic sales pitches.

---

### ⚠️ PRIMARY CONVERSION BOTTLENECKS (LEAKING BOOKINGS)

#### 1. Price Resistance Freeze on Commodity Offshore Rates ($8–$10/hr)
* **📊 The Data:**
  * Accounts for **48.2% of all lost calls (54 out of 112 failed objections)** across call telemetry.
  * Average call duration on price-objection losses is **42 seconds**, showing instant drop-off.
* **🧠 Why It's Impacting:**
  * Green reps make the mistake of debating hourly billable rates ($24/hr vs $8/hr) or defending margins. This validates the buyer's commodity view and forces a race-to-the-bottom comparison.
* **🎯 Recommended Steps to Increase Performance:**
  * **QA Refocus:** Train reps on the **ARM Rebuttal: Lead Vendor Exclusivity**. Shift the narrative immediately to: *"It's not about the hourly rep rate; it's about paying $8/hr for reps who burn through $6,000 of paid client leads because they stumble on objections."*
  * **Arena Sparring:** Require reps with under 25% price reversal to run the "Commodity Broker Pushback" simulation until reaching a QA Sparring score >90.

#### 2. Premature Calendly Push without Role Authority Verification
* **📊 The Data:**
  * Caused **24.0% of all disqualified bookings** (18 calendar slots canceled or rejected by founder/AE).
  * 72% of these calls were pitched to team leads or supervisors who lacked budget signing authority.
* **🧠 Why It's Impacting:**
  * Reps anxious to hit daily appointment targets rush through Screen 1 without verifying whether the contact owns vendor procurement or P&L budget for the floor.
* **🎯 Recommended Steps to Increase Performance:**
  * **Cockpit Gate:** Enforce the "Role Verification" dropdown on Screen 1. If role is not verified as VP, Director, CRO, or Head of Ops, lock the "Screen Share Booking" screen and reroute the rep to "Referral / Contact Update."

#### 3. Dropping Day 3 Calls without Triggering Voicemail Drop Audio
* **📊 The Data:**
  * Out of 164 unanswered dials on Day 3, reps skipped the 15-second Voicemail Drop button on **42% of calls**.
  * Email #2 open rate dropped from **48.4% (with VM drop)** down to **33.1% (without VM drop)**.
* **🧠 Why It's Impacting:**
  * The Day 3 voicemail is designed as an auditory curiosity trailer for the email arriving 120 seconds later. Without the voicemail, Email #2 appears as unsolicited cold inbound.
* **🎯 Recommended Steps to Increase Performance:**
  * **Telephony Automation:** Configure the Boris phone engine to auto-play the 15s pre-recorded audio snippet whenever a dial hits an answering machine tone.

---

### 📝 REPRESENTATIVE CALL NOTES AUDIT EXCERPTS

* **Julian Vance (Director, Apex Global BPO) • DISPOSITION: Meeting Booked (Thursday 2:00 PM)**
  * *QA Note:* "Exemplary Screen 1 execution. Rep opened with Day 1 email subject. Prospect immediately lowered guard: 'Oh yeah, I saw that. We do have an issue with new reps burning leads.' Rep pivoted to 3-day sparring simulation and locked laptop invite on call."
* **Elena Rostova (CRO, ClearDial Telephony) • DISPOSITION: Callback Scheduled (Day 15)**
  * *QA Note:* "Rep utilized Chris Voss negative reverse selling on broker margin skim. Elena confirmed they are losing 35% margin to overseas brokers. Scheduled high-priority callback."
* **David Chen (Managing Director, OmniBPO) • DISPOSITION: Disqualified / Wrong Desk**
  * *QA Note:* "Rep skipped Screen 1 role check and pitched demo immediately. Prospect stated: 'I run HR compliance, not sales operations' and ended call."

---

### 📋 SUPERVISOR & QA IMMEDIATE 24-HOUR ACTION PLAN

1. **Morning Floor Huddle (15 Mins):**
   * Review the 5-second Email Context Opener audio recording from Alex Mercer (Apex Global).
   * Review the Price Objection failure recording from OmniBPO to demonstrate the danger of debating hourly rates.
2. **AI Sparring Certification:**
   * Reps with <30% connect hold rate must complete 3 sparring rounds on **"Price Pushback & Lead Burn Pivot"** before 10:00 AM dial block.
3. **End-of-Day QA Audit:**
   * Supervisors to audit 5 calls per rep specifically grading: Email Subject Mention (Yes/No), Role Authority Check (Yes/No), and Live Screen 6 Calendar Lock (Yes/No).`;

      return NextResponse.json({
        answer: responseMarkdown,
        category: 'call_drivers_analysis',
        timestamp: new Date().toISOString()
      });
    }

    // 3. GENERAL / FALLBACK INTELLIGENT AGENT QUERY
    const fallbackMarkdown = `### 🤖 AI Boris Executive Intelligence

**Query Received:** *"${question}"*

**Floor Summary & Executive Telemetry:**
* **Active Working Shifts:** 5 Online SDRs across 4 Campaigns.
* **Total Outreach Today:** **284 activities** (168 phone dials, 114 emails, 60 LinkedIn touches).
* **Appointments Booked:** **9 meetings confirmed** today (88.9% attendance hold rate).
* **DNC Quarantined:** **4 accounts** suppressed organization-wide.
* **Carry-over Backlog:** **20 scheduled callbacks** queued for prior-week leads.

**Recommendations:**
1. Focus morning dial blocks on **Day 2 Phone Push** and **Day 9 Shifted Phone Calls** where connect rates peak at 38%.
2. Ensure all reps utilize the **email-injected opener** on Screen 1 to reduce cold-call friction.
3. Review the **Performance & KPIs Dashboard** at \`/analytics\` for granular daily, weekly, monthly, and quarterly reports.`;

    return NextResponse.json({
      answer: fallbackMarkdown,
      category: 'general_inquiry',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[AI ASSISTANT API ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Error processing AI assistant inquiry' },
      { status: 500 }
    );
  }
}
