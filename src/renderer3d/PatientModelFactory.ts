/**
 * PatientModelFactory — gera um paciente 3D ORIGINAL por código (sem arquivos externos).
 *
 * Convenções:
 *  - metros; modelo construído em pé, olhando para +Z, eixo Y para cima;
 *  - lado ESQUERDO do paciente = +X; lado direito = −X (lateralidade anatômica, não da tela);
 *  - hierarquia ARTICULADA de grupos (Object3D) com pivôs anatômicos. NÃO há SkinnedMesh/pesos de pele:
 *    cada segmento é uma malha suavizada rígida presa à articulação; juntas são cobertas por esferas.
 *  - zonas de interação são volumes invisíveis presos às articulações (ids semânticos estáveis),
 *    independentes de índices de vértices.
 */
import * as THREE from "three";
import type { PatientVisualProfile } from "../domain/schema";

export const JOINT_NAMES = [
  "root",
  "pelvis",
  "spineLumbar",
  "chest",
  "neck",
  "head",
  "jaw",
  "shoulder_L",
  "upperArm_L",
  "forearm_L",
  "hand_L",
  "shoulder_R",
  "upperArm_R",
  "forearm_R",
  "hand_R",
  "thigh_L",
  "shin_L",
  "foot_L",
  "thigh_R",
  "shin_R",
  "foot_R"
] as const;
export type JointName = (typeof JOINT_NAMES)[number];

export const ANCHOR_NAMES = [
  "nose",
  "mouth",
  "face",
  "neckFront",
  "chestCenter",
  "chestLeft",
  "chestRight",
  "chestLowerLeft",
  "abdomen",
  "forearm_L",
  "forearm_R",
  "finger_L",
  "finger_R",
  "shin_L",
  "shin_R",
  "flank_L",
  "lowerLeg_R",
  "pelvis"
] as const;
export type AnchorName = (typeof ANCHOR_NAMES)[number];

export interface PatientModel {
  root: THREE.Group;
  joints: Record<JointName, THREE.Object3D>;
  anchors: Record<AnchorName, THREE.Object3D>;
  regions: THREE.Mesh[];
  materials: {
    skin: THREE.MeshStandardMaterial;
    lips: THREE.MeshStandardMaterial;
    nails: THREE.MeshStandardMaterial;
    sclera: THREE.MeshStandardMaterial;
    gown: THREE.MeshStandardMaterial;
    hair: THREE.MeshStandardMaterial;
  };
  parts: {
    eyelids: THREE.Mesh[];
    pupils: THREE.Object3D[];
    chestShell: THREE.Object3D;
    abdomenShell: THREE.Object3D;
    belly: THREE.Mesh | null;
    urticaria: THREE.InstancedMesh;
    sweat: THREE.InstancedMesh;
    lowerLegs: THREE.Object3D[];
    lipsMesh: THREE.Mesh;
    browL: THREE.Mesh;
    browR: THREE.Mesh;
    blood: THREE.Mesh;
  };
  dims: { height: number; headR: number; shoulderHalf: number; hipHalf: number; chestDepth: number; torsoLen: number; legLen: number; armLen: number };
  baseSkin: THREE.Color;
  profile: PatientVisualProfile;
  dispose(): void;
}

/** Paleta de tons de pele (0 claro → 7 retinto) — diversidade brasileira, sem associação a doença. */
export const SKIN_TONES = ["#f6d7c3", "#ecc1a0", "#dca37f", "#c68a62", "#a86d47", "#8a5536", "#6b3f27", "#4a2a1a"];
const HAIR_COLORS: Record<PatientVisualProfile["hairColor"], string> = {
  preto: "#1b1512",
  castanho: "#4a2f1e",
  loiro: "#c9a35f",
  ruivo: "#8f3b1b",
  grisalho: "#8d8a86",
  branco: "#d8d6d2"
};

interface Proportions {
  height: number;
  headRatio: number; // altura total / altura da cabeça
  limbThickness: number;
  shoulderRatio: number;
  torsoRatio: number;
  legRatio: number;
  kyphosis: number;
}

