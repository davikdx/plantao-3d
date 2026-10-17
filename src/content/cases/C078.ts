import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, h, obs, outcome, rx, test } from "./helpers";

const CEFTRI_IM = { drugGiven: "ceftriaxona", route: "IM" as const };
const DOXI = { drugGiven: "doxiciclina" };
const METRO = { drugGiven: "metronidazol" };
const BETA_HCG = { any: [{ testCollected: "teste_gravidez_urina" }, { testCollected: "bhcg" }] };
const ORIENTA = { actionCompleted: "orientacoes_alta" };

export const C078: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C078",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Jovem com dor no pé da barriga, febre e corrimento",
  teachingTitle: "Doença inflamatória pélvica — critérios clínicos, excluir gravidez e abdome cirúrgico, tratamento ambulatorial do PCDT, parceria e retorno em 72 h",
  group: "Obstetrícia e Ginecologia",
  specialties: ["Ginecologia", "Medicina de família e comunidade", "Infectologia"],
  environment: "ubs",
  resourceProfile: "ubs-urbana",
  difficulty: 2,
  level: "internato",
  objectives: [
    "Reconhecer DIP pelos critérios clínicos (dor anexial, dor à mobilização do colo, febre) e não atrasar o tratamento",
    "Excluir gravidez (ectópica) e diferenciais cirúrgicos",
    "Definir tratamento ambulatorial × internação pelos critérios do PCDT",
    "Prescrever ceftriaxona IM + doxiciclina + metronidazol, tratar parcerias e oferecer testagem",
    "Reavaliar em 72 h"
  ],
  keywords: ["dor pélvica", "febre", "corrimento", "relação sexual", "barriga", "jovem"],
  patient: {
    name: "Bianca Mendes",
    ageYears: 24,
    sex: "feminino",
    weightKg: 60,
    heightCm: 165,
    visual: { ageGroup: "adulto", sex: "feminino", skinTone: 3, hairStyle: "cacheado", hairColor: "castanho", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "UBS urbana, demanda espontânea. Mulher de 24 anos com dor no baixo ventre há 5 dias, febre baixa, corrimento amarelado e dor na relação sexual.",
  communication: "normal",
  informants: [],
  history: [
    h("h-dor", "localizacao", "Onde dói? Começou como?", "Embaixo do umbigo, dos dois lados, começou devagar depois da menstruação.", { keywords: ["dói", "dor", "começou"] }),
    h("h-corrimento", "fatores_associados", "Como é o corrimento? Sangramento fora da menstruação? Dor na relação?", "Amarelado, com cheiro. Teve um sangramento pequeno depois da relação. Dói na relação, sim.", { keywords: ["corrimento", "sangramento", "relação"] }),
    h("h-sexual", "ginecologico", "Tem parceria fixa? Usa preservativo? Método contraceptivo?", "Tenho um parceiro novo há 2 meses, não usamos camisinha. Tomo anticoncepcional, às vezes esqueço.", { keywords: ["parceiro", "camisinha", "anticoncepcional", "preservativo"] }),
    h("h-dum", "ginecologico", "Quando foi a última menstruação? Pode estar grávida?", "Há 12 dias. Acho que não, mas esqueci umas pílulas.", { keywords: ["menstruação", "grávida", "dum"] }),
    h("h-alarme", "sinais_alarme", "Tem vômitos, dor muito forte, desmaio, dificuldade para tomar remédio?", "Não, consigo comer e tomar remédio. Dor média.", { keywords: ["vômito", "desmaio", "forte"] }),
    h("h-urina", "fatores_associados", "Ardência ao urinar? Dor do lado direito mais forte?", "Ardência leve. A dor é dos dois lados igual.", { keywords: ["urinar", "ardência", "direito"] })
  ],
  initial: {
    vars: { hr: 94, sbp: 118, dbp: 74, rr: 16, spo2: 99, temp: 38.0, gcs: 15, pain: 5, glucose: 92, perfusion: 0.95, effort: 0.1 },
    flags: { rhythm: "sinusal", posture: "sentado", painVisual: "moderada", speech: "frases", consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-abdome", "abdome_qid", "palpacao", "Dor em hipogástrio e fossas ilíacas bilateralmente, sem defesa nem descompressão dolorosa; Blumberg negativo.", { label: "Abdome" }),
    ex("e-especular", "pelve", "inspecao", "Exame especular: secreção mucopurulenta saindo pelo orifício do colo; colo friável.", { label: "Exame especular" }),
    ex("e-toque", "pelve", "palpacao", "Toque bimanual: dor à mobilização do colo e dor anexial bilateral; sem massas palpáveis.", { label: "Toque bimanual" }),
    ex("e-geral", "geral", "inspecao", "Bom estado geral, hidratada.", {})
  ],
  testResults: [
    { testId: "teste_gravidez_urina", variants: [{ text: "Negativo." }] },
    { testId: "bhcg", variants: [{ text: "Beta-hCG negativo." }] },
    { testId: "teste_rapido_hiv", variants: [{ text: "Não reagente (oferecer repetição conforme janela)." }] },
    { testId: "urina_tipo1", variants: [{ text: "Leucócitos discretamente aumentados; nitrito negativo." }] }
  ],
  highlightedActions: ["medir_pa", "medir_temperatura", "orientacoes_alta", "notificacao"],
  rules: [
    { id: "r-gravidez", description: "Teste de gravidez", priority: 10, when: BETA_HCG, repeat: "once", effects: [obs("Teste de gravidez negativo: afasta ectópica e libera doxiciclina.")] },
    { id: "r-doxi-sem-hcg", description: "Doxiciclina sem excluir gravidez", priority: 20, when: { all: [DOXI, { not: BETA_HCG }] }, repeat: "once", effects: [obs("Doxiciclina é contraindicada na gestação, e DIP na gestante exige internação: teste de gravidez antes.")] },
    { id: "r-tratamento", description: "Esquema completo do PCDT", priority: 40, when: { all: [CEFTRI_IM, DOXI, METRO] }, repeat: "once", effects: [obs("Esquema ambulatorial completo: ceftriaxona 500 mg IM dose única, doxiciclina 100 mg 12/12 h e metronidazol 500 mg 12/12 h por 14 dias.")] },
    { id: "r-plano", description: "Tratamento + orientação/parceria: plano seguro", priority: 50, when: { all: [CEFTRI_IM, DOXI, ORIENTA, BETA_HCG] }, repeat: "once", effects: [obs("Plano: retorno em 72 h, tratar parceria (ceftriaxona 500 mg IM + azitromicina 1 g), preservativo, testagem de HIV/sífilis/hepatites, sinais de alarme."), outcome("melhora")] },
    { id: "r-incompleto", description: "Esquema incompleto (só azitromicina ou só ceftriaxona)", priority: 15, when: { all: [{ time: "gte", seconds: 1500 }, { any: [{ drugGiven: "azitromicina" }, CEFTRI_IM] }, { not: DOXI }] }, repeat: "once", effects: [obs("Dose única não trata DIP: é infecção polimicrobiana do trato genital superior e exige 14 dias de cobertura para clamídia e anaeróbios."), outcome("complicacao")] },
    { id: "r-sem-tratamento", description: "Sem antibiótico ao fim da consulta", priority: 10, when: { all: [{ time: "gte", seconds: 1800 }, { not: CEFTRI_IM }, { not: DOXI }] }, repeat: "once", effects: [obs("DIP não tratada evolui para abscesso tubo-ovariano, infertilidade, dor pélvica crônica e gestação ectópica futura.")] },
    { id: "r-internacao", description: "Encaminhamento para internação sem critério", priority: 20, when: { path: "disposition", op: "eq", value: "transferencia_regulada" }, repeat: "once", effects: [obs("Sem critérios de internação (sem abscesso, gestação, intolerância oral ou gravidade): tratamento ambulatorial com retorno em 72 h.")] }
  ],
  diagnosis: { primary: "dip", accepted: ["dip"], differentials: ["gestacao_ectopica_rota", "apendicite", "torcao_anexial", "cistite", "pielonefrite"] },
  acceptedDestinations: ["retorno_programado", "alta_com_seguimento_ubs"],
  outcomeNotes: "Doença inflamatória pélvica leve a moderada (dor anexial, dor à mobilização do colo, febre, secreção mucopurulenta) em jovem com parceria nova sem preservativo, sem critérios de internação. Teste de gravidez, ceftriaxona 500 mg IM + doxiciclina 100 mg 12/12 h + metronidazol 500 mg 12/12 h por 14 dias, tratamento da parceria, testagem de HIV/sífilis/hepatites, preservativo e retorno em 72 h.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Dor, corrimento e história sexual", evidence: { kind: "historyAsked", items: ["h-dor", "h-corrimento", "h-sexual"], minCount: 3 }, points: 8, severity: "importante", rationale: "Fatores de risco e quadro clínico." },
    { id: "s-dum", domain: "historia", description: "Última menstruação e possibilidade de gravidez", evidence: { kind: "historyAsked", items: ["h-dum"], minCount: 1 }, points: 5, severity: "importante", rationale: "Ectópica é diferencial que mata." },
    { id: "s-alarme", domain: "historia", description: "Critérios de gravidade/tolerância oral", evidence: { kind: "historyAsked", items: ["h-alarme", "h-urina"], minCount: 1 }, points: 5, severity: "importante", rationale: "Definem ambulatorial × internação.", sourceIds: ["BR-PCDT-IST-DIP-2021"] },
    { id: "s-exame", domain: "historia", description: "Abdome, especular e toque bimanual", evidence: { kind: "examDone", regions: ["abdome_qid", "pelve"], minCount: 2 }, points: 10, severity: "critica", rationale: "Critérios maiores.", sourceIds: ["BR-PCDT-IST-DIP-2021"] },
    { id: "s-hcg", domain: "exames", description: "Teste de gravidez", evidence: { kind: "testOrdered", anyOf: ["teste_gravidez_urina", "bhcg"], withinSeconds: 1200 }, points: 10, severity: "critica", rationale: "Excluir ectópica; doxiciclina contraindicada na gestação.", sourceIds: ["BR-PCDT-IST-DIP-2021"] },
    { id: "s-testagem", domain: "exames", description: "Testagem para HIV (e outras IST)", evidence: { kind: "testOrdered", anyOf: ["teste_rapido_hiv"] }, points: 5, severity: "importante", rationale: "Oferecer HIV, sífilis, hepatites.", sourceIds: ["BR-PCDT-IST-DIP-2021"] },
    { id: "s-ceftri", domain: "tratamento", description: "Ceftriaxona 500 mg IM", evidence: { kind: "drugGiven", anyOf: ["ceftriaxona"], routes: ["IM"] }, points: 12, severity: "critica", rationale: "Cobertura de gonococo.", sourceIds: ["BR-PCDT-IST-DIP-2021"] },
    { id: "s-doxi", domain: "tratamento", description: "Doxiciclina 14 dias", evidence: { kind: "drugGiven", anyOf: ["doxiciclina"] }, points: 12, severity: "critica", rationale: "Cobertura de clamídia.", sourceIds: ["BR-PCDT-IST-DIP-2021"] },
    { id: "s-metro", domain: "tratamento", description: "Metronidazol 14 dias", evidence: { kind: "drugGiven", anyOf: ["metronidazol"] }, points: 5, severity: "importante", rationale: "Anaeróbios (pode ser omitido em casos leves a critério).", sourceIds: ["BR-PCDT-IST-DIP-2021"] },
    { id: "s-orient", domain: "tratamento", description: "Orientação, parceria, preservativo e retorno", evidence: { kind: "actionDone", anyOf: ["orientacoes_alta"] }, points: 8, severity: "importante", rationale: "Tratar parceria dos últimos 2 meses; retorno em 72 h.", sourceIds: ["BR-PCDT-IST-DIP-2021"] },
    { id: "s-incompleto", domain: "tratamento", description: "Falha: esquema de dose única", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-incompleto" } }, points: 8, penalty: true, severity: "importante", rationale: "DIP exige 14 dias." },
    { id: "s-reav", domain: "reavaliacao", description: "Planejou reavaliação em 72 h", evidence: { kind: "reassessAfter", after: ["ceftriaxona", "doxiciclina"], reassess: ["orientacoes_alta", "medir_temperatura"], withinSeconds: 1800 }, points: 5, severity: "importante", rationale: "Melhora esperada em 3 dias." },
    { id: "s-dx", domain: "destino", description: "Doença inflamatória pélvica", evidence: { kind: "diagnosis", accepted: ["dip"] }, points: 5, severity: "importante", rationale: "Critérios clínicos." },
    { id: "s-destino", domain: "destino", description: "Tratamento ambulatorial com retorno", evidence: { kind: "disposition", accepted: ["retorno_programado", "alta_com_seguimento_ubs"] }, points: 5, severity: "importante", rationale: "Sem critério de internação." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Dor pélvica bilateral, febre e corrimento após parceria nova sem preservativo." },
      { level: 2, text: "Que exame de urina/sangue vem antes de qualquer antibiótico nessa idade?" },
      { level: 3, text: "Ela precisa de internação pelos critérios do PCDT?" },
      { level: 4, text: "Sugestão explícita: especular e toque, teste de gravidez, teste de HIV, ceftriaxona 500 mg IM + doxiciclina + metronidazol, orientar parceria e preservativo, retorno em 72 h." }
    ],
    summary: "Mulher de 24 anos com DIP leve a moderada, sem critérios de internação, com parceria nova sem uso de preservativo.",
    pathophysiology: "Ascensão de microrganismos da cérvice (gonococo, clamídia e flora vaginal/anaeróbios) para endométrio, trompas e peritônio pélvico. A inflamação tubária pode deixar sequelas (infertilidade, ectópica, dor crônica) — por isso o limiar para tratar é baixo.",
    keyPoints: [
      "Diagnóstico clínico: dor anexial, dor à mobilização do colo e febre (+ critério menor/elaborado); não atrasar o tratamento.",
      "Sempre teste de gravidez.",
      "Internar: abscesso, gestação, falha em 72 h, intolerância oral, estado grave, dúvida cirúrgica.",
      "Ambulatorial: ceftriaxona 500 mg IM + doxiciclina 100 mg 12/12 h + metronidazol 500 mg 12/12 h por 14 dias.",
      "Parceria: ceftriaxona 500 mg IM + azitromicina 1 g; testagem para HIV, sífilis e hepatites; retorno em 72 h."
    ],
    alternatives: ["Cefotaxima 500 mg IM como alternativa à ceftriaxona.", "USG transvaginal se dúvida de abscesso."],
    oralRubric: [
      { id: "o1", concept: "Critérios diagnósticos", synonyms: ["mobilização do colo", "anexial", "critérios"], weight: 2 },
      { id: "o2", concept: "Excluir gravidez", synonyms: ["gravidez", "beta", "ectópica"], weight: 2 },
      { id: "o3", concept: "Esquema do PCDT", synonyms: ["ceftriaxona", "doxiciclina", "metronidazol"], weight: 3 },
      { id: "o4", concept: "Parceria e retorno", synonyms: ["parceiro", "parceria", "72 h", "retorno"], weight: 2 }
    ],
    simplifications: ["Bacterioscopia e testes moleculares para gonococo/clamídia não estão no catálogo da UBS.", "A duração de 14 dias é orientação, não simulada."]
  },
  references: ["BR-PCDT-IST-DIP-2021", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: false, allowWeightPercent: 15, allowVisualVariation: true, forbidden: ["sexo masculino"] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "História, exame, teste de gravidez e HIV, esquema do PCDT, orientação, retorno", commands: [ask(10, "h-dor"), ask(20, "h-corrimento"), ask(30, "h-sexual"), ask(40, "h-dum"), ask(50, "h-alarme"), act(60, "medir_temperatura"), { atSeconds: 70, type: "examine", payload: { region: "abdome_qid", maneuver: "palpacao" } }, { atSeconds: 80, type: "examine", payload: { region: "pelve", maneuver: "inspecao" } }, { atSeconds: 90, type: "examine", payload: { region: "pelve", maneuver: "palpacao" } }, test(100, "teste_gravidez_urina"), test(110, "teste_rapido_hiv"), rx(500, "ceftriaxona", "fa1g", 500, "mg", "IM"), rx(520, "doxiciclina", "cp100", 100, "mg", "VO"), rx(540, "metronidazol", "cp250", 500, "mg", "VO"), act(600, "orientacoes_alta"), dx(800, "dip"), dest(820, "retorno_programado")], runUntilSeconds: 2000, expect: [{ condition: { ruleFired: "r-plano" }, description: "plano seguro" }, { condition: { ruleFired: "r-tratamento" }, description: "esquema completo" }, { condition: { not: { ruleFired: "r-doxi-sem-hcg" } }, description: "gravidez excluída antes" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 2000, expect: [{ condition: { ruleFired: "r-sem-tratamento" }, description: "sem tratamento" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Azitromicina dose única sem teste de gravidez, encaminha para hospital", commands: [rx(200, "azitromicina", "cp500", 1000, "mg", "VO"), dest(300, "transferencia_regulada")], runUntilSeconds: 2000, expect: [{ condition: { ruleFired: "r-incompleto" }, description: "dose única" }, { condition: { ruleFired: "r-internacao" }, description: "internação sem critério" }] },
    { id: "t-atraso", kind: "delay", description: "Doxiciclina antes do teste; restante depois", commands: [ask(20, "h-dor"), rx(300, "doxiciclina", "cp100", 100, "mg", "VO"), test(700, "teste_gravidez_urina"), rx(1000, "ceftriaxona", "fa1g", 500, "mg", "IM"), act(1100, "orientacoes_alta"), dest(1200, "retorno_programado")], runUntilSeconds: 2000, expect: [{ condition: { ruleFired: "r-doxi-sem-hcg" }, description: "doxiciclina antes do teste" }, { condition: { ruleFired: "r-plano" }, description: "plano completo ao final" }] },
    { id: "t-alternativa", kind: "alternative", description: "Beta-hCG sérico, sem metronidazol (caso leve, a critério), seguimento na UBS", commands: [ask(20, "h-dum"), test(60, "bhcg"), rx(500, "ceftriaxona", "fa1g", 500, "mg", "IM"), rx(520, "doxiciclina", "cp100", 100, "mg", "VO"), act(600, "orientacoes_alta"), dest(700, "alta_com_seguimento_ubs")], runUntilSeconds: 2000, expect: [{ condition: { ruleFired: "r-plano" }, description: "plano seguro" }] }
  ]
};
