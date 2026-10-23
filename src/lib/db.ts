import { WorkflowItem } from '../engine/item-pipeline';
import { encryptSecret, decryptSecret } from './crypto';

export interface WorkflowRecord {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  nodes: any[];
  edges: any[];
  webhookPath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionRecord {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'running' | 'success' | 'error';
  startedAt: string;
  finishedAt?: string;
  executionTimeMs?: number;
  triggerSource: 'manual' | 'webhook' | 'schedule' | 'mcp' | 'test';
  nodeOutputs: Record<string, {
    status: 'idle' | 'running' | 'success' | 'error';
    input?: WorkflowItem[];
    output?: WorkflowItem[];
    executionTimeMs?: number;
    error?: string;
  }>;
  error?: string;
}

export interface CredentialRecord {
  id: string;
  name: string;
  type: string;
  encryptedData: string;
  createdAt: string;
  updatedAt: string;
}

export interface EphemeralWebhookListener {
  workflowId: string;
  nodeId: string;
  timestamp: number;
  payload?: any;
  resolve?: (payload: any) => void;
}

// In-Memory and persistent storage store
class WorkflowDatabase {
  private workflows: Map<string, WorkflowRecord> = new Map();
  private executions: Map<string, ExecutionRecord> = new Map();
  private credentials: Map<string, CredentialRecord> = new Map();
  private testListeners: Map<string, EphemeralWebhookListener> = new Map();

  constructor() {
    this.seedDefaults();
  }

