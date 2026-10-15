/**
 * Projeções do estado:
 *  - learnerView: SOMENTE o que o aluno pode saber. Nunca inclui diagnóstico, regras, gatilhos futuros
 *    nem valores verdadeiros não medidos.
 *  - visualState: dados derivados para o renderer 3D (que não decide nada clínico).
 *  - patientFacts: o que o paciente conversacional pode saber.
 */
import type { DeviceId } from "../domain/resources";
import { VARS, type VarId } from "../domain/variables";
import type { EngineContext, Measurement, SimState } from "./types";
import { drugTotals } from "./conditions";

export interface MonitorReading {
  var: VarId;
  value: number | null;
  quality: "ok" | "ruim" | "indisponivel";
  source: "continuo" | "ultima_medida";
  tick: number;
}

export interface LearnerView {
  sessionId: string;
  caseId: string;
  tick: number;
  ended: boolean;
  devices: DeviceId[];
  activeToggles: string[];
  monitor: {
    installed: boolean;
    rhythmTrace: string | null; // tipo do traçado para desenho; rótulo depende do modo
    electricalRate: number | null;
    readings: MonitorReading[];
  };
  inspection: { rr: number | null; speech: string; consciousness: string; posture: string };
  knowledge: SimState["knowledge"];
  orders: SimState["orders"];
  treatments: { id: string; drugId: string; route: string; rate: string; active: boolean; deliveredText: string; startTick: number }[];
  administrations: SimState["administrations"];
  differential: string[];
  finalDiagnosis?: string;
  disposition?: string;
  communication: SimState["communication"];
  /** desfecho só é público quando terminal (ex.: óbito ou encerramento) */
  terminalOutcome?: string;
}

function lastMeasured(state: SimState, v: VarId): Measurement | undefined {
  for (let i = state.knowledge.measurements.length - 1; i >= 0; i--) {
    const m = state.knowledge.measurements[i]!;
    if (m.var === v) return m;
  }
  return undefined;
}

function rnd(v: number, d: number): number {
  const f = 10 ** d;
  return Math.round(v * f) / f;
}

export function learnerView(state: SimState, ctx: EngineContext): LearnerView {
  const has = (d: DeviceId) => state.devices.includes(d);
  const readings: MonitorReading[] = [];
  const pulse = state.flags.pulse !== false;
  const perf = state.vars.perfusion ?? 1;
  if (has("monitor_ecg")) {
    readings.push({ var: "hr", value: rnd(state.vars.hr ?? 0, 0), quality: "ok", source: "continuo", tick: state.tick });
  }
  if (has("oximetro")) {
    const q = !pulse ? "indisponivel" : perf < 0.3 ? "ruim" : "ok";
    readings.push({ var: "spo2", value: q === "indisponivel" ? null : rnd(state.vars.spo2 ?? 0, 0), quality: q, source: "continuo", tick: state.tick });
  }
  if (has("capnografo") && (has("tot") || has("bvm") || has("vni"))) {
    readings.push({ var: "etco2", value: rnd(state.vars.etco2 ?? 0, 0), quality: "ok", source: "continuo", tick: state.tick });
  }
  if (has("cardiotoco") && state.vars.fetalHr !== undefined) {
    readings.push({ var: "fetalHr", value: rnd(state.vars.fetalHr, 0), quality: "ok", source: "continuo", tick: state.tick });
  }
  for (const v of ["sbp", "dbp", "temp", "glucose"] as VarId[]) {
    const m = lastMeasured(state, v);
    if (m) readings.push({ var: v, value: m.value, quality: m.quality, source: "ultima_medida", tick: m.tick });
  }
  const rrVisible = ctx.caseDef.initial.visibleWithoutDevice.includes("rr");
  return {
    sessionId: state.sessionId,
    caseId: state.caseId,
    tick: state.tick,
    ended: state.ended,
    devices: [...state.devices],
    activeToggles: [...state.activeToggles],
    monitor: {
      installed: has("monitor_ecg"),
      rhythmTrace: has("monitor_ecg") ? String(state.flags.rhythm) : null,
      electricalRate: has("monitor_ecg") ? rnd(state.vars.hr ?? 0, 0) : null,
      readings
    },
    inspection: {
      rr: rrVisible ? rnd(state.vars.rr ?? 0, 0) : null,
      speech: String(state.flags.speech ?? "frases"),
      consciousness: String(state.flags.consciousness ?? "alerta"),
      posture: String(state.flags.posture ?? "supino")
    },
    knowledge: structuredClone(state.knowledge),
    orders: structuredClone(state.orders),
    treatments: state.treatments.map((t) => ({
      id: t.id,
      drugId: t.drugId,
      route: t.route,
      rate: `${t.displayRate.value} ${t.displayRate.unit}`,
      active: t.active,
      deliveredText: `${rnd(t.delivered, 2)} ${t.rateUnitBase}`,
      startTick: t.startTick
    })),
    administrations: structuredClone(state.administrations),
    differential: [...state.differential],
    finalDiagnosis: state.finalDiagnosis,
    disposition: state.disposition,
    communication: state.communication,
    terminalOutcome: state.ended ? state.outcome?.outcome : undefined
  };
}

