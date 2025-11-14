# Mermaid to React Flow Converter

Convert Mermaid diagrams from markdown files into interactive React Flow visualizations. Available in two modes:
- **Standalone Web Application** - Run as a standalone web app
- **Obsidian Plugin** - Integrate with Obsidian note-taking app

## Features

- Parse markdown files to extract Mermaid diagram code blocks
- Convert Mermaid flowcharts into React Flow nodes and edges
- Interactive UI with pan, zoom, and minimap
- Support for multiple diagrams in a single markdown file
- Real-time conversion from text input or file upload
- Dual-mode architecture: Use as standalone app or Obsidian plugin

## Project Structure

```
src/
├── core/                   # Shared conversion logic (used by both modes)
│   ├── mermaidParser.ts
│   ├── mermaidToReactFlow.ts
│   └── diagramStorage.ts
├── standalone/             # Standalone web application
│   ├── App.tsx
│   ├── main.tsx
│   └── components/
└── obsidian-plugin/        # Obsidian plugin
    ├── main.ts
    ├── manifest.json
    ├── MermaidReactFlowView.tsx
    └── ReactFlowDiagramWrapper.tsx
```

## Getting Started

### Installation

```bash
npm install
```

## Standalone Web Application

### Development

```bash
npm run dev
```

### Build

```bash
npm run build:standalone
# Output: dist/
```

### Usage

1. Run the development server with `npm run dev`
2. Open the application in your browser
3. Either:
   - Upload a markdown file containing Mermaid diagrams using the file picker
   - Paste markdown content directly into the text area
4. Select a diagram from the list (if multiple are found)
5. Interact with the generated React Flow diagram

## Obsidian Plugin

### Development

```bash
npm run dev:plugin
```

This will watch for changes and rebuild the plugin automatically.

### Build

```bash
npm run build:plugin
# Output: obsidian-plugin-dist/
```

### Installation in Obsidian

1. Build the plugin: `npm run build:plugin`
2. Copy the contents of `obsidian-plugin-dist/` to your Obsidian vault's plugins folder:
   ```bash
   cp -r obsidian-plugin-dist/ /path/to/your/vault/.obsidian/plugins/mermaid-reactflow/
   ```
3. Reload Obsidian or enable "Mermaid React Flow" in Settings → Community Plugins

### Usage in Obsidian

1. Create a Mermaid code block in any note:
   ````markdown
   ```mermaid
   graph TD
     A[Start] --> B[Process]
     B --> C[End]
   ```
   ````

2. Click the "View in React Flow" button that appears above the diagram
3. The diagram will open in an interactive React Flow view in the sidebar
4. Pan, zoom, and interact with the diagram

Alternatively:
- Use the ribbon icon (fork symbol) to open the React Flow view
- Use the command palette: "Open Mermaid React Flow View"

## Build Both Modes

To build both the standalone app and Obsidian plugin:

```bash
npm run build:all
```

## Example

An example markdown file (`example.md`) is included with various Mermaid diagram types.

## Supported Mermaid Diagram Types

Currently optimized for:
- Flowcharts (`graph` and `flowchart`)
- Other diagram types are detected but may have limited conversion support

## Technologies Used

- React
- React Flow
- Mermaid
- TypeScript
- Vite
- Obsidian API (for plugin mode)

## Why Two Modes?

The dual-mode architecture provides:
- **Flexibility**: Use the tool standalone or integrated with Obsidian
- **Code Reuse**: Core conversion logic is shared between both modes
- **Backup Strategy**: If one mode has issues, you can fall back to the other
- **Use Case Coverage**: Standalone for general use, plugin for Obsidian users