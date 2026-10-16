/**
 * Avaliação rastreável. Cada item declara evidência no log, janela, alternativas, pontos,
 * gravidade, justificativa e fonte. Desfecho clínico, competência e falhas críticas são separados.
 * Morte não zera automaticamente a nota.
 */
import type { ScoringRule } from "../domain/schema";
import { convert, unitDimension } from "../domain/units";
import { evaluate, drugTotals } from "./conditions";
import type { EngineContext, SimState } from "./types";
import { formatClock, secondsToTicks } from "./util";

export const DOMAIN_WEIGHTS = {
  historia: 20,
  priorizacao: 20,
  exames: 15,
  tratamento: 25,
  reavaliacao: 10,
  destino: 10
} as const;
export type ScoreDomain = keyof typeof DOMAIN_WEIGHTS;

export const DOMAIN_LABELS: Record<ScoreDomain, string> = {
  historia: "História e avaliação inicial",
  priorizacao: "Priorização e medidas iniciais",
  exames: "Uso apropriado de exames",
  tratamento: "Tratamento e procedimentos",
  reavaliacao: "Reavaliação e monitorização",
  destino: "Destino e plano de continuidade"
};

export interface ItemResult {
  ruleId: string;
  domain: ScoreDomain;
  description: string;
  met: boolean;
  penalty: boolean;
  pointsPossible: number;
  pointsEarned: number;
  severity: ScoringRule["severity"];
  evidence: string;
  window?: string;
  rationale: string;
  alternatives?: string;
  sourceIds: string[];
}

export interface AssessmentResult {
  sessionId: string;
  caseId: string;
  caseVersion: string;
  domainScores: { domain: ScoreDomain; label: string; earned: number; max: number }[];
  total: number;
  items: ItemResult[];
  criticalFailures: ItemResult[];
  outcome: { clinical: string; history: { outcome: string; time: string }[] };
  timeline: { time: string; text: string; kind: string }[];
  diagnosisCorrect: boolean;
  dispositionAccepted: boolean;
  hintsUsed: number;
  references: string[];
  reviewStatus: string;
  suggestions: string[];
}

function firstTickWhere<T>(list: T[], pred: (x: T) => boolean, tickOf: (x: T) => number): number | undefined {
  let best: number | undefined;
  for (const x of list) if (pred(x)) best = best === undefined ? tickOf(x) : Math.min(best, tickOf(x));
  return best;
}

