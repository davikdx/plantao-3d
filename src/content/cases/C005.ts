import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const PERICARDIO = { actionCompleted: "pericardiocentese" };
const VOLUME = { any: [{ drugGiven: "sf09", minTotal: { value: 250, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 250, unit: "mL" as const } }] };

export const C005: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C005",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Paciente piora de repente depois de um procedimento no coração",
  teachingTitle: "Tamponamento cardíaco após perfuração por eletrodo de marca-passo — choque obstrutivo e pericardiocentese",
  group: "Reanimação, instabilidade e choque",
  specialties: ["Emergência", "Cardiologia", "Terapia intensiva"],
  environment: "emergencia",
  resourceProfile: "hospital-referencia",
  difficulty: 4,
  level: "residencia",
  objectives: [
    "Reconhecer choque obstrutivo após procedimento intracardíaco",
    "Usar POCUS para identificar derrame com colapso de câmaras",
    "Usar volume como ponte e evitar diuréticos/vasodilatadores",
    "Indicar pericardiocentese de emergência",
    "Reconhecer AESP por tamponamento e tratar a causa"
  ],
  keywords: ["piorou", "pressão baixa", "procedimento", "marca-passo", "falta de ar"],
  patient: {
    name: "Benedito Ramos",
    ageYears: 74,
    sex: "masculino",
    weightKg: 68,
    heightCm: 166,
    visual: { ageGroup: "idoso", sex: "masculino", skinTone: 4, hairStyle: "careca", hairColor: "branco", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "Sala de emergência de hospital de referência. Homem de 74 anos que recebeu marca-passo transvenoso temporário por BAV total há 3 horas. A enfermagem chama: está agitado, com falta de ar e PA caindo.",
  communication: "limitada",
  informants: [{ id: "enf", name: "Enfermeira Rita", role: "Enfermeira da emergência" }],
  history: [
    hi("h-evento", "queixa", "O que mudou?", [{ source: "enf", text: "Há 20 minutos começou a ficar inquieto, com falta de ar. A PA era 128/70 e agora está 84/62." }], ["mudou", "aconteceu"]),
    hi("h-procedimento", "antecedentes", "Como foi o procedimento do marca-passo?", [{ source: "prontuario", text: "Implante de eletrodo temporário pela jugular interna direita; ponta do eletrodo no ápice do VD; captura com limiar baixo. Raio-X pós-procedimento não realizado ainda." }], ["procedimento", "marca-passo", "eletrodo"]),
    hi("h-anticoag", "medicacoes", "Ele recebeu anticoagulante?", [{ source: "prontuario", text: "Enoxaparina profilática pela manhã." }], ["anticoagulante", "heparina", "enoxaparina"]),
    hi("h-dor", "fatores_associados", "Teve dor no peito?", [{ source: "paciente", text: "Dói um pouco no peito… falta ar…" }], ["dor", "peito"])
  ],
  initial: {
    vars: { hr: 118, sbp: 84, dbp: 62, rr: 28, spo2: 92, temp: 36.6, gcs: 14, pain: 4, glucose: 128, perfusion: 0.4, effort: 0.5, lactate: 3.6, hb: 12.1 },
    flags: { rhythm: "sinusal", sweating: true, agitation: true, posture: "fowler", painVisual: "moderada", speech: "palavras", consciousness: "alerta", communication: "limitada" },
    devices: ["monitor_ecg", "oximetro", "manguito", "acesso_periferico", "acesso_central"],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-jugular", "pescoco", "inspecao", "Turgência jugular importante, mesmo sentado.", { label: "Jugulares", better: [{ when: PERICARDIO, text: "Jugulares menos distendidas." }] }),
    ex("e-coracao", "coracao", "ausculta", "Bulhas abafadas.", { sound: "bulhas_abafadas", better: [{ when: PERICARDIO, text: "Bulhas mais audíveis." }] }),
    ex("e-pulmao", "torax_posterior", "ausculta", "Murmúrio presente bilateralmente, sem estertores.", { sound: "murmurio_normal" }),
    ex("e-pulso", "membro_superior_d", "palpacao", "Pulso paradoxal: queda de 18 mmHg da PAS na inspiração; pulso fino.", { label: "Pulso e PA na respiração" })
  ],
  testResults: [
    { testId: "pocus_cardiaco", variants: [{ when: PERICARDIO, text: "Derrame residual pequeno; sem colapso de câmaras." }, { text: "Derrame pericárdico moderado a importante, colapso diastólico do VD e do átrio direito, VCI pletórica. Ponta do eletrodo além do contorno do VD. (Laudo educativo.)" }] },
    { testId: "ecg12", variants: [{ text: "Ritmo sinusal 118 bpm, complexos de baixa voltagem e alternância elétrica discreta.", ecg: { rhythm: "sinusal", rate: 118, stElevationLeads: [], stDepressionLeads: [], peakedT: false, wideQrs: false } }] },
    { testId: "rx_torax", variants: [{ text: "Aumento da área cardíaca em relação ao exame anterior; eletrodo projetado além da silhueta do VD. (Laudo educativo.)" }] }
  ],
  highlightedActions: ["monitorizar", "o2_mascara_reservatorio", "chamar_ajuda", "pericardiocentese", "rcp"],
  rules: [
    { id: "r-volume", description: "Volume pequeno: ponte transitória (pré-carga)", priority: 30, when: VOLUME, repeat: "once", effects: [trend("sbp", 94, 180, "vol", 30, 900)] },
    { id: "r-pericardiocentese", description: "Pericardiocentese: restaura enchimento e débito", priority: 80, when: { all: [PERICARDIO, { not: { ruleFired: "r-aesp" } }] }, repeat: "once", effects: [trend("sbp", 118, 120, "peri", 80), trend("dbp", 70, 120, "peri", 80), trend("hr", 92, 120, "peri", 80), trend("perfusion", 0.7, 300, "peri", 80), trend("spo2", 96, 180, "peri", 80), flag("agitation", false), staff("enfermagem", "Saiu sangue escuro não coagulado… a pressão subiu para 118!"), outcome("melhora")] },
    { id: "r-furo", description: "Diurético/nitrato no tamponamento: colapso", priority: 70, when: { any: [{ drugGiven: "furosemida" }, { drugGiven: "nitroglicerina" }] }, repeat: "once", effects: [trend("sbp", 62, 120, "erro", 70, 900), obs("Redução da pré-carga em tamponamento: queda abrupta da PA.")] },
    { id: "r-aesp", description: "Sem pericardiocentese em 20 min: AESP", priority: 90, when: { all: [{ time: "gte", seconds: 1200 }, { not: PERICARDIO }] }, repeat: "once", effects: [flag("pulse", false), { type: "setValue", var: "sbp", value: 0 }, { type: "setValue", var: "dbp", value: 0 }, flag("consciousness", "irresponsivo"), staff("enfermagem", "Sem pulso! O monitor continua com ritmo organizado."), outcome("parada")] },
    { id: "r-rosc", description: "Pericardiocentese durante a RCP: RCE", priority: 95, when: { all: [{ ruleFired: "r-aesp" }, PERICARDIO, { actionStarted: "rcp" }] }, repeat: "once", effects: [flag("pulse", true), { type: "setValue", var: "sbp", value: 88 }, { type: "setValue", var: "dbp", value: 52 }, trend("sbp", 104, 180, "rosc", 95), trend("hr", 104, 120, "rosc", 95), flag("consciousness", "dor"), outcome("rosc")] },
    { id: "r-obito", description: "Sem tratar a causa em 12 min de PCR (decisão didática)", priority: 100, when: { all: [{ time: "gte", seconds: 1920 }, { not: PERICARDIO }] }, repeat: "once", effects: [flag("rhythm", "assistolia"), { type: "setValue", var: "hr", value: 0 }, outcome("obito", true)] },
    { id: "r-cirurgia", description: "Cirurgia cardíaca avisada", when: { actionCompleted: "chamar_ajuda" }, repeat: "once", effects: [staff("supervisor", "Cirurgia cardiovascular avisada: se o sangramento persistir após a drenagem, levar ao centro cirúrgico.")] }
  ],
  diagnosis: { primary: "tamponamento", accepted: ["tamponamento", "choque_obstrutivo"], differentials: ["choque_obstrutivo", "pneumotorax_hipertensivo", "tep", "choque_cardiogenico", "iamcsst"] },
  acceptedDestinations: ["uti", "centro_cirurgico"],
  outcomeNotes: "Tríade de Beck (hipotensão, turgência jugular, bulhas abafadas) e pulso paradoxal após eletrodo transvenoso: tamponamento por perfuração do VD. POCUS confirma; volume pequeno é ponte; pericardiocentese é o tratamento; avaliar cirurgia se o sangramento persistir.",
  scoring: [
    { id: "s-contexto", domain: "historia", description: "Relacionou a piora ao procedimento", evidence: { kind: "historyAsked", items: ["h-procedimento", "h-anticoag"], minCount: 1 }, points: 6, severity: "critica", rationale: "Perfuração é complicação conhecida do eletrodo transvenoso." },
    { id: "s-beck", domain: "historia", description: "Examinou jugulares, bulhas e pulso paradoxal", evidence: { kind: "examDone", regions: ["pescoco", "coracao", "membro_superior_d"], minCount: 2 }, points: 8, severity: "critica", rationale: "Tríade de Beck e pulso paradoxal." },
    { id: "s-ajuda", domain: "priorizacao", description: "Chamou ajuda/cirurgia", evidence: { kind: "actionDone", anyOf: ["chamar_ajuda"], withinSeconds: 300 }, points: 4, severity: "importante", rationale: "Pode precisar de cirurgia." },
    { id: "s-pocus", domain: "exames", description: "POCUS cardíaco em até 10 min", evidence: { kind: "testOrdered", anyOf: ["pocus_cardiaco"], withinSeconds: 600 }, points: 12, severity: "critica", rationale: "Confirma derrame com colapso de câmaras à beira-leito." },
    { id: "s-exames", domain: "exames", description: "Sem levar o paciente instável para exames demorados", evidence: { kind: "testsNotExcessive", maxUnjustified: 0, justified: ["pocus_cardiaco", "ecg12", "hemograma", "coagulograma", "rx_torax"] }, points: 3, severity: "menor", rationale: "Diagnóstico à beira-leito." },
    { id: "s-peri", domain: "tratamento", description: "Pericardiocentese em até 15 min", evidence: { kind: "actionDone", anyOf: ["pericardiocentese"], withinSeconds: 900 }, points: 18, severity: "critica", rationale: "Tratamento do choque obstrutivo por tamponamento." },
    { id: "s-volume", domain: "tratamento", description: "Volume pequeno como ponte", evidence: { kind: "drugGiven", anyOf: ["sf09", "ringer_lactato"] }, points: 4, severity: "importante", rationale: "Aumenta pré-carga transitoriamente." },
    { id: "s-erro", domain: "tratamento", description: "Falha: diurético ou nitrato", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-furo" } }, points: 8, penalty: true, severity: "critica", rationale: "Reduzem a pré-carga de que o coração depende." },
    { id: "s-reav", domain: "reavaliacao", description: "POCUS/PA após a drenagem", evidence: { kind: "reassessAfter", after: ["pericardiocentese"], reassess: ["pocus_cardiaco", "medir_pa"], withinSeconds: 900 }, points: 10, severity: "importante", rationale: "Reacúmulo indica cirurgia." },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de tamponamento", evidence: { kind: "diagnosis", accepted: ["tamponamento", "choque_obstrutivo"] }, points: 6, severity: "importante", rationale: "Choque obstrutivo." },
    { id: "s-destino", domain: "destino", description: "UTI ou centro cirúrgico", evidence: { kind: "disposition", accepted: ["uti", "centro_cirurgico"] }, points: 6, severity: "importante", rationale: "Monitorização ou reparo cirúrgico." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Hipotensão com jugulares cheias e pulmão limpo: que tipo de choque?" },
      { level: 2, text: "O que um eletrodo no ápice do VD pode causar?" },
      { level: 3, text: "O coração não enche: o que aliviar?" },
      { level: 4, text: "Sugestão explícita: POCUS, volume pequeno, pericardiocentese guiada, cirurgia avisada; sem diurético/nitrato." }
    ],
    summary: "Homem de 74 anos com tamponamento cardíaco por perfuração do VD pelo eletrodo de marca-passo temporário.",
    pathophysiology: "Sangue no saco pericárdico, inelástico em acúmulo rápido, eleva a pressão intrapericárdica acima da pressão de enchimento do VD e AD: colapso diastólico, queda do débito e choque obstrutivo. A interdependência ventricular explica o pulso paradoxal.",
    keyPoints: [
      "Tríade de Beck + pulso paradoxal.",
      "POCUS: derrame com colapso diastólico do VD/AD e VCI pletórica.",
      "Volume como ponte; evitar diurético, nitrato e ventilação com pressão alta quando possível.",
      "Pericardiocentese guiada; cirurgia se persistir.",
      "AESP por tamponamento: drenar durante a RCP."
    ],
    alternatives: ["Janela pericárdica cirúrgica."],
    oralRubric: [
      { id: "o1", concept: "Choque obstrutivo", synonyms: ["obstrutivo", "tamponamento", "beck"], weight: 2 },
      { id: "o2", concept: "POCUS", synonyms: ["pocus", "ultrassom", "ecocardiograma", "derrame"], weight: 2 },
      { id: "o3", concept: "Pericardiocentese", synonyms: ["pericardiocentese", "drenagem", "punção"], weight: 3 },
      { id: "o4", concept: "Evitar redução de pré-carga", synonyms: ["volume", "diurético", "nitrato", "pré-carga"], weight: 1 }
    ],
    simplifications: ["Drenagem resolve deterministicamente; reacúmulo não modelado.", "AESP aos 20 min e óbito aos 32 min são decisões didáticas."]
  },
  references: ["INT-AHA-ALS", "INT-ESC-IC-2021", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Contexto, exame, POCUS, volume, pericardiocentese e reavaliação", commands: [ask(10, "h-procedimento"), { atSeconds: 20, type: "examine", payload: { region: "pescoco", maneuver: "inspecao" } }, { atSeconds: 40, type: "examine", payload: { region: "coracao", maneuver: "ausculta" } }, act(60, "chamar_ajuda"), test(80, "pocus_cardiaco"), rx(100, "sf09", "bolsa500", 250, "mL", "IV", "infusao_volume", { durationMinutes: 10 }), act(420, "pericardiocentese"), test(800, "pocus_cardiaco"), act(820, "medir_pa"), dx(1200, "tamponamento"), dest(1200, "uti")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-pericardiocentese" }, description: "melhora" }, { condition: { not: { ruleFired: "r-aesp" } }, description: "sem PCR" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 2000, expect: [{ condition: { ruleFired: "r-aesp" }, description: "AESP" }, { condition: { ruleFired: "r-obito" }, description: "óbito" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Furosemida por \"congestão\"", commands: [rx(100, "furosemida", "amp20", 40, "mg", "IV")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-furo" }, description: "colapso" }, { condition: { ruleFired: "r-aesp" }, description: "AESP" }] },
    { id: "t-atraso", kind: "delay", description: "Pericardiocentese durante a RCP", commands: [act(1210, "rcp"), act(1230, "pericardiocentese")], runUntilSeconds: 1700, expect: [{ condition: { ruleFired: "r-aesp" }, description: "AESP" }, { condition: { ruleFired: "r-rosc" }, description: "RCE" }] },
    { id: "t-alternativa", kind: "alternative", description: "Pericardiocentese direta pelo quadro clínico", commands: [act(30, "pericardiocentese"), dest(800, "centro_cirurgico")], runUntilSeconds: 1000, expect: [{ condition: { ruleFired: "r-pericardiocentese" }, description: "melhora" }] }
  ]
};
