import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const VOL1 = { any: [{ drugGiven: "sf09", minTotal: { value: 1000, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 1000, unit: "mL" as const } }] };
const VOL_INICIO = { any: [{ drugGiven: "sf09" }, { drugGiven: "ringer_lactato" }] };
const NORA = { treatmentActive: "noradrenalina" };
const DIALISE = { actionCompleted: "acionar_dialise" };
const GLICOSE = { any: [{ drugGiven: "glicose50" }, { drugGiven: "sg5" }] };

export const C063: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C063",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Diabética com diarreia que agora respira rápido e fundo e está confusa",
  teachingTitle: "Acidose láctica associada à metformina com lesão renal — ânion gap, suporte hemodinâmico, suspender metformina e hemodiálise",
  group: "Nefrologia",
  specialties: ["Clínica médica", "Nefrologia", "Toxicologia", "Terapia intensiva"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 4,
  level: "residencia",
  objectives: [
    "Interpretar acidose metabólica grave com ânion gap elevado e lactato muito alto",
    "Diferenciar de cetoacidose e de outras causas (sepse, isquemia, tóxicos)",
    "Reconhecer a acidose associada à metformina na lesão renal aguda",
    "Restaurar perfusão, suspender metformina, vigiar glicemia",
    "Indicar hemodiálise conforme critérios (pH ≤ 7,0, lactato > 20, choque, rebaixamento)"
  ],
  keywords: ["respiração rápida", "diarreia", "diabetes", "confusa", "fraqueza", "acidose"],
  patient: {
    name: "Neusa Aparecida Campos",
    ageYears: 69,
    sex: "feminino",
    weightKg: 70,
    heightCm: 158,
    visual: { ageGroup: "idoso", sex: "feminino", skinTone: 2, hairStyle: "curto", hairColor: "grisalho", build: "obeso", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional (UTI e hemodiálise). Mulher de 69 anos, diabética, com diarreia e vômitos há 3 dias; hoje respirando 'rápido e fundo', confusa e muito fraca.",
  communication: "limitada",
  informants: [{ id: "neto", name: "Neto", role: "Acompanhante" }],
  history: [
    hi("h-evolucao", "inicio", "Como evoluiu?", [{ source: "neto", text: "Diarreia e vômito há três dias, quase não bebeu. Hoje começou a respirar desse jeito e ficou confusa." }], ["evoluiu", "começou", "quando"]),
    hi("h-medicacoes", "medicacoes", "Que remédios ela toma? Continuou tomando?", [{ source: "neto", text: "Metformina 850, três vezes ao dia, e losartana. Não parou nada, a gente achou que precisava continuar." }], ["remédio", "metformina", "continuou"]),
    hi("h-rim", "antecedentes", "Tem problema nos rins?", [{ source: "neto", text: "O médico disse que o rim estava 'meio fraco'; creatinina 1,4 no ano passado." }], ["rim", "creatinina"]),
    hi("h-toxicos", "exposicao", "Pode ter tomado algo a mais, bebida, produto de limpeza?", [{ source: "neto", text: "Não, ela não bebe e os remédios estão contados na caixinha." }], ["tomou", "bebida", "veneno", "produto"]),
    hi("h-febre", "fatores_associados", "Teve febre, dor na barriga forte, dor no peito?", [{ source: "neto", text: "Febre não. Dor de barriga leve com a diarreia." }], ["febre", "dor", "barriga", "peito"])
  ],
  initial: {
    vars: { hr: 118, sbp: 88, dbp: 48, rr: 34, spo2: 97, temp: 35.6, gcs: 13, pain: 3, glucose: 138, perfusion: 0.4, effort: 0.7, etco2: 18, ph: 6.98, pco2: 17, po2: 104, hco3: 6, be: -25, lactate: 16.5, na: 137, k: 5.6, cl: 101, ketones: 0.6, osm: 312, creat: 4.1, urea: 132, hb: 13.9, wbc: 12400, urine: 10 },
    flags: { rhythm: "taquicardia_sinusal", posture: "supino", painVisual: "leve", speech: "palavras", consciousness: "voz" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-resp", "torax_anterior", "inspecao", "Respiração profunda e rápida (Kussmaul); murmúrio presente sem ruídos adventícios.", { label: "Respiração" }),
    ex("e-geral", "geral", "inspecao", "Mucosas secas, extremidades frias, enchimento capilar 4 s; sem hálito cetônico.", { label: "Perfusão" }),
    ex("e-abdome", "abdome_epigastrio", "palpacao", "Abdome flácido, dor difusa leve, sem peritonite; ruídos presentes.", { label: "Abdome" }),
    ex("e-neuro", "neurologico", "especial", "Glasgow 13 (confusa), sem déficit focal.", {})
  ],
  testResults: [
    { testId: "ecg12", variants: [{ text: "Taquicardia sinusal; ondas T levemente apiculadas." }] },
    { testId: "lipase", variants: [{ text: "Lipase normal." }] },
    { testId: "tc_abdome", variants: [{ text: "Laudo educativo: sem pneumatose ou sinais de isquemia mesentérica; alças com conteúdo líquido." }] }
  ],
  highlightedActions: ["glicemia_capilar", "monitorizar", "acesso_venoso", "acionar_dialise"],
  rules: [
    { id: "r-curso", description: "Acúmulo de metformina com LRA: acidose láctica progressiva", priority: 10, when: { always: true }, repeat: "once", effects: [trend("ph", 6.88, 3600, "acid", 10), trend("lactate", 21, 3600, "acid", 10), trend("hco3", 4, 3600, "acid", 10), trend("sbp", 78, 3600, "acid", 10), trend("gcs", 11, 3600, "acid", 10), trend("glucose", 50, 1800, "acid", 10)] },
    { id: "r-volume", description: "Cristaloide: perfusão melhora (acidose persiste)", priority: 30, when: VOL1, repeat: "once", effects: [trend("sbp", 98, 1200, "vol", 30), trend("hr", 108, 1200, "vol", 30), trend("perfusion", 0.6, 1200, "vol", 30), trend("urine", 20, 2400, "vol", 30)] },
    { id: "r-nora", description: "Noradrenalina mantém PAM", priority: 40, when: NORA, repeat: "while", effects: [trend("sbp", 106, 300, "nora", 40)], onEnd: [{ type: "clearTrend", var: "sbp", slot: "nora" }] },
    { id: "r-glicose", description: "Glicose evita hipoglicemia", priority: 45, when: GLICOSE, repeat: "once", effects: [trend("glucose", 130, 300, "glic", 45)] },
    { id: "r-hipoglicemia", description: "Hipoglicemia (hepatopatia funcional, jejum)", priority: 35, when: { path: "vars.glucose", op: "lt", value: 65 }, repeat: "once", effects: [flag("sweating", true), trend("gcs", 9, 300, "hipo", 35), staff("enfermagem", "Glicemia 62 e ela piorou da confusão."), outcome("complicacao")] },
    { id: "r-dialise", description: "Nefrologia acionada", priority: 20, when: DIALISE, repeat: "once", effects: [staff("supervisor", "Nefrologista: pH ≤ 7,0 e lactato muito alto com LRA — hemodiálise intermitente de urgência; máquina em 30 minutos. Manter PAM ≥ 65 para tolerar a sessão.")] },
    { id: "r-dialise-efeito", description: "Hemodiálise remove metformina e lactato", priority: 70, when: { all: [{ elapsedSince: "action:acionar_dialise", op: "gte", seconds: 1800 }, { any: [VOL1, NORA] }] }, repeat: "once", effects: [trend("ph", 7.30, 3600, "hd", 70), trend("hco3", 18, 3600, "hd", 70), trend("lactate", 4, 3600, "hd", 70), trend("gcs", 14, 3600, "hd", 70), trend("sbp", 110, 3600, "hd", 70), trend("rr", 22, 3600, "hd", 70), trend("k", 4.4, 3600, "hd", 70), outcome("melhora")] },
    { id: "r-dialise-instavel", description: "Diálise sem suporte hemodinâmico", priority: 65, when: { all: [{ elapsedSince: "action:acionar_dialise", op: "gte", seconds: 1800 }, { not: VOL1 }, { not: NORA }] }, repeat: "once", effects: [trend("sbp", 68, 300, "hdi", 65, 1200), obs("Hipotensão ao iniciar a diálise sem reposição/vasopressor: sessão interrompida."), outcome("complicacao")] },
    { id: "r-choque", description: "Sem volume em 40 min: choque", priority: 30, when: { all: [{ time: "gte", seconds: 2400 }, { not: VOL_INICIO }] }, repeat: "once", effects: [trend("sbp", 64, 600, "choque", 30), trend("gcs", 9, 600, "choque", 30), flag("consciousness", "dor"), staff("enfermagem", "Pressão 64 por 36, ela não responde direito."), outcome("piora")] },
    { id: "r-pcr", description: "Acidose extrema sem diálise: PCR", priority: 100, when: { all: [{ time: "gte", seconds: 4500 }, { not: DIALISE }] }, repeat: "once", effects: [flag("pulse", false), { type: "setValue", var: "sbp", value: 0 }, { type: "setValue", var: "dbp", value: 0 }, flag("consciousness", "irresponsivo"), staff("enfermagem", "Parou! AESP!"), outcome("parada", true)] }
  ],
  diagnosis: { primary: "acidose_metabolica_grave", accepted: ["acidose_metabolica_grave", "lra"], differentials: ["cad", "choque_septico", "lra", "gastroenterite", "intox_medicamentosa_intencional", "pancreatite"] },
  acceptedDestinations: ["uti"],
  outcomeNotes: "Acidose láctica grave associada à metformina (pH 6,98; lactato 16,5; ânion gap ~30) precipitada por gastroenterite com LRA (creatinina 4,1 sobre DRC) e metformina mantida. Cristaloide e noradrenalina se necessário, suspender metformina e losartana, glicemia seriada com glicose, excluir CAD/sepse/isquemia, hemodiálise intermitente de urgência (pH ≤ 7,0) e UTI.",
  scoring: [
    { id: "s-meds", domain: "historia", description: "Uso de metformina e evolução", evidence: { kind: "historyAsked", items: ["h-medicacoes", "h-evolucao"], minCount: 2 }, points: 8, severity: "critica", rationale: "Chave diagnóstica." },
    { id: "s-dif", domain: "historia", description: "Excluiu tóxicos, sepse e isquemia na anamnese", evidence: { kind: "historyAsked", items: ["h-toxicos", "h-febre", "h-rim"], minCount: 2 }, points: 5, severity: "importante", rationale: "Diferenciais da acidose com ânion gap." },
    { id: "s-glicemia", domain: "priorizacao", description: "Glicemia capilar", evidence: { kind: "actionDone", anyOf: ["glicemia_capilar"], withinSeconds: 180 }, points: 5, severity: "importante", rationale: "Excluir CAD/hipoglicemia." },
    { id: "s-gaso", domain: "exames", description: "Gasometria com lactato e eletrólitos", evidence: { kind: "testOrdered", anyOf: ["gaso_venosa", "gaso_arterial"], withinSeconds: 600 }, points: 8, severity: "critica", rationale: "pH, lactato, ânion gap." },
    { id: "s-labs", domain: "exames", description: "Cetonemia e função renal", evidence: { kind: "testOrdered", anyOf: ["cetonemia", "funcao_renal"], withinSeconds: 1200 }, points: 5, severity: "importante", rationale: "Excluir cetoacidose; estágio da LRA." },
    { id: "s-volume", domain: "tratamento", description: "Cristaloide", evidence: { kind: "drugGiven", anyOf: ["sf09", "ringer_lactato"], withinSeconds: 900 }, points: 10, severity: "critica", rationale: "Hipovolemia e choque." },
    { id: "s-dialise", domain: "tratamento", description: "Hemodiálise de urgência acionada", evidence: { kind: "actionDone", anyOf: ["acionar_dialise"], withinSeconds: 2400 }, points: 16, severity: "critica", rationale: "pH ≤ 7,0, lactato alto, rebaixamento: critérios EXTRIP.", sourceIds: ["INT-EXTRIP-METF-2015"] },
    { id: "s-glicose", domain: "tratamento", description: "Prevenção/correção de hipoglicemia", evidence: { kind: "drugGiven", anyOf: ["glicose50", "sg5"] }, points: 4, severity: "importante", rationale: "Hipoglicemia frequente nesse quadro." },
    { id: "s-hipo", domain: "reavaliacao", description: "Falha: hipoglicemia não prevenida", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-hipoglicemia" } }, points: 6, penalty: true, severity: "importante", rationale: "Glicemia seriada." },
    { id: "s-reav", domain: "reavaliacao", description: "Gasometria e glicemia seriadas", evidence: { kind: "reassessAfter", after: ["sf09", "ringer_lactato", "noradrenalina"], reassess: ["gaso_venosa", "gaso_arterial", "glicemia_capilar", "medir_pa"], withinSeconds: 2400 }, points: 8, severity: "importante", rationale: "Resposta e preparo para diálise." },
    { id: "s-dx", domain: "destino", description: "Acidose metabólica grave (láctica)", evidence: { kind: "diagnosis", accepted: ["acidose_metabolica_grave"] }, points: 6, severity: "importante", rationale: "pH 6,98 com lactato 16,5." },
    { id: "s-destino", domain: "destino", description: "UTI", evidence: { kind: "disposition", accepted: ["uti"] }, points: 6, severity: "importante", rationale: "Diálise e suporte." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Respiração de Kussmaul: o corpo compensa o quê?" },
      { level: 2, text: "Calcule o ânion gap: Na − (Cl + HCO₃)." },
      { level: 3, text: "Glicemia normal e cetonas baixas: não é CAD. Que remédio ela manteve com o rim falhando?" },
      { level: 4, text: "Sugestão explícita: glicemia, gasometria, cetonemia, SF/RL, noradrenalina se preciso, suspender metformina, glicose, acionar hemodiálise, UTI." }
    ],
    summary: "Idosa de 69 anos com DM2 e DRC leve que manteve metformina durante gastroenterite com LRA, evoluindo com acidose láctica grave (pH 6,98; lactato 16,5).",
    pathophysiology: "A metformina é eliminada pelo rim; na LRA acumula, inibe a gliconeogênese hepática a partir do lactato e o complexo I mitocondrial, gerando lactato. A hipoperfusão da desidratação soma acidose tipo A. A metformina é dialisável, e a hemodiálise remove o fármaco e corrige a acidose.",
    keyPoints: [
      "Acidose com ânion gap alto: lactato, cetonas, uremia, tóxicos (metanol, etilenoglicol, salicilato).",
      "Metformina + LRA = risco de acidose láctica; suspender em vômitos/diarreia ('dias de doença').",
      "Restaurar perfusão; glicemia seriada.",
      "EXTRIP: diálise se lactato > 20, pH ≤ 7,0, choque, rebaixamento ou falha do suporte.",
      "Bicarbonato é controverso e não substitui a diálise."
    ],
    alternatives: ["Hemodiálise contínua (CRRT) se instabilidade impedir a intermitente.", "Bicarbonato IV em casos selecionados (não disponível no catálogo)."],
    oralRubric: [
      { id: "o1", concept: "Ânion gap", synonyms: ["ânion gap", "anion gap", "gap"], weight: 2 },
      { id: "o2", concept: "Metformina na LRA", synonyms: ["metformina", "acúmulo", "rim"], weight: 3 },
      { id: "o3", concept: "Hemodiálise", synonyms: ["diálise", "hemodiálise", "extrip"], weight: 3 },
      { id: "o4", concept: "Dias de doença", synonyms: ["suspender", "dias de doença", "orientação"], weight: 1 }
    ],
    simplifications: ["Concentração sérica de metformina não está disponível.", "A hemodiálise é representada pelo acionamento e efeito após 30 min.", "Bicarbonato não está no catálogo."]
  },
  references: ["INT-EXTRIP-METF-2015", "INT-AFP-LRA-2019", "INT-SSC-2021", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 12, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Glicemia, história, gasometria, cetonemia, RL 1 L, noradrenalina, glicose, diálise, UTI", commands: [act(5, "glicemia_capilar"), act(15, "monitorizar"), ask(25, "h-evolucao"), ask(35, "h-medicacoes"), ask(45, "h-toxicos"), ask(55, "h-rim"), act(65, "acesso_venoso"), act(165, "acesso_venoso"), test(270, "gaso_venosa"), test(280, "cetonemia"), test(290, "funcao_renal"), rx(300, "ringer_lactato", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 30 }), act(500, "acionar_dialise"), rx(1500, "noradrenalina", "sol64", 1, "mg", "IV", "infusao", { rate: { value: 0.05, unit: "mcg/kg/min" } }), act(1800, "glicemia_capilar"), rx(1850, "sg5", "bolsa500", 500, "mL", "IV", "infusao_volume", { durationMinutes: 120 }), test(4000, "gaso_venosa"), dx(4100, "acidose_metabolica_grave"), dest(4200, "uti")], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-dialise-efeito" }, description: "diálise eficaz" }, { condition: { not: { ruleFired: "r-hipoglicemia" } }, description: "sem hipoglicemia" }, { condition: { not: { ruleFired: "r-pcr" } }, description: "sem PCR" }, { condition: { path: "vars.ph", op: "gte", value: 7.15 }, description: "pH em recuperação" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 4800, expect: [{ condition: { ruleFired: "r-choque" }, description: "choque" }, { condition: { ruleFired: "r-pcr" }, description: "PCR" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Diálise sem reposição nem vasopressor, sem glicose", commands: [act(30, "acesso_venoso"), test(150, "gaso_venosa"), act(200, "acionar_dialise")], runUntilSeconds: 4000, expect: [{ condition: { ruleFired: "r-dialise-instavel" }, description: "instabilidade na diálise" }, { condition: { ruleFired: "r-hipoglicemia" }, description: "hipoglicemia" }] },
    { id: "t-atraso", kind: "delay", description: "Só volume; diálise acionada aos 50 min", commands: [act(30, "acesso_venoso"), test(150, "gaso_venosa"), rx(300, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 30 }), rx(1700, "glicose50", "amp10", 20, "g", "IV"), act(3000, "acionar_dialise")], runUntilSeconds: 8000, expect: [{ condition: { ruleFired: "r-dialise-efeito" }, description: "diálise tardia" }, { condition: { not: { ruleFired: "r-pcr" } }, description: "PCR evitada" }] },
    { id: "t-alternativa", kind: "alternative", description: "SF 0,9% e glicose 50%, diálise precoce", commands: [act(5, "glicemia_capilar"), act(20, "acesso_venoso"), test(130, "gaso_arterial"), rx(150, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 30 }), act(300, "acionar_dialise"), rx(1500, "glicose50", "amp10", 20, "g", "IV"), dest(2500, "uti")], runUntilSeconds: 5000, expect: [{ condition: { ruleFired: "r-dialise-efeito" }, description: "diálise eficaz" }] }
  ]
};
