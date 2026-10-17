import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const SAMU = { actionCompleted: "acionar_samu" };

export const C106: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C106",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Senhora com pressão 210 por 125, dor de cabeça forte e vista embaçada na consulta da UBS",
  teachingTitle: "Pressão muito elevada com sinais de lesão aguda de órgão-alvo na APS — reconhecer emergência hipertensiva (encefalopatia), não reduzir a PA abruptamente por via oral, estabilizar e regular transferência",
  group: "Atenção primária",
  specialties: ["Medicina de família", "Cardiologia", "Emergência"],
  environment: "ubs",
  resourceProfile: "ubs-urbana",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Confirmar a medida e buscar ativamente sinais de lesão aguda de órgão-alvo (neurológica, cardíaca, visual, renal)",
    "Diferenciar emergência hipertensiva de elevação pressórica sem lesão aguda",
    "Excluir hipoglicemia e déficit focal (AVC)",
    "Não reduzir a PA de forma abrupta com medicação oral de ação rápida",
    "Acionar SAMU/regulação para tratamento IV monitorizado em hospital"
  ],
  keywords: ["pressão alta", "dor de cabeça", "vista embaçada", "consulta", "enjoo", "UBS"],
  patient: {
    name: "Maria das Graças Oliveira",
    ageYears: 61,
    sex: "feminino",
    weightKg: 82,
    heightCm: 158,
    visual: { ageGroup: "idoso", sex: "feminino", skinTone: 4, hairStyle: "coque", hairColor: "grisalho", build: "obeso", pregnancyTrimester: 0 }
  },
  briefing: "UBS, consulta de demanda espontânea. Mulher de 61 anos, hipertensa, parou a losartana há um mês ('acabou'). Desde ontem cefaleia intensa, náusea e hoje visão embaçada. Na triagem, PA 214/126 mmHg; o filho achou que ela está 'meio lenta'.",
  communication: "normal",
  informants: [{ id: "paciente", name: "Dona Maria das Graças", role: "Paciente" }, { id: "filho", name: "Paulo (filho)", role: "Filho" }],
  history: [
    hi("h-sintomas", "queixa", "Como é a dor de cabeça? Começou de repente? E a visão?", [{ source: "paciente", text: "Foi piorando desde ontem, a cabeça toda, latejando. Hoje a vista está embaçada e enjoei." }], ["dor de cabeça", "repente", "visão", "vista"]),
    hi("h-alarme", "sinais_alarme", "Teve fraqueza ou formigamento de um lado, fala enrolada, convulsão, dor no peito, falta de ar, dor nas costas?", [{ source: "paciente", text: "Não, nada disso." }, { source: "filho", text: "Ela está mais devagar para responder, confundiu o dia." }], ["fraqueza", "fala", "convulsão", "peito", "falta de ar", "costas"]),
    hi("h-medicacoes", "medicacoes", "Quais remédios usa? Parou algum?", [{ source: "paciente", text: "Losartana 50 mg duas vezes, mas acabou há um mês. Não usei mais nada." }], ["remédios", "losartana", "parou"]),
    hi("h-urina", "alimentacao_eliminacoes", "Está urinando normal? Urina espumosa ou com sangue?", [{ source: "paciente", text: "Normal." }], ["urina", "espuma", "sangue"]),
    hi("h-outros", "habitos", "Usou anti-inflamatório, descongestionante, cocaína, álcool em excesso?", [{ source: "paciente", text: "Não." }], ["anti-inflamatório", "descongestionante", "cocaína", "álcool"])
  ],
  initial: {
    vars: { hr: 88, sbp: 214, dbp: 126, rr: 18, spo2: 96, temp: 36.5, gcs: 14, pain: 8, glucose: 128, perfusion: 0.85, effort: 0.1 },
    flags: { rhythm: "sinusal", posture: "sentado", painVisual: "intensa", speech: "frases", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-neuro", "neurologico", "inspecao", "Sonolenta leve, desorientada no tempo; sem déficit motor focal, sem desvio de rima, fala sem disartria; sem rigidez de nuca.", { label: "Neurológico", better: [{ when: { ruleFired: "r-progressao" }, text: "Mais sonolenta, confusa; crise convulsiva presenciada." }] }),
    ex("e-olhos", "olhos", "inspecao", "Fundoscopia: hemorragias em chama de vela, exsudatos algodonosos e edema de papila bilateral.", { label: "Fundo de olho" }),
    ex("e-torax", "torax_anterior", "ausculta", "Murmúrio vesicular presente, sem estertores.", { sound: "murmurio_normal" }),
    ex("e-coracao", "coracao", "ausculta", "Ritmo regular, B4, sem sopros.", { sound: "bulhas_normais" }),
    ex("e-pulsos", "membro_superior_d", "palpacao", "Pulsos simétricos; PA semelhante nos dois braços (212/124 à esquerda).", { label: "Pulsos e PA bilateral" })
  ],
  testResults: [
    { testId: "ecg12", variants: [{ text: "Ritmo sinusal 88 bpm; sobrecarga ventricular esquerda com strain; sem supra de ST." }] },
    { testId: "urina_tipo1", variants: [{ text: "Proteína ++; hemácias 10/campo (resultado do laboratório municipal em outro dia)." }] }
  ],
  highlightedActions: ["medir_pa", "glicemia_capilar", "acionar_samu"],
  rules: [
    { id: "r-samu", description: "Regulação acionada", priority: 30, when: SAMU, repeat: "once", effects: [staff("regulacao", "Regulação: USA a caminho; vaga em sala vermelha do hospital de referência para tratamento IV monitorizado.")] },
    { id: "r-progressao", description: "Encefalopatia hipertensiva progride", priority: 20, when: { all: [{ time: "gte", seconds: 2100 }, { not: SAMU }] }, repeat: "once", effects: [trend("gcs", 11, 600, "enc", 20), trend("sbp", 228, 600, "enc", 20), flag("seizure", true), staff("enfermagem", "Ela está convulsionando na maca!"), outcome("piora")] },
    { id: "r-queda-abrupta", description: "Redução abrupta com nifedipino VO", priority: 40, when: { drugGiven: "nifedipino" }, repeat: "once", effects: [trend("sbp", 128, 900, "nife", 40), trend("dbp", 72, 900, "nife", 40), trend("gcs", 12, 1200, "nife", 40), obs("Queda rápida e incontrolável da PA (> 25% na primeira hora) causa hipoperfusão cerebral, coronariana e renal. Na emergência hipertensiva, reduzir de forma gradual com droga IV titulável e monitorização."), outcome("complicacao")] },
    { id: "r-alta", description: "Alta/retorno com ajuste oral", priority: 45, when: { any: [{ path: "disposition", op: "eq", value: "alta_orientada" }, { path: "disposition", op: "eq", value: "alta_com_seguimento_ubs" }, { path: "disposition", op: "eq", value: "retorno_programado" }] }, repeat: "once", effects: [obs("Sinais neurológicos e retinopatia grave indicam lesão aguda de órgão-alvo: emergência, não ajuste ambulatorial."), outcome("complicacao")] }
  ],
  diagnosis: { primary: "urgencia_hipertensiva_lesao", accepted: ["urgencia_hipertensiva_lesao"], differentials: ["pseudocrise_hipertensiva", "avc_hemorragico", "avc_isquemico", "hipoglicemia", "has_nao_controlada"] },
  acceptedDestinations: ["transferencia_regulada"],
  outcomeNotes: "Emergência hipertensiva com encefalopatia e retinopatia grave após suspensão do anti-hipertensivo. Na UBS: confirmar PA bilateral, exame neurológico e fundoscopia, glicemia, ECG, acesso, monitorização, sem redução abrupta oral, acionar SAMU/regulação para redução gradual com droga IV (PAM 20–25% na 1ª hora) em hospital.",
  scoring: [
    { id: "s-pa", domain: "priorizacao", description: "Confirmar PA (bilateral)", evidence: { kind: "actionDone", anyOf: ["medir_pa"], withinSeconds: 300 }, points: 6, severity: "importante", rationale: "Técnica e confirmação.", sourceIds: ["BR-SBC-HAS"] },
    { id: "s-hist", domain: "historia", description: "Sintomas e sinais de alarme", evidence: { kind: "historyAsked", items: ["h-sintomas", "h-alarme"], minCount: 2 }, points: 10, severity: "critica", rationale: "Buscar lesão de órgão-alvo." },
    { id: "s-med", domain: "historia", description: "Medicações/suspensão e substâncias", evidence: { kind: "historyAsked", items: ["h-medicacoes", "h-outros"], minCount: 1 }, points: 4, severity: "importante", rationale: "Causa da descompensação." },
    { id: "s-neuro", domain: "historia", description: "Exame neurológico e fundo de olho", evidence: { kind: "examDone", regions: ["neurologico", "olhos"], minCount: 2 }, points: 14, severity: "critica", rationale: "Encefalopatia e retinopatia grave." },
    { id: "s-cardio", domain: "historia", description: "Tórax, coração e pulsos", evidence: { kind: "examDone", regions: ["torax_anterior", "coracao", "membro_superior_d"], minCount: 2 }, points: 6, severity: "importante", rationale: "EAP, dissecção." },
    { id: "s-glic", domain: "exames", description: "Glicemia capilar", evidence: { kind: "actionDone", anyOf: ["glicemia_capilar"], withinSeconds: 900 }, points: 8, severity: "critica", rationale: "Hipoglicemia simula encefalopatia." },
    { id: "s-ecg", domain: "exames", description: "ECG", evidence: { kind: "testOrdered", anyOf: ["ecg12"], withinSeconds: 1200 }, points: 6, severity: "importante", rationale: "Isquemia/sobrecarga." },
    { id: "s-samu", domain: "destino", description: "Acionar SAMU/regulação", evidence: { kind: "actionDone", anyOf: ["acionar_samu"], withinSeconds: 1500 }, points: 18, severity: "critica", rationale: "Tratamento IV monitorizado." },
    { id: "s-sem-oral", domain: "tratamento", description: "Não reduziu abruptamente por via oral", evidence: { kind: "avoidDrug", anyOf: ["nifedipino"] }, points: 10, severity: "critica", rationale: "Redução gradual e controlada.", sourceIds: ["INT-EMDAILY-EMERGHIPER-2021"] },
    { id: "s-acesso", domain: "priorizacao", description: "Acesso e O2/monitor disponível", evidence: { kind: "actionDone", anyOf: ["acesso_venoso"] }, points: 4, severity: "importante", rationale: "Preparo para transporte." },
    { id: "s-progr", domain: "priorizacao", description: "Falha: convulsão por atraso", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-progressao" } }, points: 10, penalty: true, severity: "critica", rationale: "Regulação tardia." },
    { id: "s-queda", domain: "tratamento", description: "Falha: queda abrupta", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-queda-abrupta" } }, points: 10, penalty: true, severity: "critica", rationale: "Hipoperfusão.", sourceIds: ["INT-EMDAILY-EMERGHIPER-2021"] },
    { id: "s-dx", domain: "destino", description: "Emergência hipertensiva", evidence: { kind: "diagnosis", accepted: ["urgencia_hipertensiva_lesao"] }, points: 8, severity: "importante", rationale: "Lesão aguda de órgão-alvo." },
    { id: "s-destino", domain: "destino", description: "Transferência regulada", evidence: { kind: "disposition", accepted: ["transferencia_regulada"] }, points: 6, severity: "importante", rationale: "Hospital com droga IV e monitorização." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "O número da PA não basta: há lesão aguda de órgão-alvo?" },
      { level: 2, text: "Olhe o fundo de olho e faça exame neurológico." },
      { level: 3, text: "Por que não 'baixar a pressão' com comprimido aqui?" },
      { level: 4, text: "Sugestão explícita: confirmar PA, neurológico, fundoscopia, glicemia, ECG, acesso, acionar SAMU, transferência regulada." }
    ],
    summary: "Emergência hipertensiva (encefalopatia e retinopatia grave) após suspensão de anti-hipertensivo, atendida na UBS.",
    pathophysiology: "Elevação pressórica acima do limite de autorregulação cerebral causa hiperperfusão, quebra da barreira hematoencefálica e edema vasogênico (encefalopatia, PRES). Em hipertensos crônicos a curva de autorregulação está desviada para a direita: quedas abruptas causam isquemia.",
    keyPoints: [
      "Emergência = PA elevada + lesão aguda de órgão-alvo; sem lesão aguda: ajuste oral e seguimento.",
      "Buscar encefalopatia, AVC, SCA, EAP, dissecção, retinopatia grave, lesão renal.",
      "Encefalopatia: reduzir PAM 20–25% com droga IV titulável.",
      "Evitar quedas abruptas com medicação oral de ação rápida.",
      "Na APS: estabilizar, monitorizar e regular."
    ],
    alternatives: ["Se não houver lesão aguda: reintroduzir/ajustar anti-hipertensivo oral e reavaliar em poucos dias.", "Captopril ou anlodipino VO não são tratamento de emergência hipertensiva."],
    oralRubric: [
      { id: "o1", concept: "Lesão de órgão-alvo", synonyms: ["órgão-alvo", "encefalopatia", "fundo de olho", "papiledema"], weight: 3 },
      { id: "o2", concept: "Redução gradual", synonyms: ["25%", "gradual", "iv", "titulável"], weight: 3 },
      { id: "o3", concept: "Regulação", synonyms: ["samu", "regulação", "transferência"], weight: 2 },
      { id: "o4", concept: "Excluir hipoglicemia/AVC", synonyms: ["glicemia", "avc", "déficit focal"], weight: 2 }
    ],
    simplifications: ["Labetalol/nicardipina não disponíveis na UBS (tratamento no hospital de destino).", "Exame de urina com resultado em outro dia."]
  },
  references: ["INT-EMDAILY-EMERGHIPER-2021", "BR-SBC-HAS", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Confirma PA, história, neurológico, fundoscopia, glicemia, ECG, acesso, SAMU, transferência", commands: [act(10, "medir_pa"), ask(80, "h-sintomas"), ask(90, "h-alarme"), ask(100, "h-medicacoes"), { atSeconds: 110, type: "examine", payload: { region: "neurologico", maneuver: "inspecao" } }, { atSeconds: 120, type: "examine", payload: { region: "olhos", maneuver: "inspecao" } }, { atSeconds: 130, type: "examine", payload: { region: "torax_anterior", maneuver: "ausculta" } }, { atSeconds: 140, type: "examine", payload: { region: "membro_superior_d", maneuver: "palpacao" } }, act(150, "glicemia_capilar"), test(200, "ecg12"), act(300, "acesso_venoso"), act(400, "acionar_samu"), dx(600, "urgencia_hipertensiva_lesao"), dest(1500, "transferencia_regulada")], runUntilSeconds: 2700, expect: [{ condition: { ruleFired: "r-samu" }, description: "regulação" }, { condition: { not: { ruleFired: "r-progressao" } }, description: "sem convulsão" }, { condition: { not: { ruleFired: "r-queda-abrupta" } }, description: "sem queda abrupta" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 2700, expect: [{ condition: { ruleFired: "r-progressao" }, description: "convulsão" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Nifedipino VO 'para baixar' e retorno", commands: [act(10, "medir_pa"), rx(120, "nifedipino", "cp10", 10, "mg", "VO"), dest(1800, "retorno_programado")], runUntilSeconds: 2700, expect: [{ condition: { ruleFired: "r-queda-abrupta" }, description: "queda abrupta" }, { condition: { ruleFired: "r-alta" }, description: "sem transferência" }] },
    { id: "t-atraso", kind: "delay", description: "Regulação só após convulsão", commands: [act(10, "medir_pa"), act(300, "glicemia_capilar"), act(2200, "acesso_venoso"), act(2300, "acionar_samu"), dest(3000, "transferencia_regulada")], runUntilSeconds: 3400, expect: [{ condition: { ruleFired: "r-progressao" }, description: "convulsão" }, { condition: { ruleFired: "r-samu" }, description: "regulação tardia" }] },
    { id: "t-alternativa", kind: "alternative", description: "SAMU logo após identificar alteração neurológica", commands: [act(10, "medir_pa"), { atSeconds: 70, type: "examine", payload: { region: "neurologico", maneuver: "inspecao" } }, act(80, "glicemia_capilar"), act(130, "acionar_samu"), act(250, "acesso_venoso"), { atSeconds: 400, type: "examine", payload: { region: "olhos", maneuver: "inspecao" } }, dest(1200, "transferencia_regulada")], runUntilSeconds: 2700, expect: [{ condition: { ruleFired: "r-samu" }, description: "regulação" }, { condition: { not: { ruleFired: "r-progressao" } }, description: "sem convulsão" }] }
  ]
};
