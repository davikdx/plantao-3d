import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const ATB = { any: [{ drugGiven: "piperacilina_tazobactam" }, { all: [{ drugGiven: "ceftriaxona" }, { drugGiven: "metronidazol" }] }] };
const VOL = { any: [{ drugGiven: "sf09", minTotal: { value: 500, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 500, unit: "mL" as const } }] };
const CIRURGIA = { actionCompleted: "solicitar_avaliacao_cirurgica" };
const TC = { testCollected: "tc_abdome" };
const ALTA = { any: [{ path: "disposition", op: "eq", value: "alta_orientada" }, { path: "disposition", op: "eq", value: "alta_com_seguimento_ubs" }] };

export const C065: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C065",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Idoso com dor na barriga há três dias, pouca febre e 'sem apetite'",
  teachingTitle: "Apendicite aguda complicada no idoso — apresentação atípica, TC, antibiótico, ressuscitação e cirurgia",
  group: "Gastroenterologia",
  specialties: ["Cirurgia geral", "Emergência", "Geriatria"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Reconhecer que o idoso apresenta apendicite com sinais menos evidentes e maior risco de perfuração",
    "Indicar TC de abdome quando a clínica é atípica",
    "Iniciar antibiótico com cobertura de gram-negativos e anaeróbios e repor volume",
    "Analgesia adequada não atrapalha o diagnóstico",
    "Acionar a cirurgia e não dar alta com diagnóstico vago de constipação ou gastroenterite"
  ],
  keywords: ["dor abdominal", "idoso", "febre", "apetite", "barriga", "vômito"],
  patient: {
    name: "Benedito Gomes",
    ageYears: 78,
    sex: "masculino",
    weightKg: 68,
    heightCm: 167,
    visual: { ageGroup: "idoso", sex: "masculino", skinTone: 4, hairStyle: "careca", hairColor: "branco", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Homem de 78 anos com dor abdominal difusa há 3 dias, hoje mais à direita, inapetência e 'febrinha'. Já foi a uma unidade há 2 dias e recebeu 'remédio para gases'.",
  communication: "normal",
  informants: [{ id: "filha", name: "Filha", role: "Acompanhante" }],
  history: [
    h("h-dor", "localizacao", "Onde começou a dor e para onde foi?", "Começou no meio da barriga, meio difusa… agora está mais embaixo, do lado direito.", { keywords: ["dor", "onde", "começou"] }),
    h("h-evolucao", "evolucao", "Como evoluiu nesses dias?", "Foi piorando devagar. Ontem parou de doer um pouco e hoje voltou mais forte.", { keywords: ["evoluiu", "piorando", "dias"] }),
    h("h-associados", "fatores_associados", "Teve vômito, febre, diarreia, urina com ardência?", "Enjoo, vomitei uma vez. Febre baixinha. Intestino preso. Urina normal.", { keywords: ["vômito", "febre", "intestino", "urina"] }),
    hi("h-medicacoes", "medicacoes", "Que remédios usa?", [{ source: "filha", text: "Losartana, AAS e o remédio de próstata. Desde ontem está tomando dipirona de 6 em 6 horas." }], ["remédio", "medicação"]),
    h("h-cirurgias", "cirurgias", "Já operou a barriga?", "Nunca operei.", { keywords: ["operou", "cirurgia"] })
  ],
  initial: {
    vars: { hr: 104, sbp: 112, dbp: 66, rr: 20, spo2: 96, temp: 37.8, gcs: 15, pain: 7, glucose: 124, perfusion: 0.75, effort: 0.3, wbc: 15800, pcr: 22, lactate: 2.2, creat: 1.3, na: 136, k: 4.0, hb: 13.6 },
    flags: { rhythm: "taquicardia_sinusal", posture: "supino", painVisual: "moderada", speech: "frases", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-abdome", "abdome_qid", "palpacao", "Dor e defesa em fossa ilíaca direita, plastrão palpável mal definido; descompressão dolorosa duvidosa.", { label: "Fossa ilíaca direita" }),
    ex("e-abdome-geral", "abdome_epigastrio", "palpacao", "Abdome levemente distendido, ruídos diminuídos; sem peritonite difusa.", { label: "Abdome geral" }),
    ex("e-geral", "geral", "inspecao", "Mucosas secas, prostrado.", {}),
    ex("e-pelve", "pelve", "palpacao", "Toque retal: dor à direita; próstata aumentada, sem massa.", { label: "Toque retal" })
  ],
  testResults: [
    { testId: "tc_abdome", variants: [{ text: "Laudo educativo: apêndice espessado com apendicolito, perfurado, com coleção periapendicular de 4 cm e borramento da gordura; sem pneumoperitônio livre." }] },
    { testId: "usg_abdome", variants: [{ text: "Exame limitado por gases e obesidade abdominal; fossa ilíaca direita com alças espessadas, apêndice não visualizado." }] },
    { testId: "urina_tipo1", variants: [{ text: "Sem leucocitúria ou nitrito." }] },
    { testId: "rx_abdome", variants: [{ text: "Laudo educativo: distensão leve de alças de delgado; sem pneumoperitônio." }] }
  ],
  highlightedActions: ["monitorizar", "acesso_venoso", "solicitar_avaliacao_cirurgica"],
  rules: [
    { id: "r-curso", description: "Apendicite perfurada bloqueada evoluindo para sepse", priority: 10, when: { always: true }, repeat: "once", effects: [trend("temp", 38.7, 3600, "inf", 10), trend("hr", 118, 3600, "inf", 10), trend("sbp", 98, 3600, "inf", 10), trend("lactate", 3.2, 3600, "inf", 10), trend("pain", 8, 1800, "inf", 10)] },
    { id: "r-analgesia", description: "Analgesia", priority: 20, when: { any: [{ drugGiven: "morfina" }, { drugGiven: "dipirona" }] }, repeat: "once", effects: [trend("pain", 4, 600, "anal", 20)] },
    { id: "r-volume", description: "Volume restaura perfusão", priority: 25, when: VOL, repeat: "once", effects: [trend("hr", 100, 1200, "vol", 25), trend("sbp", 120, 1200, "vol", 25), trend("perfusion", 0.85, 1200, "vol", 25)] },
    { id: "r-atb", description: "Antibiótico com cobertura de anaeróbios", priority: 30, when: ATB, repeat: "once", effects: [trend("temp", 37.8, 3600, "atb", 30), trend("hr", 98, 2400, "atb", 30), trend("lactate", 2.0, 3600, "atb", 30)] },
    { id: "r-cirurgia-sem-tc", description: "Cirurgião pede TC", priority: 40, when: { all: [CIRURGIA, { not: TC }] }, repeat: "once", effects: [staff("supervisor", "Cirurgião: idoso com quadro arrastado e plastrão — preciso de TC com contraste para planejar (abscesso? tumor?).")] },
    { id: "r-cirurgia", description: "TC + cirurgia: conduta definida", priority: 41, when: { all: [CIRURGIA, TC] }, repeat: "once", effects: [staff("supervisor", "Cirurgião: apendicite perfurada com abscesso de 4 cm e sepse — antibiótico e abordagem cirúrgica hoje (laparoscopia); sem condição de tratamento ambulatorial."), outcome("estabilizacao_parcial")] },
    { id: "r-sepse", description: "Sem antibiótico em 1 h: sepse", priority: 35, when: { all: [{ time: "gte", seconds: 3600 }, { not: ATB }] }, repeat: "once", effects: [trend("sbp", 86, 900, "sepse", 35), trend("hr", 126, 900, "sepse", 35), trend("lactate", 4.2, 1800, "sepse", 35), trend("gcs", 13, 1800, "sepse", 35), flag("consciousness", "voz"), staff("enfermagem", "Ele está ficando confuso e a pressão caiu."), outcome("piora")] },
    { id: "r-alta", description: "Alta com diagnóstico de constipação/gastroenterite", priority: 50, when: ALTA, repeat: "once", effects: [obs("Alta de idoso com dor localizada, leucocitose e febre sem imagem: alto risco de perfuração e sepse não reconhecidas."), outcome("complicacao")] }
  ],
  diagnosis: { primary: "apendicite_complicada", accepted: ["apendicite_complicada", "apendicite"], differentials: ["isquemia_mesenterica", "obstrucao_intestinal", "pielonefrite", "colecistite", "gastroenterite"] },
  acceptedDestinations: ["centro_cirurgico"],
  outcomeNotes: "Apendicite aguda perfurada com abscesso em idoso de 78 anos, com apresentação arrastada e sinais atenuados (dipirona mascarando a febre). Volume, analgesia, antibiótico com cobertura de gram-negativos e anaeróbios, TC com contraste, cirurgia hoje.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Migração da dor e evolução", evidence: { kind: "historyAsked", items: ["h-dor", "h-evolucao"], minCount: 2 }, points: 6, severity: "importante", rationale: "Melhora transitória sugere perfuração." },
    { id: "s-meds", domain: "historia", description: "Medicações (antitérmico mascarando febre)", evidence: { kind: "historyAsked", items: ["h-medicacoes"], minCount: 1 }, points: 4, severity: "importante", rationale: "Dipirona contínua atenua a febre." },
    { id: "s-exame", domain: "historia", description: "Exame abdominal dirigido", evidence: { kind: "examDone", regions: ["abdome_qid", "abdome_epigastrio"], minCount: 2 }, points: 8, severity: "critica", rationale: "Plastrão e defesa localizada." },
    { id: "s-labs", domain: "exames", description: "Hemograma, função renal e lactato", evidence: { kind: "testOrdered", anyOf: ["hemograma", "gaso_venosa", "funcao_renal", "pcr"], withinSeconds: 900 }, points: 5, severity: "importante", rationale: "Inflamação, perfusão e preparo para contraste." },
    { id: "s-tc", domain: "exames", description: "TC de abdome com contraste", evidence: { kind: "testOrdered", anyOf: ["tc_abdome"], withinSeconds: 2400 }, points: 12, severity: "critica", rationale: "Idoso/apresentação atípica: TC define complicação e diferenciais.", sourceIds: ["INT-WSES-APEND-2020"] },
    { id: "s-analgesia", domain: "tratamento", description: "Analgesia (inclusive opioide)", evidence: { kind: "drugGiven", anyOf: ["morfina", "dipirona"], withinSeconds: 900 }, points: 4, severity: "importante", rationale: "Analgesia não mascara o diagnóstico." },
    { id: "s-volume", domain: "tratamento", description: "Cristaloide", evidence: { kind: "drugGiven", anyOf: ["sf09", "ringer_lactato"], withinSeconds: 1200 }, points: 6, severity: "importante", rationale: "Desidratação e sepse em evolução.", sourceIds: ["INT-SSC-2021"] },
    { id: "s-atb", domain: "tratamento", description: "Antibiótico com cobertura de anaeróbios em até 1 h", evidence: { kind: "drugGiven", anyOf: ["piperacilina_tazobactam", "metronidazol"], withinSeconds: 3600 }, points: 12, severity: "critica", rationale: "Apendicite complicada com sinais de sepse.", sourceIds: ["INT-WSES-APEND-2020", "INT-SSC-2021"] },
    { id: "s-cirurgia", domain: "tratamento", description: "Acionou a cirurgia", evidence: { kind: "actionDone", anyOf: ["solicitar_avaliacao_cirurgica"], withinSeconds: 3600 }, points: 12, severity: "critica", rationale: "Controle do foco." },
    { id: "s-alta", domain: "destino", description: "Falha: alta sem diagnóstico", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-alta" } }, points: 12, penalty: true, severity: "critica", rationale: "Erro clássico no idoso." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou dor e perfusão após o tratamento", evidence: { kind: "reassessAfter", after: ["morfina", "dipirona", "sf09", "ringer_lactato"], reassess: ["avaliar_dor", "medir_pa", "abdome_qid", "gaso_venosa"], withinSeconds: 2400 }, points: 6, severity: "importante", rationale: "Abdome seriado." },
    { id: "s-dx", domain: "destino", description: "Apendicite complicada", evidence: { kind: "diagnosis", accepted: ["apendicite_complicada", "apendicite"] }, points: 6, severity: "importante", rationale: "TC com perfuração e abscesso." },
    { id: "s-destino", domain: "destino", description: "Centro cirúrgico", evidence: { kind: "disposition", accepted: ["centro_cirurgico"] }, points: 8, severity: "critica", rationale: "Tratamento cirúrgico." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Idoso com dor abdominal: o exame costuma subestimar a gravidade." },
      { level: 2, text: "Ele toma dipirona de 6/6 h. O que isso faz com a febre?" },
      { level: 3, text: "A dor 'melhorou' ontem e voltou pior. O que aconteceu com o apêndice?" },
      { level: 4, text: "Sugestão explícita: acesso, exames, Ringer, analgesia, piperacilina-tazobactam, TC com contraste, cirurgia, centro cirúrgico." }
    ],
    summary: "Homem de 78 anos com apendicite aguda perfurada com abscesso, apresentação arrastada e sinais atenuados, inicialmente tratada como gases.",
    pathophysiology: "A obstrução do lúmen apendicular leva a distensão, isquemia e perfuração. No idoso, a resposta inflamatória e a defesa abdominal são menos intensas e a parede apendicular é mais frágil, por isso a perfuração é mais frequente e o diagnóstico mais tardio. O alívio transitório da dor pode corresponder à perfuração.",
    keyPoints: [
      "No idoso, apendicite tem apresentação atípica e alta taxa de perfuração.",
      "TC com contraste quando a clínica é atípica ou em idosos.",
      "Analgesia, inclusive opioide, não prejudica o diagnóstico.",
      "Antibiótico com cobertura de anaeróbios e controle do foco.",
      "Não dar alta com 'gases' ou 'constipação' sem explicação para dor localizada e leucocitose."
    ],
    alternatives: ["Ceftriaxona + metronidazol em vez de piperacilina-tazobactam.", "Drenagem percutânea do abscesso com cirurgia de intervalo em casos selecionados (decisão cirúrgica)."],
    oralRubric: [
      { id: "o1", concept: "Atipia no idoso", synonyms: ["idoso", "atípico", "perfuração"], weight: 2 },
      { id: "o2", concept: "TC", synonyms: ["tomografia", "tc"], weight: 2 },
      { id: "o3", concept: "Antibiótico e cirurgia", synonyms: ["antibiótico", "cirurgia", "apendicectomia", "drenagem"], weight: 3 },
      { id: "o4", concept: "Analgesia", synonyms: ["analgesia", "morfina", "opioide"], weight: 1 }
    ],
    simplifications: ["Metronidazol sem regra de dose validada (o app alerta).", "O procedimento cirúrgico não é simulado; acionar a cirurgia com TC representa a decisão."]
  },
  references: ["INT-WSES-APEND-2020", "INT-SSC-2021", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "História, exame, labs, Ringer, morfina, piperacilina-tazobactam, TC, cirurgia", commands: [ask(10, "h-dor"), ask(20, "h-evolucao"), ask(30, "h-medicacoes"), { atSeconds: 40, type: "examine", payload: { region: "abdome_qid", maneuver: "palpacao" } }, { atSeconds: 50, type: "examine", payload: { region: "abdome_epigastrio", maneuver: "palpacao" } }, act(60, "monitorizar"), act(70, "acesso_venoso"), test(180, "hemograma"), test(190, "gaso_venosa"), test(200, "funcao_renal"), rx(220, "ringer_lactato", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), rx(240, "morfina", "amp10", 3, "mg", "IV"), test(300, "tc_abdome"), rx(600, "piperacilina_tazobactam", "fa45", 4500, "mg", "IV"), act(1200, "avaliar_dor"), act(1250, "medir_pa"), act(2200, "solicitar_avaliacao_cirurgica"), dx(4400, "apendicite_complicada"), dest(4500, "centro_cirurgico")], runUntilSeconds: 5000, expect: [{ condition: { ruleFired: "r-cirurgia" }, description: "cirurgia com TC" }, { condition: { not: { ruleFired: "r-sepse" } }, description: "sem sepse" }, { condition: { not: { ruleFired: "r-alta" } }, description: "sem alta indevida" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 4000, expect: [{ condition: { ruleFired: "r-sepse" }, description: "sepse" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Dipirona e alta como constipação", commands: [act(60, "acesso_venoso"), rx(200, "dipirona", "amp1g", 1000, "mg", "IV"), test(300, "rx_abdome"), dest(1500, "alta_orientada")], runUntilSeconds: 4000, expect: [{ condition: { ruleFired: "r-alta" }, description: "alta indevida" }, { condition: { ruleFired: "r-sepse" }, description: "sepse não tratada" }] },
    { id: "t-atraso", kind: "delay", description: "Antibiótico só após sepse; TC tardia", commands: [act(60, "acesso_venoso"), rx(200, "dipirona", "amp1g", 1000, "mg", "IV"), test(2400, "tc_abdome"), rx(4000, "piperacilina_tazobactam", "fa45", 4500, "mg", "IV"), rx(4050, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 30 }), act(4100, "solicitar_avaliacao_cirurgica"), dest(5000, "centro_cirurgico")], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-sepse" }, description: "sepse pelo atraso" }, { condition: { ruleFired: "r-cirurgia" }, description: "cirurgia" }] },
    { id: "t-alternativa", kind: "alternative", description: "Ceftriaxona + metronidazol; cirurgia acionada antes da TC", commands: [act(30, "acesso_venoso"), rx(150, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), rx(200, "ceftriaxona", "fa1g", 2000, "mg", "IV"), rx(220, "metronidazol", "bolsa500", 500, "mg", "IV", "infusao_volume", { durationMinutes: 30 }), act(300, "solicitar_avaliacao_cirurgica"), test(950, "tc_abdome"), dest(4000, "centro_cirurgico")], runUntilSeconds: 5000, expect: [{ condition: { ruleFired: "r-cirurgia-sem-tc" }, description: "cirurgião pede TC" }, { condition: { ruleFired: "r-cirurgia" }, description: "cirurgia com TC" }, { condition: { ruleFired: "r-atb" }, description: "antibiótico" }] }
  ]
};
