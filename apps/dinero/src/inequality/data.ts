import type { Citation } from '../sources';
import { COMMON_REGIONS, type CommonRegion } from '../tax/rules2026';

/**
 * Gross monthly pay of every wage earner's main job, by decile (EPA, INE table 66252).
 * INE divides each year's total pay by 12, so pagas extra are spread over the months.
 * `lower` holds the lower limits of deciles 2 to 10 (P10 … P90); `mean` the mean of
 * deciles 1 to 10. Includes part-time workers. Euros of each year.
 */
export interface SalaryDeciles {
  lower: readonly number[];
  mean: readonly number[];
}

export const SALARY_DECILES: Readonly<Record<number, SalaryDeciles>> = {
  2006: {
    lower: [657.3, 923.2, 1079.9, 1205.6, 1338.4, 1513.4, 1766.7, 2178.6, 2797],
    mean: [474.2, 800.7, 1006, 1144.2, 1270.4, 1418.5, 1629.4, 1960.3, 2447.8, 3573.7],
  },
  2007: {
    lower: [695, 979.2, 1139.2, 1269.5, 1409.7, 1581.6, 1844.8, 2269.7, 2926.5],
    mean: [501.7, 852.2, 1060.7, 1203.8, 1337.1, 1491.6, 1703.2, 2043, 2570.1, 3670.8],
  },
  // The top decile's mean jumps 18% this year while its lower limit rises 6%. We found no
  // explanation in INE's notes and show it as published.
  2008: {
    lower: [732.7, 1021.4, 1194.8, 1337.5, 1491.4, 1675.6, 1938.1, 2372.3, 3103.9],
    mean: [501.3, 888.7, 1113.4, 1267.3, 1411.7, 1577.7, 1795.6, 2144.9, 2695.8, 4346.3],
  },
  2009: {
    lower: [714.5, 1018.4, 1210.5, 1363.3, 1530, 1738.3, 2019, 2489.7, 3230.5],
    mean: [495.9, 875.9, 1120, 1290.2, 1443.6, 1627.3, 1869.8, 2240, 2818.5, 4370.1],
  },
  2010: {
    lower: [722.5, 1043.1, 1235.4, 1394, 1566.8, 1777.3, 2082.6, 2523.2, 3238.5],
    mean: [482.4, 893.1, 1142, 1316.3, 1478.5, 1667.4, 1916.6, 2291.4, 2842.3, 4356.5],
  },
  2011: {
    lower: [693.1, 1018.1, 1225.3, 1394.6, 1577.1, 1788, 2084.3, 2520.9, 3272.1],
    mean: [464.5, 863.8, 1128.9, 1310, 1484.8, 1678.8, 1926.5, 2291.5, 2847.5, 4418.4],
  },
  2012: {
    lower: [658.3, 999.1, 1227.5, 1409.7, 1579, 1797.6, 2101.3, 2531.7, 3262.1],
    mean: [425.6, 840.2, 1121.7, 1322.1, 1492.7, 1685.4, 1943.5, 2304.2, 2851.6, 4515],
  },
  2013: {
    lower: [638.1, 983.3, 1217.4, 1411.8, 1600.2, 1819.6, 2159.4, 2582.4, 3350.9],
    mean: [414.5, 812.2, 1103.3, 1318.7, 1503, 1703.7, 1979.2, 2364.5, 2915.8, 4574.9],
  },
  2014: {
    lower: [655.1, 972.8, 1221.1, 1405.3, 1602.5, 1837.5, 2173.5, 2625, 3353.8],
    mean: [411.2, 819.6, 1100.9, 1315.5, 1503, 1715.1, 1996.7, 2386.3, 2946.6, 4616.9],
  },
  2015: {
    lower: [680, 979.5, 1215.7, 1402.9, 1596.8, 1814, 2136.7, 2607.2, 3424.8],
    mean: [420.1, 829, 1102.1, 1311, 1497.7, 1703.7, 1960.4, 2363.6, 2964.2, 4784.5],
  },
  2016: {
    lower: [710.1, 1002.8, 1229.3, 1412.7, 1594.5, 1824.1, 2137.5, 2595.1, 3316.9],
    mean: [462.7, 856.9, 1118.3, 1325.4, 1498.2, 1703.9, 1969.4, 2355, 2921.9, 4568.7],
  },
  2017: {
    lower: [717.2, 1001.8, 1230.9, 1409.9, 1590.3, 1817.9, 2136.3, 2616.3, 3367.6],
    mean: [464.3, 863.9, 1121.9, 1323, 1497.7, 1698, 1970.3, 2363.2, 2955.5, 4631.2],
  },
  2018: {
    lower: [748.7, 1046.9, 1260.9, 1453.6, 1642.3, 1871.3, 2187.2, 2674.7, 3441.9],
    mean: [479.9, 904.9, 1156.5, 1357.4, 1546.7, 1752.6, 2017.4, 2422, 3006.2, 4799.6],
  },
  2019: {
    lower: [814.4, 1116.8, 1324.2, 1507.4, 1684.3, 1912.9, 2221.2, 2705.4, 3460.3],
    mean: [532.3, 994.5, 1222.5, 1418.1, 1595.3, 1793.6, 2058.5, 2446.6, 3035.5, 4725.5],
  },
  2020: {
    lower: [820.2, 1134.2, 1336.6, 1511.3, 1706.4, 1941.1, 2295.2, 2806, 3585.8],
    mean: [521.3, 1006.6, 1237, 1423.4, 1606.9, 1816.8, 2107.4, 2541.4, 3160.3, 4964],
  },
  2021: {
    lower: [852.7, 1156.4, 1353.1, 1551.9, 1752.7, 1996.6, 2322.1, 2804.8, 3586.8],
    mean: [566.3, 1033.9, 1256.8, 1455, 1652.7, 1865.7, 2148, 2558.2, 3142.9, 5083.8],
  },
  2022: {
    lower: [951.1, 1247.1, 1434.6, 1607.2, 1802.8, 2035.2, 2358, 2841.6, 3613],
    mean: [619.7, 1132.2, 1338.8, 1523.1, 1708.7, 1913.1, 2181.8, 2592.8, 3172.8, 5002],
  },
  2023: {
    lower: [1000, 1335.4, 1534.7, 1731.8, 1935.5, 2192, 2548.2, 3036.5, 3858.2],
    mean: [645, 1209.6, 1434.1, 1631.6, 1834, 2059.5, 2356.7, 2781.8, 3390.6, 5386.7],
  },
  2024: {
    lower: [1068.9, 1392.7, 1582.2, 1780.1, 2001.4, 2265.4, 2659.8, 3199.8, 4056.7],
    mean: [710.2, 1280.9, 1488.5, 1681.5, 1888.7, 2130, 2448, 2914.7, 3567.3, 5741],
  },
};

