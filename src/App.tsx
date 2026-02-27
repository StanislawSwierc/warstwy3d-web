import { useState, useMemo, useCallback } from 'react';
import { LocaleContext, getSavedLocale, saveLocale, getTranslations } from './i18n';
import type { Locale } from './i18n';
import { runSimulation } from './simulation';
import { Surface3D } from './components/Surface3D';
import { Slice2D } from './components/Slice2D';

export default function App() {
  const [locale, setLocale] = useState<Locale>(getSavedLocale);
  const [rxIndex, setRxIndex] = useState(50); // ~middle of logspace

  const t = useMemo(() => getTranslations(locale), [locale]);

  const toggleLocale = useCallback(() => {
    setLocale((prev) => {
      const next = prev === 'en' ? 'pl' : 'en';
      saveLocale(next);
      return next;
    });
  }, []);

  // Run simulation once (pure computation, deterministic)
  const sim = useMemo(() => runSimulation(), []);

  return (
    <LocaleContext.Provider value={{ locale, t, toggleLocale }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px 16px', fontFamily: 'system-ui, sans-serif' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ margin: 0 }}>{t.title}</h1>
          <button
            onClick={toggleLocale}
            style={{
              padding: '6px 16px',
              fontSize: 14,
              cursor: 'pointer',
              border: '1px solid #ccc',
              borderRadius: 4,
              background: '#f5f5f5',
            }}
          >
            {t.langToggle}
          </button>
        </header>

        <p style={{ color: '#555', lineHeight: 1.5, marginBottom: 24 }}>{t.description}</p>

        <Surface3D sim={sim} zData={sim.Z} zAxisTitle={t.axisTandC} t={t} />

        <Surface3D sim={sim} zData={sim.Zcvc} zAxisTitle={t.axisCvc} t={t} />

        <Slice2D sim={sim} rxIndex={rxIndex} t={t} onRxIndexChange={setRxIndex} />
      </div>
    </LocaleContext.Provider>
  );
}
