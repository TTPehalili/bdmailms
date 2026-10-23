// Standard n8n-style WorkflowItem interface and item pipeline utilities

export interface WorkflowBinaryItem {
  data: string; // Base64 encoded payload
  mimeType: string;
  fileName?: string;
  fileExtension?: string;
}

export interface WorkflowItem {
  json: Record<string, any>;
  binary?: Record<string, WorkflowBinaryItem>;
}

export class ItemPipeline {
  /**
   * Standardize any raw data into WorkflowItem[]
   */
  static standardize(raw: unknown): WorkflowItem[] {
    if (raw === undefined || raw === null) {
      return [{ json: {} }];
    }

    if (Array.isArray(raw)) {
      if (raw.length === 0) return [{ json: {} }];
      return raw.map((item) => {
        if (typeof item === 'object' && item !== null && 'json' in item) {
          return item as WorkflowItem;
        }
        if (typeof item === 'object' && item !== null) {
          return { json: item as Record<string, any> };
        }
        return { json: { value: item } };
      });
    }

    if (typeof raw === 'object' && 'json' in (raw as Record<string, any>)) {
      return [raw as WorkflowItem];
    }

    if (typeof raw === 'object') {
      return [{ json: raw as Record<string, any> }];
    }

    return [{ json: { value: raw } }];
  }

  /**
   * Extract json objects from WorkflowItem[]
   */
  static extractJson(items: WorkflowItem[]): Record<string, any>[] {
    return items.map((i) => i.json);
  }
}
