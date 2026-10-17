import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, hi, obs, outcome, oxygenResponse, rx, staff, test, trend } from "./helpers";

const LATERAL = { any: [{ actionCompleted: "posicao_seguranca" }, { deviceActive: "tot" }] };
const GLICOSE = { any: [{ drugGiven: "glicose50" }, { drugGiven: "glicose10" }] };

export const C096: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C096",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Jovem trazido por amigos, sem acordar e vomitado, depois de uma festa",
  teachingTitle: "Intoxicação alcoólica aguda com rebaixamento — proteger a via aérea, posição lateral, glicemia, buscar trauma, coingestões e outras causas, observar até sobriedade",
  group: "Toxicologia",
  specialties: ["Toxicologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 2,
  level: "internato",
  objectives: [
    "Proteger a via aérea: posição lateral de segurança, aspiração, O2; reavaliar necessidade de via aérea definitiva",
    "Medir glicemia capilar e corrigir hipoglicemia (tiamina se risco nutricional, sem atrasar a glicose)",
    "Não atribuir tudo ao álcool: trauma craniano, coingestões, hipotermia, outras causas",
    "Evitar sedativos no paciente rebaixado",
    "Observar até sobriedade e encaminhar para abordagem do uso de álcool"
  ],
  keywords: ["jovem", "festa", "vômito", "não acorda", "bebida", "amigos"],
  patient: {
    name: "Lucas Ferreira",
    ageYears: 19,
    sex: "masculino",
    weightKg: 66,
    heightCm: 176,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 3, hairStyle: "crespo_curto", hairColor: "preto", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "Sala de emergência de hospital regional, 2 h da madrugada. Jovem de 19 anos trazido por dois amigos de uma festa: não acorda direito, vomitou no carro e respira 'roncando'.",
  communication: "incapaz",
  informants: [{ id: "amigo", name: "Gabriel", role: "Amigo" }],
  history: [
    hi("h-ingestao", "exposicao", "O que ele bebeu, quanto e desde quando?", [{ source: "amigo", text: "Vodca e cachaça desde as 22 h, muita coisa, num jogo de virar copo. Não comeu nada." }], ["bebeu", "quanto", "álcool", "bebida", "vodca"]),
    hi("h-outras", "medicacoes", "Usou outra droga ou remédio? Alguém deu algo para ele?", [{ source: "amigo", text: "Acho que não... teve gente fumando maconha, mas ele não. Não sei de remédio." }], ["droga", "remédio", "outra", "comprimido"]),
    hi("h-trauma", "fatores_associados", "Ele caiu ou bateu a cabeça? Teve convulsão?", [{ source: "amigo", text: "Caiu para trás na escada da festa, bateu a nuca. Não vimos convulsão." }], ["caiu", "bateu", "cabeça", "queda", "convulsão"]),
    hi("h-antecedentes", "antecedentes", "Tem diabetes, epilepsia ou outra doença? Bebe sempre?", [{ source: "amigo", text: "É saudável. Bebe nas festas, não todo dia." }], ["diabetes", "epilepsia", "doença", "bebe sempre"])
  ],
  initial: {
    vars: { hr: 98, sbp: 104, dbp: 62, rr: 11, spo2: 91, temp: 35.4, gcs: 9, pain: 0, glucose: 52, perfusion: 0.75, effort: 0.4 },
    flags: { rhythm: "sinusal", posture: "supino", painVisual: "nenhuma", speech: "nenhuma", consciousness: "dor", airway: "obstruida_parcial" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-boca", "boca", "inspecao", "Restos de vômito na orofaringe; ronco; reflexo de tosse presente à aspiração.", { label: "Via aérea", better: [{ when: { actionCompleted: "aspirar_via_aerea" }, text: "Orofaringe limpa após aspiração; tosse presente." }] }),
    ex("e-cabeca", "cabeca", "palpacao", "Hematoma subgaleal occipital de 4 cm; sem afundamento; sem otorragia.", { label: "Crânio" }),
    ex("e-olhos", "olhos", "inspecao", "Pupilas médias, isocóricas, fotorreagentes.", { label: "Pupilas" }),
    ex("e-neuro", "neurologico", "inspecao", "Glasgow 9 (abertura ocular à dor, sons incompreensíveis, localiza dor); move os quatro membros; sem sinais focais evidentes.", { label: "Neurológico", better: [{ when: { ruleFired: "r-glicose" }, text: "Glasgow 11, move os quatro membros, sem sinais focais." }] }),
    ex("e-torax", "torax_anterior", "ausculta", "Roncos de transmissão de vias altas; sem estertores.", { label: "Tórax", better: [{ when: { ruleFired: "r-aspiracao" }, text: "Estertores em base direita (broncoaspiração)." }] }),
    ex("e-pele", "pele", "inspecao", "Pele fria; sem marcas de agulha; sem petéquias.", { label: "Pele" })
  ],
  testResults: [
    { testId: "etanol_serico", variants: [{ text: "Etanol elevado, compatível com intoxicação grave (laudo educativo)." }] },
    { testId: "tc_cranio", variants: [{ text: "Hematoma subgaleal occipital; sem fraturas, sem sangramento intracraniano." }] },
    { testId: "eletrolitos", variants: [{ text: "Na 140, K 3,5." }] },
    { testId: "gaso_venosa", variants: [{ text: "pH 7,31, pCO2 50, HCO3 23; lactato 2,6." }] },
    { testId: "rx_torax", variants: [{ when: { ruleFired: "r-aspiracao" }, text: "Opacidade em lobo inferior direito (aspiração)." }, { text: "Sem alterações." }] }
  ],
  highlightedActions: ["posicao_seguranca", "aspirar_via_aerea", "glicemia_capilar", "aquecimento"],
  rules: [
    oxygenResponse(96, 90, undefined, 30),
    { id: "r-aspiracao", description: "Broncoaspiração sem proteção da via aérea", priority: 35, when: { all: [{ time: "gte", seconds: 600 }, { not: LATERAL }] }, repeat: "once", effects: [trend("spo2", 84, 600, "asp", 35), trend("rr", 28, 600, "asp", 35), trend("temp", 37.8, 3600, "asp", 35), staff("enfermagem", "Ele vomitou de barriga para cima e engasgou!"), outcome("piora")] },
    { id: "r-lateral", description: "Posição lateral e aspiração", priority: 20, when: { all: [LATERAL, { actionCompleted: "aspirar_via_aerea" }] }, repeat: "once", effects: [flag("airway", "pervia"), trend("effort", 0.2, 300, "va", 20)] },
    { id: "r-glicose", description: "Correção da hipoglicemia", priority: 30, when: GLICOSE, repeat: "once", effects: [trend("glucose", 112, 300, "gli", 30), trend("gcs", 11, 600, "gli", 30), staff("enfermagem", "Abriu os olhos e resmungou depois da glicose.")] },
    { id: "r-hipoglicemia", description: "Hipoglicemia não tratada", priority: 25, when: { all: [{ time: "gte", seconds: 1500 }, { not: GLICOSE }] }, repeat: "once", effects: [trend("glucose", 38, 600, "hipo", 25), trend("gcs", 7, 600, "hipo", 25), flag("seizure", true), staff("enfermagem", "Está convulsionando!"), outcome("piora")] },
    { id: "r-metabolizacao", description: "Metabolização do etanol com glicose corrigida", priority: 15, when: { all: [{ ruleFired: "r-glicose" }, { elapsedSince: "rule:r-glicose", op: "gte", seconds: 600 }] }, repeat: "once", effects: [trend("gcs", 14, 3600, "met", 35), trend("rr", 14, 1800, "met", 15)] },
    { id: "r-aquecimento", description: "Aquecimento", priority: 20, when: { actionCompleted: "aquecimento" }, repeat: "once", effects: [trend("temp", 36.4, 3600, "aq", 20)] },
    { id: "r-sedacao", description: "Sedativo em paciente rebaixado", priority: 40, when: { any: [{ drugGiven: "diazepam" }, { drugGiven: "midazolam" }] }, repeat: "once", effects: [trend("rr", 6, 300, "sed", 40), trend("spo2", 82, 300, "sed", 40), trend("gcs", 6, 300, "sed", 40), obs("Benzodiazepínico + etanol: depressão respiratória."), outcome("complicacao")] },
    { id: "r-alta", description: "Alta antes da sobriedade", priority: 45, when: { any: [{ path: "disposition", op: "eq", value: "alta_orientada" }, { path: "disposition", op: "eq", value: "alta_com_seguimento_ubs" }] }, repeat: "once", effects: [obs("Paciente ainda rebaixado não pode ter alta: observar até sobriedade, com reavaliação neurológica."), outcome("complicacao")] }
  ],
  diagnosis: { primary: "intox_alcool", accepted: ["intox_alcool"], differentials: ["tce_leve", "hipoglicemia", "intox_benzodiazepinico", "intox_opioide", "pneumonia"] },
  acceptedDestinations: ["observacao", "internacao_enfermaria"],
  outcomeNotes: "Intoxicação alcoólica aguda grave com rebaixamento (Glasgow 9), risco de aspiração, hipoglicemia, hipotermia leve e TCE por queda. Posição lateral, aspiração, O2, monitor, glicemia capilar e glicose IV, aquecimento, TC de crânio (trauma), alcoolemia/eletrólitos, sem sedativos, observação até sobriedade e encaminhamento para abordagem do uso de álcool.",
  scoring: [
    { id: "s-va", domain: "priorizacao", description: "Posição lateral de segurança", evidence: { kind: "actionDone", anyOf: ["posicao_seguranca", "intubacao"], withinSeconds: 300 }, points: 16, severity: "critica", rationale: "Prevenção de broncoaspiração.", sourceIds: ["INT-ECBC-ALCOOL-2024"] },
    { id: "s-aspirar", domain: "priorizacao", description: "Aspiração da orofaringe", evidence: { kind: "actionDone", anyOf: ["aspirar_via_aerea"], withinSeconds: 300 }, points: 6, severity: "importante", rationale: "Vômito na via aérea." },
    { id: "s-o2", domain: "priorizacao", description: "O2 e monitorização", evidence: { kind: "actionDone", anyOf: ["o2_cateter", "o2_mascara_reservatorio", "monitorizar"], withinSeconds: 300 }, points: 4, severity: "importante", rationale: "SpO2 91%." },
    { id: "s-glicemia", domain: "exames", description: "Glicemia capilar", evidence: { kind: "actionDone", anyOf: ["glicemia_capilar"], withinSeconds: 300 }, points: 12, severity: "critica", rationale: "Hipoglicemia é causa tratável de rebaixamento.", sourceIds: ["INT-ECBC-ALCOOL-2024"] },
    { id: "s-glicose", domain: "tratamento", description: "Glicose IV", evidence: { kind: "drugGiven", anyOf: ["glicose50", "glicose10"], routes: ["IV"], withinSeconds: 900 }, points: 12, severity: "critica", rationale: "Correção imediata.", sourceIds: ["INT-ECBC-ALCOOL-2024"] },
    { id: "s-hist", domain: "historia", description: "Ingestão, coingestões e trauma", evidence: { kind: "historyAsked", items: ["h-ingestao", "h-outras", "h-trauma"], minCount: 3 }, points: 8, severity: "importante", rationale: "Outras causas de rebaixamento.", sourceIds: ["INT-ECBC-ALCOOL-2024"] },
    { id: "s-exame", domain: "historia", description: "Crânio, pupilas e neurológico", evidence: { kind: "examDone", regions: ["cabeca", "olhos", "neurologico", "boca"], minCount: 3 }, points: 6, severity: "importante", rationale: "TCE, opioide, focalidade." },
    { id: "s-tc", domain: "exames", description: "TC de crânio (trauma)", evidence: { kind: "testOrdered", anyOf: ["tc_cranio"], withinSeconds: 3600 }, points: 10, severity: "critica", rationale: "Queda com trauma craniano em paciente rebaixado.", sourceIds: ["INT-ECBC-ALCOOL-2024"] },
    { id: "s-aquec", domain: "tratamento", description: "Aquecimento", evidence: { kind: "actionDone", anyOf: ["aquecimento"] }, points: 4, severity: "importante", rationale: "Hipotermia." },
    { id: "s-sedacao", domain: "tratamento", description: "Não sedou o paciente rebaixado", evidence: { kind: "avoidDrug", anyOf: ["diazepam", "midazolam"] }, points: 6, severity: "importante", rationale: "Depressão respiratória.", sourceIds: ["INT-ECBC-ALCOOL-2024"] },
    { id: "s-aspiracao", domain: "priorizacao", description: "Falha: broncoaspiração", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-aspiracao" } }, points: 12, penalty: true, severity: "critica", rationale: "Via aérea não protegida." },
    { id: "s-hipo", domain: "tratamento", description: "Falha: hipoglicemia não tratada", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-hipoglicemia" } }, points: 10, penalty: true, severity: "critica", rationale: "Convulsão evitável." },
    { id: "s-dx", domain: "destino", description: "Intoxicação alcoólica aguda", evidence: { kind: "diagnosis", accepted: ["intox_alcool"] }, points: 6, severity: "importante", rationale: "Diagnóstico de exclusão das demais causas." },
    { id: "s-destino", domain: "destino", description: "Observação até sobriedade", evidence: { kind: "disposition", accepted: ["observacao", "internacao_enfermaria"] }, points: 10, severity: "importante", rationale: "Reavaliação neurológica seriada.", sourceIds: ["INT-ECBC-ALCOOL-2024"] }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Ronco e vômito na boca de quem não acorda: qual a primeira medida?" },
      { level: 2, text: "Qual exame à beira-leito em todo rebaixamento?" },
      { level: 3, text: "Ele caiu e bateu a cabeça: tudo é álcool?" },
      { level: 4, text: "Sugestão explícita: posição lateral, aspirar, O2, monitor, glicemia capilar, glicose IV, aquecimento, TC de crânio, sem sedativo, observar." }
    ],
    summary: "Intoxicação alcoólica grave com hipoglicemia, hipotermia e trauma craniano por queda.",
    pathophysiology: "O etanol deprime o SNC e os reflexos protetores da via aérea (aspiração de vômito), inibe a gliconeogênese (hipoglicemia, sobretudo em jejum e em jovens) e causa vasodilatação cutânea (hipotermia). A intoxicação mascara TCE e coingestões.",
    keyPoints: [
      "Posição lateral de segurança e aspiração; via aérea definitiva se reflexos ausentes.",
      "Glicemia capilar sempre; tiamina 100 mg antes da glicose se risco nutricional, sem atrasar a glicose.",
      "TC de crânio se trauma ou se o estado mental não melhora.",
      "Considerar coingestões e mimetizadores (opioide, metanol, CO, infecção, cetoacidose).",
      "Evitar sedativos; observar até sobriedade; encaminhar para abordagem do uso."
    ],
    alternatives: ["Intubação se rebaixamento progressivo sem reflexo de tosse.", "Tiamina 100 mg IV antes da glicose se etilismo crônico/desnutrição."],
    oralRubric: [
      { id: "o1", concept: "Via aérea/lateral", synonyms: ["lateral", "posição de segurança", "aspirar", "via aérea"], weight: 3 },
      { id: "o2", concept: "Glicemia", synonyms: ["glicemia", "hipoglicemia", "glicose"], weight: 3 },
      { id: "o3", concept: "Outras causas", synonyms: ["trauma", "tc", "coingestão", "outras causas"], weight: 2 },
      { id: "o4", concept: "Observar", synonyms: ["sobriedade", "observação", "reavaliar"], weight: 1 }
    ],
    simplifications: ["Alcoolemia sem valor numérico.", "Recuperação neurológica comprimida no tempo do caso."]
  },
  references: ["INT-ECBC-ALCOOL-2024", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Lateral, aspiração, O2, monitor, glicemia, glicose, aquecimento, história, TC, observação", commands: [act(5, "posicao_seguranca"), act(20, "aspirar_via_aerea"), act(40, "o2_cateter"), act(50, "monitorizar"), act(60, "glicemia_capilar"), act(110, "acesso_venoso"), rx(220, "glicose50", "amp10", 25, "g", "IV"), act(250, "aquecimento"), ask(300, "h-ingestao"), ask(310, "h-outras"), ask(320, "h-trauma"), { atSeconds: 330, type: "examine", payload: { region: "cabeca", maneuver: "palpacao" } }, { atSeconds: 340, type: "examine", payload: { region: "olhos", maneuver: "inspecao" } }, { atSeconds: 350, type: "examine", payload: { region: "neurologico", maneuver: "inspecao" } }, test(400, "tc_cranio"), test(410, "etanol_serico"), dx(2500, "intox_alcool"), dest(5000, "observacao")], runUntilSeconds: 6000, expect: [{ condition: { not: { ruleFired: "r-aspiracao" } }, description: "sem aspiração" }, { condition: { ruleFired: "r-glicose" }, description: "glicose" }, { condition: { path: "vars.gcs", op: "gte", value: 13 }, description: "melhora neurológica" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-aspiracao" }, description: "aspiração" }, { condition: { ruleFired: "r-hipoglicemia" }, description: "hipoglicemia" }] },
    { id: "t-inadequada", kind: "inadequate", description: "'Só bêbado': deixa em decúbito dorsal, diazepam para agitação e alta", commands: [act(60, "acesso_venoso"), rx(200, "diazepam", "amp10", 10, "mg", "IV"), dest(2000, "alta_orientada")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-sedacao" }, description: "depressão respiratória" }, { condition: { ruleFired: "r-aspiracao" }, description: "aspiração" }, { condition: { ruleFired: "r-alta" }, description: "alta indevida" }] },
    { id: "t-atraso", kind: "delay", description: "Glicemia tardia após convulsão", commands: [act(10, "posicao_seguranca"), act(30, "aspirar_via_aerea"), act(100, "acesso_venoso"), act(1600, "glicemia_capilar"), rx(1700, "glicose50", "amp10", 25, "g", "IV"), test(1800, "tc_cranio"), dest(5000, "internacao_enfermaria")], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-hipoglicemia" }, description: "convulsão hipoglicêmica" }, { condition: { ruleFired: "r-glicose" }, description: "glicose tardia" }] },
    { id: "t-alternativa", kind: "alternative", description: "Tiamina antes da glicose; máscara; internação", commands: [act(5, "posicao_seguranca"), act(15, "aspirar_via_aerea"), act(25, "o2_mascara_reservatorio"), act(40, "glicemia_capilar"), act(90, "acesso_venoso"), rx(200, "tiamina", "amp100", 100, "mg", "IV"), rx(230, "glicose50", "amp10", 25, "g", "IV"), test(400, "tc_cranio"), dest(5000, "internacao_enfermaria")], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-glicose" }, description: "glicose" }, { condition: { not: { ruleFired: "r-aspiracao" } }, description: "sem aspiração" }] }
  ]
};
