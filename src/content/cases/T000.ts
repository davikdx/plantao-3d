import type { CaseDefinitionInput } from "../../domain/schema";

/**
 * Caso TÉCNICO (não clínico): variável abstrata "level", ações medir/aguardar/encerrar.
 * Exercita atraso de resultado, tendência temporal, pausa, repetição, cancelamento e replay.
 * Não conta entre os 120 casos clínicos.
 */
export const T000: CaseDefinitionInput = {
  schemaVersion: 1,
  id: "T000",
  version: "1.0.0",
  locale: "pt-BR",
  status: "technicallyTested",
  technical: true,
  publicTitle: "Caso técnico de teste do motor",
  teachingTitle: "Caso técnico de teste do motor (variável abstrata)",
  group: "Técnico",
  specialties: ["Técnico"],
  environment: "emergencia",
  resourceProfile: "upa-porte-ii",
  difficulty: 1,
  level: "internato",
  objectives: ["Verificar coleta, atraso, tendência e replay"],
  patient: {
    name: "Manequim técnico",
    ageYears: 30,
    sex: "masculino",
    weightKg: 70,
    heightCm: 175,
    visual: { ageGroup: "adulto", sex: "masculino", skinTone: 3, hairStyle: "curto", hairColor: "castanho", build: "medio", pregnancyTrimester: 0 }
  },
  briefing: "Cenário técnico sem conteúdo clínico. Use 'Coleta técnica' e 'Iniciar tendência'.",
  communication: "normal",
  history: [{ id: "h-demo", topic: "outros", question: "Pergunta técnica", answers: [{ source: "paciente", text: "Resposta técnica." }] }],
  initial: { vars: { level: 0, rr: 16, hr: 70, spo2: 98, sbp: 120, dbp: 80 }, flags: {}, devices: [], visibleWithoutDevice: ["rr"] },
  rules: [
    {
      id: "r-demo-trend",
      description: "Inicia tendência de level para 10 com tau 2 s",
      when: { actionCompleted: "demo_iniciar_tendencia" },
      repeat: "once",
      effects: [{ type: "trendToTarget", var: "level", target: 10, tauSeconds: 2, slot: "demo", priority: 10 }]
    },
    {
      id: "r-demo-stop",
      description: "Encerra a tendência quando solicitado",
      when: { actionCompleted: "demo_parar_tendencia" },
      repeat: "once",
      effects: [{ type: "clearTrend", var: "level", slot: "demo" }]
    },
    {
      id: "r-demo-missing-ref",
      description: "Condição dependente de evento inexistente (deve permanecer falsa)",
      when: { elapsedSince: "action:acao_inexistente", op: "gte", seconds: 0 },
      repeat: "once",
      effects: [{ type: "setFlag", flag: "demoFlag", value: true }]
    }
  ],
  diagnosis: { primary: "sincope", accepted: ["sincope"] },
  acceptedDestinations: ["observacao"],
  outcomeNotes: "Sem desfecho clínico.",
  scoring: [
    { id: "s-demo", domain: "exames", description: "Coleta técnica realizada", evidence: { kind: "testOrdered", anyOf: ["demo_coleta"] }, points: 10, severity: "menor", rationale: "Verificação de software." }
  ],
  teaching: { summary: "Caso técnico.", pathophysiology: "Não se aplica.", keyPoints: ["Teste de software"] },
  references: ["AUTOR-SIMPLIFICACAO"]
};
