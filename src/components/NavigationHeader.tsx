'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Radio, 
  Layers, 
  Users, 
  Award, 
  FileSpreadsheet, 
  Database, 
  ShieldCheck,
  Headphones
} from 'lucide-react';

export default function NavigationHeader({ currentCampaign = 'Enterprise Outbound Q4' }: { currentCampaign?: string }) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Outbound Cockpit', href: '/cockpit', match: ['/', '/cockpit'] },
    { label: 'Sparring Arena', href: '/sparring', match: ['/sparring'] },
    { label: 'Certification', href: '/certification', match: ['/certification', '/certificate'] },
    { label: 'Leads & Cadence', href: '/admin/campaigns/enterprise-outbound/leads', match: ['/admin/campaigns'] },
    { label: 'Playbooks Ingestion', href: '/admin/frameworks', match: ['/admin/frameworks'] },
    { label: 'Rep Roster', href: '/admin/reps', match: ['/admin/reps'] },
  ];

  return (
    <header className="h-12 border-b border-slate-200 bg-white px-4 flex items-center justify-between shrink-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      {/* Brand & Main Switcher */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-sm group-hover:bg-indigo-700 transition-colors">
            B
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-[13px] tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
              BORIS // BPO OUTBOUND ENGINE
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-mono font-semibold">
              v1.0 MVP
            </span>
          </div>
        </Link>

        <div className="h-4 w-[1px] bg-slate-200 mx-2" />

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 text-[12px] font-semibold">
          {navItems.map((item) => {
            const isActive = item.match.some(m => m === '/' ? pathname === '/' : pathname.startsWith(m));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right Controls: Campaign & Status */}
      <div className="flex items-center gap-3 text-xs">
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px]">
          <span className="text-slate-400 font-semibold uppercase text-[10px]">Campaign:</span>
          <span className="font-bold text-slate-800">{currentCampaign}</span>
        </div>

        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px]">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-700">16kHz Scribe v2</span>
          <span className="text-slate-400 font-mono text-[10px]">~142ms</span>
        </div>
      </div>
    </header>
  );
}
