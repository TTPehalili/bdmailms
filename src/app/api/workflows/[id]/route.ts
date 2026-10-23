import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
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

    return NextResponse.json({
      success: true,
      data: workflow
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to get workflow' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await db.saveWorkflow({
      id,
      name: body.name || 'Untitled Workflow',
      description: body.description,
      active: body.active,
      nodes: body.nodes || [],
      edges: body.edges || [],
      webhookPath: body.webhookPath
    });

    return NextResponse.json({
      success: true,
      data: updated
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update workflow' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await db.deleteWorkflow(id);

    return NextResponse.json({
      success: deleted,
      message: deleted ? 'Workflow deleted successfully' : 'Workflow not found'
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete workflow' },
      { status: 500 }
    );
  }
}
