/**
 * Parses metadata from Mermaid diagram comments
 * Format: %% @field: value
 */

export interface DiagramMetadata {
  title?: string;
  description?: string;
  type?: string;
  created?: string;
  updated?: string;
  repo?: string;
  basePath?: string;
}

export interface NodeMetadata {
  nodeId: string;
  label?: string;
  file?: string;
  line?: number;
  type?: string;
  description?: string;
  notes?: string;
  url?: string;
  dependencies?: string;
  complexity?: 'low' | 'medium' | 'high';
  status?: 'active' | 'deprecated' | 'experimental' | 'planned';
}

export interface EdgeMetadata {
  edge: string;
  description?: string;
  type?: string;
  async?: boolean;
  protocol?: string;
}

export interface ParsedMetadata {
  diagram: DiagramMetadata;
  nodes: Map<string, NodeMetadata>;
  edges: Map<string, EdgeMetadata>;
}

const METADATA_REGEX = /%%\s*@(\w+(?:-\w+)*):\s*(.+)/g;

export function parseMetadata(mermaidCode: string): ParsedMetadata {
  const diagram: DiagramMetadata = {};
  const nodes = new Map<string, NodeMetadata>();
  const edges = new Map<string, EdgeMetadata>();

  const lines = mermaidCode.split('\n');
  let currentContext: 'diagram' | 'node' | 'edge' = 'diagram';
  let currentNodeId: string | null = null;
  let currentEdge: string | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip non-comment lines
    if (!trimmed.startsWith('%%')) {
      continue;
    }

    // Match metadata pattern
    const matches = [...trimmed.matchAll(METADATA_REGEX)];

    for (const match of matches) {
      const field = match[1];
      const value = match[2].trim();

      // Check for context switches
      if (field === 'node') {
        currentContext = 'node';
        currentNodeId = value;
        if (!nodes.has(value)) {
          nodes.set(value, { nodeId: value });
        }
        continue;
      }

      if (field === 'edge') {
        currentContext = 'edge';
        currentEdge = value;
        if (!edges.has(value)) {
          edges.set(value, { edge: value });
        }
        continue;
      }

      // Parse fields based on context
      if (currentContext === 'diagram') {
        parseDiagramField(diagram, field, value);
      } else if (currentContext === 'node' && currentNodeId) {
        const node = nodes.get(currentNodeId)!;
        parseNodeField(node, field, value);
      } else if (currentContext === 'edge' && currentEdge) {
        const edge = edges.get(currentEdge)!;
        parseEdgeField(edge, field, value);
      }
    }
  }

  return { diagram, nodes, edges };
}

function parseDiagramField(diagram: DiagramMetadata, field: string, value: string) {
  switch (field) {
    case 'diagram-title':
      diagram.title = value;
      break;
    case 'diagram-description':
      diagram.description = value;
      break;
    case 'diagram-type':
      diagram.type = value;
      break;
    case 'created':
      diagram.created = value;
      break;
    case 'updated':
      diagram.updated = value;
      break;
    case 'repo':
      diagram.repo = value;
      break;
    case 'base-path':
      diagram.basePath = value;
      break;
  }
}

function parseNodeField(node: NodeMetadata, field: string, value: string) {
  switch (field) {
    case 'label':
      node.label = value;
      break;
    case 'file':
      node.file = value;
      break;
    case 'line':
      node.line = parseInt(value, 10);
      break;
    case 'type':
      node.type = value;
      break;
    case 'description':
      node.description = value;
      break;
    case 'notes':
      node.notes = value;
      break;
    case 'url':
      node.url = value;
      break;
    case 'dependencies':
      node.dependencies = value;
      break;
    case 'complexity':
      node.complexity = value as 'low' | 'medium' | 'high';
      break;
    case 'status':
      node.status = value as 'active' | 'deprecated' | 'experimental' | 'planned';
      break;
  }
}

function parseEdgeField(edge: EdgeMetadata, field: string, value: string) {
  switch (field) {
    case 'description':
      edge.description = value;
      break;
    case 'type':
      edge.type = value;
      break;
    case 'async':
      edge.async = value.toLowerCase() === 'true';
      break;
    case 'protocol':
      edge.protocol = value;
      break;
  }
}

/**
 * Constructs a file URI for Obsidian
 * If file is a relative path and repo is provided, creates GitHub link
 * Otherwise creates obsidian:// URI for local vault files
 */
export function constructFileUri(
  filePath: string,
  lineNumber?: number,
  repo?: string,
  basePath?: string,
  vaultPath?: string
): string {
  // If it's a URL, return as-is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }

  // If repo is provided, create GitHub link
  if (repo) {
    const repoBase = repo.replace(/\/$/, '');
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const lineFragment = lineNumber ? `#L${lineNumber}` : '';
    return `${repoBase}/blob/master/${cleanPath}${lineFragment}`;
  }

  // If basePath is provided, construct full path
  let fullPath = filePath;
  if (basePath && !filePath.startsWith('/')) {
    fullPath = `${basePath}/${filePath}`;
  }

  // Create obsidian:// URI for local files
  // Format: obsidian://open?path=<encoded-path>
  if (vaultPath) {
    const encodedPath = encodeURIComponent(fullPath);
    return `obsidian://open?path=${encodedPath}`;
  }

  return fullPath;
}

/**
 * Gets color based on node type
 */
export function getNodeTypeColor(type?: string): string {
  const colorMap: Record<string, string> = {
    'component': '#61dafb',    // React blue
    'function': '#f7df1e',     // JavaScript yellow
    'class': '#3178c6',        // TypeScript blue
    'module': '#9b59b6',       // Purple
    'file': '#95a5a6',         // Gray
    'service': '#27ae60',      // Green
    'database': '#e74c3c',     // Red
    'external': '#ecf0f1',     // Light gray
  };

  return type ? (colorMap[type] || '#7f8c8d') : '#7f8c8d';
}

/**
 * Gets icon/emoji based on node type
 */
export function getNodeTypeIcon(type?: string): string {
  const iconMap: Record<string, string> = {
    'component': '⚛️',
    'function': '𝑓',
    'class': '🏛️',
    'module': '📦',
    'file': '📄',
    'service': '⚙️',
    'database': '🗄️',
    'external': '🔗',
  };

  return type ? (iconMap[type] || '•') : '•';
}

/**
 * Gets badge color based on status
 */
export function getStatusColor(status?: string): string {
  const colorMap: Record<string, string> = {
    'active': '#27ae60',       // Green
    'deprecated': '#e74c3c',   // Red
    'experimental': '#f39c12', // Orange
    'planned': '#3498db',      // Blue
  };

  return status ? (colorMap[status] || '#95a5a6') : '#95a5a6';
}
