'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import {
  Webhook,
  Clock,
  PlayCircle,
  Mail,
  GitFork,
  Shuffle,
  Filter,
  Repeat,
  GitMerge,
  Hourglass,
  Layers,
  Code,
  SlidersHorizontal,
  Braces,
  Calendar,
  Key,
  Hash,
  MessageSquare,
  Send,
  GitPullRequest,
  Sheet,
  FolderSync,
  FileText,
  Database,
  CreditCard,
  MailCheck,
  Server,
  Bot,
  Sparkles,
  Network,
  Cpu,
  BookOpen,
  Radio,
  Globe,
  Settings,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Webhook,
  Clock,
  PlayCircle,
  Mail,
  GitFork,
  Shuffle,
  Filter,
  Repeat,
  GitMerge,
  Hourglass,
  Layers,
  Code,
  SlidersHorizontal,
  Braces,
  Calendar,
  Key,
  Slack: Hash,
  MessageSquare,
  Send,
  GitPullRequest,
  Sheet,
  FolderSync,
  FileText,
  Database,
  CreditCard,
  MailCheck,
  Server,
  Bot,
  Sparkles,
  Network,
  Cpu,
  BookOpen,
  Radio,
  Globe
};

const CATEGORY_STYLES: Record<string, { border: string; bg: string; badge: string; text: string }> = {
  Triggers: {
    border: 'border-amber-400',
    bg: 'bg-amber-500/10',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    text: 'text-amber-600'
  },
  'Logic & Flow': {
    border: 'border-blue-400',
    bg: 'bg-blue-500/10',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    text: 'text-blue-600'
  },
  'Data & Transforms': {
    border: 'border-emerald-400',
    bg: 'bg-emerald-500/10',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    text: 'text-emerald-600'
  },
  'App Integrations': {
    border: 'border-purple-400',
    bg: 'bg-purple-500/10',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    text: 'text-purple-600'
  },
  'AI & LLMs': {
    border: 'border-fuchsia-400',
    bg: 'bg-fuchsia-500/10',
    badge: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
    text: 'text-fuchsia-600'
  },
  'Model Context Protocol (MCP)': {
    border: 'border-cyan-400',
    bg: 'bg-cyan-500/10',
    badge: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    text: 'text-cyan-600'
  },
  'Core Protocols': {
    border: 'border-indigo-400',
    bg: 'bg-indigo-500/10',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    text: 'text-indigo-600'
  }
};

export interface CanvasNodeData {
  label: string;
  nodeType: string;
  category: string;
  icon?: string;
  config?: Record<string, any>;
  status?: 'idle' | 'running' | 'success' | 'error';
  executionTimeMs?: number;
  onOpenConfig?: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
}

