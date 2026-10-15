import { useState } from "react";
import { useApp } from "../../app/App";
import { exportBackup, importBackup, type ConflictPolicy } from "../../storage";
import { t } from "../../i18n/pt-BR/strings";
import { pickTextFile, saveTextFile, TopBar } from "../common";

export function Settings() {
  const { prefs, setPrefs, storage, refreshCases, refreshSessions } = useApp();
  const [msg, setMsg] = useState("");
  const [policy, setPolicy] = useState<ConflictPolicy>("manter_ambos");
  return (
    <main className="screen" style={{ maxWidth: 760 }}>
      <TopBar title={t("home.settings")} />
      <section className="card col">
        <strong>Aparência e acessibilidade</strong>
        <label className="field">{t("settings.theme")}<select value={prefs.theme} onChange={(e) => setPrefs({ theme: e.target.value as "escuro" | "claro" })}><option value="escuro">Escuro</option><option value="claro">Claro</option></select></label>
        <label className="field">{t("settings.font")} ({Math.round(prefs.fontScale * 100)}%)<input type="range" min={0.85} max={1.5} step={0.05} value={prefs.fontScale} onChange={(e) => setPrefs({ fontScale: Number(e.target.value) })} /></label>
        <label className="row"><input type="checkbox" checked={prefs.highContrast} onChange={(e) => setPrefs({ highContrast: e.target.checked })} /> {t("settings.contrast")}</label>
        <label className="row"><input type="checkbox" checked={prefs.reducedMotion} onChange={(e) => setPrefs({ reducedMotion: e.target.checked })} /> {t("settings.motion")}</label>
        <label className="row"><input type="checkbox" checked={prefs.captions} onChange={(e) => setPrefs({ captions: e.target.checked })} /> Legendas e alternativas textuais para sons</label>
      </section>
      <section className="card col">
        <strong>Gráficos</strong>
        <label className="field">{t("settings.quality")}<select value={prefs.quality} onChange={(e) => setPrefs({ quality: e.target.value as "baixo" | "medio" | "alto" })}><option value="baixo">Baixa (aparelhos modestos)</option><option value="medio">Média</option><option value="alto">Alta (sombras)</option></select></label>
        <label className="row"><input type="checkbox" checked={prefs.render2D} onChange={(e) => setPrefs({ render2D: e.target.checked })} /> {t("settings.2d")}</label>
      </section>
      <section className="card col">
        <strong>{t("settings.sound")}</strong>
        <label className="field">Efeitos e monitor ({Math.round(prefs.effectsVolume * 100)}%)<input type="range" min={0} max={1} step={0.05} value={prefs.effectsVolume} onChange={(e) => setPrefs({ effectsVolume: Number(e.target.value) })} /></label>
        <label className="field">Ambiente ({Math.round(prefs.ambientVolume * 100)}%)<input type="range" min={0} max={1} step={0.05} value={prefs.ambientVolume} onChange={(e) => setPrefs({ ambientVolume: Number(e.target.value) })} /></label>
        <label className="field">Voz do paciente — síntese do aparelho, opcional ({Math.round(prefs.voiceVolume * 100)}%)<input type="range" min={0} max={1} step={0.05} value={prefs.voiceVolume} onChange={(e) => setPrefs({ voiceVolume: Number(e.target.value) })} /></label>
        <label className="row"><input type="checkbox" checked={prefs.alarmSound} onChange={(e) => setPrefs({ alarmSound: e.target.checked })} /> Alarmes sonoros (os visuais permanecem sempre)</label>
        <span className="muted" style={{ fontSize: "0.85em" }}>Sons de monitor e ausculta são sintetizados e ilustrativos; não servem para avaliação clínica validada. Reconhecimento de voz não está incluído nesta versão (o atendimento é por texto).</span>
      </section>
      <section className="card col">
        <strong>Dificuldade e modos</strong>
        <label className="field">Modo padrão<select value={prefs.defaultMode} onChange={(e) => setPrefs({ defaultMode: e.target.value as typeof prefs.defaultMode })}><option value="guiado">Aprendizado guiado</option><option value="livre">Treino livre</option><option value="prova">Prova</option><option value="oral">Prova oral</option></select></label>
        <label className="row"><input type="checkbox" checked={prefs.doseAlerts} onChange={(e) => setPrefs({ doseAlerts: e.target.checked })} /> Alertas de dose fora das faixas cadastradas (desativados no modo prova)</label>
        <label className="row"><input type="checkbox" checked={prefs.hideDiagnosisInTitles} onChange={(e) => setPrefs({ hideDiagnosisInTitles: e.target.checked })} /> Ocultar diagnóstico nos títulos</label>
        <label className="field">Nível<select value={prefs.level} onChange={(e) => setPrefs({ level: e.target.value as "internato" | "residencia" })}><option value="internato">Internato</option><option value="residencia">Residência</option></select></label>
        <label className="row"><input type="checkbox" checked={prefs.instructorMode} onChange={(e) => setPrefs({ instructorMode: e.target.checked })} /> Perfil instrutor local (habilita edição de gabarito no editor)</label>
      </section>
      <section className="card col">
        <strong>{t("settings.backup")}</strong>
        <span className="muted" style={{ fontSize: "0.85em" }}>Armazenamento atual: {storage.kind === "sqlite" ? "SQLite no aparelho" : storage.kind === "indexeddb" ? "IndexedDB (navegador/WebView)" : "memória (não persistente)"}.</span>
        <div className="row">
          <button className="btn" onClick={async () => setMsg(await saveTextFile(`plantao3d-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(await exportBackup(storage))))}>Exportar backup completo</button>
          <select value={policy} onChange={(e) => setPolicy(e.target.value as ConflictPolicy)} aria-label="Política de conflito"><option value="manter_ambos">Em conflito: manter ambos</option><option value="substituir">Em conflito: substituir</option><option value="rejeitar">Em conflito: rejeitar</option></select>
          <button className="btn" onClick={async () => {
            const text = await pickTextFile();
            if (!text) return setMsg("Nenhum arquivo (ou maior que 10 MB).");
            const r = await importBackup(storage, text, policy);
            await refreshCases();
            await refreshSessions();
            setMsg(`${r.ok ? "Importado" : "Importação parcial"}: ${r.imported.length} item(ns). ${r.errors.slice(0, 3).join(" ")}`);
          }}>Importar backup</button>
        </div>
        {msg && <span className="muted">{msg}</span>}
      </section>
      <section className="card col">
        <strong>{t("settings.ai")}</strong>
        <p className="muted" style={{ margin: 0, fontSize: "0.85em" }}>
          Todo o app funciona sem IA de nuvem. Opcionalmente, informe a URL HTTPS de um gateway PRÓPRIO (ver services/ai-gateway no código). Nenhuma chave é guardada no app; o gateway recebe apenas a pergunta e fatos que o paciente pode saber, nunca o diagnóstico oculto. Requer internet.
        </p>
        <label className="row"><input type="checkbox" checked={prefs.aiEnabled} onChange={(e) => setPrefs({ aiEnabled: e.target.checked })} /> Ativar paciente generativo via gateway próprio</label>
        <input placeholder="https://meu-gateway.exemplo.org" value={prefs.aiGatewayUrl} onChange={(e) => setPrefs({ aiGatewayUrl: e.target.value.trim().slice(0, 200) })} aria-label="URL do gateway" />
      </section>
      <p className="disclaimer">{t("app.disclaimer")}</p>
    </main>
  );
}
