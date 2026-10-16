import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const VNI = { deviceActive: "vni" };
const NTG = { treatmentActive: "nitroglicerina" };
const CALCIO = { drugGiven: "gluconato_calcio" };
const INSULINA = { drugGiven: "insulina_regular" };
const GLICOSE = { any: [{ drugGiven: "glicose50" }, { drugGiven: "sg5" }] };
const DIALISE = { actionCompleted: "acionar_dialise" };
const SF = { any: [{ drugGiven: "sf09", minTotal: { value: 300, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 300, unit: "mL" as const } }] };

export const C062: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C062",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Paciente em hemodiálise com muita falta de ar depois de faltar à sessão",
  teachingTitle: "Congestão pulmonar e hipercalemia em DRC dialítica — VNI, nitrato, proteção miocárdica e hemodiálise de urgência",
  group: "Nefrologia",
  specialties: ["Nefrologia", "Clínica médica", "Emergência", "Terapia intensiva"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 4,
  level: "residencia",
  objectives: [
    "Reconhecer edema agudo de pulmão e hipercalemia em paciente dialítico que perdeu sessão",
    "Iniciar VNI e vasodilatador; não dar volume",
    "Tratar hipercalemia com ECG alterado enquanto organiza a diálise",
    "Indicar hemodiálise de urgência e entender o limite do diurético no anúrico",
    "Proteger o braço da fístula arteriovenosa"
  ],
  keywords: ["falta de ar", "hemodiálise", "rim", "inchaço", "sessão", "tosse"],
  patient: {
    name: "Jorge Luiz Andrade",
    ageYears: 54,
    sex: "masculino",
    weightKg: 82,
    heightCm: 170,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 5, hairStyle: "careca", hairColor: "preto", build: "robusto", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional com UTI e hemodiálise. Domingo à noite. Homem de 54 anos, em hemodiálise segunda/quarta/sexta por nefropatia diabética e hipertensiva, faltou à sessão de sexta. Chega sentado, muito dispneico, com fístula arteriovenosa no braço esquerdo.",
  communication: "limitada",
  informants: [{ id: "esposa", name: "Esposa", role: "Acompanhante" }],
  history: [
    hi("h-sessao", "inicio", "Quando foi a última diálise? Por que faltou?", [{ source: "paciente", text: "Quarta… sexta não fui… sem transporte." }, { source: "esposa", text: "A van da prefeitura não veio na sexta. Desde ontem ele não deita de tanto falta de ar." }], ["diálise", "sessão", "faltou", "última"]),
    hi("h-diurese", "alimentacao_eliminacoes", "Ele ainda urina? Quanto bebeu de líquido?", [{ source: "esposa", text: "Quase nada de urina. No sábado teve churrasco de família, ele bebeu bastante e comeu salgado." }], ["urina", "líquido", "bebeu", "sal"]),
    hi("h-sintomas", "fatores_associados", "Tem dor no peito, palpitação, fraqueza?", [{ source: "paciente", text: "Fraqueza nas pernas… coração meio falhando." }], ["dor", "peito", "palpitação", "fraqueza"]),
    hi("h-medicacoes", "medicacoes", "Que remédios usa?", [{ source: "esposa", text: "Anlodipino, losartana, insulina NPH, eritropoetina na diálise, quelante de fósforo." }], ["remédio", "medicação"]),
    hi("h-peso-seco", "antecedentes", "Qual o peso seco dele?", [{ source: "esposa", text: "Na clínica falam 77 quilos." }], ["peso seco", "peso"])
  ],
  initial: {
    vars: { hr: 112, sbp: 208, dbp: 112, rr: 34, spo2: 84, temp: 36.4, gcs: 14, pain: 3, glucose: 186, perfusion: 0.7, effort: 0.85, etco2: 34, na: 134, k: 7.0, cl: 98, creat: 11.2, urea: 238, ph: 7.24, pco2: 33, po2: 54, hco3: 14, be: -11, hb: 9.8, lactate: 2.1, urine: 0 },
    flags: { rhythm: "sinusal_t_apiculada", posture: "sentado", painVisual: "moderada", speech: "palavras", consciousness: "alerta", sweating: true, edema: true, agitation: true },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-pulmao", "torax_posterior", "ausculta", "Estertores crepitantes até terço médio bilateralmente.", { sound: "estertores", label: "Pulmões", better: [{ when: { ruleFired: "r-dialise-efeito" }, text: "Estertores apenas em bases." }] }),
    ex("e-fav", "membro_superior_e", "palpacao", "Fístula arteriovenosa com frêmito palpável — não puncionar nem medir PA neste braço.", { label: "Fístula AV" }),
    ex("e-edema", "membro_inferior_d", "inspecao", "Edema 3+/4+ em membros inferiores; turgência jugular a 45°.", { label: "Edema e jugular" }),
    ex("e-coracao", "coracao", "ausculta", "Taquicárdico, B3; sem atrito pericárdico.", { sound: "b3" }),
    ex("e-neuro", "neurologico", "especial", "Lúcido, sem asterixis; fraqueza proximal leve.", {})
  ],
  testResults: [
    { testId: "ecg12", variants: [{ when: { ruleFired: "r-arritmia" }, text: "Bradicardia, QRS alargado, ondas T apiculadas — hipercalemia grave." }, { text: "Taquicardia sinusal; ondas T apiculadas em V2–V5; QRS 110 ms; HVE." }] },
    { testId: "rx_torax", variants: [{ text: "Laudo educativo: congestão hilar bilateral em 'asa de borboleta', linhas B de Kerley, cardiomegalia." }] },
    { testId: "pocus_pulmonar", variants: [{ text: "Linhas B difusas bilaterais; pequeno derrame pleural bilateral." }] }
  ],
  highlightedActions: ["monitorizar", "vni", "acesso_venoso", "acionar_dialise"],
  rules: [
    { id: "r-curso", description: "Hipervolemia e hipercalemia sem diálise", priority: 10, when: { always: true }, repeat: "once", effects: [trend("spo2", 78, 1500, "cong", 10), trend("effort", 0.95, 1500, "cong", 10), trend("k", 7.8, 1800, "cong", 10), trend("ph", 7.18, 3600, "cong", 10)] },
    { id: "r-vni", description: "VNI: recrutamento e redução da pós-carga", priority: 40, when: VNI, repeat: "while", effects: [trend("spo2", 91, 300, "vni", 40), trend("effort", 0.6, 300, "vni", 40), trend("rr", 26, 300, "vni", 40)], onEnd: [{ type: "clearTrend", var: "spo2", slot: "vni" }, { type: "clearTrend", var: "effort", slot: "vni" }] },
    { id: "r-ntg", description: "Nitroglicerina: redução de pré e pós-carga", priority: 42, when: NTG, repeat: "while", effects: [trend("sbp", 162, 600, "ntg", 42), trend("dbp", 92, 600, "ntg", 42)], onEnd: [{ type: "clearTrend", var: "sbp", slot: "ntg" }, { type: "clearTrend", var: "dbp", slot: "ntg" }] },
    { id: "r-vni-ntg", description: "VNI + nitrato: alívio da congestão até a diálise", priority: 45, when: { all: [VNI, NTG] }, repeat: "once", effects: [trend("spo2", 94, 600, "ponte", 45), trend("effort", 0.45, 600, "ponte", 45), flag("agitation", false)] },
    { id: "r-furo", description: "Furosemida no anúrico: efeito mínimo", priority: 20, when: { drugGiven: "furosemida" }, repeat: "once", effects: [obs("Paciente praticamente anúrico: diurético tem pouco efeito; a remoção de volume depende da ultrafiltração.")] },
    { id: "r-calcio", description: "Cálcio IV: proteção miocárdica", priority: 40, when: CALCIO, repeat: "once", effects: [obs("Gluconato de cálcio estabiliza a membrana por 30–60 min.")] },
    { id: "r-shift", description: "Insulina + glicose: redistribuição transitória do K⁺", priority: 50, when: { all: [INSULINA, GLICOSE] }, repeat: "once", effects: [trend("k", 5.9, 900, "shift", 50, 5400), flag("rhythm", "taquicardia_sinusal")] },
    { id: "r-dialise", description: "Nefrologia acionada: hemodiálise de urgência", priority: 30, when: DIALISE, repeat: "once", effects: [staff("supervisor", "Nefrologista: hemodiálise de urgência com ultrafiltração na UTI; máquina pronta em 30 minutos. Manter VNI, nitrato e controle do potássio até lá.")] },
    { id: "r-dialise-efeito", description: "Hemodiálise com ultrafiltração: K⁺, acidose e congestão corrigidos", priority: 70, when: { elapsedSince: "action:acionar_dialise", op: "gte", seconds: 1800 }, repeat: "once", effects: [trend("k", 4.6, 3600, "hd", 70), trend("ph", 7.36, 3600, "hd", 70), trend("hco3", 22, 3600, "hd", 70), trend("spo2", 97, 2400, "hd", 70), trend("effort", 0.25, 2400, "hd", 70), trend("sbp", 150, 2400, "hd", 70), trend("urea", 120, 7200, "hd", 70), outcome("melhora")] },
    { id: "r-sf", description: "Volume em paciente congesto", priority: 55, when: SF, repeat: "once", effects: [trend("spo2", 76, 600, "sf", 55, 1800), obs("Volume em paciente hipervolêmico e anúrico agrava o edema pulmonar."), outcome("complicacao")] },
    { id: "r-arritmia", description: "K⁺ ≥ 7,4 sem cálcio: bradiarritmia com QRS largo", priority: 60, when: { all: [{ path: "vars.k", op: "gte", value: 7.4 }, { not: CALCIO }] }, repeat: "once", effects: [flag("rhythm", "sinusal_qrs_largo"), trend("hr", 44, 300, "arr", 60), trend("sbp", 120, 300, "arr", 60), staff("enfermagem", "QRS alargando e frequência caindo!"), outcome("piora")] },
    { id: "r-pcr", description: "Hipercalemia não tratada: FV", priority: 100, when: { all: [{ elapsedSince: "rule:r-arritmia", op: "gte", seconds: 900 }, { not: CALCIO }, { not: INSULINA }, { not: DIALISE }] }, repeat: "once", effects: [flag("rhythm", "fv"), flag("pulse", false), { type: "setValue", var: "sbp", value: 0 }, flag("consciousness", "irresponsivo"), staff("enfermagem", "Parou! FV!"), outcome("parada", true)] },
    { id: "r-falencia", description: "Sem VNI em 30 min: falência respiratória", priority: 35, when: { all: [{ time: "gte", seconds: 1800 }, { not: VNI }, { not: { deviceActive: "tot" } }] }, repeat: "once", effects: [trend("spo2", 72, 600, "fal", 35), trend("gcs", 11, 600, "fal", 35), flag("consciousness", "voz"), staff("enfermagem", "Ele está ficando sonolento e a saturação não sobe."), outcome("piora")] }
  ],
  diagnosis: { primary: "drc_agudizada", accepted: ["drc_agudizada", "eap_hipertensivo", "hipercalemia"], differentials: ["eap_hipertensivo", "iamcsst", "pneumonia", "tep", "hipercalemia", "tamponamento"] },
  acceptedDestinations: ["uti"],
  outcomeNotes: "Paciente em hemodiálise que perdeu uma sessão e abusou de líquido e sal: edema agudo de pulmão hipertensivo por hipervolemia, hipercalemia (7,0) com ECG alterado e acidose. VNI, nitroglicerina, gluconato de cálcio, insulina + glicose, sem volume, diurético com pouca expectativa (anúrico) e hemodiálise de urgência com ultrafiltração na UTI; poupar o braço da fístula. Discutir o problema de transporte com a rede.",
  scoring: [
    { id: "s-sessao", domain: "historia", description: "Última diálise, ingestão e diurese residual", evidence: { kind: "historyAsked", items: ["h-sessao", "h-diurese"], minCount: 2 }, points: 8, severity: "critica", rationale: "Explica a hipervolemia e a hipercalemia." },
    { id: "s-exame", domain: "historia", description: "Pulmões, congestão e fístula", evidence: { kind: "examDone", regions: ["torax_posterior", "membro_inferior_d", "membro_superior_e"], minCount: 2 }, points: 6, severity: "importante", rationale: "Congestão e cuidado com a fístula." },
    { id: "s-monitor", domain: "priorizacao", description: "Monitorização imediata", evidence: { kind: "actionDone", anyOf: ["monitorizar"], withinSeconds: 180 }, points: 5, severity: "critica", rationale: "Hipercalemia e hipoxemia." },
    { id: "s-vni", domain: "priorizacao", description: "VNI em até 10 min", evidence: { kind: "actionDone", anyOf: ["vni"], withinSeconds: 600 }, points: 12, severity: "critica", rationale: "Edema agudo de pulmão.", sourceIds: ["INT-ESC-IC-2021"] },
    { id: "s-ntg", domain: "tratamento", description: "Nitroglicerina IV", evidence: { kind: "drugGiven", anyOf: ["nitroglicerina"], withinSeconds: 1200 }, points: 8, severity: "importante", rationale: "Hipertensão com congestão.", sourceIds: ["INT-ESC-IC-2021"] },
    { id: "s-ecg", domain: "exames", description: "ECG e potássio rápido", evidence: { kind: "testOrdered", anyOf: ["ecg12", "gaso_venosa", "gaso_arterial"], withinSeconds: 600 }, points: 6, severity: "critica", rationale: "Define urgência da hipercalemia." },
    { id: "s-calcio", domain: "tratamento", description: "Gluconato de cálcio", evidence: { kind: "drugGiven", anyOf: ["gluconato_calcio"], withinSeconds: 1200 }, points: 8, severity: "critica", rationale: "ECG alterado.", sourceIds: ["INT-UKKA-HIPERK"] },
    { id: "s-shift", domain: "tratamento", description: "Insulina com glicose", evidence: { kind: "drugGiven", anyOf: ["insulina_regular"], withinSeconds: 1500 }, points: 6, severity: "importante", rationale: "Ponte até a diálise.", sourceIds: ["INT-UKKA-HIPERK"] },
    { id: "s-dialise", domain: "tratamento", description: "Acionou hemodiálise de urgência", evidence: { kind: "actionDone", anyOf: ["acionar_dialise"], withinSeconds: 1800 }, points: 14, severity: "critica", rationale: "Tratamento definitivo: ultrafiltração e remoção de K⁺.", sourceIds: ["INT-AFP-LRA-2019"] },
    { id: "s-sf", domain: "tratamento", description: "Falha: volume em paciente congesto", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-sf" } }, points: 10, penalty: true, severity: "critica", rationale: "Agrava o edema pulmonar." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou SpO₂, PA e K⁺ após as medidas", evidence: { kind: "reassessAfter", after: ["nitroglicerina", "insulina_regular"], reassess: ["gaso_venosa", "gaso_arterial", "medir_pa", "torax_posterior", "glicemia_capilar"], withinSeconds: 1800 }, points: 6, severity: "importante", rationale: "Titular nitrato; K⁺ volta a subir." },
    { id: "s-dx", domain: "destino", description: "DRC dialítica descompensada (congestão + hipercalemia)", evidence: { kind: "diagnosis", accepted: ["drc_agudizada", "eap_hipertensivo", "hipercalemia"] }, points: 5, severity: "importante", rationale: "Sessão perdida." },
    { id: "s-destino", domain: "destino", description: "UTI", evidence: { kind: "disposition", accepted: ["uti"] }, points: 6, severity: "importante", rationale: "Diálise de urgência e VNI." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Quando foi a última diálise dele?" },
      { level: 2, text: "Ele urina? O diurético vai funcionar?" },
      { level: 3, text: "Duas emergências juntas: pulmão cheio e potássio alto." },
      { level: 4, text: "Sugestão explícita: monitor, VNI, nitroglicerina, ECG/gasometria, gluconato de cálcio, insulina + glicose, acionar hemodiálise de urgência, UTI; nada de soro; poupar a fístula." }
    ],
    summary: "Homem de 54 anos em hemodiálise que perdeu a sessão de sexta (falta de transporte) e ingeriu líquido e sal: edema agudo de pulmão hipertensivo e hipercalemia com ECG alterado.",
    pathophysiology: "Sem função renal, todo líquido e potássio ingeridos se acumulam entre sessões. O intervalo mais longo (fim de semana) concentra eventos graves. A hipervolemia eleva pressões de enchimento e causa edema pulmonar; o K⁺ alto altera a condução cardíaca. Diuréticos dependem de néfrons funcionantes; no anúrico, só a diálise remove volume e potássio.",
    keyPoints: [
      "Paciente dialítico com dispneia: pensar em hipervolemia e hipercalemia juntas.",
      "VNI e nitrato como ponte; não dar volume.",
      "Hipercalemia com ECG alterado: cálcio + insulina/glicose; diálise remove.",
      "Hemodiálise de urgência com ultrafiltração é o tratamento definitivo.",
      "Não puncionar nem medir PA no braço da fístula; olhar o problema social (transporte)."
    ],
    alternatives: ["IOT se falha de VNI ou rebaixamento.", "Salbutamol inalatório como adjuvante na hipercalemia."],
    oralRubric: [
      { id: "o1", concept: "Sessão perdida", synonyms: ["faltou", "sessão", "diálise"], weight: 2 },
      { id: "o2", concept: "VNI e nitrato", synonyms: ["vni", "cpap", "nitroglicerina", "nitrato"], weight: 2 },
      { id: "o3", concept: "Hipercalemia", synonyms: ["cálcio", "insulina", "potássio"], weight: 2 },
      { id: "o4", concept: "Diálise de urgência", synonyms: ["hemodiálise", "diálise", "ultrafiltração"], weight: 3 },
      { id: "o5", concept: "Fístula", synonyms: ["fístula", "braço"], weight: 1 }
    ],
    simplifications: ["A hemodiálise é representada pelo acionamento da nefrologia e efeito após 30 min.", "O braço da fístula é ensinado no exame, sem bloqueio de ações no simulador."]
  },
  references: ["INT-ESC-IC-2021", "INT-UKKA-HIPERK", "INT-AFP-LRA-2019", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 15, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Monitor, história, VNI, ECG/gasometria, cálcio, insulina + glicose, nitroglicerina, hemodiálise, UTI", commands: [act(5, "monitorizar"), ask(15, "h-sessao"), ask(25, "h-diurese"), act(35, "vni"), { atSeconds: 60, type: "examine", payload: { region: "torax_posterior", maneuver: "ausculta" } }, { atSeconds: 70, type: "examine", payload: { region: "membro_superior_e", maneuver: "palpacao" } }, act(80, "acesso_venoso"), test(190, "ecg12"), test(200, "gaso_venosa"), rx(300, "gluconato_calcio", "amp10", 1000, "mg", "IV"), rx(360, "nitroglicerina", "sol200", 1, "mg", "IV", "infusao", { rate: { value: 20, unit: "mcg/min" } }), rx(400, "glicose50", "amp10", 25, "g", "IV"), rx(410, "insulina_regular", "fr100", 10, "UI", "IV"), act(450, "acionar_dialise"), act(1500, "medir_pa"), test(1600, "gaso_venosa"), dx(2000, "drc_agudizada"), dest(2100, "uti")], runUntilSeconds: 5000, expect: [{ condition: { ruleFired: "r-vni-ntg" }, description: "ponte com VNI + nitrato" }, { condition: { ruleFired: "r-dialise-efeito" }, description: "diálise" }, { condition: { not: { ruleFired: "r-arritmia" } }, description: "sem arritmia" }, { condition: { path: "vars.spo2", op: "gte", value: 93 }, description: "SpO₂ ≥ 93" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 4000, expect: [{ condition: { ruleFired: "r-arritmia" }, description: "arritmia" }, { condition: { ruleFired: "r-pcr" }, description: "FV" }, { condition: { ruleFired: "r-falencia" }, description: "falência respiratória" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Furosemida e soro 'para proteger o rim', sem VNI", commands: [act(30, "acesso_venoso"), rx(150, "furosemida", "amp20", 80, "mg", "IV"), rx(200, "sf09", "bolsa500", 500, "mL", "IV", "infusao_volume", { durationMinutes: 30 })], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-sf" }, description: "volume no congesto" }, { condition: { ruleFired: "r-furo" }, description: "diurético ineficaz" }, { condition: { ruleFired: "r-falencia" }, description: "falência respiratória" }] },
    { id: "t-atraso", kind: "delay", description: "VNI e nitrato tardios; diálise só após arritmia", commands: [act(30, "acesso_venoso"), act(1500, "vni"), rx(1600, "nitroglicerina", "sol200", 1, "mg", "IV", "infusao", { rate: { value: 20, unit: "mcg/min" } }), rx(1900, "gluconato_calcio", "amp10", 1000, "mg", "IV"), act(2000, "acionar_dialise")], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-arritmia" }, description: "arritmia no atraso" }, { condition: { not: { ruleFired: "r-pcr" } }, description: "PCR evitada" }, { condition: { ruleFired: "r-dialise-efeito" }, description: "diálise" }] },
    { id: "t-alternativa", kind: "alternative", description: "Acionar diálise de imediato, VNI, cálcio e salbutamol", commands: [act(5, "monitorizar"), act(20, "vni"), act(40, "acesso_venoso"), act(150, "acionar_dialise"), rx(160, "gluconato_calcio", "amp10", 2000, "mg", "IV"), rx(200, "salbutamol", "spray100", 400, "mcg", "inalatoria"), dest(1500, "uti")], runUntilSeconds: 4000, expect: [{ condition: { ruleFired: "r-dialise-efeito" }, description: "diálise" }, { condition: { not: { ruleFired: "r-pcr" } }, description: "sem PCR" }] }
  ]
};
