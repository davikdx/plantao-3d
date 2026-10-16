import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const OCI = { drugGiven: "ocitocina" };
const UTEROTONICO = { any: [OCI, { drugGiven: "misoprostol" }, { drugGiven: "metilergometrina" }] };
const MASSAGEM = { actionCompleted: "massagem_uterina" };
const ATX = { drugGiven: "acido_tranexamico" };
const VOL = (ml: number) => ({ any: [{ drugGiven: "sf09", minTotal: { value: ml, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: ml, unit: "mL" as const } }] });

export const C076: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C076",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Puérpera com sangramento que não para",
  teachingTitle: "Hemorragia pós-parto por atonia uterina",
  group: "Obstetrícia e ginecologia",
  specialties: ["Obstetrícia", "Emergência"],
  environment: "obstetricia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Reconhecer HPP e estimar gravidade pelo índice de choque",
    "Acionar ajuda e iniciar medidas simultâneas (acessos, monitor, uterotônico, massagem)",
    "Usar ocitocina como primeira linha e ácido tranexâmico precoce",
    "Repor volume e hemocomponentes conforme resposta",
    "Investigar as causas (4 Ts) e escalonar"
  ],
  keywords: ["sangramento", "pós-parto", "puérpera", "útero", "hemorragia"],
  patient: {
    name: "Aline Souza",
    ageYears: 28,
    sex: "feminino",
    weightKg: 70,
    heightCm: 162,
    pregnancyWeeks: 40,
    visual: { ageGroup: "adulto", sex: "feminino", skinTone: 5, hairStyle: "coque", hairColor: "preto", build: "medio", pregnancyTrimester: 1 }
  },
  briefing: "Centro obstétrico de hospital regional. Parto vaginal há 35 minutos (recém-nascido de 4,1 kg, trabalho de parto prolongado com ocitocina). A técnica de enfermagem chama: \"o sangramento está aumentando, já trocamos o forro duas vezes\".",
  communication: "normal",
  informants: [{ id: "tec", name: "Técnica Sandra", role: "Técnica de enfermagem do centro obstétrico" }],
  history: [
    h("h-queixa", "queixa", "Como a senhora está se sentindo?", "Tô ficando tonta… e com frio. Sinto o sangue escorrendo.", { keywords: ["sentindo"] }),
    hi("h-parto", "gestacao", "Como foi o parto e a dequitação?", [{ source: "tec", text: "Trabalho de parto longo com ocitocina, bebê grande de 4,1 kg. A placenta saiu completa às 14h05, aparentemente íntegra." }, { source: "paciente", text: "Foi muito demorado… o bebê era grande." }], ["parto", "placenta", "dequitação"]),
    hi("h-perda", "sinais_alarme", "Quanto já sangrou?", [{ source: "tec", text: "Pelo forro e pela bolsa coletora, estimo uns 900 mL até agora." }], ["sangrou", "perda", "quanto"]),
    h("h-antecedentes", "antecedentes", "Tem pressão alta, problema de coagulação ou outra doença?", "Não, a pressão sempre foi boa no pré-natal. Nunca tive problema de sangramento.", { keywords: ["pressão", "coagulação", "doença"] }),
    h("h-alergias", "alergias", "Tem alergia a algum remédio?", "Não."),
    h("h-gestas", "ginecologico", "É o primeiro filho?", "É o terceiro. Os outros dois foram parto normal sem problema.")
  ],
  initial: {
    vars: { hr: 118, sbp: 94, dbp: 58, rr: 22, spo2: 97, temp: 36.3, gcs: 15, pain: 3, glucose: 102, perfusion: 0.6, effort: 0.6, bleeding: 60, hb: 9.4, ht: 28, plt: 168000, inr: 1.1, lactate: 2.6, urine: 20 },
    flags: { rhythm: "taquicardia_sinusal", bleedingVisible: true, pallor: true, sweating: true, posture: "litotomia", painVisual: "leve" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Pálida, sudoreica, ansiosa; sangramento vaginal ativo em moderada quantidade.", { better: [{ when: { ruleFired: "r-controle" }, text: "Corada, sangramento vaginal discreto." }] }),
    ex("e-utero", "abdome_qid", "palpacao", "Útero amolecido, acima da cicatriz umbilical (atonia). Ao comprimir, sai grande quantidade de sangue e coágulos.", { label: "Fundo uterino", better: [{ when: { ruleFired: "r-controle" }, text: "Útero contraído, firme (globo de segurança de Pinard), 2 cm abaixo da cicatriz umbilical." }] }),
    ex("e-trajeto", "pelve", "inspecao", "Laceração perineal de 1º grau suturada, sem sangramento ativo; colo sem lacerações visíveis à revisão.", { label: "Revisão do trajeto" }),
    ex("e-perfusao", "membro_superior_d", "palpacao", "Pulso fino e rápido, extremidades frias, enchimento capilar 4 s.", { better: [{ when: { path: "vars.sbp", op: "gte", value: 100 }, text: "Pulso cheio, enchimento capilar 2 s." }] }),
    ex("e-torax", "torax_anterior", "ausculta", "Murmúrio vesicular presente bilateralmente.", { sound: "murmurio_normal" })
  ],
  testResults: [{ testId: "usg_obstetrica", variants: [{ text: "Laudo educativo: cavidade uterina sem restos ovulares evidentes; útero aumentado." }] }],
  highlightedActions: ["chamar_ajuda", "acesso_venoso", "monitorizar", "massagem_uterina", "diurese_horaria", "elevar_mmii"],
  rules: [
    { id: "r-sangra", description: "Sem controle, perda continua e o choque progride", priority: 5, when: { all: [{ time: "gte", seconds: 300 }, { not: UTEROTONICO }] }, repeat: "once", effects: [trend("sbp", 72, 900, "doenca", 10), trend("dbp", 40, 900, "doenca", 10), trend("hr", 138, 900, "doenca", 10), trend("perfusion", 0.35, 900, "doenca", 10), trend("hb", 6.8, 1800, "doenca", 10), trend("lactate", 5.5, 1800, "doenca", 10), flag("consciousness", "voz"), staff("acompanhante", "Ela está muito pálida e sonolenta!"), outcome("piora")] },
    { id: "r-pcr", description: "Hemorragia maciça sem uterotônico nem volume: parada (desfecho definido pelo caso)", priority: 100, when: { all: [{ time: "gte", seconds: 2700 }, { not: UTEROTONICO }, { not: VOL(1000) }] }, repeat: "once", effects: [flag("pulse", false), flag("rhythm", "taquicardia_sinusal"), flag("consciousness", "irresponsivo"), staff("enfermagem", "Ela não responde e não sinto pulso!"), outcome("parada", true)] },
    { id: "r-massagem", description: "Massagem uterina reduz o sangramento temporariamente", priority: 30, when: MASSAGEM, repeat: { everySeconds: 300 }, effects: [trend("bleeding", 25, 60, "mass", 30, 600), obs("Durante a massagem bimanual o útero endurece e o sangramento diminui.")] },
    { id: "r-controle", description: "Ocitocina (± massagem) contrai o útero e controla a hemorragia", priority: 50, when: { all: [OCI, { elapsedSince: "drug:ocitocina", op: "gte", seconds: 180 }] }, repeat: "once", effects: [trend("bleeding", 4, 300, "oci", 50), flag("bleedingVisible", false), trend("hr", 104, 900, "oci", 40), outcome("estabilizacao_parcial")] },
    { id: "r-controle-2a-linha", description: "Misoprostol ou metilergometrina sem ocitocina: controle parcial e mais lento", priority: 45, when: { all: [{ any: [{ drugGiven: "misoprostol" }, { drugGiven: "metilergometrina" }] }, { not: OCI }, { time: "gte", seconds: 600 }] }, repeat: "once", effects: [trend("bleeding", 15, 900, "seg", 45), outcome("estabilizacao_parcial")] },
    { id: "r-atx", description: "Ácido tranexâmico reduz sangramento residual", priority: 55, when: { all: [ATX, { ruleFired: "r-controle" }] }, repeat: "once", effects: [trend("bleeding", 1, 600, "atx", 55)] },
    { id: "r-volume", description: "Cristaloide restaura parcialmente a pressão", priority: 35, when: VOL(1000), repeat: "once", effects: [trend("sbp", 100, 600, "vol", 35), trend("dbp", 60, 600, "vol", 35), trend("perfusion", 0.7, 600, "vol", 35), trend("hb", 8.6, 1200, "vol", 35)] },
    { id: "r-ch", description: "Concentrado de hemácias melhora oxigenação tecidual", priority: 60, when: { drugGiven: "concentrado_hemacias", minTotal: { value: 250, unit: "mL" } }, repeat: "once", effects: [trend("hb", 9.2, 1800, "ch", 60), trend("lactate", 1.8, 3600, "ch", 60), trend("perfusion", 0.85, 1200, "ch", 60)] },
    { id: "r-recupera", description: "Sangramento controlado + volume: estabilização", priority: 65, when: { all: [{ ruleFired: "r-controle" }, VOL(1000)] }, repeat: "once", effects: [trend("sbp", 110, 900, "rec", 65), trend("hr", 96, 900, "rec", 65), flag("consciousness", "alerta"), flag("pallor", false), flag("sweating", false), outcome("melhora")] },
    { id: "r-recidiva", description: "Ocitocina em bolus isolado sem manutenção: recidiva da atonia aos 30 min", priority: 70, when: { all: [{ elapsedSince: "drug:ocitocina", op: "gte", seconds: 1800 }, { not: { treatmentActive: "ocitocina" } }, { not: { drugGiven: "misoprostol" } }, { not: ATX }] }, repeat: "once", effects: [trend("bleeding", 30, 300, "recidiva", 70, 1200), flag("bleedingVisible", true), staff("enfermagem", "O sangramento voltou a aumentar!"), obs("Útero novamente amolecido.")] }
  ],
  diagnosis: { primary: "hpp_atonia", accepted: ["hpp_atonia"], differentials: ["hpp_trauma", "retencao_placentaria", "coagulopatia", "choque_hipovolemico"] },
  acceptedDestinations: ["uti", "internacao_enfermaria"],
  outcomeNotes: "Ocitocina + massagem controlam a atonia; ácido tranexâmico e manutenção de uterotônico evitam recidiva; volume e hemácias corrigem o choque. Sem uterotônico, o choque progride; sem uterotônico nem volume, parada aos 45 min (didático).",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Estimou perda e investigou fatores de risco (parto prolongado, macrossomia, ocitocina)", evidence: { kind: "historyAsked", items: ["h-perda", "h-parto"], minCount: 2 }, points: 8, severity: "importante", rationale: "Fatores de risco para atonia e estimativa de gravidade." },
    { id: "s-exame-utero", domain: "historia", description: "Palpou o fundo uterino e revisou o trajeto (4 Ts)", evidence: { kind: "examDone", regions: ["abdome_qid", "pelve"], minCount: 2 }, points: 12, severity: "critica", rationale: "Tônus, Trauma, Tecido, Trombina: atonia é a causa mais comum.", sourceIds: ["BR-HPP-OPAS"] },
    { id: "s-ajuda", domain: "priorizacao", description: "Chamou ajuda", evidence: { kind: "actionDone", anyOf: ["chamar_ajuda"], withinSeconds: 120 }, points: 5, severity: "importante", rationale: "HPP exige equipe e ações simultâneas." },
    { id: "s-acessos", domain: "priorizacao", description: "Dois acessos venosos calibrosos", evidence: { kind: "stateAtEnd", when: { actionCompleted: "acesso_venoso", count: 2 } }, points: 5, severity: "importante", rationale: "Permite volume e hemocomponentes rapidamente." },
    { id: "s-monitor", domain: "priorizacao", description: "Monitorização", evidence: { kind: "actionDone", anyOf: ["monitorizar"], withinSeconds: 300 }, points: 5, severity: "importante", rationale: "Índice de choque (FC/PAS) guia gravidade." },
    { id: "s-ocitocina", domain: "tratamento", description: "Ocitocina em até 5 minutos", evidence: { kind: "drugGiven", anyOf: ["ocitocina"], withinSeconds: 300 }, points: 12, severity: "critica", rationale: "Primeira linha na HPP por atonia.", sourceIds: ["BR-HPP-OPAS", "BR-GESTACAO"] },
    { id: "s-massagem", domain: "tratamento", description: "Massagem uterina bimanual", evidence: { kind: "actionDone", anyOf: ["massagem_uterina"] }, points: 6, severity: "importante", rationale: "Medida mecânica imediata enquanto o uterotônico age." },
    { id: "s-atx", domain: "tratamento", description: "Ácido tranexâmico 1 g IV (até 3 h do parto)", evidence: { kind: "drugGiven", anyOf: ["acido_tranexamico"], withinSeconds: 10800 }, points: 6, severity: "importante", rationale: "Reduz mortalidade por sangramento quando dado precocemente.", sourceIds: ["BR-HPP-OPAS"] },
    { id: "s-volume", domain: "tratamento", description: "Reposição volêmica inicial com cristaloide", evidence: { kind: "drugGiven", anyOf: ["sf09", "ringer_lactato"], minTotal: { value: 1000, unit: "mL" } }, points: 6, severity: "importante", rationale: "Restaurar perfusão enquanto se controla o sangramento." },
    { id: "s-exames", domain: "exames", description: "Hemograma/coagulograma e prova cruzada", evidence: { kind: "testOrdered", anyOf: ["hemograma", "coagulograma"] }, points: 8, severity: "importante", rationale: "Orientam hemocomponentes; não devem atrasar o tratamento." },
    { id: "s-exames-excesso", domain: "exames", description: "Sem exames que atrasem o controle", evidence: { kind: "testsNotExcessive", maxUnjustified: 1, justified: ["hemograma", "coagulograma", "gaso_venosa", "usg_obstetrica", "eletrolitos"] }, points: 7, severity: "menor", rationale: "Foco no controle do sangramento." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou tônus uterino/sinais vitais após o uterotônico", evidence: { kind: "reassessAfter", after: ["ocitocina", "misoprostol"], reassess: ["abdome_qid", "monitorizacao_continua", "medir_pa", "geral"], withinSeconds: 900 }, points: 6, severity: "importante", rationale: "Confirmar resposta antes de escalonar." },
    { id: "s-diurese", domain: "reavaliacao", description: "Sondagem vesical (diurese e esvaziamento vesical)", evidence: { kind: "actionDone", anyOf: ["diurese_horaria"] }, points: 4, severity: "menor", rationale: "Bexiga cheia prejudica contração uterina; diurese avalia perfusão." },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de HPP por atonia", evidence: { kind: "diagnosis", accepted: ["hpp_atonia"] }, points: 4, severity: "importante", rationale: "Útero amolecido com placenta íntegra e trajeto sem lacerações sangrantes." },
    { id: "s-destino", domain: "destino", description: "Vigilância intensiva (UTI) ou internação monitorizada", evidence: { kind: "disposition", accepted: ["uti", "internacao_enfermaria"] }, points: 6, severity: "importante", rationale: "Risco de recidiva e necessidade de monitorização." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Calcule o índice de choque (FC ÷ PAS). O que ele indica?" },
      { level: 2, text: "Palpe o útero: qual dos 4 Ts é mais provável?" },
      { level: 3, text: "A hemostasia uterina depende da contração do miométrio (ligaduras vivas)." },
      { level: 4, text: "Sugestão explícita: chamar ajuda, 2 acessos, monitor, ocitocina, massagem bimanual, ácido tranexâmico, cristaloide e preparar hemácias." }
    ],
    summary: "Puérpera de 28 anos com HPP por atonia (≈900 mL, índice de choque 1,25) após trabalho de parto prolongado com feto macrossômico.",
    pathophysiology: "Após a dequitação, a hemostasia do leito placentário depende da contração das fibras miometriais que comprimem os vasos. Fadiga muscular (trabalho de parto prolongado, ocitocina prolongada) e sobredistensão (macrossomia) causam atonia, com sangramento rápido e choque hipovolêmico; a perda excessiva pode levar a coagulopatia.",
    keyPoints: [
      "Índice de choque ≥ 0,9–1,0 sugere perda importante.",
      "4 Ts: tônus, trauma, tecido, trombina.",
      "Ocitocina é primeira linha; associe massagem e ácido tranexâmico precoce.",
      "Ações simultâneas com a equipe; preparar hemocomponentes.",
      "Escalonar: misoprostol/metilergometrina (se sem hipertensão), balão, cirurgia."
    ],
    alternatives: ["Misoprostol como 2ª linha.", "Metilergometrina se sem hipertensão."],
    oralRubric: [
      { id: "o1", concept: "Índice de choque/gravidade", synonyms: ["índice de choque", "choque", "gravidade"], weight: 1 },
      { id: "o2", concept: "4 Ts", synonyms: ["tônus", "atonia", "4 t"], weight: 2 },
      { id: "o3", concept: "Ocitocina", synonyms: ["ocitocina"], weight: 3 },
      { id: "o4", concept: "Ácido tranexâmico", synonyms: ["tranexâmico", "tranexamico"], weight: 2 },
      { id: "o5", concept: "Volume e hemocomponentes", synonyms: ["volume", "hemácias", "transfusão"], weight: 1 }
    ],
    simplifications: ["Taxa de sangramento e tempos de resposta são parâmetros didáticos.", "Doses e regimes de ocitocina devem ser conferidos no protocolo de HPP (validação pendente)."]
  },
  references: ["BR-HPP-OPAS", "BR-GESTACAO", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 6, allowSexSwap: false, allowWeightPercent: 10, allowVisualVariation: true, forbidden: ["sexo"] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Ajuda, acessos, monitor, ocitocina, massagem, ATX, SF e exames", commands: [act(5, "chamar_ajuda"), act(10, "monitorizar"), act(15, "massagem_uterina"), rx(30, "ocitocina", "amp5", 10, "UI", "IM"), act(80, "acesso_venoso"), act(180, "acesso_venoso"), act(280, "acesso_venoso"), rx(380, "acido_tranexamico", "amp250", 1000, "mg", "IV"), rx(390, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 20 }), test(400, "hemograma"), dx(2000, "hpp_atonia"), dest(2000, "uti")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-recupera" }, description: "estabilização" }, { condition: { not: { ruleFired: "r-recidiva" } }, description: "sem recidiva" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 2800, expect: [{ condition: { ruleFired: "r-sangra" }, description: "choque progride" }, { condition: { ruleFired: "r-pcr" }, description: "parada definida pelo caso" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Só volume, sem uterotônico", commands: [act(20, "acesso_venoso"), act(120, "acesso_venoso"), rx(200, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 15 })], runUntilSeconds: 2000, expect: [{ condition: { ruleFired: "r-sangra" }, description: "sangramento continua" }, { condition: { not: { ruleFired: "r-controle" } }, description: "sem controle" }] },
    { id: "t-atraso", kind: "delay", description: "Ocitocina só aos 15 min e sem manutenção/ATX", commands: [rx(900, "ocitocina", "amp5", 10, "UI", "IM")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-sangra" }, description: "piora antes" }, { condition: { ruleFired: "r-recidiva" }, description: "recidiva sem manutenção" }] },
    { id: "t-alternativa", kind: "alternative", description: "Misoprostol retal sem ocitocina disponível", commands: [act(10, "massagem_uterina"), rx(60, "misoprostol", "cp200", 800, "mcg", "retal"), act(100, "acesso_venoso"), act(200, "acesso_venoso")], runUntilSeconds: 1800, expect: [{ condition: { ruleFired: "r-controle-2a-linha" }, description: "controle parcial" }] }
  ]
};
