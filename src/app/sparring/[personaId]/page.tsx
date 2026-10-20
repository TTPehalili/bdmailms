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
  Radio,
  CheckCircle2,
  Circle,
  AlertCircle
} from 'lucide-react';
import { SPARRING_PERSONAS } from '@/lib/personas';
import { DialogueTurn } from '@/lib/qaEvaluator';
import AppSidebar from '@/components/AppSidebar';
import GlobalTopHeader from '@/components/GlobalTopHeader';

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
      if (i === 0 && (lower.includes('understand') || lower.includes('hear you') || lower.includes('fair') || lower.includes('appreciate'))) {
        return { ...obj, completed: true };
      }
      if (i === 1 && (lower.includes('benchmark') || lower.includes('diagnostic') || lower.includes('sla') || lower.includes('rate') || lower.includes('stack'))) {
        return { ...obj, completed: true };
      }
      if (i === 2 && (lower.includes('?') && (lower.includes('tuesday') || lower.includes('thursday') || lower.includes('calendar') || lower.includes('minutes')))) {
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

  const completedObjectivesCount = objectives.filter(o => o.completed).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F2F0EF] font-sans antialiased text-[#222021]">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <GlobalTopHeader />

        {/* Subheader Breadcrumb */}
        <div className="border-b border-[#222021]/10 bg-white px-8 py-2.5 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-3">
            <Link
              href="/sparring"
              className="p-1.5 rounded-lg bg-[#F2F0EF] hover:bg-[#e7e4e2] text-[#222021] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#222021]">{persona.name}</span>
              <span className="text-[#6b6968]">•</span>
              <span className="text-[#6b6968] font-medium">{persona.title} ({persona.companyType})</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F2F0EF] border border-[#222021]/10 font-mono text-[11px] text-[#222021] font-semibold">
              <Clock className="h-3.5 w-3.5 text-[#ED1C24]" />
              <span>{formatTime(callDuration)}</span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              callActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-[#F2F0EF] text-[#6b6968] border-[#222021]/10'
            }`}>
              {callActive ? 'Call Connected' : 'Awaiting Dial-in'}
            </span>
          </div>
        </div>

        {/* Main Room Body */}
        <main className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Live Call Wave & Conversation (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            
            {/* Waveform / Call Centerpiece Card */}
            <div className="bg-white border border-[#222021]/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-2xs">
              <div className="h-16 w-16 rounded-2xl bg-[#222021] text-white font-black text-xl flex items-center justify-center shadow-sm mb-3">
                {persona.name.split(' ').map(n => n[0]).join('')}
              </div>

              <h2 className="text-base font-bold text-[#222021]">{persona.name}</h2>
              <p className="text-xs text-[#6b6968] mt-0.5 max-w-md">{persona.scenario}</p>

              {/* Voice Waveform Indicator */}
              <div className="flex items-center gap-1.5 h-10 my-4">
                {[12, 24, 38, 20, 32, 42, 22, 36, 16, 28, 40, 18].map((h, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-300 ${
                      callActive
                        ? isAiResponding ? 'bg-[#ED1C24] animate-pulse' : 'bg-[#222021]'
                        : 'bg-[#d8d5d3]'
                    }`}
                    style={{
                      height: callActive ? `${isAiResponding ? (i % 2 === 0 ? h : h * 0.6) : 12}px` : '6px'
                    }}
                  />
                ))}
              </div>

              {/* Call Control Actions */}
              {!callActive ? (
                <button
                  onClick={startCall}
                  className="px-6 py-2.5 rounded-xl bg-[#ED1C24] hover:bg-[#d0181f] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-2xs flex items-center gap-2"
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
                        : 'bg-[#F2F0EF] border-[#222021]/10 text-[#222021] hover:bg-[#e7e4e2]'
                    }`}
                  >
                    {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>

                  <button
                    onClick={endCallAndGrade}
                    disabled={isFinishingCall}
                    className="px-5 py-2.5 rounded-xl bg-[#222021] hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-2xs flex items-center gap-2"
                  >
                    <PhoneOff className="h-4 w-4 text-[#ED1C24]" />
                    <span>{isFinishingCall ? 'GENERATING SCORECARD...' : 'END CALL & GRADE'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Dialogue Feed */}
            <div className="bg-white border border-[#222021]/10 rounded-2xl flex flex-col overflow-hidden shadow-2xs min-h-[300px]">
              <div className="px-4 py-2.5 border-b border-[#222021]/10 flex items-center justify-between bg-[#F2F0EF]/40">
                <span className="text-xs font-bold uppercase tracking-wider text-[#222021]">
                  Call Dialogue Feed ({transcript.length} turns)
                </span>
                <span className="text-[11px] font-mono text-[#6b6968]">
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
                        t.role === 'rep' ? 'text-[#ED1C24]' : 'text-[#6b6968]'
                      }`}>
                        {t.role === 'rep' ? 'Sales Rep (You)' : persona.name}
                      </span>
                      <span className="text-[10px] text-[#6b6968] font-mono">{t.timestamp}</span>
                    </div>
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      t.role === 'rep'
                        ? 'bg-[#ED1C24]/10 border border-[#ED1C24]/20 text-[#222021] rounded-tr-none'
                        : 'bg-[#F2F0EF] border border-[#222021]/10 text-[#222021] rounded-tl-none'
                    }`}>
                      {t.content}
                    </div>
                  </div>
                ))}

                {isAiResponding && (
                  <div className="flex items-center gap-2 text-xs text-[#6b6968] italic p-2">
                    <Sparkles className="h-3.5 w-3.5 text-[#ED1C24] animate-spin" />
                    <span>{persona.name} is speaking...</span>
                  </div>
                )}
              </div>

              {/* Rep Spoken Input Bar */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-[#222021]/10 bg-white flex items-center gap-2">
                <input
                  type="text"
                  disabled={!callActive || isAiResponding}
                  value={repInput}
                  onChange={(e) => setRepInput(e.target.value)}
                  placeholder={callActive ? "Type your spoken response or use headset..." : "Dial in above to begin call..."}
                  className="flex-1 bg-[#F2F0EF] border border-[#222021]/10 rounded-xl px-4 py-2 text-xs text-[#222021] placeholder-[#6b6968] focus:outline-none focus:bg-white focus:border-[#ED1C24] disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!callActive || !repInput.trim() || isAiResponding}
                  className="px-4 py-2 rounded-xl bg-[#ED1C24] hover:bg-[#d0181f] disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs shrink-0"
                >
                  <span>Speak</span>
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Live Objectives & Scoring Criteria (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            
            {/* Live Objectives Checklist */}
            <div className="bg-white border border-[#222021]/10 rounded-2xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#222021] flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-[#ED1C24]" />
                  <span>LIVE OBJECTIVES</span>
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#ED1C24]/10 text-[#ED1C24] border border-[#ED1C24]/20">
                  {completedObjectivesCount} / {objectives.length}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {objectives.map((obj, i) => (
                  <div
                    key={obj.id}
                    className={`p-3 rounded-xl border transition-colors flex items-center gap-2.5 ${
                      obj.completed
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900 font-semibold'
                        : 'bg-[#F2F0EF] border-[#222021]/10 text-[#6b6968]'
                    }`}
                  >
                    {obj.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-[#6b6968] shrink-0" />
                    )}
                    <span className="leading-snug">{obj.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Behavioral Rules / Persona Context */}
            <div className="bg-white border border-[#222021]/10 rounded-2xl p-5 shadow-2xs space-y-2.5 text-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-[#222021] block">
                BUYER BEHAVIORAL RULES:
              </span>
              <div className="p-3 rounded-xl bg-[#F2F0EF] border border-[#222021]/10 text-[11px] text-[#222021] font-mono leading-relaxed">
                "{persona.coreObjection}"
              </div>
              <p className="text-[11px] text-[#6b6968] leading-relaxed">
                Validate their friction with tactical empathy before introducing the reframe. Conclude with a 10-minute diagnostic benchmark question.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function SparringRoomPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#6b6968]">Loading Sparring Arena...</div>}>
      <SparringRoomContent />
    </Suspense>
  );
}
