import Plot from 'react-plotly.js';
import type { SimulationResult } from '../simulation';
import type { Translations } from '../i18n';

interface Slice2DProps {
  sim: SimulationResult;
  rxIndex: number;
  t: Translations;
  onRxIndexChange: (index: number) => void;
}

/** Format a number in engineering notation (e.g. 1.0 MΩ). */
function formatEngineering(value: number): string {
  const prefixes: [number, string][] = [
    [1e12, 'T'],
    [1e9, 'G'],
    [1e6, 'M'],
    [1e3, 'k'],
    [1, ''],
    [1e-3, 'm'],
    [1e-6, 'μ'],
    [1e-9, 'n'],
  ];
  for (const [scale, prefix] of prefixes) {
    if (value >= scale) {
      const scaled = value / scale;
      // Use up to 2 decimal places, trim trailing zeros
      return `${parseFloat(scaled.toFixed(2))} ${prefix}`;
    }
  }
  return value.toExponential(2);
}

export function Slice2D({ sim, rxIndex, t, onRxIndexChange }: Slice2DProps) {
  const rxActual = sim.rxVec[rxIndex];
  const rxLabel = formatEngineering(rxActual);

  // Extract the row for the selected R_x
  const yData: number[] = [];
  for (let fi = 0; fi < sim.fVec.length; fi++) {
    yData.push(sim.Z[rxIndex][fi]);
  }

  return (
    <div>
      <div style={{ margin: '16px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <label htmlFor="rx-slider" style={{ fontWeight: 600 }}>
          {t.sliderLabel}
        </label>
        <input
          id="rx-slider"
          type="range"
          min={0}
          max={sim.rxVec.length - 1}
          value={rxIndex}
          onChange={(e) => onRxIndexChange(Number(e.target.value))}
          style={{ flex: 1, maxWidth: 400 }}
        />
        <span style={{ minWidth: 100, fontFamily: 'monospace' }}>{rxLabel}Ω</span>
      </div>
      <Plot
        data={[
          {
            type: 'scatter',
            mode: 'lines',
            x: Array.from(sim.fVec),
            y: yData,
          },
        ]}
        layout={{
          xaxis: { title: t.axisF, type: 'log' },
          yaxis: { title: t.axisTandC },
          title: t.sliceTitle(rxLabel),
          width: 900,
          height: 500,
          template: 'plotly_white' as unknown as Plotly.Template,
          margin: { t: 50, b: 60, l: 70, r: 30 },
        }}
        config={{ responsive: true }}
      />
    </div>
  );
}
