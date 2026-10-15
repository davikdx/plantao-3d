/**
 * Biblioteca de unidades e análise dimensional.
 * Regras:
 *  - O motor armazena SEMPRE número finito + unidade estável (Quantity).
 *  - Conversões são explícitas (convert). Nunca há conversão silenciosa.
 *  - Texto pt-BR é interpretado apenas por parseDecimalBR, nunca por parseFloat direto.
 */

export type Dimension =
  | "mass"
  | "volume"
  | "amount" // mmol / mEq
  | "units" // UI
  | "energy" // J
  | "massPerWeight" // mg/kg
  | "massRate" // mg/h, mcg/min
  | "massPerWeightRate" // mcg/kg/min
  | "volumeRate" // mL/h
  | "flow" // L/min (gases)
  | "concentration" // mg/mL
  | "unitsPerWeight" // UI/kg
  | "unitsRate" // UI/h
  | "unitsPerWeightRate" // UI/kg/h
  | "volumePerWeight" // mL/kg
  | "weight" // kg (peso corporal)
  | "dimensionless";

export const UNIT_IDS = [
  "mcg",
  "mg",
  "g",
  "mL",
  "L",
  "mmol",
  "mEq",
  "UI",
  "J",
  "mg/kg",
  "mcg/kg",
  "g/kg",
  "mL/kg",
  "UI/kg",
  "mg/h",
  "mg/min",
  "mcg/min",
  "mcg/h",
  "mcg/kg/min",
  "mcg/kg/h",
  "mg/kg/h",
  "UI/h",
  "UI/kg/h",
  "mL/h",
  "mL/min",
  "L/min",
  "mg/mL",
  "mcg/mL",
  "UI/mL",
  "mEq/mL",
  "kg",
  "un"
] as const;

export type UnitId = (typeof UNIT_IDS)[number];

interface UnitDef {
  dimension: Dimension;
  /** fator para a unidade base da dimensão */
  toBase: number;
  label: string;
}

/** Unidades base: mass=mg, volume=mL, amount=mmol(=mEq para monovalentes, NÃO convertido automaticamente), rate base por minuto. */
const UNITS: Record<UnitId, UnitDef> = {
  mcg: { dimension: "mass", toBase: 0.001, label: "microgramas" },
  mg: { dimension: "mass", toBase: 1, label: "mg" },
  g: { dimension: "mass", toBase: 1000, label: "g" },
  mL: { dimension: "volume", toBase: 1, label: "mL" },
  L: { dimension: "volume", toBase: 1000, label: "L" },
  mmol: { dimension: "amount", toBase: 1, label: "mmol" },
  // mEq tem dimensão própria por valência; não é convertido para mmol sem saber o íon.
  mEq: { dimension: "amount", toBase: Number.NaN, label: "mEq" },
  UI: { dimension: "units", toBase: 1, label: "UI" },
  J: { dimension: "energy", toBase: 1, label: "J" },
  "mg/kg": { dimension: "massPerWeight", toBase: 1, label: "mg/kg" },
  "mcg/kg": { dimension: "massPerWeight", toBase: 0.001, label: "microgramas/kg" },
  "g/kg": { dimension: "massPerWeight", toBase: 1000, label: "g/kg" },
  "mL/kg": { dimension: "volumePerWeight", toBase: 1, label: "mL/kg" },
  "UI/kg": { dimension: "unitsPerWeight", toBase: 1, label: "UI/kg" },
  "mg/h": { dimension: "massRate", toBase: 1 / 60, label: "mg/h" },
  "mg/min": { dimension: "massRate", toBase: 1, label: "mg/min" },
  "mcg/min": { dimension: "massRate", toBase: 0.001, label: "microgramas/min" },
  "mcg/h": { dimension: "massRate", toBase: 0.001 / 60, label: "microgramas/h" },
  "mcg/kg/min": { dimension: "massPerWeightRate", toBase: 0.001, label: "microgramas/kg/min" },
  "mcg/kg/h": { dimension: "massPerWeightRate", toBase: 0.001 / 60, label: "microgramas/kg/h" },
  "mg/kg/h": { dimension: "massPerWeightRate", toBase: 1 / 60, label: "mg/kg/h" },
  "UI/h": { dimension: "unitsRate", toBase: 1 / 60, label: "UI/h" },
  "UI/kg/h": { dimension: "unitsPerWeightRate", toBase: 1 / 60, label: "UI/kg/h" },
  "mL/h": { dimension: "volumeRate", toBase: 1 / 60, label: "mL/h" },
  "mL/min": { dimension: "volumeRate", toBase: 1, label: "mL/min" },
  "L/min": { dimension: "flow", toBase: 1, label: "L/min" },
  "mg/mL": { dimension: "concentration", toBase: 1, label: "mg/mL" },
  "mcg/mL": { dimension: "concentration", toBase: 0.001, label: "microgramas/mL" },
  "UI/mL": { dimension: "concentration", toBase: Number.NaN, label: "UI/mL" },
  "mEq/mL": { dimension: "concentration", toBase: Number.NaN, label: "mEq/mL" },
  kg: { dimension: "weight", toBase: 1, label: "kg" },
  un: { dimension: "dimensionless", toBase: 1, label: "unidade(s)" }
};

