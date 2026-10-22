import { chart, colors, space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';

import { m } from '../paraglide/messages';
import { useTween } from '../useTween';
import { useChartTooltip } from './useChartTooltip';

export interface ChangeBarsProps {
  /** Labelled gross salaries and their changes in yearly take-home pay. */
  items: readonly { label: string; value: number }[];
  format: (value: number) => string;
  label: string;
}

/** Ten rows of gains (right, blue) and losses (left, orange) around a zero line. */
export function ChangeBars({ items, format, label }: ChangeBarsProps) {
  const tip = useChartTooltip(
    items.map((item) => m.chart_salary_change({ salary: item.label, value: format(item.value) })),
  );
  const values = items.map((item) => item.value);
  const shown = useTween(values);
  const max = Math.max(1, ...values.map((value) => Math.abs(value)));
  return (
    <figure aria-label={label} {...stylex.props(styles.root)}>
      <ol {...stylex.props(styles.list)}>
        {items.map((item, index) => {
          const value = shown[index] ?? 0;
          const share = `${String((Math.abs(value) / max) * 50)}%`;
          return (
            <li key={item.label} {...stylex.props(styles.row)}>
              <span {...stylex.props(styles.salary)}>{item.label}</span>
              <span {...tip.target(index)} {...stylex.props(styles.track)}>
                <span {...stylex.props(styles.zero)} />
                <span
                  {...stylex.props(
                    styles.bar,
                    value >= 0 ? styles.gain : styles.loss,
                    value >= 0 ? styles.fromCenter(share) : styles.toCenter(share),
                  )}
                />
              </span>
              <span {...stylex.props(styles.value)}>{format(item.value)}</span>
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
    gridTemplateColumns: '6em minmax(0, 1fr) 6.5em',
    alignItems: 'center',
    gap: space.sm,
    fontSize: 14,
  },
  salary: { color: colors.textMuted },
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
