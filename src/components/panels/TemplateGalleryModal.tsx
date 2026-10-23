'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Sparkles,
  Zap,
  Mail,
  Smartphone,
  PhoneCall,
  Clock,
  Layers,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Share2,
  Bot,
  Hash,
  Server,
  Hourglass,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Folder
} from 'lucide-react';
import { PRELOADED_WORKFLOW_TEMPLATES, WorkflowTemplate, OutboundCategory } from '@/lib/workflowTemplates';
import { ProjectFolderRecord } from '@/lib/db';

interface TemplateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: WorkflowTemplate, targetFolderId?: string) => void;
  projects: ProjectFolderRecord[];
  currentFolderId: string | null;
}

const CATEGORIES: { id: OutboundCategory | 'All'; label: string; count: number }[] = [
  { id: 'All', label: 'All Outbound Templates', count: PRELOADED_WORKFLOW_TEMPLATES.length },
  {
    id: '21-Day Outbound Cadence',
    label: '21-Day Cadence Blueprint',
    count: PRELOADED_WORKFLOW_TEMPLATES.filter((t) => t.category === '21-Day Outbound Cadence').length
  },
  {
    id: 'After-Call Dispositions',
    label: 'After-Call Dispositions',
    count: PRELOADED_WORKFLOW_TEMPLATES.filter((t) => t.category === 'After-Call Dispositions').length
  },
  {
    id: 'Speed-to-Lead & Signals',
    label: 'Speed-to-Lead',
    count: PRELOADED_WORKFLOW_TEMPLATES.filter((t) => t.category === 'Speed-to-Lead & Signals').length
  },
  {
    id: 'AI Research & Personalization',
    label: 'AI & Research',
    count: PRELOADED_WORKFLOW_TEMPLATES.filter((t) => t.category === 'AI Research & Personalization').length
  }
];

export default function TemplateGalleryModal({
  isOpen,
  onClose,
  onSelectTemplate,
  projects,
  currentFolderId
}: TemplateGalleryModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<OutboundCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>(currentFolderId || 'proj-cadence');
  const [previewTemplate, setPreviewTemplate] = useState<WorkflowTemplate | null>(null);

  const filteredTemplates = useMemo(() => {
    return PRELOADED_WORKFLOW_TEMPLATES.filter((tpl) => {
      if (selectedCategory !== 'All' && tpl.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = tpl.name.toLowerCase().includes(q);
        const matchesDesc = tpl.description.toLowerCase().includes(q);
        const matchesDisp = tpl.disposition?.toLowerCase().includes(q);
        const matchesDay = tpl.cadenceDay?.toLowerCase().includes(q);
        return matchesName || matchesDesc || matchesDisp || matchesDay;
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-5xl h-[88vh] rounded-3xl bg-white border border-stone-200 shadow-2xl flex flex-col overflow-hidden font-sans">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-start justify-between bg-stone-50/70 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#ED1C24] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Outbound SDR Automation Library
              </span>
              <span className="text-[10px] font-mono text-stone-400">
                21-Day Cadences • After-Call Dispositions • Speed-to-Lead
              </span>
            </div>
            <h2 className="text-xl font-black text-stone-900 tracking-tight mt-1">
              Select Outbound Workflow Template
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Choose from pre-built multi-channel cadences following our 21-day blueprint and Boris Cockpit dispositions.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-6 py-3 border-b border-stone-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    selectedCategory === cat.id ? 'bg-stone-700 text-white' : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search by cadence day, SMS, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#ED1C24]"
            />
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#fbfbfb]">
          {/* Destination Folder Selector */}
          <div className="mb-5 p-3 rounded-2xl bg-white border border-stone-200/80 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2 text-xs">
              <Folder className="h-4 w-4 text-[#ED1C24]" />
              <span className="font-semibold text-stone-700">Import workflow into folder:</span>
            </div>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1 text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#ED1C24] cursor-pointer"
            >
              <option value="">Ungrouped (Root Directory)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  📁 {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => {
              const isMaster = template.id === 'tpl-cadence-21day-master';
              const isVip = template.id === 'tpl-meeting-booked-vip';

              return (
                <div
                  key={template.id}
                  className={`rounded-2xl bg-white border transition-all p-5 flex flex-col justify-between shadow-2xs hover:shadow-md group relative ${
                    isMaster
                      ? 'border-[#ED1C24]/40 bg-gradient-to-b from-rose-50/20 to-white ring-1 ring-[#ED1C24]/20'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Card Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                        {template.cadenceDay || template.category}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                        {template.badge}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-black text-stone-900 group-hover:text-[#ED1C24] transition-colors leading-snug">
                      {template.name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-stone-500 line-clamp-3 leading-relaxed">
                      {template.description}
                    </p>

                    {/* Cadence Touches preview (if 21-day blueprint) */}
                    {template.cadenceTouches && template.cadenceTouches.length > 0 && (
                      <div className="mt-2 p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-[11px] space-y-1">
                        <span className="text-[10px] font-bold text-stone-700 uppercase tracking-wider block">
                          Cadence Touchpoints:
                        </span>
                        <ul className="list-disc list-inside text-stone-500 space-y-0.5 line-clamp-3">
                          {template.cadenceTouches.slice(0, 3).map((touch, i) => (
                            <li key={i}>{touch}</li>
                          ))}
                        </ul>
                        {template.cadenceTouches.length > 3 && (
                          <span className="text-[10px] text-[#ED1C24] font-semibold block">
                            + {template.cadenceTouches.length - 3} more touches across 27 days
                          </span>
                        )}
                      </div>
                    )}

                    {/* Channels Pill Bar */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {template.channels.map((ch) => (
                        <span
                          key={ch}
                          className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 flex items-center gap-1 border border-stone-200/60"
                        >
                          {ch === 'sms' && <Smartphone className="h-3 w-3 text-emerald-600" />}
                          {ch === 'email' && <Mail className="h-3 w-3 text-blue-600" />}
                          {ch === 'linkedin' && <Share2 className="h-3 w-3 text-cyan-700" />}
                          {ch === 'phone' && <PhoneCall className="h-3 w-3 text-purple-600" />}
                          {ch === 'ai' && <Bot className="h-3 w-3 text-amber-600" />}
                          {ch === 'slack' && <Hash className="h-3 w-3 text-rose-600" />}
                          {ch === 'crm' && <Server className="h-3 w-3 text-stone-600" />}
                          <span>{ch === 'linkedin' ? 'LinkedIn (Manual Task)' : ch}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                    <div className="text-[11px] font-mono text-stone-400">
                      <span>{template.nodeCount} nodes</span>
                      <span className="mx-1.5">•</span>
                      <span className="text-stone-600 font-semibold">{template.estimatedSavings}</span>
                    </div>

                    <button
                      onClick={() => onSelectTemplate(template, selectedFolder || undefined)}
                      className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-[#ED1C24] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                    >
                      <span>Use Template</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/70 flex items-center justify-between text-xs text-stone-500 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-stone-700">Golden Outbound Rules:</span>
            <span>1. Front-load week 1 (4-5 touches)</span>
            <span>•</span>
            <span>2. Pair cold dials with same-day email (+15% opens)</span>
            <span>•</span>
            <span>3. Space out second half (weeks 2 & 3)</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 font-bold cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
