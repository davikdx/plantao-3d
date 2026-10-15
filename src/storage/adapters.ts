/**
 * Adaptadores de persistência com o MESMO contrato (testados por tests/storage):
 *  - SqliteAdapter: Android (Capacitor) via @capacitor-community/sqlite, com migrações e transações.
 *  - DexieAdapter: navegador (IndexedDB).
 *  - MemoryAdapter: testes e fallback final (avisa que nada será salvo).
 */
import Dexie, { type Table } from "dexie";
import type { CaseDefinition } from "../domain/schema";
import { DEFAULT_PREFS, type Prefs, type Profile, type SessionRecord, type StorageAdapter } from "./types";

// ------------------------------------------------------------------ memória
export class MemoryAdapter implements StorageAdapter {
  readonly kind = "memoria" as const;
  private kv = new Map<string, unknown>();
  private sessions = new Map<string, SessionRecord>();
  private cases = new Map<string, CaseDefinition>();
  async init(): Promise<void> {}
  async getPrefs(): Promise<Prefs> {
    return { ...DEFAULT_PREFS, ...((this.kv.get("prefs") as Partial<Prefs>) ?? {}) };
  }
  async savePrefs(p: Prefs): Promise<void> {
    this.kv.set("prefs", structuredClone(p));
  }
  async getProfile(): Promise<Profile | null> {
    return (this.kv.get("profile") as Profile) ?? null;
  }
  async saveProfile(p: Profile): Promise<void> {
    this.kv.set("profile", structuredClone(p));
  }
  async saveSession(r: SessionRecord): Promise<void> {
    const cur = this.sessions.get(r.sessionId);
    if (cur && cur.revision > r.revision) return;
    this.sessions.set(r.sessionId, structuredClone(r));
  }
  async getSession(id: string): Promise<SessionRecord | null> {
    const s = this.sessions.get(id);
    return s ? structuredClone(s) : null;
  }
  async listSessions(): Promise<SessionRecord[]> {
    return [...this.sessions.values()].map((s) => structuredClone(s)).sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }
  async deleteSession(id: string): Promise<void> {
    this.sessions.delete(id);
  }
  async saveCustomCase(c: CaseDefinition): Promise<void> {
    this.cases.set(`${c.id}@${c.version}`, structuredClone(c));
  }
  async listCustomCases(): Promise<CaseDefinition[]> {
    return [...this.cases.values()].map((c) => structuredClone(c));
  }
  async deleteCustomCase(id: string, version: string): Promise<void> {
    this.cases.delete(`${id}@${version}`);
  }
  async getFavorites(): Promise<string[]> {
    return [...((this.kv.get("favorites") as string[]) ?? [])];
  }
  async setFavorite(id: string, on: boolean): Promise<void> {
    const f = new Set((this.kv.get("favorites") as string[]) ?? []);
    if (on) f.add(id);
    else f.delete(id);
    this.kv.set("favorites", [...f]);
  }
}

// ------------------------------------------------------------------ IndexedDB (navegador)
interface KvRow {
  key: string;
  value: unknown;
}
interface CaseRow {
  key: string;
  id: string;
  version: string;
  data: CaseDefinition;
}

class PlantaoDB extends Dexie {
  kv!: Table<KvRow, string>;
  sessions!: Table<SessionRecord, string>;
  cases!: Table<CaseRow, string>;
  constructor(name: string) {
    super(name);
    this.version(1).stores({ kv: "key", sessions: "sessionId, caseId, status, updatedAt", cases: "key, id" });
  }
}

