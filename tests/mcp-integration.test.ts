import { describe, it } from 'node:test';
import assert from 'node:assert';
import { McpClientManager } from '../src/mcp/client-manager';
import { McpServerHost } from '../src/mcp/server-host';

describe('Model Context Protocol (MCP) Integration', () => {
  it('should list connected MCP servers and available tools', async () => {
    const servers = McpClientManager.listServers();
    assert.ok(servers.length > 0);
    assert.ok(servers[0].discoveredTools && servers[0].discoveredTools.length > 0);
  });

  it('should call MCP tool dynamically and return structured result', async () => {
    const result = await McpClientManager.callTool(
      'sse',
      'http://localhost:3000/api/mcp/sse',
      'calculate_arm_score',
      { transcript: 'Rep: Hello Arthur. Prospect: We already have solar. Rep: Acknowledge that...' }
    );

    assert.strictEqual(result.isError, false);
    assert.ok(result.content.length > 0);
    const parsed = JSON.parse(result.content[0].text);
    assert.strictEqual(parsed.armScore, 89);
    assert.strictEqual(parsed.passed, true);
  });

  it('should publish workflows as MCP tools', async () => {
    const tools = await McpServerHost.listPublishedTools();
    assert.ok(tools.length > 0);
    const armTool = tools.find((t) => t.name.includes('arm_rubric'));
    assert.ok(armTool);
    assert.ok(armTool?.inputSchema.properties.payload);
  });
});
