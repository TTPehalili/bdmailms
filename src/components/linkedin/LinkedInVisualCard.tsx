'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  ImageIcon, 
  Camera, 
  Layers, 
  RefreshCw, 
  CheckCircle2,
  Edit3,
  ShieldCheck
} from 'lucide-react';
import { VisualCardConfig } from '@/lib/linkedinStudio';

export interface PovPhotoItem {
  id: string;
  url: string;
  headline: string;
  subtitle: string;
  badge: string;
  badgeType: 'devil' | 'filipino' | 'client' | 'ops';
  prompt: string;
  buttonLabel: string;
}

export const POV_IMAGE_CATALOG: PovPhotoItem[] = [
  {
    id: 'broker-devil',
    url: '/images/linkedin/broker-middleman-devil.jpg',
    headline: 'THE BROKER TAX: 60% Cut & OPEX Drain',
    subtitle: 'Predatory Middleman • 60% Skim & Floor Control Takeover',
    badge: '⚠️ Devil in Disguise',
    badgeType: 'devil',
    buttonLabel: '⚠️ 60% Broker Tax',
    prompt: 'A cinematic 35mm editorial photograph of a predatory corporate lead broker and middleman depicted as a devil in disguise: An arrogant, manipulative man in his late 40s in an expensive dark charcoal suit with a crimson silk pocket square, leaning back in a leather armchair in a shadowy penthouse boardroom, steepled hands, wearing a calculating cynical smirk over contracts stamped with 60% broker cut and cheap pay-per-performance terms. Chiaroscuro dramatic lighting with subtle crimson rim light, psychological thriller tone, zero corporate cheer.'
  },
  {
    id: 'script-discard-sparring',
    url: '/images/linkedin/script-discard-sparring.jpg',
    headline: 'SCRIPTLESS TELEPROMPTER',
    subtitle: 'Sub-150ms Live Objection Teleprompting & Discarded Scripts',
    badge: '🇵🇭 Authentic Filipino Talent',
    badgeType: 'filipino',
    buttonLabel: '⚡ Scriptless Teleprompter',
    prompt: 'Authentic candid 35mm photojournalism in a high-tech Manila BGC outbound center: An articulate young Filipino male SDR wearing an ergonomic headset, intensely engaged in live consultative calling. Dual screens display "LIVE OBJECTION TELEPROMPTER CUES - 150ms LATENCY" and real-time prospect telemetry. On the desk next to him, a crumpled static PDF script sits discarded in a recycling bin, symbolizing the transition from rigid scripts to agile voice sparring. Modern glass architecture, warm natural daylight, Kodak Portra 400 aesthetic, authentic Filipino BPO setting.'
  },
  {
    id: 'direct-partnership-equity',
    url: '/images/linkedin/direct-partnership-equity.jpg',
    headline: 'DIRECT CONTRACT EQUITY',
    subtitle: 'Foreign Client & Filipino BPO Director Strategic Partnership',
    badge: '🤝 Client & PH Talent',
    badgeType: 'client',
    buttonLabel: '🤝 Client & Talent Equity',
    prompt: 'A candid 35mm photograph showing the direct relationship between a foreign enterprise client and Filipino offshore talent: A senior North American client executive in a tailored navy blazer and a distinguished, articulate Filipino female BPO operations director collaborating as equal strategic partners. They stand beside a transparent glass architectural whiteboard displaying "DIRECT SEAT CONTRACT ECONOMICS • 100% EQUITY RETENTION • REVENUE VELOCITY". Authentic warm golden hour sunlight, Kodak Portra 800 tone, respectful peer-to-peer partnership, zero generic stock poses.'
  },
  {
    id: 'hostile-coaching',
    url: '/images/linkedin/episode-2-realistic.jpg',
    headline: 'OBJECTION SPARRING COACH',
    subtitle: 'Manila BPO Team Leader Mentoring SDR on Objection Playbook',
    badge: '🇵🇭 Authentic Filipino Talent',
    badgeType: 'filipino',
    buttonLabel: '🇵🇭 Coach Mentorship',
    prompt: 'A candid, authentic 35mm photograph in a modern Manila BPO office: A smart Filipino male team leader and sales coach with authentic Southeast Asian features mentoring a young female Filipino SDR over a laptop screen, reviewing an objection playbook. Warm daylight, modern contemporary startup office, natural unposed expressions of focus and camaraderie, call floor softly visible in background, Fujicolor Pro 400H tone, genuine Filipino workplace culture.'
  },
  {
    id: 'enriched-pipeline',
    url: '/images/linkedin/episode-1-realistic.jpg',
    headline: 'ENRICHED PIPELINE RESEARCH',
    subtitle: 'Focused Manila BGC SDR Analyzing Target Enterprise Accounts',
    badge: '🇵🇭 Authentic Filipino Talent',
    badgeType: 'filipino',
    buttonLabel: '🎯 Pipeline Research Desk',
    prompt: 'A realistic, relatable, candid 35mm photograph of a young professional Filipino female sales development representative with authentic Southeast Asian features, working at a clean minimalist office desk in Manila BGC. She is focused on dual monitor screens showing clean data charts, wearing a subtle call center headset, ID lanyard, holding a pen over a notebook with a ceramic coffee mug nearby. Soft natural daylight from high-rise office windows, authentic human expression, natural skin texture, Kodak Portra 400 film aesthetic, shallow depth of field, authentic Filipino BPO workplace.'
  },
  {
    id: 'operations-telemetry',
    url: '/images/linkedin/episode-5-realistic.jpg',
    headline: 'FLOOR PRODUCTION METRICS',
    subtitle: 'Filipino Operations Director Reviewing Live Telemetry Metrics',
    badge: '🇵🇭 Authentic Filipino Talent',
    badgeType: 'filipino',
    buttonLabel: '📊 Floor Ops Director',
    prompt: 'A documentary 35mm photograph of an experienced Filipino operations manager with authentic Southeast Asian features, collaborating inside a modern Manila tech office in BGC. Standing beside a digital dashboard showing outbound retention rates and live dial telemetry, reviewing real-time rep performance with clear authority. Natural office ambient lighting, unposed documentary photography, Kodachrome tones, authentic Filipino leadership.'
  }
];

