import { INodeDefinition, NodeExecutionContext } from './types';
import { WorkflowItem } from '../engine/item-pipeline';
import { db } from '../lib/db';
import { WorkflowRunner } from '../engine/runner';

export const ifNode: INodeDefinition = {
  name: 'ifNode',
  displayName: 'If / Branch',
  description: 'Splits execution flow based on conditional rules (True / False)',
  icon: 'GitFork',
  category: 'Logic & Flow',
  group: ['transform'],
  inputs: [{ id: 'input', type: 'main', label: 'Input' }],
  outputs: [
    { id: 'true', type: 'condition', label: 'True' },
    { id: 'false', type: 'condition', label: 'False' }
  ],
  properties: [
    {
      name: 'field',
      displayName: 'Field to Check',
      type: 'string',
      default: '{{ $json.score }}',
      required: true,
      description: 'Supports expressions e.g. {{ $json.score }} or {{ $json.status }}'
    },
    {
      name: 'operator',
      displayName: 'Operator',
      type: 'options',
      default: '==',
      options: [
        { name: 'Equals (==)', value: '==' },
        { name: 'Not Equals (!=)', value: '!=' },
        { name: 'Greater Than (>)', value: '>' },
        { name: 'Greater or Equal (>=)', value: '>=' },
        { name: 'Less Than (<)', value: '<' },
        { name: 'Less or Equal (<=)', value: '<=' },
        { name: 'Contains', value: 'contains' },
        { name: 'Not Empty', value: 'notEmpty' }
      ]
    },
    {
      name: 'value',
      displayName: 'Comparison Value',
      type: 'string',
      default: '80'
    }
  ],
  execute: async (context: NodeExecutionContext): Promise<WorkflowItem[][]> => {
    const trueBranch: WorkflowItem[] = [];
    const falseBranch: WorkflowItem[] = [];

    for (const item of context.inputItems) {
      const resolvedField = context.context.resolve(context.config.field, item);
      const resolvedValue = context.context.resolve(context.config.value, item);
      const op = context.config.operator || '==';

      let conditionMet = false;
      const numField = Number(resolvedField);
      const numVal = Number(resolvedValue);
      const isNumeric = !isNaN(numField) && !isNaN(numVal) && resolvedValue !== '';

      switch (op) {
        case '==':
          conditionMet = String(resolvedField) === String(resolvedValue);
          break;
        case '!=':
          conditionMet = String(resolvedField) !== String(resolvedValue);
          break;
        case '>':
          conditionMet = isNumeric ? numField > numVal : String(resolvedField) > String(resolvedValue);
          break;
        case '>=':
          conditionMet = isNumeric ? numField >= numVal : String(resolvedField) >= String(resolvedValue);
          break;
        case '<':
          conditionMet = isNumeric ? numField < numVal : String(resolvedField) < String(resolvedValue);
          break;
        case '<=':
          conditionMet = isNumeric ? numField <= numVal : String(resolvedField) <= String(resolvedValue);
          break;
        case 'contains':
          conditionMet = String(resolvedField).toLowerCase().includes(String(resolvedValue).toLowerCase());
          break;
        case 'notEmpty':
          conditionMet = resolvedField !== undefined && resolvedField !== null && String(resolvedField).trim() !== '';
          break;
      }

      if (conditionMet) {
        trueBranch.push({
          ...item,
          json: { ...item.json, _conditionBranch: 'true' }
        });
      } else {
        falseBranch.push({
          ...item,
          json: { ...item.json, _conditionBranch: 'false' }
        });
      }
    }

    return [
      trueBranch.length > 0 ? trueBranch : [],
      falseBranch.length > 0 ? falseBranch : []
    ];
  }
};

export const switchNode: INodeDefinition = {
  name: 'switchNode',
  displayName: 'Switch',
  description: 'Routes data to multiple paths based on matching rules or case values',
  icon: 'Shuffle',
  category: 'Logic & Flow',
  group: ['transform'],
  inputs: [{ id: 'input', type: 'main', label: 'Input' }],
  outputs: [
    { id: 'output', type: 'main', label: 'Default' },
    { id: 'output_1', type: 'main', label: 'Route 1' },
    { id: 'output_2', type: 'main', label: 'Route 2' }
  ],
  properties: [
    {
      name: 'field',
      displayName: 'Field to Switch On',
      type: 'string',
      default: '{{ $json.status }}'
    },
    {
      name: 'cases',
      displayName: 'Cases (comma-separated)',
      type: 'string',
      default: 'qualified, unqualified, callback'
    }
  ],
  execute: async (context: NodeExecutionContext): Promise<WorkflowItem[][]> => {
    return [context.inputItems];
  }
};

