import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const VIA_DEFINITIVA = { all: [{ deviceActive: "tot" }, { any: [{ not: { ruleFired: "r-obstrucao" } }, { actionCompleted: "cricotireoidostomia" }] }] };

export const C023: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C023",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Língua e lábios inchando rápido, voz abafada e chiado ao respirar",
  teachingTitle: "Angioedema por bradicinina (IECA) com obstrução progressiva de via aérea superior",
  group: "Pneumologia",
  specialties: ["Emergência", "Anestesiologia", "Alergia e imunologia"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 4,
  level: "residencia",
  objectives: [
    "Reconhecer obstrução progressiva de via aérea superior (estridor, voz abafada, sialorreia)",
    "Diferenciar angioedema por bradicinina de anafilaxia",
    "Suspender IECA e não confiar apenas em adrenalina/anti-histamínico/corticoide",
    "Garantir via aérea definitiva precocemente, com plano de resgate cirúrgico",
    "Acionar ajuda experiente sem atraso"
  ],
  keywords: ["inchaço", "língua", "lábio", "falta de ar", "voz"],
  patient: {
    name: "Edvaldo Cruz",
    ageYears: 61,
    sex: "masculino",
    weightKg: 88,
    heightCm: 170,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 5, hairStyle: "crespo_curto", hairColor: "grisalho", build: "robusto", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Homem de 61 anos acordou com o lábio inferior inchado; em 2 horas a língua também inchou, a voz ficou abafada e há ruído ao respirar. Usa enalapril há 2 anos.",
  communication: "limitada",
  informants: [{ id: "esposa", name: "Rosa", role: "Esposa" }],
  history: [
    h("h-queixa", "queixa", "O que está acontecendo?", "(voz abafada) Inchou… a língua… difícil engolir.", { keywords: ["acontecendo", "inchou"] }),
    hi("h-medicacoes", "medicacoes", "Que remédios ele usa? Algum novo?", [{ source: "esposa", text: "Enalapril há dois anos, e hidroclorotiazida. Nada novo." }], ["remédio", "enalapril", "novo"]),
    hi("h-alergia", "alergias", "Comeu algo diferente, foi picado, tem alergias? Teve coceira ou manchas?", [{ source: "esposa", text: "Não comeu nada diferente. Não tem coceira nem manchas no corpo." }], ["alergia", "coceira", "manchas", "picada"]),
    hi("h-antes", "antecedentes", "Já teve inchaço assim antes?", [{ source: "esposa", text: "Há uns meses o lábio inchou um pouco e passou sozinho." }], ["antes"]),
    hi("h-familia", "familia", "Alguém na família tem inchaços repetidos?", [{ source: "esposa", text: "Não que saibamos." }], ["família"])
  ],
  initial: {
    vars: { hr: 104, sbp: 154, dbp: 90, rr: 24, spo2: 95, temp: 36.6, gcs: 15, pain: 3, glucose: 112, perfusion: 0.85, effort: 0.5 },
    flags: { rhythm: "taquicardia_sinusal", angioedema: true, stridor: true, urticaria: false, airway: "obstruida_parcial", posture: "sentado", speech: "palavras", communication: "limitada", consciousness: "alerta", painVisual: "leve" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-boca", "boca", "inspecao", "Edema importante de lábio inferior e língua, assoalho da boca elevado; sialorreia; sem urticária.", { label: "Boca e língua", better: [{ when: { ruleFired: "r-obstrucao" }, text: "Língua protrusa, não cabe na boca; não consegue deglutir saliva." }] }),
    ex("e-pescoco", "pescoco", "ausculta", "Estridor inspiratório audível.", { sound: "estridor" }),
    ex("e-pele", "pele", "inspecao", "Sem urticária, sem eritema.", {}),
    ex("e-pulmao", "torax_posterior", "ausculta", "Murmúrio presente, sem sibilos.", { sound: "murmurio_normal" })
  ],
  testResults: [],
  procedureFailures: [{ actionId: "intubacao", attempts: [] }],
  highlightedActions: ["chamar_ajuda", "posicionar_via_aerea", "o2_mascara_reservatorio", "intubacao", "cricotireoidostomia"],
  rules: [
    { id: "r-adrenalina", description: "Adrenalina tem pouco efeito no angioedema por bradicinina", when: { drugGiven: "adrenalina" }, repeat: "once", effects: [trend("hr", 122, 60, "adr", 30, 600), obs("Após adrenalina: discreta melhora transitória do estridor, sem regressão do edema (mecanismo não histaminérgico).")] },
    { id: "r-anti-h", description: "Anti-histamínico/corticoide sem efeito", when: { any: [{ drugGiven: "prometazina" }, { drugGiven: "hidrocortisona" }, { drugGiven: "metilprednisolona" }] }, repeat: "once", effects: [obs("Anti-histamínico/corticoide não atuam no angioedema mediado por bradicinina; não atrasar a via aérea.")] },
    { id: "r-obstrucao", description: "Sem via aérea definitiva em 15 min: obstrução crítica", priority: 60, when: { all: [{ time: "gte", seconds: 900 }, { not: { deviceActive: "tot" } }] }, repeat: "once", effects: [flag("airway", "obstruida"), trend("spo2", 82, 180, "obstr", 60), trend("rr", 32, 120, "obstr", 60), flag("speech", "nenhuma"), flag("cyanosis", true), staff("enfermagem", "Ele não está conseguindo respirar! Saturação 82!"), outcome("piora")] },
    { id: "r-intubacao-tardia", description: "Intubação após obstrução crítica: impossível pela via oral", priority: 90, when: { all: [{ ruleFired: "r-obstrucao" }, { actionCompleted: "intubacao" }, { not: { actionCompleted: "cricotireoidostomia" } }] }, repeat: "once", effects: [{ type: "removeDevice", device: "tot" }, obs("Laringoscopia impossível: edema de língua e supraglote. Situação \"não intubo, não oxigeno\": indicada cricotireoidostomia.")] },
    { id: "r-pcr-hipoxica", description: "Sem via aérea em 22 min: PCR hipóxica", priority: 100, when: { all: [{ time: "gte", seconds: 1320 }, { not: VIA_DEFINITIVA }] }, repeat: "once", effects: [flag("pulse", false), flag("rhythm", "bradicardia_sinusal"), { type: "setValue", var: "hr", value: 30 }, { type: "setValue", var: "sbp", value: 0 }, flag("consciousness", "irresponsivo"), outcome("parada", true)] },
    { id: "r-via-aerea", description: "Via aérea definitiva: oxigenação restaurada", priority: 80, when: VIA_DEFINITIVA, repeat: "while", effects: [trend("spo2", 97, 120, "via", 80), trend("rr", 16, 120, "via", 80)], onEnd: [{ type: "clearTrend", var: "spo2", slot: "via" }] },
    { id: "r-via-ok", description: "Via aérea garantida", priority: 85, when: VIA_DEFINITIVA, repeat: "once", effects: [flag("airway", "protegida"), outcome("estabilizacao_parcial")] }
  ],
  diagnosis: { primary: "angioedema_bradicinina", accepted: ["angioedema_bradicinina"], differentials: ["anafilaxia", "urticaria_aguda", "aspiracao_corpo_estranho", "crupe"] },
  acceptedDestinations: ["uti"],
  outcomeNotes: "Angioedema de língua/lábio sem urticária em usuário de IECA: mediado por bradicinina; responde pouco a adrenalina, anti-histamínico e corticoide. Com estridor e voz abafada, a via aérea deve ser garantida cedo (por equipe experiente, preferencialmente com fibroscopia acordado), com cricotireoidostomia preparada. Suspender IECA definitivamente.",
  scoring: [
    { id: "s-ieca", domain: "historia", description: "Identificou uso de IECA e ausência de urticária/alérgeno", evidence: { kind: "historyAsked", items: ["h-medicacoes", "h-alergia"], minCount: 2 }, points: 8, severity: "critica", rationale: "Distingue bradicinina de histamina." },
    { id: "s-exame", domain: "historia", description: "Avaliou boca, estridor e pele", evidence: { kind: "examDone", regions: ["boca", "pescoco", "pele"], minCount: 2 }, points: 6, severity: "importante", rationale: "Sinais de obstrução iminente." },
    { id: "s-ajuda", domain: "priorizacao", description: "Chamou ajuda experiente imediatamente", evidence: { kind: "actionDone", anyOf: ["chamar_ajuda"], withinSeconds: 120 }, points: 10, severity: "critica", rationale: "Via aérea difícil prevista." },
    { id: "s-o2", domain: "priorizacao", description: "O₂ e posição sentada", evidence: { kind: "actionDone", anyOf: ["o2_mascara_reservatorio", "o2_cateter", "posicionar_via_aerea"], withinSeconds: 300 }, points: 4, severity: "importante", rationale: "Pré-oxigenação." },
    { id: "s-exames", domain: "exames", description: "Não atrasou a via aérea com exames", evidence: { kind: "testsNotExcessive", maxUnjustified: 0, justified: [] }, points: 10, severity: "importante", rationale: "Diagnóstico clínico; prioridade é via aérea." },
    { id: "s-via", domain: "tratamento", description: "Via aérea definitiva antes da obstrução crítica (15 min)", evidence: { kind: "stateAtEnd", when: { all: [VIA_DEFINITIVA, { not: { ruleFired: "r-obstrucao" } }] } }, points: 20, severity: "critica", rationale: "Edema progressivo pode tornar a intubação impossível." },
    { id: "s-crico", domain: "tratamento", description: "Via aérea cirúrgica quando a intubação ficou impossível", evidence: { kind: "stateAtEnd", when: { any: [{ not: { ruleFired: "r-obstrucao" } }, { actionCompleted: "cricotireoidostomia" }] } }, points: 5, severity: "critica", rationale: "Resgate na situação não intubo/não oxigeno." },
    { id: "s-reav", domain: "reavaliacao", description: "Confirmou via aérea e oxigenação", evidence: { kind: "reassessAfter", after: ["intubacao", "cricotireoidostomia"], reassess: ["oximetria_portatil", "capnografia"], withinSeconds: 900 }, points: 10, severity: "importante", rationale: "Capnografia confirma posição." },
    { id: "s-dx", domain: "destino", description: "Diagnóstico de angioedema por bradicinina", evidence: { kind: "diagnosis", accepted: ["angioedema_bradicinina"] }, points: 7, severity: "importante", rationale: "IECA, sem urticária, sem resposta a adrenalina." },
    { id: "s-destino", domain: "destino", description: "UTI", evidence: { kind: "disposition", accepted: ["uti"] }, points: 10, severity: "importante", rationale: "Via aérea artificial até regressão do edema." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Onde está a ameaça à vida?" },
      { level: 2, text: "Edema sem urticária em quem usa enalapril…" },
      { level: 3, text: "A janela para intubar com segurança está fechando." },
      { level: 4, text: "Sugestão explícita: chamar ajuda, O₂, preparar via aérea difícil e cricotireoidostomia, intubar cedo, suspender IECA, UTI." }
    ],
    summary: "Homem de 61 anos em uso de enalapril com angioedema de língua/lábio sem urticária, estridor e voz abafada — obstrução progressiva de via aérea.",
    pathophysiology: "IECA reduzem a degradação de bradicinina, que aumenta a permeabilidade vascular e causa edema profundo, sem urticária nem prurido. Por não ser mediado por histamina, responde mal a adrenalina, anti-histamínicos e corticoides; o edema pode progredir por horas.",
    keyPoints: [
      "Angioedema sem urticária em usuário de IECA: bradicinina.",
      "Sinais de alarme: estridor, voz abafada, sialorreia, edema de língua.",
      "Via aérea precoce por equipe experiente; plano B cirúrgico pronto.",
      "Adrenalina/anti-H/corticoide têm efeito limitado.",
      "Suspender IECA para sempre; opções específicas (icatibanto, inibidor de C1) conforme disponibilidade."
    ],
    alternatives: ["Intubação com fibroscopia em paciente acordado (não modelada).", "Icatibanto ou concentrado de inibidor de C1, quando disponíveis; plasma fresco é alternativa citada em alguns protocolos (não modelados)."],
    oralRubric: [
      { id: "o1", concept: "Via aérea precoce", synonyms: ["via aérea", "intubação", "precoce"], weight: 3 },
      { id: "o2", concept: "Bradicinina/IECA", synonyms: ["bradicinina", "ieca", "enalapril"], weight: 2 },
      { id: "o3", concept: "Plano cirúrgico", synonyms: ["cricotireoidostomia", "cirúrgica", "plano b"], weight: 2 },
      { id: "o4", concept: "Pouca resposta à adrenalina", synonyms: ["adrenalina", "anti-histamínico", "corticoide"], weight: 1 }
    ],
    simplifications: ["Intubação antes da obstrução crítica é sempre bem-sucedida; depois, é impossível — simplificação didática.", "Tempos de progressão são do autor."]
  },
  references: ["INT-WAO-ANAFILAXIA", "BR-SAMU-SAV", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 10, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "IECA, ajuda, O₂, intubação precoce e UTI", commands: [ask(10, "h-medicacoes"), ask(20, "h-alergia"), act(30, "chamar_ajuda"), act(40, "o2_mascara_reservatorio", { fluxo: 15 }), act(50, "acesso_venoso"), act(150, "acesso_venoso"), rx(250, "cetamina", "fa50", 90, "mg", "IV"), act(260, "intubacao"), act(500, "capnografia"), dx(1000, "angioedema_bradicinina"), dest(1000, "uti")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-via-ok" }, description: "via aérea garantida" }, { condition: { not: { ruleFired: "r-obstrucao" } }, description: "sem obstrução crítica" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 1400, expect: [{ condition: { ruleFired: "r-obstrucao" }, description: "obstrução" }, { condition: { ruleFired: "r-pcr-hipoxica" }, description: "PCR" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Trata como anafilaxia e aguarda", commands: [rx(60, "adrenalina", "amp1mg", 0.5, "mg", "IM"), act(70, "acesso_venoso"), act(170, "acesso_venoso"), rx(200, "hidrocortisona", "fa500", 500, "mg", "IV")], runUntilSeconds: 1400, expect: [{ condition: { ruleFired: "r-adrenalina" }, description: "pouco efeito" }, { condition: { ruleFired: "r-anti-h" }, description: "sem efeito" }, { condition: { ruleFired: "r-obstrucao" }, description: "obstrução" }] },
    { id: "t-atraso", kind: "delay", description: "Tenta intubar após obstrução; cricotireoidostomia", commands: [act(950, "intubacao"), act(1100, "cricotireoidostomia")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-intubacao-tardia" }, description: "intubação impossível" }, { condition: { ruleFired: "r-via-ok" }, description: "via aérea cirúrgica" }] },
    { id: "t-alternativa", kind: "alternative", description: "Intubação precoce sem fármacos (paciente colaborativo, equipe experiente)", commands: [act(30, "chamar_ajuda"), act(60, "intubacao")], runUntilSeconds: 1000, expect: [{ condition: { ruleFired: "r-via-ok" }, description: "via aérea" }] }
  ]
};
