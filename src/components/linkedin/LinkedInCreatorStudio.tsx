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
  CheckCircle
} from 'lucide-react';
import LinkedinIcon from '@/components/icons/LinkedinIcon';
import LinkedInVisualCard from './LinkedInVisualCard';
import { 
  LINKEDIN_FRAMEWORKS, 
  CONTINUITY_SERIES_PRESETS,
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
  const [customTopic, setCustomTopic] = useState<string>('');
  const [isGeneratingSeries, setIsGeneratingSeries] = useState(false);
  const [seriesData, setSeriesData] = useState<LinkedInSeries>(() => 
    getDeterministicLinkedInSeries(summarizeCsvLeads(DEMO_CADENCE_LEADS), 'contrarian-truth', 'broker-margin-continuity')
  );

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

  // Generate 3-Post Series via Gemini
  const handleGenerateSeries = async () => {
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
          presetId: selectedPresetId,
          customTopicInstruction: customTopic
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.series) {
          setSeriesData(data.series);
        }
      } else {
        console.warn('Series generation fallback used');
        const fallback = getDeterministicLinkedInSeries(csvSummary, selectedFrameworkId, selectedPresetId);
        setSeriesData(fallback);
      }
    } catch (err) {
      console.error('Error generating series:', err);
      const fallback = getDeterministicLinkedInSeries(csvSummary, selectedFrameworkId, selectedPresetId);
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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

              {/* Custom Polish Instruction */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                  3. Specific Angle / Tweak (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. emphasize direct contracts over shared leads"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-2 text-zinc-800 placeholder:text-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-zinc-900"
                />
                <p className="text-[10px] text-zinc-400 mt-1">
                  Strict &lt;90 words writing technique enforced automatically.
                </p>
              </div>
            </div>

            {/* Synthesize Button */}
            <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Grounds copy in CSV bottlenecks • Generates visual pairing &amp; comments</span>
              </div>

              <button
                onClick={handleGenerateSeries}
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

          {/* Series Metadata Header */}
          <div className="p-4 rounded-xl bg-zinc-900 text-white shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-rose-400 bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-700">
                Episodic LinkedIn Series
              </span>
              <span className="text-xs font-mono text-zinc-400">
                Cadence: Tuesday • Thursday • Friday
              </span>
            </div>
            <h2 className="text-base font-bold tracking-tight text-white">
              {seriesData.seriesTitle}
            </h2>
            <div className="text-xs text-zinc-300 leading-relaxed bg-zinc-800/60 p-2.5 rounded-lg border border-zinc-700/60">
              <span className="font-semibold text-zinc-200">Last Week Continuity Bridge: </span>
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
                  <div className="p-4 border-b border-zinc-100 bg-zinc-50/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                        {post.dayLabel}
                      </span>
                      <h3 className="text-xs font-bold text-zinc-900 line-clamp-1">
                        {post.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-200/80 text-zinc-700 font-semibold">
                        {post.wordCount} words
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500">
                        {post.estimatedReadSeconds}s read
                      </span>
                    </div>
                  </div>

                  {/* Post Content Body */}
                  <div className="p-4 space-y-3 text-left">
                    {/* Scroll-stopping Hook Box */}
                    <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/80 space-y-1">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-rose-600 block">
                        Scroll-Stopping Hook (Pre-Fold)
                      </span>
                      <p className="text-xs font-semibold text-zinc-900 whitespace-pre-line leading-snug">
                        {post.hook}
                      </p>
                    </div>

                    {/* Content Body */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">
                        Body Content (&lt;90 Words Technique)
                      </span>
                      <p className="text-xs text-zinc-700 whitespace-pre-line leading-relaxed font-sans">
                        {post.body}
                      </p>
                    </div>

                    {/* High Engagement CTA */}
                    <div className="p-2 rounded-lg bg-emerald-50/50 border border-emerald-200/60 space-y-0.5">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-700 block">
                        High-Engagement CTA (Non-Salesy)
                      </span>
                      <p className="text-xs font-medium text-emerald-950 leading-snug">
                        {post.cta}
                      </p>
                    </div>

                    {/* Hashtags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {post.hashtags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Visual Graphic Pairing */}
                    <div className="pt-2">
                      <LinkedInVisualCard
                        visualConfig={post.visualCard}
                        imagePrompt={post.imagePrompt}
                        episodeNumber={post.episodeNumber}
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
