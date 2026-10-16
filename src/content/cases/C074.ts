import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const MG_ATAQUE = { drugGiven: "sulfato_magnesio", minTotal: { value: 4000, unit: "mg" as const } };
const ANTI_HAS = { any: [{ drugGiven: "hidralazina" }, { drugGiven: "nifedipino" }] };

export const C074: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C074",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Gestante com dor de cabeça e pontos brilhantes na visão",
  teachingTitle: "Pré-eclâmpsia com sinais de gravidade — prevenção de eclâmpsia e controle pressórico",
  group: "Obstetrícia e ginecologia",
  specialties: ["Obstetrícia", "Emergência"],
  environment: "obstetricia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Reconhecer pré-eclâmpsia com sinais de gravidade",
    "Iniciar sulfato de magnésio para prevenção de eclâmpsia",
    "Tratar hipertensão grave sem queda brusca da PA",
    "Avaliar vitalidade fetal e rastrear síndrome HELLP",
    "Monitorizar toxicidade do magnésio e planejar a resolução da gestação"
  ],
  keywords: ["gestante", "pressão alta", "dor de cabeça", "visão", "gravidez", "estômago"],
  patient: {
    name: "Tainá Oliveira",
    ageYears: 24,
    sex: "feminino",
    weightKg: 76,
    heightCm: 160,
    pregnancyWeeks: 33,
    visual: { ageGroup: "adulto", sex: "feminino", skinTone: 4, hairStyle: "crespo_volume", hairColor: "preto", build: "medio", pregnancyTrimester: 3 }
  },
  briefing: "Pronto-atendimento obstétrico de hospital regional. Primigesta de 24 anos, 33 semanas, encaminhada da UBS com PA 168/112 mmHg, cefaleia intensa e \"pontinhos brilhantes\" na visão.",
  communication: "normal",
  informants: [{ id: "companheiro", name: "Rafael", role: "Companheiro" }],
  history: [
    h("h-queixa", "queixa", "O que você está sentindo?", "Uma dor de cabeça muito forte desde ontem e uns pontinhos brilhando na vista.", { keywords: ["sentindo"] }),
    h("h-epigastrio", "localizacao", "Tem dor na barriga, no estômago ou do lado direito?", "Tô com uma dor aqui em cima do estômago, uma queimação.", { keywords: ["estômago", "barriga", "epigástrio"] }),
    h("h-fetal", "gestacao", "O bebê está mexendo? Teve perda de líquido ou sangramento?", "Está mexendo, sim. Não perdi líquido nem sangue.", { keywords: ["bebê", "mexendo", "líquido", "sangramento"] }),
    h("h-prenatal", "antecedentes", "Como foi o pré-natal? A pressão estava alta antes?", "Fiz 6 consultas. A pressão começou a subir faz duas semanas; a médica pediu repouso. Antes da gravidez era normal.", { keywords: ["pré-natal", "pressão"] }),
    h("h-edema", "fatores_associados", "Notou inchaço ou diminuição da urina?", "Inchou muito o rosto e as mãos essa semana. Urinando menos.", { keywords: ["inchaço", "urina"] }),
    h("h-dispneia", "sinais_alarme", "Tem falta de ar?", "Não."),
    h("h-alergias", "alergias", "Tem alergia a algum remédio?", "Não."),
    h("h-medicacoes", "medicacoes", "Toma algum remédio?", "Sulfato ferroso e ácido fólico. Não tomo remédio de pressão.")
  ],
  initial: {
    vars: { hr: 96, sbp: 168, dbp: 114, rr: 18, spo2: 98, temp: 36.6, gcs: 15, pain: 7, glucose: 92, perfusion: 0.95, effort: 0.3, fetalHr: 146, hb: 12.4, ht: 38, plt: 98000, ast: 168, alt: 142, bili: 1.0, creat: 1.1, urea: 32, k: 4.2, na: 136, mg: 1.9, urine: 30 },
    flags: { rhythm: "sinusal", edema: true, painVisual: "moderada", posture: "supino" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Consciente, orientada, desconfortável; edema de face e mãos.", {}),
    ex("e-neuro", "neurologico", "especial", "Reflexos patelares vivos (3+), sem clônus sustentado; sem déficit focal.", { label: "Reflexos", better: [{ when: { path: "vars.mg", op: "gte", value: 8 }, text: "Reflexos patelares abolidos (sinal de toxicidade pelo magnésio)." }, { when: { ruleFired: "r-mg" }, text: "Reflexos patelares presentes (2+)." }] }),
    ex("e-abdome", "abdome_epigastrio", "palpacao", "Dor à palpação em epigástrio e hipocôndrio direito; útero compatível com 33 semanas, sem hipertonia.", {}),
    ex("e-utero", "abdome_qid", "palpacao", "Útero relaxado entre as palpações, sem contrações; feto cefálico.", { label: "Útero" }),
    ex("e-mmii", "membro_inferior_d", "inspecao", "Edema 2+/4+ em membros inferiores.", {}),
    ex("e-torax", "torax_anterior", "ausculta", "Murmúrio presente, sem estertores.", { sound: "murmurio_normal" })
  ],
  testResults: [
    { testId: "urina_tipo1", variants: [{ text: "Proteinúria 3+ em fita." }] },
    { testId: "usg_obstetrica", variants: [{ text: "Laudo educativo: feto único, cefálico, biometria compatível com 32 semanas, líquido amniótico normal, sem sinais de descolamento." }] }
  ],
  highlightedActions: ["monitorizar", "cardiotocografia", "acesso_venoso", "diurese_horaria", "decubito_lateral_esquerdo"],
  rules: [
    { id: "r-eclampsia", description: "Sem sulfato de magnésio, evolui com crise convulsiva (eclâmpsia)", priority: 30, when: { all: [{ time: "gte", seconds: 900 }, { not: { drugGiven: "sulfato_magnesio" } }] }, repeat: "once", effects: [flag("seizure", true), flag("consciousness", "irresponsivo"), { type: "changeCommunication", state: "incapaz" }, trend("spo2", 88, 30, "ecl", 50, 120), trend("fetalHr", 95, 60, "ecl", 50, 600), staff("acompanhante", "Ela está tendo um ataque!"), { type: "scheduleEffects", afterSeconds: 80, key: "ecl-fim", effects: [{ type: "setFlag", flag: "seizure", value: false }, { type: "setFlag", flag: "consciousness", value: "dor" }] }, outcome("complicacao")] },
    { id: "r-mg", description: "Sulfato de magnésio previne/controla eclâmpsia", priority: 60, when: MG_ATAQUE, repeat: "once", effects: [trend("mg", 5.5, 900, "mg", 60), flag("seizure", false), obs("Sulfato de magnésio em curso: monitorar reflexos, FR e diurese.")] },
    { id: "r-mg-manut", description: "Manutenção do magnésio sustenta o efeito", priority: 61, when: { treatmentActive: "sulfato_magnesio" }, repeat: "while", effects: [trend("mg", 6, 1800, "mg-manut", 61)], onEnd: [{ type: "clearTrend", var: "mg", slot: "mg-manut" }] },
    { id: "r-intox-mg", description: "Magnésio sérico alto: hiporreflexia e depressão respiratória", priority: 90, when: { path: "vars.mg", op: "gte", value: 8 }, repeat: "once", effects: [trend("rr", 9, 300, "intox", 90), staff("enfermagem", "Ela está muito sonolenta e respirando devagar."), outcome("complicacao")] },
    { id: "r-calcio-antidoto", description: "Gluconato de cálcio reverte a toxicidade pelo magnésio", priority: 95, when: { all: [{ ruleFired: "r-intox-mg" }, { drugGiven: "gluconato_calcio" }] }, repeat: "once", effects: [trend("rr", 16, 120, "antidoto", 95)] },
    { id: "r-pa", description: "Anti-hipertensivo reduz a PA de forma gradual", priority: 50, when: ANTI_HAS, repeat: "once", effects: [trend("sbp", 150, 900, "anti", 50), trend("dbp", 98, 900, "anti", 50), trend("pain", 4, 1800, "anti", 50)] },
    { id: "r-pa-excessiva", description: "Doses repetidas em sequência: queda excessiva da PA e sofrimento fetal", priority: 80, when: { any: [{ drugGiven: "hidralazina", minTotal: { value: 20, unit: "mg" } }, { drugGiven: "nifedipino", minTotal: { value: 40, unit: "mg" } }] }, repeat: "once", effects: [trend("sbp", 108, 300, "excesso", 80, 2400), trend("dbp", 62, 300, "excesso", 80, 2400), trend("fetalHr", 102, 300, "excesso", 80, 2400), staff("enfermagem", "A pressão caiu muito e o BCF está baixo!"), outcome("complicacao")] },
    { id: "r-sem-anti", description: "Sem anti-hipertensivo, PA permanece em nível de risco", priority: 20, when: { all: [{ time: "gte", seconds: 1200 }, { not: ANTI_HAS }] }, repeat: "once", effects: [trend("sbp", 178, 900, "doenca", 10), trend("dbp", 118, 900, "doenca", 10), outcome("piora")] },
    { id: "r-estabiliza", description: "Magnésio + PA controlada: estabilização materna para planejar o parto", priority: 70, when: { all: [{ ruleFired: "r-mg" }, { ruleFired: "r-pa" }, { not: { ruleFired: "r-pa-excessiva" } }] }, repeat: "once", effects: [outcome("estabilizacao_parcial")] },
    { id: "r-lateral", description: "Decúbito lateral esquerdo melhora o fluxo uteroplacentário", when: { actionCompleted: "decubito_lateral_esquerdo" }, repeat: "once", effects: [trend("fetalHr", 140, 300, "dle", 40)] }
  ],
  diagnosis: { primary: "pre_eclampsia_grave", accepted: ["pre_eclampsia_grave", "hellp"], differentials: ["hellp", "eclampsia", "hipertensao_gestacional", "enxaqueca", "avc_hemorragico", "colecistite"] },
  acceptedDestinations: ["uti", "internacao_enfermaria", "centro_cirurgico"],
  outcomeNotes: "Sulfato de magnésio previne eclâmpsia e anti-hipertensivo controla a PA; plaquetas 98 mil e transaminases elevadas indicam HELLP parcial, com resolução da gestação após estabilização. Sem magnésio: eclâmpsia aos 15 min. Doses repetidas em sequência derrubam a PA e comprometem o feto.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Pesquisou sintomas de gravidade (cefaleia, visão, epigastralgia)", evidence: { kind: "historyAsked", items: ["h-queixa", "h-epigastrio", "h-dispneia"], minCount: 2 }, points: 8, severity: "importante", rationale: "Sintomas neurológicos e epigástricos definem gravidade.", sourceIds: ["BR-GESTACAO"] },
    { id: "s-hist-fetal", domain: "historia", description: "Avaliou movimentos fetais e perdas", evidence: { kind: "historyAsked", items: ["h-fetal"], minCount: 1 }, points: 4, severity: "menor", rationale: "Bem-estar fetal e diagnóstico diferencial." },
    { id: "s-exame", domain: "historia", description: "Avaliou reflexos, abdome e útero", evidence: { kind: "examDone", regions: ["neurologico", "abdome_epigastrio", "abdome_qid"], minCount: 2 }, points: 8, severity: "importante", rationale: "Reflexos guiam o magnésio; dor em hipocôndrio sugere HELLP; hipertonia sugere descolamento." },
    { id: "s-mg", domain: "priorizacao", description: "Sulfato de magnésio (ataque) em até 15 minutos", evidence: { kind: "drugGiven", anyOf: ["sulfato_magnesio"], minTotal: { value: 4000, unit: "mg" }, withinSeconds: 900 }, points: 14, severity: "critica", rationale: "Previne eclâmpsia na pré-eclâmpsia com sinais de gravidade.", sourceIds: ["BR-GESTACAO"] },
    { id: "s-anti", domain: "tratamento", description: "Anti-hipertensivo para PA ≥ 160/110", evidence: { kind: "drugGiven", anyOf: ["hidralazina", "nifedipino"], withinSeconds: 1800 }, points: 10, severity: "critica", rationale: "Reduz risco de AVC materno; hidralazina IV ou nifedipino VO.", alternatives: "Hidralazina IV ou nifedipino VO (não sublingual).", sourceIds: ["BR-GESTACAO"] },
    { id: "s-queda", domain: "tratamento", description: "Falha: queda excessiva da PA por doses repetidas", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-pa-excessiva" } }, points: 8, penalty: true, severity: "importante", rationale: "Alvo: PAS 140–155 e PAD 90–100 mmHg; queda brusca compromete a perfusão placentária." },
    { id: "s-fetal", domain: "priorizacao", description: "Avaliou vitalidade fetal (BCF/CTG)", evidence: { kind: "actionDone", anyOf: ["cardiotocografia", "sonar_bcf"], withinSeconds: 1200 }, points: 6, severity: "importante", rationale: "Feto também é paciente." },
    { id: "s-labs", domain: "exames", description: "Rastreio de HELLP e lesão de órgão-alvo", evidence: { kind: "testOrdered", anyOf: ["hemograma", "hepatograma", "funcao_renal"] }, points: 8, severity: "importante", rationale: "Plaquetas, transaminases, creatinina e LDH (não disponível no catálogo).", sourceIds: ["BR-GESTACAO"] },
    { id: "s-exames-excesso", domain: "exames", description: "Exames dirigidos", evidence: { kind: "testsNotExcessive", maxUnjustified: 1, justified: ["hemograma", "hepatograma", "funcao_renal", "urina_tipo1", "usg_obstetrica", "coagulograma", "eletrolitos"] }, points: 7, severity: "menor", rationale: "Avaliação materno-fetal direcionada." },
    { id: "s-reav", domain: "reavaliacao", description: "Monitorou reflexos, FR e diurese durante o magnésio", evidence: { kind: "reassessAfter", after: ["sulfato_magnesio"], reassess: ["neurologico", "diurese_horaria", "monitorizacao_continua"], withinSeconds: 1800 }, points: 10, severity: "importante", rationale: "Toxicidade: hiporreflexia, FR < 12 e oligúria." },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de pré-eclâmpsia grave/HELLP", evidence: { kind: "diagnosis", accepted: ["pre_eclampsia_grave", "hellp"] }, points: 4, severity: "importante", rationale: "PA ≥ 160/110, sintomas, plaquetopenia e transaminases elevadas." },
    { id: "s-destino", domain: "destino", description: "Internação em unidade com vigilância e planejamento do parto", evidence: { kind: "disposition", accepted: ["uti", "internacao_enfermaria", "centro_cirurgico"] }, points: 6, severity: "importante", rationale: "Estabilizar e resolver a gestação conforme gravidade e idade gestacional." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Quais sintomas desta gestante indicam gravidade?" },
      { level: 2, text: "O que previne a convulsão? O que reduz o risco de AVC materno?" },
      { level: 3, text: "Disfunção endotelial placentária: vasoespasmo, lesão hepática e consumo de plaquetas." },
      { level: 4, text: "Sugestão explícita: sulfato de magnésio (ataque + manutenção), hidralazina IV ou nifedipino VO, CTG, exames para HELLP e internação." }
    ],
    summary: "Primigesta de 24 anos, 33 semanas, PA 168/114, cefaleia, escotomas, epigastralgia, plaquetas 98 mil e transaminases elevadas.",
    pathophysiology: "Placentação anômala gera isquemia placentária e liberação de fatores antiangiogênicos, causando disfunção endotelial sistêmica: vasoespasmo e hipertensão, proteinúria, edema cerebral (cefaleia, escotomas, convulsões), lesão hepática (epigastralgia, transaminases) e microangiopatia com plaquetopenia (HELLP).",
    keyPoints: [
      "Sinais de gravidade: PA ≥ 160/110, sintomas neurológicos, epigastralgia, plaquetopenia, transaminases elevadas.",
      "Sulfato de magnésio previne e trata eclâmpsia; monitorar reflexos, FR e diurese.",
      "Gluconato de cálcio é o antídoto da intoxicação por magnésio.",
      "Tratar PA grave sem queda brusca (hidralazina IV, nifedipino VO).",
      "Resolução da gestação é o tratamento definitivo após estabilização."
    ],
    alternatives: ["Nifedipino VO ou hidralazina IV.", "Esquemas de Zuspan ou Pritchard para o magnésio."],
    oralRubric: [
      { id: "o1", concept: "Sinais de gravidade", synonyms: ["gravidade", "escotomas", "epigastralgia", "cefaleia"], weight: 2 },
      { id: "o2", concept: "Sulfato de magnésio", synonyms: ["sulfato de magnésio", "magnésio", "zuspan", "pritchard"], weight: 3 },
      { id: "o3", concept: "Anti-hipertensivo", synonyms: ["hidralazina", "nifedipino", "anti-hipertensivo"], weight: 2 },
      { id: "o4", concept: "HELLP", synonyms: ["hellp", "plaquetas", "transaminases"], weight: 1 },
      { id: "o5", concept: "Resolução da gestação", synonyms: ["parto", "resolução", "interrupção"], weight: 1 }
    ],
    simplifications: ["Concentração sérica de magnésio modelada em mg/dL por variável única; tempos são didáticos.", "Regimes de dose do magnésio devem ser conferidos no Manual de Gestação de Alto Risco (validação pendente)."]
  },
  references: ["BR-GESTACAO", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 8, allowSexSwap: false, allowWeightPercent: 10, allowVisualVariation: true, forbidden: ["sexo"] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Magnésio ataque + manutenção, hidralazina, CTG, exames, reflexos", commands: [act(5, "monitorizar"), ask(30, "h-epigastrio"), act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(260, "sulfato_magnesio", "amp50", 4000, "mg", "IV", "infusao_volume", { durationMinutes: 15 }), rx(300, "hidralazina", "amp20", 5, "mg", "IV"), act(320, "cardiotocografia"), test(400, "hemograma"), test(410, "hepatograma"), rx(1200, "sulfato_magnesio", "amp50", 1, "g", "IV", "infusao", { rate: { value: 1000, unit: "mg/h" } }), act(1500, "diurese_horaria"), act(1800, "decubito_lateral_esquerdo"), dx(2400, "hellp"), dest(2400, "uti")], runUntilSeconds: 3000, expect: [{ condition: { not: { ruleFired: "r-eclampsia" } }, description: "sem eclâmpsia" }, { condition: { ruleFired: "r-estabiliza" }, description: "estabilização" }, { condition: { path: "vars.sbp", op: "lte", value: 160 }, description: "PAS ≤ 160" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem tratamento", commands: [], runUntilSeconds: 1300, expect: [{ condition: { ruleFired: "r-eclampsia" }, description: "eclâmpsia" }, { condition: { ruleFired: "r-sem-anti" }, description: "PA persiste" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Hidralazina repetida a cada 5 minutos", commands: [act(10, "acesso_venoso"), act(110, "acesso_venoso"), rx(200, "sulfato_magnesio", "amp50", 4000, "mg", "IV", "infusao_volume", { durationMinutes: 15 }), rx(300, "hidralazina", "amp20", 10, "mg", "IV"), rx(600, "hidralazina", "amp20", 10, "mg", "IV")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-pa-excessiva" }, description: "queda excessiva" }] },
    { id: "t-atraso", kind: "delay", description: "Só anti-hipertensivo, sem magnésio", commands: [rx(200, "nifedipino", "cp10", 10, "mg", "VO")], runUntilSeconds: 1300, expect: [{ condition: { ruleFired: "r-eclampsia" }, description: "eclâmpsia sem magnésio" }, { condition: { ruleFired: "r-pa" }, description: "PA tratada" }] },
    { id: "t-alternativa", kind: "alternative", description: "Nifedipino VO em vez de hidralazina", commands: [act(10, "acesso_venoso"), act(110, "acesso_venoso"), rx(200, "sulfato_magnesio", "amp50", 4000, "mg", "IV", "infusao_volume", { durationMinutes: 15 }), rx(250, "nifedipino", "cp10", 10, "mg", "VO")], runUntilSeconds: 2000, expect: [{ condition: { ruleFired: "r-estabiliza" }, description: "estabilização" }] }
  ]
};
