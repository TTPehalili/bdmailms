'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  Calendar, 
  Users, 
  PhoneCall, 
  Mail, 
  CheckCircle2, 
  Ban, 
  ThumbsDown, 
  Clock, 
  TrendingUp, 
  Filter, 
  Download, 
  Search, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldAlert, 
  CalendarClock,
  RotateCcw,
  Target,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import AppSidebar from '@/components/AppSidebar';
import GlobalTopHeader from '@/components/GlobalTopHeader';

export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface RepMetric {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'Online' | 'In Call' | 'Break' | 'Offline';
  campaign: string;
  callsMade: number;
  connectRate: number; // percentage
  emailsSent: number;
  linkedInTouches: number;
  appointmentsBooked: number;
  quotaTarget: number;
  quotaAttainment: number; // percentage
  dncFlagged: number;
  notInterested: number;
  callbacksScheduled: number;
  avgTalkTimeSec: number;
  qaSparringScore: number; // out of 100
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  repName: string;
  prospectName: string;
  companyName: string;
  channel: 'Phone' | 'Email' | 'LinkedIn';
  disposition: 'Meeting Booked' | 'DNC Quarantined' | 'Not Interested' | 'Callback Scheduled' | 'Follow-Up Email' | 'No Answer';
  notesSnippet: string;
}

