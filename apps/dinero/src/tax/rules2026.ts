import type { Citation } from '../sources';
import type { Scale } from './scale';

/** Personal and family minimum amounts ("mínimo personal y familiar"), in euros per year. */
export interface Minimums {
  taxpayer: number;
  /** Added from age 65. */
  over65: number;
  /** Added on top of `over65` from age 75. */
  over75: number;
  /** Per descendant: first, second, third, fourth and later. */
  descendants: readonly [number, number, number, number];
  /** Added per descendant under 3. */
  under3: number;
  /** Disability of 33% or more. */
  disability: number;
  /** Disability of 65% or more (replaces `disability`). */
  disabilitySevere: number;
  /** Added for assistance needs; we apply it with a 65% or greater disability. */
  assistance: number;
}

export const COMMON_REGIONS = [
  'andalucia',
  'aragon',
  'asturias',
  'baleares',
  'canarias',
  'cantabria',
  'castilla-la-mancha',
  'castilla-y-leon',
  'cataluna',
  'extremadura',
  'galicia',
  'la-rioja',
  'madrid',
  'murcia',
  'valencia',
] as const;

export type CommonRegion = (typeof COMMON_REGIONS)[number];

const citeLirpf = (locator: string): Citation => ({ source: 'lirpf', locator });
const citeRegional = (locator: string): Citation => ({
  source: 'tributacionAutonomica2026',
  locator,
});

/** State part of IRPF for 2026 (Ley 35/2006). */
export const state = {
  scale: [
    { from: 0, quota: 0, rate: 9.5 },
    { from: 12450, quota: 1182.75, rate: 12 },
    { from: 20200, quota: 2112.75, rate: 15 },
    { from: 35200, quota: 4362.75, rate: 18.5 },
    { from: 60000, quota: 8950.75, rate: 22.5 },
    { from: 300000, quota: 62950.75, rate: 24.5 },
  ] satisfies Scale,
  scaleCitation: citeLirpf('art. 63.1'),
  minimums: {
    taxpayer: 5550,
    over65: 1150,
    over75: 1400,
    descendants: [2400, 2700, 4000, 4500],
    under3: 2800,
    disability: 3000,
    disabilitySevere: 9000,
    assistance: 3000,
  } satisfies Minimums,
  minimumsCitation: citeLirpf('arts. 57, 58 y 60'),
  /** Flat deductible expense for every worker, plus extra for workers with a disability. */
  otherExpenses: { general: 2000, disability: 3500, disabilitySevere: 7750 },
  otherExpensesCitation: citeLirpf('art. 19.2.f'),
  /** Reduction for low net work income, phased out in two linear stretches. */
  workReduction: {
    full: { upTo: 14852, amount: 7302 },
    firstTaper: { upTo: 17673.52, amount: 7302, slope: 1.75 },
    secondTaper: { upTo: 19747.5, amount: 2364.34, slope: 1.14 },
  },
  workReductionCitation: citeLirpf('art. 20'),
  /** Deduction that keeps minimum-wage earners from paying IRPF. */
  minimumWageDeduction: {
    full: { upTo: 17094, amount: 590.89 },
    taper: { upTo: 20048.45, slope: 0.2 },
  },
  minimumWageDeductionCitation: citeLirpf('disposición adicional sexagésima primera'),
} as const;

/** Employee Social Security contributions for 2026, on a permanent contract. */
export const socialSecurity = {
  /** Contingencias comunes, desempleo, formación profesional, MEI; percent of the contribution base. */
  rates: {
    commonContingencies: 4.7,
    unemployment: 1.55,
    training: 0.1,
    intergenerationalEquity: 0.15,
  },
  ratesCitation: { source: 'cotizacion2026', locator: 'arts. 4, 16 y 33' } satisfies Citation,
  maxMonthlyBase: 5101.2,
  maxMonthlyBaseCitation: { source: 'cotizacion2026', locator: 'art. 2.1' } satisfies Citation,
  /** Employee share of the solidarity contribution on monthly pay above the maximum base. */
  solidarity: [
    { from: 5101.2, rate: 0.19 },
    { from: 5611.32, rate: 0.21 },
    { from: 7651.8, rate: 0.24 },
  ],
  solidarityCitation: { source: 'cotizacion2026', locator: 'art. 17' } satisfies Citation,
} as const;

