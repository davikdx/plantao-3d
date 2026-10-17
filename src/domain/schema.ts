/**
 * Contratos de dados (Zod) — fonte única dos tipos do domínio.
 * Nenhum campo aceita código executável; condições e efeitos são linguagem declarativa fechada.
 */
import { z } from "zod";
import { UNIT_IDS } from "./units";
import { VAR_IDS, FLAG_IDS, isAllowedPath, RHYTHMS } from "./variables";
import { ENVIRONMENTS, RESOURCE_TAGS, DESTINATIONS, DEVICE_IDS } from "./resources";

export const SCHEMA_VERSION = 1 as const;

const id = z.string().regex(/^[A-Za-z0-9_.:-]{1,80}$/, "Identificador inválido");
const finite = z.number().refine((v) => Number.isFinite(v), "Número precisa ser finito");
const text = z.string().min(1).max(4000);

export const UnitIdSchema = z.enum(UNIT_IDS);
export const QuantitySchema = z.object({ value: finite, unit: UnitIdSchema });
export type QuantityT = z.infer<typeof QuantitySchema>;

export const VarIdSchema = z.enum(VAR_IDS as [string, ...string[]]);
export const FlagIdSchema = z.enum(FLAG_IDS as [string, ...string[]]);
export const PathSchema = z.string().refine(isAllowedPath, "Caminho não permitido");
export const PrimitiveSchema = z.union([finite, z.string().max(80), z.boolean()]);
export const EnvironmentSchema = z.enum(ENVIRONMENTS);
export const ResourceTagSchema = z.enum(RESOURCE_TAGS);
export const DestinationSchema = z.enum(DESTINATIONS);
export const DeviceSchema = z.enum(DEVICE_IDS);
export const RhythmSchema = z.enum(RHYTHMS);

// ---------------------------------------------------------------------------
// Condições
// ---------------------------------------------------------------------------
export type Condition =
  | { all: Condition[] }
  | { any: Condition[] }
  | { not: Condition }
  | { path: string; op: "eq" | "neq" | "gt" | "gte" | "lt" | "lte"; value: string | number | boolean }
  | { actionCompleted: string; count?: number }
  | { actionStarted: string }
  | { drugGiven: string; route?: string; minTotal?: QuantityT; maxTotal?: QuantityT }
  | { treatmentActive: string }
  | { deviceActive: string }
  | { testCollected: string }
  | { examDone: string; maneuver?: string }
  | { elapsedSince: string; op: "gte" | "lte"; seconds: number }
  | { time: "gte" | "lte"; seconds: number }
  | { ruleFired: string }
  | { always: true };

export const ConditionSchema: z.ZodType<Condition> = z.lazy(() =>
  z.union([
    z.object({ all: z.array(ConditionSchema).min(1) }).strict(),
    z.object({ any: z.array(ConditionSchema).min(1) }).strict(),
    z.object({ not: ConditionSchema }).strict(),
    z
      .object({ path: PathSchema, op: z.enum(["eq", "neq", "gt", "gte", "lt", "lte"]), value: PrimitiveSchema })
      .strict(),
    z.object({ actionCompleted: id, count: z.number().int().min(1).optional() }).strict(),
    z.object({ actionStarted: id }).strict(),
    z
      .object({ drugGiven: id, route: z.string().optional(), minTotal: QuantitySchema.optional(), maxTotal: QuantitySchema.optional() })
      .strict(),
    z.object({ treatmentActive: id }).strict(),
    z.object({ deviceActive: DeviceSchema }).strict(),
    z.object({ testCollected: id }).strict(),
    z.object({ examDone: z.string().min(1), maneuver: z.string().optional() }).strict(),
    z.object({ elapsedSince: z.string().min(1), op: z.enum(["gte", "lte"]), seconds: finite.refine((v) => v >= 0) }).strict(),
    z.object({ time: z.enum(["gte", "lte"]), seconds: finite.refine((v) => v >= 0) }).strict(),
    z.object({ ruleFired: id }).strict(),
    z.object({ always: z.literal(true) }).strict()
  ])
) as z.ZodType<Condition>;

