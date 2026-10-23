import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { ArmRebuttalResponse } from '@/types';
import { applyRateLimit, validateTextPayload } from '@/lib/security';

// Preset high-converting BPO objection playbook
const PRESET_OBJECTIONS = [
  {
    type: 'Incumbent Vendor',
    keywords: ['already have', 'already use', 'work with another', 'existing vendor', 'current agency', 'internal team', 'locked into', 'in-house', 'contract with'],
    acknowledge: 'I completely understand—you have an established rhythm with them.',
    respond: 'Most teams we work with kept their incumbent for tier-1 tasks while leveraging us to fix their high-value bottleneck.',
    move: 'Would you be against a 10-minute diagnostic to benchmark your current SLA costs?'
  },
  {
    type: 'Budget / Pricing',
    keywords: ['no budget', 'too expensive', 'cannot afford', 'cost prohibitive', 'cutting costs', 'tight budget', 'price is too high', 'free tier', 'don\'t have the money'],
    acknowledge: 'Fair point—in this macroeconomic climate, every single line item has to generate direct ROI.',
    respond: 'Our structure is strictly performance-tied to qualified discovery meetings, meaning zero fixed seat burn until pipeline actually lands on your calendar.',
    move: 'Would you be open to seeing a 2-minute model on the break-even for just two qualified conversions next month?'
  },
  {
    type: 'Timing / Send Info',
    keywords: ['send an email', 'send me an email', 'send info', 'send your deck', 'call me back next quarter', 'call back later', 'busy right now', 'not a good time', 'end of year', 'next month'],
    acknowledge: 'I will gladly send documentation so you have full visibility on our track record.',
    respond: 'Usually when leaders ask for an email, it ends up buried under hundreds of messages because it does not speak to your team\'s specific quota bottlenecks.',
    move: 'If you have your calendar open, what does Thursday morning look like for a brief 5-minute preview instead?'
  },
  {
    type: 'Gatekeeper / Authority',
    keywords: ['not the decision maker', 'not the right person', 'speak to my boss', 'procurement handles', 'i just work here', 'talk to marketing', 'vp handles', 'don\'t make decisions'],
    acknowledge: 'Understood, and I appreciate you pointing me in the right direction.',
    respond: 'I definitely do not want to take up executive calendar time unless this directly supports the revenue numbers your team is targeting.',
    move: 'Who is currently accountable for the outbound quota and booked discovery targets for your group?'
  },
  {
    type: 'Not Interested / Skepticism',
    keywords: ['not interested', 'no thanks', 'remove me', 'stop calling', 'all set', 'do not need', 'cold caller', 'waste of time'],
    acknowledge: 'Totally understand—your phone is likely ringing all day with generic outreach pitches.',
    respond: 'We built AI Boris specifically because BPO conversion rates dropped 40% when reps use robotic scripts instead of live conversational intelligence.',
    move: 'Would you be radically opposed to hearing just one tactic a peer BPO used to double their hold rates?'
  }
];

