'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Workflow, 
  Play, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  Plus, 
  Settings2, 
  FileCode, 
  Zap, 
  Activity,
  Send,
  MessageSquare,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Trash2,
  Copy,
  Check,
  X,
  ChevronRight,
  ChevronDown,
  Sliders,
  Layers,
  Split,
  Database,
  Terminal,
  RotateCcw
} from 'lucide-react';

export interface CanvasNode {
  id: string;
  title: string;
  subtitle: string;
  category: 'trigger' | 'logic' | 'crm' | 'ai' | 'notify' | 'code';
  icon: string;
  x: number;
  y: number;
  config: {
    eventName?: string;
    conditionField?: string;
    conditionOperator?: string;
    conditionValue?: string | number;
    crmProvider?: string;
    crmAction?: string;
    tag?: string;
    aiModel?: string;
    systemPrompt?: string;
    temperature?: number;
    channel?: string;
    messageTemplate?: string;
    codeSnippet?: string;
    [key: string]: any;
  };
  inputPayload?: any;
  outputPayload?: any;
  status: 'idle' | 'running' | 'success' | 'error';
  executionTime?: string;
  hasDualOutputs?: boolean; // For IF nodes (true & false outputs)
}

export interface CanvasEdge {
  id: string;
  fromNodeId: string;
  fromPort: 'output' | 'true' | 'false';
  toNodeId: string;
  toPort: 'input';
  status?: 'idle' | 'running' | 'success';
}

// 3 Pre-configured Workflows
const PRESET_WORKFLOWS: { [key: string]: { name: string; description: string; nodes: CanvasNode[]; edges: CanvasEdge[] } } = {
  'wf-branching-cert': {
    name: '⚡ Sparring ARM Rubric ➔ GHL Auto-Tag & Supervisor Escalation',
    description: 'Listens for completed 3-minute AI sparring rounds, evaluates Boris ARM benchmark >= 80%, tags GoHighLevel contact, and alerts Slack.',
    nodes: [
      {
        id: 'node-1',
        title: 'Sparring Completed',
        subtitle: 'appointmentlyy.trigger.sparring',
        category: 'trigger',
        icon: '⚡',
        x: 60,
        y: 180,
        status: 'idle',
        config: {
          eventName: 'sparring.session.finished',
          personaFilter: 'All Personas',
          minDurationSec: 120
        },
        inputPayload: { event: 'sparring.session.finished', timestamp: '2026-10-21T06:30:00Z' },
        outputPayload: {
          sessionId: 'session_88921',
          repId: 'rep_alex_mercer',
          repName: 'Alex Mercer',
          score: 88,
          prospect: 'David Sterling (VP Tech)',
          objectionsHandled: 4,
          transcriptUrl: 'https://cdn.appointmentlyy.ai/transcripts/88921.wav'
        }
      },
      {
        id: 'node-2',
        title: 'Evaluate ARM Benchmark',
        subtitle: 'core.if.condition',
        category: 'logic',
        icon: '🔀',
        x: 370,
        y: 160,
        status: 'idle',
        hasDualOutputs: true,
        config: {
          conditionField: 'score',
          conditionOperator: '>=',
          conditionValue: 80
        },
        inputPayload: { score: 88 },
        outputPayload: { branch: 'true', score: 88, benchmarkPassed: true }
      },
      {
        id: 'node-3',
        title: 'Add GHL Certificate Tag',
        subtitle: 'crm.ghl.addTag',
        category: 'crm',
        icon: '🏷️',
        x: 690,
        y: 80,
        status: 'idle',
        config: {
          crmProvider: 'GoHighLevel (Location Apex BPO)',
          crmAction: 'Add Contact Tag',
          tag: 'AI_CERTIFIED_SDR'
        },
        inputPayload: { contactEmail: 'alex.mercer@apexglobal.ph', tag: 'AI_CERTIFIED_SDR' },
        outputPayload: { httpStatus: 200, contactId: 'ghl_cnt_99812', synced: true }
      },
      {
        id: 'node-4',
        title: 'Claude 3.5 Sonnet Coaching',
        subtitle: 'ai.anthropic.claude35',
        category: 'ai',
        icon: '🧠',
        x: 690,
        y: 280,
        status: 'idle',
        config: {
          aiModel: 'claude-3-5-sonnet-20241022',
          systemPrompt: 'Extract 3 tactical bullet points highlighting objection hesitation and pace.',
          temperature: 0.3
        },
        inputPayload: { score: 88, hesitationCount: 1 },
        outputPayload: {
          feedback: [
            'Solid tonality deflection on pricing objection at 01:14',
            'Slight hesitation (1.8s) when asked about competitor API latency',
            'Strong closing cadence securing Thursday 2pm calendar hold'
          ],
          tokensUsed: 234
        }
      },
      {
        id: 'node-5',
        title: 'Slack Supervisor Alert',
        subtitle: 'notify.slack.webhook',
        category: 'notify',
        icon: '💬',
        x: 1010,
        y: 180,
        status: 'idle',
        config: {
          channel: '#floor-supervisors',
          messageTemplate: '🎉 Rep {{repName}} scored {{score}}% on Sparring! Tagged in GHL & Certificate Issued.'
        },
        inputPayload: { repName: 'Alex Mercer', score: 88 },
        outputPayload: { ok: true, channel: '#floor-supervisors', ts: '1729501800.12' }
      }
    ],
    edges: [
      { id: 'edge-1-2', fromNodeId: 'node-1', fromPort: 'output', toNodeId: 'node-2', toPort: 'input' },
      { id: 'edge-2-3', fromNodeId: 'node-2', fromPort: 'true', toNodeId: 'node-3', toPort: 'input' },
      { id: 'edge-2-4', fromNodeId: 'node-2', fromPort: 'true', toNodeId: 'node-4', toPort: 'input' },
      { id: 'edge-3-5', fromNodeId: 'node-3', fromPort: 'output', toNodeId: 'node-5', toPort: 'input' },
      { id: 'edge-4-5', fromNodeId: 'node-4', fromPort: 'output', toNodeId: 'node-5', toPort: 'input' }
    ]
  },

  'wf-hot-transfer': {
    name: '📞 Hot Lead Ingest ➔ Boris Telephony Dial & CRM Enrich',
    description: 'Instant lead qualification via Webhook, AI enrichment via GPT-4o, and automated softphone ring-down.',
    nodes: [
      {
        id: 'node-t1',
        title: 'Inbound Webhook Lead',
        subtitle: 'n8n-nodes-base.webhook',
        category: 'trigger',
        icon: '🌐',
        x: 80,
        y: 180,
        status: 'idle',
        config: { eventName: 'POST /webhook/inbound-lead', path: 'inbound-lead' },
        outputPayload: { name: 'Elena Rostova', company: 'FinLeap', phone: '+12124409921', size: 45 }
      },
      {
        id: 'node-t2',
        title: 'OpenAI GPT-4o ICP Scorer',
        subtitle: 'ai.openai.gpt4o',
        category: 'ai',
        icon: '🤖',
        x: 400,
        y: 180,
        status: 'idle',
        config: { aiModel: 'gpt-4o', systemPrompt: 'Evaluate B2B BPO ICP fit score (0-100).' },
        outputPayload: { icpScore: 94, reason: 'High outbound SDR seat volume, immediate pain' }
      },
      {
        id: 'node-t3',
        title: 'Boris Softphone Auto-Dial',
        subtitle: 'telephony.boris.dial',
        category: 'crm',
        icon: '📱',
        x: 720,
        y: 180,
        status: 'idle',
        config: { telephonyTrunk: 'Twilio BYOT Gateway', queueName: 'Enterprise SDR Floor' },
        outputPayload: { callStatus: 'initiated', callSid: 'CA991823901', repAssigned: 'Jordan Smith' }
      }
    ],
    edges: [
      { id: 'edge-t1-t2', fromNodeId: 'node-t1', fromPort: 'output', toNodeId: 'node-t2', toPort: 'input' },
      { id: 'edge-t2-t3', fromNodeId: 'node-t2', fromPort: 'output', toNodeId: 'node-t3', toPort: 'input' }
    ]
  }
};

