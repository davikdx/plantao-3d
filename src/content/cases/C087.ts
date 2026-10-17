import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const USG = { testCollected: "usg_abdome" };
const VOL = { any: [{ drugGiven: "sf09", minTotal: { value: 80, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 80, unit: "mL" as const } }] };
const REDUCAO = { actionCompleted: "reducao_por_enema" };
const CIRURGIA = { actionCompleted: "solicitar_avaliacao_cirurgica" };
const ALTA = { any: [{ path: "disposition", op: "eq", value: "alta_orientada" }, { path: "disposition", op: "eq", value: "alta_com_seguimento_ubs" }] };

export const C087: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C087",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Bebê de 9 meses com crises de choro, vômitos e muito molinho entre as crises",
  teachingTitle: "Intussuscepção — reconhecer o padrão clínico, hidratar, ultrassom, redução por enema e cirurgia se peritonite ou falha",
  group: "Pediatria",
  specialties: ["Pediatria", "Cirurgia pediátrica", "Emergência"],
  environment: "pediatria",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Reconhecer intussuscepção: dor em cólica intermitente, vômitos, letargia entre crises, fezes em 'geleia de framboesa', massa abdominal",
    "Hidratar (SF 20 mL/kg), jejum, analgesia",
    "Confirmar por ultrassom (sinal do alvo) sem atrasar",
    "Indicar redução por enema se não houver contraindicação; cirurgia se peritonite, perfuração ou falha",
    "Não dar alta como 'cólica' ou gastroenterite"
  ],
  keywords: ["bebê", "choro", "vômito", "cólica", "sangue nas fezes", "molinho"],
  patient: {
    name: "Miguel Araújo",
    ageYears: 0.75,
    ageMonths: 9,
    sex: "masculino",
    weightKg: 8.5,
    heightCm: 71,
    visual: { ageGroup: "lactente", sex: "masculino", skinTone: 2, hairStyle: "curto", hairColor: "castanho", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Lactente de 9 meses trazido pelos pais com crises de choro forte há 8 horas, encolhendo as pernas, a cada 15–20 minutos; entre as crises fica 'molinho'. Vomitou 4 vezes.",
  communication: "incapaz",
  informants: [{ id: "pai", name: "Pai", role: "Pai" }],
  history: [
    hi("h-crises", "inicio", "Como são as crises de choro?", [{ source: "pai", text: "Do nada ele grita, fica vermelho, encolhe as pernas na barriga, dura uns minutos e passa. Depois fica quietinho, meio apagado." }], ["crises", "choro", "como"]),
    hi("h-vomito", "fatores_associados", "Como são os vômitos? E as fezes?", [{ source: "pai", text: "Primeiro leite, agora meio esverdeado. Há uma hora fez cocô com sangue e muco, parecendo geleia." }], ["vômito", "fezes", "cocô", "sangue"]),
    hi("h-viral", "antecedentes", "Teve resfriado ou diarreia nos últimos dias?", [{ source: "pai", text: "Resfriado na semana passada." }], ["resfriado", "diarreia", "doença"]),
    hi("h-alimentacao", "alimentacao_eliminacoes", "Está mamando? Quantas fraldas molhadas?", [{ source: "pai", text: "Mama pouco e vomita. Fralda molhada só uma vez desde a manhã." }], ["mamando", "fraldas"]),
    hi("h-casa", "social", "Moram perto do hospital?", [{ source: "pai", text: "Uns 40 minutos de carro, na zona rural." }], ["mora", "perto", "distância"])
  ],
  initial: {
    vars: { hr: 168, sbp: 88, dbp: 52, rr: 36, spo2: 98, temp: 37.6, gcs: 13, pain: 6, glucose: 92, perfusion: 0.6, effort: 0.2, wbc: 12800 },
    flags: { rhythm: "taquicardia_sinusal", posture: "supino", painVisual: "moderada", speech: "nenhuma", consciousness: "voz" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-abdome", "abdome_qsd", "palpacao", "Massa alongada ('em salsicha') em hipocôndrio direito; fossa ilíaca direita vazia; abdome sem defesa ou descompressão dolorosa.", { label: "Abdome", better: [{ when: { ruleFired: "r-perfuracao" }, text: "Abdome distendido, tenso, com defesa difusa (peritonite)." }] }),
    ex("e-pelve", "pelve", "inspecao", "Fralda com fezes mucossanguinolentas ('geleia de framboesa').", { label: "Fralda/toque" }),
    ex("e-geral", "geral", "inspecao", "Pálido, letárgico entre as crises, mucosas secas, enchimento capilar 3 s.", { label: "Hidratação/estado geral" }),
    ex("e-ausculta", "abdome_qid", "ausculta", "Ruídos hidroaéreos presentes.", { sound: "ruidos_hidroaereos" })
  ],
  testResults: [
    { testId: "usg_abdome", variants: [{ text: "Imagem em 'alvo' de 3,5 cm em hipocôndrio direito (intussuscepção ileocólica), com fluxo ao Doppler na parede; sem líquido livre significativo; sem ponto de partida evidente." }] },
    { testId: "rx_abdome", variants: [{ text: "Laudo educativo: pouco gás no quadrante inferior direito; sem pneumoperitônio." }] },
    { testId: "eletrolitos", variants: [{ text: "Na 136, K 3,6." }] }
  ],
  highlightedActions: ["acesso_venoso", "monitorizar", "reducao_por_enema", "solicitar_avaliacao_cirurgica"],
  rules: [
    { id: "r-curso", description: "Intussuscepção mantida: isquemia progressiva", priority: 10, when: { always: true }, repeat: "once", effects: [trend("hr", 178, 3600, "inv", 10), trend("perfusion", 0.45, 3600, "inv", 10), trend("gcs", 11, 3600, "inv", 10)] },
    { id: "r-volume", description: "Expansão 20 mL/kg", priority: 25, when: VOL, repeat: "once", effects: [trend("hr", 150, 900, "vol", 25), trend("perfusion", 0.8, 900, "vol", 25), trend("sbp", 94, 900, "vol", 25)] },
    { id: "r-analgesia", description: "Analgesia", priority: 20, when: { any: [{ drugGiven: "dipirona" }, { drugGiven: "morfina" }] }, repeat: "once", effects: [trend("pain", 3, 600, "anal", 20)] },
    { id: "r-reducao-sem-usg", description: "Redução sem confirmação por imagem", priority: 30, when: { all: [{ actionStarted: "reducao_por_enema" }, { not: USG }] }, repeat: "once", effects: [staff("supervisor", "Radiologista: só faço o enema depois do ultrassom confirmar — vou fazer o USG primeiro.")] },
    { id: "r-reducao", description: "Redução por enema bem-sucedida", priority: 50, when: { all: [REDUCAO, USG, { not: { ruleFired: "r-perfuracao" } }] }, repeat: "once", effects: [staff("supervisor", "Radiologia: redução pneumática completa, refluxo de ar para o íleo; cirurgia ciente. Observar e reintroduzir dieta."), trend("pain", 1, 900, "red", 50), trend("hr", 130, 1800, "red", 50), trend("gcs", 15, 1800, "red", 50), flag("consciousness", "alerta"), outcome("melhora")] },
    { id: "r-reducao-contraindicada", description: "Enema na vigência de peritonite/perfuração", priority: 60, when: { all: [REDUCAO, { ruleFired: "r-perfuracao" }] }, repeat: "once", effects: [obs("Peritonite/perfuração contraindica o enema: o tratamento é cirúrgico."), outcome("complicacao")] },
    { id: "r-perfuracao", description: "Sem redução em 90 min: necrose e perfuração", priority: 40, when: { all: [{ time: "gte", seconds: 5400 }, { not: REDUCAO }] }, repeat: "once", effects: [trend("temp", 38.8, 900, "perf", 40), trend("hr", 190, 900, "perf", 40), trend("sbp", 70, 1200, "perf", 40), trend("wbc", 21000, 1800, "perf", 40), staff("enfermagem", "A barriga ficou dura e ele está com febre e pálido!"), outcome("piora")] },
    { id: "r-laparotomia", description: "Cirurgia após perfuração", priority: 55, when: { all: [{ ruleFired: "r-perfuracao" }, CIRURGIA] }, repeat: "once", effects: [staff("supervisor", "Cirurgião pediátrico: peritonite — laparotomia de urgência com ressecção do segmento necrosado.")] },
    { id: "r-alta", description: "Alta como cólica/gastroenterite", priority: 45, when: ALTA, repeat: "once", effects: [obs("Cólica intermitente + letargia + sangue nas fezes não é gastroenterite: alta perde a janela da redução não cirúrgica."), outcome("complicacao")] }
  ],
  diagnosis: { primary: "intussuscepcao", accepted: ["intussuscepcao"], differentials: ["gastroenterite", "apendicite", "obstrucao_intestinal", "sepse_lactente", "desidratacao_algum_grau"] },
  acceptedDestinations: ["internacao_enfermaria", "centro_cirurgico"],
  outcomeNotes: "Intussuscepção ileocólica em lactente de 9 meses (cólica intermitente, vômitos, letargia, fezes em geleia de framboesa, massa em salsicha), sem peritonite. Acesso, SF 20 mL/kg, jejum, analgesia, USG (alvo), redução pneumática pela radiologia com cirurgia ciente, observação e internação (sangue nas fezes, mora longe); cirurgia se perfuração, peritonite ou falha.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Padrão das crises, vômitos e fezes", evidence: { kind: "historyAsked", items: ["h-crises", "h-vomito"], minCount: 2 }, points: 10, severity: "critica", rationale: "Tríade clássica é incompleta em muitos casos." },
    { id: "s-exame", domain: "historia", description: "Abdome (massa) e fralda/toque", evidence: { kind: "examDone", regions: ["abdome_qsd", "pelve", "geral"], minCount: 2 }, points: 8, severity: "importante", rationale: "Massa em salsicha e sangue nas fezes." },
    { id: "s-acesso", domain: "priorizacao", description: "Acesso venoso e monitorização", evidence: { kind: "actionDone", anyOf: ["acesso_venoso", "acesso_io"], withinSeconds: 600 }, points: 6, severity: "importante", rationale: "Desidratação e preparo para procedimento." },
    { id: "s-volume", domain: "tratamento", description: "SF/RL 20 mL/kg", evidence: { kind: "drugGiven", anyOf: ["sf09", "ringer_lactato"], withinSeconds: 1500 }, points: 8, severity: "importante", rationale: "Hipovolemia.", sourceIds: ["INT-DCH-INTUSS-2021"] },
    { id: "s-analgesia", domain: "tratamento", description: "Analgesia", evidence: { kind: "drugGiven", anyOf: ["dipirona", "morfina"], withinSeconds: 1500 }, points: 4, severity: "importante", rationale: "Dor intensa intermitente." },
    { id: "s-usg", domain: "exames", description: "USG abdominal", evidence: { kind: "testOrdered", anyOf: ["usg_abdome"], withinSeconds: 1800 }, points: 14, severity: "critica", rationale: "Exame diagnóstico de escolha.", sourceIds: ["INT-DCH-INTUSS-2021"] },
    { id: "s-reducao", domain: "tratamento", description: "Redução por enema", evidence: { kind: "actionDone", anyOf: ["reducao_por_enema"], withinSeconds: 5400 }, points: 16, severity: "critica", rationale: "Tratamento de escolha sem peritonite.", sourceIds: ["INT-DCH-INTUSS-2021"] },
    { id: "s-cirurgia", domain: "tratamento", description: "Cirurgia ciente/acionada", evidence: { kind: "actionDone", anyOf: ["solicitar_avaliacao_cirurgica"] }, points: 6, severity: "importante", rationale: "Retaguarda para falha/perfuração." },
    { id: "s-alta", domain: "destino", description: "Falha: alta como cólica", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-alta" } }, points: 12, penalty: true, severity: "critica", rationale: "Erro clássico." },
    { id: "s-contra", domain: "tratamento", description: "Falha: enema com peritonite", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-reducao-contraindicada" } }, points: 8, penalty: true, severity: "importante", rationale: "Contraindicação absoluta.", sourceIds: ["INT-DCH-INTUSS-2021"] },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou perfusão e abdome", evidence: { kind: "reassessAfter", after: ["sf09", "ringer_lactato"], reassess: ["geral", "abdome_qsd", "monitorizar"], withinSeconds: 2400 }, points: 6, severity: "importante", rationale: "Detectar peritonite." },
    { id: "s-dx", domain: "destino", description: "Intussuscepção", evidence: { kind: "diagnosis", accepted: ["intussuscepcao"] }, points: 6, severity: "importante", rationale: "USG com alvo." },
    { id: "s-destino", domain: "destino", description: "Internação (ou cirurgia)", evidence: { kind: "disposition", accepted: ["internacao_enfermaria", "centro_cirurgico"] }, points: 6, severity: "importante", rationale: "Sangue nas fezes e distância indicam internar após a redução.", sourceIds: ["INT-DCH-INTUSS-2021"] }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Crises de choro intensas a cada 15–20 min e letargia entre elas." },
      { level: 2, text: "Palpe o abdome e olhe a fralda." },
      { level: 3, text: "Qual exame de imagem confirma em minutos, sem radiação?" },
      { level: 4, text: "Sugestão explícita: acesso, SF 20 mL/kg, analgesia, USG, redução por enema com cirurgia ciente, internar." }
    ],
    summary: "Lactente de 9 meses com intussuscepção ileocólica idiopática após infecção viral, sem peritonite.",
    pathophysiology: "Hiperplasia linfoide (pós-viral) serve de ponto de tração: o íleo invagina no cólon, comprimindo o mesentério. Há obstrução venosa e edema (fezes mucossanguinolentas) e, se mantida, isquemia arterial, necrose e perfuração. A letargia é frequente e pode dominar o quadro.",
    keyPoints: [
      "Pico entre 6 e 36 meses; dor em cólica com letargia entre as crises.",
      "Fezes em geleia de framboesa são sinal tardio.",
      "USG é diagnóstico (sinal do alvo).",
      "Hidratar e reduzir por enema se sem peritonite/perfuração/instabilidade.",
      "Cirurgia se contraindicação ou falha; recorrência ~10%."
    ],
    alternatives: ["Redução hidrostática guiada por ultrassom (sem radiação).", "Laparoscopia para redução em falha do enema."],
    oralRubric: [
      { id: "o1", concept: "Quadro clínico", synonyms: ["cólica", "letargia", "geleia", "massa"], weight: 2 },
      { id: "o2", concept: "USG", synonyms: ["ultrassom", "alvo", "usg"], weight: 2 },
      { id: "o3", concept: "Redução por enema", synonyms: ["enema", "redução", "pneumática", "hidrostática"], weight: 3 },
      { id: "o4", concept: "Contraindicações", synonyms: ["peritonite", "perfuração", "instabilidade"], weight: 2 }
    ],
    simplifications: ["A redução por enema é sempre bem-sucedida se feita antes da perfuração (didático).", "Fentanil e midazolam intranasal para o procedimento não estão no catálogo."]
  },
  references: ["INT-DCH-INTUSS-2021", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 1, allowSexSwap: true, allowWeightPercent: 10, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "História, exame, acesso, SF 20 mL/kg, analgesia, USG, enema, cirurgia ciente, internação", commands: [ask(10, "h-crises"), ask(20, "h-vomito"), { atSeconds: 30, type: "examine", payload: { region: "abdome_qsd", maneuver: "palpacao" } }, { atSeconds: 40, type: "examine", payload: { region: "pelve", maneuver: "inspecao" } }, { atSeconds: 50, type: "examine", payload: { region: "geral", maneuver: "inspecao" } }, act(60, "monitorizar"), act(70, "acesso_venoso"), rx(180, "sf09", "bolsa500", 20, "mL/kg", "IV", "infusao_volume", { durationMinutes: 20 }), rx(200, "dipirona", "amp1g", 15, "mg/kg", "IV"), test(250, "usg_abdome"), act(1500, "solicitar_avaliacao_cirurgica"), { atSeconds: 1550, type: "examine", payload: { region: "abdome_qsd", maneuver: "palpacao" } }, act(1600, "reducao_por_enema"), dx(3600, "intussuscepcao"), dest(3700, "internacao_enfermaria")], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-reducao" }, description: "redução" }, { condition: { not: { ruleFired: "r-perfuracao" } }, description: "sem perfuração" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-perfuracao" }, description: "perfuração" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Antiemético e alta como gastroenterite", commands: [act(30, "acesso_venoso"), rx(150, "ondansetrona", "amp4", 0.15, "mg/kg", "IV"), dest(1200, "alta_orientada")], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-alta" }, description: "alta indevida" }, { condition: { ruleFired: "r-perfuracao" }, description: "perfuração" }] },
    { id: "t-atraso", kind: "delay", description: "USG tardio, perfuração, enema indevido e depois cirurgia", commands: [act(30, "acesso_venoso"), rx(150, "sf09", "bolsa500", 20, "mL/kg", "IV", "infusao_volume", { durationMinutes: 20 }), test(4000, "usg_abdome"), act(5500, "reducao_por_enema"), act(5600, "solicitar_avaliacao_cirurgica"), dest(7400, "centro_cirurgico")], runUntilSeconds: 8000, expect: [{ condition: { ruleFired: "r-perfuracao" }, description: "perfuração pelo atraso" }, { condition: { ruleFired: "r-reducao-contraindicada" }, description: "enema contraindicado" }, { condition: { ruleFired: "r-laparotomia" }, description: "laparotomia" }] },
    { id: "t-alternativa", kind: "alternative", description: "Enema solicitado antes do USG; Ringer", commands: [act(30, "acesso_venoso"), rx(150, "ringer_lactato", "bolsa500", 20, "mL/kg", "IV", "infusao_volume", { durationMinutes: 20 }), act(200, "reducao_por_enema"), test(300, "usg_abdome"), dest(4500, "internacao_enfermaria")], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-reducao-sem-usg" }, description: "pede USG" }, { condition: { ruleFired: "r-reducao" }, description: "redução" }] }
  ]
};
