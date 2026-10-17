import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, hi, obs, outcome, staff, test, trend } from "./helpers";

const FOTO = { actionCompleted: "fototerapia" };
const ALTA = { any: [{ path: "disposition", op: "eq", value: "alta_orientada" }, { path: "disposition", op: "eq", value: "alta_com_seguimento_ubs" }, { path: "disposition", op: "eq", value: "retorno_programado" }] };

export const C088: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C088",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Recém-nascido de 3 dias 'amarelinho' e sonolento, mamando pouco",
  teachingTitle: "Hiperbilirrubinemia neonatal — dosar bilirrubina, interpretar por horas de vida e IG, investigar hemólise, fototerapia e apoio ao aleitamento",
  group: "Pediatria",
  specialties: ["Pediatria", "Neonatologia"],
  environment: "pediatria",
  resourceProfile: "hospital-regional",
  difficulty: 2,
  level: "internato",
  objectives: [
    "Dosar bilirrubina sérica (não confiar na estimativa visual) e interpretar pela idade em horas e pela idade gestacional",
    "Pesquisar fatores de risco de neurotoxicidade: hemólise isoimune (tipagem, Coombs), G6PD, sepse, instabilidade, albumina baixa",
    "Indicar fototerapia intensiva e reavaliar a bilirrubina",
    "Avaliar e apoiar a amamentação diante da perda de peso",
    "Não dar alta com bilirrubina acima do limiar de tratamento; conhecer o escalonamento"
  ],
  keywords: ["recém-nascido", "amarelo", "sonolento", "mamando pouco", "pele amarela"],
  patient: {
    name: "RN de Larissa Monteiro",
    ageYears: 0,
    ageMonths: 0,
    sex: "feminino",
    weightKg: 2.85,
    heightCm: 48,
    visual: { ageGroup: "lactente", sex: "feminino", skinTone: 3, hairStyle: "curto", hairColor: "preto", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro pediátrico de hospital regional. Recém-nascida com 72 horas de vida, trazida pela mãe porque está 'cada vez mais amarela' e dorme muito. Recebeu alta da maternidade com 48 horas.",
  communication: "incapaz",
  informants: [{ id: "mae", name: "Larissa (mãe)", role: "Mãe" }],
  history: [
    hi("h-inicio", "inicio", "Quando começou o amarelo? Está piorando?", [{ source: "mae", text: "Começou no rosto no segundo dia. Hoje está na barriga e nas pernas." }], ["começou", "amarelo", "quando", "piorando"]),
    hi("h-mamada", "alimentacao_eliminacoes", "Como está mamando? Fraldas e cocô?", [{ source: "mae", text: "Ela pega mal o peito, dorme mamando. Só no peito. Três fraldas molhadas hoje, cocô ainda escuro." }], ["mama", "peito", "fraldas", "cocô", "xixi"]),
    hi("h-gestacao", "gestacao", "Como foram a gestação e o parto? Qual o tipo de sangue da mãe?", [{ source: "mae", text: "Parto normal com 37 semanas, nasceu com 3,2 kg. Meu sangue é O positivo. Fiz o pré-natal todo." }], ["parto", "gestação", "semanas", "sangue", "tipo"]),
    hi("h-alarme", "sinais_alarme", "Teve febre, choro diferente, ficou mole ou dura, vomitou?", [{ source: "mae", text: "Sem febre. Não vomitou. Só está mais sonolenta." }], ["febre", "choro", "mole", "dura", "vômito"]),
    hi("h-familia", "familia", "Algum irmão precisou de 'luz' ou transfusão? Alguém na família com anemia hereditária?", [{ source: "mae", text: "É minha primeira filha. Não sei de ninguém." }], ["irmão", "família", "luz", "anemia"]),
    hi("h-fezes", "alimentacao_eliminacoes", "As fezes são claras ou a urina escura?", [{ source: "mae", text: "O cocô está ficando amarelado; o xixi é clarinho." }], ["fezes claras", "urina escura", "acolia"])
  ],
  initial: {
    vars: { hr: 152, sbp: 68, dbp: 40, rr: 46, spo2: 98, temp: 37.1, gcs: 15, pain: 1, glucose: 62, perfusion: 0.85, effort: 0.1, bili: 20.4, hb: 16.2, ht: 49, wbc: 11200, plt: 245000 },
    flags: { rhythm: "sinusal", posture: "supino", painVisual: "nenhuma", speech: "nenhuma", consciousness: "alerta", jaundice: true },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-pele", "pele", "inspecao", "Icterícia em face, tronco e membros até abaixo dos joelhos; palmas e plantas poupadas. Sem petéquias.", { label: "Icterícia (progressão craniocaudal)", better: [{ when: { ruleFired: "r-foto-efeito" }, text: "Icterícia ainda presente, menos intensa em tronco (avaliação visual não substitui a dosagem durante a fototerapia)." }] }),
    ex("e-neuro", "neurologico", "inspecao", "Sonolenta, mas desperta ao estímulo; sucção presente porém fraca; tônus normal; choro normal; sem hiperextensão.", { label: "Neurológico (sinais de encefalopatia)", better: [{ when: { ruleFired: "r-escalonamento" }, text: "Mais letárgica, hipotonia leve e sucção débil — sinais iniciais de encefalopatia bilirrubínica aguda." }] }),
    ex("e-geral", "geral", "inspecao", "Peso 2.850 g (perda de 11% em relação ao nascimento); mucosas pouco úmidas; fontanela normotensa; enchimento capilar 2 s.", { label: "Peso e hidratação" }),
    ex("e-abdome", "abdome_qsd", "palpacao", "Fígado a 1,5 cm do rebordo; baço não palpável; coto umbilical limpo.", { label: "Abdome" }),
    ex("e-cabeca", "cabeca", "inspecao", "Sem céfalo-hematoma; sem bossa.", { label: "Crânio" })
  ],
  testResults: [
    { testId: "bilirrubinas", variants: [{ text: "Bilirrubina direta 0,6 mg/dL (indireta predominante). Comparar BT com a curva de fototerapia para 37 semanas e a idade em horas: acima do limiar de fototerapia e abaixo da zona de escalonamento (laudo educativo)." }] },
    { testId: "tipagem_coombs_rn", variants: [{ text: "Mãe O Rh+; RN O Rh+. Coombs direto negativo." }] },
    { testId: "hemograma", variants: [{ text: "Hb 16,2 g/dL, Ht 49%, leucócitos 11.200 sem desvio, plaquetas 245.000. Sem sinais de hemólise." }] }
  ],
  highlightedActions: ["fototerapia", "apoio_amamentacao"],
  rules: [
    { id: "r-curso", description: "Bilirrubina em ascensão sem tratamento", priority: 10, when: { always: true }, repeat: "once", effects: [trend("bili", 22.5, 7200, "bili", 10)] },
    { id: "r-foto-efeito", description: "Fototerapia intensiva reduz a bilirrubina", priority: 30, when: FOTO, repeat: "once", effects: [trend("bili", 15.5, 14400, "bili", 30), staff("enfermagem", "Fototerapia LED ligada, olhos protegidos, controle de temperatura de 3/3 h."), outcome("melhora")] },
    { id: "r-amamentacao", description: "Apoio ao aleitamento", priority: 20, when: { actionCompleted: "apoio_amamentacao" }, repeat: "once", effects: [staff("acompanhante", "Agora ela pegou melhor! Vou oferecer o peito com mais frequência, mesmo na luz."), trend("perfusion", 0.9, 1800, "hid", 20)] },
    { id: "r-escalonamento", description: "Sem fototerapia: bilirrubina chega à zona de escalonamento", priority: 40, when: { all: [{ time: "gte", seconds: 5400 }, { not: FOTO }] }, repeat: "once", effects: [staff("supervisor", "A bilirrubina continua subindo e ela está mais molinha. Isso é escalonamento: fototerapia intensiva já, exames urgentes, hidratação e contato com a UTI neonatal."), flag("consciousness", "voz"), outcome("piora")] },
    { id: "r-alta", description: "Alta com bilirrubina acima do limiar", priority: 45, when: ALTA, repeat: "once", effects: [obs("Bilirrubina acima do limiar de fototerapia para a idade em horas não permite alta: risco de encefalopatia bilirrubínica."), outcome("complicacao")] }
  ],
  diagnosis: { primary: "ictericia_neonatal", accepted: ["ictericia_neonatal"], differentials: ["sepse_neonatal", "desidratacao_algum_grau"] },
  acceptedDestinations: ["internacao_enfermaria"],
  outcomeNotes: "RN de 37 semanas com 72 h, aleitamento exclusivo com pega inadequada e perda de peso de 11%, BT acima do limiar de fototerapia sem fatores de neurotoxicidade (Coombs negativo, sem sepse, hemograma normal). Fototerapia intensiva, apoio ao aleitamento (e complementação se necessário), reavaliar BT e internar; escalonar se se aproximar do limiar de exsanguineotransfusão.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Início/progressão, mamadas, IG e tipo sanguíneo materno", evidence: { kind: "historyAsked", items: ["h-inicio", "h-mamada", "h-gestacao"], minCount: 3 }, points: 10, severity: "critica", rationale: "Idade em horas, IG e risco de hemólise definem o limiar." },
    { id: "s-alarme", domain: "historia", description: "Sinais de alarme/encefalopatia e colestase", evidence: { kind: "historyAsked", items: ["h-alarme", "h-fezes"], minCount: 1 }, points: 5, severity: "importante", rationale: "Encefalopatia aguda e colestase mudam a conduta." },
    { id: "s-exame", domain: "historia", description: "Pele, neurológico e peso/hidratação", evidence: { kind: "examDone", regions: ["pele", "neurologico", "geral"], minCount: 3 }, points: 8, severity: "importante", rationale: "Sinais neurológicos e perda de peso." },
    { id: "s-bili", domain: "exames", description: "Bilirrubina sérica total e frações", evidence: { kind: "testOrdered", anyOf: ["bilirrubinas"], withinSeconds: 900 }, points: 16, severity: "critica", rationale: "Base de toda decisão.", sourceIds: ["INT-AAP-HIPERBILI-2022"] },
    { id: "s-hemolise", domain: "exames", description: "Tipagem ABO/Rh e Coombs direto", evidence: { kind: "testOrdered", anyOf: ["tipagem_coombs_rn"], withinSeconds: 1800 }, points: 8, severity: "importante", rationale: "Hemólise isoimune é fator de risco de neurotoxicidade.", sourceIds: ["INT-AAP-HIPERBILI-2022"] },
    { id: "s-foto", domain: "tratamento", description: "Fototerapia intensiva", evidence: { kind: "actionDone", anyOf: ["fototerapia"], withinSeconds: 3600 }, points: 22, severity: "critica", rationale: "Tratamento de primeira linha.", sourceIds: ["BR-SBP-HIPERBILI-2021"] },
    { id: "s-amamenta", domain: "tratamento", description: "Apoio à amamentação", evidence: { kind: "actionDone", anyOf: ["apoio_amamentacao"] }, points: 8, severity: "importante", rationale: "Baixa ingesta agrava a icterícia." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou bilirrubina/neurológico após fototerapia", evidence: { kind: "reassessAfter", after: ["fototerapia"], reassess: ["bilirrubinas", "neurologico", "pele"], withinSeconds: 7200 }, points: 6, severity: "importante", rationale: "Confirmar queda e ausência de escalonamento." },
    { id: "s-alta", domain: "destino", description: "Falha: alta com BT acima do limiar", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-alta" } }, points: 15, penalty: true, severity: "critica", rationale: "Risco de kernicterus." },
    { id: "s-escal", domain: "priorizacao", description: "Falha: chegou à zona de escalonamento sem fototerapia", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-escalonamento" } }, points: 8, penalty: true, severity: "importante", rationale: "Atraso evitável." },
    { id: "s-dx", domain: "destino", description: "Hiperbilirrubinemia neonatal", evidence: { kind: "diagnosis", accepted: ["ictericia_neonatal"] }, points: 7, severity: "importante", rationale: "Indireta, sem hemólise." },
    { id: "s-destino", domain: "destino", description: "Internação para fototerapia", evidence: { kind: "disposition", accepted: ["internacao_enfermaria"] }, points: 10, severity: "importante", rationale: "Tratamento e reavaliação seriada." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Quantas horas de vida ela tem e com quantas semanas nasceu?" },
      { level: 2, text: "O olho engana: qual exame quantifica?" },
      { level: 3, text: "Há hemólise? Tipagem, Coombs e hemograma." },
      { level: 4, text: "Sugestão explícita: bilirrubinas, tipagem/Coombs, hemograma, fototerapia intensiva, apoio ao aleitamento, reavaliar e internar." }
    ],
    summary: "Icterícia do aleitamento (baixa ingesta) em RN de 37 semanas, sem hemólise, com BT acima do limiar de fototerapia.",
    pathophysiology: "Produção aumentada de bilirrubina (massa eritrocitária e vida média curta das hemácias fetais), conjugação hepática imatura e circulação êntero-hepática aumentada pela baixa ingesta. A bilirrubina indireta livre atravessa a barreira hematoencefálica e lesa núcleos da base (encefalopatia aguda e kernicterus), com risco maior se houver hemólise, sepse, acidose ou albumina baixa.",
    keyPoints: [
      "Interpretar a BT pela idade em horas e IG, em curvas com e sem fatores de risco de neurotoxicidade.",
      "Fatores de neurotoxicidade: hemólise isoimune (Coombs+), G6PD, sepse, instabilidade, albumina < 3 g/dL.",
      "Fototerapia intensiva é a primeira linha; manter o aleitamento.",
      "A 2 mg/dL do limiar de exsanguineotransfusão: escalonamento (exames urgentes, hidratação IV, IgIV se isoimune, UTI neonatal).",
      "Bilirrubina direta elevada ou fezes claras sugerem colestase — outra investigação."
    ],
    alternatives: ["Fototerapia domiciliar em lactentes de baixo risco selecionados (onde disponível).", "Complementação com leite materno ordenhado ou fórmula se ingesta insuficiente."],
    oralRubric: [
      { id: "o1", concept: "Idade em horas e IG", synonyms: ["horas de vida", "idade gestacional", "curva", "nomograma"], weight: 2 },
      { id: "o2", concept: "Bilirrubina sérica", synonyms: ["bilirrubina", "dosar", "bt"], weight: 2 },
      { id: "o3", concept: "Hemólise", synonyms: ["coombs", "tipagem", "g6pd", "hemólise"], weight: 2 },
      { id: "o4", concept: "Fototerapia", synonyms: ["fototerapia", "luz"], weight: 3 },
      { id: "o5", concept: "Aleitamento", synonyms: ["amamentação", "aleitamento", "mamada", "peito"], weight: 1 }
    ],
    simplifications: ["Os valores numéricos das curvas não são exibidos: o laudo informa a posição da BT em relação aos limiares.", "Velocidade de subida e queda da bilirrubina comprimida no tempo do caso.", "Teste de G6PD e albumina não estão no catálogo."]
  },
  references: ["INT-AAP-HIPERBILI-2022", "BR-SBP-HIPERBILI-2021", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 0, allowSexSwap: true, allowWeightPercent: 5, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "História, exame, bilirrubinas, tipagem/Coombs, hemograma, fototerapia, amamentação, reavaliação, internação", commands: [ask(10, "h-inicio"), ask(20, "h-mamada"), ask(30, "h-gestacao"), ask(40, "h-alarme"), { atSeconds: 50, type: "examine", payload: { region: "pele", maneuver: "inspecao" } }, { atSeconds: 60, type: "examine", payload: { region: "neurologico", maneuver: "inspecao" } }, { atSeconds: 70, type: "examine", payload: { region: "geral", maneuver: "inspecao" } }, test(90, "bilirrubinas"), test(100, "tipagem_coombs_rn"), test(110, "hemograma"), act(1950, "fototerapia"), act(2300, "apoio_amamentacao"), { atSeconds: 4000, type: "examine", payload: { region: "neurologico", maneuver: "inspecao" } }, test(5000, "bilirrubinas"), dx(5100, "ictericia_neonatal"), dest(7000, "internacao_enfermaria")], runUntilSeconds: 7200, expect: [{ condition: { ruleFired: "r-foto-efeito" }, description: "fototerapia" }, { condition: { not: { ruleFired: "r-escalonamento" } }, description: "sem escalonamento" }, { condition: { path: "vars.bili", op: "lt", value: 20 }, description: "BT em queda" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 7200, expect: [{ condition: { ruleFired: "r-escalonamento" }, description: "escalonamento" }, { condition: { path: "vars.bili", op: "gt", value: 21 }, description: "BT subindo" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Icterícia 'fisiológica': banho de sol e alta", commands: [ask(10, "h-inicio"), dest(600, "alta_orientada")], runUntilSeconds: 7200, expect: [{ condition: { ruleFired: "r-alta" }, description: "alta indevida" }] },
    { id: "t-atraso", kind: "delay", description: "Fototerapia só após escalonamento", commands: [test(300, "bilirrubinas"), act(6000, "fototerapia"), dest(7800, "internacao_enfermaria")], runUntilSeconds: 9000, expect: [{ condition: { ruleFired: "r-escalonamento" }, description: "escalonamento" }, { condition: { ruleFired: "r-foto-efeito" }, description: "fototerapia tardia" }] },
    { id: "t-alternativa", kind: "alternative", description: "Fototerapia logo após a dosagem, apoio ao aleitamento primeiro", commands: [act(30, "apoio_amamentacao"), test(700, "bilirrubinas"), act(2600, "fototerapia"), test(2700, "hemograma"), test(2710, "tipagem_coombs_rn"), dest(6000, "internacao_enfermaria")], runUntilSeconds: 7200, expect: [{ condition: { ruleFired: "r-amamentacao" }, description: "aleitamento" }, { condition: { not: { ruleFired: "r-escalonamento" } }, description: "sem escalonamento" }] }
  ]
};
