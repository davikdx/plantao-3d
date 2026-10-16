import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const VOL1 = { any: [{ drugGiven: "sf09", minTotal: { value: 1000, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 1000, unit: "mL" as const } }] };
const VOL2 = { any: [{ drugGiven: "sf09", minTotal: { value: 2000, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 2000, unit: "mL" as const } }, { all: [{ drugGiven: "sf09", minTotal: { value: 1000, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 1000, unit: "mL" as const } }] }] };
const INSULINA = { treatmentActive: "insulina_regular" };
const K_CONHECIDO = { any: [{ testCollected: "eletrolitos" }, { testCollected: "gaso_venosa" }, { testCollected: "gaso_arterial" }] };

export const C049: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C049",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Jovem com vômitos, muita sede e respiração acelerada",
  teachingTitle: "Cetoacidose diabética como abertura de diabetes tipo 1",
  group: "Endocrinologia e metabolismo",
  specialties: ["Endocrinologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Reconhecer CAD pela tríade hiperglicemia, cetose e acidose",
    "Priorizar hidratação venosa e conhecer o potássio antes da insulina",
    "Conduzir insulina em infusão com reposição de potássio e glicose quando indicada",
    "Monitorizar glicemia, potássio e acidose de forma seriada"
  ],
  keywords: ["vômito", "sede", "urina muito", "emagrecimento", "respiração rápida", "diabetes"],
  patient: {
    name: "Pedro Henrique Alves",
    ageYears: 19,
    sex: "masculino",
    weightKg: 62,
    heightCm: 176,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 3, hairStyle: "curto", hairColor: "castanho", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Jovem de 19 anos trazido pelo pai por vômitos desde ontem, muita sede e cansaço. Na triagem: sonolento, respirando rápido e profundo.",
  communication: "limitada",
  informants: [{ id: "pai", name: "Sr. Antônio", role: "Pai" }],
  history: [
    h("h-queixa", "queixa", "O que você está sentindo?", "Vomitando… muita sede… cansado…", { keywords: ["sentindo"] }),
    hi("h-evolucao", "evolucao", "Há quanto tempo isso vem acontecendo?", [{ source: "pai", text: "Há umas três semanas ele bebe água o tempo todo e levanta à noite para urinar. Emagreceu uns 6 quilos. Os vômitos começaram ontem." }], ["semanas", "tempo", "quando"]),
    hi("h-poliuria", "alimentacao_eliminacoes", "Está urinando muito? Perdeu peso?", [{ source: "pai", text: "Urina muito, sim, e as roupas ficaram largas." }, { source: "paciente", text: "Muito xixi…" }], ["urina", "xixi", "peso"]),
    h("h-dor", "localizacao", "Tem dor em algum lugar?", "Barriga… difusa…", { keywords: ["dor", "barriga"] }),
    hi("h-antecedentes", "antecedentes", "Ele tem alguma doença ou usa remédios?", [{ source: "pai", text: "Sempre foi saudável. Não toma remédio nenhum." }], ["doença", "remédio"]),
    hi("h-familia", "familia", "Alguém na família tem diabetes?", [{ source: "pai", text: "A avó dele tem diabetes, toma comprimido." }], ["família", "diabetes"]),
    h("h-infeccao", "fatores_associados", "Teve febre, tosse ou ardência para urinar?", "Não… só… vômito.", { keywords: ["febre", "tosse", "ardência"] }),
    h("h-alergias", "alergias", "Tem alergia a remédio?", "Não."),
    h("h-drogas", "habitos", "Usa álcool ou outras drogas?", "Não…")
  ],
  initial: {
    vars: { hr: 122, sbp: 104, dbp: 62, rr: 30, spo2: 98, temp: 36.9, gcs: 14, pain: 4, glucose: 486, perfusion: 0.6, effort: 1.5, etco2: 20, ph: 7.12, pco2: 22, po2: 98, hco3: 8, be: -19, lactate: 2.4, na: 131, k: 5.4, cl: 99, ca: 9.1, mg: 1.9, ketones: 5.8, osm: 302, creat: 1.4, urea: 52, hb: 15.2, ht: 46, wbc: 15800, plt: 310000, pcr: 8, urine: 80 },
    flags: { rhythm: "taquicardia_sinusal", consciousness: "voz", speech: "palavras", posture: "supino", painVisual: "leve" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Sonolento, desidratado (mucosas secas, olhos encovados), respiração rápida e profunda (Kussmaul), hálito cetônico.", {
      better: [{ when: { path: "vars.ph", op: "gte", value: 7.25 }, text: "Mais desperto, respiração menos profunda, mucosas úmidas." }]
    }),
    ex("e-perfusao", "membro_superior_d", "palpacao", "Pulsos finos, extremidades frias, tempo de enchimento capilar 3–4 s.", { better: [{ when: { ruleFired: "r-volume2" }, text: "Pulsos amplos, tempo de enchimento capilar 2 s." }] }),
    ex("e-abdome", "abdome_epigastrio", "palpacao", "Abdome levemente doloroso difusamente, sem defesa ou descompressão dolorosa.", {}),
    ex("e-torax", "torax_anterior", "ausculta", "Murmúrio vesicular presente, sem ruídos adventícios.", { sound: "murmurio_normal" }),
    ex("e-neuro", "neurologico", "especial", "Glasgow 14 (confuso), sem déficit focal; pupilas isocóricas.", { better: [{ when: { path: "vars.ph", op: "gte", value: 7.25 }, text: "Glasgow 15, orientado." }] })
  ],
  testResults: [
    { testId: "ecg12", variants: [{ when: { path: "vars.k", op: "lt", value: 3.3 }, text: "Ritmo sinusal, ondas T achatadas e ondas U proeminentes (compatível com hipocalemia).", ecg: { rhythm: "sinusal", rate: 98, stElevationLeads: [], stDepressionLeads: [], peakedT: false, wideQrs: false } }, { text: "Taquicardia sinusal; ondas T discretamente apiculadas.", ecg: { rhythm: "taquicardia_sinusal", rate: 120, stElevationLeads: [], stDepressionLeads: [], peakedT: true, wideQrs: false } }] },
    { testId: "urina_tipo1", variants: [{ text: "Glicosúria 4+, cetonúria 3+; sem leucocitúria significativa ou nitrito." }] },
    { testId: "rx_torax", variants: [{ text: "Laudo educativo: sem consolidações." }] }
  ],
  highlightedActions: ["glicemia_capilar", "monitorizar", "acesso_venoso", "diurese_horaria"],
  rules: [
    { id: "r-volume1", description: "Primeiro litro melhora perfusão e reduz a glicemia por diluição", priority: 20, when: VOL1, repeat: "once", effects: [trend("hr", 110, 1200, "vol", 20), trend("sbp", 112, 1200, "vol", 20), trend("dbp", 68, 1200, "vol", 20), trend("perfusion", 0.78, 1200, "vol", 20), trend("glucose", 430, 1800, "vol", 15), trend("urine", 120, 1800, "vol", 20)] },
    { id: "r-volume2", description: "Hidratação continuada restaura perfusão e função renal", priority: 21, when: VOL2, repeat: "once", effects: [trend("hr", 98, 2400, "vol2", 21), trend("sbp", 118, 1800, "vol2", 21), trend("perfusion", 0.95, 1800, "vol2", 21), trend("creat", 1.0, 10800, "vol2", 21), trend("urea", 36, 10800, "vol2", 21), flag("consciousness", "alerta"), flag("speech", "frases"), { type: "changeCommunication", state: "normal" }] },
    { id: "r-sem-volume", description: "Sem hidratação, piora hemodinâmica e acidose", priority: 5, when: { all: [{ time: "gte", seconds: 1800 }, { not: VOL1 }] }, repeat: "once", effects: [trend("sbp", 86, 1800, "doenca", 10), trend("hr", 132, 1800, "doenca", 10), trend("ph", 7.02, 3600, "doenca", 10), trend("hco3", 5, 3600, "doenca", 10), trend("perfusion", 0.4, 1800, "doenca", 10), flag("consciousness", "dor"), { type: "changeCommunication", state: "incapaz" }, staff("enfermagem", "Ele está mais sonolento e a pressão caiu."), outcome("piora")] },
    {
      id: "r-insulina",
      description: "Insulina em infusão: glicemia, cetose e acidose melhoram; potássio cai (entra na célula)",
      priority: 30,
      when: INSULINA,
      repeat: "while",
      effects: [trend("glucose", 100, 16000, "insulina", 30), trend("ph", 7.36, 14000, "insulina", 30), trend("hco3", 21, 14000, "insulina", 30), trend("be", -2, 14000, "insulina", 30), trend("ketones", 0.4, 9000, "insulina", 30), trend("rr", 18, 9000, "insulina", 30), trend("pco2", 36, 12000, "insulina", 30), trend("k", 2.6, 4000, "insulina", 30)],
      onEnd: [trend("ketones", 4, 7200, "insulina", 30), trend("ph", 7.15, 7200, "insulina", 30), trend("hco3", 10, 7200, "insulina", 30), trend("k", 4.5, 7200, "insulina", 30), obs("Infusão de insulina suspensa: a cetose tende a voltar.")]
    },
    { id: "r-kcl", description: "Reposição de potássio mantém K⁺ na faixa segura durante a insulina", priority: 40, when: { drugGiven: "kcl", minTotal: { value: 20, unit: "mEq" } }, repeat: "once", effects: [trend("k", 4.0, 3600, "kcl", 40)] },
    { id: "r-hipocalemia", description: "Insulina sem reposição: hipocalemia sintomática", priority: 60, when: { path: "vars.k", op: "lt", value: 3.1 }, repeat: "once", effects: [flag("tremor", true), obs("Paciente refere fraqueza muscular e câimbras."), staff("enfermagem", "O monitor está mostrando umas extrassístoles."), outcome("complicacao")] },
    { id: "r-glicemia-250", description: "Com glicemia < 250 mg/dL e insulina mantida sem glicose, risco de hipoglicemia", priority: 35, when: { all: [INSULINA, { path: "vars.glucose", op: "lt", value: 250 }, { not: { drugGiven: "sg5" } }] }, repeat: "once", effects: [trend("glucose", 55, 6000, "hipo", 35)] },
    { id: "r-sg5", description: "Glicose 5% associada mantém glicemia enquanto a insulina corrige a cetose", priority: 50, when: { drugGiven: "sg5" }, repeat: "once", effects: [trend("glucose", 170, 3600, "sg5", 50)] },
    { id: "r-hipoglicemia", description: "Hipoglicemia iatrogênica durante o tratamento", priority: 70, when: { path: "vars.glucose", op: "lt", value: 70 }, repeat: "once", effects: [flag("sweating", true), flag("consciousness", "voz"), staff("enfermagem", "Ele ficou suado e confuso de novo."), outcome("complicacao")] },
    { id: "r-ins-sem-k", description: "Insulina iniciada sem potássio conhecido (falha de segurança)", priority: 1, when: { all: [INSULINA, { not: K_CONHECIDO }] }, repeat: "once", effects: [] },
    { id: "r-resolucao", description: "Critérios de resolução atingidos", priority: 80, when: { all: [{ path: "vars.ph", op: "gte", value: 7.3 }, { path: "vars.hco3", op: "gte", value: 15 }] }, repeat: "once", effects: [outcome("melhora")] }
  ],
  diagnosis: { primary: "cad", accepted: ["cad"], differentials: ["ehh", "gastroenterite", "sepse", "pancreatite", "intox_alcool", "apendicite"] },
  acceptedDestinations: ["uti", "internacao_enfermaria"],
  outcomeNotes: "Hidratação precoce, potássio conhecido antes da insulina, insulina em infusão, reposição de K⁺ e glicose 5% quando a glicemia cai levam à resolução em algumas horas. Insulina sem K⁺ gera hipocalemia; sem glicose 5%, hipoglicemia.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Caracterizou poliúria, polidipsia e perda de peso", evidence: { kind: "historyAsked", items: ["h-evolucao", "h-poliuria"], minCount: 1 }, points: 8, severity: "importante", rationale: "Sintomas clássicos sugerem abertura de DM1." },
    { id: "s-hist-gatilho", domain: "historia", description: "Buscou fator desencadeante (infecção, drogas)", evidence: { kind: "historyAsked", items: ["h-infeccao", "h-drogas", "h-antecedentes"], minCount: 1 }, points: 5, severity: "menor", rationale: "Infecção e omissão de insulina são gatilhos frequentes." },
    { id: "s-exame", domain: "historia", description: "Avaliou desidratação, perfusão e padrão respiratório", evidence: { kind: "examDone", regions: ["geral", "membro_superior_d", "abdome_epigastrio"], minCount: 2 }, points: 7, severity: "importante", rationale: "Grau de desidratação orienta volume." },
    { id: "s-hgt", domain: "priorizacao", description: "Glicemia capilar em até 3 minutos", evidence: { kind: "actionDone", anyOf: ["glicemia_capilar"], withinSeconds: 180 }, points: 6, severity: "importante", rationale: "Primeiro dado diagnóstico à beira-leito." },
    { id: "s-volume", domain: "priorizacao", description: "Cristaloide ≥ 1 L na primeira hora", evidence: { kind: "drugGiven", anyOf: ["sf09", "ringer_lactato"], minTotal: { value: 1000, unit: "mL" }, withinSeconds: 3600 }, points: 14, severity: "critica", rationale: "Hidratação é a primeira medida terapêutica na CAD.", sourceIds: ["BR-SBD-CAD"] },
    { id: "s-labs", domain: "exames", description: "Gasometria/eletrólitos com potássio e cetonemia", evidence: { kind: "testOrdered", anyOf: ["gaso_venosa", "gaso_arterial", "eletrolitos"], withinSeconds: 900 }, points: 8, severity: "critica", rationale: "Confirmar acidose e conhecer o potássio antes da insulina.", sourceIds: ["BR-SBD-CAD"] },
    { id: "s-cetona", domain: "exames", description: "Confirmou cetose (cetonemia ou urina)", evidence: { kind: "testOrdered", anyOf: ["cetonemia", "urina_tipo1"] }, points: 4, severity: "importante", rationale: "Cetonemia ≥ 3 mmol/L ou cetonúria significativa." },
    { id: "s-exames-excesso", domain: "exames", description: "Sem excesso de exames", evidence: { kind: "testsNotExcessive", maxUnjustified: 3, justified: ["gaso_venosa", "gaso_arterial", "eletrolitos", "cetonemia", "urina_tipo1", "funcao_renal", "hemograma", "ecg12", "osmolalidade", "pcr"] }, points: 3, severity: "menor", rationale: "Exames guiados por hipótese." },
    { id: "s-insulina", domain: "tratamento", description: "Insulina regular em infusão contínua IV", evidence: { kind: "drugGiven", anyOf: ["insulina_regular"], routes: ["IV"] }, points: 10, severity: "critica", rationale: "Insulina interrompe cetogênese; infusão IV com bomba.", sourceIds: ["BR-SBD-CAD"] },
    { id: "s-k-antes", domain: "tratamento", description: "Falha de segurança: insulina antes de conhecer o potássio", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-ins-sem-k" } }, points: 8, penalty: true, severity: "critica", rationale: "Se K⁺ < 3,3 mmol/L, repor antes da insulina para evitar arritmias.", sourceIds: ["BR-SBD-CAD"] },
    { id: "s-kcl", domain: "tratamento", description: "Reposição de potássio durante a insulinoterapia", evidence: { kind: "drugGiven", anyOf: ["kcl"] }, points: 7, severity: "importante", rationale: "Insulina e correção da acidose deslocam K⁺ para o intracelular.", sourceIds: ["BR-SBD-CAD"] },
    { id: "s-sg5", domain: "tratamento", description: "Glicose 5% quando glicemia < 250 mg/dL", evidence: { kind: "drugGiven", anyOf: ["sg5"] }, points: 4, severity: "importante", rationale: "Permite manter insulina até resolver a cetose sem hipoglicemia.", sourceIds: ["BR-SBD-CAD"] },
    { id: "s-reav-hgt", domain: "reavaliacao", description: "Glicemia capilar seriada após iniciar insulina", evidence: { kind: "reassessAfter", after: ["insulina_regular"], reassess: ["glicemia_capilar"], withinSeconds: 3600 }, points: 5, severity: "importante", rationale: "Controle horário da glicemia." },
    { id: "s-reav-k", domain: "reavaliacao", description: "Reavaliou potássio/gasometria após iniciar insulina", evidence: { kind: "reassessAfter", after: ["insulina_regular"], reassess: ["gaso_venosa", "eletrolitos", "gaso_arterial"], withinSeconds: 10800 }, points: 5, severity: "importante", rationale: "K⁺ e acidose a cada 2–4 h." },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de CAD", evidence: { kind: "diagnosis", accepted: ["cad"] }, points: 4, severity: "importante", rationale: "Glicemia > 250, pH < 7,3, HCO₃ < 15–18 e cetose." },
    { id: "s-destino", domain: "destino", description: "Internação monitorizada (UTI ou enfermaria com protocolo)", evidence: { kind: "disposition", accepted: ["uti", "internacao_enfermaria"] }, points: 6, severity: "importante", rationale: "Necessita insulina IV e controles frequentes." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Por que ele respira tão rápido e profundo?" },
      { level: 2, text: "Antes de qualquer insulina: o que você precisa saber sobre os eletrólitos?" },
      { level: 3, text: "A insulina faz o potássio entrar na célula e reduz a glicemia antes de resolver a cetose." },
      { level: 4, text: "Sugestão explícita: SF 0,9% 1 L na primeira hora, K⁺ conhecido, insulina regular IV 0,1 UI/kg/h, KCl no soro, glicose 5% quando glicemia < 250." }
    ],
    summary: "Jovem de 19 anos com poliúria, polidipsia, perda de peso e vômitos: CAD moderada (pH 7,12, HCO₃ 8) como abertura de DM1.",
    pathophysiology: "Deficiência de insulina e excesso de hormônios contrarreguladores aumentam lipólise e cetogênese hepática, gerando acidose metabólica com ânion gap elevado. A hiperglicemia causa diurese osmótica e desidratação. O potássio sérico pode estar normal ou alto apesar de depleção corporal total; a insulina o desloca para o intracelular.",
    keyPoints: [
      "Hidratação venosa é a primeira medida.",
      "Conheça o K⁺ antes da insulina; se < 3,3 mmol/L, reponha primeiro.",
      "Insulina regular IV em infusão; não suspender ao normalizar a glicemia — associar glicose.",
      "Monitorar glicemia de hora em hora e eletrólitos/gasometria a cada 2–4 h.",
      "Resolução: pH ≥ 7,3, HCO₃ ≥ 15–18, cetonemia baixa."
    ],
    alternatives: ["Ringer lactato como cristaloide é aceito.", "Insulina SC de ação rápida em CAD leve/moderada em alguns protocolos (não modelado aqui)."],
    oralRubric: [
      { id: "o1", concept: "Hidratação", synonyms: ["hidratação", "soro", "volume", "cristaloide"], weight: 3 },
      { id: "o2", concept: "Potássio antes da insulina", synonyms: ["potássio", "potassio", "k"], weight: 3 },
      { id: "o3", concept: "Insulina IV contínua", synonyms: ["insulina", "infusão", "bomba"], weight: 2 },
      { id: "o4", concept: "Glicose quando < 250", synonyms: ["glicose", "glicosado", "sg5"], weight: 1 }
    ],
    simplifications: ["Velocidades de queda da glicemia e do potássio são parâmetros didáticos (τ).", "Doses e velocidades de KCl devem ser conferidas no capítulo da SBD (validação pendente)."]
  },
  references: ["BR-SBD-CAD", "BR-SBD", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 6, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    {
      id: "t-aceitavel",
      kind: "acceptable",
      description: "Glicemia, labs, SF 2 L, insulina após K⁺, KCl repetido e SG5% quando glicemia cai",
      commands: [
        act(5, "glicemia_capilar"), ask(10, "h-evolucao"), act(20, "acesso_venoso"), act(115, "acesso_venoso"), test(220, "gaso_venosa"), test(225, "cetonemia"),
        rx(240, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 }),
        rx(1000, "insulina_regular", "fr100", 1, "UI", "IV", "infusao", { rate: { value: 0.1, unit: "UI/kg/h" } }),
        rx(1010, "kcl", "amp10", 20, "mEq", "IV", "infusao_volume", { durationMinutes: 60 }),
        rx(3900, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 120 }),
        act(4600, "glicemia_capilar"), rx(5000, "kcl", "amp10", 20, "mEq", "IV", "infusao_volume", { durationMinutes: 60 }),
        rx(9000, "sg5", "bolsa500", 500, "mL", "IV", "infusao_volume", { durationMinutes: 120 }),
        test(9100, "gaso_venosa"), dx(12000, "cad"), dest(12000, "uti")
      ],
      runUntilSeconds: 16000,
      expect: [{ condition: { path: "vars.k", op: "gte", value: 3.3 }, description: "K⁺ ≥ 3,3" }, { condition: { not: { ruleFired: "r-hipoglicemia" } }, description: "sem hipoglicemia" }, { condition: { path: "vars.ph", op: "gte", value: 7.25 }, description: "pH ≥ 7,25" }, { condition: { not: { ruleFired: "r-ins-sem-k" } }, description: "K⁺ conhecido antes da insulina" }]
    },
    {
      id: "t-sem-intervencao",
      kind: "no_intervention",
      description: "Sem tratamento por 1 hora",
      commands: [],
      runUntilSeconds: 3600,
      expect: [{ condition: { ruleFired: "r-sem-volume" }, description: "piora" }, { condition: { path: "vars.ph", op: "lt", value: 7.12 }, description: "acidose piora" }]
    },
    {
      id: "t-inadequada",
      kind: "inadequate",
      description: "Insulina imediata sem exames e sem reposição de potássio",
      commands: [act(5, "acesso_venoso"), act(100, "acesso_venoso"), rx(200, "insulina_regular", "fr100", 1, "UI", "IV", "infusao", { rate: { value: 0.1, unit: "UI/kg/h" } }), rx(210, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 })],
      runUntilSeconds: 9000,
      expect: [{ condition: { ruleFired: "r-ins-sem-k" }, description: "falha de segurança registrada" }, { condition: { ruleFired: "r-hipocalemia" }, description: "hipocalemia" }]
    },
    {
      id: "t-atraso",
      kind: "delay",
      description: "Hidratação só após 40 min, sem glicose 5% depois",
      commands: [act(5, "acesso_venoso"), act(100, "acesso_venoso"), test(150, "eletrolitos"), rx(2400, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), rx(2500, "insulina_regular", "fr100", 1, "UI", "IV", "infusao", { rate: { value: 0.1, unit: "UI/kg/h" } }), rx(2510, "kcl", "amp10", 40, "mEq", "IV", "infusao_volume", { durationMinutes: 120 })],
      runUntilSeconds: 20000,
      expect: [{ condition: { ruleFired: "r-sem-volume" }, description: "piora antes da hidratação" }, { condition: { ruleFired: "r-glicemia-250" }, description: "glicemia caiu sem glicose 5%" }]
    },
    {
      id: "t-alternativa",
      kind: "alternative",
      description: "Ringer lactato como cristaloide",
      commands: [act(5, "glicemia_capilar"), act(20, "acesso_venoso"), act(115, "acesso_venoso"), test(220, "eletrolitos"), rx(240, "ringer_lactato", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), rx(3900, "ringer_lactato", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 120 })],
      runUntilSeconds: 11500,
      expect: [{ condition: { ruleFired: "r-volume2" }, description: "hidratação adequada" }]
    }
  ]
};
