import { WorkflowItem, ItemPipeline } from './item-pipeline';
import { ExpressionContext } from './context';
import { db, ExecutionRecord, WorkflowRecord } from '../lib/db';
import { getNodeDefinition } from '../registry';

export interface WorkflowRunOptions {
  triggerNodeId?: string;
  triggerPayload?: any;
  triggerSource?: 'manual' | 'webhook' | 'schedule' | 'mcp' | 'test';
}

export class WorkflowRunner {
  /**
   * Execute a workflow graph deterministically
   */
  static async execute(
    workflow: WorkflowRecord,
    options: WorkflowRunOptions = {}
  ): Promise<ExecutionRecord> {
    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const startTime = Date.now();

    const execution: ExecutionRecord = {
      id: executionId,
      workflowId: workflow.id,
      workflowName: workflow.name,
      status: 'running',
      startedAt: new Date().toISOString(),
      triggerSource: options.triggerSource || 'manual',
      nodeOutputs: {}
    };

    // Index nodes and edges
    const nodesMap = new Map<string, any>();
    const nodeNames: Record<string, string> = {};
    for (const n of workflow.nodes) {
      nodesMap.set(n.id, n);
      nodeNames[n.id] = n.data?.label || n.title || n.name || n.id;
    }

    // Graph adjacency & incoming edges
    // edge: source -> target with sourceHandle ('output', 'true', 'false')
    const outgoing = new Map<string, Array<{ target: string; sourceHandle?: string; targetHandle?: string }>>();
    const incomingCount = new Map<string, number>();

    for (const n of workflow.nodes) {
      outgoing.set(n.id, []);
      incomingCount.set(n.id, 0);
    }

    for (const edge of workflow.edges) {
      const sourceId = edge.source || edge.fromNodeId;
      const targetId = edge.target || edge.toNodeId;
      const sourceHandle = edge.sourceHandle || edge.fromPort || 'output';
      const targetHandle = edge.targetHandle || edge.toPort || 'input';

      if (outgoing.has(sourceId) && incomingCount.has(targetId)) {
        outgoing.get(sourceId)!.push({ target: targetId, sourceHandle, targetHandle });
        incomingCount.set(targetId, (incomingCount.get(targetId) || 0) + 1);
      }
    }

    // Determine starting nodes
    let queue: string[] = [];
    if (options.triggerNodeId && nodesMap.has(options.triggerNodeId)) {
      queue.push(options.triggerNodeId);
    } else {
      // Find all nodes with 0 incoming edges
      for (const [nodeId, count] of incomingCount.entries()) {
        if (count === 0) {
          queue.push(nodeId);
        }
      }
    }

    if (queue.length === 0 && workflow.nodes.length > 0) {
      queue.push(workflow.nodes[0].id);
    }

    const nodeOutputsStore: Record<string, WorkflowItem[]> = {};

    // Context for expression resolution
    const expressionContext = new ExpressionContext({
      executionId,
      workflowId: workflow.id,
      nodeOutputs: nodeOutputsStore,
      nodeNames
    });

    const visited = new Set<string>();

    try {
      while (queue.length > 0) {
        const currentNodeId = queue.shift()!;
        if (visited.has(currentNodeId)) continue;
        visited.add(currentNodeId);

        const node = nodesMap.get(currentNodeId);
        if (!node) continue;

        const nodeType = node.data?.nodeType || node.type || 'codeNode';
        const nodeConfig = node.data?.config || node.config || {};
        const nodeLabel = nodeNames[currentNodeId];

        // Gather input items from upstream connected nodes
        let inputItems: WorkflowItem[] = [];
        if (currentNodeId === options.triggerNodeId && options.triggerPayload) {
          inputItems = ItemPipeline.standardize(options.triggerPayload);
        } else {
          // Find predecessors that sent output to this node
          for (const edge of workflow.edges) {
            const src = edge.source || edge.fromNodeId;
            const tgt = edge.target || edge.toNodeId;
            if (tgt === currentNodeId && nodeOutputsStore[src]) {
              inputItems.push(...nodeOutputsStore[src]);
            }
          }
        }

        if (inputItems.length === 0) {
          inputItems = [{ json: {} }];
        }

        // Initialize execution trace for this node
        execution.nodeOutputs[currentNodeId] = {
          status: 'running',
          input: inputItems
        };

        const nodeStartTime = Date.now();
        let outputBranches: WorkflowItem[][] = [[{ json: {} }]];

        const def = getNodeDefinition(nodeType);
        if (def && def.execute) {
          outputBranches = await def.execute({
            nodeId: currentNodeId,
            nodeName: nodeLabel,
            workflowId: workflow.id,
            executionId,
            config: nodeConfig,
            inputItems,
            context: expressionContext
          });
        } else {
          // Fallback pass-through
          outputBranches = [inputItems];
        }

        const nodeExecTime = Date.now() - nodeStartTime;
        const primaryOutput = outputBranches[0] || [{ json: {} }];
        nodeOutputsStore[currentNodeId] = primaryOutput;

        execution.nodeOutputs[currentNodeId] = {
          status: 'success',
          input: inputItems,
          output: primaryOutput,
          executionTimeMs: nodeExecTime
        };

        // Determine downstream nodes to queue
        const outEdges = outgoing.get(currentNodeId) || [];
        for (const edge of outEdges) {
          // If dual output logic node (e.g. IF branch 'true' / 'false')
          if (edge.sourceHandle === 'true') {
            if (outputBranches[0] && outputBranches[0].length > 0 && outputBranches[0][0]?.json?._conditionBranch !== 'false') {
              queue.push(edge.target);
            }
          } else if (edge.sourceHandle === 'false') {
            if (outputBranches[1] && outputBranches[1].length > 0) {
              nodeOutputsStore[currentNodeId] = outputBranches[1]; // Use false branch payload for false route
              queue.push(edge.target);
            }
          } else {
            // Standard single output
            queue.push(edge.target);
          }
        }
      }

      execution.status = 'success';
      execution.finishedAt = new Date().toISOString();
      execution.executionTimeMs = Date.now() - startTime;
    } catch (err: any) {
      execution.status = 'error';
      execution.error = err.message || String(err);
      execution.finishedAt = new Date().toISOString();
      execution.executionTimeMs = Date.now() - startTime;
    }

    await db.saveExecution(execution);
    return execution;
  }
}
