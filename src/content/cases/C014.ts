import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const MP = { actionCompleted: "marcapasso_transcutaneo" };
const ADR_INF = { treatmentActive: "adrenalina" };
const SUPORTE = { any: [MP, ADR_INF] };

export const C014: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C014",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Idosa que desmaiou duas vezes hoje e está com o pulso lento",
  teachingTitle: "Bloqueio atrioventricular total com síncope e hipoperfusão — atropina, marca-passo transcutâneo e cronotrópico",
  group: "Cardiologia",
  specialties: ["Cardiologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Reconhecer bradicardia com sinais de hipoperfusão",
    "Identificar BAV total no ECG",
    "Usar atropina sabendo de sua limitação no bloqueio infranodal",
    "Instalar marca-passo transcutâneo com analgesia/sedação ou iniciar cronotrópico",
    "Pesquisar causas reversíveis (fármacos, potássio, isquemia) e programar marca-passo definitivo"
  ],
  keywords: ["desmaio", "pulso lento", "tontura", "fraqueza", "síncope"],
  patient: {
    name: "Terezinha Almeida",
    ageYears: 79,
    sex: "feminino",
    weightKg: 58,
    heightCm: 152,
    visual: { ageGroup: "idoso", sex: "feminino", skinTone: 1, hairStyle: "coque", hairColor: "branco", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Senhora de 79 anos trazida pela filha após dois desmaios hoje; está pálida, sonolenta e com pulso muito lento.",
  communication: "limitada",
  informants: [{ id: "filha", name: "Lúcia", role: "Filha" }],
  history: [
    h("h-queixa", "queixa", "Como a senhora está?", "Fraca… tonta…", { keywords: ["como", "sente"] }),
    hi("h-sincope", "inicio", "Como foram os desmaios?", [{ source: "filha", text: "Ela apagou de repente, sem aviso, duas vezes, e acordou em segundos. Sem convulsão." }], ["desmaio", "como foram"]),
    hi("h-medicacoes", "medicacoes", "Que remédios ela toma? Mudou algum?", [{ source: "filha", text: "Losartana e hidroclorotiazida. Não usa remédio para o coração, nem digoxina, nem betabloqueador." }], ["remédio", "digoxina", "betabloqueador"]),
    hi("h-dor", "fatores_associados", "Teve dor no peito ou falta de ar?", [{ source: "filha", text: "Não reclamou de dor no peito." }], ["dor", "peito", "falta de ar"]),
    hi("h-rim", "antecedentes", "Tem problema nos rins ou diabetes?", [{ source: "filha", text: "Rim normal, que eu saiba. Não é diabética." }], ["rim", "diabetes"]),
    hi("h-alergias", "alergias", "Tem alergia?", [{ source: "filha", text: "Não." }])
  ],
  initial: {
    vars: { hr: 32, sbp: 78, dbp: 42, rr: 18, spo2: 94, temp: 36.2, gcs: 13, pain: 0, glucose: 112, perfusion: 0.35, effort: 0.3, k: 4.4, na: 137, creat: 1.0, trop: 18, lactate: 3.0 },
    flags: { rhythm: "bav_total", pallor: true, posture: "supino", painVisual: "nenhuma", speech: "palavras", consciousness: "voz", communication: "limitada" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Pálida, sonolenta, extremidades frias.", { better: [{ when: SUPORTE, text: "Mais desperta; extremidades mais quentes." }] }),
    ex("e-pulso", "membro_superior_d", "palpacao", "Pulso radial regular, cheio, 32 bpm.", { label: "Pulso" }),
    ex("e-jugular", "pescoco", "inspecao", "Ondas em canhão intermitentes no pulso venoso jugular.", { label: "Jugulares" }),
    ex("e-cabeca", "cabeca", "inspecao", "Pequeno hematoma frontal da queda.", {})
  ],
  testResults: [
    { testId: "ecg12", variants: [{ text: "Dissociação AV completa: ondas P a 80 bpm sem relação com QRS; escape com QRS largo a 32 bpm. BAV total com escape ventricular (provável bloqueio infranodal).", ecg: { rhythm: "bav_total", rate: 32, stElevationLeads: [], stDepressionLeads: [], peakedT: false, wideQrs: true } }] }
  ],
  highlightedActions: ["monitorizar", "pas_desfibrilador", "acesso_venoso", "marcapasso_transcutaneo"],
  rules: [
    { id: "r-atropina", description: "Atropina: resposta mínima no bloqueio infranodal", when: { drugGiven: "atropina" }, repeat: "once", effects: [trend("hr", 36, 60, "atr", 30, 600), obs("Atropina: frequência subiu de 32 para 36 bpm. Bloqueio com escape de QRS largo responde pouco à atropina.")] },
    { id: "r-mp", description: "Marca-passo transcutâneo com captura: perfusão melhora", priority: 70, when: MP, repeat: "once", effects: [{ type: "setValue", var: "hr", value: 70 }, trend("sbp", 108, 180, "mp", 70), trend("dbp", 62, 180, "mp", 70), trend("perfusion", 0.65, 300, "mp", 70), trend("lactate", 1.8, 1800, "mp", 70), flag("consciousness", "alerta"), staff("enfermagem", "Captura elétrica e mecânica confirmadas: pulso femoral 70."), outcome("estabilizacao_parcial")] },
    { id: "r-mp-dor", description: "Marca-passo transcutâneo sem analgesia/sedação: dor intensa", when: { all: [MP, { not: { any: [{ drugGiven: "morfina" }, { drugGiven: "midazolam" }, { drugGiven: "cetamina" }] } }] }, repeat: "once", effects: [trend("pain", 8, 30, "mpdor", 50, 1200), flag("painVisual", "intensa"), obs("A estimulação transcutânea é dolorosa; analgesia/sedação deveriam acompanhar.")] },
    { id: "r-adrenalina", description: "Adrenalina em infusão: cronotropismo enquanto ativa", priority: 50, when: { all: [ADR_INF, { not: MP }] }, repeat: "while", effects: [trend("hr", 56, 120, "adr", 50), trend("sbp", 98, 180, "adr", 50), trend("perfusion", 0.55, 300, "adr", 50)], onEnd: [{ type: "clearTrend", var: "hr", slot: "adr" }, { type: "clearTrend", var: "sbp", slot: "adr" }, { type: "clearTrend", var: "perfusion", slot: "adr" }] },
    { id: "r-piora", description: "Sem suporte em 20 min: hipoperfusão grave", priority: 30, when: { all: [{ time: "gte", seconds: 1200 }, { not: SUPORTE }] }, repeat: "once", effects: [trend("hr", 24, 300, "piora", 30), trend("sbp", 62, 300, "piora", 30), flag("consciousness", "dor"), staff("enfermagem", "Frequência 24! Ela não responde direito."), outcome("piora")] },
    { id: "r-assistolia", description: "Sem suporte em 35 min: assistolia", priority: 100, when: { all: [{ time: "gte", seconds: 2100 }, { not: SUPORTE }] }, repeat: "once", effects: [flag("rhythm", "assistolia"), flag("pulse", false), { type: "setValue", var: "hr", value: 0 }, { type: "setValue", var: "sbp", value: 0 }, outcome("parada", true)] },
    { id: "r-regulacao", description: "Regulação para marca-passo", when: { actionCompleted: "acionar_samu" }, repeat: "once", effects: [staff("regulacao", "Regulação: hospital de referência com cardiologia intervencionista aceita para marca-passo transvenoso/definitivo; USA em 30 min.")] }
  ],
  diagnosis: { primary: "bav_total", accepted: ["bav_total"], differentials: ["sincope", "iamcsst", "hipercalemia", "intox_medicamentosa_intencional", "avc_isquemico"] },
  acceptedDestinations: ["transferencia_regulada", "uti"],
  outcomeNotes: "BAV total com escape ventricular e hipoperfusão: atropina pode ser tentada, mas costuma falhar no bloqueio infranodal; marca-passo transcutâneo (com analgesia/sedação) ou adrenalina/dopamina em infusão como ponte; descartar causas reversíveis; transferir para marca-passo transvenoso/definitivo.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Pesquisou fármacos bradicardizantes e causas reversíveis", evidence: { kind: "historyAsked", items: ["h-medicacoes", "h-dor", "h-rim"], minCount: 2 }, points: 8, severity: "critica", rationale: "Betabloqueador, digoxina, hipercalemia e isquemia são reversíveis." },
    { id: "s-sincope", domain: "historia", description: "Caracterizou a síncope", evidence: { kind: "historyAsked", items: ["h-sincope"], minCount: 1 }, points: 4, severity: "importante", rationale: "Síncope sem pródromo sugere arritmia (Stokes-Adams)." },
    { id: "s-monitor", domain: "priorizacao", description: "Monitor e pás em até 3 min", evidence: { kind: "actionDone", anyOf: ["pas_desfibrilador", "monitorizar"], withinSeconds: 180 }, points: 8, severity: "critica", rationale: "Preparar estimulação transcutânea." },
    { id: "s-ecg", domain: "exames", description: "ECG de 12 derivações", evidence: { kind: "testOrdered", anyOf: ["ecg12"], withinSeconds: 600 }, points: 8, severity: "critica", rationale: "Define o tipo de bloqueio." },
    { id: "s-exames", domain: "exames", description: "Potássio, troponina e função renal", evidence: { kind: "testOrdered", anyOf: ["eletrolitos", "troponina", "funcao_renal"] }, points: 7, severity: "importante", rationale: "Causas reversíveis." },
    { id: "s-atropina", domain: "tratamento", description: "Atropina como primeira medida farmacológica", evidence: { kind: "drugGiven", anyOf: ["atropina"] }, points: 4, severity: "importante", rationale: "Pode ser tentada; não deve atrasar marca-passo se falhar.", sourceIds: ["INT-AHA-ALS"] },
    { id: "s-mp", domain: "tratamento", description: "Marca-passo transcutâneo ou cronotrópico em até 15 min", evidence: { kind: "stateAtEnd", when: { any: [{ all: [MP, { not: { ruleFired: "r-piora" } }] }, { all: [{ drugGiven: "adrenalina" }, { not: { ruleFired: "r-piora" } }] }] } }, points: 14, severity: "critica", rationale: "Bradicardia instável refratária à atropina.", sourceIds: ["INT-AHA-ALS"] },
    { id: "s-analgesia", domain: "tratamento", description: "Analgesia/sedação para o marca-passo", evidence: { kind: "drugGiven", anyOf: ["morfina", "midazolam", "cetamina"] }, points: 3, severity: "importante", rationale: "Estimulação transcutânea é dolorosa." },
    { id: "s-reav", domain: "reavaliacao", description: "Confirmou captura (pulso/PA) após marca-passo", evidence: { kind: "reassessAfter", after: ["marcapasso_transcutaneo", "adrenalina"], reassess: ["medir_pa", "medir_fc_pulso"], withinSeconds: 900 }, points: 10, severity: "importante", rationale: "Captura elétrica sem captura mecânica não perfunde." },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de BAV total", evidence: { kind: "diagnosis", accepted: ["bav_total"] }, points: 6, severity: "importante", rationale: "Dissociação AV completa." },
    { id: "s-regulacao", domain: "destino", description: "Regulação para marca-passo transvenoso/definitivo", evidence: { kind: "disposition", accepted: ["transferencia_regulada", "uti"] }, points: 8, severity: "importante", rationale: "Hospital sem cardiologia intervencionista." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Pulso de 32 com hipotensão e sonolência: estável?" },
      { level: 2, text: "As ondas P conversam com os QRS?" },
      { level: 3, text: "QRS largo no escape sugere bloqueio abaixo do nó AV." },
      { level: 4, text: "Sugestão explícita: monitor e pás, acesso, atropina, marca-passo transcutâneo com analgesia (ou adrenalina em infusão), K/troponina e regulação." }
    ],
    summary: "Mulher de 79 anos com síncopes recorrentes por BAV total com escape ventricular lento e hipoperfusão.",
    pathophysiology: "Degeneração do sistema de condução (fibrose) bloqueia a passagem do impulso; o ventrículo é comandado por um escape lento e largo. O débito cai pela frequência baixa; a perda transitória do escape causa síncope (Stokes-Adams).",
    keyPoints: [
      "Bradicardia + hipoperfusão = instável.",
      "Atropina tem pouco efeito no bloqueio infranodal (QRS largo).",
      "Marca-passo transcutâneo com analgesia/sedação, ou adrenalina/dopamina em infusão.",
      "Confirmar captura mecânica (pulso).",
      "Excluir causas reversíveis; marca-passo definitivo."
    ],
    alternatives: ["Dopamina em infusão (não incluída no catálogo desta versão)."],
    oralRubric: [
      { id: "o1", concept: "Instabilidade", synonyms: ["instável", "hipoperfusão", "hipotensão"], weight: 2 },
      { id: "o2", concept: "BAV total", synonyms: ["bav total", "terceiro grau", "dissociação"], weight: 2 },
      { id: "o3", concept: "Marca-passo", synonyms: ["marca-passo", "marcapasso", "transcutâneo"], weight: 3 },
      { id: "o4", concept: "Cronotrópico", synonyms: ["adrenalina", "dopamina", "atropina"], weight: 1 }
    ],
    simplifications: ["Captura com o primeiro ajuste do marca-passo é determinística.", "Assistolia aos 35 min sem suporte é decisão didática."]
  },
  references: ["INT-AHA-ALS", "BR-SAMU", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 8, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Monitor, pás, ECG, atropina, analgesia, marca-passo e regulação", commands: [act(5, "monitorizar"), act(10, "pas_desfibrilador"), test(20, "ecg12"), ask(30, "h-medicacoes"), ask(40, "h-dor"), act(50, "acesso_venoso"), act(150, "acesso_venoso"), test(160, "eletrolitos"), rx(200, "atropina", "amp05", 1, "mg", "IV"), rx(400, "morfina", "amp10", 2, "mg", "IV"), act(420, "marcapasso_transcutaneo"), act(600, "medir_pa"), act(650, "acionar_samu"), dx(900, "bav_total"), dest(900, "transferencia_regulada")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-mp" }, description: "captura" }, { condition: { not: { ruleFired: "r-piora" } }, description: "sem piora" }, { condition: { not: { ruleFired: "r-mp-dor" } }, description: "com analgesia" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 2200, expect: [{ condition: { ruleFired: "r-piora" }, description: "piora" }, { condition: { ruleFired: "r-assistolia" }, description: "assistolia" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Só atropina repetida", commands: [act(50, "acesso_venoso"), act(150, "acesso_venoso"), rx(200, "atropina", "amp05", 1, "mg", "IV"), rx(500, "atropina", "amp05", 1, "mg", "IV")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-atropina" }, description: "resposta mínima" }, { condition: { ruleFired: "r-piora" }, description: "piora" }] },
    { id: "t-atraso", kind: "delay", description: "Marca-passo só aos 25 min, sem analgesia", commands: [act(1500, "pas_desfibrilador"), act(1520, "marcapasso_transcutaneo")], runUntilSeconds: 2500, expect: [{ condition: { ruleFired: "r-piora" }, description: "piora" }, { condition: { ruleFired: "r-mp" }, description: "captura tardia" }, { condition: { ruleFired: "r-mp-dor" }, description: "dor" }] },
    { id: "t-alternativa", kind: "alternative", description: "Adrenalina em infusão como ponte", commands: [act(5, "monitorizar"), act(50, "acesso_venoso"), act(150, "acesso_venoso"), rx(200, "adrenalina", "amp1mg", 1, "mg", "IV", "infusao", { rate: { value: 4, unit: "mcg/min" } }), act(600, "medir_pa"), dest(900, "transferencia_regulada")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-adrenalina" }, description: "cronotropismo" }, { condition: { not: { ruleFired: "r-piora" } }, description: "sem piora" }] }
  ]
};
