import { colors, space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';

import { DECILES } from '../inequality/data';
import { whimsy } from '../theme.stylex';
import { useTween } from '../useTween';

export interface PercentileRulerProps {
  /** 0 to 100. */
  percentile: number;
  /** Text on the pin, e.g. "You". */
  pin: string;
  label: string;
}

/** A ruler of ten deciles with a pin sliding to the reader's place. */
export function PercentileRuler({ percentile, pin, label }: PercentileRulerProps) {
  const [shown = percentile] = useTween([percentile]);
  const decile = Math.min(10, Math.floor(percentile / 10) + 1);
  return (
    <figure aria-label={label} {...stylex.props(styles.root)}>
      <div aria-hidden {...stylex.props(styles.track)}>
        {DECILES.map((cell) => (
          <span key={cell} {...stylex.props(styles.cell, cell === decile && styles.cellActive)}>
            {cell}
          </span>
        ))}
        <span {...stylex.props(styles.pin, styles.pinAt(Math.min(99, shown)))}>
          <span {...stylex.props(styles.pinLabel)}>{pin}</span>
          <span {...stylex.props(styles.pinStem)} />
        </span>
      </div>
    </figure>
  );
}

const styles = stylex.create({
  root: { margin: 0, paddingTop: 34 },
  track: {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: 'repeat(10, 1fr)',
    gap: 2,
  },
  cell: {
    paddingBlock: space.xs,
    borderRadius: 4,
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'center',
    color: colors.textMuted,
    backgroundColor: whimsy.paper,
  },
  cellActive: { color: whimsy.coinText, backgroundColor: whimsy.coin, fontWeight: 700 },
  pin: {
    position: 'absolute',
    bottom: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transform: 'translateX(-50%)',
  },
  pinAt: (percent: number) => ({ left: `${String(percent)}%` }),
  pinLabel: {
    paddingInline: space.sm,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    color: colors.accentText,
    backgroundColor: whimsy.you,
  },
  pinStem: { width: 2, height: 8, backgroundColor: whimsy.you },
});
