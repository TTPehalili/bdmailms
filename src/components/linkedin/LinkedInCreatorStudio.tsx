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
  FileText,
  Calendar,
  Layers,
  Eye,
  Globe,
  Tag,
  ShieldCheck,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  Repeat2,
  Send,
  MoreHorizontal,
  Bookmark,
  Heart
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
  const [csvSearchTerm, setCsvSearchTerm] = useState('');

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

  // Active Episode Focus State (0 = Ep 1 Tuesday, 1 = Ep 2 Thursday, 2 = Ep 3 Friday)
  const [activeEpisodeIdx, setActiveEpisodeIdx] = useState<number>(0);

  // Post Draft Inline Editing State
  const [editingPostIds, setEditingPostIds] = useState<Record<string, boolean>>({});

  // Show Comments & Visual Toggles inside the LinkedIn Feed Post
  const [showInjectedComments, setShowInjectedComments] = useState<boolean>(true);
  const [showVisualStudio, setShowVisualStudio] = useState<boolean>(false);

  const currentPreset = CONTINUITY_SERIES_PRESETS.find(p => p.id === selectedPresetId) || CONTINUITY_SERIES_PRESETS[0];
  const activeFramework = LINKEDIN_FRAMEWORKS.find(f => f.id === selectedFrameworkId) || LINKEDIN_FRAMEWORKS[0];

  // Viral Post Comment State
  const [viralPostInput, setViralPostInput] = useState<string>(
    `Unpopular opinion: Cold outreach is dying. Buyers are overwhelmed with automated AI sequences and template spam. If your BDRs are still sending 100 emails and dials a day, you are burning your brand reputation for a 0.2% reply rate. In 2025, inbound content and peer referrals are the only channels that convert enterprise deals.`
  );
  const [selectedAngle, setSelectedAngle] = useState<string>('All');
  const [isGeneratingComments, setIsGeneratingComments] = useState(false);
  const [viralComments, setViralComments] = useState<ViralCommentDraft[]>(() => 
    getDeterministicViralComments(viralPostInput)
  );

  // Thread Conversation Accelerator State
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

  // Copy Feedback State
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Load cached CSV leads from localStorage
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

  // Keyboard shortcut listener: Ctrl+Enter (or Cmd+Enter) to generate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (activeTab === 'series') {
          handleGenerateSeries();
        } else if (activeTab === 'viral') {
          handleGenerateViralComments();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, customTopic, selectedFrameworkId, selectedPresetId, viralPostInput, selectedAngle]);

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

  // Switch Week / Continuity Arc
  const handleSelectWeekPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const updated = getDeterministicLinkedInSeries(csvSummary, selectedFrameworkId, presetId);
    setSeriesData(updated);
    setActiveEpisodeIdx(0);
  };

  // Toggle Edit Mode for a post card
  const toggleEditMode = (postId: string) => {
    setEditingPostIds(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Update post field directly
  const handleUpdatePostField = (postId: string, field: 'hook' | 'body' | 'cta' | 'hashtags' | 'injectedComments', value: any) => {
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
          const cleanComments = (p.injectedComments || []).map(c => sanitizeTextForLinkedIn(c));
          return {
            ...p,
            hook: cleanHook,
            body: cleanBody,
            cta: cleanCta,
            injectedComments: cleanComments,
            wordCount: `${cleanHook} ${cleanBody} ${cleanCta}`.trim().split(/\s+/).filter(Boolean).length
          };
        }
        return p;
      });
      return { ...prev, posts: updatedPosts };
    });
    setCopiedKey(`cleaned-${postId}`);
    setTimeout(() => setCopiedKey(null), 2000);
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
          setActiveEpisodeIdx(0);
          return;
        }
      }
      const fallback = getDeterministicLinkedInSeries(csvSummary, selectedFrameworkId, presetIdToUse);
      setSeriesData(fallback);
      setActiveEpisodeIdx(0);
    } catch (err) {
      console.error('Error generating series:', err);
      const fallback = getDeterministicLinkedInSeries(csvSummary, selectedFrameworkId, presetIdToUse);
      setSeriesData(fallback);
      setActiveEpisodeIdx(0);
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

  // Generate Thread Follow-Ups via Gemini
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

  // Active post in the LinkedIn feed
  const activePost: LinkedInPost = seriesData.posts[activeEpisodeIdx] || seriesData.posts[0];
  const fullPostText = `${activePost.hook}\n\n${activePost.body}\n\n${activePost.cta}\n\n${activePost.hashtags.join(' ')}`;

  // Filtered CSV leads for Dossier view
  const filteredLeads = leads.filter(l => {
    if (!csvSearchTerm.trim()) return true;
    const term = csvSearchTerm.toLowerCase();
    return (
      (l.name && l.name.toLowerCase().includes(term)) ||
      (l.company && l.company.toLowerCase().includes(term)) ||
      (l.title && l.title.toLowerCase().includes(term)) ||
      (l.painPoint && l.painPoint.toLowerCase().includes(term))
    );
  });

  return (
    <div className="min-h-full bg-[#f4f2ee] p-3 sm:p-5 lg:p-6 space-y-4 font-sans text-[#191919]">
      
      {/* ========================================================================= */}
      {/* 1. LINKEDIN-STYLE TOP NAVIGATION BAR                                      */}
      {/* ========================================================================= */}
      <header className="bg-white border border-[#e0dfdc] rounded-xl p-3 px-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Brand & Search/Mode */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-[#0a66c2] text-white flex items-center justify-center shrink-0">
            <LinkedinIcon className="h-5 w-5 fill-current text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#191919] leading-tight">
                LinkedIn Thought Leadership Studio
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ebf4fd] text-[#0a66c2] font-bold border border-[#cbe1f9]">
                0 Em Dashes • 0 Emojis
              </span>
            </div>
            <p className="text-xs text-[#666666]">
              Synthesize high-conversion episodic posts grounded in target prospect data.
            </p>
          </div>
        </div>

        {/* LinkedIn Navigation Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-[#f4f2ee] rounded-xl border border-[#e0dfdc]">
            <button
              onClick={() => setActiveTab('series')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'series'
                  ? 'bg-white text-[#0a66c2] shadow-2xs'
                  : 'text-[#666666] hover:text-[#191919]'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Episodic Series (3-Part)</span>
            </button>

            <button
              onClick={() => setActiveTab('viral')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'viral'
                  ? 'bg-white text-[#0a66c2] shadow-2xs'
                  : 'text-[#666666] hover:text-[#191919]'
              }`}
            >
              <MessageSquareQuote className="h-3.5 w-3.5" />
              <span>Viral Comment Copilot</span>
            </button>

            <button
              onClick={() => setActiveTab('dossier')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dossier'
                  ? 'bg-white text-[#0a66c2] shadow-2xs'
                  : 'text-[#666666] hover:text-[#191919]'
              }`}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>CSV Intel ({leads.length})</span>
            </button>
          </div>

          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#e0dfdc] text-[#666666] hover:bg-[#f4f2ee] hover:text-[#191919] transition-colors text-xs font-semibold shadow-2xs"
            title="Upload CSV leads"
          >
            <Upload className="h-3.5 w-3.5 text-[#0a66c2]" />
            <span className="hidden sm:inline">CSV:</span>
            <span className="font-mono text-[#0a66c2] font-bold">{csvSummary.dominantHeadcount}</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* TAB 1: AUTHENTIC LINKEDIN POST WORKBENCH (SERIES ARC)                     */}
      {/* ========================================================================= */}
      {activeTab === 'series' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* ======================================================================= */}
          {/* LEFT RAIL: LINKEDIN PROFILE & STRATEGY CONTROLS (4 COLS)                */}
          {/* ======================================================================= */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* LinkedIn Mini Profile Card */}
            <div className="bg-white rounded-xl border border-[#e0dfdc] overflow-hidden shadow-2xs text-left">
              <div className="h-16 bg-gradient-to-r from-[#0a66c2] via-[#004182] to-zinc-900 relative">
                <span className="absolute top-2 right-2 text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-black/40 text-white backdrop-blur-xs">
                  Week {currentPreset.weekNumber} of 4 Active
                </span>
              </div>
              <div className="px-4 pb-4 relative pt-0">
                <div className="h-14 w-14 rounded-full border-2 border-white bg-zinc-900 text-white -mt-7 flex items-center justify-center font-bold text-sm shadow-xs overflow-hidden">
                  <span className="bg-gradient-to-br from-[#0a66c2] to-zinc-950 w-full h-full flex items-center justify-center text-white font-bold">
                    EV
                  </span>
                </div>
                <div className="mt-2">
                  <h3 className="text-sm font-bold text-[#191919] flex items-center gap-1">
                    <span>Emil Vance</span>
                    <span className="text-[10px] text-[#666666] font-normal">• 1st</span>
                  </h3>
                  <p className="text-[11px] text-[#666666] leading-tight mt-0.5">
                    Head of Outbound Operations &amp; BPO Partnerships | 17-Year BDM
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-[#e8e8e8] text-[11px] text-[#666666] space-y-1">
                  <div className="flex justify-between">
                    <span>Target Audience:</span>
                    <strong className="text-[#191919]">BPO Founders &amp; CROs</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Cadence:</span>
                    <strong className="text-[#0a66c2]">Tue • Thu • Fri</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* 4-Week Series Continuity Calendar */}
            <div className="bg-white rounded-xl border border-[#e0dfdc] p-4 shadow-2xs space-y-2.5 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#191919] uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[#0a66c2]" />
                  <span>Series Continuity (4 Weeks)</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-[#0a66c2] bg-[#ebf4fd] px-1.5 py-0.2 rounded">
                  {currentPreset.episodesRange}
                </span>
              </div>

              <div className="space-y-1.5">
                {CONTINUITY_SERIES_PRESETS.map((p) => {
                  const isSelected = selectedPresetId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectWeekPreset(p.id)}
                      className={`w-full p-2 rounded-lg border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#ebf4fd] border-[#0a66c2] text-[#0a66c2] shadow-2xs'
                          : 'bg-white hover:bg-[#f4f2ee] border-[#e0dfdc] text-[#191919]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="uppercase">Week {p.weekNumber}</span>
                        <span className="font-mono">{p.episodesRange}</span>
                      </div>
                      <div className="text-xs font-semibold leading-tight line-clamp-1 mt-0.5">
                        {p.title.replace(/^Week \d+:\s*/, '')}
                      </div>
                    </button>
                  );
                })}
              </div>

              {currentPreset.nextPresetId && (
                <button
                  type="button"
                  onClick={() => handleSelectWeekPreset(currentPreset.nextPresetId!)}
                  className="w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-[#0a66c2] hover:bg-[#004182] text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-300" />
                  <span>Advance to Week {((currentPreset.weekNumber) % 4) + 1} ➔</span>
                </button>
              )}
            </div>

            {/* Framework & Idea Box Card */}
            <div className="bg-white rounded-xl border border-[#e0dfdc] p-4 shadow-2xs space-y-3 text-left">
              <div>
                <label className="text-xs font-bold text-[#191919] uppercase tracking-wider block mb-1">
                  1. Writing Framework
                </label>
                <select
                  value={selectedFrameworkId}
                  onChange={(e) => setSelectedFrameworkId(e.target.value)}
                  className="w-full text-xs font-semibold rounded-lg border border-[#e0dfdc] bg-[#f4f2ee] px-2.5 py-2 text-[#191919] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#0a66c2]"
                >
                  {LINKEDIN_FRAMEWORKS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} [{f.tag}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#191919] uppercase tracking-wider block mb-1">
                  2. Idea Box (Your Strategic Angle)
                </label>
                <textarea
                  rows={3}
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Type your raw thought, experience, or observation here..."
                  className="w-full text-xs rounded-lg border border-[#e0dfdc] bg-[#f4f2ee] p-2.5 text-[#191919] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#0a66c2] leading-relaxed resize-none"
                />

                <div className="flex flex-wrap gap-1 pt-1.5">
                  {LINKEDIN_IDEA_PRESETS.slice(0, 3).map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setCustomTopic(preset.idea);
                        if (preset.frameworkId) setSelectedFrameworkId(preset.frameworkId);
                      }}
                      className="text-[10px] px-2 py-0.5 rounded bg-[#f4f2ee] hover:bg-[#e0dfdc] text-[#666666] hover:text-[#191919] transition-colors"
                    >
                      💡 {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleGenerateSeries()}
                disabled={isGeneratingSeries}
                className="w-full py-2.5 px-4 rounded-lg bg-[#0a66c2] hover:bg-[#004182] text-white font-bold text-xs disabled:opacity-50 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {isGeneratingSeries ? (
                  <>
                    <RotateCw className="h-3.5 w-3.5 animate-spin text-white" />
                    <span>Synthesizing Series...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    <span>Synthesize 3-Post Series</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* ======================================================================= */}
          {/* CENTER/MAIN FEED: AUTHENTIC LINKEDIN POST WORKSTATION (8 COLS)          */}
          {/* ======================================================================= */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Episode Switcher / Post Tabs (LinkedIn Feed Style) */}
            <div className="bg-white rounded-xl border border-[#e0dfdc] p-3 shadow-2xs flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#666666] uppercase tracking-wider mr-1">
                  Episode:
                </span>
                {seriesData.posts.map((p, idx) => {
                  const isSelected = activeEpisodeIdx === idx;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setActiveEpisodeIdx(idx)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#0a66c2] text-white shadow-2xs'
                          : 'bg-[#f4f2ee] hover:bg-[#e0dfdc] text-[#666666]'
                      }`}
                    >
                      <span>{p.dayLabel.split('•')[0].trim()}</span>
                      <span className={`text-[10px] font-mono px-1 rounded-full ${isSelected ? 'bg-[#004182] text-white' : 'bg-[#e0dfdc] text-zinc-700'}`}>
                        Ep {p.episodeNumber}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Master Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCleanPost(activePost.id)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#666666] hover:text-[#191919] bg-[#f4f2ee] hover:bg-[#e0dfdc] transition-colors flex items-center gap-1"
                  title="Verify 0 em-dashes and 0 emojis"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{copiedKey === `cleaned-${activePost.id}` ? 'Cleaned!' : 'Audit Rules'}</span>
                </button>

                <button
                  onClick={() => toggleEditMode(activePost.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    editingPostIds[activePost.id]
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-[#f4f2ee] hover:bg-[#e0dfdc] text-[#191919]'
                  }`}
                >
                  <Pencil className="h-3 w-3" />
                  <span>{editingPostIds[activePost.id] ? 'Done' : 'Edit Post'}</span>
                </button>

                <button
                  onClick={() => copyToClipboard(fullPostText, `copy-main-${activePost.id}`)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#0a66c2] hover:bg-[#004182] text-white transition-colors shadow-2xs cursor-pointer"
                >
                  {copiedKey === `copy-main-${activePost.id}` ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy for LinkedIn</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* =================================================================== */}
            {/* THE AUTHENTIC LINKEDIN POST CARD                                   */}
            {/* =================================================================== */}
            <div className="bg-white rounded-xl border border-[#e0dfdc] shadow-2xs overflow-hidden text-left">
              
              {/* Post Header: Profile & Timestamp */}
              <div className="p-4 pb-2 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#0a66c2] to-zinc-900 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                    EV
                  </div>
                  <div>
                    <div className="flex items-center gap-1 leading-tight">
                      <span className="font-bold text-sm text-[#191919] hover:text-[#0a66c2] hover:underline cursor-pointer">
                        Emil Vance
                      </span>
                      <span className="text-xs text-[#666666] font-normal">• 1st</span>
                    </div>
                    <p className="text-xs text-[#666666] leading-snug line-clamp-1">
                      Head of Outbound Operations &amp; BPO Partnerships | 17-Year BDM
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-[#666666] mt-0.5">
                      <span>1d • Edited</span>
                      <span>•</span>
                      <Globe className="h-3 w-3 text-[#666666]" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[#666666]">
                  <button className="p-1.5 rounded-full hover:bg-[#f4f2ee] transition-colors">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Post Content Area */}
              <div className="px-4 py-2 text-[14px] leading-[1.45] text-[#191919]">
                {editingPostIds[activePost.id] ? (
                  /* INLINE EDIT MODE */
                  <div className="space-y-3 p-3 bg-amber-50/50 rounded-lg border border-amber-300">
                    <div>
                      <label className="text-[10px] font-bold text-amber-950 uppercase block mb-1">
                        Hook (First 2 Lines)
                      </label>
                      <textarea
                        rows={2}
                        value={activePost.hook}
                        onChange={(e) => handleUpdatePostField(activePost.id, 'hook', e.target.value)}
                        className="w-full text-xs font-bold rounded border border-amber-300 p-2 bg-white text-[#191919]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-amber-950 uppercase block mb-1">
                        Body Text (&lt;90 words)
                      </label>
                      <textarea
                        rows={5}
                        value={activePost.body}
                        onChange={(e) => handleUpdatePostField(activePost.id, 'body', e.target.value)}
                        className="w-full text-xs rounded border border-amber-300 p-2 bg-white text-[#191919] leading-relaxed"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-amber-950 uppercase block mb-1">
                        CTA (Open Discussion Question)
                      </label>
                      <textarea
                        rows={2}
                        value={activePost.cta}
                        onChange={(e) => handleUpdatePostField(activePost.id, 'cta', e.target.value)}
                        className="w-full text-xs font-semibold rounded border border-amber-300 p-2 bg-white text-[#0a66c2]"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => toggleEditMode(activePost.id)}
                        className="px-3 py-1 rounded bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                      >
                        ✓ Done Editing
                      </button>
                    </div>
                  </div>
                ) : (
                  /* AUTHENTIC LINKEDIN FEED VIEW */
                  <div className="space-y-3 whitespace-pre-line font-sans">
                    <div className="font-bold text-[#191919] text-[15px] leading-snug">
                      {activePost.hook}
                    </div>

                    <div className="text-[#191919] text-[14px] leading-relaxed">
                      {activePost.body}
                    </div>

                    <div className="text-[#191919] font-medium text-[14px]">
                      {activePost.cta}
                    </div>

                    <div className="text-[#0a66c2] font-semibold text-[13px] space-x-1.5 pt-1">
                      {activePost.hashtags.map((tag, tIdx) => (
                        <span key={tIdx} className="hover:underline cursor-pointer">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Media Attachment / Photo or Graphic */}
              <div className="mt-3 border-t border-[#e8e8e8] bg-[#f9fafb]">
                <div className="p-2 px-4 flex items-center justify-between text-xs text-[#666666] bg-[#f4f2ee] border-b border-[#e8e8e8]">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-[#0a66c2]" />
                    <span>Media Attachment: {showVisualStudio ? 'Visual Studio Open' : 'Graphic Card Preview'}</span>
                  </span>
                  <button
                    onClick={() => setShowVisualStudio(!showVisualStudio)}
                    className="text-xs font-bold text-[#0a66c2] hover:underline cursor-pointer"
                  >
                    {showVisualStudio ? 'Hide Visual Studio ▲' : 'Open Photo & Prompt Studio ▼'}
                  </button>
                </div>

                {showVisualStudio ? (
                  <div className="p-3">
                    <LinkedInVisualCard
                      visualConfig={activePost.visualCard}
                      imagePrompt={activePost.imagePrompt}
                      realisticPhotoPrompt={activePost.realisticPhotoPrompt}
                      realisticImageUrl={activePost.realisticImageUrl}
                      alternativeImageUrl={activePost.alternativeImageUrl}
                      alternativeImageLabel={activePost.alternativeImageLabel}
                      alternativeImagePrompt={activePost.alternativeImagePrompt}
                      episodeNumber={activePost.episodeNumber}
                      postTitle={activePost.title}
                      postHook={activePost.hook}
                      postBody={activePost.body}
                    />
                  </div>
                ) : (
                  /* Compact Clean LinkedIn Image Preview */
                  <div className="p-4 flex items-center justify-center bg-zinc-950 text-white rounded-b-none min-h-[160px] relative overflow-hidden">
                    <div className="max-w-md text-center space-y-1.5 p-3">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
                        {activePost.visualCard?.tag || `EPISODE ${activePost.episodeNumber}`}
                      </span>
                      <h4 className="text-base font-extrabold tracking-tight text-white leading-tight">
                        {activePost.visualCard?.headline || activePost.title}
                      </h4>
                      <p className="text-xs text-zinc-300 line-clamp-2">
                        {activePost.visualCard?.subheadline || activePost.hook}
                      </p>
                      {activePost.visualCard?.metric && (
                        <div className="text-xl font-black font-mono text-emerald-400 pt-1">
                          {activePost.visualCard.metric}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Social Reaction Counts Bar */}
              <div className="px-4 py-2 border-b border-[#e8e8e8] flex items-center justify-between text-xs text-[#666666]">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center -space-x-1">
                    <span className="h-4 w-4 rounded-full bg-[#0a66c2] text-white flex items-center justify-center text-[9px]">👍</span>
                    <span className="h-4 w-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px]">👏</span>
                    <span className="h-4 w-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[9px]">❤️</span>
                  </div>
                  <span className="hover:text-[#0a66c2] hover:underline cursor-pointer">1,842</span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="hover:text-[#0a66c2] hover:underline cursor-pointer">89 comments</span>
                  <span>•</span>
                  <span className="hover:text-[#0a66c2] hover:underline cursor-pointer">42 reposts</span>
                </div>
              </div>

              {/* Authentic Action Buttons Bar */}
              <div className="px-2 py-1 border-b border-[#e8e8e8] grid grid-cols-4 gap-1 text-[#666666]">
                <button className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg hover:bg-[#f4f2ee] transition-colors text-xs font-semibold">
                  <ThumbsUp className="h-4 w-4" />
                  <span>Like</span>
                </button>
                <button 
                  onClick={() => setShowInjectedComments(!showInjectedComments)}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg hover:bg-[#f4f2ee] transition-colors text-xs font-semibold text-[#0a66c2]"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Comment (3)</span>
                </button>
                <button className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg hover:bg-[#f4f2ee] transition-colors text-xs font-semibold">
                  <Repeat2 className="h-4 w-4" />
                  <span>Repost</span>
                </button>
                <button 
                  onClick={() => copyToClipboard(fullPostText, `copy-btn-${activePost.id}`)}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg hover:bg-[#f4f2ee] transition-colors text-xs font-semibold text-[#191919]"
                >
                  <Send className="h-4 w-4" />
                  <span>{copiedKey === `copy-btn-${activePost.id}` ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              {/* =================================================================== */}
              {/* AUTHENTIC LINKEDIN COMMENTS THREAD (THE 3 INJECTED COMMENTS)        */}
              {/* =================================================================== */}
              {showInjectedComments && (
                <div className="p-4 bg-[#f9fafb] space-y-3 border-t border-[#e8e8e8]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#191919] uppercase tracking-wider flex items-center gap-1.5">
                      <Flame className="h-3.5 w-3.5 text-rose-500" />
                      <span>Injected Comments Thread (Post Immediately After Dropping)</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#666666] bg-white px-2 py-0.5 rounded border border-[#e0dfdc]">
                      0 Emojis • 0 Em Dashes
                    </span>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    {activePost.injectedComments.map((comment, cIdx) => (
                      <div key={cIdx} className="flex items-start gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-[#0a66c2] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          EV
                        </div>
                        <div className="flex-1 bg-[#f2f2f2] hover:bg-[#e8e8e8]/70 transition-colors p-3 rounded-2xl rounded-tl-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-[#191919]">Emil Vance</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#ebf4fd] text-[#0a66c2] font-bold">
                                Author
                              </span>
                            </div>
                            <span className="text-[10px] text-[#666666]">
                              {cIdx === 0 ? 'Comment 1 (Sacred Cow)' : cIdx === 1 ? 'Comment 2 (Debate Flame)' : 'Comment 3 (Excuse Shredder)'}
                            </span>
                          </div>
                          <p className="text-xs text-[#191919] leading-snug">
                            {comment}
                          </p>
                          <div className="flex items-center justify-between pt-1 text-[11px] text-[#666666]">
                            <div className="flex items-center gap-2">
                              <span className="hover:text-[#0a66c2] cursor-pointer">Like</span>
                              <span>•</span>
                              <span className="hover:text-[#0a66c2] cursor-pointer">Reply</span>
                            </div>
                            <button
                              onClick={() => copyToClipboard(comment, `feed-cmt-${cIdx}`)}
                              className="text-[10px] font-bold text-[#0a66c2] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              {copiedKey === `feed-cmt-${cIdx}` ? '✓ Copied' : 'Copy Comment'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: VIRAL COMMENT COPILOT (LINKEDIN NOTIFICATION/ENGAGEMENT STYLE)     */}
      {/* ========================================================================= */}
      {activeTab === 'viral' && (
        <div className="space-y-4 max-w-5xl mx-auto">
          
          {/* Post Input Box */}
          <div className="bg-white rounded-xl border border-[#e0dfdc] p-5 shadow-2xs space-y-3 text-left">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#191919] flex items-center gap-1.5">
                  <MessageSquareQuote className="h-4 w-4 text-[#0a66c2]" />
                  <span>Viral Post Comment Copilot</span>
                </h2>
                <p className="text-xs text-[#666666]">
                  Paste any viral post from an influencer, buyer, or competitor. Gemini drafts short, thoughtful comments you can post manually on LinkedIn. Strictly zero em dashes and zero emojis.
                </p>
              </div>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                &lt;42 Words • 0 Em Dashes • 0 Emojis
              </span>
            </div>

            <textarea
              rows={4}
              value={viralPostInput}
              onChange={(e) => setViralPostInput(e.target.value)}
              placeholder="Paste viral LinkedIn post text here..."
              className="w-full text-xs rounded-lg border border-[#e0dfdc] bg-[#f4f2ee] p-3 text-[#191919] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#0a66c2] leading-relaxed resize-none"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold text-[#666666]">Angle:</span>
                {['All', 'Counter-Perspective', 'Consultative Question', 'Frontline Operator', 'Punchy 20-Word'].map((angle) => (
                  <button
                    key={angle}
                    onClick={() => setSelectedAngle(angle)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedAngle === angle
                        ? 'bg-[#0a66c2] text-white'
                        : 'bg-[#f4f2ee] text-[#666666] hover:bg-[#e0dfdc]'
                    }`}
                  >
                    {angle}
                  </button>
                ))}
              </div>

              <button
                onClick={handleGenerateViralComments}
                disabled={isGeneratingComments || !viralPostInput.trim()}
                className="px-4 py-2 rounded-lg bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-bold disabled:opacity-50 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                {isGeneratingComments ? (
                  <>
                    <RotateCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    <span>Draft Engagement Comments</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Drafted Comments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
            {viralComments.map((draft) => (
              <div
                key={draft.id}
                className="bg-white rounded-xl border border-[#e0dfdc] p-4 shadow-2xs flex flex-col justify-between space-y-2.5 hover:border-[#0a66c2]/50 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#ebf4fd] text-[#0a66c2]">
                      {draft.angle}
                    </span>
                    <span className="text-[10px] font-mono text-[#666666]">
                      {draft.wordCount} words
                    </span>
                  </div>

                  <p className="text-xs text-[#191919] leading-relaxed bg-[#f4f2ee] p-3 rounded-xl border border-[#e0dfdc]">
                    "{draft.comment}"
                  </p>

                  <p className="text-[10px] text-[#666666] font-mono">
                    Strategic Intent: {draft.intent}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#e8e8e8] flex items-center justify-between">
                  <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Clean: 0 emojis, 0 em dashes
                  </span>

                  <button
                    onClick={() => copyToClipboard(draft.comment, draft.id)}
                    className="px-3 py-1.5 rounded-lg bg-[#0a66c2] text-white text-xs font-bold hover:bg-[#004182] transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                  >
                    {copiedKey === draft.id ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-300" />
                        <span>Copied!</span>
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

          {/* Stage 3: Thread Conversation Accelerator */}
          <div className="bg-white rounded-xl border border-[#e0dfdc] p-5 shadow-2xs space-y-3 text-left">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#191919]">
                  Thread Conversation &amp; Relationship Accelerator
                </h3>
                <p className="text-xs text-[#666666]">
                  When the author or prospect replies, generate 3 sequential follow-up stages to build rapport.
                </p>
              </div>
              <span className="text-[10px] font-mono bg-[#f4f2ee] text-[#666666] px-2 py-0.5 rounded">
                &lt;35 Words • 0 Emojis
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-[#666666] block mb-1">
                  1. Your Initial Comment:
                </label>
                <textarea
                  rows={2}
                  value={previousCommentInput}
                  onChange={(e) => setPreviousCommentInput(e.target.value)}
                  className="w-full text-xs rounded-lg border border-[#e0dfdc] bg-[#f4f2ee] p-2 text-[#191919] resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#666666] block mb-1">
                  2. Author's Response:
                </label>
                <textarea
                  rows={2}
                  value={authorReplyInput}
                  onChange={(e) => setAuthorReplyInput(e.target.value)}
                  className="w-full text-xs rounded-lg border border-[#e0dfdc] bg-[#f4f2ee] p-2 text-[#191919] resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleGenerateThreadReplies}
                disabled={isGeneratingThreadReplies || !authorReplyInput.trim()}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                {isGeneratingThreadReplies ? (
                  <>
                    <RotateCw className="h-3 w-3 animate-spin" />
                    <span>Generating Follow-ups...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 text-emerald-200" />
                    <span>Generate Thread Follow-ups</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              {threadReplies.map((r) => (
                <div key={r.id} className="p-3 bg-[#f4f2ee] rounded-xl border border-[#e0dfdc] space-y-1.5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between text-[10px] font-mono">
                      <strong className="text-[#0a66c2] uppercase">{r.stage}</strong>
                      <span className="text-[#666666]">{r.wordCount}w</span>
                    </div>
                    <p className="text-xs text-[#191919] leading-snug mt-1">"{r.reply}"</p>
                  </div>
                  <div className="pt-2 border-t border-[#e0dfdc] flex justify-between items-center text-[10px]">
                    <span className="text-[#666666]">{r.strategicGoal}</span>
                    <button
                      onClick={() => copyToClipboard(r.reply, r.id)}
                      className="text-[#0a66c2] font-bold hover:underline"
                    >
                      {copiedKey === r.id ? 'Copied' : 'Copy'}
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
        <div className="space-y-4 max-w-5xl mx-auto text-left">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-white border border-[#e0dfdc] shadow-2xs">
              <span className="text-[10px] font-mono uppercase text-[#666666]">Accounts Analyzed</span>
              <div className="text-xl font-bold text-[#191919] mt-0.5">{csvSummary.totalLeads}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#e0dfdc] shadow-2xs">
              <span className="text-[10px] font-mono uppercase text-[#666666]">Dominant Segment</span>
              <div className="text-base font-bold text-[#191919] mt-0.5">{csvSummary.dominantHeadcount}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#e0dfdc] shadow-2xs">
              <span className="text-[10px] font-mono uppercase text-[#666666]">Primary Bottleneck</span>
              <div className="text-xs font-bold text-rose-600 mt-0.5 line-clamp-1">{csvSummary.topPainPoints[0]}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#e0dfdc] shadow-2xs">
              <span className="text-[10px] font-mono uppercase text-[#666666]">Incumbent Competitor</span>
              <div className="text-xs font-bold text-[#191919] mt-0.5">{csvSummary.topCompetitors[0]}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#e0dfdc] p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#191919] uppercase tracking-wider">
                Target Accounts Grounding ({leads.length} accounts)
              </h3>
              <div className="relative">
                <Search className="h-3 w-3 text-[#666666] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={csvSearchTerm}
                  onChange={(e) => setCsvSearchTerm(e.target.value)}
                  placeholder="Search leads..."
                  className="text-xs py-1 pl-7 pr-2.5 rounded-lg border border-[#e0dfdc] bg-[#f4f2ee] text-[#191919]"
                />
              </div>
            </div>

            <div className="overflow-x-auto border border-[#e0dfdc] rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f4f2ee] border-b border-[#e0dfdc] text-[#666666] font-semibold text-[10px] uppercase">
                  <tr>
                    <th className="p-2.5">Contact</th>
                    <th className="p-2.5">Company</th>
                    <th className="p-2.5">Seats</th>
                    <th className="p-2.5">Identified Friction</th>
                    <th className="p-2.5">Tech</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e0dfdc]">
                  {filteredLeads.slice(0, 10).map((l, idx) => (
                    <tr key={idx} className="hover:bg-[#f4f2ee]/50">
                      <td className="p-2.5 font-medium text-[#191919]">
                        {l.name}
                        <div className="text-[10px] text-[#666666] font-normal">{l.title}</div>
                      </td>
                      <td className="p-2.5 font-medium">{l.company}</td>
                      <td className="p-2.5 font-mono text-[11px]">{l.headcount}</td>
                      <td className="p-2.5 text-rose-700 font-medium">{l.painPoint}</td>
                      <td className="p-2.5 text-[#666666] font-mono text-[11px]">{l.techStack}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
