import { useEffect, useRef, useState } from "react";
import type { SessionController } from "../../app/session";
import { RHYTHM_LABELS, type RhythmId } from "../../domain/variables";
import { alarm, qrsBeep } from "../audio";
import { ecgSample, plethSample, rhythmIsQrsAt } from "../monitor/waveforms";

interface Props {
  ctl: SessionController;
  showRhythmLabel: boolean;
  soundVolume: number;
  alarmSound: boolean;
  pinned: boolean;
  onTogglePin(): void;
  onCanvas?(c: HTMLCanvasElement | null): void;
}

/** Monitor multiparamétrico: traçado ilustrativo gerado por algoritmo + valores do motor. */
export function Monitor({ ctl, showRhythmLabel, soundVolume, alarmSound, pinned, onTogglePin, onCanvas }: Props) {
  const ecgRef = useRef<HTMLCanvasElement>(null);
  const screenRef = useRef<HTMLCanvasElement | null>(null);
  const [vals, setVals] = useState(() => ctl.view().monitor);
  const [alarmText, setAlarmText] = useState<string | null>(null);

  useEffect(() => {
    // tela secundária (textura do monitor 3D)
    const sc = document.createElement("canvas");
    sc.width = 512;
    sc.height = 340;
    screenRef.current = sc;
    onCanvas?.(sc);
    return () => onCanvas?.(null);
  }, [onCanvas]);

  useEffect(() => {
    let raf = 0;
    let x = 0;
    let lastSim = ctl.state.tick / 10;
    let lastAlarm = 0;
    let uiT = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const c = ecgRef.current;
      const v = ctl.view().monitor;
      const vs = ctl.visual();
      const sim = ctl.state.tick / 10;
      const now = performance.now();
      if (now - uiT > 400) {
        uiT = now;
        setVals(v);
      }
      const installed = v.installed || ctl.state.devices.includes("pas_desfibrilador");
      const rhythm = String(ctl.state.flags.rhythm ?? "sinusal");
      const rate = v.electricalRate ?? 0;
      const morph = { rhythm, rate };
      const spo2 = v.readings.find((r) => r.var === "spo2");
      // bipe por QRS (somente com monitor e pulso)
      if (installed && !ctl.paused && sim > lastSim && rhythmIsQrsAt(lastSim, sim, morph) && vs.hasPulse) qrsBeep(spo2?.value ?? null, soundVolume);
      // alarmes visuais (sempre) e sonoros (opcionais)
      let al: string | null = null;
      if (installed) {
        if (!vs.hasPulse || rhythm === "fv" || rhythm === "assistolia" || rhythm === "tv") al = "ALARME: ritmo de risco / sem pulso detectável";
        else if (spo2?.value != null && spo2.value < 88) al = `SpO₂ baixa (${spo2.value}%)`;
        else if (rate > 140) al = `FC alta (${rate} bpm)`;
        else if (rate < 45) al = `FC baixa (${rate} bpm)`;
        const sbp = v.readings.find((r) => r.var === "sbp");
        if (!al && sbp?.value != null && sbp.value < 90) al = `PA baixa (${sbp.value} mmHg)`;
      }
      setAlarmText((prev) => (prev === al ? prev : al));
      if (al && alarmSound && !ctl.paused && now - lastAlarm > 6000) {
        lastAlarm = now;
        alarm(al.startsWith("ALARME") ? "alta" : "media", soundVolume);
      }
      const dtSim = Math.max(0, sim - lastSim);
      lastSim = sim;
      if (c) {
        const ctx2 = c.getContext("2d");
        if (ctx2) {
          const w = c.width;
          const h = c.height;
          const pxPerSec = w / 5; // 25 mm/s equivalente ilustrativo (5 s na largura)
          const steps = Math.max(1, Math.min(200, Math.round(dtSim * pxPerSec)));
          for (let i = 0; i < steps; i++) {
            const tt = sim - dtSim + (i / steps) * dtSim;
            const y1 = installed ? h * 0.38 - ecgSample(tt, morph) * h * 0.25 : h * 0.38;
            const y2 = installed && spo2 && spo2.quality === "ok" ? h * 0.92 - plethSample(tt, rate, 0.28) * h : h * 0.92;
            ctx2.fillStyle = "#05080c";
            ctx2.fillRect(x, 0, 4, h);
            ctx2.fillStyle = "#69f0ae";
            ctx2.fillRect(x, y1, 2, 2);
            ctx2.fillStyle = "#40c4ff";
            ctx2.fillRect(x, y2, 2, 2);
            x = (x + 1) % w;
          }
          mirrorToScreen(c, screenRef.current, v, rhythm, installed);
        }
      }
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [ctl, soundVolume, alarmSound]);

  const get = (k: string) => vals.readings.find((r) => r.var === k);
  const fmt = (r?: { value: number | null; quality: string }) => (!r ? "—" : r.quality === "indisponivel" || r.value == null ? "---" : String(r.value));
  const installed = vals.installed || ctl.state.devices.includes("pas_desfibrilador");
  const sbp = get("sbp");
  const dbp = get("dbp");
  return (
    <div className={`monitor ${alarmText ? "alarm" : ""}`} role="region" aria-label="Monitor multiparamétrico">
      <div className="row" style={{ justifyContent: "space-between", fontSize: "0.75em" }}>
        <span>{installed ? (showRhythmLabel ? RHYTHM_LABELS[(String(ctl.state.flags.rhythm) as RhythmId)] ?? "Ritmo" : "Traçado ilustrativo · 25 mm/s · 10 mm/mV") : "Monitor não instalado"}</span>
        <button className="btn small" style={{ minHeight: 24, padding: "0 6px" }} onClick={onTogglePin} aria-pressed={pinned}>
          {pinned ? "Recolher" : "Fixar"}
        </button>
      </div>
      {pinned && <canvas ref={ecgRef} width={360} height={90} aria-hidden="true" />}
      <div className="vals" aria-live="off">
        <div className="v hr">FC (bpm)<b>{installed ? fmt(get("hr")) : "—"}</b></div>
        <div className="v spo">SpO₂ (%)<b>{fmt(get("spo2"))}</b>{get("spo2")?.quality === "ruim" && <span>sinal ruim</span>}</div>
        <div className="v bp">PA (mmHg)<b>{sbp ? `${fmt(sbp)}/${fmt(dbp)}` : "—"}</b></div>
        <div className="v et">{get("etco2") ? "EtCO₂" : get("fetalHr") ? "BCF" : "FR (irpm)"}<b>{get("etco2") ? fmt(get("etco2")) : get("fetalHr") ? fmt(get("fetalHr")) : ctl.view().inspection.rr ?? "—"}</b></div>
      </div>
      {alarmText && <div role="alert" style={{ color: "#ff8a80", fontSize: "0.8em", fontWeight: 700 }}>⚠ {alarmText}</div>}
      {!pinned && <canvas ref={ecgRef} width={360} height={90} style={{ display: "none" }} aria-hidden="true" />}
    </div>
  );
}

function mirrorToScreen(src: HTMLCanvasElement, dst: HTMLCanvasElement | null, v: ReturnType<SessionController["view"]>["monitor"], rhythm: string, installed: boolean) {
  if (!dst) return;
  const c = dst.getContext("2d");
  if (!c) return;
  c.fillStyle = "#05080c";
  c.fillRect(0, 0, dst.width, dst.height);
  if (!installed) return;
  c.drawImage(src, 0, 0, src.width, src.height, 0, 20, 360, 180);
  const g = (k: string) => v.readings.find((r) => r.var === k);
  c.font = "bold 46px sans-serif";
  c.fillStyle = "#69f0ae";
  c.fillText(String(v.electricalRate ?? "--"), 380, 80);
  const s = g("spo2");
  c.fillStyle = "#40c4ff";
  c.fillText(s && s.value != null ? String(s.value) : "--", 380, 160);
  const p = g("sbp");
  const d = g("dbp");
  c.font = "bold 34px sans-serif";
  c.fillStyle = "#ff8a80";
  c.fillText(p && p.value != null ? `${p.value}/${d?.value ?? "--"}` : "--/--", 30, 260);
  c.font = "18px sans-serif";
  c.fillStyle = "#90a4ae";
  c.fillText(rhythm === "fv" || rhythm === "assistolia" ? "" : "ilustração educativa", 30, 320);
}
