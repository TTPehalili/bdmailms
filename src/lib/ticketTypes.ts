/**
 * Trouble Ticket Types, Categories & Enums
 * 
 * Shared across client components and server API routes.
 */

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'waiting_on_customer' | 'resolved' | 'closed';
export type TicketCategory = 
  | 'telephony_audio'
  | 'cold_email_resend'
  | 'linkedin_studio'
  | 'playbook_framework'
  | 'account_billing'
  | 'feature_request'
  | 'bug_general';

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderName: string;
  senderEmail: string;
  senderRole: 'customer' | 'admin' | 'system';
  isInternalNote: boolean;
  content: string;
  createdAt: string;
}

export interface TroubleTicket {
  id: string; // e.g. "TKT-2026-1042"
  tenantName: string;
  tenantCode?: string;
  requesterName: string;
  requesterEmail: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  affectedUrl?: string;
  systemInfo?: {
    browser?: string;
    os?: string;
    screenResolution?: string;
  };
  assignedTo?: string; // e.g. "Emil Halili"
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  messages: TicketMessage[];
}

export const TICKET_CATEGORIES: { value: TicketCategory; label: string; description: string }[] = [
  { value: 'telephony_audio', label: 'Telephony & Live Dialing Audio', description: 'WebRTC delays, audio packet drops, Twilio/SIP trunk issues' },
  { value: 'cold_email_resend', label: 'Cold Email & Resend Dispatch', description: 'DKIM/SPF alignment, mailbox warming, inbox delivery' },
  { value: 'linkedin_studio', label: 'LinkedIn Studio & Ingestion', description: 'Profile syncing, post generator, engagement queues' },
  { value: 'playbook_framework', label: 'Playbook Ingestion & Vector DB', description: 'Docx/PDF upload parsing, objection matrix embeddings' },
  { value: 'account_billing', label: 'Account, Seats & Billing', description: 'Seat allocation, subscription tiers, team permissions' },
  { value: 'feature_request', label: 'Feature Request / Enhancement', description: 'Workflow improvements, new integrations, custom suggestions' },
  { value: 'bug_general', label: 'General Bug / System Issue', description: 'UI rendering, navigation glitch, unhandled errors' },
];

