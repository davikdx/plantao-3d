/**
 * Motor clínico determinístico.
 * - Passo fixo de 0,1 s (tick inteiro). Independente da taxa de quadros.
 * - Não importa React, Three.js nem rede.
 * - Mesmo caso + mesma seed + mesmos comandos nos mesmos ticks => mesmo estado (testado).
 *
 * Ordem dentro de um tick (de t para t+1):
 *   1. integra tendências e infusões durante dt;
 *   2. tick++;
 *   3. processa eventos devidos em ordem estável (tick, prioridade, seq);
 *   4. avalia regras em ordem estável (prioridade desc, id asc).
 * Comandos são aplicados no tick atual, antes do próximo passo.
 */
import { LearnerCommandSchema, PrescriptionSchema, type Effect, type LearnerCommand, type ManeuverId, type RegionId, type Rule } from "../domain/schema";
import { clampVar, isVarId, VARS, validateFlagValue, isFlagId, type VarId } from "../domain/variables";
import type { DeviceId } from "../domain/resources";
import { convert, resolveTotalDose, unitDimension, UnitError, type Quantity } from "../domain/units";
import { evaluate } from "./conditions";
import type { CommandResult, EngineContext, Order, QueuedEvent, SimState, TestResultView, Treatment } from "./types";
import { deepClone, fnv1a, nextRandom, secondsToTicks, stableStringify, TICK_SECONDS } from "./util";

export const NIBP_CYCLE_SECONDS = 180;

const EXAM_DURATION: Record<ManeuverId, number> = {
  inspecao: 5,
  palpacao: 8,
  percussao: 8,
  ausculta: 10,
  especial: 15
};

const ROUTE_DURATION: Record<string, number> = {
  IV: 30,
  IO: 30,
  IM: 20,
  SC: 20,
  VO: 30,
  SL: 20,
  IN: 15,
  retal: 30,
  inalatoria: 60,
  nebulizacao: 600,
  endotraqueal: 20,
  SNG: 30,
  ocular: 15
};

// ---------------------------------------------------------------------------
// Criação
// ---------------------------------------------------------------------------
export function createSession(ctx: EngineContext, opts: { sessionId: string; seed: number; branchId?: string }): SimState {
  const c = ctx.caseDef;
  const vars: Record<string, number> = {};
  for (const [k, v] of Object.entries(c.initial.vars)) {
    if (!isVarId(k)) throw new Error(`Variável desconhecida no caso: ${k}`);
    vars[k] = clampVar(k, v);
  }
  const flags: Record<string, string | boolean | number> = {
    pulse: true,
    rhythm: "sinusal",
    airway: "pervia",
    consciousness: "alerta",
    communication: c.communication,
    posture: "supino",
    painVisual: "nenhuma",
    speech: "frases"
  };
  for (const [k, v] of Object.entries(c.initial.flags)) {
    if (!isFlagId(k) || !validateFlagValue(k, v)) throw new Error(`Flag inválida no caso: ${k}=${String(v)}`);
    flags[k] = v;
  }
  const state: SimState = {
    schemaVersion: 1,
    sessionId: opts.sessionId,
    branchId: opts.branchId ?? "principal",
    caseId: c.id,
    caseVersion: c.version,
    seed: opts.seed,
    rng: opts.seed | 0,
    tick: 0,
    vars,
    flags,
    trends: {},
    devices: [...new Set(c.initial.devices)].sort() as DeviceId[],
    activeToggles: [],
    orders: [],
    treatments: [],
    administrations: [],
    actionLog: [],
    rules: {},
    scheduledKeys: [],
    queue: [],
    seq: 0,
    communication: c.communication,
    outcomeHistory: [],
    knowledge: { history: [], exams: [], observations: [], measurements: [], staffMessages: [], results: [], pendingSamples: {} },
    processedCommandIds: [],
    commandLog: [],
    eventLog: [],
    differential: [],
    hintsUsed: [],
    ended: false
  };
  logEvent(state, ctx, "session.start", { engine: "core" }, { seed: opts.seed });
  // Regras em t=0 (ex.: tendências de evolução natural)
  evaluateRules(state, ctx);
  return state;
}

// ---------------------------------------------------------------------------
// Avanço de tempo
// ---------------------------------------------------------------------------
export function step(state: SimState, ctx: EngineContext): void {
  if (state.ended) return;
  integrate(state, TICK_SECONDS);
  state.tick += 1;
  processQueue(state, ctx);
  evaluateRules(state, ctx);
}

export function advanceTo(state: SimState, ctx: EngineContext, targetTick: number): SimState {
  while (state.tick < targetTick && !state.ended) step(state, ctx);
  return state;
}

function integrate(state: SimState, dt: number): void {
  // tendências
  const varIds = Object.keys(state.trends).sort();
  for (const v of varIds) {
    const list = state.trends[v]!.filter((t) => t.endTick === undefined || t.endTick > state.tick);
    state.trends[v] = list;
    if (list.length === 0) continue;
    const win = [...list].sort((a, b) => b.priority - a.priority || b.startTick - a.startTick || (a.slot < b.slot ? -1 : 1))[0]!;
    const x = state.vars[v] ?? (VARS[v as VarId].adultDefault ?? 0);
    const next = win.target + (x - win.target) * Math.exp(-dt / win.tauSeconds);
    state.vars[v] = clampVar(v as VarId, next);
  }
  // infusões
  for (const tr of state.treatments) {
    if (!tr.active) continue;
    let amount = tr.ratePerMin * (dt / 60);
    if (tr.targetTotal !== undefined && tr.delivered + amount >= tr.targetTotal) {
      amount = tr.targetTotal - tr.delivered;
      tr.delivered = tr.targetTotal;
      tr.active = false;
      tr.endTick = state.tick + 1;
      continue;
    }
    tr.delivered += amount;
  }
}