function evaluateItem(rule: ScoringRule, s: SimState, ctx: EngineContext): { met: boolean; evidence: string; window?: string } {
  const ev = rule.evidence;
  const win = "withinSeconds" in ev && ev.withinSeconds !== undefined ? secondsToTicks(ev.withinSeconds) : undefined;
  const winText = win !== undefined ? `até ${formatClock(win)}` : undefined;
  switch (ev.kind) {
    case "actionDone": {
      const t = firstTickWhere(s.actionLog, (a) => ev.anyOf.includes(a.actionId) && a.event === "complete", (a) => a.tick);
      const toggle = firstTickWhere(s.actionLog, (a) => ev.anyOf.includes(a.actionId) && a.event === "start", (a) => a.tick);
      const tt = t ?? toggle;
      const met = tt !== undefined && (win === undefined || tt <= win);
      return { met, evidence: tt !== undefined ? `Realizado em ${formatClock(tt)}.` : "Não realizado.", window: winText };
    }
    case "drugGiven": {
      let earliest: number | undefined;
      let totalOk = true;
      for (const d of ev.anyOf) {
        const tAdm = firstTickWhere(s.administrations, (a) => a.drugId === d && (!ev.routes || ev.routes.includes(a.route)), (a) => a.tick);
        const tInf = firstTickWhere(s.treatments, (t) => t.drugId === d && (!ev.routes || ev.routes.includes(t.route)), (t) => t.startTick);
        const t = [tAdm, tInf].filter((x): x is number => x !== undefined).sort((a, b) => a - b)[0];
        if (t !== undefined) earliest = earliest === undefined ? t : Math.min(earliest, t);
      }
      if (earliest !== undefined && (ev.minTotal || ev.maxTotal)) {
        const dim = unitDimension((ev.minTotal ?? ev.maxTotal)!.unit);
        let have = 0;
        for (const d of ev.anyOf) {
          const tot = drugTotals(s, d);
          have += dim === "mass" ? tot.mg : dim === "volume" ? tot.mL : dim === "units" ? tot.UI : tot.mmol;
        }
        const conv = (q: { value: number; unit: Parameters<typeof convert>[0]["unit"] }) =>
          dim === "mass" ? convert(q, "mg").value : dim === "volume" ? convert(q, "mL").value : q.value;
        if (ev.minTotal && have + 1e-9 < conv(ev.minTotal)) totalOk = false;
        if (ev.maxTotal && have - 1e-9 > conv(ev.maxTotal)) totalOk = false;
      }
      const met = earliest !== undefined && totalOk && (win === undefined || earliest <= win);
      return {
        met,
        evidence: earliest !== undefined ? `Primeira administração em ${formatClock(earliest)}${totalOk ? "" : "; dose total fora do critério"}.` : "Não administrado.",
        window: winText
      };
    }
    case "historyAsked": {
      const asked = new Set(s.knowledge.history.map((h) => h.itemId));
      const n = ev.items.filter((i) => asked.has(i)).length;
      return { met: n >= ev.minCount, evidence: `${n} de ${ev.items.length} perguntas-chave realizadas (mínimo ${ev.minCount}).` };
    }
    case "examDone": {
      const regions = new Set(s.knowledge.exams.map((e) => e.region));
      const n = ev.regions.filter((r) => regions.has(r)).length;
      return { met: n >= ev.minCount, evidence: `${n} de ${ev.regions.length} regiões-chave examinadas (mínimo ${ev.minCount}).` };
    }
    case "testOrdered": {
      const t = firstTickWhere(s.orders, (o) => o.kind === "test" && ev.anyOf.includes(o.refId) && o.status !== "cancelada", (o) => o.createdTick);
      const met = t !== undefined && (win === undefined || t <= win);
      return { met, evidence: t !== undefined ? `Solicitado em ${formatClock(t)}.` : "Não solicitado.", window: winText };
    }
    case "diagnosis": {
      const met = !!s.finalDiagnosis && ev.accepted.includes(s.finalDiagnosis);
      return { met, evidence: s.finalDiagnosis ? `Diagnóstico final registrado: ${s.finalDiagnosis}.` : "Diagnóstico final não registrado." };
    }
    case "differential": {
      const n = s.differential.filter((d) => ev.anyOf.includes(d)).length;
      return { met: n >= ev.minCount, evidence: `${n} diferencial(is) pertinente(s) listado(s).` };
    }
    case "disposition": {
      const met = !!s.disposition && ev.accepted.includes(s.disposition);
      return { met, evidence: s.disposition ? `Destino: ${s.disposition}.` : "Destino não definido." };
    }
    case "avoidAction": {
      const t = firstTickWhere(s.actionLog, (a) => ev.anyOf.includes(a.actionId) && (a.event === "complete" || a.event === "start"), (a) => a.tick);
      return { met: t !== undefined, evidence: t !== undefined ? `Realizado em ${formatClock(t)}.` : "Não realizado." };
    }
    case "avoidDrug": {
      let given = false;
      let when: number | undefined;
      for (const d of ev.anyOf) {
        const tot = drugTotals(s, d);
        if (tot.count === 0) continue;
        if (ev.maxTotal) {
          const dim = unitDimension(ev.maxTotal.unit);
          const have = dim === "mass" ? tot.mg : dim === "volume" ? tot.mL : dim === "units" ? tot.UI : tot.mmol;
          const lim = dim === "mass" ? convert(ev.maxTotal, "mg").value : dim === "volume" ? convert(ev.maxTotal, "mL").value : ev.maxTotal.value;
          if (have <= lim + 1e-9) continue;
        }
        given = true;
        when = firstTickWhere(s.administrations, (a) => a.drugId === d, (a) => a.tick) ?? firstTickWhere(s.treatments, (t) => t.drugId === d, (t) => t.startTick);
      }
      return { met: given, evidence: given ? `Administrado${when !== undefined ? ` em ${formatClock(when)}` : ""}.` : "Não administrado." };
    }
    case "reassessAfter": {
      const after = [
        ...s.actionLog.filter((a) => ev.after.includes(a.actionId) && a.event === "complete").map((a) => a.tick),
        ...s.administrations.filter((a) => ev.after.includes(a.drugId)).map((a) => a.tick),
        ...s.treatments.filter((t) => ev.after.includes(t.drugId)).map((t) => t.startTick)
      ].sort((a, b) => a - b)[0];
      if (after === undefined) return { met: false, evidence: "Intervenção de referência não realizada." };
      const lim = after + secondsToTicks(ev.withinSeconds);
      const reassess = [
        ...s.actionLog.filter((a) => ev.reassess.includes(a.actionId) && a.event === "complete" && a.tick > after && a.tick <= lim).map((a) => a.tick),
        ...s.knowledge.exams.filter((e) => ev.reassess.includes(e.region) && e.tick > after && e.tick <= lim).map((e) => e.tick),
        ...s.orders.filter((o) => o.kind === "test" && ev.reassess.includes(o.refId) && o.createdTick > after && o.createdTick <= lim).map((o) => o.createdTick)
      ].sort((a, b) => a - b)[0];
      // Monitorização contínua instalada conta como reavaliação dos sinais monitorados.
      const continuous = ev.reassess.includes("monitorizacao_continua") && s.devices.includes("monitor_ecg");
      const met = reassess !== undefined || continuous;
      return {
        met,
        evidence: reassess !== undefined ? `Reavaliado em ${formatClock(reassess)} (intervenção em ${formatClock(after)}).` : continuous ? "Monitorização contínua instalada durante a evolução." : `Sem reavaliação até ${formatClock(lim)}.`,
        window: `até ${ev.withinSeconds} s após a intervenção`
      };
    }
    case "testsNotExcessive": {
      const unjust = s.orders.filter((o) => o.kind === "test" && o.status !== "cancelada" && !ev.justified.includes(o.refId));
      const labels = [...new Set(unjust.map((o) => o.label))];
      return {
        met: unjust.length <= ev.maxUnjustified,
        evidence: unjust.length === 0 ? "Nenhum exame sem justificativa prevista." : `Exames fora do conjunto justificado: ${labels.join(", ")}.`
      };
    }
    case "stateAtEnd": {
      const met = evaluate(ev.when, s);
      return { met, evidence: met ? "Critério de estado ao final atendido." : "Critério de estado ao final não atendido." };
    }
  }
}

