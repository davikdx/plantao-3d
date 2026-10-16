import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, obs, outcome, oxygenResponse, rx, staff, test, trend } from "./helpers";

const TORACO = { actionCompleted: "toracocentese" };

export const C024: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C024",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Falta de ar que vem piorando há semanas em mulher que tratou câncer de mama",
  teachingTitle: "Derrame pleural volumoso sintomático — investigação, toracocentese diagnóstica e de alívio",
  group: "Pneumologia",
  specialties: ["Pneumologia", "Oncologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Reconhecer derrame pleural volumoso pela clínica e imagem",
    "Indicar toracocentese guiada por ultrassom (diagnóstica e de alívio)",
    "Limitar o volume retirado para evitar edema de reexpansão",
    "Solicitar análise do líquido (critérios de Light, citologia, cultura)",
    "Planejar investigação e cuidado oncológico"
  ],
  keywords: ["falta de ar", "cansaço", "câncer", "pulmão", "tosse"],
  patient: {
    name: "Lourdes Nascimento",
    ageYears: 58,
    sex: "feminino",
    weightKg: 60,
    heightCm: 158,
    visual: { ageGroup: "adulto", sex: "feminino", skinTone: 4, hairStyle: "curto", hairColor: "preto", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Mulher de 58 anos, tratada de câncer de mama há 4 anos, com falta de ar progressiva há 3 semanas; hoje não consegue deitar.",
  communication: "normal",
  history: [
    h("h-queixa", "queixa", "O que sente?", "Falta de ar que piora a cada dia, tosse seca e um peso do lado direito.", { keywords: ["sente"] }),
    h("h-tempo", "inicio", "Há quanto tempo?", "Três semanas; hoje está pior."),
    h("h-cancer", "antecedentes", "Como foi o tratamento do câncer? Faz acompanhamento?", "Operei e fiz quimioterapia há 4 anos. Faltei às últimas consultas.", { keywords: ["câncer", "tratamento", "quimioterapia"] }),
    h("h-constitucional", "fatores_associados", "Emagreceu, teve febre, dor nos ossos?", "Emagreci uns 5 quilos. Febre não. Dor nas costas às vezes.", { keywords: ["emagreceu", "febre", "ossos"] }),
    h("h-anticoag", "medicacoes", "Usa anticoagulante ou antiagregante?", "Não.", { keywords: ["anticoagulante", "aas"] }),
    h("h-alergias", "alergias", "Tem alergia?", "Não.")
  ],
  initial: {
    vars: { hr: 108, sbp: 132, dbp: 80, rr: 28, spo2: 90, temp: 36.7, gcs: 15, pain: 3, glucose: 102, perfusion: 0.8, effort: 0.6, plt: 260000, inr: 1.0, hb: 11.4 },
    flags: { rhythm: "taquicardia_sinusal", cough: true, posture: "sentado", speech: "frases", consciousness: "alerta", painVisual: "leve" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-ausculta", "torax_posterior", "ausculta", "Murmúrio abolido nos 2/3 inferiores do hemitórax direito.", { sound: "murmurio_abolido", better: [{ when: TORACO, text: "Murmúrio presente no terço médio; diminuído na base direita." }] }),
    ex("e-percussao", "torax_posterior", "percussao", "Macicez nos 2/3 inferiores à direita; frêmito abolido.", {}),
    ex("e-traqueia", "pescoco", "palpacao", "Traqueia discretamente desviada para a esquerda.", { label: "Traqueia" }),
    ex("e-mama", "torax_anterior", "inspecao", "Cicatriz de mastectomia à direita; nódulo endurecido na axila direita.", { label: "Tórax anterior e axilas" })
  ],
  testResults: [
    { testId: "rx_torax", variants: [{ when: TORACO, text: "Redução importante do derrame à direita; sem pneumotórax. (Laudo educativo.)" }, { text: "Derrame pleural volumoso à direita (opacidade de 2/3 do hemitórax) com desvio contralateral do mediastino. (Laudo educativo.)" }] },
    { testId: "pocus_pulmonar", variants: [{ text: "Grande derrame anecoico à direita com septações finas; pulmão colapsado flutuando (sinal da água-viva)." }] },
    { testId: "liquido_pleural", variants: [{ text: "Aspecto sero-hemático; exsudato pelos critérios de Light (proteína e DHL elevados em relação ao soro); glicose normal; citologia com células atípicas — aguardando imunocitoquímica; cultura em andamento." }] }
  ],
  highlightedActions: ["o2_cateter", "monitorizar", "toracocentese"],
  rules: [
    oxygenResponse(94, 120),
    { id: "r-alivio", description: "Toracocentese de alívio: melhora da dispneia", priority: 60, when: TORACO, repeat: "once", effects: [trend("rr", 20, 600, "alivio", 60), trend("spo2", 95, 300, "alivio", 60), trend("hr", 92, 600, "alivio", 60), trend("effort", 0.3, 600, "alivio", 60), flag("posture", "fowler"), outcome("melhora")] },
    { id: "r-reexpansao", description: "Toracocentese repetida (volume > 1,5 L na sessão): edema de reexpansão", priority: 80, when: { actionCompleted: "toracocentese", count: 2 }, repeat: "once", effects: [trend("spo2", 86, 300, "reexp", 80, 2400), trend("rr", 30, 300, "reexp", 80, 2400), flag("cough", true), obs("Retirada de grande volume na mesma sessão: tosse e dessaturação por edema de reexpansão. Limitar a ~1–1,5 L por sessão."), outcome("complicacao")] },
    { id: "r-progressao", description: "Sem alívio em 60 min: piora respiratória", priority: 30, when: { all: [{ time: "gte", seconds: 3600 }, { not: TORACO }] }, repeat: "once", effects: [trend("spo2", 86, 600, "prog", 45), trend("rr", 34, 600, "prog", 30), staff("enfermagem", "Ela está mais cansada e não consegue ficar recostada."), outcome("piora")] },
    { id: "r-furo", description: "Diurético não trata derrame maligno", when: { all: [{ drugGiven: "furosemida" }, { not: TORACO }] }, repeat: "once", effects: [obs("Furosemida: sem melhora; derrame exsudativo maligno não responde a diurético.")] },
    { id: "r-cego", description: "Toracocentese sem ultrassom", when: { all: [TORACO, { not: { testCollected: "pocus_pulmonar" } }] }, repeat: "once", effects: [obs("Procedimento sem guia ultrassonográfica: maior risco de pneumotórax e punção de órgão. Prefira USG à beira-leito.")] }
  ],
  diagnosis: { primary: "derrame_pleural", accepted: ["derrame_pleural"], differentials: ["pneumonia", "icc_descompensada", "tuberculose_pulmonar", "tep"] },
  acceptedDestinations: ["internacao_enfermaria", "encaminhamento_ambulatorial"],
  outcomeNotes: "Derrame volumoso sintomático em paciente com câncer de mama prévio: toracocentese guiada por ultrassom, diagnóstica e de alívio (limitada a ~1–1,5 L), análise do líquido (exsudato com células atípicas sugere derrame maligno), internação para investigação/pleurodese e articulação com oncologia.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Antecedente oncológico e sintomas constitucionais", evidence: { kind: "historyAsked", items: ["h-cancer", "h-constitucional"], minCount: 2 }, points: 6, severity: "importante", rationale: "Probabilidade de derrame maligno." },
    { id: "s-anticoag", domain: "historia", description: "Pesquisou anticoagulação antes do procedimento", evidence: { kind: "historyAsked", items: ["h-anticoag"], minCount: 1 }, points: 3, severity: "importante", rationale: "Segurança do procedimento." },
    { id: "s-exame", domain: "historia", description: "Exame do tórax (percussão/ausculta) e axilas", evidence: { kind: "examDone", regions: ["torax_posterior", "torax_anterior"], minCount: 2 }, points: 6, severity: "importante", rationale: "Macicez, murmúrio abolido; recidiva axilar." },
    { id: "s-o2", domain: "priorizacao", description: "O₂ e monitorização", evidence: { kind: "actionDone", anyOf: ["o2_cateter", "monitorizar"], withinSeconds: 300 }, points: 5, severity: "importante", rationale: "SpO₂ 90%." },
    { id: "s-usg", domain: "exames", description: "Ultrassom pleural antes da punção", evidence: { kind: "testOrdered", anyOf: ["pocus_pulmonar"] }, points: 8, severity: "critica", rationale: "Guia o procedimento e caracteriza o derrame.", sourceIds: ["INT-BTS-PLEURA-2023"] },
    { id: "s-liquido", domain: "exames", description: "Análise do líquido pleural", evidence: { kind: "testOrdered", anyOf: ["liquido_pleural"] }, points: 8, severity: "critica", rationale: "Critérios de Light, citologia, cultura.", sourceIds: ["INT-BTS-PLEURA-2023"] },
    { id: "s-toraco", domain: "tratamento", description: "Toracocentese de alívio", evidence: { kind: "actionDone", anyOf: ["toracocentese"], withinSeconds: 3600 }, points: 16, severity: "critica", rationale: "Derrame volumoso sintomático.", sourceIds: ["INT-BTS-PLEURA-2023"] },
    { id: "s-reexp", domain: "tratamento", description: "Falha: retirada excessiva (edema de reexpansão)", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-reexpansao" } }, points: 8, penalty: true, severity: "importante", rationale: "Limitar volume por sessão." },
    { id: "s-reav", domain: "reavaliacao", description: "Imagem de controle após a punção", evidence: { kind: "reassessAfter", after: ["toracocentese"], reassess: ["rx_torax", "pocus_pulmonar"], withinSeconds: 3600 }, points: 10, severity: "importante", rationale: "Excluir pneumotórax e avaliar residual." },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de derrame pleural volumoso", evidence: { kind: "diagnosis", accepted: ["derrame_pleural"] }, points: 5, severity: "importante", rationale: "Exsudato provavelmente maligno." },
    { id: "s-destino", domain: "destino", description: "Internação para investigação/pleurodese", evidence: { kind: "disposition", accepted: ["internacao_enfermaria"] }, points: 5, severity: "importante", rationale: "Recidiva rápida é comum; planejar conduta definitiva." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Murmúrio abolido com macicez: ar ou líquido?" },
      { level: 2, text: "Antes de puncionar, o que guia a agulha?" },
      { level: 3, text: "Quanto retirar de uma vez?" },
      { level: 4, text: "Sugestão explícita: O₂, USG, toracocentese guiada com retirada de até ~1,5 L, análise do líquido, RX de controle, internação e oncologia." }
    ],
    summary: "Mulher de 58 anos com câncer de mama prévio, derrame pleural volumoso à direita com desvio do mediastino e dispneia progressiva; líquido exsudativo com células atípicas.",
    pathophysiology: "Implantes pleurais e obstrução linfática aumentam a produção e reduzem a drenagem de líquido pleural (exsudato). O volume comprime o pulmão e reduz a complacência; a retirada rápida de grandes volumes pode causar edema de reexpansão.",
    keyPoints: [
      "Ultrassom à beira-leito para diagnóstico e guia.",
      "Toracocentese diagnóstica + alívio, limitando o volume por sessão.",
      "Critérios de Light: exsudato vs transudato.",
      "Derrame maligno recidivante: pleurodese ou cateter pleural.",
      "Articular oncologia e cuidados de suporte."
    ],
    alternatives: ["Cateter pleural de longa permanência em derrame maligno recorrente (não modelado)."],
    oralRubric: [
      { id: "o1", concept: "Ultrassom", synonyms: ["ultrassom", "usg", "pocus"], weight: 2 },
      { id: "o2", concept: "Toracocentese", synonyms: ["toracocentese", "punção", "alívio"], weight: 3 },
      { id: "o3", concept: "Light", synonyms: ["light", "exsudato", "transudato"], weight: 2 },
      { id: "o4", concept: "Volume limitado", synonyms: ["1,5", "reexpansão", "volume"], weight: 1 }
    ],
    simplifications: ["Volume retirado não é parametrizado; a segunda punção na sessão representa retirada excessiva.", "Resultado da citologia simplificado."]
  },
  references: ["INT-BTS-PLEURA-2023", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: false, allowWeightPercent: 15, allowVisualVariation: true, forbidden: ["sexo"] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "História, exame, O₂, USG, toracocentese, líquido e controle", commands: [ask(10, "h-cancer"), ask(20, "h-anticoag"), { atSeconds: 30, type: "examine", payload: { region: "torax_posterior", maneuver: "percussao" } }, act(40, "o2_cateter", { fluxo: 2 }), test(60, "pocus_pulmonar"), act(400, "toracocentese"), test(1010, "liquido_pleural"), test(1100, "rx_torax"), dx(2000, "derrame_pleural"), dest(2000, "internacao_enfermaria")], runUntilSeconds: 2500, expect: [{ condition: { ruleFired: "r-alivio" }, description: "alívio" }, { condition: { not: { ruleFired: "r-reexpansao" } }, description: "sem reexpansão" }, { condition: { not: { ruleFired: "r-cego" } }, description: "guiada por USG" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 3700, expect: [{ condition: { ruleFired: "r-progressao" }, description: "piora" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Furosemida e punção às cegas repetida", commands: [act(40, "acesso_venoso"), act(140, "acesso_venoso"), rx(200, "furosemida", "amp20", 40, "mg", "IV"), act(300, "toracocentese"), act(950, "toracocentese")], runUntilSeconds: 2500, expect: [{ condition: { ruleFired: "r-furo" }, description: "diurético sem efeito" }, { condition: { ruleFired: "r-cego" }, description: "sem USG" }, { condition: { ruleFired: "r-reexpansao" }, description: "reexpansão" }] },
    { id: "t-atraso", kind: "delay", description: "Toracocentese só após 65 min", commands: [act(40, "o2_cateter", { fluxo: 2 }), test(60, "pocus_pulmonar"), act(3900, "toracocentese")], runUntilSeconds: 5000, expect: [{ condition: { ruleFired: "r-progressao" }, description: "piora" }, { condition: { ruleFired: "r-alivio" }, description: "alívio tardio" }] },
    { id: "t-alternativa", kind: "alternative", description: "RX + USG e toracocentese, internação", commands: [test(30, "rx_torax"), test(40, "pocus_pulmonar"), act(500, "toracocentese"), test(1110, "liquido_pleural"), dest(2000, "internacao_enfermaria")], runUntilSeconds: 2500, expect: [{ condition: { ruleFired: "r-alivio" }, description: "alívio" }] }
  ]
};
