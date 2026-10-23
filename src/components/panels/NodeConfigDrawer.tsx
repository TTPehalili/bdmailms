'use client';

import React, { useState, useEffect } from 'react';
import { X, Play, CheckCircle2, AlertCircle, Copy, Check, Terminal, ExternalLink, RefreshCw } from 'lucide-react';
import { getNodeDefinition, INodeDefinition } from '@/registry';

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
        // Run test execution locally
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

  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/webhooks/${config.path || 'incoming-hook'}`
    : `/api/webhooks/${config.path || 'incoming-hook'}`;

  const testWebhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/webhooks/test/${workflowId}/${nodeId}`
    : `/api/webhooks/test/${workflowId}/${nodeId}`;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white border-l border-stone-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-stone-100 flex items-center justify-center font-bold text-stone-700">
            {nodeDef?.displayName?.[0] || 'N'}
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900">{label || nodeDef?.displayName}</h3>
            <span className="text-[10px] font-mono text-stone-500">
              {nodeDef?.category} • {nodeDef?.name}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body scroll area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Node Label input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-700">Display Label</label>
          <input
            type="text"
            value={label}
            onChange={(e) => handleLabelChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:ring-2 focus:ring-[#ED1C24] focus:outline-none"
          />
        </div>

        {/* Webhook specific helper banner */}
        {nodeDef?.name === 'webhookTrigger' && (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase text-amber-800 tracking-wider">
              Production Webhook Ingress URL
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                readOnly
                value={webhookUrl}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-amber-200 text-[11px] font-mono text-stone-700"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(webhookUrl);
                  setCopiedWebhook(true);
                  setTimeout(() => setCopiedWebhook(false), 2000);
                }}
                className="p-2 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 transition-colors"
                title="Copy Production URL"
              >
                {copiedWebhook ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <p className="text-[10px] text-amber-700 leading-relaxed">
              Test Listener URL: <code className="font-mono text-[9px] bg-white px-1 py-0.5 rounded">{testWebhookUrl}</code>
            </p>
          </div>
        )}

        {/* Dynamic Parameter Fields */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">Node Parameters</h4>
          {nodeDef?.properties.map((prop) => {
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
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:ring-2 focus:ring-[#ED1C24] focus:outline-none"
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
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs font-mono focus:ring-2 focus:ring-[#ED1C24] focus:outline-none"
                  />
                )}

                {prop.type === 'number' && (
                  <input
                    type="number"
                    value={currentValue}
                    onChange={(e) => handleFieldChange(prop.name, Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:ring-2 focus:ring-[#ED1C24] focus:outline-none"
                  />
                )}

                {prop.type === 'boolean' && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(currentValue)}
                      onChange={(e) => handleFieldChange(prop.name, e.target.checked)}
                      className="rounded text-[#ED1C24] focus:ring-[#ED1C24]"
                    />
                    <span className="text-xs text-stone-600">Enable</span>
                  </label>
                )}

                {(prop.type === 'json' || prop.type === 'code') && (
                  <textarea
                    rows={prop.type === 'code' ? 7 : 4}
                    value={typeof currentValue === 'object' ? JSON.stringify(currentValue, null, 2) : currentValue}
                    onChange={(e) => handleFieldChange(prop.name, e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 text-emerald-400 font-mono text-[11px] border border-stone-800 focus:ring-2 focus:ring-[#ED1C24] focus:outline-none"
                  />
                )}

                {prop.description && (
                  <p className="text-[10px] text-stone-500 leading-relaxed">{prop.description}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Expression Helper */}
        <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600 space-y-1">
          <span className="font-bold text-stone-800">💡 Expression Helper:</span>
          <p>
            Reference data using: <code className="bg-stone-200 px-1 py-0.5 rounded text-[10px] font-mono">{"{{ $json.field }}"}</code> or <code className="bg-stone-200 px-1 py-0.5 rounded text-[10px] font-mono">{"{{ $node['Node Name'].json.field }}"}</code>
          </p>
        </div>

        {/* Test Step Inspector */}
        <div className="pt-2 border-t border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">Test Step Inspector</h4>
            <button
              onClick={handleRunTestStep}
              disabled={isTesting}
              className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>Evaluating...</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" />
                  <span>Test This Step</span>
                </>
              )}
            </button>
          </div>

          {testOutput && (
            <div className="p-3 rounded-2xl bg-stone-900 text-stone-100 font-mono text-[10px] space-y-1.5 max-h-56 overflow-y-auto">
              <div className="flex items-center justify-between text-stone-400 border-b border-stone-800 pb-1">
                <span>Output Payloads ({testOutput.items?.length || 0} items)</span>
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
              <pre className="text-emerald-400 whitespace-pre-wrap">
                {JSON.stringify(testOutput.items || testOutput.error, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
        >
          Close Drawer
        </button>
      </div>
    </div>
  );
}
