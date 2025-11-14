import { useState, useEffect, useCallback, useRef } from 'react';
import { FlowDiagram } from '../standalone/components/FlowDiagram';
import { convertMermaidToReactFlow, ReactFlowData } from '../core/mermaidToReactFlow';
import { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import MermaidReactFlowPlugin from './main';
import { hashMermaidCode, applySavedPositions, extractPositions } from './positionStorage';
import { Toolbar } from './Toolbar';
import { Theme, getThemeColors } from './themeManager';

interface ReactFlowDiagramWrapperProps {
  mermaidCode: string;
  plugin: MermaidReactFlowPlugin;
  theme: Theme;
  autoRefreshEnabled: boolean;
  onToggleAutoRefresh: () => void;
  onReloadRequested?: () => void;
  sourceFilePath: string;
}

export function ReactFlowDiagramWrapper({
  mermaidCode,
  plugin,
  theme,
  autoRefreshEnabled,
  onToggleAutoRefresh,
  onReloadRequested,
  sourceFilePath
}: ReactFlowDiagramWrapperProps) {
  const [flowData, setFlowData] = useState<ReactFlowData>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const diagramHashRef = useRef<string>('');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const originalNodesRef = useRef<Node[]>([]);
  const themeColors = getThemeColors(theme);

  useEffect(() => {
    if (mermaidCode) {
      setLoading(true);
      setError(null);

      // Calculate diagram hash
      const diagramHash = hashMermaidCode(mermaidCode);
      diagramHashRef.current = diagramHash;

      convertMermaidToReactFlow(mermaidCode)
        .then(data => {
          // Store original auto-layout positions
          originalNodesRef.current = data.nodes;

          // Load saved positions and apply them
          const savedPositions = plugin.getPositions(diagramHash);
          const nodesWithPositions = applySavedPositions(data.nodes, savedPositions);

          setFlowData({ nodes: nodesWithPositions, edges: data.edges });
          setLoading(false);
        })
        .catch(error => {
          console.error('Error converting diagram:', error);
          setError('Failed to convert Mermaid diagram');
          setLoading(false);
        });
    }
  }, [mermaidCode, plugin]);

  // Save positions with debounce
  const savePositions = useCallback((nodes: Node[]) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const positions = extractPositions(nodes);
      plugin.savePositions(diagramHashRef.current, positions);
    }, 500); // Debounce for 500ms
  }, [plugin]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleNodesChange = useCallback((nodes: Node[]) => {
    setFlowData(prev => ({ ...prev, nodes }));
    savePositions(nodes);
  }, [savePositions]);

  const handleEdgesChange = useCallback((edges: Edge[]) => {
    setFlowData(prev => ({ ...prev, edges }));
  }, []);

  // Manual save function
  const handleManualSave = useCallback(async () => {
    const positions = extractPositions(flowData.nodes);
    await plugin.savePositions(diagramHashRef.current, positions);
  }, [flowData.nodes, plugin]);

  // Reset to original auto-layout positions
  const handleReset = useCallback(() => {
    setFlowData(prev => ({ ...prev, nodes: originalNodesRef.current }));
    // Clear saved positions for this diagram
    plugin.savePositions(diagramHashRef.current, {});
  }, [plugin]);

  if (!mermaidCode) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '20px',
        textAlign: 'center',
        color: 'var(--text-muted)'
      }}>
        <div>
          <h3>No diagram selected</h3>
          <p>Click "View in React Flow" on a Mermaid code block to visualize it here.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%'
      }}>
        <div>Converting diagram...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--text-error)'
      }}>
        <div>{error}</div>
      </div>
    );
  }

  if (flowData.nodes.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--text-muted)'
      }}>
        <div>No nodes found in diagram</div>
      </div>
    );
  }

  // Check if this is a sequence diagram
  const isSequenceDiagram = mermaidCode.trim().startsWith('sequenceDiagram');

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      background: themeColors.background
    }}>
      <Toolbar
        onSave={handleManualSave}
        onReset={handleReset}
        onReload={onReloadRequested}
        theme={theme}
        autoRefreshEnabled={autoRefreshEnabled}
        onToggleAutoRefresh={onToggleAutoRefresh}
        sourceFilePath={sourceFilePath}
      />
      <FlowDiagram
        nodes={flowData.nodes}
        edges={flowData.edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        theme={theme}
        fitView={!isSequenceDiagram}
      />
    </div>
  );
}
