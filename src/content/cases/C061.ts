import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const SONDA = { actionCompleted: "diurese_horaria" };
const ANALGESIA = { any: [{ drugGiven: "dipirona" }, { drugGiven: "morfina" }, { drugGiven: "paracetamol" }] };

export const C061: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C061",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Idoso com dor forte no pé da barriga e sem conseguir urinar desde ontem",
  teachingTitle: "Retenção urinária aguda com lesão renal pós-renal — sondagem, diurese pós-obstrutiva, causa medicamentosa e seguimento urológico",
  group: "Nefrologia",
  specialties: ["Clínica médica", "Urologia", "Nefrologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "upa-porte-ii",
  difficulty: 2,
  level: "internato",
  objectives: [
    "Reconhecer retenção urinária aguda (globo vesical) como causa de lesão renal pós-renal",
    "Realizar sondagem vesical e analgesia sem atraso",
    "Identificar desencadeantes (anticolinérgicos, descongestionantes, HPB) e suspendê-los",
    "Monitorar diurese pós-obstrutiva e função renal",
    "Planejar alfabloqueador, retirada da sonda e encaminhamento à urologia"
  ],
  keywords: ["não urina", "dor", "barriga", "idoso", "próstata", "bexiga"],
  patient: {
    name: "Sebastião Ribeiro",
    ageYears: 76,
    sex: "masculino",
    weightKg: 70,
    heightCm: 168,
    visual: { ageGroup: "idoso", sex: "masculino", skinTone: 3, hairStyle: "careca", hairColor: "branco", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "UPA 24 h porte II. Idoso de 76 anos chega com a filha, inquieto, com dor intensa no baixo ventre e sem conseguir urinar há cerca de 16 horas. Há 2 dias está gripado.",
  communication: "normal",
  informants: [{ id: "filha", name: "Filha", role: "Acompanhante" }],
  history: [
    h("h-queixa", "queixa", "O que o senhor está sentindo?", "Uma vontade enorme de urinar e não sai nada… dói demais aqui embaixo.", { keywords: ["sentindo", "dor"] }),
    h("h-luts", "antecedentes", "Antes disso, como era o jato? Levantava à noite?", "Jato fraco há anos, levanto umas 4 vezes à noite. Nunca tratei.", { keywords: ["jato", "noite", "próstata"] }),
    hi("h-medicacoes", "medicacoes", "Tomou algum remédio para gripe ou outro novo?", [{ source: "filha", text: "Ele está tomando um antigripal da farmácia, daqueles com antialérgico e descongestionante, 3 vezes ao dia. E toma amitriptilina para dormir." }], ["remédio", "gripe", "antigripal", "novo"]),
    h("h-febre", "fatores_associados", "Tem febre, ardência, sangue na urina, dor nas costas?", "Febre não. Sangue não vi.", { keywords: ["febre", "ardência", "sangue", "costas"] }),
    h("h-neuro", "sinais_alarme", "Tem fraqueza ou formigamento nas pernas? Dor nas costas forte? Intestino?", "Não, as pernas estão normais. Intestino preso de vez em quando.", { keywords: ["pernas", "formigamento", "costas", "intestino"] })
  ],
  initial: {
    vars: { hr: 104, sbp: 168, dbp: 92, rr: 20, spo2: 97, temp: 36.7, gcs: 15, pain: 9, glucose: 118, perfusion: 0.9, effort: 0.3, na: 137, k: 5.3, creat: 2.4, urea: 96, hb: 13.8, urine: 0 },
    flags: { rhythm: "taquicardia_sinusal", posture: "sentado", painVisual: "intensa", speech: "frases", consciousness: "alerta", agitation: true, sweating: true },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-bexiga", "abdome_qid", "palpacao", "Massa suprapúbica dolorosa, macicez à percussão até próximo da cicatriz umbilical (globo vesical).", { label: "Hipogástrio", better: [{ when: SONDA, text: "Hipogástrio flácido e indolor após a sondagem." }] }),
    ex("e-pelve", "pelve", "palpacao", "Toque retal (consentido): próstata aumentada, fibroelástica, lisa, indolor.", { label: "Toque retal" }),
    ex("e-neuro", "neurologico", "especial", "Força e sensibilidade preservadas em membros inferiores; reflexos normais; sensibilidade perineal preservada.", { label: "Neurológico" }),
    ex("e-geral", "geral", "inspecao", "Inquieto, sudoreico pela dor; hidratado.", {})
  ],
  testResults: [
    { testId: "urina_tipo1", variants: [{ text: "Hematúria microscópica discreta, sem leucocitúria significativa, nitrito negativo (amostra da sonda)." }] },
    { testId: "ecg12", variants: [{ text: "Taquicardia sinusal; ondas T normais." }] }
  ],
  highlightedActions: ["avaliar_dor", "diurese_horaria", "acesso_venoso"],
  rules: [
    { id: "r-curso", description: "Obstrução mantida: dor, hipertensão reativa e piora renal", priority: 10, when: { always: true }, repeat: "once", effects: [trend("pain", 10, 1200, "ret", 10), trend("sbp", 178, 1200, "ret", 10), trend("creat", 3.0, 7200, "ret", 10), trend("k", 5.8, 7200, "ret", 10)] },
    { id: "r-analgesia", description: "Analgesia parcial (a dor só cede com a drenagem)", priority: 20, when: ANALGESIA, repeat: "once", effects: [trend("pain", 7, 600, "anal", 20)] },
    { id: "r-sonda", description: "Sondagem vesical: drenagem de ~1.150 mL e alívio imediato", priority: 50, when: SONDA, repeat: "once", effects: [trend("pain", 1, 300, "sonda", 50), trend("sbp", 142, 900, "sonda", 50), trend("hr", 84, 900, "sonda", 50), flag("agitation", false), flag("sweating", false), trend("urine", 220, 1800, "sonda", 50), trend("creat", 1.6, 21600, "sonda", 50), trend("k", 4.6, 10800, "sonda", 50), staff("enfermagem", "Saíram 1.150 mL de urina clara. Ele aliviou na hora."), outcome("melhora")] },
    { id: "r-pod", description: "Diurese pós-obstrutiva", priority: 15, when: { elapsedSince: "action:diurese_horaria", op: "gte", seconds: 2400 }, repeat: "once", effects: [obs("Diurese > 200 mL/h após desobstrução: diurese pós-obstrutiva. Monitorar sinais vitais, volemia e eletrólitos; repor se houver hipotensão ou perda excessiva.")] },
    { id: "r-furo", description: "Diurético com bexiga obstruída", priority: 45, when: { all: [{ drugGiven: "furosemida" }, { not: SONDA }] }, repeat: "once", effects: [trend("pain", 10, 120, "furo", 45), trend("sbp", 190, 300, "furo", 45), obs("Furosemida aumenta a produção de urina em uma bexiga que não esvazia: mais dor e distensão. A causa é pós-renal."), outcome("complicacao")] },
    { id: "r-tansulosina", description: "Alfabloqueador iniciado", priority: 10, when: { drugGiven: "tansulosina" }, repeat: "once", effects: [obs("Alfabloqueador antes da tentativa de retirada da sonda aumenta a chance de voltar a urinar espontaneamente.")] },
    { id: "r-piora", description: "Sem sondagem em 40 min: piora clínica e renal", priority: 30, when: { all: [{ time: "gte", seconds: 2400 }, { not: SONDA }] }, repeat: "once", effects: [trend("hr", 118, 600, "piora", 30), trend("creat", 3.4, 3600, "piora", 30), staff("enfermagem", "Ele está desesperado de dor, suando frio."), outcome("piora")] }
  ],
  diagnosis: { primary: "retencao_urinaria", accepted: ["retencao_urinaria", "lra"], differentials: ["lra", "itu_complicada", "pielonefrite", "apendicite", "drc_agudizada"] },
  acceptedDestinations: ["observacao"],
  outcomeNotes: "Retenção urinária aguda por HPB descompensada por anticolinérgico (antigripal com anti-histamínico + amitriptilina) e descongestionante, com LRA pós-renal (creatinina 2,4) e K⁺ 5,3. Analgesia e sondagem vesical imediata, monitorar diurese pós-obstrutiva e creatinina, suspender antigripal/amitriptilina, iniciar tansulosina, retirada da sonda em ~3 dias e encaminhamento à urologia; observação na UPA até estabilidade da diurese e da função renal.",
  scoring: [
    { id: "s-luts", domain: "historia", description: "Sintomas prostáticos prévios", evidence: { kind: "historyAsked", items: ["h-luts"], minCount: 1 }, points: 5, severity: "importante", rationale: "HPB é a causa mais comum em homens idosos." },
    { id: "s-meds", domain: "historia", description: "Identificou anticolinérgico/descongestionante", evidence: { kind: "historyAsked", items: ["h-medicacoes"], minCount: 1 }, points: 10, severity: "critica", rationale: "Desencadeante removível." },
    { id: "s-neuro", domain: "historia", description: "Excluiu causa neurológica e infecção", evidence: { kind: "historyAsked", items: ["h-neuro", "h-febre"], minCount: 1 }, points: 4, severity: "importante", rationale: "Síndrome da cauda equina e ITU mudam a conduta." },
    { id: "s-exame", domain: "historia", description: "Palpou o globo vesical e fez toque retal", evidence: { kind: "examDone", regions: ["abdome_qid", "pelve"], minCount: 2 }, points: 8, severity: "critica", rationale: "Diagnóstico clínico." },
    { id: "s-sonda", domain: "tratamento", description: "Sondagem vesical em até 15 min", evidence: { kind: "actionDone", anyOf: ["diurese_horaria"], withinSeconds: 900 }, points: 20, severity: "critica", rationale: "Desobstrução é o tratamento." },
    { id: "s-analgesia", domain: "tratamento", description: "Analgesia", evidence: { kind: "drugGiven", anyOf: ["dipirona", "morfina", "paracetamol"], withinSeconds: 900 }, points: 4, severity: "importante", rationale: "Dor intensa." },
    { id: "s-furo", domain: "tratamento", description: "Falha: diurético na obstrução", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-furo" } }, points: 8, penalty: true, severity: "importante", rationale: "Causa pós-renal." },
    { id: "s-alfa", domain: "tratamento", description: "Alfabloqueador para a retirada da sonda", evidence: { kind: "drugGiven", anyOf: ["tansulosina"] }, points: 6, severity: "importante", rationale: "Aumenta o sucesso da retirada.", sourceIds: ["INT-EAU-RU-2019"] },
    { id: "s-labs", domain: "exames", description: "Função renal, potássio e urina", evidence: { kind: "testOrdered", anyOf: ["funcao_renal", "eletrolitos", "gaso_venosa", "urina_tipo1"], withinSeconds: 1800 }, points: 8, severity: "importante", rationale: "LRA pós-renal e ITU associada." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou diurese, PA e creatinina após a desobstrução", evidence: { kind: "reassessAfter", after: ["diurese_horaria"], reassess: ["medir_pa", "funcao_renal", "eletrolitos", "avaliar_dor"], withinSeconds: 3600 }, points: 8, severity: "importante", rationale: "Diurese pós-obstrutiva e recuperação renal." },
    { id: "s-orient", domain: "destino", description: "Orientação sobre sonda e seguimento urológico", evidence: { kind: "actionDone", anyOf: ["orientacoes_alta"] }, points: 5, severity: "importante", rationale: "Cuidados com a sonda, sinais de alarme, retorno." },
    { id: "s-dx", domain: "destino", description: "Retenção urinária aguda", evidence: { kind: "diagnosis", accepted: ["retencao_urinaria"] }, points: 6, severity: "importante", rationale: "Globo vesical e LRA pós-renal." },
    { id: "s-destino", domain: "destino", description: "Observação na UPA", evidence: { kind: "disposition", accepted: ["observacao"] }, points: 6, severity: "importante", rationale: "Acompanhar diurese pós-obstrutiva e creatinina antes da alta com encaminhamento." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Onde está a urina que ele não consegue eliminar?" },
      { level: 2, text: "Palpe e percuta o hipogástrio." },
      { level: 3, text: "Antigripais com anti-histamínico e descongestionante, mais amitriptilina, em quem já tem próstata grande." },
      { level: 4, text: "Sugestão explícita: analgesia, sondagem vesical, creatinina/K⁺/urina, suspender antigripal e amitriptilina, tansulosina, observar diurese, encaminhar à urologia." }
    ],
    summary: "Idoso de 76 anos com HPB não tratada e retenção urinária aguda precipitada por antigripal (anti-histamínico + descongestionante) e amitriptilina, com lesão renal pós-renal.",
    pathophysiology: "Anticolinérgicos reduzem a contratilidade do detrusor e alfa-agonistas aumentam o tônus do colo vesical e da próstata. Em próstata aumentada, a soma leva à retenção. A pressão retrógrada reduz a filtração (LRA pós-renal). Após a desobstrução, ureia acumulada e disfunção tubular podem causar diurese pós-obstrutiva.",
    keyPoints: [
      "Globo vesical + dor + anúria em idoso: sondar já.",
      "LRA pós-renal melhora com a desobstrução; diurético não ajuda.",
      "Revisar medicamentos: anticolinérgicos, anti-histamínicos, descongestionantes, opioides, antidepressivos tricíclicos.",
      "Monitorar diurese pós-obstrutiva e eletrólitos.",
      "Alfabloqueador e tentativa de retirada da sonda em ~3 dias; urologia."
    ],
    alternatives: ["Cistostomia suprapúbica se sondagem uretral impossível (urologia).", "Ultrassom à beira-leito para volume vesical quando disponível."],
    oralRubric: [
      { id: "o1", concept: "Sondagem vesical", synonyms: ["sonda", "sondagem", "cateterismo"], weight: 3 },
      { id: "o2", concept: "Causa medicamentosa", synonyms: ["antigripal", "anticolinérgico", "amitriptilina", "descongestionante"], weight: 2 },
      { id: "o3", concept: "LRA pós-renal", synonyms: ["pós-renal", "obstrução", "creatinina"], weight: 2 },
      { id: "o4", concept: "Alfabloqueador e retirada", synonyms: ["tansulosina", "alfabloqueador", "retirada da sonda"], weight: 1 }
    ],
    simplifications: ["Sondagem uretral representada pela ação de sonda vesical.", "Hematúria ex vacuo e hipotensão pós-drenagem não são modeladas.", "Tansulosina sem regra de dose validada (o app alerta)."]
  },
  references: ["INT-EAU-RU-2019", "INT-AFP-LRA-2019", "BR-UPA", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 12, allowSexSwap: false, allowWeightPercent: 15, allowVisualVariation: true, forbidden: ["sexo feminino (caso baseado em próstata)"] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "História, exame, analgesia, sondagem, labs, tansulosina, orientação, observação", commands: [ask(10, "h-queixa"), ask(20, "h-luts"), ask(30, "h-medicacoes"), ask(40, "h-neuro"), { atSeconds: 50, type: "examine", payload: { region: "abdome_qid", maneuver: "palpacao" } }, { atSeconds: 60, type: "examine", payload: { region: "pelve", maneuver: "palpacao" } }, act(70, "acesso_venoso"), rx(180, "dipirona", "amp1g", 1000, "mg", "IV"), act(200, "diurese_horaria"), test(520, "funcao_renal"), test(530, "eletrolitos"), test(540, "urina_tipo1"), act(1500, "medir_pa"), act(1520, "avaliar_dor"), rx(1600, "tansulosina", "cp04", 0.4, "mg", "VO"), act(1700, "orientacoes_alta"), dx(1800, "retencao_urinaria"), dest(1900, "observacao")], runUntilSeconds: 4000, expect: [{ condition: { ruleFired: "r-sonda" }, description: "desobstrução" }, { condition: { not: { ruleFired: "r-piora" } }, description: "sem piora" }, { condition: { ruleFired: "r-pod" }, description: "diurese pós-obstrutiva monitorada" }, { condition: { path: "vars.pain", op: "lte", value: 3 }, description: "dor controlada" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-piora" }, description: "piora" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Furosemida para 'fazer urinar' e analgesia", commands: [act(30, "acesso_venoso"), rx(150, "furosemida", "amp20", 40, "mg", "IV"), rx(200, "dipirona", "amp1g", 1000, "mg", "IV")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-furo" }, description: "diurético na obstrução" }, { condition: { ruleFired: "r-piora" }, description: "piora" }] },
    { id: "t-atraso", kind: "delay", description: "Só analgesia; sonda aos 45 min", commands: [act(30, "acesso_venoso"), rx(150, "dipirona", "amp1g", 1000, "mg", "IV"), act(2700, "diurese_horaria")], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-piora" }, description: "piora no atraso" }, { condition: { ruleFired: "r-sonda" }, description: "desobstrução tardia" }] },
    { id: "t-alternativa", kind: "alternative", description: "Morfina IV antes da sonda e tansulosina", commands: [act(20, "acesso_venoso"), rx(130, "morfina", "amp10", 3, "mg", "IV"), act(160, "diurese_horaria"), rx(800, "tansulosina", "cp04", 0.4, "mg", "VO"), dest(1500, "observacao")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-sonda" }, description: "desobstrução" }, { condition: { ruleFired: "r-tansulosina" }, description: "alfabloqueador" }] }
  ]
};