function enqueue(state: SimState, ev: Omit<QueuedEvent, "seq" | "id">): void {
  state.seq += 1;
  state.queue.push({ ...ev, seq: state.seq, id: `q${state.seq}` });
}

function processQueue(state: SimState, ctx: EngineContext): void {
  const due = state.queue
    .filter((e) => e.tick <= state.tick)
    .sort((a, b) => a.tick - b.tick || b.priority - a.priority || a.seq - b.seq);
  if (due.length === 0) return;
  const dueIds = new Set(due.map((d) => d.id));
  state.queue = state.queue.filter((e) => !dueIds.has(e.id));
  for (const ev of due) {
    switch (ev.kind) {
      case "order.complete":
        completeOrder(state, ctx, ev.ref);
        break;
      case "test.collect":
        collectTest(state, ctx, ev.ref);
        break;
      case "test.available":
        releaseTest(state, ctx, ev.ref);
        break;
      case "scheduled.effects":
        applyEffects(state, ctx, ev.payload as Effect[], { ruleId: ev.ref });
        break;
      case "nibp.cycle":
        if (state.devices.includes("manguito")) {
          measureBP(state, "PNI automática");
          enqueue(state, { tick: state.tick + secondsToTicks(NIBP_CYCLE_SECONDS), priority: 5, kind: "nibp.cycle", ref: "nibp" });
        }
        break;
    }
  }
}

