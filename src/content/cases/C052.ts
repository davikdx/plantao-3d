import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const HC = { drugGiven: "hidrocortisona" };
const VOL1 = { any: [{ drugGiven: "sf09", minTotal: { value: 500, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 500, unit: "mL" as const } }] };
const NORA = { treatmentActive: "noradrenalina" };

export const C052: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C052",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Mulher com vômitos há três dias, fraca e com pressão baixa",
  teachingTitle: "Crise adrenal em usuária crônica de corticoide — suspeitar pela história, hidrocortisona parenteral imediata, volume e glicose",
  group: "Endocrinologia",
  specialties: ["Clínica médica", "Endocrinologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "upa-porte-ii",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Perguntar ativamente sobre uso de corticoide em paciente com choque e vômitos",
    "Reconhecer crise adrenal: hipotensão pouco responsiva a volume, vômitos, dor abdominal, hipoglicemia, hiponatremia",
    "Administrar hidrocortisona parenteral sem aguardar exames",
    "Repor volume, corrigir hipoglicemia e tratar o fator desencadeante",
    "Orientar dose de estresse e regular internação"
  ],
  keywords: ["vômito", "fraqueza", "pressão baixa", "tontura", "corticoide", "artrite"],
  patient: {
    name: "Rosângela Pires",
    ageYears: 58,
    sex: "feminino",
    weightKg: 62,
    heightCm: 158,
    visual: { ageGroup: "adulto", sex: "feminino", skinTone: 3, hairStyle: "curto", hairColor: "grisalho", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "UPA 24 h porte II. Mulher de 58 anos trazida pelo marido: vômitos e diarreia há 3 dias, muita fraqueza, tontura ao levantar e dor na barriga. Hoje quase desmaiou no banheiro.",
  communication: "normal",
  informants: [{ id: "marido", name: "Marido", role: "Acompanhante" }],
  history: [
    h("h-queixa", "queixa", "O que a senhora está sentindo?", "Uma fraqueza que não consigo nem ficar em pé… enjoo… dor na barriga toda.", { keywords: ["sentindo"] }),
    h("h-evolucao", "inicio", "Desde quando? Quantas vezes vomitou?", "Três dias… vomito tudo, até água. Diarreia também.", { keywords: ["quando", "vomitou", "diarreia"] }),
    hi("h-cortico", "medicacoes", "Usa algum remédio todo dia? Corticoide, prednisona?", [{ source: "paciente", text: "Prednisona, 20 miligramas, faz mais de um ano, pra artrite." }, { source: "marido", text: "Desde que começou a vomitar ela não conseguiu tomar. Três dias sem." }], ["remédio", "corticoide", "prednisona", "medicação"]),
    hi("h-doencas", "antecedentes", "Tem outras doenças?", [{ source: "paciente", text: "Artrite reumatoide. Só." }], ["doença", "antecedentes"]),
    h("h-febre", "fatores_associados", "Teve febre? Alguém em casa com diarreia?", "Febre baixa no primeiro dia. Meu neto teve diarreia semana passada.", { keywords: ["febre", "casa"] }),
    hi("h-alergias", "alergias", "Tem alergia a remédio?", [{ source: "paciente", text: "Não." }])
  ],
  initial: {
    vars: { hr: 118, sbp: 80, dbp: 46, rr: 22, spo2: 97, temp: 37.4, gcs: 14, pain: 6, glucose: 58, perfusion: 0.5, effort: 0.3, ph: 7.31, hco3: 19, be: -5, lactate: 2.9, na: 127, k: 4.6, cl: 96, creat: 1.6, urea: 78, hb: 13.2, wbc: 9800, plt: 240000, urine: 10 },
    flags: { rhythm: "taquicardia_sinusal", posture: "supino", painVisual: "moderada", speech: "frases", consciousness: "alerta", sweating: true, pallor: true },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Prostrada, mucosas secas, fácies de Cushing (face arredondada), equimoses em antebraços.", { label: "Geral" }),
    ex("e-abdome", "abdome_epigastrio", "palpacao", "Dor difusa leve à palpação, sem defesa ou descompressão dolorosa; ruídos aumentados.", { label: "Abdome" }),
    ex("e-torax", "torax_anterior", "ausculta", "Murmúrio presente, sem estertores.", { sound: "murmurio_normal" }),
    ex("e-neuro", "neurologico", "especial", "Glasgow 14 (sonolenta), sem déficit focal.", { better: [{ when: { ruleFired: "r-hipoglicemia" }, text: "Glasgow 11, confusa e sudoreica." }] }),
    ex("e-pele", "pele", "inspecao", "Pele fina, estrias violáceas abdominais discretas; sem hiperpigmentação.", {})
  ],
  testResults: [
    { testId: "ecg12", variants: [{ text: "Taquicardia sinusal; sem alterações de repolarização." }] }
  ],
  highlightedActions: ["glicemia_capilar", "acesso_venoso", "monitorizar", "acionar_samu"],
  rules: [
    { id: "r-curso", description: "Crise adrenal: vasoplegia, hipovolemia e hipoglicemia progressivas", priority: 10, when: { always: true }, repeat: "once", effects: [trend("sbp", 62, 2400, "crise", 10), trend("dbp", 34, 2400, "crise", 10), trend("hr", 130, 2400, "crise", 10), trend("glucose", 42, 2000, "crise", 10), trend("perfusion", 0.3, 2400, "crise", 10)] },
    { id: "r-volume", description: "Volume sem corticoide: resposta transitória", priority: 25, when: VOL1, repeat: "once", effects: [trend("sbp", 88, 400, "vol", 25, 1500), trend("hr", 112, 400, "vol", 25, 1500)] },
    { id: "r-hc", description: "Hidrocortisona: restaura o tônus vascular", priority: 50, when: HC, repeat: "once", effects: [trend("sbp", 96, 1200, "hc", 50), trend("dbp", 56, 1200, "hc", 50), trend("hr", 102, 1200, "hc", 50), trend("glucose", 95, 2400, "hc", 45), staff("enfermagem", "Depois da hidrocortisona a pressão começou a subir.")] },
    { id: "r-hc-volume", description: "Hidrocortisona + volume: estabilização", priority: 55, when: { all: [HC, VOL1] }, repeat: "once", effects: [trend("sbp", 112, 900, "hcv", 55), trend("dbp", 66, 900, "hcv", 55), trend("hr", 92, 900, "hcv", 55), trend("perfusion", 0.85, 900, "hcv", 55), trend("urine", 50, 1800, "hcv", 55), trend("pain", 2, 1800, "hcv", 55), outcome("melhora")] },
    { id: "r-glicose", description: "Glicose hipertônica corrige a hipoglicemia", priority: 60, when: { drugGiven: "glicose50" }, repeat: "once", effects: [trend("glucose", 120, 120, "g50", 60, 1800), flag("sweating", false)] },
    { id: "r-hipoglicemia", description: "Hipoglicemia sintomática", priority: 30, when: { path: "vars.glucose", op: "lt", value: 50 }, repeat: "once", effects: [flag("consciousness", "voz"), flag("speech", "palavras"), trend("gcs", 11, 300, "hipo", 30), staff("enfermagem", "Ela ficou confusa e suando frio."), outcome("piora")] },
    { id: "r-nora", description: "Vasopressor sem corticoide: resposta parcial", priority: 40, when: NORA, repeat: "while", effects: [trend("sbp", 88, 300, "nora", 40)], onEnd: [{ type: "clearTrend", var: "sbp", slot: "nora" }] },
    { id: "r-refrataria", description: "Sem hidrocortisona em 40 min: choque refratário", priority: 35, when: { all: [{ time: "gte", seconds: 2400 }, { not: HC }] }, repeat: "once", effects: [trend("sbp", 56, 600, "refr", 35), trend("gcs", 10, 600, "refr", 35), flag("consciousness", "voz"), staff("enfermagem", "A pressão não sobe com nada!"), outcome("piora")] },
    { id: "r-pcr", description: "Choque refratário prolongado sem corticoide", priority: 100, when: { all: [{ time: "gte", seconds: 4200 }, { not: HC }] }, repeat: "once", effects: [flag("pulse", false), { type: "setValue", var: "sbp", value: 0 }, { type: "setValue", var: "dbp", value: 0 }, flag("consciousness", "irresponsivo"), staff("enfermagem", "Parou! Sem pulso!"), outcome("parada", true)] },
    { id: "r-regulacao", description: "Regulação", priority: 20, when: { actionCompleted: "acionar_samu" }, repeat: "once", effects: [staff("regulacao", "Regulação: leito de clínica médica no hospital de referência. Encaminhar com hidrocortisona prescrita de 6/6 h (ou infusão) e soro em curso.")] }
  ],
  diagnosis: { primary: "insuficiencia_adrenal", accepted: ["insuficiencia_adrenal"], differentials: ["gastroenterite", "choque_septico", "desidratacao_grave", "hipoglicemia", "pancreatite", "hiponatremia"] },
  acceptedDestinations: ["transferencia_regulada"],
  outcomeNotes: "Crise adrenal em usuária de prednisona 20 mg/dia há mais de 1 ano, que suspendeu o corticoide por vômitos de gastroenterite: hipotensão pouco responsiva a volume, hipoglicemia e hiponatremia. Hidrocortisona 100 mg IV imediata (sem aguardar exames), SF 0,9%, glicose, antiemético e regulação para internação; orientar dose de estresse e regras para dias de doença na alta.",
  scoring: [
    { id: "s-cortico", domain: "historia", description: "Perguntou sobre uso de corticoide", evidence: { kind: "historyAsked", items: ["h-cortico"], minCount: 1 }, points: 12, severity: "critica", rationale: "Uso atual/recente + vômitos + instabilidade = crise adrenal até prova em contrário.", sourceIds: ["INT-ESE-IA-GC-2024"] },
    { id: "s-hist", domain: "historia", description: "Evolução e desencadeante", evidence: { kind: "historyAsked", items: ["h-evolucao", "h-febre"], minCount: 1 }, points: 4, severity: "importante", rationale: "Gastroenterite é desencadeante comum." },
    { id: "s-exame", domain: "historia", description: "Exame geral e abdominal", evidence: { kind: "examDone", regions: ["geral", "abdome_epigastrio"], minCount: 2 }, points: 4, severity: "importante", rationale: "Estigmas de Cushing; afastar abdome agudo." },
    { id: "s-glicemia", domain: "priorizacao", description: "Glicemia capilar em até 3 min", evidence: { kind: "actionDone", anyOf: ["glicemia_capilar"], withinSeconds: 180 }, points: 6, severity: "critica", rationale: "Hipoglicemia é frequente na crise adrenal." },
    { id: "s-acesso", domain: "priorizacao", description: "Acesso venoso e monitorização", evidence: { kind: "actionDone", anyOf: ["acesso_venoso"], withinSeconds: 300 }, points: 4, severity: "importante", rationale: "Choque." },
    { id: "s-hc", domain: "tratamento", description: "Hidrocortisona parenteral em até 20 min", evidence: { kind: "drugGiven", anyOf: ["hidrocortisona"], withinSeconds: 1200 }, points: 16, severity: "critica", rationale: "Não aguardar exames; glicocorticoide parenteral e volume.", sourceIds: ["INT-ESE-IA-GC-2024", "INT-ES-IAP-2016"] },
    { id: "s-volume", domain: "tratamento", description: "SF 0,9%", evidence: { kind: "drugGiven", anyOf: ["sf09", "ringer_lactato"], withinSeconds: 900 }, points: 8, severity: "critica", rationale: "Hipovolemia por vômitos e diarreia.", sourceIds: ["INT-ESE-IA-GC-2024"] },
    { id: "s-glicose", domain: "tratamento", description: "Corrigiu a hipoglicemia", evidence: { kind: "drugGiven", anyOf: ["glicose50"] }, points: 6, severity: "importante", rationale: "Glicemia 58 mg/dL com sintomas." },
    { id: "s-antiemetico", domain: "tratamento", description: "Antiemético", evidence: { kind: "drugGiven", anyOf: ["ondansetrona", "prometazina"] }, points: 2, severity: "menor", rationale: "Conforto e retomada da via oral." },
    { id: "s-labs", domain: "exames", description: "Eletrólitos/gasometria e função renal", evidence: { kind: "testOrdered", anyOf: ["gaso_venosa", "eletrolitos", "funcao_renal"], withinSeconds: 1800 }, points: 4, severity: "importante", rationale: "Hiponatremia, lesão renal pré-renal." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou PA e glicemia após o tratamento", evidence: { kind: "reassessAfter", after: ["hidrocortisona", "glicose50"], reassess: ["medir_pa", "glicemia_capilar", "monitorizar"], withinSeconds: 1500 }, points: 8, severity: "importante", rationale: "Confirmar resposta." },
    { id: "s-regulacao", domain: "destino", description: "Regulou internação", evidence: { kind: "actionDone", anyOf: ["acionar_samu"] }, points: 6, severity: "importante", rationale: "Manter corticoide parenteral e tratar desencadeante." },
    { id: "s-dx", domain: "destino", description: "Insuficiência adrenal aguda", evidence: { kind: "diagnosis", accepted: ["insuficiencia_adrenal"] }, points: 6, severity: "importante", rationale: "Suspensão abrupta de glicocorticoide crônico." },
    { id: "s-destino", domain: "destino", description: "Transferência regulada", evidence: { kind: "disposition", accepted: ["transferencia_regulada"] }, points: 4, severity: "importante", rationale: "Internação hospitalar." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Choque com vômitos: o que mais esta paciente toma todos os dias?" },
      { level: 2, text: "Ela tem face arredondada, pele fina e equimoses." },
      { level: 3, text: "Corticoide crônico suspenso de repente + estresse = eixo suprimido sem reserva." },
      { level: 4, text: "Sugestão explícita: glicemia, acesso, hidrocortisona 100 mg IV já, SF 0,9%, glicose 50%, antiemético, regulação." }
    ],
    summary: "Mulher de 58 anos em uso crônico de prednisona 20 mg/dia que suspendeu o medicamento por gastroenterite, evoluindo com crise adrenal (choque, hipoglicemia, hiponatremia).",
    pathophysiology: "O glicocorticoide exógeno suprime o eixo hipotálamo-hipófise-adrenal; a suspensão abrupta durante estresse (infecção, vômitos) deixa o organismo sem cortisol. O cortisol é necessário para a resposta vascular às catecolaminas, para a gliconeogênese e para a excreção de água livre: sem ele há vasoplegia refratária, hipoglicemia e hiponatremia.",
    keyPoints: [
      "Pergunte sempre sobre corticoide (oral, injetável, inalatório, tópico, intra-articular).",
      "Suspeita de crise adrenal: hidrocortisona parenteral imediata, sem aguardar exames.",
      "Volume (SF 0,9%) e correção de hipoglicemia.",
      "Na insuficiência induzida por glicocorticoide não há hipercalemia típica (mineralocorticoide preservado).",
      "Na alta: dose de estresse em doenças, cartão de alerta e acompanhamento."
    ],
    alternatives: ["Dexametasona se for necessário dosar cortisol antes (não interfere no ensaio), sem atrasar o tratamento.", "Hidrocortisona IM se não houver acesso venoso."],
    oralRubric: [
      { id: "o1", concept: "Corticoide crônico suspenso", synonyms: ["prednisona", "corticoide", "suspensão", "eixo"], weight: 3 },
      { id: "o2", concept: "Hidrocortisona imediata", synonyms: ["hidrocortisona", "100 mg", "não aguardar"], weight: 3 },
      { id: "o3", concept: "Volume e glicose", synonyms: ["soro", "volume", "glicose", "hipoglicemia"], weight: 2 },
      { id: "o4", concept: "Dose de estresse", synonyms: ["estresse", "dias de doença", "orientação"], weight: 1 }
    ],
    simplifications: ["Cortisol sérico não está disponível neste perfil de UPA.", "Manutenção da hidrocortisona (infusão ou 6/6 h) não é simulada.", "Resposta hemodinâmica ao corticoide é determinística."]
  },
  references: ["INT-ESE-IA-GC-2024", "INT-ES-IAP-2016", "BR-SAMU-SAV", "BR-UPA", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 15, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Glicemia, história de corticoide, acesso, hidrocortisona, SF, glicose, antiemético, regulação", commands: [act(5, "glicemia_capilar"), act(15, "monitorizar"), ask(30, "h-evolucao"), ask(45, "h-cortico"), { atSeconds: 60, type: "examine", payload: { region: "geral", maneuver: "inspecao" } }, { atSeconds: 70, type: "examine", payload: { region: "abdome_epigastrio", maneuver: "palpacao" } }, act(80, "acesso_venoso"), test(200, "gaso_venosa"), rx(210, "glicose50", "amp10", 20, "g", "IV"), rx(230, "hidrocortisona", "fa100", 100, "mg", "IV"), rx(250, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 30 }), rx(270, "ondansetrona", "amp4", 4, "mg", "IV"), act(1200, "medir_pa"), act(1250, "glicemia_capilar"), act(1400, "acionar_samu"), dx(1600, "insuficiencia_adrenal"), dest(1700, "transferencia_regulada")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-hc-volume" }, description: "estabilização" }, { condition: { not: { ruleFired: "r-refrataria" } }, description: "sem choque refratário" }, { condition: { path: "vars.sbp", op: "gte", value: 100 }, description: "PAS ≥ 100" }, { condition: { path: "vars.glucose", op: "gte", value: 70 }, description: "glicemia normal" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 4400, expect: [{ condition: { ruleFired: "r-hipoglicemia" }, description: "hipoglicemia" }, { condition: { ruleFired: "r-refrataria" }, description: "choque refratário" }, { condition: { ruleFired: "r-pcr" }, description: "PCR" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Trata como gastroenterite: volume repetido e noradrenalina, sem corticoide", commands: [act(30, "acesso_venoso"), act(130, "acesso_venoso"), rx(250, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 30 }), rx(270, "ondansetrona", "amp4", 4, "mg", "IV"), rx(2000, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 30 }), rx(2600, "noradrenalina", "sol64", 1, "mg", "IV", "infusao", { rate: { value: 0.1, unit: "mcg/kg/min" } })], runUntilSeconds: 4400, expect: [{ condition: { ruleFired: "r-refrataria" }, description: "choque refratário" }, { condition: { ruleFired: "r-hipoglicemia" }, description: "hipoglicemia não reconhecida" }] },
    { id: "t-atraso", kind: "delay", description: "Hidrocortisona só aos 45 min", commands: [act(30, "acesso_venoso"), act(130, "acesso_venoso"), rx(250, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 30 }), rx(2700, "hidrocortisona", "fa100", 100, "mg", "IV"), rx(2720, "glicose50", "amp10", 20, "g", "IV")], runUntilSeconds: 5000, expect: [{ condition: { ruleFired: "r-refrataria" }, description: "choque refratário pelo atraso" }, { condition: { ruleFired: "r-hc-volume" }, description: "estabilização tardia" }, { condition: { not: { ruleFired: "r-pcr" } }, description: "PCR evitada" }] },
    { id: "t-alternativa", kind: "alternative", description: "Hidrocortisona 200 mg antes do volume, depois Ringer", commands: [act(10, "glicemia_capilar"), act(20, "acesso_venoso"), rx(130, "hidrocortisona", "fa100", 200, "mg", "IV"), rx(150, "glicose50", "amp10", 25, "g", "IV"), rx(200, "ringer_lactato", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 30 }), act(600, "acionar_samu"), dest(1500, "transferencia_regulada")], runUntilSeconds: 2500, expect: [{ condition: { ruleFired: "r-hc" }, description: "corticoide" }, { condition: { ruleFired: "r-hc-volume" }, description: "estabilização" }] }
  ]
};
