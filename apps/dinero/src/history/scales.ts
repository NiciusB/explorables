import { PESETAS_PER_EURO, priceFactor } from '../prices';
import type { Citation } from '../sources';
import { combineScales, rescale, type Scale } from '../tax/scale';

/**
 * Hand-picked IRPF scales, transcribed as published (amounts in the currency of the day).
 * Where the tax had a state and a regional part, both are listed and added together.
 */
export interface HistoricalScale {
  year: number;
  currency: 'pesetas' | 'euros';
  /** Scales that apply together to the same base; the combined rate is their sum. */
  parts: readonly Scale[];
  /** The scale's tax could not exceed this share of the base (1979 only). */
  averageCap?: number;
  citations: readonly Citation[];
}

/** Ley 44/1978, art. 28: the first IRPF, as enacted. Amounts in pesetas. */
const scale1979: Scale = [
  { from: 0, quota: 0, rate: 15 },
  { from: 200_000, quota: 30_000, rate: 16.02 },
  { from: 400_000, quota: 62_040, rate: 17.04 },
  { from: 600_000, quota: 96_120, rate: 18.06 },
  { from: 800_000, quota: 132_240, rate: 19.08 },
  { from: 1_000_000, quota: 170_400, rate: 20.61 },
  { from: 1_400_000, quota: 252_840, rate: 22.65 },
  { from: 1_800_000, quota: 343_440, rate: 24.69 },
  { from: 2_200_000, quota: 442_200, rate: 26.73 },
  { from: 2_600_000, quota: 549_120, rate: 28.78 },
  { from: 3_000_000, quota: 664_240, rate: 30.82 },
  { from: 3_400_000, quota: 787_520, rate: 32.86 },
  { from: 3_800_000, quota: 918_960, rate: 34.9 },
  { from: 4_200_000, quota: 1_058_560, rate: 36.94 },
  { from: 4_600_000, quota: 1_206_320, rate: 38.98 },
  { from: 5_000_000, quota: 1_362_240, rate: 41.02 },
  { from: 5_400_000, quota: 1_526_320, rate: 43.06 },
  { from: 5_800_000, quota: 1_698_560, rate: 45.1 },
  { from: 6_200_000, quota: 1_878_960, rate: 47.14 },
  { from: 6_600_000, quota: 2_067_520, rate: 49.18 },
  { from: 7_000_000, quota: 2_264_240, rate: 51.22 },
  { from: 7_400_000, quota: 2_469_120, rate: 53.27 },
  { from: 7_800_000, quota: 2_682_200, rate: 55.31 },
  { from: 8_200_000, quota: 2_903_440, rate: 57.35 },
  { from: 8_600_000, quota: 3_132_840, rate: 59.39 },
  { from: 9_000_000, quota: 3_370_400, rate: 61.43 },
  { from: 9_400_000, quota: 3_616_120, rate: 63.47 },
  { from: 9_800_000, quota: 3_870_000, rate: 65.51 },
];

/**
 * RDL 5/1992, art. 2.1: the individual scale that replaced Ley 18/1991's for 1992. The
 * Constitutional Court later ruled (STC 182/1997) that a decree-law could not set it.
 * The scanned BOE is hard to read in places; every quota here is checked against its rates.
 */
const scale1992: Scale = [
  { from: 0, quota: 0, rate: 0 },
  { from: 400_000, quota: 0, rate: 20 },
  { from: 1_000_000, quota: 120_000, rate: 22 },
  { from: 1_570_000, quota: 245_400, rate: 24.5 },
  { from: 2_140_000, quota: 385_050, rate: 27 },
  { from: 2_710_000, quota: 538_950, rate: 30 },
  { from: 3_280_000, quota: 709_950, rate: 32 },
  { from: 3_850_000, quota: 892_350, rate: 34 },
  { from: 4_420_000, quota: 1_086_150, rate: 36 },
  { from: 4_990_000, quota: 1_291_350, rate: 38 },
  { from: 5_560_000, quota: 1_507_950, rate: 40 },
  { from: 6_130_000, quota: 1_735_950, rate: 42.5 },
  { from: 6_700_000, quota: 1_978_200, rate: 45 },
  { from: 7_270_000, quota: 2_234_700, rate: 47 },
  { from: 7_840_000, quota: 2_502_600, rate: 49 },
  { from: 8_410_000, quota: 2_781_900, rate: 51 },
  { from: 8_980_000, quota: 3_072_600, rate: 53.5 },
  { from: 9_550_000, quota: 3_377_550, rate: 56 },
];

/** Ley 40/1998, art. 50: state scale. Pesetas. */
const state1999: Scale = [
  { from: 0, quota: 0, rate: 15 },
  { from: 600_000, quota: 90_000, rate: 20.17 },
  { from: 2_100_000, quota: 392_550, rate: 23.57 },
  { from: 4_100_000, quota: 863_950, rate: 31.48 },
  { from: 6_600_000, quota: 1_650_950, rate: 38.07 },
  { from: 11_000_000, quota: 3_326_030, rate: 39.6 },
];

