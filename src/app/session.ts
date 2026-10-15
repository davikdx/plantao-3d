/**
 * Controlador de sessão: liga o motor ao relógio real, à interface e à persistência.
 * Política de segundo plano: ao ocultar o app (chamada, troca de app), a simulação PAUSA.
 * Tempo real × tempo simulado: o laço acumula tempo real × velocidade e executa passos fixos de 0,1 s.
 * Cada comando aceito é gravado (transação idempotente por revisão) antes de novos passos.
 */
import type { CaseDefinition, LearnerCommand } from "../domain/schema";
import { getResourceProfile } from "../domain/resources";
import { CATALOG } from "../content/catalog";
import { diagnosisLabel } from "../content/catalog/diagnoses";
import { advanceTo, createSession, dispatch, replay, step, undo as engineUndo } from "../engine/engine";
import type { CommandResult } from "../engine/types";
import type { EngineContext, SimState } from "../engine/types";
import { assess, type AssessmentResult } from "../engine/scoring";
import { learnerView, visualState, type LearnerView, type VisualState } from "../engine/views";
import { secondsToTicks, TICK_SECONDS } from "../engine/util";
import type { Mode, SessionRecord, StorageAdapter } from "../storage/types";

export const OUTCOME_LABELS: Record<string, string> = {
  melhora: "Melhora",
  estabilizacao_parcial: "Estabilização parcial",
  piora: "Piora",
  complicacao: "Complicação",
  parada: "Parada cardiorrespiratória",
  rosc: "Retorno da circulação espontânea",
  obito: "Óbito",
  transferencia_segura: "Transferência segura",
  encerrado_pelo_aluno: "Atendimento encerrado pelo aluno",
  sem_desfecho_definido: "Sem desfecho definido"
};