// ---------------------------------------------------------------------------
// Efeitos (discriminados). Política de repetição/conflito documentada em cada tipo.
// ---------------------------------------------------------------------------
const baseEffectOptions = [
  /** Define valor imediatamente. Conflito no mesmo tick: última regra na ordem estável vence. */
  z.object({ type: z.literal("setValue"), var: VarIdSchema, value: finite }).strict(),
  /** Soma delta imediato (acumula se repetido). */
  z.object({ type: z.literal("adjustValue"), var: VarIdSchema, delta: finite }).strict(),
  /** Tendência exponencial no slot nomeado; mesmo slot é substituído. Entre slots, maior prioridade vence. */
  z
    .object({
      type: z.literal("trendToTarget"),
      var: VarIdSchema,
      target: finite,
      tauSeconds: finite.refine((v) => v > 0, "tau precisa ser > 0"),
      slot: id,
      priority: z.number().int().min(0).max(1000).default(10),
      durationSeconds: finite.refine((v) => v > 0).optional()
    })
    .strict(),
  /** Remove tendência de um slot (idempotente). */
  z.object({ type: z.literal("clearTrend"), var: VarIdSchema, slot: id }).strict(),
  z.object({ type: z.literal("setFlag"), flag: FlagIdSchema, value: PrimitiveSchema }).strict(),
  /** Observação visível ao aluno (ex.: achado novo à inspeção). Repetição gera nova linha. */
  z.object({ type: z.literal("addObservation"), text }).strict(),
  z
    .object({
      type: z.literal("emitStaffMessage"),
      from: z.enum(["enfermagem", "supervisor", "acompanhante", "regulacao", "paciente", "laboratorio"]),
      text
    })
    .strict(),
  z.object({ type: z.literal("changeCommunication"), state: z.enum(["normal", "limitada", "incapaz"]) }).strict(),
  z.object({ type: z.literal("setOutcome"), outcome: z.enum(["melhora", "estabilizacao_parcial", "piora", "complicacao", "parada", "rosc", "obito", "transferencia_segura"]), terminal: z.boolean().default(false) }).strict(),
  z.object({ type: z.literal("stopTreatment"), treatmentId: id }).strict(),
  z.object({ type: z.literal("removeDevice"), device: DeviceSchema }).strict()
] as const;
export const BaseEffectSchema = z.discriminatedUnion("type", baseEffectOptions);
export type BaseEffect = z.infer<typeof BaseEffectSchema>;

/** Agenda efeitos futuros (uma vez por chave). Efeitos agendados não podem agendar outros (sem recursão). */
export const ScheduleEffectsSchema = z
  .object({
    type: z.literal("scheduleEffects"),
    afterSeconds: finite.refine((v) => v >= 0),
    key: id,
    effects: z.array(BaseEffectSchema).min(1)
  })
  .strict();

export const EffectSchema = z.discriminatedUnion("type", [...baseEffectOptions, ScheduleEffectsSchema]);
export type Effect = z.infer<typeof EffectSchema>;

export const RuleSchema = z
  .object({
    id,
    description: z.string().max(400).optional(),
    priority: z.number().int().min(0).max(1000).default(50),
    when: ConditionSchema,
    /** once: dispara uma vez; while: efeitos na borda de subida e onEnd na de descida; every: repete a cada N s enquanto verdadeiro */
    repeat: z.union([z.literal("once"), z.literal("while"), z.object({ everySeconds: finite.refine((v) => v > 0) })]).default("once"),
    effects: z.array(EffectSchema).default([]),
    onEnd: z.array(EffectSchema).default([]),
    sourceIds: z.array(id).default([])
  })
  .strict();
export type Rule = z.infer<typeof RuleSchema>;

// ---------------------------------------------------------------------------
// Catálogos globais
// ---------------------------------------------------------------------------
export const ActionParamSchema = z.object({
  id,
  label: text,
  kind: z.enum(["number", "enum"]),
  unit: UnitIdSchema.optional(),
  options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
  min: finite.optional(),
  max: finite.optional(),
  default: z.union([finite, z.string()]).optional()
});

export const ActionCategory = z.enum([
  "monitorizacao",
  "medicao",
  "via_aerea",
  "ventilacao",
  "circulacao",
  "procedimento",
  "reanimacao",
  "cuidado",
  "comunicacao",
  "rede"
]);