/** Ley 40/1998, art. 61: the regional ("complementaria") scale for every community. */
const regional1999: Scale = [
  { from: 0, quota: 0, rate: 3 },
  { from: 600_000, quota: 18_000, rate: 3.83 },
  { from: 2_100_000, quota: 75_450, rate: 4.73 },
  { from: 4_100_000, quota: 170_050, rate: 5.72 },
  { from: 6_600_000, quota: 313_050, rate: 6.93 },
  { from: 11_000_000, quota: 617_970, rate: 8.4 },
];

/** Ley 35/2006, art. 63 as enacted: state scale for 2007. */
const state2007: Scale = [
  { from: 0, quota: 0, rate: 15.66 },
  { from: 17_360, quota: 2718.58, rate: 18.27 },
  { from: 32_360, quota: 5459.08, rate: 24.14 },
  { from: 52_360, quota: 10_287.08, rate: 27.13 },
];

/** Ley 35/2006, art. 74 as enacted: the complementary scale for communities without their own. */
const regional2007: Scale = [
  { from: 0, quota: 0, rate: 8.34 },
  { from: 17_360, quota: 1447.82, rate: 9.73 },
  { from: 32_360, quota: 2907.32, rate: 12.86 },
  { from: 52_360, quota: 5479.32, rate: 15.87 },
];

/** Ley 35/2006, art. 63 as amended by Ley 39/2010 (art. 62.Uno), in force for 2011 to 2014. */
const state2012: Scale = [
  { from: 0, quota: 0, rate: 12 },
  { from: 17_707.2, quota: 2124.86, rate: 14 },
  { from: 33_007.2, quota: 4266.86, rate: 18.5 },
  { from: 53_407.2, quota: 8040.86, rate: 21.5 },
  { from: 120_000.2, quota: 22_358.36, rate: 22.5 },
  { from: 175_000.2, quota: 34_733.36, rate: 23.5 },
];

/**
 * The reference regional scale (DT 15.ª Ley 35/2006, added by Ley 22/2009). By 2012 each
 * community set its own; we use this one as the default case.
 */
const regional2012: Scale = [
  { from: 0, quota: 0, rate: 12 },
  { from: 17_707.2, quota: 2124.86, rate: 14 },
  { from: 33_007.2, quota: 4266.86, rate: 18.5 },
  { from: 53_407.2, quota: 8040.86, rate: 21.5 },
];

/** RDL 20/2011, disposición final segunda: the 2012–2013 surcharge on the state quota. */
const surcharge2012: Scale = [
  { from: 0, quota: 0, rate: 0.75 },
  { from: 17_707.2, quota: 132.8, rate: 2 },
  { from: 33_007.2, quota: 438.8, rate: 3 },
  { from: 53_407.2, quota: 1050.8, rate: 4 },
  { from: 120_000.2, quota: 3714.52, rate: 5 },
  { from: 175_000.2, quota: 6464.52, rate: 6 },
  { from: 300_000.2, quota: 13_964.52, rate: 7 },
];

export const HISTORICAL_SCALES: readonly HistoricalScale[] = [
  {
    year: 1979,
    currency: 'pesetas',
    parts: [scale1979],
    averageCap: 0.4,
    citations: [{ source: 'lirpf1978', locator: 'art. 28' }],
  },
  {
    year: 1992,
    currency: 'pesetas',
    parts: [scale1992],
    citations: [{ source: 'rdl5_1992', locator: 'art. 2.1' }],
  },
  {
    year: 1999,
    currency: 'pesetas',
    parts: [state1999, regional1999],
    citations: [{ source: 'lirpf1998', locator: 'arts. 50 y 61' }],
  },
  {
    year: 2007,
    currency: 'euros',
    parts: [state2007, regional2007],
    citations: [{ source: 'lirpf2006Original', locator: 'arts. 63 y 74' }],
  },
  {
    year: 2012,
    currency: 'euros',
    parts: [state2012, regional2012, surcharge2012],
    citations: [
      { source: 'presupuestos2011', locator: 'art. 62.Uno' },
      {
        source: 'financiacion2009',
        locator: 'nueva disposición transitoria decimoquinta de la Ley 35/2006',
      },
      { source: 'rdl20_2011', locator: 'disposición final segunda' },
    ],
  },
];

/** A scale's amounts converted to today's euros, with its parts already added up. */
export interface RealScale {
  year: number;
  scale: Scale;
  averageCap?: number;
}

/** Converts a historical scale to today's euros (pesetas to euros, then inflation). */
export function toRealScale(historical: HistoricalScale): RealScale {
  const toEuros = historical.currency === 'pesetas' ? 1 / PESETAS_PER_EURO : 1;
  const scale = rescale(combineScales(...historical.parts), toEuros * priceFactor(historical.year));
  return historical.averageCap === undefined
    ? { year: historical.year, scale }
    : { year: historical.year, scale, averageCap: historical.averageCap };
}

/** Exposed for tests that cross-check every published quota. */
export const publishedParts: readonly Scale[] = HISTORICAL_SCALES.flatMap(
  (historical) => historical.parts,
);
