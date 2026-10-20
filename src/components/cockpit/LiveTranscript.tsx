'use client';

import React, { useEffect, useRef } from 'react';
import { TranscriptEntry } from '@/types';
import { Volume2, Radio } from 'lucide-react';

interface LiveTranscriptProps {
  transcript: TranscriptEntry[];
  interimText: string;
  isListening: boolean;
}

export default function LiveTranscript({
  transcript,
  interimText,
  isListening
}: LiveTranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript, interimText]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200 shrink-0">
        <span className="text-[10px] font-bold text-slate-600 tracking-wider uppercase font-mono">
          DIARIZED STREAM (SCRIBE V2)
        </span>
        <span className="text-[10px] font-mono text-slate-400">
          PCM 16kHz
        </span>
      </div>

      {/* Transcript Log Container */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-white border border-slate-200 rounded-lg p-2.5 space-y-2 text-xs font-mono select-text"
      >
        {transcript.length === 0 && !interimText && (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-4">
            <Radio className="h-5 w-5 mb-1.5 text-slate-300" />
            <p className="text-[11px]">Audio stream standby.</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Click Dial to start live transcription.</p>
          </div>
        )}

        {transcript.map((entry) => {
          const isRep = entry.speaker === 'rep';
          return (
            <div key={entry.id} className="leading-snug">
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase shrink-0 font-mono ${
                    isRep
                      ? 'bg-slate-100 text-slate-700 border border-slate-200'
                      : 'bg-[#ED1C24]/10 text-[#ED1C24] border border-[#ED1C24]/20'
                  }`}
                >
                  {isRep ? '[You]' : '[Prospect]'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  {entry.timestamp}
                </span>
              </div>
              <p
                className={`mt-0.5 pl-1 ${
                  isRep ? 'text-slate-600 font-normal' : 'text-slate-900 font-medium'
                }`}
              >
                {entry.text}
              </p>
            </div>
          );
        })}

        {interimText && (
          <div className="leading-snug pt-1 border-t border-slate-100">
            <span className="text-[9px] px-1 py-0.2 rounded font-bold uppercase font-mono bg-amber-50 text-amber-800 border border-amber-200 mr-1.5">
              [Live...]
            </span>
            <span className="text-slate-700 italic animate-pulse">
              "{interimText}"
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
