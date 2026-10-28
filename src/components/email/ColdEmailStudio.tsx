'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Mail, 
  Sparkles, 
  Copy, 
  Check, 
  Send, 
  Lightbulb, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  BookOpen, 
  RotateCw, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sliders,
  CheckCircle2, 
  HelpCircle, 
  FileText, 
  User, 
  Building, 
  Briefcase,
  Upload,
  X,
  Layers,
  ArrowRight,
  Flame,
  Globe,
  Pencil,
  Eye,
  CheckCircle,
  Hash,
  Compass,
  Zap,
  Info,
  Inbox,
  Loader2,
  AlignLeft
} from 'lucide-react';
import { saveEmailToStore } from '@/lib/emailStore';
import { 
  COLD_EMAIL_FRAMEWORKS, 
  COLD_EMAIL_IDEA_PRESETS, 
  MANUAL_COLD_EMAIL_GUIDANCE,
  ColdEmailFramework,
  ColdEmailGeneratedDraft,
  sanitizeColdEmail,
  getDeterministicColdEmail,
  enforceMaxThreeWords,
  suggestSubjectLinesFromIdea,
  formatEmailToParagraphs
} from '@/lib/coldEmailStudio';
import { DEMO_CADENCE_LEADS, CadenceLeadRecord } from '@/lib/cadenceMaster';
import UploadLeadsCsvModal from '@/components/cockpit/UploadLeadsCsvModal';
import { useSession } from '@/lib/session';

