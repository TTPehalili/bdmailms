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
  HelpCircle,
  Calendar,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  CheckSquare,
  Square,
  UserCheck,
  Loader2,
  Tag,
  Briefcase,
  Building2,
  Users,
  ShieldAlert
} from 'lucide-react';
import AppSidebar from '@/components/AppSidebar';
import GlobalTopHeader from '@/components/GlobalTopHeader';

interface ARMRebuttal {
  id: string;
  category: 'Need Clients' | 'Pricing' | 'Lead Vendors' | 'Training' | 'Brush-Off & Timing' | 'Authenticity';
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

  // Customer / Lead State
  const [customerName, setCustomerName] = useState('Julian Vance');
  const [partnerName, setPartnerName] = useState('Apex Global BPO');
  const [title, setTitle] = useState('Managing Director & Head of Outbound');
  const [department, setDepartment] = useState('Client Acquisition & Outbound Sales');
  const [phone, setPhone] = useState('+1 (415) 890-1284');
  const [headcount, setHeadcount] = useState('250 Seats (Manila & Cebu)');
  const [repName, setRepName] = useState('Alex Mercer');
  const [companyName, setCompanyName] = useState('Appointmentlyy');
  const [leadNotes, setLeadNotes] = useState('Directory Lead Source: Outsource Accelerator\nFloor: 250 Seats handling CS & Sales\nBottleneck: Competing against 3-5 BPOs on identical shared lists ($8/hr margin crush)\nNext Step: 20-min demo with Founder Emil (17+ yrs BDM)');

  // Interactive State Machine (Developer Spec 6-Screen Architecture)
  // Screen 1: Role Verification Gate
  const [roleStatus, setRoleStatus] = useState<'confirmed' | 'promoted' | 'changed' | null>(null);
  const [promotedTitleInput, setPromotedTitleInput] = useState('');
  const [referralContactInput, setReferralContactInput] = useState('');

  // Screen 2: Directory & Shared Lead Trap
  const [recognizedOA, setRecognizedOA] = useState<boolean | null>(null);
  const [priceTrapStatus, setPriceTrapStatus] = useState<'confirmed' | 'denial' | null>(null);

  // Screen 4 & 5: Dynamic Diagnostic Engine
  const [targetIndustries, setTargetIndustries] = useState<string[]>(['E-commerce / Retail', 'FinTech / Financial']);
  const [primaryService, setPrimaryService] = useState<'customer-service' | 'bookkeeping' | 'outbound-sales' | 'technical-support' | 'other'>('customer-service');
  const [customServiceInput, setCustomServiceInput] = useState('');

  // Screen 6: The Close & Emil Calendly
  const [bookingSlot, setBookingSlot] = useState<string | null>(null);
  const [disposition, setDisposition] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [showCalendlyModal, setShowCalendlyModal] = useState<boolean>(false);
  const [showPlaybookModal, setShowPlaybookModal] = useState<boolean>(false);
  const [calendlyLoading, setCalendlyLoading] = useState<boolean>(true);
  const [showCalendlyEmbed, setShowCalendlyEmbed] = useState<boolean>(true);
  const [customRepNotes, setCustomRepNotes] = useState<string>('');

  // Derived Active Service Label for dynamic objection insertion
  const getActiveServiceLabel = () => {
    switch (primaryService) {
      case 'customer-service': return 'Customer Service / Support';
      case 'bookkeeping': return 'Bookkeeping / Accounting';
      case 'outbound-sales': return 'Outbound Sales';
      case 'technical-support': return 'Technical Support';
      case 'other': return customServiceInput.trim() || 'Specialized BPO Services';
    }
  };

  // Reactive CRM Note Generator
  const generateCrmNotes = (overrides?: {
    cName?: string;
    pName?: string;
    cTitle?: string;
    cDept?: string;
    cPhone?: string;
    cHeadcount?: string;
    rStatus?: 'confirmed' | 'promoted' | 'changed' | null;
    oa?: boolean | null;
    trap?: 'confirmed' | 'denial' | null;
    industries?: string[];
    service?: 'customer-service' | 'bookkeeping' | 'outbound-sales' | 'technical-support' | 'other';
    customServ?: string;
    slot?: string | null;
    disp?: string | null;
    custom?: string;
  }) => {
    const cName = overrides?.cName ?? customerName;
    const pName = overrides?.pName ?? partnerName;
    const cTitle = overrides?.cTitle ?? title;
    const cDept = overrides?.cDept ?? department;
    const cPhone = overrides?.cPhone ?? phone;
    const cHeadcount = overrides?.cHeadcount ?? headcount;
    const rStatus = overrides?.rStatus !== undefined ? overrides.rStatus : roleStatus;
    const oa = overrides?.oa !== undefined ? overrides.oa : recognizedOA;
    const trap = overrides?.trap !== undefined ? overrides.trap : priceTrapStatus;
    const industries = overrides?.industries ?? targetIndustries;
    const service = overrides?.service ?? primaryService;
    const customServ = overrides?.customServ !== undefined ? overrides.customServ : customServiceInput;
    const slot = overrides?.slot !== undefined ? overrides.slot : bookingSlot;
    const disp = overrides?.disp !== undefined ? overrides.disp : disposition;
    const custom = overrides?.custom !== undefined ? overrides.custom : customRepNotes;

    const roleText = rStatus === 'confirmed'
      ? `✓ Confirmed active in role (${cTitle} • ${cDept})`
      : rStatus === 'promoted'
      ? `✏️ Promoted/New Title: ${cTitle}`
      : rStatus === 'changed'
      ? `✕ Left role / referral noted`
      : `• Role verification pending`;

    const oaText = oa === true
      ? '✓ Buys from Outsource Accelerator / Directory brokers (Confirmed OA buyer)'
      : oa === false
      ? '✕ Does NOT buy from Outsource Accelerator (Directory awareness: No)'
      : '• Directory sourcing pending confirmation';

    const trapText = trap === 'confirmed'
      ? '✓ CONFIRMED: Shared-lead price wars (pitched by 3-5 rival BPOs simultaneously)'
      : trap === 'denial'
      ? '• Prospect claims exclusive leads / defended margins'
      : '• Price-trap bottleneck pending confirmation';

    const industryText = industries.length > 0
      ? industries.join(', ')
      : 'General BPO';

    const serviceText = service === 'customer-service'
      ? '🎧 Customer Service / Support ($8/hr commodity rate pressure)'
      : service === 'bookkeeping'
      ? '📊 Bookkeeping / Accounting / Back-Office (QuickBooks/Xero trust)'
      : service === 'outbound-sales'
      ? '📞 Outbound Sales / Appointment Setting (10-second gatekeeper hook)'
      : service === 'technical-support'
      ? '💻 Technical Support / IT Helpdesk (Tier 1 vs. Tier 2 language)'
      : `✨ Other: ${customServ || 'Specialized BPO Services'}`;

    const meetingText = slot
      ? `📅 ${slot} (20-min Founder Screen Share with Emil)`
      : '• Demo pending time confirmation';

    const dispText = disp ? disp : slot ? 'Meeting Booked' : 'In Progress';

    let out = `=== APPOINTMENTLYY SDR CALL LOG ===\n`;
    out += `PROSPECT: ${cName} | ${pName}\n`;
    out += `ROLE: ${cTitle} (${cHeadcount})\n`;
    out += `PHONE: ${cPhone}\n`;
    out += `OUTCOME: ${dispText}\n\n`;
    out += `QUALIFICATION BREAKDOWN:\n`;
    out += `• Role Status: ${roleText}\n`;
    out += `• Directory Sourcing: ${oaText}\n`;
    out += `• Sourcing Pain: ${trapText}\n`;
    out += `• Target Industries: ${industryText}\n`;
    out += `• Primary Revenue Service: ${serviceText}\n`;
    out += `• Founder Meeting: ${meetingText}\n`;
    if (custom && custom.trim()) {
      out += `\nREP NOTES:\n${custom.trim()}\n`;
    }
    return out;
  };

  const [notesDraft, setNotesDraft] = useState<string>(() => generateCrmNotes());

  // Interactive Button Click Handlers that Auto-Update CRM Notes
  const handleSetRole = (status: 'confirmed' | 'promoted' | 'changed') => {
    setRoleStatus(status);
    setNotesDraft(generateCrmNotes({ rStatus: status }));
  };

  const handleUpdatePromotedTitle = (newTitle: string) => {
    setTitle(newTitle);
    setNotesDraft(generateCrmNotes({ cTitle: newTitle }));
  };

  const handleSetOA = (val: boolean) => {
    setRecognizedOA(val);
    setNotesDraft(generateCrmNotes({ oa: val }));
  };

  const handleSetPriceTrap = (status: 'confirmed' | 'denial') => {
    setPriceTrapStatus(status);
    setNotesDraft(generateCrmNotes({ trap: status }));
  };

  const handleToggleIndustry = (tag: string) => {
    const next = targetIndustries.includes(tag)
      ? targetIndustries.filter(t => t !== tag)
      : [...targetIndustries, tag];
    setTargetIndustries(next);
    setNotesDraft(generateCrmNotes({ industries: next }));
  };

  const handleSetService = (serv: 'customer-service' | 'bookkeeping' | 'outbound-sales' | 'technical-support' | 'other') => {
    setPrimaryService(serv);
    setNotesDraft(generateCrmNotes({ service: serv }));
  };

  const handleSetCustomService = (val: string) => {
    setCustomServiceInput(val);
    setNotesDraft(generateCrmNotes({ customServ: val }));
  };

