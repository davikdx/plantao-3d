import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, obs, outcome, oxygenResponse, rx, staff, test, trend } from "./helpers";

const NORA = { treatmentActive: "noradrenalina" };
const DOBUTA = { treatmentActive: "dobutamina" };
const VOLUME_EXCESSO = { any: [{ drugGiven: "sf09", minTotal: { value: 750, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 750, unit: "mL" as const } }] };
const NITRATO = { any: [{ treatmentActive: "nitroglicerina" }, { drugGiven: "nitroglicerina" }] };

export const C002: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C002",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Dor no peito há horas, pressão baixa e falta de ar",
  teachingTitle: "Choque cardiogênico por IAM anterior extenso — perfil hemodinâmico, vasopressor, inotrópico e reperfusão",
  group: "Cardiologia",
  specialties: ["Cardiologia", "Emergência", "Terapia intensiva"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 4,
  level: "internato",
  objectives: [
    "Reconhecer choque com congestão (perfil frio e úmido)",
    "Evitar expansão volêmica liberal e vasodilatadores na hipotensão",
    "Iniciar vasopressor e considerar inotrópico para hipoperfusão",
    "Indicar estratégia invasiva urgente via regulação, independentemente do tempo de dor"
  ],
  keywords: ["dor no peito", "pressão baixa", "falta de ar", "infarto", "suor frio"],
  patient: {
    name: "Antônio Carlos Ribeiro",
    ageYears: 68,
    sex: "masculino",
    weightKg: 80,
    heightCm: 170,
    visual: { ageGroup: "idoso", sex: "masculino", skinTone: 1, hairStyle: "curto", hairColor: "grisalho", build: "robusto", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional sem hemodinâmica (referência com hemodinâmica a 45 km). Homem de 68 anos trazido pela família com dor no peito desde a madrugada (há cerca de 9 horas), agora com falta de ar e muito pálido.",
  communication: "normal",
  history: [
    h("h-queixa", "queixa", "O que o senhor está sentindo?", "Uma dor apertada no peito desde a madrugada… agora falta o ar.", { keywords: ["sentindo", "dor"] }),
    h("h-inicio", "inicio", "Quando a dor começou?", "Lá pelas 3 da manhã. Achei que era o estômago e fiquei em casa."),
    h("h-dispneia", "fatores_associados", "A falta de ar piora deitado?", "Piora muito, não consigo deitar.", { keywords: ["deitado", "falta de ar", "ortopneia"] }),
    h("h-urina", "fatores_associados", "Urinou hoje?", "Quase nada desde cedo.", { keywords: ["urinou", "xixi"] }),
    h("h-antecedentes", "antecedentes", "Tem alguma doença?", "Diabetes e pressão alta. Já tive um infarto há 5 anos, fiz cateterismo.", { keywords: ["doença", "infarto"] }),
    h("h-medicacoes", "medicacoes", "Que remédios usa? Usou remédio para ereção?", "Metformina, AAS e atenolol. Remédio de ereção, não.", { keywords: ["remédio", "sildenafila"] }),
    h("h-alergias", "alergias", "Tem alergia?", "Não.")
  ],
  initial: {
    vars: { hr: 116, sbp: 78, dbp: 50, rr: 30, spo2: 87, temp: 35.9, gcs: 14, pain: 6, glucose: 198, perfusion: 0.35, effort: 0.75, lactate: 5.2, urine: 10, k: 4.8, na: 135, creat: 1.6, urea: 68, hb: 13.4, plt: 210000, inr: 1.1, trop: 9800, ph: 7.29, pco2: 32, hco3: 15, be: -10 },
    flags: { rhythm: "sinusal_supra", sweating: true, pallor: true, posture: "fowler", painVisual: "moderada", speech: "palavras", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Pálido, sudoreico, extremidades frias e moteadas; sentado, taquipneico.", { better: [{ when: { ruleFired: "r-perfusao" }, text: "Extremidades mais quentes; menos sudoreico." }] }),
    ex("e-jugular", "pescoco", "inspecao", "Turgência jugular a 45°.", { label: "Jugulares" }),
    ex("e-pulmao", "torax_posterior", "ausculta", "Estertores crepitantes até terço médio bilateralmente.", { sound: "estertores", better: [{ when: { ruleFired: "r-volume-eap" }, text: "Estertores até os ápices; espuma rósea na boca." }] }),
    ex("e-coracao", "coracao", "ausculta", "Taquicárdico, B3 presente, sopro sistólico suave em foco mitral.", { sound: "b3" }),
    ex("e-perfusao", "membro_superior_d", "palpacao", "Pulsos finos; tempo de enchimento capilar 5 s.", { label: "Pulsos e enchimento capilar", better: [{ when: { ruleFired: "r-perfusao" }, text: "Pulsos mais cheios; enchimento capilar 3 s." }] })
  ],
  testResults: [
    { testId: "ecg12", variants: [{ text: "Taquicardia sinusal 116 bpm; supradesnivelamento de ST de V1 a V6 e DI/aVL, com ondas Q em V1–V4. IAM anterior extenso em evolução.", ecg: { rhythm: "sinusal_supra", rate: 116, stElevationLeads: ["V1", "V2", "V3", "V4", "V5", "V6", "DI", "aVL"], stDepressionLeads: ["DII", "DIII", "aVF"], peakedT: false, wideQrs: false } }] },
    { testId: "pocus_cardiaco", variants: [{ text: "VE com acinesia anterior e apical, fração de ejeção visualmente muito reduzida; sem derrame pericárdico; VCI dilatada sem variação respiratória; linhas B difusas. (Laudo educativo.)" }] },
    { testId: "rx_torax", variants: [{ text: "Congestão pulmonar com infiltrado peri-hilar bilateral (padrão em asa de borboleta). (Laudo educativo.)" }] }
  ],
  highlightedActions: ["monitorizar", "acesso_venoso", "o2_mascara_reservatorio", "acionar_samu", "diurese_horaria"],
  rules: [
    oxygenResponse(93, 120),
    { id: "r-nora", description: "Noradrenalina eleva a PA (PAM ≥ 65) enquanto em infusão", priority: 50, when: NORA, repeat: "while", effects: [trend("sbp", 98, 180, "nora", 50), trend("dbp", 60, 180, "nora", 50)], onEnd: [{ type: "clearTrend", var: "sbp", slot: "nora" }, { type: "clearTrend", var: "dbp", slot: "nora" }] },
    { id: "r-perfusao", description: "Vasopressor + inotrópico melhoram a perfusão e o lactato", priority: 55, when: { all: [NORA, DOBUTA, { elapsedSince: "drug:dobutamina", op: "gte", seconds: 600 }] }, repeat: "once", effects: [trend("perfusion", 0.65, 600, "inot", 55), trend("lactate", 2.8, 1800, "inot", 55), trend("urine", 40, 900, "inot", 55), flag("sweating", false), outcome("estabilizacao_parcial")] },
    { id: "r-dobuta-isolada", description: "Dobutamina sem vasopressor em hipotensão: queda pressórica", priority: 45, when: { all: [DOBUTA, { not: NORA }] }, repeat: "once", effects: [trend("sbp", 68, 120, "dobu", 45, 600), trend("hr", 132, 120, "dobu", 45, 600), staff("enfermagem", "A pressão caiu mais depois da dobutamina.")] },
    { id: "r-volume-eap", description: "Expansão volêmica liberal com congestão: edema agudo de pulmão", priority: 80, when: VOLUME_EXCESSO, repeat: "once", effects: [trend("spo2", 78, 300, "eap", 80), trend("rr", 38, 300, "eap", 80), trend("effort", 0.95, 300, "eap", 80), flag("speech", "palavras"), staff("enfermagem", "Ele está espumando e a saturação despencou!"), outcome("complicacao")] },
    { id: "r-nitrato", description: "Nitrato em hipotensão: queda grave da PA", priority: 85, when: NITRATO, repeat: "once", effects: [trend("sbp", 60, 120, "ntg", 85, 900), flag("consciousness", "voz"), staff("enfermagem", "A pressão ficou 60 de sistólica depois do nitrato!"), outcome("complicacao")] },
    { id: "r-furo", description: "Furosemida em hipotensão sem vasopressor: pouco efeito e risco", when: { all: [{ drugGiven: "furosemida" }, { not: NORA }] }, repeat: "once", effects: [obs("Diurese mínima após furosemida: com hipoperfusão renal, o diurético tem pouco efeito antes de restaurar a perfusão.")] },
    { id: "r-piora", description: "Sem vasopressor em 20 min: hipoperfusão progressiva", priority: 30, when: { all: [{ time: "gte", seconds: 1200 }, { not: NORA }] }, repeat: "once", effects: [trend("sbp", 64, 300, "piora", 30), trend("dbp", 40, 300, "piora", 30), trend("lactate", 8, 900, "piora", 30), trend("perfusion", 0.2, 300, "piora", 30), flag("consciousness", "voz"), staff("enfermagem", "Ele está ficando confuso e a pressão não sobe."), outcome("piora")] },
    { id: "r-pcr", description: "Sem vasopressor em 40 min: PCR em FV", priority: 100, when: { all: [{ time: "gte", seconds: 2400 }, { not: NORA }] }, repeat: "once", effects: [flag("rhythm", "fv"), flag("pulse", false), { type: "setValue", var: "sbp", value: 0 }, { type: "setValue", var: "dbp", value: 0 }, flag("consciousness", "irresponsivo"), staff("enfermagem", "Parou! Monitor em fibrilação ventricular."), outcome("parada", true)] },
    { id: "r-regulacao", description: "Regulação aceita para estratégia invasiva", when: { actionCompleted: "acionar_samu" }, repeat: "once", effects: [staff("regulacao", "Regulação: choque cardiogênico por IAM — hemodinâmica de referência aceita para cateterismo de emergência. USA chega em 25 min; manter vasopressor durante o transporte.")] }
  ],
  diagnosis: { primary: "choque_cardiogenico", accepted: ["choque_cardiogenico", "iamcsst"], differentials: ["iamcsst", "choque_septico", "tep", "tamponamento", "disseccao_aorta", "eap_hipertensivo"] },
  acceptedDestinations: ["transferencia_regulada"],
  outcomeNotes: "Perfil frio e úmido: noradrenalina para PAM ≥ 65 e dobutamina para hipoperfusão (após restaurar PA). Volume liberal precipita EAP; nitrato e diurético antes de restaurar a perfusão são deletérios. Choque cardiogênico por IAM indica estratégia invasiva de emergência via regulação, mesmo após 9 h de dor.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Tempo de dor, ortopneia e diurese", evidence: { kind: "historyAsked", items: ["h-inicio", "h-dispneia", "h-urina"], minCount: 2 }, points: 6, severity: "importante", rationale: "Tempo de evolução e sinais de congestão/hipoperfusão." },
    { id: "s-exame", domain: "historia", description: "Avaliou perfusão e congestão (jugulares, pulmões, extremidades)", evidence: { kind: "examDone", regions: ["pescoco", "torax_posterior", "membro_superior_d"], minCount: 2 }, points: 8, severity: "critica", rationale: "Classificação clínica (quente/frio, seco/úmido) guia a terapia.", sourceIds: ["INT-ESC-IC-2021"] },
    { id: "s-ecg", domain: "priorizacao", description: "ECG em até 10 minutos", evidence: { kind: "testOrdered", anyOf: ["ecg12"], withinSeconds: 600 }, points: 8, severity: "critica", rationale: "Identifica IAM como causa do choque.", sourceIds: ["INT-ESC-SCA-2023"] },
    { id: "s-monitor", domain: "priorizacao", description: "Monitorização e acesso", evidence: { kind: "actionDone", anyOf: ["monitorizar"], withinSeconds: 300 }, points: 4, severity: "importante", rationale: "Risco de arritmia e PCR." },
    { id: "s-pocus", domain: "exames", description: "POCUS cardíaco (função, derrame, VCI, linhas B)", evidence: { kind: "testOrdered", anyOf: ["pocus_cardiaco"] }, points: 7, severity: "importante", rationale: "Confirma disfunção do VE e exclui tamponamento." },
    { id: "s-exames", domain: "exames", description: "Exames dirigidos", evidence: { kind: "testsNotExcessive", maxUnjustified: 1, justified: ["ecg12", "pocus_cardiaco", "rx_torax", "troponina", "gaso_venosa", "gaso_arterial", "eletrolitos", "funcao_renal", "hemograma", "coagulograma"] }, points: 8, severity: "menor", rationale: "Lactato, função renal e eletrólitos acompanham a perfusão." },
    { id: "s-nora", domain: "tratamento", description: "Noradrenalina em até 15 minutos", evidence: { kind: "drugGiven", anyOf: ["noradrenalina"], withinSeconds: 900 }, points: 10, severity: "critica", rationale: "Vasopressor de escolha para restaurar PAM no choque cardiogênico.", sourceIds: ["INT-ESC-IC-2021"] },
    { id: "s-dobuta", domain: "tratamento", description: "Inotrópico para hipoperfusão persistente", evidence: { kind: "drugGiven", anyOf: ["dobutamina"] }, points: 5, severity: "importante", rationale: "Aumenta débito em baixo débito com hipoperfusão.", sourceIds: ["INT-ESC-IC-2021"] },
    { id: "s-aas", domain: "tratamento", description: "Antiagregação (AAS)", evidence: { kind: "drugGiven", anyOf: ["aas"] }, points: 4, severity: "importante", rationale: "SCA com supra.", sourceIds: ["INT-ESC-SCA-2023"] },
    { id: "s-volume", domain: "tratamento", description: "Falha: expansão volêmica liberal com congestão", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-volume-eap" } }, points: 8, penalty: true, severity: "critica", rationale: "VCI dilatada, estertores e turgência: sem resposta a volume." },
    { id: "s-nitrato", domain: "tratamento", description: "Falha: nitrato em hipotensão", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-nitrato" } }, points: 8, penalty: true, severity: "critica", rationale: "Vasodilatadores são contraindicados com PAS < 90." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou PA e diurese após vasopressor", evidence: { kind: "reassessAfter", after: ["noradrenalina"], reassess: ["medir_pa", "diurese_horaria", "gaso_venosa", "gaso_arterial"], withinSeconds: 1800 }, points: 10, severity: "importante", rationale: "Metas: PAM ≥ 65, diurese, lactato." },
    { id: "s-regulacao", domain: "destino", description: "Acionou regulação para estratégia invasiva", evidence: { kind: "actionDone", anyOf: ["acionar_samu"], withinSeconds: 1800 }, points: 4, severity: "importante", rationale: "Cateterismo de emergência no choque cardiogênico por IAM.", sourceIds: ["INT-ESC-SCA-2023"] },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de choque cardiogênico", evidence: { kind: "diagnosis", accepted: ["choque_cardiogenico", "iamcsst"] }, points: 3, severity: "importante", rationale: "Hipotensão com hipoperfusão e congestão por falência do VE." },
    { id: "s-destino", domain: "destino", description: "Transferência regulada para hemodinâmica", evidence: { kind: "disposition", accepted: ["transferencia_regulada"] }, points: 3, severity: "importante", rationale: "Hospital sem hemodinâmica." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Ele está quente ou frio? Seco ou úmido?" },
      { level: 2, text: "Há sinais de que volume vai piorar a oxigenação?" },
      { level: 3, text: "Restaure a pressão antes de pensar em débito; depois, melhore o débito." },
      { level: 4, text: "Sugestão explícita: monitor, ECG, O₂, acesso, noradrenalina, dobutamina se hipoperfusão persistir, AAS, regulação para cateterismo de emergência." }
    ],
    summary: "Homem de 68 anos com IAM anterior extenso há 9 h, hipotensão, hipoperfusão (lactato 5,2, oligúria, extremidades frias) e congestão pulmonar.",
    pathophysiology: "A perda de grande massa de miocárdio do VE reduz o débito; a hipotensão diminui a perfusão coronariana, piorando a isquemia (espiral). A pressão de enchimento elevada gera congestão pulmonar. Vasopressor restaura a pressão de perfusão; inotrópico aumenta o débito; a revascularização é o tratamento da causa.",
    keyPoints: [
      "Choque cardiogênico: hipotensão + hipoperfusão, geralmente com congestão (frio e úmido).",
      "Noradrenalina para PAM ≥ 65; dobutamina se baixo débito persistir.",
      "Evitar volume liberal, nitratos e diuréticos antes de restaurar a perfusão.",
      "Revascularização de emergência independe do tempo de dor no choque cardiogênico.",
      "Metas: PAM, diurese, lactato, perfusão periférica."
    ],
    alternatives: ["Suporte circulatório mecânico em centros de referência (não modelado)."],
    oralRubric: [
      { id: "o1", concept: "Perfil frio e úmido", synonyms: ["frio", "úmido", "congestão", "hipoperfusão"], weight: 2 },
      { id: "o2", concept: "Vasopressor", synonyms: ["noradrenalina", "vasopressor"], weight: 3 },
      { id: "o3", concept: "Inotrópico", synonyms: ["dobutamina", "inotrópico"], weight: 2 },
      { id: "o4", concept: "Evitar volume/nitrato", synonyms: ["volume", "nitrato", "soro"], weight: 1 },
      { id: "o5", concept: "Cateterismo de emergência", synonyms: ["cateterismo", "angioplastia", "hemodinâmica", "revascularização"], weight: 2 }
    ],
    simplifications: ["Respostas a vasopressor e inotrópico são determinísticas e não dependem da dose exata.", "PCR aos 40 min sem vasopressor é decisão didática do autor.", "Limiar de 750 mL para EAP é simplificação."]
  },
  references: ["INT-ESC-IC-2021", "INT-ESC-SCA-2023", "BR-SAMU", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 8, allowSexSwap: true, allowWeightPercent: 10, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "ECG, O₂, noradrenalina, dobutamina, AAS e regulação", commands: [act(5, "monitorizar"), test(20, "ecg12"), act(30, "o2_mascara_reservatorio"), act(60, "acesso_venoso"), act(160, "acesso_venoso"), test(200, "pocus_cardiaco"), rx(300, "noradrenalina", "sol64", 1, "mg", "IV", "infusao", { rate: { value: 0.1, unit: "mcg/kg/min" } }), rx(400, "aas", "cp100", 300, "mg", "VO"), act(500, "acionar_samu"), rx(900, "dobutamina", "sol1000", 250, "mg", "IV", "infusao", { rate: { value: 5, unit: "mcg/kg/min" } }), act(1000, "medir_pa"), act(1100, "diurese_horaria"), dx(2000, "choque_cardiogenico"), dest(2000, "transferencia_regulada")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-perfusao" }, description: "perfusão melhora" }, { condition: { not: { ruleFired: "r-pcr" } }, description: "sem PCR" }, { condition: { path: "vars.sbp", op: "gte", value: 90 }, description: "PAS ≥ 90" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 2500, expect: [{ condition: { ruleFired: "r-piora" }, description: "piora" }, { condition: { ruleFired: "r-pcr" }, description: "PCR" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Soro 1 L rápido", commands: [act(10, "acesso_venoso"), act(110, "acesso_venoso"), rx(200, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 15 })], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-volume-eap" }, description: "EAP" }] },
    { id: "t-atraso", kind: "delay", description: "Noradrenalina só aos 25 min", commands: [act(10, "acesso_venoso"), act(110, "acesso_venoso"), rx(1500, "noradrenalina", "sol64", 1, "mg", "IV", "infusao", { rate: { value: 0.1, unit: "mcg/kg/min" } })], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-piora" }, description: "piora pelo atraso" }, { condition: { not: { ruleFired: "r-pcr" } }, description: "PCR evitada" }] },
    { id: "t-erro-dobuta", kind: "inadequate", description: "Dobutamina sem vasopressor", commands: [act(10, "acesso_venoso"), act(110, "acesso_venoso"), rx(200, "dobutamina", "sol1000", 250, "mg", "IV", "infusao", { rate: { value: 5, unit: "mcg/kg/min" } })], runUntilSeconds: 600, expect: [{ condition: { ruleFired: "r-dobuta-isolada" }, description: "queda da PA" }] },
    { id: "t-alternativa", kind: "alternative", description: "Noradrenalina e regulação, sem inotrópico", commands: [act(5, "monitorizar"), test(20, "ecg12"), act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(300, "noradrenalina", "sol64", 1, "mg", "IV", "infusao", { rate: { value: 0.1, unit: "mcg/kg/min" } }), act(400, "acionar_samu")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-nora" }, description: "PA restaurada" }, { condition: { not: { ruleFired: "r-pcr" } }, description: "sem PCR" }] }
  ]
};
