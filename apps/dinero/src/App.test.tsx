import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { App } from './App';
import { formatEuros } from './format';
import { grossFromNet } from './tax/salary';
import { salaryBreakdown } from './tax/regions';
import { DEFAULT_SITUATION } from './tax/situation';
import { localStorageKey, overwriteSetLocale, setLocale, type Locale } from './paraglide/runtime';

function renderIn(locale: Locale) {
  localStorage.setItem(localStorageKey, locale);
  render(<App />);
}

function chapter(name: string) {
  return within(screen.getByRole('region', { name }));
}

function statValue(name: string): string {
  return screen.getByText(name, { selector: 'dt' }).nextElementSibling?.textContent ?? '';
}

function editAmount(input: HTMLElement, value: number) {
  fireEvent.change(input, { target: { value: String(value) } });
  fireEvent.blur(input);
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  overwriteSetLocale(setLocale);
});

describe('App', () => {
  it('renders in the stored locale', () => {
    renderIn('es');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'Dinero y desigualdad en España',
    );

    cleanup();
    renderIn('en');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'Money and inequality in Spain',
    );
  });

  it('switches the locale from the language control', () => {
    const requested: Locale[] = [];
    overwriteSetLocale((locale) => {
      requested.push(locale);
    });
    renderIn('es');

    fireEvent.click(screen.getByRole('button', { name: 'English' }));

    expect(requested).toEqual(['en']);
  });

  it('offers every chapter without requiring a salary and personalises them after an edit', () => {
    renderIn('en');
    const salary = chapter('Your salary');
    const history = chapter('The time machine');
    const rail = within(screen.getByRole('navigation', { name: 'Chapters and the salary in use' }));
    expect(screen.getAllByRole('region')).toHaveLength(6);
    expect(salary.getByRole('link', { name: /I'd rather skip it/ }).getAttribute('href')).toBe(
      '#historia',
    );
    expect(history.getByText(/example salary's taxable base/)).toBeTruthy();
    expect(rail.getByRole('link', { name: /Example salary/ }).textContent).toContain(
      formatEuros(
        grossFromNet(16_200, (gross) => salaryBreakdown(gross, 'madrid', DEFAULT_SITUATION)),
        'en',
      ),
    );

    fireEvent.click(salary.getByRole('radio', { name: 'Gross per year' }));
    editAmount(salary.getByLabelText('Amount'), 60_000);

    expect(history.getByText(/We're taking your taxable base along/)).toBeTruthy();
    expect(rail.getByRole('link', { name: /Your salary\s*€60,000/ })).toBeTruthy();
    expect(
      chapter('Working or owning').getByLabelText('Amount per year').getAttribute('value'),
    ).toBe('€60,000');
    expect(screen.getByText('Change in your net pay')).toBeTruthy();

    fireEvent.click(salary.getByRole('button', { name: 'Back to the example' }));

    expect(history.getByText(/example salary's taxable base/)).toBeTruthy();
    expect(rail.getByRole('link', { name: /Example salary/ }).textContent).toContain(
      formatEuros(
        grossFromNet(16_200, (gross) => salaryBreakdown(gross, 'madrid', DEFAULT_SITUATION)),
        'en',
      ),
    );
  });

  it('changes historical scales and plays the salary evolution through time', () => {
    renderIn('en');
    const history = chapter('The time machine');
    const before = statValue("What the scale would take (today's euros)");
    fireEvent.click(history.getByRole('button', { name: '1992' }));
    expect(history.getByRole('button', { name: '1992' }).getAttribute('aria-pressed')).toBe('true');
    expect(history.getByText(/1992: a new law/)).toBeTruthy();
    expect(statValue("What the scale would take (today's euros)")).not.toBe(before);

    const evolution = chapter("How we've changed");
    const first = statValue('Lowest-paid decile');
    fireEvent.change(evolution.getByRole('slider', { name: 'Year' }), {
      target: { value: '2024' },
    });
    expect(statValue('Lowest-paid decile')).not.toBe(first);
    expect(evolution.getByText('2024', { selector: 'output' })).toBeTruthy();
  });

  it('updates household resources and switches between households and wealth', () => {
    renderIn('en');
    const inequality = chapter('Spain in a line');
    const income = statValue('Household net income');
    editAmount(inequality.getByLabelText("Household's other net income per year"), 30_000);
    expect(statValue('Household net income')).not.toBe(income);
    const perUnit = statValue('Per consumption unit');
    editAmount(inequality.getByLabelText('Adults in the household'), 2);
    expect(statValue('Per consumption unit')).not.toBe(perUnit);
    fireEvent.click(inequality.getByRole('button', { name: 'Wealth' }));
    expect(inequality.getByRole('button', { name: 'Wealth' }).getAttribute('aria-pressed')).toBe(
      'true',
    );
  });

  it('lets a reader compare a custom capital amount and return to their salary', () => {
    renderIn('en');
    const capital = chapter('Working or owning');
    const initial = statValue('Taxes as savings');
    editAmount(capital.getByLabelText('Amount per year'), 100_000);
    expect(statValue('Taxes as savings')).not.toBe(initial);
    fireEvent.click(chapter('Your salary').getByRole('radio', { name: 'Gross per year' }));
    editAmount(chapter('Your salary').getByLabelText('Amount'), 50_000);
    expect(capital.getByLabelText('Amount per year').getAttribute('value')).toBe('€100,000');
    fireEvent.click(capital.getByRole('button', { name: 'Use my salary' }));
    expect(capital.getByLabelText('Amount per year').getAttribute('value')).toBe('€50,000');
    expect(capital.queryByRole('button', { name: 'Use my salary' })).toBeNull();
  });

  it('recalculates the designed IRPF and keeps edited bracket inputs focused', () => {
    renderIn('en');
    fireEvent.click(chapter('Your salary').getByRole('radio', { name: 'Gross per year' }));
    editAmount(chapter('Your salary').getByLabelText('Amount'), 30_000);
    const elections = chapter('Design your IRPF');
    const initial = statValue('IRPF with your scale');
    expect(elections.queryByLabelText('Bracket 1: rate (%)')).toBeNull();
    fireEvent.click(
      elections.getByRole('button', { name: 'Advanced: exemption and bracket table' }),
    );
    const rate = elections.getByLabelText('Bracket 1: rate (%)');
    rate.focus();
    editAmount(rate, 30);
    expect(document.activeElement).toBe(rate);
    expect(statValue('IRPF with your scale')).not.toBe(initial);
    fireEvent.click(elections.getByRole('button', { name: 'Very progressive' }));
    expect(elections.getByLabelText('Bracket 5: rate (%)')).toBeTruthy();
    fireEvent.click(elections.getByRole('button', { name: '+ Add bracket' }));
    expect(elections.getByLabelText('Bracket 6: rate (%)')).toBeTruthy();
    const firstRemove = elections.getAllByRole('button', { name: 'Remove' })[0];
    if (firstRemove === undefined) throw new Error('No bracket to remove');
    fireEvent.click(firstRemove);
    expect(elections.queryByLabelText('Bracket 6: rate (%)')).toBeNull();
    fireEvent.click(elections.getByRole('button', { name: "Today's in Community of Madrid" }));
    expect(statValue('IRPF with your scale')).toBe(statValue('IRPF today'));
    expect(statValue('Change in your net pay')).toBe(formatEuros(0, 'en'));
  });

  it('redraws the tax brackets with keyboard controls and keeps presets in sync', () => {
    renderIn('en');
    const elections = chapter('Design your IRPF');
    const point = elections.getByRole('slider', { name: 'Marginal rate from €20,000' });
    expect(point.getAttribute('aria-valuenow')).toBe('20');
    fireEvent.keyDown(point, { key: 'ArrowUp' });
    expect(point.getAttribute('aria-valuenow')).toBe('21');
    fireEvent.keyDown(point, { key: 'End' });
    expect(point.getAttribute('aria-valuenow')).toBe('100');
    fireEvent.keyDown(point, { key: 'ArrowUp' });
    expect(point.getAttribute('aria-valuenow')).toBe('100');
    fireEvent.click(
      elections.getByRole('button', { name: 'Advanced: exemption and bracket table' }),
    );
    expect(elections.getByLabelText('Bracket 3: rate (%)').getAttribute('value')).toBe('100');
    fireEvent.click(elections.getByRole('button', { name: 'Flat 20%' }));
    expect(point.getAttribute('aria-valuenow')).toBe('20');
  });

  it('fits a pointer stroke into brackets and stops drawing when cancelled', () => {
    renderIn('en');
    const elections = chapter('Design your IRPF');
    const canvas = elections.getByRole('group', { name: 'Draw your IRPF' });
    Object.defineProperty(canvas, 'setPointerCapture', { value: () => {} });
    Object.defineProperty(canvas, 'getBoundingClientRect', {
      value: () => ({ left: 0, top: 0, width: 600, height: 300 }),
    });
    const pointer = (type: string, clientX: number, clientY: number, pointerId = 1) => {
      fireEvent(
        canvas,
        Object.assign(new MouseEvent(type, { bubbles: true, clientX, clientY, button: 0 }), {
          pointerId,
          isPrimary: true,
        }),
      );
    };
    pointer('pointerdown', 42, 18);
    pointer('pointermove', 564, 254, 2);
    expect(
      elections
        .getByRole('slider', { name: 'Marginal rate from €150,000' })
        .getAttribute('aria-valuenow'),
    ).toBe('20');
    pointer('pointermove', 564, 254);
    expect(
      elections
        .getByRole('slider', { name: 'Marginal rate from €0' })
        .getAttribute('aria-valuenow'),
    ).toBe('100');
    expect(
      elections
        .getByRole('slider', { name: 'Marginal rate from €20,000' })
        .getAttribute('aria-valuenow'),
    ).toBe('87');
    expect(
      elections
        .getByRole('slider', { name: 'Marginal rate from €150,000' })
        .getAttribute('aria-valuenow'),
    ).toBe('0');
    pointer('pointercancel', 564, 254);
    pointer('pointermove', 564, 18);
    expect(
      elections
        .getByRole('slider', { name: 'Marginal rate from €150,000' })
        .getAttribute('aria-valuenow'),
    ).toBe('0');
  });
});
