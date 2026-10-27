'use client';

import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  ImageIcon, 
  ExternalLink,
  Layers,
  BarChart2
} from 'lucide-react';
import { VisualCardConfig } from '@/lib/linkedinStudio';

interface LinkedInVisualCardProps {
  visualConfig: VisualCardConfig;
  imagePrompt: string;
  episodeNumber: number;
}

export default function LinkedInVisualCard({
  visualConfig,
  imagePrompt,
  episodeNumber
}: LinkedInVisualCardProps) {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(imagePrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

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
  
  <!-- Background -->
  <rect width="1080" height="1080" fill="url(#bgGrad)"/>
  <rect width="1080" height="1080" fill="url(#grid)"/>
  
  <!-- Subtle Glow -->
  <circle cx="540" cy="400" r="320" fill="#3f3f46" opacity="0.1" filter="blur(80px)"/>
  
  <!-- Border Inset -->
  <rect x="40" y="40" width="1000" height="1000" rx="28" fill="none" stroke="#27272a" stroke-width="2"/>
  
  <!-- Top Tag Capsule -->
  <rect x="90" y="100" width="280" height="48" rx="24" fill="#27272a"/>
  <text x="230" y="132" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#f43f5e" letter-spacing="2" text-anchor="middle">
    ${(visualConfig.tag || `EPISODE 0${episodeNumber}`).toUpperCase()}
  </text>
  
  <!-- Watermark Brand -->
  <text x="990" y="132" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#71717a" text-anchor="end">
    APPOINTMENTLYY INTELLIGENCE
  </text>
  
  <!-- Giant Metric -->
  <text x="90" y="380" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="130" font-weight="900" fill="#ffffff" letter-spacing="-3">
    ${visualConfig.metric || '82%'}
  </text>
  
  <text x="90" y="440" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="600" fill="#a1a1aa">
    ${visualConfig.metricLabel || 'Operational Benchmark'}
  </text>
  
  <!-- Divider -->
  <line x1="90" y1="490" x2="990" y2="490" stroke="#3f3f46" stroke-width="2"/>
  
  <!-- Headline -->
  <text x="90" y="600" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="800" fill="#f4f4f5">
    ${visualConfig.headline.length > 36 ? visualConfig.headline.slice(0, 36) + '...' : visualConfig.headline}
  </text>
  
  <!-- Subheadline -->
  <text x="90" y="670" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="400" fill="#a1a1aa">
    ${visualConfig.subheadline || 'Key operational takeaway for BPO and outbound leaders'}
  </text>
  
  <!-- Bottom Footer -->
  <rect x="90" y="900" width="900" height="80" rx="16" fill="#18181b" stroke="#27272a" stroke-width="1"/>
  <text x="130" y="948" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="600" fill="#e4e4e7">
    BPO Client Acquisition &amp; High-Retention Seat Architecture
  </text>
  <text x="950" y="948" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="700" fill="#10b981" text-anchor="end">
    VERIFIED BENCHMARK
  </text>
</svg>
      `;

      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `linkedin-ep${episodeNumber}-visual.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download visual card:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900">
          <ImageIcon className="h-3.5 w-3.5 text-zinc-600" />
          <span>Gemini Creative Visual Pairing</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
          1080 × 1080 Square
        </span>
      </div>

      {/* Visual Graphic Card Preview */}
      <div 
        ref={cardRef}
        className="relative w-full aspect-square max-w-[280px] mx-auto rounded-xl bg-zinc-950 p-4 border border-zinc-800 text-white flex flex-col justify-between overflow-hidden shadow-md select-none group"
      >
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:16px_16px] opacity-20 pointer-events-none" />
        
        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-[9px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-rose-400 border border-zinc-700">
            {visualConfig.tag || `EPISODE 0${episodeNumber}`}
          </span>
          <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-tight">
            Appointmentlyy
          </span>
        </div>

        {/* Central Metric */}
        <div className="relative z-10 my-auto text-center space-y-1">
          <div className="text-4xl font-extrabold tracking-tight text-white font-mono">
            {visualConfig.metric || '82%'}
          </div>
          <div className="text-[10px] text-zinc-400 font-medium px-2 leading-tight">
            {visualConfig.metricLabel || 'Operational Metric'}
          </div>
        </div>

        {/* Bottom Headline & Subtext */}
        <div className="relative z-10 pt-2 border-t border-zinc-800/80 space-y-0.5">
          <div className="text-[11px] font-bold text-zinc-100 line-clamp-2 leading-tight">
            {visualConfig.headline}
          </div>
          <div className="text-[9px] text-zinc-400 line-clamp-1">
            {visualConfig.subheadline || 'Key takeaway for BPO and outbound leaders'}
          </div>
        </div>
      </div>

      {/* Gemini Image Generation Prompt Accordion / Box */}
      <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-2.5 space-y-1.5 text-left">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-zinc-700 flex items-center gap-1 uppercase tracking-wider">
            <Sparkles className="h-3 w-3 text-amber-500" />
            Gemini / Imagen Prompt
          </span>
          <button
            onClick={handleCopyPrompt}
            className="flex items-center gap-1 text-[10px] font-medium text-zinc-700 hover:text-zinc-950 bg-white border border-zinc-200 px-2 py-0.5 rounded hover:bg-zinc-100 transition-colors"
          >
            {copiedPrompt ? (
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
        <p className="text-[11px] text-zinc-600 leading-snug line-clamp-3 font-mono bg-white p-2 rounded border border-zinc-200/80">
          {imagePrompt}
        </p>
      </div>

      {/* Download Action */}
      <button
        onClick={handleDownloadSvg}
        disabled={downloading}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-2xs"
      >
        <Download className="h-3.5 w-3.5" />
        <span>{downloading ? 'Downloading...' : 'Download Visual Card (SVG)'}</span>
      </button>
    </div>
  );
}
