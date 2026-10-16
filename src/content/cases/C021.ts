import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const VNI = { deviceActive: "vni" };
const TOT = { deviceActive: "tot" };
const O2_ALTO = { deviceActive: "mascara_reservatorio" };

export const C021: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C021",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Senhor com doença no pulmão está muito sonolento desde a manhã",
  teachingTitle: "Insuficiência respiratória hipercápnica com encefalopatia — gasometria, VNI sob vigilância e critérios de intubação",
  group: "Pneumologia",
  specialties: ["Pneumologia", "Terapia intensiva", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 4,
  level: "residencia",
  objectives: [
    "Reconhecer rebaixamento por hipercapnia em pneumopata crônico",
    "Usar gasometria para confirmar acidose respiratória",
    "Ajustar O₂ (alvo 88–92%) e suspender sedativos",
    "Indicar VNI com vigilância estrita ou intubação conforme critérios",
    "Reavaliar em 1 hora e decidir escalonamento"
  ],
  keywords: ["sonolento", "não acorda", "pulmão", "oxigênio em casa", "enfisema"],
  patient: {
    name: "Hélio Siqueira",
    ageYears: 71,
    sex: "masculino",
    weightKg: 98,
    heightCm: 170,
    visual: { ageGroup: "idoso", sex: "masculino", skinTone: 1, hairStyle: "careca", hairColor: "grisalho", build: "obeso", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Homem de 71 anos com DPOC grave em oxigênio domiciliar trazido pela esposa: muito sonolento desde cedo. Ontem estava com mais falta de ar e, à noite, tomou um comprimido para dormir.",
  communication: "incapaz",
  informants: [{ id: "esposa", name: "Neusa", role: "Esposa" }],
  history: [
    hi("h-evento", "queixa", "O que mudou?", [{ source: "esposa", text: "Ontem estava mais cansado e com catarro. Aumentou o oxigênio para 5 litros sozinho e tomou um diazepam para dormir. Hoje não acorda direito." }], ["mudou", "aconteceu"]),
    hi("h-o2", "medicacoes", "Quantos litros de oxigênio ele usa normalmente?", [{ source: "esposa", text: "O médico mandou 1 litro e meio." }], ["oxigênio", "litros"]),
    hi("h-sedativo", "medicacoes", "Tomou calmante, remédio para dormir ou para dor?", [{ source: "esposa", text: "Um diazepam de 10 que era meu." }], ["calmante", "dormir", "diazepam"]),
    hi("h-vomito", "sinais_alarme", "Vomitou? Consegue engolir a saliva?", [{ source: "esposa", text: "Não vomitou." }], ["vomitou", "engolir"]),
    hi("h-diretivas", "social", "Ele já conversou sobre intubação ou UTI?", [{ source: "esposa", text: "Ele disse que quer todo tratamento possível." }], ["intubação", "uti", "vontade"]),
    hi("h-alergias", "alergias", "Tem alergia?", [{ source: "esposa", text: "Não." }])
  ],
  initial: {
    vars: { hr: 102, sbp: 148, dbp: 84, rr: 12, spo2: 97, temp: 37.2, gcs: 10, pain: 0, glucose: 136, perfusion: 0.75, effort: 0.3, etco2: 68, ph: 7.19, pco2: 94, po2: 98, hco3: 35, be: 8, lactate: 1.4, k: 4.6 },
    flags: { rhythm: "taquicardia_sinusal", consciousness: "voz", speech: "nenhuma", airway: "risco", communication: "incapaz", posture: "fowler", tremor: true },
    devices: ["cateter_nasal"],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-neuro", "neurologico", "especial", "Glasgow 10 (abre olhos à voz, resposta verbal confusa, localiza dor); flapping; pupilas mióticas leves, reagentes.", { label: "Neurológico", better: [{ when: { ruleFired: "r-vni-sucesso" }, text: "Glasgow 14, mais desperto." }] }),
    ex("e-pulmao", "torax_posterior", "ausculta", "Murmúrio muito diminuído difusamente, sibilos esparsos; respiração superficial.", { sound: "sibilos" }),
    ex("e-via-aerea", "boca", "inspecao", "Via aérea pérvia, sem secreção abundante; reflexo de tosse presente.", { label: "Via aérea" })
  ],
  testResults: [
    { testId: "gaso_arterial", variants: [{ text: "Acidose respiratória aguda sobre crônica (pH baixo, PaCO₂ muito elevada, bicarbonato compensatório elevado); PaO₂ acima do alvo para retentor." }] },
    { testId: "rx_torax", variants: [{ text: "Hiperinsuflação; sem consolidação ou pneumotórax. (Laudo educativo.)" }] }
  ],
  procedureFailures: [{ actionId: "intubacao", attempts: [] }],
  highlightedActions: ["monitorizar", "o2_cateter", "vni", "intubacao", "glicemia_capilar"],
  rules: [
    { id: "r-o2-ajuste", description: "Reduzir O₂ para alvo 88–92%", priority: 30, when: { all: [{ deviceActive: "cateter_nasal" }, { not: VNI }, { not: TOT }] }, repeat: "while", effects: [trend("spo2", 92, 300, "o2", 30)], onEnd: [{ type: "clearTrend", var: "spo2", slot: "o2" }] },
    { id: "r-piora", description: "Sem suporte ventilatório: CO₂ sobe e o nível de consciência cai", priority: 20, when: { all: [{ time: "gte", seconds: 1200 }, { not: VNI }, { not: TOT }] }, repeat: "once", effects: [trend("pco2", 112, 900, "piora", 20), trend("ph", 7.08, 900, "piora", 20), trend("gcs", 7, 600, "piora", 20), flag("consciousness", "dor"), staff("enfermagem", "Ele quase não responde mais à dor."), outcome("piora")] },
    { id: "r-o2-alto", description: "O₂ em alto fluxo agrava a hipercapnia", priority: 40, when: O2_ALTO, repeat: "once", effects: [trend("pco2", 108, 600, "o2alto", 40), trend("gcs", 8, 600, "o2alto", 40), obs("Mais oxigênio piorou a hipercapnia.")] },
    { id: "r-vni", description: "VNI corrige a acidose enquanto instalada", priority: 50, when: { all: [VNI, { not: { ruleFired: "r-piora" } }] }, repeat: "while", effects: [trend("pco2", 66, 1200, "vni", 50), trend("ph", 7.33, 1200, "vni", 50), trend("rr", 18, 600, "vni", 50), trend("spo2", 91, 300, "vni", 50)], onEnd: [{ type: "clearTrend", var: "pco2", slot: "vni" }, { type: "clearTrend", var: "ph", slot: "vni" }] },
    { id: "r-vni-sucesso", description: "VNI por 30 min antes do agravamento: desperta", priority: 60, when: { all: [VNI, { elapsedSince: "action:vni", op: "gte", seconds: 1800 }, { not: { ruleFired: "r-piora" } }] }, repeat: "once", effects: [trend("gcs", 14, 600, "vni2", 60), flag("consciousness", "alerta"), outcome("melhora")] },
    { id: "r-vni-tardia", description: "VNI com Glasgow < 8: aspiração e falha", priority: 70, when: { all: [VNI, { ruleFired: "r-piora" }] }, repeat: "once", effects: [trend("spo2", 82, 120, "aspira", 70), obs("Paciente com Glasgow < 8 sob VNI: vômito e aspiração. Indicada intubação."), outcome("complicacao")] },
    { id: "r-iot", description: "Intubação e ventilação mecânica: controle da ventilação", priority: 80, when: TOT, repeat: "while", effects: [trend("pco2", 60, 1200, "vm", 80), trend("ph", 7.34, 1200, "vm", 80), trend("spo2", 93, 300, "vm", 80)], onEnd: [{ type: "clearTrend", var: "pco2", slot: "vm" }] },
    { id: "r-flumazenil", description: "Benzodiazepínico como fator", when: { actionCompleted: "glicemia_capilar" }, repeat: "once", effects: [obs("Glicemia 136 mg/dL. Lembrar: o benzodiazepínico contribuiu; flumazenil não é rotina (risco de convulsões) e não trata a hipercapnia.")] }
  ],
  diagnosis: { primary: "insuficiencia_respiratoria_hipercapnica", accepted: ["insuficiencia_respiratoria_hipercapnica", "dpoc_exacerbado"], differentials: ["dpoc_exacerbado", "intox_benzodiazepinico", "avc_isquemico", "encefalopatia_metabolica", "hipoglicemia"] },
  acceptedDestinations: ["uti"],
  outcomeNotes: "Encefalopatia hipercápnica (O₂ excessivo + benzodiazepínico em DPOC grave): reduzir O₂ ao alvo, gasometria, VNI com vigilância estrita se via aérea protegida e Glasgow ≥ 8–10, reavaliar em 1 h; intubação se piora, Glasgow < 8 ou falha. UTI.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Identificou O₂ excessivo e sedativo", evidence: { kind: "historyAsked", items: ["h-evento", "h-o2", "h-sedativo"], minCount: 2 }, points: 8, severity: "critica", rationale: "Causas da hipercapnia aguda." },
    { id: "s-diretiva", domain: "historia", description: "Perguntou sobre desejos do paciente (intubação/UTI)", evidence: { kind: "historyAsked", items: ["h-diretivas"], minCount: 1 }, points: 3, severity: "importante", rationale: "Decisão compartilhada em doença crônica grave." },
    { id: "s-neuro", domain: "historia", description: "Avaliou Glasgow e via aérea", evidence: { kind: "examDone", regions: ["neurologico", "boca"], minCount: 2 }, points: 6, severity: "critica", rationale: "Define VNI vs intubação." },
    { id: "s-glicemia", domain: "priorizacao", description: "Glicemia capilar", evidence: { kind: "actionDone", anyOf: ["glicemia_capilar"], withinSeconds: 300 }, points: 4, severity: "importante", rationale: "Excluir hipoglicemia no rebaixamento." },
    { id: "s-gaso", domain: "exames", description: "Gasometria arterial em até 10 min", evidence: { kind: "testOrdered", anyOf: ["gaso_arterial", "gaso_venosa"], withinSeconds: 600 }, points: 12, severity: "critica", rationale: "Confirma acidose respiratória." },
    { id: "s-vni", domain: "tratamento", description: "Suporte ventilatório (VNI ou intubação) em até 20 min", evidence: { kind: "actionDone", anyOf: ["vni", "intubacao"], withinSeconds: 1200 }, points: 18, severity: "critica", rationale: "Acidose respiratória com encefalopatia." },
    { id: "s-o2-alto", domain: "tratamento", description: "Falha: aumentou O₂", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-o2-alto" } }, points: 6, penalty: true, severity: "importante", rationale: "Agrava hipercapnia." },
    { id: "s-vni-tardia", domain: "tratamento", description: "Falha: VNI com Glasgow < 8", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-vni-tardia" } }, points: 6, penalty: true, severity: "critica", rationale: "Risco de aspiração; intubar." },
    { id: "s-reav", domain: "reavaliacao", description: "Gasometria de controle", evidence: { kind: "reassessAfter", after: ["vni", "intubacao"], reassess: ["gaso_arterial", "gaso_venosa", "avaliar_glasgow"], withinSeconds: 3600 }, points: 10, severity: "importante", rationale: "Falha da VNI em 1–2 h indica intubação." },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de insuficiência respiratória hipercápnica", evidence: { kind: "diagnosis", accepted: ["insuficiencia_respiratoria_hipercapnica", "dpoc_exacerbado"] }, points: 5, severity: "importante", rationale: "Acidose respiratória com encefalopatia." },
    { id: "s-destino", domain: "destino", description: "UTI", evidence: { kind: "disposition", accepted: ["uti"] }, points: 8, severity: "critica", rationale: "Vigilância de via aérea e ventilação." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Por que um retentor de CO₂ ficaria sonolento?" },
      { level: 2, text: "A saturação de 97% é boa notícia aqui?" },
      { level: 3, text: "VNI exige via aérea protegida e vigilância; quando intubar?" },
      { level: 4, text: "Sugestão explícita: reduzir O₂, glicemia, gasometria, VNI imediata com reavaliação ou IOT se Glasgow cair, UTI." }
    ],
    summary: "Homem de 71 anos com DPOC grave, O₂ domiciliar aumentado por conta própria e benzodiazepínico, com acidose respiratória grave e Glasgow 10.",
    pathophysiology: "Hiperóxia reduz o drive e piora a relação V/Q; benzodiazepínicos deprimem o centro respiratório. A PaCO₂ sobe, causando acidose e narcose. A VNI aumenta a ventilação alveolar; com proteção de via aérea insuficiente, a intubação é necessária.",
    keyPoints: [
      "SpO₂ alta não exclui falência ventilatória: gasometria.",
      "Alvo 88–92% em retentores.",
      "VNI possível na encefalopatia hipercápnica leve/moderada com vigilância.",
      "Intubar se Glasgow < 8, vômitos, instabilidade ou falha.",
      "Revisar sedativos e prescrição de O₂ domiciliar."
    ],
    alternatives: ["Intubação imediata é aceitável se a equipe julgar via aérea insegura."],
    oralRubric: [
      { id: "o1", concept: "Gasometria", synonyms: ["gasometria", "co2", "acidose"], weight: 2 },
      { id: "o2", concept: "O₂ controlado", synonyms: ["88", "92", "reduzir", "controlado"], weight: 2 },
      { id: "o3", concept: "VNI vs intubação", synonyms: ["vni", "não invasiva", "intubação", "glasgow"], weight: 3 },
      { id: "o4", concept: "Sedativo", synonyms: ["diazepam", "benzodiazepínico", "sedativo"], weight: 1 }
    ],
    simplifications: ["Intubação sempre bem-sucedida neste caso (sem falhas programadas).", "Tempos de resposta à VNI comprimidos."]
  },
  references: ["INT-GOLD", "BR-DPOC", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 8, allowSexSwap: true, allowWeightPercent: 10, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "História, glicemia, O₂ ajustado, gasometria, VNI precoce e controle", commands: [ask(10, "h-evento"), ask(20, "h-sedativo"), act(30, "glicemia_capilar"), act(40, "monitorizar"), act(50, "o2_cateter", { fluxo: 1 }), { atSeconds: 60, type: "examine", payload: { region: "neurologico", maneuver: "especial" } }, test(80, "gaso_arterial"), act(200, "vni"), test(2400, "gaso_arterial"), dx(3000, "insuficiencia_respiratoria_hipercapnica"), dest(3000, "uti")], runUntilSeconds: 3200, expect: [{ condition: { ruleFired: "r-vni-sucesso" }, description: "desperta" }, { condition: { not: { ruleFired: "r-piora" } }, description: "sem piora" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 2000, expect: [{ condition: { ruleFired: "r-piora" }, description: "piora" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Aumenta O₂ com máscara", commands: [act(30, "o2_mascara_reservatorio", { fluxo: 15 })], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-o2-alto" }, description: "hipercapnia pior" }, { condition: { ruleFired: "r-piora" }, description: "rebaixamento" }] },
    { id: "t-atraso", kind: "delay", description: "VNI tardia com Glasgow < 8, depois intubação", commands: [act(1300, "vni"), act(1310, "acesso_venoso"), act(1410, "acesso_venoso"), rx(1500, "cetamina", "fa50", 100, "mg", "IV"), act(1600, "intubacao")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-vni-tardia" }, description: "falha da VNI" }, { condition: { ruleFired: "r-iot" }, description: "ventilação controlada" }] },
    { id: "t-alternativa", kind: "alternative", description: "Intubação precoce", commands: [act(30, "glicemia_capilar"), test(60, "gaso_arterial"), act(100, "acesso_venoso"), act(200, "acesso_venoso"), rx(300, "cetamina", "fa50", 100, "mg", "IV"), rx(310, "rocuronio", "fa50", 100, "mg", "IV"), act(320, "intubacao"), act(500, "ventilacao_mecanica"), dest(1500, "uti")], runUntilSeconds: 2000, expect: [{ condition: { ruleFired: "r-iot" }, description: "ventilação controlada" }] }
  ]
};
