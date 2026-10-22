import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { localStorageKey } from '../paraglide/runtime';
import { SalarySection } from './SalarySection';

// Intl output uses non-breaking spaces; normalise them so text matchers work.
const normalised = (text: string) => text.replaceAll(/\s/g, ' ');
const byText = (fragment: string) => (_: string, element: Element | null) =>
  element?.tagName === 'P' && normalised(element.textContent).includes(fragment);

function inputValue(label: string): string {
  const element = screen.getByLabelText(label);
  if (!(element instanceof HTMLInputElement)) throw new Error(`${label} is not an input`);
  return normalised(element.value);
}

function renderSection() {
  localStorage.setItem(localStorageKey, 'es');
  render(<SalarySection locale="es" />);
}

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('SalarySection', () => {
  it('shows something interesting before any interaction', () => {
    renderSection();

    expect(inputValue('Importe')).toBe('30.000 €');
    expect(screen.getByText(byText('Eso son 30.000 € brutos al año'))).toBeTruthy();
    expect(screen.getByText(byText('6,50 € van a la Seguridad Social'))).toBeTruthy();
    // 30,000 € crosses the zone where two phase-outs overlap.
    expect(screen.getByText(byText('Fíjate en el escalón entre'))).toBeTruthy();
  });

  it('keeps the same salary when switching how it is expressed', () => {
    renderSection();
    const equivalents = screen.getByText(byText('Eso son 30.000 € brutos al año'));
    const net12 = /(\d+\.?\d*) € netos al mes en 12 pagas/.exec(
      normalised(equivalents.textContent),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Neto al mes, 12 pagas' }));

    expect(inputValue('Importe')).toBe(`${net12?.[1] ?? ''} €`);
    expect(screen.getByText(byText('brutos al año'))).toBeTruthy();
  });

  it('updates the breakdown when the salary changes', () => {
    renderSection();

    fireEvent.click(screen.getByRole('button', { name: 'Menos' }));

    expect(screen.getByText(byText('Eso son 29.000 € brutos al año'))).toBeTruthy();
  });

  it('switches to the Basque rules and asks for children under 6 there', async () => {
    renderSection();
    const user = userEvent.setup();

    await user.click(screen.getByRole('combobox', { name: 'Dónde vives' }));
    await user.click(await screen.findByRole('option', { name: 'Bizkaia (País Vasco)' }));
    await user.click(screen.getByRole('button', { name: /Tu situación personal/ }));

    expect(screen.getByText(byText('Pagas 4495 € de IRPF al año'))).toBeTruthy();
    expect(screen.getByLabelText('De ellos, menores de 6 años')).toBeTruthy();
    expect(screen.queryByLabelText('De ellos, menores de 3 años')).toBeNull();
  });
});
