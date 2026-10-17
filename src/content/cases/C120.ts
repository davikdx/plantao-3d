import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const PUNCAO = { actionCompleted: "artrocentese" };
const ATB = { all: [{ drugGiven: "vancomicina" }, { drugGiven: "ceftriaxona" }] };
const ALGUM_ATB = { any: [{ drugGiven: "vancomicina" }, { drugGiven: "ceftriaxona" }] };

export const C120: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C120",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Homem com joelho quente, inchado e muito dolorido, com febre, que 'já teve gota'",
  teachingTitle: "Monoartrite aguda com febre — suspeitar de artrite séptica mesmo com história de gota, artrocentese antes do antibiótico (sem atrasá-lo), hemoculturas, vancomicina + ceftriaxona, ortopedia para lavagem e internação",
  group: "Outras urgências",
  specialties: ["Ortopedia", "Reumatologia", "Infectologia"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Tratar monoartrite aguda febril como artrite séptica até prova em contrário",
    "Realizar artrocentese com celularidade, Gram, cultura e cristais (cristais não excluem infecção)",
    "Colher hemoculturas e iniciar antibiótico empírico após a punção",
    "Acionar ortopedia para lavagem articular",
    "Internar; não tratar só como gota"
  ],
  keywords: ["joelho", "inchado", "quente", "febre", "gota", "não consegue andar"],
  patient: {
    name: "Sr. Geraldo Almeida",
    ageYears: 64,
    sex: "masculino",
    weightKg: 90,
    heightCm: 172,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 4, hairStyle: "careca", hairColor: "grisalho", build: "obeso", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Homem de 64 anos, diabético, com dor e inchaço no joelho direito há 2 dias, febre e incapacidade de apoiar a perna. Diz: 'é a gota de novo, só preciso do remédio'. Recebeu infiltração de corticoide nesse joelho há 3 semanas.",
  communication: "normal",
  informants: [{ id: "paciente", name: "Sr. Geraldo", role: "Paciente" }],
  history: [
    hi("h-inicio", "inicio", "Como começou? Já teve crises iguais? Neste joelho?", [{ source: "paciente", text: "Começou há 2 dias e foi piorando. A gota que tive foi no dedão do pé, há 3 anos. No joelho nunca." }], ["começou", "crises", "iguais", "gota"]),
    hi("h-risco", "antecedentes", "Fez infiltração, cirurgia ou tem prótese no joelho? Diabetes controlado? Usa corticoide? Ferida na pele?", [{ source: "paciente", text: "Fiz infiltração de corticoide nesse joelho há 3 semanas. Diabetes mais ou menos. Tenho uma ferida na perna que demora a sarar." }], ["infiltração", "cirurgia", "prótese", "diabetes", "corticoide", "ferida"]),
    hi("h-febre", "sinais_alarme", "Teve febre, calafrios? Outras articulações? Corrimento uretral, lesões de pele?", [{ source: "paciente", text: "Febre de 38,5 com calafrio ontem. Só o joelho. Nada de corrimento." }], ["febre", "calafrio", "outras articulações", "corrimento"])
  ],
  initial: {
    vars: { hr: 108, sbp: 132, dbp: 80, rr: 18, spo2: 97, temp: 38.6, gcs: 15, pain: 9, glucose: 236, perfusion: 0.8, effort: 0.1, wbc: 16900 },
    flags: { rhythm: "taquicardia_sinusal", posture: "supino", painVisual: "intensa", speech: "frases", consciousness: "alerta", edema: true },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-joelho", "membro_inferior_d", "palpacao", "Joelho direito com derrame volumoso, calor, eritema; dor intensa à mobilização passiva mínima; sinal da tecla positivo.", { label: "Joelho direito" }),
    ex("e-pele", "membro_inferior_e", "inspecao", "Úlcera crônica em perna esquerda, sem secreção purulenta.", { label: "Pele (porta de entrada)" }),
    ex("e-pe", "membro_inferior_e", "palpacao", "Tofos ausentes; primeiro metatarsofalangiano sem inflamação.", { label: "Outras articulações" })
  ],
  testResults: [
    { testId: "liquido_sinovial", variants: [{ text: "Turvo; leucócitos 86.000/mm³ com 94% de neutrófilos; Gram: cocos gram-positivos em agrupamentos; cristais de urato monossódico presentes (não excluem infecção); cultura em andamento." }] },
    { testId: "hemocultura", variants: [{ text: "Em andamento (crescimento de cocos gram-positivos em 24 h)." }] },
    { testId: "hemograma", variants: [{ text: "Leucócitos 16.900 com desvio à esquerda." }] },
    { testId: "pcr", variants: [{ text: "PCR 21 mg/dL." }] },
    { testId: "funcao_renal", variants: [{ text: "Creatinina 1,1." }] }
  ],
  highlightedActions: ["artrocentese", "solicitar_avaliacao_cirurgica"],
  rules: [
    { id: "r-puncao", description: "Artrocentese realizada", priority: 20, when: PUNCAO, repeat: "once", effects: [staff("enfermagem", "Aspirados 60 mL de líquido turvo, enviado para celularidade, Gram, cultura e cristais.")] },
    { id: "r-atb", description: "Antibiótico empírico completo", priority: 30, when: ATB, repeat: "once", effects: [trend("temp", 37.8, 3600, "atb", 30), trend("hr", 96, 1800, "atb", 30), outcome("estabilizacao_parcial")] },
    { id: "r-atb-sem-puncao", description: "Antibiótico antes da punção (punção disponível)", priority: 35, when: { all: [ALGUM_ATB, { not: PUNCAO }, { not: { ruleFired: "r-progressao" } }] }, repeat: "once", effects: [obs("Com punção disponível, colher líquido sinovial (e hemoculturas) antes do antibiótico reduz culturas negativas — sem atrasá-lo se a punção for demorar.")] },
    { id: "r-ortopedia", description: "Ortopedia acionada", priority: 25, when: { actionCompleted: "solicitar_avaliacao_cirurgica" }, repeat: "once", effects: [staff("supervisor", "Ortopedia: lavagem articular artroscópica hoje; manter antibiótico.")] },
    { id: "r-so-gota", description: "Tratado só como gota", priority: 40, when: { all: [{ drugGiven: "prednisona" }, { not: ALGUM_ATB }] }, repeat: "once", effects: [obs("Febre, infiltração recente e diabetes: artrite séptica precisa ser excluída por artrocentese; corticoide isolado pode agravar a infecção.")] },
    { id: "r-progressao", description: "Sem tratamento: sepse/destruição articular", priority: 30, when: { all: [{ time: "gte", seconds: 3000 }, { not: ALGUM_ATB }] }, repeat: "once", effects: [trend("temp", 39.4, 900, "prog", 30), trend("hr", 124, 900, "prog", 30), trend("sbp", 98, 900, "prog", 30), staff("enfermagem", "Tremores e febre de 39,4; pressão caindo."), outcome("piora")] },
    { id: "r-alta", description: "Alta", priority: 50, when: { any: [{ path: "disposition", op: "eq", value: "alta_orientada" }, { path: "disposition", op: "eq", value: "alta_com_seguimento_ubs" }, { path: "disposition", op: "eq", value: "encaminhamento_ambulatorial" }] }, repeat: "once", effects: [obs("Artrite séptica suspeita ou confirmada exige internação."), outcome("complicacao")] }
  ],
  diagnosis: { primary: "artrite_septica", accepted: ["artrite_septica"], differentials: ["gota_aguda", "celulite", "trombose_venosa_profunda", "sepse"] },
  acceptedDestinations: ["internacao_enfermaria", "centro_cirurgico"],
  outcomeNotes: "Artrite séptica do joelho (provável S. aureus; fatores: infiltração recente, diabetes, úlcera crônica), com cristais de urato coexistentes. Artrocentese (86.000 leucócitos, 94% PMN, Gram com cocos gram-positivos), hemoculturas, vancomicina 15–20 mg/kg + ceftriaxona 2 g IV após a punção, analgesia, controle glicêmico, ortopedia para lavagem e internação.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Início, padrão prévio e febre", evidence: { kind: "historyAsked", items: ["h-inicio", "h-febre"], minCount: 2 }, points: 8, severity: "critica", rationale: "Monoartrite febril." },
    { id: "s-risco", domain: "historia", description: "Fatores de risco (infiltração, diabetes, pele)", evidence: { kind: "historyAsked", items: ["h-risco"], minCount: 1 }, points: 8, severity: "critica", rationale: "Aumentam probabilidade de infecção.", sourceIds: ["INT-WIKEM-ARTRITE-2026"] },
    { id: "s-exame", domain: "historia", description: "Exame articular e porta de entrada", evidence: { kind: "examDone", regions: ["membro_inferior_d", "membro_inferior_e"], minCount: 2 }, points: 6, severity: "importante", rationale: "Derrame, dor à mobilização passiva." },
    { id: "s-puncao", domain: "exames", description: "Artrocentese", evidence: { kind: "actionDone", anyOf: ["artrocentese"], withinSeconds: 1500 }, points: 18, severity: "critica", rationale: "Obrigatória na suspeita.", sourceIds: ["INT-WIKEM-ARTRITE-2026"] },
    { id: "s-liquido", domain: "exames", description: "Líquido sinovial completo", evidence: { kind: "testOrdered", anyOf: ["liquido_sinovial"] }, points: 8, severity: "critica", rationale: "Celularidade, Gram, cultura, cristais.", sourceIds: ["INT-WIKEM-ARTRITE-2026"] },
    { id: "s-hemocult", domain: "exames", description: "Hemoculturas", evidence: { kind: "testOrdered", anyOf: ["hemocultura"] }, points: 6, severity: "importante", rationale: "Positivas em ~50%.", sourceIds: ["INT-WIKEM-ARTRITE-2026"] },
    { id: "s-vanco", domain: "tratamento", description: "Vancomicina", evidence: { kind: "drugGiven", anyOf: ["vancomicina"], withinSeconds: 2700 }, points: 10, severity: "critica", rationale: "Cobertura de MRSA.", sourceIds: ["INT-WIKEM-ARTRITE-2026"] },
    { id: "s-ceftri", domain: "tratamento", description: "Ceftriaxona", evidence: { kind: "drugGiven", anyOf: ["ceftriaxona"], withinSeconds: 2700 }, points: 8, severity: "critica", rationale: "Gram-negativos e gonococo.", sourceIds: ["INT-WIKEM-ARTRITE-2026"] },
    { id: "s-orto", domain: "tratamento", description: "Ortopedia para lavagem", evidence: { kind: "actionDone", anyOf: ["solicitar_avaliacao_cirurgica"] }, points: 10, severity: "critica", rationale: "Drenagem da articulação.", sourceIds: ["INT-WIKEM-ARTRITE-2026"] },
    { id: "s-analg", domain: "tratamento", description: "Analgesia", evidence: { kind: "drugGiven", anyOf: ["dipirona", "morfina"] }, points: 4, severity: "importante", rationale: "Dor intensa." },
    { id: "s-gota", domain: "tratamento", description: "Falha: tratado só como gota", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-so-gota" } }, points: 10, penalty: true, severity: "critica", rationale: "Ancoragem diagnóstica." },
    { id: "s-progr", domain: "tratamento", description: "Falha: progressão por atraso", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-progressao" } }, points: 12, penalty: true, severity: "critica", rationale: "Sepse e destruição articular." },
    { id: "s-dx", domain: "destino", description: "Artrite séptica", evidence: { kind: "diagnosis", accepted: ["artrite_septica"] }, points: 8, severity: "importante", rationale: "Cristais não excluem infecção." },
    { id: "s-destino", domain: "destino", description: "Internação (ou centro cirúrgico)", evidence: { kind: "disposition", accepted: ["internacao_enfermaria", "centro_cirurgico"] }, points: 6, severity: "importante", rationale: "Internar todos os suspeitos.", sourceIds: ["INT-WIKEM-ARTRITE-2026"] }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Monoartrite aguda com febre: qual diagnóstico não pode passar?" },
      { level: 2, text: "Que procedimento define o diagnóstico?" },
      { level: 3, text: "Achar cristais de urato exclui infecção?" },
      { level: 4, text: "Sugestão explícita: história, fatores de risco, exame, artrocentese, líquido sinovial, hemoculturas, vancomicina + ceftriaxona, ortopedia, internar." }
    ],
    summary: "Artrite séptica do joelho após infiltração, em diabético com gota prévia.",
    pathophysiology: "Bactérias (S. aureus mais comum) chegam à articulação por via hematogênica, inoculação direta (infiltração) ou contiguidade; a resposta inflamatória e enzimas bacterianas destroem a cartilagem em horas a dias. Gota e infecção podem coexistir.",
    keyPoints: [
      "Monoartrite aguda febril = artrite séptica até prova em contrário; febre ausente não exclui.",
      "Artrocentese: celularidade, Gram, cultura, cristais; > 50.000 com > 90% PMN sugere infecção.",
      "Cristais não excluem infecção.",
      "Vancomicina + ceftriaxona após punção e hemoculturas, sem atrasar.",
      "Lavagem articular pela ortopedia; internar."
    ],
    alternatives: ["Artrocentese guiada por ultrassom.", "Ceftriaxona 1 g/dia + tratamento de clamídia se suspeita gonocócica."],
    oralRubric: [
      { id: "o1", concept: "Suspeita", synonyms: ["artrite séptica", "infecção", "monoartrite"], weight: 2 },
      { id: "o2", concept: "Artrocentese", synonyms: ["artrocentese", "punção", "líquido sinovial", "gram"], weight: 3 },
      { id: "o3", concept: "Antibiótico", synonyms: ["vancomicina", "ceftriaxona", "hemocultura"], weight: 3 },
      { id: "o4", concept: "Cristais/lavagem", synonyms: ["cristais", "lavagem", "ortopedia"], weight: 2 }
    ],
    simplifications: ["Controle glicêmico não pontuado.", "Ajuste da vancomicina por nível sérico não modelado."]
  },
  references: ["INT-WIKEM-ARTRITE-2026", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 8, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "História, exame, artrocentese, líquido, hemoculturas, vanco + ceftriaxona, ortopedia, internação", commands: [ask(10, "h-inicio"), ask(20, "h-risco"), ask(30, "h-febre"), { atSeconds: 40, type: "examine", payload: { region: "membro_inferior_d", maneuver: "palpacao" } }, { atSeconds: 50, type: "examine", payload: { region: "membro_inferior_e", maneuver: "inspecao" } }, act(60, "acesso_venoso"), test(160, "hemocultura"), rx(200, "dipirona", "amp1g", 1000, "mg", "IV"), act(220, "artrocentese"), test(830, "liquido_sinovial"), rx(900, "vancomicina", "fa1g", 20, "mg/kg", "IV"), rx(920, "ceftriaxona", "fa1g", 2000, "mg", "IV"), act(940, "solicitar_avaliacao_cirurgica"), dx(1200, "artrite_septica"), dest(1500, "internacao_enfermaria")], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-atb" }, description: "antibiótico" }, { condition: { not: { ruleFired: "r-atb-sem-puncao" } }, description: "punção antes" }, { condition: { not: { ruleFired: "r-progressao" } }, description: "sem progressão" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-progressao" }, description: "progressão" }] },
    { id: "t-inadequada", kind: "inadequate", description: "'Gota': prednisona e alta", commands: [ask(10, "h-inicio"), rx(100, "prednisona", "cp20", 40, "mg", "VO"), dest(900, "alta_orientada")], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-so-gota" }, description: "só gota" }, { condition: { ruleFired: "r-alta" }, description: "alta" }, { condition: { ruleFired: "r-progressao" }, description: "progressão" }] },
    { id: "t-atraso", kind: "delay", description: "Antibiótico tardio, após sepse", commands: [ask(10, "h-inicio"), act(60, "acesso_venoso"), act(1000, "artrocentese"), rx(3100, "vancomicina", "fa1g", 20, "mg/kg", "IV"), rx(3120, "ceftriaxona", "fa1g", 2000, "mg", "IV"), dest(3500, "internacao_enfermaria")], runUntilSeconds: 4200, expect: [{ condition: { ruleFired: "r-progressao" }, description: "progressão" }, { condition: { ruleFired: "r-atb" }, description: "antibiótico tardio" }] },
    { id: "t-alternativa", kind: "alternative", description: "Antibiótico antes da punção (punção demoraria); ortopedia; centro cirúrgico", commands: [act(30, "acesso_venoso"), test(130, "hemocultura"), rx(250, "vancomicina", "fa1g", 15, "mg/kg", "IV"), rx(270, "ceftriaxona", "fa1g", 2000, "mg", "IV"), act(300, "solicitar_avaliacao_cirurgica"), act(400, "artrocentese"), dest(2000, "centro_cirurgico")], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-atb" }, description: "antibiótico" }, { condition: { ruleFired: "r-atb-sem-puncao" }, description: "observação sobre punção" }] }
  ]
};