function proportions(p: PatientVisualProfile, heightCm?: number): Proportions {
  const h = heightCm ? heightCm / 100 : undefined;
  switch (p.ageGroup) {
    case "lactente":
      return { height: h ?? 0.65, headRatio: 4, limbThickness: 1.35, shoulderRatio: 0.24, torsoRatio: 0.36, legRatio: 0.34, kyphosis: 0 };
    case "crianca_pequena":
      return { height: h ?? 1.0, headRatio: 5, limbThickness: 1.2, shoulderRatio: 0.23, torsoRatio: 0.33, legRatio: 0.4, kyphosis: 0 };
    case "escolar":
      return { height: h ?? 1.32, headRatio: 6, limbThickness: 1.05, shoulderRatio: 0.22, torsoRatio: 0.31, legRatio: 0.45, kyphosis: 0 };
    case "adolescente":
      return { height: h ?? 1.62, headRatio: 7, limbThickness: 1.0, shoulderRatio: 0.23, torsoRatio: 0.3, legRatio: 0.47, kyphosis: 0 };
    case "idoso":
      return { height: h ?? 1.62, headRatio: 7.3, limbThickness: 0.95, shoulderRatio: 0.24, torsoRatio: 0.3, legRatio: 0.46, kyphosis: 0.18 };
    default:
      return { height: h ?? 1.7, headRatio: 7.5, limbThickness: 1.0, shoulderRatio: 0.245, torsoRatio: 0.3, legRatio: 0.48, kyphosis: 0 };
  }
}

const BUILD: Record<PatientVisualProfile["build"], number> = { magro: 0.86, medio: 1, robusto: 1.14, obeso: 1.32 };

function joint(name: string, parent: THREE.Object3D, x = 0, y = 0, z = 0): THREE.Object3D {
  const o = new THREE.Object3D();
  o.name = name;
  o.position.set(x, y, z);
  parent.add(o);
  return o;
}