export const ActionDefinitionSchema = z
  .object({
    id,
    category: ActionCategory,
    label: text,
    description: z.string().max(1000),
    durationSeconds: finite.refine((v) => v >= 0),
    repeatable: z.boolean(),
    cancellable: z.boolean(),
    requiresResources: z.array(ResourceTagSchema).default([]),
    requiresDevices: z.array(DeviceSchema).default([]),
    addsDevices: z.array(DeviceSchema).default([]),
    removesDevices: z.array(DeviceSchema).default([]),
    /** variáveis reveladas uma vez ao concluir (medida pontual) */
    reveals: z.array(VarIdSchema).default([]),
    /** ativa visualização contínua de variáveis enquanto o dispositivo estiver instalado */
    continuousReveal: z.array(VarIdSchema).default([]),
    /** se true, é um estado contínuo alternável (ex.: RCP em andamento) */
    toggle: z.boolean().default(false),
    successProbability: finite.refine((v) => v >= 0 && v <= 1).default(1),
    failureText: z.string().optional(),
    risk: z.enum(["baixo", "moderado", "alto"]),
    confirm: z.boolean(),
    params: z.array(ActionParamSchema).default([]),
    trainingNote: z.string().optional(),
    sourceIds: z.array(id).default([])
  })
  .strict();
export type ActionDefinition = z.infer<typeof ActionDefinitionSchema>;

export const RouteSchema = z.enum(["IV", "IM", "SC", "VO", "IO", "inalatoria", "SL", "retal", "IN", "nebulizacao", "endotraqueal", "SNG", "ocular"]);
export type Route = z.infer<typeof RouteSchema>;

export const DoseRuleSchema = z
  .object({
    id,
    population: z.enum(["adulto", "pediatrico", "gestante", "idoso", "todos"]),
    indication: text,
    route: RouteSchema,
    mode: z.enum(["bolus", "infusao", "infusao_volume"]),
    min: QuantitySchema,
    max: QuantitySchema,
    maxSingle: QuantitySchema.optional(),
    maxCumulative: QuantitySchema.optional(),
    frequency: z.string().max(300).optional(),
    notes: z.string().max(800).optional(),
    sourceIds: z.array(id).min(1)
  })
  .strict();

export const DrugDefinitionSchema = z
  .object({
    id,
    name: text,
    drugClass: text,
    commercialNote: z.string().optional(),
    presentations: z
      .array(
        z.object({
          id,
          label: text,
          concentration: QuantitySchema,
          form: z.enum(["ampola", "frasco", "bolsa", "comprimido", "spray", "solucao_nebulizacao", "frasco_ampola", "seringa"]),
          volumeMl: finite.optional()
        })
      )
      .min(1),
    routes: z.array(RouteSchema).min(1),
    indications: z.array(z.string()).min(1),
    contraindications: z.array(z.string()).default([]),
    interactions: z.array(z.string()).default([]),
    onset: z.string(),
    duration: z.string(),
    renalHepatic: z.string().optional(),
    doseRules: z.array(DoseRuleSchema).default([]),
    /** lista Rename consultada? disponibilidade simulada exige perfil do cenário */
    renameNote: z.string().optional(),
    availability: z.array(ResourceTagSchema).default(["medicacoes_urgencia"]),
    sourceIds: z.array(id).min(1),
    reviewedAt: z.string(),
    validation: z.enum(["pendente", "revisao_tecnica", "revisado_clinicamente"])
  })
  .strict();
export type DrugDefinition = z.infer<typeof DrugDefinitionSchema>;

export const TestDefinitionSchema = z
  .object({
    id,
    label: text,
    category: z.enum(["laboratorio", "gasometria", "ecg", "imagem", "pocus", "outros"]),
    kind: z.enum(["panel", "ecg12", "text"]),
    items: z.array(VarIdSchema).default([]),
    collectSeconds: finite.refine((v) => v >= 0),
    turnaroundSeconds: finite.refine((v) => v >= 0),
    requiresResources: z.array(ResourceTagSchema).min(1),
    resourceLevel: z.number().int().min(1).max(3),
    description: z.string().max(600),
    sourceIds: z.array(id).default([])
  })
  .strict();
export type TestDefinition = z.infer<typeof TestDefinitionSchema>;

