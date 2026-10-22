import type { Citation } from '../sources';
import type { Scale } from './scale';

/**
 * 2026 rules for the foral systems: the three Basque territories and Navarra. They set their
 * own IRPF entirely; only Social Security is shared with the rest of Spain.
 */

export const BASQUE_TERRITORIES = ['alava', 'bizkaia', 'gipuzkoa'] as const;
export type BasqueTerritory = (typeof BASQUE_TERRITORIES)[number];

/** Scale shared by the three territories for 2026 (art. 75.1 of each IRPF Norma Foral). */
const basqueScale: Scale = [
  { from: 0, quota: 0, rate: 23 },
  { from: 18080, quota: 4158.4, rate: 28 },
  { from: 36160, quota: 9220.8, rate: 35 },
  { from: 54240, quota: 15548.8, rate: 40 },
  { from: 77450, quota: 24832.8, rate: 45 },
  { from: 107260, quota: 38247.3, rate: 46 },
  { from: 142960, quota: 54669.3, rate: 47 },
  { from: 208390, quota: 85421.4, rate: 49 },
];

/**
 * Reduction of net work income (art. 23), identical in the three territories since 2025:
 * a flat amount for low net income that tapers linearly to a floor.
 */
const basqueBonification = {
  full: { upTo: 14800, amount: 8000 },
  taper: { upTo: 23000, slope: 0.6098 },
  floor: 3000,
  /** Increase for active workers with a disability: 100% (33–64%), 250% (65% or more). */
  disabilityIncrease: { moderate: 1, severe: 2.5 },
};

/** Age deduction (art. 83): full up to a taxable base of 20,000 €, tapering to zero at 30,000 €. */
const basqueAgeDeduction = {
  over65: 393,
  over75: 714,
  fullUpTo: 20000,
  zeroAt: 30000,
};

export interface BasqueRules {
  scale: Scale;
  bonification: typeof basqueBonification;
  /** Flat reduction of the general quota (art. 77). */
  quotaReduction: number;
  /** Per descendant: first to fifth; the fifth applies to every later child (art. 79.1). */
  descendants: readonly number[];
  /** Added per descendant under 6 (art. 79.2). */
  under6: number;
  /** Taxpayer disability deduction (art. 82): 33–64% and 65% or more. */
  disability: { moderate: number; severe: number };
  age: typeof basqueAgeDeduction;
  citations: readonly Citation[];
}

const bizkaiaGipuzkoaFamily = {
  descendants: [682, 844, 1421, 1680, 2195],
  under6: 394,
  disability: { moderate: 906, severe: 1294 },
};

export const basqueRules: Record<BasqueTerritory, BasqueRules> = {
  bizkaia: {
    scale: basqueScale,
    bonification: basqueBonification,
    quotaReduction: 1615,
    ...bizkaiaGipuzkoaFamily,
    age: basqueAgeDeduction,
    citations: [
      { source: 'bizkaiaPresupuestos2026', locator: 'arts. 49 a 54' },
      { source: 'bizkaiaBonificacion', locator: 'art. 23' },
    ],
  },
  gipuzkoa: {
    scale: basqueScale,
    bonification: basqueBonification,
    quotaReduction: 1615,
    ...bizkaiaGipuzkoaFamily,
    age: basqueAgeDeduction,
    citations: [
      { source: 'gipuzkoaPresupuestos2026', locator: 'disposición final primera' },
      { source: 'gipuzkoaIrpf', locator: 'arts. 22, 23, 74 y 78' },
    ],
  },
  // Álava's family and disability amounts come from its 2025 measures (Norma Foral 19/2024),
  // which the 2026 measures leave unchanged. Its extra 68.20 € for children aged 6 to 15
  // (art. 79.2, second paragraph) is not modelled.
  alava: {
    scale: basqueScale,
    bonification: basqueBonification,
    quotaReduction: 1615,
    descendants: [734.8, 909.7, 1532.3, 1811.7, 2366.1],
    under6: 424.6,
    disability: { moderate: 1025.64, severe: 1464.54 },
    age: basqueAgeDeduction,
    citations: [
      { source: 'alavaMedidas2026', locator: 'art. 1, apartados Cuatro, Cinco y Siete' },
      { source: 'alavaIrpf', locator: 'arts. 23, 74, 78, 79 y 82' },
    ],
  },
};

/** Navarra's 2026 rules (Texto Refundido de la Ley Foral del IRPF, DFL 4/2008). */
export const navarraRules = {
  /** Art. 59.1, as set by Ley Foral 22/2023 and unchanged since. */
  scale: [
    { from: 0, quota: 0, rate: 13 },
    { from: 4458, quota: 579.54, rate: 22 },
    { from: 10030, quota: 1805.38, rate: 25 },
    { from: 21175, quota: 4591.63, rate: 28 },
    { from: 35663, quota: 8648.27, rate: 36.5 },
    { from: 51266, quota: 14343.37, rate: 41.5 },
    { from: 66869, quota: 20818.61, rate: 44 },
    { from: 89159, quota: 30626.21, rate: 47 },
    { from: 139310, quota: 54197.18, rate: 49 },
    { from: 195034, quota: 81501.94, rate: 50.5 },
    { from: 334344, quota: 151853.49, rate: 52 },
  ] satisfies Scale,
  /**
   * Work deduction (art. 62.5) by net work income: letters a) and b) as amended for 2026,
   * c) to e) unchanged. It can't exceed the scale applied to net work income.
   */
  workDeduction: {
    full: { upTo: 12500, amount: 1400 },
    firstTaper: { upTo: 17500, slope: 0.14 },
    plateau: { upTo: 35000, amount: 700 },
    secondTaper: { upTo: 50000, slope: 0.02 },
    floor: 400,
    /** Increase for active workers with a disability: 50% (33–64%), 100% (65% or more). */
    disabilityIncrease: { moderate: 0.5, severe: 1 },
  },
  /** Personal deduction (art. 62.9.a). */
  personal: {
    general: 1084,
    over65: 264,
    /** Replaces `over65` from age 75. */
    over75: 585,
    disability: { moderate: 766, severe: 2757 },
    /** Extra for low income, by income: c') full, d') and e') tapering to zero at 32,000 €. */
    lowIncome: {
      full: { upTo: 17500, amount: 1280 },
      firstTaper: { upTo: 30000, slope: 0.0904 },
      secondTaper: { upTo: 32000, amount: 150, slope: 0.075 },
    },
  },
  /** Family deduction per descendant under 30 (art. 62.9.b.b'), sixth and later share the last amount. */
  descendants: [483, 512, 732, 981, 1111, 1286],
  under3: 644,
  /**
   * Increase of the descendant deduction for low income (art. 62.9.b.b'.2.º): 40% up to
   * 20,000 €, minus 50 points times the excess over 20,000 € as a share of 20,000 €, up to
   * 30,000 €. Unlike the base amount, it isn't shared between parents.
   */
  descendantIncrease: { fullUpTo: 20000, rate: 0.4, slopePoints: 50, upTo: 30000 },
  citations: [
    { source: 'navarraLeyForal22_2023', locator: 'art. primero, apartados Ocho y Doce' },
    { source: 'navarraLeyForal17_2025', locator: 'art. 1, apartados Trece, Catorce y Quince' },
    { source: 'navarraManual2022', locator: 'págs. 83-84 y 273' },
  ] satisfies readonly Citation[],
} as const;
