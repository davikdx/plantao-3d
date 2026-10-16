import type { CaseDefinitionInput } from "../../domain/schema";
import { act, ask, dest, dx, ex, flag, hi, obs, outcome, rx, staff, test, trend } from "./helpers";

const DESCOMPRESSAO = { actionCompleted: "descompressao_torax" };
const ADR = { drugGiven: "adrenalina", minTotal: { value: 1, unit: "mg" as const } };

export const C007: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "C007",
  version: "0.1.0",
  locale: "pt-BR",
  status: "technicallyTested",
  publicTitle: "Paciente intubado na sala vermelha piora de repente",
  teachingTitle: "AESP por pneumotórax hipertensivo em ventilação mecânica — causas reversíveis",
  group: "Reanimação, instabilidade e choque",
  specialties: ["Emergência", "Terapia intensiva"],
  environment: "emergencia",
  resourceProfile: "hospital-regional",
  difficulty: 4,
  level: "internato",
  objectives: [
    "Reconhecer deterioração aguda no paciente ventilado (DOPE)",
    "Identificar AESP e manter RCP de alta qualidade com adrenalina",
    "Buscar ativamente causas reversíveis (5H e 5T)",
    "Descomprimir pneumotórax hipertensivo e programar drenagem"
  ],
  keywords: ["intubado", "piorou", "saturação", "sem pulso", "alarme"],
  patient: {
    name: "Joaquim Batista",
    ageYears: 58,
    sex: "masculino",
    weightKg: 64,
    heightCm: 170,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 3, hairStyle: "curto", hairColor: "grisalho", build: "magro", pregnancyTrimester: 0 }
  },
  briefing: "Sala vermelha de hospital regional. Homem de 58 anos com DPOC grave, intubado há 3 horas por exacerbação, aguarda vaga de UTI. O ventilador alarma pressão alta e a técnica de enfermagem chama: a saturação está caindo.",
  communication: "incapaz",
  informants: [{ id: "enf", name: "Enfermeiro Paulo", role: "Enfermeiro da sala vermelha" }],
  history: [
    hi("h-evento", "queixa", "O que aconteceu?", [{ source: "enf", text: "Ele estava estável. Há 2 minutos o ventilador começou a alarmar pressão de pico alta e a saturação foi caindo." }], ["aconteceu", "houve"]),
    hi("h-procedimentos", "antecedentes", "Fizeram algum procedimento nele?", [{ source: "enf", text: "Puncionaram um acesso central na subclávia direita há 40 minutos. O raio-X de controle ainda não foi feito." }], ["procedimento", "acesso", "central", "punção"]),
    hi("h-ventilador", "medicacoes", "Quais os parâmetros do ventilador? Mudaram algo?", [{ source: "enf", text: "Volume controlado, 450 mL, frequência 14, PEEP 5. Ninguém mexeu." }], ["ventilador", "parâmetros", "peep"]),
    hi("h-tubo", "sinais_alarme", "O tubo pode ter deslocado ou obstruído?", [{ source: "enf", text: "A fixação está no mesmo lugar (22 cm na rima). Aspirei há 10 minutos, pouca secreção." }], ["tubo", "deslocou", "obstruído", "aspirou"])
  ],
  initial: {
    vars: { hr: 132, sbp: 74, dbp: 42, rr: 14, spo2: 78, temp: 36.8, gcs: 3, glucose: 142, perfusion: 0.35, effort: 0, etco2: 28, ph: 7.22, pco2: 68, hco3: 28, lactate: 3.2, k: 4.3 },
    flags: { rhythm: "taquicardia_sinusal", pulse: true, consciousness: "irresponsivo", speech: "nenhuma", airway: "protegida", communication: "incapaz", posture: "supino", cyanosis: true },
    devices: ["tot", "monitor_ecg", "oximetro", "manguito", "acesso_central", "capnografo"],
    visibleWithoutDevice: ["rr"]
  },
  exam: [
    ex("e-torax-insp", "torax_anterior", "inspecao", "Hemitórax direito hiperexpandido e com menor expansibilidade; enfisema subcutâneo na região infraclavicular direita.", { better: [{ when: DESCOMPRESSAO, text: "Expansibilidade simétrica após descompressão; enfisema subcutâneo discreto." }] }),
    ex("e-torax-ausc", "torax_anterior", "ausculta", "Murmúrio abolido à direita; sibilos à esquerda.", { sound: "murmurio_abolido", better: [{ when: DESCOMPRESSAO, text: "Murmúrio presente bilateralmente, diminuído à direita." }] }),
    ex("e-torax-perc", "torax_anterior", "percussao", "Hipertimpanismo à direita.", {}),
    ex("e-traqueia", "pescoco", "palpacao", "Traqueia desviada para a esquerda; jugulares túrgidas.", { label: "Traqueia e jugulares" }),
    ex("e-pulso", "membro_superior_d", "palpacao", "Pulso femoral/carotídeo fino.", { label: "Pulso central", better: [{ when: { ruleFired: "r-aesp" }, text: "Sem pulso carotídeo palpável em 10 s." }, { when: { any: [{ ruleFired: "r-rosc" }, { ruleFired: "r-alivio-precoce" }] }, text: "Pulso carotídeo presente e cheio." }] })
  ],
  testResults: [
    { testId: "pocus_pulmonar", variants: [{ when: DESCOMPRESSAO, text: "Deslizamento pleural presente à esquerda; à direita, ponto pulmonar identificado." }, { text: "Ausência de deslizamento pleural e de linhas B no hemitórax direito; sinal do código de barras no modo M. Deslizamento presente à esquerda." }] },
    { testId: "ecg12", variants: [{ text: "Taquicardia sinusal com complexos estreitos. Não interrompa a RCP para ECG de 12 derivações.", ecg: { rhythm: "taquicardia_sinusal", rate: 128, stElevationLeads: [], stDepressionLeads: [], peakedT: false, wideQrs: false } }] }
  ],
  highlightedActions: ["chamar_ajuda", "rcp", "checar_ritmo_pulso", "descompressao_torax", "drenagem_torax", "ventilar_bvm"],
  rules: [
    { id: "r-alivio-precoce", description: "Descompressão antes da PCR: hemodinâmica e oxigenação melhoram", priority: 80, when: { all: [DESCOMPRESSAO, { not: { ruleFired: "r-aesp" } }] }, repeat: "once", effects: [trend("sbp", 112, 120, "alivio", 80), trend("dbp", 64, 120, "alivio", 80), trend("hr", 104, 120, "alivio", 80), trend("spo2", 92, 120, "alivio", 80), trend("etco2", 44, 120, "alivio", 80), flag("cyanosis", false), outcome("melhora")] },
    { id: "r-aesp", description: "Sem descompressão em 90 s: AESP", priority: 90, when: { all: [{ time: "gte", seconds: 90 }, { not: DESCOMPRESSAO }] }, repeat: "once", effects: [flag("pulse", false), { type: "setValue", var: "sbp", value: 0 }, { type: "setValue", var: "dbp", value: 0 }, trend("hr", 110, 60, "aesp", 90), trend("spo2", 62, 120, "aesp", 90), trend("etco2", 10, 60, "aesp", 90), trend("perfusion", 0.05, 60, "aesp", 90), staff("enfermagem", "Não sinto pulso! O monitor mostra ritmo organizado."), outcome("parada")] },
    { id: "r-rcp-efeito", description: "Compressões geram perfusão mínima", when: { all: [{ actionStarted: "rcp" }, { ruleFired: "r-aesp" }] }, repeat: "once", effects: [trend("etco2", 16, 30, "rcp", 95), trend("perfusion", 0.15, 30, "rcp", 95)] },
    { id: "r-rosc", description: "RCE após descompressão em vigência de RCP", priority: 100, when: { all: [{ ruleFired: "r-aesp" }, DESCOMPRESSAO, { actionStarted: "rcp" }] }, repeat: "once", effects: [flag("pulse", true), { type: "setValue", var: "sbp", value: 88 }, { type: "setValue", var: "dbp", value: 50 }, trend("sbp", 104, 180, "rosc", 100), trend("dbp", 60, 180, "rosc", 100), trend("hr", 112, 120, "rosc", 100), trend("spo2", 90, 180, "rosc", 100), trend("etco2", 42, 60, "rosc", 100), trend("perfusion", 0.55, 180, "rosc", 100), staff("enfermagem", "Voltou o pulso depois da descompressão!"), outcome("rosc")] },
    { id: "r-adrenalina-sem-causa", description: "Adrenalina sem tratar a causa: sem RCE sustentado", when: { all: [{ ruleFired: "r-aesp" }, ADR, { not: DESCOMPRESSAO }] }, repeat: "once", effects: [obs("Adrenalina administrada; o ritmo organizado persiste sem pulso. Causa reversível ainda não tratada.")] },
    { id: "r-choque-aesp", description: "Desfibrilação em AESP: ritmo não chocável", when: { all: [{ actionCompleted: "desfibrilar" }, { ruleFired: "r-aesp" }] }, repeat: "once", effects: [obs("Choque aplicado em ritmo não chocável (AESP): sem benefício e interrompeu compressões.")] },
    { id: "r-drenagem", description: "Drenagem torácica definitiva", when: { actionCompleted: "drenagem_torax" }, repeat: "once", effects: [obs("Dreno torácico em selo d'água à direita: oscilação e borbulhamento presentes.")] },
    { id: "r-obito", description: "Sem tratar a causa em 12 min: óbito (decisão didática)", priority: 110, when: { all: [{ time: "gte", seconds: 720 }, { not: DESCOMPRESSAO }] }, repeat: "once", effects: [flag("rhythm", "assistolia"), { type: "setValue", var: "hr", value: 0 }, staff("supervisor", "Após 12 minutos de RCP sem tratar a causa e evolução para assistolia, a equipe encerra os esforços."), outcome("obito", true)] }
  ],
  diagnosis: { primary: "pneumotorax_hipertensivo", accepted: ["pneumotorax_hipertensivo", "pcr_aesp"], differentials: ["pcr_aesp", "tamponamento", "tep", "dpoc_exacerbado", "choque_hipovolemico"] },
  acceptedDestinations: ["uti"],
  outcomeNotes: "Pneumotórax hipertensivo iatrogênico (punção de subclávia) em paciente ventilado com DPOC. Descompressão antes da PCR evita a AESP; após a PCR, o RCE só ocorre com descompressão em vigência de RCP. Adrenalina sem tratar a causa não reverte. Drenagem torácica após a descompressão.",
  scoring: [
    { id: "s-contexto", domain: "historia", description: "Investigou procedimento recente e problemas de tubo/ventilador", evidence: { kind: "historyAsked", items: ["h-procedimentos", "h-tubo", "h-ventilador"], minCount: 2 }, points: 8, severity: "critica", rationale: "DOPE: deslocamento, obstrução, pneumotórax, equipamento." },
    { id: "s-exame", domain: "historia", description: "Examinou tórax e traqueia", evidence: { kind: "examDone", regions: ["torax_anterior", "pescoco"], minCount: 2 }, points: 8, severity: "critica", rationale: "Assimetria, hipertimpanismo e desvio de traqueia sugerem pneumotórax hipertensivo." },
    { id: "s-rcp", domain: "priorizacao", description: "RCP iniciada em até 1 minuto da AESP", evidence: { kind: "stateAtEnd", when: { any: [{ ruleFired: "r-alivio-precoce" }, { all: [{ ruleFired: "r-aesp" }, { actionStarted: "rcp" }] }] } }, points: 10, severity: "critica", rationale: "AESP exige compressões imediatas.", sourceIds: ["INT-AHA-ALS"] },
    { id: "s-ajuda", domain: "priorizacao", description: "Chamou ajuda", evidence: { kind: "actionDone", anyOf: ["chamar_ajuda"], withinSeconds: 120 }, points: 4, severity: "importante", rationale: "Equipe para RCP e procedimentos simultâneos." },
    { id: "s-pocus", domain: "exames", description: "POCUS pulmonar sem interromper a RCP / sem atrasar a descompressão", evidence: { kind: "testsNotExcessive", maxUnjustified: 0, justified: ["pocus_pulmonar", "pocus_cardiaco", "gaso_arterial", "eletrolitos"] }, points: 8, severity: "menor", rationale: "O diagnóstico é clínico; exames não devem atrasar a descompressão." },
    { id: "s-descompressao", domain: "tratamento", description: "Descompressão torácica em até 3 minutos", evidence: { kind: "actionDone", anyOf: ["descompressao_torax"], withinSeconds: 180 }, points: 16, severity: "critica", rationale: "Tratar a causa reversível é o que permite o RCE.", sourceIds: ["INT-AHA-ALS", "BR-SAMU-SAV"] },
    { id: "s-adrenalina", domain: "tratamento", description: "Adrenalina 1 mg na AESP", evidence: { kind: "drugGiven", anyOf: ["adrenalina"], routes: ["IV", "IO"] }, points: 5, severity: "importante", rationale: "Ritmo não chocável: adrenalina o mais cedo possível.", sourceIds: ["INT-AHA-ALS"] },
    { id: "s-choque", domain: "tratamento", description: "Falha: desfibrilação em ritmo não chocável", evidence: { kind: "stateAtEnd", when: { ruleFired: "r-choque-aesp" } }, points: 6, penalty: true, severity: "importante", rationale: "AESP não é chocável." },
    { id: "s-drenagem", domain: "reavaliacao", description: "Drenagem torácica após descompressão", evidence: { kind: "reassessAfter", after: ["descompressao_torax"], reassess: ["drenagem_torax"], withinSeconds: 1800 }, points: 10, severity: "importante", rationale: "Descompressão por agulha é temporária.", sourceIds: ["BR-SAMU-SAV"] },
    { id: "s-reav", domain: "reavaliacao", description: "Reavaliou pulso/ritmo nos ciclos", evidence: { kind: "actionDone", anyOf: ["checar_ritmo_pulso"] }, points: 6, severity: "importante", rationale: "Confirmar RCE." },
    { id: "s-dx", domain: "destino", description: "Identificou pneumotórax hipertensivo como causa", evidence: { kind: "diagnosis", accepted: ["pneumotorax_hipertensivo"] }, points: 6, severity: "importante", rationale: "Causa reversível (T)." },
    { id: "s-destino", domain: "destino", description: "Destino: UTI", evidence: { kind: "disposition", accepted: ["uti"] }, points: 4, severity: "importante", rationale: "Paciente ventilado pós-PCR." }
  ],
  teaching: {
    hints: [
      { level: 1, text: "Paciente intubado piorou: o que pode ter acontecido com tubo, ventilador ou pulmão?" },
      { level: 2, text: "Houve algum procedimento recente perto do tórax?" },
      { level: 3, text: "Compare os dois hemitórax e procure a traqueia." },
      { level: 4, text: "Sugestão explícita: RCP se sem pulso, adrenalina, descompressão por agulha à direita e depois drenagem torácica." }
    ],
    summary: "Homem de 58 anos com DPOC, intubado, evolui com pneumotórax hipertensivo após punção de subclávia direita, hipotensão e AESP.",
    pathophysiology: "Ar entra no espaço pleural a cada inspiração com pressão positiva e não sai (mecanismo valvular). A pressão intratorácica sobe, desvia o mediastino e colaba o retorno venoso: débito cai até a AESP. Só a descompressão restaura o retorno venoso.",
    keyPoints: [
      "Paciente ventilado que piora: DOPE (deslocamento, obstrução, pneumotórax, equipamento).",
      "AESP: RCP, adrenalina e busca ativa de 5H/5T.",
      "Pneumotórax hipertensivo é diagnóstico clínico; não aguardar raio-X.",
      "Descompressão por agulha seguida de drenagem torácica."
    ],
    alternatives: ["Toracostomia digital em ambientes treinados.", "Desconectar do ventilador e ventilar com bolsa para avaliar complacência."],
    oralRubric: [
      { id: "o1", concept: "DOPE / causas reversíveis", synonyms: ["dope", "5h", "5t", "causas reversíveis"], weight: 2 },
      { id: "o2", concept: "RCP e adrenalina", synonyms: ["rcp", "compressões", "adrenalina"], weight: 2 },
      { id: "o3", concept: "Descompressão", synonyms: ["descompressão", "agulha", "punção"], weight: 3 },
      { id: "o4", concept: "Drenagem", synonyms: ["dreno", "drenagem"], weight: 1 }
    ],
    simplifications: ["Tempo até a AESP (90 s) e óbito aos 12 min são decisões didáticas do autor.", "RCE ocorre deterministicamente após descompressão com RCP em curso."]
  },
  references: ["INT-AHA-ALS", "BR-SAMU-SAV", "AUTOR-SIMPLIFICACAO"],
  variation: { allowAgeShiftYears: 10, allowSexSwap: true, allowWeightPercent: 10, allowVisualVariation: true, forbidden: [] },
  tests: [
    { id: "t-aceitavel", kind: "acceptable", description: "Exame, RCP, adrenalina, descompressão e drenagem", commands: [act(5, "chamar_ajuda"), ask(20, "h-procedimentos"), { atSeconds: 40, type: "examine", payload: { region: "torax_anterior", maneuver: "ausculta" } }, act(95, "rcp"), rx(110, "adrenalina", "amp1mg", 1, "mg", "IV"), act(120, "descompressao_torax"), act(240, "checar_ritmo_pulso"), act(300, "drenagem_torax"), dx(900, "pneumotorax_hipertensivo"), dest(900, "uti")], runUntilSeconds: 1000, expect: [{ condition: { ruleFired: "r-rosc" }, description: "RCE" }, { condition: { not: { ruleFired: "r-obito" } }, description: "sem óbito" }] },
    { id: "t-sem-intervencao", kind: "no_intervention", description: "Sem conduta", commands: [], runUntilSeconds: 800, expect: [{ condition: { ruleFired: "r-aesp" }, description: "AESP" }, { condition: { ruleFired: "r-obito" }, description: "óbito" }] },
    { id: "t-inadequada", kind: "inadequate", description: "RCP, adrenalina e choques sem tratar a causa", commands: [act(95, "rcp"), act(100, "pas_desfibrilador"), rx(120, "adrenalina", "amp1mg", 1, "mg", "IV"), act(200, "desfibrilar", { energia: 200 }), rx(400, "adrenalina", "amp1mg", 1, "mg", "IV")], runUntilSeconds: 800, expect: [{ condition: { ruleFired: "r-adrenalina-sem-causa" }, description: "sem RCE" }, { condition: { ruleFired: "r-choque-aesp" }, description: "choque inadequado" }, { condition: { ruleFired: "r-obito" }, description: "óbito" }] },
    { id: "t-atraso", kind: "delay", description: "Descompressão só aos 8 min de RCP", commands: [act(95, "rcp"), rx(120, "adrenalina", "amp1mg", 1, "mg", "IV"), act(480, "descompressao_torax")], runUntilSeconds: 900, expect: [{ condition: { ruleFired: "r-rosc" }, description: "RCE tardio" }] },
    { id: "t-alternativa", kind: "alternative", description: "Descompressão antes da PCR", commands: [{ atSeconds: 20, type: "examine", payload: { region: "pescoco", maneuver: "palpacao" } }, act(40, "descompressao_torax"), act(200, "drenagem_torax"), dest(600, "uti")], runUntilSeconds: 700, expect: [{ condition: { ruleFired: "r-alivio-precoce" }, description: "AESP evitada" }, { condition: { not: { ruleFired: "r-aesp" } }, description: "sem PCR" }] }
  ]
};
