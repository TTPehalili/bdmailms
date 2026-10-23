'use client';

import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Globe, 
  Zap, 
  Sparkles,
  Info
} from 'lucide-react';
import LinkedinIcon from '@/components/icons/LinkedinIcon';
import { CadenceLeadRecord } from '@/lib/cadenceMaster';

interface UploadLeadsCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadsImported: (leads: CadenceLeadRecord[]) => void;
}

export default function UploadLeadsCsvModal({
  isOpen,
  onClose,
  onLeadsImported
}: UploadLeadsCsvModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const parseCsvText = (text: string): Record<string, string>[] => {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) throw new Error('CSV must contain a header row and at least one lead row.');

    // Parse header
    const headers = parseCsvRow(lines[0]).map(h => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'));

    const records: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvRow(lines[i]);
      if (values.length === 0 || values.every(v => !v.trim())) continue;
      const row: Record<string, string> = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx]?.trim() || '';
      });
      records.push(row);
    }
    return records;
  };

  const parseCsvRow = (rowStr: string): string[] => {
    const result: string[] = [];
    let insideQuotes = false;
    let current = '';

    for (let i = 0; i < rowStr.length; i++) {
      const char = rowStr[i];
      if (char === '"' || char === "'") {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setErrorMsg('Please upload a valid .csv file.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const text = await file.text();
      const rows = parseCsvText(text);

      if (rows.length === 0) {
        throw new Error('No valid prospect rows found in the CSV file.');
      }

      // Convert rows to CadenceLeadRecord
      const mappedLeads: CadenceLeadRecord[] = rows.map((r, idx) => {
        const findField = (...keys: string[]) => {
          for (const k of keys) {
            const foundKey = Object.keys(r).find(col => col.includes(k));
            if (foundKey && r[foundKey]) return r[foundKey];
          }
          return '';
        };

        const firstName = findField('first_name', 'first', 'given_name') || 'Prospect';
        const lastName = findField('last_name', 'last', 'surname') || '';
        const fullName = `${firstName} ${lastName}`.trim();
        const company = findField('company', 'account', 'organization', 'business') || 'Target Account';
        const title = findField('title', 'job_title', 'role', 'position') || 'Executive';
        const phone = findField('phone', 'direct_phone', 'mobile', 'cell', 'telephone') || '+1 (555) 000-0000';
        const email = findField('email', 'work_email', 'contact_email') || `${firstName.toLowerCase()}@${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
        const headcount = findField('headcount', 'seats', 'size', 'team_size', 'employees') || '50-100 seats';
        const department = findField('department', 'division') || 'Outbound Sales & Operations';

        // Critical High-Value Signal Columns
        const website = findField('website', 'url', 'domain', 'web', 'company_url') || '';
        const linkedinUrl = findField('linkedin', 'linkedin_url', 'profile', 'li_url') || '';
        const techStack = findField('tech_stack', 'tech', 'stack', 'crm', 'dialer', 'software') || 'Apollo & HubSpot';
        const painPoint = findField('pain_point', 'pain', 'challenge', 'bottleneck', 'problem') || 'objection hesitation on shared lead lists';
        const outsourcer = findField('outsourcer', 'vendor', 'current_agency', 'incumbent', 'agency') || 'Titan BPO Solutions';
        
        const rawSignals = findField('buying_signals', 'signals', 'signal', 'notes', 'triggers') || '';
        const buyingSignals = rawSignals 
          ? rawSignals.split(';').map(s => s.trim()).filter(Boolean)
          : [
              `Target Domain: ${website || company}`,
              `Tech Stack: ${techStack}`,
              `Primary Bottleneck: ${painPoint}`
            ];

        return {
          id: `lead_csv_${Date.now()}_${idx}`,
          name: fullName,
          company,
          title,
          department,
          email,
          phone,
          headcount,
          website: website.startsWith('http') ? website : website ? `https://${website}` : undefined,
          linkedinUrl: linkedinUrl.startsWith('http') ? linkedinUrl : linkedinUrl ? `https://${linkedinUrl}` : undefined,
          techStack,
          painPoint,
          outsourcer,
          buyingSignals,
          customVariables: {
            ...r,
            Website: website,
            'LinkedIn Profile': linkedinUrl,
            'Tech Stack': techStack,
            'Pain Point': painPoint,
            'Incumbent Vendor': outsourcer
          },
          cadenceDay: 2,
          touchNumber: 3,
          isCarryOver: false,
          statusBadge: 'CSV Import • Day 2 Phone Push'
        };
      });

      // Also persist to Supabase backend in the background
      fetch('/api/leads/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leads: mappedLeads,
          campaignId: 'enterprise-outbound'
        })
      }).catch(err => console.warn('[CSV Modal] Supabase background sync notice:', err));

      setSuccessCount(mappedLeads.length);
      setTimeout(() => {
        onLeadsImported(mappedLeads);
        onClose();
      }, 1200);

    } catch (err: any) {
      console.error('[CSV PARSE ERROR]', err);
      setErrorMsg(err.message || 'Failed to parse CSV file. Please verify column formatting.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#222021]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#222021]/15 overflow-hidden text-[#222021]"
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-6 py-4 bg-[#222021] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-[#ED1C24] text-white">
              <Upload className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-black tracking-tight text-white">
                Upload Leads CSV & Inject Context
              </h2>
              <p className="text-xs text-white/60">
                Instantly injects Website, LinkedIn, & Signals into all AI Boris teleprompter scripts.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-4">
          
          {/* DRAG & DROP ZONE */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) processFile(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              isDragging 
                ? 'border-[#ED1C24] bg-red-50/50' 
                : 'border-[#222021]/20 hover:border-[#ED1C24] bg-[#F2F0EF]/40 hover:bg-[#F2F0EF]'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) processFile(file);
              }}
            />

            {isProcessing ? (
              <div className="flex flex-col items-center justify-center space-y-2 py-4">
                <Loader2 className="h-8 w-8 text-[#ED1C24] animate-spin" />
                <span className="text-xs font-bold text-[#222021]">Parsing CSV & Injecting Signal Variables...</span>
              </div>
            ) : successCount !== null ? (
              <div className="flex flex-col items-center justify-center space-y-2 py-4 text-emerald-600">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-800">
                  Successfully imported {successCount} leads into Boris Queue!
                </span>
                <span className="text-xs text-stone-500">Loading teleprompter...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-[#222021]/10 flex items-center justify-center text-[#ED1C24]">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-sm font-bold text-[#222021] block">
                    Drop your .csv file here, or <span className="text-[#ED1C24] underline">browse files</span>
                  </span>
                  <span className="text-xs text-[#6b6968] block mt-1">
                    Supports columns: Website, LinkedIn Profile, Buying Signals, Tech Stack, Pain Points
                  </span>
                </div>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SUPPORTED SIGNALS BREAKDOWN */}
          <div className="bg-stone-50 rounded-xl p-4 border border-[#222021]/10 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#222021]">
              <Sparkles className="h-3.5 w-3.5 text-[#ED1C24]" />
              <span>Context Variables Automatically Injected:</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#4a4847]">
              <div className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span><strong className="text-[#222021]">website</strong>: Injected in pitch & links</span>
              </div>
              <div className="flex items-center gap-1.5">
                <LinkedinIcon className="h-3.5 w-3.5 text-sky-700 shrink-0" />
                <span><strong className="text-[#222021]">linkedin_url</strong>: 1-click rep connection</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span><strong className="text-[#222021]">buying_signals</strong>: Live HUD badges</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                <span><strong className="text-[#222021]">tech_stack / pain</strong>: In battlecards</span>
              </div>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 bg-[#F2F0EF] border-t border-[#222021]/10 flex items-center justify-between text-xs text-[#6b6968]">
          <span>Syncs with Supabase table <code>leads</code></span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-[#222021]/15 text-[#222021] font-bold hover:bg-stone-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
