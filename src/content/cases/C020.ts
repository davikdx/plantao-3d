import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, obs, outcome, oxygenResponse, rx, staff, test, trend } from "./helpers";

const DRENO = { actionCompleted: "drenagem_torax" };

export const C020: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C020",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Rapaz alto e magro com dor no peito e falta de ar depois de uma crise de tosse",
  teachingTitle: "Pneumotórax espontâneo primário sintomático — diagnóstico à beira-leito e drenagem",
  group: "Pneumologia",
  specialties: ["Pneumologia", "Cirurgia torácica", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 2,
  level: "internato",
  objectives: [
    "Suspeitar de pneumotórax pela clínica (dor pleurítica súbita, murmúrio reduzido)",
    "Confirmar com radiografia ou POCUS",
    "Diferenciar pneumotórax simples de hipertensivo",
    "Indicar drenagem (ou aspiração) no pneumotórax grande e sintomático",
    "Orientar tabagismo e recorrência"
  ],
  keywords: ["dor no peito", "falta de ar", "tosse", "pontada", "pulmão"],
  patient: {
    name: "Thiago Lacerda",
    ageYears: 22,
    sex: "masculino",
    weightKg: 62,
    heightCm: 189,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 2, hairStyle: "curto", hairColor: "castanho", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Jovem de 22 anos, alto e magro, fumante, com dor súbita no lado esquerdo do peito e falta de ar há 3 horas, iniciadas após uma crise de tosse.",
  communication: "normal",
  history: [
    h("h-dor", "queixa", "Como é a dor?", "Uma pontada do lado esquerdo que piora quando respiro fundo.", { keywords: ["dor", "como é"] }),
    h("h-inicio", "inicio", "Começou de repente?", "De repente, depois de uma crise de tosse, há 3 horas.", { keywords: ["repente", "começou"] }),
    h("h-dispneia", "fatores_associados", "A falta de ar está piorando?", "Está igual, mas cansa para falar muito.", { keywords: ["piorando", "falta de ar"] }),
    h("h-fumo", "habitos", "Fuma? Usa maconha ou outras drogas inaladas?", "Fumo cigarro há 5 anos e maconha às vezes.", { keywords: ["fuma", "maconha", "drogas"] }),
    h("h-antes", "antecedentes", "Já teve isso antes? Tem doença no pulmão?", "Nunca tive. Nenhuma doença.", { keywords: ["antes", "doença"] }),
    h("h-alergias", "alergias", "Tem alergia?", "Não.")
  ],
  initial: {
    vars: { hr: 108, sbp: 126, dbp: 78, rr: 24, spo2: 92, temp: 36.6, gcs: 15, pain: 6, glucose: 96, perfusion: 0.85, effort: 0.45 },
    flags: { rhythm: "taquicardia_sinusal", posture: "sentado", painVisual: "moderada", speech: "frases", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-ausculta", "torax_anterior", "ausculta", "Murmúrio vesicular muito diminuído à esquerda.", { sound: "murmurio_abolido", better: [{ when: DRENO, text: "Murmúrio presente bilateralmente, discretamente diminuído à esquerda." }] }),
    ex("e-percussao", "torax_anterior", "percussao", "Hipertimpanismo à esquerda.", {}),
    ex("e-traqueia", "pescoco", "palpacao", "Traqueia centrada; jugulares sem turgência.", { label: "Traqueia e jugulares" }),
    ex("e-expansibilidade", "torax_posterior", "palpacao", "Expansibilidade e frêmito reduzidos à esquerda.", {})
  ],
  testResults: [
    { testId: "rx_torax", variants: [{ when: DRENO, text: "Pulmão esquerdo reexpandido; dreno bem posicionado. (Laudo educativo.)" }, { text: "Pneumotórax à esquerda com distância interpleural de ~3,5 cm no ápice; sem desvio do mediastino. (Laudo educativo.)" }] },
    { testId: "pocus_pulmonar", variants: [{ text: "Ausência de deslizamento pleural à esquerda com ponto pulmonar lateral; deslizamento presente à direita." }] }
  ],
  highlightedActions: ["monitorizar", "o2_cateter", "acesso_venoso", "drenagem_torax"],
  rules: [
    oxygenResponse(96, 120),
    { id: "r-dreno", description: "Drenagem: reexpansão e alívio", priority: 70, when: DRENO, repeat: "once", effects: [trend("spo2", 97, 300, "dreno", 70), trend("rr", 16, 600, "dreno", 70), trend("hr", 86, 600, "dreno", 70), trend("pain", 3, 600, "dreno", 70), flag("painVisual", "leve"), outcome("melhora")] },
    { id: "r-progressao", description: "Sem drenagem em 50 min: aumento do pneumotórax", priority: 30, when: { all: [{ time: "gte", seconds: 3000 }, { not: DRENO }] }, repeat: "once", effects: [trend("spo2", 88, 300, "prog", 45), trend("rr", 30, 300, "prog", 30), trend("hr", 122, 300, "prog", 30), staff("enfermagem", "Ele está mais cansado e a saturação caiu."), outcome("piora")] },
    { id: "r-vni", description: "Pressão positiva com pneumotórax não drenado", priority: 80, when: { all: [{ any: [{ deviceActive: "vni" }, { deviceActive: "tot" }] }, { not: DRENO }] }, repeat: "once", effects: [trend("sbp", 82, 120, "hipert", 80), trend("hr", 140, 120, "hipert", 80), obs("Pressão positiva com pneumotórax não drenado: conversão para pneumotórax hipertensivo."), outcome("complicacao")] }
  ],
  diagnosis: { primary: "pneumotorax_espontaneo", accepted: ["pneumotorax_espontaneo"], differentials: ["pneumotorax_hipertensivo", "tep", "pericardite", "dor_toracica_musculoesqueletica", "pneumonia"] },
  acceptedDestinations: ["internacao_enfermaria", "observacao"],
  outcomeNotes: "Pneumotórax espontâneo primário grande e sintomático: O₂, analgesia e drenagem com dreno de pequeno calibre (ou aspiração por agulha, conforme protocolo). Pressão positiva sem drenagem pode converter em hipertensivo. Orientar cessação do tabagismo.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Caracterizou a dor e fatores de risco", evidence: { kind: "historyAsked", items: ["h-dor", "h-inicio", "h-fumo"], minCount: 2 }, points: 7, severity: "importante", rationale: "Fumante jovem, longilíneo: perfil típico." },
    { id: "s-exame", domain: "historia", description: "Examinou tórax e traqueia", evidence: { kind: "examDone", regions: ["torax_anterior", "pescoco"], minCount: 2 }, points: 9, severity: "critica", rationale: "Traqueia centrada e PA normal afastam hipertensivo." },
    { id: "s-o2", domain: "priorizacao", description: "O₂ e monitorização", evidence: { kind: "actionDone", anyOf: ["o2_cateter", "monitorizar"], withinSeconds: 300 }, points: 6, severity: "importante", rationale: "SpO₂ 92%." },
    { id: "s-imagem", domain: "exames", description: "Radiografia ou POCUS", evidence: { kind: "testOrdered", anyOf: ["rx_torax", "pocus_pulmonar"], withinSeconds: 900 }, points: 12, severity: "critica", rationale: "Confirma e dimensiona.", sourceIds: ["INT-BTS-PLEURA-2023"] },
    { id: "s-exames", domain: "exames", description: "Sem exames desnecessários", evidence: { kind: "testsNotExcessive", maxUnjustified: 1, justified: ["rx_torax", "pocus_pulmonar", "ecg12", "hemograma", "coagulograma"] }, points: 3, severity: "menor", rationale: "Diagnóstico por imagem simples." },
    { id: "s-dreno", domain: "tratamento", description: "Drenagem torácica", evidence: { kind: "actionDone", anyOf: ["drenagem_torax"], withinSeconds: 3000 }, points: 16, severity: "critica", rationale: "Pneumotórax grande e sintomático.", sourceIds: ["INT-BTS-PLEURA-2023"] },
    { id: "s-analgesia", domain: "tratamento", description: "Analgesia", evidence: { kind: "drugGiven", anyOf: ["dipirona", "morfina", "paracetamol"] }, points: 5, severity: "importante", rationale: "Dor pleurítica." },
    { id: "s-vni", domain: "tratamento", description: "Falha: pressão positiva sem drenagem", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-vni" } }, points: 8, penalty: true, severity: "critica", rationale: "Risco de hipertensivo." },
    { id: "s-reav", domain: "reavaliacao", description: "Radiografia de controle após drenagem", evidence: { kind: "reassessAfter", after: ["drenagem_torax"], reassess: ["rx_torax", "pocus_pulmonar"], withinSeconds: 3600 }, points: 10, severity: "importante", rationale: "Confirmar reexpansão e posição do dreno." },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de pneumotórax espontâneo", evidence: { kind: "diagnosis", accepted: ["pneumotorax_espontaneo"] }, points: 5, severity: "importante", rationale: "Primário (sem doença pulmonar)." },
    { id: "s-destino", domain: "destino", description: "Internação/observação com dreno", evidence: { kind: "disposition", accepted: ["internacao_enfermaria", "observacao"] }, points: 4, severity: "importante", rationale: "Acompanhar dreno e reexpansão." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Dor pleurítica súbita em jovem longilíneo fumante…" },
      { level: 2, text: "O exame diferencia simples de hipertensivo." },
      { level: 3, text: "Tamanho e sintomas definem a conduta." },
      { level: 4, text: "Sugestão explícita: O₂, analgesia, RX/POCUS, drenagem com dreno fino, RX de controle." }
    ],
    summary: "Jovem de 22 anos, fumante, longilíneo, com pneumotórax espontâneo primário grande e sintomático à esquerda.",
    pathophysiology: "Ruptura de bolhas subpleurais apicais (blebs) permite entrada de ar no espaço pleural, colabando o pulmão. Sem mecanismo valvular, não há desvio do mediastino nem instabilidade (diferente do hipertensivo).",
    keyPoints: [
      "Clínica + RX/POCUS.",
      "Traqueia, jugulares e PA diferenciam o hipertensivo.",
      "Grande e sintomático: aspiração ou dreno de pequeno calibre.",
      "Evitar pressão positiva antes da drenagem.",
      "Cessação do tabagismo; risco de recorrência."
    ],
    alternatives: ["Aspiração por agulha ou conduta conservadora ambulatorial em casos selecionados (BTS 2023)."],
    oralRubric: [
      { id: "o1", concept: "Diagnóstico clínico e por imagem", synonyms: ["raio", "rx", "pocus", "ultrassom"], weight: 2 },
      { id: "o2", concept: "Diferenciar hipertensivo", synonyms: ["hipertensivo", "traqueia", "mediastino"], weight: 2 },
      { id: "o3", concept: "Drenagem/aspiração", synonyms: ["dreno", "drenagem", "aspiração"], weight: 3 },
      { id: "o4", concept: "Tabagismo", synonyms: ["tabagismo", "cigarro", "fumar"], weight: 1 }
    ],
    simplifications: ["Aspiração por agulha não modelada separadamente.", "Progressão aos 50 min é didática."]
  },
  references: ["INT-BTS-PLEURA-2023", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 10, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Exame, O₂, RX, analgesia, drenagem e controle", commands: [ask(10, "h-inicio"), { atSeconds: 20, type: "examine", payload: { region: "torax_anterior", maneuver: "ausculta" } }, { atSeconds: 40, type: "examine", payload: { region: "pescoco", maneuver: "palpacao" } }, act(60, "o2_cateter", { fluxo: 3 }), act(70, "monitorizar"), test(80, "rx_torax"), act(100, "acesso_venoso"), act(200, "acesso_venoso"), rx(220, "dipirona", "amp1g", 1000, "mg", "IV"), act(600, "drenagem_torax"), test(1400, "rx_torax"), dx(2000, "pneumotorax_espontaneo"), dest(2000, "internacao_enfermaria")], runUntilSeconds: 2500, expect: [{ condition: { ruleFired: "r-dreno" }, description: "reexpansão" }, { condition: { not: { ruleFired: "r-progressao" } }, description: "sem progressão" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 3300, expect: [{ condition: { ruleFired: "r-progressao" }, description: "progressão" }] },
    { id: "t-inadequada", kind: "inadequate", description: "VNI para a dispneia sem drenar", commands: [act(60, "vni")], runUntilSeconds: 600, expect: [{ condition: { ruleFired: "r-vni" }, description: "hipertensivo" }] },
    { id: "t-atraso", kind: "delay", description: "Drenagem só aos 55 min", commands: [act(60, "o2_cateter", { fluxo: 3 }), act(3300, "drenagem_torax")], runUntilSeconds: 4500, expect: [{ condition: { ruleFired: "r-progressao" }, description: "piora" }, { condition: { ruleFired: "r-dreno" }, description: "reexpansão tardia" }] },
    { id: "t-alternativa", kind: "alternative", description: "POCUS em vez de RX, drenagem", commands: [test(30, "pocus_pulmonar"), act(400, "drenagem_torax"), dest(1500, "observacao")], runUntilSeconds: 1800, expect: [{ condition: { ruleFired: "r-dreno" }, description: "reexpansão" }] }
  ]
};