  const handleSelectSlot = (slot: string) => {
    setBookingSlot(slot);
    setDisposition('Meeting Booked');
    setNotesDraft(generateCrmNotes({ slot, disp: 'Meeting Booked' }));
  };

  const handleSetDisposition = (d: string | null) => {
    setDisposition(d);
    setNotesDraft(generateCrmNotes({ disp: d }));
  };

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

  // 5 Step Teleprompter Navigation Models
  const steps = [
    {
      num: 1,
      shortTitle: '1. Role Verification',
      title: 'Opener & Role Verification Gate',
      time: '20 SEC',
      purpose: 'Verify the executive is still actively leading the department before pitching.'
    },
    {
      num: 2,
      shortTitle: '2. Directory & Trap',
      title: 'Directory Anchor & The Shared Lead Trap',
      time: '30 SEC',
      purpose: 'Expose the Shared-Lead Price Trap (3-5 rival BPOs pitching same lead). Stop talking and let them vent.'
    },
    {
      num: 3,
      shortTitle: '3. Problem vs. Fix',
      title: 'The Bigger Picture: Problem vs. Fix',
      time: '45 SEC',
      purpose: 'Contrast burning expensive leads on practice swings vs. Private Claude Lists + Pre-Dial AI Sparring.'
    },
    {
      num: 4,
      shortTitle: '4. Diagnostic Engine',
      title: 'Dynamic Diagnostic Engine (Industry & Service)',
      time: '45 SEC',
      purpose: 'Capture target industries and primary revenue service to trigger tailored live script responses.'
    },
    {
      num: 5,
      shortTitle: '5. Founder Demo Close',
      title: 'The Close: 20-Min Screen Share with Emil',
      time: '30 SEC',
      purpose: 'Anchor Founder Emil (17+ yrs BDM) and lock calendar slot directly in live Calendly widget.'
    }
  ];

  const currentStepData = steps[currentStep - 1] || steps[0];

  // Official BPO Client Acquisition ARM Rebuttals (Updated from Developer Spec)
  const activeServiceLabel = getActiveServiceLabel();

  const rebuttals: ARMRebuttal[] = [
    {
      id: 'OBJ_NEED_CLIENTS_NOT_TOOLS',
      category: 'Need Clients',
      categoryColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      trigger: 'We just need clients, we don\'t need another tool',
      listenFor: 'Prospect thinks this is software clutter and wants immediate revenue/leads.',
      acknowledge: '100% fair, Julian. At the end of the day, you can\'t pay payroll with software—you need paying clients.',
      respond: 'That\'s exactly why we don\'t sell "just software." The problem is, buying more leads or appointments doesn\'t fix anything if your reps get cut down on price the moment a prospect picks up. We give you the targeted client pipeline—built and fully enriched by Claude—and give your reps the sparring tool so they actually win and close those clients instead of losing them to cheaper BPOs.',
      move: 'Emil built this specifically to put signed client contracts in your pipeline, not add tech clutter. Give him 20 minutes to show you how the client acquisition engine works. How does Thursday at 2:00 PM look?',
      fullSpoken: '100% fair, Julian. At the end of the day, you can\'t pay payroll with software—you need paying clients. That\'s exactly why we don\'t sell "just software." The problem is, buying more leads or appointments doesn\'t fix anything if your reps get cut down on price the moment a prospect picks up. We give you the targeted client pipeline—built and fully enriched by Claude—and give your reps the sparring tool so they actually win and close those clients instead of losing them to cheaper BPOs. Emil built this specifically to put signed client contracts in your pipeline, not add tech clutter. Give him 20 minutes to show you how the client acquisition engine works. How does Thursday at 2:00 PM look?'
    },
    {
      id: 'OBJ_PRICE_TELL_ME_NOW',
      category: 'Pricing',
      categoryColor: 'bg-amber-50 text-amber-800 border-amber-200',
      trigger: 'How much does this cost? Just tell me the price.',
      listenFor: 'Prospect demanding upfront flat pricing before scope alignment.',
      acknowledge: 'I completely get it, Julian—you need to know if the numbers make sense before spending any time on this.',
      respond: 'Because everything we do is custom built, there\'s no flat price tag. Our pricing depends strictly on your scope: how many enriched prospect records you need pulled each month, and how we customize the AI Sparring Agent to match your BPO\'s exact sales scripts and service lines. We need to be 100% clear on your outbound roadmap before we quote a dime so you never pay for things you don\'t need.',
      move: 'Emil can map out that roadmap with you in 10 minutes on a screen share and give you an exact price based on your volume. How does Thursday at 2:00 PM look to look over the numbers?',
      fullSpoken: 'I completely get it, Julian—you need to know if the numbers make sense before spending any time on this. Because everything we do is custom built, there\'s no flat price tag. Our pricing depends strictly on your scope: how many enriched prospect records you need pulled each month, and how we customize the AI Sparring Agent to match your BPO\'s exact sales scripts and service lines. We need to be 100% clear on your outbound roadmap before we quote a dime so you never pay for things you don\'t need. Emil can map out that roadmap with you in 10 minutes on a screen share and give you an exact price based on your volume. How does Thursday at 2:00 PM look to look over the numbers?'
    },
    {
      id: 'OBJ_PRICE_RATE_CARD',
      category: 'Pricing',
      categoryColor: 'bg-amber-50 text-amber-800 border-amber-200',
      trigger: 'Just email me a rate card or price sheet.',
      listenFor: 'Prospect wanting generic PDF rate sheet to avoid a live call.',
      acknowledge: 'I can definitely send information over—I know you want to protect your calendar.',
      respond: `The reason we don't have a static one-page rate card is because we aren't selling generic list packages. We build custom data pipelines for your specific service in ${activeServiceLabel} and train custom AI sparring bots on your internal scripts. Giving you a generic sheet would just be guessing at your needs.`,
      move: 'Hop on with Emil for 20 minutes. He\'ll look at how many seats and leads you run, show you the custom sparring tool live, and walk you through an exact price breakdown. Would Thursday afternoon or Friday morning work better?',
      fullSpoken: `I can definitely send information over—I know you want to protect your calendar. The reason we don't have a static one-page rate card is because we aren't selling generic list packages. We build custom data pipelines for your specific service in ${activeServiceLabel} and train custom AI sparring bots on your internal scripts. Giving you a generic sheet would just be guessing at your needs. Hop on with Emil for 20 minutes. He\'ll look at how many seats and leads you run, show you the custom sparring tool live, and walk you through an exact price breakdown. Would Thursday afternoon or Friday morning work better?`
    },
    {
      id: 'OBJ_PRICE_NO_BUDGET',
      category: 'Pricing',
      categoryColor: 'bg-amber-50 text-amber-800 border-amber-200',
      trigger: 'We don\'t have budget for new software right now.',
      listenFor: 'Strict P&L expense caution or budget freeze.',
      acknowledge: 'I completely respect that. Running a BPO means keeping a tight lid on expenses.',
      respond: 'This isn\'t an extra software expense; it replaces the money you\'re already burning when reps fumble expensive leads or get beaten by cheaper offshore bids. We customize the whole scope to fit right inside what you already spend on lead data.',
      move: 'Let\'s take money off the table completely. Take 20 minutes with Emil to see how the system stops lead burn. If the math doesn\'t show an immediate return, we shake hands and walk away. Does next Tuesday at 10:00 AM work?',
      fullSpoken: 'I completely respect that. Running a BPO means keeping a tight lid on expenses. This isn\'t an extra software expense; it replaces the money you\'re already burning when reps fumble expensive leads or get beaten by cheaper offshore bids. We customize the whole scope to fit right inside what you already spend on lead data. Let\'s take money off the table completely. Take 20 minutes with Emil to see how the system stops lead burn. If the math doesn\'t show an immediate return, we shake hands and walk away. Does next Tuesday at 10:00 AM work?'
    },
    {
      id: 'OBJ_VENDOR_OUTSOURCE_ACCELERATOR',
      category: 'Lead Vendors',
      categoryColor: 'bg-purple-50 text-purple-800 border-purple-200',
      trigger: 'We already buy our leads from Outsource Accelerator / brokers.',
      listenFor: 'Active directory lead sourcing budget.',
      acknowledge: 'That makes total sense—they do a great job sending lead volume.',
      respond: 'The catch is, you\'re paying full price for leads that are shared with 3 to 5 other BPOs. If your reps aren\'t pre-trained to beat lower price quotes the second a buyer brings them up, that lead spend is just wasted money.',
      move: 'Let\'s grab 20 minutes with Emil so he can show you how our private lists and AI sparring tool protect your margins on those calls. How does Thursday look?',
      fullSpoken: 'That makes total sense—they do a great job sending lead volume. The catch is, you\'re paying full price for leads that are shared with 3 to 5 other BPOs. If your reps aren\'t pre-trained to beat lower price quotes the second a buyer brings them up, that lead spend is just wasted money. Let\'s grab 20 minutes with Emil so he can show you how our private lists and AI sparring tool protect your margins on those calls. How does Thursday look?'
    },
    {
      id: 'OBJ_VENDOR_EXCLUSIVE_LEADS',
      category: 'Lead Vendors',
      categoryColor: 'bg-purple-50 text-purple-800 border-purple-200',
      trigger: 'Our lead vendor gives us exclusive leads.',
      listenFor: 'False sense of security around broker exclusivity.',
      acknowledge: 'I hear that a lot, and on paper, that\'s what they bill you for.',
      respond: 'Even if the calendar invite wasn\'t sold twice today, that same prospect was pitched by two other BPOs two weeks ago. If your reps sound like every other vendor pitching seats, the buyer will still shop you against offshore bargain rates.',
      move: 'Emil can show you in 20 minutes how our AI sparring drills reps to completely steer the conversation away from hourly rates. Would Friday morning work?',
      fullSpoken: 'I hear that a lot, and on paper, that\'s what they bill you for. Even if the calendar invite wasn\'t sold twice today, that same prospect was pitched by two other BPOs two weeks ago. If your reps sound like every other vendor pitching seats, the buyer will still shop you against offshore bargain rates. Emil can show you in 20 minutes how our AI sparring drills reps to completely steer the conversation away from hourly rates. Would Friday morning work?'
    },
    {
      id: 'OBJ_REPS_EXPERIENCED',
      category: 'Training',
      categoryColor: 'bg-blue-50 text-blue-800 border-blue-200',
      trigger: 'Our reps have years of experience, they don\'t need practice.',
      listenFor: 'Pride in veteran senior sales callers.',
      acknowledge: 'That\'s awesome—having experienced callers is a huge advantage.',
      respond: 'The trouble is, leads cost too much money to use as warm-up swings. Even your best reps can get caught off guard when a buyer brings up a cheaper competitor\'s quote out of nowhere.',
      move: 'Emil built this so reps can sharpen their edge in 2 minutes before dialing. Would 20 minutes with him next Tuesday be worth a look?',
      fullSpoken: 'That\'s awesome—having experienced callers is a huge advantage. The trouble is, leads cost too much money to use as warm-up swings. Even your best reps can get caught off guard when a buyer brings up a cheaper competitor\'s quote out of nowhere. Emil built this so reps can sharpen their edge in 2 minutes before dialing. Would 20 minutes with him next Tuesday be worth a look?'
    },
    {
      id: 'OBJ_INTERNAL_LMS_EXISTS',
      category: 'Training',
      categoryColor: 'bg-blue-50 text-blue-800 border-blue-200',
      trigger: 'We already have internal trainers and an LMS.',
      listenFor: 'Internal coaching infrastructure in place.',
      acknowledge: 'That\'s great! Internal coaches are super important for company culture and compliance.',
      respond: 'The hard part is team leaders can\'t roleplay with every single rep for an hour every morning before they dial. The AI Sparring Agent lets every rep do 5 practice calls before breakfast without taking up your manager\'s time.',
      move: 'Let\'s grab 20 quick minutes with Emil so you can see how much time this saves your trainers. How does Wednesday morning look?',
      fullSpoken: 'That\'s great! Internal coaches are super important for company culture and compliance. The hard part is team leaders can\'t roleplay with every single rep for an hour every morning before they dial. The AI Sparring Agent lets every rep do 5 practice calls before breakfast without taking up your manager\'s time. Let\'s grab 20 quick minutes with Emil so you can see how much time this saves your trainers. How does Wednesday morning look?'
    },
    {
      id: 'OBJ_BRUSH_OFF_EMAIL',
      category: 'Brush-Off & Timing',
      categoryColor: 'bg-rose-50 text-rose-800 border-rose-200',
      trigger: 'Just send me an email.',
      listenFor: 'Polite brush-off to clear calendar / inbox.',
      acknowledge: 'Happy to do that! I know your inbox is swamped.',
      respond: `Because Emil trains these AI agents on your specific work—like your ${activeServiceLabel} calls—a plain paper won't show you how the AI voice coaching actually works.`,
      move: 'Give Emil just 20 minutes. You can test out an AI sparring call yourself on screen. If you don\'t like it in 5 minutes, you can hang up. Would Thursday afternoon work?',
      fullSpoken: `Happy to do that! I know your inbox is swamped. Because Emil trains these AI agents on your specific work—like your ${activeServiceLabel} calls—a plain paper won't show you how the AI voice coaching actually works. Give Emil just 20 minutes. You can test out an AI sparring call yourself on screen. If you don't like it in 5 minutes, you can hang up. Would Thursday afternoon work?`
    },
    {
      id: 'OBJ_TIMING_BUSY',
      category: 'Brush-Off & Timing',
      categoryColor: 'bg-rose-50 text-rose-800 border-rose-200',
      trigger: 'We are too busy right now / Call back in 6 months.',
      listenFor: 'Operational floor chaos or deferral.',
      acknowledge: 'I get it! You have a busy shop to run and deals to close.',
      respond: 'The only reason other BPO bosses jump on with Emil is because every month they wait, they are burning thousands of dollars on shared leads that get stolen by cheaper competitors.',
      move: 'Let\'s grab 20 quick minutes with Emil early next week before your day gets crazy. How does Wednesday morning look?',
      fullSpoken: 'I get it! You have a busy shop to run and deals to close. The only reason other BPO bosses jump on with Emil is because every month they wait, they are burning thousands of dollars on shared leads that get stolen by cheaper competitors. Let\'s grab 20 quick minutes with Emil early next week before your day gets crazy. How does Wednesday morning look?'
    },
    {
      id: 'OBJ_AUTHENTICITY_ROBOT',
      category: 'Authenticity',
      categoryColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      trigger: 'Is this an AI robot or automated dialer voice?',
      listenFor: 'Prospect checking for robotic presence.',
      acknowledge: 'Haha, nope! I\'m an actual live human being dialing you from our team right now.',
      respond: 'We develop real-time AI sparring technology for BPOs, but every conversation on our line is 100% authentic human-to-human.',
      move: 'Curious—have you explored deploying live AI sparring simulation for your appointment setters yet?',
      fullSpoken: 'Haha, nope! I\'m an actual live human being dialing you from our team right now. We develop real-time AI sparring technology for BPOs, but every conversation on our line is 100% authentic human-to-human. Curious—have you explored deploying live AI sparring simulation for your appointment setters yet?'
    }
  ];

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

