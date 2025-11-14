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
  private blockIndex: number = 0; // Track which mermaid block in the file
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

  setMermaidCode(code: string, sourceFilePath?: string, blockIndex?: number) {
    this.mermaidCode = code;

    if (sourceFilePath) {
      this.sourceFilePath = sourceFilePath;
      this.blockIndex = blockIndex ?? 0;
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

      // Extract all mermaid code blocks from the file
      const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
      const matches = [...content.matchAll(mermaidRegex)];

      // Filter to only supported diagrams
      const supportedDiagrams = matches.filter(match => {
        const code = match[1].trim();
        return code.startsWith('graph ') ||
               code.startsWith('flowchart ') ||
               code.startsWith('sequenceDiagram') ||
               /^graph\s+(TD|TB|BT|RL|LR)/i.test(code) ||
               /^flowchart\s+(TD|TB|BT|RL|LR)/i.test(code);
      });

      // Get the specific block by index
      if (this.blockIndex >= 0 && this.blockIndex < supportedDiagrams.length) {
        const newCode = supportedDiagrams[this.blockIndex][1].trim();

        // Always update to the latest content
        if (newCode !== this.mermaidCode.trim()) {
          this.mermaidCode = newCode;
          this.renderReactFlow();
        }
      }
    } catch (error) {
      console.error('Error refreshing mermaid diagram:', error);
    }
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
