'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Share2, 
  FileSpreadsheet, 
  TrendingUp, 
  MessageSquare, 
  MessageSquareQuote, 
  Zap, 
  RotateCw, 
  CheckCircle2, 
  Clock, 
  Sliders, 
  AlertCircle, 
  Upload,
  ArrowRight,
  ChevronRight,
  Flame,
  CheckCircle,
  Pencil,
  Lightbulb,
  FileText
} from 'lucide-react';
import LinkedinIcon from '@/components/icons/LinkedinIcon';
import LinkedInVisualCard from './LinkedInVisualCard';
import { 
  LINKEDIN_FRAMEWORKS, 
  CONTINUITY_SERIES_PRESETS,
  LINKEDIN_IDEA_PRESETS,
  summarizeCsvLeads, 
  getDeterministicLinkedInSeries, 
  getDeterministicViralComments,
  getDeterministicThreadFollowUps,
  sanitizeTextForLinkedIn,
  CsvIntelligenceSummary,
  LinkedInSeries,
  LinkedInPost,
  ViralCommentDraft,
  ThreadFollowUpDraft
} from '@/lib/linkedinStudio';
import { DEMO_CADENCE_LEADS, CadenceLeadRecord } from '@/lib/cadenceMaster';
import UploadLeadsCsvModal from '@/components/cockpit/UploadLeadsCsvModal';

