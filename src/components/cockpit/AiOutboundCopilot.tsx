'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Loader2, 
  Copy, 
  Check, 
  ArrowRight, 
  RefreshCw, 
  Layers, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  Mail,
  RotateCcw
} from 'lucide-react';
import LinkedinIcon from '@/components/icons/LinkedinIcon';
import { 
  DEFAULT_OUTBOUND_FRAMEWORKS, 
  DEFAULT_ANTI_SALES_CTAS, 
  OutboundFramework, 
  AntiSalesCta,
  getStoredFrameworks,
  getStoredAntiSalesCtas,
  OutboundChannel
} from '@/lib/outboundFrameworks';

interface AiOutboundCopilotProps {
  channel: OutboundChannel;
  touchType?: string;
  lead: {
    name: string;
    company: string;
    title: string;
    department?: string;
    headcount?: string;
    phone?: string;
    email?: string;
    website?: string;
    linkedinUrl?: string;
    techStack?: string;
    painPoint?: string;
    outsourcer?: string;
    buyingSignals?: string[];
    customVariables?: Record<string, string>;
  };
  currentSubject?: string;
  currentBody?: string;
  onApplyCopy: (subject: string, body: string) => void;
  onResetOriginal?: () => void;
}

export default function AiOutboundCopilot({
  channel,
  touchType = 'Outreach',
  lead,
  currentSubject = '',
  currentBody = '',
  onApplyCopy,
  onResetOriginal
}: AiOutboundCopilotProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [frameworks, setFrameworks] = useState<OutboundFramework[]>([]);
  const [antiSalesCtas, setAntiSalesCtas] = useState<AntiSalesCta[]>([]);
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string>('');
  const [selectedCtaId, setSelectedCtaId] = useState<string>('');
  const [customRepInstruction, setCustomRepInstruction] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [appliedToast, setAppliedToast] = useState(false);

  // Generated state
  const [generatedResult, setGeneratedResult] = useState<{
    subject: string;
    body: string;
    wordCount: number;
    charCount: number;
    readingTimeSec: number;
    frameworkUsed: string;
    antiSalesCtaUsed: string;
    prospectInsight: string;
    alternativeHooks: string[];
    modelUsed: string;
  } | null>(null);

  // Load active frameworks and CTAs filtered by active channel
  useEffect(() => {
    const allFw = getStoredFrameworks();
    const filtered = allFw.filter(f => f.channel === channel && f.isActive);
    setFrameworks(filtered);
    if (filtered.length > 0) {
      const def = filtered.find(f => f.isDefault) || filtered[0];
      setSelectedFrameworkId(def.id);
    }

    const allCtas = getStoredAntiSalesCtas();
    const ctasFiltered = allCtas.filter(c => c.channel === channel || c.channel === 'Both' || c.channel === 'All');
    setAntiSalesCtas(ctasFiltered);
    if (ctasFiltered.length > 0) {
      setSelectedCtaId(ctasFiltered[0].id);
    }
  }, [channel]);

  // When user changes framework dropdown, trigger generation or reset
  const handleFrameworkChange = (newFwId: string) => {
    setSelectedFrameworkId(newFwId);
  };

  // Generate / Rewrite handler
  const handleGenerate = async (overrideInstruction?: string) => {
    setIsGenerating(true);
    setAppliedToast(false);
    try {
      const instructionToUse = overrideInstruction !== undefined ? overrideInstruction : customRepInstruction;

      const res = await fetch('/api/ai/outbound-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          touchType,
          lead,
          frameworkId: selectedFrameworkId,
          antiSalesCtaId: selectedCtaId,
          customPromptInstruction: instructionToUse,
          tone: channel === 'Phone' ? 'Natural Spoken' : 'Crisp & Direct'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedResult({
          subject: data.subject || '',
          body: data.body || '',
          wordCount: data.wordCount || 0,
          charCount: data.charCount || 0,
          readingTimeSec: data.readingTimeSec || 0,
          frameworkUsed: data.frameworkUsed || '',
          antiSalesCtaUsed: data.antiSalesCtaUsed || '',
          prospectInsight: data.prospectInsight || '',
          alternativeHooks: data.alternativeHooks || [],
          modelUsed: data.modelUsed || 'Gemini 3.5'
        });
      } else {
        console.error('Failed to generate copy');
      }
    } catch (err) {
      console.error('Error generating outbound copy:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Approve & Insert
  const handleApprove = () => {
    if (!generatedResult) return;
    onApplyCopy(generatedResult.subject, generatedResult.body);
    setAppliedToast(true);
    setTimeout(() => setAppliedToast(false), 3000);
  };

  // Copy to clipboard
  const handleCopy = () => {
    if (!generatedResult) return;
    const fullText = channel === 'Email' && generatedResult.subject
      ? `Subject: ${generatedResult.subject}\n\n${generatedResult.body}`
      : generatedResult.body;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Swap opening hook
  const handleSwapHook = (newHook: string) => {
    if (!generatedResult) return;
    const lines = generatedResult.body.split('\n\n');
    if (lines.length > 0) {
      lines[0] = newHook;
      const updatedBody = lines.join('\n\n');
      setGeneratedResult(prev => prev ? { ...prev, body: updatedBody } : null);
    }
  };

  const channelIcon = channel === 'Phone' ? <PhoneCall className="w-3.5 h-3.5" /> : channel === 'Email' ? <Mail className="w-3.5 h-3.5" /> : <LinkedinIcon className="w-3.5 h-3.5" />;

  const channelLabel = channel === 'Phone' ? 'Cold Call Guru Teleprompter' : channel === 'Email' ? 'Cold Email Framework' : 'LinkedIn Outbound';

  const quickTweaks = channel === 'Phone' ? [
    { label: 'Brutal Honesty', prompt: 'Make it radically honest and self-deprecating. Tell prospect they can hang up.' },
    { label: 'Shorter (<15s)', prompt: 'Make it strictly under 30 words so it takes less than 15 seconds to say aloud.' },
    { label: 'Poke Competitor', prompt: `Directly mention hesitation against ${lead.outsourcer || 'Titan BPO'} on price.` },
    { label: 'Tactical Empathy', prompt: 'Acknowledge they are in the middle of ten things before asking for 20 seconds.' }
  ] : [
    { label: 'Under 40 words', prompt: 'Make it strictly under 40 words. Absolute minimalism.' },
    { label: 'More casual', prompt: 'Make it more casual and conversational like a quick note.' },
    { label: 'Founder-to-Founder', prompt: 'Rewrite in an operator-to-operator tone discussing seat gross margins.' },
    { label: 'Sharpen Anti-Sales CTA', prompt: 'Make the closing CTA completely disarming so the prospect feels 100% free to say no.' }
  ];

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xs transition-all">
      {/* HEADER / TOGGLE */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-3.5 py-2.5 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between cursor-pointer select-none hover:bg-zinc-100/70 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-zinc-900 text-white">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-zinc-900">
                Gemini AI Outbound Copilot
              </span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-zinc-200/70 text-zinc-700 flex items-center gap-1">
                {channelIcon}
                <span>{channelLabel}</span>
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Grounded in .csv intelligence • Guru frameworks • Anti-sales CTAs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {generatedResult && (
            <span className="text-[10px] font-mono text-zinc-500 bg-white border border-zinc-200 px-2 py-0.5 rounded">
              {generatedResult.wordCount} words • ~{generatedResult.readingTimeSec}s {channel === 'Phone' ? 'speak' : 'read'}
            </span>
          )}
          <button 
            type="button" 
            className="text-zinc-400 hover:text-zinc-600 p-0.5"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* EXPANDED CONTENT */}
      {isOpen && (
        <div className="p-3.5 space-y-3">
          {/* CSV KNOWLEDGE SIGNALS BAR */}
          <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-200/80 text-[11px] flex flex-wrap items-center gap-x-3 gap-y-1 text-zinc-600">
            <span className="font-semibold text-zinc-900 flex items-center gap-1">
              <span>📄</span>
              <span>CSV Intelligence:</span>
            </span>
            <span>Floor: <strong className="text-zinc-900">{lead.headcount || '50+ Seats'}</strong></span>
            <span>Tech: <strong className="text-zinc-900">{lead.techStack || 'Apollo/HubSpot'}</strong></span>
            <span>Competitor: <strong className="text-zinc-900">{lead.outsourcer || 'Incumbent BPO'}</strong></span>
            {lead.painPoint && (
              <span className="truncate max-w-xs">
                Friction: <strong className="text-zinc-900">{lead.painPoint}</strong>
              </span>
            )}
            {lead.website && (
              <span>Web: <span className="font-mono text-zinc-700">{lead.website}</span></span>
            )}
          </div>

          {/* DROPDOWN OPTIONS TO CHOOSE FROM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] font-mono font-medium uppercase tracking-wider text-zinc-500 block mb-1">
                Select Outbound Framework ({frameworks.length} Available)
              </label>
              <select
                value={selectedFrameworkId}
                onChange={(e) => handleFrameworkChange(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900/10 focus:border-zinc-400 font-medium"
              >
                {frameworks.map((fw) => (
                  <option key={fw.id} value={fw.id}>
                    {fw.name} ({fw.authorOrStyle})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono font-medium uppercase tracking-wider text-zinc-500 block mb-1">
                Select Anti-Sales Closing Angle
              </label>
              <select
                value={selectedCtaId}
                onChange={(e) => setSelectedCtaId(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900/10 focus:border-zinc-400 font-medium"
              >
                {antiSalesCtas.map((cta) => (
                  <option key={cta.id} value={cta.id}>
                    {cta.label} ({cta.psychologyAngle})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CUSTOM REP INSTRUCTION INPUT & GENERATE / REWRITE BUTTON */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customRepInstruction}
              onChange={(e) => setCustomRepInstruction(e.target.value)}
              placeholder="Custom direction? (e.g. 'Mention Manila expansion' or 'Keep under 20 words')"
              className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900/10 focus:border-zinc-400"
            />
            <button
              type="button"
              onClick={() => handleGenerate()}
              disabled={isGenerating}
              className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-200 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
                  <span>{generatedResult ? 'Rewrite Another Version' : 'Synthesize with Gemini'}</span>
                </>
              )}
            </button>
          </div>

          {/* QUICK REWRITE TWEAK CHIPS */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[10px] font-mono text-zinc-400">1-click angle tweaks:</span>
            {quickTweaks.map((qt, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isGenerating}
                onClick={() => {
                  setCustomRepInstruction(qt.prompt);
                  handleGenerate(qt.prompt);
                }}
                className="px-2 py-0.5 rounded text-[11px] bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 transition-colors cursor-pointer border border-zinc-200/50"
              >
                {qt.label}
              </button>
            ))}
          </div>

          {/* RESULT CARD & APPROVE WORKFLOW */}
          {generatedResult && (
            <div className="mt-2.5 p-3.5 rounded-lg bg-zinc-50/80 border border-zinc-200 space-y-2.5 animate-in fade-in">
              {/* METADATA CHIPS */}
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pb-2 border-b border-zinc-200/60">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-zinc-800">
                    {generatedResult.frameworkUsed}
                  </span>
                  <span>•</span>
                  <span>{generatedResult.wordCount} words</span>
                  <span>•</span>
                  <span>~{generatedResult.readingTimeSec}s {channel === 'Phone' ? 'spoken' : 'read'}</span>
                </div>
                <span className="text-zinc-400">
                  via {generatedResult.modelUsed}
                </span>
              </div>

              {/* EMAIL SUBJECT (if email) */}
              {channel === 'Email' && generatedResult.subject && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-[10px] font-semibold text-zinc-500 uppercase">Subject:</span>
                  <span className="font-medium text-zinc-900 bg-white px-2 py-0.5 rounded border border-zinc-200 font-mono text-xs">
                    {generatedResult.subject}
                  </span>
                </div>
              )}

              {/* SCRIPT / MESSAGE BODY */}
              <div className="bg-white p-3 rounded-lg border border-zinc-200 text-xs text-zinc-800 font-mono whitespace-pre-wrap leading-relaxed">
                {generatedResult.body}
              </div>

              {/* PROSPECT INSIGHT ANGLE */}
              {generatedResult.prospectInsight && (
                <div className="text-[11px] text-zinc-600 bg-zinc-100/60 p-2 rounded border border-zinc-200/50 flex items-start gap-1.5">
                  <span className="text-xs">💡</span>
                  <span>
                    <strong>Why this converts from .csv:</strong> {generatedResult.prospectInsight}
                  </span>
                </div>
              )}

              {/* ALTERNATIVE HOOKS */}
              {generatedResult.alternativeHooks.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase">
                    Swap Opening Hook:
                  </span>
                  <div className="space-y-1">
                    {generatedResult.alternativeHooks.map((hook, hIdx) => (
                      <button
                        key={hIdx}
                        type="button"
                        onClick={() => handleSwapHook(hook)}
                        className="w-full text-left p-1.5 rounded bg-white hover:bg-zinc-100 border border-zinc-200 text-[11px] text-zinc-700 font-mono flex items-center justify-between group cursor-pointer transition-colors"
                      >
                        <span className="truncate pr-2">"{hook}"</span>
                        <span className="text-[10px] font-sans font-medium text-zinc-400 group-hover:text-zinc-900 shrink-0">
                          Use Hook
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* APPROVE & REWRITE WORKFLOW BUTTONS */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-zinc-200/60">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleApprove}
                    className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Apply to {channel === 'Phone' ? 'Teleprompter' : channel === 'Email' ? 'Email Composer' : 'LinkedIn'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGenerate()}
                    disabled={isGenerating}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                    <span>Rewrite Another</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-2.5 py-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  {onResetOriginal && (
                    <button
                      type="button"
                      onClick={onResetOriginal}
                      className="px-2.5 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Revert Default</span>
                    </button>
                  )}
                </div>
              </div>

              {appliedToast && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs font-medium flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Approved! Successfully applied to {channel === 'Phone' ? 'active teleprompter' : 'message composer'}.</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
