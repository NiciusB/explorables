import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { localStorageKey } from '../paraglide/runtime';
import { CapitalExamples } from './CapitalExamples';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('CapitalExamples', () => {
  it('compares the official annual minimum wage with illustrative rental and dividend income', () => {
    localStorage.setItem(localStorageKey, 'en');
    render(<CapitalExamples locale="en" />);

    expect(screen.getByText('€17,094')).toBeDefined();
    expect(screen.getAllByText('€28,800')).toHaveLength(2);
    expect(screen.getByText(/equivalent of 1.7 annual minimum wages/)).toBeDefined();
    expect(screen.getByText(/general IRPF base/).textContent).toContain(
      'Dividends go into the savings base',
    );
    expect(screen.getByTitle(/Real Decreto 126\/2026/).getAttribute('href')).toContain('3815');
  });

  it('recalculates both ownership examples while keeping the wage fixed when rent changes', () => {
    localStorage.setItem(localStorageKey, 'en');
    render(<CapitalExamples locale="en" />);
    const input = screen.getByLabelText('Monthly rent per flat (illustrative)');
    fireEvent.change(input, { target: { value: '1000' } });
    fireEvent.blur(input);

    expect(screen.getAllByText('€36,000')).toHaveLength(2);
    expect(screen.getByText('€17,094')).toBeDefined();
    expect(screen.getByText(/equivalent of 2.1 annual minimum wages/)).toBeDefined();

    fireEvent.change(input, { target: { value: '0' } });
    fireEvent.blur(input);
    expect(screen.getByText(/equivalent of 0.0 annual minimum wages/)).toBeDefined();
  });

  it('renders Spanish copy and amounts', () => {
    localStorage.setItem(localStorageKey, 'es');
    render(<CapitalExamples locale="es" />);

    expect(screen.getByRole('heading', { name: 'Tres pisos en alquiler' })).toBeDefined();
    expect(screen.getByText(/equivalente a 1,7 sueldos mínimos anuales/)).toBeDefined();
    expect(screen.getAllByText(/28.800/)).toHaveLength(2);
  });
});
