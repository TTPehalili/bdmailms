'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Clock, RefreshCw, Terminal, ChevronRight } from 'lucide-react';
import { ExecutionRecord } from '@/lib/db';

interface ExecutionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  workflowId: string;
}

export default function ExecutionHistoryDrawer({ isOpen, onClose, workflowId }: ExecutionHistoryDrawerProps) {
  const [executions, setExecutions] = useState<ExecutionRecord[]>([]);
  const [selectedExec, setSelectedExec] = useState<ExecutionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchExecutions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/executions?limit=30');
      const data = await res.json();
      if (data.success) {
        // Filter by current workflow or show all
        const list = data.data.filter((e: ExecutionRecord) => !workflowId || e.workflowId === workflowId);
        setExecutions(list);
        if (list.length > 0 && !selectedExec) {
          setSelectedExec(list[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch executions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchExecutions();
    }
  }, [isOpen, workflowId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white border-l border-stone-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-stone-700" />
          <div>
            <h3 className="text-sm font-bold text-stone-900">Execution History & Tracing</h3>
            <p className="text-[11px] text-stone-500">Real-time runtime logs and per-node input/output states</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={fetchExecutions}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-200 transition-colors cursor-pointer"
            title="Refresh history"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Content: Split Master-Detail */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Left List of Executions */}
        <div className="w-full md:w-5/12 border-b md:border-b-0 md:border-r border-stone-200 overflow-y-auto p-3 space-y-2 bg-stone-50/40">
          {executions.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs">
              No executions logged yet. Click &ldquo;Run Workflow&rdquo; or trigger a webhook.
            </div>
          ) : (
            executions.map((exec) => {
              const isSelected = selectedExec?.id === exec.id;
              return (
                <div
                  key={exec.id}
                  onClick={() => setSelectedExec(exec)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-[#ED1C24] shadow-xs'
                      : 'bg-white border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-stone-400">{exec.id.substring(0, 14)}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        exec.status === 'success'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : exec.status === 'running'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {exec.status}
                    </span>
                  </div>
                  <div className="mt-1 font-semibold text-stone-800 truncate">{exec.workflowName}</div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-stone-400 font-mono">
                    <span>Source: {exec.triggerSource}</span>
                    <span>{exec.executionTimeMs ? `${exec.executionTimeMs}ms` : '--'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Detail Pane */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedExec ? (
            <>
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800">{selectedExec.workflowName}</span>
                  <span className="text-[10px] font-mono text-stone-500">
                    {new Date(selectedExec.startedAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-stone-600 font-mono">
                  <span>Trigger: {selectedExec.triggerSource}</span>
                  <span>Duration: {selectedExec.executionTimeMs}ms</span>
                </div>
                {selectedExec.error && (
                  <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px]">
                    <strong>Error:</strong> {selectedExec.error}
                  </div>
                )}
              </div>

              {/* Node-by-node execution trace */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">Node Tracing & Payloads</h4>
                {Object.entries(selectedExec.nodeOutputs || {}).map(([nodeId, trace]) => (
                  <div key={nodeId} className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-2xs">
                    <div className="p-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {trace.status === 'success' ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-rose-500" />
                        )}
                        <span className="font-bold text-xs text-stone-800">{nodeId}</span>
                      </div>
                      <span className="text-[10px] font-mono text-stone-400">
                        {trace.executionTimeMs ? `${trace.executionTimeMs}ms` : ''}
                      </span>
                    </div>

                    <div className="p-3 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Output Payload:</div>
                      <pre className="p-2 rounded-xl bg-stone-900 text-emerald-400 font-mono text-[10px] overflow-x-auto max-h-48 whitespace-pre-wrap">
                        {JSON.stringify(trace.output, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-stone-400 text-xs">Select an execution run to inspect payload data</div>
          )}
        </div>
      </div>
    </div>
  );
}
