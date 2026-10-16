import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, obs, outcome, rx, staff, test, trend } from "./helpers";

const ATB = { any: [{ drugGiven: "ceftriaxona" }, { drugGiven: "piperacilina_tazobactam" }] };
const IMAGEM = { any: [{ testCollected: "usg_abdome" }, { testCollected: "tc_abdome" }] };
const DESOBSTRUCAO = { actionCompleted: "solicitar_avaliacao_cirurgica" };
const VOL = (ml: number) => ({ any: [{ drugGiven: "sf09", minTotal: { value: ml, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: ml, unit: "mL" as const } }] });

export const C036: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C036",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Febre, calafrios e dor nas costas que não melhora com antibiótico",
  teachingTitle: "Pielonefrite obstrutiva por cálculo ureteral com sepse — necessidade de desobstrução urgente",
  group: "Infectologia",
  specialties: ["Infectologia", "Urologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-referencia",
  difficulty: 3,
  level: "residencia",
  objectives: [
    "Reconhecer sepse de foco urinário com sinais de complicação",
    "Suspeitar de obstrução (cólica prévia, falha do antibiótico oral) e solicitar imagem precoce",
    "Entender que infecção em via urinária obstruída exige desobstrução urgente, além de antibiótico",
    "Iniciar antimicrobiano e ressuscitação sem aguardar a imagem"
  ],
  keywords: ["febre", "dor nas costas", "calafrio", "urina", "pedra no rim", "cólica"],
  patient: {
    name: "Cristiane Lopes",
    ageYears: 44,
    sex: "feminino",
    weightKg: 68,
    heightCm: 160,
    visual: { ageGroup: "adulto", sex: "feminino", skinTone: 4, hairStyle: "cacheado", hairColor: "castanho", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital de referência. Mulher de 44 anos com febre, calafrios e dor lombar esquerda. Foi atendida há 2 dias numa UBS e está tomando ciprofloxacino, mas piorou.",
  communication: "normal",
  history: [
    h("h-queixa", "queixa", "O que a senhora está sentindo?", "Muita dor do lado esquerdo das costas, febre com tremedeira e enjoo.", { keywords: ["sentindo"] }),
    h("h-inicio", "inicio", "Como começou?", "Há 5 dias tive uma cólica muito forte do lado esquerdo, que ia para a virilha. Melhorou um pouco, mas há 3 dias veio a febre.", { keywords: ["começou", "cólica"] }),
    h("h-calculo", "antecedentes", "Já teve pedra no rim?", "Já, eliminei uma há dois anos. Disseram que eu tinha outras.", { keywords: ["pedra", "cálculo", "rim"] }),
    h("h-medicacoes", "medicacoes", "Que remédios está usando?", "Ciprofloxacino há dois dias, que o médico da UBS passou, e dipirona.", { keywords: ["remédio", "antibiótico"] }),
    h("h-urina", "alimentacao_eliminacoes", "Como está a urina?", "Urino pouco e está escura. Ardeu um pouco no começo.", { keywords: ["urina", "urinando"] }),
    h("h-gestacao", "gestacao", "Existe possibilidade de gravidez?", "Não, fiz laqueadura."),
    h("h-alergias", "alergias", "Tem alergia a algum remédio?", "Não."),
    h("h-antecedentes2", "outros", "Tem diabetes ou outra doença?", "Não tenho.", { keywords: ["diabetes", "doença"] })
  ],
  initial: {
    vars: { hr: 122, sbp: 92, dbp: 54, rr: 24, spo2: 96, temp: 39.4, gcs: 15, pain: 8, glucose: 128, perfusion: 0.55, effort: 0.4, wbc: 21500, hb: 12.4, plt: 118000, na: 135, k: 4.4, creat: 2.1, urea: 70, pcr: 260, lactate: 3.2, urine: 15, ph: 7.32, hco3: 18, be: -6 },
    flags: { rhythm: "taquicardia_sinusal", painVisual: "intensa", sweating: true, tremor: true, posture: "decubito_lateral" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Toxemiada, com calafrios, extremidades frias.", { better: [{ when: { ruleFired: "r-desobstrucao" }, text: "Menos toxemiada, sem calafrios." }] }),
    ex("e-giordano", "torax_posterior", "percussao", "Punho-percussão lombar esquerda muito dolorosa.", { label: "Punho-percussão lombar" }),
    ex("e-abdome", "abdome_qie", "palpacao", "Dor em flanco esquerdo, sem defesa ou sinais de peritonite.", {}),
    ex("e-perfusao", "membro_superior_d", "palpacao", "Pulso fino, enchimento capilar 3–4 s.", { better: [{ when: { path: "vars.sbp", op: "gte", value: 100 }, text: "Pulso cheio, enchimento capilar 2 s." }] }),
    ex("e-pulmao", "torax_anterior", "ausculta", "Murmúrio vesicular presente bilateralmente.", { sound: "murmurio_normal" })
  ],
  testResults: [
    { testId: "usg_abdome", variants: [{ text: "Laudo educativo: hidronefrose moderada à esquerda com ureter proximal dilatado; imagem sugestiva de cálculo de ~9 mm no ureter proximal. Rim direito normal." }] },
    { testId: "tc_abdome", variants: [{ text: "Laudo educativo (sem contraste, pela função renal): cálculo de 9 mm em ureter proximal esquerdo com hidronefrose e densificação perirrenal." }] },
    { testId: "urina_tipo1", variants: [{ text: "Leucocitúria intensa, nitrito positivo, hematúria." }] },
    { testId: "hemocultura", variants: [{ text: "Coletadas 2 amostras; resultado em 48–72 h." }] },
    { testId: "urocultura", variants: [{ text: "Coletada; resultado em 48–72 h." }] }
  ],
  highlightedActions: ["monitorizar", "acesso_venoso", "diurese_horaria", "solicitar_avaliacao_cirurgica"],
  rules: [
    { id: "r-volume", description: "Cristaloide melhora parcialmente a hipotensão", priority: 30, when: VOL(1500), repeat: "once", effects: [trend("sbp", 102, 900, "vol", 30), trend("dbp", 60, 900, "vol", 30), trend("hr", 110, 900, "vol", 30), trend("perfusion", 0.65, 900, "vol", 30)] },
    { id: "r-atb-parcial", description: "Antibiótico IV sem desobstrução: resposta incompleta (coleção sob pressão)", priority: 35, when: { all: [ATB, { elapsedSince: "drug:ceftriaxona", op: "gte", seconds: 1800 }, { not: DESOBSTRUCAO }] }, repeat: "once", effects: [obs("Febre persiste apesar do antibiótico: infecção em sistema coletor obstruído não se resolve sem drenagem.")] },
    { id: "r-urologia", description: "Urologia indica desobstrução urgente", priority: 50, when: { all: [DESOBSTRUCAO, IMAGEM] }, repeat: "once", effects: [staff("supervisor", "Urologista de plantão: pielonefrite obstrutiva com sepse. Indicação de desobstrução urgente (cateter duplo J ou nefrostomia percutânea) — sala liberada. O tratamento definitivo do cálculo fica para depois da infecção.")] },
    { id: "r-urologia-sem-imagem", description: "Urologia pede confirmação por imagem", priority: 49, when: { all: [DESOBSTRUCAO, { not: IMAGEM }] }, repeat: "once", effects: [staff("supervisor", "Urologista: preciso de uma imagem (USG à beira do leito ou TC sem contraste) para confirmar a obstrução antes de levar ao centro cirúrgico.")] },
    { id: "r-desobstrucao", description: "Antibiótico + volume + desobstrução indicada com imagem: estabilização", priority: 60, when: { all: [ATB, VOL(1500), DESOBSTRUCAO, IMAGEM] }, repeat: "once", effects: [trend("lactate", 1.8, 3600, "rec", 60), trend("temp", 38, 3600, "rec", 60), trend("hr", 98, 1800, "rec", 60), trend("urine", 40, 3600, "rec", 60), flag("tremor", false), flag("sweating", false), outcome("estabilizacao_parcial")] },
    { id: "r-piora", description: "Sem antibiótico IV e sem desobstrução, choque séptico", priority: 20, when: { all: [{ time: "gte", seconds: 3600 }, { not: ATB }] }, repeat: "once", effects: [trend("sbp", 76, 900, "piora", 20), trend("dbp", 42, 900, "piora", 20), trend("hr", 136, 900, "piora", 20), trend("lactate", 5.8, 1800, "piora", 20), trend("creat", 3.0, 3600, "piora", 20), flag("consciousness", "voz"), staff("enfermagem", "A pressão caiu mais e ela está sonolenta."), outcome("piora")] },
    { id: "r-piora-obstrucao", description: "Com antibiótico mas sem desobstrução por 90 min, deterioração", priority: 22, when: { all: [{ time: "gte", seconds: 5400 }, ATB, { not: DESOBSTRUCAO }] }, repeat: "once", effects: [trend("sbp", 84, 900, "piora2", 22), trend("lactate", 4.4, 1800, "piora2", 22), staff("enfermagem", "Ela continua febril e a pressão está caindo de novo."), outcome("piora")] },
    { id: "r-nora", description: "Noradrenalina mantém PAM enquanto infundida", priority: 45, when: { treatmentActive: "noradrenalina" }, repeat: "while", effects: [trend("sbp", 108, 300, "nora", 45), trend("dbp", 62, 300, "nora", 45)], onEnd: [{ type: "clearTrend", var: "sbp", slot: "nora" }, { type: "clearTrend", var: "dbp", slot: "nora" }] },
    { id: "r-obito", description: "Sem antibiótico, volume ou drenagem por 2 h: óbito (desfecho definido pelo caso)", priority: 100, when: { all: [{ time: "gte", seconds: 7200 }, { not: ATB }, { not: VOL(1000) }] }, repeat: "once", effects: [flag("pulse", false), flag("consciousness", "irresponsivo"), outcome("obito", true)] }
  ],
  diagnosis: { primary: "pielonefrite", accepted: ["pielonefrite", "itu_complicada"], differentials: ["choque_septico", "colecistite", "pancreatite", "apendicite"] },
  acceptedDestinations: ["centro_cirurgico", "uti"],
  outcomeNotes: "Pielonefrite com sepse após cólica renal e falha do antibiótico oral: obstrução ureteral até prova em contrário. Antibiótico IV e volume são necessários, mas a resolução depende da desobstrução urgente (duplo J ou nefrostomia), indicada após imagem.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Identificou cólica prévia, litíase e falha do antibiótico oral", evidence: { kind: "historyAsked", items: ["h-inicio", "h-calculo", "h-medicacoes"], minCount: 2 }, points: 10, severity: "critica", rationale: "Elementos que apontam obstrução infectada." },
    { id: "s-exame", domain: "historia", description: "Punho-percussão lombar e perfusão", evidence: { kind: "examDone", regions: ["torax_posterior", "membro_superior_d", "geral"], minCount: 2 }, points: 6, severity: "importante", rationale: "Foco e gravidade." },
    { id: "s-atb", domain: "priorizacao", description: "Antimicrobiano IV na primeira hora", evidence: { kind: "drugGiven", anyOf: ["ceftriaxona", "piperacilina_tazobactam"], withinSeconds: 3600 }, points: 14, severity: "critica", rationale: "Sepse: antimicrobiano precoce; falha recente de quinolona sugere resistência.", sourceIds: ["INT-SSC-2021", "BR-ILAS"] },
    { id: "s-volume", domain: "priorizacao", description: "Cristaloide para hipoperfusão", evidence: { kind: "drugGiven", anyOf: ["sf09", "ringer_lactato"], minTotal: { value: 1500, unit: "mL" }, withinSeconds: 5400 }, points: 8, severity: "importante", rationale: "~30 mL/kg com reavaliação.", sourceIds: ["INT-SSC-2021"] },
    { id: "s-imagem", domain: "exames", description: "Imagem precoce para pesquisar obstrução", evidence: { kind: "testOrdered", anyOf: ["usg_abdome", "tc_abdome"], withinSeconds: 3600 }, points: 10, severity: "critica", rationale: "Sepse urinária com suspeita de obstrução exige imagem urgente (controle de foco).", sourceIds: ["INT-SSC-2021"] },
    { id: "s-culturas", domain: "exames", description: "Hemoculturas e urocultura", evidence: { kind: "testOrdered", anyOf: ["hemocultura", "urocultura"] }, points: 4, severity: "importante", rationale: "Guiar ajuste do antimicrobiano." },
    { id: "s-exames-excesso", domain: "exames", description: "Exames dirigidos", evidence: { kind: "testsNotExcessive", maxUnjustified: 2, justified: ["usg_abdome", "tc_abdome", "hemocultura", "urocultura", "urina_tipo1", "hemograma", "funcao_renal", "eletrolitos", "gaso_venosa", "pcr", "coagulograma"] }, points: 4, severity: "menor", rationale: "Evitar contraste com creatinina elevada sem necessidade." },
    { id: "s-desobstrucao", domain: "tratamento", description: "Acionou urologia para desobstrução", evidence: { kind: "actionDone", anyOf: ["solicitar_avaliacao_cirurgica"], withinSeconds: 5400 }, points: 16, severity: "critica", rationale: "Sistema coletor obstruído e infectado: drenagem urgente (duplo J ou nefrostomia) é controle de foco.", sourceIds: ["INT-SSC-2021"] },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou após volume (PA, diurese, lactato)", evidence: { kind: "reassessAfter", after: ["sf09", "ringer_lactato"], reassess: ["monitorizacao_continua", "medir_pa", "diurese_horaria", "gaso_venosa"], withinSeconds: 3600 }, points: 8, severity: "importante", rationale: "Necessidade de vasopressor." },
    { id: "s-diurese", domain: "reavaliacao", description: "Monitorizou diurese", evidence: { kind: "actionDone", anyOf: ["diurese_horaria"] }, points: 2, severity: "menor", rationale: "Lesão renal aguda." },
    { id: "s-dx", domain: "destino", description: "Pielonefrite complicada/obstrutiva", evidence: { kind: "diagnosis", accepted: ["pielonefrite", "itu_complicada"] }, points: 6, severity: "importante", rationale: "Sepse de foco urinário com obstrução." },
    { id: "s-destino", domain: "destino", description: "Centro cirúrgico/hemodinâmica para desobstrução (ou UTI)", evidence: { kind: "disposition", accepted: ["centro_cirurgico", "uti"] }, points: 12, severity: "importante", rationale: "Drenagem urgente e monitorização intensiva." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Por que ela piorou apesar do antibiótico oral?" },
      { level: 2, text: "Ela teve cólica antes da febre. O que isso sugere?" },
      { level: 3, text: "Pus sob pressão no sistema coletor: o antibiótico sozinho não resolve." },
      { level: 4, text: "Sugestão explícita: antibiótico IV, cristaloide, culturas, USG ou TC sem contraste, acionar urologia para desobstrução urgente." }
    ],
    summary: "Mulher de 44 anos com litíase prévia, cólica renal há 5 dias e febre há 3, piora apesar de ciprofloxacino: pielonefrite obstrutiva com sepse.",
    pathophysiology: "A obstrução ureteral aumenta a pressão intrapélvica e favorece refluxo pielovenoso de bactérias e endotoxinas, causando bacteremia e sepse. O antibiótico tem penetração limitada no sistema obstruído; a drenagem reduz a pressão e remove o foco.",
    keyPoints: [
      "ITU + obstrução = emergência urológica (controle de foco).",
      "Suspeitar quando há cólica prévia, litíase conhecida, falha terapêutica ou sepse.",
      "USG à beira do leito ou TC sem contraste confirmam hidronefrose.",
      "Desobstrução urgente (duplo J ou nefrostomia); tratamento definitivo do cálculo depois."
    ],
    alternatives: ["Piperacilina-tazobactam em vez de ceftriaxona conforme risco de resistência.", "TC sem contraste ou USG."],
    oralRubric: [
      { id: "o1", concept: "Suspeita de obstrução", synonyms: ["obstrução", "obstrutiva", "hidronefrose", "cálculo"], weight: 2 },
      { id: "o2", concept: "Desobstrução urgente", synonyms: ["desobstrução", "duplo j", "nefrostomia", "drenagem"], weight: 3 },
      { id: "o3", concept: "Antibiótico IV e volume", synonyms: ["antibiótico", "ceftriaxona", "volume"], weight: 2 },
      { id: "o4", concept: "Imagem", synonyms: ["ultrassom", "usg", "tomografia"], weight: 1 }
    ],
    simplifications: ["O procedimento de desobstrução não é simulado; acionar a urologia com imagem confirmatória representa a decisão."]
  },
  references: ["INT-SSC-2021", "BR-ILAS", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 12, allowSexSwap: false, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Antibiótico, volume, USG, urologia e centro cirúrgico", commands: [ask(10, "h-inicio"), ask(20, "h-calculo"), act(40, "monitorizar"), act(50, "acesso_venoso"), act(150, "acesso_venoso"), test(250, "hemocultura"), rx(400, "ceftriaxona", "fa1g", 2000, "mg", "IV"), rx(420, "sf09", "bolsa1000", 2000, "mL", "IV", "infusao_volume", { durationMinutes: 40 }), test(500, "usg_abdome"), act(1800, "solicitar_avaliacao_cirurgica"), act(2500, "diurese_horaria"), dx(3000, "pielonefrite"), dest(3000, "centro_cirurgico")], runUntilSeconds: 4000, expect: [{ condition: { ruleFired: "r-desobstrucao" }, description: "estabilização" }, { condition: { not: { ruleFired: "r-piora-obstrucao" } }, description: "sem deterioração" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 7300, expect: [{ condition: { ruleFired: "r-piora" }, description: "choque" }, { condition: { ruleFired: "r-obito" }, description: "óbito definido pelo caso" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Só antibiótico e volume, sem imagem nem urologia", commands: [act(50, "acesso_venoso"), act(150, "acesso_venoso"), rx(400, "ceftriaxona", "fa1g", 2000, "mg", "IV"), rx(420, "sf09", "bolsa1000", 2000, "mL", "IV", "infusao_volume", { durationMinutes: 40 })], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-atb-parcial" }, description: "resposta incompleta" }, { condition: { ruleFired: "r-piora-obstrucao" }, description: "deterioração" }] },
    { id: "t-atraso", kind: "delay", description: "Urologia sem imagem: pede confirmação; imagem depois", commands: [act(50, "acesso_venoso"), act(150, "acesso_venoso"), rx(400, "ceftriaxona", "fa1g", 2000, "mg", "IV"), rx(420, "sf09", "bolsa1000", 2000, "mL", "IV", "infusao_volume", { durationMinutes: 40 }), act(500, "solicitar_avaliacao_cirurgica"), test(1500, "tc_abdome")], runUntilSeconds: 4000, expect: [{ condition: { ruleFired: "r-urologia-sem-imagem" }, description: "pede imagem" }, { condition: { ruleFired: "r-desobstrucao" }, description: "estabilização após imagem" }] },
    { id: "t-alternativa", kind: "alternative", description: "Piperacilina-tazobactam, TC e noradrenalina, destino UTI", commands: [act(50, "acesso_venoso"), act(150, "acesso_venoso"), rx(400, "piperacilina_tazobactam", "fa45", 4500, "mg", "IV"), rx(420, "ringer_lactato", "bolsa1000", 2000, "mL", "IV", "infusao_volume", { durationMinutes: 40 }), rx(600, "noradrenalina", "sol64", 1, "mg", "IV", "infusao", { rate: { value: 0.1, unit: "mcg/kg/min" } }), test(700, "tc_abdome"), act(1000, "solicitar_avaliacao_cirurgica"), dest(3000, "uti")], runUntilSeconds: 4500, expect: [{ condition: { ruleFired: "r-desobstrucao" }, description: "estabilização" }] }
  ]
};
