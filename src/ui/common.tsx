import type { ReactNode } from "react";
import { useApp } from "../app/App";
import { t } from "../i18n/pt-BR/strings";
import type { CaseDefinition } from "../domain/schema";

export function TopBar({ title, back = true, children }: { title: string; back?: boolean; children?: ReactNode }) {
  const { go } = useApp();
  return (
    <header className="topbar">
      {back && (
        <button className="btn small" onClick={() => go({ name: "home" })} aria-label={t("nav.back")}>
          ← {t("nav.back")}
        </button>
      )}
      <h1>{title}</h1>
      {children}
    </header>
  );
}

export const STATUS_LABEL: Record<CaseDefinition["status"], string> = {
  draft: "Rascunho",
  schemaValidated: "Schema validado",
  technicallyTested: "Testado tecnicamente — revisão clínica pendente",
  clinicallyReviewed: "Revisado clinicamente",
  published: "Publicado"
};

export function ReviewTag({ status }: { status: CaseDefinition["status"] }) {
  const ok = status === "clinicallyReviewed" || status === "published";
  return <span className={`tag ${ok ? "ok" : "warn"}`}>{ok ? STATUS_LABEL[status] : "Experimental · revisão clínica pendente"}</span>;
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="modal-back" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontSize: "1.1em" }}>{title}</h2>
          <button className="btn small" onClick={onClose} aria-label={t("common.close")}>
            ✕
          </button>
        </div>
        <div className="col" style={{ marginTop: 10 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/** Baixa um arquivo de texto (navegador) ou compartilha (Android). */
export async function saveTextFile(filename: string, text: string, mime = "application/json"): Promise<string> {
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (Capacitor.isNativePlatform()) {
      const { Filesystem, Directory, Encoding } = await import("@capacitor/filesystem");
      const r = await Filesystem.writeFile({ path: filename, data: text, directory: Directory.Cache, encoding: Encoding.UTF8 });
      try {
        const { Share } = await import("@capacitor/share");
        await Share.share({ title: filename, url: r.uri, dialogTitle: "Exportar arquivo" });
        return "Arquivo pronto para compartilhar.";
      } catch {
        return `Arquivo salvo em: ${r.uri}`;
      }
    }
  } catch {
    /* segue para o navegador */
  }
  const blob = new Blob([text], { type: mime });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  return "Download iniciado.";
}

export function pickTextFile(): Promise<string | null> {
  return new Promise((resolve) => {
    const i = document.createElement("input");
    i.type = "file";
    i.accept = "application/json,.json";
    i.onchange = () => {
      const f = i.files?.[0];
      if (!f) return resolve(null);
      if (f.size > 10 * 1024 * 1024) return resolve(null);
      f.text().then(resolve, () => resolve(null));
    };
    i.click();
  });
}

export function caseTitle(c: CaseDefinition, hideDx: boolean): string {
  return hideDx ? c.publicTitle : `${c.publicTitle} — ${c.teachingTitle}`;
}
