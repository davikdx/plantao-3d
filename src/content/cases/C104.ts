import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const SUSPENDE = { actionCompleted: "suspender_medicacao_desencadeante" };
const VOLUME = { any: [{ drugGiven: "sf09", minTotal: { value: 1000, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 1000, unit: "mL" as const } }] };
const RESFRIA = { actionCompleted: "resfriamento" };

export const C104: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C104",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Homem em tratamento psiquiátrico com febre alta, corpo 'duro' e confusão",
  teachingTitle: "Síndrome neuroléptica maligna — reconhecer hipertermia, rigidez, alteração mental e disautonomia após antipsicótico; suspender o agente, resfriar, hidratar, CK/função renal e UTI",
  group: "Psiquiatria",
  specialties: ["Psiquiatria", "Medicina intensiva", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 4,
  level: "residencia",
  objectives: [
    "Reconhecer a síndrome neuroléptica maligna em usuário de antipsicótico com febre, rigidez e alteração mental",
    "Diferenciar de síndrome serotoninérgica, infecção do SNC, sepse e hipertermia por outras causas",
    "Suspender o antipsicótico e não administrar novas doses",
    "Resfriamento, hidratação liberal, monitorização; CK, função renal, eletrólitos",
    "Internar em UTI; discutir terapias específicas"
  ],
  keywords: ["febre", "rígido", "confuso", "tratamento psiquiátrico", "suando", "injeção"],
  patient: {
    name: "Anderson Ramos",
    ageYears: 34,
    sex: "masculino",
    weightKg: 78,
    heightCm: 176,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 4, hairStyle: "crespo_curto", hairColor: "preto", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Homem de 34 anos com esquizofrenia trazido pela mãe: há 2 dias está 'duro', com febre alta, suando, falando pouco e confuso. Há 5 dias recebeu haloperidol injetável no CAPS por agitação e a dose oral foi aumentada.",
  communication: "incapaz",
  informants: [{ id: "mae", name: "Dona Lúcia", role: "Mãe" }],
  history: [
    hi("h-medicacoes", "medicacoes", "Quais remédios ele usa? Houve mudança recente?", [{ source: "mae", text: "Haloperidol em comprimido; aumentaram a dose semana passada e deram uma injeção de haloperidol há 5 dias porque estava agitado. Também toma biperideno às vezes." }], ["remédio", "mudança", "haloperidol", "injeção", "dose"]),
    hi("h-evolucao", "evolucao", "Como os sintomas apareceram?", [{ source: "mae", text: "Primeiro ficou travado, andando duro, depois veio a febre e foi ficando confuso. Está suando muito e quase não bebe água." }], ["como", "começou", "apareceram", "travado"]),
    hi("h-infeccao", "sinais_alarme", "Teve tosse, dor ao urinar, diarreia, dor de cabeça, manchas na pele, convulsão?", [{ source: "mae", text: "Nada disso. Sem diarreia. Não vi convulsão." }], ["tosse", "urinar", "diarreia", "dor de cabeça", "manchas"]),
    hi("h-outras", "habitos", "Usou outra droga, antidepressivo, remédio para enjoo ou para enxaqueca?", [{ source: "mae", text: "Não usa droga. Antidepressivo não." }], ["droga", "antidepressivo", "enjoo", "enxaqueca"]),
    hi("h-urina", "alimentacao_eliminacoes", "Está urinando? A urina mudou de cor?", [{ source: "mae", text: "Pouco, e a urina está escura, cor de coca-cola." }], ["urinando", "urina", "cor"])
  ],
  initial: {
    vars: { hr: 128, sbp: 168, dbp: 96, rr: 26, spo2: 94, temp: 39.8, gcs: 11, pain: 3, glucose: 112, perfusion: 0.7, effort: 0.4, cpk: 14800, creat: 1.9, k: 5.2, wbc: 16400, urine: 20 },
    flags: { rhythm: "taquicardia_sinusal", sweating: true, posture: "supino", painVisual: "leve", speech: "palavras", consciousness: "voz", agitation: false },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-neuro", "neurologico", "inspecao", "Rigidez em 'cano de chumbo' generalizada; reflexos normais; sem clônus; sem mioclonias; bradicinesia; sem sinais focais; rigidez de nuca ausente.", { label: "Neurológico (tônus, reflexos, clônus)" }),
    ex("e-olhos", "olhos", "inspecao", "Pupilas normais, fotorreagentes (sem midríase).", { label: "Pupilas" }),
    ex("e-pele", "pele", "inspecao", "Sudorese profusa; pele quente; sem rash; sem sinais de injeção infectada.", { label: "Pele" }),
    ex("e-abdome", "abdome_qid", "ausculta", "Ruídos hidroaéreos normais (sem hiperperistaltismo).", { sound: "ruidos_hidroaereos" }),
    ex("e-torax", "torax_anterior", "ausculta", "Murmúrio vesicular presente; sem estertores.", { sound: "murmurio_normal" })
  ],
  testResults: [
    { testId: "cpk", variants: [{ text: "CK muito elevada (rabdomiólise)." }] },
    { testId: "funcao_renal", variants: [{ when: VOLUME, text: "Creatinina em estabilização após hidratação." }, { text: "Creatinina 1,9 (lesão renal aguda)." }] },
    { testId: "eletrolitos", variants: [{ text: "Na 146, K 5,2." }] },
    { testId: "hemograma", variants: [{ text: "Leucocitose 16.400 sem desvio." }] },
    { testId: "hepatograma", variants: [{ text: "AST e ALT elevadas (padrão muscular)." }] },
    { testId: "urina_tipo1", variants: [{ text: "Sangue +++ na fita com raras hemácias no sedimento (sugere mioglobinúria)." }] },
    { testId: "tc_cranio", variants: [{ text: "Sem alterações." }] },
    { testId: "hemocultura", variants: [{ text: "Sem crescimento em 48 h." }] }
  ],
  highlightedActions: ["monitorizar", "suspender_medicacao_desencadeante", "resfriamento", "acesso_venoso"],
  rules: [
    { id: "r-curso", description: "SNM em progressão", priority: 10, when: { always: true }, repeat: "once", effects: [trend("temp", 40.6, 2400, "inv", 10), trend("cpk", 26000, 3600, "inv", 10), trend("creat", 2.8, 3600, "inv", 10), trend("k", 5.9, 3600, "inv", 10)] },
    { id: "r-volume", description: "Hidratação liberal", priority: 30, when: VOLUME, repeat: "once", effects: [trend("urine", 90, 1800, "vol", 30), trend("creat", 1.6, 3600, "vol", 30), trend("k", 4.8, 3600, "vol", 30), trend("hr", 112, 1200, "vol", 30)] },
    { id: "r-resfria", description: "Resfriamento", priority: 30, when: RESFRIA, repeat: "once", effects: [trend("temp", 38.6, 1800, "fr", 30)] },
    { id: "r-estabiliza", description: "Agente suspenso + suporte", priority: 40, when: { all: [SUSPENDE, VOLUME, RESFRIA] }, repeat: "once", effects: [trend("cpk", 9000, 5400, "est", 40), staff("supervisor", "Suporte iniciado e antipsicótico suspenso. Vaga de UTI e discussão de terapia específica (bromocriptina/dantroleno)."), outcome("estabilizacao_parcial")] },
    { id: "r-falencia", description: "Sem suporte: hipertermia e falência renal", priority: 35, when: { all: [{ time: "gte", seconds: 2100 }, { not: VOLUME }] }, repeat: "once", effects: [trend("temp", 41.2, 600, "fal", 35), trend("gcs", 8, 900, "fal", 35), trend("k", 6.6, 1200, "fal", 35), trend("urine", 5, 900, "fal", 35), staff("enfermagem", "Temperatura 41 °C, quase não urinou, está mais rebaixado."), outcome("piora")] },
    { id: "r-novo-antipsicotico", description: "Nova dose de antipsicótico", priority: 50, when: { any: [{ drugGiven: "haloperidol" }, { drugGiven: "risperidona" }] }, repeat: "once", effects: [trend("temp", 41.5, 600, "ap", 50), obs("Antipsicótico na SNM agrava o quadro: o agente deve ser suspenso."), outcome("complicacao")] },
    { id: "r-alta", description: "Alta/CAPS", priority: 55, when: { any: [{ path: "disposition", op: "eq", value: "alta_orientada" }, { path: "disposition", op: "eq", value: "caps" }, { path: "disposition", op: "eq", value: "internacao_enfermaria" }] }, repeat: "once", effects: [obs("SNM com rabdomiólise e lesão renal exige UTI."), outcome("complicacao")] }
  ],
  diagnosis: { primary: "sindrome_neuroleptica_maligna", accepted: ["sindrome_neuroleptica_maligna"], differentials: ["sindrome_serotoninergica", "meningite_bacteriana", "sepse", "intox_estimulante", "abstinencia_alcool"] },
  acceptedDestinations: ["uti"],
  outcomeNotes: "Síndrome neuroléptica maligna após aumento de haloperidol e dose injetável: hipertermia, rigidez em cano de chumbo, rebaixamento, disautonomia, rabdomiólise com mioglobinúria e lesão renal. Suspender antipsicóticos, monitor, O2, acesso, hidratação liberal, resfriamento, CK/função renal/eletrólitos, excluir infecção (hemocultura; TC/LCR conforme suspeita) e UTI; terapia específica discutida com a equipe.",
  scoring: [
    { id: "s-med", domain: "historia", description: "Medicações e mudança recente", evidence: { kind: "historyAsked", items: ["h-medicacoes"], minCount: 1 }, points: 10, severity: "critica", rationale: "Exposição ao neuroléptico.", sourceIds: ["INT-LITFL-SNM"] },
    { id: "s-evol", domain: "historia", description: "Evolução, infecção e outras drogas", evidence: { kind: "historyAsked", items: ["h-evolucao", "h-infeccao", "h-outras"], minCount: 2 }, points: 6, severity: "importante", rationale: "Diferenciais (sepse, serotoninérgica)." },
    { id: "s-exame", domain: "historia", description: "Tônus, reflexos/clônus e pupilas", evidence: { kind: "examDone", regions: ["neurologico", "olhos", "pele"], minCount: 2 }, points: 8, severity: "critica", rationale: "Rigidez vs clônus/hiper-reflexia.", sourceIds: ["INT-LITFL-SNM"] },
    { id: "s-suspende", domain: "tratamento", description: "Suspender antipsicótico", evidence: { kind: "actionDone", anyOf: ["suspender_medicacao_desencadeante"], withinSeconds: 1200 }, points: 14, severity: "critica", rationale: "Retirada do precipitante.", sourceIds: ["INT-LITFL-SNM"] },
    { id: "s-volume", domain: "tratamento", description: "Hidratação liberal", evidence: { kind: "drugGiven", anyOf: ["sf09", "ringer_lactato"], minTotal: { value: 1000, unit: "mL" }, withinSeconds: 1800 }, points: 12, severity: "critica", rationale: "Rabdomiólise e desidratação.", sourceIds: ["INT-LITFL-SNM"] },
    { id: "s-resfria", domain: "tratamento", description: "Resfriamento", evidence: { kind: "actionDone", anyOf: ["resfriamento"], withinSeconds: 1200 }, points: 8, severity: "critica", rationale: "Hipertermia.", sourceIds: ["INT-LITFL-SNM"] },
    { id: "s-mon", domain: "priorizacao", description: "Monitor e O2", evidence: { kind: "actionDone", anyOf: ["monitorizar", "o2_cateter", "o2_mascara_reservatorio"], withinSeconds: 300 }, points: 4, severity: "importante", rationale: "Disautonomia." },
    { id: "s-ck", domain: "exames", description: "CK", evidence: { kind: "testOrdered", anyOf: ["cpk"] }, points: 8, severity: "critica", rationale: "Rabdomiólise." },
    { id: "s-renal", domain: "exames", description: "Função renal e eletrólitos", evidence: { kind: "testOrdered", anyOf: ["funcao_renal", "eletrolitos"] }, points: 6, severity: "importante", rationale: "Lesão renal e hipercalemia." },
    { id: "s-infec", domain: "exames", description: "Excluir infecção", evidence: { kind: "testOrdered", anyOf: ["hemocultura", "hemograma", "urina_tipo1"] }, points: 4, severity: "importante", rationale: "Sepse é diferencial." },
    { id: "s-falencia", domain: "tratamento", description: "Falha: falência por falta de suporte", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-falencia" } }, points: 10, penalty: true, severity: "critica", rationale: "Suporte tardio." },
    { id: "s-antipsi", domain: "tratamento", description: "Falha: novo antipsicótico", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-novo-antipsicotico" } }, points: 12, penalty: true, severity: "critica", rationale: "Agrava a SNM.", sourceIds: ["INT-LITFL-SNM"] },
    { id: "s-dx", domain: "destino", description: "Síndrome neuroléptica maligna", evidence: { kind: "diagnosis", accepted: ["sindrome_neuroleptica_maligna"] }, points: 10, severity: "critica", rationale: "Tétrade clínica após neuroléptico." },
    { id: "s-destino", domain: "destino", description: "UTI", evidence: { kind: "disposition", accepted: ["uti"] }, points: 10, severity: "critica", rationale: "Risco de falência orgânica." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "O que mudou no tratamento psiquiátrico dias antes?" },
      { level: 2, text: "Rigidez em cano de chumbo ou clônus? Pupilas?" },
      { level: 3, text: "Urina cor de coca-cola: qual exame?" },
      { level: 4, text: "Sugestão explícita: suspender haloperidol, monitor, O2, acesso, SF 1 L e mais, resfriamento, CK, função renal, eletrólitos, hemocultura, UTI." }
    ],
    summary: "Síndrome neuroléptica maligna após aumento e dose parenteral de haloperidol, com rabdomiólise e lesão renal.",
    pathophysiology: "Bloqueio dopaminérgico D2 central (hipotálamo e núcleos da base) causa hipertermia, rigidez e disautonomia; a rigidez gera calor e rabdomiólise, com mioglobinúria e lesão renal. Desidratação e doses altas/parenterais aumentam o risco.",
    keyPoints: [
      "Febre + rigidez + alteração mental + disautonomia após antipsicótico.",
      "Serotoninérgica: início rápido, clônus, hiper-reflexia, midríase, diarreia.",
      "Suspender o agente; resfriar; hidratar liberalmente; monitorizar.",
      "CK, função renal, potássio; excluir infecção.",
      "UTI; terapias específicas (bromocriptina, amantadina, dantroleno) conforme equipe."
    ],
    alternatives: ["Benzodiazepínico para agitação (sem novo antipsicótico).", "Punção lombar se dúvida de meningoencefalite."],
    oralRubric: [
      { id: "o1", concept: "Tétrade", synonyms: ["febre", "rigidez", "confusão", "disautonomia"], weight: 3 },
      { id: "o2", concept: "Suspender", synonyms: ["suspender", "retirar", "haloperidol"], weight: 3 },
      { id: "o3", concept: "Suporte", synonyms: ["resfriamento", "hidratação", "uti"], weight: 2 },
      { id: "o4", concept: "Rabdomiólise", synonyms: ["ck", "cpk", "mioglobina", "rim"], weight: 2 }
    ],
    simplifications: ["Bromocriptina, amantadina e dantroleno não estão no catálogo.", "Valores numéricos de CK não exibidos no laudo."]
  },
  references: ["INT-LITFL-SNM", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "História, exame, suspender, monitor, O2, acesso, SF 2 L, resfriamento, CK/renal/infecção, UTI", commands: [ask(10, "h-medicacoes"), ask(20, "h-evolucao"), ask(30, "h-infeccao"), { atSeconds: 40, type: "examine", payload: { region: "neurologico", maneuver: "inspecao" } }, { atSeconds: 50, type: "examine", payload: { region: "olhos", maneuver: "inspecao" } }, act(60, "monitorizar"), act(70, "o2_cateter"), act(80, "suspender_medicacao_desencadeante"), act(200, "acesso_venoso"), rx(300, "sf09", "bolsa500", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 30 }), act(310, "resfriamento"), test(320, "cpk"), test(330, "funcao_renal"), test(340, "eletrolitos"), test(350, "hemocultura"), rx(2200, "sf09", "bolsa500", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), dx(2300, "sindrome_neuroleptica_maligna"), dest(2600, "uti")], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-estabiliza" }, description: "estabilização" }, { condition: { not: { ruleFired: "r-falencia" } }, description: "sem falência" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-falencia" }, description: "falência" }] },
    { id: "t-inadequada", kind: "inadequate", description: "'Agitação': mais haloperidol, dipirona e CAPS", commands: [rx(100, "haloperidol", "amp5", 5, "mg", "IM"), act(200, "acesso_venoso"), rx(300, "dipirona", "amp1g", 1000, "mg", "IV"), dest(1500, "caps")], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-novo-antipsicotico" }, description: "antipsicótico" }, { condition: { ruleFired: "r-alta" }, description: "destino inadequado" }, { condition: { ruleFired: "r-falencia" }, description: "falência" }] },
    { id: "t-atraso", kind: "delay", description: "Suporte tardio", commands: [act(60, "monitorizar"), test(300, "cpk"), act(1800, "acesso_venoso"), act(1900, "suspender_medicacao_desencadeante"), rx(2200, "sf09", "bolsa500", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 30 }), act(2250, "resfriamento"), dest(4000, "uti")], runUntilSeconds: 4800, expect: [{ condition: { ruleFired: "r-falencia" }, description: "falência" }, { condition: { ruleFired: "r-estabiliza" }, description: "estabilização tardia" }] },
    { id: "t-alternativa", kind: "alternative", description: "Ringer, resfriamento antes, TC de crânio para diferencial", commands: [act(20, "resfriamento"), act(30, "monitorizar"), act(40, "suspender_medicacao_desencadeante"), act(140, "acesso_venoso"), rx(240, "ringer_lactato", "bolsa500", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 30 }), test(300, "cpk"), test(310, "tc_cranio"), dest(2400, "uti")], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-estabiliza" }, description: "estabilização" }, { condition: { not: { ruleFired: "r-novo-antipsicotico" } }, description: "sem antipsicótico" }] }
  ]
};
