import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, trend } from "./helpers";

const GLICOSE = { any: [{ drugGiven: "glicose50", minTotal: { value: 10, unit: "g" as const } }, { drugGiven: "glucagon" }] };

export const C051: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C051",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Confusão e suor frio em casa",
  teachingTitle: "Hipoglicemia grave em usuário de insulina — atendimento pré-hospitalar",
  group: "Endocrinologia e metabolismo",
  specialties: ["Endocrinologia", "Emergência pré-hospitalar"],
  environment: "ambulancia",
  resourceProfile: "samu-usa",
  difficulty: 2,
  level: "internato",
  objectives: [
    "Medir glicemia capilar precocemente em alteração de consciência",
    "Corrigir hipoglicemia por via adequada ao nível de consciência",
    "Reavaliar glicemia e antecipar recorrência por insulina de ação intermediária",
    "Decidir transporte com a regulação médica do SAMU 192"
  ],
  keywords: ["confuso", "suor", "diabetes", "insulina", "SAMU", "domicílio"],
  patient: {
    name: "Valdir Rodrigues",
    ageYears: 58,
    sex: "masculino",
    weightKg: 76,
    heightCm: 168,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 5, hairStyle: "crespo_curto", hairColor: "grisalho", build: "robusto", pregnancyTrimester: 0 }
  },
  briefing:
    "SAMU 192 — Unidade de Suporte Avançado. Chamado às 6h40: homem de 58 anos encontrado pela esposa confuso e suado. A equipe já o colocou na maca dentro da ambulância, ainda estacionada em frente à casa.",
  communication: "limitada",
  informants: [{ id: "esposa", name: "Dona Marta", role: "Esposa" }],
  history: [
    hi("h-queixa", "queixa", "O que aconteceu com ele?", [{ source: "esposa", text: "Acordei e ele estava falando coisa sem sentido, todo molhado de suor, tremendo." }, { source: "paciente", text: "Tô… bem… me deixa…" }], ["aconteceu", "houve"]),
    hi("h-diabetes", "antecedentes", "Ele tem alguma doença?", [{ source: "esposa", text: "Diabetes há 15 anos e pressão alta." }], ["doença", "diabetes"]),
    hi("h-insulina", "medicacoes", "Quais remédios ele usa? Aplicou insulina?", [{ source: "esposa", text: "Usa insulina NPH de manhã e à noite, metformina e losartana. Ontem à noite aplicou a NPH como sempre, mas quase não jantou porque estava enjoado." }], ["insulina", "remédio", "nph"]),
    hi("h-alimentacao", "alimentacao_eliminacoes", "Ele comeu normalmente ontem?", [{ source: "esposa", text: "Quase nada. Teve uma diarreia leve ontem e ficou sem fome." }], ["comeu", "jantou", "alimentação"]),
    hi("h-alcool", "habitos", "Bebeu álcool?", [{ source: "esposa", text: "Não bebe." }], ["bebe", "álcool"]),
    hi("h-trauma", "sinais_alarme", "Bateu a cabeça ou teve convulsão?", [{ source: "esposa", text: "Não vi ele cair nem ter convulsão." }], ["caiu", "cabeça", "convulsão"]),
    hi("h-alergias", "alergias", "Tem alergia a remédio?", [{ source: "esposa", text: "Não que eu saiba." }])
  ],
  initial: {
    vars: { hr: 104, sbp: 152, dbp: 88, rr: 18, spo2: 97, temp: 36.1, gcs: 11, pain: 0, glucose: 36, perfusion: 0.85, effort: 0.3, k: 3.9, na: 136, creat: 1.1, urea: 38 },
    flags: { rhythm: "taquicardia_sinusal", consciousness: "voz", speech: "palavras", sweating: true, tremor: true, agitation: true, posture: "supino", communication: "limitada" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Confuso, agitado, sudorese profusa e tremores finos. Abre os olhos ao chamado; resposta verbal confusa.", {
      better: [{ when: { ruleFired: "r-correcao" }, text: "Alerta, orientado, ainda um pouco sudoreico; pergunta o que aconteceu." }]
    }),
    ex("e-neuro", "neurologico", "especial", "Glasgow 11 (O3 V3 M5); pupilas isocóricas e fotorreagentes; move os quatro membros, sem déficit focal evidente.", {
      better: [{ when: { ruleFired: "r-correcao" }, text: "Glasgow 15; sem déficit focal." }]
    }),
    ex("e-cabeca", "cabeca", "inspecao", "Sem sinais de trauma craniofacial.", {}),
    ex("e-pele", "pele", "palpacao", "Pele fria e úmida.", { better: [{ when: { ruleFired: "r-correcao" }, text: "Pele ainda úmida, aquecendo." }] }),
    ex("e-torax", "torax_anterior", "ausculta", "Murmúrio vesicular presente bilateralmente, sem ruídos adventícios.", { sound: "murmurio_normal" })
  ],
  testResults: [
    { testId: "ecg12", variants: [{ text: "Taquicardia sinusal, sem alterações agudas.", ecg: { rhythm: "taquicardia_sinusal", rate: 104, stElevationLeads: [], stDepressionLeads: [], peakedT: false, wideQrs: false } }] }
  ],
  highlightedActions: ["glicemia_capilar", "avaliar_glasgow", "monitorizar", "acesso_venoso", "acionar_samu", "passagem_caso"],
  rules: [
    {
      id: "r-sem-glicose",
      description: "Sem correção, a neuroglicopenia progride para crise convulsiva",
      priority: 5,
      when: { all: [{ time: "gte", seconds: 600 }, { not: GLICOSE }] },
      repeat: "once",
      effects: [trend("glucose", 28, 300, "doenca", 10), flag("seizure", true), flag("consciousness", "dor"), flag("speech", "nenhuma"), { type: "changeCommunication", state: "incapaz" }, { type: "setValue", var: "gcs", value: 7 }, staff("acompanhante", "Ele está se debatendo! Está tendo um ataque!"), outcome("piora")]
    },
    {
      id: "r-crise-autolimitada",
      description: "Crise cessa após ~2 min, paciente segue rebaixado",
      when: { elapsedSince: "rule:r-sem-glicose", op: "gte", seconds: 120 },
      repeat: "once",
      effects: [flag("seizure", false)]
    },
    {
      id: "r-correcao",
      description: "Glicose IV (ou glucagon IM) corrige a hipoglicemia",
      priority: 60,
      when: GLICOSE,
      repeat: "once",
      effects: [trend("glucose", 145, 90, "glicose", 50, 1500), flag("seizure", false), flag("agitation", false), flag("tremor", false)]
    },
    {
      id: "r-despertar",
      description: "Consciência retorna alguns minutos após a correção",
      when: { all: [{ ruleFired: "r-correcao" }, { path: "vars.glucose", op: "gte", value: 80 }] },
      repeat: "once",
      effects: [flag("consciousness", "alerta"), flag("speech", "frases"), { type: "changeCommunication", state: "normal" }, { type: "setValue", var: "gcs", value: 15 }, trend("hr", 86, 300, "rec", 50), trend("perfusion", 1, 300, "rec", 50), flag("sweating", false), outcome("melhora")]
    },
    {
      id: "r-recorrencia",
      description: "Insulina NPH ainda ativa: glicemia volta a cair cerca de 25 min após o bolus (exige reavaliação)",
      priority: 70,
      when: { elapsedSince: "rule:r-correcao", op: "gte", seconds: 1500 },
      repeat: "once",
      effects: [trend("glucose", 58, 600, "recorrencia", 70), obs("Paciente volta a ficar sudoreico e um pouco lento para responder.")]
    },
    {
      id: "r-recorrencia-tratada",
      description: "Nova oferta de glicose após recorrência estabiliza",
      priority: 80,
      when: { all: [{ ruleFired: "r-recorrencia" }, { drugGiven: "glicose50", minTotal: { value: 35, unit: "g" } }] },
      repeat: "once",
      effects: [trend("glucose", 130, 120, "glic2", 85)]
    },
    {
      id: "r-naloxona",
      description: "Naloxona não tem efeito na hipoglicemia",
      when: { drugGiven: "naloxona" },
      repeat: "once",
      effects: [obs("Sem mudança após naloxona: a alteração de consciência não é por opioide.")]
    },
    {
      id: "r-regulacao",
      description: "Regulação médica orienta transporte",
      when: { actionCompleted: "acionar_samu" },
      repeat: "once",
      effects: [staff("regulacao", "Regulação: usuário de NPH com hipoglicemia grave tem risco de recorrência. Transportar para UPA de referência com glicemia de controle no trajeto; vaga liberada.")]
    }
  ],
  diagnosis: { primary: "hipoglicemia", accepted: ["hipoglicemia"], differentials: ["avc_isquemico", "intox_opioide", "intox_alcool", "encefalopatia_metabolica", "crise_epileptica_isolada", "sepse"] },
  acceptedDestinations: ["transferencia_regulada"],
  outcomeNotes: "Glicose IV (ou glucagon IM) corrige em minutos; a insulina NPH causa recorrência cerca de 25 min depois, exigindo nova glicemia e oferta de glicose. Sem correção, há crise convulsiva aos 10 min.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Investigou insulina em uso e ingestão alimentar", evidence: { kind: "historyAsked", items: ["h-insulina", "h-alimentacao", "h-diabetes"], minCount: 2 }, points: 12, severity: "importante", rationale: "Tipo de insulina e jejum explicam a causa e o risco de recorrência." },
    { id: "s-hist-trauma", domain: "historia", description: "Perguntou sobre trauma, álcool ou convulsão", evidence: { kind: "historyAsked", items: ["h-trauma", "h-alcool"], minCount: 1 }, points: 4, severity: "menor", rationale: "Diferenciais de rebaixamento no domicílio." },
    { id: "s-glasgow", domain: "historia", description: "Avaliou nível de consciência", evidence: { kind: "actionDone", anyOf: ["avaliar_glasgow"] }, points: 4, severity: "menor", rationale: "Documentar Glasgow antes e depois." },
    { id: "s-hgt", domain: "priorizacao", description: "Glicemia capilar em até 2 minutos", evidence: { kind: "actionDone", anyOf: ["glicemia_capilar"], withinSeconds: 120 }, points: 15, severity: "critica", rationale: "Todo rebaixamento de consciência exige glicemia capilar imediata.", sourceIds: ["BR-SAMU-SAV"] },
    { id: "s-glicose", domain: "tratamento", description: "Glicose hipertônica IV ou glucagon IM em até 5 minutos", evidence: { kind: "drugGiven", anyOf: ["glicose50", "glucagon"], withinSeconds: 300 }, points: 15, severity: "critica", rationale: "Paciente sem condição de deglutir com segurança: via IV, ou glucagon IM sem acesso.", alternatives: "Glucagon IM 1 mg quando não houver acesso venoso.", sourceIds: ["BR-SAMU-SAV", "BR-SBD"] },
    { id: "s-acesso", domain: "tratamento", description: "Acesso venoso", evidence: { kind: "actionDone", anyOf: ["acesso_venoso"] }, points: 5, severity: "importante", rationale: "Necessário para glicose IV e manutenção." },
    { id: "s-monitor", domain: "priorizacao", description: "Monitorização", evidence: { kind: "actionDone", anyOf: ["monitorizar"], withinSeconds: 300 }, points: 5, severity: "menor", rationale: "Avaliação de ritmo e sinais vitais no transporte." },
    { id: "s-exames", domain: "exames", description: "Sem exames desnecessários no pré-hospitalar", evidence: { kind: "testsNotExcessive", maxUnjustified: 0, justified: ["ecg12"] }, points: 15, severity: "menor", rationale: "No pré-hospitalar, glicemia capilar é o exame decisivo." },
    { id: "s-rehgt", domain: "reavaliacao", description: "Repetiu glicemia capilar após a correção", evidence: { kind: "reassessAfter", after: ["glicose50", "glucagon"], reassess: ["glicemia_capilar"], withinSeconds: 1200 }, points: 10, severity: "importante", rationale: "Confirmar resposta e detectar recorrência." },
    { id: "s-regulacao", domain: "destino", description: "Contato com a regulação médica e passagem do caso", evidence: { kind: "actionDone", anyOf: ["acionar_samu", "passagem_caso"] }, points: 4, severity: "importante", rationale: "No SAMU, o destino é definido com a central de regulação.", sourceIds: ["BR-SAMU"] },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de hipoglicemia", evidence: { kind: "diagnosis", accepted: ["hipoglicemia"] }, points: 2, severity: "importante", rationale: "Glicemia < 70 mg/dL com neuroglicopenia e reversão com glicose." },
    { id: "s-destino", domain: "destino", description: "Transporte regulado (não liberar no domicílio)", evidence: { kind: "disposition", accepted: ["transferencia_regulada"] }, points: 4, severity: "importante", rationale: "Insulina NPH e jejum/diarreia: alto risco de recorrência; liberar no local seria inseguro." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Qual exame simples à beira do paciente é obrigatório em toda alteração de consciência?" },
      { level: 2, text: "Ele consegue engolir com segurança? Qual via usar?" },
      { level: 3, text: "Qual insulina ele usa e até quando ela age?" },
      { level: 4, text: "Sugestão explícita: glicemia capilar, glicose 50% IV (ou glucagon IM), nova glicemia em 10–15 min e transporte regulado." }
    ],
    summary: "Homem de 58 anos com DM2 em uso de NPH, jejum e diarreia, encontrado confuso e sudoreico: hipoglicemia grave (36 mg/dL).",
    pathophysiology: "Insulina exógena sem ingestão adequada reduz a glicose abaixo do limiar: resposta adrenérgica (sudorese, tremor, taquicardia) e neuroglicopenia (confusão, convulsão, coma). A NPH tem pico em 4–8 h e duração prolongada; a correção com bolus de glicose é transitória.",
    keyPoints: [
      "Glicemia capilar em todo rebaixamento de consciência.",
      "Sem deglutição segura: glicose IV; sem acesso, glucagon IM.",
      "Reavaliar glicemia e prever recorrência com insulina de ação prolongada ou sulfonilureia.",
      "No SAMU, o destino é decidido com a regulação médica (192)."
    ],
    alternatives: ["Glucagon 1 mg IM quando não há acesso venoso."],
    oralRubric: [
      { id: "o1", concept: "Glicemia capilar imediata", synonyms: ["glicemia", "hgt", "dextro"], weight: 3 },
      { id: "o2", concept: "Glicose IV ou glucagon", synonyms: ["glicose", "glucagon", "hipertônica"], weight: 3 },
      { id: "o3", concept: "Recorrência por NPH", synonyms: ["recorrência", "nph", "volta", "repetir"], weight: 2 },
      { id: "o4", concept: "Regulação e transporte", synonyms: ["regulação", "transporte", "samu", "192"], weight: 1 }
    ],
    simplifications: ["Momento da recorrência (25 min) e magnitude são parâmetros didáticos.", "Doses de glicose 50% devem ser conferidas no protocolo do serviço (validação pendente)."]
  },
  references: ["BR-SAMU-SAV", "BR-SAMU", "BR-SBD", "AUTOR-SIMPLIFICACAO"],
  tests: [
    {
      id: "t-aceitavel",
      kind: "acceptable",
      description: "Glicemia, acesso, glicose 50% 25 g, regulação e nova glicose na recorrência",
      commands: [act(5, "glicemia_capilar"), ask(10, "h-insulina"), act(50, "acesso_venoso"), act(145, "acesso_venoso"), rx(240, "glicose50", "amp10", 25, "g", "IV"), act(600, "glicemia_capilar"), act(700, "acionar_samu"), act(1900, "glicemia_capilar"), rx(1950, "glicose50", "amp10", 10, "g", "IV"), dx(2100, "hipoglicemia"), dest(2100, "transferencia_regulada")],
      runUntilSeconds: 2400,
      expect: [{ condition: { ruleFired: "r-despertar" }, description: "despertou" }, { condition: { ruleFired: "r-recorrencia-tratada" }, description: "recorrência tratada" }, { condition: { path: "vars.glucose", op: "gte", value: 90 }, description: "glicemia ≥ 90" }]
    },
    {
      id: "t-sem-intervencao",
      kind: "no_intervention",
      description: "Sem tratamento",
      commands: [],
      runUntilSeconds: 800,
      expect: [{ condition: { ruleFired: "r-sem-glicose" }, description: "crise convulsiva" }]
    },
    {
      id: "t-inadequada",
      kind: "inadequate",
      description: "Naloxona empírica sem medir glicemia",
      commands: [act(5, "acesso_venoso"), act(100, "acesso_venoso"), rx(200, "naloxona", "amp04", 0.4, "mg", "IV")],
      runUntilSeconds: 700,
      expect: [{ condition: { ruleFired: "r-naloxona" }, description: "sem efeito" }, { condition: { ruleFired: "r-sem-glicose" }, description: "convulsão" }]
    },
    {
      id: "t-atraso",
      kind: "delay",
      description: "Glicose só após a crise; sem reavaliação da recorrência",
      commands: [act(620, "acesso_venoso"), act(720, "acesso_venoso"), rx(800, "glicose50", "amp10", 25, "g", "IV")],
      runUntilSeconds: 3300,
      expect: [{ condition: { ruleFired: "r-sem-glicose" }, description: "crise antes da correção" }, { condition: { ruleFired: "r-recorrencia" }, description: "recorrência ocorre" }, { condition: { path: "vars.glucose", op: "lt", value: 90 }, description: "glicemia caindo sem nova glicose" }]
    },
    {
      id: "t-alternativa",
      kind: "alternative",
      description: "Glucagon IM sem acesso venoso",
      commands: [act(5, "glicemia_capilar"), rx(60, "glucagon", "fa1mg", 1, "mg", "IM")],
      runUntilSeconds: 900,
      expect: [{ condition: { ruleFired: "r-correcao" }, description: "correção" }, { condition: { ruleFired: "r-despertar" }, description: "despertou" }]
    }
  ]
};
