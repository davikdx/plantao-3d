import { describe, expect, it } from "vitest";
import { BUILTIN_CASE_INPUTS } from "../../src/content/cases";
import { validateCase } from "../../src/content/validate";
import { CATALOG } from "../../src/content/catalog";
import { getResourceProfile } from "../../src/domain/resources";
import { advanceTo, createSession, dispatch, replay, stateHash } from "../../src/engine/engine";
import { evaluate } from "../../src/engine/conditions";
import { learnerView, publicPatientFacts } from "../../src/engine/views";
import { assess } from "../../src/engine/scoring";
import { secondsToTicks } from "../../src/engine/util";
import type { CaseDefinition, LearnerCommand } from "../../src/domain/schema";
import type { EngineContext } from "../../src/engine/types";
import { DIAGNOSES_BY_ID } from "../../src/content/catalog/diagnoses";

function ctxFor(c: CaseDefinition): EngineContext {
  return { caseDef: c, catalog: CATALOG, profile: getResourceProfile(c.resourceProfile)! };
}

describe("validação de todos os casos embarcados", () => {
  for (const input of BUILTIN_CASE_INPUTS) {
    const id = (input as { id: string }).id;
    it(`${id}: schema e referências cruzadas`, () => {
      const r = validateCase(input);
      expect(r.errors).toEqual([]);
      expect(r.ok).toBe(true);
    });
  }
});

describe("o schema rejeita caso incompleto ou malformado", () => {
  it("rejeita caso sem história e com ação inexistente", () => {
    const bad = structuredClone(BUILTIN_CASE_INPUTS[1]) as Record<string, unknown>;
    bad.history = [];
    expect(validateCase(bad).ok).toBe(false);
  });
  it("rejeita referência a ação inexistente em regra", () => {
    const bad = structuredClone(BUILTIN_CASE_INPUTS[1]) as { rules: unknown[] };
    bad.rules.push({ id: "r-x", when: { actionCompleted: "acao_que_nao_existe" }, effects: [] });
    const r = validateCase(bad);
    expect(r.ok).toBe(false);
    expect(r.errors.join(" ")).toMatch(/ação inexistente/);
  });
  it("rejeita expressão livre/código no lugar de condição", () => {
    const bad = structuredClone(BUILTIN_CASE_INPUTS[1]) as { rules: unknown[] };
    bad.rules.push({ id: "r-eval", when: { expr: "process.exit()" }, effects: [] });
    expect(validateCase(bad).ok).toBe(false);
  });
  it("rejeita caminho de variável não permitido", () => {
    const bad = structuredClone(BUILTIN_CASE_INPUTS[1]) as { rules: unknown[] };
    bad.rules.push({ id: "r-path", when: { path: "constructor.prototype", op: "eq", value: 1 }, effects: [] });
    expect(validateCase(bad).ok).toBe(false);
  });
  it("rejeita status clinicamente revisado sem registro de revisor", () => {
    const bad = structuredClone(BUILTIN_CASE_INPUTS[1]) as Record<string, unknown>;
    bad.status = "clinicallyReviewed";
    expect(validateCase(bad).ok).toBe(false);
  });
});

describe("trajetórias de cada caso clínico", () => {
  for (const input of BUILTIN_CASE_INPUTS) {
    const r = validateCase(input);
    if (!r.ok || !r.caseDef) continue;
    const c = r.caseDef;
    for (const t of c.tests) {
      it(`${c.id} — ${t.kind}: ${t.description}`, () => {
        const ctx = ctxFor(c);
        const sid = `traj-${c.id}-${t.id}`;
        const s = createSession(ctx, { sessionId: sid, seed: 7 });
        const cmds = [...t.commands].sort((a, b) => a.atSeconds - b.atSeconds);
        cmds.forEach((cm, i) => {
          const tick = secondsToTicks(cm.atSeconds);
          advanceTo(s, ctx, tick);
          if (s.ended) return;
          const res = dispatch(s, ctx, { id: `${sid}-${i}`, sessionId: sid, type: cm.type as LearnerCommand["type"], simTick: s.tick, payload: structuredClone(cm.payload) as Record<string, unknown>, origin: "teste" });
          expect(res.accepted, `comando ${cm.type} em ${cm.atSeconds}s rejeitado: ${res.message}`).toBe(true);
        });
        advanceTo(s, ctx, secondsToTicks(t.runUntilSeconds));
        for (const e of t.expect) expect(evaluate(e.condition, s), e.description).toBe(true);
        // replay reproduz exatamente
        const rp = replay(ctx, { sessionId: sid, seed: 7 }, s.commandLog, s.tick);
        expect(stateHash(rp)).toBe(stateHash(s));
        // avaliação é calculável e normalizada
        const a = assess(s, ctx);
        expect(a.total).toBeGreaterThanOrEqual(0);
        expect(a.total).toBeLessThanOrEqual(100.0001);
      });
    }
    if (!c.technical) {
      it(`${c.id}: diagnóstico oculto não vaza para a visão do aluno nem para o paciente`, () => {
        const ctx = ctxFor(c);
        const s = createSession(ctx, { sessionId: "leak", seed: 1 });
        advanceTo(s, ctx, 600);
        const blob = JSON.stringify(learnerView(s, ctx)) + JSON.stringify(publicPatientFacts(ctx));
        const label = DIAGNOSES_BY_ID.get(c.diagnosis.primary)!.label;
        expect(blob).not.toContain(c.diagnosis.primary);
        expect(blob.toLowerCase()).not.toContain(label.toLowerCase());
        expect(blob).not.toContain(c.teachingTitle);
        expect(blob).not.toContain("r-"); // ids de regras
      });
      it(`${c.id}: título público não contém o diagnóstico`, () => {
        const label = DIAGNOSES_BY_ID.get(c.diagnosis.primary)!.label.toLowerCase();
        expect(c.publicTitle.toLowerCase()).not.toContain(label);
      });
    }
  }
});
