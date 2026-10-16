import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const SANGUE = { drugGiven: "concentrado_hemacias" };
const CINTA = { actionCompleted: "cinta_pelvica" };
const CRISTALOIDE_EXCESSO = { any: [{ drugGiven: "sf09", minTotal: { value: 2000, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 2000, unit: "mL" as const } }] };
const CRISTALOIDE_INICIAL = { any: [{ drugGiven: "sf09", minTotal: { value: 500, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 500, unit: "mL" as const } }] };

export const C044: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C044",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Motociclista com dor no quadril, pálido e com pressão baixa",
  teachingTitle: "Fratura do anel pélvico com choque hemorrágico — cinta pélvica, reanimação hemostática e controle do sangramento",
  group: "Trauma",
  specialties: ["Trauma", "Ortopedia", "Cirurgia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 4,
  level: "internato",
  objectives: [
    "Reconhecer instabilidade hemodinâmica por fratura pélvica (índice de choque > 1)",
    "Aplicar estabilização pélvica não invasiva precoce",
    "Usar radiografia de pelve e eFAST na sala de emergência",
    "Reanimação hemostática: hemocomponentes, ácido tranexâmico, cristaloide restrito, aquecimento",
    "Não sondar a uretra com sangue no meato antes de investigar lesão uretral",
    "Encaminhar ao controle do sangramento (fixação externa e tamponamento pré-peritoneal)"
  ],
  keywords: ["moto", "acidente", "quadril", "bacia", "trauma", "pálido"],
  patient: {
    name: "Rogério Batista",
    ageYears: 38,
    sex: "masculino",
    weightKg: 82,
    heightCm: 175,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 4, hairStyle: "careca", hairColor: "preto", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional (centro cirúrgico, ortopedia e banco de sangue; sem hemodinâmica). O SAMU traz motociclista de 38 anos que colidiu lateralmente com um caminhão há 35 minutos. Chega em prancha rígida, com colar, queixando-se de dor intensa no quadril.",
  communication: "normal",
  informants: [{ id: "samu", name: "Enfermeira do SAMU", role: "Equipe do SAMU 192" }],
  history: [
    hi("h-cinematica", "inicio", "Como foi o acidente? (equipe do SAMU)", [{ source: "samu", text: "Impacto lateral contra o caminhão, a moto ficou presa embaixo. No local PA 100/70; recebeu 500 mL de soro no caminho." }], ["acidente", "como foi", "cinemática", "samu"]),
    hi("h-hora", "inicio", "Há quanto tempo foi?", [{ source: "samu", text: "Uns 35 minutos." }], ["tempo", "quando", "horas"]),
    h("h-dor", "localizacao", "Onde dói?", "No quadril, dos dois lados, e embaixo… não consigo mexer as pernas de dor.", { keywords: ["dói", "dor", "onde"] }),
    h("h-urina", "fatores_associados", "Conseguiu urinar? Viu sangue?", "Tô com vontade e não sai nada.", { keywords: ["urinar", "xixi", "urina"] }),
    h("h-ample", "antecedentes", "Tem doença, alergia, usa remédio? Quando comeu?", "Nada disso. Tomei café às sete.", { keywords: ["doença", "alergia", "remédio", "ample"] }),
    h("h-neuro", "sinais_alarme", "Sente as pernas? Bateu a cabeça?", "Sinto as pernas, só dói muito. Capacete segurou.", { keywords: ["pernas", "cabeça"] })
  ],
  initial: {
    vars: { hr: 128, sbp: 84, dbp: 52, rr: 26, spo2: 96, temp: 35.8, gcs: 15, pain: 9, glucose: 150, perfusion: 0.4, effort: 0.45, hb: 10.2, ht: 31, plt: 220000, inr: 1.2, lactate: 4.4, be: -7, ph: 7.29, hco3: 18, urine: 0, bleeding: 70 },
    flags: { rhythm: "taquicardia_sinusal", pallor: true, sweating: true, posture: "supino", painVisual: "intensa", speech: "frases", consciousness: "alerta", agitation: true },
    devices: ["colar_cervical"],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Pálido, sudoreico, ansioso; sem sangramento externo.", { better: [{ when: { ruleFired: "r-choque-grave" }, text: "Sonolento, pele fria e marmórea." }] }),
    ex("e-via-aerea", "boca", "inspecao", "Via aérea pérvia, fala frases completas.", { label: "Via aérea (A)" }),
    ex("e-torax", "torax_anterior", "ausculta", "Murmúrio presente bilateralmente; tórax estável.", { sound: "murmurio_normal", label: "Tórax (B)" }),
    ex("e-abdome", "abdome_qid", "palpacao", "Abdome flácido, dor em hipogástrio; sem peritonite.", { label: "Abdome (C)" }),
    ex("e-pelve-insp", "pelve", "inspecao", "Hematoma perineal e escrotal; sangue no meato uretral; membros inferiores com rotação externa.", { label: "Pelve e períneo" }),
    ex("e-pelve", "pelve", "palpacao", "Dor intensa e mobilidade anormal à compressão látero-lateral (realizar uma única vez).", { label: "Estabilidade pélvica", better: [{ when: { actionCompleted: "cinta_pelvica" }, text: "Cinta pélvica posicionada sobre os trocânteres; não manipular a pelve novamente." }] }),
    ex("e-neuro", "neurologico", "especial", "Glasgow 15; move os quatro membros (limitado pela dor); sensibilidade preservada.", { label: "Neurológico (D)" }),
    ex("e-pele", "pele", "inspecao", "Escoriações em flanco direito; sem fraturas expostas.", { label: "Exposição (E)" })
  ],
  testResults: [
    { testId: "rx_pelve", variants: [{ text: "Laudo educativo: diástase da sínfise púbica (~4 cm) e alargamento da articulação sacroilíaca direita — padrão 'livro aberto' (compressão anteroposterior), anel pélvico instável." }] },
    { testId: "efast", variants: [{ text: "Laudo educativo: sem líquido livre peri-hepático, periesplênico ou pélvico significativo; sem derrame pericárdico; deslizamento pleural presente. (FAST negativo não exclui sangramento retroperitoneal.)" }] },
    { testId: "rx_torax", variants: [{ text: "Laudo educativo: sem pneumotórax, hemotórax ou alargamento de mediastino." }] }
  ],
  highlightedActions: ["monitorizar", "acesso_venoso", "cinta_pelvica", "aquecimento", "solicitar_avaliacao_cirurgica"],
  rules: [
    { id: "r-sangramento", description: "Sangramento pélvico (venoso/ósseo e arterial) sem estabilização", priority: 10, when: { always: true }, repeat: "once", effects: [trend("sbp", 56, 1800, "hem", 10), trend("dbp", 34, 1800, "hem", 10), trend("hr", 148, 1500, "hem", 10), trend("hb", 6.6, 2400, "hem", 10), trend("lactate", 7.5, 2400, "hem", 10), trend("perfusion", 0.2, 1800, "hem", 10)] },
    { id: "r-cristaloide", description: "Cristaloide inicial: resposta transitória", priority: 25, when: CRISTALOIDE_INICIAL, repeat: "once", effects: [trend("sbp", 88, 300, "cri", 25, 1200), trend("hr", 124, 300, "cri", 25, 1200)] },
    { id: "r-cinta", description: "Fechamento do anel pélvico: reduz o volume pélvico e o sangramento venoso", priority: 40, when: CINTA, repeat: "once", effects: [trend("sbp", 88, 300, "cinta", 40), trend("hr", 122, 300, "cinta", 40), trend("pain", 6, 300, "cinta", 40), obs("Após a cinta pélvica, a dor diminuiu e a PA subiu um pouco — o sangramento ainda não está controlado.")] },
    { id: "r-transfusao", description: "Hemocomponentes sem estabilização pélvica: resposta transitória", priority: 45, when: SANGUE, repeat: "once", effects: [trend("sbp", 90, 400, "tx", 45, 1200), trend("hr", 118, 400, "tx", 45, 1200), trend("hb", 8.2, 900, "tx", 45)] },
    { id: "r-estavel", description: "Cinta pélvica + hemocomponentes: estabilização parcial (hipotensão permissiva)", priority: 55, when: { all: [SANGUE, CINTA] }, repeat: "once", effects: [trend("sbp", 96, 600, "est", 55), trend("dbp", 60, 600, "est", 55), trend("hr", 108, 600, "est", 55), trend("perfusion", 0.6, 600, "est", 55), trend("hb", 8.6, 900, "est", 55), trend("lactate", 3.2, 1200, "est", 55), flag("agitation", false), outcome("estabilizacao_parcial")] },
    { id: "r-diluicao", description: "Cristaloide ≥ 2 L: coagulopatia dilucional, hipotermia e acidose", priority: 60, when: CRISTALOIDE_EXCESSO, repeat: "once", effects: [trend("inr", 1.9, 900, "dil", 60), trend("temp", 34.8, 900, "dil", 60), trend("ph", 7.15, 900, "dil", 60), trend("hb", 5.8, 900, "dil", 60), obs("Após 2 L de cristaloide: o sangramento piora (diluição, hipotermia e acidose)."), outcome("complicacao")] },
    { id: "r-sonda", description: "Sondagem vesical com sangue no meato: risco de converter lesão uretral parcial em completa", priority: 35, when: { actionCompleted: "diurese_horaria" }, repeat: "once", effects: [staff("enfermagem", "A sonda encontrou resistência e saiu sangue pela uretra. Paramos a passagem."), obs("Sangue no meato + hematoma perineal com fratura pélvica: investigar uretra (uretrografia) antes de sondar; se necessário, cistostomia pela urologia."), outcome("complicacao")] },
    { id: "r-atx", description: "Ácido tranexâmico registrado", when: { drugGiven: "acido_tranexamico" }, repeat: "once", effects: [obs("Ácido tranexâmico administrado dentro de 3 h do trauma.")] },
    { id: "r-hipotermia", description: "Sem aquecimento: perda de calor", when: { all: [{ time: "gte", seconds: 900 }, { not: { actionCompleted: "aquecimento" } }] }, repeat: "once", effects: [trend("temp", 35.0, 1200, "frio", 15)] },
    { id: "r-cirurgia", description: "Equipe cirúrgica/ortopedia acionada", priority: 30, when: { actionCompleted: "solicitar_avaliacao_cirurgica" }, repeat: "once", effects: [staff("supervisor", "Cirurgião e ortopedista: instável com fratura em livro aberto e FAST negativo — sala para fixação externa e tamponamento pré-peritoneal. Sem hemodinâmica aqui; se sangrar após o controle, regular angioembolização.")] },
    { id: "r-choque-grave", description: "Sem cinta nem hemocomponente em 25 min: choque grave", priority: 30, when: { all: [{ time: "gte", seconds: 1500 }, { not: SANGUE }, { not: CINTA }] }, repeat: "once", effects: [trend("sbp", 58, 300, "grave", 30), flag("consciousness", "voz"), flag("speech", "palavras"), trend("gcs", 11, 300, "grave", 30), staff("enfermagem", "Ele está ficando sonolento e a pressão não aparece."), outcome("piora")] },
    { id: "r-pcr", description: "Sem hemocomponente em 45 min: PCR (AESP hipovolêmica)", priority: 100, when: { all: [{ time: "gte", seconds: 2700 }, { not: SANGUE }] }, repeat: "once", effects: [flag("pulse", false), { type: "setValue", var: "sbp", value: 0 }, { type: "setValue", var: "dbp", value: 0 }, flag("consciousness", "irresponsivo"), staff("enfermagem", "Parou! Sem pulso, ritmo organizado no monitor."), outcome("parada", true)] },
    { id: "r-banco", description: "Banco de sangue", when: { testCollected: "hemograma" }, repeat: "once", effects: [staff("laboratorio", "Banco de sangue: amostra recebida; concentrado de hemácias O negativo disponível.")] }
  ],
  diagnosis: { primary: "fratura_pelve_instavel", accepted: ["fratura_pelve_instavel", "choque_hipovolemico"], differentials: ["lesao_esplenica_trauma", "trauma_raquimedular", "pneumotorax_hipertensivo", "tamponamento", "fratura_femur"] },
  acceptedDestinations: ["centro_cirurgico"],
  outcomeNotes: "Fratura do anel pélvico em 'livro aberto' com choque hemorrágico e FAST negativo (sangramento retroperitoneal). Cinta pélvica precoce, hemocomponentes, ácido tranexâmico até 3 h, aquecimento e cristaloide restrito; controle por fixação externa + tamponamento pré-peritoneal (ou angioembolização onde houver). Sangue no meato contraindica sondagem às cegas.",
  scoring: [
    { id: "s-cinematica", domain: "historia", description: "Obteve cinemática e horário do trauma", evidence: { kind: "historyAsked", items: ["h-cinematica", "h-hora"], minCount: 1 }, points: 4, severity: "importante", rationale: "Impacto lateral/esmagamento sugere lesão pélvica; tempo define a janela do ácido tranexâmico." },
    { id: "s-primaria", domain: "historia", description: "Avaliação primária incluindo pelve e períneo", evidence: { kind: "examDone", regions: ["boca", "torax_anterior", "abdome_qid", "pelve", "neurologico"], minCount: 4 }, points: 8, severity: "critica", rationale: "XABCDE; períneo e meato orientam a conduta urológica.", sourceIds: ["BR-SAMU-SAV"] },
    { id: "s-acesso", domain: "priorizacao", description: "Acessos calibrosos/IO em até 5 min", evidence: { kind: "actionDone", anyOf: ["acesso_venoso", "acesso_io"], withinSeconds: 300 }, points: 5, severity: "critica", rationale: "Reposição imediata." },
    { id: "s-cinta", domain: "priorizacao", description: "Estabilização pélvica não invasiva em até 10 min", evidence: { kind: "actionDone", anyOf: ["cinta_pelvica"], withinSeconds: 600 }, points: 12, severity: "critica", rationale: "Fechar o anel reduz o sangramento; cinta superior ao lençol.", sourceIds: ["INT-WSES-PELVE-2017", "INT-EUR-SANGRAMENTO-2023"] },
    { id: "s-imagem", domain: "exames", description: "Radiografia de pelve e/ou eFAST na sala de emergência", evidence: { kind: "testOrdered", anyOf: ["rx_pelve", "efast"], withinSeconds: 900 }, points: 8, severity: "critica", rationale: "Instável não vai à TC; identificar fonte pélvica e excluir hemoperitônio.", sourceIds: ["INT-WSES-PELVE-2017"] },
    { id: "s-exames", domain: "exames", description: "Exames dirigidos", evidence: { kind: "testsNotExcessive", maxUnjustified: 0, justified: ["rx_pelve", "efast", "rx_torax", "hemograma", "coagulograma", "gaso_venosa", "gaso_arterial", "eletrolitos"] }, points: 4, severity: "importante", rationale: "Paciente instável não deve sair da sala." },
    { id: "s-sangue", domain: "tratamento", description: "Concentrado de hemácias em até 15 min", evidence: { kind: "drugGiven", anyOf: ["concentrado_hemacias"], withinSeconds: 900 }, points: 12, severity: "critica", rationale: "Reanimação hemostática.", sourceIds: ["INT-EUR-SANGRAMENTO-2023"] },
    { id: "s-atx", domain: "tratamento", description: "Ácido tranexâmico até 3 h do trauma", evidence: { kind: "drugGiven", anyOf: ["acido_tranexamico"] }, points: 6, severity: "importante", rationale: "1 g em 10 min seguido de 1 g em 8 h.", sourceIds: ["INT-EUR-SANGRAMENTO-2023", "INT-CRASH2"] },
    { id: "s-aquecer", domain: "tratamento", description: "Prevenção de hipotermia", evidence: { kind: "actionDone", anyOf: ["aquecimento"], withinSeconds: 900 }, points: 4, severity: "importante", rationale: "Hipotermia piora a coagulopatia.", sourceIds: ["INT-EUR-SANGRAMENTO-2023"] },
    { id: "s-sonda", domain: "tratamento", description: "Não sondou a uretra com sangue no meato", evidence: { kind: "avoidAction", anyOf: ["diurese_horaria"] }, points: 6, severity: "importante", rationale: "Uretrografia antes da sonda quando há suspeita de lesão uretral.", sourceIds: ["INT-WSES-PELVE-2017"] },
    { id: "s-diluicao", domain: "tratamento", description: "Falha: cristaloide liberal (≥ 2 L)", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-diluicao" } }, points: 10, penalty: true, severity: "critica", rationale: "Tríade letal." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou PA/Hb após transfusão", evidence: { kind: "reassessAfter", after: ["concentrado_hemacias"], reassess: ["medir_pa", "hemograma", "gaso_venosa", "gaso_arterial"], withinSeconds: 1200 }, points: 8, severity: "importante", rationale: "Resposta transitória indica controle cirúrgico urgente." },
    { id: "s-cirurgia", domain: "destino", description: "Acionou cirurgia/ortopedia para controle do sangramento", evidence: { kind: "actionDone", anyOf: ["solicitar_avaliacao_cirurgica"], withinSeconds: 1200 }, points: 6, severity: "critica", rationale: "Fixação externa e tamponamento pré-peritoneal.", sourceIds: ["INT-WSES-PELVE-2017"] },
    { id: "s-dx", domain: "destino", description: "Fratura pélvica instável com choque hemorrágico", evidence: { kind: "diagnosis", accepted: ["fratura_pelve_instavel"] }, points: 4, severity: "importante", rationale: "Radiografia em livro aberto, FAST negativo." },
    { id: "s-destino", domain: "destino", description: "Centro cirúrgico", evidence: { kind: "disposition", accepted: ["centro_cirurgico"] }, points: 6, severity: "critica", rationale: "Sem hemodinâmica, o controle é cirúrgico." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Choque no trauma: onde o sangue pode estar escondido?" },
      { level: 2, text: "Tórax, abdome, pelve, ossos longos, chão. Olhe o períneo." },
      { level: 3, text: "Fechar o anel pélvico reduz o espaço onde o sangue se acumula." },
      { level: 4, text: "Sugestão explícita: cinta pélvica, 2 acessos, radiografia de pelve + eFAST, hemácias, ácido tranexâmico, aquecimento, cirurgia; não sondar." }
    ],
    summary: "Motociclista de 38 anos com fratura pélvica em 'livro aberto', choque hemorrágico (índice de choque > 1), FAST negativo, hematoma perineal e sangue no meato uretral.",
    pathophysiology: "A abertura do anel pélvico aumenta muito o volume do retroperitônio; plexos venosos pré-sacrais e superfícies ósseas sangram (≈ 85%), com componente arterial em uma minoria. A cinta reduz o volume e aproxima as superfícies; o controle definitivo é fixação, tamponamento ou embolização. A uretra posterior pode ser lesada na diástase da sínfise.",
    keyPoints: [
      "FAST negativo no choque não exclui sangramento retroperitoneal pélvico.",
      "Cinta pélvica precoce sobre os trocânteres; não repetir manobras de compressão.",
      "Hemocomponentes precoces, ácido tranexâmico, cristaloide restrito, aquecer.",
      "Sangue no meato: não sondar às cegas.",
      "Controle: fixação externa + tamponamento pré-peritoneal ou angioembolização."
    ],
    alternatives: ["Lençol amarrado sobre os trocânteres quando não há cinta (menos eficaz).", "Angioembolização em centro com hemodinâmica (transferência regulada se estabilizado).", "REBOA zona III em centros habilitados (não modelado)."],
    oralRubric: [
      { id: "o1", concept: "Cinta pélvica", synonyms: ["cinta", "binder", "lençol", "estabilização pélvica"], weight: 3 },
      { id: "o2", concept: "FAST negativo não exclui", synonyms: ["retroperitônio", "retroperitoneal", "fast negativo"], weight: 2 },
      { id: "o3", concept: "Hemocomponentes e ácido tranexâmico", synonyms: ["hemácias", "transfusão", "tranexâmico"], weight: 2 },
      { id: "o4", concept: "Lesão uretral", synonyms: ["uretra", "meato", "sonda", "uretrografia"], weight: 1 },
      { id: "o5", concept: "Controle definitivo", synonyms: ["fixação externa", "tamponamento", "embolização"], weight: 2 }
    ],
    simplifications: ["Cinta pélvica e lençol são a mesma ação no simulador.", "Resposta à transfusão é determinística; plasma e plaquetas não são modelados.", "PCR aos 45 min sem hemocomponente é decisão didática."]
  },
  references: ["INT-WSES-PELVE-2017", "INT-EUR-SANGRAMENTO-2023", "INT-CRASH2", "BR-SAMU-SAV", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 15, allowSexSwap: false, allowWeightPercent: 15, allowVisualVariation: true, forbidden: ["sexo: achados uretrais descritos para homem"] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "XABCDE, cinta, imagem na sala, hemácias, ATX, aquecimento, cirurgia", commands: [act(5, "monitorizar"), ask(10, "h-cinematica"), { atSeconds: 15, type: "examine", payload: { region: "boca", maneuver: "inspecao" } }, { atSeconds: 25, type: "examine", payload: { region: "torax_anterior", maneuver: "ausculta" } }, act(30, "acesso_venoso"), act(130, "acesso_venoso"), { atSeconds: 140, type: "examine", payload: { region: "abdome_qid", maneuver: "palpacao" } }, { atSeconds: 150, type: "examine", payload: { region: "pelve", maneuver: "inspecao" } }, { atSeconds: 160, type: "examine", payload: { region: "pelve", maneuver: "palpacao" } }, act(170, "cinta_pelvica"), test(240, "rx_pelve"), test(250, "efast"), test(260, "hemograma"), rx(330, "concentrado_hemacias", "unidade", 300, "mL", "IV", "infusao_volume", { durationMinutes: 15 }), rx(350, "acido_tranexamico", "amp250", 1000, "mg", "IV"), act(360, "aquecimento"), act(400, "solicitar_avaliacao_cirurgica"), act(1100, "medir_pa"), dx(1200, "fratura_pelve_instavel"), dest(1200, "centro_cirurgico")], runUntilSeconds: 1800, expect: [{ condition: { ruleFired: "r-estavel" }, description: "estabilização parcial" }, { condition: { not: { ruleFired: "r-diluicao" } }, description: "sem diluição" }, { condition: { not: { ruleFired: "r-sonda" } }, description: "uretra preservada" }, { condition: { path: "vars.sbp", op: "gte", value: 85 }, description: "PAS ≥ 85" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 2800, expect: [{ condition: { ruleFired: "r-choque-grave" }, description: "choque grave" }, { condition: { ruleFired: "r-pcr" }, description: "PCR" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Cristaloide liberal e sondagem vesical", commands: [act(30, "acesso_venoso"), act(130, "acesso_venoso"), rx(200, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 10 }), rx(220, "ringer_lactato", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 10 }), act(300, "diurese_horaria"), rx(600, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 10 })], runUntilSeconds: 1800, expect: [{ condition: { ruleFired: "r-diluicao" }, description: "tríade letal" }, { condition: { ruleFired: "r-sonda" }, description: "lesão uretral agravada" }, { condition: { ruleFired: "r-choque-grave" }, description: "choque grave" }] },
    { id: "t-atraso", kind: "delay", description: "Cinta e hemácias só aos 30 min", commands: [act(30, "acesso_venoso"), act(130, "acesso_venoso"), act(1800, "cinta_pelvica"), rx(1850, "concentrado_hemacias", "unidade", 300, "mL", "IV", "infusao_volume", { durationMinutes: 15 })], runUntilSeconds: 3200, expect: [{ condition: { ruleFired: "r-choque-grave" }, description: "piora pelo atraso" }, { condition: { ruleFired: "r-estavel" }, description: "estabilização tardia" }, { condition: { not: { ruleFired: "r-pcr" } }, description: "PCR evitada" }] },
    { id: "t-alternativa", kind: "alternative", description: "Acesso IO, 500 mL de Ringer, cinta e hemácias por IO", commands: [act(20, "acesso_io"), rx(100, "ringer_lactato", "bolsa500", 500, "mL", "IO", "infusao_volume", { durationMinutes: 10 }), act(150, "cinta_pelvica"), test(230, "efast"), rx(400, "concentrado_hemacias", "unidade", 300, "mL", "IO", "infusao_volume", { durationMinutes: 15 }), dest(1200, "centro_cirurgico")], runUntilSeconds: 1800, expect: [{ condition: { ruleFired: "r-estavel" }, description: "estabilização parcial" }, { condition: { not: { ruleFired: "r-diluicao" } }, description: "sem diluição" }] }
  ]
};
