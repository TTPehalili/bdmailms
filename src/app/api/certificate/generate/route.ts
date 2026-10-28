import { NextRequest, NextResponse } from 'next/server';
import { CertificateRenderer } from '@/lib/certificateRenderer';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const repName = body.repName || 'Emil Halili';
    const campaignName = body.campaignName || 'Enterprise Outbound SDR Mastery';
    const score = Number(body.score || 92);
    const repId = body.repId || '00000000-0000-0000-0000-000000000000';
    const campaignId = body.campaignId || '00000000-0000-0000-0000-000000000001';

    const certData = CertificateRenderer.createCertificateData(repName, campaignName, score);

    // Save to Supabase
    const supabase = getServiceSupabase();
    try {
      await supabase.from('rep_certifications').upsert({
        rep_id: repId,
        campaign_id: campaignId,
        certified: true,
        score,
        badge_level: score >= 95 ? 'Mastery Elite' : 'Certified BDR',
        certificate_id: certData.certificateId,
        supervisor_name: certData.supervisorName,
        verification_hash: certData.verificationHash,
        endorsement_notes: 'Readiness for Live Floor - Endorsed by Sales Enablement'
      }, { onConflict: 'rep_id, campaign_id' });
    } catch (e) {
      console.warn('[Certificate Gen] Supabase notice:', e);
    }

    return NextResponse.json({
      success: true,
      certificate: certData
    });

  } catch (error: any) {
    console.error('[Certificate Gen] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate certificate' },
      { status: 500 }
    );
  }
}