// ---------------------------------------------------------------------------
// Caso clínico
// ---------------------------------------------------------------------------
export const RegionSchema = z.enum([
  "cabeca",
  "olhos",
  "boca",
  "pescoco",
  "torax_anterior",
  "torax_posterior",
  "coracao",
  "abdome_qsd",
  "abdome_qse",
  "abdome_qid",
  "abdome_qie",
  "abdome_epigastrio",
  "pelve",
  "membro_superior_d",
  "membro_superior_e",
  "membro_inferior_d",
  "membro_inferior_e",
  "pele",
  "neurologico",
  "geral"
]);
export type RegionId = z.infer<typeof RegionSchema>;

export const ManeuverSchema = z.enum(["inspecao", "palpacao", "percussao", "ausculta", "especial"]);
export type ManeuverId = z.infer<typeof ManeuverSchema>;

const VariantText = z.object({ when: ConditionSchema.optional(), text }).strict();

export const ExamFindingSchema = z
  .object({
    id,
    region: RegionSchema,
    maneuver: ManeuverSchema,
    label: z.string().max(120).optional(),
    variants: z.array(VariantText).min(1),
    sound: z.enum(["sibilos", "estertores", "estridor", "murmurio_normal", "murmurio_abolido", "b3", "sopro", "bulhas_normais", "bulhas_abafadas", "ruidos_hidroaereos"]).optional()
  })
  .strict();

export const HistoryTopicSchema = z.enum([
  "queixa",
  "inicio",
  "evolucao",
  "localizacao",
  "intensidade",
  "fatores_associados",
  "fatores_melhora_piora",
  "sinais_alarme",
  "antecedentes",
  "cirurgias",
  "alergias",
  "medicacoes",
  "habitos",
  "familia",
  "social",
  "gestacao",
  "ginecologico",
  "vacinacao",
  "exposicao",
  "alimentacao_eliminacoes",
  "humor_risco",
  "outros"
]);
export type HistoryTopic = z.infer<typeof HistoryTopicSchema>;

export const HistoryItemSchema = z
  .object({
    id,
    topic: HistoryTopicSchema,
    question: text,
    answers: z
      .array(
        z.object({
          source: z.string().min(1),
          when: ConditionSchema.optional(),
          text
        })
      )
      .min(1),
    /** palavras-chave adicionais para o interpretador local de intenções */
    keywords: z.array(z.string()).default([])
  })
  .strict();

export const InformantSchema = z.object({ id, name: text, role: text }).strict();

export const TestResultOverrideSchema = z
  .object({
    testId: id,
    variants: z.array(
      z
        .object({
          when: ConditionSchema.optional(),
          text: z.string().max(3000),
          ecg: z
            .object({
              rhythm: RhythmSchema,
              rate: finite,
              stElevationLeads: z.array(z.string()).default([]),
              stDepressionLeads: z.array(z.string()).default([]),
              peakedT: z.boolean().default(false),
              wideQrs: z.boolean().default(false)
            })
            .optional(),
          imageCaption: z.string().optional()
        })
        .strict()
    )
  })
  .strict();

export const ScoringRuleSchema = z
  .object({
    id,
    domain: z.enum(["historia", "priorizacao", "exames", "tratamento", "reavaliacao", "destino"]),
    description: text,
    evidence: z.discriminatedUnion("kind", [
      z.object({ kind: z.literal("actionDone"), anyOf: z.array(id).min(1), withinSeconds: finite.optional() }),
      z.object({ kind: z.literal("drugGiven"), anyOf: z.array(id).min(1), routes: z.array(RouteSchema).optional(), minTotal: QuantitySchema.optional(), maxTotal: QuantitySchema.optional(), withinSeconds: finite.optional() }),
      z.object({ kind: z.literal("historyAsked"), items: z.array(id).min(1), minCount: z.number().int().min(1) }),
      z.object({ kind: z.literal("examDone"), regions: z.array(RegionSchema).min(1), minCount: z.number().int().min(1) }),
      z.object({ kind: z.literal("testOrdered"), anyOf: z.array(id).min(1), withinSeconds: finite.optional() }),
      z.object({ kind: z.literal("diagnosis"), accepted: z.array(id).min(1) }),
      z.object({ kind: z.literal("differential"), anyOf: z.array(id).min(1), minCount: z.number().int().min(1) }),
      z.object({ kind: z.literal("disposition"), accepted: z.array(DestinationSchema).min(1) }),
      z.object({ kind: z.literal("avoidAction"), anyOf: z.array(id).min(1) }),
      z.object({ kind: z.literal("avoidDrug"), anyOf: z.array(id).min(1), maxTotal: QuantitySchema.optional() }),
      z.object({ kind: z.literal("reassessAfter"), after: z.array(id).min(1), reassess: z.array(id).min(1), withinSeconds: finite }),
      z.object({ kind: z.literal("testsNotExcessive"), maxUnjustified: z.number().int().min(0), justified: z.array(id) }),
      z.object({ kind: z.literal("stateAtEnd"), when: ConditionSchema })
    ]),
    points: z.number().min(0).max(100),
    /** penalidade: se true, pontos são perdidos quando a evidência ESTÁ presente */
    penalty: z.boolean().default(false),
    severity: z.enum(["critica", "importante", "menor"]),
    rationale: text,
    alternatives: z.string().optional(),
    sourceIds: z.array(id).default([])
  })
  .strict();
