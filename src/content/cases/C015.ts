import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, obs, outcome, rx, staff, test, trend } from "./helpers";

const BETA = { drugGiven: "metoprolol" };
const NPS = { treatmentActive: "nitroprussiato" };
const ANTITROMBOTICO = { any: [{ drugGiven: "tenecteplase" }, { drugGiven: "alteplase" }, { drugGiven: "heparina" }, { drugGiven: "enoxaparina" }] };

export const C015: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C015",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Dor no peito que rasga e vai para as costas",
  teachingTitle: "Síndrome aórtica aguda (dissecção tipo A) — suspeitar, controlar FC/PA, imagem e cirurgia",
  group: "Cardiologia",
  specialties: ["Cardiologia", "Cirurgia cardiovascular", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 4,
  level: "internato",
  objectives: [
    "Suspeitar de síndrome aórtica por dor abrupta, irradiação dorsal e assimetria de pulsos",
    "Evitar antitrombóticos antes de excluir dissecção",
    "Controlar primeiro a frequência (betabloqueador) e depois a PA",
    "Solicitar angiotomografia e acionar cirurgia cardiovascular via regulação"
  ],
  keywords: ["dor no peito", "costas", "rasgando", "pressão alta", "aorta"],
  patient: {
    name: "Reginaldo Campos",
    ageYears: 59,
    sex: "masculino",
    weightKg: 92,
    heightCm: 181,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 1, hairStyle: "curto", hairColor: "grisalho", build: "obeso", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional (tomografia disponível; sem cirurgia cardíaca). Homem de 59 anos, hipertenso sem tratamento, com dor torácica súbita há 50 minutos, \"como uma facada que rasga\", irradiando para as costas.",
  communication: "normal",
  history: [
    h("h-queixa", "queixa", "Como é a dor?", "Começou de uma vez, fortíssima, como se estivesse rasgando, e foi para as costas, entre as escápulas.", { keywords: ["dor", "como é"] }),
    h("h-inicio", "inicio", "Começou de repente? Já no máximo?", "De repente, já no máximo, quando eu levantava uma caixa.", { keywords: ["repente", "máximo", "começou"] }),
    h("h-irradiacao", "localizacao", "A dor mudou de lugar?", "Agora desceu um pouco para a barriga.", { keywords: ["mudou", "migra", "lugar", "irradia"] }),
    h("h-neuro", "sinais_alarme", "Sentiu fraqueza, formigamento ou desmaio?", "Fiquei com a perna esquerda formigando por uns minutos.", { keywords: ["fraqueza", "formigamento", "desmaio"] }),
    h("h-antecedentes", "antecedentes", "Tem pressão alta, doença da aorta, usou cocaína?", "Pressão alta, mas parei o remédio. Nunca usei droga.", { keywords: ["pressão", "aorta", "cocaína"] }),
    h("h-familia", "familia", "Alguém na família teve aneurisma ou morte súbita?", "Meu irmão morreu de repente com 50 anos, não sei de quê.", { keywords: ["família", "aneurisma"] }),
    h("h-alergias", "alergias", "Tem alergia?", "Não.")
  ],
  initial: {
    vars: { hr: 104, sbp: 188, dbp: 102, rr: 22, spo2: 96, temp: 36.4, gcs: 15, pain: 10, glucose: 136, perfusion: 0.7, effort: 0.4, hb: 14.2, creat: 1.2, trop: 14, lactate: 2.2, plt: 220000, inr: 1.0 },
    flags: { rhythm: "taquicardia_sinusal", sweating: true, posture: "sentado", painVisual: "intensa", speech: "frases", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-pa-bilateral", "membro_superior_e", "palpacao", "PA no braço direito 188/102; no esquerdo 146/86. Pulso radial esquerdo mais fraco.", { label: "PA e pulsos nos dois braços" }),
    ex("e-coracao", "coracao", "ausculta", "Sopro diastólico aspirativo em foco aórtico acessório.", { sound: "sopro", better: [{ when: { ruleFired: "r-tamponamento" }, text: "Bulhas abafadas." }] }),
    ex("e-pulmao", "torax_posterior", "ausculta", "Murmúrio presente bilateralmente.", { sound: "murmurio_normal" }),
    ex("e-neuro", "neurologico", "especial", "Sem déficit motor no momento.", {}),
    ex("e-mmii", "membro_inferior_e", "palpacao", "Pulso femoral esquerdo diminuído em relação ao direito.", { label: "Pulsos femorais" })
  ],
  testResults: [
    { testId: "ecg12", variants: [{ text: "Taquicardia sinusal 104 bpm; sobrecarga ventricular esquerda; sem supradesnivelamento de ST.", ecg: { rhythm: "taquicardia_sinusal", rate: 104, stElevationLeads: [], stDepressionLeads: ["V5", "V6"], peakedT: false, wideQrs: false } }] },
    { testId: "rx_torax", variants: [{ text: "Alargamento do mediastino superior; botão aórtico proeminente. (Laudo educativo.)" }] },
    { testId: "angio_tc_torax", variants: [{ text: "Dissecção aórtica com flap intimal iniciando na aorta ascendente e estendendo-se até a aorta abdominal infrarrenal (Stanford A / DeBakey I); pequeno derrame pericárdico. (Laudo educativo.)" }] },
    { testId: "pocus_cardiaco", variants: [{ text: "Raiz aórtica dilatada (~48 mm) com imagem linear móvel sugestiva de flap; pequeno derrame pericárdico sem colapso de câmaras. (Laudo educativo.)" }] }
  ],
  highlightedActions: ["monitorizar", "acesso_venoso", "medir_pa", "acionar_samu"],
  rules: [
    { id: "r-beta", description: "Betabloqueador reduz FC e dP/dt", priority: 50, when: { all: [BETA, { not: { ruleFired: "r-progressao" } }] }, repeat: "once", effects: [trend("hr", 64, 300, "beta", 50), trend("sbp", 164, 300, "beta", 50), trend("dbp", 92, 300, "beta", 50)] },
    { id: "r-beta-tardio", description: "Betabloqueio após a ruptura contida: só reduz a FC", priority: 45, when: { all: [BETA, { ruleFired: "r-progressao" }] }, repeat: "once", effects: [trend("hr", 96, 300, "beta2", 45)] },
    { id: "r-nps", description: "Nitroprussiato após betabloqueio: PAS 100–120", priority: 60, when: { all: [NPS, BETA] }, repeat: "while", effects: [trend("sbp", 116, 300, "nps", 60), trend("dbp", 70, 300, "nps", 60)], onEnd: [{ type: "clearTrend", var: "sbp", slot: "nps" }, { type: "clearTrend", var: "dbp", slot: "nps" }] },
    { id: "r-nps-sem-beta", description: "Vasodilatador sem betabloqueio: taquicardia reflexa", priority: 55, when: { all: [NPS, { not: BETA }] }, repeat: "once", effects: [trend("hr", 124, 120, "reflexo", 55, 900), trend("sbp", 138, 300, "reflexo", 55, 900), obs("Taquicardia reflexa: aumenta a força de cisalhamento na parede aórtica. Betabloqueio deve vir primeiro.")] },
    { id: "r-controle", description: "FC e PA no alvo", priority: 65, when: { all: [{ ruleFired: "r-beta" }, NPS, { elapsedSince: "drug:nitroprussiato", op: "gte", seconds: 600 }] }, repeat: "once", effects: [trend("pain", 5, 600, "ctrl", 65), flag("painVisual", "moderada"), outcome("estabilizacao_parcial")] },
    { id: "r-tamponamento", description: "Antitrombótico na dissecção: hemopericárdio/tamponamento", priority: 90, when: ANTITROMBOTICO, repeat: "once", effects: [trend("sbp", 74, 300, "tamp", 90), trend("dbp", 46, 300, "tamp", 90), trend("hr", 132, 300, "tamp", 90), flag("consciousness", "voz"), staff("enfermagem", "A pressão despencou e as jugulares estão cheias!"), outcome("complicacao")] },
    { id: "r-aas", description: "AAS dado por suspeita de SCA", when: { drugGiven: "aas" }, repeat: "once", effects: [obs("AAS administrado antes de excluir dissecção: aumenta risco de sangramento cirúrgico.")] },
    { id: "r-progressao", description: "Sem controle de FC em 40 min: extensão e ruptura", priority: 40, when: { all: [{ time: "gte", seconds: 2400 }, { not: BETA }] }, repeat: "once", effects: [trend("sbp", 70, 300, "rupt", 40), trend("hr", 138, 300, "rupt", 40), flag("consciousness", "voz"), staff("enfermagem", "Ele ficou pálido e a pressão caiu muito!"), outcome("piora")] },
    { id: "r-pcr", description: "Ruptura sem tratamento: PCR", priority: 100, when: { all: [{ time: "gte", seconds: 3600 }, { not: BETA }] }, repeat: "once", effects: [flag("pulse", false), flag("rhythm", "sinusal"), { type: "setValue", var: "sbp", value: 0 }, { type: "setValue", var: "dbp", value: 0 }, flag("consciousness", "irresponsivo"), outcome("parada", true)] },
    { id: "r-regulacao", description: "Regulação para cirurgia cardiovascular", when: { actionCompleted: "acionar_samu" }, repeat: "once", effects: [staff("regulacao", "Regulação: cirurgia cardiovascular do hospital de referência aceita dissecção tipo A; USA em 20 min. Manter controle de FC e PA no transporte.")] }
  ],
  diagnosis: { primary: "disseccao_aorta", accepted: ["disseccao_aorta"], differentials: ["iamcsst", "iamssst", "tep", "pericardite", "pancreatite"] },
  acceptedDestinations: ["transferencia_regulada"],
  outcomeNotes: "Dor abrupta e lancinante com irradiação dorsal, assimetria de PA/pulsos, sopro de insuficiência aórtica e mediastino alargado: dissecção. Analgesia, betabloqueador IV primeiro (FC < 60), depois vasodilatador (PAS 100–120), angio-TC e cirurgia de emergência (tipo A) via regulação. Antitrombóticos são contraindicados.",
  scoring: [
    { id: "s-dor", domain: "historia", description: "Caracterizou a dor (início abrupto, rasgando, migração)", evidence: { kind: "historyAsked", items: ["h-queixa", "h-inicio", "h-irradiacao"], minCount: 2 }, points: 6, severity: "critica", rationale: "Características de alto risco para síndrome aórtica.", sourceIds: ["INT-ESC-AORTA-2024"] },
    { id: "s-neuro", domain: "historia", description: "Déficits e fatores de risco", evidence: { kind: "historyAsked", items: ["h-neuro", "h-antecedentes", "h-familia"], minCount: 2 }, points: 4, severity: "importante", rationale: "Má perfusão e risco genético." },
    { id: "s-pa-bilat", domain: "priorizacao", description: "Mediu PA nos dois braços / pulsos", evidence: { kind: "examDone", regions: ["membro_superior_e", "membro_inferior_e"], minCount: 1 }, points: 8, severity: "critica", rationale: "Assimetria de pulsos/PA sugere dissecção." },
    { id: "s-ecg", domain: "priorizacao", description: "ECG em até 10 min", evidence: { kind: "testOrdered", anyOf: ["ecg12"], withinSeconds: 600 }, points: 4, severity: "importante", rationale: "Excluir IAMCSST (que também pode coexistir)." },
    { id: "s-imagem", domain: "exames", description: "Angiotomografia de aorta (ou POCUS/eco)", evidence: { kind: "testOrdered", anyOf: ["angio_tc_torax", "pocus_cardiaco"], withinSeconds: 1800 }, points: 10, severity: "critica", rationale: "Confirma e classifica a dissecção.", sourceIds: ["INT-ESC-AORTA-2024"] },
    { id: "s-exames", domain: "exames", description: "Exames dirigidos", evidence: { kind: "testsNotExcessive", maxUnjustified: 1, justified: ["ecg12", "rx_torax", "angio_tc_torax", "pocus_cardiaco", "troponina", "hemograma", "coagulograma", "funcao_renal", "eletrolitos", "gaso_venosa"] }, points: 5, severity: "menor", rationale: "Tipagem e preparo cirúrgico." },
    { id: "s-beta", domain: "tratamento", description: "Betabloqueador IV primeiro", evidence: { kind: "drugGiven", anyOf: ["metoprolol"], withinSeconds: 1200 }, points: 12, severity: "critica", rationale: "Reduz FC e força de ejeção antes do vasodilatador.", sourceIds: ["INT-ESC-AORTA-2024"] },
    { id: "s-nps", domain: "tratamento", description: "Vasodilatador para PAS 100–120 após betabloqueio", evidence: { kind: "drugGiven", anyOf: ["nitroprussiato", "nitroglicerina"] }, points: 6, severity: "importante", rationale: "Controle de PA." },
    { id: "s-analgesia", domain: "tratamento", description: "Analgesia", evidence: { kind: "drugGiven", anyOf: ["morfina"] }, points: 3, severity: "importante", rationale: "Dor aumenta catecolaminas." },
    { id: "s-antitrombo", domain: "tratamento", description: "Falha: antitrombótico/fibrinolítico", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-tamponamento" } }, points: 12, penalty: true, severity: "critica", rationale: "Pode ser fatal na dissecção." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou FC/PA após tratamento", evidence: { kind: "reassessAfter", after: ["metoprolol"], reassess: ["medir_pa", "medir_fc_pulso"], withinSeconds: 1200 }, points: 10, severity: "importante", rationale: "Metas: FC < 60, PAS 100–120." },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de dissecção de aorta", evidence: { kind: "diagnosis", accepted: ["disseccao_aorta"] }, points: 6, severity: "importante", rationale: "Tipo A pela angio-TC." },
    { id: "s-destino", domain: "destino", description: "Transferência regulada para cirurgia cardiovascular", evidence: { kind: "disposition", accepted: ["transferencia_regulada"] }, points: 4, severity: "critica", rationale: "Tipo A é emergência cirúrgica." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Dor que começa no máximo e migra: pense além do infarto." },
      { level: 2, text: "Compare a pressão nos dois braços." },
      { level: 3, text: "Primeiro a frequência, depois a pressão." },
      { level: 4, text: "Sugestão explícita: analgesia, metoprolol IV, nitroprussiato, angio-TC, sem antitrombóticos, regulação para cirurgia." }
    ],
    summary: "Homem de 59 anos hipertenso com dissecção aórtica tipo A (assimetria de PA, sopro de insuficiência aórtica, mediastino alargado, flap da ascendente à abdominal).",
    pathophysiology: "Ruptura da íntima permite que o sangue disseque a média, criando falso lúmen que se propaga a cada sístole. Pode ocluir ramos (má perfusão), causar insuficiência aórtica, hemopericárdio e ruptura. A força de cisalhamento depende de FC e dP/dt — por isso betabloqueio antes do vasodilatador.",
    keyPoints: [
      "Dor abrupta, máxima no início, lancinante, com irradiação dorsal.",
      "Assimetria de pulsos/PA, déficit neurológico, sopro de IAo.",
      "Betabloqueador IV primeiro (FC < 60), depois vasodilatador (PAS 100–120).",
      "Sem antitrombóticos até excluir dissecção.",
      "Tipo A: cirurgia de emergência."
    ],
    alternatives: ["Esmolol ou labetalol, quando disponíveis (não modelados)."],
    oralRubric: [
      { id: "o1", concept: "Suspeição clínica", synonyms: ["rasgando", "dorso", "assimetria", "pulsos"], weight: 2 },
      { id: "o2", concept: "Betabloqueador primeiro", synonyms: ["betabloqueador", "metoprolol", "esmolol", "frequência"], weight: 3 },
      { id: "o3", concept: "Imagem", synonyms: ["angiotomografia", "tomografia", "ecocardiograma"], weight: 2 },
      { id: "o4", concept: "Cirurgia", synonyms: ["cirurgia", "cardiovascular", "regulação"], weight: 2 },
      { id: "o5", concept: "Evitar antitrombóticos", synonyms: ["heparina", "fibrinolítico", "antitrombótico"], weight: 1 }
    ],
    simplifications: ["Tempos de extensão/ruptura são didáticos.", "Tamponamento como consequência imediata do antitrombótico é simplificação."]
  },
  references: ["INT-ESC-AORTA-2024", "BR-SAMU", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 10, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "PA bilateral, ECG, morfina, metoprolol, nitroprussiato, angio-TC e regulação", commands: [ask(10, "h-inicio"), ask(20, "h-irradiacao"), { atSeconds: 30, type: "examine", payload: { region: "membro_superior_e", maneuver: "palpacao" } }, act(40, "monitorizar"), test(50, "ecg12"), act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(200, "morfina", "amp10", 3, "mg", "IV"), rx(260, "metoprolol", "amp5", 5, "mg", "IV"), test(300, "angio_tc_torax"), act(400, "acionar_samu"), rx(700, "nitroprussiato", "sol200", 50, "mg", "IV", "infusao", { rate: { value: 0.5, unit: "mcg/kg/min" } }), act(1400, "medir_pa"), dx(3000, "disseccao_aorta"), dest(3000, "transferencia_regulada")], runUntilSeconds: 3200, expect: [{ condition: { ruleFired: "r-controle" }, description: "FC e PA no alvo" }, { condition: { not: { ruleFired: "r-tamponamento" } }, description: "sem antitrombótico" }, { condition: { path: "vars.sbp", op: "lte", value: 125 }, description: "PAS ≤ 125" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 3700, expect: [{ condition: { ruleFired: "r-progressao" }, description: "ruptura" }, { condition: { ruleFired: "r-pcr" }, description: "PCR" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Tratado como infarto: AAS e enoxaparina", commands: [act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(200, "aas", "cp100", 300, "mg", "VO"), rx(250, "enoxaparina", "ser80", 80, "mg", "SC")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-aas" }, description: "AAS" }, { condition: { ruleFired: "r-tamponamento" }, description: "tamponamento" }] },
    { id: "t-erro-ordem", kind: "inadequate", description: "Nitroprussiato antes do betabloqueador", commands: [act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(200, "nitroprussiato", "sol200", 50, "mg", "IV", "infusao", { rate: { value: 0.5, unit: "mcg/kg/min" } })], runUntilSeconds: 900, expect: [{ condition: { ruleFired: "r-nps-sem-beta" }, description: "taquicardia reflexa" }] },
    { id: "t-atraso", kind: "delay", description: "Betabloqueador só aos 45 min", commands: [act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(2700, "metoprolol", "amp5", 5, "mg", "IV")], runUntilSeconds: 4000, expect: [{ condition: { ruleFired: "r-progressao" }, description: "progressão" }, { condition: { not: { ruleFired: "r-pcr" } }, description: "PCR evitada" }] },
    { id: "t-alternativa", kind: "alternative", description: "POCUS em vez de angio-TC, com metoprolol e regulação", commands: [act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(200, "metoprolol", "amp5", 5, "mg", "IV"), test(250, "pocus_cardiaco"), act(300, "acionar_samu"), dest(1000, "transferencia_regulada")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-beta" }, description: "FC controlada" }] }
  ]
};
