import { WorkflowItem } from '../engine/item-pipeline';
import { ExpressionContext } from '../engine/context';

export type NodeCategory = 
  | 'Triggers'
  | 'Logic & Flow'
  | 'Data & Transforms'
  | 'App Integrations'
  | 'AI & LLMs'
  | 'Model Context Protocol (MCP)'
  | 'Core Protocols';

export interface PortDefinition {
  id: string;
  type: 'main' | 'condition';
  label: string;
}

export interface NodeProperty {
  name: string;
  displayName: string;
  type: 'string' | 'number' | 'boolean' | 'options' | 'json' | 'code' | 'collection';
  default: any;
  required?: boolean;
  options?: { name: string; value: string }[];
  displayOptions?: {
    show?: Record<string, any[]>; // e.g. { operation: ['sendMessage'] }
  };
  description?: string;
}

export interface NodeExecutionContext {
  nodeId: string;
  nodeName: string;
  workflowId: string;
  executionId: string;
  config: Record<string, any>;
  inputItems: WorkflowItem[];
  context: ExpressionContext;
  getCredential?: (type: string) => Promise<Record<string, any> | null>;
}

export interface INodeDefinition {
  name: string;                   // Internal identifier (e.g. "slackNode")
  displayName: string;           // Label shown in UI (e.g. "Slack")
  description: string;           // Short help text
  icon: string;                  // Lucide icon name or SVG path
  category: NodeCategory;        // Trigger | Logic | Data | App | AI | MCP
  group: ('trigger' | 'action' | 'transform')[];
  inputs: PortDefinition[];      // e.g. [{ id: 'input', type: 'main', label: 'Input' }]
  outputs: PortDefinition[];     // e.g. [{ id: 'output', type: 'main', label: 'Output' }]
  credentials?: {
    type: string;                // e.g. "slackApi", "githubToken"
    required: boolean;
  };
  properties: NodeProperty[];    // Configuration fields & dropdowns
  execute?: (context: NodeExecutionContext) => Promise<WorkflowItem[][]>;
}
