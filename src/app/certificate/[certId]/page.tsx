'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Award, 
  Printer, 
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
    repName: 'Emil Halili',
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
    <div className="min-h-screen bg-[#F2F0EF] text-[#222021] flex flex-col items-center py-10 px-4">
      {/* Top Controls Bar (hidden during print) */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-8 no-print">
        <Link
          href="/certification"
          className="px-4 py-2 rounded-xl bg-white border border-[#222021]/15 text-xs font-semibold text-[#222021] hover:bg-[#F2F0EF] transition-colors flex items-center gap-2 shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Certification Gate</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-[#ED1C24] hover:bg-[#d0181f] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            <span>PRINT / SAVE AS PDF</span>
          </button>
        </div>
      </div>

      {/* Official Certificate Canvas */}
      <div className="w-full max-w-4xl bg-white border-[10px] border-[#222021] rounded-3xl p-12 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[640px]">
        
        {/* Decorative Inner Border */}
        <div className="absolute inset-3 border-2 border-[#ED1C24]/30 rounded-2xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#ED1C24]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Certificate Header */}
        <div className="text-center relative z-10 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ED1C24]/10 border border-[#ED1C24]/20 text-[#ED1C24] text-[11px] font-bold tracking-widest uppercase mb-4">
            <Sparkles className="h-3 w-3 text-[#ED1C24]" />
            <span>APPOINTMENTLYY SALES ENABLEMENT LMS</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-wider text-[#222021] uppercase">
            CERTIFICATE OF SALES MASTERY
          </h1>
          <p className="text-xs uppercase tracking-widest text-[#6b6968] mt-2 font-semibold">
            This Official Credential is Proudly Awarded to
          </p>
        </div>

        {/* Candidate Name */}
        <div className="text-center my-6 relative z-10">
          <h2 className="text-4xl sm:text-5xl font-serif font-black text-[#222021] underline decoration-[#ED1C24] decoration-4 underline-offset-8">
            {certData.repName}
          </h2>
          <p className="text-sm text-[#6b6968] mt-6 max-w-2xl mx-auto leading-relaxed">
            For successfully demonstrating elite operational proficiency in the <strong>{certData.trackName}</strong> and passing the AI Boris multi-archetype stress trials with an audited score of <strong>{certData.score}%</strong>.
          </p>
        </div>

        {/* Certificate Metadata & Endorsement */}
        <div className="grid grid-cols-3 gap-6 my-6 pt-6 border-t border-[#222021]/10 relative z-10 text-center">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b6968] block">
              Campaign Track
            </span>
            <span className="text-xs font-bold text-[#222021] mt-0.5 block">
              {certData.campaignName}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b6968] block">
              Audited Passing Score
            </span>
            <span className="text-base font-black text-emerald-600 mt-0.5 block font-mono">
              {certData.score}% COMPOSITE
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b6968] block">
              Issue Date
            </span>
            <span className="text-xs font-bold text-[#222021] mt-0.5 block font-mono">
              {certData.issueDate}
            </span>
          </div>
        </div>

        {/* Signatures & Cryptographic Watermark */}
        <div className="pt-6 border-t border-[#222021]/10 grid grid-cols-3 items-end relative z-10">
          {/* Supervisor Signature */}
          <div className="text-left">
            <div className="font-serif italic text-base text-[#222021] pb-1 border-b border-[#222021]/20 inline-block pr-6">
              Emil Halili
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#6b6968] block mt-1">
              VP of Sales Enablement
            </span>
          </div>

          {/* Center Seal / Verification Badge */}
          <div className="flex flex-col items-center justify-center">
            <div className="h-16 w-16 rounded-full border-2 border-[#ED1C24] bg-[#ED1C24]/10 flex items-center justify-center text-[#ED1C24] shadow-sm mb-1">
              <ShieldCheck className="h-8 w-8 text-[#ED1C24]" />
            </div>
            <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-[#6b6968]">
              ID: {certData.certificateId}
            </span>
            <span className="text-[8px] font-mono text-[#6b6968]">
              HASH: {certData.verificationHash}
            </span>
          </div>

          {/* Director Signature */}
          <div className="text-right">
            <div className="font-serif italic text-base text-[#222021] pb-1 border-b border-[#222021]/20 inline-block pl-6">
              Marcus Vance
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#6b6968] block mt-1">
              Director of Operations
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CertificateViewPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#6b6968]">Rendering Certificate...</div>}>
      <CertificateContent />
    </Suspense>
  );
}
