import { useApp } from "../../app/App";
import { SessionController } from "../../app/session";
import { t } from "../../i18n/pt-BR/strings";
import { nextRandom } from "../../engine/util";

export function Home() {
  const { go, sessions, cases, storage, setActive, profile, warnings, rejectedCases } = useApp();
  const activeRec = sessions.find((s) => s.status === "ativa");
  const today = new Date();
  const daySeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

  const resume = async () => {
    if (!activeRec) return;
    const c = await SessionController.resume(activeRec, storage);
    setActive(c);
    go({ name: "encounter" });
  };
  const random = () => {
    if (cases.length === 0) return;
    const c = cases[Math.floor(Math.random() * cases.length)]!;
    go({ name: "briefing", caseId: c.id });
  };
  const daily = () => {
    if (cases.length === 0) return;
    const r = nextRandom(daySeed).value;
    const c = cases[Math.floor(r * cases.length)]!;
    go({ name: "briefing", caseId: c.id, seed: daySeed });
  };

  return (
    <main className="screen">
      <header className="topbar">
        <h1>🩺 {t("app.name")}</h1>
        <span className="muted">{profile?.name ? `Olá, ${profile.name}` : "Uso local, sem conta"}</span>
      </header>
      {warnings.length > 0 && (
        <div className="notice" role="status">
          {warnings.map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>
      )}
      {rejectedCases.length > 0 && (
        <div className="notice danger">
          {rejectedCases.length} caso(s) com erro de validação não serão executados: {rejectedCases.map((r) => r.id).join(", ")}.
        </div>
      )}
      <section className="card col">
        <button className="btn primary big" onClick={resume} disabled={!activeRec}>
          ▶ {t("home.continue")}
        </button>
        <span className="muted" style={{ fontSize: "0.85em" }}>
          {activeRec ? `Em andamento: ${cases.find((c) => c.id === activeRec.caseId)?.publicTitle ?? activeRec.caseSnapshot.publicTitle}` : t("home.noActive")}
        </span>
      </section>
      <nav className="grid" aria-label="Menu principal">
        <button className="btn big" onClick={() => go({ name: "library" })}>📚 {t("home.library")}<br /><span className="muted">{cases.length} casos disponíveis offline</span></button>
        <button className="btn big" onClick={random}>🎲 {t("home.random")}</button>
        <button className="btn big" onClick={daily}>📅 {t("home.daily")}<br /><span className="muted">Repetível, sem bloqueio</span></button>
        <button className="btn big" onClick={() => go({ name: "library", specialty: "__escolher" })}>🏥 {t("home.specialty")}</button>
        <button className="btn big" onClick={() => go({ name: "library", oral: true })}>🎤 {t("home.oral")}</button>
        <button className="btn big" onClick={() => go({ name: "history" })}>📈 {t("home.history")}</button>
        <button className="btn big" onClick={() => go({ name: "editor" })}>✏️ {t("home.editor")}</button>
        <button className="btn big" onClick={() => go({ name: "variants" })}>🧬 {t("home.variants")}</button>
        <button className="btn big" onClick={() => go({ name: "onboarding" })}>🎓 {t("home.tutorial")}</button>
        <button className="btn big" onClick={() => go({ name: "settings" })}>⚙️ {t("home.settings")}</button>
        <button className="btn big" onClick={() => go({ name: "inspector" })}>🧍 {t("home.inspector")}</button>
      </nav>
      <p className="disclaimer">
        {t("app.disclaimer")} Sem assinatura, anúncios ou limite de partidas. Conquistas locais não são certificados nem créditos oficiais.
      </p>
    </main>
  );
}
