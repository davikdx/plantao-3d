import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, hi, obs, outcome, rx, staff } from "./helpers";

const ICS = { any: [{ drugGiven: "budesonida_formoterol" }, { drugGiven: "beclometasona" }] };
const DEFINIU = { path: "disposition", op: "neq", value: "" };

export const C109: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C109",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Jovem que pede mais 'bombinha' porque está usando quase todo dia",
  teachingTitle: "Asma não controlada na APS — avaliar controle e risco, técnica e adesão, abandonar SABA isolado, iniciar corticoide inalatório (ICS-formoterol), plano de ação escrito e retorno",
  group: "Atenção primária",
  specialties: ["Medicina de família", "Pneumologia"],
  environment: "consultorio",
  resourceProfile: "ubs-urbana",
  difficulty: 2,
  level: "internato",
  objectives: [
    "Avaliar controle dos sintomas e fatores de risco de exacerbação (uso de SABA, despertares, crises prévias)",
    "Verificar técnica inalatória, adesão, exposições (tabaco, alérgenos) e comorbidades",
    "Não manter tratamento só com SABA",
    "Iniciar ICS-formoterol (manutenção e alívio) ou ICS regular",
    "Entregar plano de ação escrito e agendar retorno em 1–3 meses"
  ],
  keywords: ["bombinha", "asma", "chiado", "acordar à noite", "receita", "falta de ar"],
  patient: {
    name: "Larissa Mendes",
    ageYears: 28,
    sex: "feminino",
    weightKg: 63,
    heightCm: 166,
    visual: { ageGroup: "adulto", sex: "feminino", skinTone: 4, hairStyle: "cacheado", hairColor: "preto", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "UBS, consulta. Mulher de 28 anos com asma desde a infância veio 'renovar a receita da bombinha' (salbutamol). Está bem agora, sem falta de ar.",
  communication: "normal",
  informants: [{ id: "paciente", name: "Larissa", role: "Paciente" }],
  history: [
    hi("h-controle", "evolucao", "Nas últimas 4 semanas: quantas vezes por semana teve sintomas ou usou a bombinha? Acordou à noite? Limitou alguma atividade?", [{ source: "paciente", text: "Uso a bombinha umas 4 vezes por semana, acordo com chiado duas noites por semana e parei a academia porque cansa." }], ["semana", "vezes", "acordou", "noite", "atividade", "controle"]),
    hi("h-risco", "sinais_alarme", "Quantos frascos usou no último ano? Já precisou de pronto-socorro, corticoide em comprimido ou internação?", [{ source: "paciente", text: "Uns 5 frascos no ano. Fui duas vezes na UPA e tomei prednisona em uma delas. Nunca internei." }], ["frascos", "pronto-socorro", "corticoide", "internação", "crises"]),
    hi("h-tratamento", "medicacoes", "Que remédios usa para asma? Usa algum de manutenção?", [{ source: "paciente", text: "Só o salbutamol. Me deram beclometasona uma vez, mas parei porque achei que não fazia efeito." }], ["manutenção", "beclometasona", "remédios", "corticoide inalatório"]),
    hi("h-gatilhos", "exposicao", "Fuma ou convive com fumante? Poeira, mofo, animais? Rinite, refluxo?", [{ source: "paciente", text: "Não fumo, mas meu marido fuma em casa. Tenho rinite, espirro muito de manhã." }], ["fuma", "fumante", "poeira", "mofo", "rinite"]),
    hi("h-gestacao", "ginecologico", "Pretende engravidar ou pode estar grávida?", [{ source: "paciente", text: "Penso em engravidar no ano que vem." }], ["grávida", "engravidar"]),
    hi("h-preferencia", "outros", "Como seria para você usar um inalador todos os dias?", [{ source: "paciente", text: "Se eu entender para que serve, tudo bem." }], ["usar", "todo dia", "preferência"])
  ],
  initial: {
    vars: { hr: 82, sbp: 116, dbp: 74, rr: 16, spo2: 98, temp: 36.6, gcs: 15, pain: 0, glucose: 92, perfusion: 0.9, effort: 0.1 },
    flags: { rhythm: "sinusal", posture: "sentado", painVisual: "nenhuma", speech: "frases", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-torax", "torax_anterior", "ausculta", "Sibilos esparsos à expiração forçada; sem esforço respiratório.", { sound: "sibilos" }),
    ex("e-nariz", "boca", "inspecao", "Mucosa nasal pálida e edemaciada (rinite).", { label: "Nariz/orofaringe" }),
    ex("e-tecnica", "geral", "especial", "Ao demonstrar: dispara o spray sem espaçador, inspira rápido e não faz pausa inspiratória.", { label: "Demonstração da técnica inalatória", better: [{ when: { actionCompleted: "avaliar_tecnica_inalatoria" }, text: "Após orientação, usa o dispositivo corretamente (expira, inspira lenta e profundamente, pausa)." }] })
  ],
  testResults: [],
  highlightedActions: ["avaliar_tecnica_inalatoria", "plano_acao_asma", "decisao_compartilhada"],
  rules: [
    { id: "r-tecnica", description: "Técnica corrigida", priority: 20, when: { actionCompleted: "avaliar_tecnica_inalatoria" }, repeat: "once", effects: [staff("paciente", "Nunca tinham me mostrado assim. Faz diferença!")] },
    { id: "r-ics", description: "Corticoide inalatório iniciado", priority: 30, when: ICS, repeat: "once", effects: [outcome("melhora")] },
    { id: "r-so-saba", description: "Plano mantém SABA isolado", priority: 40, when: { all: [DEFINIU, { not: ICS }] }, repeat: "once", effects: [obs("SABA isolado não é recomendado: ≥ 3 frascos/ano associa-se a exacerbações graves. Todo paciente com asma deve receber corticoide inalatório."), outcome("complicacao")] },
    { id: "r-corticoide-oral", description: "Corticoide oral sem exacerbação", priority: 35, when: { drugGiven: "prednisona" }, repeat: "once", effects: [obs("Sem exacerbação, corticoide oral não trata o descontrole crônico e expõe a efeitos adversos.")] },
    { id: "r-sem-plano", description: "Sem plano de ação escrito", priority: 40, when: { all: [DEFINIU, { not: { actionCompleted: "plano_acao_asma" } }] }, repeat: "once", effects: [obs("Todos os pacientes devem sair com plano de ação escrito.")] }
  ],
  diagnosis: { primary: "asma_nao_controlada", accepted: ["asma_nao_controlada"], differentials: ["asma_leve_moderada", "dpoc_exacerbado", "icc_descompensada", "crise_ansiedade"] },
  acceptedDestinations: ["retorno_programado"],
  outcomeNotes: "Asma não controlada (sintomas e uso de SABA 4x/semana, despertares 2x/semana, limitação de atividade) com alto risco de exacerbação (5 frascos/ano, 2 idas à UPA, corticoide oral) em tratamento só com SABA, técnica inadequada, tabagismo passivo e rinite. Corrigir técnica, iniciar budesonida-formoterol em manutenção e alívio (ou ICS regular), tratar rinite, orientar ambiente sem fumo, plano de ação escrito e retorno em 1–3 meses.",
  scoring: [
    { id: "s-controle", domain: "historia", description: "Controle dos sintomas (4 semanas)", evidence: { kind: "historyAsked", items: ["h-controle"], minCount: 1 }, points: 12, severity: "critica", rationale: "Define o descontrole." },
    { id: "s-risco", domain: "historia", description: "Risco de exacerbação (frascos, crises, corticoide)", evidence: { kind: "historyAsked", items: ["h-risco"], minCount: 1 }, points: 10, severity: "critica", rationale: "≥ 3 frascos/ano = risco.", sourceIds: ["INT-GINA-2023-RESUMO"] },
    { id: "s-trat", domain: "historia", description: "Tratamento atual e adesão", evidence: { kind: "historyAsked", items: ["h-tratamento"], minCount: 1 }, points: 8, severity: "importante", rationale: "Abandono do ICS." },
    { id: "s-gatilhos", domain: "historia", description: "Exposições e comorbidades", evidence: { kind: "historyAsked", items: ["h-gatilhos"], minCount: 1 }, points: 6, severity: "importante", rationale: "Tabagismo passivo, rinite.", sourceIds: ["INT-GINA-2023-RESUMO"] },
    { id: "s-exame", domain: "historia", description: "Ausculta e técnica observada", evidence: { kind: "examDone", regions: ["torax_anterior", "geral"], minCount: 2 }, points: 6, severity: "importante", rationale: "Ver o paciente usar o dispositivo." },
    { id: "s-tecnica", domain: "tratamento", description: "Corrigir técnica inalatória", evidence: { kind: "actionDone", anyOf: ["avaliar_tecnica_inalatoria"] }, points: 12, severity: "critica", rationale: "Antes de qualquer ajuste.", sourceIds: ["INT-GINA-2023-RESUMO"] },
    { id: "s-ics", domain: "tratamento", description: "Corticoide inalatório (ICS-formoterol)", evidence: { kind: "drugGiven", anyOf: ["budesonida_formoterol", "beclometasona"] }, points: 18, severity: "critica", rationale: "SABA isolado não recomendado.", sourceIds: ["INT-GINA-2023-RESUMO", "BR-ASMA"] },
    { id: "s-plano", domain: "destino", description: "Plano de ação escrito", evidence: { kind: "actionDone", anyOf: ["plano_acao_asma"] }, points: 12, severity: "critica", rationale: "Para todos.", sourceIds: ["INT-GINA-2023-RESUMO"] },
    { id: "s-decisao", domain: "destino", description: "Decisão compartilhada", evidence: { kind: "actionDone", anyOf: ["decisao_compartilhada"] }, points: 6, severity: "importante", rationale: "Adesão ao corticoide inalatório." },
    { id: "s-so-saba", domain: "tratamento", description: "Falha: manteve SABA isolado", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-so-saba" } }, points: 15, penalty: true, severity: "critica", rationale: "Risco de crise grave e morte." },
    { id: "s-cort", domain: "tratamento", description: "Falha: corticoide oral sem crise", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-corticoide-oral" } }, points: 5, penalty: true, severity: "importante", rationale: "Sem indicação." },
    { id: "s-dx", domain: "destino", description: "Asma não controlada", evidence: { kind: "diagnosis", accepted: ["asma_nao_controlada"] }, points: 4, severity: "importante", rationale: "Sem exacerbação atual." },
    { id: "s-destino", domain: "destino", description: "Retorno em 1–3 meses", evidence: { kind: "disposition", accepted: ["retorno_programado"] }, points: 6, severity: "importante", rationale: "Reavaliar controle.", sourceIds: ["INT-GINA-2023-RESUMO"] }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Quantas vezes por semana usa o alívio? Acorda à noite?" },
      { level: 2, text: "Quantos frascos no ano? Já foi à UPA?" },
      { level: 3, text: "Peça para ela mostrar como usa a bombinha." },
      { level: 4, text: "Sugestão explícita: controle e risco, técnica, gatilhos, budesonida-formoterol, plano de ação escrito, decisão compartilhada, retorno." }
    ],
    summary: "Asma não controlada com alto risco de exacerbação, tratada só com SABA.",
    pathophysiology: "A asma é inflamatória: o SABA alivia o broncoespasmo, mas não trata a inflamação; uso frequente de SABA isolado associa-se a mais exacerbações e mortes. O corticoide inalatório reduz inflamação, crises e mortalidade.",
    keyPoints: [
      "SABA isolado não é recomendado para adultos e adolescentes.",
      "Trilha preferida: ICS-formoterol como aliviador (Etapas 1–2) ou MART (Etapas 3–5).",
      "Antes de subir etapa: técnica, adesão, exposições, comorbidades.",
      "Plano de ação escrito para todos.",
      "Revisar em 1–3 meses; nunca retirar totalmente o ICS em adultos."
    ],
    alternatives: ["Trilha 2: beclometasona regular com salbutamol como alívio, se ICS-formoterol indisponível.", "Tratar rinite (corticoide nasal) e orientar ambiente livre de fumaça."],
    oralRubric: [
      { id: "o1", concept: "Controle e risco", synonyms: ["controle", "frascos", "despertar", "risco"], weight: 3 },
      { id: "o2", concept: "Sem SABA isolado", synonyms: ["corticoide inalatório", "ics", "formoterol"], weight: 3 },
      { id: "o3", concept: "Técnica/adesão", synonyms: ["técnica", "adesão", "espaçador"], weight: 2 },
      { id: "o4", concept: "Plano de ação", synonyms: ["plano de ação", "escrito"], weight: 2 }
    ],
    simplifications: ["Pico de fluxo e espirometria não modelados.", "Disponibilidade de budesonida-formoterol no SUS depende do PCDT/componente."]
  },
  references: ["INT-GINA-2023-RESUMO", "BR-ASMA", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Controle, risco, tratamento, gatilhos, exame, técnica, ICS-formoterol, plano, decisão, retorno", commands: [ask(10, "h-controle"), ask(20, "h-risco"), ask(30, "h-tratamento"), ask(40, "h-gatilhos"), { atSeconds: 50, type: "examine", payload: { region: "torax_anterior", maneuver: "ausculta" } }, { atSeconds: 60, type: "examine", payload: { region: "geral", maneuver: "especial" } }, act(70, "avaliar_tecnica_inalatoria"), rx(400, "budesonida_formoterol", "inal200", 200, "mcg", "inalatoria"), act(420, "decisao_compartilhada"), act(610, "plano_acao_asma"), dx(950, "asma_nao_controlada"), dest(1000, "retorno_programado")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-ics" }, description: "ICS" }, { condition: { not: { ruleFired: "r-so-saba" } }, description: "sem SABA isolado" }, { condition: { not: { ruleFired: "r-sem-plano" } }, description: "plano de ação" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta — só renova a receita", commands: [dest(600, "retorno_programado")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-so-saba" }, description: "SABA isolado" }, { condition: { ruleFired: "r-sem-plano" }, description: "sem plano" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Prednisona 'para limpar' e renova salbutamol", commands: [ask(10, "h-controle"), rx(200, "prednisona", "cp20", 40, "mg", "VO"), dest(600, "retorno_programado")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-corticoide-oral" }, description: "corticoide oral" }, { condition: { ruleFired: "r-so-saba" }, description: "SABA isolado" }] },
    { id: "t-atraso", kind: "delay", description: "Inicia ICS sem avaliar técnica nem entregar plano", commands: [ask(10, "h-controle"), rx(500, "budesonida_formoterol", "inal200", 200, "mcg", "inalatoria"), dest(900, "retorno_programado")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-ics" }, description: "ICS" }, { condition: { ruleFired: "r-sem-plano" }, description: "sem plano" }] },
    { id: "t-alternativa", kind: "alternative", description: "Trilha 2: beclometasona regular, técnica e plano", commands: [ask(10, "h-controle"), ask(20, "h-risco"), act(30, "avaliar_tecnica_inalatoria"), rx(340, "beclometasona", "spray250", 250, "mcg", "inalatoria"), act(360, "plano_acao_asma"), dest(800, "retorno_programado")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-ics" }, description: "ICS" }, { condition: { not: { ruleFired: "r-so-saba" } }, description: "sem SABA isolado" }] }
  ]
};
