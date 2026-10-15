/**
 * Cena 3D do atendimento. Recebe VisualState (dados derivados do motor) e NUNCA decide
 * diagnóstico, dose, nota ou desfecho. Animações são representações simplificadas.
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { EnvironmentId } from "../domain/resources";
import type { PatientVisualProfile } from "../domain/schema";
import type { VisualState } from "../engine/views";
import { buildEnvironment, type EnvironmentBuild } from "./environments";
import { createPatientModel, type JointName, type PatientModel } from "./PatientModelFactory";
import { createDeviceSet, type DeviceSet } from "./devices";

export type Quality = "baixo" | "medio" | "alto";
export type CameraPreset = "corpo" | "face" | "torax" | "abdome" | "membros";

export interface SceneOptions {
  quality: Quality;
  reducedMotion?: boolean;
  onRegionSelected?: (regionId: string) => void;
  onContextLost?: () => void;
  onContextRestored?: () => void;
}

export function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!c.getContext("webgl2");
  } catch {
    return false;
  }
}

const QUALITY: Record<Quality, { pixelRatio: number; shadows: boolean; antialias: boolean; detail: number }> = {
  baixo: { pixelRatio: 1, shadows: false, antialias: false, detail: 0.6 },
  medio: { pixelRatio: 1.5, shadows: false, antialias: true, detail: 1 },
  alto: { pixelRatio: 2, shadows: true, antialias: true, detail: 1.3 }
};

const CYAN_TINT = new THREE.Color("#4f5aa8");
const PALE_TINT = new THREE.Color("#d9d4cc");
const JAUNDICE = new THREE.Color("#e8d36a");

export class Scene3D {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly controls: OrbitControls;
  private env: EnvironmentBuild | null = null;
  private patient: PatientModel | null = null;
  private devices: DeviceSet | null = null;
  private base = new Map<THREE.Object3D, THREE.Euler>();
  private basePos = new Map<THREE.Object3D, THREE.Vector3>();
  private vs: VisualState | null = null;
  private raf = 0;
  private running = false;
  private lastT = 0;
  private time = 0;
  private breathPhase = 0;
  private blinkTimer = 2;
  private blinkT = 0;
  private coughT = -1;
  private nextCough = 4;
  private speakUntil = 0;
  private camAnim: { from: THREE.Vector3; to: THREE.Vector3; tFrom: THREE.Vector3; tTo: THREE.Vector3; t: number } | null = null;
  private rescuer: THREE.Group | null = null;
  private monitorTex: THREE.CanvasTexture | null = null;
  private monitorMat: THREE.MeshBasicMaterial | null = null;
  private marker: THREE.Mesh;
  private markerT = 0;
  private frameTimes: number[] = [];
  private lights: THREE.Light[] = [];
  private contextLost = false;
  private pointerDown: { x: number; y: number; t: number } | null = null;
  private envId: EnvironmentId | null = null;
  private quality: Quality;
  private disposed = false;

  constructor(private canvas: HTMLCanvasElement, private opts: SceneOptions) {
    this.quality = opts.quality;
    const q = QUALITY[opts.quality];
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: q.antialias, powerPreference: "high-performance", preserveDrawingBuffer: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, q.pixelRatio));
    this.renderer.shadowMap.enabled = q.shadows;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.scene.background = new THREE.Color("#1b2430");
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.05, 30);
    this.camera.position.set(1.8, 1.9, 2.4);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.12;
    this.controls.minDistance = 0.35;
    this.controls.maxDistance = 4.5;
    this.controls.maxPolarAngle = Math.PI * 0.49; // não passa abaixo do piso
    this.controls.screenSpacePanning = true;
    const hemi = new THREE.HemisphereLight("#f4f7ff", "#5d6670", 1.1);
    const key = new THREE.DirectionalLight("#ffffff", 1.6);
    key.position.set(1.5, 3.2, 2.2);
    key.castShadow = q.shadows;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -2;
    key.shadow.camera.right = 2;
    key.shadow.camera.top = 2;
    key.shadow.camera.bottom = -2;
    const fill = new THREE.DirectionalLight("#dfe8ff", 0.5);
    fill.position.set(-2, 1.5, -1);
    this.lights.push(hemi, key, fill);
    this.scene.add(hemi, key, fill);
    const markerGeo = new THREE.RingGeometry(0.025, 0.035, 24);
    this.marker = new THREE.Mesh(markerGeo, new THREE.MeshBasicMaterial({ color: "#ffd54f", side: THREE.DoubleSide, depthTest: false, transparent: true }));
    this.marker.renderOrder = 10;
    this.marker.visible = false;
    this.scene.add(this.marker);
    canvas.addEventListener("webglcontextlost", this.onLost, false);
    canvas.addEventListener("webglcontextrestored", this.onRestored, false);
    canvas.addEventListener("pointerdown", this.onPointerDown);
    canvas.addEventListener("pointerup", this.onPointerUp);
    document.addEventListener("visibilitychange", this.onVisibility);
    this.resize();
  }

  // ------------------------------------------------------------------ montagem
  load(envId: EnvironmentId, profile: PatientVisualProfile, heightCm?: number): void {
    this.unloadContent();
    this.envId = envId;
    this.env = buildEnvironment(envId);
    this.scene.add(this.env.group);
    this.patient = createPatientModel(profile, { heightCm, geometryDetail: QUALITY[this.quality].detail });
    this.scene.add(this.patient.root);
    this.devices = createDeviceSet(this.patient);
    this.placePatient();
    // poça de sangue pertence ao cenário (não gira com o corpo)
    const blood = this.patient.parts.blood;
    blood.removeFromParent();
    blood.rotation.set(-Math.PI / 2, 0, 0);
    const o = this.env.patientOrigin;
    blood.position.set(o.x + 0.3, o.y + 0.012, o.z + 0.25);
    this.env.group.add(blood);
    this.captureBasePose();
    this.buildRescuer();
    if (this.env.monitorScreen) {
      this.monitorMat = new THREE.MeshBasicMaterial({ color: "#ffffff" });
      (this.env.monitorScreen.material as THREE.Material).dispose();
      this.env.monitorScreen.material = this.monitorMat;
      this.env.monitorScreen.visible = false;
    }
    if (QUALITY[this.quality].shadows) {
      this.scene.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) o.castShadow = true;
      });
    }
    this.setPreset("corpo", true);
  }

  private placePatient(): void {
    if (!this.env || !this.patient) return;
    const p = this.patient;
    const o = this.env.patientOrigin;
    const d = p.dims;
    p.root.rotation.set(0, 0, 0);
    if (this.env.patientMode === "sentado") {
      p.root.position.set(o.x, o.y + d.hipHalf * 0.15 - d.legLen, o.z);
      p.joints.thigh_L.rotation.x = -Math.PI / 2;
      p.joints.thigh_R.rotation.x = -Math.PI / 2;
      p.joints.shin_L.rotation.x = Math.PI / 2;
      p.joints.shin_R.rotation.x = Math.PI / 2;
      p.joints.upperArm_L.rotation.z = 0.15;
      p.joints.upperArm_R.rotation.z = -0.15;
      p.joints.forearm_L.rotation.x = -0.9;
      p.joints.forearm_R.rotation.x = -0.9;
    } else {
      // supino: cabeça em direção à cabeceira (−Z), face para cima
      p.root.rotation.x = -Math.PI / 2;
      p.root.position.set(o.x, o.y + d.chestDepth * 1.05, o.z + d.legLen);
      p.joints.chest.rotation.x += -0.12; // cabeceira levemente elevada
      p.joints.upperArm_L.rotation.z = 0.22;
      p.joints.upperArm_R.rotation.z = -0.22;
    }
  }

  private captureBasePose(): void {
    this.base.clear();
    this.basePos.clear();
    if (!this.patient) return;
    for (const j of Object.values(this.patient.joints)) {
      this.base.set(j, j.rotation.clone());
      this.basePos.set(j, j.position.clone());
    }
    for (const x of [this.patient.parts.chestShell, this.patient.parts.abdomenShell]) {
      this.basePos.set(x, x.position.clone());
    }
  }

  private buildRescuer(): void {
    if (!this.patient) return;
    const g = new THREE.Group();
    const glove = new THREE.MeshStandardMaterial({ color: "#7e57c2", roughness: 0.5 });
    const sleeve = new THREE.MeshStandardMaterial({ color: "#0d47a1", roughness: 0.8 });
    const s = this.patient.dims.height / 1.7;
    const handGeo = new THREE.SphereGeometry(0.045 * s, 12, 10);
    const armGeo = new THREE.CapsuleGeometry(0.035 * s, 0.45 * s, 4, 10);
    for (const dx of [-0.015, 0.015]) {
      const hnd = new THREE.Mesh(handGeo, glove);
      hnd.scale.set(1.3, 0.55, 1.1);
      hnd.position.set(dx * s, 0.03 * s, 0);
      g.add(hnd);
    }
    for (const dx of [-0.05, 0.05]) {
      const arm = new THREE.Mesh(armGeo, sleeve);
      arm.position.set(dx * s, 0.28 * s, 0);
      g.add(arm);
    }
    g.visible = false;
    g.name = "rescuerHands";
    g.userData.dispose = () => {
      handGeo.dispose();
      armGeo.dispose();
      glove.dispose();
      sleeve.dispose();
    };
    this.patient.anchors.chestCenter.add(g);
    this.rescuer = g;
  }

  private unloadContent(): void {
    if (this.rescuer) {
      (this.rescuer.userData.dispose as () => void)();
      this.rescuer.removeFromParent();
      this.rescuer = null;
    }
    this.devices?.dispose();
    this.devices = null;
    if (this.patient) {
      this.scene.remove(this.patient.root);
      this.patient.dispose();
      this.patient = null;
    }
    if (this.env) {
      this.scene.remove(this.env.group);
      this.env.dispose();
      this.env = null;
    }
    this.monitorMat?.dispose();
    this.monitorMat = null;
    this.monitorTex?.dispose();
    this.monitorTex = null;
  }

  // ------------------------------------------------------------------ estado vindo do motor
  setVisualState(vs: VisualState): void {
    this.vs = vs;
    this.devices?.sync(vs.activeDevices);
    if (this.env?.monitorScreen) this.env.monitorScreen.visible = vs.activeDevices.includes("monitor_ecg") || vs.activeDevices.includes("pas_desfibrilador");
  }

  /** Mostra a tela ao vivo do monitor (canvas desenhado pela interface). */
  setMonitorCanvas(c: HTMLCanvasElement | null): void {
    if (!this.monitorMat) return;
    this.monitorTex?.dispose();
    this.monitorTex = c ? new THREE.CanvasTexture(c) : null;
    if (this.monitorTex) this.monitorTex.colorSpace = THREE.SRGBColorSpace;
    this.monitorMat.map = this.monitorTex;
    this.monitorMat.needsUpdate = true;
  }

  speak(seconds: number): void {
    this.speakUntil = this.time + seconds;
  }

  setQuality(q: Quality): void {
    this.quality = q;
    const cfg = QUALITY[q];
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cfg.pixelRatio));
    this.renderer.shadowMap.enabled = cfg.shadows;
    (this.lights[1] as THREE.DirectionalLight).castShadow = cfg.shadows;
    this.resize();
  }

  // ------------------------------------------------------------------ câmera
  setPreset(p: CameraPreset, instant = false): void {
    if (!this.patient || !this.env) return;
    const A = this.patient.anchors;
    const wp = (o: THREE.Object3D) => o.getWorldPosition(new THREE.Vector3());
    this.patient.root.updateMatrixWorld(true);
    let target: THREE.Vector3;
    let offset: THREE.Vector3;
    const s = this.patient.dims.height / 1.7;
    const sitting = this.env.patientMode === "sentado";
    switch (p) {
      case "face":
        target = wp(A.face);
        offset = sitting ? new THREE.Vector3(0.1, 0.05, 0.6) : new THREE.Vector3(0.25, 0.55, 0.35);
        break;
      case "torax":
        target = wp(A.chestCenter);
        offset = sitting ? new THREE.Vector3(0.2, 0.1, 0.9) : new THREE.Vector3(0.45, 0.8, 0.45);
        break;
      case "abdome":
        target = wp(A.abdomen);
        offset = sitting ? new THREE.Vector3(0.2, 0.05, 0.9) : new THREE.Vector3(0.5, 0.85, 0.4);
        break;
      case "membros":
        target = wp(A.shin_L).lerp(wp(A.forearm_L), 0.4);
        offset = sitting ? new THREE.Vector3(0.6, 0.2, 1.1) : new THREE.Vector3(1.0, 0.9, 0.9);
        break;
      default:
        target = this.env.cameraTarget.clone();
        offset = sitting ? new THREE.Vector3(0.9, 0.5, 2.0) : new THREE.Vector3(1.6, 1.2, 1.9);
    }
    offset.multiplyScalar(Math.max(0.38, s));
    const to = target.clone().add(offset);
    this.clampToRoom(to);
    if (instant || this.opts.reducedMotion) {
      this.camera.position.copy(to);
      this.controls.target.copy(target);
      this.controls.update();
      this.camAnim = null;
    } else {
      this.camAnim = { from: this.camera.position.clone(), to, tFrom: this.controls.target.clone(), tTo: target, t: 0 };
    }
  }

  private clampToRoom(v: THREE.Vector3): void {
    if (!this.env) return;
    const b = this.env.bounds;
    v.x = THREE.MathUtils.clamp(v.x, b.minX + 0.15, b.maxX - 0.15);
    v.z = THREE.MathUtils.clamp(v.z, b.minZ + 0.15, b.maxZ);
    v.y = THREE.MathUtils.clamp(v.y, 0.3, b.maxY - 0.1);
  }

  // ------------------------------------------------------------------ seleção por raycast
  private onPointerDown = (e: PointerEvent) => {
    this.pointerDown = { x: e.clientX, y: e.clientY, t: performance.now() };
  };

  private onPointerUp = (e: PointerEvent) => {
    const d = this.pointerDown;
    this.pointerDown = null;
    if (!d) return;
    // toque curto sem arraste = seleção; arraste = câmera (evita seleção acidental)
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 8 || performance.now() - d.t > 450) return;
    const id = this.pick(e.clientX, e.clientY);
    if (id) this.opts.onRegionSelected?.(id);
  };

  pick(clientX: number, clientY: number): string | null {
    if (!this.patient) return null;
    const rect = this.canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, this.camera);
    const hits = ray.intersectObjects(this.patient.regions, false);
    if (hits.length === 0) return null;
    const nearest = hits[0]!.distance;
    // entre volumes próximos do primeiro impacto, preferir o mais específico (prioridade maior)
    const candidates = hits.filter((h) => h.distance - nearest < 0.06);
    candidates.sort((a, b) => (b.object.userData.priority ?? 0) - (a.object.userData.priority ?? 0));
    const best = candidates[0]!;
    this.marker.position.copy(best.point);
    this.marker.lookAt(this.camera.position);
    this.marker.visible = true;
    this.markerT = 1.2;
    return best.object.userData.regionId as string;
  }

  /** Para testes: posição em tela (px) de uma região, a partir de sua posição no mundo. */
  regionScreenPosition(regionId: string): { x: number; y: number } | null {
    const m = this.patient?.regions.find((r) => r.userData.regionId === regionId);
    if (!m) return null;
    const v = m.getWorldPosition(new THREE.Vector3()).project(this.camera);
    const rect = this.canvas.getBoundingClientRect();
    return { x: rect.left + ((v.x + 1) / 2) * rect.width, y: rect.top + ((1 - v.y) / 2) * rect.height };
  }

  // ------------------------------------------------------------------ laço
  start(): void {
    if (this.running || this.disposed) return;
    this.running = true;
    this.lastT = performance.now();
    const loop = (t: number) => {
      if (!this.running) return;
      this.raf = requestAnimationFrame(loop);
      const dt = Math.min(0.1, (t - this.lastT) / 1000);
      this.lastT = t;
      this.frameTimes.push(dt);
      if (this.frameTimes.length > 120) this.frameTimes.shift();
      this.update(dt);
      if (!this.contextLost) this.renderer.render(this.scene, this.camera);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  stats(): { fps: number; calls: number; triangles: number; geometries: number; textures: number } {
    const avg = this.frameTimes.reduce((a, b) => a + b, 0) / Math.max(1, this.frameTimes.length);
    const info = this.renderer.info;
    return { fps: avg > 0 ? Math.round(1 / avg) : 0, calls: info.render.calls, triangles: info.render.triangles, geometries: info.memory.geometries, textures: info.memory.textures };
  }

  private onVisibility = () => {
    if (document.hidden) this.stop();
    else this.start();
  };

  private onLost = (e: Event) => {
    e.preventDefault();
    this.contextLost = true;
    this.stop();
    this.opts.onContextLost?.();
  };

  private onRestored = () => {
    this.contextLost = false;
    this.opts.onContextRestored?.();
    this.start();
  };

  resize(): void {
    const w = this.canvas.clientWidth || 1;
    const h = this.canvas.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private resetPose(): void {
    for (const [o, e] of this.base) o.rotation.copy(e);
    for (const [o, p] of this.basePos) o.position.copy(p);
  }

  private rot(j: JointName, x = 0, y = 0, z = 0): void {
    const o = this.patient!.joints[j];
    o.rotation.x += x;
    o.rotation.y += y;
    o.rotation.z += z;
  }

  private update(dt: number): void {
    this.time += dt;
    if (this.camAnim) {
      this.camAnim.t = Math.min(1, this.camAnim.t + dt / 0.7);
      const k = this.camAnim.t * this.camAnim.t * (3 - 2 * this.camAnim.t);
      this.camera.position.lerpVectors(this.camAnim.from, this.camAnim.to, k);
      this.controls.target.lerpVectors(this.camAnim.tFrom, this.camAnim.tTo, k);
      if (this.camAnim.t >= 1) this.camAnim = null;
    }
    this.controls.update();
    this.clampToRoom(this.camera.position);
    if (this.monitorTex) this.monitorTex.needsUpdate = true;
    if (this.markerT > 0) {
      this.markerT -= dt;
      (this.marker.material as THREE.MeshBasicMaterial).opacity = Math.max(0, Math.min(1, this.markerT));
      if (this.markerT <= 0) this.marker.visible = false;
    }
    const p = this.patient;
    const vs = this.vs;
    if (!p || !vs) return;
    this.resetPose();
    const motion = this.opts.reducedMotion ? 0.4 : 1;
    const cpr = vs.activeProcedures.includes("rcp");
    const unconscious = vs.consciousnessVisualState === "irresponsivo";

    // --- respiração (frequência e amplitude vindas do motor; apneia interrompe) ---
    const rr = vs.isBreathing ? vs.respiratoryRatePerMinute : 0;
    this.breathPhase += dt * (rr / 60) * Math.PI * 2;
    const ampBase = vs.isBreathing ? 0.018 + vs.respiratoryEffortLevel * 0.014 : 0;
    const b = Math.sin(this.breathPhase) * ampBase * motion;
    const ventilated = vs.activeDevices.includes("bvm") || vs.activeDevices.includes("tot");
    const bv = !vs.isBreathing && ventilated && !cpr ? Math.max(0, Math.sin(this.time * Math.PI * 2 * (10 / 60))) * 0.02 : 0;
    p.parts.chestShell.scale.set(1 + (b + bv) * 0.35, 1 + (b + bv) * 0.15, 1 + (b + bv));
    p.parts.abdomenShell.scale.set(1, 1, 1 + (vs.respiratoryEffortLevel >= 2 ? -b * 0.9 : b * 0.7));
    if (vs.respiratoryEffortLevel >= 1.5 && vs.isBreathing) {
      // musculatura acessória: elevação dos ombros na inspiração
      const lift = Math.max(0, b) * 1.4;
      p.joints.shoulder_L.position.y += lift * p.dims.torsoLen * 0.5;
      p.joints.shoulder_R.position.y += lift * p.dims.torsoLen * 0.5;
      this.rot("head", -Math.max(0, b) * 2);
    }

    // --- RCP: compressões ~110/min com mãos do socorrista ---
    if (this.rescuer) this.rescuer.visible = cpr;
    if (cpr) {
      const c = Math.max(0, Math.sin(this.time * Math.PI * 2 * (110 / 60)));
      p.parts.chestShell.scale.z = 1 - c * 0.12;
      if (this.rescuer) this.rescuer.position.set(0, 0, -c * p.dims.chestDepth * 0.25);
    }

    // --- consciência, olhos e piscamento ---
    let lid = 0; // 0 aberto, 1 fechado
    if (unconscious) lid = 1;
    else if (vs.consciousnessVisualState === "sonolento") lid = 0.6;
    this.blinkTimer -= dt;
    if (this.blinkTimer <= 0 && !unconscious) {
      this.blinkT = 0.16;
      this.blinkTimer = 2.5 + ((this.time * 7.3) % 3);
    }
    if (this.blinkT > 0) {
      this.blinkT -= dt;
      lid = Math.max(lid, 1);
    }
    if (vs.seizure) lid = 0.1;
    for (const l of p.parts.eyelids) l.rotation.x = THREE.MathUtils.lerp(l.userData.openRot, l.userData.closedRot, lid);
    const saccade = unconscious ? 0 : Math.sin(this.time * 0.7) * 0.15 + (Math.sin(this.time * 3.1) > 0.97 ? 0.2 : 0);
    for (const pu of p.parts.pupils) pu.rotation.y = saccade * motion;
    if (vs.seizure) for (const pu of p.parts.pupils) pu.rotation.x = -0.5;

    // --- fala (mandíbula/lábios) ---
    if (this.time < this.speakUntil && vs.speechState !== "nenhuma") {
      this.rot("jaw", 0.12 * Math.abs(Math.sin(this.time * 13)) * motion);
    }
    if (unconscious) this.rot("jaw", 0.08);

    // --- tosse ---
    if (vs.cough && !unconscious) {
      this.nextCough -= dt;
      if (this.nextCough <= 0) {
        this.coughT = 0.55;
        this.nextCough = 5 + ((this.time * 3.7) % 4);
      }
    }
    if (this.coughT > 0) {
      this.coughT -= dt;
      const k = Math.sin((1 - this.coughT / 0.55) * Math.PI);
      this.rot("chest", 0.12 * k);
      this.rot("head", 0.18 * k);
      this.rot("jaw", 0.2 * k);
    }

    // --- dor / postura antálgica ---
    const pain = { nenhuma: 0, leve: 0.25, moderada: 0.6, intensa: 1 }[vs.painVisualState];
    if (pain > 0) {
      p.parts.browL.rotation.z = 0.25 * pain;
      p.parts.browR.rotation.z = -0.25 * pain;
    } else {
      p.parts.browL.rotation.z = -0.1;
      p.parts.browR.rotation.z = 0.1;
    }
    if (vs.posture === "antalgica" || pain >= 0.6) {
      this.rot("thigh_L", -0.35 * pain);
      this.rot("thigh_R", -0.35 * pain);
      this.rot("shin_L", 0.6 * pain);
      this.rot("shin_R", 0.6 * pain);
    }
    if (vs.posture === "fowler") this.rot("spineLumbar", -0.45);

    // --- inconsciente: cabeça lateralizada, membros relaxados ---
    if (unconscious && !vs.seizure) {
      this.rot("head", 0, 0.35, 0);
    }

    // --- agitação e tremor (ruído determinístico pelo tempo) ---
    if (vs.agitation && !unconscious) {
      this.rot("head", Math.sin(this.time * 2.3) * 0.12 * motion, Math.sin(this.time * 1.7) * 0.25 * motion);
      this.rot("upperArm_L", Math.sin(this.time * 2.9) * 0.3 * motion);
      this.rot("upperArm_R", Math.sin(this.time * 3.3 + 1) * 0.3 * motion);
    }
    if (vs.tremor) {
      const tr = Math.sin(this.time * 55) * 0.04 * motion;
      this.rot("hand_L", tr);
      this.rot("hand_R", -tr);
      this.rot("forearm_L", tr * 0.5);
    }

    // --- convulsão (somente quando definida pelo motor) ---
    if (vs.seizure) {
      const f = Math.sin(this.time * Math.PI * 2 * 4.5) * motion;
      this.rot("upperArm_L", f * 0.35, 0, f * 0.1);
      this.rot("upperArm_R", -f * 0.35, 0, f * 0.1);
      this.rot("forearm_L", -0.9 + f * 0.3);
      this.rot("forearm_R", -0.9 - f * 0.3);
      this.rot("thigh_L", f * 0.15);
      this.rot("thigh_R", -f * 0.15);
      this.rot("head", f * 0.12, f * 0.1);
      this.rot("jaw", 0.05 + Math.abs(f) * 0.05);
    }

    // --- pele: palidez, cianose (lábios/leito ungueal/perioral), icterícia, sudorese ---
    const skin = p.materials.skin;
    skin.color.copy(p.baseSkin).lerp(PALE_TINT, vs.skinFindings.pallor * 0.28);
    skin.roughness = vs.skinFindings.sweating ? 0.28 : 0.62;
    const lipBase = p.baseSkin.clone().lerp(new THREE.Color("#9c4a4a"), 0.45);
    p.materials.lips.color.copy(lipBase).lerp(PALE_TINT, vs.skinFindings.pallor * 0.35).lerp(CYAN_TINT, vs.skinFindings.cyanosis * 0.75);
    const nailBase = p.baseSkin.clone().lerp(new THREE.Color("#e8b4b0"), 0.5);
    p.materials.nails.color.copy(nailBase).lerp(CYAN_TINT, vs.skinFindings.cyanosis * 0.8);
    p.materials.sclera.color.set(vs.skinFindings.jaundice ? JAUNDICE : "#f4f1ea");
    p.parts.sweat.visible = vs.skinFindings.sweating;
    p.parts.urticaria.visible = vs.skinFindings.urticaria || vs.skinFindings.rash;
    p.parts.lipsMesh.scale.set(vs.skinFindings.angioedema ? 1.25 : 1, vs.skinFindings.angioedema ? 0.62 : 0.42, vs.skinFindings.angioedema ? 0.85 : 0.6);
    for (const leg of p.parts.lowerLegs) leg.scale.set(vs.skinFindings.edema ? 1.25 : 1, 1, vs.skinFindings.edema ? 1.25 : 1);
    p.parts.blood.visible = vs.skinFindings.bleeding;
  }

  dispose(): void {
    this.disposed = true;
    this.stop();
    this.unloadContent();
    this.canvas.removeEventListener("webglcontextlost", this.onLost);
    this.canvas.removeEventListener("webglcontextrestored", this.onRestored);
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointerup", this.onPointerUp);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.marker.geometry.dispose();
    (this.marker.material as THREE.Material).dispose();
    this.controls.dispose();
    this.renderer.dispose();
  }

  get environment(): EnvironmentId | null {
    return this.envId;
  }
}
