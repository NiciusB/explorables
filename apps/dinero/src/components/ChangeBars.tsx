import { chart, colors, space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';

import { DECILES } from '../inequality/data';
import { m } from '../paraglide/messages';
import { useTween } from '../useTween';
import { useChartTooltip } from './useChartTooltip';

export interface ChangeBarsProps {
  /** One change per decile, poorest first: positive means more money for that decile. */
  values: readonly number[];
  format: (value: number) => string;
  label: string;
}

/** Ten rows of gains (right, blue) and losses (left, orange) around a zero line. */
export function ChangeBars({ values, format, label }: ChangeBarsProps) {
  const tip = useChartTooltip(
    DECILES.map((decile) =>
      m.chart_change({
        decile: String(decile),
        value: format(values[decile - 1] ?? 0),
      }),
    ),
  );
  const shown = useTween(values);
  const max = Math.max(1, ...values.map((value) => Math.abs(value)));
  return (
    <figure aria-label={label} {...stylex.props(styles.root)}>
      <ol {...stylex.props(styles.list)}>
        {DECILES.map((decile) => {
          const value = shown[decile - 1] ?? 0;
          const share = `${String((Math.abs(value) / max) * 50)}%`;
          return (
            <li key={decile} {...stylex.props(styles.row)}>
              <span {...stylex.props(styles.decile)}>
                {m.decile_short({ number: String(decile) })}
              </span>
              <span {...tip.target(decile - 1)} {...stylex.props(styles.track)}>
                <span {...stylex.props(styles.zero)} />
                <span
                  {...stylex.props(
                    styles.bar,
                    value >= 0 ? styles.gain : styles.loss,
                    value >= 0 ? styles.fromCenter(share) : styles.toCenter(share),
                  )}
                />
              </span>
              <span {...stylex.props(styles.value)}>{format(values[decile - 1] ?? 0)}</span>
            </li>
          );
        })}
      </ol>
      {tip.tooltip}
    </figure>
  );
}

const styles = stylex.create({
  root: { margin: 0 },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '3.5em 1fr 6.5em',
    alignItems: 'center',
    gap: space.sm,
    fontSize: 14,
  },
  decile: { color: colors.textMuted },
  track: { position: 'relative', height: 18 },
  zero: {
    position: 'absolute',
    top: -2,
    bottom: -2,
    left: '50%',
    width: 1,
    backgroundColor: colors.textMuted,
  },
  bar: { position: 'absolute', top: 0, bottom: 0, borderRadius: 4 },
  gain: { backgroundColor: chart.series1 },
  loss: { backgroundColor: chart.series2 },
  fromCenter: (width: string) => ({ left: '50%', width }),
  toCenter: (width: string) => ({ right: '50%', width }),
  value: { fontVariantNumeric: 'tabular-nums', textAlign: 'end' },
});
