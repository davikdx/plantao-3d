import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, hi, obs, outcome, oxygenResponse, rx, staff, trend } from "./helpers";

export const C081: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C081",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Bebê cansado que parou de mamar direito",
  teachingTitle: "Bronquiolite viral aguda com sinais de gravidade em lactente",
  group: "Pediatria e neonatologia",
  specialties: ["Pediatria", "Emergência"],
  environment: "pediatria",
  resourceProfile: "upa-porte-ii",
  difficulty: 2,
  level: "internato",
  objectives: [
    "Reconhecer sinais de gravidade em lactente com bronquiolite",
    "Ofertar oxigênio e desobstrução nasal como medidas principais",
    "Evitar intervenções sem benefício (broncodilatador, corticoide, radiografia de rotina)",
    "Avaliar hidratação/alimentação e risco de apneia",
    "Definir internação via regulação"
  ],
  keywords: ["bebê", "lactente", "cansaço", "chiado", "mamar", "tosse"],
  patient: {
    name: "Helena (lactente)",
    ageYears: 0.25,
    ageMonths: 3,
    sex: "feminino",
    weightKg: 5.4,
    heightCm: 59,
    visual: { ageGroup: "lactente", sex: "feminino", skinTone: 4, hairStyle: "curto", hairColor: "preto", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "UPA 24h, sala pediátrica. Lactente de 3 meses trazida pela mãe por tosse e coriza há 3 dias; hoje está \"cansada\" e mamando pouco.",
  communication: "incapaz",
  informants: [{ id: "mae", name: "Jaqueline", role: "Mãe" }],
  history: [
    hi("h-queixa", "queixa", "O que a senhora notou na bebê?", [{ source: "mae", text: "Começou com nariz escorrendo e tosse há 3 dias. Hoje ela está respirando muito rápido, com a barriga afundando, e quase não mama." }], ["notou", "aconteceu", "sentindo"]),
    hi("h-alimentacao", "alimentacao_eliminacoes", "Quanto ela está mamando? E as fraldas?", [{ source: "mae", text: "Mama um pouquinho e para, cansa. Hoje só molhou duas fraldas." }], ["mama", "mamando", "fralda", "xixi"]),
    hi("h-apneia", "sinais_alarme", "Ela ficou roxa ou parou de respirar em algum momento?", [{ source: "mae", text: "Hoje de manhã ela ficou uns segundos parada, meio arroxeada na boca, e depois voltou." }], ["roxa", "parou de respirar", "apneia"]),
    hi("h-nascimento", "antecedentes", "Ela nasceu de quantas semanas? Teve algum problema?", [{ source: "mae", text: "Nasceu com 36 semanas, ficou 2 dias a mais na maternidade por icterícia. Não tem problema de coração que eu saiba." }], ["nasceu", "semanas", "prematura"]),
    hi("h-febre", "fatores_associados", "Teve febre?", [{ source: "mae", text: "Teve 37,8 ontem à noite." }], ["febre"]),
    hi("h-contato", "exposicao", "Alguém em casa está gripado?", [{ source: "mae", text: "O irmão de 4 anos está resfriado e vai à creche." }], ["gripado", "casa", "creche"]),
    hi("h-vacina", "vacinacao", "As vacinas estão em dia?", [{ source: "mae", text: "Está tudo em dia, tomou as de 2 meses." }], ["vacina"]),
    hi("h-tabaco", "social", "Alguém fuma em casa?", [{ source: "mae", text: "O pai fuma, mas fora de casa." }], ["fuma", "cigarro"])
  ],
  initial: {
    vars: { hr: 172, sbp: 84, dbp: 50, rr: 68, spo2: 88, temp: 37.6, gcs: 15, pain: 0, glucose: 88, perfusion: 0.8, effort: 2.3, urine: 8, na: 140, k: 4.6, ph: 7.33, pco2: 48, hco3: 24, lactate: 1.8 },
    flags: { rhythm: "taquicardia_sinusal", wheeze: true, cough: true, posture: "supino", speech: "nenhuma", communication: "incapaz", agitation: false },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Lactente irritada, gemente, com batimento de asa de nariz; mucosas pouco úmidas; fontanela anterior levemente deprimida.", { better: [{ when: { ruleFired: "r-melhora" }, text: "Mais tranquila, sem gemência, respirando com menos esforço." }] }),
    ex("e-nariz", "boca", "inspecao", "Secreção nasal hialina abundante obstruindo as narinas.", { label: "Nariz e orofaringe", better: [{ when: { actionCompleted: "aspirar_via_aerea" }, text: "Narinas desobstruídas após aspiração." }] }),
    ex("e-torax-insp", "torax_anterior", "inspecao", "Tiragem subcostal e intercostal, retração de fúrcula.", { better: [{ when: { ruleFired: "r-melhora" }, text: "Tiragem subcostal leve." }] }),
    ex("e-ausc", "torax_anterior", "ausculta", "Estertores crepitantes finos difusos e sibilos expiratórios bilaterais.", { sound: "estertores" }),
    ex("e-ausc-post", "torax_posterior", "ausculta", "Crepitações finas difusas.", { sound: "estertores" }),
    ex("e-coracao", "coracao", "ausculta", "Bulhas taquicárdicas, rítmicas, sem sopro.", { sound: "bulhas_normais" }),
    ex("e-perfusao", "membro_inferior_d", "palpacao", "Pulsos cheios; tempo de enchimento capilar 2 s.", {})
  ],
  testResults: [
    { testId: "rx_torax", variants: [{ text: "Laudo educativo: hiperinsuflação e espessamento peribrônquico, atelectasia laminar em lobo superior direito. Radiografia não é recomendada de rotina na bronquiolite típica." }] },
    { testId: "teste_rapido_dengue", variants: [{ text: "Exame sem indicação neste quadro." }] }
  ],
  highlightedActions: ["oximetria_portatil", "aspirar_via_aerea", "o2_cateter", "monitorizar", "acionar_samu"],
  rules: [
    oxygenResponse(94, 120),
    { id: "r-aspiracao", description: "Aspiração nasal reduz trabalho respiratório transitoriamente", priority: 40, when: { actionCompleted: "aspirar_via_aerea" }, repeat: { everySeconds: 600 }, effects: [trend("effort", 1.7, 120, "asp", 35, 900), trend("rr", 58, 120, "asp", 35, 900)] },
    { id: "r-melhora", description: "O₂ + desobstrução: conforto respiratório melhora", priority: 45, when: { all: [{ any: [{ deviceActive: "cateter_nasal" }, { deviceActive: "mascara_reservatorio" }] }, { actionCompleted: "aspirar_via_aerea" }] }, repeat: "once", effects: [trend("effort", 1.4, 600, "melhora", 45), trend("rr", 54, 600, "melhora", 45), trend("hr", 150, 600, "melhora", 45), outcome("estabilizacao_parcial")] },
    { id: "r-apneia", description: "Sem oxigênio, episódio de apneia com dessaturação", priority: 80, when: { all: [{ time: "gte", seconds: 900 }, { not: { any: [{ deviceActive: "cateter_nasal" }, { deviceActive: "mascara_reservatorio" }] } }] }, repeat: "once", effects: [{ type: "setValue", var: "rr", value: 0 }, trend("spo2", 72, 20, "apneia", 90, 40), flag("cyanosis", true), staff("acompanhante", "Ela parou de respirar! Está roxinha!"), { type: "scheduleEffects", afterSeconds: 25, key: "apneia-fim", effects: [{ type: "setValue", var: "rr", value: 64 }, { type: "setFlag", flag: "cyanosis", value: false }] }, outcome("piora")] },
    { id: "r-cansaco", description: "Sem suporte, a lactente fadiga (CO₂ sobe)", priority: 10, when: { all: [{ time: "gte", seconds: 1800 }, { not: { any: [{ deviceActive: "cateter_nasal" }, { deviceActive: "mascara_reservatorio" }] } }] }, repeat: "once", effects: [trend("pco2", 62, 900, "doenca", 10), trend("ph", 7.22, 900, "doenca", 10), trend("spo2", 82, 600, "doenca", 10), trend("effort", 2.8, 600, "doenca", 10), outcome("piora")] },
    { id: "r-salbutamol", description: "Salbutamol: sem melhora consistente e com taquicardia", when: { drugGiven: "salbutamol" }, repeat: "once", effects: [trend("hr", 190, 120, "sal", 50, 1200), obs("Após o broncodilatador, a frequência cardíaca subiu e o esforço não mudou.")] },
    { id: "r-corticoide", description: "Corticoide sem benefício na bronquiolite", when: { any: [{ drugGiven: "prednisolona" }, { drugGiven: "metilprednisolona" }, { drugGiven: "hidrocortisona" }] }, repeat: "once", effects: [obs("Nenhuma mudança clínica após o corticoide.")] },
    { id: "r-volume", description: "Expansão em bolus não indicada sem sinais de choque: risco de sobrecarga", when: { drugGiven: "sf09", minTotal: { value: 100, unit: "mL" } }, repeat: "once", effects: [trend("effort", 2.6, 600, "sobrecarga", 60, 1800), obs("Aumentaram as crepitações após o volume em bolus.")] },
    { id: "r-regulacao", description: "Regulação pediátrica", when: { actionCompleted: "acionar_samu" }, repeat: "once", effects: [staff("regulacao", "Regulação: leito de enfermaria pediátrica disponível no hospital de referência; transporte com oxigênio pela USA.")] }
  ],
  diagnosis: { primary: "bronquiolite", accepted: ["bronquiolite"], differentials: ["pneumonia", "coqueluche", "asma_pediatrica", "sepse_neonatal", "aspiracao_corpo_estranho"] },
  acceptedDestinations: ["transferencia_regulada"],
  outcomeNotes: "O₂ e desobstrução nasal estabilizam; a internação é necessária (hipoxemia, recusa alimentar, apneia relatada). Sem O₂: apneia aos 15 min e fadiga aos 30 min. Broncodilatador e corticoide não trazem benefício; bolus de volume sem choque piora o esforço.",
  scoring: [
    { id: "s-hist-gravidade", domain: "historia", description: "Pesquisou apneia, alimentação/diurese e prematuridade", evidence: { kind: "historyAsked", items: ["h-apneia", "h-alimentacao", "h-nascimento"], minCount: 2 }, points: 12, severity: "importante", rationale: "Apneia, recusa alimentar, idade < 3 meses e prematuridade indicam gravidade." },
    { id: "s-exame", domain: "historia", description: "Avaliou esforço respiratório, ausculta e hidratação", evidence: { kind: "examDone", regions: ["geral", "torax_anterior", "torax_posterior", "boca"], minCount: 2 }, points: 8, severity: "importante", rationale: "Tiragem, gemência e batimento de asa de nariz." },
    { id: "s-oximetria", domain: "priorizacao", description: "Oximetria/monitorização precoce", evidence: { kind: "actionDone", anyOf: ["oximetria_portatil", "monitorizar"], withinSeconds: 300 }, points: 6, severity: "importante", rationale: "SpO₂ define necessidade de O₂." },
    { id: "s-o2", domain: "priorizacao", description: "Oxigênio para SpO₂ < 90–92%", evidence: { kind: "actionDone", anyOf: ["o2_cateter", "o2_mascara_reservatorio"], withinSeconds: 600 }, points: 14, severity: "critica", rationale: "Hipoxemia é a principal indicação de internação e tratamento." },
    { id: "s-aspiracao", domain: "tratamento", description: "Desobstrução/aspiração nasal", evidence: { kind: "actionDone", anyOf: ["aspirar_via_aerea"] }, points: 10, severity: "importante", rationale: "Lactentes respiram predominantemente pelo nariz." },
    { id: "s-sem-sal", domain: "tratamento", description: "Uso de broncodilatador sem benefício documentado", evidence: { kind: "avoidDrug", anyOf: ["salbutamol"] }, points: 5, penalty: true, severity: "menor", rationale: "Diretrizes não recomendam broncodilatador de rotina na bronquiolite." },
    { id: "s-sem-cort", domain: "tratamento", description: "Uso de corticoide sistêmico sem indicação", evidence: { kind: "avoidDrug", anyOf: ["prednisolona", "metilprednisolona", "hidrocortisona"] }, points: 5, penalty: true, severity: "menor", rationale: "Corticoide não altera a evolução da bronquiolite." },
    { id: "s-volume", domain: "tratamento", description: "Bolus de volume sem choque", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-volume" } }, points: 5, penalty: true, severity: "importante", rationale: "Hidratação deve ser por via enteral (sonda) ou de manutenção, não bolus." },
    { id: "s-exames", domain: "exames", description: "Sem exames de rotina desnecessários", evidence: { kind: "testsNotExcessive", maxUnjustified: 0, justified: ["gaso_venosa", "gaso_arterial"] }, points: 15, severity: "importante", rationale: "Radiografia e laboratório não são rotina na bronquiolite típica; gasometria só se suspeita de fadiga." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou SpO₂/esforço após O₂ e aspiração", evidence: { kind: "reassessAfter", after: ["o2_cateter", "aspirar_via_aerea", "o2_mascara_reservatorio"], reassess: ["monitorizacao_continua", "oximetria_portatil", "geral", "torax_anterior"], withinSeconds: 1200 }, points: 10, severity: "importante", rationale: "Resposta orienta destino e necessidade de suporte avançado." },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de bronquiolite", evidence: { kind: "diagnosis", accepted: ["bronquiolite"] }, points: 4, severity: "importante", rationale: "Primeiro episódio de sibilância em lactente com pródromo viral." },
    { id: "s-destino", domain: "destino", description: "Internação via regulação", evidence: { kind: "disposition", accepted: ["transferencia_regulada"] }, points: 6, severity: "importante", rationale: "Hipoxemia, recusa alimentar e apneia indicam internação." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Quais sinais dizem que este lactente é grave?" },
      { level: 2, text: "Qual parâmetro objetivo define a necessidade de oxigênio?" },
      { level: 3, text: "Inflamação e muco nas vias aéreas pequenas; o nariz entupido pesa muito no lactente." },
      { level: 4, text: "Sugestão explícita: oximetria, O₂ por cânula, aspiração nasal, avaliar hidratação e regular internação; evite broncodilatador, corticoide e radiografia de rotina." }
    ],
    summary: "Lactente de 3 meses, ex-prematura de 36 semanas, com bronquiolite, SpO₂ 88%, tiragem, recusa alimentar e apneia relatada.",
    pathophysiology: "Infecção viral (frequentemente VSR) das vias aéreas inferiores causa necrose epitelial, edema e tampões de muco nos bronquíolos, levando a aprisionamento aéreo, atelectasias e hipoxemia. Lactentes jovens e prematuros têm maior risco de apneia e fadiga.",
    keyPoints: [
      "Tratamento é de suporte: oxigênio, desobstrução nasal, hidratação/nutrição.",
      "Sinais de gravidade: SpO₂ baixa, tiragem importante, gemência, apneia, recusa alimentar, idade < 3 meses.",
      "Broncodilatador, corticoide e radiografia não são rotina.",
      "Internar e regular quando houver hipoxemia ou outros sinais de gravidade."
    ],
    alternatives: ["Máscara com reservatório se cânula insuficiente.", "Suporte alimentar por sonda (não modelado nesta versão)."],
    oralRubric: [
      { id: "o1", concept: "Sinais de gravidade", synonyms: ["gravidade", "apneia", "tiragem", "recusa"], weight: 2 },
      { id: "o2", concept: "Oxigênio", synonyms: ["oxigênio", "o2", "saturação"], weight: 3 },
      { id: "o3", concept: "Aspiração nasal", synonyms: ["aspiração", "desobstrução", "nasal"], weight: 2 },
      { id: "o4", concept: "Evitar terapias sem benefício", synonyms: ["sem broncodilatador", "não usar corticoide", "não recomendado", "sem benefício"], weight: 1 },
      { id: "o5", concept: "Internação", synonyms: ["internação", "internar", "regulação"], weight: 1 }
    ],
    simplifications: ["Apneia aos 15 min sem O₂ é decisão didática.", "Hidratação de manutenção/sonda não está modelada; o caso pune apenas o bolus sem indicação."]
  },
  references: ["INT-AAP-BRONQ", "BR-SAMU-SAV", "BR-UPA", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 0, allowSexSwap: true, allowWeightPercent: 10, allowVisualVariation: true, forbidden: ["idade"] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Oximetria, O₂, aspiração e regulação", commands: [act(5, "oximetria_portatil"), ask(30, "h-apneia"), act(60, "o2_cateter", { fluxo: 1 }), act(80, "aspirar_via_aerea"), act(900, "monitorizar"), act(1000, "acionar_samu"), dx(1300, "bronquiolite"), dest(1300, "transferencia_regulada")], runUntilSeconds: 2400, expect: [{ condition: { ruleFired: "r-melhora" }, description: "melhora" }, { condition: { not: { ruleFired: "r-apneia" } }, description: "sem apneia" }, { condition: { path: "vars.spo2", op: "gte", value: 92 }, description: "SpO₂ ≥ 92" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 2000, expect: [{ condition: { ruleFired: "r-apneia" }, description: "apneia" }, { condition: { ruleFired: "r-cansaco" }, description: "fadiga" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Salbutamol e prednisolona sem O₂", commands: [rx(60, "salbutamol", "spray100", 200, "mcg", "inalatoria"), rx(120, "prednisolona", "sol3", 5, "mg", "VO")], runUntilSeconds: 1000, expect: [{ condition: { ruleFired: "r-salbutamol" }, description: "taquicardia sem melhora" }, { condition: { ruleFired: "r-apneia" }, description: "apneia sem O₂" }] },
    { id: "t-atraso", kind: "delay", description: "O₂ só após a apneia", commands: [act(1000, "o2_cateter", { fluxo: 1 }), act(1010, "aspirar_via_aerea")], runUntilSeconds: 2400, expect: [{ condition: { ruleFired: "r-apneia" }, description: "apneia ocorreu" }, { condition: { ruleFired: "r-melhora" }, description: "melhora após suporte" }] },
    { id: "t-alternativa", kind: "alternative", description: "Máscara com reservatório", commands: [act(5, "oximetria_portatil"), act(60, "o2_mascara_reservatorio", { fluxo: 10 }), act(80, "aspirar_via_aerea")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-melhora" }, description: "melhora" }] }
  ]
};
