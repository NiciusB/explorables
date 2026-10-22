import { toScale, type DesignedBracket } from './customScale';
import { rateAt } from '../tax/scale';

/** Drawing covers ordinary incomes in detail; the last rate continues above €150,000. */
export const DRAW_BASES = [0, 10_000, 20_000, 30_000, 45_000, 65_000, 100_000, 150_000] as const;
export const DRAW_MAX = 150_000;

export interface DrawPoint {
  from: number;
  rate: number;
}

/** Sample an existing tariff so starting a drawing preserves its general shape. */
export function drawingBrackets(brackets: readonly DesignedBracket[]): DesignedBracket[] {
  const scale = toScale(brackets);
  return DRAW_BASES.map((from) => ({ from, rate: rateAt(scale, from + 1e-9) }));
}

/** Fill skipped points during a fast drag, including right-to-left strokes. */
export function drawSegment(
  brackets: readonly DesignedBracket[],
  start: DrawPoint,
  end: DrawPoint,
): DesignedBracket[] {
  const low = Math.min(start.from, end.from);
  const high = Math.max(start.from, end.from);
  const nearest = brackets.reduce<DesignedBracket | undefined>(
    (best, row) =>
      best === undefined || Math.abs(row.from - end.from) < Math.abs(best.from - end.from)
        ? row
        : best,
    undefined,
  );
  return brackets.map((row) => {
    if (row.from < low || row.from > high) {
      if (row !== nearest) return row;
      return { ...row, rate: boundedRate(end.rate) };
    }
    const fraction =
      start.from === end.from ? 1 : (row.from - start.from) / (end.from - start.from);
    return { ...row, rate: boundedRate(start.rate + fraction * (end.rate - start.rate)) };
  });
}

const boundedRate = (rate: number) => Math.round(Math.min(100, Math.max(0, rate)));
