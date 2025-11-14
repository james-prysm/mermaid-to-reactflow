import { useState } from 'react';
import { DiagramMetadata, NodeMetadata, constructFileUri, getNodeTypeIcon, getStatusColor } from './metadataParser';

interface MetadataPanelProps {
  diagramMetadata: DiagramMetadata;
  selectedNodeMetadata?: NodeMetadata;
  theme: 'light' | 'dark';
  vaultPath?: string;
}

export function MetadataPanel({ diagramMetadata, selectedNodeMetadata, theme, vaultPath }: MetadataPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  const bgColor = theme === 'dark' ? '#1e1e1e' : '#ffffff';
  const textColor = theme === 'dark' ? '#cccccc' : '#333333';
  const borderColor = theme === 'dark' ? '#3e3e3e' : '#e0e0e0';
  const headerBg = theme === 'dark' ? '#2a2a2a' : '#f5f5f5';

  if (collapsed) {
    return (
      <div style={{
        position: 'absolute',
        top: '60px',
        right: '10px',
        zIndex: 1000,
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '4px',
        padding: '8px 12px',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      }} onClick={() => setCollapsed(false)}>
        <span style={{ fontSize: '14px' }}>ℹ️ Info</span>
      </div>
    );
  }

  return (
    <div style={{
      position: 'absolute',
      top: '60px',
      right: '10px',
      width: '300px',
      maxHeight: 'calc(100vh - 100px)',
      zIndex: 1000,
      background: bgColor,
      border: `1px solid ${borderColor}`,
      borderRadius: '4px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      color: textColor,
    }}>
      {/* Header */}
      <div style={{
        padding: '12px',
        background: headerBg,
        borderBottom: `1px solid ${borderColor}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
          {selectedNodeMetadata ? '📍 Node Info' : '📊 Diagram Info'}
        </span>
        <button
          onClick={() => setCollapsed(true)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '0 4px',
            color: textColor,
          }}
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div style={{
        padding: '12px',
        overflowY: 'auto',
        flex: 1,
      }}>
        {selectedNodeMetadata ? (
          <NodeInfo
            metadata={selectedNodeMetadata}
            diagramMetadata={diagramMetadata}
            textColor={textColor}
            vaultPath={vaultPath}
          />
        ) : (
          <DiagramInfo metadata={diagramMetadata} textColor={textColor} />
        )}
      </div>
    </div>
  );
}

function DiagramInfo({ metadata, textColor }: { metadata: DiagramMetadata; textColor: string }) {
  return (
    <div style={{ fontSize: '13px' }}>
      {metadata.title && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Title</div>
          <div style={{ color: textColor, opacity: 0.9 }}>{metadata.title}</div>
        </div>
      )}

      {metadata.description && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Description</div>
          <div style={{ color: textColor, opacity: 0.9, lineHeight: '1.4' }}>{metadata.description}</div>
        </div>
      )}

      {metadata.type && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Type</div>
          <div style={{
            display: 'inline-block',
            padding: '2px 8px',
            background: '#3498db',
            color: 'white',
            borderRadius: '3px',
            fontSize: '11px',
          }}>
            {metadata.type}
          </div>
        </div>
      )}

      {(metadata.created || metadata.updated) && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Dates</div>
          {metadata.created && (
            <div style={{ fontSize: '12px', marginBottom: '2px' }}>
              Created: {metadata.created}
            </div>
          )}
          {metadata.updated && (
            <div style={{ fontSize: '12px' }}>
              Updated: {metadata.updated}
            </div>
          )}
        </div>
      )}

      {metadata.repo && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Repository</div>
          <a
            href={metadata.repo}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#3498db',
              textDecoration: 'none',
              fontSize: '12px',
              wordBreak: 'break-all',
            }}
          >
            {metadata.repo} ↗
          </a>
        </div>
      )}
    </div>
  );
}

function NodeInfo({
  metadata,
  diagramMetadata,
  textColor,
  vaultPath,
}: {
  metadata: NodeMetadata;
  diagramMetadata: DiagramMetadata;
  textColor: string;
  vaultPath?: string;
}) {
  const fileUri = metadata.file
    ? constructFileUri(
        metadata.file,
        metadata.line,
        diagramMetadata.repo,
        diagramMetadata.basePath,
        vaultPath
      )
    : undefined;

  return (
    <div style={{ fontSize: '13px' }}>
      {/* Node ID */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Node ID</div>
        <code style={{
          padding: '2px 6px',
          background: 'rgba(0, 0, 0, 0.1)',
          borderRadius: '3px',
          fontSize: '12px',
        }}>
          {metadata.nodeId}
        </code>
      </div>

      {/* Type and Status */}
      <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {metadata.type && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            background: '#3498db',
            color: 'white',
            borderRadius: '3px',
            fontSize: '11px',
          }}>
            <span>{getNodeTypeIcon(metadata.type)}</span>
            <span>{metadata.type}</span>
          </div>
        )}

        {metadata.status && (
          <div style={{
            display: 'inline-block',
            padding: '2px 8px',
            background: getStatusColor(metadata.status),
            color: 'white',
            borderRadius: '3px',
            fontSize: '11px',
          }}>
            {metadata.status}
          </div>
        )}

        {metadata.complexity && (
          <div style={{
            display: 'inline-block',
            padding: '2px 8px',
            background: metadata.complexity === 'high' ? '#e74c3c' : metadata.complexity === 'medium' ? '#f39c12' : '#27ae60',
            color: 'white',
            borderRadius: '3px',
            fontSize: '11px',
          }}>
            {metadata.complexity} complexity
          </div>
        )}
      </div>

      {/* Description */}
      {metadata.description && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Description</div>
          <div style={{ color: textColor, opacity: 0.9, lineHeight: '1.4' }}>{metadata.description}</div>
        </div>
      )}

      {/* File Link */}
      {fileUri && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Source File</div>
          <a
            href={fileUri}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#3498db',
              textDecoration: 'none',
              fontSize: '12px',
              wordBreak: 'break-all',
              display: 'block',
            }}
            onClick={(e) => {
              // For obsidian:// URIs, prevent default and use window.open
              if (fileUri.startsWith('obsidian://')) {
                e.preventDefault();
                window.open(fileUri, '_blank');
              }
            }}
          >
            📄 {metadata.file}
            {metadata.line && `:${metadata.line}`} ↗
          </a>
        </div>
      )}

      {/* URL */}
      {metadata.url && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Documentation</div>
          <a
            href={metadata.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#3498db',
              textDecoration: 'none',
              fontSize: '12px',
              wordBreak: 'break-all',
            }}
          >
            {metadata.url} ↗
          </a>
        </div>
      )}

      {/* Notes */}
      {metadata.notes && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>⚠️ Notes</div>
          <div style={{
            color: textColor,
            opacity: 0.9,
            lineHeight: '1.4',
            padding: '8px',
            background: 'rgba(243, 156, 18, 0.1)',
            borderLeft: '3px solid #f39c12',
            borderRadius: '3px',
          }}>
            {metadata.notes}
          </div>
        </div>
      )}

      {/* Dependencies */}
      {metadata.dependencies && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Dependencies</div>
          <div style={{ fontSize: '12px', color: textColor, opacity: 0.9 }}>
            {metadata.dependencies.split(',').map((dep, i) => (
              <code
                key={i}
                style={{
                  display: 'inline-block',
                  margin: '2px 4px 2px 0',
                  padding: '2px 6px',
                  background: 'rgba(0, 0, 0, 0.1)',
                  borderRadius: '3px',
                }}
              >
                {dep.trim()}
              </code>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
