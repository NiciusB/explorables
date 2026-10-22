import { irpfRate, type Step } from './tax/marginal';

/** A stretch of salary taxed noticeably harder than the salary's last euros. */
export interface Hump {
  from: number;
  to: number;
  peakRate: number;
}

/** How far above the marginal rate a step must be to count as part of a hump. */
const HUMP_MARGIN = 0.1;
/** IRPF rates below this count as untaxed. */
const UNTAXED = 0.001;

/** The salary covered by the opening untaxed step, or 0 if the first euros already pay IRPF. */
export function untaxedAmount(steps: readonly Step[]): number {
  const first = steps[0];
  return first !== undefined && irpfRate(first) < UNTAXED ? first.to : 0;
}

/** IRPF rate on the salary's last euros. */
export function marginalRate(steps: readonly Step[]): number {
  const last = steps.at(-1);
  return last === undefined ? 0 : irpfRate(last);
}

/** The contiguous run of steps around the highest rate, if it clearly exceeds the marginal rate. */
export function findHump(steps: readonly Step[]): Hump | undefined {
  const threshold = marginalRate(steps) + HUMP_MARGIN;
  let peak = -1;
  for (const [index, step] of steps.entries()) {
    const best = steps[peak];
    if (irpfRate(step) > threshold && (best === undefined || irpfRate(step) > irpfRate(best)))
      peak = index;
  }
  const peakStep = steps[peak];
  if (peakStep === undefined) return undefined;

  let first = peak;
  let last = peak;
  const inHump = (index: number) => {
    const step = steps[index];
    return step !== undefined && irpfRate(step) > threshold;
  };
  while (inHump(first - 1)) first -= 1;
  while (inHump(last + 1)) last += 1;
  return {
    from: steps[first]?.from ?? peakStep.from,
    to: steps[last]?.to ?? peakStep.to,
    peakRate: irpfRate(peakStep),
  };
}
