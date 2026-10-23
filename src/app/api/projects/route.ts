import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const projects = await db.listProjects();
    const workflows = await db.listWorkflows();

    // Attach workflow counts
    const withCounts = projects.map((p) => ({
      ...p,
      workflowCount: workflows.filter((w) => w.folderId === p.id).length
    }));

    return NextResponse.json({
      success: true,
      data: withCounts
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to list projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Project folder name is required' },
        { status: 400 }
      );
    }

    const project = await db.saveProject({
      name: body.name.trim(),
      description: body.description,
      color: body.color || '#ED1C24'
    });

    return NextResponse.json({
      success: true,
      data: project
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create project folder' },
      { status: 500 }
    );
  }
}
