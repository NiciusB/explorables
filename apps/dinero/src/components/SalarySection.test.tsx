import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { formatEuros } from '../format';
import { localStorageKey } from '../paraglide/runtime';
import { useSalary } from '../useSalary';
import { SalarySection } from './SalarySection';

function Harness() {
  return <SalarySection salary={useSalary()} locale="es" />;
}

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
  render(<Harness />);
}

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('SalarySection', () => {
  it('shows something interesting before any interaction', () => {
    renderSection();

    expect(inputValue('Importe')).toBe('1350 €');
    expect(screen.getByRole('radio', { name: 'Neto al mes, 12 pagas' })).toHaveProperty(
      'checked',
      true,
    );
    expect(screen.getByRole('combobox', { name: 'Dónde vives' }).textContent).toContain(
      'Comunidad de Madrid',
    );
    expect(screen.getByText(byText('1350 € netos al mes en 12 pagas'))).toBeTruthy();
    expect(screen.getByText(byText('6,50 € van a la Seguridad Social'))).toBeTruthy();
  });

  it('keeps the same salary when switching how it is expressed', async () => {
    renderSection();
    const user = userEvent.setup();
    const equivalents = screen.getByText(byText('brutos al año')).textContent;
    await user.click(screen.getByRole('radio', { name: 'Neto al mes, 14 pagas' }));
    expect(inputValue('Importe')).toBe(normalised(formatEuros((1350 * 12) / 14, 'es')));
    await user.click(screen.getByRole('radio', { name: 'Bruto al año' }));
    expect(screen.getByText('al año, antes de impuestos y cotizaciones')).toBeTruthy();
    await user.click(screen.getByRole('radio', { name: 'Neto al mes, 12 pagas' }));
    expect(inputValue('Importe')).toBe('1350 €');
    expect(screen.getByText(byText('brutos al año')).textContent).toBe(equivalents);
    await user.click(screen.getByRole('radio', { name: 'Neto al mes, 12 pagas' }));
    expect(screen.getByRole('radio', { name: 'Neto al mes, 12 pagas' })).toHaveProperty(
      'checked',
      true,
    );
  });

  it('updates the breakdown when the salary changes', () => {
    renderSection();

    fireEvent.click(screen.getByRole('button', { name: 'Menos' }));

    expect(inputValue('Importe')).toBe('1300 €');
    expect(screen.getByText(byText('1300 € netos al mes en 12 pagas'))).toBeTruthy();
  });

  it('switches to the Basque rules and asks for children under 6 there', async () => {
    renderSection();
    const user = userEvent.setup();

    await user.click(screen.getByRole('radio', { name: 'Bruto al año' }));
    const input = screen.getByLabelText('Importe');
    fireEvent.change(input, { target: { value: '30000' } });
    fireEvent.blur(input);
    await user.click(screen.getByRole('combobox', { name: 'Dónde vives' }));
    await user.click(await screen.findByRole('option', { name: 'Bizkaia (País Vasco)' }));
    await user.click(screen.getByRole('button', { name: /Tu situación personal/ }));

    expect(screen.getByText(byText('Pagas 4495 € de IRPF al año'))).toBeTruthy();
    expect(screen.getByLabelText('De ellos, menores de 6 años')).toBeTruthy();
    expect(screen.queryByLabelText('De ellos, menores de 3 años')).toBeNull();
  });
});
