'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Trophy, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  ArrowRight, 
  Layers, 
  Clock, 
  Sparkles,
  BarChart3,
  TrendingUp,
  Percent
} from 'lucide-react';
import { QaEvaluationResult } from '@/lib/qaEvaluator';
import NavigationHeader from '@/components/NavigationHeader';

function ScorecardContent() {
  const params = useParams();
  const sessionId = (params?.sessionId as string) || 'session-fallback';

  const [evaluation, setEvaluation] = useState<QaEvaluationResult>({
    sessionId,
    overallScore: 89,
    overallGrade: 'A',
    armExecutionScore: 92,
    scriptAdherenceScore: 86,
    talkToListenRatio: {
      repPercent: 46,
      prospectPercent: 54,
      isOptimal: true
    },
    strengths: [
      'Executed instantaneous tactical empathy acknowledgment without conversational hesitation',
      'Reframed the vendor objection as an overflow partner instead of attacking the incumbent',
      'Closed with a crisp, low-friction 10-minute diagnostic question'
    ],
    weaknesses: [
      'Slight wordiness on the second turn value reframe (exceeded 18 seconds)',
      'Ensure prospect confirms current SLA cost bottleneck before proposing exact meeting slot'
    ],
    coachingActionItems: [
      'Re-drill the 3-second Rule: Pause after prospect objection to let tension dissipate',
      'Use the Diagnostic Micro-Commitment on all future cold calls'
    ],
    annotatedTranscript: [
      {
        role: 'prospect',
        content: 'We already have an agency partner handling this and we are completely satisfied.',
        timestamp: '00:03'
      },
      {
        role: 'rep',
        content: 'I completely understand—you have an established rhythm with them and they know your brand.',
        timestamp: '00:07',
        armTag: 'A',
        coachingFeedback: 'Excellent tactical empathy: disarms prospect defensive wall immediately.'
      },
      {
        role: 'rep',
        content: 'Most teams we work with kept their incumbent for tier-1 routine tasks while leveraging Boris to fix high-value conversion drop-offs.',
        timestamp: '00:15',
        armTag: 'R',
        coachingFeedback: 'Differentiator reframe: avoids direct competition with incumbent.'
      },
      {
        role: 'rep',
        content: 'Would you be against a 10-minute diagnostic to benchmark your current SLA costs against peers?',
        timestamp: '00:22',
        armTag: 'M',
        coachingFeedback: 'No-oriented closing question eliminates meeting commitment anxiety.'
      },
      {
        role: 'prospect',
        content: 'Alright, fair enough. If it is literally just 10 minutes to review the cost benchmark, put 10:30 AM on Thursday on my calendar.',
        timestamp: '00:27'
      }
    ]
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(`eval-${sessionId}`);
      if (stored) {
        try {
          setEvaluation(JSON.parse(stored));
        } catch {}
      }
    }
  }, [sessionId]);

  const gradeBadge = 
    evaluation.overallGrade === 'A+' || evaluation.overallGrade === 'A' ? 'text-emerald-700 bg-emerald-50 border-emerald-300' :
    evaluation.overallGrade === 'B' ? 'text-blue-700 bg-blue-50 border-blue-300' :
    evaluation.overallGrade === 'C' ? 'text-amber-700 bg-amber-50 border-amber-300' :
    'text-rose-700 bg-rose-50 border-rose-300';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Navbar */}
      <NavigationHeader />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 flex flex-col gap-6">
        
        {/* Banner Score Card */}
        <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className={`h-20 w-20 rounded-2xl border-2 flex flex-col items-center justify-center font-black shadow-xs shrink-0 ${gradeBadge}`}>
              <span className="text-3xl">{evaluation.overallGrade}</span>
              <span className="text-[9px] uppercase font-bold tracking-wider">GRADE</span>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold mb-1">
                <Trophy className="h-3 w-3 text-amber-500" />
                <span>Audited Performance Evaluation</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                {evaluation.overallScore} / 100 Points
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 max-w-md">
                Candidate demonstrated adherence to the ARM objection methodology under realistic buyer pushback.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/sparring"
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retry Session</span>
            </Link>
            <Link
              href="/sparring"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs flex items-center gap-2"
            >
              <span>NEXT PERSONA</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* 3 Metrics Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* ARM Execution */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                ARM Execution
              </span>
              <span className="text-base font-black text-indigo-700 font-mono">
                {evaluation.armExecutionScore}%
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${evaluation.armExecutionScore}%` }} />
            </div>
            <p className="text-[11px] text-slate-500 mt-2.5">
              Measures Acknowledge, Respond, and Move sequence fidelity under pushback.
            </p>
          </div>

          {/* Script Adherence */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5 text-emerald-600" />
                Script Adherence
              </span>
              <span className="text-base font-black text-emerald-700 font-mono">
                {evaluation.scriptAdherenceScore}%
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${evaluation.scriptAdherenceScore}%` }} />
            </div>
            <p className="text-[11px] text-slate-500 mt-2.5">
              Adherence to consultative value reframe and disqualification questions.
            </p>
          </div>

          {/* Talk-to-Listen Ratio */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Percent className="h-3.5 w-3.5 text-amber-600" />
                Talk / Listen Ratio
              </span>
              <span className="text-xs font-black text-slate-800 font-mono">
                {evaluation.talkToListenRatio.repPercent}% Rep / {evaluation.talkToListenRatio.prospectPercent}% Buyer
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div className="h-full bg-indigo-600" style={{ width: `${evaluation.talkToListenRatio.repPercent}%` }} />
              <div className="h-full bg-slate-300" style={{ width: `${evaluation.talkToListenRatio.prospectPercent}%` }} />
            </div>
            <p className="text-[11px] text-slate-500 mt-2.5">
              {evaluation.talkToListenRatio.isOptimal ? 'Optimal conversational balance (Target: 40-55% rep)' : 'Review conversational balance'}
            </p>
          </div>
        </div>

        {/* Turn-by-Turn Dialogue Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-indigo-600" />
                Turn-by-Turn Dialogue Rubric
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Transcript annotated with ARM detection badges and coaching feedback.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {evaluation.annotatedTranscript.length} Turns
            </span>
          </div>

          <div className="space-y-3">
            {evaluation.annotatedTranscript.map((turn, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex flex-col gap-2 ${
                  turn.role === 'rep'
                    ? 'bg-indigo-50/40 border-indigo-100'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${
                      turn.role === 'rep' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {turn.role === 'rep' ? 'Sales Rep' : 'Buyer Persona'}
                    </span>
                    {turn.timestamp && (
                      <span className="text-[10px] text-slate-400 font-mono">{turn.timestamp}</span>
                    )}
                  </div>

                  {turn.armTag && (
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                      turn.armTag === 'A' ? 'bg-amber-50 text-amber-900 border-amber-200' :
                      turn.armTag === 'R' ? 'bg-blue-50 text-blue-900 border-blue-200' :
                      'bg-emerald-50 text-emerald-900 border-emerald-200'
                    }`}>
                      [{turn.armTag}] {turn.armTag === 'A' ? 'Acknowledge' : turn.armTag === 'R' ? 'Respond' : 'Move'}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-800 leading-relaxed">
                  "{turn.content}"
                </p>

                {turn.coachingFeedback && (
                  <div className="mt-0.5 p-2 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-600 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                    <span>{turn.coachingFeedback}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Action Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Observed Strengths
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {evaluation.strengths.map((str, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              Coaching Action Items
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {evaluation.coachingActionItems.map((act, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ScorecardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-mono text-slate-500">LOADING SCORECARD...</div>}>
      <ScorecardContent />
    </Suspense>
  );
}