// Available node templates for the Add Node Palette
const AVAILABLE_NODES = [
  {
    title: 'Sparring Completed',
    subtitle: 'appointmentlyy.trigger.sparring',
    category: 'trigger' as const,
    icon: '⚡',
    badge: 'Trigger',
    desc: 'Triggers when a rep concludes an AI sparring simulation round.'
  },
  {
    title: 'Certification Passed',
    subtitle: 'appointmentlyy.trigger.cert',
    category: 'trigger' as const,
    icon: '🏆',
    badge: 'Trigger',
    desc: 'Fires when a rep achieves 80%+ score on the official qualifier gate.'
  },
  {
    title: 'Inbound Webhook',
    subtitle: 'n8n.trigger.webhook',
    category: 'trigger' as const,
    icon: '🌐',
    badge: 'Trigger',
    desc: 'Listens for incoming HTTP POST payloads from Zapier, Make, or custom apps.'
  },
  {
    title: 'ARM Score IF Condition',
    subtitle: 'core.if.condition',
    category: 'logic' as const,
    icon: '🔀',
    badge: 'Logic',
    hasDualOutputs: true,
    desc: 'Splits execution branch based on score, sentiment, or qualification tags.'
  },
  {
    title: 'JavaScript Code Sandbox',
    subtitle: 'core.code.sandbox',
    category: 'code' as const,
    icon: '💻',
    badge: 'Transform',
    desc: 'Executes custom JavaScript/TypeScript data transformations.'
  },
  {
    title: 'Claude 3.5 Sonnet BYOK',
    subtitle: 'ai.anthropic.claude35',
    category: 'ai' as const,
    icon: '🧠',
    badge: 'AI Model',
    desc: 'Synthesizes deep qualitative tactical coaching insights from dialogue.'
  },
  {
    title: 'OpenAI GPT-4o Evaluator',
    subtitle: 'ai.openai.gpt4o',
    category: 'ai' as const,
    icon: '🤖',
    badge: 'AI Model',
    desc: 'Fast semantic analysis, objection classification, and rubric scoring.'
  },
  {
    title: 'GoHighLevel Contact & Tag',
    subtitle: 'crm.ghl.action',
    category: 'crm' as const,
    icon: '🏷️',
    badge: 'CRM Sync',
    desc: 'Updates contact tags, opportunity stages, and custom fields in GHL.'
  },
  {
    title: 'HubSpot Deal Stage Update',
    subtitle: 'crm.hubspot.action',
    category: 'crm' as const,
    icon: '🟠',
    badge: 'CRM Sync',
    desc: 'Moves deals forward in HubSpot pipeline upon SDR certification.'
  },
  {
    title: 'Slack Supervisor Alert',
    subtitle: 'notify.slack.webhook',
    category: 'notify' as const,
    icon: '💬',
    badge: 'Alert',
    desc: 'Dispatches real-time scorecards and audio recordings to floor supervisors.'
  },
  {
    title: 'Boris Softphone Auto-Dial',
    subtitle: 'telephony.boris.dial',
    category: 'crm' as const,
    icon: '📱',
    badge: 'Telephony',
    desc: 'Triggers outbound WebRTC dial or drops hot leads to floor queue.'
  }
];