// Master Raw Rep Performance Data Across Timeframes
const MASTER_PERFORMANCE_DATA: Record<TimePeriod, RepMetric[]> = {
  daily: [
    {
      id: 'rep_1',
      name: 'Alex Mercer',
      role: 'Senior Outbound SDR',
      avatar: 'AM',
      status: 'In Call',
      campaign: 'Apex Global BPO',
      callsMade: 58,
      connectRate: 36.2,
      emailsSent: 42,
      linkedInTouches: 18,
      appointmentsBooked: 3,
      quotaTarget: 3,
      quotaAttainment: 100,
      dncFlagged: 1,
      notInterested: 5,
      callbacksScheduled: 4,
      avgTalkTimeSec: 184,
      qaSparringScore: 94
    },
    {
      id: 'rep_2',
      name: 'Sarah Jenkins',
      role: 'Outbound Appointment Setter',
      avatar: 'SJ',
      status: 'Online',
      campaign: 'Enterprise Outbound',
      callsMade: 64,
      connectRate: 31.8,
      emailsSent: 35,
      linkedInTouches: 15,
      appointmentsBooked: 2,
      quotaTarget: 3,
      quotaAttainment: 66.7,
      dncFlagged: 0,
      notInterested: 8,
      callbacksScheduled: 6,
      avgTalkTimeSec: 152,
      qaSparringScore: 91
    },
    {
      id: 'rep_3',
      name: 'David Vance',
      role: 'B2B Sales Representative',
      avatar: 'DV',
      status: 'Online',
      campaign: 'FinTech Call Center',
      callsMade: 52,
      connectRate: 28.8,
      emailsSent: 30,
      linkedInTouches: 12,
      appointmentsBooked: 2,
      quotaTarget: 3,
      quotaAttainment: 66.7,
      dncFlagged: 2,
      notInterested: 7,
      callbacksScheduled: 3,
      avgTalkTimeSec: 168,
      qaSparringScore: 88
    },
    {
      id: 'rep_4',
      name: 'Elena Gomez',
      role: 'Outbound Specialist',
      avatar: 'EG',
      status: 'Break',
      campaign: 'Medical BPO',
      callsMade: 44,
      connectRate: 40.9,
      emailsSent: 28,
      linkedInTouches: 10,
      appointmentsBooked: 1,
      quotaTarget: 2,
      quotaAttainment: 50,
      dncFlagged: 0,
      notInterested: 4,
      callbacksScheduled: 5,
      avgTalkTimeSec: 210,
      qaSparringScore: 96
    },
    {
      id: 'rep_5',
      name: 'Marcus Brody',
      role: 'Junior SDR',
      avatar: 'MB',
      status: 'In Call',
      campaign: 'Apex Global BPO',
      callsMade: 66,
      connectRate: 25.7,
      emailsSent: 25,
      linkedInTouches: 8,
      appointmentsBooked: 1,
      quotaTarget: 2,
      quotaAttainment: 50,
      dncFlagged: 1,
      notInterested: 9,
      callbacksScheduled: 2,
      avgTalkTimeSec: 138,
      qaSparringScore: 85
    }
  ],
  weekly: [
    {
      id: 'rep_1',
      name: 'Alex Mercer',
      role: 'Senior Outbound SDR',
      avatar: 'AM',
      status: 'In Call',
      campaign: 'Apex Global BPO',
      callsMade: 278,
      connectRate: 35.6,
      emailsSent: 195,
      linkedInTouches: 84,
      appointmentsBooked: 14,
      quotaTarget: 15,
      quotaAttainment: 93.3,
      dncFlagged: 3,
      notInterested: 24,
      callbacksScheduled: 18,
      avgTalkTimeSec: 188,
      qaSparringScore: 94
    },
    {
      id: 'rep_2',
      name: 'Sarah Jenkins',
      role: 'Outbound Appointment Setter',
      avatar: 'SJ',
      status: 'Online',
      campaign: 'Enterprise Outbound',
      callsMade: 312,
      connectRate: 32.1,
      emailsSent: 168,
      linkedInTouches: 72,
      appointmentsBooked: 12,
      quotaTarget: 15,
      quotaAttainment: 80.0,
      dncFlagged: 2,
      notInterested: 36,
      callbacksScheduled: 26,
      avgTalkTimeSec: 156,
      qaSparringScore: 91
    },
    {
      id: 'rep_3',
      name: 'David Vance',
      role: 'B2B Sales Representative',
      avatar: 'DV',
      status: 'Online',
      campaign: 'FinTech Call Center',
      callsMade: 264,
      connectRate: 29.5,
      emailsSent: 148,
      linkedInTouches: 60,
      appointmentsBooked: 10,
      quotaTarget: 15,
      quotaAttainment: 66.7,
      dncFlagged: 5,
      notInterested: 31,
      callbacksScheduled: 15,
      avgTalkTimeSec: 164,
      qaSparringScore: 88
    },
    {
      id: 'rep_4',
      name: 'Elena Gomez',
      role: 'Outbound Specialist',
      avatar: 'EG',
      status: 'Break',
      campaign: 'Medical BPO',
      callsMade: 228,
      connectRate: 41.2,
      emailsSent: 132,
      linkedInTouches: 52,
      appointmentsBooked: 9,
      quotaTarget: 10,
      quotaAttainment: 90.0,
      dncFlagged: 1,
      notInterested: 18,
      callbacksScheduled: 22,
      avgTalkTimeSec: 215,
      qaSparringScore: 96
    },
    {
      id: 'rep_5',
      name: 'Marcus Brody',
      role: 'Junior SDR',
      avatar: 'MB',
      status: 'In Call',
      campaign: 'Apex Global BPO',
      callsMade: 320,
      connectRate: 26.3,
      emailsSent: 110,
      linkedInTouches: 40,
      appointmentsBooked: 6,
      quotaTarget: 10,
      quotaAttainment: 60.0,
      dncFlagged: 4,
      notInterested: 42,
      callbacksScheduled: 11,
      avgTalkTimeSec: 142,
      qaSparringScore: 85
    }
  ],
  monthly: [
    {
      id: 'rep_1',
      name: 'Alex Mercer',
      role: 'Senior Outbound SDR',
      avatar: 'AM',
      status: 'In Call',
      campaign: 'Apex Global BPO',
      callsMade: 1140,
      connectRate: 36.8,
      emailsSent: 780,
      linkedInTouches: 340,
      appointmentsBooked: 58,
      quotaTarget: 60,
      quotaAttainment: 96.7,
      dncFlagged: 11,
      notInterested: 98,
      callbacksScheduled: 74,
      avgTalkTimeSec: 192,
      qaSparringScore: 94
    },
    {
      id: 'rep_2',
      name: 'Sarah Jenkins',
      role: 'Outbound Appointment Setter',
      avatar: 'SJ',
      status: 'Online',
      campaign: 'Enterprise Outbound',
      callsMade: 1260,
      connectRate: 33.2,
      emailsSent: 690,
      linkedInTouches: 295,
      appointmentsBooked: 49,
      quotaTarget: 60,
      quotaAttainment: 81.7,
      dncFlagged: 8,
      notInterested: 142,
      callbacksScheduled: 105,
      avgTalkTimeSec: 160,
      qaSparringScore: 91
    },
    {
      id: 'rep_3',
      name: 'David Vance',
      role: 'B2B Sales Representative',
      avatar: 'DV',
      status: 'Online',
      campaign: 'FinTech Call Center',
      callsMade: 1080,
      connectRate: 30.1,
      emailsSent: 610,
      linkedInTouches: 245,
      appointmentsBooked: 41,
      quotaTarget: 60,
      quotaAttainment: 68.3,
      dncFlagged: 18,
      notInterested: 128,
      callbacksScheduled: 62,
      avgTalkTimeSec: 166,
      qaSparringScore: 88
    },
    {
      id: 'rep_4',
      name: 'Elena Gomez',
      role: 'Outbound Specialist',
      avatar: 'EG',
      status: 'Break',
      campaign: 'Medical BPO',
      callsMade: 940,
      connectRate: 42.1,
      emailsSent: 540,
      linkedInTouches: 210,
      appointmentsBooked: 38,
      quotaTarget: 40,
      quotaAttainment: 95.0,
      dncFlagged: 4,
      notInterested: 76,
      callbacksScheduled: 92,
      avgTalkTimeSec: 218,
      qaSparringScore: 96
    },
    {
      id: 'rep_5',
      name: 'Marcus Brody',
      role: 'Junior SDR',
      avatar: 'MB',
      status: 'In Call',
      campaign: 'Apex Global BPO',
      callsMade: 1310,
      connectRate: 27.2,
      emailsSent: 460,
      linkedInTouches: 165,
      appointmentsBooked: 26,
      quotaTarget: 40,
      quotaAttainment: 65.0,
      dncFlagged: 15,
      notInterested: 175,
      callbacksScheduled: 48,
      avgTalkTimeSec: 145,
      qaSparringScore: 85
    }
  ],
  quarterly: [
    {
      id: 'rep_1',
      name: 'Alex Mercer',
      role: 'Senior Outbound SDR',
      avatar: 'AM',
      status: 'In Call',
      campaign: 'Apex Global BPO',
      callsMade: 3350,
      connectRate: 36.5,
      emailsSent: 2310,
      linkedInTouches: 990,
      appointmentsBooked: 172,
      quotaTarget: 180,
      quotaAttainment: 95.6,
      dncFlagged: 32,
      notInterested: 290,
      callbacksScheduled: 215,
      avgTalkTimeSec: 190,
      qaSparringScore: 94
    },
    {
      id: 'rep_2',
      name: 'Sarah Jenkins',
      role: 'Outbound Appointment Setter',
      avatar: 'SJ',
      status: 'Online',
      campaign: 'Enterprise Outbound',
      callsMade: 3720,
      connectRate: 32.9,
      emailsSent: 2040,
      linkedInTouches: 880,
      appointmentsBooked: 146,
      quotaTarget: 180,
      quotaAttainment: 81.1,
      dncFlagged: 24,
      notInterested: 410,
      callbacksScheduled: 310,
      avgTalkTimeSec: 158,
      qaSparringScore: 91
    },
    {
      id: 'rep_3',
      name: 'David Vance',
      role: 'B2B Sales Representative',
      avatar: 'DV',
      status: 'Online',
      campaign: 'FinTech Call Center',
      callsMade: 3190,
      connectRate: 29.8,
      emailsSent: 1790,
      linkedInTouches: 720,
      appointmentsBooked: 121,
      quotaTarget: 180,
      quotaAttainment: 67.2,
      dncFlagged: 51,
      notInterested: 375,
      callbacksScheduled: 180,
      avgTalkTimeSec: 165,
      qaSparringScore: 88
    },
    {
      id: 'rep_4',
      name: 'Elena Gomez',
      role: 'Outbound Specialist',
      avatar: 'EG',
      status: 'Break',
      campaign: 'Medical BPO',
      callsMade: 2780,
      connectRate: 41.8,
      emailsSent: 1580,
      linkedInTouches: 630,
      appointmentsBooked: 114,
      quotaTarget: 120,
      quotaAttainment: 95.0,
      dncFlagged: 12,
      notInterested: 220,
      callbacksScheduled: 265,
      avgTalkTimeSec: 216,
      qaSparringScore: 96
    },
    {
      id: 'rep_5',
      name: 'Marcus Brody',
      role: 'Junior SDR',
      avatar: 'MB',
      status: 'In Call',
      campaign: 'Apex Global BPO',
      callsMade: 3880,
      connectRate: 26.9,
      emailsSent: 1350,
      linkedInTouches: 490,
      appointmentsBooked: 76,
      quotaTarget: 120,
      quotaAttainment: 63.3,
      dncFlagged: 44,
      notInterested: 515,
      callbacksScheduled: 140,
      avgTalkTimeSec: 144,
      qaSparringScore: 85
    }
  ],
  yearly: [
    {
      id: 'rep_1',
      name: 'Alex Mercer',
      role: 'Senior Outbound SDR',
      avatar: 'AM',
      status: 'In Call',
      campaign: 'Apex Global BPO',
      callsMade: 13200,
      connectRate: 36.2,
      emailsSent: 9150,
      linkedInTouches: 3920,
      appointmentsBooked: 675,
      quotaTarget: 700,
      quotaAttainment: 96.4,
      dncFlagged: 124,
      notInterested: 1140,
      callbacksScheduled: 840,
      avgTalkTimeSec: 191,
      qaSparringScore: 94
    },
    {
      id: 'rep_2',
      name: 'Sarah Jenkins',
      role: 'Outbound Appointment Setter',
      avatar: 'SJ',
      status: 'Online',
      campaign: 'Enterprise Outbound',
      callsMade: 14650,
      connectRate: 32.6,
      emailsSent: 8120,
      linkedInTouches: 3490,
      appointmentsBooked: 580,
      quotaTarget: 700,
      quotaAttainment: 82.9,
      dncFlagged: 92,
      notInterested: 1620,
      callbacksScheduled: 1210,
      avgTalkTimeSec: 159,
      qaSparringScore: 91
    },
    {
      id: 'rep_3',
      name: 'David Vance',
      role: 'B2B Sales Representative',
      avatar: 'DV',
      status: 'Online',
      campaign: 'FinTech Call Center',
      callsMade: 12600,
      connectRate: 29.6,
      emailsSent: 7100,
      linkedInTouches: 2860,
      appointmentsBooked: 478,
      quotaTarget: 700,
      quotaAttainment: 68.3,
      dncFlagged: 198,
      notInterested: 1490,
      callbacksScheduled: 710,
      avgTalkTimeSec: 165,
      qaSparringScore: 88
    },
    {
      id: 'rep_4',
      name: 'Elena Gomez',
      role: 'Outbound Specialist',
      avatar: 'EG',
      status: 'Break',
      campaign: 'Medical BPO',
      callsMade: 11000,
      connectRate: 41.6,
      emailsSent: 6250,
      linkedInTouches: 2510,
      appointmentsBooked: 452,
      quotaTarget: 480,
      quotaAttainment: 94.2,
      dncFlagged: 46,
      notInterested: 875,
      callbacksScheduled: 1045,
      avgTalkTimeSec: 217,
      qaSparringScore: 96
    },
    {
      id: 'rep_5',
      name: 'Marcus Brody',
      role: 'Junior SDR',
      avatar: 'MB',
      status: 'In Call',
      campaign: 'Apex Global BPO',
      callsMade: 15300,
      connectRate: 26.8,
      emailsSent: 5350,
      linkedInTouches: 1940,
      appointmentsBooked: 302,
      quotaTarget: 480,
      quotaAttainment: 62.9,
      dncFlagged: 172,
      notInterested: 2040,
      callbacksScheduled: 550,
      avgTalkTimeSec: 143,
      qaSparringScore: 85
    }
  ]
};