      {/* 2. MAIN APP SHELL */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Global Utility Bar */}
        <GlobalTopHeader />

        {/* Scrollable Work Canvas */}
        <main className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          
          {/* HEADER & TOP CONTROLS */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#ED1C24] flex items-center justify-center text-white shadow-xs">
                <Swords className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight text-[#222021]">
                    AI Boris
                  </h1>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                    BPO PLAYBOOK ACTIVE
                  </span>
                </div>
                <p className="text-xs text-[#6b6968]">
                  Non-linear reactive teleprompter with auto-updating CRM notes & live Calendly booking.
                </p>
              </div>
            </div>

            {/* Top Action Bar */}
            <div className="flex items-center gap-2">
              {/* Playbook Architecture Spec Modal Button */}
              <button
                onClick={() => setShowPlaybookModal(true)}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F2F0EF] text-[#222021] border border-[#222021]/15 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <FileText className="h-3.5 w-3.5 text-[#ED1C24]" />
                <span>BPO Playbook Spec</span>
              </button>

              {/* Direct Calendly Modal Button */}
              <button
                onClick={() => setShowCalendlyModal(true)}
                className="px-3 py-1.5 rounded-lg bg-[#ED1C24] hover:bg-[#d0181f] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Book Emil on Calendly</span>
              </button>

              {/* Font Size Toggle [- A   + A] */}
              <div className="flex items-center gap-1 bg-white border border-[#222021]/15 rounded-lg p-1 text-xs font-semibold shadow-2xs">
                <button
                  onClick={() => setTextSize(prev => prev === 'huge' ? 'large' : 'normal')}
                  className="px-2 py-1 rounded hover:bg-[#F2F0EF] text-[#6b6968] transition-colors flex items-center gap-0.5 cursor-pointer"
                >
                  <Minus className="h-3 w-3" />
                  <span>A</span>
                </button>
                <div className="h-3.5 w-[1px] bg-[#222021]/15 mx-0.5" />
                <button
                  onClick={() => setTextSize(prev => prev === 'normal' ? 'large' : 'huge')}
                  className="px-2 py-1 rounded hover:bg-[#F2F0EF] text-[#222021] font-bold transition-colors flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  <span>A</span>
                </button>
              </div>
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6968]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What did the prospect say? (e.g. email, experienced, brokers, swamped, internal training...)"
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#222021]/15 rounded-xl text-xs text-[#222021] placeholder-[#6b6968] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#ED1C24] focus:border-[#ED1C24] transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6b6968] hover:text-[#222021]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* STEP VS REBUTTALS SEGMENTED TOGGLE */}
          <div className="grid grid-cols-2 p-1 bg-[#222021]/5 rounded-xl border border-[#222021]/10 text-xs font-bold">
            <button
              onClick={() => { setActiveTab('steps'); setSearchQuery(''); }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                !isRebuttalsMode ? 'bg-[#ED1C24] text-white shadow-xs' : 'text-[#6b6968] hover:text-[#222021]'
              }`}
            >
              Step-by-step Call Flow
            </button>
            <button
              onClick={() => setActiveTab('rebuttals')}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                isRebuttalsMode ? 'bg-[#ED1C24] text-white shadow-xs' : 'text-[#6b6968] hover:text-[#222021]'
              }`}
            >
              ARM Rebuttals Matrix
            </button>
          </div>

