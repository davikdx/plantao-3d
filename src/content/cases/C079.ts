import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const CIRURGIA = { actionCompleted: "solicitar_avaliacao_cirurgica" };
const USG = { testCollected: "usg_pelvica_doppler" };
const HCG = { any: [{ testCollected: "bhcg" }, { testCollected: "teste_gravidez_urina" }] };
const ALTA = { any: [{ path: "disposition", op: "eq", value: "alta_orientada" }, { path: "disposition", op: "eq", value: "alta_com_seguimento_ubs" }] };

export const C079: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C079",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Adolescente com dor súbita e forte do lado esquerdo do pé da barriga, vomitando",
  teachingTitle: "Torção anexial — suspeita clínica, excluir gravidez, ultrassom sem atrasar, Doppler normal não exclui, laparoscopia com distorção e preservação ovariana",
  group: "Obstetrícia e Ginecologia",
  specialties: ["Ginecologia", "Cirurgia", "Emergência", "Hebiatria"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Suspeitar de torção anexial em dor pélvica súbita com náuseas/vômitos, sobretudo com cisto conhecido",
    "Excluir gravidez e diferenciais (ectópica, apendicite, cálculo)",
    "Usar ultrassom sem atrasar a cirurgia; fluxo ao Doppler não exclui torção",
    "Acionar laparoscopia de urgência com distorção e preservação do ovário"
  ],
  keywords: ["dor pélvica", "súbita", "vômito", "adolescente", "ovário", "cisto"],
  patient: {
    name: "Larissa Teixeira",
    ageYears: 17,
    sex: "feminino",
    weightKg: 55,
    heightCm: 162,
    visual: { ageGroup: "adolescente", sex: "feminino", skinTone: 2, hairStyle: "longo", hairColor: "loiro", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Adolescente de 17 anos trazida pela mãe com dor súbita e intensa no baixo ventre à esquerda há 3 horas, iniciada durante a aula de educação física, com náuseas e três vômitos.",
  communication: "normal",
  informants: [{ id: "mae", name: "Mãe", role: "Acompanhante" }],
  history: [
    h("h-dor", "inicio", "Como começou a dor?", "De repente, quando eu pulei na aula. Muito forte, do lado esquerdo, vem em ondas mas não passa.", { keywords: ["começou", "dor", "repente"] }),
    hi("h-cisto", "antecedentes", "Já teve algum problema nos ovários?", [{ source: "mae", text: "Fez ultrassom no ano passado por cólica, viram um cisto de 5 cm no ovário esquerdo, mandaram repetir." }], ["ovário", "cisto", "ultrassom"]),
    h("h-dum", "ginecologico", "Quando foi a última menstruação? Tem vida sexual?", "Menstruei há 2 semanas, normal. Tenho namorado, a gente usa camisinha. (responde depois que a mãe sai da sala)", { keywords: ["menstruação", "sexual", "namorado"] }),
    h("h-urina", "fatores_associados", "Ardência ao urinar, sangue na urina, febre, diarreia?", "Nada disso.", { keywords: ["urina", "febre", "diarreia"] }),
    h("h-corrimento", "ginecologico", "Corrimento ou sangramento vaginal?", "Não.", { keywords: ["corrimento", "sangramento"] })
  ],
  initial: {
    vars: { hr: 112, sbp: 124, dbp: 76, rr: 20, spo2: 99, temp: 37.2, gcs: 15, pain: 9, glucose: 104, perfusion: 0.9, effort: 0.2, wbc: 11900, hb: 13.2 },
    flags: { rhythm: "taquicardia_sinusal", posture: "supino", painVisual: "intensa", speech: "frases", consciousness: "alerta", sweating: true, agitation: true },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-abdome", "abdome_qie", "palpacao", "Dor intensa em fossa ilíaca esquerda, massa mal definida palpável; defesa voluntária, sem rigidez.", { label: "Fossa ilíaca esquerda" }),
    ex("e-qid", "abdome_qid", "palpacao", "Fossa ilíaca direita indolor.", { label: "Fossa ilíaca direita" }),
    ex("e-geral", "geral", "inspecao", "Inquieta, pálida, sudoreica, sem posição de alívio.", {})
  ],
  testResults: [
    { testId: "usg_pelvica_doppler", variants: [{ text: "Ovário esquerdo aumentado (8 cm), edemaciado, com cisto de 5 cm, folículos periféricos e sinal do redemoinho no pedículo; fluxo arterial presente ao Doppler; líquido livre pequeno. Ovário direito normal; útero vazio." }] },
    { testId: "bhcg", variants: [{ text: "Beta-hCG negativo." }] },
    { testId: "teste_gravidez_urina", variants: [{ text: "Negativo." }] },
    { testId: "urina_tipo1", variants: [{ text: "Normal." }] }
  ],
  highlightedActions: ["acesso_venoso", "avaliar_dor", "solicitar_avaliacao_cirurgica"],
  rules: [
    { id: "r-analgesia", description: "Analgesia e antiemético", priority: 20, when: { any: [{ drugGiven: "morfina" }, { drugGiven: "dipirona" }] }, repeat: "once", effects: [trend("pain", 6, 600, "anal", 20)] },
    { id: "r-cirurgia-sem-usg", description: "Ginecologista pede USG rápido (sem atrasar)", priority: 40, when: { all: [CIRURGIA, { not: USG }, { not: HCG }] }, repeat: "once", effects: [staff("supervisor", "Ginecologista: suspeita forte de torção — beta-hCG e USG à beira-leito já; sala de laparoscopia sendo preparada, não vamos esperar TC.")] },
    { id: "r-laparoscopia", description: "Laparoscopia com distorção", priority: 50, when: { all: [CIRURGIA, HCG] }, repeat: "once", effects: [staff("supervisor", "Ginecologista: laparoscopia de urgência — ovário esquerdo torcido 2 voltas, escurecido; distorção com preservação ovariana."), trend("pain", 2, 1800, "lap", 50), trend("hr", 88, 1800, "lap", 50), outcome("melhora")] },
    { id: "r-doppler", description: "Doppler com fluxo", priority: 10, when: USG, repeat: "once", effects: [obs("Fluxo arterial ao Doppler NÃO exclui torção (circulação dupla do ovário e torção parcial/intermitente).")] },
    { id: "r-necrose", description: "Sem cirurgia em 75 min: perda ovariana", priority: 30, when: { all: [{ time: "gte", seconds: 4500 }, { not: CIRURGIA }] }, repeat: "once", effects: [trend("temp", 37.9, 1800, "nec", 30), trend("wbc", 15000, 3600, "nec", 30), trend("pain", 8, 600, "nec", 30), obs("Isquemia prolongada: risco de necrose e perda do ovário."), outcome("complicacao")] },
    { id: "r-alta", description: "Alta como cólica menstrual", priority: 45, when: ALTA, repeat: "once", effects: [obs("Dor súbita intensa com vômitos e cisto conhecido não é cólica: alta perde a janela de preservação ovariana."), outcome("complicacao")] }
  ],
  diagnosis: { primary: "torcao_anexial", accepted: ["torcao_anexial"], differentials: ["gestacao_ectopica_rota", "apendicite", "dip", "pielonefrite", "abortamento"] },
  acceptedDestinations: ["centro_cirurgico"],
  outcomeNotes: "Torção anexial esquerda sobre cisto de 5 cm em adolescente, com dor súbita e vômitos. Analgesia, beta-hCG negativo, USG pélvico (sinal do redemoinho; fluxo presente não exclui), laparoscopia de urgência com distorção e preservação do ovário.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Início súbito e cisto conhecido", evidence: { kind: "historyAsked", items: ["h-dor", "h-cisto"], minCount: 2 }, points: 8, severity: "critica", rationale: "Fator de risco principal." },
    { id: "s-dum", domain: "historia", description: "DUM e vida sexual (com privacidade)", evidence: { kind: "historyAsked", items: ["h-dum"], minCount: 1 }, points: 5, severity: "importante", rationale: "Excluir gestação; confidencialidade na adolescência." },
    { id: "s-exame", domain: "historia", description: "Exame abdominal comparativo", evidence: { kind: "examDone", regions: ["abdome_qie", "abdome_qid"], minCount: 2 }, points: 5, severity: "importante", rationale: "Lateralidade e diferenciais." },
    { id: "s-hcg", domain: "exames", description: "Beta-hCG/teste de gravidez", evidence: { kind: "testOrdered", anyOf: ["bhcg", "teste_gravidez_urina"], withinSeconds: 900 }, points: 10, severity: "critica", rationale: "Excluir ectópica." },
    { id: "s-usg", domain: "exames", description: "USG pélvico com Doppler", evidence: { kind: "testOrdered", anyOf: ["usg_pelvica_doppler"], withinSeconds: 1800 }, points: 10, severity: "importante", rationale: "Modalidade de escolha.", sourceIds: ["INT-ACOG-TORCAO-2019"] },
    { id: "s-tc", domain: "exames", description: "Sem TC desnecessária atrasando cirurgia", evidence: { kind: "testsNotExcessive", maxUnjustified: 0, justified: ["usg_pelvica_doppler", "bhcg", "teste_gravidez_urina", "hemograma", "urina_tipo1", "usg_abdome"] }, points: 4, severity: "menor", rationale: "Não atrasar a cirurgia." },
    { id: "s-analgesia", domain: "tratamento", description: "Analgesia", evidence: { kind: "drugGiven", anyOf: ["morfina", "dipirona"], withinSeconds: 900 }, points: 6, severity: "importante", rationale: "Dor intensa." },
    { id: "s-cirurgia", domain: "tratamento", description: "Acionou ginecologia para laparoscopia em até 45 min", evidence: { kind: "actionDone", anyOf: ["solicitar_avaliacao_cirurgica"], withinSeconds: 2700 }, points: 18, severity: "critica", rationale: "Tempo é ovário.", sourceIds: ["INT-ACOG-TORCAO-2019"] },
    { id: "s-alta", domain: "destino", description: "Falha: alta como cólica", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-alta" } }, points: 12, penalty: true, severity: "critica", rationale: "Perde a janela." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou dor", evidence: { kind: "reassessAfter", after: ["morfina", "dipirona"], reassess: ["avaliar_dor", "abdome_qie"], withinSeconds: 1800 }, points: 5, severity: "importante", rationale: "Dor persistente apesar de analgesia reforça a suspeita." },
    { id: "s-dx", domain: "destino", description: "Torção anexial", evidence: { kind: "diagnosis", accepted: ["torcao_anexial"] }, points: 8, severity: "importante", rationale: "Clínica + USG." },
    { id: "s-destino", domain: "destino", description: "Centro cirúrgico", evidence: { kind: "disposition", accepted: ["centro_cirurgico"] }, points: 9, severity: "importante", rationale: "Laparoscopia." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Dor súbita durante esforço, com vômitos, em quem tem cisto de 5 cm." },
      { level: 2, text: "Antes de tudo, gravidez está excluída?" },
      { level: 3, text: "O Doppler mostrou fluxo. Isso descarta?" },
      { level: 4, text: "Sugestão explícita: acesso, analgesia, beta-hCG, USG pélvica, acionar ginecologia para laparoscopia, centro cirúrgico." }
    ],
    summary: "Adolescente de 17 anos com torção do anexo esquerdo sobre cisto ovariano de 5 cm.",
    pathophysiology: "Massa ovariana (cisto) aumenta o risco de rotação do anexo sobre o pedículo vascular. Primeiro há obstrução venosa e linfática (edema, aumento do ovário), depois arterial. Como o ovário tem dupla irrigação e a torção pode ser parcial, o fluxo ao Doppler pode persistir.",
    keyPoints: [
      "Dor pélvica súbita + náuseas/vômitos + massa anexial: torção até prova em contrário.",
      "Beta-hCG em toda mulher em idade reprodutiva.",
      "USG é a escolha; fluxo ao Doppler não exclui torção.",
      "Não atrasar a cirurgia por imagem adicional.",
      "Laparoscopia com distorção e preservação do ovário, mesmo se escurecido."
    ],
    alternatives: ["Laparoscopia diagnóstica mesmo com USG duvidoso quando a suspeita clínica é alta (laparoscopia negativa é aceitável)."],
    oralRubric: [
      { id: "o1", concept: "Suspeita clínica", synonyms: ["súbita", "vômito", "cisto", "torção"], weight: 2 },
      { id: "o2", concept: "Excluir gravidez", synonyms: ["beta", "gravidez", "ectópica"], weight: 2 },
      { id: "o3", concept: "Doppler não exclui", synonyms: ["doppler", "fluxo"], weight: 2 },
      { id: "o4", concept: "Laparoscopia e preservação", synonyms: ["laparoscopia", "distorção", "preservar"], weight: 3 }
    ],
    simplifications: ["Analgesia pediátrica sem regra de dose validada para 17 anos no catálogo (o app alerta).", "Procedimento cirúrgico representado pelo acionamento da ginecologia."]
  },
  references: ["INT-ACOG-TORCAO-2019", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 8, allowSexSwap: false, allowWeightPercent: 15, allowVisualVariation: true, forbidden: ["sexo masculino"] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "História, exame, acesso, analgesia, beta-hCG, USG, ginecologia, centro cirúrgico", commands: [ask(10, "h-dor"), ask(20, "h-cisto"), ask(30, "h-dum"), { atSeconds: 40, type: "examine", payload: { region: "abdome_qie", maneuver: "palpacao" } }, { atSeconds: 50, type: "examine", payload: { region: "abdome_qid", maneuver: "palpacao" } }, act(60, "acesso_venoso"), rx(170, "dipirona", "amp1g", 1000, "mg", "IV"), test(180, "bhcg"), test(200, "usg_pelvica_doppler"), act(1000, "avaliar_dor"), act(1500, "solicitar_avaliacao_cirurgica"), dx(2100, "torcao_anexial"), dest(2200, "centro_cirurgico")], runUntilSeconds: 4000, expect: [{ condition: { ruleFired: "r-laparoscopia" }, description: "laparoscopia" }, { condition: { not: { ruleFired: "r-necrose" } }, description: "ovário preservado" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 5000, expect: [{ condition: { ruleFired: "r-necrose" }, description: "perda ovariana" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Analgesia e alta como cólica", commands: [act(30, "acesso_venoso"), rx(150, "dipirona", "amp1g", 1000, "mg", "IV"), dest(1200, "alta_orientada")], runUntilSeconds: 5000, expect: [{ condition: { ruleFired: "r-alta" }, description: "alta indevida" }, { condition: { ruleFired: "r-necrose" }, description: "perda ovariana" }] },
    { id: "t-atraso", kind: "delay", description: "Espera USG 'normal' com fluxo e reavalia tarde", commands: [act(30, "acesso_venoso"), rx(150, "dipirona", "amp1g", 1000, "mg", "IV"), test(200, "usg_pelvica_doppler"), test(300, "bhcg"), act(4600, "solicitar_avaliacao_cirurgica"), dest(5500, "centro_cirurgico")], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-necrose" }, description: "atraso" }, { condition: { ruleFired: "r-laparoscopia" }, description: "laparoscopia tardia" }] },
    { id: "t-alternativa", kind: "alternative", description: "Ginecologia acionada antes da imagem, teste urinário de gravidez", commands: [act(20, "acesso_venoso"), act(130, "solicitar_avaliacao_cirurgica"), test(800, "teste_gravidez_urina"), rx(200, "dipirona", "amp1g", 1000, "mg", "IV"), dest(1500, "centro_cirurgico")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-cirurgia-sem-usg" }, description: "pede beta e USG sem atrasar" }, { condition: { ruleFired: "r-laparoscopia" }, description: "laparoscopia" }] }
  ]
};
