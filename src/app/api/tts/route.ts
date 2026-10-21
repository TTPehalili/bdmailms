import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId, voiceSettings } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
    }

    const apiKey = (process.env.ELEVENLABS_API_KEY || process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '').trim();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'ELEVENLABS_API_KEY is not configured on the server.' },
        { status: 500 }
      );
    }

    // Default to Rachel (standard executive female) if voiceId not provided
    const targetVoiceId = voiceId || '21m00Tcm4TlvDq8ikWAM';

    const candidateModels = [
      {
        id: 'eleven_turbo_v2_5',
        settings: {
          stability: voiceSettings?.stability ?? 0.52,
          similarity_boost: voiceSettings?.similarity_boost ?? 0.78,
          style: voiceSettings?.style ?? 0.15,
          use_speaker_boost: true
        }
      },
      {
        id: 'eleven_multilingual_v2',
        settings: {
          stability: voiceSettings?.stability ?? 0.50,
          similarity_boost: voiceSettings?.similarity_boost ?? 0.75,
          style: voiceSettings?.style ?? 0.10,
          use_speaker_boost: true
        }
      }
    ];

    let lastError = '';

    for (const candidate of candidateModels) {
      try {
        const response = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${targetVoiceId}?optimize_streaming_latency=4`,
          {
            method: 'POST',
            headers: {
              'xi-api-key': apiKey,
              'Content-Type': 'application/json',
              Accept: 'audio/mpeg'
            },
            body: JSON.stringify({
              text,
              model_id: candidate.id,
              voice_settings: candidate.settings
            })
          }
        );

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const base64Audio = Buffer.from(arrayBuffer).toString('base64');
          return NextResponse.json({
            audio: `data:audio/mpeg;base64,${base64Audio}`,
            voiceId: targetVoiceId,
            model: candidate.id
          });
        } else {
          lastError = await response.text();
          console.warn(`[ElevenLabs TTS] Model ${candidate.id} failed (${response.status}):`, lastError);
        }
      } catch (err: any) {
        lastError = err?.message || String(err);
        console.warn(`[ElevenLabs TTS] Synthesis attempt error:`, err);
      }
    }

    return NextResponse.json(
      { error: `ElevenLabs TTS failed: ${lastError}` },
      { status: 502 }
    );
  } catch (error: any) {
    console.error('[ElevenLabs TTS Route] Fatal error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error during speech synthesis' },
      { status: 500 }
    );
  }
}
