'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  ArrowRight, 
  Flame, 
  Sparkles, 
  SlidersHorizontal,
  Building,
  Target
} from 'lucide-react';
import { SPARRING_PERSONAS } from '@/lib/personas';
import AppSidebar from '@/components/AppSidebar';
import GlobalTopHeader from '@/components/GlobalTopHeader';

export default function SparringLobbyPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const filteredPersonas = selectedDifficulty === 'all' 
    ? SPARRING_PERSONAS 
    : SPARRING_PERSONAS.filter(p => p.difficulty.toLowerCase() === selectedDifficulty.toLowerCase());

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F2F0EF] font-sans antialiased text-[#222021]">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <GlobalTopHeader />

        <main className="flex-1 overflow-y-auto px-8 py-8 space-y-6">
          
          {/* Executive Header Banner */}
          <div className="rounded-2xl p-6 bg-white border border-[#222021]/10 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ED1C24]/10 border border-[#ED1C24]/20 text-[#ED1C24] text-[11px] font-bold tracking-wide uppercase mb-2">
                <Sparkles className="h-3 w-3" />
                <span>Voice Simulation LMS</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-[#222021]">
                AI Sparring Arena — 10 Buyer Personas
              </h1>
              <p className="text-xs text-[#6b6968] mt-1 leading-relaxed">
                Dial in to simulate high-friction B2B outbound calls. Handle realistic buyer pushback using the ARM (Acknowledge, Respond, Move) methodology, and receive automated post-call rubric grading.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/cockpit"
                className="px-4 py-2 rounded-xl bg-[#ED1C24] hover:bg-[#d0181f] text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <span>Live Boris Cockpit</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex items-center justify-between gap-4 flex-wrap bg-white border border-[#222021]/10 rounded-2xl px-5 py-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-[#6b6968]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#6b6968]">
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
                      ? 'bg-[#ED1C24] text-white shadow-xs'
                      : 'bg-[#F2F0EF] text-[#6b6968] hover:bg-[#e7e4e2] hover:text-[#222021]'
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
                persona.difficulty === 'Nightmare' ? 'bg-red-50 text-red-700 border-red-200' :
                persona.difficulty === 'Advanced' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                persona.difficulty === 'Intermediate' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-emerald-50 text-emerald-700 border-emerald-200';

              return (
                <div
                  key={persona.id}
                  className="rounded-2xl bg-white border border-[#222021]/10 hover:border-[#ED1C24]/40 p-5 flex flex-col justify-between transition-all duration-200 shadow-2xs hover:shadow-md"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${persona.avatarBg} flex items-center justify-center text-white font-bold text-sm shadow-2xs`}>
                          {persona.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-[#222021]">
                            {persona.name}
                          </h3>
                          <p className="text-[11px] text-[#6b6968]">
                            {persona.title}
                          </p>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${difficultyBadge}`}>
                        {persona.difficulty}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1.5 pt-2 border-t border-[#222021]/10 text-xs">
                      <div className="flex items-center gap-2 text-[#6b6968]">
                        <Building className="h-3.5 w-3.5 text-[#6b6968]" />
                        <span>{persona.companyType}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#6b6968]">
                        <Target className="h-3.5 w-3.5 text-[#6b6968]" />
                        <span>Accent: {persona.accent}</span>
                      </div>
                    </div>

                    {/* Scenario */}
                    <div className="p-3 rounded-xl bg-[#F2F0EF] border border-[#222021]/10 text-xs space-y-1">
                      <div className="font-bold text-[#222021] text-[11px] flex items-center gap-1">
                        <Flame className="h-3 w-3 text-[#ED1C24]" />
                        <span>Buyer Friction</span>
                      </div>
                      <p className="text-[#6b6968] text-[11px] leading-relaxed">
                        "{persona.coreObjection}"
                      </p>
                    </div>
                  </div>

                  {/* Start Sparring CTA */}
                  <div className="pt-4 mt-4 border-t border-[#222021]/10 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#6b6968]">
                      3 Rubric Gates
                    </span>

                    <Link
                      href={`/sparring/${persona.id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-[#ED1C24] hover:bg-[#d0181f] text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <span>Start Sparring</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
