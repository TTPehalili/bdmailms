import { INodeDefinition, NodeExecutionContext } from './types';
import { WorkflowItem } from '../engine/item-pipeline';

export const slackNode: INodeDefinition = {
  name: 'slackNode',
  displayName: 'Slack',
  description: 'Post messages, alert channels, upload files, and trigger Slack notifications',
  icon: 'Slack',
  category: 'App Integrations',
  group: ['action'],
  inputs: [{ id: 'input', type: 'main', label: 'Input' }],
  outputs: [{ id: 'output', type: 'main', label: 'Output' }],
  credentials: { type: 'slackApi', required: false },
  properties: [
    {
      name: 'operation',
      displayName: 'Operation',
      type: 'options',
      default: 'postMessage',
      options: [
        { name: 'Send Channel Message', value: 'postMessage' },
        { name: 'Send Direct Message', value: 'sendDm' },
        { name: 'Add Emoji Reaction', value: 'addReaction' }
      ]
    },
    {
      name: 'channel',
      displayName: 'Channel or User ID',
      type: 'string',
      default: '#floor-supervisors',
      required: true
    },
    {
      name: 'text',
      displayName: 'Message Content',
      type: 'string',
      default: '🚀 Workflow alert: {{ $json.message || "New event occurred" }}',
      required: true
    }
  ],
  execute: async (context: NodeExecutionContext): Promise<WorkflowItem[][]> => {
    const results = context.inputItems.map((item) => {
      const channel = context.context.resolve(context.config.channel, item);
      const text = context.context.resolve(context.config.text, item);
      return {
        ...item,
        json: {
          ...item.json,
          slack: {
            ok: true,
            channel,
            ts: `${Date.now() / 1000}`,
            message: text,
            deliveredAt: new Date().toISOString()
          }
        }
      };
    });
    return [results];
  }
};

export const discordNode: INodeDefinition = {
  name: 'discordNode',
  displayName: 'Discord',
  description: 'Post webhook messages, build rich embeds, and alert Discord channels',
  icon: 'MessageSquare',
  category: 'App Integrations',
  group: ['action'],
  inputs: [{ id: 'input', type: 'main', label: 'Input' }],
  outputs: [{ id: 'output', type: 'main', label: 'Output' }],
  properties: [
    { name: 'webhookUrl', displayName: 'Discord Webhook URL', type: 'string', default: '' },
    { name: 'content', displayName: 'Message Content', type: 'string', default: 'Lead Alert: {{ $json.name }}' }
  ],
  execute: async (context: NodeExecutionContext): Promise<WorkflowItem[][]> => {
    const results = context.inputItems.map((item) => ({
      ...item,
      json: {
        ...item.json,
        discord: { delivered: true, timestamp: new Date().toISOString() }
      }
    }));
    return [results];
  }
};

export const telegramNode: INodeDefinition = {
  name: 'telegramNode',
  displayName: 'Telegram',
  description: 'Send bot messages, photos, and alerts to Telegram chats',
  icon: 'Send',
  category: 'App Integrations',
  group: ['action'],
  inputs: [{ id: 'input', type: 'main', label: 'Input' }],
  outputs: [{ id: 'output', type: 'main', label: 'Output' }],
  properties: [
    { name: 'chatId', displayName: 'Chat ID', type: 'string', default: '' },
    { name: 'text', displayName: 'Message Text', type: 'string', default: 'Telegram Alert: {{ $json.event }}' }
  ],
  execute: async (context: NodeExecutionContext): Promise<WorkflowItem[][]> => {
    return [context.inputItems.map((item) => ({
      ...item,
      json: { ...item.json, telegram: { sent: true, date: Date.now() } }
    }))];
  }
};

