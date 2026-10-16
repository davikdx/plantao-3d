import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const VOL1 = { any: [{ drugGiven: "sf09", minTotal: { value: 500, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 500, unit: "mL" as const } }] };
const VOL_INICIO = { any: [{ drugGiven: "sf09" }, { drugGiven: "ringer_lactato" }] };
const AGUA = { drugGiven: "sg5", minTotal: { value: 200, unit: "mL" as const } };
const AGUA_RAPIDA = { drugGiven: "sg5", minTotal: { value: 2000, unit: "mL" as const } };
const ATB = { any: [{ drugGiven: "ceftriaxona" }, { drugGiven: "piperacilina_tazobactam" }, { drugGiven: "azitromicina" }] };

export const C059: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C059",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Idosa acamada de instituição de longa permanência, sonolenta e com febre",
  teachingTitle: "Hipernatremia com desidratação — volume isotônico se hipoperfusão, depois água livre calculada, correção ≤ 10 mmol/L/24 h e tratamento da causa",
  group: "Nefrologia",
  specialties: ["Clínica médica", "Geriatria", "Nefrologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Reconhecer hipernatremia hipovolêmica em idosa dependente com acesso limitado à água",
    "Restaurar a perfusão com cristaloide isotônico antes de corrigir o sódio",
    "Calcular o déficit de água livre e repor com fluido hipotônico, sem baixar mais de 10 mmol/L em 24 h",
    "Tratar o precipitante (infecção) e discutir cuidados com a instituição"
  ],
  keywords: ["idosa", "acamada", "sonolenta", "febre", "desidratada", "asilo"],
  patient: {
    name: "Ana Rosa Batista",
    ageYears: 86,
    sex: "feminino",
    weightKg: 48,
    heightCm: 150,
    visual: { ageGroup: "idoso", sex: "feminino", skinTone: 1, hairStyle: "curto", hairColor: "branco", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Idosa de 86 anos, com demência avançada, acamada, trazida de instituição de longa permanência por estar mais sonolenta há 2 dias, com febre e tosse. A cuidadora diz que 'ela não pede água e quase não está comendo'.",
  communication: "incapaz",
  informants: [{ id: "cuidadora", name: "Cuidadora da instituição", role: "Cuidadora" }],
  history: [
    hi("h-evolucao", "inicio", "Desde quando ela mudou?", [{ source: "cuidadora", text: "Há uns 3 dias começou tosse e febre; de ontem pra hoje ficou muito sonolenta, não abre o olho direito." }], ["quando", "mudou", "desde"]),
    hi("h-ingesta", "alimentacao_eliminacoes", "Quanto ela bebe e come? Quem oferece água?", [{ source: "cuidadora", text: "Ela não pede. A gente oferece nas refeições, mas na última semana estávamos com pouca gente na equipe… diurese quase não tem na fralda." }], ["bebe", "água", "come", "fralda", "diurese"]),
    hi("h-medicacoes", "medicacoes", "Que remédios ela usa?", [{ source: "cuidadora", text: "Donepezila e furosemida pela manhã." }], ["remédio", "medicação", "diurético"]),
    hi("h-antecedentes", "antecedentes", "Quais doenças ela tem?", [{ source: "cuidadora", text: "Alzheimer avançado, pressão alta. Tem filha, que é a responsável." }], ["doença", "antecedentes", "responsável"]),
    hi("h-diretivas", "social", "A família já conversou sobre limites de tratamento?", [{ source: "cuidadora", text: "A filha disse que quer tratamento, mas sem intubar." }], ["família", "limites", "diretiva", "intubar"])
  ],
  initial: {
    vars: { hr: 116, sbp: 90, dbp: 52, rr: 26, spo2: 92, temp: 38.6, gcs: 10, pain: 2, glucose: 132, perfusion: 0.45, effort: 0.4, na: 164, k: 4.2, cl: 126, creat: 2.1, urea: 148, osm: 352, hb: 14.8, wbc: 16200, plt: 210000, pcr: 14, lactate: 2.8, ph: 7.34, hco3: 20, urine: 8 },
    flags: { rhythm: "taquicardia_sinusal", posture: "supino", painVisual: "leve", speech: "nenhuma", consciousness: "voz", cough: true },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Mucosas muito secas, língua saburrosa, olhos encovados, turgor reduzido; extremidades frias, enchimento capilar 4 s.", { label: "Hidratação/perfusão", better: [{ when: { ruleFired: "r-volume" }, text: "Extremidades mais quentes, enchimento capilar 2–3 s; mucosas ainda secas." }] }),
    ex("e-torax", "torax_posterior", "ausculta", "Estertores em base direita.", { sound: "estertores", label: "Pulmões" }),
    ex("e-neuro", "neurologico", "especial", "Glasgow 10 (O2 V2 M6), sem déficit focal novo, sem rigidez de nuca.", {}),
    ex("e-pele", "pele", "inspecao", "Lesão por pressão estágio 2 em região sacral.", {})
  ],
  testResults: [
    { testId: "rx_torax", variants: [{ text: "Laudo educativo: consolidação em base direita." }] },
    { testId: "urina_tipo1", variants: [{ text: "Urina concentrada, densidade 1,030; sem nitrito; leucócitos discretos." }] }
  ],
  highlightedActions: ["monitorizar", "acesso_venoso", "glicemia_capilar", "diurese_horaria"],
  rules: [
    { id: "r-curso", description: "Desidratação hipertônica e sepse pulmonar em evolução", priority: 10, when: { always: true }, repeat: "once", effects: [trend("sbp", 80, 3600, "doenca", 10), trend("hr", 124, 3600, "doenca", 10), trend("na", 167, 7200, "doenca", 10), trend("gcs", 8, 5400, "doenca", 10), trend("creat", 2.5, 7200, "doenca", 10), trend("temp", 39.0, 3600, "doenca", 10)] },
    { id: "r-volume", description: "Cristaloide isotônico: perfusão restaurada (sódio quase não muda)", priority: 30, when: VOL1, repeat: "once", effects: [trend("sbp", 108, 1200, "vol", 30), trend("hr", 104, 1200, "vol", 30), trend("perfusion", 0.75, 1200, "vol", 30), trend("urine", 30, 2400, "vol", 30), trend("creat", 1.7, 10800, "vol", 30), trend("na", 163, 3600, "vol", 15)] },
    { id: "r-agua", description: "Água livre (SG 5%): queda gradual do sódio", priority: 40, when: { all: [AGUA, VOL_INICIO] }, repeat: "once", effects: [trend("na", 156, 10800, "agua", 40), trend("gcs", 12, 7200, "agua", 40), obs("Água livre em curso: meta de queda ≤ 10 mmol/L em 24 h; dosar sódio a cada 4–6 h no início.")] },
    { id: "r-agua-sem-volume", description: "SG 5% sem restaurar volemia: perfusão continua ruim", priority: 35, when: { all: [AGUA, { not: VOL_INICIO }] }, repeat: "once", effects: [trend("na", 160, 7200, "agua0", 35), obs("Glicose 5% distribui-se pela água corporal total: corrige pouco o volume intravascular. Na hipoperfusão, cristaloide isotônico primeiro.")] },
    { id: "r-rapida", description: "Água livre em excesso e rápida: queda abrupta do sódio", priority: 60, when: AGUA_RAPIDA, repeat: "once", effects: [trend("na", 148, 3600, "rapida", 60)] },
    { id: "r-queda-excessiva", description: "Queda > 12 mmol/L: risco de edema cerebral", priority: 70, when: { path: "vars.na", op: "lte", value: 152 }, repeat: "once", effects: [flag("seizure", true), staff("enfermagem", "Ela teve abalos nos braços agora!"), obs("Correção rápida de hipernatremia crônica pode causar edema cerebral e convulsões."), outcome("complicacao")] },
    { id: "r-fim-crise", description: "Crise cede", priority: 71, when: { elapsedSince: "rule:r-queda-excessiva", op: "gte", seconds: 120 }, repeat: "once", effects: [flag("seizure", false)] },
    { id: "r-atb", description: "Antibiótico para pneumonia", priority: 20, when: ATB, repeat: "once", effects: [trend("temp", 37.6, 7200, "atb", 20), trend("wbc", 12000, 14400, "atb", 20)] },
    { id: "r-choque", description: "Sem volume em 40 min: choque", priority: 25, when: { all: [{ time: "gte", seconds: 2400 }, { not: VOL_INICIO }] }, repeat: "once", effects: [trend("sbp", 70, 900, "choque", 25), trend("hr", 130, 900, "choque", 25), trend("lactate", 4.6, 1800, "choque", 25), trend("gcs", 7, 1800, "choque", 25), staff("enfermagem", "A pressão caiu para 70, ela está mais apagada."), outcome("piora")] }
  ],
  diagnosis: { primary: "hipernatremia", accepted: ["hipernatremia", "desidratacao_grave"], differentials: ["sepse", "pneumonia", "ehh", "avc_isquemico", "delirium", "lra"] },
  acceptedDestinations: ["internacao_enfermaria", "uti"],
  outcomeNotes: "Hipernatremia hipovolêmica (Na 164) em idosa com demência, acamada e com acesso limitado à água, agravada por furosemida e pneumonia. Cristaloide isotônico até restaurar perfusão, depois água livre (SG 5% ou água por sonda) conforme déficit (~0,45 × 48 × (164/140 − 1) ≈ 3,7 L), queda ≤ 10 mmol/L em 24 h com sódio seriado, suspender furosemida, antibiótico, cuidados com lesão por pressão; internação respeitando diretivas da família.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Ingestão hídrica, diurese e medicações", evidence: { kind: "historyAsked", items: ["h-ingesta", "h-medicacoes"], minCount: 2 }, points: 8, severity: "critica", rationale: "Acesso à água e diurético explicam o quadro." },
    { id: "s-diretivas", domain: "historia", description: "Perguntou sobre diretivas/limites de tratamento", evidence: { kind: "historyAsked", items: ["h-diretivas"], minCount: 1 }, points: 4, severity: "importante", rationale: "Plano proporcional e respeitoso." },
    { id: "s-exame", domain: "historia", description: "Perfusão, pulmões, neurológico e pele", evidence: { kind: "examDone", regions: ["geral", "torax_posterior", "neurologico", "pele"], minCount: 3 }, points: 6, severity: "importante", rationale: "Hipovolemia, foco infeccioso, lesão por pressão." },
    { id: "s-glicemia", domain: "priorizacao", description: "Glicemia capilar", evidence: { kind: "actionDone", anyOf: ["glicemia_capilar"], withinSeconds: 300 }, points: 4, severity: "importante", rationale: "Rebaixamento." },
    { id: "s-labs", domain: "exames", description: "Sódio (gasometria/eletrólitos) e função renal", evidence: { kind: "testOrdered", anyOf: ["gaso_venosa", "eletrolitos", "funcao_renal"], withinSeconds: 900 }, points: 8, severity: "critica", rationale: "Diagnóstico e meta de correção." },
    { id: "s-volume", domain: "tratamento", description: "Cristaloide isotônico primeiro", evidence: { kind: "drugGiven", anyOf: ["sf09", "ringer_lactato"], withinSeconds: 1200 }, points: 14, severity: "critica", rationale: "Depleção de volume: isotônico antes da água livre.", sourceIds: ["INT-MDCALC-HIPERNA-2025"] },
    { id: "s-agua", domain: "tratamento", description: "Água livre hipotônica", evidence: { kind: "drugGiven", anyOf: ["sg5"] }, points: 10, severity: "critica", rationale: "Repor o déficit de água livre.", sourceIds: ["INT-MDCALC-HIPERNA-2025"] },
    { id: "s-rapida", domain: "tratamento", description: "Falha: queda de sódio excessiva", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-queda-excessiva" } }, points: 12, penalty: true, severity: "critica", rationale: "Limite de 10 mmol/L em 24 h.", sourceIds: ["INT-MDCALC-HIPERNA-2025"] },
    { id: "s-atb", domain: "tratamento", description: "Antibiótico para pneumonia", evidence: { kind: "drugGiven", anyOf: ["ceftriaxona", "piperacilina_tazobactam", "azitromicina"], withinSeconds: 3600 }, points: 6, severity: "importante", rationale: "Tratar o precipitante." },
    { id: "s-reav", domain: "reavaliacao", description: "Sódio e diurese seriados", evidence: { kind: "reassessAfter", after: ["sg5", "sf09", "ringer_lactato"], reassess: ["gaso_venosa", "eletrolitos", "diurese_horaria", "medir_pa"], withinSeconds: 5400 }, points: 10, severity: "importante", rationale: "Controle da velocidade de correção." },
    { id: "s-dx", domain: "destino", description: "Hipernatremia com desidratação", evidence: { kind: "diagnosis", accepted: ["hipernatremia", "desidratacao_grave"] }, points: 4, severity: "importante", rationale: "Na 164 com hipovolemia." },
    { id: "s-destino", domain: "destino", description: "Internação", evidence: { kind: "disposition", accepted: ["internacao_enfermaria", "uti"] }, points: 6, severity: "importante", rationale: "Correção lenta com controles frequentes." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Quem não consegue pedir água, como ela, depende de quem oferece." },
      { level: 2, text: "Ela está hipoperfundida: o que vem primeiro, volume ou água livre?" },
      { level: 3, text: "Depois da perfusão, calcule o déficit de água livre e corrija devagar." },
      { level: 4, text: "Sugestão explícita: glicemia, gasometria/eletrólitos/função renal, SF 0,9% 500 mL, SG 5% calculado, sódio a cada 4–6 h, ceftriaxona, suspender furosemida, internar." }
    ],
    summary: "Idosa de 86 anos com demência avançada, acamada, com hipernatremia hipovolêmica (Na 164), lesão renal pré-renal e pneumonia, agravadas por furosemida e baixa oferta de água.",
    pathophysiology: "Perdas de água (febre, taquipneia, diurético) sem reposição elevam o sódio. Os neurônios se adaptam em 24–48 h gerando osmólitos; se o sódio cair rápido, a água entra nas células e causa edema cerebral. Por isso a correção da hipernatremia crônica deve ser lenta.",
    keyPoints: [
      "Hipernatremia em idoso dependente = falha de acesso à água até prova em contrário.",
      "Hipoperfusão: cristaloide isotônico primeiro.",
      "Déficit de água livre = fração de água corporal × peso × (Na/140 − 1); idosas: 0,45.",
      "Correção ≤ 10 mmol/L em 24 h com sódio seriado.",
      "Tratar a causa, suspender diurético, rever cuidados da instituição."
    ],
    alternatives: ["Água por sonda nasogástrica em vez de SG 5% quando a via enteral é segura.", "Cuidados proporcionais conforme diretivas antecipadas."],
    oralRubric: [
      { id: "o1", concept: "Volume isotônico primeiro", synonyms: ["soro fisiológico", "isotônico", "volume", "perfusão"], weight: 2 },
      { id: "o2", concept: "Déficit de água livre", synonyms: ["déficit", "água livre", "sg5", "hipotônico"], weight: 3 },
      { id: "o3", concept: "Correção lenta", synonyms: ["10 mmol", "edema cerebral", "devagar"], weight: 3 },
      { id: "o4", concept: "Causa", synonyms: ["acesso à água", "furosemida", "pneumonia", "instituição"], weight: 1 }
    ],
    simplifications: ["SG 5% representa a água livre (enteral ou IV).", "A correção ao longo de 24 h é comprimida em horas no simulador.", "Hiperglicemia induzida pelo SG 5% não é modelada."]
  },
  references: ["INT-MDCALC-HIPERNA-2025", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 8, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "História, exame, glicemia, labs, SF 500 mL, SG 5% calculado, ceftriaxona, sódio seriado, internação", commands: [ask(10, "h-ingesta"), ask(20, "h-medicacoes"), ask(30, "h-diretivas"), act(40, "glicemia_capilar"), act(50, "monitorizar"), { atSeconds: 60, type: "examine", payload: { region: "geral", maneuver: "inspecao" } }, { atSeconds: 70, type: "examine", payload: { region: "torax_posterior", maneuver: "ausculta" } }, { atSeconds: 80, type: "examine", payload: { region: "neurologico", maneuver: "especial" } }, act(90, "acesso_venoso"), test(200, "gaso_venosa"), test(210, "funcao_renal"), rx(250, "sf09", "bolsa500", 500, "mL", "IV", "infusao_volume", { durationMinutes: 30 }), test(300, "rx_torax"), rx(900, "ceftriaxona", "fa1g", 1000, "mg", "IV"), rx(2400, "sg5", "bolsa500", 500, "mL", "IV", "infusao_volume", { durationMinutes: 240 }), act(2500, "diurese_horaria"), test(9000, "gaso_venosa"), dx(9100, "hipernatremia"), dest(9200, "internacao_enfermaria")], runUntilSeconds: 12000, expect: [{ condition: { ruleFired: "r-volume" }, description: "perfusão restaurada" }, { condition: { ruleFired: "r-agua" }, description: "água livre" }, { condition: { not: { ruleFired: "r-queda-excessiva" } }, description: "correção segura" }, { condition: { path: "vars.na", op: "lt", value: 164 }, description: "sódio em queda" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-choque" }, description: "choque" }] },
    { id: "t-inadequada", kind: "inadequate", description: "SG 5% rápido em grande volume sem cristaloide", commands: [act(30, "acesso_venoso"), act(130, "acesso_venoso"), rx(200, "sg5", "bolsa500", 500, "mL", "IV", "infusao_volume", { durationMinutes: 30 }), rx(220, "sg5", "bolsa500", 500, "mL", "IV", "infusao_volume", { durationMinutes: 30 }), rx(2100, "sg5", "bolsa500", 500, "mL", "IV", "infusao_volume", { durationMinutes: 30 }), rx(2120, "sg5", "bolsa500", 500, "mL", "IV", "infusao_volume", { durationMinutes: 30 })], runUntilSeconds: 9000, expect: [{ condition: { ruleFired: "r-agua-sem-volume" }, description: "água sem volume" }, { condition: { ruleFired: "r-choque" }, description: "choque" }, { condition: { ruleFired: "r-queda-excessiva" }, description: "queda excessiva" }] },
    { id: "t-atraso", kind: "delay", description: "Volume só aos 50 min", commands: [act(30, "acesso_venoso"), test(150, "gaso_venosa"), rx(3000, "sf09", "bolsa500", 500, "mL", "IV", "infusao_volume", { durationMinutes: 30 }), rx(5000, "sg5", "bolsa500", 500, "mL", "IV", "infusao_volume", { durationMinutes: 240 })], runUntilSeconds: 10000, expect: [{ condition: { ruleFired: "r-choque" }, description: "choque pelo atraso" }, { condition: { ruleFired: "r-volume" }, description: "perfusão restaurada" }, { condition: { not: { ruleFired: "r-queda-excessiva" } }, description: "correção segura" }] },
    { id: "t-alternativa", kind: "alternative", description: "Ringer lactato e SG 5%, UTI", commands: [act(30, "acesso_venoso"), test(150, "eletrolitos"), rx(200, "ringer_lactato", "bolsa500", 500, "mL", "IV", "infusao_volume", { durationMinutes: 30 }), rx(2600, "sg5", "bolsa500", 500, "mL", "IV", "infusao_volume", { durationMinutes: 240 }), rx(2700, "piperacilina_tazobactam", "fa45", 4500, "mg", "IV"), dest(4000, "uti")], runUntilSeconds: 9000, expect: [{ condition: { ruleFired: "r-volume" }, description: "perfusão" }, { condition: { ruleFired: "r-agua" }, description: "água livre" }] }
  ]
};
