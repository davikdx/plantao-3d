import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, obs, outcome, rx, staff, test, trend } from "./helpers";

const AMPLO = { any: [{ drugGiven: "piperacilina_tazobactam" }, { drugGiven: "vancomicina" }] };
const CIRURGIA = { actionCompleted: "solicitar_avaliacao_cirurgica" };
const VOL = (ml: number) => ({ any: [{ drugGiven: "sf09", minTotal: { value: ml, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: ml, unit: "mL" as const } }] });

export const C035: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C035",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Perna vermelha que dói muito mais do que parece",
  teachingTitle: "Infecção necrosante de partes moles (fasciite necrosante) em diabético",
  group: "Infectologia",
  specialties: ["Infectologia", "Cirurgia geral", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 4,
  level: "residencia",
  objectives: [
    "Diferenciar celulite de infecção necrosante pela clínica (dor desproporcional, bolhas, crepitação, toxemia)",
    "Acionar a cirurgia de urgência sem aguardar imagem: o tratamento definitivo é o desbridamento",
    "Antibioticoterapia de amplo espectro precoce, incluindo agente antitoxina",
    "Ressuscitar a hipoperfusão (volume, vasopressor se necessário)"
  ],
  keywords: ["perna", "vermelhidão", "dor", "ferida", "febre", "diabetes", "inchaço"],
  patient: {
    name: "Edvaldo Pires",
    ageYears: 52,
    sex: "masculino",
    weightKg: 88,
    heightCm: 170,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 6, hairStyle: "crespo_curto", hairColor: "preto", build: "robusto", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Lavrador de 52 anos, diabético, com vermelhidão e inchaço na perna direita há 2 dias após um corte na roça. Hoje a dor ficou insuportável e ele teve febre e tontura.",
  communication: "normal",
  history: [
    h("h-queixa", "queixa", "O que o senhor está sentindo?", "Essa perna dói demais, doutor, uma dor que não passa com nada. E agora estou tonto e com calafrio.", { keywords: ["sentindo"] }),
    h("h-inicio", "inicio", "Como começou?", "Há três dias cortei a canela numa cerca de arame no roçado. Anteontem ficou vermelho e ontem inchou muito.", { keywords: ["começou", "corte", "ferida"] }),
    h("h-dor", "intensidade", "De 0 a 10, quanto dói? A dor é maior que a vermelhidão?", "Dez. A dor sobe até o joelho, até onde nem está vermelho.", { keywords: ["dói", "intensidade", "desproporcional"] }),
    h("h-evolucao", "evolucao", "Mudou de aspecto desde ontem?", "Apareceram umas bolhas escuras hoje de manhã e um lugar ficou dormente.", { keywords: ["mudou", "bolhas", "dormente"] }),
    h("h-antecedentes", "antecedentes", "Tem alguma doença?", "Diabetes há 10 anos. Tomo metformina, mas não controlo direito.", { keywords: ["doença", "diabetes"] }),
    h("h-medicacoes", "medicacoes", "Tomou algum remédio para a perna?", "Tomei cefalexina que sobrou de outra vez, dois dias, e anti-inflamatório.", { keywords: ["remédio", "antibiótico"] }),
    h("h-vacina", "vacinacao", "Sua vacina antitetânica está em dia?", "Tomei a última faz uns 4 anos.", { keywords: ["vacina", "tétano"] }),
    h("h-alergias", "alergias", "Tem alergia a algum remédio?", "Não que eu saiba.")
  ],
  initial: {
    vars: { hr: 124, sbp: 88, dbp: 52, rr: 24, spo2: 96, temp: 38.8, gcs: 15, pain: 10, glucose: 312, perfusion: 0.5, effort: 0.4, wbc: 23800, hb: 12.8, ht: 38, plt: 140000, na: 129, k: 4.8, creat: 1.9, urea: 76, pcr: 280, cpk: 2400, lactate: 3.8, ph: 7.3, hco3: 18, be: -6, urine: 20, inr: 1.3 },
    flags: { rhythm: "taquicardia_sinusal", painVisual: "intensa", sweating: true, posture: "supino", edema: true, rash: true },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Toxemiado, sudoreico, ansioso, com fácies de dor.", { better: [{ when: { ruleFired: "r-estabiliza" }, text: "Menos toxemiado após volume e antibiótico; aguardando o centro cirúrgico." }] }),
    ex("e-perna-insp", "membro_inferior_d", "inspecao", "Eritema e edema da perna direita até o joelho, com bolhas de conteúdo hemorrágico e área acinzentada de 5 cm ao redor do ferimento.", { label: "Perna direita", better: [{ when: { ruleFired: "r-progressao" }, text: "Necrose cutânea estendendo-se à coxa, bolhas confluentes, secreção acinzentada com odor fétido." }] }),
    ex("e-perna-palp", "membro_inferior_d", "palpacao", "Edema endurecido ('lenhoso') além da área de eritema, crepitação à palpação e hipoestesia no centro da lesão; dor intensa à palpação proximal.", { label: "Palpação da perna" }),
    ex("e-perna-e", "membro_inferior_e", "inspecao", "Perna esquerda sem alterações.", {}),
    ex("e-perfusao", "membro_superior_d", "palpacao", "Pulso fino, enchimento capilar 4 s.", { better: [{ when: { path: "vars.sbp", op: "gte", value: 100 }, text: "Pulso cheio, enchimento capilar 2–3 s." }] }),
    ex("e-pulmao", "torax_anterior", "ausculta", "Murmúrio presente, sem ruídos adventícios.", { sound: "murmurio_normal" })
  ],
  testResults: [
    { testId: "hemocultura", variants: [{ text: "Coletadas; resultado em 48–72 h." }] },
    { testId: "usg_abdome", variants: [{ text: "Exame não indicado para esta suspeita." }] }
  ],
  highlightedActions: ["monitorizar", "acesso_venoso", "solicitar_avaliacao_cirurgica", "glicemia_capilar", "diurese_horaria"],
  rules: [
    { id: "r-cirurgiao", description: "Cirurgia de plantão avalia e indica desbridamento", priority: 50, when: CIRURGIA, repeat: "once", effects: [staff("supervisor", "Cirurgião de plantão: quadro compatível com infecção necrosante. Indicação de desbridamento de urgência; sala liberada no centro cirúrgico. Manter antibiótico e ressuscitação até a anestesia.")] },
    { id: "r-volume", description: "Cristaloide melhora parcialmente a pressão", priority: 30, when: VOL(1500), repeat: "once", effects: [trend("sbp", 96, 900, "vol", 30), trend("dbp", 56, 900, "vol", 30), trend("hr", 114, 900, "vol", 30), trend("perfusion", 0.6, 900, "vol", 30), trend("urine", 30, 1800, "vol", 30)] },
    { id: "r-nora", description: "Noradrenalina mantém PAM ≥ 65 mmHg enquanto infundida", priority: 45, when: { treatmentActive: "noradrenalina" }, repeat: "while", effects: [trend("sbp", 108, 300, "nora", 45), trend("dbp", 62, 300, "nora", 45)], onEnd: [{ type: "clearTrend", var: "sbp", slot: "nora" }, { type: "clearTrend", var: "dbp", slot: "nora" }] },
    { id: "r-estabiliza", description: "Antibiótico amplo + volume + cirurgia acionada: estabilização pré-operatória", priority: 55, when: { all: [AMPLO, VOL(1500), CIRURGIA] }, repeat: "once", effects: [trend("lactate", 2.4, 3600, "estab", 55), trend("temp", 38.1, 3600, "estab", 55), trend("hr", 104, 1800, "estab", 55), flag("sweating", false), outcome("estabilizacao_parcial")] },
    { id: "r-progressao-sem-atb", description: "Sem antibiótico amplo, a infecção progride rapidamente", priority: 20, when: { all: [{ time: "gte", seconds: 2400 }, { not: AMPLO }] }, repeat: "once", effects: [trend("sbp", 74, 900, "prog", 20), trend("dbp", 40, 900, "prog", 20), trend("hr", 138, 900, "prog", 20), trend("lactate", 6, 1800, "prog", 20), trend("creat", 2.8, 3600, "prog", 20), trend("plt", 80000, 3600, "prog", 20), flag("consciousness", "voz"), staff("enfermagem", "A área escura está subindo pela coxa e a pressão caiu mais."), outcome("piora")] },
    { id: "r-progressao", description: "Sem cirurgia, mesmo com antibiótico a necrose avança (antibiótico não penetra tecido necrótico)", priority: 25, when: { all: [{ time: "gte", seconds: 3600 }, { not: CIRURGIA }] }, repeat: "once", effects: [trend("lactate", 5.2, 1800, "prog2", 25), trend("sbp", 80, 900, "prog2", 25), trend("hr", 132, 900, "prog2", 25), staff("enfermagem", "A necrose avançou para a coxa."), obs("Antibiótico isolado não controla infecção necrosante: o tecido desvitalizado precisa ser desbridado."), outcome("piora")] },
    { id: "r-obito", description: "Sem antibiótico, sem cirurgia e sem volume por 2 h: óbito (desfecho definido pelo caso)", priority: 100, when: { all: [{ time: "gte", seconds: 7200 }, { not: AMPLO }, { not: CIRURGIA }, { not: VOL(1000) }] }, repeat: "once", effects: [flag("pulse", false), flag("consciousness", "irresponsivo"), outcome("obito", true)] },
    { id: "r-cefalo", description: "Cobertura insuficiente (só ceftriaxona)", when: { all: [{ drugGiven: "ceftriaxona" }, { not: AMPLO }] }, repeat: "once", effects: [obs("Ceftriaxona isolada não cobre MRSA nem anaeróbios e não tem efeito antitoxina; a infecção necrosante exige cobertura ampla e cirurgia.")] },
    { id: "r-glicemia", description: "Hiperglicemia descompensada", when: { actionCompleted: "glicemia_capilar" }, repeat: "once", effects: [obs("Glicemia capilar 312 mg/dL: controle glicêmico com insulina após a estabilização inicial.")] }
  ],
  diagnosis: { primary: "fasciite_necrosante", accepted: ["fasciite_necrosante"], differentials: ["celulite", "trombose_venosa_profunda", "choque_septico", "sepse"] },
  acceptedDestinations: ["centro_cirurgico"],
  outcomeNotes: "Dor desproporcional, edema além do eritema, bolhas hemorrágicas, crepitação, hipoestesia e toxemia sugerem infecção necrosante. O tratamento definitivo é o desbridamento cirúrgico precoce; antibiótico de amplo espectro e ressuscitação são adjuvantes. Sem cirurgia, a necrose avança mesmo com antibiótico.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Caracterizou dor desproporcional e evolução (bolhas, dormência)", evidence: { kind: "historyAsked", items: ["h-dor", "h-evolucao"], minCount: 2 }, points: 8, severity: "critica", rationale: "Sinais clínicos que distinguem infecção necrosante de celulite." },
    { id: "s-hist2", domain: "historia", description: "Mecanismo, comorbidades e vacina antitetânica", evidence: { kind: "historyAsked", items: ["h-inicio", "h-antecedentes", "h-vacina"], minCount: 2 }, points: 4, severity: "menor", rationale: "Diabetes é fator de risco; avaliar profilaxia do tétano." },
    { id: "s-exame", domain: "historia", description: "Palpou além do eritema (crepitação, endurecimento, hipoestesia)", evidence: { kind: "examDone", regions: ["membro_inferior_d"], minCount: 1 }, points: 8, severity: "importante", rationale: "Crepitação e edema 'lenhoso' além do eritema sugerem acometimento fascial." },
    { id: "s-cirurgia", domain: "priorizacao", description: "Acionou a cirurgia de urgência em até 45 minutos", evidence: { kind: "actionDone", anyOf: ["solicitar_avaliacao_cirurgica"], withinSeconds: 2700 }, points: 18, severity: "critica", rationale: "Desbridamento precoce é o principal determinante de sobrevida; não aguardar imagem.", sourceIds: ["INT-IDSA-SSTI-2014"] },
    { id: "s-acesso", domain: "priorizacao", description: "Monitorização e acesso venoso", evidence: { kind: "actionDone", anyOf: ["monitorizar", "acesso_venoso"], withinSeconds: 600 }, points: 4, severity: "importante", rationale: "Paciente com hipoperfusão." },
    { id: "s-atb", domain: "tratamento", description: "Antibiótico de amplo espectro (anti-MRSA + amplo espectro) na primeira hora", evidence: { kind: "drugGiven", anyOf: ["vancomicina", "piperacilina_tazobactam"], withinSeconds: 3600 }, points: 12, severity: "critica", rationale: "Cobertura empírica polimicrobiana e de MRSA; clindamicina associada pelo efeito antitoxina em estreptococo.", alternatives: "Vancomicina + piperacilina-tazobactam (± clindamicina) ou esquema equivalente do protocolo local.", sourceIds: ["INT-IDSA-SSTI-2014", "INT-SSC-2021"] },
    { id: "s-clinda", domain: "tratamento", description: "Clindamicina associada", evidence: { kind: "drugGiven", anyOf: ["clindamicina"] }, points: 4, severity: "menor", rationale: "Inibe a produção de toxinas estreptocócicas e estafilocócicas.", sourceIds: ["INT-IDSA-SSTI-2014"] },
    { id: "s-volume", domain: "tratamento", description: "Cristaloide ≥ 1,5 L para hipoperfusão", evidence: { kind: "drugGiven", anyOf: ["sf09", "ringer_lactato"], minTotal: { value: 1500, unit: "mL" } }, points: 6, severity: "importante", rationale: "Sepse com hipotensão e lactato elevado.", sourceIds: ["INT-SSC-2021"] },
    { id: "s-ceftri", domain: "tratamento", description: "Falha: tratar como celulite simples (só ceftriaxona)", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-cefalo" } }, points: 5, penalty: true, severity: "importante", rationale: "Cobertura e conduta inadequadas para infecção necrosante." },
    { id: "s-exames", domain: "exames", description: "Exames de gravidade e culturas sem atrasar a cirurgia", evidence: { kind: "testOrdered", anyOf: ["hemograma", "gaso_venosa", "hemocultura", "cpk"] }, points: 7, severity: "importante", rationale: "Leucocitose, hiponatremia, creatinina, PCR e glicose elevadas reforçam a suspeita (componentes do escore LRINEC); não excluem nem confirmam." },
    { id: "s-exames-excesso", domain: "exames", description: "Sem exames que atrasem o tratamento", evidence: { kind: "testsNotExcessive", maxUnjustified: 1, justified: ["hemograma", "gaso_venosa", "gaso_arterial", "hemocultura", "cpk", "funcao_renal", "eletrolitos", "pcr", "coagulograma"] }, points: 8, severity: "menor", rationale: "Imagem não deve retardar a exploração cirúrgica quando a clínica é sugestiva." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou perfusão/diurese após volume", evidence: { kind: "reassessAfter", after: ["sf09", "ringer_lactato"], reassess: ["monitorizacao_continua", "medir_pa", "diurese_horaria", "membro_superior_d", "gaso_venosa"], withinSeconds: 3600 }, points: 6, severity: "importante", rationale: "Necessidade de vasopressor." },
    { id: "s-dx", domain: "destino", description: "Hipótese de infecção necrosante", evidence: { kind: "diagnosis", accepted: ["fasciite_necrosante"] }, points: 5, severity: "importante", rationale: "Diagnóstico é clínico-cirúrgico." },
    { id: "s-destino", domain: "destino", description: "Centro cirúrgico", evidence: { kind: "disposition", accepted: ["centro_cirurgico"] }, points: 10, severity: "critica", rationale: "Desbridamento de urgência." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "A dor é proporcional ao que você vê na pele?" },
      { level: 2, text: "Palpe além da borda do eritema. O que você encontra?" },
      { level: 3, text: "Necrose da fáscia com trombose de vasos: o antibiótico não chega ao tecido morto." },
      { level: 4, text: "Sugestão explícita: acionar a cirurgia já, vancomicina + piperacilina-tazobactam + clindamicina, cristaloide e noradrenalina se necessário; destino: centro cirúrgico." }
    ],
    summary: "Diabético de 52 anos com ferimento na perna há 3 dias evolui com dor desproporcional, bolhas hemorrágicas, crepitação, hipoestesia, hipotensão e lactato 3,8: infecção necrosante de partes moles.",
    pathophysiology: "Bactérias (polimicrobianas ou estreptococo do grupo A) se disseminam ao longo da fáscia, causando trombose dos vasos perfurantes, isquemia e necrose da pele e do subcutâneo. Toxinas geram choque e disfunção orgânica. O tecido necrótico não é alcançado pelo antibiótico; somente o desbridamento remove o foco.",
    keyPoints: [
      "Sinais de alerta: dor desproporcional, edema além do eritema, bolhas hemorrágicas, crepitação, hipoestesia, toxemia.",
      "Diagnóstico é clínico; a exploração cirúrgica confirma e trata.",
      "Não atrasar a cirurgia esperando imagem ou escore laboratorial.",
      "Antibiótico amplo + clindamicina (antitoxina) e ressuscitação como sepse.",
      "Atualizar a profilaxia antitetânica."
    ],
    alternatives: ["Carbapenêmico em vez de piperacilina-tazobactam conforme protocolo local."],
    oralRubric: [
      { id: "o1", concept: "Dor desproporcional e sinais de necrose", synonyms: ["desproporcional", "bolha", "crepitação", "necrose"], weight: 2 },
      { id: "o2", concept: "Cirurgia de urgência", synonyms: ["cirurgia", "desbridamento", "cirurgião"], weight: 3 },
      { id: "o3", concept: "Antibiótico amplo + clindamicina", synonyms: ["vancomicina", "piperacilina", "clindamicina", "amplo espectro"], weight: 2 },
      { id: "o4", concept: "Ressuscitação", synonyms: ["volume", "noradrenalina", "lactato"], weight: 1 }
    ],
    simplifications: ["O desbridamento não é simulado: acionar a cirurgia e definir o destino representa a decisão.", "A seção de fasciite necrosante da diretriz IDSA ainda não foi conferida (ver CLINICAL_REVIEW.md)."]
  },
  references: ["INT-IDSA-SSTI-2014", "INT-SSC-2021", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Reconhece, aciona cirurgia, antibiótico amplo + clindamicina, volume e centro cirúrgico", commands: [ask(10, "h-dor"), ask(20, "h-evolucao"), { atSeconds: 30, type: "examine", payload: { region: "membro_inferior_d", maneuver: "palpacao" } }, act(60, "monitorizar"), act(70, "acesso_venoso"), act(170, "acesso_venoso"), act(270, "solicitar_avaliacao_cirurgica"), test(280, "hemocultura"), rx(400, "vancomicina", "fa1g", 1750, "mg", "IV"), rx(420, "piperacilina_tazobactam", "fa45", 4500, "mg", "IV"), rx(440, "clindamicina", "amp600", 900, "mg", "IV"), rx(460, "sf09", "bolsa1000", 2000, "mL", "IV", "infusao_volume", { durationMinutes: 40 }), act(3000, "medir_pa"), dx(3100, "fasciite_necrosante"), dest(3100, "centro_cirurgico")], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-estabiliza" }, description: "estabilização pré-operatória" }, { condition: { not: { ruleFired: "r-progressao" } }, description: "sem progressão" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 7300, expect: [{ condition: { ruleFired: "r-progressao-sem-atb" }, description: "progressão" }, { condition: { ruleFired: "r-obito" }, description: "óbito definido pelo caso" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Trata como celulite: ceftriaxona e observação", commands: [act(70, "acesso_venoso"), act(170, "acesso_venoso"), rx(300, "ceftriaxona", "fa1g", 2000, "mg", "IV"), dest(400, "observacao")], runUntilSeconds: 3700, expect: [{ condition: { ruleFired: "r-cefalo" }, description: "cobertura inadequada" }, { condition: { ruleFired: "r-progressao-sem-atb" }, description: "progressão" }] },
    { id: "t-atraso", kind: "delay", description: "Antibiótico amplo e volume, mas cirurgia só após 1 hora", commands: [act(70, "acesso_venoso"), act(170, "acesso_venoso"), rx(400, "vancomicina", "fa1g", 1750, "mg", "IV"), rx(420, "piperacilina_tazobactam", "fa45", 4500, "mg", "IV"), rx(460, "sf09", "bolsa1000", 2000, "mL", "IV", "infusao_volume", { durationMinutes: 40 }), act(4000, "solicitar_avaliacao_cirurgica")], runUntilSeconds: 5000, expect: [{ condition: { ruleFired: "r-progressao" }, description: "necrose avança sem cirurgia" }, { condition: { ruleFired: "r-estabiliza" }, description: "estabiliza após acionar cirurgia" }] },
    { id: "t-alternativa", kind: "alternative", description: "Noradrenalina associada ao volume", commands: [act(60, "monitorizar"), act(70, "acesso_venoso"), act(170, "acesso_venoso"), act(270, "solicitar_avaliacao_cirurgica"), rx(400, "piperacilina_tazobactam", "fa45", 4500, "mg", "IV"), rx(460, "ringer_lactato", "bolsa1000", 2000, "mL", "IV", "infusao_volume", { durationMinutes: 40 }), rx(600, "noradrenalina", "sol64", 1, "mg", "IV", "infusao", { rate: { value: 0.1, unit: "mcg/kg/min" } })], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-estabiliza" }, description: "estabilização" }, { condition: { path: "vars.sbp", op: "gte", value: 100 }, description: "PAS ≥ 100" }] }
  ]
};