// ---------------------------------------------------------------------------
// Regras
// ---------------------------------------------------------------------------
const RULE_CACHE = new WeakMap<object, Rule[]>();
function sortedRules(ctx: EngineContext): Rule[] {
  let r = RULE_CACHE.get(ctx.caseDef);
  if (!r) {
    r = [...ctx.caseDef.rules].sort((a, b) => b.priority - a.priority || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    RULE_CACHE.set(ctx.caseDef, r);
  }
  return r;
}

function evaluateRules(state: SimState, ctx: EngineContext): void {
  for (const rule of sortedRules(ctx)) {
    if (state.ended) return;
    const rt = (state.rules[rule.id] ??= { fired: 0, active: false });
    const ok = evaluate(rule.when, state);
    if (rule.repeat === "once") {
      if (ok && rt.fired === 0) fireRule(state, ctx, rule, rt, rule.effects);
    } else if (rule.repeat === "while") {
      if (ok && !rt.active) {
        rt.active = true;
        fireRule(state, ctx, rule, rt, rule.effects);
      } else if (!ok && rt.active) {
        rt.active = false;
        applyEffects(state, ctx, rule.onEnd, { ruleId: rule.id });
        logEvent(state, ctx, "rule.end", { ruleId: rule.id }, {});
      }
    } else {
      const every = secondsToTicks(rule.repeat.everySeconds);
      if (ok && (rt.lastTick === undefined || state.tick - rt.lastTick >= every)) fireRule(state, ctx, rule, rt, rule.effects);
    }
  }
}

function fireRule(state: SimState, ctx: EngineContext, rule: Rule, rt: SimState["rules"][string], effects: Effect[]): void {
  rt.fired += 1;
  rt.firstTick ??= state.tick;
  rt.lastTick = state.tick;
  logEvent(state, ctx, "rule.fired", { ruleId: rule.id }, { description: rule.description ?? "" });
  applyEffects(state, ctx, effects, { ruleId: rule.id });
}

export function applyEffects(state: SimState, ctx: EngineContext, effects: Effect[], origin: { ruleId?: string; commandId?: string }): void {
  for (const e of effects) {
    switch (e.type) {
      case "setValue":
        state.vars[e.var] = clampVar(e.var as VarId, e.value);
        break;
      case "adjustValue":
        state.vars[e.var] = clampVar(e.var as VarId, (state.vars[e.var] ?? (VARS[e.var as VarId].adultDefault ?? 0)) + e.delta);
        break;
      case "trendToTarget": {
        const list = (state.trends[e.var] ??= []).filter((t) => t.slot !== e.slot);
        list.push({
          slot: e.slot,
          target: clampVar(e.var as VarId, e.target),
          tauSeconds: e.tauSeconds,
          priority: e.priority,
          startTick: state.tick,
          endTick: e.durationSeconds !== undefined ? state.tick + secondsToTicks(e.durationSeconds) : undefined,
          sourceRuleId: origin.ruleId
        });
        state.trends[e.var] = list;
        break;
      }
      case "clearTrend":
        state.trends[e.var] = (state.trends[e.var] ?? []).filter((t) => t.slot !== e.slot);
        break;
      case "setFlag":
        if (isFlagId(e.flag) && validateFlagValue(e.flag, e.value)) {
          state.flags[e.flag] = e.value;
          if (e.flag === "communication") state.communication = e.value as SimState["communication"];
        }
        break;
      case "addObservation":
        state.knowledge.observations.push({ tick: state.tick, text: e.text, source: "observacao" });
        break;
      case "emitStaffMessage":
        state.knowledge.staffMessages.push({ tick: state.tick, from: e.from, text: e.text });
        break;
      case "changeCommunication":
        state.communication = e.state;
        state.flags.communication = e.state;
        break;
      case "setOutcome":
        state.outcome = { outcome: e.outcome, tick: state.tick, terminal: e.terminal };
        state.outcomeHistory.push({ outcome: e.outcome, tick: state.tick });
        if (e.terminal) {
          state.ended = true;
          state.endedTick = state.tick;
        }
        break;
      case "scheduleEffects":
        if (!state.scheduledKeys.includes(e.key)) {
          state.scheduledKeys.push(e.key);
          enqueue(state, { tick: state.tick + secondsToTicks(e.afterSeconds), priority: 20, kind: "scheduled.effects", ref: origin.ruleId ?? e.key, payload: e.effects });
        }
        break;
      case "stopTreatment":
        for (const t of state.treatments) {
          if (t.active && (t.drugId === e.treatmentId || t.id === e.treatmentId)) {
            t.active = false;
            t.endTick = state.tick;
          }
        }
        break;
      case "removeDevice":
        state.devices = state.devices.filter((d) => d !== e.device);
        break;
    }
    logEvent(state, ctx, `effect.${e.type}`, origin, e as unknown as Record<string, unknown>);
  }
}

// ---------------------------------------------------------------------------
// Comandos
// ---------------------------------------------------------------------------
export function dispatch(state: SimState, ctx: EngineContext, raw: LearnerCommand): CommandResult {
  const parsed = LearnerCommandSchema.safeParse(raw);
  if (!parsed.success) return { state, accepted: false, message: "Comando com formato inválido.", warnings: [] };
  const cmd = parsed.data;
  if (state.processedCommandIds.includes(cmd.id)) {
    return { state, accepted: false, duplicate: true, message: "Comando já processado (idempotência).", warnings: [] };
  }
  if (cmd.sessionId !== state.sessionId) return { state, accepted: false, message: "Comando de outra sessão.", warnings: [] };
  if (cmd.simTick !== state.tick) return { state, accepted: false, message: "Comando fora do instante atual da simulação.", warnings: [] };
  if (state.ended && cmd.type !== "note") return { state, accepted: false, message: "Atendimento encerrado.", warnings: [] };

  const res = handle(state, ctx, cmd);
  if (res.accepted) {
    state.processedCommandIds.push(cmd.id);
    state.commandLog.push(cmd);
    logEvent(state, ctx, `command.${cmd.type}`, { commandId: cmd.id }, cmd.payload);
    // regras reagem no mesmo tick a comandos imediatos
    evaluateRules(state, ctx);
  }
  return { state, accepted: res.accepted, message: res.message, warnings: res.warnings };
}

interface HandleResult {
  accepted: boolean;
  message?: string;
  warnings: string[];
}

function reject(message: string): HandleResult {
  return { accepted: false, message, warnings: [] };
}

function handle(state: SimState, ctx: EngineContext, cmd: LearnerCommand): HandleResult {
  const p = cmd.payload;
  switch (cmd.type) {
    case "askHistory":
      return askHistory(state, ctx, String(p.itemId ?? ""));
    case "examine":
      return examine(state, ctx, cmd, p.region as RegionId, p.maneuver as ManeuverId);
    case "performAction":
      return performAction(state, ctx, cmd, String(p.actionId ?? ""), (p.params as Record<string, unknown>) ?? {});
    case "orderTest":
      return orderTest(state, ctx, cmd, String(p.testId ?? ""));
    case "cancelOrder":
      return cancelOrder(state, ctx, String(p.orderId ?? ""));
    case "prescribe":
      return prescribe(state, ctx, cmd, p.prescription);
    case "stopTreatment": {
      const t = state.treatments.find((x) => x.id === p.treatmentId && x.active);
      if (!t) return reject("Infusão não encontrada ou já encerrada.");
      t.active = false;
      t.endTick = state.tick;
      return { accepted: true, warnings: [] };
    }
    case "titrateInfusion":
      return titrate(state, ctx, String(p.treatmentId ?? ""), p.rate as Quantity);
    case "setDifferential": {
      const list = Array.isArray(p.diagnoses) ? (p.diagnoses as unknown[]).map(String).slice(0, 12) : [];
      state.differential = [...new Set(list)];
      return { accepted: true, warnings: [] };
    }
    case "setFinalDiagnosis":
      state.finalDiagnosis = String(p.diagnosisId ?? "") || undefined;
      return { accepted: true, warnings: [] };
    case "setDisposition": {
      const d = String(p.destination ?? "");
      if (!ctx.profile.destinations.includes(d as never)) {
        return reject("Destino não disponível neste cenário. Considere regulação/transferência.");
      }
      state.disposition = d as SimState["disposition"];
      return { accepted: true, warnings: [] };
    }
    case "requestHint": {
      const level = Number(p.level ?? 1);
      state.hintsUsed.push({ level, tick: state.tick });
      return { accepted: true, warnings: [] };
    }
    case "endEncounter":
      state.ended = true;
      state.endedTick = state.tick;
      if (!state.outcome) {
        state.outcome = { outcome: "encerrado_pelo_aluno", tick: state.tick, terminal: true };
      }
      return { accepted: true, warnings: [] };
    case "note":
      return { accepted: true, warnings: [] };
  }
}

function askHistory(state: SimState, ctx: EngineContext, itemId: string): HandleResult {
  const item = ctx.caseDef.history.find((h) => h.id === itemId);
  if (!item) return reject("Pergunta não prevista neste caso.");
  const answers: { source: string; text: string }[] = [];
  for (const a of item.answers) {
    if (a.when && !evaluate(a.when, state)) continue;
    if (a.source === "paciente") {
      if (state.communication === "incapaz") continue;
    } else if (a.source !== "prontuario" && !ctx.caseDef.informants.some((i) => i.id === a.source)) continue;
    answers.push({ source: a.source, text: a.text });
  }
  if (answers.length === 0) {
    answers.push({
      source: "sistema",
      text: state.communication === "incapaz" ? "O paciente não consegue responder neste momento." : "Não há informação disponível sobre isso."
    });
  }
  state.knowledge.history.push({ itemId, topic: item.topic, question: item.question, tick: state.tick, answers });
  return { accepted: true, warnings: [] };
}

function examine(state: SimState, ctx: EngineContext, cmd: LearnerCommand, region: RegionId, maneuver: ManeuverId): HandleResult {
  if (!region || !maneuver || !(maneuver in EXAM_DURATION)) return reject("Região ou manobra inválida.");
  const order = newOrder(state, cmd, "exam", `${region}|${maneuver}`, `Exame: ${region} (${maneuver})`, {});
  order.status = "em_execucao";
  order.completeTick = state.tick + secondsToTicks(EXAM_DURATION[maneuver]);
  state.orders.push(order);
  enqueue(state, { tick: order.completeTick, priority: 40, kind: "order.complete", ref: order.id });
  return { accepted: true, warnings: [] };
}

function finishExam(state: SimState, ctx: EngineContext, order: Order): void {
  const [region, maneuver] = order.refId.split("|") as [RegionId, ManeuverId];
  const findings = ctx.caseDef.exam.filter((f) => f.region === region && f.maneuver === maneuver);
  const texts: string[] = [];
  let sound: string | undefined;
  for (const f of findings) {
    const v = f.variants.find((x) => !x.when || evaluate(x.when, state));
    if (v) {
      texts.push(f.label ? `${f.label}: ${v.text}` : v.text);
      sound ??= f.sound;
    }
  }
  if (texts.length === 0) texts.push("Nenhuma alteração descrita para esta manobra nesta região.");
  state.knowledge.exams.push({ region, maneuver, tick: state.tick, texts, sound });
}

function newOrder(state: SimState, cmd: LearnerCommand, kind: Order["kind"], refId: string, label: string, params: Record<string, unknown>): Order {
  const attempt = state.orders.filter((o) => o.kind === kind && o.refId === refId).length + 1;
  return { id: `ord-${cmd.id}`, commandId: cmd.id, kind, refId, label, status: "pendente", createdTick: state.tick, attempt, params, warnings: [] };
}

export function actionAvailability(state: SimState, ctx: EngineContext, actionId: string): { available: boolean; reason?: string } {
  const a = ctx.catalog.actions.get(actionId);
  if (!a) return { available: false, reason: "Ação inexistente no catálogo." };
  const missing = a.requiresResources.filter((r) => !ctx.profile.resources.includes(r));
  if (missing.length) return { available: false, reason: `Recurso indisponível neste cenário: ${missing.join(", ")}.` };
  const missingDev = a.requiresDevices.filter((d) => !state.devices.includes(d));
  if (missingDev.length) return { available: false, reason: `Pré-requisito ausente: ${missingDev.join(", ")}.` };
  if (!a.repeatable && !a.toggle) {
    const done = state.actionLog.some((x) => x.actionId === actionId && x.event === "complete");
    const running = state.orders.some((o) => o.kind === "action" && o.refId === actionId && o.status === "em_execucao");
    if (running) return { available: false, reason: "Ação já em execução." };
    if (done && a.addsDevices.length > 0 && a.addsDevices.every((d) => state.devices.includes(d))) {
      return { available: false, reason: "Já realizado; dispositivo instalado." };
    }
  }
  return { available: true };
}

function performAction(state: SimState, ctx: EngineContext, cmd: LearnerCommand, actionId: string, params: Record<string, unknown>): HandleResult {
  const def = ctx.catalog.actions.get(actionId);
  if (!def) return reject("Ação inexistente no catálogo.");
  if (def.toggle) {
    const active = state.activeToggles.includes(actionId);
    if (active) {
      state.activeToggles = state.activeToggles.filter((x) => x !== actionId);
      state.actionLog.push({ actionId, tick: state.tick, orderId: `tog-${cmd.id}`, success: true, event: "stop" });
      return { accepted: true, warnings: [] };
    }
  }
  const av = actionAvailability(state, ctx, actionId);
  if (!av.available) return reject(av.reason ?? "Indisponível.");
  for (const prm of def.params) {
    const v = params[prm.id] ?? prm.default;
    if (prm.kind === "number") {
      if (typeof v !== "number" || !Number.isFinite(v)) return reject(`Parâmetro inválido: ${prm.label}.`);
      if ((prm.min !== undefined && v < prm.min) || (prm.max !== undefined && v > prm.max)) return reject(`${prm.label} fora do intervalo permitido.`);
    } else if (prm.options && !prm.options.some((o) => o.value === v)) return reject(`Opção inválida: ${prm.label}.`);
    params[prm.id] = v;
  }
  if (def.toggle) {
    state.activeToggles = [...state.activeToggles, actionId].sort();
    state.actionLog.push({ actionId, tick: state.tick, orderId: `tog-${cmd.id}`, success: true, event: "start" });
    return { accepted: true, warnings: [] };
  }
  const order = newOrder(state, cmd, "action", actionId, def.label, params);
  order.status = "em_execucao";
  order.completeTick = state.tick + secondsToTicks(def.durationSeconds);
  state.orders.push(order);
  state.actionLog.push({ actionId, tick: state.tick, orderId: order.id, success: true, event: "start" });
  if (def.durationSeconds === 0) completeOrder(state, ctx, order.id);
  else enqueue(state, { tick: order.completeTick, priority: 50, kind: "order.complete", ref: order.id });
  return { accepted: true, warnings: [] };
}

function completeOrder(state: SimState, ctx: EngineContext, orderId: string): void {
  const order = state.orders.find((o) => o.id === orderId);
  if (!order || order.status !== "em_execucao") return; // cancelada ou já concluída
  if (order.kind === "exam") {
    order.status = "concluida";
    finishExam(state, ctx, order);
    return;
  }
  if (order.kind === "drug") {
    finishBolus(state, ctx, order);
    return;
  }
  const def = ctx.catalog.actions.get(order.refId)!;
  // Sucesso/falha: falhas determinísticas do caso têm precedência; depois probabilidade com PRNG semeado.
  const forced = ctx.caseDef.procedureFailures.find((f) => f.actionId === def.id);
  let success: boolean;
  if (forced) success = !forced.attempts.includes(order.attempt);
  else if (def.successProbability >= 1) success = true;
  else {
    const r = nextRandom(state.rng);
    state.rng = r.state;
    success = r.value < def.successProbability;
  }
  if (!success) {
    order.status = "falhou";
    state.actionLog.push({ actionId: def.id, tick: state.tick, orderId, success: false, event: "fail" });
    state.knowledge.observations.push({ tick: state.tick, text: def.failureText ?? `${def.label}: tentativa sem sucesso.`, source: "procedimento" });
    logEvent(state, ctx, "action.failed", { orderId }, { actionId: def.id, attempt: order.attempt });
    return;
  }
  order.status = "concluida";
  for (const d of def.removesDevices) state.devices = state.devices.filter((x) => x !== d);
  const before = new Set(state.devices);
  state.devices = [...new Set([...state.devices, ...def.addsDevices])].sort() as DeviceId[];
  if (def.addsDevices.includes("manguito") && !before.has("manguito")) {
    measureBP(state, "PNI");
    enqueue(state, { tick: state.tick + secondsToTicks(NIBP_CYCLE_SECONDS), priority: 5, kind: "nibp.cycle", ref: "nibp" });
  }
  for (const v of def.reveals) recordMeasurement(state, v as VarId, def.label);
  state.actionLog.push({ actionId: def.id, tick: state.tick, orderId, success: true, event: "complete" });
  logEvent(state, ctx, "action.completed", { orderId }, { actionId: def.id, params: order.params });
}

/** Medida pontual: copia o valor do instante. Sem pulso/perfusão, a qualidade é indisponível. */
export function recordMeasurement(state: SimState, v: VarId, method: string): void {
  const value = state.vars[v];
  let quality: "ok" | "ruim" | "indisponivel" = "ok";
  if ((v === "sbp" || v === "dbp" || v === "spo2") && state.flags.pulse === false) quality = "indisponivel";
  else if (v === "spo2" && (state.vars.perfusion ?? 1) < 0.3) quality = "ruim";
  if (value === undefined) {
    state.knowledge.measurements.push({ var: v, value: null, quality: "indisponivel", tick: state.tick, method });
    return;
  }
  state.knowledge.measurements.push({ var: v, value: quality === "indisponivel" ? null : round(value, VARS[v].decimals), quality, tick: state.tick, method });
}

function measureBP(state: SimState, method: string): void {
  recordMeasurement(state, "sbp", method);
  recordMeasurement(state, "dbp", method);
}

function round(v: number, d: number): number {
  const f = 10 ** d;
  return Math.round(v * f) / f;
}

// ---------------------------------------------------------------------------
// Exames complementares: coleta (cópia imutável) -> processamento -> disponibilização
// ---------------------------------------------------------------------------
export function testAvailability(ctx: EngineContext, testId: string): { available: boolean; reason?: string } {
  const t = ctx.catalog.tests.get(testId);
  if (!t) return { available: false, reason: "Exame inexistente." };
  const ok = t.requiresResources.some((r) => ctx.profile.resources.includes(r));
  return ok ? { available: true } : { available: false, reason: `Não disponível neste cenário (${ctx.profile.label}).` };
}

function orderTest(state: SimState, ctx: EngineContext, cmd: LearnerCommand, testId: string): HandleResult {
  const def = ctx.catalog.tests.get(testId);
  if (!def) return reject("Exame inexistente no catálogo.");
  const av = testAvailability(ctx, testId);
  if (!av.available) return reject(av.reason ?? "Indisponível.");
  const order = newOrder(state, cmd, "test", testId, def.label, {});
  order.collectTick = undefined;
  state.orders.push(order);
  enqueue(state, { tick: state.tick + secondsToTicks(def.collectSeconds), priority: 60, kind: "test.collect", ref: order.id });
  if (def.collectSeconds === 0) {
    // coleta imediata dentro do mesmo tick
    state.queue = state.queue.filter((q) => !(q.ref === order.id && q.kind === "test.collect"));
    collectTest(state, ctx, order.id);
  }
  return { accepted: true, warnings: [] };
}

function collectTest(state: SimState, ctx: EngineContext, orderId: string): void {
  const order = state.orders.find((o) => o.id === orderId);
  if (!order || order.status !== "pendente") return;
  const def = ctx.catalog.tests.get(order.refId)!;
  order.status = "coletado";
  order.collectTick = state.tick;
  const view = buildResult(state, ctx, order, def.items as VarId[]);
  state.knowledge.pendingSamples[orderId] = view; // cópia: independente de tratamentos posteriores
  const turnaround = secondsToTicks(def.turnaroundSeconds * ctx.profile.turnaroundMultiplier);
  order.availableTick = state.tick + turnaround;
  enqueue(state, { tick: order.availableTick, priority: 30, kind: "test.available", ref: orderId });
  logEvent(state, ctx, "test.collected", { orderId }, { testId: def.id });
}

function buildResult(state: SimState, ctx: EngineContext, order: Order, items: VarId[]): TestResultView {
  const def = ctx.catalog.tests.get(order.refId)!;
  const view: TestResultView = {
    orderId: order.id,
    testId: def.id,
    label: def.label,
    collectedTick: state.tick,
    availableTick: -1,
    items: []
  };
  for (const v of items) {
    const raw = state.vars[v] ?? VARS[v].adultDefault;
    if (raw === undefined) continue;
    view.items.push({ var: v, value: round(raw, VARS[v].decimals) });
  }
  const override = ctx.caseDef.testResults.find((t) => t.testId === def.id);
  if (override) {
    const variant = override.variants.find((x) => !x.when || evaluate(x.when, state));
    if (variant) {
      view.text = variant.text;
      if (variant.ecg) view.ecg = deepClone(variant.ecg);
      if (variant.imageCaption) view.imageCaption = variant.imageCaption;
    }
  } else if (def.kind === "ecg12") {
    view.ecg = {
      rhythm: String(state.flags.rhythm ?? "sinusal"),
      rate: Math.round(state.vars.hr ?? 80),
      stElevationLeads: [],
      stDepressionLeads: [],
      peakedT: false,
      wideQrs: false
    };
    view.text = "Traçado sem laudo específico definido no caso; interpretar ritmo e frequência.";
  } else if (def.kind === "text") {
    view.text = "Exame realizado; nenhum achado específico descrito para este caso.";
  }
  return deepClone(view);
}

function releaseTest(state: SimState, ctx: EngineContext, orderId: string): void {
  const order = state.orders.find((o) => o.id === orderId);
  const sample = state.knowledge.pendingSamples[orderId];
  if (!order || order.status !== "coletado" || !sample) return;
  order.status = "concluida";
  sample.availableTick = state.tick;
  state.knowledge.results.push(sample);
  delete state.knowledge.pendingSamples[orderId];
  state.knowledge.staffMessages.push({ tick: state.tick, from: "laboratorio", text: `Resultado disponível: ${order.label}.` });
  logEvent(state, ctx, "test.resultAvailable", { orderId }, { testId: order.refId, collectedAtTick: order.collectTick, availableAtTick: state.tick });
}

/**
 * Política de cancelamento:
 *  - antes da coleta/execução: nenhuma amostra ou efeito é produzido;
 *  - após a coleta: o processamento é interrompido e o resultado NÃO é liberado (a coleta permanece registrada).
 */
function cancelOrder(state: SimState, ctx: EngineContext, orderId: string): HandleResult {
  const order = state.orders.find((o) => o.id === orderId);
  if (!order) return reject("Ordem não encontrada.");
  if (order.status === "concluida" || order.status === "cancelada" || order.status === "falhou") return reject("Ordem já finalizada.");
  if (order.kind === "action") {
    const def = ctx.catalog.actions.get(order.refId);
    if (def && !def.cancellable) return reject("Este procedimento não pode ser interrompido.");
  }
  order.status = "cancelada";
  delete state.knowledge.pendingSamples[orderId];
  state.queue = state.queue.filter((q) => q.ref !== orderId);
  return { accepted: true, warnings: [] };
}

// ---------------------------------------------------------------------------
// Prescrição
// ---------------------------------------------------------------------------
export interface PrescriptionCheck {
  ok: boolean;
  errors: string[];
  warnings: string[];
  totalDose?: Quantity;
  missingValidatedContent?: boolean;
}

export function checkPrescription(state: SimState, ctx: EngineContext, raw: unknown): PrescriptionCheck {
  const parsed = PrescriptionSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, errors: ["Ordem incompleta ou malformada."], warnings: [] };
  const rx = parsed.data;
  const drug = ctx.catalog.drugs.get(rx.drugId);
  if (!drug) return { ok: false, errors: ["Medicamento inexistente no catálogo."], warnings: [] };
  const pres = drug.presentations.find((p) => p.id === rx.presentationId);
  if (!pres) return { ok: false, errors: ["Apresentação inexistente."], warnings: [] };
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!drug.routes.includes(rx.route)) errors.push(`Via ${rx.route} não permitida para ${drug.name}.`);
  if (!drug.availability.some((r) => ctx.profile.resources.includes(r))) errors.push(`${drug.name} não está disponível no perfil deste cenário.`);
  if ((rx.route === "IV") && !state.devices.some((d) => d === "acesso_periferico" || d === "acesso_central" || d === "acesso_io")) {
    errors.push("Via intravenosa exige acesso venoso (ou intraósseo) instalado.");
  }
  if (rx.route === "IO" && !state.devices.includes("acesso_io")) errors.push("Via intraóssea exige acesso intraósseo instalado.");
  if (rx.route === "endotraqueal" && !state.devices.includes("tot")) errors.push("Via endotraqueal exige tubo traqueal.");
  if (rx.route === "SNG" && !state.actionLog.some((a) => a.actionId === "sonda_nasogastrica" && a.event === "complete")) errors.push("Via por sonda exige sonda nasogástrica posicionada.");
  if (rx.route === "VO" && (state.flags.consciousness !== "alerta" || state.flags.airway === "protegida")) {
    errors.push("Via oral contraindicada: paciente sem nível de consciência/deglutição seguros neste momento.");
  }
  let total: Quantity | undefined;
  try {
    if (rx.mode === "bolus" || rx.mode === "infusao_volume") {
      total = resolveTotalDose({ dose: rx.dose, weightKg: rx.weightKg ?? ctx.caseDef.patient.weightKg });
    } else {
      if (!rx.rate) errors.push("Infusão contínua exige velocidade/dose por tempo.");
    }
    if (rx.mode === "infusao_volume" && (!rx.durationMinutes || rx.durationMinutes <= 0)) errors.push("Infusão de volume exige duração em minutos.");
    if (rx.rate) {
      if (!Number.isFinite(rx.rate.value) || rx.rate.value <= 0) errors.push("Velocidade deve ser maior que zero.");
    }
  } catch (e) {
    errors.push(e instanceof UnitError ? e.message : "Erro de unidades na ordem.");
  }
  // Checagem educativa de faixa (não bloqueia; gera alerta configurável)
  const population = populationOf(ctx);
  const rules = drug.doseRules.filter((r) => r.route === rx.route && r.mode === rx.mode && (r.population === population || r.population === "todos"));
  if (rules.length === 0) {
    warnings.push("Não há regra de dose validada no catálogo para esta via/população/modo; o simulador não sugere dose.");
  } else if (total) {
    const inRange = rules.some((r) => withinRange(total!, r.min, r.max, ctx.caseDef.patient.weightKg));
    if (!inRange) warnings.push("Dose fora das faixas cadastradas para esta via e população. Confira cálculo, unidade e peso.");
  } else if (rx.rate) {
    const inRange = rules.some((r) => withinRange(rx.rate!, r.min, r.max, ctx.caseDef.patient.weightKg));
    if (!inRange) warnings.push("Velocidade fora das faixas cadastradas. Confira unidade (mg × microgramas) e peso.");
  }
  return { ok: errors.length === 0, errors, warnings, totalDose: total };
}

