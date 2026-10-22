import { combineScales, rateAt, applyScale, type Scale } from '../tax/scale';
import { regionalRules, state } from '../tax/rules2026';
import { basqueRules, navarraRules } from '../tax/foral2026';
import { isCommon, type Region } from '../tax/regions';
import { HISTORICAL_SCALES, toRealScale, type RealScale } from './scales';

/** The 2026 scale that applies in `region`: state plus regional, or the whole foral scale. */
export function scale2026(region: Region): Scale {
  if (isCommon(region)) return combineScales(state.scale, regionalRules(region).scale);
  return region === 'navarra' ? navarraRules.scale : basqueRules[region].scale;
}

/** Every year the time machine visits, oldest first, ending with today in `region`. */
export function timeline(region: Region): RealScale[] {
  return [...HISTORICAL_SCALES.map(toRealScale), { year: 2026, scale: scale2026(region) }];
}

/** Tax the scale alone charges on `base`, honouring the 1979 cap on the average rate. */
export function scaleTax({ scale, averageCap }: RealScale, base: number): number {
  const tax = applyScale(scale, base);
  return averageCap === undefined ? tax : Math.min(tax, averageCap * base);
}

/** Rate on the last euro of `base`, as a fraction; under the 1979 cap it's the cap itself. */
export function marginalAt(real: RealScale, base: number): number {
  const { averageCap } = real;
  if (averageCap !== undefined && applyScale(real.scale, base) >= averageCap * base) {
    return averageCap;
  }
  return rateAt(real.scale, base) / 100;
}

/** The top marginal rate of each year, as a fraction. */
export function topRate(real: RealScale): number {
  return (real.scale.at(-1)?.rate ?? 0) / 100;
}

/**
 * Marginal rate at evenly spaced bases from 0 to `max`, for drawing and tweening the
 * scale as a curve. Each point is the rate on the euro just above that base.
 */
export function rateCurve(real: RealScale, max: number, points: number): number[] {
  return Array.from({ length: points + 1 }, (_, index) =>
    marginalAt(real, (max * index) / points + 1e-6),
  );
}
