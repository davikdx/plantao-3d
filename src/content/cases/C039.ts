import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, obs, outcome, rx, staff, test, trend } from "./helpers";

const ANTIPSEUDO = { any: [{ drugGiven: "cefepima" }, { drugGiven: "piperacilina_tazobactam" }] };
const VOL = (ml: number) => ({ any: [{ drugGiven: "sf09", minTotal: { value: ml, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: ml, unit: "mL" as const } }] });

export const C039: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C039",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Febre em mulher que está fazendo quimioterapia",
  teachingTitle: "Neutropenia febril de alto risco após quimioterapia",
  group: "Infectologia",
  specialties: ["Infectologia", "Oncologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Reconhecer neutropenia febril como emergência mesmo sem foco aparente",
    "Coletar hemoculturas sem atrasar o antibiótico",
    "Iniciar betalactâmico antipseudomonas urgentemente (em até 2 h; idealmente antes)",
    "Evitar vancomicina de rotina sem indicação específica",
    "Estratificar risco e definir internação"
  ],
  keywords: ["febre", "quimioterapia", "câncer", "fraqueza", "calafrio"],
  patient: {
    name: "Rosana Teles",
    ageYears: 48,
    sex: "feminino",
    weightKg: 64,
    heightCm: 158,
    visual: { ageGroup: "adulto", sex: "feminino", skinTone: 3, hairStyle: "careca", hairColor: "castanho", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Mulher de 48 anos em quimioterapia para câncer de mama (último ciclo há 9 dias) chega com febre de 38,6 °C e calafrios desde a manhã. Traz a carteirinha do serviço de oncologia.",
  communication: "normal",
  history: [
    h("h-queixa", "queixa", "O que a senhora está sentindo?", "Febre com tremedeira desde cedo, muita fraqueza.", { keywords: ["sentindo"] }),
    h("h-quimio", "medicacoes", "Quando foi a última quimioterapia? Quais remédios usa?", "O último ciclo foi há 9 dias. Uso o remédio para enjoo e um corticoide nos dias da quimio.", { keywords: ["quimioterapia", "quimio", "remédio", "ciclo"] }),
    h("h-foco", "fatores_associados", "Tem tosse, dor ao urinar, diarreia, dor no cateter ou feridas?", "Só a boca está com umas aftas doendo. Não tenho tosse, nem ardência, nem diarreia. O cateter não dói.", { keywords: ["tosse", "urinar", "diarreia", "cateter", "ferida", "foco"] }),
    h("h-antecedentes", "antecedentes", "Tem outras doenças?", "Não. Só o câncer de mama, descoberto há 4 meses.", { keywords: ["doença"] }),
    h("h-internacao", "cirurgias", "Esteve internada ou usou antibiótico recentemente?", "Não.", { keywords: ["internada", "antibiótico"] }),
    h("h-alergias", "alergias", "Tem alergia a algum remédio?", "Não tenho alergia.", { keywords: ["alergia"] })
  ],
  initial: {
    vars: { hr: 112, sbp: 98, dbp: 60, rr: 22, spo2: 97, temp: 38.6, gcs: 15, pain: 3, glucose: 118, perfusion: 0.75, effort: 0.3, wbc: 600, hb: 9.8, plt: 88000, creat: 0.8, urea: 30, na: 135, k: 3.7, pcr: 96, lactate: 1.9 },
    flags: { rhythm: "taquicardia_sinusal", sweating: true, tremor: true, posture: "supino" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Hipocorada, alopecia, calafrios; orientada.", {}),
    ex("e-boca", "boca", "inspecao", "Mucosite oral grau 2 (úlceras dolorosas em mucosa jugal), sem placas.", {}),
    ex("e-cateter", "torax_anterior", "inspecao", "Cateter totalmente implantado em região infraclavicular direita sem hiperemia, dor ou secreção.", { label: "Cateter implantado" }),
    ex("e-pulmao", "torax_posterior", "ausculta", "Murmúrio vesicular presente, sem ruídos adventícios.", { sound: "murmurio_normal" }),
    ex("e-abdome", "abdome_qid", "palpacao", "Abdome flácido, indolor; sem sinais de enterocolite.", {}),
    ex("e-perianal", "pelve", "inspecao", "Inspeção perianal sem lesões (toque retal evitado na neutropenia).", { label: "Região perianal" }),
    ex("e-perfusao", "membro_superior_d", "palpacao", "Pulso rápido, enchimento capilar 2–3 s.", { better: [{ when: { ruleFired: "r-hipotensao" }, text: "Pulso fino, extremidades frias, enchimento capilar 4 s." }] })
  ],
  testResults: [
    { testId: "hemograma", variants: [{ text: "Diferencial: neutrófilos 180/mm³ (neutropenia grave)." }] },
    { testId: "hemocultura", variants: [{ when: ANTIPSEUDO, text: "Coletadas após o antibiótico (menor sensibilidade); resultado em 48–72 h." }, { text: "2 pares coletados (periférico e via do cateter); resultado em 48–72 h." }] },
    { testId: "rx_torax", variants: [{ text: "Laudo educativo: sem consolidações." }] },
    { testId: "urina_tipo1", variants: [{ text: "Sem alterações significativas (a neutropenia pode reduzir a leucocitúria)." }] }
  ],
  highlightedActions: ["monitorizar", "acesso_venoso", "medir_temperatura"],
  rules: [
    { id: "r-atb", description: "Betalactâmico antipseudomonas: estabilização clínica", priority: 50, when: { all: [ANTIPSEUDO, { elapsedSince: "drug:cefepima", op: "gte", seconds: 1800 }] }, repeat: "once", effects: [trend("hr", 98, 1800, "atb", 50), trend("sbp", 108, 1800, "atb", 50), trend("temp", 37.9, 3600, "atb", 50), flag("tremor", false), outcome("estabilizacao_parcial")] },
    { id: "r-atb-pt", description: "Idem para piperacilina-tazobactam", priority: 50, when: { all: [{ drugGiven: "piperacilina_tazobactam" }, { elapsedSince: "drug:piperacilina_tazobactam", op: "gte", seconds: 1800 }] }, repeat: "once", effects: [trend("hr", 98, 1800, "atb", 50), trend("sbp", 108, 1800, "atb", 50), trend("temp", 37.9, 3600, "atb", 50), flag("tremor", false), outcome("estabilizacao_parcial")] },
    { id: "r-hipotensao", description: "Sem antibiótico antipseudomonas em 1 h: hipotensão", priority: 20, when: { all: [{ time: "gte", seconds: 3600 }, { not: ANTIPSEUDO }] }, repeat: "once", effects: [trend("sbp", 86, 900, "hipo", 20), trend("dbp", 50, 900, "hipo", 20), trend("hr", 126, 900, "hipo", 20), trend("lactate", 3.2, 1800, "hipo", 20), trend("perfusion", 0.55, 900, "hipo", 20), staff("enfermagem", "A pressão está caindo e ela está mais prostrada."), outcome("piora")] },
    { id: "r-choque", description: "Sem antibiótico em 2 h: choque séptico", priority: 22, when: { all: [{ time: "gte", seconds: 7200 }, { not: ANTIPSEUDO }] }, repeat: "once", effects: [trend("sbp", 72, 900, "choque", 22), trend("dbp", 40, 900, "choque", 22), trend("hr", 138, 900, "choque", 22), trend("lactate", 5.5, 1800, "choque", 22), flag("consciousness", "voz"), outcome("piora")] },
    { id: "r-obito", description: "Sem antibiótico nem volume por 3 h: óbito (desfecho definido pelo caso)", priority: 100, when: { all: [{ time: "gte", seconds: 10800 }, { not: ANTIPSEUDO }, { not: VOL(1000) }] }, repeat: "once", effects: [flag("pulse", false), flag("consciousness", "irresponsivo"), outcome("obito", true)] },
    { id: "r-ceftriaxona", description: "Ceftriaxona não cobre Pseudomonas", when: { all: [{ drugGiven: "ceftriaxona" }, { not: ANTIPSEUDO }] }, repeat: "once", effects: [obs("Ceftriaxona não tem atividade antipseudomonas adequada para neutropenia febril.")] },
    { id: "r-vanco", description: "Vancomicina sem indicação específica", when: { drugGiven: "vancomicina" }, repeat: "once", effects: [obs("Vancomicina não é rotina inicial: reservar para suspeita de infecção de cateter, pele, pneumonia ou instabilidade hemodinâmica.")] },
    { id: "r-volume", description: "Cristaloide melhora perfusão", priority: 30, when: VOL(1000), repeat: "once", effects: [trend("sbp", 100, 900, "vol", 30, 3600), trend("perfusion", 0.75, 900, "vol", 30, 3600)] },
    { id: "r-antitermico", description: "Antitérmico", when: { any: [{ drugGiven: "dipirona" }, { drugGiven: "paracetamol" }] }, repeat: "once", effects: [trend("temp", 37.8, 600, "antit", 20, 2400)] }
  ],
  diagnosis: { primary: "neutropenia_febril", accepted: ["neutropenia_febril"], differentials: ["sepse", "choque_septico", "pneumonia", "pielonefrite"] },
  acceptedDestinations: ["internacao_enfermaria", "uti"],
  outcomeNotes: "Febre ≥ 38,3 °C com neutrófilos < 500/mm³ após quimioterapia é emergência: hemoculturas e betalactâmico antipseudomonas urgentes, sem aguardar o hemograma quando a suspeita é clara. Paciente taquicárdica, com PA limítrofe e mucosite: alto risco, internação.",
  scoring: [
    { id: "s-quimio", domain: "historia", description: "Identificou quimioterapia recente (nadir)", evidence: { kind: "historyAsked", items: ["h-quimio"], minCount: 1 }, points: 8, severity: "critica", rationale: "Nadir de neutrófilos geralmente 7–14 dias após o ciclo." },
    { id: "s-foco", domain: "historia", description: "Pesquisou foco (pulmão, urina, intestino, cateter, pele, mucosa)", evidence: { kind: "historyAsked", items: ["h-foco"], minCount: 1 }, points: 5, severity: "importante", rationale: "Neutropênicos frequentemente não têm sinais inflamatórios evidentes." },
    { id: "s-exame", domain: "historia", description: "Examinou boca, cateter, pulmões e região perianal", evidence: { kind: "examDone", regions: ["boca", "torax_anterior", "torax_posterior", "pelve", "abdome_qid"], minCount: 3 }, points: 7, severity: "importante", rationale: "Busca sistemática de foco; evitar toque retal." },
    { id: "s-atb", domain: "priorizacao", description: "Betalactâmico antipseudomonas urgente (em até 2 h)", evidence: { kind: "drugGiven", anyOf: ["cefepima", "piperacilina_tazobactam"], withinSeconds: 7200 }, points: 14, severity: "critica", rationale: "Monoterapia empírica com betalactâmico antipseudomonas, urgente (em até 2 h da chegada).", alternatives: "Cefepima, piperacilina-tazobactam ou carbapenêmico.", sourceIds: ["INT-IDSA-NF-2010"] },
    { id: "s-atb-1h", domain: "priorizacao", description: "Antibiótico na primeira hora", evidence: { kind: "drugGiven", anyOf: ["cefepima", "piperacilina_tazobactam"], withinSeconds: 3600 }, points: 6, severity: "importante", rationale: "Paciente com taquicardia e PA limítrofe: quanto antes, melhor (meta institucional comum de 60 min)." },
    { id: "s-culturas", domain: "exames", description: "Hemoculturas (≥ 2 pares)", evidence: { kind: "testOrdered", anyOf: ["hemocultura"], withinSeconds: 3600 }, points: 8, severity: "importante", rationale: "Pelo menos 2 pares: periférico e de cada via do cateter.", sourceIds: ["INT-IDSA-NF-2010"] },
    { id: "s-hemograma", domain: "exames", description: "Hemograma com diferencial", evidence: { kind: "testOrdered", anyOf: ["hemograma"] }, points: 4, severity: "importante", rationale: "Confirmar neutropenia (o antibiótico não deve esperar o resultado)." },
    { id: "s-exames-excesso", domain: "exames", description: "Exames dirigidos", evidence: { kind: "testsNotExcessive", maxUnjustified: 2, justified: ["hemocultura", "hemograma", "funcao_renal", "eletrolitos", "hepatograma", "rx_torax", "urina_tipo1", "urocultura", "gaso_venosa", "pcr"] }, points: 3, severity: "menor", rationale: "Investigação guiada por sinais." },
    { id: "s-ceftri", domain: "tratamento", description: "Falha: antibiótico sem cobertura antipseudomonas", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-ceftriaxona" } }, points: 6, penalty: true, severity: "importante", rationale: "Pseudomonas é causa de alta mortalidade na neutropenia." },
    { id: "s-vanco", domain: "tratamento", description: "Vancomicina de rotina sem indicação", evidence: { kind: "avoidDrug", anyOf: ["vancomicina"] }, points: 3, penalty: true, severity: "menor", rationale: "Não recomendada como parte padrão do esquema inicial.", sourceIds: ["INT-IDSA-NF-2010"] },
    { id: "s-acesso", domain: "tratamento", description: "Acesso venoso e hidratação se necessário", evidence: { kind: "actionDone", anyOf: ["acesso_venoso"] }, points: 6, severity: "importante", rationale: "O cateter implantado pode ser usado (com técnica asséptica)." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou sinais vitais após o antibiótico", evidence: { kind: "reassessAfter", after: ["cefepima", "piperacilina_tazobactam"], reassess: ["monitorizacao_continua", "medir_pa", "medir_temperatura"], withinSeconds: 3600 }, points: 10, severity: "importante", rationale: "Risco de evolução para choque." },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de neutropenia febril", evidence: { kind: "diagnosis", accepted: ["neutropenia_febril"] }, points: 6, severity: "importante", rationale: "Febre + neutrófilos < 500/mm³." },
    { id: "s-destino", domain: "destino", description: "Internação", evidence: { kind: "disposition", accepted: ["internacao_enfermaria", "uti"] }, points: 14, severity: "importante", rationale: "Alto risco: antibiótico IV hospitalar.", sourceIds: ["INT-IDSA-NF-2010"] }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Quando foi a última quimioterapia? Em que fase dos neutrófilos ela está?" },
      { level: 2, text: "Ela tem foco evidente? Neutropênicos inflamam pouco." },
      { level: 3, text: "Bacilos Gram-negativos, incluindo Pseudomonas, matam rápido nesses pacientes." },
      { level: 4, text: "Sugestão explícita: hemoculturas (periférica e do cateter) e cefepima ou piperacilina-tazobactam sem esperar exames; internar." }
    ],
    summary: "Mulher de 48 anos no 9º dia após quimioterapia, com febre de 38,6 °C, taquicardia, PA limítrofe e mucosite, neutrófilos 180/mm³: neutropenia febril de alto risco.",
    pathophysiology: "A quimioterapia lesa a mucosa (porta de entrada) e suprime a medula, reduzindo neutrófilos. Sem neutrófilos, sinais clássicos de inflamação (pus, infiltrado, leucocitúria) podem estar ausentes, e bactérias Gram-negativas (incluindo Pseudomonas) causam sepse fulminante em horas.",
    keyPoints: [
      "Febre ≥ 38,3 °C (ou ≥ 38,0 °C por 1 h) + neutrófilos < 500/mm³ = neutropenia febril.",
      "Antibiótico antipseudomonas urgente; não esperar o hemograma quando a suspeita é clara.",
      "≥ 2 pares de hemoculturas, incluindo via do cateter.",
      "Vancomicina só com indicação específica.",
      "Alto risco: internação."
    ],
    alternatives: ["Piperacilina-tazobactam ou carbapenêmico em vez de cefepima."],
    oralRubric: [
      { id: "o1", concept: "Neutropenia febril como emergência", synonyms: ["neutropenia", "emergência", "nadir"], weight: 2 },
      { id: "o2", concept: "Antibiótico antipseudomonas urgente", synonyms: ["cefepima", "piperacilina", "antipseudomonas", "pseudomonas"], weight: 3 },
      { id: "o3", concept: "Hemoculturas", synonyms: ["hemocultura", "culturas"], weight: 1 },
      { id: "o4", concept: "Internação", synonyms: ["internação", "internar"], weight: 1 }
    ],
    simplifications: ["Escore MASCC não é calculado pelo simulador; o caso foi construído como alto risco."]
  },
  references: ["INT-IDSA-NF-2010", "INT-SSC-2021", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: false, allowWeightPercent: 15, allowVisualVariation: false, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Investiga, culturas, cefepima em 15 min, internação", commands: [ask(10, "h-quimio"), ask(20, "h-foco"), { atSeconds: 30, type: "examine", payload: { region: "boca", maneuver: "inspecao" } }, act(40, "monitorizar"), act(50, "acesso_venoso"), act(150, "acesso_venoso"), test(250, "hemocultura"), test(260, "hemograma"), rx(800, "cefepima", "fa2g", 2000, "mg", "IV"), dx(2500, "neutropenia_febril"), dest(2500, "internacao_enfermaria")], runUntilSeconds: 4000, expect: [{ condition: { ruleFired: "r-atb" }, description: "estabilização" }, { condition: { not: { ruleFired: "r-hipotensao" } }, description: "sem hipotensão" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 11000, expect: [{ condition: { ruleFired: "r-choque" }, description: "choque" }, { condition: { ruleFired: "r-obito" }, description: "óbito definido pelo caso" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Ceftriaxona e vancomicina", commands: [act(50, "acesso_venoso"), act(150, "acesso_venoso"), rx(400, "ceftriaxona", "fa1g", 2000, "mg", "IV"), rx(450, "vancomicina", "fa1g", 1000, "mg", "IV")], runUntilSeconds: 4000, expect: [{ condition: { ruleFired: "r-ceftriaxona" }, description: "sem cobertura" }, { condition: { ruleFired: "r-hipotensao" }, description: "hipotensão" }] },
    { id: "t-atraso", kind: "delay", description: "Espera o hemograma; cefepima aos 90 min com volume", commands: [act(50, "acesso_venoso"), act(150, "acesso_venoso"), test(250, "hemograma"), rx(5400, "cefepima", "fa2g", 2000, "mg", "IV"), rx(5420, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 30 })], runUntilSeconds: 8000, expect: [{ condition: { ruleFired: "r-hipotensao" }, description: "hipotensão pelo atraso" }, { condition: { ruleFired: "r-atb" }, description: "estabilização tardia" }, { condition: { not: { ruleFired: "r-choque" } }, description: "sem choque" }] },
    { id: "t-alternativa", kind: "alternative", description: "Piperacilina-tazobactam", commands: [act(50, "acesso_venoso"), act(150, "acesso_venoso"), test(250, "hemocultura"), rx(700, "piperacilina_tazobactam", "fa45", 4500, "mg", "IV")], runUntilSeconds: 3500, expect: [{ condition: { ruleFired: "r-atb-pt" }, description: "estabilização" }] }
  ]
};