export const INITIAL_SEED_TICKETS: TroubleTicket[] = [
  {
    id: 'TKT-2026-1049',
    tenantName: 'ShorePartners BPO',
    tenantCode: 'SHORE-PARTNERS',
    requesterName: 'Sarah Jenkins',
    requesterEmail: 'sjenkins@shorepartners.ph',
    subject: 'DKIM alignment verification showing "pending" on custom sending domain',
    description: 'We updated DNS records for our sub-domain outbound.shorepartners.ph in Cloudflare 4 hours ago, but the Resend status check in Cold Email Studio still displays pending. We have a 450-lead cadence scheduled for tomorrow morning and need to verify sending clearance.',
    category: 'cold_email_resend',
    priority: 'urgent',
    status: 'open',
    affectedUrl: '/email',
    systemInfo: {
      browser: 'Chrome 131.0 on Windows 11',
      os: 'Windows 11 Enterprise',
    },
    assignedTo: 'Emil Halili',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    messages: [
      {
        id: 'msg_tkt_1049_01',
        ticketId: 'TKT-2026-1049',
        senderName: 'Sarah Jenkins',
        senderEmail: 'sjenkins@shorepartners.ph',
        senderRole: 'customer',
        isInternalNote: false,
        content: 'We updated DNS records for our sub-domain outbound.shorepartners.ph in Cloudflare 4 hours ago, but the Resend status check in Cold Email Studio still displays pending. We have a 450-lead cadence scheduled for tomorrow morning and need to verify sending clearance.',
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      }
    ]
  },
  {
    id: 'TKT-2026-1042',
    tenantName: 'Apex Global BPO',
    tenantCode: 'APEX-GLOBAL',
    requesterName: 'Julian Vance',
    requesterEmail: 'julian@apexglobalbpo.com',
    subject: 'Audio latency spike on Singapore telephony trunk during peak 3PM dial blocks',
    description: 'During our afternoon shift between 2:30 PM and 3:30 PM AEST, three of our senior callers reported audio delays exceeding 450ms when dialing Australia toll-free numbers. Standard latency is under 150ms. Can your infrastructure team verify the SIP proxy routing?',
    category: 'telephony_audio',
    priority: 'high',
    status: 'in_progress',
    affectedUrl: '/cockpit',
    systemInfo: {
      browser: 'Chrome 130.0 on macOS Sonoma',
      os: 'macOS 14.5',
    },
    assignedTo: 'Emil Halili',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    messages: [
      {
        id: 'msg_tkt_1042_01',
        ticketId: 'TKT-2026-1042',
        senderName: 'Julian Vance',
        senderEmail: 'julian@apexglobalbpo.com',
        senderRole: 'customer',
        isInternalNote: false,
        content: 'During our afternoon shift between 2:30 PM and 3:30 PM AEST, three of our senior callers reported audio delays exceeding 450ms when dialing Australia toll-free numbers. Standard latency is under 150ms. Can your infrastructure team verify the SIP proxy routing?',
        createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      },
      {
        id: 'msg_tkt_1042_02',
        ticketId: 'TKT-2026-1042',
        senderName: 'Emil Halili',
        senderEmail: 'emil@appointmentlyy.com',
        senderRole: 'admin',
        isInternalNote: false,
        content: 'Hi Julian, thanks for flagging this immediately. We ran packet trace diagnostics on the SG-01 WebRTC gateway and identified a temporary BGP transit route flap with our regional carrier. We have re-routed primary trunking to Sydney Direct route. Could your callers test two outbound calls and confirm quality?',
        createdAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
      },
      {
        id: 'msg_tkt_1042_03',
        ticketId: 'TKT-2026-1042',
        senderName: 'Julian Vance',
        senderEmail: 'julian@apexglobalbpo.com',
        senderRole: 'customer',
        isInternalNote: false,
        content: 'Tested with caller Maria and line quality is back to crystal clear (120ms roundtrip). We will monitor for the rest of the shift.',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      }
    ]
  },
  {
    id: 'TKT-2026-1035',
    tenantName: 'CloudStaff Outsourcing',
    tenantCode: 'CLOUD-STAFF',
    requesterName: 'Marcus Brody',
    requesterEmail: 'mbrody@cloudstaffbpo.com',
    subject: 'Objection matrix upload failed with "unsupported docx style" on table headings',
    description: 'When importing our 24-page B2B Fintech objection playbook, the document parser skipped table 3.2 because of nested merged cells.',
    category: 'playbook_framework',
    priority: 'medium',
    status: 'resolved',
    affectedUrl: '/admin/frameworks',
    systemInfo: {
      browser: 'Edge 129.0 on Windows 11',
      os: 'Windows 11 Pro',
    },
    assignedTo: 'Emil Halili',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    messages: [
      {
        id: 'msg_tkt_1035_01',
        ticketId: 'TKT-2026-1035',
        senderName: 'Marcus Brody',
        senderEmail: 'mbrody@cloudstaffbpo.com',
        senderRole: 'customer',
        isInternalNote: false,
        content: 'When importing our 24-page B2B Fintech objection playbook, the document parser skipped table 3.2 because of nested merged cells.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
      {
        id: 'msg_tkt_1035_02',
        ticketId: 'TKT-2026-1035',
        senderName: 'Emil Halili',
        senderEmail: 'emil@appointmentlyy.com',
        senderRole: 'admin',
        isInternalNote: true,
        content: 'Hotfixed docx table parser regex to normalize colspan and rowspan cells without crashing. Re-ran pipeline on cloudstaff doc.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      },
      {
        id: 'msg_tkt_1035_03',
        ticketId: 'TKT-2026-1035',
        senderName: 'Emil Halili',
        senderEmail: 'emil@appointmentlyy.com',
        senderRole: 'admin',
        isInternalNote: false,
        content: 'Hi Marcus, we patched the Docx table parser to automatically flatten nested header structures. We also re-processed your document and loaded 38 vector rebuttals into your campaign. You are all set!',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      },
      {
        id: 'msg_tkt_1035_04',
        ticketId: 'TKT-2026-1035',
        senderName: 'Marcus Brody',
        senderEmail: 'mbrody@cloudstaffbpo.com',
        senderRole: 'customer',
        isInternalNote: false,
        content: 'Verified in Sparring Arena, rebuttals are loading smoothly now. Thank you Emil!',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 17).toISOString(),
      }
    ]
  }
];

export function generateTicketId(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `TKT-${year}-${randomSuffix}`;
}
