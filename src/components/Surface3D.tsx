import { memo } from 'react';
import Plot from 'react-plotly.js';
import type { SimulationResult } from '../simulation';
import type { Translations } from '../i18n';

interface Surface3DProps {
  sim: SimulationResult;
  /** The Z data matrix to plot (e.g. sim.Z or sim.Zcvc) */
  zData: Float64Array[];
  /** Label for the z axis */
  zAxisTitle: string;
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

function Surface3DInner({ sim, zData, zAxisTitle, t }: Surface3DProps) {
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
      zRow.push(zData[ri][fi]);
    }
    xGrid.push(xRow);
    yGrid.push(yRow);
    zGrid.push(zRow);
  }

  return (
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
          zaxis: { title: zAxisTitle },
          aspectmode: 'cube',
          camera: { eye },
        },
        autosize: true,
        height: 700,
        template: 'plotly_white' as unknown as Plotly.Template,
        margin: { l: 0, r: 0, t: 30, b: 0 },
      }}
      useResizeHandler
      style={{ width: '100%', maxWidth: 900 }}
      config={{ responsive: true }}
    />
  );
}

export const Surface3D = memo(Surface3DInner);
