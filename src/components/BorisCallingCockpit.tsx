'use client';

import React, { useState } from 'react';
import { 
  Swords, 
  Minus, 
  Plus, 
  Search, 
  X, 
  Volume2, 
  Copy, 
  Check, 
  Headset, 
  Sparkles, 
  RotateCcw, 
  Wand2, 
  FileText,
  Ban,
  CalendarClock,
  ThumbsDown,
  PhoneOff,
  PhoneCall,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import AppSidebar from '@/components/AppSidebar';
import GlobalTopHeader from '@/components/GlobalTopHeader';

export default function BorisCallingCockpit() {
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'huge'>('normal');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'steps' | 'rebuttals'>('steps');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [callingAs, setCallingAs] = useState('Setter — New Bookings');

  // Customer / Lead state for B2B Outbound SDR
  const [customerName, setCustomerName] = useState('Jonathan Duarte');
  const [partnerName, setPartnerName] = useState('OmniCloud Technologies');
  const [phone, setPhone] = useState('+1 (415) 890-1284');
  const [territory, setTerritory] = useState('US Enterprise • Tech Stack: HubSpot & Apollo');
  const [leadNotes, setLeadNotes] = useState('Current Outsourcer: Titan BPO Solutions\nTech Stack: HubSpot & Apollo\nPain: Outbound hold rate & rep objection hesitation');

  // Call Notes & Dispositions
  const [notesDraft, setNotesDraft] = useState('Prospect confirmed 6-person SDR team running Apollo. Experiencing high drop-off on cold discovery conversions.');
  const [disposition, setDisposition] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);

  const copyText = (txt: string, key: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const playSpeech = (text: string, key: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      setIsPlayingAudio(key);
      utterance.onend = () => setIsPlayingAudio(null);
      utterance.onerror = () => setIsPlayingAudio(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  const steps = [
    { 
      num: 1, 
      title: 'Opener', 
      time: '20 SEC',
      purpose: 'Pattern interrupt, identity verification, and permission-based value hook.',
      line1: `"Hi ${customerName.split(' ')[0] || 'there'} ... Emil from Appointmentlyy, just reaching out in regards to the outbound sales intelligence and appointment setting workflow for ${partnerName || 'your company'}."`,
      line2: `"I have a few notes here regarding your outbound demand gen pipeline."`,
      footnote: `If tech stack is provided: "I noticed your team is currently running Apollo & HubSpot."`
    },
    { 
      num: 2, 
      title: 'Q1: Tech Stack & Incumbent', 
      time: '30 SEC',
      purpose: 'Identify existing CRM, dialer stack, and whether outbound is in-house or outsourced.',
      line1: `"Are you currently running your cold outreach internally through an SDR team, or are you utilizing an agency partner for booking qualified discovery calls?"`,
      line2: `"Understood—and what softphone or dialer stack is the floor primarily running today?"`,
      footnote: `Listen for: Apollo, Salesloft, Outreach, ZoomInfo, or incumbent agency retainer.`
    },
    { 
      num: 3, 
      title: 'The Assessment', 
      time: '45 SEC',
      purpose: 'Surface the core bottleneck: rep ramp latency, objection hesitation, or hold rate loss.',
      line1: `"Typically, VPs of Demand Generation we talk to mention that rep hesitation when prospects push back causes over 40% of warm pipeline drop-off."`,
      line2: `"When your reps run into buyer resistance on cold dials, what is your standard framework for keeping them on the phone?"`,
      footnote: `Identify if they have a structured ARM (Acknowledge, Respond, Move) playbook in place.`
    },
    { 
      num: 4, 
      title: 'Qualifying Block', 
      time: '60 SEC',
      purpose: 'Validate qualification criteria: active dialing reps, monthly quota target, decision maker.',
      line1: `"To see if this even makes sense for a test run—how many full-time reps are actively making dials on your campaigns right now?"`,
      line2: `"And outside of yourself, who else evaluates sales enablement tools before deploying them to the calling floor?"`,
      footnote: `Minimum requirement: 2+ active SDRs and authority to test sales assist copilot.`
    },
    { 
      num: 5, 
      title: 'Value Reframe', 
      time: '40 SEC',
      purpose: 'Anchor the AI Boris solution: sub-second audio interception with zero rep disruption.',
      line1: `"We don't ask you to replace your current CRM or agency. We plug an audio stream directly into your calls to feed reps instant ARM talk tracks in 140ms."`,
      line2: `"It completely eliminates rep panic on objections and doubles qualified meeting bookings."`,
      footnote: `Reframe competitor objections: "We act as the tactical execution layer on top of your stack."`
    },
    { 
      num: 6, 
      title: 'Diagnostic Close', 
      time: '30 SEC',
      purpose: 'Lock a low-friction 10-minute diagnostic session with calendar commitment.',
      line1: `"If we could eliminate rep hesitation on cold calls without disrupting your existing reps, would you be opposed to looking at a 10-minute diagnostic run next Tuesday morning?"`,
      line2: `"I can lock 10:30 AM or 2:00 PM EDT on the calendar—which time slot works better for you?"`,
      footnote: `Confirm email and send calendar invite immediately before wrapping up.`
    },
  ];

  const currentStepData = steps[currentStep - 1] || steps[0];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC] font-sans antialiased text-slate-800">
      
      {/* 1. LEFT DARK SIDEBAR DOCK (Exact AI LMS AppSidebar) */}
      <AppSidebar />

      {/* 2. MAIN APP SHELL (Top Header + Scrollable Content) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Global Utility Bar */}
        <GlobalTopHeader />

        {/* Scrollable Work Canvas */}
        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          
          {/* ===================================================================
              AI BORIS HEADER & FONT SCALER
              =================================================================== */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#F9ED32] flex items-center justify-center text-slate-900 shadow-xs">
                <Swords className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  AI Boris
                </h1>
                <p className="text-xs text-slate-500">
                  Every script and rebuttal, ready to read out loud.
                </p>
              </div>
            </div>

            {/* Font Size Toggle [- A   + A] */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 text-xs font-semibold shadow-2xs">
              <button
                onClick={() => setTextSize(prev => prev === 'huge' ? 'large' : 'normal')}
                className="px-2 py-1 rounded hover:bg-slate-100 text-slate-600 transition-colors flex items-center gap-0.5"
              >
                <Minus className="h-3 w-3" />
                <span>A</span>
              </button>
              <div className="h-3.5 w-[1px] bg-slate-200 mx-0.5" />
              <button
                onClick={() => setTextSize(prev => prev === 'normal' ? 'large' : 'huge')}
                className="px-2 py-1 rounded hover:bg-slate-100 text-slate-900 font-bold transition-colors flex items-center gap-0.5"
              >
                <Plus className="h-3 w-3" />
                <span>A</span>
              </button>
            </div>
          </div>

          {/* ===================================================================
              PROMINENT REBUTTAL SEARCH (What did the prospect say?)
              =================================================================== */}
          <div className="relative">
            <Search className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What did the prospect say?"
              className="w-full h-14 pl-12 pr-10 rounded-xl bg-white border border-slate-200 text-base font-medium placeholder-slate-400 text-slate-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#F9ED32] focus:border-slate-300 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* ===================================================================
              DUAL TAB SWITCHER: [ Step-by-step call ] | [ Rebuttals ]
              =================================================================== */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-200/60 max-w-full font-bold text-sm">
            <button
              onClick={() => setActiveTab('steps')}
              className={`py-2.5 rounded-lg transition-all ${
                activeTab === 'steps'
                  ? 'bg-[#F9ED32] text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Step-by-step call
            </button>
            <button
              onClick={() => setActiveTab('rebuttals')}
              className={`py-2.5 rounded-lg transition-all ${
                activeTab === 'rebuttals'
                  ? 'bg-[#F9ED32] text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rebuttals
            </button>
          </div>

          {/* ===================================================================
              3-COLUMN WORK AREA
              =================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* ---------------------------------------------------------------
                COLUMN 1: Customer Name & Lead Context (3 cols)
                --------------------------------------------------------------- */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              
              {/* Customer Name Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                    Customer name
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Paste it from Zoho or CRM, or it comes in with your next lead. It goes into every line of your script and into your notes.
                  </p>
                </div>

                {/* Calling As Dropdown */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    <span className="flex items-center gap-1 text-slate-700">
                      <Headset className="h-3 w-3 text-amber-700" />
                      CALLING AS
                    </span>
                  </div>
                  <select
                    value={callingAs}
                    onChange={(e) => setCallingAs(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="Setter — New Bookings">Setter — New Bookings</option>
                    <option value="SDR — Enterprise Outbound">SDR — Enterprise Outbound</option>
                    <option value="Closer — Discovery Calls">Closer — Discovery Calls</option>
                  </select>
                </div>

                {/* Inputs */}
                <div className="space-y-2 text-xs">
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Jonathan Duarte"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-300"
                  />
                  <input
                    type="text"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder="Partner's / Company name (optional)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-300"
                  />
                  <div className="relative">
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone, e.g. +1 (415) 890-1284"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-300"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] px-1 py-0.5 rounded bg-slate-200 text-slate-700 font-bold font-mono">
                      US/AU
                    </span>
                  </div>
                  <input
                    type="text"
                    value={territory}
                    onChange={(e) => setTerritory(e.target.value)}
                    placeholder="Territory, e.g. US Enterprise"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-300"
                  />
                </div>

                <p className="text-[10px] text-slate-400 leading-snug">
                  Type the customer's name and phone and this lead saves to <span className="font-semibold text-slate-600">My leads</span> automatically.
                </p>
              </div>

              {/* Your Lead Card */}
              <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <span>📋</span>
                    <span>Your lead</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                    B2B PIPELINE
                  </span>
                </div>
                <p className="text-[11px] text-amber-900/80 leading-snug">
                  Paste the lead info from the vendor or CRM in any format. The script on the right is tailored to this.
                </p>
                <textarea
                  rows={3}
                  value={leadNotes}
                  onChange={(e) => setLeadNotes(e.target.value)}
                  className="w-full bg-white border border-amber-200 rounded-xl p-2.5 text-[11px] text-slate-800 font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* ---------------------------------------------------------------
                COLUMN 2: Step-by-Step Call Flow Script (6 cols)
                --------------------------------------------------------------- */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              
              {/* Horizontal Step Pills Navigator */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {steps.map((st) => (
                  <button
                    key={st.num}
                    onClick={() => setCurrentStep(st.num)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all shadow-2xs ${
                      currentStep === st.num
                        ? 'bg-[#F9ED32] text-slate-900 shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>{st.num} {st.title}</span>
                  </button>
                ))}
              </div>

              {/* Active Step Script Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
                
                {/* Step Metadata Header */}
                <div>
                  <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-400">
                    STEP {currentStep} OF {steps.length} • {currentStepData.time}
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                    {currentStepData.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">
                    {currentStepData.purpose}
                  </p>
                </div>

                {/* Spoken Script Quotation 1 */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <p className={`font-semibold text-slate-900 leading-relaxed ${
                    textSize === 'huge' ? 'text-2xl' : textSize === 'large' ? 'text-xl' : 'text-lg'
                  }`}>
                    {currentStepData.line1}
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => playSpeech(currentStepData.line1, `q1_${currentStep}`)}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        isPlayingAudio === `q1_${currentStep}` ? 'bg-[#F9ED32] border-yellow-400 text-black' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>{isPlayingAudio === `q1_${currentStep}` ? 'Playing...' : 'Hear it'}</span>
                    </button>
                    <button
                      onClick={() => copyText(currentStepData.line1, `q1_copy_${currentStep}`)}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      {copiedKey === `q1_copy_${currentStep}` ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
                      <span>{copiedKey === `q1_copy_${currentStep}` ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Spoken Script Quotation 2 */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <p className={`font-semibold text-slate-900 leading-relaxed ${
                    textSize === 'huge' ? 'text-2xl' : textSize === 'large' ? 'text-xl' : 'text-lg'
                  }`}>
                    {currentStepData.line2}
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => playSpeech(currentStepData.line2, `q2_${currentStep}`)}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        isPlayingAudio === `q2_${currentStep}` ? 'bg-[#F9ED32] border-yellow-400 text-black' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>{isPlayingAudio === `q2_${currentStep}` ? 'Playing...' : 'Hear it'}</span>
                    </button>
                    <button
                      onClick={() => copyText(currentStepData.line2, `q2_copy_${currentStep}`)}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      {copiedKey === `q2_copy_${currentStep}` ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
                      <span>{copiedKey === `q2_copy_${currentStep}` ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Footnote Context */}
                <p className="text-xs text-slate-500 italic pt-2 border-t border-slate-100">
                  {currentStepData.footnote}
                </p>
              </div>
            </div>

            {/* ---------------------------------------------------------------
                COLUMN 3: Call Notes & Call Disposition (3 cols)
                --------------------------------------------------------------- */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              
              {/* Call Notes Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                    <span>📝</span>
                    <span>Call notes</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Setter notes, drafted live from your answers in the script.
                  </p>
                </div>

                {/* Notes Actions: [Tidy wording] | [Copy AI Notes] */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setNotesDraft(prev => prev.trim() + ' (Reviewed & verified for BDR qualification)');
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <Wand2 className="h-3 w-3 text-slate-500" />
                    <span>Tidy wording</span>
                  </button>
                  <button
                    onClick={() => copyText(notesDraft, 'notes_copy')}
                    className="flex-1 py-1.5 rounded-lg bg-[#F9ED32] hover:bg-yellow-400 text-slate-900 font-bold text-xs transition-colors flex items-center justify-center gap-1 shadow-2xs"
                  >
                    {copiedKey === 'notes_copy' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey === 'notes_copy' ? 'Copied' : 'Copy AI Notes'}</span>
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-mono focus:outline-none focus:bg-white"
                />

                <button
                  onClick={() => {
                    setNotesDraft('');
                    setDisposition(null);
                  }}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 py-1 transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Next call: clear everything</span>
                </button>
              </div>

              {/* Call Disposition 2x3 Grid */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2.5">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 block">
                  CALL DISPOSITION
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  
                  {/* 1. Do not call */}
                  <button
                    onClick={() => setDisposition('Do not call')}
                    className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      disposition === 'Do not call' ? 'bg-red-50 border-red-300 ring-2 ring-red-400' : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px]">
                      <Ban className="h-3.5 w-3.5 text-red-500" />
                      <span>Do not call</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">They asked us never to call again</span>
                  </button>

                  {/* 2. Future contact */}
                  <button
                    onClick={() => setDisposition('Future contact')}
                    className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      disposition === 'Future contact' ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-400' : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px]">
                      <CalendarClock className="h-3.5 w-3.5 text-blue-500" />
                      <span>Future contact</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">Not now, but open to a call later</span>
                  </button>

                  {/* 3. Disqualified */}
                  <button
                    onClick={() => setDisposition('Disqualified')}
                    className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      disposition === 'Disqualified' ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400' : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px]">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                      <span>Disqualified</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">Fails a qualifier</span>
                  </button>

                  {/* 4. Not interested */}
                  <button
                    onClick={() => setDisposition('Not interested')}
                    className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      disposition === 'Not interested' ? 'bg-slate-200 border-slate-400 ring-2 ring-slate-400' : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px]">
                      <ThumbsDown className="h-3.5 w-3.5 text-slate-500" />
                      <span>Not interested</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">Said no before qualifying</span>
                  </button>

                  {/* 5. No answer / voicemail */}
                  <button
                    onClick={() => setDisposition('No answer')}
                    className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      disposition === 'No answer' ? 'bg-slate-200 border-slate-400 ring-2 ring-slate-400' : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px]">
                      <PhoneOff className="h-3.5 w-3.5 text-slate-500" />
                      <span>No answer</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">Didn't pick up, or voicemail</span>
                  </button>

                  {/* 6. Call back */}
                  <button
                    onClick={() => setDisposition('Call back')}
                    className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      disposition === 'Call back' ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400' : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px]">
                      <PhoneCall className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Call back</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">Busy now, call back soon</span>
                  </button>
                </div>
              </div>

              {/* Still Qualifying Checklist Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                  <CheckCircle2 className="h-4 w-4 text-slate-400" />
                  <span>Still qualifying</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Still to confirm: Q1 Current Stack (Apollo/Outreach), Q2 Decision-maker authority, Q3 Quota pain point, Q4 10-min diagnostic Zoom slot.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Bottom Right Rebuttals Action Button */}
      <div className="fixed bottom-6 right-6 flex items-center gap-2 z-50">
        <button
          onClick={() => setActiveTab('rebuttals')}
          className="px-4 py-2.5 rounded-full bg-[#F9ED32] hover:bg-yellow-400 text-slate-900 font-extrabold text-xs flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105"
        >
          <FileText className="h-4 w-4" />
          <span>Rebuttals</span>
          <kbd className="text-[10px] bg-slate-900/10 px-1 py-0.2 rounded font-mono">R</kbd>
        </button>
      </div>
    </div>
  );
}