export interface Quantity {
  value: number;
  unit: UnitId;
}

export class UnitError extends Error {
  constructor(
    public readonly code:
      | "not_finite"
      | "negative"
      | "zero"
      | "incompatible"
      | "unknown_unit"
      | "parse"
      | "missing_weight"
      | "out_of_technical_range",
    message: string
  ) {
    super(message);
    this.name = "UnitError";
  }
}

export function isUnitId(u: string): u is UnitId {
  return (UNIT_IDS as readonly string[]).includes(u);
}

export function unitDimension(u: UnitId): Dimension {
  return UNITS[u].dimension;
}

export function unitLabel(u: UnitId): string {
  return UNITS[u].label;
}

export function q(value: number, unit: UnitId): Quantity {
  assertFinite(value);
  return { value, unit };
}

export function assertFinite(v: number): void {
  if (typeof v !== "number" || !Number.isFinite(v)) {
    throw new UnitError("not_finite", "Valor numérico inválido (NaN ou infinito).");
  }
}

/** Conversão explícita entre unidades da mesma dimensão. */
export function convert(qty: Quantity, to: UnitId): Quantity {
  assertFinite(qty.value);
  if (qty.unit === to) return { value: qty.value, unit: to };
  const from = UNITS[qty.unit];
  const target = UNITS[to];
  if (!from || !target) throw new UnitError("unknown_unit", "Unidade desconhecida.");
  if (from.dimension !== target.dimension) {
    throw new UnitError("incompatible", `Não é possível converter ${from.label} em ${target.label}.`);
  }
  if (!Number.isFinite(from.toBase) || !Number.isFinite(target.toBase)) {
    throw new UnitError(
      "incompatible",
      `Conversão entre ${from.label} e ${target.label} exige informação adicional (íon/valência ou atividade).`
    );
  }
  const value = roundSafe((qty.value * from.toBase) / target.toBase);
  return { value, unit: to };
}

/** Arredonda ruído de ponto flutuante (ex.: 0.30000000000000004). */
export function roundSafe(v: number, digits = 10): number {
  const f = 10 ** digits;
  return Math.round(v * f) / f;
}

/**
 * Interpreta números digitados no Brasil: "1,5", "1.5", "0,25", "1.000" é REJEITADO como ambíguo.
 * Não aceita separador de milhar para evitar erro de fator 1000.
 */
export function parseDecimalBR(text: string, opts: { allowNegative?: boolean; allowZero?: boolean } = {}): number {
  const raw = String(text ?? "").trim();
  if (raw.length === 0) throw new UnitError("parse", "Informe um número.");
  if (!/^-?\d+([.,]\d+)?$/.test(raw)) {
    throw new UnitError(
      "parse",
      "Número inválido. Use apenas um separador decimal (vírgula ou ponto) e não use separador de milhar."
    );
  }
  const value = Number(raw.replace(",", "."));
  assertFinite(value);
  if (!opts.allowNegative && value < 0) throw new UnitError("negative", "O valor não pode ser negativo.");
  if (!opts.allowZero && value === 0) throw new UnitError("zero", "O valor não pode ser zero.");
  return value;
}

export function formatNumberBR(v: number, maxDecimals = 2): string {
  if (!Number.isFinite(v)) return "—";
  return v.toLocaleString("pt-BR", { maximumFractionDigits: maxDecimals, minimumFractionDigits: 0 });
}

export function formatQuantity(qty: Quantity, maxDecimals = 2): string {
  return `${formatNumberBR(qty.value, maxDecimals)} ${UNITS[qty.unit].label}`;
}

// ---------------------------------------------------------------------------
// Cálculos de dose — aritmética pura; NÃO decidem se a dose é clinicamente correta.
// ---------------------------------------------------------------------------

export interface DoseInput {
  dose: Quantity; // mg, mcg, g, UI, mL, mg/kg, mcg/kg, UI/kg, mL/kg
  weightKg?: number;
}

