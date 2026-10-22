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

/**
 * IRPF's way of exempting the personal and family minimum: tax the whole base, then
 * subtract the same scale applied to the part of the base covered by the minimum.
 */
export function quotaAfterMinimum(scale: Scale, base: number, minimum: number): number {
  return applyScale(scale, base) - applyScale(scale, Math.min(base, minimum));
}
