'use client';

import React, { useState } from 'react';
import { 
  Workflow, 
  Play, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  Plus, 
  Settings2, 
  FileCode, 
  Zap, 
  Activity,
  Send,
  MessageSquare
} from 'lucide-react';

interface WorkflowNode {
  id: string;
  name: string;
  category: 'Trigger' | 'Logic' | 'CRM' | 'AI / Voice' | 'Integration';
  icon: string;
  description: string;
  config: string;
  status: 'ready' | 'running' | 'success';
}

export default function WorkflowAutomationStudio() {
  const [activeWorkflow, setActiveWorkflow] = useState('wf-1');
  const [isRunningDebug, setIsRunningDebug] = useState(false);
  const [activeDebugStep, setActiveDebugStep] = useState<number | null>(null);
  const [debugLog, setDebugLog] = useState<string | null>(null);

  const [nodes, setNodes] = useState<WorkflowNode[]>([
    {
      id: 'node-1',
      name: 'lms.trigger.sparringCompleted',
      category: 'Trigger',
      icon: '⚡',
      description: 'Fires when a sales rep finishes a 3-minute AI Sparring round with a prospect.',
      config: 'Filter: Score >= 0%, Mode: All Personas',
      status: 'ready'
    },
    {
      id: 'node-2',
      name: 'core.if (ARM Rubric Evaluator)',
      category: 'Logic',
      icon: '🔀',
      description: 'Branch based on whether rep passed the 80% Boris ARM benchmark.',
      config: 'Condition: session.score >= 80',
      status: 'ready'
    },
    {
      id: 'node-3',
      name: 'crm.tag.add ("AI_CERTIFIED_SDR")',
      category: 'CRM',
      icon: '🏷️',
      description: 'Synchronizes certificate badge to GoHighLevel & HubSpot contact.',
      config: 'Connector: GoHighLevel (Apex BPO)',
      status: 'ready'
    },
    {
      id: 'node-4',
      name: 'ai.agent.llm (Claude 3.5 Sonnet BYOK)',
      category: 'AI / Voice',
      icon: '🧠',
      description: 'Synthesizes bulleted tactical feedback breakdown analyzing rep objection latency.',
      config: 'Model: claude-3-5-sonnet-20241022',
      status: 'ready'
    },
    {
      id: 'node-5',
      name: 'slack.notify (#floor-supervisors)',
      category: 'Integration',
      icon: '💬',
      description: 'Alerts outbound floor manager with rep scorecard & certificate PDF link.',
      config: 'Webhook: #enterprise-sales-floor',
      status: 'ready'
    }
  ]);

  const [executions, setExecutions] = useState([
    { id: 'exec_9901', trigger: 'Sparring Call Finished (Alex Mercer)', time: '2 mins ago', duration: '342ms', status: 'Success' },
    { id: 'exec_9902', trigger: 'Certification Passed (Elena Rostova)', time: '18 mins ago', duration: '512ms', status: 'Success' },
    { id: 'exec_9903', trigger: 'Sparring Call Finished (Marcus Brody)', time: '34 mins ago', duration: '290ms', status: 'Success' },
    { id: 'exec_9904', trigger: 'Webhook Inbound (Lead Created)', time: '1 hour ago', duration: '184ms', status: 'Success' },
  ]);

  // Run Animated Debug Execution
  const handleRunDebug = () => {
    setIsRunningDebug(true);
    setDebugLog('Initializing sandboxed execution runner in isolated Node.js VM...');
    setActiveDebugStep(0);

    const stepDelay = 600;
    nodes.forEach((_, idx) => {
      setTimeout(() => {
        setActiveDebugStep(idx);
        if (idx === 0) setDebugLog('⚡ Node 1 [Trigger]: Captured dialogue turns from Alex Mercer session...');
        if (idx === 1) setDebugLog('🔀 Node 2 [Logic]: Evaluated Score 88% >= 80% ➔ TRUE (Proceeding on Success Branch)...');
        if (idx === 2) setDebugLog('🏷️ Node 3 [CRM]: Tag "AI_CERTIFIED_SDR" pushed to GoHighLevel (HTTP 200 OK)...');
        if (idx === 3) setDebugLog('🧠 Node 4 [AI]: Anthropic Claude 3.5 Sonnet generated 3 tactical coaching tips (Tokens: 218)...');
        if (idx === 4) {
          setDebugLog('💬 Node 5 [Slack]: Pushed scorecard payload to Slack #floor-supervisors. Run completed in 314ms!');
          setIsRunningDebug(false);
          setActiveDebugStep(null);
          setExecutions(prev => [
            { id: `exec_${Math.floor(Math.random() * 1000 + 9000)}`, trigger: 'Manual Debug Execution', time: 'Just now', duration: '314ms', status: 'Success' },
            ...prev
          ]);
        }
      }, (idx + 1) * stepDelay);
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Studio Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#222021]/10 rounded-2xl p-5 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ED1C24]/10 border border-[#ED1C24]/20 text-[#ED1C24] text-[10px] font-bold tracking-wide uppercase mb-1.5">
            <Workflow className="h-3 w-3" />
            <span>n8n-Parity Workflow Engine</span>
          </div>
          <h2 className="text-xl font-black text-[#222021] tracking-tight">
            n8n Visual Workflow Automation Studio
          </h2>
          <p className="text-xs text-[#6b6968]">
            Construct multi-step event automations linking AI sparring results, CRM contact tagging, and manager notifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunDebug}
            disabled={isRunningDebug}
            className="px-4 py-2 rounded-xl bg-[#ED1C24] hover:bg-[#d0181f] text-white font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Play className={`h-3.5 w-3.5 fill-current ${isRunningDebug ? 'animate-spin' : ''}`} />
            <span>{isRunningDebug ? 'Executing Workflow...' : 'Run Test Execution'}</span>
          </button>
        </div>
      </div>

      {/* Debug Runner Banner */}
      {debugLog && (
        <div className="p-3.5 rounded-xl bg-stone-950 text-white font-mono text-xs border border-stone-800 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="truncate">{debugLog}</span>
          </div>
          <span className="text-[10px] text-stone-400 font-mono shrink-0">BullMQ Sandbox VM</span>
        </div>
      )}

      {/* Visual Workflow Canvas (Interactive Pipeline) */}
      <div className="bg-[#FAF9F5] border border-[#222021]/10 rounded-3xl p-6 shadow-2xs space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-[#222021] uppercase">
              ACTIVE CANVAS: BPO Outbound Qualification & CRM Certification Pipeline
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#6b6968]">5 Active Nodes &bull; Version 1.2</span>
        </div>

        {/* Nodes Sequential Layout */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 pt-4 overflow-x-auto pb-2">
          {nodes.map((node, index) => {
            const isStepActive = activeDebugStep === index;
            return (
              <React.Fragment key={node.id}>
                <div 
                  className={`w-full lg:w-52 rounded-2xl p-4 bg-white border transition-all duration-300 shadow-2xs space-y-2 shrink-0 ${
                    isStepActive
                      ? 'border-[#ED1C24] ring-2 ring-[#ED1C24]/30 scale-105 shadow-lg'
                      : 'border-[#222021]/10 hover:border-[#222021]/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xl">{node.icon}</span>
                    <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                      {node.category}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-[#222021] truncate font-mono" title={node.name}>
                      {node.name}
                    </h4>
                    <p className="text-[10px] text-[#6b6968] mt-1 leading-tight line-clamp-2">
                      {node.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#222021]/10 text-[9px] font-mono text-[#6b6968] truncate">
                    {node.config}
                  </div>
                </div>

                {index < nodes.length - 1 && (
                  <div className="text-[#6b6968] font-bold text-lg hidden lg:block shrink-0">
                    <ArrowRight className="h-5 w-5 text-[#222021]/30" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Execution Run History */}
      <div className="bg-white border border-[#222021]/10 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-[#222021]">Recent Workflow Executions</h3>
            <p className="text-xs text-[#6b6968]">Execution logs from automated webhooks, trigger events, and cron schedules.</p>
          </div>
          <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            99.98% Success SLA
          </span>
        </div>

        <div className="border border-[#222021]/10 rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-[#F2F0EF] border-b border-[#222021]/10 text-[11px] font-mono font-bold text-[#6b6968] uppercase">
              <tr>
                <th className="py-2.5 px-4">Execution ID</th>
                <th className="py-2.5 px-4">Trigger Source</th>
                <th className="py-2.5 px-4">Time</th>
                <th className="py-2.5 px-4">Execution Latency</th>
                <th className="py-2.5 px-4 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222021]/10 font-mono">
              {executions.map((e) => (
                <tr key={e.id} className="hover:bg-[#FAF9F5] transition-colors">
                  <td className="py-3 px-4 font-bold text-[#222021]">{e.id}</td>
                  <td className="py-3 px-4 font-sans text-xs text-[#222021]">{e.trigger}</td>
                  <td className="py-3 px-4 text-[#6b6968]">{e.time}</td>
                  <td className="py-3 px-4 text-[#6b6968]">{e.duration}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{e.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
