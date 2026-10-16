import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, obs, outcome, rx, staff, test, trend } from "./helpers";

const ADENOSINA = { drugGiven: "adenosina" };
const REVERTIDA = { ruleFired: "r-reversao" };

export const C012: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C012",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Coração disparado de repente em jovem que está bem",
  teachingTitle: "Taquicardia supraventricular estável — ECG, manobra vagal e adenosina",
  group: "Cardiologia",
  specialties: ["Cardiologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "upa-porte-ii",
  difficulty: 2,
  level: "internato",
  objectives: [
    "Verificar estabilidade hemodinâmica antes de tudo",
    "Registrar ECG de 12 derivações antes e depois da reversão",
    "Classificar a taquicardia (QRS estreito, regular)",
    "Aplicar manobra vagal e, se necessário, adenosina em bolus rápido",
    "Orientar e encaminhar para seguimento"
  ],
  keywords: ["palpitação", "coração acelerado", "disparado", "taquicardia"],
  patient: {
    name: "Camila Rocha",
    ageYears: 31,
    sex: "feminino",
    weightKg: 62,
    heightCm: 165,
    visual: { ageGroup: "adulto", sex: "feminino", skinTone: 2, hairStyle: "longo", hairColor: "castanho", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "UPA 24h. Mulher de 31 anos chega andando, com palpitações iniciadas de repente há 40 minutos enquanto subia uma escada. Já teve episódios curtos que passavam sozinhos.",
  communication: "normal",
  history: [
    h("h-queixa", "queixa", "O que você está sentindo?", "O coração disparou de repente, batendo muito rápido e regular.", { keywords: ["sentindo", "coração"] }),
    h("h-inicio", "inicio", "Começou de repente? Há quanto tempo?", "Do nada, há uns 40 minutos. Começa e termina de repente quando acontece.", { keywords: ["começou", "repente", "tempo"] }),
    h("h-instabilidade", "sinais_alarme", "Sente dor no peito, falta de ar, desmaiou ou está tonta?", "Só um incômodo leve no peito. Não desmaiei.", { keywords: ["dor no peito", "falta de ar", "desmaio", "tonta"] }),
    h("h-antes", "antecedentes", "Já teve isso antes? Tem doença do coração?", "Umas três vezes, mas passava em minutos. Nunca investiguei.", { keywords: ["antes", "doença", "coração"] }),
    h("h-substancias", "habitos", "Usou café, energético, remédio para emagrecer ou drogas?", "Tomei dois cafés hoje. Nada mais.", { keywords: ["café", "energético", "drogas", "remédio"] }),
    h("h-asma", "antecedentes", "Tem asma ou bronquite?", "Não.", { keywords: ["asma", "bronquite"] }),
    h("h-gestacao", "antecedentes", "Pode estar grávida?", "Não, uso DIU.", { keywords: ["grávida"] }),
    h("h-alergias", "alergias", "Tem alergia?", "Não.")
  ],
  initial: {
    vars: { hr: 186, sbp: 118, dbp: 76, rr: 18, spo2: 98, temp: 36.6, gcs: 15, pain: 2, glucose: 96, perfusion: 0.85, effort: 0.2, k: 4.0, na: 139, mg: 2.0 },
    flags: { rhythm: "tsv", posture: "sentado", painVisual: "leve", speech: "frases", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Ansiosa, corada, sem desconforto respiratório.", {}),
    ex("e-pescoco", "pescoco", "inspecao", "Pulsações cervicais rápidas e regulares (sinal do sapo).", { label: "Pescoço", better: [{ when: REVERTIDA, text: "Sem pulsações cervicais anormais." }] }),
    ex("e-coracao", "coracao", "ausculta", "Bulhas rítmicas e muito rápidas, sem sopros.", { sound: "bulhas_normais" }),
    ex("e-pulmao", "torax_posterior", "ausculta", "Murmúrio presente, sem estertores.", { sound: "murmurio_normal" })
  ],
  testResults: [
    { testId: "ecg12", variants: [
      { when: REVERTIDA, text: "Ritmo sinusal 88 bpm; PR normal, sem onda delta; sem alterações de repolarização.", ecg: { rhythm: "sinusal", rate: 88, stElevationLeads: [], stDepressionLeads: [], peakedT: false, wideQrs: false } },
      { text: "Taquicardia regular de QRS estreito, 186 bpm, sem ondas P visíveis (possível pseudo-r' em V1). Compatível com taquicardia por reentrada nodal.", ecg: { rhythm: "tsv", rate: 186, stElevationLeads: [], stDepressionLeads: ["V5", "V6"], peakedT: false, wideQrs: false } }
    ] }
  ],
  highlightedActions: ["monitorizar", "acesso_venoso", "manobra_vagal", "pas_desfibrilador"],
  rules: [
    { id: "r-vagal", description: "Manobra vagal: sem reversão neste caso (decisão do autor)", when: { actionCompleted: "manobra_vagal" }, repeat: "once", effects: [obs("Manobra vagal realizada corretamente: frequência caiu brevemente para 170 bpm e voltou a 186 bpm.")] },
    { id: "r-reversao", description: "Adenosina em bolus rápido reverte a reentrada", priority: 70, when: { all: [ADENOSINA, { elapsedSince: "drug:adenosina", op: "gte", seconds: 10 }] }, repeat: "once", effects: [flag("rhythm", "sinusal"), { type: "setValue", var: "hr", value: 88 }, trend("pain", 0, 120, "rev", 70), flag("painVisual", "nenhuma"), staff("paciente", "Nossa… senti um aperto estranho e uma sensação de morte por um segundo… agora passou!"), obs("Após a adenosina: pausa de 3 s no monitor e retorno ao ritmo sinusal."), outcome("melhora")] },
    { id: "r-cv-estavel", description: "Cardioversão elétrica em paciente estável: desnecessária como primeira medida", when: { all: [{ actionCompleted: "cardioversao_sincronizada" }, { not: REVERTIDA }] }, repeat: "once", effects: [flag("rhythm", "sinusal"), { type: "setValue", var: "hr", value: 92 }, obs("Cardioversão reverteu a arritmia, mas em paciente estável exige sedação e não é a primeira escolha."), outcome("melhora")] },
    { id: "r-persistente", description: "TSV persistente por 30 min: desconforto progressivo", priority: 20, when: { all: [{ time: "gte", seconds: 1800 }, { not: REVERTIDA }, { not: { ruleFired: "r-cv-estavel" } }] }, repeat: "once", effects: [trend("pain", 4, 600, "persist", 20), trend("sbp", 104, 600, "persist", 20), flag("painVisual", "moderada"), staff("paciente", "Estou ficando cansada e o peito está apertando mais."), outcome("piora")] },
    { id: "r-amiodarona", description: "Amiodarona não é a primeira escolha na TSV estável", when: { all: [{ drugGiven: "amiodarona" }, { not: REVERTIDA }] }, repeat: "once", effects: [obs("Amiodarona: sem reversão imediata; não é a primeira escolha para TSV por reentrada estável.")] }
  ],
  diagnosis: { primary: "tsv", accepted: ["tsv"], differentials: ["fa_alta_resposta", "crise_ansiedade", "iamssst"] },
  acceptedDestinations: ["alta_orientada", "encaminhamento_ambulatorial", "alta_com_seguimento_ubs"],
  outcomeNotes: "TSV estável: monitor, ECG, acesso; manobra vagal; adenosina 6 mg em bolus rápido (12 mg se necessário). Após reversão, ECG em ritmo sinusal (procurar pré-excitação), orientações e encaminhamento ao cardiologista (avaliação de ablação).",
  scoring: [
    { id: "s-estab", domain: "historia", description: "Pesquisou sinais de instabilidade", evidence: { kind: "historyAsked", items: ["h-instabilidade"], minCount: 1 }, points: 8, severity: "critica", rationale: "Instabilidade indicaria cardioversão elétrica imediata.", sourceIds: ["INT-AHA-ALS"] },
    { id: "s-hist", domain: "historia", description: "Início/término súbitos, recorrência, substâncias e asma", evidence: { kind: "historyAsked", items: ["h-inicio", "h-antes", "h-substancias", "h-asma"], minCount: 2 }, points: 6, severity: "importante", rationale: "Padrão paroxístico; asma pesa na adenosina." },
    { id: "s-monitor", domain: "priorizacao", description: "Monitorização e acesso venoso", evidence: { kind: "actionDone", anyOf: ["monitorizar"], withinSeconds: 300 }, points: 6, severity: "importante", rationale: "Registro contínuo durante a reversão." },
    { id: "s-ecg", domain: "exames", description: "ECG de 12 derivações antes de tratar", evidence: { kind: "testOrdered", anyOf: ["ecg12"], withinSeconds: 600 }, points: 12, severity: "critica", rationale: "Classificar a taquicardia (QRS, regularidade) define a conduta.", sourceIds: ["INT-AHA-ALS"] },
    { id: "s-exames", domain: "exames", description: "Sem exames desnecessários", evidence: { kind: "testsNotExcessive", maxUnjustified: 1, justified: ["ecg12", "eletrolitos", "hemograma", "teste_gravidez_urina", "bhcg"] }, points: 3, severity: "menor", rationale: "Eletrólitos são razoáveis." },
    { id: "s-vagal", domain: "tratamento", description: "Manobra vagal como primeira medida", evidence: { kind: "actionDone", anyOf: ["manobra_vagal"] }, points: 8, severity: "importante", rationale: "Primeira linha na TSV estável.", sourceIds: ["INT-AHA-ALS"] },
    { id: "s-adenosina", domain: "tratamento", description: "Adenosina em bolus rápido", evidence: { kind: "drugGiven", anyOf: ["adenosina"], withinSeconds: 1500 }, points: 14, severity: "critica", rationale: "Reverte reentrada nodal na maioria dos casos.", sourceIds: ["INT-AHA-ALS"] },
    { id: "s-cv", domain: "tratamento", description: "Falha: cardioversão elétrica em paciente estável sem tentar medidas iniciais", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-cv-estavel" } }, points: 3, penalty: true, severity: "menor", rationale: "Reservada para instabilidade ou falha." },
    { id: "s-reav", domain: "reavaliacao", description: "ECG após a reversão", evidence: { kind: "reassessAfter", after: ["adenosina"], reassess: ["ecg12"], withinSeconds: 1800 }, points: 10, severity: "importante", rationale: "Pesquisar pré-excitação (Wolff-Parkinson-White) em ritmo sinusal." },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de TSV", evidence: { kind: "diagnosis", accepted: ["tsv"] }, points: 5, severity: "importante", rationale: "QRS estreito, regular, sem P visível." },
    { id: "s-destino", domain: "destino", description: "Alta orientada com encaminhamento", evidence: { kind: "disposition", accepted: ["alta_orientada", "encaminhamento_ambulatorial", "alta_com_seguimento_ubs"] }, points: 5, severity: "importante", rationale: "Recorrências: avaliação para ablação." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Ela está estável? O que o ECG mostra?" },
      { level: 2, text: "QRS estreito e regular: qual a primeira medida sem medicamento?" },
      { level: 3, text: "Avise a paciente sobre a sensação transitória do fármaco." },
      { level: 4, text: "Sugestão explícita: monitor, ECG, acesso calibroso proximal, manobra vagal, adenosina 6 mg em bolus rápido com flush, ECG após reversão." }
    ],
    summary: "Mulher de 31 anos com TSV paroxística (provável reentrada nodal), estável, refratária à manobra vagal e revertida com adenosina.",
    pathophysiology: "Na reentrada nodal, duas vias com propriedades diferentes no nó AV formam um circuito. A adenosina bloqueia transitoriamente a condução nodal e interrompe o circuito; a manobra vagal age pelo mesmo princípio, com menor intensidade.",
    keyPoints: [
      "Instável → cardioversão sincronizada; estável → ECG e classificação.",
      "QRS estreito regular: manobra vagal, depois adenosina.",
      "Adenosina: bolus rápido com flush, em acesso proximal; avisar sobre sensação transitória.",
      "ECG em sinusal para procurar pré-excitação.",
      "Encaminhar para avaliação de ablação se recorrente."
    ],
    alternatives: ["Bloqueador de canal de cálcio não di-hidropiridínico ou betabloqueador se adenosina contraindicada/ineficaz (não modelado)."],
    oralRubric: [
      { id: "o1", concept: "Estabilidade", synonyms: ["estável", "instável", "instabilidade"], weight: 2 },
      { id: "o2", concept: "ECG e classificação", synonyms: ["ecg", "qrs estreito", "regular"], weight: 2 },
      { id: "o3", concept: "Manobra vagal", synonyms: ["vagal", "valsalva"], weight: 2 },
      { id: "o4", concept: "Adenosina", synonyms: ["adenosina"], weight: 3 }
    ],
    simplifications: ["A manobra vagal falha por decisão do autor, para treinar a sequência.", "Reversão com a primeira dose de adenosina é determinística."]
  },
  references: ["INT-AHA-ALS", "BR-UPA", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 15, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Estabilidade, ECG, vagal, adenosina e ECG de controle", commands: [ask(5, "h-instabilidade"), act(10, "monitorizar"), test(20, "ecg12"), act(40, "acesso_venoso"), act(140, "acesso_venoso"), act(300, "manobra_vagal"), rx(400, "adenosina", "amp6", 6, "mg", "IV"), test(600, "ecg12"), dx(900, "tsv"), dest(900, "encaminhamento_ambulatorial")], runUntilSeconds: 1200, expect: [{ condition: { ruleFired: "r-reversao" }, description: "reversão" }, { condition: { path: "flags.rhythm", op: "eq", value: "sinusal" }, description: "ritmo sinusal" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 2000, expect: [{ condition: { ruleFired: "r-persistente" }, description: "persistência" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Amiodarona direto, sem ECG", commands: [act(40, "acesso_venoso"), act(140, "acesso_venoso"), rx(200, "amiodarona", "amp150", 150, "mg", "IV")], runUntilSeconds: 2000, expect: [{ condition: { ruleFired: "r-amiodarona" }, description: "sem reversão" }, { condition: { ruleFired: "r-persistente" }, description: "persistência" }] },
    { id: "t-atraso", kind: "delay", description: "Adenosina só aos 35 min", commands: [act(40, "acesso_venoso"), act(140, "acesso_venoso"), rx(2100, "adenosina", "amp6", 6, "mg", "IV")], runUntilSeconds: 2400, expect: [{ condition: { ruleFired: "r-persistente" }, description: "desconforto" }, { condition: { ruleFired: "r-reversao" }, description: "reversão tardia" }] },
    { id: "t-alternativa", kind: "alternative", description: "Cardioversão sincronizada após falha da vagal", commands: [act(10, "monitorizar"), test(20, "ecg12"), act(300, "manobra_vagal"), act(400, "pas_desfibrilador"), act(450, "cardioversao_sincronizada", { energia: 50 })], runUntilSeconds: 900, expect: [{ condition: { ruleFired: "r-cv-estavel" }, description: "reversão elétrica" }] }
  ]
};
