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
  FileText
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
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC] font-sans antialiased text-slate-800">
      
      {/* 1. LEFT DARK SIDEBAR DOCK (Exact AI LMS AppSidebar) */}
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
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-400 block mb-1">
                SUPER ADMIN
              </span>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                Control centre
              </h1>
            </div>

            {/* Tenant Selector Dropdown */}
            <div className="relative">
              <button className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-2 shadow-2xs hover:bg-slate-50 transition-colors">
                <span>All tenants (global view)</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-6 border-b border-slate-200 text-sm font-semibold overflow-x-auto scrollbar-none">
            {[
              { id: 'people', label: 'People' },
              { id: 'modules', label: 'Training modules' },
              { id: 'access', label: 'Module access' },
              { id: 'leads', label: 'Leads' },
              { id: 'reps', label: 'Field reps' },
              { id: 'feedback', label: 'Rep feedback' },
              { id: 'audit', label: 'Audit log' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 transition-colors relative whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-slate-900 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F9ED32]" />
                )}
              </button>
            ))}
          </div>

          {/* Filter Bar: [Search] [Roles] [+ Add person] */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full sm:max-w-xl">
              <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email"
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F9ED32] focus:border-slate-300 transition-all shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none shadow-2xs cursor-pointer"
              >
                <option value="all">All roles</option>
                <option value="Manager">Manager</option>
                <option value="Sales Rep">Sales Rep</option>
                <option value="Director">Director</option>
              </select>

              <button
                onClick={() => {}}
                className="h-10 px-4 rounded-xl bg-[#F9ED32] hover:bg-yellow-400 text-slate-900 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Plus className="h-4 w-4" />
                <span>Add person</span>
              </button>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                  <tr>
                    <th className="py-3 px-4">Full name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Tenants</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last login</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {user.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {user.email}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200 font-mono text-[10px]">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {user.tenants}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#F9ED32] text-slate-900 font-bold font-mono text-[10px]">
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        {user.lastLogin}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2 text-slate-400">
                          <button className="hover:text-slate-700 p-1"><Pencil className="h-3.5 w-3.5" /></button>
                          <button className="hover:text-slate-700 p-1"><Mail className="h-3.5 w-3.5" /></button>
                          <button className="hover:text-slate-700 p-1"><Archive className="h-3.5 w-3.5" /></button>
                          <button className="hover:text-red-600 p-1"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Bottom Right Action Button: Rebuttals */}
      <div className="fixed bottom-6 right-6 flex items-center gap-2 z-50">
        <Link
          href="/cockpit"
          className="px-4 py-2.5 rounded-full bg-[#F9ED32] hover:bg-yellow-400 text-slate-900 font-extrabold text-xs flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105"
        >
          <FileText className="h-4 w-4" />
          <span>Rebuttals</span>
          <kbd className="text-[10px] bg-slate-900/10 px-1 py-0.2 rounded font-mono">R</kbd>
        </Link>
      </div>
    </div>
  );
}
