import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const TOT = { deviceActive: "tot" };
const VIA_AEREA = { all: [TOT, { actionCompleted: "ventilacao_mecanica" }] };
const O2_ALTO = { any: [{ deviceActive: "mascara_reservatorio" }, TOT, { deviceActive: "bvm" }] };
const CRISTALOIDE = { any: [{ drugGiven: "ringer_lactato", minTotal: { value: 100, unit: "mL" as const } }, { drugGiven: "sf09", minTotal: { value: 100, unit: "mL" as const } }] };
const EXCESSO = { any: [{ drugGiven: "ringer_lactato", minTotal: { value: 2000, unit: "mL" as const } }, { drugGiven: "sf09", minTotal: { value: 2000, unit: "mL" as const } }] };
const ATB = { any: [{ drugGiven: "ceftriaxona" }, { drugGiven: "piperacilina_tazobactam" }, { drugGiven: "vancomicina" }, { drugGiven: "cefepima" }, { drugGiven: "clindamicina" }] };

export const C046: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C046",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Mulher resgatada de incêndio em casa, com o rosto queimado e voz rouca",
  teachingTitle: "Grande queimado com lesão inalatória — via aérea precoce, O₂ a 100% (CO), reposição guiada pela diurese e transferência",
  group: "Trauma",
  specialties: ["Trauma", "Queimados", "Emergência", "Terapia intensiva"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 4,
  level: "residencia",
  objectives: [
    "Reconhecer sinais de lesão inalatória e obstrução iminente de via aérea",
    "Indicar intubação precoce antes que o edema torne a via aérea impossível",
    "Suspeitar de intoxicação por monóxido de carbono apesar de SpO₂ normal; O₂ a 100%",
    "Estimar a superfície corporal queimada e iniciar reposição com Ringer lactato titulada pela diurese, sem excesso",
    "Cobrir as queimaduras, evitar hipotermia, analgesia e regular para centro de queimados"
  ],
  keywords: ["incêndio", "fogo", "queimadura", "fumaça", "rouca", "rosto"],
  patient: {
    name: "Cláudia Ferreira",
    ageYears: 45,
    sex: "feminino",
    weightKg: 65,
    heightCm: 162,
    visual: { ageGroup: "adulto", sex: "feminino", skinTone: 2, hairStyle: "longo", hairColor: "castanho", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional (sem unidade de queimados). Bombeiros trazem mulher de 45 anos retirada de um quarto em chamas, em ambiente fechado, há 30 minutos. Queimaduras em face, tronco e braços. Fala com voz rouca.",
  communication: "normal",
  informants: [{ id: "bombeiro", name: "Bombeiro", role: "Corpo de Bombeiros" }],
  history: [
    hi("h-ambiente", "inicio", "Onde ela estava? Ambiente fechado? Quanto tempo?", [{ source: "bombeiro", text: "Presa no quarto, cheio de fumaça preta, uns 10 minutos até a gente entrar. Colchão e cortina queimando." }], ["fechado", "fumaça", "onde", "quanto tempo"]),
    h("h-voz", "sinais_alarme", "A voz mudou? Está difícil respirar ou engolir?", "Minha voz… tá estranha… dói pra engolir.", { keywords: ["voz", "rouca", "respirar", "engolir"] }),
    h("h-cabeca", "fatores_associados", "Tem dor de cabeça, enjoo ou tontura?", "Cabeça latejando… enjoada.", { keywords: ["cabeça", "enjoo", "tontura"] }),
    hi("h-hora", "inicio", "Que horas foi o incêndio?", [{ source: "bombeiro", text: "Por volta de 30–40 minutos atrás." }], ["horas", "quando"]),
    h("h-ample", "antecedentes", "Doenças, alergias, remédios, peso aproximado?", "Pressão alta… losartana. Peso uns 65.", { keywords: ["doença", "alergia", "remédio", "peso", "ample"] })
  ],
  initial: {
    vars: { hr: 118, sbp: 128, dbp: 78, rr: 26, spo2: 97, temp: 36.0, gcs: 14, pain: 9, glucose: 160, perfusion: 0.75, effort: 0.5, cohb: 22, ph: 7.30, lactate: 3.4, hco3: 19, be: -6, hb: 15.2, urine: 25, etco2: 34 },
    flags: { rhythm: "taquicardia_sinusal", posture: "sentado", painVisual: "intensa", speech: "frases", consciousness: "alerta", airway: "risco", agitation: true },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-face", "cabeca", "inspecao", "Queimadura de face com flictenas; sobrancelhas e vibrissas nasais chamuscadas; fuligem nas narinas.", { label: "Face" }),
    ex("e-orofaringe", "boca", "inspecao", "Fuligem e edema em orofaringe; escarro escurecido; voz rouca.", { label: "Via aérea (A)", better: [{ when: TOT, text: "Tubo orotraqueal fixado; edema de glote e mucosa com fuligem vistos à laringoscopia." }, { when: { ruleFired: "r-estridor" }, text: "Estridor inspiratório audível, edema importante de orofaringe e língua." }] }),
    ex("e-pescoco", "pescoco", "inspecao", "Queimadura circunferencial parcial em região anterior do pescoço.", { label: "Pescoço" }),
    ex("e-torax", "torax_anterior", "ausculta", "Murmúrio presente com sibilos difusos; queimadura de 2º grau profundo em tórax anterior.", { sound: "sibilos", label: "Tórax (B)" }),
    ex("e-scq", "pele", "inspecao", "Estimativa (regra dos nove): face 4,5%, tórax anterior 18%, membros superiores 9% (parcial bilateral) — cerca de 30% de superfície corporal com queimadura de 2º e 3º graus.", { label: "Superfície queimada (E)" }),
    ex("e-neuro", "neurologico", "especial", "Glasgow 14 (confusa); pupilas isocóricas.", { label: "Neurológico (D)" })
  ],
  testResults: [
    { testId: "rx_torax", variants: [{ text: "Laudo educativo: sem alterações agudas (a radiografia inicial costuma ser normal na lesão inalatória)." }] }
  ],
  highlightedActions: ["o2_mascara_reservatorio", "monitorizar", "acesso_venoso", "intubacao", "ventilacao_mecanica", "cobrir_queimadura", "aquecimento", "diurese_horaria"],
  rules: [
    { id: "r-edema", description: "Edema progressivo de via aérea superior", priority: 10, when: { always: true }, repeat: "once", effects: [trend("effort", 0.8, 1500, "edema", 10), trend("rr", 32, 1500, "edema", 10)] },
    { id: "r-co", description: "Monóxido de carbono: meia-vida longa em ar ambiente", priority: 10, when: { not: O2_ALTO }, repeat: "while", effects: [trend("cohb", 20, 1200, "co", 10)] },
    { id: "r-o2", description: "O₂ a 100%: eliminação acelerada do CO", priority: 40, when: O2_ALTO, repeat: "once", effects: [trend("cohb", 4, 1500, "o2", 40), trend("gcs", 15, 900, "o2", 40), trend("lactate", 2.4, 1500, "o2", 40)] },
    { id: "r-estridor", description: "Sem via aérea definitiva: estridor (obstrução iminente)", priority: 30, when: { all: [{ time: "gte", seconds: 900 }, { not: TOT }] }, repeat: "once", effects: [flag("speech", "palavras"), flag("stridor", true), trend("spo2", 90, 300, "estr", 30), trend("effort", 0.95, 300, "estr", 30), staff("enfermagem", "Ela está com um chiado alto na garganta e quase não consegue falar!"), outcome("piora")] },
    { id: "r-obstrucao", description: "Obstrução de via aérea por edema", priority: 35, when: { all: [{ time: "gte", seconds: 1800 }, { not: TOT }] }, repeat: "once", effects: [trend("spo2", 70, 180, "obst", 35), trend("gcs", 9, 300, "obst", 35), flag("consciousness", "dor"), flag("speech", "nenhuma"), { type: "changeCommunication", state: "incapaz" }, staff("enfermagem", "Ela não está passando ar! Saturação despencando!"), outcome("piora")] },
    { id: "r-iot-tardia", description: "Intubação após obstrução estabelecida: difícil", priority: 45, when: { all: [TOT, { ruleFired: "r-obstrucao" }] }, repeat: "once", effects: [obs("Intubação muito difícil pelo edema (tubo menor, várias tentativas): risco que a IOT precoce teria evitado."), outcome("complicacao")] },
    { id: "r-vm", description: "Via aérea definitiva com ventilação controlada", priority: 60, when: VIA_AEREA, repeat: "once", effects: [trend("spo2", 97, 180, "vm", 60), trend("effort", 0.2, 180, "vm", 60), trend("rr", 16, 180, "vm", 60), flag("airway", "protegida"), outcome("estabilizacao_parcial")] },
    { id: "r-pcr", description: "Hipóxia por obstrução sem via aérea", priority: 100, when: { all: [{ elapsedSince: "rule:r-obstrucao", op: "gte", seconds: 900 }, { not: TOT }] }, repeat: "once", effects: [flag("pulse", false), { type: "setValue", var: "spo2", value: 0 }, flag("consciousness", "irresponsivo"), staff("enfermagem", "Parou! Sem pulso!"), outcome("parada", true)] },
    { id: "r-hipovolemia", description: "Choque do queimado em evolução sem reposição", priority: 10, when: { all: [{ time: "gte", seconds: 1200 }, { not: CRISTALOIDE }] }, repeat: "once", effects: [trend("urine", 8, 1200, "hipov", 10), trend("hr", 132, 1200, "hipov", 10), trend("sbp", 104, 1200, "hipov", 10), trend("lactate", 4.5, 1500, "hipov", 10)] },
    { id: "r-reposicao", description: "Ringer lactato titulado: diurese na meta", priority: 30, when: CRISTALOIDE, repeat: "once", effects: [trend("urine", 40, 900, "rep", 30), trend("hr", 108, 1200, "rep", 30), trend("sbp", 122, 1200, "rep", 30)] },
    { id: "r-excesso", description: "Bolus liberal (≥ 2 L em 1 h): piora do edema", priority: 50, when: EXCESSO, repeat: "once", effects: [trend("effort", 0.95, 600, "exc", 50), trend("spo2", 88, 600, "exc", 50, 1200), obs("Reposição excessiva: mais edema de via aérea e de tecidos (\"fluid creep\"). Titular pela diurese."), outcome("complicacao")] },
    { id: "r-hipotermia", description: "Queimaduras expostas sem aquecimento: hipotermia", priority: 15, when: { all: [{ time: "gte", seconds: 900 }, { not: { actionCompleted: "cobrir_queimadura" } }, { not: { actionCompleted: "aquecimento" } }] }, repeat: "once", effects: [trend("temp", 34.8, 1200, "frio", 15)] },
    { id: "r-atb", description: "Antibiótico profilático sistêmico", priority: 20, when: ATB, repeat: "once", effects: [obs("Antibiótico sistêmico profilático não é indicado no queimado agudo sem infecção.")] },
    { id: "r-regulacao", description: "Regulação para centro de queimados", priority: 20, when: { actionCompleted: "acionar_samu" }, repeat: "once", effects: [staff("regulacao", "Regulação: vaga no centro de referência em queimados. Transporte em USA após via aérea assegurada; enviem a superfície queimada, o horário do incêndio e o volume infundido.")] }
  ],
  diagnosis: { primary: "queimadura_lesao_inalatoria", accepted: ["queimadura_lesao_inalatoria", "intox_co"], differentials: ["intox_co", "anafilaxia", "asma_grave", "choque_hipovolemico"] },
  acceptedDestinations: ["transferencia_regulada"],
  outcomeNotes: "Queimadura de ~30% de superfície corporal com lesão inalatória (ambiente fechado, fuligem, rouquidão, queimadura facial) e intoxicação por CO (COHb 22% com SpO₂ falsamente normal). IOT precoce, O₂ a 100%, Ringer lactato iniciado com ~2 mL/kg/%SCQ em 24 h e titulado pela diurese, cobertura limpa e seca, aquecimento, analgesia e transferência regulada para centro de queimados.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Ambiente fechado, tempo de exposição e sintomas de via aérea", evidence: { kind: "historyAsked", items: ["h-ambiente", "h-voz", "h-cabeca"], minCount: 2 }, points: 6, severity: "importante", rationale: "Ambiente fechado + rouquidão + cefaleia: lesão inalatória e CO." },
    { id: "s-exame-va", domain: "historia", description: "Inspecionou face, orofaringe e pescoço", evidence: { kind: "examDone", regions: ["cabeca", "boca", "pescoco"], minCount: 2 }, points: 6, severity: "critica", rationale: "Fuligem, edema, queimadura facial e cervical." },
    { id: "s-scq", domain: "historia", description: "Estimou a superfície corporal queimada", evidence: { kind: "examDone", regions: ["pele"], minCount: 1 }, points: 5, severity: "importante", rationale: "Define reposição e critério de transferência." },
    { id: "s-o2", domain: "priorizacao", description: "O₂ a 100% (máscara com reservatório) em até 3 min", evidence: { kind: "actionDone", anyOf: ["o2_mascara_reservatorio"], withinSeconds: 180 }, points: 10, severity: "critica", rationale: "Reduz a meia-vida da carboxi-hemoglobina.", sourceIds: ["INT-ORMC-QUEIM-2026"] },
    { id: "s-iot", domain: "priorizacao", description: "Intubação precoce (antes do estridor)", evidence: { kind: "actionDone", anyOf: ["intubacao"], withinSeconds: 900 }, points: 14, severity: "critica", rationale: "Rouquidão, edema e fuligem com queimadura facial: obstrução iminente.", sourceIds: ["INT-QUEIM-VA-2026"] },
    { id: "s-vm", domain: "tratamento", description: "Ventilação mecânica após IOT", evidence: { kind: "actionDone", anyOf: ["ventilacao_mecanica"] }, points: 4, severity: "importante", rationale: "Manter FiO₂ alta e ventilação adequada." },
    { id: "s-cooxi", domain: "exames", description: "Co-oximetria/gasometria", evidence: { kind: "testOrdered", anyOf: ["cooximetria", "gaso_arterial"], withinSeconds: 1200 }, points: 6, severity: "importante", rationale: "Oxímetro de pulso não distingue COHb.", sourceIds: ["INT-ORMC-QUEIM-2026"] },
    { id: "s-exames", domain: "exames", description: "Exames dirigidos", evidence: { kind: "testsNotExcessive", maxUnjustified: 1, justified: ["cooximetria", "gaso_arterial", "gaso_venosa", "hemograma", "eletrolitos", "funcao_renal", "rx_torax", "ecg12", "cpk"] }, points: 3, severity: "menor", rationale: "Foco em via aérea, CO e reposição." },
    { id: "s-ringer", domain: "tratamento", description: "Ringer lactato iniciado", evidence: { kind: "drugGiven", anyOf: ["ringer_lactato"], withinSeconds: 1200 }, points: 8, severity: "importante", rationale: "≥ 20% SCQ: reposição formal (~2 mL/kg/%SCQ em 24 h, metade nas 8 h iniciais), titulada pela diurese.", sourceIds: ["INT-ABA-RESSUSC-2025", "INT-ORMC-QUEIM-2026"] },
    { id: "s-sonda", domain: "reavaliacao", description: "Sonda vesical para diurese horária", evidence: { kind: "actionDone", anyOf: ["diurese_horaria"] }, points: 6, severity: "importante", rationale: "Meta de diurese guia a reposição.", sourceIds: ["INT-ABA-RESSUSC-2025"] },
    { id: "s-cobrir", domain: "tratamento", description: "Remover roupas/adornos e cobrir com campos limpos e secos", evidence: { kind: "actionDone", anyOf: ["cobrir_queimadura"] }, points: 5, severity: "importante", rationale: "Interrompe a queimadura e reduz perda de calor.", sourceIds: ["INT-ORMC-QUEIM-2026"] },
    { id: "s-aquecer", domain: "tratamento", description: "Prevenção de hipotermia", evidence: { kind: "actionDone", anyOf: ["aquecimento"] }, points: 3, severity: "menor", rationale: "Grande queimado perde calor rapidamente." },
    { id: "s-analgesia", domain: "tratamento", description: "Analgesia opioide titulada", evidence: { kind: "drugGiven", anyOf: ["morfina", "cetamina"] }, points: 4, severity: "importante", rationale: "Dor intensa." },
    { id: "s-excesso", domain: "tratamento", description: "Falha: bolus liberal de cristaloide", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-excesso" } }, points: 8, penalty: true, severity: "importante", rationale: "Excesso de volume piora edema e síndrome compartimental.", sourceIds: ["INT-ABA-RESSUSC-2025"] },
    { id: "s-atb", domain: "tratamento", description: "Sem antibiótico sistêmico profilático", evidence: { kind: "avoidDrug", anyOf: ["ceftriaxona", "piperacilina_tazobactam", "vancomicina", "cefepima", "clindamicina"] }, points: 3, severity: "menor", rationale: "Sem benefício e seleciona resistência." },
    { id: "s-regulacao", domain: "destino", description: "Regulou para centro de queimados", evidence: { kind: "actionDone", anyOf: ["acionar_samu"] }, points: 6, severity: "importante", rationale: "> 20% SCQ, face/pescoço e lesão inalatória." },
    { id: "s-dx", domain: "destino", description: "Grande queimado com lesão inalatória", evidence: { kind: "diagnosis", accepted: ["queimadura_lesao_inalatoria"] }, points: 4, severity: "importante", rationale: "Ambiente fechado, fuligem, rouquidão." },
    { id: "s-destino", domain: "destino", description: "Transferência regulada", evidence: { kind: "disposition", accepted: ["transferencia_regulada"] }, points: 4, severity: "importante", rationale: "Centro de queimados." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Ela está falando agora. Ela vai conseguir falar daqui a 30 minutos?" },
      { level: 2, text: "Fuligem, rouquidão, queimadura de face em ambiente fechado." },
      { level: 3, text: "A saturação está 97%… mas o oxímetro confunde carboxi-hemoglobina com oxi-hemoglobina." },
      { level: 4, text: "Sugestão explícita: máscara com reservatório, IOT precoce + ventilação, co-oximetria, Ringer titulado pela diurese (sonda), cobrir, aquecer, analgesia, regulação." }
    ],
    summary: "Mulher de 45 anos retirada de incêndio em ambiente fechado, com queimaduras de ~30% SCQ (face, pescoço, tórax e braços), lesão inalatória e intoxicação por monóxido de carbono.",
    pathophysiology: "O calor e os produtos da combustão lesam a mucosa da via aérea superior, que edemacia progressivamente nas primeiras horas, sobretudo com a reposição volêmica. O CO liga-se à hemoglobina com afinidade ~200 vezes maior que o O₂; o O₂ a 100% encurta sua meia-vida. A queimadura extensa causa extravasamento capilar e hipovolemia nas primeiras 24 h; excesso de volume agrava edema.",
    keyPoints: [
      "Sinais de lesão inalatória: ambiente fechado, fuligem, rouquidão, estridor, queimadura facial.",
      "Intubar cedo quando há sinais de obstrução iminente; depois do edema, a IOT pode ser impossível.",
      "SpO₂ normal não exclui CO: co-oximetria e O₂ a 100%.",
      "≥ 20% SCQ: Ringer lactato ~2 mL/kg/%SCQ em 24 h, titulado pela diurese; evitar excesso.",
      "Cobrir com campos limpos e secos, aquecer, analgesia e regular para centro de queimados."
    ],
    alternatives: ["Fórmula de Parkland (4 mL/kg/%SCQ) ainda usada em muitos serviços; diretriz recente da ABA prefere iniciar com 2 mL/kg/%SCQ.", "Hidroxocobalamina se suspeita de cianeto (instabilidade, acidose láctica grave) — não disponível no catálogo."],
    oralRubric: [
      { id: "o1", concept: "Lesão inalatória e IOT precoce", synonyms: ["intubação", "iot", "via aérea", "edema"], weight: 3 },
      { id: "o2", concept: "Monóxido de carbono", synonyms: ["co", "monóxido", "carboxi", "o2 100"], weight: 2 },
      { id: "o3", concept: "Reposição guiada pela diurese", synonyms: ["ringer", "parkland", "diurese", "2 ml"], weight: 2 },
      { id: "o4", concept: "Transferência para centro de queimados", synonyms: ["centro de queimados", "regulação", "transferência"], weight: 1 }
    ],
    simplifications: ["A reposição é representada por bolsas de Ringer em infusão; o cálculo horário fica com o aluno.", "Cianeto e escarotomia não são modelados.", "O sucesso da IOT segue a probabilidade do catálogo; a IOT tardia é marcada como complicação."]
  },
  references: ["INT-QUEIM-VA-2026", "INT-ABA-RESSUSC-2025", "INT-ORMC-QUEIM-2026", "BR-SAMU-SAV", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 15, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "O₂ 100%, IOT precoce + VM, co-oximetria, Ringer titulado, sonda, cobrir, aquecer, analgesia, regulação", commands: [act(10, "o2_mascara_reservatorio", { fluxo: 15 }), act(20, "monitorizar"), ask(40, "h-ambiente"), ask(50, "h-voz"), { atSeconds: 60, type: "examine", payload: { region: "cabeca", maneuver: "inspecao" } }, { atSeconds: 70, type: "examine", payload: { region: "boca", maneuver: "inspecao" } }, act(90, "acesso_venoso"), test(200, "cooximetria"), act(220, "intubacao"), act(350, "intubacao"), act(480, "ventilacao_mecanica"), { atSeconds: 600, type: "examine", payload: { region: "pele", maneuver: "inspecao" } }, rx(620, "ringer_lactato", "bolsa500", 500, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), act(640, "cobrir_queimadura"), act(780, "aquecimento"), act(820, "diurese_horaria"), rx(1150, "morfina", "amp10", 3, "mg", "IV"), act(1200, "acionar_samu"), dx(1500, "queimadura_lesao_inalatoria"), dest(1600, "transferencia_regulada")], runUntilSeconds: 2400, expect: [{ condition: { ruleFired: "r-vm" }, description: "via aérea assegurada" }, { condition: { not: { ruleFired: "r-estridor" } }, description: "IOT antes do estridor" }, { condition: { path: "vars.cohb", op: "lte", value: 12 }, description: "COHb em queda" }, { condition: { path: "vars.urine", op: "gte", value: 30 }, description: "diurese na meta" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 2800, expect: [{ condition: { ruleFired: "r-obstrucao" }, description: "obstrução" }, { condition: { ruleFired: "r-pcr" }, description: "PCR" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Cateter nasal, bolus liberal e antibiótico profilático; sem IOT", commands: [act(10, "o2_cateter", { fluxo: 3 }), act(30, "acesso_venoso"), act(130, "acesso_venoso"), rx(250, "ringer_lactato", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 15 }), rx(450, "ringer_lactato", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 15 }), rx(600, "ceftriaxona", "fa1g", 1000, "mg", "IV")], runUntilSeconds: 2000, expect: [{ condition: { ruleFired: "r-excesso" }, description: "excesso de volume" }, { condition: { ruleFired: "r-obstrucao" }, description: "obstrução" }, { condition: { ruleFired: "r-atb" }, description: "antibiótico sem indicação" }] },
    { id: "t-atraso", kind: "delay", description: "Máscara com reservatório e IOT só após a obstrução", commands: [act(10, "o2_mascara_reservatorio", { fluxo: 15 }), act(60, "acesso_venoso"), rx(200, "ringer_lactato", "bolsa500", 500, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), act(1900, "intubacao"), act(2030, "intubacao"), act(2160, "ventilacao_mecanica")], runUntilSeconds: 2800, expect: [{ condition: { ruleFired: "r-estridor" }, description: "estridor" }, { condition: { ruleFired: "r-iot-tardia" }, description: "IOT difícil" }, { condition: { not: { ruleFired: "r-pcr" } }, description: "PCR evitada" }] },
    { id: "t-alternativa", kind: "alternative", description: "IOT imediata sem máscara prévia, acesso IO, cetamina para analgesia", commands: [act(30, "acesso_io"), act(60, "intubacao"), act(190, "intubacao"), act(320, "ventilacao_mecanica"), rx(400, "ringer_lactato", "bolsa500", 500, "mL", "IO", "infusao_volume", { durationMinutes: 60 }), act(500, "cobrir_queimadura"), act(700, "acionar_samu"), dest(1200, "transferencia_regulada")], runUntilSeconds: 2000, expect: [{ condition: { ruleFired: "r-vm" }, description: "via aérea assegurada" }, { condition: { ruleFired: "r-o2" }, description: "O₂ alto pelo tubo" }, { condition: { not: { ruleFired: "r-estridor" } }, description: "sem estridor" }] }
  ]
};
