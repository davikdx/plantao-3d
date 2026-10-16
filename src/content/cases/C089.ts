import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const NAC = { drugGiven: "acetilcisteina" };

export const C089: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C089",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Jovem que tomou muitos comprimidos há algumas horas",
  teachingTitle: "Intoxicação aguda por paracetamol — cronologia, nível sérico e antídoto",
  group: "Toxicologia e acidentes",
  specialties: ["Toxicologia", "Emergência", "Psiquiatria"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Estabelecer a cronologia e a dose ingerida",
    "Não se tranquilizar pela ausência de sintomas iniciais",
    "Indicar acetilcisteína dentro da janela de maior benefício",
    "Interpretar o nível sérico conforme o tempo desde a ingestão",
    "Avaliar risco de suicídio e articular cuidado em saúde mental"
  ],
  keywords: ["comprimidos", "intoxicação", "remédio", "overdose", "tentativa"],
  patient: {
    name: "Bianca Moraes",
    ageYears: 19,
    sex: "feminino",
    weightKg: 58,
    heightCm: 164,
    visual: { ageGroup: "adulto", sex: "feminino", skinTone: 1, hairStyle: "longo", hairColor: "loiro", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Jovem de 19 anos trazida pela amiga, que encontrou cartelas vazias de paracetamol no quarto dela. A paciente está acordada, chorosa, e refere apenas enjoo.",
  communication: "normal",
  informants: [{ id: "amiga", name: "Letícia", role: "Amiga" }],
  history: [
    h("h-queixa", "queixa", "Como você está se sentindo?", "Só enjoada… não precisava ter vindo.", { keywords: ["sentindo"] }),
    h("h-hora", "inicio", "A que horas você tomou os comprimidos?", "Lá pelas 10 da manhã. (Agora são 14h.)", { keywords: ["que horas", "quando", "horas"] }),
    h("h-quantidade", "exposicao", "Quantos comprimidos e de qual remédio?", "Umas quatro cartelas de paracetamol de 500… acho que uns 40 comprimidos, de uma vez.", { keywords: ["quantos", "comprimidos", "remédio", "qual"], extra: [{ source: "amiga", text: "Encontrei quatro cartelas vazias de paracetamol 500 mg, de 10 comprimidos cada." }] }),
    h("h-outros", "exposicao", "Tomou mais alguma coisa junto? Bebida?", "Não, só isso. Não bebo.", { keywords: ["mais alguma", "junto", "bebida", "álcool"] }),
    h("h-intencao", "humor_risco", "Você tomou para se machucar ou acabar com a vida?", "Eu queria sumir… terminei o namoro e briguei com a minha mãe. Agora não sei.", { keywords: ["machucar", "acabar", "intenção", "sumir"] }),
    h("h-figado", "antecedentes", "Tem doença no fígado, usa outros remédios, está grávida?", "Não tenho doença. Tomo anticoncepcional. Menstruei há duas semanas.", { keywords: ["fígado", "doença", "grávida"] }),
    h("h-alergias", "alergias", "Tem alergia a algum medicamento?", "Não."),
    hi("h-amiga", "social", "(À amiga) Ela tem com quem ficar? Já tentou antes?", [{ source: "amiga", text: "Ela mora com a mãe. Nunca tinha feito isso, mas anda muito triste há meses." }], ["mora", "tentou", "antes"])
  ],
  initial: {
    vars: { hr: 92, sbp: 116, dbp: 72, rr: 16, spo2: 99, temp: 36.6, gcs: 15, pain: 2, glucose: 94, apap: 210, ast: 32, alt: 28, inr: 1.0, bili: 0.6, creat: 0.7, urea: 24, ph: 7.39, hco3: 23, lactate: 1.4, k: 3.9, na: 139, bhcg: 1 },
    flags: { posture: "supino", painVisual: "leve", speech: "frases" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Acordada, orientada, chorosa; sem sinais de intoxicação aguda ou lesões autoprovocadas.", { better: [{ when: { ruleFired: "r-hepatotox" }, text: "Prostrada, com náuseas e vômitos frequentes; ictérica?" }] }),
    ex("e-abdome", "abdome_qsd", "palpacao", "Abdome flácido, indolor; fígado não palpável.", { better: [{ when: { ruleFired: "r-hepatotox" }, text: "Dor à palpação em hipocôndrio direito; hepatomegalia discreta." }] }),
    ex("e-neuro", "neurologico", "especial", "Sem alterações; sem asterixis.", {}),
    ex("e-pupilas", "olhos", "inspecao", "Pupilas normais; escleras anictéricas.", { better: [{ when: { ruleFired: "r-hepatotox" }, text: "Escleras discretamente ictéricas." }] })
  ],
  testResults: [{ testId: "teste_gravidez_urina", variants: [{ text: "Negativo." }] }, { testId: "ecg12", variants: [{ text: "Ritmo sinusal, 90 bpm, sem alterações.", ecg: { rhythm: "sinusal", rate: 90, stElevationLeads: [], stDepressionLeads: [], peakedT: false, wideQrs: false } }] }],
  highlightedActions: ["contato_ciatox", "acesso_venoso", "avaliacao_risco_suicidio", "ambiente_seguro", "escuta_qualificada"],
  rules: [
    { id: "r-nac-precoce", description: "Acetilcisteína iniciada até ~8 h após a ingestão: proteção hepática", priority: 60, when: { all: [NAC, { time: "lte", seconds: 14400 }] }, repeat: "once", effects: [outcome("melhora")] },
    { id: "r-hepatotox", description: "Sem antídoto na janela, hepatotoxicidade se instala nas horas seguintes", priority: 30, when: { all: [{ time: "gte", seconds: 14400 }, { not: NAC }] }, repeat: "once", effects: [trend("alt", 3200, 10800, "hep", 30), trend("ast", 3800, 10800, "hep", 30), trend("inr", 2.4, 10800, "hep", 30), trend("bili", 3.2, 14400, "hep", 30), trend("pain", 6, 7200, "hep", 30), { type: "setFlag", flag: "jaundice", value: true }, staff("enfermagem", "Ela está vomitando muito e com dor do lado direito da barriga."), outcome("complicacao")] },
    { id: "r-nac-tardia", description: "Acetilcisteína tardia ainda reduz a gravidade", priority: 40, when: { all: [{ ruleFired: "r-hepatotox" }, NAC] }, repeat: "once", effects: [trend("alt", 1400, 7200, "nac-tardia", 40), trend("ast", 1600, 7200, "nac-tardia", 40), trend("inr", 1.5, 7200, "nac-tardia", 40)] },
    { id: "r-carvao", description: "Carvão ativado após 4 h: benefício improvável", when: { drugGiven: "carvao_ativado" }, repeat: "once", effects: [obs("Carvão ativado administrado ~4 h após a ingestão: benefício pouco provável; náusea piorou.")] },
    { id: "r-ciatox", description: "CIATox orienta conduta", when: { actionCompleted: "contato_ciatox" }, repeat: "once", effects: [staff("supervisor", "CIATox: ingestão estimada de ~340 mg/kg há 4 h, potencialmente hepatotóxica. Iniciar acetilcisteína IV sem aguardar o nível se este atrasar além da janela; colher nível sérico a partir de 4 h e transaminases/RNI.")] },
    { id: "r-fuga", description: "Sem ambiente seguro/acompanhamento, paciente tenta sair", priority: 20, when: { all: [{ time: "gte", seconds: 2400 }, { not: { actionCompleted: "ambiente_seguro" } }, { not: { actionCompleted: "escuta_qualificada" } }] }, repeat: "once", effects: [staff("enfermagem", "A paciente pegou a bolsa e disse que vai embora, que está bem."), obs("Risco de evasão: considerar acompanhamento contínuo e acolhimento.")] }
  ],
  diagnosis: { primary: "intox_paracetamol", accepted: ["intox_paracetamol", "intox_medicamentosa_intencional"], differentials: ["intox_medicamentosa_intencional", "episodio_depressivo", "gastroenterite", "risco_suicidio_alto"] },
  acceptedDestinations: ["internacao_enfermaria", "uti"],
  outcomeNotes: "Acetilcisteína iniciada até ~8 h da ingestão previne a hepatotoxicidade; após a janela, a lesão hepática surge horas depois (o antídoto tardio ainda atenua). A ausência de sintomas iniciais é típica. Avaliação de risco e cuidado em saúde mental fazem parte do caso.",
  scoring: [
    { id: "s-cronologia", domain: "historia", description: "Estabeleceu horário e quantidade ingerida", evidence: { kind: "historyAsked", items: ["h-hora", "h-quantidade"], minCount: 2 }, points: 10, severity: "critica", rationale: "Dose (mg/kg) e tempo definem risco e interpretação do nível sérico.", sourceIds: ["BR-CIATOX"] },
    { id: "s-coingestao", domain: "historia", description: "Pesquisou coingestões, hepatopatia e gestação", evidence: { kind: "historyAsked", items: ["h-outros", "h-figado"], minCount: 2 }, points: 5, severity: "importante", rationale: "Fatores que mudam risco e conduta." },
    { id: "s-intencao", domain: "historia", description: "Perguntou sobre intenção suicida", evidence: { kind: "historyAsked", items: ["h-intencao"], minCount: 1 }, points: 5, severity: "critica", rationale: "Toda intoxicação intencional exige avaliação de risco." },
    { id: "s-ciatox", domain: "priorizacao", description: "Contato com o CIATox", evidence: { kind: "actionDone", anyOf: ["contato_ciatox"] }, points: 6, severity: "importante", rationale: "Apoio especializado 24 h.", sourceIds: ["BR-CIATOX"] },
    { id: "s-seguranca", domain: "priorizacao", description: "Ambiente seguro/acompanhamento contínuo", evidence: { kind: "actionDone", anyOf: ["ambiente_seguro"] }, points: 6, severity: "importante", rationale: "Prevenir evasão e nova autoagressão." },
    { id: "s-nivel", domain: "exames", description: "Nível sérico de paracetamol (≥ 4 h) e função hepática/coagulação", evidence: { kind: "testOrdered", anyOf: ["paracetamol_serico", "hepatograma", "coagulograma"] }, points: 10, severity: "importante", rationale: "Nível em relação ao tempo indica tratamento; transaminases e RNI de base.", sourceIds: ["BR-CIATOX"] },
    { id: "s-exames-excesso", domain: "exames", description: "Exames dirigidos", evidence: { kind: "testsNotExcessive", maxUnjustified: 1, justified: ["paracetamol_serico", "hepatograma", "coagulograma", "funcao_renal", "eletrolitos", "gaso_venosa", "teste_gravidez_urina", "bhcg", "hemograma", "ecg12"] }, points: 5, severity: "menor", rationale: "Avaliação de toxicidade e coingestões." },
    { id: "s-nac", domain: "tratamento", description: "Acetilcisteína IV dentro da janela (até ~8 h da ingestão)", evidence: { kind: "drugGiven", anyOf: ["acetilcisteina"], withinSeconds: 14400 }, points: 16, severity: "critica", rationale: "Máxima eficácia quando iniciada até 8 h após a ingestão.", sourceIds: ["BR-CIATOX"] },
    { id: "s-acesso", domain: "tratamento", description: "Acesso venoso", evidence: { kind: "actionDone", anyOf: ["acesso_venoso"] }, points: 4, severity: "importante", rationale: "Para o antídoto e coletas." },
    { id: "s-risco", domain: "reavaliacao", description: "Avaliação estruturada de risco de suicídio", evidence: { kind: "actionDone", anyOf: ["avaliacao_risco_suicidio", "escuta_qualificada"] }, points: 10, severity: "importante", rationale: "Definir proteção e seguimento.", sourceIds: ["INT-WHO-MHGAP", "BR-RAPS"] },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de intoxicação por paracetamol", evidence: { kind: "diagnosis", accepted: ["intox_paracetamol", "intox_medicamentosa_intencional"] }, points: 4, severity: "importante", rationale: "Ingestão de ~340 mg/kg com nível acima da linha de tratamento." },
    { id: "s-destino", domain: "destino", description: "Internação para completar o antídoto, com saúde mental", evidence: { kind: "disposition", accepted: ["internacao_enfermaria", "uti"] }, points: 6, severity: "importante", rationale: "Regime de acetilcisteína dura horas; avaliação psiquiátrica antes da alta." },
    { id: "s-alta", domain: "destino", description: "Falha: alta por ausência de sintomas", evidence: { kind: "disposition", accepted: ["alta_orientada", "alta_com_seguimento_ubs"] }, points: 10, penalty: true, severity: "critica", rationale: "A fase inicial é pouco sintomática; a hepatotoxicidade aparece depois." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Quanto, quando e o quê? Calcule a dose em mg/kg." },
      { level: 2, text: "Ela está assintomática: isso tranquiliza?" },
      { level: 3, text: "O metabólito tóxico (NAPQI) se acumula quando a glutationa se esgota." },
      { level: 4, text: "Sugestão explícita: CIATox, nível sérico após 4 h, transaminases e RNI, acetilcisteína IV dentro de 8 h, ambiente seguro e avaliação de risco." }
    ],
    summary: "Jovem de 19 anos com ingestão intencional de ~20 g de paracetamol (~340 mg/kg) há 4 h, oligossintomática, nível sérico acima da linha de tratamento.",
    pathophysiology: "Em superdosagem, as vias de glicuronidação e sulfatação saturam e mais paracetamol é oxidado pelo CYP2E1 a NAPQI. Quando a glutationa hepática se esgota, o NAPQI se liga a proteínas e causa necrose centrolobular. A acetilcisteína repõe a glutationa; é mais eficaz até 8 h após a ingestão.",
    keyPoints: [
      "Fase inicial pouco sintomática: não liberar pela ausência de sintomas.",
      "Interpretar o nível sérico apenas a partir de 4 h, conforme o tempo (nomograma).",
      "Acetilcisteína até 8 h tem máxima eficácia; não atrasar se o nível demorar.",
      "Carvão ativado só tem benefício provável nas primeiras horas.",
      "Avaliação de risco de suicídio e cuidado em saúde mental."
    ],
    alternatives: ["Acetilcisteína por via oral em alguns protocolos (não modelado aqui)."],
    oralRubric: [
      { id: "o1", concept: "Cronologia e dose", synonyms: ["horário", "mg/kg", "quantidade", "tempo"], weight: 2 },
      { id: "o2", concept: "Nível sérico ≥ 4 h", synonyms: ["nível", "nomograma", "4 horas"], weight: 2 },
      { id: "o3", concept: "Acetilcisteína na janela", synonyms: ["acetilcisteína", "acetilcisteina", "nac", "8 horas"], weight: 3 },
      { id: "o4", concept: "Saúde mental", synonyms: ["risco", "suicídio", "psiquiatria", "caps"], weight: 2 }
    ],
    simplifications: ["Janela de 8 h e evolução hepática foram comprimidas em horas simuladas.", "Regime da acetilcisteína (etapas/bolsas) deve ser conferido no protocolo do CIATox (validação pendente)."]
  },
  references: ["BR-CIATOX", "INT-WHO-MHGAP", "BR-RAPS", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Cronologia, CIATox, nível, NAC na janela, risco e internação", commands: [ask(10, "h-hora"), ask(20, "h-quantidade"), ask(30, "h-intencao"), act(40, "ambiente_seguro"), act(110, "contato_ciatox"), act(420, "acesso_venoso"), act(520, "acesso_venoso"), test(620, "paracetamol_serico"), test(630, "hepatograma"), rx(700, "acetilcisteina", "amp300", 150, "mg/kg", "IV", "infusao_volume", { durationMinutes: 60 }), act(800, "avaliacao_risco_suicidio"), dx(1200, "intox_paracetamol"), dest(1200, "internacao_enfermaria")], runUntilSeconds: 20000, expect: [{ condition: { ruleFired: "r-nac-precoce" }, description: "antídoto na janela" }, { condition: { not: { ruleFired: "r-hepatotox" } }, description: "sem hepatotoxicidade" }, { condition: { path: "vars.alt", op: "lt", value: 100 }, description: "ALT normal" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem antídoto", commands: [], runUntilSeconds: 30000, expect: [{ condition: { ruleFired: "r-hepatotox" }, description: "hepatotoxicidade" }, { condition: { path: "vars.alt", op: "gt", value: 1000 }, description: "ALT > 1000" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Só carvão ativado e observação", commands: [rx(300, "carvao_ativado", "po50", 50, "g", "VO")], runUntilSeconds: 25000, expect: [{ condition: { ruleFired: "r-carvao" }, description: "benefício improvável" }, { condition: { ruleFired: "r-hepatotox" }, description: "hepatotoxicidade" }] },
    { id: "t-atraso", kind: "delay", description: "Espera o nível sérico e só inicia NAC após 6 h", commands: [act(60, "acesso_venoso"), act(160, "acesso_venoso"), test(300, "paracetamol_serico"), rx(21600, "acetilcisteina", "amp300", 150, "mg/kg", "IV", "infusao_volume", { durationMinutes: 60 })], runUntilSeconds: 32000, expect: [{ condition: { ruleFired: "r-hepatotox" }, description: "lesão hepática" }, { condition: { ruleFired: "r-nac-tardia" }, description: "NAC tardia atenua" }] },
    { id: "t-alternativa", kind: "alternative", description: "NAC empírica antes do nível sérico", commands: [ask(10, "h-hora"), act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(300, "acetilcisteina", "amp300", 150, "mg/kg", "IV", "infusao_volume", { durationMinutes: 60 })], runUntilSeconds: 16000, expect: [{ condition: { ruleFired: "r-nac-precoce" }, description: "antídoto na janela" }] }
  ]
};
