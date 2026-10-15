/**
 * Camada de "IA" — LOCAL por padrão. Não é conversação livre com IA:
 *  - StructuredLocalPatientAdapter: interpreta a pergunta por intenções/sinônimos e responde
 *    APENAS com fatos do caso que o paciente pode saber. Sem correspondência => diz que não entendeu.
 *  - StructuredTutorAdapter: dicas graduais conforme o modo; nunca revela gabarito em prova.
 *  - Adaptadores generativos: opcionais, via gateway próprio configurado (sem chave no APK).
 *    O texto gerado nunca altera o estado clínico; ordens viram rascunho para confirmação.
 */
import type { CaseDefinition, HistoryTopic } from "../domain/schema";
import { evaluate } from "../engine/conditions";
import type { SimState } from "../engine/types";

export interface PatientReply {
  kind: "resposta" | "nao_entendeu" | "incapaz" | "ordem_rascunho";
  itemId?: string;
  text: string;
  source?: string;
  draftOrder?: { drugHint?: string; actionHint?: string; raw: string };
}

const TOPIC_SYNONYMS: Record<HistoryTopic, string[]> = {
  queixa: ["sente", "sentindo", "queixa", "problema", "aconteceu", "trouxe", "motivo", "incomodando", "o que houve"],
  inicio: ["quando", "começou", "inicio", "início", "desde", "há quanto", "ha quanto", "tempo"],
  evolucao: ["piorando", "melhorando", "evolução", "evolucao", "mudou", "progrediu"],
  localizacao: ["onde", "local", "lugar", "aponta", "localização", "irradia"],
  intensidade: ["intensidade", "forte", "nota", "0 a 10", "zero a dez", "escala"],
  fatores_associados: ["mais alguma", "outros sintomas", "náusea", "nausea", "vômito", "vomito", "febre", "tosse", "acompanha"],
  fatores_melhora_piora: ["melhora", "piora", "alivia", "posição", "posicao", "esforço"],
  sinais_alarme: ["desmaio", "desmaiou", "convulsão", "sangue", "sangramento", "alarme"],
  antecedentes: ["doença", "doenca", "doenças", "pressão alta", "diabetes", "asma", "problema de saúde", "antecedente", "comorbidade"],
  cirurgias: ["cirurgia", "operou", "operado", "internação", "internado"],
  alergias: ["alergia", "alérgico", "alergico", "alérgica", "alergica", "reação a remédio"],
  medicacoes: ["remédio", "remedio", "medicação", "medicacao", "medicamento", "toma", "usa algum"],
  habitos: ["fuma", "cigarro", "bebe", "álcool", "alcool", "droga", "atividade física"],
  familia: ["família", "familia", "pai", "mãe", "mae", "irmão", "parentes"],
  social: ["mora", "trabalha", "trabalho", "casa", "sozinho", "apoio", "profissão"],
  gestacao: ["grávida", "gravida", "gravidez", "menstruação", "menstruacao", "gestação", "dum", "última menstruação"],
  ginecologico: ["corrimento", "relação", "anticoncepcional", "ciclo"],
  vacinacao: ["vacina", "vacinação", "cartão de vacina"],
  exposicao: ["comeu", "picada", "contato", "viagem", "enchente", "carrapato", "exposição", "exposicao", "tomou algo"],
  alimentacao_eliminacoes: ["mamando", "comendo", "xixi", "urina", "fralda", "fezes", "evacua", "diarreia", "diurese"],
  humor_risco: ["triste", "se matar", "suicídio", "suicidio", "morrer", "plano", "machucar", "esperança", "esperanca", "vontade de viver"],
  outros: []
};

const SPECIFIC_TOPICS = new Set<HistoryTopic>(["alergias", "gestacao", "humor_risco", "vacinacao", "cirurgias", "familia", "exposicao", "ginecologico"]);

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const ORDER_VERBS = ["faca", "faz", "da ", "de ", "aplica", "administra", "prescreve", "instala", "coloca", "pega um acesso", "intuba"];

export class StructuredLocalPatientAdapter {
  /** Retorna o item de história mais provável para a pergunta livre. */
  matchQuestion(question: string, c: CaseDefinition): { itemId: string; score: number } | null {
    const q = ` ${normalize(question)} `;
    let best: { itemId: string; score: number } | null = null;
    for (const item of c.history) {
      let score = 0;
      const syns = [...new Set(TOPIC_SYNONYMS[item.topic].map(normalize))];
      let topicHit = false;
      for (const syn of syns) if (q.includes(` ${syn}`)) {
        score += 2;
        topicHit = true;
      }
      // temas específicos vencem temas genéricos quando o termo característico aparece
      if (topicHit && SPECIFIC_TOPICS.has(item.topic)) score += 3;
      for (const kw of [...new Set(item.keywords.map(normalize))]) if (q.includes(kw)) score += 3;
      const words = normalize(item.question).split(" ").filter((w) => w.length > 4);
      for (const w of words) if (q.includes(` ${w}`)) score += 1;
      if (score > 0 && (!best || score > best.score)) best = { itemId: item.id, score };
    }
    return best && best.score >= 2 ? best : null;
  }