  // --- Workflows ---
  async listWorkflows(): Promise<WorkflowRecord[]> {
    return Array.from(this.workflows.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getWorkflow(id: string): Promise<WorkflowRecord | null> {
    return this.workflows.get(id) || null;
  }

  async findWorkflowByWebhookPath(path: string): Promise<WorkflowRecord | null> {
    for (const wf of this.workflows.values()) {
      if (wf.webhookPath === path) return wf;
      // Also check inside nodes for webhook nodes
      const webhookNode = wf.nodes.find(
        (n) => n.data?.nodeType === 'webhookTrigger' || n.type === 'webhookTrigger' || n.category === 'trigger'
      );
      if (webhookNode?.data?.config?.path === path || webhookNode?.config?.path === path) {
        return wf;
      }
    }
    return null;
  }

  async saveWorkflow(data: Partial<WorkflowRecord> & { name: string; nodes: any[]; edges: any[] }): Promise<WorkflowRecord> {
    const id = data.id || `wf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const existing = this.workflows.get(id);

    const record: WorkflowRecord = {
      id,
      name: data.name,
      description: data.description || '',
      active: data.active ?? existing?.active ?? true,
      nodes: data.nodes,
      edges: data.edges,
      webhookPath: data.webhookPath || existing?.webhookPath,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now
    };

    this.workflows.set(id, record);
    return record;
  }

  async deleteWorkflow(id: string): Promise<boolean> {
    return this.workflows.delete(id);
  }

  // --- Executions ---
  async listExecutions(limit = 50): Promise<ExecutionRecord[]> {
    return Array.from(this.executions.values())
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, limit);
  }

  async getExecution(id: string): Promise<ExecutionRecord | null> {
    return this.executions.get(id) || null;
  }

  async saveExecution(record: ExecutionRecord): Promise<ExecutionRecord> {
    this.executions.set(record.id, record);
    return record;
  }

  // --- Credentials ---
  async listCredentials(): Promise<{ id: string; name: string; type: string; createdAt: string }[]> {
    return Array.from(this.credentials.values()).map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      createdAt: c.createdAt
    }));
  }

  async getCredentialData(id: string): Promise<Record<string, any> | null> {
    const record = this.credentials.get(id);
    if (!record) return null;
    try {
      const decrypted = decryptSecret(record.encryptedData);
      return JSON.parse(decrypted);
    } catch {
      return null;
    }
  }

  async saveCredential(name: string, type: string, data: Record<string, any>): Promise<string> {
    const id = `cred-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const encryptedData = encryptSecret(JSON.stringify(data));
    const now = new Date().toISOString();

    this.credentials.set(id, {
      id,
      name,
      type,
      encryptedData,
      createdAt: now,
      updatedAt: now
    });
    return id;
  }

  async deleteCredential(id: string): Promise<boolean> {
    return this.credentials.delete(id);
  }

  // --- Ephemeral Webhook Test Listeners ---
  registerTestListener(workflowId: string, nodeId: string): Promise<any> {
    const key = `${workflowId}:${nodeId}`;
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        if (this.testListeners.has(key)) {
          this.testListeners.delete(key);
        }
      }, 60000);
      if (typeof timer.unref === 'function') {
        timer.unref();
      }

      this.testListeners.set(key, {
        workflowId,
        nodeId,
        timestamp: Date.now(),
        resolve: (payload: any) => {
          clearTimeout(timer);
          resolve(payload);
        }
      });
    });
  }

  dispatchTestListener(workflowId: string, nodeId: string, payload: any): boolean {
    const key = `${workflowId}:${nodeId}`;
    const listener = this.testListeners.get(key);
    if (listener && listener.resolve) {
      listener.resolve(payload);
      this.testListeners.delete(key);
      return true;
    }
    return false;
  }

  // Seed default presets
  private seedDefaults() {
    // 1. Sparring ARM Rubric -> GHL Auto-Tag & Supervisor Slack Escalation
    this.workflows.set('wf-arm-rubric', {
      id: 'wf-arm-rubric',
      name: '⚡ Sparring ARM Rubric ➔ GHL Auto-Tag & Supervisor Escalation',
      description: 'Listens for completed 3-minute AI sparring rounds, evaluates Boris ARM benchmark >= 80%, tags GoHighLevel contact, and alerts Slack.',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      webhookPath: 'sparring-finished',
      nodes: [
        {
          id: 'node-1',
          type: 'customNode',
          position: { x: 80, y: 160 },
          data: {
            nodeType: 'webhookTrigger',
            label: 'Sparring Completed Webhook',
            category: 'Triggers',
            icon: 'Webhook',
            config: {
              path: 'sparring-finished',
              httpMethod: 'POST',
              responseMode: 'onReceived'
            }
          }
        },
        {
          id: 'node-2',
          type: 'customNode',
          position: { x: 420, y: 160 },
          data: {
            nodeType: 'ifNode',
            label: 'Evaluate ARM Benchmark (>= 80%)',
            category: 'Logic & Flow',
            icon: 'GitFork',
            config: {
              field: '{{ $json.body.score }}',
              operator: '>=',
              value: 80
            }
          }
        },
        {
          id: 'node-3',
          type: 'customNode',
          position: { x: 760, y: 80 },
          data: {
            nodeType: 'slackNode',
            label: 'Slack Floor Alert',
            category: 'App Integrations',
            icon: 'Slack',
            config: {
              channel: '#floor-supervisors',
              text: '🎉 Rep {{ $node["Sparring Completed Webhook"].json.body.repName }} scored {{ $node["Sparring Completed Webhook"].json.body.score }}% on ARM Sparring!'
            }
          }
        },
        {
          id: 'node-4',
          type: 'customNode',
          position: { x: 760, y: 280 },
          data: {
            nodeType: 'mcpToolCallerNode',
            label: 'Claude 3.5 Coaching Feedback (MCP)',
            category: 'Model Context Protocol (MCP)',
            icon: 'Cpu',
            config: {
              serverSource: 'sse',
              toolName: 'generate_coaching_rubric',
              toolArguments: '{"score": "{{ $node[\'Sparring Completed Webhook\'].json.body.score }}"}'
            }
          }
        }
      ],
      edges: [
        { id: 'e1-2', source: 'node-1', target: 'node-2', sourceHandle: 'output', targetHandle: 'input' },
        { id: 'e2-3', source: 'node-2', target: 'node-3', sourceHandle: 'true', targetHandle: 'input' },
        { id: 'e2-4', source: 'node-2', target: 'node-4', sourceHandle: 'false', targetHandle: 'input' }
      ]
    });

    // 2. Hot Lead Ingest -> Telephony Boris Dial & Supabase CRM
    this.workflows.set('wf-hot-transfer', {
      id: 'wf-hot-transfer',
      name: '📞 Hot Lead Ingest ➔ Boris Telephony Dial & CRM Enrich',
      description: 'Instant lead qualification via Webhook, AI enrichment via GPT-4o, and automated softphone ring-down.',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      webhookPath: 'inbound-lead',
      nodes: [
        {
          id: 'lead-1',
          type: 'customNode',
          position: { x: 80, y: 180 },
          data: {
            nodeType: 'webhookTrigger',
            label: 'Inbound Webhook Lead',
            category: 'Triggers',
            icon: 'Webhook',
            config: {
              path: 'inbound-lead',
              httpMethod: 'POST',
              responseMode: 'lastNode'
            }
          }
        },
        {
          id: 'lead-2',
          type: 'customNode',
          position: { x: 420, y: 180 },
          data: {
            nodeType: 'codeNode',
            label: 'Normalize & Sanitize Lead Phone',
            category: 'Data & Transforms',
            icon: 'Code',
            config: {
              code: 'const item = $input.first();\nconst phone = (item.json.body?.phone || "").replace(/[^0-9+]/g, "");\nreturn [{ json: { ...item.json.body, normalizedPhone: phone, readyForDial: phone.length >= 10 } }];'
            }
          }
        },
        {
          id: 'lead-3',
          type: 'customNode',
          position: { x: 760, y: 180 },
          data: {
            nodeType: 'httpRequestNode',
            label: 'Boris Telephony Softphone Dial',
            category: 'Core Protocols',
            icon: 'Globe',
            config: {
              method: 'POST',
              url: 'https://api.appointmentlyy.ai/telephony/dial',
              bodyType: 'json',
              bodyContent: '{"destination": "{{ $json.normalizedPhone }}", "agent": "Boris AI"}'
            }
          }
        }
      ],
      edges: [
        { id: 'el-1-2', source: 'lead-1', target: 'lead-2', sourceHandle: 'output', targetHandle: 'input' },
        { id: 'el-2-3', source: 'lead-2', target: 'lead-3', sourceHandle: 'output', targetHandle: 'input' }
      ]
    });
  }
}

// Global Singleton for Next.js hot module reloads
const globalForDb = global as unknown as { workflowDatabase?: WorkflowDatabase };
export const db = globalForDb.workflowDatabase || new WorkflowDatabase();
if (process.env.NODE_ENV !== 'production') globalForDb.workflowDatabase = db;
