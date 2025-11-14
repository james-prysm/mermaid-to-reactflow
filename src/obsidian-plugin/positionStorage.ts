import { Node } from 'reactflow';

export interface NodePosition {
  x: number;
  y: number;
}

export interface SavedPositions {
  [diagramHash: string]: {
    [nodeId: string]: NodePosition;
  };
}

// Simple hash function for mermaid code
export function hashMermaidCode(code: string): string {
  let hash = 0;
  const normalizedCode = code.trim();

  for (let i = 0; i < normalizedCode.length; i++) {
    const char = normalizedCode.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return Math.abs(hash).toString(36);
}

// Apply saved positions to nodes
export function applySavedPositions(
  nodes: Node[],
  savedPositions: { [nodeId: string]: NodePosition } | undefined
): Node[] {
  if (!savedPositions) {
    return nodes;
  }

  return nodes.map(node => {
    const savedPos = savedPositions[node.id];
    if (savedPos) {
      return {
        ...node,
        position: savedPos,
      };
    }
    return node;
  });
}

// Extract positions from nodes
export function extractPositions(nodes: Node[]): { [nodeId: string]: NodePosition } {
  const positions: { [nodeId: string]: NodePosition } = {};

  nodes.forEach(node => {
    positions[node.id] = {
      x: node.position.x,
      y: node.position.y,
    };
  });

  return positions;
}
