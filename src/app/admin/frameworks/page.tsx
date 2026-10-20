'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  ArrowLeft, 
  ShieldCheck, 
  Database,
  RefreshCw,
  Plus,
  AlertCircle
} from 'lucide-react';
import { ExtractedArmEntry } from '@/lib/parsers/armExtractor';

export default function AdminFrameworksPage() {
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                FRAMEWORK INGESTION PIPELINE
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-800/50 font-bold uppercase">
                Admin Console
              </span>
            </div>
            <p className="text-xs text-slate-400">Multi-format Document Ingestion & 1536-dim Vector Embeddings</p>
          </div>
        </div>

        <Link
          href="/cockpit"
          className="text-xs px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold transition-colors"
        >
          View Live Cockpit &rarr;
        </Link>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Upload Form (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <form onSubmit={handleUpload} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <UploadCloud className="h-4 w-4 text-red-500" />
                Upload Framework Playbook
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Upload sales training docs (.pdf, .docx, .md) to automatically parse into structured [A], [R], [M] entries.
              </p>
            </div>

            {/* Campaign Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Target Campaign
              </label>
              <select
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-red-500/60"
              >
                <option value="enterprise-outbound">Enterprise Outbound Q4</option>
                <option value="b2b-saas-smb">Mid-Market SaaS Prospecting</option>
                <option value="fintech-inbound">Fintech High-Velocity Inbound</option>
              </select>
            </div>

            {/* Drag and Drop File Input */}
            <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-950/50 relative">
              <input
                type="file"
                accept=".pdf,.docx,.md,.txt"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <FileText className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              {file ? (
                <div>
                  <p className="text-xs font-bold text-emerald-400">{file.name}</p>
                  <p className="text-[11px] text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-slate-300">Click or drag & drop playbook</p>
                  <p className="text-[11px] text-slate-500 mt-1">PDF, DOCX, Markdown, or TXT</p>
                </div>
              )}
            </div>

            {/* Direct Paste Fallback */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Or Paste Raw Framework Text
              </label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={4}
                placeholder="Paste objection talk tracks, script playbooks, or rebuttals here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-500/60 font-mono"
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>PARSING & VECTORIZING...</span>
                </>
              ) : (
                <>
                  <Database className="h-4 w-4" />
                  <span>INGEST & VECTORIZE PLAYBOOK</span>
                </>
              )}
            </button>
          </form>

          {/* Architecture Card */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 text-xs text-slate-400 space-y-2.5">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Automatic Pipeline Tasks
            </h4>
            <p>1. Extracts clean text stream from document binary (strips XML/PDF formatting).</p>
            <p>2. Restructures playbooks into strict ARM: Acknowledge, Respond, and Move.</p>
            <p>3. Generates 1536-dimensional vector embeddings and writes to Supabase <code className="text-slate-300 font-mono">public.rebuttal_entries</code>.</p>
          </div>
        </div>

        {/* Right Column: Ingested Entries Live Table (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Database className="h-4 w-4 text-amber-400" />
                  Indexed ARM Entries
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {uploadResult ? `${uploadResult.extractedCount} newly indexed entries from ${uploadResult.fileName}` : 'Ready for document ingestion'}
                </p>
              </div>

              {uploadResult && (
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-semibold font-mono">
                  1536-DIM VECTOR SYNCED
                </span>
              )}
            </div>

            {uploadResult && uploadResult.entries.length > 0 ? (
              <div className="space-y-4 overflow-y-auto max-h-[620px] pr-2">
                {uploadResult.entries.map((entry, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 flex flex-col gap-3 shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-red-400 px-2 py-0.5 rounded bg-red-950/60 border border-red-800/50">
                        {entry.objection_category}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Trigger: "{entry.objection_trigger}"
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 font-black text-[10px] shrink-0 border border-purple-800/60">
                          [A]
                        </span>
                        <p className="text-slate-300 italic">"{entry.arm_acknowledge}"</p>
                      </div>

                      <div className="flex gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-black text-[10px] shrink-0 border border-emerald-800/60">
                          [R]
                        </span>
                        <p className="text-slate-300 font-medium">"{entry.arm_respond}"</p>
                      </div>

                      <div className="flex gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 font-black text-[10px] shrink-0 border border-amber-800/60">
                          [M]
                        </span>
                        <p className="text-slate-300 font-medium">"{entry.arm_move}"</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center text-slate-500">
                <FileText className="h-10 w-10 text-slate-700 mb-3" />
                <p className="text-sm font-semibold text-slate-400">No document processed yet in this session</p>
                <p className="text-xs text-slate-600 mt-1 max-w-sm">
                  Upload a BPO training playbook on the left to extract ARM entries and calculate vector similarity embeddings.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