export type ScoringRule = z.infer<typeof ScoringRuleSchema>;

export const PatientVisualProfileSchema = z
  .object({
    ageGroup: z.enum(["lactente", "crianca_pequena", "escolar", "adolescente", "adulto", "idoso"]),
    sex: z.enum(["feminino", "masculino"]),
    skinTone: z.number().int().min(0).max(7),
    hairStyle: z.enum(["curto", "longo", "coque", "careca", "crespo_curto", "crespo_volume", "cacheado"]),
    hairColor: z.enum(["preto", "castanho", "loiro", "ruivo", "grisalho", "branco"]),
    build: z.enum(["magro", "medio", "robusto", "obeso"]),
    pregnancyTrimester: z.number().int().min(0).max(3).default(0)
  })
  .strict();
export type PatientVisualProfile = z.infer<typeof PatientVisualProfileSchema>;

export const ReviewStatusSchema = z.enum(["draft", "schemaValidated", "technicallyTested", "clinicallyReviewed", "published"]);

export const CaseDefinitionSchema = z
  .object({
    schemaVersion: z.literal(SCHEMA_VERSION),
    id,
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    locale: z.literal("pt-BR"),
    status: ReviewStatusSchema,
    technical: z.boolean().default(false),
    publicTitle: text,
    teachingTitle: text,
    group: z.string().max(80),
    specialties: z.array(z.string()).min(1),
    environment: EnvironmentSchema,
    resourceProfile: z.string().min(1),
    difficulty: z.number().int().min(1).max(5),
    level: z.enum(["internato", "residencia"]),
    objectives: z.array(z.string()).min(1),
    keywords: z.array(z.string()).default([]),
    patient: z
      .object({
        name: text,
        ageYears: finite.refine((v) => v >= 0 && v <= 120),
        ageMonths: finite.optional(),
        sex: z.enum(["feminino", "masculino"]),
        weightKg: finite.refine((v) => v > 0 && v < 400),
        heightCm: finite.refine((v) => v > 30 && v < 230),
        pregnancyWeeks: finite.optional(),
        visual: PatientVisualProfileSchema
      })
      .strict(),
    briefing: text,
    communication: z.enum(["normal", "limitada", "incapaz"]),
    informants: z.array(InformantSchema).default([]),
    history: z.array(HistoryItemSchema).min(1),
    initial: z
      .object({
        vars: z.record(z.string(), finite),
        flags: z.record(z.string(), PrimitiveSchema),
        devices: z.array(DeviceSchema).default([]),
        /** variáveis visíveis sem aparelho (ex.: FR por inspeção) */
        visibleWithoutDevice: z.array(VarIdSchema).default(["rr"])
      })
      .strict(),
    exam: z.array(ExamFindingSchema).default([]),
    testResults: z.array(TestResultOverrideSchema).default([]),
    /** ações do catálogo especialmente relevantes; as demais continuam disponíveis conforme recursos */
    highlightedActions: z.array(id).default([]),
    /** falha técnica determinística definida pelo caso */
    procedureFailures: z.array(z.object({ actionId: id, attempts: z.array(z.number().int().min(1)) })).default([]),
    rules: z.array(RuleSchema).default([]),
    diagnosis: z
      .object({
        primary: id,
        accepted: z.array(id).min(1),
        differentials: z.array(id).default([])
      })
      .strict(),
    acceptedDestinations: z.array(DestinationSchema).min(1),
    outcomeNotes: z.string().max(1500),
    scoring: z.array(ScoringRuleSchema).min(1),
    teaching: z
      .object({
        hints: z.array(z.object({ level: z.number().int().min(1).max(4), text, when: ConditionSchema.optional() })).default([]),
        summary: text,
        pathophysiology: text,
        keyPoints: z.array(z.string()).min(1),
        alternatives: z.array(z.string()).default([]),
        oralRubric: z.array(z.object({ id, concept: text, synonyms: z.array(z.string()).min(1), weight: z.number().min(0) })).default([]),
        simplifications: z.array(z.string()).default([])
      })
      .strict(),
    references: z.array(id).min(1),
    tests: z
      .array(
        z.object({
          id,
          kind: z.enum(["acceptable", "no_intervention", "inadequate", "delay", "alternative"]),
          description: text,
          commands: z.array(z.object({ atSeconds: finite, type: z.string(), payload: z.record(z.string(), z.unknown()) })),
          runUntilSeconds: finite,
          expect: z.array(z.object({ condition: ConditionSchema, description: text }))
        })
      )
      .default([]),
    blueprint: z
      .object({
        blueprintId: id,
        seed: z.number().int(),
        parameters: z.record(z.string(), z.union([finite, z.string(), z.boolean()])),
        parentCaseId: id.optional(),
        parentVersion: z.string().optional()
      })
      .optional(),
    variation: z
      .object({
        allowAgeShiftYears: z.number().min(0).max(30).default(0),
        allowSexSwap: z.boolean().default(false),
        allowWeightPercent: z.number().min(0).max(30).default(0),
        allowVisualVariation: z.boolean().default(true),
        forbidden: z.array(z.string()).default([])
      })
      .default({ allowAgeShiftYears: 0, allowSexSwap: false, allowWeightPercent: 0, allowVisualVariation: true, forbidden: [] }),
    reviewLog: z.array(z.object({ date: z.string(), by: z.string(), status: ReviewStatusSchema, note: z.string() })).default([])
  })
  .strict();
