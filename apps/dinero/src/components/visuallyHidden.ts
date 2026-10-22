import * as stylex from '@stylexjs/stylex';

/** Hides text visually while keeping it for screen readers, e.g. a group's legend. */
export const a11y = stylex.create({
  hidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
  },
});
