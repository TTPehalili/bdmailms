import { NextRequest } from 'next/server';
import { McpServerHost } from '@/mcp/server-host';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  const tools = await McpServerHost.listPublishedTools();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial SSE connection event
      controller.enqueue(
        encoder.encode(`event: endpoint\ndata: ${JSON.stringify({ endpoint: '/api/mcp/messages' })}\n\n`)
      );

      // Send discovered workflow tools
      controller.enqueue(
        encoder.encode(`event: tools\ndata: ${JSON.stringify({ tools })}\n\n`)
      );

      // Keepalive heartbeat
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(interval);
        }
      }, 15000);

      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    }
  });
}
