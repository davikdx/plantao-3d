import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const SNG = { actionCompleted: "sonda_nasogastrica" };
const VOL = { any: [{ drugGiven: "ringer_lactato", minTotal: { value: 500, unit: "mL" as const } }, { drugGiven: "sf09", minTotal: { value: 500, unit: "mL" as const } }] };
const TC = { testCollected: "tc_abdome" };
const CIRURGIA = { actionCompleted: "solicitar_avaliacao_cirurgica" };
const ALTA = { any: [{ path: "disposition", op: "eq", value: "alta_orientada" }, { path: "disposition", op: "eq", value: "alta_com_seguimento_ubs" }] };

export const C068: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C068",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Senhora com barriga inchada, vomitando e sem soltar gases desde ontem",
  teachingTitle: "Obstrução de intestino delgado por bridas — descompressão, hidratação, eletrólitos, TC e vigilância de estrangulamento",
  group: "Gastroenterologia",
  specialties: ["Cirurgia geral", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Reconhecer obstrução intestinal (cólica, vômitos, distensão, parada de eliminação de gases e fezes)",
    "Descomprimir com sonda nasogástrica, jejum, hidratar e corrigir eletrólitos",
    "Usar TC para confirmar, localizar e procurar sinais de estrangulamento",
    "Acionar a cirurgia e indicar tratamento não operatório monitorizado quando não houver sofrimento de alça",
    "Reconhecer sinais de estrangulamento que exigem cirurgia"
  ],
  keywords: ["barriga inchada", "vômito", "gases", "intestino preso", "cólica", "cirurgia antiga"],
  patient: {
    name: "Cleusa Martins",
    ageYears: 63,
    sex: "feminino",
    weightKg: 70,
    heightCm: 160,
    visual: { ageGroup: "adulto", sex: "feminino", skinTone: 3, hairStyle: "curto", hairColor: "castanho", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Mulher de 63 anos com dor em cólica difusa há 2 dias, vômitos frequentes (hoje esverdeados) e barriga cada vez mais inchada. Não elimina gases nem fezes desde ontem.",
  communication: "normal",
  informants: [{ id: "marido", name: "Marido", role: "Acompanhante" }],
  history: [
    h("h-dor", "localizacao", "Como é a dor?", "Vem e passa, em cólica, em toda a barriga, mais em volta do umbigo.", { keywords: ["dor", "como", "cólica"] }),
    h("h-vomito", "fatores_associados", "Como são os vômitos? Gases e fezes?", "Primeiro comida, depois verde, agora com cheiro ruim. Não sai gás nem fezes desde ontem de manhã.", { keywords: ["vômito", "gases", "fezes", "evacuou"] }),
    h("h-cirurgias", "cirurgias", "Já operou a barriga?", "Tirei o útero há 15 anos e operei vesícula há 8.", { keywords: ["operou", "cirurgia", "útero"] }),
    h("h-hernia", "fatores_associados", "Notou algum caroço na virilha ou no umbigo?", "Não que eu tenha visto.", { keywords: ["caroço", "hérnia", "virilha"] }),
    hi("h-medicacoes", "medicacoes", "Que remédios usa?", [{ source: "marido", text: "Só remédio de pressão. Ontem ela tomou um laxante por conta." }], ["remédio", "laxante"])
  ],
  initial: {
    vars: { hr: 106, sbp: 116, dbp: 70, rr: 20, spo2: 96, temp: 37.3, gcs: 15, pain: 7, glucose: 118, perfusion: 0.7, effort: 0.3, k: 3.1, na: 134, cl: 94, hco3: 29, creat: 1.5, urea: 74, wbc: 11800, lactate: 1.8, hb: 14.4, urine: 15 },
    flags: { rhythm: "taquicardia_sinusal", posture: "supino", painVisual: "moderada", speech: "frases", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-abdome", "abdome_epigastrio", "palpacao", "Abdome distendido, timpânico, doloroso difusamente sem defesa ou descompressão dolorosa; cicatrizes de Pfannenstiel e de colecistectomia.", { label: "Abdome", better: [{ when: { ruleFired: "r-estrangulamento" }, text: "Dor localizada intensa com defesa e descompressão dolorosa; contínua, não mais em cólica." }, { when: SNG, text: "Abdome menos distendido após a sonda; dor leve." }] }),
    ex("e-ausculta", "abdome_qid", "ausculta", "Ruídos hidroaéreos aumentados, metálicos, em salvas.", { label: "Ruídos", sound: "ruidos_hidroaereos" }),
    ex("e-hernias", "pelve", "inspecao", "Sem hérnias inguinais, femorais ou umbilicais encarceradas.", { label: "Orifícios herniários" }),
    ex("e-geral", "geral", "inspecao", "Mucosas secas, desidratada.", {})
  ],
  testResults: [
    { testId: "rx_abdome", variants: [{ text: "Laudo educativo: alças de delgado distendidas com níveis hidroaéreos; pouco gás no cólon." }] },
    { testId: "tc_abdome", variants: [{ text: "Laudo educativo: obstrução de delgado com ponto de transição em íleo distal (provável brida); alças com realce preservado, sem pneumatose, sem líquido livre importante; sem sinais de estrangulamento." }] }
  ],
  highlightedActions: ["sonda_nasogastrica", "acesso_venoso", "diurese_horaria", "solicitar_avaliacao_cirurgica"],
  rules: [
    { id: "r-curso", description: "Obstrução mantida: perdas, alcalose hipoclorêmica e hipocalemia", priority: 10, when: { always: true }, repeat: "once", effects: [trend("hr", 116, 3600, "obs", 10), trend("k", 2.8, 5400, "obs", 10), trend("creat", 1.8, 5400, "obs", 10), trend("pain", 8, 2400, "obs", 10)] },
    { id: "r-sng", description: "Descompressão por sonda nasogástrica", priority: 30, when: SNG, repeat: "once", effects: [trend("pain", 4, 600, "sng", 30), staff("enfermagem", "A sonda drenou uns 900 mL de líquido esverdeado. Ela disse que aliviou.")] },
    { id: "r-aspiracao", description: "Vômitos fecaloides sem descompressão: broncoaspiração", priority: 40, when: { all: [{ time: "gte", seconds: 2400 }, { not: SNG }] }, repeat: "once", effects: [trend("spo2", 88, 600, "asp", 40), trend("rr", 28, 600, "asp", 40), flag("cough", true), staff("enfermagem", "Ela vomitou deitada e engasgou; está tossindo e a saturação caiu."), outcome("complicacao")] },
    { id: "r-volume", description: "Cristaloide corrige desidratação", priority: 25, when: VOL, repeat: "once", effects: [trend("hr", 96, 1800, "vol", 25), trend("creat", 1.1, 10800, "vol", 25), trend("urine", 50, 2400, "vol", 25)] },
    { id: "r-kcl", description: "Reposição de potássio", priority: 35, when: { drugGiven: "kcl" }, repeat: "once", effects: [trend("k", 3.8, 3600, "kcl", 35)] },
    { id: "r-analgesia", description: "Analgesia", priority: 20, when: { any: [{ drugGiven: "morfina" }, { drugGiven: "dipirona" }] }, repeat: "once", effects: [trend("pain", 4, 600, "anal", 20)] },
    { id: "r-cirurgia-sem-tc", description: "Cirurgião pede TC", priority: 45, when: { all: [CIRURGIA, { not: TC }] }, repeat: "once", effects: [staff("supervisor", "Cirurgião: preciso da TC com contraste para ver o ponto de transição e se há sofrimento de alça.")] },
    { id: "r-plano", description: "TC sem sofrimento + cirurgia: tratamento não operatório monitorizado", priority: 46, when: { all: [CIRURGIA, TC, SNG, VOL] }, repeat: "once", effects: [staff("supervisor", "Cirurgião: obstrução por brida sem sinais de estrangulamento — manter sonda, jejum, hidratação e eletrólitos, exame seriado; se piorar ou não resolver, cirurgia."), outcome("estabilizacao_parcial")] },
    { id: "r-estrangulamento", description: "Sem descompressão nem avaliação cirúrgica: sofrimento de alça", priority: 50, when: { all: [{ time: "gte", seconds: 5400 }, { not: CIRURGIA }] }, repeat: "once", effects: [trend("temp", 38.4, 1200, "estr", 50), trend("hr", 128, 900, "estr", 50), trend("lactate", 4.0, 1800, "estr", 50), trend("wbc", 19000, 3600, "estr", 50), trend("pain", 9, 300, "estr", 50), staff("enfermagem", "A dor agora é contínua e ela tem febre."), outcome("piora")] },
    { id: "r-alta", description: "Alta com laxante", priority: 50, when: ALTA, repeat: "once", effects: [obs("Obstrução mecânica não se trata com laxante nem alta: risco de estrangulamento."), outcome("complicacao")] }
  ],
  diagnosis: { primary: "obstrucao_intestinal", accepted: ["obstrucao_intestinal"], differentials: ["isquemia_mesenterica", "apendicite_complicada", "gastroenterite", "pancreatite", "hipocalemia"] },
  acceptedDestinations: ["internacao_enfermaria", "centro_cirurgico"],
  outcomeNotes: "Obstrução de delgado por bridas (cirurgias pélvica e biliar prévias) sem sinais de estrangulamento na TC. Sonda nasogástrica, jejum, Ringer, reposição de potássio, analgesia, TC e avaliação cirúrgica; tratamento não operatório com reexame seriado e cirurgia se piora (febre, dor contínua, peritonite, lactato).",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Vômitos, parada de eliminação e cirurgias prévias", evidence: { kind: "historyAsked", items: ["h-vomito", "h-cirurgias"], minCount: 2 }, points: 8, severity: "critica", rationale: "Bridas são a principal causa." },
    { id: "s-hernia", domain: "historia", description: "Pesquisou hérnias", evidence: { kind: "examDone", regions: ["pelve"], minCount: 1 }, points: 4, severity: "importante", rationale: "Hérnia encarcerada muda a urgência." },
    { id: "s-exame", domain: "historia", description: "Exame abdominal com ausculta", evidence: { kind: "examDone", regions: ["abdome_epigastrio", "abdome_qid"], minCount: 2 }, points: 6, severity: "importante", rationale: "Distensão, ruídos de luta, peritonismo." },
    { id: "s-sng", domain: "tratamento", description: "Sonda nasogástrica em até 30 min", evidence: { kind: "actionDone", anyOf: ["sonda_nasogastrica"], withinSeconds: 1800 }, points: 12, severity: "critica", rationale: "Descompressão e prevenção de aspiração.", sourceIds: ["INT-WSES-OBSTR-2017"] },
    { id: "s-volume", domain: "tratamento", description: "Cristaloide", evidence: { kind: "drugGiven", anyOf: ["ringer_lactato", "sf09"], withinSeconds: 1200 }, points: 8, severity: "critica", rationale: "Desidratação por vômitos e sequestro.", sourceIds: ["INT-WSES-OBSTR-2017"] },
    { id: "s-kcl", domain: "tratamento", description: "Correção de potássio", evidence: { kind: "drugGiven", anyOf: ["kcl"] }, points: 5, severity: "importante", rationale: "Hipocalemia piora o íleo." },
    { id: "s-analgesia", domain: "tratamento", description: "Analgesia", evidence: { kind: "drugGiven", anyOf: ["morfina", "dipirona"], withinSeconds: 1200 }, points: 3, severity: "menor", rationale: "Conforto." },
    { id: "s-labs", domain: "exames", description: "Eletrólitos, função renal e lactato", evidence: { kind: "testOrdered", anyOf: ["eletrolitos", "gaso_venosa", "funcao_renal"], withinSeconds: 900 }, points: 5, severity: "importante", rationale: "Distúrbios e sinal de isquemia." },
    { id: "s-tc", domain: "exames", description: "TC de abdome com contraste", evidence: { kind: "testOrdered", anyOf: ["tc_abdome"], withinSeconds: 3000 }, points: 10, severity: "critica", rationale: "Ponto de transição e sinais de estrangulamento.", sourceIds: ["INT-WSES-OBSTR-2017"] },
    { id: "s-cirurgia", domain: "tratamento", description: "Acionou a cirurgia", evidence: { kind: "actionDone", anyOf: ["solicitar_avaliacao_cirurgica"], withinSeconds: 3600 }, points: 10, severity: "critica", rationale: "Decisão sobre tratamento não operatório × cirurgia." },
    { id: "s-alta", domain: "destino", description: "Falha: alta/laxante", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-alta" } }, points: 10, penalty: true, severity: "critica", rationale: "Obstrução mecânica." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou dor e abdome após descompressão", evidence: { kind: "reassessAfter", after: ["sonda_nasogastrica"], reassess: ["avaliar_dor", "abdome_epigastrio", "gaso_venosa"], withinSeconds: 3600 }, points: 6, severity: "importante", rationale: "Exame seriado detecta estrangulamento." },
    { id: "s-dx", domain: "destino", description: "Obstrução intestinal", evidence: { kind: "diagnosis", accepted: ["obstrucao_intestinal"] }, points: 5, severity: "importante", rationale: "Clínica + TC." },
    { id: "s-destino", domain: "destino", description: "Internação cirúrgica", evidence: { kind: "disposition", accepted: ["internacao_enfermaria", "centro_cirurgico"] }, points: 8, severity: "importante", rationale: "Tratamento não operatório monitorizado ou cirurgia." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Cólica, vômitos, distensão e parada de gases: qual síndrome?" },
      { level: 2, text: "Ela tem duas cirurgias abdominais prévias." },
      { level: 3, text: "Antes de qualquer exame: o estômago cheio vai para onde se ela vomitar deitada?" },
      { level: 4, text: "Sugestão explícita: sonda nasogástrica, Ringer, eletrólitos, KCl, analgesia, TC, cirurgia, internar; sem laxante." }
    ],
    summary: "Mulher de 63 anos com obstrução de delgado por bridas pós-histerectomia e colecistectomia, sem sinais de estrangulamento.",
    pathophysiology: "Aderências pós-operatórias angulam ou estrangulam alças. A distensão acima da obstrução sequestra líquido e eletrólitos, os vômitos causam alcalose hipoclorêmica e hipocalemia. Se o fluxo vascular da alça é comprometido (estrangulamento), há isquemia, febre, dor contínua e peritonite — indicação cirúrgica.",
    keyPoints: [
      "Quadro clássico: cólica, vômitos, distensão, parada de eliminação.",
      "Sonda nasogástrica, jejum, hidratação e eletrólitos.",
      "TC: ponto de transição e sinais de sofrimento.",
      "Sem estrangulamento: tratamento não operatório com exame seriado.",
      "Peritonite, febre, dor contínua, lactato alto: cirurgia."
    ],
    alternatives: ["Contraste hidrossolúvel oral pela sonda como teste diagnóstico/terapêutico (não modelado).", "Laparoscopia em casos selecionados."],
    oralRubric: [
      { id: "o1", concept: "Bridas", synonyms: ["brida", "aderência", "cirurgia prévia"], weight: 2 },
      { id: "o2", concept: "Sonda e hidratação", synonyms: ["sonda", "descompressão", "jejum", "hidratação"], weight: 3 },
      { id: "o3", concept: "Sinais de estrangulamento", synonyms: ["estrangulamento", "isquemia", "peritonite"], weight: 2 },
      { id: "o4", concept: "TC", synonyms: ["tomografia", "tc"], weight: 1 }
    ],
    simplifications: ["A evolução do tratamento não operatório (48–72 h) não é simulada.", "Contraste hidrossolúvel não está no catálogo."]
  },
  references: ["INT-WSES-OBSTR-2017", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 15, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "História, exame, SNG, Ringer, KCl, analgesia, labs, TC, cirurgia, internação", commands: [ask(10, "h-vomito"), ask(20, "h-cirurgias"), { atSeconds: 30, type: "examine", payload: { region: "abdome_epigastrio", maneuver: "palpacao" } }, { atSeconds: 40, type: "examine", payload: { region: "abdome_qid", maneuver: "ausculta" } }, { atSeconds: 50, type: "examine", payload: { region: "pelve", maneuver: "inspecao" } }, act(60, "acesso_venoso"), act(160, "sonda_nasogastrica"), test(200, "eletrolitos"), test(210, "funcao_renal"), test(220, "gaso_venosa"), rx(240, "ringer_lactato", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), rx(260, "dipirona", "amp1g", 1000, "mg", "IV"), test(400, "tc_abdome"), rx(500, "kcl", "amp10", 20, "mEq", "IV", "infusao_volume", { durationMinutes: 120 }), act(1500, "avaliar_dor"), act(2500, "solicitar_avaliacao_cirurgica"), dx(3500, "obstrucao_intestinal"), dest(3600, "internacao_enfermaria")], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-plano" }, description: "plano não operatório" }, { condition: { not: { ruleFired: "r-aspiracao" } }, description: "sem aspiração" }, { condition: { not: { ruleFired: "r-estrangulamento" } }, description: "sem estrangulamento" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-aspiracao" }, description: "aspiração" }, { condition: { ruleFired: "r-estrangulamento" }, description: "estrangulamento" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Analgesia e alta com laxante", commands: [act(30, "acesso_venoso"), rx(150, "dipirona", "amp1g", 1000, "mg", "IV"), test(200, "rx_abdome"), dest(1500, "alta_orientada")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-alta" }, description: "alta indevida" }, { condition: { ruleFired: "r-aspiracao" }, description: "aspiração" }] },
    { id: "t-atraso", kind: "delay", description: "Sonda e cirurgia tardias", commands: [act(30, "acesso_venoso"), rx(150, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), act(3000, "sonda_nasogastrica"), test(3100, "tc_abdome"), act(5600, "solicitar_avaliacao_cirurgica"), dest(7000, "centro_cirurgico")], runUntilSeconds: 8000, expect: [{ condition: { ruleFired: "r-aspiracao" }, description: "aspiração pelo atraso" }, { condition: { ruleFired: "r-estrangulamento" }, description: "estrangulamento" }] },
    { id: "t-alternativa", kind: "alternative", description: "Morfina, SF 0,9%, cirurgia antes da TC", commands: [act(30, "acesso_venoso"), act(130, "sonda_nasogastrica"), rx(320, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), rx(340, "morfina", "amp10", 3, "mg", "IV"), act(400, "solicitar_avaliacao_cirurgica"), test(1100, "tc_abdome"), dest(4500, "internacao_enfermaria")], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-cirurgia-sem-tc" }, description: "cirurgião pede TC" }, { condition: { ruleFired: "r-plano" }, description: "plano não operatório" }] }
  ]
};
