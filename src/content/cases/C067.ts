import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const RL = { any: [{ drugGiven: "ringer_lactato", minTotal: { value: 600, unit: "mL" as const } }, { drugGiven: "sf09", minTotal: { value: 600, unit: "mL" as const } }] };
const VOL_INICIO = { any: [{ drugGiven: "ringer_lactato" }, { drugGiven: "sf09" }] };
const EXCESSO = { any: [{ drugGiven: "ringer_lactato", minTotal: { value: 4000, unit: "mL" as const } }, { drugGiven: "sf09", minTotal: { value: 4000, unit: "mL" as const } }] };
const ATB = { any: [{ drugGiven: "piperacilina_tazobactam" }, { drugGiven: "ceftriaxona" }, { drugGiven: "cefepima" }, { drugGiven: "metronidazol" }] };

export const C067: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C067",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Homem com dor forte no estômago que vai para as costas e vômitos sem parar",
  teachingTitle: "Pancreatite aguda com sinais de gravidade — diagnóstico, hidratação moderada com Ringer, analgesia, sem antibiótico profilático e etiologia",
  group: "Gastroenterologia",
  specialties: ["Clínica médica", "Gastroenterologia", "Cirurgia geral", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Diagnosticar pancreatite aguda com 2 de 3 critérios, sem TC de rotina na admissão",
    "Identificar sinais precoces de gravidade (SIRS, hematócrito > 44%, ureia elevada/subindo)",
    "Hidratar com Ringer lactato de forma moderada e reavaliada, evitando excesso",
    "Analgesia eficaz; não usar antibiótico profilático",
    "Investigar etiologia (USG para cálculos, álcool, triglicerídeos) e indicar dieta precoce"
  ],
  keywords: ["dor no estômago", "costas", "vômito", "álcool", "barriga"],
  patient: {
    name: "Marcelo Fonseca",
    ageYears: 46,
    sex: "masculino",
    weightKg: 84,
    heightCm: 176,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 2, hairStyle: "curto", hairColor: "castanho", build: "robusto", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Homem de 46 anos com dor epigástrica intensa há 10 horas, em faixa, irradiada para as costas, com vômitos repetidos. Passou o fim de semana em uma festa bebendo muito.",
  communication: "normal",
  informants: [{ id: "esposa", name: "Esposa", role: "Acompanhante" }],
  history: [
    h("h-dor", "localizacao", "Como é a dor e para onde vai?", "No meio do estômago, como uma faca, vai pras costas. Melhora um pouco se eu me curvo pra frente.", { keywords: ["dor", "onde", "costas"] }),
    h("h-inicio", "inicio", "Quando começou? Comeu ou bebeu antes?", "Ontem à noite, depois de beber o fim de semana inteiro… cerveja e cachaça.", { keywords: ["quando", "começou", "bebeu"] }),
    hi("h-alcool", "habitos", "Quanto bebe habitualmente?", [{ source: "esposa", text: "Todo fim de semana bebe bastante. Durante a semana às vezes também." }], ["bebe", "álcool", "quanto"]),
    h("h-vesicula", "antecedentes", "Já teve pedra na vesícula, triglicérides alto ou crise parecida antes?", "Nunca fiz exame disso. Uma dor assim nunca tive.", { keywords: ["vesícula", "triglicérides", "antes"] }),
    h("h-medicacoes", "medicacoes", "Usa algum remédio?", "Nenhum.", { keywords: ["remédio", "medicação"] })
  ],
  initial: {
    vars: { hr: 118, sbp: 108, dbp: 64, rr: 24, spo2: 95, temp: 37.9, gcs: 15, pain: 9, glucose: 176, perfusion: 0.6, effort: 0.4, ht: 48, hb: 16.1, wbc: 15200, lipase: 2400, urea: 58, creat: 1.3, ca: 8.4, lactate: 2.4, na: 137, k: 3.7, ast: 92, alt: 54, bili: 1.1, urine: 15 },
    flags: { rhythm: "taquicardia_sinusal", posture: "sentado", painVisual: "intensa", speech: "frases", consciousness: "alerta", sweating: true, agitation: true },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-abdome", "abdome_epigastrio", "palpacao", "Dor intensa em epigástrio com defesa voluntária; ruídos diminuídos; sem sinais de Cullen ou Grey Turner.", { label: "Abdome" }),
    ex("e-geral", "geral", "inspecao", "Mucosas secas, sudoreico, posição antálgica.", {}),
    ex("e-torax", "torax_posterior", "ausculta", "Murmúrio discretamente reduzido em base esquerda.", { sound: "murmurio_normal" }),
    ex("e-pele", "pele", "inspecao", "Sem icterícia; sem xantomas.", {})
  ],
  testResults: [
    { testId: "usg_abdome", variants: [{ text: "Pâncreas aumentado e heterogêneo com líquido peripancreático discreto; vesícula sem cálculos; vias biliares não dilatadas; esteatose hepática." }] },
    { testId: "tc_abdome", variants: [{ text: "Laudo educativo: pancreatite edematosa intersticial com coleção peripancreática aguda; sem necrose identificável nesta fase (TC precoce subestima necrose)." }] },
    { testId: "rx_torax", variants: [{ text: "Laudo educativo: pequeno derrame pleural à esquerda." }] },
    { testId: "ecg12", variants: [{ text: "Taquicardia sinusal; sem isquemia." }] }
  ],
  highlightedActions: ["monitorizar", "acesso_venoso", "diurese_horaria", "avaliar_dor"],
  rules: [
    { id: "r-curso", description: "Resposta inflamatória com perda para o terceiro espaço", priority: 10, when: { always: true }, repeat: "once", effects: [trend("hr", 126, 3600, "panc", 10), trend("sbp", 98, 3600, "panc", 10), trend("ht", 50, 3600, "panc", 10), trend("urea", 72, 7200, "panc", 10), trend("urine", 10, 3600, "panc", 10)] },
    { id: "r-analgesia", description: "Analgesia opioide", priority: 20, when: { any: [{ drugGiven: "morfina" }, { drugGiven: "dipirona" }] }, repeat: "once", effects: [trend("pain", 4, 600, "anal", 20), flag("agitation", false)] },
    { id: "r-volume", description: "Ringer moderado e reavaliado: perfusão restaurada, hemoconcentração cai", priority: 30, when: RL, repeat: "once", effects: [trend("hr", 102, 1800, "vol", 30), trend("sbp", 118, 1800, "vol", 30), trend("ht", 43, 3600, "vol", 30), trend("urine", 60, 2400, "vol", 30), trend("urea", 50, 7200, "vol", 30), trend("perfusion", 0.85, 1800, "vol", 30), outcome("estabilizacao_parcial")] },
    { id: "r-excesso", description: "Hidratação agressiva (≥ 4 L em poucas horas)", priority: 50, when: EXCESSO, repeat: "once", effects: [trend("spo2", 89, 1200, "exc", 50), trend("effort", 0.7, 1200, "exc", 50), obs("Hidratação agressiva aumenta sobrecarga de volume, piora do derrame pleural e síndrome compartimental abdominal sem benefício."), outcome("complicacao")] },
    { id: "r-atb", description: "Antibiótico profilático sem infecção", priority: 20, when: ATB, repeat: "once", effects: [obs("Sem infecção documentada (colangite, necrose infectada, bacteremia), antibiótico profilático não é indicado na pancreatite aguda.")] },
    { id: "r-hipoperfusao", description: "Sem volume em 1 h: hipoperfusão e lesão renal", priority: 35, when: { all: [{ time: "gte", seconds: 3600 }, { not: VOL_INICIO }] }, repeat: "once", effects: [trend("sbp", 86, 900, "hipo", 35), trend("hr", 132, 900, "hipo", 35), trend("creat", 2.1, 3600, "hipo", 35), trend("lactate", 3.8, 1800, "hipo", 35), staff("enfermagem", "A pressão caiu e ele quase não urinou."), outcome("piora")] }
  ],
  diagnosis: { primary: "pancreatite", accepted: ["pancreatite"], differentials: ["iamcsst", "hda", "colecistite", "disseccao_aorta", "isquemia_mesenterica", "cad"] },
  acceptedDestinations: ["uti", "internacao_enfermaria"],
  outcomeNotes: "Pancreatite aguda alcoólica (dor típica + lipase > 3× LSN) com sinais precoces de gravidade (SIRS, hematócrito 48%, ureia elevada, derrame pleural). Ringer lactato com bolus de 10 mL/kg na hipovolemia e manutenção moderada reavaliada, analgesia opioide, sem antibiótico profilático, USG para excluir litíase, ECG para excluir IAM, dieta oral precoce conforme tolerância, tiamina/abordagem do álcool; unidade monitorizada.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Características da dor e etiologia (álcool/cálculos)", evidence: { kind: "historyAsked", items: ["h-dor", "h-alcool", "h-vesicula"], minCount: 2 }, points: 6, severity: "importante", rationale: "Diagnóstico e causa." },
    { id: "s-exame", domain: "historia", description: "Abdome, volemia e tórax", evidence: { kind: "examDone", regions: ["abdome_epigastrio", "geral", "torax_posterior"], minCount: 2 }, points: 5, severity: "importante", rationale: "Gravidade (hipovolemia, derrame)." },
    { id: "s-lipase", domain: "exames", description: "Lipase e exames de gravidade", evidence: { kind: "testOrdered", anyOf: ["lipase"], withinSeconds: 900 }, points: 8, severity: "critica", rationale: "Lipase > 3× LSN completa o diagnóstico.", sourceIds: ["INT-ACG-PANC-2024"] },
    { id: "s-gravidade", domain: "exames", description: "Hemograma (Ht), ureia/função renal, gasometria", evidence: { kind: "testOrdered", anyOf: ["hemograma", "funcao_renal", "gaso_venosa"], withinSeconds: 900 }, points: 6, severity: "importante", rationale: "Ht > 44% e ureia elevada predizem gravidade.", sourceIds: ["INT-ACG-PANC-2024"] },
    { id: "s-ecg", domain: "exames", description: "ECG (excluir síndrome coronariana)", evidence: { kind: "testOrdered", anyOf: ["ecg12"], withinSeconds: 900 }, points: 3, severity: "menor", rationale: "Dor epigástrica pode ser IAM inferior." },
    { id: "s-usg", domain: "exames", description: "USG de abdome (cálculos)", evidence: { kind: "testOrdered", anyOf: ["usg_abdome"] }, points: 5, severity: "importante", rationale: "Em todos os pacientes.", sourceIds: ["INT-ACG-PANC-2024"] },
    { id: "s-tc", domain: "exames", description: "Sem TC de rotina na admissão", evidence: { kind: "testsNotExcessive", maxUnjustified: 0, justified: ["lipase", "hemograma", "funcao_renal", "gaso_venosa", "ecg12", "usg_abdome", "hepatograma", "eletrolitos", "rx_torax", "pcr", "coagulograma"] }, points: 5, severity: "importante", rationale: "TC só se dúvida diagnóstica ou sem melhora em 48–72 h.", sourceIds: ["INT-ACG-PANC-2024"] },
    { id: "s-rl", domain: "tratamento", description: "Ringer lactato moderado", evidence: { kind: "drugGiven", anyOf: ["ringer_lactato"], withinSeconds: 1200 }, points: 14, severity: "critica", rationale: "Bolus de 10 mL/kg na hipovolemia; reavaliar.", sourceIds: ["INT-ACG-PANC-2024"] },
    { id: "s-excesso", domain: "tratamento", description: "Falha: hidratação agressiva", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-excesso" } }, points: 8, penalty: true, severity: "importante", rationale: "Excesso piora desfechos.", sourceIds: ["INT-ACG-PANC-2024"] },
    { id: "s-analgesia", domain: "tratamento", description: "Analgesia eficaz", evidence: { kind: "drugGiven", anyOf: ["morfina", "dipirona"], withinSeconds: 900 }, points: 6, severity: "importante", rationale: "Dor intensa." },
    { id: "s-atb", domain: "tratamento", description: "Sem antibiótico profilático", evidence: { kind: "avoidDrug", anyOf: ["piperacilina_tazobactam", "ceftriaxona", "cefepima", "metronidazol"] }, points: 8, severity: "importante", rationale: "Sem benefício na ausência de infecção.", sourceIds: ["INT-ACG-PANC-2024"] },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliação de perfusão e diurese", evidence: { kind: "reassessAfter", after: ["ringer_lactato", "sf09"], reassess: ["medir_pa", "diurese_horaria", "hemograma", "funcao_renal", "gaso_venosa"], withinSeconds: 3600 }, points: 8, severity: "importante", rationale: "Reavaliar em 6 h e em 24–48 h.", sourceIds: ["INT-ACG-PANC-2024"] },
    { id: "s-dx", domain: "destino", description: "Pancreatite aguda", evidence: { kind: "diagnosis", accepted: ["pancreatite"] }, points: 4, severity: "importante", rationale: "Dor típica + lipase." },
    { id: "s-destino", domain: "destino", description: "Internação monitorizada", evidence: { kind: "disposition", accepted: ["uti", "internacao_enfermaria"] }, points: 4, severity: "importante", rationale: "Sinais de gravidade: unidade monitorizada." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Dor em faixa para as costas, melhor ao inclinar o tronco, depois de muito álcool." },
      { level: 2, text: "Diagnóstico com 2 de 3 critérios — precisa de TC agora?" },
      { level: 3, text: "Hematócrito 48% e ureia subindo: o que está faltando no vaso?" },
      { level: 4, text: "Sugestão explícita: lipase, hemograma, ureia, gasometria, ECG, Ringer 10 mL/kg e reavaliar, morfina, USG, sem antibiótico, internar em unidade monitorizada." }
    ],
    summary: "Homem de 46 anos com pancreatite aguda alcoólica e sinais precoces de gravidade (SIRS, hemoconcentração, ureia elevada, derrame pleural).",
    pathophysiology: "A ativação intrapancreática de enzimas causa autodigestão e resposta inflamatória sistêmica, com extravasamento capilar e perda de volume para o terceiro espaço (hemoconcentração). A hipoperfusão pancreática favorece necrose. Reposição adequada protege a microcirculação, mas o excesso de volume aumenta complicações.",
    keyPoints: [
      "Diagnóstico: 2 de 3 (dor típica, lipase/amilase > 3× LSN, imagem).",
      "TC não é rotina na admissão; USG para cálculos em todos.",
      "Ringer lactato; bolus de 10 mL/kg se hipovolêmico; evitar hidratação agressiva; reavaliar.",
      "Sem antibiótico profilático; dieta oral em 24–48 h conforme tolerância.",
      "Sinais de gravidade: SIRS, Ht > 44%, ureia elevada/subindo, alteração mental, idade > 55, IMC > 30, derrame pleural."
    ],
    alternatives: ["Dipirona associada a opioide para analgesia multimodal.", "Tiamina e prevenção de abstinência alcoólica nas primeiras horas."],
    oralRubric: [
      { id: "o1", concept: "Critérios diagnósticos", synonyms: ["2 de 3", "lipase", "critérios"], weight: 2 },
      { id: "o2", concept: "Hidratação moderada com Ringer", synonyms: ["ringer", "hidratação", "10 ml/kg"], weight: 3 },
      { id: "o3", concept: "Sem antibiótico profilático", synonyms: ["antibiótico", "profilático"], weight: 2 },
      { id: "o4", concept: "Sinais de gravidade", synonyms: ["hematócrito", "ureia", "sirs"], weight: 1 }
    ],
    simplifications: ["Triglicerídeos e cálcio iônico não estão no catálogo.", "A evolução de 48–72 h (necrose, coleções) não é simulada."]
  },
  references: ["INT-ACG-PANC-2024", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 15, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Lipase, gravidade, ECG, Ringer 10 mL/kg, morfina, USG, sonda vesical, reavaliação", commands: [ask(10, "h-dor"), ask(20, "h-alcool"), ask(30, "h-vesicula"), { atSeconds: 40, type: "examine", payload: { region: "abdome_epigastrio", maneuver: "palpacao" } }, { atSeconds: 50, type: "examine", payload: { region: "geral", maneuver: "inspecao" } }, act(60, "monitorizar"), act(70, "acesso_venoso"), test(180, "lipase"), test(190, "hemograma"), test(200, "funcao_renal"), test(210, "gaso_venosa"), test(220, "ecg12"), rx(240, "ringer_lactato", "bolsa1000", 840, "mL", "IV", "infusao_volume", { durationMinutes: 45 }), rx(260, "morfina", "amp10", 4, "mg", "IV"), act(400, "diurese_horaria"), test(600, "usg_abdome"), act(3000, "medir_pa"), rx(3100, "ringer_lactato", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 480 }), dx(3300, "pancreatite"), dest(3400, "uti")], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-volume" }, description: "perfusão restaurada" }, { condition: { not: { ruleFired: "r-excesso" } }, description: "sem excesso" }, { condition: { not: { ruleFired: "r-atb" } }, description: "sem antibiótico" }, { condition: { path: "vars.ht", op: "lte", value: 46 }, description: "hemoconcentração melhora" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 4500, expect: [{ condition: { ruleFired: "r-hipoperfusao" }, description: "hipoperfusão" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Hidratação agressiva, antibiótico profilático e TC na admissão", commands: [act(30, "acesso_venoso"), act(130, "acesso_venoso"), rx(200, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 20 }), rx(220, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 20 }), rx(1500, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 20 }), rx(1520, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 20 }), rx(300, "piperacilina_tazobactam", "fa45", 4500, "mg", "IV"), test(400, "tc_abdome")], runUntilSeconds: 5000, expect: [{ condition: { ruleFired: "r-excesso" }, description: "sobrecarga" }, { condition: { ruleFired: "r-atb" }, description: "antibiótico sem indicação" }] },
    { id: "t-atraso", kind: "delay", description: "Só analgesia; volume após 1 h", commands: [act(30, "acesso_venoso"), rx(150, "morfina", "amp10", 4, "mg", "IV"), test(200, "lipase"), rx(3800, "ringer_lactato", "bolsa1000", 840, "mL", "IV", "infusao_volume", { durationMinutes: 45 })], runUntilSeconds: 8000, expect: [{ condition: { ruleFired: "r-hipoperfusao" }, description: "hipoperfusão pelo atraso" }, { condition: { ruleFired: "r-volume" }, description: "resposta ao volume" }] },
    { id: "t-alternativa", kind: "alternative", description: "Dipirona + morfina, Ringer e enfermaria monitorizada", commands: [act(20, "acesso_venoso"), test(130, "lipase"), test(140, "hemograma"), rx(160, "dipirona", "amp1g", 1000, "mg", "IV"), rx(180, "morfina", "amp10", 2, "mg", "IV"), rx(200, "ringer_lactato", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), test(300, "usg_abdome"), dest(3000, "internacao_enfermaria")], runUntilSeconds: 5000, expect: [{ condition: { ruleFired: "r-volume" }, description: "perfusão" }, { condition: { ruleFired: "r-analgesia" }, description: "analgesia" }] }
  ]
};
