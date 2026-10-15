/**
 * Importação/exportação em JSON com manifesto, versão de schema e hash de integridade.
 * Conteúdo importado é DADO não confiável: validado pelo schema; nada é executado.
 * (Pacotes ZIP com mídia não são suportados nesta versão — ver README, limitações.)
 */
import type { CaseDefinition } from "../domain/schema";
import { validateCase } from "../content/validate";
import { fnv1a, stableStringify } from "../engine/util";
import { DEFAULT_PREFS, type BackupFile, type SessionRecord, type StorageAdapter } from "./types";

export const MAX_IMPORT_BYTES = 10 * 1024 * 1024;

export interface CasePackage {
  format: "plantao3d-case";
  schemaVersion: 1;
  exportedAt: string;
  hash: string;
  case: CaseDefinition;
}

export function exportCase(c: CaseDefinition, now = new Date()): string {
  const pkg: CasePackage = { format: "plantao3d-case", schemaVersion: 1, exportedAt: now.toISOString(), hash: fnv1a(stableStringify(c)), case: c };
  return JSON.stringify(pkg, null, 2);
}

export type ConflictPolicy = "substituir" | "manter_ambos" | "rejeitar";

export interface ImportResult {
  ok: boolean;
  imported: string[];
  skipped: string[];
  errors: string[];
}

function safeParse(text: string): unknown {
  if (typeof text !== "string") throw new Error("Arquivo inválido.");
  if (new Blob([text]).size > MAX_IMPORT_BYTES) throw new Error("Arquivo maior que o limite de 10 MB.");
  return JSON.parse(text, (k, v) => (k === "__proto__" || k === "constructor" || k === "prototype" ? undefined : v));
}

export async function importCase(adapter: StorageAdapter, text: string, policy: ConflictPolicy, existingIds: Set<string>): Promise<ImportResult> {
  const res: ImportResult = { ok: false, imported: [], skipped: [], errors: [] };
  let data: unknown;
  try {
    data = safeParse(text);
  } catch (e) {
    res.errors.push(e instanceof Error ? e.message : "JSON inválido.");
    return res;
  }
  const pkg = data as Partial<CasePackage>;
  const raw = pkg && pkg.format === "plantao3d-case" ? pkg.case : data;
  if (pkg && pkg.format === "plantao3d-case" && pkg.hash && raw && fnv1a(stableStringify(raw)) !== pkg.hash) {
    res.errors.push("Hash do pacote não confere: arquivo alterado ou corrompido.");
    return res;
  }
  const v = validateCase(raw);
  if (!v.ok || !v.caseDef) {
    res.errors.push(...v.errors);
    return res;
  }
  let c = v.caseDef;
  if (existingIds.has(c.id)) {
    if (policy === "rejeitar") {
      res.skipped.push(c.id);
      res.errors.push(`Já existe um caso com id ${c.id}.`);
      return res;
    }
    if (policy === "manter_ambos") c = { ...c, id: `${c.id}-IMP${Date.now().toString(36).slice(-4).toUpperCase()}` };
  }
  // conteúdo importado nunca é promovido automaticamente a revisado
  if (c.status === "clinicallyReviewed" || c.status === "published") c = { ...c, status: "technicallyTested" };
  await adapter.saveCustomCase(c);
  res.imported.push(c.id);
  res.ok = true;
  return res;
}

export async function exportBackup(adapter: StorageAdapter): Promise<BackupFile> {
  return {
    format: "plantao3d-backup",
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    prefs: await adapter.getPrefs(),
    profile: await adapter.getProfile(),
    favorites: await adapter.getFavorites(),
    customCases: await adapter.listCustomCases(),
    sessions: await adapter.listSessions()
  };
}

export async function importBackup(adapter: StorageAdapter, text: string, policy: ConflictPolicy): Promise<ImportResult> {
  const res: ImportResult = { ok: false, imported: [], skipped: [], errors: [] };
  let data: BackupFile;
  try {
    data = safeParse(text) as BackupFile;
  } catch (e) {
    res.errors.push(e instanceof Error ? e.message : "JSON inválido.");
    return res;
  }
  if (!data || data.format !== "plantao3d-backup" || data.schemaVersion !== 1) {
    res.errors.push("Arquivo não é um backup do Plantão 3D (versão 1).");
    return res;
  }
  const existingCases = new Set((await adapter.listCustomCases()).map((c) => c.id));
  for (const c of Array.isArray(data.customCases) ? data.customCases : []) {
    const r = await importCase(adapter, JSON.stringify(c), policy, existingCases);
    res.imported.push(...r.imported);
    res.skipped.push(...r.skipped);
    res.errors.push(...r.errors);
  }
  const existingSessions = new Set((await adapter.listSessions()).map((s) => s.sessionId));
  for (const s of Array.isArray(data.sessions) ? data.sessions : []) {
    const ok = s && typeof s.sessionId === "string" && Array.isArray(s.commands) && validateCase(s.caseSnapshot).ok;
    if (!ok) {
      res.errors.push(`Sessão inválida ignorada: ${String((s as SessionRecord)?.sessionId)}`);
      continue;
    }
    if (existingSessions.has(s.sessionId) && policy !== "substituir") {
      res.skipped.push(s.sessionId);
      continue;
    }
    if (existingSessions.has(s.sessionId)) await adapter.deleteSession(s.sessionId);
    await adapter.saveSession({ ...s, revision: Number.isFinite(s.revision) ? s.revision : 0 });
    res.imported.push(s.sessionId);
  }
  if (data.prefs && typeof data.prefs === "object") await adapter.savePrefs({ ...DEFAULT_PREFS, ...data.prefs, aiGatewayUrl: "" });
  if (Array.isArray(data.favorites)) for (const f of data.favorites) if (typeof f === "string") await adapter.setFavorite(f, true);
  res.ok = res.errors.length === 0;
  return res;
}
