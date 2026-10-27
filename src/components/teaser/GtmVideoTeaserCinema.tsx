'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Download, 
  Sparkles, 
  Film, 
  Flame, 
  Zap, 
  Swords, 
  Headphones, 
  Mail, 
  Share2, 
  Check, 
  CheckCircle2, 
  BarChart3, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  Radio,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Building2,
  DollarSign,
  Clock,
  Mic,
  Activity
} from 'lucide-react';
import LinkedinIcon from '@/components/icons/LinkedinIcon';

export interface TeaserAct {
  id: string;
  actNumber: number;
  badge: string;
  durationSeconds: number;
  title: string;
  subtitle: string;
  voiceoverText: string;
  caption: string;
  accentColor: string; // 'rose' | 'amber' | 'emerald' | 'blue' | 'purple'
}

export const TEASER_ACTS: TeaserAct[] = [
  {
    id: 'act-1',
    actNumber: 1,
    badge: 'ACT 01 • THE 17-YEAR INDUSTRY EXTORTION',
    durationSeconds: 10,
    title: '100% OPEX Risk. 60% Middleman Skim.',
    subtitle: 'How predatory brokers turned sovereign BPOs into rented boiler rooms',
    voiceoverText: 'For seventeen years, BPO floors have carried one hundred percent of the operational risk, while lead brokers take home a sixty percent cut on cheap pay per performance deals. You do not own an agency. You own a rented floor subsidizing their margin.',
    caption: 'For 17 years, BPO floors have carried 100% OPEX risk while brokers take home 60% cuts on cheap pay-per-performance deals. You do not own an agency. You own a rented floor subsidizing their margin.',
    accentColor: 'rose'
  },
  {
    id: 'act-2',
    actNumber: 2,
    badge: 'ACT 02 • THE ONBOARDING & HESITATION CRISIS',
    durationSeconds: 10,
    title: 'Static Scripts Kill Composure. Hesitation Kills Deals.',
    subtitle: 'Why 3 weeks of classroom theory and 60-page PDF scripts burn your best leads',
    voiceoverText: 'Static sixty page scripts belong in a museum. When junior callers pause for two seconds to flip a binder, enterprise buyers hang up immediately. Three weeks of classroom theory does not build sales muscle. It builds caller anxiety.',
    caption: 'Static 60-page scripts belong in a museum. When junior callers pause for 2 seconds to flip a binder, enterprise buyers hang up. Three weeks of classroom theory builds caller anxiety, not sales muscle.',
    accentColor: 'amber'
  },
  {
    id: 'act-3',
    actNumber: 3,
    badge: 'ACT 03 • THE SUB-180MS WEAPON',
    durationSeconds: 11,
    title: 'Sub-180ms Calling Cockpit. Zero Hesitation.',
    subtitle: 'Instant consultative objection disarming powered by real-time prospect telemetry',
    voiceoverText: 'Enter the Appointmentlyy Calling Cockpit. In under one hundred and eighty milliseconds, real time consultative rebuttals appear on screen. Junior callers disarm enterprise objections with the composure of fifteen year veteran operators.',
    caption: 'Enter the Appointmentlyy Calling Cockpit. In under 180 milliseconds, consultative rebuttals appear on screen. Junior callers disarm enterprise objections with complete composure.',
    accentColor: 'emerald'
  },
  {
    id: 'act-4',
    actNumber: 4,
    badge: 'ACT 04 • ZERO LEAD BURN TRAINING',
    durationSeconds: 10,
    title: '40 Hostile Drills Before Lunch. Production in 72 Hours.',
    subtitle: '10 realistic buyer personas with multi-country accents and automated ARM grading',
    voiceoverText: 'Never practice sales pitches on active client leads. In our AI Sparring Arena, reps survive forty hostile objection drills before lunch. We cut onboarding ramp from twenty one days down to seventy two hours.',
    caption: 'Never practice sales pitches on paying client accounts. In our AI Sparring Arena, reps complete 40 hostile objection drills before lunch. We cut onboarding ramp from 21 days down to 72 hours.',
    accentColor: 'blue'
  },
  {
    id: 'act-5',
    actNumber: 5,
    badge: 'ACT 05 • MULTICHANNEL GTM ENGINE',
    durationSeconds: 11,
    title: 'Own the Narrative. Fuel the Pipeline.',
    subtitle: 'Deep Idea Box analyzers, 5 writing frameworks, and 3-comment debate starters',
    voiceoverText: 'Appointmentlyy equips your floor with a full GTM engine. LinkedIn thought leadership that exposes industry sacred cows, and cold email cadences built on three word subject lines that decision makers actually open.',
    caption: 'Appointmentlyy equips your floor with a full GTM engine. LinkedIn thought leadership that exposes industry sacred cows, and cold email cadences built on 3-word subject lines that get opened.',
    accentColor: 'purple'
  },
  {
    id: 'act-6',
    actNumber: 6,
    badge: 'ACT 06 • THE SOVEREIGNTY SHIFT',
    durationSeconds: 11,
    title: 'From $8/hr Commodity to Direct $24/hr Enterprise Equity',
    subtitle: 'Double enterprise valuation multiples by taking internal acquisition back',
    voiceoverText: 'Stop begging middlemen for scraps. Deploy two dedicated internal SDRs, land direct twenty-four dollar an hour enterprise contracts, and double your company valuation. Take internal acquisition back to all BPOs.',
    caption: 'Stop begging middlemen for scraps. Deploy 2 dedicated internal SDRs, land direct $24/hr enterprise retainers, and double your company valuation. Take internal acquisition back to all BPOs.',
    accentColor: 'emerald'
  }
];

