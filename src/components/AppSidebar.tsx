'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Target, 
  Swords, 
  Headphones, 
  PhoneCall, 
  CalendarDays, 
  BookOpen, 
  Users, 
  Radio, 
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function AppSidebar() {
  const pathname = usePathname();

  const isDojo = pathname === '/' || pathname === '/cockpit';
  const isSparring = pathname.startsWith('/sparring');
  const isCert = pathname.startsWith('/certification');
  const isAdmin = pathname.startsWith('/admin');

  return (
    <aside className="w-16 bg-[#0B0F17] flex flex-col items-center justify-between py-4 border-r border-white/10 shrink-0 select-none z-40">
      
      {/* Top: Stylized Appointmentlyy Brand Glyph */}
      <div className="flex flex-col items-center gap-6 w-full">
        <Link href="/" className="group relative flex items-center justify-center">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-yellow-400 to-[#F9ED32] flex items-center justify-center text-slate-900 font-black text-base shadow-md group-hover:scale-105 transition-transform">
            <span>⚡</span>
          </div>
        </Link>

        {/* Icon Navigation Stack */}
        <nav className="flex flex-col items-center gap-2.5 w-full px-2">
          
          {/* Mission / Dashboard */}
          <Link
            href="/"
            title="Dashboard & Mission"
            className="h-10 w-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Target className="h-5 w-5" />
          </Link>

          {/* AI Boris Cockpit (Active Highlighted Icon) */}
          <Link
            href="/cockpit"
            title="AI Boris: Every script and rebuttal"
            className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
              isDojo
                ? 'bg-[#F9ED32] text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Swords className="h-5 w-5" />
          </Link>

          {/* Sparring Arena / Roleplay */}
          <Link
            href="/sparring"
            title="AI Sparring Arena"
            className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
              isSparring
                ? 'bg-[#F9ED32] text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Headphones className="h-5 w-5" />
          </Link>

          {/* Outbound Softphone Dialer */}
          <Link
            href="/cockpit"
            title="Dialer & Calling"
            className="h-10 w-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <PhoneCall className="h-5 w-5" />
          </Link>

          {/* Certification Gate */}
          <Link
            href="/certification"
            title="Certification Gate"
            className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
              isCert
                ? 'bg-[#F9ED32] text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <CalendarDays className="h-5 w-5" />
          </Link>

          {/* Playbooks & Knowledge */}
          <Link
            href="/admin/frameworks"
            title="Knowledge & Playbooks"
            className="h-10 w-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <BookOpen className="h-5 w-5" />
          </Link>

          {/* CRM Leads & Cadence */}
          <Link
            href="/admin/campaigns/enterprise-outbound/leads"
            title="Leads & Cadence"
            className="h-10 w-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Users className="h-5 w-5" />
          </Link>

          {/* Live Monitoring */}
          <Link
            href="/cockpit"
            title="Live Monitoring"
            className="h-10 w-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Radio className="h-5 w-5" />
          </Link>

          {/* Control Centre / Admin */}
          <Link
            href="/admin"
            title="Super Admin Control Centre"
            className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
              isAdmin
                ? 'bg-[#F9ED32] text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <ShieldCheck className="h-5 w-5" />
          </Link>
        </nav>
      </div>

      {/* Bottom: GPA Score Ring Badge */}
      <div className="flex flex-col items-center">
        <div 
          title="Overall Rep Quality Score: 92.5%"
          className="h-8 w-8 rounded-full border-2 border-[#F9ED32] bg-[#F9ED32]/10 flex items-center justify-center text-[#F9ED32] font-black text-[10px] font-mono shadow-xs cursor-pointer hover:scale-105 transition-transform"
        >
          92.5
        </div>
      </div>
    </aside>
  );
}
