import { useState } from "react";
import { useApp } from "../../app/App";

export function Onboarding() {
  const { prefs, setPrefs, setProfile, profile, go, cases } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile?.name ?? "");
  const tutorialCase = cases.find((c) => c.id === "C004") ?? cases[0];

  const finish = (startTutorial: boolean) => {
    if (name.trim()) setProfile({ name: name.trim().slice(0, 40), createdAt: profile?.createdAt ?? new Date().toISOString() });
    setPrefs({ tutorialDone: true });
    if (startTutorial && tutorialCase) go({ name: "briefing", caseId: tutorialCase.id, mode: "guiado", tutorial: true });
    else go({ name: "home" });
  };

  return (
    <main className="screen" style={{ maxWidth: 640 }}>
      <h1>Bem-vindo ao Plantão 3D</h1>
      {step === 0 && (
        <section className="card col">
          <p>Simulador de atendimento clínico com paciente 3D, em contexto brasileiro (UBS, UPA, SAMU 192 e hospital).</p>
          <ul>
            <li>Funciona offline, sem conta, sem assinatura e sem limite de casos.</li>
            <li>Você colhe história, examina, monitoriza, pede exames, prescreve com doses, faz procedimentos e define o destino.</li>
            <li>O paciente evolui no tempo conforme suas decisões; ao final há um debriefing rastreável.</li>
          </ul>
          <p className="notice">
            Uso educacional. Os casos são fictícios e o conteúdo clínico está marcado como <b>revisão clínica pendente</b> até revisão qualificada. Não use como protocolo assistencial.
          </p>
          <button className="btn primary" onClick={() => setStep(1)}>Continuar</button>
        </section>
      )}
      {step === 1 && (
        <section className="card col">
          <h2 style={{ margin: 0 }}>Nível de formação</h2>
          <div className="row">
            {(["internato", "residencia"] as const).map((l) => (
              <button key={l} className={`btn ${prefs.level === l ? "primary" : ""}`} aria-pressed={prefs.level === l} onClick={() => setPrefs({ level: l })}>
                {l === "internato" ? "Internato" : "Residência"}
              </button>
            ))}
          </div>
          <label className="field">
            Como quer ser chamado(a)? (opcional, fica só neste aparelho)
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
          </label>
          <label className="row">
            <input type="checkbox" checked={prefs.render2D} onChange={(e) => setPrefs({ render2D: e.target.checked })} /> Usar modo 2D acessível (para aparelhos sem 3D ou leitor de tela)
          </label>
          <div className="row">
            <button className="btn" onClick={() => setStep(0)}>Voltar</button>
            <button className="btn primary" onClick={() => setStep(2)}>Continuar</button>
          </div>
        </section>
      )}
      {step === 2 && (
        <section className="card col">
          <h2 style={{ margin: 0 }}>Tutorial guiado</h2>
          <p>Um atendimento curto com instruções passo a passo: abrir o monitor, conversar com a paciente, examinar uma região, pedir um exame, prescrever, definir destino e ler o debriefing.</p>
          <div className="row">
            <button className="btn primary" onClick={() => finish(true)} disabled={!tutorialCase}>Começar tutorial</button>
            <button className="btn" onClick={() => finish(false)}>Pular e ir para o início</button>
          </div>
        </section>
      )}
    </main>
  );
}
