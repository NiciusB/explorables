import { chart, colors } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';

/** Room (px) a centred x tick label needs on its right before it would be clipped. */
const EDGE_TICK_ROOM = 40;

export interface YGridProps {
  ticks: readonly number[];
  y: (value: number) => number;
  left: number;
  right: number;
  format: (value: number) => string;
}

/** Horizontal grid lines with their labels on the left. */
export function YGrid({ ticks, y, left, right, format }: YGridProps) {
  return ticks.map((tick) => (
    <g key={tick}>
      <line x1={left} x2={right} y1={y(tick)} y2={y(tick)} {...stylex.props(axis.grid)} />
      <text x={left - 6} y={y(tick)} dy="0.32em" textAnchor="end" {...stylex.props(axis.tick)}>
        {format(tick)}
      </text>
    </g>
  ));
}

export interface XTicksProps {
  ticks: readonly number[];
  x: (value: number) => number;
  /** Baseline of the labels. */
  y: number;
  width: number;
  format: (value: number) => string;
}

/** Labels along the bottom; one near the right edge is right-aligned so it isn't clipped. */
export function XTicks({ ticks, x, y, width, format }: XTicksProps) {
  return ticks.map((tick) => (
    <text
      key={tick}
      x={x(tick)}
      y={y}
      textAnchor={x(tick) > width - EDGE_TICK_ROOM ? 'end' : 'middle'}
      {...stylex.props(axis.tick)}
    >
      {format(tick)}
    </text>
  ));
}

export const axis = stylex.create({
  grid: { stroke: chart.grid, strokeWidth: 1 },
  tick: { fontSize: 12, fontVariantNumeric: 'tabular-nums', fill: colors.textMuted },
});
