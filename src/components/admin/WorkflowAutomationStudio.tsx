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
  ChevronDown,
  ChevronRight,
  Folder,
  FolderPlus,
  Copy,
  FolderInput,
  Edit,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
  RotateCcw,
  RotateCw,
  Share2,
  MoreHorizontal,
  Tag,
  User,
  Zap,
  ArrowLeft
} from 'lucide-react';

import { WorkflowCanvasNode } from '../canvas/WorkflowCanvasNode';
import AddNodeModal from '../palette/AddNodeModal';
import NodeConfigDrawer from '../panels/NodeConfigDrawer';
import ExecutionHistoryDrawer from '../panels/ExecutionHistoryDrawer';
import ProjectModal from '../panels/ProjectManagerModal';
import {
  MoveWorkflowModal,
  DuplicateWorkflowModal,
  WorkflowSettingsModal
} from '../panels/WorkflowActionModals';
import { INodeDefinition } from '@/registry';
import { ProjectFolderRecord, WorkflowRecord } from '@/lib/db';

const nodeTypes = {
  customNode: WorkflowCanvasNode
};

interface WorkflowAutomationStudioProps {
  initialWorkflowId?: string;
  onBackToList?: () => void;
}

export default function WorkflowAutomationStudio({
  initialWorkflowId,
  onBackToList
}: WorkflowAutomationStudioProps) {
  const [projects, setProjects] = useState<ProjectFolderRecord[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowRecord[]>([]);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string>(
    initialWorkflowId || 'wf-voice-chatbot'
  );
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowRecord | null>(null);

  // View Mode: 'Editor' vs 'Executions' (matching n8n top center pill)
  const [viewMode, setViewMode] = useState<'editor' | 'executions'>('editor');

  // React Flow state - STRICTLY STATIC connecting lines (animated: false)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // UI Drawer & Modal States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Collapsed by default for clean canvas
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'proj-voice': true,
    'proj-qa': true,
    'proj-telephony': true,
    ungrouped: true
  });

  const [isAddNodeOpen, setIsAddNodeOpen] = useState(false);
  const [configNodeId, setConfigNodeId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [runSuccess, setRunSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Project modal states
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectFolderRecord | null>(null);

  // Workflow Action modals
  const [movingWorkflow, setMovingWorkflow] = useState<WorkflowRecord | null>(null);
  const [duplicatingWorkflow, setDuplicatingWorkflow] = useState<WorkflowRecord | null>(null);
  const [settingsWorkflow, setSettingsWorkflow] = useState<WorkflowRecord | null>(null);

  // Load Projects & Workflows from API
  const refreshData = useCallback(async () => {
    try {
      const [projRes, wfRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/workflows')
      ]);
      const projData = await projRes.json();
      const wfData = await wfRes.json();

      if (projData.success) {
        setProjects(projData.data);
      }
      if (wfData.success && wfData.data.length > 0) {
        setWorkflows(wfData.data);

        // Find active (default to VoiceChatbot if available)
        const matched =
          wfData.data.find((w: WorkflowRecord) => w.id === activeWorkflowId) ||
          wfData.data.find((w: WorkflowRecord) => w.id === 'wf-voice-chatbot') ||
          wfData.data[0];

        setActiveWorkflowId(matched.id);
        setCurrentWorkflow(matched);
        setNodes(matched.nodes || []);
        // STATIC connecting lines: animated: false, clean neutral gray
        setEdges(
          (matched.edges || []).map((e: Edge) => ({
            ...e,
            animated: false,
            style: { stroke: '#475569', strokeWidth: 2 }
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load project/workflow data:', err);
    }
  }, [activeWorkflowId, setNodes, setEdges]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Sync initialWorkflowId if prop changes
  useEffect(() => {
    if (initialWorkflowId && initialWorkflowId !== activeWorkflowId) {
      setActiveWorkflowId(initialWorkflowId);
    }
  }, [initialWorkflowId, activeWorkflowId]);

  // Keyboard shortcut: '/' opens the Add Node modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  // Connect edges statically (no animation)
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            animated: false,
            style: { stroke: '#475569', strokeWidth: 2 }
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const handleOpenConfig = useCallback((nodeId: string) => {
    setConfigNodeId(nodeId);
  }, []);

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      if (configNodeId === nodeId) setConfigNodeId(null);
    },
    [configNodeId, setNodes, setEdges]
  );

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

  const handleSelectWorkflow = (wf: WorkflowRecord) => {
    setActiveWorkflowId(wf.id);
    setCurrentWorkflow(wf);
    setNodes(wf.nodes || []);
    setEdges(
      (wf.edges || []).map((e: Edge) => ({
        ...e,
        animated: false,
        style: { stroke: '#475569', strokeWidth: 2 }
      }))
    );
    setConfigNodeId(null);
  };

  const handleAddNode = (def: INodeDefinition) => {
    const newId = `node-${Date.now().toString().slice(-4)}`;
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
          edges: edges.map((e) => ({ ...e, animated: false }))
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsSaving(false);
        setWorkflows((prev) => prev.map((w) => (w.id === currentWorkflow.id ? data.data : w)));
        setCurrentWorkflow(data.data);
      }
    } catch (err) {
      console.error('Failed to save workflow:', err);
      setIsSaving(false);
    }
  };

  // Run Workflow (CTA button like in n8n screenshot)
  const handleRunWorkflow = async () => {
    if (!currentWorkflow) return;
    setIsRunning(true);
    setRunSuccess(false);

    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, status: 'running' }
      }))
    );

    try {
      await fetch(`/api/workflows/${currentWorkflow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentWorkflow,
          nodes,
          edges: edges.map((e) => ({ ...e, animated: false }))
        })
      });

      const res = await fetch(`/api/workflows/${currentWorkflow.id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerSource: 'manual' })
      });

      const data = await res.json();
      if (data.success) {
        setRunSuccess(true);
        const traces = data.data.nodeOutputs || {};
        setNodes((nds) =>
          nds.map((n) => {
            const trace = traces[n.id];
            return {
              ...n,
              data: {
                ...n.data,
                status: trace?.status || 'success',
                executionTimeMs: trace?.executionTimeMs || 28
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

  const handleToggleActive = async () => {
    if (!currentWorkflow) return;
    const nextState = !currentWorkflow.active;
    setCurrentWorkflow({ ...currentWorkflow, active: nextState });
    await fetch(`/api/workflows/${currentWorkflow.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: nextState })
    });
  };

  // Project Folder Operations
  const handleSaveProject = async (projectData: { id?: string; name: string; description?: string; color: string }) => {
    if (projectData.id) {
      const res = await fetch(`/api/projects/${projectData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      const data = await res.json();
      if (data.success) {
        setProjects((prev) => prev.map((p) => (p.id === projectData.id ? data.data : p)));
      }
    } else {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      const data = await res.json();
      if (data.success) {
        setProjects((prev) => [...prev, data.data]);
        setExpandedFolders((prev) => ({ ...prev, [data.data.id]: true }));
      }
    }
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (window.confirm(`Delete project folder "${projectName}"? Workflows will be moved to Ungrouped.`)) {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
        setWorkflows((prev) =>
          prev.map((w) => (w.folderId === projectId ? { ...w, folderId: undefined } : w))
        );
      }
    }
  };

  const handleCreateNewWorkflow = async (targetFolderId?: string) => {
    const newName = `New Workflow ${workflows.length + 1}`;
    const res = await fetch('/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newName,
        folderId: targetFolderId,
        nodes: [
          {
            id: 'node-1',
            type: 'customNode',
            position: { x: 100, y: 160 },
            data: {
              nodeType: 'webhookTrigger',
              label: 'Listen',
              category: 'Triggers',
              icon: 'Webhook',
              isTriggerPill: true,
              config: { path: `hook-${Date.now().toString().slice(-4)}`, httpMethod: 'POST' }
            }
          }
        ],
        edges: []
      })
    });
    const data = await res.json();
    if (data.success) {
      setWorkflows((prev) => [data.data, ...prev]);
      handleSelectWorkflow(data.data);
    }
  };

  const handleDuplicateWorkflow = async (workflowId: string, newName: string, folderId?: string) => {
    const res = await fetch(`/api/workflows/${workflowId}/duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, folderId })
    });
    const data = await res.json();
    if (data.success) {
      setWorkflows((prev) => [data.data, ...prev]);
      handleSelectWorkflow(data.data);
    }
  };

  const handleMoveWorkflow = async (workflowId: string, targetFolderId?: string) => {
    const res = await fetch(`/api/workflows/${workflowId}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folderId: targetFolderId })
    });
    const data = await res.json();
    if (data.success) {
      setWorkflows((prev) =>
        prev.map((w) => (w.id === workflowId ? { ...w, folderId: targetFolderId } : w))
      );
      if (currentWorkflow?.id === workflowId) {
        setCurrentWorkflow({ ...currentWorkflow, folderId: targetFolderId });
      }
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    const res = await fetch(`/api/workflows/${workflowId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      const remaining = workflows.filter((w) => w.id !== workflowId);
      setWorkflows(remaining);
      if (activeWorkflowId === workflowId && remaining.length > 0) {
        handleSelectWorkflow(remaining[0]);
      }
    }
  };

  const toggleFolder = (folderKey: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderKey]: !prev[folderKey] }));
  };

  const selectedNode = nodes.find((n) => n.id === configNodeId);
  const currentProject = projects.find((p) => p.id === currentWorkflow?.folderId);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full bg-[#fbfbfb] rounded-2xl border border-stone-200 overflow-hidden shadow-2xs font-sans antialiased text-stone-900">
      {/* n8n Signature Top Header Bar (Matching screenshot exactly) */}
      <div className="h-14 px-4 border-b border-stone-200 bg-white flex items-center justify-between shrink-0">
        {/* Left: Project / Workflow Breadcrumb */}
        <div className="flex items-center gap-2.5">
          {onBackToList && (
            <button
              onClick={onBackToList}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 text-xs font-bold transition-all shadow-2xs mr-1 cursor-pointer"
              title="Return to Workflow List"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Workflow List</span>
            </button>
          )}

          <button
            onClick={() => setIsSidebarOpen((v) => !v)}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            title="Toggle Projects & Folders Navigation"
          >
            {isSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </button>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="flex items-center gap-1 text-stone-500 font-medium">
              <User className="h-3.5 w-3.5" />
              <span>{currentProject?.name || 'Personal'}</span>
            </span>
            <span className="text-stone-400">/</span>
            <span
              onClick={() => setSettingsWorkflow(currentWorkflow)}
              className="font-bold text-stone-900 hover:text-[#ED1C24] transition-colors cursor-pointer"
            >
              {currentWorkflow?.name || 'VoiceChatbot'}
            </span>
          </div>

          <button
            onClick={() => setSettingsWorkflow(currentWorkflow)}
            className="text-[11px] font-medium text-stone-400 hover:text-stone-700 flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-stone-100 transition-colors"
          >
            <Tag className="h-3 w-3" />
            <span>+ Add tag</span>
          </button>
        </div>

        {/* Center: Editor / Executions Tab Pill */}
        <div className="flex items-center bg-stone-100 p-0.5 rounded-lg text-xs font-semibold">
          <button
            onClick={() => {
              setViewMode('editor');
              setIsHistoryOpen(false);
            }}
            className={`px-3 py-1 rounded-md transition-all ${
              viewMode === 'editor' && !isHistoryOpen
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Editor
          </button>
          <button
            onClick={() => {
              setViewMode('executions');
              setIsHistoryOpen(true);
            }}
            className={`px-3 py-1 rounded-md transition-all ${
              isHistoryOpen || viewMode === 'executions'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Executions
          </button>
        </div>

        {/* Right: Inactive toggle, Share, Save button, undo/redo */}
        <div className="flex items-center gap-2">
          {/* Active / Inactive switch */}
          <div className="flex items-center gap-2 pr-2 border-r border-stone-200">
            <span className="text-xs text-stone-500 font-medium">
              {currentWorkflow?.active ? 'Active' : 'Inactive'}
            </span>
            <button
              onClick={handleToggleActive}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                currentWorkflow?.active ? 'bg-emerald-500' : 'bg-stone-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  currentWorkflow?.active ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Share */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Workflow sharing link copied to clipboard!');
            }}
            className="px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
          >
            Share
          </button>

          {/* Save Button */}
          <button
            onClick={handleSaveWorkflow}
            disabled={isSaving}
            className="px-4 py-1.5 rounded-lg bg-[#ED1C24] hover:bg-[#d0181f] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>

          {/* Undo / Redo */}
          <button className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md">
            <RotateCcw className="h-4 w-4" />
          </button>
          <button className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md">
            <RotateCw className="h-4 w-4" />
          </button>

          {/* More options */}
          <button
            onClick={() => setSettingsWorkflow(currentWorkflow)}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 w-full h-full relative flex overflow-hidden">
        {/* Left Project / Folder Navigator Sidebar */}
        {isSidebarOpen && (
          <aside className="w-72 border-r border-stone-200 bg-white flex flex-col shrink-0 overflow-hidden animate-in slide-in-from-left duration-200 z-10">
            <div className="p-3 border-b border-stone-100 flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800">Projects & Folders</span>
              <button
                onClick={() => {
                  setEditingProject(null);
                  setIsProjectModalOpen(true);
                }}
                className="px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <FolderPlus className="h-3.5 w-3.5" />
                <span>New</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {projects.map((proj) => {
                const isExpanded = expandedFolders[proj.id] ?? true;
                const folderWorkflows = workflows.filter((w) => w.folderId === proj.id);

                return (
                  <div key={proj.id} className="rounded-xl border border-stone-200 bg-white overflow-hidden">
                    <div className="p-2 bg-stone-50 hover:bg-stone-100 flex items-center justify-between gap-1 border-b border-stone-100">
                      <div
                        onClick={() => toggleFolder(proj.id)}
                        className="flex items-center gap-1.5 min-w-0 flex-1 cursor-pointer select-none text-xs font-bold text-stone-800"
                      >
                        <span className="text-stone-400">
                          {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        </span>
                        <span className="truncate">{proj.name}</span>
                        <span className="text-[10px] text-stone-400 font-mono">({folderWorkflows.length})</span>
                      </div>

                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => handleCreateNewWorkflow(proj.id)}
                          className="p-1 rounded text-stone-400 hover:text-stone-800"
                          title="New Workflow"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingProject(proj);
                            setIsProjectModalOpen(true);
                          }}
                          className="p-1 rounded text-stone-400 hover:text-stone-800"
                          title="Edit Folder"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(proj.id, proj.name)}
                          className="p-1 rounded text-stone-400 hover:text-rose-600"
                          title="Delete Folder"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-1 space-y-0.5">
                        {folderWorkflows.map((wf) => {
                          const isSelected = activeWorkflowId === wf.id;
                          return (
                            <div
                              key={wf.id}
                              onClick={() => handleSelectWorkflow(wf)}
                              className={`group p-2 rounded-lg flex items-center justify-between text-xs cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-stone-100 text-stone-900 font-bold'
                                  : 'hover:bg-stone-50 text-stone-600'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate flex-1">
                                <span className={`h-1.5 w-1.5 rounded-full ${wf.active ? 'bg-emerald-500' : 'bg-stone-300'}`} />
                                <span className="truncate">{wf.name}</span>
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDuplicatingWorkflow(wf);
                                  }}
                                  className="text-stone-400 hover:text-stone-700"
                                  title="Duplicate"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMovingWorkflow(wf);
                                  }}
                                  className="text-stone-400 hover:text-stone-700"
                                  title="Move"
                                >
                                  <FolderInput className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        {/* React Flow Canvas: Pure white, minimalist, static lines */}
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
              animated: false,
              style: { stroke: '#475569', strokeWidth: 2 }
            }}
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e2e8f0" />
            <Controls position="bottom-left" />
            <MiniMap
              position="bottom-right"
              nodeColor={() => '#cbd5e1'}
              className="!rounded-xl !border !border-stone-200 !shadow-xs overflow-hidden"
            />
          </ReactFlow>

          {/* Floating "+ Add Node" button on top-left of canvas */}
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={() => setIsAddNodeOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 shadow-xs text-xs font-bold text-stone-800 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Node</span>
              <kbd className="text-[10px] bg-stone-100 px-1 py-0.2 rounded font-mono text-stone-400">/</kbd>
            </button>
          </div>

          {/* Floating Bottom Center CTA: "Execute workflow" (Matching n8n screenshot) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
            <button
              onClick={handleRunWorkflow}
              disabled={isRunning}
              className="px-6 py-2.5 rounded-xl bg-[#ED1C24] hover:bg-[#d0181f] text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Executing workflow...</span>
                </>
              ) : runSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Workflow Executed!</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 fill-current" />
                  <span>Execute workflow</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Add Node Palette Modal */}
      <AddNodeModal
        isOpen={isAddNodeOpen}
        onClose={() => setIsAddNodeOpen(false)}
        onSelectNode={handleAddNode}
      />

      {/* Node Config Drawer (Exact n8n Node Details replica) */}
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

      {/* Project Folder Modals */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        initialProject={editingProject}
        onSave={handleSaveProject}
      />

      <MoveWorkflowModal
        isOpen={Boolean(movingWorkflow)}
        onClose={() => setMovingWorkflow(null)}
        workflow={movingWorkflow}
        projects={projects}
        onMove={handleMoveWorkflow}
      />

      <DuplicateWorkflowModal
        isOpen={Boolean(duplicatingWorkflow)}
        onClose={() => setDuplicatingWorkflow(null)}
        workflow={duplicatingWorkflow}
        projects={projects}
        onDuplicate={handleDuplicateWorkflow}
      />

      <WorkflowSettingsModal
        isOpen={Boolean(settingsWorkflow)}
        onClose={() => setSettingsWorkflow(null)}
        workflow={settingsWorkflow}
        onSave={async (id, updates) => {
          await fetch(`/api/workflows/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
          });
          refreshData();
        }}
        onDelete={handleDeleteWorkflow}
      />
    </div>
  );
}
