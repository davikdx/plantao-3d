import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const TOT = { deviceActive: "tot" };
const VIA_AEREA = { all: [TOT, { actionCompleted: "ventilacao_mecanica" }] };
const HC = { drugGiven: "hidrocortisona" };
const T4 = { drugGiven: "levotiroxina" };
const AQUECER = { actionCompleted: "aquecimento" };
const SEDATIVO = { any: [{ drugGiven: "midazolam" }, { drugGiven: "diazepam" }, { drugGiven: "morfina" }, { drugGiven: "prometazina" }] };
const VOLUME = { any: [{ drugGiven: "sf09", minTotal: { value: 400, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 400, unit: "mL" as const } }] };

export const C054: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C054",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Idosa encontrada gelada e quase sem responder em casa, numa madrugada fria",
  teachingTitle: "Coma mixedematoso — via aérea na hipoventilação, glicose, hidrocortisona antes do hormônio tireoidiano, aquecimento passivo e precipitante",
  group: "Endocrinologia",
  specialties: ["Clínica médica", "Endocrinologia", "Emergência", "Terapia intensiva", "Geriatria"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 4,
  level: "residencia",
  objectives: [
    "Reconhecer coma mixedematoso: rebaixamento, hipotermia, bradicardia, hipoventilação em hipotireóideo com precipitante",
    "Proteger a via aérea e ventilar quando há hipercapnia",
    "Corrigir hipoglicemia e dar hidrocortisona antes ou junto do hormônio tireoidiano",
    "Administrar levotiroxina (por sonda quando a forma IV não está disponível)",
    "Aquecer passivamente, repor volume com cautela, evitar sedativos e tratar o precipitante"
  ],
  keywords: ["frio", "sonolenta", "idosa", "tireoide", "inchada", "não responde"],
  patient: {
    name: "Helga Schmitt",
    ageYears: 74,
    sex: "feminino",
    weightKg: 72,
    heightCm: 156,
    visual: { ageGroup: "idoso", sex: "feminino", skinTone: 0, hairStyle: "curto", hairColor: "branco", build: "robusto", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional na serra, inverno (5 °C de madrugada). O SAMU traz idosa de 74 anos encontrada pela vizinha na cama, fria, quase sem responder. Mora sozinha.",
  communication: "incapaz",
  informants: [{ id: "vizinha", name: "Vizinha", role: "Acompanhante" }, { id: "samu", name: "Técnica do SAMU", role: "Equipe do SAMU 192" }],
  history: [
    hi("h-evolucao", "inicio", "Desde quando ela estava assim?", [{ source: "vizinha", text: "Há umas semanas andava muito lenta, dormindo de dia, reclamando de frio e prisão de ventre. Ontem não atendeu a porta." }], ["quando", "desde", "estava"]),
    hi("h-tireoide", "antecedentes", "Ela tem problema de tireoide? Toma algum remédio?", [{ source: "vizinha", text: "Fez tratamento com iodo para tireoide anos atrás e tomava um comprimido de manhã… acho que parou quando acabou a receita, há uns meses." }], ["tireoide", "remédio", "levotiroxina", "iodo"]),
    hi("h-precipitante", "fatores_associados", "Teve febre, tosse, ardência para urinar? Tomou calmante?", [{ source: "vizinha", text: "Reclamou de ardência pra urinar semana passada. Toma um remédio para dormir às vezes." }], ["febre", "tosse", "urinar", "calmante"]),
    hi("h-samu", "inicio", "Como ela estava quando o SAMU chegou?", [{ source: "samu", text: "Quarto gelado, temperatura axilar não marcava no termômetro comum. Glicemia 52, demos glicose. Respirando devagar." }], ["samu", "chegou", "glicemia"])
  ],
  initial: {
    vars: { hr: 44, sbp: 92, dbp: 60, rr: 8, spo2: 88, temp: 32.6, gcs: 8, pain: 0, glucose: 62, perfusion: 0.5, effort: 0.2, etco2: 64, ph: 7.21, pco2: 68, po2: 58, hco3: 26, lactate: 2.2, na: 121, k: 4.4, creat: 1.5, cpk: 1800, hb: 10.8, wbc: 9200, urine: 15 },
    flags: { rhythm: "bradicardia_sinusal", posture: "supino", painVisual: "nenhuma", speech: "nenhuma", consciousness: "dor", airway: "risco", edema: true },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Face edemaciada, pálida, pele seca e áspera, macroglossia; edema que não deixa cacifo em membros; pele fria.", { label: "Geral" }),
    ex("e-pescoco", "pescoco", "inspecao", "Sem bócio; sem cicatriz.", { label: "Pescoço" }),
    ex("e-respiracao", "torax_anterior", "ausculta", "Respiração lenta e superficial; murmúrio diminuído em bases.", { sound: "murmurio_normal", label: "Respiração", better: [{ when: TOT, text: "Ventilação mecânica, expansão simétrica." }] }),
    ex("e-coracao", "coracao", "ausculta", "Bradicardia, bulhas hipofonéticas.", { sound: "bulhas_abafadas" }),
    ex("e-neuro", "neurologico", "especial", "Glasgow 8 (O2 V2 M4); reflexos com fase de relaxamento lentificada; sem déficit focal.", { label: "Neurológico" }),
    ex("e-abdome", "abdome_qid", "palpacao", "Distendido, ruídos diminuídos; bexiga palpável.", {})
  ],
  testResults: [
    { testId: "funcao_tireoidiana", variants: [{ text: "TSH 86 mUI/L; T4 livre < 0,1 ng/dL. Resultado em 2 horas." }] },
    { testId: "ecg12", variants: [{ text: "Bradicardia sinusal 44 bpm, baixa voltagem difusa, QT prolongado; onda J (Osborn) discreta." }] },
    { testId: "urina_tipo1", variants: [{ text: "Leucocitúria e nitrito positivo." }] },
    { testId: "rx_torax", variants: [{ text: "Laudo educativo: área cardíaca aumentada (possível derrame pericárdico); sem consolidação." }] },
    { testId: "pocus_cardiaco", variants: [{ text: "Derrame pericárdico moderado sem colapso de câmaras direitas; função sistólica preservada." }] }
  ],
  highlightedActions: ["glicemia_capilar", "monitorizar", "acesso_venoso", "intubacao", "ventilacao_mecanica", "aquecimento", "sonda_nasogastrica"],
  rules: [
    { id: "r-curso", description: "Hipometabolismo progressivo: hipoventilação, hipotermia, hipoglicemia", priority: 10, when: { always: true }, repeat: "once", effects: [trend("rr", 6, 1800, "mix", 10), trend("etco2", 78, 2400, "mix", 10), trend("spo2", 82, 2400, "mix", 10), trend("gcs", 6, 2400, "mix", 10), trend("temp", 32.0, 3600, "mix", 10), trend("sbp", 82, 3000, "mix", 10), trend("hr", 40, 3000, "mix", 10), trend("glucose", 45, 2400, "mix", 10)] },
    { id: "r-o2-mascara", description: "O₂ sem ventilação: corrige SpO₂ parcialmente, CO₂ continua subindo", priority: 25, when: { any: [{ deviceActive: "mascara_reservatorio" }, { deviceActive: "cateter_nasal" }] }, repeat: "while", effects: [trend("spo2", 93, 120, "o2", 25)], onEnd: [{ type: "clearTrend", var: "spo2", slot: "o2" }] },
    { id: "r-vm", description: "Via aérea definitiva e ventilação controlada", priority: 60, when: VIA_AEREA, repeat: "once", effects: [trend("spo2", 96, 180, "vm", 60), trend("etco2", 42, 600, "vm", 60), trend("rr", 14, 60, "vm", 60), flag("airway", "protegida")] },
    { id: "r-glicose", description: "Glicose corrige hipoglicemia", priority: 50, when: { drugGiven: "glicose50" }, repeat: "once", effects: [trend("glucose", 120, 120, "g50", 50)] },
    { id: "r-hipoglicemia", description: "Hipoglicemia grave", priority: 30, when: { path: "vars.glucose", op: "lt", value: 50 }, repeat: "once", effects: [trend("gcs", 5, 300, "hipo", 30), staff("enfermagem", "Glicemia 48 no controle."), outcome("piora")] },
    { id: "r-volume", description: "Volume cauteloso", priority: 25, when: VOLUME, repeat: "once", effects: [trend("sbp", 96, 900, "vol", 25)] },
    { id: "r-hc", description: "Hidrocortisona: cobre insuficiência adrenal associada", priority: 40, when: HC, repeat: "once", effects: [trend("sbp", 102, 1200, "hc", 40), trend("dbp", 64, 1200, "hc", 40)] },
    { id: "r-t4-sem-hc", description: "Hormônio tireoidiano sem corticoide: desmascara insuficiência adrenal", priority: 45, when: { all: [T4, { not: HC }] }, repeat: "once", effects: [trend("sbp", 74, 900, "adr", 45, 1800), obs("Repor hormônio tireoidiano acelera o metabolismo do cortisol; sem corticoide, uma insuficiência adrenal latente pode precipitar choque."), outcome("complicacao")] },
    { id: "r-aquecer", description: "Aquecimento passivo (cobertores, ambiente)", priority: 30, when: AQUECER, repeat: "once", effects: [trend("temp", 34.2, 3600, "aquec", 30)] },
    { id: "r-tratamento", description: "Hidrocortisona + levotiroxina + aquecimento: recuperação lenta", priority: 55, when: { all: [HC, T4, AQUECER] }, repeat: "once", effects: [trend("temp", 35.2, 5400, "tto", 55), trend("hr", 58, 5400, "tto", 55), trend("sbp", 110, 3600, "tto", 55), obs("A resposta ao hormônio tireoidiano leva horas a dias; o suporte intensivo sustenta o paciente até lá."), outcome("estabilizacao_parcial")] },
    { id: "r-sedativo", description: "Sedativo/opioide sem via aérea: apneia", priority: 70, when: { all: [SEDATIVO, { not: TOT }] }, repeat: "once", effects: [trend("rr", 3, 120, "sed", 70), trend("spo2", 70, 300, "sed", 70), trend("etco2", 95, 300, "sed", 70), staff("enfermagem", "Ela quase parou de respirar depois da medicação!"), outcome("complicacao")] },
    { id: "r-hipoventilacao", description: "Sem ventilação em 30 min: narcose por CO₂", priority: 35, when: { all: [{ time: "gte", seconds: 1800 }, { not: TOT }] }, repeat: "once", effects: [trend("etco2", 90, 600, "narc", 35), trend("spo2", 78, 600, "narc", 35), trend("gcs", 4, 600, "narc", 35), trend("hr", 36, 600, "narc", 35), flag("consciousness", "irresponsivo"), staff("enfermagem", "Ela não reage mais, respiração quase parando."), outcome("piora")] },
    { id: "r-pcr", description: "Insuficiência respiratória não tratada", priority: 100, when: { all: [{ elapsedSince: "rule:r-hipoventilacao", op: "gte", seconds: 1500 }, { not: TOT }] }, repeat: "once", effects: [flag("pulse", false), { type: "setValue", var: "hr", value: 0 }, staff("enfermagem", "Parou! Sem pulso!"), outcome("parada", true)] }
  ],
  diagnosis: { primary: "coma_mixedematoso", accepted: ["coma_mixedematoso"], differentials: ["intox_benzodiazepinico", "hipoglicemia", "avc_isquemico", "sepse", "hiponatremia", "insuficiencia_respiratoria_hipercapnica", "insuficiencia_adrenal"] },
  acceptedDestinations: ["uti"],
  outcomeNotes: "Coma mixedematoso em idosa com hipotireoidismo pós-iodo que suspendeu a levotiroxina, precipitado por frio, infecção urinária e possivelmente hipnótico: rebaixamento, hipotermia, bradicardia, hipoventilação com hipercapnia, hipoglicemia e hiponatremia. IOT e ventilação, glicose, hidrocortisona, levotiroxina por sonda, aquecimento passivo, volume cauteloso, ceftriaxona e UTI; evitar sedativos.",
  scoring: [
    { id: "s-tireoide", domain: "historia", description: "Perguntou sobre tireoide e medicações", evidence: { kind: "historyAsked", items: ["h-tireoide", "h-precipitante"], minCount: 2 }, points: 8, severity: "critica", rationale: "Hipotireoidismo sem tratamento + precipitante." },
    { id: "s-exame", domain: "historia", description: "Exame geral, respiratório e neurológico", evidence: { kind: "examDone", regions: ["geral", "torax_anterior", "neurologico"], minCount: 3 }, points: 6, severity: "importante", rationale: "Mixedema, hipoventilação, reflexos lentos." },
    { id: "s-glicemia", domain: "priorizacao", description: "Glicemia capilar em até 2 min", evidence: { kind: "actionDone", anyOf: ["glicemia_capilar"], withinSeconds: 120 }, points: 6, severity: "critica", rationale: "Hipoglicemia recorrente." },
    { id: "s-gaso", domain: "exames", description: "Gasometria arterial", evidence: { kind: "testOrdered", anyOf: ["gaso_arterial"], withinSeconds: 900 }, points: 6, severity: "importante", rationale: "Hipercapnia e acidose respiratória." },
    { id: "s-iot", domain: "priorizacao", description: "Via aérea definitiva e ventilação", evidence: { kind: "actionDone", anyOf: ["ventilacao_mecanica"], withinSeconds: 1500 }, points: 14, severity: "critica", rationale: "Glasgow 8 com hipoventilação: não retardar IOT.", sourceIds: ["INT-ENDOTEXT-MIXEDEMA"] },
    { id: "s-glicose", domain: "tratamento", description: "Corrigiu hipoglicemia", evidence: { kind: "drugGiven", anyOf: ["glicose50"], withinSeconds: 900 }, points: 6, severity: "importante", rationale: "Glicemia 62 e caindo.", sourceIds: ["INT-ENDOTEXT-MIXEDEMA"] },
    { id: "s-hc", domain: "tratamento", description: "Hidrocortisona", evidence: { kind: "drugGiven", anyOf: ["hidrocortisona"], withinSeconds: 2400 }, points: 10, severity: "critica", rationale: "Insuficiência adrenal associada/desmascarada.", sourceIds: ["INT-ENDOTEXT-MIXEDEMA"] },
    { id: "s-t4", domain: "tratamento", description: "Levotiroxina (dose de ataque)", evidence: { kind: "drugGiven", anyOf: ["levotiroxina"], withinSeconds: 3600 }, points: 10, severity: "critica", rationale: "Reposição do hormônio é o tratamento específico.", sourceIds: ["INT-ENDOTEXT-MIXEDEMA"] },
    { id: "s-t4-sem-hc", domain: "tratamento", description: "Falha: hormônio tireoidiano antes do corticoide", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-t4-sem-hc" } }, points: 8, penalty: true, severity: "importante", rationale: "Risco de crise adrenal." },
    { id: "s-aquecer", domain: "tratamento", description: "Aquecimento passivo", evidence: { kind: "actionDone", anyOf: ["aquecimento"], withinSeconds: 900 }, points: 4, severity: "importante", rationale: "Cobertores; evitar reaquecimento ativo periférico (vasodilatação e choque).", sourceIds: ["INT-ENDOTEXT-MIXEDEMA"] },
    { id: "s-sedativo", domain: "tratamento", description: "Falha: sedativo/opioide sem via aérea", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-sedativo" } }, points: 8, penalty: true, severity: "critica", rationale: "Metabolismo lento e hipoventilação." },
    { id: "s-precip", domain: "tratamento", description: "Investigou e tratou infecção", evidence: { kind: "drugGiven", anyOf: ["ceftriaxona", "piperacilina_tazobactam", "cefepima"] }, points: 4, severity: "importante", rationale: "Infecção pode não dar febre no mixedema.", sourceIds: ["INT-ENDOTEXT-MIXEDEMA"] },
    { id: "s-reav", domain: "reavaliacao", description: "Glicemia e gasometria seriadas", evidence: { kind: "reassessAfter", after: ["glicose50", "hidrocortisona"], reassess: ["glicemia_capilar", "gaso_arterial", "medir_pa", "medir_temperatura"], withinSeconds: 2400 }, points: 6, severity: "importante", rationale: "Hipoglicemia recorrente; ventilação." },
    { id: "s-dx", domain: "destino", description: "Coma mixedematoso", evidence: { kind: "diagnosis", accepted: ["coma_mixedematoso"] }, points: 4, severity: "importante", rationale: "Diagnóstico clínico; TSH confirma depois." },
    { id: "s-destino", domain: "destino", description: "UTI", evidence: { kind: "disposition", accepted: ["uti"] }, points: 4, severity: "importante", rationale: "Mortalidade 20–50%." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Hipotermia, bradicardia e respiração lenta. Que órgão governa o metabolismo?" },
      { level: 2, text: "Ela fez iodo para a tireoide e parou o comprimido." },
      { level: 3, text: "O CO₂ está subindo: oxigênio sozinho não resolve a ventilação." },
      { level: 4, text: "Sugestão explícita: glicemia/glicose, IOT + ventilação, hidrocortisona, levotiroxina por sonda, cobertores, SF com cautela, urina + ceftriaxona, UTI; sem sedativos." }
    ],
    summary: "Idosa de 74 anos com hipotireoidismo após iodo radioativo, sem levotiroxina há meses, com coma mixedematoso desencadeado por frio, infecção urinária e hipnótico.",
    pathophysiology: "A deficiência grave de hormônio tireoidiano reduz o metabolismo, a termogênese, o drive respiratório e a resposta cardiovascular. A hipoventilação causa hipercapnia e narcose; o excesso de ADH e a menor filtração causam hiponatremia; a gliconeogênese reduzida e a possível insuficiência adrenal causam hipoglicemia. Sedativos e analgésicos são metabolizados lentamente.",
    keyPoints: [
      "Coma mixedematoso: rebaixamento + hipotermia + precipitante em hipotireóideo.",
      "Via aérea e ventilação cedo quando há hipercapnia.",
      "Hidrocortisona antes ou junto do hormônio tireoidiano.",
      "Levotiroxina em dose de ataque (IV quando disponível; por sonda no Brasil quando não há IV).",
      "Aquecimento passivo, volume cauteloso, glicose, tratar infecção, UTI."
    ],
    alternatives: ["Levotiroxina IV 300–500 µg quando disponível.", "Associação com T3 em serviços que dispõem do fármaco.", "Pericardiocentese se derrame com tamponamento (não é o caso)."],
    oralRubric: [
      { id: "o1", concept: "Coma mixedematoso", synonyms: ["mixedema", "hipotireoidismo", "coma mixedematoso"], weight: 2 },
      { id: "o2", concept: "Ventilação", synonyms: ["intubação", "ventilação", "hipercapnia", "co2"], weight: 2 },
      { id: "o3", concept: "Corticoide antes do T4", synonyms: ["hidrocortisona", "corticoide", "adrenal"], weight: 3 },
      { id: "o4", concept: "Levotiroxina", synonyms: ["levotiroxina", "t4", "hormônio"], weight: 2 },
      { id: "o5", concept: "Aquecimento passivo", synonyms: ["cobertor", "aquecimento passivo", "reaquecimento"], weight: 1 }
    ],
    simplifications: ["Levotiroxina sem regra de dose validada no catálogo (o app alerta); via por sonda representa a prática quando não há forma IV.", "A ação de aquecimento não distingue passivo de ativo.", "Hiponatremia não é tratada especificamente."]
  },
  references: ["INT-ENDOTEXT-MIXEDEMA", "BR-SAMU-SAV", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Glicemia, O₂, monitor, história, glicose, gasometria, IOT + VM, hidrocortisona, SF, aquecimento, levotiroxina por SNG, urina + ceftriaxona, UTI", commands: [act(5, "glicemia_capilar"), act(15, "o2_mascara_reservatorio", { fluxo: 10 }), act(25, "monitorizar"), ask(35, "h-tireoide"), ask(45, "h-precipitante"), { atSeconds: 55, type: "examine", payload: { region: "geral", maneuver: "inspecao" } }, { atSeconds: 65, type: "examine", payload: { region: "torax_anterior", maneuver: "ausculta" } }, { atSeconds: 75, type: "examine", payload: { region: "neurologico", maneuver: "especial" } }, act(90, "acesso_venoso"), rx(200, "glicose50", "amp10", 20, "g", "IV"), test(220, "gaso_arterial"), act(300, "intubacao"), act(430, "intubacao"), act(560, "ventilacao_mecanica"), rx(600, "hidrocortisona", "fa100", 100, "mg", "IV"), rx(620, "sf09", "bolsa500", 500, "mL", "IV", "infusao_volume", { durationMinutes: 30 }), act(640, "aquecimento"), act(700, "sonda_nasogastrica"), rx(950, "levotiroxina", "cp100", 0.3, "mg", "SNG"), test(1000, "urina_tipo1"), test(1010, "funcao_tireoidiana"), rx(1500, "ceftriaxona", "fa1g", 2000, "mg", "IV"), act(1800, "glicemia_capilar"), dx(2300, "coma_mixedematoso"), dest(2400, "uti")], runUntilSeconds: 4000, expect: [{ condition: { ruleFired: "r-vm" }, description: "ventilação" }, { condition: { ruleFired: "r-tratamento" }, description: "tratamento específico" }, { condition: { not: { ruleFired: "r-t4-sem-hc" } }, description: "corticoide antes" }, { condition: { not: { ruleFired: "r-hipoventilacao" } }, description: "sem narcose" }, { condition: { path: "vars.glucose", op: "gte", value: 70 }, description: "glicemia normal" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-hipoglicemia" }, description: "hipoglicemia" }, { condition: { ruleFired: "r-hipoventilacao" }, description: "narcose" }, { condition: { ruleFired: "r-pcr" }, description: "PCR" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Só máscara de O₂, levotiroxina sem corticoide e prometazina", commands: [act(10, "o2_mascara_reservatorio", { fluxo: 10 }), act(30, "acesso_venoso"), act(100, "sonda_nasogastrica"), rx(400, "levotiroxina", "cp100", 0.3, "mg", "SNG"), rx(500, "prometazina", "amp25", 25, "mg", "IM")], runUntilSeconds: 2400, expect: [{ condition: { ruleFired: "r-t4-sem-hc" }, description: "insuficiência adrenal desmascarada" }, { condition: { ruleFired: "r-sedativo" }, description: "apneia por sedativo" }, { condition: { ruleFired: "r-hipoventilacao" }, description: "narcose" }] },
    { id: "t-atraso", kind: "delay", description: "IOT só após narcose (35 min)", commands: [act(5, "glicemia_capilar"), act(20, "acesso_venoso"), rx(130, "glicose50", "amp10", 20, "g", "IV"), rx(200, "hidrocortisona", "fa100", 100, "mg", "IV"), act(2100, "intubacao"), act(2230, "intubacao"), act(2360, "ventilacao_mecanica")], runUntilSeconds: 4200, expect: [{ condition: { ruleFired: "r-hipoventilacao" }, description: "narcose pelo atraso" }, { condition: { ruleFired: "r-vm" }, description: "ventilação tardia" }, { condition: { not: { ruleFired: "r-pcr" } }, description: "PCR evitada" }] },
    { id: "t-alternativa", kind: "alternative", description: "Acesso IO, glicose, IOT, hidrocortisona e levotiroxina", commands: [act(10, "acesso_io"), rx(100, "glicose50", "amp10", 25, "g", "IV"), act(150, "intubacao"), act(280, "intubacao"), act(410, "ventilacao_mecanica"), rx(450, "hidrocortisona", "fa100", 100, "mg", "IV"), act(470, "aquecimento"), act(490, "sonda_nasogastrica"), rx(700, "levotiroxina", "cp100", 0.3, "mg", "SNG"), dest(1800, "uti")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-vm" }, description: "ventilação" }, { condition: { ruleFired: "r-tratamento" }, description: "tratamento específico" }] }
  ]
};
