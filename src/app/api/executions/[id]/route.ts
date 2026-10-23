import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const execution = await db.getExecution(id);

    if (!execution) {
      return NextResponse.json(
        { success: false, error: `Execution record not found with id: ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: execution
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to get execution' },
      { status: 500 }
    );
  }
}
