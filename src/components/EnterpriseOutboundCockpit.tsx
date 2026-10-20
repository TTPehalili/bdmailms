'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Keyboard, 
  X, 
  Check, 
  Phone, 
  PhoneOff, 
  Radio
} from 'lucide-react';
import { MicStreamer } from '@/lib/audio/micStream';
import { ScribeSocketClient } from '@/lib/audio/scribeSocket';
import { ArmRebuttalResponse, TranscriptEntry } from '@/types';
import TopUtilityBar from '@/components/cockpit/TopUtilityBar';
import LeadQueue, { CockpitLead } from '@/components/cockpit/LeadQueue';
import ScriptViewer from '@/components/cockpit/ScriptViewer';
import BorisHUD from '@/components/cockpit/BorisHUD';

const INITIAL_LEADS: CockpitLead[] = [
  {
    id: 'lead-101',
    name: 'Jonathan Duarte',
    company: 'OmniCloud Technologies',
    title: 'VP of Demand Generation',
    headcount: '150-300 HC',
    cadenceStep: 'Day 3: Call 2',
    localTime: 'EDT - 10:45 AM',
    phone: '+1 (415) 890-1284',
    email: 'jduarte@omnicloud.io',
    currentBpo: 'Titan BPO Solutions',
    techStack: 'HubSpot & Apollo',
    painPoint: 'Outbound hold rate and show-up drop-off',
    status: 'new'
  },
  {
    id: 'lead-102',
    name: 'Elena Rostova',
    company: 'FinLeap Payments',
    title: 'Head of Sales Development',
    headcount: '50-100 HC',
    cadenceStep: 'Day 1: Cold Call 1',
    localTime: 'CDT - 9:45 AM',
    phone: '+1 (212) 440-9921',
    email: 'elena.rostova@finleap.com',
    currentBpo: 'Internal 6-person Manila Team',
    techStack: 'Salesforce & Salesloft',
    painPoint: 'Rep ramp time and objection handling',
    status: 'new'
  },
  {
    id: 'lead-103',
    name: 'Arthur Sterling',
    company: 'Sterling Freight Logistics',
    title: 'Chief Financial Officer',
    headcount: '200-500 HC',
    cadenceStep: 'Day 5: Executive Follow-up',
    localTime: 'EDT - 10:45 AM',
    phone: '+1 (312) 555-0199',
    email: 'asterling@sterlinglogistics.com',
    currentBpo: 'Offshore Vendor Retainer',
    techStack: 'Oracle Netsuite & Outreach',
    painPoint: 'Budget freeze; 15% SG&A reduction',
    status: 'contacted'
  },
  {
    id: 'lead-104',
    name: 'Samantha Cross',
    company: 'Sentinel Defense Cyber',
    title: 'Director of Demand Generation',
    headcount: '80-150 HC',
    cadenceStep: 'Day 2: Value Reframe',
    localTime: 'PDT - 7:45 AM',
    phone: '+1 (415) 670-3490',
    email: 'scross@sentinelcyber.com',
    currentBpo: 'Previously burned by agency',
    techStack: 'Outreach & ZoomInfo',
    painPoint: 'Unqualified lead spam & burned domains',
    status: 'new'
  },
  {
    id: 'lead-105',
    name: 'David Reynolds',
    company: 'Apex Cloud Systems',
    title: 'Director of Business Development',
    headcount: '100-250 HC',
    cadenceStep: 'Day 4: Benchmark Pitch',
    localTime: 'EDT - 10:45 AM',
    phone: '+1 (617) 490-2211',
    email: 'dreynolds@apexcloud.com',
    currentBpo: 'Incumbent Agency (3 years)',
    techStack: 'Salesforce & Gong',
    painPoint: 'Incumbent complacency on pipeline quota',
    status: 'new'
  }
];

