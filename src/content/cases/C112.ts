import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, hi, obs, outcome, rx, staff, test } from "./helpers";

const SEGURO = { any: [{ actionCompleted: "oferecer_diu" }, { drugGiven: "desogestrel" }] };

export const C112: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C112",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Mulher de 36 anos, fumante, que quer voltar a tomar 'a pílula'",
  teachingTitle: "Escolha de contracepção com comorbidades — critérios de elegibilidade (enxaqueca com aura e tabagismo ≥ 35 anos contraindicam estrogênio), decisão compartilhada, DIU/progestagênio e cessação do tabagismo",
  group: "Atenção primária",
  specialties: ["Medicina de família", "Ginecologia"],
  environment: "consultorio",
  resourceProfile: "ubs-urbana",
  difficulty: 2,
  level: "internato",
  objectives: [
    "Rastrear condições que alteram a elegibilidade: enxaqueca com aura, tabagismo e idade, PA, TEV, pós-parto, cardiopatia",
    "Reconhecer contraindicação absoluta (MEC 4) ao estrogênio",
    "Oferecer métodos elegíveis (DIU, progestagênio) em decisão compartilhada, respeitando preferências",
    "Excluir gestação antes de iniciar método",
    "Abordar o tabagismo e orientar preservativo para IST"
  ],
  keywords: ["pílula", "anticoncepcional", "fumante", "dor de cabeça", "método", "consulta"],
  patient: {
    name: "Cláudia Ferreira",
    ageYears: 36,
    sex: "feminino",
    weightKg: 68,
    heightCm: 162,
    visual: { ageGroup: "adulto", sex: "feminino", skinTone: 3, hairStyle: "longo", hairColor: "preto", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "UBS, consulta de planejamento reprodutivo. Mulher de 36 anos quer 'voltar a tomar a pílula que tomava antes' (etinilestradiol + levonorgestrel). Parou há 1 ano. Não deseja engravidar.",
  communication: "normal",
  informants: [{ id: "paciente", name: "Cláudia", role: "Paciente" }],
  history: [
    hi("h-cefaleia", "antecedentes", "Tem dor de cabeça? Antes da dor, vê luzes, pontos brilhantes, perda de parte da visão ou formigamento?", [{ source: "paciente", text: "Tenho enxaqueca. Antes da dor vejo umas luzes em zigue-zague por uns 20 minutos." }], ["dor de cabeça", "enxaqueca", "luzes", "aura", "visão"]),
    hi("h-tabaco", "habitos", "Fuma? Quantos cigarros por dia?", [{ source: "paciente", text: "Fumo um maço por dia, uns 20 cigarros." }], ["fuma", "cigarros", "maço"]),
    hi("h-trombose", "familia", "Já teve trombose ou embolia? Alguém da família jovem teve? Problema de coração, AVC, diabetes?", [{ source: "paciente", text: "Nunca tive. Ninguém na família. Não tenho diabetes nem doença do coração." }], ["trombose", "embolia", "coração", "avc", "diabetes"]),
    hi("h-gineco", "ginecologico", "Última menstruação? Teve relação sem proteção desde então? Amamenta ou teve bebê recentemente?", [{ source: "paciente", text: "Menstruei há 10 dias. Uso camisinha às vezes. Minha caçula tem 6 anos." }], ["menstruação", "relação", "amamenta", "bebê", "parto"]),
    hi("h-preferencias", "outros", "O que é importante para você num método? Já pensou em DIU ou em pílula sem estrogênio?", [{ source: "paciente", text: "Quero algo prático e que não me faça mal. Tenho medo de DIU doer, mas se for seguro posso pensar." }], ["importante", "método", "diu", "preferência"]),
    hi("h-ist", "exposicao", "Parceria fixa? Já fez testes para HIV e sífilis?", [{ source: "paciente", text: "Parceiro fixo há 2 anos. Testei há muito tempo." }], ["parceria", "hiv", "sífilis", "teste"])
  ],
  initial: {
    vars: { hr: 78, sbp: 132, dbp: 84, rr: 15, spo2: 98, temp: 36.5, gcs: 15, pain: 0, glucose: 92, perfusion: 0.9, effort: 0.1 },
    flags: { rhythm: "sinusal", posture: "sentado", painVisual: "nenhuma", speech: "frases", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "IMC 25,9; sem alterações.", { label: "Exame geral" }),
    ex("e-neuro", "neurologico", "inspecao", "Exame neurológico normal entre as crises.", { label: "Neurológico" })
  ],
  testResults: [
    { testId: "teste_gravidez_urina", variants: [{ text: "Negativo." }] },
    { testId: "teste_rapido_hiv", variants: [{ text: "Não reagente." }] },
    { testId: "teste_rapido_sifilis", variants: [{ text: "Não reagente." }] }
  ],
  highlightedActions: ["medir_pa", "decisao_compartilhada", "oferecer_diu", "aconselhamento_tabagismo"],
  rules: [
    { id: "r-combinado", description: "Anticoncepcional combinado prescrito", priority: 50, when: { drugGiven: "anticoncepcional_combinado" }, repeat: "once", effects: [obs("Enxaqueca com aura e tabagismo ≥ 15 cigarros/dia aos ≥ 35 anos são categoria 4: o estrogênio é contraindicado (risco de AVC e trombose)."), outcome("complicacao")] },
    { id: "r-seguro", description: "Método elegível escolhido", priority: 30, when: SEGURO, repeat: "once", effects: [staff("paciente", "Entendi por que a pílula antiga não é segura para mim. Vamos nesse."), outcome("melhora")] },
    { id: "r-sem-metodo", description: "Sem método definido", priority: 40, when: { all: [{ path: "disposition", op: "neq", value: "" }, { not: SEGURO }, { not: { drugGiven: "anticoncepcional_combinado" } }] }, repeat: "once", effects: [obs("Sair sem método elegível mantém o risco de gestação não planejada.")] }
  ],
  diagnosis: { primary: "contracepcao_mec", accepted: ["contracepcao_mec"], differentials: ["enxaqueca", "has_nao_controlada"] },
  acceptedDestinations: ["retorno_programado"],
  outcomeNotes: "Mulher de 36 anos com enxaqueca com aura e tabagismo de 20 cigarros/dia: contracepção combinada é categoria 4. Anamnese de elegibilidade, PA, teste de gravidez, decisão compartilhada com oferta de DIU (cobre ou LNG) ou método só de progestagênio, abordagem do tabagismo, testes de IST e preservativo; retorno para inserção/seguimento.",
  scoring: [
    { id: "s-aura", domain: "historia", description: "Enxaqueca com aura", evidence: { kind: "historyAsked", items: ["h-cefaleia"], minCount: 1 }, points: 12, severity: "critica", rationale: "MEC 4 para estrogênio.", sourceIds: ["INT-USMEC-2024"] },
    { id: "s-tabaco", domain: "historia", description: "Tabagismo (quantidade)", evidence: { kind: "historyAsked", items: ["h-tabaco"], minCount: 1 }, points: 10, severity: "critica", rationale: "≥ 35 anos e ≥ 15/dia: MEC 4.", sourceIds: ["INT-USMEC-2024"] },
    { id: "s-outros", domain: "historia", description: "TEV, CV, pós-parto", evidence: { kind: "historyAsked", items: ["h-trombose", "h-gineco"], minCount: 2 }, points: 8, severity: "importante", rationale: "Demais critérios de elegibilidade.", sourceIds: ["INT-USMEC-2024"] },
    { id: "s-pa", domain: "exames", description: "Medir PA", evidence: { kind: "actionDone", anyOf: ["medir_pa"] }, points: 6, severity: "importante", rationale: "PA ≥ 160/100 = MEC 4; 140–159/90–99 = MEC 3.", sourceIds: ["INT-USMEC-2024"] },
    { id: "s-gravidez", domain: "exames", description: "Excluir gestação", evidence: { kind: "testOrdered", anyOf: ["teste_gravidez_urina", "bhcg"] }, points: 6, severity: "importante", rationale: "Antes de iniciar método." },
    { id: "s-pref", domain: "historia", description: "Preferências da paciente", evidence: { kind: "historyAsked", items: ["h-preferencias"], minCount: 1 }, points: 6, severity: "importante", rationale: "Decisão centrada na pessoa." },
    { id: "s-decisao", domain: "destino", description: "Decisão compartilhada", evidence: { kind: "actionDone", anyOf: ["decisao_compartilhada"] }, points: 10, severity: "critica", rationale: "Escolha informada." },
    { id: "s-metodo", domain: "tratamento", description: "Método elegível (DIU ou progestagênio)", evidence: { kind: "actionDone", anyOf: ["oferecer_diu"] }, points: 14, severity: "critica", rationale: "DIU é categoria 1 para a maioria.", sourceIds: ["INT-USMEC-2024"] },
    { id: "s-sem-combinado", domain: "tratamento", description: "Não prescreveu estrogênio", evidence: { kind: "avoidDrug", anyOf: ["anticoncepcional_combinado"] }, points: 10, severity: "critica", rationale: "Contraindicação absoluta.", sourceIds: ["INT-USMEC-2024"] },
    { id: "s-tabagismo", domain: "tratamento", description: "Abordagem do tabagismo", evidence: { kind: "actionDone", anyOf: ["aconselhamento_tabagismo"] }, points: 8, severity: "importante", rationale: "Risco cardiovascular." },
    { id: "s-ist", domain: "exames", description: "Testes de IST", evidence: { kind: "testOrdered", anyOf: ["teste_rapido_hiv", "teste_rapido_sifilis"] }, points: 4, severity: "importante", rationale: "Oportunidade de rastreio." },
    { id: "s-combinado", domain: "tratamento", description: "Falha: prescreveu combinado", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-combinado" } }, points: 15, penalty: true, severity: "critica", rationale: "Risco de AVC." },
    { id: "s-dx", domain: "destino", description: "Contraindicação a estrogênio identificada", evidence: { kind: "diagnosis", accepted: ["contracepcao_mec"] }, points: 2, severity: "importante", rationale: "Elegibilidade." },
    { id: "s-destino", domain: "destino", description: "Retorno para inserção/seguimento", evidence: { kind: "disposition", accepted: ["retorno_programado"] }, points: 4, severity: "importante", rationale: "Continuidade." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Antes de renovar: há algo que contraindique estrogênio?" },
      { level: 2, text: "Pergunte sobre aura e quantos cigarros por dia." },
      { level: 3, text: "Quais métodos são seguros para ela?" },
      { level: 4, text: "Sugestão explícita: aura, tabagismo, TEV, PA, gravidez, preferências, decisão compartilhada, DIU (ou desogestrel), cessação do tabagismo, testes de IST, retorno." }
    ],
    summary: "Contraindicação absoluta à contracepção combinada (enxaqueca com aura; ≥ 35 anos fumando ≥ 15 cigarros/dia).",
    pathophysiology: "O etinilestradiol aumenta fatores de coagulação; somado ao tabagismo e à enxaqueca com aura (associada a maior risco de AVC isquêmico), eleva o risco de AVC e trombose arterial e venosa. Progestagênios isolados e DIU não têm esse efeito relevante.",
    keyPoints: [
      "Combinado é MEC 4 em: aura, ≥ 35 anos com ≥ 15 cigarros/dia, PA ≥ 160/100, TEV, cardiopatia isquêmica/AVC, pós-parto < 21 dias.",
      "DIU de cobre e DIU-LNG: categoria 1 para a maioria.",
      "Métodos só de progestagênio são alternativa quando o estrogênio é contraindicado.",
      "Decisão compartilhada e preferências da mulher.",
      "Aproveitar para cessação do tabagismo e rastreio de IST."
    ],
    alternatives: ["Desogestrel (pílula só de progestagênio).", "Implante ou injetável trimestral conforme disponibilidade e elegibilidade."],
    oralRubric: [
      { id: "o1", concept: "Contraindicação ao estrogênio", synonyms: ["aura", "tabagismo", "categoria 4", "estrogênio"], weight: 3 },
      { id: "o2", concept: "Alternativas", synonyms: ["diu", "progestagênio", "desogestrel", "implante"], weight: 3 },
      { id: "o3", concept: "Decisão compartilhada", synonyms: ["preferência", "compartilhada", "escolha"], weight: 2 },
      { id: "o4", concept: "Tabagismo/IST", synonyms: ["parar de fumar", "preservativo", "hiv", "sífilis"], weight: 2 }
    ],
    simplifications: ["Inserção do DIU agendada (não realizada na consulta).", "Categorias dos métodos só de progestagênio na aura não exibidas."]
  },
  references: ["INT-USMEC-2024", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 4, allowSexSwap: false, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Elegibilidade, PA, gravidez, preferências, decisão, DIU, tabagismo, IST, retorno", commands: [ask(10, "h-cefaleia"), ask(20, "h-tabaco"), ask(30, "h-trombose"), ask(40, "h-gineco"), act(50, "medir_pa"), test(120, "teste_gravidez_urina"), ask(130, "h-preferencias"), act(140, "decisao_compartilhada"), act(330, "oferecer_diu"), act(520, "aconselhamento_tabagismo"), test(830, "teste_rapido_hiv"), test(840, "teste_rapido_sifilis"), dx(900, "contracepcao_mec"), dest(1000, "retorno_programado")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-seguro" }, description: "método elegível" }, { condition: { not: { ruleFired: "r-combinado" } }, description: "sem estrogênio" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [dest(600, "retorno_programado")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-sem-metodo" }, description: "sem método" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Renova a pílula combinada", commands: [rx(100, "anticoncepcional_combinado", "cart21", 1, "mg", "VO"), dest(300, "retorno_programado")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-combinado" }, description: "combinado" }] },
    { id: "t-atraso", kind: "delay", description: "Só pergunta sobre aura depois; sai sem método", commands: [ask(10, "h-tabaco"), ask(900, "h-cefaleia"), dest(1100, "retorno_programado")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-sem-metodo" }, description: "sem método" }, { condition: { not: { ruleFired: "r-combinado" } }, description: "sem estrogênio" }] },
    { id: "t-alternativa", kind: "alternative", description: "Prefere pílula: desogestrel", commands: [ask(10, "h-cefaleia"), ask(20, "h-tabaco"), test(30, "teste_gravidez_urina"), act(40, "decisao_compartilhada"), rx(250, "desogestrel", "cart28", 1, "mg", "VO"), act(260, "aconselhamento_tabagismo"), dest(600, "retorno_programado")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-seguro" }, description: "método elegível" }] }
  ]
};
