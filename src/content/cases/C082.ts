import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const SALB1 = { drugGiven: "salbutamol", minTotal: { value: 1, unit: "mg" as const } };
const SALB3 = { drugGiven: "salbutamol", minTotal: { value: 3, unit: "mg" as const } };
const IPRA = { drugGiven: "ipratropio" };
const CORTICO = { any: [{ drugGiven: "prednisolona" }, { drugGiven: "metilprednisolona" }, { drugGiven: "dexametasona" }, { drugGiven: "hidrocortisona" }] };
const MG = { drugGiven: "sulfato_magnesio" };
const O2 = { any: [{ deviceActive: "cateter_nasal" }, { deviceActive: "mascara_reservatorio" }] };

export const C082: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C082",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Menino de 7 anos com chiado forte e cansaço para falar",
  teachingTitle: "Crise asmática grave na criança — O₂, salbutamol + ipratrópio repetidos, corticoide precoce, sulfato de magnésio se refratária e plano de alta",
  group: "Pediatria",
  specialties: ["Pediatria", "Emergência"],
  environment: "pediatria",
  resourceProfile: "upa-porte-ii",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Classificar a gravidade da crise (fala, esforço, SpO₂, ausculta)",
    "Ofertar O₂ para SpO₂ > 92% e salbutamol com espaçador (dose por peso) + ipratrópio a cada 20 min na primeira hora",
    "Dar corticoide sistêmico logo após o primeiro broncodilatador",
    "Usar sulfato de magnésio IV se não houver resposta; reconhecer sinais de falência",
    "Planejar alta segura (técnica inalatória, corticoide inalatório, seguimento)"
  ],
  keywords: ["chiado", "asma", "falta de ar", "criança", "bombinha", "cansaço"],
  patient: {
    name: "Pedro Henrique Lima",
    ageYears: 7,
    sex: "masculino",
    weightKg: 24,
    heightCm: 124,
    visual: { ageGroup: "escolar", sex: "masculino", skinTone: 3, hairStyle: "curto", hairColor: "preto", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "UPA 24 h porte II, sala de pediatria. Menino de 7 anos, asmático, trazido pela mãe com chiado e cansaço desde a madrugada após 2 dias de resfriado. Usou a 'bombinha' em casa 4 vezes sem melhora.",
  communication: "limitada",
  informants: [{ id: "mae", name: "Mãe", role: "Acompanhante" }],
  history: [
    hi("h-crise", "inicio", "Desde quando está assim? Quantas vezes usou a bombinha?", [{ source: "mae", text: "Começou de madrugada. Dei a bombinha azul umas 4 vezes, 2 jatos, sem espaçador. Não melhorou." }], ["quando", "bombinha", "jatos"]),
    hi("h-controle", "medicacoes", "Ele usa remédio de controle (bombinha de corticoide)?", [{ source: "mae", text: "Tinha a laranja, mas acabou faz 3 meses e não pegamos no posto." }], ["controle", "corticoide", "laranja"]),
    hi("h-gravidade", "antecedentes", "Já foi internado por asma? UTI? Usou corticoide recentemente?", [{ source: "mae", text: "Internou uma vez com 4 anos, sem UTI. Tomou prednisolona há 2 meses." }], ["internado", "uti", "corticoide"]),
    hi("h-febre", "fatores_associados", "Teve febre? Engasgou com algo?", [{ source: "mae", text: "Febre baixa ontem, coriza. Não engasgou." }], ["febre", "engasgou"]),
    hi("h-alergias", "alergias", "Tem alergia a remédio?", [{ source: "mae", text: "Não." }]),
    hi("h-peso", "antecedentes", "Sabe o peso dele?", [{ source: "mae", text: "Uns 24 quilos." }], ["peso"])
  ],
  initial: {
    vars: { hr: 142, sbp: 108, dbp: 64, rr: 40, spo2: 89, temp: 37.6, gcs: 15, pain: 2, glucose: 110, perfusion: 0.85, effort: 0.8, etco2: 36 },
    flags: { rhythm: "taquicardia_sinusal", posture: "sentado", painVisual: "leve", speech: "palavras", consciousness: "alerta", wheeze: true, agitation: true },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-resp", "torax_anterior", "inspecao", "Tiragem subcostal, intercostal e de fúrcula; batimento de asa nasal; fala apenas palavras; sentado inclinado para frente.", { label: "Esforço respiratório", better: [{ when: { ruleFired: "r-melhora" }, text: "Tiragem discreta; fala frases." }, { when: { ruleFired: "r-exaustao" }, text: "Movimentos respiratórios superficiais, sonolento." }] }),
    ex("e-ausculta", "torax_posterior", "ausculta", "Sibilos expiratórios e inspiratórios difusos, murmúrio diminuído em bases.", { sound: "sibilos", label: "Ausculta", better: [{ when: { ruleFired: "r-exaustao" }, text: "Murmúrio muito diminuído, quase sem sibilos (tórax silencioso)." }] }),
    ex("e-geral", "geral", "inspecao", "Ansioso, sudoreico, sem cianose central.", {}),
    ex("e-pele", "pele", "inspecao", "Sem urticária ou angioedema.", {})
  ],
  testResults: [
    { testId: "rx_torax", variants: [{ text: "Laudo educativo: hiperinsuflação; sem pneumotórax ou consolidação." }] },
    { testId: "gaso_venosa", variants: [{ text: "pH 7,35, pCO₂ 38 (normal em criança taquipneica = sinal de cansaço)." }] }
  ],
  highlightedActions: ["o2_cateter", "monitorizar", "oximetria_portatil", "nebulizacao_montar"],
  rules: [
    { id: "r-curso", description: "Broncoespasmo grave progressivo", priority: 10, when: { always: true }, repeat: "once", effects: [trend("spo2", 85, 2400, "asma", 10), trend("effort", 0.95, 2400, "asma", 10), trend("rr", 46, 2400, "asma", 10), trend("hr", 150, 2400, "asma", 10)] },
    { id: "r-o2", description: "Oxigênio", priority: 20, when: O2, repeat: "while", effects: [trend("spo2", 93, 120, "o2", 20)], onEnd: [{ type: "clearTrend", var: "spo2", slot: "o2" }] },
    { id: "r-salb1", description: "1ª dose de broncodilatador: resposta parcial", priority: 30, when: SALB1, repeat: "once", effects: [trend("effort", 0.65, 600, "bd1", 30), trend("rr", 36, 600, "bd1", 30), trend("spo2", 92, 600, "bd1", 30), trend("hr", 150, 300, "bd1", 30)] },
    { id: "r-salb3", description: "Broncodilatadores repetidos (+ ipratrópio)", priority: 35, when: { all: [SALB3, IPRA] }, repeat: "once", effects: [trend("effort", 0.45, 900, "bd3", 35), trend("rr", 32, 900, "bd3", 35), trend("spo2", 94, 900, "bd3", 35), flag("speech", "frases")] },
    { id: "r-melhora", description: "Broncodilatadores + corticoide: melhora sustentada", priority: 50, when: { all: [SALB3, CORTICO] }, repeat: "once", effects: [trend("effort", 0.3, 1800, "melhora", 50), trend("rr", 26, 1800, "melhora", 50), trend("spo2", 96, 1800, "melhora", 50), trend("hr", 120, 1800, "melhora", 50), flag("agitation", false), flag("speech", "frases"), { type: "changeCommunication", state: "normal" }, outcome("melhora")] },
    { id: "r-mg", description: "Sulfato de magnésio IV", priority: 45, when: MG, repeat: "once", effects: [trend("effort", 0.4, 900, "mg", 45), trend("spo2", 95, 900, "mg", 45)] },
    { id: "r-sem-cortico", description: "Broncodilatador sem corticoide: melhora transitória", priority: 15, when: { all: [{ time: "gte", seconds: 3600 }, SALB1, { not: CORTICO }] }, repeat: "once", effects: [trend("effort", 0.75, 900, "rebote", 40), trend("spo2", 90, 900, "rebote", 40), obs("Sem corticoide sistêmico, a inflamação persiste e a crise volta após o efeito do broncodilatador."), outcome("piora")] },
    { id: "r-exaustao", description: "Sem broncodilatador em 30 min: exaustão (tórax silencioso)", priority: 40, when: { all: [{ time: "gte", seconds: 1800 }, { not: SALB1 }] }, repeat: "once", effects: [trend("spo2", 82, 600, "exaust", 40), trend("etco2", 52, 900, "exaust", 40), trend("gcs", 12, 900, "exaust", 40), flag("wheeze", false), flag("consciousness", "voz"), flag("speech", "nenhuma"), staff("enfermagem", "Ele está ficando sonolento e quase não chia mais!"), outcome("piora")] },
    { id: "r-regulacao", description: "Regulação para leito pediátrico", priority: 20, when: { actionCompleted: "acionar_samu" }, repeat: "once", effects: [staff("regulacao", "Regulação: leito de pediatria disponível no hospital regional; transporte em USA com O₂ e nebulização.")] }
  ],
  diagnosis: { primary: "asma_pediatrica", accepted: ["asma_pediatrica", "asma_grave"], differentials: ["bronquiolite", "pneumonia", "aspiracao_corpo_estranho", "anafilaxia", "pneumotorax_espontaneo"] },
  acceptedDestinations: ["observacao", "transferencia_regulada"],
  outcomeNotes: "Crise asmática grave em escolar de 7 anos (24 kg) sem controlador há 3 meses, desencadeada por infecção viral e com técnica inalatória inadequada. O₂ para SpO₂ > 92%, salbutamol 10 jatos com espaçador + ipratrópio a cada 20 min por 1 h, corticoide sistêmico (prednisolona 1–2 mg/kg ou dexametasona 0,6 mg/kg), sulfato de magnésio 50 mg/kg IV se refratária, reavaliação; observação e, na alta, corticoide oral, espaçador, corticoide inalatório e seguimento na UBS em até 7 dias (ou regulação se não responder).",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Uso de broncodilatador, controlador e gravidade prévia", evidence: { kind: "historyAsked", items: ["h-crise", "h-controle", "h-gravidade"], minCount: 2 }, points: 6, severity: "importante", rationale: "Fatores de risco de crise fatal e de falha." },
    { id: "s-peso", domain: "historia", description: "Peso para doses", evidence: { kind: "historyAsked", items: ["h-peso"], minCount: 1 }, points: 3, severity: "menor", rationale: "Dose por peso." },
    { id: "s-exame", domain: "historia", description: "Esforço, ausculta e excluiu anafilaxia", evidence: { kind: "examDone", regions: ["torax_anterior", "torax_posterior", "pele"], minCount: 2 }, points: 6, severity: "importante", rationale: "Gravidade." },
    { id: "s-o2", domain: "priorizacao", description: "O₂ e oximetria em até 3 min", evidence: { kind: "actionDone", anyOf: ["o2_cateter", "o2_mascara_reservatorio"], withinSeconds: 180 }, points: 8, severity: "critica", rationale: "SpO₂ 89%.", sourceIds: ["INT-TREKK-ASMA-2024"] },
    { id: "s-salb", domain: "tratamento", description: "Salbutamol (dose por peso) em até 5 min", evidence: { kind: "drugGiven", anyOf: ["salbutamol"], withinSeconds: 300 }, points: 14, severity: "critica", rationale: "≥ 20 kg: 10 jatos com espaçador.", sourceIds: ["INT-TREKK-ASMA-2024"] },
    { id: "s-salb3", domain: "tratamento", description: "Três doses na primeira hora", evidence: { kind: "drugGiven", anyOf: ["salbutamol"], minTotal: { value: 3, unit: "mg" }, withinSeconds: 3600 }, points: 8, severity: "importante", rationale: "A cada 20 min × 3.", sourceIds: ["INT-TREKK-ASMA-2024"] },
    { id: "s-ipra", domain: "tratamento", description: "Ipratrópio associado", evidence: { kind: "drugGiven", anyOf: ["ipratropio"], withinSeconds: 1800 }, points: 6, severity: "importante", rationale: "Crise grave.", sourceIds: ["INT-TREKK-ASMA-2024"] },
    { id: "s-cortico", domain: "tratamento", description: "Corticoide sistêmico em até 30 min", evidence: { kind: "drugGiven", anyOf: ["prednisolona", "metilprednisolona", "dexametasona", "hidrocortisona"], withinSeconds: 1800 }, points: 12, severity: "critica", rationale: "Após o primeiro broncodilatador.", sourceIds: ["INT-TREKK-ASMA-2024"] },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou após broncodilatadores", evidence: { kind: "reassessAfter", after: ["salbutamol"], reassess: ["torax_anterior", "torax_posterior", "oximetria_portatil", "monitorizar"], withinSeconds: 1500 }, points: 8, severity: "importante", rationale: "Escore de gravidade após 1 h." },
    { id: "s-exames", domain: "exames", description: "Sem exames desnecessários", evidence: { kind: "testsNotExcessive", maxUnjustified: 1, justified: ["gaso_venosa", "rx_torax"] }, points: 3, severity: "menor", rationale: "RX só se suspeita de complicação." },
    { id: "s-orient", domain: "destino", description: "Plano de alta (técnica, espaçador, controlador, seguimento)", evidence: { kind: "actionDone", anyOf: ["orientacoes_alta"] }, points: 6, severity: "importante", rationale: "Prevenir nova crise.", sourceIds: ["INT-TREKK-ASMA-2024"] },
    { id: "s-dx", domain: "destino", description: "Crise asmática grave", evidence: { kind: "diagnosis", accepted: ["asma_pediatrica", "asma_grave"] }, points: 4, severity: "importante", rationale: "Fala palavras, SpO₂ < 92%." },
    { id: "s-destino", domain: "destino", description: "Observação (ou regulação se não responder)", evidence: { kind: "disposition", accepted: ["observacao", "transferencia_regulada"] }, points: 6, severity: "importante", rationale: "Não liberar sem período de observação após crise grave." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Ele fala só palavras e a saturação é 89%: qual a gravidade?" },
      { level: 2, text: "A bombinha funcionou em casa? Como ele usou?" },
      { level: 3, text: "Broncodilatador abre; o que trata a inflamação?" },
      { level: 4, text: "Sugestão explícita: O₂, salbutamol 10 jatos + ipratrópio a cada 20 min × 3, prednisolona 1–2 mg/kg, reavaliar, magnésio IV se sem resposta, orientar e observar." }
    ],
    summary: "Escolar de 7 anos com asma não controlada (sem corticoide inalatório há 3 meses) e crise grave desencadeada por infecção viral.",
    pathophysiology: "Na crise, broncoespasmo, edema e muco reduzem o fluxo; o aprisionamento de ar aumenta o trabalho respiratório. pCO₂ normal em criança taquipneica indica fadiga. O broncodilatador reverte o espasmo; o corticoide trata a inflamação (efeito em horas); o magnésio relaxa a musculatura lisa nas crises refratárias.",
    keyPoints: [
      "Gravidade: fala, esforço, SpO₂, ausculta (tórax silencioso é sinal de alarme).",
      "O₂ para SpO₂ > 92%; salbutamol com espaçador (5 jatos < 20 kg; 10 jatos ≥ 20 kg) + ipratrópio a cada 20 min × 3.",
      "Corticoide sistêmico logo após o primeiro broncodilatador.",
      "Magnésio IV 50 mg/kg (máx. 2 g) se refratária.",
      "Alta: técnica com espaçador, corticoide oral, corticoide inalatório e seguimento em até 7 dias."
    ],
    alternatives: ["Nebulização com salbutamol 5 mg + ipratrópio 250 mcg quando o espaçador não for possível.", "Dexametasona 0,6 mg/kg (máx. 12 mg) em vez de prednisolona."],
    oralRubric: [
      { id: "o1", concept: "Gravidade", synonyms: ["grave", "fala palavras", "saturação", "tiragem"], weight: 2 },
      { id: "o2", concept: "Broncodilatador repetido", synonyms: ["salbutamol", "espaçador", "20 minutos", "ipratrópio"], weight: 3 },
      { id: "o3", concept: "Corticoide precoce", synonyms: ["prednisolona", "corticoide", "dexametasona"], weight: 2 },
      { id: "o4", concept: "Plano de alta", synonyms: ["controle", "corticoide inalatório", "espaçador", "seguimento"], weight: 1 }
    ],
    simplifications: ["A dose de salbutamol por spray com espaçador é registrada em microgramas.", "Escore PRAM não é calculado automaticamente."]
  },
  references: ["INT-TREKK-ASMA-2024", "INT-GINA", "BR-ASMA", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 3, allowSexSwap: true, allowWeightPercent: 10, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "O₂, salbutamol + ipratrópio × 3, prednisolona, reavaliação, orientação, observação", commands: [act(5, "o2_cateter", { fluxo: 3 }), act(10, "oximetria_portatil"), ask(20, "h-crise"), ask(30, "h-controle"), ask(40, "h-peso"), { atSeconds: 50, type: "examine", payload: { region: "torax_anterior", maneuver: "inspecao" } }, { atSeconds: 60, type: "examine", payload: { region: "torax_posterior", maneuver: "ausculta" } }, rx(80, "salbutamol", "spray100", 1000, "mcg", "inalatoria"), act(100, "nebulizacao_montar"), rx(150, "ipratropio", "neb025", 0.25, "mg", "nebulizacao"), rx(300, "prednisolona", "sol3", 40, "mg", "VO"), rx(1280, "salbutamol", "spray100", 1000, "mcg", "inalatoria"), rx(2480, "salbutamol", "spray100", 1000, "mcg", "inalatoria"), { atSeconds: 2700, type: "examine", payload: { region: "torax_posterior", maneuver: "ausculta" } }, act(4000, "orientacoes_alta"), dx(4100, "asma_pediatrica"), dest(4200, "observacao")], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-melhora" }, description: "melhora sustentada" }, { condition: { not: { ruleFired: "r-exaustao" } }, description: "sem exaustão" }, { condition: { path: "vars.spo2", op: "gte", value: 94 }, description: "SpO₂ ≥ 94" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-exaustao" }, description: "exaustão" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Só um broncodilatador em dose baixa, sem corticoide, alta", commands: [rx(100, "salbutamol", "spray100", 1000, "mcg", "inalatoria"), dest(1200, "alta_orientada")], runUntilSeconds: 4500, expect: [{ condition: { ruleFired: "r-sem-cortico" }, description: "rebote sem corticoide" }] },
    { id: "t-atraso", kind: "delay", description: "Broncodilatador só após exaustão; magnésio", commands: [act(30, "acesso_venoso"), act(1900, "o2_mascara_reservatorio", { fluxo: 10 }), rx(1950, "salbutamol", "neb5", 5, "mg", "nebulizacao"), rx(2000, "metilprednisolona", "fa125", 48, "mg", "IV"), rx(2100, "sulfato_magnesio", "amp50", 50, "mg/kg", "IV", "infusao_volume", { durationMinutes: 20 }), rx(3150, "salbutamol", "neb5", 5, "mg", "nebulizacao"), rx(4350, "salbutamol", "neb5", 5, "mg", "nebulizacao"), act(4400, "acionar_samu"), dest(4600, "transferencia_regulada")], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-exaustao" }, description: "exaustão pelo atraso" }, { condition: { ruleFired: "r-mg" }, description: "magnésio" }, { condition: { ruleFired: "r-melhora" }, description: "melhora tardia" }] },
    { id: "t-alternativa", kind: "alternative", description: "Nebulização com salbutamol + ipratrópio e dexametasona oral", commands: [act(10, "o2_cateter", { fluxo: 3 }), act(20, "nebulizacao_montar"), rx(60, "salbutamol", "neb5", 5, "mg", "nebulizacao"), rx(70, "ipratropio", "neb025", 0.25, "mg", "nebulizacao"), rx(200, "dexametasona", "elixir", 12, "mg", "VO"), rx(1260, "salbutamol", "neb5", 5, "mg", "nebulizacao"), rx(2460, "salbutamol", "neb5", 5, "mg", "nebulizacao"), dest(4000, "observacao")], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-melhora" }, description: "melhora sustentada" }] }
  ]
};
