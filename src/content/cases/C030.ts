import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const CEFTRI = { drugGiven: "ceftriaxona" };
const DEXA = { drugGiven: "dexametasona" };

export const C030: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C030",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Estudante com febre alta, dor de cabeça e nuca dura",
  teachingTitle: "Meningite bacteriana aguda — antibiótico e dexametasona sem atraso, punção lombar, precauções e notificação",
  group: "Neurologia",
  specialties: ["Infectologia", "Neurologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Reconhecer síndrome meníngea com sinais de gravidade",
    "Não atrasar antibiótico por TC ou punção lombar",
    "Administrar dexametasona antes ou junto da primeira dose",
    "Indicar TC antes da punção apenas quando há critérios",
    "Aplicar precaução para gotículas, notificar e orientar quimioprofilaxia de contatos"
  ],
  keywords: ["febre", "dor de cabeça", "nuca dura", "vômito", "manchas"],
  patient: {
    name: "Gabriel Antunes",
    ageYears: 19,
    sex: "masculino",
    weightKg: 70,
    heightCm: 178,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 3, hairStyle: "crespo_volume", hairColor: "preto", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Estudante de 19 anos que mora em república, trazido por colegas: febre alta e dor de cabeça intensa desde a noite anterior, vômitos e sonolência.",
  communication: "limitada",
  informants: [{ id: "colega", name: "Matheus", role: "Colega de república" }],
  history: [
    h("h-queixa", "queixa", "O que você sente?", "Dor de cabeça… muito forte… a luz incomoda.", { keywords: ["sente"] }),
    hi("h-inicio", "inicio", "Desde quando?", [{ source: "colega", text: "Ontem à noite começou a febre; hoje cedo estava confuso." }], ["quando", "começou"]),
    hi("h-manchas", "fatores_associados", "Apareceram manchas na pele?", [{ source: "colega", text: "Hoje vi umas pintinhas roxas nas pernas." }], ["manchas", "pele", "pintas"]),
    hi("h-convulsao", "sinais_alarme", "Teve convulsão? Algum trauma? Tem imunossupressão?", [{ source: "colega", text: "Não teve convulsão nem trauma. É saudável." }], ["convulsão", "trauma", "imunossupressão"]),
    hi("h-contatos", "social", "Com quantas pessoas ele mora?", [{ source: "colega", text: "Somos seis na república, e a namorada dele dormiu lá ontem." }], ["mora", "contatos", "república"]),
    hi("h-alergias", "alergias", "Ele tem alergia a algum antibiótico?", [{ source: "colega", text: "Não que eu saiba." }], ["alergia"])
  ],
  initial: {
    vars: { hr: 122, sbp: 104, dbp: 60, rr: 24, spo2: 96, temp: 39.6, gcs: 13, pain: 9, glucose: 112, perfusion: 0.6, effort: 0.3, wbc: 22400, plt: 132000, pcr: 248, lactate: 3.1, creat: 1.1, inr: 1.2 },
    flags: { rhythm: "taquicardia_sinusal", rash: true, posture: "decubito_lateral", painVisual: "intensa", speech: "palavras", consciousness: "voz", communication: "limitada" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-meningeo", "neurologico", "especial", "Rigidez de nuca, Kernig e Brudzinski positivos; Glasgow 13; sem déficit focal; pupilas isocóricas.", { label: "Neurológico e sinais meníngeos" }),
    ex("e-pele", "pele", "inspecao", "Petéquias em membros inferiores e tronco, que não desaparecem à pressão.", { better: [{ when: { ruleFired: "r-choque" }, text: "Púrpura confluente e equimoses em membros." }] }),
    ex("e-fundo", "olhos", "inspecao", "Sem papiledema à fundoscopia direta.", {}),
    ex("e-perfusao", "membro_superior_d", "palpacao", "Extremidades frias, enchimento capilar 4 s.", { label: "Perfusão" })
  ],
  testResults: [
    { testId: "liquor", variants: [{ text: "Turvo; pleocitose neutrofílica, glicose muito baixa, proteína elevada; Gram com diplococos Gram-negativos. (Laudo educativo.)" }] },
    { testId: "hemocultura", variants: [{ text: "Coletadas antes do antibiótico; resultado em 24–72 h." }] },
    { testId: "tc_cranio", variants: [{ text: "Sem lesões expansivas, sem sinais de hipertensão intracraniana. (Laudo educativo.)" }] }
  ],
  highlightedActions: ["acesso_venoso", "monitorizar", "notificacao"],
  rules: [
    { id: "r-atb-precoce", description: "Ceftriaxona em até 1 h: melhora progressiva", priority: 60, when: { all: [CEFTRI, { elapsedSince: "drug:ceftriaxona", op: "gte", seconds: 1800 }, { not: { ruleFired: "r-choque" } }] }, repeat: "once", effects: [trend("temp", 38.2, 1800, "atb", 60), trend("hr", 104, 1800, "atb", 60), trend("gcs", 14, 1800, "atb", 60), outcome("estabilizacao_parcial")] },
    { id: "r-dexa", description: "Dexametasona antes/junto do antibiótico", when: { all: [DEXA, CEFTRI, { not: { elapsedSince: "drug:ceftriaxona", op: "gte", seconds: 3600 } }] }, repeat: "once", effects: [obs("Dexametasona associada: reduz sequelas (sobretudo na meningite pneumocócica); manter conforme agente identificado.")] },
    { id: "r-dexa-tardia", description: "Dexametasona muito depois do antibiótico", when: { all: [DEXA, { elapsedSince: "drug:ceftriaxona", op: "gte", seconds: 3600 }, { not: { ruleFired: "r-dexa" } }] }, repeat: "once", effects: [obs("Dexametasona iniciada muito após o antibiótico: benefício incerto.")] },
    { id: "r-choque", description: "Sem antibiótico em 60 min: choque e púrpura", priority: 40, when: { all: [{ time: "gte", seconds: 3600 }, { not: CEFTRI }] }, repeat: "once", effects: [trend("sbp", 74, 600, "choque", 40), trend("dbp", 40, 600, "choque", 40), trend("plt", 48000, 1800, "choque", 40), trend("lactate", 6.2, 1800, "choque", 40), flag("consciousness", "dor"), staff("enfermagem", "As manchas se espalharam e a pressão caiu!"), outcome("piora")] },
    { id: "r-volume", description: "Volume na hipoperfusão", when: { any: [{ drugGiven: "sf09", minTotal: { value: 1000, unit: "mL" } }, { drugGiven: "ringer_lactato", minTotal: { value: 1000, unit: "mL" } }] }, repeat: "once", effects: [trend("sbp", 112, 600, "vol", 45, 3600), trend("perfusion", 0.7, 600, "vol", 45, 3600)] },
    { id: "r-tc-atraso", description: "Aguardando TC antes do antibiótico", when: { all: [{ testCollected: "tc_cranio" }, { not: CEFTRI }] }, repeat: "once", effects: [obs("TC solicitada antes do antibiótico: não deve atrasar a primeira dose (colher hemoculturas e tratar).")] },
    { id: "r-notificacao", description: "Vigilância", when: { actionCompleted: "notificacao" }, repeat: "once", effects: [staff("supervisor", "Vigilância epidemiológica: caso suspeito de doença meningocócica notificado; quimioprofilaxia indicada para contatos íntimos (moradores da república e parceria) — conferir esquema no Guia de Vigilância.")] }
  ],
  diagnosis: { primary: "meningite_bacteriana", accepted: ["meningite_bacteriana", "choque_septico"], differentials: ["hemorragia_subaracnoidea", "dengue_alarme", "febre_maculosa", "sepse", "enxaqueca"] },
  acceptedDestinations: ["uti", "internacao_enfermaria"],
  outcomeNotes: "Síndrome meníngea com petéquias (provável meningococo): hemoculturas, ceftriaxona e dexametasona em até 1 h, sem esperar TC/PL; TC antes da PL só se déficit focal, papiledema, convulsão, imunossupressão ou Glasgow < 10. Precaução para gotículas por 24 h de antibiótico, notificação imediata e quimioprofilaxia de contatos. UTI se instabilidade.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Petéquias, convulsão/imunossupressão (critérios de TC)", evidence: { kind: "historyAsked", items: ["h-manchas", "h-convulsao"], minCount: 2 }, points: 6, severity: "importante", rationale: "Orientam gravidade e necessidade de TC." },
    { id: "s-contatos", domain: "historia", description: "Identificou contatos íntimos", evidence: { kind: "historyAsked", items: ["h-contatos"], minCount: 1 }, points: 4, severity: "importante", rationale: "Quimioprofilaxia.", sourceIds: ["BR-MENINGITE"] },
    { id: "s-exame", domain: "historia", description: "Sinais meníngeos, pele e fundo de olho", evidence: { kind: "examDone", regions: ["neurologico", "pele", "olhos"], minCount: 2 }, points: 6, severity: "importante", rationale: "Púrpura e sinais de HIC." },
    { id: "s-acesso", domain: "priorizacao", description: "Acesso e monitorização imediatos", evidence: { kind: "actionDone", anyOf: ["acesso_venoso", "monitorizar"], withinSeconds: 300 }, points: 5, severity: "importante", rationale: "Sinais de sepse." },
    { id: "s-culturas", domain: "exames", description: "Hemoculturas", evidence: { kind: "testOrdered", anyOf: ["hemocultura"], withinSeconds: 1800 }, points: 5, severity: "importante", rationale: "Antes do antibiótico, sem atrasá-lo." },
    { id: "s-liquor", domain: "exames", description: "Punção lombar (quando segura)", evidence: { kind: "testOrdered", anyOf: ["liquor"] }, points: 6, severity: "importante", rationale: "Confirma e identifica agente.", sourceIds: ["INT-ESCMID-MENINGITE-2016"] },
    { id: "s-atb", domain: "tratamento", description: "Ceftriaxona em até 1 hora", evidence: { kind: "drugGiven", anyOf: ["ceftriaxona"], withinSeconds: 3600 }, points: 18, severity: "critica", rationale: "Cada hora de atraso aumenta mortalidade.", sourceIds: ["INT-ESCMID-MENINGITE-2016"] },
    { id: "s-dexa", domain: "tratamento", description: "Dexametasona antes/junto do antibiótico", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-dexa" } }, points: 6, severity: "importante", rationale: "Reduz sequelas.", sourceIds: ["INT-ESCMID-MENINGITE-2016"] },
    { id: "s-volume", domain: "tratamento", description: "Volume para hipoperfusão", evidence: { kind: "drugGiven", anyOf: ["sf09", "ringer_lactato"] }, points: 3, severity: "importante", rationale: "Sepse." },
    { id: "s-notifica", domain: "reavaliacao", description: "Notificação imediata", evidence: { kind: "actionDone", anyOf: ["notificacao"] }, points: 6, severity: "importante", rationale: "Doença de notificação imediata; profilaxia de contatos.", sourceIds: ["BR-MENINGITE"] },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou PA/perfusão", evidence: { kind: "reassessAfter", after: ["ceftriaxona"], reassess: ["medir_pa", "avaliar_glasgow"], withinSeconds: 3600 }, points: 4, severity: "importante", rationale: "Risco de choque." },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de meningite bacteriana", evidence: { kind: "diagnosis", accepted: ["meningite_bacteriana", "choque_septico"] }, points: 5, severity: "importante", rationale: "Síndrome meníngea febril com petéquias." },
    { id: "s-destino", domain: "destino", description: "Internação (UTI se instável)", evidence: { kind: "disposition", accepted: ["uti", "internacao_enfermaria"] }, points: 6, severity: "importante", rationale: "Monitorização." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Febre + cefaleia + rigidez + petéquias: quanto tempo você tem?" },
      { level: 2, text: "TC antes de tudo? Quais são os critérios?" },
      { level: 3, text: "Há um adjuvante que deve vir antes ou junto do antibiótico." },
      { level: 4, text: "Sugestão explícita: acesso, hemoculturas, dexametasona + ceftriaxona em até 1 h, volume, PL quando segura, notificação, precauções e UTI se instável." }
    ],
    summary: "Jovem de 19 anos em moradia coletiva, com meningite bacteriana aguda e petéquias (provável meningococo), sinais de sepse.",
    pathophysiology: "Bactérias invadem o espaço subaracnóideo e desencadeiam inflamação intensa (edema, vasculite, hipertensão intracraniana). Na doença meningocócica, endotoxina causa CIVD, púrpura e choque. O antibiótico precoce reduz carga bacteriana; o corticoide atenua a resposta inflamatória.",
    keyPoints: [
      "Antibiótico em até 1 h; não esperar TC/PL.",
      "TC antes da PL apenas com critérios (déficit focal, papiledema, convulsão, imunossupressão, Glasgow < 10).",
      "Dexametasona antes/junto da primeira dose.",
      "Precaução para gotículas por 24 h de antibiótico.",
      "Notificação imediata e quimioprofilaxia dos contatos íntimos."
    ],
    alternatives: ["Ampicilina associada se risco de Listeria (idosos, imunossuprimidos) — não modelada."],
    oralRubric: [
      { id: "o1", concept: "Antibiótico precoce", synonyms: ["ceftriaxona", "antibiótico", "1 hora"], weight: 3 },
      { id: "o2", concept: "Dexametasona", synonyms: ["dexametasona", "corticoide"], weight: 2 },
      { id: "o3", concept: "Critérios de TC", synonyms: ["tc", "tomografia", "papiledema", "déficit focal"], weight: 1 },
      { id: "o4", concept: "Vigilância", synonyms: ["notificação", "quimioprofilaxia", "contatos", "gotículas"], weight: 2 }
    ],
    simplifications: ["Evolução comprimida em minutos.", "Precaução para gotículas não é uma ação no simulador."]
  },
  references: ["INT-ESCMID-MENINGITE-2016", "BR-MENINGITE", "INT-SSC-2021", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Acesso, culturas, dexametasona + ceftriaxona, volume, PL, notificação e UTI", commands: [ask(10, "h-manchas"), ask(20, "h-convulsao"), ask(30, "h-contatos"), act(40, "monitorizar"), act(50, "acesso_venoso"), act(150, "acesso_venoso"), test(160, "hemocultura"), rx(200, "dexametasona", "amp10", 10, "mg", "IV"), rx(210, "ceftriaxona", "fa1g", 2000, "mg", "IV"), rx(230, "ringer_lactato", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 30 }), test(400, "liquor"), act(600, "notificacao"), act(2400, "medir_pa"), dx(3000, "meningite_bacteriana"), dest(3000, "uti")], runUntilSeconds: 3500, expect: [{ condition: { ruleFired: "r-atb-precoce" }, description: "melhora" }, { condition: { ruleFired: "r-dexa" }, description: "dexametasona" }, { condition: { not: { ruleFired: "r-choque" } }, description: "sem choque" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 3800, expect: [{ condition: { ruleFired: "r-choque" }, description: "choque" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Espera TC e PL para tratar", commands: [act(50, "acesso_venoso"), act(150, "acesso_venoso"), test(200, "tc_cranio"), test(2700, "liquor"), rx(4500, "ceftriaxona", "fa1g", 2000, "mg", "IV")], runUntilSeconds: 5000, expect: [{ condition: { ruleFired: "r-tc-atraso" }, description: "atraso por TC" }, { condition: { ruleFired: "r-choque" }, description: "choque" }] },
    { id: "t-atraso", kind: "delay", description: "Antibiótico aos 50 min, dexametasona muito depois", commands: [act(50, "acesso_venoso"), act(150, "acesso_venoso"), rx(3000, "ceftriaxona", "fa1g", 2000, "mg", "IV"), rx(6700, "dexametasona", "amp10", 10, "mg", "IV")], runUntilSeconds: 7000, expect: [{ condition: { ruleFired: "r-dexa-tardia" }, description: "dexa tardia" }, { condition: { not: { ruleFired: "r-choque" } }, description: "choque evitado" }] },
    { id: "t-alternativa", kind: "alternative", description: "TC por Glasgow limítrofe, mas com antibiótico antes", commands: [act(50, "acesso_venoso"), act(150, "acesso_venoso"), test(160, "hemocultura"), rx(200, "dexametasona", "amp10", 10, "mg", "IV"), rx(210, "ceftriaxona", "fa1g", 2000, "mg", "IV"), test(300, "tc_cranio"), act(600, "notificacao")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-atb-precoce" }, description: "melhora" }, { condition: { not: { ruleFired: "r-tc-atraso" } }, description: "TC sem atrasar antibiótico" }] }
  ]
};
