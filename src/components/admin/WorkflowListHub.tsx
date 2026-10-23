'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Folder,
  FolderPlus,
  Plus,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  Copy,
  FolderInput,
  Edit,
  Trash2,
  ExternalLink,
  Play,
  CheckCircle2,
  Clock,
  Sparkles,
  Settings,
  Layers,
  ArrowLeft,
  Check,
  FileCode2,
  Zap,
  Tag,
  Radio,
  SlidersHorizontal,
  Home,
  CheckSquare,
  Square,
  Share2,
  Bot
} from 'lucide-react';
import { ProjectFolderRecord, WorkflowRecord } from '@/lib/db';
import ProjectModal from '../panels/ProjectManagerModal';
import {
  MoveWorkflowModal,
  DuplicateWorkflowModal,
  WorkflowSettingsModal
} from '../panels/WorkflowActionModals';

interface WorkflowListHubProps {
  onOpenCanvas: (workflowId?: string) => void;
}

export default function WorkflowListHub({ onOpenCanvas }: WorkflowListHubProps) {
  const [projects, setProjects] = useState<ProjectFolderRecord[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Current folder drill-down: null = Home root, string = inside folderId
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // Filter & Search
  const [activeTab, setActiveTab] = useState<'all' | 'needs_review' | 'deleted'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});

  // Dropdown menus
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [openItemMenuId, setOpenItemMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Modals
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectFolderRecord | null>(null);
  const [movingWorkflow, setMovingWorkflow] = useState<WorkflowRecord | null>(null);
  const [duplicatingWorkflow, setDuplicatingWorkflow] = useState<WorkflowRecord | null>(null);
  const [settingsWorkflow, setSettingsWorkflow] = useState<WorkflowRecord | null>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsCreateMenuOpen(false);
        setOpenItemMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Projects & Workflows
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [projRes, wfRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/workflows')
      ]);
      const projData = await projRes.json();
      const wfData = await wfRes.json();

      if (projData.success) setProjects(projData.data);
      if (wfData.success) setWorkflows(wfData.data);
    } catch (err) {
      console.error('Failed to load workflow hub data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Current folder object
  const currentFolder = useMemo(() => {
    return projects.find((p) => p.id === currentFolderId) || null;
  }, [projects, currentFolderId]);

  // Filtered Folders (only visible at Home root)
  const visibleProjects = useMemo(() => {
    if (currentFolderId !== null) return [];
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase().trim();
    return projects.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))
    );
  }, [projects, currentFolderId, searchQuery]);

  // Filtered Workflows
  const visibleWorkflows = useMemo(() => {
    let list = workflows;
    if (currentFolderId !== null) {
      list = list.filter((w) => w.folderId === currentFolderId);
    } else {
      // At root, show ungrouped workflows
      list = list.filter((w) => !w.folderId);
    }

    if (activeTab === 'needs_review') {
      list = list.filter((w) => !w.active);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (w) => w.name.toLowerCase().includes(q) || (w.description && w.description.toLowerCase().includes(q))
      );
    }

    return list;
  }, [workflows, currentFolderId, activeTab, searchQuery]);

  // Handle Create Project Folder
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
        if (currentFolderId === projectId) {
          setCurrentFolderId(null);
        }
      }
    }
  };

  // Create new workflow from scratch
  const handleCreateWorkflow = async (templateType: 'scratch' | 'elevenlabs' | 'arm' | 'dialer') => {
    setIsCreateMenuOpen(false);
    let name = `New Workflow ${workflows.length + 1}`;
    let nodes: any[] = [];
    let edges: any[] = [];
    let webhookPath = `hook-${Date.now().toString().slice(-4)}`;

    if (templateType === 'elevenlabs') {
      name = 'VoiceChatbot (ElevenLabs)';
      webhookPath = 'voice-chat';
      nodes = [
        {
          id: 'node-listen',
          type: 'customNode',
          position: { x: 100, y: 160 },
          data: {
            nodeType: 'webhookTrigger',
            label: 'Listen',
            category: 'Triggers',
            icon: 'Webhook',
            isTriggerPill: true,
            config: { path: 'voice-chat', httpMethod: 'POST' }
          }
        },
        {
          id: 'node-agent',
          type: 'customNode',
          position: { x: 380, y: 140 },
          data: {
            nodeType: 'aiAgentNode',
            label: 'AI Agent',
            category: 'AI & LLMs',
            icon: 'Bot',
            hasSubHandles: true,
            config: { agentGoal: 'Voice conversational assistance', maxIterations: 3 }
          }
        },
        {
          id: 'node-eleven',
          type: 'customNode',
          position: { x: 740, y: 140 },
          data: {
            nodeType: 'elevenLabsNode',
            label: 'ElevenLabs2',
            subtitle: 'textToSpeech: speech',
            category: 'App Integrations',
            icon: 'ElevenLabs',
            config: {
              actionCategory: 'speech',
              operation: 'textToSpeech',
              voiceId: '21m00Tcm4TlvDq8ikWAM',
              text: '{{ $json.aiResponse.content || "Hello!" }}'
            }
          }
        }
      ];
      edges = [
        { id: 'e1', source: 'node-listen', target: 'node-agent', sourceHandle: 'output', targetHandle: 'input' },
        { id: 'e2', source: 'node-agent', target: 'node-eleven', sourceHandle: 'output', targetHandle: 'input' }
      ];
    } else {
      nodes = [
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
      ];
    }

    const res = await fetch('/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        folderId: currentFolderId || undefined,
        webhookPath,
        nodes,
        edges
      })
    });
    const data = await res.json();
    if (data.success) {
      setWorkflows((prev) => [data.data, ...prev]);
      onOpenCanvas(data.data.id);
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
    }
  };

  // Delete Workflow
  const handleDeleteWorkflow = async (workflowId: string) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      const res = await fetch(`/api/workflows/${workflowId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setWorkflows((prev) => prev.filter((w) => w.id !== workflowId));
      }
    }
  };

  // Toggle active status
  const handleToggleActive = async (workflow: WorkflowRecord) => {
    const nextState = !workflow.active;
    setWorkflows((prev) =>
      prev.map((w) => (w.id === workflow.id ? { ...w, active: nextState } : w))
    );
    await fetch(`/api/workflows/${workflow.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: nextState })
    });
  };

  return (
    <div className="space-y-6" ref={menuRef}>
      {/* Top Breadcrumb Navigation & Global Settings Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
          <span className="font-bold text-stone-900">Automation</span>
          <span>/</span>
          <span className="text-[#ED1C24] font-bold">Workflows</span>
          <span>•</span>
          <span className="hover:text-stone-800 transition-colors cursor-pointer">Campaign</span>
          <span>•</span>
          <span className="hover:text-stone-800 transition-colors cursor-pointer">Triggers</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => onOpenCanvas()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white font-bold transition-all shadow-xs cursor-pointer"
          >
            <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span>Launch Studio Canvas</span>
          </button>
        </div>
      </div>

      {/* Main Page Title & Primary Actions (Matches Screenshot) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Workflow List</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage automation project folders, inbound webhook pipelines, and visual execution flows.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Create Folder Button */}
          <button
            onClick={() => {
              setEditingProject(null);
              setIsFolderModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-xs font-bold text-stone-800 flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
          >
            <FolderPlus className="h-4 w-4 text-stone-500" />
            <span>Create Folder</span>
          </button>

          {/* + Create Workflow Button with Dropdown (Highlighted in Red in Screenshot) */}
          <div className="relative">
            <button
              onClick={() => setIsCreateMenuOpen((v) => !v)}
              className="px-4 py-2 rounded-xl bg-[#ED1C24] hover:bg-[#d0181f] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create Workflow</span>
              <ChevronDown className="h-3.5 w-3.5 ml-0.5" />
            </button>

            {/* Dropdown Menu (Matches red highlighted popup in Screenshot) */}
            {isCreateMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-60 rounded-2xl bg-white border border-stone-200 shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 text-xs">
                <button
                  onClick={() => handleCreateWorkflow('scratch')}
                  className="w-full px-3.5 py-2 text-left hover:bg-stone-50 text-stone-900 font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4 text-[#ED1C24]" />
                  <span>Start from Scratch</span>
                </button>

                <button
                  onClick={() => handleCreateWorkflow('elevenlabs')}
                  className="w-full px-3.5 py-2 text-left hover:bg-stone-50 text-stone-700 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span>VoiceChatbot (ElevenLabs)</span>
                </button>

                <button
                  onClick={() => handleCreateWorkflow('scratch')}
                  className="w-full px-3.5 py-2 text-left hover:bg-stone-50 text-stone-700 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Layers className="h-4 w-4 text-blue-600" />
                  <span>Select a Recipe</span>
                </button>

                <button
                  onClick={() => handleCreateWorkflow('scratch')}
                  className="w-full px-3.5 py-2 text-left hover:bg-stone-50 text-stone-700 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FileCode2 className="h-4 w-4 text-emerald-600" />
                  <span>Select from Template</span>
                </button>

                <div className="border-t border-stone-100 my-1" />

                <button
                  onClick={() => handleCreateWorkflow('scratch')}
                  className="w-full px-3.5 py-2 text-left hover:bg-stone-50 text-stone-500 text-[11px] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Home className="h-3.5 w-3.5 text-stone-400" />
                  <span>Properties based workflow (Beta)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs & Search Filter Bar (Matches Screenshot) */}
      <div className="space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center justify-between border-b border-stone-200">
          <div className="flex items-center gap-6 text-xs font-bold">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-3 transition-colors cursor-pointer relative ${
                activeTab === 'all' ? 'text-[#ED1C24]' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <span>All Workflows</span>
              {activeTab === 'all' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ED1C24]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('needs_review')}
              className={`pb-3 transition-colors cursor-pointer relative ${
                activeTab === 'needs_review' ? 'text-[#ED1C24]' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <span>Needs Review (3)</span>
              {activeTab === 'needs_review' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ED1C24]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('deleted')}
              className={`pb-3 transition-colors cursor-pointer relative ${
                activeTab === 'deleted' ? 'text-[#ED1C24]' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <span>Deleted</span>
              {activeTab === 'deleted' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ED1C24]" />
              )}
            </button>

            <button className="pb-3 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer flex items-center gap-1 font-medium">
              <Plus className="h-3.5 w-3.5" />
              <span>Smart List</span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-2 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
              <input
                type="text"
                placeholder="Search workflows or folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#ED1C24] w-56"
              />
            </div>
            <button className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Advanced Filters</span>
            </button>
          </div>
        </div>

        {/* Breadcrumb Path (Home > Folder) */}
        <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
          <button
            onClick={() => setCurrentFolderId(null)}
            className={`flex items-center gap-1 hover:text-stone-900 transition-colors cursor-pointer ${
              currentFolderId === null ? 'font-bold text-stone-900' : ''
            }`}
          >
            <Home className="h-3.5 w-3.5" />
            <span>Home</span>
          </button>

          {currentFolder && (
            <>
              <span>/</span>
              <span className="font-bold text-stone-900 flex items-center gap-1.5">
                <Folder className="h-3.5 w-3.5 text-[#ED1C24]" />
                <span>{currentFolder.name}</span>
              </span>
              <button
                onClick={() => setCurrentFolderId(null)}
                className="ml-2 text-[11px] text-stone-400 hover:text-stone-700 underline"
              >
                (Back to all folders)
              </button>
            </>
          )}
        </div>
      </div>

      {/* Table Container (Matches Enterprise Table Layout from Screenshot) */}
      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-2xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50/70 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              <th className="py-3 px-4 w-10">
                <input type="checkbox" className="rounded text-[#ED1C24] focus:ring-[#ED1C24]" />
              </th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Total Enrolled</th>
              <th className="py-3 px-4">Active Enrolled</th>
              <th className="py-3 px-4">Last Updated</th>
              <th className="py-3 px-4">Created On</th>
              <th className="py-3 px-4">Stats</th>
              <th className="py-3 px-4 text-right w-12">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-stone-100 text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-stone-400">
                  <div className="inline-block h-5 w-5 rounded-full border-2 border-[#ED1C24] border-t-transparent animate-spin" />
                  <p className="mt-2 text-xs">Loading workflow directory...</p>
                </td>
              </tr>
            ) : (
              <>
                {/* 1. Folders Rows (When at Home root) */}
                {visibleProjects.map((proj) => {
                  const folderWfs = workflows.filter((w) => w.folderId === proj.id);
                  const isMenuOpen = openItemMenuId === proj.id;

                  return (
                    <tr
                      key={proj.id}
                      onClick={() => setCurrentFolderId(proj.id)}
                      className="hover:bg-stone-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="rounded text-[#ED1C24]" />
                      </td>

                      {/* Name Column with Folder Icon */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="p-1.5 rounded-lg text-white"
                            style={{ backgroundColor: proj.color || '#ED1C24' }}
                          >
                            <Folder className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-bold text-stone-900 group-hover:text-[#ED1C24] transition-colors">
                              {proj.name}
                            </span>
                            {proj.description && (
                              <p className="text-[11px] text-stone-400 line-clamp-1">{proj.description}</p>
                            )}
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 ml-1">
                            {folderWfs.length} workflows
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-stone-400 font-mono">Folder</td>
                      <td className="py-3.5 px-4 font-mono text-stone-600">{folderWfs.length * 12}</td>
                      <td className="py-3.5 px-4 font-mono text-stone-600">{folderWfs.length * 8}</td>
                      <td className="py-3.5 px-4 text-stone-500 font-mono text-[11px]">
                        {new Date(proj.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-stone-500 font-mono text-[11px]">
                        {new Date(proj.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-mono text-emerald-600 font-semibold">99.2% ok</span>
                      </td>

                      {/* Three-Dot Menu */}
                      <td className="py-3.5 px-4 text-right relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setOpenItemMenuId(isMenuOpen ? null : proj.id)}
                          className="p-1 rounded-md text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {isMenuOpen && (
                          <div className="absolute right-4 top-8 w-48 rounded-xl bg-white border border-stone-200 shadow-xl py-1 z-20 text-xs text-left">
                            <button
                              onClick={() => {
                                setCurrentFolderId(proj.id);
                                setOpenItemMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 hover:bg-stone-50 text-stone-800 font-semibold flex items-center gap-2"
                            >
                              <Folder className="h-3.5 w-3.5 text-stone-500" />
                              <span>Open Folder</span>
                            </button>

                            <button
                              onClick={() => {
                                setEditingProject(proj);
                                setIsFolderModalOpen(true);
                                setOpenItemMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 hover:bg-stone-50 text-stone-700 flex items-center gap-2"
                            >
                              <Edit className="h-3.5 w-3.5 text-stone-500" />
                              <span>Edit Folder</span>
                            </button>

                            <button
                              onClick={() => {
                                handleDeleteProject(proj.id, proj.name);
                                setOpenItemMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 hover:bg-rose-50 text-rose-600 flex items-center gap-2"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Delete Folder</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {/* 2. Workflows Rows */}
                {visibleWorkflows.map((wf) => {
                  const isMenuOpen = openItemMenuId === wf.id;

                  return (
                    <tr
                      key={wf.id}
                      onClick={() => onOpenCanvas(wf.id)}
                      className="hover:bg-stone-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="rounded text-[#ED1C24]" />
                      </td>

                      {/* Workflow Name with Icon */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-stone-100 text-stone-800 border border-stone-200/80">
                            <Zap className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-bold text-stone-900 group-hover:text-[#ED1C24] transition-colors">
                              {wf.name}
                            </span>
                            {wf.description && (
                              <p className="text-[11px] text-stone-400 line-clamp-1">{wf.description}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Active Status Switch */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleActive(wf)}
                            className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                              wf.active ? 'bg-emerald-500' : 'bg-stone-300'
                            }`}
                          >
                            <div
                              className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${
                                wf.active ? 'translate-x-3.5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span className={`text-[11px] font-mono font-semibold ${wf.active ? 'text-emerald-700' : 'text-stone-400'}`}>
                            {wf.active ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-stone-600">42</td>
                      <td className="py-3.5 px-4 font-mono text-stone-600">38</td>
                      <td className="py-3.5 px-4 text-stone-500 font-mono text-[11px]">
                        {new Date(wf.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-stone-500 font-mono text-[11px]">
                        {new Date(wf.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-mono text-emerald-600 font-semibold">100% ok</span>
                      </td>

                      {/* Three-Dot Menu */}
                      <td className="py-3.5 px-4 text-right relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setOpenItemMenuId(isMenuOpen ? null : wf.id)}
                          className="p-1 rounded-md text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {isMenuOpen && (
                          <div className="absolute right-4 top-8 w-48 rounded-xl bg-white border border-stone-200 shadow-xl py-1 z-20 text-xs text-left">
                            <button
                              onClick={() => {
                                onOpenCanvas(wf.id);
                                setOpenItemMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 hover:bg-stone-50 text-stone-900 font-bold flex items-center gap-2"
                            >
                              <ExternalLink className="h-3.5 w-3.5 text-stone-500" />
                              <span>Open in Canvas</span>
                            </button>

                            <button
                              onClick={() => {
                                setDuplicatingWorkflow(wf);
                                setOpenItemMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 hover:bg-stone-50 text-stone-700 flex items-center gap-2"
                            >
                              <Copy className="h-3.5 w-3.5 text-stone-500" />
                              <span>Duplicate Workflow</span>
                            </button>

                            <button
                              onClick={() => {
                                setMovingWorkflow(wf);
                                setOpenItemMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 hover:bg-stone-50 text-stone-700 flex items-center gap-2"
                            >
                              <FolderInput className="h-3.5 w-3.5 text-stone-500" />
                              <span>Move to Folder...</span>
                            </button>

                            <button
                              onClick={() => {
                                setSettingsWorkflow(wf);
                                setOpenItemMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 hover:bg-stone-50 text-stone-700 flex items-center gap-2"
                            >
                              <Settings className="h-3.5 w-3.5 text-stone-500" />
                              <span>Rename / Settings</span>
                            </button>

                            <button
                              onClick={() => {
                                handleDeleteWorkflow(wf.id);
                                setOpenItemMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 hover:bg-rose-50 text-rose-600 flex items-center gap-2"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Delete Workflow</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <ProjectModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
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
          loadData();
        }}
        onDelete={handleDeleteWorkflow}
      />
    </div>
  );
}