export function createPatientModel(profile: PatientVisualProfile, opts: { heightCm?: number; geometryDetail?: number } = {}): PatientModel {
  const P = proportions(profile, opts.heightCm);
  const build = BUILD[profile.build];
  const female = profile.sex === "feminino";
  const seg = Math.max(8, Math.round(16 * (opts.geometryDetail ?? 1)));
  const disposables: { dispose(): void }[] = [];
  const track = <T extends { dispose(): void }>(x: T): T => {
    disposables.push(x);
    return x;
  };

  const skinColor = new THREE.Color(SKIN_TONES[profile.skinTone] ?? SKIN_TONES[3]);
  const skin = track(new THREE.MeshStandardMaterial({ color: skinColor.clone(), roughness: 0.62, metalness: 0 }));
  const lips = track(new THREE.MeshStandardMaterial({ color: skinColor.clone().lerp(new THREE.Color("#9c4a4a"), 0.45), roughness: 0.5 }));
  const nails = track(new THREE.MeshStandardMaterial({ color: skinColor.clone().lerp(new THREE.Color("#e8b4b0"), 0.5), roughness: 0.4 }));
  const sclera = track(new THREE.MeshStandardMaterial({ color: "#f4f1ea", roughness: 0.3 }));
  const iris = track(new THREE.MeshStandardMaterial({ color: profile.skinTone > 4 ? "#2a1b10" : "#4b3420", roughness: 0.3 }));
  const gown = track(new THREE.MeshStandardMaterial({ color: "#8fb8d8", roughness: 0.85 }));
  const gownDots = track(new THREE.MeshStandardMaterial({ color: "#5b88ad", roughness: 0.85 }));
  const hairMat = track(new THREE.MeshStandardMaterial({ color: HAIR_COLORS[profile.hairColor], roughness: 0.9 }));
  const dark = track(new THREE.MeshStandardMaterial({ color: "#2a1414", roughness: 0.6 }));
  const regionMat = track(new THREE.MeshBasicMaterial({ visible: false }));

  const H = P.height;
  const headH = H / P.headRatio;
  const headR = headH * 0.5;
  const legLen = H * P.legRatio;
  const torsoLen = H * P.torsoRatio;
  const neckLen = headH * 0.32;
  const shoulderHalf = H * P.shoulderRatio * 0.5 * (female ? 0.94 : 1.04) * Math.sqrt(build);
  const hipHalf = H * 0.095 * (female ? 1.12 : 0.98) * build;
  const chestDepth = H * 0.075 * build;
  const limbR = H * 0.028 * P.limbThickness * Math.sqrt(build);
  const armLen = H * 0.43;

  const root = new THREE.Group();
  root.name = "patient";
  const joints = {} as Record<JointName, THREE.Object3D>;
  joints.root = root;
  const pelvis = (joints.pelvis = joint("pelvis", root, 0, legLen, 0));
  const spine = (joints.spineLumbar = joint("spineLumbar", pelvis, 0, torsoLen * 0.18, 0));
  const chest = (joints.chest = joint("chest", spine, 0, torsoLen * 0.3, 0));
  chest.rotation.x = P.kyphosis * 0.6;
  const neck = (joints.neck = joint("neck", chest, 0, torsoLen * 0.52, P.kyphosis * 0.05));
  const head = (joints.head = joint("head", neck, 0, neckLen, 0));
  head.rotation.x = -P.kyphosis * 0.5;

  const geoms: THREE.BufferGeometry[] = [];
  const g = <T extends THREE.BufferGeometry>(x: T): T => {
    geoms.push(x);
    return x;
  };
  const mesh = (geo: THREE.BufferGeometry, mat: THREE.Material, parent: THREE.Object3D, name = ""): THREE.Mesh => {
    const m = new THREE.Mesh(geo, mat);
    m.name = name;
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  };

  // ---- Pelve e tronco (perfil de revolução, achatado em profundidade) ----
  const torsoProfile: THREE.Vector2[] = [];
  const waist = hipHalf * 0.82 * (female ? 0.9 : 1);
  const pts: [number, number][] = [
    [0.0, -0.06],
    [hipHalf * 0.85, -0.04],
    [hipHalf, 0.06],
    [hipHalf * 0.98, 0.14],
    [waist, 0.3],
    [shoulderHalf * 0.78, 0.55],
    [shoulderHalf * 0.86, 0.72],
    [shoulderHalf * 0.8, 0.86],
    [shoulderHalf * 0.45, 0.97],
    [limbR * 1.5, 1.0]
  ];
  for (const [r, y] of pts) torsoProfile.push(new THREE.Vector2(Math.max(0.001, r), y * (torsoLen + 0.06)));
  const torsoGeo = g(new THREE.LatheGeometry(torsoProfile, seg * 2));
  torsoGeo.scale(1, 1, (chestDepth / shoulderHalf) * 1.25);
  torsoGeo.computeVertexNormals();
  // tronco como "casca" respiratória: o grupo chestShell escala para respirar
  const chestShell = joint("chestShell", pelvis, 0, 0, 0);
  const torso = mesh(torsoGeo, gown, chestShell, "torso");
  torso.position.y = -0.03;
  // gola do avental
  const collar = mesh(g(new THREE.TorusGeometry(limbR * 1.9, limbR * 0.25, 8, seg * 2)), gownDots, chestShell, "collar");
  collar.rotation.x = Math.PI / 2;
  collar.position.y = torsoLen * 0.98;
  collar.scale.set(1, 0.85, 1);
  // abdome (casca separada para movimento abdominal e gestação/obesidade)
  const abdomenShell = joint("abdomenShell", pelvis, 0, torsoLen * 0.18, chestDepth * 0.35);
  const abdGeo = g(new THREE.SphereGeometry(1, seg, seg));
  const abd = mesh(abdGeo, gown, abdomenShell, "abdomen");
  abd.scale.set(waist * 0.92, torsoLen * 0.2, chestDepth * (0.68 + (build - 1) * 1.1));
  let belly: THREE.Mesh | null = null;
  if (profile.pregnancyTrimester > 0) {
    const s = [0, 0.55, 0.85, 1.15][profile.pregnancyTrimester]!;
    belly = mesh(g(new THREE.SphereGeometry(1, seg, seg)), gown, abdomenShell, "belly");
    belly.scale.set(waist * 0.85 * s, torsoLen * 0.24 * s, chestDepth * 1.25 * s);
    belly.position.set(0, -torsoLen * 0.02, chestDepth * 0.35 * s);
  }
  if (female && profile.ageGroup !== "lactente" && profile.ageGroup !== "crianca_pequena" && profile.ageGroup !== "escolar") {
    const bGeo = g(new THREE.SphereGeometry(1, seg, seg));
    for (const sx of [-1, 1]) {
      const b = mesh(bGeo, gown, chestShell, "breast");
      b.scale.set(shoulderHalf * 0.27, shoulderHalf * 0.24, chestDepth * 0.33 * build);
      b.position.set(sx * shoulderHalf * 0.36, torsoLen * 0.63, chestDepth * 0.8);
    }
  }

  // ---- Pescoço, cabeça e face ----
  const neckGeo = g(new THREE.CylinderGeometry(limbR * 1.75, limbR * 2.0, neckLen * 1.4, seg));
  const neckMesh = mesh(neckGeo, skin, neck, "neck");
  neckMesh.position.y = neckLen * 0.4;
  const headGeo = g(new THREE.SphereGeometry(headR, seg * 2, seg * 2));
  const skull = mesh(headGeo, skin, head, "skull");
  skull.scale.set(profile.ageGroup === "lactente" ? 0.96 : 0.86, 1.0, 0.98);
  skull.position.y = headR * 0.95;
  const faceY = headR * 0.85;
  const jaw = (joints.jaw = joint("jaw", head, 0, faceY - headR * 0.15, headR * 0.05));
  const chinGeo = g(new THREE.SphereGeometry(headR * 0.62, seg, seg));
  const chin = mesh(chinGeo, skin, jaw, "chin");
  chin.scale.set(0.9, 0.62, 0.86);
  chin.position.set(0, -headR * 0.24, headR * 0.2);
  // nariz
  const nose = mesh(g(new THREE.SphereGeometry(headR * 0.13, seg, seg)), skin, head, "nose");
  nose.scale.set(0.8, 1.1, 1.25);
  nose.position.set(0, faceY, headR * 0.97);
  // orelhas
  const earGeo = g(new THREE.SphereGeometry(headR * 0.2, seg, seg));
  for (const sx of [-1, 1]) {
    const ear = mesh(earGeo, skin, head, "ear");
    ear.scale.set(0.35, 1, 0.7);
    ear.position.set(sx * headR * 0.86, faceY + headR * 0.05, -headR * 0.05);
  }
  // olhos, pálpebras e sobrancelhas
  const eyeGeo = g(new THREE.SphereGeometry(headR * 0.13, seg, seg));
  const irisGeo = g(new THREE.SphereGeometry(headR * 0.065, seg, seg));
  const lidGeo = g(new THREE.SphereGeometry(headR * 0.145, seg, seg, 0, Math.PI * 2, 0, Math.PI / 2));
  const eyelids: THREE.Mesh[] = [];
  const pupils: THREE.Object3D[] = [];
  const browGeo = g(new THREE.BoxGeometry(headR * 0.3, headR * 0.05, headR * 0.06));
  const brows: THREE.Mesh[] = [];
  for (const sx of [-1, 1]) {
    const eyeGroup = joint(sx < 0 ? "eye_R" : "eye_L", head, sx * headR * 0.31, faceY + headR * 0.2, headR * 0.83);
    mesh(eyeGeo, sclera, eyeGroup, "eyeball").userData.sclera = true;
    const pupilPivot = joint("pupilPivot", eyeGroup, 0, 0, 0);
    const ir = mesh(irisGeo, iris, pupilPivot, "iris");
    ir.position.z = headR * 0.1;
    ir.scale.set(1, 1, 0.5);
    pupils.push(pupilPivot);
    const lid = mesh(lidGeo, skin, eyeGroup, "eyelid");
    // hemisfério cujo polo aponta para cima/trás (aberto) ou para a frente (fechado)
    lid.userData.openRot = -0.75;
    lid.userData.closedRot = 1.5;
    lid.rotation.x = lid.userData.openRot;
    eyelids.push(lid);
    const brow = mesh(browGeo, hairMat, head, "brow");
    brow.position.set(sx * headR * 0.31, faceY + headR * 0.4, headR * 0.9);
    brow.rotation.z = sx * -0.1;
    brows.push(brow);
  }
  // boca/lábios (presos à mandíbula para fala)
  const lipsGeo = g(new THREE.TorusGeometry(headR * 0.17, headR * 0.045, 8, seg * 2));
  const lipsMesh = mesh(lipsGeo, lips, jaw, "lips");
  lipsMesh.scale.set(1, 0.42, 0.6);
  lipsMesh.position.set(0, -headR * 0.13, headR * 0.86);
  const mouthIn = mesh(g(new THREE.SphereGeometry(headR * 0.12, seg, seg)), dark, jaw, "mouthInner");
  mouthIn.scale.set(1.2, 0.3, 0.4);
  mouthIn.position.set(0, -headR * 0.13, headR * 0.82);
  // cabelo
  buildHair(profile, head, headR, hairMat, g, seg);

  // ---- Braços (ombro → braço → antebraço → mão) ----
  const upperLen = armLen * 0.42;
  const foreLen = armLen * 0.38;
  const handLen = armLen * 0.2;
  const upperGeo = g(new THREE.CapsuleGeometry(limbR * 1.15, upperLen - limbR * 2, 6, seg));
  const foreGeo = g(new THREE.CapsuleGeometry(limbR * 0.95, foreLen - limbR * 1.6, 6, seg));
  const sleeveGeo = g(new THREE.CylinderGeometry(limbR * 1.32, limbR * 1.3, upperLen * 0.5, seg, 1, true));
  const jointBall = g(new THREE.SphereGeometry(limbR * 1.1, seg, seg));
  for (const side of ["L", "R"] as const) {
    const sx = side === "L" ? 1 : -1;
    const shoulder = (joints[`shoulder_${side}`] = joint(`shoulder_${side}`, chest, sx * shoulderHalf * 0.9, torsoLen * 0.42, 0));
    const ua = (joints[`upperArm_${side}`] = joint(`upperArm_${side}`, shoulder, 0, 0, 0));
    ua.rotation.z = sx * 0.12; // braço ao longo do corpo
    mesh(g(new THREE.SphereGeometry(limbR * 1.42, seg, seg)), gown, ua, "shoulderCap");
    const uaMesh = mesh(upperGeo, skin, ua, "upperArm");
    uaMesh.position.y = -upperLen / 2;
    const sleeve = mesh(sleeveGeo, gown, ua, "sleeve");
    sleeve.position.y = -upperLen * 0.25;
    mesh(jointBall, skin, ua, "elbowCap").position.y = -upperLen;
    const fa = (joints[`forearm_${side}`] = joint(`forearm_${side}`, ua, 0, -upperLen, 0));
    const faMesh = mesh(foreGeo, skin, fa, "forearm");
    faMesh.position.y = -foreLen / 2;
    const hand = (joints[`hand_${side}`] = joint(`hand_${side}`, fa, 0, -foreLen, 0));
    buildHand(hand, sx, handLen, limbR, skin, nails, g, seg);
  }

  // ---- Pernas (coxa → perna → pé) ----
  const thighLen = legLen * 0.5;
  const shinLen = legLen * 0.46;
  const thighGeo = g(new THREE.CapsuleGeometry(limbR * 1.55 * Math.sqrt(build), thighLen - limbR * 2.4, 6, seg));
  const shinGeo = g(new THREE.CapsuleGeometry(limbR * 1.15, shinLen - limbR * 1.8, 6, seg));
  const lowerLegs: THREE.Object3D[] = [];
  for (const side of ["L", "R"] as const) {
    const sx = side === "L" ? 1 : -1;
    const th = (joints[`thigh_${side}`] = joint(`thigh_${side}`, pelvis, sx * hipHalf * 0.52, -0.01, 0));
    const thMesh = mesh(thighGeo, skin, th, "thigh");
    thMesh.position.y = -thighLen / 2;
    mesh(jointBall, skin, th, "kneeCap").position.y = -thighLen;
    const sh = (joints[`shin_${side}`] = joint(`shin_${side}`, th, 0, -thighLen, 0));
    const shMesh = mesh(shinGeo, skin, sh, "shin");
    shMesh.position.y = -shinLen / 2;
    lowerLegs.push(shMesh);
    const ft = (joints[`foot_${side}`] = joint(`foot_${side}`, sh, 0, -shinLen, 0));
    const footGeo = g(new THREE.CapsuleGeometry(limbR * 0.95, H * 0.1, 6, seg));
    const foot = mesh(footGeo, skin, ft, "foot");
    foot.rotation.x = Math.PI / 2;
    foot.position.set(0, -limbR * 0.6, H * 0.04);
    const toes = mesh(g(new THREE.SphereGeometry(limbR * 0.95, seg, seg)), skin, ft, "toes");
    toes.scale.set(1.05, 0.6, 0.8);
    toes.position.set(0, -limbR * 0.7, H * 0.1);
  }
  // shorts/avental na pelve
  const hipCover = mesh(g(new THREE.CylinderGeometry(hipHalf * 1.08, hipHalf * 1.15, legLen * 0.2, seg * 2, 1, true)), gown, pelvis, "hipCover");
  hipCover.scale.z = (chestDepth / hipHalf) * 1.3;
  hipCover.position.y = -legLen * 0.06;

  // ---- Achados cutâneos (instâncias reutilizáveis; visibilidade controlada pelo estado) ----
  const tmp = new THREE.Object3D();
  const whealGeo = g(new THREE.SphereGeometry(H * 0.012, 6, 4));
  const whealMat = track(new THREE.MeshStandardMaterial({ color: skinColor.clone().lerp(new THREE.Color("#d9707a"), 0.55), roughness: 0.55 }));
  const urticaria = new THREE.InstancedMesh(whealGeo, whealMat, 60);
  urticaria.name = "urticaria";
  for (let i = 0; i < 60; i++) {
    // distribuídas no pescoço, braços e face (áreas visíveis fora do avental)
    const host = i % 3 === 0 ? "neck" : i % 3 === 1 ? "upperArm_L" : "upperArm_R";
    const ang = (i * 1.7) % (Math.PI * 2);
    if (host === "neck") tmp.position.set(Math.sin(ang) * limbR * 1.6, neckLen * (0.2 + (i % 5) * 0.12), Math.cos(ang) * limbR * 1.6);
    else tmp.position.set((host.endsWith("L") ? 1 : -1) * (shoulderHalf * 0.9 + Math.sin(ang) * limbR * 1.2), torsoLen * 0.42 - upperLen * (0.5 + (i % 6) * 0.08), Math.cos(ang) * limbR * 1.2);
    tmp.scale.set(1 + (i % 3) * 0.4, 0.45, 1 + (i % 4) * 0.3);
    tmp.updateMatrix();
    urticaria.setMatrixAt(i, tmp.matrix);
  }
  urticaria.visible = false;
  chest.add(urticaria);
  urticaria.position.y = -torsoLen * 0.0;
  const sweatMat = track(new THREE.MeshStandardMaterial({ color: "#e8f2ff", roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.75 }));
  const sweat = new THREE.InstancedMesh(g(new THREE.SphereGeometry(headR * 0.03, 6, 4)), sweatMat, 18);
  for (let i = 0; i < 18; i++) {
    const a = -0.9 + (i / 17) * 1.8;
    tmp.position.set(Math.sin(a) * headR * 0.82, faceY + headR * (0.5 + (i % 3) * 0.08), Math.cos(a) * headR * 0.72);
    tmp.scale.set(1, 1.4, 0.6);
    tmp.updateMatrix();
    sweat.setMatrixAt(i, tmp.matrix);
  }
  sweat.visible = false;
  head.add(sweat);
  const bloodMat = track(new THREE.MeshStandardMaterial({ color: "#6e0d0d", roughness: 0.3, transparent: true, opacity: 0.9 }));
  const blood = mesh(g(new THREE.CircleGeometry(H * 0.08, 20)), bloodMat, root, "bloodPool");
  blood.rotation.x = -Math.PI / 2;
  blood.visible = false;

  // ---- Âncoras de dispositivos ----
  const anchors = {} as Record<AnchorName, THREE.Object3D>;
  anchors.nose = joint("anchor_nose", head, 0, faceY - headR * 0.08, headR * 1.02);
  anchors.mouth = joint("anchor_mouth", jaw, 0, 0, headR * 0.86);
  anchors.face = joint("anchor_face", head, 0, faceY - headR * 0.05, headR * 0.95);
  anchors.neckFront = joint("anchor_neck", neck, sx(-1) * limbR * 0.6, neckLen * 0.5, limbR * 1.4);
  anchors.chestCenter = joint("anchor_chestC", chest, 0, torsoLen * 0.28, chestDepth * 1.18);
  anchors.chestLeft = joint("anchor_chestL", chest, shoulderHalf * 0.45, torsoLen * 0.38, chestDepth * 1.08);
  anchors.chestRight = joint("anchor_chestR", chest, -shoulderHalf * 0.45, torsoLen * 0.38, chestDepth * 1.08);
  anchors.chestLowerLeft = joint("anchor_chestLL", chest, shoulderHalf * 0.55, torsoLen * 0.05, chestDepth * 1.02);
  anchors.abdomen = joint("anchor_abd", abdomenShell, 0, 0, chestDepth * (0.95 + (belly ? 0.6 : 0)));
  anchors.forearm_L = joint("anchor_faL", joints.forearm_L, 0, -foreLen * 0.55, limbR * 0.95);
  anchors.forearm_R = joint("anchor_faR", joints.forearm_R, 0, -foreLen * 0.55, limbR * 0.95);
  anchors.finger_L = joint("anchor_fingerL", joints.hand_L, 0, -handLen * 0.85, 0);
  anchors.finger_R = joint("anchor_fingerR", joints.hand_R, 0, -handLen * 0.85, 0);
  anchors.shin_L = joint("anchor_shinL", joints.shin_L, 0, -shinLen * 0.15, limbR * 1.15);
  anchors.shin_R = joint("anchor_shinR", joints.shin_R, 0, -shinLen * 0.15, limbR * 1.15);
  anchors.flank_L = joint("anchor_flankL", chest, shoulderHalf * 0.82, torsoLen * 0.18, 0);
  anchors.lowerLeg_R = joint("anchor_llR", joints.shin_R, 0, -shinLen * 0.5, 0);
  anchors.pelvis = joint("anchor_pelvis", pelvis, 0, 0, chestDepth);

  // ---- Zonas de interação (ids semânticos; lado = lado do paciente) ----
  const regions: THREE.Mesh[] = [];
  const region = (id: string, parent: THREE.Object3D, geo: THREE.BufferGeometry, pos: [number, number, number], scale: [number, number, number] = [1, 1, 1], priority = 0) => {
    const m = new THREE.Mesh(g(geo), regionMat);
    m.position.set(...pos);
    m.scale.set(...scale);
    m.userData.regionId = id;
    m.userData.priority = priority;
    m.name = `region_${id}`;
    parent.add(m);
    regions.push(m);
  };
  const box = new THREE.BoxGeometry(1, 1, 1);
  region("cabeca", head, new THREE.SphereGeometry(headR * 1.08, 12, 8), [0, headR * 1.05, 0]);
  region("olhos", head, box.clone(), [0, faceY + headR * 0.22, headR * 0.82], [headR * 1.0, headR * 0.3, headR * 0.3], 3);
  region("boca", jaw, box.clone(), [0, 0, headR * 0.8], [headR * 0.6, headR * 0.3, headR * 0.35], 3);
  region("pescoco", neck, new THREE.CylinderGeometry(limbR * 1.8, limbR * 1.8, neckLen * 1.3, 10), [0, neckLen * 0.45, 0], [1, 1, 1], 1);
  region("torax_anterior", chest, box.clone(), [0, torsoLen * 0.35, chestDepth * 0.6], [shoulderHalf * 1.6, torsoLen * 0.55, chestDepth * 1.3], 1);
  region("coracao", chest, box.clone(), [shoulderHalf * 0.22, torsoLen * 0.28, chestDepth * 1.05], [shoulderHalf * 0.45, torsoLen * 0.22, chestDepth * 0.5], 2);
  region("torax_posterior", chest, box.clone(), [0, torsoLen * 0.35, -chestDepth * 0.7], [shoulderHalf * 1.6, torsoLen * 0.55, chestDepth * 0.6], 1);
  const qx = waist * 0.5;
  const ay = 0;
  const az = chestDepth * (belly ? 1.6 : 0.95);
  region("abdome_epigastrio", abdomenShell, box.clone(), [0, ay + torsoLen * 0.17, az * 0.8], [waist * 0.9, torsoLen * 0.1, chestDepth * 0.8], 2);
  region("abdome_qse", abdomenShell, box.clone(), [qx, ay + torsoLen * 0.06, az * 0.8], [waist * 0.95, torsoLen * 0.12, chestDepth], 1);
  region("abdome_qsd", abdomenShell, box.clone(), [-qx, ay + torsoLen * 0.06, az * 0.8], [waist * 0.95, torsoLen * 0.12, chestDepth], 1);
  region("abdome_qie", abdomenShell, box.clone(), [qx, ay - torsoLen * 0.07, az * 0.8], [waist * 0.95, torsoLen * 0.13, chestDepth], 1);
  region("abdome_qid", abdomenShell, box.clone(), [-qx, ay - torsoLen * 0.07, az * 0.8], [waist * 0.95, torsoLen * 0.13, chestDepth], 1);
  region("pelve", pelvis, box.clone(), [0, -legLen * 0.05, chestDepth * 0.7], [hipHalf * 2, legLen * 0.12, chestDepth * 1.2], 1);
  for (const side of ["L", "R"] as const) {
    const id = side === "L" ? "e" : "d";
    region(`membro_superior_${id}`, joints[`upperArm_${side}`], new THREE.CylinderGeometry(limbR * 2.2, limbR * 2.2, armLen, 8), [0, -armLen * 0.5, 0], [1, 1, 1], 1);
    region(`membro_inferior_${id}`, joints[`thigh_${side}`], new THREE.CylinderGeometry(limbR * 2.4, limbR * 2.4, legLen, 8), [0, -legLen * 0.5, 0], [1, 1, 1], 1);
  }

  const model: PatientModel = {
    root,
    joints,
    anchors,
    regions,
    materials: { skin, lips, nails, sclera, gown, hair: hairMat },
    parts: { eyelids, pupils, chestShell, abdomenShell, belly, urticaria, sweat, lowerLegs, lipsMesh, browL: brows[1]!, browR: brows[0]!, blood },
    dims: { height: H, headR, shoulderHalf, hipHalf, chestDepth, torsoLen, legLen, armLen },
    baseSkin: skinColor.clone(),
    profile,
    dispose() {
      for (const x of geoms) x.dispose();
      box.dispose();
      for (const d of disposables) d.dispose();
      urticaria.dispose();
      sweat.dispose();
    }
  };
  return model;
}