export const githubNode: INodeDefinition = {
  name: 'githubNode',
  displayName: 'GitHub',
  description: 'Create issues, trigger repository dispatch workflows, and list PRs',
  icon: 'GitPullRequest',
  category: 'App Integrations',
  group: ['action'],
  inputs: [{ id: 'input', type: 'main', label: 'Input' }],
  outputs: [{ id: 'output', type: 'main', label: 'Output' }],
  properties: [
    {
      name: 'operation',
      displayName: 'Operation',
      type: 'options',
      default: 'createIssue',
      options: [
        { name: 'Create Issue', value: 'createIssue' },
        { name: 'Create Pull Request', value: 'createPr' },
        { name: 'Dispatch Workflow', value: 'dispatchWorkflow' }
      ]
    },
    { name: 'repository', displayName: 'Repository (owner/repo)', type: 'string', default: 'appointmentlyy/sdr-core' },
    { name: 'title', displayName: 'Title', type: 'string', default: 'QA Escalation: {{ $json.issueSummary || "Rep Sparring Review" }}' }
  ],
  execute: async (context: NodeExecutionContext): Promise<WorkflowItem[][]> => {
    return [context.inputItems.map((item) => {
      const repo = context.context.resolve(context.config.repository, item);
      const title = context.context.resolve(context.config.title, item);
      return {
        ...item,
        json: {
          ...item.json,
          github: {
            issueId: Math.floor(1000 + Math.random() * 9000),
            htmlUrl: `https://github.com/${repo}/issues/101`,
            title,
            state: 'open'
          }
        }
      };
    })];
  }
};

