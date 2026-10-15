import { useMemo, useState } from "react";
import type { SessionController } from "../../app/session";
import { GenerativeGatewayAdapter, StructuredLocalPatientAdapter, speak } from "../../ai";
import { publicPatientFacts } from "../../engine/views";
import { ACTIONS, DIAGNOSES, DRUGS, TESTS } from "../../content/catalog";
import { diagnosisLabel } from "../../content/catalog/diagnoses";
import { DESTINATION_LABELS, DESTINATIONS, DEVICE_LABELS } from "../../domain/resources";
import type { ManeuverId, Prescription, RegionId } from "../../domain/schema";
import { convert, formatNumberBR, infusionRateMlH, parseDecimalBR, resolveTotalDose, UnitError, unitDimension, volumeForMass, type UnitId } from "../../domain/units";
import { VARS, type VarId } from "../../domain/variables";
import { actionAvailability, checkPrescription, testAvailability } from "../../engine/engine";
import { formatClock } from "../../engine/util";
import { t } from "../../i18n/pt-BR/strings";
import type { Mode, Prefs } from "../../storage";
import { playAuscultation } from "../audio";
import { Modal } from "../common";
import { Ecg12 } from "./Ecg12";
import { REGION_LABELS } from "./Stage";

export interface TabProps {
  ctl: SessionController;
  mode: Mode;
  prefs: Prefs;
  onSpeak(): void;
  toast(text: string, kind?: "ok" | "erro"): void;
}

const patientAdapter = new StructuredLocalPatientAdapter();

const TOPIC_LABELS: Record<string, string> = {
  queixa: "Queixa principal", inicio: "Início", evolucao: "Evolução", localizacao: "Localização", intensidade: "Intensidade", fatores_associados: "Sintomas associados",
  fatores_melhora_piora: "Melhora/piora", sinais_alarme: "Sinais de alarme", antecedentes: "Antecedentes", cirurgias: "Cirurgias/internações", alergias: "Alergias",
  medicacoes: "Medicações em uso", habitos: "Hábitos", familia: "História familiar", social: "Contexto social", gestacao: "Gestação", ginecologico: "Ginecológico",
  vacinacao: "Vacinação", exposicao: "Exposições", alimentacao_eliminacoes: "Alimentação/eliminações", humor_risco: "Humor e risco", outros: "Outros"
};
const SOURCE_LABELS: Record<string, string> = { paciente: "Paciente", sistema: "—", prontuario: "Prontuário" };

function sourceName(ctl: SessionController, s: string): string {
  return SOURCE_LABELS[s] ?? ctl.ctx.caseDef.informants.find((i) => i.id === s)?.name ?? s;
}

