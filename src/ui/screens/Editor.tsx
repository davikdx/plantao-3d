import { useMemo, useState } from "react";
import { useApp } from "../../app/App";
import { loadBuiltinCases } from "../../content/cases";
import { ACTIONS, DIAGNOSES, DRUGS, TESTS } from "../../content/catalog";
import { REFERENCES } from "../../content/references";
import { runTrajectories } from "../../content/trajectories";
import { validateCase } from "../../content/validate";
import { DESTINATION_LABELS, DESTINATIONS, ENVIRONMENT_LABELS, ENVIRONMENTS, RESOURCE_PROFILES } from "../../domain/resources";
import { HistoryTopicSchema, RegionSchema, ManeuverSchema, type CaseDefinition, type CaseDefinitionInput } from "../../domain/schema";
import { RHYTHMS, RHYTHM_LABELS, VAR_IDS, VARS, type VarId } from "../../domain/variables";
import { exportCase, importCase, type ConflictPolicy } from "../../storage";
import { pickTextFile, saveTextFile, STATUS_LABEL, TopBar } from "../common";

type Draft = CaseDefinitionInput & Record<string, unknown>;

function blank(): Draft {
  return {
    schemaVersion: 1,
    id: "U001",
    version: "0.1.0",
    locale: "pt-BR",
    status: "draft",
    publicTitle: "Novo caso",
    teachingTitle: "Novo caso (título pedagógico)",
    group: "Casos próprios",
    specialties: ["Clínica médica"],
    environment: "emergencia",
    resourceProfile: "upa-porte-ii",
    difficulty: 2,
    level: "internato",
    objectives: ["Objetivo de aprendizagem"],
    patient: { name: "Paciente fictício", ageYears: 40, sex: "feminino", weightKg: 70, heightCm: 165, visual: { ageGroup: "adulto", sex: "feminino", skinTone: 3, hairStyle: "longo", hairColor: "castanho", build: "medio", pregnancyTrimester: 0 } },
    briefing: "Contexto da chegada do paciente.",
    communication: "normal",
    informants: [],
    history: [{ id: "h1", topic: "queixa", question: "O que está sentindo?", answers: [{ source: "paciente", text: "Resposta do paciente." }], keywords: [] }],
    initial: { vars: { hr: 90, sbp: 120, dbp: 75, rr: 18, spo2: 96, temp: 36.8, gcs: 15, glucose: 100 }, flags: { rhythm: "sinusal" }, devices: [], visibleWithoutDevice: ["rr"] },
    exam: [],
    testResults: [],
    rules: [],
    diagnosis: { primary: "sepse", accepted: ["sepse"], differentials: [] },
    acceptedDestinations: ["observacao"],
    outcomeNotes: "Descreva os desfechos definidos pelo caso.",
    scoring: [{ id: "s1", domain: "historia", description: "Perguntou a queixa", evidence: { kind: "historyAsked", items: ["h1"], minCount: 1 }, points: 10, severity: "importante", rationale: "Justificativa." }],
    teaching: { summary: "Resumo.", pathophysiology: "Fisiopatologia.", keyPoints: ["Ponto-chave"] },
    references: ["AUTOR-SIMPLIFICACAO"],
    tests: []
  } as Draft;
}

