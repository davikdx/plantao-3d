import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const TIAMINA = { drugGiven: "tiamina" };
const GLICOSE = { any: [{ drugGiven: "glicose50" }, { drugGiven: "glicose10" }] };

export const C029: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C029",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Homem confuso, cambaleando, encontrado na rua",
  teachingTitle: "Alteração de consciência metabólica no etilista — hipoglicemia e encefalopatia de Wernicke (tiamina antes da glicose)",
  group: "Neurologia",
  specialties: ["Neurologia", "Clínica médica", "Emergência"],
  environment: "emergencia",
  resourceProfile: "upa-porte-ii",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Medir glicemia capilar em toda alteração de consciência",
    "Reconhecer a tríade de Wernicke (confusão, ataxia, oftalmoparesia) — muitas vezes incompleta",
    "Administrar tiamina IV antes ou junto com a glicose em risco nutricional",
    "Pesquisar trauma craniano, intoxicações e abstinência",
    "Articular cuidado para uso de álcool (RAPS/CAPS AD)"
  ],
  keywords: ["confuso", "bêbado", "cambaleando", "rua", "álcool"],
  patient: {
    name: "Severino (identificado pelo SAMU)",
    ageYears: 52,
    sex: "masculino",
    weightKg: 54,
    heightCm: 170,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 4, hairStyle: "curto", hairColor: "grisalho", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "UPA 24h. O SAMU traz homem de 52 anos encontrado sentado na calçada, confuso e cambaleando. Conhecido no bairro por beber diariamente; sem documentos.",
  communication: "limitada",
  informants: [{ id: "samu", name: "Técnico do SAMU", role: "Equipe do SAMU 192" }],
  history: [
    hi("h-cena", "queixa", "Como ele foi encontrado? (SAMU)", [{ source: "samu", text: "Sentado na calçada, sem trauma visível, sem garrafa por perto. O dono do bar disse que ele não come há dias e bebeu muito até anteontem." }], ["encontrado", "samu", "cena"]),
    hi("h-paciente", "queixa", "O senhor sabe onde está?", [{ source: "paciente", text: "No… no trabalho? Que dia é hoje? (confabula)" }], ["onde", "sabe"]),
    hi("h-ultima-dose", "habitos", "Quando bebeu pela última vez?", [{ source: "samu", text: "Segundo o dono do bar, anteontem à noite." }], ["bebeu", "álcool", "última"]),
    hi("h-convulsao", "sinais_alarme", "Teve convulsão ou queda?", [{ source: "samu", text: "Ninguém viu convulsão. Não sabemos de queda." }], ["convulsão", "queda", "bateu"])
  ],
  initial: {
    vars: { hr: 108, sbp: 104, dbp: 62, rr: 18, spo2: 96, temp: 36.0, gcs: 13, glucose: 46, perfusion: 0.7, effort: 0.2, na: 132, k: 3.2, mg: 1.3, ast: 148, alt: 62, lactate: 3.2 },
    flags: { rhythm: "taquicardia_sinusal", tremor: true, sweating: true, posture: "supino", speech: "frases", communication: "limitada", consciousness: "voz" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-neuro", "neurologico", "especial", "Desorientado, confabulando; ataxia de tronco (não fica sentado sem apoio); sem déficit motor focal.", { label: "Neurológico", better: [{ when: { ruleFired: "r-wernicke-piora" }, text: "Sonolento, Glasgow 10; ataxia e oftalmoplegia piores." }, { when: { ruleFired: "r-melhora" }, text: "Mais desperto; ainda com ataxia." }] }),
    ex("e-olhos", "olhos", "inspecao", "Nistagmo horizontal; paresia do olhar lateral bilateral (VI par).", { label: "Movimentos oculares" }),
    ex("e-cabeca", "cabeca", "inspecao", "Sem hematomas ou ferimentos no couro cabeludo.", {}),
    ex("e-abdome", "abdome_qsd", "palpacao", "Fígado palpável a 3 cm, sem ascite; sem aranhas vasculares evidentes.", {})
  ],
  testResults: [
    { testId: "tc_cranio", variants: [{ text: "Sem sangramento; atrofia cortical difusa leve. (Laudo educativo.)" }] }
  ],
  highlightedActions: ["glicemia_capilar", "acesso_venoso", "monitorizar"],
  rules: [
    { id: "r-glicemia", description: "Glicemia capilar revela hipoglicemia", when: { actionCompleted: "glicemia_capilar" }, repeat: "once", effects: [obs("Glicemia capilar 46 mg/dL.")] },
    { id: "r-corrige-glicose", description: "Glicose corrige a hipoglicemia", priority: 50, when: GLICOSE, repeat: "once", effects: [trend("glucose", 118, 120, "gli", 50), flag("sweating", false)] },
    { id: "r-melhora", description: "Tiamina antes/junto da glicose: melhora da confusão", priority: 60, when: { all: [TIAMINA, GLICOSE, { not: { ruleFired: "r-wernicke-piora" } }] }, repeat: "once", effects: [trend("gcs", 14, 900, "melhora", 60), flag("consciousness", "alerta"), outcome("melhora")] },
    { id: "r-wernicke-piora", description: "Glicose sem tiamina prévia: Wernicke precipitada", priority: 70, when: { all: [GLICOSE, { not: TIAMINA }, { elapsedSince: "drug:glicose50", op: "gte", seconds: 300 }] }, repeat: "once", effects: [trend("gcs", 10, 900, "wer", 70), flag("consciousness", "voz"), obs("Glicose sem tiamina em etilista desnutrido: consumo de tiamina pelo metabolismo da glicose — piora neurológica."), outcome("complicacao")] },
    { id: "r-tiamina-tardia", description: "Tiamina após piora: recuperação parcial", priority: 65, when: { all: [{ ruleFired: "r-wernicke-piora" }, TIAMINA] }, repeat: "once", effects: [trend("gcs", 12, 1800, "tia2", 65), outcome("estabilizacao_parcial")] },
    { id: "r-hipoglicemia-grave", description: "Sem glicose em 20 min: rebaixamento e convulsão", priority: 40, when: { all: [{ time: "gte", seconds: 1200 }, { not: GLICOSE }] }, repeat: "once", effects: [trend("glucose", 28, 300, "hipo", 40), trend("gcs", 7, 300, "hipo", 40), flag("seizure", true), flag("consciousness", "dor"), staff("enfermagem", "Ele está convulsionando!"), outcome("piora")] },
    { id: "r-abstinencia", description: "Risco de abstinência", when: { time: "gte", seconds: 2400 }, repeat: "once", effects: [obs("Atenção: última ingestão há ~36 h — janela de abstinência alcoólica; monitorar tremor, sudorese, alucinações (CIWA).")] }
  ],
  diagnosis: { primary: "wernicke", accepted: ["wernicke", "hipoglicemia", "encefalopatia_metabolica"], differentials: ["hipoglicemia", "intox_alcool", "abstinencia_alcool", "encefalopatia_metabolica", "avc_isquemico"] },
  acceptedDestinations: ["transferencia_regulada", "permanece_em_sala_vermelha"],
  outcomeNotes: "Etilista desnutrido com confusão, ataxia, oftalmoparesia e hipoglicemia: tiamina IV (doses altas) antes ou junto da glicose, correção de K/Mg, TC se suspeita de trauma, monitorizar abstinência e internar. Articular CAPS AD na alta.",
  scoring: [
    { id: "s-cena", domain: "historia", description: "Obteve contexto (ingestão, alimentação, trauma)", evidence: { kind: "historyAsked", items: ["h-cena", "h-ultima-dose", "h-convulsao"], minCount: 2 }, points: 6, severity: "importante", rationale: "Desnutrição e tempo desde a última dose." },
    { id: "s-exame", domain: "historia", description: "Exame neurológico e ocular", evidence: { kind: "examDone", regions: ["neurologico", "olhos"], minCount: 2 }, points: 8, severity: "critica", rationale: "Tríade de Wernicke." },
    { id: "s-glicemia", domain: "priorizacao", description: "Glicemia capilar em até 5 min", evidence: { kind: "actionDone", anyOf: ["glicemia_capilar"], withinSeconds: 300 }, points: 12, severity: "critica", rationale: "Hipoglicemia é tratável em minutos.", sourceIds: ["BR-SAMU-SAV"] },
    { id: "s-acesso", domain: "priorizacao", description: "Acesso venoso", evidence: { kind: "actionDone", anyOf: ["acesso_venoso"] }, points: 3, severity: "importante", rationale: "Tiamina e glicose IV." },
    { id: "s-exames", domain: "exames", description: "Eletrólitos (K, Mg) e TC se suspeita de trauma", evidence: { kind: "testOrdered", anyOf: ["eletrolitos", "tc_cranio"] }, points: 8, severity: "importante", rationale: "Hipomagnesemia limita resposta à tiamina." },
    { id: "s-tiamina", domain: "tratamento", description: "Tiamina IV antes ou junto da glicose", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-melhora" } }, points: 16, severity: "critica", rationale: "Prevenir/tratar Wernicke.", sourceIds: ["BR-SAMU-SAV"] },
    { id: "s-glicose", domain: "tratamento", description: "Glicose IV", evidence: { kind: "drugGiven", anyOf: ["glicose50", "glicose10"], withinSeconds: 1200 }, points: 9, severity: "critica", rationale: "Corrigir hipoglicemia." },
    { id: "s-reav", domain: "reavaliacao", description: "Glicemia de controle", evidence: { kind: "reassessAfter", after: ["glicose50", "glicose10"], reassess: ["glicemia_capilar", "avaliar_glasgow"], withinSeconds: 1200 }, points: 10, severity: "importante", rationale: "Recorrência é comum (estoque de glicogênio baixo)." },
    { id: "s-dx", domain: "destino", description: "Encefalopatia de Wernicke/hipoglicemia", evidence: { kind: "diagnosis", accepted: ["wernicke", "hipoglicemia", "encefalopatia_metabolica"] }, points: 5, severity: "importante", rationale: "Causa metabólica tratável." },
    { id: "s-destino", domain: "destino", description: "Internação via regulação", evidence: { kind: "disposition", accepted: ["transferencia_regulada", "permanece_em_sala_vermelha"] }, points: 8, severity: "importante", rationale: "Tiamina em doses altas por dias e risco de abstinência." },
    { id: "s-alta", domain: "destino", description: "Falha: liberado como 'embriaguez'", evidence: { kind: "disposition", accepted: ["alta_orientada", "alta_com_seguimento_ubs"] }, points: 10, penalty: true, severity: "critica", rationale: "Confusão em etilista sem álcool recente não é embriaguez." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Qual exame de 1 minuto deve ser feito em todo paciente confuso?" },
      { level: 2, text: "Olhe os olhos e a marcha." },
      { level: 3, text: "Em desnutridos, a ordem dos fármacos importa." },
      { level: 4, text: "Sugestão explícita: glicemia, acesso, tiamina IV e glicose, K/Mg, TC se trauma possível, internação." }
    ],
    summary: "Homem de 52 anos etilista desnutrido com hipoglicemia, confusão, ataxia e oftalmoparesia: encefalopatia de Wernicke.",
    pathophysiology: "A tiamina é cofator de enzimas do metabolismo da glicose (piruvato desidrogenase, transcetolase). Na deficiência, a oferta de glicose aumenta a demanda e precipita lesão em corpos mamilares, tálamo e periaqueduto — confusão, ataxia e oftalmoparesia; sem tratamento, pode evoluir para síndrome de Korsakoff.",
    keyPoints: [
      "Glicemia capilar em toda alteração de consciência.",
      "Tríade de Wernicke é frequentemente incompleta: tratar na suspeita.",
      "Tiamina IV em dose alta antes/junto da glicose (não atrasar a glicose na hipoglicemia grave).",
      "Corrigir magnésio.",
      "Monitorar abstinência; articular CAPS AD."
    ],
    alternatives: ["Glicose 10% em infusão após bolus."],
    oralRubric: [
      { id: "o1", concept: "Glicemia", synonyms: ["glicemia", "dextro", "hipoglicemia"], weight: 2 },
      { id: "o2", concept: "Tiamina antes da glicose", synonyms: ["tiamina", "vitamina b1"], weight: 3 },
      { id: "o3", concept: "Tríade", synonyms: ["ataxia", "oftalmoplegia", "confusão", "wernicke"], weight: 2 },
      { id: "o4", concept: "Abstinência e rede", synonyms: ["abstinência", "caps", "ciwa"], weight: 1 }
    ],
    simplifications: ["Piora neurológica 5 min após glicose sem tiamina é didática (na prática, o risco é real mas o curso é variável).", "Dose alta de tiamina para Wernicke estabelecido deve ser conferida em protocolo."]
  },
  references: ["BR-SAMU-SAV", "BR-CAPS", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 10, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Glicemia, exame, tiamina e glicose, eletrólitos e internação", commands: [act(5, "glicemia_capilar"), ask(30, "h-cena"), { atSeconds: 40, type: "examine", payload: { region: "olhos", maneuver: "inspecao" } }, { atSeconds: 50, type: "examine", payload: { region: "neurologico", maneuver: "especial" } }, act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(200, "tiamina", "amp100", 500, "mg", "IV"), rx(220, "glicose50", "amp10", 25, "g", "IV"), test(240, "eletrolitos"), act(1000, "glicemia_capilar"), dx(1500, "wernicke"), dest(1500, "transferencia_regulada")], runUntilSeconds: 2500, expect: [{ condition: { ruleFired: "r-melhora" }, description: "melhora" }, { condition: { not: { ruleFired: "r-wernicke-piora" } }, description: "sem precipitar Wernicke" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-hipoglicemia-grave" }, description: "convulsão" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Glicose sem tiamina", commands: [act(5, "glicemia_capilar"), act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(200, "glicose50", "amp10", 25, "g", "IV")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-wernicke-piora" }, description: "Wernicke precipitada" }] },
    { id: "t-atraso", kind: "delay", description: "Glicose sem tiamina; tiamina depois", commands: [act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(600, "glicose50", "amp10", 25, "g", "IV"), rx(1200, "tiamina", "amp100", 500, "mg", "IV")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-wernicke-piora" }, description: "piora" }, { condition: { ruleFired: "r-tiamina-tardia" }, description: "recuperação parcial" }] },
    { id: "t-alternativa", kind: "alternative", description: "Tiamina e glicose 10% em infusão", commands: [act(5, "glicemia_capilar"), act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(200, "tiamina", "amp100", 500, "mg", "IV"), rx(210, "glicose10", "frasco250", 250, "mL", "IV", "infusao_volume", { durationMinutes: 30 })], runUntilSeconds: 2500, expect: [{ condition: { ruleFired: "r-melhora" }, description: "melhora" }] }
  ]
};
