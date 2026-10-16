import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, obs, outcome, rx, staff, test, trend } from "./helpers";

const TOT = { deviceActive: "tot" };
const IGIV = { drugGiven: "imunoglobulina" };

export const C031: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C031",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Fraqueza que começou nos pés e está subindo, agora com falta de ar",
  teachingTitle: "Síndrome de Guillain-Barré com comprometimento respiratório — CVF seriada, intubação eletiva e imunoglobulina",
  group: "Neurologia",
  specialties: ["Neurologia", "Terapia intensiva", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 4,
  level: "residencia",
  objectives: [
    "Reconhecer fraqueza ascendente arreflexa após infecção",
    "Monitorar função respiratória (CVF, força cervical, tosse) sem confiar na SpO₂",
    "Indicar intubação eletiva antes da falência (regra 20/30/40)",
    "Iniciar imunoglobulina IV",
    "Vigiar disautonomia e encaminhar para UTI"
  ],
  keywords: ["fraqueza", "pernas", "subindo", "formigamento", "falta de ar"],
  patient: {
    name: "Marcos Vinícius Leal",
    ageYears: 38,
    sex: "masculino",
    weightKg: 76,
    heightCm: 176,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 3, hairStyle: "curto", hairColor: "preto", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Homem de 38 anos com formigamento e fraqueza nas pernas há 5 dias, que subiu para os braços; hoje sente falta de ar ao falar. Teve diarreia há 2 semanas.",
  communication: "normal",
  history: [
    h("h-evolucao", "inicio", "Como a fraqueza começou e evoluiu?", "Começou com formigamento nos pés, depois fraqueza nas pernas, e agora nos braços. Ontem já não subia escada.", { keywords: ["começou", "evoluiu", "fraqueza"] }),
    h("h-infeccao", "antecedentes", "Teve alguma infecção nas últimas semanas?", "Uma diarreia forte há duas semanas.", { keywords: ["infecção", "diarreia", "gripe"] }),
    h("h-respira", "fatores_associados", "Tem falta de ar? Consegue tossir? Engasga ao engolir?", "Falta de ar para falar frases longas. A tosse está fraca. Engasguei com água hoje.", { keywords: ["falta de ar", "tossir", "engasga", "engolir"] }),
    h("h-autonomico", "fatores_associados", "Tem palpitações, tontura ao levantar, dificuldade para urinar?", "Palpitação às vezes. Urina normal.", { keywords: ["palpitação", "tontura", "urinar"] }),
    h("h-vacina", "antecedentes", "Tomou vacina recentemente? Doença prévia?", "Nada disso, sou saudável.", { keywords: ["vacina", "doença"] }),
    h("h-alergias", "alergias", "Tem alergia?", "Não.")
  ],
  initial: {
    vars: { hr: 112, sbp: 148, dbp: 92, rr: 26, spo2: 96, temp: 36.7, gcs: 15, pain: 3, glucose: 104, perfusion: 0.85, effort: 0.6, ph: 7.39, pco2: 41, po2: 82, lactate: 1.2, k: 4.0, na: 137 },
    flags: { rhythm: "taquicardia_sinusal", posture: "fowler", painVisual: "leve", speech: "frases", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-neuro", "neurologico", "especial", "Tetraparesia flácida simétrica (MMII 2/5, MMSS 3/5), arreflexia global, hipoestesia distal leve; diparesia facial; fraqueza de flexão cervical.", { label: "Exame neurológico" }),
    ex("e-respiratorio", "torax_anterior", "inspecao", "Respiração paradoxal discreta; conta até 12 em uma expiração; tosse fraca.", { label: "Mecânica respiratória", better: [{ when: { ruleFired: "r-falencia" }, text: "Respiração paradoxal evidente, uso de musculatura acessória, fala entrecortada." }] }),
    ex("e-degluticao", "boca", "especial", "Engasga ao deglutir água; acúmulo de saliva.", { label: "Deglutição" })
  ],
  testResults: [
    { testId: "cvf_beira_leito", variants: [{ when: { ruleFired: "r-falencia" }, text: "CVF 12 mL/kg (≈ 0,9 L)." }, { text: "CVF 18 mL/kg (≈ 1,4 L); pressão inspiratória máxima reduzida. Abaixo de 20 mL/kg indica intubação eletiva." }] },
    { testId: "gaso_arterial", variants: [{ when: { ruleFired: "r-falencia" }, text: "Acidose respiratória (PaCO₂ elevada) — falência ventilatória tardia." }, { text: "pH e PaCO₂ normais (a gasometria pode ser normal até a falência)." }] },
    { testId: "liquor", variants: [{ text: "Proteína elevada com celularidade normal (dissociação proteinocitológica). (Laudo educativo.)" }] }
  ],
  procedureFailures: [{ actionId: "intubacao", attempts: [] }],
  highlightedActions: ["monitorizar", "acesso_venoso", "jejum_cabeceira", "intubacao"],
  rules: [
    { id: "r-falencia", description: "Sem via aérea em 40 min: falência ventilatória", priority: 50, when: { all: [{ time: "gte", seconds: 2400 }, { not: TOT }] }, repeat: "once", effects: [trend("pco2", 68, 600, "fal", 50), trend("ph", 7.22, 600, "fal", 50), trend("spo2", 86, 600, "fal", 50), trend("rr", 36, 300, "fal", 50), flag("speech", "palavras"), staff("enfermagem", "Ele não consegue mais falar e a saturação está caindo!"), outcome("piora")] },
    { id: "r-parada", description: "Sem via aérea em 55 min: parada respiratória", priority: 100, when: { all: [{ time: "gte", seconds: 3300 }, { not: TOT }] }, repeat: "once", effects: [flag("pulse", false), flag("rhythm", "bradicardia_sinusal"), { type: "setValue", var: "sbp", value: 0 }, flag("consciousness", "irresponsivo"), outcome("parada", true)] },
    { id: "r-iot", description: "Intubação eletiva e ventilação", priority: 70, when: TOT, repeat: "while", effects: [trend("pco2", 40, 600, "vm", 70), trend("ph", 7.4, 600, "vm", 70), trend("spo2", 97, 300, "vm", 70), trend("rr", 16, 300, "vm", 70)], onEnd: [{ type: "clearTrend", var: "pco2", slot: "vm" }] },
    { id: "r-iot-ok", description: "Via aérea garantida antes da falência", priority: 75, when: { all: [TOT, { not: { ruleFired: "r-falencia" } }] }, repeat: "once", effects: [outcome("estabilizacao_parcial")] },
    { id: "r-igiv", description: "Imunoglobulina iniciada", when: IGIV, repeat: "once", effects: [obs("Imunoglobulina IV iniciada (5 dias): acelera a recuperação; efeito em dias a semanas.")] },
    { id: "r-cortico", description: "Corticoide não é eficaz na SGB", when: { any: [{ drugGiven: "metilprednisolona" }, { drugGiven: "prednisona" }, { drugGiven: "hidrocortisona" }] }, repeat: "once", effects: [obs("Corticoides não melhoram o desfecho na síndrome de Guillain-Barré.")] },
    { id: "r-disautonomia", description: "Disautonomia", when: { time: "gte", seconds: 1500 }, repeat: "once", effects: [trend("hr", 128, 300, "auto", 20, 900), trend("sbp", 172, 300, "auto", 20, 900), obs("Oscilação de FC e PA (disautonomia): monitorização contínua; evitar tratamento agressivo de picos transitórios.")] }
  ],
  diagnosis: { primary: "guillain_barre", accepted: ["guillain_barre"], differentials: ["miastenia_crise", "mielite_transversa", "hipocalemia", "botulismo", "avc_isquemico"] },
  acceptedDestinations: ["uti"],
  outcomeNotes: "Fraqueza ascendente arreflexa pós-diarreia: SGB. CVF 18 mL/kg, tosse fraca, disfagia e fraqueza cervical indicam intubação eletiva (regra 20/30/40) — a SpO₂ e a gasometria normalizam até tarde. Imunoglobulina IV (ou plasmaférese), UTI, vigilância de disautonomia e profilaxia de TEV.",
  scoring: [
    { id: "s-evolucao", domain: "historia", description: "Padrão ascendente e infecção prévia", evidence: { kind: "historyAsked", items: ["h-evolucao", "h-infeccao"], minCount: 2 }, points: 6, severity: "importante", rationale: "Sugere SGB." },
    { id: "s-resp", domain: "historia", description: "Sintomas respiratórios e bulbares", evidence: { kind: "historyAsked", items: ["h-respira"], minCount: 1 }, points: 6, severity: "critica", rationale: "Risco de falência e aspiração." },
    { id: "s-exame", domain: "historia", description: "Força, reflexos e mecânica respiratória", evidence: { kind: "examDone", regions: ["neurologico", "torax_anterior", "boca"], minCount: 2 }, points: 6, severity: "critica", rationale: "Arreflexia; respiração paradoxal; disfagia." },
    { id: "s-cvf", domain: "priorizacao", description: "CVF à beira-leito em até 10 min", evidence: { kind: "testOrdered", anyOf: ["cvf_beira_leito"], withinSeconds: 600 }, points: 12, severity: "critica", rationale: "Melhor preditor de falência; SpO₂ é tardia.", sourceIds: ["BR-PCDT-SGB"] },
    { id: "s-exames", domain: "exames", description: "Exames dirigidos (eletrólitos, líquor quando estável)", evidence: { kind: "testsNotExcessive", maxUnjustified: 1, justified: ["cvf_beira_leito", "gaso_arterial", "eletrolitos", "liquor", "cpk", "hemograma", "funcao_renal", "ecg12"] }, points: 4, severity: "menor", rationale: "Excluir hipocalemia; líquor não deve atrasar decisões." },
    { id: "s-iot", domain: "tratamento", description: "Intubação eletiva antes da falência", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-iot-ok" } }, points: 18, severity: "critica", rationale: "CVF < 20 mL/kg, tosse fraca, disfagia." },
    { id: "s-igiv", domain: "tratamento", description: "Imunoglobulina IV", evidence: { kind: "drugGiven", anyOf: ["imunoglobulina"] }, points: 8, severity: "importante", rationale: "Tratamento modificador.", sourceIds: ["BR-PCDT-SGB"] },
    { id: "s-cortico", domain: "tratamento", description: "Falha: corticoide", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-cortico" } }, points: 4, penalty: true, severity: "menor", rationale: "Sem benefício." },
    { id: "s-jejum", domain: "tratamento", description: "Jejum/cabeceira (disfagia)", evidence: { kind: "actionDone", anyOf: ["jejum_cabeceira"] }, points: 3, severity: "importante", rationale: "Aspiração." },
    { id: "s-reav", domain: "reavaliacao", description: "CVF seriada", evidence: { kind: "reassessAfter", after: ["intubacao", "imunoglobulina"], reassess: ["gaso_arterial", "cvf_beira_leito"], withinSeconds: 3600 }, points: 8, severity: "importante", rationale: "Evolução." },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de SGB", evidence: { kind: "diagnosis", accepted: ["guillain_barre"] }, points: 6, severity: "importante", rationale: "Polirradiculoneuropatia aguda." },
    { id: "s-destino", domain: "destino", description: "UTI", evidence: { kind: "disposition", accepted: ["uti"] }, points: 8, severity: "critica", rationale: "Ventilação e disautonomia." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "A saturação está 96%: isso tranquiliza nesta doença?" },
      { level: 2, text: "Que medida à beira-leito prevê falência?" },
      { level: 3, text: "Regra 20/30/40." },
      { level: 4, text: "Sugestão explícita: CVF, jejum, intubação eletiva, imunoglobulina IV, UTI, monitorizar disautonomia." }
    ],
    summary: "Homem de 38 anos com SGB pós-diarreia, tetraparesia arreflexa, diparesia facial, disfagia e CVF 18 mL/kg.",
    pathophysiology: "Mimetismo molecular (ex.: Campylobacter jejuni) gera anticorpos contra gangliosídeos de nervos periféricos, causando desmielinização ou lesão axonal. Fraqueza diafragmática e de musculatura bulbar leva a hipoventilação e aspiração; a hipoxemia é tardia.",
    keyPoints: [
      "Fraqueza ascendente, simétrica e arreflexa.",
      "Monitorar CVF e força cervical; SpO₂ é tardia.",
      "Intubação eletiva: CVF < 20 mL/kg, PImáx > −30, PEmáx < 40 (regra 20/30/40), disfagia.",
      "Imunoglobulina IV ou plasmaférese; corticoide não.",
      "Disautonomia e TEV."
    ],
    alternatives: ["Plasmaférese em centros com o recurso."],
    oralRubric: [
      { id: "o1", concept: "CVF", synonyms: ["cvf", "capacidade vital", "20/30/40"], weight: 3 },
      { id: "o2", concept: "Intubação eletiva", synonyms: ["intubação", "eletiva", "via aérea"], weight: 3 },
      { id: "o3", concept: "Imunoglobulina", synonyms: ["imunoglobulina", "plasmaférese"], weight: 2 },
      { id: "o4", concept: "Disautonomia", synonyms: ["disautonomia", "arritmia", "pressão"], weight: 1 }
    ],
    simplifications: ["Progressão respiratória comprimida.", "Intubação sempre bem-sucedida neste caso."]
  },
  references: ["BR-PCDT-SGB", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 15, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "CVF, jejum, intubação eletiva, imunoglobulina e UTI", commands: [ask(10, "h-evolucao"), ask(20, "h-respira"), { atSeconds: 30, type: "examine", payload: { region: "neurologico", maneuver: "especial" } }, act(40, "monitorizar"), test(60, "cvf_beira_leito"), act(80, "jejum_cabeceira"), act(90, "acesso_venoso"), act(190, "acesso_venoso"), rx(300, "cetamina", "fa50", 80, "mg", "IV"), act(320, "intubacao"), act(500, "ventilacao_mecanica"), rx(600, "imunoglobulina", "fa5g", 0.4, "g/kg", "IV", "infusao_volume", { durationMinutes: 240 }), test(1500, "gaso_arterial"), dx(2000, "guillain_barre"), dest(2000, "uti")], runUntilSeconds: 3500, expect: [{ condition: { ruleFired: "r-iot-ok" }, description: "via aérea eletiva" }, { condition: { not: { ruleFired: "r-falencia" } }, description: "sem falência" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 3400, expect: [{ condition: { ruleFired: "r-falencia" }, description: "falência" }, { condition: { ruleFired: "r-parada" }, description: "parada" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Corticoide e observação pela SpO₂", commands: [act(90, "acesso_venoso"), act(190, "acesso_venoso"), rx(300, "metilprednisolona", "fa125", 125, "mg", "IV")], runUntilSeconds: 3400, expect: [{ condition: { ruleFired: "r-cortico" }, description: "sem benefício" }, { condition: { ruleFired: "r-falencia" }, description: "falência" }] },
    { id: "t-atraso", kind: "delay", description: "Intubação só após falência", commands: [act(90, "acesso_venoso"), act(190, "acesso_venoso"), act(2600, "intubacao")], runUntilSeconds: 3500, expect: [{ condition: { ruleFired: "r-falencia" }, description: "falência" }, { condition: { ruleFired: "r-iot" }, description: "ventilação" }, { condition: { not: { ruleFired: "r-parada" } }, description: "parada evitada" }] },
    { id: "t-alternativa", kind: "alternative", description: "Intubação eletiva sem fármacos adicionais e imunoglobulina", commands: [test(60, "cvf_beira_leito"), act(90, "acesso_venoso"), act(190, "acesso_venoso"), act(300, "intubacao"), rx(600, "imunoglobulina", "fa5g", 0.4, "g/kg", "IV", "infusao_volume", { durationMinutes: 240 })], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-iot-ok" }, description: "via aérea" }] }
  ]
};
