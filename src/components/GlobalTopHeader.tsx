'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  BookOpen, 
  Bell, 
  ChevronDown, 
  Radio, 
  CheckCircle2, 
  LogOut 
} from 'lucide-react';

export default function GlobalTopHeader() {
  const [bneTime, setBneTime] = useState('16:57:57 AEST');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format to Australian Eastern Standard Time (AEST / Brisbane UTC+10)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Australia/Brisbane',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      const formatted = new Intl.DateTimeFormat('en-AU', options).format(now);
      setBneTime(`${formatted} AEST`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 bg-white border-b border-[#222021]/10 px-5 flex items-center justify-between shrink-0 select-none z-30">
      
      {/* Left: Brisbane Time Badge & Quick Search */}
      <div className="flex items-center gap-3">
        {/* Brisbane Time Pill */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#F2F0EF] border border-[#222021]/10 text-xs font-mono font-semibold text-[#222021]">
          <span className="text-[10px] uppercase font-bold text-[#6b6968]">BNE</span>
          <span className="tabular-nums">{bneTime}</span>
        </div>

        {/* Global Search Button */}
        <button 
          title="Search scripts, leads, playbooks (Cmd+K)"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F2F0EF] hover:bg-[#e7e4e2] text-xs text-[#6b6968] font-medium transition-colors"
        >
          <Search className="h-3.5 w-3.5 text-[#6b6968]" />
          <span>Search</span>
          <kbd className="text-[10px] bg-white border border-[#222021]/15 px-1 rounded font-mono text-[#222021]">⌘K</kbd>
        </button>
      </div>

      {/* Right Utility Navigation Actions */}
      <div className="flex items-center gap-3">
        
        {/* Knowledge & Playbooks */}
        <button 
          title="Knowledge Base & ARM Frameworks"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-[#F2F0EF] text-xs font-semibold text-[#222021] transition-colors"
        >
          <BookOpen className="h-4 w-4 text-[#6b6968]" />
          <span>Knowledge</span>
        </button>

        {/* Notification Bell with Badge */}
        <button 
          title="Notifications"
          className="relative p-2 rounded-lg hover:bg-[#F2F0EF] text-[#6b6968] hover:text-[#222021] transition-colors"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#ED1C24] ring-2 ring-white" />
        </button>

        <div className="h-4 w-[1px] bg-[#222021]/10" />

        {/* AI Copilot Status Pill (Active) */}
        <div 
          title="ElevenLabs Real-time STT / TTS Pipeline Active"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ED1C24]/10 border border-[#ED1C24]/30 text-xs font-semibold text-[#ED1C24]"
        >
          <span className="h-2 w-2 rounded-full bg-[#ED1C24] animate-pulse" />
          <span className="font-mono text-[11px] font-bold tracking-tight">AI COPILOT</span>
        </div>

        {/* Mission Brief Pill */}
        <button 
          title="View Sprint Objectives"
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#222021]/10 text-xs font-semibold text-[#222021] hover:bg-[#F2F0EF] transition-colors"
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-[#ED1C24]" />
          <span>Mission brief</span>
        </button>

        {/* User LogOut / Profile */}
        <button 
          title="Log out of session"
          className="p-1.5 rounded-lg text-[#6b6968] hover:text-[#ED1C24] hover:bg-[#ED1C24]/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
