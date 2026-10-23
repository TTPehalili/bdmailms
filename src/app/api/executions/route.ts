import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit')) || 50;

    const executions = await db.listExecutions(limit);
    return NextResponse.json({
      success: true,
      total: executions.length,
      data: executions
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to list executions' },
      { status: 500 }
    );
  }
}
