'use client';

import React from 'react';
import { Search, Clock, Building, User, CheckCircle, PhoneCall, ChevronRight } from 'lucide-react';

export interface CockpitLead {
  id: string;
  name: string;
  company: string;
  title: string;
  headcount: string;
  cadenceStep: string;
  localTime: string;
  phone: string;
  email: string;
  currentBpo: string;
  techStack: string;
  painPoint: string;
  status: 'new' | 'contacted' | 'booked' | 'disqualified';
}

interface LeadQueueProps {
  leads: CockpitLead[];
  selectedLeadId: string;
  onSelectLead: (id: string) => void;
  searchFilter: string;
  onSearchChange: (query: string) => void;
}

export default function LeadQueue({
  leads,
  selectedLeadId,
  onSelectLead,
  searchFilter,
  onSearchChange
}: LeadQueueProps) {
  const filteredLeads = leads.filter(l =>
    `${l.name} ${l.company} ${l.title}`.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <aside className="w-72 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0 overflow-hidden select-none">
      {/* Height 44px Compact Search & Filter Input */}
      <div className="h-11 px-3 border-b border-slate-200 bg-white flex items-center justify-between gap-2 shrink-0">
        <div className="relative flex-1">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search leads, title, co..."
            className="w-full pl-8 pr-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#ED1C24] focus:bg-white"
          />
        </div>
        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
          {filteredLeads.length}
        </span>
      </div>

      {/* Pane Sub-header */}
      <div className="px-3 py-1.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between shrink-0">
        <span className="text-[10px] font-bold text-slate-600 tracking-wider uppercase">
          PRIORITY QUEUE
        </span>
        <span className="text-[10px] font-mono text-slate-500">
          Auto-Rotate: ON
        </span>
      </div>

      {/* Scrollable Lead Queue (divide-y divide-slate-100) */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {filteredLeads.map((lead) => {
          const isSelected = lead.id === selectedLeadId;

          return (
            <div
              key={lead.id}
              onClick={() => onSelectLead(lead.id)}
              className={`h-16 px-3 py-2 flex flex-col justify-between cursor-pointer transition-colors relative ${
                isSelected
                  ? 'border-l-4 border-[#ED1C24] bg-white shadow-xs'
                  : 'border-l-4 border-transparent hover:bg-slate-100/70'
              }`}
            >
              {/* Top Row: Name + Timezone Clock */}
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-bold truncate ${isSelected ? 'text-[#222021] font-extrabold' : 'text-slate-800'}`}>
                  {lead.name}
                </span>
                <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1 shrink-0">
                  <Clock className="h-2.5 w-2.5 text-slate-400" />
                  <span>{lead.localTime.split(' - ')[1] || lead.localTime}</span>
                </span>
              </div>

              {/* Bottom Row: Company / Title + Cadence Step Pill */}
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] text-slate-600 truncate leading-none">
                  {lead.company} • <span className="text-slate-500">{lead.title}</span>
                </p>
                <span
                  className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded shrink-0 border ${
                    lead.status === 'booked'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : lead.status === 'contacted'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {lead.cadenceStep}
                </span>
              </div>
            </div>
          );
        })}

        {filteredLeads.length === 0 && (
          <div className="p-6 text-center text-slate-400">
            <p className="text-xs">No leads match filter.</p>
          </div>
        )}
      </div>
    </aside>
  );
}
