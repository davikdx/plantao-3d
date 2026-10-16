import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const VOL1 = { any: [{ drugGiven: "sf09", minTotal: { value: 500, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 500, unit: "mL" as const } }] };
const VOL_INICIO = { any: [{ drugGiven: "sf09" }, { drugGiven: "ringer_lactato" }] };
const CALCIO = { drugGiven: "gluconato_calcio" };
const INSULINA = { drugGiven: "insulina_regular" };
const GLICOSE = { any: [{ drugGiven: "glicose50" }, { drugGiven: "sg5" }] };

export const C060: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C060",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Homem com diarreia há quatro dias, fraco e quase sem urinar",
  teachingTitle: "Lesão renal aguda pré-renal após perdas gastrointestinais com BRA, diurético e AINE — hipercalemia, volume e suspensão de nefrotóxicos",
  group: "Nefrologia",
  specialties: ["Clínica médica", "Nefrologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Estadiar a lesão renal aguda (KDIGO) e reconhecer a causa pré-renal com nefrotóxicos",
    "Tratar hipercalemia com alteração no ECG: cálcio, insulina com glicose, medidas de redistribuição",
    "Repor volume com cristaloide e reavaliar diurese",
    "Suspender BRA, diurético e AINE; não usar diurético para 'forçar' diurese",
    "Reconhecer indicações de diálise de urgência"
  ],
  keywords: ["diarreia", "fraqueza", "pouca urina", "vômito", "rim", "pressão"],
  patient: {
    name: "Antônio Carlos Medeiros",
    ageYears: 61,
    sex: "masculino",
    weightKg: 80,
    heightCm: 172,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 3, hairStyle: "curto", hairColor: "grisalho", build: "robusto", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Homem de 61 anos, hipertenso, com diarreia aquosa e vômitos há 4 dias. Hoje muito fraco, tonto ao levantar e 'urinou só um pouquinho desde ontem'.",
  communication: "normal",
  informants: [{ id: "esposa", name: "Esposa", role: "Acompanhante" }],
  history: [
    h("h-evolucao", "inicio", "Como começou? Quantas evacuações?", "Começou depois de um churrasco: umas 8 a 10 vezes por dia, aguado, sem sangue. Vomitei também.", { keywords: ["começou", "evacuações", "diarreia"] }),
    h("h-urina", "alimentacao_eliminacoes", "Quanto está urinando?", "Quase nada desde ontem à tarde, bem escura.", { keywords: ["urina", "urinando", "xixi"] }),
    hi("h-medicacoes", "medicacoes", "Que remédios usa? Tomou algum para dor?", [{ source: "paciente", text: "Losartana e hidroclorotiazida para pressão. Pro joelho tomo ibuprofeno quase todo dia. Continuei tomando tudo." }, { source: "esposa", text: "Ele não parou nenhum remédio, nem quando estava vomitando." }], ["remédio", "medicação", "dor", "anti-inflamatório"]),
    h("h-rim", "antecedentes", "Já teve problema nos rins? Fez exame recente?", "Fiz exame há 3 meses no posto; o médico disse que a creatinina estava 1,1.", { keywords: ["rim", "creatinina", "exame"] }),
    h("h-prostata", "fatores_associados", "Tem dificuldade para urinar, jato fraco?", "Não, urinava normal antes disso.", { keywords: ["próstata", "jato", "dificuldade"] })
  ],
  initial: {
    vars: { hr: 106, sbp: 98, dbp: 58, rr: 22, spo2: 97, temp: 36.8, gcs: 15, pain: 3, glucose: 98, perfusion: 0.55, effort: 0.35, na: 133, k: 6.4, cl: 104, creat: 4.4, urea: 168, ph: 7.26, pco2: 30, hco3: 15, be: -10, lactate: 2.0, hb: 15.6, urine: 8 },
    flags: { rhythm: "sinusal_t_apiculada", posture: "supino", painVisual: "leve", speech: "frases", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Mucosas secas, turgor reduzido, hipotensão postural relatada; sem edema.", { label: "Volemia", better: [{ when: { ruleFired: "r-volume" }, text: "Mucosas úmidas, perfusão melhor." }] }),
    ex("e-abdome", "abdome_qid", "palpacao", "Abdome flácido, ruídos aumentados, sem bexiga palpável.", { label: "Abdome/bexiga" }),
    ex("e-torax", "torax_anterior", "ausculta", "Murmúrio presente sem estertores.", { sound: "murmurio_normal" }),
    ex("e-neuro", "neurologico", "especial", "Lúcido, fraqueza proximal leve, sem asterixis.", {})
  ],
  testResults: [
    { testId: "ecg12", variants: [{ when: { ruleFired: "r-arritmia" }, text: "Bradicardia com QRS alargado e ondas T apiculadas — hipercalemia grave." }, { text: "Ritmo sinusal, ondas T apiculadas e simétricas em precordiais; PR e QRS normais." }] },
    { testId: "urina_tipo1", variants: [{ text: "Densidade 1,028, sem proteinúria, sedimento sem cilindros granulosos (laudo educativo)." }] },
    { testId: "usg_abdome", variants: [{ text: "Rins de tamanho normal, sem hidronefrose; bexiga vazia." }] }
  ],
  highlightedActions: ["monitorizar", "acesso_venoso", "diurese_horaria"],
  rules: [
    { id: "r-curso", description: "LRA pré-renal com hipercalemia e acidose progressivas", priority: 10, when: { always: true }, repeat: "once", effects: [trend("k", 7.3, 2000, "lra", 10), trend("creat", 5.0, 7200, "lra", 10), trend("ph", 7.20, 5400, "lra", 10), trend("hco3", 13, 5400, "lra", 10), trend("sbp", 90, 3600, "lra", 10), trend("urine", 4, 1800, "lra", 10)] },
    { id: "r-calcio", description: "Cálcio IV estabiliza a membrana (sem baixar o K⁺)", priority: 40, when: CALCIO, repeat: "once", effects: [obs("Gluconato de cálcio: protege o miocárdio por 30–60 min; não reduz o potássio — associar medidas de redistribuição e eliminação.")] },
    { id: "r-shift", description: "Insulina + glicose: potássio entra na célula (temporário)", priority: 50, when: { all: [INSULINA, GLICOSE] }, repeat: "once", effects: [trend("k", 5.4, 900, "shift", 50, 7200), flag("rhythm", "sinusal")] },
    { id: "r-hipoglicemia", description: "Insulina sem glicose: hipoglicemia", priority: 55, when: { all: [INSULINA, { not: GLICOSE }, { elapsedSince: "drug:insulina_regular", op: "gte", seconds: 600 }] }, repeat: "once", effects: [trend("glucose", 45, 600, "hipo", 55), flag("sweating", true), staff("enfermagem", "Ele ficou suado e confuso, glicemia baixa!"), outcome("complicacao")] },
    { id: "r-salbutamol", description: "β2-agonista: redistribuição adicional", priority: 45, when: { drugGiven: "salbutamol" }, repeat: "once", effects: [trend("k", 5.8, 1200, "beta", 45, 5400)] },
    { id: "r-volume", description: "Volume: perfusão renal restaurada, diurese volta, K⁺ e acidose melhoram", priority: 30, when: VOL1, repeat: "once", effects: [trend("sbp", 118, 1800, "vol", 30), trend("hr", 92, 1800, "vol", 30), trend("urine", 45, 3600, "vol", 30), trend("creat", 3.0, 21600, "vol", 30), trend("k", 5.0, 7200, "vol", 35), trend("ph", 7.31, 7200, "vol", 30), trend("hco3", 18, 7200, "vol", 30), outcome("melhora")] },
    { id: "r-furo", description: "Diurético de alça em LRA pré-renal hipovolêmica", priority: 45, when: { all: [{ drugGiven: "furosemida" }, { not: VOL1 }] }, repeat: "once", effects: [trend("sbp", 84, 900, "furo", 45, 3600), trend("creat", 5.3, 3600, "furo", 45), obs("Diurético não trata nem previne LRA; na hipovolemia piora a perfusão renal."), outcome("complicacao")] },
    { id: "r-arritmia", description: "K⁺ ≥ 7 sem proteção miocárdica: bradiarritmia com QRS largo", priority: 60, when: { all: [{ path: "vars.k", op: "gte", value: 7.0 }, { not: CALCIO }] }, repeat: "once", effects: [flag("rhythm", "sinusal_qrs_largo"), trend("hr", 42, 300, "arr", 60), trend("sbp", 78, 300, "arr", 60), staff("enfermagem", "O monitor mudou: frequência caindo e o QRS ficou largo!"), outcome("piora")] },
    { id: "r-pcr", description: "Hipercalemia não tratada: fibrilação ventricular", priority: 100, when: { all: [{ elapsedSince: "rule:r-arritmia", op: "gte", seconds: 900 }, { not: CALCIO }, { not: INSULINA }] }, repeat: "once", effects: [flag("rhythm", "fv"), flag("pulse", false), { type: "setValue", var: "sbp", value: 0 }, flag("consciousness", "irresponsivo"), staff("enfermagem", "Parou! FV no monitor!"), outcome("parada", true)] },
    { id: "r-dialise", description: "Sem volume em 1 h: oligoanúria mantida", priority: 20, when: { all: [{ time: "gte", seconds: 3600 }, { not: VOL_INICIO }] }, repeat: "once", effects: [staff("supervisor", "Nefrologia: se não houver resposta a volume, anúria + K⁺ > 6,5 + acidose indicam diálise de urgência."), outcome("piora")] }
  ],
  diagnosis: { primary: "lra", accepted: ["lra", "hipercalemia"], differentials: ["drc_agudizada", "gastroenterite", "desidratacao_grave", "retencao_urinaria", "insuficiencia_adrenal"] },
  acceptedDestinations: ["internacao_enfermaria", "uti"],
  outcomeNotes: "LRA KDIGO 3 pré-renal (creatinina 4,4 vs 1,1 basal) por gastroenterite com losartana, tiazídico e ibuprofeno mantidos, com hipercalemia (6,4) com ECG alterado e acidose. Gluconato de cálcio, insulina + glicose (± salbutamol), cristaloide com reavaliação e sonda para diurese horária, suspender BRA/diurético/AINE, sem furosemida; diálise se refratário; internação.",
  scoring: [
    { id: "s-meds", domain: "historia", description: "Identificou BRA, diurético e AINE", evidence: { kind: "historyAsked", items: ["h-medicacoes"], minCount: 1 }, points: 10, severity: "critica", rationale: "Suspender nefrotóxicos é parte do tratamento.", sourceIds: ["INT-AFP-LRA-2019"] },
    { id: "s-basal", domain: "historia", description: "Creatinina basal e sintomas obstrutivos", evidence: { kind: "historyAsked", items: ["h-rim", "h-prostata", "h-urina"], minCount: 2 }, points: 5, severity: "importante", rationale: "Diferenciar LRA de DRC; excluir pós-renal." },
    { id: "s-monitor", domain: "priorizacao", description: "Monitorização cardíaca", evidence: { kind: "actionDone", anyOf: ["monitorizar"], withinSeconds: 300 }, points: 5, severity: "critica", rationale: "Hipercalemia." },
    { id: "s-ecg", domain: "exames", description: "ECG de 12 derivações", evidence: { kind: "testOrdered", anyOf: ["ecg12"], withinSeconds: 600 }, points: 6, severity: "critica", rationale: "Alteração no ECG define urgência." },
    { id: "s-labs", domain: "exames", description: "Gasometria/eletrólitos e função renal", evidence: { kind: "testOrdered", anyOf: ["gaso_venosa", "eletrolitos", "funcao_renal"], withinSeconds: 600 }, points: 6, severity: "importante", rationale: "Potássio, acidose, estágio da LRA." },
    { id: "s-calcio", domain: "tratamento", description: "Gluconato de cálcio (ECG alterado)", evidence: { kind: "drugGiven", anyOf: ["gluconato_calcio"], withinSeconds: 1200 }, points: 10, severity: "critica", rationale: "Estabilização da membrana.", sourceIds: ["INT-UKKA-HIPERK"] },
    { id: "s-shift", domain: "tratamento", description: "Insulina com glicose", evidence: { kind: "drugGiven", anyOf: ["insulina_regular"], withinSeconds: 1500 }, points: 8, severity: "critica", rationale: "Redistribuição do potássio.", sourceIds: ["INT-UKKA-HIPERK"] },
    { id: "s-hipo", domain: "tratamento", description: "Falha: insulina sem glicose", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-hipoglicemia" } }, points: 6, penalty: true, severity: "importante", rationale: "Hipoglicemia iatrogênica." },
    { id: "s-volume", domain: "tratamento", description: "Cristaloide isotônico", evidence: { kind: "drugGiven", anyOf: ["sf09", "ringer_lactato"], withinSeconds: 1200 }, points: 12, severity: "critica", rationale: "LRA pré-renal hipovolêmica: volume com reavaliação.", sourceIds: ["INT-AFP-LRA-2019"] },
    { id: "s-furo", domain: "tratamento", description: "Falha: diurético para 'forçar' diurese", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-furo" } }, points: 8, penalty: true, severity: "importante", rationale: "Diurético não trata LRA.", sourceIds: ["INT-AFP-LRA-2019"] },
    { id: "s-sonda", domain: "reavaliacao", description: "Diurese horária", evidence: { kind: "actionDone", anyOf: ["diurese_horaria"] }, points: 6, severity: "importante", rationale: "Resposta ao volume; indicação de diálise." },
    { id: "s-reav", domain: "reavaliacao", description: "Potássio de controle após o tratamento", evidence: { kind: "reassessAfter", after: ["insulina_regular", "sf09", "ringer_lactato"], reassess: ["gaso_venosa", "eletrolitos", "glicemia_capilar"], withinSeconds: 3600 }, points: 8, severity: "importante", rationale: "O efeito da insulina é transitório." },
    { id: "s-dx", domain: "destino", description: "Lesão renal aguda", evidence: { kind: "diagnosis", accepted: ["lra"] }, points: 4, severity: "importante", rationale: "Creatinina 4× a basal." },
    { id: "s-destino", domain: "destino", description: "Internação", evidence: { kind: "disposition", accepted: ["internacao_enfermaria", "uti"] }, points: 6, severity: "importante", rationale: "Monitorização de K⁺, diurese e função renal." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Quais remédios ele manteve enquanto desidratava?" },
      { level: 2, text: "Ondas T apiculadas: o que vem antes de qualquer outra coisa?" },
      { level: 3, text: "Cálcio protege, insulina desloca, volume e rim eliminam." },
      { level: 4, text: "Sugestão explícita: monitor, ECG, gasometria, gluconato de cálcio, insulina regular 10 UI + glicose 50% 25 g, SF/RL 500 mL com reavaliação, sonda, suspender losartana/HCTZ/ibuprofeno, internar." }
    ],
    summary: "Homem de 61 anos com LRA pré-renal estágio 3 por gastroenterite, em uso de losartana, hidroclorotiazida e ibuprofeno, com hipercalemia (6,4 mmol/L) e alterações no ECG.",
    pathophysiology: "A hipovolemia reduz o fluxo renal; o AINE bloqueia a vasodilatação aferente por prostaglandinas e o BRA impede a vasoconstrição eferente mediada pela angiotensina II — a filtração despenca. O diurético agrava a depleção. Com a queda da filtração, potássio e ácidos se acumulam; o K⁺ alto reduz o potencial de repouso miocárdico (T apiculada, QRS largo, arritmias).",
    keyPoints: [
      "KDIGO: estágio 3 = creatinina ≥ 3× basal ou ≥ 4 mg/dL, ou diurese < 0,3 mL/kg/h por 24 h.",
      "BRA/IECA + diurético + AINE em desidratação: suspender todos.",
      "Hipercalemia com ECG alterado: cálcio IV → insulina + glicose → eliminação.",
      "Cristaloide isotônico (balanceado preferível) com reavaliação; diurético não trata LRA.",
      "Diálise de urgência: K⁺ refratário, acidose grave, congestão refratária, uremia, anúria."
    ],
    alternatives: ["Salbutamol inalatório como adjuvante na hipercalemia.", "Bicarbonato se acidose grave (não no catálogo).", "Ultrassom para excluir obstrução."],
    oralRubric: [
      { id: "o1", concept: "Nefrotóxicos", synonyms: ["losartana", "aine", "ibuprofeno", "diurético", "suspender"], weight: 3 },
      { id: "o2", concept: "Tratamento da hipercalemia", synonyms: ["cálcio", "insulina", "glicose"], weight: 3 },
      { id: "o3", concept: "Volume", synonyms: ["soro", "volume", "cristaloide"], weight: 2 },
      { id: "o4", concept: "Indicações de diálise", synonyms: ["diálise", "aeiou", "refratária"], weight: 1 }
    ],
    simplifications: ["A suspensão dos medicamentos de uso contínuo é avaliada pela anamnese.", "Efeito da insulina sobre o K⁺ termina após ~2 h no simulador.", "Diálise não é simulada."]
  },
  references: ["INT-AFP-LRA-2019", "INT-UKKA-HIPERK", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 15, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Monitor, ECG, labs, cálcio, insulina + glicose, RL, sonda, controle de K⁺, internação", commands: [act(5, "monitorizar"), ask(15, "h-evolucao"), ask(25, "h-medicacoes"), ask(35, "h-rim"), ask(45, "h-urina"), act(55, "acesso_venoso"), test(160, "ecg12"), test(170, "gaso_venosa"), test(180, "funcao_renal"), rx(300, "gluconato_calcio", "amp10", 1000, "mg", "IV"), rx(400, "glicose50", "amp10", 25, "g", "IV"), rx(410, "insulina_regular", "fr100", 10, "UI", "IV"), rx(450, "ringer_lactato", "bolsa500", 500, "mL", "IV", "infusao_volume", { durationMinutes: 30 }), act(500, "diurese_horaria"), act(2400, "glicemia_capilar"), test(2500, "gaso_venosa"), rx(2600, "ringer_lactato", "bolsa500", 500, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), dx(3000, "lra"), dest(3100, "internacao_enfermaria")], runUntilSeconds: 7200, expect: [{ condition: { ruleFired: "r-volume" }, description: "diurese retorna" }, { condition: { not: { ruleFired: "r-arritmia" } }, description: "sem arritmia" }, { condition: { not: { ruleFired: "r-hipoglicemia" } }, description: "sem hipoglicemia" }, { condition: { path: "vars.k", op: "lt", value: 6.0 }, description: "K⁺ < 6" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 4500, expect: [{ condition: { ruleFired: "r-arritmia" }, description: "arritmia" }, { condition: { ruleFired: "r-pcr" }, description: "FV" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Furosemida para a oligúria e insulina sem glicose", commands: [act(30, "acesso_venoso"), rx(150, "furosemida", "amp20", 40, "mg", "IV"), rx(300, "insulina_regular", "fr100", 10, "UI", "IV")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-furo" }, description: "piora pré-renal" }, { condition: { ruleFired: "r-hipoglicemia" }, description: "hipoglicemia" }] },
    { id: "t-atraso", kind: "delay", description: "Espera o laboratório; tratamento só após arritmia", commands: [act(30, "acesso_venoso"), test(100, "eletrolitos"), rx(2600, "gluconato_calcio", "amp10", 1000, "mg", "IV"), rx(2650, "glicose50", "amp10", 25, "g", "IV"), rx(2660, "insulina_regular", "fr100", 10, "UI", "IV"), rx(2700, "sf09", "bolsa500", 500, "mL", "IV", "infusao_volume", { durationMinutes: 30 })], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-arritmia" }, description: "arritmia no atraso" }, { condition: { not: { ruleFired: "r-pcr" } }, description: "PCR evitada" }, { condition: { ruleFired: "r-volume" }, description: "resposta ao volume" }] },
    { id: "t-alternativa", kind: "alternative", description: "SF 0,9%, salbutamol e insulina + glicose", commands: [act(5, "monitorizar"), act(20, "acesso_venoso"), test(130, "ecg12"), rx(200, "gluconato_calcio", "amp10", 2000, "mg", "IV"), rx(260, "glicose50", "amp10", 25, "g", "IV"), rx(270, "insulina_regular", "fr100", 10, "UI", "IV"), rx(300, "salbutamol", "spray100", 400, "mcg", "inalatoria"), rx(330, "sf09", "bolsa500", 500, "mL", "IV", "infusao_volume", { durationMinutes: 30 }), dest(2000, "uti")], runUntilSeconds: 5000, expect: [{ condition: { ruleFired: "r-shift" }, description: "redistribuição" }, { condition: { ruleFired: "r-volume" }, description: "resposta ao volume" }] }
  ]
};
