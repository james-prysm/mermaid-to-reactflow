import { useState } from 'react';
import { Theme } from './themeManager';

interface ToolbarProps {
  onSave: () => void;
  onReset?: () => void;
  onReload?: () => void;
  theme: Theme;
  autoRefreshEnabled: boolean;
  onToggleAutoRefresh: () => void;
  sourceFilePath: string;
}

export function Toolbar({
  onSave,
  onReset,
  onReload,
  theme,
  autoRefreshEnabled,
  onToggleAutoRefresh,
  sourceFilePath
}: ToolbarProps) {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const isDark = theme === 'dark';
  const hasSourceFile = sourceFilePath && sourceFilePath.length > 0;

  // Extract file name from path
  const fileName = sourceFilePath ? sourceFilePath.split('/').pop() || 'Unknown' : 'No source file';

  const handleSave = async () => {
    setSaveStatus('saving');
    await onSave();
    setSaveStatus('saved');

    // Reset status after 2 seconds
    setTimeout(() => {
      setSaveStatus('idle');
    }, 2000);
  };

  return (
    <div className={`mermaid-reactflow-toolbar ${isDark ? 'theme-dark' : 'theme-light'}`}>
      <div className="toolbar-section">
        <span className="toolbar-info" style={{ marginRight: '16px', fontWeight: 600 }}>
          📄 {fileName}
        </span>

        <button
          className="toolbar-button"
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          title="Save current node positions"
        >
          {saveStatus === 'saving' ? '💾 Saving...' :
           saveStatus === 'saved' ? '✅ Saved!' :
           '💾 Save Positions'}
        </button>

        {onReset && (
          <button
            className="toolbar-button"
            onClick={onReset}
            title="Reset to auto-layout positions"
          >
            🔄 Reset Layout
          </button>
        )}

        {onReload && hasSourceFile && (
          <button
            className="toolbar-button"
            onClick={onReload}
            title="Reload diagram from file"
          >
            ↻ Reload
          </button>
        )}

        {hasSourceFile && (
          <button
            className={`toolbar-button ${autoRefreshEnabled ? 'active' : ''}`}
            onClick={onToggleAutoRefresh}
            title={autoRefreshEnabled ? 'Auto-refresh enabled - click to disable' : 'Auto-refresh disabled - click to enable'}
          >
            {autoRefreshEnabled ? '🔄 Auto-Refresh: ON' : '⏸️ Auto-Refresh: OFF'}
          </button>
        )}
      </div>

      <div className="toolbar-info">
        {hasSourceFile && autoRefreshEnabled && (
          <span className="auto-refresh-indicator">
            🟢 Watching file for changes
          </span>
        )}
        {!hasSourceFile && saveStatus === 'idle' && 'Positions auto-save after dragging'}
        {hasSourceFile && !autoRefreshEnabled && saveStatus === 'idle' && 'Positions auto-save after dragging'}
      </div>
    </div>
  );
}
