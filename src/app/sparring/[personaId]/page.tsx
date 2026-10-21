'use client';

import React, { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  CheckCircle, 
  Clock, 
  Sparkles, 
  Send, 
  ArrowLeft, 
  Radio,
  CheckCircle2,
  Circle,
  Play,
  Pause,
  AlertCircle,
  Headphones,
  RotateCcw
} from 'lucide-react';
import { SPARRING_PERSONAS } from '@/lib/personas';
import { DialogueTurn } from '@/lib/qaEvaluator';
import AppSidebar from '@/components/AppSidebar';
import GlobalTopHeader from '@/components/GlobalTopHeader';

// Browser speech recognition types
interface SpeechRecognitionResultItem {
  transcript: string;
}
interface SpeechRecognitionResultList {
  length: number;
  [index: number]: {
    length: number;
    [index: number]: SpeechRecognitionResultItem;
  };
}
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

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
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [micLiveText, setMicLiveText] = useState('');
  const [activeAudioTurn, setActiveAudioTurn] = useState<number | null>(null);

  const [transcript, setTranscript] = useState<(DialogueTurn & { audioUrl?: string })[]>([
    {
      role: 'prospect',
      content: `${persona.name} here. ${persona.coreObjection}`,
      timestamp: '00:01'
    }
  ]);

  const [objectives, setObjectives] = useState(
    persona.objectives.map(o => ({ ...o, completed: false }))
  );
  const [isFinishingCall, setIsFinishingCall] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

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

  // Play audio helper
  const playVoiceAudio = useCallback((audioUrl: string, turnIndex?: number) => {
    if (isMuted) return;
    try {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audioElementRef.current = audio;
      setIsPlayingAudio(true);
      if (turnIndex !== undefined) setActiveAudioTurn(turnIndex);

      audio.onended = () => {
        setIsPlayingAudio(false);
        setActiveAudioTurn(null);
      };
      audio.onerror = () => {
        setIsPlayingAudio(false);
        setActiveAudioTurn(null);
      };
      audio.play().catch(e => {
        console.warn('Audio auto-play prevented by browser policy:', e);
        setIsPlayingAudio(false);
        setActiveAudioTurn(null);
      });
    } catch (e) {
      console.warn('Voice play error:', e);
      setIsPlayingAudio(false);
      setActiveAudioTurn(null);
    }
  }, [isMuted]);

  // Start Call & Dial in
  const startCall = async () => {
    setCallActive(true);
    setCallDuration(0);
    setIsAiResponding(true);

    try {
      const res = await fetch('/api/sparring/dial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaId: persona.id })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.greetingText) {
          setTranscript([
            {
              role: 'prospect',
              content: data.greetingText,
              timestamp: '00:01',
              audioUrl: data.audioUrl
            }
          ]);

          if (data.audioUrl) {
            playVoiceAudio(data.audioUrl, 0);
          }
        }
      }
    } catch (err) {
      console.warn('Dial request note:', err);
    } finally {
      setIsAiResponding(false);
    }
  };

  // Speech Recognition Setup
  const toggleMicrophone = () => {
    if (isListeningMic) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListeningMic(false);
      setMicLiveText('');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Your browser does not support the Web Speech Recognition API. You can type in the response bar below.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListeningMic(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = '';
        for (let i = 0; i < event.results.length; i++) {
          interim += event.results[i][0].transcript;
        }
        setMicLiveText(interim);
        setRepInput(interim);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListeningMic(false);
      };

      recognition.onend = () => {
        setIsListeningMic(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Microphone error:', err);
      setIsListeningMic(false);
    }
  };

  // Dispatch turn message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!repInput.trim() || isAiResponding) return;

    if (isListeningMic && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListeningMic(false);
    }

    const message = repInput.trim();
    const currentTimestamp = formatTime(callDuration);
    const updatedTurns = [
      ...transcript,
      { role: 'rep' as const, content: message, timestamp: currentTimestamp }
    ];

    setTranscript(updatedTurns);
    setRepInput('');
    setMicLiveText('');
    setIsAiResponding(true);

    try {
      const res = await fetch('/api/sparring/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: persona.id,
          transcript: updatedTurns,
          repMessage: message,
          objectives
        })
      });

      if (res.ok) {
        const data = await res.json();
        const aiReply = data.reply || "I hear your point, but explain to me how this delivers measurable value.";
        const audioUrl = data.audioUrl;
        const newTimestamp = formatTime(callDuration + 2);

        // Update objectives checklist
        if (Array.isArray(data.completedObjectiveIds) && data.completedObjectiveIds.length > 0) {
          setObjectives(prev => prev.map(obj => ({
            ...obj,
            completed: obj.completed || data.completedObjectiveIds.includes(obj.id)
          })));
        }

        const newTurnIndex = updatedTurns.length;
        setTranscript(prev => [
          ...prev,
          {
            role: 'prospect',
            content: aiReply,
            timestamp: newTimestamp,
            audioUrl
          }
        ]);

        if (audioUrl) {
          playVoiceAudio(audioUrl, newTurnIndex);
        }
      } else {
        // Fallback response
        const fallbackReply = "That's an interesting approach, but what kind of turnaround time and hold rate can you commit to?";
        setTranscript(prev => [
          ...prev,
          {
            role: 'prospect',
            content: fallbackReply,
            timestamp: formatTime(callDuration + 2)
          }
        ]);
      }
    } catch (err) {
      console.error('Turn dispatch error:', err);
    } finally {
      setIsAiResponding(false);
    }
  };

  // End Call and Trigger Automated Scoring
  const endCallAndGrade = async () => {
    setIsFinishingCall(true);
    setCallActive(false);
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    if (isListeningMic && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

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
            <div className="bg-white border border-[#222021]/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-2xs relative overflow-hidden">
              <div className="flex items-center gap-2 absolute top-4 right-4">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 text-[10px] font-mono text-[#6b6968] border border-zinc-200">
                  <Headphones className="h-3 w-3 text-[#ED1C24]" />
                  <span>ElevenLabs Voice</span>
                </span>
              </div>

              <div className="h-16 w-16 rounded-2xl bg-[#222021] text-white font-black text-xl flex items-center justify-center shadow-sm mb-3">
                {persona.name.split(' ').map(n => n[0]).join('')}
              </div>

              <h2 className="text-base font-bold text-[#222021]">{persona.name}</h2>
              <p className="text-xs text-[#6b6968] mt-0.5 max-w-md">{persona.scenario}</p>

              {/* Dynamic Voice Waveform Indicator */}
              <div className="flex items-center gap-1.5 h-12 my-3">
                {[14, 28, 42, 24, 36, 46, 26, 40, 18, 32, 44, 20, 30, 48, 22].map((h, i) => {
                  const isActive = callActive && (isAiResponding || isPlayingAudio || isListeningMic);
                  const dynamicHeight = isActive
                    ? isPlayingAudio
                      ? (i % 2 === 0 ? h : h * 0.7)
                      : isListeningMic
                      ? (i % 3 === 0 ? h * 0.8 : h * 0.5)
                      : (i % 2 === 0 ? 20 : 10)
                    : 6;

                  return (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all duration-200 ${
                        isActive
                          ? isPlayingAudio
                            ? 'bg-[#ED1C24] animate-pulse'
                            : isListeningMic
                            ? 'bg-emerald-500 animate-pulse'
                            : 'bg-[#222021]'
                          : 'bg-[#d8d5d3]'
                      }`}
                      style={{
                        height: `${dynamicHeight}px`
                      }}
                    />
                  );
                })}
              </div>

              {/* Status pill under wave */}
              <div className="h-5 mb-2">
                {isPlayingAudio && (
                  <span className="text-[11px] font-mono text-[#ED1C24] flex items-center gap-1">
                    <Sparkles className="h-3 w-3 animate-spin" />
                    <span>{persona.name} is speaking via ElevenLabs...</span>
                  </span>
                )}
                {isListeningMic && !isPlayingAudio && (
                  <span className="text-[11px] font-mono text-emerald-600 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Listening to your microphone... speak now</span>
                  </span>
                )}
                {!isPlayingAudio && !isListeningMic && callActive && (
                  <span className="text-[11px] font-mono text-[#6b6968]">
                    Your turn: Speak with microphone or type your response below
                  </span>
                )}
              </div>

              {/* Call Control Actions */}
              {!callActive ? (
                <button
                  onClick={startCall}
                  className="px-6 py-2.5 rounded-xl bg-[#ED1C24] hover:bg-[#d0181f] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-2xs flex items-center gap-2 cursor-pointer"
                >
                  <Radio className="h-4 w-4" />
                  <span>DIAL IN & START CONVERSATION</span>
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  {/* Microphone Toggle Button */}
                  <button
                    onClick={toggleMicrophone}
                    title={isListeningMic ? "Mute microphone" : "Speak hands-free with microphone"}
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isListeningMic
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700 animate-pulse'
                        : 'bg-[#F2F0EF] border-[#222021]/10 text-[#222021] hover:bg-[#e7e4e2]'
                    }`}
                  >
                    {isListeningMic ? <Mic className="h-4 w-4 text-emerald-600" /> : <MicOff className="h-4 w-4 text-[#6b6968]" />}
                    <span>{isListeningMic ? 'Mic Live (Listening)' : 'Turn On Mic'}</span>
                  </button>

                  {/* Speaker Mute Toggle */}
                  <button
                    onClick={() => {
                      if (!isMuted && audioElementRef.current) {
                        audioElementRef.current.pause();
                        setIsPlayingAudio(false);
                      }
                      setIsMuted(!isMuted);
                    }}
                    title={isMuted ? "Unmute audio" : "Mute audio"}
                    className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                      isMuted
                        ? 'bg-rose-50 border-rose-200 text-rose-700'
                        : 'bg-[#F2F0EF] border-[#222021]/10 text-[#222021] hover:bg-[#e7e4e2]'
                    }`}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>

                  {/* End Call & Grade */}
                  <button
                    onClick={endCallAndGrade}
                    disabled={isFinishingCall}
                    className="px-5 py-2.5 rounded-xl bg-[#222021] hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-2xs flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <PhoneOff className="h-4 w-4 text-[#ED1C24]" />
                    <span>{isFinishingCall ? 'GENERATING SCORECARD...' : 'END CALL & GRADE'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Dialogue Feed */}
            <div className="bg-white border border-[#222021]/10 rounded-2xl flex flex-col overflow-hidden shadow-2xs min-h-[320px]">
              <div className="px-4 py-2.5 border-b border-[#222021]/10 flex items-center justify-between bg-[#F2F0EF]/40">
                <span className="text-xs font-bold uppercase tracking-wider text-[#222021]">
                  Call Dialogue Feed ({transcript.length} turns)
                </span>
                <span className="text-[11px] font-mono text-[#6b6968] flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                  <span>ElevenLabs Realtime Voice Pipeline</span>
                </span>
              </div>

              <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[340px]">
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

                      {/* Replay audio button for prospect turns */}
                      {t.role === 'prospect' && t.audioUrl && (
                        <button
                          onClick={() => playVoiceAudio(t.audioUrl!, i)}
                          title="Replay Voice Audio"
                          className={`p-1 rounded hover:bg-[#e7e4e2] text-[#6b6968] transition-colors cursor-pointer ${
                            activeAudioTurn === i ? 'text-[#ED1C24]' : ''
                          }`}
                        >
                          <Play className="h-3 w-3" />
                        </button>
                      )}
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

              {/* Rep Spoken / Text Input Bar */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-[#222021]/10 bg-white flex items-center gap-2">
                <button
                  type="button"
                  disabled={!callActive || isAiResponding}
                  onClick={toggleMicrophone}
                  title="Toggle Microphone"
                  className={`p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                    isListeningMic
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'bg-[#F2F0EF] border-[#222021]/10 text-[#6b6968] hover:bg-[#e7e4e2]'
                  }`}
                >
                  <Mic className="h-4 w-4" />
                </button>

                <input
                  type="text"
                  disabled={!callActive || isAiResponding}
                  value={repInput}
                  onChange={(e) => setRepInput(e.target.value)}
                  placeholder={
                    !callActive 
                      ? "Dial in above to begin call..."
                      : isListeningMic
                      ? "Listening to your voice... (or type here)"
                      : "Type your spoken response or click the microphone..."
                  }
                  className="flex-1 bg-[#F2F0EF] border border-[#222021]/10 rounded-xl px-4 py-2 text-xs text-[#222021] placeholder-[#6b6968] focus:outline-none focus:bg-white focus:border-[#ED1C24] disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!callActive || !repInput.trim() || isAiResponding}
                  className="px-4 py-2 rounded-xl bg-[#ED1C24] hover:bg-[#d0181f] disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs shrink-0 cursor-pointer"
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
                {objectives.map((obj) => (
                  <div
                    key={obj.id}
                    className={`p-3 rounded-xl border transition-all duration-300 flex items-center gap-2.5 ${
                      obj.completed
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 font-semibold shadow-2xs'
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
            <div className="bg-white border border-[#222021]/10 rounded-2xl p-5 shadow-2xs space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#222021] block">
                  BUYER BEHAVIORAL RULES:
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-zinc-100 text-[#222021] border border-zinc-200">
                  {persona.difficulty}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F2F0EF] border border-[#222021]/10 text-[11px] text-[#222021] font-mono leading-relaxed">
                "{persona.coreObjection}"
              </div>

              <div className="space-y-1.5 text-[11px] text-[#6b6968] leading-relaxed">
                <p>
                  <strong className="text-[#222021]">Scenario:</strong> {persona.scenario}
                </p>
                <p>
                  <strong className="text-[#222021]">Tactical Hint:</strong> Validate their friction with tactical empathy before introducing the reframe. Conclude with a 10-minute diagnostic benchmark question.
                </p>
              </div>
            </div>

            {/* Voice Profile Card */}
            <div className="bg-white border border-[#222021]/10 rounded-2xl p-4 shadow-2xs flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-[#6b6968] block">Voice Accent</span>
                <span className="font-semibold text-[#222021]">{persona.accent}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono font-bold text-[#6b6968] block">Voice Engine</span>
                <span className="font-mono text-[11px] text-emerald-700 font-bold">ElevenLabs Turbo v2.5</span>
              </div>
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
