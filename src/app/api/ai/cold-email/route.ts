import { NextRequest, NextResponse } from 'next/server';
import { 
  COLD_EMAIL_FRAMEWORKS,
  sanitizeColdEmail,
  getDeterministicColdEmail,
  ColdEmailGeneratedDraft
} from '@/lib/coldEmailStudio';

interface ColdEmailApiPayload {
  frameworkId?: string;
  userIdea?: string;
  prospect?: {
    name?: string;
    company?: string;
    title?: string;
    techStack?: string;
    painPoint?: string;
    headcount?: string;
  };
  tone?: string;
}

export async function POST(req: NextRequest) {
  try {
    const payload: ColdEmailApiPayload = await req.json();
    const { 
      frameworkId = 'braun-poke-the-bear', 
      userIdea = '', 
      prospect = { name: 'Julian', company: 'Apex BPO', title: 'Director of Outbound Operations' },
      tone = 'Crisp & Direct'
    } = payload;

    const googleApiKey = process.env.GOOGLE_API_KEY;
    const selectedFramework = COLD_EMAIL_FRAMEWORKS.find(f => f.id === frameworkId) || COLD_EMAIL_FRAMEWORKS[0];

    const targetName = prospect.name || 'Julian';
    const targetCompany = prospect.company || 'Apex BPO';
    const targetTitle = prospect.title || 'Outbound Leader';
    const targetTech = prospect.techStack || 'Apollo and HubSpot';
    const targetPain = prospect.painPoint || 'setters fumbling competitor objections and burning shared lists';

    const prompt = `You are an elite enterprise B2B sales copywriter and manual cold email specialist.
Your goal is to write a manual cold email that an SDR or BDM can copy and paste into Gmail/Outlook to send to a decision maker.

TARGET PROSPECT:
- Name: ${targetName}
- Company: ${targetCompany}
- Title: ${targetTitle}
- Tech Stack: ${targetTech}
- Identified Pain: ${targetPain}

USER RAW IDEA / STRATEGY:
"${userIdea || selectedFramework.defaultIdeaTemplate}"

FRAMEWORK TO ADHERE TO:
Name: ${selectedFramework.name} (${selectedFramework.authorOrStyle})
Framework Instructions:
${selectedFramework.promptInstruction}

MANDATORY COPYWRITING RULES (STRICT VIOLATION IF BROKEN):
1. ZERO EM DASHES: Do NOT use em dashes ("—", "–", or "--") anywhere. Use periods, commas, or clean short clauses.
2. ZERO EMOJIS: Do NOT use a single emoji anywhere.
3. CONCISE: Body must be strictly between 40 and 70 words total. Zero marketing fluff. Zero pleasantries like "Hope you are doing well" or "I am reaching out because".
4. ANTI-SALES CTA: The ending sentence must be low-friction, permission-based, or no-oriented.
5. SUBJECT LINES: Provide 3 short subject lines under 4 words, preferably lowercase.

OUTPUT FORMAT:
Return strictly a valid JSON object matching this schema:
{
  "subjectLines": [
    { "label": "Low Friction", "text": "lowercase under 4 words", "angle": "why this works" },
    { "label": "Direct Observation", "text": "lowercase under 4 words", "angle": "why this works" },
    { "label": "Pattern Interrupt", "text": "lowercase under 4 words", "angle": "why this works" }
  ],
  "body": "The full cold email body including greeting and sign-off. Use double line breaks \\n\\n between paragraphs. Max 65 words.",
  "structuralBreakdown": {
    "triggerOrHook": "1-sentence hook",
    "tensionOrObservation": "1-sentence tension or problem observation",
    "truthOrValue": "1-sentence core consultative truth",
    "ctaSentence": "1-sentence low friction question"
  },
  "ctaVariations": [
    { "label": "Interest-Based", "text": "1-sentence question", "style": "Interest-Based" },
    { "label": "No-Oriented", "text": "1-sentence negative constraint question", "style": "No-Oriented" },
    { "label": "Permission-Video", "text": "1-sentence permission question", "style": "Permission-Video" }
  ],
  "readingGradeLevel": "5th Grade"
}
Output valid JSON only. Do not wrap in markdown fences.`;

    if (googleApiKey) {
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
                responseMimeType: 'application/json',
                temperature: 0.4,
                maxOutputTokens: 600
              }
            })
          });

          if (res.ok) {
            const data = await res.json();
            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const cleanedJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanedJson);

            if (parsed && parsed.body) {
              const { cleanText, emDashesCount, emojisCount } = sanitizeColdEmail(parsed.body);
              const sanitizedSubjects = (parsed.subjectLines || []).map((s: any) => ({
                label: s.label || 'Subject',
                text: sanitizeColdEmail(s.text || '').cleanText.toLowerCase(),
                angle: s.angle || 'High reply rate'
              }));

              const sanitizedCtas = (parsed.ctaVariations || []).map((c: any) => ({
                label: c.label || 'CTA',
                text: sanitizeColdEmail(c.text || '').cleanText,
                style: c.style || 'Interest-Based'
              }));

              const result: ColdEmailGeneratedDraft = {
                id: `ai-draft-${Date.now()}`,
                subjectLines: sanitizedSubjects.length > 0 ? sanitizedSubjects : [
                  { label: 'Low Friction', text: 'quick question', angle: 'Minimal cognitive load' }
                ],
                selectedSubjectIndex: 0,
                body: cleanText,
                structuralBreakdown: {
                  triggerOrHook: sanitizeColdEmail(parsed.structuralBreakdown?.triggerOrHook || '').cleanText,
                  tensionOrObservation: sanitizeColdEmail(parsed.structuralBreakdown?.tensionOrObservation || '').cleanText,
                  truthOrValue: sanitizeColdEmail(parsed.structuralBreakdown?.truthOrValue || '').cleanText,
                  ctaSentence: sanitizeColdEmail(parsed.structuralBreakdown?.ctaSentence || '').cleanText
                },
                ctaVariations: sanitizedCtas.length > 0 ? sanitizedCtas : [
                  { label: 'Interest-Based', text: 'Worth a quick look, or bad timing?', style: 'Interest-Based' }
                ],
                selectedCtaIndex: 0,
                wordCount: cleanText.split(/\s+/).filter(Boolean).length,
                readingGradeLevel: parsed.readingGradeLevel || '5th Grade',
                frameworkUsed: selectedFramework.name,
                prospectTargetName: targetName,
                prospectTargetCompany: targetCompany,
                userRawIdea: userIdea,
                sanitizationAudit: {
                  emDashesRemoved: emDashesCount,
                  emojisRemoved: emojisCount,
                  isClean: true
                }
              };

              return NextResponse.json({
                source: 'gemini_ai',
                modelUsed: model,
                draft: result
              });
            }
          }
        } catch (callErr) {
          console.warn(`[ColdEmailStudio] Model ${model} failed, attempting next:`, callErr);
        }
      }
    }

    // Deterministic fallback if API offline or rate-limited
    const fallback = getDeterministicColdEmail(frameworkId, userIdea, {
      name: targetName,
      company: targetCompany,
      title: targetTitle
    });

    return NextResponse.json({
      source: 'deterministic_fallback',
      draft: fallback
    });

  } catch (error: any) {
    console.error('Error generating cold email:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate cold email' },
      { status: 500 }
    );
  }
}
