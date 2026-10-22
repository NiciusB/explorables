import { chart, colors, space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';

import { DECILES } from '../inequality/data';
import { whimsy } from '../theme.stylex';
import { useTween } from '../useTween';

const HEIGHT = 220;

export interface DecileBarsProps {
  /** Ten values, poorest decile first. */
  values: readonly number[];
  /** Optional earlier values drawn as ghost outlines behind the bars. */
  ghosts?: readonly number[];
  /** Highest value the axis has to fit; keeps the scale steady while values animate. */
  max: number;
  /** The reader's decile (1–10), highlighted. */
  highlight: number;
  /** A horizontal line at the reader's own value. */
  you?: { value: number; label: string };
  label: string;
}

/** Ten people in a row, poorest to richest, each as tall as their decile's pay. */
export function DecileBars({ values, ghosts, max, highlight, you, label }: DecileBarsProps) {
  const shown = useTween(values);
  const height = (value: number) => `${String(Math.min(100, (value / max) * 100))}%`;
  return (
    <figure aria-label={label} {...stylex.props(styles.root)}>
      <div aria-hidden {...stylex.props(styles.plot)}>
        {you === undefined ? null : (
          <div {...stylex.props(styles.layer)}>
            <div {...stylex.props(styles.youLine, styles.bottom(height(you.value)))}>
              <span {...stylex.props(styles.youLabel)}>{you.label}</span>
            </div>
          </div>
        )}
        {shown.map((value, index) => {
          const decile = index + 1;
          const ghost = ghosts?.[index];
          return (
            <div key={decile} {...stylex.props(styles.column)}>
              {ghost === undefined ? null : (
                <span {...stylex.props(styles.ghost, styles.size(height(ghost)))} />
              )}
              <span
                {...stylex.props(
                  styles.bar,
                  styles.size(height(value)),
                  decile === highlight && styles.highlight,
                )}
              >
                <span
                  {...stylex.props(styles.head, decile === highlight && styles.headHighlight)}
                />
              </span>
            </div>
          );
        })}
      </div>
      <div aria-hidden {...stylex.props(styles.axis)}>
        {DECILES.map((decile) => (
          <span
            key={decile}
            {...stylex.props(styles.axisLabel, decile === highlight && styles.axisHighlight)}
          >
            {decile}
          </span>
        ))}
      </div>
    </figure>
  );
}

const styles = stylex.create({
  root: { margin: 0 },
  plot: {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: 'repeat(10, 1fr)',
    alignItems: 'end',
    gap: { default: 3, '@media (min-width: 480px)': space.sm },
    height: HEIGHT,
    paddingTop: 28,
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    borderBottomColor: whimsy.path,
  },
  column: { position: 'relative', display: 'flex', alignItems: 'end', height: '100%' },
  bar: {
    position: 'relative',
    width: '100%',
    borderRadius: '10px 10px 2px 2px',
    backgroundColor: chart.series1,
  },
  ghost: {
    position: 'absolute',
    insetInline: 0,
    bottom: 0,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.textMuted,
    borderBottomWidth: 0,
    borderRadius: '10px 10px 0 0',
    opacity: 0.5,
  },
  size: (height: string) => ({ height }),
  bottom: (bottom: string) => ({ bottom }),
  highlight: { backgroundColor: whimsy.you },
  head: {
    position: 'absolute',
    left: '50%',
    bottom: '100%',
    width: 14,
    height: 14,
    marginBottom: 3,
    borderRadius: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: chart.series1,
  },
  headHighlight: { backgroundColor: whimsy.you },
  /** The bars' area, without the room left for heads on top. */
  layer: {
    position: 'absolute',
    inset: 0,
    top: 28,
    pointerEvents: 'none',
  },
  youLine: {
    position: 'absolute',
    insetInline: 0,
    zIndex: 1,
    borderTopWidth: 2,
    borderTopStyle: 'dashed',
    borderTopColor: whimsy.you,
  },
  youLabel: {
    position: 'absolute',
    insetInlineStart: 0,
    bottom: 2,
    paddingInline: space.xs,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 700,
    color: colors.accentText,
    backgroundColor: whimsy.you,
  },
  axis: {
    display: 'grid',
    gridTemplateColumns: 'repeat(10, 1fr)',
    gap: { default: 3, '@media (min-width: 480px)': space.sm },
    marginTop: space.xs,
  },
  axisLabel: { fontSize: 12, textAlign: 'center', color: colors.textMuted },
  axisHighlight: { fontWeight: 700, color: whimsy.you },
});
