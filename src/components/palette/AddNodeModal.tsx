'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Plus, Sparkles, Cpu, Layers, GitFork, Webhook, Code, Globe, MessageSquare } from 'lucide-react';
import { ALL_NODE_DEFINITIONS, INodeDefinition, NodeCategory } from '@/registry';

const CATEGORIES: { label: string; value: string; icon: React.ElementType }[] = [
  { label: 'All Nodes', value: 'All', icon: Layers },
  { label: 'Triggers', value: 'Triggers', icon: Webhook },
  { label: 'Logic & Flow', value: 'Logic & Flow', icon: GitFork },
  { label: 'Data & Transforms', value: 'Data & Transforms', icon: Code },
  { label: 'App Integrations', value: 'App Integrations', icon: MessageSquare },
  { label: 'AI & LLMs', value: 'AI & LLMs', icon: Sparkles },
  { label: 'Model Context Protocol (MCP)', value: 'Model Context Protocol (MCP)', icon: Cpu },
  { label: 'Core Protocols', value: 'Core Protocols', icon: Globe }
];

interface AddNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNode: (nodeDef: INodeDefinition) => void;
}

export default function AddNodeModal({ isOpen, onClose, onSelectNode }: AddNodeModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredNodes = useMemo(() => {
    let list = ALL_NODE_DEFINITIONS;
    if (selectedCategory !== 'All') {
      list = list.filter((n) => n.category === selectedCategory);
    }
    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (n) =>
        n.displayName.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.name.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q)
    );
  }, [selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-3xl rounded-3xl bg-white border border-stone-200 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-rose-50 text-[#ED1C24] flex items-center justify-center font-bold">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Add Automation Node</h3>
              <p className="text-xs text-stone-500">Select preloaded trigger, logic, app, AI or MCP step</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-stone-100 bg-stone-50/50">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search nodes by name, app (Slack, Stripe), or function (/ to focus)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ED1C24] focus:border-transparent transition-all"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 no-scrollbar text-xs">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#222021] text-white shadow-2xs'
                      : 'bg-white text-stone-600 hover:bg-stone-200/60 border border-stone-200/60'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Node Grid List */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredNodes.length === 0 ? (
            <div className="col-span-2 py-12 text-center text-stone-400">
              <p className="text-sm font-medium">No nodes found matching &ldquo;{searchQuery}&rdquo;</p>
              <p className="text-xs mt-1">Try searching for &ldquo;webhook&rdquo;, &ldquo;slack&rdquo;, &ldquo;ai&rdquo;, or &ldquo;code&rdquo;</p>
            </div>
          ) : (
            filteredNodes.map((node) => (
              <div
                key={node.name}
                onClick={() => {
                  onSelectNode(node);
                  onClose();
                }}
                className="group p-3.5 rounded-2xl border border-stone-200 bg-white hover:border-stone-800 hover:shadow-xs transition-all cursor-pointer flex items-start gap-3"
              >
                <div className="p-2.5 rounded-xl bg-stone-100 text-stone-900 shrink-0">
                  {node.name === 'elevenLabsNode' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <rect x="7" y="4" width="3.5" height="16" rx="1.75" />
                      <rect x="13.5" y="4" width="3.5" height="16" rx="1.75" />
                    </svg>
                  ) : (
                    <span className="font-mono text-xs font-bold">{node.displayName[0]}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-stone-900 transition-colors truncate">
                      {node.displayName}
                    </h4>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 border border-stone-200 shrink-0">
                      {node.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                    {node.description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-stone-100 bg-stone-50 flex items-center justify-between text-[11px] text-stone-400">
          <div className="flex items-center gap-2">
            <span>Showing {filteredNodes.length} nodes</span>
            <span>•</span>
            <span>Shortcut: Press <kbd className="px-1.5 py-0.5 rounded bg-stone-200 text-stone-700 font-mono text-[10px]">/</kbd> on canvas</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-stone-200 text-stone-700 hover:bg-stone-300 font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
