/**
 * Dispositivos clínicos visíveis, presos às âncoras do paciente (acompanham o corpo).
 * Exibidos somente quando o motor informa que estão instalados (sem aparelhos decorativos).
 */
import * as THREE from "three";
import type { DeviceId } from "../domain/resources";
import type { PatientModel } from "./PatientModelFactory";

export interface DeviceSet {
  sync(active: DeviceId[]): void;
  dispose(): void;
}

export function createDeviceSet(model: PatientModel): DeviceSet {
  const geos: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];
  const objects = new Map<DeviceId, THREE.Object3D>();
  const s = model.dims.height / 1.7; // escala relativa ao adulto de referência
  const r = model.dims.headR;

  const mat = (color: string, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.5, ...opts });
    mats.push(m);
    return m;
  };
  const M = {
    white: mat("#f5f5f5"),
    clear: mat("#dfeff7", { transparent: true, opacity: 0.55, roughness: 0.1 }),
    green: mat("#43a047", { transparent: true, opacity: 0.7 }),
    blue: mat("#1e88e5"),
    gray: mat("#607d8b"),
    red: mat("#e53935"),
    tube: mat("#cfe8f3", { transparent: true, opacity: 0.85 }),
    yellow: mat("#fdd835"),
    black: mat("#263238"),
    orange: mat("#fb8c00")
  };
  const add = (parent: THREE.Object3D, geo: THREE.BufferGeometry, m: THREE.Material, pos: [number, number, number] = [0, 0, 0], rot: [number, number, number] = [0, 0, 0], scale: [number, number, number] = [1, 1, 1]) => {
    geos.push(geo);
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(...pos);
    mesh.rotation.set(...rot);
    mesh.scale.set(...scale);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const tube = (parent: THREE.Object3D, points: THREE.Vector3[], radius: number, m: THREE.Material) => {
    const curve = new THREE.CatmullRomCurve3(points);
    return add(parent, new THREE.TubeGeometry(curve, 24, radius, 6, false), m);
  };
  const A = model.anchors;
  const J = model.joints;

  const builders: Record<DeviceId, () => THREE.Object3D> = {
    monitor_ecg: () => {
      const g = new THREE.Group();
      const pads: [THREE.Object3D, string][] = [
        [A.chestRight, "#ffffff"],
        [A.chestLeft, "#ffffff"],
        [A.chestLowerLeft, "#ffffff"]
      ];
      for (const [anchor] of pads) {
        const holder = new THREE.Group();
        anchor.add(holder);
        add(holder, new THREE.CylinderGeometry(0.018 * s, 0.018 * s, 0.006, 12), M.white, [0, 0.03 * s, 0], [Math.PI / 2, 0, 0]);
        add(holder, new THREE.SphereGeometry(0.006 * s, 6, 4), M.gray, [0, 0.03 * s, 0.006]);
        g.userData.extra = [...(g.userData.extra ?? []), holder];
      }
      return g;
    },
    oximetro: () => {
      const g = new THREE.Group();
      add(g, new THREE.BoxGeometry(0.03 * s, 0.035 * s, 0.025 * s), M.blue, [0, 0, 0]);
      add(g, new THREE.CylinderGeometry(0.002 * s, 0.002 * s, 0.25 * s, 6), M.gray, [0, 0.12 * s, -0.01 * s]);
      A.finger_L.add(g);
      return g;
    },
    manguito: () => {
      const g = new THREE.Group();
      const ua = J.upperArm_R;
      add(g, new THREE.CylinderGeometry(0.06 * s, 0.06 * s, 0.13 * s, 16, 1, true), M.black, [0, -model.dims.armLen * 0.2, 0]);
      ua.add(g);
      return g;
    },
    cateter_nasal: () => {
      const g = new THREE.Group();
      add(g, new THREE.TorusGeometry(r * 0.75, 0.0035 * s, 6, 24, Math.PI), M.tube, [0, -r * 0.05, -r * 0.55], [Math.PI / 2, 0, 0]);
      A.nose.add(g);
      return g;
    },
    mascara_reservatorio: () => {
      const g = new THREE.Group();
      add(g, new THREE.SphereGeometry(r * 0.5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.green, [0, 0, -r * 0.08], [Math.PI / 2, 0, 0], [0.85, 0.7, 1.15]);
      add(g, new THREE.SphereGeometry(r * 0.38, 12, 10), M.green, [0, -r * 0.85, r * 0.35], [0, 0, 0], [1, 1.2, 0.7]);
      A.face.add(g);
      return g;
    },
    nebulizador: () => {
      const g = new THREE.Group();
      add(g, new THREE.SphereGeometry(r * 0.48, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.clear, [0, 0, -r * 0.08], [Math.PI / 2, 0, 0], [0.85, 0.7, 1.1]);
      add(g, new THREE.CylinderGeometry(r * 0.1, r * 0.12, r * 0.35, 12), M.clear, [0, -r * 0.45, r * 0.25]);
      A.face.add(g);
      return g;
    },
    bvm: () => {
      const g = new THREE.Group();
      add(g, new THREE.SphereGeometry(r * 0.5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.clear, [0, 0, -r * 0.08], [Math.PI / 2, 0, 0], [0.85, 0.7, 1.1]);
      add(g, new THREE.CapsuleGeometry(r * 0.38, r * 1.1, 6, 12), M.blue, [0, r * 1.6, r * 0.55], [Math.PI / 2.2, 0, 0]);
      A.face.add(g);
      return g;
    },
    tot: () => {
      const g = new THREE.Group();
      tube(g, [new THREE.Vector3(0, 0, -r * 0.2), new THREE.Vector3(0, 0, r * 0.25), new THREE.Vector3(0, r * 0.2, r * 0.55), new THREE.Vector3(0, r * 0.7, r * 0.7)], 0.006 * s, M.tube);
      add(g, new THREE.TorusGeometry(r * 0.8, 0.004 * s, 6, 24), M.white, [0, 0, -r * 0.6], [Math.PI / 2, 0, 0]);
      add(g, new THREE.CylinderGeometry(0.012 * s, 0.012 * s, 0.03 * s, 10), M.blue, [0, r * 0.72, r * 0.72]);
      A.mouth.add(g);
      return g;
    },
    vni: () => {
      const g = new THREE.Group();
      add(g, new THREE.SphereGeometry(r * 0.62, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.clear, [0, r * 0.05, -r * 0.1], [Math.PI / 2, 0, 0], [0.9, 0.7, 1.35]);
      add(g, new THREE.TorusGeometry(r * 1.0, 0.006 * s, 6, 28), M.gray, [0, r * 0.1, -r * 0.8], [Math.PI / 2, 0, 0]);
      add(g, new THREE.CylinderGeometry(0.015 * s, 0.015 * s, 0.25 * s, 10), M.tube, [0, -r * 0.4, r * 0.4], [Math.PI / 3, 0, 0]);
      A.face.add(g);
      return g;
    },
    acesso_periferico: () => {
      const g = new THREE.Group();
      add(g, new THREE.BoxGeometry(0.035 * s, 0.05 * s, 0.004 * s), M.white, [0, 0, 0.002]);
      add(g, new THREE.CylinderGeometry(0.004 * s, 0.004 * s, 0.03 * s, 8), M.yellow, [0, 0.02 * s, 0.006]);
      A.forearm_L.add(g);
      return g;
    },
    equipo: () => {
      const g = new THREE.Group();
      tube(g, [new THREE.Vector3(0, 0.03 * s, 0.006), new THREE.Vector3(0, 0.15 * s, 0.05 * s), new THREE.Vector3(0.05 * s, 0.4 * s, 0.25 * s), new THREE.Vector3(0.1 * s, 0.7 * s, 0.6 * s)], 0.0025 * s, M.tube);
      A.forearm_L.add(g);
      return g;
    },
    acesso_io: () => {
      const g = new THREE.Group();
      add(g, new THREE.CylinderGeometry(0.012 * s, 0.012 * s, 0.03 * s, 10), M.red, [0, 0, 0.012 * s], [Math.PI / 2, 0, 0]);
      add(g, new THREE.BoxGeometry(0.05 * s, 0.05 * s, 0.004 * s), M.white, [0, 0, 0.002]);
      A.shin_R.add(g);
      return g;
    },
    acesso_central: () => {
      const g = new THREE.Group();
      add(g, new THREE.BoxGeometry(0.04 * s, 0.05 * s, 0.006 * s), M.white, [0, 0, 0]);
      for (let i = 0; i < 3; i++) add(g, new THREE.CylinderGeometry(0.003 * s, 0.003 * s, 0.07 * s, 6), [M.blue, M.red, M.white][i]!, [(i - 1) * 0.008 * s, -0.04 * s, 0.005 * s]);
      A.neckFront.add(g);
      return g;
    },
    dreno_torax: () => {
      const g = new THREE.Group();
      tube(g, [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.05 * s, -0.05 * s, 0), new THREE.Vector3(0.2 * s, -0.3 * s, 0.1 * s), new THREE.Vector3(0.35 * s, -0.7 * s, 0.2 * s)], 0.006 * s, M.tube);
      A.flank_L.add(g);
      return g;
    },
    tala: () => {
      const g = new THREE.Group();
      for (const sx of [-1, 1]) add(g, new THREE.BoxGeometry(0.012 * s, model.dims.legLen * 0.38, 0.05 * s), M.orange, [sx * 0.055 * s, 0, 0]);
      A.lowerLeg_R.add(g);
      return g;
    },
    colar_cervical: () => {
      const g = new THREE.Group();
      add(g, new THREE.CylinderGeometry(0.075 * s, 0.085 * s, 0.09 * s, 18, 1, true), M.orange, [0, 0, 0], [0, 0, 0], [1, 1, 0.9]);
      J.neck.add(g);
      g.position.y = model.dims.headR * 0.25;
      return g;
    },
    pas_desfibrilador: () => {
      const g = new THREE.Group();
      const p1 = new THREE.Group();
      A.chestRight.add(p1);
      add(p1, new THREE.BoxGeometry(0.1 * s, 0.12 * s, 0.006 * s), M.gray, [0, 0.04 * s, 0.004]);
      const p2 = new THREE.Group();
      A.chestLowerLeft.add(p2);
      add(p2, new THREE.BoxGeometry(0.1 * s, 0.12 * s, 0.006 * s), M.gray, [0.03 * s, 0, 0.004]);
      g.userData.extra = [p1, p2];
      return g;
    },
    sonda_vesical: () => {
      const g = new THREE.Group();
      tube(g, [new THREE.Vector3(0, -0.05 * s, 0), new THREE.Vector3(0.05 * s, -0.2 * s, 0.05 * s), new THREE.Vector3(0.25 * s, -0.35 * s, 0.2 * s)], 0.004 * s, M.yellow);
      A.pelvis.add(g);
      return g;
    },
    torniquete: () => {
      const g = new THREE.Group();
      add(g, new THREE.CylinderGeometry(0.055 * s, 0.055 * s, 0.04 * s, 16, 1, true), M.black, [0, model.dims.legLen * 0.15, 0]);
      A.lowerLeg_R.add(g);
      return g;
    },
    capnografo: () => {
      const g = new THREE.Group();
      add(g, new THREE.BoxGeometry(0.02 * s, 0.02 * s, 0.03 * s), M.black, [0, r * 0.35, r * 0.6]);
      A.mouth.add(g);
      return g;
    },
    cardiotoco: () => {
      const g = new THREE.Group();
      for (const dx of [-1, 1]) add(g, new THREE.CylinderGeometry(0.035 * s, 0.035 * s, 0.015 * s, 14), M.white, [dx * 0.06 * s, 0, 0.005], [Math.PI / 2, 0, 0]);
      // cinta ao redor do abdome: centrada no eixo do corpo (atrás da âncora frontal)
      const back = -A.abdomen.position.z * 0.55;
      add(g, new THREE.TorusGeometry(model.dims.hipHalf * 1.15, 0.006 * s, 6, 32), M.blue, [0, 0, back], [Math.PI / 2, 0, 0], [1, 1, (A.abdomen.position.z * 0.62) / (model.dims.hipHalf * 1.15)]);
      A.abdomen.add(g);
      return g;
    },
    curativo_compressivo: () => {
      const g = new THREE.Group();
      add(g, new THREE.CylinderGeometry(0.06 * s, 0.06 * s, 0.07 * s, 14, 1, true), M.white, [0, -model.dims.legLen * 0.05, 0]);
      A.lowerLeg_R.add(g);
      return g;
    }
  };

  function remove(id: DeviceId): void {
    const o = objects.get(id);
    if (!o) return;
    const extra = (o.userData.extra as THREE.Object3D[] | undefined) ?? [];
    for (const e of extra) e.removeFromParent();
    o.removeFromParent();
    objects.delete(id);
  }

  return {
    sync(active: DeviceId[]) {
      const want = new Set(active);
      for (const id of [...objects.keys()]) if (!want.has(id)) remove(id);
      for (const id of want) {
        if (objects.has(id)) continue;
        const b = builders[id];
        if (!b) continue;
        const o = b();
        o.name = `device_${id}`;
        if (!o.parent) A.chestCenter.add(o); // grupos que só referenciam âncoras extras
        objects.set(id, o);
      }
    },
    dispose() {
      for (const id of [...objects.keys()]) remove(id);
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
    }
  };
}
