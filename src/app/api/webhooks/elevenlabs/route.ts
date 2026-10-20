import { NextRequest, NextResponse } from 'next/server';
import { QaEvaluator, DialogueTurn } from '@/lib/qaEvaluator';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const conversationId: string = body.conversation_id || body.sessionId || `session-${Date.now()}`;
    const rawTranscript = body.transcript || [];
    const scenarioContext: string | undefined = body.scenarioContext || body.scenario;
    const repId: string = body.repId || '00000000-0000-0000-0000-000000000000';
    const campaignId: string | undefined = body.campaignId;

    // Convert raw turns into standard DialogueTurn format
    const turns: DialogueTurn[] = Array.isArray(rawTranscript)
      ? rawTranscript.map((t: any) => ({
          role: (t.role || t.speaker || 'rep').toLowerCase() === 'rep' || (t.role || t.speaker || '').toLowerCase() === 'agent' ? 'rep' : 'prospect',
          content: t.content || t.message || t.text || '',
          timestamp: t.timestamp || undefined
        }))
      : [];

    if (turns.length === 0) {
      return NextResponse.json(
        { error: 'Transcript array is required and must not be empty.' },
        { status: 400 }
      );
    }

    // 1. Run Automated QA Evaluation & ARM Scoring Engine
    const evaluation = await QaEvaluator.evaluateCall(conversationId, turns, scenarioContext);

    // 2. Persist session to Supabase
    const supabase = getServiceSupabase();
    let savedSessionId: string = conversationId;

    try {
      const { data, error } = await supabase
        .from('sparring_sessions')
        .insert({
          rep_id: repId,
          campaign_id: campaignId || null,
          scenario: scenarioContext || 'AI Sparring Simulation',
          transcript: evaluation.annotatedTranscript,
          score: evaluation.overallScore,
          feedback: {
            overallGrade: evaluation.overallGrade,
            armExecutionScore: evaluation.armExecutionScore,
            scriptAdherenceScore: evaluation.scriptAdherenceScore,
            talkToListenRatio: evaluation.talkToListenRatio,
            strengths: evaluation.strengths,
            weaknesses: evaluation.weaknesses,
            coachingActionItems: evaluation.coachingActionItems
          }
        })
        .select('id')
        .single();

      if (!error && data) {
        savedSessionId = data.id;
      }
    } catch (dbErr) {
      console.warn('[ElevenLabs Webhook] Supabase persist note:', dbErr);
    }

    return NextResponse.json({
      success: true,
      sessionId: savedSessionId,
      evaluation: {
        ...evaluation,
        sessionId: savedSessionId
      }
    });

  } catch (error: any) {
    console.error('[ElevenLabs Webhook] Error evaluating sparring session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to evaluate sparring session' },
      { status: 500 }
    );
  }
}
