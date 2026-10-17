import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const BZD = { any: [{ drugGiven: "diazepam" }, { drugGiven: "midazolam" }] };
const ANTITERMICO = { any: [{ drugGiven: "dipirona" }, { drugGiven: "paracetamol" }] };
const ORIENTA = { actionCompleted: "orientacoes_alta" };

export const C085: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C085",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Criança de 1 ano e meio com febre que chega convulsionando",
  teachingTitle: "Convulsão febril — interromper a crise prolongada, excluir sinais de gravidade e meningite, evitar exames desnecessários e orientar a família",
  group: "Pediatria",
  specialties: ["Pediatria", "Emergência"],
  environment: "pediatria",
  resourceProfile: "upa-porte-ii",
  difficulty: 2,
  level: "internato",
  objectives: [
    "Proteger a criança durante a crise e tratar com benzodiazepínico se ≥ 5 minutos",
    "Checar glicemia e avaliar sinais de meningite e foco infeccioso",
    "Distinguir convulsão febril simples de complexa",
    "Evitar EEG, neuroimagem e exames de rotina sem indicação",
    "Orientar a família: benignidade, recorrência, antitérmico não previne, o que fazer numa nova crise"
  ],
  keywords: ["convulsão", "febre", "criança", "tremendo", "desmaio", "olhos virados"],
  patient: {
    name: "Alice Ferreira",
    ageYears: 1.6,
    ageMonths: 20,
    sex: "feminino",
    weightKg: 11,
    heightCm: 82,
    visual: { ageGroup: "crianca_pequena", sex: "feminino", skinTone: 3, hairStyle: "cacheado", hairColor: "castanho", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "UPA 24 h porte II, sala de pediatria. Menina de 20 meses trazida no colo pelo pai, 'tremendo e com os olhos virados' há cerca de 6 minutos. Febre desde ontem com coriza.",
  communication: "incapaz",
  informants: [{ id: "pai", name: "Pai", role: "Pai" }],
  history: [
    hi("h-crise", "inicio", "Como começou a crise e há quanto tempo?", [{ source: "pai", text: "Estava no sofá com febre, de repente endureceu e começou a se debater toda, os dois lados. Uns 6 minutos já, no carro." }], ["começou", "crise", "tempo"]),
    hi("h-febre", "fatores_associados", "Desde quando a febre? Outros sintomas?", [{ source: "pai", text: "Febre desde ontem, 39 °C, coriza e puxando a orelha direita." }], ["febre", "sintomas", "orelha"]),
    hi("h-vacinas", "vacinacao", "As vacinas estão em dia?", [{ source: "pai", text: "Todas em dia, a caderneta está aqui." }], ["vacina", "caderneta"]),
    hi("h-antes", "antecedentes", "Já teve convulsão antes? Alguém da família teve?", [{ source: "pai", text: "Nunca. O irmão mais velho teve uma vez com febre." }], ["convulsão", "família", "antes"]),
    hi("h-trauma", "sinais_alarme", "Bateu a cabeça? Tomou algum remédio ou produto? Está com antibiótico?", [{ source: "pai", text: "Não bateu, não tomou nada fora a dipirona. Antibiótico não." }], ["cabeça", "remédio", "antibiótico", "intoxicação"])
  ],
  initial: {
    vars: { hr: 168, sbp: 96, dbp: 58, rr: 34, spo2: 91, temp: 39.4, gcs: 3, pain: 0, glucose: 102, perfusion: 0.85, effort: 0.3 },
    flags: { rhythm: "taquicardia_sinusal", posture: "supino", painVisual: "nenhuma", speech: "nenhuma", consciousness: "irresponsivo", seizure: true },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-neuro", "neurologico", "especial", "Crise tônico-clônica generalizada em curso.", { label: "Neurológico", better: [{ when: { ruleFired: "r-recuperacao" }, text: "Acordada, chorando, move os quatro membros; sem déficit focal; fontanela fechada." }, { when: { ruleFired: "r-bzd" }, text: "Crise cessou; sonolenta (pós-ictal), sem déficit focal evidente." }] }),
    ex("e-meningeo", "pescoco", "especial", "Sem rigidez de nuca; Kernig e Brudzinski negativos.", { label: "Sinais meníngeos" }),
    ex("e-ouvido", "cabeca", "inspecao", "Otoscopia: membrana timpânica direita abaulada e hiperemiada.", { label: "Otoscopia" }),
    ex("e-pele", "pele", "inspecao", "Sem petéquias ou púrpura.", {}),
    ex("e-torax", "torax_anterior", "ausculta", "Murmúrio presente, sem ruídos.", { sound: "murmurio_normal" })
  ],
  testResults: [
    { testId: "liquor", variants: [{ text: "Líquor normal." }] },
    { testId: "hemograma", variants: [{ text: "Leucócitos 14.000/mm³; sem alterações relevantes." }] },
    { testId: "tc_cranio", variants: [{ text: "Laudo educativo: normal." }] }
  ],
  highlightedActions: ["posicao_seguranca", "o2_cateter", "glicemia_capilar", "acesso_venoso"],
  rules: [
    { id: "r-bzd", description: "Benzodiazepínico interrompe a crise", priority: 50, when: BZD, repeat: "once", effects: [flag("seizure", false), trend("spo2", 97, 300, "bzd", 50), trend("gcs", 9, 300, "bzd", 50), trend("hr", 140, 600, "bzd", 50), trend("rr", 26, 300, "bzd", 50), flag("consciousness", "dor")] },
    { id: "r-recuperacao", description: "Recuperação pós-ictal", priority: 55, when: { elapsedSince: "rule:r-bzd", op: "gte", seconds: 1200 }, repeat: "once", effects: [trend("gcs", 15, 900, "rec", 55), flag("consciousness", "alerta"), staff("enfermagem", "Ela acordou e está chorando, mexendo tudo.")] },
    { id: "r-o2", description: "Oxigênio durante a crise", priority: 30, when: { any: [{ deviceActive: "cateter_nasal" }, { deviceActive: "mascara_reservatorio" }] }, repeat: "while", effects: [trend("spo2", 95, 120, "o2", 30)], onEnd: [{ type: "clearTrend", var: "spo2", slot: "o2" }] },
    { id: "r-antitermico", description: "Antitérmico", priority: 20, when: ANTITERMICO, repeat: "once", effects: [trend("temp", 37.8, 2400, "febre", 20)] },
    { id: "r-mal", description: "Crise ≥ 15 min (sem tratamento): estado de mal", priority: 40, when: { all: [{ time: "gte", seconds: 540 }, { not: BZD }] }, repeat: "once", effects: [trend("spo2", 84, 300, "mal", 40), trend("hr", 182, 300, "mal", 40), staff("enfermagem", "Já são 15 minutos de crise! Está ficando arroxeada."), obs("Crise > 15 min: convulsão febril complexa/estado de mal; riscos de hipóxia e lesão."), outcome("piora")] },
    { id: "r-plano", description: "Família orientada", priority: 30, when: { all: [{ ruleFired: "r-recuperacao" }, ORIENTA] }, repeat: "once", effects: [obs("Orientado: benignidade, risco de recorrência (~1/3), antitérmico é para conforto e não previne crise, posição lateral e procurar atendimento se > 5 min."), outcome("melhora")] }
  ],
  diagnosis: { primary: "convulsao_febril", accepted: ["convulsao_febril"], differentials: ["meningite_bacteriana", "estado_mal_epileptico", "hipoglicemia", "intox_medicamentosa_intencional", "crise_epileptica_isolada"] },
  acceptedDestinations: ["observacao", "alta_orientada", "alta_com_seguimento_ubs"],
  outcomeNotes: "Convulsão febril (crise generalizada interrompida com benzodiazepínico antes de 15 min) em criança de 20 meses vacinada, com otite média aguda como foco. Proteção, O₂, glicemia, diazepam IV (ou midazolam IM/IN), exame neurológico e meníngeo após a crise, antitérmico para conforto, tratamento do foco, sem EEG/TC/punção de rotina, observação até recuperação completa e orientação à família.",
  scoring: [
    { id: "s-protecao", domain: "priorizacao", description: "Posição de segurança e O₂ em até 1 min", evidence: { kind: "actionDone", anyOf: ["posicao_seguranca", "o2_cateter", "o2_mascara_reservatorio"], withinSeconds: 60 }, points: 8, severity: "critica", rationale: "Via aérea e oxigenação." },
    { id: "s-glicemia", domain: "priorizacao", description: "Glicemia capilar", evidence: { kind: "actionDone", anyOf: ["glicemia_capilar"], withinSeconds: 300 }, points: 6, severity: "importante", rationale: "Excluir hipoglicemia." },
    { id: "s-bzd", domain: "tratamento", description: "Benzodiazepínico (crise ≥ 5 min) em até 5 min da chegada", evidence: { kind: "drugGiven", anyOf: ["diazepam", "midazolam"], withinSeconds: 300 }, points: 16, severity: "critica", rationale: "Crise prolongada.", sourceIds: ["INT-AES-2016"] },
    { id: "s-hist", domain: "historia", description: "Duração, foco, vacinas, antecedentes, trauma/intoxicação", evidence: { kind: "historyAsked", items: ["h-crise", "h-febre", "h-vacinas", "h-trauma"], minCount: 3 }, points: 8, severity: "importante", rationale: "Simples × complexa; indicação de punção." },
    { id: "s-exame", domain: "historia", description: "Exame neurológico, meníngeo e foco", evidence: { kind: "examDone", regions: ["neurologico", "pescoco", "cabeca", "pele"], minCount: 3 }, points: 10, severity: "critica", rationale: "Afastar meningite; encontrar o foco.", sourceIds: ["INT-AAP-CONVFEBRIL-2011"] },
    { id: "s-exames", domain: "exames", description: "Sem EEG, TC ou exames de rotina", evidence: { kind: "testsNotExcessive", maxUnjustified: 0, justified: ["hemograma"] }, points: 10, severity: "importante", rationale: "Não indicados na convulsão febril simples.", sourceIds: ["INT-AAP-CONVFEBRIL-2011"] },
    { id: "s-antitermico", domain: "tratamento", description: "Antitérmico (conforto)", evidence: { kind: "drugGiven", anyOf: ["dipirona", "paracetamol"] }, points: 4, severity: "menor", rationale: "Conforto; não previne recorrência." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou o estado neurológico após a crise", evidence: { kind: "reassessAfter", after: ["diazepam", "midazolam"], reassess: ["neurologico", "monitorizar", "oximetria_portatil"], withinSeconds: 2400 }, points: 8, severity: "importante", rationale: "Retorno ao basal em até 1 h." },
    { id: "s-orient", domain: "destino", description: "Orientação à família", evidence: { kind: "actionDone", anyOf: ["orientacoes_alta"] }, points: 10, severity: "importante", rationale: "Ansiedade dos pais e conduta numa nova crise." },
    { id: "s-dx", domain: "destino", description: "Convulsão febril", evidence: { kind: "diagnosis", accepted: ["convulsao_febril"] }, points: 6, severity: "importante", rationale: "Febre, idade típica, sem sinais de SNC." },
    { id: "s-destino", domain: "destino", description: "Observação até recuperação e alta orientada", evidence: { kind: "disposition", accepted: ["observacao", "alta_orientada", "alta_com_seguimento_ubs"] }, points: 6, severity: "importante", rationale: "Alta após retorno ao basal." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "A crise já dura 6 minutos. O que fazer agora?" },
      { level: 2, text: "Depois que parar: há sinais de meningite? Onde está o foco da febre?" },
      { level: 3, text: "EEG, TC e exames de sangue mudam algo numa convulsão febril simples?" },
      { level: 4, text: "Sugestão explícita: posição lateral, O₂, glicemia, acesso, diazepam 0,2 mg/kg IV, exame neurológico/meníngeo/otoscopia, antitérmico, observar e orientar a família." }
    ],
    summary: "Menina de 20 meses com crise febril generalizada prolongada (interrompida com benzodiazepínico) e otite média aguda.",
    pathophysiology: "Em crianças de 6 a 60 meses, a febre (geralmente na subida) reduz o limiar convulsivo de um cérebro em maturação, com predisposição genética. A crise simples é generalizada, dura < 15 min e não recorre em 24 h; não causa lesão nem aumenta muito o risco de epilepsia.",
    keyPoints: [
      "Crise ≥ 5 min: benzodiazepínico (IV, IM, IN ou retal).",
      "Glicemia; procurar foco febril e sinais de meningite.",
      "Punção lombar só com sinais meníngeos/suspeita clínica (ou considerar em 6–12 meses sem vacinas/pré-tratados).",
      "Sem EEG, neuroimagem ou exames de rotina.",
      "Orientar: recorrência em ~1/3, antitérmico não previne, primeiros socorros."
    ],
    alternatives: ["Midazolam IM ou intranasal quando não há acesso venoso.", "Diazepam retal no pré-hospitalar."],
    oralRubric: [
      { id: "o1", concept: "Interromper crise prolongada", synonyms: ["benzodiazepínico", "diazepam", "midazolam", "5 minutos"], weight: 3 },
      { id: "o2", concept: "Sinais de gravidade/meningite", synonyms: ["meningite", "rigidez", "foco"], weight: 2 },
      { id: "o3", concept: "Exames desnecessários", synonyms: ["eeg", "tomografia", "exames"], weight: 2 },
      { id: "o4", concept: "Orientação", synonyms: ["recorrência", "antitérmico", "família", "orientação"], weight: 2 }
    ],
    simplifications: ["Amoxicilina para a otite não está no catálogo (prescrição registrada na orientação).", "Diazepam IV exige acesso; vias IN não modeladas."]
  },
  references: ["INT-AAP-CONVFEBRIL-2011", "INT-AES-2016", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 2, allowSexSwap: true, allowWeightPercent: 10, allowVisualVariation: true, forbidden: ["idade < 6 meses ou > 5 anos muda o diagnóstico"] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Posição, O₂, glicemia, acesso, diazepam, exame, antitérmico, orientação, observação", commands: [act(5, "posicao_seguranca"), act(15, "o2_cateter", { fluxo: 2 }), act(25, "glicemia_capilar"), act(35, "acesso_venoso"), rx(150, "diazepam", "amp10", 2.2, "mg", "IV"), ask(200, "h-crise"), ask(210, "h-febre"), ask(220, "h-vacinas"), ask(230, "h-trauma"), act(400, "monitorizar"), { atSeconds: 1500, type: "examine", payload: { region: "neurologico", maneuver: "especial" } }, { atSeconds: 1520, type: "examine", payload: { region: "pescoco", maneuver: "especial" } }, { atSeconds: 1540, type: "examine", payload: { region: "cabeca", maneuver: "inspecao" } }, { atSeconds: 1560, type: "examine", payload: { region: "pele", maneuver: "inspecao" } }, rx(1600, "dipirona", "amp1g", 15, "mg/kg", "IV"), act(2600, "orientacoes_alta"), dx(2700, "convulsao_febril"), dest(2800, "observacao")], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-plano" }, description: "família orientada" }, { condition: { not: { ruleFired: "r-mal" } }, description: "sem estado de mal" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-mal" }, description: "estado de mal" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Espera a crise passar; depois eletrólitos e gasometria de rotina", commands: [act(30, "acesso_venoso"), test(700, "eletrolitos"), test(800, "gaso_venosa")], runUntilSeconds: 2000, expect: [{ condition: { ruleFired: "r-mal" }, description: "estado de mal" }] },
    { id: "t-atraso", kind: "delay", description: "Benzodiazepínico só após 10 min na UPA", commands: [act(5, "posicao_seguranca"), act(30, "acesso_venoso"), rx(600, "diazepam", "amp10", 2.2, "mg", "IV"), act(2000, "orientacoes_alta"), dest(2200, "observacao")], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-mal" }, description: "estado de mal pelo atraso" }, { condition: { ruleFired: "r-recuperacao" }, description: "recuperação" }] },
    { id: "t-alternativa", kind: "alternative", description: "Midazolam IM sem acesso venoso, paracetamol, alta orientada", commands: [act(5, "posicao_seguranca"), act(15, "o2_cateter", { fluxo: 2 }), rx(60, "midazolam", "amp15", 2.2, "mg", "IM"), act(100, "glicemia_capilar"), act(1600, "orientacoes_alta"), dest(2800, "alta_orientada")], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-bzd" }, description: "crise interrompida" }, { condition: { ruleFired: "r-plano" }, description: "família orientada" }] }
  ]
};
