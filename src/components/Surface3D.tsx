import { memo, useCallback, useRef } from 'react';
import Plot from 'react-plotly.js';
import type { SimulationResult } from '../simulation';
import type { Translations } from '../i18n';

export interface CameraEye {
  x: number;
  y: number;
  z: number;
}

interface Surface3DProps {
  sim: SimulationResult;
  /** The Z data matrix to plot (e.g. sim.Z or sim.Zcvc) */
  zData: Float64Array[];
  /** Label for the z axis */
  zAxisTitle: string;
  t: Translations;
  cameraEye: CameraEye;
  onCameraChange?: (eye: CameraEye) => void;
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
export const DEFAULT_EYE: CameraEye = {
  x: r * Math.cos(el) * Math.sin(az),
  y: -r * Math.cos(el) * Math.cos(az),
  z: r * Math.sin(el),
};

function extractEye(eventData: Record<string, unknown>): CameraEye | null {
  const cam = eventData['scene.camera'] as
    | { eye?: { x?: number; y?: number; z?: number } }
    | undefined;
  if (cam?.eye?.x != null && cam.eye.y != null && cam.eye.z != null) {
    return { x: cam.eye.x, y: cam.eye.y, z: cam.eye.z };
  }
  return null;
}

function Surface3DInner({ sim, zData, zAxisTitle, t, cameraEye, onCameraChange }: Surface3DProps) {
  // Track the latest camera eye so re-renders always pass the current position
  // back to Plotly, preventing resets when data changes.
  const currentEyeRef = useRef(cameraEye);

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

  const onCameraChangeRef = useRef(onCameraChange);
  onCameraChangeRef.current = onCameraChange;

  // Attach plotly_relayout listener directly to the Plotly div.
  // This fires reliably on user-driven 3D camera interactions (drag end),
  // unlike onUpdate which only fires on React-driven re-renders.
  const handleInit = useCallback((_figure: unknown, graphDiv: unknown) => {
    const el = graphDiv as { on: (event: string, cb: (data: Record<string, unknown>) => void) => void };
    el.on('plotly_relayout', (eventData) => {
      const eye = extractEye(eventData);
      if (eye) {
        currentEyeRef.current = eye;
        onCameraChangeRef.current?.(eye);
      }
    });
  }, []);

  return (
    <Plot
      data={[
        {
          type: 'surface',
          x: xGrid,
          y: yGrid,
          z: zGrid,
          colorscale: 'RdBu',
          showscale: false,
        },
      ]}
      layout={{
        scene: {
          xaxis: { title: t.axisF, type: 'log' },
          yaxis: { title: t.axisRx, type: 'log' },
          zaxis: { title: zAxisTitle },
          aspectmode: 'cube',
          camera: { eye: currentEyeRef.current },
        },
        showlegend: false,
        autosize: true,
        height: 700,
        template: 'plotly_white' as unknown as Plotly.Template,
        margin: { l: 0, r: 0, t: 30, b: 0 },
      }}
      useResizeHandler
      style={{ width: '100%', maxWidth: 900 }}
      config={{ responsive: true }}
      onInitialized={handleInit}
    />
  );
}

export const Surface3D = memo(Surface3DInner);
