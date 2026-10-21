import { NextRequest, NextResponse } from 'next/server';
import { SPARRING_PERSONAS, SparringPersona } from '@/lib/personas';

function extractJson(text: string) {
  try {
    const stripped = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const match = stripped.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    return JSON.parse(stripped);
  } catch {
    return null;
  }
}

// Persona-specific contextual fallback logic that acts as an authentic adversarial sparring partner
function generateContextualFallback(
  persona: SparringPersona,
  repMessage: string,
  history: Array<{ role: string; content: string }>
): { reply: string; completedIds: string[]; sentiment: string; armObservation: string } {
  const lower = repMessage.toLowerCase();
  const pastReplies = history
    .filter(t => t.role === 'prospect')
    .map(t => t.content.toLowerCase());
  const turnCount = history.filter(t => t.role === 'rep').length;

  const hasEmpathy = lower.includes('understand') || lower.includes('hear you') || lower.includes('fair') || lower.includes('appreciate') || lower.includes('makes sense');
  const hasValue = lower.includes('benchmark') || lower.includes('diagnostic') || lower.includes('sla') || lower.includes('rate') || lower.includes('conversion') || lower.includes('drop-off') || lower.includes('percent') || lower.includes('%') || lower.includes('save') || lower.includes('pipeline');
  const hasClose = (lower.includes('?') || lower.includes('open to') || lower.includes('calendar')) && (lower.includes('tuesday') || lower.includes('thursday') || lower.includes('minute') || lower.includes('review') || lower.includes('compare') || lower.includes('diagnostic'));
  const isAskingQuestion = lower.includes('?') && (lower.includes('how do you') || lower.includes('what is') || lower.includes('who') || lower.includes('tell me') || lower.includes('why'));

  let candidateReplies: string[] = [];
  let completedIds: string[] = [];
  let sentiment = 'skeptical';
  let armObservation = 'Prospect raised cold-call friction.';

  if (persona.id === 'bpo-directory-buyer') {
    // Julian Vance (BPO Directory Buyer / Outsource Accelerator user)
    const mentionsOA = lower.includes('outsource accelerator') || lower.includes('directory') || lower.includes('broker') || lower.includes('lead vendor') || lower.includes('oa');
    const mentionsSharedTrap = lower.includes('shared') || lower.includes('price war') || lower.includes('3 to 5') || lower.includes('margin') || lower.includes('cheaper') || lower.includes('8');
    const mentionsEmil = lower.includes('emil') || lower.includes('17 years') || lower.includes('claude') || lower.includes('sparring');

    if (turnCount >= 2 && (mentionsEmil || (hasEmpathy && hasValue)) && hasClose) {
      candidateReplies = [
        "If Emil has 17 years in the BPO space and can show us private lists that aren't shared on directories, I'll take a look Thursday at 2:00 PM.",
        "Alright, if it's strictly a 20-minute screen share with Emil to see how the sparring simulator works on our floor, put Friday morning on my calendar."
      ];
      completedIds = persona.objectives.map(o => o.id);
      sentiment = 'agreed';
      armObservation = 'Rep executed BPO playbook and locked 20-min demo with Founder Emil.';
    } else if (isAskingQuestion) {
      candidateReplies = [
        "Why are you asking about our internal SDR floor? We buy our lists from directories and hit quota. What are you actually selling?",
        "I don't share internal operational headcounts with cold callers. What makes your model different from Outsource Accelerator?"
      ];
      completedIds = [];
      sentiment = 'hostile';
      armObservation = 'Prospect challenged unsolicited qualification.';
    } else if (mentionsSharedTrap || lower.includes('price') || lower.includes('competing')) {
      candidateReplies = [
        "Yeah, that is a headache. We pay top dollar for directory lists and our reps are in a dogfight against four other BPOs pitching the same client. How do you stop that?",
        "It's true—clients on shared lists always try to grind us down to eight dollars an hour. But our senior reps know how to close. What's your alternative?"
      ];
      completedIds = [persona.objectives[0].id, persona.objectives[1].id];
      sentiment = 'softened';
      armObservation = 'Prospect confirmed shared-lead price war trap.';
    } else if (mentionsOA || hasEmpathy) {
      candidateReplies = [
        "Yeah, we know Outsource Accelerator—we buy from them every month. Our senior reps don't need roleplay practice. Why are you calling me?",
        "Yes, we use directories. But my team has years of experience in the BPO space. Why would we need an AI simulator?"
      ];
      completedIds = [persona.objectives[0].id];
      sentiment = 'neutral';
      armObservation = 'Prospect acknowledged directory lead sourcing but defended veteran reps.';
    } else {
      candidateReplies = [
        "Look, we already buy all our leads from Outsource Accelerator and our senior reps don't need roleplay. What is this regarding?",
        "I'm heading into an operational review with our Manila floor. Give me the headline—what does this actually solve?"
      ];
      completedIds = [];
      sentiment = 'skeptical';
      armObservation = 'Prospect raised initial BPO directory defense.';
    }
  } else if (persona.id === 'incumbent-loyalist') {
    // David Reynolds (Incumbent Loyalist)
    if (turnCount >= 2 && hasEmpathy && hasValue && hasClose) {
      candidateReplies = [
        "Look, if it's strictly a 10-minute SLA benchmark comparison and not a pitch to fire my agency, send an invite for Thursday at 10:30 AM.",
        "Fair enough. If you can actually show where our incumbent has conversion blindspots in 10 minutes without disrupting our team, put Thursday on my calendar."
      ];
      completedIds = persona.objectives.map(o => o.id);
      sentiment = 'agreed';
      armObservation = 'Rep executed full ARM framework and earned 10-minute benchmark.';
    } else if (isAskingQuestion) {
      candidateReplies = [
        "Why are you asking about our internal SDR workflow? We have an established partner who manages that. What are you actually offering?",
        "I don't share our internal metrics with cold callers. If you know our space, tell me what specific bottleneck you think we have."
      ];
      completedIds = [];
      sentiment = 'hostile';
      armObservation = 'Prospect resisted qualification questioning.';
    } else if (hasClose && turnCount < 2) {
      candidateReplies = [
        "I'm not putting anything on my calendar. We've worked with our current agency for 3 years and we are completely satisfied. Why would we switch?",
        "Hold on, you haven't even told me why I'd spend 10 minutes with you. What makes your team any different from everyone else?"
      ];
      completedIds = [];
      sentiment = 'skeptical';
      armObservation = 'Prospect pushed back against premature close.';
    } else if (hasValue) {
      candidateReplies = [
        "Those metrics sound great on a slide, but our agency is deeply embedded in our CRM. Why would I risk disrupting an established partner that hits quota?",
        "We're completely satisfied with our current vendors. Unless you can pinpoint a specific leak in our SDR hold rate, why would we switch?"
      ];
      completedIds = [persona.objectives[0].id, persona.objectives[1].id];
      sentiment = 'softened';
      armObservation = 'Rep probed vendor relationship with value focus; prospect demanded proof.';
    } else if (hasEmpathy) {
      candidateReplies = [
        "I appreciate you acknowledging that. We value our partners. What makes you think our current team has any performance gaps?",
        "Glad you understand. Most reps just bash our existing agency. But why should we spend any time evaluating another tool?"
      ];
      completedIds = [persona.objectives[0].id];
      sentiment = 'neutral';
      armObservation = 'Rep demonstrated tactical empathy; prospect maintained defensive posture.';
    } else {
      candidateReplies = [
        "Like I said, we have an established vendor handling this. Why are you reaching out to us right now?",
        "What specifically is your team offering that would ever justify disrupting our current workflow?",
        "I don't have time for a generic pitch. If you know our space, what exact problem are you solving?"
      ];
      completedIds = [];
      sentiment = 'skeptical';
      armObservation = 'Prospect defended incumbent vendor.';
    }
  } else if (persona.id === 'rushed-vp') {
    // Marcus Vance (Rushed VP)
    if (turnCount >= 2 && hasEmpathy && hasValue && hasClose) {
      candidateReplies = [
        "Alright, fair enough on the 10-minute diagnostic. Send an invite for Thursday at 8:00 AM sharp before my standup. I'm stepping into the boardroom right now.",
        "Fine, if it's strictly 10 minutes to review that hold rate diagnostic, put Thursday morning on my calendar. Now let me go."
      ];
      completedIds = persona.objectives.map(o => o.id);
      sentiment = 'agreed';
      armObservation = 'Rep executed ARM under pressure and secured diagnostic commitment.';
    } else if (isAskingQuestion) {
      candidateReplies = [
        "I don't have time to answer survey questions. If you have a specific value proposition, give me the headline in 10 seconds or I'm hanging up.",
        "Look, I'm walking into an executive meeting. Don't grill me on our pipeline—tell me why you called."
      ];
      completedIds = [];
      sentiment = 'hostile';
      armObservation = 'Prospect rejected survey questions under time crunch.';
    } else if (hasClose && turnCount < 2) {
      candidateReplies = [
        "I'm not putting anything on my calendar. I have literally 20 seconds before my board meeting—what is the bottom line?",
        "Thursday for what? You haven't even told me what you do. Give me the headline."
      ];
      completedIds = [];
      sentiment = 'hostile';
      armObservation = 'Prospect pushed back against premature close.';
    } else if (hasValue) {
      candidateReplies = [
        "Every vendor claims double-digit hold rates. How does your model actually integrate without burning my team's bandwidth?",
        "What kind of SDR hold rate can you realistically commit to for high-growth fintech?"
      ];
      completedIds = [persona.objectives[0].id, persona.objectives[1].id];
      sentiment = 'softened';
      armObservation = 'Rep cited ROI metric; prospect challenged feasibility.';
    } else if (hasEmpathy) {
      candidateReplies = [
        "I appreciate you being brief. You've got 15 seconds—what is the metric?",
        "Fair enough on the time crunch. What exactly is the headline?"
      ];
      completedIds = [persona.objectives[0].id];
      sentiment = 'neutral';
      armObservation = 'Rep acknowledged time constraint under 5 seconds.';
    } else {
      candidateReplies = [
        "Look, I have 15 seconds before my meeting starts. Give me the bottom line or let me go.",
        "I don't have time for fluff right now. What is this regarding?"
      ];
      completedIds = [];
      sentiment = 'hostile';
      armObservation = 'Prospect pressed for brevity.';
    }
  } else {
    // General adversarial persona dynamic replies
    if (turnCount >= 2 && hasEmpathy && hasValue && hasClose) {
      candidateReplies = [
        `Look, I'm still skeptical, but if it's literally just a 10-minute diagnostic without high pressure, send an invite for Thursday morning.`,
        `Fair enough. Send through a tentative 10-minute hold for Thursday and I'll review the diagnostic data.`
      ];
      completedIds = persona.objectives.map(o => o.id);
      sentiment = 'agreed';
      armObservation = 'Rep executed ARM and earned diagnostic meeting.';
    } else if (isAskingQuestion) {
      candidateReplies = [
        `Why are you asking about our internal process? I don't share internal operational details with cold callers.`,
        `I didn't ask for a consultation. What is the reason you called my direct line today?`
      ];
      completedIds = [];
      sentiment = 'skeptical';
      armObservation = 'Prospect pushed back on unsolicited qualification.';
    } else if (hasValue) {
      candidateReplies = [
        `Those numbers sound fine on paper, but every vendor makes big promises. How do you actually prove that?`,
        `That sounds good in theory, but what kind of turnaround time and hold rate do you guarantee in writing?`
      ];
      completedIds = [persona.objectives[0]?.id, persona.objectives[1]?.id].filter(Boolean);
      sentiment = 'softened';
      armObservation = 'Rep cited value metrics; prospect demanded proof.';
    } else if (hasEmpathy) {
      candidateReplies = [
        `I appreciate you hearing me out, but that doesn't change our situation. Why should we prioritize this over our current initiatives?`,
        `Fair point. But what makes you think we have any problems we can't solve ourselves?`
      ];
      completedIds = [persona.objectives[0]?.id].filter(Boolean);
      sentiment = 'neutral';
      armObservation = 'Rep used tactical empathy; prospect maintained skepticism.';
    } else {
      candidateReplies = [
        `Look, what specifically does this solve for my team right now?`,
        `I need concrete specifics, not a generic pitch. What are you actually offering?`,
        `Why should I spend my time discussing this today?`
      ];
      completedIds = [];
      sentiment = 'skeptical';
      armObservation = 'Prospect pushed back on value clarity.';
    }
  }

  // Find the first candidate reply that hasn't been said yet
  const chosenReply = candidateReplies.find(r => !pastReplies.includes(r.toLowerCase())) || candidateReplies[0];

  return {
    reply: chosenReply,
    completedIds,
    sentiment,
    armObservation
  };
}

