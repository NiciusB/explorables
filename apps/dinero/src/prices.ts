import type { Citation } from './sources';

/** Pesetas per euro, the fixed conversion rate since 1999. */
export const PESETAS_PER_EURO = 166.386;

/**
 * Annual average of the national CPI (base 2025 = 100). INE publishes index levels only
 * from 2002; earlier levels are chained back month by month from each month's published
 * 12-month rate, the same way INE's own price-update calculator links the series.
 * 2026 is the average of January to September, the months published so far.
 */
const CPI: Readonly<Record<number, number>> = {
  1978: 11.742,
  1979: 13.581,
  1980: 15.695,
  1981: 17.978,
  1982: 20.569,
  1983: 23.072,
  1984: 25.675,
  1985: 27.939,
  1986: 30.397,
  1987: 31.994,
  1988: 33.548,
  1989: 35.827,
  1990: 38.239,
  1991: 40.509,
  1992: 42.912,
  1993: 44.872,
  1994: 46.991,
  1995: 49.187,
  1996: 50.94,
  1997: 51.945,
  1998: 52.901,
  1999: 54.114,
  2000: 55.978,
  2001: 57.99,
  2002: 60.036,
  2003: 61.861,
  2004: 63.741,
  2005: 65.888,
  2006: 68.205,
  2007: 70.105,
  2008: 72.962,
  2009: 72.752,
  2010: 74.062,
  2011: 76.429,
  2012: 78.298,
  2013: 79.401,
  2014: 79.281,
  2015: 78.885,
  2016: 78.725,
  2017: 80.264,
  2018: 81.609,
  2019: 82.18,
  2020: 81.915,
  2021: 84.448,
  2022: 91.534,
  2023: 94.767,
  2024: 97.396,
  2025: 100,
  2026: 103.054,
};

export const CPI_CITATION: Citation = { source: 'ipc', locator: 'Tablas 24077 y 76134' };

/** The year whose money every comparison is expressed in. */
const PRESENT_YEAR = 2026;

function cpi(year: number): number {
  const value = CPI[year];
  if (value === undefined) throw new RangeError(`No CPI for ${String(year)}`);
  return value;
}

/** How many of today's euros buy what one euro bought in `year`. */
export function priceFactor(year: number): number {
  return cpi(PRESENT_YEAR) / cpi(year);
}

/** Converts euros of `year` into today's euros. */
export function toPresentEuros(euros: number, year: number): number {
  return euros * priceFactor(year);
}

/** Converts today's euros into the euros of `year`. */
export function fromPresentEuros(euros: number, year: number): number {
  return euros / priceFactor(year);
}
