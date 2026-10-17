import type { CaseDefinition, CaseDefinitionInput } from "../../domain/schema";
import { validateCase } from "../validate";
import { T000 } from "./T000";
import { C004 } from "./C004";
import { C006 } from "./C006";
import { C017 } from "./C017";
import { C051 } from "./C051";
import { C052 } from "./C052";
import { C053 } from "./C053";
import { C054 } from "./C054";
import { C055 } from "./C055";
import { C056 } from "./C056";
import { C001 } from "./C001";
import { C049 } from "./C049";
import { C050 } from "./C050";
import { C057 } from "./C057";
import { C058 } from "./C058";
import { C059 } from "./C059";
import { C060 } from "./C060";
import { C061 } from "./C061";
import { C062 } from "./C062";
import { C063 } from "./C063";
import { C064 } from "./C064";
import { C065 } from "./C065";
import { C066 } from "./C066";
import { C067 } from "./C067";
import { C068 } from "./C068";
import { C069 } from "./C069";
import { C070 } from "./C070";
import { C071 } from "./C071";
import { C072 } from "./C072";
import { C009 } from "./C009";
import { C076 } from "./C076";
import { C077 } from "./C077";
import { C078 } from "./C078";
import { C079 } from "./C079";
import { C080 } from "./C080";
import { C081 } from "./C081";
import { C082 } from "./C082";
import { C091 } from "./C091";
import { C097 } from "./C097";
import { C105 } from "./C105";
import { C028 } from "./C028";
import { C074 } from "./C074";
import { C075 } from "./C075";
import { C083 } from "./C083";
import { C089 } from "./C089";
import { C002 } from "./C002";
import { C025 } from "./C025";
import { C007 } from "./C007";
import { C011 } from "./C011";
import { C018 } from "./C018";
import { C033 } from "./C033";
import { C034 } from "./C034";
import { C035 } from "./C035";
import { C036 } from "./C036";
import { C037 } from "./C037";
import { C038 } from "./C038";
import { C039 } from "./C039";
import { C040 } from "./C040";
import { C041 } from "./C041";
import { C042 } from "./C042";
import { C043 } from "./C043";
import { C044 } from "./C044";
import { C045 } from "./C045";
import { C046 } from "./C046";
import { C047 } from "./C047";
import { C048 } from "./C048";
import { C073 } from "./C073";
import { C012 } from "./C012";
import { C013 } from "./C013";
import { C014 } from "./C014";
import { C015 } from "./C015";
import { C016 } from "./C016";
import { C003 } from "./C003";
import { C005 } from "./C005";
import { C008 } from "./C008";
import { C010 } from "./C010";
import { C019 } from "./C019";
import { C020 } from "./C020";
import { C021 } from "./C021";
import { C022 } from "./C022";
import { C023 } from "./C023";
import { C024 } from "./C024";
import { C026 } from "./C026";
import { C027 } from "./C027";
import { C029 } from "./C029";
import { C030 } from "./C030";
import { C031 } from "./C031";
import { C032 } from "./C032";

/** Casos embarcados. A ordem não importa; ids estáveis C001–C120. */
export const BUILTIN_CASE_INPUTS: CaseDefinitionInput[] = [T000, C001, C002, C003, C004, C005, C006, C007, C008, C009, C010, C011, C012, C013, C014, C015, C016, C017, C018, C019, C020, C021, C022, C023, C024, C025, C026, C027, C028, C029, C030, C031, C032, C033, C034, C035, C036, C037, C038, C039, C040, C041, C042, C043, C044, C045, C046, C047, C048, C049, C050, C051, C052, C053, C054, C055, C056, C057, C058, C059, C060, C061, C062, C063, C064, C065, C066, C067, C068, C069, C070, C071, C072, C073, C074, C075, C076, C077, C078, C079, C080, C081, C082, C083, C089, C091, C097, C105];

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
