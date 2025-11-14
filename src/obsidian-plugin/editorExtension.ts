import { EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate, WidgetType } from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';
import MermaidReactFlowPlugin from './main';

class ReactFlowButtonWidget extends WidgetType {
  constructor(
    private mermaidCode: string,
    private sourcePath: string,
    private plugin: MermaidReactFlowPlugin,
    private activateView: () => Promise<void>
  ) {
    super();
  }

  toDOM(): HTMLElement {
    console.log('ReactFlowButtonWidget: Creating button widget');
    const buttonContainer = document.createElement('span');
    buttonContainer.classList.add('mermaid-reactflow-button-container');
    buttonContainer.classList.add('cm-reactflow-button');
    buttonContainer.setAttribute('contenteditable', 'false');
    buttonContainer.style.display = 'inline-block';
    buttonContainer.style.margin = '4px 8px';

    const button = document.createElement('button');
    button.textContent = '🔀 View in React Flow';
    button.classList.add('mermaid-reactflow-button');
    button.setAttribute('contenteditable', 'false');

    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      await this.activateView();

      const leaves = this.plugin.app.workspace.getLeavesOfType('mermaid-reactflow-view');
      if (leaves.length > 0) {
        const view = leaves[0].view;
        if (view && 'setMermaidCode' in view) {
          (view as any).setMermaidCode(this.mermaidCode, this.sourcePath);
        }
      }
    });

    buttonContainer.appendChild(button);
    return buttonContainer;
  }

  ignoreEvent(): boolean {
    return false;
  }
}

function createReactFlowButtons(view: EditorView, plugin: MermaidReactFlowPlugin, activateView: () => Promise<void>): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const sourcePath = (view.state as any).file?.path || '';
  const doc = view.state.doc;

  console.log('ReactFlow: createReactFlowButtons called, visible ranges:', view.visibleRanges.length, 'total lines:', doc.lines);

  // Iterate through visible lines looking for mermaid code blocks
  for (const { from, to } of view.visibleRanges) {
    const startLine = doc.lineAt(from).number;
    const endLine = doc.lineAt(to).number;

    for (let lineNum = startLine; lineNum <= endLine; lineNum++) {
      const line = doc.line(lineNum);
      const lineText = line.text.trim();

      // Check if this line starts a mermaid code block
      if (lineText === '```mermaid') {
        // Collect the code block content
        let codeContent = '';
        let currentLine = lineNum + 1;
        let foundEnd = false;
        let endLineNum = lineNum;

        while (currentLine <= doc.lines && !foundEnd) {
          const contentLine = doc.line(currentLine);
          const contentText = contentLine.text;

          if (contentText.trim().startsWith('```')) {
            foundEnd = true;
            endLineNum = currentLine;
          } else {
            codeContent += contentText + '\n';
          }

          currentLine++;
        }

        // Check if it's a flowchart
        const trimmedCode = codeContent.trim();
        const isFlowchart =
          trimmedCode.startsWith('graph ') ||
          trimmedCode.startsWith('flowchart ') ||
          /^graph\s+(TD|TB|BT|RL|LR)/i.test(trimmedCode) ||
          /^flowchart\s+(TD|TB|BT|RL|LR)/i.test(trimmedCode);

        if (isFlowchart && codeContent.trim()) {
          console.log('ReactFlow: Found flowchart at line', lineNum, 'with content:', codeContent.substring(0, 50));
          // Add button decoration after the closing ``` line
          const endLine = doc.line(endLineNum);
          const widget = Decoration.widget({
            widget: new ReactFlowButtonWidget(codeContent.trim(), sourcePath, plugin, activateView),
            side: 1, // After the line
          });

          builder.add(endLine.to, endLine.to, widget);
        }

        // Skip to the end of this code block
        lineNum = currentLine - 1;
      }
    }
  }

  return builder.finish();
}

export function createReactFlowEditorExtension(plugin: MermaidReactFlowPlugin, activateView: () => Promise<void>) {
  console.log('ReactFlow: Creating editor extension');
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        console.log('ReactFlow: ViewPlugin constructor called');
        this.decorations = createReactFlowButtons(view, plugin, activateView);
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
          console.log('ReactFlow: ViewPlugin update called, docChanged:', update.docChanged, 'viewportChanged:', update.viewportChanged);
          this.decorations = createReactFlowButtons(update.view, plugin, activateView);
        }
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  );
}
