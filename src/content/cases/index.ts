import type { CaseDefinition, CaseDefinitionInput } from "../../domain/schema";
import { validateCase } from "../validate";
import { T000 } from "./T000";
import { C004 } from "./C004";
import { C006 } from "./C006";
import { C017 } from "./C017";
import { C051 } from "./C051";

/** Casos embarcados. A ordem não importa; ids estáveis C001–C120. */
export const BUILTIN_CASE_INPUTS: CaseDefinitionInput[] = [T000, C004, C006, C017, C051];

export interface LoadedCases {
  cases: CaseDefinition[];
  rejected: { id: string; errors: string[] }[];
}

let cache: LoadedCases | undefined;

/** Carrega e valida; caso malformado não executa (fica em `rejected`). */
export function loadBuiltinCases(): LoadedCases {
  if (cache) return cache;
  const cases: CaseDefinition[] = [];
  const rejected: LoadedCases["rejected"] = [];
  for (const input of BUILTIN_CASE_INPUTS) {
    const r = validateCase(input);
    if (r.ok && r.caseDef) cases.push(r.caseDef);
    else rejected.push({ id: String((input as { id?: string }).id ?? "?"), errors: r.errors });
  }
  cache = { cases, rejected };
  return cache;
}
