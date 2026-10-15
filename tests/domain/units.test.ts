import { describe, expect, it } from "vitest";
import {
  convert,
  finalConcentration,
  formatNumberBR,
  infusionRateMlH,
  parseDecimalBR,
  ratio,
  resolveTotalDose,
  UnitError,
  volumeForMass
} from "../../src/domain/units";

// Valores SINTÉTICOS para testar aritmética. Não são recomendações clínicas.
describe("unidades e análise dimensional", () => {
  it("converte mg ↔ microgramas e mL ↔ L explicitamente", () => {
    expect(convert({ value: 1, unit: "mg" }, "mcg")).toEqual({ value: 1000, unit: "mcg" });
    expect(convert({ value: 250, unit: "mcg" }, "mg")).toEqual({ value: 0.25, unit: "mg" });
    expect(convert({ value: 1.5, unit: "L" }, "mL")).toEqual({ value: 1500, unit: "mL" });
    expect(convert({ value: 2, unit: "g" }, "mg")).toEqual({ value: 2000, unit: "mg" });
  });

  it("rejeita conversões entre dimensões incompatíveis", () => {
    expect(() => convert({ value: 1, unit: "mg" }, "mL")).toThrow(UnitError);
    expect(() => convert({ value: 1, unit: "mEq" }, "mmol")).toThrow(/valência/);
    expect(() => convert({ value: 1, unit: "mg/kg" }, "mg")).toThrow(UnitError);
  });

  it("detecta erros de fator 10 e 1000", () => {
    expect(ratio({ value: 1, unit: "mg" }, { value: 100, unit: "mcg" })).toBe(10);
    expect(ratio({ value: 1, unit: "mg" }, { value: 1, unit: "mcg" })).toBe(1000);
    expect(ratio({ value: 0.1, unit: "mg" }, { value: 1, unit: "mg" })).toBeCloseTo(0.1);
  });

  it("aceita vírgula e ponto como decimal, rejeita separador de milhar e lixo", () => {
    expect(parseDecimalBR("0,5")).toBe(0.5);
    expect(parseDecimalBR("0.5")).toBe(0.5);
    expect(parseDecimalBR(" 12 ")).toBe(12);
    expect(() => parseDecimalBR("1.000,5")).toThrow(UnitError);
    expect(() => parseDecimalBR("1,000.5")).toThrow(UnitError);
    expect(() => parseDecimalBR("abc")).toThrow(UnitError);
    expect(() => parseDecimalBR("")).toThrow(UnitError);
    expect(() => parseDecimalBR("1e3")).toThrow(UnitError);
    expect(() => parseDecimalBR("Infinity")).toThrow(UnitError);
    expect(() => parseDecimalBR("NaN")).toThrow(UnitError);
  });

  it("rejeita negativos e zero por padrão", () => {
    expect(() => parseDecimalBR("-1")).toThrow(/negativo/);
    expect(() => parseDecimalBR("0")).toThrow(/zero/);
    expect(parseDecimalBR("-1", { allowNegative: true })).toBe(-1);
  });

  it("dose por peso exige peso válido", () => {
    expect(resolveTotalDose({ dose: { value: 0.01, unit: "mg/kg" }, weightKg: 20 })).toEqual({ value: 0.2, unit: "mg" });
    expect(resolveTotalDose({ dose: { value: 20, unit: "mL/kg" }, weightKg: 12.5 })).toEqual({ value: 250, unit: "mL" });
    expect(() => resolveTotalDose({ dose: { value: 1, unit: "mg/kg" } })).toThrow(/peso/);
    expect(() => resolveTotalDose({ dose: { value: 1, unit: "mg/kg" }, weightKg: 0 })).toThrow(UnitError);
    expect(() => resolveTotalDose({ dose: { value: 1, unit: "mg/kg" }, weightKg: Number.NaN })).toThrow(UnitError);
  });

  it("dose absoluta não é multiplicada pelo peso", () => {
    expect(resolveTotalDose({ dose: { value: 5, unit: "mg" }, weightKg: 70 })).toEqual({ value: 5, unit: "mg" });
  });

  it("rejeita dose zero, negativa, infinita e NaN", () => {
    expect(() => resolveTotalDose({ dose: { value: 0, unit: "mg" } })).toThrow(/zero/);
    expect(() => resolveTotalDose({ dose: { value: -2, unit: "mg" } })).toThrow(/negativa/);
    expect(() => resolveTotalDose({ dose: { value: Infinity, unit: "mg" } })).toThrow(UnitError);
    expect(() => resolveTotalDose({ dose: { value: Number.NaN, unit: "mg" } })).toThrow(UnitError);
  });

  it("calcula volume a aspirar e rejeita concentração zero", () => {
    expect(volumeForMass({ value: 2, unit: "mg" }, { value: 4, unit: "mg/mL" })).toEqual({ value: 0.5, unit: "mL" });
    expect(volumeForMass({ value: 500, unit: "mcg" }, { value: 1, unit: "mg/mL" })).toEqual({ value: 0.5, unit: "mL" });
    expect(() => volumeForMass({ value: 2, unit: "mg" }, { value: 0, unit: "mg/mL" })).toThrow(UnitError);
  });

  it("converte taxa por peso em mL/h sem confundir mg e microgramas", () => {
    // 0,1 mcg/kg/min × 50 kg = 5 mcg/min = 300 mcg/h; a 50 mcg/mL => 6 mL/h
    expect(infusionRateMlH({ rate: { value: 0.1, unit: "mcg/kg/min" }, concentration: { value: 50, unit: "mcg/mL" }, weightKg: 50 })).toEqual({ value: 6, unit: "mL/h" });
    // mesma taxa com concentração expressa em mg/mL
    expect(infusionRateMlH({ rate: { value: 0.1, unit: "mcg/kg/min" }, concentration: { value: 0.05, unit: "mg/mL" }, weightKg: 50 })).toEqual({ value: 6, unit: "mL/h" });
    expect(() => infusionRateMlH({ rate: { value: 0.1, unit: "mcg/kg/min" }, concentration: { value: 50, unit: "mcg/mL" } })).toThrow(/peso/);
    expect(infusionRateMlH({ rate: { value: 2, unit: "mg/h" }, concentration: { value: 1, unit: "mg/mL" } })).toEqual({ value: 2, unit: "mL/h" });
  });

  it("concentração final de diluição", () => {
    expect(finalConcentration({ value: 4, unit: "mg" }, { value: 250, unit: "mL" })).toEqual({ value: 0.016, unit: "mg/mL" });
    expect(() => finalConcentration({ value: 4, unit: "mg" }, { value: 0, unit: "mL" })).toThrow(UnitError);
  });

  it("formatação pt-BR é apenas apresentação", () => {
    expect(formatNumberBR(1234.5)).toBe("1.234,5");
    expect(formatNumberBR(Number.NaN)).toBe("—");
  });
});
