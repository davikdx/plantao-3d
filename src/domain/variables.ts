/**
 * Registro de variáveis clínicas e flags permitidas no motor.
 * Todos os caminhos de condição/efeito são validados contra este registro (sem expressões livres).
 */

export interface VarDef {
  label: string;
  short: string;
  displayUnit: string;
  min: number;
  max: number;
  decimals: number;
  /** valor de referência adulto usado apenas quando o caso não define (regra documentada em ARCHITECTURE.md) */
  adultDefault?: number;
  reference?: string;
  /** categoria para agrupar exames */
  group: "vital" | "gaso" | "eletrolitos" | "hemograma" | "bioquimica" | "outros" | "interno";
}

export const VARS = {
  hr: { label: "Frequência cardíaca", short: "FC", displayUnit: "bpm", min: 0, max: 300, decimals: 0, adultDefault: 80, group: "vital" },
  sbp: { label: "Pressão arterial sistólica", short: "PAS", displayUnit: "mmHg", min: 0, max: 300, decimals: 0, adultDefault: 120, group: "vital" },
  dbp: { label: "Pressão arterial diastólica", short: "PAD", displayUnit: "mmHg", min: 0, max: 200, decimals: 0, adultDefault: 75, group: "vital" },
  rr: { label: "Frequência respiratória", short: "FR", displayUnit: "irpm", min: 0, max: 90, decimals: 0, adultDefault: 16, group: "vital" },
  spo2: { label: "Saturação periférica de O₂", short: "SpO₂", displayUnit: "%", min: 0, max: 100, decimals: 0, adultDefault: 97, group: "vital" },
  temp: { label: "Temperatura axilar", short: "Tax", displayUnit: "°C", min: 25, max: 44, decimals: 1, adultDefault: 36.5, group: "vital" },
  gcs: { label: "Escala de coma de Glasgow", short: "ECG-Glasgow", displayUnit: "pontos", min: 3, max: 15, decimals: 0, adultDefault: 15, group: "vital" },
  pain: { label: "Dor (escala numérica)", short: "Dor", displayUnit: "/10", min: 0, max: 10, decimals: 0, adultDefault: 0, group: "vital" },
  glucose: { label: "Glicemia capilar", short: "HGT", displayUnit: "mg/dL", min: 0, max: 1500, decimals: 0, adultDefault: 95, reference: "70–99 mg/dL em jejum (adulto)", group: "vital" },
  perfusion: { label: "Perfusão periférica (índice interno 0–1)", short: "Perf", displayUnit: "", min: 0, max: 1, decimals: 2, adultDefault: 1, group: "interno" },
  effort: { label: "Esforço respiratório (0 ausente – 3 grave)", short: "Esforço", displayUnit: "", min: 0, max: 3, decimals: 1, adultDefault: 0, group: "interno" },
  etco2: { label: "CO₂ expirado (capnografia)", short: "EtCO₂", displayUnit: "mmHg", min: 0, max: 120, decimals: 0, adultDefault: 38, group: "vital" },
  urine: { label: "Débito urinário", short: "Diurese", displayUnit: "mL/h", min: 0, max: 1000, decimals: 0, adultDefault: 60, group: "vital" },
  bleeding: { label: "Sangramento ativo estimado", short: "Sangr.", displayUnit: "mL/min", min: 0, max: 500, decimals: 0, adultDefault: 0, group: "interno" },
  fetalHr: { label: "Batimentos cardíacos fetais", short: "BCF", displayUnit: "bpm", min: 0, max: 250, decimals: 0, group: "vital" },
  // gasometria
  ph: { label: "pH", short: "pH", displayUnit: "", min: 6.5, max: 7.8, decimals: 2, adultDefault: 7.4, reference: "7,35–7,45 (arterial)", group: "gaso" },
  pco2: { label: "pCO₂", short: "pCO₂", displayUnit: "mmHg", min: 5, max: 150, decimals: 0, adultDefault: 40, reference: "35–45 mmHg (arterial)", group: "gaso" },
  po2: { label: "pO₂", short: "pO₂", displayUnit: "mmHg", min: 10, max: 600, decimals: 0, adultDefault: 90, reference: "80–100 mmHg em ar ambiente (arterial)", group: "gaso" },
  hco3: { label: "Bicarbonato", short: "HCO₃⁻", displayUnit: "mmol/L", min: 1, max: 60, decimals: 1, adultDefault: 24, reference: "22–26 mmol/L", group: "gaso" },
  be: { label: "Excesso de base", short: "BE", displayUnit: "mmol/L", min: -35, max: 35, decimals: 1, adultDefault: 0, reference: "−2 a +2 mmol/L", group: "gaso" },
  lactate: { label: "Lactato", short: "Lactato", displayUnit: "mmol/L", min: 0, max: 30, decimals: 1, adultDefault: 1.2, reference: "< 2 mmol/L", group: "gaso" },
  // eletrólitos
  na: { label: "Sódio", short: "Na⁺", displayUnit: "mmol/L", min: 90, max: 190, decimals: 0, adultDefault: 139, reference: "135–145 mmol/L", group: "eletrolitos" },
  k: { label: "Potássio", short: "K⁺", displayUnit: "mmol/L", min: 1, max: 10, decimals: 1, adultDefault: 4.2, reference: "3,5–5,0 mmol/L", group: "eletrolitos" },
  cl: { label: "Cloreto", short: "Cl⁻", displayUnit: "mmol/L", min: 60, max: 140, decimals: 0, adultDefault: 103, reference: "98–107 mmol/L", group: "eletrolitos" },
  ca: { label: "Cálcio total", short: "Ca", displayUnit: "mg/dL", min: 3, max: 20, decimals: 1, adultDefault: 9.4, reference: "8,5–10,2 mg/dL", group: "eletrolitos" },
  mg: { label: "Magnésio", short: "Mg", displayUnit: "mg/dL", min: 0.3, max: 10, decimals: 1, adultDefault: 2.0, reference: "1,7–2,4 mg/dL", group: "eletrolitos" },
  // hemograma
  hb: { label: "Hemoglobina", short: "Hb", displayUnit: "g/dL", min: 1, max: 25, decimals: 1, adultDefault: 13.8, reference: "12–16 g/dL (mulher); 13–17 g/dL (homem)", group: "hemograma" },
  wbc: { label: "Leucócitos", short: "Leuco", displayUnit: "/mm³", min: 0, max: 200000, decimals: 0, adultDefault: 7800, reference: "4.000–11.000/mm³", group: "hemograma" },
  plt: { label: "Plaquetas", short: "Plaq", displayUnit: "/mm³", min: 0, max: 2000000, decimals: 0, adultDefault: 245000, reference: "150.000–450.000/mm³", group: "hemograma" },
  ht: { label: "Hematócrito", short: "Ht", displayUnit: "%", min: 5, max: 75, decimals: 0, adultDefault: 41, reference: "36–50%", group: "hemograma" },
  // bioquímica
  creat: { label: "Creatinina", short: "Cr", displayUnit: "mg/dL", min: 0.1, max: 25, decimals: 2, adultDefault: 0.9, reference: "0,6–1,2 mg/dL (adulto)", group: "bioquimica" },
  urea: { label: "Ureia", short: "Ur", displayUnit: "mg/dL", min: 2, max: 400, decimals: 0, adultDefault: 30, reference: "15–45 mg/dL", group: "bioquimica" },
  pcr: { label: "Proteína C-reativa", short: "PCR", displayUnit: "mg/L", min: 0, max: 600, decimals: 0, adultDefault: 3, reference: "< 5 mg/L", group: "bioquimica" },
  trop: { label: "Troponina de alta sensibilidade", short: "Trop-us", displayUnit: "ng/L", min: 0, max: 100000, decimals: 0, adultDefault: 5, reference: "Abaixo do percentil 99 do método (ex.: < 14 ng/L — varia por kit)", group: "bioquimica" },
  ketones: { label: "Beta-hidroxibutirato sérico", short: "β-OHB", displayUnit: "mmol/L", min: 0, max: 15, decimals: 1, adultDefault: 0.2, reference: "< 0,6 mmol/L", group: "bioquimica" },
  osm: { label: "Osmolalidade sérica efetiva calculada", short: "Osm ef", displayUnit: "mOsm/kg", min: 200, max: 450, decimals: 0, adultDefault: 285, reference: "275–295 mOsm/kg", group: "bioquimica" },
  ast: { label: "AST (TGO)", short: "AST", displayUnit: "U/L", min: 0, max: 20000, decimals: 0, adultDefault: 24, reference: "< 40 U/L", group: "bioquimica" },
  alt: { label: "ALT (TGP)", short: "ALT", displayUnit: "U/L", min: 0, max: 20000, decimals: 0, adultDefault: 22, reference: "< 41 U/L", group: "bioquimica" },
  inr: { label: "RNI (INR)", short: "RNI", displayUnit: "", min: 0.5, max: 15, decimals: 1, adultDefault: 1.0, reference: "0,8–1,2", group: "bioquimica" },
  bili: { label: "Bilirrubina total", short: "BT", displayUnit: "mg/dL", min: 0, max: 40, decimals: 1, adultDefault: 0.6, reference: "< 1,2 mg/dL (adulto)", group: "bioquimica" },
  lipase: { label: "Lipase", short: "Lipase", displayUnit: "U/L", min: 0, max: 20000, decimals: 0, adultDefault: 35, reference: "< 60 U/L (varia por método)", group: "bioquimica" },
  apap: { label: "Paracetamol sérico", short: "APAP", displayUnit: "mcg/mL", min: 0, max: 1000, decimals: 0, adultDefault: 0, reference: "Interpretar pelo nomograma conforme hora da ingestão", group: "bioquimica" },
  cohb: { label: "Carboxi-hemoglobina", short: "COHb", displayUnit: "%", min: 0, max: 80, decimals: 0, adultDefault: 1, reference: "< 3% (não fumante)", group: "gaso" },
  bhcg: { label: "Beta-hCG sérico quantitativo", short: "β-hCG", displayUnit: "mUI/mL", min: 0, max: 500000, decimals: 0, adultDefault: 0, reference: "< 5 mUI/mL (não gestante)", group: "bioquimica" },
  cpk: { label: "CPK", short: "CPK", displayUnit: "U/L", min: 0, max: 200000, decimals: 0, adultDefault: 120, reference: "< 190 U/L", group: "bioquimica" },
  // variáveis abstratas do caso técnico (não clínicas)
  level: { label: "Nível abstrato (teste técnico)", short: "level", displayUnit: "u.a.", min: -1000, max: 1000, decimals: 4, adultDefault: 0, group: "interno" }
} as const satisfies Record<string, VarDef>;

