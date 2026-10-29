/**
 * Global Contacts & Lead Footprint Store
 * 
 * Provides centralized storage, note-taking, and historical communication
 * tracking (footprints) for leads across Calling Floor, Email Studio, and Admin.
 * Handles role-based CSV export and multi-touch audit logs for non-CRM clients.
 */

export interface LeadFootprintItem {
  id: string;
  timestamp: string; // e.g. "Oct 29, 2026 • 10:42 AM"
  isoDate: string;
  type: 'call' | 'email' | 'linkedin' | 'note' | 'status';
  title: string;     // e.g. "Call Note #1", "Email #1 Sent", "Meeting Booked", "Manual Lead Note"
  summary: string;   // detailed text, qualification audit, or pitch note
  repName: string;
  disposition?: string;
}

export interface ContactRecord {
  id: string;
  name: string;
  company: string;
  title: string;
  department: string;
  email: string;
  phone: string;
  headcount: string;
  website: string;
  linkedinUrl: string;
  assignedRep: string;
  tenantId: string;
  status: string; // 'New Lead' | 'In Cadence' | 'Meeting Booked' | 'Call Back Later' | 'Left Voicemail' | 'Disqualified'
  cadenceDay: number;
  touchNumber: number;
  leadNotes: string; // Direct notes on the lead for non-CRM users
  footprint: LeadFootprintItem[];
}

const CONTACTS_STORAGE_KEY = 'appointmentlyy_sdr_global_contacts_v1';
const CONTACTS_BROADCAST = 'appointmentlyy_contacts_sync';

