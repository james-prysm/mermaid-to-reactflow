# Publishing the Obsidian Plugin

This guide walks you through publishing the Mermaid React Flow plugin to Obsidian's community plugins directory.

## Prerequisites

- [ ] GitHub account with access to `james-prysm/mermaid-to-reactflow`
- [ ] Plugin tested and working in Obsidian
- [ ] All changes committed to git

## Step 1: Prepare the Release Files

The plugin release needs these files in the repo root:
- `manifest.json`
- `main.js` (the built plugin)
- `styles.css` (plugin styles)
- `versions.json` (tracks version compatibility)

Run the prepare script:
```bash
./scripts/prepare-release.sh
```

This will:
1. Build the plugin
2. Copy `manifest.json`, `main.js`, and `styles.css` to the repo root
3. Show you what files are ready for release

## Step 2: Update Version Numbers (for future releases)

Before each new release, update version in these files:
1. `src/obsidian-plugin/manifest.json` - Update `version` field
2. `versions.json` - Add new version mapping
3. `package.json` - Update `version` field (optional)

Example for version 1.1.0:
```json
// src/obsidian-plugin/manifest.json
{
  "version": "1.1.0",
  ...
}

// versions.json
{
  "1.0.0": "0.15.0",
  "1.1.0": "0.15.0"
}
```

## Step 3: Commit and Tag the Release

```bash
# Commit the release files
git add manifest.json main.js styles.css versions.json
git commit -m "Release version 1.0.0"

# Create a git tag
git tag -a 1.0.0 -m "Release version 1.0.0"

# Push everything to GitHub
git push origin master
git push origin --tags
```

## Step 4: Create GitHub Release

1. Go to https://github.com/james-prysm/mermaid-to-reactflow/releases
2. Click "Create a new release"
3. Choose the tag you just created (1.0.0)
4. Set release title: "v1.0.0" or "Initial Release"
5. Add release notes describing features:
   ```markdown
   ## Features
   - Convert Mermaid flowcharts to interactive React Flow diagrams
   - Support for sequence diagrams
   - Auto-refresh when diagrams are edited
   - Manual reload button
   - Save custom node positions
   - Dark/light theme support

   ## Installation
   Download and extract to `.obsidian/plugins/mermaid-reactflow/`
   ```
6. Attach these files to the release:
   - `main.js`
   - `manifest.json`
   - `styles.css`
7. Click "Publish release"

## Step 5: Submit to Obsidian Community Plugins

### First Time Submission

1. Fork the official plugin repository:
   - Go to https://github.com/obsidianmd/obsidian-releases
   - Click "Fork" in the top right

2. Add your plugin to the community list:
   ```bash
   # Clone your fork
   git clone https://github.com/james-prysm/obsidian-releases.git
   cd obsidian-releases

   # Create a new branch
   git checkout -b add-mermaid-reactflow

   # Add your plugin to community-plugins.json
   # (Add entry alphabetically by ID)
   ```

3. Edit `community-plugins.json` and add:
   ```json
   {
     "id": "mermaid-reactflow",
     "name": "Mermaid React Flow",
     "author": "james-prysm",
     "description": "Convert Mermaid diagrams to interactive React Flow visualizations",
     "repo": "james-prysm/mermaid-to-reactflow"
   }
   ```

4. Commit and push:
   ```bash
   git add community-plugins.json
   git commit -m "Add Mermaid React Flow plugin"
   git push origin add-mermaid-reactflow
   ```

5. Create Pull Request:
   - Go to https://github.com/obsidianmd/obsidian-releases
   - Click "Pull requests" → "New pull request"
   - Click "compare across forks"
   - Select your fork and branch
   - Create the PR with a clear description

6. Wait for review:
   - Obsidian team will review your plugin
   - They may request changes or ask questions
   - Once approved, your plugin will appear in the community plugins list!

### For Future Updates

Once your plugin is in the community directory, users will automatically see updates when you:
1. Update version in `manifest.json`
2. Create a new GitHub release with the new version tag
3. Attach the updated `main.js`, `manifest.json`, and `styles.css`

The `versions.json` file tells Obsidian which minimum app version each plugin version requires.

## Testing Before Release

Always test your plugin before releasing:

```bash
# Build the plugin
npm run build:plugin

# Install to a test vault
./scripts/install-plugin.sh ~/path/to/test/vault

# Test in Obsidian:
# 1. Reload Obsidian (Ctrl/Cmd + R)
# 2. Enable the plugin in Settings
# 3. Test all features
# 4. Check for console errors (Ctrl/Cmd + Shift + I)
```

## Checklist for Each Release

- [ ] Update version numbers in manifest.json and versions.json
- [ ] Build the plugin: `npm run build:plugin`
- [ ] Test in Obsidian thoroughly
- [ ] Run prepare script: `./scripts/prepare-release.sh`
- [ ] Commit release files
- [ ] Create and push git tag
- [ ] Create GitHub release with assets
- [ ] (First time only) Submit PR to obsidian-releases repo

## Common Issues

### "main.js not found"
- Make sure you ran `npm run build:plugin`
- Check that `obsidian-plugin-dist/main.js` exists
- Run the prepare script to copy files

### "Plugin version mismatch"
- Ensure version in `manifest.json` matches your git tag
- Update `versions.json` with the new version

### "Release assets missing"
- You must manually attach main.js, manifest.json, and styles.css to each GitHub release
- Don't rely on source code zip - Obsidian downloads the attached files

## Resources

- [Official Plugin Submission Guidelines](https://github.com/obsidianmd/obsidian-releases#community-plugins)
- [Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin)
- [Developer Docs](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