function populationOf(ctx: EngineContext): "adulto" | "pediatrico" | "gestante" | "idoso" {
  const p = ctx.caseDef.patient;
  if (p.pregnancyWeeks !== undefined && p.pregnancyWeeks > 0) return "gestante";
  if (p.ageYears < 18) return "pediatrico";
  if (p.ageYears >= 65) return "idoso";
  return "adulto";
}

function withinRange(value: Quantity, min: Quantity, max: Quantity, weightKg: number): boolean {
  try {
    const dimV = unitDimension(value.unit);
    const dimR = unitDimension(min.unit);
    let v = value;
    if (dimV !== dimR) {
      // regra por peso, valor absoluto -> converte regra para absoluto
      if (dimR === "massPerWeight" && dimV === "mass") {
        const lo = resolveTotalDose({ dose: min, weightKg });
        const hi = resolveTotalDose({ dose: max, weightKg });
        const vv = convert(v, "mg").value;
        return vv >= convert(lo, "mg").value - 1e-9 && vv <= convert(hi, "mg").value + 1e-9;
      }
      if (dimR === "massPerWeightRate" && dimV === "massRate") {
        const mgMin = convert(v, "mg/min").value / weightKg;
        const lo = convert(min, "mcg/kg/min").value / 1000;
        const hi = convert(max, "mcg/kg/min").value / 1000;
        return mgMin >= lo - 1e-12 && mgMin <= hi + 1e-12;
      }
      if ((dimR === "unitsPerWeight" && dimV === "units") || (dimR === "volumePerWeight" && dimV === "volume")) {
        const vv = dimV === "volume" ? convert(v, "mL").value : v.value;
        return vv >= min.value * weightKg - 1e-9 && vv <= max.value * weightKg + 1e-9;
      }
      return false;
    }
    v = convert(v, min.unit);
    const hi = convert(max, min.unit);
    return v.value >= min.value - 1e-9 && v.value <= hi.value + 1e-9;
  } catch {
    return false;
  }
}

