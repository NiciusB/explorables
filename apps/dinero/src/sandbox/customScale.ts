import { commonIrpf, minimumWageDeduction } from '../tax/irpf';
import { regionalRules, state, type CommonRegion } from '../tax/rules2026';
import { combineScales, quotaAfterMinimum, rateAt, type Scale } from '../tax/scale';
import { personalMinimum, type Situation } from '../tax/situation';

/** One row of a scale the reader designs: from this taxable base up, this rate (percent). */
export interface DesignedBracket {
  from: number;
  rate: number;
}

/** A whole IRPF scale designed by the reader, replacing the state and regional ones. */
export interface Design {
  brackets: readonly DesignedBracket[];
  /** Base taxed at 0%, like today's personal minimum. */
  exempt: number;
}

/** Turns the reader's rows into a valid scale: sorted, starting at 0, rates within 0–100. */
export function toScale(brackets: readonly DesignedBracket[]): Scale {
  const rows = [...brackets]
    .filter((row) => row.from >= 0)
    .toSorted((a, b) => a.from - b.from)
    .filter((row, index, sorted) => index === 0 || row.from !== sorted[index - 1]?.from);
  if (rows[0]?.from !== 0) rows.unshift({ from: 0, rate: 0 });
  let quota = 0;
  return rows.map((row, index) => {
    const previous = rows[index - 1];
    if (previous !== undefined)
      quota += ((row.from - previous.from) * clampRate(previous.rate)) / 100;
    return { from: row.from, quota, rate: clampRate(row.rate) };
  });
}

const clampRate = (rate: number) => Math.min(100, Math.max(0, rate));

/**
 * Today's scale for `region` as editable rows. Bake each half's own allowance into
 * zero-rate brackets before combining them, so regional minimums remain exact.
 */
export function currentDesign(region: CommonRegion, situation: Situation): Design {
  const regional = regionalRules(region);
  return {
    brackets: combineScales(
      afterMinimum(state.scale, personalMinimum(state.minimums, situation)),
      afterMinimum(regional.scale, personalMinimum(regional.minimums, situation)),
    ).map((bracket) => ({
      from: bracket.from,
      rate: bracket.rate,
    })),
    exempt: 0,
  };
}

/** Equivalent tariff with its personal allowance already represented by a 0% bracket. */
function afterMinimum(scale: Scale, minimum: number): Scale {
  const edges = [...new Set([0, minimum, ...scale.map((row) => row.from)])].toSorted(
    (a, b) => a - b,
  );
  return edges.map((from) => ({
    from,
    quota: quotaAfterMinimum(scale, from, minimum),
    rate: from < minimum ? 0 : rateAt(scale, from + 1e-9),
  }));
}

/** Example designs to start from. None of them is any party's proposal. */
export const PRESETS = {
  flat: { brackets: [{ from: 0, rate: 20 }], exempt: 12_000 },
  steep: {
    brackets: [
      { from: 0, rate: 15 },
      { from: 20_000, rate: 25 },
      { from: 40_000, rate: 40 },
      { from: 80_000, rate: 50 },
      { from: 150_000, rate: 60 },
    ],
    exempt: 12_000,
  },
} as const satisfies Record<string, Design>;

/**
 * IRPF on a salary under the reader's design. Everything before the scale stays as it is
 * (Social Security, work reductions), and so does the minimum-wage deduction.
 */
export function designedIrpf(
  gross: number,
  design: Design,
  region: CommonRegion,
  situation: Situation,
): number {
  const { taxableBase } = commonIrpf(gross, region, situation);
  const quota = quotaAfterMinimum(toScale(design.brackets), taxableBase, design.exempt);
  return Math.max(0, quota - Math.min(minimumWageDeduction(gross), quota));
}

/** Marginal rate of the design on `gross`'s taxable base, as a fraction. */
export function designedMarginal(
  gross: number,
  design: Design,
  region: CommonRegion,
  situation: Situation,
): number {
  const { taxableBase } = commonIrpf(gross, region, situation);
  return taxableBase <= design.exempt ? 0 : rateAt(toScale(design.brackets), taxableBase) / 100;
}

/** Illustrative gross annual salaries, not sampled population groups or taxable bases. */
const EXAMPLE_SALARIES = [
  5000, 15_000, 20_000, 25_000, 35_000, 50_000, 75_000, 100_000, 150_000, 200_000,
];

/** Change in yearly take-home pay for each gross salary, today's IRPF versus the design. */
export function salaryChanges(
  design: Design,
  region: CommonRegion,
  situation: Situation,
): { gross: number; change: number }[] {
  return EXAMPLE_SALARIES.map((gross) => ({
    gross,
    change:
      commonIrpf(gross, region, situation).irpf - designedIrpf(gross, design, region, situation),
  }));
}
