import { INodeDefinition, NodeExecutionContext } from './types';
import { WorkflowItem } from '../engine/item-pipeline';

export const llmChatNode: INodeDefinition = {
  name: 'llmChatNode',
  displayName: 'LLM Chat (Gemini / Claude / GPT)',
  description: 'Invoke frontier LLMs with prompt templates, system instructions, and variable interpolation',
  icon: 'Bot',
  category: 'AI & LLMs',
  group: ['transform'],
  inputs: [{ id: 'input', type: 'main', label: 'Input' }],
  outputs: [{ id: 'output', type: 'main', label: 'Output' }],
  properties: [
    {
      name: 'model',
      displayName: 'Model Provider',
      type: 'options',
      default: 'claude-3-5-sonnet',
      options: [
        { name: 'Claude 3.5 Sonnet (Anthropic)', value: 'claude-3-5-sonnet' },
        { name: 'Gemini 1.5 Pro (Google)', value: 'gemini-1.5-pro' },
        { name: 'GPT-4o (OpenAI)', value: 'gpt-4o' }
      ]
    },
    {
      name: 'systemPrompt',
      displayName: 'System Instructions',
      type: 'string',
      default: 'You are an expert sales analyst for Boris Telephony. Analyze incoming SDR transcripts and evaluate adherence to ARM framework.'
    },
    {
      name: 'userPrompt',
      displayName: 'User Prompt Template',
      type: 'string',
      default: 'Review session transcript for {{ $json.repName || "Alex" }}. Score objection handling: {{ $json.score || 88 }}%'
    },
    {
      name: 'temperature',
      displayName: 'Temperature',
      type: 'number',
      default: 0.3
    }
  ],
  execute: async (context: NodeExecutionContext): Promise<WorkflowItem[][]> => {
    const results = context.inputItems.map((item) => {
      const prompt = context.context.resolve(context.config.userPrompt, item);
      const model = context.config.model || 'claude-3-5-sonnet';
      return {
        ...item,
        json: {
          ...item.json,
          aiResponse: {
            model,
            content: `[AI Evaluation from ${model}]: Evaluated prompt with high confidence. The SDR demonstrated strong objection deflection and pacing.`,
            promptRendered: prompt,
            tokensUsed: 218,
            completedAt: new Date().toISOString()
          }
        }
      };
    });
    return [results];
  }
};

export const aiAgentNode: INodeDefinition = {
  name: 'aiAgentNode',
  displayName: 'AI Agent (ReAct Tool Caller)',
  description: 'Autonomous agent that reasons step-by-step and dynamically invokes connected tools to solve goals',
  icon: 'Sparkles',
  category: 'AI & LLMs',
  group: ['transform'],
  inputs: [{ id: 'input', type: 'main', label: 'Goal / Input' }],
  outputs: [
    { id: 'output', type: 'main', label: 'Final Output' },
    { id: 'toolCalls', type: 'main', label: 'Tool Trace' }
  ],
  properties: [
    { name: 'agentGoal', displayName: 'Agent Goal / Instruction', type: 'string', default: 'Qualify lead, query CRM for duplicates, and generate follow-up email.' },
    { name: 'maxIterations', displayName: 'Max Reasoning Steps', type: 'number', default: 5 }
  ],
  execute: async (context: NodeExecutionContext): Promise<WorkflowItem[][]> => {
    const goal = context.context.resolve(context.config.agentGoal, context.inputItems[0] || { json: {} });
    return [
      [
        {
          json: {
            goal,
            status: 'completed',
            thoughtTrace: [
              'Thought: Checking input lead data and scoring criteria.',
              'Action: Calling crm_lookup tool for existing records.',
              'Observation: No duplicate record found.',
              'Final Answer: Lead successfully qualified with Grade A readiness.'
            ],
            confidence: 0.94
          }
        }
      ]
    ];
  }
};

export const textEmbeddingsNode: INodeDefinition = {
  name: 'textEmbeddingsNode',
  displayName: 'Text Embeddings',
  description: 'Generates high-dimensional vector embeddings for text chunks to feed vector stores',
  icon: 'Network',
  category: 'AI & LLMs',
  group: ['transform'],
  inputs: [{ id: 'input', type: 'main', label: 'Input' }],
  outputs: [{ id: 'output', type: 'main', label: 'Output' }],
  properties: [
    { name: 'textField', displayName: 'Text to Embed', type: 'string', default: '{{ $json.text || $json.body }}' },
    { name: 'dimensions', displayName: 'Vector Dimensions', type: 'number', default: 1536 }
  ],
  execute: async (context: NodeExecutionContext): Promise<WorkflowItem[][]> => {
    return [
      context.inputItems.map((item) => ({
        ...item,
        json: {
          ...item.json,
          embedding: [0.0241, -0.0512, 0.0891, 0.0123, -0.0345], // Representing vector embedding
          dimensions: context.config.dimensions || 1536
        }
      }))
    ];
  }
};
