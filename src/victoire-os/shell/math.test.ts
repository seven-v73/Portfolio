import { describe, expect, it } from "vitest";
import { evaluateSimpleMath } from "./math";

describe("evaluateSimpleMath", () => {
  it("respects operator precedence", () => {
    expect(evaluateSimpleMath("2 + 3 * 4")).toBe(14);
  });

  it("supports parentheses and decimals", () => {
    expect(evaluateSimpleMath("(2.5 + 1.5) * 3")).toBe(12);
  });

  it("rejects non mathematical input", () => {
    expect(evaluateSimpleMath("process.exit()")).toBe("NaN");
  });

  it("does not return infinite values", () => {
    expect(evaluateSimpleMath("10 / 0")).toBe("NaN");
  });
});
