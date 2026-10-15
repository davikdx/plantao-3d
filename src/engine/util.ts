/** Utilidades determinísticas do motor (sem Date.now, sem Math.random). */

export const TICK_SECONDS = 0.1;
export const TICKS_PER_SECOND = 10;

export function secondsToTicks(s: number): number {
  return Math.round(s * TICKS_PER_SECOND);
}

export function ticksToSeconds(t: number): number {
  return t / TICKS_PER_SECOND;
}

/** mulberry32 — PRNG determinístico com estado inteiro serializável. */
export function nextRandom(state: number): { value: number; state: number } {
  let t = (state + 0x6d2b79f5) | 0;
  const newState = t;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { value, state: newState };
}

/** JSON com chaves ordenadas — base para hash de integridade. */
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj)
    .filter((k) => obj[k] !== undefined)
    .sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}

/** FNV-1a 32 bits em hexadecimal. Controle de integridade, não criptografia. */
export function fnv1a(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export function deepClone<T>(v: T): T {
  return structuredClone(v);
}

export function formatClock(tick: number): string {
  const total = Math.floor(ticksToSeconds(tick));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
