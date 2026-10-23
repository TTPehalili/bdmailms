import { WorkflowItem } from './item-pipeline';

export interface ExecutionContextData {
  executionId: string;
  workflowId: string;
  env?: Record<string, string>;
  nodeOutputs: Record<string, WorkflowItem[]>;
  nodeNames: Record<string, string>; // Maps nodeId to displayName
}

export class ExpressionContext {
  private data: ExecutionContextData;

  constructor(data: ExecutionContextData) {
    this.data = {
      ...data,
      env: data.env || (typeof process !== 'undefined' ? (process.env as Record<string, string>) : {})
    };
  }

  /**
   * Resolves expressions inside string templates or objects
   * Syntax: {{ $json.field }}, {{ $node["NodeName"].json.field }}, {{ $env.KEY }}, {{ $execution.id }}
   */
  resolve<T>(input: T, currentItem: WorkflowItem): T {
    if (typeof input === 'string') {
      return this.resolveString(input, currentItem) as unknown as T;
    }

    if (Array.isArray(input)) {
      return input.map((val) => this.resolve(val, currentItem)) as unknown as T;
    }

    if (input !== null && typeof input === 'object') {
      const resolvedObj: Record<string, any> = {};
      for (const [key, val] of Object.entries(input as Record<string, any>)) {
        resolvedObj[key] = this.resolve(val, currentItem);
      }
      return resolvedObj as T;
    }

    return input;
  }

  private resolveString(template: string, currentItem: WorkflowItem): string {
    const expressionRegex = /\{\{\s*([\s\S]*?)\s*\}\}/g;

    return template.replace(expressionRegex, (match, expr: string) => {
      try {
        const trimmed = expr.trim();

        // 1. $json reference: {{ $json.myKey }}
        if (trimmed.startsWith('$json')) {
          const path = trimmed.replace(/^\$json\.?/, '');
          if (!path) return JSON.stringify(currentItem.json);
          return this.getByPath(currentItem.json, path);
        }

        // 2. $execution reference: {{ $execution.id }}
        if (trimmed.startsWith('$execution')) {
          const prop = trimmed.replace(/^\$execution\./, '');
          if (prop === 'id') return this.data.executionId;
          if (prop === 'workflowId') return this.data.workflowId;
          return '';
        }

        // 3. $env reference: {{ $env.KEY }}
        if (trimmed.startsWith('$env')) {
          const envKey = trimmed.replace(/^\$env\./, '');
          return this.data.env?.[envKey] || '';
        }

        // 4. $node reference: {{ $node["Node Title"].json.foo }} or {{ $node['node-1'].json.foo }}
        const nodeMatch = trimmed.match(/^\$node\[(?:'|")([^'"]+)(?:'|")\]\.([\s\S]+)$/);
        if (nodeMatch) {
          const targetNodeIdentifier = nodeMatch[1];
          const remainingPath = nodeMatch[2];

          // Lookup target node by id or by display name
          let foundNodeId = targetNodeIdentifier;
          if (!this.data.nodeOutputs[targetNodeIdentifier]) {
            // Try matching by node displayName
            for (const [id, name] of Object.entries(this.data.nodeNames)) {
              if (name.toLowerCase() === targetNodeIdentifier.toLowerCase()) {
                foundNodeId = id;
                break;
              }
            }
          }

          const targetOutputs = this.data.nodeOutputs[foundNodeId];
          if (!targetOutputs || targetOutputs.length === 0) return '';

          // Remaining path like "json.data.user" or "binary.file.mimeType"
          const firstItem = targetOutputs[0];
          return this.getByPath(firstItem, remainingPath);
        }

        return match;
      } catch (err) {
        console.warn(`Error resolving expression "${expr}":`, err);
        return match;
      }
    });
  }

  private getByPath(obj: any, path: string): string {
    const parts = path.split('.');
    let curr = obj;
    for (const part of parts) {
      if (curr === undefined || curr === null) return '';
      curr = curr[part];
    }
    if (curr === undefined || curr === null) return '';
    if (typeof curr === 'object') return JSON.stringify(curr);
    return String(curr);
  }
}
