import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const SAB6 = { drugGiven: "soro_antibotropico", minTotal: { value: 60, unit: "mL" as const } };
const SAB12 = { drugGiven: "soro_antibotropico", minTotal: { value: 120, unit: "mL" as const } };
const CUIDADOS = { actionCompleted: "cuidados_local_picada" };

export const C094: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C094",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Lavrador com pé e perna inchados e gengiva sangrando depois de ser picado por cobra",
  teachingTitle: "Acidente botrópico moderado — classificar por segmentos e complicações, tempo de coagulação, soro antibotrópico 6 FA IV, retirar garrote, hidratar e observar ≥ 24 h",
  group: "Toxicologia",
  specialties: ["Toxicologia", "Emergência", "Medicina rural"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Identificar o gênero provável pela história e quadro (local, coagulopatia, sem neuroparalisia)",
    "Classificar a gravidade: segmentos com edema, sangramento, choque e injúria renal",
    "Retirar garrote, lavar, elevar o membro; evitar via IM, incisão e AINE",
    "Soro antibotrópico IV no número de frascos da classe, sem fracionar",
    "Hidratar, monitorar diurese, tempo de coagulação e função renal; notificar; observar ≥ 24 h"
  ],
  keywords: ["cobra", "picada", "inchaço", "sangramento", "lavoura", "gengiva"],
  patient: {
    name: "Sebastião Lima",
    ageYears: 38,
    sex: "masculino",
    weightKg: 70,
    heightCm: 170,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 4, hairStyle: "curto", hairColor: "preto", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Homem de 38 anos picado no pé direito há 2 horas enquanto roçava pasto. Chega com um garrote de corda apertado na coxa, colocado pelo vizinho.",
  communication: "normal",
  informants: [{ id: "paciente", name: "Sebastião", role: "Paciente" }],
  history: [
    hi("h-cobra", "exposicao", "Como era a cobra? Viu o rabo?", [{ source: "paciente", text: "Marrom com desenho de 'V' nas costas, cabeça em triângulo. Rabo fino, sem chocalho." }], ["cobra", "como era", "rabo", "chocalho", "cor"]),
    hi("h-tempo", "inicio", "Há quanto tempo foi? O que fizeram depois?", [{ source: "paciente", text: "Umas duas horas. O vizinho amarrou a corda e queria cortar o lugar para tirar o veneno, eu não deixei." }], ["tempo", "quando", "fizeram", "corda"]),
    hi("h-sangramento", "fatores_associados", "Está sangrando em algum lugar? A urina mudou? Visão dupla, pálpebra caída, dor muscular?", [{ source: "paciente", text: "A gengiva começou a sangrar. A urina está normal. A vista está boa." }], ["sangrando", "urina", "vista", "pálpebra", "muscular"]),
    hi("h-vacina", "vacinacao", "Tomou vacina antitetânica? Quando?", [{ source: "paciente", text: "Tomei no posto há uns três anos, quando cortei a mão." }], ["vacina", "tétano", "antitetânica"]),
    hi("h-antecedentes", "antecedentes", "Tem alguma doença, alergia ou já tomou soro antes?", [{ source: "paciente", text: "Nada. Nunca tomei soro de cobra." }], ["doença", "alergia", "soro antes"])
  ],
  initial: {
    vars: { hr: 106, sbp: 126, dbp: 80, rr: 20, spo2: 98, temp: 36.9, gcs: 15, pain: 8, glucose: 110, perfusion: 0.8, urine: 50, inr: 3.4, plt: 132000, creat: 1.0, cpk: 420, hb: 14.1 },
    flags: { rhythm: "taquicardia_sinusal", edema: true, bleedingVisible: true, posture: "supino", painVisual: "intensa", speech: "frases", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-membro", "membro_inferior_d", "inspecao", "Dois orifícios de presa no dorso do pé com sangramento; edema duro, quente e doloroso do pé até o joelho (pé e perna); equimose; garrote de corda na coxa.", { label: "Membro picado", better: [{ when: { ruleFired: "r-grave" }, text: "Edema do pé à raiz da coxa (três segmentos), bolhas e equimose extensa." }, { when: CUIDADOS, text: "Garrote retirado; edema do pé até o joelho, membro elevado." }] }),
    ex("e-pulsos", "membro_inferior_d", "palpacao", "Pulso pedioso presente; tensão moderada da panturrilha; sensibilidade preservada.", { label: "Pulsos/compartimento" }),
    ex("e-boca", "boca", "inspecao", "Gengivorragia discreta.", { label: "Mucosas" }),
    ex("e-olhos", "olhos", "inspecao", "Sem ptose palpebral, sem oftalmoplegia, sem 'fácies miastênica'.", { label: "Olhos (neuroparalisia)" }),
    ex("e-neuro", "neurologico", "inspecao", "Força preservada, sem mialgia generalizada.", { label: "Neurológico" })
  ],
  testResults: [
    { testId: "tempo_coagulacao", variants: [{ when: { ruleFired: "r-soro-mod" }, text: "Sangue coagulou em 9 minutos (normalizando)." }, { text: "Sangue incoagulável após 30 minutos." }] },
    { testId: "coagulograma", variants: [{ when: { ruleFired: "r-soro-mod" }, text: "TP em melhora; fibrinogênio em recuperação." }, { text: "TP e TTPa incoaguláveis/alargados; fibrinogênio indosável." }] },
    { testId: "urina_tipo1", variants: [{ when: { ruleFired: "r-grave" }, text: "Hematúria macroscópica; proteinúria." }, { text: "Hematúria microscópica." }] }
  ],
  highlightedActions: ["cuidados_local_picada", "acesso_venoso", "contato_ciatox"],
  rules: [
    { id: "r-curso", description: "Envenenamento botrópico em progressão", priority: 10, when: { always: true }, repeat: "once", effects: [trend("pain", 9, 1800, "inv", 10), trend("plt", 105000, 3000, "inv", 10)] },
    { id: "r-cuidados", description: "Garrote retirado, membro elevado", priority: 20, when: CUIDADOS, repeat: "once", effects: [flag("posture", "supino"), staff("enfermagem", "Tirei a corda, lavei e deixei a perna elevada e esticada.")] },
    { id: "r-garrote", description: "Garrote mantido", priority: 25, when: { all: [{ time: "gte", seconds: 1500 }, { not: CUIDADOS }] }, repeat: "once", effects: [obs("O garrote concentra o veneno no membro e piora isquemia e necrose: deve ser retirado."), trend("pain", 10, 600, "gar", 25)] },
    { id: "r-analgesia", description: "Analgesia", priority: 30, when: { any: [{ drugGiven: "dipirona", route: "IV" }, { drugGiven: "paracetamol" }] }, repeat: "once", effects: [trend("pain", 5, 600, "anal", 30)] },
    { id: "r-im", description: "Medicação IM em paciente com coagulopatia", priority: 30, when: { drugGiven: "dipirona", route: "IM" }, repeat: "once", effects: [obs("Paciente incoagulável: injeção IM causa hematoma — evitar a via intramuscular.")] },
    { id: "r-hidratacao", description: "Hidratação mantém diurese", priority: 30, when: { any: [{ drugGiven: "sf09", minTotal: { value: 500, unit: "mL" } }, { drugGiven: "ringer_lactato", minTotal: { value: 500, unit: "mL" } }] }, repeat: "once", effects: [trend("urine", 90, 1800, "hid", 30)] },
    { id: "r-soro-mod", description: "Soro antibotrópico na dose da classe moderada", priority: 40, when: { all: [SAB6, { not: { ruleFired: "r-grave" } }] }, repeat: "once", effects: [trend("inr", 1.6, 3600, "soro", 40), trend("hr", 92, 1200, "soro", 40), flag("bleedingVisible", false), staff("enfermagem", "Parou de sangrar a gengiva."), outcome("melhora")] },
    { id: "r-grave", description: "Sem soro adequado: forma grave", priority: 35, when: { all: [{ time: "gte", seconds: 3000 }, { not: SAB6 }] }, repeat: "once", effects: [trend("urine", 12, 1800, "gr", 35), trend("creat", 2.6, 3600, "gr", 35), trend("sbp", 92, 1800, "gr", 35), trend("hr", 124, 1800, "gr", 35), trend("hb", 11.5, 3600, "gr", 35), staff("enfermagem", "O inchaço subiu até a virilha, ele quase não urinou e a pressão caiu."), outcome("piora")] },
    { id: "r-soro-grave", description: "Soro na dose da classe grave", priority: 50, when: { all: [{ ruleFired: "r-grave" }, SAB12] }, repeat: "once", effects: [trend("inr", 1.8, 3600, "sg", 50), trend("sbp", 110, 1200, "sg", 50), trend("hr", 104, 1200, "sg", 50), flag("bleedingVisible", false), outcome("estabilizacao_parcial")] },
    { id: "r-alta", description: "Alta", priority: 45, when: { any: [{ path: "disposition", op: "eq", value: "alta_orientada" }, { path: "disposition", op: "eq", value: "alta_com_seguimento_ubs" }] }, repeat: "once", effects: [obs("Envenenamento com coagulopatia exige soro e observação mínima de 24 h."), outcome("complicacao")] }
  ],
  diagnosis: { primary: "acidente_botropico", accepted: ["acidente_botropico"], differentials: ["acidente_crotalico", "celulite"] },
  acceptedDestinations: ["internacao_enfermaria", "uti"],
  outcomeNotes: "Acidente botrópico moderado (edema em dois segmentos, gengivorragia, sangue incoagulável, sem choque nem IRA). Retirar garrote, lavar e elevar o membro, acesso, hidratação, dipirona IV, soro antibotrópico 6 FA IV de uma vez, tempo de coagulação e função renal seriados, profilaxia antitetânica conforme vacinação (em dia), notificação, internação ≥ 24 h. Grave: 12 FA, suporte e UTI se choque/IRA.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Animal, tempo, sangramento e sinais neurológicos", evidence: { kind: "historyAsked", items: ["h-cobra", "h-tempo", "h-sangramento"], minCount: 3 }, points: 8, severity: "critica", rationale: "Diferencia gênero e gravidade.", sourceIds: ["BR-OFIDICO"] },
    { id: "s-vacina", domain: "historia", description: "Situação vacinal antitetânica", evidence: { kind: "historyAsked", items: ["h-vacina"], minCount: 1 }, points: 3, severity: "importante", rationale: "Profilaxia conforme vacinação.", sourceIds: ["BR-OFIDICO"] },
    { id: "s-exame", domain: "historia", description: "Membro (segmentos, pulsos), mucosas e neuroparalisia", evidence: { kind: "examDone", regions: ["membro_inferior_d", "boca", "olhos"], minCount: 3 }, points: 6, severity: "importante", rationale: "Classificação." },
    { id: "s-cuidados", domain: "priorizacao", description: "Retirar garrote, lavar, elevar", evidence: { kind: "actionDone", anyOf: ["cuidados_local_picada"], withinSeconds: 900 }, points: 10, severity: "critica", rationale: "Garrote é contraindicado.", sourceIds: ["BR-OFIDICO"] },
    { id: "s-acesso", domain: "priorizacao", description: "Acesso venoso", evidence: { kind: "actionDone", anyOf: ["acesso_venoso"], withinSeconds: 600 }, points: 4, severity: "importante", rationale: "Soro e hidratação IV." },
    { id: "s-tc", domain: "exames", description: "Tempo de coagulação/coagulograma", evidence: { kind: "testOrdered", anyOf: ["tempo_coagulacao", "coagulograma"], withinSeconds: 900 }, points: 8, severity: "importante", rationale: "Coagulopatia e seguimento.", sourceIds: ["BR-OFIDICO"] },
    { id: "s-renal", domain: "exames", description: "Função renal/urina", evidence: { kind: "testOrdered", anyOf: ["funcao_renal", "urina_tipo1"], withinSeconds: 1800 }, points: 4, severity: "importante", rationale: "IRA é critério de gravidade." },
    { id: "s-soro", domain: "tratamento", description: "Soro antibotrópico 6 FA IV", evidence: { kind: "drugGiven", anyOf: ["soro_antibotropico"], routes: ["IV"], minTotal: { value: 60, unit: "mL" }, withinSeconds: 2400 }, points: 22, severity: "critica", rationale: "Dose da classe moderada.", sourceIds: ["BR-OFIDICO", "BR-BUTANTAN-SAB"] },
    { id: "s-hidrat", domain: "tratamento", description: "Hidratação", evidence: { kind: "drugGiven", anyOf: ["sf09", "ringer_lactato"] }, points: 5, severity: "importante", rationale: "Prevenção de IRA.", sourceIds: ["BR-OFIDICO"] },
    { id: "s-analg", domain: "tratamento", description: "Analgesia IV (dipirona/paracetamol)", evidence: { kind: "drugGiven", anyOf: ["dipirona", "paracetamol"], routes: ["IV", "VO"] }, points: 4, severity: "importante", rationale: "AINE não recomendado; evitar IM.", sourceIds: ["BR-OFIDICO"] },
    { id: "s-ciatox", domain: "destino", description: "CIATox/notificação", evidence: { kind: "actionDone", anyOf: ["contato_ciatox"] }, points: 4, severity: "importante", rationale: "Notificação compulsória em 24 h.", sourceIds: ["BR-OFIDICO"] },
    { id: "s-grave", domain: "tratamento", description: "Falha: evolução para forma grave", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-grave" } }, points: 10, penalty: true, severity: "critica", rationale: "Soro tardio ou subdosado." },
    { id: "s-garrote", domain: "priorizacao", description: "Falha: manteve garrote", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-garrote" } }, points: 6, penalty: true, severity: "importante", rationale: "Contraindicado.", sourceIds: ["BR-OFIDICO"] },
    { id: "s-im", domain: "tratamento", description: "Falha: medicação IM", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-im" } }, points: 4, penalty: true, severity: "importante", rationale: "Hematoma em incoagulável.", sourceIds: ["BR-OFIDICO"] },
    { id: "s-dx", domain: "destino", description: "Acidente botrópico", evidence: { kind: "diagnosis", accepted: ["acidente_botropico"] }, points: 10, severity: "importante", rationale: "Local + coagulopatia, sem neuroparalisia." },
    { id: "s-destino", domain: "destino", description: "Internação ≥ 24 h", evidence: { kind: "disposition", accepted: ["internacao_enfermaria", "uti"] }, points: 12, severity: "critica", rationale: "Observação após soro.", sourceIds: ["BR-OFIDICO"] }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Cabeça triangular, rabo liso: qual gênero? Há sinais neurológicos?" },
      { level: 2, text: "Quantos segmentos do membro estão inchados? Há choque ou IRA?" },
      { level: 3, text: "O que fazer com a corda na coxa?" },
      { level: 4, text: "Sugestão explícita: retirar garrote/lavar/elevar, acesso, SF, dipirona IV, tempo de coagulação, SAB 6 FA IV, CIATox, internar." }
    ],
    summary: "Acidente botrópico moderado com coagulopatia de consumo.",
    pathophysiology: "O veneno botrópico tem ação proteolítica/inflamatória local (dor, edema, bolhas, necrose), coagulante (consumo de fibrinogênio → sangue incoagulável) e hemorrágica (metaloproteases que lesam o endotélio). Complicações: síndrome compartimental, infecção, choque e injúria renal aguda.",
    keyPoints: [
      "Leve (1 segmento) 3 FA; moderado (2 segmentos) 6 FA; grave (3 segmentos ou hemorragia grave, choque, IRA) 12 FA.",
      "Soro IV diluído, 8–12 mL/min, de uma vez; mesma dose em crianças.",
      "Não: garrote, incisão, sucção, medicamento local, via IM, AINE.",
      "Hidratar e vigiar diurese; tempo de coagulação para seguimento.",
      "Observar ≥ 24 h após soro; notificar."
    ],
    alternatives: ["Soro antibotrópico-crotálico (SABC) ou antibotrópico-laquético (SABL) se forem os disponíveis, no número de frascos indicado.", "Paracetamol para analgesia."],
    oralRubric: [
      { id: "o1", concept: "Classificação por segmentos", synonyms: ["segmentos", "moderado", "grave", "leve"], weight: 3 },
      { id: "o2", concept: "Número de frascos", synonyms: ["6 frascos", "seis ampolas", "12 frascos"], weight: 3 },
      { id: "o3", concept: "Contraindicações dos primeiros socorros", synonyms: ["garrote", "torniquete", "incisão", "im"], weight: 2 },
      { id: "o4", concept: "Coagulação/rim", synonyms: ["tempo de coagulação", "diurese", "creatinina", "hidratação"], weight: 2 }
    ],
    simplifications: ["Infusão do soro registrada como dose única (velocidade não modelada).", "Pré-medicação e reações ao soro não modeladas.", "Número de frascos do quadro botrópico extraído do PCDT resumido — conferir no documento completo."]
  },
  references: ["BR-OFIDICO", "BR-BUTANTAN-SAB", "BR-CIATOX", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 12, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Cuidados locais, acesso, SF, dipirona IV, TC, SAB 6 FA, CIATox, internação", commands: [ask(10, "h-cobra"), ask(20, "h-tempo"), ask(30, "h-sangramento"), ask(35, "h-vacina"), { atSeconds: 40, type: "examine", payload: { region: "membro_inferior_d", maneuver: "inspecao" } }, { atSeconds: 50, type: "examine", payload: { region: "boca", maneuver: "inspecao" } }, { atSeconds: 60, type: "examine", payload: { region: "olhos", maneuver: "inspecao" } }, act(70, "cuidados_local_picada"), act(380, "acesso_venoso"), test(480, "tempo_coagulacao"), test(490, "funcao_renal"), rx(500, "sf09", "bolsa500", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), rx(520, "dipirona", "amp1g", 1000, "mg", "IV"), rx(600, "soro_antibotropico", "fa10", 60, "mL", "IV"), act(700, "contato_ciatox"), dx(1500, "acidente_botropico"), dest(3000, "internacao_enfermaria")], runUntilSeconds: 4500, expect: [{ condition: { ruleFired: "r-soro-mod" }, description: "soro adequado" }, { condition: { not: { ruleFired: "r-grave" } }, description: "sem forma grave" }, { condition: { not: { ruleFired: "r-garrote" } }, description: "garrote retirado" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 4500, expect: [{ condition: { ruleFired: "r-garrote" }, description: "garrote mantido" }, { condition: { ruleFired: "r-grave" }, description: "forma grave" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Subdose (3 FA, como leve), dipirona IM e garrote mantido", commands: [act(60, "acesso_venoso"), rx(200, "dipirona", "amp1g", 1000, "mg", "IM"), rx(300, "soro_antibotropico", "fa10", 30, "mL", "IV"), dest(4000, "internacao_enfermaria")], runUntilSeconds: 4500, expect: [{ condition: { ruleFired: "r-im" }, description: "via IM" }, { condition: { ruleFired: "r-garrote" }, description: "garrote" }, { condition: { ruleFired: "r-grave" }, description: "forma grave por subdose" }] },
    { id: "t-atraso", kind: "delay", description: "Soro tardio: forma grave, 12 FA, UTI", commands: [act(100, "cuidados_local_picada"), act(450, "acesso_venoso"), test(600, "tempo_coagulacao"), rx(3100, "soro_antibotropico", "fa10", 120, "mL", "IV"), rx(3200, "sf09", "bolsa500", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), dest(4800, "uti")], runUntilSeconds: 5400, expect: [{ condition: { ruleFired: "r-grave" }, description: "grave" }, { condition: { ruleFired: "r-soro-grave" }, description: "soro 12 FA" }] },
    { id: "t-alternativa", kind: "alternative", description: "Paracetamol VO e Ringer; soro 6 FA", commands: [act(30, "cuidados_local_picada"), act(340, "acesso_venoso"), rx(450, "paracetamol", "cp500", 750, "mg", "VO"), rx(460, "ringer_lactato", "bolsa500", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), rx(500, "soro_antibotropico", "fa10", 60, "mL", "IV"), test(600, "coagulograma"), dest(3500, "internacao_enfermaria")], runUntilSeconds: 4500, expect: [{ condition: { ruleFired: "r-soro-mod" }, description: "soro" }, { condition: { not: { ruleFired: "r-grave" } }, description: "sem forma grave" }] }
  ]
};
