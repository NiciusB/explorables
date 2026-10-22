import { SegmentedControl } from './SegmentedControl';

export interface LanguageSwitcherProps<Locale extends string> {
  /** Accessible name for the control. */
  label: string;
  /** The locales to offer, in order. */
  locales: readonly Locale[];
  value: NoInfer<Locale>;
  onChange: (locale: Locale) => void;
}

/** A language's name in that language, e.g. "Español" for `es`. */
export function endonym(locale: string): string {
  const name = new Intl.DisplayNames([locale], { type: 'language' }).of(locale) ?? locale;
  return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);
}

/** Picks the page language; each option is named in its own language. */
export function LanguageSwitcher<Locale extends string>({
  label,
  locales,
  value,
  onChange,
}: LanguageSwitcherProps<Locale>) {
  const options = locales.map((locale) => ({ value: locale, label: endonym(locale) }));
  return <SegmentedControl label={label} options={options} value={value} onChange={onChange} />;
}
