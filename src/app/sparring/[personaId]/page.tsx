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
import NavigationHeader from '@/components/NavigationHeader';

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

    const updatedTranscript: DialogueTurn[] = [
      ...transcript,
      { role: 'rep', content: message, timestamp: currentTimestamp }
    ];
    setTranscript(updatedTranscript);
    setRepInput('');
    setIsAiResponding(true);

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

    try {
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
      }, 800);
    } catch {
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Shared Navbar */}
      <NavigationHeader />

      {/* Subheader Breadcrumb */}
      <div className="border-b border-slate-200 bg-white px-8 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/sparring"
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{persona.name}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 font-medium">{persona.title} ({persona.companyType})</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 font-mono text-[11px] text-slate-700 font-semibold">
            <Clock className="h-3.5 w-3.5 text-indigo-600" />
            <span>{formatTime(callDuration)}</span>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
            callActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            {callActive ? 'Call Connected' : 'Awaiting Dial-in'}
          </span>
        </div>
      </div>

      {/* Main Room Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Call Wave & Conversation (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          
          {/* Waveform / Call Centerpiece Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-xs">
            <div className="h-16 w-16 rounded-2xl bg-slate-900 text-white font-bold text-xl flex items-center justify-center shadow-sm mb-3">
              {persona.name.split(' ').map(n => n[0]).join('')}
            </div>

            <h2 className="text-base font-bold text-slate-900">{persona.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5 max-w-md">{persona.scenario}</p>

            {/* Voice Waveform Indicator */}
            <div className="flex items-center gap-1 h-10 my-4">
              {[12, 24, 38, 20, 32, 42, 22, 36, 16, 28, 40, 18].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-300 ${
                    callActive
                      ? isAiResponding ? 'bg-indigo-600 animate-pulse' : 'bg-emerald-500'
                      : 'bg-slate-200'
                  }`}
                  style={{
                    height: callActive ? `${isAiResponding ? (i % 2 === 0 ? h : h * 0.6) : 10}px` : '6px'
                  }}
                />
              ))}
            </div>

            {/* Call Control Actions */}
            {!callActive ? (
              <button
                onClick={startCall}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs flex items-center gap-2"
              >
                <Radio className="h-4 w-4" />
                <span>DIAL IN & START CONVERSATION</span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-2.5 rounded-xl border transition-colors ${
                    isMuted
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>

                <button
                  onClick={endCallAndGrade}
                  disabled={isFinishingCall}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs flex items-center gap-2"
                >
                  <PhoneOff className="h-4 w-4" />
                  <span>{isFinishingCall ? 'GENERATING SCORECARD...' : 'END CALL & GRADE'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Dialogue Feed */}
          <div className="bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-xs min-h-[300px]">
            <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Call Dialogue Feed ({transcript.length} turns)
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Turn-by-Turn Audio Log
              </span>
            </div>

            <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[320px]">
              {transcript.map((t, i) => (
                <div
                  key={i}
                  className={`flex flex-col gap-1 max-w-[85%] ${
                    t.role === 'rep' ? 'ml-auto items-end' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wide ${
                      t.role === 'rep' ? 'text-indigo-700' : 'text-slate-600'
                    }`}>
                      {t.role === 'rep' ? 'Sales Rep (You)' : persona.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{t.timestamp}</span>
                  </div>
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    t.role === 'rep'
                      ? 'bg-indigo-50 border border-indigo-200 text-indigo-950 rounded-tr-none'
                      : 'bg-slate-100 border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}>
                    {t.content}
                  </div>
                </div>
              ))}

              {isAiResponding && (
                <div className="flex flex-col gap-1 max-w-[80%]">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                    {persona.name} (Forming response...)
                  </span>
                  <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-500 italic">
                    Analyzing rep objection handling and delivering counter...
                  </div>
                </div>
              )}
            </div>

            {/* Rep Speech / Text Response Form */}
            <form onSubmit={handleSendMessage} className="p-3 bg-slate-50 border-t border-slate-200 flex gap-2">
              <input
                type="text"
                value={repInput}
                onChange={(e) => setRepInput(e.target.value)}
                disabled={!callActive || isAiResponding}
                placeholder={callActive ? "Respond with ARM (Acknowledge, Respond, Move)..." : "Dial in above to begin call..."}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!callActive || !repInput.trim() || isAiResponding}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-xs font-bold text-white transition-colors flex items-center gap-1.5"
              >
                <span>Speak</span>
                <Send className="h-3 w-3" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Live Objectives & Scenario Brief (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          
          {/* Objectives Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                Live Objectives
              </h3>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                {objectives.filter(o => o.completed).length} / {objectives.length}
              </span>
            </div>

            <div className="space-y-2">
              {objectives.map((obj) => (
                <div
                  key={obj.id}
                  onClick={() => {
                    setObjectives(prev => prev.map(o => o.id === obj.id ? { ...o, completed: !o.completed } : o));
                  }}
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 cursor-pointer transition-colors ${
                    obj.completed
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-medium'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className={`h-4 w-4 rounded-full mt-0.5 shrink-0 flex items-center justify-center border ${
                    obj.completed
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'border-slate-300 bg-white'
                  }`}>
                    {obj.completed && <CheckCircle className="h-3 w-3" />}
                  </div>
                  <span className={obj.completed ? 'line-through text-slate-400' : ''}>
                    {obj.description}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Persona Behavioral Rules */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 text-xs text-slate-600 space-y-2 shadow-xs">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
              Buyer Behavioral Rules:
            </span>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-800 italic">
              "{persona.coreObjection}"
            </div>
            <p className="leading-relaxed text-[11px] text-slate-500">
              Validating their friction with tactical empathy before introducing the reframe prevents psychological defensiveness. Conclude with a 10-minute benchmark question.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SparringRoomPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-mono text-slate-500">LOADING SPARRING ROOM...</div>}>
      <SparringRoomContent />
    </Suspense>
  );
}
