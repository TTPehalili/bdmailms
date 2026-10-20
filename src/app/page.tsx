import Link from 'next/link';
import { Radio, ArrowRight, Mic, ShieldAlert, Sparkles, Brain, Cpu, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-red-500/30">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-500/20 border border-red-500/30">
            <Radio className="h-5 w-5 text-white" />
          </div>
          <span className="font-black text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            APPOINTMENTLYY SDR
          </span>
        </div>
        <Link
          href="/cockpit"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs tracking-wide transition-all shadow-lg shadow-red-900/30 flex items-center gap-2"
        >
          <span>ENTER COCKPIT</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/70 border border-red-800/60 text-red-400 text-xs font-semibold mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Boris Real-time Enablement Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight">
          Sub-Second Audio Interception & <span className="bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 bg-clip-text text-transparent">ARM Rebuttal HUD</span> for BPO SDRs
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          High-performance 16kHz Web Audio streamer paired with ElevenLabs Scribe v2 and Supabase vector search to arm outbound callers with instantaneous objection handling.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/cockpit"
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-sm tracking-wider uppercase transition-all shadow-xl shadow-red-900/40 flex items-center gap-3 border border-red-500/30 ring-4 ring-red-500/10"
          >
            <Mic className="h-5 w-5" />
            <span>Launch Live Rep Cockpit</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
            <div className="h-10 w-10 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400 mb-4">
              <span className="font-black text-base">[A]</span>
            </div>
            <h3 className="font-bold text-slate-200 text-base mb-1">Acknowledge</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Immediate tactical empathy validation so the prospect drops psychological defensiveness.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
            <div className="h-10 w-10 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 mb-4">
              <span className="font-black text-base">[R]</span>
            </div>
            <h3 className="font-bold text-slate-200 text-base mb-1">Respond</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pivots the friction into an asymmetric advantage without arguing or sounding robotic.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
            <div className="h-10 w-10 rounded-xl bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400 mb-4">
              <span className="font-black text-base">[M]</span>
            </div>
            <h3 className="font-bold text-slate-200 text-base mb-1">Move</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Closes with a low-friction micro-commitment diagnostic question that schedules the discovery call.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
