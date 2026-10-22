import { chart, colors, space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';

import { formatEuros, formatPercent, niceTicks } from '../format';
import { m } from '../paraglide/messages';
import type { Locale } from '../paraglide/runtime';
import { irpfRate, socialSecurityRate, type Step } from '../tax/marginal';
import { useElementWidth } from '../useElementWidth';
import { seriesStyles } from './Legend';

const HEIGHT = 260;
const MARGIN = { top: 12, right: 8, bottom: 32, left: 44 };
const GAP = 2;
/** Steps narrower than this (px) get no rate label. */
const MIN_LABEL_WIDTH = 34;
const Y_TICKS = [0, 0.25, 0.5, 0.75, 1];
/** Room (px) a centred x tick label needs on its right. */
const EDGE_TICK_ROOM = 40;

export interface StaircaseProps {
  gross: number;
  steps: readonly Step[];
  locale: Locale;
}

/** For every euro of gross salary, from first to last: the share to Social Security, IRPF and net. */
export function Staircase({ gross, steps, locale }: StaircaseProps) {
  const [containerRef, width] = useElementWidth<HTMLElement>(640);
  const [active, setActive] = useState<number | null>(null);
  if (gross <= 0) return null;

  const plotWidth = Math.max(0, width - MARGIN.left - MARGIN.right);
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const x = (euros: number) => MARGIN.left + (euros / gross) * plotWidth;
  const y = (fraction: number) => MARGIN.top + (1 - fraction) * plotHeight;
  const activeStep = active === null ? undefined : steps[active];

  return (
    // The table view below carries the data for assistive tech; the drawing itself is hidden.
    <figure ref={containerRef} aria-label={m.staircase_label()} {...stylex.props(styles.root)}>
      <svg
        width={width}
        height={HEIGHT}
        aria-hidden
        onPointerLeave={() => {
          setActive(null);
        }}
      >
        {Y_TICKS.map((tick) => (
          <g key={tick}>
            <line
              x1={MARGIN.left}
              x2={MARGIN.left + plotWidth}
              y1={y(tick)}
              y2={y(tick)}
              {...stylex.props(styles.grid)}
            />
            <text
              x={MARGIN.left - 6}
              y={y(tick)}
              dy="0.32em"
              textAnchor="end"
              {...stylex.props(styles.tick)}
            >
              {formatPercent(tick, locale)}
            </text>
          </g>
        ))}
        {niceTicks(gross, width < 480 ? 3 : 5).map((tick) => (
          <text
            key={tick}
            x={x(tick)}
            y={HEIGHT - 10}
            // A tick near the right edge would be clipped if centred.
            textAnchor={x(tick) > width - EDGE_TICK_ROOM ? 'end' : 'middle'}
            {...stylex.props(styles.tick)}
          >
            {formatEuros(tick, locale)}
          </text>
        ))}

        {steps.map((step, index) => {
          const left = x(step.from) + (index === 0 ? 0 : GAP / 2);
          const stepWidth = Math.max(1, x(step.to) - x(step.from) - (index === 0 ? GAP / 2 : GAP));
          const social = socialSecurityRate(step);
          const irpf = Math.max(0, irpfRate(step));
          const dimmed = active !== null && active !== index;
          return (
            <g
              key={step.from}
              onPointerEnter={() => {
                setActive(index);
              }}
              {...stylex.props(styles.step, dimmed && styles.dimmed)}
            >
              <rect
                x={left}
                width={stepWidth}
                y={y(1)}
                height={y(social + irpf) - y(1)}
                {...stylex.props(styles.netWash)}
              />
              <rect
                x={left}
                width={stepWidth}
                y={y(social + irpf)}
                height={y(social) - y(social + irpf)}
                {...stylex.props(seriesStyles.irpf)}
              />
              <rect
                x={left}
                width={stepWidth}
                y={y(social)}
                height={y(0) - y(social)}
                {...stylex.props(seriesStyles.socialSecurity)}
              />
              {stepWidth >= MIN_LABEL_WIDTH && irpf >= 0.005 ? (
                <text
                  x={left + stepWidth / 2}
                  y={y(social + irpf) - 6}
                  textAnchor="middle"
                  {...stylex.props(styles.rateLabel)}
                >
                  {formatPercent(irpf, locale)}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      {activeStep === undefined ? null : (
        <StepTooltip
          step={activeStep}
          locale={locale}
          left={(x(activeStep.from) + x(activeStep.to)) / 2}
          width={width}
        />
      )}
    </figure>
  );
}

interface StepTooltipProps {
  step: Step;
  locale: Locale;
  /** Horizontal centre of the step in px. */
  left: number;
  width: number;
}

function StepTooltip({ step, locale, left, width }: StepTooltipProps) {
  const social = socialSecurityRate(step);
  const irpf = irpfRate(step);
  const per100 = (fraction: number) => formatEuros(fraction * 100, locale, { cents: true });
  const tooltipWidth = 240;
  const clamped = Math.min(Math.max(left - tooltipWidth / 2, 0), Math.max(0, width - tooltipWidth));
  return (
    <output {...stylex.props(styles.tooltip, styles.tooltipPosition(clamped, tooltipWidth))}>
      <strong>
        {m.tooltip_range({
          from: formatEuros(step.from, locale),
          to: formatEuros(step.to, locale),
        })}
      </strong>
      <span>
        {m.tooltip_split({
          socialSecurity: per100(social),
          irpf: per100(irpf),
          net: per100(1 - social - irpf),
        })}
      </span>
    </output>
  );
}

const styles = stylex.create({
  root: {
    position: 'relative',
    width: '100%',
    margin: 0,
  },
  grid: {
    stroke: chart.grid,
    strokeWidth: 1,
  },
  tick: {
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    fill: colors.textMuted,
  },
  step: {
    transition: 'opacity 120ms',
  },
  dimmed: {
    opacity: 0.45,
  },
  netWash: {
    fill: chart.series1,
    fillOpacity: 0.18,
  },
  rateLabel: {
    fontSize: 12,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    fill: colors.text,
  },
  tooltip: {
    position: 'absolute',
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: space.xs,
    padding: space.sm,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: 8,
    fontSize: 13,
    lineHeight: 1.4,
    color: colors.text,
    backgroundColor: colors.surface,
    boxShadow: '0 4px 16px rgb(0 0 0 / 0.1)',
    pointerEvents: 'none',
  },
  tooltipPosition: (left: number, width: number) => ({
    left,
    width,
  }),
});
