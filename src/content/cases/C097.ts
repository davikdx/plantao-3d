import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, staff } from "./helpers";

const ESCUTA = { actionCompleted: "escuta_qualificada" };
const RISCO = { actionCompleted: "avaliacao_risco_suicidio" };

export const C097: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C097",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Consulta por dor de cabeça e insônia na UBS",
  teachingTitle: "Ideação suicida com plano em contexto de crise — avaliação de risco e articulação com a RAPS",
  group: "Psiquiatria e comportamento",
  specialties: ["Psiquiatria", "Atenção primária"],
  environment: "ubs",
  resourceProfile: "ubs-urbana",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Acolher e criar vínculo para identificar a demanda real por trás da queixa",
    "Perguntar diretamente sobre ideação suicida e avaliar plano, meios e tentativas",
    "Garantir segurança imediata e restrição de meios com a rede de apoio",
    "Excluir intoxicação ou lesão atual",
    "Articular cuidado com CAPS/RAPS sem presumir internação"
  ],
  keywords: ["insônia", "dor de cabeça", "tristeza", "desemprego", "UBS"],
  patient: {
    name: "Marcos Vinícius Teixeira",
    ageYears: 41,
    sex: "masculino",
    weightKg: 74,
    heightCm: 174,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 4, hairStyle: "curto", hairColor: "preto", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "UBS urbana, consulta agendada pela recepção como \"dor de cabeça e insônia\". Homem de 41 anos, cadastrado na equipe de Saúde da Família, com pouca procura anterior. A irmã o acompanha e aguarda na recepção.",
  communication: "limitada",
  informants: [{ id: "irma", name: "Cláudia", role: "Irmã (aguarda na recepção)" }],
  history: [
    h("h-queixa", "queixa", "O que te trouxe hoje?", "Essa dor de cabeça que não passa… e não consigo dormir. Queria um remédio pra dormir.", { keywords: ["trouxe", "motivo"] }),
    h("h-sono", "evolucao", "Como está o sono? Desde quando?", "Faz uns dois meses. Acordo às 3 da manhã e fico pensando, não volto a dormir.", { keywords: ["sono", "dormir", "insônia"] }),
    h("h-contexto", "social", "Como estão as coisas em casa e no trabalho?", "Perdi o emprego há quatro meses. A minha esposa saiu de casa com as crianças mês passado. Tô morando sozinho.", { keywords: ["casa", "trabalho", "emprego", "família"] }),
    {
      id: "h-humor",
      topic: "humor_risco",
      question: "Como tem estado o seu ânimo? Tem se sentido triste ou sem esperança?",
      answers: [
        { source: "paciente", when: ESCUTA, text: "Pra ser sincero… não vejo mais sentido em nada. Acho que todo mundo ficaria melhor sem mim." },
        { source: "paciente", text: "Tá tudo meio difícil, mas a gente vai levando." }
      ],
      keywords: ["ânimo", "triste", "esperança", "sentindo"]
    },
    {
      id: "h-ideacao",
      topic: "humor_risco",
      question: "Você tem pensado em se matar ou em acabar com a própria vida?",
      answers: [
        { source: "paciente", when: ESCUTA, text: "(Silêncio.) Tenho. Penso nisso quase todo dia. Ninguém nunca me perguntou isso direto." },
        { source: "paciente", text: "Às vezes passa pela cabeça… mas deixa pra lá." }
      ],
      keywords: ["se matar", "suicídio", "morrer", "acabar com a vida"]
    },
    {
      id: "h-plano",
      topic: "humor_risco",
      question: "Você chegou a pensar em como faria? Tem algum plano ou meio guardado?",
      answers: [
        { source: "paciente", when: { all: [ESCUTA, RISCO] }, text: "Guardei uma caixa de remédios que sobrou da minha mãe. Pensei em fazer no sábado, quando as crianças não vierem me visitar." },
        { source: "paciente", when: ESCUTA, text: "Já pensei… mas prefiro não entrar em detalhe." },
        { source: "paciente", text: "Não quero falar disso." }
      ],
      keywords: ["plano", "como faria", "meio", "guardado"]
    },
    h("h-tentativas", "humor_risco", "Você já tentou se machucar ou tirar a vida antes?", "Uma vez, com 20 anos, tomei uns remédios. Ninguém ficou sabendo.", { keywords: ["tentou", "antes", "tentativa"] }),
    h("h-protecao", "humor_risco", "O que ou quem ainda te segura? Com quem você pode contar?", "Minha filha de 12 anos… e a minha irmã, que veio comigo hoje.", { keywords: ["segura", "apoio", "contar", "proteção"] }),
    h("h-alcool", "habitos", "Tem bebido ou usado alguma droga?", "Tenho bebido mais. Umas cinco latas de cerveja por noite, pra conseguir dormir.", { keywords: ["bebido", "álcool", "droga", "cerveja"] }),
    h("h-hoje", "sinais_alarme", "Você tomou algum remédio ou se machucou hoje?", "Não, hoje não tomei nada nem me machuquei.", { keywords: ["hoje", "tomou", "machucou"] }),
    h("h-antecedentes", "antecedentes", "Já tratou depressão ou outra doença?", "Nunca tratei nada. Não tenho doença.", { keywords: ["tratou", "depressão", "doença"] }),
    h("h-cefaleia", "localizacao", "Como é essa dor de cabeça?", "É uma pressão na cabeça toda, no fim do dia. Não tem nada de diferente, sem vômito, sem fraqueza.", { keywords: ["dor de cabeça", "cabeça"] }),
    hi("h-irma", "outros", "(Com consentimento) O que a família tem notado?", [{ source: "irma", when: { actionCompleted: "acionar_rede_apoio" }, text: "Ele está muito diferente, se isolou. Semana passada me ligou se despedindo de um jeito estranho. Eu fiquei com medo e trouxe ele." }, { source: "paciente", text: "Minha irmã está lá fora, mas não precisa chamar." }], ["irmã", "família", "notado"])
  ],
  initial: {
    vars: { hr: 84, sbp: 128, dbp: 82, rr: 15, spo2: 98, temp: 36.4, gcs: 15, pain: 3, glucose: 96 },
    flags: { posture: "sentado", painVisual: "leve", speech: "frases", communication: "limitada" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Aparência descuidada, olhar baixo, fala lenta e pouco espontânea; afeto entristecido. Sem sinais de intoxicação.", { better: [{ when: ESCUTA, text: "Mantém olhar baixo, mas fala com mais abertura; chora em alguns momentos." }] }),
    ex("e-neuro", "neurologico", "especial", "Orientado, sem déficit focal, sem rigidez de nuca; fundo de olho não realizado (sem oftalmoscópio).", {}),
    ex("e-pele", "pele", "inspecao", "Sem lesões autoprovocadas visíveis em antebraços ou pescoço.", { label: "Pesquisa de lesões" }),
    ex("e-cabeca", "cabeca", "palpacao", "Sem dor à palpação de seios da face ou de artérias temporais.", {})
  ],
  highlightedActions: ["escuta_qualificada", "avaliacao_risco_suicidio", "ambiente_seguro", "acionar_rede_apoio", "plano_seguranca", "medir_pa"],
  rules: [
    { id: "r-vinculo", description: "Escuta qualificada: o paciente se abre", priority: 40, when: ESCUTA, repeat: "once", effects: [{ type: "changeCommunication", state: "normal" }, obs("Ele relaxa os ombros e começa a contar sobre a separação e o desemprego.")] },
    { id: "r-abandono", description: "Sem acolhimento, o paciente desiste da consulta", priority: 20, when: { all: [{ time: "gte", seconds: 1200 }, { not: ESCUTA }] }, repeat: "once", effects: [staff("paciente", "Olha, doutor, acho que vou embora. Só queria um remédio pra dormir mesmo."), outcome("piora")] },
    { id: "r-alta-precoce", description: "Orientações de alta sem avaliação de risco: paciente volta para casa sozinho", priority: 90, when: { all: [{ actionCompleted: "orientacoes_alta" }, { not: RISCO }] }, repeat: "once", effects: [staff("acompanhante", "(Irmã, na recepção) Ele saiu sem falar comigo… disse que estava tudo bem."), outcome("complicacao")] },
    { id: "r-risco-alto", description: "Avaliação estruturada após vínculo revela risco alto (plano, meio, data, tentativa prévia)", priority: 50, when: { all: [ESCUTA, RISCO] }, repeat: "once", effects: [obs("Avaliação de risco: ideação diária, plano com meio disponível e data, tentativa prévia, uso de álcool, isolamento — RISCO ALTO. Fatores de proteção: filha e irmã.")] },
    { id: "r-seguranca", description: "Ambiente seguro e acompanhamento contínuo durante a espera", priority: 55, when: { actionCompleted: "ambiente_seguro" }, repeat: "once", effects: [obs("Agente comunitária permanece com ele na sala de acolhimento enquanto a equipe organiza o cuidado.")] },
    { id: "r-meios", description: "Restrição de meios com a família (com consentimento)", priority: 60, when: { all: [{ actionCompleted: "acionar_rede_apoio" }, { actionCompleted: "plano_seguranca" }] }, repeat: "once", effects: [staff("acompanhante", "Eu vou com ele em casa agora pegar essa caixa de remédios e ele fica comigo esses dias."), outcome("estabilizacao_parcial")] },
    { id: "r-caps", description: "Contato com o CAPS: acolhimento no mesmo dia", priority: 65, when: { all: [{ ruleFired: "r-meios" }, { actionCompleted: "passagem_caso" }] }, repeat: "once", effects: [staff("supervisor", "CAPS III de referência confirmou acolhimento hoje à tarde; a irmã vai acompanhá-lo. A equipe da UBS fará visita domiciliar em 48 h."), outcome("melhora")] }
  ],
  diagnosis: { primary: "risco_suicidio_alto", accepted: ["risco_suicidio_alto", "episodio_depressivo"], differentials: ["episodio_depressivo", "transtorno_ajustamento", "intox_alcool", "enxaqueca"] },
  acceptedDestinations: ["caps", "transferencia_regulada"],
  outcomeNotes: "Acolhimento, pergunta direta, avaliação estruturada, segurança imediata, restrição de meios com a irmã e articulação com o CAPS no mesmo dia levam a melhora. Sem acolhimento, o paciente desiste aos 20 min; orientações de alta sem avaliar risco devolvem o paciente sozinho para casa.",
  scoring: [
    { id: "s-ideacao", domain: "historia", description: "Perguntou diretamente sobre ideação suicida", evidence: { kind: "historyAsked", items: ["h-ideacao"], minCount: 1 }, points: 8, severity: "critica", rationale: "Perguntar diretamente não aumenta o risco e é essencial para identificá-lo.", sourceIds: ["INT-WHO-MHGAP"] },
    { id: "s-risco-hist", domain: "historia", description: "Explorou plano/meios, tentativas e fatores de proteção", evidence: { kind: "historyAsked", items: ["h-plano", "h-tentativas", "h-protecao", "h-alcool"], minCount: 3 }, points: 8, severity: "importante", rationale: "Plano, meio disponível, tentativa prévia e álcool elevam o risco.", sourceIds: ["INT-WHO-MHGAP"] },
    { id: "s-exclusao", domain: "historia", description: "Excluiu intoxicação/lesão atual e avaliou a cefaleia", evidence: { kind: "historyAsked", items: ["h-hoje", "h-cefaleia"], minCount: 2 }, points: 4, severity: "importante", rationale: "Investigação clínica pertinente antes do destino." },
    { id: "s-escuta", domain: "priorizacao", description: "Escuta qualificada nos primeiros 10 minutos", evidence: { kind: "actionDone", anyOf: ["escuta_qualificada"], withinSeconds: 600 }, points: 8, severity: "importante", rationale: "A queixa inicial frequentemente encobre a demanda real." },
    { id: "s-avaliacao", domain: "priorizacao", description: "Avaliação estruturada de risco de suicídio", evidence: { kind: "actionDone", anyOf: ["avaliacao_risco_suicidio"] }, points: 8, severity: "critica", rationale: "Define o nível de proteção necessário.", sourceIds: ["INT-WHO-MHGAP"] },
    { id: "s-ambiente", domain: "priorizacao", description: "Ambiente seguro e acompanhamento contínuo", evidence: { kind: "actionDone", anyOf: ["ambiente_seguro"] }, points: 4, severity: "importante", rationale: "Pessoa com risco alto não deve ficar sozinha." },
    { id: "s-rede", domain: "tratamento", description: "Envolveu a rede de apoio com consentimento", evidence: { kind: "actionDone", anyOf: ["acionar_rede_apoio"] }, points: 8, severity: "importante", rationale: "Família participa da proteção e da restrição de meios." },
    { id: "s-plano", domain: "tratamento", description: "Plano de segurança com restrição de meios", evidence: { kind: "actionDone", anyOf: ["plano_seguranca"] }, points: 9, severity: "importante", rationale: "Restringir o acesso ao meio planejado reduz o risco.", sourceIds: ["INT-WHO-MHGAP"] },
    { id: "s-sem-sedacao", domain: "tratamento", description: "Prescreveu hipnótico/benzodiazepínico em vez de abordar o risco", evidence: { kind: "avoidDrug", anyOf: ["diazepam", "midazolam"] }, points: 6, penalty: true, severity: "importante", rationale: "Fornecer medicação potencialmente letal a quem tem plano de intoxicação é inseguro; não resolve a demanda." },
    { id: "s-exames", domain: "exames", description: "Sem exames desnecessários", evidence: { kind: "testsNotExcessive", maxUnjustified: 1, justified: [] }, points: 15, severity: "menor", rationale: "Avaliação é clínica; exames apenas se houver suspeita orgânica." },
    { id: "s-compartilhada", domain: "reavaliacao", description: "Decisão compartilhada sobre o plano de cuidado", evidence: { kind: "actionDone", anyOf: ["decisao_compartilhada", "plano_seguranca"] }, points: 10, severity: "importante", rationale: "Adesão e vínculo dependem de construir o plano junto." },
    { id: "s-dx", domain: "destino", description: "Reconheceu risco de suicídio elevado", evidence: { kind: "diagnosis", accepted: ["risco_suicidio_alto", "episodio_depressivo"] }, points: 2, severity: "importante", rationale: "Classificação do risco orienta o destino." },
    { id: "s-passagem", domain: "destino", description: "Passagem do caso ao CAPS/serviço de referência", evidence: { kind: "actionDone", anyOf: ["passagem_caso"] }, points: 4, severity: "importante", rationale: "Garante continuidade no mesmo dia.", sourceIds: ["BR-CAPS", "BR-RAPS"] },
    { id: "s-destino", domain: "destino", description: "Articulação com CAPS (ou serviço de urgência se risco iminente sem rede)", evidence: { kind: "disposition", accepted: ["caps", "transferencia_regulada"] }, points: 6, severity: "importante", rationale: "Risco alto com rede de apoio: cuidado intensivo na RAPS; internação não é a única resposta.", sourceIds: ["BR-RAPS"] },
    { id: "s-alta-insegura", domain: "destino", description: "Falha de segurança: alta/retorno de rotina sem plano de proteção", evidence: { kind: "disposition", accepted: ["alta_orientada", "alta_com_seguimento_ubs", "retorno_programado"] }, points: 10, penalty: true, severity: "critica", rationale: "Risco alto exige cuidado no mesmo dia." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "O que pode estar por trás de \"dor de cabeça e insônia\" neste contexto de perdas?" },
      { level: 2, text: "Você perguntou diretamente sobre pensamentos de morte?" },
      { level: 3, text: "Plano, meio disponível, data, tentativa prévia, álcool e isolamento: como isso muda o risco?" },
      { level: 4, text: "Sugestão explícita: escuta qualificada, avaliação estruturada, ambiente seguro, envolver a irmã com consentimento, plano de segurança com restrição de meios e acolhimento no CAPS hoje." }
    ],
    summary: "Homem de 41 anos com perdas recentes, insônia, consumo de álcool e ideação suicida com plano, meio e data; tentativa prévia não tratada.",
    pathophysiology: "Risco de suicídio resulta da interação de fatores predisponentes (transtorno depressivo, tentativa prévia, uso de álcool) com estressores agudos (desemprego, separação, isolamento) e acesso a meios. Fatores de proteção (vínculos, filhos, rede) e uma abordagem empática reduzem o risco; a restrição de meios é uma das intervenções mais eficazes.",
    keyPoints: [
      "Perguntar diretamente sobre suicídio não induz o comportamento.",
      "Avaliar ideação, plano, meios, intenção, tentativas, álcool e proteção.",
      "Risco alto: não deixar sozinho, restringir meios, envolver a rede com consentimento.",
      "Articular com o CAPS/RAPS no mesmo dia; internação não é resposta automática.",
      "Evitar prescrever grandes quantidades de medicações potencialmente letais."
    ],
    alternatives: ["Regulação para serviço de urgência se não houver rede de apoio ou o risco for iminente."],
    oralRubric: [
      { id: "o1", concept: "Pergunta direta sobre suicídio", synonyms: ["perguntar", "ideação", "suicídio", "se matar"], weight: 2 },
      { id: "o2", concept: "Avaliação de risco (plano, meios, tentativa)", synonyms: ["plano", "meios", "tentativa", "risco"], weight: 3 },
      { id: "o3", concept: "Segurança e restrição de meios", synonyms: ["segurança", "restrição", "meios", "não deixar sozinho"], weight: 2 },
      { id: "o4", concept: "Rede de apoio e CAPS", synonyms: ["caps", "raps", "família", "rede"], weight: 2 }
    ],
    simplifications: ["As respostas mais profundas exigem a ação 'escuta qualificada' — representação simplificada do vínculo.", "A avaliação de risco é um passo estruturado; na prática é contínua e não um escore isolado."]
  },
  references: ["INT-WHO-MHGAP", "BR-RAPS", "BR-CAPS", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Escuta, pergunta direta, avaliação, segurança, rede, plano, CAPS", commands: [act(10, "escuta_qualificada"), ask(320, "h-humor"), ask(330, "h-ideacao"), act(340, "avaliacao_risco_suicidio"), ask(650, "h-plano"), ask(660, "h-tentativas"), ask(670, "h-protecao"), ask(680, "h-hoje"), act(690, "ambiente_seguro"), act(760, "acionar_rede_apoio"), act(890, "plano_seguranca"), act(1200, "passagem_caso"), dx(1400, "risco_suicidio_alto"), dest(1400, "caps")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-risco-alto" }, description: "risco identificado" }, { condition: { ruleFired: "r-caps" }, description: "acolhimento no CAPS" }, { condition: { not: { ruleFired: "r-abandono" } }, description: "sem abandono" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem acolhimento", commands: [], runUntilSeconds: 1300, expect: [{ condition: { ruleFired: "r-abandono" }, description: "paciente desiste" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Consulta focada só na cefaleia, com orientações de alta", commands: [act(30, "medir_pa"), ask(80, "h-cefaleia"), act(120, "orientacoes_alta")], runUntilSeconds: 400, expect: [{ condition: { ruleFired: "r-alta-precoce" }, description: "volta sozinho para casa" }, { condition: { not: { ruleFired: "r-risco-alto" } }, description: "risco não identificado" }] },
    { id: "t-atraso", kind: "delay", description: "Escuta só aos 15 min", commands: [ask(20, "h-queixa"), ask(30, "h-ideacao"), act(900, "escuta_qualificada"), act(1210, "avaliacao_risco_suicidio")], runUntilSeconds: 1600, expect: [{ condition: { ruleFired: "r-risco-alto" }, description: "risco identificado tardiamente" }] },
    { id: "t-alternativa", kind: "alternative", description: "Regulação para urgência psiquiátrica após proteção imediata", commands: [act(10, "escuta_qualificada"), act(320, "avaliacao_risco_suicidio"), act(630, "ambiente_seguro"), act(700, "acionar_samu"), dest(900, "transferencia_regulada")], runUntilSeconds: 1000, expect: [{ condition: { ruleFired: "r-risco-alto" }, description: "risco identificado" }, { condition: { not: { ruleFired: "r-abandono" } }, description: "sem abandono" }] }
  ]
};
