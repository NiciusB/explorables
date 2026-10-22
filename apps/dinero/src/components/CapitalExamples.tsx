import { NumberField } from '@explorables/ui';
import { colors, space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';

import { formatEuros, intlLocale } from '../format';
import { m } from '../paraglide/messages';
import type { Locale } from '../paraglide/runtime';
import type { Citation } from '../sources';
import { SourceNote } from './SourceNote';
import { prose } from './prose';

const MINIMUM_WAGE = {
  monthly: 1221,
  payments: 14,
  citation: { source: 'smi2026', locator: 'arts. 1 y 3' } satisfies Citation,
};
const RENT_CITATION: Citation = { source: 'lirpf', locator: 'arts. 22, 23, 45 y 46' };

/** Concrete gross-income examples; rent is deliberately separate from the savings comparison. */
export function CapitalExamples({ locale }: { locale: Locale }) {
  // A hypothetical asking rent, not a statistic about Spain's housing market.
  const [monthlyRent, setMonthlyRent] = useState(800);
  const annualWage = MINIMUM_WAGE.monthly * MINIMUM_WAGE.payments;
  const annualRent = monthlyRent * 3 * 12;
  const euros = (amount: number) => formatEuros(amount, locale);
  const ratio = new Intl.NumberFormat(intlLocale(locale), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(annualRent / annualWage);

  return (
    <div {...stylex.props(prose.root)}>
      <h3 {...stylex.props(prose.subheading)}>{m.capital_examples_title()}</h3>
      <p>{m.capital_examples_intro()}</p>
      <div {...stylex.props(styles.cards)}>
        <article {...stylex.props(styles.card)}>
          <h4 {...stylex.props(styles.heading)}>{m.capital_examples_worker()}</h4>
          <strong {...stylex.props(styles.amount)}>{euros(annualWage)}</strong>
          <span {...stylex.props(prose.caption)}>{m.capital_examples_annual()}</span>
          <p>{m.capital_examples_wage({ monthly: euros(MINIMUM_WAGE.monthly) })}</p>
        </article>
        <article {...stylex.props(styles.card)}>
          <h4 {...stylex.props(styles.heading)}>{m.capital_examples_landlord()}</h4>
          <strong {...stylex.props(styles.amount)}>{euros(annualRent)}</strong>
          <span {...stylex.props(prose.caption)}>{m.capital_examples_annual()}</span>
          <p>{m.capital_examples_rent({ monthly: euros(monthlyRent) })}</p>
        </article>
        <article {...stylex.props(styles.card)}>
          <h4 {...stylex.props(styles.heading)}>{m.capital_examples_investor()}</h4>
          <strong {...stylex.props(styles.amount)}>{euros(annualRent)}</strong>
          <span {...stylex.props(prose.caption)}>{m.capital_examples_annual()}</span>
          <p>{m.capital_examples_dividends()}</p>
        </article>
      </div>
      <NumberField
        label={m.capital_examples_rent_label()}
        value={monthlyRent}
        onChange={setMonthlyRent}
        min={0}
        max={10_000}
        step={50}
        format={{ style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }}
        locale={intlLocale(locale)}
        decrementLabel={m.decrease()}
        incrementLabel={m.increase()}
      />
      <p>{m.capital_examples_ratio({ ratio })}</p>
      <p {...stylex.props(prose.caption)}>{m.capital_examples_rental_tax()}</p>
      <SourceNote citations={[MINIMUM_WAGE.citation, RENT_CITATION]} />
    </div>
  );
}

const styles = stylex.create({
  cards: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(3, minmax(0, 1fr))',
      '@media (max-width: 600px)': '1fr',
    },
    gap: space.sm,
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.sm,
    padding: space.md,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: 12,
  },
  heading: { margin: 0, fontSize: 17 },
  amount: { fontSize: 27, fontVariantNumeric: 'tabular-nums' },
});
