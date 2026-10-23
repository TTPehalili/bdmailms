'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, X, Play, CheckCircle2, AlertCircle, Copy, Check, ExternalLink, RefreshCw, CheckCheck } from 'lucide-react';
import { getNodeDefinition, INodeDefinition } from '@/registry';

function ElevenLabsBadgeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className || 'h-5 w-5'}>
      <rect x="7" y="4" width="3.5" height="16" rx="1.75" />
      <rect x="13.5" y="4" width="3.5" height="16" rx="1.75" />
    </svg>
  );
}

interface NodeConfigDrawerProps {
  nodeId: string | null;
  workflowId: string;
  initialNodeData: any;
  onClose: () => void;
  onSaveConfig: (nodeId: string, updatedConfig: Record<string, any>, updatedLabel?: string) => void;
}

export default function NodeConfigDrawer({
  nodeId,
  workflowId,
  initialNodeData,
  onClose,
  onSaveConfig
}: NodeConfigDrawerProps) {
  const [nodeDef, setNodeDef] = useState<INodeDefinition | null>(null);
  const [label, setLabel] = useState('');
  const [config, setConfig] = useState<Record<string, any>>({});
  const [isTesting, setIsTesting] = useState(false);
  const [testOutput, setTestOutput] = useState<any>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  useEffect(() => {
    if (initialNodeData) {
      setLabel(initialNodeData.label || '');
      setConfig(initialNodeData.config || {});
      const def = getNodeDefinition(initialNodeData.nodeType || '');
      setNodeDef(def || null);
    }
  }, [initialNodeData]);

  if (!nodeId || !initialNodeData) return null;

  const handleFieldChange = (key: string, val: any) => {
    const updated = { ...config, [key]: val };
    setConfig(updated);
    onSaveConfig(nodeId, updated, label);
  };

  const handleLabelChange = (newLabel: string) => {
    setLabel(newLabel);
    onSaveConfig(nodeId, config, newLabel);
  };

  const handleRunTestStep = async () => {
    setIsTesting(true);
    setTestOutput(null);
    try {
      if (nodeDef?.execute) {
        const result = await nodeDef.execute({
          nodeId,
          nodeName: label,
          workflowId,
          executionId: `test-step-${Date.now()}`,
          config,
          inputItems: [{ json: { sampleInput: true, timestamp: new Date().toISOString() } }],
          context: {
            resolve: (input: any) => input
          } as any
        });
        setTestOutput({ success: true, items: result[0] || [] });
      } else {
        setTestOutput({ success: true, items: [{ json: { status: 'passed', simulated: true } }] });
      }
    } catch (err: any) {
      setTestOutput({ success: false, error: err.message || String(err) });
    } finally {
      setIsTesting(false);
    }
  };

  const isElevenLabs = initialNodeData.nodeType === 'elevenLabsNode';

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-stone-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* n8n Node Details Top Bar */}
      <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between bg-white text-xs">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 font-bold text-stone-700 hover:text-stone-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Node details</span>
        </button>

        <a
          href="https://elevenlabs.io/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-stone-500 hover:text-stone-800 transition-colors font-medium text-[11px]"
        >
          <span>Docs</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Node Brand & Description Header (Exactly matching n8n screenshot) */}
      <div className="p-5 border-b border-stone-100 bg-stone-50/40 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {isElevenLabs ? (
              <ElevenLabsBadgeIcon className="h-6 w-6 text-stone-900" />
            ) : (
              <div className="h-7 w-7 rounded-lg bg-stone-900 text-white flex items-center justify-center font-bold text-xs">
                {nodeDef?.displayName?.[0] || 'N'}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-black text-stone-900">{nodeDef?.displayName}</h3>
              <span className="h-4 w-4 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px]">
                ✓
              </span>
            </div>
          </div>
          <span className="text-[11px] font-mono text-stone-400">Installed</span>
        </div>

        <p className="text-xs text-stone-500 leading-relaxed">
          {nodeDef?.description || 'Interact with ElevenLabs API for speech synthesis and voice cloning'}
        </p>

        <div className="flex items-center gap-3 text-[11px] text-stone-400 font-mono">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Verified</span>
          </span>
          <span>•</span>
          <span>Published by appointmentlyy</span>
        </div>
      </div>

      {/* Body scroll area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Node Label Customization */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-stone-600">Node Name on Canvas</label>
          <input
            type="text"
            value={label}
            onChange={(e) => handleLabelChange(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-xs font-bold text-stone-900 focus:outline-none focus:border-stone-800"
          />
        </div>

        {/* ElevenLabs 7 Actions Selector (Exact replica of screenshot) */}
        {isElevenLabs && (
          <div className="space-y-3 border-y border-stone-200 py-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">Actions (7)</span>
            </div>

            {/* Voice Actions */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Voice Actions</span>
              <div className="space-y-1 pl-1">
                {[
                  { id: 'getVoice', label: 'Get a voice' },
                  { id: 'getManyVoices', label: 'Get many voices' },
                  { id: 'createVoiceClone', label: 'Create a voice clone' },
                  { id: 'deleteVoice', label: 'Delete a voice' }
                ].map((act) => {
                  const isChecked = config.operation === act.id;
                  return (
                    <label
                      key={act.id}
                      className={`flex items-center gap-2 p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                        isChecked ? 'bg-stone-100 font-bold text-stone-900' : 'text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="elevenlabs_op"
                        checked={isChecked}
                        onChange={() => {
                          handleFieldChange('actionCategory', 'voice');
                          handleFieldChange('operation', act.id);
                        }}
                        className="text-stone-900 focus:ring-stone-900"
                      />
                      <span>{act.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Speech Actions */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Speech Actions</span>
              <div className="space-y-1 pl-1">
                {[
                  { id: 'textToSpeech', label: 'Convert text to speech' },
                  { id: 'transcribeAudio', label: 'Transcribe audio or video' },
                  { id: 'changeVoiceSettings', label: 'Change a voice' }
                ].map((act) => {
                  const isChecked = config.operation === act.id;
                  return (
                    <label
                      key={act.id}
                      className={`flex items-center gap-2 p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                        isChecked ? 'bg-stone-100 font-bold text-stone-900' : 'text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="elevenlabs_op"
                        checked={isChecked}
                        onChange={() => {
                          handleFieldChange('actionCategory', 'speech');
                          handleFieldChange('operation', act.id);
                        }}
                        className="text-stone-900 focus:ring-stone-900"
                      />
                      <span>{act.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Parameter Fields */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">Parameters</h4>
          {nodeDef?.properties.map((prop) => {
            // Check displayOptions
            if (prop.displayOptions?.show) {
              for (const [key, allowedVals] of Object.entries(prop.displayOptions.show)) {
                if (!allowedVals.includes(config[key])) {
                  return null;
                }
              }
            }

            // Skip operation radio if already displayed above for ElevenLabs
            if (isElevenLabs && (prop.name === 'operation' || prop.name === 'actionCategory')) {
              return null;
            }

            const currentValue = config[prop.name] !== undefined ? config[prop.name] : prop.default;

            return (
              <div key={prop.name} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-stone-800">{prop.displayName}</label>
                  {prop.required && <span className="text-[10px] font-bold text-rose-500">*Required</span>}
                </div>

                {prop.type === 'options' && (
                  <select
                    value={currentValue}
                    onChange={(e) => handleFieldChange(prop.name, e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:ring-2 focus:ring-stone-900 focus:outline-none"
                  >
                    {prop.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                )}

                {prop.type === 'string' && (
                  <input
                    type="text"
                    value={currentValue}
                    onChange={(e) => handleFieldChange(prop.name, e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs font-mono focus:ring-2 focus:ring-stone-900 focus:outline-none"
                  />
                )}

                {prop.type === 'number' && (
                  <input
                    type="number"
                    step="0.05"
                    value={currentValue}
                    onChange={(e) => handleFieldChange(prop.name, Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:ring-2 focus:ring-stone-900 focus:outline-none"
                  />
                )}

                {prop.type === 'boolean' && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(currentValue)}
                      onChange={(e) => handleFieldChange(prop.name, e.target.checked)}
                      className="rounded text-stone-900 focus:ring-stone-900"
                    />
                    <span className="text-xs text-stone-600">Enabled</span>
                  </label>
                )}

                {(prop.type === 'json' || prop.type === 'code') && (
                  <textarea
                    rows={prop.type === 'code' ? 6 : 4}
                    value={typeof currentValue === 'object' ? JSON.stringify(currentValue, null, 2) : currentValue}
                    onChange={(e) => handleFieldChange(prop.name, e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 text-stone-200 font-mono text-[11px] border border-stone-800 focus:ring-2 focus:ring-stone-700 focus:outline-none"
                  />
                )}

                {prop.description && (
                  <p className="text-[10px] text-stone-500 leading-relaxed">{prop.description}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Test Step Inspector */}
        <div className="pt-2 border-t border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">Test Step</h4>
            <button
              onClick={handleRunTestStep}
              disabled={isTesting}
              className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" />
                  <span>Execute Step</span>
                </>
              )}
            </button>
          </div>

          {testOutput && (
            <div className="p-3 rounded-2xl bg-stone-950 text-stone-100 font-mono text-[10px] space-y-1.5 max-h-56 overflow-y-auto">
              <div className="flex items-center justify-between text-stone-400 border-b border-stone-800 pb-1">
                <span>Output Payloads</span>
                {testOutput.success ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Passed
                  </span>
                ) : (
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Error
                  </span>
                )}
              </div>
              <pre className="text-stone-300 whitespace-pre-wrap">
                {JSON.stringify(testOutput.items || testOutput.error, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3.5 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
        <span className="font-mono text-[11px]">{nodeDef?.name}</span>
        <button
          onClick={onClose}
          className="px-3.5 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold transition-colors cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
}