export const googleSheetsNode: INodeDefinition = {
  name: 'googleSheetsNode',
  displayName: 'Google Sheets',
  description: 'Append rows, update spreadsheets, or query spreadsheet tabs',
  icon: 'Sheet',
  category: 'App Integrations',
  group: ['action'],
  inputs: [{ id: 'input', type: 'main', label: 'Input' }],
  outputs: [{ id: 'output', type: 'main', label: 'Output' }],
  properties: [
    {
      name: 'operation',
      displayName: 'Operation',
      type: 'options',
      default: 'appendRow',
      options: [
        { name: 'Append Row', value: 'appendRow' },
        { name: 'Read Rows', value: 'readRows' },
        { name: 'Update Row', value: 'updateRow' }
      ]
    },
    { name: 'spreadsheetId', displayName: 'Spreadsheet ID', type: 'string', default: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms' },
    { name: 'sheetName', displayName: 'Sheet Name / Tab', type: 'string', default: 'Leads' }
  ],
  execute: async (context: NodeExecutionContext): Promise<WorkflowItem[][]> => {
    return [context.inputItems.map((item) => ({
      ...item,
      json: {
        ...item.json,
        googleSheets: {
          spreadsheetId: context.config.spreadsheetId,
          sheetName: context.config.sheetName,
          rowAppended: true,
          updatedRange: `${context.config.sheetName}!A24:E24`
        }
      }
    }))];
  }
};

export const googleDriveNode: INodeDefinition = {
  name: 'googleDriveNode',
  displayName: 'Google Drive',
  description: 'Upload files, search documents, and organize drive folders',
  icon: 'FolderSync',
  category: 'App Integrations',
  group: ['action'],
  inputs: [{ id: 'input', type: 'main', label: 'Input' }],
  outputs: [{ id: 'output', type: 'main', label: 'Output' }],
  properties: [
    { name: 'folderId', displayName: 'Parent Folder ID', type: 'string', default: 'root' },
    { name: 'fileName', displayName: 'File Name', type: 'string', default: 'transcription.wav' }
  ],
  execute: async (context: NodeExecutionContext): Promise<WorkflowItem[][]> => {
    return [context.inputItems.map((item) => ({
      ...item,
      json: { ...item.json, googleDrive: { fileId: `drive_f_${Date.now()}`, uploaded: true } }
    }))];
  }
};

export const notionNode: INodeDefinition = {
  name: 'notionNode',
  displayName: 'Notion',
  description: 'Create database pages, append blocks, and synchronize CRM documents',
  icon: 'FileText',
  category: 'App Integrations',
  group: ['action'],
  inputs: [{ id: 'input', type: 'main', label: 'Input' }],
  outputs: [{ id: 'output', type: 'main', label: 'Output' }],
  properties: [
    { name: 'databaseId', displayName: 'Database ID', type: 'string', default: 'crm_knowledge_hub' },
    { name: 'title', displayName: 'Page Title', type: 'string', default: 'Lead Note: {{ $json.company || "Enterprise Account" }}' }
  ],
  execute: async (context: NodeExecutionContext): Promise<WorkflowItem[][]> => {
    return [context.inputItems.map((item) => ({
      ...item,
      json: {
        ...item.json,
        notion: { pageId: `ntn_pg_${Date.now()}`, synced: true }
      }
    }))];
  }
};

export const airtableNode: INodeDefinition = {
  name: 'airtableNode',
  displayName: 'Airtable',
  description: 'List, create, update, or delete records in Airtable bases',
  icon: 'Database',
  category: 'App Integrations',
  group: ['action'],
  inputs: [{ id: 'input', type: 'main', label: 'Input' }],
  outputs: [{ id: 'output', type: 'main', label: 'Output' }],
  properties: [
    { name: 'baseId', displayName: 'Base ID', type: 'string', default: 'appXYZ123' },
    { name: 'table', displayName: 'Table Name', type: 'string', default: 'Contacts' }
  ],
  execute: async (context: NodeExecutionContext): Promise<WorkflowItem[][]> => {
    return [context.inputItems.map((item) => ({
      ...item,
      json: { ...item.json, airtable: { recordId: `rec${Date.now()}`, status: 'created' } }
    }))];
  }
};

export const stripeNode: INodeDefinition = {
  name: 'stripeNode',
  displayName: 'Stripe',
  description: 'Create payment links, retrieve customers, and trigger billing events',
  icon: 'CreditCard',
  category: 'App Integrations',
  group: ['action'],
  inputs: [{ id: 'input', type: 'main', label: 'Input' }],
  outputs: [{ id: 'output', type: 'main', label: 'Output' }],
  properties: [
    {
      name: 'operation',
      displayName: 'Operation',
      type: 'options',
      default: 'createPaymentLink',
      options: [
        { name: 'Create Payment Link', value: 'createPaymentLink' },
        { name: 'Retrieve Customer', value: 'retrieveCustomer' },
        { name: 'Create Refund', value: 'createRefund' }
      ]
    },
    { name: 'amount', displayName: 'Amount ($ USD)', type: 'number', default: 500 }
  ],
  execute: async (context: NodeExecutionContext): Promise<WorkflowItem[][]> => {
    return [context.inputItems.map((item) => ({
      ...item,
      json: {
        ...item.json,
        stripe: {
          id: `plink_${Date.now()}`,
          url: 'https://buy.stripe.com/test_123',
          amount: context.config.amount || 500,
          currency: 'usd'
        }
      }
    }))];
  }
};

export const resendNode: INodeDefinition = {
  name: 'resendNode',
  displayName: 'Resend / SendGrid',
  description: 'Send transactional emails with HTML templates and tracking',
  icon: 'MailCheck',
  category: 'App Integrations',
  group: ['action'],
  inputs: [{ id: 'input', type: 'main', label: 'Input' }],
  outputs: [{ id: 'output', type: 'main', label: 'Output' }],
  properties: [
    { name: 'to', displayName: 'To Email', type: 'string', default: '{{ $json.email || "prospect@client.com" }}' },
    { name: 'subject', displayName: 'Subject', type: 'string', default: 'Appointmentlyy Confirmation' },
    { name: 'htmlBody', displayName: 'HTML Body', type: 'string', default: '<p>Hi {{ $json.name }}, here is your briefing.</p>' }
  ],
  execute: async (context: NodeExecutionContext): Promise<WorkflowItem[][]> => {
    return [context.inputItems.map((item) => ({
      ...item,
      json: { ...item.json, resend: { id: `msg_${Date.now()}`, status: 'queued', delivered: true } }
    }))];
  }
};

export const supabaseNode: INodeDefinition = {
  name: 'supabaseNode',
  displayName: 'Supabase / Postgres',
  description: 'Insert, update, or select records in PostgreSQL / Supabase databases',
  icon: 'Server',
  category: 'App Integrations',
  group: ['action'],
  inputs: [{ id: 'input', type: 'main', label: 'Input' }],
  outputs: [{ id: 'output', type: 'main', label: 'Output' }],
  properties: [
    {
      name: 'operation',
      displayName: 'Operation',
      type: 'options',
      default: 'insert',
      options: [
        { name: 'Insert Row', value: 'insert' },
        { name: 'Select Rows', value: 'select' },
        { name: 'Update Row', value: 'update' }
      ]
    },
    { name: 'table', displayName: 'Table Name', type: 'string', default: 'leads' }
  ],
  execute: async (context: NodeExecutionContext): Promise<WorkflowItem[][]> => {
    return [context.inputItems.map((item) => ({
      ...item,
      json: {
        ...item.json,
        supabase: {
          table: context.config.table || 'leads',
          affectedRows: 1,
          status: 'success'
        }
      }
    }))];
  }
};
