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
  ArrowLeft
} from 'lucide-react';
import { SPARRING_PERSONAS, SparringPersona } from '@/lib/personas';

export default function SparringLobbyPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const filteredPersonas = selectedDifficulty === 'all' 
    ? SPARRING_PERSONAS 
    : SPARRING_PERSONAS.filter(p => p.difficulty.toLowerCase() === selectedDifficulty.toLowerCase());

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-red-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                AI SPARRING ARENA
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-800/50 font-bold uppercase">
                10 Real-world Personas
              </span>
            </div>
            <p className="text-xs text-slate-400">Conversational Voice Simulation & Instant Post-Call QA Scoring</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/frameworks"
            className="text-xs px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold transition-colors"
          >
            Admin Frameworks
          </Link>
          <Link
            href="/cockpit"
            className="text-xs px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold transition-all shadow-md shadow-red-900/20"
          >
            Live Rep Cockpit &rarr;
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-8 flex flex-col gap-8">
        
        {/* Banner */}
        <div className="relative rounded-3xl p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-red-950/30 border border-slate-800 overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-800/60 text-red-400 text-xs font-semibold mb-3">
              <Sparkles className="h-3 w-3" />
              <span>Simulated Outbound Calling</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              Master the ARM Framework Against Realistic Buyer Pushback
            </h1>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Select any of the 10 buyer archetypes below. Dial into the live voice simulator, handle their core friction without arguing, and receive automated rubric scoring immediately upon ending the call.
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Filter By Difficulty:
            </span>
          </div>

          <div className="flex items-center gap-2">
            {['all', 'beginner', 'intermediate', 'advanced', 'nightmare'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedDifficulty(lvl)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  selectedDifficulty === lvl
                    ? 'bg-red-600 text-white shadow-md shadow-red-900/40 border border-red-500/40'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* 10 Personas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPersonas.map((persona, index) => {
            const difficultyColor = 
              persona.difficulty === 'Nightmare' ? 'bg-red-950 text-red-400 border-red-800/80' :
              persona.difficulty === 'Advanced' ? 'bg-amber-950 text-amber-400 border-amber-800/80' :
              persona.difficulty === 'Intermediate' ? 'bg-blue-950 text-blue-400 border-blue-800/80' :
              'bg-emerald-950 text-emerald-400 border-emerald-800/80';

            return (
              <div
                key={persona.id}
                className="group rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 p-6 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-2xl relative overflow-hidden"
              >
                <div className="flex flex-col gap-4">
                  {/* Persona Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${persona.avatarBg} flex items-center justify-center text-white font-black text-sm shadow-md border border-white/10`}>
                        {persona.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-100 text-base group-hover:text-red-400 transition-colors">
                          {persona.name}
                        </h3>
                        <p className="text-xs text-slate-400">{persona.title}</p>
                      </div>
                    </div>

                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${difficultyColor}`}>
                      {persona.difficulty}
                    </span>
                  </div>

                  {/* Company & Accent Tag */}
                  <div className="text-[11px] text-slate-400 flex flex-col gap-1 border-y border-slate-800/80 py-2.5 my-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Company:</span>
                      <span className="text-slate-300 font-semibold">{persona.companyType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Cadence:</span>
                      <span className="text-slate-300 font-semibold">{persona.accent}</span>
                    </div>
                  </div>

                  {/* Scenario & Objection */}
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Scenario:
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                        {persona.scenario}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block mb-1">
                        Core Objection:
                      </span>
                      <p className="text-slate-300 italic">
                        "{persona.coreObjection}"
                      </p>
                    </div>
                  </div>

                  {/* Objectives Checklist Preview */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Target Objectives ({persona.objectives.length}):
                    </span>
                    {persona.objectives.slice(0, 2).map((obj) => (
                      <div key={obj.id} className="flex items-center gap-2 text-[11px] text-slate-400">
                        <CheckCircle className="h-3 w-3 text-slate-600" />
                        <span className="truncate">{obj.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dial In CTA */}
                <Link
                  href={`/sparring/${persona.id}`}
                  className="mt-6 w-full py-3 rounded-xl bg-slate-800 hover:bg-gradient-to-r hover:from-red-600 hover:to-rose-600 text-slate-200 hover:text-white font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-md border border-slate-700/60 hover:border-red-500/40"
                >
                  <Radio className="h-3.5 w-3.5" />
                  <span>START SPARRING CALL</span>
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
