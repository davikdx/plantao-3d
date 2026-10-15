/**
 * Seis ambientes gerados por código a partir de componentes modulares reutilizáveis
 * (leito, monitor, suporte de soro, painel de O₂, carro de emergência, mobiliário).
 * Nenhum arquivo externo. Geometrias compartilhadas por ambiente e descartadas em dispose().
 */
import * as THREE from "three";
import type { EnvironmentId } from "../domain/resources";

export interface EnvironmentBuild {
  group: THREE.Group;
  /** ponto onde a pelve do paciente é posicionada */
  patientOrigin: THREE.Vector3;
  patientMode: "supino" | "sentado" | "berco";
  /** tela do monitor que recebe CanvasTexture ao vivo */
  monitorScreen: THREE.Mesh | null;
  cameraTarget: THREE.Vector3;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number; maxY: number };
  dispose(): void;
}

class Kit {
  geos: THREE.BufferGeometry[] = [];
  mats = new Map<string, THREE.MeshStandardMaterial>();
  mat(color: string, opts: Partial<THREE.MeshStandardMaterialParameters> = {}): THREE.MeshStandardMaterial {
    const key = color + JSON.stringify(opts);
    let m = this.mats.get(key);
    if (!m) {
      m = new THREE.MeshStandardMaterial({ color, roughness: 0.7, ...opts });
      this.mats.set(key, m);
    }
    return m;
  }
  box(parent: THREE.Object3D, w: number, h: number, d: number, color: string, x: number, y: number, z: number, opts: Partial<THREE.MeshStandardMaterialParameters> = {}): THREE.Mesh {
    const geo = new THREE.BoxGeometry(w, h, d);
    this.geos.push(geo);
    const m = new THREE.Mesh(geo, this.mat(color, opts));
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  cyl(parent: THREE.Object3D, rt: number, rb: number, h: number, color: string, x: number, y: number, z: number, opts: Partial<THREE.MeshStandardMaterialParameters> = {}): THREE.Mesh {
    const geo = new THREE.CylinderGeometry(rt, rb, h, 16);
    this.geos.push(geo);
    const m = new THREE.Mesh(geo, this.mat(color, opts));
    m.position.set(x, y, z);
    m.castShadow = true;
    parent.add(m);
    return m;
  }
  sphere(parent: THREE.Object3D, r: number, color: string, x: number, y: number, z: number, opts: Partial<THREE.MeshStandardMaterialParameters> = {}): THREE.Mesh {
    const geo = new THREE.SphereGeometry(r, 16, 12);
    this.geos.push(geo);
    const m = new THREE.Mesh(geo, this.mat(color, opts));
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  }
  dispose(): void {
    this.geos.forEach((g) => g.dispose());
    this.mats.forEach((m) => m.dispose());
  }
}

function room(k: Kit, g: THREE.Group, w: number, d: number, h: number, wall: string, floor: string): void {
  const fl = k.box(g, w, 0.05, d, floor, 0, -0.025, 0, { roughness: 0.9 });
  fl.castShadow = false;
  const back = k.box(g, w, h, 0.08, wall, 0, h / 2, -d / 2, { roughness: 0.95 });
  back.castShadow = false;
  const left = k.box(g, 0.08, h, d, wall, -w / 2, h / 2, 0, { roughness: 0.95 });
  left.castShadow = false;
  const right = k.box(g, 0.08, h, d, wall, w / 2, h / 2, 0, { roughness: 0.95 });
  right.castShadow = false;
  // rodapé
  k.box(g, w, 0.1, 0.02, "#7d8a96", 0, 0.05, -d / 2 + 0.05);
  // luminárias de teto
  for (const x of [-w / 4, w / 4]) k.box(g, 0.9, 0.04, 0.4, "#ffffff", x, h - 0.02, 0, { emissive: new THREE.Color("#ffffff"), emissiveIntensity: 0.6 });
}

/** Leito/maca hospitalar com grades. Retorna altura do colchão. */
function bed(k: Kit, g: THREE.Group, x: number, z: number, length: number, opts: { rails?: boolean; color?: string; height?: number; width?: number } = {}): number {
  const h = opts.height ?? 0.7;
  const w = opts.width ?? 0.9;
  const frame = opts.color ?? "#c9ced6";
  k.box(g, w, 0.08, length, frame, x, h - 0.12, z, { metalness: 0.5, roughness: 0.4 });
  k.box(g, w - 0.04, 0.14, length - 0.04, "#e8eef4", x, h - 0.03, z, { roughness: 0.9 }); // colchão
  for (const dx of [-w / 2 + 0.06, w / 2 - 0.06]) for (const dz of [-length / 2 + 0.08, length / 2 - 0.08]) {
    k.cyl(g, 0.025, 0.025, h - 0.16, "#8c939c", x + dx, (h - 0.16) / 2, z + dz, { metalness: 0.6, roughness: 0.4 });
    k.sphere(g, 0.045, "#2b2b2b", x + dx, 0.045, z + dz);
  }
  // cabeceira elevada e pés
  k.box(g, w, 0.45, 0.05, frame, x, h + 0.1, z - length / 2, { metalness: 0.4 });
  if (opts.rails !== false) k.box(g, w, 0.3, 0.05, frame, x, h + 0.02, z + length / 2, { metalness: 0.4 });
  if (opts.rails !== false) {
    for (const dx of [-w / 2, w / 2]) {
      k.box(g, 0.02, 0.02, length * 0.55, "#9aa3ad", x + dx, h + 0.2, z - length * 0.1, { metalness: 0.6 });
      k.box(g, 0.02, 0.02, length * 0.55, "#9aa3ad", x + dx, h + 0.08, z - length * 0.1, { metalness: 0.6 });
    }
  }
  return h + 0.04;
}

function ivPole(k: Kit, g: THREE.Group, x: number, z: number): void {
  k.cyl(g, 0.015, 0.015, 1.9, "#b8c0c8", x, 0.95, z, { metalness: 0.7, roughness: 0.3 });
  k.cyl(g, 0.25, 0.25, 0.03, "#58616b", x, 0.03, z);
  k.box(g, 0.4, 0.015, 0.015, "#b8c0c8", x, 1.88, z, { metalness: 0.7 });
  k.box(g, 0.12, 0.22, 0.04, "#e6f3ff", x + 0.15, 1.7, z, { transparent: true, opacity: 0.75, roughness: 0.2 });
}

function monitor(k: Kit, g: THREE.Group, x: number, y: number, z: number, rotY: number): THREE.Mesh {
  const grp = new THREE.Group();
  grp.position.set(x, y, z);
  grp.rotation.y = rotY;
  g.add(grp);
  k.box(grp, 0.48, 0.36, 0.08, "#2f3640", 0, 0, 0, { roughness: 0.5 });
  const geo = new THREE.PlaneGeometry(0.42, 0.28);
  k.geos.push(geo);
  const screen = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: "#05080c" }));
  screen.position.set(0, 0.01, 0.041);
  screen.name = "monitorScreen";
  grp.add(screen);
  k.box(grp, 0.05, 0.4, 0.05, "#7a838d", 0, -0.38, -0.05, { metalness: 0.5 });
  return screen;
}

