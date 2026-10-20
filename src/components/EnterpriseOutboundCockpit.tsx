'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { 
  Radio, 
  Mic, 
  MicOff, 
  Volume2, 
  Search, 
  Phone, 
  Mail, 
  Share2, 
  Copy, 
  Check, 
  Send, 
  Clock, 
  CheckCircle, 
  ShieldAlert, 
  Sparkles, 
  Layers, 
  User, 
  Building, 
  Briefcase, 
  DollarSign, 
  ChevronDown, 
  Calendar, 
  PhoneForwarded, 
  PhoneMissed, 
  XCircle, 
  SlidersHorizontal,
  Flame,
  Zap,
  Award,
  Database,
  FileSpreadsheet,
  Keyboard,
  X
} from 'lucide-react';
import { MicStreamer } from '@/lib/audio/micStream';
import { ScribeSocketClient } from '@/lib/audio/scribeSocket';
import { ArmRebuttalResponse, Lead, TranscriptEntry } from '@/types';
import { CadenceGenerator } from '@/lib/cadenceGenerator';

interface SoftwareLead {
  id: string;
  name: string;
  company: string;
  title: string;
  headcount: string;
  cadenceStep: string;
  localTime: string;
  phone: string;
  email: string;
  currentBpo: string;
  techStack: string;
  painPoint: string;
  status: 'new' | 'contacted' | 'booked' | 'unqualified';
}

const DEFAULT_LEADS: SoftwareLead[] = [
  {
    id: 'lead-101',
    name: 'Jonathan Duarte',
    company: 'OmniCloud Technologies',
    title: 'VP of Demand Generation',
    headcount: '150-300 HC',
    cadenceStep: 'Day 3: Call 2',
    localTime: 'EST - 10:45 AM',
    phone: '+1 (415) 890-1284',
    email: 'jduarte@omnicloud.io',
    currentBpo: 'Titan BPO (Manila Team)',
    techStack: 'Salesforce & Apollo',
    painPoint: '30% drop-off on discovery hold rates',
    status: 'new'
  },
  {
    id: 'lead-102',
    name: 'Elena Rostova',
    company: 'FinLeap Payments',
    title: 'Head of Sales Development',
    headcount: '50-100 HC',
    cadenceStep: 'Day 1: Cold Touch',
    localTime: 'CST - 9:45 AM',
    phone: '+1 (212) 440-9921',
    email: 'elena.rostova@finleap.com',
    currentBpo: 'Internal 6-person SDR team',
    techStack: 'HubSpot & Salesloft',
    painPoint: 'Rep ramp time & objection handling',
    status: 'new'
  },
  {
    id: 'lead-103',
    name: 'Arthur Sterling',
    company: 'Sterling Freight Logistics',
    title: 'Chief Financial Officer',
    headcount: '200-500 HC',
    cadenceStep: 'Day 5: Executive Follow-up',
    localTime: 'EST - 10:45 AM',
    phone: '+1 (312) 555-0199',
    email: 'asterling@sterlinglogistics.com',
    currentBpo: 'Offshore Vendor Retainer',
    techStack: 'Oracle Netsuite & Outreach',
    painPoint: 'Budget freeze; 15% SG&A reduction',
    status: 'contacted'
  },
  {
    id: 'lead-104',
    name: 'Samantha Cross',
    company: 'Sentinel Defense Cyber',
    title: 'Director of Demand Generation',
    headcount: '80-150 HC',
    cadenceStep: 'Day 2: Value Reframe',
    localTime: 'PST - 7:45 AM',
    phone: '+1 (415) 670-3490',
    email: 'scross@sentinelcyber.com',
    currentBpo: 'Previously burned by agency',
    techStack: 'Outreach & ZoomInfo',
    painPoint: 'Unqualified lead spam & burned domains',
    status: 'new'
  },
  {
    id: 'lead-105',
    name: 'David Reynolds',
    company: 'Apex Cloud Systems',
    title: 'Director of Business Development',
    headcount: '100-250 HC',
    cadenceStep: 'Day 4: Benchmark Pitch',
    localTime: 'EST - 10:45 AM',
    phone: '+1 (617) 490-2211',
    email: 'dreynolds@apexcloud.com',
    currentBpo: 'Incumbent Agency (3 years)',
    techStack: 'Salesforce & Gong',
    painPoint: 'Incumbent complacency on pipeline quota',
    status: 'new'
  }
];

