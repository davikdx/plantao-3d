import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const VANCO_VO = { drugGiven: "vancomicina", route: "VO" as const };
const VANCO_IV = { drugGiven: "vancomicina", route: "IV" as const };
const METRO = { drugGiven: "metronidazol" };
const VOL = { any: [{ drugGiven: "ringer_lactato", minTotal: { value: 1000, unit: "mL" as const } }, { drugGiven: "sf09", minTotal: { value: 1000, unit: "mL" as const } }] };
const VOL_INICIO = { any: [{ drugGiven: "ringer_lactato" }, { drugGiven: "sf09" }] };

export const C072: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C072",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Idosa com diarreia aguada muitas vezes por dia depois de tomar antibiótico",
  teachingTitle: "Colite por Clostridioides difficile fulminante — reconhecer risco, hidratar, suspender o antibiótico causador, vancomicina oral + metronidazol IV e cirurgia",
  group: "Gastroenterologia",
  specialties: ["Clínica médica", "Infectologia", "Gastroenterologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 4,
  level: "residencia",
  objectives: [
    "Reconhecer fatores de risco para C. difficile (idade, antibiótico recente, internação)",
    "Identificar critérios de gravidade (leucocitose, creatinina) e de doença fulminante (hipotensão, íleo, megacólon)",
    "Hidratar, suspender antibiótico desnecessário e iniciar vancomicina oral (não IV) + metronidazol IV na forma fulminante",
    "Precauções de contato e avaliação cirúrgica precoce"
  ],
  keywords: ["diarreia", "idosa", "antibiótico", "desidratação", "febre", "barriga inchada"],
  patient: {
    name: "Zilda Pereira",
    ageYears: 81,
    sex: "feminino",
    weightKg: 56,
    heightCm: 152,
    visual: { ageGroup: "idoso", sex: "feminino", skinTone: 2, hairStyle: "curto", hairColor: "branco", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Idosa de 81 anos, internada há 3 semanas por pneumonia (tratada com amoxicilina-clavulanato e depois ceftriaxona), com 8 a 10 evacuações líquidas por dia há 4 dias, febre, barriga inchada e muita fraqueza.",
  communication: "limitada",
  informants: [{ id: "neta", name: "Neta", role: "Acompanhante" }],
  history: [
    hi("h-diarreia", "queixa", "Como é a diarreia? Tem sangue?", [{ source: "neta", text: "Muito aguada, cheiro forte, umas 10 vezes por dia, sem sangue. Hoje evacuou menos, mas a barriga inchou." }], ["diarreia", "sangue", "vezes"]),
    hi("h-antibiotico", "medicacoes", "Tomou antibiótico recentemente? Ainda toma?", [{ source: "neta", text: "Ficou internada por pneumonia há 3 semanas, tomou dois antibióticos. Ainda está tomando a amoxicilina com clavulanato que mandaram para casa." }], ["antibiótico", "internação", "amoxicilina"]),
    hi("h-ibp", "medicacoes", "Toma remédio para estômago?", [{ source: "neta", text: "Omeprazol todo dia faz anos." }], ["estômago", "omeprazol"]),
    hi("h-urina", "alimentacao_eliminacoes", "Está urinando? Bebendo?", [{ source: "neta", text: "Urinando pouco, quase não bebe." }], ["urina", "bebendo"]),
    hi("h-contato", "exposicao", "Alguém mais em casa com diarreia? Comeu algo diferente?", [{ source: "neta", text: "Ninguém mais. Comida normal." }], ["casa", "comida", "contato"])
  ],
  initial: {
    vars: { hr: 118, sbp: 88, dbp: 50, rr: 22, spo2: 95, temp: 38.4, gcs: 14, pain: 6, glucose: 102, perfusion: 0.45, effort: 0.3, wbc: 26400, creat: 2.1, urea: 98, na: 133, k: 3.0, hco3: 17, lactate: 3.2, hb: 12.2, urine: 10 },
    flags: { rhythm: "taquicardia_sinusal", posture: "supino", painVisual: "moderada", speech: "frases", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-abdome", "abdome_epigastrio", "palpacao", "Abdome distendido, timpânico, doloroso difusamente, sem rigidez; ruídos diminuídos.", { label: "Abdome", better: [{ when: { ruleFired: "r-megacolon" }, text: "Abdome muito distendido, defesa difusa e descompressão dolorosa." }] }),
    ex("e-geral", "geral", "inspecao", "Mucosas muito secas, prostrada, extremidades frias.", {}),
    ex("e-torax", "torax_posterior", "ausculta", "Estertores residuais em base direita.", { sound: "estertores" }),
    ex("e-neuro", "neurologico", "especial", "Sonolenta, orientada parcialmente.", {})
  ],
  testResults: [
    { testId: "toxina_cdiff", variants: [{ text: "GDH positivo; toxina A/B positiva." }] },
    { testId: "rx_abdome", variants: [{ text: "Laudo educativo: dilatação do cólon transverso (7 cm), espessamento de parede (impressões digitais); sem pneumoperitônio." }] },
    { testId: "tc_abdome", variants: [{ text: "Laudo educativo: pancolite com espessamento parietal acentuado, cólon transverso 7 cm, ascite discreta; sem perfuração." }] },
    { testId: "hemocultura", variants: [{ text: "Coletadas." }] }
  ],
  highlightedActions: ["monitorizar", "acesso_venoso", "solicitar_avaliacao_cirurgica"],
  rules: [
    { id: "r-curso", description: "Colite fulminante em evolução", priority: 10, when: { always: true }, repeat: "once", effects: [trend("sbp", 76, 3600, "cdi", 10), trend("hr", 128, 3600, "cdi", 10), trend("lactate", 4.6, 3600, "cdi", 10), trend("creat", 2.6, 5400, "cdi", 10), trend("wbc", 32000, 5400, "cdi", 10), trend("k", 2.7, 5400, "cdi", 10)] },
    { id: "r-volume", description: "Cristaloide: perfusão melhora parcialmente", priority: 25, when: VOL, repeat: "once", effects: [trend("sbp", 98, 1200, "vol", 25), trend("hr", 110, 1200, "vol", 25), trend("urine", 30, 2400, "vol", 25)] },
    { id: "r-kcl", description: "Reposição de potássio", priority: 30, when: { drugGiven: "kcl" }, repeat: "once", effects: [trend("k", 3.6, 3600, "kcl", 30)] },
    { id: "r-vanco-iv", description: "Vancomicina IV para C. difficile", priority: 20, when: { all: [VANCO_IV, { not: VANCO_VO }] }, repeat: "once", effects: [obs("Vancomicina IV não chega à luz do cólon: para C. difficile a via é oral (ou retal se íleo).")] },
    { id: "r-metro-isolado", description: "Metronidazol isolado", priority: 20, when: { all: [METRO, { not: VANCO_VO }, { time: "gte", seconds: 3000 }] }, repeat: "once", effects: [obs("Metronidazol isolado é inferior; na forma fulminante, associar a vancomicina oral.")] },
    { id: "r-tratamento", description: "Vancomicina VO + metronidazol IV + volume: estabilização", priority: 50, when: { all: [VANCO_VO, METRO, VOL] }, repeat: "once", effects: [trend("sbp", 110, 3600, "tto", 50), trend("hr", 98, 3600, "tto", 50), trend("temp", 37.6, 5400, "tto", 50), trend("lactate", 2.0, 5400, "tto", 50), trend("wbc", 18000, 14400, "tto", 50), outcome("estabilizacao_parcial")] },
    { id: "r-cirurgia", description: "Cirurgia acionada", priority: 30, when: { actionCompleted: "solicitar_avaliacao_cirurgica" }, repeat: "once", effects: [staff("supervisor", "Cirurgião: colite fulminante com dilatação de 7 cm — acompanhamento conjunto; colectomia (ou ileostomia em alça com lavagem) se piora em 24–48 h, perfuração ou choque refratário.")] },
    { id: "r-megacolon", description: "Sem vancomicina oral em 90 min: megacólon tóxico e choque", priority: 40, when: { all: [{ time: "gte", seconds: 5400 }, { not: VANCO_VO }] }, repeat: "once", effects: [trend("sbp", 68, 900, "mega", 40), trend("hr", 136, 900, "mega", 40), trend("gcs", 11, 1800, "mega", 40), flag("consciousness", "voz"), staff("enfermagem", "A barriga está muito distendida e dura, pressão 68."), outcome("piora")] },
    { id: "r-sem-volume", description: "Sem volume em 40 min: choque", priority: 35, when: { all: [{ time: "gte", seconds: 2400 }, { not: VOL_INICIO }] }, repeat: "once", effects: [trend("sbp", 70, 900, "hipo", 35), staff("enfermagem", "Pressão 70 por 40, quase não urina."), outcome("piora")] }
  ],
  diagnosis: { primary: "colite_cdiff", accepted: ["colite_cdiff"], differentials: ["gastroenterite", "isquemia_mesenterica", "choque_septico", "obstrucao_intestinal", "desidratacao_grave"] },
  acceptedDestinations: ["uti"],
  outcomeNotes: "Colite por C. difficile fulminante (hipotensão, íleo, cólon de 7 cm; leucócitos 26 mil, creatinina 2,1) em idosa com antibiótico recente e IBP. Precauções de contato, cristaloide, potássio, suspender amoxicilina-clavulanato (e reavaliar IBP), toxina nas fezes, vancomicina oral 500 mg 6/6 h + metronidazol IV (vancomicina retal se íleo), avaliação cirúrgica precoce e UTI.",
  scoring: [
    { id: "s-atb", domain: "historia", description: "Antibiótico recente e em uso", evidence: { kind: "historyAsked", items: ["h-antibiotico"], minCount: 1 }, points: 10, severity: "critica", rationale: "Principal fator de risco; suspender se possível." },
    { id: "s-hist", domain: "historia", description: "Características da diarreia, IBP e diurese", evidence: { kind: "historyAsked", items: ["h-diarreia", "h-ibp", "h-urina"], minCount: 2 }, points: 5, severity: "importante", rationale: "Gravidade e fatores de risco." },
    { id: "s-exame", domain: "historia", description: "Abdome e perfusão", evidence: { kind: "examDone", regions: ["abdome_epigastrio", "geral"], minCount: 2 }, points: 5, severity: "importante", rationale: "Íleo/megacólon e choque." },
    { id: "s-toxina", domain: "exames", description: "Pesquisa de C. difficile", evidence: { kind: "testOrdered", anyOf: ["toxina_cdiff"], withinSeconds: 1800 }, points: 6, severity: "importante", rationale: "Confirmação; não atrasar tratamento empírico na forma fulminante." },
    { id: "s-imagem", domain: "exames", description: "Imagem abdominal (dilatação/perfuração)", evidence: { kind: "testOrdered", anyOf: ["rx_abdome", "tc_abdome"], withinSeconds: 3600 }, points: 5, severity: "importante", rationale: "Megacólon tóxico." },
    { id: "s-labs", domain: "exames", description: "Hemograma, função renal, eletrólitos, lactato", evidence: { kind: "testOrdered", anyOf: ["hemograma", "funcao_renal", "eletrolitos", "gaso_venosa"], withinSeconds: 900 }, points: 5, severity: "importante", rationale: "Critérios de gravidade." },
    { id: "s-volume", domain: "tratamento", description: "Cristaloide", evidence: { kind: "drugGiven", anyOf: ["ringer_lactato", "sf09"], withinSeconds: 1200 }, points: 8, severity: "critica", rationale: "Hipovolemia grave." },
    { id: "s-vanco", domain: "tratamento", description: "Vancomicina por via oral", evidence: { kind: "drugGiven", anyOf: ["vancomicina"], routes: ["VO"], withinSeconds: 3600 }, points: 16, severity: "critica", rationale: "Fulminante: 500 mg 6/6 h VO.", sourceIds: ["INT-IDSA-CDI-2021"] },
    { id: "s-metro", domain: "tratamento", description: "Metronidazol IV associado", evidence: { kind: "drugGiven", anyOf: ["metronidazol"], withinSeconds: 3600 }, points: 6, severity: "importante", rationale: "Forma fulminante.", sourceIds: ["INT-IDSA-CDI-2021"] },
    { id: "s-vanco-iv", domain: "tratamento", description: "Falha: vancomicina IV como tratamento", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-vanco-iv" } }, points: 8, penalty: true, severity: "importante", rationale: "Não atinge o cólon." },
    { id: "s-cirurgia", domain: "tratamento", description: "Avaliação cirúrgica precoce", evidence: { kind: "actionDone", anyOf: ["solicitar_avaliacao_cirurgica"], withinSeconds: 5400 }, points: 6, severity: "importante", rationale: "Megacólon e choque." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou perfusão, abdome e eletrólitos", evidence: { kind: "reassessAfter", after: ["ringer_lactato", "sf09", "vancomicina"], reassess: ["medir_pa", "abdome_epigastrio", "gaso_venosa", "eletrolitos"], withinSeconds: 3600 }, points: 6, severity: "importante", rationale: "Detectar piora para cirurgia." },
    { id: "s-dx", domain: "destino", description: "Colite por C. difficile", evidence: { kind: "diagnosis", accepted: ["colite_cdiff"] }, points: 4, severity: "importante", rationale: "Antibiótico recente + diarreia + leucocitose." },
    { id: "s-destino", domain: "destino", description: "UTI", evidence: { kind: "disposition", accepted: ["uti"] }, points: 4, severity: "importante", rationale: "Forma fulminante." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Diarreia depois de antibióticos em idosa recém-internada: qual bactéria?" },
      { level: 2, text: "Ela evacuou menos e a barriga inchou. Isso é melhora?" },
      { level: 3, text: "Para tratar a luz do cólon, por qual via vai a vancomicina?" },
      { level: 4, text: "Sugestão explícita: Ringer, KCl, exames, toxina, radiografia/TC, suspender amoxicilina-clavulanato, vancomicina oral 500 mg + metronidazol IV, cirurgia, UTI." }
    ],
    summary: "Idosa de 81 anos com colite por C. difficile fulminante após antibióticos para pneumonia, em uso de IBP.",
    pathophysiology: "Antibióticos alteram a microbiota e permitem a germinação de esporos de C. difficile; as toxinas A e B lesam o epitélio colônico (pseudomembranas). Na forma fulminante há íleo, dilatação colônica, translocação, choque e risco de perfuração. A diminuição das evacuações com distensão é sinal de íleo, não de melhora.",
    keyPoints: [
      "Fatores de risco: antibiótico recente, idade, internação, IBP.",
      "Gravidade: leucócitos ≥ 15 mil ou creatinina > 1,5; fulminante: hipotensão, choque, íleo, megacólon.",
      "Suspender antibiótico causador; hidratar; precauções de contato.",
      "Fulminante: vancomicina oral 500 mg 6/6 h + metronidazol IV (vancomicina retal se íleo).",
      "Cirurgia precoce se piora, megacólon ou perfuração."
    ],
    alternatives: ["Fidaxomicina nos episódios não fulminantes (preferida pela IDSA/SHEA; não incorporada amplamente no SUS).", "Vancomicina retal por enema se íleo."],
    oralRubric: [
      { id: "o1", concept: "Fatores de risco", synonyms: ["antibiótico", "idade", "internação", "omeprazol"], weight: 2 },
      { id: "o2", concept: "Critérios de gravidade/fulminante", synonyms: ["leucocitose", "creatinina", "megacólon", "íleo", "fulminante"], weight: 2 },
      { id: "o3", concept: "Vancomicina oral", synonyms: ["vancomicina oral", "via oral", "vancomicina"], weight: 3 },
      { id: "o4", concept: "Cirurgia", synonyms: ["colectomia", "cirurgia"], weight: 1 }
    ],
    simplifications: ["Suspensão do antibiótico e precauções de contato avaliadas pela anamnese/ensino.", "Vancomicina oral preparada a partir do frasco-ampola (prática comum no Brasil).", "Metronidazol sem regra de dose validada (o app alerta)."]
  },
  references: ["INT-IDSA-CDI-2021", "INT-SSC-2021", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "História, exame, Ringer, KCl, labs, toxina, radiografia, vancomicina VO + metronidazol, cirurgia, UTI", commands: [ask(10, "h-diarreia"), ask(20, "h-antibiotico"), ask(30, "h-ibp"), ask(40, "h-urina"), { atSeconds: 50, type: "examine", payload: { region: "abdome_epigastrio", maneuver: "palpacao" } }, { atSeconds: 60, type: "examine", payload: { region: "geral", maneuver: "inspecao" } }, act(70, "monitorizar"), act(80, "acesso_venoso"), act(180, "acesso_venoso"), test(290, "hemograma"), test(300, "gaso_venosa"), test(310, "eletrolitos"), rx(320, "ringer_lactato", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 45 }), test(400, "toxina_cdiff"), test(420, "rx_abdome"), rx(600, "vancomicina", "fa500", 500, "mg", "VO"), rx(650, "metronidazol", "bolsa500", 500, "mg", "IV", "infusao_volume", { durationMinutes: 30 }), rx(700, "kcl", "amp10", 20, "mEq", "IV", "infusao_volume", { durationMinutes: 120 }), act(800, "solicitar_avaliacao_cirurgica"), act(3400, "medir_pa"), dx(3500, "colite_cdiff"), dest(3600, "uti")], runUntilSeconds: 7000, expect: [{ condition: { ruleFired: "r-tratamento" }, description: "estabilização" }, { condition: { not: { ruleFired: "r-megacolon" } }, description: "sem megacólon" }, { condition: { not: { ruleFired: "r-vanco-iv" } }, description: "via correta" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-sem-volume" }, description: "choque" }, { condition: { ruleFired: "r-megacolon" }, description: "megacólon" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Vancomicina IV e metronidazol, sem vancomicina oral", commands: [act(30, "acesso_venoso"), rx(150, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 45 }), rx(300, "vancomicina", "fa1g", 15, "mg/kg", "IV"), rx(350, "metronidazol", "bolsa500", 500, "mg", "IV", "infusao_volume", { durationMinutes: 30 })], runUntilSeconds: 6500, expect: [{ condition: { ruleFired: "r-vanco-iv" }, description: "via errada" }, { condition: { ruleFired: "r-metro-isolado" }, description: "metronidazol isolado" }, { condition: { ruleFired: "r-megacolon" }, description: "megacólon" }] },
    { id: "t-atraso", kind: "delay", description: "Volume e vancomicina oral tardios", commands: [act(30, "acesso_venoso"), test(150, "toxina_cdiff"), rx(2600, "ringer_lactato", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 45 }), rx(5000, "vancomicina", "fa500", 500, "mg", "VO"), rx(5050, "metronidazol", "bolsa500", 500, "mg", "IV", "infusao_volume", { durationMinutes: 30 })], runUntilSeconds: 9000, expect: [{ condition: { ruleFired: "r-sem-volume" }, description: "choque pelo atraso" }, { condition: { ruleFired: "r-tratamento" }, description: "estabilização tardia" }] },
    { id: "t-alternativa", kind: "alternative", description: "SF 0,9%, TC de abdome e tratamento completo", commands: [act(30, "acesso_venoso"), act(130, "acesso_venoso"), rx(240, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 45 }), rx(400, "vancomicina", "fa500", 500, "mg", "VO"), rx(420, "metronidazol", "bolsa500", 500, "mg", "IV", "infusao_volume", { durationMinutes: 30 }), test(500, "tc_abdome"), act(600, "solicitar_avaliacao_cirurgica"), dest(4000, "uti")], runUntilSeconds: 7000, expect: [{ condition: { ruleFired: "r-tratamento" }, description: "estabilização" }, { condition: { ruleFired: "r-cirurgia" }, description: "cirurgia acionada" }] }
  ]
};
