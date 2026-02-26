import { memo, useState, useMemo } from 'react';
import Plot from 'react-plotly.js';
import type { SimulationResult } from '../simulation';
import type { Translations } from '../i18n';

interface Surface3DProps {
  sim: SimulationResult;
  t: Translations;
}

/**
 * Camera eye coordinates converted from MATLAB view([az=11, el=32]):
 *   plotly_x = r * cos(el) * sin(az)
 *   plotly_y = -r * cos(el) * cos(az)
 *   plotly_z = r * sin(el)
 */
const az = (11 * Math.PI) / 180;
const el = (32 * Math.PI) / 180;
const r = 2.5;
const eye = {
  x: r * Math.cos(el) * Math.sin(az),
  y: -r * Math.cos(el) * Math.cos(az),
  z: r * Math.sin(el),
};

const isTouchDevice = () =>
  'ontouchstart' in window || navigator.maxTouchPoints > 0;

function Surface3DInner({ sim, t }: Surface3DProps) {
  const touch = useMemo(isTouchDevice, []);
  const [interactive, setInteractive] = useState(!touch);

  // Build x/y meshgrid arrays for Plotly surface
  const xGrid: number[][] = [];
  const yGrid: number[][] = [];
  const zGrid: number[][] = [];

  for (let ri = 0; ri < sim.rxVec.length; ri++) {
    const xRow: number[] = [];
    const yRow: number[] = [];
    const zRow: number[] = [];
    for (let fi = 0; fi < sim.fVec.length; fi++) {
      xRow.push(sim.fVec[fi]);
      yRow.push(sim.rxVec[ri]);
      zRow.push(sim.Z[ri][fi]);
    }
    xGrid.push(xRow);
    yGrid.push(yRow);
    zGrid.push(zRow);
  }

  return (
    <div style={{ position: 'relative' }}>
      {touch && (
        <button
          onClick={() => setInteractive((v) => !v)}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 10,
            padding: '6px 14px',
            fontSize: 13,
            cursor: 'pointer',
            border: '1px solid #ccc',
            borderRadius: 4,
            background: interactive ? '#e8f0fe' : '#f5f5f5',
            fontWeight: interactive ? 600 : 400,
          }}
        >
          {interactive ? t.lockPlot : t.enableRotation}
        </button>
      )}
      <Plot
        data={[
          {
            type: 'surface',
            x: xGrid,
            y: yGrid,
            z: zGrid,
            colorscale: 'Jet',
            showscale: true,
          },
        ]}
        layout={{
          scene: {
            xaxis: { title: t.axisF, type: 'log' },
            yaxis: { title: t.axisRx, type: 'log' },
            zaxis: { title: t.axisTandC },
            aspectmode: 'cube',
            camera: { eye },
          },
          width: 900,
          height: 700,
          template: 'plotly_white' as unknown as Plotly.Template,
          margin: { l: 0, r: 0, t: 30, b: 0 },
        }}
        config={{
          responsive: true,
          staticPlot: !interactive,
          scrollZoom: interactive,
        }}
      />
    </div>
  );
}

export const Surface3D = memo(Surface3DInner);