export class DexieAdapter implements StorageAdapter {
  readonly kind = "indexeddb" as const;
  private db: PlantaoDB;
  constructor(name = "plantao3d") {
    this.db = new PlantaoDB(name);
  }
  async init(): Promise<void> {
    await this.db.open();
  }
  async getPrefs(): Promise<Prefs> {
    const r = await this.db.kv.get("prefs");
    return { ...DEFAULT_PREFS, ...((r?.value as Partial<Prefs>) ?? {}) };
  }
  async savePrefs(p: Prefs): Promise<void> {
    await this.db.kv.put({ key: "prefs", value: p });
  }
  async getProfile(): Promise<Profile | null> {
    return ((await this.db.kv.get("profile"))?.value as Profile) ?? null;
  }
  async saveProfile(p: Profile): Promise<void> {
    await this.db.kv.put({ key: "profile", value: p });
  }
  async saveSession(r: SessionRecord): Promise<void> {
    await this.db.transaction("rw", this.db.sessions, async () => {
      const cur = await this.db.sessions.get(r.sessionId);
      if (cur && cur.revision > r.revision) return;
      await this.db.sessions.put(r);
    });
  }
  async getSession(id: string): Promise<SessionRecord | null> {
    return (await this.db.sessions.get(id)) ?? null;
  }
  async listSessions(): Promise<SessionRecord[]> {
    return (await this.db.sessions.orderBy("updatedAt").reverse().toArray()) ?? [];
  }
  async deleteSession(id: string): Promise<void> {
    await this.db.sessions.delete(id);
  }
  async saveCustomCase(c: CaseDefinition): Promise<void> {
    await this.db.cases.put({ key: `${c.id}@${c.version}`, id: c.id, version: c.version, data: c });
  }
  async listCustomCases(): Promise<CaseDefinition[]> {
    return (await this.db.cases.toArray()).map((r) => r.data);
  }
  async deleteCustomCase(id: string, version: string): Promise<void> {
    await this.db.cases.delete(`${id}@${version}`);
  }
  async getFavorites(): Promise<string[]> {
    return ((await this.db.kv.get("favorites"))?.value as string[]) ?? [];
  }
  async setFavorite(id: string, on: boolean): Promise<void> {
    await this.db.transaction("rw", this.db.kv, async () => {
      const f = new Set(((await this.db.kv.get("favorites"))?.value as string[]) ?? []);
      if (on) f.add(id);
      else f.delete(id);
      await this.db.kv.put({ key: "favorites", value: [...f] });
    });
  }
}

