import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const PARACENTESE = { actionCompleted: "paracentese_diagnostica" };
const ATB = { any: [{ drugGiven: "ceftriaxona" }, { drugGiven: "piperacilina_tazobactam" }, { drugGiven: "cefepima" }] };
const ALBUMINA = { drugGiven: "albumina", minTotal: { value: 80, unit: "g" as const } };
const LACTULOSE = { drugGiven: "lactulose" };

export const C070: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C070",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Homem com cirrose, barriga d'água, febre baixa e mais confuso",
  teachingTitle: "Peritonite bacteriana espontânea com encefalopatia e lesão renal — paracentese diagnóstica, cefalosporina, albumina e proteção renal",
  group: "Gastroenterologia",
  specialties: ["Clínica médica", "Hepatologia", "Gastroenterologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Fazer paracentese diagnóstica em todo cirrótico com ascite atendido na urgência, sem esperar corrigir coagulação",
    "Diagnosticar PBE (PMN ≥ 250/mm³) e iniciar cefalosporina de 3ª geração",
    "Prescrever albumina (1,5 g/kg no dia 1) para prevenir lesão renal",
    "Suspender diuréticos e nefrotóxicos; tratar encefalopatia e procurar precipitantes"
  ],
  keywords: ["cirrose", "barriga d'água", "ascite", "febre", "confuso", "fígado"],
  patient: {
    name: "Raimundo Silva",
    ageYears: 58,
    sex: "masculino",
    weightKg: 70,
    heightCm: 170,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 4, hairStyle: "curto", hairColor: "grisalho", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Homem de 58 anos com cirrose por álcool (abstinente há 1 ano), acompanhado no ambulatório de hepatologia. Há 3 dias com desconforto abdominal, febre baixa e, hoje, sonolento e trocando o dia pela noite.",
  communication: "limitada",
  informants: [{ id: "irma", name: "Irmã", role: "Acompanhante" }],
  history: [
    hi("h-evolucao", "inicio", "O que mudou nesses dias?", [{ source: "irma", text: "Barriga mais dura e dolorida, febre de 37,8, e hoje está lento, confuso, dormindo de dia." }], ["mudou", "dias", "quando"]),
    hi("h-medicacoes", "medicacoes", "Que remédios ele usa?", [{ source: "irma", text: "Espironolactona, furosemida, propranolol e lactulose — mas a lactulose ele parou porque dava diarreia." }], ["remédio", "medicação", "diurético", "lactulose"]),
    hi("h-sangramento", "sinais_alarme", "Vomitou sangue ou teve fezes pretas?", [{ source: "irma", text: "Não." }], ["sangue", "fezes pretas", "vômito"]),
    hi("h-evacuacao", "alimentacao_eliminacoes", "Quando evacuou pela última vez? Está urinando?", [{ source: "irma", text: "Faz 3 dias que não evacua. Urinando pouco." }], ["evacuou", "intestino", "urina"]),
    hi("h-alcool", "habitos", "Voltou a beber?", [{ source: "irma", text: "Não, parou faz um ano." }], ["bebe", "álcool"])
  ],
  initial: {
    vars: { hr: 102, sbp: 98, dbp: 56, rr: 20, spo2: 96, temp: 37.9, gcs: 13, pain: 4, glucose: 112, perfusion: 0.7, effort: 0.3, na: 129, k: 4.6, creat: 1.7, urea: 68, bili: 4.2, inr: 1.9, plt: 62000, hb: 10.4, wbc: 9800, lactate: 2.0, urine: 15 },
    flags: { rhythm: "taquicardia_sinusal", posture: "supino", painVisual: "leve", speech: "frases", consciousness: "voz", jaundice: true, edema: true, tremor: true },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-abdome", "abdome_qid", "percussao", "Ascite volumosa com macicez móvel; dor difusa leve à palpação, sem defesa.", { label: "Ascite" }),
    ex("e-neuro", "neurologico", "especial", "Desorientado no tempo, sonolento, asterixis presente (encefalopatia grau II).", { label: "Encefalopatia", better: [{ when: { ruleFired: "r-melhora" }, text: "Mais desperto, orientado; asterixis discreto." }] }),
    ex("e-pele", "pele", "inspecao", "Icterícia, aranhas vasculares, eritema palmar, edema de membros inferiores.", {}),
    ex("e-pelve", "pelve", "palpacao", "Toque retal: fezes endurecidas, sem melena.", { label: "Toque retal" })
  ],
  testResults: [
    { testId: "liquido_ascitico", variants: [{ text: "Leucócitos 1.100/mm³ com 820 polimorfonucleares/mm³; GASA 1,8 g/dL; proteína total 0,9 g/dL; Gram sem bactérias; cultura em frasco de hemocultura enviada." }] },
    { testId: "hemocultura", variants: [{ text: "Coletadas." }] },
    { testId: "urina_tipo1", variants: [{ text: "Sem leucocitúria." }] },
    { testId: "rx_torax", variants: [{ text: "Laudo educativo: sem consolidações; elevação de cúpulas pela ascite." }] }
  ],
  highlightedActions: ["paracentese_diagnostica", "acesso_venoso", "glicemia_capilar"],
  rules: [
    { id: "r-curso", description: "Infecção do líquido ascítico: lesão renal e encefalopatia progressivas", priority: 10, when: { always: true }, repeat: "once", effects: [trend("creat", 2.6, 7200, "pbe", 10), trend("gcs", 11, 5400, "pbe", 10), trend("temp", 38.3, 3600, "pbe", 10), trend("sbp", 90, 5400, "pbe", 10), trend("urine", 8, 5400, "pbe", 10)] },
    { id: "r-paracentese", description: "Paracentese diagnóstica", priority: 15, when: PARACENTESE, repeat: "once", effects: [staff("enfermagem", "Puncionei 40 mL de líquido turvo; mandei celularidade e frascos de hemocultura. Sem sangramento no local.")] },
    { id: "r-atb", description: "Cefalosporina de 3ª geração", priority: 30, when: ATB, repeat: "once", effects: [trend("temp", 37.2, 5400, "atb", 30), trend("wbc", 8000, 10800, "atb", 30)] },
    { id: "r-albumina", description: "Albumina: expansão e proteção renal", priority: 40, when: { all: [ALBUMINA, ATB] }, repeat: "once", effects: [trend("creat", 1.3, 10800, "alb", 40), trend("sbp", 108, 1800, "alb", 40), trend("urine", 35, 3600, "alb", 40)] },
    { id: "r-lactulose", description: "Lactulose para encefalopatia", priority: 30, when: LACTULOSE, repeat: "once", effects: [trend("gcs", 14, 5400, "lact", 30)] },
    { id: "r-melhora", description: "Antibiótico + albumina + lactulose: melhora", priority: 50, when: { all: [ATB, ALBUMINA, LACTULOSE] }, repeat: "once", effects: [trend("gcs", 15, 5400, "melhora", 50), flag("consciousness", "alerta"), { type: "changeCommunication", state: "normal" }, outcome("melhora")] },
    { id: "r-diuretico", description: "Diurético mantido/administrado na PBE com LRA", priority: 45, when: { drugGiven: "furosemida" }, repeat: "once", effects: [trend("creat", 3.0, 3600, "furo", 45), trend("sbp", 86, 1200, "furo", 45), obs("Na PBE com lesão renal, suspender diuréticos: risco de síndrome hepatorrenal."), outcome("complicacao")] },
    { id: "r-sem-atb", description: "Sem antibiótico em 1 h: sepse", priority: 35, when: { all: [{ time: "gte", seconds: 3600 }, { not: ATB }] }, repeat: "once", effects: [trend("sbp", 82, 1200, "sepse", 35), trend("hr", 118, 1200, "sepse", 35), trend("lactate", 3.8, 1800, "sepse", 35), flag("consciousness", "dor"), staff("enfermagem", "Ele está mais sonolento e a pressão caiu."), outcome("piora")] },
    { id: "r-lra", description: "Antibiótico sem albumina: lesão renal progressiva", priority: 36, when: { all: [{ time: "gte", seconds: 7200 }, ATB, { not: ALBUMINA }] }, repeat: "once", effects: [trend("creat", 3.0, 3600, "lra", 36), trend("urine", 5, 1800, "lra", 36), staff("laboratorio", "Creatinina de controle: 2,9 mg/dL."), outcome("complicacao")] }
  ],
  diagnosis: { primary: "pbe", accepted: ["pbe"], differentials: ["encefalopatia_metabolica", "lra", "sepse", "hda_varicosa", "pneumonia", "itu_complicada"] },
  acceptedDestinations: ["internacao_enfermaria", "uti"],
  outcomeNotes: "Peritonite bacteriana espontânea (PMN 820/mm³) em cirrose Child C, com encefalopatia grau II (precipitada por infecção e constipação) e lesão renal aguda. Paracentese diagnóstica sem corrigir coagulação, hemoculturas, ceftriaxona, albumina 1,5 g/kg no dia 1 e 1 g/kg no dia 3, suspensão de diuréticos e betabloqueador se hipotensão/LRA, lactulose, internação.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Evolução, medicações e precipitantes", evidence: { kind: "historyAsked", items: ["h-evolucao", "h-medicacoes", "h-sangramento", "h-evacuacao"], minCount: 3 }, points: 6, severity: "importante", rationale: "Infecção, sangramento, constipação, diuréticos." },
    { id: "s-exame", domain: "historia", description: "Ascite, encefalopatia e toque retal", evidence: { kind: "examDone", regions: ["abdome_qid", "neurologico", "pelve"], minCount: 2 }, points: 5, severity: "importante", rationale: "Graduar encefalopatia; excluir melena." },
    { id: "s-glicemia", domain: "priorizacao", description: "Glicemia capilar", evidence: { kind: "actionDone", anyOf: ["glicemia_capilar"], withinSeconds: 300 }, points: 4, severity: "importante", rationale: "Alteração mental." },
    { id: "s-paracentese", domain: "exames", description: "Paracentese diagnóstica em até 30 min", evidence: { kind: "actionDone", anyOf: ["paracentese_diagnostica"], withinSeconds: 1800 }, points: 14, severity: "critica", rationale: "Todo cirrótico com ascite na urgência; não precisa corrigir INR/plaquetas.", sourceIds: ["INT-PBE-CMAJ-2023"] },
    { id: "s-liquido", domain: "exames", description: "Celularidade e cultura do líquido", evidence: { kind: "testOrdered", anyOf: ["liquido_ascitico"], withinSeconds: 2400 }, points: 6, severity: "importante", rationale: "PMN ≥ 250 confirma." },
    { id: "s-labs", domain: "exames", description: "Função renal, eletrólitos, hemoculturas", evidence: { kind: "testOrdered", anyOf: ["funcao_renal", "eletrolitos", "hemocultura", "gaso_venosa"], withinSeconds: 1200 }, points: 5, severity: "importante", rationale: "LRA e hiponatremia." },
    { id: "s-atb", domain: "tratamento", description: "Cefalosporina de 3ª geração em até 1 h", evidence: { kind: "drugGiven", anyOf: ["ceftriaxona", "piperacilina_tazobactam", "cefepima"], withinSeconds: 3600 }, points: 14, severity: "critica", rationale: "Tratamento empírico da PBE.", sourceIds: ["INT-PBE-CMAJ-2023"] },
    { id: "s-albumina", domain: "tratamento", description: "Albumina 1,5 g/kg no dia 1", evidence: { kind: "drugGiven", anyOf: ["albumina"], withinSeconds: 21600 }, points: 12, severity: "critica", rationale: "Reduz insuficiência renal e mortalidade.", sourceIds: ["INT-PBE-CMAJ-2023"] },
    { id: "s-lactulose", domain: "tratamento", description: "Lactulose para encefalopatia", evidence: { kind: "drugGiven", anyOf: ["lactulose"] }, points: 6, severity: "importante", rationale: "Encefalopatia grau II com constipação." },
    { id: "s-diuretico", domain: "tratamento", description: "Falha: diurético na PBE com LRA", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-diuretico" } }, points: 8, penalty: true, severity: "importante", rationale: "Suspender diuréticos." },
    { id: "s-reav", domain: "reavaliacao", description: "Função renal e diurese após o tratamento", evidence: { kind: "reassessAfter", after: ["albumina", "ceftriaxona"], reassess: ["funcao_renal", "diurese_horaria", "medir_pa", "neurologico"], withinSeconds: 7200 }, points: 6, severity: "importante", rationale: "Síndrome hepatorrenal." },
    { id: "s-dx", domain: "destino", description: "Peritonite bacteriana espontânea", evidence: { kind: "diagnosis", accepted: ["pbe"] }, points: 6, severity: "importante", rationale: "PMN 820/mm³." },
    { id: "s-destino", domain: "destino", description: "Internação", evidence: { kind: "disposition", accepted: ["internacao_enfermaria", "uti"] }, points: 4, severity: "importante", rationale: "Antibiótico IV, albumina e monitorização renal." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Cirrótico com ascite que piorou: qual exame faz o diagnóstico?" },
      { level: 2, text: "INR 1,9 e plaquetas 62 mil contraindicam a paracentese?" },
      { level: 3, text: "Além do antibiótico, o que protege o rim na PBE?" },
      { level: 4, text: "Sugestão explícita: glicemia, paracentese diagnóstica, líquido ascítico, hemoculturas, ceftriaxona, albumina 1,5 g/kg, lactulose, suspender diuréticos, internar." }
    ],
    summary: "Homem de 58 anos com cirrose alcoólica Child C, PBE, encefalopatia grau II e lesão renal aguda.",
    pathophysiology: "Translocação bacteriana intestinal infecta a ascite (baixa opsonização). A infecção agrava a vasodilatação esplâncnica, reduz o volume arterial efetivo e ativa sistemas vasoconstritores renais, levando a LRA/síndrome hepatorrenal. Albumina expande o volume efetivo e reduz a falência renal. A infecção e a constipação precipitam encefalopatia.",
    keyPoints: [
      "Paracentese diagnóstica em todo cirrótico com ascite na urgência; coagulopatia não contraindica.",
      "PMN ≥ 250/mm³: PBE.",
      "Cefalosporina de 3ª geração (piperacilina-tazobactam se alta resistência/nosocomial).",
      "Albumina 1,5 g/kg em até 6 h (dia 1) e 1 g/kg no dia 3.",
      "Suspender diuréticos e nefrotóxicos; tratar encefalopatia e procurar precipitantes."
    ],
    alternatives: ["Piperacilina-tazobactam em infecção nosocomial ou com fatores de resistência.", "Profilaxia secundária após o episódio (decisão da hepatologia)."],
    oralRubric: [
      { id: "o1", concept: "Paracentese diagnóstica", synonyms: ["paracentese", "líquido ascítico", "pmn"], weight: 3 },
      { id: "o2", concept: "Antibiótico", synonyms: ["ceftriaxona", "cefalosporina", "antibiótico"], weight: 2 },
      { id: "o3", concept: "Albumina", synonyms: ["albumina", "1,5 g/kg"], weight: 3 },
      { id: "o4", concept: "Encefalopatia", synonyms: ["lactulose", "encefalopatia", "precipitante"], weight: 1 }
    ],
    simplifications: ["O resultado do líquido ascítico não depende tecnicamente da ação de paracentese no motor (registrado na pontuação).", "Lactulose sem regra de dose validada (o app alerta).", "Dose da albumina do dia 3 fora da janela simulada."]
  },
  references: ["INT-PBE-CMAJ-2023", "INT-SSC-2021", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 12, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Glicemia, paracentese, líquido, culturas, ceftriaxona, albumina, lactulose, internação", commands: [act(5, "glicemia_capilar"), ask(15, "h-evolucao"), ask(25, "h-medicacoes"), ask(35, "h-sangramento"), ask(45, "h-evacuacao"), { atSeconds: 55, type: "examine", payload: { region: "abdome_qid", maneuver: "percussao" } }, { atSeconds: 65, type: "examine", payload: { region: "neurologico", maneuver: "especial" } }, act(75, "acesso_venoso"), act(180, "paracentese_diagnostica"), test(490, "liquido_ascitico"), test(500, "hemocultura"), test(510, "funcao_renal"), rx(900, "ceftriaxona", "fa1g", 2000, "mg", "IV"), rx(1000, "albumina", "fr50", 1.5, "g/kg", "IV", "infusao_volume", { durationMinutes: 120 }), act(1100, "sonda_nasogastrica"), rx(1300, "lactulose", "xarope", 20, "mL", "SNG"), test(9000, "funcao_renal"), dx(9100, "pbe"), dest(9200, "internacao_enfermaria")], runUntilSeconds: 12000, expect: [{ condition: { ruleFired: "r-melhora" }, description: "melhora" }, { condition: { not: { ruleFired: "r-lra" } }, description: "rim protegido" }, { condition: { not: { ruleFired: "r-sem-atb" } }, description: "antibiótico a tempo" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 4000, expect: [{ condition: { ruleFired: "r-sem-atb" }, description: "sepse" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Furosemida para a ascite e sem paracentese/antibiótico", commands: [act(30, "acesso_venoso"), rx(150, "furosemida", "amp20", 40, "mg", "IV")], runUntilSeconds: 4000, expect: [{ condition: { ruleFired: "r-diuretico" }, description: "diurético na LRA" }, { condition: { ruleFired: "r-sem-atb" }, description: "sepse" }] },
    { id: "t-atraso", kind: "delay", description: "Antibiótico sem albumina", commands: [act(30, "acesso_venoso"), act(130, "paracentese_diagnostica"), test(440, "liquido_ascitico"), rx(1500, "ceftriaxona", "fa1g", 2000, "mg", "IV")], runUntilSeconds: 10000, expect: [{ condition: { ruleFired: "r-lra" }, description: "LRA sem albumina" }, { condition: { not: { ruleFired: "r-sem-atb" } }, description: "antibiótico dentro de 1 h" }] },
    { id: "t-alternativa", kind: "alternative", description: "Piperacilina-tazobactam (risco de resistência) e UTI", commands: [act(30, "acesso_venoso"), act(130, "paracentese_diagnostica"), test(440, "liquido_ascitico"), rx(600, "piperacilina_tazobactam", "fa45", 4500, "mg", "IV"), rx(700, "albumina", "fr50", 1.5, "g/kg", "IV", "infusao_volume", { durationMinutes: 120 }), act(800, "sonda_nasogastrica"), rx(1000, "lactulose", "xarope", 20, "mL", "SNG"), dest(3000, "uti")], runUntilSeconds: 10000, expect: [{ condition: { ruleFired: "r-melhora" }, description: "melhora" }] }
  ]
};
