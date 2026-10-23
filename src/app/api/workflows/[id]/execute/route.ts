import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { WorkflowRunner } from '@/engine/runner';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workflow = await db.getWorkflow(id);

    if (!workflow) {
      return NextResponse.json(
        { success: false, error: `Workflow not found with id: ${id}` },
        { status: 404 }
      );
    }

    let bodyPayload: any = {};
    try {
      bodyPayload = await request.json();
    } catch {
      bodyPayload = {};
    }

    const execution = await WorkflowRunner.execute(workflow, {
      triggerNodeId: bodyPayload.triggerNodeId,
      triggerPayload: bodyPayload.payload || bodyPayload,
      triggerSource: bodyPayload.triggerSource || 'manual'
    });

    return NextResponse.json({
      success: execution.status !== 'error',
      data: execution
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Workflow execution error' },
      { status: 500 }
    );
  }
}
