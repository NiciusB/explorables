import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test';

import { formatEuros, formatPercent } from '../format';
import { m } from '../paraglide/messages';
import { localStorageKey } from '../paraglide/runtime';
import { salaryBreakdown } from '../tax/regions';
import { DEFAULT_SITUATION } from '../tax/situation';
import { CapitalSection } from './CapitalSection';
import { ChangeBars } from './ChangeBars';
import { DecileBars } from './DecileBars';
import { GiniRanking } from './GiniRanking';
import { HistorySection } from './HistorySection';
import { JourneyBar } from './JourneyBar';
import { LineChart } from './LineChart';
import { PercentileRuler } from './PercentileRuler';
import { RateCurveChart } from './RateCurveChart';
import { Staircase } from './Staircase';
import { WealthMorph } from './WealthMorph';

const euros = (value: number) => formatEuros(value, 'es');
const steps = [{ from: 0, to: 1000, socialSecurity: 65, irpf: 100 }];
const breakdown = salaryBreakdown(30_000, 'madrid', DEFAULT_SITUATION);

const charts = [
  {
    name: 'capital income lanes',
    chart: (
      <CapitalSection
        profile={{
          ...breakdown,
          taxableBase: 25_000,
          marginalRate: 0.3,
          region: 'madrid',
          situation: DEFAULT_SITUATION,
          personal: false,
        }}
        locale="es"
      />
    ),
    expected: 'Seguridad Social',
  },
  {
    name: 'salary journey',
    chart: <JourneyBar breakdown={breakdown} steps={steps} locale="es" />,
    expected: 'Seguridad Social',
  },
  {
    name: 'staircase',
    chart: <Staircase gross={1000} steps={steps} locale="es" />,
    expected: 'De 0',
  },
  {
    name: 'deciles',
    chart: (
      <DecileBars
        values={[1000, 2000]}
        ghosts={[900, 1800]}
        max={3000}
        highlight={1}
        label="Pay"
        locale="es"
      />
    ),
    expected: euros(1000),
  },
  {
    name: 'regional Gini',
    chart: <GiniRanking highlight="madrid" locale="es" />,
    expected: 'España:',
  },
  {
    name: 'net changes',
    chart: (
      <ChangeBars
        items={[
          { label: euros(5000), value: -100 },
          { label: euros(200_000), value: 200 },
        ]}
        format={euros}
        label="Changes"
      />
    ),
    expected: euros(-100),
  },
  {
    name: 'percentile ruler',
    chart: <PercentileRuler percentile={42} pin="Example" label="Position" />,
    expected: 'Decil 1: percentiles 0–10',
  },
  { name: 'wealth', chart: <WealthMorph locale="es" />, expected: 'Riqueza:' },
  {
    name: 'historical top rates',
    chart: (
      <HistorySection
        profile={{
          ...breakdown,
          taxableBase: 25_000,
          marginalRate: 0.3,
          region: 'madrid',
          situation: DEFAULT_SITUATION,
          personal: false,
        }}
        locale="es"
      />
    ),
    expected: '1979',
  },
];

