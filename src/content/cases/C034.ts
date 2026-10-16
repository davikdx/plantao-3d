import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, obs, outcome, rx, staff, test, trend } from "./helpers";

const VOL_INICIO = { any: [{ drugGiven: "sf09" }, { drugGiven: "ringer_lactato" }] };
const VOL = (ml: number) => ({ any: [{ drugGiven: "sf09", minTotal: { value: ml, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: ml, unit: "mL" as const } }] });

export const C034: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C034",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Febre que passou, mas a dor na barriga piorou",
  teachingTitle: "Dengue com sinais de alarme (Grupo C) na fase crítica",
  group: "Infectologia",
  specialties: ["Infectologia", "Emergência", "Saúde coletiva"],
  environment: "emergencia",
  resourceProfile: "upa-porte-ii",
  difficulty: 2,
  level: "internato",
  objectives: [
    "Reconhecer que a defervescência marca a fase crítica da dengue",
    "Identificar sinais de alarme (dor abdominal intensa, vômitos persistentes, hipotensão postural, hepatomegalia, hematócrito em elevação)",
    "Iniciar expansão volêmica imediata, sem aguardar exames",
    "Reavaliar clínica e hematócrito para decidir repetir a expansão",
    "Evitar AAS/anti-inflamatórios, notificar e internar"
  ],
  keywords: ["febre", "dor na barriga", "vômito", "tontura", "dengue", "mosquito"],
  patient: {
    name: "Tatiane Moreira",
    ageYears: 26,
    sex: "feminino",
    weightKg: 60,
    heightCm: 164,
    visual: { ageGroup: "adulto", sex: "feminino", skinTone: 3, hairStyle: "longo", hairColor: "castanho", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "UPA 24h em período epidêmico de dengue. Mulher de 26 anos no 5º dia de doença: a febre passou ontem, mas desde a madrugada tem dor abdominal forte, vômitos e tontura ao se levantar.",
  communication: "normal",
  history: [
    h("h-queixa", "queixa", "O que a senhora está sentindo?", "Uma dor forte na barriga, do lado direito em cima, e vomito tudo que tomo. Quando levanto fico tonta.", { keywords: ["sentindo"] }),
    h("h-inicio", "inicio", "Há quantos dias está doente?", "Cinco dias. Começou com febre alta, dor atrás dos olhos e no corpo. A febre parou ontem e achei que ia melhorar.", { keywords: ["dias", "começou"] }),
    h("h-vomitos", "fatores_associados", "Quantas vezes vomitou? Consegue beber líquido?", "Umas seis vezes desde a madrugada. Não para nada no estômago.", { keywords: ["vomitou", "vômito", "beber"] }),
    h("h-sangramento", "sinais_alarme", "Teve sangramento na gengiva, nariz, urina ou fezes escuras?", "Não vi sangramento. Só umas pintinhas vermelhas na perna.", { keywords: ["sangramento", "gengiva", "nariz", "fezes"] }),
    h("h-urina", "alimentacao_eliminacoes", "Está urinando normalmente?", "Urinei bem pouco hoje, e escuro.", { keywords: ["urina", "urinando", "xixi"] }),
    h("h-medicacoes", "medicacoes", "Tomou algum remédio para a febre ou dor?", "Dipirona. Minha vizinha me ofereceu AAS mas eu não tomei.", { keywords: ["remédio", "tomou", "aas", "ibuprofeno"] }),
    h("h-antecedentes", "antecedentes", "Tem alguma doença, pressão alta, diabetes, problema de coagulação?", "Não tenho nenhuma doença.", { keywords: ["doença"] }),
    h("h-gestacao", "gestacao", "Existe possibilidade de gravidez?", "Não, minha menstruação veio há duas semanas e uso anticoncepcional."),
    h("h-exposicao", "exposicao", "Tem casos de dengue perto de casa?", "Minha rua inteira está pegando. Meu irmão teve semana passada.", { keywords: ["casos", "vizinhança", "mosquito"] }),
    h("h-alergias", "alergias", "Tem alergia a algum remédio?", "Não.")
  ],
  initial: {
    vars: { hr: 112, sbp: 96, dbp: 72, rr: 20, spo2: 97, temp: 37.2, gcs: 15, pain: 7, glucose: 92, perfusion: 0.65, effort: 0.3, urine: 20, hb: 16.2, ht: 49, wbc: 2900, plt: 42000, ast: 210, alt: 160, creat: 0.9, urea: 34, na: 136, k: 3.6, lactate: 2.4, inr: 1.1 },
    flags: { rhythm: "taquicardia_sinusal", painVisual: "moderada", posture: "supino", rash: true, consciousness: "alerta" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Prostrada, mucosas secas, extremidades frias.", { better: [{ when: { ruleFired: "r-vol2" }, text: "Mais disposta, mucosas úmidas, extremidades aquecidas." }, { when: { ruleFired: "r-choque" }, text: "Sonolenta, pálida, sudoreica, extremidades frias e moteadas." }] }),
    ex("e-postural", "geral", "especial", "PA deitada 96/72 mmHg; sentada 78/64 mmHg com tontura: hipotensão postural.", { label: "PA postural", better: [{ when: { ruleFired: "r-vol2" }, text: "Sem queda postural significativa da PA." }] }),
    ex("e-figado", "abdome_qsd", "palpacao", "Fígado palpável a 3 cm do rebordo costal direito, doloroso.", { label: "Hipocôndrio direito" }),
    ex("e-abdome", "abdome_epigastrio", "palpacao", "Dor intensa à palpação do abdome superior, sem defesa ou descompressão dolorosa.", { better: [{ when: { ruleFired: "r-vol2" }, text: "Dor abdominal moderada, em melhora." }] }),
    ex("e-pele", "pele", "inspecao", "Petéquias esparsas em membros inferiores; exantema maculopapular em regressão.", { better: [{ when: { ruleFired: "r-aas" }, text: "Petéquias confluentes, equimoses nos locais de punção e gengivorragia." }] }),
    ex("e-perfusao", "membro_superior_d", "palpacao", "Pulso radial fino e rápido; tempo de enchimento capilar 3 s; pressão de pulso 24 mmHg.", { better: [{ when: { ruleFired: "r-vol2" }, text: "Pulso cheio; enchimento capilar 2 s." }, { when: { ruleFired: "r-choque" }, text: "Pulso filiforme; enchimento capilar 5 s; pressão de pulso convergente (≤ 20 mmHg)." }] }),
    ex("e-pulmao", "torax_posterior", "ausculta", "Murmúrio discretamente reduzido em base direita.", { sound: "murmurio_normal", better: [{ when: { ruleFired: "r-hiper" }, text: "Murmúrio abolido em ambas as bases, estertores; desconforto respiratório." }] })
  ],
  testResults: [
    { testId: "teste_rapido_dengue", variants: [{ text: "NS1 não reagente; IgM reagente (5º dia). Resultado não muda a conduta: o manejo é pela classificação clínica." }] },
    { testId: "usg_abdome", variants: [{ text: "Laudo educativo: pequena quantidade de líquido livre em pelve e espessamento da parede da vesícula biliar — sinais de extravasamento plasmático." }] },
    { testId: "rx_torax", variants: [{ text: "Laudo educativo: pequeno derrame pleural à direita." }] }
  ],
  highlightedActions: ["medir_pa", "acesso_venoso", "monitorizar", "diurese_horaria", "notificacao", "acionar_samu"],
  rules: [
    { id: "r-vol1", description: "Primeira expansão (~10 mL/kg): melhora parcial", priority: 30, when: VOL(500), repeat: "once", effects: [trend("hr", 104, 900, "vol1", 30), trend("sbp", 100, 900, "vol1", 30), trend("dbp", 70, 900, "vol1", 30), trend("ht", 46, 1800, "vol1", 30), trend("pain", 5, 900, "vol1", 30), trend("perfusion", 0.75, 900, "vol1", 30)] },
    { id: "r-vol2", description: "Segunda etapa de expansão: estabilização clínica e queda do hematócrito", priority: 35, when: VOL(1100), repeat: "once", effects: [trend("hr", 92, 1200, "vol2", 35), trend("sbp", 108, 1200, "vol2", 35), trend("dbp", 72, 1200, "vol2", 35), trend("ht", 42, 2400, "vol2", 35), trend("perfusion", 0.9, 1200, "vol2", 35), trend("urine", 50, 2400, "vol2", 35), trend("lactate", 1.4, 3600, "vol2", 35), flag("painVisual", "leve"), outcome("melhora")] },
    { id: "r-choque", description: "Sem hidratação venosa, extravasamento progride para choque (Grupo D)", priority: 20, when: { all: [{ time: "gte", seconds: 1800 }, { not: VOL_INICIO }] }, repeat: "once", effects: [trend("sbp", 84, 600, "choque", 20), trend("dbp", 70, 600, "choque", 20), trend("hr", 132, 600, "choque", 20), trend("ht", 54, 1200, "choque", 20), trend("perfusion", 0.3, 600, "choque", 20), trend("lactate", 4.5, 1200, "choque", 20), trend("urine", 5, 1200, "choque", 20), flag("consciousness", "voz"), flag("sweating", true), flag("pallor", true), staff("enfermagem", "A pressão está convergente e ela ficou sonolenta e gelada!"), outcome("piora")] },
    { id: "r-choque-tratado", description: "Expansão rápida no choque restaura parcialmente a perfusão", priority: 40, when: { all: [{ ruleFired: "r-choque" }, VOL(1100)] }, repeat: "once", effects: [trend("sbp", 100, 600, "choque-trat", 40), trend("dbp", 68, 600, "choque-trat", 40), trend("hr", 108, 900, "choque-trat", 40), trend("perfusion", 0.7, 900, "choque-trat", 40), trend("ht", 45, 1800, "choque-trat", 40), flag("consciousness", "alerta"), outcome("estabilizacao_parcial")] },
    { id: "r-pcr", description: "Choque não tratado por 2 horas: parada (desfecho definido pelo caso)", priority: 100, when: { all: [{ time: "gte", seconds: 7200 }, { not: VOL_INICIO }] }, repeat: "once", effects: [flag("pulse", false), flag("consciousness", "irresponsivo"), staff("enfermagem", "Ela não responde e não sinto pulso!"), outcome("parada", true)] },
    { id: "r-aas", description: "AAS na dengue: sangramento (antiagregação com plaquetopenia)", priority: 80, when: { drugGiven: "aas" }, repeat: "once", effects: [flag("bleedingVisible", true), trend("plt", 25000, 1800, "aas", 80), trend("hb", 13.8, 3600, "aas", 80), staff("enfermagem", "Ela está sangrando pela gengiva e o acesso não para de sangrar."), outcome("complicacao")] },
    { id: "r-hiper", description: "Hiper-hidratação (≥ 4 L) sem reavaliação: congestão e derrames", priority: 85, when: VOL(4000), repeat: "once", effects: [trend("spo2", 89, 900, "hiper", 85), trend("rr", 30, 900, "hiper", 85), trend("effort", 1.8, 900, "hiper", 85), staff("enfermagem", "Ela está ficando cansada para respirar."), outcome("complicacao")] },
    { id: "r-analgesia", description: "Dipirona/paracetamol aliviam a dor", when: { any: [{ drugGiven: "dipirona" }, { drugGiven: "paracetamol" }] }, repeat: "once", effects: [trend("pain", 4, 600, "analg", 25, 3600)] },
    { id: "r-antiemetico", description: "Antiemético controla vômitos", when: { drugGiven: "ondansetrona" }, repeat: "once", effects: [obs("Vômitos cessaram após o antiemético.")] },
    { id: "r-notificacao", description: "Vigilância notificada", when: { actionCompleted: "notificacao" }, repeat: "once", effects: [staff("supervisor", "Notificação registrada. Lembrar: dengue com sinais de alarme é notificação imediata ao serviço de vigilância.")] },
    { id: "r-regulacao", description: "Regulação de leito", when: { actionCompleted: "acionar_samu" }, repeat: "once", effects: [staff("regulacao", "Regulação: leito de internação clínica disponível no hospital de referência em cerca de 3 horas; manter hidratação e reavaliações na UPA até a transferência.")] }
  ],
  diagnosis: { primary: "dengue_alarme", accepted: ["dengue_alarme"], differentials: ["leptospirose", "febre_maculosa", "sepse", "colecistite", "pancreatite", "apendicite"] },
  acceptedDestinations: ["transferencia_regulada", "observacao"],
  outcomeNotes: "Dengue no 5º dia com defervescência e sinais de alarme (dor abdominal intensa, vômitos persistentes, hipotensão postural, hepatomegalia, Ht 49%). Expansão com SF 10 mL/kg na 1ª hora e reavaliação com hematócrito levam a estabilização. Sem volume, choque aos 30 min (Grupo D). AAS precipita sangramento. Volume excessivo sem reavaliação gera congestão.",
  scoring: [
    { id: "s-fase", domain: "historia", description: "Identificou o dia de doença e a defervescência", evidence: { kind: "historyAsked", items: ["h-inicio"], minCount: 1 }, points: 6, severity: "importante", rationale: "A fase crítica coincide com a queda da febre (3º–7º dia).", sourceIds: ["BR-DENGUE"] },
    { id: "s-alarme", domain: "historia", description: "Pesquisou sinais de alarme (vômitos, sangramento, diurese)", evidence: { kind: "historyAsked", items: ["h-vomitos", "h-sangramento", "h-urina"], minCount: 2 }, points: 7, severity: "importante", rationale: "Classificação de risco define o grupo e a conduta.", sourceIds: ["BR-DENGUE"] },
    { id: "s-exame", domain: "historia", description: "Pesquisou hipotensão postural, fígado e perfusão", evidence: { kind: "examDone", regions: ["geral", "abdome_qsd", "membro_superior_d", "abdome_epigastrio"], minCount: 2 }, points: 7, severity: "importante", rationale: "Hipotensão postural, hepatomegalia dolorosa e pressão de pulso estreita são sinais de alarme/gravidade." },
    { id: "s-volume", domain: "priorizacao", description: "Hidratação venosa iniciada em até 30 min, sem aguardar exames", evidence: { kind: "drugGiven", anyOf: ["sf09", "ringer_lactato"], withinSeconds: 1800 }, points: 18, severity: "critica", rationale: "Grupo C: SF 0,9% 10 mL/kg na primeira hora, em qualquer nível de atenção, mesmo sem exames.", alternatives: "Ringer lactato aceito como cristaloide.", sourceIds: ["BR-DENGUE-SC-2024", "BR-DENGUE"] },
    { id: "s-acesso", domain: "priorizacao", description: "Acesso venoso", evidence: { kind: "actionDone", anyOf: ["acesso_venoso"] }, points: 4, severity: "importante", rationale: "Necessário para a expansão." },
    { id: "s-ht", domain: "exames", description: "Hemograma com hematócrito e plaquetas", evidence: { kind: "testOrdered", anyOf: ["hemograma"] }, points: 6, severity: "importante", rationale: "Hematócrito de referência e plaquetas.", sourceIds: ["BR-DENGUE"] },
    { id: "s-exames-excesso", domain: "exames", description: "Exames dirigidos, sem atrasar a hidratação", evidence: { kind: "testsNotExcessive", maxUnjustified: 1, justified: ["hemograma", "hepatograma", "funcao_renal", "eletrolitos", "teste_rapido_dengue", "usg_abdome", "rx_torax", "coagulograma", "gaso_venosa"] }, points: 9, severity: "menor", rationale: "Confirmação sorológica não muda a conduta inicial." },
    { id: "s-vol2", domain: "tratamento", description: "Manteve a hidratação na segunda hora (≥ 1.100 mL)", evidence: { kind: "drugGiven", anyOf: ["sf09", "ringer_lactato"], minTotal: { value: 1100, unit: "mL" }, withinSeconds: 9000 }, points: 10, severity: "importante", rationale: "10 mL/kg/h na segunda hora até o hematócrito de controle; repetir expansão até 3 vezes se não houver melhora.", sourceIds: ["BR-DENGUE-SC-2024"] },
    { id: "s-aas", domain: "tratamento", description: "Falha de segurança: AAS na dengue", evidence: { kind: "avoidDrug", anyOf: ["aas"] }, points: 12, penalty: true, severity: "critica", rationale: "AAS e anti-inflamatórios aumentam o risco de sangramento na dengue.", sourceIds: ["BR-DENGUE"] },
    { id: "s-hiper", domain: "tratamento", description: "Falha: volume excessivo sem reavaliação", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-hiper" } }, points: 6, penalty: true, severity: "importante", rationale: "Na fase de reabsorção, excesso de volume causa congestão e derrames." },
    { id: "s-analgesia", domain: "tratamento", description: "Analgesia com dipirona ou paracetamol", evidence: { kind: "drugGiven", anyOf: ["dipirona", "paracetamol"] }, points: 3, severity: "menor", rationale: "Analgésicos permitidos na dengue." },
    { id: "s-reav-ht", domain: "reavaliacao", description: "Hematócrito de controle após a expansão (até 2 h)", evidence: { kind: "reassessAfter", after: ["sf09", "ringer_lactato"], reassess: ["hemograma"], withinSeconds: 7200 }, points: 6, severity: "importante", rationale: "Ht em 2 h e após cada etapa orienta repetir a expansão.", sourceIds: ["BR-DENGUE-SC-2024"] },
    { id: "s-reav-clin", domain: "reavaliacao", description: "Reavaliação clínica (PA, perfusão, diurese)", evidence: { kind: "reassessAfter", after: ["sf09", "ringer_lactato"], reassess: ["medir_pa", "monitorizacao_continua", "diurese_horaria", "geral", "membro_superior_d"], withinSeconds: 1800 }, points: 4, severity: "importante", rationale: "Reavaliar a cada 15–30 minutos.", sourceIds: ["BR-DENGUE-SC-2024"] },
    { id: "s-notificacao", domain: "destino", description: "Notificação", evidence: { kind: "actionDone", anyOf: ["notificacao"] }, points: 3, severity: "importante", rationale: "Dengue é de notificação compulsória; com sinais de alarme, imediata." },
    { id: "s-dx", domain: "destino", description: "Classificação: dengue com sinais de alarme", evidence: { kind: "diagnosis", accepted: ["dengue_alarme"] }, points: 4, severity: "importante", rationale: "Grupo C." },
    { id: "s-destino", domain: "destino", description: "Internação (regulação) ou observação até a vaga", evidence: { kind: "disposition", accepted: ["transferencia_regulada", "observacao"] }, points: 3, severity: "importante", rationale: "Grupo C exige leito de internação até estabilização; alta exige critérios (48 h estável, 24 h sem febre, Ht estável, plaquetas em elevação).", sourceIds: ["BR-DENGUE-SC-2024"] }
  ],
  teaching: {
    hints: [
      { level: 1, text: "A febre passou ontem. Isso significa melhora na dengue?" },
      { level: 2, text: "Quais sinais de alarme ela apresenta? Em que grupo de risco ela está?" },
      { level: 3, text: "Extravasamento plasmático: o hematócrito sobe e a pressão de pulso estreita." },
      { level: 4, text: "Sugestão explícita: SF 0,9% 10 mL/kg na 1ª hora sem esperar exames, hemograma, reavaliação a cada 15–30 min, Ht em 2 h, evitar AAS, notificar e internar." }
    ],
    summary: "Mulher de 26 anos no 5º dia de dengue, após defervescência, com dor abdominal intensa, vômitos persistentes, hipotensão postural, hepatomegalia dolorosa, Ht 49% e plaquetas 42.000/mm³: Grupo C.",
    pathophysiology: "Na fase crítica (próxima à defervescência), o aumento da permeabilidade vascular causa extravasamento de plasma para o interstício e as serosas: hemoconcentração (Ht em elevação), derrames, ascite, hipotensão postural e estreitamento da pressão de pulso. Sem reposição, evolui para choque. A plaquetopenia e a disfunção endotelial aumentam o risco de sangramento.",
    keyPoints: [
      "A defervescência marca a fase crítica, não a cura.",
      "Sinais de alarme = Grupo C: hidratação venosa imediata, mesmo sem exames.",
      "Reavaliar clínica e hematócrito; repetir a expansão até 3 vezes; sem resposta, conduzir como Grupo D.",
      "Evitar AAS e anti-inflamatórios; analgesia com dipirona ou paracetamol.",
      "Notificar e internar até preencher os critérios de alta."
    ],
    alternatives: ["Ringer lactato como cristaloide.", "Observação na UPA com hidratação enquanto aguarda vaga regulada."],
    oralRubric: [
      { id: "o1", concept: "Fase crítica após a defervescência", synonyms: ["defervescência", "fase crítica", "febre passou"], weight: 1 },
      { id: "o2", concept: "Sinais de alarme / Grupo C", synonyms: ["sinais de alarme", "grupo c", "alarme"], weight: 2 },
      { id: "o3", concept: "Hidratação venosa imediata", synonyms: ["hidratação", "soro", "10 ml/kg", "volume"], weight: 3 },
      { id: "o4", concept: "Reavaliação com hematócrito", synonyms: ["hematócrito", "reavaliar", "reavaliação"], weight: 2 },
      { id: "o5", concept: "Evitar AAS/AINE", synonyms: ["aas", "anti-inflamatório", "aine"], weight: 1 }
    ],
    simplifications: ["Tempos de resposta ao volume foram comprimidos.", "O choque aos 30 min sem hidratação é decisão didática do autor."]
  },
  references: ["BR-DENGUE-SC-2024", "BR-DENGUE", "BR-UPA", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 15, allowSexSwap: false, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Classifica, hidrata 10 mL/kg/h por 2 h, hemograma e reavaliações, notifica e regula", commands: [ask(10, "h-inicio"), ask(20, "h-vomitos"), { atSeconds: 30, type: "examine", payload: { region: "geral", maneuver: "especial" } }, act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(270, "sf09", "bolsa1000", 600, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), test(280, "hemograma"), rx(300, "dipirona", "amp1g", 1000, "mg", "IV"), act(1500, "medir_pa"), rx(3900, "sf09", "bolsa1000", 600, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), test(7300, "hemograma"), act(7400, "notificacao"), act(7500, "acionar_samu"), dx(7600, "dengue_alarme"), dest(7600, "transferencia_regulada")], runUntilSeconds: 8500, expect: [{ condition: { ruleFired: "r-vol2" }, description: "estabilização" }, { condition: { not: { ruleFired: "r-choque" } }, description: "sem choque" }, { condition: { path: "vars.ht", op: "lt", value: 46 }, description: "Ht em queda" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 7300, expect: [{ condition: { ruleFired: "r-choque" }, description: "choque" }, { condition: { ruleFired: "r-pcr" }, description: "parada definida pelo caso" }] },
    { id: "t-inadequada", kind: "inadequate", description: "AAS para dor e liberação com hidratação oral", commands: [rx(60, "aas", "cp100", 500, "mg", "VO")], runUntilSeconds: 2400, expect: [{ condition: { ruleFired: "r-aas" }, description: "sangramento" }, { condition: { ruleFired: "r-choque" }, description: "choque sem volume" }] },
    { id: "t-atraso", kind: "delay", description: "Aguarda exames; hidrata após o choque com 20 mL/kg em 20 min", commands: [test(60, "teste_rapido_dengue"), test(70, "hemograma"), act(100, "acesso_venoso"), act(200, "acesso_venoso"), rx(2100, "sf09", "bolsa1000", 1200, "mL", "IV", "infusao_volume", { durationMinutes: 20 })], runUntilSeconds: 4500, expect: [{ condition: { ruleFired: "r-choque" }, description: "choque pelo atraso" }, { condition: { ruleFired: "r-choque-tratado" }, description: "resposta à expansão" }] },
    { id: "t-alternativa", kind: "alternative", description: "Ringer lactato e observação na UPA aguardando vaga", commands: [act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(270, "ringer_lactato", "bolsa1000", 600, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), rx(3900, "ringer_lactato", "bolsa1000", 600, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), dest(7600, "observacao")], runUntilSeconds: 8000, expect: [{ condition: { ruleFired: "r-vol2" }, description: "estabilização" }] }
  ]
};
