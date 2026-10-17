import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const AMPI = { drugGiven: "ampicilina" };
const SEGUNDO = { any: [{ drugGiven: "gentamicina" }, { drugGiven: "cefotaxima" }, { drugGiven: "ceftriaxona" }] };
const ATB = { all: [AMPI, SEGUNDO] };
const ATB_ALGUM = { any: [AMPI, SEGUNDO] };
const VOL = { any: [{ drugGiven: "sf09", minTotal: { value: 30, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 30, unit: "mL" as const } }] };
const GLICOSE = { drugGiven: "glicose10" };
const CULTURAS = { testCollected: "hemocultura" };

export const C084: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C084",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Bebê de 3 semanas com febre, mamando pouco e 'molinho'",
  teachingTitle: "Febre no recém-nascido/lactente jovem com mau estado geral — sepse até prova em contrário: glicemia, acesso, volume, culturas, punção lombar e antibiótico em até 1 hora",
  group: "Pediatria",
  specialties: ["Pediatria", "Neonatologia", "Emergência"],
  environment: "pediatria",
  resourceProfile: "hospital-regional",
  difficulty: 4,
  level: "internato",
  objectives: [
    "Reconhecer que lactente ≤ 28 dias com febre e mau estado geral tem alto risco de infecção bacteriana invasiva",
    "Corrigir hipoglicemia e hipoperfusão com doses por peso",
    "Colher hemocultura, urina por sondagem e líquor sem atrasar o antibiótico",
    "Iniciar ampicilina + gentamicina (ou cefotaxima) e considerar aciclovir conforme risco de herpes",
    "Internar em UTI neonatal/pediátrica"
  ],
  keywords: ["bebê", "febre", "recém-nascido", "mamando pouco", "molinho", "sonolento"],
  patient: {
    name: "Theo (recém-nascido)",
    ageYears: 0.066,
    ageMonths: 0.8,
    sex: "masculino",
    weightKg: 3.6,
    heightCm: 52,
    visual: { ageGroup: "lactente", sex: "masculino", skinTone: 2, hairStyle: "curto", hairColor: "castanho", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional (pediatria e UTI). Recém-nascido de 24 dias trazido pelos pais com febre de 38,6 °C desde a madrugada, mamando muito pouco e 'molinho'. Nasceu a termo, parto normal.",
  communication: "incapaz",
  informants: [{ id: "mae", name: "Mãe", role: "Mãe" }],
  history: [
    hi("h-febre", "inicio", "Desde quando a febre? Como mediu?", [{ source: "mae", text: "Desde 3 da manhã, 38,6 no termômetro na axila; dei banho morno. Ele não quer mamar e dorme muito." }], ["febre", "quando", "termômetro"]),
    hi("h-alimentacao", "alimentacao_eliminacoes", "Quantas mamadas e fraldas hoje?", [{ source: "mae", text: "Só duas mamadas curtas e uma fralda molhada desde a madrugada." }], ["mamadas", "fraldas", "xixi"]),
    hi("h-perinatal", "antecedentes", "Como foi a gravidez e o parto? Teve febre ou ferida genital no parto?", [{ source: "mae", text: "Pré-natal normal, exames normais, parto normal a termo. Não tive febre nem feridas." }], ["parto", "gravidez", "febre", "ferida", "herpes"]),
    hi("h-contatos", "exposicao", "Alguém em casa doente?", [{ source: "mae", text: "O irmão de 4 anos está resfriado." }], ["casa", "doente", "contato"]),
    hi("h-vomito", "fatores_associados", "Vomitou, teve diarreia, convulsão, manchas na pele?", [{ source: "mae", text: "Vomitou uma vez. Não teve convulsão nem manchas." }], ["vomitou", "diarreia", "convulsão", "manchas"])
  ],
  initial: {
    vars: { hr: 192, sbp: 62, dbp: 34, rr: 58, spo2: 95, temp: 38.7, gcs: 12, pain: 3, glucose: 44, perfusion: 0.35, effort: 0.4, lactate: 4.0, wbc: 4200, plt: 120000, pcr: 6.5 },
    flags: { rhythm: "taquicardia_sinusal", posture: "supino", painVisual: "leve", speech: "nenhuma", consciousness: "voz", pallor: true },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Hipoativo, choro fraco, pele rendilhada, enchimento capilar 4 s; extremidades frias.", { label: "Aparência e perfusão", better: [{ when: { ruleFired: "r-volume" }, text: "Mais ativo, enchimento capilar 2–3 s." }] }),
    ex("e-fontanela", "cabeca", "palpacao", "Fontanela anterior normotensa.", { label: "Fontanela" }),
    ex("e-pele", "pele", "inspecao", "Sem vesículas, sem petéquias; coto umbilical seco.", { label: "Pele e coto" }),
    ex("e-torax", "torax_anterior", "ausculta", "Murmúrio presente, sem ruídos; taquipneico.", { sound: "murmurio_normal" }),
    ex("e-abdome", "abdome_epigastrio", "palpacao", "Abdome flácido, sem visceromegalias.", {})
  ],
  testResults: [
    { testId: "hemocultura", variants: [{ text: "Coletada (resultado em 24–48 h; depois: Escherichia coli)." }] },
    { testId: "urina_tipo1", variants: [{ text: "Amostra por sondagem: leucocitúria intensa, nitrito positivo, bacteriúria." }] },
    { testId: "urocultura", variants: [{ text: "Coletada por sondagem." }] },
    { testId: "liquor", variants: [{ text: "Líquor claro: 8 células/mm³, glicose e proteína normais, Gram sem bactérias (sem meningite)." }] },
    { testId: "hemograma", variants: [{ text: "Leucócitos 4.200/mm³ (leucopenia), plaquetas 120.000/mm³." }] }
  ],
  highlightedActions: ["glicemia_capilar", "monitorizar", "acesso_io", "acesso_venoso", "aquecimento"],
  rules: [
    { id: "r-curso", description: "Sepse com choque em evolução", priority: 10, when: { always: true }, repeat: "once", effects: [trend("sbp", 48, 2400, "sepse", 10), trend("hr", 205, 2400, "sepse", 10), trend("perfusion", 0.2, 2400, "sepse", 10), trend("lactate", 6, 3000, "sepse", 10), trend("glucose", 32, 1800, "sepse", 10), trend("gcs", 9, 3000, "sepse", 10)] },
    { id: "r-glicose", description: "Glicose 10% corrige hipoglicemia", priority: 50, when: GLICOSE, repeat: "once", effects: [trend("glucose", 90, 300, "glic", 50)] },
    { id: "r-hipoglicemia", description: "Hipoglicemia grave sem correção", priority: 30, when: { path: "vars.glucose", op: "lt", value: 35 }, repeat: "once", effects: [flag("seizure", true), staff("enfermagem", "Ele está tremendo e com movimentos estranhos — glicemia 32!"), outcome("piora")] },
    { id: "r-fim-crise", description: "Crise cede", priority: 31, when: { elapsedSince: "rule:r-hipoglicemia", op: "gte", seconds: 120 }, repeat: "once", effects: [flag("seizure", false)] },
    { id: "r-volume", description: "Expansão 10–20 mL/kg com reavaliação", priority: 30, when: VOL, repeat: "once", effects: [trend("sbp", 70, 900, "vol", 30), trend("hr", 170, 900, "vol", 30), trend("perfusion", 0.6, 900, "vol", 30)] },
    { id: "r-atb", description: "Antibiótico empírico adequado", priority: 40, when: ATB, repeat: "once", effects: [trend("temp", 37.8, 5400, "atb", 40), trend("lactate", 2.4, 5400, "atb", 40), trend("sbp", 72, 3600, "atb", 40), trend("gcs", 13, 5400, "atb", 40), outcome("estabilizacao_parcial")] },
    { id: "r-atb-sem-cultura", description: "Antibiótico antes da hemocultura", priority: 1, when: { all: [ATB_ALGUM, { not: CULTURAS }] }, repeat: "once", effects: [] },
    { id: "r-choque", description: "Sem antibiótico em 1 h: choque séptico refratário", priority: 35, when: { all: [{ time: "gte", seconds: 3600 }, { not: ATB_ALGUM }] }, repeat: "once", effects: [trend("sbp", 42, 900, "choque", 35), trend("spo2", 88, 900, "choque", 35), trend("rr", 20, 900, "choque", 35), staff("enfermagem", "Ele está fazendo pausas na respiração e a pressão não aparece!"), outcome("piora")] },
    { id: "r-pcr", description: "Choque não tratado", priority: 100, when: { all: [{ time: "gte", seconds: 5400 }, { not: ATB_ALGUM }, { not: VOL }] }, repeat: "once", effects: [flag("pulse", false), { type: "setValue", var: "hr", value: 0 }, staff("enfermagem", "Parou! Sem pulso!"), outcome("parada", true)] }
  ],
  diagnosis: { primary: "sepse_lactente", accepted: ["sepse_lactente", "sepse_neonatal", "choque_septico"], differentials: ["sepse_neonatal", "meningite_bacteriana", "pielonefrite", "bronquiolite", "desidratacao_grave", "hipoglicemia"] },
  acceptedDestinations: ["uti"],
  outcomeNotes: "Recém-nascido de 24 dias, febril e com mau estado geral, em choque séptico com hipoglicemia, leucopenia e infecção urinária (urossepse por E. coli). Glicemia e glicose 10% 2 mL/kg, acesso IV/IO, SF 10–20 mL/kg com reavaliação, aquecimento/controle térmico, hemocultura, urina por sondagem, líquor (sem atrasar antibiótico), ampicilina + gentamicina (ou cefotaxima), aciclovir se fatores de risco para herpes, UTI.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Febre, alimentação, diurese e história perinatal (risco de herpes)", evidence: { kind: "historyAsked", items: ["h-febre", "h-alimentacao", "h-perinatal"], minCount: 2 }, points: 6, severity: "importante", rationale: "Gravidade e risco de HSV." },
    { id: "s-exame", domain: "historia", description: "Aparência, perfusão, fontanela e pele", evidence: { kind: "examDone", regions: ["geral", "cabeca", "pele"], minCount: 2 }, points: 6, severity: "importante", rationale: "Mau estado geral define conduta." },
    { id: "s-glicemia", domain: "priorizacao", description: "Glicemia capilar em até 3 min", evidence: { kind: "actionDone", anyOf: ["glicemia_capilar"], withinSeconds: 180 }, points: 8, severity: "critica", rationale: "Hipoglicemia frequente no RN séptico." },
    { id: "s-acesso", domain: "priorizacao", description: "Acesso IV/IO em até 5 min", evidence: { kind: "actionDone", anyOf: ["acesso_venoso", "acesso_io"], withinSeconds: 300 }, points: 6, severity: "critica", rationale: "Choque." },
    { id: "s-glicose", domain: "tratamento", description: "Glicose 10% (2 mL/kg)", evidence: { kind: "drugGiven", anyOf: ["glicose10"], withinSeconds: 900 }, points: 8, severity: "critica", rationale: "Glicemia 44 mg/dL.", sourceIds: ["BR-SAMU-SAV"] },
    { id: "s-volume", domain: "tratamento", description: "Expansão 10–20 mL/kg com reavaliação", evidence: { kind: "drugGiven", anyOf: ["sf09", "ringer_lactato"], withinSeconds: 1200 }, points: 8, severity: "critica", rationale: "Hipoperfusão.", sourceIds: ["BR-SAMU-SAV"] },
    { id: "s-culturas", domain: "exames", description: "Hemocultura e urina por sondagem", evidence: { kind: "testOrdered", anyOf: ["hemocultura", "urina_tipo1", "urocultura"], withinSeconds: 1800 }, points: 8, severity: "importante", rationale: "Avaliação completa de sepse.", sourceIds: ["INT-AAP-FEBRIL-2021"] },
    { id: "s-liquor", domain: "exames", description: "Punção lombar (quando estável, sem atrasar antibiótico)", evidence: { kind: "testOrdered", anyOf: ["liquor"] }, points: 6, severity: "importante", rationale: "≤ 28 dias: excluir meningite.", sourceIds: ["INT-AAP-FEBRIL-2021"] },
    { id: "s-atb", domain: "tratamento", description: "Ampicilina + gentamicina/cefotaxima em até 1 h", evidence: { kind: "drugGiven", anyOf: ["ampicilina"], withinSeconds: 3600 }, points: 16, severity: "critica", rationale: "Cobertura neonatal (gram-negativos, estreptococo do grupo B, Listeria).", sourceIds: ["INT-AAP-FEBRIL-2021"] },
    { id: "s-atb2", domain: "tratamento", description: "Segundo antimicrobiano associado", evidence: { kind: "drugGiven", anyOf: ["gentamicina", "cefotaxima", "ceftriaxona"], withinSeconds: 3600 }, points: 6, severity: "importante", rationale: "Esquema combinado.", sourceIds: ["INT-AAP-FEBRIL-2021"] },
    { id: "s-sem-cultura", domain: "tratamento", description: "Falha: antibiótico antes da hemocultura", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-atb-sem-cultura" } }, points: 3, penalty: true, severity: "menor", rationale: "Colher rapidamente, sem atrasar." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou perfusão e glicemia após intervenções", evidence: { kind: "reassessAfter", after: ["sf09", "ringer_lactato", "glicose10"], reassess: ["geral", "glicemia_capilar", "monitorizar", "medir_pa"], withinSeconds: 1200 }, points: 8, severity: "importante", rationale: "Repetir alíquotas conforme resposta." },
    { id: "s-dx", domain: "destino", description: "Sepse no lactente jovem", evidence: { kind: "diagnosis", accepted: ["sepse_lactente", "sepse_neonatal", "choque_septico"] }, points: 4, severity: "importante", rationale: "Febre + mau estado geral." },
    { id: "s-destino", domain: "destino", description: "UTI", evidence: { kind: "disposition", accepted: ["uti"] }, points: 6, severity: "importante", rationale: "Choque séptico neonatal." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Febre em bebê de 24 dias: o que muda em relação a uma criança maior?" },
      { level: 2, text: "Ele está molinho e com pele rendilhada: bem ou mal apresentado?" },
      { level: 3, text: "Antes do antibiótico, um exame de 1 minuto pode salvar o cérebro." },
      { level: 4, text: "Sugestão explícita: glicemia, glicose 10%, acesso, SF 10–20 mL/kg, hemocultura, urina por sondagem, ampicilina + gentamicina, líquor, UTI." }
    ],
    summary: "Recém-nascido de 24 dias com febre, mau estado geral, choque, hipoglicemia e leucopenia — urossepse por E. coli.",
    pathophysiology: "A imunidade neonatal é imatura (opsonização e resposta neutrofílica limitadas); a infecção dissemina-se rápido, e a apresentação pode ser inespecífica. Reservas de glicogênio são pequenas e a hipoglicemia é comum. Gram-negativos (E. coli), estreptococo do grupo B e Listeria predominam; o herpes simples deve ser lembrado.",
    keyPoints: [
      "Febre em ≤ 28 dias é sempre investigada; mau estado geral = sepse até prova em contrário.",
      "Glicemia, acesso (IO se necessário), expansão 10–20 mL/kg com reavaliação.",
      "Hemocultura, urina por sondagem e líquor; não atrasar o antibiótico.",
      "Ampicilina + gentamicina (ou cefotaxima); aciclovir se risco de herpes.",
      "UTI neonatal/pediátrica."
    ],
    alternatives: ["Ampicilina + cefotaxima se suspeita de meningite.", "Acesso intraósseo se acesso venoso difícil."],
    oralRubric: [
      { id: "o1", concept: "Alto risco no ≤ 28 dias", synonyms: ["recém-nascido", "28 dias", "mau estado"], weight: 2 },
      { id: "o2", concept: "Glicemia e volume", synonyms: ["glicemia", "glicose", "volume", "expansão"], weight: 2 },
      { id: "o3", concept: "Culturas e líquor", synonyms: ["hemocultura", "urina", "punção lombar", "líquor"], weight: 2 },
      { id: "o4", concept: "Antibiótico neonatal", synonyms: ["ampicilina", "gentamicina", "cefotaxima"], weight: 3 }
    ],
    simplifications: ["Antibióticos neonatais sem regra de dose validada no catálogo (o app alerta).", "Urina por sondagem representada pelo exame de urina."]
  },
  references: ["INT-AAP-FEBRIL-2021", "BR-SAMU-SAV", "INT-SSC-2021", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 0, allowSexSwap: true, allowWeightPercent: 10, allowVisualVariation: true, forbidden: ["idade > 28 dias muda o protocolo"] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Glicemia, monitor, acesso IO, glicose, SF 10 mL/kg ×2, culturas, ampicilina + gentamicina, líquor, UTI", commands: [act(5, "glicemia_capilar"), act(15, "monitorizar"), ask(25, "h-febre"), ask(35, "h-perinatal"), { atSeconds: 45, type: "examine", payload: { region: "geral", maneuver: "inspecao" } }, { atSeconds: 55, type: "examine", payload: { region: "cabeca", maneuver: "palpacao" } }, act(65, "acesso_io"), rx(130, "glicose10", "frasco250", 0.2, "g/kg", "IO"), test(150, "hemocultura"), rx(170, "sf09", "bolsa500", 10, "mL/kg", "IO", "infusao_volume", { durationMinutes: 10 }), test(200, "urina_tipo1"), act(500, "aquecimento"), rx(800, "sf09", "bolsa500", 10, "mL/kg", "IO", "infusao_volume", { durationMinutes: 10 }), rx(1000, "ampicilina", "fa500", 180, "mg", "IV"), rx(1050, "gentamicina", "amp20", 14, "mg", "IV"), act(1300, "glicemia_capilar"), { atSeconds: 1310, type: "examine", payload: { region: "geral", maneuver: "inspecao" } }, test(2000, "liquor"), dx(3000, "sepse_lactente"), dest(3100, "uti")], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-atb" }, description: "antibiótico adequado" }, { condition: { not: { ruleFired: "r-hipoglicemia" } }, description: "sem hipoglicemia grave" }, { condition: { not: { ruleFired: "r-choque" } }, description: "sem choque refratário" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-hipoglicemia" }, description: "hipoglicemia" }, { condition: { ruleFired: "r-choque" }, description: "choque" }, { condition: { ruleFired: "r-pcr" }, description: "PCR" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Antitérmico e ceftriaxona sem culturas, sem glicemia", commands: [act(60, "acesso_venoso"), rx(200, "dipirona", "amp1g", 15, "mg/kg", "IV"), rx(300, "ceftriaxona", "fa1g", 50, "mg/kg", "IV")], runUntilSeconds: 4000, expect: [{ condition: { ruleFired: "r-atb-sem-cultura" }, description: "sem culturas" }, { condition: { ruleFired: "r-hipoglicemia" }, description: "hipoglicemia não vista" }] },
    { id: "t-atraso", kind: "delay", description: "Espera exames para dar antibiótico (após 1 h)", commands: [act(5, "glicemia_capilar"), act(60, "acesso_venoso"), rx(170, "glicose10", "frasco250", 0.2, "g/kg", "IV"), test(200, "hemocultura"), test(210, "urina_tipo1"), rx(400, "sf09", "bolsa500", 10, "mL/kg", "IV", "infusao_volume", { durationMinutes: 10 }), rx(3800, "ampicilina", "fa500", 180, "mg", "IV"), rx(3850, "cefotaxima", "fa500", 180, "mg", "IV")], runUntilSeconds: 7000, expect: [{ condition: { ruleFired: "r-choque" }, description: "choque pelo atraso" }, { condition: { ruleFired: "r-atb" }, description: "antibiótico tardio" }, { condition: { not: { ruleFired: "r-pcr" } }, description: "PCR evitada" }] },
    { id: "t-alternativa", kind: "alternative", description: "Acesso venoso, Ringer, ampicilina + cefotaxima", commands: [act(5, "glicemia_capilar"), act(20, "acesso_venoso"), rx(130, "glicose10", "frasco250", 0.2, "g/kg", "IV"), test(140, "hemocultura"), rx(160, "ringer_lactato", "bolsa500", 20, "mL/kg", "IV", "infusao_volume", { durationMinutes: 15 }), rx(600, "ampicilina", "fa500", 180, "mg", "IV"), rx(650, "cefotaxima", "fa500", 180, "mg", "IV"), dest(2500, "uti")], runUntilSeconds: 5000, expect: [{ condition: { ruleFired: "r-atb" }, description: "antibiótico adequado" }] }
  ]
};
