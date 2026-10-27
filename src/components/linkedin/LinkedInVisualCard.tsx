'use client';

import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  ImageIcon, 
  Camera,
  Layers,
  RotateCw,
  Eye,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { VisualCardConfig } from '@/lib/linkedinStudio';

interface LinkedInVisualCardProps {
  visualConfig: VisualCardConfig;
  imagePrompt: string;
  realisticPhotoPrompt?: string;
  realisticImageUrl?: string;
  alternativeImageUrl?: string;
  alternativeImageLabel?: string;
  alternativeImagePrompt?: string;
  episodeNumber: number;
}

export default function LinkedInVisualCard({
  visualConfig,
  imagePrompt,
  realisticPhotoPrompt,
  realisticImageUrl,
  alternativeImageUrl,
  alternativeImageLabel = 'The Middleman Trap (Devil in Disguise)',
  alternativeImagePrompt,
  episodeNumber
}: LinkedInVisualCardProps) {
  // Mode: 'photo' (Realistic & Relatable) vs 'graphic' (Minimalist Executive Graphic)
  const [visualMode, setVisualMode] = useState<'photo' | 'graphic'>('photo');

  // Visual Photo Variant (Primary vs Alternative e.g. Broker Devil)
  const [activeVariant, setActiveVariant] = useState<'primary' | 'alternative'>('primary');

  // Curated Library of 100% Local High-Resolution 35mm Photos (0ms latency, zero rate limits)
  const LOCAL_AUTHENTIC_PHOTOS = [
    {
      url: '/images/linkedin/episode-1-realistic.jpg',
      label: 'Manila BGC SDR Desk (Dual Monitors)',
      badge: '🇵🇭 Filipino Talent'
    },
    {
      url: '/images/linkedin/episode-2-realistic.jpg',
      label: 'Manila BPO Team Leader & Rep Mentorship',
      badge: '🇵🇭 Filipino Talent'
    },
    {
      url: '/images/linkedin/episode-3-realistic.jpg',
      label: 'Foreign Client & Filipino Ops Director Boardroom',
      badge: '🤝 Client & PH Talent'
    },
    {
      url: '/images/linkedin/episode-4-realistic.jpg',
      label: 'Filipino Male SDR on BGC Outbound Floor',
      badge: '🇵🇭 Filipino Talent'
    },
    {
      url: '/images/linkedin/episode-5-realistic.jpg',
      label: 'Filipino Operations Director Training Workshop',
      badge: '🇵🇭 Filipino Talent'
    },
    {
      url: '/images/linkedin/episode-6-realistic.jpg',
      label: 'Foreign Client & Barong Tagalog BPO Founder Retainer',
      badge: '🤝 Client & PH Talent'
    }
  ];

  // Default realistic photo URL calculated from local pool
  const defaultPhotoIndex = ((episodeNumber - 1) % LOCAL_AUTHENTIC_PHOTOS.length);
  const defaultPhotoUrl = realisticImageUrl || LOCAL_AUTHENTIC_PHOTOS[defaultPhotoIndex].url;
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(defaultPhotoIndex);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string>(defaultPhotoUrl);
  const [downloading, setDownloading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Safety: auto-sanitize away any third-party rate-limited URLs
  React.useEffect(() => {
    if (currentPhotoUrl && currentPhotoUrl.includes('pollinations.ai')) {
      setCurrentPhotoUrl(defaultPhotoUrl);
    }
  }, [currentPhotoUrl, defaultPhotoUrl]);

  const cardRef = useRef<HTMLDivElement | null>(null);

  const primaryPhotoPrompt = realisticPhotoPrompt || (
    episodeNumber === 1
      ? `A realistic, relatable, candid 35mm photograph of a young professional Filipino female sales development representative with authentic Southeast Asian features, working at a clean minimalist office desk in Manila BGC. Dual monitors showing clean data charts, subtle call center headset, ID lanyard, notebook and coffee mug nearby. Soft natural window daylight, authentic human expression, natural skin texture, Kodak Portra 400 aesthetic, shallow depth of field, authentic Filipino BPO workplace.`
      : episodeNumber === 2
      ? `A candid, authentic 35mm photograph in a modern Manila BPO office. A smart Filipino male team leader and sales coach with authentic Southeast Asian features is mentoring a young female Filipino SDR over a laptop screen, reviewing an objection playbook. Warm daylight, modern contemporary startup office, natural unposed expressions of focus and camaraderie, call floor softly visible in background, Fujicolor Pro 400H tone, genuine Filipino workplace culture.`
      : `A candid 35mm photograph showing the direct relationship between a foreign enterprise client and Filipino offshore talent: A North American executive client in a tailored suit in a high-rise boardroom collaborating with an articulate Filipino female BPO operations director by a glass whiteboard. They are analyzing direct seat economics and margin growth charts. Sunlight streaming into the room, respectful peer-to-peer partnership, Kodak Portra 800 tone.`
  );

  const defaultAlternativePrompt = alternativeImagePrompt || `A cinematic 35mm editorial photograph of a predatory corporate lead broker and middleman depicted as a devil in disguise: An arrogant, manipulative man in his late 40s in an expensive dark charcoal suit with a crimson silk pocket square, leaning back in a leather armchair in a shadowy penthouse boardroom, wearing a calculating, cynical smirk over contracts marked with 35% margin fees. Dramatic chiaroscuro lighting, subtle devilish amber and crimson rim light, psychological thriller tone.`;

  const activePhotoPrompt = activeVariant === 'alternative' && alternativeImageUrl 
    ? defaultAlternativePrompt 
    : primaryPhotoPrompt;

  // Sync photo URL when variant changes
  const displayedPhotoUrl = activeVariant === 'alternative' && alternativeImageUrl 
    ? alternativeImageUrl 
    : currentPhotoUrl;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Cycle to next authentic photo in the curated local pool
  const handleCycleAuthenticPhoto = () => {
    const nextIndex = (currentPhotoIndex + 1) % LOCAL_AUTHENTIC_PHOTOS.length;
    setCurrentPhotoIndex(nextIndex);
    setCurrentPhotoUrl(LOCAL_AUTHENTIC_PHOTOS[nextIndex].url);
  };

  // Reset to default photo
  const handleResetDefaultPhoto = () => {
    setCurrentPhotoIndex(defaultPhotoIndex);
    setCurrentPhotoUrl(defaultPhotoUrl);
  };

  // Download the realistic JPG photo directly
  const handleDownloadPhoto = async () => {
    setDownloading(true);
    const photoToDownload = displayedPhotoUrl;
    const downloadFilename = activeVariant === 'alternative' 
      ? `linkedin-ep${episodeNumber}-broker-devil-in-disguise.jpg` 
      : `linkedin-ep${episodeNumber}-realistic-photo.jpg`;

    try {
      const response = await fetch(photoToDownload);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Failed to download photo:', err);
      // Fallback direct link trigger
      const link = document.createElement('a');
      link.href = photoToDownload;
      link.download = downloadFilename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setDownloading(false);
    }
  };

  // Download SVG Graphic
  const handleDownloadSvg = () => {
    setDownloading(true);
    try {
      const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#09090b" />
      <stop offset="50%" stop-color="#18181b" />
      <stop offset="100%" stop-color="#09090b" />
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#27272a" stroke-width="1" opacity="0.3"/>
    </pattern>
  </defs>
  
  <rect width="1080" height="1080" fill="url(#bgGrad)"/>
  <rect width="1080" height="1080" fill="url(#grid)"/>
  <circle cx="540" cy="400" r="320" fill="#3f3f46" opacity="0.1" filter="blur(80px)"/>
  <rect x="40" y="40" width="1000" height="1000" rx="28" fill="none" stroke="#27272a" stroke-width="2"/>
  
  <rect x="90" y="100" width="280" height="48" rx="24" fill="#27272a"/>
  <text x="230" y="132" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#f43f5e" letter-spacing="2" text-anchor="middle">
    ${(visualConfig.tag || `EPISODE 0${episodeNumber}`).toUpperCase()}
  </text>
  
  <text x="990" y="132" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#71717a" text-anchor="end">
    APPOINTMENTLYY INTELLIGENCE
  </text>
  
  <text x="90" y="380" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="130" font-weight="900" fill="#ffffff" letter-spacing="-3">
    ${visualConfig.metric || '82%'}
  </text>
  
  <text x="90" y="440" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="600" fill="#a1a1aa">
    ${visualConfig.metricLabel || 'Operational Benchmark'}
  </text>
  
  <line x1="90" y1="490" x2="990" y2="490" stroke="#3f3f46" stroke-width="2"/>
  
  <text x="90" y="600" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="800" fill="#f4f4f5">
    ${visualConfig.headline.length > 36 ? visualConfig.headline.slice(0, 36) + '...' : visualConfig.headline}
  </text>
  
  <text x="90" y="670" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="400" fill="#a1a1aa">
    ${visualConfig.subheadline || 'Key operational takeaway for BPO and outbound leaders'}
  </text>
  
  <rect x="90" y="900" width="900" height="80" rx="16" fill="#18181b" stroke="#27272a" stroke-width="1"/>
  <text x="130" y="948" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="600" fill="#e4e4e7">
    BPO Client Acquisition &amp; High-Retention Seat Architecture
  </text>
  <text x="950" y="948" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="700" fill="#10b981" text-anchor="end">
    VERIFIED BENCHMARK
  </text>
</svg>`;

      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `linkedin-ep${episodeNumber}-graphic.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download SVG:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-3 space-y-3">
      {/* Visual Header & Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900">
          <ImageIcon className="h-3.5 w-3.5 text-zinc-600" />
          <span>Post Visual Pairing</span>
        </div>

        {/* Visual Mode Selector Tabs */}
        <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 text-[10px] font-semibold">
          <button
            onClick={() => setVisualMode('photo')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors ${
              visualMode === 'photo'
                ? 'bg-white text-zinc-900 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Camera className="h-2.5 w-2.5" />
            <span>Relatable Photo</span>
          </button>

          <button
            onClick={() => setVisualMode('graphic')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors ${
              visualMode === 'graphic'
                ? 'bg-white text-zinc-900 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Layers className="h-2.5 w-2.5" />
            <span>Graphic</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* MODE 1: REALISTIC & RELATABLE PHOTOGRAPHY PREVIEW                   */}
      {/* =================================================================== */}
      {visualMode === 'photo' ? (
        <div className="space-y-2.5">
          {/* Dual Visual Variant Switcher (e.g. Collaboration vs Broker Devil) */}
          {alternativeImageUrl && (
            <div className="flex items-center justify-center gap-1 p-1 bg-zinc-100 rounded-lg text-[10px] font-semibold border border-zinc-200">
              <button
                type="button"
                onClick={() => setActiveVariant('primary')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeVariant === 'primary' 
                    ? 'bg-white text-zinc-900 shadow-2xs font-bold' 
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                🤝 Client & Talent
              </button>
              <button
                type="button"
                onClick={() => setActiveVariant('alternative')}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  activeVariant === 'alternative' 
                    ? 'bg-rose-950 text-rose-200 shadow-2xs font-bold' 
                    : 'text-zinc-500 hover:text-rose-700'
                }`}
              >
                <span>⚠️</span>
                <span>{alternativeImageLabel}</span>
              </button>
            </div>
          )}

          {/* Photo Display Card */}
          <div className="relative w-full aspect-square max-w-[280px] mx-auto rounded-xl overflow-hidden border border-zinc-200 bg-zinc-900 shadow-sm group">
            <img 
              src={displayedPhotoUrl} 
              alt={`LinkedIn Episode ${episodeNumber} Visual`} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Episode & Aesthetic / Demographics Badge */}
            <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between gap-1 pointer-events-none">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/75 text-emerald-300 backdrop-blur-xs border border-white/10">
                Candid 35mm
              </span>

              {/* Cultural Demographics Indicator */}
              {activeVariant === 'alternative' ? (
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-rose-950/85 text-rose-300 border border-rose-500/30">
                  Devil in Disguise
                </span>
              ) : episodeNumber === 3 ? (
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-950/85 text-blue-300 border border-blue-500/30">
                  Client & PH Talent
                </span>
              ) : (
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-950/85 text-emerald-300 border border-emerald-500/30">
                  🇵🇭 Filipino Talent
                </span>
              )}
            </div>

            <div className="absolute bottom-2 left-2 right-2 z-10 p-2 rounded-lg bg-black/75 backdrop-blur-xs border border-white/10 text-white text-left">
              <div className="text-[10px] font-bold truncate">
                {activeVariant === 'alternative' ? 'The Arrogant Middleman & 35% Fee Skim' : visualConfig.headline}
              </div>
              <div className="text-[8px] text-zinc-300 font-mono">
                {activeVariant === 'alternative' 
                  ? 'Predatory Broker / Devil in Disguise Archetype' 
                  : episodeNumber === 3 
                  ? 'Foreign Client & Filipino Offshore Talent Partnership' 
                  : 'Authentic Filipino BPO Operations Atmosphere'}
              </div>
            </div>
          </div>

          {/* Gemini Realistic Photography Prompt Box */}
          <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-2 space-y-1 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-700 flex items-center gap-1 uppercase tracking-wider">
                <Sparkles className="h-3 w-3 text-amber-500" />
                Gemini Photographic Prompt
              </span>
              <button
                onClick={() => copyToClipboard(activePhotoPrompt, `prompt-photo-${episodeNumber}`)}
                className="flex items-center gap-1 text-[10px] font-medium text-zinc-700 hover:text-zinc-950 bg-white border border-zinc-200 px-2 py-0.5 rounded hover:bg-zinc-100 transition-colors"
              >
                {copiedKey === `prompt-photo-${episodeNumber}` ? (
                  <>
                    <Check className="h-2.5 w-2.5 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-2.5 w-2.5" />
                    <span>Copy Prompt</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-zinc-600 leading-snug line-clamp-3 font-mono bg-white p-1.5 rounded border border-zinc-200/80">
              {activePhotoPrompt}
            </p>
          </div>

          {/* Action Buttons: Download Photo & Cycle Curated Photos */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleCycleAuthenticPhoto}
              className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 transition-colors"
              title="Cycle through curated authentic 35mm photos"
            >
              <RefreshCw className="h-3 w-3 text-zinc-600" />
              <span>Switch Photo</span>
            </button>

            <button
              onClick={handleDownloadPhoto}
              disabled={downloading}
              className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-[11px] font-bold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-2xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{downloading ? 'Saving...' : 'Download JPG'}</span>
            </button>
          </div>

          {currentPhotoIndex !== defaultPhotoIndex && (
            <div className="text-center pt-0.5">
              <button
                onClick={handleResetDefaultPhoto}
                className="text-[10px] text-zinc-400 hover:text-zinc-700 underline transition-colors"
              >
                Reset to Episode {episodeNumber} Default
              </button>
            </div>
          )}
        </div>
      ) : (
        /* =================================================================== */
        /* MODE 2: MINIMALIST EXECUTIVE GRAPHIC PREVIEW                        */
        /* =================================================================== */
        <div className="space-y-2.5">
          <div 
            ref={cardRef}
            className="relative w-full aspect-square max-w-[280px] mx-auto rounded-xl bg-zinc-950 p-4 border border-zinc-800 text-white flex flex-col justify-between overflow-hidden shadow-md select-none group"
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:16px_16px] opacity-20 pointer-events-none" />
            
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[9px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-rose-400 border border-zinc-700">
                {visualConfig.tag || `EPISODE 0${episodeNumber}`}
              </span>
              <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-tight">
                Appointmentlyy
              </span>
            </div>

            <div className="relative z-10 my-auto text-center space-y-1">
              <div className="text-4xl font-extrabold tracking-tight text-white font-mono">
                {visualConfig.metric || '82%'}
              </div>
              <div className="text-[10px] text-zinc-400 font-medium px-2 leading-tight">
                {visualConfig.metricLabel || 'Operational Metric'}
              </div>
            </div>

            <div className="relative z-10 pt-2 border-t border-zinc-800/80 space-y-0.5 text-left">
              <div className="text-[11px] font-bold text-zinc-100 line-clamp-2 leading-tight">
                {visualConfig.headline}
              </div>
              <div className="text-[9px] text-zinc-400 line-clamp-1">
                {visualConfig.subheadline || 'Key takeaway for BPO and outbound leaders'}
              </div>
            </div>
          </div>

          {/* Graphic Design Prompt */}
          <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-2 space-y-1 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-700 flex items-center gap-1 uppercase tracking-wider">
                <Sparkles className="h-3 w-3 text-amber-500" />
                Graphic Design Prompt
              </span>
              <button
                onClick={() => copyToClipboard(imagePrompt, `prompt-graphic-${episodeNumber}`)}
                className="flex items-center gap-1 text-[10px] font-medium text-zinc-700 hover:text-zinc-950 bg-white border border-zinc-200 px-2 py-0.5 rounded hover:bg-zinc-100 transition-colors"
              >
                {copiedKey === `prompt-graphic-${episodeNumber}` ? (
                  <>
                    <Check className="h-2.5 w-2.5 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-2.5 w-2.5" />
                    <span>Copy Prompt</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-zinc-600 leading-snug line-clamp-3 font-mono bg-white p-1.5 rounded border border-zinc-200/80">
              {imagePrompt}
            </p>
          </div>

          <button
            onClick={handleDownloadSvg}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-[11px] font-bold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-2xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{downloading ? 'Downloading...' : 'Download Graphic (SVG)'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
