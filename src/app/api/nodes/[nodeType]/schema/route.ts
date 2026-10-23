import { NextRequest, NextResponse } from 'next/server';
import { getNodeDefinition } from '@/registry';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ nodeType: string }> }
) {
  try {
    const { nodeType } = await params;
    const def = getNodeDefinition(nodeType);

    if (!def) {
      return NextResponse.json(
        { success: false, error: `Node definition not found for: ${nodeType}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        name: def.name,
        displayName: def.displayName,
        description: def.description,
        icon: def.icon,
        category: def.category,
        group: def.group,
        inputs: def.inputs,
        outputs: def.outputs,
        credentials: def.credentials,
        properties: def.properties
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch node schema' },
      { status: 500 }
    );
  }
}
