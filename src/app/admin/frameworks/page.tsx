'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  ShieldCheck, 
  Database,
  RefreshCw,
  Plus,
  AlertCircle,
  PhoneCall,
  Mail
} from 'lucide-react';
import { ExtractedArmEntry } from '@/lib/parsers/armExtractor';
import AdminNavigationHeader from '@/components/AdminNavigationHeader';
import OutboundFrameworkManager from '@/components/admin/OutboundFrameworkManager';

export default function AdminFrameworksPage() {
  const [activeView, setActiveView] = useState<'frameworks' | 'uploader'>('frameworks');
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [campaign, setCampaign] = useState('enterprise-outbound');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    extractedCount: number;
    entries: ExtractedArmEntry[];
    fileName: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMsg(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !rawText.trim()) {
      setErrorMsg('Please select a file or paste text content to parse.');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      if (rawText.trim()) {
        formData.append('text', rawText.trim());
      }
      formData.append('campaignId', campaign);

      const res = await fetch('/api/frameworks/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUploadResult({
          success: true,
          extractedCount: data.extractedCount,
          entries: data.entries || [],
          fileName: data.fileName || file?.name || 'Manual Input'
        });
        setFile(null);
        setRawText('');
      } else {
        setErrorMsg(data.error || 'Failed to parse and vectorize document.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans">
      <AdminNavigationHeader activeSection="playbooks" />

      {/* SUB-HEADER / VIEW SELECTOR */}
      <div className="bg-white border-b border-zinc-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg text-xs font-medium border border-zinc-200/60 w-fit">
            <button
              type="button"
              onClick={() => setActiveView('frameworks')}
              className={`px-3.5 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'frameworks'
                  ? 'bg-white text-zinc-950 font-bold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Outbound Guru Frameworks Studio</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('uploader')}
              className={`px-3.5 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'uploader'
                  ? 'bg-white text-zinc-950 font-bold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Playbook Document Ingestion</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <span>Floor Model:</span>
            <span className="font-semibold text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
              Gemini 3.5 Flash
            </span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeView === 'frameworks' ? (
          <OutboundFrameworkManager />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Upload Form (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <form onSubmit={handleUpload} className="bg-white border border-zinc-200 rounded-xl p-5 shadow-2xs flex flex-col gap-4">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                    <UploadCloud className="h-4 w-4 text-zinc-700" />
                    Upload Framework Playbook
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                    Upload sales training docs (.pdf, .docx, .md) to automatically parse into structured [A], [R], [M] entries.
                  </p>
                </div>

                {/* Campaign Select */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1 uppercase tracking-wider">
                    Target Campaign
                  </label>
                  <select
                    value={campaign}
                    onChange={(e) => setCampaign(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900/10 focus:border-zinc-400"
                  >
                    <option value="enterprise-outbound">Enterprise Outbound BDM</option>
                    <option value="bpo-accelerator">BPO Client Acquisition</option>
                    <option value="saas-discovery">SaaS Inbound SDR</option>
                  </select>
                </div>

                {/* File Drop Area */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1 uppercase tracking-wider">
                    Document File
                  </label>
                  <label className="border border-dashed border-zinc-300 hover:border-zinc-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-zinc-50/50">
                    <FileText className="h-8 w-8 text-zinc-400 mb-2" />
                    <span className="text-xs font-bold text-zinc-800">
                      {file ? file.name : 'Choose a file or drag & drop'}
                    </span>
                    <span className="text-[10px] text-zinc-500 mt-1">
                      PDF, DOCX, TXT, or MD up to 10MB
                    </span>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.docx,.txt,.md"
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Text Fallback */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1 uppercase tracking-wider">
                    Or Paste Text Directly
                  </label>
                  <textarea
                    rows={4}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Paste script rules, rebuttal notes, or raw objection training material here..."
                    className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-900 font-mono focus:outline-none focus:ring-1 focus:ring-zinc-900/10 focus:border-zinc-400"
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full py-2.5 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-200 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Parsing & Vectorizing with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Parse Document with Gemini</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Column: Output Entries (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-xl p-5 shadow-2xs flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                    <Database className="h-4 w-4 text-zinc-700" />
                    Indexed ARM Entries
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {uploadResult ? `${uploadResult.extractedCount} newly indexed entries from ${uploadResult.fileName}` : 'Ready for document ingestion'}
                  </p>
                </div>

                {uploadResult && (
                  <span className="text-[10px] px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold font-mono">
                    VECTOR SYNCED
                  </span>
                )}
              </div>

              {uploadResult && uploadResult.entries.length > 0 ? (
                <div className="space-y-3 overflow-y-auto max-h-[620px] pr-1">
                  {uploadResult.entries.map((entry, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 flex flex-col gap-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-900 px-2 py-0.5 rounded bg-zinc-200 border border-zinc-300">
                          {entry.objection_category}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          Trigger: "{entry.objection_trigger}"
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex gap-2">
                          <span className="px-1.5 py-0.2 rounded bg-zinc-200 text-zinc-800 font-black text-[10px] shrink-0 border border-zinc-300">
                            [A]
                          </span>
                          <p className="text-zinc-700 italic">"{entry.arm_acknowledge}"</p>
                        </div>

                        <div className="flex gap-2">
                          <span className="px-1.5 py-0.2 rounded bg-zinc-200 text-zinc-800 font-black text-[10px] shrink-0 border border-zinc-300">
                            [R]
                          </span>
                          <p className="text-zinc-800 font-medium">"{entry.arm_respond}"</p>
                        </div>

                        <div className="flex gap-2">
                          <span className="px-1.5 py-0.2 rounded bg-zinc-200 text-zinc-800 font-black text-[10px] shrink-0 border border-zinc-300">
                            [M]
                          </span>
                          <p className="text-zinc-800 font-medium">"{entry.arm_move}"</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center text-zinc-400">
                  <FileText className="h-8 w-8 text-zinc-300 mb-2" />
                  <p className="text-xs font-semibold text-zinc-700">No document processed yet in this session</p>
                  <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                    Upload a training playbook on the left to extract ARM entries.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
