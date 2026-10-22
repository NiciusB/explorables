/**
 * One row of a progressive tax scale, transcribed as published: the base where the
 * row starts, the cumulative tax ("cuota íntegra") at that point, and the rate in percent.
 */
export interface Bracket {
  from: number;
  quota: number;
  rate: number;
}

export type Scale = readonly Bracket[];

/** Tax owed on `base` under `scale`. Uses `from` and `rate`; `quota` is only a published cross-check. */
export function applyScale(scale: Scale, base: number): number {
  let tax = 0;
  for (const [index, bracket] of scale.entries()) {
    if (base <= bracket.from) break;
    const upper = scale[index + 1]?.from ?? Number.POSITIVE_INFINITY;
    tax += ((Math.min(base, upper) - bracket.from) * bracket.rate) / 100;
  }
  return tax;
}

/** The rate, in percent, on the last euro of `base`. */
export function rateAt(scale: Scale, base: number): number {
  let rate = 0;
  for (const bracket of scale) {
    if (base > bracket.from || bracket.from === 0) rate = bracket.rate;
  }
  return rate;
}

/**
 * The single scale that taxes like several applied to the same base (e.g. state plus
 * regional). Quotas are derived, not published, so they're exact by construction.
 */
export function combineScales(...scales: readonly Scale[]): Scale {
  const edges = [...new Set(scales.flatMap((scale) => scale.map((bracket) => bracket.from)))];
  return edges
    .toSorted((a, b) => a - b)
    .map((from) => ({
      from,
      quota: scales.reduce((sum, scale) => sum + applyScale(scale, from), 0),
      rate: scales.reduce((sum, scale) => sum + rateAt(scale, from + 1e-9), 0),
    }));
}

/** Multiplies every amount of a scale by `factor`, e.g. to convert currencies. */
export function rescale(scale: Scale, factor: number): Scale {
  return scale.map((bracket) => ({
    from: bracket.from * factor,
    quota: bracket.quota * factor,
    rate: bracket.rate,
  }));
}

/**
 * IRPF's way of exempting the personal and family minimum: tax the whole base, then
 * subtract the same scale applied to the part of the base covered by the minimum.
 */
export function quotaAfterMinimum(scale: Scale, base: number, minimum: number): number {
  return applyScale(scale, base) - applyScale(scale, Math.min(base, minimum));
}
