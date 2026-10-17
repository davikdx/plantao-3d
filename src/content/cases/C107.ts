import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const CARBO = { any: [{ actionCompleted: "carboidrato_oral" }, { drugGiven: "glicose50" }] };
const GLIC_MEDIDA = { actionCompleted: "glicemia_capilar" };
const DEFINIU = { path: "disposition", op: "neq", value: "" };

export const C107: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C107",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Diabético de 67 anos com exame 'alto' que anda tendo suores de madrugada",
  teachingTitle: "DM2 fora da meta com esquema inadequado — hipoglicemias por glibenclamida, metformina acima do limite renal e indicação de iSGLT2 no SUS; metas individualizadas e seguimento",
  group: "Atenção primária",
  specialties: ["Medicina de família", "Endocrinologia"],
  environment: "ubs",
  resourceProfile: "ubs-urbana",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Reconhecer e tratar hipoglicemia na consulta",
    "Revisar o esquema: glibenclamida em idoso com DRC (hipoglicemia) e metformina acima da dose permitida para a TFGe",
    "Trocar por gliclazida MR, ajustar metformina e indicar dapagliflozina conforme critérios do SUS",
    "Individualizar a meta de HbA1c para o idoso",
    "Solicitar seguimento anual (albuminúria, lipídios, pé, fundo de olho) e retorno em 3 meses"
  ],
  keywords: ["diabetes", "exame alto", "suor de madrugada", "consulta", "remédios", "idoso"],
  patient: {
    name: "Sr. Antônio Batista",
    ageYears: 67,
    sex: "masculino",
    weightKg: 84,
    heightCm: 170,
    visual: { ageGroup: "idoso", sex: "masculino", skinTone: 3, hairStyle: "careca", hairColor: "grisalho", build: "obeso", pregnancyTrimester: 0 }
  },
  briefing: "UBS, consulta agendada. Homem de 67 anos com DM2 há 12 anos, hipertenso, angioplastia coronariana em 2022. Traz HbA1c 8,9% e creatinina com TFGe 41 mL/min/1,73 m². Usa metformina 850 mg 3x/dia e glibenclamida 5 mg 2x/dia. Hoje veio em jejum para a consulta e está suando e trêmulo na sala de espera.",
  communication: "normal",
  informants: [{ id: "paciente", name: "Sr. Antônio", role: "Paciente" }],
  history: [
    hi("h-agora", "queixa", "O senhor está suando e tremendo agora? Comeu hoje? Tomou os remédios?", [{ source: "paciente", text: "Tomei a glibenclamida às 6 h e vim sem café para a consulta. Estou meio tremendo, com fome e suando." }], ["agora", "comeu", "tomou", "tremendo"]),
    hi("h-hipos", "sinais_alarme", "Tem acordado suando, com pesadelo, palpitação? Já mediu a glicose nesses momentos?", [{ source: "paciente", text: "Umas duas vezes por semana acordo encharcado de madrugada. Uma vez deu 58 no aparelho da vizinha." }], ["madrugada", "suando", "pesadelo", "glicose baixa"]),
    hi("h-uso", "medicacoes", "Como o senhor toma cada remédio? Algum efeito colateral?", [{ source: "paciente", text: "Metformina 850 três vezes, glibenclamida 5 de manhã e à noite, losartana, AAS e sinvastatina. A metformina dá diarreia às vezes." }], ["como toma", "remédios", "efeito", "metformina", "glibenclamida"]),
    hi("h-estilo", "habitos", "Como está a alimentação, atividade física, álcool, tabaco?", [{ source: "paciente", text: "Como pão e arroz à vontade, caminho pouco. Parei de fumar depois do infarto. Bebo cerveja no fim de semana." }], ["alimentação", "atividade", "álcool", "fuma"]),
    hi("h-complicacoes", "antecedentes", "Tem formigamento ou feridas nos pés? Quando fez exame de vista? Urina com espuma?", [{ source: "paciente", text: "Formiga um pouco a sola dos pés à noite. Exame de vista nunca fiz pelo diabetes." }], ["pés", "ferida", "formigamento", "vista", "olho"]),
    hi("h-preferencias", "social", "O que o senhor acha de mudar os remédios? Tem dificuldade para conseguir algum?", [{ source: "paciente", text: "Se for para parar esses suores, eu topo. Pego tudo na farmácia do posto ou na Farmácia Popular." }], ["acha", "mudar", "dificuldade", "farmácia"])
  ],
  initial: {
    vars: { hr: 98, sbp: 142, dbp: 84, rr: 16, spo2: 97, temp: 36.4, gcs: 15, pain: 0, glucose: 62, perfusion: 0.85, effort: 0.1, creat: 1.7 },
    flags: { rhythm: "sinusal", sweating: true, tremor: true, posture: "sentado", painVisual: "nenhuma", speech: "frases", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-pe", "membro_inferior_d", "especial", "Pés: pele íntegra, sem úlceras; monofilamento com perda de sensibilidade em 2 de 4 pontos na planta; pulsos pediosos presentes.", { label: "Pé diabético (inspeção, monofilamento, pulsos)" }),
    ex("e-geral", "geral", "inspecao", "Sudorese, tremor fino; IMC ~29.", { label: "Estado geral", better: [{ when: { ruleFired: "r-corrige" }, text: "Sem sudorese, tranquilo." }] }),
    ex("e-coracao", "coracao", "ausculta", "Ritmo regular, sem sopros.", { sound: "bulhas_normais" })
  ],
  testResults: [
    { testId: "hba1c", variants: [{ text: "HbA1c 8,9% (trazida pelo paciente, de 2 semanas atrás)." }] },
    { testId: "funcao_renal", variants: [{ text: "Creatinina 1,7; TFGe 41 mL/min/1,73 m² (trazida pelo paciente)." }] },
    { testId: "relacao_albumina_creatinina", variants: [{ text: "Resultado do laboratório municipal em outro dia." }] },
    { testId: "lipidograma", variants: [{ text: "Resultado do laboratório municipal em outro dia." }] }
  ],
  highlightedActions: ["glicemia_capilar", "carboidrato_oral", "ajustar_dose_renal", "decisao_compartilhada"],
  rules: [
    { id: "r-corrige", description: "Hipoglicemia leve corrigida por via oral", priority: 30, when: CARBO, repeat: "once", effects: [trend("glucose", 112, 900, "carb", 30), trend("hr", 82, 900, "carb", 30), flag("sweating", false), flag("tremor", false), staff("paciente", "Melhorei, doutor. É assim que fico de madrugada.")] },
    { id: "r-hipo-piora", description: "Hipoglicemia não reconhecida", priority: 20, when: { all: [{ time: "gte", seconds: 900 }, { not: CARBO }] }, repeat: "once", effects: [trend("glucose", 44, 600, "hipo", 20), trend("gcs", 13, 600, "hipo", 20), staff("enfermagem", "Ele ficou confuso e muito suado na cadeira!"), outcome("piora")] },
    { id: "r-glib-mantida", description: "Plano mantém glibenclamida", priority: 40, when: { all: [DEFINIU, { not: { actionCompleted: "suspender_medicacao_desencadeante" } }] }, repeat: "once", effects: [obs("Glibenclamida em idoso com DRC e hipoglicemias recorrentes: trocar por gliclazida MR (menor risco), a SU de escolha da SBD.")] },
    { id: "r-metformina-alta", description: "Metformina acima do limite renal", priority: 40, when: { all: [DEFINIU, { not: { actionCompleted: "ajustar_dose_renal" } }] }, repeat: "once", effects: [obs("TFGe < 45: metformina no máximo 1000 mg/dia (2550 mg/dia é dose excessiva).")] },
    { id: "r-insulina-sem-ajuste", description: "Insulina somada ao esquema hipoglicemiante", priority: 40, when: { all: [{ drugGiven: "insulina_nph" }, { not: { actionCompleted: "suspender_medicacao_desencadeante" } }] }, repeat: "once", effects: [obs("Somar insulina mantendo glibenclamida e com hipoglicemias aumenta o risco; primeiro corrigir o esquema."), outcome("complicacao")] }
  ],
  diagnosis: { primary: "dm2_descompensado", accepted: ["dm2_descompensado"], differentials: ["hipoglicemia", "drc_agudizada", "has_nao_controlada"] },
  acceptedDestinations: ["retorno_programado"],
  outcomeNotes: "DM2 fora da meta (HbA1c 8,9%) com hipoglicemias por glibenclamida, metformina acima do limite para TFGe 41 e doença coronariana. Corrigir a hipoglicemia na consulta; suspender glibenclamida e iniciar gliclazida MR; metformina ≤ 1000 mg/dia; dapagliflozina (≥ 40 anos com DCV estabelecida; TFGe 25–75); meta de HbA1c < 7,5% (idoso saudável); pé, albuminúria, lipídios e fundoscopia; retorno em 3 meses.",
  scoring: [
    { id: "s-glic", domain: "priorizacao", description: "Glicemia capilar na consulta", evidence: { kind: "actionDone", anyOf: ["glicemia_capilar"], withinSeconds: 600 }, points: 10, severity: "critica", rationale: "Sintomas adrenérgicos em uso de SU." },
    { id: "s-carbo", domain: "tratamento", description: "Corrigir hipoglicemia por via oral", evidence: { kind: "actionDone", anyOf: ["carboidrato_oral"], withinSeconds: 900 }, points: 8, severity: "critica", rationale: "Paciente consciente." },
    { id: "s-hist", domain: "historia", description: "Hipoglicemias e uso real dos remédios", evidence: { kind: "historyAsked", items: ["h-hipos", "h-uso"], minCount: 2 }, points: 10, severity: "critica", rationale: "Base da revisão terapêutica." },
    { id: "s-compl", domain: "historia", description: "Complicações e estilo de vida", evidence: { kind: "historyAsked", items: ["h-complicacoes", "h-estilo"], minCount: 1 }, points: 4, severity: "importante", rationale: "Rastreio de complicações." },
    { id: "s-pe", domain: "historia", description: "Exame do pé (monofilamento)", evidence: { kind: "examDone", regions: ["membro_inferior_d"], minCount: 1 }, points: 6, severity: "importante", rationale: "Avaliação anual do pé.", sourceIds: ["BR-SBD-SUS-2026"] },
    { id: "s-glib", domain: "tratamento", description: "Suspender glibenclamida", evidence: { kind: "actionDone", anyOf: ["suspender_medicacao_desencadeante"] }, points: 12, severity: "critica", rationale: "Hipoglicemias em idoso com DRC.", sourceIds: ["BR-SBD-SUS-2026"] },
    { id: "s-gliclazida", domain: "tratamento", description: "Gliclazida MR", evidence: { kind: "drugGiven", anyOf: ["gliclazida"] }, points: 6, severity: "importante", rationale: "SU de escolha, menor risco de hipoglicemia.", sourceIds: ["BR-SBD-SUS-2026"] },
    { id: "s-renal", domain: "tratamento", description: "Ajustar metformina à TFGe", evidence: { kind: "actionDone", anyOf: ["ajustar_dose_renal"] }, points: 12, severity: "critica", rationale: "TFGe < 45: máx. 1000 mg/dia.", sourceIds: ["BR-SBD-SUS-2026"] },
    { id: "s-isglt2", domain: "tratamento", description: "Dapagliflozina (DCV estabelecida)", evidence: { kind: "drugGiven", anyOf: ["dapagliflozina"] }, points: 10, severity: "critica", rationale: "Critério de acesso no SUS e proteção cardiorrenal.", sourceIds: ["BR-SBD-SUS-2026"] },
    { id: "s-labs", domain: "exames", description: "Albuminúria e lipídios", evidence: { kind: "testOrdered", anyOf: ["relacao_albumina_creatinina", "lipidograma"] }, points: 6, severity: "importante", rationale: "Seguimento anual.", sourceIds: ["BR-SBD-SUS-2026"] },
    { id: "s-decisao", domain: "destino", description: "Decisão compartilhada/plano", evidence: { kind: "actionDone", anyOf: ["decisao_compartilhada", "orientacoes_alta"] }, points: 6, severity: "importante", rationale: "Adesão e reconhecimento de hipoglicemia." },
    { id: "s-hipo", domain: "priorizacao", description: "Falha: hipoglicemia não reconhecida", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-hipo-piora" } }, points: 10, penalty: true, severity: "critica", rationale: "Sintomas ignorados." },
    { id: "s-insulina", domain: "tratamento", description: "Falha: insulina sem corrigir o esquema", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-insulina-sem-ajuste" } }, points: 6, penalty: true, severity: "importante", rationale: "Risco de hipoglicemia grave." },
    { id: "s-dx", domain: "destino", description: "DM2 fora da meta", evidence: { kind: "diagnosis", accepted: ["dm2_descompensado"] }, points: 4, severity: "importante", rationale: "HbA1c 8,9% com hipoglicemias." },
    { id: "s-destino", domain: "destino", description: "Retorno em 3 meses", evidence: { kind: "disposition", accepted: ["retorno_programado"] }, points: 6, severity: "importante", rationale: "Fora da meta/após mudança: trimestral.", sourceIds: ["BR-SBD-SUS-2026"] }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Suor e tremor em jejum em quem usa sulfonilureia: o que medir agora?" },
      { level: 2, text: "Qual sulfonilureia tem menor risco de hipoglicemia?" },
      { level: 3, text: "TFGe 41: qual o limite de metformina?" },
      { level: 4, text: "Sugestão explícita: glicemia, carboidrato VO, suspender glibenclamida, gliclazida MR, ajustar metformina, dapagliflozina, albuminúria/lipídios, pé, decisão compartilhada, retorno em 3 meses." }
    ],
    summary: "DM2 em idoso com DCV e DRC estágio 3b, HbA1c alta e hipoglicemias por glibenclamida.",
    pathophysiology: "HbA1c elevada com hipoglicemias indica esquema inadequado: a glibenclamida tem metabólitos ativos de eliminação renal e longa ação, causando hipoglicemia noturna, com hiperglicemia rebote e excesso alimentar compensatório. iSGLT2 reduzem eventos cardiovasculares e progressão renal.",
    keyPoints: [
      "Metas individualizadas: HbA1c ≤ 7% (adulto); < 7,5% idoso saudável; < 8% idoso frágil.",
      "Metformina: máx. 1000 mg/dia se TFGe < 45; suspender se < 30.",
      "Gliclazida MR é a SU de escolha (menos hipoglicemia que glibenclamida).",
      "Dapagliflozina no SUS: DCV estabelecida (≥ 40 anos), risco CV elevado ou DRC com critérios.",
      "Retorno a cada 3 meses se fora da meta; anualmente albuminúria, lipídios, pé e fundoscopia."
    ],
    alternatives: ["Insulina NPH ao deitar (10 U ou 0,2 U/kg) se persistir fora da meta após corrigir o esquema.", "Encaminhar à especialidade se falha com insulina basal titulada."],
    oralRubric: [
      { id: "o1", concept: "Hipoglicemia por SU", synonyms: ["glibenclamida", "hipoglicemia", "sulfonilureia"], weight: 3 },
      { id: "o2", concept: "Ajuste renal", synonyms: ["tfg", "1000 mg", "metformina", "renal"], weight: 3 },
      { id: "o3", concept: "iSGLT2", synonyms: ["dapagliflozina", "sglt2", "cardiovascular"], weight: 2 },
      { id: "o4", concept: "Meta individualizada", synonyms: ["7,5", "meta", "idoso"], weight: 2 }
    ],
    simplifications: ["Doses de gliclazida e dapagliflozina não avaliadas (sem regra cadastrada).", "Exames prévios trazidos pelo paciente; novos exames com resultado em outro dia."]
  },
  references: ["BR-SBD-SUS-2026", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 6, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Glicemia, carboidrato, revisão completa, troca de SU, ajuste renal, dapagliflozina, exames, retorno", commands: [ask(10, "h-agora"), act(20, "glicemia_capilar"), act(70, "carboidrato_oral"), ask(200, "h-hipos"), ask(210, "h-uso"), ask(220, "h-complicacoes"), test(230, "hba1c"), test(240, "funcao_renal"), { atSeconds: 250, type: "examine", payload: { region: "membro_inferior_d", maneuver: "especial" } }, act(300, "suspender_medicacao_desencadeante"), rx(430, "gliclazida", "cp30", 30, "mg", "VO"), act(440, "ajustar_dose_renal"), rx(570, "dapagliflozina", "cp10", 10, "mg", "VO"), test(580, "relacao_albumina_creatinina"), test(590, "lipidograma"), act(600, "decisao_compartilhada"), dx(800, "dm2_descompensado"), dest(900, "retorno_programado")], runUntilSeconds: 1800, expect: [{ condition: { ruleFired: "r-corrige" }, description: "hipoglicemia corrigida" }, { condition: { not: { ruleFired: "r-glib-mantida" } }, description: "glibenclamida suspensa" }, { condition: { not: { ruleFired: "r-metformina-alta" } }, description: "metformina ajustada" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 1800, expect: [{ condition: { ruleFired: "r-hipo-piora" }, description: "hipoglicemia" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Ignora sintomas e acrescenta insulina NPH ao esquema", commands: [test(30, "hba1c"), rx(300, "insulina_nph", "fr100", 10, "UI", "SC"), dest(600, "retorno_programado")], runUntilSeconds: 1800, expect: [{ condition: { ruleFired: "r-hipo-piora" }, description: "hipoglicemia" }, { condition: { ruleFired: "r-insulina-sem-ajuste" }, description: "insulina sem ajuste" }, { condition: { ruleFired: "r-glib-mantida" }, description: "glibenclamida mantida" }] },
    { id: "t-atraso", kind: "delay", description: "Glicemia só após confusão", commands: [ask(10, "h-uso"), act(1000, "glicemia_capilar"), act(1050, "carboidrato_oral"), act(1300, "suspender_medicacao_desencadeante"), act(1310, "ajustar_dose_renal"), dest(1600, "retorno_programado")], runUntilSeconds: 2400, expect: [{ condition: { ruleFired: "r-hipo-piora" }, description: "hipoglicemia" }, { condition: { ruleFired: "r-corrige" }, description: "correção tardia" }] },
    { id: "t-alternativa", kind: "alternative", description: "Corrige, suspende SU sem trocar, ajusta metformina, iSGLT2", commands: [act(10, "glicemia_capilar"), act(40, "carboidrato_oral"), ask(200, "h-hipos"), act(220, "suspender_medicacao_desencadeante"), act(230, "ajustar_dose_renal"), rx(360, "dapagliflozina", "cp10", 10, "mg", "VO"), act(370, "orientacoes_alta"), dest(600, "retorno_programado")], runUntilSeconds: 1800, expect: [{ condition: { ruleFired: "r-corrige" }, description: "corrigida" }, { condition: { not: { ruleFired: "r-metformina-alta" } }, description: "metformina ajustada" }] }
  ]
};