// Derive instant tactical ScriptAssist teleprompter content based on buyer reply & persona
function deriveDynamicScriptAssist(
  persona: SparringPersona,
  buyerReply: string,
  sentiment: string
): any {
  const lower = buyerReply.toLowerCase();
  const firstName = persona.name.split(' ')[0];

  if (sentiment === 'agreed' || lower.includes('invite') || lower.includes('calendar') || lower.includes('put') || lower.includes('thursday') || lower.includes('tuesday') || lower.includes('friday')) {
    return {
      objectionType: 'Agreement Reached (Lock down 20-min demo with Founder Emil)',
      recommendedScript: `Fantastic, ${firstName}. I'll lock in Thursday at 2:00 PM for the screen share with our founder, Emil. What is the best direct email address to send the calendar invite and the 1-page sample list preview?`,
      tacticalRationale: 'Confirm demo timeslot cleanly, mention Founder Emil, and secure direct email for calendar invite and private sample list.',
      arm: {
        acknowledge: 'Acknowledge agreed timeslot cleanly',
        respond: 'Promise calendar invite and 1-page sample list preview with Emil',
        move: 'Ask for direct email address to lock in the calendar invite'
      }
    };
  }

  // BPO Core Objection 1: "Our reps have years of experience, they don't need practice"
  if (lower.includes('experience') || lower.includes('senior') || lower.includes('veteran') || lower.includes('practice') || lower.includes('roleplay') || lower.includes('years')) {
    return {
      objectionType: 'Senior Rep Experience Defense ("Reps don\'t need practice")',
      recommendedScript: `Makes total sense, ${firstName}—having seasoned reps who know the BPO space inside and out is a massive advantage. The reason teams work with Emil is that when you're paying top dollar for leads, you can't afford to let even senior reps use the first 5 dials of the day as warm-up swings. Our AI gets them in the zone before they touch a single live contact. Would you be open to a 20-minute look with Emil this Thursday afternoon?`,
      tacticalRationale: 'Validate veteran rep experience. Contrast burning expensive leads as warm-up swings with pre-dial AI sparring, and propose 20 minutes with Founder Emil.',
      arm: {
        acknowledge: 'Validate seasoned rep experience and industry tenure',
        respond: 'Explain how expensive leads should not be wasted as warm-up practice swings',
        move: 'Propose a 20-minute screen share with Founder Emil this Thursday at 2:00 PM'
      }
    };
  }

  // BPO Core Objection 2: "We already buy our leads from Outsource Accelerator / brokers"
  if (lower.includes('outsource accelerator') || lower.includes('oa') || lower.includes('buy our leads') || lower.includes('directory') || lower.includes('lead vendor') || lower.includes('broker')) {
    return {
      objectionType: 'Directory Lead Status Quo ("We buy from Outsource Accelerator")',
      recommendedScript: `That's great, ${firstName}—it means you have active budget and a dedicated sales team ready to close deals. The only catch is that directory leads get pitched by 3 to 5 rival BPOs simultaneously, cutting your margins in half. We generate private, Claude-enriched lists that zero competitors have seen, paired with pre-dial AI training. Could we show you a private sample list for your vertical this Thursday?`,
      tacticalRationale: 'Praise their active lead budget. Expose the shared-lead price trap (3-5 rival BPOs) and offer a private Claude sample list preview with Emil.',
      arm: {
        acknowledge: 'Validate active lead budget and sales team readiness',
        respond: 'Expose the shared-lead price trap: 3-5 rival BPOs fighting over the same leads',
        move: 'Offer a private sample list walkthrough for their vertical with Emil on Thursday'
      }
    };
  }

  // BPO Core Objection 3: "Just email me your pricing / send some info"
  if (lower.includes('pricing') || lower.includes('price') || lower.includes('quote') || lower.includes('cost') || lower.includes('how much') || lower.includes('rate')) {
    return {
      objectionType: 'Pricing Brush-Off ("Just email me your pricing")',
      recommendedScript: `Gladly, ${firstName}—I'll get a full overview sent over so you have it in writing. Because pricing is tied to your specific BPO vertical and how many reps are sparring on the platform, Emil tailors the numbers directly on a brief screen share. Are you free for 20 minutes with Emil on Thursday at 2:00 PM, or is Friday morning better?`,
      tacticalRationale: 'Agree pleasantly to send information, explain pricing depends on vertical and sparring seats, and pivot to a 20-minute custom quote with Emil.',
      arm: {
        acknowledge: 'Agree to send documentation and pricing in writing',
        respond: 'Explain pricing is customized based on vertical and sparring seats',
        move: 'Propose a 20-minute screen share with Emil on Thursday 2 PM or Friday'
      }
    };
  }

  // BPO Core Objection 4: "We train our reps internally"
  if (lower.includes('internally') || lower.includes('internal') || lower.includes('team lead') || lower.includes('train our') || lower.includes('coaching')) {
    return {
      objectionType: 'Internal Training Defense ("We train our reps internally")',
      recommendedScript: `That's awesome, ${firstName}—internal coaching is how you maintain quality and culture. The challenge team leaders tell us is they don't have hours each morning to roleplay 1-on-1 with every rep. Our AI sparring tool gives each rep 5 realistic objection rounds in 5 minutes before their shift even starts. Would you be opposed to seeing how Emil sets up the sparring bots this Thursday at 2:00 PM?`,
      tacticalRationale: 'Compliment internal training. Reframe team leader time constraints vs. 5 automated AI sparring rounds, and invite to see setup with Emil.',
      arm: {
        acknowledge: 'Compliment internal coaching and team culture',
        respond: 'Highlight team leader bandwidth constraints vs. automated 5-minute pre-shift AI sparring',
        move: 'Invite them to see how Emil sets up the sparring bots this Thursday at 2:00 PM'
      }
    };
  }

  if (lower.includes('specifically') || lower.includes('solve') || lower.includes('offering') || lower.includes('concrete') || lower.includes('pitch') || lower.includes('why should i spend my time')) {
    return {
      objectionType: 'Value Clarity & Specificity Demand ("What specifically does this solve?")',
      recommendedScript: `Fair question, ${firstName}. Specifically: we eliminate unqualified SDR meetings by inserting Boris live audio QA before leads hit AE calendars, lifting hold rates from 42% to 68%. If you're open to a 10-minute diagnostic benchmark on Thursday, when works?`,
      tacticalRationale: 'Answer the specificity demand immediately with the exact acoustic QA mechanism and concrete hold rate metric, then close with a low-friction diagnostic.',
      arm: {
        acknowledge: 'Validate her demand for specifics instead of marketing fluff',
        respond: 'Detail exact Boris acoustic QA mechanism and hold rate metric (42% to 68%)',
        move: 'Propose a 10-minute diagnostic benchmark on Thursday'
      }
    };
  }

  if (lower.includes('burned') || lower.includes('disaster') || lower.includes('spam') || lower.includes('domain') || lower.includes('reputation')) {
    return {
      objectionType: 'Burned by Past Agency (Spam Leads & Domain Blacklist)',
      recommendedScript: `I don't blame you at all, ${firstName}—most offshore teams spam generic lists and ruin deliverability. We enforce live audio QA and Boris acoustic monitoring to guarantee zero domain risk. Can I share a 2-minute sample call audit on Thursday?`,
      tacticalRationale: 'Validate her past agency trauma. Detail acoustic QA safety guards and offer a concrete call audit preview rather than a pitch.',
      arm: {
        acknowledge: 'Validate previous bad agency disaster with tactical empathy',
        respond: 'Detail live audio interception and domain safety controls',
        move: 'Offer a 2-minute sample call listening preview on Thursday'
      }
    };
  }

  if (lower.includes('why are you asking') || lower.includes('internal') || lower.includes('survey') || lower.includes('consultation') || lower.includes('grill')) {
    return {
      objectionType: 'Pushback on Qualification Questions ("Why are you asking about my team?")',
      recommendedScript: `Fair pushback, ${firstName}—I'm not here to interrogate your team. The only reason I called is we helped a similar peer team double SDR hold rates from 42% to 68%. If you're open to a 10-minute diagnostic benchmark on Thursday, when works?`,
      tacticalRationale: 'Validate their friction immediately, withdraw the intrusive questioning, and pivot back to hard peer metrics and a low-friction diagnostic.',
      arm: {
        acknowledge: 'Validate that uninvited qualification questions feel intrusive',
        respond: 'Deliver quantified peer hold rate metric (42% to 68% lift)',
        move: 'Propose a 10-minute diagnostic benchmark on Thursday'
      }
    };
  }

  if (lower.includes('partner') || lower.includes('agency') || lower.includes('vendor') || lower.includes('satisfied')) {
    return {
      objectionType: 'Incumbent Partner Loyalty',
      recommendedScript: `Makes total sense, ${firstName}—3 years with a partner is great and I'm not suggesting you replace them. Most teams we work with keep their incumbent for routine volume while using our QA layer to plug conversion drop-offs. Open to a 10-minute SLA benchmark comparison Thursday morning?`,
      tacticalRationale: 'Never attack their vendor. Position as complementary conversion insurance and offer a 10-minute SLA diagnostic comparison.',
      arm: {
        acknowledge: 'Validate partner relationship with tactical empathy',
        respond: 'Frame as complementary overflow bottleneck solver',
        move: 'Propose a 10-minute SLA benchmark diagnostic'
      }
    };
  }

  if (lower.includes('proof') || lower.includes('hype') || lower.includes('everyone says') || lower.includes('buzzword') || lower.includes('guarantee')) {
    return {
      objectionType: 'Vendor Skepticism / Proof Request ("Sounds like buzzwords")',
      recommendedScript: `I don't blame you for being skeptical, ${firstName}—every vendor makes big promises. That's why I'm not asking you to buy anything. I'm suggesting a 10-minute side-by-side diagnostic benchmark so you can see the hard data yourself. How is Thursday morning?`,
      tacticalRationale: 'Embrace their skepticism with complete poise. Remove the sales pressure, frame the diagnostic as an objective data comparison, and close.',
      arm: {
        acknowledge: 'Validate that cold call vendor promises usually sound like hype',
        respond: 'Clarify this is a zero-commitment data diagnostic, not a sales pitch',
        move: 'Propose a 10-minute benchmark review on Thursday'
      }
    };
  }

  if (lower.includes('budget') || lower.includes('cost') || lower.includes('expensive') || lower.includes('money') || lower.includes('spend') || lower.includes('cut')) {
    return {
      objectionType: 'Budget Constraint / SG&A Caution',
      recommendedScript: `Completely hear you, ${firstName}—adding fixed seat burn right now makes zero sense. We operate on a 100% pay-per-qualified discovery model with zero fixed seat fees and a 3x break-even guarantee. What does Thursday look like for a 2-minute break-even review?`,
      tacticalRationale: 'Validate budget friction immediately. Reframe from fixed SaaS costs to performance-only discovery with zero burn.',
      arm: {
        acknowledge: 'Agree that fixed SaaS burn is irresponsible right now',
        respond: 'Highlight performance-only model with zero seat fees',
        move: 'Ask for a 2-minute break-even review on Thursday'
      }
    };
  }

  if (lower.includes('email') || lower.includes('send') || lower.includes('deck') || lower.includes('info') || lower.includes('general inbox') || lower.includes('not available')) {
    return {
      objectionType: 'Email Brush-Off / Gatekeeper Deflection',
      recommendedScript: `Gladly sending info, ${firstName}! To make sure I only send what's actually relevant to your team: are you currently focused more on rep ramp time or lead hold rate?`,
      tacticalRationale: 'Agree pleasantly to send information, but use the request to anchor a binary qualifying diagnostic question.',
      arm: {
        acknowledge: 'Agree to send documentation willingly',
        respond: 'Explain deck is extensive and needs to be tailored',
        move: 'Ask diagnostic question on specific pipeline bottleneck'
      }
    };
  }

  if (lower.includes('busy') || lower.includes('meeting') || lower.includes('seconds') || lower.includes('swamped') || lower.includes('time') || lower.includes('breathe')) {
    return {
      objectionType: 'Time Constraint / Operational Burnout',
      recommendedScript: `${firstName}, completely understand you're pressed for time. In 15 seconds: we helped a peer team double SDR hold rates from 42% to 68%. If you're open to a 10-minute diagnostic benchmark on Thursday, when works?`,
      tacticalRationale: 'Acknowledge time urgency instantly, deliver the quantified 15-second metric, and propose a 10-min slot.',
      arm: {
        acknowledge: 'Acknowledge time urgency under 5 seconds',
        respond: 'Deliver concise quantified metric headline',
        move: 'Propose low-friction 10-minute diagnostic on Thursday'
      }
    };
  }

  if (lower.includes('soc') || lower.includes('latency') || lower.includes('security') || lower.includes('api') || lower.includes('compliance')) {
    return {
      objectionType: 'Technical Architecture & Compliance Scrutiny',
      recommendedScript: `We maintain full SOC2 Type II compliance with on-premise PII tokenization and sub-second Web Audio inference. Can I share our architectural security brief on Thursday?`,
      tacticalRationale: 'Respect technical diligence, cite concrete SOC2 and sub-second latency specs, and offer an engineer-to-engineer review.',
      arm: {
        acknowledge: 'Respect technical diligence and security standards',
        respond: 'Cite sub-second STT latency and SOC2 Type II PII tokenization',
        move: 'Offer a 10-minute architectural walkthrough on Thursday'
      }
    };
  }

  return persona.initialScriptAssist;
}

