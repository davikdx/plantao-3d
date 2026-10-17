import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const MG_ATAQUE = { drugGiven: "sulfato_magnesio", minTotal: { value: 4000, unit: "mg" as const } };
const MG = { drugGiven: "sulfato_magnesio" };
const ANTI_HAS = { any: [{ drugGiven: "hidralazina" }, { drugGiven: "nifedipino" }] };
const BZD = { any: [{ drugGiven: "diazepam" }, { drugGiven: "midazolam" }] };
const PROTECAO = { any: [{ actionCompleted: "posicao_seguranca" }, { actionCompleted: "decubito_lateral_esquerdo" }] };

export const C075: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C075",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Gestante de 36 semanas que teve convulsão em casa",
  teachingTitle: "Eclâmpsia — proteção, sulfato de magnésio, controle da hipertensão grave, vigilância fetal e resolução da gestação após estabilização",
  group: "Obstetrícia e Ginecologia",
  specialties: ["Obstetrícia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 4,
  level: "internato",
  objectives: [
    "Proteger a paciente durante/após a crise (decúbito lateral, via aérea, O₂, acesso)",
    "Administrar sulfato de magnésio (ataque e manutenção) como anticonvulsivante de escolha",
    "Tratar hipertensão grave (≥ 160/110) com hidralazina ou nifedipino, sem queda abrupta",
    "Monitorar toxicidade do magnésio e o bem-estar fetal; rastrear HELLP",
    "Indicar a resolução da gestação após estabilização materna"
  ],
  keywords: ["gestante", "convulsão", "pressão alta", "dor de cabeça", "grávida", "36 semanas"],
  patient: {
    name: "Ketlyn Souza",
    ageYears: 19,
    sex: "feminino",
    weightKg: 72,
    heightCm: 160,
    pregnancyWeeks: 36,
    visual: { ageGroup: "adulto", sex: "feminino", skinTone: 4, hairStyle: "crespo_volume", hairColor: "preto", build: "medio", pregnancyTrimester: 3 }
  },
  briefing: "Pronto-socorro de hospital regional com maternidade. Primigesta de 19 anos, 36 semanas, trazida pelo SAMU após crise convulsiva generalizada em casa há 20 minutos. Pré-natal com 3 consultas. Chega sonolenta, confusa, com a língua mordida.",
  communication: "limitada",
  informants: [{ id: "mae", name: "Mãe", role: "Acompanhante" }, { id: "samu", name: "Técnico do SAMU", role: "Equipe do SAMU 192" }],
  history: [
    hi("h-crise", "inicio", "Como foi a crise? Quanto durou?", [{ source: "mae", text: "Ficou dura, depois se debatendo, babando, uns 2 minutos. Antes reclamou de dor de cabeça forte e de 'ver pontinhos brilhando'." }], ["crise", "convulsão", "durou"]),
    hi("h-sintomas", "sinais_alarme", "Tinha dor de cabeça, alteração visual, dor no estômago?", [{ source: "mae", text: "Dor de cabeça há 2 dias, hoje pior; reclamou de dor na boca do estômago." }], ["cabeça", "visão", "estômago"]),
    hi("h-prenatal", "gestacao", "Como foi o pré-natal? Pressão alta antes?", [{ source: "mae", text: "Fez só 3 consultas. Na última, há um mês, a pressão estava um pouco alta e mandaram voltar, mas ela não voltou." }], ["pré-natal", "pressão", "consulta"]),
    hi("h-epilepsia", "antecedentes", "Ela tem epilepsia, usa droga ou bebe?", [{ source: "mae", text: "Nunca teve convulsão. Não usa nada." }], ["epilepsia", "droga"]),
    hi("h-movimentos", "gestacao", "O bebê está mexendo? Perdeu líquido ou sangue?", [{ source: "mae", text: "Ela disse hoje que mexeu menos. Sem sangue." }], ["mexendo", "bebê", "líquido", "sangue"])
  ],
  initial: {
    vars: { hr: 108, sbp: 172, dbp: 116, rr: 20, spo2: 94, temp: 36.9, gcs: 12, pain: 5, glucose: 96, perfusion: 0.9, effort: 0.3, fetalHr: 112, hb: 11.8, plt: 104000, ast: 140, alt: 118, creat: 1.0, mg: 1.8, urine: 25 },
    flags: { rhythm: "taquicardia_sinusal", posture: "supino", painVisual: "moderada", speech: "palavras", consciousness: "voz", pregnant: true, edema: true },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-neuro", "neurologico", "especial", "Pós-ictal, Glasgow 12, sem déficit focal; reflexos patelares vivos; mordedura de língua.", { label: "Neurológico", better: [{ when: { ruleFired: "r-estabiliza" }, text: "Glasgow 15, orientada; reflexos presentes." }] }),
    ex("e-obst", "abdome_qid", "palpacao", "Útero compatível com 36 semanas, tônus normal, sem contrações; sem sangramento vaginal.", { label: "Abdome obstétrico" }),
    ex("e-edema", "membro_inferior_d", "inspecao", "Edema 2+/4+ em membros inferiores e mãos.", {}),
    ex("e-torax", "torax_anterior", "ausculta", "Murmúrio presente, sem estertores.", { sound: "murmurio_normal" })
  ],
  testResults: [
    { testId: "hemograma", variants: [{ text: "Hb 11,8 g/dL; plaquetas 104.000/mm³." }] },
    { testId: "hepatograma", variants: [{ text: "AST 140 U/L, ALT 118 U/L, bilirrubina 0,9 mg/dL (LDH não disponível no catálogo)." }] },
    { testId: "funcao_renal", variants: [{ text: "Creatinina 1,0 mg/dL; ureia 30 mg/dL." }] },
    { testId: "usg_obstetrica", variants: [{ text: "Feto único, cefálico, BCF presente, líquido normal, placenta fúndica sem sinais de descolamento." }] }
  ],
  highlightedActions: ["posicao_seguranca", "o2_cateter", "acesso_venoso", "monitorizar", "cardiotocografia", "diurese_horaria"],
  rules: [
    { id: "r-recorrencia", description: "Sem sulfato de magnésio: nova crise", priority: 30, when: { all: [{ time: "gte", seconds: 600 }, { not: MG }] }, repeat: "once", effects: [flag("seizure", true), trend("spo2", 86, 60, "crise", 30, 300), trend("fetalHr", 95, 120, "crise", 30, 900), trend("gcs", 8, 120, "crise", 30, 1200), staff("enfermagem", "Está convulsionando de novo!"), outcome("piora")] },
    { id: "r-fim-crise", description: "Crise cede", priority: 31, when: { elapsedSince: "rule:r-recorrencia", op: "gte", seconds: 120 }, repeat: "once", effects: [flag("seizure", false)] },
    { id: "r-queda", description: "Crise sem proteção: queda/aspiração", priority: 32, when: { all: [{ ruleFired: "r-recorrencia" }, { not: PROTECAO }] }, repeat: "once", effects: [trend("spo2", 85, 300, "asp", 32, 1800), obs("Crise sem decúbito lateral/proteção: risco de aspiração e trauma."), outcome("complicacao")] },
    { id: "r-mg", description: "Sulfato de magnésio (ataque)", priority: 60, when: MG_ATAQUE, repeat: "once", effects: [trend("mg", 5.5, 900, "mg", 60), flag("seizure", false), obs("Sulfato de magnésio em curso: monitorar reflexo patelar, FR ≥ 16 e diurese ≥ 25 mL/h.")] },
    { id: "r-mg-manut", description: "Manutenção do magnésio", priority: 61, when: { treatmentActive: "sulfato_magnesio" }, repeat: "while", effects: [trend("mg", 6, 1800, "mg-manut", 61)], onEnd: [{ type: "clearTrend", var: "mg", slot: "mg-manut" }] },
    { id: "r-intox-mg", description: "Magnésio elevado: hiporreflexia e depressão respiratória", priority: 90, when: { path: "vars.mg", op: "gte", value: 8 }, repeat: "once", effects: [trend("rr", 9, 300, "intox", 90), staff("enfermagem", "Ela está muito sonolenta, respirando devagar, sem reflexo no joelho."), outcome("complicacao")] },
    { id: "r-calcio", description: "Gluconato de cálcio reverte toxicidade", priority: 95, when: { all: [{ ruleFired: "r-intox-mg" }, { drugGiven: "gluconato_calcio" }] }, repeat: "once", effects: [trend("rr", 16, 120, "antidoto", 95)] },
    { id: "r-bzd", description: "Benzodiazepínico como anticonvulsivante isolado", priority: 25, when: { all: [BZD, { not: MG }] }, repeat: "once", effects: [trend("rr", 12, 300, "bzd", 25, 1800), trend("gcs", 9, 300, "bzd", 25, 1800), obs("Diazepam controla a crise momentaneamente, mas é inferior ao magnésio para prevenir recorrência e deprime a consciência/respiração."), outcome("complicacao")] },
    { id: "r-pa", description: "Anti-hipertensivo: redução gradual", priority: 50, when: ANTI_HAS, repeat: "once", effects: [trend("sbp", 150, 900, "anti", 50), trend("dbp", 98, 900, "anti", 50)] },
    { id: "r-pa-excessiva", description: "Queda abrupta da PA: sofrimento fetal", priority: 80, when: { any: [{ drugGiven: "hidralazina", minTotal: { value: 30, unit: "mg" as const } }, { drugGiven: "nifedipino", minTotal: { value: 40, unit: "mg" as const } }] }, repeat: "once", effects: [trend("sbp", 104, 300, "excesso", 80, 1800), trend("fetalHr", 98, 300, "excesso", 80, 1800), obs("Queda > 25% reduz perfusão placentária."), outcome("complicacao")] },
    { id: "r-avc", description: "Hipertensão grave sem tratamento: risco de AVC", priority: 40, when: { all: [{ time: "gte", seconds: 2400 }, { not: ANTI_HAS }] }, repeat: "once", effects: [trend("sbp", 186, 600, "avc", 40), trend("gcs", 9, 900, "avc", 40), staff("enfermagem", "PA 186 por 122 e ela está mais rebaixada."), outcome("piora")] },
    { id: "r-lateral", description: "Decúbito lateral melhora o fluxo uteroplacentário", priority: 40, when: PROTECAO, repeat: "once", effects: [trend("fetalHr", 138, 600, "dle", 40), trend("spo2", 97, 300, "dle", 40)] },
    { id: "r-estabiliza", description: "Magnésio + PA controlada: estabilização para o parto", priority: 70, when: { all: [{ ruleFired: "r-mg" }, { ruleFired: "r-pa" }, { not: { ruleFired: "r-pa-excessiva" } }] }, repeat: "once", effects: [trend("gcs", 15, 1800, "estab", 70), trend("fetalHr", 140, 900, "estab", 70), flag("consciousness", "alerta"), { type: "changeCommunication", state: "normal" }, staff("supervisor", "Obstetra: paciente estabilizada com magnésio e PA controlada — resolução da gestação (indução ou cesárea conforme condições obstétricas); manter MgSO₄ por 24 h."), outcome("estabilizacao_parcial")] }
  ],
  diagnosis: { primary: "eclampsia", accepted: ["eclampsia"], differentials: ["estado_mal_epileptico", "hemorragia_subaracnoidea", "avc_hemorragico", "hipoglicemia", "hellp", "intox_estimulante"] },
  acceptedDestinations: ["centro_cirurgico", "uti"],
  outcomeNotes: "Eclâmpsia em primigesta de 36 semanas com pré-natal incompleto, hipertensão grave e alterações laboratoriais sugestivas de HELLP parcial. Decúbito lateral, via aérea, O₂, acesso, glicemia, sulfato de magnésio (Zuspan: 4 g IV + 1 g/h), hidralazina 5 mg IV ou nifedipino 10 mg VO, vigilância de toxicidade, cardiotocografia, exames, e resolução da gestação após estabilização.",
  scoring: [
    { id: "s-protecao", domain: "priorizacao", description: "Decúbito lateral/proteção, O₂ e acesso", evidence: { kind: "actionDone", anyOf: ["posicao_seguranca", "decubito_lateral_esquerdo"], withinSeconds: 180 }, points: 8, severity: "critica", rationale: "Evita aspiração, trauma e compressão aortocava.", sourceIds: ["BR-FEBRASGO-PE-2019"] },
    { id: "s-glicemia", domain: "priorizacao", description: "Glicemia capilar", evidence: { kind: "actionDone", anyOf: ["glicemia_capilar"], withinSeconds: 300 }, points: 3, severity: "importante", rationale: "Diferencial da convulsão." },
    { id: "s-mg", domain: "tratamento", description: "MgSO₄ ataque em até 10 min", evidence: { kind: "drugGiven", anyOf: ["sulfato_magnesio"], minTotal: { value: 4000, unit: "mg" }, withinSeconds: 600 }, points: 18, severity: "critica", rationale: "Anticonvulsivante de escolha; previne recorrência.", sourceIds: ["BR-FEBRASGO-PE-2019"] },
    { id: "s-mg-manut", domain: "tratamento", description: "Manutenção do magnésio", evidence: { kind: "drugGiven", anyOf: ["sulfato_magnesio"], minTotal: { value: 5000, unit: "mg" } }, points: 4, severity: "importante", rationale: "Manter 24 h após o parto/última crise.", sourceIds: ["BR-FEBRASGO-PE-2019"] },
    { id: "s-anti", domain: "tratamento", description: "Anti-hipertensivo para PA ≥ 160/110", evidence: { kind: "drugGiven", anyOf: ["hidralazina", "nifedipino"], withinSeconds: 1800 }, points: 10, severity: "critica", rationale: "Prevenir AVC; reduzir 15–25%.", sourceIds: ["BR-FEBRASGO-PE-2019"] },
    { id: "s-excesso", domain: "tratamento", description: "Falha: queda abrupta da PA", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-pa-excessiva" } }, points: 8, penalty: true, severity: "importante", rationale: "Sofrimento fetal." },
    { id: "s-bzd", domain: "tratamento", description: "Falha: benzodiazepínico no lugar do magnésio", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-bzd" } }, points: 8, penalty: true, severity: "importante", rationale: "Magnésio é superior.", sourceIds: ["BR-FEBRASGO-PE-2019"] },
    { id: "s-fetal", domain: "exames", description: "Vigilância fetal (BCF/cardiotocografia)", evidence: { kind: "actionDone", anyOf: ["cardiotocografia", "sonar_bcf"], withinSeconds: 900 }, points: 6, severity: "importante", rationale: "Bradicardia fetal pós-crise." },
    { id: "s-labs", domain: "exames", description: "Rastreio de HELLP e função renal", evidence: { kind: "testOrdered", anyOf: ["hemograma", "hepatograma", "funcao_renal"], withinSeconds: 1800 }, points: 6, severity: "importante", rationale: "Plaquetopenia e transaminases." },
    { id: "s-tox", domain: "reavaliacao", description: "Monitorou toxicidade (diurese, reflexos, FR)", evidence: { kind: "reassessAfter", after: ["sulfato_magnesio"], reassess: ["diurese_horaria", "neurologico", "monitorizar"], withinSeconds: 1800 }, points: 8, severity: "importante", rationale: "Reflexo patelar, FR ≥ 16, diurese ≥ 25 mL/h.", sourceIds: ["BR-FEBRASGO-PE-2019"] },
    { id: "s-hist", domain: "historia", description: "Pródromos, pré-natal e diferenciais", evidence: { kind: "historyAsked", items: ["h-sintomas", "h-prenatal", "h-epilepsia"], minCount: 2 }, points: 5, severity: "importante", rationale: "Cefaleia, escotomas, epigastralgia; excluir epilepsia." },
    { id: "s-dx", domain: "destino", description: "Eclâmpsia", evidence: { kind: "diagnosis", accepted: ["eclampsia"] }, points: 5, severity: "importante", rationale: "Convulsão + hipertensão na gestação." },
    { id: "s-destino", domain: "destino", description: "Resolução da gestação após estabilização (centro obstétrico/UTI)", evidence: { kind: "disposition", accepted: ["centro_cirurgico", "uti"] }, points: 6, severity: "importante", rationale: "Eclâmpsia indica resolução após estabilizar." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Primeira convulsão em gestante de 36 semanas com PA 172/116: qual o diagnóstico até prova em contrário?" },
      { level: 2, text: "Qual anticonvulsivante previne a recorrência melhor que o diazepam?" },
      { level: 3, text: "Baixar a pressão sim, mas quanto?" },
      { level: 4, text: "Sugestão explícita: decúbito lateral, O₂, acesso, glicemia, MgSO₄ 4 g IV + 1 g/h, hidralazina 5 mg IV, sonda/diurese, cardiotocografia, exames, obstetra, parto após estabilização." }
    ],
    summary: "Primigesta de 19 anos, 36 semanas, com eclâmpsia, hipertensão grave e sinais de HELLP parcial, pré-natal incompleto.",
    pathophysiology: "Na pré-eclâmpsia, a placentação anormal libera fatores antiangiogênicos que causam disfunção endotelial sistêmica. No cérebro, a perda da autorregulação e o edema vasogênico (PRES) levam a cefaleia, escotomas e convulsões. O magnésio estabiliza membranas neuronais e é vasodilatador cerebral.",
    keyPoints: [
      "Eclâmpsia: proteger, decúbito lateral, O₂, acesso.",
      "MgSO₄: ataque 4 g IV + manutenção (Zuspan 1 g/h ou Pritchard IM); recorrência: 2 g IV.",
      "Toxicidade: reflexo patelar, FR ≥ 16, diurese ≥ 25 mL/h; antídoto: gluconato de cálcio 1 g IV.",
      "HAS grave ≥ 160/110: hidralazina 5 mg IV ou nifedipino 10 mg VO; reduzir 15–25%.",
      "Resolução da gestação após estabilização materna; manter MgSO₄ 24 h."
    ],
    alternatives: ["Esquema de Pritchard (IM) em unidades sem bomba de infusão ou para transporte.", "Nifedipino oral em vez de hidralazina quando a paciente estiver alerta e deglutindo com segurança."],
    oralRubric: [
      { id: "o1", concept: "Sulfato de magnésio", synonyms: ["magnésio", "mgso4", "zuspan", "pritchard"], weight: 3 },
      { id: "o2", concept: "Anti-hipertensivo", synonyms: ["hidralazina", "nifedipino", "160/110"], weight: 2 },
      { id: "o3", concept: "Toxicidade do magnésio", synonyms: ["reflexo", "gluconato de cálcio", "diurese"], weight: 2 },
      { id: "o4", concept: "Resolução da gestação", synonyms: ["parto", "cesárea", "resolução", "estabilização"], weight: 2 }
    ],
    simplifications: ["LDH não está no catálogo.", "O parto em si não é simulado."]
  },
  references: ["BR-FEBRASGO-PE-2019", "BR-GESTACAO", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 15, allowSexSwap: false, allowWeightPercent: 15, allowVisualVariation: true, forbidden: ["sexo masculino"] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Proteção, O₂, glicemia, MgSO₄ ataque + manutenção, hidralazina, sonda, CTG, exames, centro cirúrgico", commands: [act(5, "posicao_seguranca"), act(20, "o2_cateter", { fluxo: 5 }), act(30, "glicemia_capilar"), act(40, "monitorizar"), act(50, "acesso_venoso"), ask(60, "h-crise"), ask(70, "h-sintomas"), ask(80, "h-epilepsia"), rx(160, "sulfato_magnesio", "amp50", 4000, "mg", "IV", "infusao_volume", { durationMinutes: 15 }), rx(300, "hidralazina", "amp20", 5, "mg", "IV"), act(400, "diurese_horaria"), act(500, "cardiotocografia"), test(600, "hemograma"), test(610, "hepatograma"), test(620, "funcao_renal"), rx(1200, "sulfato_magnesio", "amp50", 1, "g", "IV", "infusao", { rate: { value: 1000, unit: "mg/h" } }), { atSeconds: 1500, type: "examine", payload: { region: "neurologico", maneuver: "especial" } }, dx(2200, "eclampsia"), dest(2400, "centro_cirurgico")], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-estabiliza" }, description: "estabilizada" }, { condition: { not: { ruleFired: "r-recorrencia" } }, description: "sem nova crise" }, { condition: { not: { ruleFired: "r-pa-excessiva" } }, description: "queda gradual da PA" }, { condition: { not: { ruleFired: "r-intox-mg" } }, description: "sem intoxicação" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-recorrencia" }, description: "nova crise" }, { condition: { ruleFired: "r-queda" }, description: "sem proteção" }, { condition: { ruleFired: "r-avc" }, description: "risco de AVC" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Diazepam e hidralazina em doses altas seguidas", commands: [act(30, "acesso_venoso"), rx(150, "diazepam", "amp10", 10, "mg", "IV"), rx(300, "hidralazina", "amp20", 10, "mg", "IV"), rx(400, "hidralazina", "amp20", 10, "mg", "IV"), rx(500, "hidralazina", "amp20", 10, "mg", "IV")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-bzd" }, description: "benzodiazepínico isolado" }, { condition: { ruleFired: "r-pa-excessiva" }, description: "queda abrupta" }] },
    { id: "t-atraso", kind: "delay", description: "Magnésio só após nova crise", commands: [act(30, "acesso_venoso"), act(700, "decubito_lateral_esquerdo"), rx(800, "sulfato_magnesio", "amp50", 4000, "mg", "IV", "infusao_volume", { durationMinutes: 15 }), rx(900, "hidralazina", "amp20", 5, "mg", "IV")], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-recorrencia" }, description: "recorrência no atraso" }, { condition: { ruleFired: "r-estabiliza" }, description: "estabilização tardia" }] },
    { id: "t-alternativa", kind: "alternative", description: "Decúbito lateral esquerdo, MgSO₄, hidralazina, sonar e UTI", commands: [act(5, "decubito_lateral_esquerdo"), act(30, "acesso_venoso"), rx(150, "sulfato_magnesio", "amp50", 4000, "mg", "IV", "infusao_volume", { durationMinutes: 15 }), rx(1300, "hidralazina", "amp20", 5, "mg", "IV"), act(1400, "sonar_bcf"), dest(2400, "uti")], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-estabiliza" }, description: "estabilizada" }, { condition: { not: { ruleFired: "r-recorrencia" } }, description: "sem nova crise" }] }
  ]
};
