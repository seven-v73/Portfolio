import { describe, expect, it } from "vitest";
import {
  getCoverageReport,
  getHealthCheck,
  getSkillMatrix,
  getSystemJournal,
  runShellControl,
  runSystemctl,
  runVirtualPackageManager,
  runVirtualTests,
} from "./system";

const content = {
  heroTitle: "Portfolio test",
  heroLead: "Je construis des applications utiles.",
  profileCaption: "Web, mobile, API",
  aboutParagraphs: ["Une phrase de profil."],
  metrics: [["Projets", "4"]],
  identityPillars: [{ title: "Clarte", text: "Interfaces lisibles." }],
  contactLinks: {
    email: "victoire@example.com",
    github: "https://github.com/victoire",
    linkedin: "https://linkedin.com/in/victoire",
    whatsapp: "https://wa.me/000",
  },
  projects: [
    {
      name: "ElegantStyle",
      type: "Mobile",
      focus: "Stylisme",
      description: "Application de style.",
      tags: ["Flutter", "Mode"],
    },
  ],
  stacks: [
    {
      title: "Frontend",
      items: [{ name: "React" }, { name: "TypeScript" }],
    },
  ],
};

describe("VictoireOS system helpers", () => {
  it("simulates package management", () => {
    expect(runVirtualPackageManager("list")).toContain("installed human-ux");
    expect(runVirtualPackageManager("install observability")[0]).toContain("resolving observability");
  });

  it("describes shell architecture and virtual tests", () => {
    expect(runShellControl("inspect", content)).toContain("Atelier shell architecture");
    expect(runShellControl("fs", content)[0]).toBe("Typed virtual filesystem");
    expect(runVirtualTests("ui", content)).toContain("✓ 1 projects visible to command layer");
  });

  it("reports coverage, services and journal", () => {
    expect(getCoverageReport(content).join("\n")).toContain("1 projects / 1 stack groups");
    expect(runSystemctl("status victoire")[0]).toContain("victoire.service");
    expect(getSystemJournal("-n 2")).toHaveLength(2);
  });

  it("reports health and skills", () => {
    expect(getHealthCheck(content)).toContain("contact.email: ok");
    expect(getSkillMatrix(content)[1]).toContain("Frontend");
  });
});