export function assess(s: SimState, ctx: EngineContext, resolveLabel: (kind: "outcome", id: string) => string = (_k, id) => id): AssessmentResult {
  const items: ItemResult[] = ctx.caseDef.scoring.map((rule) => {
    const r = evaluateItem(rule, s, ctx);
    const earned = rule.penalty ? (r.met ? -rule.points : 0) : r.met ? rule.points : 0;
    return {
      ruleId: rule.id,
      domain: rule.domain,
      description: rule.description,
      met: r.met,
      penalty: rule.penalty,
      pointsPossible: rule.penalty ? 0 : rule.points,
      pointsEarned: earned,
      severity: rule.severity,
      evidence: r.evidence,
      window: r.window,
      rationale: rule.rationale,
      alternatives: rule.alternatives,
      sourceIds: rule.sourceIds
    };
  });

  // normalização: cada domínio com itens recebe seu peso; domínios vazios redistribuem proporcionalmente
  const domains = Object.keys(DOMAIN_WEIGHTS) as ScoreDomain[];
  const present = domains.filter((d) => items.some((i) => i.domain === d && !i.penalty));
  const weightSum = present.reduce((acc, d) => acc + DOMAIN_WEIGHTS[d], 0) || 1;
  const domainScores = domains.map((d) => {
    const ds = items.filter((i) => i.domain === d);
    const possible = ds.reduce((a, i) => a + i.pointsPossible, 0);
    const earned = ds.reduce((a, i) => a + i.pointsEarned, 0);
    const max = present.includes(d) ? (DOMAIN_WEIGHTS[d] * 100) / weightSum : 0;
    const value = possible > 0 ? Math.max(0, (earned / possible) * max) : 0;
    return { domain: d, label: DOMAIN_LABELS[d], earned: Math.round(value * 10) / 10, max: Math.round(max * 10) / 10 };
  });
  const total = Math.min(100, Math.round(domainScores.reduce((a, d) => a + d.earned, 0) * 10) / 10);

  const criticalFailures = items.filter((i) => i.severity === "critica" && (i.penalty ? i.met : !i.met));

  const timeline: AssessmentResult["timeline"] = [];
  for (const c of s.commandLog) timeline.push({ time: formatClock(c.simTick), text: describeCommand(c.type, c.payload, ctx), kind: "comando" });
  for (const a of s.actionLog) if (a.event === "fail") timeline.push({ time: formatClock(a.tick), text: `Falha técnica: ${ctx.catalog.actions.get(a.actionId)?.label ?? a.actionId}`, kind: "falha" });
  for (const r of s.knowledge.results) timeline.push({ time: formatClock(r.availableTick), text: `Resultado: ${r.label}`, kind: "resultado" });
  for (const m of s.knowledge.staffMessages) if (m.from !== "laboratorio") timeline.push({ time: formatClock(m.tick), text: `${m.from}: ${m.text}`, kind: "equipe" });
  for (const o of s.outcomeHistory) timeline.push({ time: formatClock(o.tick), text: `Evolução clínica: ${resolveLabel("outcome", o.outcome)}`, kind: "evolucao" });
  timeline.sort((a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : 0));

  const missed = items.filter((i) => !i.penalty && !i.met).sort((a, b) => sev(a.severity) - sev(b.severity));
  const suggestions = missed.slice(0, 4).map((i) => `Revisar: ${i.description}`);
  if (s.hintsUsed.length > 2) suggestions.push("Repetir o caso em modo treino livre, com menos dicas.");

  return {
    sessionId: s.sessionId,
    caseId: s.caseId,
    caseVersion: s.caseVersion,
    domainScores,
    total,
    items,
    criticalFailures,
    outcome: { clinical: s.outcome?.outcome ?? "sem_desfecho_definido", history: s.outcomeHistory.map((o) => ({ outcome: o.outcome, time: formatClock(o.tick) })) },
    timeline,
    diagnosisCorrect: !!s.finalDiagnosis && ctx.caseDef.diagnosis.accepted.includes(s.finalDiagnosis),
    dispositionAccepted: !!s.disposition && ctx.caseDef.acceptedDestinations.includes(s.disposition),
    hintsUsed: s.hintsUsed.length,
    references: ctx.caseDef.references,
    reviewStatus: ctx.caseDef.status,
    suggestions
  };
}

