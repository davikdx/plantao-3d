import type { VarId, FlagId, FlagValue } from "../domain/variables";
import type { DeviceId, DestinationId, ScenarioResourceProfile } from "../domain/resources";
import type {
  ActionDefinition,
  CaseDefinition,
  DrugDefinition,
  LearnerCommand,
  ManeuverId,
  Prescription,
  RegionId,
  Route,
  TestDefinition
} from "../domain/schema";
import type { Quantity } from "../domain/units";

export interface Catalog {
  actions: Map<string, ActionDefinition>;
  drugs: Map<string, DrugDefinition>;
  tests: Map<string, TestDefinition>;
}

export interface EngineContext {
  caseDef: CaseDefinition;
  catalog: Catalog;
  profile: ScenarioResourceProfile;
}

export interface Trend {
  slot: string;
  target: number;
  tauSeconds: number;
  priority: number;
  startTick: number;
  endTick?: number;
  sourceRuleId?: string;
}

export type OrderKind = "action" | "test" | "drug" | "exam";
export type OrderStatus = "pendente" | "em_execucao" | "coletado" | "concluida" | "cancelada" | "falhou";

export interface Order {
  id: string;
  commandId: string;
  kind: OrderKind;
  refId: string;
  label: string;
  status: OrderStatus;
  createdTick: number;
  completeTick?: number;
  collectTick?: number;
  availableTick?: number;
  attempt: number;
  params: Record<string, unknown>;
  prescription?: Prescription;
  /** dose total resolvida (para fármacos em bolus) */
  totalDose?: Quantity;
  warnings: string[];
}

export interface Treatment {
  id: string;
  drugId: string;
  route: Route;
  /** taxa em unidade base por minuto: mg/min, mL/min ou UI/min */
  ratePerMin: number;
  rateUnitBase: "mg" | "mL" | "UI" | "mmol";
  displayRate: Quantity;
  startTick: number;
  endTick?: number;
  /** volume/massa total programado (infusao_volume) */
  targetTotal?: number;
  delivered: number;
  active: boolean;
}

export interface Administration {
  orderId: string;
  drugId: string;
  route: Route;
  amount: number;
  unitBase: "mg" | "mL" | "UI" | "mmol";
  tick: number;
}

export interface QueuedEvent {
  id: string;
  tick: number;
  priority: number;
  seq: number;
  kind: "order.complete" | "test.collect" | "test.available" | "scheduled.effects" | "nibp.cycle";
  ref: string;
  payload?: unknown;
}

export interface SimEvent {
  id: string;
  tick: number;
  type: string;
  origin: { commandId?: string; ruleId?: string; orderId?: string; engine?: string };
  caseVersion: string;
  payload: Record<string, unknown>;
}

export interface Measurement {
  var: VarId;
  value: number | null;
  quality: "ok" | "ruim" | "indisponivel";
  tick: number;
  method: string;
}

export interface TestResultView {
  orderId: string;
  testId: string;
  label: string;
  collectedTick: number;
  availableTick: number;
  items: { var: VarId; value: number }[];
  text?: string;
  ecg?: {
    rhythm: string;
    rate: number;
    stElevationLeads: string[];
    stDepressionLeads: string[];
    peakedT: boolean;
    wideQrs: boolean;
  };
  imageCaption?: string;
}

export interface Knowledge {
  history: { itemId: string; topic: string; question: string; tick: number; answers: { source: string; text: string }[] }[];
  exams: { region: RegionId; maneuver: ManeuverId; tick: number; texts: string[]; sound?: string }[];
  observations: { tick: number; text: string; source: string }[];
  measurements: Measurement[];
  staffMessages: { tick: number; from: string; text: string }[];
  results: TestResultView[];
  /** amostras coletadas aguardando processamento (cópia imutável do estado no instante da coleta) */
  pendingSamples: Record<string, TestResultView>;
}

export interface RuleRuntime {
  fired: number;
  active: boolean;
  firstTick?: number;
  lastTick?: number;
}

export interface SimState {
  schemaVersion: 1;
  sessionId: string;
  branchId: string;
  caseId: string;
  caseVersion: string;
  seed: number;
  rng: number;
  tick: number;
  vars: Record<string, number>;
  flags: Record<string, FlagValue>;
  trends: Record<string, Trend[]>;
  devices: DeviceId[];
  activeToggles: string[];
  orders: Order[];
  treatments: Treatment[];
  administrations: Administration[];
  actionLog: { actionId: string; tick: number; orderId: string; success: boolean; event: "start" | "complete" | "fail" | "stop" }[];
  rules: Record<string, RuleRuntime>;
  scheduledKeys: string[];
  queue: QueuedEvent[];
  seq: number;
  communication: "normal" | "limitada" | "incapaz";
  outcome?: { outcome: string; tick: number; terminal: boolean };
  outcomeHistory: { outcome: string; tick: number }[];
  knowledge: Knowledge;
  processedCommandIds: string[];
  commandLog: LearnerCommand[];
  eventLog: SimEvent[];
  differential: string[];
  finalDiagnosis?: string;
  disposition?: DestinationId;
  hintsUsed: { level: number; tick: number }[];
  ended: boolean;
  endedTick?: number;
}

export interface CommandResult {
  state: SimState;
  accepted: boolean;
  duplicate?: boolean;
  message?: string;
  warnings: string[];
}

export type { VarId, FlagId };