function prescribe(state: SimState, ctx: EngineContext, cmd: LearnerCommand, raw: unknown): HandleResult {
  const chk = checkPrescription(state, ctx, raw);
  if (!chk.ok) return { accepted: false, message: chk.errors.join(" "), warnings: chk.warnings };
  const rx = PrescriptionSchema.parse(raw);
  const drug = ctx.catalog.drugs.get(rx.drugId)!;
  const order = newOrder(state, cmd, "drug", rx.drugId, `${drug.name} ${rx.route}`, {});
  order.prescription = rx;
  order.warnings = chk.warnings;
  order.totalDose = chk.totalDose;
  if (rx.mode === "bolus") {
    order.status = "em_execucao";
    order.completeTick = state.tick + secondsToTicks(ROUTE_DURATION[rx.route] ?? 30);
    state.orders.push(order);
    enqueue(state, { tick: order.completeTick, priority: 45, kind: "order.complete", ref: order.id });
    return { accepted: true, warnings: chk.warnings };
  }
  // infusões
  order.status = "concluida";
  state.orders.push(order);
  const pres = drug.presentations.find((p) => p.id === rx.presentationId)!;
  let tr: Treatment;
  if (rx.mode === "infusao_volume") {
    const total = chk.totalDose!;
    const dim = unitDimension(total.unit);
    const base: Treatment["rateUnitBase"] = dim === "volume" ? "mL" : dim === "units" ? "UI" : dim === "amount" ? "mmol" : "mg";
    const amount = base === "mL" ? convert(total, "mL").value : base === "mg" ? convert(total, "mg").value : total.value;
    tr = {
      id: order.id,
      drugId: rx.drugId,
      route: rx.route,
      ratePerMin: amount / rx.durationMinutes!,
      rateUnitBase: base,
      displayRate: { value: Math.round((amount / rx.durationMinutes!) * 60 * 100) / 100, unit: base === "mL" ? "mL/h" : base === "mg" ? "mg/h" : "UI/h" },
      // obs.: para mEq/mmol o rótulo exibido é UI/h por limitação de UnitId; ver displayRateText na interface
      startTick: state.tick,
      targetTotal: amount,
      delivered: 0,
      active: true
    };
  } else {
    const rate = rx.rate!;
    const dim = unitDimension(rate.unit);
    let perMin: number;
    let base: Treatment["rateUnitBase"] = "mg";
    if (dim === "massRate") perMin = convert(rate, "mg/min").value;
    else if (dim === "massPerWeightRate") perMin = (convert(rate, "mcg/kg/min").value / 1000) * (rx.weightKg ?? ctx.caseDef.patient.weightKg);
    else if (dim === "volumeRate") {
      perMin = convert(rate, "mL/min").value;
      base = "mL";
    } else if (dim === "unitsRate") {
      perMin = rate.value / 60;
      base = "UI";
    } else if (dim === "unitsPerWeightRate") {
      perMin = (rate.value * (rx.weightKg ?? ctx.caseDef.patient.weightKg)) / 60;
      base = "UI";
    } else return reject("Unidade de infusão inválida.");
    void pres;
    tr = { id: order.id, drugId: rx.drugId, route: rx.route, ratePerMin: perMin, rateUnitBase: base, displayRate: rate, startTick: state.tick, delivered: 0, active: true };
  }
  // Idempotência: uma infusão ativa do mesmo fármaco não é duplicada — use titular.
  if (state.treatments.some((t) => t.active && t.drugId === rx.drugId && rx.mode === "infusao")) {
    state.orders.pop();
    return reject("Já existe infusão ativa deste medicamento. Use 'titular' ou suspenda antes.");
  }
  state.treatments.push(tr);
  return { accepted: true, warnings: chk.warnings };
}

