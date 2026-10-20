'use client';

import React from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  FileSpreadsheet, 
  Users, 
  ArrowRight, 
  Database, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  Radio, 
  BarChart3,
  Award,
  UploadCloud,
  FileCheck2
} from 'lucide-react';
import AdminNavigationHeader from '@/components/AdminNavigationHeader';

export default function AdminHubPage() {
  const adminModules = [
    {
      title: 'Playbook Vector Ingestion',
      category: 'Knowledge Base & RAG',
      description: 'Upload PDF, DOCX, or Markdown sales playbooks to automatically extract structured [A], [R], [M] entries and index into Supabase vector space (1536 dimensions).',
      icon: BookOpen,
      href: '/admin/frameworks',
      badge: 'Active Engine',
      stats: [
        { label: 'Embedding Model', value: 'OpenAI text-embed-3' },
        { label: 'Dimensions', value: '1536-dim' },
        { label: 'Similarity Match', value: 'Cosine CosSim > 0.78' },
      ],
      cta: 'Launch Ingestion Console'
    },
    {
      title: 'Campaign Lead Ingestion & Cadence',
      category: 'Pipeline & Outbound Automation',
      description: 'Ingest raw prospect CSVs, auto-map custom attributes, and synthesize context-injected multi-channel cadences (cold call opener, email, LinkedIn, voicemail).',
      icon: FileSpreadsheet,
      href: '/admin/campaigns/enterprise-outbound/leads',
      badge: 'Multi-Channel',
      stats: [
        { label: 'Active Campaign', value: 'Enterprise Outbound Q4' },
        { label: 'Touchpoints', value: '4 Channels (Call/Email/LI/VM)' },
        { label: 'Variables', value: 'Auto-Injected Context' },
      ],
      cta: 'Manage Lead Queue'
    },
    {
      title: 'Rep Roster & Certification Audit',
      category: 'Workforce Enablement & Governance',
      description: 'Supervise BPO sales rep floor readiness. Audit 3–5 attempt threshold histories, inspect automated rubric scorecards, and issue official digital certificates.',
      icon: Users,
      href: '/admin/reps',
      badge: 'Floor Governance',
      stats: [
        { label: 'Active Roster', value: '4 Sales Reps' },
        { label: 'Min Passing Score', value: '85% ARM Rubric' },
        { label: 'Attempts Required', value: '3 to 5 Verified' },
      ],
      cta: 'Audit Rep Roster'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      <AdminNavigationHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto p-8 flex flex-col gap-8">
        
        {/* Welcome Executive Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold tracking-wide uppercase mb-3">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Supervisor & Enablement Control Plane</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Operations & Framework Management Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              This isolated management console enables sales directors and enablement managers to ingest objection playbooks, configure outbound campaign cadences, and supervise rep floor certification without cluttering the SDR live calling cockpit.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              href="/cockpit"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wide transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Radio className="h-3.5 w-3.5 text-emerald-400" />
              <span>Launch SDR Live Cockpit</span>
            </Link>
          </div>
        </div>

        {/* 3 Core Admin Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {adminModules.map((module) => {
            const Icon = module.icon;
            return (
              <div
                key={module.title}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-indigo-400 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold uppercase font-mono">
                      {module.badge}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                    {module.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1 mb-2">
                    {module.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {module.description}
                  </p>

                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                    {module.stats.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">{s.label}:</span>
                        <span className="font-semibold text-slate-800 font-mono text-[11px]">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href={module.href}
                  className="mt-6 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs tracking-wide transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>{module.cta}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* System Architecture Reference Box */}
        <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
              <Database className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Role-Based Separation of Concerns
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                Front-line SDRs operate exclusively within the dialer cockpit and sparring simulator. All playbook vectorization and team audits remain isolated in this Supervisor Portal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-semibold">
              RBAC: SUPERVISOR ENFORCED
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
