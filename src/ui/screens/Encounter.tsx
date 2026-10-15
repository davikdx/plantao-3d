import { useCallback, useEffect, useReducer, useState } from "react";
import { useApp } from "../../app/App";
import { StructuredTutorAdapter, scoreOralAnswer } from "../../ai";
import { formatClock } from "../../engine/util";
import { t } from "../../i18n/pt-BR/strings";
import { Modal } from "../common";
import { Monitor } from "../encounter/Monitor";
import { Stage, REGION_LABELS } from "../encounter/Stage";
import { DiagnosisTab, DispositionTab, ExamPanel, ExamTab, HistoryTab, LogTab, PatientTab, ProceduresTab, TestsTab, TreatmentTab, type TabProps } from "../encounter/Tabs";

const TABS = [
  ["patient", "tab.patient"],
  ["history", "tab.history"],
  ["exam", "tab.exam"],
  ["tests", "tab.tests"],
  ["treatment", "tab.treatment"],
  ["procedures", "tab.procedures"],
  ["diagnosis", "tab.diagnosis"],
  ["disposition", "tab.disposition"],
  ["log", "tab.log"]
] as const;
type TabId = (typeof TABS)[number][0];

const TUTORIAL_STEPS: { text: string; done: (s: ReturnType<typeof tutorialState>) => boolean }[] = [
  { text: "1. Abra Procedimentos e realize a Monitorização multiparamétrica.", done: (s) => s.monitor },
  { text: "2. Em Paciente, pergunte \"O que está sentindo?\" (ou use a aba História).", done: (s) => s.asked },
  { text: "3. Toque no tórax do paciente (ou use Exame físico) e faça a Ausculta.", done: (s) => s.examined },
  { text: "4. Em Exames, solicite um exame e use \"Aguardar\" para ver o resultado chegar.", done: (s) => s.test },
  { text: "5. Em Tratamento, escolha um medicamento, confira a ordem (o app calcula volume) e confirme.", done: (s) => s.rx },
  { text: "6. Em Diagnósticos, registre um diagnóstico final; em Destino, escolha o destino.", done: (s) => s.dx && s.dest },
  { text: "7. Encerre o atendimento para abrir o debriefing.", done: () => false }
];
function tutorialState(ctl: NonNullable<ReturnType<typeof useApp>["active"]>) {
  const s = ctl.state;
  return {
    monitor: s.devices.includes("monitor_ecg"),
    asked: s.knowledge.history.length > 0,
    examined: s.knowledge.exams.some((e) => e.maneuver === "ausculta"),
    test: s.orders.some((o) => o.kind === "test"),
    rx: s.orders.some((o) => o.kind === "drug"),
    dx: !!s.finalDiagnosis,
    dest: !!s.disposition
  };
}

