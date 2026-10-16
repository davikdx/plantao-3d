import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const SANGUE = { drugGiven: "concentrado_hemacias", minTotal: { value: 100, unit: "mL" as const } };
const BOLUS = { any: [{ drugGiven: "sf09", minTotal: { value: 360, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 360, unit: "mL" as const } }] };
const EXCESSO = { any: [{ drugGiven: "sf09", minTotal: { value: 1400, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 1400, unit: "mL" as const } }] };
const TALA = { actionCompleted: "imobilizar_membro" };

export const C048: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C048",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Menina de 7 anos atropelada, chorosa e com a perna torta",
  teachingTitle: "Politrauma pediátrico — XABCDE com valores por idade, acesso IO, bolus por peso, hemocomponentes e lesão esplênica",
  group: "Trauma",
  specialties: ["Pediatria", "Trauma", "Cirurgia pediátrica", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-referencia",
  difficulty: 4,
  level: "internato",
  objectives: [
    "Aplicar o XABCDE com valores de referência pediátricos (PAS mínima ≈ 70 + 2 × idade)",
    "Reconhecer choque compensado/descompensado na criança (taquicardia, enchimento capilar)",
    "Obter acesso intraósseo sem atraso e calcular volumes por peso",
    "Após bolus sem resposta sustentada, indicar hemocomponentes; evitar cristaloide excessivo",
    "Imobilizar fratura de fêmur, aquecer, analgesia e definir tratamento não operatório monitorizado"
  ],
  keywords: ["criança", "atropelamento", "perna", "barriga", "trauma"],
  patient: {
    name: "Ana Clara Moreira",
    ageYears: 7,
    sex: "feminino",
    weightKg: 24,
    heightCm: 122,
    visual: { ageGroup: "escolar", sex: "feminino", skinTone: 3, hairStyle: "longo", hairColor: "preto", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital de referência (cirurgia pediátrica, TC, UTI pediátrica, banco de sangue). O SAMU traz menina de 7 anos atropelada por carro em baixa velocidade há 30 minutos. Chega em prancha, com colar, acompanhada pela mãe. Chora e se queixa da perna direita.",
  communication: "normal",
  informants: [{ id: "mae", name: "Mãe", role: "Acompanhante" }, { id: "samu", name: "Técnico do SAMU", role: "Equipe do SAMU 192" }],
  history: [
    hi("h-mecanismo", "inicio", "Como foi o atropelamento?", [{ source: "samu", text: "Carro a uns 40 km/h, pegou de lado; foi arremessada uns 3 metros. Chorou na hora." }, { source: "mae", text: "Ela atravessou correndo atrás da bola." }], ["como foi", "atropelamento", "carro"]),
    h("h-dor", "localizacao", "Onde está doendo, meu amor?", "Na perna… e na barriga, do lado.", { keywords: ["dói", "dor", "doendo", "onde"] }),
    hi("h-desmaio", "sinais_alarme", "Ela apagou ou vomitou?", [{ source: "mae", text: "Não apagou. Vomitou uma vez na ambulância." }], ["apagou", "desmaio", "vomitou"]),
    hi("h-peso", "antecedentes", "Qual o peso dela? Tem alergia, doença, vacinas em dia?", [{ source: "mae", text: "Uns 24 quilos. Saudável, sem alergia, vacinas em dia." }], ["peso", "alergia", "doença", "vacina"]),
    hi("h-comeu", "antecedentes", "Quando comeu pela última vez?", [{ source: "mae", text: "Lanchou há umas duas horas." }], ["comeu", "jejum"])
  ],
  initial: {
    vars: { hr: 152, sbp: 82, dbp: 50, rr: 32, spo2: 96, temp: 36.1, gcs: 14, pain: 8, glucose: 128, perfusion: 0.4, effort: 0.4, hb: 9.6, plt: 260000, inr: 1.1, lactate: 3.9, be: -7, ph: 7.29, hco3: 18 },
    flags: { rhythm: "taquicardia_sinusal", pallor: true, posture: "supino", painVisual: "intensa", speech: "frases", consciousness: "alerta", agitation: true },
    devices: ["colar_cervical"],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Chorosa, pálida, extremidades frias; enchimento capilar 4 s.", { better: [{ when: { ruleFired: "r-choque-grave" }, text: "Sonolenta, gemente, pele moteada; enchimento capilar > 5 s." }, { when: { ruleFired: "r-transfusao" }, text: "Mais corada, enchimento capilar 2–3 s, chora menos." }] }),
    ex("e-via-aerea", "boca", "inspecao", "Via aérea pérvia; chora e fala.", { label: "Via aérea (A)" }),
    ex("e-torax", "torax_anterior", "ausculta", "Murmúrio presente bilateralmente; sem crepitação de arcos costais.", { sound: "murmurio_normal", label: "Tórax (B)" }),
    ex("e-abdome", "abdome_qse", "palpacao", "Escoriação em flanco esquerdo; dor e defesa voluntária em hipocôndrio esquerdo.", { label: "Abdome (C)" }),
    ex("e-pelve", "pelve", "palpacao", "Pelve estável.", { label: "Pelve" }),
    ex("e-femur", "membro_inferior_d", "inspecao", "Deformidade e encurtamento da coxa direita, edema; pulsos distais presentes; pele íntegra.", { label: "Coxa direita", better: [{ when: TALA, text: "Membro imobilizado em tala, alinhado; pulsos distais presentes." }] }),
    ex("e-neuro", "neurologico", "especial", "Glasgow 14 (confusa às perguntas); pupilas isocóricas; move os quatro membros.", { label: "Neurológico (D)" }),
    ex("e-cabeca", "cabeca", "inspecao", "Hematoma frontal pequeno.", { label: "Crânio" })
  ],
  testResults: [
    { testId: "efast", variants: [{ text: "Laudo educativo: líquido livre periesplênico e em pelve em pequena/moderada quantidade; sem derrame pericárdico; deslizamento pleural presente." }] },
    { testId: "tc_abdome", variants: [{ text: "Laudo educativo: laceração esplênica com hematoma (lesão de grau intermediário), sem extravasamento ativo de contraste; hemoperitônio moderado; demais órgãos sem lesão." }] },
    { testId: "tc_cranio", variants: [{ text: "Laudo educativo: sem lesão intracraniana aguda; hematoma subgaleal frontal." }] },
    { testId: "rx_torax", variants: [{ text: "Laudo educativo: sem alterações agudas." }] }
  ],
  highlightedActions: ["monitorizar", "o2_mascara_reservatorio", "acesso_io", "acesso_venoso", "imobilizar_membro", "aquecimento", "solicitar_avaliacao_cirurgica"],
  rules: [
    { id: "r-sangramento", description: "Sangramento esplênico + fratura de fêmur", priority: 10, when: { always: true }, repeat: "once", effects: [trend("sbp", 58, 1600, "hem", 10), trend("dbp", 32, 1600, "hem", 10), trend("hr", 175, 1400, "hem", 10), trend("perfusion", 0.18, 1600, "hem", 10), trend("hb", 6.8, 2200, "hem", 10), trend("lactate", 7, 2200, "hem", 10)] },
    { id: "r-tala", description: "Imobilização do fêmur: menos dor e menos sangramento no foco", priority: 20, when: TALA, repeat: "once", effects: [trend("pain", 5, 300, "tala", 20), trend("hr", 144, 300, "tala", 20), flag("agitation", false)] },
    { id: "r-bolus", description: "Bolus de cristaloide 20 mL/kg: resposta transitória", priority: 25, when: BOLUS, repeat: "once", effects: [trend("sbp", 90, 300, "bolus", 25, 900), trend("hr", 138, 300, "bolus", 25, 900), trend("perfusion", 0.45, 300, "bolus", 25, 900), staff("enfermagem", "Melhorou um pouco… mas está voltando a ficar pálida.")] },
    { id: "r-transfusao", description: "Concentrado de hemácias: estabilização (responde à reposição)", priority: 50, when: SANGUE, repeat: "once", effects: [trend("sbp", 98, 600, "tx", 50), trend("dbp", 58, 600, "tx", 50), trend("hr", 118, 600, "tx", 50), trend("perfusion", 0.65, 600, "tx", 50), trend("hb", 9.2, 900, "tx", 50), trend("lactate", 2.6, 1500, "tx", 50), outcome("estabilizacao_parcial")] },
    { id: "r-excesso", description: "Cristaloide ≥ 60 mL/kg: diluição e hipotermia", priority: 60, when: EXCESSO, repeat: "once", effects: [trend("hb", 5.8, 900, "dil", 60), trend("inr", 1.8, 900, "dil", 60), trend("temp", 34.9, 900, "dil", 60), obs("Cristaloide acima de ~40–60 mL/kg sem hemocomponente: diluição, coagulopatia e hipotermia."), outcome("complicacao")] },
    { id: "r-hipotermia", description: "Criança exposta sem aquecimento", priority: 15, when: { all: [{ time: "gte", seconds: 900 }, { not: { actionCompleted: "aquecimento" } }] }, repeat: "once", effects: [trend("temp", 35.0, 900, "frio", 15)] },
    { id: "r-cirurgia", description: "Cirurgia pediátrica acionada", priority: 30, when: { actionCompleted: "solicitar_avaliacao_cirurgica" }, repeat: "once", effects: [staff("supervisor", "Cirurgião pediátrico: se responder à transfusão, tratamento não operatório na UTI pediátrica com TC de abdome e Hb seriada; se não responder, centro cirúrgico. Ortopedia avalia o fêmur.")] },
    { id: "r-choque-grave", description: "Sem hemocomponente em 25 min: choque descompensado", priority: 30, when: { all: [{ time: "gte", seconds: 1500 }, { not: SANGUE }] }, repeat: "once", effects: [trend("sbp", 52, 300, "grave", 30), trend("gcs", 10, 300, "grave", 30), flag("consciousness", "voz"), flag("speech", "palavras"), staff("enfermagem", "Ela está muito sonolenta, a pressão caiu!"), outcome("piora")] },
    { id: "r-pcr", description: "Sem hemocomponente em 45 min: PCR", priority: 100, when: { all: [{ time: "gte", seconds: 2700 }, { not: SANGUE }] }, repeat: "once", effects: [flag("pulse", false), { type: "setValue", var: "sbp", value: 0 }, { type: "setValue", var: "dbp", value: 0 }, flag("consciousness", "irresponsivo"), staff("enfermagem", "Parou! Sem pulso!"), outcome("parada", true)] },
    { id: "r-banco", description: "Banco de sangue", when: { testCollected: "hemograma" }, repeat: "once", effects: [staff("laboratorio", "Banco de sangue: amostra recebida; hemácias O negativo disponíveis.")] }
  ],
  diagnosis: { primary: "lesao_esplenica_trauma", accepted: ["lesao_esplenica_trauma", "choque_hipovolemico"], differentials: ["fratura_femur", "tce_leve", "fratura_pelve_instavel", "hematoma_epidural"] },
  acceptedDestinations: ["uti", "centro_cirurgico"],
  outcomeNotes: "Escolar de 7 anos, 24 kg, atropelada: choque hemorrágico por lesão esplênica (eFAST positivo) e fratura fechada de fêmur, TCE leve. XABCDE, O₂, acesso IO se venoso difícil, bolus de 20 mL/kg com reavaliação, hemácias (10 mL/kg) se resposta transitória, tala, aquecimento e analgesia; tratamento não operatório na UTI pediátrica se responder, centro cirúrgico se não.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Mecanismo, peso e AMPLE", evidence: { kind: "historyAsked", items: ["h-mecanismo", "h-peso", "h-desmaio"], minCount: 2 }, points: 5, severity: "importante", rationale: "Peso guia todas as doses e volumes." },
    { id: "s-primaria", domain: "historia", description: "Avaliação primária completa", evidence: { kind: "examDone", regions: ["boca", "torax_anterior", "abdome_qse", "pelve", "membro_inferior_d", "neurologico", "geral"], minCount: 5 }, points: 10, severity: "critica", rationale: "XABCDE sistemático.", sourceIds: ["BR-SAMU-SAV"] },
    { id: "s-acesso", domain: "priorizacao", description: "Acesso vascular (IO se necessário) em até 3 min", evidence: { kind: "actionDone", anyOf: ["acesso_io", "acesso_venoso"], withinSeconds: 180 }, points: 8, severity: "critica", rationale: "Criança em choque: IO sem atraso.", sourceIds: ["BR-SAMU-SAV"] },
    { id: "s-o2", domain: "priorizacao", description: "O₂ e monitorização", evidence: { kind: "actionDone", anyOf: ["o2_mascara_reservatorio", "monitorizar"], withinSeconds: 300 }, points: 4, severity: "importante", rationale: "Choque e TCE." },
    { id: "s-bolus", domain: "tratamento", description: "Bolus de cristaloide ~20 mL/kg", evidence: { kind: "drugGiven", anyOf: ["sf09", "ringer_lactato"], withinSeconds: 600 }, points: 6, severity: "importante", rationale: "Alíquota por peso com reavaliação.", sourceIds: ["BR-SAMU-SAV"] },
    { id: "s-sangue", domain: "tratamento", description: "Hemácias após resposta transitória (até 20 min)", evidence: { kind: "drugGiven", anyOf: ["concentrado_hemacias"], withinSeconds: 1200 }, points: 12, severity: "critica", rationale: "Hemorragia persistente: reanimação hemostática.", sourceIds: ["INT-EUR-SANGRAMENTO-2023"] },
    { id: "s-excesso", domain: "tratamento", description: "Falha: cristaloide excessivo", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-excesso" } }, points: 8, penalty: true, severity: "importante", rationale: "Diluição e coagulopatia." },
    { id: "s-tala", domain: "tratamento", description: "Imobilizou o fêmur", evidence: { kind: "actionDone", anyOf: ["imobilizar_membro"], withinSeconds: 1200 }, points: 5, severity: "importante", rationale: "Reduz dor e sangramento do foco." },
    { id: "s-aquecer", domain: "tratamento", description: "Aquecimento", evidence: { kind: "actionDone", anyOf: ["aquecimento"], withinSeconds: 900 }, points: 4, severity: "importante", rationale: "Crianças perdem calor rapidamente." },
    { id: "s-efast", domain: "exames", description: "eFAST na sala", evidence: { kind: "testOrdered", anyOf: ["efast"], withinSeconds: 900 }, points: 6, severity: "importante", rationale: "Localiza sangramento sem tirar da sala.", sourceIds: ["INT-EUR-SANGRAMENTO-2023"] },
    { id: "s-tc-instavel", domain: "exames", description: "TC só após estabilização", evidence: { kind: "stateAtEnd", when: { any: [{ not: { testCollected: "tc_abdome" } }, { ruleFired: "r-transfusao" }] } }, points: 4, severity: "importante", rationale: "Instável não vai à TC." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou após bolus e transfusão", evidence: { kind: "reassessAfter", after: ["sf09", "ringer_lactato", "concentrado_hemacias"], reassess: ["medir_pa", "geral", "hemograma", "gaso_venosa"], withinSeconds: 900 }, points: 8, severity: "importante", rationale: "Classificar a resposta orienta cirurgia vs. não operatório." },
    { id: "s-cirurgia", domain: "destino", description: "Acionou a cirurgia pediátrica", evidence: { kind: "actionDone", anyOf: ["solicitar_avaliacao_cirurgica"], withinSeconds: 1500 }, points: 6, severity: "critica", rationale: "Decisão compartilhada sobre tratamento não operatório." },
    { id: "s-dx", domain: "destino", description: "Lesão esplênica com choque hemorrágico", evidence: { kind: "diagnosis", accepted: ["lesao_esplenica_trauma"] }, points: 4, severity: "importante", rationale: "Dor em hipocôndrio esquerdo, FAST positivo." },
    { id: "s-destino", domain: "destino", description: "UTI pediátrica (responde) ou centro cirúrgico", evidence: { kind: "disposition", accepted: ["uti", "centro_cirurgico"] }, points: 4, severity: "importante", rationale: "Monitorização intensiva com cirurgião disponível." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Ela ainda tem PAS de 82. Isso é normal para 7 anos?" },
      { level: 2, text: "Taquicardia e enchimento capilar lento aparecem antes da hipotensão na criança." },
      { level: 3, text: "Melhorou com o bolus e voltou a piorar: resposta transitória." },
      { level: 4, text: "Sugestão explícita: O₂, monitor, IO, SF 20 mL/kg, eFAST, hemácias 10 mL/kg, tala, aquecer, cirurgia pediátrica, UTI." }
    ],
    summary: "Menina de 7 anos (24 kg) atropelada com lesão esplênica, hemoperitônio, fratura fechada de fêmur direito e TCE leve, em choque com resposta transitória ao cristaloide.",
    pathophysiology: "A criança mantém a PA à custa de taquicardia e vasoconstrição até perder ~30% da volemia; a hipotensão é sinal tardio. Baço e fêmur podem sequestrar volume importante para o tamanho dela. A maioria das lesões esplênicas pediátricas em quem responde à reposição é tratada sem cirurgia, com monitorização e cirurgião disponível.",
    keyPoints: [
      "PAS mínima aproximada: 70 + 2 × idade (anos); taquicardia e enchimento capilar são mais precoces.",
      "IO após falha rápida de acesso venoso.",
      "Bolus de 10–20 mL/kg com reavaliação; resposta transitória → hemácias 10 mL/kg.",
      "Evitar cristaloide excessivo; aquecer.",
      "Responde → não operatório na UTI; não responde → centro cirúrgico."
    ],
    alternatives: ["Ácido tranexâmico em pediatria é usado em alguns protocolos (sem regra de dose pediátrica no catálogo).", "Tração cutânea/tala de tração para o fêmur (não diferenciada no simulador)."],
    oralRubric: [
      { id: "o1", concept: "Sinais de choque na criança", synonyms: ["taquicardia", "enchimento capilar", "70 + 2"], weight: 2 },
      { id: "o2", concept: "Acesso intraósseo", synonyms: ["intraósseo", "io"], weight: 2 },
      { id: "o3", concept: "Volumes por peso", synonyms: ["20 ml/kg", "10 ml/kg", "peso"], weight: 2 },
      { id: "o4", concept: "Tratamento não operatório", synonyms: ["não operatório", "conservador", "uti"], weight: 2 }
    ],
    simplifications: ["Concentrado de hemácias pediátrico sem regra de dose validada no catálogo (o app alerta).", "Resposta à transfusão é determinística.", "PCR aos 45 min sem hemocomponente é decisão didática."]
  },
  references: ["BR-SAMU-SAV", "INT-EUR-SANGRAMENTO-2023", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 3, allowSexSwap: true, allowWeightPercent: 10, allowVisualVariation: true, forbidden: ["idade < 4 ou > 10 anos sem recalcular volumes"] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "XABCDE, IO, bolus 20 mL/kg, eFAST, hemácias 10 mL/kg, tala, aquecer, cirurgia, UTI", commands: [act(5, "monitorizar"), act(15, "o2_mascara_reservatorio", { fluxo: 10 }), ask(25, "h-mecanismo"), ask(35, "h-peso"), { atSeconds: 45, type: "examine", payload: { region: "boca", maneuver: "inspecao" } }, { atSeconds: 55, type: "examine", payload: { region: "torax_anterior", maneuver: "ausculta" } }, { atSeconds: 65, type: "examine", payload: { region: "geral", maneuver: "inspecao" } }, act(75, "acesso_io"), { atSeconds: 120, type: "examine", payload: { region: "abdome_qse", maneuver: "palpacao" } }, { atSeconds: 130, type: "examine", payload: { region: "pelve", maneuver: "palpacao" } }, { atSeconds: 140, type: "examine", payload: { region: "membro_inferior_d", maneuver: "inspecao" } }, { atSeconds: 150, type: "examine", payload: { region: "neurologico", maneuver: "especial" } }, rx(160, "sf09", "bolsa500", 20, "mL/kg", "IO", "infusao_volume", { durationMinutes: 10 }), test(180, "efast"), test(200, "hemograma"), act(260, "imobilizar_membro"), act(330, "aquecimento"), { atSeconds: 800, type: "examine", payload: { region: "geral", maneuver: "inspecao" } }, rx(820, "concentrado_hemacias", "unidade", 10, "mL/kg", "IO", "infusao_volume", { durationMinutes: 20 }), act(850, "solicitar_avaliacao_cirurgica"), act(1600, "medir_pa"), dx(1700, "lesao_esplenica_trauma"), dest(1800, "uti")], runUntilSeconds: 2400, expect: [{ condition: { ruleFired: "r-transfusao" }, description: "responde à transfusão" }, { condition: { not: { ruleFired: "r-choque-grave" } }, description: "sem choque descompensado" }, { condition: { not: { ruleFired: "r-excesso" } }, description: "sem excesso de cristaloide" }, { condition: { path: "vars.sbp", op: "gte", value: 85 }, description: "PAS adequada" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 2800, expect: [{ condition: { ruleFired: "r-choque-grave" }, description: "choque descompensado" }, { condition: { ruleFired: "r-pcr" }, description: "PCR" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Só cristaloide repetido (> 60 mL/kg), sem sangue", commands: [act(30, "acesso_io"), rx(100, "sf09", "bolsa500", 20, "mL/kg", "IO", "infusao_volume", { durationMinutes: 10 }), rx(800, "sf09", "bolsa500", 20, "mL/kg", "IO", "infusao_volume", { durationMinutes: 10 }), rx(1500, "sf09", "bolsa500", 20, "mL/kg", "IO", "infusao_volume", { durationMinutes: 10 })], runUntilSeconds: 2400, expect: [{ condition: { ruleFired: "r-excesso" }, description: "diluição" }, { condition: { ruleFired: "r-choque-grave" }, description: "choque descompensado" }] },
    { id: "t-atraso", kind: "delay", description: "Acesso e hemácias tardios (30 min)", commands: [act(600, "acesso_io"), rx(700, "sf09", "bolsa500", 20, "mL/kg", "IO", "infusao_volume", { durationMinutes: 10 }), rx(1800, "concentrado_hemacias", "unidade", 10, "mL/kg", "IO", "infusao_volume", { durationMinutes: 20 })], runUntilSeconds: 3200, expect: [{ condition: { ruleFired: "r-choque-grave" }, description: "piora pelo atraso" }, { condition: { ruleFired: "r-transfusao" }, description: "estabilização tardia" }, { condition: { not: { ruleFired: "r-pcr" } }, description: "PCR evitada" }] },
    { id: "t-alternativa", kind: "alternative", description: "Acesso venoso periférico, Ringer 20 mL/kg, hemácias e centro cirúrgico", commands: [act(20, "acesso_venoso"), act(120, "acesso_venoso"), rx(240, "ringer_lactato", "bolsa500", 20, "mL/kg", "IV", "infusao_volume", { durationMinutes: 10 }), test(260, "efast"), act(300, "imobilizar_membro"), rx(700, "concentrado_hemacias", "unidade", 10, "mL/kg", "IV", "infusao_volume", { durationMinutes: 20 }), act(750, "solicitar_avaliacao_cirurgica"), dest(1500, "centro_cirurgico")], runUntilSeconds: 2000, expect: [{ condition: { ruleFired: "r-bolus" }, description: "resposta transitória ao bolus" }, { condition: { ruleFired: "r-transfusao" }, description: "responde à transfusão" }] }
  ]
};
