import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, oxygenResponse, rx, staff, trend } from "./helpers";

const SAL = { drugGiven: "salbutamol" };
const SAL_REPETIDO = { drugGiven: "salbutamol", minTotal: { value: 1.2, unit: "mg" as const } };
const IPRA = { drugGiven: "ipratropio" };
const CORT = { any: [{ drugGiven: "prednisona" }, { drugGiven: "metilprednisolona" }, { drugGiven: "hidrocortisona" }] };
const SEDATIVO = { any: [{ drugGiven: "midazolam" }, { drugGiven: "diazepam" }, { drugGiven: "morfina" }] };

export const C017: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C017",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Falta de ar que não deixa completar frases",
  teachingTitle: "Crise de asma grave no adulto",
  group: "Pneumologia",
  specialties: ["Pneumologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "upa-porte-ii",
  difficulty: 2,
  level: "internato",
  objectives: [
    "Classificar a gravidade da crise pela clínica (fala, esforço, SpO₂)",
    "Iniciar broncodilatador de curta ação repetido e anticolinérgico na crise grave",
    "Prescrever corticoide sistêmico precoce",
    "Reconhecer sinais de exaustão e evitar sedação",
    "Reavaliar e definir destino conforme resposta"
  ],
  keywords: ["falta de ar", "chiado", "bombinha", "dispneia", "sibilância"],
  patient: {
    name: "Larissa Gomes",
    ageYears: 22,
    sex: "feminino",
    weightKg: 58,
    heightCm: 160,
    visual: { ageGroup: "adulto", sex: "feminino", skinTone: 2, hairStyle: "longo", hairColor: "castanho", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "UPA 24h. Jovem de 22 anos chega acompanhada da mãe, sentada inclinada para frente, com falta de ar intensa desde a madrugada. A triagem a classificou como vermelha.",
  communication: "limitada",
  informants: [{ id: "mae", name: "Dona Célia", role: "Mãe da paciente" }],
  history: [
    h("h-queixa", "queixa", "O que você está sentindo?", "Falta… de ar… chiado…", { keywords: ["falta de ar", "sentindo"] }),
    h("h-inicio", "inicio", "Desde quando?", "Desde… de madrugada… piorou…", { extra: [{ source: "mae", text: "Começou ontem à noite depois de faxinar o quarto. Usou a bombinha várias vezes e não melhorou." }] }),
    hi("h-bombinha", "medicacoes", "Quantas vezes usou a bombinha e qual remédio usa todo dia?", [{ source: "mae", text: "Ela usou o spray de salbutamol umas dez vezes desde ontem. Remédio todo dia ela não usa; tinha a bombinha de corticoide mas parou faz meses." }, { source: "paciente", text: "Bombinha… azul… muitas vezes…" }], ["bombinha", "spray", "remédio", "usa"]),
    hi("h-gravidade-previa", "antecedentes", "Já foi internada ou intubada por asma?", [{ source: "mae", text: "Foi internada duas vezes na adolescência, uma vez na UTI, mas não chegou a ser intubada." }], ["internada", "intubada", "uti", "asma"]),
    h("h-gatilho", "exposicao", "Teve contato com poeira, fumaça, gripe recente?", "Poeira… faxina…", { extra: [{ source: "mae", text: "Teve coriza esta semana também." }] }),
    h("h-alergias", "alergias", "Tem alergia a algum medicamento?", "Não…"),
    h("h-habitos", "habitos", "Fuma?", "Não…"),
    hi("h-gestacao", "gestacao", "Existe chance de gravidez?", [{ source: "paciente", text: "Não… menstruei… semana passada." }])
  ],
  initial: {
    vars: { hr: 128, sbp: 132, dbp: 84, rr: 32, spo2: 89, temp: 37.1, gcs: 15, pain: 2, glucose: 112, perfusion: 0.85, effort: 2.5, etco2: 36, ph: 7.4, pco2: 41, po2: 58, hco3: 24, be: 0, lactate: 1.9, k: 3.8, na: 139, wbc: 10200, hb: 13, plt: 280000, creat: 0.7, urea: 22 },
    flags: { rhythm: "taquicardia_sinusal", wheeze: true, speech: "palavras", posture: "sentado", sweating: true, painVisual: "leve", agitation: false },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Sentada, inclinada para frente, sudoreica, fala em palavras isoladas, ansiosa.", {
      better: [
        { when: { path: "flags.consciousness", op: "neq", value: "alerta" }, text: "Sonolenta, cabeça pende, respiração superficial: sinais de exaustão." },
        { when: { ruleFired: "r-melhora-plena" }, text: "Mais confortável, fala frases completas." }
      ]
    }),
    ex("e-torax-insp", "torax_anterior", "inspecao", "Uso de musculatura acessória (esternocleidomastoideos) e tiragem intercostal.", { better: [{ when: { ruleFired: "r-melhora-plena" }, text: "Sem tiragem; uso discreto de musculatura acessória." }] }),
    ex("e-ausc", "torax_anterior", "ausculta", "Sibilos expiratórios e inspiratórios difusos, murmúrio reduzido globalmente, expiração prolongada.", {
      sound: "sibilos",
      better: [
        { when: { ruleFired: "r-exaustao" }, text: "Murmúrio muito reduzido, quase sem sibilos (tórax silencioso)." },
        { when: { ruleFired: "r-melhora-plena" }, text: "Sibilos expiratórios esparsos, murmúrio bem audível." }
      ]
    }),
    ex("e-ausc-post", "torax_posterior", "ausculta", "Sibilos difusos com murmúrio reduzido nas bases.", { sound: "sibilos" }),
    ex("e-perc", "torax_anterior", "percussao", "Hipersonoridade difusa.", {}),
    ex("e-coracao", "coracao", "ausculta", "Bulhas taquicárdicas, sem sopros.", { sound: "bulhas_normais" }),
    ex("e-pescoco", "pescoco", "inspecao", "Traqueia centrada; sem enfisema subcutâneo.", {})
  ],
  testResults: [
    { testId: "rx_torax", variants: [{ text: "Laudo educativo: hiperinsuflação pulmonar; sem pneumotórax ou consolidação. Radiografia não é rotina na crise sem suspeita de complicação." }] },
    { testId: "ecg12", variants: [{ text: "Taquicardia sinusal.", ecg: { rhythm: "taquicardia_sinusal", rate: 126, stElevationLeads: [], stDepressionLeads: [], peakedT: false, wideQrs: false } }] }
  ],
  highlightedActions: ["monitorizar", "o2_cateter", "nebulizacao_montar", "oximetria_portatil", "acesso_venoso"],
  rules: [
    oxygenResponse(93, 90, { not: { ruleFired: "r-exaustao-sedacao" } }, 30),
    {
      id: "r-piora-sem-bd",
      description: "Sem broncodilatador, o broncoespasmo progride",
      priority: 5,
      when: { all: [{ time: "gte", seconds: 300 }, { not: SAL }] },
      repeat: "once",
      effects: [trend("effort", 3, 300, "doenca", 10), trend("spo2", 85, 300, "doenca", 10), trend("rr", 36, 300, "doenca", 10), trend("hr", 140, 300, "doenca", 10), outcome("piora")]
    },
    {
      id: "r-exaustao",
      description: "Sem tratamento eficaz, fadiga respiratória: FR cai, CO₂ sobe, tórax silencioso",
      priority: 6,
      when: { all: [{ time: "gte", seconds: 900 }, { not: SAL }] },
      repeat: "once",
      effects: [trend("rr", 12, 180, "exaust", 20), trend("pco2", 62, 300, "exaust", 20), trend("ph", 7.22, 300, "exaust", 20), trend("spo2", 80, 300, "exaust", 20), flag("wheeze", false), flag("consciousness", "voz"), flag("speech", "nenhuma"), { type: "changeCommunication", state: "incapaz" }, staff("enfermagem", "Ela está ficando sonolenta e quase não chia mais… isso é bom?"), outcome("piora")]
    },
    {
      id: "r-parada-respiratoria",
      description: "Exaustão não tratada evolui para parada respiratória (desfecho definido pelo caso)",
      priority: 100,
      when: { all: [{ time: "gte", seconds: 1800 }, { not: SAL }] },
      repeat: "once",
      effects: [{ type: "setValue", var: "rr", value: 0 }, flag("consciousness", "irresponsivo"), staff("enfermagem", "Ela parou de respirar!"), outcome("parada", true)]
    },
    {
      id: "r-bd-inicial",
      description: "Primeira dose de salbutamol: melhora parcial e transitória",
      priority: 40,
      when: SAL,
      repeat: "once",
      effects: [trend("effort", 2.0, 240, "bd1", 30, 1500), trend("rr", 28, 240, "bd1", 30, 1500), trend("spo2", 91, 240, "bd1", 25, 1500), trend("hr", 124, 240, "bd1", 30, 1500)]
    },
    {
      id: "r-melhora-plena",
      description: "Salbutamol repetido + ipratrópio: melhora clínica relevante",
      priority: 50,
      when: { all: [SAL_REPETIDO, IPRA] },
      repeat: "once",
      effects: [trend("effort", 1.0, 400, "bd2", 45), trend("rr", 22, 400, "bd2", 45), trend("spo2", 95, 300, "bd2", 35), trend("hr", 112, 600, "bd2", 45), trend("pco2", 37, 600, "bd2", 45), flag("speech", "frases"), flag("sweating", false), flag("wheeze", true), outcome("melhora")]
    },
    {
      id: "r-melhora-sem-ipra",
      description: "Salbutamol repetido sem ipratrópio: melhora menor",
      priority: 45,
      when: { all: [SAL_REPETIDO, { not: IPRA }] },
      repeat: "once",
      effects: [trend("effort", 1.4, 400, "bd2b", 40), trend("rr", 25, 400, "bd2b", 40), trend("spo2", 93, 300, "bd2b", 30), flag("speech", "frases"), outcome("estabilizacao_parcial")]
    },
    {
      id: "r-recaida-sem-corticoide",
      description: "Sem corticoide sistêmico, a melhora não se sustenta após ~40 min",
      priority: 55,
      when: { all: [{ elapsedSince: "drug:salbutamol", op: "gte", seconds: 2400 }, { not: CORT }] },
      repeat: "once",
      effects: [trend("effort", 2.0, 600, "recaida", 60), trend("spo2", 91, 600, "recaida", 60), flag("speech", "palavras"), staff("enfermagem", "O chiado voltou a piorar."), outcome("piora")]
    },
    {
      id: "r-magnesio",
      description: "Sulfato de magnésio IV acelera melhora na crise grave",
      priority: 52,
      when: { drugGiven: "sulfato_magnesio" },
      repeat: "once",
      effects: [trend("effort", 1.1, 300, "mg", 48, 3000)]
    },
    {
      id: "r-exaustao-sedacao",
      description: "Sedativo/opioide na crise grave: hipoventilação",
      priority: 95,
      when: SEDATIVO,
      repeat: "once",
      effects: [trend("rr", 9, 60, "sed", 90, 1500), trend("pco2", 68, 300, "sed", 90, 1500), trend("spo2", 82, 200, "sed", 90, 1500), flag("consciousness", "dor"), { type: "changeCommunication", state: "incapaz" }, staff("enfermagem", "Depois da medicação ela ficou quase sem respirar!"), outcome("complicacao")]
    },
    {
      id: "r-gaso-info",
      description: "Gasometria com pCO₂ normal em crise grave é sinal de alerta",
      when: { testCollected: "gaso_arterial" },
      repeat: "once",
      effects: [obs("Lembre: na crise grave, pCO₂ 'normal' com taquipneia pode indicar fadiga iminente.")]
    }
  ],
  diagnosis: { primary: "asma_grave", accepted: ["asma_grave"], differentials: ["anafilaxia", "pneumotorax_espontaneo", "pneumonia", "eap_hipertensivo", "aspiracao_corpo_estranho", "crise_ansiedade"] },
  acceptedDestinations: ["observacao", "transferencia_regulada"],
  outcomeNotes: "Broncodilatador repetido + ipratrópio + corticoide levam a melhora sustentada. Sem broncodilatador há exaustão aos 15 min e parada respiratória aos 30 min (decisão didática). Sedação causa hipoventilação.",
  scoring: [
    { id: "s-hist-gravidade", domain: "historia", description: "Investigou uso excessivo de broncodilatador e internações/UTI prévias", evidence: { kind: "historyAsked", items: ["h-bombinha", "h-gravidade-previa"], minCount: 2 }, points: 10, severity: "importante", rationale: "Fatores de risco para crise fatal: UTI prévia, uso excessivo de SABA, ausência de corticoide inalatório.", sourceIds: ["INT-GINA"] },
    { id: "s-exame", domain: "historia", description: "Avaliou fala, musculatura acessória e ausculta", evidence: { kind: "examDone", regions: ["geral", "torax_anterior", "torax_posterior", "pescoco"], minCount: 2 }, points: 10, severity: "importante", rationale: "Gravidade é clínica: fala em palavras, uso de acessória, SpO₂ < 90–92%." },
    { id: "s-sal", domain: "priorizacao", description: "Salbutamol em até 5 minutos", evidence: { kind: "drugGiven", anyOf: ["salbutamol"], withinSeconds: 300 }, points: 12, severity: "critica", rationale: "SABA é o tratamento inicial; repetir a cada 20 min na primeira hora.", sourceIds: ["INT-GINA", "BR-ASMA"] },
    { id: "s-o2", domain: "priorizacao", description: "Oxigênio para SpO₂ alvo 93–95%", evidence: { kind: "actionDone", anyOf: ["o2_cateter", "o2_mascara_reservatorio", "nebulizacao_montar"], withinSeconds: 300 }, points: 8, severity: "importante", rationale: "Hipoxemia na crise grave; oxigênio titulado.", sourceIds: ["INT-GINA"] },
    { id: "s-sal-repetido", domain: "tratamento", description: "Broncodilatador repetido (dose total ≥ 1,2 mg em 1 h)", evidence: { kind: "drugGiven", anyOf: ["salbutamol"], minTotal: { value: 1.2, unit: "mg" }, withinSeconds: 3600 }, points: 8, severity: "importante", rationale: "Na crise grave, doses repetidas na primeira hora.", alternatives: "Spray com espaçador ou nebulização são equivalentes.", sourceIds: ["INT-GINA"] },
    { id: "s-ipra", domain: "tratamento", description: "Ipratrópio associado na crise grave", evidence: { kind: "drugGiven", anyOf: ["ipratropio"] }, points: 6, severity: "importante", rationale: "Associação reduz internação na crise moderada/grave.", sourceIds: ["INT-GINA"] },
    { id: "s-cort", domain: "tratamento", description: "Corticoide sistêmico na primeira hora", evidence: { kind: "drugGiven", anyOf: ["prednisona", "metilprednisolona", "hidrocortisona"], withinSeconds: 3600 }, points: 8, severity: "importante", rationale: "Reduz recaída; via oral é tão eficaz quanto IV se a paciente deglute.", alternatives: "Prednisona VO, metilprednisolona IV ou hidrocortisona IV.", sourceIds: ["INT-GINA"] },
    { id: "s-sedacao", domain: "tratamento", description: "Falha de segurança: sedativo/opioide na crise grave", evidence: { kind: "avoidDrug", anyOf: ["midazolam", "diazepam", "morfina"] }, points: 12, penalty: true, severity: "critica", rationale: "Sedação deprime o drive respiratório e pode precipitar parada.", sourceIds: ["INT-GINA"] },
    { id: "s-exames", domain: "exames", description: "Exames só quando mudam a conduta", evidence: { kind: "testsNotExcessive", maxUnjustified: 1, justified: ["gaso_arterial", "gaso_venosa", "rx_torax", "eletrolitos"] }, points: 15, severity: "menor", rationale: "Gasometria se SpO₂ não melhora ou sinais de fadiga; radiografia se suspeita de complicação." },
    { id: "s-reavaliacao", domain: "reavaliacao", description: "Reavaliou SpO₂/ausculta após broncodilatador", evidence: { kind: "reassessAfter", after: ["salbutamol"], reassess: ["monitorizacao_continua", "oximetria_portatil", "torax_anterior", "torax_posterior", "geral"], withinSeconds: 1200 }, points: 10, severity: "importante", rationale: "Resposta em 1 h define destino." },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de crise de asma grave", evidence: { kind: "diagnosis", accepted: ["asma_grave"] }, points: 4, severity: "importante", rationale: "Classificar gravidade orienta tratamento e destino." },
    { id: "s-destino", domain: "destino", description: "Observação com reavaliação (ou transferência se sem resposta)", evidence: { kind: "disposition", accepted: ["observacao", "transferencia_regulada"] }, points: 6, severity: "importante", rationale: "Alta imediata após crise grave é insegura; sem resposta, regular para hospital." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Como ela fala? O que isso diz sobre a gravidade?" },
      { level: 2, text: "Reavalie fala, musculatura acessória e SpO₂ após cada intervenção." },
      { level: 3, text: "Broncoconstrição + inflamação: uma age em minutos, outra em horas. Você tratou as duas?" },
      { level: 4, text: "Sugestão explícita: O₂ para SpO₂ 93–95%, salbutamol a cada 20 min, ipratrópio e corticoide sistêmico; evite sedação." }
    ],
    summary: "Mulher de 22 anos com crise grave de asma (fala em palavras, uso de acessória, SpO₂ 89%), uso excessivo de salbutamol e sem corticoide inalatório.",
    pathophysiology: "Broncoconstrição, edema e muco aumentam a resistência das vias aéreas, causando aprisionamento aéreo, aumento do trabalho respiratório e desequilíbrio V/Q. Com a fadiga, a ventilação alveolar cai e o CO₂ sobe: pCO₂ 'normal' numa paciente taquipneica é sinal de alerta.",
    keyPoints: [
      "Gravidade é clínica: fala, posição, acessória, SpO₂, FC.",
      "Salbutamol repetido na primeira hora + ipratrópio na crise grave.",
      "Corticoide sistêmico precoce (oral é equivalente).",
      "Tórax silencioso e rebaixamento indicam exaustão iminente.",
      "Nunca sedar paciente em crise grave sem via aérea assegurada."
    ],
    alternatives: ["Spray com espaçador ou nebulização.", "Sulfato de magnésio IV em crise grave sem resposta inicial."],
    oralRubric: [
      { id: "o1", concept: "Classificação de gravidade", synonyms: ["grave", "gravidade", "palavras", "acessória"], weight: 2 },
      { id: "o2", concept: "Broncodilatador repetido", synonyms: ["salbutamol", "broncodilatador", "beta"], weight: 3 },
      { id: "o3", concept: "Ipratrópio", synonyms: ["ipratrópio", "ipratropio", "anticolinérgico"], weight: 1 },
      { id: "o4", concept: "Corticoide sistêmico", synonyms: ["corticoide", "prednisona", "metilprednisolona", "hidrocortisona"], weight: 2 },
      { id: "o5", concept: "Sinais de exaustão", synonyms: ["exaustão", "silencioso", "fadiga", "co2"], weight: 1 }
    ],
    simplifications: ["Intervalos de 20 min são parâmetros; o simulador soma a dose total de salbutamol.", "Recaída aos 40 min sem corticoide é didática."]
  },
  references: ["INT-GINA", "BR-ASMA", "BR-UPA", "AUTOR-SIMPLIFICACAO"],
  tests: [
    {
      id: "t-aceitavel",
      kind: "acceptable",
      description: "O₂, salbutamol spray 400 microgramas ×3, ipratrópio e prednisona",
      commands: [act(5, "monitorizar"), act(10, "o2_cateter", { fluxo: 2 }), rx(20, "salbutamol", "spray100", 400, "mcg", "inalatoria"), rx(30, "ipratropio", "neb025", 0.5, "mg", "nebulizacao"), ask(40, "h-bombinha"), rx(60, "prednisona", "cp20", 40, "mg", "VO"), rx(1220, "salbutamol", "spray100", 400, "mcg", "inalatoria"), rx(2420, "salbutamol", "spray100", 400, "mcg", "inalatoria"), dx(3000, "asma_grave"), dest(3000, "observacao")],
      runUntilSeconds: 3600,
      expect: [{ condition: { ruleFired: "r-melhora-plena" }, description: "melhora plena" }, { condition: { not: { ruleFired: "r-recaida-sem-corticoide" } }, description: "sem recaída" }, { condition: { path: "vars.spo2", op: "gte", value: 93 }, description: "SpO₂ ≥ 93%" }]
    },
    {
      id: "t-sem-intervencao",
      kind: "no_intervention",
      description: "Sem tratamento",
      commands: [],
      runUntilSeconds: 1900,
      expect: [{ condition: { ruleFired: "r-exaustao" }, description: "exaustão" }, { condition: { ruleFired: "r-parada-respiratoria" }, description: "parada respiratória" }]
    },
    {
      id: "t-inadequada",
      kind: "inadequate",
      description: "Midazolam para 'acalmar' a paciente agitada",
      commands: [act(5, "acesso_venoso"), act(100, "acesso_venoso"), rx(200, "midazolam", "amp15", 3, "mg", "IV")],
      runUntilSeconds: 500,
      expect: [{ condition: { ruleFired: "r-exaustao-sedacao" }, description: "hipoventilação" }]
    },
    {
      id: "t-atraso",
      kind: "delay",
      description: "Broncodilatador só aos 10 min e sem corticoide",
      commands: [rx(600, "salbutamol", "neb5", 5, "mg", "nebulizacao"), rx(620, "ipratropio", "neb025", 0.5, "mg", "nebulizacao")],
      runUntilSeconds: 3800,
      expect: [{ condition: { ruleFired: "r-piora-sem-bd" }, description: "piora antes do tratamento" }, { condition: { ruleFired: "r-recaida-sem-corticoide" }, description: "recaída sem corticoide" }]
    },
    {
      id: "t-alternativa",
      kind: "alternative",
      description: "Nebulização com salbutamol 5 mg + ipratrópio + metilprednisolona IV",
      commands: [act(5, "nebulizacao_montar"), rx(15, "salbutamol", "neb5", 5, "mg", "nebulizacao"), rx(20, "ipratropio", "neb025", 0.5, "mg", "nebulizacao"), act(30, "acesso_venoso"), act(130, "acesso_venoso"), rx(250, "metilprednisolona", "fa125", 60, "mg", "IV")],
      runUntilSeconds: 3000,
      expect: [{ condition: { ruleFired: "r-melhora-plena" }, description: "melhora plena" }, { condition: { not: { ruleFired: "r-recaida-sem-corticoide" } }, description: "sem recaída" }]
    }
  ]
};
