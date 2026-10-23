import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

async function handleWebhookTest(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string; nodeId: string }> }
) {
  try {
    const { workflowId, nodeId } = await params;

    let body = {};
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      try {
        body = await request.json();
      } catch {
        body = { raw: await request.text() };
      }
    }

    const payload = {
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      query: Object.fromEntries(new URL(request.url).searchParams.entries()),
      body,
      receivedAt: new Date().toISOString()
    };

    // Dispatch to registered ephemeral test listener
    const dispatched = db.dispatchTestListener(workflowId, nodeId, payload);

    return NextResponse.json({
      success: true,
      message: 'Ephemeral test webhook payload received successfully',
      dispatchedToCanvas: dispatched,
      payloadPreview: payload
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error processing test webhook' },
      { status: 500 }
    );
  }
}

export const GET = handleWebhookTest;
export const POST = handleWebhookTest;
export const PUT = handleWebhookTest;
export const DELETE = handleWebhookTest;
