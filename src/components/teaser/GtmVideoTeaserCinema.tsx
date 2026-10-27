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
  Activity,
  Copy,
  ExternalLink,
  Clapperboard,
  Video
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
  imageUrl: string;
  audioUrl?: string;
  accentColor: string; // 'rose' | 'amber' | 'emerald' | 'blue' | 'purple'
  nanoBananaPrompt: string;
  cameraDirection: string;
  motionStrength: string;
}

export const TEASER_ACTS: TeaserAct[] = [
  {
    id: 'act-1',
    actNumber: 1,
    badge: 'ACT 01 • THE 17-YEAR INDUSTRY EXTORTION',
    durationSeconds: 10,
    title: '100% OPEX Risk. 60% Middleman Skim.',
    subtitle: 'How predatory brokers turned sovereign BPOs into rented boiler rooms',
    voiceoverText: 'For 17 years, BPO floors have carried 100% of the operational risk, while lead brokers take home 60% margin cuts on cheap pay-per-performance deals. You do not own an agency. You own a rented floor subsidizing their margin.',
    caption: 'For 17 years, BPO floors have carried 100% OPEX risk while brokers take home 60% cuts on cheap pay-per-performance deals. You do not own an agency. You own a rented floor subsidizing their margin.',
    imageUrl: '/images/teaser/teaser-1-broker-devil.jpg',
    audioUrl: '/audio/teaser/teaser-act-1.mp3',
    accentColor: 'rose',
    cameraDirection: 'Slow Dolly In / Push-in toward cynical smirk',
    motionStrength: '4 / 10',
    nanoBananaPrompt: 'Image-to-Video: Cinematic 35mm film still. The man in the bespoke charcoal suit with crimson pocket square slowly raises his steepled hands toward his chin, a subtle, calculating smirk forming on his lips. Rain gently streams down the floor-to-ceiling penthouse window behind him overlooking the dark city skyline. Camera executes a smooth, slow optical dolly push-in toward his eyes. Dramatic chiaroscuro lighting, deep shadows, subtle amber and crimson reflections on the polished mahogany table. Photorealistic, 24fps, film grain, Arri Alexa cinematic render.'
  },
  {
    id: 'act-2',
    actNumber: 2,
    badge: 'ACT 02 • THE ONBOARDING & HESITATION CRISIS',
    durationSeconds: 10,
    title: 'Static Scripts Kill Composure. Hesitation Kills Deals.',
    subtitle: 'Why 3 weeks of classroom theory and 60-page PDF scripts burn your best leads',
    voiceoverText: 'Static 60-page scripts belong in a museum. When junior callers pause for 2 seconds to flip a binder, enterprise buyers hang up immediately. Three weeks of classroom theory does not build sales muscle. It builds caller anxiety.',
    caption: 'Static 60-page scripts belong in a museum. When junior callers pause for 2 seconds to flip a binder, enterprise buyers hang up. Three weeks of classroom theory does not build sales muscle. It builds caller anxiety.',
    imageUrl: '/images/teaser/teaser-2-script-hesitation.jpg',
    audioUrl: '/audio/teaser/teaser-act-2.mp3',
    accentColor: 'amber',
    cameraDirection: 'Slow Pan Right + Subtle Handheld Drift',
    motionStrength: '5 / 10',
    nanoBananaPrompt: 'Image-to-Video: Cinematic documentary film. The young Filipino male SDR frantically flips the worn pages of the spiral script binder with his hands, his eyes darting across the text with palpable anxiety. On the dual monitors, blue CRM windows softly glow. Camera slowly pans right with a subtle handheld documentary drift, rack focusing from the anxious expression on his face down to his trembling fingers turning the script page. Authentic Manila office at night, Kodak Portra 400 tone, natural motion, 24fps.'
  },
  {
    id: 'act-3',
    actNumber: 3,
    badge: 'ACT 03 • THE SUB-180MS WEAPON',
    durationSeconds: 11,
    title: 'Sub-180ms Calling Cockpit. Zero Hesitation.',
    subtitle: 'Instant consultative objection disarming powered by real-time prospect telemetry',
    voiceoverText: 'Enter the Appointmentlyy Calling Cockpit. In under 180 milliseconds, real-time consultative rebuttals appear on screen. Junior callers disarm hostile enterprise objections with the composure of 15-year veteran operators.',
    caption: 'Enter the Appointmentlyy Calling Cockpit. In under 180 milliseconds, real-time consultative rebuttals appear on screen. Junior callers disarm enterprise objections with the composure of 15-year veteran operators.',
    imageUrl: '/images/teaser/teaser-3-autonomous-cockpit.jpg',
    audioUrl: '/audio/teaser/teaser-act-3.mp3',
    accentColor: 'emerald',
    cameraDirection: 'Curved Slider Track Left to Right',
    motionStrength: '4 / 10',
    nanoBananaPrompt: 'Image-to-Video: Sleek modern corporate tech cinematography. The confident young Filipino SDR speaks calmly into his wireless headset, gesturing smoothly with an open palm as he consultatively disarms a live buyer objection. On his ultra-wide monitors, lines of clean emerald text pulse into view in real time like a live teleprompter HUD. Camera performs a dynamic curved slider motion from left to right, capturing the modern glass Manila BGC office illuminated with ambient light. Crisp focus, anamorphic lens flare, 8k resolution.'
  },
  {
    id: 'act-4',
    actNumber: 4,
    badge: 'ACT 04 • THE SOVEREIGNTY SHIFT',
    durationSeconds: 11,
    title: 'From $8/hr Commodity to Direct $24/hr Enterprise Equity',
    subtitle: 'Double enterprise valuation multiples by taking internal acquisition back',
    voiceoverText: 'Stop begging middlemen for scraps. Deploy two dedicated internal SDRs, land direct $24-an-hour enterprise contracts, and double your company valuation. Take internal acquisition back to all BPOs.',
    caption: 'Stop begging middlemen for scraps. Deploy 2 dedicated internal SDRs, land direct $24/hr enterprise retainers, and double your company valuation. Take internal acquisition back to all BPOs.',
    imageUrl: '/images/teaser/teaser-4-sovereignty-partnership.jpg',
    audioUrl: '/audio/teaser/teaser-act-4.mp3',
    accentColor: 'emerald',
    cameraDirection: 'Slow Pedestal Pull-Back & Crane Down',
    motionStrength: '3 / 10',
    nanoBananaPrompt: 'Image-to-Video: Cinematic 35mm film still. The senior North American executive and the Filipino female BPO operations director complete a respectful, professional handshake with warm mutual smiles. In the background, the warm golden sunset reflects off the modern glass skyscrapers of Manila BGC. Camera performs a slow, elegant pedestal pull-back and crane down, revealing the glass whiteboard with diagrams of direct acquisition and $24/hr seat economics. Warm golden hour lens flares, Kodak Vision3 aesthetic, photorealistic elegance.'
  }
];

