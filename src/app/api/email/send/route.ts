import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { 
      to, 
      from = process.env.RESEND_FROM_EMAIL || 'Emil Vance <emil@appointmentlyy.com>', 
      subject, 
      body, 
      leadName = 'Prospect', 
      leadCompany = 'Target Company',
      leadTitle = 'Decision Maker',
      threadId 
    } = payload;

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, body' },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    let liveSendResult: any = null;
    let provider: 'resend_live' | 'resend_sandbox' = 'resend_sandbox';

    if (resendApiKey) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: from,
            to: Array.isArray(to) ? to : [to],
            subject: subject,
            text: body
          })
        });

        if (resendRes.ok) {
          liveSendResult = await resendRes.json();
          provider = 'resend_live';
        } else {
          let errMessage = 'Resend API rejected the email';
          try {
            const errJson = await resendRes.json();
            errMessage = errJson.message || errMessage;
          } catch {
            const errText = await resendRes.text();
            if (errText) errMessage = errText;
          }
          console.error('[RESEND DISPATCH ERROR]', errMessage);
          return NextResponse.json(
            { error: errMessage },
            { status: resendRes.status || 400 }
          );
        }
      } catch (err: any) {
        console.error('[RESEND API ERROR]', err.message);
        return NextResponse.json(
          { error: err.message || 'Resend network error' },
          { status: 500 }
        );
      }
    }

    const messageId = liveSendResult?.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const finalThreadId = threadId || `thread_${leadName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    const emailRecord = {
      id: messageId,
      threadId: finalThreadId,
      direction: 'outbound',
      from: from,
      to: Array.isArray(to) ? to[0] : to,
      subject: subject,
      body: body,
      timestamp: new Date().toISOString(),
      status: provider === 'resend_live' ? 'delivered' : 'sent',
      leadName: leadName,
      leadCompany: leadCompany,
      leadTitle: leadTitle,
      provider: provider,
      read: true
    };

    return NextResponse.json({
      success: true,
      messageId: messageId,
      provider: provider,
      email: emailRecord
    });
  } catch (error: any) {
    console.error('[EMAIL SEND ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
