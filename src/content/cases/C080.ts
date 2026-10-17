import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, h, hi, obs, outcome, rx, test } from "./helpers";

const AAS = { drugGiven: "aas" };
const METILDOPA = { any: [{ drugGiven: "metildopa" }, { drugGiven: "nifedipino" }, { drugGiven: "anlodipino" }] };
const ORIENTA = { actionCompleted: "orientacoes_alta" };
const LOSARTANA = { drugGiven: "losartana" };

export const C080: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C080",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Primeira consulta de pré-natal de mulher hipertensa que já teve problema na gravidez anterior",
  teachingTitle: "Pré-natal com fator de risco — hipertensão crônica e pré-eclâmpsia prévia: trocar BRA, AAS e cálcio, exames de base, alto risco compartilhado e sinais de alarme",
  group: "Obstetrícia e Ginecologia",
  specialties: ["Medicina de família e comunidade", "Obstetrícia", "Atenção primária"],
  environment: "ubs",
  resourceProfile: "ubs-urbana",
  difficulty: 2,
  level: "internato",
  objectives: [
    "Identificar fatores de risco para pré-eclâmpsia na primeira consulta",
    "Suspender BRA/IECA na gestação e escolher anti-hipertensivo seguro",
    "Prescrever AAS em baixa dose (100–150 mg à noite) antes de 16 semanas e cálcio quando indicado",
    "Solicitar exames de base (proteinúria, creatinina, hemograma) e encaminhar ao pré-natal de alto risco mantendo o vínculo com a UBS",
    "Orientar sinais de alarme e retorno precoce"
  ],
  keywords: ["pré-natal", "gestante", "pressão alta", "primeira consulta", "grávida", "losartana"],
  patient: {
    name: "Priscila Andrade",
    ageYears: 33,
    sex: "feminino",
    weightKg: 88,
    heightCm: 163,
    pregnancyWeeks: 13,
    visual: { ageGroup: "adulto", sex: "feminino", skinTone: 4, hairStyle: "crespo_volume", hairColor: "preto", build: "obeso", pregnancyTrimester: 1 }
  },
  briefing: "UBS urbana, primeira consulta de pré-natal. Mulher de 33 anos, segunda gestação, 13 semanas pela data da última menstruação, teste rápido de gravidez positivo na semana passada. Hipertensa há 4 anos.",
  communication: "normal",
  informants: [],
  history: [
    h("h-gestacao-anterior", "gestacao", "Como foi a gestação anterior?", "Tive pré-eclâmpsia grave, o bebê nasceu de cesárea com 32 semanas, ficou na UTI neonatal. Hoje está com 5 anos, bem.", { keywords: ["gestação anterior", "parto", "anterior"] }),
    h("h-medicacoes", "medicacoes", "Que remédios você usa?", "Losartana 50 mg duas vezes ao dia e hidroclorotiazida de manhã. Continuo tomando.", { keywords: ["remédio", "medicação", "losartana"] }),
    h("h-sintomas", "sinais_alarme", "Dor de cabeça, alteração na visão, inchaço súbito, dor no estômago?", "Nada disso.", { keywords: ["cabeça", "visão", "inchaço", "estômago"] }),
    h("h-alimentacao", "alimentacao_eliminacoes", "Como é sua alimentação? Leite e derivados?", "Quase não tomo leite, não gosto.", { keywords: ["alimentação", "leite", "cálcio"] }),
    h("h-outros", "antecedentes", "Diabetes, doença renal, lúpus, trombose?", "Não. Minha mãe é diabética.", { keywords: ["diabetes", "rim", "lúpus", "trombose"] }),
    h("h-planos", "social", "Como é sua rotina e acesso a consultas?", "Trabalho de dia como caixa, consigo vir de manhã cedo. O hospital de alto risco fica na cidade vizinha.", { keywords: ["rotina", "trabalho", "acesso"] })
  ],
  initial: {
    vars: { hr: 84, sbp: 150, dbp: 98, rr: 16, spo2: 98, temp: 36.5, gcs: 15, pain: 0, glucose: 98, perfusion: 0.95, effort: 0.1, fetalHr: 158 },
    flags: { rhythm: "sinusal", posture: "sentado", painVisual: "nenhuma", speech: "frases", consciousness: "alerta", pregnant: true },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Bom estado geral; IMC ~33 kg/m²; sem edema.", { label: "Geral" }),
    ex("e-obst", "abdome_qid", "palpacao", "Útero palpável logo acima da sínfise, compatível com 13 semanas.", { label: "Abdome" }),
    ex("e-coracao", "coracao", "ausculta", "Bulhas normais, sem sopros.", { sound: "bulhas_normais" })
  ],
  testResults: [
    { testId: "urina_tipo1", variants: [{ text: "Proteína negativa; sem leucocitúria." }] },
    { testId: "funcao_renal", variants: [{ text: "Creatinina 0,8 mg/dL." }] },
    { testId: "hemograma", variants: [{ text: "Hb 12,4 g/dL; plaquetas 236.000/mm³." }] },
    { testId: "ecg12", variants: [{ text: "Ritmo sinusal; sem sobrecarga." }] },
    { testId: "teste_rapido_hiv", variants: [{ text: "Não reagente." }] }
  ],
  highlightedActions: ["medir_pa", "sonar_bcf", "orientacoes_alta", "decisao_compartilhada"],
  rules: [
    { id: "r-losartana", description: "BRA mantido na gestação", priority: 30, when: LOSARTANA, repeat: "once", effects: [obs("BRA/IECA são fetotóxicos (malformações renais fetais a partir do 2º trimestre): suspender assim que a gestação for confirmada."), outcome("complicacao")] },
    { id: "r-aas", description: "AAS em baixa dose", priority: 20, when: AAS, repeat: "once", effects: [obs("AAS 100–150 mg à noite, idealmente antes de 16 semanas, até 36 semanas.")] },
    { id: "r-anti", description: "Anti-hipertensivo seguro", priority: 20, when: METILDOPA, repeat: "once", effects: [obs("Troca para anti-hipertensivo compatível com a gestação; reavaliar PA em 1–2 semanas.")] },
    { id: "r-plano", description: "Plano completo de pré-natal de risco", priority: 40, when: { all: [AAS, METILDOPA, ORIENTA, { not: LOSARTANA }] }, repeat: "once", effects: [obs("Plano: metildopa, AAS e cálcio, exames de base, encaminhamento ao pré-natal de alto risco com acompanhamento compartilhado pela UBS, sinais de alarme e retorno em 1–2 semanas."), outcome("melhora")] },
    { id: "r-sem-aas", description: "Fim da consulta sem AAS", priority: 10, when: { all: [{ time: "gte", seconds: 2000 }, { not: AAS }] }, repeat: "once", effects: [obs("Perder a janela antes de 16 semanas reduz o benefício do AAS na prevenção de pré-eclâmpsia.")] }
  ],
  diagnosis: { primary: "gestacao_alto_risco", accepted: ["gestacao_alto_risco", "hipertensao_gestacional", "has_nao_controlada"], differentials: ["pre_eclampsia_grave", "hipertensao_gestacional", "has_nao_controlada", "hipertensao_avental_branco"] },
  acceptedDestinations: ["encaminhamento_ambulatorial", "retorno_programado"],
  outcomeNotes: "Gestante de 13 semanas com hipertensão crônica em uso de losartana, pré-eclâmpsia grave prévia e obesidade: alto risco para pré-eclâmpsia. Suspender losartana (fetotóxica), iniciar metildopa (ou nifedipino/anlodipino), AAS 100–150 mg à noite até 36 semanas, carbonato de cálcio pela baixa ingestão, exames de base (proteinúria, creatinina, hemograma, ECG), sorologias do pré-natal, encaminhamento ao pré-natal de alto risco com cuidado compartilhado, sinais de alarme e retorno em 1–2 semanas.",
  scoring: [
    { id: "s-risco", domain: "historia", description: "Identificou pré-eclâmpsia prévia e medicações", evidence: { kind: "historyAsked", items: ["h-gestacao-anterior", "h-medicacoes"], minCount: 2 }, points: 12, severity: "critica", rationale: "Principais fatores de risco e BRA em uso.", sourceIds: ["BR-FEBRASGO-PE-2019"] },
    { id: "s-outros", domain: "historia", description: "Alimentação, comorbidades e contexto", evidence: { kind: "historyAsked", items: ["h-alimentacao", "h-outros", "h-planos"], minCount: 2 }, points: 5, severity: "importante", rationale: "Cálcio, diabetes, acesso ao alto risco." },
    { id: "s-pa", domain: "priorizacao", description: "Mediu PA (repetida) e BCF", evidence: { kind: "actionDone", anyOf: ["medir_pa"], withinSeconds: 600 }, points: 6, severity: "importante", rationale: "Confirma hipertensão." },
    { id: "s-labs", domain: "exames", description: "Exames de base (urina, creatinina, hemograma)", evidence: { kind: "testOrdered", anyOf: ["urina_tipo1", "funcao_renal", "hemograma"], withinSeconds: 1500 }, points: 8, severity: "importante", rationale: "Linha de base para detectar pré-eclâmpsia sobreposta.", sourceIds: ["BR-FEBRASGO-PE-2019"] },
    { id: "s-sorologias", domain: "exames", description: "Testes do pré-natal (HIV etc.)", evidence: { kind: "testOrdered", anyOf: ["teste_rapido_hiv"] }, points: 3, severity: "menor", rationale: "Rotina da primeira consulta." },
    { id: "s-losartana", domain: "tratamento", description: "Falha: manteve/prescreveu BRA", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-losartana" } }, points: 14, penalty: true, severity: "critica", rationale: "Fetotóxico.", sourceIds: ["BR-FEBRASGO-PE-2019"] },
    { id: "s-anti", domain: "tratamento", description: "Anti-hipertensivo compatível com a gestação", evidence: { kind: "drugGiven", anyOf: ["metildopa", "nifedipino", "anlodipino"] }, points: 12, severity: "critica", rationale: "PA ≥ 150/100 indica tratamento.", sourceIds: ["BR-FEBRASGO-PE-2019"] },
    { id: "s-aas", domain: "tratamento", description: "AAS 100–150 mg à noite", evidence: { kind: "drugGiven", anyOf: ["aas"] }, points: 14, severity: "critica", rationale: "Prevenção de pré-eclâmpsia; iniciar antes de 16 semanas.", sourceIds: ["BR-FEBRASGO-PE-2019"] },
    { id: "s-calcio", domain: "tratamento", description: "Cálcio (baixa ingestão)", evidence: { kind: "drugGiven", anyOf: ["carbonato_calcio"] }, points: 6, severity: "importante", rationale: "1–2 g/dia em gestante de risco com baixa ingestão.", sourceIds: ["BR-FEBRASGO-PE-2019"] },
    { id: "s-orient", domain: "tratamento", description: "Sinais de alarme e retorno precoce", evidence: { kind: "actionDone", anyOf: ["orientacoes_alta"] }, points: 8, severity: "importante", rationale: "Cefaleia, escotomas, epigastralgia, edema súbito." },
    { id: "s-dx", domain: "destino", description: "Gestação de alto risco", evidence: { kind: "diagnosis", accepted: ["gestacao_alto_risco", "hipertensao_gestacional", "has_nao_controlada"] }, points: 4, severity: "importante", rationale: "HAS crônica + PE prévia." },
    { id: "s-destino", domain: "destino", description: "Pré-natal de alto risco com cuidado compartilhado", evidence: { kind: "disposition", accepted: ["encaminhamento_ambulatorial", "retorno_programado"] }, points: 8, severity: "importante", rationale: "Referência sem perder o vínculo da APS." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Quais fatores de risco para pré-eclâmpsia ela tem?" },
      { level: 2, text: "Algum remédio dela é proibido na gestação?" },
      { level: 3, text: "Há uma medida barata que reduz pré-eclâmpsia se começada antes de 16 semanas." },
      { level: 4, text: "Sugestão explícita: PA repetida, BCF, exames de base, suspender losartana, metildopa, AAS 100 mg à noite, carbonato de cálcio, orientar, encaminhar ao alto risco e retorno em 1–2 semanas." }
    ],
    summary: "Gestante de 33 anos, 13 semanas, hipertensa crônica em uso de losartana, com pré-eclâmpsia grave prévia e obesidade.",
    pathophysiology: "A pré-eclâmpsia começa com invasão trofoblástica inadequada no primeiro trimestre; o AAS em baixa dose, iniciado cedo, modula o desequilíbrio prostaciclina/tromboxano e reduz a incidência em gestantes de risco. BRA e IECA reduzem a perfusão renal fetal e causam oligoâmnio e malformações.",
    keyPoints: [
      "Fatores de risco: pré-eclâmpsia prévia, HAS crônica, obesidade, diabetes, doença renal, autoimune, gemelaridade.",
      "AAS 100–150 mg à noite, idealmente antes de 16 semanas, até 36 semanas.",
      "Cálcio 1–2 g/dia se risco e baixa ingestão.",
      "Suspender IECA/BRA; usar metildopa, nifedipino ou anlodipino.",
      "Exames de base, alto risco compartilhado com a UBS, sinais de alarme."
    ],
    alternatives: ["Nifedipino de liberação prolongada ou anlodipino em vez de metildopa.", "Manter tiazídico em alguns protocolos se já usado antes da gestação (controverso)."],
    oralRubric: [
      { id: "o1", concept: "Fatores de risco", synonyms: ["pré-eclâmpsia prévia", "hipertensão crônica", "obesidade"], weight: 2 },
      { id: "o2", concept: "Suspender BRA", synonyms: ["losartana", "bra", "ieca", "fetotóxico"], weight: 3 },
      { id: "o3", concept: "AAS e cálcio", synonyms: ["aas", "aspirina", "cálcio"], weight: 3 },
      { id: "o4", concept: "Alto risco compartilhado", synonyms: ["alto risco", "encaminhamento", "compartilhado"], weight: 1 }
    ],
    simplifications: ["A suspensão da losartana é avaliada por não prescrevê-la e pela troca do anti-hipertensivo.", "Sorologias além do HIV não estão no catálogo."]
  },
  references: ["BR-FEBRASGO-PE-2019", "BR-GESTACAO", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 8, allowSexSwap: false, allowWeightPercent: 15, allowVisualVariation: true, forbidden: ["sexo masculino"] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Fatores de risco, PA, BCF, exames, metildopa, AAS, cálcio, orientação, alto risco", commands: [ask(10, "h-gestacao-anterior"), ask(20, "h-medicacoes"), ask(30, "h-alimentacao"), ask(40, "h-outros"), act(50, "medir_pa"), act(400, "medir_pa"), act(500, "sonar_bcf"), test(600, "urina_tipo1"), test(610, "funcao_renal"), test(620, "hemograma"), test(630, "teste_rapido_hiv"), act(800, "decisao_compartilhada"), rx(1000, "metildopa", "cp250", 250, "mg", "VO"), rx(1020, "aas", "cp100", 100, "mg", "VO"), rx(1040, "carbonato_calcio", "cp500", 500, "mg", "VO"), act(1100, "orientacoes_alta"), dx(1200, "gestacao_alto_risco"), dest(1300, "encaminhamento_ambulatorial")], runUntilSeconds: 2400, expect: [{ condition: { ruleFired: "r-plano" }, description: "plano completo" }, { condition: { not: { ruleFired: "r-losartana" } }, description: "sem BRA" }, { condition: { not: { ruleFired: "r-sem-aas" } }, description: "AAS prescrito" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 2400, expect: [{ condition: { ruleFired: "r-sem-aas" }, description: "sem AAS" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Renova losartana e retorno em 1 mês", commands: [act(50, "medir_pa"), rx(300, "losartana", "cp50", 50, "mg", "VO"), dest(400, "retorno_programado")], runUntilSeconds: 2400, expect: [{ condition: { ruleFired: "r-losartana" }, description: "BRA mantido" }, { condition: { ruleFired: "r-sem-aas" }, description: "sem AAS" }] },
    { id: "t-atraso", kind: "delay", description: "AAS só no fim, depois de 'esperar exames'", commands: [act(50, "medir_pa"), test(100, "urina_tipo1"), rx(300, "metildopa", "cp250", 250, "mg", "VO"), rx(2100, "aas", "cp100", 100, "mg", "VO"), act(2200, "orientacoes_alta"), dest(2300, "encaminhamento_ambulatorial")], runUntilSeconds: 2600, expect: [{ condition: { ruleFired: "r-sem-aas" }, description: "atraso" }, { condition: { ruleFired: "r-plano" }, description: "plano completo ao final" }] },
    { id: "t-alternativa", kind: "alternative", description: "Nifedipino em vez de metildopa, retorno programado na UBS", commands: [ask(10, "h-gestacao-anterior"), ask(20, "h-medicacoes"), act(50, "medir_pa"), rx(400, "nifedipino", "cp10", 10, "mg", "VO"), rx(420, "aas", "cp100", 100, "mg", "VO"), act(500, "orientacoes_alta"), dest(600, "retorno_programado")], runUntilSeconds: 2400, expect: [{ condition: { ruleFired: "r-plano" }, description: "plano completo" }] }
  ]
};
