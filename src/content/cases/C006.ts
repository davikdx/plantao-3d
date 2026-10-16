import type { CaseDefinitionInput } from "../../domain/schema";
import { act, dest, dx, ex, flag, hi, obs, outcome, rx, staff, trend } from "./helpers";

const ADR_1MG = { drugGiven: "adrenalina", minTotal: { value: 1, unit: "mg" as const } };

export const C006: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C006",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Paciente monitorizado deixa de responder na observação",
  teachingTitle: "Parada cardiorrespiratória em ritmo chocável (FV) em área monitorizada",
  group: "Reanimação, instabilidade e choque",
  specialties: ["Emergência", "Cardiologia"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Reconhecer PCR sem atrasar compressões",
    "Desfibrilar precocemente ritmo chocável",
    "Organizar ciclos com adrenalina e antiarrítmico",
    "Reconhecer retorno da circulação e iniciar cuidados pós-PCR"
  ],
  keywords: ["parada", "irresponsivo", "monitor", "desmaio", "sem pulso"],
  patient: {
    name: "Sebastião Moura",
    ageYears: 61,
    sex: "masculino",
    weightKg: 82,
    heightCm: 172,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 4, hairStyle: "careca", hairColor: "grisalho", build: "robusto", pregnancyTrimester: 0 }
  },
  briefing:
    "Pronto-socorro de hospital regional, leitos de observação monitorizados. O alarme do monitor dispara e a enfermeira chama: o paciente do leito 3, internado há 2 horas por dor torácica, parou de responder.",
  communication: "incapaz",
  informants: [{ id: "enf", name: "Enfermeira Cláudia", role: "Enfermeira da observação" }],
  history: [
    hi("h-evento", "queixa", "O que aconteceu?", [{ source: "enf", text: "Ele estava conversando, disse que a dor no peito voltou, e de repente revirou os olhos e ficou sem responder. O monitor alarmou na hora." }], ["aconteceu", "houve"]),
    hi("h-tempo", "inicio", "Há quanto tempo?", [{ source: "enf", text: "Agora, menos de um minuto. Eu vi acontecer." }], ["quanto tempo", "quando"]),
    hi("h-antecedentes", "antecedentes", "Que doenças ele tem?", [{ source: "prontuario", text: "Hipertenso, diabético tipo 2, tabagista. Admitido com dor torácica há 2 h; ECG da admissão sem supradesnivelamento; troponina inicial em análise." }], ["doença", "prontuario"]),
    hi("h-medicacoes", "medicacoes", "O que ele recebeu aqui?", [{ source: "prontuario", text: "AAS 300 mg VO na admissão. Acesso venoso periférico foi perdido há 20 minutos e ainda não foi refeito." }], ["recebeu", "medicação"]),
    hi("h-alergias", "alergias", "Tem alergias?", [{ source: "prontuario", text: "Nega alergias conhecidas (registro de admissão)." }])
  ],
  initial: {
    vars: { hr: 280, sbp: 0, dbp: 0, rr: 3, spo2: 70, temp: 36.4, gcs: 3, glucose: 168, perfusion: 0.05, effort: 0, etco2: 8, k: 4.3, lactate: 6.5, ph: 7.18, pco2: 52, hco3: 18, be: -9, trop: 120 },
    flags: { rhythm: "fv", pulse: false, consciousness: "irresponsivo", speech: "nenhuma", airway: "risco", communication: "incapaz", posture: "supino", painVisual: "nenhuma" },
    devices: ["monitor_ecg", "oximetro", "manguito"],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Irresponsivo, sem movimentos respiratórios normais (respiração agônica/gasping ocasional), cianose perioral.", {
      better: [{ when: { ruleFired: "r-rosc" }, text: "Pulso presente; continua irresponsivo, respiração superficial e irregular." }]
    }),
    ex("e-pulso", "pescoco", "palpacao", "Pulso carotídeo ausente em 10 segundos de palpação.", {
      label: "Pulso carotídeo",
      better: [{ when: { ruleFired: "r-rosc" }, text: "Pulso carotídeo presente, rápido." }]
    }),
    ex("e-torax", "torax_anterior", "inspecao", "Sem expansibilidade torácica efetiva.", { better: [{ when: { deviceActive: "bvm" }, text: "Expansão torácica simétrica a cada ventilação com bolsa-válvula-máscara." }] }),
    ex("e-ausculta", "torax_anterior", "ausculta", "Sem murmúrio respiratório espontâneo efetivo.", { better: [{ when: { any: [{ deviceActive: "bvm" }, { deviceActive: "tot" }] }, text: "Murmúrio bilateral durante as ventilações assistidas." }] }),
    ex("e-pupilas", "olhos", "inspecao", "Pupilas médias, pouco fotorreagentes.", {})
  ],
  testResults: [
    { testId: "ecg12", variants: [
      { when: { ruleFired: "r-rosc" }, text: "Pós-RCE: ritmo sinusal taquicárdico com supradesnivelamento de ST em parede anterior (V1–V4). Ilustração educativa.", ecg: { rhythm: "sinusal_supra", rate: 112, stElevationLeads: ["V1", "V2", "V3", "V4"], stDepressionLeads: ["DIII", "aVF"], peakedT: false, wideQrs: false } },
      { text: "Fibrilação ventricular: atividade elétrica caótica sem complexos QRS identificáveis. Não atrase as compressões para obter ECG de 12 derivações.", ecg: { rhythm: "fv", rate: 280, stElevationLeads: [], stDepressionLeads: [], peakedT: false, wideQrs: false } }
    ] }
  ],
  highlightedActions: ["chamar_ajuda", "rcp", "pas_desfibrilador", "desfibrilar", "ventilar_bvm", "acesso_io", "acesso_venoso", "checar_ritmo_pulso"],
  rules: [
    {
      id: "r-rcp-efeito",
      description: "Compressões geram perfusão mínima (EtCO₂ sobe) enquanto mantidas",
      when: { all: [{ actionStarted: "rcp" }, { path: "flags.pulse", op: "eq", value: false }] },
      repeat: "once",
      effects: [trend("etco2", 18, 30, "rcp", 20), trend("perfusion", 0.2, 30, "rcp", 20)]
    },
    {
      id: "r-choque-1",
      description: "Primeiro choque: FV persiste (refratária, definida pelo caso)",
      when: { actionCompleted: "desfibrilar", count: 1 },
      repeat: "once",
      effects: [obs("Choque aplicado. Retomar compressões imediatamente; na próxima checagem o ritmo continua caótico."), staff("enfermagem", "Choque administrado! Voltando às compressões.")]
    },
    {
      id: "r-choque-2",
      description: "Segundo choque sem adrenalina: FV persiste",
      when: { actionCompleted: "desfibrilar", count: 2 },
      repeat: "once",
      effects: [obs("Segundo choque aplicado; FV persiste no monitor.")]
    },
    {
      id: "r-rosc",
      description: "RCE após 3º choque com RCP em curso e adrenalina já administrada",
      priority: 90,
      when: { all: [{ actionCompleted: "desfibrilar", count: 3 }, ADR_1MG, { actionStarted: "rcp" }] },
      repeat: "once",
      effects: [
        flag("rhythm", "sinusal_supra"),
        flag("pulse", true),
        { type: "setValue", var: "hr", value: 118 },
        { type: "setValue", var: "sbp", value: 82 },
        { type: "setValue", var: "dbp", value: 48 },
        trend("sbp", 96, 120, "rosc", 50),
        trend("dbp", 58, 120, "rosc", 50),
        trend("hr", 108, 120, "rosc", 50),
        { type: "setValue", var: "rr", value: 6 },
        trend("etco2", 38, 60, "rosc", 60),
        trend("perfusion", 0.55, 120, "rosc", 50),
        trend("spo2", 90, 90, "rosc", 25),
        staff("enfermagem", "Tenho pulso! O traçado mudou."),
        outcome("rosc")
      ]
    },
    {
      id: "r-rosc-ventilacao",
      description: "Após RCE, com ventilação assistida a oxigenação melhora",
      when: { all: [{ ruleFired: "r-rosc" }, { any: [{ deviceActive: "bvm" }, { deviceActive: "tot" }] }] },
      repeat: "while",
      effects: [trend("spo2", 96, 60, "vent", 40)],
      onEnd: [{ type: "clearTrend", var: "spo2", slot: "vent" }]
    },
    {
      id: "r-sem-rcp-precoce",
      description: "Sem compressões nos primeiros 3 minutos: registra no prognóstico",
      when: { all: [{ time: "gte", seconds: 180 }, { not: { actionStarted: "rcp" } }] },
      repeat: "once",
      effects: [obs("Já se passaram 3 minutos sem compressões torácicas.")]
    },
    {
      id: "r-cardioversao-fv",
      description: "Cardioversão sincronizada em FV: o aparelho não encontra QRS para sincronizar",
      when: { actionCompleted: "cardioversao_sincronizada" },
      repeat: "once",
      effects: [obs("O desfibrilador em modo sincronizado não disparou: não há onda R para sincronizar na FV. Use choque não sincronizado.")]
    },
    {
      id: "r-obito",
      description: "Sem RCE em 10 minutos, o caso evolui para óbito (decisão didática do autor)",
      priority: 100,
      when: { all: [{ time: "gte", seconds: 600 }, { not: { ruleFired: "r-rosc" } }] },
      repeat: "once",
      effects: [flag("rhythm", "assistolia"), { type: "setValue", var: "hr", value: 0 }, staff("supervisor", "Após 10 minutos sem retorno da circulação e ritmo em assistolia, a equipe decide encerrar os esforços."), outcome("obito", true)]
    }
  ],
  diagnosis: { primary: "pcr_fv", accepted: ["pcr_fv"], differentials: ["pcr_aesp", "pcr_assistolia", "iamcsst", "hipercalemia", "pneumotorax_hipertensivo"] },
  acceptedDestinations: ["uti", "transferencia_regulada"],
  outcomeNotes: "Com RCP precoce, desfibrilação e adrenalina, há RCE após o 3º choque. Sem RCE em 10 minutos, o autor define óbito. ECG pós-RCE mostra supra anterior: a continuidade exige reperfusão (hemodinâmica via regulação).",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Obteve contexto do evento com a equipe (tempo e causa provável)", evidence: { kind: "historyAsked", items: ["h-evento", "h-tempo", "h-antecedentes"], minCount: 1 }, points: 5, severity: "menor", rationale: "Tempo de PCR e contexto (dor torácica) orientam causas reversíveis." },
    { id: "s-pulso", domain: "historia", description: "Confirmou ausência de pulso em até 10 s ou iniciou RCP diretamente", evidence: { kind: "actionDone", anyOf: ["rcp", "checar_ritmo_pulso"], withinSeconds: 30 }, points: 10, severity: "importante", rationale: "Não atrasar compressões para checagens prolongadas.", sourceIds: ["INT-AHA-SBV"] },
    { id: "s-rcp", domain: "priorizacao", description: "Compressões iniciadas no primeiro minuto", evidence: { kind: "actionDone", anyOf: ["rcp"], withinSeconds: 60 }, points: 15, severity: "critica", rationale: "Compressões de alta qualidade imediatas aumentam a chance de sobrevivência.", sourceIds: ["INT-AHA-SBV"] },
    { id: "s-ajuda", domain: "priorizacao", description: "Chamou ajuda/equipe de reanimação", evidence: { kind: "actionDone", anyOf: ["chamar_ajuda"], withinSeconds: 60 }, points: 5, severity: "importante", rationale: "Reanimação é trabalho em equipe." },
    { id: "s-choque-precoce", domain: "tratamento", description: "Primeiro choque em até 3 minutos", evidence: { kind: "actionDone", anyOf: ["desfibrilar"], withinSeconds: 180 }, points: 15, severity: "critica", rationale: "Em ritmo chocável, a desfibrilação precoce é determinante.", sourceIds: ["INT-AHA-ALS"] },
    { id: "s-adrenalina", domain: "tratamento", description: "Adrenalina 1 mg IV/IO após falha das desfibrilações iniciais", evidence: { kind: "drugGiven", anyOf: ["adrenalina"], routes: ["IV", "IO"], minTotal: { value: 1, unit: "mg" } }, points: 8, severity: "importante", rationale: "Adrenalina 1 mg a cada 3–5 min; em ritmo chocável, após as primeiras tentativas de desfibrilação.", sourceIds: ["INT-AHA-ALS"] },
    { id: "s-acesso", domain: "tratamento", description: "Obteve acesso venoso ou intraósseo", evidence: { kind: "actionDone", anyOf: ["acesso_venoso", "acesso_io"] }, points: 5, severity: "importante", rationale: "Acesso IO é alternativa quando o venoso não é rápido." },
    { id: "s-amiodarona", domain: "tratamento", description: "Antiarrítmico em FV refratária", evidence: { kind: "drugGiven", anyOf: ["amiodarona"] }, points: 4, severity: "menor", rationale: "Pode ser considerado em FV/TV sem pulso refratária ao choque (COR 2b). Não é obrigatório para o RCE neste caso.", alternatives: "Lidocaína é alternativa citada nas diretrizes (não disponível no catálogo desta versão).", sourceIds: ["INT-AHA-ALS"] },
    { id: "s-ventilacao", domain: "tratamento", description: "Ventilação com bolsa-válvula-máscara ou via aérea avançada", evidence: { kind: "actionDone", anyOf: ["ventilar_bvm", "intubacao"] }, points: 3, severity: "importante", rationale: "Oxigenação e ventilação sem interromper compressões de forma prolongada." },
    { id: "s-erro-sinc", domain: "tratamento", description: "Uso de cardioversão sincronizada em FV", evidence: { kind: "avoidAction", anyOf: ["cardioversao_sincronizada"] }, points: 5, penalty: true, severity: "importante", rationale: "Na FV não há QRS para sincronizar; o choque deve ser não sincronizado." },
    { id: "s-exames", domain: "exames", description: "Não interrompeu a reanimação para exames; ECG de 12 derivações pós-RCE", evidence: { kind: "testsNotExcessive", maxUnjustified: 1, justified: ["ecg12", "gaso_arterial", "gaso_venosa", "eletrolitos", "troponina"] }, points: 15, severity: "menor", rationale: "Exames na PCR só se mudam conduta (ex.: potássio, gasometria); após RCE, ECG é prioritário." },
    { id: "s-reavaliacao", domain: "reavaliacao", description: "Checou ritmo/pulso nos ciclos", evidence: { kind: "actionDone", anyOf: ["checar_ritmo_pulso"] }, points: 5, severity: "importante", rationale: "Pausas curtas a cada 2 minutos para análise do ritmo." },
    { id: "s-pos-rce", domain: "reavaliacao", description: "Após o RCE, solicitou ECG de 12 derivações ou mediu a PA", evidence: { kind: "reassessAfter", after: ["desfibrilar"], reassess: ["ecg12", "medir_pa", "monitorizacao_continua"], withinSeconds: 900 }, points: 5, severity: "importante", rationale: "Pós-PCR: identificar SCA com supra e tratar hipotensão/hipoxemia." },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de PCR em ritmo chocável", evidence: { kind: "diagnosis", accepted: ["pcr_fv"] }, points: 4, severity: "importante", rationale: "Classificar o ritmo orienta o algoritmo." },
    { id: "s-destino", domain: "destino", description: "Destino pós-RCE: UTI ou transferência regulada para hemodinâmica", evidence: { kind: "disposition", accepted: ["uti", "transferencia_regulada"] }, points: 6, severity: "importante", rationale: "Hospital regional sem hemodinâmica: transferir para reperfusão via regulação, ou UTI se instabilidade impedir transporte.", sourceIds: ["BR-SAMU"] }
  ],
  teaching: {
    hints: [
      { level: 1, text: "O paciente respira normalmente e tem pulso?" },
      { level: 2, text: "Qual ritmo o monitor mostra? Ele é chocável?" },
      { level: 3, text: "Na FV, a perfusão coronariana depende das compressões; o choque organiza a atividade elétrica." },
      { level: 4, text: "Sugestão explícita: RCP contínua, pás, choque não sincronizado, retomar RCP, acesso IV/IO e adrenalina 1 mg após falha dos choques iniciais." }
    ],
    summary: "Homem de 61 anos internado por dor torácica evolui com FV presenciada em leito monitorizado.",
    pathophysiology: "Isquemia miocárdica gera instabilidade elétrica e FV, com débito cardíaco nulo. As compressões produzem fluxo coronariano e cerebral mínimo; a desfibrilação despolariza o miocárdio para permitir o retorno de um ritmo organizado. Após o RCE, a síndrome pós-PCR e a lesão coronariana exigem reperfusão, controle hemodinâmico e ventilatório.",
    keyPoints: [
      "Reconhecer PCR: irresponsivo, sem respiração normal e sem pulso em até 10 s.",
      "RCP de alta qualidade imediata, com mínimo de interrupções.",
      "Ritmo chocável: choque não sincronizado o mais cedo possível; retomar compressões logo após.",
      "Adrenalina 1 mg IV/IO a cada 3–5 min; antiarrítmico pode ser considerado na FV refratária.",
      "Pós-RCE: ECG de 12 derivações, oxigenação, PA e destino para reperfusão."
    ],
    alternatives: ["Acesso intraósseo quando o venoso não é obtido rapidamente.", "Via aérea por bolsa-válvula-máscara é aceitável; via aérea avançada conforme a experiência da equipe."],
    oralRubric: [
      { id: "o1", concept: "Compressões imediatas", synonyms: ["compressão", "compressões", "rcp", "massagem"], weight: 3 },
      { id: "o2", concept: "Desfibrilação precoce", synonyms: ["choque", "desfibrila", "desfibrilação"], weight: 3 },
      { id: "o3", concept: "Adrenalina", synonyms: ["adrenalina", "epinefrina"], weight: 2 },
      { id: "o4", concept: "Cuidados pós-RCE", synonyms: ["pós", "ecg", "reperfusão", "hemodinâmica"], weight: 1 }
    ],
    simplifications: [
      "RCE após o 3º choque com adrenalina é uma decisão do autor, não uma probabilidade real.",
      "Qualidade das compressões não é medida; o simulador considera RCP em curso quando a ação está ativa.",
      "Encerramento dos esforços aos 10 minutos é didático; na prática depende de múltiplos fatores."
    ]
  },
  references: ["INT-AHA-ALS", "INT-AHA-SBV", "BR-SAMU-SAV", "BR-SAMU", "AUTOR-SIMPLIFICACAO"],
  tests: [
    {
      id: "t-aceitavel",
      kind: "acceptable",
      description: "RCP imediata, pás, 3 choques, acesso IO e adrenalina 1 mg",
      commands: [act(2, "chamar_ajuda"), act(4, "rcp"), act(6, "pas_desfibrilador"), act(25, "desfibrilar", { energia: 200 }), act(30, "ventilar_bvm"), act(40, "acesso_io"), act(140, "checar_ritmo_pulso"), act(150, "desfibrilar", { energia: 200 }), rx(160, "adrenalina", "amp1mg", 1, "mg", "IV"), act(270, "desfibrilar", { energia: 200 }), act(290, "rcp"), dx(400, "pcr_fv"), dest(400, "transferencia_regulada")],
      runUntilSeconds: 500,
      expect: [{ condition: { ruleFired: "r-rosc" }, description: "RCE" }, { condition: { path: "flags.pulse", op: "eq", value: true }, description: "pulso presente" }, { condition: { not: { ruleFired: "r-obito" } }, description: "sem óbito" }]
    },
    {
      id: "t-sem-intervencao",
      kind: "no_intervention",
      description: "Nenhuma conduta",
      commands: [],
      runUntilSeconds: 700,
      expect: [{ condition: { ruleFired: "r-obito" }, description: "óbito definido pelo caso" }]
    },
    {
      id: "t-inadequada",
      kind: "inadequate",
      description: "Cardioversão sincronizada em FV",
      commands: [act(4, "rcp"), act(6, "pas_desfibrilador"), act(30, "cardioversao_sincronizada", { energia: 100 })],
      runUntilSeconds: 300,
      expect: [{ condition: { ruleFired: "r-cardioversao-fv" }, description: "aparelho não dispara" }, { condition: { not: { ruleFired: "r-rosc" } }, description: "sem RCE" }]
    },
    {
      id: "t-atraso",
      kind: "delay",
      description: "RCP só aos 4 minutos; RCE ainda possível antes de 10 min",
      commands: [act(240, "rcp"), act(245, "pas_desfibrilador"), act(265, "desfibrilar", { energia: 200 }), act(270, "acesso_io"), rx(380, "adrenalina", "amp1mg", 1, "mg", "IV"), act(390, "desfibrilar", { energia: 200 }), act(510, "desfibrilar", { energia: 200 })],
      runUntilSeconds: 560,
      expect: [{ condition: { ruleFired: "r-sem-rcp-precoce" }, description: "atraso registrado" }, { condition: { ruleFired: "r-rosc" }, description: "RCE" }]
    },
    {
      id: "t-alternativa",
      kind: "alternative",
      description: "Acesso venoso periférico em vez de IO, com amiodarona",
      commands: [act(4, "rcp"), act(6, "pas_desfibrilador"), act(25, "desfibrilar", { energia: 200 }), act(30, "acesso_venoso"), act(130, "acesso_venoso"), act(150, "desfibrilar", { energia: 200 }), rx(250, "adrenalina", "amp1mg", 1, "mg", "IV"), rx(255, "amiodarona", "amp150", 300, "mg", "IV"), act(280, "desfibrilar", { energia: 200 })],
      runUntilSeconds: 400,
      expect: [{ condition: { ruleFired: "r-rosc" }, description: "RCE" }]
    }
  ]
};
