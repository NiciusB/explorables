import { chart, colors, space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';

import { whimsy } from '../theme.stylex';
import { useElementWidth } from '../useElementWidth';
import { axis, YGrid } from './chartAxes';
import { useChartCursor } from './useChartCursor';

const HEIGHT = 240;
const MARGIN = { top: 12, right: 12, bottom: 28, left: 40 };

export interface LineSeries {
  key: string;
  label: string;
  points: readonly { x: number; value: number }[];
  tone: 'primary' | 'secondary' | 'you';
}

export interface LineChartProps {
  series: readonly LineSeries[];
  yMin: number;
  yMax: number;
  yTicks: readonly number[];
  format: (value: number) => string;
  /** How x values print on the axis and in the readout; years by default. */
  formatX?: (x: number) => string;
  /** The x the readout shows when nothing is hovered; the last x by default. */
  rest?: number;
  label: string;
}

/** One line per series (over years, or any x), with a readout for the hovered x. */
export function LineChart({
  series,
  yMin,
  yMax,
  yTicks,
  format,
  formatX = String,
  rest,
  label,
}: LineChartProps) {
  const [ref, width] = useElementWidth<HTMLElement>(640);
  const xs = [...new Set(series.flatMap((line) => line.points.map((point) => point.x)))].toSorted(
    (a, b) => a - b,
  );
  const first = xs[0] ?? 0;
  const last = xs.at(-1) ?? 1;
  const plotWidth = Math.max(0, width - MARGIN.left - MARGIN.right);
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const x = (value: number) =>
    MARGIN.left + ((value - first) / Math.max(1, last - first)) * plotWidth;
  const y = (value: number) => MARGIN.top + (1 - (value - yMin) / (yMax - yMin)) * plotHeight;
  const middle = xs[Math.floor(xs.length / 2)] ?? first;
  const xTicks = [...new Set([first, middle, last])];
  const cursor = useChartCursor({
    xs,
    labels: xs.map((at) =>
      [
        formatX(at),
        ...series.map((line) => {
          const point = line.points.find((candidate) => candidate.x === at);
          return `${line.label}: ${point === undefined ? '—' : format(point.value)}`;
        }),
      ].join('\n'),
    ),
    label,
    rest: rest ?? last,
    width,
    left: MARGIN.left,
    right: MARGIN.right,
  });
  const readout = cursor.value;

  return (
    <figure ref={ref} aria-label={label} {...stylex.props(styles.root)}>
      <svg width={width} height={HEIGHT} {...cursor.props}>
        <YGrid
          ticks={yTicks}
          y={y}
          left={MARGIN.left}
          right={MARGIN.left + plotWidth}
          format={format}
        />
        {xTicks.map((tick) => (
          <text
            key={tick}
            x={x(tick)}
            y={HEIGHT - 8}
            textAnchor={tick === last ? 'end' : tick === first ? 'start' : 'middle'}
            {...stylex.props(axis.tick)}
          >
            {formatX(tick)}
          </text>
        ))}
        <line
          x1={x(readout)}
          x2={x(readout)}
          y1={MARGIN.top}
          y2={MARGIN.top + plotHeight}
          {...stylex.props(styles.cursor)}
        />
        {series.map((line) => (
          <g key={line.key}>
            <path
              d={line.points
                .map(
                  (point, index) =>
                    `${index === 0 ? 'M' : 'L'}${String(x(point.x))},${String(y(point.value))}`,
                )
                .join(' ')}
              {...stylex.props(styles.line, toneStyles[line.tone])}
            />
            {line.points
              .filter((point) => point.x === readout)
              .map((point) => (
                <circle
                  key={point.x}
                  cx={x(point.x)}
                  cy={y(point.value)}
                  r={4.5}
                  {...stylex.props(styles.dot, dotStyles[line.tone])}
                />
              ))}
          </g>
        ))}
      </svg>
      <figcaption {...stylex.props(styles.readout)}>
        <strong>{formatX(readout)}</strong>
        {series.map((line) => {
          const point = line.points.find((candidate) => candidate.x === readout);
          return (
            <span key={line.key} {...stylex.props(styles.readoutItem)}>
              <span aria-hidden {...stylex.props(styles.swatch, dotStyles[line.tone])} />
              {line.label}: {point === undefined ? '—' : format(point.value)}
            </span>
          );
        })}
      </figcaption>
      {cursor.tooltip}
    </figure>
  );
}

const toneStyles = stylex.create({
  primary: { stroke: chart.series1 },
  secondary: { stroke: chart.series3 },
  you: { stroke: whimsy.you },
});

const dotStyles = stylex.create({
  primary: { fill: chart.series1, backgroundColor: chart.series1 },
  secondary: { fill: chart.series3, backgroundColor: chart.series3 },
  you: { fill: whimsy.you, backgroundColor: whimsy.you },
});

const styles = stylex.create({
  root: { position: 'relative', width: '100%', margin: 0 },
  cursor: { stroke: colors.border, strokeWidth: 1.5 },
  line: { fill: 'none', strokeWidth: 3, strokeLinejoin: 'round', strokeLinecap: 'round' },
  dot: { stroke: colors.surface, strokeWidth: 2 },
  readout: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: space.md,
    fontSize: 14,
    fontVariantNumeric: 'tabular-nums',
    color: colors.textMuted,
  },
  readoutItem: { display: 'flex', alignItems: 'center', gap: space.xs },
  swatch: { width: 12, height: 12, borderRadius: '50%' },
});
