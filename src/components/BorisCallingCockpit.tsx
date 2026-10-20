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
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import AppSidebar from '@/components/AppSidebar';
import GlobalTopHeader from '@/components/GlobalTopHeader';

interface ARMRebuttal {
  id: string;
  category: 'Timing' | 'Incumbent' | 'Budget' | 'Privacy' | 'Authenticity' | 'Burned';
  categoryColor: string;
  trigger: string;
  listenFor: string;
  acknowledge: string;
  respond: string;
  move: string;
  fullSpoken: string;
}

export default function BorisCallingCockpit() {
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'huge'>('normal');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'steps' | 'rebuttals'>('steps');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [callingAs, setCallingAs] = useState('Setter — New Bookings');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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

  // 100% Pure B2B Cold Outbound Sales Script (Zero solar / zero roof)
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

  // 100% Pure B2B ARM Rebuttals (Acknowledge, Respond, Move)
  const rebuttals: ARMRebuttal[] = [
    {
      id: 'reb_email',
      category: 'Timing',
      categoryColor: 'bg-blue-50 text-blue-800 border-blue-200',
      trigger: 'Just send me an email / send some information',
      listenFor: 'Polite brush-off to get off the phone without reading.',
      acknowledge: 'Totally understand, happy to send a 1-page breakdown over so you have it in writing.',
      respond: 'The reason I reached out directly is that most VPs tell us marketing decks get lost in 400 unread emails without context on rep objection hold rates.',
      move: 'Before I shoot that over, what dialer or softphone stack is your SDR team running right now so I include the exact integration specs?',
      fullSpoken: 'Totally understand, happy to send a 1-page breakdown so you have it in writing. The reason I reached out directly is that most VPs tell us marketing decks get lost in unread emails without context on rep objection hold rates. Before I shoot that over, what dialer or CRM is your SDR team running right now so I include the exact integration specs?'
    },
    {
      id: 'reb_agency',
      category: 'Incumbent',
      categoryColor: 'bg-purple-50 text-purple-800 border-purple-200',
      trigger: 'We already use an agency / outsource partner',
      listenFor: 'They have a contracted agency managing outbound.',
      acknowledge: 'That makes complete sense—most high-growth teams we work with partner with an agency for top-of-funnel discovery.',
      respond: 'We actually don\'t replace your agency. We provide the real-time AI audio assist layer that plugs into their reps\' headsets to cut objection drop-off by 40%.',
      move: 'Are you satisfied with the volume of qualified meetings they\'re putting on your calendar this month, or would a 10-minute diagnostic run be worth a quick look?',
      fullSpoken: 'That makes complete sense—most teams partner with an agency for top-of-funnel discovery. We actually don\'t replace your agency. We provide the real-time AI audio assist layer that plugs into their reps\' headsets to cut objection drop-off by 40%. Are you satisfied with the volume of qualified meetings they\'re putting on your calendar this month?'
    },
    {
      id: 'reb_inhouse',
      category: 'Incumbent',
      categoryColor: 'bg-purple-50 text-purple-800 border-purple-200',
      trigger: 'We handle all outbound in-house with internal SDRs',
      listenFor: 'Pride in internal sales team culture.',
      acknowledge: 'Makes complete sense—having internal reps who deeply understand your core product domain is a huge advantage.',
      respond: 'Appointmentlyy is built specifically to superpower in-house teams. Boris intercepts prospect friction in 140ms and surfaces battle-tested ARM talk tracks right before reps drop the ball.',
      move: 'How many full-time SDRs do you currently have making dials on your floor?',
      fullSpoken: 'Makes complete sense—having internal reps who deeply understand your core product domain is a huge advantage. Appointmentlyy is built specifically to superpower in-house teams. Boris intercepts prospect friction in 140ms and surfaces battle-tested ARM talk tracks right before reps drop the ball. How many full-time SDRs do you currently have making dials today?'
    },
    {
      id: 'reb_budget',
      category: 'Budget',
      categoryColor: 'bg-amber-50 text-amber-800 border-amber-200',
      trigger: 'Not interested / We don\'t have budget for this',
      listenFor: 'Premature budget defense before understanding the ROI.',
      acknowledge: 'Completely fair—I wouldn\'t expect you to have budget allocated for something you haven\'t seen in action yet.',
      respond: 'This isn\'t an enterprise budget commitment. We run a low-friction diagnostic test on live dials so you can measure the booked meeting lift before spending a dollar.',
      move: 'Would you be totally opposed to taking a 7-minute peek next Tuesday morning?',
      fullSpoken: 'Completely fair—I wouldn\'t expect you to have budget allocated for something you haven\'t seen in action yet. This isn\'t an enterprise budget commitment. We run a low-friction diagnostic test on live dials so you can measure the booked meeting lift before spending a dollar. Would you be totally opposed to taking a 7-minute peek next Tuesday morning?'
    },
    {
      id: 'reb_swamped',
      category: 'Timing',
      categoryColor: 'bg-blue-50 text-blue-800 border-blue-200',
      trigger: 'I\'m swamped right now / bad timing / call back next month',
      listenFor: 'Operational overload, fires, calendar fatigue.',
      acknowledge: 'Completely understand, I hear the background noise and know you\'re jumping between meetings.',
      respond: 'I definitely don\'t want to disrupt your day. The reason for the call is that teams use this to eliminate rep ramp management overhead completely.',
      move: 'What does your calendar look like for a brief 5-minute catch-up next Thursday at 10:30 AM EDT?',
      fullSpoken: 'Completely understand, I hear the background noise and know you\'re jumping between meetings. I definitely don\'t want to disrupt your day. The reason for the call is that teams use this to eliminate rep ramp management overhead completely. What does your calendar look like for a brief 5-minute catch-up next Thursday at 10:30 AM EDT?'
    },
    {
      id: 'reb_privacy',
      category: 'Privacy',
      categoryColor: 'bg-rose-50 text-rose-800 border-rose-200',
      trigger: 'How did you get my direct phone number?',
      listenFor: 'Privacy resistance or suspicion of unsolicited contact.',
      acknowledge: 'Fair question! I always want to be 100% transparent.',
      respond: 'We use compliant B2B intelligence platforms like Apollo and ZoomInfo to identify demand generation leaders whose teams are actively scaling outbound pipeline.',
      move: 'Since I have you for just 20 seconds, is outbound conversion rate something your sales floor is actively looking to improve this quarter?',
      fullSpoken: 'Fair question! I always want to be 100% transparent. We use compliant B2B intelligence platforms like Apollo and ZoomInfo to identify demand generation leaders whose teams are actively scaling outbound pipeline. Since I have you for just 20 seconds, is outbound conversion rate something your sales floor is actively looking to improve this quarter?'
    },
    {
      id: 'reb_authenticity',
      category: 'Authenticity',
      categoryColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      trigger: 'Is this an AI robot or automated dialer voice?',
      listenFor: 'Prospect checking for robotic or synthetic presence.',
      acknowledge: 'Haha, nope! I\'m an actual live human being dialing you from our team right now.',
      respond: 'We do develop real-time AI copilot technology that assists live reps during calls, but every conversation is 100% authentic human-to-human.',
      move: 'Curious—have you explored deploying live AI audio assist tools on your SDR calling floor yet?',
      fullSpoken: 'Haha, nope! I\'m an actual live human being dialing you from our team right now. We do develop real-time AI copilot technology that assists live reps during calls, but every conversation is 100% authentic human-to-human. Curious—have you explored deploying live AI audio assist tools on your SDR calling floor yet?'
    },
    {
      id: 'reb_burned',
      category: 'Burned',
      categoryColor: 'bg-red-50 text-red-800 border-red-200',
      trigger: 'We tried an outbound service before and it burned our domain',
      listenFor: 'Trauma from low-quality spam or poor agency execution.',
      acknowledge: 'I hear that all the time, and frankly a lot of fly-by-night agencies blast spam emails and ruin company reputation.',
      respond: 'We don\'t do spam outreach. We run live acoustic hold verification, sub-second objection assistance, and targeted account qualification so your brand equity is protected.',
      move: 'Would you be open to reviewing our live audio QA scorecard to see how we guarantee conversational compliance?',
      fullSpoken: 'I hear that all the time, and frankly a lot of fly-by-night agencies blast spam emails and ruin company reputation. We don\'t do spam outreach. We run live acoustic hold verification, sub-second objection assistance, and targeted account qualification so your brand equity is protected. Would you be open to reviewing our live audio QA scorecard to see how we guarantee conversational compliance?'
    }
  ];

  const currentStepData = steps[currentStep - 1] || steps[0];

  // Filtered rebuttals based on search query and category
  const filteredRebuttals = rebuttals.filter(r => {
    const matchesSearch = searchQuery === '' || 
      r.trigger.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.listenFor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.acknowledge.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.respond.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.move.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || r.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const isRebuttalsMode = activeTab === 'rebuttals' || searchQuery.trim().length > 0;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F2F0EF] font-sans antialiased text-[#222021]">
      
      {/* 1. LEFT CHARCOAL SIDEBAR DOCK */}
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
              <div className="h-9 w-9 rounded-xl bg-[#ED1C24] flex items-center justify-center text-white shadow-xs">
                <Swords className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-[#222021]">
                  AI Boris
                </h1>
                <p className="text-xs text-[#6b6968]">
                  Every script and rebuttal, ready to read out loud.
                </p>
              </div>
            </div>

            {/* Font Size Toggle [- A   + A] */}
            <div className="flex items-center gap-1 bg-white border border-[#222021]/15 rounded-lg p-1 text-xs font-semibold shadow-2xs">
              <button
                onClick={() => setTextSize(prev => prev === 'huge' ? 'large' : 'normal')}
                className="px-2 py-1 rounded hover:bg-[#F2F0EF] text-[#6b6968] transition-colors flex items-center gap-0.5"
              >
                <Minus className="h-3 w-3" />
                <span>A</span>
              </button>
              <div className="h-3.5 w-[1px] bg-[#222021]/15 mx-0.5" />
              <button
                onClick={() => setTextSize(prev => prev === 'normal' ? 'large' : 'huge')}
                className="px-2 py-1 rounded hover:bg-[#F2F0EF] text-[#222021] font-bold transition-colors flex items-center gap-0.5"
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
            <Search className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#6b6968]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What did the prospect say? (e.g. email, agency, budget, swamped...)"
              className="w-full h-14 pl-12 pr-10 rounded-xl bg-white border border-[#222021]/15 text-base font-medium placeholder-[#6b6968] text-[#222021] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#ED1C24] focus:border-[#ED1C24] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b6968] hover:text-[#222021] p-1"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* ===================================================================
              DUAL TAB SWITCHER: [ Step-by-step call ] | [ Rebuttals ]
              =================================================================== */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[#222021]/10 max-w-full font-bold text-sm">
            <button
              onClick={() => {
                setActiveTab('steps');
                setSearchQuery('');
              }}
              className={`py-2.5 rounded-lg transition-all ${
                !isRebuttalsMode
                  ? 'bg-[#ED1C24] text-white shadow-sm'
                  : 'text-[#222021]/70 hover:text-[#222021]'
              }`}
            >
              Step-by-step call
            </button>
            <button
              onClick={() => setActiveTab('rebuttals')}
              className={`py-2.5 rounded-lg transition-all ${
                isRebuttalsMode
                  ? 'bg-[#ED1C24] text-white shadow-sm'
                  : 'text-[#222021]/70 hover:text-[#222021]'
              }`}
            >
              Rebuttals
            </button>
          </div>

          {/* ===================================================================
              MAIN CONTENT CONTAINER: STEP-BY-STEP OR REBUTTALS MATRIX
              =================================================================== */}
          {!isRebuttalsMode ? (
            /* =================================================================
               3-COLUMN STEP-BY-STEP WORK AREA
               ================================================================= */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              
              {/* ---------------------------------------------------------------
                  COLUMN 1: Customer Name & Lead Context (3 cols)
                  --------------------------------------------------------------- */}
              <div className="lg:col-span-3 flex flex-col gap-4">
                
                {/* Customer Name Card */}
                <div className="bg-white border border-[#222021]/10 rounded-2xl p-4 shadow-2xs space-y-3">
                  <div>
                    <h2 className="text-sm font-extrabold text-[#222021] tracking-tight flex items-center gap-1.5">
                      Customer name
                    </h2>
                    <p className="text-[11px] text-[#6b6968] mt-0.5 leading-snug">
                      Paste it from CRM, or it comes in with your next lead. It goes into every line of your script and notes.
                    </p>
                  </div>

                  {/* Calling As Dropdown */}
                  <div className="bg-[#F2F0EF] border border-[#222021]/10 rounded-xl p-2">
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#6b6968] block mb-1">
                      CALLING AS
                    </span>
                    <select
                      value={callingAs}
                      onChange={(e) => setCallingAs(e.target.value)}
                      className="w-full bg-white border border-[#222021]/15 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#222021] focus:outline-none focus:ring-1 focus:ring-[#ED1C24]"
                    >
                      <option>Setter — New Bookings</option>
                      <option>Closer — Executive Diagnostic</option>
                      <option>QA Evaluator — Live Assist</option>
                    </select>
                  </div>

                  {/* Customer Inputs */}
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Customer name"
                      className="w-full bg-[#F2F0EF] border border-[#222021]/10 rounded-xl px-3 py-2 text-xs text-[#222021] font-medium placeholder-[#6b6968] focus:outline-none focus:bg-white focus:border-[#ED1C24]"
                    />
                    <input
                      type="text"
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="Company name"
                      className="w-full bg-[#F2F0EF] border border-[#222021]/10 rounded-xl px-3 py-2 text-xs text-[#222021] font-medium placeholder-[#6b6968] focus:outline-none focus:bg-white focus:border-[#ED1C24]"
                    />
                    <div className="relative">
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone, e.g. +1 (415) 890-1284"
                        className="w-full bg-[#F2F0EF] border border-[#222021]/10 rounded-xl px-3 py-2 text-xs text-[#222021] font-medium placeholder-[#6b6968] focus:outline-none focus:bg-white focus:border-[#ED1C24]"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] px-1 py-0.5 rounded bg-white border border-[#222021]/10 text-[#222021] font-bold font-mono">
                        US/AU
                      </span>
                    </div>
                    <input
                      type="text"
                      value={territory}
                      onChange={(e) => setTerritory(e.target.value)}
                      placeholder="Territory, e.g. US Enterprise"
                      className="w-full bg-[#F2F0EF] border border-[#222021]/10 rounded-xl px-3 py-2 text-xs text-[#222021] font-medium placeholder-[#6b6968] focus:outline-none focus:bg-white focus:border-[#ED1C24]"
                    />
                  </div>

                  <p className="text-[10px] text-[#6b6968] leading-snug">
                    Type the customer's name and phone and this lead saves to <span className="font-semibold text-[#222021]">My leads</span> automatically.
                  </p>
                </div>

                {/* Your Lead Card */}
                <div className="bg-white border border-[#222021]/10 rounded-2xl p-4 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#222021] flex items-center gap-1.5">
                      <span className="text-[#ED1C24]">⚡</span>
                      <span>Your lead</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#ED1C24]/10 text-[#ED1C24] border border-[#ED1C24]/20">
                      B2B PIPELINE
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6b6968] leading-snug">
                    Paste the lead info from CRM in any format. The script on the right is tailored to this.
                  </p>
                  <textarea
                    rows={3}
                    value={leadNotes}
                    onChange={(e) => setLeadNotes(e.target.value)}
                    className="w-full bg-[#F2F0EF] border border-[#222021]/10 rounded-xl p-2.5 text-[11px] text-[#222021] font-mono focus:outline-none focus:bg-white"
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
                          ? 'bg-[#ED1C24] text-white shadow-xs'
                          : 'bg-white border border-[#222021]/10 text-[#6b6968] hover:text-[#222021]'
                      }`}
                    >
                      <span>{st.num} {st.title}</span>
                    </button>
                  ))}
                </div>

                {/* Active Step Script Card */}
                <div className="bg-white border border-[#222021]/10 rounded-2xl p-6 shadow-2xs space-y-5">
                  
                  {/* Step Metadata Header */}
                  <div>
                    <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#ED1C24]">
                      STEP {currentStep} OF {steps.length} • {currentStepData.time}
                    </span>
                    <h2 className="text-2xl font-black text-[#222021] tracking-tight mt-0.5">
                      {currentStepData.title}
                    </h2>
                    <p className="text-xs text-[#6b6968] mt-1 leading-snug">
                      {currentStepData.purpose}
                    </p>
                  </div>

                  {/* Spoken Script Quotation 1 */}
                  <div className="space-y-2 pt-2 border-t border-[#222021]/10">
                    <p className={`font-semibold text-[#222021] leading-relaxed ${
                      textSize === 'huge' ? 'text-2xl' : textSize === 'large' ? 'text-xl' : 'text-lg'
                    }`}>
                      {currentStepData.line1}
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => playSpeech(currentStepData.line1, `q1_${currentStep}`)}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                          isPlayingAudio === `q1_${currentStep}` ? 'bg-[#ED1C24] border-[#ED1C24] text-white' : 'bg-[#F2F0EF] hover:bg-[#e7e4e2] text-[#222021] border-[#222021]/10'
                        }`}
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                        <span>{isPlayingAudio === `q1_${currentStep}` ? 'Playing...' : 'Hear it'}</span>
                      </button>
                      <button
                        onClick={() => copyText(currentStepData.line1, `q1_copy_${currentStep}`)}
                        className="px-2.5 py-1 rounded-lg bg-[#F2F0EF] hover:bg-[#e7e4e2] text-[#222021] border border-[#222021]/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        {copiedKey === `q1_copy_${currentStep}` ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-[#6b6968]" />}
                        <span>{copiedKey === `q1_copy_${currentStep}` ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Spoken Script Quotation 2 */}
                  <div className="space-y-2 pt-2 border-t border-[#222021]/10">
                    <p className={`font-semibold text-[#222021] leading-relaxed ${
                      textSize === 'huge' ? 'text-2xl' : textSize === 'large' ? 'text-xl' : 'text-lg'
                    }`}>
                      {currentStepData.line2}
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => playSpeech(currentStepData.line2, `q2_${currentStep}`)}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                          isPlayingAudio === `q2_${currentStep}` ? 'bg-[#ED1C24] border-[#ED1C24] text-white' : 'bg-[#F2F0EF] hover:bg-[#e7e4e2] text-[#222021] border-[#222021]/10'
                        }`}
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                        <span>{isPlayingAudio === `q2_${currentStep}` ? 'Playing...' : 'Hear it'}</span>
                      </button>
                      <button
                        onClick={() => copyText(currentStepData.line2, `q2_copy_${currentStep}`)}
                        className="px-2.5 py-1 rounded-lg bg-[#F2F0EF] hover:bg-[#e7e4e2] text-[#222021] border border-[#222021]/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        {copiedKey === `q2_copy_${currentStep}` ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-[#6b6968]" />}
                        <span>{copiedKey === `q2_copy_${currentStep}` ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Footnote Context */}
                  <p className="text-xs text-[#6b6968] italic pt-2 border-t border-[#222021]/10">
                    {currentStepData.footnote}
                  </p>
                </div>
              </div>

              {/* ---------------------------------------------------------------
                  COLUMN 3: Call Notes & Call Disposition (3 cols)
                  --------------------------------------------------------------- */}
              <div className="lg:col-span-3 flex flex-col gap-4">
                
                {/* Call Notes Card */}
                <div className="bg-white border border-[#222021]/10 rounded-2xl p-4 shadow-2xs space-y-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#222021] tracking-tight flex items-center gap-1.5">
                      <span>📝</span>
                      <span>Call notes</span>
                    </h3>
                    <p className="text-[11px] text-[#6b6968] mt-0.5 leading-snug">
                      Setter notes, drafted live from your answers in the script.
                    </p>
                  </div>

                  {/* Notes Actions: [Tidy wording] | [Copy AI Notes] */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setNotesDraft(prev => prev.trim() + ' (Reviewed & verified for BDR qualification)');
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-[#F2F0EF] hover:bg-[#e7e4e2] text-[#222021] font-semibold text-xs transition-colors flex items-center justify-center gap-1 border border-[#222021]/10"
                    >
                      <Wand2 className="h-3 w-3 text-[#6b6968]" />
                      <span>Tidy wording</span>
                    </button>
                    <button
                      onClick={() => copyText(notesDraft, 'notes_copy')}
                      className="flex-1 py-1.5 rounded-lg bg-[#ED1C24] hover:bg-[#d0181f] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 shadow-2xs"
                    >
                      {copiedKey === 'notes_copy' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedKey === 'notes_copy' ? 'Copied' : 'Copy AI Notes'}</span>
                    </button>
                  </div>

                  <textarea
                    rows={4}
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    className="w-full bg-[#F2F0EF] border border-[#222021]/10 rounded-xl p-2.5 text-xs text-[#222021] font-mono focus:outline-none focus:bg-white focus:border-[#ED1C24]"
                  />

                  <button
                    onClick={() => {
                      setNotesDraft('');
                      setDisposition(null);
                    }}
                    className="w-full text-center text-xs text-[#6b6968] hover:text-[#222021] flex items-center justify-center gap-1 py-1 transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Next call: clear everything</span>
                  </button>
                </div>

                {/* Call Disposition Dropdown List */}
                <div className="bg-white border border-[#222021]/10 rounded-2xl p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#6b6968] block">
                      CALL DISPOSITION
                    </span>
                    {disposition && (
                      <button
                        onClick={() => setDisposition(null)}
                        className="text-[10px] font-bold text-[#ED1C24] hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  {/* Dropdown Select Menu */}
                  <div className="relative">
                    <select
                      value={disposition || ''}
                      onChange={(e) => setDisposition(e.target.value || null)}
                      className="w-full bg-[#F2F0EF] border border-[#222021]/15 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#222021] focus:outline-none focus:ring-2 focus:ring-[#ED1C24] focus:border-[#ED1C24] transition-all cursor-pointer"
                    >
                      <option value="">-- Select Call Disposition --</option>
                      <option value="Meeting Booked">? Meeting Booked (Diagnostic Scheduled)</option>
                      <option value="Call back">?? Call back (Busy now, call back soon)</option>
                      <option value="Future contact">?? Future contact (Not now, open to call later)</option>
                      <option value="No answer">?? No answer (Didn't pick up / Voicemail)</option>
                      <option value="Not interested">?? Not interested (Said no before qualifying)</option>
                      <option value="Disqualified">?? Disqualified (Fails qualification criteria)</option>
                      <option value="Do not call">?? Do not call (Asked never to call again)</option>
                    </select>
                  </div>

                  {/* Selected Disposition Context Pill */}
                  {disposition ? (
                    <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                      disposition === 'Meeting Booked' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                      disposition === 'Call back' ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800' :
                      disposition === 'Future contact' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                      disposition === 'Disqualified' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                      disposition === 'Do not call' ? 'bg-red-50 border-red-200 text-[#ED1C24]' :
                      'bg-[#F2F0EF] border-[#222021]/10 text-[#222021]'
                    }`}>
                      <span className="font-bold text-[11px] truncate">
                        Selected: {disposition}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-[#222021]/10 text-[#222021]">
                        QUEUED
                      </span>
                    </div>
                  ) : (
                    <p className="text-[10px] text-[#6b6968] italic leading-tight">
                      Select the call outcome from the list to log into CRM cadence automatically.
                    </p>
                  )}
                </div>

                {/* Still Qualifying Checklist Box */}
                <div className="bg-white border border-[#222021]/10 rounded-2xl p-4 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#222021]">
                    <CheckCircle2 className="h-4 w-4 text-[#ED1C24]" />
                    <span>Still qualifying</span>
                  </div>
                  <p className="text-[11px] text-[#6b6968] leading-snug">
                    Still to confirm: Q1 Current Stack (Apollo/Outreach), Q2 Decision-maker authority, Q3 Quota pain point, Q4 10-min diagnostic Zoom slot.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* =================================================================
               FULL B2B REBUTTALS MATRIX (ARM FRAMEWORK)
               ================================================================= */
            <div className="space-y-4">
              
              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: 'All Objections' },
                  { id: 'timing', label: 'Timing & Email' },
                  { id: 'incumbent', label: 'Agency & In-House' },
                  { id: 'budget', label: 'Budget & ROI' },
                  { id: 'privacy', label: 'Data & Privacy' },
                  { id: 'authenticity', label: 'AI Authenticity' },
                  { id: 'burned', label: 'Burned Domain' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs ${
                      selectedCategory === cat.id
                        ? 'bg-[#ED1C24] text-white shadow-xs'
                        : 'bg-white border border-[#222021]/10 text-[#6b6968] hover:text-[#222021]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Rebuttals List */}
              <div className="grid grid-cols-1 gap-4">
                {filteredRebuttals.map((reb) => (
                  <div 
                    key={reb.id}
                    className="bg-white border border-[#222021]/10 rounded-2xl p-6 shadow-2xs space-y-4 hover:border-[#222021]/20 transition-all"
                  >
                    {/* Header: Category Badge & Objection Statement */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${reb.categoryColor}`}>
                            {reb.category}
                          </span>
                          <span className="text-xs text-[#6b6968] italic">
                            Listen for: {reb.listenFor}
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-[#222021] tracking-tight mt-1.5">
                          "{reb.trigger}"
                        </h3>
                      </div>

                      {/* Action Buttons: Hear it & Copy */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => playSpeech(reb.fullSpoken, reb.id)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                            isPlayingAudio === reb.id ? 'bg-[#ED1C24] border-[#ED1C24] text-white' : 'bg-[#F2F0EF] hover:bg-[#e7e4e2] text-[#222021] border-[#222021]/10'
                          }`}
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                          <span>{isPlayingAudio === reb.id ? 'Playing...' : 'Hear it'}</span>
                        </button>
                        <button
                          onClick={() => copyText(reb.fullSpoken, `copy_${reb.id}`)}
                          className="px-3 py-1.5 rounded-lg bg-[#ED1C24] hover:bg-[#d0181f] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                        >
                          {copiedKey === `copy_${reb.id}` ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          <span>{copiedKey === `copy_${reb.id}` ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    {/* ARM Framework Breakdown (Acknowledge, Respond, Move) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-[#222021]/10">
                      
                      {/* [A] Acknowledge */}
                      <div className="p-3.5 rounded-xl bg-[#F2F0EF] border border-[#222021]/10 space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-[#6b6968] flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-blue-500" />
                          <span>[A] Acknowledge</span>
                        </span>
                        <p className={`font-semibold text-[#222021] leading-snug ${
                          textSize === 'huge' ? 'text-base' : 'text-xs'
                        }`}>
                          "{reb.acknowledge}"
                        </p>
                      </div>

                      {/* [R] Respond */}
                      <div className="p-3.5 rounded-xl bg-[#F2F0EF] border border-[#222021]/10 space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-[#ED1C24] flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-[#ED1C24]" />
                          <span>[R] Respond</span>
                        </span>
                        <p className={`font-semibold text-[#222021] leading-snug ${
                          textSize === 'huge' ? 'text-base' : 'text-xs'
                        }`}>
                          "{reb.respond}"
                        </p>
                      </div>

                      {/* [M] Move */}
                      <div className="p-3.5 rounded-xl bg-[#F2F0EF] border border-[#222021]/10 space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span>[M] Move (CTA)</span>
                        </span>
                        <p className={`font-semibold text-[#222021] leading-snug ${
                          textSize === 'huge' ? 'text-base' : 'text-xs'
                        }`}>
                          "{reb.move}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredRebuttals.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-2xl border border-[#222021]/10">
                    <HelpCircle className="h-10 w-10 text-[#6b6968] mx-auto mb-2" />
                    <h4 className="text-base font-bold text-[#222021]">No matching rebuttals found</h4>
                    <p className="text-xs text-[#6b6968] mt-1">
                      Try searching with different keywords like "email", "agency", "budget", or "swamped".
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Bottom Right Rebuttals Action Button */}
      <div className="fixed bottom-6 right-6 flex items-center gap-2 z-50">
        <button
          onClick={() => {
            if (isRebuttalsMode) {
              setActiveTab('steps');
              setSearchQuery('');
            } else {
              setActiveTab('rebuttals');
            }
          }}
          className="px-4 py-2.5 rounded-full bg-[#ED1C24] hover:bg-[#d0181f] text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105"
        >
          <FileText className="h-4 w-4" />
          <span>{isRebuttalsMode ? 'Back to Steps' : 'Rebuttals'}</span>
          <kbd className="text-[10px] bg-white/20 px-1 py-0.2 rounded font-mono">R</kbd>
        </button>
      </div>
    </div>
  );
}
