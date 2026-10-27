import { NextRequest, NextResponse } from 'next/server';
import { 
  LINKEDIN_FRAMEWORKS, 
  CONTINUITY_SERIES_PRESETS,
  summarizeCsvLeads, 
  getDeterministicLinkedInSeries, 
  getDeterministicViralComments,
  getDeterministicThreadFollowUps,
  sanitizeTextForLinkedIn,
  CsvIntelligenceSummary,
  LinkedInSeries,
  ViralCommentDraft,
  ThreadFollowUpDraft
} from '@/lib/linkedinStudio';
import { CadenceLeadRecord } from '@/lib/cadenceMaster';

interface LinkedInStudioPayload {
  action: 'generate_series' | 'generate_viral_comment' | 'generate_thread_reply';
  // For generate_series
  leads?: CadenceLeadRecord[];
  csvSummary?: CsvIntelligenceSummary;
  frameworkId?: string;
  presetId?: string;
  customTopicInstruction?: string;
  // For generate_viral_comment
  viralPostText?: string;
  commentAngle?: string;
  // For generate_thread_reply
  myPreviousComment?: string;
  authorReplyText?: string;
}

export async function POST(req: NextRequest) {
  try {
    const payload: LinkedInStudioPayload = await req.json();
    const { action = 'generate_series' } = payload;
    const googleApiKey = process.env.GOOGLE_API_KEY;

    // ACTION 1: VIRAL POST ENGAGEMENT COMMENT GENERATION
    if (action === 'generate_viral_comment') {
      const { viralPostText = '', commentAngle = 'All' } = payload;

      if (!viralPostText || viralPostText.trim().length < 15) {
        return NextResponse.json(
          { error: 'Please provide the viral post content (at least 15 characters).' },
          { status: 400 }
        );
      }

      if (!googleApiKey) {
        const fallbackComments = getDeterministicViralComments(viralPostText).map(c => ({
          ...c,
          comment: sanitizeTextForLinkedIn(c.comment)
        }));
        return NextResponse.json({
          source: 'deterministic_fallback',
          commentDrafts: fallbackComments
        });
      }

      const prompt = `You are an elite B2B Business Development Manager (BDM) and Outbound Sales Leader for an enterprise BPO.
A prospect, buyer, or industry influencer posted the following viral post on LinkedIn:

---
"""${viralPostText.trim().slice(0, 1500)}"""
---

Your task is to write 3 to 4 distinct, high-leverage comment drafts that the SDR can copy and paste manually to build genuine authority, get impressions, and initiate conversations with decision makers.

MANDATORY RULES (CRITICAL VIOLATION IF BROKEN):
1. ZERO EM DASHES: Do NOT use em dashes ("—" or "–" or "--"). Use commas, periods, or clean short sentences instead.
2. ZERO EMOJIS: Do NOT use a single emoji anywhere. Not one.
3. SHORT AND PUNCHY: Keep comments between 18 and 42 words maximum. No bloated paragraphs.
4. AUTHENTIC HUMAN TONE: Sound like a sharp, thoughtful operator in a real-world company, NOT an AI bot, telemarketer, or sycophant.
5. NO PITCHING: Never pitch Appointmentlyy or any product. Provide pure perspective, consultative inquiry, or frontline observations.

Provide exactly 4 comment angles:
1. "Counter-Perspective": Respectfully challenges an assumption in the post using operational reality or list fatigue.
2. "Consultative Question": Asks an intellectual question about their operational benchmarks that compels the author to reply.
3. "Frontline BPO Operator": Shares a quick real-world observation from the calling floor or client campaigns.
4. "Punchy 20-Word": A razor-sharp, under-25-word thought that immediately cuts through noise.

OUTPUT FORMAT:
Return strictly a valid JSON array of objects with keys: "angle", "comment", "intent".
Example JSON format:
[
  {
    "angle": "Counter-Perspective",
    "comment": "Interesting point, but in outbound we usually see the opposite. When lists are recycled across multiple agencies, volume cannot overcome market fatigue. List exclusivity matters more.",
    "intent": "Challenges conventional wisdom using operational reality."
  }
]
Output ONLY valid JSON. No markdown ticks, no preamble.`;

      const candidateModels = [
        'gemini-3.5-flash-lite',
        'gemini-flash-lite-latest',
        'gemini-3.5-flash'
      ];

      for (const model of candidateModels) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${googleApiKey}`;
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.65,
                maxOutputTokens: 800
              }
            })
          });

          if (res.ok) {
            const data = await res.json();
            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const cleanedJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
            const parsedArray = JSON.parse(cleanedJson);

            if (Array.isArray(parsedArray) && parsedArray.length > 0) {
              const sanitizedDrafts: ViralCommentDraft[] = parsedArray.map((item: any, idx: number) => {
                const cleanComment = sanitizeTextForLinkedIn(item.comment || '');
                const wordCount = cleanComment.split(/\s+/).filter(Boolean).length;
                return {
                  id: `viral-cmt-${Date.now()}-${idx}`,
                  angle: item.angle || 'Frontline BPO Operator',
                  comment: cleanComment,
                  wordCount,
                  intent: item.intent || 'Builds authentic engagement'
                };
              });

              return NextResponse.json({
                source: `gemini_${model}`,
                commentDrafts: sanitizedDrafts
              });
            }
          }
        } catch (modelErr) {
          console.warn(`[LinkedIn Studio] Viral comment model ${model} attempt failed:`, modelErr);
        }
      }

      // If all Gemini calls fail, use deterministic fallback
      const fallback = getDeterministicViralComments(viralPostText).map(c => ({
        ...c,
        comment: sanitizeTextForLinkedIn(c.comment)
      }));
      return NextResponse.json({
        source: 'deterministic_fallback',
        commentDrafts: fallback
      });
    }

    // ACTION 2: THREAD REPLY / RELATIONSHIP BUILDER COPILOT
    if (action === 'generate_thread_reply') {
      const { 
        viralPostText = '', 
        myPreviousComment = '', 
        authorReplyText = '' 
      } = payload;

      if (!authorReplyText || authorReplyText.trim().length < 5) {
        return NextResponse.json(
          { error: 'Please provide what the author or prospect replied with.' },
          { status: 400 }
        );
      }

      if (!googleApiKey) {
        const fallback = getDeterministicThreadFollowUps(authorReplyText).map(r => ({
          ...r,
          reply: sanitizeTextForLinkedIn(r.reply)
        }));
        return NextResponse.json({
          source: 'deterministic_fallback',
          threadFollowUps: fallback
        });
      }

      const threadPrompt = `You are an elite B2B Business Development Manager (BDM) on LinkedIn engaging in a high-value public comment thread.
CONTEXT OF THE THREAD:
- Original Viral Post: """${viralPostText.trim().slice(0, 600)}"""
- Your Previous Comment: """${myPreviousComment.trim().slice(0, 400)}"""
- Author or Prospect Just Replied: """${authorReplyText.trim().slice(0, 500)}"""

YOUR MISSION:
Draft 3 distinct follow-up replies that:
1. Continue the thread naturally and display consultative thought leadership.
2. Build a genuine peer-to-peer relationship without pitching or being defensive.
3. Keep the conversation engaging so more followers and prospects read your POV.

MANDATORY RULES:
1. ZERO EM DASHES: Do NOT use "—" or "–" or "--". Use commas, periods, or clean short clauses.
2. ZERO EMOJIS: Do NOT use any emojis.
3. SHORTER COMMENTS: Strictly between 18 and 38 words maximum.
4. AUTHENTIC HUMAN TONE: Sound like a sharp operational peer, not a generic AI bot or telemarketer.

Provide 3 stages:
1. "Deepen Dialogue": Validates their reply thoughtfully while offering a specific operational perspective.
2. "Nuanced Counter": Respectfully explores a trade-off or asking how their team structures the solution.
3. "Relationship Bridge to DM": A warm, natural close to the public thread inviting them to connect.

OUTPUT FORMAT:
Return strictly a valid JSON array of objects with keys: "stage", "reply", "strategicGoal".
Example format:
[
  {
    "stage": "Deepen Dialogue",
    "reply": "Fair point on that distinction. We noticed that when reps switch to permission openers, conversion doubles even on the same headcount. Have you tested varying the first fifteen seconds?",
    "strategicGoal": "Validates their reply while introducing a specific operational test."
  }
]
Output ONLY valid JSON. No markdown ticks, no preamble.`;

      const candidateModels = [
        'gemini-3.5-flash-lite',
        'gemini-flash-lite-latest',
        'gemini-3.5-flash'
      ];

      for (const model of candidateModels) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${googleApiKey}`;
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: threadPrompt }] }],
              generationConfig: {
                temperature: 0.65,
                maxOutputTokens: 800
              }
            })
          });

          if (res.ok) {
            const data = await res.json();
            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const cleanedJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
            const parsedArray = JSON.parse(cleanedJson);

            if (Array.isArray(parsedArray) && parsedArray.length > 0) {
              const sanitizedReplies: ThreadFollowUpDraft[] = parsedArray.map((item: any, idx: number) => {
                const cleanReply = sanitizeTextForLinkedIn(item.reply || '');
                const wordCount = cleanReply.split(/\s+/).filter(Boolean).length;
                return {
                  id: `thread-reply-${Date.now()}-${idx}`,
                  stage: item.stage || 'Deepen Dialogue',
                  reply: cleanReply,
                  wordCount,
                  strategicGoal: item.strategicGoal || 'Deepens engagement'
                };
              });

              return NextResponse.json({
                source: `gemini_${model}`,
                threadFollowUps: sanitizedReplies
              });
            }
          }
        } catch (modelErr) {
          console.warn(`[LinkedIn Studio] Thread reply model ${model} attempt failed:`, modelErr);
        }
      }

      const fallback = getDeterministicThreadFollowUps(authorReplyText).map(r => ({
        ...r,
        reply: sanitizeTextForLinkedIn(r.reply)
      }));
      return NextResponse.json({
        source: 'deterministic_fallback',
        threadFollowUps: fallback
      });
    }

    // ACTION 3: 3-POST SEQUENTIAL LINKEDIN SERIES ARC GENERATION
    const { 
      leads, 
      frameworkId = 'contrarian-truth',
      presetId = 'broker-margin-continuity',
      customTopicInstruction = ''
    } = payload;

    // Summarize CSV leads dataset or use precomputed summary
    const summary: CsvIntelligenceSummary = payload.csvSummary || summarizeCsvLeads(leads);
    const framework = LINKEDIN_FRAMEWORKS.find(f => f.id === frameworkId) || LINKEDIN_FRAMEWORKS[0];
    const preset = CONTINUITY_SERIES_PRESETS.find(p => p.id === presetId) || CONTINUITY_SERIES_PRESETS[0];

    if (!googleApiKey) {
      const fallbackSeries = getDeterministicLinkedInSeries(summary, frameworkId, presetId);
      return NextResponse.json({
        source: 'deterministic_fallback',
        csvSummary: summary,
        series: fallbackSeries
      });
    }

    const seriesPrompt = `You are a world-class B2B LinkedIn Thought Leadership strategist specializing in Outbound Sales, BPO Operations, and Enterprise Appointment Setting.
You are designing a high-retention, 3-Post Sequential LinkedIn Series for a BPO Business Development Manager (BDM) or Sales Development Representative (SDR).

THE TARGET AUDIENCE & DATASET INTELLIGENCE (Derived from active CSV prospect list):
- Total Accounts Analyzed: ${summary.totalLeads} accounts
- Dominant Floor Size: ${summary.dominantHeadcount}
- Recurring Bottlenecks & Client Pain Points: ${summary.topPainPoints.join(', ')}
- Dominant Tech Stacks: ${summary.topTechStacks.join(', ')}
- Incumbent Competitors: ${summary.topCompetitors.join(', ')}
- Summary Narrative: ${summary.summaryNarrative}

SERIES CONTINUITY & FRAMEWORK:
- Series Theme: ${preset.theme}
- Continuity Hook from Last Week: "${preset.recapHook}"
- Writing Framework: ${framework.name} (${framework.description})
- Hook Philosophy: ${framework.hookPhilosophy}
- Body Philosophy: ${framework.bodyPhilosophy}
- Additional Custom Angle: ${customTopicInstruction || 'Highlight eliminating broker dependencies and building private enriched pipelines.'}

CRITICAL EXECUTION REQUIREMENTS FOR THE 3 POSTS:
1. EPISODIC CONTINUITY:
   - Episode 1 (Tuesday): The Bottleneck Unveiled (Presents the hidden flaw or mistake in how prospects currently handle operations).
   - Episode 2 (Thursday): The Tactical Playbook (Breaks down the operational fix or transition without burning client leads).
   - Episode 3 (Friday): The Debate & Series Bridge (Presents a high-stakes strategic dilemma, asks for community input, and teases next week's series).
2. HOOKS: Must be scroll-stopping. First 2 lines before "see more" must create an irresistible curiosity gap or state a contrarian truth.
3. BODY LENGTH: Strictly under 90 words total per post body. Use short 1-2 sentence paragraphs with clean line breaks. High retention readability.
4. CTA: Non-salesy, curious, debate-sparking question. Never say "DM me" or "link in bio".
5. ALGORITHM HASHTAGS: Exactly 4 to 5 hyper-targeted BPO / sales development hashtags (e.g. #BPOOperations #ClientAcquisition #SalesDevelopment #InsideSales #OutboundStrategy).
6. GEMINI IMAGE GENERATION PROMPT: A rich, creative prompt describing an ultra-clean, minimalist editorial visual or infographic card on dark graphite/zinc background with high contrast typography and clear metric callout.
7. GEMINI REALISTIC & RELATABLE PHOTO PROMPT (STRICT TOPIC & POV ALIGNMENT):
   - CRITICAL REQUIREMENT: The realistic photo prompt MUST DIRECTLY RESONATE with the post's core message and angle:
     * EPISODE 1 or Broker/Middleman Posts: Describe an arrogant, manipulative lead broker depicted as a "devil in disguise". Slick dark charcoal tailored suit, crimson silk pocket square, calculating cynical smirk, steepled hands, predatory posture in a shadowy boardroom with contracts showing 35% margin fee skims, dramatic chiaroscuro lighting.
     * EPISODE 2 or Training/Script/Ramp Posts: Describe an authentic young Filipino male SDR in a modern Manila BGC office with headset, intensely engaged in live consultative calling with dual screens displaying "LIVE OBJECTION TELEPROMPTER CUES" and a paper script discarded into a wastebasket.
     * EPISODE 3 or Direct Contract/Equity Posts: Describe the respectful, collaborative peer-to-peer partnership between a foreign enterprise client executive and an articulate Filipino female BPO operations director analyzing direct contract equity and margin growth by a glass whiteboard.
   - DEMOGRAPHIC MANDATE: Frontline SDRs, callers, team leads, and operations managers MUST be explicitly described as authentic Filipino professionals with Southeast Asian features in Manila or Cebu tech offices. Foreign / Caucasian characters should ONLY appear when showing foreign enterprise client collaboration. Never output generic stock photography descriptions.
8. INJECTED COMMENTS: Exactly 2 pre-drafted comments that the SDR can post as the 1st and 2nd comments to keep conversation active.
   MANDATORY RULE FOR INJECTED COMMENTS:
   - ZERO EM DASHES (no "—", "–", or "--").
   - ZERO EMOJIS (no icons or smileys).
   - Shorter comments (under 35 words).

OUTPUT FORMAT:
Return strictly a valid JSON object with the following schema:
{
  "seriesTitle": "The Autonomous BPO Outbound Series: Part 1-3",
  "seriesHookRecap": "Recap connecting to last week's discussions",
  "targetBottleneckSummary": "1-sentence summary of the core pain point addressed",
  "targetAudience": "BPO Founders, CROs, and Outbound Operations Directors",
  "posts": [
    {
      "episodeNumber": 1,
      "dayLabel": "Tuesday • Episode 1",
      "title": "Episode 1 Title",
      "hook": "Scroll-stopping first 2 lines",
      "body": "Post body under 90 words with clean line breaks",
      "cta": "Engaging closing question",
      "hashtags": ["#BPOOperations", "#SalesDevelopment"],
      "imagePrompt": "Detailed prompt for Gemini / Imagen graphic generation",
      "realisticPhotoPrompt": "Detailed candid 35mm photo prompt resonating with the specific topic (e.g. predatory broker devil in disguise, scriptless teleprompter SDR, or client equity partnership)",
      "visualCard": {
        "type": "metric_callout",
        "headline": "Short punchy card title",
        "subheadline": "Context line",
        "metric": "35%",
        "metricLabel": "Description of metric",
        "tag": "EPISODE 01 • THE BOTTLENECK"
      },
      "injectedComments": [
        "Comment 1 under 35 words without em dashes and without emojis",
        "Comment 2 under 35 words without em dashes and without emojis"
      ]
    }
  ]
}
Output ONLY valid JSON. No markdown ticks, no preamble.`;

    const candidateModels = [
      'gemini-3.5-flash-lite',
      'gemini-flash-lite-latest',
      'gemini-3.5-flash'
    ];

    for (const model of candidateModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${googleApiKey}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: seriesPrompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2500
            }
          })
        });

        if (res.ok) {
          const data = await res.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanedJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanedJson);

          if (parsed && Array.isArray(parsed.posts) && parsed.posts.length > 0) {
            // Sanitize each post and its comments
            const sanitizedPosts = parsed.posts.map((p: any, idx: number) => {
              const cleanComments = (p.injectedComments || []).map((c: string) => sanitizeTextForLinkedIn(c));
              const wordCount = (p.body || '').split(/\s+/).filter(Boolean).length;
              const episodeNum = (idx % 3) + 1;
              
              // Intelligent POV analysis from post content and generated prompt
              const fullText = `${p.title || ''} ${p.hook || ''} ${p.body || ''} ${p.cta || ''}`.toLowerCase();
              const promptLower = (p.realisticPhotoPrompt || '').toLowerCase();

              const isBrokerTopic = /broker|middleman|devil|skim|subcontractor|renting|recycled shared|margin drain|commodity|commission/.test(fullText) || /broker|middleman|devil|suit|predatory|boardroom/.test(promptLower);
              const isScriptTopic = /script|sparring|teleprompt|classroom|ramp|objection|drill|freeze|150ms|180ms|hesitation|rookie/.test(fullText) || /sparring|teleprompter|headset|script|discard/.test(promptLower);
              const isEquityTopic = /client|equity|valuation|direct contract|enterprise|partnership|retainer|investor|multiple|\$24/.test(fullText) || /client|partnership|director|whiteboard/.test(promptLower);

              let assignedImageUrl = '/images/linkedin/broker-middleman-devil.jpg';
              let assignedPrompt = p.realisticPhotoPrompt;
              let alternativeImageUrl = '/images/linkedin/script-discard-sparring.jpg';
              let alternativeImageLabel = '⚡ Direct Outbound Engine';
              let alternativeImagePrompt = 'Authentic candid 35mm photojournalism in a high-tech Manila BGC outbound center: An articulate young Filipino male SDR wearing an ergonomic headset, intensely engaged in live consultative calling with real-time teleprompter cues.';

              if (isBrokerTopic || idx === 0) {
                assignedImageUrl = '/images/linkedin/broker-middleman-devil.jpg';
                if (!assignedPrompt || (!assignedPrompt.toLowerCase().includes('broker') && !assignedPrompt.toLowerCase().includes('suit'))) {
                  assignedPrompt = 'A cinematic 35mm editorial photograph of a predatory corporate lead broker and middleman depicted as a devil in disguise: An arrogant, manipulative man in his late 40s in an expensive dark charcoal suit with a crimson silk pocket square, leaning back in a leather armchair in a shadowy penthouse boardroom, steepled hands, wearing a calculating cynical smirk over contracts stamped with 35% margin fees. Chiaroscuro dramatic lighting with subtle crimson rim light.';
                }
                alternativeImageUrl = '/images/linkedin/script-discard-sparring.jpg';
                alternativeImageLabel = '⚡ Direct Outbound Engine';
                alternativeImagePrompt = 'Authentic candid 35mm photojournalism in a high-tech Manila BGC outbound center: An articulate young Filipino male SDR wearing an ergonomic headset, intensely engaged in live consultative calling with real-time teleprompter cues.';
              } else if (isScriptTopic || idx === 1) {
                assignedImageUrl = '/images/linkedin/script-discard-sparring.jpg';
                if (!assignedPrompt || (!assignedPrompt.toLowerCase().includes('script') && !assignedPrompt.toLowerCase().includes('teleprompt') && !assignedPrompt.toLowerCase().includes('headset'))) {
                  assignedPrompt = 'Authentic candid 35mm photojournalism in a high-tech Manila BGC outbound center: An articulate young Filipino male SDR wearing an ergonomic headset, intensely engaged in live consultative calling. Dual screens display "LIVE OBJECTION TELEPROMPTER CUES - 150ms LATENCY" and real-time prospect telemetry. On the desk next to him, a crumpled static PDF script sits discarded in a recycling bin, symbolizing the transition from rigid scripts to agile voice sparring.';
                }
                alternativeImageUrl = '/images/linkedin/broker-middleman-devil.jpg';
                alternativeImageLabel = '⚠️ The Middleman Trap';
                alternativeImagePrompt = 'A cinematic 35mm editorial photograph of a predatory corporate lead broker and middleman depicted as a devil in disguise: An arrogant, manipulative man in his late 40s in an expensive dark charcoal suit with a crimson silk pocket square, leaning back in a leather armchair in a shadowy penthouse boardroom, steepled hands, wearing a calculating cynical smirk over contracts stamped with 35% margin fees.';
              } else {
                assignedImageUrl = '/images/linkedin/direct-partnership-equity.jpg';
                if (!assignedPrompt || (!assignedPrompt.toLowerCase().includes('client') && !assignedPrompt.toLowerCase().includes('partnership'))) {
                  assignedPrompt = 'A candid 35mm photograph showing the direct relationship between a foreign enterprise client and Filipino offshore talent: A senior North American client executive in a tailored navy blazer and a distinguished, articulate Filipino female BPO operations director collaborating as equal strategic partners. They stand beside a transparent glass architectural whiteboard displaying "DIRECT SEAT CONTRACT ECONOMICS • 100% EQUITY RETENTION • REVENUE VELOCITY". Authentic warm golden hour sunlight, Kodak Portra 800 tone.';
                }
                alternativeImageUrl = '/images/linkedin/broker-middleman-devil.jpg';
                alternativeImageLabel = '⚠️ The Middleman Trap (Devil in Disguise)';
                alternativeImagePrompt = 'A cinematic 35mm editorial photograph of a predatory corporate lead broker depicted as a devil in disguise: Arrogant, manipulative man in an expensive dark charcoal suit with a crimson silk pocket square, leaning back in a leather armchair in a shadowy penthouse boardroom with contracts marked 35% margin fees.';
              }

              return {
                id: `post-ep${idx + 1}-${Date.now()}`,
                episodeNumber: p.episodeNumber || (idx + 1),
                dayLabel: p.dayLabel || (idx === 0 ? 'Tuesday • Episode 1' : idx === 1 ? 'Thursday • Episode 2' : 'Friday • Episode 3'),
                title: p.title || `Episode ${idx + 1}`,
                hook: p.hook || '',
                body: p.body || '',
                cta: p.cta || '',
                wordCount,
                estimatedReadSeconds: Math.ceil((wordCount / 200) * 60),
                hashtags: Array.isArray(p.hashtags) ? p.hashtags : ['#BPOOperations', '#ClientAcquisition', '#SalesDevelopment'],
                imagePrompt: p.imagePrompt || 'Minimalist dark graphite BPO metric infographic with Swiss typography',
                realisticPhotoPrompt: assignedPrompt,
                realisticImageUrl: assignedImageUrl,
                alternativeImageUrl,
                alternativeImageLabel,
                alternativeImagePrompt,
                visualCard: {
                  type: p.visualCard?.type || 'metric_callout',
                  headline: p.visualCard?.headline || p.title || 'Operational Metric',
                  subheadline: p.visualCard?.subheadline || 'Key takeaway for outbound leaders',
                  metric: p.visualCard?.metric || '35%',
                  metricLabel: p.visualCard?.metricLabel || 'Margin efficiency',
                  tag: p.visualCard?.tag || `EPISODE 0${idx + 1}`
                },
                injectedComments: cleanComments.length > 0 ? cleanComments : [
                  'Auditing our own campaigns showed that conversational pacing consistently beats script compliance by over 30 percent.',
                  'Curious how other operations leaders manage lead fatigue when scaling outbound lines.'
                ]
              };
            });

            const seriesResult: LinkedInSeries = {
              seriesTitle: parsed.seriesTitle || 'The Autonomous BPO Outbound Series: Part 1-3',
              seriesHookRecap: parsed.seriesHookRecap || preset.recapHook,
              targetBottleneckSummary: parsed.targetBottleneckSummary || `Targeting ${summary.topPainPoints[0]} across ${summary.dominantHeadcount} floors`,
              targetAudience: parsed.targetAudience || 'BPO Founders and Outbound Operations Directors',
              posts: sanitizedPosts
            };

            return NextResponse.json({
              source: `gemini_${model}`,
              csvSummary: summary,
              series: seriesResult
            });
          }
        }
      } catch (modelErr) {
        console.warn(`[LinkedIn Studio] Series model ${model} attempt failed:`, modelErr);
      }
    }

    // Fallback if all attempts fail
    const fallbackSeries = getDeterministicLinkedInSeries(summary, frameworkId, presetId);
    return NextResponse.json({
      source: 'deterministic_fallback',
      csvSummary: summary,
      series: fallbackSeries
    });

  } catch (error: any) {
    console.error('[API LinkedIn Studio Fatal Error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error in LinkedIn Studio API' },
      { status: 500 }
    );
  }
}
