import { NextRequest, NextResponse } from 'next/server';
import { formatEmailToParagraphs } from '@/lib/coldEmailStudio';
import { getResendApiKey, getResendInboundEmail, getResendFromEmail } from '@/lib/resendConfig';
import { getConversationThreadKey, extractCleanEmailAddress } from '@/lib/emailStore';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { 
      to, 
      from = getResendFromEmail(), 
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

    // Escape HTML special characters to prevent malformed tags
    const escapeHtml = (str: string) =>
      str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Format HTML paragraphs so email clients (Gmail, Outlook) do not collapse line breaks
    const paragraphs = formatEmailToParagraphs(body);
    const formattedText = paragraphs.join('\n\n');

    const formattedHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #111827;">
        ${paragraphs.map((p: string) => `<p style="margin: 0 0 16px 0; padding: 0; line-height: 1.6;">${escapeHtml(p).replace(/\n/g, '<br />')}</p>`).join('')}
      </div>
    `.trim();

    // Parse sender display name & email
    const emailMatch = from.match(/<([^>]+)>/);
    const rawEmail = emailMatch ? emailMatch[1].trim() : from.trim();
    const nameMatch = from.match(/^([^<]+)</);
    const senderName = nameMatch ? nameMatch[1].trim() : 'Emil Halili';

    // Resend requires verified sending domain (appointmentlyy.com)
    let sanitizedFrom: string;
    let replyTo: string | undefined = undefined;

    if (rawEmail.toLowerCase().endsWith('@appointmentlyy.com')) {
      sanitizedFrom = `${senderName} <${rawEmail}>`;
    } else {
      sanitizedFrom = `${senderName} <emil@appointmentlyy.com>`;
      replyTo = rawEmail;
    }

    const resendApiKey = getResendApiKey();
    if (!resendApiKey) {
      return NextResponse.json(
        { error: 'RESEND_API_KEY is not configured or could not be loaded. Live dispatch cannot proceed.' },
        { status: 500 }
      );
    }

    let liveSendResult: any = null;

    try {
      const resendPayload: any = {
        from: sanitizedFrom,
        to: Array.isArray(to) ? to : [to],
        subject: subject,
        text: formattedText,
        html: formattedHtml
      };

      const inboundAddress = getResendInboundEmail();
      resendPayload.reply_to = replyTo 
        ? [inboundAddress, replyTo]
        : [inboundAddress, 'emil@appointmentlyy.com'];

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(resendPayload)
      });

      if (resendRes.ok) {
        liveSendResult = await resendRes.json();
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

    const messageId = liveSendResult?.id;
    const cleanTo = extractCleanEmailAddress(Array.isArray(to) ? to[0] : to);

    let finalLeadName = leadName;
    let finalLeadCompany = leadCompany;
    let finalLeadTitle = leadTitle;

    if (cleanTo.includes('callview.ai')) {
      if (finalLeadName === 'Julian Vance' || finalLeadName === 'Prospect') {
        finalLeadName = 'Emil Halili';
      }
      if (finalLeadCompany === 'Apex Global BPO' || finalLeadCompany === 'Target Company') {
        finalLeadCompany = 'Callview AI';
      }
      if (finalLeadTitle === 'Decision Maker' || finalLeadTitle === 'Director of Outbound Operations') {
        finalLeadTitle = 'Founder / Decision Maker';
      }
    }

    const finalThreadId = threadId || getConversationThreadKey({
      direction: 'outbound',
      to: cleanTo,
      from: sanitizedFrom,
      subject: subject,
      threadId: threadId
    });

    const provider: 'resend_live' = 'resend_live';
    const emailRecord = {
      id: messageId,
      threadId: finalThreadId,
      direction: 'outbound' as const,
      from: sanitizedFrom,
      to: cleanTo,
      subject: subject,
      body: formattedText,
      timestamp: new Date().toISOString(),
      status: 'delivered' as const,
      leadName: finalLeadName,
      leadCompany: finalLeadCompany,
      leadTitle: finalLeadTitle,
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