// Default starter contacts with pre-populated historical footprints
export const INITIAL_DEFAULT_CONTACTS: ContactRecord[] = [
  {
    id: 'lead_fresh_d2',
    name: 'Julian Vance',
    company: 'Apex Global BPO',
    title: 'Director of Outbound Operations',
    department: 'Outbound Appointment Setting Floor',
    email: 'julian@apexglobalbpo.com',
    phone: '+1 (415) 890-2341',
    headcount: '65 seats',
    website: 'https://apexglobalbpo.ph',
    linkedinUrl: 'https://www.linkedin.com/in/julian-vance-bpo',
    assignedRep: 'Emil Halili',
    tenantId: 'APEX',
    status: 'In Cadence',
    cadenceDay: 2,
    touchNumber: 3,
    leadNotes: 'Director is scaling outbound Manila floor by 15 seats. Bottleneck is junior reps getting chopped on price by commodity competitors. Requested demo on Thursday.',
    footprint: [
      {
        id: 'fp_1',
        timestamp: 'Oct 28, 2026 • 09:15 AM',
        isoDate: '2026-10-28T01:15:00.000Z',
        type: 'email',
        title: 'Email #1 Dispatched',
        summary: 'Subject: "quick question on Apex Global BPO ramp time". Highlighted rookie lead tax and eliminating classroom hesitation.',
        repName: 'Emil Halili'
      },
      {
        id: 'fp_2',
        timestamp: 'Oct 28, 2026 • 02:40 PM',
        isoDate: '2026-10-28T06:40:00.000Z',
        type: 'linkedin',
        title: 'LinkedIn #1 Connection',
        summary: 'Sent zero-pitch peer connection note referencing outbound seat economics in Manila & Cebu.',
        repName: 'Emil Halili'
      },
      {
        id: 'fp_3',
        timestamp: 'Oct 29, 2026 • 10:15 AM',
        isoDate: '2026-10-29T02:15:00.000Z',
        type: 'call',
        title: 'Call Notes #1',
        summary: 'Role verified. Prospect confirmed competing against 3-5 BPOs on Outsource Accelerator shared lists ($8/hr margin crush). Pitched 150ms objection cues.',
        repName: 'Emil Halili',
        disposition: 'Meeting Booked'
      }
    ]
  },
  {
    id: 'lead_carryover_d9',
    name: 'Marcus Brody',
    company: 'Nexus Call Solutions',
    title: 'VP of Contact Center Ops',
    department: 'Enterprise Lead Gen',
    email: 'mbrody@nexuscall.com',
    phone: '+1 (312) 555-0198',
    headcount: '120 seats',
    website: 'https://nexuscallsolutions.com',
    linkedinUrl: 'https://www.linkedin.com/in/marcus-brody-cx',
    assignedRep: 'Emil Halili',
    tenantId: 'APEX',
    status: 'Call Back Later',
    cadenceDay: 9,
    touchNumber: 8,
    leadNotes: 'Migrating legacy VICIdial to Twilio SIP. Needs live coaching to shorten onboarding from 6 weeks to 10 days.',
    footprint: [
      {
        id: 'fp_4',
        timestamp: 'Oct 24, 2026 • 11:30 AM',
        isoDate: '2026-10-24T03:30:00.000Z',
        type: 'email',
        title: 'Email #1 Dispatched',
        summary: 'Subject: "rookie lead burn on shared campaigns".',
        repName: 'Emil Halili'
      },
      {
        id: 'fp_5',
        timestamp: 'Oct 26, 2026 • 03:00 PM',
        isoDate: '2026-10-26T07:00:00.000Z',
        type: 'email',
        title: 'Email #2 Dispatched',
        summary: 'Subject: "72-hour floor ramp / tried you just now". Referenced 150ms objection sparring.',
        repName: 'Emil Halili'
      },
      {
        id: 'fp_6',
        timestamp: 'Oct 28, 2026 • 04:15 PM',
        isoDate: '2026-10-28T08:15:00.000Z',
        type: 'call',
        title: 'Call Notes #1',
        summary: 'Gatekeeper connect. Marcus was in operational review. Requested callback Friday at 10:00 AM.',
        repName: 'Emil Halili',
        disposition: 'Call Back Later'
      }
    ]
  },
  {
    id: 'lead_carryover_d15',
    name: 'Elena Rostova',
    company: 'ClearDial Telephony',
    title: 'Chief Revenue Officer',
    department: 'Sales & Client Retention',
    email: 'elena@cleardial.io',
    phone: '+1 (646) 772-9102',
    headcount: '45 seats',
    website: 'https://cleardial.io',
    linkedinUrl: 'https://www.linkedin.com/in/elena-rostova-sales',
    assignedRep: 'Emil Halili',
    tenantId: 'APEX',
    status: 'In Cadence',
    cadenceDay: 15,
    touchNumber: 10,
    leadNotes: 'Actively evaluating AI voice sparring. Budget allocated for Q4 tool enablement.',
    footprint: [
      {
        id: 'fp_7',
        timestamp: 'Oct 20, 2026 • 08:45 AM',
        isoDate: '2026-10-20T00:45:00.000Z',
        type: 'email',
        title: 'Email #1 Dispatched',
        summary: 'Subject: "quick question on ClearDial Telephony ramp time".',
        repName: 'Emil Halili'
      },
      {
        id: 'fp_8',
        timestamp: 'Oct 25, 2026 • 01:20 PM',
        isoDate: '2026-10-25T05:20:00.000Z',
        type: 'call',
        title: 'Call Notes #1',
        summary: 'Left Voicemail Drop #1 (15s problem-solving script).',
        repName: 'Emil Halili',
        disposition: 'Left Voicemail'
      }
    ]
  },
  {
    id: 'lead_new_d1',
    name: 'Carlos Mendoza',
    company: 'Solaria Energy Sales',
    title: 'Managing Director',
    department: 'Solar Appointment Setting',
    email: 'carlos@solariaenergy.com',
    phone: '+1 (602) 441-9981',
    headcount: '80 seats',
    website: 'https://solariaenergy.com',
    linkedinUrl: 'https://www.linkedin.com/in/carlos-mendoza-solar',
    assignedRep: 'Emil Halili',
    tenantId: 'APEX',
    status: 'New Lead',
    cadenceDay: 1,
    touchNumber: 1,
    leadNotes: 'Directory intake from Outsource Accelerator. BPO handles residential solar cold calling.',
    footprint: [
      {
        id: 'fp_9',
        timestamp: 'Oct 29, 2026 • 08:30 AM',
        isoDate: '2026-10-29T00:30:00.000Z',
        type: 'status',
        title: 'Lead Enrolled in Cadence',
        summary: 'Enrolled into 19-Day Outbound BPO Socratic Cadence.',
        repName: 'System'
      }
    ]
  }
];

/**
 * Get all stored contacts (with automatic fallback to initial demo contacts)
 */
export function getStoredContacts(): ContactRecord[] {
  if (typeof window === 'undefined') {
    return INITIAL_DEFAULT_CONTACTS;
  }

  try {
    const raw = localStorage.getItem(CONTACTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(INITIAL_DEFAULT_CONTACTS));
      return INITIAL_DEFAULT_CONTACTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_DEFAULT_CONTACTS;
  } catch (err) {
    console.warn('[LeadStore] Failed to read contacts:', err);
    return INITIAL_DEFAULT_CONTACTS;
  }
}

/**
 * Persist contacts and broadcast change event
 */
export function saveStoredContacts(contacts: ContactRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
    // Also sync with active CSV leads for Calling Floor compatibility
    localStorage.setItem('sdr_active_csv_leads', JSON.stringify(contacts));

    if (typeof BroadcastChannel !== 'undefined') {
      const ch = new BroadcastChannel(CONTACTS_BROADCAST);
      ch.postMessage({ type: 'CONTACTS_UPDATED', contacts });
      ch.close();
    }
  } catch (err) {
    console.warn('[LeadStore] Failed to save contacts:', err);
  }
}

/**
 * Add a direct note to a lead (essential for clients without CRM)
 */
