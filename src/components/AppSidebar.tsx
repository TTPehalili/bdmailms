'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Target, 
  Swords, 
  Headphones, 
  PhoneCall, 
  CalendarDays, 
  BookOpen, 
  Radio, 
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight
} from 'lucide-react';

export default function AppSidebar() {
  const pathname = usePathname();
  // State: 'expanded' (w-60 with labels), 'icons' (w-16 compact dock), or 'hidden' (w-0 full screen)
  const [trayState, setTrayState] = useState<'expanded' | 'icons' | 'hidden'>('icons');

  // Load user preference from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem('sdr_tray_state');
    if (saved === 'expanded' || saved === 'icons' || saved === 'hidden') {
      setTrayState(saved);
    }
  }, []);

  const updateTrayState = (state: 'expanded' | 'icons' | 'hidden') => {
    setTrayState(state);
    localStorage.setItem('sdr_tray_state', state);
  };

  const isMission = pathname === '/';
  const isDojo = pathname === '/cockpit';
  const isSparring = pathname.startsWith('/sparring');
  const isGuide = pathname.startsWith('/guide');
  const isMonitoring = pathname.startsWith('/monitoring');
  const isAdmin = pathname.startsWith('/admin');

  // Front-Line SDR Navigation Stack
  const navItems = [
    { 
      label: 'Mission & Targets', 
      href: '/', 
      icon: Target, 
      isActive: isMission, 
      tag: 'ABOUT' 
    },
    { 
      label: 'AI Boris Calling Cockpit', 
      href: '/cockpit', 
      icon: Swords, 
      isActive: isDojo, 
      tag: 'LIVE' 
    },
    { 
      label: 'AI Sparring Arena', 
      href: '/sparring', 
      icon: Headphones, 
      isActive: isSparring, 
      tag: 'VOICE' 
    },
    { 
      label: 'User Guide', 
      href: '/guide', 
      icon: BookOpen, 
      isActive: isGuide, 
      tag: 'GUIDE' 
    },
    { 
      label: 'Live Monitoring', 
      href: '/monitoring', 
      icon: Radio, 
      isActive: isMonitoring, 
      tag: 'LIVE' 
    },
    { 
      label: 'Admin Control', 
      href: '/admin', 
      icon: ShieldCheck, 
      isActive: isAdmin, 
      tag: 'ADMIN' 
    },
  ];

  // If tray is completely hidden, show floating edge toggle button
  if (trayState === 'hidden') {
    return (
      <button
        onClick={() => updateTrayState('icons')}
        title="Open Tools Icon Tray (Ctrl+B)"
        className="fixed left-2 top-16 z-50 h-9 w-9 rounded-xl bg-[#222021] text-[#F2F0EF] border border-[#ED1C24]/30 hover:border-[#ED1C24] shadow-lg flex items-center justify-center transition-all hover:scale-105 group"
      >
        <PanelLeftOpen className="h-4 w-4 text-[#ED1C24] group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  const isExpanded = trayState === 'expanded';

  return (
    <aside 
      className={`bg-[#222021] border-r border-white/10 shrink-0 select-none z-40 flex flex-col justify-between py-4 transition-all duration-200 ease-in-out ${
        isExpanded ? 'w-64 px-3' : 'w-16 px-2'
      }`}
    >
      {/* Top Branding & Collapse Controls */}
      <div className="flex flex-col gap-5 w-full">
        
        {/* Brand Header */}
        <div className={`flex items-center ${isExpanded ? 'justify-between px-1' : 'justify-center'}`}>
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-[#ED1C24] flex items-center justify-center text-white font-black text-base shadow-md group-hover:scale-105 transition-transform shrink-0">
              <span>⚡</span>
            </div>
            {isExpanded && (
              <div className="flex flex-col leading-none overflow-hidden">
                <span className="font-black text-sm text-[#F2F0EF] tracking-tight truncate">
                  APPOINTMENTLYY
                </span>
                <span className="text-[10px] text-[#6b6968] font-mono mt-0.5">
                  BORIS SDR INTELLIGENCE
                </span>
              </div>
            )}
          </Link>

          {/* Toggle Button: Icon Tray <-> Expanded Sidebar */}
          {isExpanded && (
            <button
              onClick={() => updateTrayState('icons')}
              title="Collapse to icons"
              className="p-1.5 rounded-lg text-[#F2F0EF]/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* When in icon dock, subtle expand / hide controls */}
        {!isExpanded && (
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => updateTrayState('expanded')}
              title="Expand Tools Tray (with labels)"
              className="p-1 rounded-md text-[#F2F0EF]/40 hover:text-[#ED1C24] hover:bg-white/5 transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => updateTrayState('hidden')}
              title="Hide tools tray completely"
              className="p-1 rounded-md text-[#F2F0EF]/40 hover:text-white hover:bg-white/5 transition-colors"
            >
              <PanelLeftClose className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5 w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                title={!isExpanded ? item.label : undefined}
                className={`flex items-center rounded-xl transition-all ${
                  isExpanded ? 'gap-3 px-3 py-2.5' : 'justify-center h-10 w-10 mx-auto'
                } ${
                  item.isActive
                    ? 'bg-[#ED1C24] text-white shadow-sm font-bold'
                    : 'text-[#F2F0EF]/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {isExpanded && (
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <span className="text-xs truncate font-semibold">
                      {item.label}
                    </span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                      item.isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-[#F2F0EF]/40'
                    }`}>
                      {item.tag}
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom: GPA Score & Collapse Trigger */}
      <div className={`flex flex-col pt-4 border-t border-white/10 ${isExpanded ? 'px-2' : 'items-center'}`}>
        {isExpanded ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full border-2 border-[#ED1C24] bg-[#ED1C24]/10 flex items-center justify-center text-[#ED1C24] font-black text-[10px] font-mono">
                92.5
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xs font-bold text-[#F2F0EF]">Rep Quality GPA</span>
                <span className="text-[10px] text-[#6b6968] font-mono mt-0.5">Floor Rank: #2</span>
              </div>
            </div>

            <button
              onClick={() => updateTrayState('hidden')}
              title="Hide tools tray"
              className="p-1 rounded text-[#F2F0EF]/40 hover:text-white transition-colors"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div 
            title="Overall Rep Quality Score: 92.5% (Click to expand tray)"
            onClick={() => updateTrayState('expanded')}
            className="h-8 w-8 rounded-full border-2 border-[#ED1C24] bg-[#ED1C24]/10 flex items-center justify-center text-[#ED1C24] font-black text-[10px] font-mono shadow-xs cursor-pointer hover:scale-105 transition-transform"
          >
            92.5
          </div>
        )}
      </div>
    </aside>
  );
}
