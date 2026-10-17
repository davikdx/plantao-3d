import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const ATB = { any: [{ drugGiven: "ampicilina_sulbactam" }, { drugGiven: "clindamicina" }] };
const CIRURGIA = { actionCompleted: "acionar_bucomaxilo_orl" };

export const C117: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C117",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Homem com dor de dente há 5 dias, pescoço inchado e dificuldade para abrir a boca",
  teachingTitle: "Infecção odontogênica com edema cervical e trismo — reconhecer angina de Ludwig, priorizar a via aérea (posição sentada, via aérea difícil planejada), antibiótico IV, drenagem cirúrgica e UTI; imagem não deve atrasar",
  group: "Outras urgências",
  specialties: ["Cirurgia bucomaxilofacial", "Otorrinolaringologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Reconhecer sinais de gravidade: edema bilateral do assoalho bucal, língua elevada, trismo, disfagia, sialorreia, voz abafada, estridor",
    "Manter o paciente sentado; planejar via aérea difícil (intubação acordada por fibroscopia, cricotireoidostomia disponível)",
    "Antibiótico IV de amplo espectro para flora oral",
    "Acionar bucomaxilo/ORL para drenagem e tratamento do foco",
    "Não atrasar a via aérea ou o centro cirúrgico por tomografia; internar em UTI"
  ],
  keywords: ["dor de dente", "pescoço inchado", "abrir a boca", "engolir", "febre", "baba"],
  patient: {
    name: "Marcos Vinícius Souza",
    ageYears: 34,
    sex: "masculino",
    weightKg: 76,
    heightCm: 176,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 4, hairStyle: "curto", hairColor: "preto", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Homem de 34 anos com dor em molar inferior esquerdo há 5 dias, tomou amoxicilina por conta 2 dias e parou. Desde ontem o pescoço inchou, abre pouco a boca e tem dificuldade para engolir. Fala 'abafado' e prefere ficar sentado.",
  communication: "limitada",
  informants: [{ id: "paciente", name: "Marcos", role: "Paciente" }],
  history: [
    hi("h-dente", "inicio", "Desde quando a dor de dente? O inchaço começou de um lado e passou para o outro?", [{ source: "paciente", text: "Dente de baixo do lado esquerdo há 5 dias. Ontem inchou embaixo do queixo, hoje os dois lados." }], ["dente", "inchaço", "lado", "desde"]),
    hi("h-via-aerea", "sinais_alarme", "Consegue engolir a saliva? Falta de ar, barulho para respirar? Piora deitado?", [{ source: "paciente", text: "Engolir dói muito, estou babando. Deitado sinto que sufoco." }], ["engolir", "saliva", "falta de ar", "barulho", "deitado"]),
    hi("h-comorbidades", "antecedentes", "Tem diabetes, HIV, usa corticoide? Alergia a penicilina?", [{ source: "paciente", text: "Não sei de doença. Sem alergia, tomei amoxicilina." }], ["diabetes", "hiv", "corticoide", "alergia"])
  ],
  initial: {
    vars: { hr: 118, sbp: 128, dbp: 78, rr: 22, spo2: 96, temp: 38.9, gcs: 15, pain: 8, glucose: 132, perfusion: 0.8, effort: 0.3, wbc: 19800 },
    flags: { rhythm: "taquicardia_sinusal", posture: "sentado", painVisual: "intensa", speech: "frases", consciousness: "alerta", sweating: true },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-pescoco", "pescoco", "palpacao", "Edema endurecido ('lenhoso') submandibular e submentoniano bilateral, eritema, sem flutuação definida; crepitação ausente.", { label: "Pescoço" }),
    ex("e-boca", "boca", "inspecao", "Abertura oral de 1,5 cm (trismo); assoalho bucal elevado e endurecido, língua projetada para cima; sialorreia; dente 36 com cárie extensa.", { label: "Cavidade oral" }),
    ex("e-via", "torax_anterior", "ausculta", "Sem estridor no momento; murmúrio vesicular presente.", { label: "Via aérea/tórax", better: [{ when: { ruleFired: "r-obstrucao" }, text: "Estridor inspiratório; uso de musculatura acessória." }] })
  ],
  testResults: [
    { testId: "tc_pescoco", variants: [{ text: "Celulite/flegmão dos espaços submandibular, sublingual e submentoniano bilateral, com coleção de 2 cm junto ao dente 36; redução da coluna aérea orofaríngea." }] },
    { testId: "hemograma", variants: [{ text: "Leucócitos 19.800 com desvio." }] },
    { testId: "hemocultura", variants: [{ text: "Em andamento." }] }
  ],
  highlightedActions: ["acionar_bucomaxilo_orl", "acesso_venoso", "o2_cateter", "chamar_ajuda"],
  rules: [
    { id: "r-atb", description: "Antibiótico IV", priority: 30, when: ATB, repeat: "once", effects: [trend("temp", 38.2, 3600, "atb", 30), trend("hr", 108, 1800, "atb", 30)] },
    { id: "r-cirurgia", description: "Cirurgia acionada", priority: 40, when: CIRURGIA, repeat: "once", effects: [staff("supervisor", "Bucomaxilo/ORL e anestesia: intubação acordada por fibroscopia no centro cirúrgico com material de cricotireoidostomia pronto; drenagem cervical e extração do 36."), outcome("estabilizacao_parcial")] },
    { id: "r-tc-supino", description: "Deitado para TC antes de garantir a via aérea", priority: 45, when: { all: [{ testCollected: "tc_pescoco" }, { not: CIRURGIA }] }, repeat: "once", effects: [trend("spo2", 88, 300, "tc", 45), flag("stridor", true), staff("enfermagem", "No tomógrafo, deitado, ele começou a fazer barulho para respirar e saturou 88%!"), obs("A tomografia exige decúbito e não deve atrasar a via aérea nem o centro cirúrgico."), outcome("piora")] },
    { id: "r-obstrucao", description: "Progressão para obstrução de via aérea", priority: 35, when: { all: [{ time: "gte", seconds: 2400 }, { not: CIRURGIA }] }, repeat: "once", effects: [trend("spo2", 89, 600, "obs", 35), trend("rr", 30, 600, "obs", 35), flag("stridor", true), outcome("piora")] },
    { id: "r-alta", description: "Alta com antibiótico oral", priority: 50, when: { any: [{ path: "disposition", op: "eq", value: "alta_orientada" }, { path: "disposition", op: "eq", value: "encaminhamento_ambulatorial" }, { path: "disposition", op: "eq", value: "alta_com_seguimento_ubs" }] }, repeat: "once", effects: [obs("Infecção de espaços cervicais com trismo e disfagia ameaça a via aérea: internação, antibiótico IV e drenagem."), outcome("complicacao")] }
  ],
  diagnosis: { primary: "infeccao_odontogenica_grave", accepted: ["infeccao_odontogenica_grave"], differentials: ["abscesso_dentario_localizado", "celulite", "anafilaxia", "angioedema_bradicinina"] },
  acceptedDestinations: ["centro_cirurgico", "uti"],
  outcomeNotes: "Angina de Ludwig de origem no dente 36: edema lenhoso bilateral do assoalho bucal, trismo, disfagia, sialorreia, febre e leucocitose, ainda sem estridor. Manter sentado, O2, monitor, acesso, chamar ajuda/anestesia, ampicilina-sulbactam (ou clindamicina) IV, hemoculturas, bucomaxilo/ORL para drenagem no centro cirúrgico com via aérea difícil planejada e UTI no pós-operatório.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Evolução e sinais de via aérea", evidence: { kind: "historyAsked", items: ["h-dente", "h-via-aerea"], minCount: 2 }, points: 10, severity: "critica", rationale: "Disfagia, sialorreia, ortopneia.", sourceIds: ["INT-WIKEM-LUDWIG"] },
    { id: "s-comorb", domain: "historia", description: "Imunossupressão e alergia", evidence: { kind: "historyAsked", items: ["h-comorbidades"], minCount: 1 }, points: 4, severity: "importante", rationale: "Escolha do antibiótico." },
    { id: "s-exame", domain: "historia", description: "Exame cervical e oral", evidence: { kind: "examDone", regions: ["pescoco", "boca"], minCount: 2 }, points: 10, severity: "critica", rationale: "Assoalho lenhoso, trismo." },
    { id: "s-mon", domain: "priorizacao", description: "Monitorização e O2; chamar ajuda", evidence: { kind: "actionDone", anyOf: ["monitorizar", "chamar_ajuda"], withinSeconds: 600 }, points: 6, severity: "importante", rationale: "Via aérea difícil antecipada." },
    { id: "s-acesso", domain: "priorizacao", description: "Acesso venoso", evidence: { kind: "actionDone", anyOf: ["acesso_venoso"], withinSeconds: 600 }, points: 4, severity: "importante", rationale: "Antibiótico IV." },
    { id: "s-atb", domain: "tratamento", description: "Antibiótico IV", evidence: { kind: "drugGiven", anyOf: ["ampicilina_sulbactam", "clindamicina"], routes: ["IV"], withinSeconds: 1500 }, points: 18, severity: "critica", rationale: "Flora oral polimicrobiana.", sourceIds: ["INT-WIKEM-LUDWIG"] },
    { id: "s-cirurgia", domain: "tratamento", description: "Bucomaxilo/ORL para drenagem", evidence: { kind: "actionDone", anyOf: ["acionar_bucomaxilo_orl"], withinSeconds: 1800 }, points: 22, severity: "critica", rationale: "Drenagem e foco.", sourceIds: ["INT-WIKEM-LUDWIG"] },
    { id: "s-cultura", domain: "exames", description: "Hemograma/hemocultura", evidence: { kind: "testOrdered", anyOf: ["hemograma", "hemocultura"] }, points: 4, severity: "importante", rationale: "Gravidade." },
    { id: "s-tc", domain: "priorizacao", description: "Falha: deitado para TC antes da via aérea", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-tc-supino" } }, points: 12, penalty: true, severity: "critica", rationale: "Imagem não deve atrasar.", sourceIds: ["INT-WIKEM-LUDWIG"] },
    { id: "s-obst", domain: "priorizacao", description: "Falha: obstrução por atraso", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-obstrucao" } }, points: 12, penalty: true, severity: "critica", rationale: "Atraso cirúrgico." },
    { id: "s-dx", domain: "destino", description: "Infecção odontogênica de espaços cervicais (Ludwig)", evidence: { kind: "diagnosis", accepted: ["infeccao_odontogenica_grave"] }, points: 10, severity: "importante", rationale: "Bilateral, assoalho bucal." },
    { id: "s-destino", domain: "destino", description: "Centro cirúrgico/UTI", evidence: { kind: "disposition", accepted: ["centro_cirurgico", "uti"] }, points: 12, severity: "critica", rationale: "Drenagem e vigilância da via aérea.", sourceIds: ["INT-WIKEM-LUDWIG"] }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Baba, voz abafada, trismo e prefere ficar sentado: o que está em risco?" },
      { level: 2, text: "Quem precisa ser chamado agora para a via aérea e a drenagem?" },
      { level: 3, text: "É seguro deitá-lo para a tomografia antes de definir a via aérea?" },
      { level: 4, text: "Sugestão explícita: sentado, monitor, chamar ajuda, acesso, ampicilina-sulbactam IV, hemograma, bucomaxilo/ORL, centro cirúrgico." }
    ],
    summary: "Angina de Ludwig de origem dentária com ameaça à via aérea.",
    pathophysiology: "Infecção polimicrobiana de molar inferior dissemina-se pelos espaços submandibular, sublingual e submentoniano, elevando o assoalho e a língua e comprimindo a via aérea superior; pode progredir para mediastinite.",
    keyPoints: [
      "Via aérea primeiro: sentado, preparar via aérea difícil (fibroscopia acordado, cricotireoidostomia disponível).",
      "Antibiótico IV: ampicilina-sulbactam (ou penicilina + metronidazol; clindamicina se alergia).",
      "Drenagem cirúrgica e tratamento do dente.",
      "TC não deve atrasar via aérea/centro cirúrgico; decúbito pode descompensar.",
      "UTI para vigilância da via aérea."
    ],
    alternatives: ["Clindamicina IV se alergia a penicilina.", "Penicilina G cristalina + metronidazol."],
    oralRubric: [
      { id: "o1", concept: "Via aérea", synonyms: ["via aérea", "sentado", "fibroscopia", "cricotireoidostomia"], weight: 3 },
      { id: "o2", concept: "Antibiótico", synonyms: ["ampicilina", "sulbactam", "clindamicina", "metronidazol"], weight: 2 },
      { id: "o3", concept: "Drenagem", synonyms: ["drenagem", "bucomaxilo", "cirurgia", "dente"], weight: 3 },
      { id: "o4", concept: "Imagem não atrasa", synonyms: ["tomografia", "deitar", "atrasar"], weight: 2 }
    ],
    simplifications: ["Intubação acordada realizada pela equipe no centro cirúrgico (fora da simulação).", "Corticoide não incluído (não abordado pela fonte)."]
  },
  references: ["INT-WIKEM-LUDWIG", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "História, exame, monitor, ajuda, acesso, ampicilina-sulbactam, exames, cirurgia, centro cirúrgico", commands: [ask(10, "h-dente"), ask(20, "h-via-aerea"), { atSeconds: 30, type: "examine", payload: { region: "pescoco", maneuver: "palpacao" } }, { atSeconds: 40, type: "examine", payload: { region: "boca", maneuver: "inspecao" } }, act(50, "monitorizar"), act(60, "chamar_ajuda"), act(80, "acesso_venoso"), test(190, "hemograma"), test(200, "hemocultura"), rx(400, "ampicilina_sulbactam", "fa3g", 3000, "mg", "IV"), act(420, "acionar_bucomaxilo_orl"), ask(600, "h-comorbidades"), dx(800, "infeccao_odontogenica_grave"), dest(1200, "centro_cirurgico")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-cirurgia" }, description: "cirurgia" }, { condition: { not: { ruleFired: "r-obstrucao" } }, description: "sem obstrução" }, { condition: { not: { ruleFired: "r-tc-supino" } }, description: "sem TC precoce" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-obstrucao" }, description: "obstrução" }] },
    { id: "t-inadequada", kind: "inadequate", description: "TC primeiro, depois antibiótico oral e alta", commands: [act(30, "acesso_venoso"), test(130, "tc_pescoco"), dest(1800, "encaminhamento_ambulatorial")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-tc-supino" }, description: "decúbito na TC" }, { condition: { ruleFired: "r-alta" }, description: "alta" }] },
    { id: "t-atraso", kind: "delay", description: "Cirurgia acionada tardiamente", commands: [act(30, "acesso_venoso"), rx(200, "ampicilina_sulbactam", "fa3g", 3000, "mg", "IV"), act(2600, "acionar_bucomaxilo_orl"), dest(3000, "centro_cirurgico")], runUntilSeconds: 3400, expect: [{ condition: { ruleFired: "r-obstrucao" }, description: "obstrução" }, { condition: { ruleFired: "r-cirurgia" }, description: "cirurgia tardia" }] },
    { id: "t-alternativa", kind: "alternative", description: "Clindamicina; TC após plano de via aérea definido; UTI", commands: [act(20, "chamar_ajuda"), act(30, "acionar_bucomaxilo_orl"), act(40, "acesso_venoso"), rx(150, "clindamicina", "amp600", 600, "mg", "IV"), test(500, "tc_pescoco"), dest(1800, "uti")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-cirurgia" }, description: "cirurgia" }, { condition: { not: { ruleFired: "r-tc-supino" } }, description: "TC após plano" }] }
  ]
};