/** Decile numbers, poorest first, for drawing one thing per decile. */
export const DECILES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export const SALARY_DECILES_CITATION: Citation = { source: 'epaDeciles', locator: 'Tabla 66252' };
export const LATEST_SALARY_YEAR = 2024;
export const FIRST_SALARY_YEAR = 2006;

/**
 * Lower limits of deciles 2 to 10 of yearly net household income per consumption unit
 * (ECV 2025, incomes of 2024). Consumption units use the modified OECD scale.
 */
export const INCOME_DECILE_LIMITS: readonly number[] = [
  9091.1, 12_374.2, 15_130, 17_741.9, 20_367.3, 23_372.2, 26_790.7, 31_569.3, 39_384.8,
];
export const INCOME_DECILES_CITATION: Citation = { source: 'ecvDeciles', locator: 'Tabla 9957' };
/** The survey year; incomes refer to the year before. */
export const INCOME_SURVEY_YEAR = 2025;

/** Communities as INE's surveys report them: the Basque territories count as one. */
export type Community = CommonRegion | 'pais-vasco' | 'navarra';
export const COMMUNITIES: readonly Community[] = [...COMMON_REGIONS, 'pais-vasco', 'navarra'];

/** First year of every Gini series below; one value per survey year after it. */
export const GINI_FIRST_YEAR = 2008;

