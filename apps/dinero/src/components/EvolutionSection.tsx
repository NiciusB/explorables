import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';

import { formatEuros, formatNumber, formatPercent } from '../format';
import {
  FIRST_SALARY_YEAR,
  GINI,
  GINI_FIRST_YEAR,
  LATEST_SALARY_YEAR,
  GINI_CITATION,
  SALARY_DECILES_CITATION,
  TOP_SHARES,
  TOP_SHARES_CITATION,
} from '../inequality/data';
import { CPI_CITATION } from '../prices';
import {
  communityOf,
  decileOf,
  realDecileSalaries,
  salaryPercentile,
} from '../inequality/position';
import { m } from '../paraglide/messages';
import type { Locale } from '../paraglide/runtime';
import type { Profile } from '../profile';
import { communityName } from '../regionNames';
import { DecileBars } from './DecileBars';
import { LineChart } from './LineChart';
import { SourceNote } from './SourceNote';
import { Stat, StatRow } from './Stat';
import { YearSlider } from './YearSlider';
import { prose } from './prose';

const pick = (values: readonly number[], index: number) => values[index] ?? 0;

const giniPoints = (values: readonly number[]) =>
  values.map((value, index) => ({ x: GINI_FIRST_YEAR + index, value }));

export interface EvolutionSectionProps {
  profile: Profile;
  locale: Locale;
}

/** Chapter 4: how pay and inequality have moved, in today's euros. */
export function EvolutionSection({ profile, locale }: EvolutionSectionProps) {
  const [year, setYear] = useState(FIRST_SALARY_YEAR);
  const first = realDecileSalaries(FIRST_SALARY_YEAR);
  const shown = realDecileSalaries(year);
  const latest = realDecileSalaries(LATEST_SALARY_YEAR);
  const decile = decileOf(salaryPercentile(profile.gross, LATEST_SALARY_YEAR));
  const max = Math.max(...first, ...latest) * 1.05;
  const euros = (value: number) => formatEuros(value, locale);
  const change = (from: number, to: number) => formatPercent(to / from - 1, locale);
  const community = communityOf(profile.region);

  return (
    <div {...stylex.props(prose.root)}>
      <p>{m.evolution_intro()}</p>
      <h3 {...stylex.props(prose.subheading)}>{m.evolution_parade_title()}</h3>
      <p>{m.evolution_parade_lede({ from: String(FIRST_SALARY_YEAR) })}</p>
      <YearSlider
        label={m.evolution_year_label()}
        from={FIRST_SALARY_YEAR}
        to={LATEST_SALARY_YEAR}
        value={year}
        onChange={setYear}
      />
      <DecileBars
        values={shown}
        ghosts={first}
        max={max}
        highlight={decile}
        label={m.evolution_parade_label()}
      />
      <p {...stylex.props(prose.caption)}>
        {m.evolution_parade_axis({ from: String(FIRST_SALARY_YEAR) })}
      </p>
      <StatRow>
        <Stat
          label={
            profile.personal
              ? m.evolution_stat_yours({ decile: String(decile) })
              : m.evolution_stat_example({ decile: String(decile) })
          }
          value={euros(pick(shown, decile - 1))}
          note={m.evolution_since({
            change: change(pick(first, decile - 1), pick(shown, decile - 1)),
            from: String(FIRST_SALARY_YEAR),
          })}
        />
        <Stat
          label={m.evolution_stat_bottom()}
          value={euros(pick(shown, 0))}
          note={m.evolution_since({
            change: change(pick(first, 0), pick(shown, 0)),
            from: String(FIRST_SALARY_YEAR),
          })}
        />
        <Stat
          label={m.evolution_stat_top()}
          value={euros(pick(shown, 9))}
          note={m.evolution_since({
            change: change(pick(first, 9), pick(shown, 9)),
            from: String(FIRST_SALARY_YEAR),
          })}
        />
      </StatRow>
      <p>{m.evolution_parade_reflect()}</p>
      <SourceNote citations={[SALARY_DECILES_CITATION, CPI_CITATION]} />

      <h3 {...stylex.props(prose.subheading)}>{m.evolution_gini_title()}</h3>
      <p>{m.evolution_gini_lede()}</p>
      <LineChart
        series={[
          { key: 'spain', label: m.spain(), points: giniPoints(GINI.spain), tone: 'primary' },
          {
            key: community,
            label: communityName(community),
            points: giniPoints(GINI[community]),
            tone: 'you',
          },
        ]}
        yMin={24}
        yMax={38}
        yTicks={[24, 28, 32, 36]}
        format={(value) => formatNumber(value, locale)}
        label={m.evolution_gini_label()}
      />
      <p {...stylex.props(prose.caption)}>{m.evolution_gini_caption()}</p>
      <SourceNote citations={[GINI_CITATION]} />

      <h3 {...stylex.props(prose.subheading)}>{m.evolution_top_title()}</h3>
      <p>{m.evolution_top_lede()}</p>
      <LineChart
        series={[
          {
            key: 'top10',
            label: m.evolution_top10(),
            points: TOP_SHARES.map((point) => ({ x: point.year, value: point.top10 })),
            tone: 'primary',
          },
          {
            key: 'top1',
            label: m.evolution_top1(),
            points: TOP_SHARES.map((point) => ({ x: point.year, value: point.top1 })),
            tone: 'secondary',
          },
        ]}
        yMin={0}
        yMax={40}
        yTicks={[0, 10, 20, 30, 40]}
        format={(value) => formatPercent(value / 100, locale)}
        label={m.evolution_top_label()}
      />
      <p>{m.evolution_top_reflect()}</p>
      <SourceNote citations={[TOP_SHARES_CITATION]} />
    </div>
  );
}
