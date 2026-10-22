import { basqueIrpf, navarraIrpf } from './foral';
import { BASQUE_TERRITORIES, type BasqueTerritory } from './foral2026';
import { commonIrpf, type SalaryBreakdown } from './irpf';
import { COMMON_REGIONS, type CommonRegion } from './rules2026';
import type { Situation } from './situation';

/** Every place with its own IRPF: 15 common-regime communities and the four foral systems. */
export const REGIONS = [...COMMON_REGIONS, ...BASQUE_TERRITORIES, 'navarra'] as const;
export type Region = (typeof REGIONS)[number];

export type TaxSystem = 'common' | 'basque' | 'navarra';

export const isCommon = (region: Region): region is CommonRegion =>
  (COMMON_REGIONS as readonly string[]).includes(region);

const isBasque = (region: Region): region is BasqueTerritory =>
  (BASQUE_TERRITORIES as readonly string[]).includes(region);

export function taxSystem(region: Region): TaxSystem {
  if (isCommon(region)) return 'common';
  return isBasque(region) ? 'basque' : 'navarra';
}

/** Gross to net for an employee in `region`, under that region's tax system. */
export function salaryBreakdown(
  gross: number,
  region: Region,
  situation: Situation,
): SalaryBreakdown {
  if (isCommon(region)) return commonIrpf(gross, region, situation);
  if (isBasque(region)) return basqueIrpf(gross, region, situation);
  return navarraIrpf(gross, situation);
}
