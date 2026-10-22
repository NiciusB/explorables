import { NumberField } from '@explorables/ui';
import { colors, space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';

import { formatEuros, formatPercent, intlLocale } from '../format';
import { m } from '../paraglide/messages';
import type { Locale } from '../paraglide/runtime';
import type { Profile } from '../profile';
import { state } from '../tax/rules2026';
import { commonRegionFor, compareSameAmount, nextEuros, SAVINGS_CITATION } from '../tax/savings';
import { useTween } from '../useTween';
import { CapitalExamples } from './CapitalExamples';
import { seriesStyles } from './Legend';
import { LineChart } from './LineChart';
import { ForalNote } from './ForalNote';
import { SourceNote } from './SourceNote';
import { Stat, StatRow } from './Stat';
import { prose } from './prose';
import { useChartTooltip } from './useChartTooltip';

const CHART_MAX = 250_000;
const CHART_STEP = 2500;
const EXTRA = 1000;
const MAX_AMOUNT = 1_000_000;

export interface CapitalSectionProps {
  profile: Profile;
  locale: Locale;
}

/** Chapter 5: the same euros, earned by working or by owning. */
export function CapitalSection({ profile, locale }: CapitalSectionProps) {
  const [custom, setCustom] = useState<number | null>(null);
  const amount = custom ?? Math.round(profile.gross);
  const region = commonRegionFor(profile.region);
  const same = compareSameAmount(amount, region, profile.situation);
  const next = nextEuros(profile.gross, EXTRA, region, profile.situation);
  const euros = (value: number) => formatEuros(value, locale);
  const rate = (tax: number, base: number) => formatPercent(base > 0 ? tax / base : 0, locale);
  const samples = Array.from(
    { length: CHART_MAX / CHART_STEP + 1 },
    (_, index) => index * CHART_STEP,
  );
  const curves = samples.map((value) => compareSameAmount(value, region, profile.situation));

  return (
    <div {...stylex.props(prose.root)}>
      <p>{m.capital_intro()}</p>
      <ForalNote region={profile.region} />
      <CapitalExamples profile={profile} locale={locale} />
      <div {...stylex.props(styles.controls)}>
        <NumberField
          label={m.capital_amount_label()}
          value={amount}
          onChange={setCustom}
          min={0}
          max={MAX_AMOUNT}
          step={1000}
          format={{ style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }}
          locale={intlLocale(locale)}
          decrementLabel={m.decrease()}
          incrementLabel={m.increase()}
        />
        {custom === null ? null : (
          <button
            type="button"
            onClick={() => {
              setCustom(null);
            }}
            {...stylex.props(styles.reset)}
          >
            {m.capital_reset()}
          </button>
        )}
      </div>

      <Lane
        title={m.capital_lane_salary()}
        parts={[
          { key: 'ss', amount: same.socialSecurity, series: seriesStyles.socialSecurity },
          { key: 'irpf', amount: same.salaryIrpf, series: seriesStyles.irpf },
          { key: 'net', amount: amount - same.salaryTax, series: seriesStyles.net },
        ]}
        total={amount}
        locale={locale}
      />
      <Lane
        title={m.capital_lane_savings()}
        parts={[
          { key: 'ss', amount: 0, series: seriesStyles.socialSecurity },
          { key: 'irpf', amount: same.savingsTax, series: seriesStyles.irpf },
          { key: 'net', amount: amount - same.savingsTax, series: seriesStyles.net },
        ]}
        total={amount}
        locale={locale}
      />
      <StatRow>
        <Stat
          label={m.capital_stat_salary()}
          value={euros(same.salaryTax)}
          note={rate(same.salaryTax, amount)}
        />
        <Stat
          label={m.capital_stat_savings()}
          value={euros(same.savingsTax)}
          note={rate(same.savingsTax, amount)}
        />
        <Stat
          label={m.capital_stat_gap()}
          value={euros(Math.abs(same.salaryTax - same.savingsTax))}
          note={
            same.salaryTax >= same.savingsTax
              ? m.capital_gap_salary_more()
              : m.capital_gap_savings_more()
          }
        />
      </StatRow>
      <p>{m.capital_reflect()}</p>

      <h3 {...stylex.props(prose.subheading)}>{m.capital_curve_title()}</h3>
      <LineChart
        series={[
          {
            key: 'salary',
            label: m.capital_lane_salary(),
            points: curves.map((point) => ({
              x: point.amount,
              value: point.amount > 0 ? point.salaryTax / point.amount : 0,
            })),
            tone: 'primary',
          },
          {
            key: 'savings',
            label: m.capital_lane_savings(),
            points: curves.map((point) => ({
              x: point.amount,
              value: point.amount > 0 ? point.savingsTax / point.amount : 0,
            })),
            tone: 'secondary',
          },
        ]}
        yMin={0}
        yMax={0.5}
        yTicks={[0, 0.1, 0.2, 0.3, 0.4, 0.5]}
        format={(value) => formatPercent(value, locale)}
        formatX={(value) => euros(value)}
        rest={Math.min(CHART_MAX, Math.round(amount / CHART_STEP) * CHART_STEP)}
        label={m.capital_curve_label()}
      />
      <p>{m.capital_curve_reflect()}</p>
      <SourceNote citations={[state.scaleCitation, SAVINGS_CITATION]} />

      <h3 {...stylex.props(prose.subheading)}>{m.capital_next_title({ extra: euros(EXTRA) })}</h3>
      <p>
        {m.capital_next({
          gross: euros(profile.gross),
          extra: euros(EXTRA),
          salary: euros(EXTRA - next.asSalary),
          savings: euros(EXTRA - next.asSavings),
        })}
      </p>
      <ul {...stylex.props(prose.caption)}>
        <li>{m.capital_caveat_employer()}</li>
        <li>{m.capital_caveat_benefits()}</li>
        <li>{m.capital_caveat_corporate()}</li>
      </ul>
    </div>
  );
}

interface LaneProps {
  title: string;
  parts: readonly { key: string; amount: number; series: stylex.StyleXStyles }[];
  total: number;
  locale: Locale;
}

/** One way of earning the money, as a bar split into who gets what. */
function Lane({ title, parts, total, locale }: LaneProps) {
  const labels: Record<string, string> = {
    ss: m.legend_social_security(),
    irpf: m.legend_irpf(),
    net: m.legend_net(),
  };
  const tip = useChartTooltip(
    parts.map(
      (part) =>
        `${title}\n${m.chart_income_segment({
          label: labels[part.key] ?? part.key,
          amount: formatEuros(part.amount, locale),
          share: formatPercent(total > 0 ? part.amount / total : 0, locale),
        })}`,
    ),
  );
  const shares = useTween(parts.map((part) => (total > 0 ? Math.max(0, part.amount) / total : 0)));
  return (
    <div {...stylex.props(styles.lane)}>
      <span {...stylex.props(styles.laneTitle)}>{title}</span>
      <div {...stylex.props(styles.bar)}>
        {parts.map((part, index) =>
          part.amount <= 0 ? null : (
            <span
              key={part.key}
              {...tip.target(index)}
              {...stylex.props(styles.segment, part.series, styles.grow(shares[index] ?? 0))}
            >
              {(shares[index] ?? 0) > 0.08 ? formatPercent(shares[index] ?? 0, locale) : null}
            </span>
          ),
        )}
      </div>
      {tip.tooltip}
    </div>
  );
}

const styles = stylex.create({
  controls: { display: 'flex', flexWrap: 'wrap', alignItems: 'end', gap: space.md },
  reset: {
    appearance: 'none',
    paddingBlock: space.sm,
    borderWidth: 0,
    fontSize: 14,
    color: colors.accent,
    backgroundColor: 'transparent',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  lane: { display: 'flex', flexDirection: 'column', gap: space.xs },
  laneTitle: { fontSize: 15, fontWeight: 600 },
  bar: { display: 'flex', gap: 2, height: 40 },
  segment: {
    display: 'grid',
    placeItems: 'center',
    minWidth: 0,
    overflow: 'hidden',
    borderRadius: 4,
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: colors.text,
  },
  grow: (share: number) => ({ flexGrow: share, flexBasis: 0 }),
});
