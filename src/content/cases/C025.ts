import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const ALTEPLASE = { drugGiven: "alteplase" };
/** laudo da TC liberado (coleta 20 min + laudo 20 min no catálogo) */
const TC_LAUDADA = { elapsedSince: "test:tc_cranio", op: "gte" as const, seconds: 1200 };

export const C025: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C025",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Senhora que de repente não conseguiu mexer o braço e falar",
  teachingTitle: "AVC isquêmico agudo com horário de início conhecido — fluxo, elegibilidade e trombólise",
  group: "Neurologia",
  specialties: ["Neurologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Definir o último momento em que a paciente foi vista bem",
    "Excluir hipoglicemia e obter TC de crânio sem atraso",
    "Checar critérios de exclusão para trombólise",
    "Indicar alteplase dentro da janela e evitar antitrombóticos nas 24 h seguintes",
    "Reconhecer oclusão de grande vaso e articular trombectomia via regulação"
  ],
  keywords: ["fraqueza", "braço", "fala", "derrame", "boca torta"],
  patient: {
    name: "Maria Aparecida Lopes",
    ageYears: 67,
    sex: "feminino",
    weightKg: 70,
    heightCm: 158,
    visual: { ageGroup: "idoso", sex: "feminino", skinTone: 3, hairStyle: "coque", hairColor: "grisalho", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional com tomografia. Senhora de 67 anos trazida pela filha: às 13h40, durante o almoço, deixou cair o garfo e passou a falar \"enrolado\". Agora são 15h00.",
  communication: "limitada",
  informants: [{ id: "filha", name: "Rosângela", role: "Filha" }],
  history: [
    hi("h-inicio", "inicio", "Quando ela foi vista bem pela última vez?", [{ source: "filha", text: "Às 13h40 em ponto: estávamos almoçando juntas, ela estava normal e de repente derrubou o garfo." }], ["quando", "última vez", "horário", "começou"]),
    hi("h-sintomas", "queixa", "O que mudou nela?", [{ source: "filha", text: "A boca entortou para a direita, o braço direito ficou mole e ela troca as palavras." }, { source: "paciente", text: "(Fala com dificuldade, palavras trocadas; entende ordens simples.)" }], ["mudou", "sintomas", "fala"]),
    hi("h-anticoag", "medicacoes", "Ela usa anticoagulante, como varfarina ou rivaroxabana? Que remédios toma?", [{ source: "filha", text: "Toma losartana e metformina. O cardiologista falou de anticoagulante por causa da arritmia, mas ela não começou." }], ["anticoagulante", "varfarina", "remédio", "rivaroxabana"]),
    hi("h-contra", "sinais_alarme", "Teve sangramento recente, cirurgia, trauma na cabeça ou AVC anterior?", [{ source: "filha", text: "Nada disso. Nunca teve derrame, não operou, não caiu." }], ["sangramento", "cirurgia", "trauma", "avc"]),
    hi("h-convulsao", "fatores_associados", "Teve convulsão, dor de cabeça forte ou vômitos?", [{ source: "filha", text: "Não teve convulsão nem vômito. Não reclamou de dor de cabeça." }], ["convulsão", "dor de cabeça", "vômito"]),
    hi("h-antecedentes", "antecedentes", "Que doenças ela tem?", [{ source: "filha", text: "Pressão alta, diabetes e uma arritmia que descobriram no ano passado." }], ["doenças", "pressão", "diabetes"]),
    hi("h-alergias", "alergias", "Tem alergia a algum remédio?", [{ source: "filha", text: "Não que a gente saiba." }])
  ],
  initial: {
    vars: { hr: 96, sbp: 176, dbp: 98, rr: 18, spo2: 95, temp: 36.5, gcs: 14, pain: 0, glucose: 132, perfusion: 0.85, effort: 0.3, na: 138, k: 4.2, creat: 0.9, urea: 36, hb: 13.1, plt: 214000, inr: 1.0 },
    flags: { rhythm: "fa", speech: "palavras", communication: "limitada", posture: "supino", painVisual: "nenhuma" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-neuro", "neurologico", "especial", "Hemiparesia direita (braço 2/5, perna 3/5), paralisia facial central à direita, afasia de expressão; desvio do olhar para a esquerda. Escala NIHSS estimada pelo autor: 12.", { label: "Exame neurológico (NIHSS)", better: [{ when: { ruleFired: "r-trombolise-precoce" }, text: "Melhora importante: força 4/5 no braço direito, fala com poucas trocas. NIHSS estimado pelo autor: 4." }, { when: { ruleFired: "r-trombolise-tardia" }, text: "Melhora parcial: força 3/5 no braço direito, afasia persiste. NIHSS estimado pelo autor: 8." }] }),
    ex("e-cabeca", "cabeca", "inspecao", "Sem sinais de trauma craniano.", {}),
    ex("e-coracao", "coracao", "ausculta", "Ritmo irregularmente irregular, sem sopros.", { sound: "bulhas_normais" }),
    ex("e-pescoco", "pescoco", "ausculta", "Sem sopro carotídeo; sem rigidez de nuca.", {})
  ],
  testResults: [
    { testId: "tc_cranio", variants: [{ text: "Sem sinais de hemorragia intracraniana. Discreto apagamento de sulcos insulares à esquerda; ASPECTS estimado 9. Sinal da artéria cerebral média hiperdensa à esquerda. (Laudo educativo.)" }] },
    { testId: "angio_tc_cranio", variants: [{ text: "Oclusão do segmento M1 da artéria cerebral média esquerda. Carótidas cervicais sem estenose significativa. (Laudo educativo.)" }] },
    { testId: "ecg12", variants: [{ text: "Fibrilação atrial com resposta ventricular de 96 bpm; sem supradesnivelamento de ST.", ecg: { rhythm: "fa", rate: 96, stElevationLeads: [], stDepressionLeads: [], peakedT: false, wideQrs: false } }] }
  ],
  highlightedActions: ["glicemia_capilar", "monitorizar", "acesso_venoso", "avaliar_glasgow", "acionar_samu"],
  rules: [
    { id: "r-trombolise-precoce", description: "Alteplase com TC laudada, porta-agulha ≤ 60 min: melhora neurológica importante", priority: 70, when: { all: [ALTEPLASE, { elapsedSince: "drug:alteplase", op: "gte", seconds: 1800 }, { not: { ruleFired: "r-sem-tc" } }, { time: "lte", seconds: 5450 }] }, repeat: "once", effects: [flag("speech", "frases"), flag("communication", "normal"), trend("gcs", 15, 600, "rep", 70), obs("Melhora da força e da fala durante a infusão."), outcome("melhora")] },
    { id: "r-trombolise-tardia", description: "Alteplase após 60 min de porta (ainda na janela): melhora parcial", priority: 60, when: { all: [ALTEPLASE, { elapsedSince: "drug:alteplase", op: "gte", seconds: 1800 }, { time: "gte", seconds: 5500 }, { not: { ruleFired: "r-trombolise-precoce" } }, { not: { ruleFired: "r-janela-perdida" } }, { not: { ruleFired: "r-sem-tc" } }] }, repeat: "once", effects: [trend("gcs", 15, 900, "rep2", 60), obs("Melhora discreta do déficit após a infusão."), outcome("estabilizacao_parcial")] },
    { id: "r-sem-tc", description: "Trombolítico antes do laudo de TC: risco inaceitável (hemorragia não excluída)", priority: 90, when: { all: [ALTEPLASE, { not: TC_LAUDADA }] }, repeat: "once", effects: [staff("supervisor", "Pare! A alteplase foi iniciada sem o laudo da tomografia: hemorragia intracraniana não foi excluída."), obs("Trombólise sem neuroimagem: contraindicação de processo.")] },
    { id: "r-fora-janela", description: "Alteplase após 4 h 30 min do início: fora da janela, transformação hemorrágica", priority: 95, when: { all: [ALTEPLASE, { ruleFired: "r-janela-perdida" }] }, repeat: "once", effects: [trend("gcs", 9, 900, "hem", 95), flag("consciousness", "voz"), trend("sbp", 198, 600, "hem", 95), staff("enfermagem", "Ela ficou mais sonolenta e vomitou."), outcome("complicacao")] },
    { id: "r-janela-perdida", description: "Sem reperfusão até 4 h 30 min: déficit se consolida", priority: 20, when: { all: [{ time: "gte", seconds: 11400 }, { not: ALTEPLASE }] }, repeat: "once", effects: [obs("A janela de trombólise IV (4 h 30 min do início) foi ultrapassada; o déficit persiste."), outcome("piora")] },
    { id: "r-aas-junto", description: "AAS nas primeiras 24 h após alteplase: risco hemorrágico", when: { all: [ALTEPLASE, { drugGiven: "aas" }] }, repeat: "once", effects: [obs("Antiagregante administrado nas primeiras 24 h após trombólise: aumento do risco de sangramento.")] },
    { id: "r-regulacao", description: "Regulação para trombectomia", when: { actionCompleted: "acionar_samu" }, repeat: "once", effects: [staff("regulacao", "Regulação: centro de referência com trombectomia aceita a paciente se houver oclusão de grande vaso. Manter a infusão de alteplase durante o transporte; USA disponível em 20 min.")] },
    { id: "r-glicemia", description: "Glicemia capilar confirma ausência de hipoglicemia", when: { actionCompleted: "glicemia_capilar" }, repeat: "once", effects: [obs("Glicemia capilar 132 mg/dL: hipoglicemia excluída como causa do déficit.")] }
  ],
  diagnosis: { primary: "avc_isquemico", accepted: ["avc_isquemico"], differentials: ["avc_hemorragico", "ait", "hipoglicemia", "paralisia_todd", "enxaqueca"] },
  acceptedDestinations: ["transferencia_regulada", "uti"],
  outcomeNotes: "Com TC sem hemorragia e sem contraindicações, alteplase 0,9 mg/kg (máx. 90 mg; 10% em bolus e restante em 60 min) até 4 h 30 min do início. Porta-agulha ≤ 60 min gera melhora importante no modelo; mais tarde, melhora parcial. Oclusão de M1: transferir para trombectomia via regulação.",
  scoring: [
    { id: "s-inicio", domain: "historia", description: "Definiu o horário em que foi vista bem pela última vez", evidence: { kind: "historyAsked", items: ["h-inicio"], minCount: 1 }, points: 8, severity: "critica", rationale: "O horário define a janela terapêutica.", sourceIds: ["BR-PCDT-AVC"] },
    { id: "s-exclusao", domain: "historia", description: "Pesquisou anticoagulantes e contraindicações", evidence: { kind: "historyAsked", items: ["h-anticoag", "h-contra"], minCount: 2 }, points: 8, severity: "critica", rationale: "Critérios de exclusão da trombólise (sangramento, cirurgia, anticoagulantes).", sourceIds: ["BR-PCDT-AVC"] },
    { id: "s-exame", domain: "historia", description: "Exame neurológico focado", evidence: { kind: "examDone", regions: ["neurologico"], minCount: 1 }, points: 4, severity: "importante", rationale: "Gravidade (NIHSS) e localização." },
    { id: "s-glicemia", domain: "priorizacao", description: "Glicemia capilar precoce", evidence: { kind: "actionDone", anyOf: ["glicemia_capilar"], withinSeconds: 600 }, points: 6, severity: "critica", rationale: "Hipoglicemia simula AVC.", sourceIds: ["BR-PCDT-AVC"] },
    { id: "s-tc", domain: "priorizacao", description: "TC de crânio solicitada em até 10 minutos", evidence: { kind: "testOrdered", anyOf: ["tc_cranio"], withinSeconds: 600 }, points: 9, severity: "critica", rationale: "Excluir hemorragia sem atrasar o porta-agulha.", sourceIds: ["INT-AHA-AVC-2019"] },
    { id: "s-exames", domain: "exames", description: "Angio-TC e exames dirigidos sem atrasar a trombólise", evidence: { kind: "testsNotExcessive", maxUnjustified: 1, justified: ["tc_cranio", "angio_tc_cranio", "ecg12", "hemograma", "coagulograma", "eletrolitos", "funcao_renal", "troponina"] }, points: 7, severity: "importante", rationale: "Não aguardar exames que não alteram a decisão quando não há suspeita de coagulopatia." },
    { id: "s-angio", domain: "exames", description: "Pesquisou oclusão de grande vaso (angio-TC)", evidence: { kind: "testOrdered", anyOf: ["angio_tc_cranio"] }, points: 8, severity: "importante", rationale: "Define indicação de trombectomia.", sourceIds: ["INT-AHA-AVC-2019"] },
    { id: "s-alteplase", domain: "tratamento", description: "Alteplase com porta-agulha ≤ 60 min", evidence: { kind: "drugGiven", anyOf: ["alteplase"], withinSeconds: 3600 }, points: 17, severity: "critica", rationale: "Benefício tempo-dependente dentro de 4 h 30 min.", sourceIds: ["BR-PCDT-AVC", "INT-AHA-AVC-2019"] },
    { id: "s-acesso", domain: "tratamento", description: "Acesso venoso e monitorização", evidence: { kind: "actionDone", anyOf: ["acesso_venoso"] }, points: 4, severity: "importante", rationale: "Para a infusão." },
    { id: "s-sem-tc", domain: "tratamento", description: "Falha: trombólise antes do laudo da TC", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-sem-tc" } }, points: 12, penalty: true, severity: "critica", rationale: "Hemorragia deve ser excluída antes do trombolítico." },
    { id: "s-aas", domain: "tratamento", description: "Falha: antiagregante junto com a trombólise", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-aas-junto" } }, points: 6, penalty: true, severity: "importante", rationale: "Antitrombóticos são adiados por 24 h após alteplase." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou o neurológico após a trombólise", evidence: { kind: "reassessAfter", after: ["alteplase"], reassess: ["avaliar_glasgow", "medir_pa"], withinSeconds: 3600 }, points: 10, severity: "importante", rationale: "Detectar piora (transformação hemorrágica) e controlar PA." },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de AVC isquêmico", evidence: { kind: "diagnosis", accepted: ["avc_isquemico"] }, points: 4, severity: "importante", rationale: "Déficit focal súbito com TC sem hemorragia." },
    { id: "s-destino", domain: "destino", description: "Transferência regulada para trombectomia", evidence: { kind: "disposition", accepted: ["transferencia_regulada"] }, points: 6, severity: "importante", rationale: "Oclusão de M1 com indicação de trombectomia; hospital sem o recurso.", sourceIds: ["INT-AHA-AVC-2019"] }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Quando ela foi vista bem pela última vez?" },
      { level: 2, text: "O que pode simular AVC e se resolve com uma picada no dedo?" },
      { level: 3, text: "Antes do trombolítico: TC sem hemorragia e critérios de exclusão." },
      { level: 4, text: "Sugestão explícita: glicemia, TC imediata, checar contraindicações, alteplase 0,9 mg/kg até 4 h 30 min, angio-TC e regulação para trombectomia." }
    ],
    summary: "Mulher de 67 anos com fibrilação atrial sem anticoagulação, déficit motor direito e afasia de início súbito há 80 min; TC sem hemorragia e oclusão de M1 esquerda.",
    pathophysiology: "Êmbolo de origem cardíaca (FA) oclui a artéria cerebral média. Ao redor do núcleo de infarto existe uma penumbra isquêmica, viável por algumas horas. A reperfusão (trombólise e/ou trombectomia) salva a penumbra; quanto mais tardia, menor o benefício e maior o risco de transformação hemorrágica.",
    keyPoints: [
      "Horário do último momento visto bem define a janela.",
      "Glicemia capilar sempre; TC de crânio sem atraso.",
      "Alteplase 0,9 mg/kg (máx. 90 mg), 10% em bolus e restante em 60 min, até 4 h 30 min (PCDT).",
      "Sem antiagregantes/anticoagulantes nas 24 h seguintes à trombólise.",
      "Oclusão de grande vaso: trombectomia via regulação."
    ],
    alternatives: ["Trombectomia direta em centros com o recurso, conforme critérios."],
    oralRubric: [
      { id: "o1", concept: "Horário de início", synonyms: ["horário", "início", "última vez", "janela"], weight: 2 },
      { id: "o2", concept: "Glicemia e TC", synonyms: ["glicemia", "tomografia", "tc"], weight: 2 },
      { id: "o3", concept: "Alteplase na janela", synonyms: ["alteplase", "trombólise", "trombolítico", "4,5"], weight: 3 },
      { id: "o4", concept: "Trombectomia", synonyms: ["trombectomia", "grande vaso", "m1", "regulação"], weight: 2 }
    ],
    simplifications: ["Escala NIHSS é estimada pelo autor; não há cálculo item a item.", "Resposta neurológica à trombólise é determinística e simplificada.", "Bolus de 10% + infusão é representado como infusão única de 60 min."]
  },
  references: ["BR-PCDT-AVC", "INT-AHA-AVC-2019", "BR-SAMU", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 10, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Glicemia, TC, exclusões, alteplase em < 60 min, angio-TC e regulação", commands: [act(5, "glicemia_capilar"), ask(10, "h-inicio"), test(30, "tc_cranio"), act(40, "monitorizar"), act(60, "acesso_venoso"), act(160, "acesso_venoso"), ask(200, "h-anticoag"), ask(210, "h-contra"), test(2500, "angio_tc_cranio"), rx(2500, "alteplase", "fa50", 0.9, "mg/kg", "IV", "infusao_volume", { durationMinutes: 60 }), act(2700, "acionar_samu"), act(3600, "avaliar_glasgow"), dx(4500, "avc_isquemico"), dest(4500, "transferencia_regulada")], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-trombolise-precoce" }, description: "melhora importante" }, { condition: { not: { ruleFired: "r-sem-tc" } }, description: "TC antes do trombolítico" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 12000, expect: [{ condition: { ruleFired: "r-janela-perdida" }, description: "janela perdida" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Alteplase antes do laudo da TC, com AAS", commands: [act(60, "acesso_venoso"), act(160, "acesso_venoso"), test(200, "tc_cranio"), rx(400, "alteplase", "fa50", 0.9, "mg/kg", "IV", "infusao_volume", { durationMinutes: 60 }), rx(420, "aas", "cp100", 300, "mg", "VO")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-sem-tc" }, description: "sem neuroimagem" }, { condition: { ruleFired: "r-aas-junto" }, description: "antiagregante" }, { condition: { not: { ruleFired: "r-trombolise-precoce" } }, description: "sem bônus" }] },
    { id: "t-atraso", kind: "delay", description: "TC só aos 40 min; alteplase aos ~90 min", commands: [act(60, "acesso_venoso"), act(160, "acesso_venoso"), test(2400, "tc_cranio"), rx(5400, "alteplase", "fa50", 0.9, "mg/kg", "IV", "infusao_volume", { durationMinutes: 60 })], runUntilSeconds: 8000, expect: [{ condition: { ruleFired: "r-trombolise-tardia" }, description: "melhora parcial" }, { condition: { not: { ruleFired: "r-trombolise-precoce" } }, description: "sem melhora plena" }] },
    { id: "t-alternativa", kind: "alternative", description: "Trombólise após TC, sem angio-TC, e UTI", commands: [act(5, "glicemia_capilar"), test(20, "tc_cranio"), act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(2600, "alteplase", "fa50", 0.9, "mg/kg", "IV", "infusao_volume", { durationMinutes: 60 }), dest(4600, "uti")], runUntilSeconds: 5000, expect: [{ condition: { ruleFired: "r-trombolise-precoce" }, description: "melhora" }] },
    { id: "t-fora-janela", kind: "delay", description: "Alteplase após 4 h 30 min", commands: [act(60, "acesso_venoso"), act(160, "acesso_venoso"), test(200, "tc_cranio"), rx(11500, "alteplase", "fa50", 0.9, "mg/kg", "IV", "infusao_volume", { durationMinutes: 60 })], runUntilSeconds: 12500, expect: [{ condition: { ruleFired: "r-fora-janela" }, description: "transformação hemorrágica" }] }
  ]
};
