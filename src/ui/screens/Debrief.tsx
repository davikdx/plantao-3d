import { useMemo, useState } from "react";
import { useApp } from "../../app/App";
import { OUTCOME_LABELS } from "../../app/session";
import { scoreOralAnswer } from "../../ai";
import { CATALOG } from "../../content/catalog";
import { diagnosisLabel } from "../../content/catalog/diagnoses";
import { REFERENCES_BY_ID } from "../../content/references";
import { getResourceProfile } from "../../domain/resources";
import { replay } from "../../engine/engine";
import { formatClock } from "../../engine/util";
import { learnerView } from "../../engine/views";
import { t } from "../../i18n/pt-BR/strings";
import { saveTextFile, TopBar } from "../common";

const VERIF: Record<string, string> = { conteudo_conferido: "trecho conferido", localizador_conferido: "localizador conferido", nao_acessado: "não acessada nesta versão" };

export function Debrief({ sessionId }: { sessionId: string }) {
  const { sessions, go } = useApp();
  const rec = sessions.find((s) => s.sessionId === sessionId);
  const [replayIdx, setReplayIdx] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const replayView = useMemo(() => {
    if (!rec || replayIdx === null) return null;
    const c = rec.caseSnapshot;
    const ctx = { caseDef: c, catalog: CATALOG, profile: getResourceProfile(c.resourceProfile)! };
    const cmds = rec.commands.slice(0, replayIdx + 1);
    const tick = cmds.at(-1)?.simTick ?? 0;
    const s = replay(ctx, { sessionId: rec.sessionId, seed: rec.seed, branchId: rec.branchId }, cmds, tick);
    return { tick, view: learnerView(s, ctx) };
  }, [rec, replayIdx]);

  if (!rec || !rec.result) return <main className="screen"><TopBar title={t("debrief.title")} /><p>Relatório não encontrado.</p></main>;
  const r = rec.result;
  const c = rec.caseSnapshot;
  const oral = rec.mode === "oral" && rec.oralAnswer !== undefined ? scoreOralAnswer(rec.oralAnswer, c.teaching.oralRubric) : null;

  return (
    <main className="screen">
      <TopBar title={`${t("debrief.title")} — ${c.teachingTitle}`} />
      <section className="card col">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <strong style={{ fontSize: "1.6em" }}>{r.total.toFixed(1)} / 100</strong>
          <span className="tag">Desfecho clínico: {OUTCOME_LABELS[r.outcome.clinical] ?? r.outcome.clinical}</span>
          <span className={`tag ${r.criticalFailures.length ? "danger" : "ok"}`}>{r.criticalFailures.length} falha(s) crítica(s)</span>
        </div>
        <p className="muted" style={{ margin: 0 }}>Nota de competência, desfecho clínico e falhas de segurança são avaliados separadamente. Conteúdo: {r.reviewStatus === "clinicallyReviewed" ? "revisado" : "experimental — revisão clínica pendente"} · caso {c.id} v{c.version} · seed {rec.seed}.</p>
        {r.domainScores.filter((d) => d.max > 0).map((d) => (
          <div key={d.domain}>
            <div className="row" style={{ justifyContent: "space-between" }}><span>{d.label}</span><span>{d.earned.toFixed(1)} / {d.max.toFixed(1)}</span></div>
            <div className="score-bar"><span style={{ width: `${(d.earned / Math.max(0.01, d.max)) * 100}%` }} /></div>
          </div>
        ))}
      </section>
      <section className="card col">
        <strong>Resumo do caso</strong>
        <p style={{ margin: 0 }}>{c.teaching.summary}</p>
        <p style={{ margin: 0 }}>
          Diagnóstico: <b>{diagnosisLabel(c.diagnosis.primary)}</b>. Seu diagnóstico final: {rec.result && (r.diagnosisCorrect ? "✔ " : "✘ ")}
          {(() => {
            const last = rec.commands.filter((x) => x.type === "setFinalDiagnosis").at(-1);
            return last ? diagnosisLabel(String(last.payload.diagnosisId)) : "não registrado";
          })()}
        </p>
        <p style={{ margin: 0 }}>Diferenciais a considerar: {c.diagnosis.differentials.map(diagnosisLabel).join("; ") || "—"}</p>
        <p style={{ margin: 0 }}>Destino: {r.dispositionAccepted ? "✔ aceito" : "✘ não aceito ou não definido"} (aceitos: {c.acceptedDestinations.join(", ")})</p>
        <p className="muted" style={{ margin: 0 }}>{c.outcomeNotes}</p>
      </section>
      {r.criticalFailures.length > 0 && (
        <section className="card col">
          <strong>Ações críticas omitidas ou falhas de segurança</strong>
          {r.criticalFailures.map((i) => <div key={i.ruleId} className="notice danger"><b>{i.description}</b> — {i.evidence} {i.rationale}</div>)}
        </section>
      )}
      <section className="card col">
        <strong>Critérios avaliados (evidência no registro)</strong>
        <table className="simple">
          <thead><tr><th>Critério</th><th>Resultado</th><th>Evidência / janela</th><th>Justificativa e fontes</th></tr></thead>
          <tbody>
            {r.items.map((i) => (
              <tr key={i.ruleId}>
                <td>{i.description}<br /><span className="tag">{i.severity}</span></td>
                <td>{i.penalty ? (i.met ? `✘ −${Math.abs(i.pointsEarned)}` : "✔ evitado") : i.met ? `✔ +${i.pointsEarned}` : `✘ 0/${i.pointsPossible}`}</td>
                <td>{i.evidence}{i.window ? ` (${i.window})` : ""}</td>
                <td>{i.rationale}{i.alternatives ? ` Alternativas aceitas: ${i.alternatives}` : ""}{i.sourceIds.length ? ` [${i.sourceIds.join(", ")}]` : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {oral && (
        <section className="card col">
          <strong>Prova oral — rubrica estruturada ({oral.score}/{oral.max})</strong>
          <span>Conceitos presentes: {oral.found.join("; ") || "nenhum"}</span>
          <span>Conceitos ausentes: {oral.missing.join("; ") || "nenhum"}</span>
          <span className="muted">Avaliação por correspondência de conceitos; não substitui avaliador humano.</span>
        </section>
      )}
      <section className="card col">
        <strong>Raciocínio fisiopatológico</strong>
        <p style={{ margin: 0 }}>{c.teaching.pathophysiology}</p>
        <strong>Pontos de aprendizado</strong>
        <ul style={{ margin: 0 }}>{c.teaching.keyPoints.map((k) => <li key={k}>{k}</li>)}</ul>
        {c.teaching.alternatives.length > 0 && <><strong>Alternativas aceitas</strong><ul style={{ margin: 0 }}>{c.teaching.alternatives.map((k) => <li key={k}>{k}</li>)}</ul></>}
        {c.teaching.simplifications.length > 0 && <><strong>Simplificações do simulador</strong><ul style={{ margin: 0 }}>{c.teaching.simplifications.map((k) => <li key={k}>{k}</li>)}</ul></>}
      </section>
      <section className="card col">
        <strong>Linha do tempo</strong>
        <div className="list" style={{ maxHeight: 320, overflowY: "auto" }}>
          {r.timeline.map((x, i) => <div key={i} className="item"><span className="tag">{x.time}</span> {x.text}</div>)}
        </div>
      </section>
      <section className="card col">
        <strong>Replay: o que você sabia em cada instante</strong>
        <input type="range" min={0} max={Math.max(0, rec.commands.length - 1)} value={replayIdx ?? 0} onChange={(e) => setReplayIdx(Number(e.target.value))} aria-label="Instante do replay" disabled={rec.commands.length === 0} />
        {replayView && (
          <div className="item">
            <b>{formatClock(replayView.tick)}</b> — perguntas: {replayView.view.knowledge.history.length}; exames físicos: {replayView.view.knowledge.exams.length}; resultados disponíveis: {replayView.view.knowledge.results.map((x) => x.label).join(", ") || "nenhum"}; dispositivos: {replayView.view.devices.join(", ") || "nenhum"}; últimas leituras: {replayView.view.monitor.readings.map((x) => `${x.var}=${x.value ?? "—"}`).join(", ") || "sem monitor"}.
          </div>
        )}
        <span className="muted" style={{ fontSize: "0.85em" }}>O replay mostra apenas o estado visível ao aluno; não mistura conhecimentos do debriefing.</span>
      </section>
      <section className="card col">
        <strong>Fontes ({r.reviewStatus === "clinicallyReviewed" ? "revisadas" : "revisão clínica pendente"})</strong>
        <ul style={{ margin: 0 }}>
          {r.references.map((id) => {
            const ref = REFERENCES_BY_ID.get(id);
            return <li key={id}>{ref ? <>{ref.entity}. <i>{ref.document}</i>. {ref.year}. Seção: {ref.section}. Acesso: {ref.accessedAt} ({VERIF[ref.verification]}). <span className="muted">{ref.url}</span></> : id}</li>;
          })}
        </ul>
      </section>
      <section className="card col">
        <strong>Proposta de novo treino</strong>
        <ul style={{ margin: 0 }}>{r.suggestions.map((s) => <li key={s}>{s}</li>)}{r.suggestions.length === 0 && <li>Tente o modo prova ou uma variante.</li>}</ul>
        <div className="row">
          <button className="btn" onClick={() => go({ name: "briefing", caseId: c.id })}>{t("debrief.replay")}</button>
          <button className="btn" onClick={() => go({ name: "briefing", caseId: c.id, seed: rec.seed })}>{t("debrief.sameSeed")}</button>
          <button className="btn" onClick={() => go({ name: "variants", caseId: c.id })}>{t("debrief.variant")}</button>
          <button className="btn" onClick={async () => setMsg(await saveTextFile(`relatorio-${c.id}-${rec.sessionId.slice(0, 8)}.json`, JSON.stringify({ format: "plantao3d-relatorio", session: { ...rec, caseSnapshot: { id: c.id, version: c.version } } }, null, 2)))}>{t("debrief.export")}</button>
        </div>
        {msg && <span className="muted">{msg}</span>}
      </section>
    </main>
  );
}
