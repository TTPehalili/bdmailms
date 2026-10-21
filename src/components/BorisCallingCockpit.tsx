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
  category: 'Timing' | 'Incumbent' | 'Budget' | 'Privacy' | 'Authenticity' | 'Burned' | 'Experience' | 'Training';
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
  const [customerName, setCustomerName] = useState('Julian Vance');
  const [partnerName, setPartnerName] = useState('Apex Global BPO');
  const [phone, setPhone] = useState('+1 (415) 890-1284');
  const [territory, setTerritory] = useState('250 Seats • Customer Support & Outbound Sales');
  const [leadNotes, setLeadNotes] = useState('Lead Sourcing: Outsource Accelerator / Directory Brokers\nPain: Shared-lead price wars ($8/hr race) & senior reps burning expensive leads\nFounder Meeting: 20-min demo with Emil (17+ yrs BPO BDM)');

  // Interactive BPO Playbook State
  const [recognizedOA, setRecognizedOA] = useState<boolean | null>(null);
  const [confirmedPriceTrap, setConfirmedPriceTrap] = useState(false);
  const [selectedVertical, setSelectedVertical] = useState<'customer-service' | 'bookkeeping' | 'outbound-sales'>('customer-service');

  // Call Notes & Dispositions
  const [notesDraft, setNotesDraft] = useState('Julian Vance (Apex Global BPO) - 250 seats. Buys from Outsource Accelerator. Confirmed shared-lead price war pain. Booking 20-min demo with Founder Emil.');
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

  // Official BPO Client Acquisition Playbook: Claude ICP Enrichment & AI Sparring Engine
  const steps = [
    { 
      num: 1, 
      title: 'Opener & Directory Check', 
      time: '20 SEC',
      purpose: 'Pattern interrupt & establish shared frame: check if they buy from directories like Outsource Accelerator.',
      line1: `"Hi ${customerName.split(' ')[0] || 'there'}, I know you weren't expecting my call—do you have 30 seconds?"`,
      line2: `"A lot of BPO leaders we talk to buy leads from directories like Outsource Accelerator... does that name ring a bell?"`,
      footnote: `If YES: "Got it, so you're familiar with how that model works." | If NO: "No worries at all—they're essentially an outsourcing directory where BPOs buy client lead lists."`
    },
    { 
      num: 2, 
      title: 'Confirm Core Bottleneck', 
      time: '30 SEC',
      purpose: 'Expose the Shared-Lead Price Trap (3-5 BPOs pitching the same lead). Stop talking and let them vent.',
      line1: `"The biggest headache BPO bosses share with us is that lead vendors sell those exact same names to 3 to 5 other BPOs at the exact same time."`,
      line2: `"Are you guys noticing that too, where your sales team is constantly fighting off cheaper prices on those shared leads?"`,
      footnote: `CRITICAL: Stop talking. Let them vent about price wars. Once validated: "Exactly. It forces you into a margin-killing price race to the bottom."`
    },
    { 
      num: 3, 
      title: 'Problem vs. Solution', 
      time: '45 SEC',
      purpose: 'Contrast burning expensive leads as warm-up swings vs. Private Claude-enriched lists + Pre-dial AI Sparring.',
      line1: `"When you pay top dollar for leads, you can't afford to let reps use live prospects as warm-up swings. We generate private, Claude-enriched lists that zero competitors have seen..."`,
      line2: `"...and our pre-dial AI simulator gives your reps 5 practice rounds to warm up before they touch a single live contact."`,
      footnote: `Diagnostic transition: "Which verticals bring in the most money for you guys—Customer Service, Bookkeeping, or Outbound Sales?"`
    },
    { 
      num: 4, 
      title: 'Vertical Diagnostic Pivot', 
      time: '45 SEC',
      purpose: 'Tailor the pitch to their primary vertical: CS ($8/hr price race), Bookkeeping (accounting software trust), or Sales (impatient gatekeepers).',
      line1: selectedVertical === 'customer-service'
        ? `"For customer support, our AI trains your reps against clients demanding an $8/hour offshore rate by anchoring CSAT and first-contact resolution."`
        : selectedVertical === 'bookkeeping'
        ? `"For bookkeeping and back-office, our AI trains reps on QuickBooks, Xero, and data trust so they sound like experienced financial pros."`
        : `"For outbound sales, our AI trains reps against impatient execs trying to hang up within 10 seconds, doubling live conversion rates."`,
      line2: `"Which of those bottlenecks is hitting your floor hardest right now?"`,
      footnote: `Select their primary profit center (Customer Service, Bookkeeping, or Sales) to adapt the live pitch.`
    },
    { 
      num: 5, 
      title: 'The Close: Demo with Emil', 
      time: '30 SEC',
      purpose: 'Anchor Founder Emil (17+ yrs BPO veteran) and lock a 20-min screen share demo for Thursday at 2:00 PM or Friday morning.',
      line1: `"Our founder, Emil, has been in the BPO BDM trenches for over 17 years. He put together a 20-minute screen share showing how we build private Claude-enriched lists and let reps spar with AI before live calls."`,
      line2: `"Would you be open to taking a look with Emil this Thursday at 2:00 PM, or does Friday morning work better for your calendar?"`,
      footnote: `Lock in Thursday 2:00 PM or Friday morning, confirm direct email, and send calendar invite.`
    },
  ];

  // Official BPO Client Acquisition ARM Rebuttals (Acknowledge, Respond, Move)
  const rebuttals: ARMRebuttal[] = [
    {
      id: 'reb_veteran_reps',
      category: 'Experience',
      categoryColor: 'bg-blue-50 text-blue-800 border-blue-200',
      trigger: 'Our reps have years of experience, they don\'t need practice',
      listenFor: 'Pride in veteran senior sales team.',
      acknowledge: 'Makes total sense—having seasoned reps who know the BPO space inside and out is a massive advantage.',
      respond: 'The reason teams work with Emil is that when you\'re paying top dollar for leads, you can\'t afford to let even senior reps use the first 5 dials of the day as warm-up swings. Our AI gets them in the zone before they touch a single live contact.',
      move: 'Would you be open to a 20-minute look with Emil this Thursday afternoon?',
      fullSpoken: 'Makes total sense—having seasoned reps who know the BPO space inside and out is a massive advantage. The reason teams work with Emil is that when you\'re paying top dollar for leads, you can\'t afford to let even senior reps use the first 5 dials of the day as warm-up swings. Our AI gets them in the zone before they touch a single live contact. Would you be open to a 20-minute look with Emil this Thursday afternoon?'
    },
    {
      id: 'reb_oa_directory',
      category: 'Incumbent',
      categoryColor: 'bg-purple-50 text-purple-800 border-purple-200',
      trigger: 'We already buy our leads from Outsource Accelerator / brokers',
      listenFor: 'Active lead budget with directories.',
      acknowledge: 'That\'s great—it means you have active budget and a dedicated sales team ready to close deals.',
      respond: 'The only catch is that directory leads get pitched by 3 to 5 rival BPOs simultaneously, cutting your margins in half. We generate private, Claude-enriched lists that zero competitors have seen, paired with pre-dial AI training.',
      move: 'Could we show you a private sample list for your vertical this Thursday with Emil?',
      fullSpoken: 'That\'s great—it means you have active budget and a dedicated sales team ready to close deals. The only catch is that directory leads get pitched by 3 to 5 rival BPOs simultaneously, cutting your margins in half. We generate private, Claude-enriched lists that zero competitors have seen, paired with pre-dial AI training. Could we show you a private sample list for your vertical this Thursday with Emil?'
    },
    {
      id: 'reb_email_pricing',
      category: 'Budget',
      categoryColor: 'bg-amber-50 text-amber-800 border-amber-200',
      trigger: 'Just email me your pricing / send some info',
      listenFor: 'Pricing brush-off without understanding value.',
      acknowledge: 'Gladly—I\'ll get a full overview sent over so you have it in writing.',
      respond: 'Because pricing is tied to your specific BPO vertical and how many reps are sparring on the platform, Emil tailors the numbers directly on a brief screen share.',
      move: 'Are you free for 20 minutes with Emil on Thursday at 2:00 PM, or is Friday morning better?',
      fullSpoken: 'Gladly—I\'ll get a full overview sent over so you have it in writing. Because pricing is tied to your specific BPO vertical and how many reps are sparring on the platform, Emil tailors the numbers directly on a brief screen share. Are you free for 20 minutes with Emil on Thursday at 2:00 PM, or is Friday morning better?'
    },
    {
      id: 'reb_too_busy',
      category: 'Timing',
      categoryColor: 'bg-blue-50 text-blue-800 border-blue-200',
      trigger: 'We are too busy for a demo right now',
      listenFor: 'Operational floor overload.',
      acknowledge: 'Completely understand—running a high-volume BPO operation takes every ounce of bandwidth.',
      respond: 'That\'s exactly why Emil built this: to stop your reps from burning hours fighting price wars on shared leads that competitors are already closing.',
      move: 'Could we carve out just 20 minutes before your floor gets crazy—say Thursday at 8:30 AM or Friday morning?',
      fullSpoken: 'Completely understand—running a high-volume BPO operation takes every ounce of bandwidth. That\'s exactly why Emil built this: to stop your reps from burning hours fighting price wars on shared leads that competitors are already closing. Could we carve out just 20 minutes before your floor gets crazy—say Thursday at 8:30 AM or Friday morning?'
    },
    {
      id: 'reb_internal_training',
      category: 'Incumbent',
      categoryColor: 'bg-purple-50 text-purple-800 border-purple-200',
      trigger: 'We train our reps internally',
      listenFor: 'Internal team leader coaching pride.',
      acknowledge: 'That\'s awesome—internal coaching is how you maintain quality and culture.',
      respond: 'The challenge team leaders tell us is they don\'t have hours each morning to roleplay 1-on-1 with every rep. Our AI sparring tool gives each rep 5 realistic objection rounds in 5 minutes before their shift even starts.',
      move: 'Would you be opposed to seeing how Emil sets up the sparring bots this Thursday at 2:00 PM?',
      fullSpoken: 'That\'s awesome—internal coaching is how you maintain quality and culture. The challenge team leaders tell us is they don\'t have hours each morning to roleplay 1-on-1 with every rep. Our AI sparring tool gives each rep 5 realistic objection rounds in 5 minutes before their shift even starts. Would you be opposed to seeing how Emil sets up the sparring bots this Thursday at 2:00 PM?'
    },
    {
      id: 'reb_authenticity',
      category: 'Authenticity',
      categoryColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      trigger: 'Is this an AI robot or automated dialer voice?',
      listenFor: 'Prospect checking for robotic or synthetic presence.',
      acknowledge: 'Haha, nope! I\'m an actual live human being dialing you from our team right now.',
      respond: 'We develop real-time AI sparring technology for BPOs, but every conversation on our line is 100% authentic human-to-human.',
      move: 'Curious—have you explored deploying live AI sparring simulation for your appointment setters yet?',
      fullSpoken: 'Haha, nope! I\'m an actual live human being dialing you from our team right now. We develop real-time AI sparring technology for BPOs, but every conversation on our line is 100% authentic human-to-human. Curious—have you explored deploying live AI sparring simulation for your appointment setters yet?'
    },
    {
      id: 'reb_burned',
      category: 'Burned',
      categoryColor: 'bg-red-50 text-red-800 border-red-200',
      trigger: 'We tried an outbound service before and it burned our domain',
      listenFor: 'Trauma from low-quality spam or poor agency execution.',
      acknowledge: 'I don\'t blame you for being skeptical—most offshore teams spam generic lists and ruin deliverability.',
      respond: 'We don\'t spam. We use Claude to build exclusive, verified ICP lists and enforce live Boris acoustic QA to guarantee 100% brand safety.',
      move: 'Can I show you our live acoustic verification on the screen share with Emil this Thursday?',
      fullSpoken: 'I don\'t blame you for being skeptical—most offshore teams spam generic lists and ruin deliverability. We don\'t spam. We use Claude to build exclusive, verified ICP lists and enforce live Boris acoustic QA to guarantee 100% brand safety. Can I show you our live acoustic verification on the screen share with Emil this Thursday?'
    },
    {
      id: 'reb_privacy',
      category: 'Privacy',
      categoryColor: 'bg-rose-50 text-rose-800 border-rose-200',
      trigger: 'How did you get my direct phone number?',
      listenFor: 'Privacy resistance or suspicion of unsolicited contact.',
      acknowledge: 'Fair question! I always want to be 100% transparent.',
      respond: 'We use Claude-powered ICP enrichment to identify BPO founders and managing directors who are actively competing in the outsourcing market.',
      move: 'Since I have you for just 20 seconds, are shared-lead price wars something impacting your sales floor right now?',
      fullSpoken: 'Fair question! I always want to be 100% transparent. We use Claude-powered ICP enrichment to identify BPO founders and managing directors who are actively competing in the outsourcing market. Since I have you for just 20 seconds, are shared-lead price wars something impacting your sales floor right now?'
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

                  {/* Step 1 Interactive OA Check */}
                  {currentStep === 1 && (
                    <div className="bg-[#F2F0EF] p-3 rounded-xl border border-[#222021]/10 space-y-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6b6968] block">
                        OUTSOURCE ACCELERATOR DIRECTORY CHECK:
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setRecognizedOA(true)}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${
                            recognizedOA === true
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                              : 'bg-white border-[#222021]/15 text-[#222021] hover:border-emerald-600'
                          }`}
                        >
                          ✓ Yes, Recognizes OA
                        </button>
                        <button
                          type="button"
                          onClick={() => setRecognizedOA(false)}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${
                            recognizedOA === false
                              ? 'bg-zinc-800 border-zinc-800 text-white shadow-xs'
                              : 'bg-white border-[#222021]/15 text-[#222021] hover:border-zinc-800'
                          }`}
                        >
                          ✕ No, Never Heard
                        </button>
                      </div>
                      {recognizedOA === true && (
                        <p className="text-xs text-emerald-800 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                          🎯 Speak Branch: "Got it, so you're familiar with how that model works." (Proceed to Step 2)
                        </p>
                      )}
                      {recognizedOA === false && (
                        <p className="text-xs text-zinc-800 font-medium bg-zinc-100 p-2 rounded-lg border border-zinc-200">
                          ℹ️ Speak Branch: "No worries at all—they're essentially an outsourcing directory where BPOs buy client lead lists." (Proceed to Step 2)
                        </p>
                      )}
                    </div>
                  )}

                  {/* Step 2 Interactive Shared-Lead Pain Check */}
                  {currentStep === 2 && (
                    <div className="bg-[#F2F0EF] p-3 rounded-xl border border-[#222021]/10 space-y-2">
                      <button
                        type="button"
                        onClick={() => setConfirmedPriceTrap(!confirmedPriceTrap)}
                        className={`w-full p-2.5 rounded-lg border text-left flex items-center gap-2.5 transition-all ${
                          confirmedPriceTrap
                            ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold shadow-2xs'
                            : 'bg-white border-[#222021]/15 text-[#222021]'
                        }`}
                      >
                        <span className={`h-4 w-4 rounded flex items-center justify-center border shrink-0 ${confirmedPriceTrap ? 'bg-amber-600 border-amber-600 text-white' : 'border-zinc-400 bg-white'}`}>
                          {confirmedPriceTrap ? '✓' : ''}
                        </span>
                        <span className="text-xs leading-snug">
                          Prospect Confirmed: Shared-Lead Price Trap (3-5 rival BPOs pitching same lead)
                        </span>
                      </button>
                      {confirmedPriceTrap && (
                        <p className="text-xs text-amber-900 bg-amber-100/70 p-2 rounded-lg border border-amber-200 font-medium">
                          💡 Tactical Pivot: "Exactly. It forces you into a margin-killing price race to the bottom where clients demand $8/hr."
                        </p>
                      )}
                    </div>
                  )}

                  {/* Step 4 Interactive Vertical Selector */}
                  {currentStep === 4 && (
                    <div className="bg-[#F2F0EF] p-3 rounded-xl border border-[#222021]/10 space-y-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6b6968] block">
                        SELECT PROSPECT'S PRIMARY VERTICAL PROFIT CENTER:
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedVertical('customer-service')}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all border text-center ${
                            selectedVertical === 'customer-service'
                              ? 'bg-[#ED1C24] border-[#ED1C24] text-white shadow-xs'
                              : 'bg-white border-[#222021]/15 text-[#222021]'
                          }`}
                        >
                          🎧 Support ($8/hr)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedVertical('bookkeeping')}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all border text-center ${
                            selectedVertical === 'bookkeeping'
                              ? 'bg-[#ED1C24] border-[#ED1C24] text-white shadow-xs'
                              : 'bg-white border-[#222021]/15 text-[#222021]'
                          }`}
                        >
                          📊 Bookkeeping
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedVertical('outbound-sales')}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all border text-center ${
                            selectedVertical === 'outbound-sales'
                              ? 'bg-[#ED1C24] border-[#ED1C24] text-white shadow-xs'
                              : 'bg-white border-[#222021]/15 text-[#222021]'
                          }`}
                        >
                          📞 Outbound Sales
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 5 Interactive Booking Banner */}
                  {currentStep === 5 && (
                    <div className="bg-gradient-to-r from-zinc-900 to-black text-white p-3.5 rounded-xl border border-zinc-800 space-y-2 shadow-inner">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold flex items-center gap-1.5">
                          <span>📅 FOUNDER DEMO CALENDAR</span>
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                          17+ Yrs BDM Veteran
                        </span>
                      </div>
                      <p className="text-xs text-zinc-200">
                        Targeting 20-minute screen share with Emil to preview private Claude list & AI sparring agents.
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setNotesDraft(prev => prev + '\n[MEETING BOOKED] 20-min demo with Founder Emil confirmed for Thursday 2:00 PM.');
                            setDisposition('Meeting Booked');
                          }}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-[#ED1C24] hover:bg-[#d0181f] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>Thursday 2:00 PM</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNotesDraft(prev => prev + '\n[MEETING BOOKED] 20-min demo with Founder Emil confirmed for Friday 10:00 AM.');
                            setDisposition('Meeting Booked');
                          }}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>Friday 10:00 AM</span>
                        </button>
                      </div>
                    </div>
                  )}

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
