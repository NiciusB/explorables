import { NumberField } from '@explorables/ui';
import { colors, space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';

import { formatEuros, formatPercent, intlLocale } from '../format';
import { m } from '../paraglide/messages';
import type { Locale } from '../paraglide/runtime';
import type { Profile } from '../profile';
import { REGION_NAMES } from '../regionNames';
import type { Citation } from '../sources';
import { commonIrpf } from '../tax/irpf';
import { RENTAL_CITATIONS, RENTAL_EXAMPLE, rentalBreakdown } from '../tax/rental';
import { commonRegionFor } from '../tax/savings';
import { seriesStyles } from './Legend';
import { SourceNote } from './SourceNote';
import { prose } from './prose';
import { useChartTooltip } from './useChartTooltip';

const MINIMUM_WAGE = {
  monthly: 1221,
  payments: 14,
  citation: { source: 'smi2026', locator: 'arts. 1 y 3' } satisfies Citation,
};

/** Only the number of homes varies; the matching salary tracks gross rental receipts. */
export function CapitalExamples({ profile, locale }: { profile: Profile; locale: Locale }) {
  const [flats, setFlats] = useState(RENTAL_EXAMPLE.flats);
  const region = commonRegionFor(profile.region);
  const annualWage = MINIMUM_WAGE.monthly * MINIMUM_WAGE.payments;
  const minimumWage = commonIrpf(annualWage, region, profile.situation);
  const rental = rentalBreakdown(flats, region, profile.situation);
  const matchingWage = commonIrpf(rental.gross, region, profile.situation);
  const euros = (amount: number) => formatEuros(amount, locale);
  const ratio = new Intl.NumberFormat(intlLocale(locale), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(rental.gross / annualWage);
  const rentalCosts = [
    {
      key: 'repairs',
      label: m.capital_examples_repairs(),
      amount: RENTAL_EXAMPLE.expenses.repairs,
    },
    { key: 'ibi', label: m.capital_examples_ibi(), amount: RENTAL_EXAMPLE.expenses.ibi },
    {
      key: 'community',
      label: m.capital_examples_community(),
      amount: RENTAL_EXAMPLE.expenses.community,
    },
    {
      key: 'insurance',
      label: m.capital_examples_insurance(),
      amount: RENTAL_EXAMPLE.expenses.insurance,
    },
  ];
  const examples = [
    {
      key: 'worker',
      title: m.capital_examples_worker(),
      amount: annualWage,
      irpf: minimumWage.irpf,
      net: minimumWage.net,
      description: m.capital_examples_wage({ monthly: euros(MINIMUM_WAGE.monthly) }),
      costs: [
        {
          key: 'ss',
          label: m.legend_social_security(),
          amount: minimumWage.socialSecurity,
          tone: seriesStyles.socialSecurity,
        },
      ],
    },
    {
      key: 'landlord',
      title: m.capital_examples_landlord({ count: String(flats) }),
      amount: rental.gross,
      irpf: rental.irpf,
      net: rental.net,
      description: m.capital_examples_rent({ monthly: euros(RENTAL_EXAMPLE.monthlyRent) }),
      costs: rentalCosts.map((cost) => ({
        key: cost.key,
        label: cost.label,
        amount: cost.amount * flats,
        tone: styles.expense,
      })),
    },
    {
      key: 'matching',
      title: m.capital_examples_matching_worker(),
      amount: rental.gross,
      irpf: matchingWage.irpf,
      net: matchingWage.net,
      description: m.capital_examples_matching_wage({ amount: euros(rental.gross) }),
      costs: [
        {
          key: 'ss',
          label: m.legend_social_security(),
          amount: matchingWage.socialSecurity,
          tone: seriesStyles.socialSecurity,
        },
      ],
    },
  ];

  return (
    <div {...stylex.props(prose.root)}>
      <h3 {...stylex.props(prose.subheading)}>{m.capital_examples_title()}</h3>
      <p>{m.capital_examples_intro()}</p>
      <p {...stylex.props(prose.caption)}>
        {m.capital_examples_context({ region: REGION_NAMES[region]() })}
      </p>
      <NumberField
        label={m.capital_examples_flats_label()}
        value={flats}
        onChange={(value) => {
          setFlats(Math.round(value));
        }}
        min={1}
        max={20}
        step={1}
        locale={intlLocale(locale)}
        decrementLabel={m.decrease()}
        incrementLabel={m.increase()}
      />
      <div {...stylex.props(styles.cards)}>
        {examples.map((example) => (
          <article key={example.key} {...stylex.props(styles.card)}>
            <h4 {...stylex.props(styles.heading)}>{example.title}</h4>
            <strong {...stylex.props(styles.amount)}>{euros(example.amount)}</strong>
            <span {...stylex.props(prose.caption)}>{m.capital_examples_annual()}</span>
            <p {...stylex.props(styles.description)}>{example.description}</p>
            <IncomeSplit
              title={example.title}
              gross={example.amount}
              irpf={example.irpf}
              net={example.net}
              costs={example.costs}
              locale={locale}
            />
          </article>
        ))}
      </div>
      <p>{m.capital_examples_ratio({ ratio })}</p>
      <p {...stylex.props(prose.caption)}>
        {m.capital_examples_cost_assumptions({
          repairs: euros(RENTAL_EXAMPLE.expenses.repairs),
          ibi: euros(RENTAL_EXAMPLE.expenses.ibi),
          community: euros(RENTAL_EXAMPLE.expenses.community),
          insurance: euros(RENTAL_EXAMPLE.expenses.insurance),
        })}
      </p>
      <p {...stylex.props(prose.caption)}>
        {m.capital_examples_rental_tax({
          building: euros(RENTAL_EXAMPLE.buildingValue),
          depreciation: euros(rental.depreciation),
          base: euros(rental.taxableBase),
        })}
      </p>
      <SourceNote citations={[MINIMUM_WAGE.citation, ...RENTAL_CITATIONS]} />
    </div>
  );
}

interface IncomeSplitProps {
  title: string;
  gross: number;
  irpf: number;
  net: number;
  costs: readonly { key: string; label: string; amount: number; tone: stylex.StyleXStyles }[];
  locale: Locale;
}

/** Every bar is 100% of gross receipts; each segment has an exact, focusable readout. */
function IncomeSplit({ title, gross, irpf, net, costs, locale }: IncomeSplitProps) {
  const parts = [
    { key: 'irpf', label: m.legend_irpf(), amount: irpf, tone: seriesStyles.irpf },
    ...costs,
    { key: 'net', label: m.capital_examples_left(), amount: net, tone: seriesStyles.net },
  ];
  const share = (amount: number) => formatPercent(amount / gross, locale);
  const tip = useChartTooltip(
    parts.map(
      (part) =>
        `${title}\n${m.chart_income_segment({
          label: part.label,
          amount: formatEuros(part.amount, locale),
          share: share(part.amount),
        })}`,
    ),
  );
  return (
    <figure aria-label={m.capital_examples_split_label({ title })} {...stylex.props(styles.figure)}>
      <figcaption {...stylex.props(styles.taxRate)}>
        {m.capital_examples_irpf_share({ share: share(irpf) })}
      </figcaption>
      <div {...stylex.props(styles.bar)}>
        {parts.map((part, index) =>
          part.amount <= 0 ? null : (
            <span
              key={part.key}
              {...tip.target(index)}
              {...stylex.props(styles.segment, part.tone, styles.grow(part.amount / gross))}
            />
          ),
        )}
      </div>
      <dl {...stylex.props(styles.breakdown)}>
        {parts.map((part) => (
          <div key={part.key} {...stylex.props(styles.line, part.key === 'net' && styles.net)}>
            <dt {...stylex.props(styles.label)}>
              <span aria-hidden {...stylex.props(styles.swatch, part.tone)} />
              {part.label}
            </dt>
            <dd {...stylex.props(styles.value)}>{formatEuros(part.amount, locale)}</dd>
          </div>
        ))}
      </dl>
      {tip.tooltip}
    </figure>
  );
}

const styles = stylex.create({
  cards: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(3, minmax(0, 1fr))',
      '@media (max-width: 600px)': '1fr',
    },
    alignItems: 'stretch',
    gap: space.sm,
  },
  card: {
    display: 'grid',
    gridTemplateRows: 'subgrid',
    gridRow: 'span 5',
    alignItems: 'start',
    gap: space.sm,
    minWidth: 0,
    padding: space.md,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: 12,
  },
  heading: { margin: 0, fontSize: 17 },
  amount: { fontSize: 27, fontVariantNumeric: 'tabular-nums' },
  description: { margin: 0, fontSize: 14 },
  figure: { display: 'flex', flexDirection: 'column', gap: space.sm, margin: 0, minWidth: 0 },
  taxRate: { fontSize: 16, fontWeight: 700 },
  bar: { display: 'flex', height: 32, overflow: 'hidden', borderRadius: 4 },
  segment: {
    minWidth: 0,
    borderInlineEndWidth: 1,
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: colors.background,
  },
  grow: (share: number) => ({ flexGrow: share, flexBasis: 0 }),
  expense: { backgroundColor: colors.textMuted },
  breakdown: { display: 'flex', flexDirection: 'column', gap: space.xs, margin: 0, fontSize: 13 },
  line: { display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', columnGap: space.xs },
  label: { display: 'flex', alignItems: 'center', gap: space.xs },
  swatch: { width: 8, height: 8, flexShrink: 0, borderRadius: 2 },
  value: { margin: 0, fontVariantNumeric: 'tabular-nums' },
  net: { fontWeight: 700 },
});
