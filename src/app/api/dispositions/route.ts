import { NextResponse } from 'next/server';
import { INITIAL_DEFAULT_DISPOSITIONS, CallDisposition } from '@/lib/dispositionStore';

// In-memory cache for the server session
let serverDispositionsCache: CallDisposition[] = [...INITIAL_DEFAULT_DISPOSITIONS];

export async function GET() {
  return NextResponse.json({
    success: true,
    dispositions: serverDispositionsCache
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.dispositions && Array.isArray(body.dispositions)) {
      serverDispositionsCache = body.dispositions;
      return NextResponse.json({ success: true, count: serverDispositionsCache.length });
    }

    if (body.disposition && body.disposition.id) {
      const existingIdx = serverDispositionsCache.findIndex(d => d.id === body.disposition.id);
      if (existingIdx >= 0) {
        serverDispositionsCache[existingIdx] = body.disposition;
      } else {
        serverDispositionsCache.unshift(body.disposition);
      }
      return NextResponse.json({ success: true, disposition: body.disposition });
    }

    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id query param' }, { status: 400 });
    }
    serverDispositionsCache = serverDispositionsCache.filter(d => d.id !== id);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
