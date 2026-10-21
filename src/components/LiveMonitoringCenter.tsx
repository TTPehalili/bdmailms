'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Radio, 
  Headphones, 
  Users, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Clock, 
  Send, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  X, 
  PhoneCall,
  Activity,
  MessageSquare,
  Flame,
  Globe
} from 'lucide-react';

interface ActiveSparringSession {
  id: string;
  line: string;
  repName: string;
  repEmail: string;
  avatar: string;
  tenant: string;
  personaName: string;
  personaRole: string;
  personaDifficulty: 'High' | 'Medium' | 'Extreme';
  countryAccent: 'USA' | 'Australia' | 'UK';
  initialSeconds: number;
  currentObjection: string;
  score: number;
  sentiment: 'Hostile' | 'Skeptical' | 'Neutral' | 'Engaged';
  wpm: number;
  armStatus: {
    acknowledge: boolean;
    respond: boolean;
    move: boolean;
  };
  recentTranscript: { speaker: string; text: string; time: string }[];
}

export default function LiveMonitoringCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'Hostile' | 'Skeptical' | 'Neutral' | 'Engaged'>('all');
  const [tenantFilter, setTenantFilter] = useState('all');
  const [activeListeningSession, setActiveListeningSession] = useState<ActiveSparringSession | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [whisperMessage, setWhisperMessage] = useState('');
  const [whisperFeedbackSent, setWhisperFeedbackSent] = useState(false);

  // Active Sparring Lines on Dialer Floor (Only reps actively sparring with AI buyer personas)
  const [sessions, setSessions] = useState<ActiveSparringSession[]>([
    {
      id: 'sess-1',
      line: 'LINE 01',
      repName: 'Alex Mercer',
      repEmail: 'alex.mercer@apexglobal.ph',
      avatar: 'AM',
      tenant: 'Apex Global BPO',
      personaName: 'Julian Vance',
      personaRole: 'Managing Director & Outbound Head (Apex BPO)',
      personaDifficulty: 'High',
      countryAccent: 'Australia',
      initialSeconds: 228, // 03:48
      currentObjection: '“We already buy shared leads from Outsource Accelerator. Why pay for private data?”',
      score: 88,
      sentiment: 'Engaged',
      wpm: 142,
      armStatus: { acknowledge: true, respond: true, move: false },
      recentTranscript: [
        { speaker: 'Julian Vance (AI Persona)', text: '“We already buy shared lead packs from Outsource Accelerator, Alex. Why would I pay for software?”', time: '03:15' },
        { speaker: 'Alex Mercer (Rep)', text: '“Totally fair, Julian. But OA sells those identical leads to 3-5 other BPOs simultaneously, so you end up in $8/hr price wars.”', time: '03:26' },
        { speaker: 'Julian Vance (AI Persona)', text: '“That is actually true... our margins have taken a beating on OA directory accounts.”', time: '03:38' },
      ]
    },
    {
      id: 'sess-2',
      line: 'LINE 02',
      repName: 'Elena Rostova',
      repEmail: 'elena.r@fintechscaleups.com',
      avatar: 'ER',
      tenant: 'Fintech Scaleups',
      personaName: 'David M.',
      personaRole: 'VP of Sales (Acme Cloud Tech)',
      personaDifficulty: 'High',
      countryAccent: 'USA',
      initialSeconds: 142, // 02:22
      currentObjection: '“Our reps ramp in 4 weeks, we already have internal enablement training.”',
      score: 84,
      sentiment: 'Skeptical',
      wpm: 136,
      armStatus: { acknowledge: true, respond: false, move: false },
      recentTranscript: [
        { speaker: 'David M. (AI Persona)', text: '“We already have an internal enablement manager, Elena. Reps ramp fine.”', time: '01:55' },
        { speaker: 'Elena Rostova (Rep)', text: '“Understood, David. But does your enablement drill 40 unscripted voice scenarios before live dials?”', time: '02:08' },
        { speaker: 'David M. (AI Persona)', text: '“No, they mostly read slide decks and shadow calls.”', time: '02:15' }
      ]
    },
    {
      id: 'sess-3',
      line: 'LINE 03',
      repName: 'Marcus Brody',
      repEmail: 'mbrody@horizonsolar.us',
      avatar: 'MB',
      tenant: 'Horizon Solar Sales Floor',
      personaName: 'Rick Henderson',
      personaRole: 'Skeptical Dual Homeowner ($450+ Power Bill)',
      personaDifficulty: 'Extreme',
      countryAccent: 'USA',
      initialSeconds: 254, // 04:14
      currentObjection: '“Take me off your list! You guys call every Tuesday with fake utility rebates!”',
      score: 79,
      sentiment: 'Hostile',
      wpm: 155,
      armStatus: { acknowledge: true, respond: false, move: false },
      recentTranscript: [
        { speaker: 'Rick Henderson (AI Persona)', text: '“Take me off your list! You guys call every Tuesday with fake utility rebates!”', time: '03:45' },
        { speaker: 'Marcus Brody (Rep)', text: '“I completely hear your frustration Rick, I hate spam calls too. I am only calling because our team verified your substation rate rose 24%.”', time: '03:56' },
      ]
    },
    {
      id: 'sess-4',
      line: 'LINE 04',
      repName: 'Jordan Smith',
      repEmail: 'jsmith@oa-partner.com',
      avatar: 'JS',
      tenant: 'Outsource Accelerator Partner A',
      personaName: 'Sarah Jenkins',
      personaRole: 'VP Operations (Global Contact Center)',
      personaDifficulty: 'Medium',
      countryAccent: 'UK',
      initialSeconds: 118, // 01:58
      currentObjection: '“Send me an email first, I am in back-to-back executive meetings.”',
      score: 91,
      sentiment: 'Skeptical',
      wpm: 140,
      armStatus: { acknowledge: true, respond: true, move: true },
      recentTranscript: [
        { speaker: 'Sarah Jenkins (AI Persona)', text: '“Can you just shoot over an email? I am walking into an executive board session.”', time: '01:32' },
        { speaker: 'Jordan Smith (Rep)', text: '“Happy to send an email Sarah, but without knowing whether you focus on CS or Outbound sales, it will just be spam in your inbox.”', time: '01:44' }
      ]
    }
  ]);

  // Real-time dialer ticking clock for active lines
  useEffect(() => {
    const timer = setInterval(() => {
      setSessions(prev =>
        prev.map(s => ({
          ...s,
          initialSeconds: s.initialSeconds + 1
        }))
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60).toString().padStart(2, '0');
    const secs = (totalSecs % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleSendWhisper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whisperMessage.trim()) return;
    setWhisperFeedbackSent(true);
    setTimeout(() => {
      setWhisperFeedbackSent(false);
      setWhisperMessage('');
    }, 2200);
  };

  // Filter sessions (Only active sparring calls are listed)
  const filteredSessions = sessions.filter(s => {
    const matchQuery = s.repName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       s.personaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       s.tenant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSentiment = sentimentFilter === 'all' || s.sentiment === sentimentFilter;
    const matchTenant = tenantFilter === 'all' || s.tenant === tenantFilter;
    return matchQuery && matchSentiment && matchTenant;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-10">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222021]/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono font-bold mb-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span>DIALER AUDIO MONITORING BUS • 4 LIVE CHANNELS</span>
          </div>
          <h1 className="text-3xl font-black text-[#222021] tracking-tight">
            Live Sparring Floor Monitor
          </h1>
          <p className="text-xs text-[#6b6968] mt-1 max-w-2xl leading-relaxed">
            Real-time dialer supervisor console. Listen silently into active AI sparring sessions, monitor live buyer objection pushback, and whisper coaching cues directly to reps.
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

      {/* Dialer Floor Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#222021]/10 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#6b6968]">Active Sparring Calls</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <span className="text-2xl font-black text-emerald-600 font-mono">
            {sessions.length} Live Calls
          </span>
          <p className="text-[11px] text-[#6b6968]">100% Reps in Active Sparring</p>
        </div>

        <div className="bg-white border border-[#222021]/10 rounded-2xl p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#6b6968] block">Average Sparring Score</span>
          <span className="text-2xl font-black text-[#222021] font-mono">88.5%</span>
          <p className="text-[11px] text-emerald-700 font-medium">+4.2% vs last week</p>
        </div>

        <div className="bg-white border border-[#222021]/10 rounded-2xl p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#6b6968] block">Audio Stream Delay</span>
          <span className="text-2xl font-black text-blue-600 font-mono">118ms</span>
          <p className="text-[11px] text-[#6b6968]">WebRTC Ultra-Low Latency</p>
        </div>

        <div className="bg-white border border-[#222021]/10 rounded-2xl p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#6b6968] block">Floor Sentiment</span>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold mt-1">
            <span className="text-red-700">1 Hostile</span>
            <span className="text-[#6b6968]">&bull;</span>
            <span className="text-amber-700">2 Skeptical</span>
            <span className="text-[#6b6968]">&bull;</span>
            <span className="text-emerald-700">1 Engaged</span>
          </div>
          <p className="text-[11px] text-[#6b6968]">Live AI Sentiment Engine</p>
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
            placeholder="Search active rep, buyer persona, or tenant BPO..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-[#222021]/15 text-xs font-medium placeholder-[#6b6968] text-[#222021] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#ED1C24] transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value as any)}
            className="h-11 px-3.5 rounded-xl bg-white border border-[#222021]/15 text-xs font-semibold text-[#222021] focus:outline-none shadow-2xs cursor-pointer"
          >
            <option value="all">All Buyer Sentiments</option>
            <option value="Hostile">Hostile Friction</option>
            <option value="Skeptical">Skeptical Pushback</option>
            <option value="Engaged">Engaged / Warming Up</option>
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

      {/* ACTIVE SPARRING REPS DIALER GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-[#6b6968]">
          <span className="font-bold text-[#222021]">
            SHOWING {filteredSessions.length} REPS CURRENTLY IN ACTIVE AI SPARRING CALLS
          </span>
          <span className="hidden sm:inline">CLICK "LISTEN LIVE" TO MONITOR WEBRTC AUDIO FEED</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSessions.map((session) => {
            const isListening = activeListeningSession?.id === session.id;
            return (
              <div
                key={session.id}
                className={`bg-white border rounded-2xl p-5 shadow-2xs space-y-4 transition-all ${
                  isListening
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                    : 'border-[#222021]/10 hover:border-[#222021]/30'
                }`}
              >
                {/* Rep & AI Persona Header with Channel Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-11 w-11 rounded-xl bg-[#222021] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                        {session.avatar}
                      </div>
                      <span className="absolute -top-1 -left-1 px-1 py-0.2 rounded bg-stone-900 text-white font-mono text-[9px] font-bold border border-white/20">
                        {session.line}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-extrabold text-[#222021]">{session.repName}</h3>
                        <span className="text-[10px] font-mono text-[#6b6968] bg-[#F2F0EF] px-1.5 py-0.5 rounded border border-[#222021]/10">
                          {session.tenant}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6b6968] mt-0.5 flex items-center gap-1.5">
                        <span>Sparring against:</span>
                        <strong className="text-[#222021]">{session.personaName}</strong>
                        <span className="text-[10px] text-[#6b6968]">({session.countryAccent} Voice)</span>
                      </p>
                    </div>
                  </div>

                  {/* Status & Live Audio Indicator */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                      <span>LIVE CALL • {formatDuration(session.initialSeconds)}</span>
                    </span>

                    <span className="text-[10px] font-mono text-[#6b6968]">
                      Difficulty: <strong className="text-[#ED1C24]">{session.personaDifficulty}</strong>
                    </span>
                  </div>
                </div>

                {/* Current Pushback / Telemetry Box */}
                <div className="p-3 rounded-xl bg-[#F2F0EF] border border-[#222021]/10 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#6b6968] uppercase font-bold flex items-center gap-1">
                      <Flame className="h-3 w-3 text-[#ED1C24]" />
                      <span>Live Buyer Objection:</span>
                    </span>
                    <span className={`font-bold ${
                      session.sentiment === 'Hostile' ? 'text-red-700' :
                      session.sentiment === 'Skeptical' ? 'text-amber-700' :
                      'text-emerald-700'
                    }`}>
                      {session.sentiment.toUpperCase()} &bull; {session.wpm} WPM
                    </span>
                  </div>
                  <p className="text-xs italic font-medium text-[#222021] leading-relaxed">
                    {session.currentObjection}
                  </p>
                </div>

                {/* ARM Framework Live Progress Indicators */}
                <div className="flex items-center justify-between text-[10px] font-mono pt-1">
                  <span className="text-[#6b6968] font-bold">ARM STATUS:</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded ${session.armStatus.acknowledge ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-stone-200 text-stone-500'}`}>
                      {session.armStatus.acknowledge ? '✓ Acknowledge' : 'Acknowledge'}
                    </span>
                    <span className={`px-2 py-0.5 rounded ${session.armStatus.respond ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-stone-200 text-stone-500'}`}>
                      {session.armStatus.respond ? '✓ Respond' : 'Respond'}
                    </span>
                    <span className={`px-2 py-0.5 rounded ${session.armStatus.move ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-stone-200 text-stone-500'}`}>
                      {session.armStatus.move ? '✓ Move' : 'Move'}
                    </span>
                  </div>
                </div>

                {/* Live Audio Equalizer Waveform & Listen Button */}
                <div className="pt-2 border-t border-[#222021]/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 h-6 px-2.5 py-1 rounded-lg bg-[#0F1412] border border-stone-800">
                    <span className="text-[9px] font-mono text-emerald-400 font-bold mr-1">VU METER</span>
                    <span className="w-1 bg-emerald-400 rounded-full animate-pulse h-4" style={{ animationDelay: '0s' }} />
                    <span className="w-1 bg-emerald-400 rounded-full animate-pulse h-5" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1 bg-emerald-400 rounded-full animate-pulse h-3" style={{ animationDelay: '0.4s' }} />
                    <span className="w-1 bg-emerald-400 rounded-full animate-pulse h-5" style={{ animationDelay: '0.1s' }} />
                    <span className="w-1 bg-emerald-400 rounded-full animate-pulse h-2" style={{ animationDelay: '0.3s' }} />
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
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer ${
                        isListening
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      <Headphones className="h-3.5 w-3.5" />
                      <span>{isListening ? 'Disconnect Audio' : '🎧 Listen Live'}</span>
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
                    MONITORING LIVE {activeListeningSession.line}
                  </span>
                  <span className="text-xs font-mono text-stone-400">
                    Session: {activeListeningSession.id} &bull; Latency: 118ms &bull; {activeListeningSession.countryAccent} Accent Model
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

    </div>
  );
}
