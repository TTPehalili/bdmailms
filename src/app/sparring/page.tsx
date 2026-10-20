'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  ArrowRight, 
  ShieldAlert, 
  Flame, 
  Radio, 
  CheckCircle, 
  Sparkles, 
  SlidersHorizontal,
  ArrowLeft,
  Building,
  Target
} from 'lucide-react';
import { SPARRING_PERSONAS, SparringPersona } from '@/lib/personas';
import NavigationHeader from '@/components/NavigationHeader';

export default function SparringLobbyPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const filteredPersonas = selectedDifficulty === 'all' 
    ? SPARRING_PERSONAS 
    : SPARRING_PERSONAS.filter(p => p.difficulty.toLowerCase() === selectedDifficulty.toLowerCase());

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Shared Navigation Bar */}
      <NavigationHeader />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">
        
        {/* Executive Banner */}
        <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold tracking-wide uppercase mb-2">
              <Sparkles className="h-3 w-3" />
              <span>Voice Simulation LMS</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              AI Sparring Arena — 10 Buyer Personas
            </h1>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Dial in to simulate high-friction outbound calls. Handle realistic buyer pushback using the ARM (Acknowledge, Respond, Move) methodology, and receive automated post-call rubric grading.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/cockpit"
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <Radio className="h-3.5 w-3.5 text-indigo-600" />
              <span>Live Outbound Cockpit</span>
            </Link>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center justify-between gap-4 flex-wrap bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-xs">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Filter By Difficulty:
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {['all', 'beginner', 'intermediate', 'advanced', 'nightmare'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedDifficulty(lvl)}
                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  selectedDifficulty === lvl
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* 10 Personas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPersonas.map((persona) => {
            const difficultyBadge = 
              persona.difficulty === 'Nightmare' ? 'bg-rose-50 text-rose-700 border-rose-200' :
              persona.difficulty === 'Advanced' ? 'bg-amber-50 text-amber-700 border-amber-200' :
              persona.difficulty === 'Intermediate' ? 'bg-blue-50 text-blue-700 border-blue-200' :
              'bg-emerald-50 text-emerald-700 border-emerald-200';

            return (
              <div
                key={persona.id}
                className="group rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 p-5 flex flex-col justify-between transition-all duration-200 shadow-xs hover:shadow-md"
              >
                <div className="flex flex-col gap-3.5">
                  {/* Persona Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        {persona.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                          {persona.name}
                        </h3>
                        <p className="text-xs text-slate-500">{persona.title}</p>
                      </div>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${difficultyBadge}`}>
                      {persona.difficulty}
                    </span>
                  </div>

                  {/* Company & Cadence Details */}
                  <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Company:</span>
                      <span className="text-slate-800 font-semibold truncate max-w-[170px]">{persona.companyType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Cadence:</span>
                      <span className="text-slate-800 font-semibold">{persona.accent}</span>
                    </div>
                  </div>

                  {/* Scenario Description */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Scenario Brief:
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed line-clamp-2">
                      {persona.scenario}
                    </p>
                  </div>

                  {/* Core Objection */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block mb-1">
                      Core Friction:
                    </span>
                    <p className="text-slate-800 italic leading-snug">
                      "{persona.coreObjection}"
                    </p>
                  </div>

                  {/* Objectives Checklist Preview */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Rubric Objectives ({persona.objectives.length}):
                    </span>
                    {persona.objectives.slice(0, 2).map((obj) => (
                      <div key={obj.id} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                        <CheckCircle className="h-3 w-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{obj.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dial-in Action Button */}
                <Link
                  href={`/sparring/${persona.id}`}
                  className="mt-5 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <Radio className="h-3.5 w-3.5" />
                  <span>START VOICE SPARRING</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