export type VarId = keyof typeof VARS;
export const VAR_IDS = Object.keys(VARS) as VarId[];

export function isVarId(v: string): v is VarId {
  return Object.prototype.hasOwnProperty.call(VARS, v);
}

export function clampVar(id: VarId, value: number): number {
  const d = VARS[id];
  if (!Number.isFinite(value)) return d.min;
  return Math.min(d.max, Math.max(d.min, value));
}

/** Ritmos representáveis. pulse é flag separada: ritmo organizado pode estar sem pulso (AESP). */
export const RHYTHMS = [
  "sinusal",
  "taquicardia_sinusal",
  "bradicardia_sinusal",
  "fa",
  "flutter",
  "tsv",
  "tv",
  "fv",
  "assistolia",
  "bav_total",
  "bav2_mobitz2",
  "ritmo_juncional",
  "sinusal_t_apiculada",
  "sinusal_supra",
  "sinusal_qrs_largo"
] as const;
export type RhythmId = (typeof RHYTHMS)[number];

export const RHYTHM_LABELS: Record<RhythmId, string> = {
  sinusal: "Ritmo sinusal",
  taquicardia_sinusal: "Taquicardia sinusal",
  bradicardia_sinusal: "Bradicardia sinusal",
  fa: "Fibrilação atrial",
  flutter: "Flutter atrial",
  tsv: "Taquicardia supraventricular",
  tv: "Taquicardia ventricular",
  fv: "Fibrilação ventricular",
  assistolia: "Assistolia",
  bav_total: "Bloqueio atrioventricular total",
  bav2_mobitz2: "BAV de 2º grau Mobitz II",
  ritmo_juncional: "Ritmo juncional",
  sinusal_t_apiculada: "Ritmo sinusal com ondas T apiculadas",
  sinusal_supra: "Ritmo sinusal com supradesnivelamento de ST",
  sinusal_qrs_largo: "Ritmo sinusal com QRS alargado"
};

