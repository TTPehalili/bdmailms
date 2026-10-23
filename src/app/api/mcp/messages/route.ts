import { NextRequest, NextResponse } from 'next/server';
import { McpServerHost } from '@/mcp/server-host';

export async function POST(request: NextRequest) {
  try {
    const jsonRpc = await request.json();
    const { id, method, params } = jsonRpc;

    if (method === 'tools/list') {
      const tools = await McpServerHost.listPublishedTools();
      return NextResponse.json({
        jsonrpc: '2.0',
        id: id || 1,
        result: {
          tools
        }
      });
    }

    if (method === 'tools/call') {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};

      const result = await McpServerHost.handleToolCall(toolName, toolArgs);

      return NextResponse.json({
        jsonrpc: '2.0',
        id: id || 1,
        result
      });
    }

    return NextResponse.json({
      jsonrpc: '2.0',
      id: id || 1,
      error: {
        code: -32601,
        message: `Method "${method}" not found`
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32603,
          message: err.message || 'Internal JSON-RPC error'
        }
      },
      { status: 500 }
    );
  }
}
