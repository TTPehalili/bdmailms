'use client';

import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  Share2, 
  Copy, 
  Check, 
  CheckSquare, 
  Square, 
  Sparkles, 
  Building, 
  Briefcase, 
  Layers, 
  AlertCircle,
  Clock,
  PhoneCall,
  User,
  Flame,
  ArrowRight
} from 'lucide-react';
import { CockpitLead } from './LeadQueue';

interface ScriptViewerProps {
  lead: CockpitLead;
  isCallActive: boolean;
  callDuration: number;
  onToggleCall: () => void;
  onSetDisposition: (label: string) => void;
  activeDisposition: string | null;
}

export default function ScriptViewer({
  lead,
  isCallActive,
  callDuration,
  onToggleCall,
  onSetDisposition,
  activeDisposition
}: ScriptViewerProps) {
  const [activeChannel, setActiveChannel] = useState<'call' | 'email' | 'linkedin'>('call');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    pain: false,
    stack: false,
    authority: false,
    meeting: false
  });

  const toggleCheck = (key: string) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const formatSeconds = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section className="flex-1 bg-white flex flex-col min-w-0 overflow-hidden select-text">
      
      {/* =======================================================================
          1. TOP PROSPECT BANNER
          ======================================================================= */}
      <div className="border-b border-slate-200 bg-slate-50/60 p-3.5 flex flex-col gap-2.5 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Contact Identity */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#ED1C24] text-white font-black text-sm flex items-center justify-center shadow-xs">
              {lead.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
                  {lead.name}
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 font-bold uppercase">
                  {lead.headcount}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ED1C24]/10 text-[#ED1C24] border border-[#ED1C24]/20 font-semibold">
                  {lead.localTime}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                <span className="font-semibold text-slate-800">{lead.title}</span> at <span className="font-bold text-slate-900">{lead.company}</span>
              </p>
            </div>
          </div>

          {/* Quick Connect & Dial Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleCall}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                isCallActive
                  ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <Phone className="h-3.5 w-3.5" />
              <span>{isCallActive ? `END CALL (${formatSeconds(callDuration)})` : `DIAL ${lead.phone}`}</span>
            </button>

            <button
              onClick={() => copyToClipboard(lead.email, 'email')}
              title="Copy Email"
              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors"
            >
              {copiedKey === 'email' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Mail className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Enriched CSV Metadata Attributes Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/70 text-[11px]">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded px-2 py-0.5 text-slate-700">
            <span className="text-slate-400 font-medium uppercase text-[10px]">Current BPO:</span>
            <span className="font-semibold text-slate-900">{lead.currentBpo}</span>
          </div>
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded px-2 py-0.5 text-slate-700">
            <span className="text-slate-400 font-medium uppercase text-[10px]">Tech Stack:</span>
            <span className="font-semibold text-slate-900">{lead.techStack}</span>
          </div>
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded px-2 py-0.5 text-amber-900">
            <span className="text-amber-700 font-medium uppercase text-[10px]">Pain Point:</span>
            <span className="font-semibold text-amber-950">{lead.painPoint}</span>
          </div>
        </div>
      </div>

      {/* =======================================================================
          2. CHANNEL TABS (Segmented Pill Switcher)
          ======================================================================= */}
      <div className="px-4 py-2 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveChannel('call')}
            className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              activeChannel === 'call'
                ? 'bg-white text-[#ED1C24] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>📞 Cold Call</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-[#ED1C24]/10 text-[#ED1C24] border border-[#ED1C24]/20 font-mono">LIVE</span>
          </button>
          <button
            onClick={() => setActiveChannel('email')}
            className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              activeChannel === 'email'
                ? 'bg-white text-[#ED1C24] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>✉️ 1-Click Email</span>
          </button>
          <button
            onClick={() => setActiveChannel('linkedin')}
            className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              activeChannel === 'linkedin'
                ? 'bg-white text-[#ED1C24] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>💼 LinkedIn Touchpoint</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span>Cadence: Step 3 / 8</span>
        </div>
      </div>

      {/* =======================================================================
          3. DYNAMIC SCRIPT CANVAS (Scrollable)
          ======================================================================= */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        
        {activeChannel === 'call' && (
          <div className="space-y-4">
            
            {/* Step 1: Opener & Directory Check */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 relative">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-[#ED1C24]/15 text-[#222021] font-mono">
                  1. Pattern Interrupt & OA Check (15s)
                </span>
                <button
                  onClick={() => copyToClipboard(`Hey ${lead.name.split(' ')[0]}, quick question—are you guys currently buying any of your outbound leads from Outsource Accelerator or similar BPO directories?`, 'c1')}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded"
                >
                  {copiedKey === 'c1' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
              <p className="text-[13px] leading-relaxed text-slate-800 font-medium">
                "Hey <span className="bg-[#ED1C24]/15 text-[#222021] px-1.5 py-0.5 rounded font-bold font-mono text-xs">{lead.name.split(' ')[0]}</span>, quick question—are you guys currently buying any of your outbound leads from Outsource Accelerator or similar BPO directories?"
              </p>
            </div>

            {/* Step 2: Confirm Core Bottleneck */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 relative">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-purple-100/70 text-purple-800 font-mono">
                  2. The Shared-Lead Price Trap (30s)
                </span>
                <button
                  onClick={() => copyToClipboard(`The reason I ask is most BPO owners we talk to tell us those directories sell the exact same lead list to 3 to 5 competing agencies at the exact same time. It forces you into an $8/hour price-war race to the bottom. Is that hitting your margins too?`, 'c2')}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded"
                >
                  {copiedKey === 'c2' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
              <p className="text-[13px] leading-relaxed text-slate-800 font-medium">
                "The reason I ask is most BPO owners tell us those directories sell the exact same lead list to 3 to 5 competing agencies at the exact same time. It forces you into an $8/hour price-war race to the bottom. Is that hitting your margins too?"
              </p>
            </div>

            {/* Step 3: Problem vs. Solution */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 relative">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-100/70 text-amber-900 font-mono">
                  3. Lead Burn vs. Claude AI Lists + Sparring (45s)
                </span>
                <button
                  onClick={() => copyToClipboard(`What we do differently is twofold: First, we generate private, Claude-enriched ICP lists that zero competitors touch. Second, before your reps ever dial those leads, our AI Boris runs them through 5 realistic objection sparring rounds so they never burn expensive contacts on warm-up swings.`, 'c3')}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded"
                >
                  {copiedKey === 'c3' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
              <p className="text-[13px] leading-relaxed text-slate-800 font-medium">
                "What we do differently is twofold: First, we generate private, Claude-enriched ICP lists that zero competitors touch. Second, before your reps ever dial those leads, our AI Boris runs them through 5 realistic objection sparring rounds so they never burn expensive contacts on warm-up swings."
              </p>
            </div>

            {/* Step 4: Vertical Diagnostic Pivot */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 relative">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-100/70 text-blue-800 font-mono">
                  4. Vertical Diagnostic Pivot (30s)
                </span>
                <button
                  onClick={() => copyToClipboard(`Are you guys currently placing more customer service reps, specialized bookkeeping, or outbound sales seats?`, 'c4')}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded"
                >
                  {copiedKey === 'c4' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
              <p className="text-[13px] leading-relaxed text-slate-800 font-medium">
                "Are you guys currently placing more customer service reps, specialized bookkeeping, or outbound sales seats?"
              </p>
            </div>

            {/* Step 5: Close with Founder Emil */}
            <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/40 relative">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-900 font-mono">
                  5. The Close: Demo with Founder Emil (30s)
                </span>
                <button
                  onClick={() => copyToClipboard(`Our founder, Emil, has been in the BPO BDM trenches for over 17 years. He put together a 20-minute screen share showing how we build private Claude-enriched lists and let reps spar with AI before live calls. Would you be open to taking a look with Emil this Thursday at 2:00 PM, or does Friday morning work better for your calendar?`, 'c5')}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded"
                >
                  {copiedKey === 'c5' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
              <p className="text-[13px] leading-relaxed text-slate-800 font-medium">
                "Our founder, Emil, has been in the BPO BDM trenches for over 17 years. He put together a 20-minute screen share showing how we build private Claude-enriched lists and let reps spar with AI before live calls. Would you be open to taking a look with Emil this Thursday at 2:00 PM, or does Friday morning work better for your calendar?"
              </p>
            </div>

            {/* Interactive Qualification Checklist */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2.5">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                BPO Rep Qualification Checklist
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => toggleCheck('pain')}
                  className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-colors ${
                    checklist.pain ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {checklist.pain ? <CheckSquare className="h-4 w-4 text-emerald-600 shrink-0" /> : <Square className="h-4 w-4 text-slate-400 shrink-0" />}
                  <span>Uncovered Core Pain Point</span>
                </button>

                <button
                  onClick={() => toggleCheck('stack')}
                  className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-colors ${
                    checklist.stack ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {checklist.stack ? <CheckSquare className="h-4 w-4 text-emerald-600 shrink-0" /> : <Square className="h-4 w-4 text-slate-400 shrink-0" />}
                  <span>Validated Stack & Incumbent</span>
                </button>

                <button
                  onClick={() => toggleCheck('authority')}
                  className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-colors ${
                    checklist.authority ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {checklist.authority ? <CheckSquare className="h-4 w-4 text-emerald-600 shrink-0" /> : <Square className="h-4 w-4 text-slate-400 shrink-0" />}
                  <span>Confirmed Decision Authority</span>
                </button>

                <button
                  onClick={() => toggleCheck('meeting')}
                  className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-colors ${
                    checklist.meeting ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {checklist.meeting ? <CheckSquare className="h-4 w-4 text-emerald-600 shrink-0" /> : <Square className="h-4 w-4 text-slate-400 shrink-0" />}
                  <span>Locked 15-Min Diagnostic Zoom</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeChannel === 'email' && (
          <div className="space-y-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-800">
                Subject: Quick question re: {lead.painPoint} at {lead.company}
              </span>
              <button
                onClick={() => copyToClipboard(`Subject: Quick question re: ${lead.painPoint} at ${lead.company}\n\nHi ${lead.name.split(' ')[0]},\n\nNoticed ${lead.company} is using ${lead.techStack}. Many sales teams we speak with cite ${lead.painPoint} as their biggest hurdle.\n\nWe provide sub-second live call ARM interception to boost outbound conversions.\n\nOpen to a brief 10-minute chat next week?\n\nBest,\nAlex`, 'email_copy')}
                className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1 shadow-xs"
              >
                {copiedKey === 'email_copy' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                <span>1-Click Copy Draft</span>
              </button>
            </div>
            <div className="text-[13px] leading-relaxed text-slate-800 space-y-3 font-mono bg-white p-3 rounded-lg border border-slate-200">
              <p>Hi {lead.name.split(' ')[0]},</p>
              <p>Noticed {lead.company} is currently running {lead.techStack} with {lead.currentBpo}. Typically, demand generation leaders in your space mention that {lead.painPoint} holds back outbound pipeline quotas.</p>
              <p>We built AI Boris to feed SDRs live objection talk tracks during live calls with zero hesitation.</p>
              <p>Would you be open to a 10-minute diagnostic session next Tuesday or Wednesday?</p>
              <p>Best,<br />Alex Mercer</p>
            </div>
          </div>
        )}

        {activeChannel === 'linkedin' && (
          <div className="space-y-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-800">
                LinkedIn Connection Note (&lt; 300 characters)
              </span>
              <button
                onClick={() => copyToClipboard(`Hi ${lead.name.split(' ')[0]}, noticed your work leading sales development at ${lead.company}. We track B2B outbound benchmarks around ${lead.painPoint} across ${lead.headcount} companies. Would love to connect and share notes!`, 'li_copy')}
                className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1 shadow-xs"
              >
                {copiedKey === 'li_copy' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                <span>Copy Note</span>
              </button>
            </div>
            <div className="text-[13px] leading-relaxed text-slate-800 font-mono bg-white p-3 rounded-lg border border-slate-200">
              "Hi {lead.name.split(' ')[0]}, noticed your work leading sales development at {lead.company}. We track B2B outbound benchmarks around {lead.painPoint} across {lead.headcount} companies. Would love to connect and share notes!"
            </div>
          </div>
        )}
      </div>

      {/* =======================================================================
          4. BOTTOM FIXED CALL DISPOSITION DOCK (Height 14 border-t)
          ======================================================================= */}
      <div className="h-14 border-t border-slate-200 bg-slate-50 px-4 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            HOTKEY DISPOSITION:
          </span>

          {/* [1] Meeting Booked */}
          <button
            onClick={() => onSetDisposition('Meeting Booked')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
              activeDisposition === 'Meeting Booked'
                ? 'bg-emerald-700 text-white ring-2 ring-emerald-400'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <span className="px-1 py-0.2 rounded bg-emerald-800 text-emerald-200 font-mono text-[10px]">[1]</span>
            <span>Meeting Booked</span>
          </button>

          {/* [2] Gatekeeper */}
          <button
            onClick={() => onSetDisposition('Gatekeeper')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              activeDisposition === 'Gatekeeper'
                ? 'bg-slate-200 text-slate-900 border-slate-400 font-bold'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs'
            }`}
          >
            <span className="text-[10px] text-slate-400 font-mono mr-1">[2]</span>
            <span>Gatekeeper</span>
          </button>

          {/* [3] Left VM */}
          <button
            onClick={() => onSetDisposition('Left Voicemail')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              activeDisposition === 'Left Voicemail'
                ? 'bg-slate-200 text-slate-900 border-slate-400 font-bold'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs'
            }`}
          >
            <span className="text-[10px] text-slate-400 font-mono mr-1">[3]</span>
            <span>Left VM</span>
          </button>

          {/* [4] Disqualified */}
          <button
            onClick={() => onSetDisposition('Disqualified')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              activeDisposition === 'Disqualified'
                ? 'bg-red-50 text-red-800 border-red-300 font-bold'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs'
            }`}
          >
            <span className="text-[10px] text-slate-400 font-mono mr-1">[4]</span>
            <span>Disqualified</span>
          </button>
        </div>

        {activeDisposition && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold font-mono bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
            <Check className="h-3 w-3" />
            <span>Saved: {activeDisposition}</span>
          </div>
        )}
      </div>
    </section>
  );
}