export default function EnterpriseOutboundCockpit() {
  const [leads, setLeads] = useState<CockpitLead[]>(INITIAL_LEADS);
  const [selectedLeadId, setSelectedLeadId] = useState<string>(INITIAL_LEADS[0].id);
  const [searchFilter, setSearchFilter] = useState('');
  const [campaign, setCampaign] = useState('Enterprise Outbound Q4');
  const [repStatus, setRepStatus] = useState<'on_dial' | 'break'>('on_dial');
  const [showHotkeysModal, setShowHotkeysModal] = useState(false);

  // Live Call & Audio States
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const [interimText, setInterimText] = useState('');
  const [activeDisposition, setActiveDisposition] = useState<string | null>(null);

  // Objection & Transcript
  const [rebuttal, setRebuttal] = useState<ArmRebuttalResponse>({
    has_objection: true,
    objection_type: 'Active Competitor Lock-in',
    acknowledge: 'I completely understand—you have an established rhythm with them and they know your brand.',
    respond: 'We don’t ask you to fire them. We act as an overflow layer that handles objection friction before it burns qualified pipeline.',
    move: 'Are you opposed to a 10-minute side-by-side run next Tuesday to benchmark your hold rate?',
    latency_ms: 138,
    source: 'vector_db'
  });

  const [transcript, setTranscript] = useState<TranscriptEntry[]>([
    {
      id: 't-1',
      speaker: 'rep',
      text: 'Hey Jonathan, Alex from Boris Outbound. Did I catch you in the middle of demand gen planning?',
      timestamp: '00:02'
    },
    {
      id: 't-2',
      speaker: 'prospect',
      text: 'Look, we already have Titan BPO handling our cold calling and we are totally set right now.',
      timestamp: '00:06'
    }
  ]);

  const activeLead = leads.find(l => l.id === selectedLeadId) || leads[0];

  // Refs for Audio
  const micStreamerRef = useRef<MicStreamer | null>(null);
  const scribeClientRef = useRef<ScribeSocketClient | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Call duration counter
  useEffect(() => {
    if (isCallActive) {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCallActive]);

  // Audio start & stop
  const startListening = async () => {
    try {
      const scribe = new ScribeSocketClient({
        onInterimTranscript: (text: string) => {
          setInterimText(text);
        },
        onFinalTranscript: (text: string) => {
          setTranscript(prev => [
            ...prev,
            {
              id: `t-${Date.now()}`,
              speaker: 'prospect',
              text,
              timestamp: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' })
            }
          ]);
          setInterimText('');
          triggerObjectionAnalysis(text);
        }
      });
      scribeClientRef.current = scribe;
      await scribe.connect();

      const mic = new MicStreamer({
        sampleRate: 16000,
        chunkDurationMs: 200,
        onPcmChunk: (chunk: Int16Array) => {
          if (scribeClientRef.current) {
            scribeClientRef.current.sendPcmChunk(chunk);
          }
        },
        onVolumeChange: (vol: number) => {
          setVolume(vol);
        }
      });
      micStreamerRef.current = mic;
      await mic.start();

      setIsListening(true);
    } catch (err) {
      console.warn('Audio stream fallback initialized', err);
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (micStreamerRef.current) {
      micStreamerRef.current.stop();
      micStreamerRef.current = null;
    }
    if (scribeClientRef.current) {
      scribeClientRef.current.disconnect();
      scribeClientRef.current = null;
    }
    setIsListening(false);
    setVolume(0);
    setInterimText('');
  };

  const toggleCall = () => {
    if (!isCallActive) {
      setIsCallActive(true);
      startListening();
    } else {
      setIsCallActive(false);
      stopListening();
    }
  };

  const triggerObjectionAnalysis = async (text: string) => {
    try {
      const res = await fetch('/api/rebuttal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: text,
          campaignId: campaign
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.has_objection) {
          setRebuttal(data);
        }
      }
    } catch (e) {
      console.warn('Vector match fetch error:', e);
    }
  };

  const simulateObjection = (type: string) => {
    if (type === 'Incumbent BPO Agency') {
      setRebuttal({
        has_objection: true,
        objection_type: 'Incumbent BPO Agency',
        acknowledge: 'I completely understand—you have an established rhythm with them and they know your brand.',
        respond: 'We don’t ask you to fire them. We act as an overflow layer that handles objection friction before it burns qualified pipeline.',
        move: 'Are you opposed to a 10-minute side-by-side run next Tuesday to benchmark your hold rate?',
        latency_ms: 124,
        source: 'vector_db'
      });
    } else if (type === 'No Budget / Freeze') {
      setRebuttal({
        has_objection: true,
        objection_type: 'No Budget / SG&A Freeze',
        acknowledge: 'Totally fair—every CFO is guarding operating margins right now.',
        respond: 'This actually pays for itself on recovered pipeline because reps don’t lose warm prospects to basic objections.',
        move: 'Would you be open to seeing our 30-day ROI calculator before Q1 budget locks?',
        latency_ms: 141,
        source: 'vector_db'
      });
    } else {
      setRebuttal({
        has_objection: true,
        objection_type: 'Send Me An Email Brush-off',
        acknowledge: 'I will definitely shoot that over so you have it in writing.',
        respond: 'Typically when people ask for an email, they are either being polite or want to see if this is even relevant.',
        move: 'To save your inbox, if you don’t see an immediate 2x lift in show-up rates, you can delete it immediately—fair enough?',
        latency_ms: 119,
        source: 'vector_db'
      });
    }
  };

  const handleSetDisposition = (label: string) => {
    setActiveDisposition(label);
    setLeads(prev => prev.map(l => l.id === activeLead.id ? { 
      ...l, 
      status: label === 'Meeting Booked' ? 'booked' : label === 'Disqualified' ? 'disqualified' : 'contacted' 
    } : l));

    // Advance to next lead
    const currentIndex = leads.findIndex(l => l.id === activeLead.id);
    if (currentIndex < leads.length - 1) {
      setSelectedLeadId(leads[currentIndex + 1].id);
    }
  };

  // Keyboard Shortcuts Listener (Space, 1, 2, 3, 4, ⌘K)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      setShowHotkeysModal(prev => !prev);
      return;
    }
    if (e.code === 'Digit1' || e.code === 'Numpad1') {
      e.preventDefault();
      handleSetDisposition('Meeting Booked');
    } else if (e.code === 'Digit2' || e.code === 'Numpad2') {
      e.preventDefault();
      handleSetDisposition('Gatekeeper');
    } else if (e.code === 'Digit3' || e.code === 'Numpad3') {
      e.preventDefault();
      handleSetDisposition('Left Voicemail');
    } else if (e.code === 'Digit4' || e.code === 'Numpad4') {
      e.preventDefault();
      handleSetDisposition('Disqualified');
    } else if (e.code === 'Space') {
      e.preventDefault();
      handleSetDisposition('Meeting Booked');
    }
  }, [leads, activeLead]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-100 font-sans select-none antialiased">
      
      {/* 1. TOP APPLICATION UTILITY BAR */}
      <TopUtilityBar
        campaign={campaign}
        onCampaignChange={setCampaign}
        isListening={isListening}
        repStatus={repStatus}
        onRepStatusChange={setRepStatus}
        onOpenShortcuts={() => setShowHotkeysModal(true)}
      />

      {/* 2. THREE-PANE APP SHELL (Zero Window Scrolling) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* PANE 1: LEFT LEAD STREAM */}
        <LeadQueue
          leads={leads}
          selectedLeadId={selectedLeadId}
          onSelectLead={setSelectedLeadId}
          searchFilter={searchFilter}
          onSearchChange={setSearchFilter}
        />

        {/* PANE 2: CENTER OUTBOUND COCKPIT & SCRIPT CANVAS */}
        <ScriptViewer
          lead={activeLead}
          isCallActive={isCallActive}
          callDuration={callDuration}
          onToggleCall={toggleCall}
          onSetDisposition={handleSetDisposition}
          activeDisposition={activeDisposition}
        />

        {/* PANE 3: RIGHT AI BORIS LIVE HUD */}
        <BorisHUD
          rebuttal={rebuttal}
          transcript={transcript}
          interimText={interimText}
          isListening={isListening}
          volume={volume}
          onSimulateObjection={simulateObjection}
        />
      </div>

      {/* KEYBOARD SHORTCUTS MODAL */}
      {showHotkeysModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Keyboard className="h-5 w-5 text-[#ED1C24]" />
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                  Outbound Cockpit Hotkeys
                </h3>
              </div>
              <button
                onClick={() => setShowHotkeysModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Meeting Booked Disposition:</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono font-bold text-slate-800">
                  Space or [1]
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Gatekeeper Disposition:</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono font-bold text-slate-800">
                  [2]
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Left Voicemail Disposition:</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono font-bold text-slate-800">
                  [3]
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Disqualified Disposition:</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono font-bold text-slate-800">
                  [4]
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600">Toggle Hotkeys Modal:</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono font-bold text-slate-800">
                  ⌘K or Ctrl+K
                </kbd>
              </div>
            </div>

            <button
              onClick={() => setShowHotkeysModal(false)}
              className="w-full py-2 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