export const filterNode: INodeDefinition = {
  name: 'filterNode',
  displayName: 'Filter',
  description: 'Removes items that do not meet specified criteria from the stream',
  icon: 'Filter',
  category: 'Logic & Flow',
  group: ['transform'],
  inputs: [{ id: 'input', type: 'main', label: 'Input' }],
  outputs: [{ id: 'output', type: 'main', label: 'Filtered Output' }],
  properties: [
    { name: 'field', displayName: 'Field', type: 'string', default: '{{ $json.active }}' },
    { name: 'operator', displayName: 'Operator', type: 'options', default: '==', options: [
      { name: 'Equals True', value: 'true' },
      { name: 'Not Null', value: 'notNull' }
    ]}
  ],
  execute: async (context: NodeExecutionContext): Promise<WorkflowItem[][]> => {
    const passed = context.inputItems.filter((i) => {
      const val = context.context.resolve(context.config.field, i);
      return Boolean(val);
    });
    return [passed.length > 0 ? passed : [{ json: {} }]];
  }
};

export const loopNode: INodeDefinition = {
  name: 'loopNode',
  displayName: 'Loop / Batch',
  description: 'Batches large item lists into chunks of size N for throttled processing',
  icon: 'Repeat',
  category: 'Logic & Flow',
  group: ['transform'],
  inputs: [{ id: 'input', type: 'main', label: 'Input' }],
  outputs: [
    { id: 'batch', type: 'main', label: 'Batch Output' },
    { id: 'done', type: 'main', label: 'Complete' }
  ],
  properties: [
    { name: 'batchSize', displayName: 'Batch Size', type: 'number', default: 10 }
  ],
  execute: async (context: NodeExecutionContext): Promise<WorkflowItem[][]> => {
    const batchSize = Math.max(1, Number(context.config.batchSize) || 10);
    const batch = context.inputItems.slice(0, batchSize);
    return [batch, [{ json: { totalProcessed: context.inputItems.length, batches: Math.ceil(context.inputItems.length / batchSize) } }]];
  }
};

export const mergeNode: INodeDefinition = {
  name: 'mergeNode',
  displayName: 'Merge / Join',
  description: 'Combines multiple branch streams: Append, Combine Key, or Wait for All',
  icon: 'GitMerge',
  category: 'Logic & Flow',
  group: ['transform'],
  inputs: [{ id: 'input', type: 'main', label: 'Inputs' }],
  outputs: [{ id: 'output', type: 'main', label: 'Merged Output' }],
  properties: [
    {
      name: 'mode',
      displayName: 'Merge Mode',
      type: 'options',
      default: 'append',
      options: [
        { name: 'Append All Items', value: 'append' },
        { name: 'Combine by Matching Key', value: 'combine' },
        { name: 'Wait for Both Inputs', value: 'wait' }
      ]
    }
  ],
  execute: async (context: NodeExecutionContext): Promise<WorkflowItem[][]> => {
    return [context.inputItems];
  }
};

export const delayNode: INodeDefinition = {
  name: 'delayNode',
  displayName: 'Delay / Sleep',
  description: 'Pauses workflow execution for N seconds or minutes',
  icon: 'Hourglass',
  category: 'Logic & Flow',
  group: ['transform'],
  inputs: [{ id: 'input', type: 'main', label: 'Input' }],
  outputs: [{ id: 'output', type: 'main', label: 'Output' }],
  properties: [
    { name: 'seconds', displayName: 'Duration (Seconds)', type: 'number', default: 2 }
  ],
  execute: async (context: NodeExecutionContext): Promise<WorkflowItem[][]> => {
    const sec = Math.min(10, Math.max(0.1, Number(context.config.seconds) || 1));
    await new Promise((r) => setTimeout(r, sec * 1000));
    return [context.inputItems];
  }
};

export const subWorkflowNode: INodeDefinition = {
  name: 'subWorkflowNode',
  displayName: 'Sub-Workflow',
  description: 'Triggers another workflow by ID and returns its resulting output items',
  icon: 'Layers',
  category: 'Logic & Flow',
  group: ['transform'],
  inputs: [{ id: 'input', type: 'main', label: 'Input' }],
  outputs: [{ id: 'output', type: 'main', label: 'Output' }],
  properties: [
    { name: 'subWorkflowId', displayName: 'Sub-Workflow ID', type: 'string', default: '', required: true }
  ],
  execute: async (context: NodeExecutionContext): Promise<WorkflowItem[][]> => {
    const subWf = await db.getWorkflow(context.config.subWorkflowId);
    if (!subWf) {
      return [context.inputItems];
    }
    const result = await WorkflowRunner.execute(subWf, {
      triggerSource: 'manual',
      triggerPayload: context.inputItems
    });
    // Find output of last node
    const lastNodeOutput = Object.values(result.nodeOutputs).pop()?.output;
    return [lastNodeOutput || context.inputItems];
  }
};
