'use client';

import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Mail, 
  Phone, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Calendar, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { CADENCE_TOUCHES, CadenceTouch } from '@/lib/cadenceMaster';

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28" />
    </svg>
  );
}

interface ViewFullCadenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDay?: number;
  contactName?: string;
  companyName?: string;
  repName?: string;
}

export default function ViewFullCadenceModal({
  isOpen,
  onClose,
  currentDay = 2,
  contactName = 'Julian Vance',
  companyName = 'Apex Global BPO',
  repName = 'Alex Mercer'
}: ViewFullCadenceModalProps) {
  const [filterChannel, setFilterChannel] = useState<'All' | 'Email' | 'Phone' | 'LinkedIn'>('All');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const replacePlaceholders = (text: string) => {
    return text
      .replace(/\{\{first_name\}\}/g, contactName.split(' ')[0] || 'there')
      .replace(/\{\{company\}\}/g, companyName || 'your company')
      .replace(/\{\{rep_name\}\}/g, repName || 'Alex Mercer')
      .replace(/\{\{loom_link\}\}/g, 'https://loom.com/share/bpo-60seat-arm-demo');
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(replacePlaceholders(text));
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  const filteredTouches = CADENCE_TOUCHES.filter(t => {
    if (filterChannel === 'All') return true;
    return t.channel === filterChannel;
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-5xl h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#ED1C24] flex items-center justify-center text-white shadow-xs">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  The Blueprint: 27-Day, 13-Touch Outbound Cadence
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold uppercase">
                  MASTER SPEC v3.1
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Multi-channel synchronization: Resend drip automation + Boris priority phone dialers + Manual LinkedIn touches.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Channel Filters */}
            <div className="hidden sm:flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs font-semibold">
              {(['All', 'Phone', 'Email', 'LinkedIn'] as const).map(ch => (
                <button
                  key={ch}
                  onClick={() => setFilterChannel(ch)}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    filterChannel === ch 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>

            {/* Clean Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              aria-label="Close Cadence View"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Prospect Dynamic Context Strip */}
        <div className="px-6 py-2 bg-amber-50/70 border-b border-amber-200/80 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-950 font-medium shrink-0">
          <div className="flex items-center gap-3">
            <span>Target: <strong>{contactName}</strong> at <strong>{companyName}</strong></span>
            <span>•</span>
            <span>Sender SDR: <strong>{repName}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-200/70 text-amber-900 font-bold">
              ACTIVE CADENCE DAY: Day {currentDay}
            </span>
          </div>
        </div>

        {/* Scrollable Timeline Work Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          <div className="space-y-4">
            {filteredTouches.map((touch, idx) => {
              const isCurrent = touch.day === currentDay;
              const isPassed = touch.day < currentDay;

              return (
                <div 
                  key={touch.touchNumber}
                  className={`rounded-xl border p-4.5 bg-white transition-all shadow-xs relative ${
                    isCurrent 
                      ? 'border-[#ED1C24] ring-2 ring-[#ED1C24]/20 shadow-md' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Top Touchpoint Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-mono font-black px-2.5 py-0.5 rounded-full ${
                        isCurrent 
                          ? 'bg-[#ED1C24] text-white' 
                          : isPassed 
                          ? 'bg-slate-200 text-slate-700' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        DAY {touch.day}
                      </span>

                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1.5 ${
                        touch.channel === 'Email' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : touch.channel === 'Phone' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {touch.channel === 'Email' && <Mail className="h-3.5 w-3.5" />}
                        {touch.channel === 'Phone' && <Phone className="h-3.5 w-3.5" />}
                        {touch.channel === 'LinkedIn' && <LinkedInIcon className="h-3.5 w-3.5" />}
                        <span>{touch.channel}</span>
                      </span>

                      <h3 className="text-sm font-black text-slate-900 tracking-tight">
                        Touch #{touch.touchNumber}: {touch.stepName}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCurrent && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                          CURRENT TOUCHPOINT
                        </span>
                      )}

                      <button
                        onClick={() => handleCopy(touch.body, idx)}
                        className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Copy Script / Copy"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 text-slate-500" />
                            <span>Copy Template</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Metadata Row: Mechanism & Timing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs mb-3 text-slate-600">
                    <div className="flex items-start gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-800">Execution:</strong> {touch.mechanism}
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-800">Timing & Rule:</strong> {touch.timingRule}
                      </div>
                    </div>
                  </div>

                  {/* Email Subject Line (if applicable) */}
                  {touch.subject && (
                    <div className="mb-2.5 p-2 rounded-lg bg-slate-100/70 border border-slate-200/80 text-xs">
                      <span className="text-slate-500 font-mono font-bold uppercase text-[10px] mr-2">Subject:</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {replacePlaceholders(touch.subject)}
                      </span>
                    </div>
                  )}

                  {/* Spoken Opener (if Phone) */}
                  {touch.spokenOpener && (
                    <div className="mb-2.5 p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200/70 text-xs">
                      <span className="text-emerald-800 font-bold uppercase text-[10px] block mb-0.5">Spoken Opener (Screen 1):</span>
                      <p className="font-semibold text-slate-900 italic">
                        {replacePlaceholders(touch.spokenOpener)}
                      </p>
                    </div>
                  )}

                  {/* Voicemail Audio (if Phone #2) */}
                  {touch.voicemailAudio && (
                    <div className="mb-2.5 p-2.5 rounded-lg bg-purple-50/60 border border-purple-200/70 text-xs">
                      <span className="text-purple-800 font-bold uppercase text-[10px] block mb-0.5">15s Voicemail Drop Audio Script:</span>
                      <p className="font-semibold text-slate-900 italic">
                        {replacePlaceholders(touch.voicemailAudio)}
                      </p>
                    </div>
                  )}

                  {/* Body Copy Block */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs leading-relaxed text-slate-800 whitespace-pre-wrap font-sans">
                    {replacePlaceholders(touch.body)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Cadence Gating Active: Advancing requires verified disposition or task completion</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
            >
              Close Cadence View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
