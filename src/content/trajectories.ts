/** Execução das trajetórias de teste declaradas em cada caso (usada nos testes automatizados e no editor). */
import type { CaseDefinition, LearnerCommand } from "../domain/schema";
import { getResourceProfile } from "../domain/resources";
import { advanceTo, createSession, dispatch } from "../engine/engine";
import { evaluate } from "../engine/conditions";
import { secondsToTicks } from "../engine/util";
import { CATALOG } from "./catalog";
import type { SimState } from "../engine/types";

export interface TrajectoryResult {
  id: string;
  kind: string;
  description: string;
  passed: boolean;
  failures: string[];
  state: SimState;
}

export function runTrajectories(c: CaseDefinition, seed = 7): TrajectoryResult[] {
  const profile = getResourceProfile(c.resourceProfile);
  if (!profile) return [];
  const ctx = { caseDef: c, catalog: CATALOG, profile };
  return c.tests.map((t) => {
    const failures: string[] = [];
    const sid = `traj-${c.id}-${t.id}`;
    const s = createSession(ctx, { sessionId: sid, seed });
    [...t.commands]
      .sort((a, b) => a.atSeconds - b.atSeconds)
      .forEach((cm, i) => {
        advanceTo(s, ctx, secondsToTicks(cm.atSeconds));
        if (s.ended) return;
        const res = dispatch(s, ctx, { id: `${sid}-${i}`, sessionId: sid, type: cm.type as LearnerCommand["type"], simTick: s.tick, payload: structuredClone(cm.payload) as Record<string, unknown>, origin: "teste" });
        if (!res.accepted) failures.push(`Comando ${cm.type} em ${cm.atSeconds}s rejeitado: ${res.message ?? ""}`);
      });
    advanceTo(s, ctx, secondsToTicks(t.runUntilSeconds));
    for (const e of t.expect) if (!evaluate(e.condition, s)) failures.push(`Expectativa não atendida: ${e.description}`);
    return { id: t.id, kind: t.kind, description: t.description, passed: failures.length === 0, failures, state: s };
  });
}
