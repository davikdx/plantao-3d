import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const POSTERIOR = { actionCompleted: "tamponamento_nasal_posterior" };
const VOLUME = { any: [{ drugGiven: "sf09", minTotal: { value: 500, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 500, unit: "mL" as const } }] };

export const C116: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C116",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Idoso anticoagulado sangrando pelo nariz há 2 horas, cuspindo sangue",
  teachingTitle: "Epistaxe persistente com repercussão — medidas iniciais, rinoscopia, reconhecer sangramento posterior, tamponamento anterior e posterior, avaliação hemodinâmica e de anticoagulação, internação monitorizada",
  group: "Outras urgências",
  specialties: ["Otorrinolaringologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Avaliar via aérea e hemodinâmica; posicionar sentado inclinado para frente",
    "Compressão com vasoconstritor por 20 min e rinoscopia anterior",
    "Reconhecer sangramento posterior (falha das medidas, bilateral, escorrendo pela orofaringe)",
    "Tamponamento anterior e, se necessário, posterior; acesso, hemograma, coagulograma, tipagem",
    "Internar com monitorização após tamponamento posterior; acionar otorrinolaringologia"
  ],
  keywords: ["sangue no nariz", "nariz", "cuspindo sangue", "idoso", "anticoagulante", "tontura"],
  patient: {
    name: "Sr. Osvaldo Martins",
    ageYears: 72,
    sex: "masculino",
    weightKg: 74,
    heightCm: 168,
    visual: { ageGroup: "idoso", sex: "masculino", skinTone: 2, hairStyle: "careca", hairColor: "branco", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Homem de 72 anos, com fibrilação atrial em uso de varfarina e hipertenso, sangrando pelo nariz há 2 horas. A esposa apertou o nariz em casa, sem sucesso. Ele cospe sangue e diz que está tonto.",
  communication: "normal",
  informants: [{ id: "paciente", name: "Sr. Osvaldo", role: "Paciente" }, { id: "esposa", name: "Dona Célia", role: "Esposa" }],
  history: [
    hi("h-sangramento", "inicio", "De que lado sangra? Escorre para a garganta? Quanto tempo apertaram?", [{ source: "paciente", text: "Começou na esquerda, agora sai dos dois lados e escorre muito pela garganta." }, { source: "esposa", text: "Apertei uns 5 minutos e soltava para ver." }], ["lado", "garganta", "apertaram", "tempo"]),
    hi("h-medicacoes", "medicacoes", "Que remédios usa? Anticoagulante, AAS, anti-inflamatório? Último exame de INR?", [{ source: "paciente", text: "Varfarina, losartana e tomei ibuprofeno ontem para dor no joelho. O INR do mês passado deu 2,6." }], ["remédios", "varfarina", "aas", "anti-inflamatório", "inr"]),
    hi("h-sintomas", "sinais_alarme", "Tem tontura ao levantar, falta de ar, dor no peito, desmaio?", [{ source: "paciente", text: "Tonto ao levantar. Sem dor no peito." }], ["tontura", "falta de ar", "peito", "desmaio"]),
    hi("h-previos", "antecedentes", "Já teve sangramentos assim? Trauma no nariz? Tumor, cirurgia nasal?", [{ source: "paciente", text: "Pequenos às vezes, que paravam. Nunca trauma nem cirurgia." }], ["antes", "trauma", "cirurgia", "tumor"])
  ],
  initial: {
    vars: { hr: 112, sbp: 168, dbp: 94, rr: 20, spo2: 96, temp: 36.4, gcs: 15, pain: 3, glucose: 118, perfusion: 0.75, effort: 0.2, hb: 10.2, inr: 2.9, plt: 210000 },
    flags: { rhythm: "fa", bleedingVisible: true, posture: "sentado", painVisual: "leve", speech: "frases", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-orofaringe", "boca", "inspecao", "Sangue escorrendo continuamente pela parede posterior da orofaringe; coágulos.", { label: "Orofaringe", better: [{ when: POSTERIOR, text: "Sem sangue escorrendo na orofaringe após tamponamento posterior." }] }),
    ex("e-nariz", "cabeca", "especial", "Rinoscopia anterior: sangramento bilateral, sem ponto anterior identificável no plexo de Kiesselbach; fossa nasal posterior com fluxo contínuo.", { label: "Rinoscopia" }),
    ex("e-coracao", "coracao", "ausculta", "Ritmo irregular (FA), sem sopros.", { sound: "bulhas_normais" })
  ],
  testResults: [
    { testId: "hemograma", variants: [{ text: "Hb 10,2 (basal 13,5 há 3 meses); plaquetas 210.000." }] },
    { testId: "coagulograma", variants: [{ text: "INR 2,9 (faixa terapêutica alta)." }] },
    { testId: "ecg12", variants: [{ text: "FA com resposta ventricular 112 bpm; sem isquemia aguda." }] }
  ],
  highlightedActions: ["compressao_nasal", "rinoscopia_anterior", "tamponamento_nasal_anterior", "tamponamento_nasal_posterior"],
  rules: [
    { id: "r-compressao", description: "Compressão adequada não controla (posterior)", priority: 20, when: { actionCompleted: "compressao_nasal" }, repeat: "once", effects: [staff("enfermagem", "Após 20 minutos de compressão com vasoconstritor, continua escorrendo sangue pela garganta.")] },
    { id: "r-anterior", description: "Tamponamento anterior insuficiente", priority: 25, when: { all: [{ actionCompleted: "tamponamento_nasal_anterior" }, { not: POSTERIOR }] }, repeat: "once", effects: [staff("enfermagem", "Tampão anterior bilateral colocado, mas ele continua cuspindo sangue vivo.")] },
    { id: "r-posterior", description: "Tamponamento posterior controla", priority: 40, when: POSTERIOR, repeat: "once", effects: [trend("hr", 94, 900, "post", 40), flag("bleedingVisible", false), staff("supervisor", "Sangramento controlado com balão posterior + anterior: internar com monitorização e acionar otorrinolaringologia."), outcome("estabilizacao_parcial")] },
    { id: "r-volume", description: "Reposição", priority: 30, when: VOLUME, repeat: "once", effects: [trend("sbp", 128, 900, "vol", 30), trend("hr", 100, 900, "vol", 30)] },
    { id: "r-instabilidade", description: "Sem controle: repercussão hemodinâmica", priority: 35, when: { all: [{ time: "gte", seconds: 2700 }, { not: POSTERIOR }] }, repeat: "once", effects: [trend("sbp", 94, 900, "inst", 35), trend("hr", 126, 900, "inst", 35), trend("hb", 8.4, 1800, "inst", 35), staff("enfermagem", "Ele ficou pálido e a pressão caiu para 94!"), outcome("piora")] },
    { id: "r-alta", description: "Alta", priority: 50, when: { any: [{ path: "disposition", op: "eq", value: "alta_orientada" }, { path: "disposition", op: "eq", value: "alta_com_seguimento_ubs" }] }, repeat: "once", effects: [obs("Sangramento posterior com repercussão e anticoagulação: internação monitorizada."), outcome("complicacao")] }
  ],
  diagnosis: { primary: "epistaxe_posterior", accepted: ["epistaxe_posterior"], differentials: ["epistaxe_anterior", "hda_varicosa", "urgencia_hipertensiva_lesao"] },
  acceptedDestinations: ["internacao_enfermaria", "transferencia_regulada"],
  outcomeNotes: "Epistaxe posterior em idoso anticoagulado (varfarina, INR 2,9) com uso de AINE, queda de Hb e taquicardia. Posição, EPI, compressão com vasoconstritor por 20 min, rinoscopia, tamponamento anterior (falha) e posterior, acesso, hemograma/coagulograma/tipagem, reposição se necessário, suspender AINE, discutir anticoagulação com cardiologia, internação monitorizada e otorrinolaringologia.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Lado, escorrimento posterior e compressão prévia", evidence: { kind: "historyAsked", items: ["h-sangramento"], minCount: 1 }, points: 8, severity: "critica", rationale: "Indícios de sangramento posterior.", sourceIds: ["INT-WIKEM-EPISTAXE-2026"] },
    { id: "s-med", domain: "historia", description: "Anticoagulante/AINE e INR", evidence: { kind: "historyAsked", items: ["h-medicacoes"], minCount: 1 }, points: 8, severity: "critica", rationale: "Fatores de sangramento." },
    { id: "s-comp", domain: "tratamento", description: "Compressão com vasoconstritor", evidence: { kind: "actionDone", anyOf: ["compressao_nasal"], withinSeconds: 600 }, points: 10, severity: "critica", rationale: "Primeira medida.", sourceIds: ["INT-WIKEM-EPISTAXE-2026"] },
    { id: "s-rino", domain: "exames", description: "Rinoscopia/orofaringe", evidence: { kind: "examDone", regions: ["cabeca", "boca"], minCount: 1 }, points: 8, severity: "importante", rationale: "Anterior × posterior." },
    { id: "s-acesso", domain: "priorizacao", description: "Acesso venoso e monitorização", evidence: { kind: "actionDone", anyOf: ["acesso_venoso"], withinSeconds: 900 }, points: 6, severity: "importante", rationale: "Repercussão hemodinâmica." },
    { id: "s-labs", domain: "exames", description: "Hemograma e coagulograma", evidence: { kind: "testOrdered", anyOf: ["hemograma", "coagulograma"] }, points: 8, severity: "importante", rationale: "Hb e INR." },
    { id: "s-posterior", domain: "tratamento", description: "Tamponamento posterior", evidence: { kind: "actionDone", anyOf: ["tamponamento_nasal_posterior"], withinSeconds: 2400 }, points: 22, severity: "critica", rationale: "Sangramento posterior.", sourceIds: ["INT-WIKEM-EPISTAXE-2026"] },
    { id: "s-anterior", domain: "tratamento", description: "Tamponamento anterior", evidence: { kind: "actionDone", anyOf: ["tamponamento_nasal_anterior"] }, points: 6, severity: "importante", rationale: "Sempre associado ao posterior." },
    { id: "s-instab", domain: "priorizacao", description: "Falha: repercussão por atraso", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-instabilidade" } }, points: 10, penalty: true, severity: "critica", rationale: "Controle tardio." },
    { id: "s-alta", domain: "destino", description: "Falha: alta", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-alta" } }, points: 12, penalty: true, severity: "critica", rationale: "Exige internação." },
    { id: "s-dx", domain: "destino", description: "Epistaxe posterior", evidence: { kind: "diagnosis", accepted: ["epistaxe_posterior"] }, points: 12, severity: "importante", rationale: "Falha das medidas anteriores, bilateral, orofaringe." },
    { id: "s-destino", domain: "destino", description: "Internação monitorizada (ou regulação para ORL)", evidence: { kind: "disposition", accepted: ["internacao_enfermaria", "transferencia_regulada"] }, points: 12, severity: "critica", rationale: "Risco vagal, arritmia, hipóxia.", sourceIds: ["INT-WIKEM-EPISTAXE-2026"] }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Sentar para frente e comprimir corretamente: por quanto tempo?" },
      { level: 2, text: "Sangra dos dois lados e escorre pela garganta: anterior ou posterior?" },
      { level: 3, text: "O tampão anterior resolveu?" },
      { level: 4, text: "Sugestão explícita: história, compressão 20 min, rinoscopia, acesso, hemograma/coagulograma, tamponamento anterior e posterior, internação." }
    ],
    summary: "Epistaxe posterior em idoso anticoagulado com AINE, com repercussão hemodinâmica.",
    pathophysiology: "Sangramentos posteriores originam-se de ramos da artéria esfenopalatina, de maior calibre, mais frequentes em idosos, hipertensos e anticoagulados; não respondem à compressão anterior e drenam para a faringe, subestimando a perda.",
    keyPoints: [
      "Compressão contínua ≥ 20 min com vasoconstritor, sentado inclinado para frente.",
      "~90% anteriores; posterior se falha, bilateral ou escorrendo pela garganta.",
      "Cauterização nunca bilateral no septo; tamponamento anterior se falha.",
      "Posterior: balão/Foley + anterior por 72–96 h, com internação monitorizada.",
      "Avaliar Hb, coagulação e medicações (AINE, anticoagulante)."
    ],
    alternatives: ["Ácido tranexâmico tópico como adjuvante (evidência limitada).", "Embolização/ligadura da esfenopalatina pela ORL se refratário."],
    oralRubric: [
      { id: "o1", concept: "Medidas iniciais", synonyms: ["compressão", "20 minutos", "vasoconstritor", "inclinado"], weight: 2 },
      { id: "o2", concept: "Posterior", synonyms: ["posterior", "garganta", "bilateral", "esfenopalatina"], weight: 3 },
      { id: "o3", concept: "Tamponamento", synonyms: ["tamponamento", "balão", "foley"], weight: 3 },
      { id: "o4", concept: "Anticoagulação/internação", synonyms: ["varfarina", "inr", "internar", "monitorizar"], weight: 2 }
    ],
    simplifications: ["Reversão da anticoagulação não modelada (decisão com cardiologia/hematologia).", "Cauterização não modelada (ponto não visível)."]
  },
  references: ["INT-WIKEM-EPISTAXE-2026", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 8, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "História, compressão, rinoscopia, acesso, exames, tampão anterior e posterior, internação", commands: [ask(10, "h-sangramento"), ask(20, "h-medicacoes"), act(30, "compressao_nasal"), act(40, "monitorizar"), act(50, "acesso_venoso"), test(160, "hemograma"), test(170, "coagulograma"), act(1240, "rinoscopia_anterior"), { atSeconds: 1430, type: "examine", payload: { region: "boca", maneuver: "inspecao" } }, act(1440, "tamponamento_nasal_anterior"), act(1750, "tamponamento_nasal_posterior"), dx(2400, "epistaxe_posterior"), dest(2600, "internacao_enfermaria")], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-posterior" }, description: "controle" }, { condition: { not: { ruleFired: "r-instabilidade" } }, description: "sem instabilidade" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-instabilidade" }, description: "instabilidade" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Só tampão anterior e alta", commands: [act(30, "tamponamento_nasal_anterior"), dest(1200, "alta_orientada")], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-anterior" }, description: "anterior insuficiente" }, { condition: { ruleFired: "r-alta" }, description: "alta" }, { condition: { ruleFired: "r-instabilidade" }, description: "instabilidade" }] },
    { id: "t-atraso", kind: "delay", description: "Posterior só após instabilidade; reposição; regulação", commands: [act(30, "compressao_nasal"), act(1300, "tamponamento_nasal_anterior"), act(1700, "acesso_venoso"), rx(2800, "sf09", "bolsa500", 500, "mL", "IV", "infusao_volume", { durationMinutes: 20 }), act(2900, "tamponamento_nasal_posterior"), dest(3800, "transferencia_regulada")], runUntilSeconds: 4200, expect: [{ condition: { ruleFired: "r-instabilidade" }, description: "instabilidade" }, { condition: { ruleFired: "r-posterior" }, description: "controle tardio" }] },
    { id: "t-alternativa", kind: "alternative", description: "Reconhece posterior pela orofaringe e vai direto ao tampão posterior", commands: [{ atSeconds: 10, type: "examine", payload: { region: "boca", maneuver: "inspecao" } }, act(20, "acesso_venoso"), act(120, "tamponamento_nasal_anterior"), act(430, "tamponamento_nasal_posterior"), test(1100, "hemograma"), dest(1500, "internacao_enfermaria")], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-posterior" }, description: "controle" }] }
  ]
};
