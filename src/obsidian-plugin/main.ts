import { Plugin, WorkspaceLeaf } from 'obsidian';
import { MermaidReactFlowView } from './MermaidReactFlowView';
import { SavedPositions } from './positionStorage';
import { MermaidReactFlowSettingTab } from './settings';
import './styles.css';

const VIEW_TYPE_MERMAID_REACTFLOW = 'mermaid-reactflow-view';

interface PluginData {
  positions: SavedPositions;
}

const DEFAULT_DATA: PluginData = {
  positions: {},
};

export default class MermaidReactFlowPlugin extends Plugin {
  data: PluginData = DEFAULT_DATA;
  private domObserver: MutationObserver | null = null;
  private buttonMarkerAttribute = 'data-reactflow-button-added';

  async onload() {
    console.log('Loading Mermaid React Flow plugin');

    // Load saved data
    await this.loadData().then((data) => {
      this.data = { ...DEFAULT_DATA, ...data };
    });

    // Register the custom view type
    this.registerView(
      VIEW_TYPE_MERMAID_REACTFLOW,
      (leaf) => new MermaidReactFlowView(leaf, this)
    );

    // Set up DOM observer for edit mode
    this.setupDOMObserver();

    // Add ribbon icon
    this.addRibbonIcon('git-fork', 'Open Mermaid React Flow', () => {
      this.activateView();
    });

    // Add command to open the view
    this.addCommand({
      id: 'open-mermaid-reactflow-view',
      name: 'Open Mermaid React Flow View',
      callback: () => {
        this.activateView();
      },
    });

    // Add settings tab
    this.addSettingTab(new MermaidReactFlowSettingTab(this.app, this));
  }

  async activateView() {
    const { workspace } = this.app;

    let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_MERMAID_REACTFLOW);

    if (leaves.length > 0) {
      // A leaf with our view already exists, use that
      leaf = leaves[0];
    } else {
      // Our view could not be found in the workspace, create a new leaf in the right sidebar for it
      leaf = workspace.getRightLeaf(false);
      if (leaf) {
        await leaf.setViewState({
          type: VIEW_TYPE_MERMAID_REACTFLOW,
          active: true,
        });
      }
    }

