# Project Overview

Warstwy3D-web is a TypeScript + React + Plotly.js interactive web application that simulates a multi-layer dielectric (bushing) model. It computes the total dissipation factor (tan δ_c) and the equivalent capacitance (C_vc) as a function of frequency (f) and damaged-layer resistance (R_x).

Originally written in MATLAB (`Warstwy3D.m`), then translated to Python (NumPy + Plotly in a Jupyter notebook at `../Warstwy3D.ipynb`), now a web app deployed on GitHub Pages.

**Live site:** https://stanislawswierc.github.io/warstwy3d-web/
**Repo:** https://github.com/StanislawSwierc/warstwy3d-web

# Tech Stack

- **Vite** (build tool, `base: './'` for GitHub Pages)
- **React 18** + **TypeScript**
- **Plotly.js** (`plotly.js-dist-min` + `react-plotly.js`) for 3D surface and 2D line charts
- **GitHub Actions** deploys `dist/` to GitHub Pages on push to `main`

# Project Structure

```
src/
  main.tsx              # React entry point
  App.tsx               # Root component: layout, locale state, R_x slider state,
                        # simulation params state with URL hash persistence
  simulation.ts         # Pure computation (no React/DOM). logspace(), runSimulation()
                        # Accepts SimulationParams (n, k, Rz, Cz). Returns Z and Zcvc matrices
  i18n.ts               # EN/PL translations, React context, localStorage persistence
  components/
    Surface3D.tsx       # Reusable 3D surface plot (accepts zData + zAxisTitle props)
    Slice2D.tsx         # 2D cross-section plot with R_x slider
    ParamsPanel.tsx     # Editable simulation parameters (n, k, Rz, Cz) with validation
```

# Commands

- `npm run dev` — local dev server
- `npm run build` — type-check + production build
- `npm run preview` — preview production build locally

# Key Design Decisions

- **Complex numbers**: Inline real/imaginary decomposition in `simulation.ts` (no library). The formula `Z_i = R/(1+jωRC)` is split into real and imaginary parts algebraically.
- **U_c cancels out**: The voltage U_c (140V) cancels in the tan δ_c formula, so it's not used in computation. See comment in `simulation.ts`.
- **Two 3D plots**: The first shows tan δ_c(f, R_x), the second shows C_vc(f, R_x). Both use the same reusable `Surface3D` component with `zData` and `zAxisTitle` props.
- **Responsive plots**: Plots use `autosize: true`, `useResizeHandler`, and `style={{ width: '100%', maxWidth: 900 }}` — they fill the screen on mobile and cap at 900px on desktop.
- **No touch overlay**: Earlier iterations used a transparent overlay div to block touch events on mobile. This was removed — the 3D plots are fully interactive on all devices. Do NOT use Plotly's `staticPlot` config for 3D — it disables WebGL and the surface won't render.
- **i18n**: Simple object map with React context. Two locales: `en` and `pl`. Locale persisted in `localStorage`.
- **Camera angle**: Converted from MATLAB `view([11, 32])` to Plotly camera eye coordinates using spherical-to-cartesian conversion.
- **Colorscale**: RdBu
- **URL param persistence**: Simulation parameters (n, k, Rz, Cz) and 3D camera positions (cam1, cam2) are stored in the URL hash (`#n=16&k=1&Rz=6.8e9&Cz=1.7e-9&cam1=0.4,-2.08,1.32&cam2=...`) so parameter sets and viewpoints can be shared as links. Hash is used instead of query params because GitHub Pages serves static files and hash changes don't trigger server requests. Param changes write the hash immediately; camera changes are debounced (500ms) via `replaceState` to avoid polluting browser history.
- **Simulation params UI**: `ParamsPanel` uses `type="text"` inputs (not `type="number"`) to support scientific notation (e.g. `6.8e9`). Integer params (n, k) have ▲/▼ spinner buttons. Validation rejects NaN, non-positive, non-integer (for n/k), and enforces `n >= 2`, `k >= 1`, `k < n`.
- **3D camera persistence**: Capturing 3D camera state from react-plotly.js requires attaching a native `plotly_relayout` event listener directly to the Plotly div via `onInitialized`. Do NOT use react-plotly.js's `onUpdate` prop — it only fires on React-driven re-renders (`Plotly.react()`), not on user-driven interactions like camera rotation. Do NOT use react-plotly.js's `onRelayout` prop — it doesn't reliably relay the event data for 3D scenes. The `plotly_relayout` event sends 3D camera data under the key `"scene.camera"` (a single flat string key with a dot) containing `{ eye: { x, y, z } }`. To prevent camera resets when simulation data changes, store the latest camera eye in a `useRef` (`currentEyeRef`) and always pass `currentEyeRef.current` as the `camera.eye` in the layout. This way, when `Plotly.react()` diffs the old vs new layout, the camera value hasn't changed and Plotly preserves the user's current viewpoint.

# Preferences

- Titles: EN = "Bushing Shorted Layer", PL = "Izolator Przepustowy: Zwarta Warstwa"
- The simulation reference source is `../Warstwy3D.ipynb` (Python) and `../Warstwy3D.m` (MATLAB). Use these to verify numerical correctness.
