'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Mail, 
  Sparkles, 
  Copy, 
  Check, 
  Send, 
  RotateCw, 
  Inbox, 
  Loader2, 
  AlignLeft, 
  ChevronDown, 
  ChevronUp, 
  PlusCircle, 
  ShieldCheck, 
  AlertTriangle,
  Clock,
  Calendar,
  Zap,
  Eye,
  Edit3,
  FileText,
  CheckCircle2,
  Info,
  HelpCircle
} from 'lucide-react';
import { saveEmailToStore, getConversationThreadKey } from '@/lib/emailStore';
import { 
  COLD_EMAIL_FRAMEWORKS, 
  COLD_EMAIL_IDEA_PRESETS, 
  MANUAL_COLD_EMAIL_GUIDANCE,
  formatEmailToParagraphs, 
  getDeterministicColdEmail, 
  sanitizeColdEmail 
} from '@/lib/coldEmailStudio';
import { useSession } from '@/lib/session';

// B2B spam trigger words list
const COMMON_SPAM_WORDS = [
  'guarantee', 'guaranteed', '100% free', 'risk-free', 'buy now', 
  'cheap', 'discount', 'act now', 'limited time', 'winner', 'cash bonus', 
  'miracle', 'no obligation', 'congratulations', 'pure profit', 'earn extra cash'
];

