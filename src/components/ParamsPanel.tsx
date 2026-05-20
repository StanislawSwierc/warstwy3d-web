import { useState, useCallback } from 'react';
import type { SimulationParams } from '../simulation';
import type { Translations } from '../i18n';

interface ParamsPanelProps {
  params: SimulationParams;
  onParamsChange: (params: SimulationParams) => void;
  t: Translations;
}

/** Format a number for display, using exponential notation for very large/small values. */
function formatValue(v: number): string {
  if (Number.isInteger(v) && Math.abs(v) < 1e6) return String(v);
  return v.toExponential();
}

type ParamKey = keyof SimulationParams;

const PARAM_KEYS: ParamKey[] = ['n', 'k', 'Rz', 'Cc'];

function labelFor(key: ParamKey, t: Translations): string {
  switch (key) {
    case 'n': return t.paramN;
    case 'k': return t.paramK;
    case 'Rz': return t.paramRz;
    case 'Cc': return t.paramCc;
  }
}

function unitFor(key: ParamKey, t: Translations): string {
  switch (key) {
    case 'Rz': return t.paramRzUnit;
    case 'Cc': return t.paramCcUnit;
    default: return '';
  }
}

function validate(key: ParamKey, value: number, params: SimulationParams): boolean {
  if (!Number.isFinite(value) || value <= 0) return false;
  if (key === 'n') return Number.isInteger(value) && value >= 2;
  if (key === 'k') return Number.isInteger(value) && value >= 1 && value < params.n;
  return true;
}

export function ParamsPanel({ params, onParamsChange, t }: ParamsPanelProps) {
  // Local draft strings for each input
  const [drafts, setDrafts] = useState<Record<ParamKey, string>>(() => ({
    n: formatValue(params.n),
    k: formatValue(params.k),
    Rz: formatValue(params.Rz),
    Cc: formatValue(params.Cc),
  }));

  const [errors, setErrors] = useState<Record<ParamKey, boolean>>({
    n: false, k: false, Rz: false, Cc: false,
  });

  const handleChange = useCallback((key: ParamKey, raw: string) => {
    setDrafts(prev => ({ ...prev, [key]: raw }));

    const parsed = Number(raw);
    const nextParams = { ...params, [key]: parsed };
    const valid = validate(key, parsed, nextParams);

    setErrors(prev => ({ ...prev, [key]: !valid }));

    if (valid) {
      // Re-validate k against new n when n changes
      if (key === 'n') {
        const kValid = validate('k', params.k, nextParams);
        setErrors(prev => ({ ...prev, [key]: false, k: !kValid }));
        if (kValid) onParamsChange(nextParams);
      } else {
        onParamsChange(nextParams);
      }
    }
  }, [params, onParamsChange]);

  const stepN = useCallback((delta: number) => {
    const next = params.n + delta;
    handleChange('n', String(next));
  }, [params.n, handleChange]);

  const stepK = useCallback((delta: number) => {
    const next = params.k + delta;
    handleChange('k', String(next));
  }, [params.k, handleChange]);

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '6px 8px',
    fontSize: 14,
    fontFamily: 'monospace',
    border: `1.5px solid ${hasError ? '#d32f2f' : '#ccc'}`,
    borderRadius: 4,
    boxSizing: 'border-box',
    outline: 'none',
  });

  const stepBtnStyle: React.CSSProperties = {
    width: 28,
    padding: 0,
    fontSize: 12,
    lineHeight: 1,
    cursor: 'pointer',
    border: '1.5px solid #ccc',
    background: '#f5f5f5',
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  return (
    <fieldset style={{
      border: '1px solid #ddd',
      borderRadius: 8,
      padding: '12px 16px',
      marginBottom: 24,
      background: '#fff',
      maxWidth: 960,
      boxSizing: 'border-box',
    }}>
      <legend style={{ fontWeight: 600, fontSize: 15, padding: '0 6px' }}>
        {t.paramsHeader}
      </legend>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '12px 16px',
      }}>
        {PARAM_KEYS.map(key => (
          <label key={key} style={{ display: 'block', fontSize: 13, color: '#444' }}>
            <span style={{ display: 'block', marginBottom: 3 }}>{labelFor(key, t)}</span>
            {(key === 'n' || key === 'k') ? (
              <div style={{ display: 'flex', gap: 0 }}>
                <input
                  type="text"
                  value={drafts[key]}
                  onChange={e => handleChange(key, e.target.value)}
                  style={{ ...inputStyle(errors[key]), borderRadius: '4px 0 0 4px', borderRight: 'none' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <button
                    type="button"
                    onClick={() => (key === 'n' ? stepN : stepK)(1)}
                    style={{ ...stepBtnStyle, flex: 1, borderRadius: '0 4px 0 0', borderBottom: 'none' }}
                    aria-label={`Increase ${key}`}
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => (key === 'n' ? stepN : stepK)(-1)}
                    style={{ ...stepBtnStyle, flex: 1, borderRadius: '0 0 4px 0' }}
                    aria-label={`Decrease ${key}`}
                  >
                    ▼
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="text"
                  value={drafts[key]}
                  onChange={e => handleChange(key, e.target.value)}
                  style={{ ...inputStyle(errors[key]), flex: 1 }}
                />
                <span style={{ color: '#64748b', fontSize: 13, whiteSpace: 'nowrap' }}>
                  {unitFor(key, t)}
                </span>
              </div>
            )}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
