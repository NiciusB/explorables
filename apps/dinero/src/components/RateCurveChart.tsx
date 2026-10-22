import { chart, colors } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';

import { formatEuros, formatPercent, niceTicks } from '../format';
import type { Locale } from '../paraglide/runtime';
import { whimsy } from '../theme.stylex';
import { useElementWidth } from '../useElementWidth';
import { XTicks, YGrid } from './chartAxes';

const HEIGHT = 280;
const MARGIN = { top: 16, right: 12, bottom: 32, left: 44 };
const Y_MAX = 0.7;
const Y_TICKS = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7];

export interface RateCurveChartProps {
  /** Marginal rate (fraction) at evenly spaced bases from 0 to `maxBase`. */
  rates: readonly number[];
  /** The same for today's scale, drawn dashed behind for comparison. */
  todayRates: readonly number[];
  maxBase: number;
  /** The reader's base, marked with a dot on the curve. */
  marker: number;
  markerRate: number;
  label: string;
  locale: Locale;
}

/** Marginal tax rate against taxable base: the shape of a whole tax scale at a glance. */
export function RateCurveChart({
  rates,
  todayRates,
  maxBase,
  marker,
  markerRate,
  label,
  locale,
}: RateCurveChartProps) {
  const [ref, width] = useElementWidth<HTMLElement>(640);
  const plotWidth = Math.max(0, width - MARGIN.left - MARGIN.right);
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const x = (base: number) => MARGIN.left + (Math.min(base, maxBase) / maxBase) * plotWidth;
  const y = (rate: number) => MARGIN.top + (1 - Math.min(rate, Y_MAX) / Y_MAX) * plotHeight;
  const path = (values: readonly number[]) => {
    const step = maxBase / Math.max(1, values.length - 1);
    // A step function: hold each rate flat until the next sample.
    return values
      .map((rate, index) => {
        const start = `${index === 0 ? 'M' : 'L'}${String(x(index * step))},${String(y(rate))}`;
        return `${start} L${String(x((index + 1) * step))},${String(y(rate))}`;
      })
      .join(' ');
  };

  return (
    <figure ref={ref} aria-label={label} {...stylex.props(styles.root)}>
      <svg width={width} height={HEIGHT} aria-hidden>
        <YGrid
          ticks={Y_TICKS}
          y={y}
          left={MARGIN.left}
          right={MARGIN.left + plotWidth}
          format={(tick) => formatPercent(tick, locale)}
        />
        <XTicks
          ticks={niceTicks(maxBase, width < 480 ? 3 : 5)}
          x={x}
          y={HEIGHT - 10}
          width={width}
          format={(tick) => formatEuros(tick, locale)}
        />
        <path d={path(todayRates)} {...stylex.props(styles.today)} />
        <path d={path(rates)} {...stylex.props(styles.past)} />
        <line
          x1={x(marker)}
          x2={x(marker)}
          y1={y(markerRate)}
          y2={y(0)}
          {...stylex.props(styles.markerLine)}
        />
        <circle cx={x(marker)} cy={y(markerRate)} r={6} {...stylex.props(styles.marker)} />
      </svg>
    </figure>
  );
}

const styles = stylex.create({
  root: { position: 'relative', width: '100%', margin: 0 },
  today: {
    fill: 'none',
    stroke: colors.textMuted,
    strokeWidth: 2,
    strokeDasharray: '5 4',
    opacity: 0.7,
  },
  past: {
    fill: 'none',
    stroke: chart.series2,
    strokeWidth: 3.5,
    strokeLinejoin: 'round',
  },
  markerLine: { stroke: whimsy.you, strokeWidth: 1.5, strokeDasharray: '3 3' },
  marker: { fill: whimsy.you, stroke: colors.surface, strokeWidth: 2 },
});
