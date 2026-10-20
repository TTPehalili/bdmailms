'use client';

import React, { useState } from 'react';
import { 
  Radio, 
  Sparkles, 
  Zap, 
  Copy, 
  Check, 
  ShieldAlert, 
  Volume2, 
  RefreshCw,
  Flame,
  ChevronRight
} from 'lucide-react';
import { ArmRebuttalResponse, TranscriptEntry } from '@/types';
import LiveTranscript from '@/components/cockpit/LiveTranscript';

interface BorisHUDProps {
  rebuttal: ArmRebuttalResponse;
  transcript: TranscriptEntry[];
  interimText: string;
  isListening: boolean;
  volume: number;
  onSimulateObjection?: (type: string) => void;
}

export default function BorisHUD({
  rebuttal,
  transcript,
  interimText,
  isListening,
  volume,
  onSimulateObjection
}: BorisHUDProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyText = (txt: string, section: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 1800);
  };

  return (
    <div className="w-96 flex-shrink-0 flex flex-col border-l border-slate-200 bg-slate-50/80 p-3 space-y-3 overflow-hidden select-none">
      
      {/* =======================================================================
          1. HUD HEADER (Height 40px with decibel audio meter + status pill)
          ======================================================================= */}
      <div className="h-10 px-1 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-indigo-600 flex items-center justify-center text-white">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 tracking-wider uppercase block leading-none">
              AI BORIS COPILOT
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Live Interception HUD
            </span>
          </div>
        </div>

        {/* Live Audio Decibel Wave + Status Pill */}
        <div className="flex items-center gap-2">
          {/* Dynamic 5-bar decibel meter */}
          <div className="flex items-end gap-0.5 h-4">
            {[1, 2, 3, 4, 5].map((bar) => {
              const active = isListening && volume > bar * 16;
              return (
                <div
                  key={bar}
                  className={`w-1 rounded-full transition-all duration-75 ${
                    active ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                  style={{ height: `${active ? Math.max(4, (volume / 100) * 16) : 4}px` }}
                />
              );
            })}
          </div>

          <div className="text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1.5 shadow-2xs">
            <span className={`h-1.5 w-1.5 rounded-full ${isListening ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span>{isListening ? '140ms' : 'STANDBY'}</span>
          </div>
        </div>
      </div>

      {/* =======================================================================
          2. ACTIVE OBJECTION CARD (The Hero Component)
          ======================================================================= */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2.5 shrink-0">
        
        {/* Card Header: Objection Label + Latency indicator */}
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {rebuttal.objection_type || 'Active Competitor Lock-in'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400">
              {rebuttal.latency_ms ? `${rebuttal.latency_ms}ms` : '138ms'}
            </span>
            <span className="text-[9px] font-mono font-semibold px-1 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              VECTOR MATCH
            </span>
          </div>
        </div>

        {/* [A] Acknowledge Badge & Line */}
        <div 
          onClick={() => copyText(rebuttal.acknowledge || '', 'a')}
          className="p-2.5 rounded-md bg-amber-50 border border-amber-200/80 text-[12px] text-amber-950 leading-relaxed cursor-pointer hover:bg-amber-100/60 transition-colors group relative"
        >
          <span className="inline-block mr-1.5 px-1 py-0.2 bg-amber-200 text-amber-900 font-bold rounded text-[10px]">
            [A]
          </span>
          <span className="font-medium italic">
            "{rebuttal.acknowledge || 'I completely understand—you have an established rhythm with them and they know your brand.'}"
          </span>
          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {copiedSection === 'a' ? <Check className="h-3 w-3 text-emerald-700" /> : <Copy className="h-3 w-3 text-amber-700" />}
          </div>
        </div>

        {/* [R] Respond Badge & Line */}
        <div 
          onClick={() => copyText(rebuttal.respond || '', 'r')}
          className="p-2.5 rounded-md bg-indigo-50 border border-indigo-200/80 text-[12px] text-indigo-950 leading-relaxed cursor-pointer hover:bg-indigo-100/60 transition-colors group relative"
        >
          <span className="inline-block mr-1.5 px-1 py-0.2 bg-indigo-200 text-indigo-900 font-bold rounded text-[10px]">
            [R]
          </span>
          <span className="font-medium">
            "{rebuttal.respond || 'We don’t ask you to fire them. We act as an overflow layer that handles objection friction before it burns qualified pipeline.'}"
          </span>
          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {copiedSection === 'r' ? <Check className="h-3 w-3 text-emerald-700" /> : <Copy className="h-3 w-3 text-indigo-700" />}
          </div>
        </div>

        {/* [M] Move Badge & Line */}
        <div 
          onClick={() => copyText(rebuttal.move || '', 'm')}
          className="p-2.5 rounded-md bg-emerald-50 border border-emerald-200/80 text-[12px] text-emerald-950 leading-relaxed cursor-pointer hover:bg-emerald-100/60 transition-colors group relative"
        >
          <span className="inline-block mr-1.5 px-1 py-0.2 bg-emerald-200 text-emerald-900 font-bold rounded text-[10px]">
            [M]
          </span>
          <span className="font-medium">
            "{rebuttal.move || 'Are you opposed to a 10-minute side-by-side run next Tuesday to benchmark your hold rate?'}"
          </span>
          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {copiedSection === 'm' ? <Check className="h-3 w-3 text-emerald-700" /> : <Copy className="h-3 w-3 text-emerald-700" />}
          </div>
        </div>

        {/* Fast Rebuttal Quick-Swap Pills */}
        {onSimulateObjection && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
            <span className="text-slate-400 font-mono">Test Objection:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onSimulateObjection('Incumbent BPO Agency')}
                className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
              >
                Incumbent
              </button>
              <button
                onClick={() => onSimulateObjection('No Budget / Freeze')}
                className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
              >
                No Budget
              </button>
              <button
                onClick={() => onSimulateObjection('Send Me An Email')}
                className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
              >
                Send Email
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =======================================================================
          3. LIVE DIARIZED TRANSCRIPT LOG
          ======================================================================= */}
      <LiveTranscript
        transcript={transcript}
        interimText={interimText}
        isListening={isListening}
      />
    </div>
  );
}
