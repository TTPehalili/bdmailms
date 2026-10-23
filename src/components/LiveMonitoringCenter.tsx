'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Globe,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Loader2
} from 'lucide-react';

const SILENT_WAV = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

export interface DialogueTurn {
  id: string;
  speaker: string;
  role: 'rep' | 'prospect';
  text: string;
  time: string;
  voiceId: string;
}

export interface ActiveSparringSession {
  id: string;
  line: string;
  repName: string;
  repEmail: string;
  repGender: 'male' | 'female';
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
  recentTranscript: DialogueTurn[];
}

export default function LiveMonitoringCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'Hostile' | 'Skeptical' | 'Neutral' | 'Engaged'>('all');
  const [tenantFilter, setTenantFilter] = useState('all');
  
  // Audio playback state
  const [activeListeningSession, setActiveListeningSession] = useState<ActiveSparringSession | null>(null);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [volume, setVolume] = useState(85);
  
  // Whisper coach state
  const [whisperMessage, setWhisperMessage] = useState('');
  const [whisperFeedbackSent, setWhisperFeedbackSent] = useState(false);

  // Audio elements & memory cache
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<string, string>>(new Map());
  const isPlayingRef = useRef(false);
  const activeSessionRef = useRef<ActiveSparringSession | null>(null);
  const currentTurnIndexRef = useRef<number | null>(null);
  const pendingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep refs in sync for event listeners
  useEffect(() => {
    isPlayingRef.current = isAudioPlaying;
  }, [isAudioPlaying]);

  useEffect(() => {
    activeSessionRef.current = activeListeningSession;
  }, [activeListeningSession]);

  useEffect(() => {
    currentTurnIndexRef.current = currentTurnIndex;
  }, [currentTurnIndex]);

  // Volume & mute reactivity
  useEffect(() => {
    if (audioElementRef.current) {
      audioElementRef.current.volume = isAudioMuted ? 0 : volume / 100;
      audioElementRef.current.muted = isAudioMuted;
    }
  }, [volume, isAudioMuted]);

  // Active Sparring Lines on Floor with multi-turn real dialogues and ElevenLabs voice configs
  const [sessions, setSessions] = useState<ActiveSparringSession[]>([
    {
      id: 'sess-1',
      line: 'LINE 01',
      repName: 'Alex Mercer',
      repEmail: 'alex.mercer@apexglobal.ph',
      repGender: 'male',
      avatar: 'AM',
      tenant: 'Apex Global BPO',
      personaName: 'Julian Vance',
      personaRole: 'Managing Director & Outbound Head (Apex BPO)',
      personaDifficulty: 'High',
      countryAccent: 'Australia',
      initialSeconds: 228,
      currentObjection: '“We already buy shared leads from Outsource Accelerator. Why pay for private data?”',
      score: 88,
      sentiment: 'Engaged',
      wpm: 142,
      armStatus: { acknowledge: true, respond: true, move: false },
      recentTranscript: [
        {
          id: 'turn-1-1',
          speaker: 'Julian Vance (Buyer Persona)',
          role: 'prospect',
          text: 'We already buy shared lead packs from Outsource Accelerator, Alex. Why on earth would I pay for additional software?',
          time: '03:15',
          voiceId: 'pNInz6obpgDQGcFmaJgB' // Julian Vance (Australian Male Executive)
        },
        {
          id: 'turn-1-2',
          speaker: 'Alex Mercer (Rep)',
          role: 'rep',
          text: 'Totally fair, Julian. But OA sells those identical leads to 3 to 5 other BPOs simultaneously, so you end up in eight dollar per hour price wars.',
          time: '03:26',
          voiceId: 'CwhRBWXzGAHq8TQ4Fs17' // Roger (Confident Male SDR)
        },
        {
          id: 'turn-1-3',
          speaker: 'Julian Vance (Buyer Persona)',
          role: 'prospect',
          text: 'That is actually true. Our margins have taken a beating on those directory accounts. What are you doing differently?',
          time: '03:38',
          voiceId: 'pNInz6obpgDQGcFmaJgB'
        },
        {
          id: 'turn-1-4',
          speaker: 'Alex Mercer (Rep)',
          role: 'rep',
          text: 'We give you exclusive, verified tech-founder triggers before OA even lists them. Can I show you three live accounts right now?',
          time: '03:49',
          voiceId: 'CwhRBWXzGAHq8TQ4Fs17'
        },
        {
          id: 'turn-1-5',
          speaker: 'Julian Vance (Buyer Persona)',
          role: 'prospect',
          text: 'Alright Alex, pull them up on screen. If they are genuinely exclusive, you have got my attention.',
          time: '04:01',
          voiceId: 'pNInz6obpgDQGcFmaJgB'
        }
      ]
    },
    {
      id: 'sess-2',
      line: 'LINE 02',
      repName: 'Elena Rostova',
      repEmail: 'elena.r@fintechscaleups.com',
      repGender: 'female',
      avatar: 'ER',
      tenant: 'Fintech Scaleups',
      personaName: 'David M.',
      personaRole: 'VP of Sales (Acme Cloud Tech)',
      personaDifficulty: 'High',
      countryAccent: 'USA',
      initialSeconds: 142,
      currentObjection: '“Our reps ramp in 4 weeks, we already have internal enablement training.”',
      score: 84,
      sentiment: 'Skeptical',
      wpm: 136,
      armStatus: { acknowledge: true, respond: false, move: false },
      recentTranscript: [
        {
          id: 'turn-2-1',
          speaker: 'David M. (Buyer Persona)',
          role: 'prospect',
          text: 'We already have an internal enablement manager, Elena. Our reps ramp fine without extra tools.',
          time: '01:55',
          voiceId: 'cjVigY5qzO86Huf0OWal' // Eric (Senior Executive Male)
        },
        {
          id: 'turn-2-2',
          speaker: 'Elena Rostova (Rep)',
          role: 'rep',
          text: 'Understood, David. But does your enablement team drill 40 unscripted voice objection scenarios before their first live dial?',
          time: '02:08',
          voiceId: 'EXAVITQu4vr4xnSDxMaL' // Sarah (American SaaS Female SDR)
        },
        {
          id: 'turn-2-3',
          speaker: 'David M. (Buyer Persona)',
          role: 'prospect',
          text: 'No, they mostly read slide decks and shadow top performers on Gong.',
          time: '02:18',
          voiceId: 'cjVigY5qzO86Huf0OWal'
        },
        {
          id: 'turn-2-4',
          speaker: 'Elena Rostova (Rep)',
          role: 'rep',
          text: 'Shadowing is passive. When reps spar daily against our AI buyer personas, they hit quota in 12 days instead of 4 weeks.',
          time: '02:29',
          voiceId: 'EXAVITQu4vr4xnSDxMaL'
        },
        {
          id: 'turn-2-5',
          speaker: 'David M. (Buyer Persona)',
          role: 'prospect',
          text: 'Twelve days? That would save us thirty thousand a month in ramp burn. Show me how it works.',
          time: '02:40',
          voiceId: 'cjVigY5qzO86Huf0OWal'
        }
      ]
    },
    {
      id: 'sess-3',
      line: 'LINE 03',
      repName: 'Marcus Brody',
      repEmail: 'mbrody@horizonsolar.us',
      repGender: 'male',
      avatar: 'MB',
      tenant: 'Horizon Solar Sales Floor',
      personaName: 'Rick Henderson',
      personaRole: 'Skeptical Dual Homeowner ($450+ Power Bill)',
      personaDifficulty: 'Extreme',
      countryAccent: 'USA',
      initialSeconds: 254,
      currentObjection: '“Take me off your list! You guys call every Tuesday with fake utility rebates!”',
      score: 79,
      sentiment: 'Hostile',
      wpm: 155,
      armStatus: { acknowledge: true, respond: false, move: false },
      recentTranscript: [
        {
          id: 'turn-3-1',
          speaker: 'Rick Henderson (Buyer Persona)',
          role: 'prospect',
          text: 'Take me off your list! You guys call every Tuesday with fake utility rebates and I am sick of it!',
          time: '03:45',
          voiceId: 'SOYHLrjzK2X1ezoPC6cr' // Rick Henderson (Articulate Skeptical Male)
        },
        {
          id: 'turn-3-2',
          speaker: 'Marcus Brody (Rep)',
          role: 'rep',
          text: 'I completely hear your frustration Rick, I hate spam calls too. I am only calling because our team verified your substation rate rose 24% last month.',
          time: '03:56',
          voiceId: 'CwhRBWXzGAHq8TQ4Fs17' // Roger (Male SDR)
        },
        {
          id: 'turn-3-3',
          speaker: 'Rick Henderson (Buyer Persona)',
          role: 'prospect',
          text: 'Twenty four percent? Wait, is that why my bill jumped to four hundred and fifty dollars?',
          time: '04:09',
          voiceId: 'SOYHLrjzK2X1ezoPC6cr'
        },
        {
          id: 'turn-3-4',
          speaker: 'Marcus Brody (Rep)',
          role: 'rep',
          text: 'Spot on Rick. If you have two minutes, I will show you the exact rate lock that protects your bill from the next rate hike.',
          time: '04:20',
          voiceId: 'CwhRBWXzGAHq8TQ4Fs17'
        }
      ]
    },
    {
      id: 'sess-4',
      line: 'LINE 04',
      repName: 'Jordan Smith',
      repEmail: 'jsmith@oa-partner.com',
      repGender: 'male',
      avatar: 'JS',
      tenant: 'Outsource Accelerator Partner A',
      personaName: 'Sarah Jenkins',
      personaRole: 'VP Operations (Global Contact Center)',
      personaDifficulty: 'Medium',
      countryAccent: 'UK',
      initialSeconds: 118,
      currentObjection: '“Send me an email first, I am in back-to-back executive meetings.”',
      score: 91,
      sentiment: 'Skeptical',
      wpm: 140,
      armStatus: { acknowledge: true, respond: true, move: true },
      recentTranscript: [
        {
          id: 'turn-4-1',
          speaker: 'Sarah Jenkins (Buyer Persona)',
          role: 'prospect',
          text: 'Can you just shoot over an email? I am walking into an executive board session right now.',
          time: '01:32',
          voiceId: 'XB0fDUnXU5powFXDhCwa' // British Professional Female
        },
        {
          id: 'turn-4-2',
          speaker: 'Jordan Smith (Rep)',
          role: 'rep',
          text: 'Happy to send an email Sarah, but without knowing whether your priority this quarter is CS headcount or outbound retention, it will just be spam.',
          time: '01:44',
          voiceId: 'CwhRBWXzGAHq8TQ4Fs17' // Roger (Male SDR)
        },
        {
          id: 'turn-4-3',
          speaker: 'Sarah Jenkins (Buyer Persona)',
          role: 'prospect',
          text: 'Fair point. We are bleeding tier two reps right now. What specifically can you do for retention?',
          time: '01:55',
          voiceId: 'XB0fDUnXU5powFXDhCwa'
        },
        {
          id: 'turn-4-4',
          speaker: 'Jordan Smith (Rep)',
          role: 'rep',
          text: 'We drill live escalations so reps do not burn out on hostile calls. Let us carve out 7 minutes on Thursday morning. Does 9:30 AM work?',
          time: '02:08',
          voiceId: 'CwhRBWXzGAHq8TQ4Fs17'
        }
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

  // Pre-fetch a turn's ElevenLabs audio into memory cache
  const fetchAudioBlob = useCallback(async (turn: DialogueTurn): Promise<string | null> => {
    const cacheKey = `${turn.id}_${turn.voiceId}`;
    if (audioCacheRef.current.has(cacheKey)) {
      return audioCacheRef.current.get(cacheKey)!;
    }

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: turn.text,
          voiceId: turn.voiceId,
          voiceSettings: {
            stability: turn.role === 'rep' ? 0.50 : 0.45,
            similarity_boost: 0.75,
            style: turn.role === 'rep' ? 0.05 : 0.12
          }
        })
      });

      if (!res.ok) {
        console.warn(`[LiveMonitoring] TTS fetch failed with status ${res.status}`);
        return null;
      }

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      audioCacheRef.current.set(cacheKey, blobUrl);
      return blobUrl;
    } catch (err) {
      console.error('[LiveMonitoring] Failed to fetch turn audio:', err);
      return null;
    }
  }, []);

  // Pre-fetch adjacent turns in the background
  const prefetchAdjacentTurns = useCallback((session: ActiveSparringSession, currentIndex: number) => {
    const nextTurn = session.recentTranscript[currentIndex + 1];
    if (nextTurn) {
      fetchAudioBlob(nextTurn).catch(() => {});
    }
  }, [fetchAudioBlob]);

  // Play a specific turn index in the active session
  const playTurn = useCallback(async (session: ActiveSparringSession, turnIndex: number) => {
    if (turnIndex < 0 || turnIndex >= session.recentTranscript.length) {
      setIsAudioPlaying(false);
      setCurrentTurnIndex(null);
      return;
    }

    if (pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }

    setCurrentTurnIndex(turnIndex);
    setIsLoadingAudio(true);

    const turn = session.recentTranscript[turnIndex];
    prefetchAdjacentTurns(session, turnIndex);

    const audioUrl = await fetchAudioBlob(turn);
    setIsLoadingAudio(false);

    if (!audioUrl || !activeSessionRef.current || activeSessionRef.current.id !== session.id) {
      return;
    }

    // Ensure audio element exists
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio();
    }

    const audio = audioElementRef.current;
    audio.src = audioUrl;
    audio.volume = isAudioMuted ? 0 : volume / 100;
    audio.muted = isAudioMuted;

    audio.onended = () => {
      // Natural human gap between speakers (420ms)
      pendingTimerRef.current = setTimeout(() => {
        if (activeSessionRef.current?.id === session.id && isPlayingRef.current) {
          const nextIdx = turnIndex + 1;
          if (nextIdx < session.recentTranscript.length) {
            playTurn(session, nextIdx);
          } else {
            setIsAudioPlaying(false);
            setCurrentTurnIndex(null);
          }
        }
      }, 420);
    };

    audio.onerror = (e) => {
      console.warn('[LiveMonitoring] Audio playback error:', e);
      setIsAudioPlaying(false);
    };

    try {
      await audio.play();
      setIsAudioPlaying(true);
    } catch (err) {
      console.warn('[LiveMonitoring] audio.play() blocked or failed:', err);
      setIsAudioPlaying(false);
    }
  }, [fetchAudioBlob, prefetchAdjacentTurns, isAudioMuted, volume]);

  // Toggle "Listen Live" on a session
  const handleToggleListen = (session: ActiveSparringSession) => {
    // If currently listening to this session, disconnect
    if (activeListeningSession?.id === session.id) {
      handleDisconnect();
      return;
    }

    // Stop existing audio
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    if (pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }

    // Crucial: Synchronously prime/unlock browser audio permissions within this user click!
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(SILENT_WAV);
    } else {
      audioElementRef.current.src = SILENT_WAV;
    }
    audioElementRef.current.play().catch(() => {});

    setActiveListeningSession(session);
    setIsAudioPlaying(true);
    playTurn(session, 0);
  };

  // Disconnect audio monitor
  const handleDisconnect = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.src = SILENT_WAV;
    }
    if (pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
    setActiveListeningSession(null);
    setCurrentTurnIndex(null);
    setIsAudioPlaying(false);
    setIsLoadingAudio(false);
  };

  // Pause / Resume audio
  const handleTogglePlayPause = () => {
    if (!activeListeningSession) return;

    if (isAudioPlaying) {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      if (pendingTimerRef.current) {
        clearTimeout(pendingTimerRef.current);
        pendingTimerRef.current = null;
      }
      setIsAudioPlaying(false);
    } else {
      setIsAudioPlaying(true);
      const targetIndex = currentTurnIndex !== null ? currentTurnIndex : 0;
      playTurn(activeListeningSession, targetIndex);
    }
  };

  // Replay from beginning
  const handleReplay = () => {
    if (!activeListeningSession) return;
    setIsAudioPlaying(true);
    playTurn(activeListeningSession, 0);
  };

  // Play next turn
  const handleNextTurn = () => {
    if (!activeListeningSession) return;
    const nextIdx = (currentTurnIndex ?? -1) + 1;
    if (nextIdx < activeListeningSession.recentTranscript.length) {
      playTurn(activeListeningSession, nextIdx);
    }
  };

  // Play a specific turn on click in transcript
  const handleSelectTurn = (index: number) => {
    if (!activeListeningSession) return;
    setIsAudioPlaying(true);
    playTurn(activeListeningSession, index);
  };

  // High-Tech Supervisor Whisper HUD Injection
  const handleSendWhisper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whisperMessage.trim() || !activeListeningSession) return;

    const coachingText = whisperMessage.trim();
    setWhisperFeedbackSent(true);

    // Play subtle supervisor audio chime
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.15); // A6
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch {
      // AudioContext chime optional
    }

    // Generate coached rep response turn
    const repVoiceId = activeListeningSession.repGender === 'female' 
      ? 'EXAVITQu4vr4xnSDxMaL' // Sarah
      : 'CwhRBWXzGAHq8TQ4Fs17'; // Roger

    const coachedTurn: DialogueTurn = {
      id: `whisper-${Date.now()}`,
      speaker: `${activeListeningSession.repName} (Rep - HUD Coached)`,
      role: 'rep',
      text: `“Understood ${activeListeningSession.personaName.split(' ')[0]}. My supervisor just alerted my cockpit—${coachingText}”`,
      time: 'LIVE NOW',
      voiceId: repVoiceId
    };

    // Append to active session and floor state
    const updatedTranscript = [...activeListeningSession.recentTranscript, coachedTurn];
    const updatedSession = { ...activeListeningSession, recentTranscript: updatedTranscript };
    
    setActiveListeningSession(updatedSession);
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
    setWhisperMessage('');

    setTimeout(() => {
      setWhisperFeedbackSent(false);
    }, 2500);

    // Automatically speak the coached response immediately!
    playTurn(updatedSession, updatedTranscript.length - 1);
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
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-16">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222021]/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono font-bold mb-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span>DIALER AUDIO MONITORING BUS • 4 LIVE ELEVENLABS CHANNELS</span>
          </div>
          <h1 className="text-3xl font-black text-[#222021] tracking-tight">
            Live Sparring Floor Monitor
          </h1>
          <p className="text-xs text-[#6b6968] mt-1 max-w-2xl leading-relaxed">
            Real-time dialer supervisor console. Listen directly into active two-way AI buyer & rep conversations powered by ElevenLabs, track live objection handling, and whisper coaching cues.
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
          <span className="text-[10px] font-mono uppercase text-[#6b6968] block">Audio Stream Engine</span>
          <span className="text-2xl font-black text-blue-600 font-mono">ElevenLabs</span>
          <p className="text-[11px] text-[#6b6968]">Two-Way Low-Latency Voice</p>
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
          <span className="hidden sm:inline">CLICK "🎧 LISTEN LIVE" FOR REAL-TIME TWO-WAY ELEVENLABS AUDIO</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSessions.map((session) => {
            const isListening = activeListeningSession?.id === session.id;
            const isCurrentlyPlaying = isListening && isAudioPlaying;

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
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 shadow-2xs ${
                      isCurrentlyPlaying 
                        ? 'bg-red-50 text-red-700 border-red-300' 
                        : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full inline-block ${
                        isCurrentlyPlaying ? 'bg-red-500 animate-ping' : 'bg-emerald-500 animate-pulse'
                      }`} />
                      <span>{isCurrentlyPlaying ? 'ON AIR • STREAMING' : `LIVE • ${formatDuration(session.initialSeconds)}`}</span>
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
                  <div className="flex items-center gap-1.5 h-7 px-2.5 py-1 rounded-lg bg-[#0F1412] border border-stone-800">
                    <span className="text-[9px] font-mono text-emerald-400 font-bold mr-1">VU METER</span>
                    <span className={`w-1 bg-emerald-400 rounded-full transition-all duration-75 ${isCurrentlyPlaying ? 'h-5 animate-pulse' : 'h-2'}`} />
                    <span className={`w-1 bg-emerald-400 rounded-full transition-all duration-75 ${isCurrentlyPlaying ? 'h-6 animate-pulse' : 'h-3'}`} />
                    <span className={`w-1 bg-emerald-400 rounded-full transition-all duration-75 ${isCurrentlyPlaying ? 'h-4 animate-pulse' : 'h-2'}`} />
                    <span className={`w-1 bg-emerald-400 rounded-full transition-all duration-75 ${isCurrentlyPlaying ? 'h-6 animate-pulse' : 'h-3'}`} />
                    <span className={`w-1 bg-emerald-400 rounded-full transition-all duration-75 ${isCurrentlyPlaying ? 'h-3 animate-pulse' : 'h-1.5'}`} />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleListen(session)}
                      className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer ${
                        isListening
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {isLoadingAudio && isListening ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Headphones className="h-3.5 w-3.5" />
                      )}
                      <span>{isListening ? 'Disconnect Audio' : '🎧 Listen Live'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DOCKED SUPERVISOR AUDIO STREAM & TWO-WAY DIALOGUE PLAYER */}
      {activeListeningSession && (
        <div className="rounded-3xl bg-[#0C1017] border border-stone-800 p-6 text-white shadow-2xl space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Active Player Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
            <div className="flex items-center gap-3">
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold transition-colors ${
                isAudioPlaying ? 'bg-red-600 text-white' : 'bg-emerald-500 text-stone-950'
              }`}>
                <Radio className={`h-5 w-5 ${isAudioPlaying ? 'animate-pulse' : ''}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    SUPERVISOR BUS &bull; {activeListeningSession.line}
                  </span>
                  <span className="text-xs font-mono text-stone-400">
                    Two-Way ElevenLabs Feed &bull; {activeListeningSession.countryAccent} Accent
                  </span>
                  {isLoadingAudio && (
                    <span className="text-xs font-mono text-amber-400 flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Synthesizing...</span>
                    </span>
                  )}
                </div>
                <h3 className="text-base font-extrabold text-white mt-0.5">
                  {activeListeningSession.repName} ({activeListeningSession.tenant}) &harr; {activeListeningSession.personaName}
                </h3>
              </div>
            </div>

            {/* Audio Playback Controls & Volume */}
            <div className="flex items-center gap-3">
              {/* Play / Pause Toggle */}
              <button
                onClick={handleTogglePlayPause}
                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title={isAudioPlaying ? 'Pause Stream' : 'Play Stream'}
              >
                {isAudioPlaying ? <Pause className="h-3.5 w-3.5 text-amber-400" /> : <Play className="h-3.5 w-3.5 text-emerald-400" />}
                <span>{isAudioPlaying ? 'Pause' : 'Play'}</span>
              </button>

              {/* Replay Dialogue */}
              <button
                onClick={handleReplay}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
                title="Replay from Beginning"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              {/* Next Turn */}
              <button
                onClick={handleNextTurn}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
                title="Skip to Next Speaker"
              >
                <SkipForward className="h-3.5 w-3.5" />
              </button>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 text-xs font-mono text-stone-400 pl-2 border-l border-stone-800">
                <button
                  onClick={() => setIsAudioMuted(!isAudioMuted)}
                  className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-300 cursor-pointer"
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
                <span className="w-8 text-right font-mono">{isAudioMuted ? '0%' : `${volume}%`}</span>
              </div>

              {/* Close Button */}
              <button
                onClick={handleDisconnect}
                className="p-2 rounded-xl bg-stone-800 hover:bg-red-950 hover:text-red-400 text-stone-300 transition-colors cursor-pointer ml-1"
                title="Disconnect Audio Bus"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Real-Time Transcript & Waveform Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Transcript Dialogues (8 cols) */}
            <div className="lg:col-span-8 bg-stone-900/90 rounded-2xl p-4 border border-stone-800 space-y-3 max-h-80 overflow-y-auto">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase text-stone-400 tracking-wider">
                <span>TWO-WAY LIVE CONVERSATION STREAM:</span>
                <span className="text-emerald-400">Click any dialogue bubble to jump & listen</span>
              </div>

              <div className="space-y-2.5">
                {activeListeningSession.recentTranscript.map((turn, idx) => {
                  const isRep = turn.role === 'rep';
                  const isCurrentTurn = currentTurnIndex === idx;

                  return (
                    <div
                      key={turn.id || idx}
                      onClick={() => handleSelectTurn(idx)}
                      className={`p-3.5 rounded-xl border text-xs leading-relaxed transition-all cursor-pointer ${
                        isCurrentTurn
                          ? isRep
                            ? 'bg-blue-900/60 border-blue-400 ring-2 ring-blue-500/30 text-white shadow-lg'
                            : 'bg-red-950/60 border-red-500 ring-2 ring-red-500/30 text-white shadow-lg'
                          : isRep
                            ? 'bg-blue-950/30 border-blue-900/40 text-blue-100 hover:bg-blue-950/60'
                            : 'bg-stone-950/80 border-stone-800 text-stone-200 hover:bg-stone-900'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold px-1.5 py-0.2 rounded text-[9px] uppercase ${
                            isRep ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}>
                            {isRep ? 'SDR REP' : 'BUYER PERSONA'}
                          </span>
                          <span className={isRep ? 'text-blue-400 font-bold' : 'text-[#ED1C24] font-bold'}>
                            {turn.speaker}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isCurrentTurn && isAudioPlaying && (
                            <span className="flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-stone-950 animate-pulse">
                              <span className="h-1.5 w-1.5 rounded-full bg-stone-950 inline-block" />
                              <span>SPEAKING NOW</span>
                            </span>
                          )}
                          <span className="text-stone-500">{turn.time}</span>
                        </div>
                      </div>

                      <p className="font-sans text-[13px] leading-relaxed">
                        {turn.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Supervisor Whisper & Coach Console (4 cols) */}
            <div className="lg:col-span-4 bg-stone-900/90 rounded-2xl p-4 border border-stone-800 space-y-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 tracking-wider block">
                  Supervisor Whisper (Live HUD Injection):
                </span>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Inject coaching instructions into {activeListeningSession.repName}’s HUD teleprompter. The rep will immediately voice your rebuttal!
                </p>
              </div>

              <form onSubmit={handleSendWhisper} className="space-y-2">
                <textarea
                  rows={3}
                  value={whisperMessage}
                  onChange={(e) => setWhisperMessage(e.target.value)}
                  placeholder="e.g. Pivot to zero-prep guarantee! Remind them we pull tech-stack profiles beforehand."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-emerald-500 font-sans resize-none"
                />

                <div className="flex items-center justify-between">
                  {whisperFeedbackSent ? (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Injected & Voiced!</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-stone-500">Live Teleprompter Bus</span>
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

              {/* ElevenLabs Channel Indicator */}
              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800/80 space-y-1 text-[11px]">
                <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
                  <span>VOICE CHANNELS:</span>
                  <span className="text-emerald-400 font-bold">ACTIVE</span>
                </div>
                <div className="text-stone-300">
                  &bull; Rep: <span className="font-semibold">{activeListeningSession.repGender === 'female' ? 'Sarah (Female SDR)' : 'Roger (Male SDR)'}</span>
                </div>
                <div className="text-stone-300">
                  &bull; Customer: <span className="font-semibold">{activeListeningSession.personaName} ({activeListeningSession.countryAccent})</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
