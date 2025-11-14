#!/bin/bash

# Helper script to install the Obsidian plugin to a vault
# Usage: ./scripts/install-plugin.sh /path/to/your/vault

if [ -z "$1" ]; then
  echo "Usage: ./scripts/install-plugin.sh /path/to/your/vault"
  echo "Example: ./scripts/install-plugin.sh ~/Documents/MyVault"
  exit 1
fi

VAULT_PATH="$1"
PLUGIN_DIR="$VAULT_PATH/.obsidian/plugins/mermaid-reactflow"

# Check if vault path exists
if [ ! -d "$VAULT_PATH" ]; then
  echo "Error: Vault path does not exist: $VAULT_PATH"
  exit 1
fi

# Build the plugin
echo "Building Obsidian plugin..."
npm run build:plugin

if [ $? -ne 0 ]; then
  echo "Error: Build failed"
  exit 1
fi

# Create plugin directory if it doesn't exist
echo "Creating plugin directory: $PLUGIN_DIR"
mkdir -p "$PLUGIN_DIR"

# Copy built files
echo "Copying plugin files..."
cp obsidian-plugin-dist/main.js "$PLUGIN_DIR/"
cp obsidian-plugin-dist/styles.css "$PLUGIN_DIR/" 2>/dev/null || echo "No styles.css found, skipping..."
cp src/obsidian-plugin/manifest.json "$PLUGIN_DIR/"

echo ""
echo "✓ Plugin installed successfully!"
echo ""
echo "To enable the plugin:"
echo "1. Restart Obsidian or reload the app (Ctrl/Cmd + R)"
echo "2. Go to Settings → Community Plugins"
echo "3. Enable 'Mermaid React Flow'"
