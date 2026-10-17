import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const ACOLHE = { any: [{ actionCompleted: "escuta_qualificada" }, { actionCompleted: "desescalada_verbal" }] };
const BENZO = { any: [{ drugGiven: "diazepam" }, { drugGiven: "midazolam" }] };

export const C101: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C101",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Jovem com aperto no peito, coração disparado e formigamento nas mãos, com medo de morrer",
  teachingTitle: "Crise de pânico com sintomas torácicos — excluir causas orgânicas de forma proporcional (ECG, sinais vitais, glicemia), acolher, evitar benzodiazepínico e garantir seguimento na APS",
  group: "Psiquiatria",
  specialties: ["Psiquiatria", "Emergência", "Atenção primária"],
  environment: "emergencia",
  resourceProfile: "upa-porte-ii",
  difficulty: 2,
  level: "internato",
  objectives: [
    "Excluir de forma proporcional causas orgânicas de dor torácica e palpitação (ECG em 10 min, sinais vitais, SpO2, glicemia)",
    "Pesquisar fatores de risco para TEP, SCA e arritmia na história",
    "Acolher e explicar os sintomas sem invalidar o sofrimento",
    "Não prescrever benzodiazepínico para o transtorno de pânico",
    "Garantir seguimento na APS (psicoterapia, avaliação de ISRS) e rastrear risco"
  ],
  keywords: ["aperto no peito", "coração disparado", "formigamento", "medo", "falta de ar", "jovem"],
  patient: {
    name: "Camila Duarte",
    ageYears: 26,
    sex: "feminino",
    weightKg: 60,
    heightCm: 165,
    visual: { ageGroup: "adulto", sex: "feminino", skinTone: 2, hairStyle: "coque", hairColor: "castanho", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "UPA 24h. Mulher de 26 anos chega caminhando, chorando, mão no peito: há 20 minutos começou de repente com coração disparado, aperto no peito, falta de ar, formigamento nas mãos e boca e a sensação de que ia morrer.",
  communication: "normal",
  informants: [{ id: "paciente", name: "Camila", role: "Paciente" }],
  history: [
    hi("h-inicio", "inicio", "Como começou? Já aconteceu antes?", [{ source: "paciente", text: "Do nada, no ônibus. É a terceira vez no mês. Fiz exames da outra vez e disseram que não era nada... mas eu sinto que vou morrer!" }], ["começou", "antes", "vezes", "aconteceu"]),
    hi("h-dor", "localizacao", "Como é a dor? Piora ao respirar, ao apertar ou com esforço?", [{ source: "paciente", text: "Um aperto no meio do peito, não piora com nada específico. Começou parada, não fazendo esforço." }], ["dor", "piora", "esforço", "respirar"]),
    hi("h-risco-tep", "fatores_associados", "Usa anticoncepcional hormonal? Fez cirurgia, viagem longa, imobilização? Inchaço na perna? Tosse com sangue?", [{ source: "paciente", text: "Uso DIU de cobre. Nada de cirurgia nem viagem. Pernas normais." }], ["anticoncepcional", "cirurgia", "viagem", "perna", "inchaço"]),
    hi("h-substancias", "habitos", "Usou café em excesso, energético, cocaína, remédio para emagrecer, descongestionante?", [{ source: "paciente", text: "Só um café de manhã. Nada disso." }], ["café", "energético", "cocaína", "emagrecer", "descongestionante"]),
    hi("h-antecedentes", "antecedentes", "Tem problema de coração, tireoide, asma? Alguém na família morreu de repente jovem?", [{ source: "paciente", text: "Não. Ninguém na família." }], ["coração", "tireoide", "asma", "família", "morte súbita"]),
    hi("h-contexto", "social", "Como estão as coisas na sua vida? Tem medo de que volte a acontecer?", [{ source: "paciente", text: "Fui demitida há dois meses. Agora tenho medo de sair de casa sozinha e passar mal." }], ["vida", "medo", "trabalho", "estresse"]),
    hi("h-humor", "humor_risco", "Tem se sentido triste, sem prazer? Já pensou em morrer ou se machucar?", [{ source: "paciente", text: "Triste às vezes, mas não penso em me matar. Tenho medo é de morrer de verdade." }], ["triste", "prazer", "morrer", "machucar"])
  ],
  initial: {
    vars: { hr: 118, sbp: 132, dbp: 82, rr: 28, spo2: 99, temp: 36.5, gcs: 15, pain: 6, glucose: 98, perfusion: 0.9, effort: 0.2 },
    flags: { rhythm: "taquicardia_sinusal", agitation: true, tremor: true, sweating: true, posture: "sentado", painVisual: "moderada", speech: "frases", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-coracao", "coracao", "ausculta", "Taquicárdica, ritmo regular, bulhas normais, sem sopros.", { sound: "bulhas_normais" }),
    ex("e-torax", "torax_anterior", "ausculta", "Murmúrio vesicular presente, sem ruídos adventícios; sem dor à palpação.", { sound: "murmurio_normal" }),
    ex("e-mmii", "membro_inferior_d", "inspecao", "Sem edema, empastamento ou assimetria das panturrilhas.", { label: "Membros inferiores" }),
    ex("e-geral", "geral", "inspecao", "Ansiosa, hiperventilando, mãos frias e suadas; sem bócio, sem exoftalmia.", { label: "Estado geral", better: [{ when: { ruleFired: "r-acolhimento" }, text: "Mais tranquila, respiração regular." }] })
  ],
  testResults: [
    { testId: "ecg12", variants: [{ text: "Taquicardia sinusal 116 bpm; PR, QRS e QTc normais; sem alterações de ST, sem pré-excitação, sem padrão de Brugada." }] },
    { testId: "troponina", variants: [{ text: "Abaixo do percentil 99." }] }
  ],
  highlightedActions: ["monitorizar", "escuta_qualificada", "orientacoes_alta"],
  rules: [
    { id: "r-acolhimento", description: "Acolhimento e explicação dos sintomas", priority: 30, when: ACOLHE, repeat: "once", effects: [trend("hr", 86, 600, "acol", 30), trend("rr", 16, 600, "acol", 30), trend("pain", 1, 600, "acol", 30), flag("agitation", false), flag("tremor", false), flag("sweating", false), staff("paciente", "Entender o que acontece no corpo já me acalmou... passou o formigamento."), outcome("melhora")] },
    { id: "r-persistente", description: "Sem acolhimento, crise se prolonga", priority: 20, when: { all: [{ time: "gte", seconds: 1200 }, { not: ACOLHE }, { not: BENZO }] }, repeat: "once", effects: [staff("enfermagem", "Ela está chorando, hiperventilando e pedindo para chamar a família."), outcome("piora")] },
    { id: "r-benzo", description: "Benzodiazepínico para pânico", priority: 25, when: BENZO, repeat: "once", effects: [trend("hr", 92, 900, "bz", 25), flag("agitation", false), obs("Benzodiazepínicos não são recomendados no transtorno de pânico: pior desfecho a longo prazo e risco de dependência.")] },
    { id: "r-alta-sem-ecg", description: "Alta sem ECG", priority: 45, when: { all: [{ any: [{ path: "disposition", op: "eq", value: "alta_orientada" }, { path: "disposition", op: "eq", value: "alta_com_seguimento_ubs" }] }, { not: { testCollected: "ecg12" } }] }, repeat: "once", effects: [obs("Palpitação e dor torácica exigem ECG antes da alta (arritmias, pré-excitação, isquemia)."), outcome("complicacao")] },
    { id: "r-sem-seguimento", description: "Alta sem seguimento", priority: 40, when: { path: "disposition", op: "eq", value: "alta_orientada" }, repeat: "once", effects: [obs("Crises recorrentes com evitação: transtorno de pânico provável — seguimento na APS (psicoterapia, avaliação de ISRS).")] }
  ],
  diagnosis: { primary: "crise_ansiedade", accepted: ["crise_ansiedade"], differentials: ["iamssst", "tep", "tsv", "crise_tireotoxica", "intox_estimulante"] },
  acceptedDestinations: ["alta_com_seguimento_ubs"],
  outcomeNotes: "Ataque de pânico recorrente (provável transtorno de pânico com evitação), sem fatores de risco para TEP/SCA e ECG normal. Monitorização, ECG em 10 min, glicemia, exame dirigido, acolhimento e psicoeducação, sem benzodiazepínico; alta com seguimento na UBS (psicoterapia, avaliação de ISRS) e sinais de alarme.",
  scoring: [
    { id: "s-ecg", domain: "priorizacao", description: "ECG em até 10 min", evidence: { kind: "testOrdered", anyOf: ["ecg12"], withinSeconds: 600 }, points: 16, severity: "critica", rationale: "Dor torácica: excluir isquemia e arritmia.", sourceIds: ["INT-ESC-SCA-2023"] },
    { id: "s-mon", domain: "priorizacao", description: "Sinais vitais/monitorização", evidence: { kind: "actionDone", anyOf: ["monitorizar"], withinSeconds: 300 }, points: 6, severity: "importante", rationale: "Exclusão orgânica." },
    { id: "s-glic", domain: "exames", description: "Glicemia capilar", evidence: { kind: "actionDone", anyOf: ["glicemia_capilar"] }, points: 4, severity: "importante", rationale: "Hipoglicemia simula crise." },
    { id: "s-hist", domain: "historia", description: "Característica da dor e recorrência", evidence: { kind: "historyAsked", items: ["h-inicio", "h-dor"], minCount: 2 }, points: 8, severity: "critica", rationale: "Padrão de crises." },
    { id: "s-organico", domain: "historia", description: "Fatores de risco (TEP, substâncias, cardiopatia)", evidence: { kind: "historyAsked", items: ["h-risco-tep", "h-substancias", "h-antecedentes"], minCount: 2 }, points: 10, severity: "critica", rationale: "Exclusão proporcional sem exames desnecessários." },
    { id: "s-exame", domain: "historia", description: "Coração, tórax e membros inferiores", evidence: { kind: "examDone", regions: ["coracao", "torax_anterior", "membro_inferior_d"], minCount: 2 }, points: 6, severity: "importante", rationale: "Sinais de TVP, sopros, atrito." },
    { id: "s-acolhe", domain: "tratamento", description: "Acolhimento e psicoeducação", evidence: { kind: "actionDone", anyOf: ["escuta_qualificada"], withinSeconds: 1200 }, points: 14, severity: "critica", rationale: "Tratamento da crise." },
    { id: "s-sem-benzo", domain: "tratamento", description: "Não prescreveu benzodiazepínico", evidence: { kind: "avoidDrug", anyOf: ["diazepam", "midazolam"] }, points: 10, severity: "critica", rationale: "Não recomendado no pânico.", sourceIds: ["INT-NICE-PANICO"] },
    { id: "s-humor", domain: "reavaliacao", description: "Rastreio de humor e risco", evidence: { kind: "historyAsked", items: ["h-humor", "h-contexto"], minCount: 1 }, points: 6, severity: "importante", rationale: "Comorbidade depressiva." },
    { id: "s-orient", domain: "destino", description: "Orientação de sinais de alarme", evidence: { kind: "actionDone", anyOf: ["orientacoes_alta"] }, points: 6, severity: "importante", rationale: "Quando retornar." },
    { id: "s-persist", domain: "tratamento", description: "Falha: crise prolongada sem acolhimento", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-persistente" } }, points: 6, penalty: true, severity: "importante", rationale: "Sem abordagem." },
    { id: "s-sem-ecg", domain: "destino", description: "Falha: alta sem ECG", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-alta-sem-ecg" } }, points: 12, penalty: true, severity: "critica", rationale: "Exclusão orgânica mínima." },
    { id: "s-dx", domain: "destino", description: "Crise de pânico", evidence: { kind: "diagnosis", accepted: ["crise_ansiedade"] }, points: 6, severity: "importante", rationale: "Após exclusão orgânica." },
    { id: "s-destino", domain: "destino", description: "Alta com seguimento na UBS", evidence: { kind: "disposition", accepted: ["alta_com_seguimento_ubs"] }, points: 8, severity: "importante", rationale: "Psicoterapia e avaliação de ISRS.", sourceIds: ["INT-NICE-PANICO"] }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Antes de tudo: qual exame em até 10 minutos numa dor torácica?" },
      { level: 2, text: "Há fatores de risco para TEP, SCA, arritmia ou uso de substâncias?" },
      { level: 3, text: "Exames normais: como explicar e acolher sem dizer que 'não é nada'?" },
      { level: 4, text: "Sugestão explícita: monitor, ECG, glicemia, história e exame dirigidos, escuta qualificada, sem benzodiazepínico, orientações, seguimento na UBS." }
    ],
    summary: "Ataques de pânico recorrentes com evitação em jovem sem fatores de risco cardiovascular ou tromboembólico.",
    pathophysiology: "Ativação simpática intensa com hiperventilação: a hipocapnia causa parestesias perioral e de extremidades, tontura e aperto torácico; a interpretação catastrófica dos sintomas alimenta o ciclo de medo e a evitação (agorafobia).",
    keyPoints: [
      "Exclusão orgânica proporcional: ECG, sinais vitais, SpO2, glicemia; exames adicionais conforme risco.",
      "Acolher e explicar os sintomas — 'não é nada' invalida e aumenta o retorno.",
      "Benzodiazepínicos não são recomendados para o transtorno de pânico.",
      "Seguimento: psicoterapia (TCC) e ISRS como farmacoterapia de longo prazo.",
      "Rastrear depressão e risco."
    ],
    alternatives: ["Troponina se a dor ou o ECG sugerirem isquemia.", "Matriciamento com saúde mental na APS."],
    oralRubric: [
      { id: "o1", concept: "Exclusão orgânica", synonyms: ["ecg", "orgânica", "tep", "arritmia"], weight: 3 },
      { id: "o2", concept: "Acolhimento", synonyms: ["acolher", "explicar", "psicoeducação"], weight: 2 },
      { id: "o3", concept: "Sem benzodiazepínico", synonyms: ["benzodiazepínico", "diazepam", "dependência"], weight: 2 },
      { id: "o4", concept: "Seguimento", synonyms: ["ubs", "tcc", "isrs", "psicoterapia"], weight: 2 }
    ],
    simplifications: ["Técnica de respiração incluída na escuta qualificada.", "PERC/escores de TEP não calculados no simulador."]
  },
  references: ["INT-NICE-PANICO", "INT-ESC-SCA-2023", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 8, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Monitor, ECG, glicemia, história/exame dirigidos, acolhimento, orientações, UBS", commands: [act(10, "monitorizar"), test(30, "ecg12"), ask(40, "h-inicio"), ask(50, "h-dor"), ask(60, "h-risco-tep"), ask(70, "h-substancias"), act(80, "glicemia_capilar"), { atSeconds: 130, type: "examine", payload: { region: "coracao", maneuver: "ausculta" } }, { atSeconds: 140, type: "examine", payload: { region: "membro_inferior_d", maneuver: "inspecao" } }, act(150, "escuta_qualificada"), ask(460, "h-humor"), act(500, "orientacoes_alta"), dx(700, "crise_ansiedade"), dest(900, "alta_com_seguimento_ubs")], runUntilSeconds: 1800, expect: [{ condition: { ruleFired: "r-acolhimento" }, description: "acolhimento" }, { condition: { not: { ruleFired: "r-alta-sem-ecg" } }, description: "ECG feito" }, { condition: { not: { ruleFired: "r-benzo" } }, description: "sem benzodiazepínico" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 1800, expect: [{ condition: { ruleFired: "r-persistente" }, description: "crise prolongada" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Diazepam e alta sem ECG nem seguimento", commands: [act(30, "acesso_venoso"), rx(150, "diazepam", "amp10", 5, "mg", "IV"), dest(900, "alta_orientada")], runUntilSeconds: 1800, expect: [{ condition: { ruleFired: "r-benzo" }, description: "benzodiazepínico" }, { condition: { ruleFired: "r-alta-sem-ecg" }, description: "sem ECG" }, { condition: { ruleFired: "r-sem-seguimento" }, description: "sem seguimento" }] },
    { id: "t-atraso", kind: "delay", description: "ECG e acolhimento tardios", commands: [ask(30, "h-inicio"), test(900, "ecg12"), act(1300, "escuta_qualificada"), dest(1700, "alta_com_seguimento_ubs")], runUntilSeconds: 2200, expect: [{ condition: { ruleFired: "r-persistente" }, description: "crise prolongada" }, { condition: { ruleFired: "r-acolhimento" }, description: "acolhimento tardio" }] },
    { id: "t-alternativa", kind: "alternative", description: "Inclui troponina por cautela", commands: [act(10, "monitorizar"), test(20, "ecg12"), act(40, "escuta_qualificada"), test(350, "troponina"), ask(360, "h-risco-tep"), act(400, "orientacoes_alta"), dest(1500, "alta_com_seguimento_ubs")], runUntilSeconds: 1800, expect: [{ condition: { ruleFired: "r-acolhimento" }, description: "acolhimento" }, { condition: { not: { ruleFired: "r-alta-sem-ecg" } }, description: "ECG feito" }] }
  ]
};
