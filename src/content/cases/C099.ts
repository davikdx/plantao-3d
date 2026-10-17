import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, hi, obs, outcome, rx, staff, test } from "./helpers";

const VINCULO = { any: [{ actionCompleted: "escuta_qualificada" }, { actionCompleted: "desescalada_verbal" }] };
const COERCAO = { any: [{ actionCompleted: "contencao_mecanica" }, { drugGiven: "haloperidol" }, { drugGiven: "midazolam" }, { drugGiven: "prometazina" }, { drugGiven: "diazepam" }] };

export const C099: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C099",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Estudante de 21 anos que acha que os vizinhos a vigiam e quase não dorme há semanas",
  teachingTitle: "Primeiro episódio psicótico — acolhimento, exclusão de causas orgânicas e de substâncias, avaliação de risco, envolvimento da família e vínculo precoce com o CAPS",
  group: "Psiquiatria",
  specialties: ["Psiquiatria", "Saúde mental", "Emergência"],
  environment: "emergencia",
  resourceProfile: "upa-porte-ii",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Acolher e construir vínculo com paciente desconfiado, sem coerção desnecessária",
    "Estabelecer a linha do tempo e excluir causas orgânicas e uso de substâncias",
    "Avaliar risco: suicídio, violência, alucinações de comando, autocuidado",
    "Envolver a família e vincular cedo ao cuidado especializado (CAPS)",
    "Decidir o plano terapêutico de forma compartilhada"
  ],
  keywords: ["vizinhos", "vigiando", "insônia", "estudante", "vozes", "mãe"],
  patient: {
    name: "Beatriz Lopes",
    ageYears: 21,
    sex: "feminino",
    weightKg: 58,
    heightCm: 164,
    visual: { ageGroup: "adulto", sex: "feminino", skinTone: 3, hairStyle: "crespo_volume", hairColor: "preto", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "UPA 24h, consultório. Estudante de 21 anos trazida pela mãe: há cerca de 4 semanas dorme pouco, trancou a faculdade, cobriu a janela com papel alumínio e diz que os vizinhos 'instalaram câmeras'. Hoje recusou-se a sair do quarto. Está calma, mas desconfiada.",
  communication: "limitada",
  informants: [{ id: "paciente", name: "Beatriz", role: "Paciente" }, { id: "mae", name: "Rosângela (mãe)", role: "Mãe" }],
  history: [
    hi("h-sintomas", "queixa", "Beatriz, o que tem acontecido com você? Pode me contar do seu jeito.", [{ source: "paciente", text: "Eles me filmam. Escuto os vizinhos comentando tudo o que eu faço... até quando estou sozinha. Por isso tapei a janela." }], ["acontecido", "contar", "vizinhos", "vozes", "escuta"]),
    hi("h-tempo", "evolucao", "Desde quando? Antes disso, como ela estava?", [{ source: "mae", text: "Uns dois meses atrás ficou mais quieta, largou os amigos. Há um mês piorou muito e quase não dorme. Antes era ótima aluna." }], ["desde quando", "antes", "como estava", "mudou"]),
    hi("h-substancias", "habitos", "Usou maconha, cocaína, anfetamina, álcool ou outra substância? Algum remédio novo?", [{ source: "paciente", text: "Fumava maconha às vezes nas festas... parei há uns três meses." }, { source: "mae", text: "Remédio nenhum." }], ["maconha", "cocaína", "droga", "álcool", "remédio"]),
    hi("h-risco", "humor_risco", "As vozes mandam você fazer alguma coisa? Já pensou em se machucar ou machucar alguém?", [{ source: "paciente", text: "Não mandam, só comentam e xingam. Não quero me machucar. Não quero machucar ninguém, só quero que parem." }], ["mandam", "machucar", "morrer", "suicídio", "violência"]),
    hi("h-humor", "sinais_alarme", "Teve fase de muita energia, sem precisar dormir, gastando muito? Ou muita tristeza?", [{ source: "mae", text: "Não ficou eufórica. Está mais triste e assustada." }], ["energia", "euforia", "tristeza", "gastando"]),
    hi("h-organico", "antecedentes", "Teve febre, dor de cabeça forte, convulsão, desmaio, perda de peso? Alguma doença?", [{ source: "mae", text: "Nada disso. É saudável." }], ["febre", "dor de cabeça", "convulsão", "doença"]),
    hi("h-familia", "familia", "Alguém na família tem esquizofrenia ou transtorno bipolar?", [{ source: "mae", text: "Um tio meu tem esquizofrenia, faz tratamento no CAPS." }], ["família", "tio", "esquizofrenia", "bipolar"]),
    hi("h-gestacao", "ginecologico", "Pode estar grávida? Última menstruação?", [{ source: "paciente", text: "Não... veio semana passada." }], ["grávida", "menstruação"])
  ],
  initial: {
    vars: { hr: 92, sbp: 118, dbp: 74, rr: 16, spo2: 99, temp: 36.6, gcs: 15, pain: 0, glucose: 92, perfusion: 0.9, effort: 0.1 },
    flags: { rhythm: "sinusal", posture: "sentado", painVisual: "nenhuma", speech: "frases", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-mental", "cabeca", "inspecao", "Vigil, orientada no tempo e no espaço, atenção preservada; humor ansioso; delírios persecutórios e de referência; alucinações auditivas comentadoras; sem crítica; sem ideação suicida ou homicida relatada.", { label: "Exame do estado mental" }),
    ex("e-neuro", "neurologico", "inspecao", "Sem déficits focais, sem rigidez de nuca, marcha normal, sem movimentos anormais.", { label: "Neurológico" }),
    ex("e-geral", "geral", "inspecao", "Emagrecida, higiene descuidada; sem sinais de intoxicação (pupilas normais, sem sudorese ou tremor).", { label: "Estado geral" }),
    ex("e-pele", "pele", "inspecao", "Sem lesões, sem marcas de autolesão.", { label: "Pele" })
  ],
  testResults: [
    { testId: "teste_rapido_hiv", variants: [{ text: "Não reagente." }] },
    { testId: "teste_rapido_sifilis", variants: [{ text: "Não reagente." }] },
    { testId: "teste_gravidez_urina", variants: [{ text: "Negativo." }] },
    { testId: "hemograma", variants: [{ text: "Sem alterações." }] },
    { testId: "eletrolitos", variants: [{ text: "Na 139, K 4,1." }] }
  ],
  highlightedActions: ["escuta_qualificada", "avaliacao_risco_suicidio", "acionar_rede_apoio", "decisao_compartilhada"],
  rules: [
    { id: "r-vinculo", description: "Acolhimento constrói vínculo", priority: 20, when: VINCULO, repeat: "once", effects: [staff("paciente", "...Ninguém tinha me escutado assim. Eu aceito conversar com alguém que entenda disso.")] },
    { id: "r-evasao", description: "Sem acolhimento: paciente quer ir embora", priority: 30, when: { all: [{ time: "gte", seconds: 1200 }, { not: VINCULO }] }, repeat: "once", effects: [staff("enfermagem", "Ela levantou e quer ir embora; diz que a UPA também está grampeada."), outcome("piora")] },
    { id: "r-coercao", description: "Contenção/tranquilização sem agitação", priority: 35, when: COERCAO, repeat: "once", effects: [obs("Paciente calma e colaborativa: contenção ou tranquilização rápida são desnecessárias, rompem o vínculo e reforçam a vivência persecutória."), outcome("complicacao")] },
    { id: "r-alta-sem-rede", description: "Alta sem vínculo com a rede", priority: 45, when: { any: [{ path: "disposition", op: "eq", value: "alta_orientada" }, { path: "disposition", op: "eq", value: "alta_com_seguimento_ubs" }] }, repeat: "once", effects: [obs("Primeiro episódio exige vínculo precoce com cuidado especializado (CAPS), com a família envolvida.")] }
  ],
  diagnosis: { primary: "primeiro_episodio_psicotico", accepted: ["primeiro_episodio_psicotico"], differentials: ["episodio_maniaco", "episodio_depressivo", "intox_estimulante", "delirium", "agitacao_psicotica"] },
  acceptedDestinations: ["caps"],
  outcomeNotes: "Primeiro episódio psicótico (pródromo de 2 meses, delírios persecutórios, alucinações auditivas comentadoras, sem sintomas de humor, sem causa orgânica aparente, uso prévio de maconha) com risco baixo para si e terceiros e família presente. Acolhimento, exames dirigidos, avaliação de risco, decisão compartilhada e encaminhamento implicado ao CAPS no mesmo dia.",
  scoring: [
    { id: "s-escuta", domain: "priorizacao", description: "Acolhimento/escuta qualificada", evidence: { kind: "actionDone", anyOf: ["escuta_qualificada"], withinSeconds: 900 }, points: 8, severity: "critica", rationale: "Base do vínculo." },
    { id: "s-hist", domain: "historia", description: "Sintomas e linha do tempo", evidence: { kind: "historyAsked", items: ["h-sintomas", "h-tempo"], minCount: 2 }, points: 8, severity: "critica", rationale: "Linha do tempo antes de rotular.", sourceIds: ["INT-VADOD-PSICOSE-2023"] },
    { id: "s-subst", domain: "historia", description: "Uso de substâncias", evidence: { kind: "historyAsked", items: ["h-substancias"], minCount: 1 }, points: 8, severity: "critica", rationale: "Diferencial obrigatório.", sourceIds: ["INT-VADOD-PSICOSE-2023"] },
    { id: "s-risco", domain: "historia", description: "Risco (comando, suicídio, violência)", evidence: { kind: "historyAsked", items: ["h-risco"], minCount: 1 }, points: 6, severity: "critica", rationale: "Define o nível de cuidado.", sourceIds: ["INT-VADOD-PSICOSE-2023"] },
    { id: "s-risco-estr", domain: "reavaliacao", description: "Avaliação estruturada de risco de suicídio", evidence: { kind: "actionDone", anyOf: ["avaliacao_risco_suicidio"] }, points: 6, severity: "importante", rationale: "Psicose de início recente eleva o risco." },
    { id: "s-organico", domain: "historia", description: "Exame neurológico, estado geral e sinais vitais", evidence: { kind: "examDone", regions: ["neurologico", "geral", "cabeca"], minCount: 3 }, points: 8, severity: "critica", rationale: "Excluir delirium e causas orgânicas.", sourceIds: ["INT-VADOD-PSICOSE-2023"] },
    { id: "s-diff", domain: "historia", description: "Humor e sintomas orgânicos", evidence: { kind: "historyAsked", items: ["h-humor", "h-organico", "h-familia"], minCount: 2 }, points: 6, severity: "importante", rationale: "Mania, depressão psicótica, doença orgânica." },
    { id: "s-exames", domain: "exames", description: "Exames dirigidos (HIV, sífilis, gravidez)", evidence: { kind: "testOrdered", anyOf: ["teste_rapido_hiv", "teste_rapido_sifilis", "teste_gravidez_urina", "bhcg"] }, points: 6, severity: "importante", rationale: "Causas tratáveis e decisão terapêutica." },
    { id: "s-glic", domain: "exames", description: "Glicemia capilar/sinais vitais", evidence: { kind: "actionDone", anyOf: ["glicemia_capilar", "monitorizar"] }, points: 4, severity: "importante", rationale: "Triagem orgânica básica." },
    { id: "s-familia", domain: "destino", description: "Envolver a família (com consentimento)", evidence: { kind: "actionDone", anyOf: ["acionar_rede_apoio"] }, points: 6, severity: "importante", rationale: "Educação familiar é parte do cuidado.", sourceIds: ["INT-VADOD-PSICOSE-2023"] },
    { id: "s-decisao", domain: "tratamento", description: "Decisão compartilhada", evidence: { kind: "actionDone", anyOf: ["decisao_compartilhada"] }, points: 8, severity: "importante", rationale: "Escolha do tratamento com a paciente.", sourceIds: ["INT-VADOD-PSICOSE-2023"] },
    { id: "s-sem-coercao", domain: "tratamento", description: "Sem contenção/tranquilização desnecessárias", evidence: { kind: "avoidDrug", anyOf: ["haloperidol", "midazolam", "prometazina", "diazepam"] }, points: 6, severity: "importante", rationale: "Paciente calma.", sourceIds: ["BR-ABP-AGITACAO-2019"] },
    { id: "s-coercao", domain: "tratamento", description: "Falha: medida coercitiva sem indicação", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-coercao" } }, points: 10, penalty: true, severity: "critica", rationale: "Rompe o vínculo." },
    { id: "s-evasao", domain: "priorizacao", description: "Falha: perdeu o vínculo", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-evasao" } }, points: 6, penalty: true, severity: "importante", rationale: "Sem acolhimento." },
    { id: "s-dx", domain: "destino", description: "Primeiro episódio psicótico", evidence: { kind: "diagnosis", accepted: ["primeiro_episodio_psicotico"] }, points: 8, severity: "importante", rationale: "Sem causa orgânica/substância evidente." },
    { id: "s-destino", domain: "destino", description: "CAPS no mesmo dia", evidence: { kind: "disposition", accepted: ["caps"] }, points: 12, severity: "critica", rationale: "Vínculo precoce com cuidado especializado.", sourceIds: ["INT-VADOD-PSICOSE-2023", "BR-CAPS"] }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Ela está calma, mas desconfiada: como começar?" },
      { level: 2, text: "Desde quando, e houve uso de substâncias?" },
      { level: 3, text: "As vozes mandam algo? Há risco para ela ou para outros?" },
      { level: 4, text: "Sugestão explícita: escuta qualificada, história com mãe, exame neurológico e geral, testes rápidos e gravidez, risco de suicídio, envolver família, decisão compartilhada, CAPS." }
    ],
    summary: "Primeiro episódio psicótico em jovem, risco baixo, família presente.",
    pathophysiology: "Psicoses primárias associam-se a disfunção dopaminérgica mesolímbica, com vulnerabilidade genética (história familiar) e fatores ambientais (uso de cannabis na adolescência). O pródromo (retraimento, queda de desempenho) costuma preceder os sintomas positivos. Duração da psicose não tratada se associa a pior prognóstico.",
    keyPoints: [
      "Acolher primeiro; coerção só se agitação/risco iminente.",
      "Linha do tempo, substâncias, humor e causas orgânicas antes de rotular.",
      "Avaliar alucinações de comando, ideação suicida/homicida e autocuidado.",
      "Exames dirigidos; urgência se delirium, febre, sinais focais ou convulsões.",
      "Vincular cedo ao CAPS com a família; antipsicótico por decisão compartilhada."
    ],
    alternatives: ["Internação em leito de saúde mental se risco elevado ou incapacidade de autocuidado.", "Iniciar antipsicótico oral na própria UPA em articulação com o CAPS."],
    oralRubric: [
      { id: "o1", concept: "Acolhimento/vínculo", synonyms: ["acolher", "vínculo", "escuta"], weight: 2 },
      { id: "o2", concept: "Diferenciais", synonyms: ["substância", "orgânica", "mania", "delirium", "maconha"], weight: 3 },
      { id: "o3", concept: "Risco", synonyms: ["risco", "suicídio", "comando", "violência"], weight: 3 },
      { id: "o4", concept: "CAPS/família", synonyms: ["caps", "família", "rede", "raps"], weight: 2 }
    ],
    simplifications: ["Exames de imagem e laboratoriais ampliados não modelados (UPA).", "Escolha e dose de antipsicótico não avaliadas."]
  },
  references: ["INT-VADOD-PSICOSE-2023", "BR-ABP-AGITACAO-2019", "BR-CAPS", "BR-RAPS", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 6, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Acolhimento, história completa, exame, testes, risco, família, decisão compartilhada, CAPS", commands: [act(10, "escuta_qualificada"), ask(320, "h-sintomas"), ask(330, "h-tempo"), ask(340, "h-substancias"), ask(350, "h-risco"), ask(360, "h-humor"), ask(370, "h-organico"), { atSeconds: 380, type: "examine", payload: { region: "cabeca", maneuver: "inspecao" } }, { atSeconds: 390, type: "examine", payload: { region: "neurologico", maneuver: "inspecao" } }, { atSeconds: 400, type: "examine", payload: { region: "geral", maneuver: "inspecao" } }, act(410, "glicemia_capilar"), test(460, "teste_rapido_hiv"), test(470, "teste_rapido_sifilis"), test(480, "teste_gravidez_urina"), act(500, "avaliacao_risco_suicidio"), act(820, "acionar_rede_apoio"), act(950, "decisao_compartilhada"), dx(1200, "primeiro_episodio_psicotico"), dest(1500, "caps")], runUntilSeconds: 2000, expect: [{ condition: { ruleFired: "r-vinculo" }, description: "vínculo" }, { condition: { not: { ruleFired: "r-coercao" } }, description: "sem coerção" }, { condition: { not: { ruleFired: "r-evasao" } }, description: "sem evasão" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 2000, expect: [{ condition: { ruleFired: "r-evasao" }, description: "evasão" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Haloperidol IM de rotina e alta", commands: [ask(10, "h-sintomas"), rx(100, "haloperidol", "amp5", 5, "mg", "IM"), dest(1500, "alta_orientada")], runUntilSeconds: 2000, expect: [{ condition: { ruleFired: "r-coercao" }, description: "coerção" }, { condition: { ruleFired: "r-alta-sem-rede" }, description: "sem rede" }, { condition: { ruleFired: "r-evasao" }, description: "evasão" }] },
    { id: "t-atraso", kind: "delay", description: "Acolhimento tardio após tentativa de evasão", commands: [ask(10, "h-tempo"), act(1300, "escuta_qualificada"), ask(1700, "h-risco"), act(1800, "avaliacao_risco_suicidio"), dest(2300, "caps")], runUntilSeconds: 2600, expect: [{ condition: { ruleFired: "r-evasao" }, description: "evasão" }, { condition: { ruleFired: "r-vinculo" }, description: "vínculo tardio" }] },
    { id: "t-alternativa", kind: "alternative", description: "Desescalada verbal como acolhimento; família e CAPS", commands: [act(10, "desescalada_verbal"), ask(320, "h-sintomas"), ask(330, "h-substancias"), ask(340, "h-risco"), act(400, "acionar_rede_apoio"), act(520, "decisao_compartilhada"), dest(900, "caps")], runUntilSeconds: 2000, expect: [{ condition: { ruleFired: "r-vinculo" }, description: "vínculo" }, { condition: { not: { ruleFired: "r-coercao" } }, description: "sem coerção" }] }
  ]
};