export function Encounter({ tutorial }: { tutorial?: boolean }) {
  const { active: ctl, go, prefs, setPrefs, refreshSessions } = useApp();
  const [, force] = useReducer((x: number) => x + 1, 0);
  const [tab, setTab] = useState<TabId>("patient");
  const [region, setRegion] = useState<string | null>(null);
  const [pinned, setPinned] = useState(true);
  const [monCanvas, setMonCanvas] = useState<HTMLCanvasElement | null>(null);
  const [speakSig, setSpeakSig] = useState(0);
  const [toasts, setToasts] = useState<{ id: number; text: string; kind: string }[]>([]);
  const [tutor, setTutor] = useState<{ level: number; text: string } | null>(null);
  const [ending, setEnding] = useState(false);
  const [oral, setOral] = useState("");
  const [fallback, setFallback] = useState<string | null>(null);
  const [seenMsgs, setSeenMsgs] = useState(0);

  useEffect(() => {
    if (!ctl) return;
    ctl.start();
    let last = 0;
    const un = ctl.subscribe(() => {
      const n = performance.now();
      if (n - last > 250) {
        last = n;
        force();
      }
    });
    const id = setInterval(force, 1000);
    return () => {
      un();
      clearInterval(id);
      ctl.stop();
    };
  }, [ctl]);

  const toast = useCallback((text: string, kind = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t0) => [...t0.slice(-3), { id, text, kind }]);
    setTimeout(() => setToasts((t0) => t0.filter((x) => x.id !== id)), 4500);
  }, []);

  // novas mensagens da equipe aparecem como notificação na cena
  useEffect(() => {
    if (!ctl) return;
    const msgs = ctl.state.knowledge.staffMessages;
    if (msgs.length > seenMsgs) {
      for (const m of msgs.slice(seenMsgs)) toast(`${m.from}: ${m.text}`, "equipe");
      setSeenMsgs(msgs.length);
    }
  });

  if (!ctl) {
    return (
      <main className="screen">
        <p>Nenhum atendimento ativo.</p>
        <button className="btn" onClick={() => go({ name: "home" })}>Início</button>
      </main>
    );
  }
  const mode = ctl.record.mode;
  const props: TabProps = { ctl, mode, prefs, onSpeak: () => setSpeakSig((x) => x + 1), toast };
  const tutorAdapter = new StructuredTutorAdapter();
  const v = ctl.view();
  const showDifficultyClock = true;

  const finish = async () => {
    const res = await ctl.finish(mode === "oral" ? oral : undefined);
    void res;
    await refreshSessions();
    go({ name: "debrief", sessionId: ctl.record.sessionId });
  };

  const tstate = tutorial ? tutorialState(ctl) : null;
  const currentStep = tstate ? TUTORIAL_STEPS.find((s) => !s.done(tstate)) : null;

  return (
    <div className="enc">
      <header className="enc-top">
        <button className="btn small" onClick={() => { ctl.setPaused(true); go({ name: "home" }); }} aria-label="Sair para o início (o atendimento fica salvo)">⌂</button>
        {showDifficultyClock && <span className="clock" aria-label="Tempo simulado">⏱ {formatClock(ctl.state.tick)}</span>}
        <button className="btn small" onClick={() => ctl.setPaused(!ctl.paused)} aria-pressed={ctl.paused}>{ctl.paused ? `▶ ${t("enc.resume")}` : `⏸ ${t("enc.pause")}`}</button>
        <label className="row" style={{ gap: 4 }}>
          <span className="sr-only">{t("enc.speed")}</span>
          <select value={ctl.speed} onChange={(e) => ctl.setSpeed(Number(e.target.value))} aria-label={t("enc.speed")}>
            <option value={1}>1×</option>
            <option value={2}>2×</option>
            <option value={4}>4×</option>
          </select>
        </label>
        <button className="btn small" onClick={() => ctl.skip(60)}>+1 min</button>
        {mode !== "prova" && mode !== "oral" && (
          <button className="btn small" onClick={() => ctl.undo()} disabled={!ctl.canUndo()}>↶ {t("enc.undo")}</button>
        )}
        <button className="btn small" onClick={() => {
          const lvl = Math.min(4, (tutor?.level ?? 0) + 1);
          const h = tutorAdapter.hint(ctl.ctx.caseDef, ctl.state, mode, lvl);
          if (h.allowed) ctl.send("requestHint", { level: h.level });
          setTutor({ level: h.level, text: h.text });
        }}>🎓 {t("enc.tutor")}</button>
        <span className="tag">{t(`mode.${mode}` as "mode.guiado")}</span>
        {ctl.paused && <span className="tag warn">PAUSADO</span>}
        {ctl.ended && <span className="tag danger">ENCERRADO{v.terminalOutcome ? ` — ${v.terminalOutcome}` : ""}</span>}
        <span style={{ flex: 1 }} />
        <button className="btn small danger" onClick={() => setEnding(true)}>{t("enc.end")}</button>
      </header>
      <div className="enc-body">
        <div className="stage">
          <Stage
            ctl={ctl}
            use2D={prefs.render2D || !!fallback}
            quality={prefs.quality}
            reducedMotion={prefs.reducedMotion}
            onRegion={(id) => setRegion(id)}
            monitorCanvas={monCanvas}
            speakSignal={speakSig}
            onFallback={(r) => setFallback(r)}
          />
          <Monitor
            ctl={ctl}
            showRhythmLabel={mode === "guiado"}
            soundVolume={prefs.effectsVolume}
            alarmSound={prefs.alarmSound}
            pinned={pinned}
            onTogglePin={() => setPinned(!pinned)}
            onCanvas={setMonCanvas}
          />
          {region && (
            <div className="card region-pop" role="dialog" aria-label={`Exame: ${REGION_LABELS[region]}`}>
              <ExamPanel ctl={ctl} region={region} prefs={prefs} onDone={() => { setTab("exam"); }} />
              <button className="btn small" onClick={() => setRegion(null)}>{t("common.close")}</button>
            </div>
          )}
          <div className="feed" aria-live="polite">
            {fallback && <div className="msg">{fallback}</div>}
            {currentStep && <div className="msg" style={{ borderColor: "var(--accent)" }}>🎓 Tutorial: {currentStep.text}</div>}
            {toasts.map((x) => (
              <div key={x.id} className="msg" style={{ borderColor: x.kind === "erro" ? "var(--danger)" : x.kind === "equipe" ? "var(--warn)" : "var(--line)" }}>{x.text}</div>
            ))}
          </div>
        </div>
        <section className="panel">
          <div className="tabs" role="tablist">
            {TABS.map(([id, key]) => (
              <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>{t(key)}</button>
            ))}
          </div>
          <div className="tabpanel" role="tabpanel">
            {tab === "patient" && <PatientTab {...props} />}
            {tab === "history" && <HistoryTab {...props} />}
            {tab === "exam" && <ExamTab {...props} />}
            {tab === "tests" && <TestsTab {...props} />}
            {tab === "treatment" && <TreatmentTab {...props} />}
            {tab === "procedures" && <ProceduresTab {...props} />}
            {tab === "diagnosis" && <DiagnosisTab {...props} />}
            {tab === "disposition" && <DispositionTab {...props} onEnd={() => setEnding(true)} />}
            {tab === "log" && <LogTab {...props} />}
          </div>
        </section>
      </div>
      {tutor && (
        <Modal title={`Tutor — nível ${tutor.level}`} onClose={() => setTutor(null)}>
          <p>{tutor.text}</p>
          <span className="muted" style={{ fontSize: "0.85em" }}>Dicas são registradas no relatório. Sugestões do tutor não executam ordens.</span>
        </Modal>
      )}
      {ending && (
        <Modal title={t("enc.end")} onClose={() => setEnding(false)}>
          {!v.disposition && <p className="notice">Destino ainda não definido.</p>}
          {!v.finalDiagnosis && <p className="notice">Diagnóstico final ainda não registrado.</p>}
          {mode === "oral" && (
            <label className="field">
              Prova oral: explique suas prioridades, hipótese, condutas e destino (texto livre; avaliado por rubrica estruturada).
              <textarea value={oral} onChange={(e) => setOral(e.target.value)} />
              <span className="muted">Conceitos reconhecidos até agora: {scoreOralAnswer(oral, ctl.ctx.caseDef.teaching.oralRubric).found.length}</span>
            </label>
          )}
          <div className="row">
            <button className="btn primary" onClick={finish}>Encerrar e ver debriefing</button>
            <button className="btn" onClick={() => setEnding(false)}>{t("common.cancel")}</button>
          </div>
          {!prefs.tutorialDone && <button className="btn small" onClick={() => setPrefs({ tutorialDone: true })}>Marcar tutorial como concluído</button>}
        </Modal>
      )}
    </div>
  );
}