export default function GtmVideoTeaserCinema() {
  const [currentActIndex, setCurrentActIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [actProgress, setActProgress] = useState<number>(0); // 0 to 100
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showPromptPackModal, setShowPromptPackModal] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentAct = TEASER_ACTS[currentActIndex];

  // Play audio track for current act
  const playAudioForAct = (act: TeaserAct) => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.pause();
      return;
    }

    if (act.audioUrl) {
      audioRef.current.src = act.audioUrl;
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.play().catch((err) => {
        console.warn('Audio auto-play notice:', err);
      });
    }
  };

  // Playback timer & progress ticker
  useEffect(() => {
    if (!isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      return;
    }

    playAudioForAct(currentAct);

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

  // When act changes, reset audio & progress
  useEffect(() => {
    setActProgress(0);
    if (isPlaying) {
      playAudioForAct(currentAct);
    }
  }, [currentActIndex]);

  // Handle mute toggling
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      if (audioRef.current) audioRef.current.pause();
    } else {
      playAudioForAct(currentAct);
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
    playAudioForAct(TEASER_ACTS[0]);
  };

  // Copy helper
  const copyToClipboard = (text: string, key: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Hidden audio element for ElevenLabs broadcast track */}
      <audio ref={audioRef} preload="auto" />

      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
              <Film className="h-3 w-3 text-amber-600" />
              NANO BANANA AI VIDEO TEASER STUDIO
            </span>
            <span className="text-zinc-400 text-xs">•</span>
            <span className="text-[11px] font-mono text-zinc-500">Photorealistic Keyframes &amp; Video Prompts</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight flex items-center gap-2">
            <span>Appointmentlyy SDR: The Sovereignty Shift</span>
            <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
          </h1>
          <p className="text-xs text-zinc-600 mt-1 max-w-2xl leading-relaxed">
            Photorealistic cinematic AI video teaser generated for Nano Banana, Kling, and Runway Gen-3. Watch the cinematic sequence with ElevenLabs voiceover or copy the exact motion prompts.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
          <button
            onClick={() => setShowPromptPackModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-zinc-950 transition-all shadow-sm cursor-pointer"
          >
            <Video className="h-4 w-4 text-zinc-950" />
            <span>🍌 Nano Banana Prompt Pack</span>
          </button>
        </div>
      </div>

      {/* Main Cinematic Video Player Frame (16:9) with Photorealistic Generated Footage */}
      <div 
        ref={containerRef}
        className={`relative rounded-3xl overflow-hidden bg-black border border-zinc-800 shadow-2xl transition-all select-none ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none w-screen h-screen' : 'w-full aspect-video min-h-[500px]'
        }`}
      >
        {/* Photorealistic Keyframe Background with Ken Burns Slow-Pan / Zoom Motion */}
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={currentAct.imageUrl} 
            alt={currentAct.title}
            className="w-full h-full object-cover scale-105 transition-all duration-10000 ease-out"
            style={{
              transform: isPlaying ? 'scale(1.12) translate(-1%, -1%)' : 'scale(1.05)'
            }}
          />
          {/* Cinematic lighting gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/20 to-black/80" />
        </div>

        {/* Top Floating Player Bar */}
        <div className="absolute top-0 inset-x-0 p-4 sm:p-6 flex items-center justify-between z-30 bg-gradient-to-b from-black/80 via-black/30 to-transparent">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-zinc-200 drop-shadow-sm">
              {currentAct.badge}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-zinc-300 bg-black/70 backdrop-blur-md border border-white/20 px-2 py-1 rounded-md shadow-xs">
              SCENE {currentActIndex + 1} OF {TEASER_ACTS.length}
            </span>
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-zinc-200 hover:text-white border border-white/20 transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Center Stage: Cinematic Narrative Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end pb-28 px-6 sm:px-14 z-20 max-w-4xl space-y-3">
          {/* Act Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 shadow-lg w-fit">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
              {currentAct.badge}
            </span>
          </div>

          {/* Main Title */}
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
            {currentAct.title}
          </h2>

          {/* Subtitle */}
          <p className="text-xs sm:text-base text-zinc-200 max-w-3xl leading-relaxed font-sans drop-shadow-md">
            {currentAct.subtitle}
          </p>

          {/* Motion Camera Meta Pill */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] font-mono text-amber-300 bg-amber-950/80 border border-amber-500/50 px-2 py-0.5 rounded flex items-center gap-1 backdrop-blur-xs">
              <Film className="h-2.5 w-2.5 text-amber-400" />
              CAMERA: {currentAct.cameraDirection}
            </span>
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 border border-emerald-500/50 px-2 py-0.5 rounded backdrop-blur-xs">
              MOTION: {currentAct.motionStrength}
            </span>
          </div>
        </div>

        {/* Bottom Subtitle / Voiceover Bar */}
        <div className="absolute bottom-16 inset-x-0 px-6 sm:px-14 z-20">
          <div className="p-3 rounded-xl bg-black/85 backdrop-blur-lg border border-white/15 text-center shadow-2xl">
            <p className="text-xs sm:text-sm font-medium text-white tracking-wide">
              "{currentAct.caption}"
            </p>
          </div>
        </div>

        {/* Bottom Controls & Timeline Bar */}
        <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-t from-black via-black/95 to-transparent z-30 flex flex-col gap-2">
          {/* Timeline Bar (Interactive Scrubber) */}
          <div className="grid grid-cols-4 gap-1.5">
            {TEASER_ACTS.map((act, idx) => {
              const isActive = idx === currentActIndex;
              const isPast = idx < currentActIndex;
              return (
                <button
                  key={act.id}
                  onClick={() => jumpToAct(idx)}
                  className="h-1.5 rounded-full bg-zinc-800/80 overflow-hidden relative cursor-pointer group"
                  title={`${act.badge}: ${act.title}`}
                >
                  <div 
                    className={`h-full transition-all duration-75 ${
                      isPast 
                        ? 'w-full bg-amber-400' 
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
                className="p-1.5 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-white transition-colors cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
              </button>

              <button
                onClick={restartTeaser}
                className="p-1.5 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Restart"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={toggleMute}
                className="p-1.5 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title={isMuted ? 'Unmute ElevenLabs Voiceover' : 'Mute ElevenLabs Voiceover'}
              >
                {isMuted ? <VolumeX className="h-3.5 w-3.5 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5 text-emerald-400" />}
              </button>

              <div className="flex items-center gap-1 font-mono text-[11px] text-zinc-400">
                <span className="text-white font-bold">{currentActIndex + 1}</span>
                <span>/</span>
                <span>{TEASER_ACTS.length}</span>
              </div>
            </div>

            {/* Scene Selector Pills */}
            <div className="hidden md:flex items-center gap-1.5">
              {TEASER_ACTS.map((act, idx) => (
                <button
                  key={act.id}
                  onClick={() => jumpToAct(idx)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                    currentActIndex === idx
                      ? 'bg-amber-400 text-zinc-950 font-black shadow-xs'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  Scene {idx + 1}
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

      {/* 4 Shot Preview & Nano Banana Prompt Matrix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-900 uppercase font-mono tracking-wider flex items-center gap-2">
            <Film className="h-4 w-4 text-amber-600" />
            <span>Nano Banana Shot-by-Shot Motion Prompts &amp; Keyframes</span>
          </h2>
          <span className="text-xs text-zinc-500 font-mono">
            Copy prompts directly into Nano Banana / Kling / Runway
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TEASER_ACTS.map((act, idx) => (
            <div 
              key={act.id}
              className={`p-4 rounded-2xl bg-white border transition-all shadow-2xs space-y-3 ${
                currentActIndex === idx ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-zinc-200'
              }`}
            >
              <div className="relative rounded-xl overflow-hidden aspect-video bg-zinc-900 border border-zinc-200">
                <img 
                  src={act.imageUrl} 
                  alt={act.title} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono font-bold text-amber-300">
                  SCENE 0{idx + 1}
                </div>
                <a
                  href={act.imageUrl}
                  download={`appointmentlyy-teaser-scene-${idx + 1}.jpg`}
                  className="absolute bottom-2 right-2 bg-black/80 hover:bg-black text-white px-2 py-1 rounded text-[10px] font-mono font-semibold flex items-center gap-1 shadow-sm"
                  title="Download Full-Res 16:9 Image"
                >
                  <Download className="h-3 w-3" />
                  <span>Download Image</span>
                </a>
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                  {act.badge}
                </span>
                <h3 className="font-bold text-sm text-zinc-900 mt-0.5">
                  {act.title}
                </h3>
              </div>

              {/* Nano Banana Video Prompt Box */}
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-100/70 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Video className="h-2.5 w-2.5 text-amber-700" />
                    <span>Nano Banana Motion Prompt:</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(act.nanoBananaPrompt, `prompt-${act.id}`)}
                    className="text-[10px] font-medium text-zinc-600 hover:text-zinc-950 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === `prompt-${act.id}` ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy Prompt</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] font-mono text-zinc-700 leading-snug select-text">
                  {act.nanoBananaPrompt}
                </p>
                <div className="pt-1 flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                  <span>🎥 {act.cameraDirection}</span>
                  <span>•</span>
                  <span>⚡ Motion: {act.motionStrength}</span>
                </div>
              </div>

              {/* Audio Track Download Link */}
              {act.audioUrl && (
                <div className="flex items-center justify-between pt-1 border-t border-zinc-100 text-[11px]">
                  <span className="text-zinc-500 font-mono flex items-center gap-1">
                    <Volume2 className="h-3 w-3 text-emerald-600" />
                    <span>ElevenLabs Broadcast Voiceover</span>
                  </span>
                  <a
                    href={act.audioUrl}
                    download={`appointmentlyy-voiceover-act-${idx + 1}.mp3`}
                    className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    <span>Download MP3</span>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Nano Banana Modal Drawer */}
      {showPromptPackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white border border-zinc-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <span className="h-8 w-8 rounded-xl bg-amber-400 text-zinc-950 flex items-center justify-center font-black">
                  🍌
                </span>
                <div>
                  <h3 className="font-bold text-base text-zinc-950">Nano Banana AI Video Production Instructions</h3>
                  <p className="text-xs text-zinc-500">Ready to drop into Nano Banana, Kling, or Runway Gen-3</p>
                </div>
              </div>
              <button
                onClick={() => setShowPromptPackModal(false)}
                className="text-zinc-400 hover:text-zinc-950 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-700 leading-relaxed">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 space-y-1">
                <span className="font-bold text-amber-950 block">⚡ Quick 3-Step Generation Guide:</span>
                <ol className="list-decimal pl-4 space-y-1 text-amber-900">
                  <li>Download the 4 photorealistic scene images above (16:9 4K resolution).</li>
                  <li>In <strong>Nano Banana Video</strong> (or Kling AI), select <strong>Image-to-Video</strong> and upload Scene 1.</li>
                  <li>Paste the corresponding Motion Prompt, set motion to 4, and render your 5–10 second clip!</li>
                </ol>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1 font-mono text-[11px]">
                <span className="font-bold text-zinc-900 block">Recommended Universal Negative Prompt:</span>
                <p className="text-zinc-600 select-all">
                  cartoon, 3d render, extra limbs, distorted fingers, blurry, morphing faces, chaotic camera shaking, unnatural glitch, oversaturated
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowPromptPackModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-white font-bold text-xs hover:bg-zinc-800 cursor-pointer"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
