import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

import { endonym, LanguageSwitcher } from './LanguageSwitcher';

afterEach(cleanup);

describe('endonym', () => {
  it('names a language in itself, capitalised', () => {
    expect(endonym('es')).toBe('Español');
    expect(endonym('en')).toBe('English');
  });
});

describe('LanguageSwitcher', () => {
  it('lists the locales in order and reports the chosen one', () => {
    const onChange = vi.fn<(locale: 'es' | 'en') => void>();
    render(
      <LanguageSwitcher label="Language" locales={['es', 'en']} value="es" onChange={onChange} />,
    );

    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual([
      'Español',
      'English',
    ]);
    fireEvent.click(screen.getByRole('button', { name: 'English' }));
    expect(onChange).toHaveBeenCalledWith('en');
  });
});
