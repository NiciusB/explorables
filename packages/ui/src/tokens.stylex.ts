import * as stylex from '@stylexjs/stylex';

const DARK = '@media (prefers-color-scheme: dark)';

export const colors = stylex.defineVars({
  background: { default: '#fbfaf7', [DARK]: '#16161a' },
  surface: { default: '#ffffff', [DARK]: '#222228' },
  text: { default: '#1d1d1f', [DARK]: '#ececf1' },
  textMuted: { default: '#5f5f66', [DARK]: '#a3a3ad' },
  border: { default: '#dcdad4', [DARK]: '#3a3a42' },
  accent: { default: '#c2410c', [DARK]: '#fb923c' },
  accentText: { default: '#ffffff', [DARK]: '#16161a' },
});

/**
 * Data-viz series colors: the first three slots of the validated categorical palette
 * (dataviz reference palette), stepped separately for dark mode.
 */
export const chart = stylex.defineVars({
  series1: { default: '#2a78d6', [DARK]: '#3987e5' },
  series2: { default: '#eb6834', [DARK]: '#d95926' },
  series3: { default: '#1baf7a', [DARK]: '#199e70' },
  grid: { default: '#e6e4de', [DARK]: '#33333a' },
});

export const space = stylex.defineVars({
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '48px',
});

export const fonts = stylex.defineVars({
  body: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  numeric: 'ui-monospace, "SF Mono", Menlo, monospace',
});
