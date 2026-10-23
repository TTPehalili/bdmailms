import { WorkflowRecord } from '../lib/db';

export interface McpToolSchema {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description?: string;
    }>;
    required?: string[];
  };
}

export class McpSchemaMapper {
  /**
   * Convert a workflow definition into an MCP tool descriptor
   */
  static workflowToMcpTool(workflow: WorkflowRecord): McpToolSchema {
    // Generate valid tool name e.g. "workflow_arm_rubric"
    const safeName = `workflow_${workflow.id.replace(/[^a-zA-Z0-9_]/g, '_')}`;

    // Look for first trigger node to extract inputs
    const triggerNode = workflow.nodes.find(
      (n) => n.data?.category === 'Triggers' || n.category === 'trigger'
    );

    const properties: Record<string, { type: string; description?: string }> = {
      payload: {
        type: 'object',
        description: 'Input JSON parameters passed to trigger this automation workflow'
      }
    };

    if (triggerNode?.data?.config?.path) {
      properties['webhookSlug'] = {
        type: 'string',
        description: `Webhook path slug: ${triggerNode.data.config.path}`
      };
    }

    return {
      name: safeName,
      description: workflow.description || `Executes the ${workflow.name} automation pipeline.`,
      inputSchema: {
        type: 'object',
        properties,
        required: ['payload']
      }
    };
  }
}
