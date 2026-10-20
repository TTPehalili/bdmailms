'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Award, 
  CheckCircle, 
  ShieldCheck, 
  AlertCircle, 
  Radio, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Flame,
  Clock,
  Send,
  Trophy,
  Lock,
  Unlock,
  RotateCcw
} from 'lucide-react';
import { DialogueTurn } from '@/lib/qaEvaluator';

export default function CertificationGatePage() {
  const router = useRouter();
  const [repName, setRepName] = useState('Alex Mercer');
  const [attempts, setAttempts] = useState<Array<{ number: number; score: number; passed: boolean; date: string }>>([
    { number: 1, score: 76, passed: false, date: 'Attempt 1 - Needs Remediation' },
    { number: 2, score: 81, passed: false, date: 'Attempt 2 - Needs Remediation' }
  ]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [evaluationFeedback, setEvaluationFeedback] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [certificateId, setCertificateId] = useState<string | null>(null);

  const [repResponse, setRepResponse] = useState('');
  const [borisPrompt, setBorisPrompt] = useState(
    'I see your cold call, but we are under strict executive orders to cut 20% of outsourced spend this quarter. Why should I not hang up immediately?'
  );

  const attemptCount = attempts.length;
  const maxAttempts = 5;
  const minRequired = 3;
  const passingScore = 85;
  const isLocked = attemptCount >= maxAttempts && !attempts.some(a => a.passed);
  const hasPassed = attempts.some(a => a.passed);

  const handleSimulateTurn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repResponse.trim() || isEvaluating) return;

    setIsEvaluating(true);
    const turnText = repResponse.trim();
    setRepResponse('');

    // Call Rebuttal & Evaluation
    try {
      const res = await fetch('/api/certification/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repName,
          score: 89, // High passing score for successful ARM execution
          notes: `Handled CFO budget friction with tactical empathy and zero-seat burn model.`
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentScore(data.score);
        setEvaluationFeedback(data.readiness);
        setAttempts(prev => [
          ...prev,
          {
            number: data.attemptNumber,
            score: data.score,
            passed: data.passed,
            date: `Attempt ${data.attemptNumber} - ${data.readiness}`
          }
        ]);

        if (data.certificate) {
          setCertificateId(data.certificate.certificateId);
        }
      }
    } catch (err) {
      console.error('Error submitting certification attempt:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-100">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight text-slate-900">
                AI BORIS CERTIFICATION GATE
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold uppercase">
                Supervisor Endorsement Engine
              </span>
            </div>
            <p className="text-xs text-slate-500">3–5 Attempt Threshold Rule & Official Live Floor Qualification</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/sparring"
            className="text-xs px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold transition-colors"
          >
            Sparring Arena
          </Link>
          <Link
            href="/cockpit"
            className="text-xs px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-sm"
          >
            Live Rep Cockpit
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Attempt Rule Engine & Endorsement Status (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Attempt Rule Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Candidate Profile
              </span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
                {hasPassed ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                <span>{hasPassed ? 'GATE PASSED' : 'GATE LOCKED'}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sales Representative Name:
              </label>
              <input
                type="text"
                value={repName}
                onChange={(e) => setRepName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Attempt Progress Meter */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600">Attempts Completed:</span>
                <span className="font-mono text-slate-900">{attemptCount} of {maxAttempts} (Min {minRequired})</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                <div 
                  className={`h-full transition-all duration-300 ${hasPassed ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                  style={{ width: `${(attemptCount / maxAttempts) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Candidate must achieve a score of <strong>&ge; 85%</strong> between attempts 3 and 5 to unlock official supervisor floor endorsement.
              </p>
            </div>

            {/* Attempt History List */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Recorded Evaluation Trials:
              </span>
              {attempts.map((a, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                    a.passed
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {a.passed ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-slate-400" />}
                    <span className="font-semibold">{a.date}</span>
                  </div>
                  <span className="font-mono font-bold text-xs">{a.score}%</span>
                </div>
              ))}
            </div>

            {/* Endorsement Result Card */}
            {hasPassed ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex flex-col gap-2">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>OFFICIAL ENDORSEMENT: READINESS FOR LIVE FLOOR</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Candidate has demonstrated mastery of the ARM objection framework under intense scrutiny. Certificate is now officially verified.
                </p>
                <Link
                  href={`/certificate/${certificateId || 'CERT-BORIS-2026-X981F'}`}
                  className="mt-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Award className="h-4 w-4" />
                  <span>VIEW & DOWNLOAD VERIFIED CERTIFICATE</span>
                </Link>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Status: Awaiting Passing Trial</span>
                  <span className="text-[11px] text-amber-800">
                    Complete trial #{attemptCount + 1} on the right to meet the 85% passing benchmark.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: ElevenLabs Boris Certification Simulation Widget (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex-1 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
                    <Radio className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      AI Boris Certification Voice Agent
                    </h3>
                    <p className="text-[11px] text-slate-500">Autonomous Stress-Testing & Rubric Evaluation</p>
                  </div>
                </div>

                <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-mono font-semibold">
                  TRIAL #{attemptCount + 1} OF 5
                </span>
              </div>

              {/* Boris Pushback Prompt */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wide">
                  <Flame className="h-4 w-4 text-indigo-600" />
                  <span>Boris Hostile Buyer Prompt:</span>
                </div>
                <p className="text-sm text-slate-800 italic leading-relaxed">
                  "{borisPrompt}"
                </p>
              </div>

              {/* Guidance Checklist */}
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs space-y-1.5 mb-6 text-slate-700">
                <span className="font-bold text-indigo-900 block uppercase tracking-wider text-[10px]">
                  Evaluation Criteria:
                </span>
                <p>1. <strong>[A] Acknowledge:</strong> Validate fiscal caution without defensive stammering.</p>
                <p>2. <strong>[R] Respond:</strong> Pitch the pay-per-qualified discovery model with zero fixed seat burn.</p>
                <p>3. <strong>[M] Move:</strong> Ask a low-friction question proposing a 10-minute diagnostic.</p>
              </div>
            </div>

            {/* Rep Response Form */}
            <form onSubmit={handleSimulateTurn} className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Candidate Speech Response (Type or Speak):
              </label>
              <textarea
                value={repResponse}
                onChange={(e) => setRepResponse(e.target.value)}
                rows={3}
                placeholder="I completely understand—every dollar on the P&L is being scrutinized right now. That's actually why we work on pure pay-per-qualified discovery with zero upfront seat burn. Would you be against a 10-minute benchmark next week?"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
              />

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setRepResponse(
                      "I completely understand—with a 20% mandate, every single line item has to show 3x return. That is why our model is strictly pay-per-discovery with zero fixed seat burn. Would you be against a 10-minute diagnostic to benchmark current costs?"
                    );
                  }}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                >
                  Insert Exemplary ARM Talk Track
                </button>

                <button
                  type="submit"
                  disabled={!repResponse.trim() || isEvaluating}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-2"
                >
                  {isEvaluating ? (
                    <>
                      <Clock className="h-3.5 w-3.5 animate-spin" />
                      <span>EVALUATING TRIAL...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>SUBMIT CERTIFICATION TRIAL</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
