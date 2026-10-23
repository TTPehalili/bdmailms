import { NextRequest, NextResponse } from 'next/server';
import { ALL_NODE_DEFINITIONS, searchNodes } from '@/registry';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || undefined;

    const nodes = searchNodes(query, category);

    // Group counts
    const categoriesCount: Record<string, number> = {};
    for (const def of ALL_NODE_DEFINITIONS) {
      categoriesCount[def.category] = (categoriesCount[def.category] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      total: nodes.length,
      categoriesCount,
      data: nodes.map((node) => ({
        name: node.name,
        displayName: node.displayName,
        description: node.description,
        icon: node.icon,
        category: node.category,
        group: node.group,
        inputs: node.inputs,
        outputs: node.outputs,
        hasCredentials: Boolean(node.credentials)
      }))
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch node catalog' },
      { status: 500 }
    );
  }
}
