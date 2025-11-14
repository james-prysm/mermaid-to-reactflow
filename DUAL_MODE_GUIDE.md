# Dual-Mode Architecture Guide

This project supports two deployment modes: Standalone Web Application and Obsidian Plugin. Both modes share the same core conversion logic, ensuring consistent behavior.

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│              Your Mermaid Diagrams              │
└─────────────────┬───────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐  ┌──────▼────────┐
│   Standalone   │  │    Obsidian   │
│      Mode      │  │   Plugin Mode │
└───────┬────────┘  └──────┬────────┘
        │                  │
        └─────────┬────────┘
                  │
        ┌─────────▼────────┐
        │   Core Logic     │
        │  (src/core/)     │
        │                  │
        │ • mermaidParser  │
        │ • mermaidToFlow  │
        │ • diagramStorage │
        └──────────────────┘
```

## Shared Core Components

Located in `src/core/`:

- **mermaidParser.ts** - Extracts Mermaid diagrams from markdown
- **mermaidToReactFlow.ts** - Converts Mermaid syntax to React Flow nodes/edges
- **diagramStorage.ts** - Handles diagram persistence (localStorage/file)

## Mode-Specific Components

### Standalone (`src/standalone/`)
- Full-featured web UI with file upload, textarea input
- Sidebar for diagram selection and management
- Save/Load/Export functionality

### Obsidian Plugin (`src/obsidian-plugin/`)
- Integrates with Obsidian's markdown rendering
- Adds "View in React Flow" button to mermaid blocks
- Custom sidebar view for interactive diagrams
- Uses Obsidian's native styling

## Quick Start

### Prerequisites
```bash
npm install
```

### Build Everything
```bash
npm run build:all
```

### Development Workflows

#### Standalone Development
```bash
npm run dev
# Opens on http://localhost:5173
```

#### Plugin Development
```bash
npm run dev:plugin
# Watches for changes and rebuilds automatically
```

To test the plugin:
```bash
# After building, copy to your vault
./scripts/install-plugin.sh /path/to/your/vault
```

## File Organization

```
mermaid-to-reactflow/
├── src/
│   ├── core/                  ← Shared logic (both modes)
│   │   ├── mermaidParser.ts
│   │   ├── mermaidToReactFlow.ts
│   │   └── diagramStorage.ts
│   │
│   ├── standalone/            ← Web app specific
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── App.css
│   │   └── components/
│   │       ├── FlowDiagram.tsx
│   │       ├── CustomNode.tsx
│   │       ├── NodeEditor.tsx
│   │       └── SubgraphNode.tsx
│   │
│   ├── obsidian-plugin/       ← Plugin specific
│   │   ├── main.ts            (plugin entry)
│   │   ├── manifest.json      (plugin metadata)
│   │   ├── MermaidReactFlowView.tsx
│   │   ├── ReactFlowDiagramWrapper.tsx
│   │   └── styles.css
│   │
│   └── index.css              ← Shared global styles
│
├── dist/                      ← Standalone build output
├── obsidian-plugin-dist/      ← Plugin build output
├── index.html                 ← Standalone entry point
├── vite.config.ts             ← Standalone build config
├── vite.config.plugin.ts      ← Plugin build config
└── scripts/
    └── install-plugin.sh      ← Helper to install plugin
```

## Adding New Features

### To Core Logic (Affects Both Modes)
1. Modify files in `src/core/`
2. Test in both modes
3. Build both: `npm run build:all`

Example: Adding support for a new Mermaid diagram type
```typescript
// Edit src/core/mermaidParser.ts
// Both standalone and plugin will automatically support it
```

### To Standalone Only
1. Modify files in `src/standalone/`
2. Test: `npm run dev`
3. Build: `npm run build:standalone`

### To Plugin Only
1. Modify files in `src/obsidian-plugin/`
2. Test with: `npm run dev:plugin` + reload Obsidian
3. Build: `npm run build:plugin`

## Testing Both Modes

### Test Standalone
```bash
npm run build:standalone
npm run preview
```

### Test Plugin
```bash
npm run build:plugin
./scripts/install-plugin.sh ~/path/to/vault
# Then reload Obsidian
```

## Distribution

### Standalone
Deploy `dist/` folder to any static hosting:
- Vercel
- Netlify
- GitHub Pages
- etc.

### Obsidian Plugin
1. Build: `npm run build:plugin`
2. Package files from `obsidian-plugin-dist/`
3. Users install to `.obsidian/plugins/mermaid-reactflow/`

## Troubleshooting

### Import Issues
If you see import errors, check:
- Standalone imports use `../core/` for shared logic
- Plugin imports use `../core/` and `../standalone/components/`

### Build Errors
```bash
# Clean and rebuild
rm -rf dist obsidian-plugin-dist node_modules
npm install
npm run build:all
```

### Plugin Not Showing in Obsidian
1. Check `.obsidian/plugins/mermaid-reactflow/` contains:
   - main.js
   - manifest.json
   - styles.css (optional)
2. Reload Obsidian (Ctrl/Cmd + R)
3. Enable plugin in Settings → Community Plugins

## Performance Notes

The Obsidian plugin build is larger (~8MB for main.js) because:
- Includes all Mermaid diagram types
- Bundles React and React Flow
- Includes visualization libraries (D3, dagre, etc.)

For production, consider:
- Code splitting by diagram type
- Lazy loading diagram renderers
- External dependencies configuration

## Why This Architecture?

**Benefits:**
- ✅ Single source of truth for conversion logic
- ✅ Easy to maintain and update
- ✅ Test once, deploy twice
- ✅ Flexibility to use in different contexts
- ✅ Fallback option if one mode has issues

**Trade-offs:**
- Slightly more complex build setup
- Need to maintain two entry points
- Larger bundle size for plugin (includes React)

## Next Steps

1. **Add more diagram types** - Edit `src/core/mermaidParser.ts`
2. **Improve styling** - Edit `src/standalone/App.css` or `src/obsidian-plugin/styles.css`
3. **Add export formats** - Extend `src/core/diagramStorage.ts`
4. **Create plugin marketplace listing** - Package and submit to Obsidian community plugins

## Support

For issues:
- Standalone mode: Check browser console
- Plugin mode: Check Obsidian's developer console (Ctrl/Cmd + Shift + I)
