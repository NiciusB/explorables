import { NumberField } from '@explorables/ui';
import { space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';

import { formatEuros, formatNumber, intlLocale } from '../format';
import {
  GINI,
  GINI_CITATION,
  INCOME_DECILES_CITATION,
  INCOME_SURVEY_YEAR,
  LATEST_SALARY_YEAR,
  SALARY_DECILES,
  SALARY_DECILES_CITATION,
  WEALTH_CITATION,
} from '../inequality/data';
import {
  communityOf,
  consumptionUnits,
  decileOf,
  householdPercentile,
  salaryPercentile,
} from '../inequality/position';
import { m } from '../paraglide/messages';
import type { Locale } from '../paraglide/runtime';
import type { Profile } from '../profile';
import { DecileBars } from './DecileBars';
import { GiniRanking } from './GiniRanking';
import { PercentileRuler } from './PercentileRuler';
import { SourceNote } from './SourceNote';
import { Stat, StatRow } from './Stat';
import { WealthMorph } from './WealthMorph';
import { prose } from './prose';

const MAX_ADULTS = 6;
const MAX_INCOME = 500_000;

export interface InequalitySectionProps {
  profile: Profile;
  locale: Locale;
}

/** Chapter 3: where the reader stands among wage earners, households and wealth. */
export function InequalitySection({ profile, locale }: InequalitySectionProps) {
  const euros = (value: number) => formatEuros(value, locale);
  const latest = SALARY_DECILES[LATEST_SALARY_YEAR];
  if (latest === undefined) return null;
  const yearly = latest.mean.map((monthly) => monthly * 12);
  const percentile = salaryPercentile(profile.gross, LATEST_SALARY_YEAR);
  const decile = decileOf(percentile);
  const median = (latest.lower[4] ?? 0) * 12;
  const who = profile.personal ? m.you() : m.example_person();

  return (
    <div {...stylex.props(prose.root)}>
      <p>{m.inequality_intro()}</p>
      <h3 {...stylex.props(prose.subheading)}>{m.parade_title()}</h3>
      <p>{m.parade_lede({ year: String(LATEST_SALARY_YEAR) })}</p>
      <DecileBars
        values={yearly}
        max={Math.max(...yearly, profile.gross) * 1.05}
        highlight={decile}
        you={{ value: profile.gross, label: who }}
        label={m.parade_label()}
      />
      <p {...stylex.props(prose.caption)}>{m.parade_axis()}</p>
      <PercentileRuler percentile={percentile} pin={who} label={m.ruler_label()} />
      <p>
        {percentile >= 90
          ? m.parade_you_top({ gross: euros(profile.gross) })
          : m.parade_you({
              gross: euros(profile.gross),
              percent: String(Math.round(percentile)),
            })}{' '}
        {m.parade_median({ median: euros(median), top: euros((latest.lower[8] ?? 0) * 12) })}
      </p>
      <p>
        {m.parade_gap({
          bottom: euros(yearly[0] ?? 0),
          top: euros(yearly[9] ?? 0),
          times: String(Math.round((yearly[9] ?? 0) / (yearly[0] ?? 1))),
        })}
      </p>

      <SourceNote citations={[SALARY_DECILES_CITATION]} />

      <Household profile={profile} locale={locale} />

      <h3 {...stylex.props(prose.subheading)}>{m.wealth_title()}</h3>
      <p>{m.wealth_lede()}</p>
      <WealthMorph locale={locale} />
      <p>{m.wealth_reflect()}</p>
      <SourceNote citations={[WEALTH_CITATION]} />

      <h3 {...stylex.props(prose.subheading)}>{m.gini_title()}</h3>
      <p>{m.gini_lede()}</p>
      <GiniRanking highlight={communityOf(profile.region)} locale={locale} />
      <SourceNote citations={[GINI_CITATION]} />
      <p>
        {m.gini_yours({
          spain: formatGini(GINI.spain.at(-1), locale),
          yours: formatGini(GINI[communityOf(profile.region)].at(-1), locale),
          year: String(INCOME_SURVEY_YEAR),
        })}
      </p>
    </div>
  );
}

function formatGini(value: number | undefined, locale: Locale): string {
  return formatNumber(value ?? 0, locale);
}

/** Households pool their incomes: the reader picks who they live with. */
function Household({ profile, locale }: InequalitySectionProps) {
  const [adults, setAdults] = useState(1);
  const [otherIncome, setOtherIncome] = useState(0);
  const children = profile.situation.children;
  const income = profile.net + otherIncome;
  const percentile = householdPercentile(income, adults, children);
  const euros = (value: number) => formatEuros(value, locale);
  return (
    <>
      <h3 {...stylex.props(prose.subheading)}>{m.household_title()}</h3>
      <p>{m.household_lede({ year: String(INCOME_SURVEY_YEAR - 1) })}</p>
      <div {...stylex.props(styles.controls)}>
        <NumberField
          label={m.household_adults()}
          value={adults}
          onChange={setAdults}
          min={1}
          max={MAX_ADULTS}
          decrementLabel={m.decrease()}
          incrementLabel={m.increase()}
        />
        <NumberField
          label={m.household_other_income()}
          value={otherIncome}
          onChange={setOtherIncome}
          min={0}
          max={MAX_INCOME}
          step={1000}
          format={{ style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }}
          locale={intlLocale(locale)}
          decrementLabel={m.decrease()}
          incrementLabel={m.increase()}
        />
      </div>
      <StatRow>
        <Stat label={m.household_income()} value={euros(income)} />
        <Stat
          label={m.household_per_unit()}
          value={euros(income / consumptionUnits(adults, children))}
        />
        <Stat label={m.household_decile()} value={String(decileOf(percentile))} />
      </StatRow>
      <PercentileRuler
        percentile={percentile}
        pin={m.household_pin()}
        label={m.household_ruler_label()}
      />
      <p {...stylex.props(prose.caption)}>{m.household_note({ children: String(children) })}</p>
      <SourceNote citations={[INCOME_DECILES_CITATION]} />
    </>
  );
}

const styles = stylex.create({
  controls: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: space.md,
    alignItems: 'end',
  },
});
