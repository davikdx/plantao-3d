import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, obs, outcome, rx, staff, test, trend } from "./helpers";

const SANGUE = { drugGiven: "concentrado_hemacias" };
const CRISTALOIDE = { any: [{ drugGiven: "sf09", minTotal: { value: 500, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 500, unit: "mL" as const } }] };
const CRISTALOIDE_EXCESSO = { any: [{ drugGiven: "sf09", minTotal: { value: 2500, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 2500, unit: "mL" as const } }] };

export const C073: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C073",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Mulher com atraso menstrual, dor forte na barriga e desmaio",
  teachingTitle: "Gestação ectópica rota com choque hemorrágico — beta-hCG, ultrassom e cirurgia",
  group: "Ginecologia e obstetrícia",
  specialties: ["Ginecologia", "Obstetrícia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Pensar em gestação em toda mulher em idade fértil com dor abdominal ou sangramento",
    "Reconhecer choque hemorrágico com abdome agudo",
    "Usar teste de gravidez e ultrassom à beira-leito sem atrasar a cirurgia",
    "Indicar tratamento cirúrgico na paciente instável",
    "Lembrar do fator Rh e da imunoglobulina anti-D"
  ],
  keywords: ["dor na barriga", "atraso menstrual", "desmaio", "sangramento", "gravidez"],
  patient: {
    name: "Jéssica Fernandes",
    ageYears: 27,
    sex: "feminino",
    weightKg: 60,
    heightCm: 162,
    visual: { ageGroup: "adulto", sex: "feminino", skinTone: 3, hairStyle: "cacheado", hairColor: "castanho", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Mulher de 27 anos trazida pelo companheiro: há 2 horas teve dor súbita no baixo ventre à direita e desmaiou no banheiro. Está pálida e sudoreica.",
  communication: "normal",
  informants: [{ id: "companheiro", name: "Diego", role: "Companheiro" }],
  history: [
    h("h-queixa", "queixa", "O que você está sentindo?", "Uma dor muito forte no pé da barriga, do lado direito, que agora pega a barriga toda e o ombro.", { keywords: ["sentindo", "dor"] }),
    h("h-dum", "antecedentes", "Quando foi a última menstruação? Pode estar grávida?", "Faz umas 7 semanas… estou atrasada, mas não fiz teste.", { keywords: ["menstruação", "dum", "grávida", "atraso"] }),
    h("h-sangramento", "fatores_associados", "Teve sangramento vaginal?", "Um pouco, escuro, desde ontem.", { keywords: ["sangramento", "sangue"] }),
    h("h-sincope", "fatores_associados", "Você desmaiou?", "Fiquei tonta no banheiro e apaguei. O Diego me achou no chão.", { keywords: ["desmaio", "desmaiou", "tonta"], extra: [{ source: "companheiro", text: "Ela ficou desacordada uns segundos e muito branca." }] }),
    h("h-fatores", "antecedentes", "Já teve infecção nas trompas, cirurgia na barriga, DIU, gravidez fora do útero?", "Tive uma infecção ginecológica há uns anos, tratei com injeção. Nunca operei.", { keywords: ["trompas", "infecção", "diu", "cirurgia", "ectópica"] }),
    h("h-tipagem", "antecedentes", "Sabe seu tipo sanguíneo?", "Acho que é O negativo.", { keywords: ["tipo sanguíneo", "fator rh", "sangue"] }),
    h("h-alergias", "alergias", "Tem alergia?", "Não.")
  ],
  initial: {
    vars: { hr: 128, sbp: 86, dbp: 52, rr: 24, spo2: 97, temp: 36.1, gcs: 15, pain: 8, glucose: 96, perfusion: 0.4, effort: 0.4, hb: 8.9, ht: 27, plt: 236000, inr: 1.1, lactate: 3.8, bhcg: 4200, bleeding: 60, urine: 15 },
    flags: { rhythm: "taquicardia_sinusal", pallor: true, sweating: true, posture: "antalgica", painVisual: "intensa", speech: "frases", consciousness: "alerta", bleedingVisible: true },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Pálida +++, sudoreica, ansiosa.", { better: [{ when: { ruleFired: "r-choque-grave" }, text: "Sonolenta, extremidades frias." }] }),
    ex("e-abdome", "abdome_qid", "palpacao", "Abdome distendido, doloroso difusamente, mais em fossa ilíaca direita; descompressão brusca dolorosa (irritação peritoneal).", { label: "Abdome" }),
    ex("e-pelve", "pelve", "especial", "Especular: pequena quantidade de sangue escuro saindo pelo orifício cervical, colo fechado. Toque: dor intensa à mobilização do colo e abaulamento de fundo de saco posterior.", { label: "Exame ginecológico" }),
    ex("e-pulmao", "torax_posterior", "ausculta", "Murmúrio presente bilateralmente.", { sound: "murmurio_normal" })
  ],
  testResults: [
    { testId: "teste_gravidez_urina", variants: [{ text: "Positivo." }] },
    { testId: "efast", variants: [{ text: "Grande quantidade de líquido livre no espaço hepatorrenal e na pelve. (Laudo educativo.)" }] },
    { testId: "usg_obstetrica", variants: [{ text: "Útero vazio, endométrio espessado, sem saco gestacional intrauterino. Massa anexial direita heterogênea e grande quantidade de líquido livre com ecos (hemoperitônio). (Laudo educativo.)" }] }
  ],
  highlightedActions: ["acesso_venoso", "monitorizar", "o2_cateter", "elevar_mmii"],
  rules: [
    { id: "r-sangramento", description: "Hemoperitônio ativo: piora progressiva sem controle cirúrgico", priority: 10, when: { always: true }, repeat: "once", effects: [trend("sbp", 58, 2000, "hem", 10), trend("dbp", 34, 2000, "hem", 10), trend("hr", 148, 1500, "hem", 10), trend("hb", 6.2, 2400, "hem", 10), trend("lactate", 7, 2400, "hem", 10), trend("perfusion", 0.2, 1800, "hem", 10)] },
    { id: "r-cristaloide", description: "Cristaloide: resposta transitória", priority: 25, when: CRISTALOIDE, repeat: "once", effects: [trend("sbp", 92, 300, "cri", 25, 1200), trend("hr", 120, 300, "cri", 25, 1200)] },
    { id: "r-transfusao", description: "Hemácias mantêm perfusão até a cirurgia", priority: 50, when: SANGUE, repeat: "once", effects: [trend("sbp", 96, 600, "tx", 50), trend("dbp", 58, 600, "tx", 50), trend("hr", 110, 600, "tx", 50), trend("perfusion", 0.55, 600, "tx", 50), trend("hb", 8.4, 900, "tx", 50), outcome("estabilizacao_parcial")] },
    { id: "r-diluicao", description: "Cristaloide em grande volume: coagulopatia dilucional", priority: 60, when: CRISTALOIDE_EXCESSO, repeat: "once", effects: [trend("inr", 1.8, 900, "dil", 60), trend("hb", 5.6, 900, "dil", 60), obs("Volume excessivo de cristaloide: diluição de fatores e da hemoglobina."), outcome("complicacao")] },
    { id: "r-choque-grave", description: "Sem hemocomponente em 25 min: choque grave", priority: 30, when: { all: [{ time: "gte", seconds: 1500 }, { not: SANGUE }] }, repeat: "once", effects: [trend("sbp", 60, 300, "grave", 30), flag("consciousness", "voz"), staff("enfermagem", "Ela está ficando sonolenta e a pressão está 60!"), outcome("piora")] },
    { id: "r-pcr", description: "Sem hemocomponente em 45 min: PCR", priority: 100, when: { all: [{ time: "gte", seconds: 2700 }, { not: SANGUE }] }, repeat: "once", effects: [flag("pulse", false), { type: "setValue", var: "sbp", value: 0 }, { type: "setValue", var: "dbp", value: 0 }, flag("consciousness", "irresponsivo"), staff("enfermagem", "Parou! Sem pulso."), outcome("parada", true)] },
    { id: "r-espera-bhcg", description: "Aguardar beta-hCG quantitativo na paciente instável atrasa a decisão", when: { all: [{ testCollected: "bhcg" }, { not: { testCollected: "teste_gravidez_urina" } }, { not: { testCollected: "efast" } }, { not: { testCollected: "usg_obstetrica" } }] }, repeat: "once", effects: [obs("Beta-hCG quantitativo leva cerca de 1 hora; em paciente instável, teste rápido de urina e ultrassom à beira-leito são suficientes para decidir.")] },
    { id: "r-cirurgia", description: "Equipe cirúrgica avisada", when: { actionCompleted: "chamar_ajuda" }, repeat: "once", effects: [staff("supervisor", "Ginecologista de plantão e centro cirúrgico avisados; sala disponível em 15 minutos.")] }
  ],
  diagnosis: { primary: "gestacao_ectopica_rota", accepted: ["gestacao_ectopica_rota"], differentials: ["abortamento", "torcao_anexial", "apendicite", "dip", "choque_hipovolemico"] },
  acceptedDestinations: ["centro_cirurgico"],
  outcomeNotes: "Ectópica rota com choque: teste de gravidez positivo + útero vazio + hemoperitônio = cirurgia imediata, com reanimação hemostática (hemácias, cristaloide limitado). Metotrexato e conduta expectante não se aplicam à paciente instável. Rh negativo: imunoglobulina anti-D.",
  scoring: [
    { id: "s-dum", domain: "historia", description: "Perguntou DUM/possibilidade de gestação", evidence: { kind: "historyAsked", items: ["h-dum"], minCount: 1 }, points: 8, severity: "critica", rationale: "Toda mulher em idade fértil com dor abdominal: considerar gestação.", sourceIds: ["BR-GESTACAO"] },
    { id: "s-fatores", domain: "historia", description: "Fatores de risco e tipagem", evidence: { kind: "historyAsked", items: ["h-fatores", "h-tipagem", "h-sangramento"], minCount: 2 }, points: 4, severity: "importante", rationale: "DIP prévia é fator de risco; Rh define anti-D." },
    { id: "s-exame", domain: "historia", description: "Exame abdominal e ginecológico", evidence: { kind: "examDone", regions: ["abdome_qid", "pelve"], minCount: 2 }, points: 6, severity: "importante", rationale: "Irritação peritoneal e dor à mobilização do colo." },
    { id: "s-acesso", domain: "priorizacao", description: "Dois acessos calibrosos em até 5 min", evidence: { kind: "actionDone", anyOf: ["acesso_venoso", "acesso_io"], withinSeconds: 300 }, points: 7, severity: "critica", rationale: "Choque hemorrágico." },
    { id: "s-ajuda", domain: "priorizacao", description: "Acionou ginecologia/centro cirúrgico precocemente", evidence: { kind: "actionDone", anyOf: ["chamar_ajuda"], withinSeconds: 900 }, points: 6, severity: "importante", rationale: "O tratamento definitivo é cirúrgico." },
    { id: "s-teste", domain: "exames", description: "Teste rápido de gravidez", evidence: { kind: "testOrdered", anyOf: ["teste_gravidez_urina", "bhcg"], withinSeconds: 600 }, points: 8, severity: "critica", rationale: "Confirma gestação em minutos.", sourceIds: ["BR-GESTACAO"] },
    { id: "s-usg", domain: "exames", description: "Ultrassom à beira-leito (eFAST/transvaginal)", evidence: { kind: "testOrdered", anyOf: ["efast", "usg_obstetrica"], withinSeconds: 900 }, points: 7, severity: "importante", rationale: "Hemoperitônio com útero vazio." },
    { id: "s-sangue", domain: "tratamento", description: "Hemácias em até 15 min", evidence: { kind: "drugGiven", anyOf: ["concentrado_hemacias"], withinSeconds: 900 }, points: 12, severity: "critica", rationale: "Choque hemorrágico classe III.", sourceIds: ["BR-GESTACAO"] },
    { id: "s-diluicao", domain: "tratamento", description: "Falha: cristaloide em excesso", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-diluicao" } }, points: 8, penalty: true, severity: "importante", rationale: "Diluição e coagulopatia." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou PA/perfusão após transfusão", evidence: { kind: "reassessAfter", after: ["concentrado_hemacias"], reassess: ["medir_pa", "hemograma", "gaso_venosa"], withinSeconds: 1200 }, points: 10, severity: "importante", rationale: "Resposta transitória: cirurgia sem demora." },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de gestação ectópica rota", evidence: { kind: "diagnosis", accepted: ["gestacao_ectopica_rota"] }, points: 8, severity: "critica", rationale: "Teste positivo, útero vazio, hemoperitônio." },
    { id: "s-destino", domain: "destino", description: "Centro cirúrgico", evidence: { kind: "disposition", accepted: ["centro_cirurgico"] }, points: 8, severity: "critica", rationale: "Paciente instável: cirurgia imediata.", sourceIds: ["BR-GESTACAO"] }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Ela pode estar grávida?" },
      { level: 2, text: "Choque + abdome agudo + atraso menstrual…" },
      { level: 3, text: "Na instável, não espere o beta-hCG quantitativo." },
      { level: 4, text: "Sugestão explícita: 2 acessos, teste rápido de gravidez, eFAST/USG, hemácias, ginecologia e centro cirúrgico; anti-D se Rh negativo." }
    ],
    summary: "Mulher de 27 anos com atraso menstrual de 7 semanas, DIP prévia, dor súbita em fossa ilíaca direita, síncope, choque e hemoperitônio com útero vazio.",
    pathophysiology: "Lesão tubária (ex.: DIP) dificulta o transporte do embrião, que se implanta na tuba. O crescimento trofoblástico erode a parede tubária e vasos, causando ruptura e hemoperitônio. A irritação diafragmática pelo sangue causa dor referida no ombro.",
    keyPoints: [
      "Mulher em idade fértil com dor abdominal/sangramento: teste de gravidez.",
      "Instável com hemoperitônio: cirurgia imediata.",
      "Teste rápido + ultrassom à beira-leito bastam para decidir na instável.",
      "Reanimação hemostática; limitar cristaloide.",
      "Rh negativo: imunoglobulina anti-D."
    ],
    alternatives: ["Metotrexato ou conduta expectante apenas em pacientes estáveis, sem ruptura e com critérios (não se aplica)."],
    oralRubric: [
      { id: "o1", concept: "Teste de gravidez", synonyms: ["beta", "hcg", "teste de gravidez", "gravidez"], weight: 2 },
      { id: "o2", concept: "Ultrassom com hemoperitônio", synonyms: ["ultrassom", "usg", "fast", "líquido livre"], weight: 2 },
      { id: "o3", concept: "Reanimação com sangue", synonyms: ["hemácias", "transfusão", "sangue"], weight: 2 },
      { id: "o4", concept: "Cirurgia", synonyms: ["cirurgia", "laparotomia", "laparoscopia", "salpingectomia"], weight: 3 },
      { id: "o5", concept: "Anti-D", synonyms: ["anti-d", "rh", "imunoglobulina"], weight: 1 }
    ],
    simplifications: ["Imunoglobulina anti-D não está no catálogo desta versão.", "Respostas hemodinâmicas são determinísticas; PCR aos 45 min é decisão didática."]
  },
  references: ["BR-GESTACAO", "BR-SAMU-SAV", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: false, allowWeightPercent: 15, allowVisualVariation: true, forbidden: ["sexo"] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "DUM, acessos, teste rápido, eFAST, hemácias, ginecologia e centro cirúrgico", commands: [ask(10, "h-dum"), act(20, "monitorizar"), act(30, "acesso_venoso"), act(130, "acesso_venoso"), test(140, "teste_gravidez_urina"), test(150, "efast"), test(160, "hemograma"), act(170, "chamar_ajuda"), rx(250, "ringer_lactato", "bolsa500", 500, "mL", "IV", "infusao_volume", { durationMinutes: 15 }), rx(400, "concentrado_hemacias", "unidade", 300, "mL", "IV", "infusao_volume", { durationMinutes: 15 }), act(1200, "medir_pa"), dx(1300, "gestacao_ectopica_rota"), dest(1300, "centro_cirurgico")], runUntilSeconds: 1600, expect: [{ condition: { ruleFired: "r-transfusao" }, description: "perfusão mantida" }, { condition: { not: { ruleFired: "r-choque-grave" } }, description: "sem choque grave" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 2800, expect: [{ condition: { ruleFired: "r-choque-grave" }, description: "choque grave" }, { condition: { ruleFired: "r-pcr" }, description: "PCR" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Aguarda beta-hCG quantitativo e repõe só cristaloide", commands: [act(30, "acesso_venoso"), act(130, "acesso_venoso"), test(150, "bhcg"), rx(200, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 10 }), rx(220, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 10 }), rx(900, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 10 })], runUntilSeconds: 2000, expect: [{ condition: { ruleFired: "r-espera-bhcg" }, description: "atraso diagnóstico" }, { condition: { ruleFired: "r-diluicao" }, description: "diluição" }, { condition: { ruleFired: "r-choque-grave" }, description: "choque grave" }] },
    { id: "t-atraso", kind: "delay", description: "Hemácias só aos 30 min", commands: [act(30, "acesso_venoso"), act(130, "acesso_venoso"), test(150, "teste_gravidez_urina"), rx(1800, "concentrado_hemacias", "unidade", 300, "mL", "IV", "infusao_volume", { durationMinutes: 15 })], runUntilSeconds: 3200, expect: [{ condition: { ruleFired: "r-choque-grave" }, description: "piora" }, { condition: { not: { ruleFired: "r-pcr" } }, description: "PCR evitada" }] },
    { id: "t-alternativa", kind: "alternative", description: "USG transvaginal em vez de eFAST", commands: [act(30, "acesso_venoso"), act(130, "acesso_venoso"), test(140, "teste_gravidez_urina"), rx(300, "concentrado_hemacias", "unidade", 300, "mL", "IV", "infusao_volume", { durationMinutes: 15 }), test(320, "usg_obstetrica"), act(330, "chamar_ajuda"), dest(1300, "centro_cirurgico")], runUntilSeconds: 1600, expect: [{ condition: { ruleFired: "r-transfusao" }, description: "perfusão" }] }
  ]
};
