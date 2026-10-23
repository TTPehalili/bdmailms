import { NextRequest, NextResponse } from 'next/server';
import { McpClientManager } from '@/mcp/client-manager';

export async function GET() {
  try {
    const servers = McpClientManager.listServers();
    return NextResponse.json({
      success: true,
      data: servers
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to list MCP servers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.urlOrCommand) {
      return NextResponse.json(
        { success: false, error: 'Server name and urlOrCommand are required' },
        { status: 400 }
      );
    }

    const id = body.id || `mcp-srv-${Date.now()}`;
    McpClientManager.addServer({
      id,
      name: body.name,
      transport: body.transport || 'sse',
      urlOrCommand: body.urlOrCommand,
      status: 'connected',
      lastPing: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      data: McpClientManager.getServer(id)
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add MCP server' },
      { status: 500 }
    );
  }
}
