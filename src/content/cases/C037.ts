import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, h, obs, outcome, rx, staff, test, trend } from "./helpers";

const ATB = { any: [{ drugGiven: "vancomicina" }, { drugGiven: "ceftriaxona" }, { drugGiven: "piperacilina_tazobactam" }] };
const CULTURA = { testCollected: "hemocultura" };

export const C037: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C037",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Febre há três semanas e cansaço em homem jovem",
  teachingTitle: "Endocardite infecciosa de câmaras direitas em usuário de drogas injetáveis",
  group: "Infectologia",
  specialties: ["Infectologia", "Cardiologia", "Clínica médica"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "residencia",
  objectives: [
    "Suspeitar de endocardite em febre prolongada com fator de risco e sopro novo",
    "Coletar ao menos três pares de hemoculturas antes do antibiótico em paciente estável",
    "Solicitar ecocardiograma como imagem de primeira linha",
    "Reconhecer complicações embólicas e abordar redução de danos e testagem"
  ],
  keywords: ["febre", "cansaço", "emagrecimento", "sopro", "droga", "injeção", "tosse"],
  patient: {
    name: "Marcelo Duarte",
    ageYears: 31,
    sex: "masculino",
    weightKg: 61,
    heightCm: 176,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 2, hairStyle: "curto", hairColor: "castanho", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Homem de 31 anos com febre diária há cerca de 3 semanas, cansaço, emagrecimento e tosse com dor ao respirar há 4 dias. Está acordado e conversando.",
  communication: "normal",
  history: [
    h("h-queixa", "queixa", "O que o trouxe aqui?", "Febre todo dia há umas três semanas, suor à noite, cansaço. Agora uma tosse e dor no peito quando respiro fundo.", { keywords: ["trouxe", "sentindo"] }),
    h("h-emagrecimento", "evolucao", "Perdeu peso?", "Uns 6 quilos nesse mês.", { keywords: ["peso", "emagreceu"] }),
    h("h-drogas", "habitos", "Usa álcool, cigarro ou outras drogas? Por qual via?", "Uso cocaína injetável há uns dois anos. Às vezes divido seringa.", { keywords: ["droga", "injetável", "seringa", "usa"] }),
    h("h-antecedentes", "antecedentes", "Tem alguma doença do coração ou já fez cirurgia no coração?", "Que eu saiba, não.", { keywords: ["coração", "doença", "valva"] }),
    h("h-medicacoes", "medicacoes", "Tomou antibiótico recentemente?", "Não tomei nada, só dipirona.", { keywords: ["antibiótico", "remédio"] }),
    h("h-hiv", "outros", "Já fez teste para HIV, hepatite B ou C?", "Nunca fiz.", { keywords: ["hiv", "teste", "hepatite"] }),
    h("h-dente", "fatores_associados", "Teve problema nos dentes ou outra infecção recente?", "Não.", { keywords: ["dente"] }),
    h("h-alergias", "alergias", "Tem alergia a algum remédio?", "Não sei de nenhuma.")
  ],
  initial: {
    vars: { hr: 108, sbp: 112, dbp: 64, rr: 22, spo2: 94, temp: 38.7, gcs: 15, pain: 4, glucose: 98, perfusion: 0.85, effort: 0.8, wbc: 16800, hb: 10.6, ht: 32, plt: 168000, pcr: 154, creat: 1.0, urea: 32, na: 136, k: 4.0, lactate: 1.6 },
    flags: { rhythm: "taquicardia_sinusal", cough: true, sweating: true, posture: "sentado" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Emagrecido, febril, hipocorado; orientado.", {}),
    ex("e-bracos", "membro_superior_e", "inspecao", "Múltiplas marcas de punção em fossa antecubital esquerda, uma com celulite leve.", { label: "Membros superiores" }),
    ex("e-coracao", "coracao", "ausculta", "Sopro holossistólico em foco tricúspide, que aumenta na inspiração.", { sound: "sopro", label: "Precórdio" }),
    ex("e-jugular", "pescoco", "inspecao", "Onda v proeminente no pulso venoso jugular.", {}),
    ex("e-pulmao", "torax_posterior", "ausculta", "Estertores finos em bases bilaterais; atrito pleural à direita.", { sound: "estertores" }),
    ex("e-pele", "pele", "inspecao", "Algumas petéquias em conjuntiva palpebral inferior; sem lesões palmoplantares.", {}),
    ex("e-abdome", "abdome_qse", "palpacao", "Baço palpável no rebordo costal esquerdo.", {})
  ],
  testResults: [
    { testId: "hemocultura", variants: [{ when: ATB, text: "Coletadas após o antibiótico: risco de culturas falso-negativas (resultado final em 48–72 h)." }, { text: "3 pares coletados antes do antibiótico; resultado em 48–72 h. (No seguimento do caso: Staphylococcus aureus em 3/3 pares.)" }] },
    { testId: "eco_transtoracico", variants: [{ text: "Laudo educativo: vegetação móvel de ~14 mm na valva tricúspide com insuficiência tricúspide moderada; valvas esquerdas sem vegetações visíveis." }] },
    { testId: "rx_torax", variants: [{ text: "Laudo educativo: múltiplos nódulos periféricos bilaterais, alguns cavitados, compatíveis com êmbolos sépticos; pequeno derrame pleural à direita." }] },
    { testId: "teste_rapido_hiv", variants: [{ text: "Teste rápido para HIV não reagente (repetir conforme janela imunológica e fluxo do serviço)." }] },
    { testId: "urina_tipo1", variants: [{ text: "Hematúria microscópica discreta; sem leucocitúria significativa." }] }
  ],
  highlightedActions: ["monitorizar", "acesso_venoso", "medir_temperatura", "o2_cateter"],
  rules: [
    { id: "r-atb-antes-cultura", description: "Antibiótico iniciado antes da coleta de hemoculturas em paciente estável", priority: 90, when: { all: [ATB, { not: CULTURA }] }, repeat: "once", effects: [obs("Antibiótico administrado antes das hemoculturas: maior chance de culturas negativas e de não identificar o agente.")] },
    { id: "r-atb", description: "Antibiótico empírico após culturas: início de resposta (lenta)", priority: 50, when: { all: [ATB, CULTURA] }, repeat: "once", effects: [trend("temp", 38, 3600, "atb", 50), trend("hr", 98, 3600, "atb", 50), outcome("estabilizacao_parcial")] },
    { id: "r-embolia", description: "Sem antibiótico em 90 min (modelo comprimido): novos êmbolos sépticos pulmonares", priority: 30, when: { all: [{ time: "gte", seconds: 5400 }, { not: ATB }] }, repeat: "once", effects: [trend("spo2", 89, 600, "emb", 30), trend("rr", 28, 600, "emb", 30), trend("hr", 122, 600, "emb", 30), trend("effort", 1.6, 600, "emb", 30), staff("enfermagem", "Ele está mais cansado, com dor ao respirar e saturação caindo."), outcome("piora")] },
    { id: "r-o2", description: "Oxigênio corrige hipoxemia leve", priority: 35, when: { any: [{ deviceActive: "cateter_nasal" }, { deviceActive: "mascara_reservatorio" }] }, repeat: "while", effects: [trend("spo2", 96, 120, "o2", 35)], onEnd: [{ type: "clearTrend", var: "spo2", slot: "o2" }] },
    { id: "r-antitermico", description: "Antitérmico alivia febre temporariamente", when: { any: [{ drugGiven: "dipirona" }, { drugGiven: "paracetamol" }] }, repeat: "once", effects: [trend("temp", 37.8, 600, "antitermico", 20, 2400)] }
  ],
  diagnosis: { primary: "endocardite_infecciosa", accepted: ["endocardite_infecciosa"], differentials: ["pneumonia", "tep", "sepse", "febre_maculosa"] },
  acceptedDestinations: ["internacao_enfermaria", "uti"],
  outcomeNotes: "Febre prolongada + uso de drogas injetáveis + sopro tricúspide + êmbolos pulmonares sépticos: endocardite de câmaras direitas. Paciente estável: coletar ≥ 3 pares de hemoculturas antes do antibiótico, solicitar ecocardiograma, iniciar antibiótico empírico conforme protocolo e internar para tratamento prolongado IV. Abordar testagem (HIV, hepatites) e redução de danos.",
  scoring: [
    { id: "s-risco", domain: "historia", description: "Identificou uso de drogas injetáveis e compartilhamento de seringas", evidence: { kind: "historyAsked", items: ["h-drogas"], minCount: 1 }, points: 10, severity: "critica", rationale: "Principal fator de risco para endocardite direita." },
    { id: "s-hist", domain: "historia", description: "Caracterizou febre prolongada, emagrecimento e antibiótico prévio", evidence: { kind: "historyAsked", items: ["h-emagrecimento", "h-medicacoes", "h-antecedentes"], minCount: 2 }, points: 5, severity: "importante", rationale: "Antibiótico prévio reduz a sensibilidade das culturas." },
    { id: "s-exame", domain: "historia", description: "Auscultou o coração e procurou estigmas (pele, baço, punções)", evidence: { kind: "examDone", regions: ["coracao", "membro_superior_e", "pele", "abdome_qse"], minCount: 2 }, points: 8, severity: "critica", rationale: "Sopro novo é critério diagnóstico; estigmas embólicos e esplenomegalia reforçam." },
    { id: "s-culturas", domain: "exames", description: "Hemoculturas solicitadas", evidence: { kind: "testOrdered", anyOf: ["hemocultura"], withinSeconds: 3600 }, points: 10, severity: "critica", rationale: "≥ 3 pares com intervalo de 30 min antes do antibiótico.", sourceIds: ["INT-ESC-EI-2023"] },
    { id: "s-cultura-antes", domain: "exames", description: "Falha: antibiótico antes das hemoculturas em paciente estável", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-atb-antes-cultura" } }, points: 10, penalty: true, severity: "critica", rationale: "Compromete a identificação do agente e a duração/escolha do tratamento.", sourceIds: ["INT-ESC-EI-2023"] },
    { id: "s-eco", domain: "exames", description: "Ecocardiograma solicitado", evidence: { kind: "testOrdered", anyOf: ["eco_transtoracico"] }, points: 8, severity: "importante", rationale: "Imagem de primeira linha para o diagnóstico.", sourceIds: ["INT-ESC-EI-2023"] },
    { id: "s-hiv", domain: "exames", description: "Ofereceu testagem para HIV", evidence: { kind: "testOrdered", anyOf: ["teste_rapido_hiv"] }, points: 3, severity: "menor", rationale: "População com risco de infecções de transmissão sanguínea; testar também hepatites (fluxo local)." },
    { id: "s-exames-excesso", domain: "exames", description: "Exames dirigidos", evidence: { kind: "testsNotExcessive", maxUnjustified: 2, justified: ["hemocultura", "eco_transtoracico", "rx_torax", "hemograma", "funcao_renal", "eletrolitos", "pcr", "urina_tipo1", "teste_rapido_hiv", "ecg12", "gaso_venosa"] }, points: 4, severity: "menor", rationale: "Investigação do foco e complicações." },
    { id: "s-atb", domain: "tratamento", description: "Antibiótico empírico IV após as culturas", evidence: { kind: "drugGiven", anyOf: ["vancomicina", "ceftriaxona", "piperacilina_tazobactam"], withinSeconds: 5400 }, points: 14, severity: "importante", rationale: "Paciente estável: iniciar após as culturas; cobertura de S. aureus (incluindo MRSA conforme epidemiologia local).", alternatives: "Esquema empírico conforme protocolo institucional (não conferido nesta versão).", sourceIds: ["INT-ESC-EI-2023"] },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou oxigenação e sinais vitais", evidence: { kind: "actionDone", anyOf: ["monitorizar", "oximetria_portatil"] }, points: 8, severity: "importante", rationale: "Êmbolos pulmonares podem piorar a oxigenação." },
    { id: "s-dx", domain: "destino", description: "Hipótese de endocardite infecciosa", evidence: { kind: "diagnosis", accepted: ["endocardite_infecciosa"] }, points: 10, severity: "importante", rationale: "Critérios clínicos, microbiológicos e de imagem (Duke)." },
    { id: "s-destino", domain: "destino", description: "Internação para antibiótico IV prolongado", evidence: { kind: "disposition", accepted: ["internacao_enfermaria", "uti"] }, points: 10, severity: "importante", rationale: "Tratamento IV por semanas e avaliação de equipe multiprofissional (Endocarditis Team)." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Febre há três semanas: o que pode estar alimentando uma bacteremia contínua?" },
      { level: 2, text: "Ausculte o coração com atenção. O sopro muda com a respiração?" },
      { level: 3, text: "Vegetação em valva direita lança êmbolos para o pulmão." },
      { level: 4, text: "Sugestão explícita: 3 pares de hemoculturas antes do antibiótico, ecocardiograma, antibiótico empírico IV, oxigênio se necessário, testagem e internação." }
    ],
    summary: "Homem de 31 anos, usuário de cocaína injetável, com febre há 3 semanas, sopro tricúspide novo, esplenomegalia e nódulos pulmonares cavitados: endocardite de câmaras direitas com êmbolos sépticos.",
    pathophysiology: "Injeções repetidas lesam o endotélio valvar e introduzem bactérias da pele (frequentemente S. aureus). Forma-se uma vegetação de plaquetas, fibrina e bactérias na valva tricúspide, causando bacteremia contínua, insuficiência valvar e embolização séptica para os pulmões.",
    keyPoints: [
      "Febre + fator de risco + sopro novo = suspeitar de endocardite.",
      "Paciente estável: ≥ 3 pares de hemoculturas, com intervalo, antes do antibiótico.",
      "Ecocardiograma é a imagem de primeira linha; ETE se inconclusivo.",
      "Endocardite direita: êmbolos pulmonares sépticos.",
      "Abordagem integral: testagem para HIV/hepatites e redução de danos."
    ],
    alternatives: ["Esquema empírico conforme protocolo local e alergias."],
    oralRubric: [
      { id: "o1", concept: "Fator de risco e sopro", synonyms: ["droga injetável", "sopro", "tricúspide"], weight: 2 },
      { id: "o2", concept: "Hemoculturas antes do antibiótico", synonyms: ["hemocultura", "culturas antes", "três pares"], weight: 3 },
      { id: "o3", concept: "Ecocardiograma", synonyms: ["ecocardiograma", "eco"], weight: 2 },
      { id: "o4", concept: "Antibiótico IV prolongado e internação", synonyms: ["antibiótico", "internação", "semanas"], weight: 1 }
    ],
    simplifications: ["O intervalo entre os pares de hemocultura é representado por uma única solicitação.", "Esquema antimicrobiano empírico da diretriz ainda não conferido; o caso aceita opções do catálogo."]
  },
  references: ["INT-ESC-EI-2023", "BR-PCDT-HIV", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Investiga, coleta culturas, eco, antibiótico após coleta, internação", commands: [ask(10, "h-drogas"), { atSeconds: 30, type: "examine", payload: { region: "coracao", maneuver: "ausculta" } }, act(60, "monitorizar"), act(70, "acesso_venoso"), act(170, "acesso_venoso"), test(270, "hemocultura"), test(280, "eco_transtoracico"), test(290, "teste_rapido_hiv"), rx(900, "vancomicina", "fa1g", 1000, "mg", "IV"), dx(3000, "endocardite_infecciosa"), dest(3000, "internacao_enfermaria")], runUntilSeconds: 5000, expect: [{ condition: { ruleFired: "r-atb" }, description: "antibiótico após culturas" }, { condition: { not: { ruleFired: "r-atb-antes-cultura" } }, description: "culturas preservadas" }, { condition: { not: { ruleFired: "r-embolia" } }, description: "sem nova embolia" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-embolia" }, description: "embolia séptica" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Antibiótico antes das culturas", commands: [act(70, "acesso_venoso"), act(170, "acesso_venoso"), rx(270, "ceftriaxona", "fa1g", 2000, "mg", "IV"), test(400, "hemocultura")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-atb-antes-cultura" }, description: "culturas comprometidas" }] },
    { id: "t-atraso", kind: "delay", description: "Antibiótico só após 2 horas", commands: [act(70, "acesso_venoso"), act(170, "acesso_venoso"), test(270, "hemocultura"), act(5500, "o2_cateter", { fluxo: 2 }), rx(7200, "vancomicina", "fa1g", 1000, "mg", "IV")], runUntilSeconds: 8000, expect: [{ condition: { ruleFired: "r-embolia" }, description: "embolia pelo atraso" }, { condition: { ruleFired: "r-atb" }, description: "antibiótico tardio" }] },
    { id: "t-alternativa", kind: "alternative", description: "Vancomicina associada a ceftriaxona após culturas", commands: [act(70, "acesso_venoso"), act(170, "acesso_venoso"), test(270, "hemocultura"), test(280, "eco_transtoracico"), rx(900, "vancomicina", "fa1g", 1000, "mg", "IV"), rx(950, "ceftriaxona", "fa1g", 2000, "mg", "IV")], runUntilSeconds: 4000, expect: [{ condition: { ruleFired: "r-atb" }, description: "antibiótico após culturas" }] }
  ]
};
