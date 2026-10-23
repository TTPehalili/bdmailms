'use client';

import React, { useState } from 'react';
import { Copy, FolderInput, X, Settings2, Trash2, Check } from 'lucide-react';
import { ProjectFolderRecord, WorkflowRecord } from '@/lib/db';

interface MoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: WorkflowRecord | null;
  projects: ProjectFolderRecord[];
  onMove: (workflowId: string, targetFolderId?: string) => Promise<void>;
}

export function MoveWorkflowModal({ isOpen, onClose, workflow, projects, onMove }: MoveModalProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string>(workflow?.folderId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (workflow) {
      setSelectedFolderId(workflow.folderId || '');
    }
  }, [workflow, isOpen]);

  if (!isOpen || !workflow) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onMove(workflow.id, selectedFolderId || undefined);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-3xl bg-white border border-stone-200 shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <FolderInput className="h-4 w-4 text-stone-700" />
            <h3 className="text-sm font-bold text-stone-900">Move Workflow</h3>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-700 rounded-md">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <p className="text-xs text-stone-600">
            Select a project folder destination for <strong className="text-stone-900">{workflow.name}</strong>:
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700">Destination Folder</label>
            <select
              value={selectedFolderId}
              onChange={(e) => setSelectedFolderId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:ring-2 focus:ring-[#ED1C24] focus:outline-none"
            >
              <option value="">Ungrouped (Root)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-xl bg-[#ED1C24] hover:bg-[#d0181f] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Moving...' : 'Move to Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface DuplicateModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: WorkflowRecord | null;
  projects: ProjectFolderRecord[];
  onDuplicate: (workflowId: string, newName: string, folderId?: string) => Promise<void>;
}

export function DuplicateWorkflowModal({ isOpen, onClose, workflow, projects, onDuplicate }: DuplicateModalProps) {
  const [name, setName] = useState(workflow ? `${workflow.name} (Copy)` : '');
  const [folderId, setFolderId] = useState<string>(workflow?.folderId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (workflow) {
      setName(`${workflow.name} (Copy)`);
      setFolderId(workflow.folderId || '');
    }
  }, [workflow, isOpen]);

  if (!isOpen || !workflow) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onDuplicate(workflow.id, name.trim(), folderId || undefined);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-3xl bg-white border border-stone-200 shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <Copy className="h-4 w-4 text-stone-700" />
            <h3 className="text-sm font-bold text-stone-900">Duplicate Workflow</h3>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-700 rounded-md">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700">Cloned Workflow Name</label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:ring-2 focus:ring-[#ED1C24] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700">Target Folder</label>
            <select
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:ring-2 focus:ring-[#ED1C24] focus:outline-none"
            >
              <option value="">Ungrouped (Root)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-4 py-1.5 rounded-xl bg-[#ED1C24] hover:bg-[#d0181f] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Duplicating...' : 'Duplicate Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface WorkflowSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: WorkflowRecord | null;
  onSave: (id: string, updates: Partial<WorkflowRecord>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function WorkflowSettingsModal({ isOpen, onClose, workflow, onSave, onDelete }: WorkflowSettingsModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [webhookPath, setWebhookPath] = useState('');
  const [active, setActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (workflow) {
      setName(workflow.name);
      setDescription(workflow.description || '');
      setWebhookPath(workflow.webhookPath || '');
      setActive(workflow.active ?? true);
    }
  }, [workflow, isOpen]);

  if (!isOpen || !workflow) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave(workflow.id, {
        name: name.trim(),
        description: description.trim(),
        webhookPath: webhookPath.trim() || undefined,
        active
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete workflow "${workflow.name}"? This cannot be undone.`)) {
      await onDelete(workflow.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-white border border-stone-200 shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-stone-700" />
            <h3 className="text-sm font-bold text-stone-900">Workflow Settings</h3>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-700 rounded-md">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700">Workflow Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:ring-2 focus:ring-[#ED1C24] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:ring-2 focus:ring-[#ED1C24] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700">Webhook Path Slug</label>
            <div className="flex items-center">
              <span className="px-3 py-2 rounded-l-xl bg-stone-100 border border-r-0 border-stone-200 text-stone-500 font-mono text-[11px]">
                /api/webhooks/
              </span>
              <input
                type="text"
                placeholder="slug-name"
                value={webhookPath}
                onChange={(e) => setWebhookPath(e.target.value)}
                className="w-full px-3 py-2 rounded-r-xl bg-white border border-stone-200 text-xs font-mono focus:ring-2 focus:ring-[#ED1C24] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="rounded text-[#ED1C24] focus:ring-[#ED1C24]"
              />
              <span className="text-xs font-medium text-stone-700">Workflow Active (Listening)</span>
            </label>

            <button
              type="button"
              onClick={handleDelete}
              className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-4 py-1.5 rounded-xl bg-[#ED1C24] hover:bg-[#d0181f] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