export default function ColdEmailStudio() {
  const { session } = useSession();

  // Dynamic verified sender from session
  const senderDisplayName = session?.repName || 'Emil Halili';
  const senderEmailRaw = session?.email || 'emil@appointmentlyy.com';
  const verifiedSenderEmail = senderEmailRaw.toLowerCase().endsWith('@appointmentlyy.com')
    ? senderEmailRaw
    : 'emil@appointmentlyy.com';
  const senderFrom = `${senderDisplayName} <${verifiedSenderEmail}>`;

  // Recipient / Prospect Free-Hand Inputs
  const [prospectEmail, setProspectEmailState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sdr_target_recipient_email');
      if (saved) return saved;
    }
    return 'emil@callview.ai';
  });

  const isCallviewDefault = prospectEmail.toLowerCase().includes('callview.ai');
  const [prospectName, setProspectName] = useState<string>(isCallviewDefault ? 'Emil Halili' : 'Julian Vance');
  const [prospectCompany, setProspectCompany] = useState<string>(isCallviewDefault ? 'Callview AI' : 'Apex Global BPO');
  const [prospectTitle, setProspectTitle] = useState<string>(isCallviewDefault ? 'Founder / CEO' : 'Director of Outbound Operations');

  // Sync stored CSV leads or URL query parameters on mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const toParam = params.get('to');
        const nameParam = params.get('name');
        const companyParam = params.get('company');
        const titleParam = params.get('title');
        if (toParam) {
          setProspectEmailState(toParam);
          localStorage.setItem('sdr_target_recipient_email', toParam);
        }
        if (nameParam) setProspectName(nameParam);
        if (companyParam) setProspectCompany(companyParam);
        if (titleParam) setProspectTitle(titleParam);
      }
    } catch (e) {
      console.warn('Could not read URL params:', e);
    }
  }, []);

  // Studio Mode: 'editor' | 'preview'
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');

  // Subject Line State
  const [subjectText, setSubjectText] = useState<string>('quick question');
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState<boolean>(false);
  const [subjectSuggestions, setSubjectSuggestions] = useState<string[]>([
    'quick question',
    'outbound hold rate',
    'caller margin leak',
    'rookie lead burn'
  ]);

  // Draft Body State
  const [editableBody, setEditableBody] = useState<string>(() => 
    `Hi Emil,\n\nFollowing up after our call. Saw Callview AI is scaling outbound seats. Typically when BPO leaders scale outbound, the hidden leak is not lead volume, it is callers getting chopped on price by commodity competitors.\n\nTraditional coaching fails when reps freeze in the first 20 seconds. We feed consultative rebuttals in 150 milliseconds live on the dial.\n\nOpen to a 2-minute video showing how we insulate margins, or totally off base?`
  );

  // AI Framework & Angle State (Optional Assistant)
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string>('braun-poke-the-bear');
  const [userIdea, setUserIdea] = useState<string>(
    'Following up after our call. Saw you are scaling outbound reps—wanted to share how we feed consultative rebuttals in 150ms live on the dial without burning shared lead lists.'
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showAiAssistant, setShowAiAssistant] = useState<boolean>(false);

  // Send & UI State
  const [isSendingDirectEmail, setIsSendingDirectEmail] = useState<boolean>(false);
  const [sendButtonState, setSendButtonState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [directSendStatus, setDirectSendStatus] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Deliverability Playbook Expansion State
  const [showPlaybookDetails, setShowPlaybookDetails] = useState<boolean>(false);

  // Update recipient email free-hand & persist to lead record
  const handleRecipientEmailChange = (newEmail: string) => {
    setProspectEmailState(newEmail);
    setSendButtonState('idle');
    if (typeof window !== 'undefined') {
      localStorage.setItem('sdr_target_recipient_email', newEmail);
    }

    // Smartly default name/company if pointing to Callview
    if (newEmail.toLowerCase().includes('callview.ai') && (!prospectName || prospectName === 'Julian Vance')) {
      setProspectName('Emil Halili');
      setProspectCompany('Callview AI');
      setProspectTitle('Founder / CEO');
    }
  };

  // Start a fresh blank email
  const handleStartBlankEmail = () => {
    setProspectEmailState('');
    setProspectName('');
    setProspectCompany('');
    setProspectTitle('');
    setSubjectText('');
    setEditableBody('');
    setSendButtonState('idle');
    setDirectSendStatus(null);
  };

  // Synthesize / Generate Draft using AI with Fallback
  const handleGenerateDraft = async () => {
    setIsGenerating(true);
    setSendButtonState('idle');
    try {
      const res = await fetch('/api/ai/cold-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frameworkId: selectedFrameworkId,
          userIdea: userIdea.trim(),
          prospect: {
            name: prospectName || 'Prospect',
            company: prospectCompany || 'Target Company',
            title: prospectTitle || 'Decision Maker'
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.draft) {
          const formatted = formatEmailToParagraphs(data.draft.body).join('\n\n');
          setEditableBody(formatted);
          if (data.draft.subjectLines && data.draft.subjectLines.length > 0) {
            setSubjectText(data.draft.subjectLines[0].text);
            setSubjectSuggestions(data.draft.subjectLines.map((s: any) => s.text));
          }
          return;
        }
      }

      // High-quality deterministic fallback
      const fallback = getDeterministicColdEmail(selectedFrameworkId, userIdea, {
        name: prospectName || 'Prospect',
        company: prospectCompany || 'Target Company',
        title: prospectTitle || 'Decision Maker'
      });
      setEditableBody(formatEmailToParagraphs(fallback.body).join('\n\n'));
      if (fallback.subjectLines.length > 0) {
        setSubjectText(fallback.subjectLines[0].text);
        setSubjectSuggestions(fallback.subjectLines.map(s => s.text));
      }
    } catch (e) {
      console.warn('AI generation fallback engaged:', e);
      const fallback = getDeterministicColdEmail(selectedFrameworkId, userIdea, {
        name: prospectName || 'Prospect',
        company: prospectCompany || 'Target Company',
        title: prospectTitle || 'Decision Maker'
      });
      setEditableBody(formatEmailToParagraphs(fallback.body).join('\n\n'));
    } finally {
      setIsGenerating(false);
    }
  };

  // Workshop Tool 1: Auto-Format Paragraphs
  const handleAutoFormat = () => {
    const { cleanText } = sanitizeColdEmail(editableBody);
    const formatted = formatEmailToParagraphs(cleanText).join('\n\n');
    setEditableBody(formatted);
    setCopiedKey('formatted');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Workshop Tool 2: Sanitize (Strip em dashes and emojis strictly)
  const handleSanitizeStrict = () => {
    const { cleanText } = sanitizeColdEmail(editableBody);
    setEditableBody(cleanText);
    setCopiedKey('sanitized');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Workshop Tool 3: Shorten Copy to < 65 Words
  const handleShortenCopy = () => {
    let text = editableBody
      .replace(/I hope you are doing well[.,]?\s*/gi, '')
      .replace(/I hope this email finds you well[.,]?\s*/gi, '')
      .replace(/I wanted to reach out to you because\s*/gi, '')
      .replace(/In case you were not already aware[.,]?\s*/gi, '')
      .trim();

    const paragraphs = formatEmailToParagraphs(text);
    if (paragraphs.length > 3) {
      text = [paragraphs[0], paragraphs[1], paragraphs[paragraphs.length - 1]].join('\n\n');
    }
    setEditableBody(text);
    setCopiedKey('shortened');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Copy Helpers
  const handleCopyBody = () => {
    navigator.clipboard.writeText(editableBody);
    setCopiedKey('body');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyEntireEmail = () => {
    const full = `Subject: ${subjectText}\n\n${editableBody}`;
    navigator.clipboard.writeText(full);
    setCopiedKey('full');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Live Dispatch via Resend API
  const handleDirectSendEmail = async () => {
    if (sendButtonState === 'sent' || isSendingDirectEmail) {
      return;
    }

    if (!prospectEmail || !prospectEmail.includes('@')) {
      setDirectSendStatus('Error: Please enter a valid recipient email address');
      return;
    }

    setIsSendingDirectEmail(true);
    setSendButtonState('sending');
    setDirectSendStatus(null);

    const activeSubject = subjectText.trim() || 'quick question';
    const bodyToSend = formatEmailToParagraphs(editableBody).join('\n\n');

    let effectiveName = prospectName.trim() || 'Prospect';
    let effectiveCompany = prospectCompany.trim() || 'Target Company';
    let effectiveTitle = prospectTitle.trim() || 'Decision Maker';

    if (prospectEmail.trim().toLowerCase().includes('callview.ai')) {
      effectiveName = 'Emil Halili';
      effectiveCompany = 'Callview AI';
      effectiveTitle = 'Founder / CEO';
    }

    const computedThreadId = getConversationThreadKey({
      direction: 'outbound',
      to: prospectEmail.trim(),
      from: senderFrom,
      subject: activeSubject
    });

    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: prospectEmail.trim(),
          from: senderFrom,
          subject: activeSubject,
          body: bodyToSend,
          leadName: effectiveName,
          leadCompany: effectiveCompany,
          leadTitle: effectiveTitle,
          threadId: computedThreadId
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.email) {
          saveEmailToStore(data.email);
        }
        setSendButtonState('sent');
        setDirectSendStatus(`Dispatched from ${senderFrom} to ${prospectEmail.trim()}`);
      } else {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.error || `Send failed (${res.status} ${res.statusText})`;
        setSendButtonState('idle');
        setDirectSendStatus(`Error: ${errMsg}`);
      }
    } catch (e: any) {
      setSendButtonState('idle');
      setDirectSendStatus(`Error: ${e.message || 'Network error'}`);
    } finally {
      setIsSendingDirectEmail(false);
    }
  };

  // Word count & quality calculations
  const wordCount = editableBody.trim().split(/\s+/).filter(Boolean).length;
  const subjectWordCount = subjectText.trim().split(/\s+/).filter(Boolean).length;
  const activeFramework = COLD_EMAIL_FRAMEWORKS.find(f => f.id === selectedFrameworkId) || COLD_EMAIL_FRAMEWORKS[0];

  // Spam Word Scanner
  const detectedSpamTriggers = useMemo(() => {
    const combined = `${subjectText} ${editableBody}`.toLowerCase();
    return COMMON_SPAM_WORDS.filter(w => combined.includes(w));
  }, [subjectText, editableBody]);

  return (
    <div className="min-h-full bg-zinc-50/80 p-4 sm:p-6 lg:p-8 space-y-6 text-zinc-900 font-sans">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & WORKBENCH CONTROLS                                        */}
      {/* ========================================================================= */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-bold shadow-2xs">
              <Mail className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-950">
              Cold Email Studio
            </h1>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5" title={`Sender: ${senderFrom}`}>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{senderDisplayName} &bull; appointmentlyy.com</span>
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Manual email drafting & workshopping laboratory with live deliverability guardrails.
          </p>
        </div>

        {/* Standalone Workshop Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleStartBlankEmail}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-zinc-300 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 transition-colors shadow-2xs cursor-pointer"
            title="Start a fresh blank draft"
          >
            <PlusCircle className="h-3.5 w-3.5 text-zinc-500" />
            <span>Blank Draft</span>
          </button>

          <Link
            href="/inbox"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-950 text-white hover:bg-zinc-800 transition-colors shadow-2xs"
          >
            <Inbox className="h-3.5 w-3.5 text-emerald-400" />
            <span>Unified Inbox</span>
          </Link>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. PROMINENT DELIVERABILITY & SENDING RULES PLAYBOOK (CARD SECTION)      */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-zinc-200/90 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 font-mono flex items-center gap-2">
                <span>Deliverability Radar & Safe Sending Limits</span>
                <span className="text-[10px] font-normal px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Strictly Enforced
                </span>
              </h2>
              <p className="text-xs text-zinc-500">
                Follow these timing rules and daily sending ceilings to guarantee 99%+ inbox placement and avoid domain burn.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowPlaybookDetails(!showPlaybookDetails)}
            className="text-xs font-semibold text-zinc-700 hover:text-zinc-950 flex items-center gap-1 underline cursor-pointer"
          >
            <span>{showPlaybookDetails ? 'Hide Full Breakdown' : 'View Full Schedule'}</span>
            {showPlaybookDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* 3 Core Rule Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          {/* Card 1: When to Send */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-900 flex items-center gap-1.5 font-mono text-[11px] uppercase">
                <Clock className="h-3.5 w-3.5 text-blue-600" />
                <span>When to Send</span>
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                Tue &bull; Wed &bull; Thu
              </span>
            </div>
            <p className="text-zinc-600 text-[11px] leading-relaxed">
              <strong>Peak Window:</strong> 8:15 AM – 10:00 AM &amp; 1:30 PM – 2:45 PM (Recipient's local time). Executives check inboxes at desk arrival and post-lunch.
            </p>
            <div className="pt-1 text-[10px] text-zinc-400">
              ❌ <strong>Avoid:</strong> Monday mornings (triage chaos) and Friday afternoons (weekend mental checkout).
            </div>
          </div>

          {/* Card 2: Daily Sending Limits */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-900 flex items-center gap-1.5 font-mono text-[11px] uppercase">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Daily Sending Ceilings</span>
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Max 40–50 / Day
              </span>
            </div>
            <p className="text-zinc-600 text-[11px] leading-relaxed">
              <strong>Safe Threshold:</strong> 40 to 50 cold emails per day per Google/Microsoft mailbox. Spammers blast 500; top SDRs send 45 tailored, high-converting notes.
            </p>
            <div className="pt-1 text-[10px] text-zinc-400">
              ⚠️ <strong>Warning:</strong> Blasting &gt;50/day risks automated ML spam flagging and blacklisting your root domain.
            </div>
          </div>

          {/* Card 3: Pacing & Anti-Spam Hygiene */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-900 flex items-center gap-1.5 font-mono text-[11px] uppercase">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span>Pacing &amp; Anti-Spam</span>
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                2–4 Min Stagger
              </span>
            </div>
            <p className="text-zinc-600 text-[11px] leading-relaxed">
              <strong>Stagger Rule:</strong> Space manual sends by 2 to 4 minutes. Never fire 10 emails in 60 seconds.
            </p>
            <div className="pt-1 text-[10px] text-zinc-400">
              🔒 <strong>Format:</strong> Plain text, zero emojis, zero em-dashes, and under 75 words.
            </div>
          </div>

        </div>

        {/* Detailed Ramp Schedule & Day Breakdown (Collapsible) */}
        {showPlaybookDetails && (
          <div className="pt-3 border-t border-zinc-100 space-y-3 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* Daily Ramp Schedule */}
              <div className="space-y-1.5">
                <span className="font-bold text-zinc-700 text-[11px] uppercase font-mono block">
                  New Mailbox Warming &amp; Ramp Plan
                </span>
                <div className="space-y-1">
                  {MANUAL_COLD_EMAIL_GUIDANCE.personalAccountSafety.rampSchedule.map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-200/70 text-[11px]">
                      <span className="font-bold text-zinc-800">{r.week}</span>
                      <span className="font-mono text-zinc-600 font-semibold">{r.dailyLimit} emails/day</span>
                      <span className="text-zinc-500 text-[10px]">{r.focus}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Day by Day Open Rate Intelligence */}
              <div className="space-y-1.5">
                <span className="font-bold text-zinc-700 text-[11px] uppercase font-mono block">
                  Day-by-Day Effectiveness Index
                </span>
                <div className="space-y-1">
                  {MANUAL_COLD_EMAIL_GUIDANCE.bestDays.slice(0, 4).map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-200/70 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-zinc-800">{d.day}:</span>
                        <span className="text-zinc-600 truncate max-w-[220px]">{d.reason}</span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded shrink-0 ${
                        d.rating === 'Optimal' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {d.rating}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. THE EMAIL WORKSHOP & COMPOSER WORKSTATION                              */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-xs overflow-hidden flex flex-col">
        
        {/* Workshop Navigation Header */}
        <div className="p-4 px-5 bg-zinc-50/80 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 font-mono">
              Email Workshop &amp; Polish Bench
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-200/80 text-zinc-700 font-semibold">
              Live Draft
            </span>
          </div>

          {/* View Mode Toggle: [Editor] vs [Inbox Preview] */}
          <div className="flex items-center gap-2">
            <div className="flex items-center p-0.5 bg-zinc-200/70 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('editor')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'editor'
                    ? 'bg-white text-zinc-950 shadow-2xs font-bold'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Workshop Editor</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'preview'
                    ? 'bg-white text-zinc-950 shadow-2xs font-bold'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Inbox Preview</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowAiAssistant(!showAiAssistant)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                showAiAssistant 
                  ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold' 
                  : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{showAiAssistant ? 'Close AI Frameworks' : 'AI Angles & Frameworks'}</span>
            </button>
          </div>
        </div>

        {/* AI Framework Assistant Drawer (Optional, expands above composer) */}
        {showAiAssistant && (
          <div className="p-5 bg-amber-50/40 border-b border-amber-200/80 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-950 font-mono">
                  B2B Angle &amp; Framework Engine
                </span>
              </div>
              <span className="text-[10px] text-amber-800 font-mono">
                Josh Braun 4T &bull; Chris Voss &bull; Allred 50-Word
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-4 space-y-1">
                <label className="text-[11px] font-bold text-zinc-700 block">
                  Select Sales Framework:
                </label>
                <select
                  value={selectedFrameworkId}
                  onChange={(e) => setSelectedFrameworkId(e.target.value)}
                  className="w-full text-xs font-semibold rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-zinc-900 shadow-2xs"
                >
                  {COLD_EMAIL_FRAMEWORKS.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-6 space-y-1">
                <label className="text-[11px] font-bold text-zinc-700 block">
                  Custom Angle or Post-Call Focus:
                </label>
                <input
                  type="text"
                  value={userIdea}
                  onChange={(e) => setUserIdea(e.target.value)}
                  placeholder="e.g. Following up after our call regarding sub-150ms live objection sparring..."
                  className="w-full text-xs rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-zinc-900 shadow-2xs"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={handleGenerateDraft}
                  disabled={isGenerating}
                  className="w-full py-2 px-3 rounded-xl bg-zinc-950 text-white font-bold text-xs hover:bg-zinc-800 transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                  <span>Generate</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* RECIPIENT & SUBJECT WORKBENCH ROW (100% Free-hand editable)              */}
        {/* ======================================================================= */}
        <div className="p-4 px-5 bg-white border-b border-zinc-200/80 space-y-3">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            {/* To: Email Input */}
            <div className="md:col-span-6 flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider w-8 shrink-0 font-mono">
                To:
              </span>
              <input
                type="email"
                value={prospectEmail}
                onChange={(e) => handleRecipientEmailChange(e.target.value)}
                placeholder="prospect@company.com"
                className="w-full text-xs font-mono font-bold rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:ring-1 focus:ring-zinc-900 shadow-2xs"
              />
            </div>

            {/* Contact Name Input */}
            <div className="md:col-span-3 flex items-center gap-1.5">
              <span className="text-xs font-medium text-zinc-400 shrink-0">Name:</span>
              <input
                type="text"
                value={prospectName}
                onChange={(e) => setProspectName(e.target.value)}
                placeholder="Contact name"
                className="w-full text-xs rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-zinc-900 focus:ring-1 focus:ring-zinc-900 shadow-2xs"
              />
            </div>

            {/* Company Name Input */}
            <div className="md:col-span-3 flex items-center gap-1.5">
              <span className="text-xs font-medium text-zinc-400 shrink-0">Company:</span>
              <input
                type="text"
                value={prospectCompany}
                onChange={(e) => setProspectCompany(e.target.value)}
                placeholder="Company name"
                className="w-full text-xs rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-zinc-900 focus:ring-1 focus:ring-zinc-900 shadow-2xs"
              />
            </div>

          </div>

          {/* Subject Line Row */}
          <div className="flex items-center gap-2 pt-2 border-t border-zinc-100">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider w-8 shrink-0 font-mono">
              Subj:
            </span>
            <div className="relative flex-1 flex items-center gap-2">
              <input
                type="text"
                value={subjectText}
                onChange={(e) => {
                  setSubjectText(e.target.value);
                  if (sendButtonState === 'sent') setSendButtonState('idle');
                }}
                placeholder="Subject line (strictly under 4 words, lowercase)"
                className="w-full text-xs font-mono font-bold rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:ring-1 focus:ring-zinc-900 shadow-2xs"
              />

              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                subjectWordCount <= 4 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {subjectWordCount}/3 words
              </span>

              <button
                type="button"
                onClick={() => setShowSubjectSuggestions(!showSubjectSuggestions)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-50 border border-zinc-300 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 transition-colors shrink-0 shadow-2xs cursor-pointer"
                title="Toggle subject suggestions"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Ideas</span>
                {showSubjectSuggestions ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            </div>
          </div>

          {/* Subject Suggestions Dropdown */}
          {showSubjectSuggestions && (
            <div className="p-2.5 rounded-lg bg-amber-50/50 border border-amber-200 shadow-2xs flex flex-wrap items-center gap-2 animate-in fade-in">
              <span className="text-[10px] text-zinc-500 font-bold uppercase font-mono">Click to insert:</span>
              {subjectSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSubjectText(s);
                    setShowSubjectSuggestions(false);
                    if (sendButtonState === 'sent') setSendButtonState('idle');
                  }}
                  className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-white hover:bg-zinc-100 text-zinc-800 transition-colors border border-zinc-200 shadow-2xs cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

        </div>

        {/* ======================================================================= */}
        {/* WORKSHOP CANVAS: EDITOR MODE VS INBOX PREVIEW MODE                       */}
        {/* ======================================================================= */}
        {viewMode === 'editor' ? (
          <div className="p-5 space-y-4">
            
            {/* Workshop Tool Bar (Shorten, Auto-format, Sanitize, Metrics) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pb-1">
              
              {/* Live Quality Metrics */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold border ${
                  wordCount >= 40 && wordCount <= 75
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : wordCount > 75
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                }`}>
                  {wordCount} words {wordCount >= 40 && wordCount <= 75 ? '✓ (Sweet Spot)' : wordCount > 75 ? '⚠️ (Trim copy)' : ''}
                </span>

                <span className="px-2 py-0.5 rounded-md font-mono text-[11px] bg-zinc-100 text-zinc-700 border border-zinc-200">
                  Grade 5 Conversational
                </span>

                {detectedSpamTriggers.length === 0 ? (
                  <span className="px-2 py-0.5 rounded-md font-mono text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>0 Spam Triggers</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md font-mono text-[11px] bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1 font-bold">
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    <span>Spam Trigger: "{detectedSpamTriggers[0]}"</span>
                  </span>
                )}
              </div>

              {/* Workshopping Quick Action Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleAutoFormat}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold flex items-center gap-1 border border-zinc-200 transition-colors cursor-pointer"
                  title="Format into clean spaced paragraphs"
                >
                  <AlignLeft className="w-3.5 h-3.5 text-zinc-600" />
                  <span>{copiedKey === 'formatted' ? '✓ Formatted' : 'Auto-Format'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShortenCopy}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold flex items-center gap-1 border border-zinc-200 transition-colors cursor-pointer"
                  title="Trim fluff words to reach under 65 words"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>{copiedKey === 'shortened' ? '✓ Shortened' : 'Make Shorter'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSanitizeStrict}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold flex items-center gap-1 border border-zinc-200 transition-colors cursor-pointer"
                  title="Strip em-dashes and emojis"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{copiedKey === 'sanitized' ? '✓ Sanitized' : 'Sanitize'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyBody}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold flex items-center gap-1 border border-zinc-200 transition-colors cursor-pointer"
                >
                  {copiedKey === 'body' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
                  <span>Copy</span>
                </button>
              </div>

            </div>

            {/* Email Body Textarea */}
            <textarea
              rows={10}
              value={editableBody}
              onChange={(e) => {
                setEditableBody(e.target.value);
                if (sendButtonState === 'sent') setSendButtonState('idle');
              }}
              className="w-full min-h-[220px] text-sm font-sans rounded-xl border border-zinc-300 p-4 text-zinc-950 bg-white focus:outline-hidden focus:ring-1 focus:ring-zinc-900 leading-relaxed shadow-2xs"
              placeholder="Write or workshop your cold email here..."
            />

            {/* 1-Click Closing CTA Swapper */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">
                <span>1-Click Closing Lines (Low-Friction Anti-Sales):</span>
                <span>Give prospect an easy out</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                {[
                  { label: 'Permission Video', text: 'Open to a 2-minute video showing how we insulate margins, or totally off base?' },
                  { label: 'Compare Notes', text: 'Would it be a terrible idea to compare notes for 2 minutes Thursday?' },
                  { label: 'Quick Question', text: 'Worth a quick 10-minute look, or is outbound already humming for you?' },
                  { label: 'Negative Reverse', text: 'If this is completely off your radar right now, no worries at all.' }
                ].map((cta, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const sentences = editableBody.trim().split(/(?<=[.?!])\s+/);
                      if (sentences.length > 1) {
                        sentences[sentences.length - 1] = cta.text;
                        setEditableBody(sentences.join('\n\n'));
                      } else {
                        setEditableBody(`${editableBody.trim()}\n\n${cta.text}`);
                      }
                      if (sendButtonState === 'sent') setSendButtonState('idle');
                    }}
                    className="p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-left transition-colors cursor-pointer"
                  >
                    <div className="text-[10px] font-bold text-zinc-800 uppercase font-mono">{cta.label}</div>
                    <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">{cta.text}</p>
                  </button>
                ))}
              </div>
            </div>

          </div>
        ) : (
          /* INBOX PREVIEW MODE: Mock Real Gmail / Outlook View */
          <div className="p-6 bg-zinc-100/60 flex justify-center">
            <div className="max-w-2xl w-full bg-white rounded-2xl border border-zinc-300 shadow-md p-6 space-y-4">
              
              {/* Mock Inbox Header */}
              <div className="border-b border-zinc-200 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-zinc-900">
                    {subjectText || '(No subject)'}
                  </h3>
                  <span className="text-[11px] font-mono text-zinc-400">
                    Inbox &bull; Primary
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-600">
                  <div>
                    <strong className="text-zinc-900 font-bold">{senderDisplayName}</strong> &lt;{verifiedSenderEmail}&gt;
                  </div>
                  <span className="text-zinc-400">Just now</span>
                </div>
                <div className="text-xs text-zinc-500">
                  to: <span className="font-mono">{prospectEmail}</span>
                </div>
              </div>

              {/* Formatted Rendered Email Body */}
              <div className="py-2 text-sm text-zinc-900 leading-relaxed font-sans space-y-3 whitespace-pre-wrap select-text">
                {editableBody}
              </div>

              {/* Mock Signature */}
              <div className="pt-4 border-t border-zinc-100 text-xs text-zinc-500 space-y-0.5">
                <div className="font-bold text-zinc-800">{senderDisplayName}</div>
                <div>Outbound Operations &bull; Appointmentlyy</div>
                <div className="text-zinc-400 font-mono text-[11px]">appointmentlyy.com</div>
              </div>

            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* ACTION DOCK & SEND ENGINE                                               */}
        {/* ======================================================================= */}
        <div className="p-4 px-5 bg-zinc-50 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="text-[11px]">
              Sending as: <strong className="text-zinc-900 font-mono">{senderFrom}</strong>
            </span>
            {directSendStatus && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${
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

          {/* Send Email and Copy Entire Email Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleDirectSendEmail}
              disabled={isSendingDirectEmail || sendButtonState === 'sent'}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                sendButtonState === 'sent'
                  ? 'bg-emerald-800 text-emerald-100 border border-emerald-700 cursor-not-allowed opacity-90'
                  : sendButtonState === 'sending'
                  ? 'bg-emerald-700 text-emerald-100 cursor-wait opacity-80'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-98'
              }`}
              title={
                sendButtonState === 'sent'
                  ? `Already dispatched to ${prospectEmail}. Edit draft or change recipient to send another.`
                  : `Dispatch live email from ${senderFrom} to ${prospectEmail}`
              }
            >
              {sendButtonState === 'sending' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : sendButtonState === 'sent' ? (
                <>
                  <Check className="h-4 w-4 text-emerald-300" />
                  <span>Sent!</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Email</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopyEntireEmail}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-zinc-950 hover:bg-zinc-800 text-white transition-all shadow-md cursor-pointer"
            >
              {copiedKey === 'full' ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-zinc-300" />
                  <span>Copy Entire Email</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