// ------------------------------------------------------------------ Paciente (conversa)
export function PatientTab({ ctl, prefs, onSpeak, toast }: TabProps) {
  const [text, setText] = useState("");
  const [chat, setChat] = useState<{ who: "me" | "pt" | "sys"; text: string }[]>([]);
  const v = ctl.view();
  const ask = () => {
    const q = text.trim();
    if (!q) return;
    setText("");
    const r = patientAdapter.respond(q, ctl.ctx.caseDef, ctl.state);
    const lines: { who: "me" | "pt" | "sys"; text: string }[] = [{ who: "me", text: q }];
    if (r.kind === "resposta" && r.itemId) {
      const res = ctl.send("askHistory", { itemId: r.itemId });
      const h = ctl.state.knowledge.history.at(-1);
      if (res.accepted && h) for (const a of h.answers) lines.push({ who: a.source === "paciente" ? "pt" : "sys", text: a.source === "paciente" ? a.text : `${sourceName(ctl, a.source)}: ${a.text}` });
      else lines.push({ who: "pt", text: r.text });
      onSpeak();
      if (prefs.voiceVolume > 0 && h?.answers[0]) speak(h.answers[0].text, prefs.voiceVolume);
    } else if (r.kind === "ordem_rascunho") {
      lines.push({ who: "sys", text: r.text });
      toast("Conversa não executa ordens: use Tratamento ou Procedimentos.");
    } else if (r.kind === "nao_entendeu" && prefs.aiEnabled && new GenerativeGatewayAdapter(prefs.aiGatewayUrl).enabled) {
      // opcional: gateway próprio recebe só fatos que o paciente pode saber; o texto não altera o estado clínico
      setChat((c) => [...c, ...lines, { who: "sys", text: "Consultando gateway de IA (opcional)…" }]);
      void new GenerativeGatewayAdapter(prefs.aiGatewayUrl).patient(q, publicPatientFacts(ctl.ctx), ctl.state.communication).then((g) =>
        setChat((c) => [...c, "text" in g ? { who: "pt", text: `${g.text} (resposta gerada por IA; não registrada como dado do caso)` } : { who: "sys", text: `IA indisponível: ${g.error} Use as perguntas estruturadas.` }])
      );
      return;
    } else lines.push({ who: r.kind === "incapaz" ? "sys" : "pt", text: r.text });
    setChat((c) => [...c, ...lines]);
  };
  return (
    <div className="col">
      <p className="muted" style={{ margin: 0, fontSize: "0.85em" }}>
        Conversa por interpretação LOCAL de intenções (não é IA generativa). Perguntas reconhecidas viram itens da história; o restante recebe "não entendi".
      </p>
      <div className="chat" aria-live="polite">
        {chat.length === 0 && <span className="bubble sys">Comunicação atual: {v.communication}. Exemplos: "O que está sentindo?", "Tem alergia?", "Usa algum remédio?"</span>}
        {chat.map((m, i) => (
          <span key={i} className={`bubble ${m.who}`}>{m.text}</span>
        ))}
      </div>
      <form className="row" onSubmit={(e) => { e.preventDefault(); ask(); }}>
        <input style={{ flex: 1 }} value={text} onChange={(e) => setText(e.target.value)} placeholder="Pergunte ao paciente ou acompanhante…" aria-label="Pergunta ao paciente" disabled={ctl.ended} />
        <button className="btn primary" type="submit" disabled={ctl.ended}>Perguntar</button>
      </form>
      <h3 style={{ margin: "8px 0 0", fontSize: "1em" }}>Mensagens da equipe</h3>
      <div className="list">
        {v.knowledge.staffMessages.length === 0 && <span className="muted">Sem mensagens.</span>}
        {[...v.knowledge.staffMessages].reverse().map((m, i) => (
          <div key={i} className="item"><span className="tag">{formatClock(m.tick)}</span> <b>{m.from}</b>: {m.text}</div>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ História estruturada
export function HistoryTab({ ctl }: TabProps) {
  const v = ctl.view();
  const asked = new Map(v.knowledge.history.map((h) => [h.itemId, h]));
  const groups = new Map<string, typeof ctl.ctx.caseDef.history>();
  for (const h of ctl.ctx.caseDef.history) groups.set(h.topic, [...(groups.get(h.topic) ?? []), h]);
  return (
    <div className="col">
      <p className="muted" style={{ margin: 0, fontSize: "0.85em" }}>As respostas dependem do que o paciente sabe e consegue comunicar; acompanhantes respondem quando previsto.</p>
      {[...groups.entries()].map(([topic, items]) => (
        <section key={topic} className="col">
          <strong style={{ fontSize: "0.9em" }}>{TOPIC_LABELS[topic] ?? topic}</strong>
          {items.map((h) => {
            const a = asked.get(h.id);
            return (
              <div key={h.id} className="item">
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span>{h.question}</span>
                  <button className="btn small" onClick={() => ctl.send("askHistory", { itemId: h.id })} disabled={ctl.ended}>{a ? "Perguntar de novo" : "Perguntar"}</button>
                </div>
                {ctl.state.knowledge.history.filter((x) => x.itemId === h.id).map((x, i) => (
                  <div key={i} style={{ marginTop: 4 }}>
                    {x.answers.map((ans, j) => (
                      <div key={j}><span className="tag">{formatClock(x.tick)}</span> <b>{sourceName(ctl, ans.source)}:</b> {ans.text}</div>
                    ))}
                  </div>
                ))}
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}

// ------------------------------------------------------------------ Exame físico
const MANEUVERS: ManeuverId[] = ["inspecao", "palpacao", "percussao", "ausculta", "especial"];

export function ExamPanel({ ctl, region, onDone, prefs }: { ctl: SessionController; region: string; onDone?(): void; prefs: Prefs }) {
  return (
    <div className="col">
      <strong>{REGION_LABELS[region] ?? region}</strong>
      <div className="row">
        {MANEUVERS.map((m) => (
          <button key={m} className="btn small" disabled={ctl.ended} onClick={() => { ctl.send("examine", { region, maneuver: m }); onDone?.(); }}>
            {t(`exam.${m}` as "exam.inspecao")}
          </button>
        ))}
      </div>
      <span className="muted" style={{ fontSize: "0.8em" }}>Cada manobra leva alguns segundos simulados; o resultado aparece em Exame físico. {prefs.reducedMotion ? "" : ""}</span>
    </div>
  );
}

export function ExamTab({ ctl, prefs }: TabProps) {
  const [region, setRegion] = useState<string>("geral");
  const v = ctl.view();
  const pending = v.orders.filter((o) => o.kind === "exam" && o.status === "em_execucao");
  return (
    <div className="col">
      <label className="field">
        Região (lado = lado do PACIENTE)
        <select value={region} onChange={(e) => setRegion(e.target.value)}>
          {Object.entries(REGION_LABELS).map(([id, l]) => <option key={id} value={id}>{l}</option>)}
        </select>
      </label>
      <ExamPanel ctl={ctl} region={region} prefs={prefs} />
      {pending.length > 0 && <div className="notice">Examinando: {pending.map((p) => p.label.replace("Exame: ", "")).join(", ")}…</div>}
      <div className="list">
        {[...v.knowledge.exams].reverse().map((e, i) => (
          <div key={i} className="item">
            <span className="tag">{formatClock(e.tick)}</span> <b>{REGION_LABELS[e.region]}</b> — {t(`exam.${e.maneuver}` as "exam.inspecao")}
            {e.texts.map((x, j) => <div key={j}>{x}</div>)}
            {e.sound && (
              <button className="btn small" onClick={() => playAuscultation(e.sound!, prefs.effectsVolume, ctl.state.vars.hr, ctl.state.vars.rr)}>
                🔊 Ouvir (som sintetizado ilustrativo)
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ Exames complementares
function flagOf(v: VarId, value: number): string {
  const ref = VARS[v].reference;
  if (!ref) return "";
  const m = ref.match(/([\d.,]+)\s*[–-]\s*([\d.,]+)/);
  if (!m) return "";
  const lo = Number(m[1]!.replace(/\./g, "").replace(",", "."));
  const hi = Number(m[2]!.replace(/\./g, "").replace(",", "."));
  if (Number.isFinite(lo) && value < lo) return "↓";
  if (Number.isFinite(hi) && value > hi) return "↑";
  return "";
}

export function TestsTab({ ctl, toast }: TabProps) {
  const v = ctl.view();
  const [cat, setCat] = useState("todos");
  const cats = [...new Set(TESTS.filter((x) => !x.id.startsWith("demo")).map((x) => x.category))];
  const list = TESTS.filter((x) => !x.id.startsWith("demo") && (cat === "todos" || x.category === cat));
  const pending = v.orders.filter((o) => o.kind === "test" && (o.status === "pendente" || o.status === "coletado"));
  return (
    <div className="col">
      {pending.length > 0 && (
        <section className="col">
          <strong>Em andamento</strong>
          {pending.map((o) => (
            <div key={o.id} className="item row" style={{ justifyContent: "space-between" }}>
              <span>{o.label} <span className={`status ${o.status}`}>{o.status === "pendente" ? "aguardando coleta/realização" : "em processamento"}</span></span>
              <button className="btn small danger" onClick={() => ctl.send("cancelOrder", { orderId: o.id })}>Cancelar</button>
            </div>
          ))}
          <div className="row">
            <button className="btn small" onClick={() => ctl.skip(60)}>Aguardar 1 min</button>
            <button className="btn small" onClick={() => ctl.skip(300)}>Aguardar 5 min</button>
            <button className="btn small" onClick={() => ctl.skip(900)}>Aguardar 15 min</button>
          </div>
          <span className="muted" style={{ fontSize: "0.8em" }}>Aguardar avança o tempo simulado: o paciente continua evoluindo.</span>
        </section>
      )}
      {v.knowledge.results.length > 0 && (
        <section className="col">
          <strong>Resultados</strong>
          {[...v.knowledge.results].reverse().map((r) => (
            <div key={r.orderId} className="item">
              <div><b>{r.label}</b> <span className="muted">coleta {formatClock(r.collectedTick)} · disponível {formatClock(r.availableTick)}</span></div>
              {r.items.length > 0 && (
                <table className="simple"><tbody>
                  {r.items.map((it) => (
                    <tr key={it.var}><td>{VARS[it.var].label}</td><td><b>{formatNumberBR(it.value, VARS[it.var].decimals)} {flagOf(it.var, it.value)}</b> {VARS[it.var].displayUnit}</td><td className="muted">{VARS[it.var].reference ?? ""}</td></tr>
                  ))}
                </tbody></table>
              )}
              {r.ecg && <Ecg12 ecg={r.ecg} />}
              {r.text && <p style={{ margin: "4px 0 0" }}>{r.text}</p>}
              {r.imageCaption && <p className="muted">{r.imageCaption}</p>}
            </div>
          ))}
        </section>
      )}
      <div className="row">
        <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Categoria de exame">
          <option value="todos">Todas as categorias</option>
          {cats.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      {list.map((x) => {
        const av = testAvailability(ctl.ctx, x.id);
        return (
          <div key={x.id} className={`item ${av.available ? "" : "unavailable"}`}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span><b>{x.label}</b><br /><span className="muted" style={{ fontSize: "0.8em" }}>{x.description} Coleta ~{Math.round(x.collectSeconds / 60)} min; resultado ~{Math.round(x.turnaroundSeconds / 60)} min (parâmetro simulado).</span></span>
              <button className="btn small" disabled={!av.available || ctl.ended} onClick={() => { const r = ctl.send("orderTest", { testId: x.id }); toast(r.accepted ? `Solicitado: ${x.label}` : r.message ?? "Não foi possível", r.accepted ? "ok" : "erro"); }}>
                Solicitar
              </button>
            </div>
            {!av.available && <span className="muted" style={{ fontSize: "0.8em" }}>Indisponível: {av.reason}</span>}
          </div>
        );
      })}
    </div>
  );
}

// ------------------------------------------------------------------ Tratamento / prescrição
const DOSE_UNITS: UnitId[] = ["mg", "mcg", "g", "UI", "mL", "mEq", "mg/kg", "mcg/kg", "g/kg", "UI/kg", "mL/kg"];
const RATE_UNITS: UnitId[] = ["mcg/kg/min", "mcg/min", "mg/h", "mg/min", "mg/kg/h", "UI/h", "UI/kg/h", "mL/h"];

export function TreatmentTab({ ctl, mode, prefs, toast }: TabProps) {
  const [q, setQ] = useState("");
  const [drugId, setDrugId] = useState("");
  const drug = DRUGS.find((d) => d.id === drugId);
  const [presId, setPresId] = useState("");
  const [route, setRoute] = useState("");
  const [rxMode, setRxMode] = useState<Prescription["mode"]>("bolus");
  const [dose, setDose] = useState("");
  const [unit, setUnit] = useState<UnitId>("mg");
  const [rate, setRate] = useState("");
  const [rateUnit, setRateUnit] = useState<UnitId>("mcg/kg/min");
  const [dur, setDur] = useState("");
  const [weight, setWeight] = useState(String(ctl.ctx.caseDef.patient.weightKg).replace(".", ","));
  const [diluent, setDiluent] = useState<Prescription["diluent"]>("nenhum");
  const [finalVol, setFinalVol] = useState("");
  const [check, setCheck] = useState<{ errors: string[]; warnings: string[]; rx?: Prescription; calc: string[] } | null>(null);
  const [titr, setTitr] = useState<{ id: string; value: string; unit: UnitId } | null>(null);
  const v = ctl.view();

  const drugs = useMemo(() => DRUGS.filter((d) => d.name.toLowerCase().includes(q.toLowerCase()) || d.drugClass.toLowerCase().includes(q.toLowerCase())), [q]);
  const choose = (id: string) => {
    const d = DRUGS.find((x) => x.id === id)!;
    setDrugId(id);
    setPresId(d.presentations[0]!.id);
    setRoute(d.routes[0]!);
    setCheck(null);
  };

  const build = (): { rx?: Prescription; errors: string[]; calc: string[] } => {
    const errors: string[] = [];
    const calc: string[] = [];
    if (!drug) return { errors: ["Escolha um medicamento."], calc };
    let doseV = 0;
    let w: number | undefined;
    try {
      w = parseDecimalBR(weight);
    } catch {
      if (unitDimension(unit).endsWith("PerWeight") || unitDimension(rateUnit).includes("PerWeight")) errors.push("Peso inválido.");
    }
    try {
      if (rxMode !== "infusao") doseV = parseDecimalBR(dose);
    } catch (e) {
      errors.push(`Dose: ${(e as Error).message}`);
    }
    let rateQ: Prescription["rate"];
    if (rxMode === "infusao") {
      try {
        rateQ = { value: parseDecimalBR(rate), unit: rateUnit };
      } catch (e) {
        errors.push(`Velocidade: ${(e as Error).message}`);
      }
    }
    let durV: number | undefined;
    if (rxMode === "infusao_volume") {
      try {
        durV = parseDecimalBR(dur);
      } catch (e) {
        errors.push(`Duração: ${(e as Error).message}`);
      }
    }
    if (errors.length) return { errors, calc };
    const pres = drug.presentations.find((p) => p.id === presId)!;
    const rx: Prescription = {
      drugId: drug.id,
      presentationId: presId,
      dose: rxMode === "infusao" ? { value: 1, unit: "mg" } : { value: doseV, unit },
      weightKg: w,
      route: route as Prescription["route"],
      mode: rxMode,
      rate: rateQ,
      durationMinutes: durV,
      diluent,
      finalVolumeMl: finalVol ? Number(finalVol.replace(",", ".")) : undefined
    };
    try {
      if (rxMode !== "infusao") {
        const total = resolveTotalDose({ dose: rx.dose, weightKg: w });
        calc.push(`Dose total: ${formatNumberBR(total.value, 3)} ${total.unit}`);
        if (unitDimension(total.unit) === "mass" && (pres.concentration.unit === "mg/mL" || pres.concentration.unit === "mcg/mL")) {
          const vol = volumeForMass(total, pres.concentration);
          calc.push(`Volume da apresentação (${pres.label}): ${formatNumberBR(vol.value, 2)} mL`);
          if (pres.volumeMl) calc.push(`≈ ${formatNumberBR(vol.value / pres.volumeMl, 2)} ampola(s)/frasco(s)`);
        }
        if (rxMode === "infusao_volume" && durV) {
          const base = unitDimension(total.unit) === "volume" ? convert(total, "mL").value : null;
          if (base !== null) calc.push(`Velocidade: ${formatNumberBR((base / durV) * 60, 1)} mL/h`);
        }
      } else if (rateQ && (pres.concentration.unit === "mg/mL" || pres.concentration.unit === "mcg/mL")) {
        const r = infusionRateMlH({ rate: rateQ, concentration: pres.concentration, weightKg: w });
        calc.push(`Bomba: ${formatNumberBR(r.value, 2)} mL/h com ${pres.label}`);
      }
    } catch (e) {
      errors.push(e instanceof UnitError ? e.message : "Erro de unidade.");
    }
    return { rx, errors, calc };
  };

  const doCheck = () => {
    const b = build();
    if (!b.rx || b.errors.length) return setCheck({ errors: b.errors, warnings: [], calc: b.calc });
    const c = checkPrescription(ctl.state, ctl.ctx, b.rx);
    setCheck({ errors: c.errors, warnings: prefs.doseAlerts && mode !== "prova" ? c.warnings : [], rx: b.rx, calc: b.calc });
  };
  const confirm = () => {
    if (!check?.rx) return;
    const r = ctl.send("prescribe", { prescription: check.rx });
    toast(r.accepted ? "Ordem confirmada e encaminhada à enfermagem." : r.message ?? "Ordem recusada.", r.accepted ? "ok" : "erro");
    if (r.accepted) setCheck(null);
  };

  return (
    <div className="col">
      {v.treatments.some((x) => x.active) && (
        <section className="col">
          <strong>Infusões ativas</strong>
          {v.treatments.filter((x) => x.active).map((tr) => (
            <div key={tr.id} className="item row" style={{ justifyContent: "space-between" }}>
              <span><b>{DRUGS.find((d) => d.id === tr.drugId)?.name}</b> {tr.route} — {tr.rate.replace(".", ",")} · infundido {tr.deliveredText.replace(".", ",")}</span>
              <span className="row">
                <button className="btn small" onClick={() => setTitr({ id: tr.id, value: "", unit: "mcg/kg/min" })}>Titular</button>
                <button className="btn small danger" onClick={() => ctl.send("stopTreatment", { treatmentId: tr.id })}>Suspender</button>
              </span>
            </div>
          ))}
        </section>
      )}
      {v.orders.filter((o) => o.kind === "drug" && o.status === "em_execucao").map((o) => (
        <div key={o.id} className="item"><span className="status em_execucao">administrando</span> {o.label}</div>
      ))}
      <input type="search" placeholder="Buscar medicamento (princípio ativo ou classe)" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar medicamento" />
      {!drug && (
        <div className="list" style={{ maxHeight: 260, overflowY: "auto" }}>
          {drugs.map((d) => (
            <button key={d.id} className="btn" onClick={() => choose(d.id)}>{d.name} <span className="muted">· {d.drugClass}</span></button>
          ))}
        </div>
      )}
      {drug && (
        <section className="card col">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <strong>{drug.name}</strong>
            <button className="btn small" onClick={() => setDrugId("")}>Trocar</button>
          </div>
          <span className="muted" style={{ fontSize: "0.8em" }}>Indicações: {drug.indications.join("; ")}. Contraindicações: {drug.contraindications.join("; ") || "—"}. Início: {drug.onset}. Validação do catálogo: {drug.validation}.</span>
          <div className="row">
            <label className="field">{t("rx.presentation")}<select value={presId} onChange={(e) => setPresId(e.target.value)}>{drug.presentations.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}</select></label>
            <label className="field">{t("rx.route")}<select value={route} onChange={(e) => setRoute(e.target.value)}>{drug.routes.map((r) => <option key={r}>{r}</option>)}</select></label>
            <label className="field">{t("rx.mode")}<select value={rxMode} onChange={(e) => setRxMode(e.target.value as Prescription["mode"])}><option value="bolus">{t("rx.bolus")}</option><option value="infusao">{t("rx.infusao")}</option><option value="infusao_volume">{t("rx.infusao_volume")}</option></select></label>
          </div>
          {rxMode !== "infusao" && (
            <div className="row">
              <label className="field">{t("rx.dose")}<input inputMode="decimal" value={dose} onChange={(e) => setDose(e.target.value)} placeholder="ex.: 0,5" /></label>
              <label className="field">{t("rx.unit")}<select value={unit} onChange={(e) => setUnit(e.target.value as UnitId)}>{DOSE_UNITS.map((u) => <option key={u} value={u}>{u.replace("mcg", "microgramas")}</option>)}</select></label>
            </div>
          )}
          {rxMode === "infusao" && (
            <div className="row">
              <label className="field">{t("rx.rate")}<input inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} /></label>
              <label className="field">{t("rx.unit")}<select value={rateUnit} onChange={(e) => setRateUnit(e.target.value as UnitId)}>{RATE_UNITS.map((u) => <option key={u} value={u}>{u.replace("mcg", "microgramas")}</option>)}</select></label>
            </div>
          )}
          <div className="row">
            {rxMode === "infusao_volume" && <label className="field">{t("rx.duration")}<input inputMode="decimal" value={dur} onChange={(e) => setDur(e.target.value)} /></label>}
            <label className="field">{t("rx.weight")}<input inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} /></label>
            <label className="field">{t("rx.diluent")}<select value={diluent} onChange={(e) => setDiluent(e.target.value as Prescription["diluent"])}><option value="nenhum">Nenhum</option><option>SF0,9%</option><option>SG5%</option><option>AD</option></select></label>
            <label className="field">{t("rx.finalVolume")}<input inputMode="decimal" value={finalVol} onChange={(e) => setFinalVol(e.target.value)} /></label>
          </div>
          <button className="btn" onClick={doCheck} disabled={ctl.ended}>{t("rx.check")}</button>
          {check && (
            <div className="col">
              {check.calc.map((c) => <span key={c} className="muted">🧮 {c}</span>)}
              {check.errors.map((e) => <div key={e} className="notice danger">{e}</div>)}
              {check.warnings.map((w) => <div key={w} className="notice">⚠ {w}</div>)}
              {check.errors.length === 0 && check.rx && <button className="btn primary" onClick={confirm}>{t("rx.confirm")}</button>}
            </div>
          )}
        </section>
      )}
      {v.administrations.length > 0 && (
        <section className="col">
          <strong>Administrados (dose cumulativa)</strong>
          {Object.entries(v.administrations.reduce<Record<string, { amount: number; unit: string; n: number }>>((acc, a) => {
            const k = `${a.drugId}|${a.route}`;
            acc[k] = { amount: (acc[k]?.amount ?? 0) + a.amount, unit: a.unitBase, n: (acc[k]?.n ?? 0) + 1 };
            return acc;
          }, {})).map(([k, x]) => {
            const [id, r] = k.split("|");
            return <div key={k} className="item">{DRUGS.find((d) => d.id === id)?.name} {r}: {formatNumberBR(x.amount, 3)} {x.unit === "mmol" ? "mmol/mEq" : x.unit} em {x.n} dose(s)</div>;
          })}
        </section>
      )}
      {titr && (
        <Modal title="Titular infusão" onClose={() => setTitr(null)}>
          <div className="row">
            <input inputMode="decimal" value={titr.value} onChange={(e) => setTitr({ ...titr, value: e.target.value })} aria-label="Nova velocidade" />
            <select value={titr.unit} onChange={(e) => setTitr({ ...titr, unit: e.target.value as UnitId })}>{RATE_UNITS.map((u) => <option key={u} value={u}>{u.replace("mcg", "microgramas")}</option>)}</select>
          </div>
          <button className="btn primary" onClick={() => {
            try {
              const r = ctl.send("titrateInfusion", { treatmentId: titr.id, rate: { value: parseDecimalBR(titr.value), unit: titr.unit } });
              toast(r.accepted ? "Infusão titulada." : r.message ?? "Erro", r.accepted ? "ok" : "erro");
              if (r.accepted) setTitr(null);
            } catch (e) {
              toast((e as Error).message, "erro");
            }
          }}>Confirmar</button>
        </Modal>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ Procedimentos
const CAT_LABEL: Record<string, string> = { monitorizacao: "Monitorização", medicao: "Medidas", via_aerea: "Via aérea", ventilacao: "Oxigenação e ventilação", circulacao: "Circulação e acessos", procedimento: "Procedimentos", reanimacao: "Reanimação", cuidado: "Cuidados", comunicacao: "Comunicação e segurança", rede: "Rede de atenção / regulação" };

export function ProceduresTab({ ctl, toast }: TabProps) {
  const [confirmA, setConfirmA] = useState<{ id: string; params: Record<string, unknown> } | null>(null);
  const [params, setParams] = useState<Record<string, Record<string, string>>>({});
  const v = ctl.view();
  const running = v.orders.filter((o) => o.kind === "action" && o.status === "em_execucao");
  const cats = [...new Set(ACTIONS.filter((a) => !a.id.startsWith("demo")).map((a) => a.category))];
  const highlighted = new Set(ctl.ctx.caseDef.highlightedActions);
  const run = (id: string, prm: Record<string, unknown>) => {
    const r = ctl.send("performAction", { actionId: id, params: prm });
    toast(r.accepted ? "Em execução." : r.message ?? "Não realizado.", r.accepted ? "ok" : "erro");
  };
  const start = (id: string) => {
    const a = ACTIONS.find((x) => x.id === id)!;
    const prm: Record<string, unknown> = {};
    for (const p of a.params) {
      const raw = params[id]?.[p.id];
      if (raw !== undefined && raw !== "") {
        try {
          prm[p.id] = p.kind === "number" ? parseDecimalBR(raw) : raw;
        } catch (e) {
          return toast(`${p.label}: ${(e as Error).message}`, "erro");
        }
      }
    }
    if (a.confirm) setConfirmA({ id, params: prm });
    else run(id, prm);
  };
  return (
    <div className="col">
      <div className="item">Dispositivos instalados: {v.devices.length ? v.devices.map((d) => DEVICE_LABELS[d]).join(", ") : "nenhum"}</div>
      {running.map((o) => {
        const a = ACTIONS.find((x) => x.id === o.refId);
        return (
          <div key={o.id} className="item row" style={{ justifyContent: "space-between" }}>
            <span><span className="status em_execucao">em execução</span> {o.label}</span>
            {a?.cancellable && <button className="btn small danger" onClick={() => ctl.send("cancelOrder", { orderId: o.id })}>Interromper</button>}
          </div>
        );
      })}
      {cats.map((cat) => (
        <section key={cat} className="col">
          <strong>{CAT_LABEL[cat]}</strong>
          {ACTIONS.filter((a) => a.category === cat).sort((a, b) => Number(highlighted.has(b.id)) - Number(highlighted.has(a.id))).map((a) => {
            const av = actionAvailability(ctl.state, ctl.ctx, a.id);
            const on = a.toggle && v.activeToggles.includes(a.id);
            const done = ctl.state.actionLog.some((x) => x.actionId === a.id && x.event === "complete");
            return (
              <div key={a.id} className={`item ${av.available || on ? "" : "unavailable"}`}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span>
                    <b>{a.label}</b> {done && <span className="status concluida">realizado</span>} {on && <span className="status em_execucao">em andamento</span>}
                    <br />
                    <span className="muted" style={{ fontSize: "0.8em" }}>{a.description} {a.trainingNote ? `⚠ ${a.trainingNote}` : ""}</span>
                  </span>
                  <button className={`btn small ${on ? "danger" : ""}`} disabled={(!av.available && !on) || ctl.ended} onClick={() => start(a.id)}>
                    {a.toggle ? (on ? "Parar" : "Iniciar") : "Realizar"}
                  </button>
                </div>
                {a.params.length > 0 && av.available && (
                  <div className="row">
                    {a.params.map((p) => (
                      <label key={p.id} className="field">
                        {p.label} {p.unit ? `(${p.unit})` : ""}
                        <input inputMode="decimal" placeholder={String(p.default ?? "")} value={params[a.id]?.[p.id] ?? ""} onChange={(e) => setParams({ ...params, [a.id]: { ...(params[a.id] ?? {}), [p.id]: e.target.value } })} />
                      </label>
                    ))}
                  </div>
                )}
                {!av.available && !on && <span className="muted" style={{ fontSize: "0.8em" }}>Indisponível: {av.reason}</span>}
              </div>
            );
          })}
        </section>
      ))}
      {confirmA && (
        <Modal title="Confirmar procedimento" onClose={() => setConfirmA(null)}>
          <p>{ACTIONS.find((a) => a.id === confirmA.id)?.label}</p>
          <p className="muted">{ACTIONS.find((a) => a.id === confirmA.id)?.description}</p>
          <div className="row">
            <button className="btn primary" onClick={() => { run(confirmA.id, confirmA.params); setConfirmA(null); }}>{t("common.confirm")}</button>
            <button className="btn" onClick={() => setConfirmA(null)}>{t("common.cancel")}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ Diagnósticos
export function DiagnosisTab({ ctl }: TabProps) {
  const [q, setQ] = useState("");
  const v = ctl.view();
  const list = DIAGNOSES.filter((d) => q.length >= 2 && (d.label.toLowerCase().includes(q.toLowerCase()) || d.synonyms?.some((s) => s.toLowerCase().includes(q.toLowerCase())))).slice(0, 15);
  const setDiff = (ids: string[]) => ctl.send("setDifferential", { diagnoses: ids });
  return (
    <div className="col">
      <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar diagnóstico (mín. 2 letras)" aria-label="Buscar diagnóstico" />
      {list.map((d) => (
        <div key={d.id} className="item row" style={{ justifyContent: "space-between" }}>
          <span>{d.label} <span className="muted">· {d.group}</span></span>
          <span className="row">
            <button className="btn small" disabled={v.differential.includes(d.id) || ctl.ended} onClick={() => setDiff([...v.differential, d.id])}>+ Diferencial</button>
            <button className="btn small" disabled={ctl.ended} onClick={() => ctl.send("setFinalDiagnosis", { diagnosisId: d.id })}>Definir como final</button>
          </span>
        </div>
      ))}
      <strong>{t("dx.differential")}</strong>
      {v.differential.length === 0 && <span className="muted">Nenhum diferencial registrado.</span>}
      {v.differential.map((id) => (
        <div key={id} className="item row" style={{ justifyContent: "space-between" }}>
          <span>{diagnosisLabel(id)}</span>
          <button className="btn small" onClick={() => setDiff(v.differential.filter((x) => x !== id))} disabled={ctl.ended}>Remover</button>
        </div>
      ))}
      <strong>{t("dx.final")}</strong>
      <div className="item">{v.finalDiagnosis ? diagnosisLabel(v.finalDiagnosis) : "Não definido"}</div>
    </div>
  );
}

// ------------------------------------------------------------------ Destino
export function DispositionTab({ ctl, onEnd }: TabProps & { onEnd(): void }) {
  const v = ctl.view();
  const prof = ctl.ctx.profile;
  const soap = buildSoap(ctl);
  const [copied, setCopied] = useState(false);
  return (
    <div className="col">
      <strong>{t("dest.choose")}</strong>
      <span className="muted" style={{ fontSize: "0.85em" }}>{prof.label}. {prof.notes}</span>
      {DESTINATIONS.map((d) => {
        const ok = prof.destinations.includes(d);
        return (
          <button key={d} className={`btn ${v.disposition === d ? "primary" : ""}`} disabled={!ok || ctl.ended} aria-pressed={v.disposition === d} onClick={() => ctl.send("setDisposition", { destination: d })}>
            {DESTINATION_LABELS[d]} {!ok && <span className="muted">— indisponível neste cenário</span>}
          </button>
        );
      })}
      <span className="muted" style={{ fontSize: "0.85em" }}>
        Estabilizar, acionar a regulação (SAMU 192), passar o caso e transportar são etapas distintas: use também as ações da categoria "Rede de atenção" em Procedimentos.
      </span>
      <strong>Nota educativa (SOAP)</strong>
      <textarea readOnly value={soap} aria-label="Nota SOAP" />
      <button className="btn small" onClick={() => navigator.clipboard?.writeText(soap).then(() => setCopied(true), () => setCopied(false))}>{copied ? "Copiado" : "Copiar resumo"}</button>
      <button className="btn danger big" onClick={onEnd} disabled={ctl.ended}>{t("enc.end")}</button>
    </div>
  );
}

export function buildSoap(ctl: SessionController): string {
  const v = ctl.view();
  const c = ctl.ctx.caseDef;
  const s = v.knowledge.history.map((h) => `- ${h.question} ${h.answers.map((a) => a.text).join(" ")}`).join("\n");
  const o = [
    ...v.monitor.readings.filter((r) => r.value != null).map((r) => `${VARS[r.var].short}: ${r.value} ${VARS[r.var].displayUnit}`),
    ...v.knowledge.exams.map((e) => `${REGION_LABELS[e.region]} (${e.maneuver}): ${e.texts.join(" ")}`),
    ...v.knowledge.results.map((r) => `${r.label}: ${r.items.map((i) => `${VARS[i.var].short} ${formatNumberBR(i.value, VARS[i.var].decimals)}`).join(", ")}${r.text ? ` ${r.text}` : ""}`)
  ].join("\n");
  const a = [v.finalDiagnosis ? `Hipótese principal: ${diagnosisLabel(v.finalDiagnosis)}` : "Hipótese principal: não definida", v.differential.length ? `Diferenciais: ${v.differential.map(diagnosisLabel).join(", ")}` : ""].filter(Boolean).join("\n");
  const p = [
    ...v.administrations.map((x) => `${DRUGS.find((d) => d.id === x.drugId)?.name} ${formatNumberBR(x.amount, 3)} ${x.unitBase} ${x.route} às ${formatClock(x.tick)}`),
    ...v.treatments.map((x) => `${DRUGS.find((d) => d.id === x.drugId)?.name} ${x.route} ${x.rate} (${x.active ? "em curso" : "encerrada"})`),
    ...ctl.state.actionLog.filter((x) => x.event === "complete").map((x) => `${ACTIONS.find((a) => a.id === x.actionId)?.label} às ${formatClock(x.tick)}`),
    v.disposition ? `Destino: ${DESTINATION_LABELS[v.disposition as keyof typeof DESTINATION_LABELS]}` : "Destino: não definido"
  ].join("\n");
  return `Paciente fictício: ${c.patient.name}, ${c.patient.ageYears} anos. Documento EDUCATIVO, sem validade assistencial.\n\nS:\n${s || "-"}\n\nO:\n${o || "-"}\n\nA:\n${a}\n\nP:\n${p}`;
}

// ------------------------------------------------------------------ Registro
export function LogTab({ ctl }: TabProps) {
  const v = ctl.view();
  const items: { tick: number; text: string }[] = [
    ...v.knowledge.observations.map((o) => ({ tick: o.tick, text: `Observação: ${o.text}` })),
    ...v.knowledge.measurements.map((m) => ({ tick: m.tick, text: `${VARS[m.var].label}: ${m.value == null ? "não mensurável" : `${formatNumberBR(m.value, VARS[m.var].decimals)} ${VARS[m.var].displayUnit}`}${m.quality === "ruim" ? " (sinal ruim)" : ""} — ${m.method}` })),
    ...v.knowledge.staffMessages.map((m) => ({ tick: m.tick, text: `${m.from}: ${m.text}` })),
    ...v.orders.map((o) => ({ tick: o.createdTick, text: `Ordem: ${o.label} (${o.status})${o.warnings.length ? ` ⚠ ${o.warnings.join(" ")}` : ""}` }))
  ].sort((a, b) => b.tick - a.tick);
  return (
    <div className="list">
      {items.map((x, i) => (
        <div key={i} className="item"><span className="tag">{formatClock(x.tick)}</span> {x.text}</div>
      ))}
      {items.length === 0 && <span className="muted">Nada registrado ainda.</span>}
    </div>
  );
}
