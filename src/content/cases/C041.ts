import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const SANGUE = { drugGiven: "concentrado_hemacias" };
const CRISTALOIDE_EXCESSO = { any: [{ drugGiven: "sf09", minTotal: { value: 2000, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 2000, unit: "mL" as const } }] };
const CRISTALOIDE_INICIAL = { any: [{ drugGiven: "sf09", minTotal: { value: 500, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 500, unit: "mL" as const } }] };

export const C041: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C041",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Motociclista trazido pelo SAMU após colisão, pálido e com dor na barriga",
  teachingTitle: "Trauma abdominal fechado com choque hemorrágico — avaliação primária, hipotensão permissiva, transfusão e controle cirúrgico",
  group: "Trauma",
  specialties: ["Cirurgia", "Emergência", "Trauma"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 4,
  level: "internato",
  objectives: [
    "Conduzir a avaliação primária (XABCDE) com restrição de movimento da coluna",
    "Reconhecer choque hemorrágico classe III",
    "Usar eFAST para localizar o sangramento",
    "Priorizar hemocomponentes e ácido tranexâmico, limitando cristaloide",
    "Levar ao controle cirúrgico do sangramento sem atrasos"
  ],
  keywords: ["acidente", "moto", "colisão", "barriga", "trauma"],
  patient: {
    name: "Lucas Henrique Alves",
    ageYears: 24,
    sex: "masculino",
    weightKg: 72,
    heightCm: 176,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 3, hairStyle: "crespo_curto", hairColor: "preto", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional (com centro cirúrgico e banco de sangue). O SAMU (USB) traz motociclista de 24 anos, colisão frontal com carro a cerca de 60 km/h há 40 minutos. Chega em prancha, com colar, consciente e pálido.",
  communication: "normal",
  informants: [{ id: "samu", name: "Técnico do SAMU", role: "Equipe do SAMU 192" }],
  history: [
    hi("h-cinematica", "inicio", "Como foi o acidente? (equipe do SAMU)", [{ source: "samu", text: "Bateu de frente num carro, foi projetado sobre o capô. Capacete inteiro. No local estava com PA 100/60; no caminho foi caindo." }], ["acidente", "cinemática", "como foi", "samu"]),
    hi("h-hora", "inicio", "Que horas foi o acidente?", [{ source: "samu", text: "Há 40 minutos." }], ["horas", "quando"]),
    h("h-dor", "localizacao", "Onde dói?", "Na barriga, do lado esquerdo, e no ombro esquerdo.", { keywords: ["dói", "dor", "onde"] }),
    h("h-respirar", "fatores_associados", "Está com dificuldade para respirar?", "Um pouco, dói pra respirar fundo.", { keywords: ["respirar", "ar"] }),
    h("h-ample", "antecedentes", "Tem alguma doença, alergia, usa remédio? Quando comeu?", "Não tenho nada, nem alergia. Almocei ao meio-dia.", { keywords: ["doença", "alergia", "comeu", "ample"] }),
    h("h-neuro", "sinais_alarme", "Sente as pernas? Bateu a cabeça?", "Sinto tudo. Acho que não bati a cabeça.", { keywords: ["pernas", "cabeça", "formigamento"] })
  ],
  initial: {
    vars: { hr: 134, sbp: 84, dbp: 54, rr: 28, spo2: 95, temp: 35.9, gcs: 14, pain: 8, glucose: 142, perfusion: 0.35, effort: 0.5, hb: 9.8, ht: 30, plt: 210000, inr: 1.2, lactate: 4.8, be: -8, ph: 7.28, hco3: 18, urine: 10, bleeding: 70 },
    flags: { rhythm: "taquicardia_sinusal", pallor: true, sweating: true, posture: "supino", painVisual: "intensa", speech: "frases", consciousness: "alerta", agitation: true },
    devices: ["colar_cervical"],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Pálido, sudoreico, ansioso; sem sangramento externo ativo.", { better: [{ when: { ruleFired: "r-choque-grave" }, text: "Sonolento, pele fria e marmórea." }] }),
    ex("e-via-aerea", "boca", "inspecao", "Via aérea pérvia, fala frases; sem lesões faciais.", { label: "Via aérea (A)" }),
    ex("e-torax", "torax_anterior", "ausculta", "Murmúrio presente bilateralmente; dor à palpação de arcos costais inferiores à esquerda.", { sound: "murmurio_normal", label: "Tórax (B)" }),
    ex("e-abdome", "abdome_qse", "palpacao", "Escoriação em faixa no abdome superior; dor e defesa em quadrante superior esquerdo; distensão discreta.", { label: "Abdome (C)" }),
    ex("e-pelve", "pelve", "palpacao", "Pelve estável à compressão (uma única manobra).", { label: "Pelve" }),
    ex("e-neuro", "neurologico", "especial", "Glasgow 14 (confuso), pupilas isocóricas e fotorreagentes, move os quatro membros.", { label: "Neurológico (D)" }),
    ex("e-pele", "pele", "inspecao", "Escoriações em membros; sem deformidades de ossos longos.", { label: "Exposição (E)" })
  ],
  testResults: [
    { testId: "efast", variants: [{ text: "Líquido livre no espaço esplenorrenal e na pelve; espaço hepatorrenal com pequena lâmina. Sem derrame pericárdico. Deslizamento pleural presente bilateralmente. (Laudo educativo.)" }] },
    { testId: "rx_torax", variants: [{ text: "Fratura de 9º e 10º arcos costais à esquerda; sem pneumotórax ou hemotórax volumoso. (Laudo educativo.)" }] }
  ],
  highlightedActions: ["acesso_venoso", "monitorizar", "o2_mascara_reservatorio", "aquecimento", "colar_cervical"],
  rules: [
    { id: "r-sangramento", description: "Sangramento intra-abdominal ativo: queda progressiva sem controle", priority: 10, when: { always: true }, repeat: "once", effects: [trend("sbp", 56, 1800, "hem", 10), trend("dbp", 34, 1800, "hem", 10), trend("hr", 150, 1500, "hem", 10), trend("hb", 6.4, 2400, "hem", 10), trend("lactate", 8, 2400, "hem", 10), trend("perfusion", 0.2, 1800, "hem", 10)] },
    { id: "r-cristaloide", description: "Cristaloide inicial: resposta transitória", priority: 25, when: CRISTALOIDE_INICIAL, repeat: "once", effects: [trend("sbp", 88, 300, "cri", 25, 1200), trend("hr", 128, 300, "cri", 25, 1200)] },
    { id: "r-transfusao", description: "Hemocomponentes restauram parcialmente a perfusão (hipotensão permissiva)", priority: 50, when: SANGUE, repeat: "once", effects: [trend("sbp", 94, 600, "tx", 50), trend("dbp", 58, 600, "tx", 50), trend("hr", 112, 600, "tx", 50), trend("perfusion", 0.55, 600, "tx", 50), trend("hb", 8.6, 900, "tx", 50), flag("agitation", false), outcome("estabilizacao_parcial")] },
    { id: "r-diluicao", description: "Cristaloide ≥ 2 L: coagulopatia dilucional, hipotermia e acidose", priority: 60, when: CRISTALOIDE_EXCESSO, repeat: "once", effects: [trend("inr", 1.9, 900, "dil", 60), trend("temp", 34.8, 900, "dil", 60), trend("ph", 7.16, 900, "dil", 60), trend("hb", 5.8, 900, "dil", 60), obs("Após 2 L de cristaloide: sangramento piora (diluição de fatores, hipotermia e acidose — tríade letal)."), outcome("complicacao")] },
    { id: "r-atx", description: "Ácido tranexâmico registrado", when: { drugGiven: "acido_tranexamico" }, repeat: "once", effects: [obs("Ácido tranexâmico administrado dentro de 3 h do trauma.")] },
    { id: "r-hipotermia", description: "Sem aquecimento: perda de calor", when: { all: [{ time: "gte", seconds: 900 }, { not: { actionCompleted: "aquecimento" } }] }, repeat: "once", effects: [trend("temp", 35.0, 1200, "frio", 15)] },
    { id: "r-choque-grave", description: "Sem hemocomponente em 25 min: choque grave", priority: 30, when: { all: [{ time: "gte", seconds: 1500 }, { not: SANGUE }] }, repeat: "once", effects: [trend("sbp", 58, 300, "grave", 30), flag("consciousness", "voz"), flag("speech", "palavras"), trend("gcs", 11, 300, "grave", 30), staff("enfermagem", "Ele está ficando sonolento, a pressão não aparece no aparelho."), outcome("piora")] },
    { id: "r-pcr", description: "Sem hemocomponente em 45 min: PCR (AESP hipovolêmica)", priority: 100, when: { all: [{ time: "gte", seconds: 2700 }, { not: SANGUE }] }, repeat: "once", effects: [flag("pulse", false), { type: "setValue", var: "sbp", value: 0 }, { type: "setValue", var: "dbp", value: 0 }, flag("consciousness", "irresponsivo"), staff("enfermagem", "Parou! Sem pulso, monitor com ritmo organizado."), outcome("parada", true)] },
    { id: "r-banco", description: "Banco de sangue", when: { testCollected: "hemograma" }, repeat: "once", effects: [staff("laboratorio", "Banco de sangue: amostra para tipagem recebida; concentrado de hemácias O negativo disponível para uso imediato.")] }
  ],
  diagnosis: { primary: "choque_hipovolemico", accepted: ["choque_hipovolemico"], differentials: ["choque_obstrutivo", "pneumotorax_hipertensivo", "tamponamento", "choque_septico"] },
  acceptedDestinations: ["centro_cirurgico"],
  outcomeNotes: "Choque hemorrágico classe III por trauma abdominal fechado (provável lesão esplênica). Avaliação primária, eFAST positivo, hemocomponentes precoces com hipotensão permissiva, ácido tranexâmico em até 3 h e controle cirúrgico imediato. Cristaloide liberal (≥ 2 L) precipita coagulopatia.",
  scoring: [
    { id: "s-cinematica", domain: "historia", description: "Obteve cinemática e horário do trauma", evidence: { kind: "historyAsked", items: ["h-cinematica", "h-hora"], minCount: 1 }, points: 4, severity: "importante", rationale: "Mecanismo e tempo orientam lesões prováveis e janela do ácido tranexâmico." },
    { id: "s-primaria", domain: "historia", description: "Avaliação primária completa (via aérea, tórax, abdome/pelve, neurológico)", evidence: { kind: "examDone", regions: ["boca", "torax_anterior", "abdome_qse", "pelve", "neurologico"], minCount: 4 }, points: 10, severity: "critica", rationale: "XABCDE sistemático evita lesões despercebidas.", sourceIds: ["BR-SAMU-SAV"] },
    { id: "s-acesso", domain: "priorizacao", description: "Dois acessos calibrosos/IO em até 5 min", evidence: { kind: "actionDone", anyOf: ["acesso_venoso", "acesso_io"], withinSeconds: 300 }, points: 6, severity: "critica", rationale: "Reposição volêmica imediata." },
    { id: "s-monitor", domain: "priorizacao", description: "Monitorização e O₂", evidence: { kind: "actionDone", anyOf: ["monitorizar", "o2_mascara_reservatorio"], withinSeconds: 300 }, points: 4, severity: "importante", rationale: "Paciente em choque." },
    { id: "s-efast", domain: "exames", description: "eFAST na sala de emergência", evidence: { kind: "testOrdered", anyOf: ["efast"], withinSeconds: 900 }, points: 9, severity: "critica", rationale: "Localiza o sangramento sem tirar o paciente da sala.", sourceIds: ["BR-SAMU-SAV"] },
    { id: "s-tc", domain: "exames", description: "Não levou paciente instável à tomografia; exames dirigidos", evidence: { kind: "testsNotExcessive", maxUnjustified: 0, justified: ["efast", "hemograma", "coagulograma", "gaso_venosa", "gaso_arterial", "rx_torax", "eletrolitos", "bhcg"] }, points: 6, severity: "importante", rationale: "Instável com FAST positivo vai ao centro cirúrgico, não à TC." },
    { id: "s-sangue", domain: "tratamento", description: "Concentrado de hemácias em até 15 min", evidence: { kind: "drugGiven", anyOf: ["concentrado_hemacias"], withinSeconds: 900 }, points: 13, severity: "critica", rationale: "Hemorragia classe III exige hemocomponentes precoces.", sourceIds: ["BR-SAMU-SAV"] },
    { id: "s-atx", domain: "tratamento", description: "Ácido tranexâmico (≤ 3 h do trauma)", evidence: { kind: "drugGiven", anyOf: ["acido_tranexamico"] }, points: 6, severity: "importante", rationale: "Reduz mortalidade por sangramento quando precoce.", sourceIds: ["INT-CRASH2"] },
    { id: "s-aquecer", domain: "tratamento", description: "Prevenção de hipotermia", evidence: { kind: "actionDone", anyOf: ["aquecimento"], withinSeconds: 900 }, points: 4, severity: "importante", rationale: "Hipotermia agrava a coagulopatia." },
    { id: "s-diluicao", domain: "tratamento", description: "Falha: cristaloide liberal (≥ 2 L)", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-diluicao" } }, points: 10, penalty: true, severity: "critica", rationale: "Tríade letal: coagulopatia, hipotermia, acidose." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou PA/perfusão após transfusão", evidence: { kind: "reassessAfter", after: ["concentrado_hemacias"], reassess: ["medir_pa", "gaso_venosa", "gaso_arterial", "hemograma"], withinSeconds: 1200 }, points: 10, severity: "importante", rationale: "Classificar resposta (transitória) e acelerar cirurgia." },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de choque hemorrágico", evidence: { kind: "diagnosis", accepted: ["choque_hipovolemico"] }, points: 4, severity: "importante", rationale: "Hipotensão, taquicardia, FAST positivo." },
    { id: "s-destino", domain: "destino", description: "Centro cirúrgico", evidence: { kind: "disposition", accepted: ["centro_cirurgico"] }, points: 6, severity: "critica", rationale: "Controle cirúrgico do sangramento." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Siga o XABCDE: onde está o problema que mata primeiro?" },
      { level: 2, text: "Onde um adulto esconde sangue sem que você veja?" },
      { level: 3, text: "Cristaloide demais dilui, esfria e acidifica." },
      { level: 4, text: "Sugestão explícita: 2 acessos, eFAST, hemácias O negativo, ácido tranexâmico, aquecimento, centro cirúrgico." }
    ],
    summary: "Motociclista de 24 anos com trauma abdominal fechado, fraturas costais à esquerda, choque hemorrágico classe III e eFAST positivo (provável lesão esplênica).",
    pathophysiology: "Perda de 30–40% da volemia: taquicardia, hipotensão, oligúria, confusão. A hemorragia não controlada consome fatores; cristaloide em excesso dilui fatores e plaquetas, esfria e acidifica, perpetuando o sangramento (tríade letal). A reanimação hemostática (hemocomponentes, hipotensão permissiva) mantém perfusão até o controle cirúrgico.",
    keyPoints: [
      "XABCDE com restrição de coluna.",
      "Choque no trauma é hemorrágico até prova em contrário.",
      "eFAST na sala de emergência; instável com FAST positivo → centro cirúrgico.",
      "Hemocomponentes precoces; limitar cristaloide; ácido tranexâmico até 3 h.",
      "Prevenir hipotermia."
    ],
    alternatives: ["Protocolo de transfusão maciça (plasma e plaquetas em proporção) — não modelado em detalhe.", "Acesso intraósseo se acesso venoso difícil."],
    oralRubric: [
      { id: "o1", concept: "Avaliação primária", synonyms: ["xabcde", "abcde", "primária"], weight: 2 },
      { id: "o2", concept: "eFAST", synonyms: ["fast", "efast", "ultrassom"], weight: 2 },
      { id: "o3", concept: "Hemocomponentes", synonyms: ["hemácias", "sangue", "transfusão", "hemocomponente"], weight: 3 },
      { id: "o4", concept: "Ácido tranexâmico", synonyms: ["tranexâmico", "atx"], weight: 1 },
      { id: "o5", concept: "Cirurgia", synonyms: ["cirurgia", "laparotomia", "centro cirúrgico"], weight: 2 }
    ],
    simplifications: ["Resposta à transfusão é determinística e não distingue plasma/plaquetas.", "PCR aos 45 min sem hemocomponente é decisão didática."]
  },
  references: ["BR-SAMU-SAV", "INT-CRASH2", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 15, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "XABCDE, acessos, eFAST, hemácias, ATX, aquecimento e centro cirúrgico", commands: [act(5, "monitorizar"), ask(10, "h-cinematica"), { atSeconds: 15, type: "examine", payload: { region: "boca", maneuver: "inspecao" } }, { atSeconds: 25, type: "examine", payload: { region: "torax_anterior", maneuver: "ausculta" } }, act(30, "acesso_venoso"), act(130, "acesso_venoso"), { atSeconds: 140, type: "examine", payload: { region: "abdome_qse", maneuver: "palpacao" } }, { atSeconds: 160, type: "examine", payload: { region: "pelve", maneuver: "palpacao" } }, test(180, "efast"), test(190, "hemograma"), rx(300, "concentrado_hemacias", "unidade", 300, "mL", "IV", "infusao_volume", { durationMinutes: 15 }), rx(320, "acido_tranexamico", "amp250", 1000, "mg", "IV"), act(330, "aquecimento"), act(1000, "medir_pa"), dx(1100, "choque_hipovolemico"), dest(1100, "centro_cirurgico")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-transfusao" }, description: "perfusão restaurada" }, { condition: { not: { ruleFired: "r-diluicao" } }, description: "sem coagulopatia dilucional" }, { condition: { path: "vars.sbp", op: "gte", value: 85 }, description: "PAS ≥ 85" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 2800, expect: [{ condition: { ruleFired: "r-choque-grave" }, description: "choque grave" }, { condition: { ruleFired: "r-pcr" }, description: "PCR" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Só cristaloide em grande volume", commands: [act(30, "acesso_venoso"), act(130, "acesso_venoso"), rx(200, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 10 }), rx(220, "ringer_lactato", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 10 }), rx(900, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 10 })], runUntilSeconds: 2000, expect: [{ condition: { ruleFired: "r-diluicao" }, description: "tríade letal" }, { condition: { ruleFired: "r-choque-grave" }, description: "choque grave" }] },
    { id: "t-atraso", kind: "delay", description: "Hemácias só aos 30 min", commands: [act(30, "acesso_venoso"), act(130, "acesso_venoso"), rx(200, "ringer_lactato", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 15 }), rx(1800, "concentrado_hemacias", "unidade", 300, "mL", "IV", "infusao_volume", { durationMinutes: 15 })], runUntilSeconds: 3200, expect: [{ condition: { ruleFired: "r-choque-grave" }, description: "piora pelo atraso" }, { condition: { not: { ruleFired: "r-pcr" } }, description: "PCR evitada" }] },
    { id: "t-alternativa", kind: "alternative", description: "Acesso IO e cristaloide inicial de 500 mL antes do sangue", commands: [act(20, "acesso_io"), rx(100, "ringer_lactato", "bolsa500", 500, "mL", "IO", "infusao_volume", { durationMinutes: 10 }), test(120, "efast"), rx(400, "concentrado_hemacias", "unidade", 300, "mL", "IO", "infusao_volume", { durationMinutes: 15 }), dest(1000, "centro_cirurgico")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-transfusao" }, description: "perfusão restaurada" }, { condition: { not: { ruleFired: "r-diluicao" } }, description: "sem diluição" }] }
  ]
};