function uid(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

export type Listener = () => void;

export class SessionController {
  readonly ctx: EngineContext;
  state: SimState;
  record: SessionRecord;
  speed = 1;
  paused = false;
  private acc = 0;
  private last = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private listeners = new Set<Listener>();
  private lastSavedTick = 0;
  private saving: Promise<void> = Promise.resolve();
  private visHandler = () => {
    if (document.hidden) this.setPaused(true);
  };
  lastResult: CommandResult | null = null;

  private constructor(caseDef: CaseDefinition, record: SessionRecord, state: SimState, private storage: StorageAdapter) {
    const profile = getResourceProfile(caseDef.resourceProfile);
    if (!profile) throw new Error(`Perfil de recursos ausente: ${caseDef.resourceProfile}`);
    this.ctx = { caseDef, catalog: CATALOG, profile };
    this.record = record;
    this.state = state;
  }

  static async create(caseDef: CaseDefinition, mode: Mode, storage: StorageAdapter, seed?: number): Promise<SessionController> {
    const sessionId = uid();
    const s = seed ?? Math.floor(Math.random() * 2 ** 31);
    const now = new Date().toISOString();
    const record: SessionRecord = {
      sessionId,
      caseId: caseDef.id,
      caseVersion: caseDef.version,
      caseSnapshot: caseDef,
      seed: s,
      branchId: "principal",
      mode,
      commands: [],
      simTick: 0,
      status: "ativa",
      startedAt: now,
      updatedAt: now,
      revision: 0
    };
    const profile = getResourceProfile(caseDef.resourceProfile)!;
    const state = createSession({ caseDef, catalog: CATALOG, profile }, { sessionId, seed: s });
    const c = new SessionController(caseDef, record, state, storage);
    await c.persist();
    return c;
  }

  /** Recupera após fechamento: replay da definição congelada + seed + comandos até o tick salvo. */
  static async resume(record: SessionRecord, storage: StorageAdapter): Promise<SessionController> {
    const caseDef = record.caseSnapshot;
    const profile = getResourceProfile(caseDef.resourceProfile)!;
    const ctx = { caseDef, catalog: CATALOG, profile };
    const state = replay(ctx, { sessionId: record.sessionId, seed: record.seed, branchId: record.branchId }, record.commands, record.simTick);
    const c = new SessionController(caseDef, record, state, storage);
    c.lastSavedTick = state.tick;
    return c;
  }

  get ended(): boolean {
    return this.state.ended;
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(): void {
    for (const l of this.listeners) l();
  }

  start(): void {
    if (this.timer) return;
    document.addEventListener("visibilitychange", this.visHandler);
    this.last = performance.now();
    this.timer = setInterval(() => this.tick(), 50);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    document.removeEventListener("visibilitychange", this.visHandler);
    void this.persist();
  }

  private tick(): void {
    const now = performance.now();
    const dt = Math.min(0.5, (now - this.last) / 1000); // limita saltos (ex.: aba congelada)
    this.last = now;
    if (this.paused || this.state.ended) return;
    this.acc += dt * this.speed;
    let n = 0;
    while (this.acc >= TICK_SECONDS && n < 200) {
      this.acc -= TICK_SECONDS;
      step(this.state, this.ctx);
      n++;
    }
    if (n > 0) {
      if (this.state.ended && this.record.status === "ativa") void this.finish();
      if (this.state.tick - this.lastSavedTick >= secondsToTicks(5)) void this.persist();
      this.emit();
    }
  }

  setPaused(p: boolean): void {
    this.paused = p;
    this.last = performance.now();
    this.emit();
  }

  setSpeed(x: number): void {
    this.speed = x;
    this.emit();
  }

  /** Avança o tempo simulado imediatamente (ex.: aguardar resultado). Mesmo efeito que esperar. */
  skip(seconds: number): void {
    advanceTo(this.state, this.ctx, this.state.tick + secondsToTicks(seconds));
    if (this.state.ended && this.record.status === "ativa") void this.finish();
    void this.persist();
    this.emit();
  }

  send(type: LearnerCommand["type"], payload: Record<string, unknown>, origin: LearnerCommand["origin"] = "interface"): CommandResult {
    const cmd: LearnerCommand = { id: uid(), sessionId: this.state.sessionId, type, simTick: this.state.tick, payload, origin };
    const r = dispatch(this.state, this.ctx, cmd);
    this.lastResult = r;
    if (r.accepted) {
      void this.persist();
      if (this.state.ended && this.record.status === "ativa") void this.finish();
    }
    this.emit();
    return r;
  }

  canUndo(): boolean {
    return this.record.mode !== "prova" && this.state.commandLog.length > 0 && !this.state.ended;
  }

  undo(): void {
    if (!this.canUndo()) return;
    this.state = engineUndo(this.ctx, this.state, 1);
    this.record.branchId = this.state.branchId;
    void this.persist();
    this.emit();
  }

  view(): LearnerView {
    return learnerView(this.state, this.ctx);
  }

  visual(): VisualState {
    return visualState(this.state, this.ctx);
  }

  async finish(oralAnswer?: string): Promise<AssessmentResult> {
    if (!this.state.ended) this.send("endEncounter", {});
    const result = assess(this.state, this.ctx, (_k, id) => OUTCOME_LABELS[id] ?? id);
    this.record.result = result;
    this.record.status = "concluida";
    if (oralAnswer !== undefined) this.record.oralAnswer = oralAnswer;
    await this.persist();
    this.emit();
    return result;
  }

  persist(): Promise<void> {
    this.record.commands = [...this.state.commandLog];
    this.record.simTick = this.state.tick;
    this.record.updatedAt = new Date().toISOString();
    this.record.revision += 1;
    this.lastSavedTick = this.state.tick;
    const snapshot = structuredClone(this.record);
    // gravações em série: nunca duas escritas concorrentes da mesma sessão
    this.saving = this.saving.then(() => this.storage.saveSession(snapshot)).catch(() => undefined);
    return this.saving;
  }

  diagnosisLabel(id: string): string {
    return diagnosisLabel(id);
  }
}
