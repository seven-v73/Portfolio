import { describe, expect, it } from "vitest";
import { defaultMemory } from "./memory";
import {
  explainStackChoice,
  explainTarget,
  getAutopilotPulse,
  getCoachAdvice,
  getPersonaMessage,
  getSmartTimeline,
  getSystemDashboard,
  getVisitorProfile,
} from "./insights";

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

describe("VictoireOS insights", () => {
  it("builds visitor profiles and persona messages", () => {
    expect(getVisitorProfile("developer", content)).toContain("Mission active: tech-lead");
    expect(getPersonaMessage("mentor")).toContain("Suggestion: learn git");
  });

  it("builds timeline, dashboard and autopilot pulse", () => {
    const memory = { ...defaultMemory, mission: "recruiter" as const, missionStep: 1, commands: ["whoami"] };
    expect(getSmartTimeline(memory, content, "/home/victoire", "bash")).toContain("mission..... recruiter step 1/5");
    expect(getSystemDashboard(content, memory, "/home/victoire", 3)).toContain("projects.... 1 indexed");
    expect(getAutopilotPulse(content, memory, "/home/victoire", 2)).toContain("Projet à regarder: ElegantStyle - Stylisme");
  });

  it("explains projects, stack choices and coaching", () => {
    expect(explainTarget("project elegantstyle", content)).toContain("Projet: ElegantStyle");
    expect(explainStackChoice("react", content)[0]).toContain("React");
    expect(getCoachAdvice("cat about.md", ["# About"], defaultMemory, content)[1]).toContain("Bon reflexe");
  });
});
