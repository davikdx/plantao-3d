import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const USG = { testCollected: "usg_obstetrica" };
const TOQUE_ANTES_USG = { all: [{ examDone: "pelve" }, { not: USG }] };
const VOL = { any: [{ drugGiven: "ringer_lactato", minTotal: { value: 500, unit: "mL" as const } }, { drugGiven: "sf09", minTotal: { value: 500, unit: "mL" as const } }] };
const VOL_INICIO = { any: [{ drugGiven: "ringer_lactato" }, { drugGiven: "sf09" }] };
const TOCOLITICO = { any: [{ drugGiven: "nifedipino" }, { drugGiven: "salbutamol" }] };

export const C077: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C077",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Gestante de 32 semanas com sangramento vermelho vivo sem dor",
  teachingTitle: "Sangramento no terceiro trimestre — placenta prévia: não tocar antes do ultrassom, estabilizar, avaliar vitalidade fetal e decidir a conduta",
  group: "Obstetrícia e Ginecologia",
  specialties: ["Obstetrícia", "Emergência"],
  environment: "obstetricia",
  resourceProfile: "hospital-regional",
  difficulty: 3,
  level: "internato",
  objectives: [
    "Diferenciar placenta prévia de descolamento prematuro de placenta pela clínica",
    "Não realizar toque vaginal antes de localizar a placenta por ultrassom",
    "Estabilizar a gestante (acessos, cristaloide, exames, tipagem e reserva de sangue)",
    "Avaliar a vitalidade fetal, considerar corticoide para maturação pulmonar e evitar tocolíticos",
    "Suspeitar de acretismo com cesáreas prévias e decidir entre conduta expectante e cesárea"
  ],
  keywords: ["gestante", "sangramento", "32 semanas", "sem dor", "grávida", "hemorragia"],
  patient: {
    name: "Daniela Rocha",
    ageYears: 31,
    sex: "feminino",
    weightKg: 70,
    heightCm: 163,
    pregnancyWeeks: 32,
    visual: { ageGroup: "adulto", sex: "feminino", skinTone: 2, hairStyle: "longo", hairColor: "castanho", build: "medio", pregnancyTrimester: 3 }
  },
  briefing: "Pronto-atendimento obstétrico de hospital regional. Gestante de 31 anos, 32 semanas, terceira gestação, com sangramento vaginal vermelho vivo que começou há 1 hora, enquanto dormia, sem dor. Encharcou dois absorventes noturnos.",
  communication: "normal",
  informants: [{ id: "marido", name: "Marido", role: "Acompanhante" }],
  history: [
    h("h-sangramento", "queixa", "Como é o sangramento? Tem dor ou contração?", "Vermelho vivo, começou do nada enquanto eu dormia. Não dói, não sinto contração.", { keywords: ["sangramento", "dor", "contração"] }),
    h("h-obstetrico", "gestacao", "Como foram as outras gestações e partos?", "Duas cesáreas, a última há 2 anos.", { keywords: ["gestações", "partos", "cesárea"] }),
    h("h-prenatal", "gestacao", "Fez ultrassom no pré-natal? Disseram algo sobre a placenta?", "No ultrassom de 22 semanas falaram que a placenta estava 'baixa', para repetir. Não repeti ainda.", { keywords: ["ultrassom", "placenta", "pré-natal"] }),
    h("h-movimentos", "gestacao", "O bebê está mexendo? Perdeu líquido?", "Está mexendo normal. Líquido não.", { keywords: ["mexendo", "bebê", "líquido"] }),
    h("h-tipo", "antecedentes", "Sabe seu tipo de sangue? Pressão alta, trauma, droga?", "O positivo. Pressão normal, não caí, não uso nada.", { keywords: ["tipo", "sangue", "pressão", "trauma"] })
  ],
  initial: {
    vars: { hr: 104, sbp: 106, dbp: 64, rr: 20, spo2: 98, temp: 36.6, gcs: 15, pain: 1, glucose: 94, perfusion: 0.75, effort: 0.2, fetalHr: 148, hb: 10.1, plt: 210000, inr: 1.0, bleeding: 40 },
    flags: { rhythm: "taquicardia_sinusal", posture: "supino", painVisual: "nenhuma", speech: "frases", consciousness: "alerta", pregnant: true, bleedingVisible: true, pallor: true },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-utero", "abdome_qid", "palpacao", "Útero relaxado, indolor, sem hipertonia; altura uterina 31 cm; feto em apresentação pélvica.", { label: "Abdome obstétrico" }),
    ex("e-especular", "pelve", "inspecao", "Exame especular cuidadoso: sangue vermelho vivo saindo pelo orifício externo do colo; sem lesões de colo/vagina.", { label: "Exame especular" }),
    ex("e-toque", "pelve", "palpacao", "Toque vaginal: tecido esponjoso no orifício interno e aumento súbito do sangramento.", { label: "Toque vaginal" }),
    ex("e-geral", "geral", "inspecao", "Pálida, ansiosa, extremidades mornas.", {})
  ],
  testResults: [
    { testId: "usg_obstetrica", variants: [{ text: "Placenta anterior, recobrindo totalmente o orifício interno do colo e sobre a cicatriz de cesárea, com lacunas e perda da interface miometrial (suspeita de acretismo). Feto único, pélvico, 32 semanas, BCF 148, líquido normal." }] },
    { testId: "hemograma", variants: [{ text: "Hb 10,1 g/dL; plaquetas 210.000/mm³." }] },
    { testId: "coagulograma", variants: [{ text: "INR 1,0; fibrinogênio não disponível no catálogo." }] }
  ],
  highlightedActions: ["acesso_venoso", "monitorizar", "cardiotocografia", "decubito_lateral_esquerdo"],
  rules: [
    { id: "r-sangramento", description: "Sangramento de placenta prévia (moderado, tende a reduzir em repouso)", priority: 10, when: { always: true }, repeat: "once", effects: [trend("hb", 9.0, 3600, "hem", 10), trend("hr", 110, 2400, "hem", 10), trend("sbp", 100, 2400, "hem", 10)] },
    { id: "r-toque", description: "Toque vaginal antes do ultrassom", priority: 60, when: TOQUE_ANTES_USG, repeat: "once", effects: [trend("hb", 7.4, 900, "toque", 60), trend("sbp", 82, 600, "toque", 60), trend("hr", 132, 600, "toque", 60), trend("fetalHr", 104, 600, "toque", 60), flag("bleedingVisible", true), staff("enfermagem", "O sangramento aumentou muito depois do toque! Está escorrendo pela maca."), obs("Toque vaginal na placenta prévia pode descolar a placenta e provocar hemorragia maciça."), outcome("complicacao")] },
    { id: "r-volume", description: "Cristaloide", priority: 30, when: VOL, repeat: "once", effects: [trend("hr", 98, 1200, "vol", 30), trend("sbp", 110, 1200, "vol", 30)] },
    { id: "r-lateral", description: "Decúbito lateral esquerdo", priority: 25, when: { actionCompleted: "decubito_lateral_esquerdo" }, repeat: "once", effects: [trend("fetalHr", 146, 300, "dle", 25)] },
    { id: "r-tocolitico", description: "Tocolítico em sangramento", priority: 40, when: TOCOLITICO, repeat: "once", effects: [trend("hr", 122, 600, "toco", 40, 1800), obs("Tocolíticos são contraindicados no sangramento: mascaram a hipovolemia (taquicardia, hipotensão) e podem agravar a hemorragia."), outcome("complicacao")] },
    { id: "r-cesarea-urgente", description: "Hemorragia após toque: cesárea de urgência", priority: 70, when: { all: [{ ruleFired: "r-toque" }, { actionCompleted: "solicitar_avaliacao_cirurgica" }] }, repeat: "once", effects: [staff("supervisor", "Obstetra: sangramento profuso com instabilidade — cesárea de urgência; reservar hemocomponentes e preparar para acretismo.")] },
    { id: "r-plano", description: "USG + estabilização + vitalidade: conduta definida", priority: 50, when: { all: [USG, VOL_INICIO, { any: [{ actionCompleted: "cardiotocografia" }, { actionCompleted: "sonar_bcf" }] }, { not: { ruleFired: "r-toque" } }] }, repeat: "once", effects: [staff("supervisor", "Obstetra: placenta prévia total com suspeita de acretismo, sangramento diminuindo, estável e feto bem — internação, corticoide, reserva de sangue e planejamento de cesárea em centro com suporte (acretismo)."), trend("hb", 9.4, 1800, "plano", 50), flag("bleedingVisible", false), outcome("estabilizacao_parcial")] },
    { id: "r-choque", description: "Sem acesso/volume em 40 min: hipovolemia", priority: 35, when: { all: [{ time: "gte", seconds: 2400 }, { not: VOL_INICIO }] }, repeat: "once", effects: [trend("sbp", 88, 600, "choque", 35), trend("hr", 126, 600, "choque", 35), trend("fetalHr", 118, 900, "choque", 35), staff("enfermagem", "Ela está mais pálida, PA 88 por 50."), outcome("piora")] }
  ],
  diagnosis: { primary: "placenta_previa", accepted: ["placenta_previa"], differentials: ["dpp", "hpp_trauma", "abortamento", "coagulopatia"] },
  acceptedDestinations: ["internacao_enfermaria", "centro_cirurgico"],
  outcomeNotes: "Placenta prévia total anterior sobre cicatriz de cesárea (suspeita de acretismo), com sangramento indolor moderado em gestação de 32 semanas. Sem toque vaginal antes do ultrassom; dois acessos, cristaloide, hemograma/coagulograma/tipagem e reserva de sangue, vitalidade fetal, corticoide, sem tocolíticos, internação e planejamento de cesárea em centro preparado para acretismo; cesárea de urgência se sangramento profuso ou instabilidade.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Caráter do sangramento, dor e cesáreas prévias", evidence: { kind: "historyAsked", items: ["h-sangramento", "h-obstetrico", "h-prenatal"], minCount: 2 }, points: 8, severity: "critica", rationale: "Indolor + placenta baixa + cesáreas = prévia com risco de acretismo." },
    { id: "s-acesso", domain: "priorizacao", description: "Acessos e monitorização em até 5 min", evidence: { kind: "actionDone", anyOf: ["acesso_venoso", "monitorizar"], withinSeconds: 300 }, points: 6, severity: "critica", rationale: "Sangramento ativo." },
    { id: "s-usg", domain: "exames", description: "Ultrassom obstétrico", evidence: { kind: "testOrdered", anyOf: ["usg_obstetrica"], withinSeconds: 1500 }, points: 12, severity: "critica", rationale: "Localiza a placenta antes de qualquer toque.", sourceIds: ["BR-MEUFRJ-PP"] },
    { id: "s-toque", domain: "tratamento", description: "Falha: toque vaginal antes do ultrassom", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-toque" } }, points: 16, penalty: true, severity: "critica", rationale: "Pode precipitar hemorragia maciça.", sourceIds: ["BR-MEUFRJ-PP"] },
    { id: "s-labs", domain: "exames", description: "Hemograma, coagulograma e tipagem", evidence: { kind: "testOrdered", anyOf: ["hemograma", "coagulograma"], withinSeconds: 900 }, points: 6, severity: "importante", rationale: "Reserva de hemocomponentes.", sourceIds: ["BR-MEUFRJ-PP"] },
    { id: "s-fetal", domain: "exames", description: "Vitalidade fetal", evidence: { kind: "actionDone", anyOf: ["cardiotocografia", "sonar_bcf"], withinSeconds: 900 }, points: 8, severity: "importante", rationale: "Define urgência da via de parto.", sourceIds: ["BR-MEUFRJ-PP"] },
    { id: "s-volume", domain: "tratamento", description: "Cristaloide", evidence: { kind: "drugGiven", anyOf: ["ringer_lactato", "sf09"], withinSeconds: 1200 }, points: 6, severity: "importante", rationale: "Taquicardia e palidez." },
    { id: "s-cortico", domain: "tratamento", description: "Corticoide para maturação pulmonar", evidence: { kind: "drugGiven", anyOf: ["betametasona", "dexametasona"] }, points: 6, severity: "importante", rationale: "32 semanas com risco de parto prematuro.", sourceIds: ["BR-MEUFRJ-PP"] },
    { id: "s-tocolitico", domain: "tratamento", description: "Falha: tocolítico no sangramento", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-tocolitico" } }, points: 6, penalty: true, severity: "importante", rationale: "Contraindicado.", sourceIds: ["BR-MEUFRJ-PP"] },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou PA/FC e BCF", evidence: { kind: "reassessAfter", after: ["ringer_lactato", "sf09"], reassess: ["medir_pa", "monitorizar", "sonar_bcf", "hemograma"], withinSeconds: 2400 }, points: 6, severity: "importante", rationale: "Detectar piora do sangramento." },
    { id: "s-dx", domain: "destino", description: "Placenta prévia", evidence: { kind: "diagnosis", accepted: ["placenta_previa"] }, points: 6, severity: "importante", rationale: "Confirmada no USG." },
    { id: "s-destino", domain: "destino", description: "Internação obstétrica (ou cesárea se instável)", evidence: { kind: "disposition", accepted: ["internacao_enfermaria", "centro_cirurgico"] }, points: 6, severity: "importante", rationale: "Conduta expectante monitorizada ou cesárea." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Sangramento vermelho vivo e indolor: prévia ou descolamento?" },
      { level: 2, text: "A placenta 'estava baixa' no ultrassom de 22 semanas." },
      { level: 3, text: "Qual exame físico você NÃO faz antes do ultrassom?" },
      { level: 4, text: "Sugestão explícita: acessos, monitor, exames, Ringer, CTG, USG obstétrica, especular cuidadoso (sem toque), betametasona, internar; sem tocolíticos." }
    ],
    summary: "Gestante de 31 anos, 32 semanas, duas cesáreas prévias, com placenta prévia total anterior sobre a cicatriz (suspeita de acretismo) e sangramento indolor moderado.",
    pathophysiology: "A placenta implantada sobre o orifício interno sangra quando o segmento inferior se forma e o colo se modifica, de forma indolor e recorrente. O toque digital pode descolá-la. Cicatriz uterina prévia favorece implantação baixa e invasão anormal (acretismo), com risco de hemorragia maciça no parto.",
    keyPoints: [
      "Sangramento indolor, vermelho vivo, útero relaxado: placenta prévia; dor e hipertonia: DPP.",
      "Nada de toque vaginal antes de localizar a placenta; especular cuidadoso é permitido.",
      "Acessos, cristaloide, hemograma, coagulograma, tipagem e reserva de sangue.",
      "Vitalidade fetal; corticoide no pré-termo; tocolíticos contraindicados.",
      "Cesárea prévia + prévia anterior: suspeitar de acretismo e planejar parto em centro preparado."
    ],
    alternatives: ["Imunoglobulina anti-D se Rh negativo não sensibilizada (não é o caso).", "Sulfato de magnésio para neuroproteção se parto iminente < 32 semanas (protocolos locais)."],
    oralRubric: [
      { id: "o1", concept: "Prévia × DPP", synonyms: ["indolor", "descolamento", "dpp", "prévia"], weight: 2 },
      { id: "o2", concept: "Não tocar antes do USG", synonyms: ["toque", "ultrassom", "especular"], weight: 3 },
      { id: "o3", concept: "Estabilização e vitalidade fetal", synonyms: ["acesso", "tipagem", "cardiotocografia", "bcf"], weight: 2 },
      { id: "o4", concept: "Acretismo", synonyms: ["acretismo", "acreta", "cesárea prévia"], weight: 1 }
    ],
    simplifications: ["Betametasona sem regra de dose validada (o app alerta).", "Tipagem e prova cruzada representadas pelo hemograma/coagulograma.", "O exame especular e o toque usam a mesma região 'pelve' (inspeção × palpação)."]
  },
  references: ["BR-MEUFRJ-PP", "BR-GESTACAO", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 8, allowSexSwap: false, allowWeightPercent: 15, allowVisualVariation: true, forbidden: ["sexo masculino"] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "História, acessos, monitor, exames, Ringer, CTG, USG, especular, betametasona, internação", commands: [ask(10, "h-sangramento"), ask(20, "h-obstetrico"), ask(30, "h-prenatal"), act(40, "monitorizar"), act(50, "acesso_venoso"), act(150, "acesso_venoso"), test(260, "hemograma"), test(270, "coagulograma"), rx(280, "ringer_lactato", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), act(300, "decubito_lateral_esquerdo"), act(320, "cardiotocografia"), test(400, "usg_obstetrica"), { atSeconds: 1700, type: "examine", payload: { region: "pelve", maneuver: "inspecao" } }, rx(1800, "betametasona", "amp6", 12, "mg", "IM"), act(2000, "medir_pa"), dx(2200, "placenta_previa"), dest(2300, "internacao_enfermaria")], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-plano" }, description: "conduta definida" }, { condition: { not: { ruleFired: "r-toque" } }, description: "sem toque prematuro" }, { condition: { not: { ruleFired: "r-choque" } }, description: "estável" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-choque" }, description: "hipovolemia" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Toque vaginal na admissão e nifedipino para 'segurar'", commands: [{ atSeconds: 30, type: "examine", payload: { region: "pelve", maneuver: "palpacao" } }, act(60, "acesso_venoso"), rx(200, "nifedipino", "cp10", 10, "mg", "VO")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-toque" }, description: "hemorragia após toque" }, { condition: { ruleFired: "r-tocolitico" }, description: "tocolítico" }] },
    { id: "t-atraso", kind: "delay", description: "Acesso e volume tardios, USG depois", commands: [act(2500, "acesso_venoso"), rx(2620, "ringer_lactato", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), act(2700, "sonar_bcf"), test(2800, "usg_obstetrica")], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-choque" }, description: "hipovolemia pelo atraso" }, { condition: { ruleFired: "r-plano" }, description: "conduta definida" }] },
    { id: "t-alternativa", kind: "alternative", description: "SF 0,9%, sonar, USG, dexametasona e cesárea planejada (centro cirúrgico)", commands: [act(20, "acesso_venoso"), rx(130, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), act(150, "sonar_bcf"), test(200, "usg_obstetrica"), rx(1500, "dexametasona", "amp10", 6, "mg", "IM"), dest(2500, "centro_cirurgico")], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-plano" }, description: "conduta definida" }, { condition: { not: { ruleFired: "r-toque" } }, description: "sem toque" }] }
  ]
};