/** Resolve dose total (massa, UI ou volume) a partir de dose absoluta ou por peso. */
export function resolveTotalDose(input: DoseInput): Quantity {
  const { dose } = input;
  assertFinite(dose.value);
  if (dose.value < 0) throw new UnitError("negative", "Dose negativa não é representável.");
  if (dose.value === 0) throw new UnitError("zero", "Dose zero não é uma ordem válida.");
  const dim = unitDimension(dose.unit);
  if (dim === "mass" || dim === "units" || dim === "volume" || dim === "amount") return { ...dose };
  if (dim === "massPerWeight" || dim === "unitsPerWeight" || dim === "volumePerWeight") {
    const w = input.weightKg;
    if (w === undefined || !Number.isFinite(w)) {
      throw new UnitError("missing_weight", "Dose por peso exige o peso do paciente.");
    }
    if (w <= 0 || w > 400) throw new UnitError("out_of_technical_range", "Peso fora do intervalo técnico (0–400 kg).");
    if (dim === "massPerWeight") {
      const mgPerKg = convert(dose, "mg/kg").value;
      return { value: roundSafe(mgPerKg * w), unit: "mg" };
    }
    if (dim === "unitsPerWeight") return { value: roundSafe(dose.value * w), unit: "UI" };
    return { value: roundSafe(dose.value * w), unit: "mL" };
  }
  throw new UnitError("incompatible", `Unidade ${unitLabel(dose.unit)} não representa uma dose em bolus.`);
}

/** Volume a aspirar para uma massa dada uma concentração (mg/mL ou mcg/mL). */
export function volumeForMass(mass: Quantity, concentration: Quantity): Quantity {
  if (unitDimension(mass.unit) !== "mass") throw new UnitError("incompatible", "Esperada uma massa.");
  if (concentration.unit !== "mg/mL" && concentration.unit !== "mcg/mL") {
    throw new UnitError("incompatible", "Concentração deve estar em mg/mL ou microgramas/mL.");
  }
  assertFinite(concentration.value);
  if (concentration.value <= 0) throw new UnitError("zero", "Concentração deve ser maior que zero.");
  const mg = convert(mass, "mg").value;
  const mgPerMl = convert(concentration, "mg/mL").value;
  return { value: roundSafe(mg / mgPerMl, 6), unit: "mL" };
}

/** Velocidade da bomba (mL/h) para uma taxa de dose em massa/tempo ou massa/kg/tempo. */
export function infusionRateMlH(params: { rate: Quantity; concentration: Quantity; weightKg?: number }): Quantity {
  const { rate, concentration } = params;
  assertFinite(rate.value);
  if (rate.value < 0) throw new UnitError("negative", "Taxa negativa.");
  if (concentration.unit !== "mg/mL" && concentration.unit !== "mcg/mL") {
    throw new UnitError("incompatible", "Concentração deve estar em mg/mL ou microgramas/mL.");
  }
  if (concentration.value <= 0) throw new UnitError("zero", "Concentração deve ser maior que zero.");
  const dim = unitDimension(rate.unit);
  let mgPerMin: number;
  if (dim === "massRate") {
    mgPerMin = convert(rate, "mg/min").value;
  } else if (dim === "massPerWeightRate") {
    const w = params.weightKg;
    if (w === undefined || !Number.isFinite(w) || w <= 0) {
      throw new UnitError("missing_weight", "Taxa por peso exige o peso do paciente.");
    }
    // base de massPerWeightRate é mg/kg/min
    mgPerMin = rate.value * UNITS[rate.unit].toBase * w;
  } else if (dim === "volumeRate") {
    return convert(rate, "mL/h");
  } else {
    throw new UnitError("incompatible", "Unidade de taxa inválida para infusão.");
  }
  const mgPerMl = convert(concentration, "mg/mL").value;
  return { value: roundSafe((mgPerMin / mgPerMl) * 60, 6), unit: "mL/h" };
}

/** Concentração final de uma diluição. */
export function finalConcentration(mass: Quantity, finalVolume: Quantity): Quantity {
  const mg = convert(mass, "mg").value;
  const ml = convert(finalVolume, "mL").value;
  if (ml <= 0) throw new UnitError("zero", "Volume final deve ser maior que zero.");
  return { value: roundSafe(mg / ml, 6), unit: "mg/mL" };
}

/** Compara razão entre duas quantidades da mesma dimensão (para detectar erros de fator 10/1000). */
export function ratio(a: Quantity, b: Quantity): number {
  const bb = convert(b, a.unit);
  if (bb.value === 0) throw new UnitError("zero", "Divisão por zero.");
  return a.value / bb.value;
}