const scales: Record<CommonRegion, Scale> = {
  cataluna: [
    // Tabla 1
    { from: 0, quota: 0, rate: 9.5 },
    { from: 12500, quota: 1187.5, rate: 12.5 },
    { from: 22000, quota: 2375, rate: 16 },
    { from: 33000, quota: 4135, rate: 19 },
    { from: 53000, quota: 7935, rate: 21.5 },
    { from: 90000, quota: 15890, rate: 23.5 },
    { from: 120000, quota: 22940, rate: 24.5 },
    { from: 175000, quota: 36415, rate: 25.5 },
  ],
  galicia: [
    // Tabla 2
    { from: 0, quota: 0, rate: 9 },
    { from: 12985.35, quota: 1168.68, rate: 11.65 },
    { from: 21068.6, quota: 2110.38, rate: 14.9 },
    { from: 35200, quota: 4215.96, rate: 18.4 },
    { from: 60000, quota: 8779.16, rate: 22.5 },
  ],
  andalucia: [
    // Tabla 3
    { from: 0, quota: 0, rate: 9.5 },
    { from: 13000, quota: 1235, rate: 12 },
    { from: 21100, quota: 2207, rate: 15 },
    { from: 35200, quota: 4322, rate: 18.5 },
    { from: 60000, quota: 8910, rate: 22.5 },
  ],
  asturias: [
    // Tabla 4
    { from: 0, quota: 0, rate: 9 },
    { from: 12450, quota: 1120.5, rate: 12 },
    { from: 17707.2, quota: 1751.36, rate: 14 },
    { from: 33007.2, quota: 3893.36, rate: 19.2 },
    { from: 53407.2, quota: 7810.16, rate: 21.5 },
    { from: 70000, quota: 11377.62, rate: 22.5 },
    { from: 90000, quota: 15877.62, rate: 25 },
    { from: 175000, quota: 37127.62, rate: 26 },
  ],
  cantabria: [
    // Tabla 7
    { from: 0, quota: 0, rate: 8.5 },
    { from: 13000, quota: 1105, rate: 11 },
    { from: 21000, quota: 1985, rate: 14.5 },
    { from: 35200, quota: 4044, rate: 18 },
    { from: 60000, quota: 8508, rate: 22.5 },
    { from: 90000, quota: 15258, rate: 24.5 },
  ],
  'la-rioja': [
    // Tabla 8
    { from: 0, quota: 0, rate: 8 },
    { from: 12450, quota: 996, rate: 10.6 },
    { from: 20200, quota: 1817.5, rate: 13.6 },
    { from: 35200, quota: 3857.5, rate: 17.8 },
    { from: 40000, quota: 4711.9, rate: 18.3 },
    { from: 50000, quota: 6541.9, rate: 19 },
    { from: 60000, quota: 8441.9, rate: 24.5 },
    { from: 120000, quota: 23141.9, rate: 27 },
  ],
  murcia: [
    // Tabla 9
    { from: 0, quota: 0, rate: 9.5 },
    { from: 12450, quota: 1182.75, rate: 11.2 },
    { from: 20200, quota: 2050.75, rate: 13.3 },
    { from: 34000, quota: 3886.15, rate: 17.9 },
    { from: 60000, quota: 8540.15, rate: 22.5 },
  ],
  valencia: [
    // Tabla 10
    { from: 0, quota: 0, rate: 8.8 },
    { from: 12000, quota: 1056, rate: 11.7 },
    { from: 22000, quota: 2226, rate: 14.6 },
    { from: 32000, quota: 3686, rate: 17 },
    { from: 42000, quota: 5386, rate: 19.4 },
    { from: 52000, quota: 7326, rate: 21.9 },
    { from: 62000, quota: 9516, rate: 24.4 },
    { from: 72000, quota: 11956, rate: 26.1 },
    { from: 100000, quota: 19264, rate: 27.35 },
    { from: 150000, quota: 32939, rate: 28.35 },
    { from: 200000, quota: 47114, rate: 29.35 },
  ],
  aragon: [
    // Tabla 12
    { from: 0, quota: 0, rate: 9.5 },
    { from: 13072.5, quota: 1241.89, rate: 12 },
    { from: 21210, quota: 2218.39, rate: 15 },
    { from: 36960, quota: 4580.89, rate: 18.5 },
    { from: 52500, quota: 7455.79, rate: 20.5 },
    { from: 60000, quota: 8993.29, rate: 23 },
    { from: 80000, quota: 13593.29, rate: 24 },
    { from: 90000, quota: 15993.29, rate: 25 },
    { from: 130000, quota: 25993.29, rate: 25.5 },
  ],
  'castilla-la-mancha': [
    // Tabla 19
    { from: 0, quota: 0, rate: 9.5 },
    { from: 12450, quota: 1182.75, rate: 12 },
    { from: 20200, quota: 2112.75, rate: 15 },
    { from: 35200, quota: 4362.75, rate: 18.5 },
    { from: 60000, quota: 8950.75, rate: 22.5 },
  ],
  canarias: [
    // Tabla 22
    { from: 0, quota: 0, rate: 9 },
    { from: 13748, quota: 1237.3, rate: 11.5 },
    { from: 19422, quota: 1889.83, rate: 14 },
    { from: 35924, quota: 4200.11, rate: 18.5 },
    { from: 57566, quota: 8203.88, rate: 23.5 },
    { from: 93268, quota: 16593.85, rate: 25 },
    { from: 123745, quota: 24213.1, rate: 26 },
  ],
  extremadura: [
    // Tabla 23
    { from: 0, quota: 0, rate: 7.75 },
    { from: 12450, quota: 964.88, rate: 9.75 },
    { from: 20200, quota: 1720.5, rate: 16 },
    { from: 24200, quota: 2360.5, rate: 17.5 },
    { from: 35200, quota: 4285.5, rate: 21 },
    { from: 60000, quota: 9493.5, rate: 23.5 },
    { from: 80200, quota: 14240.5, rate: 24 },
    { from: 99200, quota: 18800.5, rate: 24.5 },
    { from: 120200, quota: 23945.5, rate: 25 },
  ],
  baleares: [
    // Tabla 24
    { from: 0, quota: 0, rate: 9 },
    { from: 10000, quota: 900, rate: 11.25 },
    { from: 18000, quota: 1800, rate: 14.25 },
    { from: 30000, quota: 3510, rate: 17.5 },
    { from: 48000, quota: 6660, rate: 19 },
    { from: 70000, quota: 10840, rate: 21.75 },
    { from: 90000, quota: 15190, rate: 22.75 },
    { from: 120000, quota: 22015, rate: 23.75 },
    { from: 175000, quota: 35077.5, rate: 24.75 },
  ],
  madrid: [
    // Tabla 25
    { from: 0, quota: 0, rate: 8.5 },
    { from: 13362.22, quota: 1135.79, rate: 10.7 },
    { from: 19004.63, quota: 1739.53, rate: 12.8 },
    { from: 35425.68, quota: 3841.42, rate: 17.4 },
    { from: 57320.4, quota: 7651.1, rate: 20.5 },
  ],
  'castilla-y-leon': [
    // Tabla 26
    { from: 0, quota: 0, rate: 9 },
    { from: 12450, quota: 1120.5, rate: 12 },
    { from: 20200, quota: 2050.5, rate: 14 },
    { from: 35200, quota: 4150.5, rate: 18.5 },
    { from: 53407.2, quota: 7518.83, rate: 21.5 },
  ],
};

