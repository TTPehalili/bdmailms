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

  // Check if evaluation was stored in sessionStorage
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

  const gradeColor = 
    evaluation.overallGrade === 'A+' || evaluation.overallGrade === 'A' ? 'text-emerald-400 bg-emerald-950/80 border-emerald-700/80' :
    evaluation.overallGrade === 'B' ? 'text-blue-400 bg-blue-950/80 border-blue-700/80' :
    evaluation.overallGrade === 'C' ? 'text-amber-400 bg-amber-950/80 border-amber-700/80' :
    'text-red-400 bg-red-950/80 border-red-700/80';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/sparring"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                SPARRING PERFORMANCE SCORECARD
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                {sessionId}
              </span>
            </div>
            <p className="text-xs text-slate-400">Automated QA Rubric & Turn-by-Turn ARM Analysis</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/sparring"
            className="text-xs px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Try Another Persona</span>
          </Link>
          <Link
            href="/cockpit"
            className="text-xs px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold transition-all shadow-md shadow-red-900/20"
          >
            Return to Live Cockpit
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-8 flex flex-col gap-8">
        
        {/* Banner Score Card */}
        <div className="rounded-3xl p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-center gap-6">
            <div className={`h-24 w-24 rounded-3xl border-2 flex flex-col items-center justify-center font-black shadow-xl ${gradeColor}`}>
              <span className="text-4xl">{evaluation.overallGrade}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider mt-0.5">GRADE</span>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold mb-2">
                <Trophy className="h-3.5 w-3.5 text-amber-400" />
                <span>Overall Performance Score</span>
              </div>
              <h1 className="text-3xl font-black text-white">
                {evaluation.overallScore} / 100 Points
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                Rep successfully navigated friction without arguing, meeting BPO outbound certification standards.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/sparring"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-red-900/30 flex items-center gap-2"
            >
              <span>ADVANCE TO NEXT PERSONA</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* 3 Metrics Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* ARM Execution */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-purple-400" />
                ARM Execution
              </span>
              <span className="text-lg font-black text-purple-300 font-mono">
                {evaluation.armExecutionScore}%
              </span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${evaluation.armExecutionScore}%` }} />
            </div>
            <p className="text-xs text-slate-400 mt-3">
              Measures Acknowledge, Respond, and Move sequence fidelity under pushback.
            </p>
          </div>

          {/* Script Adherence */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-emerald-400" />
                Script Adherence
              </span>
              <span className="text-lg font-black text-emerald-300 font-mono">
                {evaluation.scriptAdherenceScore}%
              </span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${evaluation.scriptAdherenceScore}%` }} />
            </div>
            <p className="text-xs text-slate-400 mt-3">
              Adherence to company discovery criteria, disqualification, and positioning.
            </p>
          </div>

          {/* Talk-to-Listen Ratio */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Percent className="h-4 w-4 text-amber-400" />
                Talk / Listen Ratio
              </span>
              <span className="text-xs font-black text-amber-300 font-mono">
                {evaluation.talkToListenRatio.repPercent}% Rep / {evaluation.talkToListenRatio.prospectPercent}% Prospect
              </span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div className="h-full bg-amber-500" style={{ width: `${evaluation.talkToListenRatio.repPercent}%` }} />
              <div className="h-full bg-slate-700" style={{ width: `${evaluation.talkToListenRatio.prospectPercent}%` }} />
            </div>
            <p className="text-xs text-slate-400 mt-3">
              {evaluation.talkToListenRatio.isOptimal ? 'Optimal conversational balance (Target: 40-55% rep)' : 'Review conversational balance'}
            </p>
          </div>
        </div>

        {/* Chronological Dialogue Breakdown with Coaching Tags */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Layers className="h-4 w-4 text-red-500" />
                Chronological Dialogue Breakdown
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Turn-by-turn replay annotated with ARM badge detections and coaching critique.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {evaluation.annotatedTranscript.length} Turns
            </span>
          </div>

          <div className="space-y-4">
            {evaluation.annotatedTranscript.map((turn, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex flex-col gap-2.5 transition-all ${
                  turn.role === 'rep'
                    ? 'bg-slate-950 border-slate-800/90'
                    : 'bg-slate-900/40 border-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${
                      turn.role === 'rep' ? 'bg-slate-800 text-emerald-400' : 'bg-slate-800 text-red-400'
                    }`}>
                      {turn.role === 'rep' ? 'Sales Rep' : 'Buyer Persona'}
                    </span>
                    {turn.timestamp && (
                      <span className="text-[10px] text-slate-500">{turn.timestamp}</span>
                    )}
                  </div>

                  {turn.armTag && (
                    <span className={`text-[10px] px-2 py-0.5 rounded font-black border ${
                      turn.armTag === 'A' ? 'bg-purple-950 text-purple-300 border-purple-800' :
                      turn.armTag === 'R' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                      'bg-amber-950 text-amber-300 border-amber-800'
                    }`}>
                      [{turn.armTag}] {turn.armTag === 'A' ? 'Acknowledge' : turn.armTag === 'R' ? 'Respond' : 'Move'}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  "{turn.content}"
                </p>

                {turn.coachingFeedback && (
                  <div className="mt-1 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span>{turn.coachingFeedback}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Action Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Observed Strengths
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {evaluation.strengths.map((str, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Items */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Coaching Action Items
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {evaluation.coachingActionItems.map((act, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
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
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs font-mono">LOADING SCORECARD...</div>}>
      <ScorecardContent />
    </Suspense>
  );
}