// ------------------------------------------------------------------ SQLite (Android)
const MIGRATIONS: { version: number; sql: string }[] = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY NOT NULL, case_id TEXT NOT NULL, status TEXT NOT NULL, updated_at TEXT NOT NULL, revision INTEGER NOT NULL, data TEXT NOT NULL);
      CREATE INDEX IF NOT EXISTS idx_sessions_updated ON sessions(updated_at);
      CREATE TABLE IF NOT EXISTS cases (id TEXT NOT NULL, version TEXT NOT NULL, data TEXT NOT NULL, PRIMARY KEY (id, version));
      CREATE TABLE IF NOT EXISTS schema_meta (version INTEGER NOT NULL);
    `
  }
];

interface SqlConn {
  open(): Promise<void>;
  execute(sql: string, transaction?: boolean): Promise<unknown>;
  run(sql: string, values?: unknown[], transaction?: boolean): Promise<unknown>;
  query(sql: string, values?: unknown[]): Promise<{ values?: Record<string, unknown>[] }>;
}

export class SqliteAdapter implements StorageAdapter {
  readonly kind = "sqlite" as const;
  private db: SqlConn | null = null;
  constructor(private dbName = "plantao3d") {}

  async init(): Promise<void> {
    const mod = await import("@capacitor-community/sqlite");
    const sqlite = new mod.SQLiteConnection(mod.CapacitorSQLite);
    await sqlite.checkConnectionsConsistency().catch(() => undefined);
    const exists = (await sqlite.isConnection(this.dbName, false)).result;
    const conn = exists ? await sqlite.retrieveConnection(this.dbName, false) : await sqlite.createConnection(this.dbName, false, "no-encryption", 1, false);
    await conn.open();
    this.db = conn as unknown as SqlConn;
    await this.migrate();
  }

  private async migrate(): Promise<void> {
    const db = this.db!;
    await db.execute("CREATE TABLE IF NOT EXISTS schema_meta (version INTEGER NOT NULL);", false);
    const r = await db.query("SELECT MAX(version) AS v FROM schema_meta;");
    const current = Number(r.values?.[0]?.v ?? 0) || 0;
    for (const m of MIGRATIONS) {
      if (m.version <= current) continue;
      // execute() com transaction=true: a migração é aplicada inteira ou nada
      await db.execute(`${m.sql}\nINSERT INTO schema_meta (version) VALUES (${m.version});`, true);
    }
  }

  private async kvGet<T>(key: string): Promise<T | null> {
    const r = await this.db!.query("SELECT value FROM kv WHERE key = ?;", [key]);
    const v = r.values?.[0]?.value;
    return typeof v === "string" ? (JSON.parse(v) as T) : null;
  }
  private async kvSet(key: string, value: unknown): Promise<void> {
    await this.db!.run("INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?);", [key, JSON.stringify(value)], true);
  }
  async getPrefs(): Promise<Prefs> {
    return { ...DEFAULT_PREFS, ...((await this.kvGet<Partial<Prefs>>("prefs")) ?? {}) };
  }
  async savePrefs(p: Prefs): Promise<void> {
    await this.kvSet("prefs", p);
  }
  async getProfile(): Promise<Profile | null> {
    return this.kvGet<Profile>("profile");
  }
  async saveProfile(p: Profile): Promise<void> {
    await this.kvSet("profile", p);
  }
  async saveSession(r: SessionRecord): Promise<void> {
    // UPSERT condicionado à revisão: escrita obsoleta não sobrescreve estado mais novo
    await this.db!.run(
      `INSERT INTO sessions (id, case_id, status, updated_at, revision, data) VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET case_id = excluded.case_id, status = excluded.status, updated_at = excluded.updated_at, revision = excluded.revision, data = excluded.data
       WHERE excluded.revision >= sessions.revision;`,
      [r.sessionId, r.caseId, r.status, r.updatedAt, r.revision, JSON.stringify(r)],
      true
    );
  }
  async getSession(id: string): Promise<SessionRecord | null> {
    const r = await this.db!.query("SELECT data FROM sessions WHERE id = ?;", [id]);
    const d = r.values?.[0]?.data;
    return typeof d === "string" ? (JSON.parse(d) as SessionRecord) : null;
  }
  async listSessions(): Promise<SessionRecord[]> {
    const r = await this.db!.query("SELECT data FROM sessions ORDER BY updated_at DESC;");
    return (r.values ?? []).map((x) => JSON.parse(String(x.data)) as SessionRecord);
  }
  async deleteSession(id: string): Promise<void> {
    await this.db!.run("DELETE FROM sessions WHERE id = ?;", [id], true);
  }
  async saveCustomCase(c: CaseDefinition): Promise<void> {
    await this.db!.run("INSERT OR REPLACE INTO cases (id, version, data) VALUES (?, ?, ?);", [c.id, c.version, JSON.stringify(c)], true);
  }
  async listCustomCases(): Promise<CaseDefinition[]> {
    const r = await this.db!.query("SELECT data FROM cases;");
    return (r.values ?? []).map((x) => JSON.parse(String(x.data)) as CaseDefinition);
  }
  async deleteCustomCase(id: string, version: string): Promise<void> {
    await this.db!.run("DELETE FROM cases WHERE id = ? AND version = ?;", [id, version], true);
  }
  async getFavorites(): Promise<string[]> {
    return (await this.kvGet<string[]>("favorites")) ?? [];
  }
  async setFavorite(id: string, on: boolean): Promise<void> {
    const f = new Set(await this.getFavorites());
    if (on) f.add(id);
    else f.delete(id);
    await this.kvSet("favorites", [...f]);
  }
}