const TABLE_BY_REGION: Record<CommonRegion, string> = {
  cataluna: 'Tabla 1',
  galicia: 'Tabla 2',
  andalucia: 'Tabla 3',
  asturias: 'Tabla 4',
  cantabria: 'Tabla 7',
  'la-rioja': 'Tabla 8',
  murcia: 'Tabla 9',
  valencia: 'Tabla 10',
  aragon: 'Tabla 12',
  'castilla-la-mancha': 'Tabla 19',
  canarias: 'Tabla 22',
  extremadura: 'Tabla 23',
  baleares: 'Tabla 24',
  madrid: 'Tabla 25',
  'castilla-y-leon': 'Tabla 26',
};

const stateMinimums: Minimums = state.minimums;

/** Regions that set their own minimums; the rest use the state amounts. */
const regionalMinimums: Partial<Record<CommonRegion, Minimums>> = {
  andalucia: {
    taxpayer: 5790,
    over65: 1200,
    over75: 1460,
    descendants: [2510, 2820, 4170, 4700],
    under3: 2920,
    disability: 3130,
    disabilitySevere: 9390,
    assistance: 3130,
  },
  asturias: {
    taxpayer: 6105,
    over65: 1265,
    over75: 1540,
    descendants: [2640, 2970, 4400, 4950],
    under3: 3080,
    disability: 3300,
    disabilitySevere: 9900,
    assistance: 3300,
  },
  // State amounts raised 10% for over-65/75, second and later descendants, and disability.
  // The source doesn't say whether assistance is included; we assume it is, like disability.
  baleares: {
    taxpayer: 5550,
    over65: 1265,
    over75: 1540,
    descendants: [2400, 2970, 4400, 4950],
    under3: 2800,
    disability: 3300,
    disabilitySevere: 9900,
    assistance: 3300,
  },
  canarias: {
    taxpayer: 5606,
    over65: 1162,
    over75: 1414,
    descendants: [2424, 2727, 4040, 4545],
    under3: 2828,
    disability: 3030,
    disabilitySevere: 9090,
    assistance: 3030,
  },
  galicia: {
    taxpayer: 5789,
    over65: 1199,
    over75: 1460,
    descendants: [2503, 2816, 4172, 4694],
    under3: 2920,
    disability: 3129,
    disabilitySevere: 9387,
    assistance: 3129,
  },
  madrid: {
    taxpayer: 5956.65,
    over65: 1234.26,
    over75: 1502.58,
    descendants: [2575.85, 2897.83, 4400, 4950],
    under3: 3005.16,
    disability: 3219.81,
    disabilitySevere: 9659.44,
    assistance: 3219.81,
  },
  valencia: {
    taxpayer: 6105,
    over65: 1265,
    over75: 1540,
    descendants: [2640, 2970, 4400, 4950],
    under3: 3080,
    disability: 3300,
    disabilitySevere: 9900,
    assistance: 3300,
  },
};

export interface RegionalRules {
  scale: Scale;
  minimums: Minimums;
  citation: Citation;
}

export function regionalRules(region: CommonRegion): RegionalRules {
  return {
    scale: scales[region],
    minimums: regionalMinimums[region] ?? stateMinimums,
    citation: citeRegional(TABLE_BY_REGION[region]),
  };
}

/** Exposed for tests that cross-check every published scale. */
export const allScales: Readonly<Record<CommonRegion, Scale>> = scales;
