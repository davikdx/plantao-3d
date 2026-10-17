import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const BENZO = { any: [{ drugGiven: "diazepam" }, { drugGiven: "midazolam" }] };
const NITRATO = { drugGiven: "nitroglicerina" };
const BETABLOQ = { any: [{ drugGiven: "metoprolol" }, { drugGiven: "propranolol" }] };

export const C092: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C092",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Jovem agitado com dor no peito e coração disparado depois de uma festa",
  teachingTitle: "Dor torácica associada à cocaína — ECG/troponina, benzodiazepínico como primeira linha, AAS e nitrato, evitar betabloqueador e observar 9–12 h",
  group: "Toxicologia",
  specialties: ["Toxicologia", "Cardiologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "upa-porte-ii",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Perguntar ativamente sobre uso de substâncias na dor torácica do jovem, sem julgamento",
    "ECG em até 10 minutos e troponina seriada",
    "Benzodiazepínico IV como primeira linha (agitação, taquicardia, hipertensão e dor)",
    "AAS e nitrato se dor persistente; não usar betabloqueador na fase aguda",
    "Observação de 9–12 h se ECG não diagnóstico e troponinas normais; abordagem do uso"
  ],
  keywords: ["dor no peito", "agitação", "festa", "coração acelerado", "suor"],
  patient: {
    name: "Thiago Moreira",
    ageYears: 27,
    sex: "masculino",
    weightKg: 72,
    heightCm: 178,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 2, hairStyle: "curto", hairColor: "castanho", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "UPA 24h, sala vermelha, 3 h da manhã. Homem de 27 anos trazido por amigos de uma festa com dor no peito em aperto há 40 minutos, muito agitado e suando.",
  communication: "limitada",
  informants: [{ id: "paciente", name: "Thiago", role: "Paciente" }, { id: "amigo", name: "Rafael", role: "Amigo" }],
  history: [
    hi("h-dor", "localizacao", "Como é a dor? Irradia?", [{ source: "paciente", text: "Aperto no meio do peito, vai para o braço esquerdo... tô sentindo que vou morrer." }], ["dor", "aperto", "irradia"]),
    hi("h-substancia", "habitos", "Usou alguma substância hoje? Álcool, cocaína, outras? Vou perguntar para te tratar com segurança.", [{ source: "paciente", text: "...Cheirei pó, umas duas carreiras, faz uma hora. E bebi cerveja." }, { source: "amigo", text: "Ele nunca tinha passado mal assim." }], ["substância", "droga", "cocaína", "pó", "usou", "álcool"]),
    hi("h-energetico", "medicacoes", "Toma algum remédio ou usou estimulante, energético, remédio para disfunção erétil?", [{ source: "paciente", text: "Energético. Remédio de ereção não." }], ["remédio", "ereção", "sildenafila", "energético"]),
    hi("h-antecedentes", "antecedentes", "Tem pressão alta, problema no coração, colesterol? Família?", [{ source: "paciente", text: "Fumo meio maço. Meu pai infartou com 50." }], ["pressão", "coração", "família", "fumo"]),
    hi("h-alarme", "sinais_alarme", "Dor rasgando nas costas, falta de ar, desmaio, convulsão?", [{ source: "paciente", text: "Não rasga para as costas. Um pouco de falta de ar." }], ["costas", "rasgando", "desmaio", "convulsão"])
  ],
  initial: {
    vars: { hr: 128, sbp: 178, dbp: 104, rr: 24, spo2: 97, temp: 37.9, gcs: 15, pain: 8, glucose: 112, perfusion: 0.85, effort: 0.3, trop: 6 },
    flags: { rhythm: "taquicardia_sinusal", sweating: true, agitation: true, tremor: true, posture: "sentado", painVisual: "intensa", speech: "frases", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-olhos", "olhos", "inspecao", "Midríase bilateral, fotorreagente.", { label: "Pupilas" }),
    ex("e-pele", "pele", "inspecao", "Sudorese, pele quente; tremor fino.", { label: "Pele", better: [{ when: BENZO, text: "Menos sudorese; mais calmo." }] }),
    ex("e-coracao", "coracao", "ausculta", "Taquicárdico, bulhas normais, sem sopros.", { sound: "bulhas_normais" }),
    ex("e-torax", "torax_anterior", "ausculta", "Murmúrio vesicular presente bilateralmente, sem ruídos adventícios.", { sound: "murmurio_normal" }),
    ex("e-pulsos", "membro_superior_d", "palpacao", "Pulsos radiais simétricos; PA semelhante nos dois braços.", { label: "Pulsos (simetria)" }),
    ex("e-nariz", "boca", "inspecao", "Resíduo de pó branco em narina direita; mucosa nasal hiperemiada.", { label: "Nariz/boca" })
  ],
  testResults: [
    { testId: "ecg12", variants: [{ when: { ruleFired: "r-isquemia" }, text: "Taquicardia sinusal 140 bpm; infradesnivelamento de ST de 1,5 mm em V4–V6 — isquemia." }, { text: "Taquicardia sinusal 128 bpm; sem supra ou infra de ST; QRS e QTc normais (não diagnóstico)." }] },
    { testId: "rx_torax", variants: [{ text: "Sem alterações; mediastino de largura normal." }] }
  ],
  highlightedActions: ["monitorizar", "acesso_venoso", "escuta_qualificada"],
  rules: [
    { id: "r-curso", description: "Toxicidade simpaticomimética mantida", priority: 10, when: { always: true }, repeat: "once", effects: [trend("hr", 142, 1200, "inv", 10), trend("sbp", 192, 1200, "inv", 10), trend("temp", 38.3, 1800, "inv", 10)] },
    { id: "r-benzo", description: "Benzodiazepínico: sedação e melhora hemodinâmica", priority: 30, when: BENZO, repeat: "once", effects: [trend("hr", 102, 600, "bz", 30), trend("sbp", 150, 600, "bz", 30), trend("dbp", 90, 600, "bz", 30), trend("temp", 37.4, 1800, "bz", 30), trend("pain", 4, 600, "bz", 30), flag("agitation", false), flag("tremor", false), staff("enfermagem", "Ele está mais calmo; a dor melhorou um pouco.")] },
    { id: "r-nitrato", description: "Nitrato: alívio da dor e da hipertensão", priority: 35, when: { all: [NITRATO, BENZO] }, repeat: "once", effects: [trend("pain", 1, 600, "ntg", 35), trend("sbp", 132, 600, "ntg", 35), outcome("melhora")] },
    { id: "r-isquemia", description: "Vasoespasmo coronariano sem tratamento", priority: 40, when: { all: [{ time: "gte", seconds: 1500 }, { not: BENZO }] }, repeat: "once", effects: [trend("trop", 160, 2400, "isq", 40), trend("pain", 9, 300, "isq", 40), staff("enfermagem", "A dor piorou e o monitor mostra alteração no traçado!"), outcome("piora")] },
    { id: "r-betabloq", description: "Betabloqueador na fase aguda: alfa sem oposição", priority: 50, when: BETABLOQ, repeat: "once", effects: [trend("sbp", 210, 300, "bb", 50), trend("pain", 9, 300, "bb", 50), obs("Betabloqueador na intoxicação aguda por cocaína deixa o efeito alfa-adrenérgico sem oposição: mais vasoconstrição coronariana e hipertensão."), outcome("complicacao")] },
    { id: "r-alta", description: "Alta precoce", priority: 45, when: { any: [{ path: "disposition", op: "eq", value: "alta_orientada" }, { path: "disposition", op: "eq", value: "alta_com_seguimento_ubs" }] }, repeat: "once", effects: [obs("Dor torácica associada à cocaína exige troponinas seriadas e observação de 9–12 h antes da alta."), outcome("complicacao")] }
  ],
  diagnosis: { primary: "intox_estimulante", accepted: ["intox_estimulante"], differentials: ["iamssst", "iamcsst", "disseccao_aorta", "crise_ansiedade", "pericardite"] },
  acceptedDestinations: ["observacao", "transferencia_regulada"],
  outcomeNotes: "Toxicidade simpaticomimética por cocaína com dor torácica, ECG não diagnóstico e troponina inicial normal. Monitorização, ECG em 10 min, benzodiazepínico IV, AAS, nitroglicerina se dor persistente, sem betabloqueador; troponina seriada, observação 9–12 h e abordagem do uso de substâncias. ECG isquêmico/troponina elevada: SCA com regulação para referência.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Uso de substâncias e características da dor", evidence: { kind: "historyAsked", items: ["h-substancia", "h-dor"], minCount: 2 }, points: 10, severity: "critica", rationale: "Muda a terapêutica (benzodiazepínico, evitar betabloqueador).", sourceIds: ["INT-AHA-COCAINA-2008"] },
    { id: "s-alarme", domain: "historia", description: "Sinais de dissecção/complicação", evidence: { kind: "historyAsked", items: ["h-alarme", "h-energetico"], minCount: 1 }, points: 4, severity: "importante", rationale: "Dissecção de aorta e interação com inibidor de PDE-5 (nitrato)." },
    { id: "s-ecg", domain: "priorizacao", description: "ECG em até 10 min", evidence: { kind: "testOrdered", anyOf: ["ecg12"], withinSeconds: 600 }, points: 12, severity: "critica", rationale: "Excluir IAMCSST.", sourceIds: ["INT-ESC-SCA-2023"] },
    { id: "s-mon", domain: "priorizacao", description: "Monitorização e acesso", evidence: { kind: "actionDone", anyOf: ["monitorizar"], withinSeconds: 300 }, points: 4, severity: "importante", rationale: "Arritmias." },
    { id: "s-benzo", domain: "tratamento", description: "Benzodiazepínico IV", evidence: { kind: "drugGiven", anyOf: ["diazepam", "midazolam"], withinSeconds: 1200 }, points: 18, severity: "critica", rationale: "Primeira linha (classe I).", sourceIds: ["INT-AHA-COCAINA-2008"] },
    { id: "s-aas", domain: "tratamento", description: "AAS", evidence: { kind: "drugGiven", anyOf: ["aas"], withinSeconds: 1800 }, points: 8, severity: "importante", rationale: "Tratar como possível SCA.", sourceIds: ["INT-AHA-COCAINA-2008"] },
    { id: "s-ntg", domain: "tratamento", description: "Nitrato para dor persistente", evidence: { kind: "drugGiven", anyOf: ["nitroglicerina"] }, points: 6, severity: "importante", rationale: "Vasodilatação coronariana.", sourceIds: ["INT-AHA-COCAINA-2008"] },
    { id: "s-trop", domain: "exames", description: "Troponina", evidence: { kind: "testOrdered", anyOf: ["troponina"], withinSeconds: 1200 }, points: 8, severity: "importante", rationale: "Seriada para estratificar." },
    { id: "s-bb", domain: "tratamento", description: "Não usou betabloqueador na fase aguda", evidence: { kind: "avoidDrug", anyOf: ["metoprolol", "propranolol"] }, points: 8, severity: "critica", rationale: "Classe III na fase aguda.", sourceIds: ["INT-AHA-COCAINA-2008"] },
    { id: "s-isq", domain: "priorizacao", description: "Falha: isquemia por atraso", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-isquemia" } }, points: 8, penalty: true, severity: "importante", rationale: "Benzodiazepínico tardio." },
    { id: "s-escuta", domain: "reavaliacao", description: "Abordagem do uso de substâncias", evidence: { kind: "actionDone", anyOf: ["escuta_qualificada", "decisao_compartilhada"] }, points: 6, severity: "importante", rationale: "Cessar cocaína é o principal fator de prevenção.", sourceIds: ["INT-AHA-COCAINA-2008"] },
    { id: "s-dx", domain: "destino", description: "Toxicidade por estimulante", evidence: { kind: "diagnosis", accepted: ["intox_estimulante"] }, points: 8, severity: "importante", rationale: "Síndrome simpaticomimética." },
    { id: "s-destino", domain: "destino", description: "Observação 9–12 h (ou regulação se isquemia)", evidence: { kind: "disposition", accepted: ["observacao", "transferencia_regulada"] }, points: 8, severity: "importante", rationale: "Troponina seriada.", sourceIds: ["INT-AHA-COCAINA-2008"] }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Pupilas dilatadas, suor, taquicardia e hipertensão em jovem na madrugada: pergunte sobre substâncias." },
      { level: 2, text: "Qual exame em até 10 minutos?" },
      { level: 3, text: "Qual classe trata agitação, taquicardia e dor ao mesmo tempo? E qual classe evitar?" },
      { level: 4, text: "Sugestão explícita: monitor, ECG, acesso, diazepam IV, AAS, troponina, nitroglicerina se dor persistir, sem betabloqueador, observação." }
    ],
    summary: "Dor torácica associada à cocaína com toxidrome simpaticomimética, sem IAM no início.",
    pathophysiology: "A cocaína bloqueia a recaptação de noradrenalina, dopamina e serotonina: taquicardia, hipertensão, vasoconstrição coronariana (alfa), aumento do consumo de O2, agregação plaquetária e trombose. Betabloqueio deixa o efeito alfa sem oposição. Benzodiazepínicos reduzem o tônus simpático central.",
    keyPoints: [
      "Perguntar sobre cocaína em toda dor torácica de jovem.",
      "Benzodiazepínico IV é primeira linha; AAS e nitrato como na SCA.",
      "Evitar betabloqueador (inclusive labetalol) na fase aguda.",
      "Bloqueador de cálcio ou fentolamina se refratário.",
      "ECG não diagnóstico e troponinas normais: observar 9–12 h; aconselhar cessação."
    ],
    alternatives: ["Midazolam IV em vez de diazepam.", "Bloqueador de canal de cálcio se não responder a benzodiazepínico e nitrato."],
    oralRubric: [
      { id: "o1", concept: "Benzodiazepínico", synonyms: ["benzodiazepínico", "diazepam", "midazolam"], weight: 3 },
      { id: "o2", concept: "Evitar betabloqueador", synonyms: ["betabloqueador", "alfa sem oposição", "metoprolol"], weight: 3 },
      { id: "o3", concept: "ECG/troponina", synonyms: ["ecg", "troponina", "seriada"], weight: 2 },
      { id: "o4", concept: "Observação 9–12 h", synonyms: ["observação", "9 a 12", "unidade de dor torácica"], weight: 1 },
      { id: "o5", concept: "Cessação", synonyms: ["parar", "cessar", "aconselhamento", "caps ad"], weight: 1 }
    ],
    simplifications: ["Doses de benzodiazepínico para toxicidade por cocaína não cadastradas: o simulador alerta faixa.", "Nitrato sublingual não está no catálogo (usar nitroglicerina IV)."]
  },
  references: ["INT-AHA-COCAINA-2008", "INT-ESC-SCA-2023", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 8, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "História com substâncias, monitor, ECG, diazepam, AAS, troponina, NTG, escuta, observação", commands: [ask(10, "h-dor"), ask(20, "h-substancia"), ask(30, "h-alarme"), act(40, "monitorizar"), test(50, "ecg12"), act(60, "acesso_venoso"), rx(200, "diazepam", "amp10", 10, "mg", "IV"), rx(260, "aas", "cp100", 300, "mg", "VO"), test(300, "troponina"), rx(900, "nitroglicerina", "sol200", 1, "mg", "IV", "infusao", { rate: { value: 10, unit: "mcg/min" } }), act(1200, "escuta_qualificada"), dx(2000, "intox_estimulante"), dest(2400, "observacao")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-benzo" }, description: "benzodiazepínico" }, { condition: { ruleFired: "r-nitrato" }, description: "nitrato" }, { condition: { not: { ruleFired: "r-isquemia" } }, description: "sem isquemia" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-isquemia" }, description: "isquemia" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Metoprolol para a taquicardia e alta", commands: [act(30, "monitorizar"), act(40, "acesso_venoso"), rx(150, "metoprolol", "amp5", 5, "mg", "IV"), dest(1000, "alta_orientada")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-betabloq" }, description: "betabloqueador" }, { condition: { ruleFired: "r-alta" }, description: "alta precoce" }] },
    { id: "t-atraso", kind: "delay", description: "Benzodiazepínico tardio após isquemia; regulação", commands: [act(30, "monitorizar"), test(700, "ecg12"), act(800, "acesso_venoso"), rx(1700, "diazepam", "amp10", 10, "mg", "IV"), test(1800, "troponina"), test(2000, "ecg12"), dest(2800, "transferencia_regulada")], runUntilSeconds: 3200, expect: [{ condition: { ruleFired: "r-isquemia" }, description: "isquemia" }, { condition: { ruleFired: "r-benzo" }, description: "benzo tardio" }] },
    { id: "t-alternativa", kind: "alternative", description: "Midazolam IV e AAS; observação", commands: [ask(10, "h-substancia"), act(20, "monitorizar"), test(30, "ecg12"), act(40, "acesso_venoso"), rx(150, "midazolam", "amp15", 5, "mg", "IV"), rx(200, "aas", "cp100", 200, "mg", "VO"), test(250, "troponina"), act(900, "decisao_compartilhada"), dest(2000, "observacao")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-benzo" }, description: "benzodiazepínico" }, { condition: { not: { ruleFired: "r-isquemia" } }, description: "sem isquemia" }] }
  ]
};
