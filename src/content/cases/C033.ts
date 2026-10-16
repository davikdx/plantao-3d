import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, obs, outcome, rx, staff, test, trend } from "./helpers";

const DOXI = { drugGiven: "doxiciclina" };

export const C033: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C033",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Febre alta e manchas no corpo depois de pescaria",
  teachingTitle: "Febre maculosa — suspeição pela exposição a carrapatos e antibiótico sem aguardar confirmação",
  group: "Infectologia",
  specialties: ["Infectologia", "Emergência", "Saúde coletiva"],
  environment: "emergencia",
  resourceProfile: "upa-porte-ii",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Investigar exposição ambiental (carrapatos, áreas de mata, capivaras, cavalos)",
    "Reconhecer síndrome febril com exantema e plaquetopenia",
    "Iniciar doxiciclina imediatamente, sem aguardar exames específicos",
    "Notificar o caso e diferenciar de dengue e leptospirose"
  ],
  keywords: ["febre", "manchas", "dor no corpo", "carrapato", "pescaria"],
  patient: {
    name: "Rodrigo Teixeira",
    ageYears: 34,
    sex: "masculino",
    weightKg: 82,
    heightCm: 178,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 2, hairStyle: "curto", hairColor: "castanho", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "UPA 24h de cidade do interior paulista. Homem de 34 anos com febre há 4 dias, dor no corpo e dor de cabeça forte; ontem apareceram manchas vermelhas nos punhos e tornozelos.",
  communication: "normal",
  history: [
    h("h-queixa", "queixa", "O que o senhor está sentindo?", "Febre alta, dor de cabeça forte e dor no corpo todo, principalmente nas pernas.", { keywords: ["sentindo"] }),
    h("h-inicio", "inicio", "Há quantos dias?", "Quatro dias. As manchas começaram ontem."),
    h("h-manchas", "localizacao", "Onde começaram as manchas? Coçam?", "Nos punhos e tornozelos, não coçam. Hoje vi nas palmas das mãos.", { keywords: ["manchas", "coçam", "onde"] }),
    h("h-exposicao", "exposicao", "Esteve em mato, rio, contato com carrapato, capivara ou cavalo?", "Fui pescar na beira do rio há uns 10 dias, tem muita capivara lá. Tirei uns carrapatinhos da perna.", { keywords: ["mato", "rio", "carrapato", "capivara", "cavalo", "pescar"] }),
    h("h-dengue", "fatores_associados", "Teve sangramento, dor atrás dos olhos, vômitos?", "Vomitei duas vezes ontem. Não sangrei.", { keywords: ["sangramento", "olhos", "vômito"] }),
    h("h-urina", "fatores_associados", "Está urinando normalmente? A urina escureceu?", "Urinei pouco hoje.", { keywords: ["urina", "urinando"] }),
    h("h-medicacoes", "medicacoes", "Tomou algum remédio?", "Só dipirona, e um amigo me deu amoxicilina ontem.", { keywords: ["remédio", "tomou"] }),
    h("h-alergias", "alergias", "Tem alergia?", "Não.")
  ],
  initial: {
    vars: { hr: 114, sbp: 102, dbp: 62, rr: 22, spo2: 96, temp: 39.3, gcs: 15, pain: 6, glucose: 108, perfusion: 0.7, effort: 0.3, hb: 13.6, wbc: 6200, plt: 84000, na: 131, k: 3.8, creat: 1.5, urea: 62, ast: 148, alt: 112, bili: 1.4, pcr: 96, lactate: 2.2, cpk: 1150 },
    flags: { rhythm: "taquicardia_sinusal", rash: true, sweating: true, posture: "supino", painVisual: "moderada", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-pele", "pele", "inspecao", "Exantema maculopapular não pruriginoso em punhos, tornozelos, palmas e plantas; algumas petéquias nos membros inferiores.", { better: [{ when: { ruleFired: "r-progressao" }, text: "Lesões petequiais e sufusões hemorrágicas confluentes nos membros; extremidades frias." }] }),
    ex("e-perna", "membro_inferior_d", "inspecao", "Pequena lesão crostosa na panturrilha direita (provável local da picada).", { label: "Membros inferiores" }),
    ex("e-neuro", "neurologico", "especial", "Orientado; sem rigidez de nuca.", { better: [{ when: { ruleFired: "r-progressao" }, text: "Confuso e agitado; sem rigidez de nuca." }] }),
    ex("e-abdome", "abdome_qsd", "palpacao", "Fígado palpável a 2 cm do rebordo, discretamente doloroso.", {}),
    ex("e-pulmao", "torax_posterior", "ausculta", "Murmúrio presente, sem ruídos adventícios.", { sound: "murmurio_normal" })
  ],
  testResults: [
    { testId: "teste_rapido_dengue", variants: [{ text: "NS1 não reagente; IgM não reagente. (Não exclui dengue no início, mas não explica o quadro.)" }] },
    { testId: "hemocultura", variants: [{ text: "Coletada; resultado parcial sem crescimento. Para Rickettsia, a confirmação é por sorologia pareada (RIFI) ou PCR — resultado em dias/semanas (coleta encaminhada ao laboratório de referência)." }] }
  ],
  highlightedActions: ["medir_temperatura", "acesso_venoso", "notificacao", "acionar_samu"],
  rules: [
    { id: "r-doxi-precoce", description: "Doxiciclina antes da disfunção orgânica: melhora progressiva", priority: 60, when: { all: [DOXI, { elapsedSince: "drug:doxiciclina", op: "gte", seconds: 1800 }, { not: { ruleFired: "r-progressao" } }] }, repeat: "once", effects: [trend("temp", 37.6, 1800, "doxi", 60), trend("hr", 94, 1800, "doxi", 60), trend("pain", 3, 1800, "doxi", 60), obs("Defervescência começando (no modelo, horas foram comprimidas; na prática leva 24–72 h)."), outcome("melhora")] },
    { id: "r-progressao", description: "Sem doxiciclina, evolução para forma grave (choque, plaquetopenia, lesão renal)", priority: 30, when: { all: [{ time: "gte", seconds: 3600 }, { not: DOXI }] }, repeat: "once", effects: [trend("sbp", 80, 900, "grave", 30), trend("dbp", 46, 900, "grave", 30), trend("hr", 132, 900, "grave", 30), trend("plt", 32000, 1800, "grave", 30), trend("creat", 2.6, 1800, "grave", 30), trend("na", 127, 1800, "grave", 30), trend("lactate", 4.6, 1800, "grave", 30), trend("perfusion", 0.4, 900, "grave", 30), flag("agitation", true), staff("enfermagem", "Ele está confuso, a pressão caiu e as manchas escureceram."), outcome("complicacao")] },
    { id: "r-doxi-tardia", description: "Doxiciclina após a disfunção orgânica: estabilização parcial", priority: 40, when: { all: [DOXI, { ruleFired: "r-progressao" }, { elapsedSince: "drug:doxiciclina", op: "gte", seconds: 1800 }] }, repeat: "once", effects: [trend("temp", 38.2, 1800, "doxi2", 40), obs("Início tardio do antibiótico específico: letalidade maior; suporte intensivo necessário."), outcome("estabilizacao_parcial")] },
    { id: "r-ceftriaxona", description: "Ceftriaxona não trata riquetsiose", when: { all: [{ drugGiven: "ceftriaxona" }, { not: DOXI }] }, repeat: "once", effects: [obs("Betalactâmicos não têm ação sobre Rickettsia; o quadro não muda.")] },
    { id: "r-antitermico", description: "Antitérmico alivia a febre temporariamente", when: { any: [{ drugGiven: "dipirona" }, { drugGiven: "paracetamol" }] }, repeat: "once", effects: [trend("temp", 38.1, 600, "antitermico", 20, 2400)] },
    { id: "r-volume", description: "Cristaloide melhora parcialmente a hipotensão", when: { any: [{ drugGiven: "sf09", minTotal: { value: 1000, unit: "mL" } }, { drugGiven: "ringer_lactato", minTotal: { value: 1000, unit: "mL" } }] }, repeat: "once", effects: [trend("sbp", 104, 600, "vol", 35, 3600), trend("dbp", 62, 600, "vol", 35, 3600)] },
    { id: "r-notificacao", description: "Vigilância epidemiológica acionada", when: { actionCompleted: "notificacao" }, repeat: "once", effects: [staff("supervisor", "Vigilância epidemiológica: caso suspeito de febre maculosa notificado; orientada coleta de soro para sorologia pareada e investigação do local provável de infecção.")] },
    { id: "r-regulacao", description: "Regulação de leito", when: { actionCompleted: "acionar_samu" }, repeat: "once", effects: [staff("regulacao", "Regulação: leito de clínica médica/infectologia em hospital de referência disponível em 2 horas.")] }
  ],
  diagnosis: { primary: "febre_maculosa", accepted: ["febre_maculosa"], differentials: ["dengue_alarme", "leptospirose", "meningite_bacteriana", "sepse", "choque_septico"] },
  acceptedDestinations: ["transferencia_regulada"],
  outcomeNotes: "Febre + exantema palmoplantar + exposição a carrapatos em área com capivaras: suspeitar de febre maculosa e iniciar antibiótico específico (doxiciclina) imediatamente, sem aguardar sorologia. Plaquetopenia, hiponatremia, CPK e transaminases elevadas e lesão renal são sinais de gravidade. Notificação obrigatória; internação.",
  scoring: [
    { id: "s-exposicao", domain: "historia", description: "Perguntou sobre exposição a carrapatos/ambiente", evidence: { kind: "historyAsked", items: ["h-exposicao"], minCount: 1 }, points: 10, severity: "critica", rationale: "A epidemiologia é a chave do diagnóstico precoce.", sourceIds: ["BR-FM"] },
    { id: "s-sintomas", domain: "historia", description: "Caracterizou exantema e sinais de alarme", evidence: { kind: "historyAsked", items: ["h-manchas", "h-dengue", "h-urina"], minCount: 2 }, points: 5, severity: "importante", rationale: "Diferencial com dengue e leptospirose." },
    { id: "s-exame", domain: "historia", description: "Examinou pele (palmas/plantas) e procurou local de picada", evidence: { kind: "examDone", regions: ["pele", "membro_inferior_d"], minCount: 1 }, points: 5, severity: "importante", rationale: "Exantema palmoplantar sugere riquetsiose." },
    { id: "s-acesso", domain: "priorizacao", description: "Acesso venoso e avaliação hemodinâmica", evidence: { kind: "actionDone", anyOf: ["acesso_venoso"] }, points: 5, severity: "importante", rationale: "Taquicardia e PA limítrofe." },
    { id: "s-notificacao", domain: "priorizacao", description: "Notificação do caso suspeito", evidence: { kind: "actionDone", anyOf: ["notificacao"] }, points: 10, severity: "importante", rationale: "Notificação obrigatória; investigação em até 48 h.", sourceIds: ["BR-FM"] },
    { id: "s-exames", domain: "exames", description: "Hemograma, função renal, eletrólitos, hepatograma", evidence: { kind: "testOrdered", anyOf: ["hemograma", "funcao_renal", "hepatograma"] }, points: 7, severity: "importante", rationale: "Plaquetopenia, lesão renal e hepática indicam gravidade.", sourceIds: ["BR-FM"] },
    { id: "s-exames-excesso", domain: "exames", description: "Exames dirigidos", evidence: { kind: "testsNotExcessive", maxUnjustified: 1, justified: ["hemograma", "funcao_renal", "eletrolitos", "hepatograma", "teste_rapido_dengue", "hemocultura", "gaso_venosa", "cpk", "coagulograma", "urina_tipo1"] }, points: 8, severity: "menor", rationale: "Diferenciais e gravidade." },
    { id: "s-doxi", domain: "tratamento", description: "Doxiciclina em até 1 hora, sem aguardar confirmação", evidence: { kind: "drugGiven", anyOf: ["doxiciclina"], withinSeconds: 3600 }, points: 20, severity: "critica", rationale: "Atraso no antibiótico específico aumenta a letalidade.", sourceIds: ["BR-FM", "BR-FM-2026"] },
    { id: "s-ceftri", domain: "tratamento", description: "Falha: só betalactâmico", evidence: { kind: "stateAtEnd", when: { all: [{ ruleFired: "r-ceftriaxona" }, { not: DOXI }] } }, points: 6, penalty: true, severity: "importante", rationale: "Sem ação sobre Rickettsia." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou PA e diurese após início do tratamento", evidence: { kind: "reassessAfter", after: ["doxiciclina"], reassess: ["medir_pa", "diurese_horaria", "hemograma"], withinSeconds: 3600 }, points: 10, severity: "importante", rationale: "Risco de evolução para choque." },
    { id: "s-dx", domain: "destino", description: "Hipótese de febre maculosa", evidence: { kind: "diagnosis", accepted: ["febre_maculosa"] }, points: 6, severity: "importante", rationale: "Exantema palmoplantar com exposição a carrapatos." },
    { id: "s-destino", domain: "destino", description: "Internação via regulação", evidence: { kind: "disposition", accepted: ["transferencia_regulada"] }, points: 4, severity: "importante", rationale: "Sinais de gravidade laboratorial e hemodinâmica." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Onde ele esteve nas últimas duas semanas?" },
      { level: 2, text: "Exantema em palmas e plantas após picada de carrapato…" },
      { level: 3, text: "A confirmação laboratorial leva semanas; o tratamento não pode esperar." },
      { level: 4, text: "Sugestão explícita: doxiciclina imediata, acesso, exames de gravidade, notificação e internação via regulação." }
    ],
    summary: "Homem de 34 anos com febre há 4 dias, exantema palmoplantar, plaquetopenia, hiponatremia e lesão renal após pescaria em área com capivaras e carrapatos.",
    pathophysiology: "Rickettsia rickettsii, transmitida por carrapatos (Amblyomma), infecta o endotélio e causa vasculite sistêmica: aumento de permeabilidade, edema, hipovolemia, plaquetopenia por consumo e disfunção de múltiplos órgãos. A letalidade da forma grave é alta quando o antibiótico atrasa.",
    keyPoints: [
      "Febre + exposição a carrapatos/capivaras = pensar em febre maculosa.",
      "Iniciar antibiótico específico imediatamente, antes do resultado laboratorial.",
      "Doxiciclina é o antibiótico de escolha (dose e duração: conferir na Nota Técnica vigente).",
      "Plaquetopenia, hiponatremia, lesão renal e hepática sugerem gravidade.",
      "Notificação obrigatória; diferencial com dengue e leptospirose."
    ],
    alternatives: ["Cloranfenicol IV nas formas graves conforme protocolo nacional (não modelado)."],
    oralRubric: [
      { id: "o1", concept: "Exposição a carrapatos", synonyms: ["carrapato", "capivara", "exposição", "mato"], weight: 2 },
      { id: "o2", concept: "Doxiciclina imediata", synonyms: ["doxiciclina", "antibiótico", "imediato"], weight: 3 },
      { id: "o3", concept: "Notificação", synonyms: ["notificação", "notificar", "vigilância"], weight: 1 },
      { id: "o4", concept: "Sinais de gravidade", synonyms: ["plaquetas", "plaquetopenia", "creatinina", "sódio", "choque"], weight: 2 }
    ],
    simplifications: ["Evolução de dias foi comprimida em horas simuladas.", "Sorologia/PCR específicas não estão no catálogo de exames desta versão."]
  },
  references: ["BR-FM", "BR-FM-2026", "BR-DENGUE", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 15, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Exposição, exame, doxiciclina, exames, notificação e regulação", commands: [ask(10, "h-exposicao"), ask(20, "h-manchas"), { atSeconds: 30, type: "examine", payload: { region: "pele", maneuver: "inspecao" } }, act(60, "acesso_venoso"), act(160, "acesso_venoso"), test(200, "hemograma"), test(210, "funcao_renal"), test(220, "hepatograma"), rx(400, "doxiciclina", "cp100", 100, "mg", "VO"), rx(420, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), act(500, "notificacao"), act(2400, "medir_pa"), act(2500, "acionar_samu"), dx(3000, "febre_maculosa"), dest(3000, "transferencia_regulada")], runUntilSeconds: 4500, expect: [{ condition: { ruleFired: "r-doxi-precoce" }, description: "melhora" }, { condition: { not: { ruleFired: "r-progressao" } }, description: "sem forma grave" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 4500, expect: [{ condition: { ruleFired: "r-progressao" }, description: "forma grave" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Trata como sepse comum com ceftriaxona", commands: [act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(300, "ceftriaxona", "fa1g", 2000, "mg", "IV"), rx(320, "dipirona", "amp1g", 1000, "mg", "IV")], runUntilSeconds: 4500, expect: [{ condition: { ruleFired: "r-ceftriaxona" }, description: "sem cobertura" }, { condition: { ruleFired: "r-progressao" }, description: "progressão" }] },
    { id: "t-atraso", kind: "delay", description: "Aguarda exames; doxiciclina só depois da piora", commands: [act(60, "acesso_venoso"), act(160, "acesso_venoso"), test(200, "teste_rapido_dengue"), rx(4000, "doxiciclina", "cp100", 100, "mg", "VO")], runUntilSeconds: 6500, expect: [{ condition: { ruleFired: "r-progressao" }, description: "forma grave" }, { condition: { ruleFired: "r-doxi-tardia" }, description: "estabilização parcial" }] },
    { id: "t-alternativa", kind: "alternative", description: "Doxiciclina direto na triagem clínica, sem exames", commands: [ask(10, "h-exposicao"), rx(100, "doxiciclina", "cp100", 100, "mg", "VO"), act(200, "notificacao")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-doxi-precoce" }, description: "melhora" }] }
  ]
};
