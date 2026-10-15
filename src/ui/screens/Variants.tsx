import { useState } from "react";
import { useApp } from "../../app/App";
import { generateVariant } from "../../content/variants";
import { TopBar } from "../common";

export function Variants({ caseId }: { caseId?: string }) {
  const { cases, storage, refreshCases, go } = useApp();
  const [base, setBase] = useState(caseId ?? cases[0]?.id ?? "");
  const [seed, setSeed] = useState(() => String(Math.floor(Math.random() * 1e6)));
  const [log, setLog] = useState<string[]>([]);
  const baseCase = cases.find((c) => c.id === base);
  const gen = async () => {
    if (!baseCase) return;
    const existing = new Set(cases.filter((c) => c.blueprint?.parentCaseId === base).map((c) => c.blueprint ? `${c.blueprint.seed}` : ""));
    const s = Number(seed) | 0;
    if (existing.has(String(s))) return setLog((l) => [`Semente ${s} já usada para ${base}: variante duplicada.`, ...l]);
    const r = generateVariant(baseCase, s);
    if (!r.ok || !r.caseDef) return setLog((l) => [`✘ ${r.reasons.join(" ")}`, ...l]);
    await storage.saveCustomCase(r.caseDef);
    await refreshCases();
    setLog((l) => [`✔ ${r.caseDef!.id} criada (rascunho). ${r.reasons.join(" ")}`, ...l]);
    setSeed(String(Math.floor(Math.random() * 1e6)));
  };
  return (
    <main className="screen" style={{ maxWidth: 760 }}>
      <TopBar title="Gerar variações" />
      <p className="muted" style={{ margin: 0 }}>
        Geração local por regras e semente armazenada, sem cota. Variantes mudam paciente e aparência dentro dos limites declarados pelo caso; o diagnóstico verdadeiro não muda. Alterações que exigiriam revisar doses (troca de população posológica, gestação) são recusadas. Toda variante nasce como rascunho e não é "caso clinicamente validado".
      </p>
      <section className="card col">
        <label className="field">Caso-base<select value={base} onChange={(e) => setBase(e.target.value)}>{cases.filter((c) => !c.blueprint).map((c) => <option key={c.id} value={c.id}>{c.id} — {c.publicTitle}</option>)}</select></label>
        {baseCase && <span className="muted">Limites: idade ±{baseCase.variation.allowAgeShiftYears} anos; peso ±{baseCase.variation.allowWeightPercent}%; troca de sexo {baseCase.variation.allowSexSwap ? "permitida" : "não permitida"}.</span>}
        <label className="field">Semente<input value={seed} onChange={(e) => setSeed(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" /></label>
        <button className="btn primary" onClick={gen} disabled={!baseCase}>Gerar variante</button>
      </section>
      <section className="col">
        {log.map((l, i) => <div key={i} className="item">{l}</div>)}
        {cases.filter((c) => c.blueprint?.parentCaseId === base).map((c) => (
          <div key={c.id} className="item row" style={{ justifyContent: "space-between" }}>
            <span>{c.id} · {c.patient.name}, {c.patient.ageYears} anos, {c.patient.weightKg} kg · semente {c.blueprint?.seed}</span>
            <button className="btn small" onClick={() => go({ name: "briefing", caseId: c.id })}>Abrir</button>
          </div>
        ))}
      </section>
    </main>
  );
}
