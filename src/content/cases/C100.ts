import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, hi, obs, outcome, rx, staff, test } from "./helpers";

const ACOLHE = { any: [{ actionCompleted: "desescalada_verbal" }, { actionCompleted: "escuta_qualificada" }] };
const ANTIMANIACO = { any: [{ drugGiven: "risperidona" }, { drugGiven: "haloperidol" }] };
const SUSPENDEU = { actionCompleted: "suspender_medicacao_desencadeante" };

export const C100: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C100",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Homem que não dorme há dias, fala sem parar e gastou as economias da família",
  teachingTitle: "Episódio maníaco após início de antidepressivo — excluir causas médicas e substâncias, suspender o antidepressivo, avaliar riscos, antimaníaco e internação",
  group: "Psiquiatria",
  specialties: ["Psiquiatria", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Reconhecer o episódio maníaco: humor expansivo/irritável, menor necessidade de sono, grandiosidade, aceleração, impulsividade",
    "Excluir causas médicas e substâncias (toxicológico, TSH, sífilis, revisão de medicações)",
    "Suspender o antidepressivo desencadeante",
    "Avaliar riscos (suicídio, finanças, direção, violência) e envolver a família",
    "Antimaníaco por via oral se colaborativo; internação quando o risco e a falta de crítica impedem o cuidado ambulatorial"
  ],
  keywords: ["não dorme", "fala muito", "gastos", "energia", "esposa", "planos"],
  patient: {
    name: "Rodrigo Teixeira",
    ageYears: 32,
    sex: "masculino",
    weightKg: 80,
    heightCm: 180,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 2, hairStyle: "curto", hairColor: "castanho", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Homem de 32 anos trazido pela esposa: há 10 dias dorme 2 horas por noite, diz que vai 'revolucionar o agronegócio', pediu demissão, gastou R$ 15 mil em equipamentos e foi parado pela polícia dirigindo a 160 km/h. Fala alto e rápido; está irritado por ter sido trazido.",
  communication: "limitada",
  informants: [{ id: "paciente", name: "Rodrigo", role: "Paciente" }, { id: "esposa", name: "Fernanda (esposa)", role: "Esposa" }],
  history: [
    hi("h-sintomas", "queixa", "Rodrigo, como você tem se sentido? E o sono?", [{ source: "paciente", text: "Nunca estive tão bem! Duas horinhas e estou novo. Tenho um projeto que vai mudar o país, só ela não entende! Você também vai querer investir!" }], ["sentindo", "sono", "dorme", "energia"]),
    hi("h-tempo", "evolucao", "Desde quando ele está assim? Já teve algo parecido?", [{ source: "esposa", text: "Uns 10 dias. Antes ficou dois meses muito deprimido; o médico do posto passou sertralina há 4 semanas. Nunca ficou assim." }], ["desde quando", "parecido", "antes", "deprimido"]),
    hi("h-medicacoes", "medicacoes", "Que remédios ele usa? Algum corticoide, estimulante, remédio para emagrecer?", [{ source: "esposa", text: "Só a sertralina 50 mg. Nada mais." }], ["remédio", "sertralina", "corticoide", "estimulante"]),
    hi("h-substancias", "habitos", "Usou álcool, cocaína, anfetamina, energéticos em excesso?", [{ source: "paciente", text: "Não preciso disso! Estou natural, cheio de energia." }, { source: "esposa", text: "Bebe socialmente; nunca vi droga." }], ["álcool", "cocaína", "droga", "anfetamina"]),
    hi("h-riscos", "humor_risco", "Teve pensamento de morte? Brigas, ameaças, armas em casa? Como estão as finanças e a direção?", [{ source: "esposa", text: "Não falou em morrer. Discute com todo mundo, mas não agrediu. Não temos arma. Está com cartão de crédito estourado e quer vender o carro." }, { source: "paciente", text: "Morrer? Eu vou é viver muito!" }], ["morte", "suicídio", "armas", "finanças", "direção", "agressão"]),
    hi("h-familia", "familia", "Alguém na família tem transtorno bipolar ou depressão?", [{ source: "esposa", text: "A mãe dele teve 'fases' e tomava lítio." }], ["família", "bipolar", "mãe", "lítio"]),
    hi("h-organico", "antecedentes", "Teve febre, dor de cabeça, convulsão, perda de peso, tremor, palpitação?", [{ source: "esposa", text: "Emagreceu porque quase não come, mas nada de febre ou convulsão." }], ["febre", "convulsão", "peso", "palpitação"])
  ],
  initial: {
    vars: { hr: 104, sbp: 136, dbp: 84, rr: 18, spo2: 98, temp: 36.8, gcs: 15, pain: 0, glucose: 96, perfusion: 0.9, effort: 0.1 },
    flags: { rhythm: "taquicardia_sinusal", agitation: true, posture: "sentado", painVisual: "nenhuma", speech: "frases", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-mental", "cabeca", "inspecao", "Vigil, orientado; humor eufórico e irritável; fala acelerada e pressionada; fuga de ideias; ideias de grandeza; sem alucinações; crítica ausente; atenção dispersa.", { label: "Exame do estado mental", better: [{ when: { ruleFired: "r-antimaniaco" }, text: "Mais calmo; ainda acelerado e sem crítica, mas aceita conversar." }] }),
    ex("e-neuro", "neurologico", "inspecao", "Sem déficits focais, sem tremor, reflexos normais.", { label: "Neurológico" }),
    ex("e-geral", "geral", "inspecao", "Emagrecido, sem sinais de intoxicação (pupilas normais, sem sudorese); sem bócio.", { label: "Estado geral" })
  ],
  testResults: [
    { testId: "toxicologico_urina", variants: [{ text: "Negativo para cocaína, anfetaminas, canabinoides e benzodiazepínicos." }] },
    { testId: "funcao_tireoidiana", variants: [{ text: "TSH e T4 livre normais." }] },
    { testId: "teste_rapido_sifilis", variants: [{ text: "Não reagente." }] },
    { testId: "teste_rapido_hiv", variants: [{ text: "Não reagente." }] },
    { testId: "hemograma", variants: [{ text: "Sem alterações." }] },
    { testId: "eletrolitos", variants: [{ text: "Na 140, K 4,0." }] },
    { testId: "funcao_renal", variants: [{ text: "Creatinina 0,9." }] },
    { testId: "b12_folato", variants: [{ text: "Normais." }] }
  ],
  highlightedActions: ["desescalada_verbal", "suspender_medicacao_desencadeante", "acionar_rede_apoio", "avaliacao_risco_suicidio"],
  rules: [
    { id: "r-acolhimento", description: "Desescalada/acolhimento", priority: 20, when: ACOLHE, repeat: "once", effects: [staff("paciente", "Tá bom, tá bom... eu fico, mas só porque você me ouviu. Mas eu não estou doente!")] },
    { id: "r-escalada", description: "Sem abordagem: escalada da agitação", priority: 30, when: { all: [{ time: "gte", seconds: 1200 }, { not: ACOLHE }, { not: ANTIMANIACO }] }, repeat: "once", effects: [staff("enfermagem", "Ele está gritando no corredor, empurrou o segurança e quer ir embora dirigindo!"), outcome("piora")] },
    { id: "r-antimaniaco", description: "Antipsicótico reduz a agitação", priority: 40, when: ANTIMANIACO, repeat: "once", effects: [flag("agitation", false), staff("enfermagem", "Ele se acalmou e deitou um pouco."), outcome("estabilizacao_parcial")] },
    { id: "r-im-sem-tentativa", description: "Tranquilização IM sem tentar via oral/desescalada", priority: 35, when: { all: [{ drugGiven: "haloperidol" }, { not: ACOLHE }, { not: { ruleFired: "r-escalada" } }] }, repeat: "once", effects: [obs("Paciente ainda abordável: tentar desescalada e via oral antes da tranquilização IM.")] },
    { id: "r-antidepressivo", description: "Destino definido sem suspender o antidepressivo", priority: 45, when: { all: [{ path: "disposition", op: "neq", value: "" }, { not: SUSPENDEU }] }, repeat: "once", effects: [obs("O antidepressivo não traz benefício na mania e pode piorá-la: deve ser suspenso.")] },
    { id: "r-alta", description: "Alta/encaminhamento ambulatorial com risco elevado", priority: 45, when: { any: [{ path: "disposition", op: "eq", value: "alta_orientada" }, { path: "disposition", op: "eq", value: "caps" }, { path: "disposition", op: "eq", value: "encaminhamento_ambulatorial" }] }, repeat: "once", effects: [obs("Mania com risco financeiro, de direção e sem crítica: indicação de internação (leito de saúde mental em hospital geral)."), outcome("complicacao")] }
  ],
  diagnosis: { primary: "episodio_maniaco", accepted: ["episodio_maniaco"], differentials: ["intox_estimulante", "primeiro_episodio_psicotico", "crise_tireotoxica", "delirium", "episodio_depressivo"] },
  acceptedDestinations: ["internacao_enfermaria"],
  outcomeNotes: "Episódio maníaco (provável transtorno bipolar, história familiar) desencadeado após sertralina, sem causa orgânica ou substância. Desescalada, envolvimento da esposa, exames basais (toxicológico, TSH, sífilis, HIV, hemograma, bioquímica, B12/folato), suspensão do antidepressivo, avaliação de riscos, antipsicótico VO (risperidona) e internação em leito de saúde mental de hospital geral; estabilizador (lítio/divalproato) planejado pela equipe.",
  scoring: [
    { id: "s-acolhe", domain: "priorizacao", description: "Desescalada/acolhimento", evidence: { kind: "actionDone", anyOf: ["desescalada_verbal", "escuta_qualificada"], withinSeconds: 600 }, points: 8, severity: "critica", rationale: "Abordagem menos coercitiva primeiro.", sourceIds: ["BR-ABP-AGITACAO-2019"] },
    { id: "s-hist", domain: "historia", description: "Sintomas, tempo e antidepressivo", evidence: { kind: "historyAsked", items: ["h-sintomas", "h-tempo", "h-medicacoes"], minCount: 3 }, points: 10, severity: "critica", rationale: "Mania após antidepressivo.", sourceIds: ["INT-FEDPRACT-MANIA-2016"] },
    { id: "s-subst", domain: "historia", description: "Substâncias e causas orgânicas", evidence: { kind: "historyAsked", items: ["h-substancias", "h-organico"], minCount: 2 }, points: 6, severity: "importante", rationale: "Diferenciais obrigatórios.", sourceIds: ["INT-FEDPRACT-MANIA-2016"] },
    { id: "s-riscos", domain: "historia", description: "Riscos (suicídio, finanças, direção, armas)", evidence: { kind: "historyAsked", items: ["h-riscos"], minCount: 1 }, points: 8, severity: "critica", rationale: "Define o nível de cuidado.", sourceIds: ["INT-FEDPRACT-MANIA-2016"] },
    { id: "s-familia-hist", domain: "historia", description: "História familiar", evidence: { kind: "historyAsked", items: ["h-familia"], minCount: 1 }, points: 4, severity: "importante", rationale: "Sustenta o diagnóstico de bipolaridade." },
    { id: "s-exame", domain: "historia", description: "Estado mental, neurológico e geral", evidence: { kind: "examDone", regions: ["cabeca", "neurologico", "geral"], minCount: 2 }, points: 6, severity: "importante", rationale: "Excluir intoxicação e doença orgânica." },
    { id: "s-tox", domain: "exames", description: "Toxicológico", evidence: { kind: "testOrdered", anyOf: ["toxicologico_urina"] }, points: 6, severity: "importante", rationale: "Não presumir ausência de substâncias.", sourceIds: ["INT-FEDPRACT-MANIA-2016"] },
    { id: "s-basais", domain: "exames", description: "TSH e sífilis", evidence: { kind: "testOrdered", anyOf: ["funcao_tireoidiana", "teste_rapido_sifilis"] }, points: 6, severity: "importante", rationale: "Exames basais do primeiro episódio.", sourceIds: ["INT-FEDPRACT-MANIA-2016"] },
    { id: "s-suspender", domain: "tratamento", description: "Suspender antidepressivo", evidence: { kind: "actionDone", anyOf: ["suspender_medicacao_desencadeante"] }, points: 12, severity: "critica", rationale: "Sem benefício na mania.", sourceIds: ["INT-FEDPRACT-MANIA-2016"] },
    { id: "s-antimaniaco", domain: "tratamento", description: "Antipsicótico (VO preferível)", evidence: { kind: "drugGiven", anyOf: ["risperidona", "haloperidol"] }, points: 10, severity: "critica", rationale: "Risperidona é primeira linha na mania aguda.", sourceIds: ["INT-CANMAT-MANIA-2018", "BR-ABP-AGITACAO-2019"] },
    { id: "s-rede", domain: "destino", description: "Envolver a família", evidence: { kind: "actionDone", anyOf: ["acionar_rede_apoio"] }, points: 6, severity: "importante", rationale: "História, adesão, restrição de acesso a finanças.", sourceIds: ["INT-FEDPRACT-MANIA-2016"] },
    { id: "s-escalada", domain: "priorizacao", description: "Falha: escalada da agitação", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-escalada" } }, points: 8, penalty: true, severity: "importante", rationale: "Sem abordagem inicial." },
    { id: "s-im", domain: "tratamento", description: "Falha: IM sem tentar via oral", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-im-sem-tentativa" } }, points: 4, penalty: true, severity: "importante", rationale: "Menor coerção possível.", sourceIds: ["BR-ABP-AGITACAO-2019"] },
    { id: "s-alta", domain: "destino", description: "Falha: sem internação", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-alta" } }, points: 10, penalty: true, severity: "critica", rationale: "Risco elevado sem crítica." },
    { id: "s-dx", domain: "destino", description: "Episódio maníaco", evidence: { kind: "diagnosis", accepted: ["episodio_maniaco"] }, points: 8, severity: "importante", rationale: "≥ 1 semana de sintomas com prejuízo grave." },
    { id: "s-destino", domain: "destino", description: "Internação", evidence: { kind: "disposition", accepted: ["internacao_enfermaria"] }, points: 10, severity: "critica", rationale: "Proteção do paciente e da família." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Pouco sono sem cansaço, grandiosidade e gastos: qual síndrome?" },
      { level: 2, text: "O que mudou nas medicações há 4 semanas?" },
      { level: 3, text: "Antes de rotular: substâncias e causas médicas." },
      { level: 4, text: "Sugestão explícita: desescalada, história com a esposa, toxicológico/TSH/sífilis, suspender sertralina, riscos, risperidona VO, internar." }
    ],
    summary: "Episódio maníaco após introdução de ISRS em paciente com depressão prévia e história familiar de bipolaridade.",
    pathophysiology: "No transtorno bipolar, antidepressivos em monoterapia podem precipitar virada maníaca ou estados mistos. A mania envolve hiperatividade dopaminérgica e desregulação de ritmos circadianos; a privação de sono perpetua o quadro.",
    keyPoints: [
      "Excluir substâncias e causas médicas (toxicológico, TSH, B12/folato, sífilis, HIV).",
      "Suspender antidepressivo e estimulantes.",
      "Primeira linha: lítio, quetiapina, divalproato, risperidona, aripiprazol, asenapina, paliperidona, cariprazina; combinação é frequente.",
      "Avaliar riscos e envolver família (finanças, armas, direção).",
      "Internar se risco elevado e sem crítica; regularizar o sono."
    ],
    alternatives: ["Haloperidol IM (± prometazina) se agitação grave sem aceitar via oral.", "Associação com estabilizador do humor iniciada na internação."],
    oralRubric: [
      { id: "o1", concept: "Critérios de mania", synonyms: ["sono", "grandeza", "acelerado", "gastos", "mania"], weight: 2 },
      { id: "o2", concept: "Suspender antidepressivo", synonyms: ["suspender", "sertralina", "antidepressivo"], weight: 3 },
      { id: "o3", concept: "Exclusão orgânica", synonyms: ["toxicológico", "tsh", "substância", "orgânica"], weight: 2 },
      { id: "o4", concept: "Internação/riscos", synonyms: ["internar", "risco", "família", "finanças"], weight: 3 }
    ],
    simplifications: ["Estabilizador do humor sem dose cadastrada (decisão da equipe de internação).", "Sintomas psicóticos ausentes neste caso."]
  },
  references: ["INT-CANMAT-MANIA-2018", "INT-FEDPRACT-MANIA-2016", "BR-ABP-AGITACAO-2019", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Desescalada, história, exame, exames basais, suspender sertralina, família, risperidona VO, internação", commands: [act(10, "desescalada_verbal"), ask(320, "h-sintomas"), ask(330, "h-tempo"), ask(340, "h-medicacoes"), ask(350, "h-substancias"), ask(360, "h-organico"), ask(370, "h-riscos"), ask(380, "h-familia"), { atSeconds: 390, type: "examine", payload: { region: "cabeca", maneuver: "inspecao" } }, { atSeconds: 400, type: "examine", payload: { region: "neurologico", maneuver: "inspecao" } }, test(420, "toxicologico_urina"), test(430, "funcao_tireoidiana"), test(440, "teste_rapido_sifilis"), test(450, "hemograma"), act(500, "suspender_medicacao_desencadeante"), act(650, "acionar_rede_apoio"), rx(800, "risperidona", "cp1", 2, "mg", "VO"), dx(1000, "episodio_maniaco"), dest(1300, "internacao_enfermaria")], runUntilSeconds: 2400, expect: [{ condition: { ruleFired: "r-antimaniaco" }, description: "antipsicótico" }, { condition: { not: { ruleFired: "r-escalada" } }, description: "sem escalada" }, { condition: { not: { ruleFired: "r-antidepressivo" } }, description: "antidepressivo suspenso" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 2400, expect: [{ condition: { ruleFired: "r-escalada" }, description: "escalada" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Mantém sertralina e encaminha ao CAPS", commands: [ask(10, "h-sintomas"), dest(900, "caps")], runUntilSeconds: 2400, expect: [{ condition: { ruleFired: "r-alta" }, description: "sem internação" }, { condition: { ruleFired: "r-antidepressivo" }, description: "antidepressivo mantido" }] },
    { id: "t-atraso", kind: "delay", description: "Sem abordagem inicial; escalada; haloperidol + prometazina IM; internação", commands: [ask(10, "h-tempo"), rx(1400, "haloperidol", "amp5", 5, "mg", "IM"), rx(1410, "prometazina", "amp25", 50, "mg", "IM"), act(1600, "suspender_medicacao_desencadeante"), dest(2000, "internacao_enfermaria")], runUntilSeconds: 2600, expect: [{ condition: { ruleFired: "r-escalada" }, description: "escalada" }, { condition: { ruleFired: "r-antimaniaco" }, description: "tranquilização" }, { condition: { not: { ruleFired: "r-im-sem-tentativa" } }, description: "IM justificada após escalada" }] },
    { id: "t-alternativa", kind: "alternative", description: "Escuta qualificada, risperidona 3 mg VO, internação", commands: [act(10, "escuta_qualificada"), ask(320, "h-medicacoes"), act(340, "suspender_medicacao_desencadeante"), test(350, "toxicologico_urina"), rx(500, "risperidona", "cp1", 3, "mg", "VO"), act(600, "acionar_rede_apoio"), dest(1200, "internacao_enfermaria")], runUntilSeconds: 2400, expect: [{ condition: { ruleFired: "r-antimaniaco" }, description: "antipsicótico" }, { condition: { not: { ruleFired: "r-alta" } }, description: "internado" }] }
  ]
};