export default function LinkedInCreatorStudio() {
  const [activeTab, setActiveTab] = useState<'series' | 'viral' | 'dossier'>('series');

  // Leads & CSV Intelligence State
  const [leads, setLeads] = useState<CadenceLeadRecord[]>(DEMO_CADENCE_LEADS);
  const [csvSummary, setCsvSummary] = useState<CsvIntelligenceSummary>(() => summarizeCsvLeads(DEMO_CADENCE_LEADS));
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  // Series Generation State
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string>('contrarian-truth');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('broker-margin-continuity');
  const [customTopic, setCustomTopic] = useState<string>(
    'Brokers take up to a 60% cut on cheap pay-per-performance campaigns while the BPO carries 100% of the OPEX burden. They take over operations without risking any capital. It is time to take internal acquisition back to all BPOs.'
  );
  const [isGeneratingSeries, setIsGeneratingSeries] = useState(false);
  const [seriesData, setSeriesData] = useState<LinkedInSeries>(() => 
    getDeterministicLinkedInSeries(summarizeCsvLeads(DEMO_CADENCE_LEADS), 'contrarian-truth', 'broker-margin-continuity')
  );
  // Post Draft Editing State: Tracks which post cards are in inline edit mode
  const [editingPostIds, setEditingPostIds] = useState<Record<string, boolean>>({});

  const currentPreset = CONTINUITY_SERIES_PRESETS.find(p => p.id === selectedPresetId) || CONTINUITY_SERIES_PRESETS[0];

  // Viral Post Comment State
  const [viralPostInput, setViralPostInput] = useState<string>(
    `Unpopular opinion: Cold outreach is dying. Buyers are overwhelmed with automated AI sequences and template spam. If your BDRs are still sending 100 emails and dials a day, you are burning your brand reputation for a 0.2% reply rate. In 2025, inbound content and peer referrals are the only channels that convert enterprise deals.`
  );
  const [selectedAngle, setSelectedAngle] = useState<string>('All');
  const [isGeneratingComments, setIsGeneratingComments] = useState(false);
  const [viralComments, setViralComments] = useState<ViralCommentDraft[]>(() => 
    getDeterministicViralComments(viralPostInput)
  );

  // Copy Feedback State
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Load any previously saved CSV leads from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sdr_active_csv_leads');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLeads(parsed);
          setCsvSummary(summarizeCsvLeads(parsed));
        }
      }
    } catch (e) {
      console.warn('Failed to load cached CSV leads:', e);
    }
  }, []);

  const handleLeadsImported = (imported: CadenceLeadRecord[]) => {
    setLeads(imported);
    const newSummary = summarizeCsvLeads(imported);
    setCsvSummary(newSummary);
    try {
      localStorage.setItem('sdr_active_csv_leads', JSON.stringify(imported));
    } catch (e) {
      console.warn('Failed to cache leads:', e);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Switch Week / Continuity Arc instantly
  const handleSelectWeekPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    // Instant update with rich sequential posts so the user sees the continuation immediately
    const updated = getDeterministicLinkedInSeries(csvSummary, selectedFrameworkId, presetId);
    setSeriesData(updated);
  };

  // Toggle Edit Mode for a post card
  const toggleEditMode = (postId: string) => {
    setEditingPostIds(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Update post field directly (Hook, Body, CTA, Hashtags)
  const handleUpdatePostField = (postId: string, field: 'hook' | 'body' | 'cta' | 'hashtags', value: any) => {
    setSeriesData(prev => {
      const updatedPosts = prev.posts.map(p => {
        if (p.id === postId) {
          const updated = { ...p, [field]: value };
          const hookText = field === 'hook' ? value : p.hook;
          const bodyText = field === 'body' ? value : p.body;
          const ctaText = field === 'cta' ? value : p.cta;
          updated.wordCount = `${hookText} ${bodyText} ${ctaText}`.trim().split(/\s+/).filter(Boolean).length;
          return updated;
        }
        return p;
      });
      return { ...prev, posts: updatedPosts };
    });
  };

  // Sanitize post (remove em dashes and emojis)
  const handleCleanPost = (postId: string) => {
    setSeriesData(prev => {
      const updatedPosts = prev.posts.map(p => {
        if (p.id === postId) {
          const cleanHook = sanitizeTextForLinkedIn(p.hook);
          const cleanBody = sanitizeTextForLinkedIn(p.body);
          const cleanCta = sanitizeTextForLinkedIn(p.cta);
          return {
            ...p,
            hook: cleanHook,
            body: cleanBody,
            cta: cleanCta,
            wordCount: `${cleanHook} ${cleanBody} ${cleanCta}`.trim().split(/\s+/).filter(Boolean).length
          };
        }
        return p;
      });
      return { ...prev, posts: updatedPosts };
    });
  };

  // Generate 3-Post Series via Gemini
  const handleGenerateSeries = async (presetOverride?: string) => {
    const presetIdToUse = presetOverride || selectedPresetId;
    if (presetOverride) {
      setSelectedPresetId(presetOverride);
    }
    setIsGeneratingSeries(true);
    try {
      const res = await fetch('/api/ai/linkedin-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_series',
          leads,
          csvSummary,
          frameworkId: selectedFrameworkId,
          presetId: presetIdToUse,
          customTopicInstruction: customTopic
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.series) {
          setSeriesData(data.series);
          return;
        }
      }
      const fallback = getDeterministicLinkedInSeries(csvSummary, selectedFrameworkId, presetIdToUse);
      setSeriesData(fallback);
    } catch (err) {
      console.error('Error generating series:', err);
      const fallback = getDeterministicLinkedInSeries(csvSummary, selectedFrameworkId, presetIdToUse);
      setSeriesData(fallback);
    } finally {
      setIsGeneratingSeries(false);
    }
  };

  // Generate Viral Post Comments via Gemini
  const handleGenerateViralComments = async () => {
    if (!viralPostInput.trim()) return;
    setIsGeneratingComments(true);
    try {
      const res = await fetch('/api/ai/linkedin-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_viral_comment',
          viralPostText: viralPostInput,
          commentAngle: selectedAngle
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.commentDrafts)) {
          setViralComments(data.commentDrafts);
        }
      } else {
        setViralComments(getDeterministicViralComments(viralPostInput));
      }
    } catch (err) {
      console.error('Error generating viral comments:', err);
      setViralComments(getDeterministicViralComments(viralPostInput));
    } finally {
      setIsGeneratingComments(false);
    }
  };

  // Thread Conversation & Relationship Builder State
  const [authorReplyInput, setAuthorReplyInput] = useState<string>(
    'Fair point, but in our experience enterprise buyers ignore cold outreach completely unless they already recognize the brand.'
  );
  const [previousCommentInput, setPreviousCommentInput] = useState<string>(
    'Interesting take, but in BPO operations we usually see the opposite. Activity numbers mean nothing if the list has already been fatigued by three other agencies. List exclusivity beats call volume every time.'
  );
  const [isGeneratingThreadReplies, setIsGeneratingThreadReplies] = useState(false);
  const [threadReplies, setThreadReplies] = useState<ThreadFollowUpDraft[]>(() => 
    getDeterministicThreadFollowUps('Fair point, but in our experience enterprise buyers ignore cold outreach completely unless they already recognize the brand.')
  );

  const handleGenerateThreadReplies = async () => {
    if (!authorReplyInput.trim()) return;
    setIsGeneratingThreadReplies(true);
    try {
      const res = await fetch('/api/ai/linkedin-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_thread_reply',
          viralPostText: viralPostInput,
          myPreviousComment: previousCommentInput,
          authorReplyText: authorReplyInput
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.threadFollowUps)) {
          setThreadReplies(data.threadFollowUps);
        }
      } else {
        setThreadReplies(getDeterministicThreadFollowUps(authorReplyInput));
      }
    } catch (err) {
      console.error('Error generating thread replies:', err);
      setThreadReplies(getDeterministicThreadFollowUps(authorReplyInput));
    } finally {
      setIsGeneratingThreadReplies(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
              <LinkedinIcon className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              LinkedIn Thought Leadership &amp; Viral Engagement Studio
            </h1>
          </div>
          <p className="text-xs text-zinc-500">
            Synthesize a 3-part sequential series grounded in your prospect CSV, paired with Gemini visual prompts and algorithmic hashtags, or craft viral comment drafts with zero em dashes and zero emojis.
          </p>
        </div>

        {/* Studio Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-xl border border-zinc-200 shrink-0 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('series')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'series'
                ? 'bg-white text-zinc-900 shadow-2xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>3-Post Series Arc</span>
          </button>

          <button
            onClick={() => setActiveTab('viral')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'viral'
                ? 'bg-white text-zinc-900 shadow-2xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <MessageSquareQuote className="h-3.5 w-3.5" />
            <span>Viral Post Comments</span>
          </button>

          <button
            onClick={() => setActiveTab('dossier')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'dossier'
                ? 'bg-white text-zinc-900 shadow-2xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>CSV Intel ({leads.length})</span>
          </button>
        </div>
      </div>

      {/* ACTIVE CLIENT DOSSIER INTELLIGENCE STRIP */}
      <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-zinc-200/70 text-zinc-700 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold text-zinc-900 flex items-center gap-2">
              <span>Active CSV Grounding: {csvSummary.totalLeads} Target Accounts</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                {csvSummary.dominantHeadcount}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 line-clamp-1">
              Top Bottlenecks: <strong className="text-zinc-700">{csvSummary.topPainPoints.join(', ')}</strong> • Tech: {csvSummary.topTechStacks[0]}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCsvModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-100 hover:text-zinc-950 transition-colors self-start md:self-auto shrink-0 shadow-2xs"
        >
          <Upload className="h-3 w-3" />
          <span>Upload / Switch CSV</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: 3-POST SEQUENTIAL LINKEDIN SERIES ARC STUDIO                       */}
      {/* ========================================================================= */}
      {activeTab === 'series' && (
        <div className="space-y-6">
          {/* Controls Panel */}
          <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Framework Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                  1. Writing Framework
                </label>
                <select
                  value={selectedFrameworkId}
                  onChange={(e) => setSelectedFrameworkId(e.target.value)}
                  className="w-full text-xs font-medium bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-2 text-zinc-800 focus:outline-hidden focus:ring-1 focus:ring-zinc-900"
                >
                  {LINKEDIN_FRAMEWORKS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} [{f.tag}]
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-zinc-400 mt-1 line-clamp-1">
                  {LINKEDIN_FRAMEWORKS.find(f => f.id === selectedFrameworkId)?.description}
                </p>
              </div>

              {/* Continuity Preset Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                  2. Continuity Arc (Tied to Last Week)
                </label>
                <select
                  value={selectedPresetId}
                  onChange={(e) => setSelectedPresetId(e.target.value)}
                  className="w-full text-xs font-medium bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-2 text-zinc-800 focus:outline-hidden focus:ring-1 focus:ring-zinc-900"
                >
                  {CONTINUITY_SERIES_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-zinc-400 mt-1 line-clamp-1">
                  Connects to previous posts so followers anticipate each drop.
                </p>
              </div>
            </div>

            {/* IDEA BOX: Raw Angle, Plan & Thought Input */}
            <div className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-200/70 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
                  <span>3. Idea Box — What do you want to post about?</span>
                </label>
                <span className="text-[10px] font-mono text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
                  AI Analyzes Your Idea &amp; Writes The Series
                </span>
              </div>

              <textarea
                rows={3}
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Type your raw thought, experience, or observation here. For example: 'Brokers take up to a 60% cut on cheap pay-per-performance campaigns while BPO carries 100% OPEX burden. They take over operations without risking capital. It is time to take internal acquisition back to all BPOs'..."
                className="w-full text-xs bg-white border border-amber-200 rounded-lg p-2.5 text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-amber-500 shadow-2xs leading-relaxed"
              />

              {/* AI Logic & Framework Intelligence Confirmation */}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-100/70 border border-amber-300/80 text-[11px] text-amber-950 leading-tight">
                <Sparkles className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                <span>
                  <strong>AI Idea Engine Active:</strong> Anchors 3 episodes directly to your Idea Box • Applies <em>{LINKEDIN_FRAMEWORKS.find(f => f.id === selectedFrameworkId)?.name}</em> • Enforces 17-Year BDM POV: 60% broker cut vs 100% BPO OPEX burden &amp; taking internal acquisition back.
                </span>
              </div>

              {/* Quick Idea Starters */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono text-zinc-500 block">
                  Click a Quick Idea Starter to populate:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {LINKEDIN_IDEA_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setCustomTopic(preset.idea);
                        if (preset.frameworkId) {
                          setSelectedFrameworkId(preset.frameworkId);
                        }
                      }}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-white border border-amber-200/90 hover:border-amber-400 text-zinc-800 hover:text-zinc-950 font-medium transition-colors shadow-2xs text-left"
                    >
                      💡 {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Synthesize Button */}
            <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Grounds copy in CSV bottlenecks • Generates visual pairing &amp; comments</span>
              </div>

              <button
                onClick={() => handleGenerateSeries()}
                disabled={isGeneratingSeries}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-2xs"
              >
                {isGeneratingSeries ? (
                  <>
                    <RotateCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Synthesizing 3-Post Series with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>Synthesize 3-Post Series</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* MULTI-WEEK CONTINUITY CALENDAR NAVIGATOR (WEEKS 1 - 4)                    */}
          {/* ========================================================================= */}
          <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-zinc-900 text-white text-xs font-bold">📅</span>
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 flex items-center gap-2">
                    <span>Multi-Week Series Continuity Calendar</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-200">
                      Week {currentPreset.weekNumber} of 4 • {currentPreset.episodesRange} Active
                    </span>
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    4-week sequential arcs tied to each other so your audience anticipates every post
                  </p>
                </div>
              </div>

              {/* Advance to Next Week Button */}
              {currentPreset.nextPresetId && (
                <button
                  type="button"
                  onClick={() => handleSelectWeekPreset(currentPreset.nextPresetId!)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-black shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-black" />
                  <span>Advance to Week {((currentPreset.weekNumber) % 4) + 1} ➔</span>
                </button>
              )}
            </div>

            {/* 4 Interactive Week Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {CONTINUITY_SERIES_PRESETS.map((p) => {
                const isSelected = selectedPresetId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectWeekPreset(p.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-md ring-2 ring-amber-400/80'
                        : 'bg-zinc-50 hover:bg-white border-zinc-200 text-zinc-800 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-amber-400 text-black' : 'bg-white text-zinc-700 border border-zinc-200'
                      }`}>
                        Week {p.weekNumber}
                      </span>
                      <span className={`text-[10px] font-mono ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {p.episodesRange}
                      </span>
                    </div>

                    <div className="text-xs font-bold leading-tight line-clamp-1">
                      {p.title.replace(/^Week \d+:\s*/, '')}
                    </div>

                    <div className={`text-[10px] mt-1 line-clamp-1 ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                      {p.theme}
                    </div>

                    {isSelected && (
                      <div className="mt-2 pt-1 border-t border-zinc-800 text-[10px] font-mono text-amber-300 flex items-center gap-1">
                        <Check className="w-3 h-3 text-amber-400" />
                        <span>Active Drop Loaded</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Series Metadata Header */}
          <div className="p-4 rounded-xl bg-zinc-900 text-white shadow-xs space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-rose-400 bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-700">
                  Episodic LinkedIn Series • Week {currentPreset.weekNumber} of 4
                </span>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700">
                  {currentPreset.episodesRange}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-400 hidden sm:inline">
                  Cadence: Tuesday • Thursday • Friday
                </span>
                {currentPreset.nextPresetId && (
                  <button
                    type="button"
                    onClick={() => handleSelectWeekPreset(currentPreset.nextPresetId!)}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-black flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Next Week Arc ➔</span>
                  </button>
                )}
              </div>
            </div>

            <h2 className="text-base font-bold tracking-tight text-white">
              {seriesData.seriesTitle}
            </h2>
            <div className="text-xs text-zinc-300 leading-relaxed bg-zinc-800/60 p-2.5 rounded-lg border border-zinc-700/60">
              <span className="font-semibold text-zinc-200">Continuity Bridge from Previous Drop: </span>
              "{seriesData.seriesHookRecap}"
            </div>
          </div>

          {/* 3-Post Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {seriesData.posts.map((post) => {
              const fullPostText = `${post.hook}\n\n${post.body}\n\n${post.cta}\n\n${post.hashtags.join(' ')}`;
              return (
                <div
                  key={post.id}
                  className="rounded-2xl border border-zinc-200 bg-white shadow-2xs flex flex-col justify-between overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-zinc-100 bg-zinc-50/60 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                        {post.dayLabel}
                      </span>
                      <h3 className="text-xs font-bold text-zinc-900 truncate">
                        {post.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => copyToClipboard(fullPostText, `header-post-${post.id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-2xs"
                        title="Copy entire post formatted for LinkedIn"
                      >
                        {copiedKey === `header-post-${post.id}` ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy Full Post</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Post Content Body */}
                  <div className="p-4 space-y-3 text-left">
                    {/* Unified Clean LinkedIn Post Block (Ready to Copy & Edit) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                          <CheckCircle className="h-3 w-3 text-emerald-600" />
                          <span>{editingPostIds[post.id] ? 'Editing Post Draft (Free Hand)' : 'Ready-to-Paste LinkedIn Post (Whole Block)'}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleEditMode(post.id)}
                            className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                              editingPostIds[post.id]
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                            }`}
                          >
                            <Pencil className="h-3 w-3" />
                            <span>{editingPostIds[post.id] ? 'Done Editing' : 'Edit Draft'}</span>
                          </button>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {post.wordCount} words • {post.estimatedReadSeconds}s read
                          </span>
                        </div>
                      </div>

                      {editingPostIds[post.id] ? (
                        /* EDITING MODE: Free-hand editable textareas */
                        <div className="p-3.5 rounded-xl bg-amber-50/50 border-2 border-amber-300 space-y-3 text-xs">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[10px] font-bold text-amber-950 uppercase tracking-wider">
                                Hook (First 2 Lines — Grabs Attention)
                              </label>
                              <span className="text-[10px] font-mono text-zinc-400">Lines 1 &amp; 2</span>
                            </div>
                            <textarea
                              rows={2}
                              value={post.hook}
                              onChange={(e) => handleUpdatePostField(post.id, 'hook', e.target.value)}
                              className="w-full bg-white border border-amber-300 rounded-lg p-2 font-bold text-zinc-950 focus:outline-hidden focus:ring-1 focus:ring-amber-500 leading-snug"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[10px] font-bold text-amber-950 uppercase tracking-wider">
                                Body (Target: Under 90 Words • 0 Em Dashes • 0 Emojis)
                              </label>
                              <span className="text-[10px] font-mono text-zinc-500">
                                {post.body.trim().split(/\s+/).filter(Boolean).length} words
                              </span>
                            </div>
                            <textarea
                              rows={6}
                              value={post.body}
                              onChange={(e) => handleUpdatePostField(post.id, 'body', e.target.value)}
                              className="w-full bg-white border border-amber-300 rounded-lg p-2 text-zinc-800 focus:outline-hidden focus:ring-1 focus:ring-amber-500 leading-relaxed font-sans"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[10px] font-bold text-amber-950 uppercase tracking-wider">
                                Call to Action (Philosophical Open-Ended Question)
                              </label>
                            </div>
                            <textarea
                              rows={2}
                              value={post.cta}
                              onChange={(e) => handleUpdatePostField(post.id, 'cta', e.target.value)}
                              className="w-full bg-white border border-amber-300 rounded-lg p-2 font-semibold text-emerald-950 focus:outline-hidden focus:ring-1 focus:ring-amber-500 leading-snug"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-amber-950 uppercase tracking-wider block mb-1">
                              Hashtags (Space separated)
                            </label>
                            <input
                              type="text"
                              value={post.hashtags.join(' ')}
                              onChange={(e) => {
                                const tags = e.target.value.split(/\s+/).filter(Boolean).map(t => t.startsWith('#') ? t : `#${t}`);
                                handleUpdatePostField(post.id, 'hashtags', tags);
                              }}
                              className="w-full bg-white border border-amber-300 rounded-lg p-2 font-mono text-[11px] text-zinc-700 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                            />
                          </div>

                          <div className="pt-2 border-t border-amber-200 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => handleCleanPost(post.id)}
                              className="px-2.5 py-1 rounded bg-zinc-900 text-white text-[11px] font-bold hover:bg-zinc-800 transition-colors shadow-2xs"
                              title="Strip any accidental em dashes or emojis"
                            >
                              Clean Rules (0 Em Dashes / 0 Emojis)
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleEditMode(post.id)}
                              className="px-3 py-1 rounded bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 transition-colors shadow-2xs"
                            >
                              ✓ Save &amp; Finish
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* PREVIEW MODE: Formatted Block with Click-to-Copy */
                        <div className="relative group">
                          <div 
                            onClick={() => copyToClipboard(fullPostText, `block-post-${post.id}`)}
                            className="p-3.5 rounded-xl bg-zinc-50 hover:bg-zinc-100/60 border-2 border-zinc-200 hover:border-zinc-300 text-zinc-900 font-sans text-xs leading-relaxed whitespace-pre-line select-text cursor-pointer transition-all space-y-2 shadow-2xs"
                          >
                            <div className="font-bold text-zinc-950 pb-1 border-b border-zinc-200/70">
                              {post.hook}
                            </div>
                            <div className="text-zinc-800">
                              {post.body}
                            </div>
                            <div className="text-emerald-900 font-semibold pt-1 border-t border-zinc-200/70">
                              {post.cta}
                            </div>
                            <div className="text-[11px] font-mono text-zinc-500 pt-1">
                              {post.hashtags.join(' ')}
                            </div>
                          </div>

                          {/* Floating Action Buttons */}
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              onClick={() => toggleEditMode(post.id)}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 transition-colors shadow-2xs cursor-pointer"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              <span>Edit Draft</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(fullPostText, `block-post-${post.id}`);
                              }}
                              className="flex-2 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-2xs cursor-pointer"
                            >
                              {copiedKey === `block-post-${post.id}` ? (
                                <>
                                  <Check className="h-4 w-4 text-emerald-400" />
                                  <span className="text-emerald-400 font-bold">Entire Post Copied (Ready for LinkedIn)!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4" />
                                  <span>Copy Whole Block for LinkedIn</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Visual Graphic Pairing */}
                    <div className="pt-2">
                      <LinkedInVisualCard
                        visualConfig={post.visualCard}
                        imagePrompt={post.imagePrompt}
                        realisticPhotoPrompt={post.realisticPhotoPrompt}
                        realisticImageUrl={post.realisticImageUrl}
                        alternativeImageUrl={post.alternativeImageUrl}
                        alternativeImageLabel={post.alternativeImageLabel}
                        alternativeImagePrompt={post.alternativeImagePrompt}
                        episodeNumber={post.episodeNumber}
                        postTitle={post.title}
                        postHook={post.hook}
                        postBody={post.body}
                      />
                    </div>

                    {/* Injected Comments Tray (Zero em dashes, Zero emojis) */}
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-zinc-800 flex items-center gap-1 uppercase tracking-wider">
                          <MessageSquare className="h-3 w-3 text-zinc-500" />
                          Injected Discussion Comments (2)
                        </span>
                        <span className="text-[9px] font-mono text-zinc-400">
                          0 Emojis • 0 Em Dashes
                        </span>
                      </div>

                      {post.injectedComments.map((comment, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-2 rounded-lg bg-white border border-zinc-200 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono font-semibold text-zinc-500">
                              {cIdx === 0 ? 'Comment 1 (First Comment)' : 'Comment 2 (Follow-up)'}
                            </span>
                            <button
                              onClick={() => copyToClipboard(comment, `post-${post.id}-cmt-${cIdx}`)}
                              className="text-[10px] font-medium text-zinc-600 hover:text-zinc-950 flex items-center gap-1"
                            >
                              {copiedKey === `post-${post.id}-cmt-${cIdx}` ? (
                                <>
                                  <Check className="h-2.5 w-2.5 text-emerald-600" />
                                  <span className="text-emerald-600 font-semibold">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-2.5 w-2.5" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-[11px] text-zinc-700 leading-snug">
                            {comment}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Cliffhanger Bridge Box on Final Post of the Week */}
                    {post.episodeNumber % 3 === 0 && (
                      <div className="mx-0 mt-3 p-3 rounded-xl bg-amber-50/90 border border-amber-200/90 text-left space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-amber-900 uppercase font-mono flex items-center gap-1">
                            <span>⚡</span>
                            <span>Series Cliffhanger & Bridge</span>
                          </span>
                          <span className="text-[9px] font-mono font-bold text-amber-800 bg-amber-100/80 px-1.5 py-0.2 rounded">
                            Teases Next Week
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-900 leading-snug">
                          This Friday post sets up next week's discussion. Click below to view the continuation posts:
                        </p>
                        <button
                          type="button"
                          onClick={() => handleSelectWeekPreset(currentPreset.nextPresetId || 'broker-margin-continuity')}
                          className="w-full py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-black text-amber-300 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Zap className="w-3 h-3 text-amber-400" />
                          <span>Advance to Week {((currentPreset.weekNumber) % 4) + 1} ({currentPreset.nextWeekTitle?.split('(')[1]?.replace(')', '') || 'Next Episodes'}) ➔</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: Copy Full Post */}
                  <div className="p-3 border-t border-zinc-100 bg-zinc-50/50">
                    <button
                      onClick={() => copyToClipboard(fullPostText, `full-post-${post.id}`)}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-2xs"
                    >
                      {copiedKey === `full-post-${post.id}` ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Post Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Complete Post to Clipboard</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ========================================================================= */}
          {/* MULTI-WEEK CONTINUATION CTA BANNER                                        */}
          {/* ========================================================================= */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white border border-amber-500/30 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-amber-500 text-black font-black text-xs">🚀</span>
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  How To Continue The Series For Upcoming Weeks
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Week {currentPreset.weekNumber} of 4 • {currentPreset.episodesRange} Active
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">
                Looking for the continuation of the series?
              </h3>
              <p className="text-xs text-zinc-400 max-w-xl">
                {currentPreset.nextWeekTitle 
                  ? `Advance to ${currentPreset.nextWeekTitle} to maintain audience momentum and build your weekly LinkedIn pipeline without starting from scratch.`
                  : 'Cycle through the 4-week thematic arcs to keep your profile consistently publishing high-conversion thought leadership.'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleSelectWeekPreset(currentPreset.nextPresetId || 'broker-margin-continuity')}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Zap className="w-4 h-4 text-black" />
                <span>
                  {currentPreset.nextPresetId 
                    ? `Advance to Week ${((currentPreset.weekNumber) % 4) + 1} (${currentPreset.nextWeekTitle?.split('(')[1]?.replace(')', '') || 'Next Episodes'}) ➔` 
                    : 'Cycle Back to Week 1 ➔'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: VIRAL POST COMMENT COPILOT (MANUAL ENGAGEMENT ENGINE)              */}
      {/* ========================================================================= */}
      {activeTab === 'viral' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <MessageSquareQuote className="h-4 w-4 text-zinc-700" />
                <span>Viral Post Comment Copilot</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
                  Manual Engagement Engine
                </span>
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Paste any viral post from an influencer, buyer, or competitor. Gemini drafts short, thoughtful comments you can post manually on LinkedIn. Strictly zero em dashes and zero emojis.
              </p>
            </div>

            {/* Post Input Textarea */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Paste Viral LinkedIn Post Text:
              </label>
              <textarea
                rows={5}
                value={viralPostInput}
                onChange={(e) => setViralPostInput(e.target.value)}
                placeholder="Paste the viral post content here..."
                className="w-full text-xs font-mono bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-zinc-900 leading-relaxed placeholder:text-zinc-400"
              />
            </div>

            {/* Angle Selection & Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-zinc-100">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-zinc-500 mr-1">Angle:</span>
                {['All', 'Counter-Perspective', 'Consultative Question', 'Frontline Operator', 'Punchy 20-Word'].map((angle) => (
                  <button
                    key={angle}
                    onClick={() => setSelectedAngle(angle)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      selectedAngle === angle
                        ? 'bg-zinc-900 text-white font-semibold'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
                    }`}
                  >
                    {angle}
                  </button>
                ))}
              </div>

              <button
                onClick={handleGenerateViralComments}
                disabled={isGeneratingComments || !viralPostInput.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-2xs shrink-0"
              >
                {isGeneratingComments ? (
                  <>
                    <RotateCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Analyzing Viral Post...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>Draft Engagement Comments</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Comment Drafts Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                  Ready-to-Post Comment Drafts ({viralComments.length})
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                  Strict Rules: 0 Emojis • 0 Em Dashes • &lt;42 Words
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {viralComments.map((draft) => (
                <div
                  key={draft.id}
                  className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs flex flex-col justify-between space-y-3 text-left hover:border-zinc-300 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                        {draft.angle}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {draft.wordCount} words
                      </span>
                    </div>

                    <p className="text-xs text-zinc-800 font-sans leading-relaxed bg-zinc-50/60 p-3 rounded-lg border border-zinc-200/60">
                      "{draft.comment}"
                    </p>

                    <p className="text-[10px] text-zinc-500 font-mono">
                      Intent: {draft.intent}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Cleaned: No emojis, no em dashes
                    </span>

                    <button
                      onClick={() => copyToClipboard(draft.comment, draft.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-2xs"
                    >
                      {copiedKey === draft.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy Comment</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* THREAD CONVERSATION & RELATIONSHIP BUILDER */}
          <div className="p-5 rounded-xl bg-zinc-900 text-white border border-zinc-800 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 border border-zinc-700">
                    STAGE 2: DIALOGUE ACCELERATOR
                  </span>
                  <h3 className="text-sm font-bold text-white">
                    Thread Conversation &amp; Relationship Builder
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  When the author or prospect responds to your POV comment, continue the thread to build rapport and transition into a warm peer relationship.
                </p>
              </div>

              <span className="text-[10px] font-mono text-zinc-400 self-start sm:self-auto bg-zinc-800/80 px-2.5 py-1 rounded-md border border-zinc-700">
                0 Emojis • 0 Em Dashes • &lt;35 Words
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  1. Your Initial Comment (POV):
                </label>
                <textarea
                  rows={3}
                  value={previousCommentInput}
                  onChange={(e) => setPreviousCommentInput(e.target.value)}
                  placeholder="Paste the comment you posted..."
                  className="w-full text-xs font-mono bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-200 placeholder:text-zinc-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  2. What did the Author or Prospect Reply?
                </label>
                <textarea
                  rows={3}
                  value={authorReplyInput}
                  onChange={(e) => setAuthorReplyInput(e.target.value)}
                  placeholder="Paste their reply here..."
                  className="w-full text-xs font-mono bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-200 placeholder:text-zinc-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-zinc-400">
                AI generates 3 stages: Deepen Dialogue, Nuanced Counter, and Relationship Bridge to Connection.
              </span>

              <button
                onClick={handleGenerateThreadReplies}
                disabled={isGeneratingThreadReplies || !authorReplyInput.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors shadow-2xs shrink-0"
              >
                {isGeneratingThreadReplies ? (
                  <>
                    <RotateCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Synthesizing Thread Replies...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-emerald-200" />
                    <span>Generate Thread Follow-ups</span>
                  </>
                )}
              </button>
            </div>

            {/* Generated Thread Reply Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              {threadReplies.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 flex flex-col justify-between space-y-2.5 text-left"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700">
                        {r.stage}
                      </span>
                      <span className="text-[9px] font-mono text-zinc-500">
                        {r.wordCount} words
                      </span>
                    </div>

                    <p className="text-xs text-zinc-200 font-sans leading-relaxed bg-zinc-900/90 p-2.5 rounded-lg border border-zinc-800">
                      "{r.reply}"
                    </p>

                    <p className="text-[10px] text-zinc-400 font-mono">
                      Goal: {r.strategicGoal}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                    <span className="text-[9px] font-mono text-emerald-400">
                      Verified clean
                    </span>

                    <button
                      onClick={() => copyToClipboard(r.reply, r.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
                    >
                      {copiedKey === r.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy Reply</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CSV PROSPECT INTELLIGENCE DOSSIER                                   */}
      {/* ========================================================================= */}
      {activeTab === 'dossier' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-2xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Accounts Analyzed
              </span>
              <div className="text-2xl font-extrabold text-zinc-900 mt-1">
                {csvSummary.totalLeads}
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                Imported CSV dataset
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-2xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Dominant Seat Segment
              </span>
              <div className="text-xl font-bold text-zinc-900 mt-1">
                {csvSummary.dominantHeadcount}
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                Mid-market BPO &amp; contact centers
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-2xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Primary Bottleneck
              </span>
              <div className="text-xs font-bold text-rose-600 mt-1 line-clamp-2">
                {csvSummary.topPainPoints[0]}
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                Recurring client complaint
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-2xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Incumbent Competitor
              </span>
              <div className="text-sm font-bold text-zinc-900 mt-1">
                {csvSummary.topCompetitors[0]}
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                Commodity outsourcer footprint
              </p>
            </div>
          </div>

          {/* Dossier Table */}
          <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Raw Prospect Intelligence Table ({leads.length} accounts)
              </h3>
              <button
                onClick={() => setIsCsvModalOpen(true)}
                className="flex items-center gap-1 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 px-2.5 py-1 rounded-md transition-colors"
              >
                <Upload className="h-3 w-3" />
                <span>Upload New CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-zinc-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-3 py-2">Contact &amp; Title</th>
                    <th className="px-3 py-2">Company</th>
                    <th className="px-3 py-2">Headcount</th>
                    <th className="px-3 py-2">Specific Bottleneck / Pain</th>
                    <th className="px-3 py-2">Tech Stack</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-700">
                  {leads.slice(0, 10).map((l, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/50">
                      <td className="px-3 py-2 font-medium text-zinc-900">
                        {l.name}
                        <div className="text-[10px] text-zinc-400 font-normal">{l.title}</div>
                      </td>
                      <td className="px-3 py-2 font-medium">{l.company}</td>
                      <td className="px-3 py-2 font-mono text-[11px]">{l.headcount}</td>
                      <td className="px-3 py-2 text-rose-700 font-medium">{l.painPoint}</td>
                      <td className="px-3 py-2 text-zinc-500 font-mono text-[11px]">{l.techStack}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {leads.length > 10 && (
              <p className="text-[10px] text-zinc-400 text-center font-mono pt-1">
                Showing 10 of {leads.length} accounts. All {leads.length} are factored into the Gemini summary.
              </p>
            )}
          </div>
        </div>
      )}

      {/* CSV Upload Modal */}
      <UploadLeadsCsvModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onLeadsImported={handleLeadsImported}
      />
    </div>
  );
}