interface LinkedInVisualCardProps {
  visualConfig: VisualCardConfig;
  imagePrompt: string;
  realisticPhotoPrompt?: string;
  realisticImageUrl?: string;
  alternativeImageUrl?: string;
  alternativeImageLabel?: string;
  alternativeImagePrompt?: string;
  episodeNumber: number;
  postTitle?: string;
  postHook?: string;
  postBody?: string;
}

export default function LinkedInVisualCard({
  visualConfig,
  imagePrompt,
  realisticPhotoPrompt,
  realisticImageUrl,
  alternativeImageUrl,
  alternativeImageLabel = 'The Middleman Trap (Devil in Disguise)',
  alternativeImagePrompt,
  episodeNumber,
  postTitle,
  postHook,
  postBody
}: LinkedInVisualCardProps) {
  // Visual Mode: 'photo' (Realistic & Relatable) vs 'graphic' (Minimalist Executive Graphic)
  const [visualMode, setVisualMode] = useState<'photo' | 'graphic'>('photo');

  // Variant switcher: 'primary' vs 'alternative'
  const [activeVariant, setActiveVariant] = useState<'primary' | 'alternative'>('primary');

  // Find initial catalog index matching realisticImageUrl or fallback
  const getCatalogIndex = (url?: string): number => {
    if (!url) return (episodeNumber - 1) % POV_IMAGE_CATALOG.length;
    const foundIdx = POV_IMAGE_CATALOG.findIndex(item => item.url === url);
    return foundIdx >= 0 ? foundIdx : (episodeNumber - 1) % POV_IMAGE_CATALOG.length;
  };

  const initialCatalogIndex = getCatalogIndex(realisticImageUrl);
  const [currentCatalogIndex, setCurrentCatalogIndex] = useState<number>(initialCatalogIndex);
  const [customPrimaryPrompt, setCustomPrimaryPrompt] = useState<string>(
    realisticPhotoPrompt || POV_IMAGE_CATALOG[initialCatalogIndex].prompt
  );
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Synchronize when parent props change
  useEffect(() => {
    const nextIdx = getCatalogIndex(realisticImageUrl);
    setCurrentCatalogIndex(nextIdx);
    setCustomPrimaryPrompt(realisticPhotoPrompt || POV_IMAGE_CATALOG[nextIdx].prompt);
  }, [realisticImageUrl, realisticPhotoPrompt]);

  const activeCatalogItem = POV_IMAGE_CATALOG[currentCatalogIndex];

  // Resolve alternative item details if alternativeImageUrl exists
  const altCatalogItem = alternativeImageUrl 
    ? POV_IMAGE_CATALOG.find(item => item.url === alternativeImageUrl)
    : null;

  // Active photo URL
  const displayedPhotoUrl = activeVariant === 'alternative' && alternativeImageUrl
    ? alternativeImageUrl
    : activeCatalogItem.url;

  // Active prompt: strictly in sync with the displayed photo!
  const displayedPhotoPrompt = activeVariant === 'alternative' && alternativeImageUrl
    ? (alternativeImagePrompt || altCatalogItem?.prompt || POV_IMAGE_CATALOG[0].prompt)
    : customPrimaryPrompt;

  // Active headline and subtitle overlay
  const displayedHeadline = activeVariant === 'alternative'
    ? (altCatalogItem?.headline || 'THE BROKER TAX: Margin Skim')
    : activeCatalogItem.headline;

  const displayedSubtitle = activeVariant === 'alternative'
    ? (altCatalogItem?.subtitle || 'Predatory Lead Broker • Devil in Disguise Archetype')
    : activeCatalogItem.subtitle;

  // Active cultural badge
  const displayedBadge = activeVariant === 'alternative'
    ? (altCatalogItem?.badge || '⚠️ Devil in Disguise')
    : activeCatalogItem.badge;

  const displayedBadgeType = activeVariant === 'alternative'
    ? (altCatalogItem?.badgeType || 'devil')
    : activeCatalogItem.badgeType;

  const primaryButtonLabel = activeCatalogItem.buttonLabel || '📸 Primary Photo';

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Cycle to next authentic photo in curated catalog
  const handleCycleAuthenticPhoto = () => {
    const nextIndex = (currentCatalogIndex + 1) % POV_IMAGE_CATALOG.length;
    setCurrentCatalogIndex(nextIndex);
    setCustomPrimaryPrompt(POV_IMAGE_CATALOG[nextIndex].prompt);
    setActiveVariant('primary');
  };

  // Reset to default photo & prompt
  const handleResetDefaultPhoto = () => {
    setCurrentCatalogIndex(initialCatalogIndex);
    setCustomPrimaryPrompt(realisticPhotoPrompt || POV_IMAGE_CATALOG[initialCatalogIndex].prompt);
    setActiveVariant('primary');
  };

  // Download the realistic JPG photo directly
  const handleDownloadPhoto = async () => {
    setDownloading(true);
    const photoToDownload = displayedPhotoUrl;
    const downloadFilename = activeVariant === 'alternative' 
      ? `linkedin-ep${episodeNumber}-alternative-visual.jpg` 
      : `linkedin-ep${episodeNumber}-${activeCatalogItem.id}.jpg`;

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
          <span className="flex items-center gap-0.5 text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
            <ShieldCheck className="h-2.5 w-2.5 text-emerald-600" />
            POV Aligned
          </span>
        </div>

        {/* Visual Mode Selector Tabs */}
        <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 text-[10px] font-semibold">
          <button
            type="button"
            onClick={() => setVisualMode('photo')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors ${
              visualMode === 'photo'
                ? 'bg-white text-zinc-900 shadow-2xs font-bold'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Camera className="h-2.5 w-2.5" />
            <span>Relatable Photo</span>
          </button>

          <button
            type="button"
            onClick={() => setVisualMode('graphic')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors ${
              visualMode === 'graphic'
                ? 'bg-white text-zinc-900 shadow-2xs font-bold'
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
          {/* Dual Visual Variant Switcher (e.g. Primary vs Alternative Devil) */}
          {alternativeImageUrl && (
            <div className="flex items-center justify-center gap-1 p-1 bg-zinc-100 rounded-lg text-[10px] font-semibold border border-zinc-200">
              <button
                type="button"
                onClick={() => setActiveVariant('primary')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeVariant === 'primary' 
                    ? 'bg-white text-zinc-900 shadow-2xs font-bold ring-1 ring-zinc-300' 
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {primaryButtonLabel}
              </button>
              <button
                type="button"
                onClick={() => setActiveVariant('alternative')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  activeVariant === 'alternative' 
                    ? 'bg-rose-950 text-rose-100 shadow-2xs font-bold ring-1 ring-rose-700' 
                    : 'text-zinc-600 hover:text-rose-800'
                }`}
              >
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
              {displayedBadgeType === 'devil' ? (
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-rose-950/90 text-rose-300 border border-rose-500/40">
                  {displayedBadge}
                </span>
              ) : displayedBadgeType === 'client' ? (
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-950/90 text-blue-300 border border-blue-500/40">
                  {displayedBadge}
                </span>
              ) : (
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-950/90 text-emerald-300 border border-emerald-500/40">
                  {displayedBadge}
                </span>
              )}
            </div>

            {/* Headline and Narrative Subtitle Overlay */}
            <div className="absolute bottom-2 left-2 right-2 z-10 p-2 rounded-lg bg-black/80 backdrop-blur-xs border border-white/10 text-white text-left">
              <div className="text-[10px] font-bold tracking-tight truncate text-zinc-100">
                {displayedHeadline}
              </div>
              <div className="text-[8px] text-zinc-300 font-mono line-clamp-1">
                {displayedSubtitle}
              </div>
            </div>
          </div>

          {/* Gemini Realistic Photography Prompt Box - 100% Synchronized */}
          <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-2 space-y-1.5 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-700 flex items-center gap-1 uppercase tracking-wider">
                <Sparkles className="h-3 w-3 text-amber-500" />
                Gemini Photographic Prompt
                <span className="text-[8px] font-normal text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded font-sans">
                  In Sync
                </span>
              </span>
              
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsEditingPrompt(!isEditingPrompt)}
                  className="flex items-center gap-0.5 text-[10px] font-medium text-zinc-600 hover:text-zinc-950 bg-white border border-zinc-200 px-1.5 py-0.5 rounded hover:bg-zinc-100 transition-colors"
                  title="Customize photographic prompt"
                >
                  <Edit3 className="h-2.5 w-2.5 text-zinc-500" />
                  <span>{isEditingPrompt ? 'Close' : 'Edit'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => copyToClipboard(displayedPhotoPrompt, `prompt-photo-${episodeNumber}`)}
                  className="flex items-center gap-1 text-[10px] font-semibold text-zinc-700 hover:text-zinc-950 bg-white border border-zinc-200 px-2 py-0.5 rounded hover:bg-zinc-100 transition-colors shadow-2xs"
                >
                  {copiedKey === `prompt-photo-${episodeNumber}` ? (
                    <>
                      <Check className="h-2.5 w-2.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-2.5 w-2.5" />
                      <span>Copy Prompt</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {isEditingPrompt ? (
              <textarea
                value={displayedPhotoPrompt}
                onChange={(e) => setCustomPrimaryPrompt(e.target.value)}
                rows={3}
                className="w-full text-[10px] font-mono p-1.5 rounded border border-zinc-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-zinc-800 text-zinc-800"
              />
            ) : (
              <p className="text-[10px] text-zinc-700 leading-relaxed font-mono bg-white p-2 rounded border border-zinc-200/90 line-clamp-3">
                {displayedPhotoPrompt}
              </p>
            )}
          </div>

          {/* Action Buttons: Switch Photo & Download Photo */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              onClick={handleCycleAuthenticPhoto}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 transition-colors"
              title="Cycle through curated authentic 35mm photos with synchronized prompts"
            >
              <RefreshCw className="h-3 w-3 text-zinc-600" />
              <span>Switch Photo</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPhoto}
              disabled={downloading}
              className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-[11px] font-bold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-2xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{downloading ? 'Saving...' : 'Download JPG'}</span>
            </button>
          </div>

          {currentCatalogIndex !== initialCatalogIndex && (
            <div className="text-center pt-0.5">
              <button
                type="button"
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
                type="button"
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
            type="button"
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
