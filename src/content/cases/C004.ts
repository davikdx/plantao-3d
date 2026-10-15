import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, obs, outcome, oxygenResponse, rx, staff, trend } from "./helpers";

const ADR_IM = { drugGiven: "adrenalina", route: "IM", minTotal: { value: 0.3, unit: "mg" as const } };
const FLUIDO_500 = { any: [{ drugGiven: "sf09", minTotal: { value: 500, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 500, unit: "mL" as const } }] };
const FLUIDO_1000 = { any: [{ drugGiven: "sf09", minTotal: { value: 1000, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 1000, unit: "mL" as const } }] };

export const C004: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C004",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Mal-estar súbito na sala de medicação",
  teachingTitle: "Anafilaxia após medicamento parenteral",
  group: "Reanimação, instabilidade e choque",
  specialties: ["Emergência", "Alergia"],
  environment: "emergencia",
  resourceProfile: "upa-porte-ii",
  difficulty: 2,
  level: "internato",
  objectives: [
    "Reconhecer anafilaxia por critérios clínicos sem esperar exames",
    "Priorizar adrenalina intramuscular na dose correta",
    "Tratar hipotensão com volume e reavaliar",
    "Diferenciar tratamentos adjuvantes de tratamento de primeira linha",
    "Definir observação e orientações de segurança"
  ],
  keywords: ["urticária", "prurido", "falta de ar", "hipotensão", "medicamento", "alergia"],
  patient: {
    name: "Juliana Ferreira",
    ageYears: 34,
    sex: "feminino",
    weightKg: 62,
    heightCm: 163,
    visual: { ageGroup: "adulto", sex: "feminino", skinTone: 5, hairStyle: "cacheado", hairColor: "preto", build: "medio", pregnancyTrimester: 0 }
  },
  briefing:
    "UPA 24h, sala de medicação. A técnica de enfermagem chama você: paciente de 34 anos recebeu medicação intravenosa para cefaleia há cerca de 10 minutos e agora refere coceira, falta de ar e tontura. Foi trazida para a sala vermelha na maca.",
  communication: "limitada",
  informants: [{ id: "tecnica", name: "Técnica de enfermagem Rosa", role: "Equipe da sala de medicação" }],
  history: [
    h("h-queixa", "queixa", "O que a senhora está sentindo?", "Tô com uma coceira no corpo todo… e o ar não entra direito. A garganta tá apertando.", { keywords: ["sentindo", "sente", "queixa"] }),
    h("h-inicio", "inicio", "Quando começou?", "Uns dez minutos depois que botaram o remédio na veia.", {
      extra: [{ source: "tecnica", text: "Administrei dipirona 1 g IV às 14h20, prescrita para cefaleia. Ela começou a se coçar e ficou vermelha alguns minutos depois." }]
    }),
    h("h-evolucao", "evolucao", "Está piorando?", "Tá piorando… fico tonta quando levanto a cabeça."),
    h("h-alergias", "alergias", "Tem alergia a algum medicamento?", "Uma vez, faz anos, tomei dipirona e fiquei com umas manchas que coçavam. Achei que não era nada e não falei.", { keywords: ["alergia", "alérgica", "reação"] }),
    h("h-medicacoes", "medicacoes", "Usa algum remédio?", "Só o anticoncepcional. Não tomo remédio de pressão.", { keywords: ["remédio", "medicação", "betabloqueador", "usa"] }),
    h("h-antecedentes", "antecedentes", "Tem alguma doença?", "Tenho rinite. Asma nunca tive.", { keywords: ["doença", "asma", "problema"] }),
    h("h-associados", "fatores_associados", "Sente mais alguma coisa? Náusea, dor na barriga?", "Tô enjoada e com cólica… e a voz tá ficando rouca.", { keywords: ["náusea", "vômito", "barriga", "rouca"] }),
    h("h-gestacao", "gestacao", "Existe possibilidade de gravidez?", "Não, uso anticoncepcional certinho e menstruei semana passada."),
    h("h-alimentos", "exposicao", "Comeu algo diferente ou foi picada por inseto hoje?", "Não, só almocei arroz, feijão e frango, como sempre."),
    h("h-habitos", "habitos", "Fuma, bebe?", "Não fumo. Bebo só em festa.")
  ],
  initial: {
    vars: { hr: 128, sbp: 78, dbp: 44, rr: 28, spo2: 90, temp: 36.6, gcs: 15, pain: 3, glucose: 104, perfusion: 0.45, effort: 2, etco2: 32, lactate: 3.4, ph: 7.33, pco2: 33, hco3: 19, be: -5, po2: 62, k: 3.9, na: 138, hb: 13.1, ht: 39, wbc: 9800, plt: 260000, creat: 0.8, urea: 26, trop: 4 },
    flags: { rhythm: "taquicardia_sinusal", urticaria: true, angioedema: true, wheeze: true, sweating: true, speech: "palavras", painVisual: "moderada", posture: "supino" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Ansiosa, sudoreica, com placas urticariformes difusas no tronco e membros; fala frases curtas.", {
      better: [{ when: { ruleFired: "r-adr-resposta" }, text: "Mais tranquila, ainda com placas urticariformes esmaecendo; fala frases completas." }]
    }),
    ex("e-boca", "boca", "inspecao", "Edema de lábios e úvula discreto; voz rouca. Sem estridor em repouso.", {
      better: [{ when: { ruleFired: "r-adr-resposta" }, text: "Edema labial em regressão; voz menos rouca." }]
    }),
    ex("e-pescoco", "pescoco", "ausculta", "Sem estridor audível.", {}),
    ex("e-torax-insp", "torax_anterior", "inspecao", "Taquipneia com uso de musculatura acessória.", { better: [{ when: { ruleFired: "r-adr-resposta" }, text: "Respiração menos trabalhosa, sem tiragem." }] }),
    ex("e-torax-ausc", "torax_anterior", "ausculta", "Sibilos expiratórios difusos bilaterais, murmúrio presente.", {
      sound: "sibilos",
      better: [{ when: { any: [{ ruleFired: "r-broncoespasmo-resolve" }, { ruleFired: "r-salbutamol" }] }, text: "Murmúrio vesicular presente, raros sibilos expiratórios." }]
    }),
    ex("e-torax-post", "torax_posterior", "ausculta", "Sibilos difusos bilaterais.", { sound: "sibilos", better: [{ when: { ruleFired: "r-broncoespasmo-resolve" }, text: "Raros sibilos." }] }),
    ex("e-coracao", "coracao", "ausculta", "Bulhas taquicárdicas, normofonéticas, sem sopros.", { sound: "bulhas_normais" }),
    ex("e-perfusao", "membro_superior_d", "palpacao", "Pulso radial fino e rápido; extremidades frias; tempo de enchimento capilar 4 s.", {
      better: [{ when: { path: "vars.sbp", op: "gte", value: 95 }, text: "Pulso radial cheio; extremidades aquecidas; tempo de enchimento capilar 2 s." }]
    }),
    ex("e-pele", "pele", "inspecao", "Urticária generalizada com eritema; sem lesões bolhosas ou descolamento.", {}),
    ex("e-abdome", "abdome_epigastrio", "palpacao", "Abdome flácido, levemente doloroso difusamente, sem defesa.", {}),
    ex("e-neuro", "neurologico", "especial", "Alerta, orientada, pupilas isocóricas e fotorreagentes, sem déficit focal.", {
      better: [{ when: { path: "flags.consciousness", op: "neq", value: "alerta" }, text: "Sonolenta, responde ao chamado com confusão; sem déficit focal." }]
    })
  ],
  testResults: [
    { testId: "ecg12", variants: [{ text: "Taquicardia sinusal; sem alterações isquêmicas agudas.", ecg: { rhythm: "taquicardia_sinusal", rate: 128, stElevationLeads: [], stDepressionLeads: [], peakedT: false, wideQrs: false } }] },
    { testId: "rx_torax", variants: [{ text: "Laudo educativo: campos pulmonares sem consolidações; área cardíaca normal. Exame não é necessário para o diagnóstico de anafilaxia." }] }
  ],
  highlightedActions: ["monitorizar", "o2_mascara_reservatorio", "acesso_venoso", "elevar_mmii", "chamar_ajuda"],
  rules: [
    oxygenResponse(95, 60, { not: { path: "flags.airway", op: "eq", value: "obstruida" } }),
    {
      id: "r-evolucao-sem-adrenalina",
      description: "Sem adrenalina, choque e broncoespasmo progridem",
      priority: 5,
      when: { all: [{ time: "gte", seconds: 180 }, { not: ADR_IM }] },
      repeat: "once",
      effects: [trend("sbp", 62, 240, "doenca", 10), trend("dbp", 34, 240, "doenca", 10), trend("hr", 142, 200, "doenca", 10), trend("spo2", 84, 240, "doenca", 10), trend("perfusion", 0.25, 240, "doenca", 10), trend("effort", 2.7, 240, "doenca", 10), trend("lactate", 5.2, 400, "doenca", 10)]
    },
    {
      id: "r-rebaixamento",
      description: "Hipoperfusão cerebral leva a rebaixamento",
      when: { path: "vars.sbp", op: "lt", value: 66 },
      repeat: "once",
      effects: [flag("consciousness", "voz"), flag("speech", "palavras"), { type: "setValue", var: "gcs", value: 13 }, { type: "changeCommunication", state: "limitada" }, staff("enfermagem", "Doutor(a), ela está ficando sonolenta e a pressão não está boa!"), outcome("piora")]
    },
    {
      id: "r-pcr",
      description: "Sem adrenalina por tempo prolongado, evolui para parada (desfecho definido pelo caso)",
      priority: 100,
      when: { all: [{ time: "gte", seconds: 900 }, { not: { drugGiven: "adrenalina" } }] },
      repeat: "once",
      effects: [flag("pulse", false), flag("rhythm", "sinusal"), flag("consciousness", "irresponsivo"), { type: "setValue", var: "rr", value: 0 }, staff("enfermagem", "Ela não responde e não sinto pulso!"), outcome("parada", true)]
    },
    {
      id: "r-adr-resposta",
      description: "Adrenalina IM: melhora de perfusão, broncoespasmo e edema (parcial sem volume)",
      priority: 60,
      when: ADR_IM,
      repeat: "once",
      effects: [trend("sbp", 94, 150, "adr", 50), trend("dbp", 56, 150, "adr", 50), trend("hr", 112, 150, "adr", 50), trend("perfusion", 0.7, 200, "adr", 50), trend("effort", 1.2, 200, "adr", 50), trend("rr", 22, 200, "adr", 50), trend("spo2", 93, 200, "adr", 20), flag("speech", "frases"), flag("painVisual", "leve"), outcome("estabilizacao_parcial")]
    },
    {
      id: "r-broncoespasmo-resolve",
      description: "Broncoespasmo melhora alguns minutos após adrenalina",
      when: { elapsedSince: "rule:r-adr-resposta", op: "gte", seconds: 300 },
      repeat: "once",
      effects: [flag("wheeze", false), flag("angioedema", false), trend("effort", 0.6, 200, "adr2", 55)]
    },
    {
      id: "r-volume-adr",
      description: "Volume após adrenalina restaura a pressão",
      priority: 61,
      when: { all: [ADR_IM, FLUIDO_1000] },
      repeat: "once",
      effects: [trend("sbp", 112, 200, "vol", 60), trend("dbp", 68, 200, "vol", 60), trend("hr", 96, 300, "vol", 60), trend("perfusion", 0.95, 300, "vol", 60), trend("lactate", 1.8, 900, "vol", 60), flag("sweating", false), outcome("melhora")]
    },
    {
      id: "r-volume-sem-adr",
      description: "Volume sem adrenalina: ganho pressórico pequeno e transitório (não trata a anafilaxia)",
      priority: 30,
      when: { all: [FLUIDO_500, { not: ADR_IM }] },
      repeat: "once",
      effects: [trend("sbp", 74, 120, "vol-isolado", 20, 300)]
    },
    {
      id: "r-segunda-adrenalina",
      description: "Segunda dose IM melhora resposta quando a primeira foi insuficiente",
      priority: 62,
      when: { drugGiven: "adrenalina", route: "IM", minTotal: { value: 0.6, unit: "mg" } },
      repeat: "once",
      effects: [trend("sbp", 104, 150, "adr2b", 55), trend("perfusion", 0.85, 200, "adr2b", 55)]
    },
    {
      id: "r-adr-iv-bolus",
      description: "Adrenalina IV em bolus (dose de PCR) em paciente com pulso: taquiarritmia e crise hipertensiva",
      priority: 90,
      when: { drugGiven: "adrenalina", route: "IV", minTotal: { value: 0.5, unit: "mg" } },
      repeat: "once",
      effects: [
        flag("rhythm", "tv"),
        trend("hr", 178, 10, "iatro", 95, 240),
        trend("sbp", 205, 15, "iatro", 95, 240),
        trend("dbp", 120, 15, "iatro", 95, 240),
        flag("painVisual", "intensa"),
        staff("paciente", "Meu coração tá disparando… dor forte no peito!"),
        { type: "scheduleEffects", afterSeconds: 240, key: "iatro-fim", effects: [flag("rhythm", "taquicardia_sinusal"), flag("painVisual", "moderada")] },
        outcome("complicacao")
      ]
    },
    {
      id: "r-salbutamol",
      description: "Broncodilatador ajuda broncoespasmo residual (adjuvante)",
      when: { drugGiven: "salbutamol" },
      repeat: "once",
      effects: [trend("effort", 0.8, 300, "sal", 40, 1800)]
    },
    {
      id: "r-elevar-mmii",
      description: "Posição supina com MMII elevados reduz piora ortostática (efeito pequeno)",
      when: { actionCompleted: "elevar_mmii" },
      repeat: "once",
      effects: [obs("Paciente mantida em decúbito dorsal com membros inferiores elevados; refere menos tontura.")]
    },
    {
      id: "r-adjuvante-isolado",
      description: "Anti-histamínico/corticoide não revertem choque nem broncoespasmo",
      when: { all: [{ any: [{ drugGiven: "prometazina" }, { drugGiven: "hidrocortisona" }, { drugGiven: "metilprednisolona" }] }, { not: { drugGiven: "adrenalina" } }] },
      repeat: "once",
      effects: [obs("Após o adjuvante, o prurido incomoda um pouco menos, mas a falta de ar e a tontura persistem.")]
    }
  ],
  diagnosis: { primary: "anafilaxia", accepted: ["anafilaxia"], differentials: ["urticaria_aguda", "asma_grave", "angioedema_bradicinina", "choque_septico", "crise_ansiedade"] },
  acceptedDestinations: ["observacao", "transferencia_regulada"],
  outcomeNotes: "Com adrenalina IM precoce e volume, há melhora em minutos. Sem adrenalina, o caso evolui para choque refratário e parada (desfecho definido pelo autor para fins didáticos). Adrenalina IV em bolus em paciente com pulso gera complicação cardiovascular.",
  scoring: [
    { id: "s-hist-exposicao", domain: "historia", description: "Identificou exposição recente e alergia prévia", evidence: { kind: "historyAsked", items: ["h-inicio", "h-alergias", "h-medicacoes"], minCount: 2 }, points: 10, severity: "importante", rationale: "Exposição a desencadeante provável + envolvimento de pele/mucosa + respiratório/hemodinâmico sustentam o diagnóstico clínico.", sourceIds: ["INT-WAO-ANAFILAXIA"] },
    { id: "s-hist-diferenciais", domain: "historia", description: "Explorou sintomas associados e possibilidade de gestação", evidence: { kind: "historyAsked", items: ["h-associados", "h-gestacao", "h-antecedentes"], minCount: 2 }, points: 5, severity: "menor", rationale: "Sintomas gastrointestinais e comorbidades ajudam a definir gravidade e diferenciais." },
    { id: "s-exame-via-aerea", domain: "historia", description: "Avaliou via aérea, ausculta pulmonar e perfusão", evidence: { kind: "examDone", regions: ["boca", "torax_anterior", "membro_superior_d", "pescoco", "pele"], minCount: 3 }, points: 10, severity: "importante", rationale: "Edema de via aérea, broncoespasmo e hipoperfusão definem gravidade." },
    { id: "s-adrenalina-precoce", domain: "priorizacao", description: "Adrenalina IM nos primeiros 5 minutos", evidence: { kind: "drugGiven", anyOf: ["adrenalina"], routes: ["IM"], withinSeconds: 300 }, points: 20, severity: "critica", rationale: "Adrenalina IM é o tratamento de primeira linha da anafilaxia; atraso associa-se a pior desfecho.", alternatives: "Não há substituto: anti-histamínico e corticoide são adjuvantes.", sourceIds: ["INT-WAO-ANAFILAXIA"] },
    { id: "s-monitor", domain: "priorizacao", description: "Monitorização em até 3 minutos", evidence: { kind: "actionDone", anyOf: ["monitorizar"], withinSeconds: 180 }, points: 8, severity: "importante", rationale: "Paciente instável exige monitorização contínua." },
    { id: "s-o2", domain: "priorizacao", description: "Oxigênio suplementar para SpO₂ baixa", evidence: { kind: "actionDone", anyOf: ["o2_mascara_reservatorio", "o2_cateter"], withinSeconds: 300 }, points: 6, severity: "importante", rationale: "Hipoxemia com desconforto respiratório." },
    { id: "s-dose-adrenalina", domain: "tratamento", description: "Dose de adrenalina IM adequada (0,3–0,5 mg no adulto)", evidence: { kind: "drugGiven", anyOf: ["adrenalina"], routes: ["IM"], minTotal: { value: 0.3, unit: "mg" }, maxTotal: { value: 1.0, unit: "mg" } }, points: 15, severity: "critica", rationale: "0,01 mg/kg até 0,5 mg; pode repetir a cada 5–15 min conforme resposta.", sourceIds: ["INT-WAO-ANAFILAXIA"] },
    { id: "s-volume", domain: "tratamento", description: "Expansão volêmica com cristaloide para hipotensão", evidence: { kind: "drugGiven", anyOf: ["sf09", "ringer_lactato"], minTotal: { value: 500, unit: "mL" } }, points: 10, severity: "importante", rationale: "Anafilaxia com hipotensão cursa com extravasamento capilar importante.", alternatives: "SF 0,9% ou Ringer lactato são aceitos." },
    { id: "s-acesso", domain: "tratamento", description: "Acesso venoso calibroso", evidence: { kind: "actionDone", anyOf: ["acesso_venoso", "acesso_io"] }, points: 5, severity: "importante", rationale: "Necessário para volume e eventual infusão." },
    { id: "s-seguranca-adr-iv", domain: "tratamento", description: "Falha de segurança: adrenalina IV em bolus (dose de PCR) com pulso presente", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-adr-iv-bolus" } }, points: 15, penalty: true, severity: "critica", rationale: "Bolus IV de 1 mg é dose de parada; em paciente com pulso causa arritmias, isquemia e crise hipertensiva. Infusão IV titulada só em ambiente monitorizado e se refratária ao IM.", sourceIds: ["INT-WAO-ANAFILAXIA"] },
    { id: "s-exames", domain: "exames", description: "Não atrasar tratamento por exames desnecessários", evidence: { kind: "testsNotExcessive", maxUnjustified: 1, justified: ["ecg12", "gaso_venosa", "gaso_arterial"] }, points: 15, severity: "menor", rationale: "Anafilaxia é diagnóstico clínico; exames não devem retardar a adrenalina." },
    { id: "s-reavaliacao", domain: "reavaliacao", description: "Reavaliou após adrenalina (PA/monitor/ausculta) em até 5 minutos", evidence: { kind: "reassessAfter", after: ["adrenalina"], reassess: ["monitorizacao_continua", "medir_pa", "torax_anterior", "boca"], withinSeconds: 300 }, points: 10, severity: "importante", rationale: "A necessidade de nova dose depende da resposta." },
    { id: "s-diagnostico", domain: "destino", description: "Diagnóstico final de anafilaxia", evidence: { kind: "diagnosis", accepted: ["anafilaxia"] }, points: 5, severity: "importante", rationale: "Pele/mucosa + respiratório + hipotensão após exposição." },
    { id: "s-destino", domain: "destino", description: "Observação prolongada na unidade (ou transferência se refratária)", evidence: { kind: "disposition", accepted: ["observacao", "transferencia_regulada"] }, points: 5, severity: "importante", rationale: "Risco de reação bifásica e necessidade de reavaliação; alta imediata é insegura.", alternatives: "Transferência regulada aceita se refratária a doses repetidas." },
    { id: "s-orientacao", domain: "destino", description: "Orientou sinais de alarme e registro da alergia", evidence: { kind: "actionDone", anyOf: ["orientacoes_alta"] }, points: 3, severity: "menor", rationale: "Registrar alergia a dipirona e orientar evitar o fármaco." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Quais sistemas estão envolvidos e há quanto tempo foi a exposição?" },
      { level: 2, text: "Reavalie via aérea, respiração e circulação: há sinais de choque?" },
      { level: 3, text: "Pense no mecanismo: liberação maciça de mediadores com vasodilatação e extravasamento capilar." },
      { level: 4, text: "Sugestão explícita: adrenalina IM na face anterolateral da coxa, monitorização, O₂ e volume." }
    ],
    summary: "Mulher de 34 anos com urticária, angioedema, broncoespasmo e hipotensão minutos após dipirona IV, com história prévia de reação cutânea ao mesmo fármaco.",
    pathophysiology: "Reação de hipersensibilidade sistêmica com liberação de histamina, triptase e leucotrienos: vasodilatação, aumento da permeabilidade capilar (até grande parte do volume plasmático extravasa), broncoconstrição e edema de mucosas. A adrenalina age em receptores α1 (vasoconstrição, reduz edema), β1 (inotropismo) e β2 (broncodilatação, estabiliza mastócitos).",
    keyPoints: [
      "Anafilaxia é diagnóstico clínico; não espere exames.",
      "Adrenalina IM 0,01 mg/kg (máximo 0,5 mg no adulto), repetir em 5–15 min se necessário.",
      "Anti-histamínicos e corticoides são adjuvantes e não substituem a adrenalina.",
      "Hipotensão exige volume generoso com reavaliação.",
      "Adrenalina IV em bolus de 1 mg é dose de PCR, perigosa com pulso presente."
    ],
    alternatives: ["SF 0,9% ou Ringer lactato para volume.", "Salbutamol para broncoespasmo residual após adrenalina."],
    oralRubric: [
      { id: "o1", concept: "Reconhecimento clínico de anafilaxia", synonyms: ["anafilaxia", "anafilático", "reação anafilática"], weight: 2 },
      { id: "o2", concept: "Adrenalina intramuscular como prioridade", synonyms: ["adrenalina", "epinefrina", "intramuscular", "im"], weight: 3 },
      { id: "o3", concept: "Volume para hipotensão", synonyms: ["volume", "soro", "cristaloide", "expansão"], weight: 2 },
      { id: "o4", concept: "Adjuvantes não substituem adrenalina", synonyms: ["adjuvante", "anti-histamínico", "corticoide"], weight: 1 },
      { id: "o5", concept: "Observação por risco bifásico", synonyms: ["bifásica", "observação", "observar"], weight: 1 }
    ],
    simplifications: [
      "Tempos de resposta e magnitudes são parâmetros de simulação, não dados de estudos.",
      "Parada cardiorrespiratória aos 15 minutos sem adrenalina é decisão didática do autor."
    ]
  },
  references: ["INT-WAO-ANAFILAXIA", "BR-SAMU-SAV", "BR-UPA", "AUTOR-SIMPLIFICACAO"],
  tests: [
    {
      id: "t-aceitavel",
      kind: "acceptable",
      description: "Monitoriza, O₂, adrenalina IM 0,5 mg, acesso e 1000 mL de SF",
      commands: [act(5, "monitorizar"), act(10, "o2_mascara_reservatorio", { fluxo: 15 }), rx(20, "adrenalina", "amp1mg", 0.5, "mg", "IM"), act(30, "acesso_venoso"), rx(150, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 20 }), ask(200, "h-alergias"), dx(1500, "anafilaxia"), dest(1500, "observacao")],
      runUntilSeconds: 1600,
      expect: [
        { condition: { path: "vars.sbp", op: "gte", value: 100 }, description: "PAS ≥ 100 mmHg ao final" },
        { condition: { not: { path: "flags.pulse", op: "eq", value: false } }, description: "sem parada" },
        { condition: { ruleFired: "r-volume-adr" }, description: "resposta ao volume após adrenalina" }
      ]
    },
    {
      id: "t-sem-intervencao",
      kind: "no_intervention",
      description: "Nenhuma conduta: evolução para parada aos 15 min",
      commands: [],
      runUntilSeconds: 1000,
      expect: [{ condition: { ruleFired: "r-pcr" }, description: "parada definida pelo caso" }, { condition: { path: "flags.pulse", op: "eq", value: false }, description: "sem pulso" }]
    },
    {
      id: "t-inadequada",
      kind: "inadequate",
      description: "Adrenalina 1 mg IV em bolus com pulso presente",
      commands: [act(5, "acesso_venoso"), rx(120, "adrenalina", "amp1mg", 1, "mg", "IV")],
      runUntilSeconds: 300,
      expect: [{ condition: { ruleFired: "r-adr-iv-bolus" }, description: "complicação iatrogênica" }, { condition: { path: "flags.rhythm", op: "eq", value: "tv" }, description: "taquiarritmia" }]
    },
    {
      id: "t-atraso",
      kind: "delay",
      description: "Somente anti-histamínico inicialmente; adrenalina IM aos 10 minutos",
      commands: [rx(30, "prometazina", "amp25", 25, "mg", "IM"), rx(600, "adrenalina", "amp1mg", 0.5, "mg", "IM")],
      runUntilSeconds: 1400,
      expect: [
        { condition: { ruleFired: "r-evolucao-sem-adrenalina" }, description: "houve deterioração antes da adrenalina" },
        { condition: { not: { ruleFired: "r-pcr" } }, description: "sem parada" },
        { condition: { path: "vars.sbp", op: "lt", value: 100 }, description: "sem volume, PA ainda não normalizada" }
      ]
    },
    {
      id: "t-alternativa",
      kind: "alternative",
      description: "Ringer lactato em vez de SF 0,9%",
      commands: [act(5, "monitorizar"), rx(20, "adrenalina", "amp1mg", 0.5, "mg", "IM"), act(30, "acesso_venoso"), rx(150, "ringer_lactato", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 20 })],
      runUntilSeconds: 1600,
      expect: [{ condition: { ruleFired: "r-volume-adr" }, description: "mesma resposta" }]
    }
  ]
};
