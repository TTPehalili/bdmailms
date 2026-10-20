'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  BookOpen, 
  Bell, 
  Radio, 
  Megaphone, 
  LogOut, 
  ChevronDown,
  Sparkles
} from 'lucide-react';

export default function GlobalTopHeader() {
  const [timeStr, setTimeStr] = useState('BNE 16:57:57 AEST');
  const [locale, setLocale] = useState('AU');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const time = now.toLocaleTimeString('en-GB', { hour12: false });
      setTimeStr(`BNE ${time} AEST`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0 select-none z-30">
      
      {/* Left empty spacer / breadcrumb indicator */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span className="font-bold text-slate-800">Appointmentlyy SDR</span>
        <span>/</span>
        <span className="text-slate-500">B2B Outbound Intelligence</span>
      </div>

      {/* Right Utility Bar */}
      <div className="flex items-center gap-2">
        
        {/* Brisbane / Local Clock */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono text-xs font-semibold border border-slate-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{timeStr}</span>
        </div>

        {/* Search Command Palette Trigger */}
        <button
          onClick={() => {}}
          className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium flex items-center gap-2 transition-colors"
        >
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <span>Search</span>
          <kbd className="text-[10px] bg-slate-200/70 text-slate-500 px-1 py-0.2 rounded font-mono">⌘K</kbd>
        </button>

        {/* Knowledge Button */}
        <Link
          href="/admin/frameworks"
          className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <BookOpen className="h-3.5 w-3.5 text-slate-500" />
          <span>Knowledge</span>
        </Link>

        {/* Notification Bell */}
        <button
          title="Notifications"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#F9ED32]" />
        </button>

        {/* Country / Locale Selector */}
        <button
          onClick={() => setLocale(prev => prev === 'AU' ? 'US' : 'AU')}
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold flex items-center gap-1 text-slate-800 transition-colors shadow-2xs"
        >
          <span>{locale === 'AU' ? '🇦🇺 AU' : '🇺🇸 US'}</span>
          <ChevronDown className="h-3 w-3 text-slate-400" />
        </button>

        {/* ElevenLabs Status Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/80 text-[11px] font-bold font-mono shadow-2xs">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <span>ELEVENLABS AI</span>
        </div>

        {/* Mission Brief Button */}
        <Link
          href="/cockpit"
          className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <Megaphone className="h-3.5 w-3.5 text-slate-500" />
          <span className="hidden sm:inline">Mission brief</span>
        </Link>

        {/* Logout / Exit Button */}
        <Link
          href="/admin"
          title="Super Admin Control Centre"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <LogOut className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}