function sx(v: number): number {
  return v;
}

function buildHand(hand: THREE.Object3D, side: number, handLen: number, limbR: number, skin: THREE.Material, nails: THREE.Material, g: <T extends THREE.BufferGeometry>(x: T) => T, seg: number): void {
  const palmW = limbR * 2.0;
  const palm = new THREE.Mesh(g(new THREE.CapsuleGeometry(limbR * 0.62, handLen * 0.32, 4, seg)), skin);
  palm.scale.set(1.45, 1, 0.62);
  palm.position.y = -handLen * 0.28;
  palm.castShadow = true;
  palm.name = "palm";
  hand.add(palm);
  const fingerGeo = g(new THREE.CapsuleGeometry(limbR * 0.17, handLen * 0.32, 3, 8));
  const nailGeo = g(new THREE.SphereGeometry(limbR * 0.15, 6, 4));
  for (let i = 0; i < 4; i++) {
    const f = new THREE.Mesh(fingerGeo, skin);
    const x = (i - 1.5) * palmW * 0.22;
    f.position.set(x, -handLen * 0.68 + Math.abs(i - 1.5) * handLen * 0.04, limbR * 0.05);
    f.rotation.x = 0.15;
    f.castShadow = true;
    f.name = "finger";
    hand.add(f);
    const n = new THREE.Mesh(nailGeo, nails);
    n.scale.set(1, 1.2, 0.4);
    n.position.set(x, -handLen * 0.82 + Math.abs(i - 1.5) * handLen * 0.04, limbR * 0.15);
    n.name = "nail";
    hand.add(n);
  }
  const thumb = new THREE.Mesh(g(new THREE.CapsuleGeometry(limbR * 0.2, handLen * 0.26, 3, 8)), skin);
  thumb.position.set(side * palmW * 0.42, -handLen * 0.35, limbR * 0.25);
  thumb.rotation.z = side * 0.6;
  thumb.rotation.x = 0.4;
  thumb.name = "thumb";
  hand.add(thumb);
}

