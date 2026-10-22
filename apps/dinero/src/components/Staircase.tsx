import { colors } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';

import { formatEuros, formatPercent, niceTicks } from '../format';
import { m } from '../paraglide/messages';
import type { Locale } from '../paraglide/runtime';
import { irpfRate, socialSecurityRate, type Step } from '../tax/marginal';
import { useElementWidth } from '../useElementWidth';
import { XTicks, YGrid } from './chartAxes';
import { seriesStyles } from './Legend';
import { useChartTooltip } from './useChartTooltip';

const HEIGHT = 260;
const MARGIN = { top: 12, right: 8, bottom: 32, left: 44 };
const GAP = 2;
/** Steps narrower than this (px) get no rate label. */
const MIN_LABEL_WIDTH = 34;
const Y_TICKS = [0, 0.25, 0.5, 0.75, 1];

export interface StaircaseProps {
  gross: number;
  steps: readonly Step[];
  locale: Locale;
}

/** For every euro of gross salary, from first to last: the share to Social Security, IRPF and net. */
export function Staircase({ gross, steps, locale }: StaircaseProps) {
  const [containerRef, width] = useElementWidth<HTMLElement>(640);
  const tip = useChartTooltip(
    steps.map((step) =>
      [
        m.tooltip_range({ from: formatEuros(step.from, locale), to: formatEuros(step.to, locale) }),
        m.tooltip_split({
          socialSecurity: formatEuros(socialSecurityRate(step) * 100, locale, { cents: true }),
          irpf: formatEuros(irpfRate(step) * 100, locale, { cents: true }),
          net: formatEuros((1 - socialSecurityRate(step) - irpfRate(step)) * 100, locale, {
            cents: true,
          }),
        }),
      ].join('\n'),
    ),
  );
  const active = tip.active;
  if (gross <= 0) return null;

  const plotWidth = Math.max(0, width - MARGIN.left - MARGIN.right);
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const x = (euros: number) => MARGIN.left + (euros / gross) * plotWidth;
  const y = (fraction: number) => MARGIN.top + (1 - fraction) * plotHeight;

  return (
    <figure ref={containerRef} aria-label={m.staircase_label()} {...stylex.props(styles.root)}>
      <svg width={width} height={HEIGHT} aria-label={m.staircase_label()}>
        <YGrid
          ticks={Y_TICKS}
          y={y}
          left={MARGIN.left}
          right={MARGIN.left + plotWidth}
          format={(tick) => formatPercent(tick, locale)}
        />
        <XTicks
          ticks={niceTicks(gross, width < 480 ? 3 : 5)}
          x={x}
          y={HEIGHT - 10}
          width={width}
          format={(tick) => formatEuros(tick, locale)}
        />

        {steps.map((step, index) => {
          const left = x(step.from) + (index === 0 ? 0 : GAP / 2);
          const stepWidth = Math.max(1, x(step.to) - x(step.from) - (index === 0 ? GAP / 2 : GAP));
          const social = socialSecurityRate(step);
          const irpf = Math.max(0, irpfRate(step));
          const dimmed = active !== null && active !== index;
          return (
            <g
              key={step.from}
              {...tip.target(index)}
              {...stylex.props(styles.step, dimmed && styles.dimmed)}
            >
              <rect
                x={left}
                width={stepWidth}
                y={y(1)}
                height={y(social + irpf) - y(1)}
                {...stylex.props(seriesStyles.net)}
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
      {tip.tooltip}
    </figure>
  );
}

const styles = stylex.create({
  root: { position: 'relative', width: '100%', margin: 0 },
  step: { transition: 'opacity 120ms' },
  dimmed: { opacity: 0.45 },
  rateLabel: {
    fontSize: 12,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    fill: colors.text,
  },
});
