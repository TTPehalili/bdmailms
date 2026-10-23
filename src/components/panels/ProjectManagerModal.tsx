'use client';

import React, { useState } from 'react';
import { Folder, FolderPlus, X, Palette, Trash2, Edit3, ArrowRight } from 'lucide-react';
import { ProjectFolderRecord } from '@/lib/db';

const PRESET_COLORS = [
  '#ED1C24', // Crimson
  '#2563EB', // Blue
  '#059669', // Emerald
  '#D97706', // Amber
  '#7C3AED', // Purple
  '#0891B2', // Cyan
  '#4B5563'  // Slate
];

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProject?: ProjectFolderRecord | null;
  onSave: (projectData: { id?: string; name: string; description?: string; color: string }) => Promise<void>;
}

export default function ProjectModal({ isOpen, onClose, initialProject, onSave }: ProjectModalProps) {
  const [name, setName] = useState(initialProject?.name || '');
  const [description, setDescription] = useState(initialProject?.description || '');
  const [color, setColor] = useState(initialProject?.color || '#ED1C24');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when initialProject changes
  React.useEffect(() => {
    if (initialProject) {
      setName(initialProject.name);
      setDescription(initialProject.description || '');
      setColor(initialProject.color || '#ED1C24');
    } else {
      setName('');
      setDescription('');
      setColor('#ED1C24');
    }
  }, [initialProject, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        id: initialProject?.id,
        name: name.trim(),
        description: description.trim(),
        color
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-white border border-stone-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: color }}
            >
              <Folder className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                {initialProject ? 'Edit Project Folder' : 'New Automation Project Folder'}
              </h3>
              <p className="text-[11px] text-stone-500">Organize workflows into dedicated project environments</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700">Project / Folder Name</label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Sales Dialers, QA Rubrics, Stripe Billing..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:ring-2 focus:ring-[#ED1C24] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700">Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="Purpose of this automation project..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:ring-2 focus:ring-[#ED1C24] focus:outline-none"
            />
          </div>

          {/* Color tag picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5" />
              <span>Project Accent Color</span>
            </label>
            <div className="flex items-center gap-2 pt-1">
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full transition-transform cursor-pointer ${
                    color === c ? 'scale-120 ring-2 ring-offset-2 ring-stone-900' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
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
              className="px-4 py-1.5 rounded-xl bg-[#ED1C24] hover:bg-[#d0181f] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : initialProject ? 'Save Changes' : 'Create Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
