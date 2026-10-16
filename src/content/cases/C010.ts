import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, obs, outcome, rx, staff, test, trend } from "./helpers";

const AAS = { drugGiven: "aas" };
const ANTICOAG = { any: [{ drugGiven: "enoxaparina" }, { drugGiven: "heparina" }] };
const FIBRINOLITICO = { any: [{ drugGiven: "tenecteplase" }, { drugGiven: "alteplase" }] };

export const C010: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C010",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Dor no peito que vai e volta desde a madrugada",
  teachingTitle: "Síndrome coronariana aguda sem supradesnivelamento de ST — ECG seriado, troponina, antitrombóticos e estratificação",
  group: "Cardiologia",
  specialties: ["Cardiologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Obter ECG em até 10 minutos e repeti-lo se a dor persistir",
    "Interpretar troponina de alta sensibilidade em curva",
    "Iniciar antiagregação e anticoagulação",
    "Não usar fibrinolítico sem supradesnivelamento de ST",
    "Estratificar risco e definir estratégia invasiva via regulação"
  ],
  keywords: ["dor no peito", "aperto", "vai e volta", "coração", "angina"],
  patient: {
    name: "Sônia Rezende",
    ageYears: 66,
    sex: "feminino",
    weightKg: 72,
    heightCm: 160,
    visual: { ageGroup: "idoso", sex: "feminino", skinTone: 3, hairStyle: "curto", hairColor: "grisalho", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Mulher de 66 anos, diabética e hipertensa, com episódios de dor no peito em aperto desde a madrugada, cada um durando 15–20 minutos; o último terminou há 30 minutos.",
  communication: "normal",
  history: [
    h("h-dor", "queixa", "Como é a dor?", "Um aperto no meio do peito que vai para o pescoço, com suor. Vem e passa sozinha.", { keywords: ["dor", "como é"] }),
    h("h-padrao", "inicio", "Quando começou? Quantas vezes?", "Desde as 3 da manhã, umas quatro vezes, até em repouso.", { keywords: ["quando", "vezes", "repouso"] }),
    h("h-agora", "intensidade", "Está com dor agora?", "Agora está quase nada, uns 2.", { keywords: ["agora"] }),
    h("h-antecedentes", "antecedentes", "Que doenças tem?", "Diabetes, pressão alta e colesterol. Nunca infartei.", { keywords: ["doenças"] }),
    h("h-medicacoes", "medicacoes", "Que remédios toma? Algum anticoagulante?", "Metformina, losartana e sinvastatina. Anticoagulante não.", { keywords: ["remédio", "anticoagulante"] }),
    h("h-sangramento", "sinais_alarme", "Tem úlcera ou teve sangramento?", "Não.", { keywords: ["úlcera", "sangramento"] }),
    h("h-alergias", "alergias", "Tem alergia?", "Não.")
  ],
  initial: {
    vars: { hr: 88, sbp: 152, dbp: 86, rr: 18, spo2: 96, temp: 36.5, gcs: 15, pain: 2, glucose: 182, perfusion: 0.85, effort: 0.3, trop: 46, creat: 1.0, k: 4.3, hb: 12.8, plt: 230000 },
    flags: { rhythm: "sinusal", posture: "sentado", painVisual: "leve", speech: "frases", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Corada, sem desconforto no momento.", { better: [{ when: { ruleFired: "r-recorrencia" }, text: "Sudoreica, mão no peito, com dor." }] }),
    ex("e-coracao", "coracao", "ausculta", "Bulhas rítmicas, B4, sem sopros.", { sound: "bulhas_normais" }),
    ex("e-pulmao", "torax_posterior", "ausculta", "Murmúrio presente, sem estertores.", { sound: "murmurio_normal" }),
    ex("e-pulsos", "membro_superior_d", "palpacao", "Pulsos simétricos; PA semelhante nos dois braços.", { label: "Pulsos e PA bilateral" })
  ],
  testResults: [
    { testId: "ecg12", variants: [
      { when: { ruleFired: "r-recorrencia" }, text: "Durante a dor: infradesnivelamento de ST de 2 mm em V3–V6, DI e aVL; sem supradesnivelamento.", ecg: { rhythm: "sinusal", rate: 96, stElevationLeads: [], stDepressionLeads: ["V3", "V4", "V5", "V6", "DI", "aVL"], peakedT: false, wideQrs: false } },
      { text: "Ritmo sinusal 88 bpm; infradesnivelamento de ST de 1 mm em V4–V6; sem supradesnivelamento.", ecg: { rhythm: "sinusal", rate: 88, stElevationLeads: [], stDepressionLeads: ["V4", "V5", "V6"], peakedT: false, wideQrs: false } }
    ] },
    { testId: "rx_torax", variants: [{ text: "Sem alterações agudas. (Laudo educativo.)" }] }
  ],
  highlightedActions: ["monitorizar", "acesso_venoso", "acionar_samu"],
  rules: [
    { id: "r-troponina", description: "Troponina sobe na curva", when: { always: true }, repeat: "once", effects: [trend("trop", 820, 5400, "iam", 10)] },
    { id: "r-recorrencia", description: "Sem antitrombóticos em 40 min: nova dor isquêmica", priority: 30, when: { all: [{ time: "gte", seconds: 2400 }, { not: { all: [AAS, ANTICOAG] } }] }, repeat: "once", effects: [trend("pain", 7, 120, "isq", 30, 1800), trend("hr", 98, 120, "isq", 30, 1800), flag("sweating", true), flag("painVisual", "intensa"), staff("enfermagem", "A dor voltou forte e ela está suando."), outcome("piora")] },
    { id: "r-estavel", description: "AAS + anticoagulação: sem recorrência", priority: 50, when: { all: [AAS, ANTICOAG, { time: "gte", seconds: 2400 }] }, repeat: "once", effects: [obs("Sem recorrência de dor sob antiagregação e anticoagulação."), outcome("estabilizacao_parcial")] },
    { id: "r-nitrato", description: "Nitrato alivia a dor isquêmica", when: { all: [{ any: [{ drugGiven: "nitroglicerina" }, { treatmentActive: "nitroglicerina" }] }, { ruleFired: "r-recorrencia" }] }, repeat: "once", effects: [trend("pain", 2, 300, "ntg", 60, 1800)] },
    { id: "r-fibrinolise", description: "Fibrinolítico sem supra: sem benefício e com sangramento", priority: 90, when: FIBRINOLITICO, repeat: "once", effects: [trend("hb", 10.4, 900, "sang", 90), obs("Fibrinolítico no IAM sem supra: não há benefício e há risco hemorrágico (sangramento em sítio de punção)."), outcome("complicacao")] },
    { id: "r-regulacao", description: "Regulação para estratégia invasiva", when: { actionCompleted: "acionar_samu" }, repeat: "once", effects: [staff("regulacao", "Regulação: IAM sem supra de alto risco — vaga para cateterismo em até 24 h no hospital de referência. Se dor refratária ou instabilidade, transferência imediata.")] }
  ],
  diagnosis: { primary: "iamssst", accepted: ["iamssst"], differentials: ["iamcsst", "disseccao_aorta", "tep", "pericardite", "dor_toracica_musculoesqueletica"] },
  acceptedDestinations: ["transferencia_regulada", "internacao_enfermaria", "uti"],
  outcomeNotes: "Dor anginosa em repouso, recorrente, com infra de ST e troponina em ascensão: IAM sem supra de alto risco. AAS, segundo antiagregante, anticoagulação, nitrato se dor, estratégia invasiva em até 24 h (imediata se muito alto risco). Fibrinolítico não é indicado.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Caracterizou a dor e o padrão (repouso, recorrência)", evidence: { kind: "historyAsked", items: ["h-dor", "h-padrao", "h-agora"], minCount: 2 }, points: 7, severity: "importante", rationale: "Angina em repouso/recorrente é de alto risco." },
    { id: "s-sang", domain: "historia", description: "Pesquisou risco de sangramento", evidence: { kind: "historyAsked", items: ["h-sangramento", "h-medicacoes"], minCount: 1 }, points: 3, severity: "importante", rationale: "Antes de antitrombóticos." },
    { id: "s-ecg", domain: "priorizacao", description: "ECG em até 10 minutos", evidence: { kind: "testOrdered", anyOf: ["ecg12"], withinSeconds: 600 }, points: 12, severity: "critica", rationale: "Excluir supra e documentar isquemia.", sourceIds: ["INT-ESC-SCA-2023"] },
    { id: "s-trop", domain: "exames", description: "Troponina de alta sensibilidade (curva)", evidence: { kind: "testOrdered", anyOf: ["troponina"], withinSeconds: 900 }, points: 8, severity: "critica", rationale: "Diagnóstico de IAM sem supra.", sourceIds: ["INT-ESC-SCA-2023"] },
    { id: "s-exames", domain: "exames", description: "Exames dirigidos", evidence: { kind: "testsNotExcessive", maxUnjustified: 1, justified: ["ecg12", "troponina", "hemograma", "funcao_renal", "eletrolitos", "coagulograma", "rx_torax"] }, points: 5, severity: "menor", rationale: "Função renal e plaquetas para antitrombóticos." },
    { id: "s-aas", domain: "tratamento", description: "AAS", evidence: { kind: "drugGiven", anyOf: ["aas"], withinSeconds: 1800 }, points: 8, severity: "critica", rationale: "Antiagregação precoce.", sourceIds: ["INT-ESC-SCA-2023"] },
    { id: "s-p2y12", domain: "tratamento", description: "Segundo antiagregante", evidence: { kind: "drugGiven", anyOf: ["clopidogrel"] }, points: 3, severity: "importante", rationale: "Dupla antiagregação (momento conforme estratégia)." },
    { id: "s-anticoag", domain: "tratamento", description: "Anticoagulação", evidence: { kind: "drugGiven", anyOf: ["enoxaparina", "heparina"], withinSeconds: 2400 }, points: 8, severity: "critica", rationale: "Anticoagulação parenteral até o cateterismo.", sourceIds: ["INT-ESC-SCA-2023"] },
    { id: "s-fibrino", domain: "tratamento", description: "Falha: fibrinolítico sem supra", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-fibrinolise" } }, points: 10, penalty: true, severity: "critica", rationale: "Sem benefício e com risco." },
    { id: "s-ecg-serial", domain: "reavaliacao", description: "ECG seriado / durante a dor", evidence: { kind: "reassessAfter", after: ["aas"], reassess: ["ecg12", "troponina"], withinSeconds: 5400 }, points: 10, severity: "importante", rationale: "Isquemia dinâmica e curva de troponina." },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de IAM sem supra", evidence: { kind: "diagnosis", accepted: ["iamssst"] }, points: 5, severity: "importante", rationale: "Troponina em ascensão com infra de ST." },
    { id: "s-destino", domain: "destino", description: "Estratégia invasiva via regulação", evidence: { kind: "disposition", accepted: ["transferencia_regulada"] }, points: 5, severity: "importante", rationale: "Alto risco: cateterismo em até 24 h.", sourceIds: ["INT-ESC-SCA-2023"] }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Qual exame nos primeiros 10 minutos?" },
      { level: 2, text: "Sem supra: o que confirma o infarto?" },
      { level: 3, text: "Fibrinolítico só tem benefício com supra (ou equivalente)." },
      { level: 4, text: "Sugestão explícita: ECG, troponina seriada, AAS, clopidogrel, enoxaparina, nitrato se dor, regulação para cateterismo em 24 h." }
    ],
    summary: "Mulher de 66 anos diabética com angina em repouso recorrente, infra de ST e troponina de alta sensibilidade em ascensão.",
    pathophysiology: "Placa instável com trombo suboclusivo causa isquemia subendocárdica intermitente (infra de ST) e necrose limitada (troponina). A antiagregação e a anticoagulação reduzem a progressão do trombo; o cateterismo define a revascularização.",
    keyPoints: [
      "ECG em 10 min; repetir na recorrência da dor.",
      "Troponina de alta sensibilidade em curva (0/1 h ou 0/2 h conforme o método).",
      "AAS, segundo antiagregante, anticoagulação.",
      "Sem fibrinolítico no IAM sem supra.",
      "Estratégia invasiva conforme risco (imediata, < 24 h ou seletiva)."
    ],
    alternatives: ["Ticagrelor ou prasugrel conforme estratégia (não modelados)."],
    oralRubric: [
      { id: "o1", concept: "ECG e troponina", synonyms: ["ecg", "troponina", "curva"], weight: 2 },
      { id: "o2", concept: "Antitrombóticos", synonyms: ["aas", "clopidogrel", "enoxaparina", "heparina"], weight: 3 },
      { id: "o3", concept: "Sem fibrinolítico", synonyms: ["fibrinolítico", "trombolítico"], weight: 1 },
      { id: "o4", concept: "Estratificação e cateterismo", synonyms: ["grace", "risco", "cateterismo", "24 horas"], weight: 2 }
    ],
    simplifications: ["Recorrência da dor aos 40 min sem antitrombóticos é didática.", "Curva da troponina comprimida."]
  },
  references: ["INT-ESC-SCA-2023", "BR-SAMU", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "ECG, troponina, AAS, clopidogrel, enoxaparina, ECG seriado e regulação", commands: [test(10, "ecg12"), act(20, "monitorizar"), ask(30, "h-padrao"), ask(40, "h-sangramento"), act(60, "acesso_venoso"), act(160, "acesso_venoso"), test(170, "troponina"), rx(200, "aas", "cp100", 300, "mg", "VO"), rx(220, "clopidogrel", "cp75", 300, "mg", "VO"), rx(300, "enoxaparina", "ser80", 72, "mg", "SC"), act(400, "acionar_samu"), test(3600, "troponina"), test(3700, "ecg12"), dx(4000, "iamssst"), dest(4000, "transferencia_regulada")], runUntilSeconds: 4500, expect: [{ condition: { ruleFired: "r-estavel" }, description: "sem recorrência" }, { condition: { not: { ruleFired: "r-recorrencia" } }, description: "sem nova dor" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-recorrencia" }, description: "recorrência isquêmica" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Tenecteplase por \"infarto\"", commands: [act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(200, "tenecteplase", "fa40", 35, "mg", "IV")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-fibrinolise" }, description: "sangramento" }] },
    { id: "t-atraso", kind: "delay", description: "Antitrombóticos só após recorrência; nitrato para a dor", commands: [act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(2500, "aas", "cp100", 300, "mg", "VO"), rx(2550, "enoxaparina", "ser80", 72, "mg", "SC"), rx(2600, "nitroglicerina", "sol200", 50, "mg", "IV", "infusao", { rate: { value: 10, unit: "mcg/min" } })], runUntilSeconds: 3500, expect: [{ condition: { ruleFired: "r-recorrencia" }, description: "recorrência" }, { condition: { ruleFired: "r-nitrato" }, description: "alívio" }] },
    { id: "t-alternativa", kind: "alternative", description: "Heparina não fracionada em vez de enoxaparina", commands: [test(10, "ecg12"), act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(200, "aas", "cp100", 300, "mg", "VO"), rx(300, "heparina", "fa5000", 60, "UI/kg", "IV"), act(400, "acionar_samu")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-estavel" }, description: "sem recorrência" }] }
  ]
};
