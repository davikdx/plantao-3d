import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const CALCIO = { drugGiven: "gluconato_calcio", minTotal: { value: 1000, unit: "mg" as const } };
const INS = { drugGiven: "insulina_regular", route: "IV" };
const GLIC = { drugGiven: "glicose50", minTotal: { value: 20, unit: "g" as const } };
const SAL = { drugGiven: "salbutamol", route: "nebulizacao", minTotal: { value: 10, unit: "mg" as const } };

export const C057: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C057",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Fraqueza nas pernas em paciente renal crônico",
  teachingTitle: "Hipercalemia grave com alteração eletrocardiográfica em doença renal crônica",
  group: "Nefrologia, eletrólitos e equilíbrio ácido-base",
  specialties: ["Nefrologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "upa-porte-ii",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Suspeitar de hipercalemia pelo contexto e obter ECG precocemente",
    "Estabilizar a membrana miocárdica com cálcio",
    "Deslocar potássio para o intracelular com insulina + glicose (e beta-2)",
    "Evitar hipoglicemia e fontes de potássio",
    "Organizar remoção definitiva (diálise) via regulação"
  ],
  keywords: ["fraqueza", "renal", "potássio", "diálise", "bradicardia"],
  patient: {
    name: "Joaquim Ribeiro",
    ageYears: 66,
    sex: "masculino",
    weightKg: 72,
    heightCm: 170,
    visual: { ageGroup: "idoso", sex: "masculino", skinTone: 1, hairStyle: "curto", hairColor: "branco", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "UPA 24h. Homem de 66 anos com doença renal crônica, acompanhado do neto, refere fraqueza nas pernas e mal-estar desde ontem. A triagem notou pulso lento.",
  communication: "normal",
  informants: [{ id: "neto", name: "Lucas", role: "Neto" }],
  history: [
    h("h-queixa", "queixa", "O que o senhor está sentindo?", "Uma fraqueza nas pernas, doutor, e um mal-estar, uma moleza. Parece que o coração tá batendo devagar.", { keywords: ["sentindo"] }),
    h("h-inicio", "inicio", "Desde quando?", "Desde ontem à tarde, foi piorando."),
    h("h-rim", "antecedentes", "Que doenças o senhor tem?", "Tenho problema nos rins, pressão alta e diabetes. O médico do rim falou que logo vou precisar de hemodiálise.", { keywords: ["doença", "rim"] }),
    h("h-medicacoes", "medicacoes", "Quais remédios o senhor toma?", "Enalapril, espironolactona que o cardiologista passou há um mês, insulina NPH e um remédio pra gota.", { keywords: ["remédio", "toma"] }),
    h("h-dieta", "alimentacao_eliminacoes", "Comeu algo diferente? Tem urinado?", "Ganhei um saco de laranja e banana do vizinho, comi bastante essa semana. Urino pouco, sempre urinei pouco.", { keywords: ["comeu", "fruta", "urina"] }),
    h("h-sintomas", "fatores_associados", "Teve dor no peito, falta de ar ou desmaio?", "Dor no peito não. Falta de ar um pouco. Desmaiar não."),
    h("h-alergias", "alergias", "Tem alergia a algum remédio?", "Não."),
    hi("h-dialise", "outros", "Ele faz diálise ou tem fístula?", [{ source: "neto", text: "Ainda não faz. Ele tem consulta marcada no nefrologista para ver a fístula." }], ["diálise", "fístula"])
  ],
  initial: {
    vars: { hr: 48, sbp: 112, dbp: 64, rr: 20, spo2: 95, temp: 36.3, gcs: 15, pain: 0, glucose: 132, perfusion: 0.8, effort: 0.5, k: 7.6, na: 133, cl: 108, ca: 8.2, mg: 2.6, ph: 7.24, pco2: 33, hco3: 14, be: -11, lactate: 1.4, creat: 6.8, urea: 182, hb: 9.4, ht: 29, wbc: 7600, plt: 190000 },
    flags: { rhythm: "sinusal_t_apiculada", posture: "supino", painVisual: "nenhuma" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Acordado, orientado, hipocorado, levemente dispneico.", {}),
    ex("e-neuro", "neurologico", "especial", "Força grau 4 em membros inferiores, simétrica; reflexos diminuídos; sensibilidade preservada.", {}),
    ex("e-pulso", "membro_superior_d", "palpacao", "Pulso radial regular, lento (~48 bpm).", { better: [{ when: { path: "flags.rhythm", op: "eq", value: "sinusal_qrs_largo" }, text: "Pulso muito lento e fino (~38 bpm)." }] }),
    ex("e-coracao", "coracao", "ausculta", "Bulhas rítmicas, bradicárdicas, sem sopros.", { sound: "bulhas_normais" }),
    ex("e-torax", "torax_anterior", "ausculta", "Estertores finos em bases.", { sound: "estertores" }),
    ex("e-edema", "membro_inferior_d", "inspecao", "Edema de membros inferiores 2+/4+, simétrico.", {})
  ],
  testResults: [
    {
      testId: "ecg12",
      variants: [
        { when: { path: "vars.k", op: "lt", value: 6.0 }, text: "Ritmo sinusal, FC 72 bpm; ondas T menos apiculadas que no traçado anterior.", ecg: { rhythm: "sinusal", rate: 72, stElevationLeads: [], stDepressionLeads: [], peakedT: false, wideQrs: false } },
        { when: { path: "flags.rhythm", op: "eq", value: "sinusal_qrs_largo" }, text: "Ritmo lento com QRS alargado (~160 ms), ondas P quase ausentes e T apiculadas: padrão de hipercalemia grave, risco iminente de arritmia.", ecg: { rhythm: "sinusal_qrs_largo", rate: 38, stElevationLeads: [], stDepressionLeads: [], peakedT: true, wideQrs: true } },
        { text: "Bradicardia sinusal (48 bpm), ondas T altas e apiculadas difusas, PR prolongado, QRS no limite superior. Padrão sugestivo de hipercalemia.", ecg: { rhythm: "sinusal_t_apiculada", rate: 48, stElevationLeads: [], stDepressionLeads: [], peakedT: true, wideQrs: false } }
      ]
    },
    { testId: "rx_torax", variants: [{ text: "Laudo educativo: congestão pulmonar leve, área cardíaca aumentada." }] }
  ],
  highlightedActions: ["monitorizar", "acesso_venoso", "glicemia_capilar", "acionar_samu", "pas_desfibrilador"],
  rules: [
    {
      id: "r-progressao",
      description: "Sem estabilização, distúrbio de condução progride",
      priority: 5,
      when: { all: [{ time: "gte", seconds: 600 }, { not: CALCIO }] },
      repeat: "once",
      effects: [flag("rhythm", "sinusal_qrs_largo"), trend("hr", 38, 120, "doenca", 10), trend("sbp", 86, 300, "doenca", 10), trend("perfusion", 0.5, 300, "doenca", 10), staff("enfermagem", "O traçado do monitor mudou, os complexos estão largos e a frequência caiu!"), outcome("piora")]
    },
    {
      id: "r-pcr",
      description: "Hipercalemia não estabilizada evolui para FV (desfecho definido pelo caso)",
      priority: 100,
      when: { any: [{ all: [{ time: "gte", seconds: 1500 }, { not: CALCIO }] }, { path: "vars.k", op: "gte", value: 8.5 }] },
      repeat: "once",
      effects: [flag("rhythm", "fv"), flag("pulse", false), flag("consciousness", "irresponsivo"), { type: "setValue", var: "hr", value: 260 }, { type: "setValue", var: "rr", value: 2 }, staff("enfermagem", "Ele apagou! O monitor está em fibrilação!"), outcome("parada", true)]
    },
    {
      id: "r-calcio",
      description: "Cálcio IV estabiliza a membrana (efeito temporário; não reduz K⁺)",
      priority: 60,
      when: CALCIO,
      repeat: "once",
      effects: [flag("rhythm", "sinusal_t_apiculada"), trend("hr", 62, 120, "calcio", 60, 3600), trend("sbp", 118, 300, "calcio", 60, 3600), trend("perfusion", 0.8, 300, "calcio", 60, 3600), obs("Após o cálcio, o QRS estreitou no monitor. O potássio, porém, não mudou.")]
    },
    {
      id: "r-calcio-expira",
      description: "Sem redução do K⁺, o efeito do cálcio se esgota em ~60 min",
      priority: 58,
      when: { all: [{ elapsedSince: "drug:gluconato_calcio", op: "gte", seconds: 3600 }, { path: "vars.k", op: "gte", value: 6.8 }] },
      repeat: "once",
      effects: [flag("rhythm", "sinusal_qrs_largo"), trend("hr", 40, 120, "expira", 65), staff("enfermagem", "Os complexos voltaram a alargar."), outcome("piora")]
    },
    { id: "r-insulina-glicose", description: "Insulina + glicose deslocam K⁺ para o intracelular", priority: 50, when: { all: [INS, GLIC] }, repeat: "once", effects: [trend("k", 6.4, 900, "shift", 50, 14400), trend("hr", 70, 900, "shift", 55, 14400)] },
    { id: "r-salbutamol", description: "Salbutamol nebulizado em dose alta soma efeito de deslocamento", priority: 52, when: { all: [SAL, INS, GLIC] }, repeat: "once", effects: [trend("k", 5.9, 900, "shift2", 52, 14400), trend("hr", 84, 900, "shift2", 52, 14400)] },
    { id: "r-sal-isolado", description: "Salbutamol isolado: redução menor de K⁺", priority: 45, when: { all: [SAL, { not: INS }] }, repeat: "once", effects: [trend("k", 7.0, 900, "sal", 45, 7200)] },
    { id: "r-melhora-ecg", description: "K⁺ < 6,5 com membrana estabilizada: ECG melhora", priority: 70, when: { all: [{ path: "vars.k", op: "lt", value: 6.5 }, { not: { path: "flags.pulse", op: "eq", value: false } }] }, repeat: "once", effects: [flag("rhythm", "sinusal"), outcome("estabilizacao_parcial")] },
    { id: "r-insulina-sem-glicose", description: "Insulina sem glicose: hipoglicemia", priority: 80, when: { all: [INS, { not: { drugGiven: "glicose50" } }, { elapsedSince: "drug:insulina_regular", op: "gte", seconds: 600 }] }, repeat: "once", effects: [trend("glucose", 48, 600, "hipo", 80), flag("sweating", true), flag("consciousness", "voz"), staff("enfermagem", "Ele ficou suado e confuso, a glicemia deve estar baixa!"), outcome("complicacao")] },
    { id: "r-kcl", description: "Potássio IV em hipercalemia: piora grave", priority: 95, when: { drugGiven: "kcl" }, repeat: "once", effects: [trend("k", 9, 300, "kcl", 99)] },
    { id: "r-furosemida", description: "Furosemida tem efeito limitado na DRC avançada oligúrica", when: { drugGiven: "furosemida" }, repeat: "once", effects: [trend("k", 7.3, 3600, "furo", 30, 7200), obs("Pouca diurese após a furosemida.")] },
    { id: "r-regulacao", description: "Regulação aceita transferência para diálise", when: { actionCompleted: "acionar_samu" }, repeat: "once", effects: [staff("regulacao", "Regulação: vaga no hospital de referência com hemodiálise de urgência. USA a caminho; manter monitorização e tratamento em curso.")] }
  ],
  diagnosis: { primary: "hipercalemia", accepted: ["hipercalemia"], differentials: ["bav_total", "drc_agudizada", "icc_descompensada", "iamssst", "hiponatremia"] },
  acceptedDestinations: ["transferencia_regulada"],
  outcomeNotes: "Cálcio estabiliza por ~60 min; insulina + glicose (± salbutamol) reduzem K⁺; diálise via regulação é a remoção definitiva. Sem cálcio, QRS alarga aos 10 min e há FV aos 25 min. KCl precipita FV. Insulina sem glicose causa hipoglicemia.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Identificou DRC e medicações/dieta que elevam o potássio", evidence: { kind: "historyAsked", items: ["h-rim", "h-medicacoes", "h-dieta"], minCount: 2 }, points: 10, severity: "importante", rationale: "Espironolactona + IECA + DRC + ingestão de frutas: causa provável." },
    { id: "s-exame", domain: "historia", description: "Avaliou pulso, força e congestão", evidence: { kind: "examDone", regions: ["membro_superior_d", "neurologico", "torax_anterior", "coracao"], minCount: 2 }, points: 6, severity: "menor", rationale: "Bradicardia e fraqueza muscular são sinais de gravidade." },
    { id: "s-ecg", domain: "priorizacao", description: "ECG de 12 derivações em até 10 minutos", evidence: { kind: "testOrdered", anyOf: ["ecg12"], withinSeconds: 600 }, points: 12, severity: "critica", rationale: "Alterações no ECG definem urgência e indicam cálcio.", sourceIds: ["INT-UKKA-HIPERK"] },
    { id: "s-monitor", domain: "priorizacao", description: "Monitorização cardíaca", evidence: { kind: "actionDone", anyOf: ["monitorizar"], withinSeconds: 300 }, points: 6, severity: "importante", rationale: "Risco de arritmia." },
    { id: "s-calcio", domain: "tratamento", description: "Gluconato de cálcio IV com ECG alterado", evidence: { kind: "drugGiven", anyOf: ["gluconato_calcio"], withinSeconds: 1200 }, points: 12, severity: "critica", rationale: "Estabiliza a membrana miocárdica em minutos; não reduz o K⁺.", sourceIds: ["INT-UKKA-HIPERK"] },
    { id: "s-shift", domain: "tratamento", description: "Insulina regular IV + glicose", evidence: { kind: "drugGiven", anyOf: ["insulina_regular"], routes: ["IV"] }, points: 8, severity: "importante", rationale: "Desloca K⁺ para o intracelular em 15–30 min.", sourceIds: ["INT-UKKA-HIPERK"] },
    { id: "s-sal", domain: "tratamento", description: "Salbutamol nebulizado como adjuvante", evidence: { kind: "drugGiven", anyOf: ["salbutamol"] }, points: 3, severity: "menor", rationale: "Efeito aditivo à insulina; não deve ser usado isolado.", alternatives: "Opcional." },
    { id: "s-kcl", domain: "tratamento", description: "Falha de segurança: potássio IV na hipercalemia", evidence: { kind: "avoidDrug", anyOf: ["kcl"] }, points: 12, penalty: true, severity: "critica", rationale: "Contraindicado." },
    { id: "s-hipo", domain: "tratamento", description: "Falha: insulina sem glicose", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-insulina-sem-glicose" } }, points: 6, penalty: true, severity: "importante", rationale: "Glicemia < 250 mg/dL exige glicose junto com a insulina." },
    { id: "s-labs", domain: "exames", description: "Potássio/gasometria e função renal", evidence: { kind: "testOrdered", anyOf: ["gaso_venosa", "eletrolitos", "gaso_arterial"] }, points: 8, severity: "importante", rationale: "Confirmar K⁺ e acidose; gasometria dá resultado rápido." },
    { id: "s-exames-excesso", domain: "exames", description: "Sem exames que atrasem o tratamento", evidence: { kind: "testsNotExcessive", maxUnjustified: 1, justified: ["ecg12", "gaso_venosa", "gaso_arterial", "eletrolitos", "funcao_renal", "hemograma", "rx_torax"] }, points: 7, severity: "menor", rationale: "Tratar com ECG alterado sem esperar o laboratório central." },
    { id: "s-reav-hgt", domain: "reavaliacao", description: "Glicemia capilar após insulina", evidence: { kind: "reassessAfter", after: ["insulina_regular"], reassess: ["glicemia_capilar"], withinSeconds: 1800 }, points: 5, severity: "importante", rationale: "Hipoglicemia é complicação comum." },
    { id: "s-reav-k", domain: "reavaliacao", description: "Repetiu ECG ou potássio após tratamento", evidence: { kind: "reassessAfter", after: ["gluconato_calcio", "insulina_regular"], reassess: ["ecg12", "gaso_venosa", "eletrolitos", "monitorizacao_continua"], withinSeconds: 3600 }, points: 5, severity: "importante", rationale: "Efeito transitório; reavaliar." },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de hipercalemia grave", evidence: { kind: "diagnosis", accepted: ["hipercalemia"] }, points: 4, severity: "importante", rationale: "K⁺ 7,6 com alterações no ECG." },
    { id: "s-regulacao", domain: "destino", description: "Acionou regulação para diálise", evidence: { kind: "actionDone", anyOf: ["acionar_samu"] }, points: 3, severity: "importante", rationale: "UPA não dispõe de diálise.", sourceIds: ["BR-UPA"] },
    { id: "s-destino", domain: "destino", description: "Transferência regulada para hemodiálise", evidence: { kind: "disposition", accepted: ["transferencia_regulada"] }, points: 3, severity: "importante", rationale: "Remoção definitiva do potássio na DRC avançada." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "O que a combinação DRC + espironolactona + IECA sugere?" },
      { level: 2, text: "Qual exame à beira do leito mostra se o coração já está sendo afetado?" },
      { level: 3, text: "Três etapas: estabilizar a membrana, deslocar o potássio, remover o potássio." },
      { level: 4, text: "Sugestão explícita: ECG e monitor; gluconato de cálcio IV; insulina regular IV com glicose 50%; salbutamol nebulizado; regulação para diálise." }
    ],
    summary: "Homem de 66 anos com DRC avançada, em uso de espironolactona e enalapril, com K⁺ 7,6 e ECG com T apiculadas e bradicardia.",
    pathophysiology: "A hipercalemia reduz o potencial de repouso da membrana, prejudica a condução (PR longo, QRS largo) e pode levar a FV ou assistolia. O cálcio restaura o limiar de excitabilidade; a insulina e os beta-2 ativam a Na⁺/K⁺-ATPase; a remoção exige rim funcionante, resina ou diálise.",
    keyPoints: [
      "ECG imediato: alterações indicam cálcio IV sem esperar o laboratório.",
      "Cálcio não reduz o potássio; seu efeito dura cerca de 30–60 min.",
      "Insulina sempre com glicose quando a glicemia não está elevada; monitorar glicemia.",
      "Suspender fontes e fármacos hipercalemiantes (espironolactona, IECA).",
      "Na DRC avançada oligúrica, a remoção definitiva é a diálise."
    ],
    alternatives: ["Salbutamol nebulizado como adjuvante.", "Furosemida só com função renal residual."],
    oralRubric: [
      { id: "o1", concept: "ECG precoce", synonyms: ["ecg", "eletrocardiograma"], weight: 2 },
      { id: "o2", concept: "Cálcio IV", synonyms: ["cálcio", "calcio", "gluconato"], weight: 3 },
      { id: "o3", concept: "Insulina com glicose", synonyms: ["insulina", "glicose"], weight: 2 },
      { id: "o4", concept: "Diálise", synonyms: ["diálise", "dialise", "hemodiálise"], weight: 2 }
    ],
    simplifications: ["Magnitudes de queda do K⁺ e durações são parâmetros didáticos.", "Doses de cálcio e insulina devem ser conferidas no PDF da diretriz (validação pendente)."]
  },
  references: ["INT-UKKA-HIPERK", "BR-UPA", "BR-SAMU", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 0, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    {
      id: "t-aceitavel",
      kind: "acceptable",
      description: "ECG, monitor, cálcio, insulina + glicose, salbutamol, regulação",
      commands: [act(5, "monitorizar"), test(10, "ecg12"), ask(20, "h-medicacoes"), act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(300, "gluconato_calcio", "amp10", 1000, "mg", "IV"), test(310, "gaso_venosa"), rx(400, "insulina_regular", "fr100", 10, "UI", "IV"), rx(405, "glicose50", "amp10", 25, "g", "IV"), rx(420, "salbutamol", "neb5", 10, "mg", "nebulizacao"), act(1500, "glicemia_capilar"), act(1600, "acionar_samu"), test(2400, "ecg12"), dx(2500, "hipercalemia"), dest(2500, "transferencia_regulada")],
      runUntilSeconds: 4000,
      expect: [{ condition: { path: "vars.k", op: "lt", value: 6.5 }, description: "K⁺ < 6,5" }, { condition: { ruleFired: "r-melhora-ecg" }, description: "ECG melhora" }, { condition: { not: { ruleFired: "r-pcr" } }, description: "sem PCR" }]
    },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem tratamento", commands: [], runUntilSeconds: 1600, expect: [{ condition: { ruleFired: "r-progressao" }, description: "QRS alarga" }, { condition: { ruleFired: "r-pcr" }, description: "FV" }] },
    { id: "t-inadequada", kind: "inadequate", description: "KCl prescrito por engano", commands: [act(5, "acesso_venoso"), act(100, "acesso_venoso"), rx(200, "kcl", "amp10", 20, "mEq", "IV", "infusao_volume", { durationMinutes: 60 })], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-pcr" }, description: "FV" }] },
    { id: "t-atraso", kind: "delay", description: "Só insulina + glicose (sem cálcio), iniciada aos 8 min", commands: [act(5, "acesso_venoso"), act(100, "acesso_venoso"), rx(480, "insulina_regular", "fr100", 10, "UI", "IV"), rx(485, "glicose50", "amp10", 25, "g", "IV")], runUntilSeconds: 1700, expect: [{ condition: { ruleFired: "r-progressao" }, description: "progressão sem cálcio" }, { condition: { ruleFired: "r-pcr" }, description: "FV aos 25 min sem estabilização" }] },
    { id: "t-alternativa", kind: "alternative", description: "Cálcio + insulina/glicose sem salbutamol", commands: [act(5, "monitorizar"), act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(300, "gluconato_calcio", "amp10", 1000, "mg", "IV"), rx(400, "insulina_regular", "fr100", 10, "UI", "IV"), rx(405, "glicose50", "amp10", 25, "g", "IV")], runUntilSeconds: 4000, expect: [{ condition: { ruleFired: "r-melhora-ecg" }, description: "ECG melhora" }] }
  ]
};
