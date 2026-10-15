import { useMemo, useState } from "react";
import { useApp } from "../../app/App";
import { ENVIRONMENT_LABELS, ENVIRONMENTS, getResourceProfile } from "../../domain/resources";
import { t } from "../../i18n/pt-BR/strings";
import { caseTitle, ReviewTag, saveTextFile, TopBar } from "../common";
import { exportCase } from "../../storage/backup";
import type { CaseDefinition } from "../../domain/schema";

const PAGE = 20;

function population(c: CaseDefinition): string {
  if ((c.patient.pregnancyWeeks ?? 0) > 0) return "gestante";
  if (c.patient.ageYears < 18) return "pediatrico";
  if (c.patient.ageYears >= 65) return "idoso";
  return "adulto";
}

export function Library({ specialty, oral }: { specialty?: string; oral?: boolean }) {
  const { cases, favorites, toggleFavorite, sessions, go, prefs, setPrefs } = useApp();
  const [q, setQ] = useState("");
  const [spec, setSpec] = useState(specialty && specialty !== "__escolher" ? specialty : "");
  const [env, setEnv] = useState("");
  const [pop, setPop] = useState("");
  const [diff, setDiff] = useState("");
  const [state, setState] = useState("todos");
  const [review, setReview] = useState("");
  const [sort, setSort] = useState<"id" | "dificuldade" | "titulo">("id");
  const [group, setGroup] = useState<"lista" | "ambiente" | "especialidade">(specialty === "__escolher" ? "especialidade" : "lista");
  const [page, setPage] = useState(0);
  const [msg, setMsg] = useState("");

  const specialties = useMemo(() => [...new Set(cases.flatMap((c) => c.specialties))].sort(), [cases]);
  const doneIds = new Set(sessions.filter((s) => s.status === "concluida").map((s) => s.caseId));
  const errorIds = new Set(sessions.filter((s) => (s.result?.criticalFailures.length ?? 0) > 0).map((s) => s.caseId));

  const filtered = useMemo(() => {
    const nq = q.trim().toLowerCase();
    let list = cases.filter((c) => {
      if (spec && !c.specialties.includes(spec)) return false;
      if (env && c.environment !== env) return false;
      if (pop && population(c) !== pop) return false;
      if (diff && String(c.difficulty) !== diff) return false;
      if (review === "revisado" && !(c.status === "clinicallyReviewed" || c.status === "published")) return false;
      if (review === "pendente" && (c.status === "clinicallyReviewed" || c.status === "published")) return false;
      if (state === "favoritos" && !favorites.includes(c.id)) return false;
      if (state === "concluidos" && !doneIds.has(c.id)) return false;
      if (state === "nao_iniciados" && (doneIds.has(c.id) || sessions.some((s) => s.caseId === c.id))) return false;
      if (state === "com_erros" && !errorIds.has(c.id)) return false;
      if (nq) {
        // busca por título público, palavras-chave, ambiente e especialidade; diagnóstico só se não houver ocultação
        const hay = [c.publicTitle, c.briefing, ...c.keywords, ENVIRONMENT_LABELS[c.environment], ...c.specialties, c.group, prefs.hideDiagnosisInTitles ? "" : c.teachingTitle].join(" ").toLowerCase();
        if (!hay.includes(nq)) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => (sort === "dificuldade" ? a.difficulty - b.difficulty : sort === "titulo" ? a.publicTitle.localeCompare(b.publicTitle, "pt-BR") : a.id.localeCompare(b.id)));
    return list;
  }, [cases, q, spec, env, pop, diff, state, review, sort, favorites, sessions, prefs.hideDiagnosisInTitles]);

  const pageItems = filtered.slice(page * PAGE, page * PAGE + PAGE);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));

  const groups: [string, CaseDefinition[]][] =
    group === "lista"
      ? [["", pageItems]]
      : group === "ambiente"
        ? ENVIRONMENTS.map((e) => [ENVIRONMENT_LABELS[e], filtered.filter((c) => c.environment === e)] as [string, CaseDefinition[]]).filter((g) => g[1].length)
        : specialties.map((s) => [s, filtered.filter((c) => c.specialties.includes(s))] as [string, CaseDefinition[]]).filter((g) => g[1].length);

  return (
    <main className="screen">
      <TopBar title={oral ? t("home.oral") : t("home.library")} />
      <section className="card col" aria-label={t("lib.filters")}>
        <input type="search" placeholder={t("lib.search")} value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} aria-label={t("lib.search")} />
        <div className="row">
          <select value={spec} onChange={(e) => setSpec(e.target.value)} aria-label="Especialidade"><option value="">Todas as especialidades</option>{specialties.map((s) => <option key={s}>{s}</option>)}</select>
          <select value={env} onChange={(e) => setEnv(e.target.value)} aria-label="Ambiente"><option value="">Todos os ambientes</option>{ENVIRONMENTS.map((e) => <option key={e} value={e}>{ENVIRONMENT_LABELS[e]}</option>)}</select>
          <select value={pop} onChange={(e) => setPop(e.target.value)} aria-label="Idade/gestação"><option value="">Todas as idades</option><option value="pediatrico">Pediátrico</option><option value="adulto">Adulto</option><option value="idoso">Idoso</option><option value="gestante">Gestante/puérpera</option></select>
          <select value={diff} onChange={(e) => setDiff(e.target.value)} aria-label="Dificuldade"><option value="">Qualquer dificuldade</option>{[1, 2, 3, 4, 5].map((d) => <option key={d} value={d}>Dificuldade {d}</option>)}</select>
          <select value={state} onChange={(e) => setState(e.target.value)} aria-label="Situação"><option value="todos">{t("lib.all")}</option><option value="favoritos">{t("lib.favorites")}</option><option value="concluidos">{t("lib.done")}</option><option value="nao_iniciados">{t("lib.notStarted")}</option><option value="com_erros">{t("lib.withErrors")}</option></select>
          <select value={review} onChange={(e) => setReview(e.target.value)} aria-label="Revisão"><option value="">Qualquer revisão</option><option value="revisado">Revisados</option><option value="pendente">Revisão pendente</option></select>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label={t("lib.sort")}><option value="id">Ordem do catálogo</option><option value="dificuldade">Dificuldade</option><option value="titulo">Título</option></select>
          <select value={group} onChange={(e) => setGroup(e.target.value as typeof group)} aria-label="Agrupar"><option value="lista">Lista</option><option value="ambiente">{t("lib.byEnv")}</option><option value="especialidade">{t("lib.bySpecialty")}</option></select>
        </div>
        <label className="row"><input type="checkbox" checked={prefs.hideDiagnosisInTitles} onChange={(e) => setPrefs({ hideDiagnosisInTitles: e.target.checked })} /> Ocultar diagnóstico nos títulos (evita spoiler)</label>
        <span className="muted" aria-live="polite">{filtered.length} caso(s)</span>
      </section>
      {msg && <div className="notice ok">{msg}</div>}
      {filtered.length === 0 && <p className="muted">{t("lib.empty")}</p>}
      {groups.map(([title, list]) => (
        <section key={title || "lista"} className="col">
          {title && <h2 style={{ fontSize: "1.05em", margin: "6px 0 0" }}>{title}</h2>}
          <div className="grid">
            {list.map((c) => {
              const attempts = sessions.filter((s) => s.caseId === c.id && s.status === "concluida");
              const best = attempts.reduce((m, s) => Math.max(m, s.result?.total ?? 0), 0);
              const prof = getResourceProfile(c.resourceProfile);
              return (
                <article key={c.id} className="card col">
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <span className="tag">{c.id}</span>
                    <button className="btn small" onClick={() => toggleFavorite(c.id)} aria-pressed={favorites.includes(c.id)} aria-label={favorites.includes(c.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
                      {favorites.includes(c.id) ? "★" : "☆"}
                    </button>
                  </div>
                  <strong>{caseTitle(c, prefs.hideDiagnosisInTitles)}</strong>
                  <div>
                    <span className="tag">{ENVIRONMENT_LABELS[c.environment]}</span>
                    {c.specialties.map((s) => <span key={s} className="tag">{s}</span>)}
                    <span className="tag">Dificuldade {c.difficulty}</span>
                    <span className="tag">{t("lib.offline")}</span>
                    <ReviewTag status={c.status} />
                  </div>
                  <span className="muted" style={{ fontSize: "0.82em" }}>Recursos: {prof?.label ?? c.resourceProfile}</span>
                  <span className="muted" style={{ fontSize: "0.82em" }}>{attempts.length > 0 ? `${attempts.length} tentativa(s) · melhor nota ${best.toFixed(0)}/100` : "Ainda não realizado"}</span>
                  <div className="row">
                    <button className="btn primary small" onClick={() => go({ name: "briefing", caseId: c.id, mode: oral ? "oral" : undefined })}>Abrir</button>
                    <button className="btn small" onClick={async () => setMsg(await saveTextFile(`${c.id}.plantao3d.json`, exportCase(c)))}>Exportar</button>
                    <button className="btn small" onClick={() => go({ name: "editor", caseId: c.id })}>Duplicar/editar</button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
      {group === "lista" && pages > 1 && (
        <nav className="row" aria-label="Paginação">
          <button className="btn small" disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</button>
          <span>Página {page + 1} de {pages}</span>
          <button className="btn small" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>Próxima</button>
        </nav>
      )}
    </main>
  );
}
