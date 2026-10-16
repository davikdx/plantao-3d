import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, hi, obs, outcome, rx, staff, trend } from "./helpers";

const EXPANSAO = { any: [{ drugGiven: "sf09", minTotal: { value: 200, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 200, unit: "mL" as const } }] };
const EXP_INICIO = { any: [{ drugGiven: "sf09", minTotal: { value: 100, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 100, unit: "mL" as const } }] };
const MANUTENCAO = { any: [{ drugGiven: "sf09", minTotal: { value: 900, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 900, unit: "mL" as const } }, { all: [EXPANSAO, { drugGiven: "sro" }] }] };

export const C083: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C083",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Criança molinha depois de dias de diarreia",
  teachingTitle: "Desidratação grave por diarreia aguda na criança — Plano C",
  group: "Pediatria e neonatologia",
  specialties: ["Pediatria", "Emergência"],
  environment: "pediatria",
  resourceProfile: "upa-porte-ii",
  difficulty: 2,
  level: "internato",
  objectives: [
    "Classificar o estado de hidratação pelos sinais clínicos",
    "Reconhecer desidratação grave e indicar o Plano C",
    "Obter acesso venoso ou intraósseo rapidamente",
    "Calcular volume por peso e reavaliar a cada etapa",
    "Medir glicemia e orientar continuidade (SRO, alimentação, sinais de alarme)"
  ],
  keywords: ["diarreia", "vômito", "criança", "desidratação", "moleza"],
  patient: {
    name: "Davi Lucas (criança)",
    ageYears: 1.5,
    ageMonths: 6,
    sex: "masculino",
    weightKg: 10,
    heightCm: 80,
    visual: { ageGroup: "crianca_pequena", sex: "masculino", skinTone: 6, hairStyle: "crespo_curto", hairColor: "preto", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "UPA 24h, sala pediátrica. Criança de 1 ano e 6 meses trazida pela avó por diarreia líquida há 3 dias e vômitos desde ontem; hoje está \"molinha\". Peso atual 10 kg (cartão: 11 kg há 1 mês).",
  communication: "incapaz",
  informants: [{ id: "avo", name: "Dona Zélia", role: "Avó" }],
  history: [
    hi("h-queixa", "queixa", "O que está acontecendo com ele?", [{ source: "avo", text: "Diarreia de água, umas 10 vezes por dia, desde segunda. Ontem começou a vomitar tudo e hoje está molinho, não quer nada." }], ["acontecendo"]),
    hi("h-diurese", "alimentacao_eliminacoes", "Ele tem feito xixi? Está bebendo?", [{ source: "avo", text: "A fralda está seca desde a madrugada. Ontem bebia água com sede, hoje nem aceita." }], ["xixi", "fralda", "bebendo", "sede"]),
    hi("h-sangue", "sinais_alarme", "Tem sangue nas fezes ou febre alta?", [{ source: "avo", text: "Sangue não. Teve febre de 38 no primeiro dia." }], ["sangue", "febre"]),
    hi("h-convulsao", "sinais_alarme", "Ele teve convulsão ou ficou difícil de acordar?", [{ source: "avo", text: "Convulsão não, mas está dormindo muito, difícil de despertar." }], ["convulsão", "acordar"]),
    hi("h-sro", "medicacoes", "Deram soro de reidratação oral ou algum remédio?", [{ source: "avo", text: "Dei soro caseiro, mas ele vomitava. Não deram remédio." }], ["soro", "remédio"]),
    hi("h-contexto", "social", "Onde vocês moram? Tem água tratada?", [{ source: "avo", text: "Moramos na zona rural; a água é de poço. Outras crianças da creche tiveram diarreia." }], ["água", "mora", "creche"]),
    hi("h-vacina", "vacinacao", "As vacinas estão em dia? Tomou a do rotavírus?", [{ source: "avo", text: "Está em dia, tomou a do rotavírus." }], ["vacina", "rotavírus"]),
    hi("h-antecedentes", "antecedentes", "Ele tem alguma doença?", [{ source: "avo", text: "Nenhuma." }], ["doença"])
  ],
  initial: {
    vars: { hr: 172, sbp: 74, dbp: 42, rr: 40, spo2: 98, temp: 37.4, gcs: 12, pain: 0, glucose: 62, perfusion: 0.4, effort: 1, urine: 0, na: 133, k: 3.2, cl: 102, hco3: 14, ph: 7.27, pco2: 30, be: -10, lactate: 3.6, urea: 58, creat: 0.6 },
    flags: { rhythm: "taquicardia_sinusal", consciousness: "voz", speech: "nenhuma", communication: "incapaz", posture: "supino", pallor: true },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Hipoativo, letárgico, olhos muito fundos, chora sem lágrimas, respiração rápida e profunda.", { better: [{ when: { ruleFired: "r-reidratado" }, text: "Mais ativo, chora com lágrimas, olhos menos fundos." }] }),
    ex("e-boca", "boca", "inspecao", "Mucosas muito secas.", { better: [{ when: { ruleFired: "r-reidratado" }, text: "Mucosas úmidas." }] }),
    ex("e-pele", "pele", "palpacao", "Sinal da prega: desaparece muito lentamente (> 2 s).", { label: "Sinal da prega", better: [{ when: { ruleFired: "r-reidratado" }, text: "Prega desaparece imediatamente." }] }),
    ex("e-perfusao", "membro_superior_d", "palpacao", "Pulso radial fino e rápido; extremidades frias; enchimento capilar > 3 s.", { better: [{ when: { ruleFired: "r-expansao" }, text: "Pulso mais cheio, enchimento capilar 2 s." }] }),
    ex("e-fontanela", "cabeca", "palpacao", "Fontanela anterior fechada (idade).", {}),
    ex("e-abdome", "abdome_qid", "palpacao", "Abdome flácido, ruídos hidroaéreos aumentados, indolor.", { sound: "ruidos_hidroaereos" })
  ],
  highlightedActions: ["glicemia_capilar", "acesso_venoso", "acesso_io", "monitorizar", "orientacoes_alta"],
  rules: [
    { id: "r-piora", description: "Sem reposição, choque hipovolêmico progride", priority: 10, when: { all: [{ time: "gte", seconds: 1500 }, { not: EXP_INICIO }] }, repeat: "once", effects: [trend("sbp", 58, 900, "doenca", 10), trend("hr", 190, 900, "doenca", 10), trend("perfusion", 0.25, 900, "doenca", 10), flag("consciousness", "dor"), trend("gcs", 9, 600, "doenca", 10), staff("acompanhante", "Ele não está reagindo, doutor!"), outcome("piora")] },
    { id: "r-pcr", description: "Choque não tratado por 40 min: parada (desfecho definido pelo caso)", priority: 100, when: { all: [{ time: "gte", seconds: 2400 }, { not: EXP_INICIO }] }, repeat: "once", effects: [flag("pulse", false), flag("rhythm", "bradicardia_sinusal"), { type: "setValue", var: "hr", value: 30 }, flag("consciousness", "irresponsivo"), outcome("parada", true)] },
    { id: "r-expansao", description: "Fase de expansão (≈ 30 mL/kg): perfusão melhora", priority: 50, when: EXPANSAO, repeat: "once", effects: [trend("sbp", 88, 600, "exp", 50), trend("hr", 145, 600, "exp", 50), trend("perfusion", 0.75, 600, "exp", 50), flag("consciousness", "alerta"), trend("gcs", 14, 600, "exp", 50), outcome("estabilizacao_parcial")] },
    { id: "r-reidratado", description: "Reposição completa (≈ 100 mL/kg ou expansão + SRO): reidratado", priority: 55, when: MANUTENCAO, repeat: "once", effects: [trend("hr", 120, 1800, "manut", 55), trend("urine", 15, 1800, "manut", 55), trend("hco3", 19, 3600, "manut", 55), trend("ph", 7.35, 3600, "manut", 55), flag("pallor", false), outcome("melhora")] },
    { id: "r-glicose", description: "Glicose corrige hipoglicemia", priority: 60, when: { drugGiven: "glicose10" }, repeat: "once", effects: [trend("glucose", 110, 300, "glic", 60)] },
    { id: "r-hipoglicemia", description: "Hipoglicemia não corrigida agrava a letargia", priority: 40, when: { all: [{ time: "gte", seconds: 1200 }, { not: { drugGiven: "glicose10" } }] }, repeat: "once", effects: [trend("glucose", 45, 900, "hipo", 40), obs("Criança mais sonolenta; glicemia em queda.")] },
    { id: "r-sobrecarga", description: "Volume excessivo (> 150 mL/kg) sem reavaliação: edema", priority: 90, when: { any: [{ drugGiven: "sf09", minTotal: { value: 1600, unit: "mL" } }, { drugGiven: "ringer_lactato", minTotal: { value: 1600, unit: "mL" } }] }, repeat: "once", effects: [flag("edema", true), trend("rr", 52, 600, "sobre", 90), obs("Edema palpebral e crepitações em bases: volume excessivo."), outcome("complicacao")] },
  ],
  diagnosis: { primary: "desidratacao_grave", accepted: ["desidratacao_grave"], differentials: ["desidratacao_algum_grau", "sepse_neonatal", "gastroenterite", "cad", "apendicite"] },
  acceptedDestinations: ["observacao", "transferencia_regulada"],
  outcomeNotes: "Plano C: expansão rápida (≈ 30 mL/kg em 30 min para ≥ 1 ano) por via venosa ou intraóssea, depois 70 mL/kg em 2h30, com reavaliação; corrigir hipoglicemia; quando possível, iniciar SRO e alimentação. Sem reposição: choque progride e parada aos 40 min (didático).",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Avaliou diurese, ingestão, vômitos e sangue nas fezes", evidence: { kind: "historyAsked", items: ["h-diurese", "h-sangue", "h-queixa", "h-convulsao"], minCount: 3 }, points: 8, severity: "importante", rationale: "Classificação e sinais de alarme (disenteria, letargia)." },
    { id: "s-exame", domain: "historia", description: "Examinou sinais de desidratação (olhos, mucosas, prega, perfusão)", evidence: { kind: "examDone", regions: ["geral", "boca", "pele", "membro_superior_d"], minCount: 3 }, points: 12, severity: "critica", rationale: "Letargia, olhos muito fundos, prega muito lenta e incapacidade de beber definem desidratação grave.", sourceIds: ["BR-DIARREIA"] },
    { id: "s-hgt", domain: "priorizacao", description: "Glicemia capilar", evidence: { kind: "actionDone", anyOf: ["glicemia_capilar"], withinSeconds: 600 }, points: 6, severity: "importante", rationale: "Hipoglicemia é frequente na criança desidratada e letárgica." },
    { id: "s-acesso", domain: "priorizacao", description: "Acesso vascular (venoso ou intraósseo) em até 10 min", evidence: { kind: "actionDone", anyOf: ["acesso_venoso", "acesso_io"], withinSeconds: 600 }, points: 8, severity: "critica", rationale: "Se falha venosa, intraósseo sem demora." },
    { id: "s-expansao", domain: "tratamento", description: "Expansão com cristaloide ≈ 30 mL/kg", evidence: { kind: "drugGiven", anyOf: ["sf09", "ringer_lactato"], minTotal: { value: 200, unit: "mL" }, withinSeconds: 1800 }, points: 14, severity: "critica", rationale: "Plano C — fase rápida.", alternatives: "SF 0,9% ou Ringer lactato.", sourceIds: ["BR-DIARREIA"] },
    { id: "s-glicose", domain: "tratamento", description: "Corrigiu a hipoglicemia", evidence: { kind: "drugGiven", anyOf: ["glicose10"] }, points: 6, severity: "importante", rationale: "Glicemia 62 mg/dL com letargia." },
    { id: "s-sobrecarga", domain: "tratamento", description: "Falha: volume excessivo sem reavaliação", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-sobrecarga" } }, points: 6, penalty: true, severity: "importante", rationale: "Volume por peso, em etapas, com reavaliação." },
    { id: "s-exames", domain: "exames", description: "Eletrólitos/gasometria quando disponíveis, sem atrasar a hidratação", evidence: { kind: "testsNotExcessive", maxUnjustified: 1, justified: ["eletrolitos", "gaso_venosa", "funcao_renal", "hemograma"] }, points: 15, severity: "menor", rationale: "O tratamento não depende de exames." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou após a expansão", evidence: { kind: "reassessAfter", after: ["sf09", "ringer_lactato"], reassess: ["geral", "membro_superior_d", "pele", "boca", "monitorizacao_continua", "medir_fc_pulso"], withinSeconds: 2400 }, points: 10, severity: "importante", rationale: "Reavaliar a cada etapa para decidir repetir ou passar à manutenção." },
    { id: "s-orientacoes", domain: "destino", description: "Orientou SRO, alimentação, zinco e sinais de alarme", evidence: { kind: "actionDone", anyOf: ["orientacoes_alta"] }, points: 3, severity: "menor", rationale: "Continuidade do cuidado." },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de desidratação grave", evidence: { kind: "diagnosis", accepted: ["desidratacao_grave"] }, points: 4, severity: "importante", rationale: "Dois ou mais sinais de gravidade." },
    { id: "s-destino", domain: "destino", description: "Observação até reidratação (ou internação regulada)", evidence: { kind: "disposition", accepted: ["observacao", "transferencia_regulada"] }, points: 6, severity: "importante", rationale: "Alta só após reidratação, aceitação oral e diurese." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Quais sinais classificam o grau de desidratação?" },
      { level: 2, text: "Ele consegue beber? Isso define a via de reidratação." },
      { level: 3, text: "Perda de água e sódio reduz o volume circulante; a criança compensa com taquicardia até descompensar." },
      { level: 4, text: "Sugestão explícita: glicemia, acesso venoso (ou IO), SF 0,9% 30 mL/kg em 30 min, reavaliar, corrigir hipoglicemia, completar o Plano C e observar." }
    ],
    summary: "Criança de 1a6m com diarreia aguda e vômitos, letárgica, olhos muito fundos, prega muito lenta, sem diurese e com hipoglicemia: desidratação grave.",
    pathophysiology: "Perdas fecais e por vômito de água e eletrólitos reduzem o volume extracelular; a acidose metabólica decorre da perda de bicarbonato e da hipoperfusão (lactato). Lactentes têm maior área de superfície e menor reserva, descompensando rapidamente; o jejum e o esgotamento do glicogênio levam à hipoglicemia.",
    keyPoints: [
      "Classificação clínica define o plano (A, B ou C).",
      "Plano C: reposição EV rápida por peso, em etapas, com reavaliação.",
      "Intraósseo quando o acesso venoso falha.",
      "Glicemia na criança letárgica.",
      "Retomar SRO e alimentação assim que possível; zinco conforme protocolo."
    ],
    alternatives: ["Ringer lactato ou SF 0,9%.", "Acesso intraósseo."],
    oralRubric: [
      { id: "o1", concept: "Classificação da desidratação", synonyms: ["desidratação grave", "plano c", "classificação"], weight: 2 },
      { id: "o2", concept: "Volume por peso", synonyms: ["ml/kg", "30 ml", "por peso", "expansão"], weight: 3 },
      { id: "o3", concept: "Acesso IO se necessário", synonyms: ["intraósseo", "intraosseo", "io"], weight: 1 },
      { id: "o4", concept: "Glicemia", synonyms: ["glicemia", "hipoglicemia", "glicose"], weight: 2 },
      { id: "o5", concept: "Reavaliação", synonyms: ["reavaliar", "reavaliação"], weight: 1 }
    ],
    simplifications: ["Volumes do Plano C obtidos de fonte secundária e pendentes de conferência no documento oficial.", "Tempos de resposta são didáticos."]
  },
  references: ["BR-DIARREIA", "BR-SAMU-SAV", "AUTOR-SIMPLIFICACAO"],
  procedureFailures: [{ actionId: "acesso_venoso", attempts: [1, 2] }],
  variation: { allowAgeShiftYears: 0, allowSexSwap: true, allowWeightPercent: 10, allowVisualVariation: true, forbidden: ["idade"] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Glicemia, 2 falhas venosas → IO, SF 30 mL/kg, glicose, completa Plano C", commands: [act(5, "glicemia_capilar"), ask(30, "h-diurese"), act(40, "acesso_venoso"), act(140, "acesso_venoso"), act(240, "acesso_io"), rx(310, "sf09", "bolsa500", 30, "mL/kg", "IO", "infusao_volume", { durationMinutes: 30 }), rx(320, "glicose10", "frasco250", 0.2, "g/kg", "IV"), rx(2200, "sf09", "bolsa1000", 70, "mL/kg", "IO", "infusao_volume", { durationMinutes: 150 }), act(2300, "monitorizar"), dx(11000, "desidratacao_grave"), dest(11000, "observacao")], runUntilSeconds: 11500, expect: [{ condition: { ruleFired: "r-reidratado" }, description: "reidratado" }, { condition: { not: { ruleFired: "r-sobrecarga" } }, description: "sem sobrecarga" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem reposição", commands: [], runUntilSeconds: 2500, expect: [{ condition: { ruleFired: "r-piora" }, description: "piora" }, { condition: { ruleFired: "r-pcr" }, description: "parada" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Reposição lenta (30 mL/kg em 4 h) como se fosse manutenção, sem corrigir glicemia", commands: [act(40, "acesso_io"), rx(110, "sf09", "bolsa500", 30, "mL/kg", "IO", "infusao_volume", { durationMinutes: 240 })], runUntilSeconds: 2000, expect: [{ condition: { ruleFired: "r-piora" }, description: "choque progride" }, { condition: { ruleFired: "r-hipoglicemia" }, description: "hipoglicemia agrava" }] },
    { id: "t-atraso", kind: "delay", description: "Insiste em acesso venoso e só faz IO aos 20 min", commands: [act(40, "acesso_venoso"), act(400, "acesso_venoso"), act(1200, "acesso_io"), rx(1270, "sf09", "bolsa500", 30, "mL/kg", "IO", "infusao_volume", { durationMinutes: 30 })], runUntilSeconds: 3500, expect: [{ condition: { ruleFired: "r-piora" }, description: "piora pelo atraso" }, { condition: { ruleFired: "r-expansao" }, description: "expansão tardia" }] },
    { id: "t-alternativa", kind: "alternative", description: "Ringer lactato e SRO após estabilização", commands: [act(5, "glicemia_capilar"), act(40, "acesso_io"), rx(110, "ringer_lactato", "bolsa500", 30, "mL/kg", "IO", "infusao_volume", { durationMinutes: 30 }), rx(120, "glicose10", "frasco250", 0.2, "g/kg", "IV"), rx(2400, "sro", "env", 50, "mL/kg", "VO", "infusao_volume", { durationMinutes: 240 })], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-reidratado" }, description: "reidratado" }] }
  ]
};
