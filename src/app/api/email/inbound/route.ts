import { NextRequest, NextResponse } from 'next/server';

/**
 * Inbound Email Webhook Handler
 * 
 * Receives incoming emails and replies from Resend Inbound / SendGrid / Webhook relays
 * and formats them into our unified email inbox store.
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // Standard webhook extraction (supporting Resend, SendGrid, or custom relay)
    const from = payload.from || payload.sender || payload.headers?.from || 'prospect@targetcompany.com';
    const to = payload.to || payload.recipient || 'emil@appointmentlyy.com';
    const subject = payload.subject || 'Re: Cold Outreach';
    const body = payload.text || payload.plain_text || payload.html || 'Thank you for reaching out.';
    
    // Extract lead name from "Name <email>" format if present
    const nameMatch = from.match(/^([^<]+)<([^>]+)>/);
    const leadName = nameMatch ? nameMatch[1].trim() : from.split('@')[0];
    const companyDomain = from.includes('@') ? from.split('@')[1].split('.')[0] : 'Prospect Company';
    const leadCompany = companyDomain.charAt(0).toUpperCase() + companyDomain.slice(1);

    const threadId = payload.thread_id || `thread_${leadName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    const inboundMessage = {
      id: `inbound_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      threadId: threadId,
      direction: 'inbound',
      from: from,
      to: to,
      subject: subject,
      body: body,
      timestamp: new Date().toISOString(),
      status: 'delivered',
      leadName: leadName,
      leadCompany: leadCompany,
      provider: 'resend_live',
      read: false
    };

    console.log(`[INBOUND EMAIL RECEIVED] From: ${from} | Subject: "${subject}"`);

    return NextResponse.json({
      received: true,
      message: inboundMessage
    });
  } catch (error: any) {
    console.error('[INBOUND EMAIL WEBHOOK ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to process inbound webhook' },
      { status: 500 }
    );
  }
}