/** Gini coefficient of disposable income per consumption unit (ECV), in points out of 100. */
export const GINI: Readonly<Record<Community | 'spain', readonly number[]>> = {
  spain: [
    32.4, 32.9, 33.5, 34, 34.2, 33.7, 34.7, 34.6, 34.5, 34.1, 33.2, 33, 32.1, 33, 32, 31.5, 31.2,
    30.8,
  ],
  andalucia: [
    33.8, 33, 33.3, 35.1, 34, 34, 35.2, 35, 36.1, 35.5, 34.9, 33.4, 30.8, 34.3, 32.8, 32.6, 31.4,
    31.2,
  ],
  aragon: [
    27.6, 27.8, 26.6, 29.6, 30, 31.8, 32.8, 31.6, 30.4, 28.8, 27.3, 27.5, 27.4, 28.7, 27.3, 27.2,
    27.1, 27.1,
  ],
  asturias: [
    30.4, 30.6, 29.9, 29.2, 30, 29.1, 31.7, 30.2, 29.2, 31.4, 28.8, 34.7, 34, 31.7, 31.1, 30.5,
    28.1, 28.8,
  ],
  baleares: [
    32.1, 33.2, 34.4, 36.5, 34.2, 33.8, 34.9, 34.7, 33.6, 37.8, 32.8, 29.2, 26.5, 28.5, 28.3, 28.5,
    28.7, 27.7,
  ],
  canarias: [
    31.7, 33.2, 33, 34, 34.4, 32.8, 33.6, 35.9, 38.1, 33.8, 33.9, 30.3, 33.1, 35, 33.2, 31.1, 31.6,
    30.7,
  ],
  cantabria: [
    29.1, 30.6, 30.7, 33.9, 31.1, 30.3, 28.4, 27.2, 30, 29.7, 29.9, 30.4, 30.8, 29.8, 30.3, 28.7,
    28.5, 27.5,
  ],
  'castilla-y-leon': [
    28.8, 30.1, 29.7, 29.8, 29.9, 30.5, 32.5, 31.1, 30.5, 28.5, 29.9, 27.7, 27.9, 29.5, 29.2, 29.4,
    29.8, 29.8,
  ],
  'castilla-la-mancha': [
    31.7, 29.7, 34.5, 33.7, 34.6, 33.6, 33.2, 33.4, 33.9, 33.2, 34.2, 31.2, 28.9, 31.7, 29.9, 29.6,
    29.7, 29.6,
  ],
  cataluna: [
    31.1, 32.3, 33.6, 32.1, 32.6, 31.9, 33, 32.3, 31.4, 31.8, 30.3, 31.2, 31.7, 30.9, 30, 29.9, 29,
    29.1,
  ],
  valencia: [
    32.2, 31, 33.2, 33.4, 34, 33.2, 32.6, 33, 32.5, 33.2, 31.5, 31.4, 32.3, 32.2, 30.7, 31.1, 31.7,
    31.8,
  ],
  extremadura: [
    32.2, 32.6, 34, 33.2, 32.8, 32, 31.6, 32.2, 32.3, 33.5, 30.6, 29.8, 28, 30.5, 29.4, 28.7, 28.8,
    28.3,
  ],
  galicia: [
    29.4, 28.7, 30.2, 30.1, 31.1, 30, 30.7, 31.5, 31.5, 30.8, 30.9, 30.5, 29.7, 29.2, 28, 27.4,
    26.8, 28.4,
  ],
  madrid: [
    31.9, 33.5, 32.2, 34.1, 33.9, 32.9, 33.7, 34.7, 35, 35.1, 33.4, 34.7, 32.9, 33.4, 32.4, 31.6,
    31.8, 30.6,
  ],
  murcia: [
    30.6, 31.9, 31.5, 29.7, 29.7, 31.1, 33.7, 33.3, 32, 31.4, 31.7, 28.9, 28.8, 30.1, 29.3, 28.3,
    29.4, 29.6,
  ],
  navarra: [
    27.2, 28.7, 30.5, 29.9, 30.3, 28.3, 28.1, 26.2, 27.7, 26.5, 24.7, 24.3, 27.3, 28.7, 30, 30.1,
    30.7, 29.2,
  ],
  'pais-vasco': [
    29.6, 30.2, 31.6, 32.6, 31.9, 29.5, 29.3, 30.2, 29.1, 29.6, 30, 29.4, 28.8, 29.3, 29.4, 30.1,
    29.1, 28.4,
  ],
  'la-rioja': [
    28.5, 31.5, 30, 31.5, 31.8, 31.7, 31.9, 31.1, 28.5, 28.3, 30.5, 29.3, 28.2, 29.3, 28.2, 28.3,
    29, 28.4,
  ],
};
export const GINI_CITATION: Citation = { source: 'ecvGini', locator: 'Tabla 76846' };

