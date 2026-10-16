import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const NTG = { treatmentActive: "nitroglicerina" };
const VNI = { deviceActive: "vni" };
const O2 = { any: [{ deviceActive: "mascara_reservatorio" }, { deviceActive: "cateter_nasal" }, { deviceActive: "vni" }, { deviceActive: "tot" }] };
const VOLUME = { any: [{ drugGiven: "sf09", minTotal: { value: 500, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 500, unit: "mL" as const } }] };

export const C011: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C011",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Senhora acorda sufocada e chega sentada, sem conseguir falar frases",
  teachingTitle: "Edema agudo de pulmão hipertensivo — ventilação não invasiva e vasodilatador",
  group: "Cardiologia",
  specialties: ["Cardiologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "upa-porte-ii",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Reconhecer edema agudo de pulmão com hipertensão (perfil quente e úmido)",
    "Instalar ventilação não invasiva precocemente",
    "Usar vasodilatador em dose adequada e diurético como adjuvante",
    "Evitar expansão volêmica e buscar o fator desencadeante"
  ],
  keywords: ["falta de ar", "sufocada", "pressão alta", "chiado", "espuma"],
  patient: {
    name: "Iracema dos Santos",
    ageYears: 72,
    sex: "feminino",
    weightKg: 76,
    heightCm: 156,
    visual: { ageGroup: "idoso", sex: "feminino", skinTone: 4, hairStyle: "crespo_curto", hairColor: "grisalho", build: "obeso", pregnancyTrimester: 0 }
  },
  briefing: "Sala vermelha de UPA 24h. Senhora de 72 anos trazida pelo SAMU às 4h da manhã: acordou sufocada, sentada na beira da cama. Chega sentada, sudoreica, falando poucas palavras.",
  communication: "limitada",
  informants: [{ id: "neto", name: "Jefferson", role: "Neto" }],
  history: [
    h("h-queixa", "queixa", "O que a senhora está sentindo?", "Não… consigo… respirar…", { keywords: ["sentindo", "respirar"] }),
    hi("h-inicio", "inicio", "Quando começou?", [{ source: "neto", text: "Ela acordou assim há uma hora. Ontem já estava cansada para subir a escada." }], ["quando", "começou"]),
    hi("h-medicacoes", "medicacoes", "Ela toma os remédios da pressão?", [{ source: "neto", text: "Toma losartana e furosemida, mas faz uma semana que acabou e ela não foi buscar no posto." }], ["remédio", "pressão", "toma"]),
    hi("h-sal", "habitos", "Comeu algo muito salgado? Bebeu muito líquido?", [{ source: "neto", text: "Domingo teve feijoada na casa da minha tia." }], ["sal", "salgado", "comida", "líquido"]),
    hi("h-dor", "fatores_associados", "Teve dor no peito?", [{ source: "neto", text: "Ela não falou de dor no peito." }], ["dor no peito", "dor"]),
    hi("h-antecedentes", "antecedentes", "Que doenças ela tem?", [{ source: "neto", text: "Pressão alta há muitos anos, e o médico falou que o coração está grande." }], ["doenças", "coração"]),
    hi("h-alergias", "alergias", "Tem alergia?", [{ source: "neto", text: "Não." }])
  ],
  initial: {
    vars: { hr: 118, sbp: 212, dbp: 118, rr: 36, spo2: 83, temp: 36.4, gcs: 15, pain: 2, glucose: 154, perfusion: 0.7, effort: 0.9, etco2: 30, lactate: 2.4, k: 4.4, na: 137, creat: 1.3, urea: 52, hb: 12.6, trop: 22, ph: 7.28, pco2: 46, po2: 52, hco3: 21, urine: 15 },
    flags: { rhythm: "taquicardia_sinusal", sweating: true, posture: "sentado", speech: "palavras", communication: "limitada", cough: true, painVisual: "moderada", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Sentada, sudoreica, uso de musculatura acessória, tosse com secreção rósea espumosa.", { better: [{ when: { ruleFired: "r-melhora" }, text: "Mais confortável, fala frases, sem uso de musculatura acessória." }] }),
    ex("e-pulmao", "torax_posterior", "ausculta", "Estertores crepitantes até ápices, sibilos difusos.", { sound: "estertores", better: [{ when: { ruleFired: "r-melhora" }, text: "Estertores apenas em bases." }] }),
    ex("e-coracao", "coracao", "ausculta", "Taquicárdica, B3, sem sopros.", { sound: "b3" }),
    ex("e-jugular", "pescoco", "inspecao", "Turgência jugular presente.", { label: "Jugulares" }),
    ex("e-mmii", "membro_inferior_d", "palpacao", "Edema 2+/4+ em membros inferiores; extremidades quentes.", { label: "Edema e perfusão" })
  ],
  testResults: [
    { testId: "ecg12", variants: [{ text: "Taquicardia sinusal 118 bpm; sobrecarga ventricular esquerda; sem supradesnivelamento de ST.", ecg: { rhythm: "taquicardia_sinusal", rate: 118, stElevationLeads: [], stDepressionLeads: ["V5", "V6"], peakedT: false, wideQrs: false } }] },
    { testId: "rx_torax", variants: [{ text: "Cardiomegalia; congestão peri-hilar bilateral, linhas B de Kerley, pequeno derrame bilateral. (Laudo educativo.)" }] },
    { testId: "pocus_pulmonar", variants: [{ text: "Linhas B difusas e bilaterais; pequeno derrame pleural bilateral." }] }
  ],
  highlightedActions: ["monitorizar", "vni", "acesso_venoso", "o2_mascara_reservatorio", "jejum_cabeceira"],
  rules: [
    { id: "r-o2", description: "Oxigênio suplementar sem pressão positiva: melhora parcial", priority: 30, when: { all: [O2, { not: VNI }] }, repeat: "while", effects: [trend("spo2", 89, 120, "o2", 30)], onEnd: [{ type: "clearTrend", var: "spo2", slot: "o2" }] },
    { id: "r-vni", description: "VNI reduz trabalho respiratório e pós-carga", priority: 50, when: VNI, repeat: "while", effects: [trend("spo2", 95, 180, "vni", 50), trend("rr", 24, 300, "vni", 50), trend("effort", 0.4, 300, "vni", 50), trend("pco2", 40, 600, "vni", 50), trend("ph", 7.37, 600, "vni", 50)], onEnd: [{ type: "clearTrend", var: "spo2", slot: "vni" }, { type: "clearTrend", var: "rr", slot: "vni" }, { type: "clearTrend", var: "effort", slot: "vni" }] },
    { id: "r-ntg", description: "Nitroglicerina IV reduz PA e congestão enquanto em infusão", priority: 50, when: NTG, repeat: "while", effects: [trend("sbp", 150, 300, "ntg", 50), trend("dbp", 84, 300, "ntg", 50), trend("hr", 98, 300, "ntg", 50)], onEnd: [{ type: "clearTrend", var: "sbp", slot: "ntg" }, { type: "clearTrend", var: "dbp", slot: "ntg" }, { type: "clearTrend", var: "hr", slot: "ntg" }] },
    { id: "r-melhora", description: "VNI + vasodilatador por 10 min: melhora clínica", priority: 60, when: { all: [VNI, NTG, { elapsedSince: "drug:nitroglicerina", op: "gte", seconds: 600 }] }, repeat: "once", effects: [flag("speech", "frases"), flag("communication", "normal"), flag("sweating", false), flag("posture", "fowler"), flag("painVisual", "leve"), outcome("melhora")] },
    { id: "r-furo", description: "Furosemida aumenta diurese (adjuvante)", when: { drugGiven: "furosemida" }, repeat: "once", effects: [trend("urine", 120, 900, "furo", 40, 3600), obs("Diurese aumenta após furosemida; o alívio imediato depende mais da VNI e do vasodilatador.")] },
    { id: "r-volume", description: "Expansão volêmica em EAP: piora", priority: 80, when: VOLUME, repeat: "once", effects: [trend("spo2", 76, 300, "vol", 80, 1800), trend("rr", 42, 300, "vol", 80, 1800), staff("enfermagem", "Ela piorou muito depois do soro!"), outcome("complicacao")] },
    { id: "r-morfina", description: "Morfina: sem benefício demonstrado e risco de depressão respiratória", when: { drugGiven: "morfina" }, repeat: "once", effects: [trend("rr", 18, 300, "mor", 70, 1200), trend("pco2", 58, 600, "mor", 70, 1800), flag("consciousness", "voz"), obs("Após morfina: sonolência e hipoventilação.")] },
    { id: "r-piora", description: "Sem pressão positiva nem vasodilatador em 15 min: fadiga respiratória", priority: 40, when: { all: [{ time: "gte", seconds: 900 }, { not: VNI }, { not: NTG }] }, repeat: "once", effects: [trend("spo2", 78, 300, "fadiga", 40), trend("pco2", 62, 600, "fadiga", 40), trend("ph", 7.18, 600, "fadiga", 40), flag("consciousness", "voz"), flag("speech", "nenhuma"), staff("enfermagem", "Ela está ficando sonolenta, a saturação não sobe."), outcome("piora")] },
    { id: "r-regulacao", description: "Regulação de leito", when: { actionCompleted: "acionar_samu" }, repeat: "once", effects: [staff("regulacao", "Regulação: solicitação de leito de unidade coronariana/UTI registrada; previsão de vaga em 4 horas. Manter na sala vermelha com reavaliação.")] }
  ],
  diagnosis: { primary: "eap_hipertensivo", accepted: ["eap_hipertensivo", "icc_descompensada"], differentials: ["icc_descompensada", "pneumonia", "dpoc_exacerbado", "iamssst", "tep", "asma_grave"] },
  acceptedDestinations: ["transferencia_regulada", "permanece_em_sala_vermelha"],
  outcomeNotes: "EAP hipertensivo (quente e úmido): VNI e nitroglicerina IV são o núcleo; furosemida é adjuvante (sobretudo com congestão sistêmica). Expansão volêmica e morfina pioram. Fator desencadeante: suspensão dos anti-hipertensivos e sobrecarga de sal.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Pesquisou fator desencadeante (adesão, sal, isquemia)", evidence: { kind: "historyAsked", items: ["h-medicacoes", "h-sal", "h-dor"], minCount: 2 }, points: 6, severity: "importante", rationale: "Identificar e corrigir a causa da descompensação.", sourceIds: ["INT-ESC-IC-2021"] },
    { id: "s-exame", domain: "historia", description: "Avaliou congestão e perfusão", evidence: { kind: "examDone", regions: ["torax_posterior", "pescoco", "membro_inferior_d"], minCount: 2 }, points: 6, severity: "importante", rationale: "Perfil hemodinâmico." },
    { id: "s-monitor", domain: "priorizacao", description: "Monitorização imediata", evidence: { kind: "actionDone", anyOf: ["monitorizar"], withinSeconds: 120 }, points: 4, severity: "importante", rationale: "Paciente grave." },
    { id: "s-vni", domain: "priorizacao", description: "VNI em até 10 minutos", evidence: { kind: "actionDone", anyOf: ["vni"], withinSeconds: 600 }, points: 11, severity: "critica", rationale: "Reduz necessidade de intubação no EAP cardiogênico.", sourceIds: ["INT-ESC-IC-2021"] },
    { id: "s-ecg", domain: "exames", description: "ECG para excluir síndrome coronariana", evidence: { kind: "testOrdered", anyOf: ["ecg12"], withinSeconds: 900 }, points: 7, severity: "importante", rationale: "Isquemia é desencadeante frequente." },
    { id: "s-exames", domain: "exames", description: "Exames dirigidos", evidence: { kind: "testsNotExcessive", maxUnjustified: 1, justified: ["ecg12", "rx_torax", "pocus_pulmonar", "troponina", "gaso_arterial", "gaso_venosa", "eletrolitos", "funcao_renal", "hemograma"] }, points: 8, severity: "menor", rationale: "Troponina, função renal, eletrólitos e gasometria." },
    { id: "s-ntg", domain: "tratamento", description: "Nitroglicerina IV em até 15 minutos", evidence: { kind: "drugGiven", anyOf: ["nitroglicerina"], withinSeconds: 900 }, points: 13, severity: "critica", rationale: "Vasodilatador reduz pré e pós-carga no EAP hipertensivo.", sourceIds: ["INT-ESC-IC-2021"] },
    { id: "s-furo", domain: "tratamento", description: "Diurético de alça", evidence: { kind: "drugGiven", anyOf: ["furosemida"] }, points: 4, severity: "importante", rationale: "Adjuvante na congestão.", sourceIds: ["INT-ESC-IC-2021"] },
    { id: "s-acesso", domain: "tratamento", description: "Acesso venoso", evidence: { kind: "actionDone", anyOf: ["acesso_venoso"] }, points: 3, severity: "importante", rationale: "Para vasodilatador." },
    { id: "s-volume", domain: "tratamento", description: "Falha: expansão volêmica", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-volume" } }, points: 8, penalty: true, severity: "critica", rationale: "Paciente congesta." },
    { id: "s-morfina", domain: "tratamento", description: "Falha: morfina de rotina", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-morfina" } }, points: 4, penalty: true, severity: "importante", rationale: "Sem benefício e com risco de depressão respiratória." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou PA/gasometria após VNI e nitrato", evidence: { kind: "reassessAfter", after: ["nitroglicerina"], reassess: ["medir_pa", "gaso_arterial", "gaso_venosa", "oximetria_portatil"], withinSeconds: 1800 }, points: 10, severity: "importante", rationale: "Titular vasodilatador e avaliar falha da VNI." },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de EAP hipertensivo", evidence: { kind: "diagnosis", accepted: ["eap_hipertensivo", "icc_descompensada"] }, points: 4, severity: "importante", rationale: "Congestão aguda com hipertensão." },
    { id: "s-destino", domain: "destino", description: "Leito via regulação, mantendo sala vermelha até a vaga", evidence: { kind: "disposition", accepted: ["transferencia_regulada", "permanece_em_sala_vermelha"] }, points: 6, severity: "importante", rationale: "UPA não interna; regular leito.", sourceIds: ["BR-UPA"] }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Ela está quente ou fria? Seca ou úmida?" },
      { level: 2, text: "O que diminui o trabalho respiratório sem intubar?" },
      { level: 3, text: "No EAP hipertensivo, o problema principal é redistribuição por pós-carga elevada." },
      { level: 4, text: "Sugestão explícita: monitor, VNI, acesso, nitroglicerina IV titulada, furosemida, ECG/troponina, regulação." }
    ],
    summary: "Mulher de 72 anos hipertensa, sem anti-hipertensivos há 1 semana e com sobrecarga de sal, com EAP hipertensivo (PA 212/118, SpO₂ 83%).",
    pathophysiology: "A elevação abrupta da pós-carga em um VE com disfunção diastólica eleva a pressão de enchimento e a pressão capilar pulmonar, gerando edema alveolar. A pressão positiva reduz retorno venoso e pós-carga do VE; nitratos reduzem pré e pós-carga.",
    keyPoints: [
      "EAP hipertensivo = perfil quente e úmido.",
      "VNI precoce reduz intubação.",
      "Nitroglicerina IV titulada é o tratamento central; diurético é adjuvante.",
      "Evitar volume e morfina de rotina.",
      "Buscar desencadeante: adesão, sal, isquemia, arritmia, infecção."
    ],
    alternatives: ["Nitrato sublingual enquanto se prepara a infusão.", "Intubação se falha da VNI ou rebaixamento."],
    oralRubric: [
      { id: "o1", concept: "VNI", synonyms: ["vni", "pressão positiva", "cpap", "bipap"], weight: 3 },
      { id: "o2", concept: "Nitroglicerina", synonyms: ["nitroglicerina", "nitrato", "vasodilatador"], weight: 3 },
      { id: "o3", concept: "Diurético adjuvante", synonyms: ["furosemida", "diurético"], weight: 1 },
      { id: "o4", concept: "Desencadeante", synonyms: ["adesão", "sal", "desencadeante", "isquemia"], weight: 2 }
    ],
    simplifications: ["Resposta ao nitrato não depende da dose exata no modelo.", "Tempo de melhora (10 min) é didático."]
  },
  references: ["INT-ESC-IC-2021", "BR-UPA", "BR-SAMU-SAV", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 8, allowSexSwap: true, allowWeightPercent: 10, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Monitor, VNI, nitroglicerina, furosemida, ECG e regulação", commands: [act(5, "monitorizar"), act(20, "vni"), act(30, "acesso_venoso"), act(130, "acesso_venoso"), test(150, "ecg12"), ask(160, "h-medicacoes"), ask(170, "h-sal"), rx(300, "nitroglicerina", "sol200", 50, "mg", "IV", "infusao", { rate: { value: 50, unit: "mcg/min" } }), rx(400, "furosemida", "amp20", 40, "mg", "IV"), act(900, "medir_pa"), act(1000, "acionar_samu"), dx(1500, "eap_hipertensivo"), dest(1500, "permanece_em_sala_vermelha")], runUntilSeconds: 2000, expect: [{ condition: { ruleFired: "r-melhora" }, description: "melhora clínica" }, { condition: { path: "vars.spo2", op: "gte", value: 92 }, description: "SpO₂ ≥ 92" }, { condition: { not: { ruleFired: "r-piora" } }, description: "sem fadiga" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-piora" }, description: "fadiga respiratória" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Soro e morfina", commands: [act(10, "acesso_venoso"), act(110, "acesso_venoso"), rx(200, "morfina", "amp10", 4, "mg", "IV"), rx(220, "sf09", "bolsa500", 500, "mL", "IV", "infusao_volume", { durationMinutes: 30 })], runUntilSeconds: 2500, expect: [{ condition: { ruleFired: "r-volume" }, description: "piora com volume" }, { condition: { ruleFired: "r-morfina" }, description: "hipoventilação" }] },
    { id: "t-atraso", kind: "delay", description: "Só máscara e furosemida; VNI e nitrato aos 20 min", commands: [act(10, "o2_mascara_reservatorio", { fluxo: 15 }), act(30, "acesso_venoso"), act(130, "acesso_venoso"), rx(200, "furosemida", "amp20", 40, "mg", "IV"), act(1200, "vni"), rx(1300, "nitroglicerina", "sol200", 50, "mg", "IV", "infusao", { rate: { value: 50, unit: "mcg/min" } })], runUntilSeconds: 2500, expect: [{ condition: { ruleFired: "r-piora" }, description: "piora pelo atraso" }, { condition: { ruleFired: "r-melhora" }, description: "melhora tardia" }] },
    { id: "t-alternativa", kind: "alternative", description: "Nitroglicerina antes da VNI", commands: [act(5, "monitorizar"), act(10, "acesso_venoso"), act(110, "acesso_venoso"), rx(200, "nitroglicerina", "sol200", 50, "mg", "IV", "infusao", { rate: { value: 30, unit: "mcg/min" } }), act(300, "vni")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-melhora" }, description: "melhora" }] }
  ]
};