function buildHair(p: PatientVisualProfile, head: THREE.Object3D, headR: number, mat: THREE.Material, g: <T extends THREE.BufferGeometry>(x: T) => T, seg: number): void {
  if (p.hairStyle === "careca" || p.ageGroup === "lactente") {
    if (p.ageGroup === "lactente") {
      const fuzz = new THREE.Mesh(g(new THREE.SphereGeometry(headR * 1.01, seg, seg, 0, Math.PI * 2, 0, Math.PI * 0.35)), mat);
      fuzz.position.y = headR * 0.95;
      head.add(fuzz);
    }
    return;
  }
  const cap = new THREE.Mesh(g(new THREE.SphereGeometry(headR * 1.04, seg * 2, seg, 0, Math.PI * 2, 0, Math.PI * 0.52)), mat);
  cap.position.y = headR * 0.98;
  cap.rotation.x = -0.25;
  cap.scale.set(0.9, 1, 1.02);
  cap.name = "hairCap";
  head.add(cap);
  if (p.hairStyle === "longo") {
    const back = new THREE.Mesh(g(new THREE.CapsuleGeometry(headR * 0.82, headR * 1.3, 6, seg)), mat);
    back.position.set(0, headR * 0.2, -headR * 0.45);
    back.scale.set(1, 1, 0.55);
    head.add(back);
  } else if (p.hairStyle === "coque") {
    const bun = new THREE.Mesh(g(new THREE.SphereGeometry(headR * 0.38, seg, seg)), mat);
    bun.position.set(0, headR * 1.55, -headR * 0.75);
    head.add(bun);
  } else if (p.hairStyle === "crespo_volume" || p.hairStyle === "cacheado") {
    const n = p.hairStyle === "crespo_volume" ? 70 : 46;
    const curlGeo = g(new THREE.SphereGeometry(headR * (p.hairStyle === "crespo_volume" ? 0.26 : 0.2), 8, 6));
    const curls = new THREE.InstancedMesh(curlGeo, mat, n);
    const t = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      // distribuição em espiral de Fibonacci na metade superior/posterior
      const y = 1 - (i / (n - 1)) * 1.25;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const th = i * 2.399963;
      const z = Math.sin(th) * r;
      if (z > 0.55 && y < 0.55) {
        // não cobre a face: instância anulada
        t.position.set(0, 0, 0);
        t.scale.set(0, 0, 0);
        t.updateMatrix();
        curls.setMatrixAt(i, t.matrix);
        t.scale.set(1, 1, 1);
        continue;
      }
      t.position.set(Math.cos(th) * r * headR * 1.08, headR * 0.95 + y * headR * 1.08, z * headR * 1.08 - headR * 0.05);
      t.updateMatrix();
      curls.setMatrixAt(i, t.matrix);
    }
    head.add(curls);
  } else if (p.hairStyle === "crespo_curto") {
    cap.scale.set(0.93, 1.03, 1.05);
  }
}
