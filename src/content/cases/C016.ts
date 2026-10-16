import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, obs, outcome, oxygenResponse, rx, staff, test, trend } from "./helpers";

const ANTICOAG = { any: [{ drugGiven: "enoxaparina" }, { drugGiven: "heparina" }] };
const ALTEPLASE = { drugGiven: "alteplase" };
const PIORA = { ruleFired: "r-instabilizacao" };

export const C016: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C016",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Falta de ar e dor ao respirar dias depois de engessar a perna",
  teachingTitle: "Tromboembolismo pulmonar — probabilidade pré-teste, angio-TC, anticoagulação e reconhecimento de alto risco",
  group: "Cardiologia",
  specialties: ["Pneumologia", "Cardiologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Estimar a probabilidade clínica de TEP (escore de Wells/Genebra)",
    "Usar D-dímero apenas quando a probabilidade não é alta",
    "Confirmar com angiotomografia e anticoagular sem atraso",
    "Reconhecer instabilização (TEP de alto risco) e indicar trombólise"
  ],
  keywords: ["falta de ar", "dor ao respirar", "perna inchada", "gesso", "imobilização"],
  patient: {
    name: "Patrícia Moura",
    ageYears: 46,
    sex: "feminino",
    weightKg: 74,
    heightCm: 163,
    visual: { ageGroup: "adulto", sex: "feminino", skinTone: 3, hairStyle: "longo", hairColor: "preto", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Mulher de 46 anos com fratura de tornozelo imobilizada com bota gessada há 12 dias, sem anticoagulação profilática. Hoje acordou com falta de ar e dor no lado direito do tórax ao respirar.",
  communication: "normal",
  history: [
    h("h-queixa", "queixa", "O que está sentindo?", "Falta de ar e uma dor pontada do lado direito quando respiro fundo.", { keywords: ["sentindo"] }),
    h("h-inicio", "inicio", "Quando começou?", "Hoje cedo, de repente."),
    h("h-perna", "fatores_associados", "A perna está mais inchada ou doendo?", "A panturrilha esquerda, por cima do gesso, está inchada e dolorida há dois dias.", { keywords: ["perna", "panturrilha", "inchada"] }),
    h("h-hemoptise", "fatores_associados", "Tossiu sangue? Teve desmaio?", "Saiu um pouquinho de sangue no catarro. Desmaio não.", { keywords: ["sangue", "tosse", "desmaio"] }),
    h("h-riscos", "antecedentes", "Usa anticoncepcional ou hormônio? Tem câncer? Já teve trombose?", "Uso anticoncepcional oral. Nunca tive trombose nem câncer.", { keywords: ["anticoncepcional", "hormônio", "câncer", "trombose"] }),
    h("h-sangramento", "sinais_alarme", "Tem úlcera, sangramento recente ou cirurgia nas últimas semanas?", "Não, a fratura foi tratada só com gesso.", { keywords: ["sangramento", "úlcera", "cirurgia"] }),
    h("h-alergias", "alergias", "Tem alergia?", "Não.")
  ],
  initial: {
    vars: { hr: 112, sbp: 124, dbp: 78, rr: 26, spo2: 90, temp: 37.6, gcs: 15, pain: 5, glucose: 104, perfusion: 0.8, effort: 0.5, trop: 38, creat: 0.8, hb: 13.4, plt: 245000, inr: 1.0, ph: 7.47, pco2: 31, po2: 58, lactate: 1.6 },
    flags: { rhythm: "taquicardia_sinusal", posture: "sentado", painVisual: "moderada", speech: "frases", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-pulmao", "torax_posterior", "ausculta", "Murmúrio presente bilateralmente, sem estertores; atrito pleural discreto à direita.", { sound: "murmurio_normal" }),
    ex("e-perna", "membro_inferior_e", "inspecao", "Panturrilha esquerda edemaciada (3 cm a mais), empastada e dolorosa acima do gesso.", { label: "Membros inferiores" }),
    ex("e-jugular", "pescoco", "inspecao", "Jugulares sem turgência.", { label: "Jugulares", better: [{ when: PIORA, text: "Turgência jugular a 45°." }] }),
    ex("e-coracao", "coracao", "ausculta", "Taquicárdica; B2 hiperfonética em foco pulmonar.", { sound: "bulhas_normais" })
  ],
  testResults: [
    { testId: "angio_tc_torax", variants: [{ text: "Falhas de enchimento em artérias lobares inferior e média direitas e segmentares à esquerda; relação VD/VE 1,1. (Laudo educativo.)" }] },
    { testId: "dimero_d", variants: [{ text: "D-dímero 3.800 ng/mL FEU (elevado). Na probabilidade clínica alta, o resultado não muda a necessidade de imagem." }] },
    { testId: "ecg12", variants: [{ text: "Taquicardia sinusal 112 bpm; padrão S1Q3T3 discreto; inversão de T em V1–V3.", ecg: { rhythm: "taquicardia_sinusal", rate: 112, stElevationLeads: [], stDepressionLeads: [], peakedT: false, wideQrs: false } }] },
    { testId: "pocus_cardiaco", variants: [{ when: PIORA, text: "VD dilatado e hipocinético (VD > VE), septo retificado, VCI dilatada sem variação." }, { text: "VD discretamente dilatado; função do VE preservada; sem derrame pericárdico." }] },
    { testId: "rx_torax", variants: [{ text: "Sem consolidações; pequena atelectasia laminar em base direita. (Laudo educativo.)" }] }
  ],
  highlightedActions: ["monitorizar", "o2_cateter", "acesso_venoso"],
  rules: [
    oxygenResponse(95, 120),
    { id: "r-anticoag", description: "Anticoagulação: estabilidade e melhora progressiva", priority: 50, when: { all: [ANTICOAG, { elapsedSince: "drug:enoxaparina", op: "gte", seconds: 1800 }, { not: PIORA }] }, repeat: "once", effects: [trend("hr", 96, 1800, "ac", 50), trend("rr", 20, 1800, "ac", 50), trend("pain", 3, 1800, "ac", 50), outcome("melhora")] },
    { id: "r-anticoag-hnf", description: "Heparina não fracionada: mesmo efeito", priority: 50, when: { all: [{ drugGiven: "heparina" }, { elapsedSince: "drug:heparina", op: "gte", seconds: 1800 }, { not: PIORA }, { not: { ruleFired: "r-anticoag" } }] }, repeat: "once", effects: [trend("hr", 96, 1800, "ac", 50), trend("rr", 20, 1800, "ac", 50), outcome("melhora")] },
    { id: "r-instabilizacao", description: "Sem anticoagulação em 60 min: nova embolização, TEP de alto risco", priority: 40, when: { all: [{ time: "gte", seconds: 3600 }, { not: ANTICOAG }] }, repeat: "once", effects: [trend("sbp", 82, 300, "alto", 40), trend("dbp", 50, 300, "alto", 40), trend("hr", 132, 300, "alto", 40), trend("spo2", 84, 300, "alto", 45), trend("perfusion", 0.4, 300, "alto", 40), trend("lactate", 4.2, 900, "alto", 40), flag("sweating", true), staff("enfermagem", "Ela piorou de repente: pressão 82 por 50 e saturação caindo!"), outcome("piora")] },
    { id: "r-trombolise", description: "Trombólise no TEP de alto risco: melhora hemodinâmica", priority: 70, when: { all: [PIORA, ALTEPLASE, { elapsedSince: "drug:alteplase", op: "gte", seconds: 900 }] }, repeat: "once", effects: [trend("sbp", 108, 600, "lise", 70), trend("dbp", 66, 600, "lise", 70), trend("hr", 104, 600, "lise", 70), trend("perfusion", 0.7, 600, "lise", 70), trend("spo2", 94, 600, "lise", 70), outcome("estabilizacao_parcial")] },
    { id: "r-lise-sem-indicacao", description: "Trombolítico em TEP estável: sangramento", priority: 80, when: { all: [ALTEPLASE, { not: PIORA }] }, repeat: "once", effects: [trend("hb", 10.8, 900, "sang", 80), obs("Trombólise em paciente estável: sangramento no sítio de punção e hematúria; benefício não supera o risco nesse perfil."), outcome("complicacao")] },
    { id: "r-ddimero", description: "D-dímero em probabilidade alta", when: { all: [{ testCollected: "dimero_d" }, { not: { testCollected: "angio_tc_torax" } }] }, repeat: "once", effects: [obs("Com probabilidade clínica alta, D-dímero não deve atrasar a angiotomografia nem a anticoagulação.")] },
    { id: "r-volume", description: "Volume liberal no VD sobrecarregado", when: { any: [{ drugGiven: "sf09", minTotal: { value: 1000, unit: "mL" } }, { drugGiven: "ringer_lactato", minTotal: { value: 1000, unit: "mL" } }] }, repeat: "once", effects: [obs("Expansão volêmica liberal pode piorar a dilatação do VD no TEP; usar volumes pequenos com cautela.")] }
  ],
  diagnosis: { primary: "tep", accepted: ["tep"], differentials: ["pneumonia", "pneumotorax_espontaneo", "iamssst", "pericardite", "crise_ansiedade"] },
  acceptedDestinations: ["internacao_enfermaria", "uti"],
  outcomeNotes: "Probabilidade clínica alta (TVP, imobilização, taquicardia, hemoptise): ir direto à angio-TC e anticoagular sem esperar a imagem se houver atraso. Sem anticoagulação, nova embolização torna o TEP de alto risco — então trombólise. Trombolítico no estável traz sangramento sem benefício.",
  scoring: [
    { id: "s-riscos", domain: "historia", description: "Fatores de risco e sinais de TVP", evidence: { kind: "historyAsked", items: ["h-perna", "h-riscos", "h-hemoptise"], minCount: 2 }, points: 7, severity: "critica", rationale: "Compõem a probabilidade pré-teste.", sourceIds: ["INT-ESC-TEP-2019"] },
    { id: "s-contra", domain: "historia", description: "Pesquisou risco de sangramento", evidence: { kind: "historyAsked", items: ["h-sangramento"], minCount: 1 }, points: 3, severity: "importante", rationale: "Antes de anticoagular/trombolisar." },
    { id: "s-exame", domain: "historia", description: "Examinou membros inferiores e tórax", evidence: { kind: "examDone", regions: ["membro_inferior_e", "torax_posterior"], minCount: 2 }, points: 4, severity: "importante", rationale: "TVP clínica eleva a probabilidade." },
    { id: "s-o2", domain: "priorizacao", description: "Oxigênio e monitorização", evidence: { kind: "actionDone", anyOf: ["o2_cateter", "o2_mascara_reservatorio", "monitorizar"], withinSeconds: 300 }, points: 6, severity: "importante", rationale: "Hipoxemia." },
    { id: "s-angio", domain: "exames", description: "Angiotomografia de tórax", evidence: { kind: "testOrdered", anyOf: ["angio_tc_torax"], withinSeconds: 1800 }, points: 10, severity: "critica", rationale: "Confirma TEP na probabilidade alta.", sourceIds: ["INT-ESC-TEP-2019"] },
    { id: "s-exames", domain: "exames", description: "Exames dirigidos (sem D-dímero na probabilidade alta)", evidence: { kind: "testsNotExcessive", maxUnjustified: 0, justified: ["angio_tc_torax", "ecg12", "troponina", "pocus_cardiaco", "gaso_arterial", "hemograma", "coagulograma", "funcao_renal", "rx_torax", "teste_gravidez_urina", "bhcg"] }, points: 5, severity: "menor", rationale: "D-dímero só com probabilidade não alta." },
    { id: "s-anticoag", domain: "tratamento", description: "Anticoagulação em até 1 hora", evidence: { kind: "drugGiven", anyOf: ["enoxaparina", "heparina"], withinSeconds: 3600 }, points: 17, severity: "critica", rationale: "Previne extensão e recorrência; não esperar imagem quando a probabilidade é alta.", sourceIds: ["INT-ESC-TEP-2019"] },
    { id: "s-lise-erro", domain: "tratamento", description: "Falha: trombólise no TEP estável", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-lise-sem-indicacao" } }, points: 8, penalty: true, severity: "critica", rationale: "Risco de sangramento sem benefício." },
    { id: "s-estratif", domain: "reavaliacao", description: "Estratificou risco (troponina, VD)", evidence: { kind: "testOrdered", anyOf: ["troponina", "pocus_cardiaco"] }, points: 10, severity: "importante", rationale: "Risco intermediário exige monitorização.", sourceIds: ["INT-ESC-TEP-2019"] },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de TEP", evidence: { kind: "diagnosis", accepted: ["tep"] }, points: 5, severity: "importante", rationale: "Angio-TC positiva." },
    { id: "s-destino", domain: "destino", description: "Internação (enfermaria ou UTI conforme risco)", evidence: { kind: "disposition", accepted: ["internacao_enfermaria", "uti"] }, points: 5, severity: "importante", rationale: "Risco intermediário com troponina elevada." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Qual a probabilidade clínica de TEP aqui?" },
      { level: 2, text: "Com probabilidade alta, o D-dímero ajuda?" },
      { level: 3, text: "Não espere a imagem para anticoagular se houver demora." },
      { level: 4, text: "Sugestão explícita: O₂, monitor, enoxaparina 1 mg/kg, angio-TC, troponina/POCUS; trombólise só se instabilizar." }
    ],
    summary: "Mulher de 46 anos em uso de anticoncepcional, imobilizada por fratura, com TVP clínica e TEP bilateral de risco intermediário.",
    pathophysiology: "Estase, lesão e hipercoagulabilidade (tríade de Virchow) geram TVP; êmbolos ocluem artérias pulmonares, aumentando a pós-carga do VD e criando espaço morto. Se a pós-carga supera a capacidade do VD, ele dilata, o septo desvia e o débito do VE cai — choque obstrutivo.",
    keyPoints: [
      "Estimar a probabilidade clínica antes de pedir exames.",
      "Probabilidade alta: angio-TC direta; anticoagular sem esperar se houver atraso.",
      "Estratificar: PA, VD, troponina.",
      "Trombólise apenas no TEP de alto risco (hipotensão).",
      "Volume com cautela no VD sobrecarregado."
    ],
    alternatives: ["Heparina não fracionada quando trombólise/procedimento é provável.", "Anticoagulantes orais diretos em pacientes selecionados (não modelados)."],
    oralRubric: [
      { id: "o1", concept: "Probabilidade pré-teste", synonyms: ["wells", "genebra", "probabilidade"], weight: 2 },
      { id: "o2", concept: "Angio-TC", synonyms: ["angiotomografia", "angio-tc", "tomografia"], weight: 2 },
      { id: "o3", concept: "Anticoagulação", synonyms: ["enoxaparina", "heparina", "anticoagul"], weight: 3 },
      { id: "o4", concept: "Trombólise no alto risco", synonyms: ["trombólise", "alteplase", "alto risco", "hipotensão"], weight: 2 }
    ],
    simplifications: ["Nova embolização aos 60 min sem anticoagulação é decisão didática.", "Efeito da anticoagulação foi comprimido em minutos."]
  },
  references: ["INT-ESC-TEP-2019", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Riscos, O₂, enoxaparina, angio-TC, troponina e internação", commands: [ask(10, "h-perna"), ask(20, "h-riscos"), ask(30, "h-sangramento"), act(40, "monitorizar"), act(50, "o2_cateter", { fluxo: 3 }), act(60, "acesso_venoso"), act(160, "acesso_venoso"), test(170, "ecg12"), test(180, "troponina"), rx(300, "enoxaparina", "ser80", 74, "mg", "SC"), test(320, "angio_tc_torax"), dx(2500, "tep"), dest(2500, "internacao_enfermaria")], runUntilSeconds: 4500, expect: [{ condition: { ruleFired: "r-anticoag" }, description: "melhora" }, { condition: { not: PIORA }, description: "sem instabilização" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 4000, expect: [{ condition: PIORA, description: "TEP de alto risco" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Alteplase em paciente estável", commands: [act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(300, "alteplase", "fa50", 100, "mg", "IV", "infusao_volume", { durationMinutes: 120 })], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-lise-sem-indicacao" }, description: "sangramento" }] },
    { id: "t-atraso", kind: "delay", description: "D-dímero e espera; instabiliza e recebe trombólise", commands: [act(60, "acesso_venoso"), act(160, "acesso_venoso"), test(200, "dimero_d"), rx(3800, "heparina", "fa5000", 80, "UI/kg", "IV"), rx(3900, "alteplase", "fa50", 100, "mg", "IV", "infusao_volume", { durationMinutes: 120 })], runUntilSeconds: 5200, expect: [{ condition: { ruleFired: "r-ddimero" }, description: "D-dímero desnecessário" }, { condition: PIORA, description: "alto risco" }, { condition: { ruleFired: "r-trombolise" }, description: "melhora com trombólise" }] },
    { id: "t-alternativa", kind: "alternative", description: "Heparina não fracionada", commands: [act(50, "o2_cateter", { fluxo: 3 }), act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(300, "heparina", "fa5000", 80, "UI/kg", "IV"), test(320, "angio_tc_torax")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-anticoag-hnf" }, description: "melhora" }] }
  ]
};
