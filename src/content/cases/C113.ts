import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const CIRURGIA = { actionCompleted: "solicitar_avaliacao_cirurgica" };
const ANALGESIA = { any: [{ drugGiven: "dipirona" }, { drugGiven: "morfina" }] };

export const C113: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C113",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Adolescente de 15 anos que acordou com dor forte no testículo e vomitou",
  teachingTitle: "Dor testicular súbita — suspeitar de torção, escore TWIST, cirurgia imediata sem esperar exame de imagem se alta suspeita, analgesia, jejum; diferenciar de epididimite",
  group: "Outras urgências",
  specialties: ["Urologia", "Cirurgia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 2,
  level: "internato",
  objectives: [
    "Tratar toda dor testicular aguda como torção até prova em contrário",
    "Examinar o escroto (posição, consistência, reflexo cremastérico) e aplicar o TWIST",
    "Acionar cirurgia/urologia imediatamente; não atrasar por Doppler quando a suspeita é alta",
    "Analgesia e jejum",
    "Não tratar como epididimite sem excluir torção"
  ],
  keywords: ["dor no testículo", "acordou", "vômito", "adolescente", "virilha", "saco"],
  patient: {
    name: "Gabriel Rocha",
    ageYears: 15,
    sex: "masculino",
    weightKg: 58,
    heightCm: 172,
    visual: { ageGroup: "adolescente", sex: "masculino", skinTone: 3, hairStyle: "curto", hairColor: "preto", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional, 6 h da manhã. Adolescente de 15 anos trazido pela mãe: acordou há 2 horas com dor intensa no testículo esquerdo, vomitou duas vezes. Está encolhido na maca.",
  communication: "normal",
  informants: [{ id: "paciente", name: "Gabriel", role: "Paciente" }, { id: "mae", name: "Mãe", role: "Mãe" }],
  history: [
    hi("h-inicio", "inicio", "A dor começou de repente? Há quanto tempo? Já teve episódios parecidos que passaram sozinhos?", [{ source: "paciente", text: "Acordei com ela, de repente, há umas duas horas. Mês passado tive uma dor rápida que passou em minutos." }], ["repente", "tempo", "antes", "episódios"]),
    hi("h-associados", "fatores_associados", "Vomitou? Febre? Ardência para urinar ou corrimento?", [{ source: "paciente", text: "Vomitei duas vezes. Sem febre, sem ardência, sem corrimento." }], ["vomitou", "febre", "urinar", "corrimento"]),
    hi("h-trauma", "exposicao", "Teve pancada, esforço ou relação sexual recente?", [{ source: "paciente", text: "Não teve pancada. Nunca tive relação." }], ["pancada", "trauma", "relação"]),
    hi("h-jejum", "alimentacao_eliminacoes", "Que horas comeu ou bebeu algo pela última vez?", [{ source: "mae", text: "Jantou às 20 h; só bebeu água agora há pouco." }], ["comeu", "bebeu", "jejum"])
  ],
  initial: {
    vars: { hr: 104, sbp: 128, dbp: 76, rr: 18, spo2: 99, temp: 36.8, gcs: 15, pain: 9, glucose: 96, perfusion: 0.9, effort: 0.1 },
    flags: { rhythm: "sinusal", posture: "antalgica", painVisual: "intensa", speech: "frases", consciousness: "alerta", sweating: true },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-escroto", "pelve", "inspecao", "Hemiescroto esquerdo edemaciado e eritematoso; testículo esquerdo alto, horizontalizado, endurecido e muito doloroso.", { label: "Escroto (inspeção e palpação)" }),
    ex("e-cremaster", "pelve", "especial", "Reflexo cremastérico ausente à esquerda, presente à direita.", { label: "Reflexo cremastérico" }),
    ex("e-abdome", "abdome_qie", "palpacao", "Abdome flácido, dor leve em fossa ilíaca esquerda referida; sem hérnia inguinal.", { label: "Abdome/região inguinal" })
  ],
  testResults: [
    { testId: "usg_doppler_escrotal", variants: [{ text: "Testículo esquerdo aumentado, heterogêneo, fluxo ausente ao Doppler; sinal do redemoinho no cordão." }] },
    { testId: "urina_tipo1", variants: [{ text: "Sem alterações." }] }
  ],
  highlightedActions: ["solicitar_avaliacao_cirurgica", "jejum_cabeceira", "acesso_venoso"],
  rules: [
    { id: "r-analgesia", description: "Analgesia", priority: 20, when: ANALGESIA, repeat: "once", effects: [trend("pain", 5, 600, "anal", 20)] },
    { id: "r-cirurgia", description: "Cirurgia acionada precocemente", priority: 40, when: { all: [CIRURGIA, { not: { ruleFired: "r-isquemia" } }] }, repeat: "once", effects: [staff("supervisor", "Cirurgião/urologista: alta suspeita de torção — exploração escrotal de urgência; centro cirúrgico avisado."), outcome("melhora")] },
    { id: "r-isquemia", description: "Isquemia prolongada", priority: 30, when: { all: [{ time: "gte", seconds: 2700 }, { not: CIRURGIA }] }, repeat: "once", effects: [trend("pain", 6, 900, "isq", 30), obs("A dor está diminuindo — pode ser necrose, não melhora. Cada minuto reduz a chance de salvar o testículo."), outcome("complicacao")] },
    { id: "r-epididimite", description: "Tratado como epididimite", priority: 35, when: { all: [{ any: [{ drugGiven: "ceftriaxona" }, { drugGiven: "doxiciclina" }, { drugGiven: "ciprofloxacino" }] }, { not: CIRURGIA }] }, repeat: "once", effects: [obs("Início súbito, vômitos, testículo alto e sem cremastérico sugerem torção: antibiótico para epididimite atrasa a cirurgia.")] },
    { id: "r-alta", description: "Alta", priority: 50, when: { any: [{ path: "disposition", op: "eq", value: "alta_orientada" }, { path: "disposition", op: "eq", value: "alta_com_seguimento_ubs" }, { path: "disposition", op: "eq", value: "encaminhamento_ambulatorial" }] }, repeat: "once", effects: [obs("Suspeita de torção testicular é emergência cirúrgica."), outcome("complicacao")] }
  ],
  diagnosis: { primary: "torcao_testicular", accepted: ["torcao_testicular"], differentials: ["epididimite", "torcao_apendice_testicular", "apendicite"] },
  acceptedDestinations: ["centro_cirurgico"],
  outcomeNotes: "Torção testicular esquerda (dor súbita, vômitos, testículo alto e horizontalizado, endurecido, cremastérico ausente; TWIST 7) em adolescente. Analgesia, jejum, acesso e cirurgia/urologia imediatamente para exploração escrotal (com orquidopexia bilateral), sem esperar Doppler; Doppler apenas em paralelo se não atrasar.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Início súbito, episódios prévios e vômitos", evidence: { kind: "historyAsked", items: ["h-inicio", "h-associados"], minCount: 2 }, points: 10, severity: "critica", rationale: "Componentes clínicos do TWIST.", sourceIds: ["INT-EMCASES-TORCAO-2020"] },
    { id: "s-exame", domain: "historia", description: "Exame escrotal e reflexo cremastérico", evidence: { kind: "examDone", regions: ["pelve"], minCount: 1 }, points: 14, severity: "critica", rationale: "TWIST 7 = cirurgia sem imagem.", sourceIds: ["INT-EMCASES-TORCAO-2020"] },
    { id: "s-cirurgia", domain: "priorizacao", description: "Cirurgia/urologia imediata", evidence: { kind: "actionDone", anyOf: ["solicitar_avaliacao_cirurgica"], withinSeconds: 900 }, points: 28, severity: "critica", rationale: "Toda suspeita é emergência cirúrgica.", sourceIds: ["INT-EMCASES-TORCAO-2020"] },
    { id: "s-analgesia", domain: "tratamento", description: "Analgesia IV", evidence: { kind: "drugGiven", anyOf: ["dipirona", "morfina"], withinSeconds: 900 }, points: 8, severity: "importante", rationale: "Dor intensa." },
    { id: "s-jejum", domain: "priorizacao", description: "Jejum e acesso", evidence: { kind: "actionDone", anyOf: ["jejum_cabeceira", "acesso_venoso"] }, points: 6, severity: "importante", rationale: "Preparo cirúrgico." },
    { id: "s-jejum-hist", domain: "historia", description: "Hora da última refeição", evidence: { kind: "historyAsked", items: ["h-jejum"], minCount: 1 }, points: 4, severity: "importante", rationale: "Anestesia." },
    { id: "s-isquemia", domain: "priorizacao", description: "Falha: atraso para cirurgia", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-isquemia" } }, points: 15, penalty: true, severity: "critica", rationale: "Perda testicular." },
    { id: "s-epid", domain: "tratamento", description: "Falha: tratado como epididimite", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-epididimite" } }, points: 8, penalty: true, severity: "importante", rationale: "Atraso diagnóstico." },
    { id: "s-dx", domain: "destino", description: "Torção testicular", evidence: { kind: "diagnosis", accepted: ["torcao_testicular"] }, points: 14, severity: "critica", rationale: "Clínico." },
    { id: "s-destino", domain: "destino", description: "Centro cirúrgico", evidence: { kind: "disposition", accepted: ["centro_cirurgico"] }, points: 16, severity: "critica", rationale: "Exploração escrotal." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Dor testicular súbita em adolescente: qual diagnóstico não pode passar?" },
      { level: 2, text: "Examine o escroto: posição do testículo e reflexo cremastérico." },
      { level: 3, text: "TWIST 7: precisa esperar o Doppler?" },
      { level: 4, text: "Sugestão explícita: história, exame escrotal, analgesia, jejum, acesso, cirurgia imediata, centro cirúrgico." }
    ],
    summary: "Torção do cordão espermático em adolescente com TWIST máximo.",
    pathophysiology: "Fixação inadequada do testículo (deformidade em 'badalo de sino') permite rotação do cordão: obstrução venosa, depois arterial, com isquemia e necrose. A dor pode diminuir com a necrose. Episódios prévios autolimitados sugerem torção intermitente.",
    keyPoints: [
      "Toda dor testicular aguda é torção até prova em contrário; examinar escroto em dor abdominal baixa.",
      "TWIST: edema 2, endurecido 2, sem cremastérico 1, náusea/vômito 1, testículo alto 1; 7 = cirurgia sem imagem.",
      "Doppler pode ser falso-negativo; não atrasar a cirurgia.",
      "Salvamento é tempo-dependente; não usar 'janela de 6 h' para adiar.",
      "Destorção manual só se atraso inevitável até a cirurgia."
    ],
    alternatives: ["Doppler em paralelo, se não atrasar a cirurgia.", "Destorção manual ('abrir o livro') em local remoto, mantendo a cirurgia."],
    oralRubric: [
      { id: "o1", concept: "Torção", synonyms: ["torção", "cordão"], weight: 3 },
      { id: "o2", concept: "TWIST/exame", synonyms: ["twist", "cremastérico", "alto", "horizontal"], weight: 2 },
      { id: "o3", concept: "Cirurgia imediata", synonyms: ["cirurgia", "exploração", "urologia", "sem esperar"], weight: 3 },
      { id: "o4", concept: "Diferenciais", synonyms: ["epididimite", "apêndice testicular"], weight: 2 }
    ],
    simplifications: ["Orquidopexia contralateral não modelada.", "Escore TWIST calculado pelo aluno a partir do exame."]
  },
  references: ["INT-EMCASES-TORCAO-2020", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 3, allowSexSwap: false, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "História, exame escrotal, cirurgia imediata, analgesia, jejum, centro cirúrgico", commands: [ask(10, "h-inicio"), ask(20, "h-associados"), { atSeconds: 30, type: "examine", payload: { region: "pelve", maneuver: "inspecao" } }, { atSeconds: 40, type: "examine", payload: { region: "pelve", maneuver: "especial" } }, act(50, "solicitar_avaliacao_cirurgica"), act(60, "jejum_cabeceira"), ask(70, "h-jejum"), act(80, "acesso_venoso"), rx(200, "dipirona", "amp1g", 1000, "mg", "IV"), dx(300, "torcao_testicular"), dest(600, "centro_cirurgico")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-cirurgia" }, description: "cirurgia" }, { condition: { not: { ruleFired: "r-isquemia" } }, description: "sem atraso" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-isquemia" }, description: "isquemia" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Trata como epididimite e encaminha ao ambulatório", commands: [act(30, "acesso_venoso"), rx(150, "ceftriaxona", "fa1g", 1000, "mg", "IV"), rx(160, "dipirona", "amp1g", 1000, "mg", "IV"), dest(900, "encaminhamento_ambulatorial")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-epididimite" }, description: "epididimite" }, { condition: { ruleFired: "r-alta" }, description: "alta" }, { condition: { ruleFired: "r-isquemia" }, description: "isquemia" }] },
    { id: "t-atraso", kind: "delay", description: "Espera Doppler e só depois chama a cirurgia", commands: [act(30, "acesso_venoso"), rx(150, "dipirona", "amp1g", 1000, "mg", "IV"), test(200, "usg_doppler_escrotal"), act(2800, "solicitar_avaliacao_cirurgica"), dest(3000, "centro_cirurgico")], runUntilSeconds: 3400, expect: [{ condition: { ruleFired: "r-isquemia" }, description: "isquemia por atraso" }, { condition: { not: { ruleFired: "r-cirurgia" } }, description: "cirurgia tardia" }] },
    { id: "t-alternativa", kind: "alternative", description: "Morfina, Doppler em paralelo sem atrasar a cirurgia", commands: [{ atSeconds: 20, type: "examine", payload: { region: "pelve", maneuver: "inspecao" } }, act(30, "solicitar_avaliacao_cirurgica"), act(40, "acesso_venoso"), rx(140, "morfina", "amp10", 4, "mg", "IV"), test(150, "usg_doppler_escrotal"), dest(900, "centro_cirurgico")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-cirurgia" }, description: "cirurgia" }] }
  ]
};
