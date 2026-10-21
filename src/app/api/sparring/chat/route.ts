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
3. If the rep asks a direct question (e.g. "are you happy with your team?", "what is your biggest challenge?"), answer their question directly in character.
4. Keep your answer ultra-conversational, human, and punchy (1 to 2 short sentences, 15 to 25 words total, exactly how real people talk on the phone).
5. Only agree to a meeting if the rep actually acknowledged your reality and proposed a low-pressure diagnostic/benchmark comparison.

Return STRICT JSON only:
{
  "reply": "Your in-character spoken response directly answering the rep",
  "completedObjectiveIds": ["id_of_completed_objective_if_earned"],
  "sentiment": "hostile" | "skeptical" | "neutral" | "softened" | "agreed",
  "armObservation": "One sentence assessing rep's ARM execution"
}`;

    let personaReply = '';
    let completedIds: string[] = [];
    let sentiment = 'skeptical';
    let armObservation = '';

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
                  maxOutputTokens: 180
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

    // 3. Synthesize Voice with ElevenLabs TTS using persona's conversational voice settings
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
      armObservation
    });

  } catch (error: any) {
    console.error('[Sparring Chat Route] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Sparring turn processing failed' },
      { status: 500 }
    );
  }
}