function finishBolus(state: SimState, ctx: EngineContext, order: Order): void {
  const rx = order.prescription!;
  const total = order.totalDose!;
  const dim = unitDimension(total.unit);
  let unitBase: "mg" | "mL" | "UI" | "mmol" = "mg";
  let amount: number;
  if (dim === "mass") amount = convert(total, "mg").value;
  else if (dim === "volume") {
    unitBase = "mL";
    amount = convert(total, "mL").value;
  } else if (dim === "units") {
    unitBase = "UI";
    amount = total.value;
  } else {
    unitBase = "mmol";
    amount = total.value;
  }
  order.status = "concluida";
  state.administrations.push({ orderId: order.id, drugId: rx.drugId, route: rx.route, amount, unitBase, tick: state.tick });
  logEvent(state, ctx, "drug.administered", { orderId: order.id }, { drugId: rx.drugId, amount, unitBase, route: rx.route });
}

function titrate(state: SimState, ctx: EngineContext, treatmentId: string, rate: Quantity): HandleResult {
  const t = state.treatments.find((x) => x.id === treatmentId && x.active);
  if (!t) return reject("Infusão não encontrada ou encerrada.");
  if (!rate || !Number.isFinite(rate.value) || rate.value <= 0) return reject("Nova velocidade inválida.");
  try {
    const dim = unitDimension(rate.unit);
    let perMin: number;
    if (dim === "massRate") perMin = convert(rate, "mg/min").value;
    else if (dim === "massPerWeightRate") perMin = (convert(rate, "mcg/kg/min").value / 1000) * ctx.caseDef.patient.weightKg;
    else if (dim === "volumeRate") perMin = convert(rate, "mL/min").value;
    else return reject("Unidade incompatível para titulação.");
    t.ratePerMin = perMin;
    t.displayRate = rate;
  } catch (e) {
    return reject(e instanceof Error ? e.message : "Erro de unidade.");
  }
  return { accepted: true, warnings: [] };
}

