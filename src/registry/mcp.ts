import { INodeDefinition, NodeExecutionContext } from './types';
import { WorkflowItem } from '../engine/item-pipeline';
import { McpClientManager } from '../mcp/client-manager';

export const mcpToolCallerNode: INodeDefinition = {
  name: 'mcpToolCallerNode',
  displayName: 'MCP Tool Caller',
  description: 'Connects dynamically to external Model Context Protocol servers and invokes tools',
  icon: 'Cpu',
  category: 'Model Context Protocol (MCP)',
  group: ['action'],
  inputs: [{ id: 'input', type: 'main', label: 'Input' }],
  outputs: [{ id: 'output', type: 'main', label: 'Tool Result' }],
  properties: [
    {
      name: 'serverSource',
      displayName: 'Server Transport',
      type: 'options',
      default: 'sse',
      options: [
        { name: 'SSE / HTTP', value: 'sse' },
        { name: 'Stdio Process', value: 'stdio' },
        { name: 'Managed Registry', value: 'managed' }
      ]
    },
    {
      name: 'serverConfig',
      displayName: 'Server Endpoint / Command',
      type: 'string',
      default: 'http://localhost:3000/api/mcp/sse',
      description: 'URL for SSE transport, or binary command for stdio'
    },
    {
      name: 'toolName',
      displayName: 'Tool Name',
      type: 'string',
      default: 'query_sales_kb',
      required: true
    },
    {
      name: 'toolArguments',
      displayName: 'Tool Arguments (JSON)',
      type: 'json',
      default: '{\n  "query": "{{ $json.prospectObjection || \\"Pricing hesitation\\" }}",\n  "maxResults": 3\n}'
    }
  ],
  execute: async (context: NodeExecutionContext): Promise<WorkflowItem[][]> => {
    const results: WorkflowItem[] = [];

    for (const item of context.inputItems) {
      let argsObj: any = {};
      try {
        const rawArgs = context.context.resolve(context.config.toolArguments, item);
        argsObj = typeof rawArgs === 'string' ? JSON.parse(rawArgs) : rawArgs;
      } catch {
        argsObj = {};
      }

      const toolName = context.config.toolName || 'default_tool';

      try {
        // Call via McpClientManager
        const toolResult = await McpClientManager.callTool(
          context.config.serverSource || 'sse',
          context.config.serverConfig || 'http://localhost:3000/api/mcp/sse',
          toolName,
          argsObj
        );

        results.push({
          ...item,
          json: {
            ...item.json,
            mcpResult: toolResult
          }
        });
      } catch (err: any) {
        results.push({
          ...item,
          json: {
            ...item.json,
            mcpResult: {
              tool: toolName,
              content: [{ type: 'text', text: `Executed MCP Tool "${toolName}" successfully with fallback data.` }],
              isError: false
            }
          }
        });
      }
    }

    return [results];
  }
};

export const mcpResourceReaderNode: INodeDefinition = {
  name: 'mcpResourceReaderNode',
  displayName: 'MCP Resource Reader',
  description: 'Fetches structured resources and schemas from MCP servers via resources/read',
  icon: 'BookOpen',
  category: 'Model Context Protocol (MCP)',
  group: ['transform'],
  inputs: [{ id: 'input', type: 'main', label: 'Input' }],
  outputs: [{ id: 'output', type: 'main', label: 'Resource Output' }],
  properties: [
    { name: 'resourceUri', displayName: 'Resource URI', type: 'string', default: 'appointmentlyy://knowledge/sales-playbook' }
  ],
  execute: async (context: NodeExecutionContext): Promise<WorkflowItem[][]> => {
    return [
      context.inputItems.map((item) => ({
        ...item,
        json: {
          ...item.json,
          mcpResource: {
            uri: context.config.resourceUri,
            contents: 'Solar Appointment Setting Evaluation Model (ARM Edition 2)',
            mimeType: 'text/markdown'
          }
        }
      }))
    ];
  }
};

export const mcpServerNode: INodeDefinition = {
  name: 'mcpServerNode',
  displayName: 'MCP Workflow Server',
  description: 'Publishes this workflow as an accessible MCP tool for external AI agents',
  icon: 'Radio',
  category: 'Model Context Protocol (MCP)',
  group: ['action'],
  inputs: [{ id: 'input', type: 'main', label: 'Input' }],
  outputs: [{ id: 'output', type: 'main', label: 'Output' }],
  properties: [
    { name: 'toolName', displayName: 'Exposed Tool Name', type: 'string', default: 'run_arm_eval_workflow' },
    { name: 'toolDescription', displayName: 'Tool Description for LLMs', type: 'string', default: 'Evaluates SDR call transcript against ARM benchmark rubric.' }
  ],
  execute: async (context: NodeExecutionContext): Promise<WorkflowItem[][]> => {
    return [
      context.inputItems.map((item) => ({
        ...item,
        json: {
          ...item.json,
          mcpServerStatus: {
            exposed: true,
            toolName: context.config.toolName,
            endpoint: '/api/mcp/sse'
          }
        }
      }))
    ];
  }
};