function oxygenPanel(k: Kit, g: THREE.Group, x: number, z: number): void {
  k.box(g, 1.4, 0.18, 0.08, "#dfe6ec", x, 1.45, z);
  k.cyl(g, 0.03, 0.03, 0.1, "#2e7d32", x - 0.4, 1.45, z + 0.08); // O₂ (verde, padrão de cor de gases medicinais)
  k.cyl(g, 0.03, 0.03, 0.1, "#f5f5f5", x - 0.2, 1.45, z + 0.08); // ar comprimido
  k.cyl(g, 0.03, 0.03, 0.1, "#fbc02d", x, 1.45, z + 0.08); // vácuo
  k.cyl(g, 0.04, 0.03, 0.18, "#c8e6c9", x - 0.4, 1.32, z + 0.1, { transparent: true, opacity: 0.8 }); // fluxômetro
}

function crashCart(k: Kit, g: THREE.Group, x: number, z: number): void {
  k.box(g, 0.6, 0.95, 0.5, "#c62828", x, 0.5, z, { roughness: 0.5 });
  for (let i = 0; i < 4; i++) k.box(g, 0.56, 0.02, 0.02, "#ffcdd2", x, 0.2 + i * 0.2, z + 0.26);
  k.box(g, 0.4, 0.15, 0.3, "#37474f", x, 1.05, z, { roughness: 0.5 }); // desfibrilador
  k.box(g, 0.18, 0.1, 0.01, "#1b5e20", x - 0.05, 1.07, z + 0.151, { emissive: new THREE.Color("#1b5e20"), emissiveIntensity: 0.5 });
}