// ---------------------------------------------------------------------------
// Registro, snapshot e integridade
// ---------------------------------------------------------------------------
function logEvent(state: SimState, ctx: EngineContext, type: string, origin: SimStateEventOrigin, payload: Record<string, unknown>): void {
  state.seq += 1;
  state.eventLog.push({ id: `e${state.seq}`, tick: state.tick, type, origin, caseVersion: ctx.caseDef.version, payload: deepClone(payload) });
}
type SimStateEventOrigin = { commandId?: string; ruleId?: string; orderId?: string; engine?: string };

export interface SimulationSnapshot {
  schemaVersion: 1;
  caseId: string;
  caseVersion: string;
  seed: number;
  tick: number;
  state: SimState;
  lastEventId: string | undefined;
  hash: string;
}

export function snapshot(state: SimState): SimulationSnapshot {
  const copy = deepClone(state);
  return {
    schemaVersion: 1,
    caseId: state.caseId,
    caseVersion: state.caseVersion,
    seed: state.seed,
    tick: state.tick,
    state: copy,
    lastEventId: state.eventLog.at(-1)?.id,
    hash: stateHash(copy)
  };
}

export function stateHash(state: SimState): string {
  return fnv1a(stableStringify(state));
}

export function restore(snap: SimulationSnapshot): SimState {
  if (stateHash(snap.state) !== snap.hash) throw new Error("Snapshot corrompido (hash não confere).");
  return deepClone(snap.state);
}

/** Replay: reconstrói o estado a partir de definição + seed + log de comandos. */
export function replay(ctx: EngineContext, opts: { sessionId: string; seed: number; branchId?: string }, commands: LearnerCommand[], untilTick?: number): SimState {
  const state = createSession(ctx, opts);
  const ordered = [...commands].sort((a, b) => a.simTick - b.simTick);
  for (const cmd of ordered) {
    advanceTo(state, ctx, cmd.simTick);
    if (state.tick !== cmd.simTick) break; // sessão terminou antes
    dispatch(state, ctx, cmd);
  }
  if (untilTick !== undefined) advanceTo(state, ctx, untilTick);
  return state;
}

/** Desfazer: nova linha (branch) reconstruída sem os últimos N comandos; o registro original é preservado. */
export function undo(ctx: EngineContext, state: SimState, count = 1): SimState {
  const kept = state.commandLog.slice(0, Math.max(0, state.commandLog.length - count));
  const lastTick = kept.at(-1)?.simTick ?? 0;
  const branchId = `${state.branchId}>desfazer@${state.tick}`;
  return replay(ctx, { sessionId: state.sessionId, seed: state.seed, branchId }, kept, lastTick);
}
