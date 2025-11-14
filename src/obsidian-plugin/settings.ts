import { App, PluginSettingTab, Setting } from 'obsidian';
import MermaidReactFlowPlugin from './main';

export class MermaidReactFlowSettingTab extends PluginSettingTab {
  plugin: MermaidReactFlowPlugin;

  constructor(app: App, plugin: MermaidReactFlowPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    // Header
    containerEl.createEl('h2', { text: 'Mermaid React Flow Settings' });

    // About section
    new Setting(containerEl)
      .setName('About')
      .setDesc('Convert Mermaid diagrams to interactive React Flow visualizations');

    // GitHub link
    new Setting(containerEl)
      .setName('Source Code')
      .setDesc('View the project on GitHub')
      .addButton(button => button
        .setButtonText('Open GitHub')
        .setCta()
        .onClick(() => {
          window.open('https://github.com/james-prysm/mermaid-to-reactflow/tree/master', '_blank');
        })
      );

    // Documentation
    new Setting(containerEl)
      .setName('Documentation')
      .setDesc('Learn how to use the plugin')
      .addButton(button => button
        .setButtonText('View Docs')
        .onClick(() => {
          window.open('https://github.com/james-prysm/mermaid-to-reactflow/blob/master/README.md', '_blank');
        })
      );

    // Usage info
    containerEl.createEl('h3', { text: 'How to Use' });

    const usageDiv = containerEl.createDiv();
    usageDiv.createEl('p', { text: 'This plugin adds a "View in React Flow" button above supported Mermaid diagrams.' });
    usageDiv.createEl('p', { text: 'Supported diagram types:' });

    const list = usageDiv.createEl('ul');
    list.createEl('li', { text: 'Flowcharts (graph/flowchart)' });
    list.createEl('li', { text: 'Sequence diagrams' });

    usageDiv.createEl('p', { text: 'Click the button to open an interactive version in the sidebar where you can pan, zoom, and rearrange nodes.' });

    // Version info (if available from manifest)
    containerEl.createEl('h3', { text: 'Version' });
    new Setting(containerEl)
      .setName('Plugin Version')
      .setDesc(`v${this.plugin.manifest.version}`);
  }
}
