/**
 * Validação estrutural e de referências cruzadas de casos. Conteúdo que falha NÃO executa.
 * Passar nesta validação não torna o caso "clinicamente revisado".
 */
import { CaseDefinitionSchema, type CaseDefinition, type Condition } from "../domain/schema";
import { getResourceProfile } from "../domain/resources";
import { ACTIONS_BY_ID, DRUGS_BY_ID, TESTS_BY_ID, DIAGNOSES_BY_ID } from "./catalog";
import { REFERENCES_BY_ID } from "./references";

export interface ValidationReport {
  ok: boolean;
  errors: string[];
  warnings: string[];
  caseDef?: CaseDefinition;
}

function walk(c: Condition, fn: (c: Condition) => void): void {
  fn(c);
  if ("all" in c) c.all.forEach((x) => walk(x, fn));
  else if ("any" in c) c.any.forEach((x) => walk(x, fn));
  else if ("not" in c) walk(c.not, fn);
}

export function validateCase(input: unknown): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const parsed = CaseDefinitionSchema.safeParse(input);
  if (!parsed.success) {
    for (const i of parsed.error.issues.slice(0, 30)) errors.push(`schema: ${i.path.join(".")} — ${i.message}`);
    return { ok: false, errors, warnings };
  }
  const c = parsed.data;
  const profile = getResourceProfile(c.resourceProfile);
  if (!profile) errors.push(`perfil de recursos inexistente: ${c.resourceProfile}`);

  const checkCond = (cond: Condition, where: string) =>
    walk(cond, (x) => {
      if ("actionCompleted" in x && !ACTIONS_BY_ID.has(x.actionCompleted)) errors.push(`${where}: ação inexistente ${x.actionCompleted}`);
      if ("actionStarted" in x && !ACTIONS_BY_ID.has(x.actionStarted)) errors.push(`${where}: ação inexistente ${x.actionStarted}`);
      if ("drugGiven" in x && !DRUGS_BY_ID.has(x.drugGiven)) errors.push(`${where}: medicamento inexistente ${x.drugGiven}`);
      if ("treatmentActive" in x && !DRUGS_BY_ID.has(x.treatmentActive)) errors.push(`${where}: tratamento inexistente ${x.treatmentActive}`);
      if ("testCollected" in x && !TESTS_BY_ID.has(x.testCollected)) errors.push(`${where}: exame inexistente ${x.testCollected}`);
      if ("ruleFired" in x && !c.rules.some((r) => r.id === x.ruleFired)) errors.push(`${where}: regra inexistente ${x.ruleFired}`);
      if ("elapsedSince" in x && x.elapsedSince !== "start") {
        const [kind, id] = x.elapsedSince.split(":");
        const ok =
          (kind === "action" && ACTIONS_BY_ID.has(id ?? "")) ||
          (kind === "rule" && c.rules.some((r) => r.id === id)) ||
          (kind === "drug" && DRUGS_BY_ID.has(id ?? "")) ||
          (kind === "test" && TESTS_BY_ID.has(id ?? ""));
        // referências a ids inexistentes são permitidas apenas no caso técnico (teste do contrato)
        if (!ok && !c.technical) errors.push(`${where}: referência temporal inválida ${x.elapsedSince}`);
      }
    });

  const ruleIds = new Set<string>();
  for (const r of c.rules) {
    if (ruleIds.has(r.id)) errors.push(`regra duplicada: ${r.id}`);
    ruleIds.add(r.id);
    checkCond(r.when, `regra ${r.id}`);
    for (const s of r.sourceIds) if (!REFERENCES_BY_ID.has(s)) errors.push(`regra ${r.id}: fonte inexistente ${s}`);
  }
  const histIds = new Set<string>();
  for (const hItem of c.history) {
    if (histIds.has(hItem.id)) errors.push(`pergunta duplicada: ${hItem.id}`);
    histIds.add(hItem.id);
    for (const a of hItem.answers) {
      if (a.source !== "paciente" && a.source !== "prontuario" && !c.informants.some((i) => i.id === a.source)) errors.push(`história ${hItem.id}: fonte de resposta desconhecida ${a.source}`);
      if (a.when) checkCond(a.when, `história ${hItem.id}`);
    }
  }
  for (const e of c.exam) for (const v of e.variants) if (v.when) checkCond(v.when, `exame ${e.id}`);
  for (const t of c.testResults) {
    if (!TESTS_BY_ID.has(t.testId)) errors.push(`resultado para exame inexistente: ${t.testId}`);
    for (const v of t.variants) if (v.when) checkCond(v.when, `resultado ${t.testId}`);
  }
  for (const a of c.highlightedActions) if (!ACTIONS_BY_ID.has(a)) errors.push(`ação destacada inexistente: ${a}`);
  for (const f of c.procedureFailures) if (!ACTIONS_BY_ID.has(f.actionId)) errors.push(`falha programada em ação inexistente: ${f.actionId}`);
  for (const d of [c.diagnosis.primary, ...c.diagnosis.accepted, ...c.diagnosis.differentials]) if (!DIAGNOSES_BY_ID.has(d)) errors.push(`diagnóstico inexistente: ${d}`);
  if (!c.diagnosis.accepted.includes(c.diagnosis.primary)) errors.push("diagnóstico principal precisa estar entre os aceitos");
  if (profile) for (const d of c.acceptedDestinations) if (!profile.destinations.includes(d)) errors.push(`destino aceito ${d} não existe no perfil ${profile.id}`);
  for (const ref of c.references) if (!REFERENCES_BY_ID.has(ref)) errors.push(`referência inexistente: ${ref}`);

  for (const s of c.scoring) {
    const e = s.evidence;
    for (const src of s.sourceIds) if (!REFERENCES_BY_ID.has(src)) errors.push(`pontuação ${s.id}: fonte inexistente ${src}`);
    if (e.kind === "actionDone" || e.kind === "avoidAction") e.anyOf.forEach((a) => !ACTIONS_BY_ID.has(a) && errors.push(`pontuação ${s.id}: ação inexistente ${a}`));
    if (e.kind === "drugGiven" || e.kind === "avoidDrug") e.anyOf.forEach((d) => !DRUGS_BY_ID.has(d) && errors.push(`pontuação ${s.id}: medicamento inexistente ${d}`));
    if (e.kind === "testOrdered") e.anyOf.forEach((t) => !TESTS_BY_ID.has(t) && errors.push(`pontuação ${s.id}: exame inexistente ${t}`));
    if (e.kind === "testsNotExcessive") e.justified.forEach((t) => !TESTS_BY_ID.has(t) && errors.push(`pontuação ${s.id}: exame inexistente ${t}`));
    if (e.kind === "historyAsked") e.items.forEach((i) => !histIds.has(i) && errors.push(`pontuação ${s.id}: pergunta inexistente ${i}`));
    if (e.kind === "diagnosis" || e.kind === "differential") (e.kind === "diagnosis" ? e.accepted : e.anyOf).forEach((d) => !DIAGNOSES_BY_ID.has(d) && errors.push(`pontuação ${s.id}: diagnóstico inexistente ${d}`));
    if (e.kind === "reassessAfter") {
      e.after.forEach((a) => !ACTIONS_BY_ID.has(a) && !DRUGS_BY_ID.has(a) && errors.push(`pontuação ${s.id}: referência 'after' inexistente ${a}`));
      e.reassess.forEach((a) => a !== "monitorizacao_continua" && !ACTIONS_BY_ID.has(a) && !TESTS_BY_ID.has(a) && !/^(cabeca|olhos|boca|pescoco|torax_|coracao|abdome_|pelve|membro_|pele|neurologico|geral)/.test(a) && errors.push(`pontuação ${s.id}: reavaliação inexistente ${a}`));
    }
    if (e.kind === "stateAtEnd") checkCond(e.when, `pontuação ${s.id}`);
  }
  for (const t of c.tests) for (const ex of t.expect) checkCond(ex.condition, `trajetória ${t.id}`);

  // Coerência demográfica
  const p = c.patient;
  if (p.pregnancyWeeks !== undefined && p.pregnancyWeeks > 0) {
    if (p.sex !== "feminino") errors.push("gestação exige sexo feminino");
    const tri = p.pregnancyWeeks < 14 ? 1 : p.pregnancyWeeks < 28 ? 2 : 3;
    if (p.visual.pregnancyTrimester !== 0 && p.visual.pregnancyTrimester !== tri && p.pregnancyWeeks < 42) warnings.push(`trimestre visual (${p.visual.pregnancyTrimester}) difere da IG (${p.pregnancyWeeks} semanas)`);
  }
  if (p.visual.sex !== p.sex) errors.push("sexo do perfil visual difere do paciente");
  const ageGroupOk: Record<string, [number, number]> = { lactente: [0, 2], crianca_pequena: [1, 6], escolar: [5, 12], adolescente: [11, 19], adulto: [17, 70], idoso: [60, 120] };
  const range = ageGroupOk[p.visual.ageGroup]!;
  if (p.ageYears < range[0] || p.ageYears > range[1]) errors.push(`idade ${p.ageYears} incompatível com grupo visual ${p.visual.ageGroup}`);
  if (p.ageYears < 1 && (p.weightKg < 2 || p.weightKg > 13)) errors.push("peso incompatível com lactente");
  if (p.ageYears >= 18 && p.weightKg < 30) errors.push("peso incompatível com adulto");

  if (!c.technical) {
    const kinds = new Set(c.tests.map((t) => t.kind));
    // rascunhos podem ser salvos sem trajetórias; a partir de "testado tecnicamente" elas são obrigatórias
    const needs = c.status !== "draft" && c.status !== "schemaValidated";
    for (const k of ["acceptable", "no_intervention", "inadequate"] as const) {
      if (!kinds.has(k)) (needs ? errors : warnings).push(`caso clínico sem trajetória de teste '${k}'`);
    }
    if (c.status === "clinicallyReviewed" || c.status === "published") {
      if (!c.reviewLog.some((r) => r.status === "clinicallyReviewed")) errors.push("status de revisão clínica sem registro de revisor no reviewLog");
    }
  }
  return { ok: errors.length === 0, errors, warnings, caseDef: errors.length === 0 ? c : undefined };
}
