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
    <header className="h-13 border-b border-[#222021]/10 bg-white px-5 flex items-center justify-between shrink-0 z-30 shadow-2xs">
      {/* Brand & Main Switcher */}
      <div className="flex items-center gap-4">
        <Link href="/cockpit" className="flex items-center gap-2.5 group">
          <div className="h-7 w-7 rounded-lg bg-[#ED1C24] flex items-center justify-center text-white font-black text-xs shadow-2xs group-hover:scale-105 transition-transform">
            ⚡
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-[13px] tracking-tight text-[#222021] group-hover:text-[#ED1C24] transition-colors">
              APPOINTMENTLYY // BORIS SDR
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F2F0EF] text-[#6b6968] border border-[#222021]/10 font-mono font-semibold">
              v1.0
            </span>
          </div>
        </Link>

        <div className="h-4 w-[1px] bg-[#222021]/10" />

        {/* Sales Rep Navigation Tabs */}
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
                    ? 'bg-[#ED1C24] text-white font-bold shadow-2xs'
                    : 'text-[#6b6968] hover:text-[#222021] hover:bg-[#F2F0EF] border border-transparent'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-[#6b6968]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right Controls: Campaign, Live Audio Status & Supervisor Switcher */}
      <div className="flex items-center gap-3">
        {/* Campaign Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 bg-[#F2F0EF] border border-[#222021]/10 rounded-lg px-2.5 py-1 text-[11px]">
          <span className="text-[#6b6968] uppercase font-bold text-[10px]">CAMPAIGN:</span>
          <span className="font-bold text-[#222021]">{currentCampaign}</span>
        </div>

        {/* Scribe Web Audio Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F2F0EF] border border-[#222021]/10 text-[11px] font-mono text-[#222021]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ED1C24] animate-pulse" />
          <span className="font-semibold">16kHz Scribe v2</span>
          <span className="text-[#6b6968]">~142ms</span>
        </div>

        {/* Rep Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#222021]/10">
          <div className="h-7 w-7 rounded-full bg-[#222021] text-white font-bold text-xs flex items-center justify-center">
            AM
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-[#222021] leading-tight">Alex Mercer</span>
            <span className="text-[10px] text-[#6b6968] leading-tight">Sales Development Rep</span>
          </div>
        </div>

        {/* Admin Console Switcher Link */}
        <Link
          href="/admin"
          className="ml-1 p-1.5 rounded-lg border border-[#222021]/10 hover:bg-[#F2F0EF] text-[#6b6968] hover:text-[#222021] transition-colors flex items-center gap-1 text-xs font-semibold"
          title="Open Control Centre"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-[#ED1C24]" />
          <span className="hidden md:inline">Admin Console</span>
          <ExternalLink className="h-3 w-3 text-[#6b6968]" />
        </Link>
      </div>
    </header>
  );
}
