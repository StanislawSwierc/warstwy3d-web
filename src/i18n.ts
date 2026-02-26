import { createContext, useContext } from 'react';

export type Locale = 'en' | 'pl';

export interface Translations {
  title: string;
  description: string;
  axisF: string;
  axisRx: string;
  axisTandC: string;
  sliderLabel: string;
  sliceTitle: (rxFormatted: string) => string;
  langToggle: string;
}

const en: Translations = {
  title: 'Warstwy 3D',
  description:
    'Multi-layer dielectric model — total dissipation factor (tan δ_c) as a function of frequency (f) and damaged-layer resistance (R_x).',
  axisF: 'f [Hz]',
  axisRx: 'R_x [Ω]',
  axisTandC: 'tan δ_c',
  sliderLabel: 'R_x [Ω]:',
  sliceTitle: (rxFormatted: string) => `tan δ_c(f) at R_x = ${rxFormatted} Ω`,
  langToggle: 'PL',
};

const pl: Translations = {
  title: 'Warstwy 3D',
  description:
    'Model wielowarstwowego dielektryka — tangens kąta strat (tan δ_c) w funkcji częstotliwości (f) i rezystancji warstwy uszkodzonej (R_x).',
  axisF: 'f [Hz]',
  axisRx: 'R_x [Ω]',
  axisTandC: 'tan δ_c',
  sliderLabel: 'R_x [Ω]:',
  sliceTitle: (rxFormatted: string) => `tan δ_c(f) przy R_x = ${rxFormatted} Ω`,
  langToggle: 'EN',
};

const translations: Record<Locale, Translations> = { en, pl };

export function getTranslations(locale: Locale): Translations {
  return translations[locale];
}

export function getSavedLocale(): Locale {
  const saved = localStorage.getItem('warstwy3d-locale');
  if (saved === 'en' || saved === 'pl') return saved;
  return 'en';
}

export function saveLocale(locale: Locale): void {
  localStorage.setItem('warstwy3d-locale', locale);
}

interface LocaleContextValue {
  locale: Locale;
  t: Translations;
  toggleLocale: () => void;
}

export const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  t: en,
  toggleLocale: () => {},
});

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}
