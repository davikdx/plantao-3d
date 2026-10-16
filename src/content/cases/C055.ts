import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const VOL1 = { any: [{ drugGiven: "sf09", minTotal: { value: 1000, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 1000, unit: "mL" as const } }] };
const VOL_INICIO = { any: [{ drugGiven: "sf09" }, { drugGiven: "ringer_lactato" }] };
const CALCITONINA = { drugGiven: "calcitonina" };
const ANTIRREABS = { drugGiven: "zoledronato" };

export const C055: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C055",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Homem com tosse crônica, confuso, vomitando e urinando muito",
  teachingTitle: "Hipercalcemia grave da malignidade — reidratação com SF, calcitonina como ponte, bisfosfonato ajustado ao rim, retirar agravantes",
  group: "Endocrinologia",
  specialties: ["Clínica médica", "Oncologia", "Endocrinologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Reconhecer sintomas de hipercalcemia (confusão, poliúria, constipação, vômitos, desidratação, QT curto)",
    "Iniciar reidratação vigorosa com SF 0,9% e monitorar volemia",
    "Usar calcitonina como ponte e bisfosfonato (ou denosumabe) com ajuste renal",
    "Não usar diurético antes de repor volume; suspender tiazídico e suplementos de cálcio",
    "Investigar a causa (PTHrP/neoplasia × hiperparatireoidismo)"
  ],
  keywords: ["confuso", "vômito", "poliúria", "tosse", "emagrecimento", "fraqueza"],
  patient: {
    name: "Osvaldo Teixeira",
    ageYears: 66,
    sex: "masculino",
    weightKg: 64,
    heightCm: 170,
    visual: { ageGroup: "idoso", sex: "masculino", skinTone: 2, hairStyle: "careca", hairColor: "grisalho", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Homem de 66 anos, ex-tabagista (50 maços-ano), trazido pela esposa: há 2 semanas mais confuso, com muita sede, urinando muito, intestino preso e há 2 dias vomitando. Aguarda resultado de biópsia de 'nódulo no pulmão'.",
  communication: "limitada",
  informants: [{ id: "esposa", name: "Esposa", role: "Acompanhante" }],
  history: [
    hi("h-evolucao", "inicio", "Desde quando está assim?", [{ source: "esposa", text: "Umas duas semanas: muita sede, levanta de noite várias vezes pra urinar, está preso há 5 dias e agora vomita tudo. Ficou esquisito, esquecido." }], ["quando", "desde", "começou"]),
    hi("h-pulmao", "antecedentes", "O que sabem sobre o nódulo no pulmão?", [{ source: "esposa", text: "Massa grande no pulmão direito; fez biópsia semana passada. Emagreceu 8 quilos em três meses e tosse com sangue às vezes." }], ["pulmão", "nódulo", "biópsia", "câncer"]),
    hi("h-medicacoes", "medicacoes", "Que remédios ele toma? Cálcio, vitamina D, diurético?", [{ source: "esposa", text: "Hidroclorotiazida para pressão e um cálcio com vitamina D que a farmácia indicou para os ossos." }], ["remédio", "cálcio", "vitamina", "diurético", "tiazida"]),
    hi("h-coracao", "antecedentes", "Tem problema de coração ou de rim?", [{ source: "esposa", text: "Não que a gente saiba." }], ["coração", "rim", "insuficiência"]),
    hi("h-alergias", "alergias", "Alergia a remédio?", [{ source: "esposa", text: "Não." }])
  ],
  initial: {
    vars: { hr: 104, sbp: 102, dbp: 62, rr: 18, spo2: 94, temp: 36.6, gcs: 13, pain: 4, glucose: 112, perfusion: 0.6, effort: 0.3, na: 146, k: 3.4, cl: 108, ca: 14.6, mg: 1.7, creat: 2.1, urea: 92, hb: 11.4, wbc: 9800, plt: 330000, urine: 20 },
    flags: { rhythm: "taquicardia_sinusal", posture: "supino", painVisual: "leve", speech: "frases", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Emagrecido, mucosas secas, sonolento mas despertável; desorientado no tempo.", { better: [{ when: { ruleFired: "r-volume" }, text: "Mucosas úmidas, mais desperto." }] }),
    ex("e-torax", "torax_anterior", "ausculta", "Murmúrio reduzido em base direita; sem estertores difusos.", { sound: "murmurio_abolido" }),
    ex("e-abdome", "abdome_qie", "palpacao", "Distensão leve, fezes palpáveis em sigmoide; sem peritonite.", { label: "Abdome" }),
    ex("e-neuro", "neurologico", "especial", "Glasgow 13 (confuso); hiporreflexia global; sem déficit focal.", {}),
    ex("e-pele", "pele", "inspecao", "Turgor diminuído; baqueteamento digital.", {})
  ],
  testResults: [
    { testId: "ecg12", variants: [{ text: "Taquicardia sinusal; intervalo QT curto (QTc ~ 340 ms)." }] },
    { testId: "rx_torax", variants: [{ text: "Laudo educativo: massa hilar direita de ~6 cm com atelectasia parcial do lobo inferior direito." }] },
    { testId: "pth_vitd", variants: [{ text: "PTH suprimido (< 10 pg/mL); 25-OH vitamina D normal. Sugere hipercalcemia não mediada por PTH (PTHrP em neoplasia escamosa)." }] }
  ],
  highlightedActions: ["monitorizar", "acesso_venoso", "diurese_horaria"],
  rules: [
    { id: "r-curso", description: "Hipercalcemia com desidratação: ciclo vicioso de poliúria e piora renal", priority: 10, when: { always: true }, repeat: "once", effects: [trend("ca", 15.6, 7200, "hcm", 10), trend("gcs", 11, 5400, "hcm", 10), trend("creat", 2.6, 7200, "hcm", 10), trend("sbp", 92, 5400, "hcm", 10), trend("hr", 112, 5400, "hcm", 10)] },
    { id: "r-volume", description: "SF 0,9%: restaura volemia, aumenta excreção renal de cálcio", priority: 30, when: VOL1, repeat: "once", effects: [trend("ca", 13.4, 7200, "vol", 30), trend("creat", 1.6, 10800, "vol", 30), trend("sbp", 118, 1800, "vol", 30), trend("hr", 92, 1800, "vol", 30), trend("urine", 120, 1800, "vol", 30), trend("gcs", 14, 5400, "vol", 30)] },
    { id: "r-calcitonina", description: "Calcitonina: queda rápida e transitória do cálcio", priority: 40, when: { all: [CALCITONINA, VOL_INICIO] }, repeat: "once", effects: [trend("ca", 12.4, 10800, "ctn", 40), obs("Calcitonina age em horas, mas perde efeito em 48 h (taquifilaxia): ponte até o bisfosfonato.")] },
    { id: "r-zol", description: "Bisfosfonato: efeito em 2–4 dias", priority: 20, when: ANTIRREABS, repeat: "once", effects: [obs("Zoledronato infundido; queda do cálcio esperada em 48–72 h. Dose ajustada à função renal.")] },
    { id: "r-plano", description: "Volume + calcitonina + antirreabsortivo: plano completo", priority: 50, when: { all: [VOL1, CALCITONINA, ANTIRREABS] }, repeat: "once", effects: [trend("gcs", 15, 2400, "plano", 50), outcome("melhora")] },
    { id: "r-furo-antes", description: "Furosemida antes de repor volume", priority: 45, when: { all: [{ drugGiven: "furosemida" }, { not: VOL1 }] }, repeat: "once", effects: [trend("sbp", 84, 900, "furo", 45, 2400), trend("creat", 3.0, 3600, "furo", 45), trend("ca", 15.8, 3600, "furo", 45, 3600), obs("Diurético de alça em paciente desidratado piora a hipovolemia e a função renal; só após volemia restaurada e, se necessário, para evitar sobrecarga."), outcome("complicacao")] },
    { id: "r-calcio", description: "Cálcio IV administrado na hipercalcemia", priority: 60, when: { drugGiven: "gluconato_calcio" }, repeat: "once", effects: [trend("ca", 16.5, 300, "erro", 60, 3600), trend("hr", 48, 300, "erro", 60, 1800), flag("rhythm", "bradicardia_sinusal"), obs("Cálcio IV agrava a hipercalcemia e pode causar bradiarritmia."), outcome("complicacao")] },
    { id: "r-grave", description: "Sem reidratação em 1 h: rebaixamento", priority: 35, when: { all: [{ time: "gte", seconds: 3600 }, { not: VOL_INICIO }] }, repeat: "once", effects: [trend("gcs", 9, 1200, "grave", 35), flag("consciousness", "voz"), flag("speech", "palavras"), staff("enfermagem", "Ele está cada vez mais sonolento."), outcome("piora")] },
    { id: "r-arritmia", description: "Hipercalcemia grave persistente: bradiarritmia", priority: 36, when: { all: [{ time: "gte", seconds: 5400 }, { not: VOL_INICIO }] }, repeat: "once", effects: [flag("rhythm", "bradicardia_sinusal"), trend("hr", 46, 600, "arr", 36), trend("sbp", 82, 600, "arr", 36), staff("enfermagem", "O monitor mostra bradicardia e a pressão caiu."), outcome("piora")] }
  ],
  diagnosis: { primary: "hipercalcemia", accepted: ["hipercalcemia"], differentials: ["ehh", "encefalopatia_metabolica", "lra", "hiponatremia", "avc_isquemico", "delirium"] },
  acceptedDestinations: ["internacao_enfermaria", "uti"],
  outcomeNotes: "Hipercalcemia grave (Ca 14,6 mg/dL) por provável carcinoma epidermoide de pulmão (PTHrP), agravada por tiazídico e suplemento de cálcio/vitamina D, com lesão renal pré-renal. SF 0,9% vigoroso com controle de diurese, calcitonina como ponte, zoledronato com ajuste renal (ou denosumabe), suspender tiazídico e cálcio; diurético só após volemia; internação.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Sintomas e neoplasia", evidence: { kind: "historyAsked", items: ["h-evolucao", "h-pulmao"], minCount: 2 }, points: 6, severity: "importante", rationale: "Neoplasia escamosa é causa comum de hipercalcemia grave." },
    { id: "s-meds", domain: "historia", description: "Revisou medicações (tiazídico, cálcio, vitamina D)", evidence: { kind: "historyAsked", items: ["h-medicacoes"], minCount: 1 }, points: 6, severity: "importante", rationale: "Suspender agravantes." },
    { id: "s-labs", domain: "exames", description: "Eletrólitos com cálcio e função renal", evidence: { kind: "testOrdered", anyOf: ["eletrolitos", "funcao_renal"], withinSeconds: 900 }, points: 8, severity: "critica", rationale: "Confirma hipercalcemia e lesão renal." },
    { id: "s-ecg", domain: "exames", description: "ECG", evidence: { kind: "testOrdered", anyOf: ["ecg12"], withinSeconds: 1200 }, points: 4, severity: "importante", rationale: "QT curto, bradiarritmias." },
    { id: "s-pth", domain: "exames", description: "Investigação etiológica (PTH)", evidence: { kind: "testOrdered", anyOf: ["pth_vitd"] }, points: 3, severity: "menor", rationale: "PTH suprimido → não mediada por PTH." },
    { id: "s-sf", domain: "tratamento", description: "SF 0,9% vigoroso", evidence: { kind: "drugGiven", anyOf: ["sf09", "ringer_lactato"], withinSeconds: 1200 }, points: 14, severity: "critica", rationale: "1–2 L em bolus, depois 200–500 mL/h com meta de diurese.", sourceIds: ["INT-ES-HCM-2023"] },
    { id: "s-calcitonina", domain: "tratamento", description: "Calcitonina como ponte (Ca > 14)", evidence: { kind: "drugGiven", anyOf: ["calcitonina"] }, points: 8, severity: "importante", rationale: "Queda rápida até o antirreabsortivo agir.", sourceIds: ["INT-ES-HCM-2023"] },
    { id: "s-zol", domain: "tratamento", description: "Bisfosfonato IV com ajuste renal", evidence: { kind: "drugGiven", anyOf: ["zoledronato"] }, points: 10, severity: "critica", rationale: "Tratamento de manutenção da hipercalcemia da malignidade.", sourceIds: ["INT-ES-HCM-2023"] },
    { id: "s-furo", domain: "tratamento", description: "Falha: diurético antes da reposição", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-furo-antes" } }, points: 8, penalty: true, severity: "importante", rationale: "Diurético de alça não é de rotina; só após volemia.", sourceIds: ["INT-ES-HCM-2023"] },
    { id: "s-calcio", domain: "tratamento", description: "Falha: cálcio IV", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-calcio" } }, points: 10, penalty: true, severity: "critica", rationale: "Erro grave de leitura do distúrbio." },
    { id: "s-diurese", domain: "reavaliacao", description: "Controle de diurese e volemia", evidence: { kind: "actionDone", anyOf: ["diurese_horaria"] }, points: 5, severity: "importante", rationale: "Titular a hidratação e evitar sobrecarga." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou cálcio/função renal após o tratamento", evidence: { kind: "reassessAfter", after: ["sf09", "ringer_lactato"], reassess: ["eletrolitos", "funcao_renal", "medir_pa", "torax_anterior"], withinSeconds: 7200 }, points: 6, severity: "importante", rationale: "Resposta e congestão." },
    { id: "s-dx", domain: "destino", description: "Hipercalcemia grave", evidence: { kind: "diagnosis", accepted: ["hipercalcemia"] }, points: 6, severity: "importante", rationale: "Ca 14,6 com sintomas neurológicos." },
    { id: "s-destino", domain: "destino", description: "Internação", evidence: { kind: "disposition", accepted: ["internacao_enfermaria", "uti"] }, points: 6, severity: "importante", rationale: "Hidratação IV e monitorização." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Confusão, poliúria, constipação e vômitos em quem tem massa pulmonar: qual eletrólito?" },
      { level: 2, text: "A poliúria desidrata, e a desidratação reduz a excreção de cálcio." },
      { level: 3, text: "Primeiro volume; o bisfosfonato demora dias." },
      { level: 4, text: "Sugestão explícita: eletrólitos/função renal/ECG, SF 0,9% 1–2 L, sonda/diurese, calcitonina, zoledronato ajustado, suspender tiazídico e cálcio, internar." }
    ],
    summary: "Homem de 66 anos com provável carcinoma epidermoide de pulmão e hipercalcemia grave (14,6 mg/dL) mediada por PTHrP, agravada por tiazídico e suplemento de cálcio, com lesão renal pré-renal e confusão.",
    pathophysiology: "O PTHrP tumoral aumenta a reabsorção óssea e a reabsorção tubular de cálcio. A hipercalcemia causa diabetes insípido nefrogênico (poliúria), vômitos e desidratação, o que reduz a filtração e a excreção de cálcio, fechando um ciclo vicioso. O cálcio alto deprime a excitabilidade neuromuscular (confusão, hiporreflexia, constipação) e encurta o QT.",
    keyPoints: [
      "Sintomas: 'pedras, ossos, gemidos abdominais e alterações psíquicas'; poliúria e desidratação.",
      "SF 0,9% vigoroso é o primeiro passo; monitorar diurese e congestão.",
      "Ca > 14 mg/dL: calcitonina como ponte + bisfosfonato IV ou denosumabe.",
      "Diurético de alça só após volemia, não de rotina.",
      "Suspender tiazídico, cálcio, vitamina D, lítio; investigar PTH."
    ],
    alternatives: ["Denosumabe em vez de bisfosfonato (preferido na diretriz; útil na doença renal).", "Glicocorticoide se hipercalcemia mediada por calcitriol (linfoma, granulomatosas).", "Hemodiálise em casos refratários com insuficiência renal."],
    oralRubric: [
      { id: "o1", concept: "Reidratação", synonyms: ["soro", "hidratação", "volume", "sf"], weight: 3 },
      { id: "o2", concept: "Calcitonina + bisfosfonato", synonyms: ["calcitonina", "zoledronato", "bisfosfonato", "denosumabe"], weight: 3 },
      { id: "o3", concept: "Agravantes", synonyms: ["tiazídico", "hidroclorotiazida", "vitamina d", "cálcio"], weight: 1 },
      { id: "o4", concept: "Causa", synonyms: ["pthrp", "neoplasia", "pth"], weight: 1 }
    ],
    simplifications: ["Suspensão de medicamentos de uso domiciliar é avaliada pela anamnese.", "Calcitonina sem regra de dose validada (o app alerta).", "Queda do cálcio é uma tendência determinística em horas."]
  },
  references: ["INT-ES-HCM-2023", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "História, labs, ECG, SF 1 L + manutenção, sonda, calcitonina, zoledronato, internação", commands: [ask(10, "h-evolucao"), ask(20, "h-pulmao"), ask(30, "h-medicacoes"), act(40, "monitorizar"), act(50, "acesso_venoso"), test(160, "eletrolitos"), test(170, "funcao_renal"), test(180, "ecg12"), rx(200, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), act(300, "diurese_horaria"), test(700, "pth_vitd"), rx(3000, "calcitonina", "amp100", 260, "UI", "SC"), rx(3900, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 240 }), rx(4000, "zoledronato", "fr4mg", 3, "mg", "IV", "infusao_volume", { durationMinutes: 60 }), test(7000, "eletrolitos"), dx(7200, "hipercalcemia"), dest(7300, "internacao_enfermaria")], runUntilSeconds: 11000, expect: [{ condition: { ruleFired: "r-plano" }, description: "plano completo" }, { condition: { not: { ruleFired: "r-furo-antes" } }, description: "sem diurético precoce" }, { condition: { path: "vars.ca", op: "lt", value: 14.6 }, description: "cálcio em queda" }, { condition: { path: "vars.gcs", op: "gte", value: 14 }, description: "melhora do sensório" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-grave" }, description: "rebaixamento" }, { condition: { ruleFired: "r-arritmia" }, description: "bradiarritmia" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Furosemida sem volume e gluconato de cálcio", commands: [act(30, "acesso_venoso"), rx(150, "furosemida", "amp20", 40, "mg", "IV"), rx(300, "gluconato_calcio", "amp10", 1000, "mg", "IV")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-furo-antes" }, description: "piora volêmica" }, { condition: { ruleFired: "r-calcio" }, description: "cálcio IV" }] },
    { id: "t-atraso", kind: "delay", description: "Reidratação só após 70 min", commands: [act(30, "acesso_venoso"), test(150, "eletrolitos"), rx(4200, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), rx(5000, "calcitonina", "amp100", 260, "UI", "SC"), rx(5100, "zoledronato", "fr4mg", 3, "mg", "IV", "infusao_volume", { durationMinutes: 60 })], runUntilSeconds: 10000, expect: [{ condition: { ruleFired: "r-grave" }, description: "rebaixamento pelo atraso" }, { condition: { ruleFired: "r-plano" }, description: "plano completo tardio" }, { condition: { not: { ruleFired: "r-arritmia" } }, description: "arritmia evitada" }] },
    { id: "t-alternativa", kind: "alternative", description: "Ringer lactato e furosemida só após volemia", commands: [act(30, "acesso_venoso"), test(150, "eletrolitos"), rx(200, "ringer_lactato", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), rx(3700, "calcitonina", "amp100", 260, "UI", "SC"), rx(3800, "zoledronato", "fr4mg", 3, "mg", "IV", "infusao_volume", { durationMinutes: 60 }), rx(4000, "furosemida", "amp20", 20, "mg", "IV"), dest(6000, "uti")], runUntilSeconds: 8000, expect: [{ condition: { ruleFired: "r-plano" }, description: "plano completo" }, { condition: { not: { ruleFired: "r-furo-antes" } }, description: "diurético só após volume" }] }
  ]
};
