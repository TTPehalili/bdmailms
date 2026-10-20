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
    <header className="border-b border-[#222021]/10 bg-white sticky top-0 z-40 shadow-2xs">
      {/* Top Utility Bar */}
      <div className="h-13 px-6 flex items-center justify-between border-b border-[#222021]/10">
        
        {/* Brand & Admin Identity */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#222021] text-white flex items-center justify-center shadow-2xs">
            <ShieldCheck className="h-4.5 w-4.5 text-[#ED1C24]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-[#222021]">
                APPOINTMENTLYY // CONTROL CENTRE
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#ED1C24]/10 text-[#ED1C24] font-mono font-bold border border-[#ED1C24]/20">
                SUPERVISOR
              </span>
            </div>
          </div>
        </div>

        {/* Back to Live Outbound Cockpit */}
        <div className="flex items-center gap-3">
          <Link
            href="/cockpit"
            className="px-3.5 py-1.5 rounded-xl bg-[#ED1C24] hover:bg-[#d0181f] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to AI Boris Cockpit</span>
          </Link>
        </div>
      </div>

      {/* Sub Navigation Strip */}
      <div className="h-10 px-6 flex items-center gap-6 text-xs font-semibold overflow-x-auto bg-[#F2F0EF]/40">
        <Link
          href="/admin"
          className={`py-2 border-b-2 transition-colors flex items-center gap-1.5 ${
            pathname === '/admin'
              ? 'border-[#ED1C24] text-[#ED1C24] font-bold'
              : 'border-transparent text-[#6b6968] hover:text-[#222021]'
          }`}
        >
          <Database className="h-3.5 w-3.5" />
          <span>Tenant Overview</span>
        </Link>

        {adminNav.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname.startsWith(tab.match);
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`py-2 border-b-2 transition-colors flex items-center gap-1.5 ${
                isActive
                  ? 'border-[#ED1C24] text-[#ED1C24] font-bold'
                  : 'border-transparent text-[#6b6968] hover:text-[#222021]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
