import { describe, expect, it } from "vitest";
import { expandAlias, getBootOutput, modeHint, normalizeShellMode, toTildePath } from "./core";
import { defaultAliases } from "./suggestions";

describe("VictoireOS core shell helpers", () => {
  it("provides boot output", () => {
    expect(getBootOutput()).toContain("Espace prêt: projets, CV, contact, stack");
  });

  it("normalizes shell modes and hints", () => {
    expect(normalizeShellMode("pwsh")).toBe("powershell");
    expect(normalizeShellMode("js")).toBe("node");
    expect(modeHint("sql")).toContain("SELECT * FROM projects");
  });

  it("expands aliases and formats home paths", () => {
    expect(expandAlias("py scripts/portfolio_audit.py", defaultAliases)).toBe("python scripts/portfolio_audit.py");
    expect(expandAlias("unknown command", defaultAliases)).toBe("unknown command");
    expect(toTildePath("/home/victoire/projects")).toBe("~/projects");
  });
});