export function addContactNote(
  contactId: string, 
  noteText: string, 
  repName: string = 'Emil Halili'
): ContactRecord | null {
  if (!contactId || !noteText.trim()) return null;

  const contacts = getStoredContacts();
  const index = contacts.findIndex(c => c.id === contactId || c.email.toLowerCase() === contactId.toLowerCase());
  if (index === -1) return null;

  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const timestampStr = `${formattedDate} • ${formattedTime}`;

  const newFootprint: LeadFootprintItem = {
    id: `fp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: timestampStr,
    isoDate: now.toISOString(),
    type: 'note',
    title: 'Manual Lead Note Added',
    summary: noteText.trim(),
    repName
  };

  const updatedContact: ContactRecord = {
    ...contacts[index],
    leadNotes: contacts[index].leadNotes 
      ? `${noteText.trim()}\n\n---\n${contacts[index].leadNotes}`
      : noteText.trim(),
    footprint: [newFootprint, ...(contacts[index].footprint || [])]
  };

  contacts[index] = updatedContact;
  saveStoredContacts(contacts);
  return updatedContact;
}

/**
 * Record a communication touch (call, email, linkedin, disposition) into lead footprint
 */
export function recordContactTouch(
  contactIdOrEmail: string,
  touch: {
    type: 'call' | 'email' | 'linkedin' | 'note' | 'status';
    title: string;
    summary: string;
    repName?: string;
    disposition?: string;
  }
): ContactRecord | null {
  if (!contactIdOrEmail) return null;

  const contacts = getStoredContacts();
  const index = contacts.findIndex(
    c => c.id === contactIdOrEmail || c.email.toLowerCase() === contactIdOrEmail.toLowerCase()
  );
  if (index === -1) return null;

  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const timestampStr = `${formattedDate} • ${formattedTime}`;

  const newFootprint: LeadFootprintItem = {
    id: `fp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: timestampStr,
    isoDate: now.toISOString(),
    type: touch.type,
    title: touch.title,
    summary: touch.summary,
    repName: touch.repName || 'Emil Halili',
    disposition: touch.disposition
  };

  const nextStatus = touch.disposition || contacts[index].status;

  const updatedContact: ContactRecord = {
    ...contacts[index],
    status: nextStatus,
    footprint: [newFootprint, ...(contacts[index].footprint || [])]
  };

  contacts[index] = updatedContact;
  saveStoredContacts(contacts);
  return updatedContact;
}

/**
 * Export contacts to a standard RFC 4180 CSV file (Restricted to Admins)
 */
export function exportContactsToCsv(contacts: ContactRecord[]): void {
  if (typeof window === 'undefined' || !contacts || contacts.length === 0) return;

  const headers = [
    'Lead ID',
    'Contact Name',
    'Company',
    'Title',
    'Department',
    'Email',
    'Phone',
    'Headcount',
    'Website',
    'LinkedIn URL',
    'Assigned Rep',
    'Status',
    'Cadence Day',
    'Direct Lead Notes',
    'Total Touches',
    'Latest Touch Date',
    'Latest Footprint Summary'
  ];

  const escapeCsv = (str: any) => {
    if (str === null || str === undefined) return '""';
    const clean = String(str).replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = contacts.map(c => {
    const latestTouch = c.footprint && c.footprint.length > 0 ? c.footprint[0] : null;
    return [
      escapeCsv(c.id),
      escapeCsv(c.name),
      escapeCsv(c.company),
      escapeCsv(c.title),
      escapeCsv(c.department),
      escapeCsv(c.email),
      escapeCsv(c.phone),
      escapeCsv(c.headcount),
      escapeCsv(c.website),
      escapeCsv(c.linkedinUrl),
      escapeCsv(c.assignedRep),
      escapeCsv(c.status),
      escapeCsv(c.cadenceDay),
      escapeCsv(c.leadNotes),
      escapeCsv(c.footprint ? c.footprint.length : 0),
      escapeCsv(latestTouch ? latestTouch.timestamp : 'None'),
      escapeCsv(latestTouch ? `${latestTouch.title}: ${latestTouch.summary}` : 'None')
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const nowStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `appointmentlyy_contacts_export_${nowStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Subscribe to real-time contacts updates
 */
export function subscribeToContacts(callback: (contacts: ContactRecord[]) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleStorage = (e: StorageEvent) => {
    if (e.key === CONTACTS_STORAGE_KEY) {
      callback(getStoredContacts());
    }
  };

  window.addEventListener('storage', handleStorage);

  let channel: BroadcastChannel | null = null;
  if (typeof BroadcastChannel !== 'undefined') {
    channel = new BroadcastChannel(CONTACTS_BROADCAST);
    channel.onmessage = (event) => {
      if (event.data?.type === 'CONTACTS_UPDATED') {
        callback(event.data.contacts || getStoredContacts());
      }
    };
  }

  return () => {
    window.removeEventListener('storage', handleStorage);
    if (channel) channel.close();
  };
}