/**
 * Share of pre-tax national income going to the top 10% and top 1% of adults (WID), in
 * percent. WID has no estimate for 2013 and 2014.
 */
export const TOP_SHARES: readonly { year: number; top10: number; top1: number }[] = [
  { year: 1982, top10: 34.89, top1: 11.24 },
  { year: 1983, top10: 34.83, top1: 10.92 },
  { year: 1984, top10: 34.93, top1: 10.79 },
  { year: 1985, top10: 35.17, top1: 10.97 },
  { year: 1986, top10: 36.36, top1: 11.74 },
  { year: 1987, top10: 36.43, top1: 11.78 },
  { year: 1988, top10: 36.72, top1: 11.85 },
  { year: 1989, top10: 37.34, top1: 12.12 },
  { year: 1990, top10: 36.7, top1: 11.68 },
  { year: 1991, top10: 36.01, top1: 11.43 },
  { year: 1992, top10: 35.26, top1: 11.26 },
  { year: 1993, top10: 34.68, top1: 10.99 },
  { year: 1994, top10: 35.24, top1: 11.38 },
  { year: 1995, top10: 35.52, top1: 11.67 },
  { year: 1996, top10: 35.37, top1: 11.52 },
  { year: 1997, top10: 34.3, top1: 10.97 },
  { year: 1998, top10: 34.39, top1: 10.99 },
  { year: 1999, top10: 34.65, top1: 11.18 },
  { year: 2000, top10: 34.24, top1: 11.01 },
  { year: 2001, top10: 33.69, top1: 10.58 },
  { year: 2002, top10: 33.96, top1: 10.89 },
  { year: 2003, top10: 34.2, top1: 11.1 },
  { year: 2004, top10: 34.03, top1: 10.98 },
  { year: 2005, top10: 33.71, top1: 10.82 },
  { year: 2006, top10: 34.68, top1: 11.3 },
  { year: 2007, top10: 34.57, top1: 11.33 },
  { year: 2008, top10: 34.8, top1: 11.63 },
  { year: 2009, top10: 35.88, top1: 12.62 },
  { year: 2010, top10: 34.33, top1: 11.54 },
  { year: 2011, top10: 34.06, top1: 11.35 },
  { year: 2012, top10: 34.64, top1: 12.13 },
  { year: 2015, top10: 35.32, top1: 12.64 },
  { year: 2016, top10: 35.11, top1: 12.7 },
  { year: 2017, top10: 35.07, top1: 12.71 },
  { year: 2018, top10: 34.65, top1: 12.54 },
  { year: 2019, top10: 34.12, top1: 12.04 },
  { year: 2020, top10: 34.12, top1: 12.04 },
  { year: 2021, top10: 34.27, top1: 12.27 },
  { year: 2022, top10: 34.25, top1: 12.47 },
];
export const TOP_SHARES_CITATION: Citation = {
  source: 'widTopShares',
  locator: 'sptinc_p90p100_992_j y sptinc_p99p100_992_j',
};

/**
 * Mean household net wealth by wealth group at the end of 2024 (EFF 2024, Cuadro 1.B),
 * in thousands of euros. Each group's share of all wealth is its mean times its size over
 * the overall mean (344.7); the shares add up to 99.9% because the means are rounded.
 */
export const WEALTH_GROUPS: readonly { from: number; to: number; mean: number }[] = [
  { from: 0, to: 25, mean: 5.6 },
  { from: 25, to: 50, mean: 100.3 },
  { from: 50, to: 75, mean: 242.4 },
  { from: 75, to: 90, mean: 502.9 },
  { from: 90, to: 100, mean: 1819.5 },
];
export const WEALTH_MEAN = 344.7;
export const WEALTH_CITATION: Citation = { source: 'eff2024', locator: 'Cuadro 1.B' };
