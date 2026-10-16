import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, obs, outcome, rx, staff, test, trend } from "./helpers";

const PA_CONTROLE = { any: [{ drugGiven: "metoprolol" }, { treatmentActive: "nitroprussiato" }] };
const ANTITROMBO = { any: [{ drugGiven: "aas" }, { drugGiven: "enoxaparina" }, { drugGiven: "heparina" }] };

export const C027: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C027",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "A pior dor de cabeça da vida, que começou de repente na academia",
  teachingTitle: "Cefaleia em trovoada — hemorragia subaracnóidea: TC precoce, controle da PA, nimodipino e neurocirurgia",
  group: "Neurologia",
  specialties: ["Neurologia", "Neurocirurgia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Reconhecer cefaleia em trovoada como sinal de alarme",
    "Solicitar TC sem contraste precoce (e punção lombar se TC negativa após 6 h)",
    "Controlar dor, náusea e PA para reduzir ressangramento",
    "Iniciar nimodipino e evitar antitrombóticos",
    "Encaminhar para neurocirurgia/neurorradiologia via regulação"
  ],
  keywords: ["dor de cabeça", "pior da vida", "nuca", "vômito", "súbita"],
  patient: {
    name: "Juliana Batista",
    ageYears: 44,
    sex: "feminino",
    weightKg: 64,
    heightCm: 165,
    visual: { ageGroup: "adulto", sex: "feminino", skinTone: 2, hairStyle: "longo", hairColor: "castanho", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional (TC disponível; neurocirurgia vascular apenas no hospital de referência). Mulher de 44 anos com cefaleia súbita e intensa há 3 horas, iniciada durante exercício, com vômitos.",
  communication: "normal",
  history: [
    h("h-inicio", "inicio", "A dor começou de repente? Em quanto tempo chegou ao máximo?", "Foi como uma explosão: em segundos já estava no máximo.", { keywords: ["repente", "máximo", "segundos", "explosão"] }),
    h("h-pior", "intensidade", "É a pior dor de cabeça da sua vida?", "Disparado a pior. Nunca tive nada parecido.", { keywords: ["pior", "intensidade"] }),
    h("h-associados", "fatores_associados", "Teve desmaio, convulsão, rigidez no pescoço, vômitos?", "Vomitei três vezes; o pescoço está duro. Não desmaiei.", { keywords: ["desmaio", "convulsão", "pescoço", "vômito"] }),
    h("h-antecedentes", "antecedentes", "Tem pressão alta, fuma, alguém na família teve aneurisma?", "Fumo. Minha mãe morreu de aneurisma.", { keywords: ["pressão", "fuma", "aneurisma"] }),
    h("h-medicacoes", "medicacoes", "Usa anticoagulante ou AAS?", "Não.", { keywords: ["anticoagulante", "aas"] }),
    h("h-alergias", "alergias", "Tem alergia?", "Não.")
  ],
  initial: {
    vars: { hr: 96, sbp: 178, dbp: 98, rr: 18, spo2: 98, temp: 37.0, gcs: 15, pain: 10, glucose: 132, perfusion: 0.85, effort: 0.2, na: 138 },
    flags: { rhythm: "sinusal", posture: "supino", painVisual: "intensa", speech: "frases", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-neuro", "neurologico", "especial", "Glasgow 15, sem déficits focais; rigidez de nuca presente; fotofobia.", { label: "Neurológico e meníngeo", better: [{ when: { ruleFired: "r-ressangramento" }, text: "Glasgow 8, pupila direita maior que a esquerda." }] }),
    ex("e-olhos", "olhos", "inspecao", "Pupilas isocóricas; sem paralisia de III par.", {}),
    ex("e-pele", "pele", "inspecao", "Sem petéquias ou exantema.", {})
  ],
  testResults: [
    { testId: "tc_cranio", variants: [{ text: "Hiperdensidade nas cisternas basais e fissura sylviana bilateral (hemorragia subaracnóidea, padrão aneurismático); sem hidrocefalia significativa. (Laudo educativo.)" }] },
    { testId: "angio_tc_cranio", variants: [{ text: "Aneurisma sacular de 7 mm na artéria comunicante anterior. (Laudo educativo.)" }] },
    { testId: "ecg12", variants: [{ text: "Ritmo sinusal 96 bpm; inversão difusa de onda T (alteração neurogênica possível).", ecg: { rhythm: "sinusal", rate: 96, stElevationLeads: [], stDepressionLeads: [], peakedT: false, wideQrs: false } }] }
  ],
  highlightedActions: ["monitorizar", "acesso_venoso", "avaliar_glasgow", "acionar_samu"],
  rules: [
    { id: "r-analgesia", description: "Analgesia e antiemético", when: { any: [{ drugGiven: "morfina" }, { drugGiven: "dipirona" }, { drugGiven: "paracetamol" }] }, repeat: "once", effects: [trend("pain", 5, 600, "analg", 40), trend("sbp", 168, 600, "analg", 20)] },
    { id: "r-pa", description: "Controle da PA (alvo PAS < 160)", priority: 50, when: PA_CONTROLE, repeat: "once", effects: [trend("sbp", 146, 600, "pa", 50), trend("dbp", 84, 600, "pa", 50)] },
    { id: "r-ressangramento", description: "Sem controle de PA em 60 min: ressangramento", priority: 80, when: { all: [{ time: "gte", seconds: 3600 }, { not: PA_CONTROLE }] }, repeat: "once", effects: [trend("gcs", 8, 300, "ress", 80), flag("consciousness", "dor"), flag("speech", "nenhuma"), trend("sbp", 196, 300, "ress", 80), staff("enfermagem", "Ela teve uma nova dor súbita e agora não abre os olhos!"), outcome("complicacao")] },
    { id: "r-antitrombo", description: "Antitrombótico na HSA: risco de expansão", priority: 85, when: ANTITROMBO, repeat: "once", effects: [obs("Antitrombótico em hemorragia subaracnóidea: risco de ressangramento/expansão."), trend("gcs", 12, 900, "anti", 70)] },
    { id: "r-nimodipino", description: "Nimodipino iniciado", when: { drugGiven: "nimodipino" }, repeat: "once", effects: [obs("Nimodipino iniciado: reduz isquemia cerebral tardia (efeito em dias)."), trend("sbp", 150, 600, "nimo", 30)] },
    { id: "r-regulacao", description: "Regulação para neurocirurgia", when: { actionCompleted: "acionar_samu" }, repeat: "once", effects: [staff("regulacao", "Regulação: neurocirurgia do hospital de referência aceita HSA para angiografia e tratamento do aneurisma; USA em 30 min. Manter PAS < 160."), outcome("transferencia_segura")] }
  ],
  diagnosis: { primary: "hemorragia_subaracnoidea", accepted: ["hemorragia_subaracnoidea"], differentials: ["enxaqueca", "meningite_bacteriana", "avc_hemorragico", "urgencia_hipertensiva_lesao"] },
  acceptedDestinations: ["transferencia_regulada"],
  outcomeNotes: "Cefaleia em trovoada (máxima em segundos) com rigidez de nuca: HSA até prova em contrário. TC sem contraste precoce; angio-TC; analgesia, antiemético, PAS < 160, nimodipino; sem antitrombóticos; regulação para tratamento do aneurisma (endovascular/cirúrgico).",
  scoring: [
    { id: "s-trovoada", domain: "historia", description: "Caracterizou o início em trovoada", evidence: { kind: "historyAsked", items: ["h-inicio", "h-pior"], minCount: 1 }, points: 8, severity: "critica", rationale: "Pico em < 1 min é sinal de alarme.", sourceIds: ["INT-AHA-HSA-2023"] },
    { id: "s-hist", domain: "historia", description: "Sinais associados e fatores de risco", evidence: { kind: "historyAsked", items: ["h-associados", "h-antecedentes", "h-medicacoes"], minCount: 2 }, points: 5, severity: "importante", rationale: "Rigidez, tabagismo, história familiar." },
    { id: "s-exame", domain: "historia", description: "Exame neurológico e meníngeo", evidence: { kind: "examDone", regions: ["neurologico", "olhos"], minCount: 1 }, points: 5, severity: "importante", rationale: "Gravidade (Hunt-Hess/WFNS)." },
    { id: "s-tc", domain: "priorizacao", description: "TC de crânio sem contraste em até 15 min", evidence: { kind: "testOrdered", anyOf: ["tc_cranio"], withinSeconds: 900 }, points: 12, severity: "critica", rationale: "Sensibilidade alta nas primeiras horas.", sourceIds: ["INT-AHA-HSA-2023"] },
    { id: "s-angio", domain: "exames", description: "Angio-TC", evidence: { kind: "testOrdered", anyOf: ["angio_tc_cranio"] }, points: 6, severity: "importante", rationale: "Localiza o aneurisma." },
    { id: "s-exames", domain: "exames", description: "Sem punção lombar desnecessária (TC positiva)", evidence: { kind: "testsNotExcessive", maxUnjustified: 1, justified: ["tc_cranio", "angio_tc_cranio", "ecg12", "hemograma", "coagulograma", "eletrolitos", "funcao_renal", "troponina"] }, points: 4, severity: "menor", rationale: "PL só se TC negativa." },
    { id: "s-pa", domain: "tratamento", description: "Controle de PA (PAS < 160)", evidence: { kind: "stateAtEnd", when: PA_CONTROLE }, points: 10, severity: "critica", rationale: "Reduz risco de ressangramento antes do tratamento do aneurisma.", sourceIds: ["INT-AHA-HSA-2023"] },
    { id: "s-analgesia", domain: "tratamento", description: "Analgesia e antiemético", evidence: { kind: "drugGiven", anyOf: ["morfina", "dipirona", "paracetamol", "ondansetrona"] }, points: 5, severity: "importante", rationale: "Dor e vômitos elevam PA." },
    { id: "s-nimodipino", domain: "tratamento", description: "Nimodipino", evidence: { kind: "drugGiven", anyOf: ["nimodipino"] }, points: 6, severity: "importante", rationale: "Melhora desfecho neurológico.", sourceIds: ["INT-AHA-HSA-2023"] },
    { id: "s-antitrombo", domain: "tratamento", description: "Falha: antitrombótico", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-antitrombo" } }, points: 8, penalty: true, severity: "critica", rationale: "Contraindicado na HSA." },
    { id: "s-reav", domain: "reavaliacao", description: "Glasgow seriado", evidence: { kind: "actionDone", anyOf: ["avaliar_glasgow"] }, points: 10, severity: "importante", rationale: "Ressangramento/hidrocefalia." },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de HSA", evidence: { kind: "diagnosis", accepted: ["hemorragia_subaracnoidea"] }, points: 5, severity: "importante", rationale: "TC com sangue nas cisternas." },
    { id: "s-destino", domain: "destino", description: "Regulação para neurocirurgia", evidence: { kind: "disposition", accepted: ["transferencia_regulada"] }, points: 6, severity: "critica", rationale: "Tratamento precoce do aneurisma." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Quanto tempo a dor levou para chegar ao máximo?" },
      { level: 2, text: "Qual exame e quando ele é mais sensível?" },
      { level: 3, text: "O que mais mata nas primeiras horas?" },
      { level: 4, text: "Sugestão explícita: TC, angio-TC, analgesia, ondansetrona, PAS < 160, nimodipino, sem antitrombóticos, regulação." }
    ],
    summary: "Mulher de 44 anos, tabagista com história familiar de aneurisma, com cefaleia em trovoada, vômitos e rigidez de nuca: HSA por aneurisma de comunicante anterior.",
    pathophysiology: "Ruptura de aneurisma sacular extravasa sangue no espaço subaracnóideo, elevando subitamente a pressão intracraniana (cefaleia explosiva, vômitos, síncope). Complicações: ressangramento (precoce), hidrocefalia, vasoespasmo/isquemia tardia (dias 3–14), hiponatremia.",
    keyPoints: [
      "Cefaleia em trovoada = investigar HSA.",
      "TC sem contraste precoce; PL se TC negativa após 6 h.",
      "PAS < 160, analgesia, antiemético; nimodipino.",
      "Sem antitrombóticos.",
      "Tratamento precoce do aneurisma em centro de referência."
    ],
    alternatives: ["Outros anti-hipertensivos tituláveis (nicardipina, labetalol) quando disponíveis."],
    oralRubric: [
      { id: "o1", concept: "Cefaleia em trovoada", synonyms: ["trovoada", "súbita", "pior da vida"], weight: 2 },
      { id: "o2", concept: "TC precoce", synonyms: ["tomografia", "tc", "punção"], weight: 2 },
      { id: "o3", concept: "Controle da PA e nimodipino", synonyms: ["160", "pressão", "nimodipino"], weight: 2 },
      { id: "o4", concept: "Neurocirurgia", synonyms: ["neurocirurgia", "aneurisma", "embolização", "clipagem"], weight: 2 }
    ],
    simplifications: ["Ressangramento aos 60 min sem controle de PA é didático.", "Vasoespasmo não modelado (ocorre em dias)."]
  },
  references: ["INT-AHA-HSA-2023", "BR-SAMU", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 10, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "TC, analgesia, PA, nimodipino, angio-TC e regulação", commands: [ask(10, "h-inicio"), ask(20, "h-associados"), { atSeconds: 30, type: "examine", payload: { region: "neurologico", maneuver: "especial" } }, test(40, "tc_cranio"), act(50, "monitorizar"), act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(200, "morfina", "amp10", 3, "mg", "IV"), rx(210, "ondansetrona", "amp4", 4, "mg", "IV"), rx(300, "metoprolol", "amp5", 5, "mg", "IV"), test(2500, "angio_tc_cranio"), rx(2600, "nimodipino", "cp30", 60, "mg", "VO"), act(2700, "acionar_samu"), act(2800, "avaliar_glasgow"), dx(3000, "hemorragia_subaracnoidea"), dest(3000, "transferencia_regulada")], runUntilSeconds: 4000, expect: [{ condition: { ruleFired: "r-pa" }, description: "PA controlada" }, { condition: { not: { ruleFired: "r-ressangramento" } }, description: "sem ressangramento" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 3700, expect: [{ condition: { ruleFired: "r-ressangramento" }, description: "ressangramento" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Tratado como enxaqueca com AAS", commands: [rx(100, "aas", "cp100", 500, "mg", "VO"), rx(110, "dipirona", "cp500", 1000, "mg", "VO")], runUntilSeconds: 3700, expect: [{ condition: { ruleFired: "r-antitrombo" }, description: "antitrombótico" }, { condition: { ruleFired: "r-ressangramento" }, description: "ressangramento" }] },
    { id: "t-atraso", kind: "delay", description: "Controle de PA só aos 55 min", commands: [test(40, "tc_cranio"), act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(3300, "metoprolol", "amp5", 5, "mg", "IV")], runUntilSeconds: 4000, expect: [{ condition: { ruleFired: "r-pa" }, description: "PA controlada" }, { condition: { not: { ruleFired: "r-ressangramento" } }, description: "ressangramento evitado no limite" }] },
    { id: "t-alternativa", kind: "alternative", description: "Nitroprussiato para a PA", commands: [test(40, "tc_cranio"), act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(300, "dipirona", "amp1g", 1000, "mg", "IV"), rx(400, "nitroprussiato", "sol200", 50, "mg", "IV", "infusao", { rate: { value: 0.5, unit: "mcg/kg/min" } }), act(2700, "acionar_samu")], runUntilSeconds: 4000, expect: [{ condition: { ruleFired: "r-pa" }, description: "PA controlada" }] }
  ]
};
