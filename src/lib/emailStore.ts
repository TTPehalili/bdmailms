/**
 * Unified Email Store & Communications Engine
 * 
 * Manages all outbound dispatched emails and inbound prospect replies
 * across cold outbound campaigns, Boris calling cadences, and manual sends.
 */

export interface EmailMessage {
  id: string;
  threadId: string;
  direction: 'outbound' | 'inbound';
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
  status: 'queued' | 'sent' | 'delivered' | 'opened' | 'replied' | 'bounced';
  leadId?: string;
  leadName: string;
  leadCompany: string;
  leadTitle?: string;
  provider: 'resend_live' | 'resend_sandbox' | 'manual_send';
  read?: boolean;
  starred?: boolean;
}

export const INITIAL_SEED_EMAILS: EmailMessage[] = [
  {
    id: 'msg_seed_001',
    threadId: 'thread_julian_vance',
    direction: 'outbound',
    from: 'Emil Vance <emil@appointmentlyy.com>',
    to: 'julian@apexglobalbpo.com',
    subject: 'apex lead burn',
    body: `Hi Julian, Saw Apex Global BPO is scaling outbound seats to 65. Typically when BPO leaders scale outbound, the hidden leak is not lead volume, it is callers getting chopped on price by commodity competitors. Traditional coaching fails when reps freeze in the first 20 seconds. We feed consultative rebuttals in 150 milliseconds live on the dial. Open to a 2-minute video showing how we insulate margins, or totally off base?`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    status: 'replied',
    leadName: 'Julian Vance',
    leadCompany: 'Apex Global BPO',
    leadTitle: 'Director of Outbound Operations',
    provider: 'resend_sandbox',
    read: true,
    starred: true
  },
  {
    id: 'msg_seed_002',
    threadId: 'thread_julian_vance',
    direction: 'inbound',
    from: 'Julian Vance <julian@apexglobalbpo.com>',
    to: 'Emil Vance <emil@appointmentlyy.com>',
    subject: 'Re: apex lead burn',
    body: `Hey Emil,

You caught me at a good time. We actually just onboarded 15 new outbound reps last Monday in Clark and our hold rate took a 20% dive because junior setters keep stumbling when prospects say they already have an agency.

How are you feeding rebuttals in 150ms without the callers sounding like robots? Send over that 2-minute video. If it looks solid, I'm open to a 15-minute screen share with my floor QA lead Thursday.

Best,
Julian Vance
Director of Outbound Operations
Apex Global BPO`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    status: 'delivered',
    leadName: 'Julian Vance',
    leadCompany: 'Apex Global BPO',
    leadTitle: 'Director of Outbound Operations',
    provider: 'resend_sandbox',
    read: false,
    starred: true
  },
  {
    id: 'msg_seed_003',
    threadId: 'thread_marcus_brody',
    direction: 'outbound',
    from: 'Emil Vance <emil@appointmentlyy.com>',
    to: 'mbrody@nexuscall.com',
    subject: 'quick question on ramp time',
    body: `Hi Marcus,

Most BPO leaders running 120 seats tell me their biggest margin leak is watching new hires burn through 500 client accounts just trying to figure out live dials.

Curious if you are seeing that same friction at Nexus Call, or do your callers somehow hit full production in 72 hours without burning leads?

Best,
Emil`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    status: 'opened',
    leadName: 'Marcus Brody',
    leadCompany: 'Nexus Call Solutions',
    leadTitle: 'VP of Contact Center Ops',
    provider: 'resend_sandbox',
    read: true
  },
  {
    id: 'msg_seed_004',
    threadId: 'thread_marcus_brody',
    direction: 'inbound',
    from: 'Marcus Brody <mbrody@nexuscall.com>',
    to: 'Emil Vance <emil@appointmentlyy.com>',
    subject: 'Re: quick question on ramp time',
    body: `Emil,

We definitely see ramp lag—takes our trainees about 3 weeks before they're booking at quota. What's your typical pricing model for a 50-seat floor? We're on Salesforce and Twilio.

Marcus`,
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    status: 'delivered',
    leadName: 'Marcus Brody',
    leadCompany: 'Nexus Call Solutions',
    leadTitle: 'VP of Contact Center Ops',
    provider: 'resend_sandbox',
    read: false,
    starred: true
  },
  {
    id: 'msg_seed_005',
    threadId: 'thread_sarah_jenkins',
    direction: 'outbound',
    from: 'Emil Vance <emil@appointmentlyy.com>',
    to: 'sjenkins@cloudstaffbpo.com',
    subject: 'broker margin leak',
    body: `Hi Sarah, Notice CloudStaff is adding 30 outbound appointment setters. Typically when agencies take on broker campaigns, the middleman pockets 60% of the contract while you carry 100% of the OPEX risk. Would it be a terrible idea to compare notes for 2 minutes on how to take internal client acquisition back in-house?`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    status: 'delivered',
    leadName: 'Sarah Jenkins',
    leadCompany: 'CloudStaff BPO',
    leadTitle: 'Chief Revenue Officer',
    provider: 'resend_sandbox',
    read: true
  }
];

export function getStoredEmails(): EmailMessage[] {
  if (typeof window === 'undefined') return INITIAL_SEED_EMAILS;
  try {
    const raw = localStorage.getItem('sdr_unified_inbox_emails');
    if (!raw) {
      localStorage.setItem('sdr_unified_inbox_emails', JSON.stringify(INITIAL_SEED_EMAILS));
      return INITIAL_SEED_EMAILS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SEED_EMAILS;
  } catch (e) {
    console.warn('Could not read stored emails:', e);
    return INITIAL_SEED_EMAILS;
  }
}

export function saveEmailToStore(email: EmailMessage): EmailMessage[] {
  if (typeof window === 'undefined') return [email, ...INITIAL_SEED_EMAILS];
  try {
    const current = getStoredEmails();
    const updated = [email, ...current.filter(m => m.id !== email.id)];
    localStorage.setItem('sdr_unified_inbox_emails', JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Could not save email:', e);
    return [email, ...INITIAL_SEED_EMAILS];
  }
}
