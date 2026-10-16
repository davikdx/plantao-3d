import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, oxygenResponse, rx, staff, test, trend } from "./helpers";

const CEFTRI = { drugGiven: "ceftriaxona" };
const ATB = { any: [CEFTRI, { drugGiven: "piperacilina_tazobactam" }] };

export const C019: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C019",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Idoso com febre, tosse e falta de ar, mais confuso que o habitual",
  teachingTitle: "Pneumonia adquirida na comunidade grave em idoso — CURB-65, oxigênio, antibiótico precoce e destino",
  group: "Pneumologia",
  specialties: ["Pneumologia", "Infectologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "upa-porte-ii",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Reconhecer pneumonia com critérios de gravidade (CURB-65, hipoxemia, confusão)",
    "Ofertar oxigênio com alvo e reavaliar",
    "Iniciar antibiótico empírico adequado em até 1 hora quando há sinais de sepse",
    "Colher culturas sem atrasar o antibiótico",
    "Definir destino (internação; UTI se critérios maiores)"
  ],
  keywords: ["febre", "tosse", "falta de ar", "confuso", "catarro"],
  patient: {
    name: "Geraldo Prado",
    ageYears: 78,
    sex: "masculino",
    weightKg: 66,
    heightCm: 168,
    visual: { ageGroup: "idoso", sex: "masculino", skinTone: 2, hairStyle: "curto", hairColor: "branco", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "UPA 24h. Idoso de 78 anos trazido pela filha: febre e tosse com catarro há 3 dias; hoje está mais confuso, sonolento e com respiração rápida.",
  communication: "limitada",
  informants: [{ id: "filha", name: "Marta", role: "Filha" }],
  history: [
    hi("h-sintomas", "queixa", "Quais sintomas ele teve?", [{ source: "filha", text: "Febre de 39, tosse com catarro amarelado, cansaço. Hoje não reconheceu o neto." }], ["sintomas", "febre", "tosse"]),
    hi("h-inicio", "inicio", "Desde quando?", [{ source: "filha", text: "Três dias." }], ["quando"]),
    hi("h-antecedentes", "antecedentes", "Que doenças ele tem?", [{ source: "filha", text: "Pressão alta e um derrame há 5 anos; às vezes engasga com líquido." }], ["doenças", "derrame", "engasga"]),
    hi("h-atb", "medicacoes", "Usou antibiótico ou foi internado nos últimos 3 meses?", [{ source: "filha", text: "Não usou antibiótico e não ficou internado." }], ["antibiótico", "internado"]),
    hi("h-alergias", "alergias", "Tem alergia a remédio?", [{ source: "filha", text: "Não que a gente saiba." }], ["alergia"])
  ],
  initial: {
    vars: { hr: 112, sbp: 102, dbp: 58, rr: 32, spo2: 86, temp: 38.9, gcs: 13, pain: 2, glucose: 148, perfusion: 0.6, effort: 0.6, wbc: 18400, pcr: 210, urea: 76, creat: 1.5, na: 133, lactate: 2.6, ph: 7.38, pco2: 34, po2: 52 },
    flags: { rhythm: "taquicardia_sinusal", cough: true, posture: "fowler", painVisual: "leve", speech: "palavras", consciousness: "voz", communication: "limitada" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-pulmao", "torax_posterior", "ausculta", "Estertores crepitantes e sopro tubário em base direita; macicez à percussão local.", { sound: "estertores" }),
    ex("e-neuro", "neurologico", "especial", "Desorientado no tempo, sem déficit focal novo; sem rigidez de nuca.", {}),
    ex("e-perfusao", "membro_superior_d", "palpacao", "Pulsos finos; enchimento capilar 3 s.", { label: "Perfusão" })
  ],
  testResults: [
    { testId: "rx_torax", variants: [{ text: "Consolidação em lobo inferior direito com broncograma aéreo; sem derrame volumoso. (Laudo educativo.)" }] },
    { testId: "pocus_pulmonar", variants: [{ text: "Consolidação com broncograma dinâmico em base direita; linhas B focais." }] },
    { testId: "hemocultura", variants: [{ text: "Coletadas 2 amostras; resultado em 48–72 h." }] }
  ],
  highlightedActions: ["monitorizar", "o2_cateter", "acesso_venoso", "glicemia_capilar"],
  rules: [
    oxygenResponse(93, 120),
    { id: "r-atb", description: "Antibiótico na primeira hora: melhora clínica progressiva", priority: 50, when: { all: [ATB, { elapsedSince: "drug:ceftriaxona", op: "gte", seconds: 1800 }, { time: "lte", seconds: 5400 }] }, repeat: "once", effects: [trend("temp", 37.8, 1800, "atb", 50), trend("hr", 98, 1800, "atb", 50), trend("rr", 24, 1800, "atb", 50), outcome("melhora")] },
    { id: "r-sepse", description: "Sem antibiótico em 60 min: evolução para choque séptico", priority: 30, when: { all: [{ time: "gte", seconds: 3600 }, { not: ATB }] }, repeat: "once", effects: [trend("sbp", 80, 900, "sepse", 30), trend("dbp", 44, 900, "sepse", 30), trend("lactate", 4.6, 1800, "sepse", 30), trend("perfusion", 0.35, 900, "sepse", 30), flag("consciousness", "dor"), staff("enfermagem", "A pressão está 80 por 44 e ele quase não responde."), outcome("piora")] },
    { id: "r-volume", description: "Cristaloide 30 mL/kg se hipoperfusão", when: { any: [{ drugGiven: "sf09", minTotal: { value: 1000, unit: "mL" } }, { drugGiven: "ringer_lactato", minTotal: { value: 1000, unit: "mL" } }] }, repeat: "once", effects: [trend("sbp", 112, 600, "vol", 40, 3600), trend("perfusion", 0.65, 600, "vol", 40, 3600)] },
    { id: "r-cefalo-isolado", description: "Sem cobertura de atípicos", when: { all: [CEFTRI, { not: { drugGiven: "azitromicina" } }, { time: "gte", seconds: 3000 }] }, repeat: "once", effects: [obs("Betalactâmico sem macrolídeo: em PAC grave internada, diretrizes recomendam associar cobertura para atípicos (ou usar quinolona respiratória).")] },
    { id: "r-aspiracao", description: "Risco de broncoaspiração", when: { actionCompleted: "jejum_cabeceira" }, repeat: "once", effects: [obs("Cabeceira elevada e dieta suspensa até avaliação da deglutição (sequela de AVC).")] },
    { id: "r-regulacao", description: "Regulação de leito", when: { actionCompleted: "acionar_samu" }, repeat: "once", effects: [staff("regulacao", "Regulação: leito de clínica médica em hospital de referência em 3 h; se choque, solicitar UTI.")] }
  ],
  diagnosis: { primary: "pneumonia", accepted: ["pneumonia", "sepse"], differentials: ["sepse", "icc_descompensada", "tep", "delirium", "itu_complicada"] },
  acceptedDestinations: ["transferencia_regulada", "permanece_em_sala_vermelha"],
  outcomeNotes: "PAC com CURB-65 = 4 (confusão, ureia elevada, FR ≥ 30, ≥ 65 anos), hipoxemia e sinais de sepse: O₂, culturas, ceftriaxona + azitromicina na primeira hora, volume se hipoperfusão, prevenção de aspiração e internação via regulação.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Antibiótico/internação recentes e risco de aspiração", evidence: { kind: "historyAsked", items: ["h-atb", "h-antecedentes"], minCount: 2 }, points: 6, severity: "importante", rationale: "Definem risco de resistentes e aspiração.", sourceIds: ["INT-ATS-PAC-2019"] },
    { id: "s-exame", domain: "historia", description: "Ausculta pulmonar e avaliação neurológica", evidence: { kind: "examDone", regions: ["torax_posterior", "neurologico"], minCount: 2 }, points: 6, severity: "importante", rationale: "Foco e confusão (CURB-65)." },
    { id: "s-o2", domain: "priorizacao", description: "Oxigênio em até 5 min", evidence: { kind: "actionDone", anyOf: ["o2_cateter", "o2_mascara_reservatorio"], withinSeconds: 300 }, points: 8, severity: "critica", rationale: "SpO₂ 86%." },
    { id: "s-acesso", domain: "priorizacao", description: "Acesso e monitorização", evidence: { kind: "actionDone", anyOf: ["acesso_venoso", "monitorizar"], withinSeconds: 600 }, points: 4, severity: "importante", rationale: "Sinais de sepse." },
    { id: "s-culturas", domain: "exames", description: "Hemoculturas antes do antibiótico (sem atrasá-lo)", evidence: { kind: "testOrdered", anyOf: ["hemocultura"], withinSeconds: 3600 }, points: 5, severity: "importante", rationale: "PAC grave internada.", sourceIds: ["INT-ATS-PAC-2019"] },
    { id: "s-exames", domain: "exames", description: "RX/POCUS, lactato, ureia", evidence: { kind: "testOrdered", anyOf: ["rx_torax", "pocus_pulmonar"] }, points: 6, severity: "importante", rationale: "Confirma foco e gravidade." },
    { id: "s-atb", domain: "tratamento", description: "Antibiótico em até 1 hora", evidence: { kind: "drugGiven", anyOf: ["ceftriaxona", "piperacilina_tazobactam"], withinSeconds: 3600 }, points: 15, severity: "critica", rationale: "Sepse: antibiótico na primeira hora.", sourceIds: ["INT-SSC-2021", "INT-ATS-PAC-2019"] },
    { id: "s-macrolideo", domain: "tratamento", description: "Cobertura de atípicos (macrolídeo)", evidence: { kind: "drugGiven", anyOf: ["azitromicina"] }, points: 5, severity: "importante", rationale: "PAC grave internada.", sourceIds: ["INT-ATS-PAC-2019"] },
    { id: "s-volume", domain: "tratamento", description: "Volume para hipoperfusão", evidence: { kind: "drugGiven", anyOf: ["sf09", "ringer_lactato"] }, points: 5, severity: "importante", rationale: "Lactato elevado e PA limítrofe.", sourceIds: ["INT-SSC-2021"] },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou PA, SpO₂ e lactato", evidence: { kind: "reassessAfter", after: ["ceftriaxona"], reassess: ["medir_pa", "gaso_venosa", "gaso_arterial", "oximetria_portatil"], withinSeconds: 3600 }, points: 10, severity: "importante", rationale: "Resposta ao tratamento." },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de pneumonia", evidence: { kind: "diagnosis", accepted: ["pneumonia", "sepse"] }, points: 5, severity: "importante", rationale: "Consolidação com febre e leucocitose." },
    { id: "s-destino", domain: "destino", description: "Internação via regulação", evidence: { kind: "disposition", accepted: ["transferencia_regulada", "permanece_em_sala_vermelha"] }, points: 5, severity: "critica", rationale: "CURB-65 alto.", sourceIds: ["BR-UPA"] }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Quais critérios de gravidade ele tem?" },
      { level: 2, text: "Sinais de sepse mudam o relógio do antibiótico." },
      { level: 3, text: "Sequela de AVC com engasgo: pense em aspiração." },
      { level: 4, text: "Sugestão explícita: O₂, acesso, hemoculturas, ceftriaxona + azitromicina em até 1 h, volume, cabeceira elevada, regulação." }
    ],
    summary: "Idoso de 78 anos com PAC lobar direita grave (CURB-65 = 4), hipoxemia, confusão e sinais de sepse.",
    pathophysiology: "Bactérias (sobretudo pneumococo) alcançam o alvéolo e desencadeiam resposta inflamatória com exsudato (consolidação), shunt e hipoxemia. A resposta sistêmica pode evoluir para sepse; em idosos, confusão é apresentação frequente.",
    keyPoints: [
      "CURB-65/critérios ATS orientam o local de tratamento.",
      "O₂ com alvo; reavaliar.",
      "Antibiótico em até 1 h na sepse; culturas antes, sem atrasar.",
      "PAC grave: betalactâmico + macrolídeo (ou quinolona respiratória).",
      "Avaliar aspiração e deglutição."
    ],
    alternatives: ["Quinolona respiratória (levofloxacino) — não modelada."],
    oralRubric: [
      { id: "o1", concept: "Gravidade", synonyms: ["curb", "gravidade", "sepse"], weight: 2 },
      { id: "o2", concept: "Antibiótico precoce", synonyms: ["ceftriaxona", "antibiótico", "1 hora"], weight: 3 },
      { id: "o3", concept: "Atípicos", synonyms: ["azitromicina", "macrolídeo", "atípicos"], weight: 1 },
      { id: "o4", concept: "Oxigênio e destino", synonyms: ["oxigênio", "internação", "regulação"], weight: 2 }
    ],
    simplifications: ["Melhora clínica foi comprimida em minutos.", "Choque séptico aos 60 min sem antibiótico é didático."]
  },
  references: ["INT-ATS-PAC-2019", "INT-SSC-2021", "BR-UPA", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "O₂, culturas, ceftriaxona + azitromicina, volume e regulação", commands: [act(5, "o2_cateter", { fluxo: 4 }), act(10, "monitorizar"), ask(20, "h-atb"), ask(30, "h-antecedentes"), act(40, "acesso_venoso"), act(140, "acesso_venoso"), test(150, "hemocultura"), test(160, "rx_torax"), rx(300, "ceftriaxona", "fa1g", 2000, "mg", "IV"), rx(320, "azitromicina", "fa500", 500, "mg", "IV"), rx(340, "ringer_lactato", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 30 }), act(360, "jejum_cabeceira"), act(400, "acionar_samu"), act(2400, "medir_pa"), dx(3000, "pneumonia"), dest(3000, "transferencia_regulada")], runUntilSeconds: 4000, expect: [{ condition: { ruleFired: "r-atb" }, description: "melhora" }, { condition: { not: { ruleFired: "r-sepse" } }, description: "sem choque" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 4000, expect: [{ condition: { ruleFired: "r-sepse" }, description: "choque séptico" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Só antitérmico e O₂", commands: [act(5, "o2_cateter", { fluxo: 4 }), act(40, "acesso_venoso"), act(140, "acesso_venoso"), rx(200, "dipirona", "amp1g", 1000, "mg", "IV")], runUntilSeconds: 4000, expect: [{ condition: { ruleFired: "r-sepse" }, description: "sepse" }] },
    { id: "t-atraso", kind: "delay", description: "Antibiótico só aos 80 min, sem macrolídeo", commands: [act(40, "acesso_venoso"), act(140, "acesso_venoso"), rx(4800, "ceftriaxona", "fa1g", 2000, "mg", "IV")], runUntilSeconds: 8500, expect: [{ condition: { ruleFired: "r-sepse" }, description: "choque" }, { condition: { ruleFired: "r-cefalo-isolado" }, description: "sem atípicos" }, { condition: { not: { ruleFired: "r-atb" } }, description: "sem melhora rápida" }] },
    { id: "t-alternativa", kind: "alternative", description: "Ceftriaxona 1 g (dose menor da faixa) + azitromicina", commands: [act(5, "o2_cateter", { fluxo: 4 }), act(40, "acesso_venoso"), act(140, "acesso_venoso"), rx(300, "ceftriaxona", "fa1g", 1000, "mg", "IV"), rx(320, "azitromicina", "fa500", 500, "mg", "IV")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-atb" }, description: "melhora" }] }
  ]
};
