import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, hi, obs, outcome, oxygenResponse, rx, staff, test, trend } from "./helpers";

const ATROPINA = { drugGiven: "atropina" };
const ATROPINIZADO = { drugGiven: "atropina", minTotal: { value: 6, unit: "mg" as const } };
const DESCONTAMINADO = { actionCompleted: "descontaminacao_cutanea" };

export const C090: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C090",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Trabalhador rural com falta de ar, suor e vômitos depois de pulverizar a lavoura",
  teachingTitle: "Intoxicação por organofosforado — síndrome colinérgica, descontaminação, atropina em doses dobradas até atropinização e UTI",
  group: "Toxicologia",
  specialties: ["Toxicologia", "Emergência", "Medicina intensiva"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Reconhecer a síndrome colinérgica (muscarínica, nicotínica e central) após exposição a agrotóxico",
    "Proteger a equipe e descontaminar (retirar roupas, lavar pele com água e sabão)",
    "Atropina IV 1–3 mg dobrando a cada 5 min até atropinização (tórax limpo, FC > 80, PAS > 80)",
    "Não esperar exame de colinesterase para tratar; acionar o CIATox; UTI"
  ],
  keywords: ["lavoura", "falta de ar", "suor", "vômito", "baba", "tremor"],
  patient: {
    name: "Joaquim Pereira",
    ageYears: 42,
    sex: "masculino",
    weightKg: 74,
    heightCm: 172,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 4, hairStyle: "curto", hairColor: "preto", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "Sala de emergência de hospital regional no interior. Homem de 42 anos trazido pelo patrão da fazenda: pulverizou a lavoura de manhã com bomba costal, sem máscara nem luvas. Há 1 hora começou com vômitos, diarreia, suor e falta de ar. A roupa ainda está molhada e com cheiro forte.",
  communication: "limitada",
  informants: [{ id: "paciente", name: "Joaquim", role: "Paciente" }, { id: "patrao", name: "Sr. Valter", role: "Empregador" }],
  history: [
    hi("h-exposicao", "exposicao", "O que ele estava aplicando? Por quanto tempo? Tem a embalagem?", [{ source: "patrao", text: "Veneno de lavoura para praga do feijão, umas 4 horas. A embalagem ficou na fazenda; tirei foto do rótulo, mas não dá para ler direito." }], ["veneno", "aplicando", "embalagem", "rótulo", "agrotóxico"]),
    hi("h-sintomas", "fatores_associados", "Que sintomas apareceram?", [{ source: "paciente", text: "Muita baba... suor... vomitei, evacuei na roupa... a vista ficou escura... o peito chiando." }], ["sintomas", "baba", "suor", "vista", "chiado"]),
    hi("h-intencao", "humor_risco", "Foi acidente? Ele bebeu ou tomou algo de propósito?", [{ source: "paciente", text: "Foi no serviço, doutor... não bebi nada." }, { source: "patrao", text: "Ele estava trabalhando normal, sem problema nenhum." }], ["propósito", "acidente", "bebeu", "intenção"]),
    hi("h-tempo", "inicio", "Quando parou de aplicar e quando começaram os sintomas?", [{ source: "patrao", text: "Parou às 11 h; começou a passar mal por volta do meio-dia. Chegamos às 13 h." }], ["quando", "horas", "começou"]),
    hi("h-antecedentes", "antecedentes", "Tem alguma doença ou usa remédio?", [{ source: "paciente", text: "Nada não." }], ["doença", "remédio"])
  ],
  initial: {
    vars: { hr: 54, sbp: 92, dbp: 58, rr: 28, spo2: 87, temp: 36.4, gcs: 14, pain: 3, glucose: 128, perfusion: 0.6, effort: 0.7, k: 3.9 },
    flags: { rhythm: "bradicardia_sinusal", sweating: true, tremor: true, wheeze: true, posture: "sentado", painVisual: "leve", speech: "palavras", consciousness: "alerta", agitation: false },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-olhos", "olhos", "inspecao", "Pupilas puntiformes, pouco reativas; lacrimejamento.", { label: "Pupilas" }),
    ex("e-boca", "boca", "inspecao", "Sialorreia abundante; secreção espumosa.", { label: "Boca/secreções", better: [{ when: { ruleFired: "r-atropinizacao" }, text: "Boca seca; sem secreção acumulada." }] }),
    ex("e-torax", "torax_anterior", "ausculta", "Estertores difusos e sibilos (broncorreia e broncoespasmo).", { label: "Tórax", sound: "estertores", better: [{ when: { ruleFired: "r-atropinizacao" }, text: "Tórax limpo, sem sibilos — critério de atropinização atingido." }] }),
    ex("e-pele", "pele", "inspecao", "Sudorese profusa; fasciculações em panturrilhas e pálpebras; roupa úmida com odor forte de agrotóxico.", { label: "Pele e músculos", better: [{ when: { all: [{ ruleFired: "r-atropinizacao" }, DESCONTAMINADO] }, text: "Pele seca após descontaminação; fasciculações discretas (efeito nicotínico não revertido pela atropina)." }] }),
    ex("e-neuro", "neurologico", "inspecao", "Sonolento, obedece a comandos; fraqueza proximal leve.", { label: "Neurológico" }),
    ex("e-abdome", "abdome_qid", "ausculta", "Ruídos hidroaéreos aumentados.", { sound: "ruidos_hidroaereos" })
  ],
  testResults: [
    { testId: "colinesterase", variants: [{ text: "Butirilcolinesterase muito reduzida (resultado após 2 h) — confirma exposição a anticolinesterásico; não se correlaciona com a gravidade." }] },
    { testId: "ecg12", variants: [{ when: { ruleFired: "r-atropinizacao" }, text: "Taquicardia sinusal, QTc 450 ms." }, { text: "Bradicardia sinusal 54 bpm; QTc 470 ms." }] },
    { testId: "gaso_arterial", variants: [{ text: "Hipoxemia com acidose respiratória leve; lactato 2,8." }] }
  ],
  highlightedActions: ["descontaminacao_cutanea", "o2_mascara_reservatorio", "acesso_venoso", "contato_ciatox"],
  rules: [
    oxygenResponse(91, 90, undefined, 30),
    { id: "r-curso", description: "Crise colinérgica progressiva", priority: 10, when: { always: true }, repeat: "once", effects: [trend("spo2", 80, 1500, "inv", 10), trend("hr", 44, 1500, "inv", 10), trend("sbp", 82, 1500, "inv", 10), trend("effort", 0.85, 1500, "inv", 10), trend("gcs", 12, 1800, "inv", 10)] },
    { id: "r-atropina-parcial", description: "Primeira dose: resposta parcial", priority: 30, when: ATROPINA, repeat: "once", effects: [trend("hr", 72, 300, "atr", 30), trend("sbp", 96, 300, "atr", 30), staff("enfermagem", "FC subiu um pouco, mas o pulmão continua cheio de secreção.")] },
    { id: "r-atropinizacao", description: "Atropinização atingida (tórax limpo, FC > 80, PAS > 80)", priority: 60, when: ATROPINIZADO, repeat: "once", effects: [trend("hr", 98, 300, "atr2", 60), trend("sbp", 112, 300, "atr2", 60), trend("spo2", 96, 300, "atr2", 60), trend("effort", 0.3, 300, "atr2", 60), trend("rr", 20, 300, "atr2", 60), trend("gcs", 15, 900, "atr2", 60), flag("wheeze", false), flag("rhythm", "taquicardia_sinusal"), flag("speech", "frases"), staff("supervisor", "Tórax limpo, FC > 80, PAS > 80: atropinizado. Iniciar infusão de manutenção e vigiar excesso (delirium, hipertermia, íleo, retenção urinária)."), outcome("melhora")] },
    { id: "r-falencia", description: "Insuficiência respiratória por broncorreia/fraqueza", priority: 35, when: { all: [{ time: "gte", seconds: 1500 }, { not: { ruleFired: "r-atropinizacao" } }] }, repeat: "once", effects: [trend("spo2", 76, 300, "fal", 35), trend("gcs", 9, 600, "fal", 35), flag("speech", "nenhuma"), staff("enfermagem", "Ele está se afogando na secreção e não responde mais!"), outcome("piora")] },
    { id: "r-sem-descontaminacao", description: "Absorção dérmica continuada e risco à equipe", priority: 25, when: { all: [{ time: "gte", seconds: 2400 }, { not: DESCONTAMINADO }] }, repeat: "once", effects: [staff("enfermagem", "A técnica que o atendeu sem luvas está com náusea e suando. A roupa dele continua encharcada."), obs("Sem descontaminação a absorção pela pele continua e a equipe se contamina.")] }
  ],
  diagnosis: { primary: "intox_organofosforado", accepted: ["intox_organofosforado"], differentials: ["intox_opioide", "intox_benzodiazepinico", "intox_estimulante"] },
  acceptedDestinations: ["uti"],
  outcomeNotes: "Exposição dérmica/inalatória ocupacional a inseticida anticolinesterásico com síndrome colinérgica grave (broncorreia, broncoespasmo, bradicardia, miose, sudorese, fasciculações). Equipe com EPI, descontaminação, O2, acesso, atropina 1–3 mg IV dobrando a cada 5 min até tórax limpo/FC > 80/PAS > 80, manutenção, CIATox (oxima conforme orientação), UTI. Colinesterase confirma, mas não guia a atropina.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Exposição, tempo e intencionalidade", evidence: { kind: "historyAsked", items: ["h-exposicao", "h-tempo", "h-intencao"], minCount: 2 }, points: 8, severity: "critica", rationale: "Agente, via e tempo; ingestão intencional muda a gravidade." },
    { id: "s-exame", domain: "historia", description: "Pupilas, tórax e pele", evidence: { kind: "examDone", regions: ["olhos", "torax_anterior", "pele", "boca"], minCount: 3 }, points: 8, severity: "importante", rationale: "Toxíndrome colinérgica." },
    { id: "s-descont", domain: "priorizacao", description: "Descontaminação cutânea com EPI", evidence: { kind: "actionDone", anyOf: ["descontaminacao_cutanea"], withinSeconds: 900 }, points: 12, severity: "critica", rationale: "Interrompe absorção e protege a equipe.", sourceIds: ["INT-LITFL-OP"] },
    { id: "s-o2", domain: "priorizacao", description: "O2 e monitorização", evidence: { kind: "actionDone", anyOf: ["o2_mascara_reservatorio", "o2_cateter"], withinSeconds: 300 }, points: 6, severity: "importante", rationale: "Hipoxemia." },
    { id: "s-acesso", domain: "priorizacao", description: "Acesso venoso", evidence: { kind: "actionDone", anyOf: ["acesso_venoso", "acesso_io"], withinSeconds: 400 }, points: 4, severity: "importante", rationale: "Atropina IV." },
    { id: "s-atropina", domain: "tratamento", description: "Atropina IV precoce", evidence: { kind: "drugGiven", anyOf: ["atropina"], routes: ["IV"], withinSeconds: 600 }, points: 16, severity: "critica", rationale: "Antídoto dos efeitos muscarínicos.", sourceIds: ["INT-QLD-ATROPINA-2023"] },
    { id: "s-atropinizacao", domain: "tratamento", description: "Doses dobradas até atropinização", evidence: { kind: "drugGiven", anyOf: ["atropina"], minTotal: { value: 6, unit: "mg" }, withinSeconds: 1200 }, points: 14, severity: "critica", rationale: "Subdose é o erro mais comum.", sourceIds: ["INT-QLD-ATROPINA-2023", "INT-LITFL-OP"] },
    { id: "s-reav", domain: "reavaliacao", description: "Reausculta após atropina", evidence: { kind: "reassessAfter", after: ["atropina"], reassess: ["torax_anterior", "monitorizar"], withinSeconds: 600 }, points: 8, severity: "importante", rationale: "O alvo é o tórax limpo, não a pupila.", sourceIds: ["INT-QLD-ATROPINA-2023"] },
    { id: "s-ciatox", domain: "destino", description: "CIATox", evidence: { kind: "actionDone", anyOf: ["contato_ciatox"] }, points: 6, severity: "importante", rationale: "Oxima, identificação do agente, notificação.", sourceIds: ["BR-CIATOX"] },
    { id: "s-falencia", domain: "tratamento", description: "Falha: insuficiência respiratória por subtratamento", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-falencia" } }, points: 10, penalty: true, severity: "critica", rationale: "Atropina insuficiente/tardia." },
    { id: "s-sem-desc", domain: "priorizacao", description: "Falha: sem descontaminação", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-sem-descontaminacao" } }, points: 6, penalty: true, severity: "importante", rationale: "Contaminação da equipe." },
    { id: "s-dx", domain: "destino", description: "Intoxicação por anticolinesterásico", evidence: { kind: "diagnosis", accepted: ["intox_organofosforado"] }, points: 8, severity: "importante", rationale: "Toxíndrome + exposição." },
    { id: "s-destino", domain: "destino", description: "UTI", evidence: { kind: "disposition", accepted: ["uti"] }, points: 10, severity: "importante", rationale: "Infusão de atropina, risco de recorrência e de síndrome intermediária." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Pupilas, secreções, suor e pulso lento: qual toxíndrome?" },
      { level: 2, text: "A roupa ainda está molhada — e a equipe está protegida?" },
      { level: 3, text: "Qual antídoto, e qual o alvo clínico para parar de aumentar a dose?" },
      { level: 4, text: "Sugestão explícita: EPI e descontaminação, O2, acesso, atropina 2 mg IV e depois 4 mg em 5 min, reauscultar, CIATox, UTI." }
    ],
    summary: "Intoxicação ocupacional grave por inseticida anticolinesterásico com síndrome colinérgica.",
    pathophysiology: "Organofosforados (e carbamatos) inibem a acetilcolinesterase: acúmulo de acetilcolina em receptores muscarínicos (broncorreia, broncoespasmo, bradicardia, miose, sudorese, vômitos, diarreia), nicotínicos (fasciculações, fraqueza, paralisia) e no SNC (sonolência, convulsões). A atropina antagoniza apenas os efeitos muscarínicos; as oximas reativam a enzima antes do 'envelhecimento'.",
    keyPoints: [
      "Atropina 1–3 mg IV; sem resposta em 5 min, dobrar a dose anterior até atropinização.",
      "Alvos: tórax limpo sem sibilos, FC > 80, PAS > 80 — taquicardia não contraindica atropina.",
      "Manutenção com 10–20% da dose total de ataque por hora; vigiar excesso (delirium, hipertermia, íleo).",
      "Descontaminação com EPI: retirar roupas, água e sabão.",
      "Colinesterase confirma exposição, mas não guia tratamento; discutir oxima com o CIATox."
    ],
    alternatives: ["Intubação se rebaixamento ou falência ventilatória apesar da atropina.", "Benzodiazepínico IV para agitação ou convulsões."],
    oralRubric: [
      { id: "o1", concept: "Síndrome colinérgica", synonyms: ["colinérgica", "muscarínico", "nicotínico", "miose", "broncorreia"], weight: 2 },
      { id: "o2", concept: "Descontaminação/EPI", synonyms: ["descontaminação", "roupa", "lavar", "epi"], weight: 2 },
      { id: "o3", concept: "Atropina dobrando", synonyms: ["atropina", "dobrar", "atropinização"], weight: 3 },
      { id: "o4", concept: "Alvos", synonyms: ["tórax limpo", "fc > 80", "pas > 80", "secreção"], weight: 2 }
    ],
    simplifications: ["Oximas não estão no catálogo do simulador; a indicação é discutida com o CIATox.", "A atropinização é atingida com 6 mg acumulados neste caso (casos reais podem exigir muito mais).", "Infusão de manutenção não modelada."]
  },
  references: ["INT-QLD-ATROPINA-2023", "INT-LITFL-OP", "BR-CIATOX", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "EPI/descontaminação, O2, acesso, atropina 2 + 4 mg, reausculta, CIATox, UTI", commands: [ask(10, "h-exposicao"), { atSeconds: 20, type: "examine", payload: { region: "olhos", maneuver: "inspecao" } }, { atSeconds: 30, type: "examine", payload: { region: "torax_anterior", maneuver: "ausculta" } }, { atSeconds: 40, type: "examine", payload: { region: "pele", maneuver: "inspecao" } }, act(50, "o2_mascara_reservatorio"), act(60, "monitorizar"), act(70, "acesso_venoso"), rx(170, "atropina", "amp05", 2, "mg", "IV"), act(180, "descontaminacao_cutanea"), ask(190, "h-tempo"), ask(200, "h-intencao"), rx(480, "atropina", "amp05", 4, "mg", "IV"), { atSeconds: 800, type: "examine", payload: { region: "torax_anterior", maneuver: "ausculta" } }, act(850, "contato_ciatox"), test(900, "colinesterase"), dx(1200, "intox_organofosforado"), dest(1500, "uti")], runUntilSeconds: 2700, expect: [{ condition: { ruleFired: "r-atropinizacao" }, description: "atropinizado" }, { condition: { not: { ruleFired: "r-falencia" } }, description: "sem falência" }, { condition: { path: "vars.hr", op: "gt", value: 80 }, description: "FC > 80" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 2700, expect: [{ condition: { ruleFired: "r-falencia" }, description: "falência" }, { condition: { ruleFired: "r-sem-descontaminacao" }, description: "sem descontaminação" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Trata como edema pulmonar e dá dose de bradicardia uma vez", commands: [act(30, "o2_mascara_reservatorio"), act(40, "acesso_venoso"), rx(140, "furosemida", "amp20", 40, "mg", "IV"), rx(200, "atropina", "amp05", 0.5, "mg", "IV")], runUntilSeconds: 2700, expect: [{ condition: { ruleFired: "r-atropina-parcial" }, description: "resposta parcial" }, { condition: { ruleFired: "r-falencia" }, description: "falência" }, { condition: { not: { ruleFired: "r-atropinizacao" } }, description: "subatropinizado" }] },
    { id: "t-atraso", kind: "delay", description: "Aguarda colinesterase antes da atropina", commands: [act(30, "o2_mascara_reservatorio"), act(40, "acesso_venoso"), test(100, "colinesterase"), act(300, "descontaminacao_cutanea"), rx(1700, "atropina", "amp05", 2, "mg", "IV"), rx(2000, "atropina", "amp05", 4, "mg", "IV"), dest(2600, "uti")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-falencia" }, description: "falência pelo atraso" }, { condition: { ruleFired: "r-atropinizacao" }, description: "atropinização tardia" }] },
    { id: "t-alternativa", kind: "alternative", description: "Descontamina primeiro; atropina 3 mg e depois 6 mg", commands: [act(20, "descontaminacao_cutanea"), act(30, "o2_cateter"), act(40, "acesso_venoso"), rx(250, "atropina", "amp05", 3, "mg", "IV"), rx(560, "atropina", "amp05", 6, "mg", "IV"), act(700, "contato_ciatox"), dest(1500, "uti")], runUntilSeconds: 2700, expect: [{ condition: { ruleFired: "r-atropinizacao" }, description: "atropinizado" }, { condition: { not: { ruleFired: "r-falencia" } }, description: "sem falência" }] }
  ]
};
