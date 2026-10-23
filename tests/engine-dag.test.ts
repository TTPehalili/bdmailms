import { describe, it } from 'node:test';
import assert from 'node:assert';
import { WorkflowRunner } from '../src/engine/runner';
import { db } from '../src/lib/db';
import { ItemPipeline } from '../src/engine/item-pipeline';

describe('Workflow DAG Execution Engine', () => {
  it('should execute a linear DAG and preserve item dataflow', async () => {
    const testWorkflow = {
      id: 'test-linear-wf',
      name: 'Test Linear Workflow',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nodes: [
        {
          id: 'n1',
          type: 'customNode',
          data: {
            nodeType: 'manualTrigger',
            label: 'Trigger',
            category: 'Triggers',
            config: { mockPayload: '{"leadScore": 85, "rep": "Alex"}' }
          }
        },
        {
          id: 'n2',
          type: 'customNode',
          data: {
            nodeType: 'codeNode',
            label: 'Code Step',
            category: 'Data & Transforms',
            config: {
              code: 'const item = $input.first(); return [{ json: { ...item.json, passed: true } }];'
            }
          }
        }
      ],
      edges: [
        { id: 'e1-2', source: 'n1', target: 'n2', sourceHandle: 'output', targetHandle: 'input' }
      ]
    };

    const execution = await WorkflowRunner.execute(testWorkflow);

    assert.strictEqual(execution.status, 'success');
    assert.strictEqual(execution.nodeOutputs['n2'].output?.[0].json.passed, true);
    assert.strictEqual(execution.nodeOutputs['n2'].output?.[0].json.leadScore, 85);
  });

  it('should branch correctly at IF condition nodes', async () => {
    const ifWorkflow = {
      id: 'test-if-wf',
      name: 'Test If Branching',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nodes: [
        {
          id: 't1',
          type: 'customNode',
          data: {
            nodeType: 'manualTrigger',
            label: 'Start',
            category: 'Triggers',
            config: { mockPayload: '{"score": 90}' }
          }
        },
        {
          id: 'if1',
          type: 'customNode',
          data: {
            nodeType: 'ifNode',
            label: 'Check Score >= 80',
            category: 'Logic & Flow',
            config: { field: '{{ $json.score }}', operator: '>=', value: '80' }
          }
        },
        {
          id: 'trueNode',
          type: 'customNode',
          data: {
            nodeType: 'codeNode',
            label: 'High Score Branch',
            category: 'Data & Transforms',
            config: { code: 'return [{ json: { branch: "TRUE_EXECUTED" } }];' }
          }
        }
      ],
      edges: [
        { id: 'e1', source: 't1', target: 'if1', sourceHandle: 'output', targetHandle: 'input' },
        { id: 'e2', source: 'if1', target: 'trueNode', sourceHandle: 'true', targetHandle: 'input' }
      ]
    };

    const execution = await WorkflowRunner.execute(ifWorkflow);
    assert.strictEqual(execution.status, 'success');
    assert.strictEqual(execution.nodeOutputs['trueNode'].output?.[0].json.branch, 'TRUE_EXECUTED');
  });
});