export async function POST(req: NextRequest) {
  const rateLimitResponse = applyRateLimit(req, { maxRequests: 60, windowMs: 60000 });
  if (rateLimitResponse) return rateLimitResponse;

  const startTime = Date.now();

  try {
    const body = await req.json();
    const text: string = (body.text || '').trim();
    const campaignId: string | undefined = body.campaignId;

    if (text) {
      const validation = validateTextPayload(text, 1500);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
    }

    if (!text || text.length < 3) {
      return NextResponse.json<ArmRebuttalResponse>({
        has_objection: false,
        latency_ms: Date.now() - startTime
      });
    }

    const lowerText = text.toLowerCase();

    // 1. First Pass: Fast rule-based semantic friction detector
    let detectedPreset = PRESET_OBJECTIONS.find(item =>
      item.keywords.some(kw => lowerText.includes(kw))
    );

    // 2. Second Pass: Supabase Vector & Database Search
    const supabase = getServiceSupabase();
    let dbMatch: { objection_type: string; acknowledge: string; respond: string; move: string } | null = null;

    try {
      // Query rebuttal entries for the campaign or global
      let query = supabase.from('rebuttal_entries').select('objection_type, acknowledge, respond, move, prospect_objection_patterns');
      if (campaignId) {
        query = query.eq('campaign_id', campaignId);
      }
      const { data: entries, error } = await query.limit(20);

      if (!error && entries && entries.length > 0) {
        for (const entry of entries) {
          const patterns = entry.prospect_objection_patterns || [];
          const matches = patterns.some((p: string) => lowerText.includes(p.toLowerCase()));
          if (matches) {
            dbMatch = {
              objection_type: entry.objection_type,
              acknowledge: entry.acknowledge,
              respond: entry.respond,
              move: entry.move,
            };
            break;
          }
        }
      }
    } catch (dbErr) {
      console.warn('[Rebuttal API] Supabase query notice:', dbErr);
    }

    if (dbMatch) {
      return NextResponse.json<ArmRebuttalResponse>({
        has_objection: true,
        objection_type: dbMatch.objection_type,
        acknowledge: dbMatch.acknowledge,
        respond: dbMatch.respond,
        move: dbMatch.move,
        source: 'vector_db',
        latency_ms: Date.now() - startTime
      });
    }

    if (detectedPreset) {
      return NextResponse.json<ArmRebuttalResponse>({
        has_objection: true,
        objection_type: detectedPreset.type,
        acknowledge: detectedPreset.acknowledge,
        respond: detectedPreset.respond,
        move: detectedPreset.move,
        source: 'rule_engine',
        latency_ms: Date.now() - startTime
      });
    }

    // 3. Third Pass: If text has friction indicators but didn't match standard keywords, invoke Fast LLM Inference (Gemini)
    const frictionIndicators = ['no', 'can\'t', 'won\'t', 'don\'t', 'stop', 'busy', 'later', 'expensive', 'vendor', 'contract', 'satisfied'];
    const hasPossibleFriction = frictionIndicators.some(w => lowerText.includes(w));

    const googleApiKey = process.env.GOOGLE_API_KEY;
    if (hasPossibleFriction && googleApiKey) {
      try {
        const prompt = `You are AI Boris, an elite sales objection intelligence engine for outbound BPO SDRs.
Evaluate this prospect statement: "${text}"

If it contains a sales objection or friction, respond with strict JSON format:
{
  "has_objection": true,
  "objection_type": "Brief Category Name (e.g., Timing, Budget, Vendor, Authority, Need)",
  "acknowledge": "Acknowledge the prospect with tactical empathy without arguing.",
  "respond": "Reframe the objection with a compelling differentiator or proof point.",
  "move": "Propose a low-friction micro-commitment question (e.g. 5-10 min diagnostic)."
}

If it contains NO objection or is merely pleasantries/neutral, respond with:
{ "has_objection": false }

Output pure JSON only.`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${googleApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json', temperature: 0.2 }
            })
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const candidateText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            const parsed = JSON.parse(candidateText);
            if (parsed.has_objection) {
              return NextResponse.json<ArmRebuttalResponse>({
                has_objection: true,
                objection_type: parsed.objection_type || 'Sales Friction',
                acknowledge: parsed.acknowledge,
                respond: parsed.respond,
                move: parsed.move,
                source: 'ai_inference',
                latency_ms: Date.now() - startTime
              });
            }
          }
        }
      } catch (aiErr) {
        console.warn('[Rebuttal API] AI inference fallback notice:', aiErr);
      }
    }

    // Default: No objection identified
    return NextResponse.json<ArmRebuttalResponse>({
      has_objection: false,
      latency_ms: Date.now() - startTime
    });

  } catch (error) {
    console.error('[Rebuttal API] Error processing objection:', error);
    return NextResponse.json<ArmRebuttalResponse>(
      { has_objection: false, latency_ms: Date.now() - startTime },
      { status: 500 }
    );
  }
}
