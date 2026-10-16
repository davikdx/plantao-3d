import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, outcome, oxygenResponse, rx, staff, test, trend } from "./helpers";

const ATB = { any: [{ drugGiven: "ceftriaxona" }, { drugGiven: "piperacilina_tazobactam" }] };
const VOL = (ml: number) => ({ any: [{ drugGiven: "sf09", minTotal: { value: ml, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: ml, unit: "mL" as const } }, { all: [{ drugGiven: "sf09", minTotal: { value: ml / 2, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: ml / 2, unit: "mL" as const } }] }] });
const NORA = { treatmentActive: "noradrenalina" };

export const C001: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C001",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Idosa confusa, febril e com pressão baixa",
  teachingTitle: "Choque séptico de foco urinário",
  group: "Reanimação, instabilidade e choque",
  specialties: ["Emergência", "Infectologia", "Terapia intensiva"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Reconhecer sepse com hipoperfusão (hipotensão, lactato, confusão)",
    "Coletar lactato e culturas sem atrasar o antimicrobiano",
    "Antimicrobiano na primeira hora e reposição volêmica guiada por reavaliação",
    "Iniciar vasopressor para PAM ≥ 65 mmHg quando o volume não basta",
    "Definir destino em terapia intensiva"
  ],
  keywords: ["febre", "confusão", "idosa", "urina", "pressão baixa", "infecção"],
  patient: {
    name: "Dona Benedita Cardoso",
    ageYears: 72,
    sex: "feminino",
    weightKg: 65,
    heightCm: 155,
    visual: { ageGroup: "idoso", sex: "feminino", skinTone: 6, hairStyle: "coque", hairColor: "grisalho", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Senhora de 72 anos trazida pela filha por febre e confusão desde ontem. Chegou na cadeira de rodas, sonolenta e fria.",
  communication: "limitada",
  informants: [{ id: "filha", name: "Rosângela", role: "Filha" }],
  history: [
    hi("h-queixa", "queixa", "O que está acontecendo com ela?", [{ source: "filha", text: "Desde ontem está com febre, muito fraca e hoje acordou falando coisa sem sentido." }, { source: "paciente", text: "Tô… ruim… frio…" }], ["acontecendo", "sentindo"]),
    hi("h-urina", "fatores_associados", "Tem queixa ao urinar ou dor nas costas?", [{ source: "filha", text: "Há uns 4 dias ela reclamava de ardência para urinar e ontem de dor do lado direito das costas." }, { source: "paciente", text: "Arde… pra urinar…" }], ["urina", "ardência", "costas", "lombar"]),
    hi("h-antecedentes", "antecedentes", "Que doenças ela tem?", [{ source: "filha", text: "Diabetes e pressão alta. Teve infecção de urina várias vezes." }], ["doença"]),
    hi("h-medicacoes", "medicacoes", "Que remédios ela usa?", [{ source: "filha", text: "Metformina, losartana e hidroclorotiazida. Não usou antibiótico recentemente." }], ["remédio", "antibiótico"]),
    hi("h-alergias", "alergias", "Ela tem alergia a algum remédio?", [{ source: "filha", text: "Não tem alergia." }], ["alergia"]),
    hi("h-diurese", "alimentacao_eliminacoes", "Ela tem urinado e se alimentado?", [{ source: "filha", text: "Urinou bem pouco desde ontem e não quis comer." }], ["urinou", "comer", "xixi"]),
    hi("h-internacao", "cirurgias", "Esteve internada ou usou sonda recentemente?", [{ source: "filha", text: "Não, a última internação foi há 2 anos." }], ["internada", "sonda"])
  ],
  initial: {
    vars: { hr: 118, sbp: 84, dbp: 48, rr: 26, spo2: 94, temp: 38.9, gcs: 13, pain: 3, glucose: 186, perfusion: 0.45, effort: 1, etco2: 30, lactate: 4.4, ph: 7.29, pco2: 30, hco3: 15, be: -9, po2: 74, na: 136, k: 4.6, cl: 104, creat: 1.9, urea: 74, hb: 11.8, ht: 36, wbc: 19400, plt: 132000, pcr: 214, inr: 1.3, bili: 1.1, urine: 15 },
    flags: { rhythm: "taquicardia_sinusal", consciousness: "voz", speech: "palavras", posture: "supino", sweating: false, pallor: true },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Sonolenta, desorientada no tempo, pele moteada nos joelhos, extremidades frias.", { better: [{ when: { ruleFired: "r-estabiliza" }, text: "Mais desperta, sem moteamento." }] }),
    ex("e-perfusao", "membro_inferior_d", "inspecao", "Livedo/moteamento em joelhos; tempo de enchimento capilar 5 s.", { better: [{ when: { ruleFired: "r-estabiliza" }, text: "Sem moteamento; enchimento capilar 2–3 s." }] }),
    ex("e-giordano", "torax_posterior", "percussao", "Punho-percussão lombar dolorosa à direita (Giordano positivo).", { label: "Punho-percussão lombar" }),
    ex("e-abdome", "abdome_qsd", "palpacao", "Abdome flácido, doloroso em flanco direito, sem peritonismo.", {}),
    ex("e-torax", "torax_anterior", "ausculta", "Murmúrio presente, sem estertores.", { sound: "murmurio_normal", better: [{ when: { drugGiven: "sf09", minTotal: { value: 4000, unit: "mL" } }, text: "Estertores finos em bases bilaterais (sobrecarga volêmica)." }] }),
    ex("e-coracao", "coracao", "ausculta", "Bulhas taquicárdicas, sem sopros.", { sound: "bulhas_normais" }),
    ex("e-neuro", "neurologico", "especial", "Glasgow 13 (confusa), sem déficit focal, sem rigidez de nuca.", {})
  ],
  testResults: [
    { testId: "urina_tipo1", variants: [{ text: "Leucocitúria intensa, nitrito positivo, bacteriúria acentuada, hematúria discreta." }] },
    { testId: "urocultura", variants: [{ text: "Em andamento (resultado em 48–72 h)." }] },
    { testId: "hemocultura", variants: [{ text: "Coletadas 2 amostras; resultado em 48–72 h." }] },
    { testId: "rx_torax", variants: [{ text: "Laudo educativo: sem consolidações; área cardíaca normal." }] },
    { testId: "usg_abdome", variants: [{ text: "Laudo educativo: rim direito com sinais inflamatórios, sem dilatação pielocalicial ou cálculo obstrutivo." }] },
    { testId: "pocus_cardiaco", variants: [{ when: { ruleFired: "r-volume2" }, text: "VCI com variação respiratória reduzida após volume; função sistólica preservada." }, { text: "Ventrículo esquerdo hiperdinâmico; VCI colabável (provável resposta a volume)." }] }
  ],
  highlightedActions: ["monitorizar", "acesso_venoso", "diurese_horaria", "o2_cateter"],
  rules: [
    oxygenResponse(96, 120),
    { id: "r-volume1", description: "1 L de cristaloide: melhora parcial e transitória", priority: 20, when: VOL(1000), repeat: "once", effects: [trend("sbp", 92, 600, "vol1", 20, 3600), trend("dbp", 52, 600, "vol1", 20, 3600), trend("hr", 110, 600, "vol1", 20, 3600)] },
    { id: "r-volume2", description: "≈30 mL/kg: pressão melhora, mas PAM segue < 65 mmHg (choque)", priority: 21, when: VOL(1900), repeat: "once", effects: [trend("sbp", 90, 900, "vol2", 21), trend("dbp", 50, 900, "vol2", 21), trend("hr", 104, 900, "vol2", 21), trend("perfusion", 0.6, 1800, "vol2", 21), trend("urine", 30, 3600, "vol2", 21)] },
    { id: "r-sobrecarga", description: "Volume excessivo sem reavaliação: congestão pulmonar", priority: 90, when: VOL(4000), repeat: "once", effects: [trend("spo2", 88, 900, "congestao", 60), trend("rr", 30, 900, "congestao", 60), staff("enfermagem", "Ela está mais cansada para respirar e a saturação caiu."), outcome("complicacao")] },
    { id: "r-nora", description: "Noradrenalina eleva PAM enquanto infundida", priority: 50, when: NORA, repeat: "while", effects: [trend("sbp", 112, 300, "nora", 50), trend("dbp", 64, 300, "nora", 50), trend("perfusion", 0.75, 900, "nora", 45)], onEnd: [{ type: "clearTrend", var: "sbp", slot: "nora" }, { type: "clearTrend", var: "dbp", slot: "nora" }] },
    { id: "r-atb", description: "Antimicrobiano adequado: controle progressivo da infecção", priority: 40, when: ATB, repeat: "once", effects: [trend("temp", 37.4, 7200, "atb", 40), trend("lactate", 1.6, 7200, "atb", 40), trend("wbc", 14000, 20000, "atb", 40)] },
    { id: "r-estabiliza", description: "Com antimicrobiano + volume + PAM ≥ 65 por algum tempo, perfusão e consciência melhoram", priority: 55, when: { all: [ATB, VOL(1900), { path: "vars.sbp", op: "gte", value: 100 }, { elapsedSince: "drug:ceftriaxona", op: "gte", seconds: 1800 }] }, repeat: "once", effects: [flag("consciousness", "alerta"), flag("speech", "frases"), { type: "changeCommunication", state: "normal" }, trend("gcs", 15, 600, "rec", 50), trend("urine", 50, 3600, "rec", 55), trend("hr", 96, 1800, "rec", 55), flag("pallor", false), outcome("estabilizacao_parcial")] },
    { id: "r-estabiliza-pt", description: "Idem, para piperacilina-tazobactam", priority: 55, when: { all: [{ drugGiven: "piperacilina_tazobactam" }, VOL(1900), { path: "vars.sbp", op: "gte", value: 100 }, { elapsedSince: "drug:piperacilina_tazobactam", op: "gte", seconds: 1800 }] }, repeat: "once", effects: [flag("consciousness", "alerta"), flag("speech", "frases"), { type: "changeCommunication", state: "normal" }, trend("gcs", 15, 600, "rec", 50), trend("urine", 50, 3600, "rec", 55), flag("pallor", false), outcome("estabilizacao_parcial")] },
    { id: "r-piora-sem-atb", description: "Sem antimicrobiano na primeira hora, disfunção orgânica progride", priority: 10, when: { all: [{ time: "gte", seconds: 3600 }, { not: ATB }] }, repeat: "once", effects: [trend("lactate", 6.8, 3600, "doenca", 10), trend("sbp", 72, 2400, "doenca", 10), trend("dbp", 40, 2400, "doenca", 10), trend("gcs", 10, 2400, "doenca", 10), trend("plt", 80000, 7200, "doenca", 10), trend("creat", 2.8, 7200, "doenca", 10), flag("consciousness", "dor"), { type: "changeCommunication", state: "incapaz" }, staff("enfermagem", "Ela não responde mais direito e a diurese parou."), outcome("piora")] },
    { id: "r-obito", description: "Sem antimicrobiano e sem suporte por 2 h, o caso define óbito", priority: 100, when: { all: [{ time: "gte", seconds: 7200 }, { not: ATB }, { not: NORA }] }, repeat: "once", effects: [flag("pulse", false), flag("rhythm", "assistolia"), { type: "setValue", var: "hr", value: 0 }, outcome("obito", true)] }
  ],
  diagnosis: { primary: "choque_septico", accepted: ["choque_septico"], differentials: ["sepse", "pielonefrite", "choque_hipovolemico", "choque_cardiogenico", "iamssst", "meningite_bacteriana"] },
  acceptedDestinations: ["uti"],
  outcomeNotes: "Volume ≈30 mL/kg melhora mas não normaliza a PAM: o caso exige noradrenalina. Antimicrobiano precoce leva a estabilização progressiva. Sem antimicrobiano por 1 h, disfunção orgânica progride; sem antimicrobiano nem vasopressor por 2 h, o autor define óbito. Volume excessivo (≥ 4 L) causa congestão.",
  scoring: [
    { id: "s-hist-foco", domain: "historia", description: "Identificou o foco provável (sintomas urinários, lombalgia)", evidence: { kind: "historyAsked", items: ["h-urina"], minCount: 1 }, points: 8, severity: "importante", rationale: "Foco orienta antimicrobiano e controle de foco." },
    { id: "s-hist-risco", domain: "historia", description: "Antecedentes, alergias e uso recente de antibiótico", evidence: { kind: "historyAsked", items: ["h-antecedentes", "h-alergias", "h-medicacoes", "h-internacao"], minCount: 2 }, points: 6, severity: "importante", rationale: "Alergia e risco de resistência mudam a escolha do antimicrobiano." },
    { id: "s-exame", domain: "historia", description: "Avaliou perfusão periférica e punho-percussão lombar", evidence: { kind: "examDone", regions: ["geral", "membro_inferior_d", "torax_posterior"], minCount: 2 }, points: 6, severity: "importante", rationale: "Moteamento e tempo de enchimento capilar indicam hipoperfusão." },
    { id: "s-atb-1h", domain: "priorizacao", description: "Antimicrobiano IV na primeira hora", evidence: { kind: "drugGiven", anyOf: ["ceftriaxona", "piperacilina_tazobactam"], withinSeconds: 3600 }, points: 14, severity: "critica", rationale: "Em possível choque séptico, antimicrobiano idealmente em até 1 hora.", alternatives: "Escolha conforme foco, gravidade e protocolo local; ceftriaxona ou piperacilina-tazobactam aceitas.", sourceIds: ["INT-SSC-2021", "BR-ILAS"] },
    { id: "s-volume", domain: "priorizacao", description: "Cristaloide ~30 mL/kg nas primeiras 3 horas", evidence: { kind: "drugGiven", anyOf: ["sf09", "ringer_lactato"], minTotal: { value: 1500, unit: "mL" }, withinSeconds: 10800 }, points: 8, severity: "importante", rationale: "Sugestão de 30 mL/kg em hipoperfusão induzida por sepse, com reavaliação.", sourceIds: ["INT-SSC-2021"] },
    { id: "s-lactato", domain: "exames", description: "Lactato (gasometria) na primeira hora", evidence: { kind: "testOrdered", anyOf: ["gaso_venosa", "gaso_arterial"], withinSeconds: 3600 }, points: 5, severity: "importante", rationale: "Lactato ≥ 2–4 mmol/L estratifica gravidade e guia reavaliação.", sourceIds: ["BR-ILAS"] },
    { id: "s-culturas", domain: "exames", description: "Hemoculturas (e urocultura) sem atrasar o antimicrobiano", evidence: { kind: "testOrdered", anyOf: ["hemocultura", "urocultura"] }, points: 5, severity: "importante", rationale: "Coletar antes do antimicrobiano quando isso não o atrasar.", sourceIds: ["BR-ILAS"] },
    { id: "s-exames-excesso", domain: "exames", description: "Exames guiados pela hipótese", evidence: { kind: "testsNotExcessive", maxUnjustified: 2, justified: ["gaso_venosa", "gaso_arterial", "hemocultura", "urocultura", "urina_tipo1", "hemograma", "funcao_renal", "eletrolitos", "coagulograma", "hepatograma", "pcr", "usg_abdome", "pocus_cardiaco", "rx_torax", "ecg12"] }, points: 5, severity: "menor", rationale: "Investigação do foco e das disfunções." },
    { id: "s-nora", domain: "tratamento", description: "Noradrenalina para PAM ≥ 65 mmHg após volume", evidence: { kind: "drugGiven", anyOf: ["noradrenalina"] }, points: 12, severity: "critica", rationale: "Hipotensão persistente após volume define choque séptico; vasopressor com alvo de PAM 65 mmHg.", sourceIds: ["INT-SSC-2021"] },
    { id: "s-sobrecarga", domain: "tratamento", description: "Falha: volume excessivo sem reavaliação (≥ 4 L)", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-sobrecarga" } }, points: 8, penalty: true, severity: "importante", rationale: "Volume deve ser guiado por resposta e sinais de congestão." },
    { id: "s-acesso", domain: "tratamento", description: "Acesso venoso calibroso", evidence: { kind: "actionDone", anyOf: ["acesso_venoso", "acesso_central", "acesso_io"] }, points: 5, severity: "importante", rationale: "Noradrenalina pode iniciar em veia periférica calibrosa enquanto se providencia acesso central." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou após volume (PA, perfusão, lactato ou POCUS)", evidence: { kind: "reassessAfter", after: ["sf09", "ringer_lactato"], reassess: ["monitorizacao_continua", "medir_pa", "geral", "membro_inferior_d", "gaso_venosa", "pocus_cardiaco"], withinSeconds: 3600 }, points: 6, severity: "importante", rationale: "Responsividade a volume e sinais de congestão." },
    { id: "s-diurese", domain: "reavaliacao", description: "Monitorizou diurese", evidence: { kind: "actionDone", anyOf: ["diurese_horaria"] }, points: 4, severity: "menor", rationale: "Débito urinário é marcador de perfusão." },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de choque séptico", evidence: { kind: "diagnosis", accepted: ["choque_septico"] }, points: 4, severity: "importante", rationale: "Vasopressor para PAM ≥ 65 + lactato > 2 após volume." },
    { id: "s-destino", domain: "destino", description: "UTI", evidence: { kind: "disposition", accepted: ["uti"] }, points: 6, severity: "importante", rationale: "Choque séptico com vasopressor exige terapia intensiva." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Quais sinais indicam que os órgãos estão mal perfundidos?" },
      { level: 2, text: "Qual o foco provável? O que mais atrasa a melhora: exame ou antimicrobiano?" },
      { level: 3, text: "Vasodilatação e disfunção endotelial: volume ajuda, mas pode não restaurar a PAM." },
      { level: 4, text: "Sugestão explícita: lactato e culturas, antimicrobiano na 1ª hora, cristaloide ~30 mL/kg com reavaliação e noradrenalina para PAM ≥ 65." }
    ],
    summary: "Idosa com pielonefrite, hipotensão, confusão, oligúria e lactato 4,4 mmol/L: choque séptico de foco urinário.",
    pathophysiology: "A resposta desregulada à infecção causa vasodilatação, aumento da permeabilidade capilar e disfunção microcirculatória. Hipovolemia relativa e vasoplegia reduzem a PAM; a hipoperfusão eleva o lactato e gera disfunções (renal, neurológica, hematológica). Volume restaura a pré-carga, mas a vasoplegia frequentemente exige vasopressor.",
    keyPoints: [
      "Sepse é disfunção orgânica por resposta desregulada à infecção; choque séptico exige vasopressor para PAM ≥ 65 e lactato > 2 após volume.",
      "Antimicrobiano na primeira hora em possível choque séptico.",
      "Cristaloide ~30 mL/kg nas primeiras horas, sempre com reavaliação.",
      "Noradrenalina é o vasopressor usual; pode ser iniciada em veia periférica calibrosa.",
      "Controle de foco (imagem para afastar obstrução urinária)."
    ],
    alternatives: ["Ringer lactato ou SF 0,9%.", "Ceftriaxona ou piperacilina-tazobactam conforme risco de resistência e protocolo local."],
    oralRubric: [
      { id: "o1", concept: "Reconhecer choque séptico", synonyms: ["choque séptico", "sepse", "hipoperfusão"], weight: 2 },
      { id: "o2", concept: "Antimicrobiano precoce", synonyms: ["antibiótico", "antimicrobiano", "ceftriaxona"], weight: 3 },
      { id: "o3", concept: "Volume com reavaliação", synonyms: ["volume", "cristaloide", "30 ml"], weight: 2 },
      { id: "o4", concept: "Vasopressor", synonyms: ["noradrenalina", "vasopressor", "pam"], weight: 2 },
      { id: "o5", concept: "Lactato e culturas", synonyms: ["lactato", "cultura", "hemocultura"], weight: 1 }
    ],
    simplifications: ["Tempos de melhora (τ) e o óbito em 2 h sem tratamento são parâmetros didáticos.", "O simulador não modela resistência bacteriana; ambos os antimicrobianos do catálogo são tratados como adequados."]
  },
  references: ["INT-SSC-2021", "BR-ILAS", "BR-SAMU-SAV", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 8, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    {
      id: "t-aceitavel",
      kind: "acceptable",
      description: "Monitor, acesso, lactato/culturas, ceftriaxona, SF 2 L e noradrenalina",
      commands: [act(5, "monitorizar"), act(60, "acesso_venoso"), act(160, "acesso_venoso"), ask(170, "h-urina"), test(260, "gaso_venosa"), test(265, "hemocultura"), rx(600, "ceftriaxona", "fa1g", 2000, "mg", "IV"), rx(620, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 30 }), rx(2500, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 30 }), rx(4400, "noradrenalina", "sol64", 1, "mg", "IV", "infusao", { rate: { value: 0.1, unit: "mcg/kg/min" } }), act(4500, "diurese_horaria"), dx(6500, "choque_septico"), dest(6500, "uti")],
      runUntilSeconds: 7500,
      expect: [{ condition: { ruleFired: "r-estabiliza" }, description: "estabilização" }, { condition: { path: "vars.sbp", op: "gte", value: 100 }, description: "PAS ≥ 100 com noradrenalina" }, { condition: { not: { ruleFired: "r-piora-sem-atb" } }, description: "sem piora" }]
    },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem tratamento", commands: [], runUntilSeconds: 7300, expect: [{ condition: { ruleFired: "r-piora-sem-atb" }, description: "piora" }, { condition: { ruleFired: "r-obito" }, description: "óbito definido pelo caso" }] },
    {
      id: "t-inadequada",
      kind: "inadequate",
      description: "Só volume (5 L) sem antimicrobiano nem vasopressor",
      commands: [act(5, "acesso_venoso"), act(100, "acesso_venoso"), rx(200, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 20 }), rx(1500, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 20 }), rx(2800, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 20 }), rx(4100, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 20 }), rx(5400, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 20 })],
      runUntilSeconds: 7000,
      expect: [{ condition: { ruleFired: "r-sobrecarga" }, description: "congestão" }, { condition: { ruleFired: "r-piora-sem-atb" }, description: "piora sem antimicrobiano" }]
    },
    {
      id: "t-atraso",
      kind: "delay",
      description: "Antimicrobiano só após 90 min",
      commands: [act(5, "acesso_venoso"), act(100, "acesso_venoso"), rx(200, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 30 }), rx(2200, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 30 }), rx(5400, "ceftriaxona", "fa1g", 2000, "mg", "IV"), rx(5500, "noradrenalina", "sol64", 1, "mg", "IV", "infusao", { rate: { value: 0.1, unit: "mcg/kg/min" } })],
      runUntilSeconds: 9000,
      expect: [{ condition: { ruleFired: "r-piora-sem-atb" }, description: "piora pelo atraso" }, { condition: { not: { ruleFired: "r-obito" } }, description: "sem óbito" }]
    },
    {
      id: "t-alternativa",
      kind: "alternative",
      description: "Piperacilina-tazobactam e Ringer lactato",
      commands: [act(5, "acesso_venoso"), act(100, "acesso_venoso"), rx(600, "piperacilina_tazobactam", "fa45", 4500, "mg", "IV"), rx(620, "ringer_lactato", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 30 }), rx(2500, "ringer_lactato", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 30 }), rx(4400, "noradrenalina", "sol64", 1, "mg", "IV", "infusao", { rate: { value: 0.1, unit: "mcg/kg/min" } })],
      runUntilSeconds: 7500,
      expect: [{ condition: { ruleFired: "r-estabiliza-pt" }, description: "estabilização" }]
    }
  ]
};
