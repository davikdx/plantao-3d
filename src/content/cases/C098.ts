import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const GLICOSE = { any: [{ drugGiven: "glicose50" }, { drugGiven: "glicose10" }] };
const SEDATIVO = { any: [{ drugGiven: "haloperidol" }, { drugGiven: "midazolam" }, { drugGiven: "diazepam" }, { drugGiven: "prometazina" }] };

export const C098: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C098",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Homem agitado e agressivo trazido como 'surto' por familiares",
  teachingTitle: "Agitação psicomotora de causa orgânica (hipoglicemia) em paciente com esquizofrenia — desescalada verbal, sinais vitais e glicemia antes de sedar, evitar ofuscamento diagnóstico",
  group: "Psiquiatria",
  specialties: ["Psiquiatria", "Emergência", "Endocrinologia"],
  environment: "emergencia",
  resourceProfile: "upa-porte-ii",
  difficulty: 2,
  level: "internato",
  objectives: [
    "Abordar a agitação de forma segura e progressiva: ambiente, desescalada verbal, contenção só como último recurso",
    "Considerar primeiro causas orgânicas: sinais vitais, glicemia capilar, oximetria",
    "Evitar o ofuscamento diagnóstico pelo transtorno mental conhecido",
    "Tratar a causa (glicose IV) e reavaliar glicemia",
    "Não sedar antes de excluir causa reversível"
  ],
  keywords: ["agitado", "agressivo", "surto", "confuso", "suando", "família"],
  patient: {
    name: "Carlos Alberto Nunes",
    ageYears: 46,
    sex: "masculino",
    weightKg: 98,
    heightCm: 175,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 3, hairStyle: "curto", hairColor: "grisalho", build: "obeso", pregnancyTrimester: 0 }
  },
  briefing: "Sala de emergência da UPA. Homem de 46 anos trazido pela irmã e pelo cunhado: há 40 minutos ficou agitado, gritando, confuso e tentou bater no cunhado. A irmã diz: 'ele tem esquizofrenia, está em surto'.",
  communication: "limitada",
  informants: [{ id: "irma", name: "Sandra (irmã)", role: "Irmã" }, { id: "paciente", name: "Carlos", role: "Paciente" }],
  history: [
    hi("h-inicio", "inicio", "Como começou? Foi de repente? Ele estava bem antes?", [{ source: "irma", text: "Estava bem de manhã, conversando. Começou de repente há uns 40 minutos: suando, tremendo, falando enrolado e agressivo." }], ["começou", "repente", "antes", "bem"]),
    hi("h-surtos", "antecedentes", "Como costumam ser os surtos dele? Está tomando os remédios?", [{ source: "irma", text: "Surto dele é diferente: vai ficando desconfiado por dias, ouve vozes. Hoje foi do nada. Toma a risperidona certinho, vai no CAPS." }], ["surtos", "remédios", "caps", "como costumam"]),
    hi("h-medicacoes", "medicacoes", "Que outros remédios ele usa? Tem diabetes?", [{ source: "irma", text: "Tem diabetes, usa insulina NPH de manhã e à noite e metformina. Hoje aplicou a insulina e não tomou café porque estava enjoado." }], ["diabetes", "insulina", "outros remédios", "metformina"]),
    hi("h-substancias", "habitos", "Usou álcool ou drogas? Bateu a cabeça?", [{ source: "irma", text: "Não bebe. Não usa droga. Não caiu." }], ["álcool", "drogas", "bateu", "cabeça"]),
    hi("h-paciente", "queixa", "Carlos, o que está sentindo?", [{ source: "paciente", text: "Me larga! ...tô tremendo... que lugar é esse?" }], ["sentindo", "carlos"])
  ],
  initial: {
    vars: { hr: 118, sbp: 152, dbp: 90, rr: 22, spo2: 97, temp: 36.4, gcs: 13, pain: 0, glucose: 34, perfusion: 0.8, effort: 0.2 },
    flags: { rhythm: "taquicardia_sinusal", agitation: true, sweating: true, tremor: true, posture: "sentado", painVisual: "nenhuma", speech: "palavras", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Agitado, sudorese profusa, pálido, tremor fino; desorientado no tempo e no espaço.", { label: "Estado geral", better: [{ when: { ruleFired: "r-glicose" }, text: "Calmo, orientado, sem sudorese." }] }),
    ex("e-neuro", "neurologico", "inspecao", "Fala arrastada, sem déficit focal evidente; atenção muito flutuante.", { label: "Neurológico", better: [{ when: { ruleFired: "r-glicose" }, text: "Lúcido, sem déficits." }] }),
    ex("e-mental", "cabeca", "inspecao", "Sem alucinações relatadas; discurso desorganizado por confusão, não por delírio estruturado.", { label: "Exame do estado mental" }),
    ex("e-olhos", "olhos", "inspecao", "Pupilas isocóricas, fotorreagentes.", { label: "Pupilas" })
  ],
  testResults: [
    { testId: "eletrolitos", variants: [{ text: "Na 138, K 3,8." }] },
    { testId: "ecg12", variants: [{ text: "Taquicardia sinusal; QTc 440 ms." }] }
  ],
  highlightedActions: ["ambiente_seguro", "desescalada_verbal", "glicemia_capilar", "monitorizar"],
  rules: [
    { id: "r-desescalada", description: "Desescalada verbal", priority: 20, when: { actionCompleted: "desescalada_verbal" }, repeat: "once", effects: [staff("enfermagem", "Com a conversa ele aceitou sentar e deixou medir os sinais e furar o dedo.")] },
    { id: "r-contencao-precoce", description: "Contenção sem tentar desescalada", priority: 25, when: { all: [{ actionCompleted: "contencao_mecanica" }, { not: { actionCompleted: "desescalada_verbal" } }] }, repeat: "once", effects: [obs("Contenção mecânica é o último recurso, após falha das medidas verbais.")] },
    { id: "r-glicose", description: "Glicose corrige o quadro", priority: 40, when: GLICOSE, repeat: "once", effects: [trend("glucose", 128, 300, "gli", 40), trend("gcs", 15, 600, "gli", 40), trend("hr", 92, 900, "gli", 40), trend("sbp", 130, 900, "gli", 40), flag("agitation", false), flag("sweating", false), flag("tremor", false), flag("speech", "frases"), staff("acompanhante", "Ele voltou ao normal! Era a diabetes?"), outcome("melhora")] },
    { id: "r-sedado-hipo", description: "Sedação antes de corrigir a causa", priority: 35, when: { all: [SEDATIVO, { not: GLICOSE }] }, repeat: "once", effects: [flag("agitation", false), trend("gcs", 9, 900, "sed", 35), staff("enfermagem", "Acalmou... mas agora não responde e continua suando frio."), obs("Ofuscamento diagnóstico: a sedação mascarou uma causa orgânica reversível."), outcome("piora")] },
    { id: "r-neuroglicopenia", description: "Neuroglicopenia progressiva", priority: 30, when: { all: [{ time: "gte", seconds: 1200 }, { not: GLICOSE }] }, repeat: "once", effects: [trend("glucose", 24, 600, "hipo", 30), trend("gcs", 7, 600, "hipo", 30), flag("seizure", true), staff("enfermagem", "Está convulsionando!"), outcome("piora")] },
    { id: "r-alta", description: "Alta/encaminhamento sem resolver", priority: 45, when: { any: [{ path: "disposition", op: "eq", value: "caps" }, { path: "disposition", op: "eq", value: "alta_orientada" }] }, repeat: "once", effects: [obs("Agitação aguda com causa orgânica precisa de tratamento clínico e observação, não de encaminhamento psiquiátrico.")] }
  ],
  diagnosis: { primary: "hipoglicemia", accepted: ["hipoglicemia"], differentials: ["agitacao_psicotica", "delirium", "intox_estimulante", "abstinencia_alcool", "avc_isquemico"] },
  acceptedDestinations: ["observacao"],
  outcomeNotes: "Agitação aguda por hipoglicemia (insulina NPH sem alimentação) em paciente com esquizofrenia estável — início súbito, sudorese, tremor, confusão, sem padrão habitual de descompensação. Ambiente seguro, desescalada verbal, sinais vitais e glicemia capilar, glicose IV, reavaliar glicemia, observação e ajuste da insulina; sem sedação ou contenção desnecessárias.",
  scoring: [
    { id: "s-glicemia", domain: "exames", description: "Glicemia capilar precoce", evidence: { kind: "actionDone", anyOf: ["glicemia_capilar"], withinSeconds: 420 }, points: 18, severity: "critica", rationale: "Causa orgânica tratável em toda agitação.", sourceIds: ["BR-ABP-AGITACAO-2019"] },
    { id: "s-sv", domain: "priorizacao", description: "Sinais vitais/monitorização", evidence: { kind: "actionDone", anyOf: ["monitorizar"], withinSeconds: 420 }, points: 6, severity: "importante", rationale: "Exclusão orgânica." },
    { id: "s-desesc", domain: "priorizacao", description: "Desescalada verbal", evidence: { kind: "actionDone", anyOf: ["desescalada_verbal"], withinSeconds: 300 }, points: 10, severity: "critica", rationale: "Abordagem menos coercitiva primeiro.", sourceIds: ["BR-ABP-AGITACAO-2019"] },
    { id: "s-amb", domain: "priorizacao", description: "Ambiente seguro", evidence: { kind: "actionDone", anyOf: ["ambiente_seguro"], withinSeconds: 300 }, points: 4, severity: "importante", rationale: "Segurança do paciente e da equipe." },
    { id: "s-hist", domain: "historia", description: "Início súbito e padrão dos surtos", evidence: { kind: "historyAsked", items: ["h-inicio", "h-surtos"], minCount: 2 }, points: 8, severity: "critica", rationale: "Diferente do padrão habitual = pensar em causa orgânica." },
    { id: "s-med", domain: "historia", description: "Medicações e comorbidades", evidence: { kind: "historyAsked", items: ["h-medicacoes", "h-substancias"], minCount: 1 }, points: 4, severity: "importante", rationale: "Insulina sem alimentação." },
    { id: "s-glicose", domain: "tratamento", description: "Glicose IV", evidence: { kind: "drugGiven", anyOf: ["glicose50", "glicose10"], routes: ["IV"], withinSeconds: 1000 }, points: 16, severity: "critica", rationale: "Tratar a causa.", sourceIds: ["BR-ABP-AGITACAO-2019"] },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou glicemia após glicose", evidence: { kind: "reassessAfter", after: ["glicose50", "glicose10"], reassess: ["glicemia_capilar"], withinSeconds: 1200 }, points: 8, severity: "importante", rationale: "Insulina de ação intermediária: risco de recorrência.", sourceIds: ["BR-SAMU-SAV"] },
    { id: "s-exame", domain: "historia", description: "Neurológico/estado mental", evidence: { kind: "examDone", regions: ["neurologico", "geral", "cabeca"], minCount: 2 }, points: 6, severity: "importante", rationale: "Confusão ≠ psicose." },
    { id: "s-sedado", domain: "tratamento", description: "Falha: sedou antes de corrigir a causa", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-sedado-hipo" } }, points: 12, penalty: true, severity: "critica", rationale: "Ofuscamento diagnóstico." },
    { id: "s-contencao", domain: "priorizacao", description: "Falha: contenção sem desescalada", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-contencao-precoce" } }, points: 6, penalty: true, severity: "importante", rationale: "Último recurso.", sourceIds: ["BR-ABP-AGITACAO-2019"] },
    { id: "s-dx", domain: "destino", description: "Causa orgânica identificada", evidence: { kind: "diagnosis", accepted: ["hipoglicemia"] }, points: 10, severity: "importante", rationale: "Hipoglicemia por insulina sem alimentação." },
    { id: "s-destino", domain: "destino", description: "Observação", evidence: { kind: "disposition", accepted: ["observacao"] }, points: 10, severity: "importante", rationale: "Glicemias seriadas; ajuste da insulina." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "O 'surto' de hoje parece com os surtos anteriores dele?" },
      { level: 2, text: "Sudorese, tremor, taquicardia e confusão de início súbito: que exames à beira-leito?" },
      { level: 3, text: "Ele usa insulina e não comeu." },
      { level: 4, text: "Sugestão explícita: ambiente seguro, desescalada verbal, monitor, glicemia capilar, acesso, glicose 50% IV, reavaliar glicemia, observação." }
    ],
    summary: "Hipoglicemia por insulina apresentando-se como agitação em paciente com esquizofrenia.",
    pathophysiology: "A neuroglicopenia causa confusão, agitação e comportamento agressivo; a resposta adrenérgica causa sudorese, tremor e taquicardia. Diagnóstico de transtorno mental prévio favorece o ofuscamento diagnóstico (atribuir tudo à doença psiquiátrica). Antipsicóticos de segunda geração associam-se a síndrome metabólica e diabetes.",
    keyPoints: [
      "Causas orgânicas primeiro em toda agitação: glicemia, sinais vitais, oximetria.",
      "Desescalada verbal antes de qualquer medida coercitiva; contenção é último recurso.",
      "Início súbito, confusão e sinais autonômicos sugerem causa orgânica/delirium.",
      "Na agitação orgânica, tratar a causa e evitar benzodiazepínicos.",
      "Reavaliar glicemia: insulina NPH e sulfonilureias podem causar recorrência."
    ],
    alternatives: ["Glicose 10% IV se acesso não calibroso.", "Se a agitação psicótica fosse confirmada: haloperidol IM 2,5–10 mg isolado ou com prometazina."],
    oralRubric: [
      { id: "o1", concept: "Causa orgânica", synonyms: ["orgânica", "glicemia", "hipoglicemia", "sinais vitais"], weight: 3 },
      { id: "o2", concept: "Desescalada", synonyms: ["desescalada", "verbal", "acolher", "calma"], weight: 2 },
      { id: "o3", concept: "Ofuscamento diagnóstico", synonyms: ["ofuscamento", "atribuir à doença", "esquizofrenia não explica"], weight: 2 },
      { id: "o4", concept: "Contenção último recurso", synonyms: ["contenção", "último recurso"], weight: 1 }
    ],
    simplifications: ["Glucagon IM não está no catálogo.", "Recorrência da hipoglicemia não modelada."]
  },
  references: ["BR-ABP-AGITACAO-2019", "BR-SAMU-SAV", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Ambiente, desescalada, história, monitor, glicemia, glicose IV, reavaliação, observação", commands: [act(5, "ambiente_seguro"), act(20, "desescalada_verbal"), ask(40, "h-inicio"), ask(50, "h-surtos"), ask(60, "h-medicacoes"), act(330, "monitorizar"), act(340, "glicemia_capilar"), { atSeconds: 380, type: "examine", payload: { region: "neurologico", maneuver: "inspecao" } }, { atSeconds: 390, type: "examine", payload: { region: "geral", maneuver: "inspecao" } }, act(400, "acesso_venoso"), rx(500, "glicose50", "amp10", 25, "g", "IV"), act(1000, "glicemia_capilar"), dx(1100, "hipoglicemia"), dest(1500, "observacao")], runUntilSeconds: 2400, expect: [{ condition: { ruleFired: "r-glicose" }, description: "glicose" }, { condition: { not: { ruleFired: "r-sedado-hipo" } }, description: "sem sedação" }, { condition: { path: "vars.gcs", op: "gte", value: 14 }, description: "lúcido" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 2400, expect: [{ condition: { ruleFired: "r-neuroglicopenia" }, description: "convulsão" }] },
    { id: "t-inadequada", kind: "inadequate", description: "'Surto': contenção imediata, haloperidol + prometazina e CAPS", commands: [act(20, "contencao_mecanica"), rx(250, "haloperidol", "amp5", 5, "mg", "IM"), rx(260, "prometazina", "amp25", 50, "mg", "IM"), dest(1800, "caps")], runUntilSeconds: 2400, expect: [{ condition: { ruleFired: "r-contencao-precoce" }, description: "contenção precoce" }, { condition: { ruleFired: "r-sedado-hipo" }, description: "sedado sem glicemia" }, { condition: { ruleFired: "r-alta" }, description: "encaminhamento indevido" }] },
    { id: "t-atraso", kind: "delay", description: "Glicemia só depois da convulsão", commands: [act(30, "desescalada_verbal"), act(400, "monitorizar"), act(1300, "glicemia_capilar"), act(1320, "acesso_venoso"), rx(1420, "glicose50", "amp10", 25, "g", "IV"), dest(2200, "observacao")], runUntilSeconds: 2800, expect: [{ condition: { ruleFired: "r-neuroglicopenia" }, description: "convulsão" }, { condition: { ruleFired: "r-glicose" }, description: "glicose tardia" }] },
    { id: "t-alternativa", kind: "alternative", description: "Glicemia primeiro, glicose 10%", commands: [act(10, "desescalada_verbal"), act(320, "glicemia_capilar"), act(370, "acesso_venoso"), rx(470, "glicose10", "frasco250", 250, "mL", "IV", "infusao_volume", { durationMinutes: 15 }), act(1500, "glicemia_capilar"), dest(1800, "observacao")], runUntilSeconds: 2400, expect: [{ condition: { ruleFired: "r-glicose" }, description: "glicose" }] }
  ]
};
