import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, hi, obs, outcome, rx, staff, test } from "./helpers";

const ORTOSTATICA = { actionCompleted: "medir_pa_ortostatica" };
const REVISAO = { actionCompleted: "revisao_medicamentosa" };
const DEFINIU = { path: "disposition", op: "neq", value: "" };
const SEDATIVO = { any: [{ drugGiven: "diazepam" }, { drugGiven: "prometazina" }, { drugGiven: "haloperidol" }, { drugGiven: "midazolam" }] };

export const C108: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C108",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Idosa de 79 anos que caiu duas vezes no mês, anda tonta e sonolenta",
  teachingTitle: "Polifarmácia, quedas e sintomas inespecíficos no idoso — hipotensão ortostática, medicamentos potencialmente inapropriados (benzodiazepínico, tricíclico, anti-histamínico), desprescrição e avaliação de quedas",
  group: "Atenção primária",
  specialties: ["Medicina de família", "Geriatria"],
  environment: "ubs",
  resourceProfile: "ubs-urbana",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Listar todos os medicamentos (inclusive os 'de vez em quando' e de outros prescritores)",
    "Medir PA ortostática e avaliar marcha/equilíbrio",
    "Identificar medicamentos potencialmente inapropriados que aumentam quedas",
    "Planejar desprescrição gradual e compartilhada",
    "Avaliar riscos domiciliares e programar retorno"
  ],
  keywords: ["quedas", "tontura", "sonolenta", "remédios", "idosa", "filho"],
  patient: {
    name: "Dona Jandira Costa",
    ageYears: 79,
    sex: "feminino",
    weightKg: 58,
    heightCm: 150,
    visual: { ageGroup: "idoso", sex: "feminino", skinTone: 2, hairStyle: "curto", hairColor: "branco", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "UBS, consulta com a equipe. Idosa de 79 anos trazida pelo filho: caiu duas vezes no último mês (uma ao levantar à noite para urinar), anda 'tonta', mais sonolenta de dia e com intestino preso. Trouxe uma sacola com os remédios.",
  communication: "normal",
  informants: [{ id: "paciente", name: "Dona Jandira", role: "Paciente" }, { id: "filho", name: "Roberto (filho)", role: "Filho" }],
  history: [
    hi("h-remedios", "medicacoes", "Vamos ver todos os remédios da sacola, inclusive os que a senhora toma 'de vez em quando'.", [{ source: "filho", text: "Losartana 50, hidroclorotiazida 25, anlodipino 10, omeprazol, clonazepam 2 mg à noite há 10 anos, amitriptilina 25 que o outro médico deu para dormir, e prometazina quando dá coceira." }], ["remédios", "sacola", "todos", "toma"]),
    hi("h-quedas", "inicio", "Como foram as quedas? Tontura ao levantar? Perdeu a consciência?", [{ source: "paciente", text: "A primeira foi levantando da cama à noite, a vista escureceu. A segunda no banheiro. Não desmaiei, mas bati o quadril." }], ["quedas", "levantar", "tontura", "desmaio", "como"]),
    hi("h-sintomas", "fatores_associados", "Tem boca seca, intestino preso, dificuldade para urinar, esquecimento?", [{ source: "paciente", text: "Boca seca demais, intestino preso, e ando esquecida." }, { source: "filho", text: "Ela anda mais lenta para pensar." }], ["boca seca", "intestino", "urinar", "esquecimento"]),
    hi("h-casa", "social", "Como é a casa? Tapetes, escada, luz à noite, banheiro com apoio? Usa óculos?", [{ source: "filho", text: "Tem tapete no quarto, o banheiro não tem barra, e ela não acende a luz à noite. Os óculos são antigos." }], ["casa", "tapete", "escada", "luz", "banheiro", "óculos"]),
    hi("h-preferencias", "outros", "O que a senhora acha de diminuir alguns remédios devagar, com acompanhamento?", [{ source: "paciente", text: "Tenho medo de não dormir sem o clonazepam... mas se for devagar, aceito." }], ["diminuir", "acha", "devagar", "parar"])
  ],
  initial: {
    vars: { hr: 76, sbp: 132, dbp: 74, rr: 16, spo2: 97, temp: 36.3, gcs: 15, pain: 3, glucose: 104, perfusion: 0.85, effort: 0.1, na: 131 },
    flags: { rhythm: "sinusal", posture: "sentado", painVisual: "leve", speech: "frases", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-marcha", "neurologico", "especial", "Teste levantar e andar: 18 s, base alargada, apoio nos móveis; Romberg sem queda; sem déficit focal.", { label: "Marcha e equilíbrio" }),
    ex("e-quadril", "membro_inferior_d", "palpacao", "Equimose em trocânter direito; rotação e carga sem dor importante.", { label: "Quadril (queda)" }),
    ex("e-boca", "boca", "inspecao", "Mucosas secas.", { label: "Boca" }),
    ex("e-coracao", "coracao", "ausculta", "Ritmo regular, sem sopros.", { sound: "bulhas_normais" }),
    ex("e-olhos", "olhos", "inspecao", "Acuidade visual reduzida com os óculos atuais.", { label: "Visão" })
  ],
  testResults: [
    { testId: "eletrolitos", variants: [{ text: "Na 131 (hiponatremia leve), K 3,6 (resultado do laboratório municipal em outro dia)." }] },
    { testId: "ecg12", variants: [{ text: "Ritmo sinusal 76 bpm; PR e QTc normais; sem bloqueios." }] },
    { testId: "funcao_renal", variants: [{ text: "Resultado em outro dia." }] }
  ],
  highlightedActions: ["medir_pa_ortostatica", "revisao_medicamentosa", "avaliacao_quedas", "decisao_compartilhada"],
  rules: [
    { id: "r-ortostatica", description: "Hipotensão ortostática documentada", priority: 20, when: ORTOSTATICA, repeat: "once", effects: [staff("enfermagem", "Deitada 132/74, FC 76. Em pé, 3 min: 104/62, FC 82, com tontura.")] },
    { id: "r-quase-queda", description: "Tontura ao levantar sem avaliação", priority: 30, when: { all: [{ time: "gte", seconds: 1200 }, { not: ORTOSTATICA }] }, repeat: "once", effects: [staff("acompanhante", "Ela levantou para ir ao banheiro, a vista escureceu e quase caiu — segurei a tempo."), outcome("piora")] },
    { id: "r-sem-revisao", description: "Plano sem revisão medicamentosa", priority: 40, when: { all: [DEFINIU, { not: REVISAO }] }, repeat: "once", effects: [obs("Benzodiazepínico, tricíclico e anti-histamínico de 1ª geração aumentam quedas, confusão e constipação em idosos; tiazídico + múltiplos anti-hipertensivos contribuem para hipotensão ortostática e hiponatremia.")] },
    { id: "r-mais-sedativo", description: "Novo sedativo/anti-histamínico", priority: 45, when: SEDATIVO, repeat: "once", effects: [obs("Acrescentar sedativo ou anti-histamínico de 1ª geração aumenta o risco de queda e fratura."), outcome("complicacao")] }
  ],
  diagnosis: { primary: "quedas_polifarmacia", accepted: ["quedas_polifarmacia"], differentials: ["sincope", "delirium", "hiponatremia", "has_nao_controlada", "avc_isquemico"] },
  acceptedDestinations: ["retorno_programado"],
  outcomeNotes: "Quedas recorrentes por hipotensão ortostática e medicamentos potencialmente inapropriados (clonazepam crônico, amitriptilina, prometazina, tiazídico com hiponatremia, três anti-hipertensivos). Revisão completa, PA ortostática, marcha, plano de desprescrição gradual compartilhado (retirar prometazina e amitriptilina, reduzir clonazepam lentamente, rever tiazídico), eletrólitos, ECG, ajuste ambiental e óculos, retorno breve.",
  scoring: [
    { id: "s-lista", domain: "historia", description: "Lista completa de medicamentos", evidence: { kind: "historyAsked", items: ["h-remedios"], minCount: 1 }, points: 12, severity: "critica", rationale: "Inclui os 'de vez em quando'." },
    { id: "s-quedas", domain: "historia", description: "Circunstâncias das quedas e sintomas anticolinérgicos", evidence: { kind: "historyAsked", items: ["h-quedas", "h-sintomas"], minCount: 2 }, points: 8, severity: "critica", rationale: "Ortostatismo e anticolinérgicos.", sourceIds: ["INT-AGS-BEERS-2023"] },
    { id: "s-orto", domain: "exames", description: "PA ortostática", evidence: { kind: "actionDone", anyOf: ["medir_pa_ortostatica"], withinSeconds: 1100 }, points: 12, severity: "critica", rationale: "Causa tratável de queda." },
    { id: "s-marcha", domain: "historia", description: "Marcha/equilíbrio e lesão da queda", evidence: { kind: "examDone", regions: ["neurologico", "membro_inferior_d"], minCount: 2 }, points: 8, severity: "importante", rationale: "Risco e consequência." },
    { id: "s-revisao", domain: "tratamento", description: "Revisão medicamentosa com desprescrição", evidence: { kind: "actionDone", anyOf: ["revisao_medicamentosa"] }, points: 18, severity: "critica", rationale: "Benzodiazepínico, tricíclico e anti-histamínico.", sourceIds: ["INT-AGS-BEERS-2023"] },
    { id: "s-casa", domain: "historia", description: "Riscos domiciliares e visão", evidence: { kind: "historyAsked", items: ["h-casa"], minCount: 1 }, points: 6, severity: "importante", rationale: "Intervenção multifatorial." },
    { id: "s-avq", domain: "tratamento", description: "Avaliação de quedas/orientação ambiental", evidence: { kind: "actionDone", anyOf: ["avaliacao_quedas"] }, points: 8, severity: "importante", rationale: "Tapetes, luz, barras, óculos." },
    { id: "s-decisao", domain: "destino", description: "Decisão compartilhada", evidence: { kind: "actionDone", anyOf: ["decisao_compartilhada"] }, points: 8, severity: "importante", rationale: "Medo de retirar o clonazepam." },
    { id: "s-labs", domain: "exames", description: "Eletrólitos e ECG", evidence: { kind: "testOrdered", anyOf: ["eletrolitos", "ecg12"] }, points: 6, severity: "importante", rationale: "Hiponatremia por tiazídico; arritmia." },
    { id: "s-sem-sed", domain: "tratamento", description: "Não acrescentou sedativo", evidence: { kind: "avoidDrug", anyOf: ["diazepam", "prometazina", "haloperidol", "midazolam"] }, points: 4, severity: "importante", rationale: "Cascata de prescrição.", sourceIds: ["INT-AGS-BEERS-2023"] },
    { id: "s-quase", domain: "priorizacao", description: "Falha: quase queda na unidade", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-quase-queda" } }, points: 6, penalty: true, severity: "importante", rationale: "Ortostatismo não avaliado." },
    { id: "s-sed", domain: "tratamento", description: "Falha: novo sedativo", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-mais-sedativo" } }, points: 10, penalty: true, severity: "critica", rationale: "Aumenta quedas." },
    { id: "s-dx", domain: "destino", description: "Quedas por polifarmácia/ortostatismo", evidence: { kind: "diagnosis", accepted: ["quedas_polifarmacia"] }, points: 6, severity: "importante", rationale: "Síndrome geriátrica multifatorial." },
    { id: "s-destino", domain: "destino", description: "Retorno breve", evidence: { kind: "disposition", accepted: ["retorno_programado"] }, points: 4, severity: "importante", rationale: "Desprescrição monitorada." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Abra a sacola: quais remédios aumentam quedas?" },
      { level: 2, text: "A vista escureceu ao levantar: qual medida falta?" },
      { level: 3, text: "Boca seca, intestino preso, esquecimento: qual efeito?" },
      { level: 4, text: "Sugestão explícita: lista completa, PA ortostática, marcha, revisão com desprescrição, riscos domiciliares, decisão compartilhada, eletrólitos/ECG, retorno." }
    ],
    summary: "Quedas recorrentes por hipotensão ortostática e medicamentos potencialmente inapropriados em idosa.",
    pathophysiology: "Idosos têm menor reserva barorreflexa e maior sensibilidade a fármacos de ação central. Benzodiazepínicos e anticolinérgicos reduzem atenção, equilíbrio e tempo de reação; anti-hipertensivos múltiplos e tiazídicos causam ortostatismo e hiponatremia. A 'cascata de prescrição' trata efeitos adversos com novos fármacos.",
    keyPoints: [
      "Revisar todos os medicamentos em toda queda no idoso.",
      "Benzodiazepínicos, hipnóticos 'Z', tricíclicos e anti-histamínicos de 1ª geração são potencialmente inapropriados.",
      "Medir PA ortostática; rever anti-hipertensivos e tiazídico.",
      "Desprescrever gradualmente (benzodiazepínico crônico: redução lenta) e com decisão compartilhada.",
      "Intervenção multifatorial: visão, casa, calçados, força e equilíbrio."
    ],
    alternatives: ["Higiene do sono e abordagem não farmacológica da insônia durante a retirada.", "Encaminhar à fisioterapia/grupo de exercícios de equilíbrio."],
    oralRubric: [
      { id: "o1", concept: "Medicamentos inapropriados", synonyms: ["clonazepam", "amitriptilina", "prometazina", "beers"], weight: 3 },
      { id: "o2", concept: "Ortostatismo", synonyms: ["ortostática", "deitado e em pé"], weight: 2 },
      { id: "o3", concept: "Desprescrição", synonyms: ["desprescrever", "retirar", "reduzir devagar"], weight: 3 },
      { id: "o4", concept: "Multifatorial", synonyms: ["tapete", "luz", "óculos", "marcha"], weight: 2 }
    ],
    simplifications: ["Esquema de retirada do benzodiazepínico não detalhado.", "Exames laboratoriais com resultado em outro dia."]
  },
  references: ["INT-AGS-BEERS-2023", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 6, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Lista completa, quedas, ortostática, marcha, revisão, casa, decisão, exames, retorno", commands: [ask(10, "h-remedios"), ask(20, "h-quedas"), ask(30, "h-sintomas"), act(40, "medir_pa_ortostatica"), { atSeconds: 350, type: "examine", payload: { region: "neurologico", maneuver: "especial" } }, { atSeconds: 360, type: "examine", payload: { region: "membro_inferior_d", maneuver: "palpacao" } }, ask(370, "h-casa"), ask(380, "h-preferencias"), act(390, "revisao_medicamentosa"), act(1000, "avaliacao_quedas"), act(1310, "decisao_compartilhada"), test(1500, "eletrolitos"), test(1510, "ecg12"), dx(1700, "quedas_polifarmacia"), dest(1800, "retorno_programado")], runUntilSeconds: 2400, expect: [{ condition: { ruleFired: "r-ortostatica" }, description: "ortostatismo" }, { condition: { not: { ruleFired: "r-sem-revisao" } }, description: "revisão feita" }, { condition: { not: { ruleFired: "r-quase-queda" } }, description: "sem quase queda" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 2400, expect: [{ condition: { ruleFired: "r-quase-queda" }, description: "quase queda" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Atribui à idade, prescreve prometazina para dormir e retorno", commands: [ask(10, "h-quedas"), rx(300, "prometazina", "amp25", 25, "mg", "IM"), dest(900, "retorno_programado")], runUntilSeconds: 2400, expect: [{ condition: { ruleFired: "r-mais-sedativo" }, description: "sedativo" }, { condition: { ruleFired: "r-sem-revisao" }, description: "sem revisão" }, { condition: { ruleFired: "r-quase-queda" }, description: "quase queda" }] },
    { id: "t-atraso", kind: "delay", description: "Ortostática só após a quase queda", commands: [ask(10, "h-remedios"), act(1300, "medir_pa_ortostatica"), act(1700, "revisao_medicamentosa"), dest(2500, "retorno_programado")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-quase-queda" }, description: "quase queda" }, { condition: { ruleFired: "r-ortostatica" }, description: "ortostatismo tardio" }] },
    { id: "t-alternativa", kind: "alternative", description: "Revisão primeiro, depois ortostática e quedas", commands: [ask(10, "h-remedios"), act(20, "revisao_medicamentosa"), act(630, "medir_pa_ortostatica"), act(940, "avaliacao_quedas"), act(1250, "decisao_compartilhada"), dest(1600, "retorno_programado")], runUntilSeconds: 2400, expect: [{ condition: { ruleFired: "r-ortostatica" }, description: "ortostatismo" }, { condition: { not: { ruleFired: "r-sem-revisao" } }, description: "revisão" }] }
  ]
};
