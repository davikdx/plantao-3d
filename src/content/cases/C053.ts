import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const BB = { any: [{ drugGiven: "propranolol" }, { drugGiven: "metoprolol" }] };
const TIONAMIDA = { any: [{ drugGiven: "propiltiouracil" }, { drugGiven: "metimazol" }] };
const HC = { drugGiven: "hidrocortisona" };
const IODO = { drugGiven: "lugol" };
const ANTITERMICO = { any: [{ drugGiven: "dipirona" }, { drugGiven: "paracetamol" }, { actionCompleted: "resfriamento" }] };

export const C053: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C053",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Jovem com febre alta, coração disparado e muito agitada",
  teachingTitle: "Crise tireotóxica — diagnóstico clínico, betabloqueio, tionamida antes do iodo, corticoide, suporte e precipitante",
  group: "Endocrinologia",
  specialties: ["Clínica médica", "Endocrinologia", "Emergência", "Terapia intensiva"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 4,
  level: "residencia",
  objectives: [
    "Suspeitar de crise tireotóxica pelo quadro clínico (febre, taquiarritmia, agitação, sintomas digestivos) sem aguardar exames",
    "Iniciar betabloqueador, tionamida (PTU de preferência) e só depois o iodo",
    "Associar glicocorticoide, antitérmico sem salicilato, hidratação e resfriamento",
    "Identificar o precipitante e internar em UTI"
  ],
  keywords: ["febre", "coração acelerado", "agitação", "tireoide", "palpitação", "diarreia"],
  patient: {
    name: "Juliana Ramos",
    ageYears: 34,
    sex: "feminino",
    weightKg: 52,
    heightCm: 165,
    visual: { ageGroup: "adulto", sex: "feminino", skinTone: 3, hairStyle: "longo", hairColor: "castanho", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Mulher de 34 anos trazida pela irmã: há 2 dias com febre, tosse e dor de garganta; hoje muito agitada, falando sem parar, com diarreia e o coração 'saindo pela boca'.",
  communication: "limitada",
  informants: [{ id: "irma", name: "Irmã", role: "Acompanhante" }],
  history: [
    h("h-queixa", "queixa", "O que você está sentindo?", "Meu coração… não para… calor, muito calor… me deixa ir embora!", { keywords: ["sentindo"] }),
    hi("h-tireoide", "antecedentes", "Ela tem algum problema de tireoide?", [{ source: "irma", text: "Tem, hipertireoidismo, Graves. Tomava metimazol, mas parou há uns três meses porque achou que estava bem." }], ["tireoide", "graves", "hipertireoidismo"]),
    hi("h-precipitante", "fatores_associados", "Teve alguma infecção, cirurgia ou trauma recente?", [{ source: "irma", text: "Gripe forte, tosse com catarro há dois dias, febre." }], ["infecção", "gripe", "cirurgia", "tosse"]),
    hi("h-perda-peso", "fatores_associados", "Perdeu peso? Tremor? Diarreia?", [{ source: "irma", text: "Emagreceu uns 6 quilos em dois meses, treme muito; hoje teve diarreia umas cinco vezes." }], ["peso", "tremor", "diarreia"]),
    hi("h-gestacao", "antecedentes", "Pode estar grávida? Última menstruação?", [{ source: "irma", text: "Ela usa DIU. A menstruação anda pouca." }], ["grávida", "menstruação", "gestação"]),
    hi("h-alergias", "alergias", "Tem alergia a remédio? Asma?", [{ source: "irma", text: "Não tem alergia, não tem asma." }], ["alergia", "asma"])
  ],
  initial: {
    vars: { hr: 158, sbp: 136, dbp: 64, rr: 26, spo2: 95, temp: 40.1, gcs: 14, pain: 3, glucose: 148, perfusion: 0.8, effort: 0.4, na: 139, k: 3.6, creat: 0.9, wbc: 13800, plt: 230000, hb: 12.6, bili: 2.3, ast: 68, alt: 74, lactate: 2.4, urine: 20 },
    flags: { rhythm: "fa", posture: "sentado", painVisual: "leve", speech: "frases", consciousness: "alerta", agitation: true, tremor: true, sweating: true },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Agitada, desorientada no tempo, pele quente e úmida, tremor fino; exoftalmia bilateral.", { label: "Geral", better: [{ when: { ruleFired: "r-melhora" }, text: "Mais calma, orientada; pele morna." }] }),
    ex("e-pescoco", "pescoco", "palpacao", "Bócio difuso, com frêmito e sopro tireoidiano.", { label: "Tireoide" }),
    ex("e-coracao", "coracao", "ausculta", "Ritmo irregular, taquicárdico, sopro sistólico de fluxo.", { label: "Coração", sound: "sopro" }),
    ex("e-torax", "torax_anterior", "ausculta", "Estertores em base direita; sem estertores difusos.", { sound: "estertores", label: "Pulmões" }),
    ex("e-abdome", "abdome_qsd", "palpacao", "Fígado palpável a 2 cm do rebordo, discretamente doloroso; esclera levemente ictérica.", { label: "Abdome" }),
    ex("e-neuro", "neurologico", "especial", "Glasgow 14 (confusa), hiper-reflexia, sem déficit focal.", {})
  ],
  testResults: [
    { testId: "funcao_tireoidiana", variants: [{ text: "TSH < 0,01 mUI/L; T4 livre > 7,7 ng/dL (acima do limite de detecção). Resultado chegou após 2 horas." }] },
    { testId: "ecg12", variants: [{ text: "Fibrilação atrial com resposta ventricular ~160 bpm; sem alterações isquêmicas." }] },
    { testId: "rx_torax", variants: [{ text: "Laudo educativo: consolidação em lobo inferior direito; área cardíaca normal." }] },
    { testId: "bhcg", variants: [{ text: "Beta-hCG negativo." }] }
  ],
  highlightedActions: ["monitorizar", "acesso_venoso", "resfriamento", "o2_cateter"],
  rules: [
    { id: "r-curso", description: "Tireotoxicose descompensada: hipertermia, taquiarritmia e falência progressiva", priority: 10, when: { always: true }, repeat: "once", effects: [trend("temp", 41.0, 2400, "crise", 10), trend("hr", 172, 2400, "crise", 10), trend("sbp", 102, 3600, "crise", 10), trend("gcs", 11, 3600, "crise", 10), trend("spo2", 91, 3600, "crise", 10)] },
    { id: "r-bb", description: "Betabloqueio: controle da frequência e dos sintomas adrenérgicos", priority: 40, when: BB, repeat: "once", effects: [trend("hr", 118, 1200, "bb", 40), flag("tremor", false), flag("agitation", false), trend("sbp", 128, 1200, "bb", 40)] },
    { id: "r-antitermico", description: "Antitérmico sem salicilato e resfriamento", priority: 30, when: ANTITERMICO, repeat: "once", effects: [trend("temp", 39.0, 1200, "febre", 30)] },
    { id: "r-tionamida", description: "Tionamida bloqueia a síntese (efeito clínico em horas)", priority: 20, when: TIONAMIDA, repeat: "once", effects: [obs("Tionamida iniciada: bloqueia a síntese de novo hormônio; o PTU também reduz a conversão periférica de T4 em T3.")] },
    { id: "r-iodo-antes", description: "Iodo antes da tionamida: substrato para mais síntese hormonal", priority: 50, when: { all: [IODO, { not: TIONAMIDA }] }, repeat: "once", effects: [trend("hr", 168, 600, "iodo", 50, 1800), obs("Iodo antes da tionamida pode piorar a tireotoxicose (efeito Jod-Basedow): administrar ao menos 1 hora depois da tionamida."), outcome("complicacao")] },
    { id: "r-melhora", description: "Betabloqueador + tionamida + corticoide + controle térmico: melhora", priority: 60, when: { all: [BB, TIONAMIDA, HC, ANTITERMICO] }, repeat: "once", effects: [trend("hr", 102, 1800, "melhora", 60), trend("temp", 38.0, 1800, "melhora", 60), trend("gcs", 15, 1800, "melhora", 60), trend("spo2", 95, 1800, "melhora", 60), flag("agitation", false), flag("consciousness", "alerta"), outcome("melhora")] },
    { id: "r-aas", description: "Salicilato usado como antitérmico", priority: 25, when: { drugGiven: "aas" }, repeat: "once", effects: [obs("Salicilatos deslocam o hormônio tireoidiano da proteína carreadora e aumentam a fração livre: evitar na crise."), outcome("complicacao")] },
    { id: "r-descompensa", description: "Sem betabloqueador em 45 min: insuficiência cardíaca de alto débito", priority: 35, when: { all: [{ time: "gte", seconds: 2700 }, { not: BB }] }, repeat: "once", effects: [trend("hr", 182, 300, "ic", 35), trend("sbp", 88, 900, "ic", 35), trend("spo2", 86, 900, "ic", 35), trend("effort", 0.8, 900, "ic", 35), staff("enfermagem", "Ela está muito cansada, saturação caindo e a pressão baixando."), outcome("piora")] },
    { id: "r-pcr", description: "Crise não tratada: colapso circulatório", priority: 100, when: { all: [{ time: "gte", seconds: 5400 }, { not: BB }, { not: TIONAMIDA }] }, repeat: "once", effects: [flag("pulse", false), { type: "setValue", var: "sbp", value: 0 }, { type: "setValue", var: "dbp", value: 0 }, flag("consciousness", "irresponsivo"), staff("enfermagem", "Parou! Sem pulso!"), outcome("parada", true)] }
  ],
  diagnosis: { primary: "crise_tireotoxica", accepted: ["crise_tireotoxica"], differentials: ["choque_septico", "pneumonia", "intox_estimulante", "fa_alta_resposta", "abstinencia_alcool", "meningite_bacteriana"] },
  acceptedDestinations: ["uti"],
  outcomeNotes: "Crise tireotóxica em mulher com doença de Graves que suspendeu o metimazol, precipitada por pneumonia: hipertermia, FA de alta resposta, agitação/delirium, diarreia e icterícia. Tratamento clínico imediato: propranolol, PTU, iodo ≥ 1 h depois, hidrocortisona, antitérmico sem salicilato, resfriamento, hidratação, antibiótico para a pneumonia e UTI.",
  scoring: [
    { id: "s-tireoide", domain: "historia", description: "Perguntou sobre doença tireoidiana e tratamento", evidence: { kind: "historyAsked", items: ["h-tireoide"], minCount: 1 }, points: 8, severity: "critica", rationale: "Suspensão de tionamida é precipitante clássico." },
    { id: "s-precip", domain: "historia", description: "Buscou o precipitante e sintomas", evidence: { kind: "historyAsked", items: ["h-precipitante", "h-perda-peso", "h-gestacao"], minCount: 2 }, points: 4, severity: "importante", rationale: "Infecção, gestação, cirurgia, iodo." },
    { id: "s-exame", domain: "historia", description: "Examinou tireoide, coração e estado mental", evidence: { kind: "examDone", regions: ["pescoco", "coracao", "geral", "neurologico"], minCount: 3 }, points: 6, severity: "importante", rationale: "Escore clínico (Burch-Wartofsky)." },
    { id: "s-monitor", domain: "priorizacao", description: "Monitorização, ECG e acesso", evidence: { kind: "actionDone", anyOf: ["monitorizar", "acesso_venoso"], withinSeconds: 300 }, points: 4, severity: "importante", rationale: "FA de alta resposta." },
    { id: "s-bb", domain: "tratamento", description: "Betabloqueador em até 20 min", evidence: { kind: "drugGiven", anyOf: ["propranolol", "metoprolol"], withinSeconds: 1200 }, points: 12, severity: "critica", rationale: "Controle adrenérgico e da frequência.", sourceIds: ["BR-SBEM-HIPER-2013"] },
    { id: "s-ptu", domain: "tratamento", description: "Tionamida (PTU preferencial)", evidence: { kind: "drugGiven", anyOf: ["propiltiouracil", "metimazol"], withinSeconds: 1800 }, points: 12, severity: "critica", rationale: "Bloqueia síntese; PTU também reduz conversão periférica.", sourceIds: ["BR-SBEM-HIPER-2013"] },
    { id: "s-iodo", domain: "tratamento", description: "Iodo após a tionamida", evidence: { kind: "drugGiven", anyOf: ["lugol"] }, points: 4, severity: "importante", rationale: "Bloqueia liberação de hormônio pré-formado.", sourceIds: ["BR-SBEM-HIPER-2013"] },
    { id: "s-iodo-antes", domain: "tratamento", description: "Falha: iodo antes da tionamida", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-iodo-antes" } }, points: 8, penalty: true, severity: "critica", rationale: "Fornece substrato para síntese." },
    { id: "s-hc", domain: "tratamento", description: "Glicocorticoide", evidence: { kind: "drugGiven", anyOf: ["hidrocortisona", "dexametasona"], withinSeconds: 2400 }, points: 6, severity: "importante", rationale: "Reduz conversão de T4 em T3; possível insuficiência adrenal relativa.", sourceIds: ["BR-SBEM-HIPER-2013"] },
    { id: "s-febre", domain: "tratamento", description: "Antitérmico sem salicilato e resfriamento", evidence: { kind: "actionDone", anyOf: ["resfriamento"] }, points: 4, severity: "importante", rationale: "Hipertermia grave.", sourceIds: ["BR-SBEM-HIPER-2013"] },
    { id: "s-aas", domain: "tratamento", description: "Não usou salicilato", evidence: { kind: "avoidDrug", anyOf: ["aas"] }, points: 4, severity: "importante", rationale: "Aumenta T4/T3 livres.", sourceIds: ["BR-SBEM-HIPER-2013"] },
    { id: "s-atb", domain: "tratamento", description: "Tratou a pneumonia (precipitante)", evidence: { kind: "drugGiven", anyOf: ["ceftriaxona", "azitromicina", "piperacilina_tazobactam"], withinSeconds: 3600 }, points: 4, severity: "importante", rationale: "Tratar agressivamente o precipitante." },
    { id: "s-exames", domain: "exames", description: "ECG e radiografia/TSH-T4L sem atrasar o tratamento", evidence: { kind: "testOrdered", anyOf: ["ecg12", "rx_torax", "funcao_tireoidiana"], withinSeconds: 1200 }, points: 4, severity: "importante", rationale: "Confirma e procura precipitante." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou FC, temperatura e congestão após o betabloqueador", evidence: { kind: "reassessAfter", after: ["propranolol", "metoprolol"], reassess: ["monitorizar", "medir_pa", "medir_temperatura", "torax_anterior"], withinSeconds: 1800 }, points: 6, severity: "importante", rationale: "Risco de hipotensão em IC de alto débito." },
    { id: "s-dx", domain: "destino", description: "Crise tireotóxica", evidence: { kind: "diagnosis", accepted: ["crise_tireotoxica"] }, points: 6, severity: "importante", rationale: "Diagnóstico clínico." },
    { id: "s-destino", domain: "destino", description: "UTI", evidence: { kind: "disposition", accepted: ["uti"] }, points: 6, severity: "importante", rationale: "Mortalidade elevada; suporte intensivo." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Febre, taquiarritmia, agitação e diarreia. Que glândula pode explicar tudo?" },
      { level: 2, text: "Ela tem bócio com sopro e exoftalmia. Parou o remédio há 3 meses." },
      { level: 3, text: "O diagnóstico é clínico; o TSH demora 2 horas." },
      { level: 4, text: "Sugestão explícita: propranolol, PTU, depois Lugol, hidrocortisona, dipirona/resfriamento, antibiótico, UTI; nunca AAS." }
    ],
    summary: "Mulher de 34 anos com doença de Graves sem tratamento há 3 meses, com pneumonia precipitando crise tireotóxica (hipertermia, FA de alta resposta, delirium, diarreia e icterícia).",
    pathophysiology: "Excesso de hormônio tireoidiano somado a um estresse agudo aumenta a sensibilidade às catecolaminas, o metabolismo e a termogênese. Há falência de múltiplos sistemas: SNC, cardiovascular (alto débito, FA), gastrointestinal-hepático e termorregulação. O tratamento ataca cada etapa: síntese (tionamida), liberação (iodo), conversão periférica (PTU, corticoide, propranolol) e efeitos periféricos (betabloqueio).",
    keyPoints: [
      "Diagnóstico clínico (Burch-Wartofsky); não esperar TSH/T4L.",
      "Ordem: betabloqueador + tionamida (PTU) → iodo ≥ 1 h depois.",
      "Glicocorticoide, antitérmico sem salicilato, resfriamento, hidratação e tiamina.",
      "Tratar precipitante (infecção, suspensão de tionamida, cirurgia, parto).",
      "UTI; tireoidectomia se refratária."
    ],
    alternatives: ["Metimazol em vez de PTU.", "Metoprolol IV ou esmolol quando a via oral não é segura.", "Diltiazem se betabloqueador contraindicado."],
    oralRubric: [
      { id: "o1", concept: "Diagnóstico clínico", synonyms: ["burch", "wartofsky", "clínico", "crise tireotóxica"], weight: 2 },
      { id: "o2", concept: "Betabloqueador", synonyms: ["propranolol", "betabloqueador", "metoprolol"], weight: 2 },
      { id: "o3", concept: "Tionamida antes do iodo", synonyms: ["ptu", "propiltiouracil", "iodo", "lugol"], weight: 3 },
      { id: "o4", concept: "Evitar salicilato", synonyms: ["aas", "salicilato", "aspirina"], weight: 1 }
    ],
    simplifications: ["PTU, Lugol e corticoide na crise sem regra de dose validada (o app alerta).", "Não modela o intervalo exato de 1 h entre tionamida e iodo; pune iodo sem tionamida prévia.", "Melhora clínica comprimida em ~1 hora."]
  },
  references: ["BR-SBEM-HIPER-2013", "BR-SAMU-SAV", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 15, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Monitor, história, exame, propranolol, PTU, hidrocortisona, dipirona + resfriamento, Lugol depois, ceftriaxona, UTI", commands: [act(5, "monitorizar"), ask(20, "h-tireoide"), ask(30, "h-precipitante"), ask(40, "h-gestacao"), { atSeconds: 50, type: "examine", payload: { region: "pescoco", maneuver: "palpacao" } }, { atSeconds: 60, type: "examine", payload: { region: "coracao", maneuver: "ausculta" } }, { atSeconds: 70, type: "examine", payload: { region: "geral", maneuver: "inspecao" } }, act(80, "acesso_venoso"), test(190, "ecg12"), test(200, "funcao_tireoidiana"), rx(260, "propranolol", "cp40", 40, "mg", "VO"), rx(280, "propiltiouracil", "cp100", 500, "mg", "VO"), rx(300, "hidrocortisona", "fa100", 100, "mg", "IV"), rx(320, "dipirona", "amp1g", 1000, "mg", "IV"), act(340, "resfriamento"), test(400, "rx_torax"), rx(1200, "ceftriaxona", "fa1g", 2000, "mg", "IV"), act(1400, "medir_pa"), rx(4000, "lugol", "gotas5", 0.25, "mL", "VO"), dx(4100, "crise_tireotoxica"), dest(4200, "uti")], runUntilSeconds: 5000, expect: [{ condition: { ruleFired: "r-melhora" }, description: "melhora" }, { condition: { not: { ruleFired: "r-iodo-antes" } }, description: "iodo após tionamida" }, { condition: { not: { ruleFired: "r-descompensa" } }, description: "sem IC" }, { condition: { path: "vars.hr", op: "lte", value: 120 }, description: "FC controlada" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 5600, expect: [{ condition: { ruleFired: "r-descompensa" }, description: "IC de alto débito" }, { condition: { ruleFired: "r-pcr" }, description: "colapso" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Lugol primeiro e AAS como antitérmico", commands: [act(30, "acesso_venoso"), rx(100, "lugol", "gotas5", 0.25, "mL", "VO"), rx(150, "aas", "cp100", 300, "mg", "VO")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-iodo-antes" }, description: "iodo antes da tionamida" }, { condition: { ruleFired: "r-aas" }, description: "salicilato" }, { condition: { ruleFired: "r-descompensa" }, description: "descompensação" }] },
    { id: "t-atraso", kind: "delay", description: "Aguarda TSH; tratamento só aos 50 min", commands: [act(30, "acesso_venoso"), test(100, "funcao_tireoidiana"), rx(3000, "propranolol", "cp40", 40, "mg", "VO"), rx(3020, "propiltiouracil", "cp100", 500, "mg", "VO"), rx(3040, "hidrocortisona", "fa100", 100, "mg", "IV"), act(3060, "resfriamento")], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-descompensa" }, description: "descompensa no atraso" }, { condition: { ruleFired: "r-melhora" }, description: "melhora tardia" }, { condition: { not: { ruleFired: "r-pcr" } }, description: "PCR evitada" }] },
    { id: "t-alternativa", kind: "alternative", description: "Metoprolol IV, metimazol e paracetamol", commands: [act(5, "monitorizar"), act(30, "acesso_venoso"), rx(150, "metoprolol", "amp5", 5, "mg", "IV"), rx(200, "metimazol", "cp10", 20, "mg", "VO"), rx(220, "hidrocortisona", "fa100", 100, "mg", "IV"), rx(240, "paracetamol", "cp500", 750, "mg", "VO"), dest(2000, "uti")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-bb" }, description: "betabloqueio" }, { condition: { ruleFired: "r-melhora" }, description: "melhora" }] }
  ]
};
