import { useCallback, useEffect, useRef, useState } from "react";
import type { SessionController } from "../../app/session";
import { Scene3D, webglAvailable, type CameraPreset, type Quality } from "../../renderer3d/Scene3D";

export const REGION_LABELS: Record<string, string> = {
  geral: "Estado geral",
  cabeca: "Cabeça",
  olhos: "Olhos",
  boca: "Boca / via aérea",
  pescoco: "Pescoço",
  torax_anterior: "Tórax anterior",
  torax_posterior: "Tórax posterior",
  coracao: "Precórdio",
  abdome_epigastrio: "Epigástrio",
  abdome_qsd: "Abdome — quadrante superior direito",
  abdome_qse: "Abdome — quadrante superior esquerdo",
  abdome_qid: "Abdome — quadrante inferior direito",
  abdome_qie: "Abdome — quadrante inferior esquerdo",
  pelve: "Pelve",
  membro_superior_d: "Membro superior direito",
  membro_superior_e: "Membro superior esquerdo",
  membro_inferior_d: "Membro inferior direito",
  membro_inferior_e: "Membro inferior esquerdo",
  pele: "Pele e mucosas",
  neurologico: "Neurológico"
};

const PRESETS: [CameraPreset, string][] = [
  ["corpo", "Corpo inteiro"],
  ["face", "Face/via aérea"],
  ["torax", "Tórax"],
  ["abdome", "Abdome"],
  ["membros", "Membros"]
];

interface Props {
  ctl: SessionController;
  use2D: boolean;
  quality: Quality;
  reducedMotion: boolean;
  onRegion(id: string): void;
  monitorCanvas: HTMLCanvasElement | null;
  speakSignal: number;
  onFallback(reason: string): void;
}

