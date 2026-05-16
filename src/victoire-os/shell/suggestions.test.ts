import { describe, expect, it } from "vitest";
import {
  completeCommand,
  defaultAliases,
  getCommandSuggestions,
  getPaletteItems,
  getRuntimeCommandSuggestions,
  toRelativeVirtualPath,
} from "./suggestions";

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

describe("VictoireOS suggestions", () => {
  it("returns useful defaults for an empty prompt", () => {
    expect(getCommandSuggestions("", "/home/victoire", content, defaultAliases)).toContain("dashboard");
  });

  it("suggests runtime commands and executable files", () => {
    expect(getRuntimeCommandSuggestions("python scr", "/home/victoire", content)).toContain("python scripts/portfolio_audit.py");
  });

  it("suggests virtual files from cwd", () => {
    expect(getCommandSuggestions("cat R", "/home/victoire", content, defaultAliases)).toContain("cat README.md");
  });

  it("filters palette items by query", () => {
    expect(getPaletteItems("docker", "/home/victoire", content, defaultAliases)).toContain("docker compose ps");
  });

  it("completes commands and relative paths", () => {
    expect(completeCommand("dock", "/home/victoire", content, defaultAliases)).toBe("docker ps");
    expect(toRelativeVirtualPath("/home/victoire/projects/elegantstyle.md", "/home/victoire")).toBe("projects/elegantstyle.md");
  });
});
