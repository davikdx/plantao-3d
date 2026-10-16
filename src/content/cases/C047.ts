import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const COLAR = { deviceActive: "colar_cervical" };
const NORA = { treatmentActive: "noradrenalina" };
const VOLUME = { any: [{ drugGiven: "sf09", minTotal: { value: 500, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 500, unit: "mL" as const } }] };
const EXCESSO = { any: [{ drugGiven: "sf09", minTotal: { value: 2500, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 2500, unit: "mL" as const } }] };
const TOT = { deviceActive: "tot" };
const VIA_AEREA = { all: [TOT, { actionCompleted: "ventilacao_mecanica" }] };

export const C047: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C047",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Rapaz que mergulhou no rio e não mexe os braços nem as pernas",
  teachingTitle: "Trauma raquimedular cervical com choque neurogênico — restrição da coluna, metas de PAM, via aérea e neurocirurgia",
  group: "Trauma",
  specialties: ["Trauma", "Neurocirurgia", "Emergência", "Terapia intensiva"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 4,
  level: "residencia",
  objectives: [
    "Restringir o movimento da coluna em trauma com déficit neurológico",
    "Diferenciar choque neurogênico (hipotensão + bradicardia + pele quente) de hemorrágico",
    "Tratar hipotensão com volume moderado e vasopressor, mantendo PAM ≈ 75–90 mmHg",
    "Antecipar insuficiência respiratória na lesão cervical alta",
    "Obter TC de coluna cervical e acionar a neurocirurgia"
  ],
  keywords: ["mergulho", "rio", "pescoço", "não mexe", "paralisia", "trauma"],
  patient: {
    name: "Matheus Oliveira",
    ageYears: 19,
    sex: "masculino",
    weightKg: 68,
    heightCm: 178,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 3, hairStyle: "curto", hairColor: "castanho", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional (TC, centro cirúrgico, UTI; neurocirurgião de sobreaviso). Rapaz de 19 anos trazido no banco de trás de um carro por amigos, há 20 minutos: mergulhou de cabeça em parte rasa do rio e foi retirado da água sem conseguir se mexer. Sem colar cervical.",
  communication: "normal",
  informants: [{ id: "amigo", name: "Amigo", role: "Acompanhante" }],
  history: [
    hi("h-mecanismo", "inicio", "Como foi? Bateu a cabeça? Engoliu água?", [{ source: "paciente", text: "Pulei de cabeça… bati no fundo. Não senti mais nada do pescoço pra baixo." }, { source: "amigo", text: "Tiramos ele da água puxando pelos braços. Não engoliu água, ficou acordado." }], ["como foi", "mergulho", "bateu", "água"]),
    h("h-sensibilidade", "sinais_alarme", "Sente quando eu toco? Consegue mexer mãos e pés?", "Sinto um pouco no ombro… do peito pra baixo nada. Consigo levantar um pouco os ombros.", { keywords: ["sente", "toco", "mexer", "mãos", "pés"] }),
    h("h-respirar", "fatores_associados", "Está difícil respirar?", "Um pouco… parece que o ar não enche.", { keywords: ["respirar", "ar", "falta"] }),
    h("h-dor", "localizacao", "Dói em algum lugar?", "Na nuca.", { keywords: ["dói", "dor", "onde"] }),
    hi("h-ample", "antecedentes", "Tem doença, alergia, usa remédio ou bebeu?", [{ source: "amigo", text: "Tomou umas duas latas de cerveja. Não tem doença." }], ["doença", "alergia", "bebeu", "álcool", "ample"])
  ],
  initial: {
    vars: { hr: 54, sbp: 80, dbp: 44, rr: 24, spo2: 95, temp: 35.9, gcs: 15, pain: 6, glucose: 110, perfusion: 0.8, effort: 0.55, etco2: 40, hb: 14.8, lactate: 1.8, urine: 15 },
    flags: { rhythm: "bradicardia_sinusal", posture: "supino", painVisual: "moderada", speech: "frases", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-coluna", "pescoco", "palpacao", "Dor à palpação de processos espinhosos de C5–C6; sem degrau palpável grosseiro.", { label: "Coluna cervical", better: [{ when: COLAR, text: "Colar cervical posicionado, cabeça alinhada; dor em C5–C6." }] }),
    ex("e-neuro", "neurologico", "especial", "Tetraplegia flácida; abdução fraca dos ombros e flexão de cotovelo débil (C5); sensibilidade preservada até a clavícula; arreflexia; priapismo.", { label: "Neurológico (D)" }),
    ex("e-respiracao", "torax_anterior", "inspecao", "Respiração paradoxal abdominal (diafragmática), sem uso de intercostais; tosse fraca.", { label: "Respiração (B)", better: [{ when: { ruleFired: "r-fadiga" }, text: "Respiração rápida e superficial, fadiga evidente; tosse ineficaz." }] }),
    ex("e-pele", "pele", "inspecao", "Pele quente, seca e rosada abaixo da lesão; sem sangramentos; escoriação em fronte.", { label: "Perfusão/exposição" }),
    ex("e-abdome", "abdome_qid", "palpacao", "Abdome flácido, indolor (sensibilidade abolida — exame não confiável); bexiga palpável.", { label: "Abdome (C)" }),
    ex("e-via-aerea", "boca", "inspecao", "Via aérea pérvia, fala frases curtas.", { label: "Via aérea (A)" })
  ],
  testResults: [
    { testId: "tc_coluna_cervical", variants: [{ text: "Laudo educativo: fratura-luxação C5–C6 com listese anterior de ~30% e estreitamento do canal; sem outras fraturas." }] },
    { testId: "efast", variants: [{ text: "Laudo educativo: sem líquido livre, sem derrame pericárdico, deslizamento pleural presente." }] },
    { testId: "cvf_beira_leito", variants: [{ text: "Capacidade vital ~ 1,2 L (≈ 18 mL/kg), em queda em relação ao esperado." }] }
  ],
  highlightedActions: ["colar_cervical", "monitorizar", "o2_mascara_reservatorio", "acesso_venoso", "diurese_horaria", "aquecimento", "solicitar_avaliacao_cirurgica"],
  rules: [
    { id: "r-choque", description: "Choque neurogênico: perda do tônus simpático", priority: 10, when: { always: true }, repeat: "once", effects: [trend("sbp", 70, 900, "neuro", 10), trend("dbp", 38, 900, "neuro", 10), trend("hr", 46, 900, "neuro", 10)] },
    { id: "r-sem-colar", description: "Sem restrição de movimento da coluna em 10 min: piora do déficit", priority: 30, when: { all: [{ time: "gte", seconds: 600 }, { not: COLAR }] }, repeat: "once", effects: [staff("enfermagem", "Ao passar ele para a maca, a cabeça virou e agora ele disse que não sente mais o ombro."), trend("effort", 0.8, 300, "colar", 30), obs("Movimento da coluna instável pode ampliar a lesão medular."), outcome("complicacao")] },
    { id: "r-volume", description: "Volume moderado: resposta parcial", priority: 25, when: VOLUME, repeat: "once", effects: [trend("sbp", 84, 300, "vol", 25, 1500)] },
    { id: "r-nora", description: "Noradrenalina: PAM-alvo enquanto infundida", priority: 50, when: NORA, repeat: "while", effects: [trend("sbp", 118, 300, "nora", 50), trend("dbp", 68, 300, "nora", 50), trend("hr", 62, 300, "nora", 50)], onEnd: [{ type: "clearTrend", var: "sbp", slot: "nora" }, { type: "clearTrend", var: "dbp", slot: "nora" }, { type: "clearTrend", var: "hr", slot: "nora" }] },
    { id: "r-atropina", description: "Atropina: aumento transitório da FC", priority: 45, when: { drugGiven: "atropina" }, repeat: "once", effects: [trend("hr", 72, 60, "atr", 45, 900)] },
    { id: "r-excesso", description: "Volume liberal sem vasopressor: congestão pulmonar", priority: 55, when: EXCESSO, repeat: "once", effects: [trend("spo2", 88, 600, "exc", 55), flag("edema", true), obs("O choque neurogênico é distributivo: volume excessivo causa congestão sem corrigir a vasoplegia."), outcome("complicacao")] },
    { id: "r-fadiga", description: "Lesão C5: fadiga diafragmática progressiva", priority: 20, when: { all: [{ time: "gte", seconds: 1800 }, { not: TOT }] }, repeat: "once", effects: [trend("spo2", 89, 600, "fad", 20), trend("etco2", 56, 600, "fad", 20), trend("rr", 34, 600, "fad", 20), flag("speech", "palavras"), staff("enfermagem", "Ele está cansando de respirar, a voz está fraca."), outcome("piora")] },
    { id: "r-vm", description: "IOT com estabilização manual e ventilação controlada", priority: 60, when: VIA_AEREA, repeat: "once", effects: [trend("spo2", 98, 180, "vm", 60), trend("etco2", 38, 180, "vm", 60), trend("rr", 16, 180, "vm", 60), flag("airway", "protegida")] },
    { id: "r-iot-sem-colar", description: "IOT sem restrição de coluna", priority: 40, when: { all: [TOT, { not: COLAR }] }, repeat: "once", effects: [obs("Intubação sem estabilização manual alinhada: hiperextensão cervical arrisca ampliar a lesão."), outcome("complicacao")] },
    { id: "r-hipotermia", description: "Poiquilotermia sem aquecimento", priority: 15, when: { all: [{ time: "gte", seconds: 900 }, { not: { actionCompleted: "aquecimento" } }] }, repeat: "once", effects: [trend("temp", 34.9, 1200, "frio", 15)] },
    { id: "r-mp", description: "Metilprednisolona registrada", priority: 10, when: { drugGiven: "metilprednisolona" }, repeat: "once", effects: [obs("Corticoide em alta dose no trauma raquimedular é controverso (benefício incerto, mais infecção e hiperglicemia); só por protocolo institucional e dentro de 8 h.")] },
    { id: "r-neuro-sem-tc", description: "Neurocirurgia pede TC", priority: 49, when: { all: [{ actionCompleted: "solicitar_avaliacao_cirurgica" }, { not: { testCollected: "tc_coluna_cervical" } }] }, repeat: "once", effects: [staff("supervisor", "Neurocirurgião: preciso da TC de coluna cervical; mantenham colar, prancha só para transporte e PAM ≥ 75–80.")] },
    { id: "r-neuro", description: "TC + neurocirurgia: descompressão/estabilização precoce", priority: 50, when: { all: [{ actionCompleted: "solicitar_avaliacao_cirurgica" }, { testCollected: "tc_coluna_cervical" }] }, repeat: "once", effects: [staff("supervisor", "Neurocirurgião: fratura-luxação C5–C6 com compressão medular. Redução e estabilização cirúrgica nas próximas horas; até lá, UTI com PAM 75–90 mmHg."), outcome("estabilizacao_parcial")] },
    { id: "r-pcr", description: "Hipotensão/bradicardia sem tratamento e insuficiência respiratória", priority: 100, when: { all: [{ elapsedSince: "rule:r-fadiga", op: "gte", seconds: 1500 }, { not: TOT }, { not: NORA }] }, repeat: "once", effects: [flag("pulse", false), { type: "setValue", var: "hr", value: 0 }, flag("consciousness", "irresponsivo"), staff("enfermagem", "Parou! Bradicardia extrema e agora sem pulso!"), outcome("parada", true)] }
  ],
  diagnosis: { primary: "trauma_raquimedular", accepted: ["trauma_raquimedular"], differentials: ["choque_hipovolemico", "hematoma_epidural", "intox_alcool", "guillain_barre", "mielite_transversa"] },
  acceptedDestinations: ["uti", "centro_cirurgico"],
  outcomeNotes: "Lesão medular cervical C5–C6 por mergulho em água rasa, com choque neurogênico (hipotensão, bradicardia, pele quente) e risco de falência respiratória. Restrição da coluna, O₂, volume moderado e noradrenalina para PAM 75–90 mmHg, atropina se bradicardia sintomática, aquecimento, sonda vesical, TC cervical e neurocirurgia; IOT com estabilização alinhada se fadiga.",
  scoring: [
    { id: "s-colar", domain: "priorizacao", description: "Restrição de movimento da coluna em até 3 min", evidence: { kind: "actionDone", anyOf: ["colar_cervical"], withinSeconds: 180 }, points: 12, severity: "critica", rationale: "Lesão instável: movimento pode ampliar o déficit.", sourceIds: ["BR-SAMU-SAV", "BR-SAMU-SBV"] },
    { id: "s-hist", domain: "historia", description: "Mecanismo e sintomas neurológicos", evidence: { kind: "historyAsked", items: ["h-mecanismo", "h-sensibilidade", "h-respirar"], minCount: 2 }, points: 5, severity: "importante", rationale: "Mergulho em água rasa: clássico de lesão cervical." },
    { id: "s-exame", domain: "historia", description: "Exame neurológico, coluna e padrão respiratório", evidence: { kind: "examDone", regions: ["neurologico", "pescoco", "torax_anterior", "pele"], minCount: 3 }, points: 8, severity: "critica", rationale: "Nível neurológico e sinais de choque neurogênico." },
    { id: "s-monitor", domain: "priorizacao", description: "Monitorização e O₂", evidence: { kind: "actionDone", anyOf: ["monitorizar", "o2_mascara_reservatorio", "o2_cateter"], withinSeconds: 300 }, points: 4, severity: "importante", rationale: "Bradicardia e hipoventilação." },
    { id: "s-hemorragia", domain: "exames", description: "Excluiu choque hemorrágico associado (eFAST)", evidence: { kind: "testOrdered", anyOf: ["efast"], withinSeconds: 1200 }, points: 4, severity: "importante", rationale: "Choque no trauma é hemorrágico até prova em contrário; abdome insensível." },
    { id: "s-tc", domain: "exames", description: "TC de coluna cervical", evidence: { kind: "testOrdered", anyOf: ["tc_coluna_cervical"], withinSeconds: 1800 }, points: 8, severity: "critica", rationale: "Define lesão e conduta cirúrgica." },
    { id: "s-nora", domain: "tratamento", description: "Vasopressor para PAM-alvo", evidence: { kind: "drugGiven", anyOf: ["noradrenalina"], withinSeconds: 1500 }, points: 12, severity: "critica", rationale: "PAM ≥ 75–80 e não acima de 90–95 mmHg nos primeiros dias.", sourceIds: ["INT-AOSPINE-HEMO-2024"] },
    { id: "s-volume", domain: "tratamento", description: "Volume inicial moderado", evidence: { kind: "drugGiven", anyOf: ["sf09", "ringer_lactato"], withinSeconds: 900 }, points: 4, severity: "importante", rationale: "Corrigir hipovolemia relativa antes/ao lado do vasopressor." },
    { id: "s-excesso", domain: "tratamento", description: "Falha: volume liberal sem vasopressor", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-excesso" } }, points: 8, penalty: true, severity: "importante", rationale: "Choque distributivo não responde a volume ilimitado." },
    { id: "s-sonda", domain: "tratamento", description: "Sonda vesical (retenção) e diurese", evidence: { kind: "actionDone", anyOf: ["diurese_horaria"] }, points: 4, severity: "importante", rationale: "Bexiga neurogênica; meta de perfusão." },
    { id: "s-aquecer", domain: "tratamento", description: "Aquecimento (poiquilotermia)", evidence: { kind: "actionDone", anyOf: ["aquecimento"], withinSeconds: 900 }, points: 3, severity: "menor", rationale: "Perde termorregulação abaixo da lesão." },
    { id: "s-sem-colar", domain: "tratamento", description: "Falha: coluna não protegida", evidence: { kind: "stateAtEnd", when: { any: [{ ruleFired: "r-sem-colar" }, { ruleFired: "r-iot-sem-colar" }] } }, points: 10, penalty: true, severity: "critica", rationale: "Lesão secundária evitável." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou PA e respiração após o vasopressor", evidence: { kind: "reassessAfter", after: ["noradrenalina"], reassess: ["medir_pa", "monitorizar", "cvf_beira_leito", "gaso_arterial", "torax_anterior"], withinSeconds: 1200 }, points: 6, severity: "importante", rationale: "Titular PAM; detectar fadiga ventilatória." },
    { id: "s-neuro", domain: "destino", description: "Acionou a neurocirurgia", evidence: { kind: "actionDone", anyOf: ["solicitar_avaliacao_cirurgica"], withinSeconds: 2400 }, points: 6, severity: "critica", rationale: "Descompressão/estabilização precoce." },
    { id: "s-dx", domain: "destino", description: "Trauma raquimedular com choque neurogênico", evidence: { kind: "diagnosis", accepted: ["trauma_raquimedular"] }, points: 4, severity: "importante", rationale: "Hipotensão + bradicardia + déficit." },
    { id: "s-destino", domain: "destino", description: "UTI ou centro cirúrgico", evidence: { kind: "disposition", accepted: ["uti", "centro_cirurgico"] }, points: 4, severity: "importante", rationale: "Monitorização de PAM e via aérea." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Hipotensão no trauma com frequência cardíaca de 54. O que não combina?" },
      { level: 2, text: "Pele quente e seca, priapismo, respiração abdominal." },
      { level: 3, text: "Perda do simpático abaixo da lesão: vasodilatação e bradicardia." },
      { level: 4, text: "Sugestão explícita: colar, O₂, monitor, acesso, volume moderado, noradrenalina (PAM 75–90), eFAST, TC cervical, sonda, aquecer, neurocirurgia; IOT alinhada se fadiga." }
    ],
    summary: "Rapaz de 19 anos com fratura-luxação C5–C6 após mergulho em água rasa, tetraplegia nível C5 e choque neurogênico.",
    pathophysiology: "A lesão medular cervical interrompe as vias simpáticas descendentes: vasodilatação (hipotensão, pele quente) e predomínio vagal (bradicardia). A hipoperfusão medular agrava a lesão secundária. Lesões em C3–C5 comprometem o diafragma; acima de C5, a musculatura intercostal já está paralisada, com fadiga nas primeiras horas.",
    keyPoints: [
      "Mergulho em água rasa: lesão cervical até prova em contrário.",
      "Choque neurogênico: hipotensão + bradicardia + pele quente; excluir hemorragia associada.",
      "Volume moderado + vasopressor; PAM 75–90 mmHg por 3–7 dias.",
      "Lesão cervical alta: vigiar capacidade vital e fadiga; IOT com estabilização alinhada.",
      "Sonda vesical, aquecimento e neurocirurgia precoce."
    ],
    alternatives: ["Prancha rígida apenas para transporte; retirar precocemente na sala para evitar lesões por pressão.", "Atropina ou marca-passo para bradicardia sintomática."],
    oralRubric: [
      { id: "o1", concept: "Restrição da coluna", synonyms: ["colar", "alinhamento", "imobilização", "restrição"], weight: 2 },
      { id: "o2", concept: "Choque neurogênico", synonyms: ["neurogênico", "bradicardia", "vasoplegia", "simpático"], weight: 3 },
      { id: "o3", concept: "Meta de PAM com vasopressor", synonyms: ["noradrenalina", "pam", "vasopressor"], weight: 2 },
      { id: "o4", concept: "Risco respiratório", synonyms: ["diafragma", "capacidade vital", "intubação", "fadiga"], weight: 2 }
    ],
    simplifications: ["A ampliação da lesão por falta de colar é um evento fixo aos 10 min (didático).", "Metilprednisolona não é pontuada: tema controverso, apenas registrado.", "A PAM-alvo é representada pela PAS do motor."]
  },
  references: ["INT-AOSPINE-HEMO-2024", "BR-SAMU-SAV", "BR-SAMU-SBV", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 20, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Colar, monitor, O₂, exame, volume, noradrenalina, eFAST, TC, sonda, aquecer, neurocirurgia, UTI", commands: [act(10, "colar_cervical"), act(50, "monitorizar"), act(60, "o2_mascara_reservatorio", { fluxo: 10 }), ask(80, "h-mecanismo"), ask(90, "h-sensibilidade"), { atSeconds: 100, type: "examine", payload: { region: "neurologico", maneuver: "especial" } }, { atSeconds: 110, type: "examine", payload: { region: "torax_anterior", maneuver: "inspecao" } }, { atSeconds: 120, type: "examine", payload: { region: "pele", maneuver: "inspecao" } }, act(130, "acesso_venoso"), act(230, "acesso_venoso"), rx(340, "ringer_lactato", "bolsa500", 500, "mL", "IV", "infusao_volume", { durationMinutes: 15 }), test(360, "efast"), rx(700, "noradrenalina", "sol64", 1, "mg", "IV", "infusao", { rate: { value: 0.1, unit: "mcg/kg/min" } }), act(720, "aquecimento"), act(740, "diurese_horaria"), test(1050, "tc_coluna_cervical"), act(1100, "medir_pa"), act(1120, "solicitar_avaliacao_cirurgica"), dx(2000, "trauma_raquimedular"), dest(2100, "uti")], runUntilSeconds: 2500, expect: [{ condition: { ruleFired: "r-neuro" }, description: "neurocirurgia com TC" }, { condition: { not: { ruleFired: "r-sem-colar" } }, description: "coluna protegida" }, { condition: { path: "vars.sbp", op: "gte", value: 100 }, description: "PAS-alvo" }, { condition: { not: { ruleFired: "r-excesso" } }, description: "sem congestão" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 3500, expect: [{ condition: { ruleFired: "r-sem-colar" }, description: "piora do déficit" }, { condition: { ruleFired: "r-fadiga" }, description: "fadiga respiratória" }, { condition: { ruleFired: "r-pcr" }, description: "PCR" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Sem colar e só volume liberal", commands: [act(30, "acesso_venoso"), act(130, "acesso_venoso"), rx(250, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 15 }), rx(600, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 15 }), rx(950, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 15 })], runUntilSeconds: 2400, expect: [{ condition: { ruleFired: "r-sem-colar" }, description: "coluna não protegida" }, { condition: { ruleFired: "r-excesso" }, description: "congestão" }] },
    { id: "t-atraso", kind: "delay", description: "Colar a tempo, vasopressor só aos 40 min com IOT após fadiga", commands: [act(30, "colar_cervical"), act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(300, "ringer_lactato", "bolsa500", 500, "mL", "IV", "infusao_volume", { durationMinutes: 15 }), rx(2400, "noradrenalina", "sol64", 1, "mg", "IV", "infusao", { rate: { value: 0.1, unit: "mcg/kg/min" } }), act(2500, "intubacao"), act(2630, "intubacao"), act(2760, "ventilacao_mecanica")], runUntilSeconds: 3500, expect: [{ condition: { ruleFired: "r-fadiga" }, description: "fadiga respiratória" }, { condition: { ruleFired: "r-vm" }, description: "via aérea tardia" }, { condition: { not: { ruleFired: "r-pcr" } }, description: "PCR evitada" }] },
    { id: "t-alternativa", kind: "alternative", description: "Colar, atropina para bradicardia, noradrenalina, neurocirurgia antes da TC", commands: [act(10, "colar_cervical"), act(40, "monitorizar"), act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(280, "atropina", "amp05", 0.5, "mg", "IV"), rx(320, "noradrenalina", "sol64", 1, "mg", "IV", "infusao", { rate: { value: 0.1, unit: "mcg/kg/min" } }), act(400, "solicitar_avaliacao_cirurgica"), test(1100, "tc_coluna_cervical"), dest(2300, "centro_cirurgico")], runUntilSeconds: 2500, expect: [{ condition: { ruleFired: "r-atropina" }, description: "atropina" }, { condition: { ruleFired: "r-neuro-sem-tc" }, description: "pede TC" }, { condition: { ruleFired: "r-neuro" }, description: "neurocirurgia com TC" }] }
  ]
};
