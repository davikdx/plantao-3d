import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const NACL3_1 = { drugGiven: "salina_hipertonica", minTotal: { value: 100, unit: "mL" as const } };
const NACL3_2 = { drugGiven: "salina_hipertonica", minTotal: { value: 250, unit: "mL" as const } };
const NACL3_EXCESSO = { drugGiven: "salina_hipertonica", minTotal: { value: 550, unit: "mL" as const } };
const SF_LIBERAL = { drugGiven: "sf09", minTotal: { value: 2000, unit: "mL" as const } };
const NA_CONHECIDO = { any: [{ testCollected: "gaso_venosa" }, { testCollected: "gaso_arterial" }, { testCollected: "eletrolitos" }] };

export const C058: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C058",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Idosa confusa e vomitando que teve uma convulsão em casa",
  teachingTitle: "Hiponatremia com sintomas graves — salina hipertônica em bolus, meta de correção e prevenção da hipercorreção",
  group: "Nefrologia",
  specialties: ["Clínica médica", "Nefrologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Reconhecer hiponatremia com sintomas graves (convulsão, vômitos, rebaixamento) como emergência",
    "Tratar com NaCl 3% em bolus de 150 mL, com sódio após cada bolus",
    "Respeitar o limite de correção (≤ 10 mmol/L nas primeiras 24 h) e reconhecer risco de hipercorreção",
    "Identificar causas (tiazídico, ISRS, baixa ingesta de solutos) e suspender agravantes"
  ],
  keywords: ["confusa", "convulsão", "vômito", "idosa", "sódio", "fraqueza"],
  patient: {
    name: "Maria das Graças Souza",
    ageYears: 72,
    sex: "feminino",
    weightKg: 54,
    heightCm: 152,
    visual: { ageGroup: "idoso", sex: "feminino", skinTone: 3, hairStyle: "coque", hairColor: "grisalho", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Idosa de 72 anos trazida pelo SAMU após crise convulsiva generalizada em casa (cerca de 2 minutos, cedeu sozinha). Há 3 dias com náuseas, vômitos e 'fala enrolada'. Chegou sonolenta, vomitando.",
  communication: "limitada",
  informants: [{ id: "filho", name: "Filho", role: "Acompanhante" }],
  history: [
    hi("h-evolucao", "inicio", "Como começou? Quanto tempo?", [{ source: "filho", text: "Há uns 3 dias, enjoada, vomitando, esquecida. Hoje de manhã travou e se debateu toda." }], ["começou", "quando", "tempo"]),
    hi("h-medicacoes", "medicacoes", "Que remédios ela usa? Houve mudança recente?", [{ source: "filho", text: "Hidroclorotiazida para pressão e há um mês o médico começou sertralina porque ela anda triste." }], ["remédio", "medicação", "diurético", "sertralina"]),
    hi("h-ingesta", "alimentacao_eliminacoes", "Como está comendo e bebendo?", [{ source: "filho", text: "Come muito pouco, só chá e torrada, mas bebe muita água porque disseram que faz bem." }], ["comendo", "bebendo", "água", "alimentação"]),
    hi("h-trauma", "sinais_alarme", "Bateu a cabeça? Teve febre?", [{ source: "filho", text: "Não bateu, estava na cama. Sem febre." }], ["cabeça", "febre", "queda"]),
    hi("h-epilepsia", "antecedentes", "Já teve convulsão antes? Outras doenças?", [{ source: "filho", text: "Nunca. Só pressão alta." }], ["convulsão", "epilepsia", "doença"])
  ],
  initial: {
    vars: { hr: 92, sbp: 138, dbp: 78, rr: 18, spo2: 95, temp: 36.3, gcs: 12, pain: 2, glucose: 104, perfusion: 0.85, effort: 0.2, na: 112, k: 3.3, cl: 80, osm: 236, creat: 0.8, urea: 22, ph: 7.40, hco3: 25, lactate: 1.8, urine: 40 },
    flags: { rhythm: "sinusal", posture: "supino", painVisual: "leve", speech: "palavras", consciousness: "voz" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-neuro", "neurologico", "especial", "Glasgow 12 (O3 V4 M5), confusa, sem déficit focal, sem rigidez de nuca; mordedura lateral de língua.", { label: "Neurológico", better: [{ when: { ruleFired: "r-melhora" }, text: "Glasgow 14, mais orientada, sem náuseas." }, { when: { ruleFired: "r-convulsao" }, text: "Pós-ictal, Glasgow 9." }] }),
    ex("e-geral", "geral", "inspecao", "Mucosas úmidas, sem edema, turgor normal (euvolêmica clinicamente).", { label: "Volemia" }),
    ex("e-torax", "torax_anterior", "ausculta", "Murmúrio presente, sem estertores.", { sound: "murmurio_normal" }),
    ex("e-cabeca", "cabeca", "inspecao", "Sem sinais de trauma.", {})
  ],
  testResults: [
    { testId: "osmolalidade", variants: [{ text: "Osmolalidade sérica 236 mOsm/kg; osmolalidade urinária 410 mOsm/kg; Na urinário 58 mmol/L (laudo educativo)." }] },
    { testId: "tc_cranio", variants: [{ text: "Laudo educativo: sem lesões agudas; discreto apagamento de sulcos." }] },
    { testId: "ecg12", variants: [{ text: "Ritmo sinusal, sem alterações agudas." }] }
  ],
  highlightedActions: ["glicemia_capilar", "monitorizar", "acesso_venoso", "posicao_seguranca"],
  rules: [
    { id: "r-curso", description: "Hiponatremia aguda sobre crônica: edema cerebral progressivo", priority: 10, when: { always: true }, repeat: "once", effects: [trend("na", 110, 3600, "hipona", 10), trend("gcs", 9, 2400, "hipona", 10)] },
    { id: "r-convulsao", description: "Sem salina hipertônica em 15 min: nova convulsão", priority: 30, when: { all: [{ time: "gte", seconds: 900 }, { not: { drugGiven: "salina_hipertonica" } }] }, repeat: "once", effects: [flag("seizure", true), trend("gcs", 7, 300, "conv", 30), trend("spo2", 88, 120, "conv", 30, 600), flag("consciousness", "dor"), staff("enfermagem", "Ela está convulsionando de novo!"), outcome("piora")] },
    { id: "r-fim-convulsao", description: "Crise cede", priority: 31, when: { elapsedSince: "rule:r-convulsao", op: "gte", seconds: 150 }, repeat: "once", effects: [flag("seizure", false)] },
    { id: "r-bolus1", description: "1º bolus de NaCl 3%: sódio sobe ~3–5 mmol/L", priority: 50, when: NACL3_1, repeat: "once", effects: [trend("na", 116, 600, "nacl1", 50), trend("gcs", 13, 900, "nacl1", 50), flag("seizure", false)] },
    { id: "r-melhora", description: "2º bolus: sintomas graves revertem", priority: 55, when: NACL3_2, repeat: "once", effects: [trend("na", 118, 600, "nacl2", 55), trend("gcs", 14, 900, "nacl2", 55), flag("consciousness", "alerta"), flag("speech", "frases"), { type: "changeCommunication", state: "normal" }, outcome("melhora")] },
    { id: "r-hipercorrecao-salina", description: "Bolus repetidos sem checar sódio: hipercorreção", priority: 60, when: NACL3_EXCESSO, repeat: "once", effects: [trend("na", 126, 1200, "hiper", 60)] },
    { id: "r-sf-liberal", description: "SF 0,9% liberal com tiazídico suspenso: aquarese e hipercorreção", priority: 58, when: SF_LIBERAL, repeat: "once", effects: [trend("na", 125, 3600, "sf", 58), trend("urine", 250, 1800, "sf", 58)] },
    { id: "r-hipercorrecao", description: "Elevação > 10 mmol/L: risco de desmielinização osmótica", priority: 70, when: { path: "vars.na", op: "gte", value: 122.5 }, repeat: "once", effects: [staff("laboratorio", "Sódio de controle acima de 122 mmol/L — subiu mais de 10 desde a admissão."), obs("Hipercorreção: risco de síndrome de desmielinização osmótica. Suspender hipertônica; considerar fluido hipotônico ± desmopressina com especialista."), outcome("complicacao")] },
    { id: "r-ss-sem-na", description: "Salina hipertônica sem sódio confirmado", priority: 1, when: { all: [NACL3_1, { not: NA_CONHECIDO }] }, repeat: "once", effects: [] }
  ],
  diagnosis: { primary: "hiponatremia", accepted: ["hiponatremia"], differentials: ["estado_mal_epileptico", "avc_isquemico", "hipoglicemia", "meningite_bacteriana", "encefalopatia_metabolica", "insuficiencia_adrenal"] },
  acceptedDestinations: ["uti"],
  outcomeNotes: "Hiponatremia grave (Na 112) com sintomas graves (convulsão, vômitos, confusão) em idosa com tiazídico, ISRS recente e baixa ingestão de solutos com alta ingestão de água. NaCl 3% 150 mL em 20 min, sódio após cada bolus, segundo bolus se necessário (meta +5 mmol/L), limite de 10 mmol/L em 24 h, suspender tiazídico e sertralina, investigar (osmolalidades, Na urinário) e UTI.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Medicações e ingestão", evidence: { kind: "historyAsked", items: ["h-medicacoes", "h-ingesta"], minCount: 2 }, points: 8, severity: "critica", rationale: "Tiazídico + ISRS + 'tea and toast' + água." },
    { id: "s-hist2", domain: "historia", description: "Excluiu trauma, febre e epilepsia", evidence: { kind: "historyAsked", items: ["h-trauma", "h-epilepsia"], minCount: 1 }, points: 3, severity: "menor", rationale: "Diferenciais da convulsão." },
    { id: "s-glicemia", domain: "priorizacao", description: "Glicemia capilar", evidence: { kind: "actionDone", anyOf: ["glicemia_capilar"], withinSeconds: 180 }, points: 5, severity: "critica", rationale: "Convulsão e rebaixamento." },
    { id: "s-na", domain: "exames", description: "Sódio rápido (gasometria) e eletrólitos", evidence: { kind: "testOrdered", anyOf: ["gaso_venosa", "gaso_arterial", "eletrolitos"], withinSeconds: 600 }, points: 10, severity: "critica", rationale: "Confirma a causa e guia a correção." },
    { id: "s-osm", domain: "exames", description: "Osmolalidade (sérica/urinária)", evidence: { kind: "testOrdered", anyOf: ["osmolalidade"] }, points: 4, severity: "importante", rationale: "Classificação etiológica." },
    { id: "s-exame", domain: "historia", description: "Neurológico e volemia", evidence: { kind: "examDone", regions: ["neurologico", "geral"], minCount: 2 }, points: 5, severity: "importante", rationale: "Gravidade e volemia." },
    { id: "s-nacl3", domain: "tratamento", description: "NaCl 3% em bolus em até 15 min", evidence: { kind: "drugGiven", anyOf: ["salina_hipertonica"], withinSeconds: 900 }, points: 18, severity: "critica", rationale: "Sintomas graves: 150 mL em 20 min, independentemente da causa.", sourceIds: ["INT-SFE-HIPONA"] },
    { id: "s-limite", domain: "tratamento", description: "Falha: hipercorreção (> 10 mmol/L)", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-hipercorrecao" } }, points: 12, penalty: true, severity: "critica", rationale: "Desmielinização osmótica.", sourceIds: ["INT-SFE-HIPONA"] },
    { id: "s-sem-na", domain: "tratamento", description: "Falha: hipertônica sem sódio medido", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-ss-sem-na" } }, points: 4, penalty: true, severity: "importante", rationale: "Confirmar antes ou imediatamente; gasometria dá o sódio em minutos." },
    { id: "s-reav", domain: "reavaliacao", description: "Sódio após cada bolus", evidence: { kind: "reassessAfter", after: ["salina_hipertonica"], reassess: ["gaso_venosa", "gaso_arterial", "eletrolitos"], withinSeconds: 1800 }, points: 12, severity: "critica", rationale: "Meta +5 mmol/L; evitar hipercorreção.", sourceIds: ["INT-SFE-HIPONA"] },
    { id: "s-seguranca", domain: "priorizacao", description: "Proteção durante/após convulsão e monitorização", evidence: { kind: "actionDone", anyOf: ["posicao_seguranca", "monitorizar"], withinSeconds: 300 }, points: 4, severity: "importante", rationale: "Risco de aspiração." },
    { id: "s-dx", domain: "destino", description: "Hiponatremia sintomática", evidence: { kind: "diagnosis", accepted: ["hiponatremia"] }, points: 6, severity: "importante", rationale: "Na 112 com convulsão." },
    { id: "s-destino", domain: "destino", description: "UTI", evidence: { kind: "disposition", accepted: ["uti"] }, points: 6, severity: "importante", rationale: "Sódio seriado e risco de hipercorreção." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Primeira convulsão aos 72 anos com vômitos há dias: quais exames rápidos?" },
      { level: 2, text: "A gasometria venosa traz o sódio em minutos." },
      { level: 3, text: "Sintomas graves: a meta é subir pouco e rápido — cerca de 5 mmol/L — e depois frear." },
      { level: 4, text: "Sugestão explícita: glicemia, gasometria, NaCl 3% 150 mL em 20 min, sódio de controle, 2º bolus se necessário, parar com melhora, suspender tiazídico e sertralina, UTI." }
    ],
    summary: "Idosa de 72 anos com hiponatremia grave (Na 112) e sintomas graves, multifatorial: tiazídico, ISRS recente (SIADH), baixa ingestão de solutos e alta ingestão de água.",
    pathophysiology: "A queda do sódio sérico faz a água entrar nos neurônios (edema cerebral) — daí cefaleia, vômitos, confusão e convulsão. Um aumento pequeno e rápido (4–6 mmol/L) reduz o edema. Como o cérebro já se adaptou parcialmente (perda de osmólitos), corrigir demais em 24 h provoca desmielinização osmótica. Ao suspender o tiazídico e repor solutos, pode haver aquarese com subida brusca do sódio.",
    keyPoints: [
      "Sintomas graves (convulsão, vômitos, Glasgow ≤ 8): NaCl 3% 150 mL em 20 min, repetir se necessário.",
      "Meta +5 mmol/L na 1ª hora; parar quando sintomas melhoram, +10 mmol/L ou Na 130.",
      "Limite ≤ 10 mmol/L nas primeiras 24 h; ≤ 8 mmol/L/24 h depois.",
      "Sódio após cada bolus e diurese: aquarese indica risco de hipercorreção.",
      "Suspender tiazídico, ISRS; investigar com osmolalidades e Na urinário."
    ],
    alternatives: ["Desmopressina + hipotônico se hipercorreção (com especialista).", "Restrição hídrica e solutos na fase crônica (SIADH)."],
    oralRubric: [
      { id: "o1", concept: "Salina hipertônica em bolus", synonyms: ["3%", "hipertônica", "150 ml", "bolus"], weight: 3 },
      { id: "o2", concept: "Limite de correção", synonyms: ["10 mmol", "desmielinização", "hipercorreção", "mielinólise"], weight: 3 },
      { id: "o3", concept: "Causas", synonyms: ["tiazídico", "sertralina", "siadh", "ingesta"], weight: 2 }
    ],
    simplifications: ["Desmielinização osmótica (tardia, dias) não é simulada; a hipercorreção é registrada como complicação.", "Sódio responde de forma determinística aos bolus.", "Diazepam pode ser usado para crise em curso, mas não trata a causa."]
  },
  references: ["INT-SFE-HIPONA", "BR-SAMU-SAV", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Glicemia, monitor, gasometria, NaCl 3% × 2 com sódio de controle, osmolalidade, UTI", commands: [act(5, "glicemia_capilar"), act(15, "monitorizar"), ask(25, "h-evolucao"), ask(35, "h-medicacoes"), ask(45, "h-ingesta"), { atSeconds: 55, type: "examine", payload: { region: "neurologico", maneuver: "especial" } }, { atSeconds: 65, type: "examine", payload: { region: "geral", maneuver: "inspecao" } }, act(75, "acesso_venoso"), test(180, "gaso_venosa"), rx(300, "salina_hipertonica", "bolsa150", 150, "mL", "IV", "infusao_volume", { durationMinutes: 20 }), test(500, "osmolalidade"), test(1600, "gaso_venosa"), rx(1700, "salina_hipertonica", "bolsa150", 150, "mL", "IV", "infusao_volume", { durationMinutes: 20 }), test(3000, "gaso_venosa"), dx(3100, "hiponatremia"), dest(3200, "uti")], runUntilSeconds: 4800, expect: [{ condition: { ruleFired: "r-melhora" }, description: "sintomas revertem" }, { condition: { not: { ruleFired: "r-hipercorrecao" } }, description: "sem hipercorreção" }, { condition: { not: { ruleFired: "r-convulsao" } }, description: "sem nova convulsão" }, { condition: { path: "vars.na", op: "gte", value: 115 }, description: "sódio subiu" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 1800, expect: [{ condition: { ruleFired: "r-convulsao" }, description: "nova convulsão" }] },
    { id: "t-inadequada", kind: "inadequate", description: "SF 0,9% liberal e bolus hipertônicos repetidos sem medir sódio", commands: [act(30, "acesso_venoso"), act(130, "acesso_venoso"), rx(200, "salina_hipertonica", "bolsa150", 150, "mL", "IV", "infusao_volume", { durationMinutes: 20 }), rx(1500, "salina_hipertonica", "bolsa150", 150, "mL", "IV", "infusao_volume", { durationMinutes: 20 }), rx(2800, "salina_hipertonica", "bolsa150", 150, "mL", "IV", "infusao_volume", { durationMinutes: 20 }), rx(4100, "salina_hipertonica", "bolsa150", 150, "mL", "IV", "infusao_volume", { durationMinutes: 20 }), rx(250, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), rx(3900, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 })], runUntilSeconds: 9000, expect: [{ condition: { ruleFired: "r-hipercorrecao" }, description: "hipercorreção" }, { condition: { ruleFired: "r-ss-sem-na" }, description: "sem sódio medido" }] },
    { id: "t-atraso", kind: "delay", description: "Espera eletrólitos do laboratório; hipertônica só aos 30 min", commands: [act(30, "acesso_venoso"), test(120, "eletrolitos"), rx(1800, "salina_hipertonica", "bolsa150", 150, "mL", "IV", "infusao_volume", { durationMinutes: 20 }), rx(3300, "salina_hipertonica", "bolsa150", 150, "mL", "IV", "infusao_volume", { durationMinutes: 20 }), test(3200, "gaso_venosa")], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-convulsao" }, description: "convulsão durante a espera" }, { condition: { ruleFired: "r-melhora" }, description: "melhora tardia" }, { condition: { not: { ruleFired: "r-hipercorrecao" } }, description: "sem hipercorreção" }] },
    { id: "t-alternativa", kind: "alternative", description: "Posição de segurança, gasometria arterial e um bolus com melhora parcial", commands: [act(5, "posicao_seguranca"), act(20, "acesso_venoso"), test(130, "gaso_arterial"), rx(250, "salina_hipertonica", "bolsa150", 150, "mL", "IV", "infusao_volume", { durationMinutes: 20 }), test(1600, "gaso_arterial"), dest(2000, "uti")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-bolus1" }, description: "sódio sobe" }, { condition: { not: { ruleFired: "r-hipercorrecao" } }, description: "sem hipercorreção" }] }
  ]
};