export default function ColdEmailStudio() {
  const { session } = useSession();

  // Dynamic sender based on authenticated session
  const senderDisplayName = session?.repName || 'Emil Halili';
  const senderEmailRaw = session?.email || 'emil@appointmentlyy.com';
  const verifiedSenderEmail = senderEmailRaw.toLowerCase().endsWith('@appointmentlyy.com')
    ? senderEmailRaw
    : 'emil@appointmentlyy.com';
  const senderFrom = `${senderDisplayName} <${verifiedSenderEmail}>`;
  // Navigation & Framework State
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string>('braun-poke-the-bear');
  const [userIdea, setUserIdea] = useState<string>(
    'I want to tell a BPO operations director that their 250 SDRs are wasting 4 hours a day on dead leads from shared broker lists where competitors already called 5 times. I want to invite them to see how we qualify leads live without buying more bloated Apollo lists.'
  );

  // End User Subject Line Idea State
  const [subjectLineIdea, setSubjectLineIdea] = useState<string>('');
  const [isAnalyzingSubjectIdea, setIsAnalyzingSubjectIdea] = useState<boolean>(false);
  const [showSubjectIdeaBox, setShowSubjectIdeaBox] = useState<boolean>(false);

  // Prospect Context State
  const [leads, setLeads] = useState<CadenceLeadRecord[]>(DEMO_CADENCE_LEADS);
  const [selectedLeadIndex, setSelectedLeadIndex] = useState<number>(0);
  const [prospectName, setProspectName] = useState<string>('Julian Vance');
  const [prospectCompany, setProspectCompany] = useState<string>('Apex Global BPO');
  const [prospectTitle, setProspectTitle] = useState<string>('Director of Outbound Operations');
  const [prospectTech, setProspectTech] = useState<string>('Apollo.io & HubSpot');
  const [prospectPain, setProspectPain] = useState<string>('outbound hold rate and objection hesitation on shared lead lists');
  const [prospectEmail, setProspectEmail] = useState<string>('julian@apexglobalbpo.com');
  const [prospectHeadcount, setProspectHeadcount] = useState<string>('65 seats');

  // Generation & Draft State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentDraft, setCurrentDraft] = useState<ColdEmailGeneratedDraft>(() => 
    getDeterministicColdEmail('braun-poke-the-bear', undefined, { name: 'Julian Vance', company: 'Apex Global BPO' })
  );
  const [selectedSubjectIdx, setSelectedSubjectIdx] = useState<number>(0);
  const [selectedCtaIdx, setSelectedCtaIdx] = useState<number>(0);
  const [editableBody, setEditableBody] = useState<string>(() => 
    formatEmailToParagraphs(getDeterministicColdEmail('braun-poke-the-bear', undefined, { name: 'Julian Vance', company: 'Apex Global BPO' }).body).join('\n\n')
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSendingDirectEmail, setIsSendingDirectEmail] = useState<boolean>(false);
  const [directSendStatus, setDirectSendStatus] = useState<string | null>(null);

  // UI View & Modal Controls
  const [viewMode, setViewMode] = useState<'compose' | 'breakdown'>('compose');
  const [isPlaybookDrawerOpen, setIsPlaybookDrawerOpen] = useState<boolean>(false);
  const [isProspectModalOpen, setIsProspectModalOpen] = useState<boolean>(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState<boolean>(false);
  const [activeTimezoneTab, setActiveTimezoneTab] = useState<'EST' | 'PST' | 'GMT' | 'AEST' | 'PHT'>('EST');

  // Clocks for global hub timing
  const [currentTimes, setCurrentTimes] = useState<{ [tz: string]: string }>({});

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      const formatTz = (tz: string) => {
        try {
          return new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }).format(now);
        } catch {
          return '--:--';
        }
      };

      setCurrentTimes({
        EST: formatTz('America/New_York'),
        PST: formatTz('America/Los_Angeles'),
        GMT: formatTz('Europe/London'),
        AEST: formatTz('Australia/Sydney'),
        PHT: formatTz('Asia/Manila')
      });
    };

    updateTimes();
    const interval = setInterval(updateTimes, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load stored CSV leads if present
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sdr_active_csv_leads');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLeads(parsed);
          const first = parsed[0];
          setSelectedLeadIndex(0);
          setProspectName(first.name || 'Julian Vance');
          setProspectCompany(first.company || 'Apex Global BPO');
          setProspectTitle(first.title || 'Director of Outbound Operations');
          setProspectTech(first.techStack || 'Apollo.io & HubSpot');
          setProspectPain(first.painPoint || 'outbound hold rate on shared broker lists');
          setProspectEmail(first.email || 'prospect@targetcompany.com');
          setProspectHeadcount(first.headcount || '50+ seats');
        }
      }
    } catch (e) {
      console.warn('Could not load stored CSV leads:', e);
    }
  }, []);

  // Update editable body when currentDraft changes (ensuring clean paragraph breaks)
  useEffect(() => {
    const formatted = formatEmailToParagraphs(currentDraft.body).join('\n\n');
    setEditableBody(formatted);
    setSelectedSubjectIdx(currentDraft.selectedSubjectIndex);
    setSelectedCtaIdx(currentDraft.selectedCtaIndex);
  }, [currentDraft]);

  // Keyboard shortcut listener: Ctrl+Enter (or Cmd+Enter) to synthesize
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSynthesizeEmail();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        handleCopyEntireEmail();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userIdea, selectedFrameworkId, prospectName, prospectCompany, prospectTitle, prospectPain, editableBody, selectedSubjectIdx]);

  const activeFramework = COLD_EMAIL_FRAMEWORKS.find(f => f.id === selectedFrameworkId) || COLD_EMAIL_FRAMEWORKS[0];

  // Lead selection handler
  const handleSelectLead = (index: number) => {
    setSelectedLeadIndex(index);
    if (index >= 0 && leads[index]) {
      const l = leads[index];
      setProspectName(l.name || 'Prospect');
      setProspectCompany(l.company || 'Target Company');
      setProspectTitle(l.title || 'Decision Maker');
      setProspectTech(l.techStack || 'Apollo & HubSpot');
      setProspectPain(l.painPoint || 'list fatigue and objection drop-offs');
      setProspectEmail(l.email || `${(l.name || 'contact').toLowerCase().replace(/\s+/g, '.')}@${(l.company || 'company').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`);
      setProspectHeadcount(l.headcount || '50+ seats');
    }
  };

  // Preset Idea selection handler
  const handleSelectIdeaPreset = (preset: typeof COLD_EMAIL_IDEA_PRESETS[0]) => {
    setUserIdea(preset.rawIdea);
    if (preset.recommendedFrameworkId) {
      setSelectedFrameworkId(preset.recommendedFrameworkId);
    }
  };

  // Generate / Synthesize Handler
  const handleSynthesizeEmail = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/cold-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frameworkId: selectedFrameworkId,
          userIdea: userIdea.trim(),
          prospect: {
            name: prospectName,
            company: prospectCompany,
            title: prospectTitle,
            techStack: prospectTech,
            painPoint: prospectPain,
            headcount: prospectHeadcount
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.draft) {
          setCurrentDraft(data.draft);
          return;
        }
      }

      // Fallback
      const fallback = getDeterministicColdEmail(selectedFrameworkId, userIdea, {
        name: prospectName,
        company: prospectCompany,
        title: prospectTitle
      });
      setCurrentDraft(fallback);
    } catch (err) {
      console.error('Error synthesizing cold email:', err);
      const fallback = getDeterministicColdEmail(selectedFrameworkId, userIdea, {
        name: prospectName,
        company: prospectCompany,
        title: prospectTitle
      });
      setCurrentDraft(fallback);
    } finally {
      setIsGenerating(false);
    }
  };

  // Analyze Subject Line Idea Handler (Enforcing Maximum 3 Words ONLY)
  const handleAnalyzeSubjectIdea = async (ideaOverride?: string) => {
    const ideaToUse = (ideaOverride !== undefined ? ideaOverride : subjectLineIdea).trim();
    if (!ideaToUse) return;

    setIsAnalyzingSubjectIdea(true);
    try {
      const res = await fetch('/api/ai/cold-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'suggest-subject-lines',
          subjectLineIdea: ideaToUse,
          prospect: {
            name: prospectName,
            company: prospectCompany,
            title: prospectTitle,
            techStack: prospectTech,
            painPoint: prospectPain
          },
          emailBody: editableBody,
          frameworkId: selectedFrameworkId
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.subjectLines && Array.isArray(data.subjectLines) && data.subjectLines.length > 0) {
          const strictlyEnforced = data.subjectLines.map((s: any) => ({
            label: s.label || 'Subject',
            text: enforceMaxThreeWords(s.text || ''),
            angle: s.angle || 'Max 3 words lowercase'
          }));
          setCurrentDraft(prev => ({
            ...prev,
            subjectLines: strictlyEnforced,
            selectedSubjectIndex: 0
          }));
          setSelectedSubjectIdx(0);
          return;
        }
      }

      // Intelligent Fallback with Strict 3-Word Limit
      const fallbackSubjects = suggestSubjectLinesFromIdea(ideaToUse, {
        name: prospectName,
        company: prospectCompany,
        title: prospectTitle
      });
      setCurrentDraft(prev => ({
        ...prev,
        subjectLines: fallbackSubjects,
        selectedSubjectIndex: 0
      }));
      setSelectedSubjectIdx(0);
    } catch (err) {
      console.error('Failed to analyze subject line idea:', err);
      const fallbackSubjects = suggestSubjectLinesFromIdea(ideaToUse, {
        name: prospectName,
        company: prospectCompany,
        title: prospectTitle
      });
      setCurrentDraft(prev => ({
        ...prev,
        subjectLines: fallbackSubjects,
        selectedSubjectIndex: 0
      }));
      setSelectedSubjectIdx(0);
    } finally {
      setIsAnalyzingSubjectIdea(false);
    }
  };

  // Sanitize editable body manually and format paragraphs cleanly
  const handleManualSanitize = () => {
    const { cleanText } = sanitizeColdEmail(editableBody);
    const formatted = formatEmailToParagraphs(cleanText).join('\n\n');
    setEditableBody(formatted);
    setCopiedKey('sanitized');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Copy to clipboard helper
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Copy entire email with subject line
  const handleCopyEntireEmail = () => {
    const activeSubject = currentDraft.subjectLines[selectedSubjectIdx]?.text || 'quick question';
    const fullText = `Subject: ${activeSubject}\n\n${editableBody}`;
    copyToClipboard(fullText, 'entire_email');
  };

  // Open in default mail client (mailto:)
  const handleOpenMailto = () => {
    const activeSubject = encodeURIComponent(currentDraft.subjectLines[selectedSubjectIdx]?.text || 'quick question');
    const bodyEncoded = encodeURIComponent(editableBody);
    window.open(`mailto:${prospectEmail}?subject=${activeSubject}&body=${bodyEncoded}`, '_blank');
  };

  // Direct Send Email via Resend API
  const handleDirectSendEmail = async () => {
    if (!prospectEmail || !prospectEmail.includes('@')) {
      setDirectSendStatus('Error: Please enter a valid recipient email (To:)');
      return;
    }
    setIsSendingDirectEmail(true);
    setDirectSendStatus(null);
    const activeSubject = currentDraft.subjectLines[selectedSubjectIdx]?.text || 'quick question';
    const bodyToSend = formatEmailToParagraphs(editableBody).join('\n\n');
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: prospectEmail.trim(),
          from: senderFrom,
          subject: activeSubject,
          body: bodyToSend,
          leadName: prospectName,
          leadCompany: prospectCompany,
          leadTitle: prospectTitle,
          threadId: `thread_${prospectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.email) {
          saveEmailToStore(data.email);
        }
        setDirectSendStatus(`Dispatched from ${senderFrom} to ${prospectEmail.trim()}`);
      } else {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.error || `Send failed (${res.status} ${res.statusText})`;
        console.error('[DIRECT SEND ERROR]', errMsg, errData);
        setDirectSendStatus(`Error: ${errMsg}`);
      }
    } catch (e: any) {
      console.error('[DIRECT SEND NETWORK ERROR]', e);
      setDirectSendStatus(`Error: ${e.message || 'Network error'}`);
    } finally {
      setIsSendingDirectEmail(false);
      setTimeout(() => setDirectSendStatus(null), 15000);
    }
  };

  // Apply changes from Prospect Modal and regenerate draft for target lead
  const handleApplyProspectChanges = () => {
    setIsProspectModalOpen(false);
    const newDraft = getDeterministicColdEmail(selectedFrameworkId, userIdea, {
      name: prospectName,
      company: prospectCompany
    });
    setCurrentDraft(newDraft);
    setEditableBody(newDraft.body);
  };

  // CSV Import Callback
  const handleLeadsImported = (imported: CadenceLeadRecord[]) => {
    if (imported.length > 0) {
      setLeads(imported);
      setSelectedLeadIndex(0);
      const first = imported[0];
      setProspectName(first.name || 'Julian Vance');
      setProspectCompany(first.company || 'Apex Global BPO');
      setProspectTitle(first.title || 'Director of Outbound Operations');
      setProspectTech(first.techStack || 'Apollo.io & HubSpot');
      setProspectPain(first.painPoint || 'outbound hold rate and objection hesitation on shared lead lists');
      setProspectEmail(first.email || 'prospect@targetcompany.com');
      setProspectHeadcount(first.headcount || '50+ seats');
      try {
        localStorage.setItem('sdr_active_csv_leads', JSON.stringify(imported));
      } catch (e) {
        console.warn('Could not cache CSV leads:', e);
      }
    }
  };

  // Real-time compliance audit
  const wordCount = editableBody.trim().split(/\s+/).filter(Boolean).length;
  const emDashCount = (editableBody.match(/[—–]|(?<=\s)--(?:(?=\s)|$)|(?<=\w)--(?:(?=\w)|$)/g) || []).length;
  const emojiCount = (editableBody.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B50}\u{200D}\u{FE0F}]/gu) || []).length;
  const isCompliant = emDashCount === 0 && emojiCount === 0 && wordCount <= 75;

  const activeSubjectText = currentDraft.subjectLines[selectedSubjectIdx]?.text || 'quick question';

  return (
    <div className="min-h-full bg-zinc-50/70 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* ========================================================================= */}
      {/* 1. TOP COMMAND BAR & RADAR STATUS                                         */}
      {/* ========================================================================= */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-zinc-200/80">
        
        {/* Left: Studio Identity & Compliance Badges */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center shadow-xs shrink-0 ring-1 ring-zinc-800">
            <Mail className="h-5 w-5 text-zinc-100" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900">
                Cold Email AI Studio
              </h1>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <Check className="h-2.5 w-2.5 text-emerald-600" />
                Zero Em Dashes • Zero Emojis Enforced
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Battle-tested framework engine built for personal high-conversion sends with strict deliverability guardrails.
            </p>
          </div>
        </div>

        {/* Right: Deliverability Radar & Lead Target Pill */}
        <div className="flex items-center gap-2.5 flex-wrap">
          
          {/* Active Target Quick Pill */}
          <button
            onClick={() => setIsProspectModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-zinc-200/90 shadow-2xs hover:border-zinc-300 hover:bg-zinc-50 transition-all text-left"
            title="Click to view or edit target prospect dossier"
          >
            <div className="h-6 w-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold">
              {prospectName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="text-left">
              <div className="text-[11px] font-bold text-zinc-900 leading-tight">
                {prospectName}
              </div>
              <div className="text-[10px] text-zinc-500 leading-tight truncate max-w-[140px]">
                {prospectCompany}
              </div>
            </div>
            <Pencil className="h-3 w-3 text-zinc-400 ml-1" />
          </button>

          {/* Deliverability Playbook / Radar Trigger */}
          <button
            onClick={() => setIsPlaybookDrawerOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-300/80 text-amber-950 hover:bg-amber-500/20 transition-all text-xs font-semibold shadow-2xs"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden sm:inline">Deliverability Radar:</span>
            <span className="font-mono text-emerald-800 text-[11px] font-bold">Optimal Window</span>
            <Clock className="h-3.5 w-3.5 text-amber-700 ml-0.5" />
          </button>

          {/* Upload CSV Leads Trigger */}
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 transition-colors text-xs font-semibold shadow-2xs"
            title="Load CSV leads from campaign"
          >
            <Upload className="h-3.5 w-3.5 text-zinc-500" />
            <span className="hidden sm:inline">CSV Leads</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 font-bold">
              {leads.length}
            </span>
          </button>

          {/* Unified Inbox Link */}
          <Link
            href="/inbox"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 text-white hover:bg-zinc-800 transition-colors text-xs font-semibold shadow-2xs"
          >
            <Inbox className="h-3.5 w-3.5 text-emerald-400" />
            <span>Unified Inbox</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-emerald-400 font-bold">
              Live
            </span>
          </Link>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN 2-PANE WORKBENCH                                                  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ======================================================================= */}
        {/* LEFT PANE: STRATEGY & ANGLE ENGINE (5 COLS)                             */}
        {/* ======================================================================= */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Card 1: Target Prospect Dossier */}
          <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-2xs overflow-hidden">
            <div className="p-3.5 px-4 bg-zinc-50/70 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-zinc-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                  Target Recipient Dossier
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsProspectModalOpen(true)}
                  className="text-[11px] text-zinc-600 hover:text-zinc-950 font-semibold underline"
                >
                  Edit Details
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {/* CSV Quick Switcher */}
              {leads.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-500">
                    <span>Switch Target from Loaded Leads:</span>
                    <span className="font-mono text-zinc-400">{selectedLeadIndex + 1} of {leads.length}</span>
                  </div>
                  <select
                    value={selectedLeadIndex}
                    onChange={(e) => handleSelectLead(Number(e.target.value))}
                    className="w-full text-xs font-medium rounded-lg border border-zinc-200 bg-zinc-50/70 px-3 py-2 text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-zinc-900"
                  >
                    {leads.map((l, idx) => (
                      <option key={idx} value={idx}>
                        {l.name} • {l.company} ({l.title || 'Executive'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Prospect Dossier Summary */}
              <div className="p-3 rounded-xl bg-zinc-50/80 border border-zinc-200/60 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900">{prospectName}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-200/60 text-zinc-700 font-semibold">
                    {prospectHeadcount}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-600">
                  {prospectTitle} • <strong className="text-zinc-900">{prospectCompany}</strong>
                </div>
                <div className="text-[11px] text-zinc-500 pt-1 border-t border-zinc-200/50">
                  <span className="font-semibold text-zinc-700">Identified Friction:</span> {prospectPain}
                </div>
              </div>

              {/* Verified Sender Info */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-zinc-600 text-[11px] font-medium">From:</span>
                  <strong className="text-zinc-900 font-mono text-[11px]">{senderFrom}</strong>
                </div>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                  GoDaddy Live
                </span>
              </div>

              {/* Recipient Target Email (To:) with 1-click test button */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-500">
                  <span className="uppercase tracking-wider">Prospect Recipient (To:):</span>
                  <button
                    type="button"
                    onClick={() => setProspectEmail('emil@appointmentlyy.com')}
                    className="text-emerald-700 hover:text-emerald-950 font-bold hover:underline"
                    title="Quickly fill with emil@appointmentlyy.com to test deliverability directly to your GoDaddy inbox"
                  >
                    Test Send to My Inbox
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="email"
                    value={prospectEmail}
                    onChange={(e) => setProspectEmail(e.target.value)}
                    placeholder="prospect@company.com or your test email"
                    className="w-full text-xs font-mono font-medium rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-zinc-900 shadow-2xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Proven Email Framework Selector */}
          <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-2xs overflow-hidden">
            <div className="p-3.5 px-4 bg-zinc-50/70 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5 text-zinc-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                  Proven Framework
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700">
                {activeFramework.targetWordCount} Words Target
              </span>
            </div>

            <div className="p-4 space-y-3">
              {/* Segmented / Dropdown Framework Selector */}
              <select
                value={selectedFrameworkId}
                onChange={(e) => {
                  const newId = e.target.value;
                  setSelectedFrameworkId(newId);
                  const found = COLD_EMAIL_FRAMEWORKS.find(f => f.id === newId);
                  if (found && !userIdea.trim()) {
                    setUserIdea(found.defaultIdeaTemplate);
                  }
                }}
                className="w-full text-xs font-semibold rounded-lg border border-zinc-200 bg-zinc-50/70 px-3 py-2.5 text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-zinc-900"
              >
                {COLD_EMAIL_FRAMEWORKS.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} — ({f.category})
                  </option>
                ))}
              </select>

              {/* Framework Breakdown Card */}
              <div className="p-3 rounded-xl bg-gradient-to-br from-zinc-50 to-zinc-100/50 border border-zinc-200/70 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900 text-[11px]">{activeFramework.name}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">By {activeFramework.authorOrStyle}</span>
                </div>
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  {activeFramework.description}
                </p>
                <div className="p-2 rounded-lg bg-white/80 border border-zinc-200/60 text-[10px] text-zinc-700 italic">
                  <strong>Anti-Sales Principle:</strong> {activeFramework.antiSalesPrinciple}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: The Idea Box (Strategy & Bottleneck Angle) */}
          <div className="bg-white rounded-2xl border-2 border-zinc-900/10 shadow-2xs overflow-hidden">
            <div className="p-3.5 px-4 bg-zinc-50/70 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  The Idea Box (Your Raw Angle)
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                Grounds email in reality
              </span>
            </div>

            <div className="p-4 space-y-3">
              <textarea
                rows={4}
                value={userIdea}
                onChange={(e) => setUserIdea(e.target.value)}
                placeholder="Type your raw thought, pitch angle, or specific client bottleneck..."
                className="w-full text-xs font-sans rounded-xl border border-zinc-200 bg-zinc-50/40 p-3 text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-zinc-900 leading-relaxed resize-none"
              />

              {/* 1-Click Quick Angle Starters */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Quick Angle Starters (Click to inject):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {COLD_EMAIL_IDEA_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectIdeaPreset(preset)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium transition-colors border border-zinc-200/60 text-left"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action / Master Synthesize Button */}
          <button
            onClick={handleSynthesizeEmail}
            disabled={isGenerating}
            className="w-full py-3.5 px-4 rounded-xl bg-zinc-950 text-white font-bold text-xs hover:bg-zinc-800 disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RotateCw className="h-4 w-4 animate-spin text-amber-300" />
                <span>Synthesizing Cold Email with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-amber-400 group-hover:rotate-12 transition-transform" />
                <span>Synthesize Cold Email from Idea Box</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-normal ml-1">
                  Ctrl+Enter
                </span>
              </>
            )}
          </button>

        </div>

        {/* ======================================================================= */}
        {/* RIGHT PANE: EXECUTIVE EMAIL COMPOSER WORKSTATION (7 COLS)               */}
        {/* ======================================================================= */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Main Composer Window */}
          <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-sm overflow-hidden flex flex-col">
            
            {/* Window Chrome & Compliance Bar */}
            <div className="p-3.5 px-5 bg-zinc-900 text-white flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80 inline-block" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80 inline-block" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <div className="h-3.5 w-px bg-zinc-700 mx-1" />
                <span className="text-xs font-semibold text-zinc-200 truncate">
                  To: <span className="text-zinc-100 font-bold">{prospectName}</span> &lt;{prospectEmail}&gt;
                </span>
              </div>

              {/* Real-time Compliance Indicators */}
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                  emDashCount === 0 
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' 
                    : 'bg-rose-950/80 text-rose-300 border-rose-800'
                }`}>
                  {emDashCount === 0 ? '✓ 0 Em Dashes' : `⚠ ${emDashCount} Em Dashes`}
                </span>

                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                  emojiCount === 0 
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' 
                    : 'bg-rose-950/80 text-rose-300 border-rose-800'
                }`}>
                  {emojiCount === 0 ? '✓ 0 Emojis' : `⚠ ${emojiCount} Emojis`}
                </span>

                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                  wordCount <= 75 
                    ? 'bg-blue-950/80 text-blue-300 border-blue-800' 
                    : 'bg-amber-950/80 text-amber-300 border-amber-800'
                }`}>
                  {wordCount} Words ({currentDraft.readingGradeLevel})
                </span>
              </div>
            </div>

            {/* Direct Recipient Station (Editable directly inside Composer) */}
            <div className="px-4 py-2.5 bg-zinc-100/70 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider shrink-0 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-zinc-500" />
                  To:
                </span>
                <input
                  type="email"
                  value={prospectEmail}
                  onChange={(e) => setProspectEmail(e.target.value)}
                  placeholder="Enter prospect recipient email (e.g. emil@callview.ai)"
                  className="w-full text-xs font-mono font-medium rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-zinc-900 shadow-2xs"
                />
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] text-zinc-400 font-semibold uppercase">Quick Fill:</span>
                <button
                  type="button"
                  onClick={() => setProspectEmail('emil@callview.ai')}
                  className={`text-[10px] font-mono px-2 py-1 rounded-md font-bold transition-all border cursor-pointer ${
                    prospectEmail === 'emil@callview.ai'
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xs'
                      : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                  }`}
                  title="Target callview.ai test email"
                >
                  emil@callview.ai
                </button>
                <button
                  type="button"
                  onClick={() => setProspectEmail('emil@appointmentlyy.com')}
                  className={`text-[10px] font-mono px-2 py-1 rounded-md font-bold transition-all border cursor-pointer ${
                    prospectEmail === 'emil@appointmentlyy.com'
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                  title="Target GoDaddy inbox"
                >
                  emil@appointmentlyy.com
                </button>
              </div>
            </div>

            {/* Sub-header: Subject Line Station */}
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 space-y-3">
              
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Subject:
                  </span>
                  <span className="text-xs font-bold font-mono text-zinc-900 bg-white px-2.5 py-1 rounded-md border border-zinc-200">
                    {activeSubjectText}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                    {activeSubjectText.trim().split(/\s+/).length}/3 Words
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowSubjectIdeaBox(!showSubjectIdeaBox)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-zinc-200 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 transition-colors shadow-2xs"
                  >
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    <span>AI Subject Variations</span>
                    {showSubjectIdeaBox ? <ChevronUp className="h-3 w-3 ml-0.5" /> : <ChevronDown className="h-3 w-3 ml-0.5" />}
                  </button>

                  <button
                    onClick={() => copyToClipboard(activeSubjectText, 'subject')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-zinc-200 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 transition-colors shadow-2xs"
                  >
                    {copiedKey === 'subject' ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 text-zinc-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 3 Subject Line Options Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {currentDraft.subjectLines.map((s, idx) => {
                  const words = (s.text || '').trim().split(/\s+/).filter(Boolean);
                  const wordLen = words.length;
                  const isSelected = selectedSubjectIdx === idx;

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedSubjectIdx(idx)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xs ring-1 ring-zinc-900'
                          : 'bg-white hover:bg-zinc-100 text-zinc-800 border-zinc-200/90'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          isSelected ? 'text-amber-400' : 'text-zinc-500'
                        }`}>
                          {s.label}
                        </span>
                        <span className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold ${
                          wordLen <= 3 
                            ? (isSelected ? 'bg-emerald-950 text-emerald-300' : 'bg-emerald-100 text-emerald-800')
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {wordLen}/3 words
                        </span>
                      </div>
                      <div className="font-mono text-xs font-bold truncate">
                        {s.text}
                      </div>
                      <div className={`text-[10px] mt-0.5 line-clamp-1 ${
                        isSelected ? 'text-zinc-300' : 'text-zinc-400'
                      }`}>
                        {s.angle}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Expandable Subject Line AI Generator Box */}
              {showSubjectIdeaBox && (
                <div className="p-3.5 rounded-xl bg-white border border-amber-200 shadow-2xs space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      <span>Custom Subject Line Generator</span>
                    </span>
                    <span className="text-[10px] font-mono text-amber-900 font-semibold">
                      Max 3 Words Rule
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={subjectLineIdea}
                      onChange={(e) => setSubjectLineIdea(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAnalyzeSubjectIdea();
                        }
                      }}
                      placeholder="e.g. broker margin leaks, 65 seats scaling, rep objection freeze..."
                      className="flex-1 text-xs py-2 px-3 rounded-lg border border-zinc-300 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-zinc-900"
                    />
                    <button
                      type="button"
                      onClick={() => handleAnalyzeSubjectIdea()}
                      disabled={isAnalyzingSubjectIdea || !subjectLineIdea.trim()}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors shrink-0 shadow-2xs"
                    >
                      {isAnalyzingSubjectIdea ? (
                        <>
                          <RotateCw className="h-3.5 w-3.5 animate-spin text-amber-300" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                          <span>Generate 3 Subjects</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Quick Inspiration Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-zinc-400 font-medium">Quick Ideas:</span>
                    {[
                      'broker margin leak',
                      '65 seat scale',
                      'lead list fatigue',
                      'rep freeze rate',
                      'quick question',
                      'direct contract win'
                    ].map((pill, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => {
                          setSubjectLineIdea(pill);
                          handleAnalyzeSubjectIdea(pill);
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 transition-colors font-mono"
                      >
                        {pill}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Email Body Canvas & View Switcher */}
            <div className="p-5 flex-1 flex flex-col space-y-4">
              
              <div className="flex items-center justify-between">
                {/* View Switcher Tabs */}
                <div className="flex items-center gap-1 p-0.5 bg-zinc-100 rounded-lg border border-zinc-200/80">
                  <button
                    onClick={() => setViewMode('compose')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                      viewMode === 'compose'
                        ? 'bg-white text-zinc-900 shadow-2xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Composer</span>
                  </button>
                  <button
                    onClick={() => setViewMode('breakdown')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                      viewMode === 'breakdown'
                        ? 'bg-white text-zinc-900 shadow-2xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    <Layers className="h-3.5 w-3.5 text-amber-600" />
                    <span>Structure Analysis</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleManualSanitize}
                    className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-semibold flex items-center gap-1 border border-zinc-200 transition-colors shadow-2xs cursor-pointer"
                    title="Auto-format email into clean spaced paragraphs and remove stray emojis/em-dashes"
                  >
                    <AlignLeft className="h-3.5 w-3.5 text-zinc-600" />
                    <span>{copiedKey === 'sanitized' ? '✓ Paragraphs Formatted' : 'Auto-Format Paragraphs'}</span>
                  </button>
                  <button
                    onClick={() => copyToClipboard(editableBody, 'body')}
                    className="text-[11px] text-zinc-700 hover:text-zinc-950 font-semibold flex items-center gap-1"
                  >
                    {copiedKey === 'body' ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Body Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 text-zinc-400" />
                        <span>Copy Body</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* View 1: Direct Clean Composer */}
              {viewMode === 'compose' ? (
                <div className="relative flex-1">
                  <textarea
                    rows={8}
                    value={editableBody}
                    onChange={(e) => setEditableBody(e.target.value)}
                    className="w-full h-full min-h-[200px] text-sm font-sans rounded-xl border border-zinc-200/90 p-4 text-zinc-900 bg-zinc-50/30 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-zinc-900 leading-relaxed tracking-normal"
                    placeholder="Synthesizing email body..."
                  />
                </div>
              ) : (
                /* View 2: Structural Breakdown / Why this converts */
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-3 text-xs flex-1">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200/80">
                    <span className="font-bold text-zinc-900 uppercase tracking-wider text-[11px]">
                      Diagnostic Structural Breakdown ({activeFramework.name})
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Psychological Hook Mechanics
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-2.5 rounded-lg bg-white border border-blue-100 space-y-0.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1">
                        <span>1. The Trigger / Intel Observation:</span>
                      </div>
                      <p className="text-zinc-700 text-xs">
                        {currentDraft.structuralBreakdown?.triggerOrHook || 'Observes company tech stack or headcount scale.'}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-amber-100 space-y-0.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                        <span>2. The Tension / Hidden Friction:</span>
                      </div>
                      <p className="text-zinc-700 text-xs">
                        {currentDraft.structuralBreakdown?.tensionOrObservation || 'Exposes the margin loss or rep objection stall.'}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-emerald-100 space-y-0.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                        <span>3. The Truth / Operational Reality:</span>
                      </div>
                      <p className="text-zinc-700 text-xs">
                        {currentDraft.structuralBreakdown?.truthOrValue || 'Why old playbooks fail and what fixes it in 150ms live.'}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-purple-100 space-y-0.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-purple-800 flex items-center gap-1">
                        <span>4. The Anti-Sales CTA:</span>
                      </div>
                      <p className="text-zinc-700 text-xs">
                        {currentDraft.structuralBreakdown?.ctaSentence || 'Permission-based low-friction ask giving an easy out.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 1-Click Anti-Sales CTA Switcher */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="h-3 w-3 text-amber-500" />
                    <span>Quick-Swap Closing CTA (Click to insert):</span>
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    Gives prospect easy out
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {currentDraft.ctaVariations.map((cta, idx) => {
                    const isSelected = selectedCtaIdx === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedCtaIdx(idx);
                          // Replace last sentence or append
                          const sentences = editableBody.trim().split(/(?<=[.?!])\s+/);
                          if (sentences.length > 1) {
                            sentences[sentences.length - 1] = cta.text;
                            setEditableBody(sentences.join('\n\n'));
                          } else {
                            setEditableBody(`${editableBody.trim()}\n\n${cta.text}`);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-amber-50/80 border-amber-300 text-amber-950 ring-1 ring-amber-300 shadow-2xs'
                            : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                            {cta.label}
                          </span>
                          {isSelected && <Check className="h-3 w-3 text-amber-600" />}
                        </div>
                        <p className="text-[11px] line-clamp-2 leading-relaxed">
                          {cta.text}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Master Action Dock (Sticky Bottom) */}
            <div className="p-4 px-5 bg-zinc-50 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="text-[11px]">
                  Sender: <strong className="text-zinc-800 font-mono">{senderFrom}</strong> &rarr; Target: <strong className="text-zinc-800 font-mono">{prospectEmail || 'Not set'}</strong>
                </span>
                {directSendStatus && (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                    directSendStatus.startsWith('Error')
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    {directSendStatus.startsWith('Error') ? (
                      <AlertTriangle className="h-3 w-3 text-rose-600 shrink-0" />
                    ) : (
                      <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                    )}
                    <span>{directSendStatus}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleDirectSendEmail}
                  disabled={isSendingDirectEmail}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                  title={`Dispatch live email from ${senderFrom} to ${prospectEmail}`}
                >
                  {isSendingDirectEmail ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Send as {senderDisplayName}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleOpenMailto}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-zinc-100 text-zinc-800 transition-colors border border-zinc-200 shadow-2xs"
                  title="Open prefilled draft in your default email client"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Open in Mail</span>
                </button>

                <button
                  onClick={handleCopyEntireEmail}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-950 hover:bg-zinc-800 text-white transition-all shadow-md group cursor-pointer"
                >
                  {copiedKey === 'entire_email' ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-zinc-300 group-hover:scale-110 transition-transform" />
                      <span>Copy All</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 ml-1">
                        Ctrl+Shift+C
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

          {/* Manual Send Workflow Guideline */}
          <div className="p-3.5 rounded-xl bg-white border border-zinc-200/80 shadow-2xs text-xs text-zinc-600 flex items-start gap-3">
            <div className="h-7 w-7 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center shrink-0 mt-0.5">
              <Compass className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <strong className="text-zinc-900 font-semibold">Standard SDR Sending Sequence:</strong>
              <p className="text-[11px] leading-relaxed text-zinc-500">
                1. Copy Email • 2. Paste into Gmail or Outlook • 3. Stagger send by <strong>2 to 4 minutes</strong> from prior message • 4. Stay under <strong>40 manual sends/day</strong> to guarantee maximum domain reputation.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. DELIVERABILITY RADAR & SENDING PLAYBOOK DRAWER / MODAL                 */}
      {/* ========================================================================= */}
      {isPlaybookDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200 flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-900">
                    Cold Email Deliverability Radar &amp; Playbook
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Timing science &amp; safe account sending volume to protect your personal domain health.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPlaybookDrawerOpen(false)}
                className="h-8 w-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs text-zinc-700">
              
              {/* Live Recipient Timezone Hub Clocks */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold uppercase tracking-wider text-zinc-900 text-[11px] flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Global Recipient Timezone Clocks (Live)</span>
                  </h3>
                  <span className="text-[10px] text-zinc-400">
                    Calculate recipient local time before sending
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    { label: 'New York (EST)', tz: 'EST', note: 'US East Outbound' },
                    { label: 'San Francisco (PST)', tz: 'PST', note: 'US West Tech' },
                    { label: 'London (GMT)', tz: 'GMT', note: 'UK & Europe' },
                    { label: 'Sydney (AEST)', tz: 'AEST', note: 'Australia' },
                    { label: 'Manila (PHT)', tz: 'PHT', note: 'BPO Ops Floor' }
                  ].map((hub) => (
                    <div key={hub.tz} className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                      <div className="text-[10px] font-bold text-zinc-500 uppercase truncate">
                        {hub.label}
                      </div>
                      <div className="text-base font-mono font-bold text-zinc-900">
                        {currentTimes[hub.tz] || '--:--'}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">
                        {hub.note}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3 Pillars Grid: Days, Times, Limits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. Best Days */}
                <div className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200 space-y-2.5">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                    <Calendar className="h-4 w-4 text-amber-600" />
                    <span>Best Sending Days</span>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200/80">
                      <strong className="text-emerald-950 block">Tuesday - Thursday (Optimal)</strong>
                      <span className="text-emerald-800">32% higher response rate. Execs have cleared Monday fire drills.</span>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-200/80">
                      <strong className="text-amber-950 block">Sunday Evening (Secret Window)</strong>
                      <span className="text-amber-800">6:30 - 8:30 PM local. Execs review inbox before Monday with 0 competitor noise.</span>
                    </div>
                    <div className="p-2 rounded-lg bg-zinc-100 border border-zinc-200">
                      <strong className="text-zinc-800 block">Monday / Friday (Avoid)</strong>
                      <span className="text-zinc-500">Mon morning is triage overload; Friday afternoon emails get swept into trash.</span>
                    </div>
                  </div>
                </div>

                {/* 2. Best Times */}
                <div className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200 space-y-2.5">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span>Peak Sending Times</span>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200/80">
                      <strong className="text-emerald-950 block">8:15 AM - 10:00 AM (Coffee Window)</strong>
                      <span className="text-emerald-800">3.4x open rate when caught right as executives open laptop before meeting blocks.</span>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-50 border border-blue-200/80">
                      <strong className="text-blue-950 block">1:30 PM - 2:30 PM (Post-Lunch Lull)</strong>
                      <span className="text-blue-800">Fast inbox check upon desk return before afternoon deep work.</span>
                    </div>
                    <div className="p-2 rounded-lg bg-zinc-100 border border-zinc-200">
                      <strong className="text-zinc-800 block">Rule of Thumb</strong>
                      <span className="text-zinc-500">Never send without confirming the recipient's local time zone.</span>
                    </div>
                  </div>
                </div>

                {/* 3. Account Safety */}
                <div className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200 space-y-2.5">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>Safe Account Limits</span>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div className="p-2.5 rounded-lg bg-emerald-100/50 border border-emerald-300">
                      <div className="font-bold text-emerald-950 text-xs">Safe Daily Manual Volume:</div>
                      <div className="text-base font-mono font-bold text-emerald-800">30 - 50 emails/day</div>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-zinc-200">
                      <strong className="text-zinc-900 block">Stagger Rule:</strong>
                      <span className="text-zinc-600">Space manual sends by <strong>2 to 4 minutes</strong>. Never blast 10 in 60 seconds.</span>
                    </div>
                    <div className="p-2 rounded-lg bg-zinc-100 text-[10px] text-zinc-500">
                      <strong>Ramp Plan:</strong> Wk 1: 10/day • Wk 2: 20/day • Wk 3: 35/day • Wk 4+: 45-50/day max.
                    </div>
                  </div>
                </div>

              </div>

            </div>

            <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex justify-end">
              <button
                onClick={() => setIsPlaybookDrawerOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-white font-bold text-xs hover:bg-zinc-800 transition-colors"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. EDIT PROSPECT DETAILS MODAL                                            */}
      {/* ========================================================================= */}
      {isProspectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-zinc-200 flex flex-col">
            
            <div className="p-4 px-5 border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-zinc-600" />
                <h3 className="text-sm font-bold text-zinc-900">
                  Edit Target Prospect Context
                </h3>
              </div>
              <button
                onClick={() => setIsProspectModalOpen(false)}
                className="h-7 w-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 flex items-center justify-center transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                    Prospect Name
                  </label>
                  <input
                    type="text"
                    value={prospectName}
                    onChange={(e) => setProspectName(e.target.value)}
                    className="w-full text-xs rounded-lg border border-zinc-300 p-2 text-zinc-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={prospectCompany}
                    onChange={(e) => setProspectCompany(e.target.value)}
                    className="w-full text-xs rounded-lg border border-zinc-300 p-2 text-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                  Job Title / Seniority
                </label>
                <input
                  type="text"
                  value={prospectTitle}
                  onChange={(e) => setProspectTitle(e.target.value)}
                  className="w-full text-xs rounded-lg border border-zinc-300 p-2 text-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    value={prospectEmail}
                    onChange={(e) => setProspectEmail(e.target.value)}
                    className="w-full text-xs rounded-lg border border-zinc-300 p-2 text-zinc-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                    Seat Scale / Headcount
                  </label>
                  <input
                    type="text"
                    value={prospectHeadcount}
                    onChange={(e) => setProspectHeadcount(e.target.value)}
                    className="w-full text-xs rounded-lg border border-zinc-300 p-2 text-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                  Tech Stack (Optional Intelligence)
                </label>
                <input
                  type="text"
                  value={prospectTech}
                  onChange={(e) => setProspectTech(e.target.value)}
                  placeholder="e.g. Apollo.io & HubSpot"
                  className="w-full text-xs rounded-lg border border-zinc-300 p-2 text-zinc-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                  Primary Pain Point / Operational Bottleneck
                </label>
                <textarea
                  rows={2}
                  value={prospectPain}
                  onChange={(e) => setProspectPain(e.target.value)}
                  className="w-full text-xs rounded-lg border border-zinc-300 p-2 text-zinc-900 resize-none"
                />
              </div>
            </div>

            <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex justify-end gap-2">
              <button
                onClick={handleApplyProspectChanges}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-white font-bold text-xs hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Apply Changes
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. UPLOAD CSV MODAL INTEGRATION                                           */}
      {/* ========================================================================= */}
      <UploadLeadsCsvModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onLeadsImported={handleLeadsImported}
      />

    </div>
  );
}