export const WorkflowCanvasNode = memo(function WorkflowCanvasNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as CanvasNodeData;
  const category = nodeData.category || 'Data & Transforms';
  const styles = CATEGORY_STYLES[category] || CATEGORY_STYLES['Data & Transforms'];
  const IconComponent = (nodeData.icon && ICON_MAP[nodeData.icon]) || Code;
  const status = nodeData.status || 'idle';
  const isIfNode = nodeData.nodeType === 'ifNode';

  return (
    <div
      className={`relative min-w-[240px] max-w-[280px] rounded-2xl bg-white border-2 shadow-sm transition-all duration-200 ${
        selected ? 'ring-2 ring-[#ED1C24] ring-offset-2 border-[#ED1C24]' : styles.border
      } hover:shadow-md`}
    >
      {/* Target input handle (unless Trigger) */}
      {category !== 'Triggers' && (
        <Handle
          type="target"
          position={Position.Left}
          id="input"
          className="!w-3.5 !h-3.5 !bg-stone-400 !border-2 !border-white hover:!bg-[#ED1C24] transition-colors"
        />
      )}

      {/* Header Bar */}
      <div className={`flex items-center justify-between p-3 border-b border-stone-100 rounded-t-2xl ${styles.bg}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-white shadow-2xs border border-stone-200/80">
            <IconComponent className={`h-4 w-4 ${styles.text}`} />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-stone-900 truncate tracking-tight">{nodeData.label}</h4>
            <span className={`inline-block text-[9px] font-mono px-1.5 py-0.2 rounded border ${styles.badge}`}>
              {category}
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => nodeData.onOpenConfig && nodeData.onOpenConfig(id)}
            title="Configure Node"
            className="p-1 text-stone-400 hover:text-stone-700 hover:bg-white rounded-md transition-colors"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => nodeData.onDelete && nodeData.onDelete(id)}
            title="Delete Node"
            className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Body / Config summary */}
      <div className="p-3 text-[11px] text-stone-600 space-y-1">
        {nodeData.config?.path && (
          <div className="flex items-center justify-between font-mono text-[10px] bg-stone-50 px-2 py-0.5 rounded">
            <span className="text-stone-400">Slug:</span>
            <span className="font-semibold text-stone-800">/{nodeData.config.path}</span>
          </div>
        )}
        {nodeData.config?.channel && (
          <div className="flex items-center justify-between font-mono text-[10px] bg-stone-50 px-2 py-0.5 rounded">
            <span className="text-stone-400">Channel:</span>
            <span className="font-semibold text-purple-700">{nodeData.config.channel}</span>
          </div>
        )}
        {nodeData.config?.toolName && (
          <div className="flex items-center justify-between font-mono text-[10px] bg-stone-50 px-2 py-0.5 rounded">
            <span className="text-stone-400">MCP Tool:</span>
            <span className="font-semibold text-cyan-700">{nodeData.config.toolName}</span>
          </div>
        )}
        {nodeData.config?.url && (
          <div className="flex items-center justify-between font-mono text-[10px] bg-stone-50 px-2 py-0.5 rounded truncate">
            <span className="text-stone-400">{nodeData.config.method || 'GET'}:</span>
            <span className="font-semibold text-stone-800 truncate ml-1">{nodeData.config.url}</span>
          </div>
        )}

        {/* Status bar */}
        <div className="pt-1.5 flex items-center justify-between text-[10px] border-t border-stone-100">
          <div className="flex items-center gap-1.5 font-medium">
            {status === 'running' && (
              <>
                <Loader2 className="h-3 w-3 text-amber-500 animate-spin" />
                <span className="text-amber-600 font-mono">Running...</span>
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                <span className="text-emerald-600 font-mono">
                  Success {nodeData.executionTimeMs ? `(${nodeData.executionTimeMs}ms)` : ''}
                </span>
              </>
            )}
            {status === 'error' && (
              <>
                <AlertCircle className="h-3 w-3 text-rose-500" />
                <span className="text-rose-600 font-mono">Failed</span>
              </>
            )}
            {status === 'idle' && (
              <span className="text-stone-400 font-mono text-[9px]">Status: Ready</span>
            )}
          </div>
          <span className="text-stone-300 font-mono text-[9px]">{id}</span>
        </div>
      </div>

      {/* Output handles */}
      {isIfNode ? (
        <>
          <div className="absolute right-0 top-[35%] translate-x-1/2 flex items-center">
            <Handle
              type="source"
              position={Position.Right}
              id="true"
              className="!w-3.5 !h-3.5 !bg-emerald-500 !border-2 !border-white hover:!bg-emerald-600 transition-colors"
            />
            <span className="text-[9px] font-bold text-emerald-600 mr-2 bg-white px-1 rounded shadow-2xs">True</span>
          </div>
          <div className="absolute right-0 top-[65%] translate-x-1/2 flex items-center">
            <Handle
              type="source"
              position={Position.Right}
              id="false"
              className="!w-3.5 !h-3.5 !bg-rose-500 !border-2 !border-white hover:!bg-rose-600 transition-colors"
            />
            <span className="text-[9px] font-bold text-rose-600 mr-2 bg-white px-1 rounded shadow-2xs">False</span>
          </div>
        </>
      ) : (
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          className="!w-3.5 !h-3.5 !bg-stone-400 !border-2 !border-white hover:!bg-[#ED1C24] transition-colors"
        />
      )}
    </div>
  );
});
