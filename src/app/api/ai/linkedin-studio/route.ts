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
7. GEMINI REALISTIC & RELATABLE PHOTO PROMPT: An ultra-realistic, relatable, candid 35mm photograph prompt tailored specifically to this episode's topic. Specify authentic modern office setting, real human expressions and natural skin textures, candid posture, natural daylight, Kodak Portra 400 or Fujicolor Pro aesthetic, shallow depth of field, zero artificial gloss, zero cheesy corporate stock photography.
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
      "realisticPhotoPrompt": "Detailed candid 35mm photo prompt with natural light and relatable human subjects",
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
              const fallbackRealisticPrompt = idx === 0 
                ? 'A realistic, relatable, candid 35mm photograph of a modern B2B sales development representative or operations lead sitting at a clean minimalist office desk, focused on dual monitors showing clean data charts with a coffee mug and notebook nearby. Natural daylight, Kodak Portra 400 film aesthetic.'
                : idx === 1
                ? 'A candid, authentic 35mm photograph of two professionals in a modern glass office discussing strategy, with a sales coach pointing to a laptop screen while explaining a conversation tactic, natural unposed expressions, Fujicolor Pro 400H tone.'
                : 'A candid, relatable 35mm photograph of a confident professional standing by a glass whiteboard with handwritten outbound performance metrics and a seat economics diagram, natural high-rise office sunlight, Kodak Portra 800 tone.';

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
                realisticPhotoPrompt: p.realisticPhotoPrompt || fallbackRealisticPrompt,
                realisticImageUrl: `/images/linkedin/episode-${episodeNum}-realistic.jpg`,
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
