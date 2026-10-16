import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, obs, outcome, rx, staff, test, trend } from "./helpers";

const REGULACAO = { actionCompleted: "acionar_samu" };

export const C032: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C032",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Tontura girando que não passa e não consegue andar",
  teachingTitle: "Síndrome vestibular aguda com sinais centrais — HINTS, ataxia e AVC de fossa posterior",
  group: "Neurologia",
  specialties: ["Neurologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 4,
  level: "residencia",
  objectives: [
    "Distinguir vertigem periférica de central à beira-leito (HINTS + marcha)",
    "Saber que TC normal não exclui AVC de fossa posterior",
    "Reconhecer fatores de risco vasculares e déficits associados",
    "Evitar alta com diagnóstico de 'labirintite' sem exame adequado",
    "Encaminhar para RM/neurologia e vigiar edema cerebelar"
  ],
  keywords: ["tontura", "vertigem", "girando", "vômito", "labirintite"],
  patient: {
    name: "Wilson Barreto",
    ageYears: 64,
    sex: "masculino",
    weightKg: 84,
    heightCm: 172,
    visual: { ageGroup: "idoso", sex: "masculino", skinTone: 3, hairStyle: "curto", hairColor: "grisalho", build: "robusto", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional (TC sim; ressonância só no hospital de referência). Homem de 64 anos, hipertenso e diabético, com vertigem rotatória contínua há 7 horas, vômitos e incapacidade de andar sozinho.",
  communication: "normal",
  history: [
    h("h-tontura", "queixa", "Como é a tontura? É contínua ou vem com movimentos?", "Tudo gira o tempo todo, mesmo parado. Piora um pouco ao mexer a cabeça.", { keywords: ["tontura", "contínua", "gira"] }),
    h("h-inicio", "inicio", "Começou como?", "De repente, ao acordar, há 7 horas.", { keywords: ["começou", "quando"] }),
    h("h-neuro", "sinais_alarme", "Teve visão dupla, fala enrolada, fraqueza, formigamento, dor no pescoço?", "Uma dor na nuca do lado direito desde ontem. A fala está normal, acho.", { keywords: ["visão dupla", "fala", "fraqueza", "nuca", "pescoço"] }),
    h("h-audicao", "fatores_associados", "Ouvido zumbindo ou perda de audição?", "Não.", { keywords: ["ouvido", "audição", "zumbido"] }),
    h("h-antecedentes", "antecedentes", "Que doenças tem? Fuma?", "Pressão alta, diabetes, colesterol. Fumo.", { keywords: ["doenças", "fuma"] }),
    h("h-alergias", "alergias", "Tem alergia?", "Não.")
  ],
  initial: {
    vars: { hr: 88, sbp: 168, dbp: 94, rr: 18, spo2: 97, temp: 36.5, gcs: 15, pain: 4, glucose: 196, perfusion: 0.85, effort: 0.2 },
    flags: { rhythm: "sinusal", posture: "decubito_lateral", painVisual: "moderada", speech: "frases", consciousness: "alerta", sweating: true },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-hints", "olhos", "especial", "HINTS: impulso cefálico NORMAL bilateralmente; nistagmo que muda de direção com o olhar; desvio vertical (skew) no teste de cobertura — padrão CENTRAL.", { label: "HINTS (impulso cefálico, nistagmo, skew)" }),
    ex("e-marcha", "neurologico", "especial", "Não consegue ficar sentado sem apoio (ataxia de tronco grau 3); dismetria leve à direita; força preservada.", { label: "Marcha, tronco e coordenação", better: [{ when: { ruleFired: "r-edema" }, text: "Sonolento; ataxia pior." }] }),
    ex("e-pescoco", "pescoco", "palpacao", "Dor à palpação cervical posterior direita; sem rigidez de nuca.", {}),
    ex("e-otoscopia", "cabeca", "inspecao", "Otoscopia normal; audição grosseiramente preservada.", { label: "Ouvidos" })
  ],
  testResults: [
    { testId: "tc_cranio", variants: [{ text: "Sem hemorragia; sem alterações isquêmicas evidentes (sensibilidade baixa para fossa posterior nas primeiras horas). (Laudo educativo.)" }] },
    { testId: "angio_tc_cranio", variants: [{ text: "Oclusão da artéria vertebral direita (V4) com suspeita de dissecção; artéria basilar pérvia. (Laudo educativo.)" }] },
    { testId: "ecg12", variants: [{ text: "Ritmo sinusal 88 bpm; sobrecarga ventricular esquerda.", ecg: { rhythm: "sinusal", rate: 88, stElevationLeads: [], stDepressionLeads: [], peakedT: false, wideQrs: false } }] }
  ],
  highlightedActions: ["glicemia_capilar", "monitorizar", "acesso_venoso", "acionar_samu"],
  rules: [
    { id: "r-antiemetico", description: "Antiemético alivia náusea", when: { any: [{ drugGiven: "ondansetrona" }, { drugGiven: "prometazina" }] }, repeat: "once", effects: [trend("pain", 3, 600, "ae", 30), obs("Náusea melhora; a ataxia permanece (sintoma central não responde a antiemético).")] },
    { id: "r-regulacao", description: "Regulação para RM e neurologia", when: REGULACAO, repeat: "once", effects: [staff("regulacao", "Regulação: neurologia do hospital de referência aceita suspeita de AVC de circulação posterior para RM e vigilância de edema cerebelar; USA em 30 min."), outcome("transferencia_segura")] },
    { id: "r-edema", description: "Sem encaminhamento em 2 h: edema cerebelar e rebaixamento", priority: 40, when: { all: [{ time: "gte", seconds: 7200 }, { not: REGULACAO }] }, repeat: "once", effects: [trend("gcs", 12, 900, "edema", 40), flag("consciousness", "voz"), staff("enfermagem", "Ele está mais sonolento e vomitou de novo."), outcome("piora")] },
    { id: "r-alteplase", description: "Trombolítico fora da janela (início ao acordar há 7 h)", priority: 80, when: { drugGiven: "alteplase" }, repeat: "once", effects: [trend("gcs", 9, 900, "hem", 80), obs("Trombólise fora da janela: transformação hemorrágica."), outcome("complicacao")] }
  ],
  diagnosis: { primary: "avc_circulacao_posterior", accepted: ["avc_circulacao_posterior", "avc_isquemico"], differentials: ["vertigem_periferica", "avc_hemorragico", "hipoglicemia", "enxaqueca"] },
  acceptedDestinations: ["transferencia_regulada"],
  outcomeNotes: "Síndrome vestibular aguda contínua com HINTS central (impulso cefálico normal, nistagmo que muda de direção, skew) e ataxia de tronco grave: AVC de fossa posterior até prova em contrário (provável dissecção vertebral). TC normal não exclui; angio-TC e RM; antiagregação conforme neurologia; vigiar edema cerebelar (neurocirurgia). Alta como 'labirintite' é erro grave.",
  scoring: [
    { id: "s-tontura", domain: "historia", description: "Caracterizou vertigem contínua e início", evidence: { kind: "historyAsked", items: ["h-tontura", "h-inicio"], minCount: 2 }, points: 6, severity: "importante", rationale: "Síndrome vestibular aguda contínua." },
    { id: "s-alarme", domain: "historia", description: "Sinais neurológicos associados e dor cervical", evidence: { kind: "historyAsked", items: ["h-neuro", "h-antecedentes"], minCount: 2 }, points: 6, severity: "critica", rationale: "Dor cervical sugere dissecção; fatores vasculares." },
    { id: "s-hints", domain: "historia", description: "Exame HINTS", evidence: { kind: "examDone", regions: ["olhos"], minCount: 1 }, points: 10, severity: "critica", rationale: "Mais sensível que a TC precoce para AVC na síndrome vestibular aguda.", sourceIds: ["INT-HINTS"] },
    { id: "s-marcha", domain: "historia", description: "Avaliou marcha/tronco", evidence: { kind: "examDone", regions: ["neurologico"], minCount: 1 }, points: 6, severity: "critica", rationale: "Ataxia grave é sinal central." },
    { id: "s-glicemia", domain: "priorizacao", description: "Glicemia capilar", evidence: { kind: "actionDone", anyOf: ["glicemia_capilar"], withinSeconds: 600 }, points: 3, severity: "importante", rationale: "Excluir hipo/hiperglicemia." },
    { id: "s-imagem", domain: "exames", description: "TC + angio-TC (sabendo da limitação)", evidence: { kind: "testOrdered", anyOf: ["angio_tc_cranio"] }, points: 10, severity: "importante", rationale: "Vasos vertebrobasilares; dissecção." },
    { id: "s-exames", domain: "exames", description: "Exames dirigidos", evidence: { kind: "testsNotExcessive", maxUnjustified: 1, justified: ["tc_cranio", "angio_tc_cranio", "ecg12", "hemograma", "coagulograma", "eletrolitos", "funcao_renal"] }, points: 4, severity: "menor", rationale: "RM é o exame de escolha (indisponível no local)." },
    { id: "s-sintomatico", domain: "tratamento", description: "Antiemético e hidratação", evidence: { kind: "drugGiven", anyOf: ["ondansetrona", "prometazina"] }, points: 4, severity: "importante", rationale: "Conforto e prevenção de aspiração." },
    { id: "s-sem-lise", domain: "tratamento", description: "Não trombolisou fora da janela", evidence: { kind: "avoidDrug", anyOf: ["alteplase", "tenecteplase"] }, points: 8, severity: "critica", rationale: "Início há 7 h (ao acordar)." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliação neurológica seriada", evidence: { kind: "actionDone", anyOf: ["avaliar_glasgow"] }, points: 9, severity: "importante", rationale: "Edema cerebelar pode exigir neurocirurgia." },
    { id: "s-dx", domain: "destino", description: "AVC de circulação posterior", evidence: { kind: "diagnosis", accepted: ["avc_circulacao_posterior", "avc_isquemico"] }, points: 8, severity: "critica", rationale: "HINTS central e ataxia." },
    { id: "s-destino", domain: "destino", description: "Transferência regulada (RM, neurologia)", evidence: { kind: "disposition", accepted: ["transferencia_regulada"] }, points: 10, severity: "critica", rationale: "Investigação e vigilância." },
    { id: "s-alta", domain: "destino", description: "Falha: alta como 'labirintite'", evidence: { kind: "disposition", accepted: ["alta_orientada", "alta_com_seguimento_ubs"] }, points: 12, penalty: true, severity: "critica", rationale: "AVC de fossa posterior não reconhecido." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Vertigem contínua há horas: periférica ou central?" },
      { level: 2, text: "Faça o HINTS e peça para ele sentar e andar." },
      { level: 3, text: "Impulso cefálico normal em vertigem aguda contínua é sinal de alarme." },
      { level: 4, text: "Sugestão explícita: HINTS, marcha, glicemia, TC/angio-TC, antiemético, regulação para RM/neurologia, vigiar rebaixamento." }
    ],
    summary: "Homem de 64 anos com fatores de risco vasculares, dor cervical, vertigem aguda contínua, HINTS central e ataxia de tronco: AVC de fossa posterior por provável dissecção vertebral.",
    pathophysiology: "Isquemia de cerebelo/tronco pode simular neurite vestibular. O impulso cefálico normal indica reflexo vestíbulo-ocular íntegro (lesão central). O infarto cerebelar extenso pode inchar e comprimir o tronco e o IV ventrículo, causando hidrocefalia e rebaixamento.",
    keyPoints: [
      "Síndrome vestibular aguda: HINTS + avaliação da marcha.",
      "Impulso cefálico normal, nistagmo direção-alternante e skew = central.",
      "TC normal não exclui; RM com difusão (pode ser falso-negativa nas primeiras 48 h).",
      "Dor cervical: pensar em dissecção.",
      "Vigiar edema cerebelar; não liberar como labirintite."
    ],
    alternatives: ["Trombólise se dentro da janela e sem contraindicações (não é o caso)."],
    oralRubric: [
      { id: "o1", concept: "HINTS", synonyms: ["hints", "impulso cefálico", "nistagmo", "skew"], weight: 3 },
      { id: "o2", concept: "Ataxia/marcha", synonyms: ["ataxia", "marcha", "tronco"], weight: 2 },
      { id: "o3", concept: "Limitação da TC", synonyms: ["tc normal", "ressonância", "rm"], weight: 2 },
      { id: "o4", concept: "Não dar alta", synonyms: ["labirintite", "alta", "central"], weight: 1 }
    ],
    simplifications: ["HINTS apresentado como um único exame.", "Edema cerebelar às 2 h é didático."]
  },
  references: ["INT-HINTS", "BR-PCDT-AVC", "INT-AHA-AVC-2019", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 10, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "HINTS, marcha, glicemia, TC/angio, antiemético e regulação", commands: [ask(10, "h-tontura"), ask(20, "h-neuro"), { atSeconds: 30, type: "examine", payload: { region: "olhos", maneuver: "especial" } }, { atSeconds: 60, type: "examine", payload: { region: "neurologico", maneuver: "especial" } }, act(90, "glicemia_capilar"), act(100, "acesso_venoso"), act(200, "acesso_venoso"), rx(220, "ondansetrona", "amp4", 4, "mg", "IV"), test(240, "tc_cranio"), test(250, "angio_tc_cranio"), act(2700, "acionar_samu"), act(2800, "avaliar_glasgow"), dx(3000, "avc_circulacao_posterior"), dest(3000, "transferencia_regulada")], runUntilSeconds: 3500, expect: [{ condition: { ruleFired: "r-regulacao" }, description: "transferência" }, { condition: { not: { ruleFired: "r-edema" } }, description: "sem rebaixamento" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 7400, expect: [{ condition: { ruleFired: "r-edema" }, description: "edema cerebelar" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Trata como labirintite e libera", commands: [act(100, "acesso_venoso"), act(200, "acesso_venoso"), rx(220, "prometazina", "amp25", 25, "mg", "IM"), dest(1800, "alta_orientada")], runUntilSeconds: 2000, expect: [{ condition: { ruleFired: "r-antiemetico" }, description: "só sintomático" }, { condition: { not: { ruleFired: "r-regulacao" } }, description: "sem investigação" }] },
    { id: "t-atraso", kind: "delay", description: "Regulação após rebaixamento", commands: [test(240, "tc_cranio"), act(7300, "acionar_samu")], runUntilSeconds: 7600, expect: [{ condition: { ruleFired: "r-edema" }, description: "piora" }, { condition: { ruleFired: "r-regulacao" }, description: "transferência tardia" }] },
    { id: "t-alternativa", kind: "alternative", description: "Regulação direta após HINTS central, sem angio local", commands: [{ atSeconds: 30, type: "examine", payload: { region: "olhos", maneuver: "especial" } }, act(90, "glicemia_capilar"), test(100, "tc_cranio"), act(2600, "acionar_samu"), dest(2700, "transferencia_regulada")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-regulacao" }, description: "transferência" }] }
  ]
};
