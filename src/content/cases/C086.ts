import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const ADR = { drugGiven: "adrenalina", route: "nebulizacao" as const };
const DEXA = { drugGiven: "dexametasona" };
const ALTA = { any: [{ path: "disposition", op: "eq", value: "alta_orientada" }, { path: "disposition", op: "eq", value: "alta_com_seguimento_ubs" }] };

export const C086: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C086",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Menino de 2 anos com tosse de cachorro e barulho ao respirar",
  teachingTitle: "Crupe grave — manter a criança calma, dexametasona para todos, adrenalina nebulizada, observação após adrenalina e sinais de alarme",
  group: "Pediatria",
  specialties: ["Pediatria", "Emergência"],
  environment: "pediatria",
  resourceProfile: "upa-porte-ii",
  difficulty: 2,
  level: "internato",
  objectives: [
    "Classificar a gravidade do crupe (estridor em repouso, tiragem, agitação, SpO₂, consciência)",
    "Evitar manobras que agitem a criança (exame de orofaringe com abaixador, separar do cuidador)",
    "Dexametasona oral para todos e adrenalina nebulizada no crupe grave",
    "Observar pelo menos 2 h após adrenalina; definir alta, internação ou UTI",
    "Lembrar diagnósticos diferenciais graves (epiglotite, traqueíte, corpo estranho)"
  ],
  keywords: ["tosse de cachorro", "estridor", "rouquidão", "criança", "falta de ar", "noite"],
  patient: {
    name: "Davi Souza",
    ageYears: 2,
    ageMonths: 24,
    sex: "masculino",
    weightKg: 12,
    heightCm: 87,
    visual: { ageGroup: "crianca_pequena", sex: "masculino", skinTone: 4, hairStyle: "crespo_curto", hairColor: "preto", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "UPA 24 h porte II, 2 h da madrugada. Menino de 2 anos trazido pela mãe com tosse 'de cachorro', rouquidão e um barulho alto ao puxar o ar, que piorou nas últimas 2 horas. Resfriado há 2 dias.",
  communication: "incapaz",
  informants: [{ id: "mae", name: "Mãe", role: "Mãe" }],
  history: [
    hi("h-inicio", "inicio", "Como começou?", [{ source: "mae", text: "Coriza e febre baixa há 2 dias. Hoje acordou com essa tosse rouca, como latido, e o barulho ao respirar." }], ["começou", "tosse", "quando"]),
    hi("h-engasgo", "sinais_alarme", "Ele engasgou com algum objeto ou comida? Está babando, sem conseguir engolir?", [{ source: "mae", text: "Não engasgou. Está engolindo saliva normal, não baba." }], ["engasgou", "objeto", "baba", "engolir"]),
    hi("h-vacinas", "vacinacao", "As vacinas estão em dia?", [{ source: "mae", text: "Sim, todas, inclusive a pentavalente." }], ["vacina"]),
    hi("h-antes", "antecedentes", "Já teve isso antes? Alguma doença?", [{ source: "mae", text: "Teve uma vez mais leve, passou com remédio. É saudável." }], ["antes", "doença"]),
    hi("h-casa", "social", "Mora perto? Tem como voltar se piorar?", [{ source: "mae", text: "Moro a 10 minutos, tenho carro." }], ["mora", "voltar", "transporte"])
  ],
  initial: {
    vars: { hr: 152, sbp: 100, dbp: 60, rr: 42, spo2: 93, temp: 38.0, gcs: 15, pain: 2, glucose: 104, perfusion: 0.9, effort: 0.75 },
    flags: { rhythm: "taquicardia_sinusal", posture: "sentado", painVisual: "leve", speech: "palavras", consciousness: "alerta", stridor: true, agitation: true, cough: true },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-resp", "torax_anterior", "inspecao", "Estridor inspiratório em repouso, tiragem supraesternal e subcostal moderada; agitado no colo da mãe.", { label: "Esforço respiratório", sound: "estridor", better: [{ when: { ruleFired: "r-melhora" }, text: "Sem estridor em repouso; tiragem mínima; calmo." }, { when: { ruleFired: "r-falencia" }, text: "Estridor mais baixo, tiragem intensa, sonolento, palidez perioral." }] }),
    ex("e-ausculta", "torax_posterior", "ausculta", "Murmúrio diminuído bilateralmente, transmissão do estridor; sem sibilos ou crepitações.", { label: "Ausculta" }),
    ex("e-orofaringe", "boca", "inspecao", "Ao tentar o abaixador de língua, a criança chora intensamente e o estridor piora.", { label: "Orofaringe (abaixador)" }),
    ex("e-geral", "geral", "inspecao", "Corado, hidratado, sem salivação excessiva, sem aspecto toxêmico.", {})
  ],
  testResults: [
    { testId: "rx_torax", variants: [{ text: "Laudo educativo: estreitamento subglótico (sinal da torre) — exame raramente necessário." }] }
  ],
  highlightedActions: ["oximetria_portatil", "nebulizacao_montar"],
  rules: [
    { id: "r-curso", description: "Obstrução subglótica progressiva", priority: 10, when: { always: true }, repeat: "once", effects: [trend("effort", 0.9, 1800, "crupe", 10), trend("spo2", 90, 1800, "crupe", 10), trend("rr", 48, 1800, "crupe", 10)] },
    { id: "r-agitacao", description: "Exame da orofaringe agita a criança", priority: 30, when: { examDone: "boca" }, repeat: "once", effects: [trend("effort", 0.95, 60, "agit", 30, 600), trend("spo2", 88, 60, "agit", 30, 600), obs("Agitar a criança aumenta o fluxo turbulento e piora a obstrução; examinar no colo, com mínima manipulação.")] },
    { id: "r-adrenalina", description: "Adrenalina nebulizada: alívio rápido e transitório", priority: 40, when: ADR, repeat: "once", effects: [trend("effort", 0.4, 300, "adr", 40, 5400), trend("spo2", 96, 300, "adr", 40, 5400), trend("rr", 32, 300, "adr", 40, 5400), trend("hr", 165, 120, "adr", 40, 1800), flag("agitation", false)] },
    { id: "r-dexa", description: "Dexametasona: melhora em horas, sustentada", priority: 45, when: DEXA, repeat: "once", effects: [trend("effort", 0.35, 3600, "dexa", 45), trend("spo2", 96, 3600, "dexa", 45)] },
    { id: "r-melhora", description: "Dexametasona + adrenalina: estridor em repouso resolve", priority: 50, when: { all: [ADR, DEXA, { elapsedSince: "drug:dexametasona", op: "gte", seconds: 1800 }] }, repeat: "once", effects: [flag("stridor", false), trend("effort", 0.25, 1800, "melhora", 50), trend("rr", 28, 1800, "melhora", 50), outcome("melhora")] },
    { id: "r-rebote", description: "Adrenalina sem corticoide: rebote", priority: 35, when: { all: [ADR, { not: DEXA }, { elapsedSince: "drug:adrenalina", op: "gte", seconds: 3600 }] }, repeat: "once", effects: [trend("effort", 0.85, 600, "rebote", 60), trend("spo2", 91, 600, "rebote", 60), flag("stridor", true), staff("enfermagem", "O estridor voltou forte depois que passou o efeito da nebulização."), outcome("piora")] },
    { id: "r-falencia", description: "Sem adrenalina em 30 min: falência iminente", priority: 38, when: { all: [{ time: "gte", seconds: 1800 }, { not: ADR }] }, repeat: "once", effects: [trend("spo2", 85, 600, "fal", 38), trend("gcs", 12, 600, "fal", 38), flag("consciousness", "voz"), staff("enfermagem", "Ele está ficando sonolento e com a boca arroxeada!"), outcome("piora")] },
    { id: "r-alta-precoce", description: "Alta sem observação/resolução", priority: 45, when: { all: [ALTA, { not: { ruleFired: "r-melhora" } }] }, repeat: "once", effects: [obs("Alta com estridor em repouso ou antes de 2 h da adrenalina: risco de rebote em casa."), outcome("complicacao")] }
  ],
  diagnosis: { primary: "crupe_grave", accepted: ["crupe_grave", "crupe"], differentials: ["aspiracao_corpo_estranho", "anafilaxia", "asma_pediatrica", "bronquiolite"] },
  acceptedDestinations: ["observacao", "alta_orientada", "alta_com_seguimento_ubs"],
  outcomeNotes: "Crupe grave (estridor em repouso, tiragem, agitação, SpO₂ 93%) em criança de 2 anos vacinada. Manter no colo, mínima manipulação, dexametasona oral 0,6 mg/kg (máx. 12 mg), adrenalina nebulizada 5 mg, O₂ se hipoxemia, observar ≥ 2 h após adrenalina; alta só sem estridor em repouso, com orientações e acesso para retorno.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Início viral e exclusão de corpo estranho/epiglotite", evidence: { kind: "historyAsked", items: ["h-inicio", "h-engasgo", "h-vacinas"], minCount: 2 }, points: 8, severity: "importante", rationale: "Diferenciais graves." },
    { id: "s-exame", domain: "historia", description: "Avaliação de gravidade sem manipular a orofaringe", evidence: { kind: "examDone", regions: ["torax_anterior", "geral"], minCount: 2 }, points: 6, severity: "importante", rationale: "Westley." },
    { id: "s-agitacao", domain: "tratamento", description: "Falha: manipulação que agita a criança", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-agitacao" } }, points: 6, penalty: true, severity: "importante", rationale: "Piora a obstrução.", sourceIds: ["INT-TREKK-CRUPE-2023"] },
    { id: "s-oximetria", domain: "priorizacao", description: "Oximetria", evidence: { kind: "actionDone", anyOf: ["oximetria_portatil", "monitorizar"], withinSeconds: 300 }, points: 4, severity: "importante", rationale: "Hipoxemia indica gravidade." },
    { id: "s-dexa", domain: "tratamento", description: "Dexametasona em até 20 min", evidence: { kind: "drugGiven", anyOf: ["dexametasona"], withinSeconds: 1200 }, points: 16, severity: "critica", rationale: "Para todos os casos de crupe.", sourceIds: ["INT-TREKK-CRUPE-2023"] },
    { id: "s-adr", domain: "tratamento", description: "Adrenalina nebulizada em até 15 min", evidence: { kind: "drugGiven", anyOf: ["adrenalina"], routes: ["nebulizacao"], withinSeconds: 900 }, points: 16, severity: "critica", rationale: "Crupe grave.", sourceIds: ["INT-TREKK-CRUPE-2023"] },
    { id: "s-exames", domain: "exames", description: "Sem RX/antibiótico desnecessários", evidence: { kind: "testsNotExcessive", maxUnjustified: 0, justified: [] }, points: 6, severity: "importante", rationale: "Diagnóstico clínico; doença viral.", sourceIds: ["INT-TREKK-CRUPE-2023"] },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliação após adrenalina", evidence: { kind: "reassessAfter", after: ["adrenalina"], reassess: ["torax_anterior", "oximetria_portatil", "monitorizar"], withinSeconds: 2400 }, points: 8, severity: "importante", rationale: "Detectar rebote." },
    { id: "s-alta", domain: "destino", description: "Falha: alta precoce", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-alta-precoce" } }, points: 10, penalty: true, severity: "critica", rationale: "Observar ≥ 2 h após adrenalina.", sourceIds: ["INT-TREKK-CRUPE-2023"] },
    { id: "s-orient", domain: "destino", description: "Orientação à família (sinais de alarme)", evidence: { kind: "actionDone", anyOf: ["orientacoes_alta"] }, points: 6, severity: "importante", rationale: "Retorno se estridor em repouso, tiragem, sonolência." },
    { id: "s-dx", domain: "destino", description: "Crupe", evidence: { kind: "diagnosis", accepted: ["crupe_grave", "crupe"] }, points: 6, severity: "importante", rationale: "Tosse ladrante + estridor." },
    { id: "s-destino", domain: "destino", description: "Observação e alta segura após resolução", evidence: { kind: "disposition", accepted: ["observacao", "alta_orientada", "alta_com_seguimento_ubs"] }, points: 8, severity: "importante", rationale: "Conforme resposta." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Tosse de cachorro, rouquidão e estridor depois de um resfriado." },
      { level: 2, text: "O que acontece com o estridor quando ele chora?" },
      { level: 3, text: "Um remédio funciona em minutos e passa; o outro demora e sustenta." },
      { level: 4, text: "Sugestão explícita: no colo da mãe, oximetria, dexametasona 0,6 mg/kg VO, adrenalina 5 mg nebulizada, observar ≥ 2 h, orientar." }
    ],
    summary: "Menino de 2 anos com crupe grave (laringotraqueobronquite viral).",
    pathophysiology: "Vírus (parainfluenza) causam edema subglótico; o anel cricoide não se expande, e pequena redução do raio aumenta muito a resistência. O choro aumenta o fluxo turbulento e piora a obstrução. A adrenalina causa vasoconstrição da mucosa (efeito em minutos, por 1–2 h); a dexametasona reduz o edema em horas.",
    keyPoints: [
      "Westley: estridor em repouso e tiragem definem moderado/grave.",
      "Mínima manipulação: criança no colo; não usar abaixador.",
      "Dexametasona VO 0,15–0,6 mg/kg (máx. 12 mg) para todos.",
      "Adrenalina nebulizada 5 mg no grave; observar ≥ 2 h.",
      "Diferenciais: epiglotite (baba, toxemia), traqueíte bacteriana, corpo estranho."
    ],
    alternatives: ["Dexametasona IM se vômitos ou rebaixamento.", "Repetir adrenalina nebulizada se necessário; UTI se grave após 2 doses."],
    oralRubric: [
      { id: "o1", concept: "Gravidade (Westley)", synonyms: ["westley", "estridor em repouso", "tiragem"], weight: 2 },
      { id: "o2", concept: "Dexametasona", synonyms: ["dexametasona", "corticoide"], weight: 3 },
      { id: "o3", concept: "Adrenalina nebulizada e observação", synonyms: ["adrenalina", "nebulização", "2 horas", "observação"], weight: 3 },
      { id: "o4", concept: "Não agitar", synonyms: ["colo", "calma", "agitar"], weight: 1 }
    ],
    simplifications: ["Adrenalina nebulizada registrada pela via de nebulização no catálogo.", "Escore de Westley não é calculado automaticamente."]
  },
  references: ["INT-TREKK-CRUPE-2023", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 2, allowSexSwap: true, allowWeightPercent: 10, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "História, oximetria, exame sem abaixador, dexametasona, adrenalina nebulizada, observação, orientação", commands: [ask(10, "h-inicio"), ask(20, "h-engasgo"), ask(30, "h-vacinas"), act(40, "oximetria_portatil"), { atSeconds: 60, type: "examine", payload: { region: "torax_anterior", maneuver: "inspecao" } }, { atSeconds: 70, type: "examine", payload: { region: "geral", maneuver: "inspecao" } }, act(80, "nebulizacao_montar"), rx(150, "adrenalina", "amp1mg", 5, "mg", "nebulizacao"), rx(200, "dexametasona", "elixir", 7.2, "mg", "VO"), { atSeconds: 1400, type: "examine", payload: { region: "torax_anterior", maneuver: "inspecao" } }, act(7600, "orientacoes_alta"), dx(7700, "crupe_grave"), dest(7800, "alta_orientada")], runUntilSeconds: 8400, expect: [{ condition: { ruleFired: "r-melhora" }, description: "resolução" }, { condition: { not: { ruleFired: "r-rebote" } }, description: "sem rebote" }, { condition: { not: { ruleFired: "r-alta-precoce" } }, description: "alta após observação" }, { condition: { not: { ruleFired: "r-agitacao" } }, description: "sem agitação" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 2400, expect: [{ condition: { ruleFired: "r-falencia" }, description: "falência iminente" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Abaixador de língua, só adrenalina e alta logo após", commands: [{ atSeconds: 30, type: "examine", payload: { region: "boca", maneuver: "inspecao" } }, rx(150, "adrenalina", "amp1mg", 5, "mg", "nebulizacao"), dest(1200, "alta_orientada")], runUntilSeconds: 5000, expect: [{ condition: { ruleFired: "r-agitacao" }, description: "agitação" }, { condition: { ruleFired: "r-alta-precoce" }, description: "alta precoce" }, { condition: { ruleFired: "r-rebote" }, description: "rebote sem corticoide" }] },
    { id: "t-atraso", kind: "delay", description: "Medicação só após falência iminente; observação", commands: [act(30, "oximetria_portatil"), act(1850, "o2_cateter", { fluxo: 2 }), rx(1900, "adrenalina", "amp1mg", 5, "mg", "nebulizacao"), rx(1950, "dexametasona", "amp10", 7.2, "mg", "IM"), dest(4000, "observacao")], runUntilSeconds: 8000, expect: [{ condition: { ruleFired: "r-falencia" }, description: "falência pelo atraso" }, { condition: { ruleFired: "r-melhora" }, description: "resolução tardia" }] },
    { id: "t-alternativa", kind: "alternative", description: "Dexametasona IM e adrenalina; segue em observação", commands: [act(20, "oximetria_portatil"), rx(100, "dexametasona", "amp10", 7.2, "mg", "IM"), rx(150, "adrenalina", "amp1mg", 5, "mg", "nebulizacao"), dest(3000, "observacao")], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-melhora" }, description: "resolução" }] }
  ]
};
