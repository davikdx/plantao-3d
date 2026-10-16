import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, h, obs, outcome, rx, staff } from "./helpers";

const VACINA = { drugGiven: "vacina_antirrabica" };
const REFERENCIA = { any: [{ actionCompleted: "passagem_caso" }, { actionCompleted: "acionar_samu" }] };

export const C040: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C040",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Mordida de cachorro na mão a caminho do trabalho",
  teachingTitle: "Profilaxia pós-exposição da raiva (lesão grave, animal não observável) e do tétano na UBS",
  group: "Infectologia",
  specialties: ["Atenção primária", "Infectologia", "Saúde coletiva"],
  environment: "ubs",
  resourceProfile: "ubs-urbana",
  difficulty: 2,
  level: "internato",
  objectives: [
    "Classificar a exposição (lesão leve × grave) e a possibilidade de observar o animal",
    "Lavar o ferimento com água e sabão imediatamente",
    "Indicar vacina antirrábica (D0, D3, D7, D14) e soro/imunoglobulina na lesão grave com animal não observável",
    "Atualizar a profilaxia do tétano conforme história vacinal",
    "Organizar a referência para o imunobiológico indisponível na UBS e orientar o seguimento"
  ],
  keywords: ["mordida", "cachorro", "cão", "mão", "ferimento", "vacina", "raiva"],
  patient: {
    name: "Daniel Correia",
    ageYears: 29,
    sex: "masculino",
    weightKg: 72,
    heightCm: 175,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 4, hairStyle: "curto", hairColor: "preto", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "UBS urbana, início da manhã. Homem de 29 anos, entregador, foi mordido por um cachorro na rua há cerca de 1 hora. Chega com a mão enrolada num pano.",
  communication: "normal",
  history: [
    h("h-queixa", "queixa", "O que aconteceu?", "Um cachorro saiu correndo de um terreno baldio e me mordeu a mão quando passei de moto.", { keywords: ["aconteceu", "mordida"] }),
    h("h-animal", "exposicao", "O cachorro tem dono? É possível observá-lo por 10 dias? Parecia doente?", "Não tem dono, é de rua, sumiu no mato. Estava magro e babando um pouco, não sei dizer se é doente.", { keywords: ["dono", "observar", "cachorro", "animal", "doente", "rua"] }),
    h("h-ferida", "localizacao", "Onde mordeu? Foi fundo?", "Nas costas da mão direita, entraram os dentes. Sangrou bastante.", { keywords: ["onde", "fundo", "profundo"] }),
    h("h-lavou", "outros", "Lavou o local?", "Só passei um pano.", { keywords: ["lavou", "lavar"] }),
    h("h-antirrabica", "vacinacao", "Já tomou vacina antirrábica antes?", "Nunca tomei.", { keywords: ["antirrábica", "raiva"] }),
    h("h-tetano", "vacinacao", "Como está sua vacina contra o tétano?", "Tomei as três quando era criança e um reforço quando entrei no quartel, há uns 12 anos.", { keywords: ["tétano", "antitetânica", "dupla"] }),
    h("h-antecedentes", "antecedentes", "Tem alguma doença ou usa remédio que baixe a imunidade?", "Não, sou saudável.", { keywords: ["doença", "imunidade"] }),
    h("h-alergias", "alergias", "Tem alergia a algum remédio ou vacina?", "Não.")
  ],
  initial: {
    vars: { hr: 92, sbp: 128, dbp: 80, rr: 16, spo2: 99, temp: 36.6, gcs: 15, pain: 5, glucose: 96, perfusion: 1, effort: 0 },
    flags: { rhythm: "sinusal", painVisual: "leve", posture: "sentado", bleedingVisible: true },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-mao", "membro_superior_d", "inspecao", "Três ferimentos perfurantes profundos no dorso da mão direita, com sangramento discreto; sem exposição de tendão.", { label: "Mão direita", better: [{ when: { actionCompleted: "lavar_ferimento" }, text: "Ferimentos limpos após lavagem abundante; três perfurações profundas no dorso da mão direita." }] }),
    ex("e-mao-palp", "membro_superior_d", "palpacao", "Mobilidade e sensibilidade dos dedos preservadas; perfusão normal.", { label: "Função da mão" }),
    ex("e-geral", "geral", "inspecao", "Bom estado geral, ansioso.", {})
  ],
  highlightedActions: ["lavar_ferimento", "passagem_caso", "notificacao", "orientacoes_alta"],
  rules: [
    { id: "r-lavagem", description: "Lavagem do ferimento", when: { actionCompleted: "lavar_ferimento" }, repeat: "once", effects: [obs("Ferimento lavado com água e sabão em abundância — medida essencial e imediata.")] },
    { id: "r-vacina", description: "Primeira dose (D0) da vacina antirrábica", priority: 50, when: VACINA, repeat: "once", effects: [obs("Vacina antirrábica D0 aplicada. Agendar D3, D7 e D14 na sala de vacina."), outcome("estabilizacao_parcial")] },
    { id: "r-referencia", description: "Referência para soro/imunoglobulina antirrábica", priority: 50, when: REFERENCIA, repeat: "once", effects: [staff("regulacao", "Centro de referência em imunobiológicos: paciente aceito hoje para aplicação do soro antirrábico (infiltração na lesão). Encaminhar com a ficha e o cartão de vacina.")] },
    { id: "r-completo", description: "Profilaxia completa iniciada: lavagem, vacina e referência para o soro", priority: 60, when: { all: [{ actionCompleted: "lavar_ferimento" }, VACINA, REFERENCIA] }, repeat: "once", effects: [outcome("melhora")] },
    { id: "r-dt", description: "Reforço antitetânico", when: { drugGiven: "vacina_dt" }, repeat: "once", effects: [obs("Reforço dT aplicado em local diferente da vacina antirrábica.")] },
    { id: "r-alta-sem-profilaxia", description: "Sem vacina antirrábica em 1 hora de atendimento", priority: 20, when: { all: [{ time: "gte", seconds: 3600 }, { not: VACINA }] }, repeat: "once", effects: [obs("O paciente seguiria sem profilaxia antirrábica: a raiva é praticamente sempre fatal após o início dos sintomas."), outcome("complicacao")] }
  ],
  diagnosis: { primary: "exposicao_raiva_grave", accepted: ["exposicao_raiva_grave"], differentials: ["exposicao_raiva_leve", "celulite"] },
  acceptedDestinations: ["transferencia_regulada"],
  outcomeNotes: "Mordedura profunda na mão (lesão grave) por cão de rua não observável e com comportamento suspeito: lavar com água e sabão, vacina antirrábica (D0, D3, D7, D14) e soro ou imunoglobulina antirrábica no D0 (na referência, pois a UBS não dispõe). Tétano: 3 doses + reforço há 12 anos em ferimento de alto risco → reforço dT, sem SAT. Notificar e orientar o retorno.",
  scoring: [
    { id: "s-animal", domain: "historia", description: "Avaliou se o animal é observável e se tinha sinais suspeitos", evidence: { kind: "historyAsked", items: ["h-animal"], minCount: 1 }, points: 10, severity: "critica", rationale: "Animal observável muda a conduta (observar 10 dias); não observável/suspeito: profilaxia imediata.", sourceIds: ["BR-RAIVA-TETANO-RJ"] },
    { id: "s-ferida", domain: "historia", description: "Caracterizou local e profundidade e vacinação prévia", evidence: { kind: "historyAsked", items: ["h-ferida", "h-antirrabica", "h-tetano"], minCount: 2 }, points: 6, severity: "importante", rationale: "Mão e ferimento profundo = lesão grave; história vacinal define o tétano.", sourceIds: ["BR-RAIVA-TETANO-RJ"] },
    { id: "s-exame", domain: "historia", description: "Examinou o ferimento e a função da mão", evidence: { kind: "examDone", regions: ["membro_superior_d"], minCount: 1 }, points: 4, severity: "importante", rationale: "Profundidade, comprometimento tendíneo e neurovascular." },
    { id: "s-lavagem", domain: "priorizacao", description: "Lavagem com água e sabão em até 15 min", evidence: { kind: "actionDone", anyOf: ["lavar_ferimento"], withinSeconds: 900 }, points: 14, severity: "critica", rationale: "Indicada em todos os casos; reduz a carga viral e bacteriana.", sourceIds: ["BR-RAIVA-TETANO-RJ"] },
    { id: "s-vacina", domain: "tratamento", description: "Vacina antirrábica D0", evidence: { kind: "drugGiven", anyOf: ["vacina_antirrabica"], withinSeconds: 3600 }, points: 16, severity: "critica", rationale: "Animal não observável: iniciar a profilaxia imediatamente (4 doses: D0, D3, D7, D14).", sourceIds: ["BR-RAIVA-TETANO-RJ"] },
    { id: "s-soro", domain: "tratamento", description: "Garantiu soro/imunoglobulina antirrábica (referência no mesmo dia)", evidence: { kind: "stateAtEnd", when: { any: [{ drugGiven: "soro_antirrabico" }, { drugGiven: "imunoglobulina_antirrabica" }, { actionCompleted: "passagem_caso" }, { actionCompleted: "acionar_samu" }] } }, points: 12, severity: "critica", rationale: "Lesão grave + animal não observável: soro (40 UI/kg) ou IGHAR (20 UI/kg) infiltrados na lesão no D0.", sourceIds: ["BR-RAIVA-TETANO-RJ"] },
    { id: "s-dt", domain: "tratamento", description: "Reforço dT (sem SAT)", evidence: { kind: "drugGiven", anyOf: ["vacina_dt"] }, points: 8, severity: "importante", rationale: "≥ 3 doses e última há ≥ 10 anos em ferimento de alto risco: reforço; SAT não indicado (exceto situações especiais).", sourceIds: ["BR-RAIVA-TETANO-RJ"] },
    { id: "s-exames", domain: "exames", description: "Sem exames desnecessários", evidence: { kind: "testsNotExcessive", maxUnjustified: 0, justified: [] }, points: 15, severity: "menor", rationale: "A conduta é clínica e epidemiológica." },
    { id: "s-orientacao", domain: "reavaliacao", description: "Orientou datas das doses e sinais de infecção local", evidence: { kind: "actionDone", anyOf: ["orientacoes_alta"] }, points: 6, severity: "importante", rationale: "Adesão ao esquema completo; reavaliar a ferida." },
    { id: "s-notificacao", domain: "reavaliacao", description: "Notificação do atendimento antirrábico", evidence: { kind: "actionDone", anyOf: ["notificacao"] }, points: 4, severity: "menor", rationale: "Registro no sistema de vigilância (ficha de atendimento antirrábico)." },
    { id: "s-dx", domain: "destino", description: "Classificou como exposição grave", evidence: { kind: "diagnosis", accepted: ["exposicao_raiva_grave"] }, points: 4, severity: "importante", rationale: "Mão + ferimento profundo + animal não observável.", sourceIds: ["BR-RAIVA-TETANO-RJ"] },
    { id: "s-destino", domain: "destino", description: "Referência no mesmo dia para o imunobiológico", evidence: { kind: "disposition", accepted: ["transferencia_regulada"] }, points: 6, severity: "importante", rationale: "A UBS não dispõe de soro/IGHAR neste perfil; o prazo ideal é o D0." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "O que você precisa saber sobre o animal e sobre a ferida?" },
      { level: 2, text: "Mão, ferimento profundo, cão de rua que sumiu: que tipo de exposição é essa?" },
      { level: 3, text: "Imunização ativa demora dias para proteger; a passiva cobre a janela inicial." },
      { level: 4, text: "Sugestão explícita: lavar com água e sabão, vacina antirrábica D0, encaminhar para soro/IGHAR hoje, reforço dT, notificar e orientar D3, D7, D14." }
    ],
    summary: "Entregador de 29 anos mordido na mão por cão de rua não observável e com comportamento suspeito: exposição grave ao vírus da raiva; reforço antitetânico indicado.",
    pathophysiology: "O vírus da raiva é inoculado pela saliva e se replica localmente antes de ascender pelos nervos periféricos até o sistema nervoso central; o período de incubação é variável e mais curto em lesões próximas a áreas ricamente inervadas (mãos, face). Após o início dos sintomas, a doença é quase sempre fatal. Lavagem, vacina (imunidade ativa) e soro/imunoglobulina (anticorpos imediatos) bloqueiam a infecção antes da chegada ao sistema nervoso.",
    keyPoints: [
      "Lavar todo ferimento com água e sabão.",
      "Lesão grave: mãos, pés, cabeça/face, mucosas, profunda, múltipla ou extensa.",
      "Animal observável: observar 10 dias; não observável ou suspeito: profilaxia imediata.",
      "Vacina em 4 doses (D0, D3, D7, D14); soro 40 UI/kg ou IGHAR 20 UI/kg no D0 em lesão grave, infiltrados na lesão.",
      "Tétano: conduta pela história vacinal e risco do ferimento."
    ],
    alternatives: ["Imunoglobulina antirrábica humana em vez do soro heterólogo, conforme disponibilidade.", "Vacina por via intradérmica conforme norma (não modelada)."],
    oralRubric: [
      { id: "o1", concept: "Classificação: lesão grave e animal não observável", synonyms: ["grave", "não observável", "cão de rua"], weight: 2 },
      { id: "o2", concept: "Lavagem", synonyms: ["lavar", "água e sabão", "lavagem"], weight: 2 },
      { id: "o3", concept: "Vacina antirrábica", synonyms: ["vacina antirrábica", "d0", "quatro doses"], weight: 2 },
      { id: "o4", concept: "Soro/imunoglobulina", synonyms: ["soro", "imunoglobulina", "ighar"], weight: 2 },
      { id: "o5", concept: "Tétano", synonyms: ["dt", "tétano", "reforço"], weight: 1 }
    ],
    simplifications: ["Doses D3, D7 e D14 e a infiltração do soro não são simuladas; a referência no mesmo dia representa a decisão.", "Antibiótico profilático para mordedura em mão não está modelado (conduta a conferir)."]
  },
  references: ["BR-RAIVA-TETANO-RJ", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 20, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: ["idade"] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Classifica, lava, vacina D0, dT, encaminha para soro, notifica e orienta", commands: [ask(10, "h-animal"), ask(20, "h-ferida"), ask(30, "h-tetano"), { atSeconds: 40, type: "examine", payload: { region: "membro_superior_d", maneuver: "inspecao" } }, act(60, "lavar_ferimento"), rx(400, "vacina_antirrabica", "fr05", 0.5, "mL", "IM"), rx(450, "vacina_dt", "fr05", 0.5, "mL", "IM"), act(500, "notificacao"), act(800, "passagem_caso"), act(950, "orientacoes_alta"), dx(1100, "exposicao_raiva_grave"), dest(1100, "transferencia_regulada")], runUntilSeconds: 4000, expect: [{ condition: { ruleFired: "r-completo" }, description: "profilaxia completa iniciada" }, { condition: { not: { ruleFired: "r-alta-sem-profilaxia" } }, description: "sem omissão" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 3700, expect: [{ condition: { ruleFired: "r-alta-sem-profilaxia" }, description: "sem profilaxia" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Só reforço antitetânico e alta", commands: [rx(200, "vacina_dt", "fr05", 0.5, "mL", "IM"), dest(300, "alta_orientada")], runUntilSeconds: 3700, expect: [{ condition: { ruleFired: "r-dt" }, description: "dT aplicada" }, { condition: { ruleFired: "r-alta-sem-profilaxia" }, description: "omissão da profilaxia antirrábica" }] },
    { id: "t-atraso", kind: "delay", description: "Vacina só após 70 minutos", commands: [act(60, "lavar_ferimento"), rx(4200, "vacina_antirrabica", "fr05", 0.5, "mL", "IM"), act(4300, "passagem_caso")], runUntilSeconds: 5000, expect: [{ condition: { ruleFired: "r-alta-sem-profilaxia" }, description: "atraso registrado" }, { condition: { ruleFired: "r-completo" }, description: "profilaxia iniciada tardiamente" }] },
    { id: "t-alternativa", kind: "alternative", description: "Referência via central de regulação (192)", commands: [act(60, "lavar_ferimento"), rx(400, "vacina_antirrabica", "fr05", 0.5, "mL", "IM"), act(500, "acionar_samu")], runUntilSeconds: 2000, expect: [{ condition: { ruleFired: "r-completo" }, description: "profilaxia completa iniciada" }] }
  ]
};
