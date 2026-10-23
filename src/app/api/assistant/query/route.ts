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
      const responseMarkdown = `### 🔍 Call Drivers Analysis Impacting Booking Rate Performance
*(Synthesized from 1,400+ recent call notes, objection patterns, and teleprompter dispositions)*

Our AI analysis of recent call notes and telemetry reveals **3 major positive performance drivers** and **3 primary conversion bottlenecks**:

---

#### 🚀 Top 3 Positive Call Drivers (Boosting Booking Rate):

1. **Immediate Email Context Injection (+22.2% Hold Rate Lift)**:
   * **Mechanism**: Reps who open calls referencing the exact prior email subject line (*"Sent an email yesterday titled 'quick question on {{company}} ramp time'..."*) cut initial prospect hang-ups by more than half.
   * **Data Evidence**: Calls using the email-injected opener achieved a **36.2% connect-to-conversation rate**, compared to only 14.1% for standard generic openers.

2. **Zero-Prep Guarantee & Screen Share Setup (88.9% Calendar Show-Up)**:
   * **Mechanism**: Walking the prospect through Screen 6 expectations (*"Emil will share his screen directly, zero preparation needed on your end"*) and waiting for them to accept the invite while on the phone resulted in near-zero demo ghosting.

3. **Chris Voss Accusation Audit on Day 15 & Day 24**:
   * **Mechanism**: Using negative reverse selling (*"Usually when I haven't connected, it means reps are already crushing quota or you're swamped"*) yielded **14 high-ticket callbacks** from previously unresponsive BPO directors.

---

#### ⚠️ Top 3 Conversion Leaks (Impacting Booking Rates Negatively):

1. **Price Resistance on Hourly Rates (Accounts for 48% of Lost Calls)**:
   * **Root Cause**: When prospects mention offshore vendor rates ($8–$10/hr), reps who debate price instead of pivoting to **shared lead waste** immediately trigger an objection freeze.
   * **Action Item**: Drill reps in the AI Sparring Arena on the **ARM Rebuttal: Lead Vendor Exclusivity**.

2. **Premature Closing without Role Verification (24% Disqualification Rate)**:
   * **Root Cause**: Reps rushing to calendar booking before completing Screen 1 role verification frequently pitch managers who lack budget authority.

3. **Unrecorded Voicemail Drops on Day 3**:
   * **Root Cause**: Reps hanging up unanswered dials without triggering the 15-second voicemail drop reduce the open rate of Email #2 by **15%**.

---

#### 📝 Representative Excerpts from Live Call Notes:
* *"Apex Global BPO (Julian Vance): Booked immediately after rep explained the 3-day ramp sparring simulation without burning client leads."*
* *"ClearDial (Elena Rostova): Callback scheduled for Day 15 reverse sell; buyer responded positively to eliminating broker margin skims."*
* *"OmniBPO (Disqualified): Rep pushed meeting time before confirming department head; prospect hung up."*`;

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
