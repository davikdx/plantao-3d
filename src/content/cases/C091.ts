import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, hi, obs, outcome, rx, staff, trend } from "./helpers";

const NALOX = { drugGiven: "naloxona" };
const VENT = { any: [{ deviceActive: "bvm" }, { deviceActive: "tot" }] };

export const C091: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C091",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Jovem que não acorda direito em casa",
  teachingTitle: "Depressão respiratória por opioide — ventilação, reversão e renarcotização",
  group: "Toxicologia e acidentes",
  specialties: ["Toxicologia", "Emergência pré-hospitalar"],
  environment: "ambulancia",
  resourceProfile: "samu-usa",
  difficulty: 2,
  level: "internato",
  objectives: [
    "Priorizar via aérea e ventilação antes do antídoto",
    "Medir glicemia em todo rebaixamento",
    "Titular naloxona para restaurar a ventilação, não o despertar completo",
    "Antecipar renarcotização e transportar para observação"
  ],
  keywords: ["sonolento", "respira pouco", "remédio para dor", "pupilas pequenas", "SAMU"],
  patient: {
    name: "Igor Fernandes",
    ageYears: 29,
    sex: "masculino",
    weightKg: 80,
    heightCm: 180,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 3, hairStyle: "curto", hairColor: "castanho", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "SAMU 192 — Unidade de Suporte Avançado. Mãe encontrou o filho de 29 anos \"dormindo pesado e roncando estranho\" no quarto. Ele foi operado do joelho há 5 dias. A equipe já o colocou na maca.",
  communication: "incapaz",
  informants: [{ id: "mae", name: "Dona Lúcia", role: "Mãe" }],
  history: [
    hi("h-evento", "queixa", "O que aconteceu?", [{ source: "mae", text: "Fui chamar ele pro almoço e ele não acordava, respirando muito devagar e com um ronco." }], ["aconteceu"]),
    hi("h-medicacoes", "medicacoes", "Que remédios ele está usando?", [{ source: "mae", text: "Desde a cirurgia do joelho ele toma morfina em comprimido e um remédio para dor de nervo (gabapentina). Ontem reclamou de muita dor; acho que tomou a mais. A cartela está pela metade." }], ["remédio", "morfina", "cartela"]),
    hi("h-hora", "inicio", "Quando foi visto bem pela última vez?", [{ source: "mae", text: "Às 8h ele tomou café comigo e voltou para o quarto. Agora são 12h30." }], ["quando", "última vez"]),
    hi("h-outros", "habitos", "Ele bebe ou usa outras drogas?", [{ source: "mae", text: "Bebe cerveja de vez em quando. Ontem à noite tomou umas latas com os amigos." }], ["bebe", "droga", "álcool"]),
    hi("h-antecedentes", "antecedentes", "Tem alguma doença? Diabetes?", [{ source: "mae", text: "Não tem diabetes nem outra doença. Só essa cirurgia." }], ["doença", "diabetes"]),
    hi("h-intencao", "humor_risco", "Ele estava triste ou falou em se machucar?", [{ source: "mae", text: "Não, estava animado para voltar ao trabalho. Acho que foi pela dor." }], ["triste", "machucar", "intenção"])
  ],
  initial: {
    vars: { hr: 58, sbp: 104, dbp: 62, rr: 5, spo2: 79, temp: 36.0, gcs: 7, pain: 0, glucose: 92, perfusion: 0.7, effort: 0, etco2: 62, ph: 7.18, pco2: 68, hco3: 25 },
    flags: { rhythm: "bradicardia_sinusal", consciousness: "dor", speech: "nenhuma", airway: "risco", cyanosis: true, posture: "supino", communication: "incapaz" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Responde apenas a estímulo doloroso com gemido; respiração lenta e superficial com ronco; cianose labial.", { better: [{ when: { ruleFired: "r-reversao" }, text: "Desperta ao chamado, respira normalmente, sonolento." }] }),
    ex("e-pupilas", "olhos", "inspecao", "Pupilas puntiformes (mióticas), simétricas.", { better: [{ when: { ruleFired: "r-reversao" }, text: "Pupilas mióticas, menos intensas, fotorreagentes." }] }),
    ex("e-via-aerea", "boca", "inspecao", "Queda da base da língua com ronco; sem vômito ou corpo estranho visível.", { better: [{ when: { actionCompleted: "posicionar_via_aerea" }, text: "Após a manobra, o ronco cessa e o fluxo de ar melhora." }] }),
    ex("e-torax", "torax_anterior", "ausculta", "Murmúrio vesicular reduzido por hipoventilação, sem ruídos adventícios.", { sound: "murmurio_normal" }),
    ex("e-neuro", "neurologico", "especial", "Glasgow 7 (O1 V2 M4); sem sinais focais; sem rigidez de nuca.", {}),
    ex("e-cabeca", "cabeca", "inspecao", "Sem sinais de trauma.", {}),
    ex("e-pele", "pele", "inspecao", "Sem marcas de punção venosa; curativo cirúrgico limpo no joelho direito.", {})
  ],
  highlightedActions: ["posicionar_via_aerea", "ventilar_bvm", "glicemia_capilar", "monitorizar", "acesso_venoso", "capnografia"],
  rules: [
    { id: "r-via-aerea", description: "Abertura da via aérea melhora parcialmente o fluxo", priority: 30, when: { actionCompleted: "posicionar_via_aerea" }, repeat: "once", effects: [trend("spo2", 83, 60, "va", 25, 600), flag("airway", "pervia")] },
    { id: "r-ventilacao", description: "Ventilação assistida corrige hipoxemia e hipercapnia", priority: 45, when: VENT, repeat: "while", effects: [trend("spo2", 96, 60, "vent", 45), trend("etco2", 42, 120, "vent", 45), trend("pco2", 44, 180, "vent", 45), flag("cyanosis", false)], onEnd: [{ type: "clearTrend", var: "spo2", slot: "vent" }, { type: "clearTrend", var: "etco2", slot: "vent" }, { type: "clearTrend", var: "pco2", slot: "vent" }] },
    { id: "r-hipoxia", description: "Sem ventilação nem antídoto, hipoxemia progride para parada", priority: 100, when: { all: [{ time: "gte", seconds: 600 }, { not: VENT }, { not: NALOX }] }, repeat: "once", effects: [{ type: "setValue", var: "rr", value: 0 }, flag("pulse", false), flag("rhythm", "assistolia"), { type: "setValue", var: "hr", value: 0 }, staff("acompanhante", "Ele parou de respirar!"), outcome("parada", true)] },
    { id: "r-reversao", description: "Naloxona titulada restaura a ventilação", priority: 60, when: { drugGiven: "naloxona", minTotal: { value: 0.1, unit: "mg" } }, repeat: "once", effects: [trend("rr", 14, 60, "nal", 60, 2700), trend("spo2", 95, 120, "nal", 40, 2700), trend("etco2", 40, 180, "nal", 60, 2700), trend("hr", 76, 120, "nal", 60, 2700), flag("consciousness", "voz"), flag("speech", "palavras"), { type: "changeCommunication", state: "limitada" }, flag("airway", "pervia"), flag("cyanosis", false), outcome("melhora")] },
    { id: "r-dose-alta", description: "Naloxona em dose alta: despertar abrupto, agitação e vômito", priority: 70, when: { drugGiven: "naloxona", minTotal: { value: 2, unit: "mg" } }, repeat: "once", effects: [flag("agitation", true), flag("consciousness", "alerta"), trend("hr", 118, 30, "abrupto", 70, 900), trend("sbp", 156, 60, "abrupto", 70, 900), staff("enfermagem", "Ele acordou agitado, arrancou o oxímetro e vomitou!"), obs("Vômito com via aérea desprotegida aumenta o risco de aspiração."), outcome("complicacao")] },
    { id: "r-renarcotizacao", description: "Naloxona age menos que a morfina: depressão respiratória retorna ~45 min depois", priority: 80, when: { elapsedSince: "drug:naloxona", op: "gte", seconds: 2700 }, repeat: "once", effects: [trend("rr", 6, 120, "renarco", 80), trend("spo2", 84, 180, "renarco", 80), flag("consciousness", "dor"), { type: "changeCommunication", state: "incapaz" }, staff("enfermagem", "Ele voltou a ficar sonolento e respirando pouco!"), outcome("piora")] },
    { id: "r-nova-dose", description: "Nova dose de naloxona após a renarcotização", priority: 90, when: { all: [{ ruleFired: "r-renarcotizacao" }, { drugGiven: "naloxona", minTotal: { value: 0.8, unit: "mg" } }] }, repeat: "once", effects: [trend("rr", 13, 60, "nal2", 90), trend("spo2", 95, 120, "nal2", 90), flag("consciousness", "voz")] },
    { id: "r-regulacao", description: "Regulação orienta destino", when: { actionCompleted: "acionar_samu" }, repeat: "once", effects: [staff("regulacao", "Regulação: intoxicação por opioide de ação prolongada exige observação hospitalar por algumas horas. Vaga na sala de observação da UPA de referência.")] }
  ],
  diagnosis: { primary: "intox_opioide", accepted: ["intox_opioide"], differentials: ["hipoglicemia", "intox_alcool", "intox_benzodiazepinico", "avc_hemorragico", "intox_medicamentosa_intencional"] },
  acceptedDestinations: ["transferencia_regulada"],
  outcomeNotes: "Abrir via aérea e ventilar com BVM evita a parada; naloxona titulada (doses baixas) restaura a ventilação; a renarcotização ocorre ~45 min depois e exige vigilância. Sem ventilação nem antídoto, parada aos 10 min. Dose alta causa despertar abrupto com vômito.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Identificou o opioide, a quantidade e o horário", evidence: { kind: "historyAsked", items: ["h-medicacoes", "h-hora"], minCount: 2 }, points: 8, severity: "importante", rationale: "Tipo de opioide e tempo definem risco de renarcotização." },
    { id: "s-hist-coingestao", domain: "historia", description: "Pesquisou coingestão (álcool/gabapentinoide) e intenção", evidence: { kind: "historyAsked", items: ["h-outros", "h-intencao"], minCount: 1 }, points: 5, severity: "importante", rationale: "Coingestões depressoras e risco autolesivo mudam a conduta." },
    { id: "s-pupilas", domain: "historia", description: "Examinou pupilas e via aérea", evidence: { kind: "examDone", regions: ["olhos", "boca"], minCount: 2 }, points: 7, severity: "importante", rationale: "Miose + bradipneia + rebaixamento: toxíndrome opioide." },
    { id: "s-via-aerea", domain: "priorizacao", description: "Abriu via aérea e ventilou com BVM em até 2 minutos", evidence: { kind: "actionDone", anyOf: ["ventilar_bvm", "posicionar_via_aerea"], withinSeconds: 120 }, points: 14, severity: "critica", rationale: "Hipoxemia mata antes do antídoto agir; ventilar primeiro.", sourceIds: ["INT-AHA"] },
    { id: "s-hgt", domain: "priorizacao", description: "Glicemia capilar", evidence: { kind: "actionDone", anyOf: ["glicemia_capilar"], withinSeconds: 600 }, points: 6, severity: "importante", rationale: "Hipoglicemia é diferencial obrigatório." },
    { id: "s-naloxona", domain: "tratamento", description: "Naloxona", evidence: { kind: "drugGiven", anyOf: ["naloxona"] }, points: 12, severity: "critica", rationale: "Antagonista competitivo; via IV, IM ou intranasal.", sourceIds: ["INT-AHA"] },
    { id: "s-dose-alta", domain: "tratamento", description: "Dose inicial alta (≥ 2 mg) causando despertar abrupto", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-dose-alta" } }, points: 6, penalty: true, severity: "importante", rationale: "Titular em doses pequenas: o objetivo é ventilação adequada." },
    { id: "s-monitor", domain: "tratamento", description: "Monitorização e capnografia", evidence: { kind: "actionDone", anyOf: ["monitorizar", "capnografia"] }, points: 6, severity: "importante", rationale: "EtCO₂ é sensível à hipoventilação." },
    { id: "s-exames", domain: "exames", description: "Sem exames desnecessários no pré-hospitalar", evidence: { kind: "testsNotExcessive", maxUnjustified: 0, justified: ["ecg12"] }, points: 15, severity: "menor", rationale: "No pré-hospitalar, glicemia e monitorização bastam." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou FR/SpO₂/consciência após a naloxona", evidence: { kind: "reassessAfter", after: ["naloxona"], reassess: ["monitorizacao_continua", "oximetria_portatil", "avaliar_glasgow", "geral"], withinSeconds: 600 }, points: 10, severity: "importante", rationale: "Detectar resposta insuficiente e renarcotização." },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de intoxicação por opioide", evidence: { kind: "diagnosis", accepted: ["intox_opioide"] }, points: 3, severity: "importante", rationale: "Toxíndrome clássica com resposta ao antídoto." },
    { id: "s-regulacao", domain: "destino", description: "Contato com a regulação", evidence: { kind: "actionDone", anyOf: ["acionar_samu", "passagem_caso"] }, points: 4, severity: "importante", rationale: "Destino definido com a central.", sourceIds: ["BR-SAMU"] },
    { id: "s-destino", domain: "destino", description: "Transporte para observação hospitalar", evidence: { kind: "disposition", accepted: ["transferencia_regulada"] }, points: 4, severity: "critica", rationale: "Liberar no local após a naloxona é inseguro: renarcotização." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Qual é a ameaça imediata à vida: o opioide ou a hipoxemia?" },
      { level: 2, text: "Olhe as pupilas e a frequência respiratória." },
      { level: 3, text: "A naloxona dura menos que muitos opioides." },
      { level: 4, text: "Sugestão explícita: abrir via aérea, ventilar com BVM e O₂, glicemia, naloxona em doses tituladas, monitorizar e transportar para observação." }
    ],
    summary: "Homem de 29 anos em pós-operatório com morfina oral, gabapentina e álcool, encontrado com FR 5, SpO₂ 79%, miose e Glasgow 7.",
    pathophysiology: "Opioides agonistas μ deprimem a resposta do centro respiratório ao CO₂, causando hipoventilação, hipercapnia e hipoxemia; gabapentinoides e álcool potencializam o efeito. A naloxona desloca o opioide do receptor por 30–90 min, enquanto a morfina oral (sobretudo em superdosagem) pode agir por mais tempo.",
    keyPoints: [
      "Ventilar antes do antídoto.",
      "Glicemia capilar em todo rebaixamento.",
      "Naloxona titulada para ventilação adequada, não para despertar completo.",
      "Renarcotização é esperada com opioides de ação prolongada: observar.",
      "Avaliar intencionalidade e coingestões."
    ],
    alternatives: ["Naloxona IM ou intranasal se não houver acesso venoso."],
    oralRubric: [
      { id: "o1", concept: "Ventilar primeiro", synonyms: ["ventilar", "via aérea", "bvm", "ambu"], weight: 3 },
      { id: "o2", concept: "Naloxona titulada", synonyms: ["naloxona", "titular", "dose baixa"], weight: 3 },
      { id: "o3", concept: "Glicemia", synonyms: ["glicemia", "hgt"], weight: 1 },
      { id: "o4", concept: "Renarcotização/observação", synonyms: ["renarcotização", "observação", "volta", "duração"], weight: 2 }
    ],
    simplifications: ["Momento da renarcotização (45 min) é parâmetro didático.", "Doses de naloxona devem ser conferidas na diretriz vigente (validação pendente)."]
  },
  references: ["INT-AHA", "BR-SAMU-SAV", "BR-SAMU", "BR-CIATOX", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Via aérea, BVM, glicemia, naloxona titulada, observação da renarcotização", commands: [act(5, "posicionar_via_aerea"), act(10, "ventilar_bvm"), act(30, "glicemia_capilar"), act(40, "monitorizar"), ask(60, "h-medicacoes"), act(90, "acesso_venoso"), act(190, "acesso_venoso"), rx(300, "naloxona", "amp04", 0.1, "mg", "IV"), rx(420, "naloxona", "amp04", 0.1, "mg", "IV"), act(600, "acionar_samu"), rx(3100, "naloxona", "amp04", 0.4, "mg", "IV"), rx(3200, "naloxona", "amp04", 0.4, "mg", "IV"), dx(3300, "intox_opioide"), dest(3300, "transferencia_regulada")], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-reversao" }, description: "reversão" }, { condition: { not: { ruleFired: "r-dose-alta" } }, description: "sem despertar abrupto" }, { condition: { ruleFired: "r-nova-dose" }, description: "renarcotização tratada" }, { condition: { path: "vars.spo2", op: "gte", value: 92 }, description: "SpO₂ ≥ 92" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 700, expect: [{ condition: { ruleFired: "r-hipoxia" }, description: "parada por hipóxia" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Naloxona 2 mg IV sem ventilar antes", commands: [act(20, "acesso_venoso"), act(120, "acesso_venoso"), rx(240, "naloxona", "amp04", 2, "mg", "IV")], runUntilSeconds: 600, expect: [{ condition: { ruleFired: "r-dose-alta" }, description: "despertar abrupto com vômito" }] },
    { id: "t-atraso", kind: "delay", description: "Reversão eficaz, mas sem vigilância para renarcotização", commands: [act(10, "ventilar_bvm"), rx(200, "naloxona", "amp04", 0.4, "mg", "IM"), act(300, "retirar_o2")], runUntilSeconds: 3200, expect: [{ condition: { ruleFired: "r-renarcotizacao" }, description: "renarcotização" }] },
    { id: "t-alternativa", kind: "alternative", description: "Naloxona intranasal sem acesso venoso", commands: [act(5, "posicionar_via_aerea"), act(10, "ventilar_bvm"), rx(120, "naloxona", "amp04", 0.8, "mg", "IN")], runUntilSeconds: 900, expect: [{ condition: { ruleFired: "r-reversao" }, description: "reversão" }] }
  ]
};
