'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Mail, 
  Sparkles, 
  Copy, 
  Check, 
  Send, 
  RotateCw, 
  User, 
  Building, 
  Upload, 
  Inbox, 
  Loader2, 
  AlignLeft, 
  ChevronDown, 
  ChevronUp, 
  PlusCircle, 
  ShieldCheck, 
  AlertTriangle,
  Lightbulb,
  BookOpen,
  FileText
} from 'lucide-react';
import { saveEmailToStore, getConversationThreadKey } from '@/lib/emailStore';
import { 
  COLD_EMAIL_FRAMEWORKS, 
  COLD_EMAIL_IDEA_PRESETS, 
  ColdEmailGeneratedDraft, 
  formatEmailToParagraphs, 
  getDeterministicColdEmail, 
  enforceMaxThreeWords, 
  suggestSubjectLinesFromIdea, 
  sanitizeColdEmail 
} from '@/lib/coldEmailStudio';
import { DEMO_CADENCE_LEADS, CadenceLeadRecord } from '@/lib/cadenceMaster';
import UploadLeadsCsvModal from '@/components/cockpit/UploadLeadsCsvModal';
import { useSession } from '@/lib/session';

export default function ColdEmailStudio() {
  const { session } = useSession();

  // Dynamic verified sender from session
  const senderDisplayName = session?.repName || 'Emil Halili';
  const senderEmailRaw = session?.email || 'emil@appointmentlyy.com';
  const verifiedSenderEmail = senderEmailRaw.toLowerCase().endsWith('@appointmentlyy.com')
    ? senderEmailRaw
    : 'emil@appointmentlyy.com';
  const senderFrom = `${senderDisplayName} <${verifiedSenderEmail}>`;

  // Leads & Cadence Queue State
  const [leads, setLeads] = useState<CadenceLeadRecord[]>(DEMO_CADENCE_LEADS);
  const [selectedLeadIndex, setSelectedLeadIndex] = useState<number>(0);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState<boolean>(false);

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

  // AI Framework & Angle State
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string>('braun-poke-the-bear');
  const [userIdea, setUserIdea] = useState<string>(
    'Following up after our call. Saw you are scaling outbound reps—wanted to share how we feed consultative rebuttals in 150ms live on the dial without burning shared lead lists.'
  );

  // Subject Line State
  const [subjectText, setSubjectText] = useState<string>('quick question');
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState<boolean>(false);
  const [subjectSuggestions, setSubjectSuggestions] = useState<string[]>([
    'quick question',
    'outbound hold rate',
    'caller margin leak'
  ]);

  // Draft & Composer State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [editableBody, setEditableBody] = useState<string>(() => 
    `Hi Emil,\n\nFollowing up after our call. Saw Callview AI is scaling outbound seats. Typically when BPO leaders scale outbound, the hidden leak is not lead volume, it is callers getting chopped on price by commodity competitors.\n\nTraditional coaching fails when reps freeze in the first 20 seconds. We feed consultative rebuttals in 150 milliseconds live on the dial.\n\nOpen to a 2-minute video showing how we insulate margins, or totally off base?`
  );

  // Send & UI State
  const [isSendingDirectEmail, setIsSendingDirectEmail] = useState<boolean>(false);
  const [sendButtonState, setSendButtonState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [directSendStatus, setDirectSendStatus] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Sync stored CSV leads on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sdr_active_csv_leads');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLeads(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not load stored CSV leads:', e);
    }
  }, []);

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

    // Persist confirmed email back to active lead record globally
    if (leads.length > 0 && selectedLeadIndex >= 0 && selectedLeadIndex < leads.length) {
      const updated = [...leads];
      updated[selectedLeadIndex] = {
        ...updated[selectedLeadIndex],
        email: newEmail
      };
      setLeads(updated);
      try {
        localStorage.setItem('sdr_active_csv_leads', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not persist lead email update:', e);
      }
    }
  };

  // Switch prospect from lead queue
  const handleSelectLeadFromQueue = (index: number) => {
    setSelectedLeadIndex(index);
    if (index >= 0 && leads[index]) {
      const l = leads[index];
      const leadEmail = l.email || `${(l.name || 'contact').toLowerCase().replace(/\s+/g, '.')}@${(l.company || 'company').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
      setProspectEmailState(leadEmail);
      setProspectName(l.name || 'Decision Maker');
      setProspectCompany(l.company || 'Target Company');
      setProspectTitle(l.title || 'Director of Operations');
      setSendButtonState('idle');
      if (typeof window !== 'undefined') {
        localStorage.setItem('sdr_target_recipient_email', leadEmail);
      }
    }
  };

  // Start a blank fresh email for a new prospect confirmed on phone
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

  // Format paragraphs cleanly
  const handleAutoFormat = () => {
    const { cleanText } = sanitizeColdEmail(editableBody);
    const formatted = formatEmailToParagraphs(cleanText).join('\n\n');
    setEditableBody(formatted);
    setCopiedKey('formatted');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Copy helpers
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

  // Direct Live Dispatch with strict double-send prevention
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

  // Word count & metrics
  const wordCount = editableBody.trim().split(/\s+/).filter(Boolean).length;
  const subjectWordCount = subjectText.trim().split(/\s+/).filter(Boolean).length;
  const activeFramework = COLD_EMAIL_FRAMEWORKS.find(f => f.id === selectedFrameworkId) || COLD_EMAIL_FRAMEWORKS[0];

  return (
    <div className="min-h-full bg-zinc-50/80 p-4 sm:p-6 lg:p-8 space-y-6 text-zinc-900">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & QUEUE NAVIGATION                                          */}
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
            Personalized outbound outreach with verified live deliverability and instant inbox threading.
          </p>
        </div>

        {/* Lead Queue Switcher & Navigation */}
        <div className="flex items-center gap-2 flex-wrap">
          {leads.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-500 font-medium hidden md:inline">Lead:</span>
              <select
                value={selectedLeadIndex}
                onChange={(e) => handleSelectLeadFromQueue(Number(e.target.value))}
                className="text-xs font-medium rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-zinc-800 shadow-2xs focus:ring-1 focus:ring-zinc-900"
              >
                {leads.map((l, idx) => (
                  <option key={idx} value={idx}>
                    {l.name} &bull; {l.company}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleStartBlankEmail}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-zinc-300 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 transition-colors shadow-2xs"
            title="Start a fresh blank draft for a prospect you confirmed on the phone"
          >
            <PlusCircle className="h-3.5 w-3.5 text-zinc-500" />
            <span>New Email</span>
          </button>

          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-zinc-300 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 transition-colors shadow-2xs"
          >
            <Upload className="h-3.5 w-3.5 text-zinc-500" />
            <span>CSV Leads ({leads.length})</span>
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
      {/* 2. DUAL-PANE WORKSTATION                                                  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ======================================================================= */}
        {/* LEFT COLUMN: AI DRAFT ASSISTANT & ANGLE ENGINE (4 COLS)                 */}
        {/* ======================================================================= */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-white rounded-xl border border-zinc-200/90 shadow-2xs overflow-hidden">
            <div className="p-3.5 px-4 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  AI Draft Generator
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                1-Click Synthesis
              </span>
            </div>

            <div className="p-4 space-y-3.5">
              {/* Pitch Angle or Post-Call Follow-up Prompt */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 flex items-center justify-between">
                  <span>What is your offer or angle?</span>
                </label>
                <textarea
                  rows={4}
                  value={userIdea}
                  onChange={(e) => setUserIdea(e.target.value)}
                  placeholder="e.g. Following up after our call, wanted to share the 2-minute demo on live objection sparring for BPO setters..."
                  className="w-full text-xs font-sans rounded-lg border border-zinc-300 p-2.5 text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:ring-1 focus:ring-zinc-900 leading-relaxed resize-none shadow-2xs"
                />
              </div>

              {/* Quick Angle Starters */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Quick Angle Starters:
                </span>
                <div className="flex flex-wrap gap-1">
                  {[
                    { label: 'Post-Call Invite', idea: 'Following up as promised on our call. Wanted to share the 2-minute video on how we feed consultative rebuttals in 150ms live on dials.' },
                    { label: 'Quick Question', idea: 'Curious if you are seeing rep objection freeze on shared broker lists at your floor, or do callers hit quota in 72 hours?' },
                    { label: 'Broker Margin Leak', idea: 'Noticed agencies scaling outbound take on broker lists where middleman takes 60% while you carry 100% OPEX risk.' },
                    { label: 'Competitor Switch', idea: 'Saw you are running 50+ outbound seats on Apollo. Most BPO ops leaders tell us reps burn 400 contacts daily with zero live coaching.' }
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setUserIdea(preset.idea)}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors border border-zinc-200/80 font-medium"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Framework Style Selector */}
              <div className="space-y-1.5 pt-1 border-t border-zinc-100">
                <label className="text-xs font-semibold text-zinc-700">
                  Framework Style:
                </label>
                <select
                  value={selectedFrameworkId}
                  onChange={(e) => setSelectedFrameworkId(e.target.value)}
                  className="w-full text-xs font-semibold rounded-lg border border-zinc-300 bg-zinc-50/60 px-3 py-2 text-zinc-900 focus:ring-1 focus:ring-zinc-900 shadow-2xs"
                >
                  {COLD_EMAIL_FRAMEWORKS.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.category})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-zinc-500 leading-snug pt-0.5">
                  {activeFramework.description}
                </p>
              </div>

              {/* Generate Button */}
              <button
                type="button"
                onClick={handleGenerateDraft}
                disabled={isGenerating}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-950 text-white font-bold text-xs hover:bg-zinc-800 disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isGenerating ? (
                  <>
                    <RotateCw className="h-3.5 w-3.5 animate-spin text-amber-300" />
                    <span>Generating Draft...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>Generate Email Draft</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Clean Deliverability Checklist Card */}
          <div className="p-3.5 rounded-xl bg-white border border-zinc-200/90 shadow-2xs text-xs space-y-2">
            <span className="font-bold text-zinc-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Deliverability Guardrails</span>
            </span>
            <ul className="text-[11px] text-zinc-500 space-y-1 leading-relaxed">
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Zero em dashes and zero emojis enforced.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Subject line strictly under 4 words lowercase.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Permission-based closing lines giving prospect an easy out.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* ======================================================================= */}
        {/* RIGHT COLUMN: EXECUTIVE EMAIL COMPOSER WORKSTATION (8 COLS)             */}
        {/* ======================================================================= */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="bg-white rounded-xl border border-zinc-200/90 shadow-2xs overflow-hidden flex flex-col">
            
            {/* 1. Recipient Dossier Station (Free-hand Editable) */}
            <div className="p-4 bg-zinc-50/70 border-b border-zinc-200 space-y-3">
              
              {/* To Email & Target Details Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                
                {/* To: Email Input */}
                <div className="md:col-span-6 flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider w-8 shrink-0">
                    To:
                  </span>
                  <input
                    type="email"
                    value={prospectEmail}
                    onChange={(e) => handleRecipientEmailChange(e.target.value)}
                    placeholder="prospect@targetcompany.com"
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
                  <span className="text-xs font-medium text-zinc-400 shrink-0">Co:</span>
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
              <div className="flex items-center gap-2 pt-1 border-t border-zinc-200/60">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider w-8 shrink-0">
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
                    placeholder="Subject line (e.g. quick question)"
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
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-zinc-300 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 transition-colors shrink-0 shadow-2xs"
                    title="Toggle AI subject suggestions"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>Ideas</span>
                    {showSubjectSuggestions ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                </div>
              </div>

              {/* Subject Line Quick Suggestions Dropdown */}
              {showSubjectSuggestions && (
                <div className="p-2 rounded-lg bg-white border border-amber-200 shadow-2xs flex flex-wrap items-center gap-2 animate-in fade-in">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">Click to apply:</span>
                  {subjectSuggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSubjectText(s);
                        setShowSubjectSuggestions(false);
                        if (sendButtonState === 'sent') setSendButtonState('idle');
                      }}
                      className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors border border-zinc-200"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

            </div>

            {/* 2. Email Body Editor Canvas */}
            <div className="p-4 flex-1 flex flex-col space-y-3">
              
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span className="font-semibold text-zinc-700 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Email Content</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoFormat}
                    className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-semibold flex items-center gap-1 border border-zinc-200 transition-colors shadow-2xs cursor-pointer"
                    title="Auto-format spaced paragraphs"
                  >
                    <AlignLeft className="h-3 w-3 text-zinc-600" />
                    <span>{copiedKey === 'formatted' ? '✓ Formatted' : 'Auto-Format'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyBody}
                    className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-semibold flex items-center gap-1 border border-zinc-200 transition-colors shadow-2xs cursor-pointer"
                  >
                    {copiedKey === 'body' ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 text-zinc-500" />
                        <span>Copy Body</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Textarea Styled Like a Real Email */}
              <textarea
                rows={10}
                value={editableBody}
                onChange={(e) => {
                  setEditableBody(e.target.value);
                  if (sendButtonState === 'sent') setSendButtonState('idle');
                }}
                className="w-full flex-1 min-h-[220px] text-sm font-sans rounded-xl border border-zinc-300 p-4 text-zinc-900 bg-white focus:outline-hidden focus:ring-1 focus:ring-zinc-900 leading-relaxed shadow-2xs"
                placeholder="Write your email here..."
              />

              {/* Quick Closing Lines (1-Click Insert) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                  <span>Insert Closing Sentence:</span>
                  <span>Gives prospect easy out</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { label: 'Permission Video', text: 'Open to a 2-minute video showing how we insulate margins, or totally off base?' },
                    { label: 'Compare Notes', text: 'Would it be a terrible idea to compare notes for 2 minutes Thursday?' },
                    { label: 'Quick Question', text: 'Worth a quick 10-minute look, or is outbound already humming for you?' }
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
                      className="p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-left transition-colors"
                    >
                      <div className="text-[10px] font-bold text-zinc-700 uppercase">{cta.label}</div>
                      <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">{cta.text}</p>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* 3. Action Dock (Bottom Bar) */}
            <div className="p-4 px-5 bg-zinc-50 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="text-[11px]">
                  Sending as: <strong className="text-zinc-800 font-mono">{senderFrom}</strong>
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

              {/* Send Email and Copy Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleDirectSendEmail}
                  disabled={isSendingDirectEmail || sendButtonState === 'sent'}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
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
                      <span>Copy Email</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Upload CSV Leads Modal */}
      {isCsvModalOpen && (
        <UploadLeadsCsvModal
          isOpen={isCsvModalOpen}
          onClose={() => setIsCsvModalOpen(false)}
          onLeadsImported={(imported) => {
            if (imported.length > 0) {
              setLeads(imported);
              setSelectedLeadIndex(0);
              const first = imported[0];
              setProspectEmailState(first.email || 'prospect@targetcompany.com');
              setProspectName(first.name || 'Decision Maker');
              setProspectCompany(first.company || 'Target Company');
              setProspectTitle(first.title || 'Director of Operations');
              try {
                localStorage.setItem('sdr_active_csv_leads', JSON.stringify(imported));
              } catch (e) {
                console.warn('Could not cache CSV leads:', e);
              }
            }
          }}
        />
      )}

    </div>
  );
}
