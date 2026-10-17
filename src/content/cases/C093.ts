import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, hi, obs, outcome, oxygenResponse, rx, staff, test, trend } from "./helpers";

const SORO3 = { drugGiven: "soro_antiescorpionico", minTotal: { value: 15, unit: "mL" as const } };
const SORO6 = { drugGiven: "soro_antiescorpionico", minTotal: { value: 30, unit: "mL" as const } };
const ANALGESIA = { any: [{ drugGiven: "dipirona" }, { drugGiven: "lidocaina" }] };

export const C093: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C093",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Criança de 6 anos com dor forte no pé, vômitos e suor depois de calçar o tênis",
  teachingTitle: "Escorpionismo em criança — classificar gravidade, soro antiescorpiônico (3 FA moderado, 6 FA grave), analgesia, evitar sobrecarga hídrica e observar ≥ 24 h",
  group: "Toxicologia",
  specialties: ["Toxicologia", "Pediatria", "Emergência"],
  environment: "pediatria",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Classificar o acidente escorpiônico (leve, moderado, grave) pelas manifestações sistêmicas",
    "Indicar soro antiescorpiônico: 3 frascos-ampola no moderado, 6 no grave (não exceder 6)",
    "Analgesia: dipirona e infiltração de lidocaína sem vasoconstritor",
    "Monitorizar ECG e sinais vitais; evitar sobrecarga hídrica",
    "Observar no mínimo 24 h após soro; notificar"
  ],
  keywords: ["criança", "dor no pé", "picada", "vômito", "suor", "tênis"],
  patient: {
    name: "Ana Clara Ribeiro",
    ageYears: 6,
    sex: "feminino",
    weightKg: 20,
    heightCm: 115,
    visual: { ageGroup: "escolar", sex: "feminino", skinTone: 3, hairStyle: "cacheado", hairColor: "castanho", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Menina de 6 anos trazida pela mãe: há 1 hora calçou o tênis e gritou de dor no pé direito. Em casa vomitou duas vezes e começou a suar muito.",
  communication: "limitada",
  informants: [{ id: "mae", name: "Juliana (mãe)", role: "Mãe" }, { id: "paciente", name: "Ana Clara", role: "Paciente" }],
  history: [
    hi("h-picada", "exposicao", "O que aconteceu? Alguém viu o bicho?", [{ source: "mae", text: "Bateu o tênis e caiu um escorpião amarelinho. Matei e trouxe no pote." }], ["bicho", "picada", "aconteceu", "viu", "animal"]),
    hi("h-tempo", "inicio", "Há quanto tempo foi?", [{ source: "mae", text: "Mais ou menos uma hora, uma hora e pouco." }], ["tempo", "quando", "hora"]),
    hi("h-sistemico", "fatores_associados", "Quantas vezes vomitou? Está suando, babando, sonolenta, com falta de ar?", [{ source: "mae", text: "Vomitou duas vezes, suando bastante, agitada. Não está babando nem com falta de ar." }], ["vomitou", "suando", "babando", "sonolenta", "falta de ar"]),
    hi("h-dor", "intensidade", "Como está a dor?", [{ source: "paciente", text: "Dói muito! Formigando a perna toda!" }], ["dor", "dói", "formigando"]),
    hi("h-antecedentes", "antecedentes", "Ela tem alguma doença, alergia ou toma remédio?", [{ source: "mae", text: "Não, é saudável. Vacinas em dia." }], ["doença", "alergia", "remédio"])
  ],
  initial: {
    vars: { hr: 146, sbp: 124, dbp: 80, rr: 30, spo2: 97, temp: 36.8, gcs: 15, pain: 9, glucose: 142, perfusion: 0.8, effort: 0.25 },
    flags: { rhythm: "taquicardia_sinusal", sweating: true, agitation: true, posture: "sentado", painVisual: "intensa", speech: "frases", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-pe", "membro_inferior_d", "inspecao", "Ponto de picada pouco visível no dorso do pé direito, eritema discreto; dor intensa e parestesia ao toque que irradiam para a perna.", { label: "Local da picada" }),
    ex("e-pele", "pele", "inspecao", "Sudorese generalizada; extremidades frias.", { label: "Pele" }),
    ex("e-boca", "boca", "inspecao", "Sem sialorreia.", { label: "Boca", better: [{ when: { ruleFired: "r-grave" }, text: "Sialorreia." }] }),
    ex("e-torax", "torax_anterior", "ausculta", "Murmúrio vesicular presente, sem ruídos adventícios.", { sound: "murmurio_normal", better: [{ when: { ruleFired: "r-grave" }, text: "Estertores crepitantes em bases (edema pulmonar)." }] }),
    ex("e-coracao", "coracao", "ausculta", "Taquicardia, bulhas normofonéticas, sem B3.", { sound: "bulhas_normais" }),
    ex("e-neuro", "neurologico", "inspecao", "Agitada, sem sinais focais.", { label: "Neurológico", better: [{ when: { ruleFired: "r-grave" }, text: "Agitação alternada com sonolência." }] })
  ],
  testResults: [
    { testId: "ecg12", variants: [{ when: { ruleFired: "r-grave" }, text: "Taquicardia sinusal 172 bpm; alterações difusas de repolarização." }, { text: "Taquicardia sinusal 146 bpm; sem outras alterações." }] },
    { testId: "rx_torax", variants: [{ when: { ruleFired: "r-grave" }, text: "Infiltrado alveolar bilateral peri-hilar (edema pulmonar); área cardíaca normal." }, { text: "Sem alterações." }] },
    { testId: "eletrolitos", variants: [{ text: "Na 138, K 3,4." }] },
    { testId: "hemograma", variants: [{ text: "Leucocitose 16.800 sem desvio; Hb normal; plaquetas normais." }] }
  ],
  highlightedActions: ["monitorizar", "acesso_venoso", "contato_ciatox"],
  rules: [
    oxygenResponse(94, 90, { ruleFired: "r-grave" }, 30),
    { id: "r-curso", description: "Envenenamento moderado em progressão", priority: 10, when: { always: true }, repeat: "once", effects: [trend("hr", 158, 1800, "inv", 10), trend("sbp", 134, 1800, "inv", 10), trend("dbp", 88, 1800, "inv", 10)] },
    { id: "r-analgesia", description: "Analgesia", priority: 20, when: ANALGESIA, repeat: "once", effects: [trend("pain", 4, 600, "anal", 20)] },
    { id: "r-soro-moderado", description: "Soro (3 FA) antes da forma grave", priority: 40, when: { all: [SORO3, { not: { ruleFired: "r-grave" } }] }, repeat: "once", effects: [trend("hr", 112, 1200, "soro", 40), trend("sbp", 108, 1200, "soro", 40), trend("dbp", 66, 1200, "soro", 40), trend("pain", 3, 1200, "soro", 40), flag("agitation", false), flag("sweating", false), staff("enfermagem", "Parou de vomitar e está mais calma."), outcome("melhora")] },
    { id: "r-grave", description: "Evolução para forma grave sem soro", priority: 30, when: { all: [{ time: "gte", seconds: 2100 }, { not: SORO3 }] }, repeat: "once", effects: [trend("hr", 172, 600, "gr", 30), trend("rr", 46, 600, "gr", 30), trend("spo2", 87, 900, "gr", 30), trend("effort", 0.7, 600, "gr", 30), trend("gcs", 13, 900, "gr", 30), staff("enfermagem", "Vomitando sem parar, babando e com respiração rápida!"), outcome("piora")] },
    { id: "r-soro-grave", description: "Soro (6 FA) na forma grave", priority: 50, when: { all: [{ ruleFired: "r-grave" }, SORO6] }, repeat: "once", effects: [trend("hr", 128, 1200, "sg", 50), trend("rr", 30, 1200, "sg", 50), trend("spo2", 95, 1200, "sg", 50), trend("effort", 0.35, 1200, "sg", 50), trend("gcs", 15, 1200, "sg", 50), staff("supervisor", "Melhorando, mas é forma grave: precisa de UTI pediátrica."), outcome("estabilizacao_parcial")] },
    { id: "r-sobrecarga", description: "Expansão volêmica excessiva", priority: 45, when: { drugGiven: "sf09", minTotal: { value: 400, unit: "mL" } }, repeat: "once", effects: [trend("spo2", 89, 900, "sob", 45), obs("O envenenamento escorpiônico pode cursar com disfunção miocárdica e edema pulmonar: cuidado com sobrecarga hídrica em crianças.")] },
    { id: "r-alta", description: "Alta", priority: 45, when: { any: [{ path: "disposition", op: "eq", value: "alta_orientada" }, { path: "disposition", op: "eq", value: "alta_com_seguimento_ubs" }] }, repeat: "once", effects: [obs("Criança < 7 anos com manifestações sistêmicas: soro e observação mínima de 24 h."), outcome("complicacao")] }
  ],
  diagnosis: { primary: "escorpionismo_moderado", accepted: ["escorpionismo_moderado", "escorpionismo_grave"], differentials: ["escorpionismo_leve", "anafilaxia", "intox_organofosforado"] },
  acceptedDestinations: ["internacao_enfermaria", "uti"],
  outcomeNotes: "Acidente escorpiônico moderado (dor local intensa + vômitos, sudorese, taquicardia, hipertensão, agitação) em criança de 6 anos. Monitorização, acesso, analgesia (dipirona, lidocaína sem vasoconstritor), SAEsc 3 FA IV, ECG, observação ≥ 24 h; forma grave: 6 FA (máximo), O2, suporte e UTI.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Animal, tempo e manifestações sistêmicas", evidence: { kind: "historyAsked", items: ["h-picada", "h-tempo", "h-sistemico"], minCount: 3 }, points: 10, severity: "critica", rationale: "Classificação depende das manifestações sistêmicas.", sourceIds: ["BR-ESCORPIAO"] },
    { id: "s-exame", domain: "historia", description: "Local, tórax, coração e neurológico", evidence: { kind: "examDone", regions: ["membro_inferior_d", "torax_anterior", "coracao", "neurologico", "boca"], minCount: 3 }, points: 6, severity: "importante", rationale: "Sinais de gravidade (EAP, sialorreia, sonolência)." },
    { id: "s-mon", domain: "priorizacao", description: "Monitorização e acesso", evidence: { kind: "actionDone", anyOf: ["monitorizar"], withinSeconds: 300 }, points: 6, severity: "importante", rationale: "Sinais vitais seriados.", sourceIds: ["BR-ESCORPIAO"] },
    { id: "s-analgesia", domain: "tratamento", description: "Analgesia", evidence: { kind: "drugGiven", anyOf: ["dipirona", "lidocaina"], withinSeconds: 900 }, points: 8, severity: "importante", rationale: "Dor intensa.", sourceIds: ["BR-ESCORPIAO"] },
    { id: "s-soro", domain: "tratamento", description: "SAEsc 3 FA IV", evidence: { kind: "drugGiven", anyOf: ["soro_antiescorpionico"], routes: ["IV"], minTotal: { value: 15, unit: "mL" }, withinSeconds: 1800 }, points: 24, severity: "critica", rationale: "Indicado no moderado.", sourceIds: ["BR-ESCORPIAO"] },
    { id: "s-ecg", domain: "exames", description: "ECG", evidence: { kind: "testOrdered", anyOf: ["ecg12"], withinSeconds: 1800 }, points: 6, severity: "importante", rationale: "ECG na admissão.", sourceIds: ["BR-ESCORPIAO"] },
    { id: "s-ciatox", domain: "destino", description: "CIATox/notificação", evidence: { kind: "actionDone", anyOf: ["contato_ciatox"] }, points: 4, severity: "importante", rationale: "Orientação e notificação compulsória." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou após soro", evidence: { kind: "reassessAfter", after: ["soro_antiescorpionico"], reassess: ["torax_anterior", "monitorizar", "neurologico"], withinSeconds: 1800 }, points: 6, severity: "importante", rationale: "Detectar evolução grave." },
    { id: "s-grave", domain: "priorizacao", description: "Falha: evoluiu para forma grave sem soro", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-grave" } }, points: 10, penalty: true, severity: "critica", rationale: "Atraso no soro." },
    { id: "s-sobrecarga", domain: "tratamento", description: "Falha: sobrecarga hídrica", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-sobrecarga" } }, points: 6, penalty: true, severity: "importante", rationale: "Edema pulmonar.", sourceIds: ["BR-ESCORPIAO"] },
    { id: "s-dx", domain: "destino", description: "Classificação correta", evidence: { kind: "diagnosis", accepted: ["escorpionismo_moderado", "escorpionismo_grave"] }, points: 12, severity: "critica", rationale: "Define o número de frascos.", sourceIds: ["BR-ESCORPIAO"] },
    { id: "s-destino", domain: "destino", description: "Internação ≥ 24 h (UTI se grave)", evidence: { kind: "disposition", accepted: ["internacao_enfermaria", "uti"] }, points: 18, severity: "critica", rationale: "Observação mínima de 24 h após soro.", sourceIds: ["BR-ESCORPIAO"] }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Só dor local, ou há manifestações sistêmicas?" },
      { level: 2, text: "Vômitos, sudorese, taquicardia e agitação em criança de 6 anos: qual a classe de gravidade?" },
      { level: 3, text: "Quantos frascos-ampola de soro para essa classe?" },
      { level: 4, text: "Sugestão explícita: monitor, acesso, dipirona, SAEsc 3 FA IV, ECG, CIATox, internar 24 h." }
    ],
    summary: "Acidente por Tityus em criança com forma moderada.",
    pathophysiology: "O veneno de Tityus atua em canais de sódio e provoca liberação maciça de catecolaminas e acetilcolina: dor intensa, sudorese, vômitos, sialorreia, taquicardia/bradicardia, hipertensão e, nos graves, disfunção miocárdica, edema pulmonar e choque. Crianças pequenas têm maior risco.",
    keyPoints: [
      "Leve: sem soro, observar 6–12 h.",
      "Moderado: 3 FA de SAEsc ou SAA; grave: 6 FA (máximo).",
      "Com soro: observar ≥ 24 h.",
      "Analgesia: dipirona e lidocaína sem vasoconstritor.",
      "EAP/IC: O2 e furosemida, evitar sobrecarga; choque: dobutamina."
    ],
    alternatives: ["Soro antiaracnídico (SAA) em vez de SAEsc, se for o disponível.", "Compressa morna como adjuvante analgésico."],
    oralRubric: [
      { id: "o1", concept: "Classificação", synonyms: ["moderado", "leve", "grave", "sistêmicas"], weight: 3 },
      { id: "o2", concept: "Número de frascos", synonyms: ["3 frascos", "três ampolas", "6 frascos"], weight: 3 },
      { id: "o3", concept: "Observação 24 h", synonyms: ["24 horas", "internar", "observação"], weight: 2 },
      { id: "o4", concept: "Analgesia", synonyms: ["dipirona", "lidocaína"], weight: 1 }
    ],
    simplifications: ["Infiltração de lidocaína modelada como via SC, sem dose cadastrada.", "Velocidade de infusão do soro não modelada."]
  },
  references: ["BR-ESCORPIAO", "BR-BUTANTAN-SAESC", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 2, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "História, exame, monitor, acesso, dipirona, SAEsc 3 FA, ECG, CIATox, internação", commands: [ask(10, "h-picada"), ask(20, "h-tempo"), ask(30, "h-sistemico"), { atSeconds: 40, type: "examine", payload: { region: "membro_inferior_d", maneuver: "inspecao" } }, { atSeconds: 50, type: "examine", payload: { region: "torax_anterior", maneuver: "ausculta" } }, { atSeconds: 60, type: "examine", payload: { region: "neurologico", maneuver: "inspecao" } }, act(70, "monitorizar"), act(80, "acesso_venoso"), rx(180, "dipirona", "amp1g", 20, "mg/kg", "IV"), test(190, "ecg12"), rx(300, "soro_antiescorpionico", "fa5", 15, "mL", "IV"), act(400, "contato_ciatox"), { atSeconds: 1200, type: "examine", payload: { region: "torax_anterior", maneuver: "ausculta" } }, dx(1500, "escorpionismo_moderado"), dest(2700, "internacao_enfermaria")], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-soro-moderado" }, description: "soro" }, { condition: { not: { ruleFired: "r-grave" } }, description: "sem forma grave" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-grave" }, description: "forma grave" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Classifica como leve, só analgesia, soro fisiológico em bolus e alta", commands: [act(60, "acesso_venoso"), rx(150, "dipirona", "amp1g", 20, "mg/kg", "IV"), rx(200, "sf09", "bolsa500", 20, "mL/kg", "IV", "infusao_volume", { durationMinutes: 20 }), rx(1500, "sf09", "bolsa500", 20, "mL/kg", "IV", "infusao_volume", { durationMinutes: 20 }), dest(3000, "alta_orientada")], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-sobrecarga" }, description: "sobrecarga" }, { condition: { ruleFired: "r-grave" }, description: "forma grave" }, { condition: { ruleFired: "r-alta" }, description: "alta indevida" }] },
    { id: "t-atraso", kind: "delay", description: "Soro tardio na forma grave: 6 FA, O2, UTI", commands: [act(60, "monitorizar"), act(70, "acesso_venoso"), test(1000, "ecg12"), act(2300, "o2_mascara_reservatorio"), rx(2400, "soro_antiescorpionico", "fa5", 30, "mL", "IV"), dx(3000, "escorpionismo_grave"), dest(3500, "uti")], runUntilSeconds: 4500, expect: [{ condition: { ruleFired: "r-grave" }, description: "forma grave" }, { condition: { ruleFired: "r-soro-grave" }, description: "soro 6 FA" }] },
    { id: "t-alternativa", kind: "alternative", description: "Lidocaína local e soro precoce", commands: [act(30, "monitorizar"), act(40, "acesso_venoso"), rx(120, "lidocaina", "fa20", 2, "mL", "SC"), rx(200, "soro_antiescorpionico", "fa5", 15, "mL", "IV"), test(300, "ecg12"), dest(2500, "internacao_enfermaria")], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-analgesia" }, description: "analgesia" }, { condition: { ruleFired: "r-soro-moderado" }, description: "soro" }] }
  ]
};
