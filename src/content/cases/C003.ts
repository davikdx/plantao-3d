import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const SANGUE = { drugGiven: "concentrado_hemacias" };
const CRISTALOIDE = { any: [{ drugGiven: "sf09", minTotal: { value: 500, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 500, unit: "mL" as const } }] };
const CRISTALOIDE_EXCESSO = { any: [{ drugGiven: "sf09", minTotal: { value: 3000, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 3000, unit: "mL" as const } }] };
const REPOSICAO = { any: [SANGUE, CRISTALOIDE] };

export const C003: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C003",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Vômito com sangue e fezes pretas, tontura ao levantar",
  teachingTitle: "Hemorragia digestiva alta não varicosa com instabilidade — reposição, IBP, transfusão e endoscopia via regulação",
  group: "Reanimação, instabilidade e choque",
  specialties: ["Gastroenterologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Reconhecer hemorragia digestiva alta com repercussão hemodinâmica",
    "Obter dois acessos calibrosos e repor volume sem atrasos",
    "Indicar transfusão com critério e IBP",
    "Pesquisar uso de AINE/antitrombóticos e sinais de hepatopatia",
    "Garantir endoscopia em até 24 h (mais cedo se instável), via regulação quando indisponível"
  ],
  keywords: ["vômito com sangue", "fezes pretas", "melena", "tontura", "estômago"],
  patient: {
    name: "Osvaldo Martins",
    ageYears: 64,
    sex: "masculino",
    weightKg: 70,
    heightCm: 169,
    visual: { ageGroup: "idoso", sex: "masculino", skinTone: 2, hairStyle: "curto", hairColor: "grisalho", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional (banco de sangue disponível; sem endoscopista de plantão hoje). Homem de 64 anos com fezes pretas há 2 dias e, hoje, dois vômitos com sangue vivo e coágulos. Ao levantar no banheiro, quase desmaiou.",
  communication: "normal",
  informants: [{ id: "esposa", name: "Cida", role: "Esposa" }],
  history: [
    h("h-queixa", "queixa", "O que aconteceu?", "Vomitei sangue duas vezes hoje, e o cocô está preto há dois dias.", { keywords: ["aconteceu"] }),
    h("h-aine", "medicacoes", "Que remédios usa? Anti-inflamatório, AAS, anticoagulante?", "Tomo diclofenaco quase todo dia pela coluna, há um mês. E AAS 100 que o cardiologista passou.", { keywords: ["remédio", "anti-inflamatório", "aas", "anticoagulante", "diclofenaco"] }),
    h("h-dor", "localizacao", "Tinha dor no estômago antes?", "Uma queimação na boca do estômago há semanas.", { keywords: ["dor", "estômago", "queimação"] }),
    h("h-figado", "antecedentes", "Bebe álcool? Tem doença no fígado?", "Bebo cerveja no fim de semana. Nunca falaram de fígado.", { keywords: ["álcool", "bebe", "fígado", "cirrose"] }),
    h("h-sincope", "sinais_alarme", "Desmaiou ou ficou tonto?", "Quase desmaiei ao levantar.", { keywords: ["desmaio", "tonto"] }),
    hi("h-cardio", "antecedentes", "Tem doença do coração?", [{ source: "esposa", text: "Fez um cateterismo há 3 anos, colocou stent." }], ["coração", "stent", "infarto"]),
    h("h-alergias", "alergias", "Tem alergia?", "Não.")
  ],
  initial: {
    vars: { hr: 122, sbp: 92, dbp: 58, rr: 22, spo2: 96, temp: 36.2, gcs: 15, pain: 3, glucose: 118, perfusion: 0.5, effort: 0.3, hb: 7.4, ht: 23, plt: 248000, inr: 1.1, urea: 98, creat: 1.1, lactate: 3.0, urine: 20 },
    flags: { rhythm: "taquicardia_sinusal", pallor: true, sweating: true, posture: "supino", painVisual: "leve", speech: "frases", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Pálido +++, sudoreico; sem icterícia, sem ascite, sem aranhas vasculares.", { better: [{ when: { ruleFired: "r-choque" }, text: "Sonolento, frio, pálido." }] }),
    ex("e-abdome", "abdome_epigastrio", "palpacao", "Dor leve em epigástrio, sem peritonismo; sem hepatoesplenomegalia.", {}),
    ex("e-toque", "pelve", "especial", "Toque retal: fezes enegrecidas, pastosas e fétidas (melena).", { label: "Toque retal" }),
    ex("e-pulso", "membro_superior_d", "palpacao", "Pulso fino 122 bpm; enchimento capilar 4 s.", { label: "Perfusão" })
  ],
  testResults: [
    { testId: "ecg12", variants: [{ text: "Taquicardia sinusal 122 bpm; infradesnivelamento difuso discreto (provável isquemia por demanda).", ecg: { rhythm: "taquicardia_sinusal", rate: 122, stElevationLeads: [], stDepressionLeads: ["V4", "V5", "V6"], peakedT: false, wideQrs: false } }] }
  ],
  highlightedActions: ["acesso_venoso", "monitorizar", "jejum_cabeceira", "acionar_samu"],
  rules: [
    { id: "r-sangramento", description: "Sangramento ativo: piora sem reposição", priority: 10, when: { always: true }, repeat: "once", effects: [trend("sbp", 68, 2400, "hem", 10), trend("dbp", 40, 2400, "hem", 10), trend("hr", 138, 2000, "hem", 10), trend("hb", 5.8, 3600, "hem", 10), trend("perfusion", 0.3, 2400, "hem", 10)] },
    { id: "r-cristaloide", description: "Cristaloide: melhora transitória", priority: 25, when: CRISTALOIDE, repeat: "once", effects: [trend("sbp", 102, 300, "cri", 25, 1800), trend("hr", 112, 300, "cri", 25, 1800)] },
    { id: "r-transfusao", description: "Concentrado de hemácias: estabilização até a endoscopia", priority: 50, when: SANGUE, repeat: "once", effects: [trend("sbp", 108, 600, "tx", 50), trend("dbp", 64, 600, "tx", 50), trend("hr", 100, 600, "tx", 50), trend("hb", 8.4, 900, "tx", 50), trend("perfusion", 0.65, 600, "tx", 50), outcome("estabilizacao_parcial")] },
    { id: "r-ibp", description: "IBP registrado", when: { drugGiven: "omeprazol" }, repeat: "once", effects: [obs("IBP IV iniciado: reduz estigmas de sangramento antes da endoscopia; não substitui a endoscopia.")] },
    { id: "r-excesso", description: "Cristaloide em excesso", priority: 60, when: CRISTALOIDE_EXCESSO, repeat: "once", effects: [trend("hb", 5.6, 900, "dil", 60), trend("inr", 1.6, 900, "dil", 60), obs("Volume excessivo de cristaloide: diluição e piora do sangramento."), outcome("complicacao")] },
    { id: "r-choque", description: "Sem reposição em 20 min: choque", priority: 30, when: { all: [{ time: "gte", seconds: 1200 }, { not: REPOSICAO }] }, repeat: "once", effects: [trend("sbp", 66, 300, "choque", 30), flag("consciousness", "voz"), staff("enfermagem", "Ele vomitou mais sangue e está sonolento!"), outcome("piora")] },
    { id: "r-pcr", description: "Sem reposição em 50 min: PCR", priority: 100, when: { all: [{ time: "gte", seconds: 3000 }, { not: REPOSICAO }] }, repeat: "once", effects: [flag("pulse", false), { type: "setValue", var: "sbp", value: 0 }, { type: "setValue", var: "dbp", value: 0 }, flag("consciousness", "irresponsivo"), outcome("parada", true)] },
    { id: "r-regulacao", description: "Regulação para endoscopia", when: { actionCompleted: "acionar_samu" }, repeat: "once", effects: [staff("regulacao", "Regulação: hospital de referência com endoscopia de urgência aceita; transporte em USA após estabilização inicial.")] }
  ],
  diagnosis: { primary: "hda", accepted: ["hda", "choque_hipovolemico"], differentials: ["choque_hipovolemico", "iamssst", "pancreatite", "gastroenterite"] },
  acceptedDestinations: ["transferencia_regulada", "uti"],
  outcomeNotes: "HDA com repercussão (Glasgow-Blatchford alto): dois acessos, reposição, transfusão (Hb < 7, ou < 8 em coronariopata, ou instabilidade), IBP IV, suspender AINE, e endoscopia — sem endoscopista no hospital, via regulação. Excesso de cristaloide piora a coagulação.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Pesquisou AINE/antitrombóticos e hepatopatia", evidence: { kind: "historyAsked", items: ["h-aine", "h-figado"], minCount: 2 }, points: 8, severity: "critica", rationale: "Diferencia péptica de varicosa e orienta conduta.", sourceIds: ["INT-ACG-HDA-2021"] },
    { id: "s-cardio", domain: "historia", description: "Coronariopatia (limiar transfusional)", evidence: { kind: "historyAsked", items: ["h-cardio", "h-sincope"], minCount: 1 }, points: 4, severity: "importante", rationale: "Coronariopatas podem exigir limiar transfusional maior." },
    { id: "s-toque", domain: "historia", description: "Exame com toque retal e sinais de hepatopatia", evidence: { kind: "examDone", regions: ["pelve", "geral"], minCount: 2 }, points: 4, severity: "importante", rationale: "Confirma melena; estigmas de cirrose mudam a conduta." },
    { id: "s-acesso", domain: "priorizacao", description: "Dois acessos calibrosos em até 5 min", evidence: { kind: "actionDone", anyOf: ["acesso_venoso"], withinSeconds: 300 }, points: 8, severity: "critica", rationale: "Instabilidade hemodinâmica." },
    { id: "s-monitor", domain: "priorizacao", description: "Monitorização e jejum", evidence: { kind: "actionDone", anyOf: ["monitorizar", "jejum_cabeceira"], withinSeconds: 300 }, points: 4, severity: "importante", rationale: "Risco de aspiração e instabilidade." },
    { id: "s-exames", domain: "exames", description: "Hemograma, coagulação, ureia e tipagem", evidence: { kind: "testOrdered", anyOf: ["hemograma", "coagulograma", "funcao_renal"] }, points: 8, severity: "importante", rationale: "Escore de Glasgow-Blatchford e transfusão." },
    { id: "s-exames-exc", domain: "exames", description: "Exames dirigidos", evidence: { kind: "testsNotExcessive", maxUnjustified: 1, justified: ["hemograma", "coagulograma", "funcao_renal", "eletrolitos", "ecg12", "troponina", "gaso_venosa", "hepatograma"] }, points: 4, severity: "menor", rationale: "ECG/troponina pela coronariopatia." },
    { id: "s-sangue", domain: "tratamento", description: "Transfusão de hemácias", evidence: { kind: "drugGiven", anyOf: ["concentrado_hemacias"], withinSeconds: 1800 }, points: 10, severity: "critica", rationale: "Hb 7,4 com instabilidade e coronariopatia.", sourceIds: ["INT-ACG-HDA-2021"] },
    { id: "s-ibp", domain: "tratamento", description: "IBP IV", evidence: { kind: "drugGiven", anyOf: ["omeprazol"] }, points: 6, severity: "importante", rationale: "Antes e após a endoscopia.", sourceIds: ["INT-ACG-HDA-2021"] },
    { id: "s-excesso", domain: "tratamento", description: "Falha: cristaloide em excesso", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-excesso" } }, points: 6, penalty: true, severity: "importante", rationale: "Diluição e coagulopatia." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou PA/Hb após transfusão", evidence: { kind: "reassessAfter", after: ["concentrado_hemacias"], reassess: ["medir_pa", "hemograma"], withinSeconds: 1800 }, points: 10, severity: "importante", rationale: "Resposta à reposição." },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de HDA", evidence: { kind: "diagnosis", accepted: ["hda", "choque_hipovolemico"] }, points: 4, severity: "importante", rationale: "Hematêmese e melena." },
    { id: "s-destino", domain: "destino", description: "Regulação para endoscopia", evidence: { kind: "disposition", accepted: ["transferencia_regulada", "uti"] }, points: 10, severity: "critica", rationale: "Endoscopia indisponível no hospital: regular; UTI se instabilidade persistir.", sourceIds: ["BR-SAMU"] }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Quanto sangue ele perdeu, pelos sinais vitais?" },
      { level: 2, text: "Que remédios lesam o estômago?" },
      { level: 3, text: "Tem sinais de cirrose? Isso mudaria a conduta." },
      { level: 4, text: "Sugestão explícita: 2 acessos, cristaloide inicial, hemácias, omeprazol IV, suspender AINE/AAS (discutir), regulação para endoscopia." }
    ],
    summary: "Homem de 64 anos coronariopata, em uso de diclofenaco e AAS, com hematêmese e melena, taquicardia, hipotensão relativa e Hb 7,4.",
    pathophysiology: "AINE e AAS inibem prostaglandinas protetoras da mucosa gástrica, levando a úlcera péptica que erode um vaso. A perda de volume causa taquicardia e hipotensão; a ureia sobe pela digestão do sangue.",
    keyPoints: [
      "Estimar gravidade pelos sinais vitais e estratificar (Glasgow-Blatchford).",
      "Dois acessos, reposição, transfusão restritiva com ajuste para coronariopatia/instabilidade.",
      "IBP IV; endoscopia em até 24 h (mais cedo se instável).",
      "Suspeita de varizes: vasoativo (terlipressina) e antibiótico.",
      "Rever AINE e antitrombóticos."
    ],
    alternatives: ["Pantoprazol/esomeprazol IV (não modelados)."],
    oralRubric: [
      { id: "o1", concept: "Reposição", synonyms: ["acesso", "volume", "cristaloide"], weight: 2 },
      { id: "o2", concept: "Transfusão", synonyms: ["hemácias", "transfusão", "sangue"], weight: 2 },
      { id: "o3", concept: "IBP", synonyms: ["omeprazol", "ibp", "pantoprazol"], weight: 2 },
      { id: "o4", concept: "Endoscopia", synonyms: ["endoscopia", "eda", "regulação"], weight: 3 }
    ],
    simplifications: ["Sangramento modelado como tendência contínua até a endoscopia.", "Tempos de choque e PCR são didáticos."]
  },
  references: ["INT-ACG-HDA-2021", "BR-SAMU", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Acessos, cristaloide, omeprazol, hemácias e regulação", commands: [ask(10, "h-aine"), ask(20, "h-figado"), act(30, "monitorizar"), act(40, "acesso_venoso"), act(140, "acesso_venoso"), test(150, "hemograma"), test(160, "coagulograma"), rx(200, "ringer_lactato", "bolsa500", 500, "mL", "IV", "infusao_volume", { durationMinutes: 15 }), rx(300, "omeprazol", "fa40", 80, "mg", "IV"), rx(400, "concentrado_hemacias", "unidade", 300, "mL", "IV", "infusao_volume", { durationMinutes: 20 }), act(420, "acionar_samu"), act(430, "jejum_cabeceira"), act(2000, "medir_pa"), dx(3000, "hda"), dest(3000, "transferencia_regulada")], runUntilSeconds: 3200, expect: [{ condition: { ruleFired: "r-transfusao" }, description: "estabilização" }, { condition: { not: { ruleFired: "r-choque" } }, description: "sem choque" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 3200, expect: [{ condition: { ruleFired: "r-choque" }, description: "choque" }, { condition: { ruleFired: "r-pcr" }, description: "PCR" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Grande volume de cristaloide sem sangue", commands: [act(40, "acesso_venoso"), act(140, "acesso_venoso"), rx(200, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 10 }), rx(220, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 10 }), rx(900, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 10 })], runUntilSeconds: 2000, expect: [{ condition: { ruleFired: "r-excesso" }, description: "diluição" }] },
    { id: "t-atraso", kind: "delay", description: "Reposição só aos 25 min", commands: [act(40, "acesso_venoso"), act(140, "acesso_venoso"), rx(1500, "ringer_lactato", "bolsa500", 500, "mL", "IV", "infusao_volume", { durationMinutes: 15 })], runUntilSeconds: 3200, expect: [{ condition: { ruleFired: "r-choque" }, description: "choque" }, { condition: { not: { ruleFired: "r-pcr" } }, description: "PCR evitada" }] },
    { id: "t-alternativa", kind: "alternative", description: "Hemácias direto, omeprazol e regulação", commands: [act(40, "acesso_venoso"), act(140, "acesso_venoso"), test(150, "hemograma"), rx(300, "concentrado_hemacias", "unidade", 300, "mL", "IV", "infusao_volume", { durationMinutes: 20 }), rx(320, "omeprazol", "fa40", 80, "mg", "IV"), act(400, "acionar_samu"), act(1800, "medir_pa"), dest(2000, "transferencia_regulada")], runUntilSeconds: 2500, expect: [{ condition: { ruleFired: "r-transfusao" }, description: "estabilização" }, { condition: { not: { ruleFired: "r-choque" } }, description: "sem choque" }] }
  ]
};
