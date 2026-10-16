import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, h, obs, outcome, rx, test } from "./helpers";

const NOVO_ANTI_HAS = { any: [{ drugGiven: "losartana" }, { drugGiven: "anlodipino" }] };

export const C105: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C105",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Consulta de rotina: a pressão continua alta",
  teachingTitle: "Hipertensão arterial não controlada em seguimento na APS — técnica de medida, adesão e ajuste terapêutico",
  group: "Atenção primária e doenças crônicas",
  specialties: ["Atenção primária", "Cardiologia"],
  environment: "ubs",
  resourceProfile: "ubs-urbana",
  difficulty: 1,
  level: "internato",
  objectives: [
    "Medir a PA com técnica adequada e confirmar o valor",
    "Investigar adesão, efeitos adversos e sinais de lesão de órgão-alvo",
    "Solicitar avaliação complementar mínima",
    "Ajustar o tratamento com decisão compartilhada e programar retorno",
    "Evitar tratar como urgência uma elevação sem lesão aguda"
  ],
  keywords: ["pressão alta", "rotina", "hipertensão", "remédio", "UBS"],
  patient: {
    name: "Raimundo Batista",
    ageYears: 56,
    sex: "masculino",
    weightKg: 92,
    heightCm: 172,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 5, hairStyle: "crespo_curto", hairColor: "grisalho", build: "obeso", pregnancyTrimester: 0 }
  },
  briefing: "UBS urbana, consulta programada de hipertensão. Homem de 56 anos, caminhoneiro, chegou atrasado e subiu a escada correndo. Diagnóstico de HAS há 3 anos, em uso de hidroclorotiazida.",
  communication: "normal",
  history: [
    h("h-queixa", "queixa", "Como o senhor está? Algum sintoma?", "Tô bem, doutor. Vim porque a agente de saúde mandou. Não sinto nada.", { keywords: ["sintoma", "está", "sentindo"] }),
    h("h-adesao", "medicacoes", "Como o senhor toma o remédio da pressão?", "Pra falar a verdade, quando estou na estrada eu não tomo, porque esse remédio me faz parar toda hora pra urinar. Tomo quando estou em casa.", { keywords: ["remédio", "toma", "hidroclorotiazida"] }),
    h("h-sintomas", "sinais_alarme", "Teve dor no peito, falta de ar, dor de cabeça forte, alteração da visão ou fraqueza em algum lado do corpo?", "Nada disso.", { keywords: ["dor no peito", "falta de ar", "visão", "fraqueza"] }),
    h("h-habitos", "habitos", "Fuma, bebe, faz atividade física? Como é a alimentação?", "Parei de fumar faz 5 anos. Bebo no fim de semana. Exercício nenhum. Na estrada é muito salgado e fritura.", { keywords: ["fuma", "bebe", "exercício", "alimentação", "sal"] }),
    h("h-antecedentes", "antecedentes", "Tem outras doenças? Diabetes, rim, colesterol?", "O último exame de sangue foi há mais de um ano. Disseram que o açúcar estava no limite.", { keywords: ["doença", "diabetes", "colesterol"] }),
    h("h-familia", "familia", "Alguém da família teve infarto ou derrame?", "Meu pai teve derrame com 62 anos."),
    h("h-sono", "outros", "Ronca, acorda cansado, cochila dirigindo?", "Ronco muito, minha esposa reclama. Às vezes dá sono no volante depois do almoço.", { keywords: ["ronca", "sono", "cochila"] }),
    h("h-outros-meds", "outros", "Usa anti-inflamatório, descongestionante ou outro remédio por conta?", "Tomo diclofenaco quando a coluna dói, quase toda semana.", { keywords: ["anti-inflamatório", "diclofenaco", "por conta"] }),
    h("h-alergias", "alergias", "Tem alergia a algum remédio?", "Não.")
  ],
  initial: {
    vars: { hr: 92, sbp: 168, dbp: 102, rr: 16, spo2: 97, temp: 36.3, gcs: 15, pain: 0, glucose: 118, k: 3.6, na: 141, creat: 1.1, urea: 38 },
    flags: { posture: "sentado", painVisual: "nenhuma", speech: "frases" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Bom estado geral, obesidade (IMC ≈ 31 kg/m²), circunferência abdominal aumentada. Ofegante ao chegar.", { better: [{ when: { time: "gte", seconds: 300 }, text: "Bom estado geral, obesidade central; agora em repouso." }] }),
    ex("e-coracao", "coracao", "ausculta", "Bulhas rítmicas, B4 discreta, sem sopros.", { sound: "bulhas_normais" }),
    ex("e-torax", "torax_anterior", "ausculta", "Murmúrio vesicular presente, sem ruídos adventícios.", { sound: "murmurio_normal" }),
    ex("e-pescoco", "pescoco", "ausculta", "Sem sopros carotídeos; pescoço com circunferência aumentada.", {}),
    ex("e-mmii", "membro_inferior_d", "palpacao", "Pulsos pediosos presentes e simétricos; sem edema.", {}),
    ex("e-neuro", "neurologico", "especial", "Sem déficits focais.", {})
  ],
  testResults: [
    { testId: "ecg12", variants: [{ text: "Ritmo sinusal, 78 bpm; critérios de voltagem limítrofes para sobrecarga de ventrículo esquerdo; sem alterações isquêmicas agudas.", ecg: { rhythm: "sinusal", rate: 78, stElevationLeads: [], stDepressionLeads: [], peakedT: false, wideQrs: false } }] },
    { testId: "urina_tipo1", variants: [{ text: "Sem proteinúria em fita; sem hematúria. (Resultado em outro dia.)" }] }
  ],
  highlightedActions: ["medir_pa", "medir_fc_pulso", "glicemia_capilar", "decisao_compartilhada", "orientacoes_alta"],
  rules: [
    { id: "r-repouso", description: "Após 5 minutos de repouso a PA cai (efeito do esforço/ansiedade)", priority: 20, when: { time: "gte", seconds: 300 }, repeat: "once", effects: [{ type: "trendToTarget", var: "sbp", target: 154, tauSeconds: 90, slot: "repouso", priority: 20 }, { type: "trendToTarget", var: "dbp", target: 96, tauSeconds: 90, slot: "repouso", priority: 20 }, { type: "trendToTarget", var: "hr", target: 78, tauSeconds: 90, slot: "repouso", priority: 20 }] },
    { id: "r-medida-unica", description: "Medida única logo após o esforço superestima a PA", when: { all: [{ actionCompleted: "medir_pa" }, { time: "lte", seconds: 240 }] }, repeat: "once", effects: [obs("Medida feita logo após subir a escada, sem repouso: pode superestimar a pressão. Repita após 5 minutos sentado.")] },
    { id: "r-compartilhada", description: "Conversa sobre adesão revela barreira concreta", when: { actionCompleted: "decisao_compartilhada" }, repeat: "once", effects: [obs("Ele prefere um remédio de dose única que não aumente a diurese na estrada, e topa reduzir o sal e o diclofenaco.")] },
    { id: "r-plano", description: "Ajuste terapêutico pactuado", priority: 50, when: { all: [NOVO_ANTI_HAS, { actionCompleted: "decisao_compartilhada" }] }, repeat: "once", effects: [outcome("melhora")] },
    { id: "r-sem-plano", description: "Consulta encerrada sem ajuste: PA permanece descontrolada", when: { all: [{ time: "gte", seconds: 1800 }, { not: NOVO_ANTI_HAS }] }, repeat: "once", effects: [obs("Sem mudança de tratamento, a PA continuará fora da meta até o próximo retorno.")] },
    { id: "r-regulacao-indevida", description: "Acionar urgência sem lesão aguda de órgão-alvo", when: { actionCompleted: "acionar_samu" }, repeat: "once", effects: [{ type: "emitStaffMessage", from: "regulacao", text: "Regulação: paciente assintomático, sem sinais de lesão aguda de órgão-alvo. Não há indicação de remoção de urgência; orientamos ajuste ambulatorial na própria UBS." }] }
  ],
  diagnosis: { primary: "has_nao_controlada", accepted: ["has_nao_controlada"], differentials: ["hipertensao_avental_branco", "urgencia_hipertensiva_lesao", "pseudocrise_hipertensiva", "dm2_descompensado"] },
  acceptedDestinations: ["retorno_programado", "alta_com_seguimento_ubs"],
  outcomeNotes: "PA confirmada após repouso (≈ 154/96) segue acima da meta. Ajuste pactuado (losartana ou anlodipino), redução de sal e do anti-inflamatório, exames de rotina e retorno em ~4 semanas. Não há urgência.",
  scoring: [
    { id: "s-adesao", domain: "historia", description: "Investigou adesão e o motivo da não adesão", evidence: { kind: "historyAsked", items: ["h-adesao"], minCount: 1 }, points: 7, severity: "importante", rationale: "Barreiras concretas (diurese na estrada) orientam a escolha do fármaco.", sourceIds: ["BR-SBC-HAS"] },
    { id: "s-loa", domain: "historia", description: "Pesquisou sintomas de lesão de órgão-alvo", evidence: { kind: "historyAsked", items: ["h-sintomas"], minCount: 1 }, points: 5, severity: "importante", rationale: "Diferenciar HAS não controlada de emergência hipertensiva." },
    { id: "s-fatores", domain: "historia", description: "Pesquisou hábitos, AINE e ronco/apneia", evidence: { kind: "historyAsked", items: ["h-habitos", "h-outros-meds", "h-sono", "h-antecedentes"], minCount: 3 }, points: 8, severity: "importante", rationale: "Sal, AINE e apneia do sono contribuem para PA resistente." },
    { id: "s-medida", domain: "priorizacao", description: "Repetiu a medida da PA após repouso", evidence: { kind: "stateAtEnd", when: { actionCompleted: "medir_pa", count: 2 } }, points: 12, severity: "critica", rationale: "Técnica: repouso de 5 min, manguito adequado, ao menos duas medidas.", sourceIds: ["BR-SBC-HAS"] },
    { id: "s-exame", domain: "priorizacao", description: "Exame cardiovascular e pulsos", evidence: { kind: "examDone", regions: ["coracao", "pescoco", "membro_inferior_d", "geral"], minCount: 2 }, points: 8, severity: "menor", rationale: "Rastrear lesão de órgão-alvo e causas secundárias." },
    { id: "s-exames", domain: "exames", description: "Avaliação complementar: ECG e função renal/potássio", evidence: { kind: "testOrdered", anyOf: ["ecg12", "funcao_renal", "eletrolitos"] }, points: 10, severity: "importante", rationale: "ECG, creatinina, potássio, glicemia, lipídios e urina na avaliação inicial e periódica.", sourceIds: ["BR-SBC-HAS"] },
    { id: "s-exames-excesso", domain: "exames", description: "Sem exames de urgência desnecessários", evidence: { kind: "testsNotExcessive", maxUnjustified: 0, justified: ["ecg12", "funcao_renal", "eletrolitos", "urina_tipo1", "hemograma"] }, points: 5, severity: "menor", rationale: "Exames guiados pela avaliação de rotina." },
    { id: "s-ajuste", domain: "tratamento", description: "Associou/ajustou anti-hipertensivo (losartana ou anlodipino)", evidence: { kind: "drugGiven", anyOf: ["losartana", "anlodipino"] }, points: 15, severity: "importante", rationale: "PA fora da meta em monoterapia: associação de classes é preferida.", alternatives: "BRA (losartana) ou BCC (anlodipino) — ambas aceitas.", sourceIds: ["BR-SBC-HAS", "BR-RENAME"] },
    { id: "s-compartilhada", domain: "tratamento", description: "Decisão compartilhada sobre o plano", evidence: { kind: "actionDone", anyOf: ["decisao_compartilhada"] }, points: 10, severity: "importante", rationale: "Adesão depende de pactuar o esquema com a rotina do paciente." },
    { id: "s-orientacoes", domain: "reavaliacao", description: "Orientou sinais de alarme, sal e AINE", evidence: { kind: "actionDone", anyOf: ["orientacoes_alta"] }, points: 10, severity: "importante", rationale: "Medidas não farmacológicas e segurança." },
    { id: "s-regulacao-indevida", domain: "destino", description: "Acionar urgência para HAS sem lesão aguda", evidence: { kind: "avoidAction", anyOf: ["acionar_samu"] }, points: 5, penalty: true, severity: "importante", rationale: "Elevação crônica sem sintomas não é emergência; tratar na APS." },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de HAS não controlada", evidence: { kind: "diagnosis", accepted: ["has_nao_controlada"] }, points: 4, severity: "importante", rationale: "PA confirmada acima da meta em uso de tratamento." },
    { id: "s-destino", domain: "destino", description: "Retorno programado na UBS", evidence: { kind: "disposition", accepted: ["retorno_programado", "alta_com_seguimento_ubs"] }, points: 6, severity: "importante", rationale: "Reavaliar em semanas após ajuste." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "A primeira medida foi feita em condições adequadas?" },
      { level: 2, text: "Por que ele não toma o remédio? Isso muda a escolha do fármaco?" },
      { level: 3, text: "Sal, anti-inflamatório e apneia do sono elevam a PA." },
      { level: 4, text: "Sugestão explícita: repetir a PA após repouso, investigar adesão e AINE, ECG e exames de rotina, associar losartana ou anlodipino pactuado e retorno programado." }
    ],
    summary: "Homem de 56 anos, caminhoneiro, obeso, com HAS em hidroclorotiazida de uso irregular, uso frequente de diclofenaco e provável apneia do sono; PA confirmada 154/96 mmHg, assintomático.",
    pathophysiology: "A HAS crônica decorre de aumento da resistência vascular periférica e de fatores como ingestão de sódio, obesidade, ativação simpática (apneia do sono) e uso de AINE (retenção de sódio). O controle exige adesão a um esquema factível e medidas não farmacológicas; elevação sem lesão aguda de órgão-alvo não requer redução rápida.",
    keyPoints: [
      "Medir com técnica: repouso, manguito adequado, duas ou mais medidas.",
      "Antes de aumentar dose, investigar adesão, AINE e outras causas.",
      "Associação de classes em dose baixa é preferida à monoterapia em dose máxima.",
      "Sem lesão aguda de órgão-alvo: tratar na APS, sem encaminhar à urgência.",
      "Pactuar o plano e programar retorno."
    ],
    alternatives: ["Losartana ou anlodipino como segundo fármaco."],
    oralRubric: [
      { id: "o1", concept: "Técnica de medida", synonyms: ["repouso", "repetir", "técnica", "manguito"], weight: 2 },
      { id: "o2", concept: "Adesão e barreiras", synonyms: ["adesão", "não toma", "diurese", "barreira"], weight: 2 },
      { id: "o3", concept: "Ajuste terapêutico", synonyms: ["losartana", "anlodipino", "associar", "associação"], weight: 2 },
      { id: "o4", concept: "Fatores contribuintes", synonyms: ["sal", "anti-inflamatório", "diclofenaco", "apneia"], weight: 1 },
      { id: "o5", concept: "Seguimento na APS", synonyms: ["retorno", "acompanhamento", "ubs"], weight: 1 }
    ],
    simplifications: ["A queda da PA após repouso é um parâmetro didático.", "Metas pressóricas variam por risco; conferir a Diretriz Brasileira de Hipertensão 2025."]
  },
  references: ["BR-SBC-HAS", "BR-RENAME", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 8, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Duas medidas, adesão, exames, losartana pactuada, retorno", commands: [act(10, "medir_pa"), ask(60, "h-adesao"), ask(70, "h-sintomas"), ask(80, "h-outros-meds"), act(420, "medir_pa"), test(500, "ecg12"), test(520, "funcao_renal"), act(700, "decisao_compartilhada"), rx(900, "losartana", "cp50", 50, "mg", "VO"), act(950, "orientacoes_alta"), dx(1000, "has_nao_controlada"), dest(1000, "retorno_programado")], runUntilSeconds: 1200, expect: [{ condition: { ruleFired: "r-plano" }, description: "plano pactuado" }, { condition: { path: "vars.sbp", op: "lt", value: 160 }, description: "PA confirmada abaixo da primeira medida" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Consulta sem ajuste", commands: [], runUntilSeconds: 1900, expect: [{ condition: { ruleFired: "r-sem-plano" }, description: "sem plano" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Uma única medida logo na chegada e acionamento de urgência", commands: [act(10, "medir_pa"), act(80, "acionar_samu")], runUntilSeconds: 400, expect: [{ condition: { ruleFired: "r-medida-unica" }, description: "medida inadequada" }, { condition: { ruleFired: "r-regulacao-indevida" }, description: "regulação recusa" }] },
    { id: "t-atraso", kind: "delay", description: "Ajuste sem conversar sobre adesão", commands: [act(400, "medir_pa"), rx(600, "anlodipino", "cp5", 5, "mg", "VO")], runUntilSeconds: 1900, expect: [{ condition: { not: { ruleFired: "r-plano" } }, description: "plano não pactuado" }] },
    { id: "t-alternativa", kind: "alternative", description: "Anlodipino em vez de losartana", commands: [act(400, "medir_pa"), act(500, "decisao_compartilhada"), rx(600, "anlodipino", "cp5", 5, "mg", "VO")], runUntilSeconds: 900, expect: [{ condition: { ruleFired: "r-plano" }, description: "plano pactuado" }] }
  ]
};
