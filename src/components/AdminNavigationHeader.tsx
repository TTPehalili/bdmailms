'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShieldCheck, 
  BookOpen, 
  Users, 
  FileSpreadsheet, 
  ArrowLeft,
  ChevronRight,
  Database,
  ExternalLink
} from 'lucide-react';

export default function AdminNavigationHeader({ activeSection }: { activeSection?: string }) {
  const pathname = usePathname();

  const adminNav = [
    { 
      label: 'Playbook Vector Ingestion', 
      href: '/admin/frameworks', 
      match: '/admin/frameworks',
      icon: BookOpen 
    },
    { 
      label: 'Campaign Leads & Cadence', 
      href: '/admin/campaigns/enterprise-outbound/leads', 
      match: '/admin/campaigns',
      icon: FileSpreadsheet 
    },
    { 
      label: 'Rep Roster & Certification', 
      href: '/admin/reps', 
      match: '/admin/reps',
      icon: Users 
    },
  ];

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-xs">
      {/* Top Utility Bar */}
      <div className="h-13 px-6 flex items-center justify-between border-b border-slate-100">
        
        {/* Brand & Admin Identity */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="h-4.5 w-4.5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-slate-900">
                BORIS OPS
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Supervisor & Enablement Console
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-mono font-bold uppercase">
                Admin Mode
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Global Playbooks, Vector Storage, Lead Ingestion & Rep Certification</p>
          </div>
        </div>

        {/* Right Action: Exit to Rep Cockpit */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-slate-500">Signed in as:</span>
            <span className="font-bold text-slate-800">Emil H. (VP Enablement)</span>
          </div>

          <Link
            href="/cockpit"
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold tracking-wide transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Exit to Rep Cockpit</span>
          </Link>
        </div>
      </div>

      {/* Admin Module Navigation Tabs */}
      <div className="px-6 flex items-center gap-1 overflow-x-auto">
        <Link
          href="/admin"
          className={`py-3 px-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
            pathname === '/admin'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Database className="h-3.5 w-3.5" />
          <span>Console Overview</span>
        </Link>

        {adminNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.match);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`py-3 px-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
