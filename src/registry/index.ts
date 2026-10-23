import { INodeDefinition, NodeCategory } from './types';
import { webhookTriggerNode, scheduleTriggerNode, manualTriggerNode, emailTriggerNode } from './triggers';
import { ifNode, switchNode, filterNode, loopNode, mergeNode, delayNode, subWorkflowNode } from './logic';
import { codeNode, setFieldsNode, jsonParserNode, dateTimeNode, cryptoNode } from './data';
import {
  slackNode,
  discordNode,
  telegramNode,
  githubNode,
  googleSheetsNode,
  googleDriveNode,
  notionNode,
  airtableNode,
  stripeNode,
  resendNode,
  supabaseNode
} from './apps';
import { llmChatNode, aiAgentNode, textEmbeddingsNode } from './ai';
import { mcpToolCallerNode, mcpResourceReaderNode, mcpServerNode } from './mcp';
import { httpRequestNode, graphQLNode } from './protocols';
import { elevenLabsNode, windowBufferMemoryNode, vectorStoreToolNode, openAiModelNode } from './elevenlabs';

export * from './types';
export * from './elevenlabs';

export const ALL_NODE_DEFINITIONS: INodeDefinition[] = [
  // Triggers
  webhookTriggerNode,
  scheduleTriggerNode,
  manualTriggerNode,
  emailTriggerNode,

  // Logic & Flow
  ifNode,
  switchNode,
  filterNode,
  loopNode,
  mergeNode,
  delayNode,
  subWorkflowNode,

  // Data & Transforms
  codeNode,
  setFieldsNode,
  jsonParserNode,
  dateTimeNode,
  cryptoNode,

  // App Integrations
  slackNode,
  discordNode,
  telegramNode,
  githubNode,
  googleSheetsNode,
  googleDriveNode,
  notionNode,
  airtableNode,
  stripeNode,
  resendNode,
  supabaseNode,
  elevenLabsNode,

  // AI & LLMs
  llmChatNode,
  aiAgentNode,
  textEmbeddingsNode,
  windowBufferMemoryNode,
  vectorStoreToolNode,
  openAiModelNode,

  // Model Context Protocol (MCP)
  mcpToolCallerNode,
  mcpResourceReaderNode,
  mcpServerNode,

  // Core Protocols
  httpRequestNode,
  graphQLNode
];

const DEFINITIONS_MAP = new Map<string, INodeDefinition>();
for (const node of ALL_NODE_DEFINITIONS) {
  DEFINITIONS_MAP.set(node.name, node);
  // Also register lower-case and title-case variants
  DEFINITIONS_MAP.set(node.name.toLowerCase(), node);
}

/**
 * Retrieve node definition by name
 */
export function getNodeDefinition(name: string): INodeDefinition | undefined {
  return DEFINITIONS_MAP.get(name) || DEFINITIONS_MAP.get(name.toLowerCase());
}

/**
 * Filter nodes by category
 */
export function getNodesByCategory(category: NodeCategory): INodeDefinition[] {
  return ALL_NODE_DEFINITIONS.filter((n) => n.category === category);
}

/**
 * Search nodes across title, description, category, and name
 */
export function searchNodes(query: string, categoryFilter?: string): INodeDefinition[] {
  let list = ALL_NODE_DEFINITIONS;
  if (categoryFilter && categoryFilter !== 'All') {
    list = list.filter((n) => n.category === categoryFilter);
  }

  if (!query || query.trim() === '') {
    return list;
  }

  const q = query.toLowerCase().trim();
  return list.filter((n) =>
    n.displayName.toLowerCase().includes(q) ||
    n.description.toLowerCase().includes(q) ||
    n.name.toLowerCase().includes(q) ||
    n.category.toLowerCase().includes(q)
  );
}