  respond(question: string, c: CaseDefinition, state: SimState): PatientReply {
    const nq = normalize(question);
    if (ORDER_VERBS.some((v) => nq.startsWith(v.trim()))) {
      // conversa não altera o estado clínico: vira rascunho para confirmação na interface
      return { kind: "ordem_rascunho", text: "Isso parece uma ordem para a equipe. Confirme a conduta pelas abas Tratamento ou Procedimentos.", draftOrder: { raw: question } };
    }
    if (state.communication === "incapaz") return { kind: "incapaz", text: "(O paciente não consegue responder.)" };
    const m = this.matchQuestion(question, c);
    if (!m) {
      return { kind: "nao_entendeu", text: state.communication === "limitada" ? "Hã?… não entendi…" : "Desculpa, não entendi. Pode perguntar de outro jeito?" };
    }
    const item = c.history.find((h) => h.id === m.itemId)!;
    const a = item.answers.find((x) => x.source === "paciente" && (!x.when || evaluate(x.when, state)));
    if (!a) return { kind: "resposta", itemId: item.id, text: "Não sei dizer…", source: "paciente" };
    return { kind: "resposta", itemId: item.id, text: a.text, source: "paciente" };
  }
}

export type TutorMode = "guiado" | "livre" | "prova" | "oral";

export class StructuredTutorAdapter {
  hint(c: CaseDefinition, state: SimState, mode: TutorMode, requestedLevel: number): { level: number; text: string; allowed: boolean } {
    const maxLevel = mode === "guiado" ? 4 : mode === "livre" ? 3 : 0;
    if (maxLevel === 0) return { level: 0, text: "Modo prova: sem dicas durante o atendimento. O debriefing completo vem ao final. Pergunta orientadora: o que ameaça a vida deste paciente agora?", allowed: false };
    const level = Math.min(maxLevel, Math.max(1, requestedLevel));
    const hints = c.teaching.hints.filter((h) => h.level === level && (!h.when || evaluate(h.when, state)));
    if (hints.length === 0) {
      const generic = [
        "",
        "Retome o ABCDE: via aérea, respiração, circulação, neurológico e exposição.",
        "Quais dados você ainda não coletou que mudariam sua conduta agora?",
        "Qual mecanismo explica os achados? Que intervenção atua nesse mecanismo?",
        "Revise as prioridades do caso no painel de objetivos."
      ];
      return { level, text: generic[level] ?? generic[1]!, allowed: true };
    }
    return { level, text: hints[0]!.text, allowed: true };
  }
}

/** Gateway generativo opcional. Sem URL configurada, fica desativado. Nunca envia diagnóstico oculto. */
export class GenerativeGatewayAdapter {
  constructor(private baseUrl: string, private timeoutMs = 12000) {}

  get enabled(): boolean {
    return /^https:\/\/[a-z0-9.-]+(:\d+)?(\/[\w\-./]*)?$/i.test(this.baseUrl);
  }

  async patient(question: string, publicFacts: { topic: string; text: string }[], communication: string): Promise<{ text: string } | { error: string }> {
    if (!this.enabled) return { error: "Gateway de IA não configurado." };
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), this.timeoutMs);
    try {
      const body = JSON.stringify({ role: "patient", question: question.slice(0, 500), facts: publicFacts.slice(0, 40), communication });
      if (body.length > 20000) return { error: "Contexto excede o limite." };
      const r = await fetch(`${this.baseUrl.replace(/\/$/, "")}/v1/patient`, { method: "POST", headers: { "content-type": "application/json" }, body, signal: ctrl.signal });
      if (!r.ok) return { error: `Gateway respondeu ${r.status}.` };
      const j = (await r.json()) as { text?: unknown };
      if (typeof j.text !== "string") return { error: "Resposta inválida do gateway." };
      return { text: j.text.slice(0, 600) };
    } catch (e) {
      return { error: e instanceof Error && e.name === "AbortError" ? "Tempo esgotado." : "Falha de rede." };
    } finally {
      clearTimeout(t);
    }
  }
}

/** Avaliação da prova oral por rubrica estruturada (conceitos + sinônimos). Não depende de LLM. */
export function scoreOralAnswer(answer: string, rubric: CaseDefinition["teaching"]["oralRubric"]): { score: number; max: number; found: string[]; missing: string[] } {
  const a = ` ${normalize(answer)} `;
  let score = 0;
  let max = 0;
  const found: string[] = [];
  const missing: string[] = [];
  for (const r of rubric) {
    max += r.weight;
    if (r.synonyms.some((s) => a.includes(` ${normalize(s)}`))) {
      score += r.weight;
      found.push(r.concept);
    } else missing.push(r.concept);
  }
  return { score, max, found, missing };
}

/** Síntese de voz opcional do navegador/WebView; sem suporte, nada acontece (texto continua). */
export function speak(text: string, volume: number): void {
  try {
    if (!("speechSynthesis" in window) || volume <= 0) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-BR";
    u.volume = Math.max(0, Math.min(1, volume));
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    /* sem voz disponível */
  }
}