export default function WorkflowAutomationStudio() {
  const [selectedPreset, setSelectedPreset] = useState<string>('wf-branching-cert');
  const [workflowTitle, setWorkflowTitle] = useState('⚡ Sparring ARM Rubric ➔ GHL Auto-Tag & Supervisor Escalation');
  const [isWorkflowActive, setIsWorkflowActive] = useState(true);

  // Canvas State
  const [nodes, setNodes] = useState<CanvasNode[]>(PRESET_WORKFLOWS['wf-branching-cert'].nodes);
  const [edges, setEdges] = useState<CanvasEdge[]>(PRESET_WORKFLOWS['wf-branching-cert'].edges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-2');

  // Canvas Viewport (Pan & Zoom)
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 20, y: 20 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Dragging Node State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, nodeX: 0, nodeY: 0 });

  // Execution Debug Runner
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentExecutingNodeId, setCurrentExecutingNodeId] = useState<string | null>(null);
  const [executionLogs, setExecutionLogs] = useState<Array<{ time: string; text: string; type: 'info' | 'success' | 'warn' }>>([]);
  const [activeBottomTab, setActiveBottomTab] = useState<'console' | 'executions' | 'payload'>('console');
  const [bottomDrawerOpen, setBottomDrawerOpen] = useState(true);

  // Add Node Modal Palette
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [nodeSearchQuery, setNodeSearchQuery] = useState('');
  const [nodeCategoryFilter, setNodeCategoryFilter] = useState<string>('all');

  // Node Config Drawer / Inspector
  const [configDrawerTab, setConfigDrawerTab] = useState<'parameters' | 'input' | 'output'>('parameters');
  const [testStepRunning, setTestStepRunning] = useState(false);

  // Switch presets
  const handleSelectPreset = (key: string) => {
    setSelectedPreset(key);
    const preset = PRESET_WORKFLOWS[key];
    if (preset) {
      setWorkflowTitle(preset.name);
      setNodes(preset.nodes);
      setEdges(preset.edges);
      setSelectedNodeId(preset.nodes[0]?.id || null);
      setPanOffset({ x: 20, y: 20 });
      setZoom(1);
    }
  };

  // Node Drag Handlers
  const handleNodeMouseDown = (e: React.MouseEvent, node: CanvasNode) => {
    e.stopPropagation();
    setSelectedNodeId(node.id);
    setDraggingNodeId(node.id);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      nodeX: node.x,
      nodeY: node.y
    };
  };

  // Canvas Pan Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y
      };
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingNodeId) {
        const dx = (e.clientX - dragStartRef.current.mouseX) / zoom;
        const dy = (e.clientY - dragStartRef.current.mouseY) / zoom;
        setNodes(prev => prev.map(n => {
          if (n.id === draggingNodeId) {
            return {
              ...n,
              x: Math.max(10, Math.round(dragStartRef.current.nodeX + dx)),
              y: Math.max(10, Math.round(dragStartRef.current.nodeY + dy))
            };
          }
          return n;
        }));
      } else if (isPanning) {
        setPanOffset({
          x: e.clientX - panStartRef.current.x,
          y: e.clientY - panStartRef.current.y
        });
      }
    };

    const handleMouseUp = () => {
      setDraggingNodeId(null);
      setIsPanning(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingNodeId, isPanning, zoom]);

  // Zoom Helpers
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.15, 1.8));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.15, 0.5));
  const handleZoomReset = () => {
    setZoom(1);
    setPanOffset({ x: 20, y: 20 });
  };

  // Execute Workflow Simulation with Live Step-by-Step Bezier Highlighting
  const handleExecuteWorkflow = () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setBottomDrawerOpen(true);
    setActiveBottomTab('console');
    
    // Reset node statuses
    setNodes(prev => prev.map(n => ({ ...n, status: 'idle' })));
    setEdges(prev => prev.map(e => ({ ...e, status: 'idle' })));
    setExecutionLogs([
      { time: new Date().toLocaleTimeString(), text: '🚀 [Runner] Initialized execution pipeline in sandboxed worker...', type: 'info' }
    ]);

    // Sequence of nodes
    const nodeSequence = nodes.map(n => n.id);
    let step = 0;

    const interval = setInterval(() => {
      if (step < nodeSequence.length) {
        const nodeId = nodeSequence[step];
        const targetNode = nodes.find(n => n.id === nodeId);
        setCurrentExecutingNodeId(nodeId);

        // Highlight node running
        setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, status: 'running' } : n));
        
        // Highlight incident edge
        setEdges(prev => prev.map(e => e.toNodeId === nodeId ? { ...e, status: 'running' } : e));

        setExecutionLogs(prev => [
          ...prev,
          {
            time: new Date().toLocaleTimeString(),
            text: `⚡ [${targetNode?.title}] Processing payload in 12ms (HTTP 200 OK)...`,
            type: 'info'
          }
        ]);

        // Complete step after brief pulse
        setTimeout(() => {
          setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, status: 'success', executionTime: `${Math.floor(Math.random() * 80 + 35)}ms` } : n));
          setEdges(prev => prev.map(e => e.toNodeId === nodeId ? { ...e, status: 'success' } : e));
        }, 350);

        step++;
      } else {
        clearInterval(interval);
        setIsExecuting(false);
        setCurrentExecutingNodeId(null);
        setExecutionLogs(prev => [
          ...prev,
          { time: new Date().toLocaleTimeString(), text: '✅ [Runner] Workflow completed successfully with 0 errors (Total runtime: 342ms)', type: 'success' }
        ]);
      }
    }, 700);
  };

  // Add a new node to canvas from palette
  const handleAddNodeToCanvas = (nodeTemplate: typeof AVAILABLE_NODES[0]) => {
    const newId = `node-${Date.now()}`;
    const maxX = nodes.reduce((max, n) => Math.max(max, n.x), 50);
    const newNode: CanvasNode = {
      id: newId,
      title: nodeTemplate.title,
      subtitle: nodeTemplate.subtitle,
      category: nodeTemplate.category,
      icon: nodeTemplate.icon,
      x: maxX + 280,
      y: 200 + (Math.random() * 60 - 30),
      hasDualOutputs: nodeTemplate.hasDualOutputs,
      status: 'idle',
      config: {
        systemPrompt: 'Default prompt template',
        temperature: 0.7
      },
      inputPayload: { sample: 'inbound_item' },
      outputPayload: { status: 'processed_ok' }
    };

    setNodes(prev => [...prev, newNode]);

    // Connect to currently selected node if any
    if (selectedNodeId) {
      const newEdge: CanvasEdge = {
        id: `edge-${selectedNodeId}-${newId}`,
        fromNodeId: selectedNodeId,
        fromPort: 'output',
        toNodeId: newId,
        toPort: 'input'
      };
      setEdges(prev => [...prev, newEdge]);
    }

    setSelectedNodeId(newId);
    setShowAddNodeModal(false);
  };

  // Delete selected node
  const handleDeleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.fromNodeId !== id && e.toNodeId !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  // Single-Step Test Execution in Inspector
  const handleTestSingleStep = () => {
    setTestStepRunning(true);
    setTimeout(() => {
      setTestStepRunning(false);
      setNodes(prev => prev.map(n => {
        if (n.id === selectedNodeId) {
          return {
            ...n,
            status: 'success',
            executionTime: '48ms',
            outputPayload: {
              ...n.outputPayload,
              testedAt: new Date().toISOString(),
              mockSuccess: true
            }
          };
        }
        return n;
      }));
    }, 600);
  };

  // Selected Node Object
  const selectedNode = useMemo(() => {
    return nodes.find(n => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  // Compute SVG Bezier Connecting Curves between Ports
  const renderedCurves = useMemo(() => {
    const NODE_WIDTH = 240;
    const NODE_HEIGHT = 100;

    return edges.map((edge) => {
      const fromNode = nodes.find(n => n.id === edge.fromNodeId);
      const toNode = nodes.find(n => n.id === edge.toNodeId);

      if (!fromNode || !toNode) return null;

      // Start point (right side of fromNode)
      let startX = fromNode.x + NODE_WIDTH;
      let startY = fromNode.y + NODE_HEIGHT / 2;

      if (fromNode.hasDualOutputs) {
        if (edge.fromPort === 'true') {
          startY = fromNode.y + 36;
        } else if (edge.fromPort === 'false') {
          startY = fromNode.y + 74;
        }
      }

      // End point (left side of toNode)
      const endX = toNode.x;
      const endY = toNode.y + NODE_HEIGHT / 2;

      // Cubic Bezier Curvature Calculation
      const dx = Math.max(Math.abs(endX - startX) * 0.5, 60);
      const pathData = `M ${startX} ${startY} C ${startX + dx} ${startY}, ${endX - dx} ${endY}, ${endX} ${endY}`;

      const isWireActive = edge.status === 'running' || edge.status === 'success';

      let wireStroke = '#9ca3af'; // default slate-400
      if (edge.fromPort === 'true') wireStroke = '#10b981'; // green for true branch
      if (edge.fromPort === 'false') wireStroke = '#ef4444'; // red for false branch
      if (isWireActive) wireStroke = '#ED1C24';

      return (
        <g key={edge.id}>
          {/* Background thick invisible hover line */}
          <path
            d={pathData}
            stroke="transparent"
            strokeWidth="16"
            fill="none"
            className="cursor-pointer"
          />

          {/* Glowing Shadow line when active */}
          {isWireActive && (
            <path
              d={pathData}
              stroke="#ED1C24"
              strokeWidth="6"
              strokeOpacity="0.3"
              fill="none"
              className="filter blur-xs"
            />
          )}

          {/* Main Bezier Wire */}
          <path
            d={pathData}
            stroke={wireStroke}
            strokeWidth={isWireActive ? '3' : '2'}
            strokeDasharray={edge.status === 'running' ? '6 6' : 'none'}
            fill="none"
            className={`transition-colors duration-200 ${edge.status === 'running' ? 'animate-dash' : ''}`}
          />

          {/* Animated Flow Pulse Particle during execution */}
          {edge.status === 'running' && (
            <circle r="4" fill="#ED1C24" className="animate-pulse">
              <animateMotion path={pathData} dur="0.8s" repeatCount="indefinite" />
            </circle>
          )}
        </g>
      );
    });
  }, [edges, nodes]);

  return (
    <div className="space-y-4 font-sans select-none">
      
      {/* 1. TOP N8N WORKFLOW HEADER BAR */}
      <div className="bg-white border border-[#222021]/15 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="h-10 w-10 rounded-xl bg-[#222021] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <Workflow className="h-5 w-5 text-[#ED1C24]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={workflowTitle}
                onChange={(e) => setWorkflowTitle(e.target.value)}
                className="font-black text-sm text-[#222021] bg-transparent hover:bg-stone-100 px-2 py-0.5 rounded-lg border border-transparent hover:border-[#222021]/15 focus:outline-none focus:bg-white focus:border-[#ED1C24] transition-all max-w-sm sm:max-w-md truncate"
              />
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-[#6b6968] font-bold border border-stone-200">
                v2.4
              </span>
            </div>
            <p className="text-xs text-[#6b6968] px-2">
              n8n-parity distributed execution graph with sandboxed BullMQ worker.
            </p>
          </div>
        </div>

        {/* Workflow Controls: Presets, Active Toggle, Execute Test */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Preset Selector */}
          <select
            value={selectedPreset}
            onChange={(e) => handleSelectPreset(e.target.value)}
            className="h-10 px-3 rounded-xl bg-stone-50 border border-[#222021]/15 text-xs font-semibold text-[#222021] focus:outline-none focus:ring-2 focus:ring-[#ED1C24] shadow-2xs cursor-pointer"
          >
            <option value="wf-branching-cert">Preset: Sparring ➔ GHL Auto-Tag (Branching IF)</option>
            <option value="wf-hot-transfer">Preset: Inbound Webhook ➔ Boris Softphone Dial</option>
          </select>

          {/* Active Switch */}
          <button
            onClick={() => setIsWorkflowActive(!isWorkflowActive)}
            className={`h-10 px-3.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all shadow-2xs cursor-pointer ${
              isWorkflowActive
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-stone-100 border-stone-300 text-stone-500'
            }`}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${isWorkflowActive ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
            <span>{isWorkflowActive ? 'Active' : 'Inactive'}</span>
          </button>

          {/* Add Node Button */}
          <button
            onClick={() => setShowAddNodeModal(true)}
            className="h-10 px-3.5 rounded-xl bg-[#222021] hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Node</span>
          </button>

          {/* Execute Workflow Button */}
          <button
            onClick={handleExecuteWorkflow}
            disabled={isExecuting}
            className="h-10 px-4 rounded-xl bg-[#ED1C24] hover:bg-[#d0181f] text-white font-extrabold text-xs flex items-center gap-2 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Play className={`h-4 w-4 fill-current ${isExecuting ? 'animate-spin' : ''}`} />
            <span>{isExecuting ? 'Running Graph...' : 'Test Workflow'}</span>
          </button>
        </div>
      </div>

      {/* 2. INFINITE / PAN-ZOOM WORKFLOW CANVAS */}
      <div className="relative w-full h-[640px] rounded-2xl border border-[#222021]/20 overflow-hidden shadow-inner bg-[#F7F6F3]">
        
        {/* Canvas Floating Top Controls (Zoom, Reset, Stats) */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <div className="bg-white/95 backdrop-blur-md border border-[#222021]/15 rounded-xl p-1 shadow-sm flex items-center gap-1 text-xs font-mono">
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1.5 rounded-lg hover:bg-stone-100 text-[#222021] transition-colors cursor-pointer"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="px-2 text-[11px] font-bold text-[#6b6968] min-w-[42px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1.5 rounded-lg hover:bg-stone-100 text-[#222021] transition-colors cursor-pointer"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <div className="h-4 w-px bg-stone-200 mx-0.5" />
            <button
              onClick={handleZoomReset}
              title="Fit View / Reset"
              className="p-1.5 rounded-lg hover:bg-stone-100 text-[#222021] transition-colors cursor-pointer"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-white/90 backdrop-blur-md border border-[#222021]/15 px-3 py-1.5 rounded-xl shadow-xs text-[11px] font-mono text-[#6b6968]">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>{nodes.length} Nodes</span>
            <span>&bull;</span>
            <span>{edges.length} Connections</span>
          </div>
        </div>

        {/* Canvas Surface with Dot-Grid Background and Transform */}
        <div 
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          className={`w-full h-full relative ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{
            backgroundImage: 'radial-gradient(#222021 1px, transparent 1px)',
            backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
            backgroundPosition: `${panOffset.x}px ${panOffset.y}px`
          }}
        >
          {/* Zoomed & Panned Group */}
          <div
            className="absolute top-0 left-0 w-full h-full transform-gpu origin-top-left"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`
            }}
          >
            {/* SVG Connecting Curves */}
            <svg 
              className="absolute top-0 left-0 w-[4000px] h-[4000px] pointer-events-none"
              style={{ overflow: 'visible' }}
            >
              <style>
                {`
                  @keyframes dash {
                    to {
                      stroke-dashoffset: -24;
                    }
                  }
                  .animate-dash {
                    animation: dash 0.6s linear infinite;
                  }
                `}
              </style>
              {renderedCurves}
            </svg>

            {/* Rendered Nodes on Canvas */}
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isRunning = node.status === 'running';
              const isSuccess = node.status === 'success';

              // Category Badge Theme
              const getCategoryStyle = (cat: string) => {
                switch(cat) {
                  case 'trigger': return { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-200' };
                  case 'ai': return { bg: 'bg-purple-600', text: 'text-purple-600', border: 'border-purple-200' };
                  case 'crm': return { bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-200' };
                  case 'logic': return { bg: 'bg-rose-500', text: 'text-rose-600', border: 'border-rose-200' };
                  case 'notify': return { bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-200' };
                  default: return { bg: 'bg-stone-700', text: 'text-stone-700', border: 'border-stone-200' };
                }
              };

              const style = getCategoryStyle(node.category);

              return (
                <div
                  key={node.id}
                  onMouseDown={(e) => handleNodeMouseDown(e, node)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNodeId(node.id);
                  }}
                  className={`absolute w-[240px] rounded-2xl bg-white border transition-shadow duration-150 select-none shadow-md ${
                    isSelected 
                      ? 'ring-2 ring-[#ED1C24] border-[#ED1C24] shadow-xl z-10' 
                      : 'border-[#222021]/15 hover:border-[#222021]/30 hover:shadow-lg z-1'
                  }`}
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    cursor: draggingNodeId === node.id ? 'grabbing' : 'grab'
                  }}
                >
                  {/* Left Input Port */}
                  <div 
                    title="Input Port"
                    className="absolute -left-2.5 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white border-2 border-[#222021] flex items-center justify-center hover:scale-125 transition-transform shadow-xs z-20 cursor-crosshair"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#222021]" />
                  </div>

                  {/* Right Output Port(s) */}
                  {!node.hasDualOutputs ? (
                    <div 
                      title="Output Port"
                      className="absolute -right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white border-2 border-[#ED1C24] flex items-center justify-center hover:scale-125 transition-transform shadow-xs z-20 cursor-crosshair"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#ED1C24]" />
                    </div>
                  ) : (
                    <>
                      {/* True Branch Port (Top Right) */}
                      <div 
                        title="Output True Branch"
                        className="absolute -right-2.5 top-[36px] -translate-y-1/2 h-5 w-5 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center hover:scale-125 transition-transform shadow-xs z-20 cursor-crosshair"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="absolute -left-8 text-[8px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1 rounded border border-emerald-200">
                          TRUE
                        </span>
                      </div>

                      {/* False Branch Port (Bottom Right) */}
                      <div 
                        title="Output False Branch"
                        className="absolute -right-2.5 top-[74px] -translate-y-1/2 h-5 w-5 rounded-full bg-white border-2 border-rose-500 flex items-center justify-center hover:scale-125 transition-transform shadow-xs z-20 cursor-crosshair"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        <span className="absolute -left-9 text-[8px] font-mono font-bold text-rose-600 bg-rose-50 px-1 rounded border border-rose-200">
                          FALSE
                        </span>
                      </div>
                    </>
                  )}

                  {/* Node Header */}
                  <div className="p-3 border-b border-[#222021]/10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`h-7 w-7 rounded-lg ${style.bg} text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-2xs`}>
                        {node.icon}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-[#222021] truncate leading-tight">
                          {node.title}
                        </h4>
                        <span className="text-[9px] font-mono text-[#6b6968] truncate block">
                          {node.subtitle}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {isRunning && (
                        <span className="h-4 w-4 rounded-full border-2 border-[#ED1C24] border-t-transparent animate-spin block" />
                      )}
                      {isSuccess && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      )}
                      {!isRunning && !isSuccess && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNode(node.id);
                          }}
                          className="text-stone-300 hover:text-rose-500 transition-colors p-0.5 cursor-pointer"
                          title="Delete Node"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Node Body / Summary Info */}
                  <div className="p-3 space-y-1.5 text-[10px] bg-stone-50/50 rounded-b-2xl">
                    <div className="flex items-center justify-between text-[#6b6968] font-mono">
                      <span>Payload:</span>
                      <span className="text-[#222021] font-semibold">1 item</span>
                    </div>

                    {node.executionTime && (
                      <div className="flex items-center justify-between text-[#6b6968] font-mono">
                        <span>Latency:</span>
                        <span className="text-emerald-700 font-bold">{node.executionTime}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. SLIDE-OUT NODE CONFIGURATION INSPECTOR (Right Side Drawer) */}
        {selectedNode && (
          <div className="absolute top-0 right-0 h-full w-full sm:w-[380px] bg-white border-l border-[#222021]/15 shadow-2xl flex flex-col z-30 animate-in slide-in-from-right duration-200">
            {/* Inspector Header */}
            <div className="p-4 border-b border-[#222021]/10 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl">{selectedNode.icon}</span>
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-[#222021] truncate">{selectedNode.title}</h3>
                  <span className="text-[10px] font-mono text-[#6b6968] truncate block">
                    {selectedNode.subtitle}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleTestSingleStep}
                  disabled={testStepRunning}
                  className="px-2.5 py-1 rounded-lg bg-[#222021] text-white text-[11px] font-bold hover:bg-black transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Test this node"
                >
                  <Play className={`h-3 w-3 fill-current ${testStepRunning ? 'animate-spin' : ''}`} />
                  <span>Test Step</span>
                </button>

                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="p-1 rounded-lg hover:bg-stone-200 text-[#6b6968] hover:text-[#222021] transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Inspector Navigation Tabs */}
            <div className="flex items-center border-b border-[#222021]/10 text-xs font-bold text-[#6b6968] bg-white px-4">
              <button
                onClick={() => setConfigDrawerTab('parameters')}
                className={`py-2.5 mr-4 transition-colors relative cursor-pointer ${
                  configDrawerTab === 'parameters' ? 'text-[#ED1C24]' : 'hover:text-[#222021]'
                }`}
              >
                Parameters
                {configDrawerTab === 'parameters' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ED1C24]" />}
              </button>

              <button
                onClick={() => setConfigDrawerTab('input')}
                className={`py-2.5 mr-4 transition-colors relative cursor-pointer ${
                  configDrawerTab === 'input' ? 'text-[#ED1C24]' : 'hover:text-[#222021]'
                }`}
              >
                Input (JSON)
                {configDrawerTab === 'input' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ED1C24]" />}
              </button>

              <button
                onClick={() => setConfigDrawerTab('output')}
                className={`py-2.5 transition-colors relative cursor-pointer ${
                  configDrawerTab === 'output' ? 'text-[#ED1C24]' : 'hover:text-[#222021]'
                }`}
              >
                Output (JSON)
                {configDrawerTab === 'output' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ED1C24]" />}
              </button>
            </div>

            {/* Inspector Body Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {configDrawerTab === 'parameters' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#222021] uppercase font-mono mb-1">
                      Node Name / Label
                    </label>
                    <input
                      type="text"
                      value={selectedNode.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, title: val } : n));
                      }}
                      className="w-full bg-stone-50 border border-[#222021]/15 rounded-xl px-3 py-2 text-xs font-semibold text-[#222021] focus:outline-none focus:border-[#ED1C24]"
                    />
                  </div>

                  {/* Node Specific Controls */}
                  {selectedNode.category === 'trigger' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#222021] uppercase font-mono mb-1">
                          Trigger Event Key
                        </label>
                        <select className="w-full bg-stone-50 border border-[#222021]/15 rounded-xl px-3 py-2 text-xs font-mono text-[#222021] focus:outline-none focus:border-[#ED1C24]">
                          <option>sparring.session.finished</option>
                          <option>certification.gate.passed</option>
                          <option>lead.inbound.created</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#222021] uppercase font-mono mb-1">
                          Persona Filter
                        </label>
                        <select className="w-full bg-stone-50 border border-[#222021]/15 rounded-xl px-3 py-2 text-xs text-[#222021]">
                          <option>All Sparring Personas (UK / US / AU)</option>
                          <option>BPO Directory Buyer (UK)</option>
                          <option>Cold Call Solar Gatekeeper (US)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {selectedNode.category === 'logic' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#222021] uppercase font-mono mb-1">
                          Benchmark Condition Rule
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            defaultValue="session.score"
                            className="bg-stone-50 border border-[#222021]/15 rounded-xl px-2 py-1.5 text-xs font-mono text-[#222021]"
                          />
                          <select className="bg-stone-50 border border-[#222021]/15 rounded-xl px-2 py-1.5 text-xs font-mono font-bold text-[#222021]">
                            <option>&gt;=</option>
                            <option>==</option>
                            <option>&lt;=</option>
                            <option>contains</option>
                          </select>
                          <input
                            type="number"
                            defaultValue={80}
                            className="bg-stone-50 border border-[#222021]/15 rounded-xl px-2 py-1.5 text-xs font-mono text-[#222021]"
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-[#6b6968]">
                        Evaluates to <strong>TRUE</strong> if Alex Mercer scores 80% or greater on the Boris ARM rubric.
                      </p>
                    </div>
                  )}

                  {selectedNode.category === 'crm' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#222021] uppercase font-mono mb-1">
                          CRM Integration Target
                        </label>
                        <select className="w-full bg-stone-50 border border-[#222021]/15 rounded-xl px-3 py-2 text-xs font-semibold text-[#222021]">
                          <option>GoHighLevel — Apex Global BPO Subaccount</option>
                          <option>HubSpot Private App — Outbound Q4</option>
                          <option>Salesforce Production Connected App</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#222021] uppercase font-mono mb-1">
                          Tag Applied Upon Qualification
                        </label>
                        <input
                          type="text"
                          defaultValue="AI_CERTIFIED_SDR"
                          className="w-full bg-stone-50 border border-[#222021]/15 rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#222021]"
                        />
                      </div>
                    </div>
                  )}

                  {selectedNode.category === 'ai' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#222021] uppercase font-mono mb-1">
                          BYOK Model Engine
                        </label>
                        <select className="w-full bg-stone-50 border border-[#222021]/15 rounded-xl px-3 py-2 text-xs font-mono text-[#222021]">
                          <option>claude-3-5-sonnet-20241022 (Anthropic BYOK)</option>
                          <option>gpt-4o-2024-08-06 (OpenAI BYOK)</option>
                          <option>gemini-1.5-pro (Google AI BYOK)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#222021] uppercase font-mono mb-1">
                          System Evaluation Prompt
                        </label>
                        <textarea
                          rows={4}
                          defaultValue="Analyze dialogue turns. Generate 3 bullet points highlighting objection handling hesitation and confidence delivery."
                          className="w-full bg-stone-50 border border-[#222021]/15 rounded-xl p-2.5 text-xs text-[#222021] font-mono leading-relaxed resize-none focus:outline-none focus:border-[#ED1C24]"
                        />
                      </div>
                    </div>
                  )}

                  {selectedNode.category === 'notify' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#222021] uppercase font-mono mb-1">
                          Slack Floor Webhook
                        </label>
                        <input
                          type="text"
                          defaultValue="#floor-supervisors-live"
                          className="w-full bg-stone-50 border border-[#222021]/15 rounded-xl px-3 py-2 text-xs font-mono text-[#222021]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#222021] uppercase font-mono mb-1">
                          Message Markdown Template
                        </label>
                        <textarea
                          rows={3}
                          defaultValue="🎉 *Rep {{repName}}* passed Boris 80% Benchmark! Score: {{score}}%. Contact tagged in CRM."
                          className="w-full bg-stone-50 border border-[#222021]/15 rounded-xl p-2.5 text-xs text-[#222021] font-mono resize-none focus:outline-none focus:border-[#ED1C24]"
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-[#222021]/10 flex items-center justify-between">
                    <button
                      onClick={() => handleDeleteNode(selectedNode.id)}
                      className="text-rose-600 hover:text-rose-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete Node</span>
                    </button>

                    <button
                      onClick={() => setSelectedNodeId(null)}
                      className="px-4 py-1.5 rounded-xl bg-[#222021] hover:bg-black text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}

              {configDrawerTab === 'input' && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-[#6b6968] uppercase block">Incoming Item 1 of 1</span>
                  <pre className="p-3 bg-stone-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto border border-stone-800 leading-relaxed">
                    {JSON.stringify(selectedNode.inputPayload || { error: 'No input payload captured yet' }, null, 2)}
                  </pre>
                </div>
              )}

              {configDrawerTab === 'output' && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-[#6b6968] uppercase block">Executed Result Output</span>
                  <pre className="p-3 bg-stone-900 text-cyan-300 font-mono text-[11px] rounded-xl overflow-x-auto border border-stone-800 leading-relaxed">
                    {JSON.stringify(selectedNode.outputPayload || { status: 'ready' }, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. BOTTOM COLLAPSIBLE LOGS & DATA DRAWER (n8n Real-Time Execution Console) */}
      <div className="bg-white border border-[#222021]/15 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-3 bg-stone-50 border-b border-[#222021]/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setBottomDrawerOpen(!bottomDrawerOpen)}
              className="p-1 rounded-lg hover:bg-stone-200 text-[#6b6968] transition-colors cursor-pointer"
            >
              <ChevronDown className={`h-4 w-4 transform transition-transform ${bottomDrawerOpen ? '' : '-rotate-90'}`} />
            </button>

            <div className="flex items-center gap-4 text-xs font-bold text-[#6b6968]">
              <button
                onClick={() => setActiveBottomTab('console')}
                className={`flex items-center gap-1.5 cursor-pointer ${activeBottomTab === 'console' ? 'text-[#222021]' : 'hover:text-[#222021]'}`}
              >
                <Terminal className="h-3.5 w-3.5 text-[#ED1C24]" />
                <span>Execution Console</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-200 text-[#222021] font-mono">
                  {executionLogs.length}
                </span>
              </button>

              <button
                onClick={() => setActiveBottomTab('executions')}
                className={`flex items-center gap-1.5 cursor-pointer ${activeBottomTab === 'executions' ? 'text-[#222021]' : 'hover:text-[#222021]'}`}
              >
                <Activity className="h-3.5 w-3.5 text-blue-600" />
                <span>Recent Runs (SLA 99.98%)</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => setExecutionLogs([])}
            className="text-[11px] font-mono text-[#6b6968] hover:text-[#222021] transition-colors cursor-pointer"
          >
            Clear Console
          </button>
        </div>

        {bottomDrawerOpen && (
          <div className="p-3 bg-stone-950 font-mono text-xs text-stone-200 max-h-48 overflow-y-auto">
            {activeBottomTab === 'console' && (
              <div className="space-y-1">
                {executionLogs.length === 0 ? (
                  <p className="text-stone-500 italic py-2">
                    Click &ldquo;Test Workflow&rdquo; above to run sandboxed execution and stream live step-by-step logs...
                  </p>
                ) : (
                  executionLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-stone-500 text-[10px] shrink-0">{log.time}</span>
                      <span className={`${log.type === 'success' ? 'text-emerald-400 font-bold' : log.type === 'warn' ? 'text-amber-400' : 'text-stone-300'}`}>
                        {log.text}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeBottomTab === 'executions' && (
              <div className="divide-y divide-stone-800 text-[11px]">
                {[
                  { id: 'exec_9901', trigger: 'Sparring Call Finished (Alex Mercer)', time: '2 mins ago', duration: '342ms', status: 'Success' },
                  { id: 'exec_9902', trigger: 'Certification Passed (Elena Rostova)', time: '18 mins ago', duration: '512ms', status: 'Success' },
                  { id: 'exec_9903', trigger: 'Sparring Call Finished (Marcus Brody)', time: '34 mins ago', duration: '290ms', status: 'Success' },
                  { id: 'exec_9904', trigger: 'Webhook Inbound (Lead Created)', time: '1 hour ago', duration: '184ms', status: 'Success' },
                ].map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between text-stone-300">
                    <span className="font-bold text-white">{item.id}</span>
                    <span className="text-stone-400 font-sans">{item.trigger}</span>
                    <span className="text-stone-500">{item.time}</span>
                    <span className="text-cyan-400">{item.duration}</span>
                    <span className="text-emerald-400 font-bold">{item.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. ADD NODE PALETTE MODAL (n8n Style Flyout Menu) */}
      {showAddNodeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#222021]/20 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#222021]/10 pb-3">
              <div>
                <h3 className="text-base font-black text-[#222021]">Add Node to Workflow Canvas</h3>
                <p className="text-xs text-[#6b6968]">Select from 50+ event triggers, AI reasoning models, CRM sync, and logic routers.</p>
              </div>
              <button
                onClick={() => setShowAddNodeModal(false)}
                className="text-[#6b6968] hover:text-[#222021] p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search & Category Filter */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                placeholder="Search nodes (e.g. Claude, GHL, Webhook, IF Condition)..."
                value={nodeSearchQuery}
                onChange={(e) => setNodeSearchQuery(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-stone-50 border border-[#222021]/15 text-xs font-semibold text-[#222021] focus:outline-none focus:border-[#ED1C24]"
                autoFocus
              />

              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto shrink-0">
                {['all', 'trigger', 'ai', 'crm', 'logic', 'notify'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setNodeCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-colors whitespace-nowrap cursor-pointer ${
                      nodeCategoryFilter === cat 
                        ? 'bg-[#222021] text-white' 
                        : 'bg-stone-100 text-[#6b6968] hover:text-[#222021]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Nodes Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pt-1">
              {AVAILABLE_NODES
                .filter(n => {
                  const matchSearch = n.title.toLowerCase().includes(nodeSearchQuery.toLowerCase()) || 
                                      n.desc.toLowerCase().includes(nodeSearchQuery.toLowerCase()) ||
                                      n.subtitle.toLowerCase().includes(nodeSearchQuery.toLowerCase());
                  const matchCat = nodeCategoryFilter === 'all' || n.category === nodeCategoryFilter;
                  return matchSearch && matchCat;
                })
                .map((nodeTemplate, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleAddNodeToCanvas(nodeTemplate)}
                    className="p-3.5 rounded-xl border border-[#222021]/10 bg-white hover:border-[#ED1C24] hover:shadow-md transition-all cursor-pointer flex items-start gap-3 group"
                  >
                    <div className="h-9 w-9 rounded-xl bg-stone-100 group-hover:bg-[#ED1C24]/10 text-xl flex items-center justify-center shrink-0 transition-colors">
                      {nodeTemplate.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-bold text-xs text-[#222021] group-hover:text-[#ED1C24] transition-colors truncate">
                          {nodeTemplate.title}
                        </h4>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 font-semibold shrink-0">
                          {nodeTemplate.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6b6968] mt-0.5 line-clamp-2 leading-tight">
                        {nodeTemplate.desc}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
