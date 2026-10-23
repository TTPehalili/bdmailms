import crypto from 'crypto';
import { INodeDefinition, NodeExecutionContext } from './types';
import { WorkflowItem } from '../engine/item-pipeline';
import { CodeSandbox } from '../engine/sandbox';

export const codeNode: INodeDefinition = {
  name: 'codeNode',
  displayName: 'Code (JS / TS)',
  description: 'Runs custom sandboxed JavaScript code with $input.all(), $input.first(), and Lodash helpers',
  icon: 'Code',
  category: 'Data & Transforms',
  group: ['transform'],
  inputs: [{ id: 'input', type: 'main', label: 'Input' }],
  outputs: [{ id: 'output', type: 'main', label: 'Output' }],
  properties: [
    {
      name: 'code',
      displayName: 'JavaScript Code',
      type: 'code',
      default: `// Loop through input items and enrich json payload
const items = $input.all();
return items.map(item => ({
  json: {
    ...item.json,
    processedAt: DateTime.now(),
    verified: true
  }
}));`
    }
  ],
  execute: async (context: NodeExecutionContext): Promise<WorkflowItem[][]> => {
    const code = context.config.code || 'return $input.all();';
    const output = await CodeSandbox.run(code, context.inputItems);
    return [output];
  }
};

export const setFieldsNode: INodeDefinition = {
  name: 'setFieldsNode',
  displayName: 'Set / Edit Fields',
  description: 'Add, rename, or drop $json properties without writing custom code',
  icon: 'SlidersHorizontal',
  category: 'Data & Transforms',
  group: ['transform'],
  inputs: [{ id: 'input', type: 'main', label: 'Input' }],
  outputs: [{ id: 'output', type: 'main', label: 'Output' }],
  properties: [
    {
      name: 'fieldsJson',
      displayName: 'Fields to Set (JSON or Key-Value Map)',
      type: 'json',
      default: '{\n  "status": "APPROVED",\n  "department": "Sales SDR",\n  "leadScoreTier": "TIER_1"\n}'
    },
    {
      name: 'keepOnlySetFields',
      displayName: 'Keep Only Set Fields',
      type: 'boolean',
      default: false
    }
  ],
  execute: async (context: NodeExecutionContext): Promise<WorkflowItem[][]> => {
    let parsed: Record<string, any> = {};
    try {
      parsed = JSON.parse(context.config.fieldsJson || '{}');
    } catch {
      parsed = {};
    }

    const results: WorkflowItem[] = context.inputItems.map((item) => {
      // Resolve expressions in set fields
      const resolvedFields = context.context.resolve(parsed, item);
      const newJson = context.config.keepOnlySetFields ? { ...resolvedFields } : { ...item.json, ...resolvedFields };
      return {
        ...item,
        json: newJson
      };
    });

    return [results];
  }
};

export const jsonParserNode: INodeDefinition = {
  name: 'jsonParserNode',
  displayName: 'JSON Parser',
  description: 'Parse raw string into structured JSON or stringify objects',
  icon: 'Braces',
  category: 'Data & Transforms',
  group: ['transform'],
  inputs: [{ id: 'input', type: 'main', label: 'Input' }],
  outputs: [{ id: 'output', type: 'main', label: 'Output' }],
  properties: [
    {
      name: 'mode',
      displayName: 'Action',
      type: 'options',
      default: 'parse',
      options: [
        { name: 'Parse String to JSON', value: 'parse' },
        { name: 'Stringify JSON to String', value: 'stringify' }
      ]
    },
    {
      name: 'sourceField',
      displayName: 'Source Property',
      type: 'string',
      default: '{{ $json.rawBody }}'
    },
    {
      name: 'targetField',
      displayName: 'Target Property',
      type: 'string',
      default: 'parsedData'
    }
  ],
  execute: async (context: NodeExecutionContext): Promise<WorkflowItem[][]> => {
    const results = context.inputItems.map((item) => {
      const source = context.context.resolve(context.config.sourceField, item);
      const target = context.config.targetField || 'result';
      let outputVal: any = null;

      if (context.config.mode === 'stringify') {
        outputVal = typeof source === 'object' ? JSON.stringify(source) : String(source);
      } else {
        try {
          outputVal = typeof source === 'string' ? JSON.parse(source) : source;
        } catch {
          outputVal = source;
        }
      }

      return {
        ...item,
        json: { ...item.json, [target]: outputVal }
      };
    });

    return [results];
  }
};

export const dateTimeNode: INodeDefinition = {
  name: 'dateTimeNode',
  displayName: 'Date & Time',
  description: 'Format dates, calculate durations, and convert timezones',
  icon: 'Calendar',
  category: 'Data & Transforms',
  group: ['transform'],
  inputs: [{ id: 'input', type: 'main', label: 'Input' }],
  outputs: [{ id: 'output', type: 'main', label: 'Output' }],
  properties: [
    { name: 'dateInput', displayName: 'Date Expression', type: 'string', default: '{{ $json.timestamp }}' },
    { name: 'format', displayName: 'Format', type: 'string', default: 'YYYY-MM-DD HH:mm:ss' },
    { name: 'targetProperty', displayName: 'Target Property', type: 'string', default: 'formattedDate' }
  ],
  execute: async (context: NodeExecutionContext): Promise<WorkflowItem[][]> => {
    const now = new Date();
    const results = context.inputItems.map((item) => {
      const rawDate = context.context.resolve(context.config.dateInput, item);
      const d = rawDate ? new Date(rawDate) : now;
      const validDate = isNaN(d.getTime()) ? now : d;
      return {
        ...item,
        json: {
          ...item.json,
          [context.config.targetProperty || 'formattedDate']: validDate.toISOString(),
          epoch: validDate.getTime()
        }
      };
    });
    return [results];
  }
};

export const cryptoNode: INodeDefinition = {
  name: 'cryptoNode',
  displayName: 'Crypto & Hash',
  description: 'Generate MD5, SHA-256, HMAC signatures, and Base64 encode/decode',
  icon: 'Key',
  category: 'Data & Transforms',
  group: ['transform'],
  inputs: [{ id: 'input', type: 'main', label: 'Input' }],
  outputs: [{ id: 'output', type: 'main', label: 'Output' }],
  properties: [
    {
      name: 'action',
      displayName: 'Operation',
      type: 'options',
      default: 'sha256',
      options: [
        { name: 'SHA-256 Hash', value: 'sha256' },
        { name: 'MD5 Hash', value: 'md5' },
        { name: 'Base64 Encode', value: 'base64_encode' },
        { name: 'Base64 Decode', value: 'base64_decode' }
      ]
    },
    { name: 'value', displayName: 'Value to Process', type: 'string', default: '{{ $json.email }}' },
    { name: 'targetProperty', displayName: 'Target Property', type: 'string', default: 'hash' }
  ],
  execute: async (context: NodeExecutionContext): Promise<WorkflowItem[][]> => {
    const results = context.inputItems.map((item) => {
      const val = String(context.context.resolve(context.config.value, item) || '');
      let computed = '';
      if (context.config.action === 'sha256') {
        computed = crypto.createHash('sha256').update(val).digest('hex');
      } else if (context.config.action === 'md5') {
        computed = crypto.createHash('md5').update(val).digest('hex');
      } else if (context.config.action === 'base64_encode') {
        computed = Buffer.from(val).toString('base64');
      } else if (context.config.action === 'base64_decode') {
        computed = Buffer.from(val, 'base64').toString('utf8');
      }
      return {
        ...item,
        json: { ...item.json, [context.config.targetProperty || 'hash']: computed }
      };
    });
    return [results];
  }
};
