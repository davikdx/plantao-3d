import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, O2_ON, obs, outcome, rx, staff, test, trend } from "./helpers";


const TC = { testCollected: "tc_cranio" };
const NEURO = { actionCompleted: "solicitar_avaliacao_cirurgica" };
const VIA_AEREA = { all: [{ deviceActive: "tot" }, { actionCompleted: "ventilacao_mecanica" }] };
const MANITOL = { drugGiven: "manitol" };
const SEDATIVO = { any: [{ drugGiven: "midazolam" }, { drugGiven: "diazepam" }, { drugGiven: "morfina" }] };

export const C043: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C043",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Ciclista que bateu a cabeça, estava conversando e agora está sonolento",
  teachingTitle: "TCE com hematoma extradural e rebaixamento progressivo — neuroproteção, TC e neurocirurgia",
  group: "Trauma",
  specialties: ["Trauma", "Neurocirurgia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-referencia",
  difficulty: 4,
  level: "residencia",
  objectives: [
    "Reconhecer o intervalo lúcido e o rebaixamento progressivo após TCE",
    "Prevenir lesão secundária: evitar hipóxia e hipotensão; via aérea definitiva se Glasgow ≤ 8",
    "Obter TC de crânio após a avaliação primária e acionar a neurocirurgia",
    "Reconhecer sinais de herniação e usar medidas-ponte (cabeceira, terapia hiperosmolar)",
    "Evitar sedação sem via aérea protegida"
  ],
  keywords: ["bicicleta", "cabeça", "queda", "sonolento", "vômito", "trauma"],
  patient: {
    name: "Thiago Rezende",
    ageYears: 32,
    sex: "masculino",
    weightKg: 76,
    heightCm: 180,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 1, hairStyle: "curto", hairColor: "loiro", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital de referência (neurocirurgia e TC 24 h). Ciclista de 32 anos, sem capacete, caiu e bateu a cabeça no meio-fio há 1 hora. Desmaiou por alguns segundos, depois conversou normalmente com os bombeiros. Agora reclama de dor de cabeça forte e vomitou duas vezes.",
  communication: "normal",
  informants: [{ id: "esposa", name: "Esposa", role: "Acompanhante" }],
  history: [
    h("h-queixa", "queixa", "O que o senhor está sentindo?", "Uma dor de cabeça muito forte… do lado direito… e enjoo.", { keywords: ["sentindo"] }),
    hi("h-evento", "inicio", "Como foi a queda? Desmaiou?", [{ source: "paciente", text: "Não lembro direito… só lembro de acordar no chão." }, { source: "esposa", text: "Os bombeiros disseram que ele apagou uns segundos, depois falou normal, até brincou. Começou a ficar mais quieto no caminho." }], ["queda", "desmaiou", "apagou"]),
    h("h-vomito", "fatores_associados", "Quantas vezes vomitou?", "Duas… três vezes.", { keywords: ["vomitou", "vômito"] }),
    hi("h-anticoag", "medicacoes", "Usa anticoagulante, AAS ou outro remédio?", [{ source: "esposa", text: "Não usa nenhum remédio." }], ["anticoagulante", "aas", "remédio"]),
    hi("h-alcool", "habitos", "Bebeu álcool ou usou drogas?", [{ source: "esposa", text: "Não, estava indo trabalhar." }], ["álcool", "bebeu", "drogas"]),
    hi("h-alergias", "alergias", "Tem alergias?", [{ source: "esposa", text: "Não." }])
  ],
  initial: {
    vars: { hr: 84, sbp: 142, dbp: 86, rr: 18, spo2: 96, temp: 36.4, gcs: 13, pain: 8, glucose: 118, perfusion: 0.95, effort: 0.3, etco2: 38, hb: 14.5, plt: 230000, inr: 1.0, na: 140 },
    flags: { rhythm: "sinusal", consciousness: "voz", speech: "frases", painVisual: "moderada", posture: "supino", airway: "pervia" },
    devices: ["colar_cervical"],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-cabeca", "cabeca", "inspecao", "Hematoma subgaleal e escoriação em região temporal direita.", { label: "Crânio" }),
    ex("e-pupilas", "olhos", "inspecao", "Pupilas isocóricas e fotorreagentes.", { label: "Pupilas", better: [{ when: { ruleFired: "r-herniacao" }, text: "Pupila direita dilatada e fixa; esquerda reativa (anisocoria — herniação uncal)." }, { when: { ruleFired: "r-declinio" }, text: "Pupila direita maior e lentamente reativa (anisocoria inicial)." }] }),
    ex("e-neuro", "neurologico", "especial", "Glasgow 13 (O3 V4 M6): abre os olhos ao chamado, confuso; força preservada.", { label: "Glasgow e déficit", better: [{ when: { ruleFired: "r-declinio" }, text: "Glasgow 8 (O2 V2 M4): abertura ocular à dor, sons incompreensíveis, retirada; hemiparesia esquerda." }] }),
    ex("e-via-aerea", "boca", "inspecao", "Via aérea pérvia; sem sangue em orofaringe.", { better: [{ when: { ruleFired: "r-declinio" }, text: "Ronco e secreção em orofaringe; reflexo de proteção reduzido." }] }),
    ex("e-torax", "torax_anterior", "ausculta", "Murmúrio presente bilateralmente.", { sound: "murmurio_normal" }),
    ex("e-abdome", "abdome_epigastrio", "palpacao", "Abdome flácido, indolor.", {}),
    ex("e-pele", "pele", "inspecao", "Escoriações em membros superiores; sem outras lesões.", {})
  ],
  testResults: [
    { testId: "tc_cranio", variants: [{ text: "Laudo educativo: coleção extra-axial biconvexa temporoparietal direita (~45 cm³, espessura 22 mm), desvio da linha média de 8 mm; fratura linear temporal direita. Compatível com hematoma extradural com efeito de massa." }] },
    { testId: "rx_torax", variants: [{ text: "Laudo educativo: sem alterações agudas." }] }
  ],
  highlightedActions: ["monitorizar", "avaliar_glasgow", "o2_mascara_reservatorio", "acesso_venoso", "jejum_cabeceira", "solicitar_avaliacao_cirurgica", "intubacao", "ventilacao_mecanica"],
  rules: [
    { id: "r-curso", description: "Hematoma em expansão: queda progressiva do Glasgow", priority: 10, when: { always: true }, repeat: "once", effects: [trend("gcs", 6, 1100, "hem", 10)] },
    { id: "r-declinio", description: "Glasgow ≤ 9: rebaixamento, risco de via aérea, resposta de Cushing", priority: 30, when: { path: "vars.gcs", op: "lte", value: 9 }, repeat: "once", effects: [flag("consciousness", "dor"), flag("speech", "nenhuma"), { type: "changeCommunication", state: "incapaz" }, flag("airway", "risco"), trend("hr", 56, 300, "cushing", 30), trend("sbp", 178, 300, "cushing", 30), trend("dbp", 92, 300, "cushing", 30), trend("rr", 10, 300, "cushing", 30), staff("enfermagem", "Ele não responde mais ao chamado e a pupila direita está maior!"), outcome("piora")] },
    { id: "r-hipoxia", description: "Sem O₂/via aérea após rebaixamento: hipoventilação e hipóxia (lesão secundária)", priority: 35, when: { all: [{ ruleFired: "r-declinio" }, { not: O2_ON }, { elapsedSince: "rule:r-declinio", op: "gte", seconds: 120 }] }, repeat: "once", effects: [trend("spo2", 84, 180, "hipox", 35), trend("etco2", 52, 300, "hipox", 35), trend("gcs", 5, 300, "hipox", 35), obs("Hipóxia e hipercapnia agravam a hipertensão intracraniana (lesão secundária).")] },
    { id: "r-sedacao", description: "Sedativo sem via aérea protegida: depressão respiratória e piora neurológica", priority: 70, when: { all: [SEDATIVO, { not: { deviceActive: "tot" } }] }, repeat: "once", effects: [trend("rr", 7, 60, "sed", 70, 1800), trend("spo2", 82, 120, "sed", 70, 1800), trend("gcs", 5, 120, "sed", 70), staff("enfermagem", "Depois da medicação ele quase parou de respirar!"), outcome("complicacao")] },
    { id: "r-vm", description: "Via aérea definitiva com ventilação controlada (normoventilação)", priority: 60, when: VIA_AEREA, repeat: "once", effects: [trend("spo2", 98, 120, "vm", 60), trend("etco2", 36, 120, "vm", 60), flag("airway", "protegida"), outcome("estabilizacao_parcial")] },
    { id: "r-neuro-sem-tc", description: "Neurocirurgia solicita TC", priority: 49, when: { all: [NEURO, { not: TC }] }, repeat: "once", effects: [staff("supervisor", "Neurocirurgião: precisamos da TC de crânio agora para planejar a cirurgia — leve assim que a via aérea e a hemodinâmica permitirem.")] },
    { id: "r-cirurgia", description: "TC + neurocirurgia: drenagem de urgência indicada", priority: 50, when: { all: [NEURO, TC] }, repeat: "once", effects: [staff("supervisor", "Neurocirurgião: hematoma extradural com desvio de linha média — craniotomia de urgência. Sala liberada; manter cabeceira a 30°, SpO₂ ≥ 94% e PAS ≥ 110 mmHg."), outcome("estabilizacao_parcial")] },
    { id: "r-manitol", description: "Terapia hiperosmolar: ponte temporária na herniação", priority: 40, when: MANITOL, repeat: "once", effects: [obs("Após a terapia hiperosmolar, a pupila direita ficou menos dilatada — efeito temporário; o tratamento definitivo é cirúrgico.")] },
    { id: "r-herniacao", description: "Sem cirurgia indicada em 45 min (e sem ponte hiperosmolar): herniação", priority: 80, when: { all: [{ time: "gte", seconds: 2700 }, { not: { ruleFired: "r-cirurgia" } }, { not: MANITOL }] }, repeat: "once", effects: [trend("gcs", 3, 300, "hern", 80), trend("hr", 46, 300, "hern", 80), trend("sbp", 196, 300, "hern", 80), flag("consciousness", "irresponsivo"), staff("enfermagem", "Pupila direita fixa e dilatada! Postura em extensão!"), outcome("piora")] },
    { id: "r-herniacao-tardia", description: "Com ponte hiperosmolar, mas sem cirurgia em 65 min: herniação", priority: 79, when: { all: [{ time: "gte", seconds: 3900 }, { not: { ruleFired: "r-cirurgia" } }] }, repeat: "once", effects: [trend("gcs", 3, 300, "hern2", 81), flag("consciousness", "irresponsivo"), outcome("piora")] },
    { id: "r-obito", description: "Herniação não tratada: parada respiratória (desfecho definido pelo caso)", priority: 100, when: { any: [{ elapsedSince: "rule:r-herniacao", op: "gte", seconds: 1200 }, { elapsedSince: "rule:r-herniacao-tardia", op: "gte", seconds: 1200 }] }, repeat: "once", effects: [{ type: "setValue", var: "rr", value: 0 }, flag("pulse", false), outcome("obito", true)] }
  ],
  diagnosis: { primary: "hematoma_epidural", accepted: ["hematoma_epidural"], differentials: ["hematoma_subdural", "tce_leve", "intox_alcool", "hipoglicemia", "avc_hemorragico"] },
  acceptedDestinations: ["centro_cirurgico"],
  outcomeNotes: "Perda transitória de consciência, intervalo lúcido e rebaixamento com anisocoria e Cushing: hematoma extradural. Prevenir lesão secundária (SpO₂ ≥ 94%, PAS ≥ 110 mmHg), IOT quando Glasgow ≤ 8, TC de crânio e craniotomia de urgência. Terapia hiperosmolar e cabeceira elevada são pontes.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Identificou perda de consciência e intervalo lúcido", evidence: { kind: "historyAsked", items: ["h-evento"], minCount: 1 }, points: 6, severity: "importante", rationale: "Padrão clássico do hematoma extradural." },
    { id: "s-anticoag", domain: "historia", description: "Perguntou sobre anticoagulante/antiagregante e álcool", evidence: { kind: "historyAsked", items: ["h-anticoag", "h-alcool"], minCount: 1 }, points: 4, severity: "importante", rationale: "Anticoagulação muda a conduta; álcool confunde a avaliação." },
    { id: "s-neuro", domain: "historia", description: "Avaliou Glasgow e pupilas (inclusive de forma seriada)", evidence: { kind: "examDone", regions: ["neurologico", "olhos"], minCount: 2 }, points: 10, severity: "critica", rationale: "Queda de Glasgow e anisocoria indicam herniação." },
    { id: "s-o2", domain: "priorizacao", description: "Oxigênio e monitorização precoces", evidence: { kind: "actionDone", anyOf: ["o2_mascara_reservatorio", "o2_cateter", "monitorizar"], withinSeconds: 300 }, points: 6, severity: "importante", rationale: "Evitar hipóxia (SpO₂ ≥ 94%).", sourceIds: ["INT-ENLS-TCE-6"] },
    { id: "s-tc", domain: "exames", description: "TC de crânio após a avaliação primária", evidence: { kind: "testOrdered", anyOf: ["tc_cranio"], withinSeconds: 1200 }, points: 12, severity: "critica", rationale: "Define a lesão e a indicação cirúrgica.", sourceIds: ["INT-ENLS-TCE-6"] },
    { id: "s-exames-excesso", domain: "exames", description: "Exames dirigidos", evidence: { kind: "testsNotExcessive", maxUnjustified: 2, justified: ["tc_cranio", "hemograma", "coagulograma", "eletrolitos", "gaso_arterial", "rx_torax", "efast"] }, points: 3, severity: "menor", rationale: "Coagulograma e tipagem pré-operatórios." },
    { id: "s-neurocir", domain: "tratamento", description: "Acionou a neurocirurgia", evidence: { kind: "actionDone", anyOf: ["solicitar_avaliacao_cirurgica"], withinSeconds: 1800 }, points: 14, severity: "critica", rationale: "Hematoma extradural com efeito de massa é emergência cirúrgica.", sourceIds: ["INT-ENLS-TCE-6"] },
    { id: "s-iot", domain: "tratamento", description: "Via aérea definitiva e ventilação controlada após Glasgow ≤ 8", evidence: { kind: "actionDone", anyOf: ["ventilacao_mecanica"] }, points: 10, severity: "critica", rationale: "Proteção de via aérea e normoventilação.", sourceIds: ["INT-ENLS-TCE-6"] },
    { id: "s-cabeceira", domain: "tratamento", description: "Cabeceira elevada", evidence: { kind: "actionDone", anyOf: ["jejum_cabeceira"] }, points: 3, severity: "menor", rationale: "Cabeceira a 30° (coluna alinhada).", sourceIds: ["INT-ENLS-TCE-6"] },
    { id: "s-sedacao", domain: "tratamento", description: "Falha: sedativo sem via aérea protegida", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-sedacao" } }, points: 10, penalty: true, severity: "critica", rationale: "Hipoventilação eleva o CO₂ e a pressão intracraniana." },
    { id: "s-hipoxia", domain: "reavaliacao", description: "Falha: hipóxia após o rebaixamento", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-hipoxia" } }, points: 8, penalty: true, severity: "importante", rationale: "Hipóxia é lesão secundária evitável." },
    { id: "s-reav", domain: "reavaliacao", description: "Glasgow seriado", evidence: { kind: "actionDone", anyOf: ["avaliar_glasgow"] }, points: 10, severity: "importante", rationale: "Detectar deterioração precoce." },
    { id: "s-dx", domain: "destino", description: "Hipótese de hematoma extradural", evidence: { kind: "diagnosis", accepted: ["hematoma_epidural"] }, points: 6, severity: "importante", rationale: "Confirmado na TC." },
    { id: "s-destino", domain: "destino", description: "Centro cirúrgico", evidence: { kind: "disposition", accepted: ["centro_cirurgico"] }, points: 10, severity: "importante", rationale: "Craniotomia de urgência." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Ele conversava há pouco tempo. O que mudou?" },
      { level: 2, text: "Olhe as pupilas e repita o Glasgow." },
      { level: 3, text: "Sangramento arterial extradural em expansão; a pressão intracraniana sobe e o cérebro hernia." },
      { level: 4, text: "Sugestão explícita: O₂, monitor, TC de crânio, neurocirurgia, IOT quando Glasgow ≤ 8 com normoventilação, cabeceira a 30° e manitol como ponte se herniação." }
    ],
    summary: "Ciclista de 32 anos com TCE, perda transitória de consciência, intervalo lúcido e rebaixamento progressivo com anisocoria direita, hemiparesia esquerda e resposta de Cushing: hematoma extradural temporoparietal direito.",
    pathophysiology: "Fratura temporal lesa a artéria meníngea média; o sangue arterial descola a dura e forma uma coleção biconvexa que se expande. Quando a complacência intracraniana se esgota, a pressão sobe, o úncus hernia e comprime o III nervo (midríase ipsilateral) e o tronco (rebaixamento, Cushing). Hipóxia e hipotensão agravam a lesão secundária.",
    keyPoints: [
      "Intervalo lúcido + rebaixamento = pensar em hematoma extradural.",
      "Evitar hipóxia e hipotensão (lesão secundária).",
      "IOT quando Glasgow ≤ 8; normoventilação (hiperventilação só como ponte breve).",
      "TC de crânio e neurocirurgia sem demora; craniotomia é o tratamento definitivo.",
      "Sedação sem via aérea protegida piora a pressão intracraniana."
    ],
    alternatives: ["Salina hipertônica em vez de manitol como ponte (não modelada).", "Acesso intraósseo se venoso difícil."],
    oralRubric: [
      { id: "o1", concept: "Intervalo lúcido e anisocoria", synonyms: ["intervalo lúcido", "anisocoria", "pupila"], weight: 2 },
      { id: "o2", concept: "Prevenir lesão secundária", synonyms: ["hipóxia", "hipotensão", "lesão secundária"], weight: 2 },
      { id: "o3", concept: "TC e neurocirurgia", synonyms: ["tomografia", "neurocirurgia", "craniotomia"], weight: 3 },
      { id: "o4", concept: "Via aérea definitiva", synonyms: ["intubação", "iot", "via aérea"], weight: 2 }
    ],
    simplifications: ["Dose de manitol não validada no catálogo (o app alerta e não sugere dose).", "Craniotomia não é simulada; acionar a neurocirurgia com TC representa a decisão."]
  },
  references: ["INT-ENLS-TCE-6", "BR-SAMU-SAV", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 15, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "O₂, monitor, Glasgow, TC, neurocirurgia, IOT + VM, cabeceira, centro cirúrgico", commands: [act(10, "o2_mascara_reservatorio", { fluxo: 15 }), act(20, "monitorizar"), ask(70, "h-evento"), act(80, "avaliar_glasgow"), { atSeconds: 110, type: "examine", payload: { region: "olhos", maneuver: "inspecao" } }, act(130, "acesso_venoso"), test(240, "tc_cranio"), act(260, "solicitar_avaliacao_cirurgica"), act(600, "jejum_cabeceira"), act(700, "intubacao"), act(830, "intubacao"), act(960, "ventilacao_mecanica"), { atSeconds: 1100, type: "examine", payload: { region: "neurologico", maneuver: "especial" } }, dx(1600, "hematoma_epidural"), dest(1600, "centro_cirurgico")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-cirurgia" }, description: "cirurgia indicada" }, { condition: { ruleFired: "r-vm" }, description: "via aérea protegida" }, { condition: { not: { ruleFired: "r-herniacao" } }, description: "sem herniação" }, { condition: { not: { ruleFired: "r-hipoxia" } }, description: "sem hipóxia" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 4000, expect: [{ condition: { ruleFired: "r-herniacao" }, description: "herniação" }, { condition: { ruleFired: "r-obito" }, description: "óbito definido pelo caso" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Midazolam para agitação, sem via aérea", commands: [act(30, "acesso_venoso"), act(130, "acesso_venoso"), rx(240, "midazolam", "amp15", 5, "mg", "IV")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-sedacao" }, description: "depressão respiratória" }] },
    { id: "t-atraso", kind: "delay", description: "TC aos 30 min, manitol como ponte, neurocirurgia aos 50 min", commands: [act(10, "o2_mascara_reservatorio", { fluxo: 15 }), act(30, "acesso_venoso"), act(130, "acesso_venoso"), rx(2400, "manitol", "fr250", 250, "mL", "IV", "infusao_volume", { durationMinutes: 15 }), test(1800, "tc_cranio"), act(3000, "solicitar_avaliacao_cirurgica")], runUntilSeconds: 3800, expect: [{ condition: { ruleFired: "r-manitol" }, description: "ponte hiperosmolar" }, { condition: { ruleFired: "r-cirurgia" }, description: "cirurgia indicada" }, { condition: { not: { ruleFired: "r-herniacao" } }, description: "herniação evitada pela ponte" }] },
    { id: "t-alternativa", kind: "alternative", description: "Acesso intraósseo, neurocirurgia antes da TC (pede TC)", commands: [act(10, "o2_mascara_reservatorio", { fluxo: 15 }), act(20, "monitorizar"), act(40, "acesso_io"), act(120, "solicitar_avaliacao_cirurgica"), test(800, "tc_cranio")], runUntilSeconds: 2500, expect: [{ condition: { ruleFired: "r-neuro-sem-tc" }, description: "pede TC" }, { condition: { ruleFired: "r-cirurgia" }, description: "cirurgia indicada após TC" }] }
  ]
};
