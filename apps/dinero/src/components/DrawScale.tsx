import { chart, colors, space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { useId, useRef, type PointerEvent } from 'react';

import { formatEuros, formatPercent } from '../format';
import { m } from '../paraglide/messages';
import type { Locale } from '../paraglide/runtime';
import { type Design, toScale } from '../sandbox/customScale';
import {
  DRAW_BASES,
  DRAW_MAX,
  drawingBrackets,
  drawSegment,
  type DrawPoint,
} from '../sandbox/drawScale';
import { rateAt } from '../tax/scale';

interface DrawScaleProps {
  design: Design;
  onChange: (design: Design) => void;
  locale: Locale;
}

const WIDTH = 600;
const HEIGHT = 300;
const LEFT = 42;
const RIGHT = 564;
const TOP = 18;
const BOTTOM = 254;
const x = (base: number) => LEFT + (base / DRAW_MAX) * (RIGHT - LEFT);
const y = (rate: number) => BOTTOM - (rate / 100) * (BOTTOM - TOP);

/** A touch canvas with focusable rate points as a keyboard alternative. */
export function DrawScale({ design, onChange, locale }: DrawScaleProps) {
  const description = useId();
  const stroke = useRef<{ pointer: number; point: DrawPoint; design: Design } | null>(null);
  const scale = toScale(design.brackets);
  const rows = scale.filter((row) => row.from <= DRAW_MAX);
  const path = rows.map((row) => `H${String(x(row.from))}V${String(y(row.rate))}`).join('');
  const pointAt = (event: PointerEvent<SVGSVGElement>): DrawPoint => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const px = ((event.clientX - bounds.left) / bounds.width) * WIDTH;
    const py = ((event.clientY - bounds.top) / bounds.height) * HEIGHT;
    return {
      from: Math.min(DRAW_MAX, Math.max(0, ((px - LEFT) / (RIGHT - LEFT)) * DRAW_MAX)),
      rate: Math.min(100, Math.max(0, ((BOTTOM - py) / (BOTTOM - TOP)) * 100)),
    };
  };
  const apply = (next: Design, point: DrawPoint, pointer: number) => {
    stroke.current = { pointer, point, design: next };
    onChange(next);
  };
  const stop = (event: PointerEvent<SVGSVGElement>) => {
    if (stroke.current?.pointer === event.pointerId) stroke.current = null;
  };

  return (
    <figure {...stylex.props(styles.root)}>
      <figcaption {...stylex.props(styles.title)}>{m.sandbox_draw_title()}</figcaption>
      <p id={description} {...stylex.props(styles.hint)}>
        {m.sandbox_draw_hint()}
      </p>
      <svg
        viewBox={`0 0 ${String(WIDTH)} ${String(HEIGHT)}`}
        role="group"
        aria-label={m.sandbox_draw_title()}
        aria-describedby={description}
        {...stylex.props(styles.canvas)}
        onPointerDown={(event) => {
          if (!event.isPrimary || event.button !== 0) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          const point = pointAt(event);
          apply(
            { ...design, brackets: drawSegment(drawingBrackets(design.brackets), point, point) },
            point,
            event.pointerId,
          );
        }}
        onPointerMove={(event) => {
          const active = stroke.current;
          if (active === null || active.pointer !== event.pointerId) return;
          const point = pointAt(event);
          apply(
            {
              ...active.design,
              brackets: drawSegment(active.design.brackets, active.point, point),
            },
            point,
            event.pointerId,
          );
        }}
        onPointerUp={stop}
        onPointerCancel={stop}
        onLostPointerCapture={stop}
      >
        {[0, 25, 50, 75, 100].map((rate) => (
          <g key={rate} aria-hidden="true">
            <line x1={LEFT} x2={RIGHT} y1={y(rate)} y2={y(rate)} {...stylex.props(styles.grid)} />
            <text x={LEFT - 7} y={y(rate) + 4} textAnchor="end" {...stylex.props(styles.label)}>
              {formatPercent(rate / 100, locale)}
            </text>
          </g>
        ))}
        {[0, 50_000, 100_000, DRAW_MAX].map((base) => (
          <text
            key={base}
            aria-hidden="true"
            x={x(base)}
            y={BOTTOM + 27}
            textAnchor={base === 0 ? 'start' : 'end'}
            {...stylex.props(styles.label)}
          >
            {formatEuros(base, locale)}
          </text>
        ))}
        <path
          aria-hidden="true"
          d={`M${String(LEFT)},${String(y(rows[0]?.rate ?? 0))}${path}H${String(RIGHT)}`}
          {...stylex.props(styles.curve)}
        />
        {DRAW_BASES.map((from) => {
          const rate = rateAt(scale, from + 1e-9);
          return (
            <circle
              key={from}
              cx={x(from)}
              cy={y(rate)}
              r={6}
              role="slider"
              tabIndex={0}
              aria-label={m.sandbox_draw_point({ amount: formatEuros(from, locale) })}
              aria-orientation="vertical"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={rate}
              aria-valuetext={formatPercent(rate / 100, locale)}
              {...stylex.props(styles.handle)}
              onKeyDown={(event) => {
                const delta = { ArrowUp: 1, ArrowRight: 5, ArrowDown: -1, ArrowLeft: -5 }[
                  event.key
                ];
                if (delta === undefined && event.key !== 'Home' && event.key !== 'End') return;
                event.preventDefault();
                const next =
                  event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                      ? 100
                      : Math.min(100, Math.max(0, rate + (delta ?? 0)));
                onChange({
                  ...design,
                  brackets: drawingBrackets(design.brackets).map((row) =>
                    row.from === from ? { from: row.from, rate: next } : row,
                  ),
                });
              }}
            />
          );
        })}
      </svg>
      <p {...stylex.props(styles.hint)}>
        {m.sandbox_draw_note({
          exempt: formatEuros(design.exempt, locale),
          maximum: formatEuros(DRAW_MAX, locale),
        })}
      </p>
    </figure>
  );
}

const styles = stylex.create({
  root: { margin: 0, minWidth: 0 },
  title: { fontWeight: 600, fontSize: 20 },
  hint: { color: colors.textMuted, fontSize: 14, marginBlock: space.sm },
  canvas: {
    display: 'block',
    width: '100%',
    touchAction: 'none',
    cursor: 'crosshair',
    overflow: 'visible',
  },
  grid: { stroke: colors.border, strokeWidth: 1 },
  label: { fill: colors.textMuted, fontSize: { default: 14, '@media (max-width: 560px)': 19 } },
  curve: { fill: 'none', stroke: chart.series1, strokeWidth: 3, strokeLinejoin: 'round' },
  handle: {
    fill: colors.surface,
    stroke: chart.series1,
    strokeWidth: { default: 2, ':focus': 5 },
    outline: 'none',
  },
});
