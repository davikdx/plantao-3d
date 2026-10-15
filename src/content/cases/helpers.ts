/**
 * Auxiliares de autoria de casos. Geram apenas DADOS declarativos validados pelo schema
 * (sem código executável no conteúdo). Respostas fisiológicas continuam específicas de cada caso.
 */
import type { CaseDefinitionInput, Condition } from "../../domain/schema";

type In = CaseDefinitionInput;
export type HistoryIn = In["history"][number];
export type ExamIn = NonNullable<In["exam"]>[number];
export type RuleIn = NonNullable<In["rules"]>[number];
export type ScoreIn = In["scoring"][number];
export type TrajIn = NonNullable<In["tests"]>[number];

export function h(id: string, topic: HistoryIn["topic"], question: string, text: string, opts: { keywords?: string[]; extra?: HistoryIn["answers"] } = {}): HistoryIn {
  return { id, topic, question, answers: [{ source: "paciente", text }, ...(opts.extra ?? [])], keywords: opts.keywords ?? [] };
}

/** história cuja resposta vem de informante/acompanhante (paciente pode não responder) */
export function hi(id: string, topic: HistoryIn["topic"], question: string, answers: HistoryIn["answers"], keywords: string[] = []): HistoryIn {
  return { id, topic, question, answers, keywords };
}

export function ex(id: string, region: ExamIn["region"], maneuver: ExamIn["maneuver"], text: string, opts: { label?: string; better?: { when: Condition; text: string }[]; sound?: ExamIn["sound"] } = {}): ExamIn {
  const variants = [...(opts.better ?? []), { text }];
  return { id, region, maneuver, label: opts.label, variants, sound: opts.sound };
}

export const O2_ON: Condition = { any: [{ deviceActive: "cateter_nasal" }, { deviceActive: "mascara_reservatorio" }, { deviceActive: "bvm" }, { deviceActive: "tot" }, { deviceActive: "vni" }, { deviceActive: "nebulizador" }] };

/** Resposta de SpO2 ao O2 enquanto o dispositivo estiver ativo (efeito retirado ao remover). */
export function oxygenResponse(target: number, tauSeconds = 60, extraWhen?: Condition, priority = 30): RuleIn {
  return {
    id: "r-o2-resposta",
    description: `Oxigênio suplementar: SpO₂ tende a ${target}% enquanto instalado (simplificação do simulador)`,
    priority: 40,
    when: extraWhen ? { all: [O2_ON, extraWhen] } : O2_ON,
    repeat: "while",
    effects: [{ type: "trendToTarget", var: "spo2", target, tauSeconds, slot: "o2", priority }],
    onEnd: [{ type: "clearTrend", var: "spo2", slot: "o2" }],
    sourceIds: ["AUTOR-SIMPLIFICACAO"]
  };
}

export function trend(v: string, target: number, tauSeconds: number, slot: string, priority = 10, durationSeconds?: number) {
  return { type: "trendToTarget" as const, var: v as never, target, tauSeconds, slot, priority, ...(durationSeconds ? { durationSeconds } : {}) };
}

export function staff(from: "enfermagem" | "supervisor" | "acompanhante" | "regulacao" | "paciente" | "laboratorio", text: string) {
  return { type: "emitStaffMessage" as const, from, text };
}

export function flag(f: string, value: string | boolean) {
  return { type: "setFlag" as const, flag: f as never, value };
}

export function obs(text: string) {
  return { type: "addObservation" as const, text };
}

export function outcome(o: "melhora" | "estabilizacao_parcial" | "piora" | "complicacao" | "parada" | "rosc" | "obito" | "transferencia_segura", terminal = false) {
  return { type: "setOutcome" as const, outcome: o, terminal };
}

/** Prescrição para trajetórias de teste. */
export function rx(atSeconds: number, drugId: string, presentationId: string, value: number, unit: string, route: string, mode: "bolus" | "infusao" | "infusao_volume" = "bolus", extra: Record<string, unknown> = {}) {
  return { atSeconds, type: "prescribe", payload: { prescription: { drugId, presentationId, dose: { value, unit }, route, mode, ...extra } } };
}

export function act(atSeconds: number, actionId: string, params: Record<string, unknown> = {}) {
  return { atSeconds, type: "performAction", payload: { actionId, params } };
}

export function test(atSeconds: number, testId: string) {
  return { atSeconds, type: "orderTest", payload: { testId } };
}

export function ask(atSeconds: number, itemId: string) {
  return { atSeconds, type: "askHistory", payload: { itemId } };
}

export function dest(atSeconds: number, destination: string) {
  return { atSeconds, type: "setDisposition", payload: { destination } };
}

export function dx(atSeconds: number, diagnosisId: string) {
  return { atSeconds, type: "setFinalDiagnosis", payload: { diagnosisId } };
}
