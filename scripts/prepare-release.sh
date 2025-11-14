#!/bin/bash

# Script to prepare plugin release files
# This copies the necessary files to the repo root for GitHub releases

set -e

echo "🔨 Building plugin..."
npm run build:plugin

echo ""
echo "📦 Copying release files to repo root..."

# Copy manifest
cp src/obsidian-plugin/manifest.json ./manifest.json
echo "✓ Copied manifest.json"

# Copy main.js
cp obsidian-plugin-dist/main.js ./main.js
echo "✓ Copied main.js"

# Copy styles
cp obsidian-plugin-dist/styles.css ./styles.css
echo "✓ Copied styles.css"

echo ""
echo "✅ Release files ready!"
echo ""
echo "Files prepared for release:"
echo "  - manifest.json"
echo "  - main.js"
echo "  - styles.css"
echo "  - versions.json (already in root)"
echo ""

# Read version from manifest
VERSION=$(node -p "require('./manifest.json').version")

echo "Next steps:"
echo "  1. Review the files: git status"
echo "  2. Commit: git add manifest.json main.js styles.css versions.json"
echo "  3. Commit: git commit -m 'Release version $VERSION'"
echo "  4. Tag: git tag -a $VERSION -m 'Release version $VERSION'"
echo "  5. Push: git push origin master && git push origin --tags"
echo "  6. Create GitHub release at: https://github.com/james-prysm/mermaid-to-reactflow/releases/new"
echo ""
