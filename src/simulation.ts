/**
 * Core simulation for Warstwy3D — multi-layer dielectric model.
 *
 * Computes the total dissipation factor (tan delta_c) and the
 * equivalent capacitance (C_vc) as a function of frequency (f)
 * and damaged-layer resistance (R_x).
 */

/** Generate logarithmically spaced values (equivalent to np.logspace). */
function logspace(start: number, stop: number, num: number): Float64Array {
  const result = new Float64Array(num);
  for (let i = 0; i < num; i++) {
    const exponent = start + (stop - start) * (i / (num - 1));
    result[i] = Math.pow(10, exponent);
  }
  return result;
}

export interface SimulationParams {
  n: number;    // Number of layers
  k: number;    // Number of damaged layers
  Rz: number;   // Nominal resistance [Ω]
  Cc: number;   // Total bushing capacitance [F]
}

export const DEFAULT_PARAMS: SimulationParams = {
  n: 16, k: 1, Rz: 6.8e8, //
  Cc: 1.7e-9, // Total bushing capacitance
};

export interface SimulationResult {
  /** Frequency vector [Hz], length F */
  fVec: Float64Array;
  /** Damaged-layer resistance vector [Ohm], length R */
  rxVec: Float64Array;
  /** tan(delta_c) matrix, row-major [R][F] — Z[rxIndex][fIndex] */
  Z: Float64Array[];
  /** C_vc matrix, row-major [R][F] — Zcvc[rxIndex][fIndex] */
  Zcvc: Float64Array[];
}

export function runSimulation(params: SimulationParams = DEFAULT_PARAMS): SimulationResult {
  // Model parameters
  const { n, k, Rz: R_z, Cc: C_c } = params;

  const C_z = C_c * n; // Layer capacitance

  // Variable vectors
  const fVec = logspace(-1, 3, 100);   // Frequency [Hz]
  const rxVec = logspace(1, 9, 100);   // Damaged-layer resistance [Ohm]

  // Allocate result matrices
  const Z: Float64Array[] = new Array(rxVec.length);
  const Zcvc: Float64Array[] = new Array(rxVec.length);
  for (let r = 0; r < rxVec.length; r++) {
    Z[r] = new Float64Array(fVec.length);
    Zcvc[r] = new Float64Array(fVec.length);
  }

  // Per-layer resistance and capacitance arrays
  const R_i = new Float64Array(n);
  const C_i = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    C_i[i] = C_z;
  }


  for (let fi = 0; fi < fVec.length; fi++) {
    const f = fVec[fi];
    const omega = 2 * Math.PI * f;

    for (let ri = 0; ri < rxVec.length; ri++) {
      const R_x = rxVec[ri];

      // Build R_i: first (n-k) layers have R_z, last k layers have R_x
      for (let i = 0; i < n - k; i++) R_i[i] = R_z;
      for (let i = n - k; i < n; i++) R_i[i] = R_x;

      // Compute complex impedance per layer: Z_i = R / (1 + j*omega*R*C)
      // Decompose into real and imaginary parts:
      //   denom = 1 + (omega*R*C)^2
      //   Z_re = R / denom
      //   Z_im = -omega*R^2*C / denom
      // Sum across layers for total impedance
      let Zc_re = 0;
      let Zc_im = 0;

      // We also accumulate losses directly
      let W_c = 0;

      for (let i = 0; i < n; i++) {
        const R = R_i[i];
        const C = C_i[i];
        const wRC = omega * R * C;
        const denom = 1 + wRC * wRC;

        const Zi_re = R / denom;
        const Zi_im = -omega * R * R * C / denom;

        Zc_re += Zi_re;
        Zc_im += Zi_im;

        // |Z_i|^2 = Zi_re^2 + Zi_im^2
        const Zi_abs_sq = Zi_re * Zi_re + Zi_im * Zi_im;

        // tand_i = 1 / (omega * R * C)
        const tand_i = 1 / wRC;

        // After computing I_c = U_c / |Z_c| and U_i = |Z_i| * I_c:
        // W_i = omega * U_i^2 * C * tand_i
        //      = omega * |Z_i|^2 * I_c^2 * C * tand_i
        // Total: W_c = sum(W_i) = I_c^2 * sum(omega * |Z_i|^2 * C * tand_i)
        // Then: tand_c = W_c / (omega * U_c^2 * C_c)
        //              = I_c^2 * sum(...) / (omega * U_c^2 * C_c)
        //              = [U_c^2 / |Z_c|^2] * sum(...) / (omega * U_c^2 * C_c)
        //              = sum(omega * |Z_i|^2 * C * tand_i) / (|Z_c|^2 * omega * C_c)
        // So we can accumulate the numerator and divide at the end.
        W_c += omega * Zi_abs_sq * C * tand_i;
      }

      const Zc_abs_sq = Zc_re * Zc_re + Zc_im * Zc_im;
      const tand_c = W_c / (Zc_abs_sq * omega * C_c);

      // Equivalent capacitance C_vc
      const C_x = 1 / (omega * R_x * tand_c);
      const C_vc = C_z * C_x / ((n - 1) * C_x + C_z);

      Z[ri][fi] = tand_c;
      Zcvc[ri][fi] = C_vc;
    }
  }

  return { fVec, rxVec, Z, Zcvc };
}
