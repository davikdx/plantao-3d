import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, hi, obs, outcome, rx, staff, test } from "./helpers";

const RISCO = { actionCompleted: "avaliacao_risco_suicidio" };
const ACOLHE = { actionCompleted: "escuta_qualificada" };
const DEFINIU = { path: "disposition", op: "neq", value: "" };

export const C110: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C110",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Merendeira de 42 anos que veio por 'cansaço' e chora durante a consulta",
  teachingTitle: "Sintomas depressivos na UBS — entrevista acolhedora, gravidade (PHQ-9), avaliação de risco de suicídio, causas clínicas, plano compartilhado (psicoterapia ± ISRS) e retorno precoce",
  group: "Atenção primária",
  specialties: ["Medicina de família", "Saúde mental"],
  environment: "consultorio",
  resourceProfile: "ubs-urbana",
  difficulty: 2,
  level: "internato",
  objectives: [
    "Reconhecer depressão atrás de queixa somática (cansaço, insônia)",
    "Avaliar gravidade e perguntar ativamente sobre ideação suicida e autolesão",
    "Investigar causas clínicas e uso de álcool/substâncias",
    "Plano compartilhado: psicoterapia e, na depressão mais grave, antidepressivo; sem benzodiazepínico",
    "Rede de apoio, plano de segurança e retorno em 1–4 semanas"
  ],
  keywords: ["cansaço", "chora", "sem vontade", "insônia", "trabalho", "tristeza"],
  patient: {
    name: "Rosimeire Alves",
    ageYears: 42,
    sex: "feminino",
    weightKg: 70,
    heightCm: 160,
    visual: { ageGroup: "adulto", sex: "feminino", skinTone: 4, hairStyle: "coque", hairColor: "preto", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "UBS, consulta. Mulher de 42 anos, merendeira, procura atendimento por 'cansaço' há 2 meses e pede exame de sangue. Durante a consulta começa a chorar.",
  communication: "normal",
  informants: [{ id: "paciente", name: "Rosimeire", role: "Paciente" }],
  history: [
    hi("h-humor", "queixa", "Percebo que você está triste. Como tem se sentido nas últimas semanas? Ainda sente prazer nas coisas?", [{ source: "paciente", text: "Triste quase todo dia, há uns dois meses. Não tenho vontade de nada, nem de ver minhas filhas. Me sinto um peso." }], ["triste", "sentido", "prazer", "vontade"]),
    hi("h-somaticos", "fatores_associados", "Como estão o sono, o apetite, a energia e a concentração?", [{ source: "paciente", text: "Acordo às 3 da manhã e não durmo mais. Perdi 4 quilos. Erro as receitas na cozinha da escola." }], ["sono", "apetite", "energia", "concentração", "peso"]),
    hi("h-ideacao", "humor_risco", "Às vezes, quando a pessoa está assim, pensa que não vale a pena viver ou em se machucar. Isso tem acontecido com você?", [{ source: "paciente", text: "Penso que seria melhor dormir e não acordar... mas não tenho plano, nunca tentei. Minhas filhas me seguram." }], ["vale a pena", "morrer", "machucar", "suicídio", "plano"]),
    hi("h-contexto", "social", "O que tem acontecido na sua vida? Com quem você mora? Tem com quem contar?", [{ source: "paciente", text: "Separei há 6 meses, dívidas, dupla jornada. Moro com as duas filhas, 15 e 10 anos. Minha irmã mora perto." }], ["vida", "mora", "contar", "separação", "apoio"]),
    hi("h-substancias", "habitos", "Tem bebido ou usado algum remédio para dormir por conta própria?", [{ source: "paciente", text: "Uma cerveja às vezes. Uma vizinha me deu um comprimido de clonazepam, tomei duas vezes." }], ["bebido", "álcool", "remédio para dormir", "clonazepam"]),
    hi("h-clinico", "antecedentes", "Tem problema de tireoide, anemia, menstruação muito intensa, alguma doença? Já teve isso antes ou fase de euforia?", [{ source: "paciente", text: "Menstruação normal. Nunca tive euforia. Tive tristeza depois do parto da caçula, passou sozinha." }], ["tireoide", "anemia", "menstruação", "euforia", "antes"]),
    hi("h-preferencia", "outros", "Existem caminhos: conversar com psicólogo, grupo, remédio. O que faz mais sentido para você?", [{ source: "paciente", text: "Queria conversar com alguém. Se precisar de remédio, aceito, mas tenho medo de viciar." }], ["caminhos", "preferência", "psicólogo", "remédio"])
  ],
  initial: {
    vars: { hr: 78, sbp: 118, dbp: 76, rr: 15, spo2: 98, temp: 36.4, gcs: 15, pain: 0, glucose: 94, perfusion: 0.9, effort: 0.1 },
    flags: { rhythm: "sinusal", posture: "sentado", painVisual: "nenhuma", speech: "frases", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-mental", "cabeca", "inspecao", "Hipomímica, choro fácil, discurso lentificado, humor deprimido, sem sintomas psicóticos, crítica preservada.", { label: "Exame do estado mental" }),
    ex("e-geral", "geral", "inspecao", "Mucosas coradas; tireoide não palpável; sem edema.", { label: "Exame físico geral" }),
    ex("e-pele", "membro_superior_e", "inspecao", "Sem lesões de autolesão nos antebraços.", { label: "Antebraços" })
  ],
  testResults: [
    { testId: "hemograma", variants: [{ text: "Resultado do laboratório municipal em outro dia (normal)." }] },
    { testId: "funcao_tireoidiana", variants: [{ text: "Indisponível na UBS; coletar pela rede." }] }
  ],
  highlightedActions: ["escuta_qualificada", "rastreio_phq9", "avaliacao_risco_suicidio", "plano_seguranca"],
  rules: [
    { id: "r-acolhe", description: "Acolhimento", priority: 20, when: ACOLHE, repeat: "once", effects: [staff("paciente", "Faz tempo que ninguém me pergunta como eu estou de verdade.")] },
    { id: "r-phq", description: "PHQ-9 aplicado", priority: 20, when: { actionCompleted: "rastreio_phq9" }, repeat: "once", effects: [staff("enfermagem", "PHQ-9 = 18 (moderadamente grave); item 9 positivo — avaliar risco.")] },
    { id: "r-sem-risco", description: "Plano sem avaliação de risco", priority: 40, when: { all: [DEFINIU, { not: RISCO }] }, repeat: "once", effects: [obs("Ideação passiva de morte exige avaliação estruturada de risco e plano de segurança antes de definir o seguimento."), outcome("complicacao")] },
    { id: "r-benzo", description: "Benzodiazepínico como tratamento", priority: 40, when: { any: [{ drugGiven: "diazepam" }, { drugGiven: "clonazepam" }] }, repeat: "once", effects: [obs("Benzodiazepínico não trata depressão e traz risco de dependência e de uso em tentativa de suicídio.")] },
    { id: "r-tratamento", description: "Plano terapêutico iniciado", priority: 30, when: { all: [{ actionCompleted: "encaminhar_psicoterapia" }, RISCO] }, repeat: "once", effects: [outcome("melhora")] }
  ],
  diagnosis: { primary: "episodio_depressivo", accepted: ["episodio_depressivo"], differentials: ["transtorno_ajustamento", "hipotireoidismo", "ferropenia", "risco_suicidio_alto", "episodio_maniaco"] },
  acceptedDestinations: ["retorno_programado"],
  outcomeNotes: "Episódio depressivo mais grave (PHQ-9 18, 2 meses, anedonia, insônia terminal, perda de peso, culpa, ideação passiva sem plano, fatores de proteção) com estressores. Acolhimento, avaliação estruturada de risco e plano de segurança, rede de apoio, exames básicos, psicoterapia + ISRS por decisão compartilhada (informação escrita), sem benzodiazepínico, retorno em 1–2 semanas (ideação) e continuidade com a mesma equipe.",
  scoring: [
    { id: "s-acolhe", domain: "priorizacao", description: "Escuta qualificada", evidence: { kind: "actionDone", anyOf: ["escuta_qualificada"], withinSeconds: 600 }, points: 10, severity: "critica", rationale: "Base da entrevista." },
    { id: "s-hist", domain: "historia", description: "Humor, anedonia e sintomas somáticos", evidence: { kind: "historyAsked", items: ["h-humor", "h-somaticos"], minCount: 2 }, points: 8, severity: "critica", rationale: "Critérios e gravidade." },
    { id: "s-ideacao", domain: "historia", description: "Pergunta direta sobre ideação suicida", evidence: { kind: "historyAsked", items: ["h-ideacao"], minCount: 1 }, points: 12, severity: "critica", rationale: "Para todo paciente com depressão.", sourceIds: ["INT-NICE-DEPRESSAO-2022"] },
    { id: "s-risco", domain: "reavaliacao", description: "Avaliação estruturada de risco", evidence: { kind: "actionDone", anyOf: ["avaliacao_risco_suicidio"] }, points: 10, severity: "critica", rationale: "Ideação passiva presente.", sourceIds: ["INT-NICE-DEPRESSAO-2022"] },
    { id: "s-phq", domain: "exames", description: "PHQ-9", evidence: { kind: "actionDone", anyOf: ["rastreio_phq9"] }, points: 4, severity: "importante", rationale: "Gravidade e seguimento." },
    { id: "s-contexto", domain: "historia", description: "Contexto, apoio, substâncias e diferenciais", evidence: { kind: "historyAsked", items: ["h-contexto", "h-substancias", "h-clinico"], minCount: 2 }, points: 8, severity: "importante", rationale: "Rede, álcool, bipolaridade, causas clínicas.", sourceIds: ["INT-NICE-DEPRESSAO-2022"] },
    { id: "s-seguranca", domain: "tratamento", description: "Plano de segurança e rede de apoio", evidence: { kind: "actionDone", anyOf: ["plano_seguranca", "acionar_rede_apoio"] }, points: 8, severity: "importante", rationale: "Fatores de proteção." },
    { id: "s-psico", domain: "tratamento", description: "Psicoterapia/grupo", evidence: { kind: "actionDone", anyOf: ["encaminhar_psicoterapia"] }, points: 10, severity: "critica", rationale: "Primeira linha.", sourceIds: ["INT-NICE-DEPRESSAO-2022"] },
    { id: "s-isrs", domain: "tratamento", description: "ISRS na depressão mais grave (decisão compartilhada)", evidence: { kind: "drugGiven", anyOf: ["fluoxetina", "sertralina"] }, points: 8, severity: "importante", rationale: "TCC + antidepressivo como primeira opção na mais grave.", sourceIds: ["INT-NICE-DEPRESSAO-2022"] },
    { id: "s-decisao", domain: "destino", description: "Decisão compartilhada", evidence: { kind: "actionDone", anyOf: ["decisao_compartilhada"] }, points: 6, severity: "importante", rationale: "Preferência da paciente." },
    { id: "s-sem-benzo", domain: "tratamento", description: "Sem benzodiazepínico", evidence: { kind: "avoidDrug", anyOf: ["diazepam", "clonazepam"] }, points: 4, severity: "importante", rationale: "Não trata depressão." },
    { id: "s-falha-risco", domain: "reavaliacao", description: "Falha: sem avaliação de risco", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-sem-risco" } }, points: 12, penalty: true, severity: "critica", rationale: "Ideação presente." },
    { id: "s-dx", domain: "destino", description: "Episódio depressivo", evidence: { kind: "diagnosis", accepted: ["episodio_depressivo"] }, points: 6, severity: "importante", rationale: "≥ 2 semanas, prejuízo." },
    { id: "s-destino", domain: "destino", description: "Retorno precoce", evidence: { kind: "disposition", accepted: ["retorno_programado"] }, points: 6, severity: "importante", rationale: "1–4 semanas; 1 semana se risco.", sourceIds: ["INT-NICE-DEPRESSAO-2022"] }
  ],
  teaching: {
    hints: [
      { level: 1, text: "O cansaço pode ser a porta de entrada: pergunte sobre humor e prazer." },
      { level: 2, text: "Pergunte diretamente sobre ideias de morte — isso não induz suicídio." },
      { level: 3, text: "Quem está por perto para apoiar? Há fatores de proteção?" },
      { level: 4, text: "Sugestão explícita: escuta, PHQ-9, ideação, avaliação de risco, plano de segurança, rede, psicoterapia, ISRS compartilhado, retorno em 1–2 semanas." }
    ],
    summary: "Episódio depressivo mais grave com ideação passiva, sem plano, em contexto de separação e sobrecarga.",
    pathophysiology: "A depressão resulta da interação entre vulnerabilidade biológica (episódio pós-parto prévio) e estressores psicossociais. Sintomas somáticos (sono, apetite, energia) frequentemente motivam a consulta na APS.",
    keyPoints: [
      "Perguntar ativamente sobre ideação suicida em toda depressão.",
      "Menos grave: intervenções psicológicas; antidepressivo não é padrão.",
      "Mais grave: TCC + antidepressivo como primeira opção.",
      "Informação escrita ao iniciar antidepressivo; rever em 1 semana se < 25 anos ou risco, senão em 2–4 semanas.",
      "Rastrear bipolaridade antes do ISRS; evitar benzodiazepínico."
    ],
    alternatives: ["Sertralina como ISRS alternativo.", "CAPS se risco elevado, sintomas psicóticos ou falha do tratamento na APS."],
    oralRubric: [
      { id: "o1", concept: "Ideação suicida", synonyms: ["suicídio", "morte", "ideação", "risco"], weight: 3 },
      { id: "o2", concept: "Gravidade", synonyms: ["phq", "grave", "moderada"], weight: 2 },
      { id: "o3", concept: "Tratamento", synonyms: ["psicoterapia", "tcc", "isrs", "fluoxetina"], weight: 3 },
      { id: "o4", concept: "Seguimento", synonyms: ["retorno", "uma semana", "continuidade"], weight: 2 }
    ],
    simplifications: ["Dose do ISRS não avaliada (sem regra cadastrada).", "TSH indisponível na UBS do caso."]
  },
  references: ["INT-NICE-DEPRESSAO-2022", "BR-RAPS", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Escuta, história, PHQ-9, ideação, risco, segurança, psicoterapia, ISRS compartilhado, retorno", commands: [act(10, "escuta_qualificada"), ask(320, "h-humor"), ask(330, "h-somaticos"), ask(340, "h-ideacao"), ask(350, "h-contexto"), ask(360, "h-substancias"), ask(370, "h-clinico"), act(380, "rastreio_phq9"), act(630, "avaliacao_risco_suicidio"), act(940, "plano_seguranca"), act(1250, "acionar_rede_apoio"), ask(1380, "h-preferencia"), act(1390, "decisao_compartilhada"), act(1580, "encaminhar_psicoterapia"), rx(1710, "fluoxetina", "cp20", 20, "mg", "VO"), dx(1720, "episodio_depressivo"), dest(1800, "retorno_programado")], runUntilSeconds: 2400, expect: [{ condition: { ruleFired: "r-tratamento" }, description: "plano" }, { condition: { not: { ruleFired: "r-sem-risco" } }, description: "risco avaliado" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Só pede exames e retorno", commands: [test(30, "hemograma"), dest(600, "retorno_programado")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-sem-risco" }, description: "sem avaliação de risco" }] },
    { id: "t-inadequada", kind: "inadequate", description: "'Estresse': clonazepam e retorno", commands: [ask(10, "h-somaticos"), rx(200, "clonazepam", "cp2", 2, "mg", "VO"), dest(600, "retorno_programado")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-benzo" }, description: "benzodiazepínico" }, { condition: { ruleFired: "r-sem-risco" }, description: "sem risco" }] },
    { id: "t-atraso", kind: "delay", description: "Pergunta de ideação só no fim; sem psicoterapia", commands: [ask(10, "h-humor"), ask(900, "h-ideacao"), act(1000, "avaliacao_risco_suicidio"), dest(1400, "retorno_programado")], runUntilSeconds: 2000, expect: [{ condition: { not: { ruleFired: "r-sem-risco" } }, description: "risco avaliado" }, { condition: { not: { ruleFired: "r-tratamento" } }, description: "sem plano terapêutico" }] },
    { id: "t-alternativa", kind: "alternative", description: "Psicoterapia + sertralina, rede de apoio", commands: [act(10, "escuta_qualificada"), ask(320, "h-ideacao"), act(330, "avaliacao_risco_suicidio"), act(640, "acionar_rede_apoio"), act(770, "encaminhar_psicoterapia"), rx(900, "sertralina", "cp50", 50, "mg", "VO"), dest(1100, "retorno_programado")], runUntilSeconds: 2000, expect: [{ condition: { ruleFired: "r-tratamento" }, description: "plano" }] }
  ]
};