// Recent Live Activity Stream
const RECENT_ACTIVITY_STREAM: ActivityLogItem[] = [
  {
    id: 'act_1',
    timestamp: '2 mins ago',
    repName: 'Alex Mercer',
    prospectName: 'Julian Vance',
    companyName: 'Apex Global BPO',
    channel: 'Phone',
    disposition: 'Meeting Booked',
    notesSnippet: 'Confirmed 250 seats CS/Sales floor. Meeting locked for Thursday 2:00 PM with Founder Emil.'
  },
  {
    id: 'act_2',
    timestamp: '7 mins ago',
    repName: 'Sarah Jenkins',
    prospectName: 'Marcus Brody',
    companyName: 'Nexus Call Solutions',
    channel: 'Email',
    disposition: 'Follow-Up Email',
    notesSnippet: 'Dispatched Day 7 Email #3 with 90s Loom teardown link regarding 100% call QA.'
  },
  {
    id: 'act_3',
    timestamp: '14 mins ago',
    repName: 'David Vance',
    prospectName: 'Robert Sterling',
    companyName: 'BPO Alliance UK',
    channel: 'Phone',
    disposition: 'DNC Quarantined',
    notesSnippet: 'Prospect explicitly requested Do Not Call. Organization-wide quarantine activated.'
  },
  {
    id: 'act_4',
    timestamp: '21 mins ago',
    repName: 'Elena Gomez',
    prospectName: 'Elena Rostova',
    companyName: 'ClearDial Telephony',
    channel: 'Phone',
    disposition: 'Callback Scheduled',
    notesSnippet: 'In middle of client shift handover. Requested callback next Tuesday morning 9:00 AM.'
  },
  {
    id: 'act_5',
    timestamp: '32 mins ago',
    repName: 'Marcus Brody',
    prospectName: 'Thomas Thorne',
    companyName: 'Apex Virtual Centers',
    channel: 'Phone',
    disposition: 'Not Interested',
    notesSnippet: 'Locked in 2-year broker contract with overseas aggregator. Disqualified for current quarter.'
  }
];

