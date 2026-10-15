/**
 * Geração local de variantes por regras (sem IA, sem cota). Variantes são RASCUNHOS (status draft):
 * nunca herdam o status de revisão do caso-base. Alterações respeitam os limites declarados em
 * `variation` do caso; mudanças que trocariam a população posológica (adulto↔idoso↔pediátrico,
 * gestação) são proibidas, pois exigiriam revisão de doses e evolução.
 */
import type { CaseDefinition, PatientVisualProfile } from "../domain/schema";
import { nextRandom, fnv1a, stableStringify } from "../engine/util";
import { validateCase } from "./validate";

const NAMES_F = ["Ana Paula", "Maria José", "Francisca", "Luana", "Patrícia", "Aparecida", "Kauane", "Jéssica", "Raimunda", "Beatriz", "Sueli", "Thaís", "Iracema", "Camila"];
const NAMES_M = ["José Carlos", "Antônio", "Francisco", "Luiz Henrique", "Raimundo", "Paulo", "Wellington", "Cícero", "Rafael", "Joaquim", "Edson", "Gabriel", "Benedito", "Ítalo"];
const SURNAMES = ["Silva", "Santos", "Oliveira", "Souza", "Pereira", "Lima", "Carvalho", "Ferreira", "Rodrigues", "Almeida", "Nascimento", "Araújo", "Barbosa", "Ribeiro"];

function populationKey(age: number, pregnant: boolean): string {
  if (pregnant) return "gestante";
  if (age < 18) return "pediatrico";
  if (age >= 65) return "idoso";
  return "adulto";
}

export interface VariantResult {
  ok: boolean;
  caseDef?: CaseDefinition;
  fingerprint?: string;
  reasons: string[];
}

export function generateVariant(base: CaseDefinition, seed: number, existingFingerprints: Set<string> = new Set()): VariantResult {
  const reasons: string[] = [];
  let rng = seed | 0;
  const rand = () => {
    const r = nextRandom(rng);
    rng = r.state;
    return r.value;
  };
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)]!;
  const v = base.variation;
  const p = structuredClone(base.patient);
  const pregnant = (p.pregnancyWeeks ?? 0) > 0;
  const popBefore = populationKey(p.ageYears, pregnant);

  if (v.allowSexSwap && !pregnant && !v.forbidden.includes("sexo") && rand() < 0.5) {
    p.sex = p.sex === "feminino" ? "masculino" : "feminino";
    p.visual.sex = p.sex;
    reasons.push("Sexo alterado (permitido pelo caso).");
  }
  if (v.allowAgeShiftYears > 0 && !v.forbidden.includes("idade") && p.ageYears >= 1) {
    const shift = Math.round((rand() * 2 - 1) * v.allowAgeShiftYears);
    const newAge = Math.max(1, p.ageYears + shift);
    if (populationKey(newAge, pregnant) === popBefore) {
      p.ageYears = newAge;
      if (shift !== 0) reasons.push(`Idade ajustada em ${shift > 0 ? "+" : ""}${shift} anos dentro da mesma população posológica.`);
    } else reasons.push("Ajuste de idade descartado: mudaria a população posológica (exige revisão).");
  }
  if (v.allowWeightPercent > 0 && !v.forbidden.includes("peso")) {
    const f = 1 + (rand() * 2 - 1) * (v.allowWeightPercent / 100);
    p.weightKg = Math.round(p.weightKg * f * 10) / 10;
    reasons.push(`Peso ajustado para ${String(p.weightKg).replace(".", ",")} kg (doses por peso são recalculadas pelo motor).`);
  }
  if (v.allowVisualVariation) {
    const visual: PatientVisualProfile = { ...p.visual };
    visual.skinTone = Math.floor(rand() * 8);
    if (visual.ageGroup === "idoso") visual.hairColor = pick(["grisalho", "branco", "grisalho"]);
    else if (visual.ageGroup !== "lactente") visual.hairColor = pick(["preto", "castanho", "castanho", "preto", "loiro", "ruivo"]);
    if (visual.ageGroup !== "lactente") visual.hairStyle = pick(p.sex === "feminino" ? ["longo", "coque", "cacheado", "crespo_volume", "curto"] : ["curto", "crespo_curto", "careca", "cacheado"]);
    visual.build = pick(["magro", "medio", "medio", "robusto"]);
    p.visual = visual;
    reasons.push("Aparência variada (tom de pele, cabelo e constituição não alteram a evolução clínica).");
  }
  p.name = `${pick(p.sex === "feminino" ? NAMES_F : NAMES_M)} ${pick(SURNAMES)}`;

  const fingerprint = fnv1a(stableStringify({ base: base.id, age: p.ageYears, sex: p.sex, w: p.weightKg, v: p.visual }));
  if (existingFingerprints.has(fingerprint)) return { ok: false, reasons: ["Variante praticamente idêntica a uma já existente (duplicata)."], fingerprint };

  const variant: CaseDefinition = {
    ...structuredClone(base),
    id: `${base.id}-V${(seed >>> 0).toString(36).toUpperCase()}`,
    version: "0.1.0",
    status: "draft",
    patient: p,
    blueprint: { blueprintId: base.id, seed, parameters: { idade: p.ageYears, sexo: p.sex, pesoKg: p.weightKg, tomDePele: p.visual.skinTone }, parentCaseId: base.id, parentVersion: base.version },
    reviewLog: [{ date: new Date().toISOString().slice(0, 10), by: "gerador local", status: "draft", note: `Variante gerada por regras a partir de ${base.id}@${base.version}; requer revisão.` }]
  };
  // regras de sexo: se o caso tem gestação ou perguntas ginecológicas e o sexo mudou, recusa
  if (variant.patient.sex !== base.patient.sex && base.history.some((h) => h.topic === "gestacao" || h.topic === "ginecologico")) {
    return { ok: false, reasons: ["Troca de sexo recusada: o caso contém história ginecológica/gestacional dependente do sexo."], fingerprint };
  }
  const val = validateCase(variant);
  if (!val.ok || !val.caseDef) return { ok: false, reasons: [...reasons, ...val.errors], fingerprint };
  return { ok: true, caseDef: val.caseDef, fingerprint, reasons };
}
