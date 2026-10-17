import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, h, hi, obs, outcome, rx, staff, test } from "./helpers";

const FERRO = { any: [{ drugGiven: "sulfato_ferroso" }, { drugGiven: "sacarato_ferro" }] };
const CINETICA = { testCollected: "cinetica_ferro" };
const INVESTIGOU = { any: [{ testCollected: "sangue_oculto_fezes" }, { testCollected: "b12_folato" }] };
const ORIENTA = { actionCompleted: "orientacoes_alta" };

export const C064: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C064",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Senhora com doença nos rins, cansada e pálida, em consulta de rotina",
  teachingTitle: "Anemia na doença renal crônica em seguimento — excluir ferropenia e perdas, repor ferro antes do estimulador da eritropoiese, metas de Hb e coordenação do cuidado",
  group: "Nefrologia",
  specialties: ["Medicina de família e comunidade", "Nefrologia", "Hematologia", "Atenção primária"],
  environment: "ubs",
  resourceProfile: "ubs-urbana",
  difficulty: 2,
  level: "internato",
  objectives: [
    "Avaliar anemia em DRC: índices hematimétricos, cinética de ferro, B12/folato, perdas",
    "Reconhecer deficiência de ferro pelos critérios atuais (ferritina e TSAT)",
    "Investigar perda digestiva em anemia microcítica, mesmo na DRC",
    "Repor ferro antes de indicar estimulador da eritropoiese; meta de Hb < 11,5 g/dL com AEE",
    "Evitar transfusão em paciente estável e coordenar o cuidado com a nefrologia"
  ],
  keywords: ["cansaço", "palidez", "rim", "anemia", "falta de ar", "diabetes"],
  patient: {
    name: "Terezinha Alves",
    ageYears: 64,
    sex: "feminino",
    weightKg: 66,
    heightCm: 157,
    visual: { ageGroup: "adulto", sex: "feminino", skinTone: 4, hairStyle: "coque", hairColor: "grisalho", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "UBS urbana, consulta programada. Mulher de 64 anos com diabetes tipo 2, hipertensão e doença renal crônica estágio 4 (TFG 22 mL/min/1,73 m²), acompanhada pela nefrologia a cada 6 meses. Traz exames: Hb 8,6 g/dL, VCM 78 fL. Queixa-se de cansaço e falta de ar ao subir a ladeira de casa.",
  communication: "normal",
  informants: [],
  history: [
    h("h-sintomas", "queixa", "Desde quando o cansaço? Falta de ar em repouso, dor no peito, desmaio?", "Faz uns 3 meses. Só canso para subir ladeira. Dor no peito não, desmaio não.", { keywords: ["cansaço", "falta de ar", "peito", "desmaio"] }),
    h("h-perdas", "sinais_alarme", "Notou fezes pretas, sangue nas fezes, sangramento de gengiva ou urina?", "Fezes escuras às vezes… achei que era do feijão. Sangue vivo não.", { keywords: ["fezes", "sangue", "preta", "sangramento"] }),
    hi("h-medicacoes", "medicacoes", "Que remédios usa?", [{ source: "paciente", text: "Insulina NPH, losartana, anlodipino, AAS 100 mg e omeprazol há anos. Ah, e um carbonato de cálcio para o fósforo." }], ["remédio", "medicação", "aas"]),
    h("h-alimentacao", "alimentacao_eliminacoes", "Como está a alimentação? Come carne, feijão, verduras?", "Diminuí a carne porque falaram que faz mal pro rim.", { keywords: ["alimentação", "carne", "come"] }),
    h("h-rastreio", "antecedentes", "Já fez colonoscopia ou endoscopia?", "Nunca fiz.", { keywords: ["colonoscopia", "endoscopia", "exame"] }),
    h("h-preferencia", "social", "Prefere tratar com comprimido ou com ferro na veia, se necessário?", "Se for comprimido, tomo direitinho. Ir ao hospital é difícil, depende de condução.", { keywords: ["prefere", "comprimido", "veia"] })
  ],
  initial: {
    vars: { hr: 92, sbp: 138, dbp: 78, rr: 16, spo2: 97, temp: 36.3, gcs: 15, pain: 0, glucose: 142, perfusion: 0.9, effort: 0.15, hb: 8.6, creat: 2.4, k: 5.0 },
    flags: { rhythm: "sinusal", posture: "sentado", painVisual: "nenhuma", speech: "frases", consciousness: "alerta", pallor: true },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Mucosas hipocoradas 2+/4+; sem icterícia; sem edema importante.", { label: "Geral" }),
    ex("e-coracao", "coracao", "ausculta", "Sopro sistólico suave de fluxo; ritmo regular.", { sound: "sopro" }),
    ex("e-abdome", "abdome_epigastrio", "palpacao", "Abdome indolor, sem massas ou visceromegalias.", {}),
    ex("e-pele", "pele", "inspecao", "Unhas quebradiças; sem petéquias.", {})
  ],
  testResults: [
    { testId: "cinetica_ferro", variants: [{ text: "Ferritina 48 ng/mL; saturação de transferrina 12% (deficiência absoluta de ferro)." }] },
    { testId: "b12_folato", variants: [{ text: "Vitamina B12 e folato normais; reticulócitos baixos para o grau de anemia." }] },
    { testId: "sangue_oculto_fezes", variants: [{ text: "Pesquisa de sangue oculto positiva." }] },
    { testId: "hemograma", variants: [{ text: "Hb 8,6 g/dL; VCM 78 fL; RDW 17%; leucócitos e plaquetas normais." }] },
    { testId: "funcao_renal", variants: [{ text: "Creatinina 2,4 mg/dL (TFGe 22); estável em relação ao exame anterior." }] }
  ],
  highlightedActions: ["medir_pa", "orientacoes_alta", "decisao_compartilhada"],
  rules: [
    { id: "r-cinetica", description: "Cinética de ferro solicitada", priority: 10, when: CINETICA, repeat: "once", effects: [obs("Ferritina < 100 ng/mL com TSAT < 40%: indicação de reposição de ferro na DRC.")] },
    { id: "r-investigacao", description: "Investigação de perda digestiva", priority: 10, when: { testCollected: "sangue_oculto_fezes" }, repeat: "once", effects: [obs("Anemia ferropriva com fezes escurecidas, AAS e nunca rastreada: indicar endoscopia digestiva alta e colonoscopia.")] },
    { id: "r-ferro", description: "Reposição de ferro iniciada", priority: 15, when: FERRO, repeat: "once", effects: [staff("enfermagem", "Vou orientar a tomar o ferro longe do carbonato de cálcio e do omeprazol, e voltar para o controle.")] },
    { id: "r-plano", description: "Plano completo: ferro, investigação, orientação", priority: 30, when: { all: [FERRO, CINETICA, INVESTIGOU, ORIENTA] }, repeat: "once", effects: [obs("Plano: ferro, endoscopia/colonoscopia, controle de Hb e ferro em 4–8 semanas, compartilhar com a nefrologia; AEE só após repor ferro e excluir outras causas, com Hb-alvo < 11,5 g/dL."), outcome("melhora")] },
    { id: "r-aee-sem-ferro", description: "Estimulador da eritropoiese sem repor ferro", priority: 20, when: { all: [{ drugGiven: "alfaepoetina" }, { not: FERRO }] }, repeat: "once", effects: [obs("AEE sem estoque de ferro tem resposta pobre e expõe a doses maiores; corrigir ferro e causas tratáveis antes."), outcome("complicacao")] },
    { id: "r-transferencia", description: "Encaminhada para transfusão sem indicação", priority: 20, when: { path: "disposition", op: "eq", value: "transferencia_regulada" }, repeat: "once", effects: [obs("Paciente estável, anemia crônica sem sinais de gravidade: transfusão não indicada; corrigir a causa.")] },
    { id: "r-sem-investigacao", description: "Fim da consulta sem investigar ferro", priority: 5, when: { all: [{ time: "gte", seconds: 1500 }, { not: CINETICA }] }, repeat: "once", effects: [obs("Atribuir toda anemia à DRC sem avaliar ferro e perdas pode deixar passar sangramento digestivo.")] }
  ],
  diagnosis: { primary: "ferropenia", accepted: ["ferropenia", "anemia_drc"], differentials: ["anemia_drc", "hda", "drc_agudizada", "icc_descompensada"] },
  acceptedDestinations: ["encaminhamento_ambulatorial", "retorno_programado", "alta_com_seguimento_ubs"],
  outcomeNotes: "Anemia microcítica (Hb 8,6) em DRC estágio 4 com deficiência absoluta de ferro (ferritina 48, TSAT 12%) e sangue oculto nas fezes, em uso de AAS: além da anemia da DRC, há ferropenia por provável perda digestiva. Repor ferro (oral, conforme preferência; IV se intolerância/falha), solicitar EDA e colonoscopia, rever AAS com o cardiologista/nefrologista, orientar interações (cálcio, IBP) e alimentação, comunicar a nefrologia; AEE apenas após repor ferro, com Hb-alvo < 11,5 g/dL; sem transfusão.",
  scoring: [
    { id: "s-sintomas", domain: "historia", description: "Gravidade dos sintomas", evidence: { kind: "historyAsked", items: ["h-sintomas"], minCount: 1 }, points: 5, severity: "importante", rationale: "Define urgência e necessidade de transfusão." },
    { id: "s-perdas", domain: "historia", description: "Perdas sanguíneas e medicações", evidence: { kind: "historyAsked", items: ["h-perdas", "h-medicacoes"], minCount: 2 }, points: 10, severity: "critica", rationale: "Fezes escurecidas + AAS: perda digestiva." },
    { id: "s-contexto", domain: "historia", description: "Alimentação, rastreio prévio e preferência", evidence: { kind: "historyAsked", items: ["h-alimentacao", "h-rastreio", "h-preferencia"], minCount: 2 }, points: 6, severity: "importante", rationale: "Plano viável e escolha da via do ferro.", sourceIds: ["INT-KDIGO-ANEMIA-2026"] },
    { id: "s-exame", domain: "historia", description: "Exame dirigido", evidence: { kind: "examDone", regions: ["geral", "coracao", "abdome_epigastrio"], minCount: 2 }, points: 4, severity: "importante", rationale: "Repercussão e sinais de doença associada." },
    { id: "s-ferro-lab", domain: "exames", description: "Ferritina e saturação de transferrina", evidence: { kind: "testOrdered", anyOf: ["cinetica_ferro"], withinSeconds: 1200 }, points: 12, severity: "critica", rationale: "Critério para repor ferro.", sourceIds: ["INT-KDIGO-ANEMIA-2026"] },
    { id: "s-outras", domain: "exames", description: "B12/folato e sangue oculto", evidence: { kind: "testOrdered", anyOf: ["b12_folato", "sangue_oculto_fezes"], withinSeconds: 1200 }, points: 8, severity: "importante", rationale: "Outras causas e perda digestiva." },
    { id: "s-ferro", domain: "tratamento", description: "Reposição de ferro", evidence: { kind: "drugGiven", anyOf: ["sulfato_ferroso", "sacarato_ferro"] }, points: 14, severity: "critica", rationale: "Ferritina < 100 e TSAT < 40%.", sourceIds: ["INT-KDIGO-ANEMIA-2026"] },
    { id: "s-aee", domain: "tratamento", description: "Falha: AEE sem repor ferro", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-aee-sem-ferro" } }, points: 8, penalty: true, severity: "importante", rationale: "Corrigir causas tratáveis antes do AEE.", sourceIds: ["INT-KDIGO-ANEMIA-2026"] },
    { id: "s-transf", domain: "tratamento", description: "Falha: encaminhou para transfusão sem indicação", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-transferencia" } }, points: 8, penalty: true, severity: "importante", rationale: "Paciente estável." },
    { id: "s-orientacao", domain: "tratamento", description: "Orientações (tomada do ferro, sinais de alarme, retorno)", evidence: { kind: "actionDone", anyOf: ["orientacoes_alta"] }, points: 8, severity: "importante", rationale: "Interações com cálcio e IBP; melena = procurar urgência." },
    { id: "s-compartilhada", domain: "tratamento", description: "Decisão compartilhada sobre via do ferro e exames", evidence: { kind: "actionDone", anyOf: ["decisao_compartilhada"] }, points: 4, severity: "menor", rationale: "Valores e acesso da paciente." },
    { id: "s-reav", domain: "reavaliacao", description: "Planejou reavaliação após iniciar o ferro", evidence: { kind: "reassessAfter", after: ["sulfato_ferroso", "sacarato_ferro"], reassess: ["orientacoes_alta", "hemograma"], withinSeconds: 1800 }, points: 5, severity: "importante", rationale: "Hb e ferro em 4–8 semanas." },
    { id: "s-dx", domain: "destino", description: "Ferropenia (com anemia da DRC)", evidence: { kind: "diagnosis", accepted: ["ferropenia", "anemia_drc"] }, points: 4, severity: "importante", rationale: "Microcitose, ferritina baixa." },
    { id: "s-destino", domain: "destino", description: "Seguimento ambulatorial coordenado", evidence: { kind: "disposition", accepted: ["encaminhamento_ambulatorial", "retorno_programado", "alta_com_seguimento_ubs"] }, points: 6, severity: "importante", rationale: "Endoscopia/colonoscopia e nefrologia, com a UBS coordenando." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Toda anemia em DRC é 'da DRC'?" },
      { level: 2, text: "VCM 78 sugere o quê? Que exame mostra o estoque de ferro?" },
      { level: 3, text: "Fezes escuras e AAS há anos, nunca fez endoscopia nem colonoscopia." },
      { level: 4, text: "Sugestão explícita: ferritina/TSAT, B12/folato, sangue oculto, sulfato ferroso, EDA + colonoscopia, orientações, decisão compartilhada, comunicar nefrologia, retorno." }
    ],
    summary: "Mulher de 64 anos com DRC estágio 4 e anemia microcítica (Hb 8,6) com deficiência absoluta de ferro e sangue oculto nas fezes, em uso de AAS.",
    pathophysiology: "Na DRC, a produção de eritropoetina cai e a hepcidina elevada reduz a absorção e a liberação de ferro. Perdas digestivas (AAS, lesões ocultas) e menor ingestão somam deficiência absoluta. Sem ferro, o AEE não funciona bem; Hb muito alta com AEE aumenta risco cardiovascular e de AVC.",
    keyPoints: [
      "Anemia na DRC: avaliar ferro, B12/folato, perdas e hemólise antes de atribuir à DRC.",
      "Repor ferro se ferritina < 100 com TSAT < 40%, ou ferritina 100–300 com TSAT < 25%.",
      "Via oral ou IV conforme preferência, gravidade, tolerância e acesso.",
      "AEE após corrigir causas; com AEE, Hb-alvo < 11,5 g/dL.",
      "Microcitose em idoso: investigar perda digestiva (EDA e colonoscopia)."
    ],
    alternatives: ["Ferro IV no ambulatório de nefrologia se intolerância/falha do oral.", "Alfaepoetina pelo componente especializado da assistência farmacêutica após repor ferro, sob nefrologia."],
    oralRubric: [
      { id: "o1", concept: "Cinética de ferro", synonyms: ["ferritina", "saturação", "tsat"], weight: 3 },
      { id: "o2", concept: "Perda digestiva", synonyms: ["sangue oculto", "endoscopia", "colonoscopia", "aas"], weight: 2 },
      { id: "o3", concept: "Ferro antes do AEE", synonyms: ["ferro", "eritropoetina", "aee"], weight: 3 },
      { id: "o4", concept: "Meta de Hb", synonyms: ["11,5", "meta", "alvo"], weight: 1 }
    ],
    simplifications: ["Ferro e alfaepoetina sem regra de dose validada (o app alerta).", "Resultados laboratoriais são liberados de imediato para fins didáticos (turnaround real em dias).", "Endoscopia e colonoscopia representadas pelo encaminhamento."]
  },
  references: ["INT-KDIGO-ANEMIA-2026", "BR-RENAME", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 12, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "História, exame, cinética de ferro, B12/folato, sangue oculto, ferro oral, decisão compartilhada, orientação, encaminhamento", commands: [ask(10, "h-sintomas"), ask(20, "h-perdas"), ask(30, "h-medicacoes"), ask(40, "h-rastreio"), ask(50, "h-preferencia"), { atSeconds: 60, type: "examine", payload: { region: "geral", maneuver: "inspecao" } }, { atSeconds: 70, type: "examine", payload: { region: "coracao", maneuver: "ausculta" } }, test(100, "cinetica_ferro"), test(110, "b12_folato"), test(120, "sangue_oculto_fezes"), act(300, "decisao_compartilhada"), rx(500, "sulfato_ferroso", "cp40", 40, "mg", "VO"), act(520, "orientacoes_alta"), dx(700, "ferropenia"), dest(720, "encaminhamento_ambulatorial")], runUntilSeconds: 1800, expect: [{ condition: { ruleFired: "r-plano" }, description: "plano completo" }, { condition: { not: { ruleFired: "r-aee-sem-ferro" } }, description: "sem AEE precoce" }, { condition: { not: { ruleFired: "r-sem-investigacao" } }, description: "investigou ferro" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 1800, expect: [{ condition: { ruleFired: "r-sem-investigacao" }, description: "anemia não investigada" }, { condition: { not: { ruleFired: "r-plano" } }, description: "sem plano" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Alfaepoetina sem ferro e encaminhamento para transfusão", commands: [rx(200, "alfaepoetina", "fa4000", 4000, "UI", "SC"), dest(400, "transferencia_regulada")], runUntilSeconds: 1800, expect: [{ condition: { ruleFired: "r-aee-sem-ferro" }, description: "AEE sem ferro" }, { condition: { ruleFired: "r-transferencia" }, description: "transfusão sem indicação" }, { condition: { ruleFired: "r-sem-investigacao" }, description: "sem investigação" }] },
    { id: "t-atraso", kind: "delay", description: "Investigação só no fim; ferro após resultados", commands: [ask(20, "h-sintomas"), test(1600, "cinetica_ferro"), test(1610, "sangue_oculto_fezes"), rx(1700, "sulfato_ferroso", "cp40", 40, "mg", "VO"), act(1750, "orientacoes_alta"), dest(1800, "retorno_programado")], runUntilSeconds: 2000, expect: [{ condition: { ruleFired: "r-sem-investigacao" }, description: "atraso registrado" }, { condition: { ruleFired: "r-plano" }, description: "plano completo ao final" }] },
    { id: "t-alternativa", kind: "alternative", description: "Investigação com B12/folato, ferro oral e seguimento na própria UBS", commands: [ask(20, "h-perdas"), test(60, "cinetica_ferro"), test(70, "b12_folato"), act(200, "decisao_compartilhada"), rx(300, "sulfato_ferroso", "cp40", 40, "mg", "VO"), act(320, "orientacoes_alta"), dest(500, "alta_com_seguimento_ubs")], runUntilSeconds: 1500, expect: [{ condition: { ruleFired: "r-plano" }, description: "plano completo" }, { condition: { ruleFired: "r-ferro" }, description: "ferro iniciado" }] }
  ]
};
