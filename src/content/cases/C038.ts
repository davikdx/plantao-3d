import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, h, obs, outcome, rx, staff, test, trend } from "./helpers";

const ATB = { any: [{ drugGiven: "ceftriaxona" }, { drugGiven: "doxiciclina" }] };
const VOL = (ml: number) => ({ any: [{ drugGiven: "sf09", minTotal: { value: ml, unit: "mL" as const } }, { drugGiven: "ringer_lactato", minTotal: { value: ml, unit: "mL" as const } }] });
const VENTILADO = { all: [{ deviceActive: "tot" }, { actionCompleted: "ventilacao_mecanica" }] };

export const C038: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C038",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Febre, dor nas batatas da perna e olhos amarelos depois da enchente",
  teachingTitle: "Leptospirose grave (síndrome de Weil) com risco de hemorragia pulmonar",
  group: "Infectologia",
  specialties: ["Infectologia", "Nefrologia", "Terapia intensiva"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 4,
  level: "residencia",
  objectives: [
    "Investigar exposição a enchente/esgoto e roedores",
    "Reconhecer a forma grave: icterícia, lesão renal, plaquetopenia e acometimento pulmonar",
    "Iniciar antibiótico IV na suspeita, sem aguardar confirmação",
    "Manejar hidratação e potássio na lesão renal não oligúrica",
    "Antecipar hemorragia pulmonar e indicar UTI; notificar"
  ],
  keywords: ["febre", "enchente", "dor na panturrilha", "olho amarelo", "urina escura", "rato"],
  patient: {
    name: "Josué Batista",
    ageYears: 38,
    sex: "masculino",
    weightKg: 74,
    heightCm: 172,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 5, hairStyle: "crespo_curto", hairColor: "preto", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "Pronto-socorro de hospital regional, duas semanas após enchentes na cidade. Homem de 38 anos com febre há 6 dias, dor muscular intensa nas pernas, olhos amarelados e tosse com raias de sangue desde ontem.",
  communication: "normal",
  history: [
    h("h-queixa", "queixa", "O que o senhor está sentindo?", "Febre, uma dor muito forte nas batatas das pernas, os olhos ficaram amarelos e hoje cuspi um pouco de sangue.", { keywords: ["sentindo"] }),
    h("h-exposicao", "exposicao", "Teve contato com água de enchente, lama ou esgoto?", "Trabalhei três dias limpando a casa e a rua depois da enchente, com água até o joelho, sem bota. Tinha muito rato.", { keywords: ["enchente", "lama", "esgoto", "água", "rato"] }),
    h("h-inicio", "inicio", "Quando começou a febre?", "Faz seis dias. Melhorou um pouco e voltou pior.", { keywords: ["começou", "quando"] }),
    h("h-urina", "alimentacao_eliminacoes", "Como está a urina?", "Bem escura, cor de coca-cola, mas urino normal.", { keywords: ["urina", "urinando", "xixi"] }),
    h("h-respiracao", "sinais_alarme", "Está com falta de ar? Quanto sangue saiu na tosse?", "Fico cansado ao falar muito. Saiu umas raias de sangue no catarro.", { keywords: ["falta de ar", "sangue", "tosse"] }),
    h("h-medicacoes", "medicacoes", "Tomou algum remédio?", "Paracetamol e um anti-inflamatório que comprei na farmácia.", { keywords: ["remédio", "tomou"] }),
    h("h-antecedentes", "antecedentes", "Tem alguma doença?", "Nenhuma.", { keywords: ["doença"] }),
    h("h-alergias", "alergias", "Tem alergia a algum remédio?", "Não.")
  ],
  initial: {
    vars: { hr: 112, sbp: 104, dbp: 62, rr: 26, spo2: 93, temp: 38.6, gcs: 15, pain: 7, glucose: 104, perfusion: 0.7, effort: 1.2, bili: 14, ast: 120, alt: 90, cpk: 3200, creat: 3.4, urea: 160, k: 3.1, na: 132, plt: 62000, wbc: 14000, hb: 11.5, ht: 34, inr: 1.4, lactate: 2.2, urine: 40, ph: 7.34, pco2: 32, hco3: 18 },
    flags: { rhythm: "taquicardia_sinusal", jaundice: true, cough: true, painVisual: "moderada", posture: "sentado" },
    devices: [],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-geral", "geral", "inspecao", "Icterícia rubínica (amarelo-avermelhada), sufusão conjuntival, taquipneico.", {}),
    ex("e-olhos", "olhos", "inspecao", "Esclerótica ictérica com sufusão hemorrágica conjuntival bilateral.", {}),
    ex("e-panturrilha", "membro_inferior_d", "palpacao", "Dor intensa à palpação das panturrilhas, sem empastamento ou assimetria.", { label: "Panturrilhas" }),
    ex("e-pulmao", "torax_posterior", "ausculta", "Estertores crepitantes difusos bilaterais.", { sound: "estertores", better: [{ when: { ruleFired: "r-hemorragia-pulmonar" }, text: "Estertores difusos grosseiros; secreção sanguinolenta pela boca." }] }),
    ex("e-abdome", "abdome_qsd", "palpacao", "Fígado palpável a 2 cm do rebordo, doloroso.", {}),
    ex("e-pele", "pele", "inspecao", "Petéquias em membros inferiores.", {})
  ],
  testResults: [
    { testId: "rx_torax", variants: [{ when: { ruleFired: "r-hemorragia-pulmonar" }, text: "Laudo educativo: infiltrado alveolar bilateral difuso, compatível com hemorragia pulmonar." }, { text: "Laudo educativo: infiltrado alveolar bilateral em bases (padrão de hemorragia alveolar incipiente)." }] },
    { testId: "teste_rapido_dengue", variants: [{ text: "NS1 e IgM não reagentes." }] },
    { testId: "urina_tipo1", variants: [{ text: "Bilirrubinúria, proteinúria leve, hematúria discreta, cilindros granulosos." }] },
    { testId: "hemocultura", variants: [{ text: "Coletada; resultado em 48–72 h. Confirmação de leptospirose por sorologia (ELISA IgM/microaglutinação) em laboratório de referência." }] }
  ],
  highlightedActions: ["monitorizar", "acesso_venoso", "o2_cateter", "diurese_horaria", "notificacao"],
  rules: [
    { id: "r-atb", description: "Antibiótico na suspeita: início de resposta (lenta; horas comprimidas)", priority: 50, when: { all: [ATB, { elapsedSince: "drug:ceftriaxona", op: "gte", seconds: 1800 }] }, repeat: "once", effects: [trend("temp", 37.8, 3600, "atb", 50), trend("pain", 4, 3600, "atb", 50), outcome("estabilizacao_parcial")] },
    { id: "r-doxi-grave", description: "Doxiciclina oral na forma grave: escolha inadequada para fase tardia/grave", priority: 40, when: { all: [{ drugGiven: "doxiciclina" }, { not: { drugGiven: "ceftriaxona" } }] }, repeat: "once", effects: [obs("Forma grave/fase tardia: preferir antibiótico IV (penicilina cristalina, ampicilina, ceftriaxona ou cefotaxima).")] },
    { id: "r-hemorragia-pulmonar", description: "Sem antibiótico em 1 hora (modelo comprimido): hemorragia pulmonar", priority: 30, when: { all: [{ time: "gte", seconds: 3600 }, { not: { drugGiven: "ceftriaxona" } }] }, repeat: "once", effects: [trend("spo2", 80, 300, "hp", 30), trend("rr", 36, 300, "hp", 30), trend("effort", 2.7, 300, "hp", 30), trend("hr", 132, 300, "hp", 30), trend("hb", 9.2, 1800, "hp", 30), flag("cyanosis", true), flag("bleedingVisible", true), flag("speech", "palavras"), staff("enfermagem", "Ele está tossindo sangue vivo e a saturação despencou!"), outcome("complicacao")] },
    { id: "r-o2", description: "Oxigênio suplementar melhora parcialmente a hipoxemia (insuficiente na hemorragia pulmonar)", priority: 35, when: { any: [{ deviceActive: "cateter_nasal" }, { deviceActive: "mascara_reservatorio" }] }, repeat: "while", effects: [trend("spo2", 95, 120, "o2", 35)], onEnd: [{ type: "clearTrend", var: "spo2", slot: "o2" }] },
    { id: "r-vm", description: "Intubação e ventilação mecânica protetora estabilizam a oxigenação na hemorragia pulmonar", priority: 60, when: { all: [{ ruleFired: "r-hemorragia-pulmonar" }, VENTILADO] }, repeat: "once", effects: [trend("spo2", 92, 300, "vm", 60), trend("effort", 0.5, 300, "vm", 60), flag("cyanosis", false), outcome("estabilizacao_parcial")] },
    { id: "r-volume", description: "Hidratação cautelosa melhora perfusão renal", priority: 30, when: VOL(1000), repeat: "once", effects: [trend("creat", 2.9, 5400, "vol", 30), trend("urine", 60, 3600, "vol", 30), trend("sbp", 112, 900, "vol", 30)] },
    { id: "r-hiper", description: "Hiper-hidratação com acometimento pulmonar: piora respiratória", priority: 70, when: VOL(3500), repeat: "once", effects: [trend("spo2", 86, 600, "hiper", 70, 3600), trend("effort", 2.2, 600, "hiper", 70, 3600), obs("Mais estertores após grande volume: o pulmão está acometido.")] },
    { id: "r-kcl", description: "Reposição de potássio na lesão renal não oligúrica com hipocalemia", priority: 40, when: { drugGiven: "kcl", minTotal: { value: 5, unit: "mEq" } }, repeat: "once", effects: [trend("k", 3.8, 1800, "kcl", 40)] },
    { id: "r-hipok", description: "Hipocalemia progride sem reposição (perda renal)", priority: 20, when: { all: [{ time: "gte", seconds: 2700 }, { not: { drugGiven: "kcl" } }] }, repeat: "once", effects: [trend("k", 2.7, 3600, "hipok", 20), obs("Fraqueza muscular aumentando.")] },
    { id: "r-notificacao", description: "Vigilância notificada", when: { actionCompleted: "notificacao" }, repeat: "once", effects: [staff("supervisor", "Notificação imediata registrada; vigilância orienta coleta de soro para sorologia e investigação da área atingida pela enchente.")] }
  ],
  diagnosis: { primary: "leptospirose", accepted: ["leptospirose"], differentials: ["dengue_alarme", "febre_maculosa", "sepse", "hepatite_viral_aguda", "colecistite"] },
  acceptedDestinations: ["uti"],
  outcomeNotes: "Exposição a enchente + mialgia de panturrilhas + icterícia rubínica + lesão renal com hipocalemia + plaquetopenia + infiltrado alveolar: leptospirose grave. Antibiótico IV na suspeita, hidratação cautelosa, reposição de potássio, oxigênio e UTI pelo risco de hemorragia pulmonar (principal causa de óbito). Notificação imediata.",
  scoring: [
    { id: "s-exposicao", domain: "historia", description: "Perguntou sobre exposição a enchente/lama/roedores", evidence: { kind: "historyAsked", items: ["h-exposicao"], minCount: 1 }, points: 10, severity: "critica", rationale: "A exposição é a chave do diagnóstico.", sourceIds: ["BR-LEPTO-PR"] },
    { id: "s-alarme", domain: "historia", description: "Pesquisou sinais de alerta (hemoptise, dispneia, urina)", evidence: { kind: "historyAsked", items: ["h-respiracao", "h-urina"], minCount: 2 }, points: 6, severity: "importante", rationale: "Comprometimento pulmonar pode evoluir rapidamente para óbito.", sourceIds: ["BR-LEPTO-PR"] },
    { id: "s-exame", domain: "historia", description: "Examinou conjuntivas, panturrilhas e pulmões", evidence: { kind: "examDone", regions: ["olhos", "membro_inferior_d", "torax_posterior", "geral"], minCount: 2 }, points: 6, severity: "importante", rationale: "Sufusão conjuntival, mialgia de panturrilhas e estertores." },
    { id: "s-atb", domain: "priorizacao", description: "Antibiótico IV na suspeita, em até 1 hora", evidence: { kind: "drugGiven", anyOf: ["ceftriaxona"], routes: ["IV"], withinSeconds: 3600 }, points: 16, severity: "critica", rationale: "Iniciar na suspeita clínica; forma tardia/grave: penicilina cristalina, ampicilina, ceftriaxona ou cefotaxima.", alternatives: "Penicilina cristalina/ampicilina/cefotaxima (não presentes no catálogo desta versão).", sourceIds: ["BR-LEPTO-PR", "BR-LEPTO-MS"] },
    { id: "s-o2", domain: "priorizacao", description: "Oxigênio e monitorização", evidence: { kind: "actionDone", anyOf: ["o2_cateter", "o2_mascara_reservatorio", "monitorizar"], withinSeconds: 900 }, points: 6, severity: "importante", rationale: "SpO₂ 93% com infiltrado alveolar." },
    { id: "s-exames", domain: "exames", description: "Função renal, eletrólitos, hemograma e radiografia", evidence: { kind: "testOrdered", anyOf: ["funcao_renal", "eletrolitos", "hemograma", "rx_torax"] }, points: 6, severity: "importante", rationale: "Definir gravidade: creatinina, potássio, plaquetas, pulmão." },
    { id: "s-exames-excesso", domain: "exames", description: "Exames dirigidos", evidence: { kind: "testsNotExcessive", maxUnjustified: 2, justified: ["funcao_renal", "eletrolitos", "hemograma", "rx_torax", "hepatograma", "cpk", "coagulograma", "gaso_arterial", "gaso_venosa", "urina_tipo1", "teste_rapido_dengue", "hemocultura"] }, points: 4, severity: "menor", rationale: "Diferenciais (dengue) e gravidade." },
    { id: "s-kcl", domain: "tratamento", description: "Repôs potássio", evidence: { kind: "drugGiven", anyOf: ["kcl"] }, points: 6, severity: "importante", rationale: "A lesão renal da leptospirose costuma ser não oligúrica e hipocalêmica." },
    { id: "s-volume", domain: "tratamento", description: "Hidratação venosa cautelosa", evidence: { kind: "drugGiven", anyOf: ["sf09", "ringer_lactato"], minTotal: { value: 500, unit: "mL" } }, points: 6, severity: "importante", rationale: "Corrigir hipovolemia sem sobrecarregar o pulmão." },
    { id: "s-hiper", domain: "tratamento", description: "Falha: hiper-hidratação com pulmão acometido", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-hiper" } }, points: 6, penalty: true, severity: "importante", rationale: "Piora a troca gasosa." },
    { id: "s-reav", domain: "reavaliacao", description: "Monitorizou diurese e oxigenação", evidence: { kind: "actionDone", anyOf: ["diurese_horaria", "monitorizar"] }, points: 8, severity: "importante", rationale: "Detecção precoce de hemorragia pulmonar e necessidade de diálise." },
    { id: "s-notificacao", domain: "destino", description: "Notificação imediata", evidence: { kind: "actionDone", anyOf: ["notificacao"] }, points: 4, severity: "importante", rationale: "Agravo de notificação imediata.", sourceIds: ["BR-LEPTO-PR"] },
    { id: "s-dx", domain: "destino", description: "Hipótese de leptospirose grave", evidence: { kind: "diagnosis", accepted: ["leptospirose"] }, points: 6, severity: "importante", rationale: "Tríade de Weil: icterícia, insuficiência renal, hemorragia." },
    { id: "s-destino", domain: "destino", description: "UTI", evidence: { kind: "disposition", accepted: ["uti"] }, points: 10, severity: "critica", rationale: "Forma pulmonar pode evoluir para óbito em 24 h; internação imediata.", sourceIds: ["BR-LEPTO-PR"] }
  ],
  teaching: {
    hints: [
      { level: 1, text: "O que aconteceu na cidade nas últimas semanas?" },
      { level: 2, text: "Icterícia + rim + pulmão + dor nas panturrilhas: qual zoonose?" },
      { level: 3, text: "Vasculite com hemorragia alveolar; nefrite intersticial com perda de potássio." },
      { level: 4, text: "Sugestão explícita: ceftriaxona IV já, oxigênio, hidratação cautelosa, KCl, notificar e UTI." }
    ],
    summary: "Homem de 38 anos que limpou a casa após enchente evolui com febre, mialgia de panturrilhas, icterícia rubínica, lesão renal não oligúrica com hipocalemia, plaquetopenia e hemoptise: leptospirose grave.",
    pathophysiology: "Leptospira penetra pela pele lesada ou mucosas em contato com água contaminada por urina de roedores, dissemina-se e causa vasculite. Na fase tardia, há colestase (icterícia rubínica), nefrite intersticial com perda de potássio, plaquetopenia e capilarite pulmonar com hemorragia alveolar — principal causa de óbito.",
    keyPoints: [
      "Pensar em leptospirose após enchentes, com mialgia de panturrilhas e sufusão conjuntival.",
      "Antibiótico na suspeita clínica; formas graves: IV.",
      "Lesão renal geralmente não oligúrica e hipocalêmica: repor potássio.",
      "Tosse com sangue/dispneia = alerta para hemorragia pulmonar: UTI.",
      "Notificação imediata."
    ],
    alternatives: ["Penicilina cristalina, ampicilina ou cefotaxima (não modeladas no catálogo)."],
    oralRubric: [
      { id: "o1", concept: "Exposição a enchente", synonyms: ["enchente", "rato", "roedor", "lama"], weight: 2 },
      { id: "o2", concept: "Antibiótico IV imediato", synonyms: ["ceftriaxona", "penicilina", "antibiótico"], weight: 3 },
      { id: "o3", concept: "Potássio e rim", synonyms: ["potássio", "hipocalemia", "renal"], weight: 1 },
      { id: "o4", concept: "Hemorragia pulmonar e UTI", synonyms: ["hemorragia pulmonar", "uti", "pulmão"], weight: 2 },
      { id: "o5", concept: "Notificação", synonyms: ["notificação", "notificar"], weight: 1 }
    ],
    simplifications: ["Horas/dias de evolução foram comprimidos.", "Doses dos antibióticos devem ser conferidas no manual do MS (BR-LEPTO-MS, não acessado nesta versão)."]
  },
  references: ["BR-LEPTO-PR", "BR-LEPTO-MS", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 15, allowSexSwap: true, allowWeightPercent: 15, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Exposição, ceftriaxona, O₂, hidratação, KCl, notificação e UTI", commands: [ask(10, "h-exposicao"), ask(20, "h-respiracao"), act(40, "monitorizar"), act(50, "o2_cateter", { fluxo: 2 }), act(60, "acesso_venoso"), act(160, "acesso_venoso"), test(260, "funcao_renal"), test(270, "eletrolitos"), rx(400, "ceftriaxona", "fa1g", 1000, "mg", "IV"), rx(420, "sf09", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 }), rx(500, "kcl", "amp10", 20, "mEq", "IV", "infusao_volume", { durationMinutes: 120 }), act(600, "diurese_horaria"), act(900, "notificacao"), dx(3000, "leptospirose"), dest(3000, "uti")], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-atb" }, description: "resposta ao antibiótico" }, { condition: { not: { ruleFired: "r-hemorragia-pulmonar" } }, description: "sem hemorragia pulmonar" }, { condition: { path: "vars.k", op: "gte", value: 3.3 }, description: "K⁺ corrigido" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 4500, expect: [{ condition: { ruleFired: "r-hemorragia-pulmonar" }, description: "hemorragia pulmonar" }, { condition: { ruleFired: "r-hipok" }, description: "hipocalemia progride" }] },
    { id: "t-inadequada", kind: "inadequate", description: "Doxiciclina oral e alta/observação", commands: [rx(200, "doxiciclina", "cp100", 100, "mg", "VO"), dest(300, "observacao")], runUntilSeconds: 4200, expect: [{ condition: { ruleFired: "r-doxi-grave" }, description: "escolha inadequada" }, { condition: { ruleFired: "r-hemorragia-pulmonar" }, description: "hemorragia pulmonar" }] },
    { id: "t-atraso", kind: "delay", description: "Antibiótico após a hemorragia pulmonar; intubação e VM", commands: [act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(3800, "ceftriaxona", "fa1g", 1000, "mg", "IV"), act(3900, "intubacao"), act(4100, "intubacao"), act(4300, "ventilacao_mecanica")], runUntilSeconds: 6000, expect: [{ condition: { ruleFired: "r-hemorragia-pulmonar" }, description: "hemorragia pelo atraso" }, { condition: { ruleFired: "r-vm" }, description: "estabilização com VM" }] },
    { id: "t-alternativa", kind: "alternative", description: "Máscara com reservatório e Ringer lactato", commands: [act(50, "o2_mascara_reservatorio", { fluxo: 10 }), act(60, "acesso_venoso"), act(160, "acesso_venoso"), rx(400, "ceftriaxona", "fa1g", 2000, "mg", "IV"), rx(420, "ringer_lactato", "bolsa1000", 1000, "mL", "IV", "infusao_volume", { durationMinutes: 60 })], runUntilSeconds: 3600, expect: [{ condition: { ruleFired: "r-atb" }, description: "resposta" }, { condition: { not: { ruleFired: "r-hemorragia-pulmonar" } }, description: "sem hemorragia" }] }
  ]
};