          {/* 3-COLUMN WORK AREA */}
          {!isRebuttalsMode ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              
              {/* COLUMN 1: Lead Context (3 cols) */}
              <div className="lg:col-span-3 flex flex-col gap-4">
                
                {/* Lead Identity Card */}
                <div className="bg-white border border-[#222021]/10 rounded-2xl p-4 shadow-2xs space-y-3">
                  <div>
                    <h2 className="text-sm font-extrabold text-[#222021] tracking-tight flex items-center gap-1.5">
                      <span>👤</span>
                      <span>Target Prospect</span>
                    </h2>
                    <p className="text-[11px] text-[#6b6968] mt-0.5 leading-snug">
                      Injected into every live teleprompter line and notes log.
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

                  {/* Input Fields */}
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] font-mono text-[#6b6968] block mb-0.5">Contact Name</span>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => {
                          setCustomerName(e.target.value);
                          setNotesDraft(generateCrmNotes({ cName: e.target.value }));
                        }}
                        className="w-full bg-[#F2F0EF] border border-[#222021]/10 rounded-xl px-3 py-1.5 text-xs text-[#222021] font-semibold focus:outline-none focus:bg-white focus:border-[#ED1C24]"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-[#6b6968] block mb-0.5">Company Name</span>
                      <input
                        type="text"
                        value={partnerName}
                        onChange={(e) => {
                          setPartnerName(e.target.value);
                          setNotesDraft(generateCrmNotes({ pName: e.target.value }));
                        }}
                        className="w-full bg-[#F2F0EF] border border-[#222021]/10 rounded-xl px-3 py-1.5 text-xs text-[#222021] font-semibold focus:outline-none focus:bg-white focus:border-[#ED1C24]"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-[#6b6968] block mb-0.5">Title</span>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value);
                          setNotesDraft(generateCrmNotes({ cTitle: e.target.value }));
                        }}
                        className="w-full bg-[#F2F0EF] border border-[#222021]/10 rounded-xl px-3 py-1.5 text-xs text-[#222021] font-medium focus:outline-none focus:bg-white focus:border-[#ED1C24]"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-[#6b6968] block mb-0.5">Department</span>
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => {
                          setDepartment(e.target.value);
                          setNotesDraft(generateCrmNotes({ cDept: e.target.value }));
                        }}
                        className="w-full bg-[#F2F0EF] border border-[#222021]/10 rounded-xl px-3 py-1.5 text-xs text-[#222021] font-medium focus:outline-none focus:bg-white focus:border-[#ED1C24]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-[#6b6968] block mb-0.5">Phone</span>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            setNotesDraft(generateCrmNotes({ cPhone: e.target.value }));
                          }}
                          className="w-full bg-[#F2F0EF] border border-[#222021]/10 rounded-xl px-2.5 py-1.5 text-xs text-[#222021] font-mono focus:outline-none focus:bg-white"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-[#6b6968] block mb-0.5">Headcount</span>
                        <input
                          type="text"
                          value={headcount}
                          onChange={(e) => {
                            setHeadcount(e.target.value);
                            setNotesDraft(generateCrmNotes({ cHeadcount: e.target.value }));
                          }}
                          className="w-full bg-[#F2F0EF] border border-[#222021]/10 rounded-xl px-2.5 py-1.5 text-xs text-[#222021] font-medium focus:outline-none focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lead Intel Box */}
                <div className="bg-white border border-[#222021]/10 rounded-2xl p-4 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#222021] flex items-center gap-1.5">
                      <span className="text-[#ED1C24]">⚡</span>
                      <span>SDR Intelligence</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#ED1C24]/10 text-[#ED1C24] border border-[#ED1C24]/20">
                      BPO CRM
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={leadNotes}
                    onChange={(e) => setLeadNotes(e.target.value)}
                    className="w-full bg-[#F2F0EF] border border-[#222021]/10 rounded-xl p-2.5 text-[11px] text-[#222021] font-mono focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              {/* COLUMN 2: Step-by-Step Call Flow Script (6 cols) */}
              <div className="lg:col-span-6 flex flex-col gap-4">
                
                {/* Horizontal Step Pills Navigator */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {steps.map((st) => (
                    <button
                      key={st.num}
                      onClick={() => setCurrentStep(st.num)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all shadow-2xs cursor-pointer ${
                        currentStep === st.num
                          ? 'bg-[#ED1C24] text-white shadow-xs'
                          : 'bg-white border border-[#222021]/10 text-[#6b6968] hover:text-[#222021]'
                      }`}
                    >
                      <span>{st.shortTitle}</span>
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

                  {/* ===================================================================
                      SCREEN 1: Opener & Role Verification Gate
                      =================================================================== */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      {/* Spoken Lines */}
                      <div className="space-y-3">
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <p className={`font-semibold text-[#222021] leading-relaxed ${
                            textSize === 'huge' ? 'text-2xl' : textSize === 'large' ? 'text-xl' : 'text-base'
                          }`}>
                            "Hi <span className="bg-[#ED1C24]/15 px-1 rounded font-bold font-mono">{customerName.split(' ')[0] || 'there'}</span>, this is <span className="bg-slate-200 px-1 rounded font-bold">{repName}</span> with <span className="font-bold text-[#ED1C24]">{companyName}</span>. I know I'm catching you unannounced—do you have 30 seconds?"
                          </p>
                          <div className="flex items-center gap-2 pt-2">
                            <button
                              onClick={() => playSpeech(`Hi ${customerName.split(' ')[0] || 'there'}, this is ${repName} with ${companyName}. I know I'm catching you unannounced—do you have 30 seconds?`, 's1_l1')}
                              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-100"
                            >
                              <Volume2 className="h-3.5 w-3.5 text-[#ED1C24]" />
                              <span>Hear it</span>
                            </button>
                            <button
                              onClick={() => copyText(`Hi ${customerName.split(' ')[0] || 'there'}, this is ${repName} with ${companyName}. I know I'm catching you unannounced—do you have 30 seconds?`, 's1_l1_cp')}
                              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-100"
                            >
                              {copiedKey === 's1_l1_cp' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
                              <span>Copy</span>
                            </button>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <p className={`font-semibold text-[#222021] leading-relaxed ${
                            textSize === 'huge' ? 'text-2xl' : textSize === 'large' ? 'text-xl' : 'text-base'
                          }`}>
                            "I'm reaching out because my notes show you're still leading <span className="bg-purple-100 px-1 rounded font-bold text-purple-900">{department}</span> as the <span className="bg-purple-100 px-1 rounded font-bold text-purple-900">{title}</span> over at <span className="font-bold">{partnerName}</span>—is that still accurate?"
                          </p>
                          <div className="flex items-center gap-2 pt-2">
                            <button
                              onClick={() => playSpeech(`I'm reaching out because my notes show you're still leading ${department} as the ${title} over at ${partnerName}—is that still accurate?`, 's1_l2')}
                              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-100"
                            >
                              <Volume2 className="h-3.5 w-3.5 text-[#ED1C24]" />
                              <span>Hear it</span>
                            </button>
                            <button
                              onClick={() => copyText(`I'm reaching out because my notes show you're still leading ${department} as the ${title} over at ${partnerName}—is that still accurate?`, 's1_l2_cp')}
                              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-100"
                            >
                              {copiedKey === 's1_l2_cp' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
                              <span>Copy</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Role Verification Gate Buttons */}
                      <div className="bg-[#F2F0EF] p-3.5 rounded-xl border border-[#222021]/10 space-y-2.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6b6968] block">
                          ROLE & DEPARTMENT VERIFICATION GATE:
                        </span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => handleSetRole('confirmed')}
                            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                              roleStatus === 'confirmed'
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                : 'bg-white border-[#222021]/15 text-[#222021] hover:border-emerald-600'
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Still in Role</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSetRole('promoted')}
                            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                              roleStatus === 'promoted'
                                ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                                : 'bg-white border-[#222021]/15 text-[#222021] hover:border-blue-600'
                            }`}
                          >
                            <span>✏️ Promoted / New Title</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSetRole('changed')}
                            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                              roleStatus === 'changed'
                                ? 'bg-zinc-800 border-zinc-800 text-white shadow-xs'
                                : 'bg-white border-[#222021]/15 text-[#222021] hover:border-zinc-800'
                            }`}
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Left Role / Hand-off</span>
                          </button>
                        </div>

                        {/* Inline Edit for Promoted Title */}
                        {roleStatus === 'promoted' && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                            <span className="text-xs font-bold text-blue-900 block">Enter New Title / Promotion:</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={promotedTitleInput}
                                onChange={(e) => setPromotedTitleInput(e.target.value)}
                                placeholder="e.g. Chief Revenue Officer / VP Global Ops"
                                className="flex-1 bg-white border border-blue-300 rounded-lg px-2.5 py-1.5 text-xs text-[#222021]"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (promotedTitleInput.trim()) {
                                    handleUpdatePromotedTitle(promotedTitleInput.trim());
                                  }
                                }}
                                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs"
                              >
                                Save Title
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Hand-off Card for Left Role */}
                        {roleStatus === 'changed' && (
                          <div className="p-3 bg-zinc-100 border border-zinc-300 rounded-xl space-y-2">
                            <span className="text-xs font-bold text-zinc-900 block">Hand-off Talk Track:</span>
                            <p className="text-xs text-zinc-800 italic">
                              "Got it, thanks for correcting me! Who's currently handling client acquisition or business development for {partnerName} now?"
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                              <input
                                type="text"
                                value={referralContactInput}
                                onChange={(e) => setReferralContactInput(e.target.value)}
                                placeholder="New contact name & email/phone"
                                className="flex-1 bg-white border border-zinc-300 rounded-lg px-2.5 py-1.5 text-xs text-[#222021]"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setDisposition('Referral / Update Contact');
                                  setNotesDraft(generateCrmNotes({ disp: 'Referral / Update Contact', custom: `Referral Contact: ${referralContactInput}` }));
                                }}
                                className="px-3 py-1.5 rounded-lg bg-zinc-800 text-white font-bold text-xs"
                              >
                                Log Referral
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Confirmation & Smooth Next Action */}
                        {roleStatus === 'confirmed' && (
                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                              <span className="text-xs font-bold text-emerald-950">
                                Verified: {customerName} is active in role at {partnerName}.
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setCurrentStep(2)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                            >
                              <span>Proceed to Screen 2</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ===================================================================
                      SCREEN 2: Directory Anchor & The Shared Lead Trap
                      =================================================================== */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      {/* Teleprompter Script */}
                      <div className="space-y-3">
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <p className={`font-semibold text-[#222021] leading-relaxed ${
                            textSize === 'huge' ? 'text-2xl' : textSize === 'large' ? 'text-xl' : 'text-base'
                          }`}>
                            "Awesome, glad I have the right person. We work with BPO leadership teams navigating client acquisition and vendor lists. Most operators we speak with buy data or appointment-ready leads from directories like <span className="bg-purple-100 font-bold text-purple-950 px-1 rounded">Outsource Accelerator</span>—does that name ring a bell?"
                          </p>
                          <p className="text-[11px] text-slate-500 italic mt-1 font-mono">
                            (Wait for brief acknowledgement)
                          </p>
                          <div className="flex items-center gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => handleSetOA(true)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                                recognizedOA === true ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-300 text-slate-700'
                              }`}
                            >
                              ✓ Yes, Recognizes OA
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetOA(false)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                                recognizedOA === false ? 'bg-zinc-800 border-zinc-800 text-white' : 'bg-white border-slate-300 text-slate-700'
                              }`}
                            >
                              ✕ No, Unfamiliar
                            </button>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <p className={`font-semibold text-[#222021] leading-relaxed ${
                            textSize === 'huge' ? 'text-2xl' : textSize === 'large' ? 'text-xl' : 'text-base'
                          }`}>
                            "Got it. The biggest headache BPO bosses share with us is that lead vendors sell those exact same names to 3 to 5 other BPOs. So when your team gets on the phone, the buyer hits them right away saying: <span className="bg-amber-100 text-amber-950 px-1 rounded font-bold">'I already talked to three other BPOs this week, and someone else said they'll do it way cheaper.'</span>"
                          </p>
                          <p className={`font-extrabold text-[#222021] leading-relaxed pt-2 ${
                            textSize === 'huge' ? 'text-2xl' : textSize === 'large' ? 'text-xl' : 'text-base'
                          }`}>
                            "Are you guys noticing that too, where your team is constantly fighting off cheaper prices on those shared leads?"
                          </p>
                          <div className="flex items-center gap-2 pt-2">
                            <button
                              onClick={() => playSpeech(`The biggest headache BPO bosses share with us is that lead vendors sell those exact same names to 3 to 5 other BPOs. Are you guys noticing that too, where your team is constantly fighting off cheaper prices on those shared leads?`, 's2_speech')}
                              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-100"
                            >
                              <Volume2 className="h-3.5 w-3.5 text-[#ED1C24]" />
                              <span>Hear it</span>
                            </button>
                            <button
                              onClick={() => copyText(`The biggest headache BPO bosses share with us is that lead vendors sell those exact same names to 3 to 5 other BPOs. Are you guys noticing that too, where your team is constantly fighting off cheaper prices on those shared leads?`, 's2_cp')}
                              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-100"
                            >
                              {copiedKey === 's2_cp' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
                              <span>Copy</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Rep Guidance Banner: MANDATORY REACTION GATE */}
                      <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-1">
                        <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                          <ShieldAlert className="h-4 w-4 text-amber-600" />
                          <span>MANDATORY REACTION GATE:</span>
                        </span>
                        <p className="text-xs text-amber-950 font-medium leading-snug">
                          Stop talking immediately. Do not pitch. Allow the prospect to confirm, vent, or explain their current vendor frustration.
                        </p>
                      </div>

                      {/* Developer Logic & State Gates */}
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleSetPriceTrap('confirmed')}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 cursor-pointer ${
                              priceTrapStatus === 'confirmed'
                                ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                                : 'bg-white border-[#222021]/15 text-[#222021] hover:border-amber-600'
                            }`}
                          >
                            <Check className="h-4 w-4 shrink-0" />
                            <span>Confirmed: "Yes, we see this all the time / leads are shared"</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSetPriceTrap('denial')}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 cursor-pointer ${
                              priceTrapStatus === 'denial'
                                ? 'bg-zinc-800 border-zinc-800 text-white shadow-xs'
                                : 'bg-white border-[#222021]/15 text-[#222021] hover:border-zinc-800'
                            }`}
                          >
                            <X className="h-4 w-4 shrink-0" />
                            <span>Denial: "No, our leads are exclusive / no problem"</span>
                          </button>
                        </div>

                        {/* Denial Pivot Talk Track */}
                        {priceTrapStatus === 'denial' && (
                          <div className="p-3 bg-zinc-100 border border-zinc-300 rounded-xl space-y-2">
                            <span className="text-xs font-bold text-zinc-900 block">Denial Pivot Talk Track:</span>
                            <p className="text-xs text-zinc-800 font-semibold italic">
                              "Understood. Even with exclusive lists, when buyers push back on price, how are your reps currently defending your margins?"
                            </p>
                            <button
                              type="button"
                              onClick={() => setCurrentStep(3)}
                              className="px-3 py-1.5 rounded-lg bg-zinc-800 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                            >
                              <span>Pivot to Screen 3</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Confirmed Pain Next Action */}
                        {priceTrapStatus === 'confirmed' && (
                          <div className="p-3 bg-amber-100/70 border border-amber-300 rounded-xl flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-amber-950">
                              ✓ Price Trap Confirmed: Margins getting crushed on shared leads.
                            </span>
                            <button
                              type="button"
                              onClick={() => setCurrentStep(3)}
                              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                            >
                              <span>Unlock Screen 3</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ===================================================================
                      SCREEN 3: The Bigger Picture (Problem vs. Fix)
                      =================================================================== */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      {/* Teleprompter Script */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                        <p className="text-sm font-bold text-slate-800">
                          "Here is the bigger picture of what is really happening:
                        </p>

                        <div className="p-3 rounded-lg bg-red-50 border border-red-200 space-y-1">
                          <span className="text-xs font-black text-red-900 uppercase tracking-wider block">
                            The Real Problem:
                          </span>
                          <p className="text-xs text-red-950 leading-relaxed">
                            When you buy shared leads and hand them straight to your reps, you are paying top dollar for leads, but your reps are using those expensive calls as practice swings. Because they don't know the buyer's real issues, they sound just like the other 4 BPOs. That forces you into an ugly price war where your profit gets chopped in half.
                          </p>
                        </div>

                        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1.5">
                          <span className="text-xs font-black text-emerald-900 uppercase tracking-wider block">
                            The Real Fix (Two Things Working Together):
                          </span>
                          <ol className="text-xs text-emerald-950 space-y-1 list-decimal pl-4 leading-relaxed">
                            <li>
                              <strong className="text-emerald-900">Private, Fresh Lists:</strong> We use Claude AI to build and fully enrich your dream list so you own the names and nobody else is calling them.
                            </li>
                            <li>
                              <strong className="text-emerald-900">AI Practice Before Live Dials:</strong> Before your reps touch a single expensive lead, they jump on a 2-minute test call with our <strong>AI Sparring Agent</strong>. The AI throws hard price pushback at them and coaches them on what to say.
                            </li>
                          </ol>
                          <p className="text-[11px] text-emerald-900 font-medium italic pt-1">
                            That way, your reps never burn your money practicing on real buyers—they show up ready to win.
                          </p>
                        </div>

                        <p className={`font-extrabold text-[#222021] pt-2 ${
                          textSize === 'huge' ? 'text-2xl' : textSize === 'large' ? 'text-xl' : 'text-base'
                        }`}>
                          "To see how this fits your model—what are your top 2 or 3 kinds of businesses to work with? And what services bring in the most money—is it customer service, sales, or bookkeeping?"
                        </p>

                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={() => playSpeech(`Here is the bigger picture of what is really happening. When you buy shared leads and hand them straight to your reps, you are paying top dollar for leads, but your reps are using those expensive calls as practice swings. To see how this fits your model—what are your top 2 or 3 kinds of businesses to work with? And what services bring in the most money—is it customer service, sales, or bookkeeping?`, 's3_speech')}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-100"
                          >
                            <Volume2 className="h-3.5 w-3.5 text-[#ED1C24]" />
                            <span>Hear it</span>
                          </button>
                          <button
                            onClick={() => copyText(`Here is the bigger picture of what is really happening... To see how this fits your model—what are your top 2 or 3 kinds of businesses to work with? And what services bring in the most money—is it customer service, sales, or bookkeeping?`, 's3_cp')}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-100"
                          >
                            {copiedKey === 's3_cp' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
                            <span>Copy</span>
                          </button>
                        </div>
                      </div>

                      {/* Continue to Dynamic Diagnostic Engine */}
                      <button
                        type="button"
                        onClick={() => setCurrentStep(4)}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#ED1C24] hover:bg-[#d0181f] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                      >
                        <span>Continue to Screen 4: Dynamic Diagnostic Engine</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* ===================================================================
                      SCREEN 4 & 5: Dynamic Diagnostic Engine (Branching Logic)
                      =================================================================== */}
                  {currentStep === 4 && (
                    <div className="space-y-4">
                      {/* Control 1: Top 3 Target Industry Focus Tags */}
                      <div className="bg-[#F2F0EF] p-3.5 rounded-xl border border-[#222021]/10 space-y-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6b6968] block">
                          INPUT SELECTOR 1: TOP 3 TARGET INDUSTRY FOCUS (MULTI-SELECT TAGS):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            'E-commerce / Retail',
                            'Healthcare / HIPAA',
                            'FinTech / Financial',
                            'SaaS / Tech',
                            'Logistics / Transport',
                            'Real Estate'
                          ].map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => handleToggleIndustry(tag)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                                targetIndustries.includes(tag)
                                  ? 'bg-[#222021] text-white border-[#222021] shadow-2xs'
                                  : 'bg-white border-[#222021]/15 text-[#222021] hover:border-[#222021]'
                              }`}
                            >
                              <span>{targetIndustries.includes(tag) ? '✓ ' : '+ '}{tag}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Control 2: Primary Revenue Service (Triggers Live Script) */}
                      <div className="bg-[#F2F0EF] p-3.5 rounded-xl border border-[#222021]/10 space-y-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6b6968] block">
                          INPUT SELECTOR 2: PRIMARY REVENUE SERVICE (TRIGGERS LIVE SCRIPT):
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSetService('customer-service')}
                            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border text-left cursor-pointer ${
                              primaryService === 'customer-service'
                                ? 'bg-[#ED1C24] border-[#ED1C24] text-white shadow-xs'
                                : 'bg-white border-[#222021]/15 text-[#222021]'
                            }`}
                          >
                            🎧 Customer Support
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSetService('bookkeeping')}
                            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border text-left cursor-pointer ${
                              primaryService === 'bookkeeping'
                                ? 'bg-[#ED1C24] border-[#ED1C24] text-white shadow-xs'
                                : 'bg-white border-[#222021]/15 text-[#222021]'
                            }`}
                          >
                            📊 Bookkeeping / Back-Office
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSetService('outbound-sales')}
                            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border text-left cursor-pointer ${
                              primaryService === 'outbound-sales'
                                ? 'bg-[#ED1C24] border-[#ED1C24] text-white shadow-xs'
                                : 'bg-white border-[#222021]/15 text-[#222021]'
                            }`}
                          >
                            📞 Outbound Sales / SDR
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSetService('technical-support')}
                            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border text-left cursor-pointer ${
                              primaryService === 'technical-support'
                                ? 'bg-[#ED1C24] border-[#ED1C24] text-white shadow-xs'
                                : 'bg-white border-[#222021]/15 text-[#222021]'
                            }`}
                          >
                            💻 Technical Support / IT
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSetService('other')}
                            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border text-left cursor-pointer col-span-2 sm:col-span-1 ${
                              primaryService === 'other'
                                ? 'bg-[#ED1C24] border-[#ED1C24] text-white shadow-xs'
                                : 'bg-white border-[#222021]/15 text-[#222021]'
                            }`}
                          >
                            ✨ Other Service / Niche
                          </button>
                        </div>

                        {/* Inline Text Input for Option E (Other Service) */}
                        {primaryService === 'other' && (
                          <div className="pt-2">
                            <input
                              type="text"
                              value={customServiceInput}
                              onChange={(e) => handleSetCustomService(e.target.value)}
                              placeholder="Type service here: e.g. Data Annotation, Virtual Assistance, Legal Intake"
                              className="w-full bg-white border border-[#222021]/20 rounded-xl px-3 py-2 text-xs text-[#222021] placeholder-[#6b6968] focus:outline-none focus:border-[#ED1C24]"
                            />
                          </div>
                        )}
                      </div>

                      {/* Rep Response Card (Rendered Directly Below based on Service Click) */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-900 bg-purple-100 px-2 py-0.5 rounded inline-block">
                          TAILORED VALUE CARD: {activeServiceLabel.toUpperCase()}
                        </span>

                        {primaryService === 'customer-service' && (
                          <p className={`font-semibold text-[#222021] leading-relaxed ${
                            textSize === 'huge' ? 'text-2xl' : textSize === 'large' ? 'text-xl' : 'text-base'
                          }`}>
                            "Got it. If your callers just talk about basic support, buyers treat you like a cheap commodity. The AI Sparring Agent acts like a tough buyer who wants an $8 rate, training your rep to focus on quality, retention, and fast response times instead of lowering your price."
                          </p>
                        )}

                        {primaryService === 'bookkeeping' && (
                          <p className={`font-semibold text-[#222021] leading-relaxed ${
                            textSize === 'huge' ? 'text-2xl' : textSize === 'large' ? 'text-xl' : 'text-base'
                          }`}>
                            "Makes sense. Bookkeeping needs trust. The AI Sparring Agent tests your reps on accounting software like QuickBooks or NetSuite and compliance questions, so your team sounds like real financial pros on call one."
                          </p>
                        )}

                        {primaryService === 'outbound-sales' && (
                          <p className={`font-semibold text-[#222021] leading-relaxed ${
                            textSize === 'huge' ? 'text-2xl' : textSize === 'large' ? 'text-xl' : 'text-base'
                          }`}>
                            "Understood. The AI Sparring Agent acts like an angry boss trying to hang up fast, training your reps to hook their attention in 10 seconds so they don't waste your leads."
                          </p>
                        )}

                        {primaryService === 'technical-support' && (
                          <p className={`font-semibold text-[#222021] leading-relaxed ${
                            textSize === 'huge' ? 'text-2xl' : textSize === 'large' ? 'text-xl' : 'text-base'
                          }`}>
                            "Got it. In technical support, buyers test reps on Tier 1 vs. Tier 2 problem resolution right away. The AI Sparring Agent drills your reps on IT troubleshooting language so they sound technical and qualified, not like a generic answering service."
                          </p>
                        )}

                        {primaryService === 'other' && (
                          <p className={`font-semibold text-[#222021] leading-relaxed ${
                            textSize === 'huge' ? 'text-2xl' : textSize === 'large' ? 'text-xl' : 'text-base'
                          }`}>
                            "That's a critical line of business. With <span className="font-bold text-[#ED1C24]">{customServiceInput || 'specialized services'}</span>, if callers don't understand the exact day-to-day workflow, buyers will always try to treat it as cheap hourly data entry. The AI Sparring Agent trains your reps on the specific terminology and procurement objections for {customServiceInput || 'specialized services'}, so they lead with competence and protect your billable rates."
                          </p>
                        )}

                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={() => playSpeech(
                              primaryService === 'customer-service' ? "Got it. If your callers just talk about basic support, buyers treat you like a cheap commodity. The AI Sparring Agent acts like a tough buyer who wants an $8 rate, training your rep to focus on quality, retention, and fast response times instead of lowering your price." :
                              primaryService === 'bookkeeping' ? "Makes sense. Bookkeeping needs trust. The AI Sparring Agent tests your reps on accounting software like QuickBooks or NetSuite and compliance questions, so your team sounds like real financial pros on call one." :
                              primaryService === 'outbound-sales' ? "Understood. The AI Sparring Agent acts like an angry boss trying to hang up fast, training your reps to hook their attention in 10 seconds so they don't waste your leads." :
                              primaryService === 'technical-support' ? "Got it. In technical support, buyers test reps on Tier 1 vs. Tier 2 problem resolution right away. The AI Sparring Agent drills your reps on IT troubleshooting language so they sound technical and qualified, not like a generic answering service." :
                              `That's a critical line of business. With ${customServiceInput || 'specialized services'}, if callers don't understand the exact day-to-day workflow, buyers will always try to treat it as cheap hourly data entry.`,
                              'serv_speech'
                            )}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-100"
                          >
                            <Volume2 className="h-3.5 w-3.5 text-[#ED1C24]" />
                            <span>Hear it</span>
                          </button>
                        </div>
                      </div>

                      {/* Next Action: Proceed to The Close */}
                      <button
                        type="button"
                        onClick={() => setCurrentStep(5)}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#ED1C24] hover:bg-[#d0181f] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                      >
                        <span>Proceed to Screen 5: The Close & Emil Calendly</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* ===================================================================
                      SCREEN 5: The Close (Booking 20-Min Screen Share with Founder Emil)
                      =================================================================== */}
                  {currentStep === 5 && (
                    <div className="space-y-4">
                      {/* Teleprompter Script */}
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <p className={`font-semibold text-[#222021] leading-relaxed ${
                          textSize === 'huge' ? 'text-2xl' : textSize === 'large' ? 'text-xl' : 'text-base'
                        }`}>
                          "Look, <span className="font-bold text-[#ED1C24]">{customerName.split(' ')[0] || 'there'}</span>, we didn't build this software in a bubble. Our founder, <strong className="text-[#222021]">Emil</strong>, was a BPO business development director for over 17 years. He lived through this exact pain and built this system right from the trenches to stop BPOs from losing deals to cheaper rivals."
                        </p>
                        <p className={`font-semibold text-[#222021] leading-relaxed pt-1 ${
                          textSize === 'huge' ? 'text-2xl' : textSize === 'large' ? 'text-xl' : 'text-base'
                        }`}>
                          "I'd love to set up a quick 20-minute screen share with Emil. He'll show you the big picture in action—how we build your private list and how your reps use the AI Sparring Agent to warm up before dialing."
                        </p>
                        <p className={`font-extrabold text-[#222021] leading-relaxed pt-1 ${
                          textSize === 'huge' ? 'text-2xl' : textSize === 'large' ? 'text-xl' : 'text-base'
                        }`}>
                          "Do you have your calendar open—would <span className="bg-emerald-100 text-emerald-950 px-1 rounded font-mono font-bold">Thursday at 2:00 PM</span> work, or is <span className="bg-emerald-100 text-emerald-950 px-1 rounded font-mono font-bold">Friday morning</span> better for 20 minutes with Emil?"
                        </p>

                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={() => playSpeech(`Look, ${customerName.split(' ')[0] || 'there'}, we didn't build this software in a bubble. Our founder, Emil, was a BPO business development director for over 17 years. He lived through this exact pain and built this system right from the trenches to stop BPOs from losing deals to cheaper rivals. Do you have your calendar open—would Thursday at 2:00 PM work, or is Friday morning better for 20 minutes with Emil?`, 'close_speech')}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-100"
                          >
                            <Volume2 className="h-3.5 w-3.5 text-[#ED1C24]" />
                            <span>Hear it</span>
                          </button>
                          <button
                            onClick={() => copyText(`Look, ${customerName.split(' ')[0] || 'there'}, we didn't build this software in a bubble... Do you have your calendar open—would Thursday at 2:00 PM work, or is Friday morning better for 20 minutes with Emil?`, 'close_cp')}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-100"
                          >
                            {copiedKey === 'close_cp' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
                            <span>Copy</span>
                          </button>
                        </div>
                      </div>

                      {/* Live Booking Slots & Direct Calendly Embed */}
                      <div className="bg-gradient-to-r from-zinc-900 to-black text-white p-4 rounded-2xl border border-zinc-800 space-y-3 shadow-inner">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-bold text-white tracking-wide uppercase font-mono">
                              Founder Emil's Live Availability
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                              17+ Yrs BDM
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setShowCalendlyEmbed(!showCalendlyEmbed)}
                              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors cursor-pointer"
                            >
                              {showCalendlyEmbed ? 'Hide Calendar' : 'Show Calendar'}
                            </button>
                            <a
                              href="https://calendly.com/emil-appointmentlyy/30min"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-rose-400 flex items-center gap-1 transition-colors"
                            >
                              <span>Full Tab</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>

                        {/* Quick Pre-fill slot buttons */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleSelectSlot('Thursday 2:00 PM')}
                            className={`py-2 px-3 rounded-xl border text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              bookingSlot === 'Thursday 2:00 PM'
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                : 'bg-zinc-800 border-zinc-700 text-white hover:border-emerald-500'
                            }`}
                          >
                            <Clock className="h-3.5 w-3.5" />
                            <span>⚡ Lock Thursday 2:00 PM</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSelectSlot('Friday 10:00 AM')}
                            className={`py-2 px-3 rounded-xl border text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              bookingSlot === 'Friday 10:00 AM'
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                : 'bg-zinc-800 border-zinc-700 text-white hover:border-emerald-500'
                            }`}
                          >
                            <Clock className="h-3.5 w-3.5" />
                            <span>⚡ Lock Friday 10:00 AM</span>
                          </button>
                        </div>

                        {/* Embedded Calendly Live Widget */}
                        {showCalendlyEmbed && (
                          <div className="rounded-xl border border-zinc-700 bg-white overflow-hidden shadow-2xl">
                            <div className="bg-[#121620] px-3.5 py-2 border-b border-zinc-800 flex items-center justify-between text-xs">
                              <span className="font-bold text-white tracking-tight">Direct Screen Share Booking &bull; Emil</span>
                              <span className="text-[10px] font-mono text-zinc-400">Instant Calendar Invite</span>
                            </div>
                            <div className="relative w-full h-[540px]">
                              {calendlyLoading && (
                                <div className="absolute inset-0 bg-[#0C1017] flex flex-col items-center justify-center text-center p-6 space-y-2 z-10">
                                  <Loader2 className="h-6 w-6 text-rose-500 animate-spin" />
                                  <p className="text-xs font-bold text-zinc-200">Loading Emil's Live Calendar...</p>
                                  <p className="text-[11px] text-zinc-500 font-mono">Brisbane & Global Timezones</p>
                                </div>
                              )}
                              <iframe
                                src={`https://calendly.com/emil-appointmentlyy/30min?embed_domain=appointmentlyy.com&embed_type=Inline&hide_gdpr_banner=1&name=${encodeURIComponent(customerName)}&a1=${encodeURIComponent(phone)}`}
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                title="Schedule with Founder Emil on Calendly"
                                className="w-full h-full border-0"
                                onLoad={() => setCalendlyLoading(false)}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* COLUMN 3: Auto-Updating CRM Notes & Dispositions (3 cols) */}
              <div className="lg:col-span-3 flex flex-col gap-4">
                
                {/* Auto-Updating Call Notes Card */}
                <div className="bg-white border border-[#222021]/10 rounded-2xl p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-[#222021] tracking-tight flex items-center gap-1.5">
                        <span>📝</span>
                        <span>CRM Call Notes</span>
                      </h3>
                      <p className="text-[11px] text-[#6b6968] mt-0.5 leading-snug">
                        Auto-updates live from your button clicks. Ready to paste into CRM.
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const now = new Date();
                        const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                        const stamped = notesDraft.trim() + `\n\n[LOGGED ${dateStr} ${timeStr} by SDR Alex - Verified for CRM Sync]`;
                        setNotesDraft(stamped);
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-[#F2F0EF] hover:bg-[#e7e4e2] text-[#222021] font-semibold text-xs transition-colors flex items-center justify-center gap-1 border border-[#222021]/10 cursor-pointer"
                    >
                      <Wand2 className="h-3 w-3 text-[#6b6968]" />
                      <span>Format & Tidy</span>
                    </button>
                    <button
                      onClick={() => copyText(notesDraft, 'notes_copy')}
                      className="flex-1 py-1.5 rounded-lg bg-[#ED1C24] hover:bg-[#d0181f] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                    >
                      {copiedKey === 'notes_copy' ? <Check className="h-3 w-3 text-white" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedKey === 'notes_copy' ? 'Copied to CRM!' : 'Copy CRM Notes'}</span>
                    </button>
                  </div>

                  <textarea
                    rows={8}
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    className="w-full bg-[#F2F0EF] border border-[#222021]/10 rounded-xl p-2.5 text-[11px] leading-relaxed text-[#222021] font-mono focus:outline-none focus:bg-white focus:border-[#ED1C24]"
                  />

                  {/* Reset for Next Call */}
                  <button
                    onClick={() => {
                      setRoleStatus(null);
                      setRecognizedOA(null);
                      setPriceTrapStatus(null);
                      setTargetIndustries(['E-commerce / Retail', 'FinTech / Financial']);
                      setPrimaryService('customer-service');
                      setCustomServiceInput('');
                      setBookingSlot(null);
                      setDisposition(null);
                      setCurrentStep(1);
                      setNotesDraft(generateCrmNotes({
                        rStatus: null,
                        oa: null,
                        trap: null,
                        industries: ['E-commerce / Retail', 'FinTech / Financial'],
                        service: 'customer-service',
                        customServ: '',
                        slot: null,
                        disp: null,
                        custom: ''
                      }));
                    }}
                    className="w-full text-center text-xs text-[#6b6968] hover:text-[#222021] flex items-center justify-center gap-1 py-1 transition-colors cursor-pointer"
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
                        onClick={() => handleSetDisposition(null)}
                        className="text-[10px] font-bold text-[#ED1C24] hover:underline cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  {/* Dropdown Select Menu */}
                  <div className="relative">
                    <select
                      value={disposition || ''}
                      onChange={(e) => handleSetDisposition(e.target.value || null)}
                      className="w-full bg-[#F2F0EF] border border-[#222021]/15 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#222021] focus:outline-none focus:ring-2 focus:ring-[#ED1C24] focus:border-[#ED1C24] transition-all cursor-pointer"
                    >
                      <option value="">-- Select Call Disposition --</option>
                      <option value="Meeting Booked">✅ Meeting Booked (Founder Demo with Emil)</option>
                      <option value="Follow-up Required">📅 Follow-up Required / Send Calendar</option>
                      <option value="Referral / Update Contact">👤 Referral / New DM Identified</option>
                      <option value="Call back">📞 Call back (Floor busy right now)</option>
                      <option value="No answer">📵 No answer (Voicemail / No Pick)</option>
                      <option value="Not interested">🚫 Not interested (Prefers shared leads)</option>
                      <option value="Disqualified">⛔ Disqualified (Under 5 seats / No budget)</option>
                      <option value="Do not call">🛑 Do not call (DNC List)</option>
                    </select>
                  </div>

                  {disposition && (
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
                      <span>Logged: {disposition}</span>
                      <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-300">CRM SYNCED</span>
                    </div>
                  )}
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
                  { id: 'all', label: 'All 11 Battlecards' },
                  { id: 'Need Clients', label: 'Need Clients' },
                  { id: 'Pricing', label: 'Pricing & Budget' },
                  { id: 'Lead Vendors', label: 'Lead Vendors / OA' },
                  { id: 'Training', label: 'Reps & Training' },
                  { id: 'Brush-Off & Timing', label: 'Brush-Off & Timing' },
                  { id: 'Authenticity', label: 'AI Authenticity' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer ${
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
                    {/* Header */}
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
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                            isPlayingAudio === reb.id ? 'bg-[#ED1C24] border-[#ED1C24] text-white' : 'bg-[#F2F0EF] hover:bg-[#e7e4e2] text-[#222021] border-[#222021]/10'
                          }`}
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                          <span>{isPlayingAudio === reb.id ? 'Playing...' : 'Hear it'}</span>
                        </button>
                        <button
                          onClick={() => copyText(reb.fullSpoken, `copy_${reb.id}`)}
                          className="px-3 py-1.5 rounded-lg bg-[#ED1C24] hover:bg-[#d0181f] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                        >
                          {copiedKey === `copy_${reb.id}` ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          <span>{copiedKey === `copy_${reb.id}` ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    {/* ARM Framework Breakdown */}
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
                          <span>[R] Redirect / Real Fix</span>
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
                          <span>[M] Move / Commit</span>
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
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Bottom Right Rebuttals Action Button */}
      <div className="fixed bottom-6 right-6 flex items-center gap-2 z-40">
        <button
          onClick={() => {
            if (isRebuttalsMode) {
              setActiveTab('steps');
              setSearchQuery('');
            } else {
              setActiveTab('rebuttals');
            }
          }}
          className="px-4 py-2.5 rounded-full bg-[#ED1C24] hover:bg-[#d0181f] text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105 cursor-pointer"
        >
          <FileText className="h-4 w-4" />
          <span>{isRebuttalsMode ? 'Back to Steps' : 'ARM Rebuttals Drawer'}</span>
          <kbd className="text-[10px] bg-white/20 px-1 py-0.2 rounded font-mono">R</kbd>
        </button>
      </div>

      {/* GLOBAL CALENDLY MODAL (Triggerable From Anywhere) */}
      {showCalendlyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="relative w-full max-w-4xl h-[90vh] max-h-[780px] bg-[#0C1017] border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 bg-[#121620] border-b border-zinc-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Schedule 20-Min Screen Share with Founder Emil &bull; Appointmentlyy
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Direct Calendar Sync &bull; Instant Email Confirmation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCalendlyModal(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative flex-1 w-full bg-white">
              <iframe
                src={`https://calendly.com/emil-appointmentlyy/30min?embed_domain=appointmentlyy.com&embed_type=Inline&hide_gdpr_banner=1&name=${encodeURIComponent(customerName)}&a1=${encodeURIComponent(phone)}`}
                width="100%"
                height="100%"
                frameBorder="0"
                title="Schedule 20-min session with Emil on Calendly"
                className="w-full h-full border-0"
              />
            </div>
            <div className="px-4 py-2.5 bg-[#121620] border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <span>Direct with Founder Emil (17+ yrs BPO BDM veteran)</span>
              <button
                onClick={() => {
                  setShowCalendlyModal(false);
                  handleSelectSlot('Booked via Calendly Modal');
                }}
                className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500"
              >
                Done / Meeting Booked
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PLAYBOOK ARCHITECTURE SPEC MODAL */}
      {showPlaybookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="relative w-full max-w-4xl h-[90vh] max-h-[820px] bg-white border border-[#222021]/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#222021]">
            <div className="px-6 py-4 bg-[#F2F0EF] border-b border-[#222021]/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-[#ED1C24] flex items-center justify-center text-white font-bold">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight text-[#222021]">
                    BPO Client Acquisition: Cold Call Teleprompter, AI Assistant & Sparring Spec
                  </h3>
                  <p className="text-xs text-[#6b6968]">
                    Reference guide based on bpo_bdr_playbook.md &bull; ARM Methodology
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPlaybookModal(false)}
                className="p-1.5 rounded-xl text-[#6b6968] hover:text-[#222021] hover:bg-black/5 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs leading-relaxed">
              {/* Architecture Diagram */}
              <div className="p-4 rounded-2xl bg-[#0C1017] text-emerald-400 font-mono text-[11px] overflow-x-auto">
                <div className="text-zinc-400 font-bold mb-2">// 1. SYSTEM ARCHITECTURE & 6-SCREEN STATE MACHINE</div>
                <pre>{`[SCREEN 1: Opener & Role Verification]
          │
          ├──> (Not in Role / Left) ──> [Update CRM & Ask for Referral] ──> [End Call]
          │
          └──> (Confirmed in Role)
                    │
                    ▼
[SCREEN 2: Pattern Interrupt & Outsource Accelerator Check]
          │
          ├──> (Yes / No / What is that?)
                    │
                    ▼
[SCREEN 3: Shared-Lead Problem & Confirmation Gate]
          │
          ├──> (Confirmed Pain: Price wars / Shared leads)
          │         │
          │         ▼
          │    [SCREEN 4: The Bigger Picture Pitch]
          │         │
          │         ▼
          │    [SCREEN 5: Dynamic Qualification & Response]
          │         │
          │         ├── [Selection A: Customer Support] ──> [Teleprompter: CS Response] ─────┐
          │         ├── [Selection B: Bookkeeping/Acct]  ──> [Teleprompter: BK Response] ─────┤
          │         ├── [Selection C: Outbound Sales]    ──> [Teleprompter: Sales Response] ──┤
          │         ├── [Selection D: Tech Support]      ──> [Teleprompter: Tech Response] ───┤
          │         └── [Selection E: Other Service]     ──> [Input + Universal Response] ───┘
          │                                                                                   │
          │                                                                                   ▼
          └───────────────────────────────────────────────────────────────────> [SCREEN 6: 20-Min Demo Close]
                                                                                              │
                                                                                              ▼
                                                                                    [Calendar Booked / Exit]`}</pre>
              </div>

              {/* Methodology Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#F2F0EF] border border-[#222021]/10 space-y-2">
                  <div className="font-bold text-[#ED1C24] uppercase tracking-wider text-[11px]">
                    1. Acknowledge (Agree)
                  </div>
                  <p className="text-[#6b6968]">
                    Never argue or become defensive. Validate their constraint, tenure, or current lead vendor immediately using tactical empathy.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F2F0EF] border border-[#222021]/10 space-y-2">
                  <div className="font-bold text-[#ED1C24] uppercase tracking-wider text-[11px]">
                    2. Redirect (Value Reframe)
                  </div>
                  <p className="text-[#6b6968]">
                    Expose the hidden cost: shared leads mean 3-5 BPOs fighting over price ($8/hr), while reps burn expensive leads as warm-up swings.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F2F0EF] border border-[#222021]/10 space-y-2">
                  <div className="font-bold text-[#ED1C24] uppercase tracking-wider text-[11px]">
                    3. Move (Low-Friction Ask)
                  </div>
                  <p className="text-[#6b6968]">
                    Anchor Founder Emil (17+ years in BPO BDM trenches). Propose a low-friction 20-minute screen share on Thursday at 2:00 PM or Friday morning.
                  </p>
                </div>
              </div>

              {/* 10 Objections Intent Matrix */}
              <div className="space-y-3">
                <h4 className="font-black text-sm uppercase tracking-wide text-[#222021]">
                  Intent Matching Matrix (Real-Time AI Script Assist)
                </h4>
                <div className="border border-[#222021]/10 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F2F0EF] font-bold text-[#222021] border-b border-[#222021]/10">
                      <tr>
                        <th className="p-3">Objection Key</th>
                        <th className="p-3">Trigger Phrases</th>
                        <th className="p-3">Core Counter-Strategy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222021]/10">
                      <tr>
                        <td className="p-3 font-mono font-bold text-[#ED1C24]">OBJ_NEED_CLIENTS_NOT_TOOLS</td>
                        <td className="p-3 text-[#6b6968]">"we just need clients", "don't need more tools", "need revenue not software"</td>
                        <td className="p-3">Can't pay payroll with software. Buying leads fails if reps get cut down on price.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-[#ED1C24]">OBJ_PRICE_TELL_ME_NOW</td>
                        <td className="p-3 text-[#6b6968]">"how much is it", "give me the price", "what's the cost"</td>
                        <td className="p-3">No flat price tag. Custom built based on monthly scope and script tuning.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-[#ED1C24]">OBJ_PRICE_RATE_CARD</td>
                        <td className="p-3 text-[#6b6968]">"send rate card", "send pricing sheet", "email me the prices"</td>
                        <td className="p-3">No generic rate cards. Custom data pipeline built for specific service lines.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-[#ED1C24]">OBJ_PRICE_NO_BUDGET</td>
                        <td className="p-3 text-[#6b6968]">"no budget", "money is tight", "not spending on software"</td>
                        <td className="p-3">Replaces lead burn money. Fits inside existing lead data budget.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-[#ED1C24]">OBJ_VENDOR_OUTSOURCE_ACCELERATOR</td>
                        <td className="p-3 text-[#6b6968]">"use Outsource Accelerator", "already with OA", "buying from brokers"</td>
                        <td className="p-3">Full price for shared leads pitched by 3-5 rivals. AI sparring protects margins.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-[#ED1C24]">OBJ_VENDOR_EXCLUSIVE_LEADS</td>
                        <td className="p-3 text-[#6b6968]">"exclusive leads", "nobody else calling them", "our vendor is exclusive"</td>
                        <td className="p-3">Market reality: prospect was pitched weeks ago. Reps get shopped on price.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-[#ED1C24]">OBJ_REPS_EXPERIENCED</td>
                        <td className="p-3 text-[#6b6968]">"reps don't need training", "experienced callers", "senior reps only"</td>
                        <td className="p-3">Leads cost too much for warm-up swings. Sharpen edge in 2 minutes before dialing.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-[#ED1C24]">OBJ_INTERNAL_LMS_EXISTS</td>
                        <td className="p-3 text-[#6b6968]">"internal trainers", "have our own lms", "team leaders coach"</td>
                        <td className="p-3">Managers don't have hours each morning. Reps get 5 automated practice calls.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-[#ED1C24]">OBJ_BRUSH_OFF_EMAIL</td>
                        <td className="p-3 text-[#6b6968]">"send an email", "shoot me a message", "email me details"</td>
                        <td className="p-3">Static PDF won't show live voice coaching. 20-min test call with Emil.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-[#ED1C24]">OBJ_TIMING_BUSY</td>
                        <td className="p-3 text-[#6b6968]">"too busy", "call back in 6 months", "bad time", "running a floor"</td>
                        <td className="p-3">Every month of waiting burns thousands on stolen shared leads. Grab 20 mins.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-[#F2F0EF] border-t border-[#222021]/10 flex items-center justify-between">
              <span className="text-xs text-[#6b6968]">
                Appointmentlyy SDR LMS &bull; Playbook Spec v2.4
              </span>
              <button
                onClick={() => setShowPlaybookModal(false)}
                className="px-4 py-1.5 rounded-xl bg-[#ED1C24] hover:bg-[#d0181f] text-white font-bold text-xs"
              >
                Close Spec
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
