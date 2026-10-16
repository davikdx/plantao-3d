import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, obs, outcome, oxygenResponse, rx, staff, test, trend } from "./helpers";

const AAS = { drugGiven: "aas" };
const TNK = { drugGiven: "tenecteplase" };
const NITRATO = { any: [{ treatmentActive: "nitroglicerina" }, { drugGiven: "nitroglicerina" }] };

export const C009: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C009",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Dor no peito e suor frio em hospital do interior",
  teachingTitle: "IAM com supradesnivelamento de ST inferior — estratégia de reperfusão sem hemodinâmica local",
  group: "Cardiologia",
  specialties: ["Cardiologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Obter e interpretar ECG em até 10 minutos",
    "Iniciar antiagregação e anticoagulação",
    "Escolher a estratégia de reperfusão conforme o tempo até a angioplastia",
    "Reconhecer acometimento de ventrículo direito e evitar nitrato",
    "Reavaliar critérios de reperfusão e transferir via regulação"
  ],
  keywords: ["dor no peito", "aperto", "suor", "infarto", "coração"],
  patient: {
    name: "Gilberto Nunes",
    ageYears: 54,
    sex: "masculino",
    weightKg: 78,
    heightCm: 171,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 2, hairStyle: "curto", hairColor: "grisalho", build: "robusto", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional do interior (sem hemodinâmica). Homem de 54 anos chega de carro com a esposa, com dor no peito iniciada há 1 hora durante o trabalho na roça.",
  communication: "normal",
  history: [
    h("h-queixa", "queixa", "O que o senhor está sentindo?", "Um aperto forte no meio do peito, doutor, que não passa. Parece um peso.", { keywords: ["sentindo", "dor"] }),
    h("h-inicio", "inicio", "Quando começou?", "Faz uma hora, mais ou menos, quando eu estava carregando saco de adubo."),
    h("h-irradiacao", "localizacao", "A dor vai para algum lugar?", "Vai pro braço esquerdo e pro queixo.", { keywords: ["irradia", "braço", "vai"] }),
    h("h-intensidade", "intensidade", "De 0 a 10, quanto dói?", "Uns 8."),
    h("h-associados", "fatores_associados", "Sente mais alguma coisa?", "Suei frio, fiquei enjoado e vomitei uma vez.", { keywords: ["enjoo", "suor", "falta de ar"] }),
    h("h-antecedentes", "antecedentes", "Tem alguma doença?", "Pressão alta e colesterol, mas não tomo direito os remédios.", { keywords: ["doença", "pressão"] }),
    h("h-medicacoes", "medicacoes", "Que remédios usa? Usou algo para disfunção erétil?", "Losartana quando lembro. Esse remédio de ereção eu não uso.", { keywords: ["remédio", "sildenafila", "viagra"] }),
    h("h-habitos", "habitos", "Fuma?", "Fumo um maço por dia há 30 anos."),
    h("h-contra", "sinais_alarme", "Já teve derrame, sangramento, cirurgia recente ou trauma na cabeça?", "Nunca tive derrame nem sangramento. Não fiz cirurgia.", { keywords: ["derrame", "sangramento", "cirurgia", "avc"] }),
    h("h-alergias", "alergias", "Tem alergia a algum remédio?", "Não tenho alergia."),
    h("h-familia", "familia", "Alguém na família teve infarto?", "Meu pai morreu do coração com 60 anos.")
  ],
  initial: {
    vars: { hr: 64, sbp: 132, dbp: 84, rr: 20, spo2: 95, temp: 36.4, gcs: 15, pain: 8, glucose: 148, perfusion: 0.8, effort: 0.5, k: 4.1, na: 139, creat: 1.0, urea: 34, hb: 14.6, ht: 44, plt: 230000, inr: 1.0, trop: 85, cpk: 210 },
    flags: { rhythm: "sinusal_supra", sweating: true, painVisual: "intensa", posture: "supino" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Ansioso, sudoreico, mão fechada sobre o esterno.", { better: [{ when: { ruleFired: "r-reperfusao" }, text: "Mais tranquilo, sem sudorese." }] }),
    ex("e-jugular", "pescoco", "inspecao", "Turgência jugular a 45°.", { label: "Jugulares" }),
    ex("e-torax", "torax_anterior", "ausculta", "Murmúrio vesicular presente, sem estertores.", { sound: "murmurio_normal" }),
    ex("e-coracao", "coracao", "ausculta", "Bulhas rítmicas, B4 presente, sem sopros.", { sound: "bulhas_normais" }),
    ex("e-pulsos", "membro_superior_d", "palpacao", "Pulsos radiais simétricos; PA semelhante nos dois braços.", { label: "Pulsos e PA bilateral" }),
    ex("e-abdome", "abdome_epigastrio", "palpacao", "Abdome flácido, indolor.", {})
  ],
  testResults: [
    {
      testId: "ecg12",
      variants: [
        { when: { ruleFired: "r-reperfusao" }, text: "Redução > 50% do supradesnivelamento em DII, DIII e aVF; ritmo sinusal 72 bpm. Sugere reperfusão.", ecg: { rhythm: "sinusal", rate: 72, stElevationLeads: [], stDepressionLeads: [], peakedT: false, wideQrs: false } },
        { text: "Ritmo sinusal, 64 bpm. Supradesnivelamento de ST em DII, DIII e aVF (maior em DIII que em DII) com infradesnivelamento recíproco em DI e aVL. Sugere IAM inferior; considerar derivações direitas (V3R/V4R).", ecg: { rhythm: "sinusal_supra", rate: 64, stElevationLeads: ["DII", "DIII", "aVF"], stDepressionLeads: ["DI", "aVL"], peakedT: false, wideQrs: false } }
      ]
    },
    { testId: "rx_torax", variants: [{ text: "Laudo educativo: área cardíaca normal, mediastino não alargado, sem congestão." }] }
  ],
  highlightedActions: ["monitorizar", "acesso_venoso", "acionar_samu", "pas_desfibrilador"],
  rules: [
    oxygenResponse(97, 120),
    { id: "r-regulacao", description: "Regulação informa tempo até angioplastia", when: { actionCompleted: "acionar_samu" }, repeat: "once", effects: [staff("regulacao", "Regulação: hemodinâmica de referência disponível, mas o tempo estimado até a angioplastia é de cerca de 3 horas (transporte de 180 km). Orientamos estratégia farmacoinvasiva se não houver contraindicação; vaga liberada após a fibrinólise.")] },
    { id: "r-reperfusao", description: "Fibrinólise com AAS: reperfusão após ~15–30 min", priority: 60, when: { all: [TNK, AAS, { elapsedSince: "drug:tenecteplase", op: "gte", seconds: 1200 }] }, repeat: "once", effects: [flag("rhythm", "sinusal"), trend("pain", 2, 600, "rep", 60), trend("hr", 72, 600, "rep", 60), flag("sweating", false), flag("painVisual", "leve"), trend("trop", 4200, 7200, "rep", 60), outcome("melhora")] },
    { id: "r-reperfusao-sem-aas", description: "Fibrinólise sem antiagregante: reperfusão menos estável", priority: 55, when: { all: [TNK, { not: AAS }, { elapsedSince: "drug:tenecteplase", op: "gte", seconds: 1800 }] }, repeat: "once", effects: [trend("pain", 4, 600, "rep2", 55), outcome("estabilizacao_parcial")] },
    { id: "r-bav", description: "Sem reperfusão, o IAM inferior evolui com BAV total e hipotensão", priority: 20, when: { all: [{ time: "gte", seconds: 2700 }, { not: TNK }] }, repeat: "once", effects: [flag("rhythm", "bav_total"), trend("hr", 36, 120, "bav", 20), trend("sbp", 82, 300, "bav", 20), trend("dbp", 50, 300, "bav", 20), trend("perfusion", 0.5, 300, "bav", 20), staff("enfermagem", "A frequência caiu muito e ele está tonto!"), outcome("complicacao")] },
    { id: "r-atropina", description: "Atropina melhora temporariamente a bradicardia", priority: 30, when: { all: [{ ruleFired: "r-bav" }, { drugGiven: "atropina" }] }, repeat: "once", effects: [trend("hr", 52, 60, "atr", 30, 900), trend("sbp", 94, 120, "atr", 30, 900)] },
    { id: "r-nitrato-vd", description: "Nitrato em IAM inferior com VD: hipotensão grave", priority: 90, when: NITRATO, repeat: "once", effects: [trend("sbp", 72, 120, "nitrato", 90, 1200), trend("dbp", 42, 120, "nitrato", 90, 1200), trend("hr", 98, 120, "nitrato", 90, 1200), flag("consciousness", "voz"), staff("enfermagem", "A pressão despencou depois do nitrato!"), outcome("complicacao")] },
    { id: "r-volume-vd", description: "Volume corrige hipotensão dependente de pré-carga (VD)", priority: 92, when: { all: [{ ruleFired: "r-nitrato-vd" }, { drugGiven: "sf09", minTotal: { value: 500, unit: "mL" } }] }, repeat: "once", effects: [trend("sbp", 110, 300, "vol", 95, 3000), flag("consciousness", "alerta")] },
    { id: "r-dor-morfina", description: "Morfina alivia a dor, sem efeito sobre a reperfusão", when: { drugGiven: "morfina" }, repeat: "once", effects: [trend("pain", 5, 300, "mor", 40, 1800), obs("Dor alivia parcialmente após morfina.")] }
  ],
  diagnosis: { primary: "iamcsst", accepted: ["iamcsst"], differentials: ["iamssst", "disseccao_aorta", "pericardite", "tep", "dor_toracica_musculoesqueletica"] },
  acceptedDestinations: ["transferencia_regulada"],
  outcomeNotes: "Com tempo até a angioplastia > 120 min, a fibrinólise precoce (≤ 30 min da chegada, sem contraindicação) seguida de transferência é a estratégia esperada. Sem reperfusão, BAV total aos 45 min. Nitrato causa hipotensão grave (VD); volume corrige.",
  scoring: [
    { id: "s-hist-dor", domain: "historia", description: "Caracterizou a dor (início, irradiação, sintomas associados)", evidence: { kind: "historyAsked", items: ["h-inicio", "h-irradiacao", "h-associados", "h-intensidade"], minCount: 2 }, points: 6, severity: "importante", rationale: "Tempo de início define elegibilidade à reperfusão." },
    { id: "s-hist-contra", domain: "historia", description: "Pesquisou contraindicações à fibrinólise e uso de inibidor de PDE5", evidence: { kind: "historyAsked", items: ["h-contra", "h-medicacoes"], minCount: 2 }, points: 8, severity: "critica", rationale: "AVC/sangramento prévio contraindicam fibrinolítico; inibidor de PDE5 contraindica nitrato.", sourceIds: ["INT-ESC-SCA-2023"] },
    { id: "s-exame", domain: "historia", description: "Pesquisou jugulares/congestão e pulsos bilaterais", evidence: { kind: "examDone", regions: ["pescoco", "torax_anterior", "membro_superior_d"], minCount: 2 }, points: 6, severity: "importante", rationale: "Turgência jugular com pulmões limpos sugere VD; assimetria de pulsos sugere dissecção." },
    { id: "s-ecg", domain: "priorizacao", description: "ECG em até 10 minutos", evidence: { kind: "testOrdered", anyOf: ["ecg12"], withinSeconds: 600 }, points: 12, severity: "critica", rationale: "Diagnóstico de IAMCSST é eletrocardiográfico.", sourceIds: ["INT-ESC-SCA-2023"] },
    { id: "s-monitor", domain: "priorizacao", description: "Monitorização e desfibrilador disponível", evidence: { kind: "actionDone", anyOf: ["monitorizar"], withinSeconds: 300 }, points: 4, severity: "importante", rationale: "Risco de arritmias." },
    { id: "s-aas", domain: "tratamento", description: "AAS mastigado", evidence: { kind: "drugGiven", anyOf: ["aas"], withinSeconds: 1200 }, points: 8, severity: "critica", rationale: "Antiagregação precoce reduz mortalidade.", sourceIds: ["INT-ESC-SCA-2023"] },
    { id: "s-clopi", domain: "tratamento", description: "Segundo antiagregante (clopidogrel)", evidence: { kind: "drugGiven", anyOf: ["clopidogrel"] }, points: 4, severity: "importante", rationale: "Dupla antiagregação associada à fibrinólise.", sourceIds: ["INT-ESC-SCA-2023"] },
    { id: "s-anticoag", domain: "tratamento", description: "Anticoagulação (enoxaparina)", evidence: { kind: "drugGiven", anyOf: ["enoxaparina"] }, points: 4, severity: "importante", rationale: "Anticoagulante associado ao fibrinolítico.", sourceIds: ["INT-ESC-SCA-2023"] },
    { id: "s-fibrinolise", domain: "tratamento", description: "Fibrinólise em até 30 minutos da chegada", evidence: { kind: "drugGiven", anyOf: ["tenecteplase"], withinSeconds: 1800 }, points: 12, severity: "critica", rationale: "Sem angioplastia possível em 120 min, fibrinólise precoce é recomendada (meta porta-agulha ≤ 30 min nas diretrizes).", alternatives: "Angioplastia primária seria preferível se disponível no tempo recomendado — não é o caso deste cenário.", sourceIds: ["INT-ESC-SCA-2023"] },
    { id: "s-nitrato", domain: "tratamento", description: "Falha: nitrato em IAM inferior com sinais de VD", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-nitrato-vd" } }, points: 8, penalty: true, severity: "importante", rationale: "Infarto de VD é pré-carga dependente; nitrato pode causar hipotensão grave." },
    { id: "s-exames", domain: "exames", description: "Não esperou troponina para reperfundir", evidence: { kind: "testsNotExcessive", maxUnjustified: 2, justified: ["ecg12", "troponina", "hemograma", "coagulograma", "eletrolitos", "funcao_renal", "rx_torax"] }, points: 15, severity: "importante", rationale: "No IAMCSST, a decisão de reperfusão não depende da troponina." },
    { id: "s-reav", domain: "reavaliacao", description: "Repetiu ECG após fibrinólise", evidence: { kind: "reassessAfter", after: ["tenecteplase"], reassess: ["ecg12"], withinSeconds: 5400 }, points: 10, severity: "importante", rationale: "Critérios de reperfusão em 60–90 min orientam angioplastia de resgate." },
    { id: "s-regulacao", domain: "destino", description: "Acionou a regulação para transferência", evidence: { kind: "actionDone", anyOf: ["acionar_samu"], withinSeconds: 1800 }, points: 3, severity: "importante", rationale: "Estratégia farmacoinvasiva: transferir após fibrinólise.", sourceIds: ["BR-SAMU"] },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de IAMCSST", evidence: { kind: "diagnosis", accepted: ["iamcsst"] }, points: 4, severity: "importante", rationale: "Supra em parede inferior com recíproca." },
    { id: "s-destino", domain: "destino", description: "Transferência regulada para hospital com hemodinâmica", evidence: { kind: "disposition", accepted: ["transferencia_regulada"] }, points: 3, severity: "importante", rationale: "Cateterismo após fibrinólise (2–24 h) ou resgate se falha." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Qual exame define a conduta nos primeiros minutos de dor torácica?" },
      { level: 2, text: "Onde está o supra? Quanto tempo até uma sala de hemodinâmica?" },
      { level: 3, text: "Infarto inferior pode envolver o VD: pré-carga dependente." },
      { level: 4, text: "Sugestão explícita: ECG, AAS, clopidogrel, enoxaparina, tenecteplase ajustada ao peso (sem contraindicação), regulação; evitar nitrato." }
    ],
    summary: "Homem de 54 anos com dor típica há 1 h e IAMCSST inferior, em hospital sem hemodinâmica e com tempo de transferência estimado em 3 h.",
    pathophysiology: "Ruptura de placa com trombo oclusivo (geralmente na coronária direita no IAM inferior) causa necrose transmural progressiva. A coronária direita irriga o nó AV e o VD: bradiarritmias, BAV e hipotensão dependente de pré-carga são complicações típicas. Fibrinolíticos lisam o trombo; o benefício é maior quanto mais precoce.",
    keyPoints: [
      "ECG em até 10 min da chegada.",
      "Reperfusão: angioplastia primária se possível em ≤ 120 min; senão, fibrinólise em ≤ 30 min e transferência.",
      "Pesquisar contraindicações ao fibrinolítico.",
      "IAM inferior: buscar VD (V3R/V4R, jugulares) e evitar nitrato e diuréticos.",
      "ECG após 60–90 min para critérios de reperfusão."
    ],
    alternatives: ["Morfina para dor refratária, com cautela."],
    oralRubric: [
      { id: "o1", concept: "ECG precoce com supra inferior", synonyms: ["ecg", "supra", "inferior"], weight: 2 },
      { id: "o2", concept: "Antiagregação e anticoagulação", synonyms: ["aas", "clopidogrel", "enoxaparina", "heparina"], weight: 2 },
      { id: "o3", concept: "Fibrinólise pelo tempo de transferência", synonyms: ["fibrinólise", "fibrinolitico", "tenecteplase", "trombólise"], weight: 3 },
      { id: "o4", concept: "Evitar nitrato no VD", synonyms: ["nitrato", "ventrículo direito", "vd"], weight: 1 },
      { id: "o5", concept: "Transferência para hemodinâmica", synonyms: ["transferência", "hemodinâmica", "cateterismo", "regulação"], weight: 1 }
    ],
    simplifications: ["Tempo para reperfusão (~20 min) e evolução para BAV aos 45 min são parâmetros didáticos.", "Faixas de dose da tenecteplase por peso e idade devem ser conferidas (validação pendente)."]
  },
  references: ["INT-ESC-SCA-2023", "BR-SAMU", "BR-SAMU-SAV", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 8, allowSexSwap: true, allowWeightPercent: 0, allowVisualVariation: true, forbidden: ["peso"] },
  tests: [
    {
      id: "t-aceitavel",
      kind: "acceptable",
      description: "ECG, AAS, clopidogrel, enoxaparina, tenecteplase, regulação e ECG de controle",
      commands: [test(5, "ecg12"), act(10, "monitorizar"), ask(150, "h-contra"), ask(160, "h-medicacoes"), rx(170, "aas", "cp100", 300, "mg", "VO"), rx(180, "clopidogrel", "cp75", 300, "mg", "VO"), act(190, "acesso_venoso"), act(290, "acesso_venoso"), rx(400, "enoxaparina", "ser80", 30, "mg", "IV"), rx(500, "tenecteplase", "fa40", 40, "mg", "IV"), act(600, "acionar_samu"), test(3600, "ecg12"), dx(4000, "iamcsst"), dest(4000, "transferencia_regulada")],
      runUntilSeconds: 4200,
      expect: [{ condition: { ruleFired: "r-reperfusao" }, description: "reperfusão" }, { condition: { not: { ruleFired: "r-bav" } }, description: "sem BAV" }]
    },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem tratamento", commands: [], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-bav" }, description: "BAV total e hipotensão" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Nitroglicerina IV para a dor", commands: [act(10, "acesso_venoso"), act(110, "acesso_venoso"), rx(200, "nitroglicerina", "sol200", 1, "mg", "IV", "infusao", { rate: { value: 10, unit: "mcg/min" } })], runUntilSeconds: 600, expect: [{ condition: { ruleFired: "r-nitrato-vd" }, description: "hipotensão grave" }] },
    { id: "t-atraso", kind: "delay", description: "Fibrinólise só aos 50 min (após BAV)", commands: [rx(100, "aas", "cp100", 300, "mg", "VO"), act(110, "acesso_venoso"), act(210, "acesso_venoso"), rx(3000, "tenecteplase", "fa40", 40, "mg", "IV")], runUntilSeconds: 4500, expect: [{ condition: { ruleFired: "r-bav" }, description: "BAV pelo atraso" }, { condition: { ruleFired: "r-reperfusao" }, description: "reperfusão tardia" }] },
    { id: "t-alternativa", kind: "alternative", description: "Correção de hipotensão por nitrato com volume", commands: [act(10, "acesso_venoso"), act(110, "acesso_venoso"), rx(200, "nitroglicerina", "sol200", 1, "mg", "IV", "infusao", { rate: { value: 10, unit: "mcg/min" } }), act(260, "decubito_lateral_esquerdo"), rx(300, "sf09", "bolsa500", 500, "mL", "IV", "infusao_volume", { durationMinutes: 15 })], runUntilSeconds: 2000, expect: [{ condition: { ruleFired: "r-volume-vd" }, description: "volume corrige" }] }
  ]
};
