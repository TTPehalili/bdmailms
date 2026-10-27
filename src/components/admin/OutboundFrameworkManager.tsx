'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Layers, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Copy, 
  RotateCcw, 
  Save, 
  Play, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Mail,
  PhoneCall,
  HelpCircle,
  ShieldCheck,
  Eye
} from 'lucide-react';
import LinkedinIcon from '@/components/icons/LinkedinIcon';
import { 
  DEFAULT_OUTBOUND_FRAMEWORKS, 
  DEFAULT_ANTI_SALES_CTAS, 
  OutboundFramework, 
  AntiSalesCta,
  getStoredFrameworks,
  saveStoredFrameworks,
  getStoredAntiSalesCtas,
  saveStoredAntiSalesCtas,
  OutboundChannel
} from '@/lib/outboundFrameworks';

export default function OutboundFrameworkManager() {
  const [activeTab, setActiveTab] = useState<'Phone' | 'Email' | 'LinkedIn' | 'CTAs' | 'Playground'>('Phone');
  const [frameworks, setFrameworks] = useState<OutboundFramework[]>([]);
  const [antiSalesCtas, setAntiSalesCtas] = useState<AntiSalesCta[]>([]);
  const [editingFramework, setEditingFramework] = useState<OutboundFramework | null>(null);
  const [isSavedToast, setIsSavedToast] = useState(false);

  // Playground state
  const [playgroundChannel, setPlaygroundChannel] = useState<OutboundChannel>('Phone');
  const [testLead, setTestLead] = useState({
    name: 'Julian Vance',
    company: 'Apex Global BPO',
    title: 'Managing Director & Head of Outbound',
    headcount: '250 Seats (Manila & Cebu)',
    techStack: 'Apollo.io and HubSpot CRM',
    outsourcer: 'Titan BPO Solutions',
    painPoint: 'objection drop-offs when prospects claim they already get pitched by 3 competitors on shared lists',
    website: 'apexglobalbpo.ph',
    linkedinUrl: 'linkedin.com/in/julian-vance-bpo',
    buyingSignals: ['Scaling Manila floor to 250 seats', 'Expanding CS and Outbound Sales']
  });
  const [testFrameworkId, setTestFrameworkId] = useState<string>('braun_cold_call');
  const [testCtaId, setTestCtaId] = useState<string>('cta_phone_hangup_or_30s');
  const [testCustomPrompt, setTestCustomPrompt] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    setFrameworks(getStoredFrameworks());
    setAntiSalesCtas(getStoredAntiSalesCtas());
  }, []);

  const handleToggleActive = (id: string) => {
    const updated = frameworks.map(f => f.id === id ? { ...f, isActive: !f.isActive } : f);
    setFrameworks(updated);
    saveStoredFrameworks(updated);
  };

  const handleSetDefault = (id: string, channel: OutboundChannel) => {
    const updated = frameworks.map(f => {
      if (f.channel !== channel) return f;
      return { ...f, isDefault: f.id === id };
    });
    setFrameworks(updated);
    saveStoredFrameworks(updated);
  };

  const handleSaveFramework = (fw: OutboundFramework) => {
    let updated: OutboundFramework[];
    if (frameworks.some(f => f.id === fw.id)) {
      updated = frameworks.map(f => f.id === fw.id ? fw : f);
    } else {
      updated = [...frameworks, fw];
    }
    setFrameworks(updated);
    saveStoredFrameworks(updated);
    setEditingFramework(null);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2500);
  };

  const handleResetToDefaults = () => {
    if (confirm('Reset all frameworks and anti-sales CTAs to system defaults?')) {
      setFrameworks(DEFAULT_OUTBOUND_FRAMEWORKS);
      saveStoredFrameworks(DEFAULT_OUTBOUND_FRAMEWORKS);
      setAntiSalesCtas(DEFAULT_ANTI_SALES_CTAS);
      saveStoredAntiSalesCtas(DEFAULT_ANTI_SALES_CTAS);
      setIsSavedToast(true);
      setTimeout(() => setIsSavedToast(false), 2500);
    }
  };

  // Run Playground Live Inference
  const handleRunTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/ai/outbound-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: playgroundChannel,
          lead: testLead,
          frameworkId: testFrameworkId,
          antiSalesCtaId: testCtaId,
          customPromptInstruction: testCustomPrompt,
          tone: playgroundChannel === 'Phone' ? 'Natural Spoken' : 'Crisp & Direct'
        })
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      console.error('Playground test error:', err);
    } finally {
      setIsTesting(false);
    }
  };

  const filteredFrameworks = frameworks.filter(f => f.channel === activeTab);

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-zinc-900 text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500">
              AI OUTBOUND FRAMEWORKS STUDIO
            </span>
          </div>
          <h2 className="text-lg font-bold text-zinc-900 tracking-tight mt-1">
            Cold Call, Cold Email & LinkedIn Frameworks
          </h2>
          <p className="text-xs text-zinc-500">
            Configure guru cold calling openers, email frameworks, and anti-sales CTAs grounded in .csv prospect intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSavedToast && (
            <span className="text-xs text-emerald-700 font-medium flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saved successfully</span>
            </span>
          )}
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* SEGMENTED TAB NAV */}
      <div className="flex items-center gap-1 border-b border-zinc-200 pb-px overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('Phone')}
          className={`px-4 py-2 text-xs font-medium rounded-t-lg transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'Phone'
              ? 'border-zinc-900 text-zinc-900 font-bold bg-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Cold Call Guru Openers ({frameworks.filter(f => f.channel === 'Phone').length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('Email')}
          className={`px-4 py-2 text-xs font-medium rounded-t-lg transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'Email'
              ? 'border-zinc-900 text-zinc-900 font-bold bg-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Cold Email Frameworks ({frameworks.filter(f => f.channel === 'Email').length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('LinkedIn')}
          className={`px-4 py-2 text-xs font-medium rounded-t-lg transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'LinkedIn'
              ? 'border-zinc-900 text-zinc-900 font-bold bg-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <LinkedinIcon className="w-3.5 h-3.5" />
          <span>LinkedIn Frameworks ({frameworks.filter(f => f.channel === 'LinkedIn').length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CTAs')}
          className={`px-4 py-2 text-xs font-medium rounded-t-lg transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'CTAs'
              ? 'border-zinc-900 text-zinc-900 font-bold bg-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Anti-Sales CTA Library ({antiSalesCtas.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('Playground')}
          className={`px-4 py-2 text-xs font-medium rounded-t-lg transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'Playground'
              ? 'border-zinc-900 text-zinc-900 font-bold bg-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>Live Gemini Playground</span>
        </button>
      </div>

      {/* FRAMEWORKS LIST (Phone, Email, LinkedIn) */}
      {(activeTab === 'Phone' || activeTab === 'Email' || activeTab === 'LinkedIn') && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredFrameworks.map((fw) => (
              <div 
                key={fw.id}
                className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-900">{fw.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                      {fw.authorOrStyle}
                    </span>
                    {fw.isDefault && (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-zinc-900 text-white">
                        Floor Default
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!fw.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(fw.id, fw.channel)}
                        className="text-xs text-zinc-600 hover:text-zinc-900 hover:underline cursor-pointer"
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(fw.id)}
                      className={`text-xs px-2.5 py-1 rounded font-medium transition-colors cursor-pointer border ${
                        fw.isActive
                          ? 'bg-zinc-100 text-zinc-800 border-zinc-300'
                          : 'bg-zinc-50 text-zinc-400 border-zinc-200'
                      }`}
                    >
                      {fw.isActive ? 'Active' : 'Disabled'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingFramework(fw)}
                      className="p-1 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed">
                  {fw.description}
                </p>

                {/* ANTI-SALES PRINCIPLE */}
                <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-700 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase text-zinc-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-700" />
                    <span>Anti-Sales Constraint (Target: ~{fw.targetWordCount} words)</span>
                  </div>
                  <p className="text-[11px] text-zinc-600">
                    {fw.antiSalesPrinciple}
                  </p>
                </div>

                {/* EXAMPLE SNIPPET */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase">
                    Sample Output Preview:
                  </span>
                  <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 font-mono text-xs text-zinc-800 whitespace-pre-wrap leading-relaxed">
                    {fw.exampleSnippet}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ANTI-SALES CTA LIBRARY */}
      {activeTab === 'CTAs' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600">
            <strong>Anti-Sales Psychology:</strong> Defensive prospects delete emails and hang up on cold calls when pushed into a corner. 
            Permission-based, no-oriented, and pattern-interrupt CTAs give prospects total freedom to decline, which disarms pressure and drastically increases conversation rates.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {antiSalesCtas.map((cta) => (
              <div 
                key={cta.id}
                className="bg-white border border-zinc-200 rounded-xl p-3.5 shadow-2xs space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100">
                    <span className="text-xs font-bold text-zinc-900">{cta.label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                        {cta.channel}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 text-white">
                        {cta.psychologyAngle}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-800 font-mono mt-2 italic">
                    "{cta.ctaText}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LIVE GEMINI PLAYGROUND */}
      {activeTab === 'Playground' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Test Controls (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Live Gemini Synthesis Playground</h3>
              <p className="text-xs text-zinc-500">Test cold calls, emails, and LinkedIn messages live against a .csv prospect.</p>
            </div>

            {/* CHANNEL TOGGLE */}
            <div className="grid grid-cols-3 p-1 bg-zinc-100 rounded-lg text-xs font-medium border border-zinc-200/60">
              {(['Phone', 'Email', 'LinkedIn'] as OutboundChannel[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setPlaygroundChannel(c);
                    const matching = frameworks.filter(f => f.channel === c && f.isActive);
                    if (matching.length > 0) setTestFrameworkId(matching[0].id);
                  }}
                  className={`py-1.5 rounded-md text-center transition-all cursor-pointer ${
                    playgroundChannel === c ? 'bg-white text-zinc-900 font-bold shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] font-mono font-medium text-zinc-500 uppercase block mb-1">
                  Select Framework
                </label>
                <select
                  value={testFrameworkId}
                  onChange={(e) => setTestFrameworkId(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 font-medium"
                >
                  {frameworks.filter(f => f.channel === playgroundChannel).map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.authorOrStyle})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono font-medium text-zinc-500 uppercase block mb-1">
                  Select Anti-Sales Closing Angle
                </label>
                <select
                  value={testCtaId}
                  onChange={(e) => setTestCtaId(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 font-medium"
                >
                  {antiSalesCtas.filter(c => c.channel === playgroundChannel || c.channel === 'Both' || c.channel === 'All').map(c => (
                    <option key={c.id} value={c.id}>
                      {c.label} ({c.psychologyAngle})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono font-medium text-zinc-500 uppercase block mb-1">
                  Custom Test Guidance (Optional)
                </label>
                <input
                  type="text"
                  value={testCustomPrompt}
                  onChange={(e) => setTestCustomPrompt(e.target.value)}
                  placeholder="e.g. 'Emphasize Titan BPO competitor leak' or 'Under 25 words'"
                  className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900"
                />
              </div>

              <div className="pt-2 border-t border-zinc-100">
                <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase block mb-1">
                  Active .csv Prospect Intelligence:
                </span>
                <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-700 space-y-1">
                  <div><strong>Lead:</strong> {testLead.name} ({testLead.title})</div>
                  <div><strong>Company:</strong> {testLead.company} • {testLead.headcount}</div>
                  <div><strong>Tech Stack:</strong> {testLead.techStack}</div>
                  <div><strong>Competitor:</strong> {testLead.outsourcer}</div>
                  <div><strong>Pain:</strong> {testLead.painPoint}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunTest}
                disabled={isTesting}
                className="w-full py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-200 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Querying Gemini 3.5 Flash...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Gemini Synthesis Test</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT: Test Output (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs space-y-3 min-h-[360px]">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
              <span className="text-xs font-bold text-zinc-900">
                Synthesis Output ({playgroundChannel})
              </span>
              {testResult && (
                <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                  <span>{testResult.wordCount} words</span>
                  <span>•</span>
                  <span>~{testResult.readingTimeSec}s {playgroundChannel === 'Phone' ? 'speak' : 'read'}</span>
                  <span>•</span>
                  <span className="text-zinc-700 font-semibold">{testResult.modelUsed}</span>
                </div>
              )}
            </div>

            {isTesting && (
              <div className="flex flex-col items-center justify-center py-16 text-zinc-500 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-900" />
                <span className="text-xs font-mono">Running prompt inference with Gemini...</span>
              </div>
            )}

            {!isTesting && !testResult && (
              <div className="flex flex-col items-center justify-center py-16 text-zinc-400 gap-1 text-center">
                <Play className="w-6 h-6 stroke-1" />
                <span className="text-xs">Click "Run Gemini Synthesis Test" to preview the live outbound message.</span>
              </div>
            )}

            {!isTesting && testResult && (
              <div className="space-y-3 animate-in fade-in">
                {testResult.subject && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-[10px] font-semibold text-zinc-500 uppercase">Subject:</span>
                    <span className="font-mono bg-zinc-100 text-zinc-900 px-2 py-0.5 rounded border border-zinc-200">
                      {testResult.subject}
                    </span>
                  </div>
                )}

                <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-800 whitespace-pre-wrap leading-relaxed">
                  {testResult.body}
                </div>

                {testResult.prospectInsight && (
                  <div className="p-2.5 rounded-lg bg-zinc-100/70 border border-zinc-200/60 text-[11px] text-zinc-700 flex items-start gap-1.5">
                    <span className="text-xs">💡</span>
                    <span><strong>Why this angle converts from .csv:</strong> {testResult.prospectInsight}</span>
                  </div>
                )}

                {testResult.alternativeHooks && testResult.alternativeHooks.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase">
                      Alternative Generated Hooks:
                    </span>
                    {testResult.alternativeHooks.map((h: string, idx: number) => (
                      <div key={idx} className="p-1.5 rounded bg-zinc-50 border border-zinc-200 text-[11px] font-mono text-zinc-600">
                        "{h}"
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingFramework && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white border border-zinc-200 rounded-2xl shadow-xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <h3 className="text-sm font-bold text-zinc-900">
                Edit Framework: {editingFramework.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingFramework(null)}
                className="text-zinc-400 hover:text-zinc-700 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono font-medium text-zinc-500 uppercase block mb-1">
                  Framework Name
                </label>
                <input
                  type="text"
                  value={editingFramework.name}
                  onChange={(e) => setEditingFramework({ ...editingFramework, name: e.target.value })}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-medium text-zinc-500 uppercase block mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={editingFramework.description}
                  onChange={(e) => setEditingFramework({ ...editingFramework, description: e.target.value })}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-medium text-zinc-500 uppercase block mb-1">
                  Gemini Prompt Instructions
                </label>
                <textarea
                  rows={6}
                  value={editingFramework.promptInstruction}
                  onChange={(e) => setEditingFramework({ ...editingFramework, promptInstruction: e.target.value })}
                  className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-xs font-mono text-zinc-800 leading-relaxed"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-medium text-zinc-500 uppercase block mb-1">
                  Anti-Sales Principle / Constraint
                </label>
                <input
                  type="text"
                  value={editingFramework.antiSalesPrinciple}
                  onChange={(e) => setEditingFramework({ ...editingFramework, antiSalesPrinciple: e.target.value })}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-medium text-zinc-500 uppercase block mb-1">
                  Example Snippet
                </label>
                <textarea
                  rows={3}
                  value={editingFramework.exampleSnippet}
                  onChange={(e) => setEditingFramework({ ...editingFramework, exampleSnippet: e.target.value })}
                  className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-xs font-mono text-zinc-800 leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => setEditingFramework(null)}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveFramework(editingFramework)}
                className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
