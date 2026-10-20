import Link from 'next/link';
import { 
  Radio, 
  ArrowRight, 
  Mic, 
  Sparkles, 
  Users, 
  Database, 
  Award, 
  ShieldCheck, 
  Flame, 
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-100">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-50 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm text-white">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <span className="font-black text-xl tracking-tight text-slate-900">
              APPOINTMENTLYY SDR
            </span>
            <span className="ml-2 text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold uppercase font-mono">
              Phases 1–3 Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-5 text-xs font-semibold">
          <Link
            href="/sparring"
            className="text-slate-600 hover:text-indigo-600 transition-colors"
          >
            Sparring Arena
          </Link>
          <Link
            href="/certification"
            className="text-slate-600 hover:text-indigo-600 transition-colors"
          >
            Certification Gate
          </Link>
          <Link
            href="/admin"
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
            <span>Admin Portal</span>
          </Link>
          <Link
            href="/cockpit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold tracking-wide transition-all shadow-sm flex items-center gap-2"
          >
            <span>LIVE COCKPIT</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Boris Enterprise BPO Sales Enablement & Certification Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl text-slate-900 leading-tight">
          Sub-Second Audio Interception, <span className="text-indigo-600">ARM HUD</span> & Official Rep Certification LMS
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed">
          High-velocity outbound sales intelligence. Stream live 16kHz calls to intercept buyer friction, train across 10 voice sparring archetypes, auto-generate multi-channel cadences from CSVs, and enforce automated floor readiness certification.
        </p>

        {/* 4 Main Action Modules Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full text-left">
          
          {/* Module 1: Live Cockpit */}
          <Link
            href="/cockpit"
            className="group rounded-2xl p-6 bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-500/50 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="h-12 w-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mb-4 group-hover:scale-105 transition-transform">
                <Mic className="h-6 w-6" />
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold uppercase font-mono">
                Phase 1 Core
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-2 mb-1 group-hover:text-indigo-600 transition-colors">
                Rep Audio Cockpit
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                16kHz Web Audio stream with Scribe v2 STT and instant ARM objection cards.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
              <span>Launch Audio Cockpit</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Module 2: Sparring Arena */}
          <Link
            href="/sparring"
            className="group rounded-2xl p-6 bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-500/50 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="h-12 w-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 mb-4 group-hover:scale-105 transition-transform">
                <Users className="h-6 w-6" />
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold uppercase font-mono">
                Phase 2 Core
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-2 mb-1 group-hover:text-indigo-600 transition-colors">
                10 AI Sparring Personas
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Voice sparring arena with automated QA grading and turn-by-turn rubrics.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
              <span>Enter Arena</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Module 3: Certification Gate */}
          <Link
            href="/certification"
            className="group rounded-2xl p-6 bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-500/50 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="h-12 w-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 group-hover:scale-105 transition-transform">
                <Award className="h-6 w-6" />
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold uppercase font-mono">
                Phase 3 Gate
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-2 mb-1 group-hover:text-indigo-600 transition-colors">
                AI Certification Gate
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                3–5 attempt rule threshold, supervisor endorsement, and verified digital certificates.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
              <span>Take Certification</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Module 4: Supervisor & Admin Portal */}
          <Link
            href="/admin"
            className="group rounded-2xl p-6 bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-500/50 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white mb-4 group-hover:scale-105 transition-transform">
                <ShieldCheck className="h-6 w-6 text-indigo-400" />
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold uppercase font-mono">
                Supervisor Portal
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-2 mb-1 group-hover:text-indigo-600 transition-colors">
                Enablement & Admin
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Vector playbook ingestion, lead CSV enrichment, and rep certification auditing.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
              <span>Open Supervisor Hub</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