function sev(s: string): number {
  return s === "critica" ? 0 : s === "importante" ? 1 : 2;
}

function describeCommand(type: string, p: Record<string, unknown>, ctx: EngineContext): string {
  switch (type) {
    case "askHistory": {
      const h = ctx.caseDef.history.find((x) => x.id === p.itemId);
      return `Pergunta: ${h?.question ?? String(p.itemId)}`;
    }
    case "examine":
      return `Exame físico: ${String(p.region)} (${String(p.maneuver)})`;
    case "performAction":
      return `Ação: ${ctx.catalog.actions.get(String(p.actionId))?.label ?? String(p.actionId)}`;
    case "orderTest":
      return `Exame solicitado: ${ctx.catalog.tests.get(String(p.testId))?.label ?? String(p.testId)}`;
    case "prescribe": {
      const rx = p.prescription as { drugId: string; dose: { value: number; unit: string }; route: string; mode: string; rate?: { value: number; unit: string } } | undefined;
      if (!rx) return "Prescrição";
      const d = ctx.catalog.drugs.get(rx.drugId);
      const dose = rx.mode === "infusao" && rx.rate ? `${rx.rate.value} ${rx.rate.unit}` : `${String(rx.dose.value).replace(".", ",")} ${rx.dose.unit}`;
      return `Prescrição: ${d?.name ?? rx.drugId} ${dose} ${rx.route} (${rx.mode})`;
    }
    case "cancelOrder":
      return "Ordem cancelada";
    case "stopTreatment":
      return "Infusão suspensa";
    case "titrateInfusion":
      return "Infusão titulada";
    case "setDifferential":
      return "Diferenciais atualizados";
    case "setFinalDiagnosis":
      return "Diagnóstico final registrado";
    case "setDisposition":
      return `Destino definido: ${String(p.destination)}`;
    case "requestHint":
      return `Dica solicitada (nível ${String(p.level)})`;
    case "endEncounter":
      return "Atendimento encerrado";
    default:
      return type;
  }
}
