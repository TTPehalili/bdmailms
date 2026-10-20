'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  Send, 
  ArrowLeft,
  ShieldAlert,
  Radio
} from 'lucide-react';
import { SPARRING_PERSONAS, SparringPersona } from '@/lib/personas';
import { DialogueTurn } from '@/lib/qaEvaluator';

function SparringRoomContent() {
  const params = useParams();
  const personaId = (params?.personaId as string) || '';
  const router = useRouter();
  const persona = SPARRING_PERSONAS.find(p => p.id === personaId) || SPARRING_PERSONAS[0];

  const [callActive, setCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [repInput, setRepInput] = useState('');
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [transcript, setTranscript] = useState<DialogueTurn[]>([
    {
      role: 'prospect',
      content: persona.coreObjection,
      timestamp: '00:02'
    }
  ]);
  const [objectives, setObjectives] = useState(
    persona.objectives.map(o => ({ ...o, completed: false }))
  );
  const [isFinishingCall, setIsFinishingCall] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Call duration counter
  useEffect(() => {
    if (callActive) {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callActive]);

  // Auto-scroll conversation
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript, isAiResponding]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startCall = () => {
    setCallActive(true);
    setCallDuration(0);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repInput.trim() || isAiResponding) return;

    const message = repInput.trim();
    const currentTimestamp = formatTime(callDuration);

    // 1. Append Rep message
    const updatedTranscript: DialogueTurn[] = [
      ...transcript,
      { role: 'rep', content: message, timestamp: currentTimestamp }
    ];
    setTranscript(updatedTranscript);
    setRepInput('');
    setIsAiResponding(true);

    // Check objectives heuristic
    const lower = message.toLowerCase();
    setObjectives(prev => prev.map((obj, i) => {
      if (i === 0 && (lower.includes('understand') || lower.includes('hear you') || lower.includes('fair'))) {
        return { ...obj, completed: true };
      }
      if (i === 1 && (lower.includes('benchmark') || lower.includes('sla') || lower.includes('%') || lower.includes('model'))) {
        return { ...obj, completed: true };
      }
      if (i === 2 && (lower.includes('?') && (lower.includes('diagnostic') || lower.includes('calendar') || lower.includes('thursday') || lower.includes('10 minutes')))) {
        return { ...obj, completed: true };
      }
      return obj;
    }));

    // 2. Fetch AI Prospect Persona Response
    try {
      const res = await fetch('/api/rebuttal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message }),
      });

      // Simulating realistic AI buyer response adapted to persona prompt
      setTimeout(() => {
        let aiReply = "Look, that sounds okay on paper, but how does this actually save my team from dealing with unqualified lead drop-offs?";
        if (lower.includes('diagnostic') || lower.includes('10-minute') || lower.includes('benchmark')) {
          aiReply = "Alright, fair enough. If it's literally just 10 minutes to review the cost benchmark, put 10:30 AM on Thursday on my calendar.";
          setObjectives(prev => prev.map(o => ({ ...o, completed: true })));
        } else if (lower.includes('understand') || lower.includes('makes sense')) {
          aiReply = "I appreciate you hearing me out. What makes your SDR hold rate any different from the agencies that burned us?";
        }

        setTranscript(prev => [
          ...prev,
          { role: 'prospect', content: aiReply, timestamp: formatTime(callDuration + 2) }
        ]);
        setIsAiResponding(false);
      }, 900);

    } catch (err) {
      console.error('Error during sparring dialogue:', err);
      setIsAiResponding(false);
    }
  };

  const endCallAndGrade = async () => {
    setIsFinishingCall(true);
    setCallActive(false);

    try {
      const sessionId = `session-${Date.now()}`;
      const payload = {
        sessionId,
        scenario: `${persona.name} (${persona.title}) - ${persona.companyType}`,
        transcript: transcript.map(t => ({
          role: t.role,
          content: t.content,
          timestamp: t.timestamp
        }))
      };

      const res = await fetch('/api/webhooks/elevenlabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      const targetId = data.sessionId || sessionId;

      // Store in sessionStorage as instantaneous fallback for direct display
      if (data.evaluation) {
        sessionStorage.setItem(`eval-${targetId}`, JSON.stringify(data.evaluation));
      }

      router.push(`/sparring/scorecard/${targetId}`);
    } catch (err) {
      console.error('Error ending call:', err);
      router.push(`/sparring/scorecard/fallback-session`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Room Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/sparring"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-3">
            <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${persona.avatarBg} flex items-center justify-center text-white font-black text-xs shadow-md`}>
              {persona.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-100">{persona.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-semibold">
                  {persona.title}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{persona.companyType}</p>
            </div>
          </div>
        </div>

        {/* Telemetry Status & Timer */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <Clock className="h-3.5 w-3.5 text-red-500" />
            <span>{formatTime(callDuration)}</span>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
            callActive
              ? 'bg-emerald-950/60 border-emerald-700/80 text-emerald-400'
              : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}>
            <span className={`h-2 w-2 rounded-full ${callActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            {callActive ? 'VOICE CALL LIVE' : 'AWAITING DIAL-IN'}
          </div>
        </div>
      </header>

      {/* Main Room Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Call Wave & Conversation (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          
          {/* Waveform / Call Centerpiece Card */}
          <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-3xl pointer-events-none" />

            {/* Persona Avatar Pulse */}
            <div className="relative mb-5">
              <div className={`h-24 w-24 rounded-3xl bg-gradient-to-br ${persona.avatarBg} flex items-center justify-center text-white font-black text-2xl shadow-xl border-2 border-white/20 relative z-10`}>
                {persona.name.split(' ').map(n => n[0]).join('')}
              </div>
              {callActive && (
                <div className="absolute inset-0 rounded-3xl bg-red-500/20 animate-ping pointer-events-none" />
              )}
            </div>

            <h2 className="text-lg font-black text-white">{persona.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{persona.scenario}</p>

            {/* Animated Wave Indicator */}
            <div className="flex items-center gap-1.5 h-12 my-6">
              {[18, 36, 54, 28, 48, 64, 32, 58, 20, 42, 60, 24].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-300 ${
                    callActive
                      ? isAiResponding ? 'bg-red-500 animate-pulse' : 'bg-emerald-400/80'
                      : 'bg-slate-800'
                  }`}
                  style={{
                    height: callActive ? `${isAiResponding ? (i % 2 === 0 ? h : h * 0.6) : 12}px` : '8px'
                  }}
                />
              ))}
            </div>

            {/* Main Call Action Buttons */}
            {!callActive ? (
              <button
                onClick={startCall}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs tracking-wider uppercase transition-all shadow-xl shadow-red-900/40 border border-red-400/30 ring-4 ring-red-500/10 flex items-center gap-2.5"
              >
                <Radio className="h-4 w-4" />
                <span>DIAL IN & START SPARRING</span>
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isMuted
                      ? 'bg-rose-950/80 border-rose-800 text-rose-400'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>

                <button
                  onClick={endCallAndGrade}
                  disabled={isFinishingCall}
                  className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs tracking-wider uppercase transition-all shadow-xl shadow-rose-900/40 border border-rose-400/40 flex items-center gap-2"
                >
                  <PhoneOff className="h-4 w-4" />
                  <span>{isFinishingCall ? 'GENERATING SCORECARD...' : 'END CALL & GRADE'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Interactive Dialogue Feed */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-xl min-h-[300px]">
            <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Call Dialogue Feed
              </span>
              <span className="text-[11px] text-slate-500">
                {transcript.length} turns recorded
              </span>
            </div>

            <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto space-y-3.5 max-h-[320px]">
              {transcript.map((t, i) => (
                <div
                  key={i}
                  className={`flex flex-col gap-1 max-w-[85%] ${
                    t.role === 'rep' ? 'ml-auto items-end' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wide ${
                      t.role === 'rep' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {t.role === 'rep' ? 'Sales Rep (You)' : persona.name}
                    </span>
                    <span className="text-[10px] text-slate-500">{t.timestamp}</span>
                  </div>
                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    t.role === 'rep'
                      ? 'bg-slate-800 border border-slate-700 text-slate-100 rounded-tr-none'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}>
                    {t.content}
                  </div>
                </div>
              ))}

              {isAiResponding && (
                <div className="flex flex-col gap-1 max-w-[80%]">
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide">
                    {persona.name} (Thinking...)
                  </span>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-500 italic">
                    Analyzing rep statement and forming pushback...
                  </div>
                </div>
              )}
            </div>

            {/* Rep Response Input */}
            <form onSubmit={handleSendMessage} className="p-3 bg-slate-950/80 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={repInput}
                onChange={(e) => setRepInput(e.target.value)}
                disabled={!callActive || isAiResponding}
                placeholder={callActive ? "Respond with ARM (Acknowledge, Respond, Move)..." : "Start call above to begin speaking..."}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500/60 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!callActive || !repInput.trim() || isAiResponding}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5"
              >
                <span>Speak</span>
                <Send className="h-3 w-3" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Objectives Checklist & Scenario Brief (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Objectives Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                Live Objectives
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                {objectives.filter(o => o.completed).length} / {objectives.length}
              </span>
            </div>

            <div className="space-y-3">
              {objectives.map((obj) => (
                <div
                  key={obj.id}
                  onClick={() => {
                    setObjectives(prev => prev.map(o => o.id === obj.id ? { ...o, completed: !o.completed } : o));
                  }}
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 cursor-pointer transition-all ${
                    obj.completed
                      ? 'bg-emerald-950/30 border-emerald-800/50 text-slate-200'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className={`h-4 w-4 rounded-full mt-0.5 shrink-0 flex items-center justify-center border ${
                    obj.completed
                      ? 'bg-emerald-500 border-emerald-400 text-white'
                      : 'border-slate-600'
                  }`}>
                    {obj.completed && <CheckCircle className="h-3.5 w-3.5" />}
                  </div>
                  <span className={obj.completed ? 'line-through text-slate-400' : ''}>
                    {obj.description}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Persona Behavioral Rules */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 text-xs text-slate-400 space-y-3">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Buyer Behavioral Rules
            </h4>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 italic">
              "{persona.coreObjection}"
            </div>
            <p className="leading-relaxed">
              If you argue with their position, this persona will harden their defensiveness. Validate with tactical empathy first, introduce the reframe, and ask for a 10-minute diagnostic.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SparringRoomPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs font-mono">LOADING SPARRING ROOM...</div>}>
      <SparringRoomContent />
    </Suspense>
  );
}
