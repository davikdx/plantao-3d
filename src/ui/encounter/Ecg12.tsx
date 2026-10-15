import { useEffect, useRef } from "react";
import { ecgSample, LEAD_POLARITY, LEADS } from "../monitor/waveforms";

interface Props {
  ecg: { rhythm: string; rate: number; stElevationLeads: string[]; stDepressionLeads: string[]; peakedT: boolean; wideQrs: boolean };
}

/** ECG de 12 derivações ILUSTRATIVO (gerado por algoritmo; morfologia simplificada; sem validade diagnóstica). */
export function Ecg12({ ecg }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const W = c.width;
    const H = c.height;
    ctx.fillStyle = "#fff7f7";
    ctx.fillRect(0, 0, W, H);
    // grade: 1 mm = 4 px (25 mm/s → 100 px/s; 10 mm/mV → 40 px/mV)
    for (let x = 0; x < W; x += 4) {
      ctx.strokeStyle = x % 20 === 0 ? "#f3b2b2" : "#fbe0e0";
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 4) {
      ctx.strokeStyle = y % 20 === 0 ? "#f3b2b2" : "#fbe0e0";
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    const cols = 4;
    const rows = 3;
    const cw = W / cols;
    const rh = H / rows;
    ctx.lineWidth = 1.3;
    LEADS.forEach((lead, i) => {
      const col = Math.floor(i / rows);
      const row = i % rows;
      const x0 = col * cw;
      const y0 = row * rh + rh * 0.55;
      ctx.fillStyle = "#333";
      ctx.font = "11px sans-serif";
      ctx.fillText(lead, x0 + 4, row * rh + 12);
      ctx.strokeStyle = "#111";
      ctx.beginPath();
      const morph = {
        rhythm: ecg.rhythm,
        rate: ecg.rate,
        polarity: LEAD_POLARITY[lead] ?? 1,
        peakedT: ecg.peakedT,
        wideQrs: ecg.wideQrs,
        stElevation: ecg.stElevationLeads.includes(lead) ? 0.25 : 0,
        stDepression: ecg.stDepressionLeads.includes(lead) ? 0.15 : 0
      };
      for (let px = 0; px < cw - 6; px++) {
        const tt = px / 100 + col * 2.5;
        const y = y0 - ecgSample(tt, morph) * 40;
        if (px === 0) ctx.moveTo(x0 + px, y);
        else ctx.lineTo(x0 + px, y);
      }
      ctx.stroke();
    });
    ctx.fillStyle = "#555";
    ctx.font = "10px sans-serif";
    ctx.fillText("25 mm/s · 10 mm/mV · ILUSTRAÇÃO EDUCATIVA gerada por algoritmo — não é traçado real", 6, H - 4);
  }, [ecg]);
  return (
    <div className="ecg12">
      <canvas ref={ref} width={1000} height={360} role="img" aria-label={`ECG ilustrativo de 12 derivações, frequência ${ecg.rate} bpm`} />
    </div>
  );
}