export const FLAG_DEFS = {
  rhythm: { kind: "enum", values: RHYTHMS as readonly string[], label: "Ritmo" },
  pulse: { kind: "boolean", label: "Pulso central presente" },
  airway: { kind: "enum", values: ["pervia", "risco", "obstruida_parcial", "obstruida", "protegida"], label: "Via aérea" },
  consciousness: { kind: "enum", values: ["alerta", "voz", "dor", "irresponsivo"], label: "Nível de consciência (AVDI)" },
  communication: { kind: "enum", values: ["normal", "limitada", "incapaz"], label: "Comunicação" },
  seizure: { kind: "boolean", label: "Crise convulsiva em curso" },
  cough: { kind: "boolean", label: "Tosse" },
  agitation: { kind: "boolean", label: "Agitação" },
  tremor: { kind: "boolean", label: "Tremor" },
  sweating: { kind: "boolean", label: "Sudorese" },
  cyanosis: { kind: "boolean", label: "Cianose" },
  pallor: { kind: "boolean", label: "Palidez" },
  urticaria: { kind: "boolean", label: "Urticária" },
  angioedema: { kind: "boolean", label: "Angioedema" },
  jaundice: { kind: "boolean", label: "Icterícia" },
  edema: { kind: "boolean", label: "Edema de membros" },
  rash: { kind: "boolean", label: "Lesões cutâneas" },
  bleedingVisible: { kind: "boolean", label: "Sangramento visível" },
  stridor: { kind: "boolean", label: "Estridor" },
  wheeze: { kind: "boolean", label: "Sibilância audível" },
  posture: { kind: "enum", values: ["supino", "sentado", "antalgica", "decubito_lateral", "fowler", "litotomia"], label: "Postura" },
  painVisual: { kind: "enum", values: ["nenhuma", "leve", "moderada", "intensa"], label: "Expressão de dor" },
  speech: { kind: "enum", values: ["frases", "palavras", "nenhuma"], label: "Fala" },
  pregnant: { kind: "boolean", label: "Gestação" },
  rosc: { kind: "boolean", label: "Circulação espontânea recuperada" },
  // técnico
  demoFlag: { kind: "boolean", label: "Flag técnica" }
} as const;

export type FlagId = keyof typeof FLAG_DEFS;
export const FLAG_IDS = Object.keys(FLAG_DEFS) as FlagId[];
export type FlagValue = string | boolean | number;

export function isFlagId(f: string): f is FlagId {
  return Object.prototype.hasOwnProperty.call(FLAG_DEFS, f);
}

export function validateFlagValue(id: FlagId, value: FlagValue): boolean {
  const def = FLAG_DEFS[id];
  if (def.kind === "boolean") return typeof value === "boolean";
  return typeof value === "string" && (def.values as readonly string[]).includes(value);
}

/** Caminhos permitidos em condições: vars.X, flags.Y, time */
export type AllowedPath = `vars.${VarId}` | `flags.${FlagId}`;

export function isAllowedPath(p: string): p is AllowedPath {
  if (p.startsWith("vars.")) return isVarId(p.slice(5));
  if (p.startsWith("flags.")) return isFlagId(p.slice(6));
  return false;
}
