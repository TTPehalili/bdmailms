import { Node, Edge } from '@xyflow/react';

export type OutboundCategory =
  | '21-Day Outbound Cadence'
  | 'After-Call Dispositions'
  | 'Speed-to-Lead & Signals'
  | 'AI Research & Personalization';

export interface WorkflowTemplate {
  id: string;
  name: string;
  disposition?: string;
  category: OutboundCategory;
  cadenceDay?: string;
  description: string;
  badge: string;
  channels: ('sms' | 'email' | 'linkedin' | 'slack' | 'crm' | 'ai' | 'phone')[];
  estimatedSavings: string;
  nodeCount: number;
  cadenceTouches?: string[];
  nodes: Node[];
  edges: Edge[];
}

export const PRELOADED_WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  // =========================================================================
  // SECTION 1: THE 21-DAY MULTI-CHANNEL OUTBOUND CADENCE SUITE
  // =========================================================================
  {
    id: 'tpl-cadence-21day-master',
    name: 'The Blueprint: 21-Day Multi-Channel Outbound Cadence (Master Engine)',
    category: '21-Day Outbound Cadence',
    cadenceDay: 'Day 1–27 Master',
    badge: 'Flagship Blueprint',
    channels: ['email', 'linkedin', 'phone', 'sms', 'crm'],
    estimatedSavings: '4.5 hrs / rep weekly',
    nodeCount: 11,
    cadenceTouches: [
      'Day 1: Email #1 (<75w pain point) + LinkedIn #1 (Connection request)',
      'Day 2: Phone #1 (Push to Boris Calling Queue)',
      'Day 3: Phone #2 (Voicemail) + Email #2 (Same-day synergy recap)',
      'Day 5: LinkedIn #2 (Social engagement & resource touch)',
      'Day 7: Email #3 (Value add: Case study & Loom video link)',
      'Day 9: Phone #3 (Shifted time block call: morning/evening)',
      'Day 12: Email #4 (Pivot angle: "Not sure if on radar...")',
      'Day 15: Phone #4 (Quick dial-in touch)',
      'Day 19: Email #5 (Tactical cheat sheet & referral ask)',
      'Day 24: Phone #5 (Final persistence call)',
      'Day 27: Email #6 (Graceful "Close the Loop" break-up)'
    ],
    description:
      'The complete 21-Day Multi-Channel Outbound Cadence. Front-loads 5 touches in the first 7 days, links cold calls with same-day recap emails (+15% open rates), spaces out second-half touches, and ends with a graceful file-closer.',
    nodes: [
      {
        id: 'c-trig',
        type: 'customNode',
        position: { x: 50, y: 220 },
        data: {
          nodeType: 'manualTrigger',
          label: 'Enroll Account in 21-Day Cadence',
          category: 'Triggers',
          icon: 'PlayCircle',
          isTriggerPill: true
        }
      },
      {
        id: 'c-d1-email',
        type: 'customNode',
        position: { x: 320, y: 100 },
        data: {
          nodeType: 'resendNode',
          label: 'Day 1: Email #1 (<75w Hook)',
          subtitle: 'Specific pain point',
          category: 'App Integrations',
          icon: 'MailCheck',
          config: {
            to: '{{ $json.email }}',
            subject: 'Quick question regarding {{ $json.company }}\'s SDR conversion',
            htmlBody: '<p>Hi {{ $json.leadName }}, noticed {{ $json.company }} is scaling business development. Teams in your space often hit drop-offs handling objection stalls. We built Boris AI to intercept those live on the phone. Open to a 2-min breakdown?</p>'
          }
        }
      },
      {
        id: 'c-d1-li',
        type: 'customNode',
        position: { x: 320, y: 280 },
        data: {
          nodeType: 'linkedInNode',
          label: 'Day 1: LinkedIn Connection #1',
          subtitle: 'Zero-pitch connection',
          category: 'App Integrations',
          icon: 'LinkedIn',
          config: {
            operation: 'sendConnectionInvite',
            profileUrl: '{{ $json.linkedInUrl }}',
            message: 'Hi {{ $json.leadName }} - came across your leadership at {{ $json.company }}. Would love to connect!'
          }
        }
      },
      {
        id: 'c-wait-d2',
        type: 'customNode',
        position: { x: 600, y: 190 },
        data: {
          nodeType: 'delayNode',
          label: 'Wait 24 Hours (Day 2)',
          category: 'Logic & Flow',
          icon: 'Hourglass',
          config: { unit: 'hours', amount: 24 }
        }
      },
      {
        id: 'c-d2-phone',
        type: 'customNode',
        position: { x: 840, y: 190 },
        data: {
          nodeType: 'googleSheetsNode',
          label: 'Day 2: Phone Push #1 (Queue Boris Dial)',
          subtitle: 'Cold Call #1',
          category: 'App Integrations',
          icon: 'PhoneCall',
          config: { sheetName: 'Boris Cockpit Day 2' }
        }
      },
      {
        id: 'c-wait-d3',
        type: 'customNode',
        position: { x: 1100, y: 190 },
        data: {
          nodeType: 'delayNode',
          label: 'Wait 24 Hours (Day 3)',
          category: 'Logic & Flow',
          icon: 'Hourglass',
          config: { unit: 'hours', amount: 24 }
        }
      },
      {
        id: 'c-d3-synergy',
        type: 'customNode',
        position: { x: 1340, y: 100 },
        data: {
          nodeType: 'resendNode',
          label: 'Day 3: Email #2 (Voicemail Synergy)',
          subtitle: 'Pair call + email',
          category: 'App Integrations',
          icon: 'MailCheck',
          config: {
            to: '{{ $json.email }}',
            subject: 'Tried you just now / {{ $json.company }}',
            htmlBody: '<p>Hi {{ $json.leadName }}, just dropped you a quick voicemail regarding your reps\' objection handling. Dropping this note in case email is easier. Best, Emil</p>'
          }
        }
      },
      {
        id: 'c-d7-value',
        type: 'customNode',
        position: { x: 1340, y: 280 },
        data: {
          nodeType: 'resendNode',
          label: 'Day 7: Email #3 (Value Add & Loom)',
          subtitle: 'Case study & benchmark',
          category: 'App Integrations',
          icon: 'MailCheck',
          config: {
            to: '{{ $json.email }}',
            subject: 'Case Study: How 12 SDRs doubled booked demos with Boris AI',
            htmlBody: '<p>Hi {{ $json.leadName }}, thought this 90-second benchmark study would be relevant for {{ $json.company }}. <a href="https://loom.com/demo">Watch 90s Loom</a></p>'
          }
        }
      },
      {
        id: 'c-d12-pivot',
        type: 'customNode',
        position: { x: 1620, y: 190 },
        data: {
          nodeType: 'resendNode',
          label: 'Day 12: Email #4 (Pivot Angle)',
          subtitle: 'Fresh low-friction ask',
          category: 'App Integrations',
          icon: 'MailCheck',
          config: {
            to: '{{ $json.email }}',
            subject: 'Not sure if this is on your radar right now',
            htmlBody: '<p>Hi {{ $json.leadName }}, understand priorities shift constantly. Are you satisfied with current discovery hold rates, or worth comparing notes next quarter?</p>'
          }
        }
      },
      {
        id: 'c-d27-breakup',
        type: 'customNode',
        position: { x: 1900, y: 190 },
        data: {
          nodeType: 'resendNode',
          label: 'Day 27: Email #6 (Close the Loop)',
          subtitle: 'Graceful break-up file closer',
          category: 'App Integrations',
          icon: 'MailCheck',
          config: {
            to: '{{ $json.email }}',
            subject: 'Closing the loop on {{ $json.company }}',
            htmlBody: '<p>Hi {{ $json.leadName }}, haven\'t heard back so I assume cold outreach optimization isn\'t a priority today. I will archive this file for now. Feel free to reach out anytime down the line!</p>'
          }
        }
      },
      {
        id: 'c-crm-archive',
        type: 'customNode',
        position: { x: 2180, y: 190 },
        data: {
          nodeType: 'supabaseNode',
          label: 'Update CRM: 21-Day Cadence Completed',
          category: 'App Integrations',
          icon: 'Server',
          config: { operation: 'update', table: 'leads' }
        }
      }
    ],
    edges: [
      { id: 'ce-1', source: 'c-trig', target: 'c-d1-email', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'ce-2', source: 'c-trig', target: 'c-d1-li', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'ce-3', source: 'c-d1-email', target: 'c-wait-d2', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'ce-4', source: 'c-d1-li', target: 'c-wait-d2', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'ce-5', source: 'c-wait-d2', target: 'c-d2-phone', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'ce-6', source: 'c-d2-phone', target: 'c-wait-d3', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'ce-7', source: 'c-wait-d3', target: 'c-d3-synergy', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'ce-8', source: 'c-d3-synergy', target: 'c-d7-value', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'ce-9', source: 'c-d7-value', target: 'c-d12-pivot', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'ce-10', source: 'c-d12-pivot', target: 'c-d27-breakup', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'ce-11', source: 'c-d27-breakup', target: 'c-crm-archive', animated: false, style: { stroke: '#475569', strokeWidth: 2 } }
    ]
  },
  {
    id: 'tpl-cadence-day1-hook-linkedin',
    name: 'Day 1: Initial Hook (<75w Email) & LinkedIn Social Awareness',
    category: '21-Day Outbound Cadence',
    cadenceDay: 'Day 1',
    badge: 'Front-Load Week 1',
    channels: ['email', 'linkedin', 'ai'],
    estimatedSavings: '12 min per account',
    nodeCount: 4,
    description:
      'Day 1 kick-off. Generates a personalized sub-75-word pain-point cold email via AI, verifies email deliverability, sends via Resend, and triggers a zero-pitch LinkedIn connection request.',
    nodes: [
      {
        id: 'd1-trig',
        type: 'customNode',
        position: { x: 80, y: 160 },
        data: {
          nodeType: 'manualTrigger',
          label: 'Start Day 1 Outreach',
          category: 'Triggers',
          icon: 'PlayCircle',
          isTriggerPill: true
        }
      },
      {
        id: 'd1-ai',
        type: 'customNode',
        position: { x: 380, y: 160 },
        data: {
          nodeType: 'aiAgentNode',
          label: 'AI Agent: Personalize <75w Hook',
          category: 'AI & LLMs',
          icon: 'Bot',
          config: {
            agentGoal: 'Draft high-impact 65-word cold email focusing on specific pain point'
          }
        }
      },
      {
        id: 'd1-email',
        type: 'customNode',
        position: { x: 720, y: 80 },
        data: {
          nodeType: 'resendNode',
          label: 'Email #1: Cold Pain-Point Hook',
          category: 'App Integrations',
          icon: 'MailCheck',
          config: { to: '{{ $json.email }}', subject: 'Question regarding {{ $json.company }}\'s outbound pipeline' }
        }
      },
      {
        id: 'd1-li',
        type: 'customNode',
        position: { x: 720, y: 240 },
        data: {
          nodeType: 'linkedInNode',
          label: 'LinkedIn #1: View Profile & Zero-Pitch Invite',
          category: 'App Integrations',
          icon: 'LinkedIn',
          config: { operation: 'sendConnectionInvite' }
        }
      }
    ],
    edges: [
      { id: 'd1e-1', source: 'd1-trig', target: 'd1-ai', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'd1e-2', source: 'd1-ai', target: 'd1-email', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'd1e-3', source: 'd1-ai', target: 'd1-li', animated: false, style: { stroke: '#475569', strokeWidth: 2 } }
    ]
  },
  {
    id: 'tpl-cadence-day3-vm-email-synergy',
    name: 'Day 3: Voicemail Drop + Same-Day Email Synergy (+15% Opens)',
    category: '21-Day Outbound Cadence',
    cadenceDay: 'Day 3',
    badge: 'Synergy Duo',
    channels: ['phone', 'email', 'sms'],
    estimatedSavings: '+15% Email Open Rate',
    nodeCount: 4,
    description:
      'Follows the core outbound rule: pairs phone cold call / voicemail with an immediate same-day recap email referencing the call. Proven to lift open rates by 10%–15%.',
    nodes: [
      {
        id: 'd3-trig',
        type: 'customNode',
        position: { x: 80, y: 160 },
        data: {
          nodeType: 'borisDispositionTrigger',
          label: 'Boris Cold Call #2 Finished',
          category: 'Triggers',
          icon: 'PhoneCall',
          isTriggerPill: true,
          config: { dispositionFilter: 'No answer' }
        }
      },
      {
        id: 'd3-wait',
        type: 'customNode',
        position: { x: 380, y: 160 },
        data: {
          nodeType: 'delayNode',
          label: 'Wait 2 Minutes (Voicemail Sync)',
          category: 'Logic & Flow',
          icon: 'Hourglass',
          config: { unit: 'minutes', amount: 2 }
        }
      },
      {
        id: 'd3-email',
        type: 'customNode',
        position: { x: 680, y: 90 },
        data: {
          nodeType: 'resendNode',
          label: 'Email #2: Same-Day Voicemail Follow-up',
          category: 'App Integrations',
          icon: 'MailCheck',
          config: {
            to: '{{ $json.email }}',
            subject: 'Tried you just now regarding {{ $json.company }}',
            htmlBody: '<p>Hi {{ $json.leadName }}, just tried ringing you. Left a brief 15s note on your voicemail regarding how Boris AI automates objection handling. Dropping this note here in case email is simpler.</p>'
          }
        }
      },
      {
        id: 'd3-sms',
        type: 'customNode',
        position: { x: 680, y: 240 },
        data: {
          nodeType: 'twilioSmsNode',
          label: 'SMS: Subtle Voicemail Alert',
          category: 'App Integrations',
          icon: 'Smartphone',
          config: {
            to: '{{ $json.phone }}',
            message: 'Hey {{ $json.leadName }}, dropped you a quick VM just now. Sent brief summary to your email.'
          }
        }
      }
    ],
    edges: [
      { id: 'd3e-1', source: 'd3-trig', target: 'd3-wait', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'd3e-2', source: 'd3-wait', target: 'd3-email', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'd3e-3', source: 'd3-wait', target: 'd3-sms', animated: false, style: { stroke: '#475569', strokeWidth: 2 } }
    ]
  },
  {
    id: 'tpl-cadence-day7-value-add-loom',
    name: 'Day 7: Value Add & Case Study Drop with Loom Video',
    category: '21-Day Outbound Cadence',
    cadenceDay: 'Day 7',
    badge: 'Social Proof',
    channels: ['email', 'linkedin'],
    estimatedSavings: '20 min research time',
    nodeCount: 3,
    description:
      'Sends a high-converting case study, tailored industry benchmark, and 90-second Loom demonstration link to warm prospects before Week 2 calls.',
    nodes: [
      {
        id: 'd7-trig',
        type: 'customNode',
        position: { x: 80, y: 160 },
        data: {
          nodeType: 'scheduleTrigger',
          label: 'Day 7 Scheduled Trigger',
          category: 'Triggers',
          icon: 'Clock',
          isTriggerPill: true
        }
      },
      {
        id: 'd7-email',
        type: 'customNode',
        position: { x: 400, y: 100 },
        data: {
          nodeType: 'resendNode',
          label: 'Email #3: Case Study & Loom Link',
          category: 'App Integrations',
          icon: 'MailCheck',
          config: {
            to: '{{ $json.email }}',
            subject: 'Case Study: 3.8x meeting conversion on cold dials',
            htmlBody: '<p>Hi {{ $json.leadName }}, thought you\'d find this relevant: here is how an outbound team in logistics replaced 4 outsourced dialers with Boris AI.</p>'
          }
        }
      },
      {
        id: 'd7-li',
        type: 'customNode',
        position: { x: 400, y: 240 },
        data: {
          nodeType: 'linkedInNode',
          label: 'LinkedIn #2: Share Tactical Insight',
          category: 'App Integrations',
          icon: 'LinkedIn',
          config: { operation: 'sendDirectMessage' }
        }
      }
    ],
    edges: [
      { id: 'd7e-1', source: 'd7-trig', target: 'd7-email', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'd7e-2', source: 'd7-trig', target: 'd7-li', animated: false, style: { stroke: '#475569', strokeWidth: 2 } }
    ]
  },
  {
    id: 'tpl-cadence-day12-pivot-angle',
    name: 'Day 12: The Pivot Angle & Fresh Perspective Touch',
    category: '21-Day Outbound Cadence',
    cadenceDay: 'Day 12',
    badge: 'Cognitive Reset',
    channels: ['email', 'crm'],
    estimatedSavings: 'Revives 12% dormant leads',
    nodeCount: 3,
    description:
      'When earlier hook emails received no response, pivots to a fresh low-friction angle: "Not sure if this is on your radar right now, but..."',
    nodes: [
      {
        id: 'd12-trig',
        type: 'customNode',
        position: { x: 80, y: 160 },
        data: {
          nodeType: 'scheduleTrigger',
          label: 'Day 12 Trigger',
          category: 'Triggers',
          icon: 'Clock',
          isTriggerPill: true
        }
      },
      {
        id: 'd12-email',
        type: 'customNode',
        position: { x: 400, y: 160 },
        data: {
          nodeType: 'resendNode',
          label: 'Email #4: Low-Friction Pivot',
          category: 'App Integrations',
          icon: 'MailCheck',
          config: {
            to: '{{ $json.email }}',
            subject: 'Not sure if this is on your radar right now',
            htmlBody: '<p>Hi {{ $json.leadName }}, assuming your calendar is packed right now. If rep cold calling objection training isn\'t a priority for Q3, should we connect in November instead?</p>'
          }
        }
      },
      {
        id: 'd12-crm',
        type: 'customNode',
        position: { x: 720, y: 160 },
        data: {
          nodeType: 'supabaseNode',
          label: 'Log Day 12 Pivot in CRM',
          category: 'App Integrations',
          icon: 'Server',
          config: { operation: 'update', table: 'leads' }
        }
      }
    ],
    edges: [
      { id: 'd12e-1', source: 'd12-trig', target: 'd12-email', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'd12e-2', source: 'd12-email', target: 'd12-crm', animated: false, style: { stroke: '#475569', strokeWidth: 2 } }
    ]
  },
  {
    id: 'tpl-cadence-day19-referral-hunter',
    name: 'Day 19: Content Touch & Internal Stakeholder Referral Ask',
    category: '21-Day Outbound Cadence',
    cadenceDay: 'Day 19',
    badge: 'Referral Finder',
    channels: ['email', 'linkedin'],
    estimatedSavings: 'Finds right DM in 14% accounts',
    nodeCount: 3,
    description:
      'Shares a tactical playbook and politely asks if a different leader on their sales/revenue team is the right person to speak with.',
    nodes: [
      {
        id: 'd19-trig',
        type: 'customNode',
        position: { x: 80, y: 160 },
        data: {
          nodeType: 'scheduleTrigger',
          label: 'Day 19 Trigger',
          category: 'Triggers',
          icon: 'Clock',
          isTriggerPill: true
        }
      },
      {
        id: 'd19-email',
        type: 'customNode',
        position: { x: 400, y: 160 },
        data: {
          nodeType: 'resendNode',
          label: 'Email #5: Playbook + "Right Person?" Ask',
          category: 'App Integrations',
          icon: 'MailCheck',
          config: {
            to: '{{ $json.email }}',
            subject: 'Right person on {{ $json.company }}\'s team for SDR pipeline?',
            htmlBody: '<p>Hi {{ $json.leadName }}, here is our 1-page B2B Cold Calling Playbook. If someone else on your revenue team handles this area, who would be best to forward this to?</p>'
          }
        }
      },
      {
        id: 'd19-crm',
        type: 'customNode',
        position: { x: 720, y: 160 },
        data: {
          nodeType: 'supabaseNode',
          label: 'Tag Referral Ingest Status in CRM',
          category: 'App Integrations',
          icon: 'Server',
          config: { operation: 'update', table: 'leads' }
        }
      }
    ],
    edges: [
      { id: 'd19e-1', source: 'd19-trig', target: 'd19-email', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'd19e-2', source: 'd19-email', target: 'd19-crm', animated: false, style: { stroke: '#475569', strokeWidth: 2 } }
    ]
  },
  {
    id: 'tpl-cadence-day27-close-the-loop',
    name: 'Day 27: The "Close the Loop" Graceful Break-Up Email',
    category: '21-Day Outbound Cadence',
    cadenceDay: 'Day 27',
    badge: 'Graceful File Closer',
    channels: ['email', 'crm'],
    estimatedSavings: '20% response bump on break-up',
    nodeCount: 3,
    description:
      'The classic reverse-psychology file closer. Politely releases the prospect from follow-up, which historically triggers the highest delayed response rate in the cadence.',
    nodes: [
      {
        id: 'd27-trig',
        type: 'customNode',
        position: { x: 80, y: 160 },
        data: {
          nodeType: 'scheduleTrigger',
          label: 'Day 27 Trigger',
          category: 'Triggers',
          icon: 'Clock',
          isTriggerPill: true
        }
      },
      {
        id: 'd27-email',
        type: 'customNode',
        position: { x: 400, y: 160 },
        data: {
          nodeType: 'resendNode',
          label: 'Email #6: Graceful Break-Up Touch',
          category: 'App Integrations',
          icon: 'MailCheck',
          config: {
            to: '{{ $json.email }}',
            subject: 'Closing the loop on {{ $json.company }}',
            htmlBody: '<p>Hi {{ $json.leadName }},</p><p>Haven\'t heard back so I will assume improving SDR cold call hold rates isn\'t on your roadmap for now. I\'ll close your file so I don\'t bother you further.</p><p>If things change down the road, feel free to reach out anytime!</p><p>Best,<br>Emil Pehalili<br>Founder, Appointmentlyy</p>'
          }
        }
      },
      {
        id: 'd27-crm',
        type: 'customNode',
        position: { x: 720, y: 160 },
        data: {
          nodeType: 'supabaseNode',
          label: 'Archive Cadence & Stage as Nurture',
          category: 'App Integrations',
          icon: 'Server',
          config: { operation: 'update', table: 'leads' }
        }
      }
    ],
    edges: [
      { id: 'd27e-1', source: 'd27-trig', target: 'd27-email', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'd27e-2', source: 'd27-email', target: 'd27-crm', animated: false, style: { stroke: '#475569', strokeWidth: 2 } }
    ]
  },

  // =========================================================================
  // SECTION 2: AFTER-CALL DISPOSITIONS (BORIS CALLING COCKPIT)
  // =========================================================================
  {
    id: 'tpl-meeting-booked-vip',
    name: 'VIP Meeting Booked: Multi-Channel Cadence (SMS + Email + LinkedIn)',
    disposition: 'Meeting Booked',
    category: 'After-Call Dispositions',
    cadenceDay: 'Immediate Call Disposition',
    description:
      'Triggered immediately when Boris logs "Meeting Booked". Dispatches an instant SMS confirmation, delivers a personalized calendar invite with qualification briefing PDF via email, queues a LinkedIn connection request from Emil, and posts a celebratory alert to Slack #deal-closing.',
    badge: 'High Conversion VIP',
    channels: ['sms', 'email', 'linkedin', 'slack', 'crm'],
    estimatedSavings: '25 min per booking',
    nodeCount: 6,
    nodes: [
      {
        id: 'node-trig',
        type: 'customNode',
        position: { x: 80, y: 160 },
        data: {
          nodeType: 'borisDispositionTrigger',
          label: 'Boris Disposition: Meeting Booked',
          category: 'Triggers',
          icon: 'PhoneCall',
          isTriggerPill: true,
          config: { dispositionFilter: 'Meeting Booked', requirePhone: true, requireEmail: true }
        }
      },
      {
        id: 'node-sms',
        type: 'customNode',
        position: { x: 400, y: 60 },
        data: {
          nodeType: 'twilioSmsNode',
          label: 'Twilio SMS Demo Alert',
          category: 'App Integrations',
          icon: 'Smartphone',
          config: {
            operation: 'sendSms',
            to: '{{ $json.phone }}',
            message: 'Hi {{ $json.leadName }}, Boris from Appointmentlyy! Confirmed your VIP Strategy Demo with Emil for {{ $json.scheduledTime || "tomorrow" }}. Calendar invite is in your inbox.'
          }
        }
      },
      {
        id: 'node-email',
        type: 'customNode',
        position: { x: 400, y: 240 },
        data: {
          nodeType: 'resendNode',
          label: 'Calendar Invite & Executive Briefing',
          category: 'App Integrations',
          icon: 'MailCheck',
          config: {
            to: '{{ $json.email }}',
            subject: 'Confirmed: Appointmentlyy AI Strategy Session with Emil (CEO)',
            htmlBody: '<h2>Hi {{ $json.leadName }},</h2><p>Excited to meet you on <strong>{{ $json.scheduledTime }}</strong>. We have prepared a customized blueprint on how Boris AI intercepts objection drop-offs for {{ $json.company }}.</p>'
          }
        }
      },
      {
        id: 'node-linkedin',
        type: 'customNode',
        position: { x: 740, y: 60 },
        data: {
          nodeType: 'linkedInNode',
          label: 'Emil LinkedIn Connection Invite',
          category: 'App Integrations',
          icon: 'LinkedIn',
          config: { operation: 'sendConnectionInvite' }
        }
      },
      {
        id: 'node-slack',
        type: 'customNode',
        position: { x: 740, y: 240 },
        data: {
          nodeType: 'slackNode',
          label: 'Slack #deal-closing Alert',
          category: 'App Integrations',
          icon: 'Slack',
          config: { channel: '#deal-closing' }
        }
      },
      {
        id: 'node-crm',
        type: 'customNode',
        position: { x: 1060, y: 150 },
        data: {
          nodeType: 'supabaseNode',
          label: 'Update CRM: Demo Scheduled',
          category: 'App Integrations',
          icon: 'Server',
          config: { operation: 'update', table: 'leads' }
        }
      }
    ],
    edges: [
      { id: 'e-1', source: 'node-trig', target: 'node-sms', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'e-2', source: 'node-trig', target: 'node-email', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'e-3', source: 'node-sms', target: 'node-linkedin', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'e-4', source: 'node-email', target: 'node-slack', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'e-5', source: 'node-linkedin', target: 'node-crm', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'e-6', source: 'node-slack', target: 'node-crm', animated: false, style: { stroke: '#475569', strokeWidth: 2 } }
    ]
  },
  {
    id: 'tpl-followup-calendar-nudge',
    name: 'Follow-up Required: 1-Click Calendar + 24h SMS & LinkedIn Nudge',
    disposition: 'Follow-up Required',
    category: 'After-Call Dispositions',
    cadenceDay: 'Immediate Call Disposition',
    description:
      'Triggered when prospect requests a calendar link. Sends an instant SMS with Emil’s 1-click booking link and product video, followed by a 24-hour wait condition. If no booking is detected, automatically triggers a courteous LinkedIn nudge.',
    badge: '1-Click Booking',
    channels: ['sms', 'email', 'linkedin'],
    estimatedSavings: '15 min per prospect',
    nodeCount: 6,
    nodes: [
      {
        id: 'node-trig',
        type: 'customNode',
        position: { x: 80, y: 160 },
        data: {
          nodeType: 'borisDispositionTrigger',
          label: 'Disposition: Follow-up Required',
          category: 'Triggers',
          icon: 'PhoneCall',
          isTriggerPill: true,
          config: { dispositionFilter: 'Follow-up Required' }
        }
      },
      {
        id: 'node-sms-link',
        type: 'customNode',
        position: { x: 380, y: 80 },
        data: {
          nodeType: 'twilioSmsNode',
          label: 'SMS: 1-Click Booking Link',
          category: 'App Integrations',
          icon: 'Smartphone',
          config: { to: '{{ $json.phone }}' }
        }
      },
      {
        id: 'node-email-deck',
        type: 'customNode',
        position: { x: 380, y: 240 },
        data: {
          nodeType: 'resendNode',
          label: 'Email: 1-Pager & Product Demo',
          category: 'App Integrations',
          icon: 'MailCheck',
          config: { to: '{{ $json.email }}' }
        }
      },
      {
        id: 'node-delay',
        type: 'customNode',
        position: { x: 700, y: 160 },
        data: {
          nodeType: 'delayNode',
          label: 'Wait 24 Hours',
          category: 'Logic & Flow',
          icon: 'Hourglass',
          config: { unit: 'hours', amount: 24 }
        }
      },
      {
        id: 'node-li-nudge',
        type: 'customNode',
        position: { x: 1000, y: 100 },
        data: {
          nodeType: 'linkedInNode',
          label: 'LinkedIn Follow-up Nudge',
          category: 'App Integrations',
          icon: 'LinkedIn',
          config: { operation: 'sendDirectMessage' }
        }
      },
      {
        id: 'node-requeue',
        type: 'customNode',
        position: { x: 1000, y: 240 },
        data: {
          nodeType: 'supabaseNode',
          label: 'Queue SDR Follow-up Call',
          category: 'App Integrations',
          icon: 'Server',
          config: { operation: 'update', table: 'leads' }
        }
      }
    ],
    edges: [
      { id: 'e-1', source: 'node-trig', target: 'node-sms-link', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'e-2', source: 'node-trig', target: 'node-email-deck', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'e-3', source: 'node-sms-link', target: 'node-delay', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'e-4', source: 'node-email-deck', target: 'node-delay', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'e-5', source: 'node-delay', target: 'node-li-nudge', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'e-6', source: 'node-delay', target: 'node-requeue', animated: false, style: { stroke: '#475569', strokeWidth: 2 } }
    ]
  },
  {
    id: 'tpl-no-answer-voicemail-recap',
    name: 'No Answer / Voicemail Drop: 3-Touch Follow-up Cadence',
    disposition: 'No answer',
    category: 'After-Call Dispositions',
    cadenceDay: 'Immediate Call Disposition',
    description:
      'Triggered when Boris hits voicemail or no-pick. Waits 3 minutes for voicemail delivery, sends a low-friction "just dropped you a VM" SMS, emails a 3-bullet recap, and automatically re-queues the prospect into tomorrow’s calling schedule.',
    badge: 'Voicemail Recovery',
    channels: ['sms', 'email', 'crm'],
    estimatedSavings: '20 min per 10 dials',
    nodeCount: 5,
    nodes: [
      {
        id: 'node-trig',
        type: 'customNode',
        position: { x: 80, y: 160 },
        data: {
          nodeType: 'borisDispositionTrigger',
          label: 'Disposition: No Answer / Voicemail',
          category: 'Triggers',
          icon: 'PhoneCall',
          isTriggerPill: true,
          config: { dispositionFilter: 'No answer' }
        }
      },
      {
        id: 'node-delay',
        type: 'customNode',
        position: { x: 380, y: 160 },
        data: {
          nodeType: 'delayNode',
          label: 'Wait 3 Minutes (Voicemail Delivery)',
          category: 'Logic & Flow',
          icon: 'Hourglass',
          config: { unit: 'minutes', amount: 3 }
        }
      },
      {
        id: 'node-sms-vm',
        type: 'customNode',
        position: { x: 680, y: 80 },
        data: {
          nodeType: 'twilioSmsNode',
          label: 'SMS: "Just Dropped You a Voicemail"',
          category: 'App Integrations',
          icon: 'Smartphone',
          config: { to: '{{ $json.phone }}' }
        }
      },
      {
        id: 'node-email-recap',
        type: 'customNode',
        position: { x: 680, y: 240 },
        data: {
          nodeType: 'resendNode',
          label: 'Email: Voicemail Summary',
          category: 'App Integrations',
          icon: 'MailCheck',
          config: { to: '{{ $json.email }}' }
        }
      },
      {
        id: 'node-crm-requeue',
        type: 'customNode',
        position: { x: 1000, y: 160 },
        data: {
          nodeType: 'googleSheetsNode',
          label: 'Re-queue in Cockpit for Day 2 Redial',
          category: 'App Integrations',
          icon: 'Sheet',
          config: { sheetName: 'Cockpit Redials' }
        }
      }
    ],
    edges: [
      { id: 'e-1', source: 'node-trig', target: 'node-delay', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'e-2', source: 'node-delay', target: 'node-sms-vm', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'e-3', source: 'node-delay', target: 'node-email-recap', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'e-4', source: 'node-sms-vm', target: 'node-crm-requeue', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'e-5', source: 'node-email-recap', target: 'node-crm-requeue', animated: false, style: { stroke: '#475569', strokeWidth: 2 } }
    ]
  },
  {
    id: 'tpl-referral-dm-handoff',
    name: 'Referral & New Decision Maker Hand-off Engine',
    disposition: 'Referral / Update Contact',
    category: 'After-Call Dispositions',
    cadenceDay: 'Immediate Call Disposition',
    description:
      'When a contact refers another stakeholder, AI parses the referee\'s name, title, and contact info from SDR call notes, emails a thank-you to the referrer, and reaches out to the new decision maker via email and LinkedIn citing the referral.',
    badge: 'AI Contact Extractor',
    channels: ['ai', 'email', 'linkedin', 'crm'],
    estimatedSavings: '30 min research time',
    nodeCount: 6,
    nodes: [
      {
        id: 'node-trig',
        type: 'customNode',
        position: { x: 80, y: 160 },
        data: {
          nodeType: 'borisDispositionTrigger',
          label: 'Disposition: Referral Logged',
          category: 'Triggers',
          icon: 'PhoneCall',
          isTriggerPill: true,
          config: { dispositionFilter: 'Referral / Update Contact' }
        }
      },
      {
        id: 'node-ai-parse',
        type: 'customNode',
        position: { x: 380, y: 160 },
        data: {
          nodeType: 'aiAgentNode',
          label: 'AI Agent: Parse New Decision Maker',
          category: 'AI & LLMs',
          icon: 'Bot'
        }
      },
      {
        id: 'node-thankyou-email',
        type: 'customNode',
        position: { x: 720, y: 60 },
        data: {
          nodeType: 'resendNode',
          label: 'Thank You Email to Referrer',
          category: 'App Integrations',
          icon: 'MailCheck',
          config: { to: '{{ $json.email }}' }
        }
      },
      {
        id: 'node-newdm-linkedin',
        type: 'customNode',
        position: { x: 720, y: 240 },
        data: {
          nodeType: 'linkedInNode',
          label: 'Warm LinkedIn Invite to New DM',
          category: 'App Integrations',
          icon: 'LinkedIn',
          config: { operation: 'sendConnectionInvite' }
        }
      },
      {
        id: 'node-newdm-email',
        type: 'customNode',
        position: { x: 1020, y: 240 },
        data: {
          nodeType: 'resendNode',
          label: 'Intro Email to New DM (Referral Cited)',
          category: 'App Integrations',
          icon: 'MailCheck',
          config: { to: '{{ $json.newDmEmail }}' }
        }
      },
      {
        id: 'node-crm-new-contact',
        type: 'customNode',
        position: { x: 1300, y: 150 },
        data: {
          nodeType: 'supabaseNode',
          label: 'Insert New Contact into CRM',
          category: 'App Integrations',
          icon: 'Server',
          config: { operation: 'insert', table: 'contacts' }
        }
      }
    ],
    edges: [
      { id: 'e-1', source: 'node-trig', target: 'node-ai-parse', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'e-2', source: 'node-ai-parse', target: 'node-thankyou-email', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'e-3', source: 'node-ai-parse', target: 'node-newdm-linkedin', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'e-4', source: 'node-newdm-linkedin', target: 'node-newdm-email', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'e-5', source: 'node-thankyou-email', target: 'node-crm-new-contact', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'e-6', source: 'node-newdm-email', target: 'node-crm-new-contact', animated: false, style: { stroke: '#475569', strokeWidth: 2 } }
    ]
  },
  {
    id: 'tpl-callback-priority',
    name: 'Call Back Requested: Timed SMS Reminder & SDR Priority Alert',
    disposition: 'Call back',
    category: 'After-Call Dispositions',
    cadenceDay: 'Immediate Call Disposition',
    description:
      'Triggered when prospect says the floor is busy and asks for a callback. Sends an immediate polite SMS confirming the callback window, schedules a high-priority task in Boris Cockpit, and fires a Slack alert with phone audio snippet.',
    badge: 'Floor Busy Handler',
    channels: ['sms', 'slack', 'crm'],
    estimatedSavings: 'Zero dropped callbacks',
    nodeCount: 4,
    nodes: [
      {
        id: 'node-trig',
        type: 'customNode',
        position: { x: 80, y: 160 },
        data: {
          nodeType: 'borisDispositionTrigger',
          label: 'Disposition: Call Back Logged',
          category: 'Triggers',
          icon: 'PhoneCall',
          isTriggerPill: true,
          config: { dispositionFilter: 'Call back' }
        }
      },
      {
        id: 'node-sms',
        type: 'customNode',
        position: { x: 400, y: 90 },
        data: {
          nodeType: 'twilioSmsNode',
          label: 'SMS: Callback Window Confirmed',
          category: 'App Integrations',
          icon: 'Smartphone',
          config: { to: '{{ $json.phone }}' }
        }
      },
      {
        id: 'node-slack',
        type: 'customNode',
        position: { x: 400, y: 240 },
        data: {
          nodeType: 'slackNode',
          label: 'Slack: #sdr-callbacks Priority Alert',
          category: 'App Integrations',
          icon: 'Slack',
          config: { channel: '#sdr-callbacks' }
        }
      },
      {
        id: 'node-notion',
        type: 'customNode',
        position: { x: 740, y: 160 },
        data: {
          nodeType: 'notionNode',
          label: 'Create High-Priority Callback Task',
          category: 'App Integrations',
          icon: 'FileText'
        }
      }
    ],
    edges: [
      { id: 'e-1', source: 'node-trig', target: 'node-sms', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'e-2', source: 'node-trig', target: 'node-slack', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'e-3', source: 'node-sms', target: 'node-notion', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'e-4', source: 'node-slack', target: 'node-notion', animated: false, style: { stroke: '#475569', strokeWidth: 2 } }
    ]
  },
  {
    id: 'tpl-not-interested-soft-touch',
    name: 'Not Interested: Soft LinkedIn Connect & 60-Day Newsletter Nurture',
    disposition: 'Not interested',
    category: 'After-Call Dispositions',
    cadenceDay: 'Immediate Call Disposition',
    description:
      'Respects prospect objection with zero pushback. Sends a graceful LinkedIn invite to keep network open, tags the objection in CRM, and enrolls in bi-weekly thought leadership nurture.',
    badge: 'Soft Turnaround',
    channels: ['linkedin', 'email', 'crm'],
    estimatedSavings: 'Preserves 8% future conversions',
    nodeCount: 4,
    nodes: [
      {
        id: 'node-trig',
        type: 'customNode',
        position: { x: 80, y: 160 },
        data: {
          nodeType: 'borisDispositionTrigger',
          label: 'Disposition: Not Interested',
          category: 'Triggers',
          icon: 'PhoneCall',
          isTriggerPill: true,
          config: { dispositionFilter: 'Not interested' }
        }
      },
      {
        id: 'node-linkedin',
        type: 'customNode',
        position: { x: 400, y: 90 },
        data: {
          nodeType: 'linkedInNode',
          label: 'LinkedIn: Soft Network Invite',
          category: 'App Integrations',
          icon: 'LinkedIn',
          config: { operation: 'sendConnectionInvite' }
        }
      },
      {
        id: 'node-email',
        type: 'customNode',
        position: { x: 400, y: 240 },
        data: {
          nodeType: 'resendNode',
          label: 'Enroll in 60-Day Thought Leadership',
          category: 'App Integrations',
          icon: 'MailCheck',
          config: { to: '{{ $json.email }}' }
        }
      },
      {
        id: 'node-crm',
        type: 'customNode',
        position: { x: 740, y: 160 },
        data: {
          nodeType: 'supabaseNode',
          label: 'Tag Objection in CRM & Schedule Nurture',
          category: 'App Integrations',
          icon: 'Server',
          config: { operation: 'update', table: 'leads' }
        }
      }
    ],
    edges: [
      { id: 'e-1', source: 'node-trig', target: 'node-linkedin', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'e-2', source: 'node-trig', target: 'node-email', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'e-3', source: 'node-linkedin', target: 'node-crm', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'e-4', source: 'node-email', target: 'node-crm', animated: false, style: { stroke: '#475569', strokeWidth: 2 } }
    ]
  },
  {
    id: 'tpl-master-disposition-router',
    name: 'Master Omnichannel Disposition Switch Router',
    disposition: 'All Dispositions',
    category: 'After-Call Dispositions',
    cadenceDay: 'Universal Switchboard',
    description:
      'The central switchboard for all Boris Cockpit calls. A single workflow that branches on the selected call disposition and dynamically executes the exact SMS, Email, and LinkedIn sequence for that specific outcome.',
    badge: 'Universal Router',
    channels: ['sms', 'email', 'linkedin', 'slack', 'crm', 'ai'],
    estimatedSavings: 'Handles 100% of floor calls',
    nodeCount: 8,
    nodes: [
      {
        id: 'node-trig',
        type: 'customNode',
        position: { x: 80, y: 260 },
        data: {
          nodeType: 'borisDispositionTrigger',
          label: 'Any Boris Call Disposition',
          category: 'Triggers',
          icon: 'PhoneCall',
          isTriggerPill: true,
          config: { dispositionFilter: 'all' }
        }
      },
      {
        id: 'node-switch',
        type: 'customNode',
        position: { x: 380, y: 260 },
        data: {
          nodeType: 'switchNode',
          label: 'Switch on Disposition',
          category: 'Logic & Flow',
          icon: 'Shuffle'
        }
      },
      {
        id: 'node-b0-sms',
        type: 'customNode',
        position: { x: 740, y: 40 },
        data: {
          nodeType: 'twilioSmsNode',
          label: 'Meeting Booked: SMS & Calendar Invite',
          category: 'App Integrations',
          icon: 'Smartphone'
        }
      },
      {
        id: 'node-b1-sms',
        type: 'customNode',
        position: { x: 740, y: 150 },
        data: {
          nodeType: 'twilioSmsNode',
          label: 'Follow-up: 1-Click Booking SMS',
          category: 'App Integrations',
          icon: 'Smartphone'
        }
      },
      {
        id: 'node-b2-vm',
        type: 'customNode',
        position: { x: 740, y: 260 },
        data: {
          nodeType: 'twilioSmsNode',
          label: 'No Answer: Voicemail Text & Email Recap',
          category: 'App Integrations',
          icon: 'Smartphone'
        }
      },
      {
        id: 'node-b3-ai',
        type: 'customNode',
        position: { x: 740, y: 370 },
        data: {
          nodeType: 'aiAgentNode',
          label: 'Referral: AI Contact Extraction',
          category: 'AI & LLMs',
          icon: 'Bot'
        }
      },
      {
        id: 'node-b4-li',
        type: 'customNode',
        position: { x: 740, y: 480 },
        data: {
          nodeType: 'linkedInNode',
          label: 'Not Interested: Polite Soft Connect',
          category: 'App Integrations',
          icon: 'LinkedIn'
        }
      },
      {
        id: 'node-sync',
        type: 'customNode',
        position: { x: 1100, y: 260 },
        data: {
          nodeType: 'supabaseNode',
          label: 'Universal CRM Log & Audit Sync',
          category: 'App Integrations',
          icon: 'Server'
        }
      }
    ],
    edges: [
      { id: 'e-1', source: 'node-trig', target: 'node-switch', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'e-2', source: 'node-switch', target: 'node-b0-sms', sourceHandle: 'b0', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'e-3', source: 'node-switch', target: 'node-b1-sms', sourceHandle: 'b1', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'e-4', source: 'node-switch', target: 'node-b2-vm', sourceHandle: 'b2', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'e-5', source: 'node-switch', target: 'node-b3-ai', sourceHandle: 'b3', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'e-6', source: 'node-switch', target: 'node-b4-li', sourceHandle: 'b4', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'e-7', source: 'node-b0-sms', target: 'node-sync', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'e-8', source: 'node-b1-sms', target: 'node-sync', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'e-9', source: 'node-b2-vm', target: 'node-sync', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'e-10', source: 'node-b3-ai', target: 'node-sync', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'e-11', source: 'node-b4-li', target: 'node-sync', animated: false, style: { stroke: '#475569', strokeWidth: 2 } }
    ]
  },

  // =========================================================================
  // SECTION 3: SPEED-TO-LEAD & SIGNAL-TRIGGERED OUTBOUND
  // =========================================================================
  {
    id: 'tpl-speed-to-lead-60s',
    name: 'Speed-to-Lead: 60-Second Inbound Lead Ring-Down & Instant SMS',
    category: 'Speed-to-Lead & Signals',
    badge: 'Sub-60s Speed',
    channels: ['phone', 'sms', 'email', 'slack'],
    estimatedSavings: '391% higher close rate',
    nodeCount: 5,
    description:
      'Fires the second an inbound prospect submits a form. Instantly dispatches a warm SMS, notifies SDR via Slack, initiates softphone auto-dial to connect rep in under 60 seconds, and delivers an executive pitch deck.',
    nodes: [
      {
        id: 's60-trig',
        type: 'customNode',
        position: { x: 80, y: 160 },
        data: {
          nodeType: 'webhookTrigger',
          label: 'Inbound Form Submission Webhook',
          category: 'Triggers',
          icon: 'Webhook',
          isTriggerPill: true,
          config: { path: 'inbound-lead' }
        }
      },
      {
        id: 's60-sms',
        type: 'customNode',
        position: { x: 400, y: 80 },
        data: {
          nodeType: 'twilioSmsNode',
          label: 'Instant 60s SMS: "Boris Ringing You Now"',
          category: 'App Integrations',
          icon: 'Smartphone',
          config: {
            to: '{{ $json.phone }}',
            message: 'Hi {{ $json.name }}, Boris from Appointmentlyy! Received your inquiry. Calling your line right now to answer any questions.'
          }
        }
      },
      {
        id: 's60-slack',
        type: 'customNode',
        position: { x: 400, y: 240 },
        data: {
          nodeType: 'slackNode',
          label: 'Slack: #hot-leads 60s Countdown',
          category: 'App Integrations',
          icon: 'Slack',
          config: { channel: '#hot-leads' }
        }
      },
      {
        id: 's60-dial',
        type: 'customNode',
        position: { x: 740, y: 80 },
        data: {
          nodeType: 'googleSheetsNode',
          label: 'Push to Boris Cockpit Auto-Dial Queue',
          category: 'App Integrations',
          icon: 'PhoneCall'
        }
      },
      {
        id: 's60-email',
        type: 'customNode',
        position: { x: 740, y: 240 },
        data: {
          nodeType: 'resendNode',
          label: 'Email: Introduction & Executive 1-Pager',
          category: 'App Integrations',
          icon: 'MailCheck',
          config: { to: '{{ $json.email }}' }
        }
      }
    ],
    edges: [
      { id: 's60e-1', source: 's60-trig', target: 's60-sms', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 's60e-2', source: 's60-trig', target: 's60-slack', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 's60e-3', source: 's60-sms', target: 's60-dial', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 's60e-4', source: 's60-slack', target: 's60-email', animated: false, style: { stroke: '#475569', strokeWidth: 2 } }
    ]
  },

  // =========================================================================
  // SECTION 4: AI RESEARCH & LEAD HYPER-PERSONALIZATION
  // =========================================================================
  {
    id: 'tpl-ai-research-hyperpersonalize',
    name: 'AI Agent: Pre-Call Account Research & 1-Click Cadence Personalizer',
    category: 'AI Research & Personalization',
    badge: 'Deep Research Agent',
    channels: ['ai', 'crm', 'email', 'linkedin'],
    estimatedSavings: '20 min research per lead',
    nodeCount: 5,
    description:
      'Autonomous AI Agent reviews prospect company domain, scrapes recent news & tech stack, extracts primary B2B pain point, and generates customized Day 1, Day 3, and Day 7 cadence emails tailored specifically to that buyer persona.',
    nodes: [
      {
        id: 'ai-trig',
        type: 'customNode',
        position: { x: 80, y: 160 },
        data: {
          nodeType: 'manualTrigger',
          label: 'Batch Account Enqueue',
          category: 'Triggers',
          icon: 'PlayCircle',
          isTriggerPill: true
        }
      },
      {
        id: 'ai-agent',
        type: 'customNode',
        position: { x: 380, y: 160 },
        data: {
          nodeType: 'aiAgentNode',
          label: 'AI Agent: Domain & Persona Deep Research',
          category: 'AI & LLMs',
          icon: 'Bot',
          config: {
            agentGoal: 'Analyze prospect company model, identify sales stack bottlenecks, and write 3 customized cold outreach templates'
          }
        }
      },
      {
        id: 'ai-draft-email',
        type: 'customNode',
        position: { x: 740, y: 80 },
        data: {
          nodeType: 'resendNode',
          label: 'Draft Personalized Day 1 Email in CRM',
          category: 'App Integrations',
          icon: 'MailCheck'
        }
      },
      {
        id: 'ai-draft-li',
        type: 'customNode',
        position: { x: 740, y: 240 },
        data: {
          nodeType: 'linkedInNode',
          label: 'Draft Tailored LinkedIn Connection Note',
          category: 'App Integrations',
          icon: 'LinkedIn'
        }
      },
      {
        id: 'ai-crm-save',
        type: 'customNode',
        position: { x: 1060, y: 160 },
        data: {
          nodeType: 'supabaseNode',
          label: 'Save Cadence Content into Cockpit Lead Card',
          category: 'App Integrations',
          icon: 'Server',
          config: { operation: 'update', table: 'leads' }
        }
      }
    ],
    edges: [
      { id: 'aie-1', source: 'ai-trig', target: 'ai-agent', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'aie-2', source: 'ai-agent', target: 'ai-draft-email', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'aie-3', source: 'ai-agent', target: 'ai-draft-li', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'aie-4', source: 'ai-draft-email', target: 'ai-crm-save', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
      { id: 'aie-5', source: 'ai-draft-li', target: 'ai-crm-save', animated: false, style: { stroke: '#475569', strokeWidth: 2 } }
    ]
  }
];