export default function GtmVideoTeaserCinema() {
  const [currentActIndex, setCurrentActIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [actProgress, setActProgress] = useState<number>(0); // 0 to 100
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const currentAct = TEASER_ACTS[currentActIndex];

  // Voiceover narrator using Web Speech API
  const speakCurrentAct = (act: TeaserAct) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (isMuted) return;

    try {
      const utterance = new SpeechSynthesisUtterance(act.voiceoverText);
      utterance.rate = 1.05 * playbackSpeed;
      utterance.pitch = 0.95;

      // Select authoritative English voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
        (v.name.includes('Daniel') || v.name.includes('Oliver') || v.name.includes('George') || v.name.includes('Guy') || v.name.includes('Natural') || v.name.includes('Male')) && v.lang.startsWith('en')
      ) || voices.find(v => v.lang.startsWith('en'));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      speechUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis playback error:', e);
    }
  };

  // Playback timer & progress ticker
  useEffect(() => {
    if (!isPlaying) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.pause();
      }
      return;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      } else if (!window.speechSynthesis.speaking && !isMuted) {
        speakCurrentAct(currentAct);
      }
    }

    const intervalTimeMs = 50;
    const totalActMs = (currentAct.durationSeconds * 1000) / playbackSpeed;
    const progressStep = (intervalTimeMs / totalActMs) * 100;

    const interval = setInterval(() => {
      setActProgress((prev) => {
        if (prev >= 100) {
          // Advance to next act or loop back
          const nextIndex = (currentActIndex + 1) % TEASER_ACTS.length;
          setCurrentActIndex(nextIndex);
          return 0;
        }
        return prev + progressStep;
      });
    }, intervalTimeMs);

    return () => clearInterval(interval);
  }, [isPlaying, currentActIndex, playbackSpeed, isMuted]);

  // When act changes, reset speech and act progress
  useEffect(() => {
    setActProgress(0);
    if (isPlaying && !isMuted) {
      speakCurrentAct(currentAct);
    }
  }, [currentActIndex]);

  // Handle mute toggling
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } else {
      speakCurrentAct(currentAct);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Jump to specific act
  const jumpToAct = (index: number) => {
    setCurrentActIndex(index);
    setActProgress(0);
  };

  // Restart teaser from Act 1
  const restartTeaser = () => {
    setCurrentActIndex(0);
    setActProgress(0);
    setIsPlaying(true);
    if (!isMuted) speakCurrentAct(TEASER_ACTS[0]);
  };

  // Copy share link
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Video recording and export engine via Canvas & MediaRecorder
  const handleExportVideo = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportProgress(0);
    setIsPlaying(false);

    try {
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not initialize canvas context');

      // Setup MediaRecorder from canvas stream
      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm'
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Appointmentlyy-SDR-GTM-Video-Teaser.webm';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsExporting(false);
        setIsPlaying(true);
      };

      mediaRecorder.start();

      // Render each act sequence onto canvas
      const totalActs = TEASER_ACTS.length;
      const framesPerAct = 60; // 2 seconds per act in fast export mode
      let currentFrame = 0;
      const totalFrames = totalActs * framesPerAct;

      for (let actIdx = 0; actIdx < totalActs; actIdx++) {
        const act = TEASER_ACTS[actIdx];

        for (let frame = 0; frame < framesPerAct; frame++) {
          currentFrame++;
          setExportProgress(Math.round((currentFrame / totalFrames) * 100));

          // Draw dark cinematic frame
          ctx.fillStyle = '#09090b';
          ctx.fillRect(0, 0, 1920, 1080);

          // Grid lines
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.lineWidth = 1;
          for (let x = 0; x < 1920; x += 80) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 1080);
            ctx.stroke();
          }
          for (let y = 0; y < 1080; y += 80) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(1920, y);
            ctx.stroke();
          }

          // Top Header
          ctx.fillStyle = actIdx === 0 ? '#f43f5e' : actIdx === 1 ? '#f59e0b' : '#10b981';
          ctx.font = 'bold 24px monospace';
          ctx.fillText(act.badge, 120, 140);

          // Title
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 56px sans-serif';
          ctx.fillText(act.title, 120, 230);

          // Subtitle
          ctx.fillStyle = '#a1a1aa';
          ctx.font = '28px sans-serif';
          ctx.fillText(act.subtitle, 120, 290);

          // Center Card
          ctx.fillStyle = 'rgba(24, 24, 27, 0.85)';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(120, 360, 1680, 480, 24);
          ctx.fill();
          ctx.stroke();

          // Card content based on act
          if (actIdx === 0) {
            ctx.fillStyle = '#f43f5e';
            ctx.font = 'bold 96px sans-serif';
            ctx.fillText('60% BROKER SKIM', 200, 520);
            ctx.fillStyle = '#ffffff';
            ctx.font = '36px sans-serif';
            ctx.fillText('vs 100% BPO OPEX Burden (Rent, Workstations, HMOs, Attrition)', 200, 590);
            ctx.fillStyle = '#e4e4e7';
            ctx.font = '30px sans-serif';
            ctx.fillText('BPOs shoulder all the risk. Brokers take the profit. It ends now.', 200, 660);
          } else if (actIdx === 1) {
            ctx.fillStyle = '#f59e0b';
            ctx.font = 'bold 96px monospace';
            ctx.fillText('2.4s HESITATION FREEZE', 200, 520);
            ctx.fillStyle = '#ffffff';
            ctx.font = '36px sans-serif';
            ctx.fillText('Static 60-page PDF scripts teach junior reps to freeze and stumble.', 200, 590);
            ctx.fillStyle = '#e4e4e7';
            ctx.font = '30px sans-serif';
            ctx.fillText('98% of cold calls fail in the first 40 seconds because of caller anxiety.', 200, 660);
          } else if (actIdx === 2) {
            ctx.fillStyle = '#10b981';
            ctx.font = 'bold 96px monospace';
            ctx.fillText('< 180ms LIVE TELEPROMPTER', 200, 520);
            ctx.fillStyle = '#ffffff';
            ctx.font = '36px sans-serif';
            ctx.fillText('Sub-180ms consultative objection disarming on live enterprise dials.', 200, 590);
            ctx.fillStyle = '#e4e4e7';
            ctx.font = '30px sans-serif';
            ctx.fillText('Reps respond like 15-year BDM veterans without memorizing static scripts.', 200, 660);
          } else if (actIdx === 3) {
            ctx.fillStyle = '#3b82f6';
            ctx.font = 'bold 96px monospace';
            ctx.fillText('72-HOUR REVENUE RAMP', 200, 520);
            ctx.fillStyle = '#ffffff';
            ctx.font = '36px sans-serif';
            ctx.fillText('40 Hostile AI Sparring drills before lunch. Zero client leads burned.', 200, 590);
            ctx.fillStyle = '#e4e4e7';
            ctx.font = '30px sans-serif';
            ctx.fillText('10 Buyer personas: Cynical CFOs, Gatekeepers, and Technical Blockers.', 200, 660);
          } else if (actIdx === 4) {
            ctx.fillStyle = '#a855f7';
            ctx.font = 'bold 96px sans-serif';
            ctx.fillText('MULTICHANNEL GTM ENGINE', 200, 520);
            ctx.fillStyle = '#ffffff';
            ctx.font = '36px sans-serif';
            ctx.fillText('LinkedIn Thought Leadership & Cold Email Studio with 3-word subject lines.', 200, 590);
            ctx.fillStyle = '#e4e4e7';
            ctx.font = '30px sans-serif';
            ctx.fillText('Bold, controversial injected comments that ignite industry-wide engagement.', 200, 660);
          } else {
            ctx.fillStyle = '#10b981';
            ctx.font = 'bold 96px sans-serif';
            ctx.fillText('$24/HR DIRECT RETAINERS', 200, 520);
            ctx.fillStyle = '#ffffff';
            ctx.font = '36px sans-serif';
            ctx.fillText('100% Retained Equity • 2.5x Enterprise Valuation Multiple Expansion', 200, 590);
            ctx.fillStyle = '#e4e4e7';
            ctx.font = '30px sans-serif';
            ctx.fillText('Take Internal Client Acquisition Back to All BPOs. Appointmentlyy SDR.', 200, 660);
          }

          // Subtitle Bar at Bottom
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(120, 890, 1680, 80);
          ctx.fillStyle = '#ffffff';
          ctx.font = '24px sans-serif';
          ctx.fillText(`"${act.caption}"`, 150, 940);

          // Watermark
          ctx.fillStyle = '#71717a';
          ctx.font = 'bold 20px monospace';
          ctx.fillText('APPOINTMENTLYY SDR • GTM AUTONOMOUS SYSTEM', 1200, 140);

          await new Promise((r) => setTimeout(r, 20));
        }
      }

      mediaRecorder.stop();
    } catch (err) {
      console.error('Video export error:', err);
      setIsExporting(false);
      setIsPlaying(true);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Hidden recording canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
              <Film className="h-3 w-3 text-rose-600" />
              CINEMATIC GTM TEASER
            </span>
            <span className="text-zinc-400 text-xs">•</span>
            <span className="text-[11px] font-mono text-zinc-500">60-Second Autonomous Teaser</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight flex items-center gap-2">
            <span>Appointmentlyy SDR: The Sovereignty Shift</span>
            <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
          </h1>
          <p className="text-xs text-zinc-600 mt-1 max-w-2xl leading-relaxed">
            Experience the power of the Appointmentlyy SDR tool and the full GTM system: Sub-180ms Calling Cockpit, 72-Hour AI Voice Sparring, and taking internal acquisition back to all BPOs.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
          <button
            onClick={handleCopyLink}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 transition-colors shadow-2xs cursor-pointer"
          >
            {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share Teaser'}</span>
          </button>

          <button
            onClick={handleExportVideo}
            disabled={isExporting}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-950 hover:bg-zinc-800 text-white transition-all shadow-sm cursor-pointer disabled:opacity-60"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span>{isExporting ? `Exporting 1080p (${exportProgress}%)` : 'Export 1080p Video'}</span>
          </button>
        </div>
      </div>

      {/* Main Cinematic Video Player Frame (16:9) */}
      <div 
        ref={containerRef}
        className={`relative rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl transition-all ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none w-screen h-screen' : 'w-full aspect-video min-h-[500px]'
        }`}
      >
        {/* Subtle dynamic background grid & ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
        <div 
          className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 transition-all duration-700 ${
            currentAct.accentColor === 'rose' ? 'bg-rose-600' :
            currentAct.accentColor === 'amber' ? 'bg-amber-600' :
            currentAct.accentColor === 'blue' ? 'bg-blue-600' :
            currentAct.accentColor === 'purple' ? 'bg-purple-600' : 'bg-emerald-600'
          }`}
        />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-emerald-600/15 blur-3xl" />

        {/* Top Floating Player Bar */}
        <div className="absolute top-0 inset-x-0 p-4 sm:p-6 flex items-center justify-between z-30 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-zinc-300">
              {currentAct.badge}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900/80 border border-zinc-700/60 px-2 py-1 rounded-md">
              ACT {currentActIndex + 1} OF {TEASER_ACTS.length}
            </span>
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Center Stage: Dynamic Act Presentation */}
        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-14 z-20 max-w-5xl">
          <div className="space-y-4">
            {/* Act Badge & Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-700/80 shadow-inner">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
                {currentAct.badge}
              </span>
            </div>

            {/* Main Punchy Heading */}
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
              {currentAct.title}
            </h2>

            {/* Subheading */}
            <p className="text-sm sm:text-lg text-zinc-400 max-w-3xl leading-relaxed font-sans">
              {currentAct.subtitle}
            </p>

            {/* Interactive Scene Visual Display */}
            <div className="pt-2 sm:pt-4">
              {/* ACT 1: The 60% Broker Skim vs 100% OPEX */}
              {currentActIndex === 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
                  <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-200 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold block">
                      The Predatory Broker Skim
                    </span>
                    <div className="text-3xl font-black text-rose-400 font-mono">60% Cut</div>
                    <p className="text-[11px] text-rose-300/80 leading-snug">
                      Middlemen pocket 60% of contract value on cheap pay-per-performance deals with 0% capital at risk.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-700/70 text-zinc-300 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                      BPO Operational Burden
                    </span>
                    <div className="text-3xl font-black text-white font-mono">100% OPEX</div>
                    <p className="text-[11px] text-zinc-400 leading-snug">
                      BPOs pay 100% of facilities, dialer licenses, HMOs, electricity, and attrition burden for razor-thin scraps.
                    </p>
                  </div>
                </div>
              )}

              {/* ACT 2: 2.4s Hesitation Freeze */}
              {currentActIndex === 1 && (
                <div className="p-4 rounded-2xl bg-zinc-900/90 border border-amber-500/30 max-w-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-amber-400 animate-spin" />
                      FATAL HESITATION LATENCY
                    </span>
                    <span className="text-xs font-mono text-zinc-400 font-bold">2.4 SECONDS</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Prospect says <span className="text-white font-semibold">"We already have a vendor."</span> Junior rep freezes flipping through 60-page PDF script binder. Prospect hangs up in 4 seconds.
                    </p>
                  </div>
                </div>
              )}

              {/* ACT 3: Calling Cockpit in 142ms */}
              {currentActIndex === 2 && (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 max-w-3xl space-y-3 shadow-lg">
                  <div className="flex items-center justify-between border-b border-emerald-800/60 pb-2">
                    <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                      <Zap className="h-4 w-4 text-emerald-400" />
                      LIVE TELEPROMPTER • RESPONSE LATENCY: 142ms
                    </span>
                    <span className="text-[10px] font-mono text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700/50">
                      SCRIPTLESS COMPOSE
                    </span>
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                    <span className="text-emerald-400 font-bold block mb-1">⚡ Consultative Disarming Cue:</span>
                    "Fair pushback, Julian. Most CROs we speak with are trimming commoditized seats to fund direct performance pods that guarantee pipeline. If we verify 2 qualified sits in 14 days without retainers, would that warrant a 10-minute audit?"
                  </p>
                </div>
              )}

              {/* ACT 4: 72-Hour Voice AI Sparring */}
              {currentActIndex === 3 && (
                <div className="grid grid-cols-3 gap-2.5 max-w-2xl">
                  <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-blue-500/30 text-center space-y-1">
                    <span className="text-[10px] font-mono text-blue-400 uppercase font-bold block">Objection Drills</span>
                    <div className="text-2xl font-black text-white font-mono">40x</div>
                    <span className="text-[10px] text-zinc-400 block">Completed by lunch</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-blue-500/30 text-center space-y-1">
                    <span className="text-[10px] font-mono text-blue-400 uppercase font-bold block">ARM Rubric Score</span>
                    <div className="text-2xl font-black text-emerald-400 font-mono">96%</div>
                    <span className="text-[10px] text-zinc-400 block">Composure passing score</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-blue-500/30 text-center space-y-1">
                    <span className="text-[10px] font-mono text-blue-400 uppercase font-bold block">Production Ramp</span>
                    <div className="text-2xl font-black text-amber-400 font-mono">72 hrs</div>
                    <span className="text-[10px] text-zinc-400 block">Down from 21 days</span>
                  </div>
                </div>
              )}

              {/* ACT 5: Multichannel Inbound & Outbound GTM */}
              {currentActIndex === 4 && (
                <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 max-w-2xl space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-mono text-purple-300 font-bold border-b border-purple-800/60 pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Flame className="h-4 w-4 text-purple-400" />
                      3-COMMENT DEBATE STARTERS + 3-WORD SUBJECT LINES
                    </span>
                    <span className="text-emerald-400">82% OPEN RATE</span>
                  </div>
                  <div className="text-xs text-zinc-300 space-y-1.5">
                    <p className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 text-[11px]">
                      🔥 <span className="font-semibold text-white">Injected Comment 1:</span> "Unpopular truth: If your BPO relies on broker pay-per-performance deals, you do not own an agency. You own a rented boiler room. Agree or disagree?"
                    </p>
                    <p className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 text-[11px]">
                      ✉️ <span className="font-semibold text-white">3-Word Cold Email:</span> "quick operational check" • Non-promotional, permission-based closing question.
                    </p>
                  </div>
                </div>
              )}

              {/* ACT 6: Valuation Shift ($24/hr Direct Retainers) */}
              {currentActIndex === 5 && (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 max-w-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                      ENTERPRISE VALUATION MULTIPLE
                    </span>
                    <span className="text-xs font-mono font-black text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700/60">
                      2.5x EXPANSION
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                      <span className="text-[10px] text-zinc-400 uppercase font-mono block">Commodity Subcontractor</span>
                      <span className="text-lg font-bold text-zinc-300 font-mono">$8/hr billable</span>
                      <span className="text-[10px] text-rose-400 block">3x Multiple • Fragile</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-900/30 border border-emerald-500/40">
                      <span className="text-[10px] text-emerald-300 uppercase font-mono font-bold block">Sovereign BPO Engine</span>
                      <span className="text-lg font-bold text-emerald-400 font-mono">$24/hr direct seat</span>
                      <span className="text-[10px] text-emerald-300 font-bold block">7.5x Multiple • 100% Equity</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Subtitle / Narration Bar */}
        <div className="absolute bottom-16 inset-x-0 px-6 sm:px-14 z-20">
          <div className="p-3 rounded-xl bg-black/80 backdrop-blur-md border border-zinc-800/80 text-center shadow-lg">
            <p className="text-xs sm:text-sm font-medium text-zinc-200 tracking-wide">
              "{currentAct.caption}"
            </p>
          </div>
        </div>

        {/* Bottom Controls & Timeline Bar */}
        <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-t from-black via-black/90 to-transparent z-30 flex flex-col gap-2">
          {/* Timeline Bar (Interactive Scrubber) */}
          <div className="grid grid-cols-6 gap-1.5">
            {TEASER_ACTS.map((act, idx) => {
              const isActive = idx === currentActIndex;
              const isPast = idx < currentActIndex;
              return (
                <button
                  key={act.id}
                  onClick={() => jumpToAct(idx)}
                  className="h-1.5 rounded-full bg-zinc-800 overflow-hidden relative cursor-pointer group"
                  title={`${act.badge}: ${act.title}`}
                >
                  <div 
                    className={`h-full transition-all duration-75 ${
                      isPast 
                        ? 'w-full bg-emerald-500' 
                        : isActive 
                        ? 'bg-white' 
                        : 'w-0'
                    }`}
                    style={isActive ? { width: `${actProgress}%` } : undefined}
                  />
                </button>
              );
            })}
          </div>

          {/* Media Controls */}
          <div className="flex items-center justify-between text-xs text-zinc-300 pt-1">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
              </button>

              <button
                onClick={restartTeaser}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Restart"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={toggleMute}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title={isMuted ? 'Unmute Narrator' : 'Mute Narrator'}
              >
                {isMuted ? <VolumeX className="h-3.5 w-3.5 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5 text-emerald-400" />}
              </button>

              <div className="flex items-center gap-1 font-mono text-[11px] text-zinc-400">
                <span className="text-white font-bold">{currentActIndex + 1}</span>
                <span>/</span>
                <span>{TEASER_ACTS.length}</span>
              </div>
            </div>

            {/* Act Selector Pills */}
            <div className="hidden md:flex items-center gap-1.5">
              {TEASER_ACTS.map((act, idx) => (
                <button
                  key={act.id}
                  onClick={() => jumpToAct(idx)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                    currentActIndex === idx
                      ? 'bg-zinc-100 text-zinc-950 font-bold shadow-xs'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  Act {idx + 1}
                </button>
              ))}
            </div>

            {/* Playback Speed Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-zinc-400">SPEED:</span>
              {[1, 1.25, 1.5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer ${
                    playbackSpeed === spd 
                      ? 'bg-emerald-600 text-white font-bold' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Architecture Matrix Callout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link 
          href="/cockpit"
          className="p-5 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 transition-all shadow-2xs group space-y-2"
        >
          <div className="h-8 w-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
            <Swords className="h-4 w-4" />
          </div>
          <h3 className="font-bold text-sm text-zinc-950 flex items-center justify-between">
            <span>Sub-180ms Calling Cockpit</span>
            <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-950 group-hover:translate-x-1 transition-all" />
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Eliminates caller hesitation with real-time consultative objection rebuttals and live prospect telemetry.
          </p>
        </Link>

        <Link 
          href="/sparring"
          className="p-5 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 transition-all shadow-2xs group space-y-2"
        >
          <div className="h-8 w-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
            <Headphones className="h-4 w-4" />
          </div>
          <h3 className="font-bold text-sm text-zinc-950 flex items-center justify-between">
            <span>72-Hour AI Sparring Arena</span>
            <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-950 group-hover:translate-x-1 transition-all" />
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Reps complete 40 objection drills before lunch across 10 adversarial buyer personas with automated ARM grading.
          </p>
        </Link>

        <Link 
          href="/linkedin"
          className="p-5 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 transition-all shadow-2xs group space-y-2"
        >
          <div className="h-8 w-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
            <LinkedinIcon className="h-4 w-4" />
          </div>
          <h3 className="font-bold text-sm text-zinc-950 flex items-center justify-between">
            <span>Autonomous GTM Engine</span>
            <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-950 group-hover:translate-x-1 transition-all" />
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Takes internal client acquisition back to BPOs with high-leverage LinkedIn series and 3 bold injected comments.
          </p>
        </Link>
      </div>
    </div>
  );
}
