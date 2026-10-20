'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Plus, 
  Pencil, 
  Mail, 
  Archive, 
  Trash2, 
  ChevronDown,
  ShieldCheck,
  FileText,
  Users,
  BookOpen,
  Sliders,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import AppSidebar from '@/components/AppSidebar';
import GlobalTopHeader from '@/components/GlobalTopHeader';

export default function AdminControlCentre() {
  const [activeTab, setActiveTab] = useState<'people' | 'modules' | 'access' | 'leads' | 'reps' | 'feedback' | 'audit'>('people');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const users = [
    {
      id: '1',
      name: 'Emil Halili',
      email: 'emil@callview.ai',
      role: 'Manager',
      tenants: 'None',
      status: 'Active',
      lastLogin: '17/10/2026, 2:13:56 pm'
    },
    {
      id: '2',
      name: 'Alex Mercer',
      email: 'alex@appointmentlyy.io',
      role: 'Sales Rep',
      tenants: 'Enterprise Outbound Q4',
      status: 'Active',
      lastLogin: '20/10/2026, 11:20:14 am'
    },
    {
      id: '3',
      name: 'Elena Rostova',
      email: 'elena@appointmentlyy.io',
      role: 'Sales Rep',
      tenants: 'Fintech Scaleups',
      status: 'Active',
      lastLogin: '20/10/2026, 10:15:30 am'
    },
    {
      id: '4',
      name: 'Marcus Vance',
      email: 'marcus@callview.ai',
      role: 'Director',
      tenants: 'Global (All Tenants)',
      status: 'Active',
      lastLogin: '19/10/2026, 4:12:10 pm'
    }
  ];

  const filteredUsers = users.filter(u => {
    const matchSearch = `${u.name} ${u.email}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role.toLowerCase() === roleFilter.toLowerCase();
    return matchSearch && matchRole;
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F2F0EF] font-sans antialiased text-[#222021]">
      
      {/* 1. LEFT CHARCOAL SIDEBAR DOCK */}
      <AppSidebar />

      {/* 2. MAIN APP SHELL */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Global Utility Bar */}
        <GlobalTopHeader />

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto px-8 py-8 space-y-6">
          
          {/* Header Bar */}
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#ED1C24] block mb-1">
                SUPER ADMIN
              </span>
              <h1 className="text-3xl font-black tracking-tight text-[#222021]">
                Control centre
              </h1>
            </div>

            {/* Tenant Selector Dropdown */}
            <div className="relative">
              <button className="px-4 py-2 rounded-xl bg-white border border-[#222021]/15 text-xs font-semibold text-[#222021] flex items-center gap-2 shadow-2xs hover:bg-[#F2F0EF] transition-colors">
                <span>All tenants (global view)</span>
                <ChevronDown className="h-3.5 w-3.5 text-[#6b6968]" />
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs (Pure B2B Sales, Zero Solar / Zero Field Reps) */}
          <div className="flex items-center gap-6 border-b border-[#222021]/10 text-sm font-semibold overflow-x-auto scrollbar-none">
            {[
              { id: 'people', label: 'People' },
              { id: 'modules', label: 'Training modules' },
              { id: 'access', label: 'Module access' },
              { id: 'leads', label: 'Leads' },
              { id: 'reps', label: 'Sales reps' },
              { id: 'feedback', label: 'Rep feedback' },
              { id: 'audit', label: 'Audit log' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 transition-colors relative whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-[#222021] font-bold'
                    : 'text-[#6b6968] hover:text-[#222021]'
                }`}
              >
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ED1C24]" />
                )}
              </button>
            ))}
          </div>

          {/* TAB 1: PEOPLE (User Management) */}
          {activeTab === 'people' && (
            <div className="space-y-4">
              {/* Filter Bar: [Search] [Roles] [+ Add person] */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative flex-1 w-full sm:max-w-xl">
                  <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b6968]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email"
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-[#222021]/15 text-xs font-medium placeholder-[#6b6968] text-[#222021] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#ED1C24] transition-all"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="h-11 px-3.5 rounded-xl bg-white border border-[#222021]/15 text-xs font-semibold text-[#222021] focus:outline-none shadow-2xs"
                  >
                    <option value="all">All roles</option>
                    <option value="director">Director</option>
                    <option value="manager">Manager</option>
                    <option value="sales rep">Sales Rep</option>
                  </select>

                  <button className="h-11 px-4 rounded-xl bg-[#ED1C24] hover:bg-[#d0181f] text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors shrink-0">
                    <Plus className="h-4 w-4" />
                    <span>Add person</span>
                  </button>
                </div>
              </div>

              {/* People Table */}
              <div className="bg-white border border-[#222021]/10 rounded-2xl shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#222021]/10 bg-[#F2F0EF]/50 text-[#6b6968] font-bold">
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Tenants</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Last login</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222021]/10 font-medium">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-[#F2F0EF]/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#222021]">{user.name}</div>
                            <div className="text-[11px] text-[#6b6968]">{user.email}</div>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-[#222021]">
                            {user.role}
                          </td>
                          <td className="py-3.5 px-4 text-[#6b6968]">
                            {user.tenants}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {user.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[#6b6968] font-mono text-[11px]">
                            {user.lastLogin}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button title="Edit User" className="p-1.5 rounded-lg hover:bg-[#F2F0EF] text-[#6b6968] hover:text-[#222021] transition-colors">
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button title="Send Reset Email" className="p-1.5 rounded-lg hover:bg-[#F2F0EF] text-[#6b6968] hover:text-[#222021] transition-colors">
                                <Mail className="h-3.5 w-3.5" />
                              </button>
                              <button title="Archive User" className="p-1.5 rounded-lg hover:bg-[#F2F0EF] text-[#6b6968] hover:text-[#222021] transition-colors">
                                <Archive className="h-3.5 w-3.5" />
                              </button>
                              <button title="Delete User" className="p-1.5 rounded-lg hover:bg-red-50 text-[#6b6968] hover:text-[#ED1C24] transition-colors">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="py-3 px-4 border-t border-[#222021]/10 bg-[#F2F0EF]/30 text-xs text-[#6b6968] flex items-center justify-between">
                  <span>Showing {filteredUsers.length} of {users.length} team members</span>
                  <div className="flex items-center gap-2">
                    <button className="px-2 py-1 rounded border border-[#222021]/15 bg-white text-[#6b6968] hover:text-[#222021] disabled:opacity-50 text-xs">Previous</button>
                    <button className="px-2 py-1 rounded border border-[#222021]/15 bg-white text-[#6b6968] hover:text-[#222021] disabled:opacity-50 text-xs">Next</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TRAINING MODULES (Pure B2B SDR Curricula) */}
          {activeTab === 'modules' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { num: '01', title: 'Outbound Cold Calling Fundamentals', desc: 'Pattern interrupts, tonal pacing, and 20-second permission openers.', reps: '18 reps certified' },
                { num: '02', title: 'AI Boris Live Calling Cockpit', desc: 'Real-time objection interception and sub-second ARM script execution.', reps: '24 reps active' },
                { num: '03', title: 'AI Sparring Simulator', desc: 'Acoustic practice against skeptical VPs, burned directors, and gatekeepers.', reps: '15 reps certified' },
                { num: '04', title: 'Enterprise Certification Gate', desc: 'Standardized 80% passing evaluation with tamper-evident digital certificates.', reps: '12 certificates issued' },
              ].map(mod => (
                <div key={mod.num} className="bg-white border border-[#222021]/10 rounded-2xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#ED1C24]/10 text-[#ED1C24] border border-[#ED1C24]/20">
                      MODULE {mod.num}
                    </span>
                    <span className="text-[11px] text-[#6b6968] font-medium">{mod.reps}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-[#222021]">{mod.title}</h3>
                  <p className="text-xs text-[#6b6968] leading-relaxed">{mod.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: MODULE ACCESS */}
          {activeTab === 'access' && (
            <div className="bg-white border border-[#222021]/10 rounded-2xl p-6 shadow-2xs space-y-4">
              <h3 className="text-base font-extrabold text-[#222021]">Role Permission Matrix</h3>
              <p className="text-xs text-[#6b6968]">Configure granular tool access for SDRs, Closers, and Managers across campaigns.</p>
              <div className="divide-y divide-[#222021]/10 text-xs">
                {['AI Boris Cockpit', 'AI Sparring Arena', 'Dialer Softphone', 'Lead Importer (CSV)', 'QA Scorecards'].map(tool => (
                  <div key={tool} className="py-3 flex items-center justify-between">
                    <span className="font-bold text-[#222021]">{tool}</span>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-1.5 text-[#6b6968]"><input type="checkbox" defaultChecked className="accent-[#ED1C24]" /> SDR</label>
                      <label className="flex items-center gap-1.5 text-[#6b6968]"><input type="checkbox" defaultChecked className="accent-[#ED1C24]" /> Closer</label>
                      <label className="flex items-center gap-1.5 text-[#6b6968]"><input type="checkbox" defaultChecked className="accent-[#ED1C24]" /> Manager</label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: LEADS */}
          {activeTab === 'leads' && (
            <div className="bg-white border border-[#222021]/10 rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-[#222021]">B2B Lead Pipelines</h3>
                  <p className="text-xs text-[#6b6968]">Enriched cold accounts loaded for Apollo and HubSpot outbound campaigns.</p>
                </div>
                <Link href="/admin/campaigns/enterprise-outbound/leads" className="px-3.5 py-2 rounded-xl bg-[#ED1C24] text-white font-bold text-xs hover:bg-[#d0181f] transition-colors">
                  Open Lead Roster
                </Link>
              </div>
            </div>
          )}

          {/* TAB 5: SALES REPS (Replaced Field Reps) */}
          {activeTab === 'reps' && (
            <div className="bg-white border border-[#222021]/10 rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-[#222021]">SDR & Closer Floor Performance</h3>
                  <p className="text-xs text-[#6b6968]">Real-time outbound hold metrics, objection recovery rate, and booked meetings.</p>
                </div>
                <Link href="/admin/reps" className="px-3.5 py-2 rounded-xl bg-[#ED1C24] text-white font-bold text-xs hover:bg-[#d0181f] transition-colors">
                  Manage SDR Roster
                </Link>
              </div>
            </div>
          )}

          {/* TAB 6: FEEDBACK */}
          {activeTab === 'feedback' && (
            <div className="bg-white border border-[#222021]/10 rounded-2xl p-6 shadow-2xs space-y-4">
              <h3 className="text-base font-extrabold text-[#222021]">Rep Coaching & Audio QA Feedback</h3>
              <p className="text-xs text-[#6b6968]">Automated objection recovery auditing powered by ElevenLabs transcription.</p>
            </div>
          )}

          {/* TAB 7: AUDIT */}
          {activeTab === 'audit' && (
            <div className="bg-white border border-[#222021]/10 rounded-2xl p-6 shadow-2xs space-y-4">
              <h3 className="text-base font-extrabold text-[#222021]">Enterprise Security & Audit Log</h3>
              <p className="text-xs text-[#6b6968]">Immutable event log for tenant configuration, user logins, and CSV lead ingestion.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
