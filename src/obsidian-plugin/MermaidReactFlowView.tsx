import { ItemView, WorkspaceLeaf } from 'obsidian';
import { createRoot, Root } from 'react-dom/client';
import { ReactFlowDiagramWrapper } from './ReactFlowDiagramWrapper';
import MermaidReactFlowPlugin from './main';
import { detectObsidianTheme, Theme } from './themeManager';

const VIEW_TYPE_MERMAID_REACTFLOW = 'mermaid-reactflow-view';

export class MermaidReactFlowView extends ItemView {
  private root: Root | null = null;
  private mermaidCode: string = '';
  private sourceFilePath: string = '';
  private plugin: MermaidReactFlowPlugin;
  private theme: Theme = 'light';
  private themeObserver: MutationObserver | null = null;
  private fileWatcherRef: any = null;
  private autoRefreshEnabled: boolean = true;

  constructor(leaf: WorkspaceLeaf, plugin: MermaidReactFlowPlugin) {
    super(leaf);
    this.plugin = plugin;
    this.theme = detectObsidianTheme();
  }

  getViewType(): string {
    return VIEW_TYPE_MERMAID_REACTFLOW;
  }

  getDisplayText(): string {
    return 'Mermaid React Flow';
  }

  getIcon(): string {
    return 'git-fork';
  }

  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass('mermaid-reactflow-view');

    // Create React root and render the component
    this.root = createRoot(container);
    this.renderReactFlow();

    // Watch for theme changes
    this.setupThemeObserver();
  }

  async onClose() {
    // Clean up file watcher
    if (this.fileWatcherRef) {
      this.plugin.app.vault.offref(this.fileWatcherRef);
      this.fileWatcherRef = null;
    }

    // Clean up theme observer
    if (this.themeObserver) {
      this.themeObserver.disconnect();
      this.themeObserver = null;
    }

    // Clean up React root
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }

  private setupThemeObserver() {
    // Watch for theme changes on the body element
    this.themeObserver = new MutationObserver(() => {
      const newTheme = detectObsidianTheme();
      if (newTheme !== this.theme) {
        this.theme = newTheme;
        this.renderReactFlow();
      }
    });

    this.themeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  setMermaidCode(code: string, sourceFilePath?: string) {
    this.mermaidCode = code;

    if (sourceFilePath) {
      this.sourceFilePath = sourceFilePath;
      this.setupFileWatcher();
    }

    this.renderReactFlow();
  }

  private setupFileWatcher() {
    // Clean up existing watcher
    if (this.fileWatcherRef) {
      this.plugin.app.vault.offref(this.fileWatcherRef);
      this.fileWatcherRef = null;
    }

    if (!this.sourceFilePath || !this.autoRefreshEnabled) {
      return;
    }

    // Set up new watcher
    this.fileWatcherRef = this.plugin.app.vault.on('modify', async (file) => {
      if (file.path === this.sourceFilePath && this.autoRefreshEnabled) {
        await this.refreshFromFile();
      }
    });

    this.plugin.registerEvent(this.fileWatcherRef);
  }

  private async refreshFromFile() {
    if (!this.sourceFilePath) return;

    const file = this.plugin.app.vault.getAbstractFileByPath(this.sourceFilePath);
    if (!file || !('stat' in file)) {
      return;
    }

    try {
      const content = await this.plugin.app.vault.read(file as any);

      // Extract mermaid code blocks from the file
      const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
      const matches = [...content.matchAll(mermaidRegex)];

      // Find the matching mermaid block (by content similarity)
      const currentCode = this.mermaidCode.trim();
      for (const match of matches) {
        const blockCode = match[1].trim();

        // Check if this is a supported diagram type
        const isSupportedDiagram = blockCode.startsWith('graph ') ||
                                    blockCode.startsWith('flowchart ') ||
                                    blockCode.startsWith('sequenceDiagram') ||
                                    blockCode.match(/^graph\s+(TD|TB|BT|RL|LR)/i) ||
                                    blockCode.match(/^flowchart\s+(TD|TB|BT|RL|LR)/i);

        if (isSupportedDiagram && (blockCode === currentCode || this.isSimilar(currentCode, blockCode))) {
          // Update only if content has changed
          if (blockCode !== currentCode) {
            this.mermaidCode = blockCode;
            this.renderReactFlow();
          }
          break;
        }
      }
    } catch (error) {
      console.error('Error refreshing mermaid diagram:', error);
    }
  }

  // Check if two mermaid codes are similar (handles minor whitespace differences)
  private isSimilar(code1: string, code2: string): boolean {
    const normalize = (code: string) => code.replace(/\s+/g, ' ').trim();
    return normalize(code1) === normalize(code2);
  }

  toggleAutoRefresh() {
    this.autoRefreshEnabled = !this.autoRefreshEnabled;

    if (this.autoRefreshEnabled) {
      this.setupFileWatcher();
    } else if (this.fileWatcherRef) {
      this.plugin.app.vault.offref(this.fileWatcherRef);
      this.fileWatcherRef = null;
    }

    this.renderReactFlow();
  }

  private handleReload = async () => {
    await this.refreshFromFile();
  }

  private renderReactFlow() {
    if (this.root) {
      this.root.render(
        <ReactFlowDiagramWrapper
          mermaidCode={this.mermaidCode}
          plugin={this.plugin}
          theme={this.theme}
          autoRefreshEnabled={this.autoRefreshEnabled}
          onToggleAutoRefresh={() => this.toggleAutoRefresh()}
          onReloadRequested={() => this.handleReload()}
          sourceFilePath={this.sourceFilePath}
        />
      );
    }
  }

  setTheme(theme: Theme) {
    this.theme = theme;
    this.renderReactFlow();
  }
}
