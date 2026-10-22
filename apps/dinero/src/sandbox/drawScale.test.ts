import { describe, expect, it } from 'vite-plus/test';

import { PRESETS } from './customScale';
import { DRAW_BASES, drawingBrackets, drawSegment } from './drawScale';

describe('drawing a tax scale', () => {
  it('samples the existing shape without altering the final rate', () => {
    const rows = drawingBrackets(PRESETS.steep.brackets);
    expect(rows.map((row) => row.from)).toEqual(DRAW_BASES);
    expect(rows.find((row) => row.from === 20_000)?.rate).toBe(25);
    expect(rows.at(-1)?.rate).toBe(60);
  });

  it('interpolates a fast stroke in either direction and rounds the resulting rates', () => {
    const rows = drawingBrackets(PRESETS.flat.brackets);
    const left = { from: 0, rate: 0 };
    const right = { from: 150_000, rate: 75 };
    const forward = drawSegment(rows, left, right);
    expect(forward).toEqual(drawSegment(rows, right, left));
    expect(forward.map((row) => row.rate)).toEqual([0, 5, 10, 15, 23, 33, 50, 75]);
  });

  it('allows a tap between handles and leaves distant brackets unchanged', () => {
    const rows = drawingBrackets(PRESETS.flat.brackets);
    const point = { from: 23_000, rate: 40 };
    const result = drawSegment(rows, point, point);
    expect(result.find((row) => row.from === 20_000)?.rate).toBe(40);
    expect(result.filter((row) => row.rate !== 20)).toHaveLength(1);
  });

  it('keeps rates within valid bounds', () => {
    const rows = drawingBrackets(PRESETS.flat.brackets);
    const result = drawSegment(rows, { from: 0, rate: -10 }, { from: 150_000, rate: 120 });
    expect(result[0]?.rate).toBe(0);
    expect(result.at(-1)?.rate).toBe(100);
  });
});
