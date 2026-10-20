'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Volume2, 
  Copy, 
  Check, 
  ShieldAlert, 
  Send, 
  Clock, 
  Radio, 
  RotateCcw,
  ChevronRight,
  Zap,
  Flame,
  Layers
} from 'lucide-react';
import { MicStreamer } from '@/lib/audio/micStream';
import { ScribeSocketClient } from '@/lib/audio/scribeSocket';
import { ArmRebuttalResponse, TranscriptEntry } from '@/types';

export default function RepCockpitPage() {
  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const [interimText, setInterimText] = useState('');
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([
    {
      id: 'welcome',
      speaker: 'system',
      text: 'AI Boris Live Cockpit online. Ready to stream 16kHz audio and intercept objections.',
      timestamp: '00:00',
    }
  ]);
  const [activeRebuttal, setActiveRebuttal] = useState<ArmRebuttalResponse | null>({
    has_objection: true,
    objection_type: 'Incumbent Vendor',
    acknowledge: 'I completely understand—you have an established rhythm with them.',
    respond: 'Most teams we work with kept their incumbent for tier-1 tasks while leveraging us to fix their high-value bottleneck.',
    move: 'Would you be against a 10-minute diagnostic to benchmark your current SLA costs?',
    latency_ms: 118,
    source: 'vector_db'
  });
  const [rebuttalHistory, setRebuttalHistory] = useState<ArmRebuttalResponse[]>([]);
  const [isProcessingRebuttal, setIsProcessingRebuttal] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  const micStreamerRef = useRef<MicStreamer | null>(null);
  const scribeClientRef = useRef<ScribeSocketClient | null>(null);
  const transcriptScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript container
  useEffect(() => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTop = transcriptScrollRef.current.scrollHeight;
    }
  }, [transcripts, interimText]);

  // Handle Objection Rebuttal Trigger
  const triggerRebuttal = useCallback(async (phrase: string) => {
    if (!phrase || phrase.trim().length < 3) return;

    setIsProcessingRebuttal(true);
    const startTimestamp = Date.now();

    try {
      const res = await fetch('/api/rebuttal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: phrase }),
      });

      if (res.ok) {
        const data: ArmRebuttalResponse = await res.json();
        if (data.has_objection) {
          setActiveRebuttal(data);
          setRebuttalHistory(prev => [data, ...prev.slice(0, 4)]);
        }
      }
    } catch (err) {
      console.error('Failed to trigger rebuttal:', err);
    } finally {
      setIsProcessingRebuttal(false);
    }
  }, []);

  // Browser Speech Recognition Fallback for local dev/mic input
  const speechRecRef = useRef<any>(null);

  const startListening = async () => {
    setAudioError(null);
    try {
      // 1. Initialize Scribe Socket
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
        },
        onError: (err) => console.warn('Scribe error:', err)
      });
      scribeClientRef.current = scribeClient;
      await scribeClient.connect();

      // 2. Initialize Hardware Mic Streamer (16kHz, Web Audio API)
      const micStreamer = new MicStreamer({
        sampleRate: 16000,
        chunkDurationMs: 200,
        onVolumeChange: (vol) => setVolume(vol),
        onPcmChunk: (chunk) => {
          scribeClient.sendPcmChunk(chunk);
        },
        onError: (err) => {
          setAudioError(err.message || 'Microphone access denied');
          setIsListening(false);
        }
      });
      micStreamerRef.current = micStreamer;
      await micStreamer.start();

      // 3. Companion Browser SpeechRecognition for immediate client-side transcription
      if (typeof window !== 'undefined') {
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRec) {
          try {
            const recognition = new SpeechRec();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (e: any) => {
              let currentInterim = '';
              for (let i = e.resultIndex; i < e.results.length; ++i) {
                const transcriptPiece = e.results[i][0].transcript;
                if (e.results[i].isFinal) {
                  setInterimText('');
                  const cleanText = transcriptPiece.trim();
                  if (cleanText) {
                    setTranscripts(prev => [
                      ...prev,
                      {
                        id: String(Date.now()),
                        speaker: 'prospect',
                        text: cleanText,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                      }
                    ]);
                    triggerRebuttal(cleanText);
                  }
                } else {
                  currentInterim += transcriptPiece;
                }
              }
              if (currentInterim) {
                setInterimText(currentInterim);
              }
            };

            recognition.onerror = (e: any) => {
              console.warn('SpeechRecognition notice:', e.error);
            };

            recognition.start();
            speechRecRef.current = recognition;
          } catch (srErr) {
            console.warn('Speech recognition start note:', srErr);
          }
        }
      }

      setIsListening(true);
    } catch (err: any) {
      setAudioError(err.message || 'Could not start audio listener');
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
      try {
        speechRecRef.current.stop();
      } catch {}
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

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    const input = customInput.trim();
    setTranscripts(prev => [
      ...prev,
      {
        id: String(Date.now()),
        speaker: 'prospect',
        text: input,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }
    ]);
    triggerRebuttal(input);
    setCustomInput('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-red-500/30">
      {/* Top Telemetry Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-500/20 border border-red-500/30">
            <Radio className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                APPOINTMENTLYY
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-800/50 font-semibold tracking-wider uppercase">
                AI Boris Cockpit
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">BPO Realtime Objection Interceptor & Enablement HUD</p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-400">
            <span className="text-slate-500 font-semibold uppercase tracking-wider">Campaign:</span>
            <span className="text-slate-200 font-medium">Enterprise Outbound Q4</span>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold tracking-wide transition-all ${
            isListening 
              ? 'bg-emerald-950/60 border-emerald-700/80 text-emerald-400 shadow-sm shadow-emerald-900/40' 
              : 'bg-slate-900/80 border-slate-800 text-slate-400'
          }`}>
            <span className={`h-2 w-2 rounded-full ${isListening ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
            {isListening ? 'LIVE AUDIO ACTIVE' : 'AUDIO STANDBY'}
          </div>
        </div>
      </header>

      {/* Main Cockpit Layout */}
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1700px] w-full mx-auto">
        
        {/* LEFT COLUMN: Audio Control & Live Transcript (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Audio Telemetry & Control Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-32 bg-red-600/5 blur-3xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
              {/* Big Mic Button */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`relative group flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 shadow-xl ${
                    isListening
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40 border border-rose-400/40 ring-4 ring-rose-500/20'
                      : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white shadow-red-900/40 border border-red-400/30'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-5 w-5 text-white" />
                      <span>STOP LISTENING</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-5 w-5 text-white" />
                      <span>START LISTENING</span>
                    </>
                  )}
                </button>

                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-300">
                    {isListening ? 'Streaming 16kHz PCM' : 'Microphone Inactive'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Scribe v2 Real-time STT
                  </span>
                </div>
              </div>

              {/* Live VU Sound Level Meter */}
              <div className="flex items-center gap-3 w-full sm:w-64 bg-slate-950/80 border border-slate-800/80 rounded-xl p-3">
                <Volume2 className={`h-4 w-4 ${isListening && volume > 5 ? 'text-red-400' : 'text-slate-600'}`} />
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>MIC LEVEL</span>
                    <span>{volume}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full transition-all duration-75 rounded-full ${
                        volume > 70 ? 'bg-rose-500' : volume > 35 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${volume}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {audioError && (
              <div className="mt-4 p-3 bg-red-950/40 border border-red-800/50 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-red-400 shrink-0" />
                <span>{audioError}</span>
              </div>
            )}

            {/* Quick Test Triggers */}
            <div className="mt-4 pt-4 border-t border-slate-800/60 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1">
                Simulate:
              </span>
              {[
                { label: 'Incumbent Vendor', text: 'We already work with another vendor and we are happy with them.' },
                { label: 'Budget/Price', text: 'We do not have the budget for any new software right now.' },
                { label: 'Send Email', text: 'Just send me an email with your deck and pricing.' },
                { label: 'Gatekeeper', text: 'I am not the right person, you need to talk to procurement.' },
              ].map((sim) => (
                <button
                  key={sim.label}
                  onClick={() => {
                    setTranscripts(prev => [
                      ...prev,
                      {
                        id: String(Date.now()),
                        speaker: 'prospect',
                        text: sim.text,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }
                    ]);
                    triggerRebuttal(sim.text);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/60 text-[11px] text-slate-300 font-medium transition-colors"
                >
                  {sim.label}
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Scrolling Transcript Ticker */}
          <div className="flex-1 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-xl min-h-[380px]">
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Live Conversation Ticker
                </h3>
              </div>
              <button
                onClick={() => setTranscripts([])}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                Clear
              </button>
            </div>

            {/* Transcript Scroll Area */}
            <div 
              ref={transcriptScrollRef}
              className="flex-1 p-5 overflow-y-auto space-y-3.5 font-sans"
            >
              {transcripts.map((t) => (
                <div 
                  key={t.id}
                  className={`flex flex-col gap-1 ${
                    t.speaker === 'system' ? 'items-center text-center my-2' : ''
                  }`}
                >
                  {t.speaker === 'system' ? (
                    <span className="text-[11px] text-slate-500 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                      {t.text}
                    </span>
                  ) : (
                    <div className="flex flex-col gap-1 max-w-[85%]">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-red-400 uppercase tracking-wide">
                          Prospect
                        </span>
                        <span className="text-[10px] text-slate-500">{t.timestamp}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 leading-relaxed shadow-sm">
                        {t.text}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Interim Live Typing Bubble */}
              {interimText && (
                <div className="flex flex-col gap-1 max-w-[85%] animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                      Prospect (Live)
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-cyan-800/40 text-sm text-cyan-200/80 italic leading-relaxed">
                    {interimText}...
                  </div>
                </div>
              )}
            </div>

            {/* Manual Text Input Bar */}
            <form onSubmit={handleManualSubmit} className="p-3 bg-slate-950/70 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Type a prospect objection (e.g. 'we are happy with our agency')..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500/60 transition-colors"
              />
              <button
                type="submit"
                disabled={!customInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5"
              >
                <span>Send</span>
                <Send className="h-3 w-3" />
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Boris ARM Rebuttal HUD (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Active Rebuttal Card */}
          <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-red-600/10 to-transparent blur-2xl pointer-events-none" />

            {/* HUD Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  AI Boris ARM Rebuttal HUD
                </h2>
              </div>

              {activeRebuttal?.latency_ms && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  <Zap className="h-3 w-3 text-amber-400" />
                  <span>{activeRebuttal.latency_ms}ms</span>
                </div>
              )}
            </div>

            {/* Rebuttal Content */}
            {activeRebuttal && activeRebuttal.has_objection ? (
              <div className="flex flex-col gap-5">
                
                {/* Objection Category Banner */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-red-950/30 border border-red-800/40">
                  <div className="flex items-center gap-2.5">
                    <Flame className="h-5 w-5 text-red-400" />
                    <div>
                      <span className="text-[10px] text-red-400/80 uppercase font-bold tracking-wider block">
                        Detected Objection
                      </span>
                      <span className="text-sm font-bold text-slate-100">
                        {activeRebuttal.objection_type || 'Sales Friction'}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 uppercase font-mono">
                    {activeRebuttal.source || 'Vector DB'}
                  </span>
                </div>

                {/* [A] Acknowledge Badge Card */}
                <div className="group relative rounded-xl p-4 bg-slate-950/70 border border-purple-900/40 hover:border-purple-600/50 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-lg bg-purple-900/60 text-purple-300 border border-purple-500/40 text-xs font-black flex items-center justify-center">
                        A
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                        Acknowledge (Tactical Empathy)
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(activeRebuttal.acknowledge || '', 'ack')}
                      className="text-slate-500 hover:text-slate-300 transition-colors"
                      title="Copy Acknowledge"
                    >
                      {copiedKey === 'ack' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed font-sans pl-8">
                    "{activeRebuttal.acknowledge}"
                  </p>
                </div>

                {/* [R] Respond Badge Card */}
                <div className="group relative rounded-xl p-4 bg-slate-950/70 border border-emerald-900/40 hover:border-emerald-600/50 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-lg bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 text-xs font-black flex items-center justify-center">
                        R
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                        Respond (Value Reframe)
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(activeRebuttal.respond || '', 'resp')}
                      className="text-slate-500 hover:text-slate-300 transition-colors"
                      title="Copy Respond"
                    >
                      {copiedKey === 'resp' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed font-sans pl-8">
                    "{activeRebuttal.respond}"
                  </p>
                </div>

                {/* [M] Move Badge Card */}
                <div className="group relative rounded-xl p-4 bg-slate-950/70 border border-amber-900/40 hover:border-amber-600/50 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-lg bg-amber-900/60 text-amber-300 border border-amber-500/40 text-xs font-black flex items-center justify-center">
                        M
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                        Move (Micro-Commitment CTA)
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(activeRebuttal.move || '', 'move')}
                      className="text-slate-500 hover:text-slate-300 transition-colors"
                      title="Copy Move"
                    >
                      {copiedKey === 'move' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed font-sans pl-8">
                    "{activeRebuttal.move}"
                  </p>
                </div>

                {/* Copy Entire Rebuttal Button */}
                <button
                  onClick={() => {
                    const fullText = `${activeRebuttal.acknowledge} ${activeRebuttal.respond} ${activeRebuttal.move}`;
                    copyToClipboard(fullText, 'full');
                  }}
                  className="mt-2 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-bold text-slate-200 tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {copiedKey === 'full' ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-400">COPIED FULL ARM TALK TRACK</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-slate-400" />
                      <span>COPY FULL ARM TALK TRACK</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-slate-500">
                <Sparkles className="h-10 w-10 text-slate-700 mb-3 animate-pulse" />
                <p className="text-sm font-semibold text-slate-400">Awaiting prospect friction...</p>
                <p className="text-xs text-slate-600 mt-1 max-w-xs">
                  Speak into the microphone or simulate an objection above to inspect ARM generation.
                </p>
              </div>
            )}
          </div>

          {/* Previous Objections Telemetry List */}
          {rebuttalHistory.length > 0 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="h-4 w-4 text-slate-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Call Objection Stream ({rebuttalHistory.length})
                </h4>
              </div>
              <div className="space-y-2">
                {rebuttalHistory.map((h, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveRebuttal(h)}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <span className="font-semibold text-slate-200">{h.objection_type}</span>
                    <span className="text-slate-500 font-mono text-[10px]">{h.latency_ms}ms</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
