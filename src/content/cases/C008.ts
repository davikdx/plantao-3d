import type { CaseDefinitionInput } from "../../domain/schema";
import { act, dest, dx, ex, flag, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const VENTILACAO = { any: [{ deviceActive: "bvm" }, { deviceActive: "tot" }] };
const NORA = { treatmentActive: "noradrenalina" };

export const C008: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C008",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Logo após a reanimação, o pulso voltou — e agora?",
  teachingTitle: "Cuidados pós-retorno da circulação espontânea — oxigenação, PA, ECG e reperfusão via regulação",
  group: "Reanimação, instabilidade e choque",
  specialties: ["Emergência", "Cardiologia", "Terapia intensiva"],
  environment: "emergencia",
  resourceProfile: "upa-porte-ii",
  difficulty: 4,
  level: "internato",
  objectives: [
    "Garantir via aérea e ventilação com metas de SpO₂ (92–98%) e normocapnia",
    "Tratar hipotensão pós-PCR (PAM ≥ 65)",
    "Obter ECG de 12 derivações e identificar IAMCSST",
    "Controlar glicemia e evitar hipertermia",
    "Regular para hemodinâmica/UTI"
  ],
  keywords: ["parada", "reanimação", "pulso voltou", "pós-parada"],
  patient: {
    name: "Jorge Batista",
    ageYears: 57,
    sex: "masculino",
    weightKg: 86,
    heightCm: 175,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 3, hairStyle: "curto", hairColor: "preto", build: "robusto", pregnancyTrimester: 0 }
  },
  briefing: "Sala vermelha de UPA 24h. Homem de 57 anos teve PCR em fibrilação ventricular na recepção após dor torácica; recebeu RCP, 2 choques e 1 mg de adrenalina. Há 2 minutos houve retorno da circulação. Está em ventilação com bolsa-válvula-máscara.",
  communication: "incapaz",
  informants: [{ id: "enf", name: "Enfermeiro Caio", role: "Equipe da sala vermelha" }, { id: "familia", name: "Irmã do paciente", role: "Acompanhante" }],
  history: [
    hi("h-evento", "queixa", "Como foi a parada?", [{ source: "enf", text: "Chegou com dor no peito há 40 min e caiu na recepção. FV no monitor; RCP imediata, dois choques, adrenalina; RCE em 8 minutos." }], ["parada", "como foi"]),
    hi("h-antecedentes", "antecedentes", "Que doenças ele tem?", [{ source: "familia", text: "Hipertenso e fumante. Não sabemos de outras." }], ["doenças"]),
    hi("h-alergias", "alergias", "Tem alergia?", [{ source: "familia", text: "Não sabemos." }])
  ],
  initial: {
    vars: { hr: 116, sbp: 78, dbp: 44, rr: 8, spo2: 88, temp: 37.4, gcs: 5, pain: 0, glucose: 286, perfusion: 0.35, effort: 0, etco2: 48, ph: 7.16, pco2: 56, hco3: 19, lactate: 6.8, k: 3.8 },
    flags: { rhythm: "sinusal_supra", pulse: true, consciousness: "dor", speech: "nenhuma", airway: "risco", communication: "incapaz", posture: "supino", rosc: true },
    devices: ["monitor_ecg", "oximetro", "manguito", "pas_desfibrilador", "acesso_periferico", "bvm"],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-neuro", "neurologico", "especial", "Glasgow 5 (sem abertura ocular, sem verbalização, flexão anormal à dor); pupilas isocóricas fotorreagentes.", { label: "Neurológico" }),
    ex("e-pulmao", "torax_anterior", "ausculta", "Murmúrio bilateral durante as ventilações; sem assimetria.", { sound: "murmurio_normal" }),
    ex("e-pulso", "membro_superior_d", "palpacao", "Pulso fino, 116 bpm; extremidades frias.", { label: "Perfusão", better: [{ when: { ruleFired: "r-nora" }, text: "Pulso mais cheio; extremidades menos frias." }] })
  ],
  testResults: [
    { testId: "ecg12", variants: [{ text: "Ritmo sinusal 116 bpm; supradesnivelamento de ST de V1 a V5 e DI/aVL — IAM anterior extenso.", ecg: { rhythm: "sinusal_supra", rate: 116, stElevationLeads: ["V1", "V2", "V3", "V4", "V5", "DI", "aVL"], stDepressionLeads: ["DIII", "aVF"], peakedT: false, wideQrs: false } }] }
  ],
  highlightedActions: ["ventilar_bvm", "intubacao", "monitorizar", "acesso_venoso", "glicemia_capilar", "acionar_samu"],
  rules: [
    { id: "r-ventilacao", description: "Ventilação assistida: oxigenação e CO₂ em melhora", priority: 40, when: VENTILACAO, repeat: "while", effects: [trend("spo2", 96, 120, "vent", 40), trend("pco2", 42, 600, "vent", 40), trend("ph", 7.28, 900, "vent", 40), trend("etco2", 38, 300, "vent", 40)], onEnd: [{ type: "clearTrend", var: "spo2", slot: "vent" }, { type: "clearTrend", var: "pco2", slot: "vent" }] },
    { id: "r-sem-ventilacao", description: "Sem ventilação assistida: hipoxemia", priority: 35, when: { not: VENTILACAO }, repeat: "while", effects: [trend("spo2", 74, 120, "hipovent", 35), trend("pco2", 70, 600, "hipovent", 35)], onEnd: [{ type: "clearTrend", var: "spo2", slot: "hipovent" }, { type: "clearTrend", var: "pco2", slot: "hipovent" }] },
    { id: "r-nora", description: "Noradrenalina: PAM ≥ 65 enquanto em infusão", priority: 50, when: NORA, repeat: "while", effects: [trend("sbp", 108, 180, "nora", 50), trend("dbp", 64, 180, "nora", 50), trend("perfusion", 0.6, 300, "nora", 50)], onEnd: [{ type: "clearTrend", var: "sbp", slot: "nora" }, { type: "clearTrend", var: "dbp", slot: "nora" }] },
    { id: "r-volume", description: "Cristaloide: resposta parcial", priority: 30, when: { any: [{ drugGiven: "sf09", minTotal: { value: 500, unit: "mL" } }, { drugGiven: "ringer_lactato", minTotal: { value: 500, unit: "mL" } }] }, repeat: "once", effects: [trend("sbp", 86, 300, "vol", 30, 1200)] },
    { id: "r-nova-pcr", description: "Hipotensão/hipoxemia persistentes: nova PCR em FV", priority: 100, when: { all: [{ time: "gte", seconds: 1200 }, { any: [{ not: NORA }, { not: VENTILACAO }] }] }, repeat: "once", effects: [flag("rhythm", "fv"), flag("pulse", false), { type: "setValue", var: "sbp", value: 0 }, { type: "setValue", var: "dbp", value: 0 }, staff("enfermagem", "FV de novo! Sem pulso!"), outcome("parada", true)] },
    { id: "r-hiperglicemia", description: "Glicemia alta registrada", when: { actionCompleted: "glicemia_capilar" }, repeat: "once", effects: [obs("Glicemia 286 mg/dL: hiperglicemia de estresse; controlar (evitar hipoglicemia) conforme protocolo.")] },
    { id: "r-regulacao", description: "Regulação para hemodinâmica", when: { actionCompleted: "acionar_samu" }, repeat: "once", effects: [staff("regulacao", "Regulação: IAMCSST pós-PCR aceito para cateterismo de emergência no hospital de referência; USA chega em 20 min. Manter vasopressor e ventilação no transporte.")] },
    { id: "r-estavel", description: "Metas atingidas por 10 min", priority: 60, when: { all: [NORA, VENTILACAO, { elapsedSince: "drug:noradrenalina", op: "gte", seconds: 600 }] }, repeat: "once", effects: [outcome("estabilizacao_parcial")] }
  ],
  diagnosis: { primary: "iamcsst", accepted: ["iamcsst", "pcr_fv"], differentials: ["pcr_fv", "choque_cardiogenico", "tep", "hipercalemia", "disseccao_aorta"] },
  acceptedDestinations: ["transferencia_regulada"],
  outcomeNotes: "Pós-RCE: via aérea e ventilação (SpO₂ 92–98%, normocapnia), PAM ≥ 65 com vasopressor, ECG de 12 derivações (IAMCSST → cateterismo de emergência), glicemia, controle de temperatura e regulação. Hipotensão e hipoxemia não tratadas precipitam nova PCR.",
  scoring: [
    { id: "s-contexto", domain: "historia", description: "Obteve dados da PCR (ritmo, tempo, causa provável)", evidence: { kind: "historyAsked", items: ["h-evento"], minCount: 1 }, points: 4, severity: "importante", rationale: "Dor torácica + FV sugerem causa coronariana." },
    { id: "s-neuro", domain: "historia", description: "Avaliação neurológica e respiratória", evidence: { kind: "examDone", regions: ["neurologico", "torax_anterior"], minCount: 2 }, points: 6, severity: "importante", rationale: "Glasgow orienta via aérea e prognóstico." },
    { id: "s-via-aerea", domain: "priorizacao", description: "Manteve ventilação assistida / via aérea avançada", evidence: { kind: "stateAtEnd", when: VENTILACAO }, points: 10, severity: "critica", rationale: "Glasgow 5 e hipoventilação.", sourceIds: ["INT-AHA-ALS"] },
    { id: "s-ecg", domain: "exames", description: "ECG de 12 derivações em até 10 min", evidence: { kind: "testOrdered", anyOf: ["ecg12"], withinSeconds: 600 }, points: 10, severity: "critica", rationale: "IAMCSST pós-PCR indica cateterismo de emergência.", sourceIds: ["INT-AHA-ALS"] },
    { id: "s-exames", domain: "exames", description: "Gasometria, eletrólitos, glicemia", evidence: { kind: "testOrdered", anyOf: ["gaso_arterial", "gaso_venosa", "eletrolitos"] }, points: 5, severity: "importante", rationale: "Metas ventilatórias e causas reversíveis." },
    { id: "s-nora", domain: "tratamento", description: "Vasopressor para PAM ≥ 65", evidence: { kind: "drugGiven", anyOf: ["noradrenalina"], withinSeconds: 900 }, points: 15, severity: "critica", rationale: "Hipotensão pós-PCR piora a lesão cerebral e miocárdica.", sourceIds: ["INT-AHA-ALS"] },
    { id: "s-glicemia", domain: "tratamento", description: "Glicemia capilar", evidence: { kind: "actionDone", anyOf: ["glicemia_capilar"] }, points: 4, severity: "importante", rationale: "Evitar hipo e hiperglicemia." },
    { id: "s-acesso", domain: "tratamento", description: "Segundo acesso", evidence: { kind: "actionDone", anyOf: ["acesso_venoso", "acesso_io"] }, points: 3, severity: "menor", rationale: "Vasopressor e outras drogas." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou PA e gasometria após medidas", evidence: { kind: "reassessAfter", after: ["noradrenalina"], reassess: ["medir_pa", "gaso_arterial", "gaso_venosa"], withinSeconds: 1200 }, points: 10, severity: "importante", rationale: "Titular metas." },
    { id: "s-dx", domain: "destino", description: "Identificou IAMCSST como causa", evidence: { kind: "diagnosis", accepted: ["iamcsst", "pcr_fv"] }, points: 4, severity: "importante", rationale: "Supra anterior." },
    { id: "s-destino", domain: "destino", description: "Regulação para hemodinâmica", evidence: { kind: "disposition", accepted: ["transferencia_regulada"] }, points: 6, severity: "critica", rationale: "Cateterismo de emergência.", sourceIds: ["BR-SAMU", "BR-UPA"] }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Pulso voltou: o que mata nos próximos minutos?" },
      { level: 2, text: "Qual a pressão alvo? E a saturação alvo?" },
      { level: 3, text: "Por que ele parou? O ECG responde." },
      { level: 4, text: "Sugestão explícita: manter ventilação, noradrenalina, ECG, glicemia, gasometria e regulação para cateterismo." }
    ],
    summary: "Homem de 57 anos após PCR em FV por IAM anterior, com RCE recente, Glasgow 5, hipotensão e hipoxemia.",
    pathophysiology: "A síndrome pós-PCR combina lesão cerebral anóxica, disfunção miocárdica, resposta inflamatória sistêmica (reperfusão) e a doença que causou a parada. Hipotensão e hipoxemia secundárias pioram a lesão cerebral; a causa coronariana precisa de reperfusão.",
    keyPoints: [
      "Via aérea e ventilação: SpO₂ 92–98%, PaCO₂ normal.",
      "PAM ≥ 65 (vasopressor se necessário).",
      "ECG de 12 derivações: IAMCSST → cateterismo de emergência.",
      "Glicemia, eletrólitos, controle de temperatura (evitar febre).",
      "Destino com capacidade de hemodinâmica/UTI."
    ],
    alternatives: ["Intubação com sequência adequada e capnografia, se equipe treinada."],
    oralRubric: [
      { id: "o1", concept: "Ventilação/oxigenação", synonyms: ["ventilação", "intubação", "saturação", "oxigênio"], weight: 2 },
      { id: "o2", concept: "Pressão arterial", synonyms: ["noradrenalina", "vasopressor", "pam", "pressão"], weight: 3 },
      { id: "o3", concept: "ECG e cateterismo", synonyms: ["ecg", "supra", "cateterismo", "hemodinâmica"], weight: 3 },
      { id: "o4", concept: "Temperatura e glicemia", synonyms: ["temperatura", "febre", "glicemia"], weight: 1 }
    ],
    simplifications: ["Nova PCR aos 20 min sem metas é decisão didática.", "Controle de temperatura não modelado em detalhe."]
  },
  references: ["INT-AHA-ALS", "BR-SAMU", "BR-UPA", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 10, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Ventilação, ECG, noradrenalina, glicemia e regulação", commands: [{ atSeconds: 10, type: "examine", payload: { region: "neurologico", maneuver: "especial" } }, test(30, "ecg12"), act(40, "glicemia_capilar"), act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(200, "noradrenalina", "sol64", 1, "mg", "IV", "infusao", { rate: { value: 0.1, unit: "mcg/kg/min" } }), test(250, "gaso_arterial"), act(300, "acionar_samu"), act(900, "medir_pa"), dx(1300, "iamcsst"), dest(1300, "transferencia_regulada")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-estavel" }, description: "metas atingidas" }, { condition: { not: { ruleFired: "r-nova-pcr" } }, description: "sem nova PCR" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Mantém só a bolsa-válvula-máscara", commands: [], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-nova-pcr" }, description: "nova PCR" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Só cristaloide para a hipotensão", commands: [act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(200, "sf09", "bolsa500", 500, "mL", "IV", "infusao_volume", { durationMinutes: 15 })], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-volume" }, description: "resposta parcial" }, { condition: { ruleFired: "r-nova-pcr" }, description: "nova PCR" }] },
    { id: "t-atraso", kind: "delay", description: "Noradrenalina aos 15 min", commands: [act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(900, "noradrenalina", "sol64", 1, "mg", "IV", "infusao", { rate: { value: 0.1, unit: "mcg/kg/min" } }), test(1000, "ecg12")], runUntilSeconds: 1800, expect: [{ condition: { not: { ruleFired: "r-nova-pcr" } }, description: "PCR evitada no limite" }, { condition: { ruleFired: "r-estavel" }, description: "estabilização tardia" }] },
    { id: "t-alternativa", kind: "alternative", description: "Volume inicial e depois noradrenalina", commands: [act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(200, "ringer_lactato", "bolsa500", 500, "mL", "IV", "infusao_volume", { durationMinutes: 15 }), rx(500, "noradrenalina", "sol64", 1, "mg", "IV", "infusao", { rate: { value: 0.1, unit: "mcg/kg/min" } }), test(520, "ecg12"), act(600, "acionar_samu")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-estavel" }, description: "metas" }] }
  ]
};
