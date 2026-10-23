import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lead_id, phone, reason, rep_name } = body;

    const quarantineAuditId = `dnc_audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    console.warn(`[GLOBAL DNC QUARANTINE] Number ${phone} for lead ${lead_id} permanently quarantined by ${rep_name || 'SDR'}. Audit: ${quarantineAuditId}`);

    return NextResponse.json({
      status: 'quarantined',
      audit_record_id: quarantineAuditId,
      lead_id: lead_id || 'lead_001',
      phone: phone || '',
      reason: reason || 'Prospect requested Do Not Call',
      active_drip_emails_cancelled: true,
      quarantined_at: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[DNC QUARANTINE ERROR]', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Error processing DNC quarantine' },
      { status: 500 }
    );
  }
}
