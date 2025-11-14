export type Theme = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  nodeBackground: string;
  nodeBorder: string;
  nodeText: string;
  edgeStroke: string;
  edgeText: string;
  controlsBackground: string;
  controlsBorder: string;
  controlsText: string;
  minimapBackground: string;
  minimapBorder: string;
}

export const LIGHT_THEME: ThemeColors = {
  background: '#ffffff',
  nodeBackground: '#ffffff',
  nodeBorder: '#333333',
  nodeText: '#000000',
  edgeStroke: '#333333',
  edgeText: '#000000',
  controlsBackground: '#ffffff',
  controlsBorder: '#cccccc',
  controlsText: '#333333',
  minimapBackground: '#f9f9f9',
  minimapBorder: '#cccccc',
};

export const DARK_THEME: ThemeColors = {
  background: '#1e1e1e',
  nodeBackground: '#2d2d2d',
  nodeBorder: '#4d4d4d',
  nodeText: '#e0e0e0',
  edgeStroke: '#666666',
  edgeText: '#b0b0b0',
  controlsBackground: '#2d2d2d',
  controlsBorder: '#4d4d4d',
  controlsText: '#e0e0e0',
  minimapBackground: '#252525',
  minimapBorder: '#4d4d4d',
};

export function getThemeColors(theme: Theme): ThemeColors {
  return theme === 'dark' ? DARK_THEME : LIGHT_THEME;
}

export function detectObsidianTheme(): Theme {
  // Check for Obsidian's theme class on body
  const body = document.body;

  if (body.classList.contains('theme-dark')) {
    return 'dark';
  }

  if (body.classList.contains('theme-light')) {
    return 'light';
  }

  // Fallback: check prefers-color-scheme
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}
