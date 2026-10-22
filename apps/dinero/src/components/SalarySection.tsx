import { Disclosure, NumberField, SegmentedControl, Select } from '@explorables/ui';
import { colors, space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';

import { formatEuros, formatPercent, intlLocale } from '../format';
import { m } from '../paraglide/messages';
import type { Locale } from '../paraglide/runtime';
import { REGION_NAMES } from '../regionNames';
import { findHump, marginalRate, untaxedAmount } from '../salaryStory';
import { marginalSteps } from '../tax/marginal';
import { REGIONS, salaryBreakdown, taxSystem, type Region, type TaxSystem } from '../tax/regions';
import { grossFromInput, PAYMENTS, type PayBasis } from '../tax/salary';
import { DEFAULT_SITUATION, type Situation } from '../tax/situation';
import { JourneyBar } from './JourneyBar';
import { Legend } from './Legend';
import { SituationForm } from './SituationForm';
import { Staircase } from './Staircase';
import { StepsTable } from './StepsTable';

const DEFAULT_GROSS = 30_000;
const HUMP_CAUSE: Record<TaxSystem, () => string> = {
  common: m.hump_cause_common,
  basque: m.hump_cause_basque,
  navarra: m.hump_cause_navarra,
};
const MAX_AMOUNT = 1_000_000;
const STEP_BY_BASIS: Record<PayBasis, number> = { grossYear: 1000, net12: 50, net14: 50 };

/** Converts a gross yearly salary to the amount shown for `basis`. */
function amountFor(basis: PayBasis, net: number, gross: number): number {
  return basis === 'grossYear' ? gross : Math.round(net / PAYMENTS[basis]);
}

/** Section 1: the reader's salary, from gross to net, euro by euro. */
export function SalarySection({ locale }: { locale: Locale }) {
  const [amount, setAmount] = useState(DEFAULT_GROSS);
  const [basis, setBasis] = useState<PayBasis>('grossYear');
  const [region, setRegion] = useState<Region>('andalucia');
  const [situation, setSituation] = useState<Situation>(DEFAULT_SITUATION);

  const calculate = (gross: number) => salaryBreakdown(gross, region, situation);
  const system = taxSystem(region);
  const gross = grossFromInput(amount, basis, calculate);
  const breakdown = calculate(gross);
  const steps = marginalSteps(gross, calculate);
  const hump = findHump(steps);
  const untaxed = untaxedAmount(steps);
  const euros = (value: number) => formatEuros(value, locale);
  const percent = (value: number) => formatPercent(value, locale);
  const per100 = (part: number) =>
    formatEuros(gross > 0 ? (part / gross) * 100 : 0, locale, { cents: true });

  const bases = [
    { value: 'grossYear', label: m.pay_basis_gross_year() },
    { value: 'net12', label: m.pay_basis_net12() },
    { value: 'net14', label: m.pay_basis_net14() },
  ] as const satisfies readonly { value: PayBasis; label: string }[];
  const regions = REGIONS.map((value) => ({ value, label: REGION_NAMES[value]() })).toSorted(
    (a, b) => a.label.localeCompare(b.label, intlLocale(locale)),
  );

  return (
    <section {...stylex.props(styles.section)}>
      <h2 {...stylex.props(styles.heading)}>{m.salary_title()}</h2>
      <p>{m.salary_prompt()}</p>

      <div {...stylex.props(styles.controls)}>
        <NumberField
          label={m.salary_amount_label()}
          value={amount}
          onChange={setAmount}
          min={0}
          max={MAX_AMOUNT}
          step={STEP_BY_BASIS[basis]}
          format={{ style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }}
          locale={intlLocale(locale)}
          decrementLabel={m.decrease()}
          incrementLabel={m.increase()}
        />
        <Select label={m.region_label()} options={regions} value={region} onChange={setRegion} />
      </div>
      <SegmentedControl
        label={m.pay_basis_label()}
        options={bases}
        value={basis}
        onChange={(next) => {
          setAmount(amountFor(next, breakdown.net, Math.round(gross)));
          setBasis(next);
        }}
      />
      <p {...stylex.props(styles.muted)}>
        {m.salary_equivalents({
          gross: euros(gross),
          net12: euros(breakdown.net / 12),
          net14: euros(breakdown.net / 14),
        })}
      </p>

      <Disclosure title={m.advanced_title()}>
        <SituationForm situation={situation} system={system} onChange={setSituation} />
      </Disclosure>

      <h3 {...stylex.props(styles.subheading)}>{m.journey_title()}</h3>
      <p>
        {m.journey_lede({
          socialSecurity: per100(breakdown.socialSecurity),
          irpf: per100(breakdown.irpf),
          net: per100(breakdown.net),
        })}
      </p>
      <JourneyBar breakdown={breakdown} steps={steps} locale={locale} />
      <Legend />
      <p {...stylex.props(styles.muted)}>
        {m.journey_effective({
          irpf: euros(breakdown.irpf),
          rate: percent(gross > 0 ? breakdown.irpf / gross : 0),
        })}{' '}
        {m.journey_slices_hint()}
      </p>

      <h3 {...stylex.props(styles.subheading)}>{m.staircase_title()}</h3>
      <p>{m.staircase_lede()}</p>
      <Staircase gross={gross} steps={steps} locale={locale} />
      <Legend />
      {untaxed > 0 ? <p>{m.staircase_free({ amount: euros(untaxed) })}</p> : null}
      {gross > untaxed ? (
        <p>{m.staircase_marginal({ rate: percent(marginalRate(steps)) })}</p>
      ) : null}
      {hump === undefined ? null : (
        <p>
          {m.staircase_hump({
            from: euros(hump.from),
            to: euros(hump.to),
            rate: percent(hump.peakRate),
          })}{' '}
          {HUMP_CAUSE[system]()}
        </p>
      )}
      <Disclosure title={m.table_toggle()}>
        <StepsTable steps={steps} locale={locale} />
      </Disclosure>

      <h3 {...stylex.props(styles.subheading)}>{m.assumptions_title()}</h3>
      <ul {...stylex.props(styles.muted)}>
        <li>{m.assumption_individual()}</li>
        <li>{m.assumption_contract()}</li>
        <li>{m.assumption_final()}</li>
        <li>{m.assumption_deductions()}</li>
        <li>{m.assumption_children()}</li>
        <li>{m.assumption_year()}</li>
      </ul>
    </section>
  );
}

const styles = stylex.create({
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.md,
    fontSize: 18,
    lineHeight: 1.6,
  },
  heading: {
    fontSize: 28,
    marginBottom: 0,
  },
  subheading: {
    fontSize: 22,
    marginTop: space.lg,
    marginBottom: 0,
  },
  controls: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: space.md,
    alignItems: 'end',
  },
  muted: {
    fontSize: 15,
    color: colors.textMuted,
  },
});
