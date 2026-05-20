import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { LocaleContext, getSavedLocale, saveLocale, getTranslations } from './i18n';
import type { Locale } from './i18n';
import { runSimulation, DEFAULT_PARAMS } from './simulation';
import type { SimulationParams } from './simulation';
import { Surface3D, DEFAULT_EYE } from './components/Surface3D';
import type { CameraEye } from './components/Surface3D';
import { Slice2D } from './components/Slice2D';
import { ParamsPanel } from './components/ParamsPanel';

function parseCameraEye(sp: URLSearchParams, key: string): CameraEye {
  const raw = sp.get(key);
  if (!raw) return { ...DEFAULT_EYE };
  const parts = raw.split(',').map(Number);
  if (parts.length === 3 && parts.every(Number.isFinite)) {
    return { x: parts[0], y: parts[1], z: parts[2] };
  }
  return { ...DEFAULT_EYE };
}

function parseHashState() {
  const hash = window.location.hash.slice(1);
  const sp = hash ? new URLSearchParams(hash) : new URLSearchParams();

  const params = { ...DEFAULT_PARAMS };
  for (const key of ['n', 'k', 'Rz', 'Cc'] as const) {
    const raw = sp.get(key);
    if (raw != null) {
      const v = Number(raw);
      if (Number.isFinite(v) && v > 0) {
        params[key] = v;
      }
    }
  }

  const cam1 = parseCameraEye(sp, 'cam1');
  const cam2 = parseCameraEye(sp, 'cam2');

  return { params, cam1, cam2 };
}

function formatEye(eye: CameraEye): string {
  // Round to 2 decimal places to keep URLs compact
  return `${+eye.x.toFixed(2)},${+eye.y.toFixed(2)},${+eye.z.toFixed(2)}`;
}

function writeHash(params: SimulationParams, cam1: CameraEye, cam2: CameraEye): void {
  const sp = new URLSearchParams();
  sp.set('n', String(params.n));
  sp.set('k', String(params.k));
  sp.set('Rz', String(params.Rz));
  sp.set('Cc', String(params.Cc));
  sp.set('cam1', formatEye(cam1));
  sp.set('cam2', formatEye(cam2));
  window.history.replaceState(null, '', '#' + sp.toString());
}

export default function App() {
  const [locale, setLocale] = useState<Locale>(getSavedLocale);

  const initial = useMemo(() => parseHashState(), []);
  const [rxIndex, setRxIndex] = useState(0);
  const [params, setParams] = useState<SimulationParams>(initial.params);
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const cam1Ref = useRef<CameraEye>(initial.cam1);
  const cam2Ref = useRef<CameraEye>(initial.cam2);
  const hashTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Debounced hash write for camera changes (500ms)
  const scheduleHashWrite = useCallback(() => {
    clearTimeout(hashTimerRef.current);
    hashTimerRef.current = setTimeout(() => {
      writeHash(paramsRef.current, cam1Ref.current, cam2Ref.current);
    }, 500);
  }, []);

  // Clean up timer on unmount
  useEffect(() => () => clearTimeout(hashTimerRef.current), []);

  const t = useMemo(() => getTranslations(locale), [locale]);

  const toggleLocale = useCallback(() => {
    setLocale((prev) => {
      const next = prev === 'en' ? 'pl' : 'en';
      saveLocale(next);
      return next;
    });
  }, []);

  const handleParamsChange = useCallback((next: SimulationParams) => {
    setParams(next);
    writeHash(next, cam1Ref.current, cam2Ref.current);
  }, []);

  const handleCam1Change = useCallback((eye: CameraEye) => {
    cam1Ref.current = eye;
    scheduleHashWrite();
  }, [scheduleHashWrite]);

  const handleCam2Change = useCallback((eye: CameraEye) => {
    cam2Ref.current = eye;
    scheduleHashWrite();
  }, [scheduleHashWrite]);

  const sim = useMemo(
    () => runSimulation(params),
    [params.n, params.k, params.Rz, params.Cc],
  );

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

        <div style={{
          marginBottom: 24,
          padding: '20px 24px',
          background: '#f0f4f8',
          borderLeft: '4px solid #3b82f6',
          borderRadius: 4,
          lineHeight: 1.6,
          color: '#333',
        }}>
          <p style={{ margin: '0 0 8px' }}>{t.bannerText}</p>
          <p style={{ margin: 0 }}>
            {t.bannerContact}{' '}
            <a href="mailto:jbuchacz@gmail.com" style={{ color: '#3b82f6' }}>jbuchacz@gmail.com</a>
          </p>
        </div>

        <div
          style={{ color: '#555', lineHeight: 1.5, marginBottom: 24 }}
          dangerouslySetInnerHTML={{ __html: t.description }}
        />

        <ParamsPanel params={params} onParamsChange={handleParamsChange} t={t} />

        <div style={{
          background: '#fff',
          borderRadius: 16,
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          marginBottom: 24,
        }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{t.paramsHeader}</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 16,
              marginTop: 16,
              color: '#334155',
            }}>
              <div>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>{t.paramN}</div>
                <div style={{ marginTop: 4, fontWeight: 600 }}>{params.n}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>{t.paramK}</div>
                <div style={{ marginTop: 4, fontWeight: 600 }}>{params.k}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>{t.paramRz}</div>
                <div style={{ marginTop: 4, fontWeight: 600 }}>{params.Rz.toExponential(3)} Ω</div>
              </div>
              <div>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>{t.paramCc}</div>
                <div style={{ marginTop: 4, fontWeight: 600 }}>{params.Cc.toExponential(3)} F</div>
              </div>
            </div>
          </div>

          <div style={{ padding: '24px', background: '#fff', display: 'grid', gap: 24 }}>
            <Surface3D sim={sim} zData={sim.Z} zAxisTitle={t.axisTandC} t={t}
              cameraEye={initial.cam1} onCameraChange={handleCam1Change} />

            <Surface3D sim={sim} zData={sim.Zcvc} zAxisTitle={t.axisCvc} t={t}
              cameraEye={initial.cam2} onCameraChange={handleCam2Change} />
          </div>
          <div style={{ height: 1, background: '#e5e7eb', margin: '0 24px' }} />
          <div style={{ padding: '24px', background: '#fff' }}>
            <Slice2D sim={sim} rxIndex={rxIndex} t={t} onRxIndexChange={setRxIndex} />
          </div>
        </div>
      </div>
    </LocaleContext.Provider>
  );
}
