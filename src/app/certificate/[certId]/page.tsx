'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Award, 
  Printer, 
  Download, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  QrCode,
  FileCheck
} from 'lucide-react';
import { CertificateMetadata } from '@/lib/certificateRenderer';

function CertificateContent() {
  const params = useParams();
  const certId = (params?.certId as string) || 'CERT-BORIS-2026-X981F';

  const [certData, setCertData] = useState<CertificateMetadata>({
    certificateId: certId,
    repName: 'Alex Mercer',
    campaignName: 'Enterprise Outbound BDR Mastery',
    trackName: 'ARM (Acknowledge, Respond, Move) Objection Interception Framework',
    score: 92,
    issueDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    verificationHash: '84F7A9C2',
    supervisorName: 'Emil H. (VP of Sales Enablement)',
    directorName: 'Marcus Vance (Director of Operations)',
    endorsementNotes: 'Candidate achieved mastery score exceeding 85% across 5 multi-archetype stress trials.'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col items-center py-10 px-4">
      {/* Top Controls Bar (hidden during print) */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-8 no-print">
        <Link
          href="/certification"
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Certification Gate</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            <span>PRINT / SAVE AS PDF</span>
          </button>
        </div>
      </div>

      {/* Official Certificate Canvas */}
      <div className="w-full max-w-4xl bg-white border-[10px] border-slate-900 rounded-3xl p-12 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[640px]">
        
        {/* Decorative Inner Border */}
        <div className="absolute inset-3 border-2 border-amber-600/40 rounded-2xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Certificate Header */}
        <div className="text-center relative z-10 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold tracking-widest uppercase mb-4">
            <Sparkles className="h-3 w-3 text-amber-600" />
            <span>APPOINTMENTLYY SALES ENABLEMENT LMS</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-wider text-slate-900 uppercase">
            CERTIFICATE OF SALES MASTERY
          </h1>
          <p className="text-xs uppercase tracking-widest text-slate-500 mt-2 font-semibold">
            This Official Credential is Proudly Awarded to
          </p>
        </div>

        {/* Candidate Name */}
        <div className="text-center my-6 relative z-10">
          <h2 className="text-4xl sm:text-5xl font-serif font-black text-indigo-950 underline decoration-amber-500 decoration-2 underline-offset-8">
            {certData.repName}
          </h2>
          <p className="text-sm text-slate-600 mt-6 max-w-2xl mx-auto leading-relaxed">
            For successfully demonstrating elite operational proficiency in the <strong>{certData.trackName}</strong> and passing the AI Boris multi-archetype stress trials with an audited score of <strong>{certData.score}%</strong>.
          </p>
        </div>

        {/* Certificate Metadata & Endorsement */}
        <div className="grid grid-cols-3 gap-6 my-6 pt-6 border-t border-slate-200 relative z-10 text-center">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Campaign Track
            </span>
            <span className="text-xs font-bold text-slate-800 mt-0.5 block">
              {certData.campaignName}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Passing Audited Score
            </span>
            <span className="text-xs font-black text-emerald-600 font-mono mt-0.5 block">
              {certData.score}% (Grade A Certified)
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Date of Conferral
            </span>
            <span className="text-xs font-bold text-slate-800 mt-0.5 block">
              {certData.issueDate}
            </span>
          </div>
        </div>

        {/* Signatures & Official Gold Seal */}
        <div className="pt-8 border-t border-slate-200 flex items-end justify-between relative z-10">
          
          {/* Supervisor Signature */}
          <div className="text-center w-52">
            <div className="font-serif italic text-lg text-slate-800 pb-1 border-b border-slate-400">
              Emil H.
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1 block">
              {certData.supervisorName}
            </span>
          </div>

          {/* Official Gold Seal Badge */}
          <div className="flex flex-col items-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-1 shadow-lg shadow-amber-500/30 flex items-center justify-center border-4 border-white">
              <div className="h-full w-full rounded-full border border-dashed border-amber-900/40 flex flex-col items-center justify-center text-center">
                <Award className="h-6 w-6 text-amber-950" />
                <span className="text-[8px] font-black uppercase text-amber-950 tracking-tighter leading-none mt-0.5">
                  OFFICIAL
                </span>
                <span className="text-[7px] font-bold uppercase text-amber-950 tracking-tighter leading-none">
                  SEAL 2026
                </span>
              </div>
            </div>
          </div>

          {/* Operations Director Signature */}
          <div className="text-center w-52">
            <div className="font-serif italic text-lg text-slate-800 pb-1 border-b border-slate-400">
              Marcus Vance
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1 block">
              {certData.directorName}
            </span>
          </div>
        </div>

        {/* Verification Footer */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>CERTIFICATE ID: {certData.certificateId}</span>
          <span>SECURITY VERIFICATION HASH: {certData.verificationHash}</span>
        </div>
      </div>
    </div>
  );
}

export default function CertificateViewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-100 flex items-center justify-center text-xs font-mono text-slate-500">LOADING OFFICIAL CREDENTIAL...</div>}>
      <CertificateContent />
    </Suspense>
  );
}
