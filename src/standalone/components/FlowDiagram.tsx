import { useCallback, useState, useEffect, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  addEdge,
  Connection,
  BackgroundVariant,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CustomNode } from './CustomNode';
import { NodeEditor } from './NodeEditor';
import { SubgraphNode } from './SubgraphNode';

interface FlowDiagramProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  theme?: 'light' | 'dark';
  fitView?: boolean;
}

export function FlowDiagram({
  nodes: initialNodes,
  edges: initialEdges,
  onNodesChange: onNodesChangeCallback,
  onEdgesChange: onEdgesChangeCallback,
  theme = 'light',
  fitView = true
}: FlowDiagramProps) {
  const isDark = theme === 'dark';
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showNodeEditor, setShowNodeEditor] = useState(false);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges]);

  const nodeTypes = useMemo(
    () => ({
      custom: CustomNode,
      group: SubgraphNode,
    }),
    []
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const newNodes = applyNodeChanges(changes, nodes);
      setNodes(newNodes);
      onNodesChangeCallback?.(newNodes);
    },
    [nodes, onNodesChangeCallback]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const newEdges = applyEdgeChanges(changes, edges);
      setEdges(newEdges);
      onEdgesChangeCallback?.(newEdges);
    },
    [edges, onEdgesChangeCallback]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge(params, edges);
      setEdges(newEdges);
      onEdgesChangeCallback?.(newEdges);
    },
    [edges, onEdgesChangeCallback]
  );

  const onNodeDoubleClick = useCallback((_event: React.MouseEvent, node: Node) => {
    // Only show editor for non-group nodes
    if (node.type !== 'group') {
      setSelectedNode(node);
      setShowNodeEditor(true);
    }
  }, []);

  const handleNodeUpdate = useCallback((nodeId: string, data: any) => {
    setNodes((nds) => {
      const newNodes = nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, ...data },
            style: { ...node.style, ...data.style },
          };
        }
        return node;
      });
      onNodesChangeCallback?.(newNodes);
      return newNodes;
    });
  }, [onNodesChangeCallback]);

  // Add onEdit callback to node data
  const nodesWithEditCallback = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onEdit: () => {
            setSelectedNode(node);
            setShowNodeEditor(true);
          },
        },
      })),
    [nodes]
  );

  return (
    <>
      <div style={{ width: '100%', height: '100%' }} className={`flow-diagram-container ${isDark ? 'theme-dark' : 'theme-light'}`}>
        <ReactFlow
          nodes={nodesWithEditCallback}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDoubleClick={onNodeDoubleClick}
          nodeTypes={nodeTypes}
          fitView={fitView}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          deleteKeyCode={['Delete', 'Backspace']}
        >
          <Controls />
          <MiniMap />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </div>
      {showNodeEditor && (
        <NodeEditor
          node={selectedNode}
          onUpdate={handleNodeUpdate}
          onClose={() => {
            setShowNodeEditor(false);
            setSelectedNode(null);
          }}
        />
      )}
    </>
  );
}