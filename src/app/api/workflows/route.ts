import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const workflows = await db.listWorkflows();
    return NextResponse.json({
      success: true,
      data: workflows
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to list workflows' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Workflow name is required' },
        { status: 400 }
      );
    }

    const workflow = await db.saveWorkflow({
      id: body.id,
      name: body.name,
      description: body.description || '',
      active: body.active ?? true,
      nodes: body.nodes || [],
      edges: body.edges || [],
      webhookPath: body.webhookPath
    });

    return NextResponse.json({
      success: true,
      data: workflow
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create workflow' },
      { status: 500 }
    );
  }
}