function cabinet(k: Kit, g: THREE.Group, x: number, z: number, w: number, color = "#eceff1"): void {
  k.box(g, w, 0.9, 0.5, color, x, 0.45, z);
  k.box(g, w, 0.03, 0.55, "#b0bec5", x, 0.915, z);
  k.box(g, w, 0.6, 0.3, color, x, 1.8, z - 0.1);
}

function chair(k: Kit, g: THREE.Group, x: number, z: number, rotY = 0, color = "#455a64"): void {
  const grp = new THREE.Group();
  grp.position.set(x, 0, z);
  grp.rotation.y = rotY;
  g.add(grp);
  k.box(grp, 0.45, 0.06, 0.45, color, 0, 0.45, 0);
  k.box(grp, 0.45, 0.45, 0.05, color, 0, 0.7, -0.2);
  for (const dx of [-0.2, 0.2]) for (const dz of [-0.2, 0.2]) k.cyl(grp, 0.015, 0.015, 0.45, "#90a4ae", dx, 0.22, dz);
}

function desk(k: Kit, g: THREE.Group, x: number, z: number): void {
  k.box(g, 1.2, 0.04, 0.6, "#a1887f", x, 0.75, z);
  k.box(g, 0.04, 0.75, 0.6, "#8d6e63", x - 0.58, 0.375, z);
  k.box(g, 0.04, 0.75, 0.6, "#8d6e63", x + 0.58, 0.375, z);
  k.box(g, 0.45, 0.3, 0.03, "#263238", x + 0.2, 0.95, z - 0.15); // computador
}

function poster(k: Kit, g: THREE.Group, x: number, y: number, z: number, color: string): void {
  k.box(g, 0.5, 0.7, 0.01, "#fafafa", x, y, z);
  k.box(g, 0.4, 0.12, 0.012, color, x, y + 0.2, z + 0.002);
  for (let i = 0; i < 4; i++) k.box(g, 0.38, 0.025, 0.012, "#90a4ae", x, y - i * 0.08, z + 0.002);
}

