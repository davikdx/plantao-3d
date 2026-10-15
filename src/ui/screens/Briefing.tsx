import { useState } from "react";
import { useApp } from "../../app/App";
import { SessionController } from "../../app/session";
import { ENVIRONMENT_LABELS, getResourceProfile } from "../../domain/resources";
import { t } from "../../i18n/pt-BR/strings";
import type { Mode } from "../../storage";
import { ReviewTag, TopBar } from "../common";

const MODE_DESC: Record<Mode, string> = {
  guiado: "Dicas progressivas (até sugestão explícita), objetivos visíveis, pausa e desfazer.",
  livre: "Apoio opcional limitado, pausa e desfazer; avaliação ao final.",
  prova: "Sem dicas nem desfazer; diagnóstico oculto; relatório só após concluir.",
  oral: "Como a prova; ao final você explica prioridades e justificativas, comparadas a uma rubrica."
};

function ageText(y: number, m?: number): string {
  if (y < 1) return `${m ?? Math.round(y * 12)} meses`;
  if (y < 2 && m) return `1 ano e ${m} meses`;
  return `${y} anos`;
}

export function Briefing({ caseId, mode, seed, tutorial }: { caseId: string; mode?: Mode; seed?: number; tutorial?: boolean }) {
  const { cases, go, storage, setActive, prefs, sessions, refreshSessions } = useApp();
  const c = cases.find((x) => x.id === caseId);
  const [m, setM] = useState<Mode>(mode ?? prefs.defaultMode);
  const [busy, setBusy] = useState(false);
  if (!c) return <main className="screen"><TopBar title="Caso não encontrado" /></main>;
  const prof = getResourceProfile(c.resourceProfile);
  const p = c.patient;
  const active = sessions.find((s) => s.status === "ativa");

  const start = async () => {
    setBusy(true);
    if (active) {
      // apenas um atendimento ativo por vez: o anterior é encerrado sem nota
      const prev = await SessionController.resume(active, storage);
      await prev.finish();
    }
    const ctl = await SessionController.create(c, m, storage, seed);
    setActive(ctl);
    await refreshSessions();
    go({ name: "encounter", tutorial });
  };

  return (
    <main className="screen" style={{ maxWidth: 760 }}>
      <TopBar title={c.publicTitle} />
      <section className="card col">
        <div>
          <span className="tag">{c.id}</span>
          <span className="tag">{ENVIRONMENT_LABELS[c.environment]}</span>
          <ReviewTag status={c.status} />
        </div>
        <p style={{ margin: 0 }}>{c.briefing}</p>
        <p className="muted" style={{ margin: 0 }}>
          Paciente: {p.name}, {ageText(p.ageYears, p.ageMonths)}, {p.sex}, {String(p.weightKg).replace(".", ",")} kg{p.pregnancyWeeks ? `, gestação de ${p.pregnancyWeeks} semanas` : ""}.
        </p>
      </section>
      {prof && (
        <section className="card col">
          <strong>Cenário: {prof.label}</strong>
          <span>{prof.context}</span>
          <span className="muted">{prof.notes}</span>
          <span className="muted" style={{ fontSize: "0.85em" }}>Perfil fictício configurável; não representa a estrutura de todas as unidades do tipo. SAMU: 192.</span>
        </section>
      )}
      {m === "guiado" && (
        <section className="card col">
          <strong>Objetivos de aprendizagem</strong>
          <ul style={{ margin: 0 }}>{c.objectives.map((o) => <li key={o}>{o}</li>)}</ul>
        </section>
      )}
      <section className="card col">
        <strong>{t("brief.mode")}</strong>
        <div className="row" role="radiogroup">
          {(["guiado", "livre", "prova", "oral"] as Mode[]).map((x) => (
            <button key={x} role="radio" aria-checked={m === x} className={`btn small ${m === x ? "primary" : ""}`} onClick={() => setM(x)}>
              {t(`mode.${x}` as "mode.guiado")}
            </button>
          ))}
        </div>
        <span className="muted">{MODE_DESC[m]}</span>
        {seed !== undefined && <span className="muted">Semente fixa: {seed}</span>}
        {active && <span className="notice">Há um atendimento em andamento; ao iniciar este, o anterior será encerrado (fica no histórico).</span>}
        <button className="btn primary big" onClick={start} disabled={busy}>{busy ? t("common.loading") : t("brief.start")}</button>
      </section>
    </main>
  );
}
