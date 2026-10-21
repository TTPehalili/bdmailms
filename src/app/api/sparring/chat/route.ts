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

// Persona-specific contextual fallback logic that dynamically responds and never repeats
function generateContextualFallback(
  persona: SparringPersona,
  repMessage: string,
  history: Array<{ role: string; content: string }>
): { reply: string; completedIds: string[]; sentiment: string; armObservation: string } {
  const lower = repMessage.toLowerCase();
  const pastReplies = history
    .filter(t => t.role === 'prospect')
    .map(t => t.content.toLowerCase());

  const hasEmpathy = lower.includes('understand') || lower.includes('hear you') || lower.includes('fair') || lower.includes('appreciate') || lower.includes('makes sense');
  const hasValue = lower.includes('benchmark') || lower.includes('diagnostic') || lower.includes('sla') || lower.includes('rate') || lower.includes('conversion') || lower.includes('drop-off') || lower.includes('percent') || lower.includes('%') || lower.includes('save') || lower.includes('pipeline');
  const hasClose = (lower.includes('?') || lower.includes('open to') || lower.includes('calendar')) && (lower.includes('tuesday') || lower.includes('thursday') || lower.includes('minute') || lower.includes('review') || lower.includes('compare') || lower.includes('diagnostic'));

  let candidateReplies: string[] = [];
  let completedIds: string[] = [];
  let sentiment = 'skeptical';
  let armObservation = 'Rep engaged prospect.';

  if (persona.id === 'incumbent-loyalist') {
    // David Reynolds
    if (hasClose) {
      candidateReplies = [
        "Alright, fair enough. If it's literally just a 10-minute SLA benchmark comparison and not a hard sales pitch, put 10:30 AM Thursday on my calendar.",
        "Look, if you can actually show where our incumbent has conversion blindspots in 10 minutes, I'll take a look on Thursday."
      ];
      completedIds = persona.objectives.map(o => o.id);
      sentiment = 'agreed';
      armObservation = 'Rep closed with low-friction SLA benchmark comparison.';
    } else if (hasValue || lower.includes('happy') || lower.includes('team') || lower.includes('partner') || lower.includes('agency')) {
      candidateReplies = [
        "Yes, our agency partner has been consistent for three years. So what makes your model any different from what they already do?",
        "We're completely satisfied with our current vendors. Unless you can pinpoint a specific leak in our SDR hold rate, why would we switch?",
        "I'm not looking to fire an agency that hits quota. What exact gap in our outbound pipeline are you proposing to fix?"
      ];
      completedIds = [persona.objectives[0].id, persona.objectives[1].id];
      sentiment = 'softened';
      armObservation = 'Rep probed current vendor relationship with value focus.';
    } else if (hasEmpathy) {
      candidateReplies = [
        "I appreciate you acknowledging that. We value our partners. What makes you think our current team has any performance gaps?",
        "Glad you understand. Most reps just bash our existing agency. What specifically prompted your outreach to my team today?"
      ];
      completedIds = [persona.objectives[0].id];
      sentiment = 'neutral';
      armObservation = 'Rep demonstrated tactical empathy toward existing vendor relationship.';
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
    // Marcus Vance
    if (hasClose) {
      candidateReplies = [
        "20% lift? Fine, send an invite for Thursday at 8:00 AM sharp before my standup. I'm stepping into the boardroom right now.",
        "Alright, if it's literally 10 minutes to review that hold rate diagnostic, put Thursday morning on my calendar."
      ];
      completedIds = persona.objectives.map(o => o.id);
      sentiment = 'agreed';
      armObservation = 'Rep secured 10-minute diagnostic commitment.';
    } else if (hasValue) {
      candidateReplies = [
        "You mention conversion metrics, but how does your team actually integrate without adding more management burden?",
        "What kind of SDR hold rate can you realistically commit to for high-growth fintech?"
      ];
      completedIds = [persona.objectives[0].id, persona.objectives[1].id];
      sentiment = 'softened';
      armObservation = 'Rep cited ROI metric; prospect leaned in.';
    } else if (hasEmpathy) {
      candidateReplies = [
        "I appreciate you being brief. You've got 15 seconds—what is the headline?",
        "Fair enough on the time crunch. What exactly is the metric you're calling about?"
      ];
      completedIds = [persona.objectives[0].id];
      sentiment = 'neutral';
      armObservation = 'Rep acknowledged time constraint under 5 seconds.';
    } else {
      candidateReplies = [
        "Look, I have 15 seconds before my meeting starts. Give me the bottom line.",
        "I don't have time for fluff right now. What is this regarding?"
      ];
      completedIds = [];
      sentiment = 'hostile';
      armObservation = 'Prospect pressed for brevity.';
    }
  } else {
    // General persona dynamic replies
    if (hasClose) {
      candidateReplies = [
        `If it's literally just a 10-minute diagnostic without high pressure, send an invite for Thursday morning.`,
        `Fair enough. Send through a tentative 10-minute hold for Thursday and I'll review the numbers.`
      ];
      completedIds = persona.objectives.map(o => o.id);
      sentiment = 'agreed';
      armObservation = 'Rep secured low-friction next step.';
    } else if (hasValue) {
      candidateReplies = [
        `You mention those numbers, but how does that actually work in practice for our department?`,
        `That sounds fine in theory, but what kind of turnaround time and hold rate do you guarantee?`
      ];
      completedIds = [persona.objectives[0]?.id, persona.objectives[1]?.id].filter(Boolean);
      sentiment = 'softened';
      armObservation = 'Rep introduced value metrics.';
    } else if (hasEmpathy) {
      candidateReplies = [
        `I appreciate you hearing me out. Most cold callers just plow through their script.`,
        `Fair point. But why should we prioritize this over our current initiatives?`
      ];
      completedIds = [persona.objectives[0]?.id].filter(Boolean);
      sentiment = 'neutral';
      armObservation = 'Rep used tactical empathy.';
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

  if (sentiment === 'agreed' || lower.includes('invite') || lower.includes('calendar') || lower.includes('put') || lower.includes('thursday') || lower.includes('tuesday')) {
    return {
      objectionType: 'Agreement Reached (Lock down time & logistics)',
      recommendedScript: `Perfect, ${firstName}. I have Thursday at 10 AM slotted on my calendar. I'll send through the invite with a 1-page benchmark prep doc. Who else on your team should be included?`,
      tacticalRationale: 'Confirm time immediately, commit to a zero-lift 1-page doc, and expand meeting stakeholders without overselling.',
      arm: {
        acknowledge: 'Acknowledge agreed timeslot cleanly',
        respond: 'Promise lightweight 1-page benchmark prep doc',
        move: 'Ask who else from ops/sales leadership should join'
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

  if (lower.includes('email') || lower.includes('send') || lower.includes('deck') || lower.includes('info')) {
    return {
      objectionType: 'Email Brush-Off / Information Request',
      recommendedScript: `Gladly sending info, ${firstName}! To make sure I only send what's actually relevant to your team: are you currently focused more on rep ramp time or lead hold rate?`,
      tacticalRationale: 'Agree pleasantly to send information, but use the request to anchor a binary qualifying diagnostic question.',
      arm: {
        acknowledge: 'Agree to send documentation willingly',
        respond: 'Explain deck is extensive and needs to be tailored',
        move: 'Ask diagnostic question on specific pipeline bottleneck'
      }
    };
  }

  if (lower.includes('busy') || lower.includes('meeting') || lower.includes('seconds') || lower.includes('swamped') || lower.includes('time')) {
    return {
      objectionType: 'Time Constraint / Impatience',
      recommendedScript: `${firstName}, completely understand you're pressed for time. In 15 seconds: we helped a peer team double SDR hold rates from 42% to 68%. If you're open to a 10-minute diagnostic benchmark on Thursday, when works?`,
      tacticalRationale: 'Acknowledge time urgency instantly, deliver the quantified 15-second metric, and propose a 10-min slot.',
      arm: {
        acknowledge: 'Acknowledge time urgency under 5 seconds',
        respond: 'Deliver concise quantified metric headline',
        move: 'Propose low-friction 10-minute diagnostic on Thursday'
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

    const prompt = `You are roleplaying as ${persona.name}, ${persona.title} at ${persona.companyType}.
Scenario: ${persona.scenario}
Core Pushback / Default Stance: ${persona.coreObjection}
Persona Behavioral Rules: ${persona.systemPrompt}

Current Objectives Rep Must Achieve:
${persona.objectives.map((o: any, idx: number) => `Objective ${idx + 1} [id: ${o.id}]: ${o.description}`).join('\n')}

Conversation History so far:
${formattedHistory}

Sales Rep just said to you: "${repMessage}"

CRITICAL CONVERSATIONAL & LOGICAL THINKING RULES:
1. Think carefully and respond directly, logically, and authentically to what the Sales Rep just said.
2. NEVER repeat a sentence or phrase you already said earlier in the conversation history!
3. If the rep asks a direct question, answer it directly in character.
4. Keep your answer ultra-conversational, human, and punchy (1 to 2 short sentences, 15 to 25 words total).
5. Only agree to a meeting if the rep actually acknowledged your reality and proposed a low-pressure diagnostic/benchmark comparison.
6. Also generate a real-time "scriptAssist" battlecard providing the EXACT winning verbatim words the sales rep should speak next to handle your reply, using the A.R.M. Framework (Acknowledge, Respond/Reframe, Move/CTA).

Return STRICT JSON only:
{
  "reply": "Your in-character spoken response directly answering the rep",
  "completedObjectiveIds": ["id_of_completed_objective_if_earned"],
  "sentiment": "hostile" | "skeptical" | "neutral" | "softened" | "agreed",
  "armObservation": "One sentence assessing rep's ARM execution",
  "scriptAssist": {
    "objectionType": "Short label of the friction in your reply",
    "recommendedScript": "Exact verbatim sentence(s) the rep should speak aloud right now to handle your reply and secure the meeting",
    "tacticalRationale": "Why this specific script works against this pushback",
    "arm": {
      "acknowledge": "How to validate the buyer's friction",
      "respond": "How to reframe with metrics or differentiation",
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
                  temperature: 0.65,
                  maxOutputTokens: 250
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
