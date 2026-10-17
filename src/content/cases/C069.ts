import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const ANGIO = { testCollected: "angio_tc_abdome" };
const CIRURGIA = { actionCompleted: "solicitar_avaliacao_cirurgica" };
const HEPARINA = { drugGiven: "heparina" };
const VOL = { any: [{ drugGiven: "ringer_lactato", minTotal: { value: 500, unit: "mL" as const } }, { drugGiven: "sf09", minTotal: { value: 500, unit: "mL" as const } }] };
const ATB = { any: [{ drugGiven: "piperacilina_tazobactam" }, { drugGiven: "ceftriaxona" }, { drugGiven: "metronidazol" }] };
const ALTA = { any: [{ path: "disposition", op: "eq", value: "alta_orientada" }, { path: "disposition", op: "eq", value: "observacao" }] };

export const C069: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C069",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Idoso com dor de barriga muito forte de repente, mas a barriga está mole",
  teachingTitle: "Isquemia mesentérica aguda embólica — dor desproporcional ao exame, angio-TC, heparina e revascularização urgente",
  group: "Gastroenterologia",
  specialties: ["Cirurgia geral", "Cirurgia vascular", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-referencia",
  difficulty: 4,
  level: "residencia",
  objectives: [
    "Suspeitar de isquemia mesentérica na dor abdominal súbita desproporcional ao exame em paciente com fibrilação atrial",
    "Solicitar angiotomografia sem esperar lactato alto ou peritonite",
    "Iniciar heparina, volume, analgesia e antibiótico",
    "Acionar cirurgia/vascular para revascularização e avaliação de viabilidade intestinal sem atraso"
  ],
  keywords: ["dor abdominal", "súbita", "idoso", "arritmia", "vômito", "diarreia"],
  patient: {
    name: "Waldemar Krüger",
    ageYears: 77,
    sex: "masculino",
    weightKg: 72,
    heightCm: 172,
    visual: { ageGroup: "idoso", sex: "masculino", skinTone: 0, hairStyle: "careca", hairColor: "branco", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital de referência (cirurgia vascular, hemodinâmica e TC 24 h). Homem de 77 anos com dor abdominal súbita e intensíssima há 3 horas, em torno do umbigo, com um episódio de evacuação e vômito. Contorce-se na maca.",
  communication: "normal",
  informants: [{ id: "esposa", name: "Esposa", role: "Acompanhante" }],
  history: [
    h("h-inicio", "inicio", "Como começou a dor?", "De repente, depois do almoço, como uma facada no meio da barriga. Nunca senti nada igual.", { keywords: ["começou", "início", "repente"] }),
    hi("h-arritmia", "antecedentes", "Ele tem problema de coração? Usa anticoagulante?", [{ source: "esposa", text: "Tem arritmia, o médico passou um remédio para afinar o sangue, mas ele parou há 2 meses porque sangrava a gengiva." }], ["coração", "arritmia", "anticoagulante", "afinar"]),
    h("h-evacuacao", "fatores_associados", "Evacuou? Como foram as fezes?", "Evacuei uma vez logo que começou, mole… parecia ter um pouco de sangue.", { keywords: ["evacuou", "fezes", "sangue"] }),
    h("h-pos-prandial", "antecedentes", "Já tinha dor depois de comer, emagrecimento?", "Não, comia bem.", { keywords: ["comer", "emagrecimento"] }),
    hi("h-medicacoes", "medicacoes", "Que remédios usa?", [{ source: "esposa", text: "Remédio de pressão, de coração (digoxina?) e o anticoagulante que parou." }], ["remédio", "medicação"])
  ],
  initial: {
    vars: { hr: 118, sbp: 148, dbp: 82, rr: 22, spo2: 95, temp: 36.8, gcs: 15, pain: 10, glucose: 152, perfusion: 0.8, effort: 0.3, wbc: 17800, lactate: 2.4, ph: 7.34, hco3: 20, creat: 1.3, hb: 15.2, plt: 240000, inr: 1.1 },
    flags: { rhythm: "fa", posture: "supino", painVisual: "intensa", speech: "frases", consciousness: "alerta", agitation: true, sweating: true },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-abdome", "abdome_epigastrio", "palpacao", "Abdome flácido, pouco doloroso à palpação profunda, sem defesa ou descompressão dolorosa — contrastando com a dor intensa referida.", { label: "Abdome", better: [{ when: { ruleFired: "r-necrose" }, text: "Abdome distendido, defesa difusa e descompressão dolorosa (peritonite)." }] }),
    ex("e-ausculta", "abdome_qid", "ausculta", "Ruídos hidroaéreos aumentados.", { sound: "ruidos_hidroaereos" }),
    ex("e-coracao", "coracao", "ausculta", "Ritmo irregularmente irregular (fibrilação atrial).", {}),
    ex("e-pelve", "pelve", "palpacao", "Toque retal: fezes com sangue escurecido.", { label: "Toque retal" })
  ],
  testResults: [
    { testId: "angio_tc_abdome", variants: [{ text: "Laudo educativo: falha de enchimento na artéria mesentérica superior cerca de 5 cm após a origem (provável êmbolo); alças de jejuno/íleo com hipocaptação parietal; sem pneumatose ou gás portal." }] },
    { testId: "tc_abdome", variants: [{ text: "Laudo educativo (fase portal): espessamento de alças de delgado; avaliação arterial limitada — sugere-se angiotomografia." }] },
    { testId: "rx_abdome", variants: [{ text: "Laudo educativo: inespecífico, sem pneumoperitônio." }] },
    { testId: "ecg12", variants: [{ text: "Fibrilação atrial com resposta ventricular ~115 bpm." }] }
  ],
  highlightedActions: ["monitorizar", "acesso_venoso", "solicitar_avaliacao_cirurgica"],
  rules: [
    { id: "r-curso", description: "Isquemia em evolução", priority: 10, when: { always: true }, repeat: "once", effects: [trend("lactate", 4.0, 3600, "isq", 10), trend("wbc", 21000, 3600, "isq", 10), trend("ph", 7.28, 3600, "isq", 10)] },
    { id: "r-analgesia", description: "Analgesia opioide", priority: 20, when: { drugGiven: "morfina" }, repeat: "once", effects: [trend("pain", 6, 600, "anal", 20), flag("agitation", false)] },
    { id: "r-volume", description: "Cristaloide", priority: 25, when: VOL, repeat: "once", effects: [trend("hr", 108, 1200, "vol", 25), trend("perfusion", 0.85, 1200, "vol", 25)] },
    { id: "r-heparina", description: "Heparina não fracionada", priority: 30, when: HEPARINA, repeat: "once", effects: [obs("Heparina IV limita a propagação do trombo; não substitui a revascularização.")] },
    { id: "r-cirurgia-sem-angio", description: "Cirurgião pede angio-TC", priority: 40, when: { all: [CIRURGIA, { not: ANGIO }] }, repeat: "once", effects: [staff("supervisor", "Cirurgião vascular: preciso da angiotomografia agora para planejar embolectomia/endovascular. Inicie heparina se não houver contraindicação.")] },
    { id: "r-revascularizacao", description: "Angio-TC + cirurgia: revascularização e avaliação de alças", priority: 41, when: { all: [CIRURGIA, ANGIO] }, repeat: "once", effects: [staff("supervisor", "Cirurgião vascular e geral: êmbolo na AMS — laparotomia com embolectomia (ou abordagem híbrida) e avaliação da viabilidade das alças; second look em 24–48 h."), outcome("estabilizacao_parcial")] },
    { id: "r-necrose", description: "Sem revascularização em 75 min: necrose transmural", priority: 50, when: { all: [{ time: "gte", seconds: 4500 }, { not: { ruleFired: "r-revascularizacao" } }] }, repeat: "once", effects: [trend("lactate", 7.5, 1800, "nec", 50), trend("sbp", 82, 1800, "nec", 50), trend("hr", 132, 1200, "nec", 50), trend("temp", 38.4, 1800, "nec", 50), trend("gcs", 13, 1800, "nec", 50), staff("enfermagem", "A barriga está dura agora e a pressão caindo."), outcome("piora")] },
    { id: "r-alta", description: "Observação/alta com analgésico", priority: 45, when: ALTA, repeat: "once", effects: [obs("Dor desproporcional ao exame em paciente com FA sem anticoagulação: isquemia mesentérica até prova em contrário; observar sem imagem leva à necrose."), outcome("complicacao")] }
  ],
  diagnosis: { primary: "isquemia_mesenterica", accepted: ["isquemia_mesenterica"], differentials: ["pancreatite", "disseccao_aorta", "obstrucao_intestinal", "apendicite_complicada", "iamcsst", "gastroenterite"] },
  acceptedDestinations: ["centro_cirurgico", "hemodinamica"],
  outcomeNotes: "Isquemia mesentérica aguda embólica (FA sem anticoagulação) com dor desproporcional ao exame, leucocitose e lactato em ascensão. Monitorização, analgesia opioide, cristaloide, heparina IV, antibiótico de amplo espectro, angiotomografia imediata e revascularização (embolectomia/endovascular) com avaliação de viabilidade das alças.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Início súbito e FA sem anticoagulação", evidence: { kind: "historyAsked", items: ["h-inicio", "h-arritmia"], minCount: 2 }, points: 10, severity: "critica", rationale: "Fonte embólica." },
    { id: "s-exame", domain: "historia", description: "Exame abdominal e cardíaco", evidence: { kind: "examDone", regions: ["abdome_epigastrio", "coracao"], minCount: 2 }, points: 6, severity: "importante", rationale: "Dor desproporcional ao exame; ritmo irregular." },
    { id: "s-labs", domain: "exames", description: "Lactato/gasometria, hemograma, função renal, coagulograma", evidence: { kind: "testOrdered", anyOf: ["gaso_venosa", "gaso_arterial", "hemograma", "funcao_renal", "coagulograma"], withinSeconds: 900 }, points: 4, severity: "importante", rationale: "Lactato normal não exclui isquemia precoce." },
    { id: "s-angio", domain: "exames", description: "Angiotomografia em até 30 min", evidence: { kind: "testOrdered", anyOf: ["angio_tc_abdome"], withinSeconds: 1800 }, points: 16, severity: "critica", rationale: "Exame de escolha; não esperar peritonite.", sourceIds: ["INT-WSES-ISQ-MES-2022"] },
    { id: "s-heparina", domain: "tratamento", description: "Heparina IV", evidence: { kind: "drugGiven", anyOf: ["heparina"], withinSeconds: 2400 }, points: 8, severity: "importante", rationale: "Evitar propagação do trombo." },
    { id: "s-analgesia", domain: "tratamento", description: "Analgesia opioide", evidence: { kind: "drugGiven", anyOf: ["morfina"], withinSeconds: 900 }, points: 4, severity: "importante", rationale: "Dor intensa." },
    { id: "s-volume", domain: "tratamento", description: "Cristaloide", evidence: { kind: "drugGiven", anyOf: ["ringer_lactato", "sf09"], withinSeconds: 1200 }, points: 4, severity: "importante", rationale: "Perdas para o terceiro espaço." },
    { id: "s-atb", domain: "tratamento", description: "Antibiótico de amplo espectro", evidence: { kind: "drugGiven", anyOf: ["piperacilina_tazobactam", "ceftriaxona", "metronidazol"], withinSeconds: 3600 }, points: 4, severity: "importante", rationale: "Translocação bacteriana na isquemia." },
    { id: "s-cirurgia", domain: "tratamento", description: "Acionou cirurgia/vascular em até 45 min", evidence: { kind: "actionDone", anyOf: ["solicitar_avaliacao_cirurgica"], withinSeconds: 2700 }, points: 14, severity: "critica", rationale: "Tempo é intestino.", sourceIds: ["INT-WSES-ISQ-MES-2022"] },
    { id: "s-alta", domain: "destino", description: "Falha: observar/liberar sem imagem", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-alta" } }, points: 12, penalty: true, severity: "critica", rationale: "Erro fatal clássico." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou abdome e lactato", evidence: { kind: "reassessAfter", after: ["morfina", "heparina"], reassess: ["abdome_epigastrio", "gaso_venosa", "gaso_arterial", "medir_pa"], withinSeconds: 2400 }, points: 6, severity: "importante", rationale: "Detectar peritonite." },
    { id: "s-dx", domain: "destino", description: "Isquemia mesentérica aguda", evidence: { kind: "diagnosis", accepted: ["isquemia_mesenterica"] }, points: 6, severity: "importante", rationale: "FA + dor desproporcional + angio-TC." },
    { id: "s-destino", domain: "destino", description: "Centro cirúrgico/hemodinâmica", evidence: { kind: "disposition", accepted: ["centro_cirurgico", "hemodinamica"] }, points: 6, severity: "importante", rationale: "Revascularização." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Dor 10/10 e barriga mole: isso tranquiliza ou preocupa?" },
      { level: 2, text: "Ritmo irregular e parou o anticoagulante há 2 meses." },
      { level: 3, text: "TC comum em fase portal não vê bem a artéria." },
      { level: 4, text: "Sugestão explícita: monitor, acesso, morfina, Ringer, gasometria com lactato, angio-TC, heparina, antibiótico, acionar cirurgia vascular, centro cirúrgico." }
    ],
    summary: "Homem de 77 anos com FA sem anticoagulação e embolia da artéria mesentérica superior, com dor desproporcional ao exame.",
    pathophysiology: "Um êmbolo do átrio esquerdo oclui a AMS, geralmente após a origem da cólica média. A mucosa sofre primeiro (dor visceral intensa sem peritonismo, diarreia com sangue); horas depois a isquemia fica transmural, com peritonite, acidose láctica e choque. O lactato pode ser normal no início.",
    keyPoints: [
      "Dor desproporcional ao exame + fonte embólica = isquemia mesentérica até prova em contrário.",
      "Angiotomografia imediata; lactato normal não exclui.",
      "Heparina, volume, analgesia, antibiótico.",
      "Revascularização (embolectomia/endovascular) e avaliação de viabilidade/ressecção; second look.",
      "Atraso diagnóstico é a principal causa de mortalidade (~50%)."
    ],
    alternatives: ["Revascularização endovascular (trombectomia/aspiração) em centros com hemodinâmica.", "Abordagem híbrida (laparotomia + endovascular)."],
    oralRubric: [
      { id: "o1", concept: "Dor desproporcional", synonyms: ["desproporcional", "barriga mole", "exame pobre"], weight: 2 },
      { id: "o2", concept: "Fonte embólica", synonyms: ["fibrilação", "fa", "êmbolo", "anticoagulante"], weight: 2 },
      { id: "o3", concept: "Angio-TC", synonyms: ["angiotomografia", "angio-tc"], weight: 2 },
      { id: "o4", concept: "Revascularização urgente", synonyms: ["embolectomia", "revascularização", "cirurgia", "endovascular"], weight: 3 }
    ],
    simplifications: ["Procedimento cirúrgico/endovascular representado pelo acionamento com angio-TC.", "Necrose transmural em tempo fixo (75 min) é decisão didática."]
  },
  references: ["INT-WSES-ISQ-MES-2022", "INT-SSC-2021", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Monitor, história, exame, morfina, Ringer, labs, angio-TC, heparina, antibiótico, cirurgia", commands: [act(5, "monitorizar"), ask(15, "h-inicio"), ask(25, "h-arritmia"), { atSeconds: 35, type: "examine", payload: { region: "abdome_epigastrio", maneuver: "palpacao" } }, { atSeconds: 45, type: "examine", payload: { region: "coracao", maneuver: "ausculta" } }, act(55, "acesso_venoso"), rx(160, "morfina", "amp10", 4, "mg", "IV"), test(170, "gaso_venosa"), test(180, "coagulograma"), rx(200, "ringer_lactato", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), test(240, "angio_tc_abdome"), rx(600, "heparina", "fa5000", 80, "UI/kg", "IV"), rx(700, "piperacilina_tazobactam", "fa45", 4500, "mg", "IV"), act(900, "solicitar_avaliacao_cirurgica"), dx(2200, "isquemia_mesenterica"), dest(2300, "centro_cirurgico")], runUntilSeconds: 5000, expect: [{ condition: { ruleFired: "r-revascularizacao" }, description: "revascularização" }, { condition: { not: { ruleFired: "r-necrose" } }, description: "sem necrose transmural" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 5000, expect: [{ condition: { ruleFired: "r-necrose" }, description: "necrose" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Analgesia e observação com radiografia", commands: [act(30, "acesso_venoso"), rx(150, "morfina", "amp10", 4, "mg", "IV"), test(200, "rx_abdome"), dest(1200, "observacao")], runUntilSeconds: 5000, expect: [{ condition: { ruleFired: "r-alta" }, description: "observação sem imagem" }, { condition: { ruleFired: "r-necrose" }, description: "necrose" }] },
    { id: "t-atraso", kind: "delay", description: "TC comum primeiro; angio-TC e cirurgia tardias", commands: [act(30, "acesso_venoso"), rx(150, "morfina", "amp10", 4, "mg", "IV"), test(300, "tc_abdome"), test(3500, "angio_tc_abdome"), rx(3600, "heparina", "fa5000", 80, "UI/kg", "IV"), act(4800, "solicitar_avaliacao_cirurgica"), dest(6000, "centro_cirurgico")], runUntilSeconds: 7000, expect: [{ condition: { ruleFired: "r-necrose" }, description: "necrose pelo atraso" }, { condition: { ruleFired: "r-revascularizacao" }, description: "revascularização tardia" }] },
    { id: "t-alternativa", kind: "alternative", description: "Cirurgia acionada antes da imagem; hemodinâmica", commands: [act(10, "monitorizar"), act(30, "acesso_venoso"), act(140, "solicitar_avaliacao_cirurgica"), rx(160, "heparina", "fa5000", 80, "UI/kg", "IV"), test(200, "angio_tc_abdome"), dest(3000, "hemodinamica")], runUntilSeconds: 4500, expect: [{ condition: { ruleFired: "r-cirurgia-sem-angio" }, description: "pede angio-TC" }, { condition: { ruleFired: "r-revascularizacao" }, description: "revascularização" }] }
  ]
};
