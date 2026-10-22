import type { SalaryBreakdown } from './irpf';

/**
 * A stretch of gross salary where each extra euro is split the same way. Amounts are
 * exact (differences of the full calculation); rates are those amounts over the width.
 */
export interface Step {
  from: number;
  to: number;
  socialSecurity: number;
  irpf: number;
}

const MAX_SAMPLES = 4000;
const MIN_SAMPLE_WIDTH = 25;
/** Rates within this distance (as a fraction) are treated as the same step. */
const RATE_TOLERANCE = 0.001;
/** Steps narrower than this share of the salary are folded into a neighbour. */
const MIN_STEP_SHARE = 0.005;

const rateOf = (amount: number, step: Step) => amount / (step.to - step.from);

function sameRates(a: Step, b: Step): boolean {
  return (
    Math.abs(rateOf(a.irpf, a) - rateOf(b.irpf, b)) < RATE_TOLERANCE &&
    Math.abs(rateOf(a.socialSecurity, a) - rateOf(b.socialSecurity, b)) < RATE_TOLERANCE
  );
}

function join(a: Step, b: Step): Step {
  return {
    from: a.from,
    to: b.to,
    socialSecurity: a.socialSecurity + b.socialSecurity,
    irpf: a.irpf + b.irpf,
  };
}

function mergeRuns(
  steps: readonly Step[],
  shouldJoin: (last: Step, next: Step) => boolean,
): Step[] {
  const merged: Step[] = [];
  for (const step of steps) {
    const last = merged.at(-1);
    if (last !== undefined && shouldJoin(last, step)) merged[merged.length - 1] = join(last, step);
    else merged.push(step);
  }
  return merged;
}

/**
 * Splits 0..gross into steps of constant marginal rates by sampling the calculation.
 * Amounts across all steps add up to the totals at `gross`.
 */
export function marginalSteps(
  gross: number,
  calculate: (gross: number) => SalaryBreakdown,
): Step[] {
  if (gross <= 0) return [];
  const samples = Math.max(1, Math.min(MAX_SAMPLES, Math.ceil(gross / MIN_SAMPLE_WIDTH)));
  const raw: Step[] = [];
  let previous = calculate(0);
  for (let index = 1; index <= samples; index += 1) {
    const at = (gross * index) / samples;
    const current = calculate(at);
    raw.push({
      from: previous.gross,
      to: at,
      socialSecurity: current.socialSecurity - previous.socialSecurity,
      irpf: current.irpf - previous.irpf,
    });
    previous = current;
  }

  const minWidth = gross * MIN_STEP_SHARE;
  // A sample that straddles a bracket edge gets an in-between rate; fold those slivers away.
  const withoutSlivers = mergeRuns(
    mergeRuns(raw, sameRates),
    (_, next) => next.to - next.from < minWidth,
  );
  const firstWide = withoutSlivers[0];
  const rest = withoutSlivers.slice(1);
  if (
    firstWide !== undefined &&
    firstWide.to - firstWide.from < minWidth &&
    rest[0] !== undefined
  ) {
    rest[0] = join(firstWide, rest[0]);
    return mergeRuns(rest, sameRates);
  }
  return mergeRuns(withoutSlivers, sameRates);
}

export function irpfRate(step: Step): number {
  return rateOf(step.irpf, step);
}

export function socialSecurityRate(step: Step): number {
  return rateOf(step.socialSecurity, step);
}
