import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const SONDA = { actionCompleted: "diurese_horaria" };
const SUSPENDE = { actionCompleted: "suspender_medicacao_desencadeante" };
const BENZO = { any: [{ drugGiven: "diazepam" }, { drugGiven: "midazolam" }] };

export const C103: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C103",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Idosa de 82 anos 'diferente' há dois dias: ora sonolenta, ora agitada à noite",
  teachingTitle: "Delirium no idoso — reconhecer início agudo e flutuação com desatenção, buscar causas (medicação anticolinérgica, retenção urinária, constipação, infecção), medidas não farmacológicas e evitar benzodiazepínicos e contenção",
  group: "Psiquiatria",
  specialties: ["Geriatria", "Psiquiatria", "Clínica médica"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Diferenciar delirium de demência pela história do familiar (início agudo, flutuação, desatenção)",
    "Buscar causas: revisar medicações (anticolinérgicos), retenção urinária, constipação, infecção, dor, desidratação, hipóxia",
    "Tratar a causa: sondagem de alívio, suspender o medicamento desencadeante",
    "Medidas não farmacológicas; evitar benzodiazepínicos e contenção",
    "Antipsicótico apenas se sofrimento/risco após falha da desescalada, em dose baixa e por pouco tempo"
  ],
  keywords: ["idosa", "confusa", "sonolenta", "agitada à noite", "diferente", "filha"],
  patient: {
    name: "Dona Aparecida Silva",
    ageYears: 82,
    sex: "feminino",
    weightKg: 56,
    heightCm: 152,
    visual: { ageGroup: "idoso", sex: "feminino", skinTone: 3, hairStyle: "curto", hairColor: "branco", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Idosa de 82 anos trazida pela filha: há 2 dias está 'diferente' — de dia cochila e não acompanha a conversa; à noite fica agitada, tenta sair de casa e não reconhece a filha. Antes cuidava da casa sozinha.",
  communication: "limitada",
  informants: [{ id: "filha", name: "Márcia (filha)", role: "Filha" }, { id: "paciente", name: "Dona Aparecida", role: "Paciente" }],
  history: [
    hi("h-basal", "evolucao", "Como ela era antes? Isso começou de repente? Varia ao longo do dia?", [{ source: "filha", text: "Era lúcida, fazia as contas da casa. Mudou de anteontem para cá. Tem horas que parece normal, depois fica perdida." }], ["antes", "repente", "varia", "dia", "normal"]),
    hi("h-medicacoes", "medicacoes", "Que remédios ela toma? Algum novo nas últimas semanas?", [{ source: "filha", text: "Losartana e sinvastatina. O médico passou oxibutinina há uma semana porque ela estava perdendo urina." }], ["remédios", "novo", "oxibutinina", "medicação"]),
    hi("h-urina", "alimentacao_eliminacoes", "Como estão a urina e o intestino? Está bebendo água?", [{ source: "filha", text: "Quase não urinou hoje e reclama da barriga. Não evacua há 4 dias. Bebe pouca água." }], ["urina", "xixi", "intestino", "evacua", "água"]),
    hi("h-infeccao", "sinais_alarme", "Teve febre, tosse, falta de ar, dor ao urinar, queda?", [{ source: "filha", text: "Sem febre medida, sem tosse. Não caiu." }], ["febre", "tosse", "queda", "dor ao urinar"]),
    hi("h-sentidos", "antecedentes", "Ela usa óculos ou aparelho auditivo? Tem demência diagnosticada?", [{ source: "filha", text: "Usa óculos e aparelho no ouvido, mas esqueceram em casa. Nunca teve diagnóstico de demência." }], ["óculos", "aparelho", "ouve", "demência"]),
    hi("h-paciente", "queixa", "Dona Aparecida, a senhora sabe onde estamos? Está sentindo alguma dor?", [{ source: "paciente", text: "...É a feira? ...A barriga... dói aqui embaixo." }], ["sabe onde", "dor", "aparecida"])
  ],
  initial: {
    vars: { hr: 98, sbp: 152, dbp: 84, rr: 18, spo2: 95, temp: 37.2, gcs: 14, pain: 5, glucose: 118, perfusion: 0.85, effort: 0.1, na: 137, creat: 1.3 },
    flags: { rhythm: "sinusal", agitation: true, posture: "sentado", painVisual: "moderada", speech: "palavras", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-abdome", "pelve", "palpacao", "Massa suprapúbica dolorosa e maciça à percussão (bexiga palpável, 'bexigoma').", { label: "Hipogástrio", better: [{ when: SONDA, text: "Hipogástrio flácido após sondagem." }] }),
    ex("e-abd2", "abdome_qie", "palpacao", "Fezes palpáveis em quadrante inferior esquerdo; ruídos hidroaéreos reduzidos.", { label: "Abdome (constipação)" }),
    ex("e-neuro", "neurologico", "inspecao", "Desatenta (não consegue dizer os meses de trás para frente), desorientada, sem déficit focal, sem rigidez de nuca.", { label: "Neurológico/atenção", better: [{ when: { ruleFired: "r-melhora" }, text: "Mais atenta, orientada parcialmente, reconhece a filha." }] }),
    ex("e-boca", "boca", "inspecao", "Mucosas secas.", { label: "Hidratação" }),
    ex("e-torax", "torax_anterior", "ausculta", "Murmúrio vesicular presente, sem estertores.", { sound: "murmurio_normal" }),
    ex("e-pele", "pele", "inspecao", "Pele íntegra, sem lesões por pressão; pele seca e quente.", { label: "Pele" })
  ],
  testResults: [
    { testId: "urina_tipo1", variants: [{ text: "Leucócitos 8/campo, nitrito negativo, sem bactérias abundantes (não sugere infecção)." }] },
    { testId: "eletrolitos", variants: [{ text: "Na 137, K 4,3." }] },
    { testId: "funcao_renal", variants: [{ when: SONDA, text: "Creatinina 1,3 (basal 0,9) — lesão pós-renal em resolução." }, { text: "Creatinina 1,3 (basal 0,9)." }] },
    { testId: "hemograma", variants: [{ text: "Leucócitos 8.900, Hb 12,4." }] },
    { testId: "pcr", variants: [{ text: "PCR 0,8 mg/dL." }] },
    { testId: "rx_torax", variants: [{ text: "Sem consolidações." }] }
  ],
  highlightedActions: ["rastreio_delirium", "medidas_nao_farmacologicas_delirium", "suspender_medicacao_desencadeante"],
  rules: [
    { id: "r-sondagem", description: "Sondagem vesical de alívio", priority: 30, when: SONDA, repeat: "once", effects: [trend("pain", 1, 300, "sv", 30), trend("hr", 84, 600, "sv", 30), trend("sbp", 136, 600, "sv", 30), staff("enfermagem", "Saíram 900 mL de urina; ela ficou bem mais tranquila.")] },
    { id: "r-melhora", description: "Causa tratada + medidas não farmacológicas", priority: 40, when: { all: [SONDA, SUSPENDE, { actionCompleted: "medidas_nao_farmacologicas_delirium" }] }, repeat: "once", effects: [trend("gcs", 15, 1800, "mel", 40), flag("agitation", false), flag("speech", "frases"), staff("acompanhante", "Ela me chamou pelo nome!"), outcome("melhora")] },
    { id: "r-benzo", description: "Benzodiazepínico no delirium", priority: 50, when: BENZO, repeat: "once", effects: [trend("gcs", 11, 600, "bz", 50), trend("spo2", 90, 600, "bz", 50), obs("Benzodiazepínico piora o delirium no idoso (exceto abstinência de álcool/benzodiazepínico)."), outcome("complicacao")] },
    { id: "r-contencao", description: "Contenção no delirium", priority: 45, when: { actionCompleted: "contencao_mecanica" }, repeat: "once", effects: [obs("Contenção física aumenta o risco e a persistência do delirium."), flag("agitation", true)] },
    { id: "r-piora", description: "Sem tratar a causa", priority: 20, when: { all: [{ time: "gte", seconds: 2400 }, { not: SONDA }] }, repeat: "once", effects: [trend("hr", 108, 900, "pio", 20), trend("pain", 7, 600, "pio", 20), staff("enfermagem", "Ela arrancou o acesso e tentou descer da maca."), outcome("piora")] },
    { id: "r-alta", description: "Alta sem resolver", priority: 55, when: { any: [{ path: "disposition", op: "eq", value: "alta_orientada" }, { path: "disposition", op: "eq", value: "alta_com_seguimento_ubs" }, { path: "disposition", op: "eq", value: "caps" }] }, repeat: "once", effects: [obs("Delirium é emergência clínica: exige identificação da causa e observação até melhora."), outcome("complicacao")] }
  ],
  diagnosis: { primary: "delirium", accepted: ["delirium"], differentials: ["retencao_urinaria", "itu_complicada", "avc_isquemico", "hipoglicemia", "episodio_depressivo"] },
  acceptedDestinations: ["internacao_enfermaria", "observacao"],
  outcomeNotes: "Delirium hipoativo/hiperativo misto por retenção urinária e constipação induzidas por anticolinérgico (oxibutinina), com desidratação e déficit sensorial. Avaliação estruturada, exame com palpação de bexiga, sondagem de alívio, suspensão da oxibutinina, tratamento da constipação e hidratação, óculos/aparelho auditivo e família presente, sem benzodiazepínico nem contenção; internação/observação.",
  scoring: [
    { id: "s-basal", domain: "historia", description: "Estado basal, início e flutuação", evidence: { kind: "historyAsked", items: ["h-basal"], minCount: 1 }, points: 8, severity: "critica", rationale: "Distingue delirium de demência." },
    { id: "s-rastreio", domain: "historia", description: "Avaliação estruturada (atenção)", evidence: { kind: "actionDone", anyOf: ["rastreio_delirium"] }, points: 8, severity: "critica", rationale: "Desatenção é o núcleo do delirium." },
    { id: "s-med", domain: "historia", description: "Revisão de medicações", evidence: { kind: "historyAsked", items: ["h-medicacoes"], minCount: 1 }, points: 8, severity: "critica", rationale: "Medicação nova anticolinérgica.", sourceIds: ["INT-NICE-DELIRIUM"] },
    { id: "s-elim", domain: "historia", description: "Eliminações, hidratação, sentidos, infecção", evidence: { kind: "historyAsked", items: ["h-urina", "h-sentidos", "h-infeccao"], minCount: 2 }, points: 6, severity: "importante", rationale: "Causas a buscar.", sourceIds: ["INT-NICE-DELIRIUM"] },
    { id: "s-exame", domain: "historia", description: "Bexiga, abdome, neurológico", evidence: { kind: "examDone", regions: ["pelve", "abdome_qie", "neurologico"], minCount: 2 }, points: 8, severity: "critica", rationale: "Bexigoma e fecaloma." },
    { id: "s-glic", domain: "exames", description: "Glicemia e SpO2", evidence: { kind: "actionDone", anyOf: ["glicemia_capilar", "monitorizar"] }, points: 4, severity: "importante", rationale: "Hipoglicemia, hipóxia." },
    { id: "s-labs", domain: "exames", description: "Urina, eletrólitos e função renal", evidence: { kind: "testOrdered", anyOf: ["urina_tipo1", "eletrolitos", "funcao_renal"] }, points: 6, severity: "importante", rationale: "Causas metabólicas e infecciosas." },
    { id: "s-sonda", domain: "tratamento", description: "Sondagem de alívio", evidence: { kind: "actionDone", anyOf: ["diurese_horaria"], withinSeconds: 2000 }, points: 14, severity: "critica", rationale: "Trata a causa." },
    { id: "s-suspende", domain: "tratamento", description: "Suspender oxibutinina", evidence: { kind: "actionDone", anyOf: ["suspender_medicacao_desencadeante"] }, points: 10, severity: "critica", rationale: "Anticolinérgico no idoso.", sourceIds: ["INT-NICE-DELIRIUM"] },
    { id: "s-naofarm", domain: "tratamento", description: "Medidas não farmacológicas", evidence: { kind: "actionDone", anyOf: ["medidas_nao_farmacologicas_delirium"] }, points: 10, severity: "critica", rationale: "Base do manejo.", sourceIds: ["INT-NICE-DELIRIUM"] },
    { id: "s-sem-benzo", domain: "tratamento", description: "Sem benzodiazepínico", evidence: { kind: "avoidDrug", anyOf: ["diazepam", "midazolam"] }, points: 6, severity: "importante", rationale: "Piora o delirium.", sourceIds: ["BR-ABP-AGITACAO-2019"] },
    { id: "s-benzo", domain: "tratamento", description: "Falha: benzodiazepínico", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-benzo" } }, points: 10, penalty: true, severity: "critica", rationale: "Iatrogenia." },
    { id: "s-contencao", domain: "tratamento", description: "Falha: contenção", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-contencao" } }, points: 6, penalty: true, severity: "importante", rationale: "Aumenta o delirium.", sourceIds: ["INT-NICE-DELIRIUM"] },
    { id: "s-dx", domain: "destino", description: "Delirium", evidence: { kind: "diagnosis", accepted: ["delirium"] }, points: 6, severity: "importante", rationale: "Síndrome com causa identificada." },
    { id: "s-destino", domain: "destino", description: "Internação/observação", evidence: { kind: "disposition", accepted: ["internacao_enfermaria", "observacao"] }, points: 6, severity: "importante", rationale: "Até melhora e causa resolvida." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Ela era lúcida há 3 dias: demência ou outra coisa?" },
      { level: 2, text: "O que mudou na lista de remédios?" },
      { level: 3, text: "Palpe o hipogástrio." },
      { level: 4, text: "Sugestão explícita: avaliação de atenção, revisão de medicações, exame da bexiga, sondagem de alívio, suspender oxibutinina, medidas não farmacológicas, sem benzodiazepínico, internar." }
    ],
    summary: "Delirium por retenção urinária e constipação induzidas por anticolinérgico em idosa.",
    pathophysiology: "Idosos têm baixa reserva cognitiva e colinérgica; anticolinérgicos causam confusão diretamente e indiretamente (retenção urinária, constipação). Dor, desidratação, privação sensorial e de sono somam-se. O delirium aumenta mortalidade, institucionalização e declínio cognitivo.",
    keyPoints: [
      "Início agudo + flutuação + desatenção = delirium até prova em contrário.",
      "Revisar medicações (anticolinérgicos, benzodiazepínicos, opioides) e buscar retenção, constipação, infecção, dor, desidratação, hipóxia.",
      "Medidas não farmacológicas: reorientação, óculos/aparelho auditivo, família, sono, hidratação, mobilização.",
      "Evitar contenção e benzodiazepínicos.",
      "Haloperidol só em sofrimento/risco, dose baixa e por ≤ 1 semana; evitar em Parkinson/Lewy."
    ],
    alternatives: ["Haloperidol em dose baixa se agitação com risco após falha das medidas não farmacológicas.", "Tratamento da constipação (laxativo) após sondagem."],
    oralRubric: [
      { id: "o1", concept: "Critérios", synonyms: ["agudo", "flutuação", "desatenção", "cam"], weight: 3 },
      { id: "o2", concept: "Causa", synonyms: ["oxibutinina", "anticolinérgico", "retenção", "bexiga", "constipação"], weight: 3 },
      { id: "o3", concept: "Não farmacológico", synonyms: ["reorientação", "óculos", "família", "sono"], weight: 2 },
      { id: "o4", concept: "Evitar benzodiazepínico/contenção", synonyms: ["benzodiazepínico", "contenção"], weight: 2 }
    ],
    simplifications: ["Sondagem representada pela ação de sonda vesical.", "Laxativos não modelados."]
  },
  references: ["INT-NICE-DELIRIUM", "BR-ABP-AGITACAO-2019", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 6, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "História com filha, avaliação de atenção, medicações, exame, glicemia, sondagem, suspender, medidas, exames, internação", commands: [ask(10, "h-basal"), ask(20, "h-medicacoes"), ask(30, "h-urina"), ask(40, "h-sentidos"), act(50, "rastreio_delirium"), act(240, "glicemia_capilar"), { atSeconds: 290, type: "examine", payload: { region: "pelve", maneuver: "palpacao" } }, { atSeconds: 300, type: "examine", payload: { region: "neurologico", maneuver: "inspecao" } }, act(320, "diurese_horaria"), act(640, "suspender_medicacao_desencadeante"), act(770, "medidas_nao_farmacologicas_delirium"), test(800, "urina_tipo1"), test(810, "funcao_renal"), dx(1500, "delirium"), dest(2400, "internacao_enfermaria")], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-melhora" }, description: "melhora" }, { condition: { not: { ruleFired: "r-benzo" } }, description: "sem benzodiazepínico" }, { condition: { not: { ruleFired: "r-piora" } }, description: "sem piora" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-piora" }, description: "piora" }] },
    { id: "t-inadequada", kind: "inadequate", description: "'Demência agitada': contenção, diazepam e alta", commands: [act(30, "contencao_mecanica"), act(220, "acesso_venoso"), rx(330, "diazepam", "amp10", 5, "mg", "IV"), dest(1800, "alta_orientada")], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-contencao" }, description: "contenção" }, { condition: { ruleFired: "r-benzo" }, description: "benzodiazepínico" }, { condition: { ruleFired: "r-alta" }, description: "alta indevida" }] },
    { id: "t-atraso", kind: "delay", description: "Sondagem tardia", commands: [ask(10, "h-basal"), act(60, "rastreio_delirium"), act(2500, "diurese_horaria"), act(2900, "suspender_medicacao_desencadeante"), act(3000, "medidas_nao_farmacologicas_delirium"), dest(4200, "internacao_enfermaria")], runUntilSeconds: 4800, expect: [{ condition: { ruleFired: "r-piora" }, description: "piora" }, { condition: { ruleFired: "r-melhora" }, description: "melhora tardia" }] },
    { id: "t-alternativa", kind: "alternative", description: "Medidas primeiro; haloperidol em dose baixa pela agitação; observação", commands: [act(10, "medidas_nao_farmacologicas_delirium"), ask(310, "h-medicacoes"), act(320, "suspender_medicacao_desencadeante"), { atSeconds: 450, type: "examine", payload: { region: "pelve", maneuver: "palpacao" } }, act(460, "diurese_horaria"), rx(800, "haloperidol", "amp5", 0.5, "mg", "IM"), dest(2400, "observacao")], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-melhora" }, description: "melhora" }, { condition: { not: { ruleFired: "r-benzo" } }, description: "sem benzodiazepínico" }] }
  ]
};