export function Editor({ caseId }: { caseId?: string }) {
  const { cases, storage, refreshCases, prefs } = useApp();
  const builtinIds = useMemo(() => new Set(loadBuiltinCases().cases.map((c) => c.id)), []);
  const [draft, setDraft] = useState<Draft>(() => {
    const src = cases.find((c) => c.id === caseId);
    if (!src) return blank();
    const copy = structuredClone(src) as Draft;
    if (builtinIds.has(src.id)) {
      copy.id = `${src.id}-COPIA`;
      copy.status = "draft";
      copy.reviewLog = [];
    }
    return copy;
  });
  const [section, setSection] = useState("identificacao");
  const [json, setJson] = useState("");
  const [report, setReport] = useState<string[]>([]);
  const [msg, setMsg] = useState("");
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));
  const p = draft.patient;

  const validate = () => {
    const v = validateCase(draft);
    setReport(v.ok ? ["✔ Schema e referências cruzadas válidos.", ...v.warnings.map((w) => `⚠ ${w}`)] : v.errors.map((e) => `✘ ${e}`));
    return v;
  };
  const testTraj = () => {
    const v = validate();
    if (!v.ok || !v.caseDef) return;
    const res = runTrajectories(v.caseDef);
    if (res.length === 0) return setReport((r) => [...r, "Nenhuma trajetória de teste declarada (adicione em JSON avançado → tests)."]);
    setReport((r) => [...r, ...res.map((x) => `${x.passed ? "✔" : "✘"} Trajetória ${x.kind}: ${x.description}${x.failures.length ? ` — ${x.failures.join("; ")}` : ""}`)]);
    if (res.every((x) => x.passed) && draft.status === "draft") set({ status: "technicallyTested" });
  };
  const save = async () => {
    const d = { ...draft };
    if (d.status === "clinicallyReviewed" || d.status === "published") {
      if (!(d.reviewLog ?? []).some((r) => r.status === "clinicallyReviewed")) d.status = "technicallyTested";
    }
    const v = validateCase(d);
    if (!v.ok || !v.caseDef) return setReport(v.errors.map((e) => `✘ ${e}`));
    if (builtinIds.has(v.caseDef.id)) return setReport(["✘ Use um id diferente dos casos embarcados (ex.: U001)."]);
    await storage.saveCustomCase(v.caseDef);
    await refreshCases();
    setMsg(`Salvo: ${v.caseDef.id} v${v.caseDef.version} (${STATUS_LABEL[v.caseDef.status]}).`);
  };

  const sections: [string, string][] = [
    ["identificacao", "Identificação e objetivos"],
    ["paciente", "Paciente e apresentação"],
    ["sinais", "Sinais iniciais"],
    ["historia", "História e respostas"],
    ["exame", "Exame físico"],
    ["exames", "Exames e resultados"],
    ["regras", "Regras de evolução (construtor)"],
    ["pontuacao", "Pontuação e desfechos"],
    ["fontes", "Fontes, revisão e ensino"],
    ["json", "JSON avançado"]
  ];

  return (
    <main className="screen">
      <TopBar title="Editor de casos" />
      <p className="muted" style={{ margin: 0 }}>
        Editor local por formulários e elementos validados (sem código no caso). Casos salvos aqui ficam como <b>rascunho/experimentais</b>; testar trajetórias promove apenas a "testado tecnicamente", nunca a "revisado clinicamente".
      </p>
      <div className="row">
        {sections.map(([id, l]) => (
          <button key={id} className={`btn small ${section === id ? "primary" : ""}`} onClick={() => { setSection(id); if (id === "json") setJson(JSON.stringify(draft, null, 2)); }}>{l}</button>
        ))}
      </div>
      <section className="card col">
        {section === "identificacao" && (
          <>
            <div className="row">
              <label className="field">Id<input value={draft.id} onChange={(e) => set({ id: e.target.value.replace(/[^A-Za-z0-9_.:-]/g, "") })} /></label>
              <label className="field">Versão<input value={draft.version} onChange={(e) => set({ version: e.target.value })} /></label>
              <label className="field">Dificuldade<input type="number" min={1} max={5} value={draft.difficulty} onChange={(e) => set({ difficulty: Number(e.target.value) })} /></label>
              <label className="field">Nível<select value={draft.level} onChange={(e) => set({ level: e.target.value as "internato" })}><option value="internato">Internato</option><option value="residencia">Residência</option></select></label>
            </div>
            <label className="field">Título público (sem spoiler)<input value={draft.publicTitle} onChange={(e) => set({ publicTitle: e.target.value })} /></label>
            <label className="field">Título pedagógico<input value={draft.teachingTitle} onChange={(e) => set({ teachingTitle: e.target.value })} /></label>
            <label className="field">Especialidades (separadas por vírgula)<input value={draft.specialties.join(", ")} onChange={(e) => set({ specialties: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></label>
            <div className="row">
              <label className="field">Ambiente 3D<select value={draft.environment} onChange={(e) => set({ environment: e.target.value as "emergencia" })}>{ENVIRONMENTS.map((x) => <option key={x} value={x}>{ENVIRONMENT_LABELS[x]}</option>)}</select></label>
              <label className="field">Perfil de recursos<select value={draft.resourceProfile} onChange={(e) => set({ resourceProfile: e.target.value })}>{RESOURCE_PROFILES.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
            </div>
            <label className="field">Objetivos (um por linha)<textarea value={draft.objectives.join("\n")} onChange={(e) => set({ objectives: e.target.value.split("\n").filter(Boolean) })} /></label>
          </>
        )}
        {section === "paciente" && (
          <>
            <div className="row">
              <label className="field">Nome fictício<input value={p.name} onChange={(e) => set({ patient: { ...p, name: e.target.value } })} /></label>
              <label className="field">Idade (anos)<input type="number" value={p.ageYears} onChange={(e) => set({ patient: { ...p, ageYears: Number(e.target.value) } })} /></label>
              <label className="field">Sexo<select value={p.sex} onChange={(e) => set({ patient: { ...p, sex: e.target.value as "feminino", visual: { ...p.visual, sex: e.target.value as "feminino" } } })}><option value="feminino">Feminino</option><option value="masculino">Masculino</option></select></label>
              <label className="field">Peso (kg)<input type="number" value={p.weightKg} onChange={(e) => set({ patient: { ...p, weightKg: Number(e.target.value) } })} /></label>
              <label className="field">Altura (cm)<input type="number" value={p.heightCm} onChange={(e) => set({ patient: { ...p, heightCm: Number(e.target.value) } })} /></label>
              <label className="field">IG (semanas)<input type="number" value={p.pregnancyWeeks ?? ""} onChange={(e) => set({ patient: { ...p, pregnancyWeeks: e.target.value ? Number(e.target.value) : undefined } })} /></label>
            </div>
            <div className="row">
              <label className="field">Faixa etária visual<select value={p.visual.ageGroup} onChange={(e) => set({ patient: { ...p, visual: { ...p.visual, ageGroup: e.target.value as "adulto" } } })}>{["lactente", "crianca_pequena", "escolar", "adolescente", "adulto", "idoso"].map((x) => <option key={x}>{x}</option>)}</select></label>
              <label className="field">Tom de pele (0–7)<input type="range" min={0} max={7} value={p.visual.skinTone} onChange={(e) => set({ patient: { ...p, visual: { ...p.visual, skinTone: Number(e.target.value) } } })} /></label>
              <label className="field">Cabelo<select value={p.visual.hairStyle} onChange={(e) => set({ patient: { ...p, visual: { ...p.visual, hairStyle: e.target.value as "curto" } } })}>{["curto", "longo", "coque", "careca", "crespo_curto", "crespo_volume", "cacheado"].map((x) => <option key={x}>{x}</option>)}</select></label>
              <label className="field">Constituição<select value={p.visual.build} onChange={(e) => set({ patient: { ...p, visual: { ...p.visual, build: e.target.value as "medio" } } })}>{["magro", "medio", "robusto", "obeso"].map((x) => <option key={x}>{x}</option>)}</select></label>
              <label className="field">Trimestre visual<select value={p.visual.pregnancyTrimester ?? 0} onChange={(e) => set({ patient: { ...p, visual: { ...p.visual, pregnancyTrimester: Number(e.target.value) } } })}>{[0, 1, 2, 3].map((x) => <option key={x} value={x}>{x}</option>)}</select></label>
            </div>
            <label className="field">Briefing (chegada)<textarea value={draft.briefing} onChange={(e) => set({ briefing: e.target.value })} /></label>
            <label className="field">Comunicação inicial<select value={draft.communication} onChange={(e) => set({ communication: e.target.value as "normal" })}><option value="normal">Normal</option><option value="limitada">Limitada</option><option value="incapaz">Incapaz</option></select></label>
          </>
        )}
        {section === "sinais" && (
          <>
            <div className="grid">
              {VAR_IDS.filter((v) => VARS[v].group !== "interno" || v === "perfusion" || v === "effort").filter((v) => v !== "level").map((v) => (
                <label key={v} className="field">{VARS[v].label} {VARS[v].displayUnit ? `(${VARS[v].displayUnit})` : ""}
                  <input type="number" step="any" value={draft.initial.vars[v] ?? ""} placeholder="padrão" onChange={(e) => {
                    const vars = { ...draft.initial.vars };
                    if (e.target.value === "") delete vars[v];
                    else vars[v] = Number(e.target.value);
                    set({ initial: { ...draft.initial, vars } });
                  }} />
                </label>
              ))}
            </div>
            <label className="field">Ritmo<select value={String(draft.initial.flags.rhythm ?? "sinusal")} onChange={(e) => set({ initial: { ...draft.initial, flags: { ...draft.initial.flags, rhythm: e.target.value } } })}>{RHYTHMS.map((r) => <option key={r} value={r}>{RHYTHM_LABELS[r]}</option>)}</select></label>
            <label className="row"><input type="checkbox" checked={draft.initial.flags.pulse !== false} onChange={(e) => set({ initial: { ...draft.initial, flags: { ...draft.initial.flags, pulse: e.target.checked } } })} /> Pulso central presente</label>
          </>
        )}
        {section === "historia" && (
          <>
            {draft.history.map((hItem, i) => (
              <div key={i} className="item col">
                <div className="row">
                  <label className="field">Id<input value={hItem.id} onChange={(e) => { const hs = [...draft.history]; hs[i] = { ...hItem, id: e.target.value }; set({ history: hs }); }} /></label>
                  <label className="field">Tema<select value={hItem.topic} onChange={(e) => { const hs = [...draft.history]; hs[i] = { ...hItem, topic: e.target.value as "queixa" }; set({ history: hs }); }}>{HistoryTopicSchema.options.map((x) => <option key={x}>{x}</option>)}</select></label>
                  <button className="btn small danger" onClick={() => set({ history: draft.history.filter((_, j) => j !== i) })}>Remover</button>
                </div>
                <label className="field">Pergunta<input value={hItem.question} onChange={(e) => { const hs = [...draft.history]; hs[i] = { ...hItem, question: e.target.value }; set({ history: hs }); }} /></label>
                <label className="field">Resposta do paciente<textarea value={hItem.answers[0]?.text ?? ""} onChange={(e) => { const hs = [...draft.history]; hs[i] = { ...hItem, answers: [{ source: "paciente", text: e.target.value }, ...hItem.answers.slice(1)] }; set({ history: hs }); }} /></label>
              </div>
            ))}
            <button className="btn" onClick={() => set({ history: [...draft.history, { id: `h${draft.history.length + 1}`, topic: "outros", question: "Nova pergunta", answers: [{ source: "paciente", text: "Resposta" }], keywords: [] }] })}>+ Pergunta</button>
          </>
        )}
        {section === "exame" && (
          <>
            {(draft.exam ?? []).map((ex, i) => (
              <div key={i} className="item col">
                <div className="row">
                  <label className="field">Região<select value={ex.region} onChange={(e) => { const xs = [...(draft.exam ?? [])]; xs[i] = { ...ex, region: e.target.value as "geral" }; set({ exam: xs }); }}>{RegionSchema.options.map((x) => <option key={x}>{x}</option>)}</select></label>
                  <label className="field">Manobra<select value={ex.maneuver} onChange={(e) => { const xs = [...(draft.exam ?? [])]; xs[i] = { ...ex, maneuver: e.target.value as "inspecao" }; set({ exam: xs }); }}>{ManeuverSchema.options.map((x) => <option key={x}>{x}</option>)}</select></label>
                  <button className="btn small danger" onClick={() => set({ exam: (draft.exam ?? []).filter((_, j) => j !== i) })}>Remover</button>
                </div>
                <label className="field">Achado (texto)<textarea value={ex.variants.at(-1)?.text ?? ""} onChange={(e) => { const xs = [...(draft.exam ?? [])]; const vs = [...ex.variants]; vs[vs.length - 1] = { text: e.target.value }; xs[i] = { ...ex, variants: vs }; set({ exam: xs }); }} /></label>
              </div>
            ))}
            <button className="btn" onClick={() => set({ exam: [...(draft.exam ?? []), { id: `e${(draft.exam ?? []).length + 1}`, region: "geral", maneuver: "inspecao", variants: [{ text: "Achado" }] }] })}>+ Achado</button>
          </>
        )}
        {section === "exames" && <TestResultsEditor draft={draft} set={set} />}
        {section === "regras" && <RuleBuilder draft={draft} set={set} />}
        {section === "pontuacao" && <ScoreBuilder draft={draft} set={set} />}
        {section === "fontes" && (
          <>
            <strong>Diagnóstico</strong>
            <div className="row">
              <label className="field">Principal<select value={draft.diagnosis.primary} onChange={(e) => set({ diagnosis: { ...draft.diagnosis, primary: e.target.value, accepted: [...new Set([e.target.value, ...draft.diagnosis.accepted])] } })}>{DIAGNOSES.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}</select></label>
            </div>
            <strong>Destinos aceitos</strong>
            <div className="row">{DESTINATIONS.map((d) => <label key={d} className="row"><input type="checkbox" checked={draft.acceptedDestinations.includes(d)} onChange={(e) => set({ acceptedDestinations: e.target.checked ? [...draft.acceptedDestinations, d] : draft.acceptedDestinations.filter((x) => x !== d) })} />{DESTINATION_LABELS[d]}</label>)}</div>
            <strong>Fontes (somente do registro verificado)</strong>
            <div className="col">{REFERENCES.map((r) => <label key={r.sourceId} className="row"><input type="checkbox" checked={draft.references.includes(r.sourceId)} onChange={(e) => set({ references: e.target.checked ? [...draft.references, r.sourceId] : draft.references.filter((x) => x !== r.sourceId) })} />{r.sourceId} — {r.document}</label>)}</div>
            <label className="field">Resumo didático<textarea value={draft.teaching.summary} onChange={(e) => set({ teaching: { ...draft.teaching, summary: e.target.value } })} /></label>
            <label className="field">Fisiopatologia<textarea value={draft.teaching.pathophysiology} onChange={(e) => set({ teaching: { ...draft.teaching, pathophysiology: e.target.value } })} /></label>
            <label className="field">Pontos-chave (um por linha)<textarea value={draft.teaching.keyPoints.join("\n")} onChange={(e) => set({ teaching: { ...draft.teaching, keyPoints: e.target.value.split("\n").filter(Boolean) } })} /></label>
            {prefs.instructorMode && (
              <button className="btn" onClick={() => {
                const by = prompt("Nome do revisor clínico qualificado (registro local):");
                if (!by) return;
                set({ status: "clinicallyReviewed", reviewLog: [...(draft.reviewLog ?? []), { date: new Date().toISOString().slice(0, 10), by, status: "clinicallyReviewed", note: "Revisão registrada manualmente no editor (perfil instrutor)." }] });
              }}>Registrar revisão clínica humana (instrutor)</button>
            )}
          </>
        )}
        {section === "json" && (
          <>
            <span className="muted">JSON declarativo (regras, pontuação, trajetórias). Conteúdo é validado; nada é executado.</span>
            <textarea style={{ minHeight: 360 }} value={json} onChange={(e) => setJson(e.target.value)} />
            <button className="btn" onClick={() => { try { setDraft(JSON.parse(json) as Draft); setReport(["JSON aplicado ao rascunho; valide antes de salvar."]); } catch (e) { setReport([`✘ JSON inválido: ${(e as Error).message}`]); } }}>Aplicar JSON</button>
          </>
        )}
      </section>
      <section className="card col">
        <div className="row">
          <span className="tag">{STATUS_LABEL[draft.status as CaseDefinition["status"]] ?? draft.status}</span>
          <button className="btn" onClick={validate}>Validar</button>
          <button className="btn" onClick={testTraj}>Testar trajetórias</button>
          <button className="btn primary" onClick={save}>Salvar caso próprio</button>
          <button className="btn" onClick={async () => { const v = validateCase(draft); if (v.caseDef) setMsg(await saveTextFile(`${draft.id}.plantao3d.json`, exportCase(v.caseDef))); else validate(); }}>Exportar</button>
          <ImportButton onDone={async (t0, policy) => { const r = await importCase(storage, t0, policy, new Set(cases.map((c) => c.id))); await refreshCases(); setReport(r.ok ? [`✔ Importado: ${r.imported.join(", ")}`] : r.errors.map((e) => `✘ ${e}`)); }} />
        </div>
        {msg && <span className="muted">{msg}</span>}
        {report.length > 0 && <div className="col" aria-live="polite">{report.map((r, i) => <span key={i}>{r}</span>)}</div>}
      </section>
    </main>
  );
}

function ImportButton({ onDone }: { onDone(text: string, policy: ConflictPolicy): void }) {
  const [policy, setPolicy] = useState<ConflictPolicy>("manter_ambos");
  return (
    <span className="row">
      <select value={policy} onChange={(e) => setPolicy(e.target.value as ConflictPolicy)} aria-label="Política de conflito"><option value="manter_ambos">Manter ambos</option><option value="substituir">Substituir</option><option value="rejeitar">Rejeitar conflito</option></select>
      <button className="btn" onClick={async () => { const t0 = await pickTextFile(); if (t0) onDone(t0, policy); }}>Importar caso</button>
    </span>
  );
}

function TestResultsEditor({ draft, set }: { draft: Draft; set(p: Partial<Draft>): void }) {
  const [testId, setTestId] = useState(TESTS[0]!.id);
  const [text, setText] = useState("");
  return (
    <div className="col">
      <span className="muted">Painéis laboratoriais usam os valores das variáveis no instante da coleta (aba Sinais iniciais e regras). Aqui você define laudos textuais (imagem, ECG, culturas).</span>
      {(draft.testResults ?? []).map((r, i) => (
        <div key={i} className="item row" style={{ justifyContent: "space-between" }}>
          <span><b>{TESTS.find((x) => x.id === r.testId)?.label}</b>: {r.variants.at(-1)?.text}</span>
          <button className="btn small danger" onClick={() => set({ testResults: (draft.testResults ?? []).filter((_, j) => j !== i) })}>Remover</button>
        </div>
      ))}
      <div className="row">
        <select value={testId} onChange={(e) => setTestId(e.target.value)}>{TESTS.filter((x) => !x.id.startsWith("demo")).map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</select>
        <input style={{ flex: 1 }} value={text} onChange={(e) => setText(e.target.value)} placeholder="Laudo educativo" />
        <button className="btn" onClick={() => text && set({ testResults: [...(draft.testResults ?? []).filter((r) => r.testId !== testId), { testId, variants: [{ text }] }] })}>Adicionar</button>
      </div>
    </div>
  );
}

/** Construtor de regras por elementos validados (sem código). */
function RuleBuilder({ draft, set }: { draft: Draft; set(p: Partial<Draft>): void }) {
  const [trig, setTrig] = useState<"acao" | "farmaco" | "tempo" | "variavel">("farmaco");
  const [ref, setRef] = useState("");
  const [num, setNum] = useState("0");
  const [op, setOp] = useState<"lt" | "gt">("lt");
  const [effect, setEffect] = useState<"tendencia" | "mensagem" | "desfecho" | "flag">("tendencia");
  const [ev, setEv] = useState<VarId>("sbp");
  const [target, setTarget] = useState("100");
  const [tau, setTau] = useState("120");
  const [txt, setTxt] = useState("");
  const add = () => {
    const when =
      trig === "acao" ? { actionCompleted: ref || ACTIONS[0]!.id } :
      trig === "farmaco" ? { drugGiven: ref || DRUGS[0]!.id } :
      trig === "tempo" ? { time: "gte" as const, seconds: Number(num) } :
      { path: `vars.${ref || "sbp"}`, op, value: Number(num) };
    const eff =
      effect === "tendencia" ? { type: "trendToTarget" as const, var: ev, target: Number(target), tauSeconds: Math.max(1, Number(tau)), slot: `s${(draft.rules ?? []).length + 1}`, priority: 50 } :
      effect === "mensagem" ? { type: "emitStaffMessage" as const, from: "enfermagem" as const, text: txt || "Mensagem" } :
      effect === "desfecho" ? { type: "setOutcome" as const, outcome: (txt || "melhora") as "melhora", terminal: false } :
      { type: "setFlag" as const, flag: "consciousness" as const, value: txt || "alerta" };
    set({ rules: [...(draft.rules ?? []), { id: `r-user-${(draft.rules ?? []).length + 1}`, description: "Regra criada no construtor", when, repeat: "once", effects: [eff] } as never] });
  };
  return (
    <div className="col">
      {(draft.rules ?? []).map((r, i) => (
        <div key={i} className="item row" style={{ justifyContent: "space-between" }}>
          <code style={{ fontSize: "0.8em", wordBreak: "break-all" }}>{r.id}: QUANDO {JSON.stringify(r.when)} ENTÃO {JSON.stringify(r.effects)}</code>
          <button className="btn small danger" onClick={() => set({ rules: (draft.rules ?? []).filter((_, j) => j !== i) })}>Remover</button>
        </div>
      ))}
      <strong>Nova regra</strong>
      <div className="row">
        <select value={trig} onChange={(e) => { setTrig(e.target.value as typeof trig); setRef(""); }}><option value="farmaco">Quando medicamento for administrado</option><option value="acao">Quando ação for concluída</option><option value="tempo">Quando o tempo ≥</option><option value="variavel">Quando variável</option></select>
        {trig === "farmaco" && <select value={ref} onChange={(e) => setRef(e.target.value)}>{DRUGS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>}
        {trig === "acao" && <select value={ref} onChange={(e) => setRef(e.target.value)}>{ACTIONS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}</select>}
        {trig === "variavel" && <><select value={ref} onChange={(e) => setRef(e.target.value)}>{VAR_IDS.map((v) => <option key={v} value={v}>{VARS[v].label}</option>)}</select><select value={op} onChange={(e) => setOp(e.target.value as "lt")}><option value="lt">&lt;</option><option value="gt">&gt;</option></select></>}
        {(trig === "tempo" || trig === "variavel") && <input type="number" value={num} onChange={(e) => setNum(e.target.value)} aria-label="Valor" />}
      </div>
      <div className="row">
        <select value={effect} onChange={(e) => setEffect(e.target.value as typeof effect)}><option value="tendencia">Então: tendência de variável</option><option value="mensagem">Então: mensagem da enfermagem</option><option value="desfecho">Então: desfecho (melhora/piora/…)</option><option value="flag">Então: nível de consciência</option></select>
        {effect === "tendencia" && <><select value={ev} onChange={(e) => setEv(e.target.value as VarId)}>{VAR_IDS.map((v) => <option key={v} value={v}>{VARS[v].label}</option>)}</select><input type="number" value={target} onChange={(e) => setTarget(e.target.value)} aria-label="Alvo" /><input type="number" value={tau} onChange={(e) => setTau(e.target.value)} aria-label="Constante de tempo (s)" /></>}
        {effect !== "tendencia" && <input value={txt} onChange={(e) => setTxt(e.target.value)} placeholder={effect === "desfecho" ? "melhora | piora | complicacao | …" : effect === "flag" ? "alerta | voz | dor | irresponsivo" : "Texto"} />}
        <button className="btn" onClick={add}>Adicionar regra</button>
      </div>
      <span className="muted" style={{ fontSize: "0.85em" }}>Tendência: x → alvo com constante de tempo τ (interpolação didática, não fisiologia validada).</span>
    </div>
  );
}

function ScoreBuilder({ draft, set }: { draft: Draft; set(p: Partial<Draft>): void }) {
  const [kind, setKind] = useState<"actionDone" | "drugGiven" | "testOrdered" | "disposition">("drugGiven");
  const [ref, setRef] = useState("");
  const [domain, setDomain] = useState("tratamento");
  const [pts, setPts] = useState("10");
  const [within, setWithin] = useState("");
  const [rat, setRat] = useState("");
  const add = () => {
    const w = within ? Number(within) : undefined;
    const evidence =
      kind === "actionDone" ? { kind, anyOf: [ref || ACTIONS[0]!.id], withinSeconds: w } :
      kind === "drugGiven" ? { kind, anyOf: [ref || DRUGS[0]!.id], withinSeconds: w } :
      kind === "testOrdered" ? { kind, anyOf: [ref || TESTS[0]!.id], withinSeconds: w } :
      { kind, accepted: [ref || "observacao"] };
    set({ scoring: [...draft.scoring, { id: `s-user-${draft.scoring.length + 1}`, domain, description: rat || "Critério", evidence, points: Number(pts), severity: "importante", rationale: rat || "Justificativa" } as never] });
  };
  return (
    <div className="col">
      {draft.scoring.map((s, i) => (
        <div key={i} className="item row" style={{ justifyContent: "space-between" }}>
          <span>{s.domain} · {s.points} pts · {s.description}</span>
          <button className="btn small danger" onClick={() => set({ scoring: draft.scoring.filter((_, j) => j !== i) })}>Remover</button>
        </div>
      ))}
      <div className="row">
        <select value={domain} onChange={(e) => setDomain(e.target.value)}>{["historia", "priorizacao", "exames", "tratamento", "reavaliacao", "destino"].map((d) => <option key={d}>{d}</option>)}</select>
        <select value={kind} onChange={(e) => { setKind(e.target.value as typeof kind); setRef(""); }}><option value="drugGiven">Medicamento administrado</option><option value="actionDone">Ação realizada</option><option value="testOrdered">Exame solicitado</option><option value="disposition">Destino</option></select>
        <select value={ref} onChange={(e) => setRef(e.target.value)}>
          {kind === "drugGiven" && DRUGS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          {kind === "actionDone" && ACTIONS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
          {kind === "testOrdered" && TESTS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
          {kind === "disposition" && DESTINATIONS.map((d) => <option key={d} value={d}>{DESTINATION_LABELS[d]}</option>)}
        </select>
        <input type="number" value={pts} onChange={(e) => setPts(e.target.value)} aria-label="Pontos" />
        <input type="number" value={within} onChange={(e) => setWithin(e.target.value)} placeholder="janela (s)" aria-label="Janela em segundos" />
        <input value={rat} onChange={(e) => setRat(e.target.value)} placeholder="Descrição/justificativa" />
        <button className="btn" onClick={add}>Adicionar critério</button>
      </div>
      <label className="field">Notas de desfecho<textarea value={draft.outcomeNotes} onChange={(e) => set({ outcomeNotes: e.target.value })} /></label>
    </div>
  );
}
