import { NextRequest, NextResponse } from 'next/server';
import { SPARRING_PERSONAS } from '@/lib/personas';

export async function POST(req: NextRequest) {
  try {
    const { personaId } = await req.json();
    const persona = SPARRING_PERSONAS.find(p => p.id === personaId) || SPARRING_PERSONAS[0];
    const elevenApiKey = (process.env.ELEVENLABS_API_KEY || process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '').trim();

    const greetingText = `${persona.name} here. ${persona.coreObjection}`;

    let audioUrl: string | null = null;
    if (elevenApiKey) {
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
              text: greetingText,
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
        }
      } catch (err) {
        console.warn('[Dial Route TTS Error]:', err);
      }
    }

    return NextResponse.json({
      greetingText,
      audioUrl
    });
  } catch (error: any) {
    console.error('[Sparring Dial Route] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Dial initiation failed' },
      { status: 500 }
    );
  }
}