export interface VisualState {
  posture: string;
  respiratoryRatePerMinute: number;
  respiratoryEffortLevel: number;
  isBreathing: boolean;
  consciousnessVisualState: "alerta" | "sonolento" | "irresponsivo";
  painVisualState: "nenhuma" | "leve" | "moderada" | "intensa";
  skinFindings: { pallor: number; cyanosis: number; sweating: boolean; urticaria: boolean; jaundice: boolean; rash: boolean; edema: boolean; bleeding: boolean; angioedema: boolean };
  activeDevices: DeviceId[];
  activeProcedures: string[];
  speechState: "frases" | "palavras" | "nenhuma";
  seizure: boolean;
  agitation: boolean;
  tremor: boolean;
  cough: boolean;
  pregnancyTrimester: number;
  heartRate: number;
  hasPulse: boolean;
}

export function visualState(state: SimState, ctx: EngineContext): VisualState {
  const rr = state.vars.rr ?? 16;
  const spo2 = state.vars.spo2 ?? 97;
  const perf = state.vars.perfusion ?? 1;
  const cons = String(state.flags.consciousness ?? "alerta");
  return {
    posture: String(state.flags.posture ?? "supino"),
    respiratoryRatePerMinute: rr,
    respiratoryEffortLevel: state.vars.effort ?? 0,
    isBreathing: rr > 0.5,
    consciousnessVisualState: cons === "alerta" ? "alerta" : cons === "voz" ? "sonolento" : "irresponsivo",
    painVisualState: (state.flags.painVisual as VisualState["painVisualState"]) ?? "nenhuma",
    skinFindings: {
      pallor: state.flags.pallor === true ? 1 : Math.max(0, Math.min(1, (0.7 - perf) / 0.5)),
      cyanosis: state.flags.cyanosis === true ? 1 : Math.max(0, Math.min(1, (88 - spo2) / 20)),
      sweating: state.flags.sweating === true,
      urticaria: state.flags.urticaria === true,
      jaundice: state.flags.jaundice === true,
      rash: state.flags.rash === true,
      edema: state.flags.edema === true,
      bleeding: state.flags.bleedingVisible === true,
      angioedema: state.flags.angioedema === true
    },
    activeDevices: [...state.devices],
    activeProcedures: [...state.activeToggles],
    speechState: (state.flags.speech as VisualState["speechState"]) ?? "frases",
    seizure: state.flags.seizure === true,
    agitation: state.flags.agitation === true,
    tremor: state.flags.tremor === true,
    cough: state.flags.cough === true,
    pregnancyTrimester: ctx.caseDef.patient.visual.pregnancyTrimester,
    heartRate: state.vars.hr ?? 80,
    hasPulse: state.flags.pulse !== false
  };
}

/** Fatos que o paciente conversacional pode saber: apenas respostas de fonte "paciente". */
export function publicPatientFacts(ctx: EngineContext): { topic: string; question: string; text: string }[] {
  const out: { topic: string; question: string; text: string }[] = [];
  for (const h of ctx.caseDef.history) {
    for (const a of h.answers) if (a.source === "paciente" && !a.when) out.push({ topic: h.topic, question: h.question, text: a.text });
  }
  return out;
}

export { drugTotals, VARS };
