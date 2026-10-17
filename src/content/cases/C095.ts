import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const O2_ALTO = { any: [{ deviceActive: "mascara_reservatorio" }, { deviceActive: "tot" }] };

export const C095: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C095",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Mulher com dor de cabeça, náusea e desmaio no banheiro numa manhã fria",
  teachingTitle: "Intoxicação por monóxido de carbono — suspeitar pela exposição, não confiar no oxímetro, COHb por gasometria, O2 100% de alto fluxo, ECG/troponina e proteger os demais expostos",
  group: "Toxicologia",
  specialties: ["Toxicologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Suspeitar de intoxicação por CO em cefaleia/náusea/síncope com fonte de combustão em ambiente fechado ou vários doentes no mesmo local",
    "Entender que a SpO2 do oxímetro comum é falsamente normal; dosar COHb em gasometria com co-oximetria",
    "Iniciar O2 100% de alto fluxo imediatamente, sem esperar exames",
    "ECG e troponina na intoxicação moderada/grave; teste de gravidez",
    "Acionar avaliação dos demais expostos; discutir hiperbárico com CIATox/especialista"
  ],
  keywords: ["dor de cabeça", "náusea", "desmaio", "frio", "banheiro", "tontura"],
  patient: {
    name: "Patrícia Souza",
    ageYears: 34,
    sex: "feminino",
    weightKg: 62,
    heightCm: 163,
    visual: { ageGroup: "adulto", sex: "feminino", skinTone: 2, hairStyle: "longo", hairColor: "castanho", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional, 7 h da manhã de uma noite muito fria. Mulher de 34 anos trazida por uma vizinha: acordou com dor de cabeça forte e náusea e desmaiou no banheiro por alguns segundos.",
  communication: "normal",
  informants: [{ id: "paciente", name: "Patrícia", role: "Paciente" }, { id: "vizinha", name: "Dona Cida", role: "Vizinha" }],
  history: [
    hi("h-cefaleia", "queixa", "Como é a dor de cabeça? Já teve igual?", [{ source: "paciente", text: "Latejante, a cabeça toda, desde que acordei. Nunca tive assim. Estou tonta e enjoada." }], ["dor de cabeça", "cefaleia", "igual"]),
    hi("h-ambiente", "exposicao", "Como estava a casa à noite? Usou aquecedor, fogareiro, braseiro, chuveiro ou aquecedor a gás?", [{ source: "paciente", text: "Fazia muito frio; deixei um braseiro de carvão no quarto com a janela fechada." }], ["casa", "aquecedor", "braseiro", "gás", "janela", "carvão"]),
    hi("h-casa", "social", "Quem mais dormiu na casa? Como estão?", [{ source: "paciente", text: "Meu marido e meus dois filhos, de 4 e 7 anos. Quando saí, eles ainda estavam dormindo... difícil de acordar." }], ["quem mais", "família", "filhos", "marido", "casa"]),
    hi("h-sincope", "sinais_alarme", "Perdeu a consciência? Teve dor no peito, falta de ar, convulsão, confusão?", [{ source: "paciente", text: "Apaguei uns segundos no banheiro. Um aperto leve no peito agora." }, { source: "vizinha", text: "Ela estava meio confusa quando bateu na minha porta." }], ["desmaio", "consciência", "peito", "confusão"]),
    hi("h-gestacao", "ginecologico", "Pode estar grávida? Data da última menstruação?", [{ source: "paciente", text: "Acho que não; a menstruação veio há três semanas." }], ["grávida", "gravidez", "menstruação"]),
    hi("h-habitos", "habitos", "Fuma?", [{ source: "paciente", text: "Não fumo." }], ["fuma", "cigarro"])
  ],
  initial: {
    vars: { hr: 108, sbp: 118, dbp: 74, rr: 22, spo2: 99, temp: 36.6, gcs: 14, pain: 7, glucose: 104, perfusion: 0.85, effort: 0.2, cohb: 24, lactate: 2.4, trop: 9 },
    flags: { rhythm: "taquicardia_sinusal", posture: "sentado", painVisual: "moderada", speech: "frases", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Corada, sem cianose; oxímetro de pulso mostra 99% em ar ambiente.", { label: "Aspecto e oximetria" }),
    ex("e-neuro", "neurologico", "inspecao", "Lentificada, orientada parcialmente no tempo; sem déficit focal; marcha instável.", { label: "Neurológico", better: [{ when: { ruleFired: "r-o2-co" }, text: "Mais desperta e orientada; sem déficit focal." }, { when: { ruleFired: "r-neuro" }, text: "Sonolenta, desorientada, sem déficit focal." }] }),
    ex("e-cabeca", "cabeca", "inspecao", "Sem trauma visível após a queda.", { label: "Crânio (queda)" }),
    ex("e-torax", "torax_anterior", "ausculta", "Murmúrio vesicular presente, sem ruídos adventícios; sem fuligem nas vias aéreas.", { sound: "murmurio_normal" }),
    ex("e-coracao", "coracao", "ausculta", "Taquicárdica, bulhas normais.", { sound: "bulhas_normais" })
  ],
  testResults: [
    { testId: "ecg12", variants: [{ text: "Taquicardia sinusal; infradesnivelamento de ST de 0,5 mm em V5–V6, inespecífico." }] },
    { testId: "teste_gravidez_urina", variants: [{ text: "Negativo." }] },
    { testId: "bhcg", variants: [{ text: "Negativo." }] }
  ],
  highlightedActions: ["o2_mascara_reservatorio", "monitorizar", "contato_ciatox", "acionar_samu"],
  rules: [
    { id: "r-ar-ambiente", description: "Eliminação lenta da COHb em ar ambiente (meia-vida ~320 min)", priority: 10, when: { always: true }, repeat: "once", effects: [trend("cohb", 2, 27700, "base", 10)] },
    { id: "r-o2-co", description: "O2 100% de alto fluxo: meia-vida da COHb ~80 min", priority: 40, when: O2_ALTO, repeat: "while", effects: [{ type: "trendToTarget", var: "cohb", target: 1, tauSeconds: 6900, slot: "o2", priority: 40 }, { type: "trendToTarget", var: "pain", target: 2, tauSeconds: 1800, slot: "o2", priority: 40 }, { type: "trendToTarget", var: "hr", target: 88, tauSeconds: 1800, slot: "o2", priority: 40 }, { type: "trendToTarget", var: "gcs", target: 15, tauSeconds: 900, slot: "o2", priority: 40 }], onEnd: [{ type: "clearTrend", var: "cohb", slot: "o2" }, { type: "clearTrend", var: "pain", slot: "o2" }, { type: "clearTrend", var: "hr", slot: "o2" }, { type: "clearTrend", var: "gcs", slot: "o2" }] },
    { id: "r-cateter", description: "Cateter nasal: FiO2 insuficiente", priority: 20, when: { deviceActive: "cateter_nasal" }, repeat: "once", effects: [staff("supervisor", "Cateter nasal não oferece O2 a 100%: para CO, máscara com reservatório em alto fluxo.")] },
    { id: "r-neuro", description: "Sem O2 de alto fluxo: piora neurológica", priority: 30, when: { all: [{ time: "gte", seconds: 1500 }, { not: { ruleFired: "r-o2-co" } }] }, repeat: "once", effects: [trend("gcs", 12, 900, "neu", 30), trend("trop", 60, 3600, "neu", 30), flag("consciousness", "voz"), staff("enfermagem", "Ela está mais sonolenta e confusa — mas a saturação continua 99%!"), outcome("piora")] },
    { id: "r-familia", description: "Demais expostos resgatados", priority: 20, when: { actionCompleted: "acionar_samu" }, repeat: "once", effects: [staff("regulacao", "SAMU na casa: janelas abertas, braseiro retirado; marido e crianças sonolentos, recebendo O2 e sendo trazidos.")] },
    { id: "r-alta", description: "Alta precoce/sem tratar a fonte", priority: 45, when: { any: [{ path: "disposition", op: "eq", value: "alta_orientada" }, { path: "disposition", op: "eq", value: "alta_com_seguimento_ubs" }] }, repeat: "once", effects: [obs("Alta exige sintomas resolvidos, COHb normal e ausência de perda de consciência ou lesão de órgão — e a fonte precisa ser eliminada."), outcome("complicacao")] }
  ],
  diagnosis: { primary: "intox_co", accepted: ["intox_co"], differentials: ["enxaqueca", "gastroenterite", "avc_isquemico", "hipoglicemia"] },
  acceptedDestinations: ["observacao", "internacao_enfermaria", "transferencia_regulada"],
  outcomeNotes: "Intoxicação por CO (braseiro em quarto fechado) com cefaleia, náusea, confusão e síncope, COHb 24% e SpO2 falsamente normal. O2 100% por máscara com reservatório imediatamente, gasometria com co-oximetria, ECG e troponina, teste de gravidez, CIATox (discutir hiperbárico pela síncope), SAMU para os demais moradores; O2 até COHb < 3% e sintomas resolvidos; observação/internação.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Exposição e fonte de combustão", evidence: { kind: "historyAsked", items: ["h-ambiente"], minCount: 1 }, points: 10, severity: "critica", rationale: "O diagnóstico começa pela suspeita.", sourceIds: ["INT-LITFL-CO"] },
    { id: "s-casa", domain: "historia", description: "Outros expostos", evidence: { kind: "historyAsked", items: ["h-casa"], minCount: 1 }, points: 6, severity: "critica", rationale: "Vários doentes no mesmo local.", sourceIds: ["INT-LITFL-CO"] },
    { id: "s-alarme", domain: "historia", description: "Síncope, dor torácica, gestação", evidence: { kind: "historyAsked", items: ["h-sincope", "h-gestacao"], minCount: 2 }, points: 6, severity: "importante", rationale: "Gravidade e grupos de risco." },
    { id: "s-o2", domain: "tratamento", description: "O2 100% por máscara com reservatório", evidence: { kind: "actionDone", anyOf: ["o2_mascara_reservatorio"], withinSeconds: 600 }, points: 22, severity: "critica", rationale: "Tratamento imediato, sem esperar a COHb.", sourceIds: ["INT-ACEP-CO-2017", "INT-LITFL-CO"] },
    { id: "s-cohb", domain: "exames", description: "COHb por co-oximetria", evidence: { kind: "testOrdered", anyOf: ["cooximetria"], withinSeconds: 1200 }, points: 12, severity: "critica", rationale: "Oxímetro comum e CO-oximetria de pulso não diagnosticam.", sourceIds: ["INT-ACEP-CO-2017"] },
    { id: "s-cardio", domain: "exames", description: "ECG e troponina", evidence: { kind: "testOrdered", anyOf: ["ecg12", "troponina"], withinSeconds: 1800 }, points: 8, severity: "importante", rationale: "Lesão miocárdica prediz pior desfecho.", sourceIds: ["INT-ACEP-CO-2017"] },
    { id: "s-gravidez", domain: "exames", description: "Teste de gravidez", evidence: { kind: "testOrdered", anyOf: ["teste_gravidez_urina", "bhcg"] }, points: 4, severity: "importante", rationale: "Feto mais vulnerável.", sourceIds: ["INT-LITFL-CO"] },
    { id: "s-samu", domain: "priorizacao", description: "Acionou resgate dos demais moradores", evidence: { kind: "actionDone", anyOf: ["acionar_samu"], withinSeconds: 1800 }, points: 10, severity: "critica", rationale: "Crianças ainda expostas." },
    { id: "s-ciatox", domain: "destino", description: "CIATox (hiperbárico?)", evidence: { kind: "actionDone", anyOf: ["contato_ciatox"] }, points: 4, severity: "importante", rationale: "Síncope: discutir hiperbárico.", sourceIds: ["INT-LITFL-CO"] },
    { id: "s-neuro", domain: "tratamento", description: "Falha: piora neurológica sem O2", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-neuro" } }, points: 10, penalty: true, severity: "critica", rationale: "Confiou no oxímetro." },
    { id: "s-alta", domain: "destino", description: "Falha: alta precoce", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-alta" } }, points: 10, penalty: true, severity: "critica", rationale: "Critérios de alta não atendidos." },
    { id: "s-dx", domain: "destino", description: "Intoxicação por CO", evidence: { kind: "diagnosis", accepted: ["intox_co"] }, points: 10, severity: "importante", rationale: "Exposição + clínica + COHb." },
    { id: "s-destino", domain: "destino", description: "Observação/internação (ou regulação para hiperbárico)", evidence: { kind: "disposition", accepted: ["observacao", "internacao_enfermaria", "transferencia_regulada"] }, points: 8, severity: "importante", rationale: "O2 até COHb < 3% e sintomas resolvidos.", sourceIds: ["INT-LITFL-CO"] }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Noite fria, quarto fechado: o que estava aquecendo o ambiente?" },
      { level: 2, text: "A saturação de 99% exclui o problema?" },
      { level: 3, text: "Qual oxigenoterapia, e qual exame confirma?" },
      { level: 4, text: "Sugestão explícita: máscara com reservatório já, co-oximetria, ECG/troponina, beta-hCG, SAMU para a casa, CIATox, observar." }
    ],
    summary: "Intoxicação por CO de braseiro em ambiente fechado com síncope.",
    pathophysiology: "O CO liga-se à hemoglobina com afinidade ~200 vezes maior que o O2, desvia a curva de dissociação para a esquerda e inibe a citocromo-oxidase: hipóxia tecidual com PaO2 normal. O oxímetro de dois comprimentos de onda lê COHb como oxi-hemoglobina. O2 a 100% reduz a meia-vida da COHb de ~320 para ~80 min.",
    keyPoints: [
      "Suspeitar com fonte de combustão em local fechado ou vários doentes juntos.",
      "SpO2 é falsamente normal; dosar COHb (venosa serve).",
      "O2 100% alto fluxo até COHb < 3% e sintomas resolvidos (~6 h).",
      "ECG e troponina na moderada/grave; teste de gravidez.",
      "Hiperbárico: opção controversa; discutir com especialista/CIATox."
    ],
    alternatives: ["Transferência regulada para oxigenoterapia hiperbárica, se disponível e indicada após discussão.", "Intubação com FiO2 100% se rebaixamento grave."],
    oralRubric: [
      { id: "o1", concept: "Oxímetro falso", synonyms: ["oxímetro", "saturação", "falsamente", "não distingue"], weight: 3 },
      { id: "o2", concept: "O2 100%", synonyms: ["máscara com reservatório", "100%", "alto fluxo"], weight: 3 },
      { id: "o3", concept: "COHb", synonyms: ["carboxi", "co-oximetria", "cohb"], weight: 2 },
      { id: "o4", concept: "Outros expostos", synonyms: ["família", "filhos", "samu", "casa"], weight: 2 }
    ],
    simplifications: ["Oxigenoterapia hiperbárica não disponível no perfil (regulação).", "Cianeto não considerado (sem incêndio)."]
  },
  references: ["INT-ACEP-CO-2017", "INT-LITFL-CO", "BR-CIATOX", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Exposição, O2 100%, co-oximetria, outros expostos, ECG/troponina, beta-hCG, CIATox, observação", commands: [ask(10, "h-cefaleia"), ask(20, "h-ambiente"), act(30, "o2_mascara_reservatorio"), ask(40, "h-casa"), act(60, "acionar_samu"), act(200, "monitorizar"), test(220, "cooximetria"), ask(230, "h-sincope"), ask(240, "h-gestacao"), test(250, "ecg12"), test(260, "troponina"), test(270, "teste_gravidez_urina"), act(400, "contato_ciatox"), dx(1500, "intox_co"), dest(6000, "observacao")], runUntilSeconds: 6600, expect: [{ condition: { ruleFired: "r-o2-co" }, description: "O2 alto fluxo" }, { condition: { ruleFired: "r-familia" }, description: "família resgatada" }, { condition: { path: "vars.cohb", op: "lt", value: 14 }, description: "COHb caindo" }, { condition: { not: { ruleFired: "r-neuro" } }, description: "sem piora neurológica" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-neuro" }, description: "piora neurológica" }, { condition: { path: "vars.cohb", op: "gt", value: 18 }, description: "COHb persistente" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Trata como enxaqueca: dipirona e alta (SpO2 99%)", commands: [ask(10, "h-cefaleia"), act(40, "acesso_venoso"), rx(150, "dipirona", "amp1g", 1000, "mg", "IV"), dest(1200, "alta_orientada")], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-alta" }, description: "alta precoce" }, { condition: { ruleFired: "r-neuro" }, description: "piora" }] },
    { id: "t-atraso", kind: "delay", description: "Cateter nasal, depois máscara após piora; regulação para hiperbárico", commands: [act(60, "o2_cateter"), test(300, "cooximetria"), act(1700, "o2_mascara_reservatorio"), test(1800, "ecg12"), act(1900, "contato_ciatox"), act(2000, "acionar_samu"), dest(5000, "transferencia_regulada")], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-cateter" }, description: "FiO2 insuficiente" }, { condition: { ruleFired: "r-neuro" }, description: "piora" }, { condition: { ruleFired: "r-o2-co" }, description: "O2 tardio" }] },
    { id: "t-alternativa", kind: "alternative", description: "O2 100% ao suspeitar pela queixa; beta-hCG sérico; internação", commands: [act(10, "o2_mascara_reservatorio"), ask(20, "h-ambiente"), ask(30, "h-casa"), act(50, "acionar_samu"), test(100, "cooximetria"), test(110, "troponina"), test(120, "bhcg"), dest(5000, "internacao_enfermaria")], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-o2-co" }, description: "O2" }, { condition: { not: { ruleFired: "r-neuro" } }, description: "sem piora" }] }
  ]
};
