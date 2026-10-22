import type { Locale } from './paraglide/runtime';

const INTL_LOCALE: Record<Locale, string> = { es: 'es-ES', en: 'en-GB' };

export function intlLocale(locale: Locale): string {
  return INTL_LOCALE[locale];
}

/** Euros, whole by default: "30.000 €" or "€30,000"; with `cents`, "6,50 €". */
export function formatEuros(value: number, locale: Locale, { cents = false } = {}): string {
  const digits = cents ? 2 : 0;
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

/** A fraction as a percentage with at most one decimal, e.g. 0.265 → "26,5 %". */
export function formatPercent(fraction: number, locale: Locale): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(fraction);
}

/** An ISO date as a long date, e.g. "22 de octubre de 2026". */
export function formatDate(isoDate: string, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(isoDate));
}

/** About `count` round tick values covering 0..max (1, 2 or 5 times a power of ten apart). */
export function niceTicks(max: number, count = 5): number[] {
  if (max <= 0) return [0];
  const rough = max / count;
  const power = 10 ** Math.floor(Math.log10(rough));
  const step =
    [1, 2, 5, 10].map((factor) => factor * power).find((candidate) => candidate >= rough) ?? rough;
  const ticks: number[] = [];
  for (let tick = 0; tick <= max + step * 1e-9; tick += step) ticks.push(tick);
  return ticks;
}