beforeEach(() => {
  localStorage.setItem(localStorageKey, 'es');
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('chart details', () => {
  it.each(charts)('shows $name values on hover, focus and tap', async ({ chart, expected }) => {
    localStorage.setItem(localStorageKey, 'es');
    render(chart);
    const mark = screen.getAllByRole('img')[0];
    if (mark === undefined) throw new Error('Chart has no accessible marks');
    const user = userEvent.setup();
    await user.hover(mark);
    expect(screen.getByRole('tooltip').textContent).toContain(expected);
    await user.unhover(mark);
    expect(screen.queryByRole('tooltip')).toBeNull();
    fireEvent.focus(mark);
    expect(screen.getByRole('tooltip').textContent).toContain(expected);
    expect(mark.getAttribute('aria-describedby')).toBe(screen.getByRole('tooltip').id);
    fireEvent.keyDown(mark, { key: 'Escape' });
    expect(screen.queryByRole('tooltip')).toBeNull();
    fireEvent.pointerDown(mark, { pointerType: 'touch' });
    expect(screen.getByRole('tooltip').textContent).toContain(expected);
    fireEvent.blur(mark);
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('keeps a tapped value visible after touch ends and dismisses it outside or on scroll', () => {
    render(<PercentileRuler percentile={42} pin="Example" label="Position" />);
    const mark = screen.getAllByRole('img')[0];
    if (mark === undefined) throw new Error('Missing percentile');
    fireEvent.pointerDown(mark, { pointerType: 'touch' });
    fireEvent.pointerLeave(mark, { pointerType: 'touch' });
    expect(screen.getByRole('tooltip')).toBeTruthy();
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('tooltip')).toBeNull();
    fireEvent.focus(mark);
    fireEvent.scroll(window);
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('keeps keyboard details anchored when focusing causes the page to scroll', async () => {
    render(<PercentileRuler percentile={42} pin="Example" label="Position" />);
    await userEvent.tab();
    expect(screen.getByRole('tooltip')).toBeTruthy();
    fireEvent.scroll(window);
    expect(screen.getByRole('tooltip')).toBeTruthy();
  });

  it('updates an open tooltip when data changes and includes the ghost comparison', () => {
    const props = { max: 3000, highlight: 1, label: 'Pay', locale: 'es' } as const;
    const { rerender } = render(<DecileBars {...props} values={[1000]} ghosts={[900]} />);
    fireEvent.focus(screen.getByRole('img'));
    expect(screen.getByRole('tooltip').textContent).toContain(euros(900));
    rerender(<DecileBars {...props} values={[2000]} ghosts={[900]} />);
    expect(screen.getByRole('tooltip').textContent).toContain(euros(2000));
  });

  it('shows both population and wealth shares in either wealth view', async () => {
    render(<WealthMorph locale="es" />);
    const mark = screen.getAllByRole('img')[0];
    if (mark === undefined) throw new Error('Missing wealth group');
    fireEvent.focus(mark);
    const details = screen.getByRole('tooltip').textContent;
    await userEvent.click(screen.getByRole('button', { name: m.wealth_view_wealth() }));
    fireEvent.focus(mark);
    expect(screen.getByRole('tooltip').textContent).toBe(details);
  });
});

describe('continuous chart cursor', () => {
  it('snaps sparse line data, reports missing values and supports keyboard navigation', () => {
    render(
      <LineChart
        series={[
          {
            key: 'one',
            label: 'One',
            tone: 'primary',
            points: [
              { x: 2000, value: 10 },
              { x: 2010, value: 20 },
            ],
          },
          { key: 'two', label: 'Two', tone: 'secondary', points: [{ x: 2000, value: 5 }] },
        ]}
        yMin={0}
        yMax={30}
        yTicks={[0, 30]}
        format={String}
        label="Series"
      />,
    );
    const chart = screen.getByRole('slider', { name: 'Series' });
    fireEvent.focus(chart);
    expect(screen.getByRole('tooltip').textContent).toContain('Two: —');
    fireEvent.keyDown(chart, { key: 'ArrowLeft' });
    expect(chart.getAttribute('aria-valuenow')).toBe('2000');
    expect(screen.getByRole('tooltip').textContent).toContain('Two: 5');
    fireEvent.keyDown(chart, { key: 'End' });
    expect(chart.getAttribute('aria-valuenow')).toBe('2010');
    fireEvent.keyDown(chart, { key: 'ArrowRight' });
    expect(chart.getAttribute('aria-valuenow')).toBe('2010');
    fireEvent.pointerMove(chart, { clientX: 40, clientY: 50 });
    expect(chart.getAttribute('aria-valuenow')).toBe('2000');
    fireEvent.keyDown(chart, { key: 'Escape' });
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('compares both tax curves at the same base with focus, keys and touch', () => {
    render(
      <RateCurveChart
        rates={[0.1, 0.2, 0.3]}
        todayRates={[0.15, 0.25, 0.35]}
        maxBase={1000}
        marker={500}
        markerRate={0.2}
        label="Rates"
        locale="es"
      />,
    );
    const chart = screen.getByRole('slider', { name: 'Rates' });
    fireEvent.focus(chart);
    expect(screen.getByRole('tooltip').textContent).toContain(formatPercent(0.25, 'es'));
    fireEvent.keyDown(chart, { key: 'Home' });
    expect(chart.getAttribute('aria-valuenow')).toBe('0');
    fireEvent.keyDown(chart, { key: 'End' });
    expect(screen.getByRole('tooltip').textContent).toContain(formatPercent(0.35, 'es'));
    fireEvent.pointerDown(chart, { pointerType: 'touch', clientX: 44, clientY: 50 });
    expect(chart.getAttribute('aria-valuenow')).toBe('0');
    fireEvent.pointerLeave(chart);
    expect(screen.queryByRole('tooltip')).toBeNull();
  });
});
