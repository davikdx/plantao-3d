import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const ATB_PNA = { any: [{ drugGiven: "smx_tmp" }, { drugGiven: "ciprofloxacino" }, { drugGiven: "ceftriaxona" }] };
const ATB_CISTITE = { drugGiven: "nitrofurantoina" };

export const C111: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C111",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Mulher com ardência ao urinar há 3 dias que hoje teve febre e dor nas costas",
  teachingTitle: "Sintomas urinários com dúvida sobre o local da infecção — distinguir cistite de pielonefrite (febre, dor lombar, Giordano), urocultura, gravidez, antibiótico adequado ao sítio e reavaliação",
  group: "Atenção primária",
  specialties: ["Medicina de família", "Infectologia"],
  environment: "consultorio",
  resourceProfile: "ubs-urbana",
  difficulty: 2,
  level: "internato",
  objectives: [
    "Diferenciar cistite de pielonefrite pela clínica (febre, dor lombar, punho-percussão, sintomas sistêmicos)",
    "Excluir gestação e critérios de gravidade/internação (vômitos, sepse, obstrução)",
    "Solicitar urocultura antes do antibiótico na pielonefrite",
    "Escolher antibiótico com penetração renal (não usar nitrofurantoína/fosfomicina na pielonefrite)",
    "Orientar sinais de alarme e reavaliar em 48–72 h"
  ],
  keywords: ["ardência", "urinar", "febre", "dor nas costas", "xixi", "frequência"],
  patient: {
    name: "Juliana Prado",
    ageYears: 31,
    sex: "feminino",
    weightKg: 62,
    heightCm: 164,
    visual: { ageGroup: "adulto", sex: "feminino", skinTone: 2, hairStyle: "longo", hairColor: "castanho", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "UBS, demanda espontânea. Mulher de 31 anos com ardência para urinar e vontade frequente há 3 dias; desde ontem à noite febre e dor nas costas à direita. Pede 'o remédio da infecção urinária de sempre'.",
  communication: "normal",
  informants: [{ id: "paciente", name: "Juliana", role: "Paciente" }],
  history: [
    hi("h-urinarios", "queixa", "Como estão os sintomas ao urinar? Sangue na urina? Corrimento?", [{ source: "paciente", text: "Arde, vou toda hora e sai pouco. Não vi sangue. Sem corrimento." }], ["ardência", "urinar", "sangue", "corrimento"]),
    hi("h-sistemicos", "fatores_associados", "Febre? Calafrio? Dor nas costas? Náusea, vômito? Consegue tomar remédio pela boca?", [{ source: "paciente", text: "Medi 38,6 ontem, tive calafrio. Dói nas costas do lado direito. Enjoada, mas não vomitei; tomo remédio sim." }], ["febre", "calafrio", "costas", "vômito", "náusea"]),
    hi("h-gestacao", "ginecologico", "Pode estar grávida? Última menstruação? Usa método contraceptivo?", [{ source: "paciente", text: "Menstruei há 2 semanas. Uso DIU de cobre." }], ["grávida", "menstruação", "contraceptivo"]),
    hi("h-previas", "antecedentes", "Já teve infecção urinária? Usou antibiótico recentemente? Tem diabetes, cálculo renal, alergia?", [{ source: "paciente", text: "Tive cistite 2 vezes no ano passado, tomei nitrofurantoína. Nada de antibiótico nos últimos 3 meses. Sem diabetes ou cálculo. Sem alergias." }], ["antes", "antibiótico", "diabetes", "cálculo", "alergia"]),
    hi("h-sexual", "exposicao", "Nova parceria sexual? Sintomas no parceiro?", [{ source: "paciente", text: "Parceiro fixo, sem sintomas." }], ["parceria", "sexual", "parceiro"])
  ],
  initial: {
    vars: { hr: 96, sbp: 118, dbp: 74, rr: 18, spo2: 98, temp: 38.3, gcs: 15, pain: 5, glucose: 102, perfusion: 0.9, effort: 0.1 },
    flags: { rhythm: "sinusal", posture: "sentado", painVisual: "moderada", speech: "frases", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-lombar", "torax_posterior", "percussao", "Punho-percussão lombar (Giordano) positiva à direita.", { label: "Punho-percussão lombar" }),
    ex("e-abdome", "pelve", "palpacao", "Dor leve suprapúbica; sem massas; sem sinais de peritonite.", { label: "Hipogástrio" }),
    ex("e-geral", "geral", "inspecao", "Bom estado geral, corada, hidratada; sem sinais de sepse.", { label: "Estado geral" })
  ],
  testResults: [
    { testId: "urina_tipo1", variants: [{ text: "Fita: leucócitos +++, nitrito positivo, sangue +; sedimento com piócitos numerosos (resultado rápido em fita na unidade)." }] },
    { testId: "urocultura", variants: [{ text: "E. coli > 100.000 UFC/mL, sensível a SMX-TMP, ciprofloxacino e ceftriaxona (resultado em 3 dias)." }] },
    { testId: "teste_gravidez_urina", variants: [{ text: "Negativo." }] }
  ],
  highlightedActions: ["medir_pa", "orientacoes_alta"],
  rules: [
    { id: "r-tratada", description: "Antibiótico adequado à pielonefrite", priority: 30, when: ATB_PNA, repeat: "once", effects: [outcome("melhora")] },
    { id: "r-cistite", description: "Tratada como cistite", priority: 40, when: { all: [ATB_CISTITE, { not: ATB_PNA }] }, repeat: "once", effects: [obs("Febre e dor lombar indicam pielonefrite: nitrofurantoína não atinge níveis teciduais renais adequados — risco de falha e sepse."), outcome("complicacao")] },
    { id: "r-sem-cultura", description: "Antibiótico sem urocultura", priority: 35, when: { all: [ATB_PNA, { not: { testCollected: "urocultura" } }] }, repeat: "once", effects: [obs("Na pielonefrite, coletar urocultura antes do antibiótico para ajustar à sensibilidade.")] },
    { id: "r-progressao", description: "Sem tratamento: piora", priority: 20, when: { all: [{ time: "gte", seconds: 1800 }, { not: ATB_PNA }, { not: ATB_CISTITE }] }, repeat: "once", effects: [trend("temp", 39.2, 600, "prog", 20), trend("hr", 112, 600, "prog", 20), staff("paciente", "Estou tremendo de frio de novo e vomitei."), outcome("piora")] }
  ],
  diagnosis: { primary: "pielonefrite", accepted: ["pielonefrite"], differentials: ["cistite", "dip", "apendicite", "itu_complicada"] },
  acceptedDestinations: ["retorno_programado"],
  outcomeNotes: "Pielonefrite aguda não complicada em mulher não gestante, estável e tolerando VO. Exame com punho-percussão, urina em fita, teste de gravidez, urocultura antes do antibiótico, SMX-TMP ou ciprofloxacino por 7 dias conforme resistência local (não nitrofurantoína/fosfomicina), analgésico/antitérmico, sinais de alarme e reavaliação em 48–72 h com resultado da cultura.",
  scoring: [
    { id: "s-sist", domain: "historia", description: "Febre, dor lombar e sintomas sistêmicos", evidence: { kind: "historyAsked", items: ["h-sistemicos"], minCount: 1 }, points: 12, severity: "critica", rationale: "Define o sítio." },
    { id: "s-urin", domain: "historia", description: "Sintomas urinários e diferenciais (corrimento, IST)", evidence: { kind: "historyAsked", items: ["h-urinarios", "h-sexual"], minCount: 1 }, points: 6, severity: "importante", rationale: "Vaginite/IST simulam cistite." },
    { id: "s-gest", domain: "historia", description: "Gestação", evidence: { kind: "historyAsked", items: ["h-gestacao"], minCount: 1 }, points: 6, severity: "critica", rationale: "Muda antibiótico e conduta." },
    { id: "s-previas", domain: "historia", description: "ITU prévias, antibiótico recente, comorbidades, alergias", evidence: { kind: "historyAsked", items: ["h-previas"], minCount: 1 }, points: 6, severity: "importante", rationale: "Risco de resistência/complicação.", sourceIds: ["INT-WPHC-ITU-2025"] },
    { id: "s-giordano", domain: "historia", description: "Punho-percussão lombar", evidence: { kind: "examDone", regions: ["torax_posterior"], minCount: 1 }, points: 8, severity: "critica", rationale: "Sinal de pielonefrite." },
    { id: "s-sv", domain: "priorizacao", description: "Sinais vitais (critérios de gravidade)", evidence: { kind: "actionDone", anyOf: ["medir_pa", "monitorizar"] }, points: 4, severity: "importante", rationale: "Sepse/instabilidade." },
    { id: "s-urocultura", domain: "exames", description: "Urocultura antes do antibiótico", evidence: { kind: "testOrdered", anyOf: ["urocultura"] }, points: 10, severity: "critica", rationale: "Ajuste pela sensibilidade." },
    { id: "s-fita", domain: "exames", description: "Urina tipo 1/fita", evidence: { kind: "testOrdered", anyOf: ["urina_tipo1"] }, points: 4, severity: "importante", rationale: "Apoio diagnóstico." },
    { id: "s-bhcg", domain: "exames", description: "Teste de gravidez", evidence: { kind: "testOrdered", anyOf: ["teste_gravidez_urina", "bhcg"] }, points: 6, severity: "importante", rationale: "Fluoroquinolona contraindicada na gestação." },
    { id: "s-atb", domain: "tratamento", description: "Antibiótico com penetração renal (7 dias)", evidence: { kind: "drugGiven", anyOf: ["smx_tmp", "ciprofloxacino", "ceftriaxona"] }, points: 20, severity: "critica", rationale: "Tratar pielonefrite.", sourceIds: ["INT-WPHC-ITU-2025"] },
    { id: "s-orient", domain: "destino", description: "Sinais de alarme", evidence: { kind: "actionDone", anyOf: ["orientacoes_alta"] }, points: 6, severity: "importante", rationale: "Vômitos, piora: retorno imediato." },
    { id: "s-cistite", domain: "tratamento", description: "Falha: tratada como cistite", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-cistite" } }, points: 15, penalty: true, severity: "critica", rationale: "Nitrofurantoína não serve para pielonefrite.", sourceIds: ["INT-WPHC-ITU-2025"] },
    { id: "s-dx", domain: "destino", description: "Pielonefrite", evidence: { kind: "diagnosis", accepted: ["pielonefrite"] }, points: 6, severity: "importante", rationale: "Febre + dor lombar + Giordano." },
    { id: "s-destino", domain: "destino", description: "Reavaliação em 48–72 h", evidence: { kind: "disposition", accepted: ["retorno_programado"] }, points: 6, severity: "importante", rationale: "Resposta clínica e cultura." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Sintomas só baixos ou há febre e dor lombar?" },
      { level: 2, text: "Percuta a região lombar." },
      { level: 3, text: "O antibiótico 'de sempre' para cistite atinge o rim?" },
      { level: 4, text: "Sugestão explícita: sistêmicos, gestação, Giordano, fita, β-hCG, urocultura, SMX-TMP ou ciprofloxacino 7 dias, orientações, retorno em 48–72 h." }
    ],
    summary: "Pielonefrite aguda não complicada em mulher jovem, tratável ambulatorialmente.",
    pathophysiology: "Infecção ascendente (geralmente E. coli) da bexiga ao parênquima renal. Nitrofurantoína e fosfomicina concentram-se na urina, mas têm baixa concentração tecidual renal, por isso servem para cistite e não para pielonefrite.",
    keyPoints: [
      "Febre, calafrio, dor lombar e Giordano = pielonefrite.",
      "Urocultura antes do antibiótico na pielonefrite.",
      "Cistite: nitrofurantoína 5 dias ou fosfomicina dose única; pielonefrite: SMX-TMP, fluoroquinolona ou β-lactâmico por 7 dias, conforme resistência local.",
      "Excluir gestação; internar se vômitos, sepse, obstrução ou gestante com pielonefrite.",
      "Reavaliar em 48–72 h."
    ],
    alternatives: ["Ceftriaxona dose inicial parenteral se náuseas importantes, seguida de VO.", "Ajuste pelo antibiograma da urocultura."],
    oralRubric: [
      { id: "o1", concept: "Sítio", synonyms: ["pielonefrite", "febre", "lombar", "giordano"], weight: 3 },
      { id: "o2", concept: "Urocultura", synonyms: ["urocultura", "cultura"], weight: 2 },
      { id: "o3", concept: "Antibiótico adequado", synonyms: ["sulfametoxazol", "ciprofloxacino", "7 dias", "não nitrofurantoína"], weight: 3 },
      { id: "o4", concept: "Gestação/reavaliação", synonyms: ["gravidez", "48", "72", "retorno"], weight: 2 }
    ],
    simplifications: ["Escolha empírica depende da resistência local (não modelada).", "Analgesia/antitérmico não pontuados."]
  },
  references: ["INT-WPHC-ITU-2025", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: false, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "História, Giordano, sinais vitais, fita, β-hCG, urocultura, SMX-TMP, orientações, retorno", commands: [ask(10, "h-urinarios"), ask(20, "h-sistemicos"), ask(30, "h-gestacao"), ask(40, "h-previas"), act(50, "medir_pa"), { atSeconds: 120, type: "examine", payload: { region: "torax_posterior", maneuver: "percussao" } }, test(130, "urina_tipo1"), test(140, "teste_gravidez_urina"), test(150, "urocultura"), rx(1000, "smx_tmp", "cp800", 160, "mg", "VO"), act(1010, "orientacoes_alta"), dx(1200, "pielonefrite"), dest(1300, "retorno_programado")], runUntilSeconds: 2400, expect: [{ condition: { ruleFired: "r-tratada" }, description: "tratada" }, { condition: { not: { ruleFired: "r-sem-cultura" } }, description: "cultura antes" }, { condition: { not: { ruleFired: "r-cistite" } }, description: "sem nitrofurantoína" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 2400, expect: [{ condition: { ruleFired: "r-progressao" }, description: "piora" }] },
    { id: "t-inadequada", kind: "inadequate", description: "'O de sempre': nitrofurantoína 5 dias", commands: [ask(10, "h-urinarios"), rx(100, "nitrofurantoina", "cp100", 100, "mg", "VO"), dest(400, "retorno_programado")], runUntilSeconds: 2400, expect: [{ condition: { ruleFired: "r-cistite" }, description: "tratada como cistite" }] },
    { id: "t-atraso", kind: "delay", description: "Antibiótico tardio, sem urocultura", commands: [ask(10, "h-sistemicos"), rx(2000, "ciprofloxacino", "cp500", 500, "mg", "VO"), dest(2200, "retorno_programado")], runUntilSeconds: 2600, expect: [{ condition: { ruleFired: "r-progressao" }, description: "piora" }, { condition: { ruleFired: "r-sem-cultura" }, description: "sem cultura" }] },
    { id: "t-alternativa", kind: "alternative", description: "Ceftriaxona IM inicial + urocultura", commands: [ask(10, "h-sistemicos"), ask(20, "h-gestacao"), test(30, "teste_gravidez_urina"), test(40, "urocultura"), rx(200, "ceftriaxona", "fa1g", 1000, "mg", "IM"), act(300, "orientacoes_alta"), dest(500, "retorno_programado")], runUntilSeconds: 2400, expect: [{ condition: { ruleFired: "r-tratada" }, description: "tratada" }] }
  ]
};
