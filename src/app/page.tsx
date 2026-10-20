import Link from 'next/link';
import { 
  Radio, 
  ArrowRight, 
  Mic, 
  Sparkles, 
  Users, 
  Database, 
  Trophy, 
  ShieldCheck, 
  Flame, 
  Cpu 
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-red-500/30">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-500/20 border border-red-500/30">
            <Radio className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-black text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              APPOINTMENTLYY SDR
            </span>
            <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-800/50 font-bold uppercase">
              Phase 1 & 2 Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/admin/frameworks"
            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Admin Playbooks
          </Link>
          <Link
            href="/sparring"
            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Sparring Arena
          </Link>
          <Link
            href="/cockpit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs tracking-wide transition-all shadow-lg shadow-red-900/30 flex items-center gap-2"
          >
            <span>LIVE COCKPIT</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/70 border border-red-800/60 text-red-400 text-xs font-semibold mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Boris Enterprise Sales Enablement Suite</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight">
          Sub-Second Audio Interception, <span className="bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 bg-clip-text text-transparent">ARM HUD</span> & Voice Sparring LMS
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-3xl leading-relaxed">
          High-velocity sales enablement for BPO outbound teams. Stream live 16kHz calls to intercept buyer objections in real time, train against 10 AI buyer personas, and ingest company playbooks into 1536-dimensional vector databases.
        </p>

        {/* 3 Main Action Modules */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          
          {/* Phase 1: Live Cockpit */}
          <Link
            href="/cockpit"
            className="group rounded-3xl p-6 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-red-500/50 transition-all duration-300 shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="h-12 w-12 rounded-2xl bg-red-950/80 border border-red-800/60 flex items-center justify-center text-red-400 mb-5 group-hover:scale-105 transition-transform">
                <Mic className="h-6 w-6" />
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold uppercase tracking-wider font-mono">
                Phase 1 Live
              </span>
              <h2 className="text-xl font-bold text-white mt-2 mb-2 group-hover:text-red-400 transition-colors">
                Rep Audio Cockpit
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Live 16kHz microphone stream with ElevenLabs Scribe v2 and instant Acknowledge-Respond-Move objection cards.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-red-400">
              <span>Launch Audio Cockpit</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Phase 2: Sparring Arena */}
          <Link
            href="/sparring"
            className="group rounded-3xl p-6 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all duration-300 shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="h-12 w-12 rounded-2xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-105 transition-transform">
                <Users className="h-6 w-6" />
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold uppercase tracking-wider font-mono">
                Phase 2 Live
              </span>
              <h2 className="text-xl font-bold text-white mt-2 mb-2 group-hover:text-purple-400 transition-colors">
                10 AI Sparring Personas
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Voice sparring arena against realistic personas (Rushed VP, Frugal CFO, Aggressive Skeptic) with automated QA grading.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-purple-400">
              <span>Enter Sparring Arena</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Phase 2: Ingestion & Vector Pipeline */}
          <Link
            href="/admin/frameworks"
            className="group rounded-3xl p-6 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all duration-300 shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-105 transition-transform">
                <Database className="h-6 w-6" />
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold uppercase tracking-wider font-mono">
                Phase 2 Live
              </span>
              <h2 className="text-xl font-bold text-white mt-2 mb-2 group-hover:text-emerald-400 transition-colors">
                Framework Ingestion
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload .pdf, .docx, and .md playbooks to extract structured ARM talk tracks and write 1536-dim vector embeddings to Supabase.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>Admin Playbook Upload</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