export default function RepPerformanceDashboard() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('weekly');
  const [selectedRepFilter, setSelectedRepFilter] = useState<string>('all');
  const [selectedCampaignFilter, setSelectedCampaignFilter] = useState<string>('all');
  const [selectedDispositionFilter, setSelectedDispositionFilter] = useState<string>('all');
  const [searchRepQuery, setSearchRepQuery] = useState('');
  const [sortField, setSortField] = useState<'appointmentsBooked' | 'callsMade' | 'quotaAttainment' | 'connectRate'>('appointmentsBooked');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Filtered Reps List
  const rawReps = MASTER_PERFORMANCE_DATA[timePeriod] || MASTER_PERFORMANCE_DATA.weekly;

  const filteredReps = useMemo(() => {
    return rawReps
      .filter(r => {
        const matchesRep = selectedRepFilter === 'all' || r.id === selectedRepFilter;
        const matchesCampaign = selectedCampaignFilter === 'all' || r.campaign === selectedCampaignFilter;
        const matchesSearch = searchRepQuery.trim() === '' || 
          r.name.toLowerCase().includes(searchRepQuery.toLowerCase()) ||
          r.campaign.toLowerCase().includes(searchRepQuery.toLowerCase());
        return matchesRep && matchesCampaign && matchesSearch;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        return sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
      });
  }, [rawReps, selectedRepFilter, selectedCampaignFilter, searchRepQuery, sortField, sortAsc]);

  // Aggregated Floor-Wide Metrics
  const aggregateStats = useMemo(() => {
    const list = filteredReps;
    const totalCalls = list.reduce((sum, r) => sum + r.callsMade, 0);
    const totalEmails = list.reduce((sum, r) => sum + r.emailsSent, 0);
    const totalLinkedIn = list.reduce((sum, r) => sum + r.linkedInTouches, 0);
    const totalOutreach = totalCalls + totalEmails + totalLinkedIn;
    const totalBooked = list.reduce((sum, r) => sum + r.appointmentsBooked, 0);
    const totalTarget = list.reduce((sum, r) => sum + r.quotaTarget, 0);
    const totalDnc = list.reduce((sum, r) => sum + r.dncFlagged, 0);
    const totalNotInterested = list.reduce((sum, r) => sum + r.notInterested, 0);
    const totalCallbacks = list.reduce((sum, r) => sum + r.callbacksScheduled, 0);
    const avgConnect = list.length > 0 ? (list.reduce((sum, r) => sum + r.connectRate, 0) / list.length).toFixed(1) : '0';
    const avgScore = list.length > 0 ? Math.round(list.reduce((sum, r) => sum + r.qaSparringScore, 0) / list.length) : 0;
    const quotaPct = totalTarget > 0 ? ((totalBooked / totalTarget) * 100).toFixed(1) : '0';

    return {
      totalOutreach,
      totalCalls,
      totalEmails,
      totalLinkedIn,
      totalBooked,
      totalTarget,
      quotaPct,
      totalDnc,
      totalNotInterested,
      totalCallbacks,
      avgConnect,
      avgScore
    };
  }, [filteredReps]);

  // Export CSV Report Action
  const handleExportCSV = () => {
    const headers = ['Rep Name', 'Campaign', 'Calls Made', 'Connect Rate %', 'Emails Sent', 'LinkedIn Touches', 'Booked', 'Quota Target', 'Attainment %', 'DNC', 'Not Interested', 'Callbacks', 'QA Score'];
    const rows = filteredReps.map(r => [
      `"${r.name}"`,
      `"${r.campaign}"`,
      r.callsMade,
      `${r.connectRate}%`,
      r.emailsSent,
      r.linkedInTouches,
      r.appointmentsBooked,
      r.quotaTarget,
      `${r.quotaAttainment}%`,
      r.dncFlagged,
      r.notInterested,
      r.callbacksScheduled,
      r.qaSparringScore
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `appointmently_sdr_performance_${timePeriod}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen bg-[#F2F0EF] text-[#222021] font-sans antialiased overflow-hidden">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <GlobalTopHeader />

        <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* TOP BANNER & TIMEFRAME SELECTOR */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-[#222021]/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#ED1C24] text-white">
                  <BarChart3 className="h-5 w-5" />
                </span>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#ED1C24]">
                  EXECUTIVE & REP PERFORMANCE INTELLIGENCE
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#222021] tracking-tight mt-1">
                SDR Activities & Conversion Dashboard
              </h1>
              <p className="text-xs text-[#6b6968] mt-0.5">
                Real-time tracking of calls, emails, appointments booked, DNC compliance, and carry-over follow-ups.
              </p>
            </div>

            {/* Timeframe Selector Pills (Daily, Weekly, Monthly, Quarterly, Yearly) */}
            <div className="flex items-center gap-1.5 p-1 bg-white border border-[#222021]/15 rounded-xl shadow-2xs self-start lg:self-auto overflow-x-auto scrollbar-none">
              {(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'] as TimePeriod[]).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setTimePeriod(period)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                    timePeriod === period
                      ? 'bg-[#ED1C24] text-white shadow-xs font-black'
                      : 'text-[#6b6968] hover:text-[#222021] hover:bg-slate-100'
                  }`}
                >
                  {period === 'daily' ? 'Today' : period === 'weekly' ? 'This Week' : period === 'monthly' ? 'This Month' : period === 'quarterly' ? 'Quarterly' : 'Yearly'}
                </button>
              ))}

              <button
                type="button"
                onClick={handleExportCSV}
                title="Export Data as CSV"
                className="ml-2 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </div>
          </div>

          {/* GRANULAR FILTER TOOLBAR */}
          <div className="bg-white border border-[#222021]/15 rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#222021]">
              <div className="flex items-center gap-1.5">
                <Filter className="h-4 w-4 text-[#ED1C24]" />
                <span>Multi-Dimensional Data Filters</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedRepFilter('all');
                  setSelectedCampaignFilter('all');
                  setSelectedDispositionFilter('all');
                  setSearchRepQuery('');
                }}
                className="text-[11px] font-mono text-slate-500 hover:text-[#ED1C24] underline cursor-pointer"
              >
                Reset Filters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Filter 1: By Rep */}
              <div>
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide block mb-1">
                  Filter by SDR Rep:
                </label>
                <select
                  value={selectedRepFilter}
                  onChange={(e) => setSelectedRepFilter(e.target.value)}
                  className="w-full bg-[#F2F0EF] border border-[#222021]/15 rounded-xl px-3 py-2 text-xs font-bold text-[#222021] focus:outline-none focus:bg-white focus:border-[#ED1C24]"
                >
                  <option value="all">All Reps (Entire Team)</option>
                  <option value="rep_1">Alex Mercer (Senior SDR)</option>
                  <option value="rep_2">Sarah Jenkins (Setter)</option>
                  <option value="rep_3">David Vance (Rep)</option>
                  <option value="rep_4">Elena Gomez (Specialist)</option>
                  <option value="rep_5">Marcus Brody (Junior SDR)</option>
                </select>
              </div>

              {/* Filter 2: By Campaign */}
              <div>
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide block mb-1">
                  Filter by Campaign / Tenant:
                </label>
                <select
                  value={selectedCampaignFilter}
                  onChange={(e) => setSelectedCampaignFilter(e.target.value)}
                  className="w-full bg-[#F2F0EF] border border-[#222021]/15 rounded-xl px-3 py-2 text-xs font-bold text-[#222021] focus:outline-none focus:bg-white focus:border-[#ED1C24]"
                >
                  <option value="all">All Campaigns</option>
                  <option value="Apex Global BPO">Apex Global BPO</option>
                  <option value="Enterprise Outbound">Enterprise Outbound</option>
                  <option value="FinTech Call Center">FinTech Call Center</option>
                  <option value="Medical BPO">Medical BPO</option>
                </select>
              </div>

              {/* Filter 3: By Disposition */}
              <div>
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide block mb-1">
                  Filter by Disposition:
                </label>
                <select
                  value={selectedDispositionFilter}
                  onChange={(e) => setSelectedDispositionFilter(e.target.value)}
                  className="w-full bg-[#F2F0EF] border border-[#222021]/15 rounded-xl px-3 py-2 text-xs font-bold text-[#222021] focus:outline-none focus:bg-white focus:border-[#ED1C24]"
                >
                  <option value="all">All Outcomes</option>
                  <option value="Meeting Booked">Meeting Booked</option>
                  <option value="DNC Quarantined">DNC Quarantined</option>
                  <option value="Not Interested">Not Interested</option>
                  <option value="Callback Scheduled">Callback / Carry-Over</option>
                </select>
              </div>

              {/* Filter 4: Search Box */}
              <div>
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide block mb-1">
                  Search Rep or Account:
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchRepQuery}
                    onChange={(e) => setSearchRepQuery(e.target.value)}
                    placeholder="e.g. Alex, Apex, FinTech..."
                    className="w-full pl-9 pr-3 py-2 bg-[#F2F0EF] border border-[#222021]/15 rounded-xl text-xs font-bold text-[#222021] focus:outline-none focus:bg-white focus:border-[#ED1C24]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TOP 5 MASTER METRICS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Card 1: Appointments Booked */}
            <div className="bg-white border-2 border-emerald-500/30 rounded-2xl p-4 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                <span>APPOINTMENTS BOOKED</span>
                <span className="p-1 rounded-lg bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
              </div>
              <div className="text-3xl font-black text-[#222021] mt-2">
                {aggregateStats.totalBooked}
                <span className="text-xs font-bold text-slate-400 ml-1">/ {aggregateStats.totalTarget} target</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 mt-2">
                <span className="font-mono bg-emerald-100 px-1.5 py-0.5 rounded">
                  {aggregateStats.quotaPct}% quota
                </span>
                <span>• 88.9% hold rate</span>
              </div>
            </div>

            {/* Card 2: Total Activities */}
            <div className="bg-white border border-[#222021]/15 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>TOTAL OUTREACH</span>
                <span className="p-1 rounded-lg bg-slate-100 text-slate-700">
                  <PhoneCall className="h-4 w-4" />
                </span>
              </div>
              <div className="text-3xl font-black text-[#222021] mt-2">
                {aggregateStats.totalOutreach}
              </div>
              <div className="text-[11px] font-mono text-slate-500 mt-2 truncate">
                {aggregateStats.totalCalls} Dials • {aggregateStats.totalEmails} Emails • {aggregateStats.totalLinkedIn} LI
              </div>
            </div>

            {/* Card 3: DNC Quarantine Compliance */}
            <div className="bg-white border-2 border-red-500/30 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-red-900">
                <span>DNC QUARANTINED</span>
                <span className="p-1 rounded-lg bg-red-100 text-red-700">
                  <Ban className="h-4 w-4" />
                </span>
              </div>
              <div className="text-3xl font-black text-red-600 mt-2">
                {aggregateStats.totalDnc}
              </div>
              <div className="text-[11px] font-mono text-red-700 mt-2 flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" />
                <span>100% Org-wide Suppression</span>
              </div>
            </div>

            {/* Card 4: Not Interested / Disqualified */}
            <div className="bg-white border border-[#222021]/15 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>NOT INTERESTED</span>
                <span className="p-1 rounded-lg bg-slate-100 text-slate-700">
                  <ThumbsDown className="h-4 w-4" />
                </span>
              </div>
              <div className="text-3xl font-black text-[#222021] mt-2">
                {aggregateStats.totalNotInterested}
              </div>
              <div className="text-[11px] font-mono text-slate-500 mt-2">
                Root: 48% Broker Locked • 32% Budget
              </div>
            </div>

            {/* Card 5: Carry-Over / Follow-ups Due */}
            <div className="bg-white border-2 border-purple-500/30 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                <span>CARRY-OVER / FOLLOW-UPS</span>
                <span className="p-1 rounded-lg bg-purple-100 text-purple-700">
                  <CalendarClock className="h-4 w-4" />
                </span>
              </div>
              <div className="text-3xl font-black text-purple-900 mt-2">
                {aggregateStats.totalCallbacks}
              </div>
              <div className="text-[11px] font-mono text-purple-700 mt-2">
                Active in Carry-Over Queue for Next Week
              </div>
            </div>
          </div>

          {/* REPS PERFORMANCE ROSTER TABLE */}
          <div className="bg-white border border-[#222021]/15 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-[#222021] tracking-tight flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#ED1C24]" />
                  <span>SDR Reps Leaderboard & Activity Breakdown</span>
                </h2>
                <p className="text-xs text-[#6b6968] mt-0.5">
                  Performance across calls, email dispatches, appointments booked, and compliance scores.
                </p>
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-bold">Sort By:</span>
                <button
                  type="button"
                  onClick={() => {
                    if (sortField === 'appointmentsBooked') setSortAsc(!sortAsc);
                    else { setSortField('appointmentsBooked'); setSortAsc(false); }
                  }}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer ${
                    sortField === 'appointmentsBooked' ? 'bg-[#ED1C24] text-white border-[#ED1C24]' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  Bookings {sortField === 'appointmentsBooked' ? (sortAsc ? '↑' : '↓') : ''}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (sortField === 'callsMade') setSortAsc(!sortAsc);
                    else { setSortField('callsMade'); setSortAsc(false); }
                  }}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer ${
                    sortField === 'callsMade' ? 'bg-[#ED1C24] text-white border-[#ED1C24]' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  Calls {sortField === 'callsMade' ? (sortAsc ? '↑' : '↓') : ''}
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white font-mono text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3.5">Rep Name & Campaign</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-right">Dials Made</th>
                    <th className="py-3 px-3 text-right">Connect %</th>
                    <th className="py-3 px-3 text-right">Emails</th>
                    <th className="py-3 px-3 text-right">LinkedIn</th>
                    <th className="py-3 px-3.5 text-right font-black text-emerald-400">Booked</th>
                    <th className="py-3 px-3 text-right">Quota %</th>
                    <th className="py-3 px-3 text-right text-red-300">DNC</th>
                    <th className="py-3 px-3 text-right">Not Int.</th>
                    <th className="py-3 px-3 text-right text-purple-300">Callbacks</th>
                    <th className="py-3 px-3 text-center">QA Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-sans">
                  {filteredReps.map((r, idx) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-mono font-bold flex items-center justify-center text-[10px] shadow-2xs">
                            {r.avatar}
                          </div>
                          <div>
                            <div className="font-bold text-[#222021] flex items-center gap-1.5">
                              <span>{r.name}</span>
                              {idx === 0 && (
                                <span className="text-[9px] bg-amber-100 text-amber-900 font-mono font-bold px-1.5 py-0.2 rounded border border-amber-300">
                                  👑 TOP
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {r.campaign} • {r.role}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          r.status === 'In Call'
                            ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                            : r.status === 'Online'
                            ? 'bg-blue-100 text-blue-800'
                            : r.status === 'Break'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            r.status === 'In Call' ? 'bg-emerald-600' : r.status === 'Online' ? 'bg-blue-600' : 'bg-slate-400'
                          }`} />
                          {r.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                        {r.callsMade}
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-semibold text-slate-700">
                        {r.connectRate}%
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono text-slate-700">
                        {r.emailsSent}
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono text-slate-700">
                        {r.linkedInTouches}
                      </td>

                      <td className="py-3.5 px-3.5 text-right font-mono font-black text-base text-emerald-700">
                        {r.appointmentsBooked}
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono">
                        <span className={`px-1.5 py-0.5 rounded font-bold ${
                          r.quotaAttainment >= 90 ? 'bg-emerald-100 text-emerald-800' : r.quotaAttainment >= 70 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {r.quotaAttainment}%
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-bold text-red-600">
                        {r.dncFlagged}
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                        {r.notInterested}
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-bold text-purple-700">
                        {r.callbacksScheduled}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className="font-mono text-xs font-black bg-slate-100 text-slate-900 px-2 py-0.5 rounded border border-slate-300">
                          {r.qaSparringScore}/100
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TWO-COLUMN LOWER SECTION: CADENCE CONVERSION FUNNEL & LIVE ACTIVITY STREAM */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: 27-Day Cadence Funnel Analysis (6 cols) */}
            <div className="lg:col-span-6 bg-white border border-[#222021]/15 rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-[#222021] tracking-tight">
                    Multi-Channel Cadence Conversion Funnel
                  </h3>
                  <p className="text-xs text-[#6b6968]">
                    Progression and conversion drop-off across the 21-day blueprint.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 font-bold">
                  {aggregateStats.totalBooked} Total Bookings
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { stage: 'Day 1: Initial Hook (Email #1 & LI #1)', count: aggregateStats.totalOutreach, pct: '100%', drop: 'Baseline' },
                  { stage: 'Day 2: The Phone Push (Phone #1)', count: Math.round(aggregateStats.totalOutreach * 0.72), pct: '72%', drop: '-28%' },
                  { stage: 'Day 3: Voicemail Drop + Synergy Email #2', count: Math.round(aggregateStats.totalOutreach * 0.48), pct: '48%', drop: '-24%' },
                  { stage: 'Day 7: Value Add 90s Teardown (Email #3)', count: Math.round(aggregateStats.totalOutreach * 0.35), pct: '35%', drop: '-13%' },
                  { stage: 'Day 9: Shifted Phone Call (Phone #3)', count: Math.round(aggregateStats.totalOutreach * 0.24), pct: '24%', drop: '-11%' },
                  { stage: 'Day 15: Pivot Angle Reverse Sell (Phone #4)', count: Math.round(aggregateStats.totalOutreach * 0.16), pct: '16%', drop: '-8%' },
                  { stage: 'Executive Meeting Locked & Verified', count: aggregateStats.totalBooked, pct: `${aggregateStats.quotaPct}%`, drop: 'Target Hit' },
                ].map((st, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#222021]">{st.stage}</span>
                      <span className="font-mono text-slate-500 font-semibold">{st.count} prospects ({st.pct})</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          i === 6 ? 'bg-emerald-500' : 'bg-[#ED1C24]'
                        }`}
                        style={{ width: st.pct.includes('%') ? st.pct : '20%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Live Activity & Telemetry Feed (6 cols) */}
            <div className="lg:col-span-6 bg-white border border-[#222021]/15 rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-[#222021] tracking-tight">
                    Live Telemetry & Activity Stream
                  </h3>
                  <p className="text-xs text-[#6b6968]">
                    Real-time audit log of dials, emails, and dispositions.
                  </p>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="space-y-3 pt-1">
                {RECENT_ACTIVITY_STREAM.map((act) => (
                  <div key={act.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <strong className="text-slate-900">{act.repName}</strong>
                        <span className="text-slate-400">→</span>
                        <span className="font-semibold text-slate-800">{act.prospectName} ({act.companyName})</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{act.timestamp}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-0.5">
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        act.disposition === 'Meeting Booked'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : act.disposition === 'DNC Quarantined'
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : act.disposition === 'Callback Scheduled'
                          ? 'bg-purple-100 text-purple-800 border border-purple-300'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {act.disposition}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Channel: {act.channel}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-snug pt-1">
                      {act.notesSnippet}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
