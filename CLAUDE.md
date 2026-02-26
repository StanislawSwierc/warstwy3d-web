# Project Overview

Warstwy3D-web is a TypeScript + React + Plotly.js interactive web application that simulates a multi-layer dielectric (bushing) model. It computes the total dissipation factor (tan δ_c) as a function of frequency (f) and damaged-layer resistance (R_x).

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
  App.tsx               # Root component: layout, locale state, R_x slider state
  simulation.ts         # Pure computation (no React/DOM). logspace(), runSimulation()
  i18n.ts               # EN/PL translations, React context, localStorage persistence
  components/
    Surface3D.tsx       # 3D surface plot with touch-device overlay for scrolling
    Slice2D.tsx         # 2D cross-section plot with R_x slider
```

# Commands

- `npm run dev` — local dev server
- `npm run build` — type-check + production build
- `npm run preview` — preview production build locally

# Key Design Decisions

- **Complex numbers**: Inline real/imaginary decomposition in `simulation.ts` (no library). The formula `Z_i = R/(1+jωRC)` is split into real and imaginary parts algebraically.
- **U_c cancels out**: The voltage U_c (140V) cancels in the tan δ_c formula, so it's not used in computation. See comment in `simulation.ts`.
- **Mobile touch handling**: 3D Plotly plots capture all touch events, blocking page scroll. Solution: transparent overlay div with `touch-action: pan-y` blocks touches from reaching the Plotly canvas while allowing vertical scrolling. A toggle button lets users enable/disable rotation. Do NOT use Plotly's `staticPlot` config for 3D — it disables WebGL and the surface won't render.
- **i18n**: Simple object map with React context. Two locales: `en` and `pl`. Locale persisted in `localStorage`.
- **Camera angle**: Converted from MATLAB `view([11, 32])` to Plotly camera eye coordinates using spherical-to-cartesian conversion.

# Preferences

- Titles: EN = "Bushing Shorted Layer", PL = "Izolator Przepustowy: Zwarta Warstwa"
- The simulation reference source is `../Warstwy3D.ipynb` (Python) and `../Warstwy3D.m` (MATLAB). Use these to verify numerical correctness.
