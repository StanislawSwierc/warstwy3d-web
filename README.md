# Bushing Model

Multi-layer dielectric model — computes the total dissipation factor (tan δ_c)
as a function of frequency (f) and damaged-layer resistance (R_x).

**Live demo:** https://jbuchacz.github.io/bushing-model-web/

## Features

- 3D surface plot of tan δ_c(f, R_x)
- Interactive 2D cross-section with R_x slider
- EN/PL language toggle

## Model Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| n | 16 | Number of dielectric layers |
| k | 1 | Number of damaged layers |
| U_c | 140 V | Total voltage |
| R_z | 6.8 GΩ | Nominal layer resistance |
| C_z | 1.7 nF | Nominal layer capacitance |

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The site deploys automatically to GitHub Pages on push to `main`.

## Origin

Originally a MATLAB script (`Warstwy3D.m`), later translated to Python
(NumPy + Plotly in a Jupyter notebook), now a TypeScript + React + Plotly.js
web application.
