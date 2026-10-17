import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const TERLI = { drugGiven: "terlipressina" };
const SANGUE = { drugGiven: "concentrado_hemacias", minTotal: { value: 250, unit: "mL" as const } };
const SANGUE_EXCESSO = { drugGiven: "concentrado_hemacias", minTotal: { value: 1100, unit: "mL" as const } };
const SF_EXCESSO = { any: [{ drugGiven: "sf09", minTotal: { value: 2000, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: 2000, unit: "mL" as const } }] };
const ATB = { any: [{ drugGiven: "ceftriaxona" }, { drugGiven: "piperacilina_tazobactam" }] };
const EDA = { actionCompleted: "solicitar_endoscopia" };

export const C071: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C071",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Homem com doença no fígado vomitando muito sangue",
  teachingTitle: "Hemorragia digestiva alta varicosa — vasoativo precoce, antibiótico, transfusão restritiva, endoscopia em até 12 h",
  group: "Gastroenterologia",
  specialties: ["Hepatologia", "Gastroenterologia", "Emergência", "Terapia intensiva"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 4,
  level: "internato",
  objectives: [
    "Suspeitar de origem varicosa em hepatopata com hemorragia digestiva alta",
    "Iniciar vasoativo (terlipressina) o mais cedo possível",
    "Antibiótico profilático (ceftriaxona) em cirrótico com hemorragia digestiva",
    "Transfundir de forma restritiva (Hb-alvo ~7–8 g/dL) e evitar excesso de volume",
    "Endoscopia com ligadura elástica em até 12 h após ressuscitação; proteger via aérea se necessário"
  ],
  keywords: ["vômito com sangue", "hematêmese", "fígado", "cirrose", "fezes pretas", "tontura"],
  patient: {
    name: "José Ricardo Moura",
    ageYears: 52,
    sex: "masculino",
    weightKg: 74,
    heightCm: 174,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 3, hairStyle: "curto", hairColor: "preto", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional (UTI e endoscopia). Homem de 52 anos com cirrose por hepatite C, trazido após vomitar grande quantidade de sangue vivo em casa há 1 hora; fezes pretas desde ontem.",
  communication: "normal",
  informants: [{ id: "esposa", name: "Esposa", role: "Acompanhante" }],
  history: [
    hi("h-sangue", "queixa", "Quanto sangue? Quantas vezes?", [{ source: "esposa", text: "Duas vezes, uma bacia cheia de sangue vivo, com coágulos. Ontem as fezes já estavam pretas." }], ["sangue", "quanto", "vezes"]),
    hi("h-figado", "antecedentes", "Que doença ele tem no fígado? Tem varizes?", [{ source: "esposa", text: "Cirrose da hepatite C. Fez endoscopia há 1 ano, disseram que tinha varizes e mandaram tomar propranolol, mas ele não toma direito." }], ["fígado", "cirrose", "varizes", "endoscopia"]),
    hi("h-medicacoes", "medicacoes", "Usa anticoagulante, anti-inflamatório, AAS?", [{ source: "esposa", text: "Não. Só propranolol às vezes e espironolactona." }], ["anticoagulante", "anti-inflamatório", "aas"]),
    hi("h-confusao", "sinais_alarme", "Ele está mais confuso, sonolento?", [{ source: "esposa", text: "Está mais lento que o normal." }], ["confuso", "sonolento"]),
    hi("h-alergias", "alergias", "Alergia a remédio?", [{ source: "esposa", text: "Não." }])
  ],
  initial: {
    vars: { hr: 122, sbp: 88, dbp: 52, rr: 22, spo2: 96, temp: 36.2, gcs: 14, pain: 3, glucose: 128, perfusion: 0.45, effort: 0.3, hb: 7.1, ht: 22, plt: 68000, inr: 1.7, bili: 3.1, creat: 1.2, urea: 88, lactate: 3.4, na: 133, k: 4.1, bleeding: 70 },
    flags: { rhythm: "taquicardia_sinusal", posture: "supino", painVisual: "leve", speech: "frases", consciousness: "alerta", pallor: true, jaundice: true, sweating: true, bleedingVisible: true },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Pálido, sudoreico, ictérico; sangue em comissura labial.", { better: [{ when: { ruleFired: "r-choque" }, text: "Sonolento, pele fria; nova hematêmese volumosa." }] }),
    ex("e-abdome", "abdome_qid", "percussao", "Ascite moderada; circulação colateral abdominal; esplenomegalia.", { label: "Abdome" }),
    ex("e-pelve", "pelve", "palpacao", "Toque retal: melena.", { label: "Toque retal" }),
    ex("e-neuro", "neurologico", "especial", "Glasgow 14, asterixis discreto.", {})
  ],
  testResults: [
    { testId: "hemograma", variants: [{ text: "Hb 7,1 g/dL; plaquetas 68.000/mm³." }] },
    { testId: "coagulograma", variants: [{ text: "INR 1,7." }] }
  ],
  highlightedActions: ["monitorizar", "acesso_venoso", "solicitar_endoscopia", "o2_cateter"],
  rules: [
    { id: "r-sangramento", description: "Sangramento varicoso ativo", priority: 10, when: { always: true }, repeat: "once", effects: [trend("sbp", 66, 2400, "hem", 10), trend("dbp", 38, 2400, "hem", 10), trend("hr", 138, 2400, "hem", 10), trend("hb", 5.6, 3000, "hem", 10), trend("lactate", 5.5, 3000, "hem", 10), trend("perfusion", 0.25, 2400, "hem", 10)] },
    { id: "r-terli", description: "Terlipressina: redução da pressão portal e do sangramento", priority: 40, when: TERLI, repeat: "once", effects: [trend("sbp", 98, 900, "terli", 40), trend("hr", 110, 900, "terli", 40), trend("hb", 6.6, 1800, "terli", 40), flag("bleedingVisible", false)] },
    { id: "r-transfusao", description: "Concentrado de hemácias restritivo", priority: 45, when: SANGUE, repeat: "once", effects: [trend("hb", 7.8, 1200, "tx", 45), trend("sbp", 104, 1200, "tx", 45), trend("hr", 102, 1200, "tx", 45), trend("perfusion", 0.65, 1200, "tx", 45)] },
    { id: "r-transfusao-excesso", description: "Transfusão liberal (Hb > 9–10)", priority: 55, when: SANGUE_EXCESSO, repeat: "once", effects: [trend("hb", 10.2, 1800, "txx", 55), obs("Transfusão liberal eleva a pressão portal e aumenta ressangramento e mortalidade em cirróticos: alvo restritivo (~7–8 g/dL)."), outcome("complicacao")] },
    { id: "r-sf-excesso", description: "Cristaloide em excesso", priority: 50, when: SF_EXCESSO, repeat: "once", effects: [obs("Volume excessivo aumenta a pressão portal e o ressangramento; usar o mínimo para perfusão até o sangue."), outcome("complicacao")] },
    { id: "r-atb", description: "Antibiótico profilático", priority: 20, when: ATB, repeat: "once", effects: [obs("Ceftriaxona reduz infecções, ressangramento e mortalidade em cirróticos com hemorragia digestiva.")] },
    { id: "r-eda", description: "Endoscopia com ligadura elástica", priority: 60, when: { all: [EDA, { elapsedSince: "action:solicitar_endoscopia", op: "gte", seconds: 1800 }, { any: [TERLI, SANGUE] }] }, repeat: "once", effects: [staff("supervisor", "Endoscopista: varizes de esôfago de grosso calibre com sangramento em jato — ligadura elástica com hemostasia. Manter terlipressina 2–5 dias e antibiótico; discutir TIPS precoce se Child C."), trend("sbp", 112, 1800, "eda", 60), trend("hr", 94, 1800, "eda", 60), trend("lactate", 2.0, 3600, "eda", 60), outcome("melhora")] },
    { id: "r-choque", description: "Sem vasoativo nem sangue em 40 min: choque hemorrágico", priority: 35, when: { all: [{ time: "gte", seconds: 2400 }, { not: TERLI }, { not: SANGUE }] }, repeat: "once", effects: [trend("sbp", 58, 600, "choque", 35), trend("gcs", 11, 900, "choque", 35), flag("consciousness", "voz"), flag("bleedingVisible", true), staff("enfermagem", "Vomitou sangue de novo, muito! Pressão 58!"), outcome("piora")] },
    { id: "r-pcr", description: "Exsanguinação", priority: 100, when: { all: [{ time: "gte", seconds: 4200 }, { not: SANGUE }] }, repeat: "once", effects: [flag("pulse", false), { type: "setValue", var: "sbp", value: 0 }, { type: "setValue", var: "dbp", value: 0 }, flag("consciousness", "irresponsivo"), staff("enfermagem", "Parou! AESP!"), outcome("parada", true)] }
  ],
  diagnosis: { primary: "hda_varicosa", accepted: ["hda_varicosa", "hda"], differentials: ["hda", "choque_hipovolemico", "coagulopatia", "encefalopatia_metabolica"] },
  acceptedDestinations: ["uti"],
  outcomeNotes: "Hemorragia digestiva alta varicosa em cirrose por hepatite C (varizes conhecidas, betabloqueador irregular), com choque. Dois acessos, cristaloide mínimo, terlipressina imediata, ceftriaxona, concentrado de hemácias com alvo ~7–8 g/dL, lactulose/prevenção de encefalopatia, endoscopia com ligadura em até 12 h (proteção de via aérea se rebaixamento) e UTI; considerar TIPS precoce.",
  scoring: [
    { id: "s-hist", domain: "historia", description: "Hepatopatia, varizes e quantidade de sangramento", evidence: { kind: "historyAsked", items: ["h-sangue", "h-figado"], minCount: 2 }, points: 6, severity: "importante", rationale: "Origem varicosa provável." },
    { id: "s-exame", domain: "historia", description: "Estigmas de hepatopatia, toque retal, neurológico", evidence: { kind: "examDone", regions: ["geral", "abdome_qid", "pelve", "neurologico"], minCount: 3 }, points: 5, severity: "importante", rationale: "Hipertensão portal, melena, encefalopatia." },
    { id: "s-acesso", domain: "priorizacao", description: "Dois acessos e monitorização em até 5 min", evidence: { kind: "actionDone", anyOf: ["acesso_venoso", "monitorizar"], withinSeconds: 300 }, points: 6, severity: "critica", rationale: "Choque hemorrágico." },
    { id: "s-terli", domain: "tratamento", description: "Terlipressina em até 20 min", evidence: { kind: "drugGiven", anyOf: ["terlipressina"], withinSeconds: 1200 }, points: 14, severity: "critica", rationale: "Vasoativo o mais cedo possível.", sourceIds: ["INT-BAVENO-VI-RESUMO", "INT-BAVENO-VII"] },
    { id: "s-atb", domain: "tratamento", description: "Ceftriaxona profilática", evidence: { kind: "drugGiven", anyOf: ["ceftriaxona", "piperacilina_tazobactam"], withinSeconds: 3600 }, points: 8, severity: "importante", rationale: "Reduz infecção e mortalidade.", sourceIds: ["INT-BAVENO-VI-RESUMO"] },
    { id: "s-sangue", domain: "tratamento", description: "Concentrado de hemácias", evidence: { kind: "drugGiven", anyOf: ["concentrado_hemacias"], withinSeconds: 1800 }, points: 8, severity: "critica", rationale: "Hb 7,1 com choque.", sourceIds: ["INT-BAVENO-VI-RESUMO"] },
    { id: "s-excesso", domain: "tratamento", description: "Falha: transfusão ou cristaloide liberal", evidence: { kind: "stateAtEnd", when: { any: [{ ruleFired: "r-transfusao-excesso" }, { ruleFired: "r-sf-excesso" }] } }, points: 10, penalty: true, severity: "critica", rationale: "Alvo restritivo." },
    { id: "s-eda", domain: "tratamento", description: "Endoscopia solicitada", evidence: { kind: "actionDone", anyOf: ["solicitar_endoscopia"], withinSeconds: 5400 }, points: 12, severity: "critica", rationale: "Ligadura elástica em até 12 h.", sourceIds: ["INT-BAVENO-VI-RESUMO"] },
    { id: "s-labs", domain: "exames", description: "Hemograma, coagulograma, tipagem, função renal", evidence: { kind: "testOrdered", anyOf: ["hemograma", "coagulograma", "funcao_renal", "gaso_venosa"], withinSeconds: 900 }, points: 5, severity: "importante", rationale: "Base para transfusão e gravidade (Child)." },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou PA e Hb após transfusão/vasoativo", evidence: { kind: "reassessAfter", after: ["concentrado_hemacias", "terlipressina"], reassess: ["medir_pa", "hemograma", "gaso_venosa"], withinSeconds: 2400 }, points: 6, severity: "importante", rationale: "Evitar sub e supertransfusão." },
    { id: "s-dx", domain: "destino", description: "HDA varicosa", evidence: { kind: "diagnosis", accepted: ["hda_varicosa", "hda"] }, points: 4, severity: "importante", rationale: "Cirrose com varizes." },
    { id: "s-destino", domain: "destino", description: "UTI", evidence: { kind: "disposition", accepted: ["uti"] }, points: 6, severity: "importante", rationale: "Choque e risco de ressangramento." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "HDA em cirrótico com varizes conhecidas: o que fazer antes mesmo da endoscopia?" },
      { level: 2, text: "Vasoativo, antibiótico e sangue — nessa ordem de urgência, e todos cedo." },
      { level: 3, text: "Mais sangue nem sempre é melhor: qual a meta de hemoglobina?" },
      { level: 4, text: "Sugestão explícita: monitor, 2 acessos, terlipressina, ceftriaxona, hemácias até Hb ~7–8, exames, endoscopia, UTI." }
    ],
    summary: "Homem de 52 anos com cirrose por hepatite C e hemorragia varicosa com choque.",
    pathophysiology: "A hipertensão portal dilata colaterais esofágicas; quando a tensão na parede excede a resistência, a variz rompe. Terlipressina reduz o fluxo esplâncnico e a pressão portal. Expansão volêmica excessiva e transfusão liberal elevam a pressão portal e favorecem ressangramento. Infecções bacterianas são frequentes e pioram o prognóstico.",
    keyPoints: [
      "Vasoativo (terlipressina) o mais cedo possível.",
      "Antibiótico profilático (ceftriaxona) por até 7 dias.",
      "Transfusão restritiva: Hb-alvo ~7–8 g/dL.",
      "Endoscopia com ligadura em até 12 h após ressuscitação; IOT se rebaixamento ou hematêmese maciça.",
      "TIPS precoce em Child C ou B com sangramento ativo."
    ],
    alternatives: ["Octreotide/somatostatina se terlipressina indisponível ou contraindicada (cardiopatia isquêmica).", "Balão/stent esofágico como ponte em sangramento refratário."],
    oralRubric: [
      { id: "o1", concept: "Vasoativo precoce", synonyms: ["terlipressina", "vasoativo", "octreotide"], weight: 3 },
      { id: "o2", concept: "Antibiótico", synonyms: ["ceftriaxona", "antibiótico"], weight: 2 },
      { id: "o3", concept: "Transfusão restritiva", synonyms: ["hb 7", "restritiva", "transfusão"], weight: 2 },
      { id: "o4", concept: "Endoscopia com ligadura", synonyms: ["endoscopia", "ligadura", "eda"], weight: 2 }
    ],
    simplifications: ["Endoscopia representada pela solicitação e efeito após 30 min.", "Plasma e plaquetas não são modelados."]
  },
  references: ["INT-BAVENO-VI-RESUMO", "INT-BAVENO-VII", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 12, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Monitor, acessos, terlipressina, ceftriaxona, hemácias, labs, EDA, UTI", commands: [act(5, "monitorizar"), ask(15, "h-sangue"), ask(25, "h-figado"), act(35, "acesso_venoso"), act(135, "acesso_venoso"), { atSeconds: 145, type: "examine", payload: { region: "geral", maneuver: "inspecao" } }, { atSeconds: 155, type: "examine", payload: { region: "abdome_qid", maneuver: "percussao" } }, { atSeconds: 165, type: "examine", payload: { region: "pelve", maneuver: "palpacao" } }, test(240, "hemograma"), test(250, "coagulograma"), rx(270, "terlipressina", "fa1mg", 2, "mg", "IV"), rx(290, "ceftriaxona", "fa1g", 1000, "mg", "IV"), rx(400, "concentrado_hemacias", "unidade", 300, "mL", "IV", "infusao_volume", { durationMinutes: 30 }), act(600, "solicitar_endoscopia"), act(2400, "medir_pa"), test(2500, "hemograma"), dx(3000, "hda_varicosa"), dest(3100, "uti")], runUntilSeconds: 5000, expect: [{ condition: { ruleFired: "r-eda" }, description: "ligadura" }, { condition: { not: { ruleFired: "r-choque" } }, description: "sem choque grave" }, { condition: { not: { ruleFired: "r-transfusao-excesso" } }, description: "transfusão restritiva" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 4500, expect: [{ condition: { ruleFired: "r-choque" }, description: "choque" }, { condition: { ruleFired: "r-pcr" }, description: "PCR" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Soro em excesso e transfusão liberal, sem vasoativo", commands: [act(30, "acesso_venoso"), act(130, "acesso_venoso"), rx(200, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 15 }), rx(220, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 15 }), rx(400, "concentrado_hemacias", "unidade", 600, "mL", "IV", "infusao_volume", { durationMinutes: 30 }), rx(2400, "concentrado_hemacias", "unidade", 600, "mL", "IV", "infusao_volume", { durationMinutes: 30 })], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-sf-excesso" }, description: "excesso de volume" }, { condition: { ruleFired: "r-transfusao-excesso" }, description: "transfusão liberal" }] },
    { id: "t-atraso", kind: "delay", description: "Terlipressina e sangue só após o choque", commands: [act(30, "acesso_venoso"), act(130, "acesso_venoso"), test(200, "hemograma"), rx(2600, "terlipressina", "fa1mg", 2, "mg", "IV"), rx(2650, "concentrado_hemacias", "unidade", 300, "mL", "IV", "infusao_volume", { durationMinutes: 30 }), act(2800, "solicitar_endoscopia")], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-choque" }, description: "choque pelo atraso" }, { condition: { not: { ruleFired: "r-pcr" } }, description: "PCR evitada" }, { condition: { ruleFired: "r-eda" }, description: "ligadura tardia" }] },
    { id: "t-alternativa", kind: "alternative", description: "Sangue primeiro, depois terlipressina e piperacilina-tazobactam", commands: [act(20, "acesso_venoso"), act(120, "acesso_venoso"), rx(220, "concentrado_hemacias", "unidade", 300, "mL", "IV", "infusao_volume", { durationMinutes: 30 }), rx(260, "terlipressina", "fa1mg", 2, "mg", "IV"), rx(300, "piperacilina_tazobactam", "fa45", 4500, "mg", "IV"), act(400, "solicitar_endoscopia"), dest(3000, "uti")], runUntilSeconds: 5000, expect: [{ condition: { ruleFired: "r-eda" }, description: "ligadura" }, { condition: { ruleFired: "r-atb" }, description: "antibiótico" }] }
  ]
};