export function Stage({ ctl, use2D, quality, reducedMotion, onRegion, monitorCanvas, speakSignal, onFallback }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Scene3D | null>(null);
  const [lost, setLost] = useState(false);
  const onRegionRef = useRef(onRegion);
  onRegionRef.current = onRegion;
  const can3D = !use2D && webglAvailable();

  useEffect(() => {
    if (!can3D) {
      if (!use2D) onFallback("WebGL 2 indisponível neste aparelho; usando o modo 2D acessível.");
      return;
    }
    const canvas = canvasRef.current!;
    let scene: Scene3D;
    try {
      scene = new Scene3D(canvas, {
        quality,
        reducedMotion,
        onRegionSelected: (id) => onRegionRef.current(id),
        onContextLost: () => setLost(true),
        onContextRestored: () => setLost(false)
      });
      const c = ctl.ctx.caseDef;
      scene.load(c.environment, c.patient.visual, c.patient.heightCm);
    } catch (e) {
      onFallback(`Falha ao iniciar o 3D (${e instanceof Error ? e.message : "erro"}); usando o modo 2D.`);
      return;
    }
    sceneRef.current = scene;
    (window as unknown as { __scene?: Scene3D }).__scene = scene;
    scene.setVisualState(ctl.visual());
    scene.start();
    const id = setInterval(() => scene.setVisualState(ctl.visual()), 100);
    const ro = new ResizeObserver(() => scene.resize());
    ro.observe(canvas);
    return () => {
      clearInterval(id);
      ro.disconnect();
      scene.dispose();
      sceneRef.current = null;
      delete (window as unknown as { __scene?: Scene3D }).__scene;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctl, can3D]);

  useEffect(() => sceneRef.current?.setQuality(quality), [quality]);
  useEffect(() => sceneRef.current?.setMonitorCanvas(monitorCanvas), [monitorCanvas]);
  useEffect(() => {
    if (speakSignal > 0) sceneRef.current?.speak(2.5);
  }, [speakSignal]);

  const preset = useCallback((p: CameraPreset) => sceneRef.current?.setPreset(p), []);

  if (!can3D) return <Body2D onRegion={onRegion} ctl={ctl} />;
  return (
    <>
      <canvas ref={canvasRef} className="three" aria-label="Paciente em 3D. Toque em uma região do corpo para examinar; arraste para girar a câmera." />
      {lost && <div className="notice danger" style={{ position: "absolute", top: 60, left: 8 }}>Contexto gráfico perdido; tentando restaurar… O atendimento continua pelos painéis.</div>}
      <div className="cam-presets" role="toolbar" aria-label="Câmera">
        {PRESETS.map(([p, l]) => (
          <button key={p} className="btn" onClick={() => preset(p)}>{l}</button>
        ))}
        <button className="btn" onClick={() => preset("corpo")} aria-label="Recentralizar câmera">⟳</button>
      </div>
    </>
  );
}

/** Modo 2D acessível: mapa corporal com botões navegáveis por teclado/leitor de tela. */
export function Body2D({ onRegion, ctl }: { onRegion(id: string): void; ctl: SessionController }) {
  const v = ctl.visual();
  const regions: [string, string][] = [
    ["cabeca", "M95 10 a25 25 0 1 1 0.1 0z"],
    ["pescoco", "M85 58 h20 v14 h-20z"],
    ["torax_anterior", "M62 74 h66 v62 h-66z"],
    ["abdome_qsd", "M62 138 h32 v28 h-32z"],
    ["abdome_qse", "M96 138 h32 v28 h-32z"],
    ["abdome_qid", "M62 168 h32 v28 h-32z"],
    ["abdome_qie", "M96 168 h32 v28 h-32z"],
    ["pelve", "M66 198 h58 v18 h-58z"],
    ["membro_superior_d", "M40 76 h20 v120 h-20z"],
    ["membro_superior_e", "M130 76 h20 v120 h-20z"],
    ["membro_inferior_d", "M66 218 h26 v130 h-26z"],
    ["membro_inferior_e", "M98 218 h26 v130 h-26z"]
  ];
  return (
    <div className="body2d">
      <svg viewBox="0 0 190 360" role="group" aria-label="Mapa corporal (vista frontal; direita do paciente à esquerda da tela)">
        {regions.map(([id, d]) => (
          <path key={id} d={d} data-region={id} tabIndex={0} role="button" aria-label={REGION_LABELS[id]} onClick={() => onRegion(id)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onRegion(id)} />
        ))}
        <text x="4" y="355" fontSize="9" fill="currentColor">D</text>
        <text x="178" y="355" fontSize="9" fill="currentColor">E</text>
      </svg>
      <div className="col" style={{ maxWidth: 220, fontSize: "0.85em" }}>
        <strong>Observação visual</strong>
        <span>Respiração: {v.isBreathing ? `${Math.round(v.respiratoryRatePerMinute)} irpm, esforço ${v.respiratoryEffortLevel >= 2 ? "importante" : v.respiratoryEffortLevel >= 1 ? "moderado" : "leve/ausente"}` : "sem movimentos respiratórios visíveis"}</span>
        <span>Consciência: {v.consciousnessVisualState}</span>
        <span>Expressão de dor: {v.painVisualState}</span>
        {v.skinFindings.sweating && <span>Sudorese visível</span>}
        {v.skinFindings.urticaria && <span>Lesões urticariformes visíveis</span>}
        {v.seizure && <span>Movimentos tônico-clônicos</span>}
        {v.activeProcedures.includes("rcp") && <span>RCP em andamento</span>}
        <span>Dispositivos: {v.activeDevices.length ? v.activeDevices.join(", ") : "nenhum"}</span>
        <button className="btn small" onClick={() => onRegion("geral")}>Estado geral</button>
        <button className="btn small" onClick={() => onRegion("neurologico")}>Neurológico</button>
        <button className="btn small" onClick={() => onRegion("pele")}>Pele e mucosas</button>
        <button className="btn small" onClick={() => onRegion("coracao")}>Precórdio</button>
        <button className="btn small" onClick={() => onRegion("torax_posterior")}>Tórax posterior</button>
        <button className="btn small" onClick={() => onRegion("olhos")}>Olhos</button>
        <button className="btn small" onClick={() => onRegion("boca")}>Boca/via aérea</button>
      </div>
    </div>
  );
}
