import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync } from 'fs';

// Plugin to copy manifest.json to output directory
const copyManifest = () => ({
  name: 'copy-manifest',
  writeBundle() {
    copyFileSync(
      resolve(__dirname, 'src/obsidian-plugin/manifest.json'),
      resolve(__dirname, 'obsidian-plugin-dist/manifest.json')
    );
    // Copy styles.css
    const fs = require('fs');
    const cssFiles = fs.readdirSync(resolve(__dirname, 'obsidian-plugin-dist'));
    const cssFile = cssFiles.find((f: string) => f.endsWith('.css'));
    if (cssFile && cssFile !== 'styles.css') {
      copyFileSync(
        resolve(__dirname, 'obsidian-plugin-dist', cssFile),
        resolve(__dirname, 'obsidian-plugin-dist/styles.css')
      );
    }
  },
});

export default defineConfig({
  plugins: [react(), copyManifest()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/obsidian-plugin/index.ts'),
      formats: ['cjs'],
      fileName: () => 'main.js',
    },
    rollupOptions: {
      external: [
        'obsidian',
        'electron',
      ],
      output: {
        format: 'cjs',
        exports: 'default',
        inlineDynamicImports: true,
        globals: {
          obsidian: 'obsidian',
        },
      },
    },
    outDir: 'obsidian-plugin-dist',
    emptyOutDir: true,
    sourcemap: 'inline',
    target: 'es2018',
  },
  resolve: {
    alias: {
      '@core': resolve(__dirname, 'src/core'),
      '@standalone': resolve(__dirname, 'src/standalone'),
    },
  },
});
