import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const BENZO = { any: [{ drugGiven: "diazepam" }, { drugGiven: "midazolam" }] };
const CONTROLE = { any: [{ drugGiven: "diazepam", minTotal: { value: 20, unit: "mg" as const } }, { drugGiven: "midazolam", minTotal: { value: 10, unit: "mg" as const } }] };

export const C102: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C102",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Homem trêmulo, suado, vendo bichos na parede, dois dias sem beber",
  teachingTitle: "Síndrome de abstinência alcoólica grave — estratificar risco, benzodiazepínico precoce (frontloading), tiamina, buscar causas associadas e prevenir convulsão e delirium tremens",
  group: "Psiquiatria",
  specialties: ["Psiquiatria", "Emergência", "Clínica médica"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Reconhecer abstinência alcoólica grave e fatores de risco para complicações (convulsão prévia, delirium prévio, consumo pesado)",
    "Benzodiazepínico precoce, com doses até controle dos sintomas",
    "Tiamina parenteral; glicemia e eletrólitos",
    "Buscar causas associadas: infecção, trauma, sangramento, encefalopatia",
    "Não usar antipsicótico isolado; internar e monitorar"
  ],
  keywords: ["tremor", "suor", "bichos", "parou de beber", "agitado", "insônia"],
  patient: {
    name: "José Carlos Moura",
    ageYears: 52,
    sex: "masculino",
    weightKg: 64,
    heightCm: 170,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 4, hairStyle: "curto", hairColor: "grisalho", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Homem de 52 anos trazido pela irmã: bebe cerca de 1 litro de cachaça por dia há anos e parou há 2 dias por falta de dinheiro. Desde ontem treme muito, não dorme e hoje diz ver insetos na parede.",
  communication: "limitada",
  informants: [{ id: "paciente", name: "José Carlos", role: "Paciente" }, { id: "irma", name: "Neide (irmã)", role: "Irmã" }],
  history: [
    hi("h-consumo", "habitos", "Quanto bebe por dia e quando foi a última dose?", [{ source: "irma", text: "Um litro de pinga por dia, há mais de 20 anos. A última vez foi anteontem à noite." }], ["bebe", "quanto", "última", "dose", "pinga"]),
    hi("h-previas", "antecedentes", "Já teve convulsão ou ficou confuso quando parou de beber?", [{ source: "irma", text: "Há dois anos teve convulsão quando ficou internado e não bebeu. Depois ficou dias falando coisa sem sentido." }], ["convulsão", "confuso", "antes", "parou"]),
    hi("h-sintomas", "fatores_associados", "O que está sentindo? Está vendo ou ouvindo coisas?", [{ source: "paciente", text: "Tô tremendo todo, suando... tem formiga andando na parede, doutor, olha lá!" }], ["sentindo", "vendo", "ouvindo", "bichos"]),
    hi("h-associadas", "sinais_alarme", "Teve febre, tosse, queda, sangue no vômito ou fezes pretas, dor na barriga?", [{ source: "irma", text: "Caiu ontem no banheiro mas não bateu a cabeça forte. Sem vômito com sangue. Tosse um pouco." }], ["febre", "queda", "sangue", "fezes pretas", "barriga", "tosse"]),
    hi("h-medicacoes", "medicacoes", "Toma algum remédio? Outras drogas?", [{ source: "irma", text: "Nenhum remédio. Fuma cigarro." }], ["remédio", "drogas", "fuma"])
  ],
  initial: {
    vars: { hr: 122, sbp: 164, dbp: 98, rr: 22, spo2: 96, temp: 37.9, gcs: 14, pain: 2, glucose: 82, perfusion: 0.8, effort: 0.2, na: 133, k: 3.2, mg: 1.4 },
    flags: { rhythm: "taquicardia_sinusal", tremor: true, sweating: true, agitation: true, posture: "sentado", painVisual: "leve", speech: "frases", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-neuro", "neurologico", "inspecao", "Tremor grosseiro de extremidades; orientado parcialmente; alucinações visuais; sem nistagmo, sem oftalmoplegia, marcha não testada; sem déficit focal.", { label: "Neurológico", better: [{ when: { ruleFired: "r-delirium" }, text: "Desorientado, desatento, agitado, alucinações visuais intensas (delirium)." }, { when: { ruleFired: "r-controle" }, text: "Sonolento mas despertável, tremor discreto, sem alucinações." }] }),
    ex("e-cabeca", "cabeca", "inspecao", "Sem sinais de trauma craniano.", { label: "Crânio" }),
    ex("e-abdome", "abdome_qsd", "palpacao", "Fígado palpável a 3 cm do rebordo, indolor; sem ascite; sem sinais de peritonite.", { label: "Abdome" }),
    ex("e-torax", "torax_anterior", "ausculta", "Murmúrio vesicular presente, sem estertores.", { sound: "murmurio_normal" }),
    ex("e-pele", "pele", "inspecao", "Sudorese profusa; aranhas vasculares; sem icterícia.", { label: "Pele" })
  ],
  testResults: [
    { testId: "eletrolitos", variants: [{ text: "Na 133, K 3,2, Mg 1,4 (baixo)." }] },
    { testId: "hepatograma", variants: [{ text: "AST 140, ALT 62 (AST/ALT > 2); bilirrubina 1,1." }] },
    { testId: "hemograma", variants: [{ text: "Hb 12,8; VCM 104; leucócitos 9.800; plaquetas 118.000." }] },
    { testId: "rx_torax", variants: [{ text: "Sem consolidações." }] },
    { testId: "funcao_renal", variants: [{ text: "Creatinina 0,8." }] }
  ],
  highlightedActions: ["monitorizar", "glicemia_capilar", "acesso_venoso", "ambiente_seguro"],
  rules: [
    { id: "r-curso", description: "Hiperatividade autonômica progressiva", priority: 10, when: { always: true }, repeat: "once", effects: [trend("hr", 132, 1800, "inv", 10), trend("sbp", 174, 1800, "inv", 10), trend("temp", 38.2, 1800, "inv", 10)] },
    { id: "r-benzo", description: "Benzodiazepínico: controle parcial", priority: 30, when: BENZO, repeat: "once", effects: [trend("hr", 108, 600, "bz", 30), trend("sbp", 152, 600, "bz", 30), staff("enfermagem", "Melhorou um pouco, mas ainda treme e vê os bichos.")] },
    { id: "r-controle", description: "Doses até controle (sedação leve)", priority: 40, when: CONTROLE, repeat: "once", effects: [trend("hr", 92, 900, "bz2", 40), trend("sbp", 136, 900, "bz2", 40), trend("temp", 37.2, 1800, "bz2", 40), trend("gcs", 14, 300, "bz2", 40), flag("tremor", false), flag("agitation", false), flag("sweating", false), staff("enfermagem", "Dormindo, desperta ao chamar; sem tremor."), outcome("melhora")] },
    { id: "r-convulsao", description: "Convulsão de abstinência", priority: 35, when: { all: [{ time: "gte", seconds: 1200 }, { not: BENZO }] }, repeat: "once", effects: [flag("seizure", true), staff("enfermagem", "Está convulsionando!"), outcome("piora")] },
    { id: "r-delirium", description: "Delirium tremens", priority: 45, when: { all: [{ time: "gte", seconds: 2700 }, { not: CONTROLE }] }, repeat: "once", effects: [trend("hr", 142, 900, "dt", 45), trend("temp", 38.8, 900, "dt", 45), trend("gcs", 12, 900, "dt", 45), flag("seizure", false), staff("enfermagem", "Muito confuso, arrancou o acesso, febril — precisa de UTI."), outcome("complicacao")] },
    { id: "r-antipsicotico", description: "Antipsicótico sem benzodiazepínico", priority: 30, when: { all: [{ drugGiven: "haloperidol" }, { not: BENZO }] }, repeat: "once", effects: [obs("Antipsicóticos são apenas adjuvantes na abstinência: não tratam a causa e reduzem o limiar convulsivo.")] },
    { id: "r-alta", description: "Alta", priority: 50, when: { any: [{ path: "disposition", op: "eq", value: "alta_orientada" }, { path: "disposition", op: "eq", value: "alta_com_seguimento_ubs" }, { path: "disposition", op: "eq", value: "caps" }] }, repeat: "once", effects: [obs("Abstinência grave com alucinações e convulsão prévia exige internação e monitorização."), outcome("complicacao")] }
  ],
  diagnosis: { primary: "abstinencia_alcool", accepted: ["abstinencia_alcool"], differentials: ["delirium", "sepse", "hipoglicemia", "tce_leve", "intox_estimulante"] },
  acceptedDestinations: ["internacao_enfermaria", "uti"],
  outcomeNotes: "Síndrome de abstinência alcoólica grave (48 h após a última dose; tremor, sudorese, hipertensão, taquicardia, alucinose visual) com alto risco de complicação (convulsão e delirium prévios). Monitor, glicemia, acesso, tiamina parenteral, diazepam em doses repetidas até sedação leve (frontloading), eletrólitos/magnésio, busca de causas associadas, ambiente seguro e internação; UTI se delirium tremens.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Consumo, última dose e complicações prévias", evidence: { kind: "historyAsked", items: ["h-consumo", "h-previas"], minCount: 2 }, points: 10, severity: "critica", rationale: "Estratificação de risco (PAWSS).", sourceIds: ["INT-ASAM-AWS-2020"] },
    { id: "s-assoc", domain: "historia", description: "Causas associadas", evidence: { kind: "historyAsked", items: ["h-associadas", "h-medicacoes"], minCount: 1 }, points: 6, severity: "importante", rationale: "Infecção, trauma, sangramento." },
    { id: "s-mon", domain: "priorizacao", description: "Monitorização e glicemia", evidence: { kind: "actionDone", anyOf: ["glicemia_capilar"], withinSeconds: 600 }, points: 6, severity: "importante", rationale: "Hipoglicemia simula/agrava." },
    { id: "s-benzo", domain: "tratamento", description: "Benzodiazepínico precoce", evidence: { kind: "drugGiven", anyOf: ["diazepam", "midazolam"], withinSeconds: 900 }, points: 18, severity: "critica", rationale: "Primeira linha; previne convulsão e delirium.", sourceIds: ["INT-ASAM-AWS-2020"] },
    { id: "s-controle", domain: "tratamento", description: "Doses até controle (frontloading)", evidence: { kind: "drugGiven", anyOf: ["diazepam"], minTotal: { value: 20, unit: "mg" }, withinSeconds: 2400 }, points: 10, severity: "critica", rationale: "Alto risco de complicação.", sourceIds: ["INT-ASAM-AWS-2020"] },
    { id: "s-tiamina", domain: "tratamento", description: "Tiamina parenteral", evidence: { kind: "drugGiven", anyOf: ["tiamina"], routes: ["IV", "IM"] }, points: 10, severity: "critica", rationale: "Prevenção de Wernicke.", sourceIds: ["INT-ASAM-AWS-2020"] },
    { id: "s-labs", domain: "exames", description: "Eletrólitos/magnésio", evidence: { kind: "testOrdered", anyOf: ["eletrolitos"] }, points: 6, severity: "importante", rationale: "Hipomagnesemia e hipocalemia." },
    { id: "s-exame", domain: "historia", description: "Neurológico, crânio e abdome", evidence: { kind: "examDone", regions: ["neurologico", "cabeca", "abdome_qsd"], minCount: 2 }, points: 6, severity: "importante", rationale: "Wernicke, trauma, hepatopatia." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou após benzodiazepínico", evidence: { kind: "reassessAfter", after: ["diazepam", "midazolam"], reassess: ["neurologico", "monitorizar"], withinSeconds: 1200 }, points: 8, severity: "importante", rationale: "Titular por sintomas; evitar sedação excessiva.", sourceIds: ["INT-ASAM-AWS-2020"] },
    { id: "s-convulsao", domain: "tratamento", description: "Falha: convulsão", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-convulsao" } }, points: 10, penalty: true, severity: "critica", rationale: "Benzodiazepínico tardio." },
    { id: "s-dt", domain: "tratamento", description: "Falha: delirium tremens", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-delirium" } }, points: 10, penalty: true, severity: "critica", rationale: "Subtratamento." },
    { id: "s-antipsi", domain: "tratamento", description: "Falha: antipsicótico isolado", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-antipsicotico" } }, points: 6, penalty: true, severity: "importante", rationale: "Apenas adjuvante.", sourceIds: ["INT-ASAM-AWS-2020"] },
    { id: "s-dx", domain: "destino", description: "Abstinência alcoólica", evidence: { kind: "diagnosis", accepted: ["abstinencia_alcool"] }, points: 8, severity: "importante", rationale: "Grave, com alucinose." },
    { id: "s-destino", domain: "destino", description: "Internação (UTI se delirium)", evidence: { kind: "disposition", accepted: ["internacao_enfermaria", "uti"] }, points: 12, severity: "critica", rationale: "Monitorização." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Quando foi a última dose e o que aconteceu nas abstinências anteriores?" },
      { level: 2, text: "Qual classe é primeira linha e por quê?" },
      { level: 3, text: "Que vitamina dar a todo etilista grave?" },
      { level: 4, text: "Sugestão explícita: monitor, glicemia, acesso, tiamina, diazepam 10 mg repetido até controle, eletrólitos, exame neurológico, internar." }
    ],
    summary: "Abstinência alcoólica grave com alucinose e alto risco (convulsão e delirium prévios).",
    pathophysiology: "O uso crônico de álcool potencializa o GABA e inibe o NMDA; com a suspensão, há hipofunção GABAérgica e hiperatividade glutamatérgica e adrenérgica: tremor, sudorese, taquicardia, alucinações (12–48 h), convulsões (6–48 h) e delirium tremens (48–96 h). Episódios prévios aumentam o risco (kindling).",
    keyPoints: [
      "Estratificar risco; CIWA-Ar monitora resposta, não faz diagnóstico.",
      "Benzodiazepínico é primeira linha; frontloading se alto risco; sintomas guiam as doses.",
      "Convulsão: benzodiazepínico IV rápido; delirium: benzodiazepínico parenteral até sedação leve.",
      "Antipsicótico só como adjuvante; tiamina parenteral nos graves.",
      "Buscar infecção, trauma, sangramento, distúrbios eletrolíticos."
    ],
    alternatives: ["Midazolam IV/IM se diazepam indisponível.", "Fenobarbital por equipe experiente em casos refratários."],
    oralRubric: [
      { id: "o1", concept: "Benzodiazepínico", synonyms: ["diazepam", "benzodiazepínico", "frontloading"], weight: 3 },
      { id: "o2", concept: "Tiamina", synonyms: ["tiamina", "wernicke", "b1"], weight: 2 },
      { id: "o3", concept: "Risco de complicação", synonyms: ["convulsão prévia", "delirium tremens", "kindling", "pawss"], weight: 2 },
      { id: "o4", concept: "Causas associadas", synonyms: ["infecção", "trauma", "eletrólitos", "magnésio"], weight: 2 }
    ],
    simplifications: ["CIWA-Ar não calculado.", "Reposição de magnésio/potássio não modelada."]
  },
  references: ["INT-ASAM-AWS-2020", "BR-ABP-AGITACAO-2019", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "História, monitor, glicemia, acesso, tiamina, diazepam 10 + 10 mg, eletrólitos, reavaliação, internação", commands: [ask(10, "h-consumo"), ask(20, "h-previas"), ask(30, "h-associadas"), act(40, "monitorizar"), act(50, "glicemia_capilar"), act(100, "acesso_venoso"), rx(200, "tiamina", "amp100", 100, "mg", "IV"), rx(220, "diazepam", "amp10", 10, "mg", "IV"), test(230, "eletrolitos"), { atSeconds: 300, type: "examine", payload: { region: "neurologico", maneuver: "inspecao" } }, { atSeconds: 310, type: "examine", payload: { region: "cabeca", maneuver: "inspecao" } }, rx(600, "diazepam", "amp10", 10, "mg", "IV"), { atSeconds: 1200, type: "examine", payload: { region: "neurologico", maneuver: "inspecao" } }, dx(1300, "abstinencia_alcool"), dest(1500, "internacao_enfermaria")], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-controle" }, description: "controle" }, { condition: { not: { ruleFired: "r-convulsao" } }, description: "sem convulsão" }, { condition: { not: { ruleFired: "r-delirium" } }, description: "sem delirium" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-convulsao" }, description: "convulsão" }, { condition: { ruleFired: "r-delirium" }, description: "delirium tremens" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Haloperidol isolado e encaminha ao CAPS", commands: [rx(100, "haloperidol", "amp5", 5, "mg", "IM"), dest(900, "caps")], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-antipsicotico" }, description: "antipsicótico isolado" }, { condition: { ruleFired: "r-alta" }, description: "sem internação" }, { condition: { ruleFired: "r-convulsao" }, description: "convulsão" }] },
    { id: "t-atraso", kind: "delay", description: "Benzodiazepínico só após convulsão; dose única; UTI", commands: [act(40, "monitorizar"), act(100, "acesso_venoso"), rx(1300, "diazepam", "amp10", 10, "mg", "IV"), rx(1400, "tiamina", "amp100", 100, "mg", "IV"), dest(3200, "uti")], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-convulsao" }, description: "convulsão" }, { condition: { ruleFired: "r-delirium" }, description: "delirium tremens" }] },
    { id: "t-alternativa", kind: "alternative", description: "Diazepam VO repetido (paciente colaborativo)", commands: [act(30, "glicemia_capilar"), rx(60, "diazepam", "cp10", 10, "mg", "VO"), act(80, "acesso_venoso"), rx(180, "tiamina", "amp100", 100, "mg", "IV"), rx(700, "diazepam", "cp10", 10, "mg", "VO"), dest(1500, "internacao_enfermaria")], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-controle" }, description: "controle" }, { condition: { not: { ruleFired: "r-convulsao" } }, description: "sem convulsão" }] }
  ]
};
