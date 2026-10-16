import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const NPH = { drugGiven: "insulina_nph" };
const METF = { drugGiven: "metformina" };
const ORIENTA = { actionCompleted: "orientacoes_alta" };
const GRAVIDADE = { all: [{ actionCompleted: "glicemia_capilar" }, { any: [{ testCollected: "urina_tipo1" }, { actionCompleted: "medir_pa" }] }] };

export const C056: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C056",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Pedreiro que emagreceu, urina muito e sente muita sede",
  teachingTitle: "Hiperglicemia sintomática na UBS — excluir descompensação aguda, iniciar insulina basal com metformina, educação e seguimento seguro",
  group: "Endocrinologia",
  specialties: ["Medicina de família e comunidade", "Endocrinologia", "Atenção primária"],
  environment: "ubs",
  resourceProfile: "ubs-urbana",
  difficulty: 2,
  level: "internato",
  objectives: [
    "Excluir cetoacidose e estado hiperosmolar à beira-leito (sinais vitais, hidratação, consciência, cetonúria)",
    "Reconhecer hiperglicemia com sintomas catabólicos como indicação de insulina desde o início",
    "Iniciar NPH ao deitar com metformina, segundo a diretriz da SBD para o SUS",
    "Ensinar automonitorização, sinais de hipoglicemia e de descompensação; marcar retorno precoce",
    "Lembrar diagnósticos diferenciais (DM1/LADA em adulto magro)"
  ],
  keywords: ["sede", "urina muito", "emagrecimento", "diabetes", "glicemia alta", "visão embaçada"],
  patient: {
    name: "Carlos Eduardo Nunes",
    ageYears: 46,
    sex: "masculino",
    weightKg: 74,
    heightCm: 174,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 4, hairStyle: "crespo_curto", hairColor: "preto", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "UBS urbana, consulta de demanda espontânea. Homem de 46 anos, pedreiro, procura a unidade porque há 2 meses urina muito, tem muita sede, emagreceu e a visão está embaçada. A técnica de enfermagem mediu a glicemia capilar na triagem: 368 mg/dL.",
  communication: "normal",
  informants: [],
  history: [
    h("h-sintomas", "queixa", "Conte o que está sentindo e desde quando.", "Faz uns dois meses: sede o dia todo, levanto três vezes de noite pra urinar, emagreci uns 7 quilos sem fazer dieta e a vista está embaçando.", { keywords: ["sentindo", "quando", "sede", "urina"] }),
    h("h-alarme", "sinais_alarme", "Tem vômito, dor na barriga, falta de ar, sonolência ou confusão?", "Não, nada disso. Só cansado.", { keywords: ["vômito", "barriga", "falta de ar", "sonolência"] }),
    h("h-familia", "familia", "Alguém na família tem diabetes? Você tem outras doenças?", "Minha mãe e um irmão têm diabetes, tomam insulina. Eu nunca tive nada, faz anos que não vou ao médico.", { keywords: ["família", "doença", "mãe"] }),
    h("h-habitos", "habitos", "Como é sua alimentação, bebida, cigarro e atividade?", "Como muito pão e refrigerante, bebo cerveja no fim de semana, não fumo. Trabalho pesado na obra.", { keywords: ["alimentação", "refrigerante", "bebida", "cigarro"] }),
    h("h-infeccao", "fatores_associados", "Tem ferida que não cicatriza, ardência para urinar, coceira?", "Coceira na virilha às vezes.", { keywords: ["ferida", "ardência", "coceira", "infecção"] }),
    h("h-rotina", "social", "Tem geladeira em casa? Alguém pode ajudar com a insulina? Consegue vir semana que vem?", "Tenho geladeira. Minha esposa ajuda a mãe dela com insulina. Venho sim, de manhã cedo.", { keywords: ["geladeira", "ajuda", "voltar", "retorno"] })
  ],
  initial: {
    vars: { hr: 88, sbp: 132, dbp: 84, rr: 16, spo2: 98, temp: 36.4, gcs: 15, pain: 0, glucose: 368, perfusion: 0.95, effort: 0.1, ketones: 0.4 },
    flags: { rhythm: "sinusal", posture: "sentado", painVisual: "nenhuma", speech: "frases", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr", "glucose"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Bom estado geral, lúcido, mucosas discretamente secas; IMC ~24 kg/m²; sem hálito cetônico.", { label: "Geral e hidratação" }),
    ex("e-pes", "membro_inferior_d", "inspecao", "Pés íntegros, sem úlceras; sensibilidade protetora preservada ao monofilamento; pulsos pediosos presentes.", { label: "Pés" }),
    ex("e-pele", "pele", "inspecao", "Intertrigo candidiásico em região inguinal.", {}),
    ex("e-abdome", "abdome_epigastrio", "palpacao", "Abdome indolor.", {}),
    ex("e-torax", "torax_anterior", "ausculta", "Murmúrio presente, sem ruídos adventícios.", { sound: "murmurio_normal" })
  ],
  testResults: [
    { testId: "urina_tipo1", variants: [{ text: "Glicosúria ++++, cetonúria negativa a traços, sem leucocitúria ou nitrito." }] },
    { testId: "hba1c", variants: [{ text: "HbA1c 11,8% (resultado na próxima semana)." }] },
    { testId: "funcao_renal", variants: [{ text: "Creatinina 0,9 mg/dL (TFG estimada > 90 mL/min/1,73 m²)." }] }
  ],
  highlightedActions: ["glicemia_capilar", "medir_pa", "orientacoes_alta", "decisao_compartilhada"],
  rules: [
    { id: "r-avaliacao", description: "Gravidade avaliada: sem sinais de descompensação aguda", priority: 10, when: GRAVIDADE, repeat: "once", effects: [obs("Sinais vitais normais, lúcido, hidratação razoável, sem cetonúria significativa: hiperglicemia sintomática sem CAD/EHH — manejo na UBS é possível com retorno precoce.")] },
    { id: "r-nph", description: "Insulina basal iniciada", priority: 20, when: NPH, repeat: "once", effects: [staff("enfermagem", "Vou mostrar a ele e à esposa como aplicar a NPH e guardar o frasco na geladeira.")] },
    { id: "r-plano", description: "Insulina + metformina + orientação: plano seguro", priority: 40, when: { all: [NPH, METF, ORIENTA] }, repeat: "once", effects: [trend("glucose", 260, 3600, "plano", 40), obs("Plano pactuado: NPH ao deitar, metformina com as refeições, glicemia de jejum diária, sinais de hipoglicemia e de descompensação, retorno em 7 dias."), outcome("melhora")] },
    { id: "r-sem-insulina", description: "Sintomas catabólicos sem insulina", priority: 15, when: { all: [{ time: "gte", seconds: 1500 }, { not: NPH }] }, repeat: "once", effects: [obs("Sem insulina, a hiperglicemia com perda de peso tende a persistir e há risco de descompensação aguda (CAD/EHH) nas próximas semanas.")] },
    { id: "r-nph-sem-orientacao", description: "Insulina prescrita sem orientar hipoglicemia", priority: 16, when: { all: [NPH, { time: "gte", seconds: 1800 }, { not: ORIENTA }] }, repeat: "once", effects: [obs("Iniciar insulina sem orientar técnica, armazenamento e hipoglicemia é inseguro.")] }
  ],
  diagnosis: { primary: "dm2_descompensado", accepted: ["dm2_descompensado", "dm1_inicio"], differentials: ["dm1_inicio", "cad", "ehh", "crise_tireotoxica", "itu_complicada"] },
  acceptedDestinations: ["retorno_programado", "alta_com_seguimento_ubs"],
  outcomeNotes: "Diabetes provavelmente tipo 2 com hiperglicemia sintomática e catabólica (perda de peso, poliúria, polidipsia; HbA1c 11,8%), sem sinais de CAD ou EHH. Conduta na UBS: NPH ao deitar (~10 UI ou 0,2 UI/kg) com metformina em dose inicial baixa, glicemia de jejum diária, educação sobre insulina e hipoglicemia, tratamento do intertrigo, exames de base e retorno em 7 dias. Considerar DM1/LADA se magro, cetose ou má resposta.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Sintomas e tempo de evolução", evidence: { kind: "historyAsked", items: ["h-sintomas"], minCount: 1 }, points: 6, severity: "importante", rationale: "Sintomas catabólicos indicam deficiência de insulina." },
    { id: "s-alarme", domain: "historia", description: "Pesquisou sinais de descompensação aguda", evidence: { kind: "historyAsked", items: ["h-alarme"], minCount: 1 }, points: 10, severity: "critica", rationale: "Vômitos, dor abdominal, dispneia ou rebaixamento exigem serviço de urgência." },
    { id: "s-contexto", domain: "historia", description: "Família, hábitos e condições para insulina", evidence: { kind: "historyAsked", items: ["h-familia", "h-habitos", "h-rotina"], minCount: 2 }, points: 6, severity: "importante", rationale: "Plano viável e seguro." },
    { id: "s-sinais", domain: "priorizacao", description: "Sinais vitais e glicemia confirmada", evidence: { kind: "actionDone", anyOf: ["medir_pa", "glicemia_capilar"], withinSeconds: 600 }, points: 6, severity: "importante", rationale: "Classificar gravidade." },
    { id: "s-exame", domain: "historia", description: "Hidratação, pele e pés", evidence: { kind: "examDone", regions: ["geral", "membro_inferior_d", "pele"], minCount: 2 }, points: 6, severity: "importante", rationale: "Excluir desidratação; rastrear pé diabético; candidíase." },
    { id: "s-urina", domain: "exames", description: "Urina (cetonúria) e exames de base", evidence: { kind: "testOrdered", anyOf: ["urina_tipo1", "hba1c", "funcao_renal"], withinSeconds: 1200 }, points: 8, severity: "importante", rationale: "Cetonúria; HbA1c e função renal para o plano." },
    { id: "s-nph", domain: "tratamento", description: "Insulina NPH ao deitar", evidence: { kind: "drugGiven", anyOf: ["insulina_nph"] }, points: 16, severity: "critica", rationale: "Sintomas de deficiência de insulina: iniciar insulina mesmo ao diagnóstico.", sourceIds: ["BR-SBD-SUS-2026"] },
    { id: "s-metformina", domain: "tratamento", description: "Metformina em dose inicial baixa", evidence: { kind: "drugGiven", anyOf: ["metformina"] }, points: 8, severity: "importante", rationale: "Primeira linha, titulação gradual.", sourceIds: ["BR-SBD-SUS-2026"] },
    { id: "s-orientacao", domain: "tratamento", description: "Orientou técnica, hipoglicemia e sinais de alarme", evidence: { kind: "actionDone", anyOf: ["orientacoes_alta"] }, points: 10, severity: "critica", rationale: "Segurança da insulinização." },
    { id: "s-compartilhada", domain: "tratamento", description: "Decisão compartilhada", evidence: { kind: "actionDone", anyOf: ["decisao_compartilhada"] }, points: 4, severity: "menor", rationale: "Adesão e autonomia." },
    { id: "s-reav", domain: "reavaliacao", description: "Plano de automonitorização após iniciar insulina", evidence: { kind: "reassessAfter", after: ["insulina_nph"], reassess: ["orientacoes_alta", "glicemia_capilar"], withinSeconds: 1800 }, points: 6, severity: "importante", rationale: "Ajuste de 2–4 UI pela glicemia de jejum." },
    { id: "s-dx", domain: "destino", description: "Diabetes descompensado sem crise aguda", evidence: { kind: "diagnosis", accepted: ["dm2_descompensado", "dm1_inicio"] }, points: 4, severity: "importante", rationale: "Glicemia 368 com sintomas." },
    { id: "s-destino", domain: "destino", description: "Retorno programado precoce na UBS", evidence: { kind: "disposition", accepted: ["retorno_programado", "alta_com_seguimento_ubs"] }, points: 10, severity: "critica", rationale: "Sem descompensação: cuidado longitudinal na APS, retorno em dias." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Antes do remédio: ele está em crise aguda ou não?" },
      { level: 2, text: "Sinais vitais, consciência, vômitos, dor abdominal, hálito, cetonúria." },
      { level: 3, text: "Perda de peso com poliúria e polidipsia indicam falta de insulina." },
      { level: 4, text: "Sugestão explícita: glicemia + PA + urina, NPH ~10 UI ao deitar, metformina 500 mg, orientar hipoglicemia e técnica, decisão compartilhada, retorno em 7 dias." }
    ],
    summary: "Homem de 46 anos com diabetes recém-diagnosticado (glicemia 368 mg/dL, HbA1c 11,8%) com sintomas catabólicos, sem CAD ou EHH, atendido na UBS.",
    pathophysiology: "A glicotoxicidade e a deficiência relativa de insulina impedem o uso de glicose; o organismo usa gordura e músculo (perda de peso) e a glicosúria causa diurese osmótica (poliúria, sede, visão embaçada). A insulina reverte a glicotoxicidade e muitas vezes permite simplificar o esquema depois.",
    keyPoints: [
      "Primeiro classificar: CAD/EHH vão para o serviço de urgência; hiperglicemia sem crise pode ser manejada na APS.",
      "Sintomas catabólicos (perda de peso, poliúria, polidipsia) → insulina desde o início.",
      "NPH ao deitar ~10 UI ou 0,2 UI/kg; ajustar 2–4 UI pela glicemia de jejum.",
      "Metformina em dose baixa com titulação; ajustar à função renal.",
      "Educação (técnica, armazenamento, hipoglicemia, sinais de alarme) e retorno em dias."
    ],
    alternatives: ["Terapia dupla oral (metformina + gliclazida) se HbA1c alta sem sintomas catabólicos.", "Encaminhar à urgência se cetonúria importante, vômitos ou alteração de consciência.", "Considerar DM1/LADA (anti-GAD, peptídeo C) se magro, cetose ou falha precoce."],
    oralRubric: [
      { id: "o1", concept: "Excluir crise aguda", synonyms: ["cetoacidose", "cad", "hiperosmolar", "cetonúria", "gravidade"], weight: 2 },
      { id: "o2", concept: "Insulina basal", synonyms: ["nph", "insulina", "basal", "ao deitar"], weight: 3 },
      { id: "o3", concept: "Metformina", synonyms: ["metformina"], weight: 1 },
      { id: "o4", concept: "Educação e retorno", synonyms: ["hipoglicemia", "orientação", "retorno", "automonitorização"], weight: 2 }
    ],
    simplifications: ["Tratamento do intertrigo não é pontuado.", "HbA1c chega em dias; a decisão é clínica.", "A queda da glicemia no consultório é ilustrativa."]
  },
  references: ["BR-SBD-SUS-2026", "BR-SBD", "BR-DM2", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 15, allowSexSwap: true, allowWeightPercent: 20, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Sinais de alarme, PA/glicemia, exame, urina e HbA1c, NPH + metformina, orientação, decisão compartilhada, retorno", commands: [ask(10, "h-sintomas"), ask(20, "h-alarme"), ask(30, "h-familia"), ask(40, "h-rotina"), act(50, "medir_pa"), act(100, "glicemia_capilar"), { atSeconds: 150, type: "examine", payload: { region: "geral", maneuver: "inspecao" } }, { atSeconds: 160, type: "examine", payload: { region: "membro_inferior_d", maneuver: "inspecao" } }, test(180, "urina_tipo1"), test(190, "hba1c"), test(200, "funcao_renal"), act(400, "decisao_compartilhada"), rx(600, "insulina_nph", "fr100", 10, "UI", "SC"), rx(620, "metformina", "cp500", 500, "mg", "VO"), act(640, "orientacoes_alta"), dx(800, "dm2_descompensado"), dest(820, "retorno_programado")], runUntilSeconds: 2400, expect: [{ condition: { ruleFired: "r-avaliacao" }, description: "gravidade avaliada" }, { condition: { ruleFired: "r-plano" }, description: "plano seguro" }, { condition: { not: { ruleFired: "r-sem-insulina" } }, description: "insulina iniciada" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 1800, expect: [{ condition: { ruleFired: "r-sem-insulina" }, description: "sem insulina" }, { condition: { not: { ruleFired: "r-plano" } }, description: "sem plano" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Só metformina e retorno distante, sem avaliar gravidade", commands: [rx(200, "metformina", "cp850", 850, "mg", "VO"), dest(300, "encaminhamento_ambulatorial")], runUntilSeconds: 1800, expect: [{ condition: { ruleFired: "r-sem-insulina" }, description: "catabolismo sem insulina" }, { condition: { not: { ruleFired: "r-avaliacao" } }, description: "gravidade não avaliada" }] },
    { id: "t-atraso", kind: "delay", description: "Insulina só no fim da consulta, orientação tardia", commands: [ask(20, "h-alarme"), act(60, "glicemia_capilar"), act(120, "medir_pa"), rx(300, "metformina", "cp500", 500, "mg", "VO"), rx(1600, "insulina_nph", "fr100", 10, "UI", "SC"), act(1900, "orientacoes_alta"), dest(2000, "retorno_programado")], runUntilSeconds: 2400, expect: [{ condition: { ruleFired: "r-sem-insulina" }, description: "atraso registrado" }, { condition: { ruleFired: "r-nph-sem-orientacao" }, description: "orientação tardia" }, { condition: { ruleFired: "r-plano" }, description: "plano completo ao final" }] },
    { id: "t-alternativa", kind: "alternative", description: "NPH por peso (0,2 UI/kg) com urina e seguimento na UBS", commands: [ask(10, "h-alarme"), act(30, "glicemia_capilar"), test(60, "urina_tipo1"), rx(300, "insulina_nph", "fr100", 0.2, "UI/kg", "SC"), rx(320, "metformina", "cp500", 500, "mg", "VO"), act(340, "orientacoes_alta"), dest(600, "alta_com_seguimento_ubs")], runUntilSeconds: 1800, expect: [{ condition: { ruleFired: "r-plano" }, description: "plano seguro" }, { condition: { ruleFired: "r-avaliacao" }, description: "gravidade avaliada" }] }
  ]
};
