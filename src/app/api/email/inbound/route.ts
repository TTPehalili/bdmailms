import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getResendApiKey } from '@/lib/resendConfig';

const INBOUND_STORE_FILE = path.join(process.cwd(), '.inbound_emails.json');

function readStoredInboundEmails(): any[] {
  try {
    if (!fs.existsSync(INBOUND_STORE_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(INBOUND_STORE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Could not read inbound store file:', e);
    return [];
  }
}

function writeStoredInboundEmails(emails: any[]): void {
  try {
    fs.writeFileSync(INBOUND_STORE_FILE, JSON.stringify(emails, null, 2), 'utf-8');
  } catch (e) {
    console.error('Could not save to inbound store file:', e);
  }
}

/**
 * Sync inbound emails from Resend Inbound Receiving API
 */
async function syncFromResendReceiving(): Promise<any[]> {
  const apiKey = getResendApiKey();
  if (!apiKey) return [];

  try {
    const listRes = await fetch('https://api.resend.com/emails/receiving', {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: 'no-store'
    });

    if (!listRes.ok) {
      console.warn('[RESEND RECEIVING SYNC] Non-200 from Resend:', listRes.status);
      return [];
    }

    const listData = await listRes.json();
    const receivedList = Array.isArray(listData.data) ? listData.data : [];

    if (receivedList.length === 0) {
      return [];
    }

    const currentStored = readStoredInboundEmails();
    const storedIds = new Set(currentStored.map(m => m.id));
    const newItems: any[] = [];

    for (const item of receivedList) {
      if (storedIds.has(item.id)) continue;

      try {
        const detailRes = await fetch(`https://api.resend.com/emails/receiving/${item.id}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
          cache: 'no-store'
        });

        if (!detailRes.ok) continue;
        const detail = await detailRes.json();

        const rawFrom = detail.from || item.from || 'prospect@targetcompany.com';
        const nameMatch = rawFrom.match(/^([^<]+)<([^>]+)>/);
        const leadName = nameMatch ? nameMatch[1].trim() : rawFrom.split('@')[0];
        const companyDomain = rawFrom.includes('@') ? rawFrom.split('@')[1].split('.')[0] : 'Prospect';
        const leadCompany = companyDomain.charAt(0).toUpperCase() + companyDomain.slice(1);

        const threadId = `thread_${leadName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

        const messageRecord = {
          id: item.id,
          threadId: threadId,
          direction: 'inbound',
          from: rawFrom,
          to: Array.isArray(detail.to) ? detail.to[0] : (detail.to || 'emil@appointmentlyy.com'),
          subject: detail.subject || item.subject || 'Re: apex lead burn',
          body: (detail.text || detail.html || 'Received reply.').trim(),
          timestamp: detail.created_at || item.created_at || new Date().toISOString(),
          status: 'delivered',
          leadName: leadName,
          leadCompany: leadCompany,
          provider: 'resend_live',
          read: false
        };

        newItems.push(messageRecord);
      } catch (err: any) {
        console.warn('[RESEND RECEIVING DETAIL ERROR]', item.id, err.message);
      }
    }

    if (newItems.length > 0) {
      const merged = [...newItems, ...currentStored];
      writeStoredInboundEmails(merged);
      return merged;
    }

    return currentStored;
  } catch (e: any) {
    console.error('[RESEND RECEIVING SYNC ERROR]', e.message);
    return [];
  }
}

/**
 * GET: Retrieve all inbound emails received by Resend Inbound or local ingest
 */
export async function GET() {
  try {
    // 1. Sync from Resend Receiving API
    await syncFromResendReceiving();

    // 2. Return all stored inbound messages
    const emails = readStoredInboundEmails();
    return NextResponse.json({
      success: true,
      count: emails.length,
      emails
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to read inbound emails' },
      { status: 500 }
    );
  }
}

/**
 * Inbound Email Webhook & Local Ingest Handler
 * 
 * Receives incoming emails and replies from Resend Inbound, SendGrid, email relays,
 * or local testing ingestion, and persists them into the unified inbox.
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // Standard webhook extraction (supporting Resend, SendGrid, or custom relay)
    const from = payload.from || payload.sender || payload.headers?.from || 'emil@callview.ai';
    const to = payload.to || payload.recipient || 'emil@appointmentlyy.com';
    const subject = payload.subject || 'Re: apex lead burn';
    const body = payload.body || payload.text || payload.plain_text || payload.html || 'Thank you for reaching out.';
    
    // Extract lead name from "Name <email>" format if present
    const nameMatch = from.match(/^([^<]+)<([^>]+)>/);
    const leadName = payload.leadName || (nameMatch ? nameMatch[1].trim() : from.split('@')[0]);
    const companyDomain = from.includes('@') ? from.split('@')[1].split('.')[0] : 'Prospect Company';
    const leadCompany = payload.leadCompany || (companyDomain.charAt(0).toUpperCase() + companyDomain.slice(1));

    const threadId = payload.thread_id || payload.threadId || `thread_${leadName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    const inboundMessage = {
      id: payload.id || `inbound_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      threadId: threadId,
      direction: 'inbound',
      from: from,
      to: to,
      subject: subject,
      body: body,
      timestamp: payload.timestamp || new Date().toISOString(),
      status: 'delivered',
      leadName: leadName,
      leadCompany: leadCompany,
      provider: 'resend_live',
      read: false
    };

    // Persist to local JSON file
    const current = readStoredInboundEmails();
    const updated = [inboundMessage, ...current.filter(m => m.id !== inboundMessage.id)];
    writeStoredInboundEmails(updated);

    console.log(`[INBOUND EMAIL RECEIVED] From: ${from} | Subject: "${subject}" | Thread: ${threadId}`);

    return NextResponse.json({
      received: true,
      message: inboundMessage,
      allCount: updated.length
    });
  } catch (error: any) {
    console.error('[INBOUND EMAIL WEBHOOK ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process inbound webhook' },
      { status: 500 }
    );
  }
}
