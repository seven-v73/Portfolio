import { describe, expect, it } from "vitest";
import {
  resolveNodeCommand,
  resolvePowerShellCommand,
  resolvePythonCommand,
  resolveSqlCommand,
} from "./interpreters";

const content = {
  heroEyebrow: "Développeur Fullstack",
  heroTitle: "Portfolio test",
  heroLead: "Je construis des applications utiles.",
  profileCaption: "Web, mobile, API",
  aboutParagraphs: ["Une phrase de profil."],
  metrics: [["Projets", "4"]],
  identityPillars: [{ title: "Clarte", text: "Interfaces lisibles." }],
  labs: ["Prototype mobile"],
  professionalTimeline: [{ period: "2026", title: "Développeur" }],
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

describe("VictoireOS interpreters", () => {
  it("resolves Python commands", () => {
    expect(resolvePythonCommand("profile()", content).output).toContain('  "projects": 1');
    expect(resolvePythonCommand("2 + 3 * 4", content).output).toEqual(["14"]);
  });

  it("resolves PowerShell navigation", () => {
    expect(resolvePowerShellCommand("Get-Location", content, "/home/victoire").output).toEqual(["/home/victoire"]);
    expect(resolvePowerShellCommand("Set-Location projects", content, "/home/victoire").nextDirectory).toBe("/home/victoire/projects");
    expect(resolvePowerShellCommand("Get-Content about.md", content, "/home/victoire").output[0]).toBe("# Victoire SAWADOGO");
  });

  it("resolves Node commands", () => {
    expect(resolveNodeCommand("console.log('hello')", content).output).toEqual(["hello"]);
    expect(resolveNodeCommand("projects()", content).output[0]).toContain("ElegantStyle");
  });

  it("resolves SQL commands", () => {
    expect(resolveSqlCommand("SELECT * FROM projects;", content).output).toContain("1 | ElegantStyle | Stylisme");
    expect(resolveSqlCommand("SELECT * FROM me", content).output).toContain("Victoire SAWADOGO | Développeur Fullstack");
  });
});
