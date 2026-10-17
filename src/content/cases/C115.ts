import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, hi, obs, outcome, rx, staff, trend } from "./helpers";

const HIPOTENSOR = { all: [{ drugGiven: "timolol" }, { drugGiven: "acetazolamida" }] };
const EXAME = { actionCompleted: "exame_oftalmologico_basico" };

export const C115: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C115",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Senhora com dor forte no olho, vômitos e visão embaçada desde a noite anterior",
  teachingTitle: "Dor ocular com perda visual aguda — glaucoma agudo de ângulo fechado: reconhecer olho vermelho com pupila média fixa e córnea turva, medir PIO, iniciar hipotensores oculares, evitar midriáticos e acionar oftalmologia",
  group: "Outras urgências",
  specialties: ["Oftalmologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Examinar o olho em toda cefaleia com vômitos e olho vermelho: acuidade, pupila, córnea, PIO",
    "Reconhecer glaucoma agudo de ângulo fechado e seus precipitantes (penumbra, anticolinérgicos)",
    "Iniciar timolol, acetazolamida (e pilocarpina) sem esperar o oftalmologista",
    "Não usar midriáticos nem anticolinérgicos",
    "Acionar oftalmologia para iridotomia (e olho contralateral)"
  ],
  keywords: ["dor no olho", "vômito", "visão embaçada", "halos", "dor de cabeça", "olho vermelho"],
  patient: {
    name: "Dona Teresa Nogueira",
    ageYears: 64,
    sex: "feminino",
    weightKg: 66,
    heightCm: 156,
    visual: { ageGroup: "idoso", sex: "feminino", skinTone: 2, hairStyle: "curto", hairColor: "grisalho", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional (sem oftalmologista no plantão; referência por regulação). Mulher de 64 anos com dor intensa no olho direito e na cabeça desde ontem à noite, quando assistia TV no escuro; vomitou três vezes. Diz que 'enxerga tudo embaçado com arco-íris em volta das luzes'.",
  communication: "normal",
  informants: [{ id: "paciente", name: "Dona Teresa", role: "Paciente" }],
  history: [
    hi("h-inicio", "inicio", "Como começou? Onde dói mais?", [{ source: "paciente", text: "Ontem à noite, vendo novela no escuro. Dói o olho direito e a testa desse lado, latejando." }], ["começou", "onde", "olho", "testa"]),
    hi("h-visao", "fatores_associados", "Como está a visão? Vê halos ou arco-íris em volta das luzes?", [{ source: "paciente", text: "Do olho direito vejo tudo nublado, com arco-íris nas lâmpadas." }], ["visão", "halos", "arco-íris", "embaçado"]),
    hi("h-medicacoes", "medicacoes", "Que remédios usa? Tomou algum colírio, remédio para enjoo, para alergia ou para bexiga?", [{ source: "paciente", text: "Losartana. Ontem tomei um remédio para gripe 'que dá sono', com antialérgico." }], ["remédios", "colírio", "enjoo", "alergia", "gripe"]),
    hi("h-oculares", "antecedentes", "Usa óculos de grau para longe ou perto? Já teve dor parecida? Alguém na família com glaucoma?", [{ source: "paciente", text: "Uso óculos para longe, grau positivo, desde jovem. Às vezes doía o olho no cinema e passava. Minha irmã tem glaucoma." }], ["óculos", "grau", "parecida", "família"]),
    hi("h-alarme", "sinais_alarme", "Teve febre, rigidez de nuca, fraqueza ou dormência no corpo?", [{ source: "paciente", text: "Não." }], ["febre", "nuca", "fraqueza", "dormência"])
  ],
  initial: {
    vars: { hr: 92, sbp: 158, dbp: 90, rr: 18, spo2: 97, temp: 36.6, gcs: 15, pain: 9, glucose: 112, perfusion: 0.9, effort: 0.1 },
    flags: { rhythm: "sinusal", posture: "sentado", painVisual: "intensa", speech: "frases", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-olho", "olhos", "inspecao", "Olho direito: hiperemia ciliar, córnea turva (edema), câmara anterior rasa, pupila médio-dilatada (5 mm) fixa; acuidade visual: contar dedos a 1 m. Olho esquerdo: normal, câmara anterior rasa. Globo direito endurecido à palpação.", { label: "Olhos", better: [{ when: { ruleFired: "r-tratamento" }, text: "Córnea mais transparente, pupila menos dilatada; acuidade melhorando." }] }),
    ex("e-neuro", "neurologico", "inspecao", "Sem déficits focais, sem rigidez de nuca.", { label: "Neurológico" }),
    ex("e-abdome", "abdome_epigastrio", "palpacao", "Abdome flácido, indolor.", { label: "Abdome" })
  ],
  testResults: [],
  highlightedActions: ["exame_oftalmologico_basico", "solicitar_oftalmologia"],
  rules: [
    { id: "r-exame", description: "PIO medida", priority: 20, when: EXAME, repeat: "once", effects: [staff("enfermagem", "PIO OD 58 mmHg; OE 18 mmHg. Acuidade OD: conta dedos a 1 m.")] },
    { id: "r-tratamento", description: "Timolol + acetazolamida", priority: 40, when: HIPOTENSOR, repeat: "once", effects: [trend("pain", 4, 1800, "trat", 40), staff("enfermagem", "Após 1 hora, PIO OD 34 mmHg; dor e náusea melhores."), outcome("melhora")] },
    { id: "r-anticolinergico", description: "Anticolinérgico/anti-histamínico", priority: 45, when: { any: [{ drugGiven: "prometazina" }] }, repeat: "once", effects: [trend("pain", 10, 300, "ac", 45), obs("Anticolinérgicos e anti-histamínicos de 1ª geração dilatam a pupila e precipitam/agravam o fechamento angular.")] },
    { id: "r-perda", description: "Sem tratamento: dano ao nervo óptico", priority: 30, when: { all: [{ time: "gte", seconds: 2400 }, { not: HIPOTENSOR }] }, repeat: "once", effects: [obs("PIO muito elevada mantida por horas lesa nervo óptico e retina (perda visual permanente)."), outcome("complicacao")] },
    { id: "r-oftalmo", description: "Oftalmologia acionada", priority: 25, when: { actionCompleted: "solicitar_oftalmologia" }, repeat: "once", effects: [staff("regulacao", "Oftalmologia de referência: manter hipotensores, pilocarpina após queda da PIO, transferir para iridotomia a laser (e profilática no olho esquerdo).")] },
    { id: "r-alta", description: "Alta como enxaqueca", priority: 50, when: { any: [{ path: "disposition", op: "eq", value: "alta_orientada" }, { path: "disposition", op: "eq", value: "alta_com_seguimento_ubs" }] }, repeat: "once", effects: [obs("Glaucoma agudo exige tratamento imediato e oftalmologia em 24 h para iridotomia."), outcome("complicacao")] }
  ],
  diagnosis: { primary: "glaucoma_agudo", accepted: ["glaucoma_agudo"], differentials: ["enxaqueca", "uveite_anterior", "hemorragia_subaracnoidea", "gastroenterite", "urgencia_hipertensiva_lesao"] },
  acceptedDestinations: ["transferencia_regulada"],
  outcomeNotes: "Glaucoma agudo de ângulo fechado à direita (hipermetrope, penumbra e anti-histamínico como precipitantes): olho vermelho, córnea edemaciada, pupila média fixa, PIO 58. Timolol 0,5%, acetazolamida 500 mg, pilocarpina após queda da PIO, cabeceira elevada e ambiente iluminado, antiemético não anticolinérgico, sem midriáticos, oftalmologia via regulação para iridotomia bilateral.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Início, visão e halos", evidence: { kind: "historyAsked", items: ["h-inicio", "h-visao"], minCount: 2 }, points: 8, severity: "critica", rationale: "Quadro típico." },
    { id: "s-med", domain: "historia", description: "Medicações precipitantes e fatores de risco", evidence: { kind: "historyAsked", items: ["h-medicacoes", "h-oculares"], minCount: 1 }, points: 6, severity: "importante", rationale: "Anticolinérgicos, hipermetropia, família.", sourceIds: ["INT-WIKEM-GLAUCOMA-2026"] },
    { id: "s-olho", domain: "historia", description: "Exame dos olhos", evidence: { kind: "examDone", regions: ["olhos"], minCount: 1 }, points: 12, severity: "critica", rationale: "Pupila média fixa, córnea turva." },
    { id: "s-pio", domain: "exames", description: "Acuidade visual e PIO", evidence: { kind: "actionDone", anyOf: ["exame_oftalmologico_basico"], withinSeconds: 900 }, points: 12, severity: "critica", rationale: "PIO 40–80 no ataque agudo.", sourceIds: ["INT-WIKEM-GLAUCOMA-2026"] },
    { id: "s-timolol", domain: "tratamento", description: "Timolol 0,5%", evidence: { kind: "drugGiven", anyOf: ["timolol"], withinSeconds: 1500 }, points: 12, severity: "critica", rationale: "Reduz produção de humor aquoso.", sourceIds: ["INT-WIKEM-GLAUCOMA-2026"] },
    { id: "s-acz", domain: "tratamento", description: "Acetazolamida 500 mg", evidence: { kind: "drugGiven", anyOf: ["acetazolamida"], withinSeconds: 1500 }, points: 12, severity: "critica", rationale: "Inibidor da anidrase carbônica.", sourceIds: ["INT-WIKEM-GLAUCOMA-2026"] },
    { id: "s-pilo", domain: "tratamento", description: "Pilocarpina", evidence: { kind: "drugGiven", anyOf: ["pilocarpina"] }, points: 6, severity: "importante", rationale: "Miose após queda da PIO.", sourceIds: ["INT-WIKEM-GLAUCOMA-2026"] },
    { id: "s-oftalmo", domain: "destino", description: "Oftalmologia", evidence: { kind: "actionDone", anyOf: ["solicitar_oftalmologia"] }, points: 12, severity: "critica", rationale: "Iridotomia a laser.", sourceIds: ["INT-WIKEM-GLAUCOMA-2026"] },
    { id: "s-sem-ac", domain: "tratamento", description: "Sem anticolinérgico/anti-histamínico", evidence: { kind: "avoidDrug", anyOf: ["prometazina"] }, points: 4, severity: "importante", rationale: "Midríase agrava." },
    { id: "s-perda", domain: "tratamento", description: "Falha: hipotensores tardios", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-perda" } }, points: 12, penalty: true, severity: "critica", rationale: "Dano ao nervo óptico." },
    { id: "s-ac", domain: "tratamento", description: "Falha: anticolinérgico", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-anticolinergico" } }, points: 6, penalty: true, severity: "importante", rationale: "Precipitante." },
    { id: "s-dx", domain: "destino", description: "Glaucoma agudo de ângulo fechado", evidence: { kind: "diagnosis", accepted: ["glaucoma_agudo"] }, points: 10, severity: "importante", rationale: "Clínico + PIO." },
    { id: "s-destino", domain: "destino", description: "Transferência regulada", evidence: { kind: "disposition", accepted: ["transferencia_regulada"] }, points: 6, severity: "importante", rationale: "Sem oftalmologia no local." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Cefaleia com vômitos e olho vermelho: olhe a pupila e a córnea." },
      { level: 2, text: "Meça a pressão intraocular." },
      { level: 3, text: "Quais medicamentos reduzem a PIO agora, e qual piora?" },
      { level: 4, text: "Sugestão explícita: exame ocular, PIO, timolol, acetazolamida 500 mg, pilocarpina, sem anticolinérgico, oftalmologia, transferência." }
    ],
    summary: "Glaucoma agudo de ângulo fechado em hipermetrope, precipitado por penumbra e anti-histamínico.",
    pathophysiology: "Em olhos com câmara anterior rasa (hipermetropia, idade), a midríase média aumenta o contato iridolenticular (bloqueio pupilar): a íris periférica fecha o ângulo, impede a drenagem do humor aquoso e a PIO sobe abruptamente, com edema de córnea, isquemia do nervo óptico e dor intensa com reflexo vagal (vômitos).",
    keyPoints: [
      "Olho vermelho doloroso + halos + pupila média fixa + córnea turva = glaucoma agudo.",
      "Pode mimetizar enxaqueca ou doença gastrointestinal.",
      "Timolol + alfa-2 agonista + acetazolamida juntos; pilocarpina quando a PIO começar a cair; manitol se refratário.",
      "Evitar midriáticos e anticolinérgicos; ambiente iluminado.",
      "Iridotomia a laser (e profilática no outro olho)."
    ],
    alternatives: ["Brimonidina/apraclonidina associada, se disponível.", "Manitol IV se refratário (cautela renal)."],
    oralRubric: [
      { id: "o1", concept: "Reconhecimento", synonyms: ["pupila", "córnea", "halos", "olho vermelho"], weight: 3 },
      { id: "o2", concept: "PIO", synonyms: ["pressão intraocular", "tonometria", "pio"], weight: 2 },
      { id: "o3", concept: "Tratamento", synonyms: ["timolol", "acetazolamida", "pilocarpina"], weight: 3 },
      { id: "o4", concept: "Iridotomia/evitar midriáticos", synonyms: ["iridotomia", "laser", "midriático", "anticolinérgico"], weight: 2 }
    ],
    simplifications: ["Doses de colírio sem regra cadastrada (1 gota).", "Brimonidina e manitol não usados no caso."]
  },
  references: ["INT-WIKEM-GLAUCOMA-2026", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "História, exame, PIO, timolol, acetazolamida, pilocarpina, oftalmologia, transferência", commands: [ask(10, "h-inicio"), ask(20, "h-visao"), ask(30, "h-medicacoes"), { atSeconds: 40, type: "examine", payload: { region: "olhos", maneuver: "inspecao" } }, act(50, "exame_oftalmologico_basico"), rx(360, "timolol", "col05", 0.25, "mg", "ocular"), rx(380, "acetazolamida", "cp250", 500, "mg", "VO"), act(400, "solicitar_oftalmologia"), rx(1500, "pilocarpina", "col2", 1, "mg", "ocular"), dx(1600, "glaucoma_agudo"), dest(2000, "transferencia_regulada")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-tratamento" }, description: "tratamento" }, { condition: { not: { ruleFired: "r-perda" } }, description: "sem atraso" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-perda" }, description: "dano" }] },
    { id: "t-inadequada", kind: "inadequate", description: "'Enxaqueca com vômitos': prometazina, dipirona e alta", commands: [act(30, "acesso_venoso"), rx(150, "prometazina", "amp25", 25, "mg", "IM"), rx(160, "dipirona", "amp1g", 1000, "mg", "IV"), dest(1500, "alta_orientada")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-anticolinergico" }, description: "anticolinérgico" }, { condition: { ruleFired: "r-alta" }, description: "alta" }, { condition: { ruleFired: "r-perda" }, description: "dano" }] },
    { id: "t-atraso", kind: "delay", description: "Espera o oftalmologista para tratar", commands: [{ atSeconds: 40, type: "examine", payload: { region: "olhos", maneuver: "inspecao" } }, act(60, "solicitar_oftalmologia"), rx(2600, "timolol", "col05", 0.25, "mg", "ocular"), rx(2620, "acetazolamida", "cp250", 500, "mg", "VO"), dest(3000, "transferencia_regulada")], runUntilSeconds: 3400, expect: [{ condition: { ruleFired: "r-perda" }, description: "dano" }, { condition: { ruleFired: "r-tratamento" }, description: "tratamento tardio" }] },
    { id: "t-alternativa", kind: "alternative", description: "Tratamento logo após exame da pupila; PIO depois", commands: [{ atSeconds: 20, type: "examine", payload: { region: "olhos", maneuver: "inspecao" } }, rx(40, "timolol", "col05", 0.25, "mg", "ocular"), rx(60, "acetazolamida", "cp250", 500, "mg", "VO"), act(80, "exame_oftalmologico_basico"), act(390, "solicitar_oftalmologia"), dest(1500, "transferencia_regulada")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-tratamento" }, description: "tratamento" }] }
  ]
};
