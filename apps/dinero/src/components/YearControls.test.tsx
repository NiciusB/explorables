import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

import { localStorageKey } from '../paraglide/runtime';
import { YearPicker } from './YearPicker';
import { YearSlider } from './YearSlider';

type Kind = 'picker' | 'slider';
const YEARS = [2006, 2007, 2008];

function Control({ kind }: { kind: Kind }) {
  const [year, setYear] = useState(2006);
  return (
    <>
      {kind === 'picker' ? (
        <YearPicker label="Year" years={YEARS} value={year} onChange={setYear} />
      ) : (
        <YearSlider label="Year" from={2006} to={2008} value={year} onChange={setYear} />
      )}
      <p>{`Selected: ${String(year)}`}</p>
    </>
  );
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.useRealTimers();
});

describe.each<{ kind: Kind; interval: number }>([
  { kind: 'picker', interval: 1600 },
  { kind: 'slider', interval: 700 },
])('$kind playback', ({ kind, interval }) => {
  it('advances, pauses, stops at the end and restarts from the beginning', () => {
    vi.useFakeTimers();
    localStorage.setItem(localStorageKey, 'en');
    render(<Control kind={kind} />);

    fireEvent.click(screen.getByRole('button', { name: /Play/ }));
    act(() => {
      vi.advanceTimersByTime(interval);
    });
    expect(screen.getByText('Selected: 2007')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Pause/ }));
    act(() => {
      vi.advanceTimersByTime(interval * 2);
    });
    expect(screen.getByText('Selected: 2007')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Play/ }));
    act(() => {
      vi.advanceTimersByTime(interval);
    });
    expect(screen.getByText('Selected: 2008')).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(interval);
    });
    expect(screen.getByRole('button', { name: /Play/ }).getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(screen.getByRole('button', { name: /Play/ }));
    expect(screen.getByText('Selected: 2006')).toBeTruthy();
  });

  it('stops playback on manual selection and cleans up its timer', () => {
    vi.useFakeTimers();
    localStorage.setItem(localStorageKey, 'en');
    const view = render(<Control kind={kind} />);
    fireEvent.click(screen.getByRole('button', { name: /Play/ }));
    if (kind === 'picker') fireEvent.click(screen.getByRole('button', { name: '2008' }));
    else fireEvent.change(screen.getByRole('slider'), { target: { value: '2008' } });
    expect(screen.getByRole('button', { name: /Play/ }).getAttribute('aria-pressed')).toBe('false');
    act(() => {
      vi.advanceTimersByTime(interval);
    });
    expect(screen.getByText('Selected: 2008')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Play/ }));
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
