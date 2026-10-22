import * as stylex from '@stylexjs/stylex';

const DARK = '@media (prefers-color-scheme: dark)';

/** Dinero's own look on top of the shared tokens: a playful serif and coin colours. */
export const whimsy = stylex.defineVars({
  /** Fraunces with its soft, "wonky" axes turned up for headings. */
  display: '"Fraunces Variable", Georgia, "Times New Roman", serif',
  coin: { default: '#f2b632', [DARK]: '#e0a526' },
  coinEdge: { default: '#c98a12', [DARK]: '#a8740c' },
  coinText: { default: '#4a3200', [DARK]: '#2a1c00' },
  /** A faint tint for chapter cards and the menu path. */
  paper: { default: '#f3efe6', [DARK]: '#1e1e24' },
  path: { default: '#d8cfbd', [DARK]: '#45454f' },
  /** The reader, wherever they appear in a chart. */
  you: { default: '#c2410c', [DARK]: '#fb923c' },
});

/**
 * An ordered ramp for groups that go from least to most (e.g. wealth groups), in coin
 * golds. Light steps take dark labels and dark steps light ones, in both themes.
 */
export const ramp = stylex.defineVars({
  step1: { default: '#fbeec8', [DARK]: '#3a3220' },
  step2: { default: '#f6d77e', [DARK]: '#6b5418' },
  step3: { default: '#e9b33a', [DARK]: '#a17a14' },
  step4: { default: '#b9800f', [DARK]: '#d6a32b' },
  step5: { default: '#6e4706', [DARK]: '#f5cf6b' },
  lightLabel: { default: '#ffffff', [DARK]: '#16161a' },
  darkLabel: { default: '#3a2600', [DARK]: '#f3efe6' },
});
