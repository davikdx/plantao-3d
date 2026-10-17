import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const REGULA = { actionCompleted: "acionar_samu" };
const ANALGESIA = { any: [{ drugGiven: "dipirona" }, { drugGiven: "morfina" }] };

export const C114: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C114",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Homem com dor lombar irradiando para as duas pernas que não consegue urinar direito",
  teachingTitle: "Síndrome da cauda equina — reconhecer sinais de alarme (ciatalgia bilateral, anestesia em sela, retenção urinária indolor, tônus anal), resíduo pós-miccional, RM de emergência e descompressão cirúrgica",
  group: "Outras urgências",
  specialties: ["Neurocirurgia", "Ortopedia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Perguntar ativamente sobre sintomas urinários, intestinais, sexuais e sensibilidade perineal em toda lombalgia",
    "Examinar sensibilidade em sela, tônus anal, força e reflexos de membros inferiores",
    "Medir volume residual pós-miccional e aliviar a retenção",
    "RM de emergência e avaliação de cirurgia de coluna — regular transferência se não houver RM",
    "Não dar alta com analgésico e 'repouso'"
  ],
  keywords: ["dor lombar", "ciático", "pernas", "urinar", "dormência", "costas"],
  patient: {
    name: "Edson Pereira",
    ageYears: 44,
    sex: "masculino",
    weightKg: 88,
    heightCm: 174,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 3, hairStyle: "curto", hairColor: "preto", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional (TC disponível; RM e cirurgia de coluna apenas no hospital de referência). Homem de 44 anos, motorista, com lombalgia crônica; há 2 dias piorou muito com dor nas duas pernas. Veio porque 'quer um remédio mais forte'.",
  communication: "normal",
  informants: [{ id: "paciente", name: "Edson", role: "Paciente" }],
  history: [
    hi("h-dor", "localizacao", "Para onde a dor irradia? Uma ou as duas pernas? Até abaixo do joelho?", [{ source: "paciente", text: "Desce pelas duas pernas, até a sola do pé. A esquerda está pior." }], ["irradia", "pernas", "joelho", "pé"]),
    hi("h-urina", "alimentacao_eliminacoes", "Está urinando normalmente? Sente quando a bexiga está cheia? Perdeu urina ou fezes?", [{ source: "paciente", text: "Desde ontem fico tentando e sai pouco, e não sinto direito a vontade. Fezes não perdi." }], ["urinar", "bexiga", "perdeu", "fezes", "xixi"]),
    hi("h-sela", "sinais_alarme", "Sente dormência entre as pernas, no ânus ou na região genital — por exemplo ao usar papel higiênico? Alteração na ereção?", [{ source: "paciente", text: "Agora que falou... está meio dormente quando limpo. E a ereção não está normal." }], ["dormência", "ânus", "genital", "papel", "ereção"]),
    hi("h-alarme2", "antecedentes", "Teve febre, perda de peso, câncer, trauma, uso de droga injetável ou corticoide?", [{ source: "paciente", text: "Nada disso. Carreguei peso na quinta-feira." }], ["febre", "peso", "câncer", "trauma", "droga"]),
    hi("h-fraqueza", "fatores_associados", "Está com fraqueza nas pernas? Tropeçando?", [{ source: "paciente", text: "A perna esquerda está fraca, o pé arrasta um pouco." }], ["fraqueza", "tropeçando", "arrasta"])
  ],
  initial: {
    vars: { hr: 92, sbp: 142, dbp: 86, rr: 16, spo2: 98, temp: 36.6, gcs: 15, pain: 8, glucose: 104, perfusion: 0.9, effort: 0.1 },
    flags: { rhythm: "sinusal", posture: "antalgica", painVisual: "intensa", speech: "frases", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-sela", "pelve", "especial", "Hipoestesia em sela (perineal e perianal) bilateral; tônus anal reduzido ao toque retal; contração voluntária fraca.", { label: "Sensibilidade em sela e toque retal" }),
    ex("e-mmii", "membro_inferior_e", "especial", "Força de flexão plantar e dorsiflexão grau 4 à esquerda e 4+ à direita; reflexos aquileus abolidos bilateralmente; Lasègue positivo bilateral.", { label: "Neurológico de membros inferiores" }),
    ex("e-abdome", "pelve", "palpacao", "Bexiga palpável até perto da cicatriz umbilical, pouco dolorosa.", { label: "Hipogástrio" }),
    ex("e-coluna", "torax_posterior", "palpacao", "Dor à palpação lombar baixa; sem febre, sem deformidade.", { label: "Coluna" })
  ],
  testResults: [],
  highlightedActions: ["volume_residual_pos_miccional", "diurese_horaria", "acionar_samu"],
  rules: [
    { id: "r-residuo", description: "Resíduo pós-miccional elevado", priority: 20, when: { actionCompleted: "volume_residual_pos_miccional" }, repeat: "once", effects: [staff("enfermagem", "Urinou 80 mL; resíduo pós-miccional de 750 mL.")] },
    { id: "r-sonda", description: "Alívio da retenção", priority: 25, when: { actionCompleted: "diurese_horaria" }, repeat: "once", effects: [trend("pain", 6, 600, "sv", 25), staff("enfermagem", "Saíram 800 mL pela sonda.")] },
    { id: "r-analgesia", description: "Analgesia", priority: 30, when: ANALGESIA, repeat: "once", effects: [trend("pain", 4, 900, "anal", 30)] },
    { id: "r-regulacao", description: "Regulação para RM e cirurgia de coluna", priority: 40, when: REGULA, repeat: "once", effects: [staff("regulacao", "Regulação: vaga no hospital de referência com RM de urgência e neurocirurgia de plantão; ambulância a caminho."), outcome("melhora")] },
    { id: "r-progressao", description: "Atraso: retenção com incontinência (CES-R)", priority: 35, when: { all: [{ time: "gte", seconds: 2400 }, { not: REGULA }] }, repeat: "once", effects: [staff("enfermagem", "Ele molhou a roupa sem perceber e a perna esquerda está mais fraca."), obs("Progressão para retenção com incontinência por transbordamento piora o prognóstico esfincteriano."), outcome("complicacao")] },
    { id: "r-alta", description: "Alta com analgésico", priority: 50, when: { any: [{ path: "disposition", op: "eq", value: "alta_orientada" }, { path: "disposition", op: "eq", value: "alta_com_seguimento_ubs" }, { path: "disposition", op: "eq", value: "encaminhamento_ambulatorial" }] }, repeat: "once", effects: [obs("Ciatalgia bilateral + anestesia em sela + retenção: síndrome da cauda equina até prova em contrário — RM de emergência."), outcome("complicacao")] }
  ],
  diagnosis: { primary: "sindrome_cauda_equina", accepted: ["sindrome_cauda_equina"], differentials: ["lombalgia_mecanica", "retencao_urinaria", "trauma_raquimedular", "avc_isquemico"] },
  acceptedDestinations: ["transferencia_regulada"],
  outcomeNotes: "Síndrome da cauda equina incompleta progredindo para retenção (provável hérnia discal lombar volumosa): ciatalgia bilateral, hipoestesia em sela, tônus anal reduzido, déficit motor, resíduo de 750 mL. Analgesia, sondagem, documentação do exame, regulação imediata para RM de emergência e descompressão cirúrgica no hospital de referência.",
  scoring: [
    { id: "s-urina", domain: "historia", description: "Sintomas urinários/intestinais", evidence: { kind: "historyAsked", items: ["h-urina"], minCount: 1 }, points: 10, severity: "critica", rationale: "Retenção indolor é sinal de alarme.", sourceIds: ["INT-AJEM-CES-2019"] },
    { id: "s-sela", domain: "historia", description: "Anestesia em sela e função sexual", evidence: { kind: "historyAsked", items: ["h-sela"], minCount: 1 }, points: 10, severity: "critica", rationale: "Sinal de alarme.", sourceIds: ["INT-AJEM-CES-2019"] },
    { id: "s-dor", domain: "historia", description: "Ciatalgia bilateral, fraqueza e outros alarmes", evidence: { kind: "historyAsked", items: ["h-dor", "h-fraqueza", "h-alarme2"], minCount: 2 }, points: 6, severity: "importante", rationale: "Bilateralidade e diferenciais (infecção, neoplasia)." },
    { id: "s-exame", domain: "historia", description: "Sensibilidade em sela/toque retal e neurológico de MMII", evidence: { kind: "examDone", regions: ["pelve", "membro_inferior_e"], minCount: 2 }, points: 14, severity: "critica", rationale: "Documentar déficits.", sourceIds: ["INT-AJEM-CES-2019"] },
    { id: "s-residuo", domain: "exames", description: "Resíduo pós-miccional", evidence: { kind: "actionDone", anyOf: ["volume_residual_pos_miccional"], withinSeconds: 1500 }, points: 10, severity: "critica", rationale: "Auxilia a avaliação.", sourceIds: ["INT-AJEM-CES-2019"] },
    { id: "s-sonda", domain: "tratamento", description: "Sondagem de alívio", evidence: { kind: "actionDone", anyOf: ["diurese_horaria"] }, points: 6, severity: "importante", rationale: "Retenção." },
    { id: "s-analgesia", domain: "tratamento", description: "Analgesia", evidence: { kind: "drugGiven", anyOf: ["dipirona", "morfina"] }, points: 4, severity: "importante", rationale: "Dor intensa." },
    { id: "s-regulacao", domain: "priorizacao", description: "Regulação imediata para RM e cirurgia de coluna", evidence: { kind: "actionDone", anyOf: ["acionar_samu"], withinSeconds: 1800 }, points: 22, severity: "critica", rationale: "RM em até 4 h; descompressão urgente.", sourceIds: ["INT-GIRFT-CES-2023"] },
    { id: "s-progr", domain: "priorizacao", description: "Falha: progressão por atraso", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-progressao" } }, points: 12, penalty: true, severity: "critica", rationale: "Pior prognóstico." },
    { id: "s-alta", domain: "destino", description: "Falha: alta", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-alta" } }, points: 15, penalty: true, severity: "critica", rationale: "Perda esfincteriana permanente." },
    { id: "s-dx", domain: "destino", description: "Síndrome da cauda equina", evidence: { kind: "diagnosis", accepted: ["sindrome_cauda_equina"] }, points: 10, severity: "critica", rationale: "Clínico; confirmar por RM." },
    { id: "s-destino", domain: "destino", description: "Transferência regulada", evidence: { kind: "disposition", accepted: ["transferencia_regulada"] }, points: 8, severity: "importante", rationale: "RM e cirurgia indisponíveis no local." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Lombalgia que irradia para as duas pernas: que perguntas não podem faltar?" },
      { level: 2, text: "Como está a urina? E a sensibilidade ao usar papel higiênico?" },
      { level: 3, text: "Examine sela e tônus anal; meça o resíduo pós-miccional." },
      { level: 4, text: "Sugestão explícita: história de alarme, exame em sela/toque retal, neurológico, resíduo, sonda, analgesia, regulação para RM e cirurgia." }
    ],
    summary: "Síndrome da cauda equina por compressão lombar com retenção urinária incipiente.",
    pathophysiology: "Compressão das raízes lombossacrais abaixo do cone medular (geralmente hérnia discal central volumosa L4–L5 ou L5–S1) causa radiculopatia bilateral, anestesia em sela e disfunção vesical, intestinal e sexual. A evolução para retenção com incontinência por transbordamento se associa a pior recuperação.",
    keyPoints: [
      "Perguntar sobre bexiga, intestino, função sexual e sensibilidade perineal em toda lombalgia.",
      "Sinais: ciatalgia bilateral, anestesia em sela, retenção indolor, perda de tônus anal.",
      "Resíduo pós-miccional ajuda; história e exame isolados têm baixa sensibilidade.",
      "RM de emergência (meta de até 4 h); mielotomografia se RM indisponível.",
      "Descompressão cirúrgica urgente; orientação de retorno aos pacientes com lombalgia."
    ],
    alternatives: ["Mielotomografia se RM indisponível e transferência impossível.", "Contato direto com a neurocirurgia de referência em paralelo à regulação."],
    oralRubric: [
      { id: "o1", concept: "Sinais de alarme", synonyms: ["sela", "retenção", "bilateral", "tônus anal"], weight: 3 },
      { id: "o2", concept: "Resíduo/toque retal", synonyms: ["resíduo", "toque retal", "bexiga"], weight: 2 },
      { id: "o3", concept: "RM de emergência", synonyms: ["ressonância", "rm", "4 horas"], weight: 3 },
      { id: "o4", concept: "Descompressão", synonyms: ["cirurgia", "descompressão", "neurocirurgia"], weight: 2 }
    ],
    simplifications: ["RM não disponível no hospital regional (regulação).", "Etiologia confirmada apenas no hospital de destino."]
  },
  references: ["INT-AJEM-CES-2019", "INT-GIRFT-CES-2023", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "História de alarme, exame, resíduo, sonda, analgesia, regulação", commands: [ask(10, "h-dor"), ask(20, "h-urina"), ask(30, "h-sela"), ask(40, "h-fraqueza"), { atSeconds: 50, type: "examine", payload: { region: "pelve", maneuver: "especial" } }, { atSeconds: 60, type: "examine", payload: { region: "membro_inferior_e", maneuver: "especial" } }, act(70, "volume_residual_pos_miccional"), act(250, "acionar_samu"), act(370, "acesso_venoso"), rx(470, "dipirona", "amp1g", 1000, "mg", "IV"), act(480, "diurese_horaria"), dx(800, "sindrome_cauda_equina"), dest(1500, "transferencia_regulada")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-regulacao" }, description: "regulação" }, { condition: { not: { ruleFired: "r-progressao" } }, description: "sem progressão" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-progressao" }, description: "progressão" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Morfina e alta com 'repouso'", commands: [ask(10, "h-dor"), act(30, "acesso_venoso"), rx(130, "morfina", "amp10", 4, "mg", "IV"), dest(900, "alta_orientada")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-alta" }, description: "alta" }, { condition: { ruleFired: "r-progressao" }, description: "progressão" }] },
    { id: "t-atraso", kind: "delay", description: "Regulação só após incontinência", commands: [ask(10, "h-dor"), rx(100, "dipirona", "amp1g", 1000, "mg", "VO"), ask(2000, "h-urina"), act(2500, "acionar_samu"), dest(3000, "transferencia_regulada")], runUntilSeconds: 3400, expect: [{ condition: { ruleFired: "r-progressao" }, description: "progressão" }, { condition: { ruleFired: "r-regulacao" }, description: "regulação tardia" }] },
    { id: "t-alternativa", kind: "alternative", description: "Sonda direto pela bexiga palpável; regulação", commands: [ask(10, "h-urina"), { atSeconds: 20, type: "examine", payload: { region: "pelve", maneuver: "palpacao" } }, act(30, "diurese_horaria"), act(340, "acionar_samu"), dest(1200, "transferencia_regulada")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-regulacao" }, description: "regulação" }] }
  ]
};