export type CaseDefinition = z.infer<typeof CaseDefinitionSchema>;
export type CaseDefinitionInput = z.input<typeof CaseDefinitionSchema>;

export const ReferenceSchema = z
  .object({
    sourceId: id,
    entity: text,
    document: text,
    year: z.string(),
    url: z.string().url(),
    accessedAt: z.string(),
    section: z.string(),
    population: z.string(),
    verification: z.enum(["conteudo_conferido", "localizador_conferido", "nao_acessado"]),
    notes: z.string().default("")
  })
  .strict();
export type Reference = z.infer<typeof ReferenceSchema>;

// ---------------------------------------------------------------------------
// Comandos e eventos
// ---------------------------------------------------------------------------
export const CommandTypeSchema = z.enum([
  "askHistory",
  "examine",
  "performAction",
  "cancelOrder",
  "orderTest",
  "prescribe",
  "stopTreatment",
  "titrateInfusion",
  "setDifferential",
  "setFinalDiagnosis",
  "setDisposition",
  "requestHint",
  "endEncounter",
  "note"
]);
export type CommandType = z.infer<typeof CommandTypeSchema>;

export const LearnerCommandSchema = z
  .object({
    id: z.string().min(1).max(120),
    sessionId: z.string().min(1).max(120),
    type: CommandTypeSchema,
    simTick: z.number().int().min(0),
    payload: z.record(z.string(), z.unknown()),
    origin: z.enum(["interface", "importacao", "rascunho_confirmado", "teste"]),
    correlationId: z.string().max(120).optional()
  })
  .strict();
export type LearnerCommand = z.infer<typeof LearnerCommandSchema>;

export const PrescriptionSchema = z
  .object({
    drugId: id,
    presentationId: id,
    dose: QuantitySchema,
    weightKg: finite.optional(),
    route: RouteSchema,
    mode: z.enum(["bolus", "infusao", "infusao_volume"]),
    rate: QuantitySchema.optional(),
    durationMinutes: finite.optional(),
    diluent: z.enum(["nenhum", "SF0,9%", "SG5%", "AD"]).default("nenhum"),
    finalVolumeMl: finite.optional(),
    monitoring: z.string().max(300).optional()
  })
  .strict();
export type Prescription = z.infer<typeof PrescriptionSchema>;
