import { describe, it } from 'node:test';
import assert from 'node:assert';
import { httpRequestNode } from '../src/registry/protocols';
import { ExpressionContext } from '../src/engine/context';

describe('HTTP Request Protocol Node', () => {
  it('should execute outbound request with expression interpolation and mock fallback', async () => {
    const context = {
      nodeId: 'http-1',
      nodeName: 'Test HTTP',
      workflowId: 'wf-1',
      executionId: 'exec-1',
      config: {
        method: 'POST',
        url: 'https://httpbin.org/post',
        bodyType: 'json',
        bodyContent: '{"leadName": "{{ $json.name }}"}',
        retryCount: 1
      },
      inputItems: [{ json: { name: 'Arthur Vance' } }],
      context: new ExpressionContext({
        executionId: 'exec-1',
        workflowId: 'wf-1',
        nodeOutputs: {},
        nodeNames: {}
      })
    };

    const result = await httpRequestNode.execute!(context);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].length, 1);
    assert.ok(result[0][0].json.httpResponse);
    assert.strictEqual(result[0][0].json.httpResponse.status, 200);
  });
});