    // Reveal the leaf in case it is in a collapsed sidebar
    if (leaf) {
      workspace.revealLeaf(leaf);
    }
  }

  async savePositions(diagramHash: string, positions: { [nodeId: string]: { x: number; y: number } }) {
    this.data.positions[diagramHash] = positions;
    await this.saveData(this.data);
  }

  getPositions(diagramHash: string): { [nodeId: string]: { x: number; y: number } } | undefined {
    return this.data.positions[diagramHash];
  }

  private setupDOMObserver() {
    this.domObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        // Check for added nodes
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.processElement(node as HTMLElement);
          }
        });
      }
    });

    // Observe the document body for changes
    this.domObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Process existing elements on load
    this.processExistingElements();
  }

  private processExistingElements() {
    // Process all existing code blocks (reading mode)
    const codeBlocks = document.querySelectorAll('code.language-mermaid');
    codeBlocks.forEach((codeEl) => {
      const preEl = codeEl.parentElement;
      if (preEl) {
        this.addButtonToCodeBlock(preEl as HTMLElement);
      }
    });

    // Process all existing edit mode blocks
    const editModeBlocks = document.querySelectorAll('.cm-preview-code-block');
    editModeBlocks.forEach((block) => {
      const languageInfo = block.querySelector('.language-mermaid');
      if (languageInfo) {
        this.addButtonToEditModeBlock(block as HTMLElement);
      }
    });
  }

  private processElement(element: HTMLElement) {
    // Check if this element is a mermaid code block (reading mode)
    const codeBlocks = element.querySelectorAll('code.language-mermaid');
    codeBlocks.forEach((codeEl) => {
      const preEl = codeEl.parentElement;
      if (preEl && !preEl.hasAttribute(this.buttonMarkerAttribute)) {
        this.addButtonToCodeBlock(preEl as HTMLElement);
      }
    });

    // Check if the element itself is a code element
    if (element.matches && element.matches('code.language-mermaid')) {
      const preEl = element.parentElement;
      if (preEl && !preEl.hasAttribute(this.buttonMarkerAttribute)) {
        this.addButtonToCodeBlock(preEl as HTMLElement);
      }
    }

    // Check for edit mode (live preview) mermaid blocks
    // In live preview, mermaid is rendered inside .cm-preview-code-block
    if (element.classList && element.classList.contains('cm-preview-code-block')) {
      const languageInfo = element.querySelector('.language-mermaid');
      if (languageInfo && !element.hasAttribute(this.buttonMarkerAttribute)) {
        this.addButtonToEditModeBlock(element);
      }
    }

    // Also check within the element
    const editModeBlocks = element.querySelectorAll('.cm-preview-code-block');
    editModeBlocks.forEach((block) => {
      const languageInfo = block.querySelector('.language-mermaid');
      if (languageInfo && !(block as HTMLElement).hasAttribute(this.buttonMarkerAttribute)) {
        this.addButtonToEditModeBlock(block as HTMLElement);
      }
    });
  }

  private addButtonToCodeBlock(preEl: HTMLElement) {
    // Skip if already processed - use data attribute for reliable checking
    if (preEl.hasAttribute(this.buttonMarkerAttribute)) {
      return;
    }

    const codeEl = preEl.querySelector('code.language-mermaid');
    if (!codeEl) return;

    const source = codeEl.textContent || '';
    const trimmedSource = source.trim();

    // Process flowchart/graph and sequence diagrams
    const isSupportedDiagram = trimmedSource.startsWith('graph ') ||
                                trimmedSource.startsWith('flowchart ') ||
                                trimmedSource.startsWith('sequenceDiagram') ||
                                /^graph\s+(TD|TB|BT|RL|LR)/i.test(trimmedSource) ||
                                /^flowchart\s+(TD|TB|BT|RL|LR)/i.test(trimmedSource);

    if (!isSupportedDiagram) {
      return;
    }

    // Mark as processed FIRST to prevent duplicates
    preEl.setAttribute(this.buttonMarkerAttribute, 'true');

    // Check if button already exists
    let buttonContainer = preEl.previousElementSibling as HTMLElement;
    if (buttonContainer && buttonContainer.classList.contains('mermaid-reactflow-button-container')) {
      return;
    }

    // Create button container
    buttonContainer = document.createElement('div');
    buttonContainer.classList.add('mermaid-reactflow-button-container');
    buttonContainer.setAttribute('contenteditable', 'false');
    buttonContainer.style.marginBottom = '0.5em';
    buttonContainer.style.marginTop = '0.5em';

    // Add button
    const button = document.createElement('button');
    button.textContent = '🔀 React Flow';
    button.classList.add('mermaid-reactflow-button');
    button.setAttribute('contenteditable', 'false');
    button.setAttribute('type', 'button');

    // Add inline styles to ensure visibility
    button.style.padding = '0.4em 0.8em';
    button.style.background = 'var(--interactive-accent)';
    button.style.color = 'var(--text-on-accent)';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    button.style.fontSize = '12px';
    button.style.opacity = '0.8';
    button.style.transition = 'all 0.2s';
    button.style.display = 'inline-block';

    // Hover effect
    button.addEventListener('mouseenter', () => {
      button.style.opacity = '1';
      button.style.transform = 'translateY(-1px)';
      button.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.opacity = '0.8';
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = 'none';
    });

    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Get source file path at click time
      const markdownView = preEl.closest('.markdown-preview-view, .markdown-source-view');
      const filePathAttr = markdownView?.getAttribute('data-file-path');
      const activeFile = this.app.workspace.getActiveFile();
      const sourcePath = filePathAttr || activeFile?.path || '';

      await this.activateView();

      const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_MERMAID_REACTFLOW);
      if (leaves.length > 0) {
        const view = leaves[0].view;
        if (view instanceof MermaidReactFlowView) {
          view.setMermaidCode(source, sourcePath);
        }
      }
    });

    buttonContainer.appendChild(button);

    // Insert before the pre element
    if (preEl.parentElement) {
      preEl.parentElement.insertBefore(buttonContainer, preEl);
    }
  }

  private addButtonToEditModeBlock(block: HTMLElement) {
    // Skip if already processed - use data attribute for reliable checking
    if (block.hasAttribute(this.buttonMarkerAttribute)) {
      return;
    }

    // Mark as processed FIRST to prevent duplicates
    block.setAttribute(this.buttonMarkerAttribute, 'true');

    // Check if button already exists
    let buttonContainer = block.previousElementSibling as HTMLElement;
    if (buttonContainer && buttonContainer.classList.contains('mermaid-reactflow-button-container')) {
      return;
    }

    // Calculate block index to match with file content later
    const allMermaidBlocks = document.querySelectorAll('.cm-preview-code-block.cm-lang-mermaid');
    const blockIndex = Array.from(allMermaidBlocks).indexOf(block);

    // Create button container with absolute positioning to avoid contenteditable issues
    buttonContainer = document.createElement('div');
    buttonContainer.classList.add('mermaid-reactflow-button-container');
    buttonContainer.setAttribute('contenteditable', 'false');
    buttonContainer.style.position = 'absolute';
    buttonContainer.style.top = '8px';
    buttonContainer.style.left = '8px';
    buttonContainer.style.right = 'auto';  // Explicitly unset right positioning
    buttonContainer.style.zIndex = '10';
    buttonContainer.style.pointerEvents = 'auto';
    buttonContainer.style.textAlign = 'left';  // Force left alignment

    // Add button
    const button = document.createElement('button');
    button.textContent = '🔀 React Flow';
    button.classList.add('mermaid-reactflow-button');
    button.setAttribute('contenteditable', 'false');
    button.setAttribute('type', 'button');

    // Add inline styles to ensure visibility in edit mode
    button.style.padding = '0.4em 0.8em';
    button.style.background = 'var(--interactive-accent)';
    button.style.color = 'var(--text-on-accent)';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    button.style.fontSize = '12px';
    button.style.opacity = '0.8';
    button.style.transition = 'all 0.2s';
    button.style.display = 'inline-block';
    button.style.pointerEvents = 'auto';

    // Hover effect
    button.addEventListener('mouseenter', () => {
      button.style.opacity = '1';
      button.style.transform = 'translateY(-1px)';
      button.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.opacity = '0.8';
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = 'none';
    });

    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Get source file path at click time
      const activeFile = this.app.workspace.getActiveFile();
      const sourcePath = activeFile?.path || '';

      // Extract mermaid source from file when button is clicked
      const source = await this.extractMermaidFromFile(blockIndex);

      if (!source) {
        console.error('ReactFlow: Could not extract mermaid source from file');
        return;
      }

      await this.activateView();

      const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_MERMAID_REACTFLOW);
      if (leaves.length > 0) {
        const view = leaves[0].view;
        if (view instanceof MermaidReactFlowView) {
          view.setMermaidCode(source, sourcePath);
        }
      }
    });

    buttonContainer.appendChild(button);

    // Make the block position relative so absolute positioning works
    block.style.position = 'relative';

    // Append button to the block itself (not before it)
    block.appendChild(buttonContainer);
  }

  private async extractMermaidFromFile(blockIndex: number): Promise<string | null> {
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) return null;

    try {
      const content = await this.app.vault.read(activeFile);

      // Extract all mermaid code blocks
      const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
      const matches = [...content.matchAll(mermaidRegex)];

      // Filter to only supported diagrams (flowcharts and sequence diagrams)
      const supportedDiagrams = matches.filter(match => {
        const code = match[1].trim();
        return code.startsWith('graph ') ||
               code.startsWith('flowchart ') ||
               code.startsWith('sequenceDiagram') ||
               /^graph\s+(TD|TB|BT|RL|LR)/i.test(code) ||
               /^flowchart\s+(TD|TB|BT|RL|LR)/i.test(code);
      });

      if (blockIndex >= 0 && blockIndex < supportedDiagrams.length) {
        return supportedDiagrams[blockIndex][1].trim();
      }

      return null;
    } catch (error) {
      console.error('ReactFlow: Error reading file:', error);
      return null;
    }
  }

  onunload() {
    console.log('Unloading Mermaid React Flow plugin');

    // Clean up DOM observer
    if (this.domObserver) {
      this.domObserver.disconnect();
      this.domObserver = null;
    }
  }
}
