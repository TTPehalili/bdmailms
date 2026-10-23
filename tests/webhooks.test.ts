import { describe, it } from 'node:test';
import assert from 'node:assert';
import { db } from '../src/lib/db';

describe('Webhook Ingestion Pipeline', () => {
  it('should register and dispatch ephemeral test listener correctly', async () => {
    const workflowId = 'wf-test-webhook';
    const nodeId = 'webhook-node-1';

    // Start listener promise
    const listenerPromise = db.registerTestListener(workflowId, nodeId);

    // Dispatch payload
    const mockPayload = { leadId: 'lead_123', status: 'NEW' };
    const dispatched = db.dispatchTestListener(workflowId, nodeId, mockPayload);

    assert.strictEqual(dispatched, true);

    const received = await listenerPromise;
    assert.strictEqual(received.leadId, 'lead_123');
  });

  it('should find active workflow by registered webhook path', async () => {
    const wf = await db.findWorkflowByWebhookPath('sparring-finished');
    assert.notStrictEqual(wf, null);
    assert.strictEqual(wf?.id, 'wf-arm-rubric');
  });
});
