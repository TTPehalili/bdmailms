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
  ChevronRight,
  Folder,
  FolderPlus,
  FolderOpen,
  MoreVertical,
  Copy,
  FolderInput,
  Edit,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
  FileCode2,
  Layers,
  Settings2,
  Check
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

export default function WorkflowAutomationStudio() {
  const [projects, setProjects] = useState<ProjectFolderRecord[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowRecord[]>([]);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string>('wf-arm-rubric');
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowRecord | null>(null);

  // React Flow state - STATIC connecting lines (animated: false)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // UI Drawer & Modal States
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'proj-qa': true,
    'proj-telephony': true,
    'proj-mcp': true,
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

        // Find active or default to first
        const matched = wfData.data.find((w: WorkflowRecord) => w.id === activeWorkflowId) || wfData.data[0];
        setActiveWorkflowId(matched.id);
        setCurrentWorkflow(matched);
        setNodes(matched.nodes || []);
        // Ensure static lines (animated: false) on all edges
        setEdges(
          (matched.edges || []).map((e: Edge) => ({
            ...e,
            animated: false,
            style: { stroke: '#ED1C24', strokeWidth: 2 }
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

  // Select workflow
  const handleSelectWorkflow = (wf: WorkflowRecord) => {
    setActiveWorkflowId(wf.id);
    setCurrentWorkflow(wf);
    setNodes(wf.nodes || []);
    // Ensure all connecting lines are static
    setEdges(
      (wf.edges || []).map((e: Edge) => ({
        ...e,
        animated: false,
        style: { stroke: '#ED1C24', strokeWidth: 2 }
      }))
    );
    setConfigNodeId(null);
  };

  // Add new node from palette
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
          edges: edges.map((e) => ({ ...e, animated: false }))
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsSaving(false);
        // Refresh local cache
        setWorkflows((prev) => prev.map((w) => (w.id === currentWorkflow.id ? data.data : w)));
        setCurrentWorkflow(data.data);
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
                executionTimeMs: trace?.executionTimeMs || 35
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

  // Project Folder Operations
  const handleSaveProject = async (projectData: { id?: string; name: string; description?: string; color: string }) => {
    if (projectData.id) {
      // Edit
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
      // Create
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

  // Create new blank workflow inside project folder
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
              nodeType: 'manualTrigger',
              label: 'Manual Trigger',
              category: 'Triggers',
              icon: 'PlayCircle',
              config: { mockPayload: '{"status": "test"}' }
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

  // Duplicate Workflow
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

  // Move Workflow
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

  // Delete Workflow
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

  // Toggle folder expansion
  const toggleFolder = (folderKey: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderKey]: !prev[folderKey] }));
  };

  const selectedNode = nodes.find((n) => n.id === configNodeId);
  const currentProject = projects.find((p) => p.id === currentWorkflow?.folderId);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
      {/* Top Studio Action Bar */}
      <div className="p-3.5 border-b border-stone-200 bg-white flex flex-wrap items-center justify-between gap-3">
        {/* Left: Sidebar Toggle, Project Folder Badge & Workflow Name */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen((v) => !v)}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
            title={isSidebarOpen ? 'Hide Projects Sidebar' : 'Show Projects Sidebar'}
          >
            {isSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </button>

          {currentProject && (
            <span
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg text-white flex items-center gap-1.5"
              style={{ backgroundColor: currentProject.color || '#ED1C24' }}
            >
              <Folder className="h-3 w-3" />
              <span>{currentProject.name}</span>
            </span>
          )}

          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black text-stone-900 tracking-tight">
              {currentWorkflow?.name || 'Untitled Workflow'}
            </h2>
            <button
              onClick={() => setSettingsWorkflow(currentWorkflow)}
              className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              title="Workflow Settings & Rename"
            >
              <Settings2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <span className="hidden md:inline-block text-[11px] text-stone-400 font-mono">
            {nodes.length} nodes • {edges.length} static lines
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
                <span>Succeeded!</span>
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

      {/* Main Workspace Area (Sidebar + Canvas) */}
      <div className="flex-1 w-full h-full relative flex overflow-hidden">
        {/* Left Project & Folder Navigator Sidebar */}
        {isSidebarOpen && (
          <aside className="w-72 border-r border-stone-200 bg-stone-50/70 flex flex-col shrink-0 overflow-hidden animate-in slide-in-from-left duration-200">
            {/* Sidebar Header */}
            <div className="p-3 border-b border-stone-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-stone-600" />
                <span className="text-xs font-bold text-stone-800">Automation Projects</span>
              </div>
              <button
                onClick={() => {
                  setEditingProject(null);
                  setIsProjectModalOpen(true);
                }}
                className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-[#ED1C24] text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="Create New Project Folder"
              >
                <FolderPlus className="h-3.5 w-3.5" />
                <span>+ Folder</span>
              </button>
            </div>

            {/* Folder Tree Scroll Area */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-3">
              {/* Projects List */}
              {projects.map((proj) => {
                const isExpanded = expandedFolders[proj.id] ?? true;
                const folderWorkflows = workflows.filter((w) => w.folderId === proj.id);

                return (
                  <div key={proj.id} className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-2xs">
                    {/* Folder Header */}
                    <div className="p-2.5 bg-stone-100/60 hover:bg-stone-100 flex items-center justify-between gap-2 border-b border-stone-100">
                      <div
                        onClick={() => toggleFolder(proj.id)}
                        className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer select-none"
                      >
                        <span className="text-stone-400">
                          {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                        </span>
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: proj.color || '#ED1C24' }}
                        />
                        <span className="text-xs font-bold text-stone-800 truncate">{proj.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-600">
                          {folderWorkflows.length}
                        </span>
                      </div>

                      {/* Folder Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleCreateNewWorkflow(proj.id)}
                          className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-white transition-colors"
                          title="New Workflow in this folder"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingProject(proj);
                            setIsProjectModalOpen(true);
                          }}
                          className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-white transition-colors"
                          title="Edit Folder Name / Color"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(proj.id, proj.name)}
                          className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Folder"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Workflows inside this folder */}
                    {isExpanded && (
                      <div className="p-1 space-y-0.5">
                        {folderWorkflows.length === 0 ? (
                          <div className="p-2 text-center text-[11px] text-stone-400">
                            No workflows yet. Click &ldquo;+&rdquo; above.
                          </div>
                        ) : (
                          folderWorkflows.map((wf) => {
                            const isSelected = activeWorkflowId === wf.id;
                            return (
                              <div
                                key={wf.id}
                                className={`group p-2 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-rose-50 text-[#ED1C24] font-bold'
                                    : 'hover:bg-stone-50 text-stone-700 font-medium'
                                }`}
                              >
                                <div
                                  onClick={() => handleSelectWorkflow(wf)}
                                  className="flex items-center gap-2 min-w-0 flex-1 truncate"
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                                      wf.active ? 'bg-emerald-500' : 'bg-stone-300'
                                    }`}
                                  />
                                  <span className="truncate">{wf.name}</span>
                                </div>

                                {/* Workflow Item Quick Actions */}
                                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0 transition-opacity">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDuplicatingWorkflow(wf);
                                    }}
                                    className="p-1 hover:bg-white rounded text-stone-400 hover:text-stone-700"
                                    title="Duplicate Workflow"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setMovingWorkflow(wf);
                                    }}
                                    className="p-1 hover:bg-white rounded text-stone-400 hover:text-stone-700"
                                    title="Move to another Folder"
                                  >
                                    <FolderInput className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSettingsWorkflow(wf);
                                    }}
                                    className="p-1 hover:bg-white rounded text-stone-400 hover:text-stone-700"
                                    title="Settings"
                                  >
                                    <Settings2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Ungrouped Workflows */}
              {(() => {
                const ungrouped = workflows.filter((w) => !w.folderId);
                const isExpanded = expandedFolders['ungrouped'] ?? true;

                return (
                  <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-2xs">
                    <div
                      onClick={() => toggleFolder('ungrouped')}
                      className="p-2.5 bg-stone-100/60 hover:bg-stone-100 flex items-center justify-between cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-stone-400">
                          {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                        </span>
                        <span className="text-xs font-bold text-stone-700">Ungrouped Workflows</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-600">
                          {ungrouped.length}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateNewWorkflow(undefined);
                        }}
                        className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-white"
                        title="New Ungrouped Workflow"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="p-1 space-y-0.5">
                        {ungrouped.length === 0 ? (
                          <div className="p-2 text-center text-[11px] text-stone-400">No ungrouped workflows</div>
                        ) : (
                          ungrouped.map((wf) => {
                            const isSelected = activeWorkflowId === wf.id;
                            return (
                              <div
                                key={wf.id}
                                className={`group p-2 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-rose-50 text-[#ED1C24] font-bold'
                                    : 'hover:bg-stone-50 text-stone-700 font-medium'
                                }`}
                              >
                                <div
                                  onClick={() => handleSelectWorkflow(wf)}
                                  className="flex items-center gap-2 min-w-0 flex-1 truncate"
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                                      wf.active ? 'bg-emerald-500' : 'bg-stone-300'
                                    }`}
                                  />
                                  <span className="truncate">{wf.name}</span>
                                </div>

                                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0 transition-opacity">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDuplicatingWorkflow(wf);
                                    }}
                                    className="p-1 hover:bg-white rounded text-stone-400 hover:text-stone-700"
                                    title="Duplicate Workflow"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setMovingWorkflow(wf);
                                    }}
                                    className="p-1 hover:bg-white rounded text-stone-400 hover:text-stone-700"
                                    title="Move to Folder"
                                  >
                                    <FolderInput className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSettingsWorkflow(wf);
                                    }}
                                    className="p-1 hover:bg-white rounded text-stone-400 hover:text-stone-700"
                                    title="Settings"
                                  >
                                    <Settings2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </aside>
        )}

        {/* React Flow Canvas: STATIC connecting lines (animated: false) */}
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

      {/* Add / Edit Project Folder Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        initialProject={editingProject}
        onSave={handleSaveProject}
      />

      {/* Move Workflow Modal */}
      <MoveWorkflowModal
        isOpen={Boolean(movingWorkflow)}
        onClose={() => setMovingWorkflow(null)}
        workflow={movingWorkflow}
        projects={projects}
        onMove={handleMoveWorkflow}
      />

      {/* Duplicate Workflow Modal */}
      <DuplicateWorkflowModal
        isOpen={Boolean(duplicatingWorkflow)}
        onClose={() => setDuplicatingWorkflow(null)}
        workflow={duplicatingWorkflow}
        projects={projects}
        onDuplicate={handleDuplicateWorkflow}
      />

      {/* Workflow Settings & Delete Modal */}
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
