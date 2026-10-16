import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, obs, outcome, oxygenResponse, rx, staff, test, trend } from "./helpers";

const SMX = { drugGiven: "smx_tmp" };
const CORTICO = { any: [{ drugGiven: "prednisona" }, { drugGiven: "metilprednisolona" }] };

export const C022: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C022",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Falta de ar progressiva e tosse seca há semanas, com emagrecimento",
  teachingTitle: "Hipoxemia em pessoa com HIV avançado — suspeita de pneumocistose, testagem, tratamento e corticoide",
  group: "Pneumologia",
  specialties: ["Infectologia", "Pneumologia", "Emergência"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 4,
  level: "residencia",
  objectives: [
    "Reconhecer quadro subagudo com hipoxemia desproporcional ao exame",
    "Oferecer testagem para HIV com consentimento e acolhimento",
    "Iniciar tratamento empírico para pneumocistose sem aguardar confirmação",
    "Indicar corticoide adjuvante quando PaO₂ < 70 mmHg",
    "Articular rede (SAE/CTA) e destino adequado"
  ],
  keywords: ["falta de ar", "tosse seca", "emagrecimento", "febre", "cansaço"],
  patient: {
    name: "Rafael Nogueira",
    ageYears: 33,
    sex: "masculino",
    weightKg: 56,
    heightCm: 175,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 3, hairStyle: "curto", hairColor: "preto", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional. Homem de 33 anos com 3 semanas de tosse seca, febre baixa e falta de ar que piorou muito nos últimos dias; perdeu 8 kg em 2 meses.",
  communication: "normal",
  history: [
    h("h-queixa", "queixa", "O que você está sentindo?", "Falta de ar que só piora, até para tomar banho, e tosse seca.", { keywords: ["sentindo"] }),
    h("h-tempo", "inicio", "Há quanto tempo?", "Umas três semanas; piorou muito nesta.", { keywords: ["tempo", "quando"] }),
    h("h-peso", "fatores_associados", "Emagreceu? Teve febre, suor à noite, feridas na boca?", "Perdi uns 8 quilos. Febrinha à tarde. A boca está com umas placas brancas.", { keywords: ["emagreceu", "febre", "boca", "placas"] }),
    h("h-hiv", "antecedentes", "Já fez teste de HIV? Posso oferecer o teste rápido agora, com sigilo?", "Nunca fiz… pode fazer, sim.", { keywords: ["hiv", "teste", "sexual"] }),
    h("h-sexual", "habitos", "Teve parcerias sexuais sem preservativo?", "Algumas vezes, sim.", { keywords: ["parceria", "preservativo", "sexual"] }),
    h("h-sulfa", "alergias", "Tem alergia a sulfa ou outro remédio?", "Não que eu saiba.", { keywords: ["alergia", "sulfa"] })
  ],
  initial: {
    vars: { hr: 116, sbp: 112, dbp: 70, rr: 30, spo2: 86, temp: 38.0, gcs: 15, pain: 1, glucose: 98, perfusion: 0.8, effort: 0.6, ph: 7.47, pco2: 30, po2: 54, hco3: 22, lactate: 1.5, hb: 11.2, wbc: 3800 },
    flags: { rhythm: "taquicardia_sinusal", cough: true, posture: "sentado", speech: "frases", consciousness: "alerta", painVisual: "leve" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-pulmao", "torax_posterior", "ausculta", "Murmúrio presente, poucos estertores finos em bases — pobre para o grau de hipoxemia.", { sound: "murmurio_normal" }),
    ex("e-boca", "boca", "inspecao", "Placas esbranquiçadas removíveis em palato e língua (candidíase oral).", {}),
    ex("e-pele", "pele", "inspecao", "Dermatite seborreica em face; sem lesões violáceas.", {}),
    ex("e-dessaturacao", "geral", "especial", "Dessatura para 79% ao caminhar até o banheiro.", { label: "Teste de esforço à beira-leito" })
  ],
  testResults: [
    { testId: "teste_rapido_hiv", variants: [{ text: "Reagente (necessário segundo teste conforme fluxograma de diagnóstico)." }] },
    { testId: "rx_torax", variants: [{ text: "Infiltrado intersticial bilateral, peri-hilar, simétrico; sem derrame. (Laudo educativo.)" }] },
    { testId: "gaso_arterial", variants: [{ text: "Alcalose respiratória com hipoxemia (PaO₂ 54 mmHg em ar ambiente)." }] }
  ],
  highlightedActions: ["o2_cateter", "monitorizar", "acesso_venoso"],
  rules: [
    oxygenResponse(93, 120),
    { id: "r-tratamento", description: "SMX-TMP + corticoide: estabilização", priority: 50, when: { all: [SMX, CORTICO, { elapsedSince: "drug:smx_tmp", op: "gte", seconds: 1800 }] }, repeat: "once", effects: [trend("rr", 24, 1800, "tx", 50), trend("hr", 100, 1800, "tx", 50), obs("Estabilização respiratória no modelo (na prática, a melhora leva dias; piora nos primeiros dias é comum sem corticoide)."), outcome("estabilizacao_parcial")] },
    { id: "r-sem-cortico", description: "Tratamento sem corticoide com PaO₂ < 70: piora inflamatória", priority: 40, when: { all: [SMX, { not: CORTICO }, { elapsedSince: "drug:smx_tmp", op: "gte", seconds: 2400 }] }, repeat: "once", effects: [trend("spo2", 85, 600, "infl", 45), trend("rr", 34, 600, "infl", 40), obs("Piora respiratória após iniciar o antimicrobiano sem corticoide (resposta inflamatória à lise do fungo)."), outcome("piora")] },
    { id: "r-progressao", description: "Sem tratamento em 60 min: insuficiência respiratória", priority: 30, when: { all: [{ time: "gte", seconds: 3600 }, { not: SMX }] }, repeat: "once", effects: [trend("spo2", 80, 600, "prog", 45), trend("rr", 38, 600, "prog", 30), trend("effort", 0.85, 600, "prog", 30), flag("speech", "palavras"), staff("enfermagem", "A saturação está 80 mesmo com oxigênio."), outcome("piora")] },
    { id: "r-ceftriaxona", description: "Só antibiótico de PAC", when: { all: [{ drugGiven: "ceftriaxona" }, { not: SMX }] }, repeat: "once", effects: [obs("Ceftriaxona não trata Pneumocystis; com HIV reagente e quadro intersticial subagudo, pensar em pneumocistose.")] },
    { id: "r-hiv", description: "Testagem com acolhimento", when: { testCollected: "teste_rapido_hiv" }, repeat: "once", effects: [staff("supervisor", "Lembrete: comunicar resultado com acolhimento, completar o fluxograma diagnóstico e articular o SAE/CTA para início de TARV após estabilização.")] }
  ],
  diagnosis: { primary: "pneumocistose", accepted: ["pneumocistose"], differentials: ["pneumonia", "tep", "tuberculose_pulmonar", "icc_descompensada", "sepse"] },
  acceptedDestinations: ["internacao_enfermaria", "uti"],
  outcomeNotes: "Quadro subagudo com hipoxemia desproporcional, candidíase oral e emagrecimento: testar HIV e tratar empiricamente pneumocistose com SMX-TMP; com PaO₂ < 70 mmHg, associar corticoide (iniciado junto ou antes do antimicrobiano). Internação; TARV após o início do tratamento da infecção oportunista, conforme PCDT.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Tempo de evolução e sintomas constitucionais", evidence: { kind: "historyAsked", items: ["h-tempo", "h-peso"], minCount: 2 }, points: 6, severity: "importante", rationale: "Quadro subagudo + emagrecimento sugerem imunossupressão." },
    { id: "s-hiv", domain: "historia", description: "Ofereceu testagem para HIV e investigou exposição", evidence: { kind: "historyAsked", items: ["h-hiv", "h-sexual"], minCount: 1 }, points: 8, severity: "critica", rationale: "Diagnóstico muda conduta.", sourceIds: ["BR-PCDT-HIV"] },
    { id: "s-sulfa", domain: "historia", description: "Perguntou alergia a sulfa", evidence: { kind: "historyAsked", items: ["h-sulfa"], minCount: 1 }, points: 3, severity: "importante", rationale: "Antes de SMX-TMP." },
    { id: "s-exame", domain: "historia", description: "Examinou boca e pele", evidence: { kind: "examDone", regions: ["boca", "pele"], minCount: 1 }, points: 4, severity: "importante", rationale: "Candidíase oral é marcador de imunossupressão." },
    { id: "s-o2", domain: "priorizacao", description: "Oxigênio em até 5 min", evidence: { kind: "actionDone", anyOf: ["o2_cateter", "o2_mascara_reservatorio"], withinSeconds: 300 }, points: 6, severity: "critica", rationale: "SpO₂ 86%." },
    { id: "s-testes", domain: "exames", description: "Teste rápido de HIV e gasometria", evidence: { kind: "testOrdered", anyOf: ["teste_rapido_hiv"] }, points: 8, severity: "critica", rationale: "Confirma contexto e gravidade (PaO₂).", sourceIds: ["BR-PCDT-HIV"] },
    { id: "s-gaso", domain: "exames", description: "Gasometria arterial", evidence: { kind: "testOrdered", anyOf: ["gaso_arterial"] }, points: 4, severity: "importante", rationale: "PaO₂ < 70 indica corticoide." },
    { id: "s-smx", domain: "tratamento", description: "SMX-TMP em até 1 hora", evidence: { kind: "drugGiven", anyOf: ["smx_tmp"], withinSeconds: 3600 }, points: 14, severity: "critica", rationale: "Tratamento de escolha da pneumocistose.", sourceIds: ["BR-PCDT-HIV"] },
    { id: "s-cortico", domain: "tratamento", description: "Corticoide adjuvante", evidence: { kind: "drugGiven", anyOf: ["prednisona", "metilprednisolona"] }, points: 8, severity: "critica", rationale: "Reduz mortalidade quando PaO₂ < 70 mmHg.", sourceIds: ["BR-PCDT-HIV"] },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou oxigenação após tratamento", evidence: { kind: "reassessAfter", after: ["smx_tmp"], reassess: ["gaso_arterial", "oximetria_portatil"], withinSeconds: 3600 }, points: 10, severity: "importante", rationale: "Piora nos primeiros dias é esperada." },
    { id: "s-dx", domain: "destino", description: "Hipótese de pneumocistose", evidence: { kind: "diagnosis", accepted: ["pneumocistose"] }, points: 5, severity: "importante", rationale: "Infiltrado intersticial, hipoxemia e HIV reagente." },
    { id: "s-destino", domain: "destino", description: "Internação", evidence: { kind: "disposition", accepted: ["internacao_enfermaria", "uti"] }, points: 4, severity: "importante", rationale: "Hipoxemia moderada a grave." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Hipoxemia grave com ausculta quase normal: o que pensar?" },
      { level: 2, text: "Placas na boca e emagrecimento sugerem o quê?" },
      { level: 3, text: "Com PaO₂ < 70, há um adjuvante que reduz mortalidade." },
      { level: 4, text: "Sugestão explícita: O₂, teste rápido de HIV com consentimento, gasometria, SMX-TMP, corticoide, internação, articulação com SAE." }
    ],
    summary: "Homem de 33 anos com HIV não diagnosticado, candidíase oral, emagrecimento e pneumonia intersticial com hipoxemia — pneumocistose provável.",
    pathophysiology: "Na imunossupressão celular grave (CD4 < 200), Pneumocystis jirovecii prolifera nos alvéolos, causando exsudato espumoso, espessamento intersticial e distúrbio de difusão. A lise do fungo ao iniciar o tratamento aumenta a inflamação — daí o benefício do corticoide.",
    keyPoints: [
      "Quadro subagudo + hipoxemia desproporcional + candidíase: pensar em HIV/pneumocistose.",
      "Testagem com consentimento, acolhimento e fluxograma diagnóstico.",
      "SMX-TMP empírico; corticoide se PaO₂ < 70.",
      "TARV após início do tratamento da infecção oportunista, conforme PCDT.",
      "Profilaxia secundária após o tratamento."
    ],
    alternatives: ["Esquemas alternativos em alergia à sulfa (não modelados)."],
    oralRubric: [
      { id: "o1", concept: "HIV", synonyms: ["hiv", "teste rápido", "imunossupressão"], weight: 2 },
      { id: "o2", concept: "SMX-TMP", synonyms: ["sulfametoxazol", "trimetoprima", "bactrim", "smx"], weight: 3 },
      { id: "o3", concept: "Corticoide", synonyms: ["corticoide", "prednisona", "pao2"], weight: 2 },
      { id: "o4", concept: "Rede", synonyms: ["sae", "cta", "tarv", "seguimento"], weight: 1 }
    ],
    simplifications: ["Evolução comprimida; melhora real leva dias.", "Diagnóstico laboratorial de Pneumocystis não modelado."]
  },
  references: ["BR-PCDT-HIV", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 15, allowSexSwap: true, allowWeightPercent: 10, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "O₂, HIV, gasometria, SMX-TMP + corticoide e internação", commands: [act(10, "o2_cateter", { fluxo: 4 }), ask(20, "h-peso"), ask(30, "h-hiv"), ask(40, "h-sulfa"), test(50, "teste_rapido_hiv"), test(60, "gaso_arterial"), act(70, "acesso_venoso"), act(170, "acesso_venoso"), rx(300, "prednisona", "cp20", 40, "mg", "VO"), rx(320, "smx_tmp", "amp400", 5, "mg/kg", "IV"), test(2400, "gaso_arterial"), dx(3000, "pneumocistose"), dest(3000, "internacao_enfermaria")], runUntilSeconds: 3500, expect: [{ condition: { ruleFired: "r-tratamento" }, description: "estabilização" }, { condition: { not: { ruleFired: "r-sem-cortico" } }, description: "sem piora inflamatória" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 4000, expect: [{ condition: { ruleFired: "r-progressao" }, description: "insuficiência respiratória" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Tratado como PAC com ceftriaxona", commands: [act(10, "o2_cateter", { fluxo: 4 }), act(70, "acesso_venoso"), act(170, "acesso_venoso"), rx(300, "ceftriaxona", "fa1g", 2000, "mg", "IV")], runUntilSeconds: 4000, expect: [{ condition: { ruleFired: "r-ceftriaxona" }, description: "sem cobertura" }, { condition: { ruleFired: "r-progressao" }, description: "progressão" }] },
    { id: "t-atraso", kind: "delay", description: "SMX-TMP sem corticoide", commands: [act(10, "o2_cateter", { fluxo: 4 }), act(70, "acesso_venoso"), act(170, "acesso_venoso"), rx(300, "smx_tmp", "amp400", 5, "mg/kg", "IV")], runUntilSeconds: 3500, expect: [{ condition: { ruleFired: "r-sem-cortico" }, description: "piora inflamatória" }] },
    { id: "t-alternativa", kind: "alternative", description: "Metilprednisolona IV e SMX-TMP VO", commands: [act(10, "o2_cateter", { fluxo: 4 }), act(70, "acesso_venoso"), act(170, "acesso_venoso"), rx(300, "metilprednisolona", "fa125", 40, "mg", "IV"), rx(320, "smx_tmp", "cp800", 5, "mg/kg", "VO")], runUntilSeconds: 3000, expect: [{ condition: { ruleFired: "r-tratamento" }, description: "estabilização" }] }
  ]
};
