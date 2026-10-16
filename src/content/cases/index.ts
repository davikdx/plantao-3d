import type { CaseDefinition, CaseDefinitionInput } from "../../domain/schema";
import { validateCase } from "../validate";
import { T000 } from "./T000";
import { C004 } from "./C004";
import { C006 } from "./C006";
import { C017 } from "./C017";
import { C051 } from "./C051";
import { C001 } from "./C001";
import { C049 } from "./C049";
import { C057 } from "./C057";
import { C009 } from "./C009";
import { C076 } from "./C076";
import { C081 } from "./C081";

/** Casos embarcados. A ordem não importa; ids estáveis C001–C120. */
export const BUILTIN_CASE_INPUTS: CaseDefinitionInput[] = [T000, C001, C004, C006, C009, C017, C049, C051, C057, C076, C081];

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