export default function EnterpriseOutboundCockpit() {
  // Navigation & Lead Selection
  const [leadQueue, setLeadQueue] = useState<SoftwareLead[]>(DEFAULT_LEADS);
  const [selectedLeadId, setSelectedLeadId] = useState<string>(DEFAULT_LEADS[0].id);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<'call' | 'email' | 'linkedin'>('call');
  const [campaign, setCampaign] = useState('Enterprise Outbound Q4');
  const [repStatus, setRepStatus] = useState<'on_dial' | 'break' | 'wrap_up'>('on_dial');
  const [showHotkeysModal, setShowHotkeysModal] = useState(false);

  // Active Lead Data
  const activeLead = leadQueue.find(l => l.id === selectedLeadId) || leadQueue[0];

  // Checklist & Disposition State
  const [qualifications, setQualifications] = useState({
    budgetConfirmed: false,
    painPointValidated: false,
    dmIdentified: true
  });
  const [callNotes, setCallNotes] = useState('');
  const [activeDisposition, setActiveDisposition] = useState<string | null>(null);

  // Audio Telephony & AI Boris HUD State
  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const [interimText, setInterimText] = useState('');
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([
    {
      id: 'init-1',
      speaker: 'system',
      text: 'AI Boris Copilot initialized. Scribe v2 engine standing by on 16kHz audio channel.',
      timestamp: '10:45:01'
    }
  ]);
  const [activeRebuttal, setActiveRebuttal] = useState<ArmRebuttalResponse | null>({
    has_objection: true,
    objection_type: 'Competitor / Incumbent Lock-in',
    acknowledge: 'I completely understand—you have an established rhythm with them and they know your brand.',
    respond: 'Most teams we work with kept their incumbent for tier-1 routine tasks while leveraging Boris to fix high-value conversion drop-offs.',
    move: 'Would you be against a 10-minute diagnostic to benchmark your current SLA costs against peers?',
    latency_ms: 142,
    source: 'vector_db'
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  const micStreamerRef = useRef<MicStreamer | null>(null);
  const scribeClientRef = useRef<ScribeSocketClient | null>(null);
  const transcriptScrollRef = useRef<HTMLDivElement>(null);
  const speechRecRef = useRef<any>(null);

  // Auto-scroll transcript ticker
  useEffect(() => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTop = transcriptScrollRef.current.scrollHeight;
    }
  }, [transcripts, interimText]);

  // Objection Trigger
  const triggerRebuttal = useCallback(async (phrase: string) => {
    if (!phrase || phrase.trim().length < 3) return;

    try {
      const res = await fetch('/api/rebuttal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: phrase, campaignId: campaign }),
      });

      if (res.ok) {
        const data: ArmRebuttalResponse = await res.json();
        if (data.has_objection) {
          setActiveRebuttal(data);
        }
      }
    } catch (err) {
      console.warn('Rebuttal trigger error:', err);
    }
  }, [campaign]);

  // Audio Controls
  const startListening = async () => {
    setAudioError(null);
    try {
      const scribeClient = new ScribeSocketClient({
        apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '',
        onInterimTranscript: (text) => setInterimText(text),
        onFinalTranscript: (text) => {
          setInterimText('');
          const newEntry: TranscriptEntry = {
            id: String(Date.now()),
            speaker: 'prospect',
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          };
          setTranscripts(prev => [...prev, newEntry]);
          triggerRebuttal(text);
        }
      });
      scribeClientRef.current = scribeClient;
      await scribeClient.connect();

      const micStreamer = new MicStreamer({
        sampleRate: 16000,
        chunkDurationMs: 200,
        onVolumeChange: (vol) => setVolume(vol),
        onPcmChunk: (chunk) => scribeClient.sendPcmChunk(chunk),
        onError: (err) => {
          setAudioError(err.message || 'Mic access denied');
          setIsListening(false);
        }
      });
      micStreamerRef.current = micStreamer;
      await micStreamer.start();

      // Companion browser speech recognition
      if (typeof window !== 'undefined') {
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRec) {
          try {
            const rec = new SpeechRec();
            rec.continuous = true;
            rec.interimResults = true;
            rec.lang = 'en-US';
            rec.onresult = (e: any) => {
              let cur = '';
              for (let i = e.resultIndex; i < e.results.length; ++i) {
                const piece = e.results[i][0].transcript;
                if (e.results[i].isFinal) {
                  setInterimText('');
                  const clean = piece.trim();
                  if (clean) {
                    setTranscripts(prev => [
                      ...prev,
                      {
                        id: String(Date.now()),
                        speaker: 'prospect',
                        text: clean,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                      }
                    ]);
                    triggerRebuttal(clean);
                  }
                } else {
                  cur += piece;
                }
              }
              if (cur) setInterimText(cur);
            };
            rec.start();
            speechRecRef.current = rec;
          } catch {}
        }
      }

      setIsListening(true);
    } catch (err: any) {
      setAudioError(err.message || 'Failed to start mic stream');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (micStreamerRef.current) {
      micStreamerRef.current.stop();
      micStreamerRef.current = null;
    }
    if (scribeClientRef.current) {
      scribeClientRef.current.disconnect();
      scribeClientRef.current = null;
    }
    if (speechRecRef.current) {
      try { speechRecRef.current.stop(); } catch {}
      speechRecRef.current = null;
    }
    setIsListening(false);
    setVolume(0);
    setInterimText('');
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const setDisposition = (label: string) => {
    setActiveDisposition(label);
    setLeadQueue(prev => prev.map(l => l.id === activeLead.id ? { ...l, status: label === 'Meeting Booked' ? 'booked' : 'contacted' } : l));
    // Advance to next lead
    const currentIndex = leadQueue.findIndex(l => l.id === activeLead.id);
    if (currentIndex < leadQueue.length - 1) {
      setSelectedLeadId(leadQueue[currentIndex + 1].id);
    }
  };

  const filteredLeads = leadQueue.filter(l => 
    `${l.name} ${l.company} ${l.title}`.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-100 font-sans text-slate-800 antialiased selection:bg-indigo-100">
      
      {/* =========================================================================
          1. TOP APPLICATION UTILITY BAR (h-12 border-b border-slate-200 bg-white)
          ========================================================================= */}
      <header className="h-12 border-b border-slate-200 bg-white px-4 flex items-center justify-between shrink-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        
        {/* Left: Brand + Environment */}
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
            B
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[13px] tracking-tight text-slate-900">
              BORIS // BPO OUTBOUND ENGINE
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-mono font-semibold">
              v1.0 MVP
            </span>
          </div>

          <div className="h-4 w-[1px] bg-slate-200 mx-2" />

          {/* Module Navigation Tabs */}
          <nav className="flex items-center gap-1 text-[12px] font-semibold text-slate-600">
            <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-bold">
              Cockpit
            </span>
            <Link href="/sparring" className="px-2.5 py-1 rounded-md hover:bg-slate-100 text-slate-600 transition-colors">
              Sparring Arena
            </Link>
            <Link href="/certification" className="px-2.5 py-1 rounded-md hover:bg-slate-100 text-slate-600 transition-colors">
              Certification
            </Link>
            <Link href="/admin/campaigns/enterprise-outbound/leads" className="px-2.5 py-1 rounded-md hover:bg-slate-100 text-slate-600 transition-colors">
              Leads
            </Link>
            <Link href="/admin/frameworks" className="px-2.5 py-1 rounded-md hover:bg-slate-100 text-slate-600 transition-colors">
              Playbooks
            </Link>
            <Link href="/admin/reps" className="px-2.5 py-1 rounded-md hover:bg-slate-100 text-slate-600 transition-colors">
              Roster
            </Link>
          </nav>
        </div>

        {/* Center: Campaign & ICP Indicator */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px]">
            <span className="text-slate-400 font-semibold uppercase">Campaign:</span>
            <select
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="Enterprise Outbound Q4">Enterprise Outbound Q4</option>
              <option value="Fintech Scaleups">Fintech Scaleups ($50M+ ARR)</option>
              <option value="Healthcare Systems">Enterprise Healthcare Systems</option>
            </select>
          </div>
          <span className="text-[11px] font-mono font-medium px-2 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
            ICP: B2B Mid-Market (50-250 HC)
          </span>
        </div>

        {/* Right: Audio Latency + Rep Status + Shortcuts */}
        <div className="flex items-center gap-3">
          {/* Audio Scribe Status */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px]">
            <span className={`h-2 w-2 rounded-full ${isListening ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span className="font-semibold text-slate-700">
              {isListening ? 'LIVE MIC (16kHz Scribe v2)' : 'MIC STANDBY'}
            </span>
            <span className="text-slate-400 font-mono text-[10px]">~142ms</span>
          </div>

          {/* Rep Status Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-semibold">
            <button
              onClick={() => setRepStatus('on_dial')}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                repStatus === 'on_dial' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              On Dial
            </button>
            <button
              onClick={() => setRepStatus('break')}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                repStatus === 'break' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Break
            </button>
          </div>

          {/* Keyboard Shortcuts Trigger */}
          <button
            onClick={() => setShowHotkeysModal(true)}
            title="Keyboard Shortcuts (⌘K)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
          >
            <Keyboard className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* =========================================================================
          2. MAIN WORKSPACE: THREE-PANE APP SHELL (Zero window scroll)
          ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* =======================================================================
            LEFT PANE: LEAD QUEUE & CADENCE STREAM (w-72 border-r border-slate-200)
            ======================================================================= */}
        <aside className="w-72 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0 overflow-hidden">
          
          {/* Search Header */}
          <div className="p-2.5 border-b border-slate-200 bg-white">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search leads, accounts..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-[12px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
              <span className="font-semibold uppercase tracking-wider">Queue: {filteredLeads.length} Leads</span>
              <span className="font-mono text-indigo-600 font-bold">Auto-Dial Ready</span>
            </div>
          </div>

          {/* Scrollable Lead List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-200">
            {filteredLeads.map((lead) => {
              const isSelected = lead.id === activeLead.id;
              return (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLeadId(lead.id)}
                  className={`p-2.5 cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-white border-l-4 border-indigo-600 shadow-xs' 
                      : 'hover:bg-slate-100/80 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className={`text-[12px] font-bold leading-tight ${isSelected ? 'text-indigo-950 font-extrabold' : 'text-slate-900'}`}>
                      {lead.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {lead.localTime.split('-')[0].trim()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mt-0.5 truncate">
                    <Building className="h-3 w-3 text-slate-400 shrink-0" />
                    <span className="truncate font-medium">{lead.company}</span>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200/50 text-[10px]">
                    <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100 font-mono">
                      {lead.cadenceStep}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded font-bold uppercase font-mono ${
                      lead.status === 'booked' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      lead.status === 'contacted' ? 'bg-slate-200 text-slate-700' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {lead.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* =======================================================================
            CENTER PANE: OPERATIONAL OUTBOUND COCKPIT (flex-1 bg-white)
            ======================================================================= */}
        <main className="flex-1 bg-white flex flex-col overflow-hidden min-w-0">
          
          {/* Prospect Context Banner */}
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {activeLead.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-bold text-slate-900">{activeLead.name}</h1>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200 font-medium">
                    {activeLead.title}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5 font-mono">
                  <span>{activeLead.phone}</span>
                  <span>•</span>
                  <span>{activeLead.email}</span>
                  <span>•</span>
                  <span>{activeLead.headcount}</span>
                </div>
              </div>
            </div>

            {/* Context Injected Badges */}
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-[11px] flex items-center gap-1.5 shadow-2xs">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Incumbent:</span>
                <span className="text-slate-800 font-bold">{activeLead.currentBpo}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-[11px] flex items-center gap-1.5 shadow-2xs">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Tech Stack:</span>
                <span className="text-indigo-700 font-bold">{activeLead.techStack}</span>
              </div>
            </div>
          </div>

          {/* Channel Tabs */}
          <div className="px-5 py-2 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setSelectedChannel('call')}
                className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                  selectedChannel === 'call' ? 'bg-white text-indigo-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Phone className="h-3.5 w-3.5" />
                <span>[1] Cold Call</span>
              </button>
              <button
                onClick={() => setSelectedChannel('email')}
                className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                  selectedChannel === 'email' ? 'bg-white text-indigo-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mail className="h-3.5 w-3.5" />
                <span>[2] Email (1-Click)</span>
              </button>
              <button
                onClick={() => setSelectedChannel('linkedin')}
                className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                  selectedChannel === 'linkedin' ? 'bg-white text-indigo-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>[3] LinkedIn Touchpoint</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 font-medium">
              Target Bottleneck: <strong className="text-slate-800">{activeLead.painPoint}</strong>
            </div>
          </div>

          {/* Operational Script Canvas (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 font-sans text-slate-800">
            
            {/* Dynamic Interactive Script Block */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Cadence Step Talk Track (Opener & Permission Hook)
                </span>
                <span className="text-[10px] text-indigo-600 font-mono font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  Tokenized Live Injection
                </span>
              </div>

              {selectedChannel === 'call' && (
                <div className="text-sm leading-relaxed text-slate-800 space-y-2.5">
                  <p>
                    "Hey <span className="bg-indigo-50 text-indigo-900 font-bold px-1.5 py-0.5 rounded border border-indigo-100">{activeLead.name.split(' ')[0]}</span>, know I caught you out of the blue."
                  </p>
                  <p>
                    "I noticed your team at <span className="bg-indigo-50 text-indigo-900 font-bold px-1.5 py-0.5 rounded border border-indigo-100">{activeLead.company}</span> is running <span className="bg-amber-50 text-amber-900 font-bold px-1.5 py-0.5 rounded border border-amber-100">{activeLead.techStack}</span>—do you have 20 seconds for me to tell you why I called, and you can tell me if it makes sense to keep talking?"
                  </p>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1 mt-2">
                    <span className="font-bold text-slate-900 uppercase text-[10px] block">
                      Consultative Disqualification Question:
                    </span>
                    <p className="italic">
                      "Most leaders in {activeLead.title} roles tell us that despite having {activeLead.currentBpo}, their biggest leak is still {activeLead.painPoint}. Are your reps experiencing that bottleneck, or is outbound already exceeding quota?"
                    </p>
                  </div>
                </div>
              )}

              {selectedChannel === 'email' && (
                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="font-bold text-slate-900">
                    Subject: {activeLead.company} &lt;&gt; {activeLead.techStack} outbound bottleneck
                  </div>
                  <p className="text-slate-700 whitespace-pre-line bg-slate-50 p-3 rounded-lg border border-slate-200">
                    Hi {activeLead.name.split(' ')[0]},{'\n\n'}
                    Noticed {activeLead.company} is scaling outbound with {activeLead.techStack}. Typically when teams partner with {activeLead.currentBpo}, routine volume is fine, but {activeLead.painPoint} causes 30% of discovery meetings to drop off.{'\n\n'}
                    We engineered Boris AI to give outbound SDRs sub-second live objection handling on live calls, doubling qualification hold-rates.{'\n\n'}
                    Open to a 5-minute diagnostic to benchmark your current cost-per-discovery next Thursday?
                  </p>
                  <button
                    onClick={() => copyToClipboard(`Subject: ${activeLead.company} <> ${activeLead.techStack} outbound bottleneck\n\nHi ${activeLead.name.split(' ')[0]},\n\nNoticed ${activeLead.company} is scaling outbound with ${activeLead.techStack}. Typically when teams partner with ${activeLead.currentBpo}, routine volume is fine, but ${activeLead.painPoint} causes 30% of discovery meetings to drop off.\n\nWe engineered Boris AI to give outbound SDRs sub-second live objection handling on live calls, doubling qualification hold-rates.\n\nOpen to a 5-minute diagnostic to benchmark your current cost-per-discovery next Thursday?`, 'email-copy')}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 transition-colors inline-flex items-center gap-1.5"
                  >
                    {copiedKey === 'email-copy' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'email-copy' ? 'Copied' : 'Copy 1-Click Email'}</span>
                  </button>
                </div>
              )}

              {selectedChannel === 'linkedin' && (
                <div className="space-y-3 text-xs leading-relaxed">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    LinkedIn InMail & Connection Note (&lt;280 chars)
                  </span>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-800">
                    "Hi {activeLead.name.split(' ')[0]} - came across your work leading {activeLead.title} at {activeLead.company}. Curious how your team is optimizing {activeLead.painPoint} with {activeLead.techStack}. Would love to connect!"
                  </div>
                  <button
                    onClick={() => copyToClipboard(`Hi ${activeLead.name.split(' ')[0]} - came across your work leading ${activeLead.title} at ${activeLead.company}. Curious how your team is optimizing ${activeLead.painPoint} with ${activeLead.techStack}. Would love to connect!`, 'li-copy')}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 transition-colors inline-flex items-center gap-1.5"
                  >
                    {copiedKey === 'li-copy' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'li-copy' ? 'Copied' : 'Copy Connection Note'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Qualifying Criteria Checklist & Scratchpad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Checklist */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Mandatory Discovery Criteria
                </span>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={qualifications.dmIdentified}
                    onChange={(e) => setQualifications(prev => ({ ...prev, dmIdentified: e.target.checked }))}
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  <span>Decision Maker verified ({activeLead.title})</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={qualifications.painPointValidated}
                    onChange={(e) => setQualifications(prev => ({ ...prev, painPointValidated: e.target.checked }))}
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  <span>Bottleneck validated ({activeLead.painPoint})</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={qualifications.budgetConfirmed}
                    onChange={(e) => setQualifications(prev => ({ ...prev, budgetConfirmed: e.target.checked }))}
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  <span>Incumbent contract timeline discussed</span>
                </label>
              </div>

              {/* Rep Call Scratchpad */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                  CRM Quick Notes
                </span>
                <textarea
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="Notes from discovery call (e.g., uses Manila BPO, contract ends Dec)..."
                  className="w-full flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* =====================================================================
              BOTTOM FIXED DISPOSITION BAR (h-14 border-t border-slate-200 bg-slate-50)
              ===================================================================== */}
          <footer className="h-14 border-t border-slate-200 px-5 flex items-center justify-between bg-slate-50 shrink-0">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                Disposition:
              </span>
              <button
                onClick={() => setDisposition('Meeting Booked')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>[1] Meeting Booked (Space)</span>
              </button>
              <button
                onClick={() => setDisposition('Gatekeeper')}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs shadow-xs transition-colors"
              >
                [2] Gatekeeper
              </button>
              <button
                onClick={() => setDisposition('Left Voicemail')}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs shadow-xs transition-colors"
              >
                [3] Left VM
              </button>
              <button
                onClick={() => setDisposition('Disqualified')}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs shadow-xs transition-colors"
              >
                [4] Disqualified
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => {
                  const idx = leadQueue.findIndex(l => l.id === activeLead.id);
                  if (idx < leadQueue.length - 1) setSelectedLeadId(leadQueue[idx + 1].id);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors"
              >
                Skip Lead &rarr;
              </button>
            </div>
          </footer>
        </main>

        {/* =======================================================================
            RIGHT PANE: AI BORIS REAL-TIME HUD (w-96 border-l border-slate-200 bg-slate-50)
            ======================================================================= */}
        <aside className="w-96 border-l border-slate-200 bg-slate-50 flex flex-col shrink-0 overflow-y-auto p-3.5 space-y-3">
          
          {/* Header & Audio Waveform */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-900">
                  AI BORIS COPILOT HUD
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                Scribe v2
              </span>
            </div>

            {/* Mic Toggle Button + Sound Level Meter */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`flex-1 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs ${
                  isListening
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="h-3.5 w-3.5" />
                    <span>Mute Microphone</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-3.5 w-3.5" />
                    <span>Start Listening</span>
                  </>
                )}
              </button>

              {/* Volume VU Bar */}
              <div className="w-24 bg-slate-100 border border-slate-200 rounded-lg p-1.5 flex flex-col justify-center">
                <div className="flex justify-between text-[9px] font-mono text-slate-500 mb-0.5">
                  <span>VU</span>
                  <span>{volume}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-75 ${
                      volume > 70 ? 'bg-rose-500' : volume > 30 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${volume}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Test Simulation Presets */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1 text-[10px]">
              <span className="text-slate-400 font-semibold mr-1">Simulate:</span>
              {[
                { label: 'Vendor Lock-in', text: 'We already work with an agency and we are completely satisfied with them.' },
                { label: 'Budget Freeze', text: 'We have zero budget for new services this quarter.' },
                { label: 'Send Info', text: 'Just send me an email with your pricing and deck.' }
              ].map(s => (
                <button
                  key={s.label}
                  onClick={() => {
                    setTranscripts(prev => [
                      ...prev,
                      {
                        id: String(Date.now()),
                        speaker: 'prospect',
                        text: s.text,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }
                    ]);
                    triggerRebuttal(s.text);
                  }}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Rebuttal Trigger (Prominent Dock) */}
          {activeRebuttal && activeRebuttal.has_objection ? (
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-red-600" />
                  <span className="text-xs font-bold text-slate-900">
                    {activeRebuttal.objection_type}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                  {activeRebuttal.latency_ms}ms
                </span>
              </div>

              {/* [A] Acknowledge Badge */}
              <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80 text-xs space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-amber-900 uppercase">
                  <span>[A] Acknowledge (Tactical Empathy)</span>
                  <button
                    onClick={() => copyToClipboard(activeRebuttal.acknowledge || '', 'ack')}
                    className="text-amber-700 hover:text-amber-900"
                  >
                    {copiedKey === 'ack' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
                <p className="text-amber-950 font-medium leading-snug">
                  "{activeRebuttal.acknowledge}"
                </p>
              </div>

              {/* [R] Respond Badge */}
              <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200/80 text-xs space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-blue-900 uppercase">
                  <span>[R] Respond (Differentiator Reframe)</span>
                  <button
                    onClick={() => copyToClipboard(activeRebuttal.respond || '', 'resp')}
                    className="text-blue-700 hover:text-blue-900"
                  >
                    {copiedKey === 'resp' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
                <p className="text-blue-950 font-medium leading-snug">
                  "{activeRebuttal.respond}"
                </p>
              </div>

              {/* [M] Move Badge */}
              <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-xs space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-emerald-900 uppercase">
                  <span>[M] Move (Diagnostic Hook Question)</span>
                  <button
                    onClick={() => copyToClipboard(activeRebuttal.move || '', 'move')}
                    className="text-emerald-700 hover:text-emerald-900"
                  >
                    {copiedKey === 'move' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
                <p className="text-emerald-950 font-medium leading-snug">
                  "{activeRebuttal.move}"
                </p>
              </div>

              <button
                onClick={() => {
                  const full = `${activeRebuttal.acknowledge} ${activeRebuttal.respond} ${activeRebuttal.move}`;
                  copyToClipboard(full, 'full');
                }}
                className="w-full py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] uppercase transition-colors flex items-center justify-center gap-1.5"
              >
                {copiedKey === 'full' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedKey === 'full' ? 'Copied Full ARM Track' : 'Copy Full ARM Script'}</span>
              </button>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-400 text-xs space-y-1">
              <Sparkles className="h-5 w-5 text-slate-300 mx-auto mb-1 animate-pulse" />
              <p className="font-semibold text-slate-600">Awaiting Objection Trigger...</p>
              <p className="text-[11px]">Boris will display [A], [R], [M] cards when prospect pushback is detected.</p>
            </div>
          )}

          {/* Live Stream Ticker (Compact Monospace Log) */}
          <div className="bg-white border border-slate-200 rounded-xl flex-1 flex flex-col overflow-hidden min-h-[220px] shadow-xs">
            <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Live Speech Log
              </span>
              <button
                onClick={() => setTranscripts([])}
                className="text-[10px] text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            </div>

            <div
              ref={transcriptScrollRef}
              className="flex-1 p-3 overflow-y-auto space-y-2 text-[11px] font-mono leading-relaxed"
            >
              {transcripts.map((t) => (
                <div key={t.id} className="space-y-0.5">
                  <div className="flex items-center gap-1 text-[9px] text-slate-400">
                    <span className={t.speaker === 'prospect' ? 'text-red-600 font-bold' : 'text-slate-600 font-bold'}>
                      {t.speaker === 'prospect' ? 'PROSPECT' : t.speaker === 'rep' ? 'YOU' : 'SYSTEM'}:
                    </span>
                    <span>{t.timestamp}</span>
                  </div>
                  <div className="text-slate-800 bg-slate-50 p-1.5 rounded border border-slate-100">
                    {t.text}
                  </div>
                </div>
              ))}

              {interimText && (
                <div className="space-y-0.5 animate-pulse">
                  <div className="text-[9px] text-indigo-600 font-bold">
                    PROSPECT (STREAMING...):
                  </div>
                  <div className="text-indigo-900 italic bg-indigo-50/50 p-1.5 rounded border border-indigo-100">
                    {interimText}...
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showHotkeysModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Keyboard className="h-4 w-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">BPO Operator Hotkeys</h3>
              </div>
              <button onClick={() => setShowHotkeysModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Toggle Microphone Stream</span>
                <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700 font-mono">Space / M</kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Disposition: Meeting Booked</span>
                <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700 font-mono">1</kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Disposition: Gatekeeper</span>
                <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700 font-mono">2</kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Disposition: Left Voicemail</span>
                <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700 font-mono">3</kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Disposition: Disqualified</span>
                <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700 font-mono">4</kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Copy Full ARM Script</span>
                <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700 font-mono">⌘C</kbd>
              </div>
            </div>

            <button
              onClick={() => setShowHotkeysModal(false)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
            >
              Close Shortcuts
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
