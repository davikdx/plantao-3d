import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const VOL1 = { any: [{ drugGiven: "sf09", minTotal: { value: 900, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 900, unit: "mL" as const } }] };
const VOL2 = { any: [{ drugGiven: "sf09", minTotal: { value: 1500, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 1500, unit: "mL" as const } }, { all: [{ drugGiven: "sf09", minTotal: { value: 500, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 900, unit: "mL" as const } }] }] };
const VOL_INICIO = { any: [{ drugGiven: "sf09" }, { drugGiven: "ringer_lactato" }] };
const INSULINA = { treatmentActive: "insulina_regular" };
const K_CONHECIDO = { any: [{ testCollected: "eletrolitos" }, { testCollected: "gaso_venosa" }, { testCollected: "gaso_arterial" }] };
const ATB = { any: [{ drugGiven: "ceftriaxona" }, { drugGiven: "piperacilina_tazobactam" }, { drugGiven: "cefepima" }] };

export const C050: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C050",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Idosa com diabetes, muito sonolenta e desidratada há alguns dias",
  teachingTitle: "Estado hiperglicêmico hiperosmolar — reidratação primeiro, insulina em dose baixa, potássio, queda gradual da osmolalidade e fator precipitante",
  group: "Endocrinologia",
  specialties: ["Clínica médica", "Endocrinologia", "Emergência", "Geriatria"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Reconhecer o estado hiperglicêmico hiperosmolar (glicemia ≥ 600, osmolalidade efetiva ≥ 320, sem cetoacidose)",
    "Priorizar a reidratação com SF 0,9% 15–20 mL/kg na primeira hora",
    "Iniciar insulina em dose baixa só após reidratação inicial e K⁺ conhecido ≥ 3,3",
    "Repor potássio, associar glicose ao atingir 250–300 mg/dL e evitar queda rápida da osmolalidade",
    "Investigar e tratar o fator precipitante"
  ],
  keywords: ["diabetes", "sonolenta", "desidratada", "idosa", "confusa", "sede"],
  patient: {
    name: "Iracema Lopes",
    ageYears: 76,
    sex: "feminino",
    weightKg: 60,
    heightCm: 155,
    visual: { ageGroup: "idoso", sex: "feminino", skinTone: 2, hairStyle: "coque", hairColor: "grisalho", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Filha traz a mãe de 76 anos, com diabetes tipo 2, porque há 4 dias está urinando muito, bebendo pouco, ardência ao urinar e hoje 'não fala coisa com coisa' e dorme o tempo todo.",
  communication: "limitada",
  informants: [{ id: "filha", name: "Filha", role: "Acompanhante" }],
  history: [
    hi("h-evolucao", "inicio", "Desde quando está assim? O que mudou?", [{ source: "filha", text: "Faz uns 4 dias. Começou com ardência pra urinar, urinava toda hora, quase não comia nem bebia. Hoje acordou confusa e foi ficando sonolenta." }], ["quando", "desde", "começou"]),
    hi("h-medicacoes", "medicacoes", "Que remédios ela usa? Tomou certinho?", [{ source: "filha", text: "Metformina e glibenclamida. Há uns dias parou de tomar porque não estava comendo. Toma também hidroclorotiazida para pressão." }], ["remédio", "medicação", "metformina", "insulina"]),
    hi("h-urina", "fatores_associados", "Teve febre, ardência, dor nas costas?", [{ source: "filha", text: "Ardência e febre baixa ontem. Dor nas costas não sei." }], ["febre", "ardência", "urina", "costas"]),
    hi("h-glicemia", "antecedentes", "Ela mede glicemia em casa?", [{ source: "filha", text: "O aparelho só mostrava 'HI' desde ontem." }], ["glicemia", "aparelho", "mede"]),
    hi("h-cardio", "antecedentes", "Tem problema de coração ou de rim?", [{ source: "filha", text: "Só pressão alta. Coração bom, segundo o médico do posto." }], ["coração", "rim", "insuficiência"]),
    hi("h-alergias", "alergias", "Tem alergia a remédio?", [{ source: "filha", text: "Não." }])
  ],
  initial: {
    vars: { hr: 114, sbp: 96, dbp: 58, rr: 22, spo2: 96, temp: 37.9, gcs: 11, pain: 2, glucose: 940, perfusion: 0.5, effort: 0.3, ph: 7.34, pco2: 36, hco3: 20, be: -4, lactate: 2.6, na: 137, k: 4.6, cl: 102, ca: 9.2, mg: 1.8, ketones: 0.8, osm: 352, creat: 2.2, urea: 110, hb: 14.6, wbc: 15200, plt: 260000, pcr: 9.5, urine: 15 },
    flags: { rhythm: "taquicardia_sinusal", posture: "supino", painVisual: "leve", speech: "palavras", consciousness: "voz" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Mucosas muito secas, turgor reduzido, olhos encovados; sonolenta, desperta ao chamado e volta a dormir.", { better: [{ when: { ruleFired: "r-volume2" }, text: "Mucosas úmidas, mais desperta, responde perguntas simples." }] }),
    ex("e-neuro", "neurologico", "especial", "Glasgow 11 (O3 V3 M5); sem déficit focal; pupilas isocóricas; sem rigidez de nuca.", { label: "Neurológico", better: [{ when: { ruleFired: "r-volume2" }, text: "Glasgow 14; orientada parcialmente; sem déficit focal." }, { when: { ruleFired: "r-sem-volume" }, text: "Glasgow 8; responde apenas à dor." }] }),
    ex("e-torax", "torax_anterior", "ausculta", "Murmúrio presente, sem estertores.", { sound: "murmurio_normal" }),
    ex("e-abdome", "abdome_qid", "palpacao", "Abdome flácido, dor leve em hipogástrio; Giordano duvidoso à direita.", { label: "Abdome/lombar" }),
    ex("e-pele", "pele", "inspecao", "Pele seca; sem lesões infectadas nos pés.", {})
  ],
  testResults: [
    { testId: "urina_tipo1", variants: [{ text: "Leucocitúria intensa, nitrito positivo, glicosúria +++, cetonúria traços." }] },
    { testId: "urocultura", variants: [{ text: "Em andamento (resultado em 48–72 h)." }] },
    { testId: "hemocultura", variants: [{ text: "Em andamento (resultado em 48–72 h)." }] },
    { testId: "rx_torax", variants: [{ text: "Laudo educativo: sem consolidações." }] },
    { testId: "ecg12", variants: [{ text: "Taquicardia sinusal, sem alterações isquêmicas; ondas T normais." }] }
  ],
  highlightedActions: ["glicemia_capilar", "acesso_venoso", "monitorizar", "diurese_horaria"],
  rules: [
    { id: "r-volume1", description: "Primeiro litro: perfusão melhora e glicemia cai por diluição/diurese", priority: 20, when: VOL1, repeat: "once", effects: [trend("hr", 104, 1500, "vol", 20), trend("sbp", 112, 1500, "vol", 20), trend("dbp", 66, 1500, "vol", 20), trend("perfusion", 0.72, 1500, "vol", 20), trend("glucose", 760, 2400, "vol", 15), trend("osm", 340, 2400, "vol", 15), trend("urine", 60, 1800, "vol", 20)] },
    { id: "r-volume2", description: "Hidratação continuada: consciência e função renal melhoram", priority: 21, when: VOL2, repeat: "once", effects: [trend("hr", 94, 2400, "vol2", 21), trend("sbp", 122, 2400, "vol2", 21), trend("perfusion", 0.9, 2400, "vol2", 21), trend("gcs", 14, 3600, "vol2", 21), trend("creat", 1.3, 14400, "vol2", 21), trend("urea", 60, 14400, "vol2", 21), flag("consciousness", "alerta"), flag("speech", "frases"), { type: "changeCommunication", state: "normal" }] },
    { id: "r-sem-volume", description: "Sem hidratação em 30 min: choque hipovolêmico e coma hiperosmolar", priority: 5, when: { all: [{ time: "gte", seconds: 1800 }, { not: VOL1 }] }, repeat: "once", effects: [trend("sbp", 78, 1800, "doenca", 10), trend("hr", 126, 1800, "doenca", 10), trend("gcs", 8, 2400, "doenca", 10), trend("osm", 362, 3600, "doenca", 10), trend("creat", 2.8, 3600, "doenca", 10), flag("consciousness", "dor"), { type: "changeCommunication", state: "incapaz" }, staff("enfermagem", "Ela só responde à dor agora, e a pressão está caindo."), outcome("piora")] },
    { id: "r-convulsao", description: "Hiperosmolaridade grave sem tratamento: crise convulsiva", priority: 6, when: { all: [{ time: "gte", seconds: 4800 }, { not: VOL_INICIO }] }, repeat: "once", effects: [flag("seizure", true), staff("enfermagem", "Ela está convulsionando!"), outcome("complicacao")] },
    { id: "r-ins-antes-volume", description: "Insulina antes da reidratação: água sai do intravascular e a PA cai", priority: 45, when: { all: [INSULINA, { not: VOL1 }] }, repeat: "once", effects: [trend("sbp", 76, 600, "shift", 45, 1800), trend("hr", 128, 600, "shift", 45, 1800), staff("enfermagem", "Depois que começou a insulina, a pressão despencou."), outcome("complicacao")] },
    { id: "r-insulina", description: "Insulina em dose baixa: glicemia e osmolalidade caem gradualmente; potássio cai", priority: 30, when: INSULINA, repeat: "while", effects: [trend("glucose", 120, 9000, "insulina", 30), trend("osm", 296, 12000, "insulina", 30), trend("k", 2.9, 3600, "insulina", 30)], onEnd: [trend("glucose", 600, 9000, "insulina", 30), trend("k", 4.2, 7200, "insulina", 30), obs("Insulina suspensa: a glicemia volta a subir.")] },
    { id: "r-kcl", description: "Reposição de potássio mantém K⁺ seguro", priority: 40, when: { drugGiven: "kcl", minTotal: { value: 20, unit: "mEq" } }, repeat: "once", effects: [trend("k", 4.0, 3600, "kcl", 40)] },
    { id: "r-hipocalemia", description: "Insulina sem reposição: hipocalemia", priority: 60, when: { path: "vars.k", op: "lt", value: 3.1 }, repeat: "once", effects: [flag("tremor", true), staff("enfermagem", "O monitor mostra extrassístoles frequentes."), outcome("complicacao")] },
    { id: "r-glicemia-300", description: "Glicemia < 300 com insulina e sem glicose: risco de hipoglicemia e queda brusca da osmolalidade", priority: 35, when: { all: [INSULINA, { path: "vars.glucose", op: "lt", value: 300 }, { not: { drugGiven: "sg5" } }] }, repeat: "once", effects: [trend("glucose", 55, 5000, "hipo", 35), trend("osm", 280, 5000, "hipo", 35)] },
    { id: "r-sg5", description: "Glicose 5% associada ao atingir 250–300 mg/dL", priority: 50, when: { drugGiven: "sg5" }, repeat: "once", effects: [trend("glucose", 230, 3600, "sg5", 50), trend("osm", 300, 3600, "sg5", 50)] },
    { id: "r-hipoglicemia", description: "Hipoglicemia iatrogênica", priority: 70, when: { path: "vars.glucose", op: "lt", value: 70 }, repeat: "once", effects: [flag("sweating", true), flag("consciousness", "voz"), staff("enfermagem", "Ela suou frio e piorou da confusão."), outcome("complicacao")] },
    { id: "r-ins-sem-k", description: "Insulina iniciada sem potássio conhecido (falha de segurança)", priority: 1, when: { all: [INSULINA, { not: K_CONHECIDO }] }, repeat: "once", effects: [] },
    { id: "r-atb", description: "Antibiótico para provável pielonefrite (fator precipitante)", priority: 15, when: ATB, repeat: "once", effects: [trend("temp", 37.2, 7200, "atb", 15), trend("wbc", 11000, 14400, "atb", 15)] },
    { id: "r-atb-sem-cultura", description: "Antibiótico antes das culturas", priority: 2, when: { all: [ATB, { not: { testCollected: "urocultura" } }] }, repeat: "once", effects: [] },
    { id: "r-melhora", description: "Melhora clínica e metabólica", priority: 80, when: { all: [{ path: "vars.gcs", op: "gte", value: 13 }, { path: "vars.osm", op: "lte", value: 325 }, { path: "vars.glucose", op: "lte", value: 400 }] }, repeat: "once", effects: [outcome("melhora")] }
  ],
  diagnosis: { primary: "ehh", accepted: ["ehh"], differentials: ["cad", "avc_isquemico", "sepse", "pielonefrite", "hiponatremia", "encefalopatia_metabolica"] },
  acceptedDestinations: ["uti"],
  outcomeNotes: "Estado hiperglicêmico hiperosmolar (glicemia 940, osmolalidade 352, pH 7,34, cetonas baixas) precipitado por pielonefrite e suspensão dos antidiabéticos orais em idosa com diurético. Reidratação com SF 0,9%, insulina IV 0,05 UI/kg/h após o 1º litro e K⁺ conhecido, reposição de K⁺, SG 5% ao atingir 250–300 mg/dL, queda gradual da osmolalidade, culturas e antibiótico, UTI.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Evolução, medicações e fator precipitante", evidence: { kind: "historyAsked", items: ["h-evolucao", "h-medicacoes", "h-urina"], minCount: 2 }, points: 6, severity: "importante", rationale: "Instalação em dias, suspensão de medicação e infecção são típicos." },
    { id: "s-glicemia", domain: "priorizacao", description: "Glicemia capilar imediata", evidence: { kind: "actionDone", anyOf: ["glicemia_capilar"], withinSeconds: 120 }, points: 6, severity: "critica", rationale: "Todo rebaixamento de consciência exige glicemia." },
    { id: "s-exame", domain: "historia", description: "Exame neurológico e de hidratação", evidence: { kind: "examDone", regions: ["neurologico", "geral"], minCount: 2 }, points: 4, severity: "importante", rationale: "Afastar déficit focal; estimar desidratação." },
    { id: "s-labs", domain: "exames", description: "Gasometria/eletrólitos, osmolalidade e cetonas", evidence: { kind: "testOrdered", anyOf: ["gaso_venosa", "gaso_arterial", "eletrolitos"], withinSeconds: 600 }, points: 8, severity: "critica", rationale: "Diferenciar de cetoacidose; K⁺ antes da insulina.", sourceIds: ["BR-SBD-SHH-2025"] },
    { id: "s-osm", domain: "exames", description: "Osmolalidade e função renal", evidence: { kind: "testOrdered", anyOf: ["osmolalidade", "funcao_renal"], withinSeconds: 900 }, points: 4, severity: "importante", rationale: "Critério diagnóstico e meta de queda." },
    { id: "s-culturas", domain: "exames", description: "Urina tipo 1 e culturas", evidence: { kind: "testOrdered", anyOf: ["urina_tipo1", "urocultura", "hemocultura"], withinSeconds: 1800 }, points: 5, severity: "importante", rationale: "Fator precipitante." },
    { id: "s-sf", domain: "tratamento", description: "SF 0,9% ~15–20 mL/kg na primeira hora", evidence: { kind: "drugGiven", anyOf: ["sf09", "ringer_lactato"], withinSeconds: 600 }, points: 14, severity: "critica", rationale: "O déficit hídrico é o problema central.", sourceIds: ["BR-SBD-SHH-2025"] },
    { id: "s-insulina", domain: "tratamento", description: "Insulina IV em infusão após reidratação inicial", evidence: { kind: "drugGiven", anyOf: ["insulina_regular"] }, points: 8, severity: "importante", rationale: "0,05 UI/kg/h; queda de glicemia 50–70 mg/dL/h.", sourceIds: ["BR-SBD-SHH-2025"] },
    { id: "s-ins-antes", domain: "tratamento", description: "Falha: insulina antes da reidratação", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-ins-antes-volume" } }, points: 10, penalty: true, severity: "critica", rationale: "Desvio de água para o intracelular agrava o choque." },
    { id: "s-ins-sem-k", domain: "tratamento", description: "Falha: insulina sem K⁺ conhecido", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-ins-sem-k" } }, points: 8, penalty: true, severity: "critica", rationale: "Risco de hipocalemia grave.", sourceIds: ["BR-SBD-SHH-2025"] },
    { id: "s-kcl", domain: "tratamento", description: "Reposição de potássio", evidence: { kind: "drugGiven", anyOf: ["kcl"] }, points: 6, severity: "importante", rationale: "K⁺ 3,3–5,2 mEq/L: repor junto com a insulina." },
    { id: "s-sg5", domain: "tratamento", description: "Glicose associada ao atingir 250–300 mg/dL", evidence: { kind: "drugGiven", anyOf: ["sg5"] }, points: 5, severity: "importante", rationale: "Evita hipoglicemia e queda rápida da osmolalidade." },
    { id: "s-atb", domain: "tratamento", description: "Antibiótico para o foco urinário", evidence: { kind: "drugGiven", anyOf: ["ceftriaxona", "piperacilina_tazobactam", "cefepima"], withinSeconds: 3600 }, points: 5, severity: "importante", rationale: "Tratar o precipitante." },
    { id: "s-reav", domain: "reavaliacao", description: "Glicemia/gasometria seriadas após a insulina", evidence: { kind: "reassessAfter", after: ["insulina_regular"], reassess: ["glicemia_capilar", "gaso_venosa", "eletrolitos", "osmolalidade"], withinSeconds: 5400 }, points: 8, severity: "importante", rationale: "Ajustar ritmo de queda e potássio." },
    { id: "s-dx", domain: "destino", description: "Estado hiperglicêmico hiperosmolar", evidence: { kind: "diagnosis", accepted: ["ehh"] }, points: 4, severity: "importante", rationale: "Glicemia ≥ 600, osmolalidade ≥ 320, pH ≥ 7,30." },
    { id: "s-destino", domain: "destino", description: "UTI", evidence: { kind: "disposition", accepted: ["uti"] }, points: 4, severity: "importante", rationale: "Rebaixamento, insulina IV e controles horários." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Idosa sonolenta: qual exame de beira-leito vem primeiro?" },
      { level: 2, text: "Glicemia 'HI' há dias, sem cetoacidose importante. Qual o maior déficit dela?" },
      { level: 3, text: "Água primeiro; a insulina tira glicose — e água — do intravascular." },
      { level: 4, text: "Sugestão explícita: SF 0,9% ~1 L na 1ª hora, gasometria/eletrólitos/osmolalidade, insulina 0,05 UI/kg/h após K⁺ ≥ 3,3, KCl, SG 5% em 250–300, culturas e ceftriaxona, UTI." }
    ],
    summary: "Idosa de 76 anos com DM2 e diurético tiazídico, pielonefrite e suspensão dos hipoglicemiantes, evoluindo em 4 dias com estado hiperglicêmico hiperosmolar.",
    pathophysiology: "Insulina residual suficiente para frear a cetogênese, mas não a hiperglicemia. A glicosúria causa diurese osmótica com grande perda de água (às vezes 8–10 L). A hiperosmolaridade desidrata os neurônios e rebaixa a consciência. A correção rápida da osmolalidade pode causar edema cerebral; insulina antes do volume agrava a hipovolemia.",
    keyPoints: [
      "EHH: glicemia ≥ 600, osmolalidade efetiva ≥ 320, pH ≥ 7,30, bicarbonato ≥ 15–18, cetonas baixas.",
      "Reidratar primeiro: SF 0,9% 15–20 mL/kg na 1ª hora; depois guiar pelo sódio corrigido.",
      "Insulina IV em dose baixa (0,05 UI/kg/h) após reidratação inicial e K⁺ ≥ 3,3.",
      "Glicose ao atingir 250–300 mg/dL; queda de osmolalidade 3–8 mOsm/kg/h.",
      "Procurar o precipitante (infecção, IAM, AVC, medicações) e fazer profilaxia de TEV."
    ],
    alternatives: ["Ringer lactato como cristaloide inicial.", "SF 0,45% se sódio corrigido elevado após a reidratação inicial (não disponível no catálogo).", "Enoxaparina profilática (regra de dose profilática não cadastrada)."],
    oralRubric: [
      { id: "o1", concept: "Critérios de EHH", synonyms: ["osmolalidade", "hiperosmolar", "600", "320"], weight: 2 },
      { id: "o2", concept: "Reidratação primeiro", synonyms: ["soro", "hidratação", "volume", "15 a 20"], weight: 3 },
      { id: "o3", concept: "Insulina em dose baixa após K⁺", synonyms: ["insulina", "potássio", "0,05"], weight: 2 },
      { id: "o4", concept: "Fator precipitante", synonyms: ["infecção", "pielonefrite", "precipitante"], weight: 1 }
    ],
    simplifications: ["Sódio corrigido e troca de solução não são modelados.", "Queda de osmolalidade é uma tendência determinística.", "Tromboprofilaxia não é pontuada (sem regra de dose profilática no catálogo)."]
  },
  references: ["BR-SBD-SHH-2025", "BR-SBD", "BR-SBD-CAD", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Glicemia, labs, SF 1 L na 1ª hora, culturas + ceftriaxona, insulina após K⁺ e 1º litro, KCl, SG 5% e UTI", commands: [act(5, "glicemia_capilar"), ask(15, "h-evolucao"), ask(25, "h-medicacoes"), { atSeconds: 35, type: "examine", payload: { region: "neurologico", maneuver: "especial" } }, { atSeconds: 45, type: "examine", payload: { region: "geral", maneuver: "inspecao" } }, act(55, "acesso_venoso"), act(155, "acesso_venoso"), test(260, "gaso_venosa"), test(270, "eletrolitos"), test(280, "osmolalidade"), test(290, "funcao_renal"), rx(320, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), test(700, "urina_tipo1"), test(720, "urocultura"), test(740, "hemocultura"), rx(1400, "ceftriaxona", "fa1g", 2000, "mg", "IV"), rx(4000, "insulina_regular", "fr100", 1, "UI", "IV", "infusao", { rate: { value: 0.05, unit: "UI/kg/h" } }), rx(4010, "kcl", "amp10", 20, "mEq", "IV", "infusao_volume", { durationMinutes: 60 }), rx(4100, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), act(7000, "glicemia_capilar"), test(7100, "gaso_venosa"), rx(8000, "kcl", "amp10", 20, "mEq", "IV", "infusao_volume", { durationMinutes: 60 }), act(12000, "glicemia_capilar"), rx(12100, "sg5", "bolsa500", 500, "mL", "IV", "infusao_volume", { durationMinutes: 120 }), dx(12500, "ehh"), dest(12600, "uti")], runUntilSeconds: 16000, expect: [{ condition: { not: { ruleFired: "r-ins-antes-volume" } }, description: "volume antes da insulina" }, { condition: { not: { ruleFired: "r-hipoglicemia" } }, description: "sem hipoglicemia" }, { condition: { path: "vars.k", op: "gte", value: 3.3 }, description: "K⁺ ≥ 3,3" }, { condition: { path: "vars.gcs", op: "gte", value: 13 }, description: "consciência melhora" }, { condition: { ruleFired: "r-melhora" }, description: "melhora" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem tratamento", commands: [], runUntilSeconds: 5000, expect: [{ condition: { ruleFired: "r-sem-volume" }, description: "piora" }, { condition: { ruleFired: "r-convulsao" }, description: "crise convulsiva" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Insulina imediata sem exames e sem volume", commands: [act(5, "acesso_venoso"), act(100, "acesso_venoso"), rx(200, "insulina_regular", "fr100", 1, "UI", "IV", "infusao", { rate: { value: 0.1, unit: "UI/kg/h" } })], runUntilSeconds: 9000, expect: [{ condition: { ruleFired: "r-ins-antes-volume" }, description: "choque por desvio de água" }, { condition: { ruleFired: "r-ins-sem-k" }, description: "falha de segurança" }, { condition: { ruleFired: "r-hipocalemia" }, description: "hipocalemia" }] },
    { id: "t-atraso", kind: "delay", description: "Volume só aos 45 min", commands: [act(5, "glicemia_capilar"), act(60, "acesso_venoso"), act(160, "acesso_venoso"), test(300, "gaso_venosa"), rx(2700, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), rx(5400, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 })], runUntilSeconds: 9000, expect: [{ condition: { ruleFired: "r-sem-volume" }, description: "piora pelo atraso" }, { condition: { ruleFired: "r-volume2" }, description: "recuperação com hidratação" }, { condition: { not: { ruleFired: "r-convulsao" } }, description: "convulsão evitada" }] },
    { id: "t-alternativa", kind: "alternative", description: "Ringer lactato como cristaloide inicial e insulina após K⁺", commands: [act(5, "glicemia_capilar"), act(30, "acesso_venoso"), act(130, "acesso_venoso"), test(240, "gaso_venosa"), rx(260, "ringer_lactato", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), rx(4000, "insulina_regular", "fr100", 1, "UI", "IV", "infusao", { rate: { value: 0.05, unit: "UI/kg/h" } }), rx(4010, "kcl", "amp10", 20, "mEq", "IV", "infusao_volume", { durationMinutes: 60 }), rx(4100, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), dest(6000, "uti")], runUntilSeconds: 8000, expect: [{ condition: { ruleFired: "r-volume2" }, description: "reidratação" }, { condition: { not: { ruleFired: "r-ins-antes-volume" } }, description: "volume antes da insulina" }, { condition: { not: { ruleFired: "r-hipocalemia" } }, description: "sem hipocalemia" }] }
  ]
};