export function buildEnvironment(env: EnvironmentId): EnvironmentBuild {
  const k = new Kit();
  const g = new THREE.Group();
  g.name = `env_${env}`;
  let origin = new THREE.Vector3(0, 0.78, 0);
  let mode: EnvironmentBuild["patientMode"] = "supino";
  let screen: THREE.Mesh | null = null;
  let target = new THREE.Vector3(0, 0.9, 0);
  let bounds = { minX: -3.5, maxX: 3.5, minZ: -2.8, maxZ: 3.2, maxY: 2.8 };

  switch (env) {
    case "emergencia": {
      room(k, g, 7, 6, 3, "#dfe9f0", "#9fb3c0");
      k.box(g, 7, 0.4, 0.02, "#c62828", 0, 1.1, -2.95); // faixa vermelha: sala vermelha
      const top = bed(k, g, 0, -0.2, 2.0);
      origin = new THREE.Vector3(0, top, -0.05);
      screen = monitor(k, g, 0.95, 1.7, -1.1, -0.5);
      ivPole(k, g, -0.8, -0.9);
      oxygenPanel(k, g, 0, -2.9);
      crashCart(k, g, 1.4, 0.6);
      cabinet(k, g, -2.6, -2.5, 1.4);
      k.box(g, 0.8, 0.02, 0.6, "#cfd8dc", -1.6, 1.0, 0.9); // bancada de preparo
      k.cyl(g, 0.3, 0.3, 0.05, "#fff8e1", 0, 2.85, -0.2, { emissive: new THREE.Color("#fff8e1"), emissiveIntensity: 0.9 }); // foco
      target = new THREE.Vector3(0, top + 0.1, -0.2);
      break;
    }
    case "consultorio": {
      room(k, g, 5, 4.5, 2.8, "#eef1e6", "#bcaaa4");
      // maca de exame sem grades, paciente sentado
      const top = bed(k, g, -0.6, -0.6, 1.8, { rails: false, color: "#90a4ae", height: 0.72, width: 0.65 });
      origin = new THREE.Vector3(-0.6, top, -0.1);
      mode = "sentado";
      desk(k, g, 1.3, -1.6);
      chair(k, g, 1.3, -0.9, Math.PI);
      cabinet(k, g, -1.9, -1.9, 0.9);
      screen = monitor(k, g, 0.4, 1.3, -1.9, 0); // monitor portátil (só exibe se instalado)
      ivPole(k, g, -1.4, -0.2);
      oxygenPanel(k, g, -0.6, -2.2);
      target = new THREE.Vector3(-0.6, 1.1, -0.1);
      bounds = { minX: -2.4, maxX: 2.4, minZ: -2.1, maxZ: 2.6, maxY: 2.6 };
      break;
    }
    case "ambulancia": {
      // compartimento estreito com teto arredondado
      const w = 2.0;
      const d = 4.0;
      k.box(g, w, 0.05, d, "#90a4ae", 0, -0.025, 0);
      for (const sx of [-1, 1]) k.box(g, 0.06, 1.9, d, "#eceff1", (sx * w) / 2, 0.95, 0);
      k.box(g, w, 1.9, 0.06, "#eceff1", 0, 0.95, -d / 2);
      const ceilGeo = new THREE.CylinderGeometry(w / 2, w / 2, d, 24, 1, true, -Math.PI / 2, Math.PI);
      k.geos.push(ceilGeo);
      const ceil = new THREE.Mesh(ceilGeo, k.mat("#f5f5f5", { side: THREE.DoubleSide }));
      ceil.rotation.z = Math.PI / 2;
      ceil.rotation.y = Math.PI / 2;
      ceil.position.set(0, 1.9, 0);
      ceil.scale.set(1, 1, 0.25);
      g.add(ceil);
      k.box(g, 0.6, 0.05, d * 0.9, "#ffffff", 0, 2.05, 0, { emissive: new THREE.Color("#ffffff"), emissiveIntensity: 0.4 });
      const top = bed(k, g, -0.35, 0.2, 1.9, { color: "#fdd835", height: 0.6, width: 0.6 });
      origin = new THREE.Vector3(-0.35, top, 0.35);
      k.box(g, 0.5, 0.45, 2.2, "#1565c0", 0.7, 0.23, 0.4); // banco lateral
      for (let i = 0; i < 4; i++) k.box(g, 0.35, 0.3, 0.45, "#e3f2fd", 0.8, 1.35, -1.4 + i * 0.5); // armários
      screen = monitor(k, g, 0.75, 1.55, -1.6, -0.4);
      k.cyl(g, 0.09, 0.09, 0.9, "#2e7d32", -0.85, 0.5, -1.7); // cilindro de O₂
      k.box(g, 0.9, 0.08, 0.04, "#d32f2f", 0, 1.8, -1.97); // faixa SAMU (sem logotipo)
      target = new THREE.Vector3(-0.35, top + 0.1, 0.1);
      bounds = { minX: -0.85, maxX: 0.85, minZ: -1.8, maxZ: 3.5, maxY: 1.85 };
      break;
    }
    case "pediatria": {
      room(k, g, 5.5, 5, 2.8, "#e3f2fd", "#a5d6a7");
      for (let i = 0; i < 6; i++) k.box(g, 0.6, 0.6, 0.01, ["#ffcc80", "#80deea", "#ce93d8", "#a5d6a7", "#fff59d", "#ef9a9a"][i]!, -2 + i * 0.8, 1.6, -2.45);
      const top = bed(k, g, 0, -0.4, 1.2, { color: "#81d4fa", height: 0.85, width: 0.7 });
      origin = new THREE.Vector3(0, top, -0.4);
      mode = "berco";
      screen = monitor(k, g, 0.8, 1.6, -1.2, -0.4);
      ivPole(k, g, -0.7, -0.8);
      oxygenPanel(k, g, 0, -2.45);
      crashCart(k, g, 1.6, 0.4);
      chair(k, g, -1.4, 0.2, 0.6, "#7986cb"); // cadeira do acompanhante
      target = new THREE.Vector3(0, top + 0.05, -0.4);
      break;
    }
    case "obstetricia": {
      room(k, g, 6, 5.5, 2.9, "#fce4ec", "#b0bec5");
      const top = bed(k, g, 0, -0.3, 2.0, { color: "#b39ddb" });
      origin = new THREE.Vector3(0, top, -0.15);
      // apoios de pernas
      for (const sx of [-0.35, 0.35]) k.box(g, 0.12, 0.05, 0.35, "#7e57c2", sx, top + 0.25, 0.75);
      screen = monitor(k, g, 1.0, 1.6, -1.1, -0.5);
      k.box(g, 0.4, 0.35, 0.3, "#eceff1", -1.1, 1.1, -1.0); // cardiotocógrafo
      k.box(g, 0.7, 0.9, 0.5, "#e0f7fa", 2.0, 0.45, 0.6); // berço aquecido do RN
      k.box(g, 0.75, 0.05, 0.55, "#ffcc80", 2.0, 1.3, 0.6, { emissive: new THREE.Color("#ff9800"), emissiveIntensity: 0.4 });
      ivPole(k, g, -0.85, -0.6);
      oxygenPanel(k, g, 0, -2.7);
      crashCart(k, g, -2.2, 0.3);
      target = new THREE.Vector3(0, top + 0.15, -0.15);
      break;
    }
    case "ubs": {
      room(k, g, 5, 4.5, 2.7, "#f1f8e9", "#d7ccc8");
      const top = bed(k, g, -1.2, -0.9, 1.8, { rails: false, color: "#a5d6a7", height: 0.7, width: 0.65 });
      origin = new THREE.Vector3(-1.2, top, -0.4);
      mode = "sentado";
      desk(k, g, 1.0, -1.5);
      chair(k, g, 1.0, -0.85, Math.PI);
      chair(k, g, 0.6, 0.0, 0.3, "#81c784");
      k.box(g, 0.35, 0.06, 0.35, "#eeeeee", 2.0, 0.03, 0.6); // balança
      k.cyl(g, 0.02, 0.02, 1.2, "#bdbdbd", 2.0, 0.6, 0.45);
      poster(k, g, -0.2, 1.6, -2.2, "#43a047");
      poster(k, g, 0.5, 1.6, -2.2, "#1e88e5");
      cabinet(k, g, -2.1, 0.5, 0.8);
      k.box(g, 1.1, 0.8, 0.02, "#b3e5fc", 2.45, 1.6, -0.5, { emissive: new THREE.Color("#b3e5fc"), emissiveIntensity: 0.4 }); // janela
      screen = null;
      target = new THREE.Vector3(-1.2, 1.05, -0.4);
      bounds = { minX: -2.4, maxX: 2.4, minZ: -2.1, maxZ: 2.6, maxY: 2.5 };
      break;
    }
  }
  return {
    group: g,
    patientOrigin: origin,
    patientMode: mode,
    monitorScreen: screen,
    cameraTarget: target,
    bounds,
    dispose: () => k.dispose()
  };
}
