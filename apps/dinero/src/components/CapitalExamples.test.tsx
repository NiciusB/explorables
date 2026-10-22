import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { formatEuros, formatPercent } from '../format';
import { localStorageKey } from '../paraglide/runtime';
import type { Profile } from '../profile';
import { commonIrpf } from '../tax/irpf';
import { DEFAULT_SITUATION } from '../tax/situation';
import { CapitalExamples } from './CapitalExamples';

const profile: Profile = {
  gross: 30_000,
  net: 24_000,
  taxableBase: 26_000,
  marginalRate: 0.3,
  region: 'madrid',
  situation: DEFAULT_SITUATION,
  personal: false,
};

function example(title: string) {
  return within(screen.getByRole('figure', { name: `Where the income goes: ${title}` }));
}

function editFlats(value: number) {
  const input = screen.getByLabelText('Number of rented flats');
  fireEvent.change(input, { target: { value: String(value) } });
  fireEvent.blur(input);
}

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('CapitalExamples', () => {
  it('compares minimum wage, three flats and a salary matching their gross rent', () => {
    localStorage.setItem(localStorageKey, 'en');
    render(<CapitalExamples profile={profile} locale="en" />);
    expect(screen.getByText('€17,094')).toBeDefined();
    expect(screen.getAllByText('€36,000')).toHaveLength(2);
    expect(screen.getByText(/2.1 annual minimum wages/)).toBeDefined();
    expect(screen.queryByText('Living on dividends')).toBeNull();
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    expect(screen.getByTitle(/Real Decreto 126\/2026/).getAttribute('href')).toContain('3815');
    const landlord = example('Flats to rent out: 3');
    expect(landlord.getByText('1.6% of gross in IRPF')).toBeDefined();
    expect(landlord.getByText('€3,600')).toBeDefined();
    expect(landlord.getByText('€1,800')).toBeDefined();
    expect(landlord.getByText('€2,700')).toBeDefined();
    expect(landlord.getByText('€900')).toBeDefined();
    expect(landlord.getByText('€26,414')).toBeDefined();
    const salary = commonIrpf(36_000, 'madrid', DEFAULT_SITUATION);
    expect(
      example('The same income, earned at work').getByText(
        `${formatPercent(salary.irpf / 36_000, 'en')} of gross in IRPF`,
      ),
    ).toBeDefined();
  });

  it('updates the matching salary, expenses and IRPF when only the flat count changes', () => {
    localStorage.setItem(localStorageKey, 'en');
    render(<CapitalExamples profile={profile} locale="en" />);
    editFlats(5);
    expect(screen.getAllByText('€60,000')).toHaveLength(2);
    expect(screen.getByText('€17,094')).toBeDefined();
    expect(screen.getByText(/Each home rents for €1,000/)).toBeDefined();
    expect(example('Flats to rent out: 5').getByText('€6,000')).toBeDefined();
    const salary = commonIrpf(60_000, 'madrid', DEFAULT_SITUATION);
    expect(
      example('The same income, earned at work').getByText(formatEuros(salary.net, 'en')),
    ).toBeDefined();
    editFlats(1);
    expect(screen.getAllByText('€12,000')).toHaveLength(2);
    expect(example('Flats to rent out: 1').getByText('0% of gross in IRPF')).toBeDefined();
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
  });

  it('updates all three tax calculations when personal circumstances change', () => {
    localStorage.setItem(localStorageKey, 'en');
    const { rerender } = render(<CapitalExamples profile={profile} locale="en" />);
    expect(example('Flats to rent out: 3').getByText('1.6% of gross in IRPF')).toBeDefined();
    rerender(
      <CapitalExamples
        profile={{
          ...profile,
          situation: {
            ...DEFAULT_SITUATION,
            children: 3,
            childrenShared: false,
          },
        }}
        locale="en"
      />,
    );
    expect(example('Flats to rent out: 3').getByText('0% of gross in IRPF')).toBeDefined();
  });

  it('shows rental costs and their percentages on focus and tap', () => {
    localStorage.setItem(localStorageKey, 'en');
    render(<CapitalExamples profile={profile} locale="en" />);
    const repairs = example('Flats to rent out: 3').getByRole('img', {
      name: /Repairs and upkeep/,
    });
    fireEvent.focus(repairs);
    expect(screen.getByRole('tooltip').textContent).toContain('€3,600');
    expect(screen.getByRole('tooltip').textContent).toContain('10%');
    fireEvent.blur(repairs);
    fireEvent.pointerDown(repairs, { pointerType: 'touch' });
    expect(screen.getByRole('tooltip').textContent).toContain('Repairs and upkeep');
  });

  it('renders Spanish copy and amounts', () => {
    localStorage.setItem(localStorageKey, 'es');
    render(<CapitalExamples profile={profile} locale="es" />);
    expect(screen.getByRole('heading', { name: 'Pisos en alquiler: 3' })).toBeDefined();
    expect(screen.getByText(/2,1 sueldos mínimos anuales/)).toBeDefined();
    expect(screen.getAllByText(/36.000/)).toHaveLength(3);
    expect(screen.getByLabelText('Número de pisos en alquiler')).toBeDefined();
  });
});
