import { describe, expect, it } from "vitest";
import { StructuredLocalPatientAdapter, scoreOralAnswer } from "../../src/ai";
import { CaseDefinitionSchema } from "../../src/domain/schema";
import { C004 } from "../../src/content/cases/C004";

const c = CaseDefinitionSchema.parse(C004);
const a = new StructuredLocalPatientAdapter();

describe("interpretação local de perguntas (não generativa)", () => {
  it.each([
    ["A senhora tem alergia a algum remédio?", "h-alergias"],
    ["Usa algum remédio em casa?", "h-medicacoes"],
    ["Quando começou?", "h-inicio"],
    ["O que a senhora está sentindo?", "h-queixa"],
    ["Pode estar grávida?", "h-gestacao"],
    ["Fuma ou bebe?", "h-habitos"]
  ])("%s → %s", (q, id) => {
    expect(a.matchQuestion(q, c)?.itemId).toBe(id);
  });
  it("pergunta sem correspondência não inventa resposta", () => {
    expect(a.matchQuestion("Qual seu time de futebol?", c)).toBeNull();
  });
  it("frase de ordem vira rascunho, não comando", () => {
    expect(a.respond("Faça adrenalina agora", c, { communication: "normal" } as never).kind).toBe("ordem_rascunho");
  });
  it("rubrica oral reconhece conceitos por sinônimos", () => {
    const r = scoreOralAnswer("Reconheci anafilaxia e fiz adrenalina intramuscular, depois volume e observação", c.teaching.oralRubric);
    expect(r.found.length).toBeGreaterThanOrEqual(4);
  });
});
