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
  Loader2,
  Zap,
  Volume2,
  Smartphone,
  PhoneCall
} from 'lucide-react';

// Custom ElevenLabs Logo icon: two vertical bars "||" exactly as in n8n
function ElevenLabsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className || 'h-4 w-4'}>
      <rect x="7" y="4" width="3.5" height="16" rx="1.75" />
      <rect x="13.5" y="4" width="3.5" height="16" rx="1.75" />
    </svg>
  );
}

// Custom LinkedIn "in" glyph
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className || 'h-4 w-4'}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

const ICON_MAP: Record<string, React.ElementType> = {
  ElevenLabs: ElevenLabsIcon,
  LinkedIn: LinkedInIcon,
  Smartphone,
  PhoneCall,
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
  Globe,
  Volume2
};

export interface CanvasNodeData {
  label: string;
  nodeType: string;
  category: string;
  icon?: string;
  subtitle?: string;
  isTriggerPill?: boolean;
  hasSubHandles?: boolean;
  isSubNode?: boolean;
  config?: Record<string, any>;
  status?: 'idle' | 'running' | 'success' | 'error';
  executionTimeMs?: number;
  onOpenConfig?: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
}

export const WorkflowCanvasNode = memo(function WorkflowCanvasNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as CanvasNodeData;
  const isTrigger = nodeData.category === 'Triggers' || nodeData.isTriggerPill;
  const isIfNode = nodeData.nodeType === 'ifNode';
  const hasSubHandles = Boolean(nodeData.hasSubHandles);
  const isSubNode = Boolean(nodeData.isSubNode);

  // Compute subtitle
  const subtitle =
    nodeData.subtitle ||
    (nodeData.config?.operation
      ? `${nodeData.config.operation}: ${nodeData.config.actionCategory || 'action'}`
      : nodeData.config?.path
      ? `POST: /${nodeData.config.path}`
      : nodeData.config?.channel
      ? `channel: ${nodeData.config.channel}`
      : nodeData.config?.model
      ? `model: ${nodeData.config.model}`
      : nodeData.config?.method
      ? `${nodeData.config.method}`
      : '');

  const IconComponent = (nodeData.icon && ICON_MAP[nodeData.icon]) || (nodeData.nodeType === 'elevenLabsNode' ? ElevenLabsIcon : Code);
  const status = nodeData.status || 'idle';

  return (
    <div
      className={`group relative transition-all duration-150 select-none ${
        isSubNode
          ? 'min-w-[170px] max-w-[210px] rounded-2xl bg-white border border-stone-300 shadow-2xs hover:border-stone-500'
          : isTrigger
          ? 'min-w-[140px] rounded-3xl bg-white border-2 border-stone-800 shadow-xs hover:shadow-md'
          : 'min-w-[220px] max-w-[260px] rounded-2xl bg-white border-2 border-stone-800 shadow-xs hover:shadow-md'
      } ${
        selected ? 'ring-2 ring-stone-900 ring-offset-2 border-stone-900' : ''
      }`}
    >
      {/* Target input handle (unless Trigger) */}
      {!isTrigger && (
        <Handle
          type="target"
          position={Position.Left}
          id="input"
          className="!w-3 !h-3 !bg-stone-100 !border-2 !border-stone-600 hover:!border-stone-900 hover:!bg-stone-300 transition-colors"
        />
      )}

      {/* Trigger specific subtle lightning indicator (like in screenshot) */}
      {isTrigger && (
        <div className="absolute -left-5 top-1/2 -translate-y-1/2 flex items-center justify-center text-rose-500">
          <Zap className="h-4 w-4 fill-rose-500 text-rose-500" />
        </div>
      )}

      {/* Minimalist n8n Node Body */}
      <div className={`p-3.5 flex items-center gap-3 ${isTrigger ? 'flex-col text-center justify-center py-4' : ''}`}>
        {/* Crisp monochrome icon */}
        <div className={`p-2 rounded-xl bg-stone-100 text-stone-900 shrink-0 ${isTrigger ? 'h-10 w-10 flex items-center justify-center' : ''}`}>
          <IconComponent className="h-5 w-5" />
        </div>

        {/* Title and Subtitle */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <h4 className="text-xs font-bold text-stone-900 truncate tracking-tight">{nodeData.label}</h4>
            {/* Quick action buttons on hover */}
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nodeData.onOpenConfig && nodeData.onOpenConfig(id);
                }}
                className="p-0.5 rounded text-stone-400 hover:text-stone-800 hover:bg-stone-100"
                title="Configure"
              >
                <Settings className="h-3 w-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nodeData.onDelete && nodeData.onDelete(id);
                }}
                className="p-0.5 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                title="Delete"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>

          {subtitle && (
            <p className="text-[10px] font-mono text-stone-500 truncate mt-0.5">
              {subtitle}
            </p>
          )}

          {/* Minimal status indicator if running/success/error */}
          {status !== 'idle' && (
            <div className="mt-1 flex items-center gap-1 text-[9px] font-mono">
              {status === 'running' && (
                <>
                  <Loader2 className="h-2.5 w-2.5 text-amber-500 animate-spin" />
                  <span className="text-amber-600">Running...</span>
                </>
              )}
              {status === 'success' && (
                <>
                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                  <span className="text-emerald-700">Done {nodeData.executionTimeMs ? `(${nodeData.executionTimeMs}ms)` : ''}</span>
                </>
              )}
              {status === 'error' && (
                <>
                  <AlertCircle className="h-2.5 w-2.5 text-rose-500" />
                  <span className="text-rose-600">Error</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main output handles */}
      {isIfNode ? (
        <>
          <div className="absolute right-0 top-[35%] translate-x-1/2 flex items-center">
            <Handle
              type="source"
              position={Position.Right}
              id="true"
              className="!w-3 !h-3 !bg-stone-100 !border-2 !border-stone-800 hover:!bg-stone-300"
            />
            <span className="text-[8px] font-mono font-bold text-stone-700 mr-1.5 bg-white px-1 rounded border border-stone-200">
              true
            </span>
          </div>
          <div className="absolute right-0 top-[65%] translate-x-1/2 flex items-center">
            <Handle
              type="source"
              position={Position.Right}
              id="false"
              className="!w-3 !h-3 !bg-stone-100 !border-2 !border-stone-800 hover:!bg-stone-300"
            />
            <span className="text-[8px] font-mono font-bold text-stone-700 mr-1.5 bg-white px-1 rounded border border-stone-200">
              false
            </span>
          </div>
        </>
      ) : (
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          className="!w-3 !h-3 !bg-stone-100 !border-2 !border-stone-600 hover:!border-stone-900 hover:!bg-stone-300 transition-colors"
        />
      )}

      {/* Sub-handles for AI Agent (Model, Memory, Tool) */}
      {hasSubHandles && (
        <div className="border-t border-stone-100 px-3 py-1.5 bg-stone-50/60 rounded-b-xl flex items-center justify-around text-[9px] font-mono text-stone-500">
          <div className="relative flex flex-col items-center">
            <Handle
              type="source"
              position={Position.Bottom}
              id="model"
              className="!w-2.5 !h-2.5 !bg-stone-200 !border !border-stone-600"
            />
            <span className="mt-1">Model</span>
          </div>
          <div className="relative flex flex-col items-center">
            <Handle
              type="source"
              position={Position.Bottom}
              id="memory"
              className="!w-2.5 !h-2.5 !bg-stone-200 !border !border-stone-600"
            />
            <span className="mt-1">Memory</span>
          </div>
          <div className="relative flex flex-col items-center">
            <Handle
              type="source"
              position={Position.Bottom}
              id="tool"
              className="!w-2.5 !h-2.5 !bg-stone-200 !border !border-stone-600"
            />
            <span className="mt-1">Tool</span>
          </div>
        </div>
      )}
    </div>
  );
});
