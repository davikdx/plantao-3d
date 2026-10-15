import { Capacitor } from "@capacitor/core";
import { DexieAdapter, MemoryAdapter, SqliteAdapter } from "./adapters";
import type { StorageAdapter } from "./types";

export interface StorageBoot {
  adapter: StorageAdapter;
  warnings: string[];
}

/**
 * Inicializa a persistência APÓS a plataforma estar pronta.
 * Android: SQLite nativo; se falhar, recua para IndexedDB do WebView e registra o motivo.
 * Navegador: IndexedDB; se indisponível (ex.: modo privado), memória com aviso.
 */
export async function bootStorage(): Promise<StorageBoot> {
  const warnings: string[] = [];
  if (Capacitor.isNativePlatform()) {
    try {
      const a = new SqliteAdapter();
      await a.init();
      return { adapter: a, warnings };
    } catch (e) {
      warnings.push(`SQLite indisponível (${e instanceof Error ? e.message : String(e)}); usando IndexedDB do WebView.`);
    }
  }
  try {
    const a = new DexieAdapter();
    await a.init();
    if (!Capacitor.isNativePlatform()) warnings.push("Navegador: dados ficam neste navegador (IndexedDB). Exporte um backup para não perdê-los.");
    return { adapter: a, warnings };
  } catch (e) {
    warnings.push(`IndexedDB indisponível (${e instanceof Error ? e.message : String(e)}); os dados NÃO serão salvos nesta execução.`);
    const m = new MemoryAdapter();
    await m.init();
    return { adapter: m, warnings };
  }
}

export * from "./types";
export * from "./backup";
