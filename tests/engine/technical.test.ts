import { describe, expect, it } from "vitest";
import { CaseDefinitionSchema, type LearnerCommand } from "../../src/domain/schema";
import { T000 } from "../../src/content/cases/T000";
import { CATALOG } from "../../src/content/catalog";
import { getResourceProfile } from "../../src/domain/resources";
import { advanceTo, createSession, dispatch, replay, restore, snapshot, stateHash, undo } from "../../src/engine/engine";
import { learnerView } from "../../src/engine/views";
import type { EngineContext } from "../../src/engine/types";

const caseDef = CaseDefinitionSchema.parse(T000);
const ctx: EngineContext = { caseDef, catalog: CATALOG, profile: getResourceProfile(caseDef.resourceProfile)! };
const SESSION = "s-tec";

function cmd(id: string, simTick: number, type: LearnerCommand["type"], payload: Record<string, unknown>): LearnerCommand {
  return { id, sessionId: SESSION, type, simTick, payload, origin: "teste" };
}

/** Fixture 27.1: coleta em t=1 s, tendência iniciada em t=1 s após a coleta, resultado em t=3 s. */
function runFixture() {
  const s = createSession(ctx, { sessionId: SESSION, seed: 42 });
  advanceTo(s, ctx, 10);
  expect(dispatch(s, ctx, cmd("c1", 10, "orderTest", { testId: "demo_coleta" })).accepted).toBe(true);
  expect(dispatch(s, ctx, cmd("c2", 10, "performAction", { actionId: "demo_iniciar_tendencia" })).accepted).toBe(true);
  return s;
}

