import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, hi, obs, outcome, rx, staff, trend } from "./helpers";

const DESCOMP = { actionCompleted: "descompressao_torax" };

export const C042: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C042",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Queda do telhado e falta de ar cada vez pior dentro da ambulância",
  teachingTitle: "Pneumotórax hipertensivo traumático no pré-hospitalar — diagnóstico clínico e descompressão imediata",
  group: "Trauma",
  specialties: ["Trauma", "Emergência pré-hospitalar"],
  environment: "ambulancia",
  resourceProfile: "samu-usa",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Reconhecer pneumotórax hipertensivo pela clínica, sem exame de imagem",
    "Descomprimir imediatamente com agulha/cateter",
    "Entender o risco da ventilação com pressão positiva antes da descompressão",
    "Manter restrição de movimento da coluna e regular o destino para drenagem definitiva"
  ],
  keywords: ["queda", "telhado", "falta de ar", "dor no peito", "trauma"],
  patient: {
    name: "Gilmar Freitas",
    ageYears: 45,
    sex: "masculino",
    weightKg: 80,
    heightCm: 174,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 4, hairStyle: "curto", hairColor: "preto", build: "robusto", pregnancyTrimester: 0 }
  },
  briefing: "SAMU 192 — Unidade de Suporte Avançado. Pedreiro de 45 anos caiu de um telhado (cerca de 4 m) sobre o lado esquerdo há 20 minutos. Já está na prancha dentro da ambulância; a falta de ar piorou nos últimos minutos.",
  communication: "limitada",
  informants: [{ id: "colega", name: "Colega de obra", role: "Testemunha" }],
  history: [
    hi("h-cinematica", "inicio", "Como foi a queda?", [{ source: "colega", text: "Escorregou da beira do telhado, caiu de lado sobre um monte de tijolos. Não desmaiou." }, { source: "paciente", text: "Caí… de lado… em cima dos tijolos…" }], ["queda", "caiu", "como"]),
    hi("h-dor", "localizacao", "Onde dói?", [{ source: "paciente", text: "No peito… do lado esquerdo… não consigo… puxar o ar…" }], ["dói", "dor", "onde"]),
    hi("h-neuro", "sinais_alarme", "Sente as pernas e os braços? Bateu a cabeça?", [{ source: "paciente", text: "Sinto… tudo… não bati a cabeça." }], ["pernas", "cabeça"]),
    hi("h-ample", "antecedentes", "Tem doença, alergia, usa remédio?", [{ source: "colega", text: "Que eu saiba é saudável. Não sei de alergia." }], ["doença", "alergia", "remédio"])
  ],
  initial: {
    vars: { hr: 132, sbp: 86, dbp: 60, rr: 34, spo2: 84, temp: 36.1, gcs: 15, pain: 8, glucose: 120, perfusion: 0.45, effort: 2.6, etco2: 30, hb: 13.8 },
    flags: { rhythm: "taquicardia_sinusal", sweating: true, cyanosis: true, speech: "palavras", painVisual: "intensa", agitation: true, posture: "supino", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Agitado, cianose perioral, sudoreico, fala palavras.", { better: [{ when: DESCOMP, text: "Menos agitado, cor melhorando, fala frases curtas." }] }),
    ex("e-pescoco", "pescoco", "inspecao", "Turgência jugular bilateral; traqueia desviada para a direita.", { label: "Pescoço", better: [{ when: DESCOMP, text: "Jugulares menos túrgidas; traqueia centralizando." }] }),
    ex("e-insp", "torax_anterior", "inspecao", "Hemitórax esquerdo hiperexpandido e com menor expansibilidade; escoriações laterais à esquerda.", {}),
    ex("e-ausc", "torax_anterior", "ausculta", "Murmúrio vesicular abolido no hemitórax esquerdo; presente à direita.", { sound: "murmurio_abolido", better: [{ when: DESCOMP, text: "Murmúrio reduzido, porém presente, à esquerda." }] }),
    ex("e-perc", "torax_anterior", "percussao", "Hipertimpanismo à esquerda.", {}),
    ex("e-palp", "torax_posterior", "palpacao", "Crepitação de arcos costais à esquerda (fraturas) e enfisema subcutâneo discreto.", {}),
    ex("e-perfusao", "membro_superior_d", "palpacao", "Pulso radial fino; enchimento capilar 4 s.", { better: [{ when: DESCOMP, text: "Pulso radial cheio; enchimento capilar 2–3 s." }] }),
    ex("e-neuro", "neurologico", "especial", "Glasgow 15; move os quatro membros; pupilas isocóricas.", {})
  ],
  testResults: [{ testId: "ecg12", variants: [{ text: "Taquicardia sinusal. (Exame não muda a conduta imediata.)", ecg: { rhythm: "taquicardia_sinusal", rate: 132, stElevationLeads: [], stDepressionLeads: [], peakedT: false, wideQrs: false } }] }],
  highlightedActions: ["o2_mascara_reservatorio", "monitorizar", "descompressao_torax", "colar_cervical", "acesso_venoso", "acionar_samu"],
  rules: [
    { id: "r-progressao", description: "Pneumotórax hipertensivo progride", priority: 10, when: { always: true }, repeat: "once", effects: [trend("spo2", 76, 500, "ptx", 10), trend("sbp", 66, 500, "ptx", 10), trend("dbp", 44, 500, "ptx", 10), trend("hr", 146, 500, "ptx", 10), trend("perfusion", 0.25, 500, "ptx", 10)] },
    { id: "r-o2", description: "O₂ em alto fluxo: ganho pequeno sem descompressão", priority: 20, when: { deviceActive: "mascara_reservatorio" }, repeat: "while", effects: [trend("spo2", 88, 120, "o2", 20)], onEnd: [{ type: "clearTrend", var: "spo2", slot: "o2" }] },
    { id: "r-descompressao", description: "Descompressão: saída de ar sob pressão e melhora hemodinâmica imediata", priority: 60, when: DESCOMP, repeat: "once", effects: [{ type: "clearTrend", var: "spo2", slot: "ptx" }, { type: "clearTrend", var: "sbp", slot: "ptx" }, { type: "clearTrend", var: "dbp", slot: "ptx" }, { type: "clearTrend", var: "hr", slot: "ptx" }, { type: "clearTrend", var: "perfusion", slot: "ptx" }, trend("sbp", 112, 60, "desc", 60), trend("dbp", 70, 60, "desc", 60), trend("hr", 108, 120, "desc", 60), trend("spo2", 93, 120, "desc", 30), trend("effort", 1.4, 120, "desc", 60), trend("rr", 26, 120, "desc", 60), trend("perfusion", 0.75, 120, "desc", 60), flag("cyanosis", false), flag("agitation", false), flag("speech", "frases"), obs("Saída de ar sob pressão pelo cateter; alívio imediato do desconforto."), outcome("estabilizacao_parcial")] },
    { id: "r-o2-pos", description: "Após descompressão, O₂ eleva a SpO₂", priority: 65, when: { all: [DESCOMP, { any: [{ deviceActive: "mascara_reservatorio" }, { deviceActive: "cateter_nasal" }] }] }, repeat: "once", effects: [trend("spo2", 97, 120, "o2pos", 65)] },
    { id: "r-vppi", description: "Ventilação com pressão positiva antes de descomprimir: piora abrupta", priority: 80, when: { all: [{ any: [{ actionCompleted: "intubacao" }, { actionCompleted: "ventilar_bvm" }] }, { not: DESCOMP }] }, repeat: "once", effects: [trend("sbp", 50, 60, "vppi", 80), trend("spo2", 70, 60, "vppi", 80), trend("hr", 150, 60, "vppi", 80), staff("enfermagem", "A pressão despencou depois que começamos a ventilar!"), outcome("piora")] },
    { id: "r-pcr", description: "Sem descompressão: PCR em AESP (desfecho definido pelo caso)", priority: 100, when: { all: [{ not: DESCOMP }, { any: [{ time: "gte", seconds: 900 }, { elapsedSince: "rule:r-vppi", op: "gte", seconds: 180 }] }] }, repeat: "once", effects: [flag("pulse", false), flag("consciousness", "irresponsivo"), { type: "setValue", var: "rr", value: 0 }, staff("enfermagem", "Sem pulso! Monitor com ritmo organizado!"), outcome("parada", true)] },
    { id: "r-volume", description: "Cristaloide: efeito pequeno no choque obstrutivo", when: { any: [{ drugGiven: "sf09", minTotal: { value: 500, unit: "mL" } }, { drugGiven: "ringer_lactato", minTotal: { value: 500, unit: "mL" } }] }, repeat: "once", effects: [obs("Pouca resposta ao volume: o problema é obstrutivo (retorno venoso impedido pela pressão intratorácica).")] },
    { id: "r-regulacao", description: "Regulação define destino", when: { actionCompleted: "acionar_samu" }, repeat: "once", effects: [staff("regulacao", "Regulação: hospital regional com cirurgia de plantão avisado para drenagem torácica; tempo de transporte estimado de 15 minutos.")] }
  ],
  diagnosis: { primary: "pneumotorax_hipertensivo", accepted: ["pneumotorax_hipertensivo"], differentials: ["tamponamento", "choque_hipovolemico", "pneumotorax_espontaneo"] },
  acceptedDestinations: ["transferencia_regulada"],
  outcomeNotes: "Dispneia progressiva, murmúrio abolido, hipertimpanismo, turgência jugular e hipotensão após trauma torácico = pneumotórax hipertensivo: diagnóstico clínico. Descompressão imediata com cateter, O₂, restrição de coluna e transporte regulado para drenagem torácica. Ventilação com pressão positiva antes da descompressão acelera o colapso.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Obteve cinemática e queixa respiratória", evidence: { kind: "historyAsked", items: ["h-cinematica", "h-dor"], minCount: 1 }, points: 5, severity: "menor", rationale: "Mecanismo de alta energia sobre o tórax." },
    { id: "s-exame", domain: "historia", description: "Examinou tórax (ausculta/percussão) e pescoço", evidence: { kind: "examDone", regions: ["torax_anterior", "pescoco"], minCount: 2 }, points: 12, severity: "critica", rationale: "Murmúrio abolido, hipertimpanismo e turgência jugular fazem o diagnóstico.", sourceIds: ["INT-ITLS-ND-2014"] },
    { id: "s-o2", domain: "priorizacao", description: "O₂ em alto fluxo", evidence: { kind: "actionDone", anyOf: ["o2_mascara_reservatorio"], withinSeconds: 180 }, points: 6, severity: "importante", rationale: "Hipoxemia grave." },
    { id: "s-descomp", domain: "priorizacao", description: "Descompressão em até 5 minutos", evidence: { kind: "actionDone", anyOf: ["descompressao_torax"], withinSeconds: 300 }, points: 18, severity: "critica", rationale: "Pneumotórax hipertensivo é diagnóstico clínico; a descompressão não deve esperar imagem.", sourceIds: ["INT-ITLS-ND-2014", "BR-SAMU-SAV"] },
    { id: "s-vppi", domain: "tratamento", description: "Falha de segurança: pressão positiva antes da descompressão", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-vppi" } }, points: 10, penalty: true, severity: "critica", rationale: "A pressão positiva aumenta o volume do pneumotórax e precipita o colapso circulatório." },
    { id: "s-coluna", domain: "tratamento", description: "Restrição de movimento da coluna", evidence: { kind: "actionDone", anyOf: ["colar_cervical"] }, points: 5, severity: "importante", rationale: "Queda de altura." },
    { id: "s-acesso", domain: "tratamento", description: "Acesso venoso", evidence: { kind: "actionDone", anyOf: ["acesso_venoso", "acesso_io"] }, points: 5, severity: "importante", rationale: "Trauma grave." },
    { id: "s-monitor", domain: "tratamento", description: "Monitorização", evidence: { kind: "actionDone", anyOf: ["monitorizar"] }, points: 5, severity: "importante", rationale: "Reavaliação contínua no transporte." },
    { id: "s-exames", domain: "exames", description: "Não atrasou a descompressão por exames", evidence: { kind: "testsNotExcessive", maxUnjustified: 0, justified: ["ecg12"] }, points: 15, severity: "menor", rationale: "No pré-hospitalar, o diagnóstico é clínico." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou o tórax após descompressão", evidence: { kind: "reassessAfter", after: ["descompressao_torax"], reassess: ["torax_anterior", "pescoco", "monitorizacao_continua", "oximetria_portatil"], withinSeconds: 600 }, points: 10, severity: "importante", rationale: "O cateter pode obstruir/deslocar; reavaliar e repetir se necessário." },
    { id: "s-regulacao", domain: "destino", description: "Contato com a regulação", evidence: { kind: "actionDone", anyOf: ["acionar_samu"] }, points: 4, severity: "importante", rationale: "Destino com capacidade de drenagem torácica.", sourceIds: ["BR-SAMU"] },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de pneumotórax hipertensivo", evidence: { kind: "diagnosis", accepted: ["pneumotorax_hipertensivo"] }, points: 5, severity: "importante", rationale: "Choque obstrutivo." },
    { id: "s-destino", domain: "destino", description: "Transporte regulado", evidence: { kind: "disposition", accepted: ["transferencia_regulada"] }, points: 5, severity: "importante", rationale: "Drenagem torácica definitiva no hospital." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Ele está piorando minuto a minuto. O que ameaça a vida agora?" },
      { level: 2, text: "Ausculte e percuta os dois hemitórax e olhe o pescoço." },
      { level: 3, text: "Ar acumulado sob pressão comprime o mediastino e impede o retorno venoso." },
      { level: 4, text: "Sugestão explícita: O₂ em alto fluxo e descompressão imediata com cateter no lado esquerdo; depois monitor, acesso, colar e regulação." }
    ],
    summary: "Homem de 45 anos com queda de 4 m sobre o hemitórax esquerdo evolui com dispneia progressiva, murmúrio abolido, hipertimpanismo, turgência jugular, desvio de traqueia e hipotensão: pneumotórax hipertensivo.",
    pathophysiology: "Lesão pulmonar/pleural cria um mecanismo valvular: o ar entra na cavidade pleural e não sai. A pressão intratorácica crescente colapsa o pulmão, desvia o mediastino e reduz o retorno venoso, levando a choque obstrutivo e parada em AESP. A descompressão converte o pneumotórax hipertensivo em simples, restaurando o retorno venoso.",
    keyPoints: [
      "Diagnóstico clínico; não esperar radiografia.",
      "Descompressão imediata com cateter longo; local conforme protocolo (2º EIC na linha hemiclavicular ou 4º/5º EIC lateral).",
      "Pressão positiva antes da descompressão pode precipitar parada.",
      "A descompressão é temporária: drenagem torácica no hospital."
    ],
    alternatives: ["Local lateral (4º/5º EIC na linha axilar anterior/média) conforme protocolo e biotipo."],
    oralRubric: [
      { id: "o1", concept: "Diagnóstico clínico", synonyms: ["clínico", "murmúrio abolido", "timpanismo", "jugular"], weight: 2 },
      { id: "o2", concept: "Descompressão imediata", synonyms: ["descompressão", "agulha", "cateter"], weight: 3 },
      { id: "o3", concept: "Evitar pressão positiva antes", synonyms: ["pressão positiva", "intubar", "ventilar"], weight: 1 },
      { id: "o4", concept: "Drenagem definitiva", synonyms: ["drenagem", "dreno"], weight: 1 }
    ],
    simplifications: ["O local da punção não é escolhido no simulador.", "Parada aos 15 min sem descompressão é decisão didática."]
  },
  references: ["INT-ITLS-ND-2014", "BR-SAMU-SAV", "BR-SAMU", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 15, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "O₂, exame, descompressão, monitor, colar, acesso, regulação", commands: [act(10, "o2_mascara_reservatorio", { fluxo: 15 }), { atSeconds: 20, type: "examine", payload: { region: "torax_anterior", maneuver: "ausculta" } }, { atSeconds: 35, type: "examine", payload: { region: "pescoco", maneuver: "inspecao" } }, act(50, "descompressao_torax"), act(90, "monitorizar"), act(140, "colar_cervical"), act(180, "acesso_venoso"), { atSeconds: 300, type: "examine", payload: { region: "torax_anterior", maneuver: "ausculta" } }, act(320, "acionar_samu"), dx(500, "pneumotorax_hipertensivo"), dest(500, "transferencia_regulada")], runUntilSeconds: 1200, expect: [{ condition: { ruleFired: "r-descompressao" }, description: "descompressão" }, { condition: { path: "vars.sbp", op: "gte", value: 100 }, description: "PAS ≥ 100" }, { condition: { not: { ruleFired: "r-pcr" } }, description: "sem PCR" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 1000, expect: [{ condition: { ruleFired: "r-pcr" }, description: "PCR" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Intubação antes de descomprimir", commands: [act(10, "o2_mascara_reservatorio", { fluxo: 15 }), act(60, "intubacao"), act(200, "intubacao")], runUntilSeconds: 700, expect: [{ condition: { ruleFired: "r-vppi" }, description: "colapso com pressão positiva" }, { condition: { ruleFired: "r-pcr" }, description: "PCR" }] },
    { id: "t-atraso", kind: "delay", description: "Volume primeiro; descompressão aos 10 minutos", commands: [act(10, "o2_mascara_reservatorio", { fluxo: 15 }), act(30, "acesso_venoso"), act(130, "acesso_venoso"), rx(230, "sf09", "bolsa500", 500, "mL", "IV", "infusao_volume", { durationMinutes: 5 }), act(600, "descompressao_torax")], runUntilSeconds: 1200, expect: [{ condition: { ruleFired: "r-volume" }, description: "pouca resposta ao volume" }, { condition: { ruleFired: "r-descompressao" }, description: "descompressão tardia" }, { condition: { not: { ruleFired: "r-pcr" } }, description: "sem PCR" }] },
    { id: "t-alternativa", kind: "alternative", description: "Descompressão antes do O₂, depois cânula", commands: [act(15, "descompressao_torax"), act(60, "o2_cateter", { fluxo: 4 }), act(120, "acionar_samu")], runUntilSeconds: 800, expect: [{ condition: { ruleFired: "r-o2-pos" }, description: "oxigenação melhora" }, { condition: { not: { ruleFired: "r-pcr" } }, description: "sem PCR" }] }
  ]
};
