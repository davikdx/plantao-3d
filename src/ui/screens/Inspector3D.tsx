import { useEffect, useRef, useState } from "react";
import { useApp } from "../../app/App";
import { DEVICE_IDS, DEVICE_LABELS, ENVIRONMENTS, ENVIRONMENT_LABELS, type DeviceId, type EnvironmentId } from "../../domain/resources";
import type { PatientVisualProfile } from "../../domain/schema";
import type { VisualState } from "../../engine/views";
import { Scene3D, webglAvailable, type CameraPreset } from "../../renderer3d/Scene3D";
import { TopBar } from "../common";

/** Tela técnica de inspeção 3D (sem dados clínicos): poses, luz, pele, animações e acessórios. */
export function Inspector3D() {
  const { prefs } = useApp();
  const ref = useRef<HTMLCanvasElement>(null);
  const scene = useRef<Scene3D | null>(null);
  const [env, setEnv] = useState<EnvironmentId>("emergencia");
  const [profile, setProfile] = useState<PatientVisualProfile>({ ageGroup: "adulto", sex: "feminino", skinTone: 4, hairStyle: "cacheado", hairColor: "preto", build: "medio", pregnancyTrimester: 0 });
  const [devices, setDevices] = useState<DeviceId[]>(["monitor_ecg", "oximetro"]);
  const [anim, setAnim] = useState({ rr: 16, effort: 0, apnea: false, cough: false, seizure: false, cpr: false, agitation: false, tremor: false, consciousness: "alerta" as VisualState["consciousnessVisualState"], pain: "nenhuma" as VisualState["painVisualState"], pallor: 0, cyanosis: 0, sweating: false, urticaria: false, edema: false, bleeding: false, jaundice: false });
  const [stats, setStats] = useState("");
  const [picked, setPicked] = useState("");
  const ok = webglAvailable();

  useEffect(() => {
    if (!ok || !ref.current) return;
    const s = new Scene3D(ref.current, { quality: prefs.quality, reducedMotion: prefs.reducedMotion, onRegionSelected: (id) => setPicked(id) });
    scene.current = s;
    (window as unknown as { __scene?: Scene3D }).__scene = s;
    s.start();
    const ro = new ResizeObserver(() => s.resize());
    ro.observe(ref.current);
    const st = setInterval(() => {
      const x = s.stats();
      setStats(`${x.fps} fps · ${x.calls} chamadas · ${x.triangles.toLocaleString("pt-BR")} triângulos · ${x.geometries} geometrias · ${x.textures} texturas`);
    }, 1000);
    return () => {
      clearInterval(st);
      ro.disconnect();
      s.dispose();
      scene.current = null;
    };
  }, [ok, prefs.quality, prefs.reducedMotion]);

  useEffect(() => {
    scene.current?.load(env, profile);
  }, [env, profile, prefs.quality, prefs.reducedMotion]);

  useEffect(() => {
    const vs: VisualState = {
      posture: "supino",
      respiratoryRatePerMinute: anim.apnea ? 0 : anim.rr,
      respiratoryEffortLevel: anim.effort,
      isBreathing: !anim.apnea,
      consciousnessVisualState: anim.consciousness,
      painVisualState: anim.pain,
      skinFindings: { pallor: anim.pallor, cyanosis: anim.cyanosis, sweating: anim.sweating, urticaria: anim.urticaria, jaundice: anim.jaundice, rash: false, edema: anim.edema, bleeding: anim.bleeding, angioedema: anim.urticaria },
      activeDevices: devices,
      activeProcedures: anim.cpr ? ["rcp"] : [],
      speechState: "frases",
      seizure: anim.seizure,
      agitation: anim.agitation,
      tremor: anim.tremor,
      cough: anim.cough,
      pregnancyTrimester: profile.pregnancyTrimester,
      heartRate: 80,
      hasPulse: !anim.cpr
    };
    scene.current?.setVisualState(vs);
  }, [anim, devices, profile, env]);

  const tog = (k: keyof typeof anim) => setAnim({ ...anim, [k]: !anim[k] });
  const presets: Record<string, PatientVisualProfile> = {
    Adulto: { ageGroup: "adulto", sex: "masculino", skinTone: 3, hairStyle: "curto", hairColor: "preto", build: "medio", pregnancyTrimester: 0 },
    Idoso: { ageGroup: "idoso", sex: "feminino", skinTone: 1, hairStyle: "coque", hairColor: "branco", build: "magro", pregnancyTrimester: 0 },
    Criança: { ageGroup: "crianca_pequena", sex: "masculino", skinTone: 5, hairStyle: "crespo_curto", hairColor: "preto", build: "medio", pregnancyTrimester: 0 },
    Lactente: { ageGroup: "lactente", sex: "feminino", skinTone: 2, hairStyle: "curto", hairColor: "castanho", build: "medio", pregnancyTrimester: 0 },
    Gestante: { ageGroup: "adulto", sex: "feminino", skinTone: 6, hairStyle: "crespo_volume", hairColor: "preto", build: "medio", pregnancyTrimester: 3 }
  };

  return (
    <main className="screen" style={{ maxWidth: 1200 }}>
      <TopBar title="Inspeção técnica 3D" />
      <p className="muted" style={{ margin: 0 }}>Tela de verificação sem dados clínicos. Animações são representações simplificadas, não biomecânica validada.</p>
      {!ok && <div className="notice danger">WebGL 2 indisponível neste aparelho/navegador. O atendimento continua disponível no modo 2D.</div>}
      <div style={{ position: "relative", height: "52vh", minHeight: 280, borderRadius: 10, overflow: "hidden", border: "1px solid var(--line)" }}>
        <canvas ref={ref} className="three" style={{ width: "100%", height: "100%", display: "block" }} aria-label="Cena 3D de inspeção" />
        <div className="cam-presets">{(["corpo", "face", "torax", "abdome", "membros"] as CameraPreset[]).map((p) => <button key={p} className="btn" onClick={() => scene.current?.setPreset(p)}>{p}</button>)}</div>
      </div>
      <span className="muted" style={{ fontSize: "0.85em" }} aria-live="polite">{stats} {picked && `· região selecionada: ${picked}`}</span>
      <section className="card col">
        <div className="row">{Object.entries(presets).map(([k, v]) => <button key={k} className="btn small" onClick={() => setProfile(v)}>{k}</button>)}</div>
        <div className="row">
          <label className="field">Ambiente<select value={env} onChange={(e) => setEnv(e.target.value as EnvironmentId)}>{ENVIRONMENTS.map((e) => <option key={e} value={e}>{ENVIRONMENT_LABELS[e]}</option>)}</select></label>
          <label className="field">Tom de pele<input type="range" min={0} max={7} value={profile.skinTone} onChange={(e) => setProfile({ ...profile, skinTone: Number(e.target.value) })} /></label>
          <label className="field">Constituição<select value={profile.build} onChange={(e) => setProfile({ ...profile, build: e.target.value as "medio" })}>{["magro", "medio", "robusto", "obeso"].map((x) => <option key={x}>{x}</option>)}</select></label>
          <label className="field">FR<input type="range" min={4} max={60} value={anim.rr} onChange={(e) => setAnim({ ...anim, rr: Number(e.target.value) })} /></label>
          <label className="field">Esforço<input type="range" min={0} max={3} step={0.5} value={anim.effort} onChange={(e) => setAnim({ ...anim, effort: Number(e.target.value) })} /></label>
          <label className="field">Palidez<input type="range" min={0} max={1} step={0.1} value={anim.pallor} onChange={(e) => setAnim({ ...anim, pallor: Number(e.target.value) })} /></label>
          <label className="field">Cianose<input type="range" min={0} max={1} step={0.1} value={anim.cyanosis} onChange={(e) => setAnim({ ...anim, cyanosis: Number(e.target.value) })} /></label>
          <label className="field">Consciência<select value={anim.consciousness} onChange={(e) => setAnim({ ...anim, consciousness: e.target.value as "alerta" })}><option>alerta</option><option>sonolento</option><option>irresponsivo</option></select></label>
          <label className="field">Dor<select value={anim.pain} onChange={(e) => setAnim({ ...anim, pain: e.target.value as "nenhuma" })}><option>nenhuma</option><option>leve</option><option>moderada</option><option>intensa</option></select></label>
        </div>
        <div className="row">
          {(["apnea", "cough", "seizure", "cpr", "agitation", "tremor", "sweating", "urticaria", "edema", "bleeding", "jaundice"] as const).map((k) => (
            <label key={k} className="row"><input type="checkbox" checked={anim[k] as boolean} onChange={() => tog(k)} />{{ apnea: "Apneia", cough: "Tosse", seizure: "Convulsão", cpr: "RCP", agitation: "Agitação", tremor: "Tremor", sweating: "Sudorese", urticaria: "Urticária/angioedema", edema: "Edema", bleeding: "Sangramento", jaundice: "Icterícia" }[k]}</label>
          ))}
          <button className="btn small" onClick={() => scene.current?.speak(3)}>Fala (mandíbula)</button>
        </div>
        <strong>Dispositivos</strong>
        <div className="row">
          {DEVICE_IDS.map((d) => (
            <label key={d} className="row"><input type="checkbox" checked={devices.includes(d)} onChange={(e) => setDevices(e.target.checked ? [...devices, d] : devices.filter((x) => x !== d))} />{DEVICE_LABELS[d]}</label>
          ))}
        </div>
      </section>
    </main>
  );
}
