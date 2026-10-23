'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  Play,
  Plus,
  Clock,
  Save,
  CheckCircle2,
  Workflow,
  Sparkles,
  RefreshCw,
  Sliders,
  ChevronDown,
  Layers,
  ArrowRight
} from 'lucide-react';

import { WorkflowCanvasNode } from '../canvas/WorkflowCanvasNode';
import AddNodeModal from '../palette/AddNodeModal';
import NodeConfigDrawer from '../panels/NodeConfigDrawer';
import ExecutionHistoryDrawer from '../panels/ExecutionHistoryDrawer';
import { INodeDefinition } from '@/registry';

const nodeTypes = {
  customNode: WorkflowCanvasNode
};

export default function WorkflowAutomationStudio() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string>('wf-arm-rubric');
  const [currentWorkflow, setCurrentWorkflow] = useState<any>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const [isAddNodeOpen, setIsAddNodeOpen] = useState(false);
  const [configNodeId, setConfigNodeId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [runSuccess, setRunSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch workflows from backend API
  const loadWorkflows = useCallback(async () => {
    try {
      const res = await fetch('/api/workflows');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setWorkflows(data.data);
        const active = data.data.find((w: any) => w.id === activeWorkflowId) || data.data[0];
        setActiveWorkflowId(active.id);
        setCurrentWorkflow(active);
        setNodes(active.nodes || []);
        setEdges(active.edges || []);
      }
    } catch (err) {
      console.error('Failed to load workflows:', err);
    }
  }, [activeWorkflowId, setNodes, setEdges]);

  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  // Keyboard shortcut: '/' opens the Add Node modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only when not focused on an input/textarea
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (e.key === '/') {
        e.preventDefault();
        setIsAddNodeOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle edge connection
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            animated: true,
            style: { stroke: '#ED1C24', strokeWidth: 2 }
          },
          eds
        )
      );
    },
    [setEdges]
  );

  // Handle opening node configuration drawer
  const handleOpenConfig = useCallback((nodeId: string) => {
    setConfigNodeId(nodeId);
  }, []);

  // Handle node deletion
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      if (configNodeId === nodeId) setConfigNodeId(null);
    },
    [configNodeId, setNodes, setEdges]
  );

  // Inject callbacks into node data
  const processedNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onOpenConfig: handleOpenConfig,
        onDelete: handleDeleteNode
      }
    }));
  }, [nodes, handleOpenConfig, handleDeleteNode]);

  // Switch active workflow preset
  const handleSelectWorkflow = (wfId: string) => {
    const wf = workflows.find((w) => w.id === wfId);
    if (wf) {
      setActiveWorkflowId(wf.id);
      setCurrentWorkflow(wf);
      setNodes(wf.nodes || []);
      setEdges(wf.edges || []);
      setConfigNodeId(null);
    }
  };

  // Add new node from palette
  const handleAddNode = (def: INodeDefinition) => {
    const newId = `node-${Date.now().toString().slice(-4)}`;
    // Position node nicely on canvas
    const x = 200 + (nodes.length % 4) * 280;
    const y = 140 + Math.floor(nodes.length / 4) * 160;

    const newNode: Node = {
      id: newId,
      type: 'customNode',
      position: { x, y },
      data: {
        nodeType: def.name,
        label: def.displayName,
        category: def.category,
        icon: def.icon,
        config: def.properties.reduce((acc, p) => ({ ...acc, [p.name]: p.default }), {})
      }
    };

    setNodes((nds) => [...nds, newNode]);
    setConfigNodeId(newId);
  };

  // Save current workflow graph
  const handleSaveWorkflow = async () => {
    if (!currentWorkflow) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/workflows/${currentWorkflow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentWorkflow,
          nodes,
          edges
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsSaving(false);
      }
    } catch (err) {
      console.error('Failed to save workflow:', err);
      setIsSaving(false);
    }
  };

  // Execute workflow
  const handleRunWorkflow = async () => {
    if (!currentWorkflow) return;
    setIsRunning(true);
    setRunSuccess(false);

    // Set all nodes to running state visually
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, status: 'running' }
      }))
    );

    try {
      // Save latest state first
      await fetch(`/api/workflows/${currentWorkflow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentWorkflow,
          nodes,
          edges
        })
      });

      // Call execution endpoint
      const res = await fetch(`/api/workflows/${currentWorkflow.id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerSource: 'manual' })
      });

      const data = await res.json();
      if (data.success) {
        setRunSuccess(true);
        // Update nodes with success status and timings
        const traces = data.data.nodeOutputs || {};
        setNodes((nds) =>
          nds.map((n) => {
            const trace = traces[n.id];
            return {
              ...n,
              data: {
                ...n.data,
                status: trace?.status || 'success',
                executionTimeMs: trace?.executionTimeMs || 42
              }
            };
          })
        );
        setTimeout(() => setRunSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Execution failed:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const selectedNode = nodes.find((n) => n.id === configNodeId);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
      {/* Top Studio Action Bar */}
      <div className="p-3.5 border-b border-stone-200 bg-white flex flex-wrap items-center justify-between gap-3">
        {/* Left: Workflow Selector & Name */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-rose-50 text-[#ED1C24] flex items-center justify-center font-bold">
            <Workflow className="h-5 w-5" />
          </div>

          <div className="relative">
            <select
              value={activeWorkflowId}
              onChange={(e) => handleSelectWorkflow(e.target.value)}
              className="appearance-none pr-8 pl-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 border border-stone-200 text-xs font-bold text-stone-900 focus:outline-none cursor-pointer"
            >
              {workflows.map((wf) => (
                <option key={wf.id} value={wf.id}>
                  {wf.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-500 pointer-events-none" />
          </div>

          <span className="hidden sm:inline-block text-[11px] text-stone-400 font-mono">
            {nodes.length} nodes • {edges.length} connections
          </span>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Add Node Button */}
          <button
            onClick={() => setIsAddNodeOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4 text-[#ED1C24]" />
            <span>Add Node</span>
            <kbd className="hidden sm:inline-block ml-1 px-1 py-0.2 rounded bg-stone-200 text-[10px] text-stone-500 font-mono">
              /
            </kbd>
          </button>

          {/* Execution History */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Execution History</span>
          </button>

          {/* Save Workflow */}
          <button
            onClick={handleSaveWorkflow}
            disabled={isSaving}
            className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>

          {/* Run Workflow CTA */}
          <button
            onClick={handleRunWorkflow}
            disabled={isRunning}
            className="px-4 py-1.5 rounded-xl bg-[#ED1C24] hover:bg-[#d0181f] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Executing DAG...</span>
              </>
            ) : runSuccess ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Workflow Succeeded!</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Run Workflow</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={processedNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          defaultEdgeOptions={{
            animated: true,
            style: { stroke: '#ED1C24', strokeWidth: 2 }
          }}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1.2} color="#e5e5e5" />
          <Controls position="bottom-left" />
          <MiniMap
            position="bottom-right"
            nodeColor={(n) => {
              if (n.data?.category === 'Triggers') return '#fbbf24';
              if (n.data?.category === 'Logic & Flow') return '#60a5fa';
              if (n.data?.category === 'App Integrations') return '#c084fc';
              if (n.data?.category === 'AI & LLMs') return '#e879f9';
              if (n.data?.category === 'Model Context Protocol (MCP)') return '#22d3ee';
              return '#34d399';
            }}
            className="!rounded-2xl !border !border-stone-200 !shadow-sm overflow-hidden"
          />
        </ReactFlow>
      </div>

      {/* Add Node Palette Modal */}
      <AddNodeModal
        isOpen={isAddNodeOpen}
        onClose={() => setIsAddNodeOpen(false)}
        onSelectNode={handleAddNode}
      />

      {/* Node Config Drawer */}
      <NodeConfigDrawer
        nodeId={configNodeId}
        workflowId={activeWorkflowId}
        initialNodeData={selectedNode?.data}
        onClose={() => setConfigNodeId(null)}
        onSaveConfig={(id, updatedConfig, updatedLabel) => {
          setNodes((nds) =>
            nds.map((n) => {
              if (n.id === id) {
                return {
                  ...n,
                  data: {
                    ...n.data,
                    config: updatedConfig,
                    label: updatedLabel || n.data.label
                  }
                };
              }
              return n;
            })
          );
        }}
      />

      {/* Execution History Drawer */}
      <ExecutionHistoryDrawer
        isOpen={isHistoryOpen}
        workflowId={activeWorkflowId}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
}
