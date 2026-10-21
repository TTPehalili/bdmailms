'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Radio, 
  Headphones, 
  Users, 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  Sparkles, 
  Clock, 
  MessageSquare, 
  Send, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  ShieldCheck, 
  Building2, 
  X, 
  ArrowRight,
  PhoneCall,
  Sliders,
  Activity
} from 'lucide-react';
import AppSidebar from '@/components/AppSidebar';
import GlobalTopHeader from '@/components/GlobalTopHeader';

interface RepSession {
  id: string;
  repName: string;
  repEmail: string;
  avatar: string;
  tenant: string;
  personaName: string;
  personaRole: string;
  personaDifficulty: 'High' | 'Medium' | 'Extreme';
  status: 'In-Call' | 'Idle' | 'Evaluating';
  duration: string;
  currentObjection: string;
  score: number;
  sentiment: 'Hostile' | 'Skeptical' | 'Neutral' | 'Engaged';
  wpm: number;
  recentTranscript: { speaker: string; text: string; time: string }[];
}

export default function LiveMonitoringCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'In-Call' | 'Idle' | 'Evaluating'>('all');
  const [tenantFilter, setTenantFilter] = useState('all');
  const [activeListeningSession, setActiveListeningSession] = useState<RepSession | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [whisperMessage, setWhisperMessage] = useState('');
  const [whisperFeedbackSent, setWhisperFeedbackSent] = useState(false);

  // Active Training Reps on Floor
  const [sessions, setSessions] = useState<RepSession[]>([
    {
      id: 'sess-1',
      repName: 'Alex Mercer',
      repEmail: 'alex.mercer@apexglobal.ph',
      avatar: 'AM',
      tenant: 'Apex Global BPO',
      personaName: 'Julian Vance',
      personaRole: 'Managing Director & Outbound Head (Apex BPO)',
      personaDifficulty: 'High',
      status: 'In-Call',
      duration: '03:42',
      currentObjection: '“We already get shared leads from Outsource Accelerator.”',
      score: 88,
      sentiment: 'Engaged',
      wpm: 142,
      recentTranscript: [
        { speaker: 'Julian Vance (AI)', text: '“We already buy shared lead packs from Outsource Accelerator, Alex. Why would I pay for software?”', time: '03:15' },
        { speaker: 'Alex Mercer (Rep)', text: '“Totally fair, Julian. But OA sells those identical leads to 3-5 other BPOs simultaneously, so you end up in $8/hr price wars.”', time: '03:26' },
        { speaker: 'Julian Vance (AI)', text: '“That is actually true... our margins have taken a beating on OA directory accounts.”', time: '03:38' },
      ]
    },
    {
      id: 'sess-2',
      repName: 'Elena Rostova',
      repEmail: 'elena.r@fintechscaleups.com',
      avatar: 'ER',
      tenant: 'Fintech Scaleups',
      personaName: 'David M.',
      personaRole: 'VP of Sales (Acme Cloud Tech)',
      personaDifficulty: 'High',
      status: 'In-Call',
      duration: '02:18',
      currentObjection: '“Our reps ramp in 4 weeks, we already have internal training.”',
      score: 84,
      sentiment: 'Skeptical',
      wpm: 136,
      recentTranscript: [
        { speaker: 'David M. (AI)', text: '“We already have an internal enablement manager, Elena. Reps ramp fine.”', time: '01:55' },
        { speaker: 'Elena Rostova (Rep)', text: '“Understood, David. But does your enablement drill 40 unscripted voice scenarios before live dials?”', time: '02:08' },
        { speaker: 'David M. (AI)', text: '“No, they mostly read slide decks and shadow calls.”', time: '02:15' }
      ]
    },
    {
      id: 'sess-3',
      repName: 'Marcus Brody',
      repEmail: 'mbrody@horizonsolar.us',
      avatar: 'MB',
      tenant: 'Horizon Solar Sales Floor',
      personaName: 'Rick Henderson',
      personaRole: 'Skeptical Dual Homeowner ($450+ Power Bill)',
      personaDifficulty: 'Extreme',
      status: 'In-Call',
      duration: '04:05',
      currentObjection: '“I already got burned by a solar telemarketer last year.”',
      score: 79,
      sentiment: 'Hostile',
      wpm: 155,
      recentTranscript: [
        { speaker: 'Rick Henderson (AI)', text: '“Take me off your list! You guys call every Tuesday with fake utility rebates!”', time: '03:45' },
        { speaker: 'Marcus Brody (Rep)', text: '“I completely hear your frustration Rick, I hate spam calls too. I am only calling because our team verified your substation rate rose 24%.”', time: '03:56' },
      ]
    },
    {
      id: 'sess-4',
      repName: 'Jordan Smith',
      repEmail: 'jsmith@oa-partner.com',
      avatar: 'JS',
      tenant: 'Outsource Accelerator Partner A',
      personaName: 'Sarah Jenkins',
      personaRole: 'VP Operations (Global Contact Center)',
      personaDifficulty: 'Medium',
      status: 'In-Call',
      duration: '01:50',
      currentObjection: '“Send me an email first, I am in back-to-back meetings.”',
      score: 91,
      sentiment: 'Neutral',
      wpm: 140,
      recentTranscript: [
        { speaker: 'Sarah Jenkins (AI)', text: '“Can you just shoot over an email? I am walking into an executive board session.”', time: '01:32' },
        { speaker: 'Jordan Smith (Rep)', text: '“Happy to send an email Sarah, but without knowing whether you focus on CS or Outbound sales, it will just be spam in your inbox.”', time: '01:44' }
      ]
    },
    {
      id: 'sess-5',
      repName: 'Samantha Reed',
      repEmail: 'sreed@apexglobal.ph',
      avatar: 'SR',
      tenant: 'Apex Global BPO',
      personaName: 'Michael Chang',
      personaRole: 'Head of Customer Experience (SaaS Scaleup)',
      personaDifficulty: 'High',
      status: 'Evaluating',
      duration: '06:12',
      currentObjection: 'Session Completed • AI Rubric Grading in Progress',
      score: 94,
      sentiment: 'Engaged',
      wpm: 138,
      recentTranscript: [
        { speaker: 'System AI Evaluator', text: '“Pacing: 95/100 • Acknowledge: Passed • Shared-Lead Reframe: Passed • Meeting Locked: YES.”', time: '06:10' }
      ]
    },
    {
      id: 'sess-6',
      repName: 'Carlos Gomez',
      repEmail: 'cgomez@horizonsolar.us',
      avatar: 'CG',
      tenant: 'Horizon Solar Sales Floor',
      personaName: 'None (Between Rounds)',
      personaRole: 'Reviewing Feedback & Rebuttals',
      personaDifficulty: 'Medium',
      status: 'Idle',
      duration: '00:00',
      currentObjection: 'Reviewing ARM Rebuttals Drawer (Battlecard #02)',
      score: 82,
      sentiment: 'Neutral',
      wpm: 0,
      recentTranscript: []
    }
  ]);

  const handleSendWhisper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whisperMessage.trim()) return;
    setWhisperFeedbackSent(true);
    setTimeout(() => {
      setWhisperFeedbackSent(false);
      setWhisperMessage('');
    }, 2200);
  };

  const filteredSessions = sessions.filter(s => {
    const matchQuery = s.repName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       s.personaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       s.tenant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchTenant = tenantFilter === 'all' || s.tenant === tenantFilter;
    return matchQuery && matchStatus && matchTenant;
  });

  const activeInCallsCount = sessions.filter(s => s.status === 'In-Call').length;

  return (
    <div className="flex h-screen w-full bg-[#FAF9F5] text-[#222021] overflow-hidden">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Global Header */}
        <GlobalTopHeader />

        {/* Scrollable Live Monitoring Console */}
        <main className="flex-1 overflow-y-auto px-6 lg:px-12 py-8 space-y-6 max-w-7xl mx-auto w-full">
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222021]/10 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono font-bold mb-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span>SUPERVISOR AUDIO MONITORING BUS ACTIVE</span>
              </div>
              <h1 className="text-3xl font-black text-[#222021] tracking-tight">
                Live Monitoring Console
              </h1>
              <p className="text-xs text-[#6b6968] mt-1 max-w-2xl leading-relaxed">
                Listen in real time to sales reps sparring with unscripted AI buyer personas. Monitor objection handling, emotional composure, and speech pacing live.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/sparring"
                className="px-4 py-2 rounded-xl bg-white border border-[#222021]/15 text-[#222021] hover:bg-[#F2F0EF] font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Headphones className="h-4 w-4 text-[#ED1C24]" />
                <span>Open Sparring Arena</span>
              </Link>
              <Link
                href="/admin"
                className="px-4 py-2 rounded-xl bg-[#222021] hover:bg-stone-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Admin Control</span>
              </Link>
            </div>
          </div>

          {/* Floor Overview Stats (4 Cards) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-[#222021]/10 rounded-2xl p-4 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[#6b6968]">Active Floor Calls</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <span className="text-2xl font-black text-emerald-600 font-mono">
                {activeInCallsCount} Live Streams
              </span>
              <p className="text-[11px] text-[#6b6968]">{sessions.length} reps logged into floor</p>
            </div>

            <div className="bg-white border border-[#222021]/10 rounded-2xl p-4 shadow-2xs space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#6b6968] block">Average Sparring Score</span>
              <span className="text-2xl font-black text-[#222021] font-mono">85.3%</span>
              <p className="text-[11px] text-emerald-700 font-medium">+4.2% vs last week</p>
            </div>

            <div className="bg-white border border-[#222021]/10 rounded-2xl p-4 shadow-2xs space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#6b6968] block">Audio Stream Delay</span>
              <span className="text-2xl font-black text-blue-600 font-mono">118ms</span>
              <p className="text-[11px] text-[#6b6968]">WebRTC Ultra-Low Latency</p>
            </div>

            <div className="bg-white border border-[#222021]/10 rounded-2xl p-4 shadow-2xs space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#6b6968] block">Pass Certification Gate</span>
              <span className="text-2xl font-black text-purple-600 font-mono">5 / 6 Reps</span>
              <p className="text-[11px] text-[#6b6968]">&ge; 80% passing threshold</p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full sm:max-w-xl">
              <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b6968]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logged in rep, tenant BPO, or buyer persona..."
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-[#222021]/15 text-xs font-medium placeholder-[#6b6968] text-[#222021] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#ED1C24] transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="h-11 px-3.5 rounded-xl bg-white border border-[#222021]/15 text-xs font-semibold text-[#222021] focus:outline-none shadow-2xs cursor-pointer"
              >
                <option value="all">All Session States</option>
                <option value="In-Call">Live In-Call (Sparring)</option>
                <option value="Evaluating">Evaluating / Grading</option>
                <option value="Idle">Idle (Between Rounds)</option>
              </select>

              <select
                value={tenantFilter}
                onChange={(e) => setTenantFilter(e.target.value)}
                className="h-11 px-3.5 rounded-xl bg-white border border-[#222021]/15 text-xs font-semibold text-[#222021] focus:outline-none shadow-2xs cursor-pointer"
              >
                <option value="all">All Client BPOs</option>
                <option value="Apex Global BPO">Apex Global BPO</option>
                <option value="Fintech Scaleups">Fintech Scaleups</option>
                <option value="Horizon Solar Sales Floor">Horizon Solar</option>
                <option value="Outsource Accelerator Partner A">OA Partner A</option>
              </select>
            </div>
          </div>

          {/* LOGGED IN REPS & ONGOING SPARRING SESSIONS GRID */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-[#6b6968]">
              <span>SHOWING {filteredSessions.length} REPS ON FLOOR</span>
              <span>CLICK "LISTEN LIVE" TO TAP AUDIO STREAM</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSessions.map((session) => {
                const isListening = activeListeningSession?.id === session.id;
                return (
                  <div
                    key={session.id}
                    className={`bg-white border rounded-2xl p-5 shadow-2xs space-y-4 transition-all ${
                      isListening
                        ? 'border-emerald-500 ring-2 ring-emerald-500/15'
                        : 'border-[#222021]/10 hover:border-[#222021]/25'
                    }`}
                  >
                    {/* Rep & AI Persona Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-[#222021] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {session.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-extrabold text-[#222021]">{session.repName}</h3>
                            <span className="text-[10px] font-mono text-[#6b6968] bg-[#F2F0EF] px-1.5 py-0.5 rounded">
                              {session.tenant}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6b6968] mt-0.5">
                            Sparring Partner: <strong className="text-[#222021]">{session.personaName}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Status & Live Audio Indicator */}
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                          session.status === 'In-Call'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : session.status === 'Evaluating'
                              ? 'bg-purple-50 text-purple-800 border-purple-300'
                              : 'bg-stone-100 text-stone-600 border-stone-200'
                        }`}>
                          {session.status === 'In-Call' && (
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                          )}
                          <span>{session.status === 'In-Call' ? `LIVE • ${session.duration}` : session.status.toUpperCase()}</span>
                        </span>

                        <span className="text-[10px] font-mono text-[#6b6968]">
                          Difficulty: <strong className="text-[#ED1C24]">{session.personaDifficulty}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Current Pushback / Telemetry Box */}
                    <div className="p-3 rounded-xl bg-[#F2F0EF] border border-[#222021]/10 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-[#6b6968] uppercase">Active Objection & Sentiment:</span>
                        <span className={`font-bold ${
                          session.sentiment === 'Hostile' ? 'text-red-700' :
                          session.sentiment === 'Skeptical' ? 'text-amber-700' :
                          'text-emerald-700'
                        }`}>
                          {session.sentiment.toUpperCase()} &bull; {session.wpm} WPM
                        </span>
                      </div>
                      <p className="text-xs italic font-medium text-[#222021]">
                        {session.currentObjection}
                      </p>
                    </div>

                    {/* Live Audio Equalizer Waveform & Listen Button */}
                    <div className="pt-1 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1 h-5 px-2 py-1 rounded bg-[#0F1412] border border-stone-800">
                        <span className="text-[9px] font-mono text-emerald-400 mr-1">AUDIO</span>
                        <span className="w-1 bg-emerald-400 rounded-full animate-pulse" style={{ height: session.status === 'In-Call' ? '80%' : '20%', animationDelay: '0s' }} />
                        <span className="w-1 bg-emerald-400 rounded-full animate-pulse" style={{ height: session.status === 'In-Call' ? '100%' : '20%', animationDelay: '0.2s' }} />
                        <span className="w-1 bg-emerald-400 rounded-full animate-pulse" style={{ height: session.status === 'In-Call' ? '60%' : '20%', animationDelay: '0.4s' }} />
                        <span className="w-1 bg-emerald-400 rounded-full animate-pulse" style={{ height: session.status === 'In-Call' ? '90%' : '20%', animationDelay: '0.1s' }} />
                        <span className="w-1 bg-emerald-400 rounded-full animate-pulse" style={{ height: session.status === 'In-Call' ? '40%' : '20%', animationDelay: '0.3s' }} />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (isListening) {
                              setActiveListeningSession(null);
                            } else {
                              setActiveListeningSession(session);
                            }
                          }}
                          disabled={session.status === 'Idle'}
                          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer ${
                            isListening
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : session.status === 'In-Call'
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-[#F2F0EF] text-[#6b6968] cursor-not-allowed'
                          }`}
                        >
                          <Headphones className="h-3.5 w-3.5" />
                          <span>{isListening ? 'Stop Listening' : '🎧 Listen Live'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DOCKED SUPERVISOR AUDIO STREAM & LIVE TRANSCRIPT PLAYER */}
          {activeListeningSession && (
            <div className="rounded-3xl bg-[#0C1017] border border-stone-800 p-6 text-white shadow-2xl space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-200">
              {/* Active Player Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500 text-stone-950 flex items-center justify-center font-bold">
                    <Radio className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                        MONITORING ACTIVE STREAM
                      </span>
                      <span className="text-xs font-mono text-stone-400">
                        Session: {activeListeningSession.id} &bull; Latency: 118ms
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-white mt-0.5">
                      {activeListeningSession.repName} ({activeListeningSession.tenant}) &harr; {activeListeningSession.personaName}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Volume Slider */}
                  <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
                    <button
                      onClick={() => setIsAudioMuted(!isAudioMuted)}
                      className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-300"
                    >
                      {isAudioMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isAudioMuted ? 0 : volume}
                      onChange={(e) => {
                        setVolume(Number(e.target.value));
                        setIsAudioMuted(false);
                      }}
                      className="w-20 accent-emerald-500 cursor-pointer"
                    />
                    <span className="w-8 text-right">{isAudioMuted ? '0%' : `${volume}%`}</span>
                  </div>

                  <button
                    onClick={() => setActiveListeningSession(null)}
                    className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
                    title="Close Monitor"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Real-Time Transcript & Waveform Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Transcript Dialogues (8 cols) */}
                <div className="lg:col-span-8 bg-stone-900/90 rounded-2xl p-4 border border-stone-800 space-y-3 max-h-72 overflow-y-auto">
                  <span className="text-[10px] font-mono font-bold uppercase text-stone-400 tracking-wider block">
                    Real-Time Rolling Dialogue Stream:
                  </span>
                  <div className="space-y-2.5">
                    {activeListeningSession.recentTranscript.map((line, idx) => {
                      const isRep = line.speaker.includes('Rep');
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border text-xs leading-relaxed ${
                            isRep
                              ? 'bg-blue-950/40 border-blue-800/40 text-blue-100 ml-4'
                              : 'bg-stone-950/80 border-stone-800 text-stone-200 mr-4'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                            <span className={isRep ? 'text-blue-400 font-bold' : 'text-[#ED1C24] font-bold'}>
                              {line.speaker}
                            </span>
                            <span className="text-stone-500">{line.time}</span>
                          </div>
                          <p className="font-sans">{line.text}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Supervisor Whisper & Coach Console (4 cols) */}
                <div className="lg:col-span-4 bg-stone-900/90 rounded-2xl p-4 border border-stone-800 space-y-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 tracking-wider block">
                      Supervisor Whisper (HUD Injection):
                    </span>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Inject guidance directly onto {activeListeningSession.repName}’s screen without alerting the buyer.
                    </p>
                  </div>

                  <form onSubmit={handleSendWhisper} className="space-y-2">
                    <textarea
                      rows={3}
                      value={whisperMessage}
                      onChange={(e) => setWhisperMessage(e.target.value)}
                      placeholder="e.g. Pivot to zero-prep guarantee! Remind them Emil pulls market profile beforehand."
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-emerald-500 font-sans resize-none"
                    />

                    <div className="flex items-center justify-between">
                      {whisperFeedbackSent ? (
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Sent to Rep Cockpit!</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-stone-500">Live Teleprompter Feed</span>
                      )}

                      <button
                        type="submit"
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Send Whisper</span>
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
