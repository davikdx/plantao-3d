import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const ANTICOAG = { any: [{ drugGiven: "rivaroxabana" }, { drugGiven: "enoxaparina" }] };

export const C118: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C118",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Mulher com a panturrilha inchada e dolorida dez dias depois de imobilizar o joelho",
  teachingTitle: "Edema de membro com dor e fatores de risco — probabilidade clínica (Wells), ultrassom ou D-dímero conforme a probabilidade, anticoagulação com checagem renal, pesquisa de TEP e critérios de alta",
  group: "Outras urgências",
  specialties: ["Clínica médica", "Cirurgia vascular", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 2,
  level: "internato",
  objectives: [
    "Calcular a probabilidade pré-teste (Wells) e escolher entre D-dímero e ultrassom",
    "Pesquisar sintomas de TEP e sinais de gravidade (flegmasia)",
    "Iniciar anticoagulação após checar função renal, plaquetas e risco de sangramento",
    "Não tratar como celulite sem considerar TVP",
    "Definir alta segura com seguimento em 2–3 dias"
  ],
  keywords: ["perna inchada", "panturrilha", "dor", "imobilização", "joelho", "edema"],
  patient: {
    name: "Patrícia Gomes",
    ageYears: 47,
    sex: "feminino",
    weightKg: 82,
    heightCm: 165,
    visual: { ageGroup: "adulto", sex: "feminino", skinTone: 3, hairStyle: "longo", hairColor: "castanho", build: "obeso", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Mulher de 47 anos com dor e inchaço na perna esquerda há 3 dias. Há 10 dias torceu o joelho e usou imobilizador rígido por uma semana, andando pouco. Usa anticoncepcional combinado.",
  communication: "normal",
  informants: [{ id: "paciente", name: "Patrícia", role: "Paciente" }],
  history: [
    hi("h-perna", "inicio", "Como começou o inchaço e a dor? Teve ferida, vermelhidão ou febre?", [{ source: "paciente", text: "Foi inchando a panturrilha e dói ao andar. Não teve ferida nem febre." }], ["inchaço", "dor", "ferida", "vermelhidão", "febre"]),
    hi("h-risco", "fatores_associados", "Ficou imobilizada, operou, viajou? Usa hormônio? Câncer? Já teve trombose?", [{ source: "paciente", text: "Fiquei com imobilizador uma semana, quase sem andar. Tomo anticoncepcional há anos. Nunca tive trombose nem câncer." }], ["imobilizada", "cirurgia", "viagem", "hormônio", "anticoncepcional", "câncer", "trombose"]),
    hi("h-tep", "sinais_alarme", "Falta de ar, dor no peito ao respirar, tosse com sangue, desmaio, palpitação?", [{ source: "paciente", text: "Não, nada disso." }], ["falta de ar", "peito", "tosse", "sangue", "desmaio"]),
    hi("h-sangramento", "antecedentes", "Tem algum sangramento, úlcera, AVC, doença do rim ou do fígado? Usa outros remédios?", [{ source: "paciente", text: "Nada disso. Só o anticoncepcional." }], ["sangramento", "úlcera", "avc", "rim", "fígado"])
  ],
  initial: {
    vars: { hr: 88, sbp: 124, dbp: 78, rr: 16, spo2: 98, temp: 36.9, gcs: 15, pain: 5, glucose: 98, perfusion: 0.9, effort: 0.1, creat: 0.8, plt: 248000 },
    flags: { rhythm: "sinusal", posture: "sentado", painVisual: "moderada", speech: "frases", consciousness: "alerta", edema: true },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-perna", "membro_inferior_e", "inspecao", "Panturrilha esquerda 4 cm mais grossa que a direita (10 cm abaixo da tuberosidade tibial); edema depressível unilateral; dor à palpação no trajeto venoso profundo; sem eritema ou calor localizado; sem lesão de pele; pulsos presentes; perfusão normal.", { label: "Membros inferiores (medida e palpação)" }),
    ex("e-torax", "torax_anterior", "ausculta", "Murmúrio vesicular presente, sem ruídos adventícios.", { sound: "murmurio_normal" }),
    ex("e-coracao", "coracao", "ausculta", "Ritmo regular, bulhas normais.", { sound: "bulhas_normais" })
  ],
  testResults: [
    { testId: "usg_doppler_venoso_mmii", variants: [{ text: "Veia poplítea e femoral superficial esquerdas não compressíveis com trombo — TVP proximal." }] },
    { testId: "dimero_d", variants: [{ text: "Elevado (inespecífico; na TVP provável, não substitui o ultrassom)." }] },
    { testId: "funcao_renal", variants: [{ text: "Creatinina 0,8; ClCr estimado > 90 mL/min." }] },
    { testId: "hemograma", variants: [{ text: "Hb 13,1; plaquetas 248.000." }] },
    { testId: "coagulograma", variants: [{ text: "TP e TTPa normais." }] }
  ],
  highlightedActions: [],
  rules: [
    { id: "r-anticoag", description: "Anticoagulação iniciada", priority: 30, when: ANTICOAG, repeat: "once", effects: [trend("pain", 3, 3600, "ac", 30), outcome("melhora")] },
    { id: "r-sem-renal", description: "Rivaroxabana sem checar função renal", priority: 35, when: { all: [{ drugGiven: "rivaroxabana" }, { not: { testCollected: "funcao_renal" } }] }, repeat: "once", effects: [obs("Antes da rivaroxabana, verificar creatinina (evitar se ClCr < 30) e plaquetas.")] },
    { id: "r-celulite", description: "Tratada como celulite", priority: 35, when: { all: [{ drugGiven: "cefalexina" }, { not: ANTICOAG }] }, repeat: "once", effects: [obs("Edema unilateral com dor no trajeto venoso, imobilização e estrogênio, sem febre ou eritema: TVP é o diagnóstico principal.")] },
    { id: "r-tep", description: "Sem anticoagulação: TEP", priority: 25, when: { all: [{ time: "gte", seconds: 3000 }, { not: ANTICOAG }] }, repeat: "once", effects: [trend("spo2", 91, 600, "tep", 25), trend("hr", 114, 600, "tep", 25), trend("rr", 26, 600, "tep", 25), staff("paciente", "Doutor, de repente fiquei com falta de ar e dor no peito ao respirar."), outcome("piora")] },
    { id: "r-alta-sem", description: "Alta sem anticoagulação", priority: 50, when: { all: [{ any: [{ path: "disposition", op: "eq", value: "alta_orientada" }, { path: "disposition", op: "eq", value: "alta_com_seguimento_ubs" }, { path: "disposition", op: "eq", value: "retorno_programado" }] }, { not: ANTICOAG }] }, repeat: "once", effects: [obs("TVP proximal sem anticoagulação: alto risco de TEP."), outcome("complicacao")] }
  ],
  diagnosis: { primary: "trombose_venosa_profunda", accepted: ["trombose_venosa_profunda"], differentials: ["celulite", "tep", "fasciite_necrosante", "fratura_femur"] },
  acceptedDestinations: ["alta_com_seguimento_ubs", "alta_orientada"],
  outcomeNotes: "TVP proximal (poplítea/femoral) provocada por imobilização e estrogênio; Wells 4 (provável) → ultrassom direto. Sem sintomas de TEP, estável, sem contraindicação: rivaroxabana 15 mg 12/12 h por 21 dias (após creatinina e plaquetas) ou enoxaparina 1 mg/kg 12/12 h; suspender estrogênio e discutir contracepção; anticoagular por 3 meses; alta com retorno em 2–3 dias e sinais de alarme de TEP/sangramento.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Quadro local e fatores de risco", evidence: { kind: "historyAsked", items: ["h-perna", "h-risco"], minCount: 2 }, points: 10, severity: "critica", rationale: "Itens do Wells.", sourceIds: ["INT-WIKEM-TVP-2026"] },
    { id: "s-tep", domain: "historia", description: "Sintomas de TEP", evidence: { kind: "historyAsked", items: ["h-tep"], minCount: 1 }, points: 8, severity: "critica", rationale: "Muda o destino." },
    { id: "s-sangr", domain: "historia", description: "Risco de sangramento", evidence: { kind: "historyAsked", items: ["h-sangramento"], minCount: 1 }, points: 6, severity: "importante", rationale: "Contraindicações.", sourceIds: ["INT-WIKEM-TVP-2026"] },
    { id: "s-exame", domain: "historia", description: "Medida da panturrilha e palpação venosa", evidence: { kind: "examDone", regions: ["membro_inferior_e"], minCount: 1 }, points: 10, severity: "critica", rationale: "Wells." },
    { id: "s-usg", domain: "exames", description: "Ultrassom venoso (Wells provável)", evidence: { kind: "testOrdered", anyOf: ["usg_doppler_venoso_mmii"], withinSeconds: 1800 }, points: 18, severity: "critica", rationale: "Wells ≥ 2: ultrassom.", sourceIds: ["INT-WIKEM-TVP-2026"] },
    { id: "s-renal", domain: "exames", description: "Creatinina e plaquetas antes do anticoagulante", evidence: { kind: "testOrdered", anyOf: ["funcao_renal", "hemograma"] }, points: 8, severity: "importante", rationale: "Dose/contraindicação.", sourceIds: ["INT-WIKEM-TVP-2026"] },
    { id: "s-anticoag", domain: "tratamento", description: "Anticoagulação", evidence: { kind: "drugGiven", anyOf: ["rivaroxabana", "enoxaparina"] }, points: 20, severity: "critica", rationale: "TVP proximal.", sourceIds: ["INT-WIKEM-TVP-2026"] },
    { id: "s-orient", domain: "destino", description: "Orientações (TEP, sangramento, estrogênio)", evidence: { kind: "actionDone", anyOf: ["orientacoes_alta"] }, points: 6, severity: "importante", rationale: "Alta segura." },
    { id: "s-tep-f", domain: "tratamento", description: "Falha: TEP por atraso", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-tep" } }, points: 12, penalty: true, severity: "critica", rationale: "Sem anticoagulação." },
    { id: "s-cel", domain: "tratamento", description: "Falha: tratada como celulite", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-celulite" } }, points: 6, penalty: true, severity: "importante", rationale: "Diagnóstico errado." },
    { id: "s-dx", domain: "destino", description: "TVP", evidence: { kind: "diagnosis", accepted: ["trombose_venosa_profunda"] }, points: 8, severity: "importante", rationale: "Confirmada por ultrassom." },
    { id: "s-destino", domain: "destino", description: "Alta anticoagulada com retorno em 2–3 dias", evidence: { kind: "disposition", accepted: ["alta_com_seguimento_ubs", "alta_orientada"] }, points: 6, severity: "importante", rationale: "Critérios de alta.", sourceIds: ["INT-WIKEM-TVP-2026"] }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Some os itens do Wells: imobilização, edema, diferença de panturrilha, dor no trajeto." },
      { level: 2, text: "TVP provável: D-dímero ou ultrassom?" },
      { level: 3, text: "Antes do anticoagulante oral: o que checar?" },
      { level: 4, text: "Sugestão explícita: história, sintomas de TEP, sangramento, exame com medida, ultrassom, creatinina/hemograma, rivaroxabana ou enoxaparina, orientações, retorno." }
    ],
    summary: "TVP proximal provocada (imobilização + estrogênio) em paciente estável.",
    pathophysiology: "Tríade de Virchow: estase (imobilização), hipercoagulabilidade (estrogênio) e lesão endotelial. Trombos proximais (poplítea e acima) têm alto risco de embolia pulmonar.",
    keyPoints: [
      "Wells ≤ 1: D-dímero; ≥ 2: ultrassom.",
      "TVP proximal: anticoagular por 3 meses (rivaroxabana, apixabana, heparina/varfarina).",
      "Checar creatinina e plaquetas; rivaroxabana evitada se ClCr < 30.",
      "Pesquisar TEP; internar se flegmasia, TEP sintomático, alto risco de sangramento ou TFG < 30.",
      "Suspender estrogênio e orientar contracepção sem estrogênio."
    ],
    alternatives: ["Enoxaparina 1 mg/kg 12/12 h com transição para varfarina.", "Apixabana 10 mg 12/12 h por 7 dias e depois 5 mg 12/12 h."],
    oralRubric: [
      { id: "o1", concept: "Wells", synonyms: ["wells", "probabilidade", "pré-teste"], weight: 3 },
      { id: "o2", concept: "Ultrassom", synonyms: ["ultrassom", "doppler", "compressão"], weight: 2 },
      { id: "o3", concept: "Anticoagulação", synonyms: ["rivaroxabana", "enoxaparina", "anticoagular", "3 meses"], weight: 3 },
      { id: "o4", concept: "TEP/alta", synonyms: ["tep", "embolia", "retorno", "estrogênio"], weight: 2 }
    ],
    simplifications: ["Escore de Wells calculado pelo aluno.", "Duração e escolha final do anticoagulante não avaliadas."]
  },
  references: ["INT-WIKEM-TVP-2026", "INT-USMEC-2024", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: false, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "História, TEP, sangramento, exame, USG, creatinina/hemograma, rivaroxabana, orientações, retorno", commands: [ask(10, "h-perna"), ask(20, "h-risco"), ask(30, "h-tep"), ask(40, "h-sangramento"), { atSeconds: 50, type: "examine", payload: { region: "membro_inferior_e", maneuver: "inspecao" } }, test(60, "usg_doppler_venoso_mmii"), test(70, "funcao_renal"), test(80, "hemograma"), rx(2000, "rivaroxabana", "cp15", 15, "mg", "VO"), act(2010, "orientacoes_alta"), dx(2100, "trombose_venosa_profunda"), dest(2200, "alta_com_seguimento_ubs")], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-anticoag" }, description: "anticoagulação" }, { condition: { not: { ruleFired: "r-sem-renal" } }, description: "função renal checada" }, { condition: { not: { ruleFired: "r-tep" } }, description: "sem TEP" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-tep" }, description: "TEP" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Trata como celulite e dá alta", commands: [ask(10, "h-perna"), rx(200, "cefalexina", "cp500", 500, "mg", "VO"), dest(600, "alta_com_seguimento_ubs")], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-celulite" }, description: "celulite" }, { condition: { ruleFired: "r-alta-sem" }, description: "alta sem anticoagulação" }] },
    { id: "t-atraso", kind: "delay", description: "Rivaroxabana sem exames, após sintomas de TEP; internação", commands: [ask(10, "h-perna"), test(1500, "usg_doppler_venoso_mmii"), rx(3200, "rivaroxabana", "cp15", 15, "mg", "VO"), dest(3500, "internacao_enfermaria")], runUntilSeconds: 4000, expect: [{ condition: { ruleFired: "r-tep" }, description: "TEP" }, { condition: { ruleFired: "r-sem-renal" }, description: "sem função renal" }] },
    { id: "t-alternativa", kind: "alternative", description: "Enoxaparina enquanto aguarda USG", commands: [ask(10, "h-risco"), ask(20, "h-sangramento"), { atSeconds: 30, type: "examine", payload: { region: "membro_inferior_e", maneuver: "inspecao" } }, test(40, "hemograma"), test(50, "funcao_renal"), rx(400, "enoxaparina", "ser80", 1, "mg/kg", "SC"), test(500, "usg_doppler_venoso_mmii"), dest(2500, "alta_orientada")], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-anticoag" }, description: "anticoagulação" }] }
  ]
};
