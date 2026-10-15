/**
 * Traçados EDUCATIVOS gerados por algoritmo (ilustração, não sinal real; não usar para laudo).
 * Funções puras: amostra(t) em mV aproximados a partir de ritmo e frequência.
 */
export interface Morph {
  rhythm: string;
  rate: number;
  stElevation?: number; // mV
  stDepression?: number;
  peakedT?: boolean;
  wideQrs?: boolean;
  polarity?: number; // 1 normal, -1 invertido (ex.: aVR)
}

const g = (t: number, mu: number, sigma: number, a: number) => a * Math.exp(-((t - mu) ** 2) / (2 * sigma * sigma));

function hash(i: number): number {
  let x = Math.imul(i ^ 0x9e3779b9, 0x85ebca6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

/** batimento sinusal padrão com fase u ∈ [0, 1) do ciclo (duração rr em s) */
function beat(tb: number, rr: number, m: Morph, withP = true): number {
  const qrsW = m.wideQrs ? 0.028 : 0.011;
  let v = 0;
  if (withP) v += g(tb, 0.1, 0.022, 0.13);
  v += g(tb, 0.2, qrsW * 0.8, -0.1);
  v += g(tb, 0.225, qrsW, m.wideQrs ? 0.85 : 1.1);
  v += g(tb, 0.25, qrsW * 0.9, -0.22);
  const tAmp = m.peakedT ? 0.75 : 0.28;
  const tPos = 0.2 + Math.min(0.38, 0.16 + rr * 0.18);
  v += g(tb, tPos, m.peakedT ? 0.03 : 0.05, tAmp);
  const st = (m.stElevation ?? 0) - (m.stDepression ?? 0);
  if (st !== 0) v += st * (tb > 0.26 && tb < tPos ? 1 : 0) + g(tb, tPos - 0.04, 0.05, st * 0.6);
  return v;
}

export function ecgSample(t: number, m: Morph): number {
  const pol = m.polarity ?? 1;
  const rate = Math.max(1, m.rate);
  switch (m.rhythm) {
    case "assistolia":
      return Math.sin(t * 1.3) * 0.015 + (hash(Math.floor(t * 50)) - 0.5) * 0.01;
    case "fv": {
      const a = 0.35 + 0.15 * Math.sin(t * 0.7);
      return a * (Math.sin(t * 2 * Math.PI * 4.7) * 0.6 + Math.sin(t * 2 * Math.PI * 6.3 + 1.3) * 0.4 + Math.sin(t * 2 * Math.PI * 3.1) * 0.3);
    }
    case "tv": {
      const rr = 60 / rate;
      const tb = t % rr;
      return pol * (g(tb, rr * 0.35, rr * 0.11, 1.0) - g(tb, rr * 0.7, rr * 0.13, 0.55));
    }
    case "flutter": {
      const saw = ((t * 5) % 1) * -0.25 + 0.12;
      const rr = 60 / rate;
      return pol * (saw + beat(t % rr, rr, m, false));
    }
    case "fa": {
      // RR irregular: posição de batimentos determinística por índice
      const mean = 60 / rate;
      const idx = Math.floor(t / mean);
      let start = idx * mean;
      const jitter = (hash(idx) - 0.5) * mean * 0.55;
      start += jitter;
      let tb = t - start;
      if (tb < 0) tb += mean;
      const fib = Math.sin(t * 2 * Math.PI * 7.3) * 0.03 + Math.sin(t * 2 * Math.PI * 5.1) * 0.025;
      return pol * (fib + beat(tb, mean, m, false));
    }
    case "bav_total": {
      const pRate = 80;
      const pr = 60 / pRate;
      const p = g(t % pr, 0.08, 0.022, 0.13);
      const rr = 60 / rate;
      return pol * (p + beat(t % rr, rr, { ...m, wideQrs: true }, false));
    }
    default: {
      const rr = 60 / rate;
      return pol * beat(t % rr, rr, m, m.rhythm !== "ritmo_juncional" && m.rhythm !== "tsv");
    }
  }
}

/** curva pletismográfica ilustrativa (0–1) */
export function plethSample(t: number, rate: number, amplitude: number): number {
  const rr = 60 / Math.max(1, rate);
  const u = (t % rr) / rr;
  const up = u < 0.18 ? Math.sin((u / 0.18) * Math.PI * 0.5) : 0;
  const down = u >= 0.18 ? Math.exp(-(u - 0.18) * 3.2) * (1 + 0.12 * Math.sin((u - 0.18) * 18)) : 0;
  return (u < 0.18 ? up : down) * amplitude;
}

export function rhythmIsQrsAt(prevT: number, t: number, m: Morph): boolean {
  if (m.rhythm === "fv" || m.rhythm === "assistolia") return false;
  const rr = 60 / Math.max(1, m.rate);
  const k1 = Math.floor((prevT - 0.225) / rr);
  const k2 = Math.floor((t - 0.225) / rr);
  return k2 > k1;
}

export const LEADS = ["DI", "DII", "DIII", "aVR", "aVL", "aVF", "V1", "V2", "V3", "V4", "V5", "V6"] as const;
export const LEAD_POLARITY: Record<string, number> = { DI: 1, DII: 1, DIII: 0.6, aVR: -1, aVL: 0.5, aVF: 0.8, V1: -0.6, V2: -0.2, V3: 0.4, V4: 1, V5: 1, V6: 0.9 };
