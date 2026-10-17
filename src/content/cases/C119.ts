import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const SUSPENDE = { actionCompleted: "suspender_medicacao_desencadeante" };
const VOLUME = { any: [{ drugGiven: "sf09", minTotal: { value: 1000, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 1000, unit: "mL" as const } }] };

export const C119: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C119",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Mulher com febre, bolhas na pele e feridas na boca duas semanas após começar um remédio novo",
  teachingTitle: "Lesões cutâneas com febre após fármaco novo — reconhecer SSJ/NET (descolamento, Nikolsky, mucosas), suspender o agente, suporte como grande queimado, avaliar olhos, SCORTEN e UTI/unidade de queimados",
  group: "Outras urgências",
  specialties: ["Dermatologia", "Medicina intensiva", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Perguntar sobre todos os fármacos iniciados nas últimas semanas",
    "Reconhecer sinais de gravidade: dor cutânea, bolhas, Nikolsky, ≥ 2 mucosas, descolamento",
    "Suspender imediatamente o fármaco suspeito",
    "Suporte como grande queimado: fluidos, analgesia, cuidados de pele/olhos, controle de infecção",
    "Calcular gravidade (área, SCORTEN) e internar em UTI ou unidade de queimados"
  ],
  keywords: ["bolhas", "feridas na boca", "febre", "remédio novo", "pele", "olhos vermelhos"],
  patient: {
    name: "Ana Paula Ribeiro",
    ageYears: 42,
    sex: "feminino",
    weightKg: 64,
    heightCm: 162,
    visual: { ageGroup: "adulto", sex: "feminino", skinTone: 2, hairStyle: "longo", hairColor: "castanho", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional (UTI geral; centro de queimados na referência). Mulher de 42 anos com febre e mal-estar há 4 dias; há 2 dias manchas doloridas no tronco que estão virando bolhas, feridas na boca e olhos vermelhos. Começou carbamazepina há 16 dias para neuralgia do trigêmeo.",
  communication: "normal",
  informants: [{ id: "paciente", name: "Ana Paula", role: "Paciente" }],
  history: [
    hi("h-farmacos", "medicacoes", "Que remédios começou nos últimos 2 meses, inclusive por conta própria?", [{ source: "paciente", text: "Carbamazepina há 16 dias, para a dor no rosto. E dipirona e ibuprofeno para a febre nesses dias." }], ["remédio", "começou", "carbamazepina", "novo", "conta própria"]),
    hi("h-evolucao", "evolucao", "Como as lesões começaram e evoluíram? Doem? Descola a pele?", [{ source: "paciente", text: "Primeiro febre e dor de garganta, depois manchas vermelho-arroxeadas no peito que doem e soltam a pele quando esfrego." }], ["começaram", "evoluíram", "doem", "descola"]),
    hi("h-mucosas", "fatores_associados", "Tem feridas na boca, olhos, genitais? Dor ao urinar ou engolir?", [{ source: "paciente", text: "Boca toda ferida, não consigo comer. Olhos ardendo e vermelhos. Ardência na região íntima." }], ["boca", "olhos", "genitais", "engolir", "urinar"]),
    hi("h-antecedentes", "antecedentes", "Já teve reação a remédio? Tem HIV, câncer, outras doenças?", [{ source: "paciente", text: "Nunca tive reação. Sem outras doenças conhecidas." }], ["reação", "hiv", "câncer", "doença"])
  ],
  initial: {
    vars: { hr: 116, sbp: 108, dbp: 66, rr: 20, spo2: 96, temp: 38.8, gcs: 15, pain: 8, glucose: 138, perfusion: 0.75, effort: 0.2, hco3: 21, urea: 44, wbc: 9800 },
    flags: { rhythm: "taquicardia_sinusal", rash: true, posture: "supino", painVisual: "intensa", speech: "frases", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-pele", "pele", "inspecao", "Máculas eritematovioláceas confluentes em tronco e raiz de membros com lesões em alvo atípicas, bolhas flácidas e áreas de descolamento (~8% da superfície corporal); Nikolsky positivo.", { label: "Pele", better: [{ when: { ruleFired: "r-progressao" }, text: "Descolamento em ~35% da superfície corporal (NET)." }] }),
    ex("e-boca", "boca", "inspecao", "Erosões hemorrágicas em lábios e mucosa oral; crostas labiais.", { label: "Mucosa oral" }),
    ex("e-olhos", "olhos", "inspecao", "Conjuntivite bilateral com secreção e erosões; sem úlcera de córnea visível.", { label: "Olhos" }),
    ex("e-genital", "pelve", "inspecao", "Erosões vulvares.", { label: "Genital" })
  ],
  testResults: [
    { testId: "hemograma", variants: [{ text: "Leucócitos 9.800, sem eosinofilia; Hb 12,6; plaquetas 190.000." }] },
    { testId: "funcao_renal", variants: [{ text: "Ureia 44, creatinina 1,0." }] },
    { testId: "eletrolitos", variants: [{ text: "Na 136, K 4,0." }] },
    { testId: "gaso_venosa", variants: [{ text: "pH 7,36, HCO3 21." }] },
    { testId: "hepatograma", variants: [{ text: "Transaminases discretamente elevadas." }] }
  ],
  highlightedActions: ["suspender_medicacao_desencadeante", "cuidados_pele_mucosas", "solicitar_oftalmologia"],
  rules: [
    { id: "r-suspende", description: "Fármaco suspenso", priority: 30, when: SUSPENDE, repeat: "once", effects: [staff("enfermagem", "Carbamazepina suspensa e registrada como alergia grave no prontuário.")] },
    { id: "r-volume", description: "Reposição volêmica", priority: 30, when: VOLUME, repeat: "once", effects: [trend("hr", 102, 1200, "vol", 30), trend("sbp", 118, 1200, "vol", 30)] },
    { id: "r-suporte", description: "Suporte completo", priority: 40, when: { all: [SUSPENDE, VOLUME, { actionCompleted: "cuidados_pele_mucosas" }] }, repeat: "once", effects: [staff("supervisor", "Suporte iniciado; vaga em UTI/centro de queimados solicitada."), outcome("estabilizacao_parcial")] },
    { id: "r-progressao", description: "Fármaco mantido/atraso: progressão para NET", priority: 35, when: { all: [{ time: "gte", seconds: 2400 }, { not: SUSPENDE }] }, repeat: "once", effects: [trend("hr", 128, 900, "net", 35), trend("sbp", 96, 900, "net", 35), obs("A cada dia de exposição ao fármaco a mortalidade aumenta; suspender imediatamente."), outcome("piora")] },
    { id: "r-alta", description: "Alta como virose", priority: 50, when: { any: [{ path: "disposition", op: "eq", value: "alta_orientada" }, { path: "disposition", op: "eq", value: "alta_com_seguimento_ubs" }] }, repeat: "once", effects: [obs("Descolamento cutâneo com mucosas acometidas: SSJ/NET — internação em UTI ou unidade de queimados."), outcome("complicacao")] }
  ],
  diagnosis: { primary: "sjs_nets", accepted: ["sjs_nets"], differentials: ["dress", "exantema_viral", "urticaria_aguda", "anafilaxia", "febre_maculosa"] },
  acceptedDestinations: ["uti", "transferencia_regulada"],
  outcomeNotes: "Síndrome de Stevens-Johnson (≈ 8% de descolamento, 3 mucosas) por carbamazepina iniciada há 16 dias. Suspender carbamazepina (e AINE), registrar alergia, fluidos como queimado, analgesia, cuidados de pele/olhos/boca, oftalmologia, exames para SCORTEN (FC, ureia, bicarbonato, glicose), UTI ou centro de queimados; terapias imunomoduladoras discutidas com especialista.",
  scoring: [
    { id: "s-farm", domain: "historia", description: "Fármacos novos", evidence: { kind: "historyAsked", items: ["h-farmacos"], minCount: 1 }, points: 12, severity: "critica", rationale: "Causa mais comum; latência 1–3 semanas.", sourceIds: ["INT-WIKEM-SSJ-2026"] },
    { id: "s-evol", domain: "historia", description: "Evolução e mucosas", evidence: { kind: "historyAsked", items: ["h-evolucao", "h-mucosas"], minCount: 2 }, points: 8, severity: "critica", rationale: "Dor cutânea, descolamento, mucosas." },
    { id: "s-exame", domain: "historia", description: "Pele (Nikolsky, área), boca, olhos, genital", evidence: { kind: "examDone", regions: ["pele", "boca", "olhos", "pelve"], minCount: 3 }, points: 10, severity: "critica", rationale: "Extensão e mucosas.", sourceIds: ["INT-WIKEM-SSJ-2026"] },
    { id: "s-suspende", domain: "tratamento", description: "Suspender o fármaco", evidence: { kind: "actionDone", anyOf: ["suspender_medicacao_desencadeante"], withinSeconds: 1200 }, points: 18, severity: "critica", rationale: "Medida que mais reduz mortalidade.", sourceIds: ["INT-WIKEM-SSJ-2026"] },
    { id: "s-volume", domain: "tratamento", description: "Fluidos IV", evidence: { kind: "drugGiven", anyOf: ["sf09", "ringer_lactato"], withinSeconds: 1800 }, points: 8, severity: "importante", rationale: "Perdas como queimado.", sourceIds: ["INT-WIKEM-SSJ-2026"] },
    { id: "s-pele", domain: "tratamento", description: "Cuidados de pele e mucosas", evidence: { kind: "actionDone", anyOf: ["cuidados_pele_mucosas"] }, points: 8, severity: "importante", rationale: "Infecção e dor.", sourceIds: ["INT-WIKEM-SSJ-2026"] },
    { id: "s-analg", domain: "tratamento", description: "Analgesia", evidence: { kind: "drugGiven", anyOf: ["morfina", "dipirona"] }, points: 4, severity: "importante", rationale: "Dor cutânea intensa." },
    { id: "s-oftalmo", domain: "destino", description: "Oftalmologia", evidence: { kind: "actionDone", anyOf: ["solicitar_oftalmologia"] }, points: 6, severity: "importante", rationale: "Sequelas oculares." },
    { id: "s-labs", domain: "exames", description: "Exames para SCORTEN", evidence: { kind: "testOrdered", anyOf: ["funcao_renal", "gaso_venosa", "hemograma", "eletrolitos"] }, points: 6, severity: "importante", rationale: "Prognóstico.", sourceIds: ["INT-WIKEM-SSJ-2026"] },
    { id: "s-progr", domain: "tratamento", description: "Falha: fármaco mantido", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-progressao" } }, points: 12, penalty: true, severity: "critica", rationale: "Progressão para NET." },
    { id: "s-alta", domain: "destino", description: "Falha: alta como virose", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-alta" } }, points: 12, penalty: true, severity: "critica", rationale: "Emergência dermatológica." },
    { id: "s-dx", domain: "destino", description: "SSJ/NET", evidence: { kind: "diagnosis", accepted: ["sjs_nets"] }, points: 10, severity: "importante", rationale: "Descolamento < 10% = SSJ." },
    { id: "s-destino", domain: "destino", description: "UTI ou centro de queimados", evidence: { kind: "disposition", accepted: ["uti", "transferencia_regulada"] }, points: 10, severity: "critica", rationale: "Cuidado especializado.", sourceIds: ["INT-WIKEM-SSJ-2026"] }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Febre, lesões dolorosas e mucosas após 2 semanas de remédio novo: qual o diagnóstico grave?" },
      { level: 2, text: "Esfregue a pele perilesional: ela descola?" },
      { level: 3, text: "Qual é a medida mais importante agora?" },
      { level: 4, text: "Sugestão explícita: história de fármacos, exame de pele e mucosas, suspender carbamazepina, acesso, fluidos, analgesia, cuidados de pele, oftalmologia, exames, UTI/centro de queimados." }
    ],
    summary: "SSJ por carbamazepina com acometimento oral, ocular e genital.",
    pathophysiology: "Reação de hipersensibilidade tardia mediada por linfócitos T citotóxicos (granulisina, Fas-FasL) causa apoptose maciça de queratinócitos e descolamento epidérmico; a perda da barreira gera perdas hidroeletrolíticas, dor e risco de sepse, como em grandes queimados. Certos alelos HLA aumentam o risco com carbamazepina.",
    keyPoints: [
      "Suspender o fármaco suspeito imediatamente.",
      "SSJ < 10% da superfície; NET > 30%.",
      "Suporte como queimado: fluidos, analgesia, cuidados de pele, controle de infecção.",
      "Olhos e mucosas exigem avaliação especializada.",
      "UTI/centro de queimados; SCORTEN para prognóstico; imunomoduladores controversos."
    ],
    alternatives: ["Transferência regulada para centro de queimados.", "Imunomodulação (etanercepte, IVIG, ciclosporina) a critério do especialista."],
    oralRubric: [
      { id: "o1", concept: "Fármaco causal", synonyms: ["carbamazepina", "fármaco", "suspender"], weight: 3 },
      { id: "o2", concept: "Reconhecimento", synonyms: ["nikolsky", "descolamento", "mucosas", "bolhas"], weight: 3 },
      { id: "o3", concept: "Suporte", synonyms: ["queimado", "fluidos", "curativo", "infecção"], weight: 2 },
      { id: "o4", concept: "Destino/prognóstico", synonyms: ["uti", "scorten", "queimados"], weight: 2 }
    ],
    simplifications: ["Área de descolamento estimada no exame.", "Terapias imunomoduladoras não modeladas."]
  },
  references: ["INT-WIKEM-SSJ-2026", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Fármacos, exame, suspender, acesso, fluidos, analgesia, pele, oftalmo, exames, UTI", commands: [ask(10, "h-farmacos"), ask(20, "h-evolucao"), ask(30, "h-mucosas"), { atSeconds: 40, type: "examine", payload: { region: "pele", maneuver: "inspecao" } }, { atSeconds: 50, type: "examine", payload: { region: "boca", maneuver: "inspecao" } }, { atSeconds: 60, type: "examine", payload: { region: "olhos", maneuver: "inspecao" } }, act(70, "suspender_medicacao_desencadeante"), act(200, "acesso_venoso"), rx(300, "ringer_lactato", "bolsa500", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), rx(320, "morfina", "amp10", 4, "mg", "IV"), act(340, "cuidados_pele_mucosas"), act(950, "solicitar_oftalmologia"), test(1140, "funcao_renal"), test(1150, "gaso_venosa"), dx(1300, "sjs_nets"), dest(4200, "uti")], runUntilSeconds: 4800, expect: [{ condition: { ruleFired: "r-suporte" }, description: "suporte" }, { condition: { not: { ruleFired: "r-progressao" } }, description: "sem progressão" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-progressao" }, description: "progressão" }] },
    { id: "t-inadequada", kind: "inadequate", description: "'Virose': antitérmico, prometazina e alta, mantendo carbamazepina", commands: [rx(100, "prometazina", "amp25", 25, "mg", "IM"), dest(1200, "alta_orientada")], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-alta" }, description: "alta" }, { condition: { ruleFired: "r-progressao" }, description: "progressão" }] },
    { id: "t-atraso", kind: "delay", description: "Suspensão tardia; transferência para queimados", commands: [act(60, "acesso_venoso"), rx(200, "sf09", "bolsa500", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), act(2600, "suspender_medicacao_desencadeante"), act(2700, "cuidados_pele_mucosas"), dest(4500, "transferencia_regulada")], runUntilSeconds: 5000, expect: [{ condition: { ruleFired: "r-progressao" }, description: "progressão" }, { condition: { ruleFired: "r-suporte" }, description: "suporte tardio" }] },
    { id: "t-alternativa", kind: "alternative", description: "SF, transferência para centro de queimados", commands: [ask(10, "h-farmacos"), act(20, "suspender_medicacao_desencadeante"), act(150, "acesso_venoso"), rx(250, "sf09", "bolsa500", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), act(260, "cuidados_pele_mucosas"), dest(4200, "transferencia_regulada")], runUntilSeconds: 4800, expect: [{ condition: { ruleFired: "r-suporte" }, description: "suporte" }] }
  ]
};
