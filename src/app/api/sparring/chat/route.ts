import { NextRequest, NextResponse } from 'next/server';
import { SPARRING_PERSONAS } from '@/lib/personas';

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
Core Pushback: ${persona.coreObjection}
Persona Behavioral Rules: ${persona.systemPrompt}

Current Objectives Rep Must Achieve:
${persona.objectives.map((o: any, idx: number) => `Objective ${idx + 1} [id: ${o.id}]: ${o.description}`).join('\n')}

Conversation History:
${formattedHistory}
Sales Rep's Latest Spoken Statement: "${repMessage}"

INSTRUCTIONS:
1. Respond STRICTLY in character as ${persona.name}. Keep your spoken answer ultra-conversational, human, and punchy (1 to 2 short sentences, 15 to 25 words total, exactly how an impatient executive talks on the phone).
2. Do not produce markdown or text outside JSON.

Return a STRICT JSON object:
{
  "reply": "Your in-character spoken response",
  "completedObjectiveIds": ["id_of_completed_objective_if_any"],
  "sentiment": "hostile" | "skeptical" | "neutral" | "softened" | "agreed",
  "armObservation": "One sentence assessing rep's ARM execution"
}`;

    let personaReply = '';
    let completedIds: string[] = [];
    let sentiment = 'skeptical';
    let armObservation = '';

    // 1. Try Gemini with 3.5s timeout per request
    if (googleApiKey) {
      const candidateModels = ['gemini-3.8-flash', 'gemini-3.5-flash'];
      for (const model of candidateModels) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);

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
                  temperature: 0.35,
                  maxOutputTokens: 150
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
          }
        } catch (geminiErr) {
          console.warn(`[Sparring Chat] Gemini ${model} note:`, geminiErr);
        }
      }
    }

    // 2. Intelligent scenario fallback if Gemini output wasn't generated
    if (!personaReply) {
      const lower = repMessage.toLowerCase();
      const hasEmpathy = lower.includes('understand') || lower.includes('hear you') || lower.includes('fair') || lower.includes('appreciate') || lower.includes('makes sense');
      const hasValue = lower.includes('benchmark') || lower.includes('diagnostic') || lower.includes('sla') || lower.includes('rate') || lower.includes('conversion') || lower.includes('drop-off') || lower.includes('percent') || lower.includes('%') || lower.includes('save') || lower.includes('pipeline');
      const hasClose = (lower.includes('?') || lower.includes('open to') || lower.includes('calendar')) && (lower.includes('tuesday') || lower.includes('thursday') || lower.includes('minute') || lower.includes('review') || lower.includes('compare') || lower.includes('diagnostic'));

      if (hasClose && (hasEmpathy || hasValue)) {
        personaReply = `Alright, fair enough. If it's literally just 10 minutes to compare benchmark numbers, put 10:30 AM on Thursday on my calendar. Send the invite.`;
        completedIds = persona.objectives.map(o => o.id);
        sentiment = 'agreed';
        armObservation = 'Rep cleanly acknowledged friction, introduced value benchmark, and closed diagnostic.';
      } else if (hasValue) {
        personaReply = `You mention benchmark conversion rates, but how does your team actually integrate without adding more management burden?`;
        completedIds = [persona.objectives[0]?.id, persona.objectives[1]?.id].filter(Boolean);
        sentiment = 'softened';
        armObservation = 'Rep introduced value metrics; prospect leaned in with an operational question.';
      } else if (hasEmpathy) {
        personaReply = `I appreciate you hearing me out, but I get dozens of these pitches every week. Why should I give your team another second?`;
        completedIds = [persona.objectives[0]?.id].filter(Boolean);
        sentiment = 'neutral';
        armObservation = 'Rep demonstrated tactical empathy; prospect defensive barrier disarmed.';
      } else {
        personaReply = `Look, I don't have time for a generic sales pitch. What specifically does this solve for my team right now?`;
        completedIds = [];
        sentiment = 'hostile';
        armObservation = 'Rep failed to acknowledge constraint; prospect pushed back sharply.';
      }
    }

    // 3. Synthesize Voice with ElevenLabs TTS
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
              voice_settings: {
                stability: 0.52,
                similarity_boost: 0.78,
                style: 0.15,
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
