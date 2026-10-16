import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, obs, outcome, rx, staff, test, trend } from "./helpers";

const CATETER = { deviceActive: "cateter_nasal" };
const MASCARA = { deviceActive: "mascara_reservatorio" };
const VNI = { deviceActive: "vni" };
const BD = { all: [{ drugGiven: "salbutamol" }, { drugGiven: "ipratropio" }] };
const CORTICO = { any: [{ drugGiven: "prednisona" }, { drugGiven: "metilprednisolona" }, { drugGiven: "hidrocortisona" }] };

export const C018: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C018",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Ex-fumante com piora do cansaço e catarro há três dias",
  teachingTitle: "Exacerbação de DPOC com acidose respiratória — oxigênio controlado, broncodilatadores, corticoide e VNI",
  group: "Respiratório",
  specialties: ["Pneumologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "upa-porte-ii",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Ofertar oxigênio controlado com alvo de SpO₂ 88–92%",
    "Associar broncodilatadores de curta ação e corticoide sistêmico",
    "Interpretar gasometria com acidose respiratória aguda",
    "Indicar ventilação não invasiva",
    "Reconhecer hipercapnia induzida por oxigênio em alto fluxo"
  ],
  keywords: ["cansaço", "falta de ar", "catarro", "chiado", "fumante"],
  patient: {
    name: "Valdomiro Pereira",
    ageYears: 66,
    sex: "masculino",
    weightKg: 61,
    heightCm: 168,
    visual: { ageGroup: "idoso", sex: "masculino", skinTone: 2, hairStyle: "curto", hairColor: "grisalho", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "UPA 24h. Homem de 66 anos com DPOC, ex-tabagista (50 maços-ano), traz receita de \"bombinha\". Há 3 dias com piora da falta de ar e catarro amarelo-esverdeado; hoje não conseguiu andar até o portão.",
  communication: "normal",
  history: [
    h("h-queixa", "queixa", "O que piorou?", "O cansaço… e o catarro ficou verde, mais grosso.", { keywords: ["piorou", "cansaço"] }),
    h("h-inicio", "inicio", "Desde quando?", "Três dias. Começou com uma gripe."),
    h("h-escarro", "fatores_associados", "O catarro mudou de cor ou quantidade?", "Aumentou bastante e ficou verde.", { keywords: ["catarro", "escarro", "cor"] }),
    h("h-febre", "fatores_associados", "Teve febre ou dor no peito?", "Febre não. Dor no peito não.", { keywords: ["febre", "dor no peito"] }),
    h("h-o2-casa", "medicacoes", "Usa oxigênio em casa? Que remédios usa?", "Oxigênio não. Uso a bombinha de formoterol com budesonida, e a azul quando aperta.", { keywords: ["oxigênio", "remédio", "bombinha"] }),
    h("h-internacoes", "antecedentes", "Já foi internado ou intubado por isso?", "Internei duas vezes no ano passado. Intubar, nunca.", { keywords: ["internado", "intubado", "uti"] }),
    h("h-habitos", "habitos", "Ainda fuma?", "Parei há 4 anos. Fumei 40 anos, dois maços por dia."),
    h("h-alergias", "alergias", "Tem alergia?", "Não.")
  ],
  initial: {
    vars: { hr: 108, sbp: 146, dbp: 86, rr: 30, spo2: 84, temp: 37.4, gcs: 15, pain: 1, glucose: 128, perfusion: 0.8, effort: 0.8, etco2: 52, ph: 7.29, pco2: 64, po2: 49, hco3: 30, be: 4, lactate: 1.6, k: 4.1, na: 138, wbc: 13800, pcr: 46, hb: 15.8, ht: 48 },
    flags: { rhythm: "taquicardia_sinusal", wheeze: true, cough: true, posture: "sentado", speech: "palavras", painVisual: "leve", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Sentado inclinado para frente, lábios semicerrados, uso de musculatura acessória, tórax em tonel.", { better: [{ when: { ruleFired: "r-narcose" }, text: "Sonolento, respiração superficial, difícil de despertar." }, { when: { ruleFired: "r-vni-sucesso" }, text: "Mais confortável na VNI, sem tiragem." }] }),
    ex("e-pulmao", "torax_posterior", "ausculta", "Murmúrio diminuído difusamente, sibilos expiratórios e roncos; expiração prolongada.", { sound: "sibilos", better: [{ when: { ruleFired: "r-bd" }, text: "Menos sibilos; expiração ainda prolongada." }] }),
    ex("e-pele", "pele", "inspecao", "Cianose central discreta.", {}),
    ex("e-mmii", "membro_inferior_d", "palpacao", "Sem edema de membros inferiores; panturrilhas livres.", { label: "Membros inferiores" })
  ],
  testResults: [
    { testId: "rx_torax", variants: [{ text: "Hiperinsuflação, retificação das cúpulas; sem consolidação ou pneumotórax. (Laudo educativo.)" }] },
    { testId: "ecg12", variants: [{ text: "Taquicardia sinusal 108 bpm; onda P apiculada em DII; sem alteração isquêmica aguda.", ecg: { rhythm: "taquicardia_sinusal", rate: 108, stElevationLeads: [], stDepressionLeads: [], peakedT: false, wideQrs: false } }] }
  ],
  highlightedActions: ["monitorizar", "o2_cateter", "nebulizacao_montar", "vni", "acesso_venoso"],
  rules: [
    { id: "r-o2-controlado", description: "O₂ por cânula em baixo fluxo: SpO₂ tende a 90%", priority: 30, when: { all: [CATETER, { not: VNI }] }, repeat: "while", effects: [trend("spo2", 90, 120, "o2", 30)], onEnd: [{ type: "clearTrend", var: "spo2", slot: "o2" }] },
    { id: "r-o2-alto", description: "Máscara com reservatório: SpO₂ alta, hipercapnia progressiva", priority: 35, when: MASCARA, repeat: "while", effects: [trend("spo2", 99, 90, "o2alto", 35), trend("pco2", 88, 900, "o2alto", 35), trend("ph", 7.16, 900, "o2alto", 35)], onEnd: [{ type: "clearTrend", var: "spo2", slot: "o2alto" }, { type: "clearTrend", var: "pco2", slot: "o2alto" }, { type: "clearTrend", var: "ph", slot: "o2alto" }] },
    { id: "r-narcose", description: "Após 10 min de O₂ em alto fluxo: narcose por CO₂", priority: 70, when: { all: [MASCARA, { elapsedSince: "action:o2_mascara_reservatorio", op: "gte", seconds: 600 }] }, repeat: "once", effects: [flag("consciousness", "voz"), flag("speech", "nenhuma"), trend("rr", 14, 300, "narcose", 70, 1800), trend("gcs", 11, 300, "narcose", 70, 1800), staff("enfermagem", "A saturação está 99%, mas ele ficou muito sonolento!"), outcome("complicacao")] },
    { id: "r-bd", description: "Salbutamol + ipratrópio: broncodilatação parcial", priority: 40, when: BD, repeat: "once", effects: [trend("effort", 0.6, 600, "bd", 40), trend("rr", 26, 600, "bd", 40), flag("wheeze", false)] },
    { id: "r-vni", description: "VNI corrige acidose respiratória enquanto instalada", priority: 50, when: VNI, repeat: "while", effects: [trend("pco2", 52, 900, "vni", 50), trend("ph", 7.36, 900, "vni", 50), trend("spo2", 91, 180, "vni", 50), trend("rr", 22, 600, "vni", 50), trend("effort", 0.4, 600, "vni", 50)], onEnd: [{ type: "clearTrend", var: "pco2", slot: "vni" }, { type: "clearTrend", var: "ph", slot: "vni" }, { type: "clearTrend", var: "spo2", slot: "vni" }, { type: "clearTrend", var: "rr", slot: "vni" }, { type: "clearTrend", var: "effort", slot: "vni" }] },
    { id: "r-vni-sucesso", description: "VNI por 20 min com broncodilatador: melhora", priority: 60, when: { all: [VNI, BD, { elapsedSince: "action:vni", op: "gte", seconds: 1200 }] }, repeat: "once", effects: [flag("speech", "frases"), flag("consciousness", "alerta"), outcome("melhora")] },
    { id: "r-cortico", description: "Corticoide sistêmico registrado", when: CORTICO, repeat: "once", effects: [obs("Corticoide sistêmico iniciado (efeito em horas; reduz falha terapêutica e tempo de internação).")] },
    { id: "r-piora", description: "Sem broncodilatador e sem VNI em 25 min: fadiga", priority: 30, when: { all: [{ time: "gte", seconds: 1500 }, { not: BD }, { not: VNI }] }, repeat: "once", effects: [trend("pco2", 78, 900, "fadiga", 30), trend("ph", 7.2, 900, "fadiga", 30), trend("spo2", 80, 300, "fadiga", 25), flag("consciousness", "voz"), staff("enfermagem", "Ele está cada vez mais cansado e sonolento."), outcome("piora")] },
    { id: "r-regulacao", description: "Regulação de leito", when: { actionCompleted: "acionar_samu" }, repeat: "once", effects: [staff("regulacao", "Regulação: leito de enfermaria clínica com suporte de VNI em hospital de referência; previsão de 3 horas.")] }
  ],
  diagnosis: { primary: "dpoc_exacerbado", accepted: ["dpoc_exacerbado"], differentials: ["pneumonia", "icc_descompensada", "tep", "pneumotorax_espontaneo", "asma_grave"] },
  acceptedDestinations: ["transferencia_regulada", "permanece_em_sala_vermelha"],
  outcomeNotes: "Exacerbação com acidose respiratória (pH 7,29; PaCO₂ 64): O₂ controlado (alvo 88–92%), salbutamol + ipratrópio, corticoide sistêmico, antibiótico pela purulência e VNI. O₂ em alto fluxo eleva a PaCO₂ e causa narcose.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Caracterizou a exacerbação (escarro, febre, internações prévias, O₂ domiciliar)", evidence: { kind: "historyAsked", items: ["h-escarro", "h-febre", "h-internacoes", "h-o2-casa"], minCount: 3 }, points: 7, severity: "importante", rationale: "Purulência orienta antibiótico; gravidade prévia orienta destino.", sourceIds: ["INT-GOLD"] },
    { id: "s-exame", domain: "historia", description: "Ausculta e sinais de esforço", evidence: { kind: "examDone", regions: ["torax_posterior", "geral"], minCount: 2 }, points: 5, severity: "importante", rationale: "Gravidade e diferenciais (pneumotórax)." },
    { id: "s-o2", domain: "priorizacao", description: "O₂ controlado por cânula", evidence: { kind: "actionDone", anyOf: ["o2_cateter", "vni"], withinSeconds: 300 }, points: 8, severity: "critica", rationale: "Alvo de SpO₂ 88–92% em retentores de CO₂.", sourceIds: ["INT-GOLD", "BR-DPOC"] },
    { id: "s-o2-alto", domain: "priorizacao", description: "Falha: O₂ em alto fluxo levando à narcose", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-narcose" } }, points: 10, penalty: true, severity: "critica", rationale: "Hiperóxia piora a hipercapnia (relação V/Q e efeito Haldane)." },
    { id: "s-gaso", domain: "exames", description: "Gasometria arterial", evidence: { kind: "testOrdered", anyOf: ["gaso_arterial", "gaso_venosa"], withinSeconds: 900 }, points: 9, severity: "critica", rationale: "Acidose respiratória indica VNI.", sourceIds: ["INT-GOLD"] },
    { id: "s-exames", domain: "exames", description: "Exames dirigidos (RX, ECG, hemograma)", evidence: { kind: "testsNotExcessive", maxUnjustified: 1, justified: ["gaso_arterial", "gaso_venosa", "rx_torax", "ecg12", "hemograma", "eletrolitos", "funcao_renal", "pcr", "troponina"] }, points: 6, severity: "menor", rationale: "Excluir pneumonia, pneumotórax, IC e arritmia." },
    { id: "s-bd", domain: "tratamento", description: "Salbutamol + ipratrópio", evidence: { kind: "drugGiven", anyOf: ["salbutamol"], withinSeconds: 900 }, points: 9, severity: "critica", rationale: "Broncodilatadores de curta ação são a base.", sourceIds: ["INT-GOLD", "BR-DPOC"] },
    { id: "s-ipra", domain: "tratamento", description: "Anticolinérgico associado", evidence: { kind: "drugGiven", anyOf: ["ipratropio"] }, points: 3, severity: "importante", rationale: "Associação de curta ação.", sourceIds: ["INT-GOLD"] },
    { id: "s-cortico", domain: "tratamento", description: "Corticoide sistêmico", evidence: { kind: "drugGiven", anyOf: ["prednisona", "metilprednisolona", "hidrocortisona"] }, points: 5, severity: "importante", rationale: "Reduz falha e tempo de recuperação (curso curto).", sourceIds: ["INT-GOLD"] },
    { id: "s-vni", domain: "tratamento", description: "VNI na acidose respiratória", evidence: { kind: "actionDone", anyOf: ["vni"], withinSeconds: 1800 }, points: 8, severity: "critica", rationale: "pH < 7,35 com PaCO₂ elevada: VNI reduz intubação e mortalidade.", sourceIds: ["INT-GOLD"] },
    { id: "s-reav", domain: "reavaliacao", description: "Gasometria de controle após VNI", evidence: { kind: "reassessAfter", after: ["vni"], reassess: ["gaso_arterial", "gaso_venosa"], withinSeconds: 3600 }, points: 10, severity: "importante", rationale: "Resposta em 1–2 h define manutenção ou intubação." },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de exacerbação de DPOC", evidence: { kind: "diagnosis", accepted: ["dpoc_exacerbado"] }, points: 4, severity: "importante", rationale: "Piora aguda de dispneia e escarro." },
    { id: "s-destino", domain: "destino", description: "Regulação de leito mantendo sala vermelha", evidence: { kind: "disposition", accepted: ["transferencia_regulada", "permanece_em_sala_vermelha"] }, points: 6, severity: "importante", rationale: "Acidose respiratória exige internação.", sourceIds: ["BR-UPA"] }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Qual saturação é a meta neste paciente?" },
      { level: 2, text: "O que a gasometria diz sobre a ventilação?" },
      { level: 3, text: "Mais oxigênio nem sempre é melhor em retentores de CO₂." },
      { level: 4, text: "Sugestão explícita: cânula 1–2 L/min (alvo 88–92%), salbutamol + ipratrópio, prednisona, gasometria, VNI, antibiótico pela purulência e regulação." }
    ],
    summary: "Homem de 66 anos com DPOC grave, exacerbação infecciosa (escarro purulento) e acidose respiratória aguda sobre crônica.",
    pathophysiology: "Infecção aumenta resistência das vias aéreas e hiperinsuflação dinâmica; a musculatura fadiga e a ventilação alveolar cai, elevando a PaCO₂. Oxigênio em excesso desfaz a vasoconstrição hipóxica (piora V/Q) e reduz a afinidade da hemoglobina por CO₂, elevando ainda mais a PaCO₂.",
    keyPoints: [
      "Alvo de SpO₂ 88–92% com O₂ controlado.",
      "Salbutamol + ipratrópio; corticoide sistêmico por curso curto.",
      "Antibiótico se escarro purulento (Anthonisen).",
      "VNI se pH < 7,35 e PaCO₂ > 45.",
      "Gasometria de controle orienta sucesso/falha."
    ],
    alternatives: ["Antibiótico (ex.: amoxicilina-clavulanato) indicado pela purulência — não modelado no catálogo desta versão.", "Corticoide IV quando VO não é possível."],
    oralRubric: [
      { id: "o1", concept: "O₂ controlado 88–92%", synonyms: ["88", "92", "controlado", "baixo fluxo"], weight: 3 },
      { id: "o2", concept: "Broncodilatadores", synonyms: ["salbutamol", "ipratrópio", "broncodilatador"], weight: 2 },
      { id: "o3", concept: "Corticoide", synonyms: ["prednisona", "corticoide"], weight: 1 },
      { id: "o4", concept: "VNI", synonyms: ["vni", "não invasiva", "bipap"], weight: 3 }
    ],
    simplifications: ["Tempos de resposta à VNI e à hiperóxia comprimidos.", "Antibiótico não incluído no catálogo desta versão."]
  },
  references: ["INT-GOLD", "BR-DPOC", "BR-UPA", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 8, allowSexSwap: true, allowWeightPercent: 10, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Cânula, BD, corticoide, gasometria, VNI e controle", commands: [act(5, "monitorizar"), act(15, "o2_cateter", { fluxo: 1 }), ask(30, "h-escarro"), ask(40, "h-internacoes"), test(60, "gaso_arterial"), act(80, "nebulizacao_montar"), rx(100, "salbutamol", "neb5", 5, "mg", "nebulizacao"), rx(110, "ipratropio", "neb025", 0.5, "mg", "nebulizacao"), rx(200, "prednisona", "cp20", 40, "mg", "VO"), act(600, "vni"), test(2400, "gaso_arterial"), act(2500, "acionar_samu"), dx(3000, "dpoc_exacerbado"), dest(3000, "permanece_em_sala_vermelha")], runUntilSeconds: 3200, expect: [{ condition: { ruleFired: "r-vni-sucesso" }, description: "melhora com VNI" }, { condition: { not: { ruleFired: "r-narcose" } }, description: "sem narcose" }, { condition: { path: "vars.ph", op: "gte", value: 7.33 }, description: "pH corrigindo" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 2000, expect: [{ condition: { ruleFired: "r-piora" }, description: "fadiga" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Máscara com reservatório 15 L/min", commands: [act(10, "o2_mascara_reservatorio", { fluxo: 15 })], runUntilSeconds: 1200, expect: [{ condition: { ruleFired: "r-narcose" }, description: "narcose por CO₂" }] },
    { id: "t-atraso", kind: "delay", description: "Cânula sem broncodilatador; BD e VNI só aos 30 min", commands: [act(15, "o2_cateter", { fluxo: 2 }), act(1800, "nebulizacao_montar"), rx(1820, "salbutamol", "neb5", 5, "mg", "nebulizacao"), rx(1830, "ipratropio", "neb025", 0.5, "mg", "nebulizacao"), act(1900, "vni")], runUntilSeconds: 3500, expect: [{ condition: { ruleFired: "r-piora" }, description: "fadiga pelo atraso" }, { condition: { ruleFired: "r-vni-sucesso" }, description: "recuperação" }] },
    { id: "t-alternativa", kind: "alternative", description: "VNI direto, corticoide IV", commands: [act(5, "vni"), act(30, "acesso_venoso"), act(130, "acesso_venoso"), act(150, "nebulizacao_montar"), rx(160, "salbutamol", "neb5", 5, "mg", "nebulizacao"), rx(170, "ipratropio", "neb025", 0.5, "mg", "nebulizacao"), rx(200, "metilprednisolona", "fa125", 40, "mg", "IV")], runUntilSeconds: 2000, expect: [{ condition: { ruleFired: "r-vni-sucesso" }, description: "melhora" }] }
  ]
};
