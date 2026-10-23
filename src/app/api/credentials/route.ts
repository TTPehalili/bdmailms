import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const creds = await db.listCredentials();
    return NextResponse.json({
      success: true,
      data: creds
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to list credentials' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.type || !body.data) {
      return NextResponse.json(
        { success: false, error: 'Name, type, and data payload are required' },
        { status: 400 }
      );
    }

    const id = await db.saveCredential(body.name, body.type, body.data);
    return NextResponse.json({
      success: true,
      data: { id, name: body.name, type: body.type }
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to save credential' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Credential ID required' }, { status: 400 });
    }
    const deleted = await db.deleteCredential(id);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
