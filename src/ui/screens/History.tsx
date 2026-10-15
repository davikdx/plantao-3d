import { useApp } from "../../app/App";
import { DOMAIN_LABELS, type ScoreDomain } from "../../engine/scoring";
import { TopBar } from "../common";
import { OUTCOME_LABELS } from "../../app/session";

export function HistoryScreen() {
  const { sessions, go, storage, refreshSessions } = useApp();
  const done = sessions.filter((s) => s.status === "concluida" && s.result);
  // tendências por domínio (percentual do máximo), comparando apenas casos-base iguais por versão
  const domains = Object.keys(DOMAIN_LABELS) as ScoreDomain[];
  const avg = domains.map((d) => {
    const vals = done.map((s) => s.result!.domainScores.find((x) => x.domain === d)).filter((x) => x && x.max > 0).map((x) => x!.earned / x!.max);
    return { d, pct: vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length) * 100 : null, n: vals.length };
  });
  const recurrent = new Map<string, number>();
  for (const s of done) for (const i of s.result!.items) if (!i.penalty && !i.met && i.severity !== "menor") recurrent.set(i.description, (recurrent.get(i.description) ?? 0) + 1);
  const top = [...recurrent.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

  return (
    <main className="screen">
      <TopBar title="Histórico e desempenho" />
      <section className="card col">
        <strong>Desempenho médio por domínio ({done.length} atendimento(s))</strong>
        {avg.map((a) => (
          <div key={a.d}>
            <div className="row" style={{ justifyContent: "space-between" }}><span>{DOMAIN_LABELS[a.d]}</span><span>{a.pct === null ? "—" : `${a.pct.toFixed(0)}%`}</span></div>
            <div className="score-bar"><span style={{ width: `${a.pct ?? 0}%` }} /></div>
          </div>
        ))}
        <span className="muted" style={{ fontSize: "0.85em" }}>Variantes e versões diferentes não são tratadas como idênticas: compare tentativas do mesmo caso e versão na lista abaixo.</span>
      </section>
      {top.length > 0 && (
        <section className="card col">
          <strong>Erros recorrentes</strong>
          <ul style={{ margin: 0 }}>{top.map(([d, n]) => <li key={d}>{d} — {n}×</li>)}</ul>
        </section>
      )}
      <section className="col">
        {sessions.map((s) => (
          <div key={s.sessionId} className="item row" style={{ justifyContent: "space-between" }}>
            <span>
              <b>{s.caseSnapshot.publicTitle}</b> <span className="tag">{s.caseId} v{s.caseVersion}</span> <span className="tag">{s.mode}</span>
              <br />
              <span className="muted" style={{ fontSize: "0.85em" }}>{new Date(s.startedAt).toLocaleString("pt-BR")} · {s.status === "concluida" ? `nota ${s.result?.total.toFixed(1)} · ${OUTCOME_LABELS[s.result?.outcome.clinical ?? ""] ?? ""}` : "em andamento"}</span>
            </span>
            <span className="row">
              {s.status === "concluida" && <button className="btn small" onClick={() => go({ name: "debrief", sessionId: s.sessionId })}>Relatório</button>}
              <button className="btn small danger" onClick={async () => { await storage.deleteSession(s.sessionId); await refreshSessions(); }}>Excluir</button>
            </span>
          </div>
        ))}
        {sessions.length === 0 && <p className="muted">Nenhum atendimento registrado.</p>}
      </section>
    </main>
  );
}
