import * as stylex from '@stylexjs/stylex';

import { whimsy } from '../theme.stylex';

export interface NumberCoinProps {
  number: number;
  size: number;
  /** A dull coin is one the reader hasn't reached; a shiny one is where they are. */
  shiny?: boolean;
}

/** A gold coin stamped with a chapter number. Decorative: the number is in nearby text. */
export function NumberCoin({ number, size, shiny = true }: NumberCoinProps) {
  return (
    <span aria-hidden {...stylex.props(styles.coin, styles.size(size), !shiny && styles.dull)}>
      {number}
    </span>
  );
}

const styles = stylex.create({
  coin: {
    display: 'inline-grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '50%',
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: whimsy.coinEdge,
    fontFamily: whimsy.display,
    fontWeight: 800,
    lineHeight: 1,
    color: whimsy.coinText,
    backgroundColor: whimsy.coin,
    boxShadow: 'inset 0 -2px 0 rgb(0 0 0 / 0.18)',
    transition: 'transform 250ms ease-out, background-color 200ms, opacity 200ms',
  },
  size: (size: number) => ({
    width: size,
    height: size,
    fontSize: size * 0.5,
  }),
  dull: {
    opacity: 0.55,
    backgroundColor: whimsy.paper,
    color: whimsy.coinEdge,
  },
});
