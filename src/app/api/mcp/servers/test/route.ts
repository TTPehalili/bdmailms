import { NextRequest, NextResponse } from 'next/server';
import { McpClientManager } from '@/mcp/client-manager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const target = body.urlOrCommand || body.url || 'http://localhost:3000/api/mcp/sse';

    const result = await McpClientManager.testConnection(target);
    return NextResponse.json({
      success: result.success,
      tools: result.tools,
      error: result.error
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error testing MCP server' },
      { status: 500 }
    );
  }
}
