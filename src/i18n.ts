import { createContext, useContext } from 'react';
import descriptionEn from './content/description.en.md';
import descriptionPl from './content/description.pl.md';

export type Locale = 'en' | 'pl';

export interface Translations {
  title: string;
  description: string;
  axisF: string;
  axisRx: string;
  axisTandC: string;
  axisCvc: string;
  sliderLabel: string;
  sliceTitle: (rxFormatted: string) => string;
  sliceCvcTitle: (rxFormatted: string) => string;
  langToggle: string;
  paramsHeader: string;
  paramN: string;
  paramK: string;
  paramRz: string;
  paramRzUnit: string;
  paramCc: string;
  paramCcUnit: string;
  bannerText: string;
  bannerContact: string;
}

const en: Translations = {
  title: 'Bushing Shorted Layer',
  description: descriptionEn,
  axisF: 'Frequency [Hz]',
  axisRx: 'Layer Resistance [Ω]',
  axisTandC: 'tan δ',
  axisCvc: 'Capacitance [F]',
  sliderLabel: 'R_x [Ω]:',
  sliceTitle: (rxFormatted: string) => `tan δ_c(f) at R_x = ${rxFormatted} Ω`,
  sliceCvcTitle: (rxFormatted: string) => `C_vc(f) at R_x = ${rxFormatted} Ω`,
  langToggle: 'PL',
  paramsHeader: 'Parameters',
  paramN: 'Number of layers',
  paramK: 'Damaged layers',
  paramRz: 'Nominal resistance',
  paramRzUnit: 'Ω',
  paramCc: 'Bushing capacitance',
  paramCcUnit: 'F',
  bannerText: 'The presented charts are based on an equivalent circuit model of a transformer bushing, which has been empirically validated.',
  bannerContact: 'If you are interested in applying this model or would like more detailed information, please feel free to get in touch:',
};

const pl: Translations = {
  title: 'Izolator Przepustowy: Zwarta Warstwa',
  description: descriptionPl,
  axisF: 'Częstotliwość [Hz]',
  axisRx: 'Rezystancja warstwy [Ω]',
  axisTandC: 'tan δ',
  axisCvc: 'Pojemność [F]',
  sliderLabel: 'R_x [Ω]:',
  sliceTitle: (rxFormatted: string) => `tan δ_c(f) przy R_x = ${rxFormatted} Ω`,
  sliceCvcTitle: (rxFormatted: string) => `C_vc(f) przy R_x = ${rxFormatted} Ω`,
  langToggle: 'EN',
  paramsHeader: 'Parametry',
  paramN: 'Liczba warstw',
  paramK: 'Warstwy uszkodzone',
  paramRz: 'Rezystancja znamionowa',
  paramRzUnit: 'Ω',
  paramCc: 'Pojemność izolatora',
  paramCcUnit: 'F',
  bannerText: 'Prezentowane wykresy zostały opracowane w oparciu o model układu zastępczego izolatora przepustowego, którego skuteczność potwierdzono w praktycznych badaniach.',
  bannerContact: 'Jeśli są Państwo zainteresowani wykorzystaniem tego modelu lub chcą uzyskać szczegółowe informacje, serdecznie zapraszam do kontaktu:',
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
