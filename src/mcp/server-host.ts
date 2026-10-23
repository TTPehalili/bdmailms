import { db, WorkflowRecord } from '../lib/db';
import { WorkflowRunner } from '../engine/runner';
import { McpSchemaMapper, McpToolSchema } from './schema-mapper';

export class McpServerHost {
  /**
   * List all published workflows exposed as MCP tools
   */
  static async listPublishedTools(): Promise<McpToolSchema[]> {
    const workflows = await db.listWorkflows();
    const activeWorkflows = workflows.filter((w) => w.active);
    return activeWorkflows.map((w) => McpSchemaMapper.workflowToMcpTool(w));
  }

  /**
   * Handle an MCP tools/call request targeting a workflow
   */
  static async handleToolCall(
    toolName: string,
    args: Record<string, any>
  ): Promise<{ content: Array<{ type: string; text: string }>; isError: boolean }> {
    const workflows = await db.listWorkflows();
    
    // Find matching workflow
    const matched = workflows.find((w) => {
      const toolSchema = McpSchemaMapper.workflowToMcpTool(w);
      return toolSchema.name === toolName || w.id === toolName;
    });

    if (!matched) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Workflow tool "${toolName}" not found or inactive.`
          }
        ]
      };
    }

    try {
      const execution = await WorkflowRunner.execute(matched, {
        triggerSource: 'mcp',
        triggerPayload: args.payload || args
      });

      return {
        isError: execution.status === 'error',
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              executionId: execution.id,
              workflowId: matched.id,
              status: execution.status,
              executionTimeMs: execution.executionTimeMs,
              outputs: execution.nodeOutputs,
              error: execution.error
            }, null, 2)
          }
        ]
      };
    } catch (err: any) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Workflow execution failed: ${err.message || String(err)}`
          }
        ]
      };
    }
  }
}