describe("Fixture técnico (cap. 27)", () => {
  it("resultado coletado mantém o valor do instante da coleta e level segue a fórmula contínua", () => {
    const s = runFixture();
    advanceTo(s, ctx, 29);
    expect(s.knowledge.results).toHaveLength(0); // ainda processando
    advanceTo(s, ctx, 30);
    expect(s.knowledge.results).toHaveLength(1);
    expect(s.knowledge.results[0]!.items[0]).toEqual({ var: "level", value: 0 });
    // convenção: tendência aplicada em passos de 0,1 s com solução exata exp(-dt/tau) => idêntica à contínua
    const expected = 10 * (1 - Math.exp(-1)); // 6,3212055883
    expect(s.vars.level).toBeCloseTo(expected, 8);
    expect(expected).toBeCloseTo(6.3212055883, 9);
  });

  it("resultado é cópia: alterações posteriores do estado não mudam a amostra", () => {
    const s = runFixture();
    advanceTo(s, ctx, 30);
    const before = JSON.stringify(s.knowledge.results[0]);
    advanceTo(s, ctx, 100);
    expect(JSON.stringify(s.knowledge.results[0])).toBe(before);
  });

  it("mesmo commandId não cria segunda coleta nem segunda tendência", () => {
    const s = runFixture();
    const dup = dispatch(s, ctx, cmd("c1", 10, "orderTest", { testId: "demo_coleta" }));
    expect(dup.duplicate).toBe(true);
    expect(s.orders.filter((o) => o.refId === "demo_coleta")).toHaveLength(1);
  });

  it("independência de taxa de quadros: 20 fps e 60 fps produzem o mesmo estado", () => {
    // Simula um laço de renderização que acumula tempo real e executa ticks fixos.
    function simulate(fps: number) {
      const s = createSession(ctx, { sessionId: SESSION, seed: 42 });
      let acc = 0;
      const frame = 1 / fps;
      let realTime = 0;
      let issued = false;
      while (s.tick < 50) {
        realTime += frame;
        acc += frame;
        while (acc >= 0.1 - 1e-9 && s.tick < 50) {
          acc -= 0.1;
          advanceTo(s, ctx, s.tick + 1);
          if (s.tick === 10 && !issued) {
            dispatch(s, ctx, cmd("c1", 10, "orderTest", { testId: "demo_coleta" }));
            dispatch(s, ctx, cmd("c2", 10, "performAction", { actionId: "demo_iniciar_tendencia" }));
            issued = true;
          }
        }
      }
      void realTime;
      return s;
    }
    const a = simulate(20);
    const b = simulate(60);
    expect(stateHash(a)).toBe(stateHash(b));
  });

  it("pausa: tempo simulado não avança sem ticks e retoma com os mesmos efeitos", () => {
    const s = runFixture();
    advanceTo(s, ctx, 20);
    const h = stateHash(s);
    // "pausa" = nenhum tick executado, por qualquer tempo real
    expect(stateHash(s)).toBe(h);
    advanceTo(s, ctx, 30);
    const ref = runFixture();
    advanceTo(ref, ctx, 30);
    expect(stateHash(s)).toBe(stateHash(ref));
  });

  it("serializar em t=2 s, restaurar e continuar produz o mesmo estado de referência", () => {
    const s = runFixture();
    advanceTo(s, ctx, 20);
    const snap = snapshot(s);
    const json = JSON.stringify(snap);
    const restored = restore(JSON.parse(json));
    advanceTo(restored, ctx, 40);
    const ref = runFixture();
    advanceTo(ref, ctx, 40);
    expect(stateHash(restored)).toBe(stateHash(ref));
  });

  it("snapshot corrompido é rejeitado pelo hash", () => {
    const s = runFixture();
    const snap = snapshot(s);
    snap.state.vars.level = 999;
    expect(() => restore(snap)).toThrow(/corrompido/);
  });

  it("cancelar antes da coleta não produz amostra", () => {
    const s = createSession(ctx, { sessionId: SESSION, seed: 1 });
    // exame com coleta demorada: usa gasometria (coleta 90 s) disponível no perfil UPA
    dispatch(s, ctx, cmd("g1", 0, "orderTest", { testId: "gaso_venosa" }));
    const orderId = s.orders[0]!.id;
    advanceTo(s, ctx, 100);
    expect(dispatch(s, ctx, cmd("g2", 100, "cancelOrder", { orderId })).accepted).toBe(true);
    advanceTo(s, ctx, 6000);
    expect(s.knowledge.results).toHaveLength(0);
    expect(s.orders[0]!.collectTick).toBeUndefined();
  });

  it("cancelar após a coleta: coleta fica registrada, resultado não é liberado (política explícita)", () => {
    const s = createSession(ctx, { sessionId: SESSION, seed: 1 });
    dispatch(s, ctx, cmd("g1", 0, "orderTest", { testId: "gaso_venosa" }));
    const orderId = s.orders[0]!.id;
    advanceTo(s, ctx, 700); // coletado em 60 s (tick 600)
    expect(s.orders[0]!.collectTick).toBe(600);
    dispatch(s, ctx, cmd("g2", 700, "cancelOrder", { orderId }));
    advanceTo(s, ctx, 6000);
    expect(s.knowledge.results).toHaveLength(0);
    expect(s.orders[0]!.status).toBe("cancelada");
    expect(s.orders[0]!.collectTick).toBe(600);
  });

  it("replay reconstrói exatamente o estado a partir de seed + comandos", () => {
    const s = runFixture();
    advanceTo(s, ctx, 45);
    const r = replay(ctx, { sessionId: SESSION, seed: 42 }, s.commandLog, 45);
    expect(stateHash(r)).toBe(stateHash(s));
  });

  it("desfazer cria nova linha sem alterar o registro original", () => {
    const s = runFixture();
    advanceTo(s, ctx, 30);
    const originalLog = JSON.stringify(s.commandLog);
    const alt = undo(ctx, s, 1);
    expect(JSON.stringify(s.commandLog)).toBe(originalLog);
    expect(alt.branchId).not.toBe(s.branchId);
    expect(alt.commandLog).toHaveLength(1);
    expect(alt.actionLog.some((a) => a.actionId === "demo_iniciar_tendencia")).toBe(false);
  });

  it("valor verdadeiro de level não aparece ao aluno antes de observação autorizada", () => {
    const s = runFixture();
    advanceTo(s, ctx, 20);
    const view = learnerView(s, ctx);
    const text = JSON.stringify(view);
    expect(text).not.toContain(String(s.vars.level));
    expect(view.knowledge.results).toHaveLength(0);
  });

  it("condição dependente de evento inexistente retorna falso (não usa zero implicitamente)", () => {
    const s = runFixture();
    advanceTo(s, ctx, 100);
    expect(s.flags.demoFlag).toBeUndefined();
    expect(s.rules["r-demo-missing-ref"]?.fired ?? 0).toBe(0);
  });

  it("encerrar a tendência por comando interrompe a evolução", () => {
    const s = runFixture();
    advanceTo(s, ctx, 30);
    dispatch(s, ctx, cmd("c3", 30, "performAction", { actionId: "demo_parar_tendencia" }));
    const v = s.vars.level!;
    advanceTo(s, ctx, 200);
    expect(s.vars.level).toBeCloseTo(v, 10);
  });

  it("comando fora do instante atual é rejeitado (sem viagem no tempo)", () => {
    const s = createSession(ctx, { sessionId: SESSION, seed: 1 });
    advanceTo(s, ctx, 50);
    const r = dispatch(s, ctx, cmd("x", 10, "note", {}));
    expect(r.accepted).toBe(false);
  });

  it("segunda tela/tela oculta não duplica ticks: advanceTo é idempotente para o mesmo alvo", () => {
    const s = runFixture();
    advanceTo(s, ctx, 30);
    const h = stateHash(s);
    advanceTo(s, ctx, 30);
    advanceTo(s, ctx, 25);
    expect(stateHash(s)).toBe(h);
  });
});
