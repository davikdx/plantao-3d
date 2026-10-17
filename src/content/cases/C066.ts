import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const ATB = { any: [{ drugGiven: "piperacilina_tazobactam" }, { drugGiven: "ceftriaxona" }, { drugGiven: "cefepima" }] };
const VOL = { any: [{ drugGiven: "sf09", minTotal: { value: 500, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 500, unit: "mL" as const } }] };
const DRENAGEM = { actionCompleted: "solicitar_drenagem_biliar" };
const USG = { testCollected: "usg_abdome" };
const NORA = { treatmentActive: "noradrenalina" };

export const C066: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C066",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Senhora com dor do lado direito da barriga, febre com calafrios e olhos amarelos",
  teachingTitle: "Colangite aguda (TG18) — hemoculturas, antibiótico, ressuscitação, imagem e drenagem biliar no tempo certo",
  group: "Gastroenterologia",
  specialties: ["Cirurgia geral", "Gastroenterologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-referencia",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Diagnosticar colangite aguda pelos critérios de Tóquio (inflamação + colestase + imagem)",
    "Colher hemoculturas e iniciar antibiótico com cobertura de gram-negativos e anaeróbios",
    "Ressuscitar e reconhecer progressão para disfunção orgânica",
    "Confirmar obstrução biliar por imagem e indicar drenagem (endoscópica preferencial) no prazo adequado à gravidade"
  ],
  keywords: ["febre", "calafrio", "icterícia", "olho amarelo", "dor", "vesícula"],
  patient: {
    name: "Lourdes Nogueira",
    ageYears: 71,
    sex: "feminino",
    weightKg: 74,
    heightCm: 155,
    visual: { ageGroup: "idoso", sex: "feminino", skinTone: 2, hairStyle: "curto", hairColor: "grisalho", build: "obeso", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital de referência (endoscopia e radiologia intervencionista). Mulher de 71 anos com dor em hipocôndrio direito há 2 dias, febre com calafrios desde ontem e 'olhos amarelos' notados pela filha hoje.",
  communication: "normal",
  informants: [{ id: "filha", name: "Filha", role: "Acompanhante" }],
  history: [
    h("h-dor", "localizacao", "Onde dói e como é a dor?", "Aqui do lado direito, embaixo das costelas, vai pras costas. Começou depois do almoço de domingo.", { keywords: ["dói", "dor", "onde"] }),
    h("h-febre", "fatores_associados", "Teve febre, calafrios? Urina escura, fezes claras?", "Calafrio de bater o queixo ontem à noite. Urina cor de coca-cola, fezes bem claras.", { keywords: ["febre", "calafrio", "urina", "fezes"] }),
    h("h-vesicula", "antecedentes", "Já teve pedra na vesícula?", "O médico disse que tinha pedra, mandou operar há 2 anos, mas eu tive medo.", { keywords: ["vesícula", "pedra", "cálculo"] }),
    hi("h-medicacoes", "medicacoes", "Que remédios usa? Alergias?", [{ source: "filha", text: "Metformina, losartana. Sem alergia." }], ["remédio", "alergia"]),
    h("h-alcool", "habitos", "Bebe álcool?", "Não bebo.", { keywords: ["álcool", "bebe"] })
  ],
  initial: {
    vars: { hr: 112, sbp: 102, dbp: 58, rr: 22, spo2: 95, temp: 39.2, gcs: 15, pain: 7, glucose: 168, perfusion: 0.7, effort: 0.3, wbc: 18400, pcr: 18, bili: 5.6, ast: 210, alt: 260, plt: 168000, inr: 1.3, creat: 1.4, lactate: 2.6, na: 136, k: 3.9, hb: 12.9 },
    flags: { rhythm: "taquicardia_sinusal", posture: "supino", painVisual: "moderada", speech: "frases", consciousness: "alerta", jaundice: true, sweating: true },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-abdome", "abdome_qsd", "palpacao", "Dor à palpação em hipocôndrio direito sem Murphy franco; sem peritonite.", { label: "Hipocôndrio direito" }),
    ex("e-pele", "pele", "inspecao", "Icterícia de pele e escleras; escoriações de prurido.", { label: "Icterícia" }),
    ex("e-geral", "geral", "inspecao", "Febril, calafrios, prostrada; extremidades mornas.", {}),
    ex("e-neuro", "neurologico", "especial", "Lúcida e orientada.", { better: [{ when: { ruleFired: "r-grau3" }, text: "Sonolenta e desorientada." }] })
  ],
  testResults: [
    { testId: "usg_abdome", variants: [{ text: "Vesícula com múltiplos cálculos, parede fina; colédoco dilatado (12 mm) com cálculo distal de 10 mm; vias biliares intra-hepáticas dilatadas." }] },
    { testId: "hemocultura", variants: [{ text: "Coletadas (resultado em 48–72 h; depois: Escherichia coli)." }] },
    { testId: "lipase", variants: [{ text: "Lipase normal." }] },
    { testId: "tc_abdome", variants: [{ text: "Laudo educativo: dilatação de vias biliares até o colédoco distal com cálculo impactado; sem coleções." }] }
  ],
  highlightedActions: ["monitorizar", "acesso_venoso", "solicitar_drenagem_biliar"],
  rules: [
    { id: "r-curso", description: "Colangite com obstrução mantida", priority: 10, when: { always: true }, repeat: "once", effects: [trend("temp", 39.6, 2400, "col", 10), trend("hr", 124, 3600, "col", 10), trend("sbp", 84, 3600, "col", 10), trend("lactate", 3.6, 3600, "col", 10), trend("bili", 6.8, 7200, "col", 10)] },
    { id: "r-volume", description: "Cristaloide", priority: 25, when: VOL, repeat: "once", effects: [trend("sbp", 110, 1200, "vol", 25), trend("hr", 106, 1200, "vol", 25), trend("perfusion", 0.85, 1200, "vol", 25)] },
    { id: "r-atb", description: "Antibiótico: controle parcial (obstrução persiste)", priority: 30, when: ATB, repeat: "once", effects: [trend("temp", 38.3, 2400, "atb", 30), trend("lactate", 2.4, 3600, "atb", 30)] },
    { id: "r-atb-sem-cultura", description: "Antibiótico antes das hemoculturas", priority: 1, when: { all: [ATB, { not: { testCollected: "hemocultura" } }] }, repeat: "once", effects: [] },
    { id: "r-nora", description: "Noradrenalina", priority: 40, when: NORA, repeat: "while", effects: [trend("sbp", 108, 300, "nora", 40)], onEnd: [{ type: "clearTrend", var: "sbp", slot: "nora" }] },
    { id: "r-drenagem-sem-usg", description: "Endoscopista pede imagem", priority: 45, when: { all: [DRENAGEM, { not: USG }, { not: { testCollected: "tc_abdome" } }] }, repeat: "once", effects: [staff("supervisor", "Endoscopista: preciso de imagem mostrando dilatação/cálculo antes da CPRE — ultrassom à beira-leito resolve.")] },
    { id: "r-drenagem", description: "Drenagem biliar indicada com imagem", priority: 46, when: { all: [DRENAGEM, { any: [USG, { testCollected: "tc_abdome" }] }] }, repeat: "once", effects: [staff("supervisor", "Endoscopista: colangite grau II com coledocolitíase — CPRE com papilotomia e extração hoje; manter antibiótico.")] },
    { id: "r-desobstrucao", description: "Via biliar desobstruída + antibiótico: resolução", priority: 60, when: { all: [{ ruleFired: "r-drenagem" }, { elapsedSince: "rule:r-drenagem", op: "gte", seconds: 1800 }, ATB] }, repeat: "once", effects: [trend("temp", 37.4, 3600, "cpre", 60), trend("hr", 90, 2400, "cpre", 60), trend("sbp", 120, 2400, "cpre", 60), trend("bili", 2.8, 14400, "cpre", 60), trend("lactate", 1.4, 3600, "cpre", 60), flag("sweating", false), outcome("melhora")] },
    { id: "r-sem-drenagem", description: "Antibiótico sem drenagem: obstrução mantém a infecção", priority: 33, when: { all: [{ time: "gte", seconds: 5400 }, ATB, { not: DRENAGEM }] }, repeat: "once", effects: [trend("temp", 39.0, 1800, "sdren", 33), trend("bili", 8.0, 3600, "sdren", 33), staff("enfermagem", "Ela voltou a ter calafrio e está mais amarela."), obs("Antibiótico sozinho não descomprime a via biliar: indicar drenagem."), outcome("piora")] },
    { id: "r-grau3", description: "Sem antibiótico em 45 min: disfunção orgânica (grau III)", priority: 35, when: { all: [{ time: "gte", seconds: 2700 }, { not: ATB }] }, repeat: "once", effects: [trend("sbp", 76, 900, "g3", 35), trend("gcs", 12, 1200, "g3", 35), trend("creat", 2.2, 3600, "g3", 35), flag("consciousness", "voz"), staff("enfermagem", "Ela ficou confusa e a pressão está 76 por 40."), outcome("piora")] }
  ],
  diagnosis: { primary: "colangite", accepted: ["colangite"], differentials: ["colecistite", "pancreatite", "hepatite_viral_aguda", "pielonefrite", "choque_septico"] },
  acceptedDestinations: ["uti", "internacao_enfermaria"],
  outcomeNotes: "Colangite aguda por coledocolitíase (TG18: inflamação + colestase + dilatação com cálculo), grau II pela febre ≥ 39 °C e bilirrubina ≥ 5, com risco de progressão para grau III. Hemoculturas, antibiótico (ceftriaxona ± metronidazol na comunitária; piperacilina-tazobactam se gravidade/risco de resistência), Ringer, USG e CPRE com papilotomia nas primeiras horas a 48 h; colecistectomia após a resolução.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Tríade de Charcot e colelitíase prévia", evidence: { kind: "historyAsked", items: ["h-dor", "h-febre", "h-vesicula"], minCount: 2 }, points: 6, severity: "importante", rationale: "Dor, febre e icterícia; cálculo conhecido." },
    { id: "s-exame", domain: "historia", description: "Abdome, icterícia e estado mental", evidence: { kind: "examDone", regions: ["abdome_qsd", "pele", "neurologico"], minCount: 2 }, points: 5, severity: "importante", rationale: "Gravidade e diagnóstico." },
    { id: "s-culturas", domain: "exames", description: "Hemoculturas antes do antibiótico", evidence: { kind: "testOrdered", anyOf: ["hemocultura"], withinSeconds: 1200 }, points: 6, severity: "importante", rationale: "Graus II e III.", sourceIds: ["INT-TG18-COLANGITE"] },
    { id: "s-labs", domain: "exames", description: "Hepatograma, hemograma, lactato, função renal", evidence: { kind: "testOrdered", anyOf: ["hepatograma", "hemograma", "gaso_venosa", "funcao_renal", "coagulograma"], withinSeconds: 900 }, points: 5, severity: "importante", rationale: "Critérios de colestase e gravidade." },
    { id: "s-usg", domain: "exames", description: "Imagem da via biliar", evidence: { kind: "testOrdered", anyOf: ["usg_abdome", "tc_abdome"], withinSeconds: 2400 }, points: 8, severity: "critica", rationale: "Critério C: dilatação e etiologia.", sourceIds: ["INT-TG18-COLANGITE"] },
    { id: "s-atb", domain: "tratamento", description: "Antibiótico em até 1 h", evidence: { kind: "drugGiven", anyOf: ["piperacilina_tazobactam", "ceftriaxona"], withinSeconds: 3600 }, points: 14, severity: "critica", rationale: "Todos os graus.", sourceIds: ["INT-TG18-COLANGITE", "INT-SSC-2021"] },
    { id: "s-volume", domain: "tratamento", description: "Cristaloide", evidence: { kind: "drugGiven", anyOf: ["sf09", "ringer_lactato"], withinSeconds: 1200 }, points: 6, severity: "importante", rationale: "Ressuscitação da sepse." },
    { id: "s-drenagem", domain: "tratamento", description: "Drenagem biliar solicitada", evidence: { kind: "actionDone", anyOf: ["solicitar_drenagem_biliar"], withinSeconds: 5400 }, points: 14, severity: "critica", rationale: "Grau II: drenagem precoce; grau III: urgente após estabilização.", sourceIds: ["INT-TG18-COLANGITE"] },
    { id: "s-sem-cultura", domain: "tratamento", description: "Falha: antibiótico antes das culturas", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-atb-sem-cultura" } }, points: 3, penalty: true, severity: "menor", rationale: "Colher sem atrasar o antibiótico." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou PA, mental e lactato", evidence: { kind: "reassessAfter", after: ["sf09", "ringer_lactato", "piperacilina_tazobactam", "ceftriaxona"], reassess: ["medir_pa", "gaso_venosa", "neurologico"], withinSeconds: 2400 }, points: 6, severity: "importante", rationale: "Detectar progressão para grau III." },
    { id: "s-dx", domain: "destino", description: "Colangite aguda", evidence: { kind: "diagnosis", accepted: ["colangite"] }, points: 6, severity: "importante", rationale: "Critérios de Tóquio." },
    { id: "s-destino", domain: "destino", description: "Internação monitorizada", evidence: { kind: "disposition", accepted: ["uti", "internacao_enfermaria"] }, points: 6, severity: "importante", rationale: "Antibiótico e drenagem." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Dor em hipocôndrio direito, febre com calafrio e icterícia: qual é a tríade?" },
      { level: 2, text: "Antibiótico trata a infecção, mas o que trata a obstrução?" },
      { level: 3, text: "Febre ≥ 39 °C e bilirrubina ≥ 5: não é grau I." },
      { level: 4, text: "Sugestão explícita: hemoculturas, piperacilina-tazobactam, Ringer, hepatograma/lactato, USG, solicitar CPRE, internar." }
    ],
    summary: "Mulher de 71 anos com colelitíase não operada, coledocolitíase e colangite aguda grau II (TG18).",
    pathophysiology: "O cálculo no colédoco obstrui o fluxo biliar; a bile estagnada infecta-se (bactérias entéricas) e a pressão intraductal elevada faz bactérias e endotoxinas passarem para o sangue (colangiovenoso). Sem descompressão, a sepse progride apesar do antibiótico.",
    keyPoints: [
      "TG18: inflamação sistêmica + colestase + imagem (dilatação/etiologia).",
      "Antibiótico, volume e analgesia em todos; hemoculturas nos graus II e III.",
      "Grau I: drenagem se não responder em 24 h; grau II: drenagem precoce (≤ 48 h); grau III: urgente após estabilizar.",
      "Drenagem endoscópica (CPRE) preferida; percutânea se não for possível.",
      "Colecistectomia após resolução."
    ],
    alternatives: ["Ceftriaxona + metronidazol em infecção comunitária sem fatores de resistência.", "Drenagem percutânea trans-hepática se CPRE indisponível ou falhar."],
    oralRubric: [
      { id: "o1", concept: "Critérios de Tóquio", synonyms: ["tóquio", "tg18", "charcot"], weight: 2 },
      { id: "o2", concept: "Antibiótico e culturas", synonyms: ["antibiótico", "hemocultura", "piperacilina"], weight: 2 },
      { id: "o3", concept: "Drenagem biliar", synonyms: ["cpre", "drenagem", "papilotomia"], weight: 3 },
      { id: "o4", concept: "Gravidade", synonyms: ["grau", "disfunção", "choque"], weight: 1 }
    ],
    simplifications: ["CPRE representada pela solicitação de drenagem e efeito após 30 min.", "Graus TG18 representados de forma simplificada (os critérios completos de grau II/III não foram conferidos na fonte lida)."]
  },
  references: ["INT-TG18-COLANGITE", "INT-SSC-2021", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 12, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Culturas, piperacilina-tazobactam, Ringer, labs, USG, drenagem, UTI", commands: [ask(10, "h-dor"), ask(20, "h-febre"), ask(30, "h-vesicula"), { atSeconds: 40, type: "examine", payload: { region: "abdome_qsd", maneuver: "palpacao" } }, { atSeconds: 50, type: "examine", payload: { region: "pele", maneuver: "inspecao" } }, act(60, "monitorizar"), act(70, "acesso_venoso"), test(180, "hemocultura"), test(190, "hepatograma"), test(200, "gaso_venosa"), rx(500, "piperacilina_tazobactam", "fa45", 4500, "mg", "IV"), rx(520, "ringer_lactato", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), test(600, "usg_abdome"), act(1900, "medir_pa"), act(2000, "solicitar_drenagem_biliar"), dx(2700, "colangite"), dest(2800, "uti")], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-desobstrucao" }, description: "drenagem eficaz" }, { condition: { not: { ruleFired: "r-grau3" } }, description: "sem progressão" }, { condition: { not: { ruleFired: "r-atb-sem-cultura" } }, description: "culturas antes" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 4000, expect: [{ condition: { ruleFired: "r-grau3" }, description: "disfunção orgânica" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Só antibiótico e analgesia, sem imagem nem drenagem", commands: [act(30, "acesso_venoso"), rx(150, "ceftriaxona", "fa1g", 1000, "mg", "IV"), rx(170, "dipirona", "amp1g", 1000, "mg", "IV"), dest(1500, "internacao_enfermaria")], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-atb-sem-cultura" }, description: "sem culturas" }, { condition: { ruleFired: "r-sem-drenagem" }, description: "obstrução mantida, piora" }, { condition: { not: { ruleFired: "r-desobstrucao" } }, description: "sem desobstrução" }] },
    { id: "t-atraso", kind: "delay", description: "Antibiótico após disfunção; noradrenalina; drenagem tardia", commands: [act(30, "acesso_venoso"), test(150, "hemocultura"), rx(2900, "piperacilina_tazobactam", "fa45", 4500, "mg", "IV"), rx(2920, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 30 }), rx(3000, "noradrenalina", "sol64", 1, "mg", "IV", "infusao", { rate: { value: 0.1, unit: "mcg/kg/min" } }), test(3100, "usg_abdome"), act(4400, "solicitar_drenagem_biliar")], runUntilSeconds: 8000, expect: [{ condition: { ruleFired: "r-grau3" }, description: "grau III pelo atraso" }, { condition: { ruleFired: "r-desobstrucao" }, description: "drenagem tardia" }] },
    { id: "t-alternativa", kind: "alternative", description: "Ceftriaxona + metronidazol, drenagem pedida antes da imagem", commands: [act(30, "acesso_venoso"), test(140, "hemocultura"), rx(300, "ceftriaxona", "fa1g", 2000, "mg", "IV"), rx(320, "metronidazol", "bolsa500", 500, "mg", "IV", "infusao_volume", { durationMinutes: 30 }), rx(340, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), act(400, "solicitar_drenagem_biliar"), test(1100, "usg_abdome"), dest(3000, "internacao_enfermaria")], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-drenagem-sem-usg" }, description: "pede imagem" }, { condition: { ruleFired: "r-desobstrucao" }, description: "drenagem eficaz" }] }
  ]
};
