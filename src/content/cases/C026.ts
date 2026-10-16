import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const REGULACAO = { actionCompleted: "acionar_samu" };
const HIPOTENSOR = { any: [{ drugGiven: "nitroprussiato" }, { drugGiven: "nitroglicerina" }, { drugGiven: "hidralazina" }, { drugGiven: "metoprolol" }] };

export const C026: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C026",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Acordou sem conseguir mexer o lado direito do corpo",
  teachingTitle: "AVC ao despertar (horário desconhecido) — último momento visto bem, imagem e trombectomia em janela estendida",
  group: "Neurologia",
  specialties: ["Neurologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 4,
  level: "residencia",
  objectives: [
    "Definir o último momento em que o paciente foi visto bem (não o horário em que foi encontrado)",
    "Reconhecer inelegibilidade à trombólise IV por tempo sem imagem avançada disponível",
    "Pesquisar oclusão de grande vaso e indicar trombectomia em janela estendida via regulação",
    "Manejar PA de forma permissiva quando não há reperfusão",
    "Excluir hipoglicemia e hemorragia"
  ],
  keywords: ["acordou", "fraqueza", "fala", "derrame", "lado direito"],
  patient: {
    name: "Iolanda Freitas",
    ageYears: 72,
    sex: "feminino",
    weightKg: 66,
    heightCm: 157,
    visual: { ageGroup: "idoso", sex: "feminino", skinTone: 2, hairStyle: "curto", hairColor: "branco", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional (TC e angio-TC; sem ressonância nem hemodinâmica). Às 7h, o marido encontrou a senhora de 72 anos sem mexer o lado direito e sem conseguir falar. Ela foi dormir às 22h, bem.",
  communication: "incapaz",
  informants: [{ id: "marido", name: "Sr. Alcides", role: "Marido" }],
  history: [
    hi("h-tempo", "inicio", "Quando ela foi vista bem pela última vez?", [{ source: "marido", text: "Às 22h, quando deitamos. Às 3h ela foi ao banheiro sozinha, mas eu estava dormindo, não vi como estava." }], ["última vez", "vista bem", "quando", "horário"]),
    hi("h-anticoag", "medicacoes", "Ela usa anticoagulante?", [{ source: "marido", text: "Toma varfarina? Não… toma AAS e remédio de pressão." }], ["anticoagulante", "varfarina", "remédio"]),
    hi("h-antecedentes", "antecedentes", "Que doenças ela tem?", [{ source: "marido", text: "Pressão alta e o coração às vezes dispara." }], ["doenças"]),
    hi("h-funcionalidade", "social", "Antes disso, ela era independente?", [{ source: "marido", text: "Totalmente: cozinhava, ia à feira sozinha." }], ["independente", "antes", "funcionalidade"]),
    hi("h-contra", "sinais_alarme", "Teve sangramento, cirurgia ou queda recente?", [{ source: "marido", text: "Nada disso." }], ["sangramento", "cirurgia", "queda"])
  ],
  initial: {
    vars: { hr: 92, sbp: 184, dbp: 102, rr: 18, spo2: 95, temp: 36.6, gcs: 12, glucose: 128, perfusion: 0.85, effort: 0.3, plt: 210000, inr: 1.0, creat: 0.9 },
    flags: { rhythm: "fa", speech: "nenhuma", communication: "incapaz", posture: "supino", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-neuro", "neurologico", "especial", "Afasia global, hemiplegia direita, desvio do olhar para a esquerda, hemianopsia direita. NIHSS estimado pelo autor: 18.", { label: "Exame neurológico (NIHSS)" }),
    ex("e-coracao", "coracao", "ausculta", "Ritmo irregularmente irregular.", { sound: "bulhas_normais" }),
    ex("e-cabeca", "cabeca", "inspecao", "Sem sinais de trauma.", {})
  ],
  testResults: [
    { testId: "tc_cranio", variants: [{ text: "Sem hemorragia. Hipodensidade sutil no núcleo lentiforme esquerdo; ASPECTS estimado 8; artéria cerebral média esquerda hiperdensa. (Laudo educativo.)" }] },
    { testId: "angio_tc_cranio", variants: [{ text: "Oclusão do segmento M1 da ACM esquerda com circulação colateral moderada. (Laudo educativo.)" }] },
    { testId: "ecg12", variants: [{ text: "Fibrilação atrial 92 bpm.", ecg: { rhythm: "fa", rate: 92, stElevationLeads: [], stDepressionLeads: [], peakedT: false, wideQrs: false } }] }
  ],
  highlightedActions: ["glicemia_capilar", "monitorizar", "acesso_venoso", "acionar_samu"],
  rules: [
    { id: "r-alteplase", description: "Alteplase sem horário conhecido e sem imagem de seleção: transformação hemorrágica", priority: 90, when: { drugGiven: "alteplase" }, repeat: "once", effects: [trend("gcs", 7, 900, "hem", 90), trend("sbp", 204, 600, "hem", 90), flag("consciousness", "dor"), staff("enfermagem", "Ela ficou muito sonolenta e vomitou!"), outcome("complicacao")] },
    { id: "r-regulacao", description: "Regulação aceita para trombectomia em janela estendida", when: REGULACAO, repeat: "once", effects: [staff("regulacao", "Regulação: centro de trombectomia aceita (oclusão de M1, último visto bem há 9 h, ASPECTS favorável); fará imagem de perfusão na chegada. USA em 15 min."), outcome("transferencia_segura")] },
    { id: "r-hipotensao", description: "Redução agressiva da PA sem reperfusão: piora da penumbra", priority: 60, when: HIPOTENSOR, repeat: "once", effects: [trend("sbp", 128, 300, "pa", 60), trend("gcs", 10, 600, "pa", 60), obs("Queda rápida da PA para 128 mmHg: piora do déficit (perfusão colateral dependente de pressão). Sem trombólise, tolera-se PA até 220/120.")] },
    { id: "r-janela", description: "Sem regulação em 90 min: núcleo de infarto cresce", priority: 30, when: { all: [{ time: "gte", seconds: 5400 }, { not: REGULACAO }] }, repeat: "once", effects: [trend("gcs", 10, 900, "core", 30), obs("Infarto em expansão; janela para trombectomia se estreitando."), outcome("piora")] },
    { id: "r-glicemia", description: "Glicemia capilar", when: { actionCompleted: "glicemia_capilar" }, repeat: "once", effects: [obs("Glicemia 128 mg/dL.")] }
  ],
  diagnosis: { primary: "avc_isquemico", accepted: ["avc_isquemico"], differentials: ["avc_hemorragico", "hipoglicemia", "paralisia_todd", "encefalopatia_metabolica"] },
  acceptedDestinations: ["transferencia_regulada"],
  outcomeNotes: "AVC ao despertar: o horário é o último momento visto bem (22h, ~9 h antes). Sem ressonância (mismatch DWI-FLAIR) ou perfusão, não há elegibilidade à trombólise IV por tempo. Com oclusão de grande vaso, a trombectomia pode ser feita até 24 h com seleção por imagem: regular. Sem reperfusão, PA permissiva (até 220/120).",
  scoring: [
    { id: "s-tempo", domain: "historia", description: "Definiu o último momento visto bem", evidence: { kind: "historyAsked", items: ["h-tempo"], minCount: 1 }, points: 8, severity: "critica", rationale: "Define todas as janelas terapêuticas.", sourceIds: ["BR-PCDT-AVC"] },
    { id: "s-funcional", domain: "historia", description: "Funcionalidade prévia e anticoagulação", evidence: { kind: "historyAsked", items: ["h-funcionalidade", "h-anticoag"], minCount: 2 }, points: 6, severity: "importante", rationale: "Elegibilidade à trombectomia." },
    { id: "s-glicemia", domain: "priorizacao", description: "Glicemia capilar precoce", evidence: { kind: "actionDone", anyOf: ["glicemia_capilar"], withinSeconds: 600 }, points: 5, severity: "critica", rationale: "Excluir hipoglicemia." },
    { id: "s-tc", domain: "priorizacao", description: "TC em até 10 minutos da chegada (pedido)", evidence: { kind: "testOrdered", anyOf: ["tc_cranio"], withinSeconds: 600 }, points: 8, severity: "critica", rationale: "Excluir hemorragia e avaliar extensão." },
    { id: "s-angio", domain: "exames", description: "Angio-TC para oclusão de grande vaso", evidence: { kind: "testOrdered", anyOf: ["angio_tc_cranio"], withinSeconds: 2400 }, points: 12, severity: "critica", rationale: "Seleção para trombectomia.", sourceIds: ["INT-AHA-AVC-2019"] },
    { id: "s-exames", domain: "exames", description: "Exames dirigidos", evidence: { kind: "testsNotExcessive", maxUnjustified: 1, justified: ["tc_cranio", "angio_tc_cranio", "ecg12", "hemograma", "coagulograma", "eletrolitos", "funcao_renal", "troponina"] }, points: 3, severity: "menor", rationale: "Não atrasar transferência." },
    { id: "s-sem-alteplase", domain: "tratamento", description: "Não usou trombolítico fora da janela", evidence: { kind: "avoidDrug", anyOf: ["alteplase", "tenecteplase"] }, points: 15, severity: "critica", rationale: "Horário desconhecido sem imagem de seleção.", sourceIds: ["BR-PCDT-AVC"] },
    { id: "s-pa", domain: "tratamento", description: "Falha: redução agressiva da PA", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-hipotensao" } }, points: 6, penalty: true, severity: "importante", rationale: "PA permissiva sem reperfusão." },
    { id: "s-monitor", domain: "tratamento", description: "Monitorização, cabeceira e jejum (disfagia)", evidence: { kind: "actionDone", anyOf: ["monitorizar", "jejum_cabeceira"] }, points: 4, severity: "importante", rationale: "Risco de aspiração e arritmia." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliação neurológica seriada", evidence: { kind: "actionDone", anyOf: ["avaliar_glasgow"] }, points: 10, severity: "importante", rationale: "Detectar piora." },
    { id: "s-dx", domain: "destino", description: "AVC isquêmico com oclusão de grande vaso", evidence: { kind: "diagnosis", accepted: ["avc_isquemico"] }, points: 5, severity: "importante", rationale: "TC sem sangramento, angio com M1." },
    { id: "s-destino", domain: "destino", description: "Transferência regulada para trombectomia", evidence: { kind: "disposition", accepted: ["transferencia_regulada"] }, points: 18, severity: "critica", rationale: "Trombectomia até 24 h em selecionados.", sourceIds: ["INT-AHA-AVC-2019"] }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Para o relógio do AVC, conta a hora em que foi encontrada?" },
      { level: 2, text: "Há imagem que permitiria trombólise com horário desconhecido aqui?" },
      { level: 3, text: "Oclusão de grande vaso ainda pode ser tratada horas depois." },
      { level: 4, text: "Sugestão explícita: glicemia, TC, angio-TC, sem trombolítico, PA permissiva, regulação para trombectomia." }
    ],
    summary: "Mulher de 72 anos com FA, AVC ao despertar (último visto bem há ~9 h), NIHSS ~18, oclusão de M1 esquerda e ASPECTS favorável.",
    pathophysiology: "A penumbra pode persistir por horas quando há boa circulação colateral; a imagem (perfusão/difusão) identifica tecido salvável além das janelas clássicas. A trombólise IV, sem horário conhecido, depende de imagem específica (mismatch DWI-FLAIR).",
    keyPoints: [
      "Horário = último momento visto bem.",
      "Sem RM/perfusão: sem trombólise IV no AVC ao despertar.",
      "Angio-TC para oclusão de grande vaso: trombectomia até 24 h com seleção por imagem.",
      "PA permissiva (até 220/120) sem reperfusão.",
      "Organizar a rede: regulação para centro com trombectomia."
    ],
    alternatives: ["Trombólise guiada por RM (mismatch DWI-FLAIR) em centros com o recurso."],
    oralRubric: [
      { id: "o1", concept: "Último visto bem", synonyms: ["última vez", "visto bem", "horário"], weight: 2 },
      { id: "o2", concept: "Sem trombólise", synonyms: ["sem trombólise", "fora da janela", "não trombolisar"], weight: 2 },
      { id: "o3", concept: "Angio-TC e trombectomia", synonyms: ["angio", "trombectomia", "grande vaso"], weight: 3 },
      { id: "o4", concept: "PA permissiva", synonyms: ["220", "permissiva", "pressão"], weight: 1 }
    ],
    simplifications: ["Elegibilidade final à trombectomia é decidida no centro receptor (perfusão), resumida pela regulação.", "Crescimento do infarto aos 90 min é didático."]
  },
  references: ["BR-PCDT-AVC", "INT-AHA-AVC-2019", "BR-SAMU", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 10, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Último visto bem, glicemia, TC, angio-TC e regulação", commands: [ask(10, "h-tempo"), ask(20, "h-funcionalidade"), ask(30, "h-anticoag"), act(40, "glicemia_capilar"), test(50, "tc_cranio"), act(60, "monitorizar"), act(70, "acesso_venoso"), act(170, "acesso_venoso"), test(200, "angio_tc_cranio"), act(2600, "acionar_samu"), act(2700, "avaliar_glasgow"), dx(3000, "avc_isquemico"), dest(3000, "transferencia_regulada")], runUntilSeconds: 3500, expect: [{ condition: { ruleFired: "r-regulacao" }, description: "trombectomia aceita" }, { condition: { not: { ruleFired: "r-alteplase" } }, description: "sem trombolítico" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 5600, expect: [{ condition: { ruleFired: "r-janela" }, description: "infarto em expansão" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Trombólise assumindo horário da descoberta", commands: [act(70, "acesso_venoso"), act(170, "acesso_venoso"), test(200, "tc_cranio"), rx(2600, "alteplase", "fa50", 0.9, "mg/kg", "IV", "infusao_volume", { durationMinutes: 60 })], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-alteplase" }, description: "hemorragia" }] },
    { id: "t-atraso", kind: "delay", description: "Reduz PA e regula tardiamente", commands: [act(70, "acesso_venoso"), act(170, "acesso_venoso"), rx(300, "nitroprussiato", "sol200", 50, "mg", "IV", "infusao", { rate: { value: 1, unit: "mcg/kg/min" } }), act(5500, "acionar_samu")], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-hipotensao" }, description: "piora com hipotensão" }, { condition: { ruleFired: "r-janela" }, description: "infarto cresce" }, { condition: { ruleFired: "r-regulacao" }, description: "regulação tardia" }] },
    { id: "t-alternativa", kind: "alternative", description: "Regulação logo após TC e angio, sem esperar exames laboratoriais", commands: [act(10, "glicemia_capilar"), test(20, "tc_cranio"), test(30, "angio_tc_cranio"), act(2800, "acionar_samu"), dest(2900, "transferencia_regulada")], runUntilSeconds: 3200, expect: [{ condition: { ruleFired: "r-regulacao" }, description: "transferência" }] }
  ]
};
