import type { CaseDefinition, LearnerCommand } from "../domain/schema";
import type { AssessmentResult } from "../engine/scoring";

export type Mode = "guiado" | "livre" | "prova" | "oral";

export interface Prefs {
  theme: "escuro" | "claro";
  fontScale: number;
  highContrast: boolean;
  reducedMotion: boolean;
  quality: "baixo" | "medio" | "alto";
  render2D: boolean;
  effectsVolume: number;
  ambientVolume: number;
  voiceVolume: number;
  alarmSound: boolean;
  captions: boolean;
  defaultMode: Mode;
  hideDiagnosisInTitles: boolean;
  doseAlerts: boolean;
  level: "internato" | "residencia";
  tutorialDone: boolean;
  aiGatewayUrl: string;
  aiEnabled: boolean;
  instructorMode: boolean;
}

export const DEFAULT_PREFS: Prefs = {
  theme: "escuro",
  fontScale: 1,
  highContrast: false,
  reducedMotion: false,
  quality: "medio",
  render2D: false,
  effectsVolume: 0.6,
  ambientVolume: 0.3,
  voiceVolume: 0.8,
  alarmSound: true,
  captions: true,
  defaultMode: "livre",
  hideDiagnosisInTitles: true,
  doseAlerts: true,
  level: "internato",
  tutorialDone: false,
  aiGatewayUrl: "",
  aiEnabled: false,
  instructorMode: false
};

export interface Profile {
  name: string;
  createdAt: string;
}

export interface SessionRecord {
  sessionId: string;
  caseId: string;
  caseVersion: string;
  /** cópia congelada da definição usada (permite replay mesmo após atualização do caso) */
  caseSnapshot: CaseDefinition;
  seed: number;
  branchId: string;
  mode: Mode;
  commands: LearnerCommand[];
  simTick: number;
  status: "ativa" | "concluida";
  startedAt: string;
  updatedAt: string;
  result?: AssessmentResult;
  oralAnswer?: string;
  /** contador de gravação para detectar escrita obsoleta (idempotência) */
  revision: number;
}

export interface BackupFile {
  format: "plantao3d-backup";
  schemaVersion: 1;
  exportedAt: string;
  prefs: Prefs;
  profile: Profile | null;
  favorites: string[];
  customCases: CaseDefinition[];
  sessions: SessionRecord[];
}

export interface StorageAdapter {
  readonly kind: "sqlite" | "indexeddb" | "memoria";
  init(): Promise<void>;
  getPrefs(): Promise<Prefs>;
  savePrefs(p: Prefs): Promise<void>;
  getProfile(): Promise<Profile | null>;
  saveProfile(p: Profile): Promise<void>;
  /** grava de forma idempotente: revisões menores que a existente são ignoradas */
  saveSession(r: SessionRecord): Promise<void>;
  getSession(id: string): Promise<SessionRecord | null>;
  listSessions(): Promise<SessionRecord[]>;
  deleteSession(id: string): Promise<void>;
  saveCustomCase(c: CaseDefinition): Promise<void>;
  listCustomCases(): Promise<CaseDefinition[]>;
  deleteCustomCase(id: string, version: string): Promise<void>;
  getFavorites(): Promise<string[]>;
  setFavorite(id: string, on: boolean): Promise<void>;
}
