'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Radio, 
  Swords, 
  Award, 
  ShieldCheck, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export default function NavigationHeader({ currentCampaign = 'Enterprise Outbound Q4' }: { currentCampaign?: string }) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Outbound Cockpit', href: '/cockpit', match: ['/', '/cockpit'], icon: Radio },
    { label: 'Sparring Arena', href: '/sparring', match: ['/sparring'], icon: Swords },
    { label: 'My Certification', href: '/certification', match: ['/certification', '/certificate'], icon: Award },
  ];

  return (
    <header className="h-13 border-b border-slate-200 bg-white px-5 flex items-center justify-between shrink-0 z-30 shadow-xs">
      {/* Brand & Main Switcher */}
      <div className="flex items-center gap-4">
        <Link href="/cockpit" className="flex items-center gap-2.5 group">
          <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-xs group-hover:bg-indigo-700 transition-colors">
            B
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-[13px] tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
              BORIS // SDR INTELLIGENCE
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-mono font-semibold">
              v1.0
            </span>
          </div>
        </Link>

        <div className="h-4 w-[1px] bg-slate-200" />

        {/* Sales Rep Navigation Tabs - ONLY SDR TOOLS */}
        <nav className="flex items-center gap-1.5 text-xs font-semibold">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.match.some(m => m === '/' ? pathname === '/' : pathname.startsWith(m));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right Controls: Campaign, Live Audio Status & Supervisor Switcher */}
      <div className="flex items-center gap-3">
        {/* Campaign Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px]">
          <span className="text-slate-400 font-semibold uppercase text-[10px]">Campaign:</span>
          <span className="font-bold text-slate-800">{currentCampaign}</span>
        </div>

        {/* 16kHz Audio Stream Status */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px]">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-700">16kHz Scribe v2</span>
          <span className="text-slate-400 font-mono text-[10px]">~142ms</span>
        </div>

        {/* Rep Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200">
            AM
          </div>
          <div className="hidden sm:block text-left text-[11px] leading-tight">
            <p className="font-bold text-slate-800">Alex Mercer</p>
            <p className="text-[10px] text-slate-500">Sales Development Rep</p>
          </div>
        </div>

        {/* Discreet Supervisor / Admin Console Switcher */}
        <Link
          href="/admin"
          title="Switch to Supervisor / Enablement Console"
          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
          <span className="hidden md:inline">Admin Console</span>
          <ExternalLink className="h-3 w-3 text-slate-400" />
        </Link>
      </div>
    </header>
  );
}
