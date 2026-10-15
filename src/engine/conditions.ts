import type { Condition } from "../domain/schema";
import { convert, unitDimension, type Quantity } from "../domain/units";
import type { SimState } from "./types";
import { secondsToTicks } from "./util";

/**
 * Avaliação de condições declarativas.
 * Contrato de referência ausente: elapsedSince com evento que ainda não ocorreu retorna FALSE
 * (nunca é tratado como instante zero).
 */
export function evaluate(cond: Condition, s: SimState): boolean {
  if ("all" in cond) return cond.all.every((c) => evaluate(c, s));
  if ("any" in cond) return cond.any.some((c) => evaluate(c, s));
  if ("not" in cond) return !evaluate(cond.not, s);
  if ("always" in cond) return true;
  if ("path" in cond) return comparePath(cond.path, cond.op, cond.value, s);
  if ("actionCompleted" in cond) {
    const n = s.actionLog.filter((a) => a.actionId === cond.actionCompleted && a.event === "complete").length;
    return n >= (cond.count ?? 1);
  }
  if ("actionStarted" in cond) {
    return s.actionLog.some((a) => a.actionId === cond.actionStarted && a.event === "start") || s.activeToggles.includes(cond.actionStarted);
  }
  if ("drugGiven" in cond) {
    const totals = drugTotals(s, cond.drugGiven, cond.route);
    if (totals.count === 0) return false;
    if (cond.minTotal && !compareTotal(totals, cond.minTotal, "gte")) return false;
    if (cond.maxTotal && !compareTotal(totals, cond.maxTotal, "lte")) return false;
    return true;
  }
  if ("treatmentActive" in cond) {
    return s.treatments.some((t) => t.active && (t.drugId === cond.treatmentActive || t.id === cond.treatmentActive));
  }
  if ("deviceActive" in cond) return s.devices.includes(cond.deviceActive as never);
  if ("testCollected" in cond) {
    return s.orders.some((o) => o.kind === "test" && o.refId === cond.testCollected && o.collectTick !== undefined && o.status !== "cancelada");
  }
  if ("time" in cond) {
    const t = secondsToTicks(cond.seconds);
    return cond.time === "gte" ? s.tick >= t : s.tick <= t;
  }
  if ("ruleFired" in cond) return (s.rules[cond.ruleFired]?.fired ?? 0) > 0;
  if ("elapsedSince" in cond) {
    const ref = referenceTick(cond.elapsedSince, s);
    if (ref === undefined) return false;
    const elapsed = s.tick - ref;
    const t = secondsToTicks(cond.seconds);
    return cond.op === "gte" ? elapsed >= t : elapsed <= t;
  }
  return false;
}

/** Referências: start | action:<id> | rule:<id> | drug:<id> | test:<id> | device:<id> */
export function referenceTick(ref: string, s: SimState): number | undefined {
  if (ref === "start") return 0;
  const [kind, id] = ref.split(":", 2);
  if (!id) return undefined;
  switch (kind) {
    case "action":
      return s.actionLog.find((a) => a.actionId === id && (a.event === "complete" || a.event === "start"))?.tick;
    case "rule":
      return s.rules[id]?.firstTick;
    case "drug":
      return (
        s.administrations.find((a) => a.drugId === id)?.tick ??
        s.treatments.find((t) => t.drugId === id)?.startTick
      );
    case "test":
      return s.orders.find((o) => o.kind === "test" && o.refId === id && o.collectTick !== undefined)?.collectTick;
    default:
      return undefined;
  }
}

function comparePath(path: string, op: string, value: string | number | boolean, s: SimState): boolean {
  let current: unknown;
  if (path.startsWith("vars.")) current = s.vars[path.slice(5)];
  else if (path.startsWith("flags.")) current = s.flags[path.slice(6)];
  if (current === undefined) return false;
  switch (op) {
    case "eq":
      return current === value;
    case "neq":
      return current !== value;
    case "gt":
      return typeof current === "number" && typeof value === "number" && current > value;
    case "gte":
      return typeof current === "number" && typeof value === "number" && current >= value;
    case "lt":
      return typeof current === "number" && typeof value === "number" && current < value;
    case "lte":
      return typeof current === "number" && typeof value === "number" && current <= value;
    default:
      return false;
  }
}

export interface DrugTotals {
  count: number;
  mg: number;
  mL: number;
  UI: number;
  mmol: number;
}

/** Soma bolus concluídos + volume/massa já infundidos (inclui infusões encerradas). */
export function drugTotals(s: SimState, drugId: string, route?: string): DrugTotals {
  const t: DrugTotals = { count: 0, mg: 0, mL: 0, UI: 0, mmol: 0 };
  for (const a of s.administrations) {
    if (a.drugId !== drugId) continue;
    if (route && a.route !== route) continue;
    t.count++;
    t[a.unitBase] += a.amount;
  }
  for (const tr of s.treatments) {
    if (tr.drugId !== drugId) continue;
    if (route && tr.route !== route) continue;
    if (tr.delivered > 0) {
      t.count++;
      t[tr.rateUnitBase] += tr.delivered;
    }
  }
  return t;
}

function compareTotal(t: DrugTotals, q: Quantity, op: "gte" | "lte"): boolean {
  const dim = unitDimension(q.unit);
  let have: number;
  let want: number;
  if (dim === "mass") {
    have = t.mg;
    want = convert(q, "mg").value;
  } else if (dim === "volume") {
    have = t.mL;
    want = convert(q, "mL").value;
  } else if (dim === "units") {
    have = t.UI;
    want = q.value;
  } else if (dim === "amount") {
    have = t.mmol;
    want = q.value;
  } else return false;
  const eps = 1e-9;
  return op === "gte" ? have + eps >= want : have - eps <= want;
}
