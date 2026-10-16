import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, hi, obs, outcome, oxygenResponse, rx, staff, trend } from "./helpers";

const BENZO = { any: [{ drugGiven: "diazepam", minTotal: { value: 5, unit: "mg" as const } }, { drugGiven: "midazolam", minTotal: { value: 5, unit: "mg" as const } }] };
const FENITOINA = { drugGiven: "fenitoina", minTotal: { value: 900, unit: "mg" as const } };

export const C028: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C028",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Crises que não param na sala de espera",
  teachingTitle: "Estado de mal epiléptico convulsivo",
  group: "Neurologia",
  specialties: ["Neurologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Reconhecer estado de mal (crise > 5 min ou crises sem recuperação)",
    "Proteger via aérea, ofertar O₂ e medir glicemia",
    "Benzodiazepínico na primeira fase por via adequada",
    "Segunda fase com anticonvulsivante de ação prolongada",
    "Investigar causa e definir destino"
  ],
  keywords: ["convulsão", "crise", "epilepsia", "ataque"],
  patient: {
    name: "Edvaldo Santos",
    ageYears: 45,
    sex: "masculino",
    weightKg: 60,
    heightCm: 168,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 6, hairStyle: "crespo_curto", hairColor: "preto", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Homem de 45 anos teve uma crise convulsiva na sala de espera, não recuperou a consciência e começou outra crise. Foi levado à sala vermelha em crise tônico-clônica há cerca de 6 minutos.",
  communication: "incapaz",
  informants: [{ id: "esposa", name: "Dona Fátima", role: "Esposa" }],
  history: [
    hi("h-evento", "queixa", "O que aconteceu?", [{ source: "esposa", text: "Viemos porque ele teve uma crise em casa de manhã. Aqui na espera teve outra, não acordou e começou mais uma." }], ["aconteceu"]),
    hi("h-epilepsia", "antecedentes", "Ele tem epilepsia? Que remédios usa?", [{ source: "esposa", text: "Tem epilepsia desde jovem, toma fenitoína. Faz duas semanas que acabou o remédio e ele não buscou no posto." }], ["epilepsia", "remédio", "fenitoína"]),
    hi("h-alcool", "habitos", "Ele bebe?", [{ source: "esposa", text: "Bebe bastante no fim de semana; ontem bebeu." }], ["bebe", "álcool"]),
    hi("h-trauma", "sinais_alarme", "Bateu a cabeça? Teve febre ou dor de cabeça?", [{ source: "esposa", text: "Não bateu a cabeça. Não teve febre." }], ["cabeça", "febre", "trauma"]),
    hi("h-diabetes", "outros", "Ele tem diabetes ou usa insulina?", [{ source: "esposa", text: "Não tem diabetes." }], ["diabetes", "insulina"]),
    hi("h-alergias", "alergias", "Tem alergia a remédio?", [{ source: "esposa", text: "Não que eu saiba." }], ["alergia"])
  ],
  initial: {
    vars: { hr: 132, sbp: 162, dbp: 94, rr: 28, spo2: 87, temp: 37.7, gcs: 5, pain: 0, glucose: 112, perfusion: 0.75, effort: 1.5, lactate: 6.8, ph: 7.21, pco2: 50, hco3: 19, na: 138, k: 4.2, ca: 9.0, mg: 1.8, creat: 1.0, cpk: 900 },
    flags: { rhythm: "taquicardia_sinusal", seizure: true, consciousness: "irresponsivo", speech: "nenhuma", airway: "risco", sweating: true, posture: "supino", communication: "incapaz" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Crise tônico-clônica generalizada, salivação, cianose perioral.", { better: [{ when: { path: "flags.seizure", op: "eq", value: false }, text: "Pós-ictal: não responde ao chamado, respiração ruidosa, sem movimentos convulsivos." }] }),
    ex("e-boca", "boca", "inspecao", "Mordedura de língua; secreção abundante em orofaringe.", {}),
    ex("e-pupilas", "olhos", "inspecao", "Pupilas médias, simétricas, reativas; desvio do olhar para a esquerda durante a crise.", {}),
    ex("e-neuro", "neurologico", "especial", "Glasgow 5; sem rigidez de nuca verificável durante a crise.", { better: [{ when: { ruleFired: "r-recupera" }, text: "Glasgow 13 (confuso), move os quatro membros, sem déficit focal evidente; sem rigidez de nuca." }] }),
    ex("e-cabeca", "cabeca", "inspecao", "Sem sinais de trauma craniano.", {})
  ],
  testResults: [
    { testId: "tc_cranio", variants: [{ text: "Laudo educativo: sem lesões agudas; atrofia cortical leve compatível com a idade." }] },
    { testId: "ecg12", variants: [{ text: "Taquicardia sinusal.", ecg: { rhythm: "taquicardia_sinusal", rate: 128, stElevationLeads: [], stDepressionLeads: [], peakedT: false, wideQrs: false } }] }
  ],
  highlightedActions: ["posicao_seguranca", "aspirar_via_aerea", "o2_mascara_reservatorio", "glicemia_capilar", "acesso_venoso", "monitorizar"],
  rules: [
    oxygenResponse(94, 90, { path: "flags.seizure", op: "eq", value: false }),
    { id: "r-o2-durante", description: "Durante a crise, O₂ melhora pouco a SpO₂", when: { all: [{ any: [{ deviceActive: "mascara_reservatorio" }, { deviceActive: "cateter_nasal" }] }, { path: "flags.seizure", op: "eq", value: true }] }, repeat: "while", effects: [trend("spo2", 90, 60, "o2-crise", 25)], onEnd: [{ type: "clearTrend", var: "spo2", slot: "o2-crise" }] },
    { id: "r-benzo", description: "Benzodiazepínico interrompe a crise após ~1 min", priority: 60, when: { all: [BENZO, { path: "flags.seizure", op: "eq", value: true }] }, repeat: "once", effects: [{ type: "scheduleEffects", afterSeconds: 60, key: "benzo-cessa", effects: [{ type: "setFlag", flag: "seizure", value: false }, { type: "setValue", var: "gcs", value: 7 }, { type: "setFlag", flag: "consciousness", value: "dor" }] }, trend("hr", 108, 300, "benzo", 50), trend("rr", 16, 120, "benzo", 50)] },
    { id: "r-recorrencia", description: "Sem anticonvulsivante de 2ª fase, a crise recorre em ~10 min", priority: 70, when: { all: [{ elapsedSince: "rule:r-benzo", op: "gte", seconds: 660 }, { not: { drugGiven: "fenitoina" } }] }, repeat: "once", effects: [flag("seizure", true), flag("consciousness", "irresponsivo"), staff("enfermagem", "Ele voltou a convulsionar!"), outcome("piora")] },
    { id: "r-benzo-2", description: "Segunda dose de benzodiazepínico na recorrência", priority: 72, when: { all: [{ ruleFired: "r-recorrencia" }, { any: [{ drugGiven: "diazepam", minTotal: { value: 15, unit: "mg" } }, { drugGiven: "midazolam", minTotal: { value: 15, unit: "mg" } }] }] }, repeat: "once", effects: [{ type: "scheduleEffects", afterSeconds: 60, key: "benzo2-cessa", effects: [{ type: "setFlag", flag: "seizure", value: false }] }, trend("rr", 10, 300, "benzo2", 55), obs("Doses repetidas de benzodiazepínico aumentam o risco de depressão respiratória.")] },
    { id: "r-fenitoina", description: "Fenitoína cessa a crise e previne recorrência (efeito ao fim da infusão)", priority: 75, when: FENITOINA, repeat: "once", effects: [flag("seizure", false), flag("consciousness", "dor")] },
    { id: "r-recupera", description: "Sem crise e com 2ª fase concluída: recuperação gradual da consciência", priority: 80, when: { all: [FENITOINA, { path: "flags.seizure", op: "eq", value: false }, { elapsedSince: "drug:fenitoina", op: "gte", seconds: 900 }] }, repeat: "once", effects: [flag("consciousness", "voz"), trend("gcs", 13, 600, "rec", 60), trend("lactate", 2, 3600, "rec", 60), trend("temp", 37, 1800, "rec", 60), trend("hr", 92, 900, "rec", 60), outcome("melhora")] },
    { id: "r-crise-prolongada", description: "Crise contínua por 30 min: hipertermia, acidose e hipóxia", priority: 20, when: { all: [{ time: "gte", seconds: 1500 }, { path: "flags.seizure", op: "eq", value: true }] }, repeat: "once", effects: [trend("temp", 39.2, 900, "doenca", 10), trend("lactate", 10, 900, "doenca", 10), trend("spo2", 80, 600, "doenca", 10), trend("ph", 7.08, 900, "doenca", 10), outcome("complicacao")] },
    { id: "r-pcr", description: "Crise contínua por 45 min sem tratamento: parada (desfecho definido pelo caso)", priority: 100, when: { all: [{ time: "gte", seconds: 2700 }, { path: "flags.seizure", op: "eq", value: true }, { not: BENZO }] }, repeat: "once", effects: [flag("seizure", false), flag("pulse", false), flag("rhythm", "assistolia"), { type: "setValue", var: "hr", value: 0 }, { type: "setValue", var: "rr", value: 0 }, outcome("parada", true)] }
  ],
  diagnosis: { primary: "estado_mal_epileptico", accepted: ["estado_mal_epileptico"], differentials: ["hipoglicemia", "meningite_bacteriana", "abstinencia_alcool", "hiponatremia", "avc_hemorragico", "sincope"] },
  acceptedDestinations: ["uti", "internacao_enfermaria"],
  outcomeNotes: "Benzodiazepínico cessa a crise; sem segunda fase (fenitoína 18–20 mg/kg), há recorrência em ~10 min. Com as duas fases, recuperação gradual. Sem tratamento: complicações aos 25 min e parada aos 45 min (didático).",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Identificou epilepsia com suspensão do anticonvulsivante e álcool", evidence: { kind: "historyAsked", items: ["h-epilepsia", "h-alcool"], minCount: 2 }, points: 8, severity: "importante", rationale: "Suspensão de fármaco é causa comum de estado de mal." },
    { id: "s-hist-causa", domain: "historia", description: "Pesquisou trauma, febre e diabetes", evidence: { kind: "historyAsked", items: ["h-trauma", "h-diabetes"], minCount: 1 }, points: 4, severity: "menor", rationale: "Causas secundárias." },
    { id: "s-exame", domain: "historia", description: "Examinou via aérea, pupilas e neurológico", evidence: { kind: "examDone", regions: ["boca", "olhos", "neurologico", "geral"], minCount: 2 }, points: 8, severity: "importante", rationale: "Sinais focais sugerem lesão estrutural." },
    { id: "s-abc", domain: "priorizacao", description: "Proteção (posição/aspiração) e O₂", evidence: { kind: "actionDone", anyOf: ["posicao_seguranca", "aspirar_via_aerea", "o2_mascara_reservatorio", "o2_cateter"], withinSeconds: 180 }, points: 6, severity: "importante", rationale: "Prevenir aspiração e hipoxemia." },
    { id: "s-hgt", domain: "priorizacao", description: "Glicemia capilar em até 5 min", evidence: { kind: "actionDone", anyOf: ["glicemia_capilar"], withinSeconds: 300 }, points: 6, severity: "critica", rationale: "Hipoglicemia é causa tratável.", sourceIds: ["INT-AES-2016"] },
    { id: "s-benzo", domain: "tratamento", description: "Benzodiazepínico em até 5 minutos", evidence: { kind: "drugGiven", anyOf: ["diazepam", "midazolam"], withinSeconds: 300 }, points: 12, severity: "critica", rationale: "Primeira fase: diazepam IV 0,15–0,2 mg/kg (máx. 10 mg/dose) ou midazolam IM 10 mg se > 40 kg.", alternatives: "Midazolam IM sem acesso venoso.", sourceIds: ["INT-AES-2016"] },
    { id: "s-fenitoina", domain: "tratamento", description: "Segunda fase: fenitoína 18–20 mg/kg IV", evidence: { kind: "drugGiven", anyOf: ["fenitoina"], minTotal: { value: 900, unit: "mg" } }, points: 12, severity: "critica", rationale: "Previne recorrência quando a crise persiste ou recorre.", sourceIds: ["INT-AES-2016"] },
    { id: "s-acesso", domain: "tratamento", description: "Acesso venoso", evidence: { kind: "actionDone", anyOf: ["acesso_venoso", "acesso_io"] }, points: 3, severity: "importante", rationale: "Para fármacos de segunda fase." },
    { id: "s-exames", domain: "exames", description: "Eletrólitos/gasometria e investigação dirigida", evidence: { kind: "testOrdered", anyOf: ["eletrolitos", "gaso_venosa", "gaso_arterial"] }, points: 8, severity: "importante", rationale: "Sódio, cálcio, magnésio e acidose." },
    { id: "s-exames-excesso", domain: "exames", description: "Sem exames que atrasem o tratamento", evidence: { kind: "testsNotExcessive", maxUnjustified: 1, justified: ["eletrolitos", "gaso_venosa", "gaso_arterial", "hemograma", "funcao_renal", "tc_cranio", "cpk", "ecg12"] }, points: 7, severity: "menor", rationale: "TC após estabilização se primeira crise, trauma ou déficit." },
    { id: "s-reav", domain: "reavaliacao", description: "Monitorização e reavaliação neurológica após tratamento", evidence: { kind: "reassessAfter", after: ["diazepam", "midazolam", "fenitoina"], reassess: ["monitorizacao_continua", "avaliar_glasgow", "neurologico", "oximetria_portatil"], withinSeconds: 1200 }, points: 10, severity: "importante", rationale: "Detectar recorrência, depressão respiratória e estado de mal não convulsivo." },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de estado de mal epiléptico", evidence: { kind: "diagnosis", accepted: ["estado_mal_epileptico"] }, points: 4, severity: "importante", rationale: "Crises sem recuperação da consciência entre elas." },
    { id: "s-destino", domain: "destino", description: "Internação monitorizada", evidence: { kind: "disposition", accepted: ["uti", "internacao_enfermaria"] }, points: 6, severity: "importante", rationale: "Vigilância e retomada do tratamento de manutenção." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Há quanto tempo ele está em crise? O que define estado de mal?" },
      { level: 2, text: "Antes de qualquer anticonvulsivante: via aérea, O₂ e qual exame à beira-leito?" },
      { level: 3, text: "O benzodiazepínico age rápido mas dura pouco." },
      { level: 4, text: "Sugestão explícita: proteger, O₂, glicemia, diazepam IV (ou midazolam IM), depois fenitoína 20 mg/kg IV; investigar causa." }
    ],
    summary: "Homem de 45 anos com epilepsia, sem fenitoína há 2 semanas e uso de álcool, em crises sem recuperação da consciência.",
    pathophysiology: "Falha dos mecanismos de término da crise (redução de receptores GABA-A sinápticos e aumento da excitação glutamatérgica) torna a crise autossustentada e progressivamente refratária a benzodiazepínicos. Crises prolongadas causam hipóxia, acidose, hipertermia, rabdomiólise e lesão neuronal.",
    keyPoints: [
      "Estado de mal: crise ≥ 5 min ou crises sem recuperação entre elas.",
      "Tempo é crítico: benzodiazepínico na primeira fase.",
      "Segunda fase com fenitoína (ou alternativas) mesmo que a crise ceda, se há risco de recorrência.",
      "Glicemia sempre; corrigir causas metabólicas.",
      "Retomar o tratamento de manutenção e investigar a causa."
    ],
    alternatives: ["Midazolam IM 10 mg se não houver acesso venoso.", "Outros fármacos de segunda fase (ex.: valproato, levetiracetam) não estão no catálogo desta versão."],
    oralRubric: [
      { id: "o1", concept: "Definição e tempo", synonyms: ["5 minutos", "estado de mal", "sem recuperação"], weight: 1 },
      { id: "o2", concept: "ABC e glicemia", synonyms: ["via aérea", "oxigênio", "glicemia"], weight: 2 },
      { id: "o3", concept: "Benzodiazepínico", synonyms: ["diazepam", "midazolam", "benzodiazepínico"], weight: 3 },
      { id: "o4", concept: "Segunda fase", synonyms: ["fenitoína", "fenitoina", "segunda fase"], weight: 3 }
    ],
    simplifications: ["Recorrência em 10 min sem segunda fase e demais tempos são parâmetros didáticos."]
  },
  references: ["INT-AES-2016", "BR-SAMU-SAV", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 0, allowVisualVariation: true, forbidden: ["peso"] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Proteção, O₂, glicemia, diazepam, fenitoína", commands: [act(5, "posicao_seguranca"), act(10, "o2_mascara_reservatorio", { fluxo: 15 }), act(20, "glicemia_capilar"), act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(260, "diazepam", "amp10", 10, "mg", "IV"), act(300, "monitorizar"), rx(400, "fenitoina", "amp250", 20, "mg/kg", "IV", "infusao_volume", { durationMinutes: 20 }), ask(420, "h-epilepsia"), act(2700, "avaliar_glasgow"), dx(3000, "estado_mal_epileptico"), dest(3000, "internacao_enfermaria")], runUntilSeconds: 3200, expect: [{ condition: { ruleFired: "r-recupera" }, description: "recuperação" }, { condition: { not: { ruleFired: "r-recorrencia" } }, description: "sem recorrência" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem tratamento", commands: [], runUntilSeconds: 2800, expect: [{ condition: { ruleFired: "r-crise-prolongada" }, description: "complicações" }, { condition: { ruleFired: "r-pcr" }, description: "parada" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Só benzodiazepínico, sem segunda fase", commands: [act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(260, "diazepam", "amp10", 10, "mg", "IV")], runUntilSeconds: 1200, expect: [{ condition: { ruleFired: "r-recorrencia" }, description: "recorrência" }] },
    { id: "t-atraso", kind: "delay", description: "Benzodiazepínico só aos 30 min", commands: [act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(1800, "diazepam", "amp10", 10, "mg", "IV"), rx(1900, "fenitoina", "amp250", 20, "mg/kg", "IV", "infusao_volume", { durationMinutes: 20 })], runUntilSeconds: 4500, expect: [{ condition: { ruleFired: "r-crise-prolongada" }, description: "complicações pelo atraso" }, { condition: { ruleFired: "r-recupera" }, description: "recuperação tardia" }] },
    { id: "t-alternativa", kind: "alternative", description: "Midazolam IM sem acesso, depois fenitoína", commands: [act(10, "o2_mascara_reservatorio", { fluxo: 15 }), rx(40, "midazolam", "amp15", 10, "mg", "IM"), act(100, "acesso_venoso"), act(200, "acesso_venoso"), rx(300, "fenitoina", "amp250", 20, "mg/kg", "IV", "infusao_volume", { durationMinutes: 20 })], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-recupera" }, description: "recuperação" }] }
  ]
};
