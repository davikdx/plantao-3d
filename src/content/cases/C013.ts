import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const CV = { actionCompleted: "cardioversao_sincronizada" };
const SEDACAO = { any: [{ drugGiven: "midazolam" }, { drugGiven: "cetamina" }, { drugGiven: "morfina" }] };

export const C013: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C013",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Coração muito acelerado com pressão baixa e confusão",
  teachingTitle: "Taquicardia ventricular monomórfica com pulso e instabilidade — cardioversão sincronizada",
  group: "Cardiologia",
  specialties: ["Cardiologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Reconhecer taquicardia com sinais de instabilidade",
    "Priorizar cardioversão elétrica sincronizada sem atrasos",
    "Oferecer sedação/analgesia quando o tempo permitir",
    "Reconhecer a perda de pulso e mudar para o algoritmo de PCR",
    "Investigar causa (isquemia, eletrólitos) após a reversão"
  ],
  keywords: ["coração acelerado", "tontura", "pressão baixa", "palpitação", "confuso"],
  patient: {
    name: "Ademir Souza",
    ageYears: 63,
    sex: "masculino",
    weightKg: 84,
    heightCm: 172,
    visual: { ageGroup: "idoso", sex: "masculino", skinTone: 4, hairStyle: "careca", hairColor: "grisalho", build: "robusto", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Homem de 63 anos, com infarto prévio, chega trazido pelo filho com palpitações há 1 hora, tontura e dor no peito. Está pálido e responde devagar.",
  communication: "limitada",
  informants: [{ id: "filho", name: "Wagner", role: "Filho" }],
  history: [
    h("h-queixa", "queixa", "O que o senhor sente?", "O coração… disparado… e uma dor no peito.", { keywords: ["sente", "coração"] }),
    hi("h-antecedentes", "antecedentes", "Que doenças ele tem?", [{ source: "filho", text: "Teve infarto há 4 anos, o coração ficou fraco. Toma carvedilol, furosemida e espironolactona." }], ["doenças", "infarto"]),
    hi("h-inicio", "inicio", "Quando começou?", [{ source: "filho", text: "Há uma hora, de repente. No carro ele quase desmaiou." }], ["quando", "começou"]),
    hi("h-diarreia", "fatores_associados", "Teve vômitos, diarreia ou mudou algum remédio?", [{ source: "filho", text: "Teve diarreia ontem e o médico aumentou a furosemida na semana passada." }], ["vômito", "diarreia", "remédio"]),
    hi("h-alergias", "alergias", "Tem alergia?", [{ source: "filho", text: "Não." }])
  ],
  initial: {
    vars: { hr: 182, sbp: 78, dbp: 48, rr: 24, spo2: 93, temp: 36.3, gcs: 14, pain: 6, glucose: 132, perfusion: 0.35, effort: 0.4, k: 3.1, mg: 1.4, na: 136, creat: 1.4, trop: 60, lactate: 3.4 },
    flags: { rhythm: "tv", pulse: true, sweating: true, pallor: true, posture: "supino", painVisual: "moderada", speech: "palavras", consciousness: "voz", communication: "limitada" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Pálido, sudoreico, sonolento mas responde ao chamado.", { better: [{ when: { ruleFired: "r-cv" }, text: "Mais alerta, corado." }] }),
    ex("e-pulso", "membro_superior_d", "palpacao", "Pulso radial fino e muito rápido.", { label: "Pulso", better: [{ when: { ruleFired: "r-pulso-perdido" }, text: "Sem pulso carotídeo." }] }),
    ex("e-pulmao", "torax_posterior", "ausculta", "Estertores finos em bases.", { sound: "estertores" }),
    ex("e-coracao", "coracao", "ausculta", "Taquicárdico, bulhas abafadas pela frequência.", { sound: "bulhas_normais" })
  ],
  testResults: [
    { testId: "ecg12", variants: [
      { when: { ruleFired: "r-cv" }, text: "Ritmo sinusal 94 bpm; ondas Q em V1–V4 (área inativa anterior); QT no limite superior; sem supra agudo.", ecg: { rhythm: "sinusal", rate: 94, stElevationLeads: [], stDepressionLeads: [], peakedT: false, wideQrs: false } },
      { text: "Taquicardia regular de QRS largo (160 ms), 182 bpm, monomórfica, com dissociação AV. Compatível com taquicardia ventricular.", ecg: { rhythm: "tv", rate: 182, stElevationLeads: [], stDepressionLeads: [], peakedT: false, wideQrs: true } }
    ] }
  ],
  highlightedActions: ["monitorizar", "pas_desfibrilador", "acesso_venoso", "o2_mascara_reservatorio", "cardioversao_sincronizada"],
  rules: [
    { id: "r-cv", description: "Cardioversão sincronizada reverte a TV", priority: 80, when: { all: [CV, { not: { ruleFired: "r-pulso-perdido" } }] }, repeat: "once", effects: [flag("rhythm", "sinusal"), { type: "setValue", var: "hr", value: 94 }, trend("sbp", 112, 180, "cv", 80), trend("dbp", 68, 180, "cv", 80), trend("perfusion", 0.7, 300, "cv", 80), trend("pain", 2, 300, "cv", 80), flag("consciousness", "alerta"), flag("speech", "frases"), staff("enfermagem", "Reverteu! Ritmo sinusal no monitor."), outcome("melhora")] },
    { id: "r-cv-sem-sedacao", description: "Cardioversão sem sedação/analgesia em paciente que responde", when: { all: [CV, { not: SEDACAO }] }, repeat: "once", effects: [obs("Choque aplicado sem sedação/analgesia em paciente que ainda responde: dor e lembrança desagradável. Quando o tempo permitir, sedar.")] },
    { id: "r-amiodarona", description: "Amiodarona em paciente instável: não reverte e atrasa", when: { all: [{ drugGiven: "amiodarona" }, { not: CV }] }, repeat: "once", effects: [trend("sbp", 72, 120, "amio", 40, 600), obs("Amiodarona IV em infusão: sem reversão imediata; hipotensão discreta. Instabilidade exige cardioversão.")] },
    { id: "r-pulso-perdido", description: "Sem cardioversão em 12 min: TV sem pulso", priority: 90, when: { all: [{ time: "gte", seconds: 720 }, { not: CV }] }, repeat: "once", effects: [flag("pulse", false), { type: "setValue", var: "sbp", value: 0 }, { type: "setValue", var: "dbp", value: 0 }, flag("consciousness", "irresponsivo"), staff("enfermagem", "Ele apagou! Não tem pulso!"), outcome("parada")] },
    { id: "r-rosc", description: "Desfibrilação com RCP após a perda de pulso: RCE", priority: 95, when: { all: [{ ruleFired: "r-pulso-perdido" }, { actionStarted: "rcp" }, { actionCompleted: "desfibrilar" }] }, repeat: "once", effects: [flag("rhythm", "sinusal"), flag("pulse", true), { type: "setValue", var: "hr", value: 104 }, { type: "setValue", var: "sbp", value: 92 }, { type: "setValue", var: "dbp", value: 56 }, flag("consciousness", "dor"), outcome("rosc")] },
    { id: "r-obito", description: "Sem RCE em 10 min após a perda de pulso (decisão didática)", priority: 100, when: { all: [{ time: "gte", seconds: 1320 }, { not: CV }, { not: { ruleFired: "r-rosc" } }] }, repeat: "once", effects: [flag("rhythm", "assistolia"), { type: "setValue", var: "hr", value: 0 }, outcome("obito", true)] },
    { id: "r-eletrolitos", description: "Potássio e magnésio baixos", when: { testCollected: "eletrolitos" }, repeat: "once", effects: [obs("Hipocalemia (3,1) e hipomagnesemia (1,4): corrigir para reduzir recorrência.")] }
  ],
  diagnosis: { primary: "tv_instavel", accepted: ["tv_instavel"], differentials: ["tsv", "fa_alta_resposta", "iamcsst", "hipercalemia", "pcr_fv"] },
  acceptedDestinations: ["uti", "transferencia_regulada"],
  outcomeNotes: "TV monomórfica com pulso e instabilidade (hipotensão, rebaixamento, dor torácica, congestão): cardioversão sincronizada imediata (com sedação breve se possível). Amiodarona não substitui o choque no instável. Após reversão: corrigir K/Mg, ECG, troponina e avaliação para CDI.",
  scoring: [
    { id: "s-instab", domain: "historia", description: "Reconheceu sinais de instabilidade no exame", evidence: { kind: "examDone", regions: ["geral", "membro_superior_d", "torax_posterior"], minCount: 2 }, points: 6, severity: "critica", rationale: "Hipotensão, rebaixamento, congestão e dor torácica definem instabilidade." },
    { id: "s-hist", domain: "historia", description: "Contexto: cardiopatia, diuréticos, perdas", evidence: { kind: "historyAsked", items: ["h-antecedentes", "h-diarreia"], minCount: 1 }, points: 4, severity: "importante", rationale: "Hipocalemia/hipomagnesemia predispõem." },
    { id: "s-pas", domain: "priorizacao", description: "Pás do desfibrilador e monitor em até 2 min", evidence: { kind: "actionDone", anyOf: ["pas_desfibrilador"], withinSeconds: 120 }, points: 8, severity: "critica", rationale: "Preparar cardioversão." },
    { id: "s-ecg", domain: "exames", description: "Registro do ritmo (ECG) sem atrasar o choque", evidence: { kind: "testOrdered", anyOf: ["ecg12"] }, points: 6, severity: "importante", rationale: "Documenta TV; não deve atrasar a cardioversão." },
    { id: "s-eletrolitos", domain: "exames", description: "Eletrólitos (K, Mg)", evidence: { kind: "testOrdered", anyOf: ["eletrolitos"] }, points: 6, severity: "importante", rationale: "Causas corrigíveis." },
    { id: "s-cv", domain: "tratamento", description: "Cardioversão sincronizada em até 5 minutos", evidence: { kind: "actionDone", anyOf: ["cardioversao_sincronizada"], withinSeconds: 300 }, points: 16, severity: "critica", rationale: "Taquicardia instável com pulso: cardioversão sincronizada.", sourceIds: ["INT-AHA-ALS"] },
    { id: "s-sedacao", domain: "tratamento", description: "Sedação/analgesia antes do choque", evidence: { kind: "drugGiven", anyOf: ["midazolam", "cetamina", "morfina"] }, points: 4, severity: "importante", rationale: "Paciente responsivo." },
    { id: "s-acesso", domain: "tratamento", description: "Acesso venoso", evidence: { kind: "actionDone", anyOf: ["acesso_venoso"] }, points: 3, severity: "importante", rationale: "Sedação e antiarrítmico." },
    { id: "s-amio-erro", domain: "tratamento", description: "Falha: antiarrítmico no lugar do choque, com atraso", evidence: { kind: "stateAtEnd", when: { all: [{ ruleFired: "r-amiodarona" }, { ruleFired: "r-pulso-perdido" }] } }, points: 8, penalty: true, severity: "critica", rationale: "Instável não espera fármaco." },
    { id: "s-reav", domain: "reavaliacao", description: "ECG e PA após reversão", evidence: { kind: "reassessAfter", after: ["cardioversao_sincronizada"], reassess: ["ecg12", "medir_pa"], withinSeconds: 900 }, points: 10, severity: "importante", rationale: "Confirmar ritmo e procurar isquemia." },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de TV instável", evidence: { kind: "diagnosis", accepted: ["tv_instavel"] }, points: 5, severity: "importante", rationale: "QRS largo regular com dissociação AV." },
    { id: "s-destino", domain: "destino", description: "UTI ou transferência regulada", evidence: { kind: "disposition", accepted: ["uti", "transferencia_regulada"] }, points: 5, severity: "importante", rationale: "Monitorização e investigação (cateterismo, CDI)." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Ele está estável ou instável?" },
      { level: 2, text: "QRS largo e regular em quem já infartou: pense em TV." },
      { level: 3, text: "Instável com pulso: choque sincronizado." },
      { level: 4, text: "Sugestão explícita: monitor, pás, acesso, sedação breve, cardioversão sincronizada; depois eletrólitos, ECG e UTI." }
    ],
    summary: "Homem de 63 anos com cardiopatia isquêmica, hipocalemia/hipomagnesemia por diurético e diarreia, em TV monomórfica com hipotensão e rebaixamento.",
    pathophysiology: "Cicatriz de infarto cria circuitos de reentrada ventricular; hipocalemia e hipomagnesemia aumentam a excitabilidade. Frequência alta reduz o enchimento e o débito, gerando hipotensão e isquemia — com risco de degenerar para TV sem pulso/FV.",
    keyPoints: [
      "Taquicardia + instabilidade = cardioversão sincronizada imediata.",
      "Sedação/analgesia quando o tempo permitir.",
      "Se perder o pulso: algoritmo de PCR (choque não sincronizado).",
      "Corrigir K e Mg; investigar isquemia.",
      "Antiarrítmico é para o estável ou após a reversão."
    ],
    alternatives: ["Amiodarona após a reversão para prevenir recorrência (conforme especialista)."],
    oralRubric: [
      { id: "o1", concept: "Instabilidade", synonyms: ["instável", "instabilidade", "hipotensão"], weight: 2 },
      { id: "o2", concept: "Cardioversão sincronizada", synonyms: ["cardioversão", "sincronizada", "choque"], weight: 3 },
      { id: "o3", concept: "Sedação", synonyms: ["sedação", "midazolam", "cetamina"], weight: 1 },
      { id: "o4", concept: "Eletrólitos", synonyms: ["potássio", "magnésio", "eletrólitos"], weight: 1 }
    ],
    simplifications: ["Reversão no primeiro choque sincronizado é determinística.", "Perda de pulso aos 12 min e óbito são decisões didáticas."]
  },
  references: ["INT-AHA-ALS", "BR-SAMU-SAV", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 10, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Pás, acesso, sedação, cardioversão e eletrólitos", commands: [act(5, "monitorizar"), act(10, "pas_desfibrilador"), test(20, "ecg12"), act(30, "acesso_venoso"), act(130, "acesso_venoso"), rx(150, "midazolam", "amp15", 2, "mg", "IV"), act(180, "cardioversao_sincronizada", { energia: 100 }), test(200, "eletrolitos"), act(400, "medir_pa"), test(450, "ecg12"), dx(800, "tv_instavel"), dest(800, "uti")], runUntilSeconds: 1000, expect: [{ condition: { ruleFired: "r-cv" }, description: "reversão" }, { condition: { not: { ruleFired: "r-pulso-perdido" } }, description: "sem PCR" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 1400, expect: [{ condition: { ruleFired: "r-pulso-perdido" }, description: "perda de pulso" }, { condition: { ruleFired: "r-obito" }, description: "óbito" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Amiodarona em vez de choque", commands: [act(30, "acesso_venoso"), act(130, "acesso_venoso"), rx(200, "amiodarona", "amp150", 150, "mg", "IV")], runUntilSeconds: 900, expect: [{ condition: { ruleFired: "r-amiodarona" }, description: "sem reversão" }, { condition: { ruleFired: "r-pulso-perdido" }, description: "TV sem pulso" }] },
    { id: "t-atraso", kind: "delay", description: "Choque só após perda de pulso, com RCP", commands: [act(10, "monitorizar"), act(730, "rcp"), act(735, "pas_desfibrilador"), act(760, "desfibrilar", { energia: 200 })], runUntilSeconds: 1000, expect: [{ condition: { ruleFired: "r-pulso-perdido" }, description: "PCR" }, { condition: { ruleFired: "r-rosc" }, description: "RCE" }] },
    { id: "t-alternativa", kind: "alternative", description: "Cardioversão imediata sem sedação (paciente rebaixado)", commands: [act(5, "pas_desfibrilador"), act(30, "cardioversao_sincronizada", { energia: 100 })], runUntilSeconds: 300, expect: [{ condition: { ruleFired: "r-cv" }, description: "reversão" }, { condition: { ruleFired: "r-cv-sem-sedacao" }, description: "registro sem sedação" }] }
  ]
};
