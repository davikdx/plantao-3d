import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, trend } from "./helpers";

const TQ = { actionCompleted: "torniquete" };
const COMPRESSAO = { actionCompleted: "compressao_sangramento" };
const CRISTALOIDE_EXCESSO = { any: [{ drugGiven: "sf09", minTotal: { value: 2000, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 2000, unit: "mL" as const } }] };

export const C045: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C045",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Jovem com ferimento na coxa que não para de sangrar",
  teachingTitle: "Lesão arterial de membro por arma branca — compressão, torniquete, reanimação restritiva e transferência regulada",
  group: "Trauma",
  specialties: ["Trauma", "Cirurgia vascular", "Emergência"],
  environment: "emergencia",
  resourceProfile: "upa-porte-ii",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Priorizar o controle da hemorragia externa grave (X do XABCDE) antes da via aérea",
    "Usar compressão direta e torniquete quando a compressão não controla",
    "Evitar cristaloide liberal; usar ácido tranexâmico até 3 h",
    "Acionar a regulação para transferência a serviço com cirurgia vascular e hemocomponentes"
  ],
  keywords: ["facada", "coxa", "sangramento", "ferimento", "perna"],
  patient: {
    name: "Wesley Santos",
    ageYears: 27,
    sex: "masculino",
    weightKg: 70,
    heightCm: 174,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 4, hairStyle: "crespo_curto", hairColor: "preto", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "UPA 24 h porte II (sem banco de sangue e sem cirurgia). Jovem de 27 anos chega carregado por amigos, com um pano encharcado amarrado na coxa direita. Ferimento por faca há cerca de 15 minutos. Sangue escorrendo pela maca.",
  communication: "normal",
  informants: [{ id: "amigo", name: "Amigo", role: "Acompanhante" }],
  history: [
    hi("h-mecanismo", "inicio", "O que aconteceu? Há quanto tempo?", [{ source: "paciente", text: "Me furaram com uma faca na coxa… uns quinze minutos." }, { source: "amigo", text: "Jorrava sangue, a gente amarrou o pano e veio correndo." }], ["aconteceu", "faca", "tempo", "quando"]),
    h("h-outros", "fatores_associados", "Tem outro ferimento? Bateu a cabeça?", "Não, só a perna.", { keywords: ["outro", "ferimento", "cabeça"] }),
    h("h-sensibilidade", "sinais_alarme", "Sente o pé? Consegue mexer?", "Tá formigando… mexo pouco.", { keywords: ["sente", "pé", "mexer", "formigamento"] }),
    h("h-ample", "antecedentes", "Tem doença, alergia, usa remédio? Vacina de tétano em dia?", "Nada. Vacina não sei.", { keywords: ["doença", "alergia", "remédio", "tétano", "vacina"] })
  ],
  initial: {
    vars: { hr: 126, sbp: 94, dbp: 58, rr: 24, spo2: 97, temp: 36.2, gcs: 15, pain: 9, glucose: 130, perfusion: 0.45, effort: 0.35, hb: 11.0, plt: 230000, inr: 1.1, lactate: 3.8, be: -6, ph: 7.31, hco3: 19, bleeding: 85 },
    flags: { rhythm: "taquicardia_sinusal", pallor: true, sweating: true, posture: "supino", painVisual: "intensa", speech: "frases", consciousness: "alerta", agitation: true },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-ferida", "membro_inferior_d", "inspecao", "Ferimento perfurocortante de 3 cm na face medial do terço médio da coxa direita com sangramento pulsátil vermelho-vivo; pano encharcado não contém.", { label: "Ferimento (X)", better: [{ when: TQ, text: "Torniquete na raiz da coxa, sangramento cessado. Horário de aplicação anotado." }, { when: COMPRESSAO, text: "Compressão direta firme: o sangramento diminui, mas o curativo volta a encharcar." }] }),
    ex("e-pulsos", "membro_inferior_d", "palpacao", "Pulso pedioso direito ausente, pé direito mais frio; esquerdo normal.", { label: "Pulsos distais" }),
    ex("e-via-aerea", "boca", "inspecao", "Via aérea pérvia, fala frases.", { label: "Via aérea (A)" }),
    ex("e-torax", "torax_anterior", "ausculta", "Murmúrio presente bilateralmente.", { sound: "murmurio_normal", label: "Tórax (B)" }),
    ex("e-geral", "geral", "inspecao", "Pálido, sudoreico, ansioso.", { better: [{ when: { ruleFired: "r-choque-grave" }, text: "Sonolento, pele fria e pegajosa." }] }),
    ex("e-pele", "pele", "inspecao", "Sem outras lesões após exposição completa (dorso e axilas inspecionados).", { label: "Exposição (E)" })
  ],
  testResults: [],
  highlightedActions: ["compressao_sangramento", "torniquete", "acesso_venoso", "monitorizar", "acionar_samu"],
  rules: [
    { id: "r-sangramento", description: "Sangramento arterial ativo", priority: 10, when: { always: true }, repeat: "once", effects: [trend("sbp", 50, 1100, "hem", 10), trend("dbp", 30, 1100, "hem", 10), trend("hr", 150, 900, "hem", 10), trend("hb", 6.5, 1800, "hem", 10), trend("perfusion", 0.15, 1100, "hem", 10), trend("lactate", 8, 1800, "hem", 10)] },
    { id: "r-compressao", description: "Compressão direta: reduz, mas não controla o sangramento arterial", priority: 30, when: { all: [COMPRESSAO, { not: TQ }] }, repeat: "once", effects: [trend("sbp", 82, 600, "comp", 30, 1500), trend("hr", 132, 600, "comp", 30, 1500), staff("enfermagem", "Estou comprimindo forte, mas o curativo está encharcando de novo.")] },
    { id: "r-torniquete", description: "Torniquete: hemorragia controlada", priority: 50, when: TQ, repeat: "once", effects: [trend("sbp", 100, 400, "tq", 50), trend("dbp", 62, 400, "tq", 50), trend("hr", 108, 400, "tq", 50), trend("perfusion", 0.6, 400, "tq", 50), trend("lactate", 3.0, 1500, "tq", 50), trend("hb", 9.4, 900, "tq", 50), flag("agitation", false), staff("enfermagem", "Parou de sangrar. Anotei o horário do torniquete: não afrouxar."), outcome("estabilizacao_parcial")] },
    { id: "r-diluicao", description: "Cristaloide ≥ 2 L sem controle: diluição e ressangramento", priority: 60, when: CRISTALOIDE_EXCESSO, repeat: "once", effects: [trend("inr", 1.8, 900, "dil", 60), trend("temp", 35.0, 900, "dil", 60), trend("hb", 6.0, 900, "dil", 60), obs("Cristaloide em grande volume: PA sobe transitoriamente e o sangramento aumenta (diluição, hipotermia)."), outcome("complicacao")] },
    { id: "r-regulacao", description: "Regulação: vaga em hospital com cirurgia vascular", priority: 20, when: { actionCompleted: "acionar_samu" }, repeat: "once", effects: [staff("regulacao", "Regulação: vaga zero no hospital de referência (cirurgia vascular e banco de sangue). USA a caminho; mantenham o torniquete e enviem o horário de aplicação.")] },
    { id: "r-choque-grave", description: "Sem torniquete em 15 min: choque grave", priority: 35, when: { all: [{ time: "gte", seconds: 900 }, { not: TQ }] }, repeat: "once", effects: [trend("sbp", 60, 300, "grave", 35), trend("gcs", 12, 300, "grave", 35), flag("consciousness", "voz"), flag("speech", "palavras"), staff("enfermagem", "Ele está apagando, a pressão está muito baixa!"), outcome("piora")] },
    { id: "r-pcr", description: "Exsanguinação sem controle (sem compressão em 25 min ou sem torniquete em 45 min)", priority: 100, when: { any: [{ all: [{ time: "gte", seconds: 1500 }, { not: TQ }, { not: COMPRESSAO }] }, { all: [{ time: "gte", seconds: 2700 }, { not: TQ }] }] }, repeat: "once", effects: [flag("pulse", false), { type: "setValue", var: "sbp", value: 0 }, { type: "setValue", var: "dbp", value: 0 }, flag("consciousness", "irresponsivo"), staff("enfermagem", "Parou! Sem pulso!"), outcome("parada", true)] }
  ],
  diagnosis: { primary: "lesao_arterial_membro", accepted: ["lesao_arterial_membro", "choque_hipovolemico"], differentials: ["fratura_femur", "trombose_venosa_profunda", "choque_septico"] },
  acceptedDestinations: ["transferencia_regulada"],
  outcomeNotes: "Ferimento por arma branca com lesão arterial femoral (sangramento pulsátil, pulso distal ausente) e choque classe II–III. Controle imediato com compressão e torniquete, cristaloide restrito, ácido tranexâmico e transferência regulada para cirurgia vascular. Atualizar profilaxia do tétano no hospital de destino.",
  scoring: [
    { id: "s-tq-precoce", domain: "priorizacao", description: "Controle da hemorragia (compressão ou torniquete) em até 2 min", evidence: { kind: "actionDone", anyOf: ["compressao_sangramento", "torniquete"], withinSeconds: 120 }, points: 12, severity: "critica", rationale: "No XABCDE, hemorragia exsanguinante vem antes da via aérea.", sourceIds: ["INT-EUR-SANGRAMENTO-2023", "BR-SAMU-SAV"] },
    { id: "s-tq", domain: "tratamento", description: "Torniquete em até 5 min", evidence: { kind: "actionDone", anyOf: ["torniquete"], withinSeconds: 300 }, points: 14, severity: "critica", rationale: "Sangramento arterial de membro não controlado pela compressão.", sourceIds: ["INT-EUR-SANGRAMENTO-2023"] },
    { id: "s-hist", domain: "historia", description: "Mecanismo, horário e outros ferimentos", evidence: { kind: "historyAsked", items: ["h-mecanismo", "h-outros"], minCount: 2 }, points: 4, severity: "importante", rationale: "Excluir outras lesões penetrantes; tempo para ácido tranexâmico." },
    { id: "s-exame", domain: "historia", description: "Examinou ferimento, pulsos distais e exposição completa", evidence: { kind: "examDone", regions: ["membro_inferior_d", "pele"], minCount: 2 }, points: 6, severity: "importante", rationale: "Sinais maiores de lesão vascular; ferimentos ocultos." },
    { id: "s-acesso", domain: "priorizacao", description: "Acesso venoso/IO e monitorização", evidence: { kind: "actionDone", anyOf: ["acesso_venoso", "acesso_io"], withinSeconds: 420 }, points: 6, severity: "importante", rationale: "Reposição e medicações." },
    { id: "s-atx", domain: "tratamento", description: "Ácido tranexâmico até 3 h", evidence: { kind: "drugGiven", anyOf: ["acido_tranexamico"] }, points: 6, severity: "importante", rationale: "Reduz mortalidade por sangramento quando precoce.", sourceIds: ["INT-EUR-SANGRAMENTO-2023", "INT-CRASH2"] },
    { id: "s-cristaloide", domain: "tratamento", description: "Falha: cristaloide liberal (≥ 2 L)", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-diluicao" } }, points: 10, penalty: true, severity: "critica", rationale: "Hipotensão permissiva até o controle cirúrgico.", sourceIds: ["INT-EUR-SANGRAMENTO-2023"] },
    { id: "s-aquecer", domain: "tratamento", description: "Prevenção de hipotermia", evidence: { kind: "actionDone", anyOf: ["aquecimento"] }, points: 3, severity: "menor", rationale: "Hipotermia agrava coagulopatia." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou PA e ferimento após o torniquete", evidence: { kind: "reassessAfter", after: ["torniquete"], reassess: ["medir_pa", "monitorizar", "membro_inferior_d"], withinSeconds: 600 }, points: 8, severity: "importante", rationale: "Confirmar cessação do sangramento e resposta hemodinâmica." },
    { id: "s-regulacao", domain: "destino", description: "Acionou a regulação", evidence: { kind: "actionDone", anyOf: ["acionar_samu"], withinSeconds: 1200 }, points: 10, severity: "critica", rationale: "UPA sem cirurgia vascular nem hemocomponentes.", sourceIds: ["BR-UPA", "BR-SAMU"] },
    { id: "s-dx", domain: "destino", description: "Lesão arterial de membro", evidence: { kind: "diagnosis", accepted: ["lesao_arterial_membro"] }, points: 5, severity: "importante", rationale: "Sangramento pulsátil e pulso distal ausente." },
    { id: "s-destino", domain: "destino", description: "Transferência regulada", evidence: { kind: "disposition", accepted: ["transferencia_regulada"] }, points: 6, severity: "critica", rationale: "Revascularização/controle cirúrgico." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "O que mata primeiro este paciente?" },
      { level: 2, text: "X antes do A: hemorragia exsanguinante." },
      { level: 3, text: "Se a compressão não segura um sangramento arterial de membro, há uma ferramenta mais eficaz." },
      { level: 4, text: "Sugestão explícita: compressão imediata, torniquete na raiz da coxa, acesso, ácido tranexâmico, aquecer, regulação." }
    ],
    summary: "Jovem de 27 anos com facada na coxa direita, sangramento pulsátil e pulso pedioso ausente (lesão de artéria femoral superficial), em choque.",
    pathophysiology: "A lesão arterial de membro pode exsanguinar em minutos. O torniquete ocluí o fluxo arterial proximal; a isquemia do membro é tolerada por algumas horas, o que dá tempo para a transferência e a revascularização. Cristaloide em excesso dilui fatores e aumenta o sangramento.",
    keyPoints: [
      "Hemorragia exsanguinante externa: X antes de A.",
      "Compressão direta; se não controlar sangramento de membro, torniquete proximal.",
      "Anotar o horário; não afrouxar o torniquete para 'ver se parou'.",
      "Hipotensão permissiva e ácido tranexâmico até 3 h.",
      "UPA estabiliza e regula; o controle definitivo é cirúrgico."
    ],
    alternatives: ["Tamponamento da ferida com gaze (hemostática, se houver) em ferimentos juncionais onde o torniquete não cabe.", "Acesso intraósseo se acesso venoso difícil."],
    oralRubric: [
      { id: "o1", concept: "X antes do A", synonyms: ["xabcde", "hemorragia", "sangramento primeiro"], weight: 2 },
      { id: "o2", concept: "Torniquete", synonyms: ["torniquete", "garrote"], weight: 3 },
      { id: "o3", concept: "Hipotensão permissiva", synonyms: ["hipotensão permissiva", "cristaloide restrito"], weight: 2 },
      { id: "o4", concept: "Regulação", synonyms: ["regulação", "transferência", "samu", "vascular"], weight: 2 }
    ],
    simplifications: ["Profilaxia do tétano não é feita na UPA deste perfil (sem sala de vacina); registrada para o destino.", "A isquemia do membro pelo torniquete não é modelada.", "PCR por exsanguinação em tempos fixos é decisão didática."]
  },
  references: ["INT-EUR-SANGRAMENTO-2023", "INT-CRASH2", "BR-SAMU-SAV", "BR-UPA", "BR-SAMU", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 20, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Compressão, torniquete, acesso, ATX, aquecimento, regulação", commands: [act(10, "compressao_sangramento"), { atSeconds: 20, type: "examine", payload: { region: "membro_inferior_d", maneuver: "inspecao" } }, act(50, "torniquete"), act(90, "monitorizar"), ask(100, "h-mecanismo"), ask(110, "h-outros"), act(120, "acesso_venoso"), { atSeconds: 230, type: "examine", payload: { region: "membro_inferior_d", maneuver: "palpacao" } }, { atSeconds: 240, type: "examine", payload: { region: "pele", maneuver: "inspecao" } }, rx(260, "acido_tranexamico", "amp250", 1000, "mg", "IV"), act(280, "aquecimento"), act(300, "medir_pa"), act(360, "acionar_samu"), dx(600, "lesao_arterial_membro"), dest(700, "transferencia_regulada")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-torniquete" }, description: "hemorragia controlada" }, { condition: { not: { ruleFired: "r-choque-grave" } }, description: "sem choque grave" }, { condition: { path: "vars.sbp", op: "gte", value: 90 }, description: "PAS ≥ 90" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 1800, expect: [{ condition: { ruleFired: "r-choque-grave" }, description: "choque grave" }, { condition: { ruleFired: "r-pcr" }, description: "PCR" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Só cristaloide liberal, sem controle do sangramento", commands: [act(30, "acesso_venoso"), act(130, "acesso_venoso"), rx(200, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 10 }), rx(500, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 10 })], runUntilSeconds: 1800, expect: [{ condition: { ruleFired: "r-diluicao" }, description: "diluição" }, { condition: { ruleFired: "r-pcr" }, description: "PCR" }] },
    { id: "t-atraso", kind: "delay", description: "Só compressão; torniquete aos 20 min", commands: [act(60, "compressao_sangramento"), act(1200, "torniquete")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-choque-grave" }, description: "choque grave pelo atraso" }, { condition: { ruleFired: "r-torniquete" }, description: "controle tardio" }, { condition: { not: { ruleFired: "r-pcr" } }, description: "PCR evitada" }] },
    { id: "t-alternativa", kind: "alternative", description: "Torniquete imediato, acesso IO, regulação", commands: [act(10, "torniquete"), act(60, "acesso_io"), act(200, "acionar_samu"), dest(600, "transferencia_regulada")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-torniquete" }, description: "hemorragia controlada" }, { condition: { ruleFired: "r-regulacao" }, description: "regulação acionada" }] }
  ]
};
