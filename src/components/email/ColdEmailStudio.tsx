'use client';

import React, { useState, useEffect } from 'react';
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
  Briefcase
} from 'lucide-react';
import { 
  COLD_EMAIL_FRAMEWORKS, 
  COLD_EMAIL_IDEA_PRESETS, 
  MANUAL_COLD_EMAIL_GUIDANCE,
  ColdEmailFramework,
  ColdEmailGeneratedDraft,
  sanitizeColdEmail,
  getDeterministicColdEmail
} from '@/lib/coldEmailStudio';
import { CadenceLeadRecord } from '@/lib/cadenceMaster';

export default function ColdEmailStudio() {
  // Navigation & Framework State
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string>('braun-poke-the-bear');
  const [userIdea, setUserIdea] = useState<string>(
    'I want to tell a BPO operations director that their 250 SDRs are wasting 4 hours a day on dead leads from shared broker lists where competitors already called 5 times. I want to invite them to see how we qualify leads live without buying more bloated Apollo lists.'
  );

  // Prospect Context State
  const [leads, setLeads] = useState<CadenceLeadRecord[]>([]);
  const [selectedLeadIndex, setSelectedLeadIndex] = useState<number>(-1);
  const [prospectName, setProspectName] = useState<string>('Julian Vance');
  const [prospectCompany, setProspectCompany] = useState<string>('Apex BPO Solutions');
  const [prospectTitle, setProspectTitle] = useState<string>('VP of Outbound Operations');
  const [prospectTech, setProspectTech] = useState<string>('Apollo.io & HubSpot');
  const [prospectPain, setProspectPain] = useState<string>('reps fumbling price pushback on recycled broker lists');

  // Generation & Draft State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentDraft, setCurrentDraft] = useState<ColdEmailGeneratedDraft>(() => 
    getDeterministicColdEmail('braun-poke-the-bear', undefined, { name: 'Julian Vance', company: 'Apex BPO Solutions' })
  );
  const [selectedSubjectIdx, setSelectedSubjectIdx] = useState<number>(0);
  const [selectedCtaIdx, setSelectedCtaIdx] = useState<number>(0);
  const [editableBody, setEditableBody] = useState<string>(currentDraft.body);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // UI Control State
  const [showGuidance, setShowGuidance] = useState<boolean>(true);
  const [showProspectFields, setShowProspectFields] = useState<boolean>(false);

  // Load leads from localStorage on mount
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
          setProspectCompany(first.company || 'Apex BPO Solutions');
          setProspectTitle(first.title || 'VP of Outbound Operations');
          setProspectTech(first.techStack || 'Apollo.io & HubSpot');
          setProspectPain(first.painPoint || 'reps fumbling price pushback on recycled broker lists');
        }
      }
    } catch (e) {
      console.warn('Could not load stored CSV leads:', e);
    }
  }, []);

  // Update editable body when currentDraft changes
  useEffect(() => {
    setEditableBody(currentDraft.body);
    setSelectedSubjectIdx(currentDraft.selectedSubjectIndex);
    setSelectedCtaIdx(currentDraft.selectedCtaIndex);
  }, [currentDraft]);

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
            painPoint: prospectPain
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

  // Sanitize editable body manually
  const handleManualSanitize = () => {
    const { cleanText } = sanitizeColdEmail(editableBody);
    setEditableBody(cleanText);
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
    window.open(`mailto:?subject=${activeSubject}&body=${bodyEncoded}`, '_blank');
  };

  // Real-time compliance audit
  const wordCount = editableBody.trim().split(/\s+/).filter(Boolean).length;
  const emDashCount = (editableBody.match(/[—–]|(?<=\s)--(?:(?=\s)|$)|(?<=\w)--(?:(?=\w)|$)/g) || []).length;
  const emojiCount = (editableBody.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B50}\u{200D}\u{FE0F}]/gu) || []).length;
  const isCompliant = emDashCount === 0 && emojiCount === 0 && wordCount <= 85;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 text-zinc-900">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
              <Mail className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              Manual Cold Email AI Studio
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              0 Em Dashes • 0 Emojis Rule Enforced
            </span>
          </div>
          <p className="text-xs text-zinc-500">
            Synthesize concise, high-converting cold emails from your raw ideas using battle-tested sales frameworks (Josh Braun, Will Allred, Chris Voss, and Radical Transparency). Built for manual personal sends with strict deliverability guardrails.
          </p>
        </div>

        {/* Deliverability Timing Guidance Toggle */}
        <button
          onClick={() => setShowGuidance(!showGuidance)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors shrink-0 self-start md:self-auto"
        >
          <Clock className="h-3.5 w-3.5 text-amber-600" />
          <span>{showGuidance ? 'Hide Sending Hints' : 'View Best Days, Times & Safe Sending Limits'}</span>
          {showGuidance ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* STRATEGIC SENDING HINTS: BEST DAYS, BEST TIMES & PERSONAL ACCOUNT LIMITS   */}
      {/* ========================================================================= */}
      {showGuidance && (
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50/70 via-white to-amber-50/40 border border-amber-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-amber-100">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-amber-900 text-white text-xs font-bold">💡</span>
              <h2 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                Manual Cold Email Intelligence: Best Days, Times &amp; Safe Account Limits
              </h2>
            </div>
            <span className="text-[11px] text-amber-800 font-medium">
              Protects personal Google Workspace / Microsoft 365 domain health
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Best Days */}
            <div className="p-3 rounded-lg bg-white border border-amber-200/60 shadow-2xs space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                <Calendar className="h-3.5 w-3.5 text-amber-600" />
                <span>Best Days of the Week</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-start gap-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                    Tue - Thu
                  </span>
                  <span className="text-zinc-600 leading-tight">
                    <strong>Optimal window (32% higher replies).</strong> Executives cleared Monday emergencies and focus on operational solutions.
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
                    Sun Eve
                  </span>
                  <span className="text-zinc-600 leading-tight">
                    <strong>Secret high-yield window (6:30 - 8:30 PM).</strong> Executives clean inbox before Monday; 0 vendor inbox competition.
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 shrink-0">
                    Mon / Fri
                  </span>
                  <span className="text-zinc-500 leading-tight">
                    <strong>Avoid sending.</strong> Monday is triage overload; Friday afternoon emails get swept into Monday trash.
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Best Times */}
            <div className="p-3 rounded-lg bg-white border border-amber-200/60 shadow-2xs space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                <Clock className="h-3.5 w-3.5 text-amber-600" />
                <span>Best Time Slots (Recipient Time)</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-start gap-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                    8:15 - 10:00 AM
                  </span>
                  <span className="text-zinc-600 leading-tight">
                    <strong>Morning Coffee Check.</strong> 3.4x open rate when caught right before daily calendar fills with meetings.
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 shrink-0">
                    1:30 - 2:30 PM
                  </span>
                  <span className="text-zinc-600 leading-tight">
                    <strong>Post-Lunch Lull.</strong> Executives return to their desk and browse quick 50-word emails before afternoon blocks.
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-700 shrink-0">
                    Rule
                  </span>
                  <span className="text-zinc-500 leading-tight">
                    Always calculate the prospect's local time (e.g. Sydney AEST, London GMT, New York EST) before hitting send.
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Personal Account Safety Limits */}
            <div className="p-3 rounded-lg bg-white border border-amber-200/60 shadow-2xs space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Safe Personal Email Volume</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="p-1.5 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <span className="font-bold text-emerald-950">Max Daily Manual Volume:</span>
                  <span className="font-mono font-bold text-emerald-800 text-xs">30 - 50 emails/day</span>
                </div>
                <div className="flex items-start gap-1.5 text-zinc-600 leading-tight">
                  <span className="font-bold text-zinc-900 shrink-0">Stagger Rule:</span>
                  <span>Space manual sends by <strong>2 to 4 minutes</strong>. Never paste and fire 10 emails in 60 seconds.</span>
                </div>
                <div className="text-[10px] text-zinc-500 leading-tight bg-zinc-50 p-1.5 rounded border border-zinc-200">
                  <strong className="text-zinc-700">Ramp Strategy:</strong> Week 1: 10/day • Week 2: 20/day • Week 3: 35/day • Week 4+: 45-50/day max.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2-COLUMN STUDIO WORKBENCH                                                 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ======================================================================= */}
        {/* LEFT COLUMN: FRAMEWORK, IDEA BOX, PROSPECT (5 COLS)                     */}
        {/* ======================================================================= */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Framework Selector Card */}
          <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-zinc-600" />
                <span>1. Proven Email Framework</span>
              </label>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 font-semibold">
                {activeFramework.authorOrStyle}
              </span>
            </div>

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
              className="w-full text-xs font-medium rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-zinc-900"
            >
              {COLD_EMAIL_FRAMEWORKS.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.category})
                </option>
              ))}
            </select>

            <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/80 text-[11px] space-y-1">
              <p className="font-semibold text-zinc-900">{activeFramework.description}</p>
              <p className="text-zinc-500 italic">
                Anti-Sales Rule: {activeFramework.antiSalesPrinciple}
              </p>
            </div>
          </div>

          {/* THE IDEA BOX CARD (CORE USER REQUEST) */}
          <div className="p-4 rounded-xl bg-white border-2 border-zinc-900/10 hover:border-zinc-900/30 transition-colors shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                <span>2. The Idea Box (Your Strategy / Raw Angle)</span>
              </label>
              <span className="text-[10px] text-zinc-400 font-mono">
                AI grounds email in this
              </span>
            </div>

            <p className="text-[11px] text-zinc-500">
              Type your raw thought, pitch angle, or specific client bottleneck below. The AI will weave it into the selected framework with zero em dashes and zero emojis.
            </p>

            <textarea
              rows={4}
              value={userIdea}
              onChange={(e) => setUserIdea(e.target.value)}
              placeholder="e.g., I want to tell a BPO owner in Clark that their SDRs are wasting 4 hours a day on dead leads from shared lists, and invite them to see how we qualify leads live without buying more bloated Apollo lists..."
              className="w-full text-xs rounded-lg border border-zinc-300 p-2.5 text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-zinc-900 font-sans leading-relaxed"
            />

            {/* 1-Click Quick Idea Starters */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Quick Idea Starters (Click to load):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {COLD_EMAIL_IDEA_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectIdeaPreset(preset)}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium transition-colors border border-zinc-200/60 text-left"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Target Prospect & Context Card */}
          <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-zinc-600" />
                <span>3. Target Prospect Context</span>
              </label>
              <button
                onClick={() => setShowProspectFields(!showProspectFields)}
                className="text-[11px] text-zinc-500 hover:text-zinc-900 font-medium underline"
              >
                {showProspectFields ? 'Hide Details' : 'Edit Details'}
              </button>
            </div>

            {leads.length > 0 && (
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-500">Pick from loaded CSV Leads:</label>
                <select
                  value={selectedLeadIndex}
                  onChange={(e) => handleSelectLead(Number(e.target.value))}
                  className="w-full text-xs rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-zinc-800"
                >
                  <option value={-1}>Custom Prospect (manual entry)</option>
                  {leads.slice(0, 25).map((l, idx) => (
                    <option key={idx} value={idx}>
                      {l.name} • {l.company} ({l.title || 'Executive'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-[11px] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-900">{prospectName}</span>
                <span className="text-zinc-500 font-mono text-[10px]">{prospectTitle}</span>
              </div>
              <div className="text-zinc-600">
                Company: <strong className="text-zinc-800">{prospectCompany}</strong>
              </div>
              <div className="text-zinc-500 text-[10px]">
                Bottleneck: {prospectPain}
              </div>
            </div>

            {showProspectFields && (
              <div className="space-y-2 pt-2 border-t border-zinc-100 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-zinc-500">Name</label>
                    <input
                      type="text"
                      value={prospectName}
                      onChange={(e) => setProspectName(e.target.value)}
                      className="w-full text-xs rounded border border-zinc-300 p-1.5 text-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-zinc-500">Company</label>
                    <input
                      type="text"
                      value={prospectCompany}
                      onChange={(e) => setProspectCompany(e.target.value)}
                      className="w-full text-xs rounded border border-zinc-300 p-1.5 text-zinc-800"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-zinc-500">Job Title</label>
                  <input
                    type="text"
                    value={prospectTitle}
                    onChange={(e) => setProspectTitle(e.target.value)}
                    className="w-full text-xs rounded border border-zinc-300 p-1.5 text-zinc-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-zinc-500">Primary Bottleneck / Pain Point</label>
                  <input
                    type="text"
                    value={prospectPain}
                    onChange={(e) => setProspectPain(e.target.value)}
                    className="w-full text-xs rounded border border-zinc-300 p-1.5 text-zinc-800"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action / Synthesize Button */}
          <button
            onClick={handleSynthesizeEmail}
            disabled={isGenerating}
            className="w-full py-3 rounded-xl bg-zinc-900 text-white font-bold text-xs hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-2xs flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <RotateCw className="h-4 w-4 animate-spin" />
                <span>Synthesizing Cold Email with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>Synthesize Cold Email from Idea Box</span>
              </>
            )}
          </button>
        </div>

        {/* ======================================================================= */}
        {/* RIGHT COLUMN: AI EMAIL CANVAS, SUBJECTS, BODY & CTA (7 COLS)            */}
        {/* ======================================================================= */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Email Canvas Container */}
          <div className="p-5 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-5">
            
            {/* Top Toolbar & Compliance Badges */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-zinc-900">
                  {currentDraft.frameworkUsed}
                </span>
              </div>

              {/* Strict Compliance Badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                  emDashCount === 0 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {emDashCount === 0 ? '✓ 0 Em Dashes' : `⚠ ${emDashCount} Em Dashes`}
                </span>
                
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                  emojiCount === 0 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {emojiCount === 0 ? '✓ 0 Emojis' : `⚠ ${emojiCount} Emojis`}
                </span>

                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                  wordCount <= 75 
                    ? 'bg-blue-50 text-blue-800 border-blue-200' 
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {wordCount} Words ({currentDraft.readingGradeLevel})
                </span>
              </div>
            </div>

            {/* =================================================================== */}
            {/* 1. SUBJECT LINE SELECTOR & EDITOR                                   */}
            {/* =================================================================== */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1">
                  <span>Subject Line Variations</span>
                  <span className="text-[10px] text-zinc-400 font-normal lowercase">(strictly under 4 words)</span>
                </label>
                <button
                  onClick={() => copyToClipboard(currentDraft.subjectLines[selectedSubjectIdx]?.text || '', 'subject')}
                  className="text-[11px] text-zinc-600 hover:text-zinc-900 flex items-center gap-1 font-semibold"
                >
                  {copiedKey === 'subject' ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600" />
                      <span className="text-emerald-600 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy Subject</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {currentDraft.subjectLines.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSubjectIdx(idx)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      selectedSubjectIdx === idx
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xs ring-2 ring-zinc-900/10'
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        selectedSubjectIdx === idx ? 'text-amber-400' : 'text-zinc-500'
                      }`}>
                        {s.label}
                      </span>
                      {selectedSubjectIdx === idx && (
                        <CheckCircle2 className="h-3 w-3 text-amber-400" />
                      )}
                    </div>
                    <div className="font-mono text-xs font-bold truncate">
                      {s.text}
                    </div>
                    <div className={`text-[10px] mt-1 line-clamp-1 ${
                      selectedSubjectIdx === idx ? 'text-zinc-300' : 'text-zinc-400'
                    }`}>
                      {s.angle}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* =================================================================== */}
            {/* 2. EMAIL BODY CANVAS (EDITABLE & SANITIZED)                         */}
            {/* =================================================================== */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-zinc-600" />
                  <span>Email Body Canvas</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleManualSanitize}
                    className="text-[11px] text-zinc-500 hover:text-zinc-800 font-medium"
                    title="Strip any accidental em dashes or emojis"
                  >
                    Clean Formatting
                  </button>
                  <button
                    onClick={() => copyToClipboard(editableBody, 'body')}
                    className="text-[11px] text-zinc-600 hover:text-zinc-900 flex items-center gap-1 font-semibold"
                  >
                    {copiedKey === 'body' ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy Body</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="relative">
                <textarea
                  rows={8}
                  value={editableBody}
                  onChange={(e) => setEditableBody(e.target.value)}
                  className="w-full text-xs font-sans rounded-xl border border-zinc-300 p-4 text-zinc-900 bg-zinc-50/50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-zinc-900 leading-relaxed tracking-normal"
                />
              </div>

              {/* Structural Breakdown Chips */}
              {currentDraft.structuralBreakdown && (
                <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/80 space-y-2 text-[11px]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Structural Breakdown (Why this converts):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-600">
                    <div>
                      <strong className="text-zinc-800">Trigger:</strong> {currentDraft.structuralBreakdown.triggerOrHook}
                    </div>
                    <div>
                      <strong className="text-zinc-800">Tension:</strong> {currentDraft.structuralBreakdown.tensionOrObservation}
                    </div>
                    <div>
                      <strong className="text-zinc-800">Truth:</strong> {currentDraft.structuralBreakdown.truthOrValue}
                    </div>
                    <div>
                      <strong className="text-zinc-800">CTA:</strong> {currentDraft.structuralBreakdown.ctaSentence}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* =================================================================== */}
            {/* 3. CTA VARIATIONS SELECTOR                                          */}
            {/* =================================================================== */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                Anti-Sales CTA Variations (Click to insert into body):
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {currentDraft.ctaVariations.map((cta, idx) => (
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
                    className={`p-2.5 rounded-lg border text-left transition-colors flex items-center justify-between text-xs ${
                      selectedCtaIdx === idx
                        ? 'bg-amber-50/70 border-amber-300 text-amber-950 font-medium'
                        : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                        {cta.label} ({cta.style})
                      </span>
                      <p className="text-xs">{cta.text}</p>
                    </div>
                    <span className="text-[11px] text-zinc-400 font-mono shrink-0 ml-2">
                      Use CTA ➔
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* =================================================================== */}
            {/* 4. MASTER 1-CLICK ACTION CONTROLS                                   */}
            {/* =================================================================== */}
            <div className="pt-3 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Audited for 0 em dashes, 0 emojis &amp; personal mailbox safety.</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleOpenMailto}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors border border-zinc-200"
                  title="Open draft prefilled in your default email client"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Open in Mail</span>
                </button>

                <button
                  onClick={handleCopyEntireEmail}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white transition-colors shadow-2xs"
                >
                  {copiedKey === 'entire_email' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Copied Entire Email!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Entire Email (Subject + Body)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

          {/* Manual Sending Workflow Checklist */}
          <div className="p-3.5 rounded-xl bg-zinc-100/70 border border-zinc-200 text-xs text-zinc-600 flex items-start gap-2.5">
            <span className="text-base leading-none">📋</span>
            <div className="space-y-1">
              <strong className="text-zinc-900 font-semibold">Manual Send Workflow:</strong>
              <p className="text-[11px] leading-relaxed">
                1. Click <strong>Copy Entire Email</strong> • 2. Paste into Gmail or Outlook • 3. Stagger your manual send by <strong>2 to 4 minutes</strong> from the previous email • 4. Stay under <strong>40 emails per day</strong> per personal account to keep deliverability in the green.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