export async function POST(req: NextRequest) {
  try {
    const { personaId, transcript = [], repMessage = '', objectives = [] } = await req.json();

    const persona = SPARRING_PERSONAS.find(p => p.id === personaId) || SPARRING_PERSONAS[0];
    const googleApiKey = process.env.GOOGLE_API_KEY;
    const elevenApiKey = (process.env.ELEVENLABS_API_KEY || process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '').trim();

    // Format transcript turns for the prompt
    const formattedHistory = transcript
      .slice(-6)
      .map((t: any) => `${t.role === 'rep' ? 'Sales Rep' : persona.name}: "${t.content}"`)
      .join('\n');

    const prompt = `YOU ARE AN ADVERSARIAL B2B BUYER IN AN INTENSE AI SALES SPARRING SIMULATION.
You are roleplaying as ${persona.name}, ${persona.title} at ${persona.companyType}.
Your Scenario: ${persona.scenario}
Your Core Pushback: "${persona.coreObjection}"
Your Behavioral Rules & Personality:
${persona.systemPrompt}

Current Objectives the Sales Rep must achieve:
${persona.objectives.map((o: any, idx: number) => `Objective ${idx + 1} [id: ${o.id}]: ${o.description}`).join('\n')}

Conversation History so far:
${formattedHistory}

The Sales Rep just said to you: "${repMessage}"

CRITICAL SPARRING & OBJECTION ROLEPLAY RULES:
1. YOU ARE NOT AN AI ASSISTANT. YOU ARE A TOUGH, BUSY, SKEPTICAL B2B EXECUTIVE ON AN UNINVITED COLD CALL.
   - Do NOT respond with logical explanations, advice, or consultative answers!
   - Do NOT volunteer information about your internal team or workflow.
   - If the rep asks qualification questions (e.g. "What is your biggest bottleneck?", "How do you handle SDRs?"), PUSH BACK:
     * "Why would I discuss our internal workflow with a cold caller?"
     * "Look, I didn't ask for a consultation. What is the reason you called my direct line?"
2. IN EVERY TURN, YOU MUST THROW A REALISTIC OBJECTION OR POINT OF FRICTION:
   - Challenge their claims ("Everyone promises double-digit lift, sounds like marketing buzzwords").
   - Push for time ("I have literally 15 seconds before my meeting starts, give me the headline").
   - Deflect to email ("Shoot an email to our general inbox, I don't take sales calls").
   - Defend the status quo ("We already have an established vendor and we are completely satisfied").
   - Challenge proof ("What actual hard data do you have to back that up?").
3. NEVER AGREE ON TURN 1 OR TURN 2:
   - Even if the rep asks for a meeting or mentions Thursday early on, DO NOT agree.
   - Push back: "Hold on, you haven't even told me why I'd spend 10 minutes with you. What makes your team any different from everyone else?"
4. WHEN TO SOFTEN (AND ONLY WHEN EARNED):
   - You ONLY soften if the rep has reached at least turn 2+ AND properly executed the A.R.M. Framework:
     * Acknowledge: Validated your specific time crunch, frustration, or objection with tactical empathy.
     * Respond: Delivered a clear, credible, quantified metric or social proof (e.g., hold rate lift, SLA numbers).
     * Move: Closes with a low-friction 10-minute diagnostic comparison (NOT a long demo).
   - Even when agreeing, stay grounded: "Look, I'm still skeptical, but if it's strictly a 10-minute diagnostic comparison and not a sales pitch, I'll take a look Thursday morning."
5. PUNCHY SPOKEN PHONE CADENCE:
   - Deliver 1 to 2 short, punchy sentences (15 to 25 words total).
   - Sound like a real person talking on a phone, not an AI writing an essay.
6. REAL-TIME SCRIPT ASSIST:
   - Return a real-time "scriptAssist" battlecard showing the exact verbatim counter-script the rep should say to handle your objection.

Return STRICT JSON only:
{
  "reply": "Your spoken in-character pushback/objection directly challenging the rep",
  "completedObjectiveIds": ["id_of_completed_objective_if_earned"],
  "sentiment": "hostile" | "skeptical" | "neutral" | "softened" | "agreed",
  "armObservation": "One sentence assessing rep's ARM execution",
  "scriptAssist": {
    "objectionType": "Short label of the friction/objection you just raised",
    "recommendedScript": "Exact verbatim sentence(s) the rep should speak aloud right now using ARM to handle your objection",
    "tacticalRationale": "Why this specific counter-script works against this objection",
    "arm": {
      "acknowledge": "How to validate your friction",
      "respond": "How to reframe with metrics/differentiation",
      "move": "The low-friction closing question"
    }
  }
}`;

    let personaReply = '';
    let completedIds: string[] = [];
    let sentiment = 'skeptical';
    let armObservation = '';
    let scriptAssist: any = null;

    // 1. Try Gemini 3.5 Flash Lite first (fastest sub-second model), then 3.5 Flash
    if (googleApiKey) {
      const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'];
      for (const model of candidateModels) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6500);

          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${googleApiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: controller.signal,
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  responseMimeType: 'application/json',
                  temperature: 0.75,
                  maxOutputTokens: 800
                }
              })
            }
          );
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const parsed = extractJson(text);
              if (parsed && parsed.reply) {
                personaReply = parsed.reply;
                completedIds = parsed.completedObjectiveIds || [];
                sentiment = parsed.sentiment || 'skeptical';
                armObservation = parsed.armObservation || '';
                if (parsed.scriptAssist && parsed.scriptAssist.recommendedScript) {
                  scriptAssist = parsed.scriptAssist;
                }
                break;
              }
            }
          } else {
            console.warn(`[Sparring Chat] Gemini ${model} status ${res.status}:`, (await res.text()).slice(0, 80));
          }
        } catch (geminiErr) {
          console.warn(`[Sparring Chat] Gemini ${model} note:`, geminiErr);
        }
      }
    }

    // 2. Intelligent persona-aware fallback if Gemini was unreachable
    if (!personaReply) {
      const fallbackResult = generateContextualFallback(persona, repMessage, transcript);
      personaReply = fallbackResult.reply;
      completedIds = fallbackResult.completedIds;
      sentiment = fallbackResult.sentiment;
      armObservation = fallbackResult.armObservation;
    }

    // 3. Ensure scriptAssist is always computed and robust
    if (!scriptAssist || !scriptAssist.recommendedScript) {
      scriptAssist = deriveDynamicScriptAssist(persona, personaReply, sentiment);
    }

    // 4. Synthesize Voice with ElevenLabs TTS using persona's conversational voice settings
    let audioUrl: string | null = null;
    if (elevenApiKey && personaReply) {
      try {
        const ttsRes = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${persona.voiceId}?optimize_streaming_latency=4`,
          {
            method: 'POST',
            headers: {
              'xi-api-key': elevenApiKey,
              'Content-Type': 'application/json',
              Accept: 'audio/mpeg'
            },
            body: JSON.stringify({
              text: personaReply,
              model_id: 'eleven_turbo_v2_5',
              voice_settings: persona.voiceSettings || {
                stability: 0.48,
                similarity_boost: 0.75,
                style: 0.08,
                use_speaker_boost: true
              }
            })
          }
        );

        if (ttsRes.ok) {
          const ab = await ttsRes.arrayBuffer();
          const base64 = Buffer.from(ab).toString('base64');
          audioUrl = `data:audio/mpeg;base64,${base64}`;
        } else {
          console.warn(`[Sparring Chat TTS] Failed status:`, ttsRes.status);
        }
      } catch (voiceErr) {
        console.warn(`[Sparring Chat TTS] Voice error:`, voiceErr);
      }
    }

    return NextResponse.json({
      reply: personaReply,
      audioUrl,
      completedObjectiveIds: completedIds,
      sentiment,
      armObservation,
      scriptAssist
    });

  } catch (error: any) {
    console.error('[Sparring Chat Route] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Sparring turn processing failed' },
      { status: 500 }
    );
  }
}
